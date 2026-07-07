---
name: growthify
description: Use when the team needs to MOVE A METRIC or GENERATE growth mechanics — turns a metric problem ("activation is 30%, we want 50%", "DAU is flat", "conversion is stuck", "move this metric") or a design surface ("give me loyalty mechanics", "growth mechanics for checkout", "gamify onboarding", "growth ideas for", "boost adoption/retention") into a ranked, evidence-grounded portfolio of mechanics plus ship-ready experiment cards. Also handles "growthify feedback <slug>" (predictions-vs-reality after an experiment ships). NOT for challenging an existing plan (use spar), NOT for war-gaming a marketing campaign send (use campaign-wargame), NOT for implementing mechanics (feature-lifecycle).
---

# Growthify — generative growth missions

Generative-first member of the wargame family: lens fan-out over externalized knowledge → adversarial judge gate → experiment designs. The main conversation orchestrates; `growth-recon`, `growth-lens`, `growth-judge` are leaves — **subagents never spawn subagents**.

Read before dispatching: `../references/rubrics/verdict-integrity.md` (law), `../references/rubrics/ranking.md`, `../references/rubrics/dark-patterns.md`.

## The loop (seven steps, main conversation owns every dispatch)

### 1. Intake
- Detect input shape: **metric-problem** (a metric + current/target) → diagnose-first · **design-surface** (a surface needing mechanics) → straight to generation.
- Classify product + vertical. Propose depth, human confirms: **quick** = 3 lenses, top-3 deepened · **deep** = 5 lenses, top-5. Bounds are artifact counts — and CEILINGS, not quotas: a non-owning lens is dropped OR scoped to a declared sliver with the reason logged, never included just to reach the number. <!-- validator:allow -->
- Create mission dir `_context/{project}/growth/{slug}/`; write mission-brief per `../references/templates/mission-brief.md`. Unknown current metric → recon asks the user; never invent a baseline.

### 2. Recon — dispatch `growth-recon` (one, read-only)
Returns the six growth-brief inputs, epistemically tagged (verified/inferred/assumed/unknown): funnel+metrics, segment psychology, competitor moves, fresh case hunts, already-tried sweep, standing-rules sweep. Metric-problem missions get the full funnel diagnosis; design-surface missions get product context + comps without the diagnosis framing.

### 3. Lens fan-out — dispatch `growth-lens` ×N in parallel
- Select lenses via each pack's **Metric-family mapping** section (`../references/lenses/`): metric-problem → packs declaring that metric family; design-surface → packs whose scope owns the surface. Name why each lens was picked in the mission-brief.
- Each dispatch = ONE pack + the recon brief + mission context. Cards return per `../references/templates/candidate-card.md`. Lenses are blind to each other — never share one lens's cards with another.
- **Default-wiring pass:** every already-built substrate in recon's already-tried sweep gets a candidate that wires it in as the DEFAULT at the object's birth moment. Inventory is raw material, not coverage — "X exists" must ask "what would make X fire by default?".

### 3.5 Compose the thesis (main conversation, before the judge)
Compose ONE structural-diagnosis sentence — the organizing inversion the mission turns on — from the recon brief and the returned cards. Send it to the judge with the cards: the top-3 ranked mechanics must each trace to it. A parts list of tagged observations is not a diagnosis. The thesis leads the growth-brief's diagnosis section.

### 4. Judge gate — dispatch `growth-judge` (one)
Send ALL cards + pointers to the three rubrics. Judge returns ledger, verdicts (advance/kill/flag + flip conditions), ranked portfolio, integrity note.

**Bounded kill protocol (orchestrator side):** if the pass has zero kills AND zero flags AND >8 candidates AND no per-survivor justification block → re-dispatch ONCE with the stricter instruction ("your pass advanced everything unjustified — re-judge under R2/R5; justify every survivor or kill"). A justified zero-kill pass STANDS, first time or second. Never re-dispatch twice. Record re-run count for the integrity note.

### 5. Deepen top-N
Top-3 (quick) / top-5 (deep) advanced cards → experiment cards per `../references/templates/experiment-card.md`. Guardrail metrics come from the judge's Goodhart outputs; definitions FROZEN at write time.

### 6. Assemble the growth-brief
Write `_context/{project}/growth/{slug}/growth-brief.md` per `../references/templates/growth-brief.md` — section order exact: diagnosis → ranked portfolio → flagged-excluded → experiment cards → escalations → feedback hook → integrity note.
- Flagged-excluded renders **summary rows only**; full flagged cards go to `{slug}/flagged.md`. `show flagged` re-renders §3 from `flagged.md` — no loop re-run; promotion is a human decision logged in the integrity note.
- **Escalation offers:** "spar the winner" (spar plugin, full adversarial loop on E-1) when the top bet is contested/expensive; "wargame the build" (wargame plugin) for any card ranked `one-way` on reversibility — always offered for one-way doors.

### 7. Feedback — `growthify feedback <slug>` (mandatory when experiments ship)
Resolve the slug, land in exactly one state:

| State | Condition | Writes |
|---|---|---|
| `slug-not-found` | no mission dir matches | list available slugs, stop |
| `not_run` | experiment never shipped | status note → mission dir; NO insight |
| `running` | live, outcome not final | interim note → mission dir; NO insight |
| `insufficient_data` | shipped, minimum fields missing | gap list → mission dir; NO insight — never accept incomplete data silently |
| `complete` | all minimum fields present | full analysis → mission dir; generalized entry → `../references/insights/` (per its README) |

Minimum fields for `complete`: hypothesis id · shipped confirmation · primary-metric before/after or delta class · guardrail status · verdict (worked/failed/inconclusive). Uninstrumented guardrails → `insufficient_data`, and that gap is itself recorded.

## Privacy split (hard rule)
Real numbers live in the mission dir (`_context/`). Plugin files (`insights/`, `exemplars/`) take generalized entries only — mechanism + context class + outcome class, no merchant names, no raw metrics. When in doubt, the mission dir.

## Do not
- Run lenses on invented baselines.
- Let a lens self-rank or self-clear dark patterns.
- Skip the judge, the integrity note, or the feedback hook.
- Estimate durations anywhere. <!-- validator:allow -->
