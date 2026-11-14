# Prod agent releases and proof turns

Mechanics for changing a **prod** agent that serves a pinned release, and for proving a change on dev.
The review-gate id rule is in SKILL.md; this file is the how.

## Pinned releases: REST edits do not go live

A prod agent can serve a **pinned release** instead of its working copy. Then a REST edit (prompt, role, tool
link) changes the working copy only; nothing live moves until a release is cut and the pointer is moved.

1. **Cut**: `POST /agents/<agent-uuid>/releases` with
   `{ "base": "working_copy", "expectedFromId": <live release id>, "deploy": false, "pinOverrides": {...} }`.
   The response `release.id` is the new release. `deploy:false` cuts without moving the pointer.
2. **Diff** before moving: `GET /agents/<agent-uuid>/releases/<a>/diff/<b>`.
3. **Move**: `POST /agents/<agent-uuid>/deploy-pointer` with
   `{ "toVersionId": <release id>, "expectedFromId": <live release id>, "action": "promote" | "rollback" }`.
4. **Foreign drafts**: the working copy may carry someone else's unreleased edits. Hold them out of your cut with
   `pinOverrides`; read the **last DEPLOY-LOCK row** for the held pins and its NEXT CUT FROM base, and write the
   new row when you finish.
5. A rollback is the same pointer call with `action:"rollback"` and needs no gate id.

Agent REST routes take the **uuid**. The numeric id that `list` prints returns `422 "Invalid uuid"`.

- `pinOverrides` ids are row ids. Kind `skill` takes the `skill_versions` row id, not the skill's version number. Kind `role_lock` takes the lock id. After a `skills.update`, read the new row id (the max id for that skill) before the cut. A version number gives a 500 on the pin insert.
- **The channel profile is not release-pinned.** `agents.saveChannelProfile` is live on save and returns a number from the agent version counter, not the release id. Move the deploy pointer to the cut RELEASE id, never to the profile's `versionId`.
- **Channel notices are read live from the agent row.** They live in `agents.channel_profile.messages['<key>']` as `{lang: text}` per message key (for example `chat.early_ack`, `chat.slow_turn`). A save takes effect before any release. Prove a notice with `POST /internal/v1/agents/<id>/channel-notices`.

## Gate id traps (agent-gate-guard)

- One id = one change. It is **spent only by the deploy/promote write**, not by earlier edits.
- **Spent id: ask the lead for a new id.** Never use `AGENT_GATE_OVERRIDE`; the architect logs an override as a
  deviation.
- The guard treats any `GET` whose path contains `/releases` as a config write: it needs the gate tag in the
  command but does not spend the id.
- **An AI-function golden publish is a prod agent change.** `prompt.setGoldenVersion` / `prompts.createVersion` need their own gate id. The tRPC router key is `prompt.*` (`prompt.update` mints a version, then `prompt.setGoldenVersion`); undo = `setGoldenVersion` back to the old version.
- **Put `AGENT_GATE=<id>` on the command line of every prod write**, including `cd <packet>; python3 run.py js/<step>.js` and `P=<dir>; cd $P && ...` shapes. The hook resolves both and spends the id on the step that puts the change live. Never `export` it. A relative script path resolves from the session's shell directory.
- **Build prod js and DEPLOY-LOCK files with the Write tool, not a Bash heredoc or `python -c`.** The hook scans the command text: a command that only BUILDS a file holding the prod host and a write verb reads as the write (and, with `AGENT_GATE` on it, spends the id). Write the template with Write, fill it from a script that holds no prod host or write verb, then run ONE write per command with its id.
- **The hook reads the LOCAL gate-log** (the monorepo's local `_context/.../gate-log.md`), not the context repo's `main`. The shared checkout runs far behind origin, so a row pushed only to `main` is invisible and the write is denied "not in gate-log as APPROVED prod". Write every gate row to BOTH the local file (append) and context `main` (from a fresh clone). Wording changed after approval: ask the lead for an amendment row in the local copy before applying.
- A change that alters every reply (for example a style rule) is its own release, not a rider on another.
- The guard reads the gate-log **verdict column**: it must say `APPROVED prod`. "Approved in a message" or
  "APPROVED dev; prod same id after…" blocks the write — ask the architect to set the row.
- **Agent-field writes (e.g. `state_mode`) and AI-function rows have no deploy step**, so the guard never spends
  their id; the architect records the spend in `gate-used.txt` by hand.
- A command that names the guard's own script path trips the guard (it reads the file and sees write patterns).

## Prod cut: from the sealed live release only

- **Never cut prod from `base: "working_copy"`.** A prod working copy can drift far from its releases. A working-copy cut ships that drift and also sweeps newer tool versions into the release.
- Cut from the live release: `base: {fromVersionId: <live>}` with `expectedFromId: <live>`. Hold every other pin at its live version with `pinOverrides`.
- Change the prompt with `snapshotPatch: {persona: {systemInstruction}}`. It is allowed only with a `fromVersionId` base. Every base pin is kept, and the working copy is never read or written.
- Add a tool with `snapshotPatch: {coreRole: {addTools: [{toolId, versionId}]}}` (CAD-604). It becomes a native pin at `versionId`. Skills cannot be added this way. Error codes and the expected diff: `cadra:agents` `references/agent-releases.md` § Adding a tool to a released agent.
- **Diff before moving the pointer.** Compare the new release with the live one (`getReleaseDiff`). The diff must hold exactly the intended change: pins compared on kind, subject and version (not ids), and the snapshot minus the pins. Refuse the cut otherwise.
- The release note records the snapshot patch and the pin overrides. That line is the audit trail.

## Building on the live head (prod)

- **Prod agents carry unreleased foreign heads** (another lane's draft on a skill/tool). Before writing a row,
  compare head vs the pinned version: if they differ, build your change on the **pinned** content, never on top
  of the draft, report the head diff, and tell the draft's owner it must re-apply on your new version.
- A cut that takes current heads ships every foreign draft blind: hold all other pins at the live release and
  list them in the report.
- **A tool row before its endpoint is live = a broken tool**; **an AI-function row ahead of the code that feeds
  its new inputs = a worse reviewer**. Verify the code on prod by code read (not tag) first, or roll the row back
  until the code cut and re-promote in the same window.
- **`RELEASE_MOVED: deployed release moved (x != y)`** on a cut = another lane deployed after you read the live id
  (sometimes with no DEPLOY-LOCK row). Read `GET …/releases/<old>/diff/<new>`, then cut again **from the current live
  release** with only your override; never roll their release back. Report it to the agents lead.
- **A tool PUT does not return the new tool version id.** Read it with a probe cut from the working copy (no `base`,
  `deploy:false`): the response pins show the tool's head `versionId`. Then cut
  `{ "base": { "fromVersionId": <live> }, "pinOverrides": [{ "kind": "tool", "subjectId": <tool id>, "versionId": <head> }],
  "deploy": true, "expectedFromId": <live> }` and check the diff shows only that pin. Name the never-deployed probe
  release in the lock row.
- **A tool-row PUT never reaches a pinned agent, including tools its spawned roles use.** The PUT mints a new
  `tool_versions` row; the deployed release keeps its pins (rows with `source='spawn'` and a `viaRoleLockId` for
  role tools). Proofs after a PUT alone run the OLD tool bytes (waiting out the config cache does not help). One
  `pinOverrides` entry for the tool moves every pin of it in the release. A read-only DB alternative to the probe
  cut for the head id: `SELECT max(id) FROM tool_versions WHERE tool_id=<id>`.
- **Before changing a shared tool, list who reaches it two ways**: agents whose deployed release pins it
  (`agent_version_pins` joined on `agents.deployed_version_id`, `kind='tool'`, `tool_version_id IN (tool_versions of
  the tool)`) AND `agent_tools` links (an agent with no release reads the row live). Each pinned agent needs its own
  release; a linked unreleased agent changes on the PUT.
- **Role promote alone does not reach spawned roles**: the agent version pins the role lock. A role change needs
  role promote + agent publish + deploy.
- **Before promoting a role whose reply is relayed to the merchant, check the target env's runtime has the relay code.**
  Otherwise the merchant gets the reply twice: the relay and the root each write one. Grep the runtime's role-reply relay
  (`src/services/agent-runtime/role-reply-relay.ts`) for `resultRelaysRoleReply` on the deployed branch. Check the tree,
  never commit ancestry: a commit can sit in history while its code is absent from the tree.
- `promoteGolden` NOT_FOUND on a role is usually a **stale browser org context**, not an ownerless role: switch org
  (`userOrg.switchOrg(<org>)`) and use a fresh session before any data fix.

## AI-function evals and input media

- **Input images are capped per variable, per function and per run.** The caps are config keys in the cadra-web AI-function
  config: `MAX_IMAGE_VARIABLES_VISION` (vision text/json functions), `MAX_IMAGE_VARIABLES` (image output), `MAX_INPUT_IMAGES_PER_RUN`
  (all image variables of one run, list items included) and `MAX_INPUT_IMAGE_BYTES`. A run over the per-run cap fails with
  `PARAM_INVALID`. Read the config before trusting a count in a code comment; those comments can be stale.
- **Re-running past inputs:** a stored video variable is a presigned URL that expires. Strip the query string before the re-run
  and make sure the object is still readable.
- **Measure a stochastic AI-function failure before any version flip:** run each candidate version at least 3 times and the live
  version as a baseline the same number of times. Compare scene count, timing and the voiced / non-voiced pattern against the
  baseline execution, not only "succeeded". A single miss in three runs can be the new version's regression.

## Proof turns

- **Viewing Cadra images needs no API key.** The session tRPC `attachments.getDownloadUrl` is a POST mutation (a GET returns 405).
  Do not mint an API key to read attachments.
- **`aiFunctions.testRun` through a browser eval often answers "Timed out waiting for JavaScript result" while the run still executes.** Never retry the POST (a retry is a second metered run). Poll `prompt_executions` by the idempotency key, which must be a uuid (a string key returns 400). Parallel posts work.
- **A prod working-copy cut can carry persona head drift** (the diff guard refuses it). Fix: read the live release's persona instruction from `getReleaseDiff(live, spare).before`, set the head instruction to it, cut, restore the head instruction, and move the pointer only if the diff matches.
- **Monitor loops on `psql` default output:** "(0 rows)" contains a digit. Select `coalesce(string_agg(...), 'NONE')` instead.

- **Config cache is about 5 minutes.** Run proof turns only after it; a turn 40 s after a pointer move proves
  nothing (it ran the old release).
- **Dev REST edits may not reach runtime until an app Deploy.** Check the **prompt length** in the LLM request
  per run before trusting a proof; if it did not change across edits, the runtime is not seeing them.
- **Role edits change nothing until Publish** in the app, and agents may still pin an older role lock.
- **Direct `/agents/<id>/execute` proofs lack org context**: tools that need an org (yobo tools with a global key)
  return 400 ("requires X-Execution-Context or X-Org-Id"). Prove through the real channel (for a WhatsApp agent,
  inject through the WhatsApp gateway), at least 3 runs, and record the execution ids for the review request.
- **Waiting on a REST `/agents/<uuid>/execute` run: poll `GET /executions/<executionUuid>`** (`cadra execution
  get`) until the status leaves `running`. The `streamUrl` it returns serves the app's HTML shell to an API key,
  not events. Read the tool result from `agent_execution_logs` (`outputLength`, `resultRef`) for the proof.
- **Proofs run on a TEST contact** (fictional sender, test org), never a real person's chat or the owner's own
  dev conversation, and each lane on its own test conversation (shared test chats collide).
- **Dev twin write route** when the dev org's API-key quota is full: session tRPC `tools.update` +
  `agents.cutRelease` from a signed-in dev app tab (check `location.href` first).
- Plain-chat and advice turns are part of the proof: a formatting change that fixes a draft can break ordinary
  replies, and a release that fails them is rolled back, not patched forward.

- Yobo web-chat proof turn in a test org: in a signed-in app tab, switch to the test org through the user-org switch call, then refresh the session with the next-auth update call (csrf from the csrf endpoint). Reload the chat, open a new side chat (never the main chat), set the textarea with the native value setter and an input event, and click the send button by its aria label. Read the root and role executions by agent id and time, not by the newest row. Switch the session back to the operator's home org in the same step.

## Also true on dev, and other release traps (m-yobo-offerguard-1, 2026-11-05)

- **Dev agents are release-pinned too.** A harness/skill/root edit on the dev twin changes HEAD only; three dev
  "proofs" ran on the old harness until a dev release was cut. Check the proof run's `harness <uuid> vN` log line.
- **`agents.state_mode` is not in the release snapshot**: it is live at once (agent config cache), and a release
  rollback does not undo it — keep its own undo.
- **Root system instruction** is a snapshot field: the diff shows one `persona` field and 0 pins.
- **Via the cadra-web tRPC bridge** (`callTrpcProcedure`), `cutRelease` returns no usable id: read
  `max(agent_versions.id)` after the cut, then diff by that id. Pass long release notes through the environment;
  a quoting failure cuts nothing.
- **Harness text edits** need a signed-in system user (browser tab): check `location.href` before every write — a
  tab left on prod receives a "dev" write.
- **Spawned roles inherit the parent's harness text** (log line `… (inherited)`) but get no State and no
  `state_update` tool: guard State instructions with "If you have state_update: …".

## Tool pins and billing class before a release

- Check that the tool is pinned on the agent at all. A tool can be pinned on neither prod nor dev.
- When pinning a dev twin, compare `billing_class` with prod. Dev 199 (generative) against prod 128 (read) made entitlement refuse the call.
- A prod cut from the live release can change existing pins only. Adding a pin to a prod agent needs CAD-590.

## Read the live id, not the release note (2026-11-06)

A release note can say "no deployment" while `agents.deployed_version_id` points at that very release (dev 443, rel 2255).
Before any diff, parity check or cut, re-read `deployed_version_id` on both sides. Shared admin users write many sessions' releases,
so `created_by` does not tell you which session made a release: only the note does. Always write a note.

## Gate, cut and promote traps

- A tool write and its release cut take two gate ids. `tools.update` returns the tool row, not a version id, and there is no list-versions call. Use one gate id for the head write, read the new version id from the tool versions table, then use a second gate id for the cut.
- A gate id is spent by the script that uses it, even when the write rolled back. A retry needs a new gate id.
- Wording changed after a gate was approved needs an amendment row in the gate log first. The gate log is owned by the agents lead; send the close note there.
- A cut from the working copy can carry persona system-instruction head drift, and the diff guard refuses it. Fix: read the live release's persona instruction from the release diff (before side), set the head to it, cut, restore the head, and move only if the diff matches the intent.
- The snapshot patch has no `brain` key (only persona system instruction or core-role add-tools). An agent model change needs a working-copy cut; check the release diff and move only if the diff is the model.
- A role promote freezes the whole head, and it can freeze a skill at its current head instead of the template the previous lock froze. Before any promote, check drift: for each skill, the md5 of the head template must equal the md5 of the frozen prompt content of the lock's prompt version (ignore a trailing newline); for each tool in the lock, the frozen content must contain the head description and agent instructions; for each role, sha256 of the head system instruction must equal the lock's content hash. Restore a drifted head to the frozen template first, and name any remaining drift in the gate.
- Model-only switch: a model change is a role head update plus promote. If the head differs from the pinned lock (drafts), save the head as lock plus new model, promote, and check the diff is the model only; then restore the saved head. Compare old and new lock JSON with model, lock id, version, hash and timestamps removed; they must be equal. Read back the lock and the agent model after every promote.
- Release order across Cadra text and yobo code: by default, the Cadra role or tool text that reads a tool learns both the old and new shapes first, then the yobo tool ships the new shape. Reverse the order when the new Cadra text would break today's prod yobo tool (a new argument on an old tool gives an empty reply).
- Tool and role watch queries: select the output length too (`length(coalesce(e.output,''))`). A child that shows completed with an empty output is not a success.
- Monitor loops on psql output: select `coalesce(string_agg(...), 'NONE')`. The default "(0 rows)" text contains a digit and defeats digit matching.
- A generator that inserts a sentence must assert the inserted text appears exactly once after the edit, not only that the anchor count is right.
- Prod and dev role text differ. Never assume a dev anchor exists in prod: count the anchor in prod first, and get the agents lead to approve the prod placement.

## Proof turns on test orgs

- Before a dev proof turn, map the org to its users' phone numbers. Never drive a proof from an org whose creator is a real merchant or staff phone; use only the reserved test numbers from the test-number list.
- Before a prod proof turn, check the org's state (ready ads, open remix) so the turn hits the path under test. A change request on an org with no ready ads can start a paid ad set.
- Proof for a tool-using agent means the first real run by the product, read back from its run rows, not a test-run call.
