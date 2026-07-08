# Mock Ledger — <mission slug>

> The mission's running record: entities, screens, verdicts, corrections. Handoff-ready at any moment — someone who wasn't in the room can pick up the mission from this file alone. Updated as work happens, never reconstructed after.

## 1. Entity-resolution table
Mirrored from the mission brief at intake as one-liners; re-resolved rows get a new line, never an edit — the trail is the point.

| Entity | Resolved to | Source | Confirmed |
|---|---|---|---|
| App | <exact repo path> | <source> | ☐ |
| Design system | <`DESIGN.md` path + theme/token source file paths> | <source> | ☐ |
| Screens in scope | <exact route list> | <app router / extension map> | ☐ |
| Framework components | <package path the component inventory comes from> | <source> | ☐ |
| Output dir | `_context/<project>/mockify/<slug>/` + `mockups/` | | ☐ |

## 2. M-rule conformance grid
Checked per screen at crit (attack classes walk it rule by rule) and re-checked at the judge gate. ✓ = conforms · ✗ = violation (file a finding) · — = rule not applicable to this screen.

| Rule | Screen 1 | Screen 2 | Screen 3 | … |
|---|---|---|---|---|
| M1 | | | | |
| M2 | | | | |

## 3. Screens & mockups
One row per screen per stage. Claims state their evidence — a mockup that was never opened in a browser is declared unrendered, never rounded up to "done".

| Screen | Route | Stage | Mockup file | Artifact link | Verdict | Corrections |
|---|---|---|---|---|---|---|
| <name> | <route> | <concept-<letter> \| deepen \| revision> | `mockups/<slug>-concept-<letter>-<screen>.html` or `mockups/<slug>-<screen>.html` | <published URL> | <picked \| rejected: why-not \| crit findings open \| judge: accept \| one-more-pass> | <see §5> |

## 4. Feedback grading state
Filled by `mockify feedback <slug>`. Exactly one state at any time; gaps and interim notes land here, plugin entries only at `complete`.

| State | When recorded | Notes |
|---|---|---|
| <not_implemented \| in_progress \| insufficient_data \| complete> | <YYYY-MM-DD> | <gap list · corrections-so-far pointer · screenshot-diff result or skipped-with-reason> |

## 5. Corrections received
Every human correction during ANY step is a candidate trap/pack entry — recording it here as it happens is how the framework improves. Route at mission close.

| When | What was corrected | At step | Candidate entry |
|---|---|---|---|
| <YYYY-MM-DD> | <what the human fixed or overrode> | <intake \| recon \| M-rules \| concept \| pick \| deepen \| crit \| judge \| assemble \| feedback> | <yes: traps/<file> or packs/<file> — generalized, no real user data \| no — not generalizable: why> |
