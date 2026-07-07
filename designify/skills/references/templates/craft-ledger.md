# Craft Ledger — <mission slug>

> The mission's running record: entities, assets, prompts, verdicts, corrections. Handoff-ready at any moment — someone who wasn't in the room can pick up the batch from this file alone. Updated as work happens, never reconstructed after.

## 1. Entity-resolution table
Mirrored from the mission brief at intake; re-resolved rows get a new line, never an edit — the trail is the point.

| Entity | Resolved to | Source | Confirmed |
|---|---|---|---|
| Brand kit | <path/ref> | <source> | ☐ |
| Campaign | <id> | <source> | ☐ |
| Placement: <name> | <exact export spec> | <source> | ☐ |
| Output dir | `_context/<project>/design/<slug>/` | | ☐ |

## 2. M-rule conformance grid
Checked per asset at L2, and re-checked at every re-grounding checkpoint. ✓ = conforms · ✗ = violation (file a finding) · — = rule not applicable to this asset.

| Rule | Asset 1 | Asset 2 | Asset 3 | … |
|---|---|---|---|---|
| M1 | | | | |
| M2 | | | | |

## 3. Assets
One row per asset per render attempt. Claims state their rung — partial evidence is declared partial, never rounded up.

| Asset | Placement | Reuse gate | Actuator | Prompts (pos + neg) | Rung reached | Verdict | Corrections |
|---|---|---|---|---|---|---|---|
| <n> | <placement> | <reused: search cited | rendered new: search cited> | <higgsfield-generate / slides ad-studio / frontend-design / …> | <ref to craft-file §5 asset block + any deltas> | <L0–L4> | <pass at rung | failed: what broke> | <see §6> |

Proof ladder: **L0** renders · **L1** platform-spec compliant (mechanical) · **L2** M-rule + expected-vs-broken pass at actual placement size · **L3** judge panel pass (default DoD) · **L4** live vs benchmark (Looker).

## 4. Batch re-grounding checkpoints
Every <N, default 5> assets. Drift compounds silently — the checkpoint is where it gets caught.

| Checkpoint | After asset | M-rules still held? | Drift vs asset #1? | Action |
|---|---|---|---|---|
| 1 | <n> | <per-rule sweep result> | <palette / type / tone — observable, or "none"> | <none | correction filed | STOP> |

## 5. Stall log
Same defect across <N, default 3> generations = STOP. No endless re-prompting — the structured help request replaces attempt 4.

| Defect | Asset | Attempts | Status |
|---|---|---|---|
| <the recurring failure, observably described> | <n> | <count> | <retrying (< N) | STOPPED → help request below> |

**Help request format:** what was tried (each variant) · what has been ruled out · the narrowest open question someone could answer.

## 6. Corrections received
Every human correction during the mission is a candidate trap/pack entry — recording it here is how the framework improves. Route at mission close.

| Correction | From | What it changed | Candidate entry |
|---|---|---|---|
| <what the human fixed or overrode> | <who> | <asset/section> | <traps/<file> or packs/<file> — generalized, no merchant data | not generalizable: why> |
