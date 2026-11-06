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

## Gate id traps (agent-gate-guard)

- One id = one change. It is **spent only by the deploy/promote write**, not by earlier edits.
- **Spent id: ask the lead for a new id.** Never use `AGENT_GATE_OVERRIDE`; the architect logs an override as a
  deviation.
- The guard treats any `GET` whose path contains `/releases` as a config write: it needs the gate tag in the
  command but does not spend the id.
- A change that alters every reply (for example a style rule) is its own release, not a rider on another.
- The guard reads the gate-log **verdict column**: it must say `APPROVED prod`. "Approved in a message" or
  "APPROVED dev; prod same id after…" blocks the write — ask the architect to set the row.
- **Agent-field writes (e.g. `state_mode`) and AI-function rows have no deploy step**, so the guard never spends
  their id; the architect records the spend in `gate-used.txt` by hand.
- A command that names the guard's own script path trips the guard (it reads the file and sees write patterns).

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
- `promoteGolden` NOT_FOUND on a role is usually a **stale browser org context**, not an ownerless role: switch org
  (`userOrg.switchOrg(<org>)`) and use a fresh session before any data fix.

## Proof turns

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

## Read the live id, not the release note (2026-11-06)

A release note can say "no deployment" while `agents.deployed_version_id` points at that very release (dev 443, rel 2255).
Before any diff, parity check or cut, re-read `deployed_version_id` on both sides. Shared admin users write many sessions' releases,
so `created_by` does not tell you which session made a release: only the note does. Always write a note.
