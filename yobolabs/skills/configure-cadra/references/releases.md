# Agent releases: cut, diff, promote (dev and prod)

An agent with `deployed_version_id` set runs from that **release**, not from the live rows. A release
pins every harness, skill, role lock and tool version, plus a snapshot of the agent fields (persona /
system instruction, brain, channel profile id…). Editing a piece changes its HEAD only.

## What is in a release and what is not

| Change | In the release? | Takes effect |
|---|---|---|
| Harness text (`harnesses.update`) | pin (`agent_version_pins.kind='harness'`) | after a cut + promote |
| Skill template / reference | pin (`kind='skill'`) | after a cut + promote |
| Role content | role lock pin | after promote of the role AND an agent cut |
| Tool row | pin (`kind='tool'`) | after a cut + promote |
| Root system instruction | snapshot field `persona` | after a cut + promote |
| `agents.state_mode` (p150 State) | **not** in the snapshot | at once (agent config cache 60 s / 300 s). A release rollback does **not** undo it — keep its own undo |

## The safe cut (one change per release)

1. Re-read the live release (`agents.deployed_version_id`) right before the cut; other lanes cut the
   same agent. Take the STATE.md DEPLOY-LOCK for prod.
2. `agents.getUpdatesAvailable({agentUuid, releaseId: live})` lists every piece whose HEAD moved.
3. `agents.cutRelease({agentUuid, base: 'working_copy', pinOverrides: hold, deploy: false, note})`, where
   `hold` = every pending item **except** the one you change, each at its `pinnedVersionId`.
4. `agents.getReleaseDiff({fromId: live, toId: new})` must show exactly your pin (or, for a root edit,
   exactly one `persona` field and 0 pins). Anything else → do not promote.
5. `agents.moveDeployedVersion({toVersionId: new, expectedFromId: live, action: 'promote'})`.
   Rollback = the same call with `action: 'rollback'` back to the old id (no review id needed).
6. Proof: one real channel turn; read the run's log line `harness <uuid> vN` and
   `agent_executions.agent_version_id`. A run on the old release proves nothing.

## Traps

- `cutRelease` returns no usable `id` from the tRPC bridge — read `max(agent_versions.id)` for the
  agent after the cut, then diff by that id.
- A long or quote-heavy release note passed through shell quoting can silently fail the cut; pass it
  through the environment and check that a new version row exists before promoting.
- Two edits on dev may land in one release if you take both pins — fine on dev, but prod takes them as
  separate releases (one review id each).
- `harnesses.update` needs a signed-in system user (browser tab) — check `location.href` is the
  intended origin before every write; a tab left on prod will receive a "dev" write.
- A spawned role inherits the parent's harness text (its log line reads `… (inherited)`), but gets no
  State and no `state_update` tool — guard State instructions with "If you have state_update: …".
