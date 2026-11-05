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

## Proof turns

- **Config cache is about 5 minutes.** Run proof turns only after it; a turn 40 s after a pointer move proves
  nothing (it ran the old release).
- **Dev REST edits may not reach runtime until an app Deploy.** Check the **prompt length** in the LLM request
  per run before trusting a proof; if it did not change across edits, the runtime is not seeing them.
- **Role edits change nothing until Publish** in the app, and agents may still pin an older role lock.
- **Direct `/agents/<id>/execute` proofs lack org context**: tools that need an org (yobo tools with a global key)
  return 400 ("requires X-Execution-Context or X-Org-Id"). Prove through the real channel (for a WhatsApp agent,
  inject through the WhatsApp gateway), at least 3 runs, and record the execution ids for the review request.
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
