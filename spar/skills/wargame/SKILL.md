---
name: wargame
description: Use when a NON-CODE decision (negotiation, market entry, hire, pricing, partnership, one-way-door life/business decision) should be fought on paper before execution — producing a move-by-move war-game file a HUMAN executes. Use when the user says "war-game this deal/negotiation/hire/decision", "fight it on paper", "see around corners", asks for second-order effects of a business or personal move, or when a spar surfaces a one-way door. For code/platform missions (repos, deploys, migrations, epics) use wargame:wargame (jetdevs plugin) instead; mixed missions default there too, with spar personas noted as unavailable. Not for trivial two-way-door choices — the ceremony must pay for itself.
---

# War-Game — Externalized Foresight (general domain)

Fight a decision on paper, move by move, before reality gets a vote. The output is a war-game file the HUMAN executor runs cold: every move carries its expected observations (things a person can see, hear, or count), its most-likely reactions from named actors with signals and countermoves, its downstream consequences AND opportunities to order N, fork triggers, and abort conditions.

## The core bet

A model (or a person mid-decision) cannot hold a six-move tree in its head. It does not need to. **Depth in the head is unreliable; depth on paper is a loop.** The framework substitutes structure for raw depth:

1. **Externalized state** — the domain brief: facts, actors, incentives, base rates written down (recon), so no stage reasons from vibes.
2. **Iterated local steps** — order-N sight = repeatedly asking "whose payoff changes from what just changed?" against a written actor/incentive map. Six one-step walks over paper ≈ six steps in a frontier model's head.
3. **Role separation** — one mind rarely holds optimism and pessimism honestly at once. Five agents each hold one stance without contamination: recon (truth), red-team (pessimism), cascade (risk depth), scout (opportunity depth), judge (taste + calibration).
4. **Externalized tacit knowledge** — domain packs built from real cases + per-mission research, injected as guaranteed reactions instead of rediscovered failures.

## Non-negotiable disciplines (every stage)

**Epistemic tags.** Every load-bearing claim is `verified` (cited, dated) / `inferred` (chain shown) / `assumed` (ledgered, with its verification probe) / `unknown`. Web claims carry a source grade (A primary / B practitioner / C secondary). An `unknown` triggers an active hunt (web search → artifact read → memory/sessions → designed real-world experiment); "not in training data" is never terminal. Survivors are surfaced in the ledger — never silently dropped. Degraded-mode ladder and `unresearched` tagging per `agents/recon.md`.

**First-principles pass.** Every constraint the mission inherits gets challenged once: why is this the way it is? Is the original reason still true? What becomes possible if dropped? "It's the way it is" is a smell, not an answer. Runs in recon's standing-rules sweep (stage 1) — before the move tree, not after the motion locks.

**Now/later partition.** Every war-game splits scope explicitly: handled **now** / **designed-for** (seam named, not built) / **later** (promotion trigger named) / **rejected** (one line why). Deferred items carry reversibility notes (two-way vs one-way door).

**The Better rubric** (`../references/rubrics/better.md`). Better ≠ more complex. Complexity is a cost to justify on another axis, explicitly.

**Verdict integrity** (`../references/rubrics/verdict-integrity.md`). All six rules bind mission mode too — red-team steelmans before attacking, verdicts are closed-vocabulary, praise is earned, the judge audits.

## Where the intelligence comes from — domain packs + research

The framework is domain-agnostic scaffolding; expertise is **earned per mission**. Recon loads `SPAR_HOME/domains/<domain>/` (validated against the pack schema, staleness-checked per `half_life`) plus the plugin's starter packs, then researches the gap — web + artifacts + memory — into a cited domain brief. Failure-modes entries and base-rate violations play the trap-library role: **guaranteed reactions**, not hypotheticals. First mission in a domain pays full research cost; the post-mission distill (one-confirm diff, redaction rules) writes durable knowledge back so the next mission starts warm. Schema + writeback contract: `../references/domains/README.md`.

## The loop

Stages run as agent dispatches from the main conversation (subagents cannot spawn subagents). Each stage receives the mission brief + all prior stage outputs as file paths; each writes one named artifact into `SPAR_HOME/missions/<slug>/`: `domain-brief.md`, `moves.md`, `reality.md`, `cascade.md`, `scout.md`, `wargame.md`, `judgment.md`.

### 0. Mission intake (main conversation)
Write the mission brief from `../references/templates/mission-brief.md`: objective in observable terms, **executor = the human** (their authority, time budget, risk tolerance, lines they won't cross — tailor every move to a person, not a process), domain + pack path, context artifacts (a promoting spar's state file seeds this), scope in/out, primary Better axis, **depth knob** (default order 3; 4–5 for one-way doors), verification checkpoints, deliverable path. The human sets the depth knob and mission boundaries; everything else the framework earns.

### 1. Recon (`spar-recon`)
Domain brief: tagged fact base + actor/incentive map + base rates + personas + question battery + unknown hunts + standing-rules sweep (each applicable standing constraint becomes an explicit HUMAN GATE move, never a self-decided prior; the first-principles pass runs HERE — each inherited constraint restated as the limit it protects + the cheapest compliant version of the action it appears to forbid — before the move tree, not after the motion locks) + empirical-evidence heuristic (hunt for proof X already happened before ledgering "can we X?"). Everything downstream stands on this; a foresight error later is usually a fact error here.

### 2. Move-tree draft (main conversation)
Enumerate candidate moves toward the objective — decisions and actions in the world: sign, counter-offer, launch, hire, walk away — including the first-principles alternatives, not just the obvious route. **Breadth first: draft ALL moves shallow before deepening any** (draft-all-then-polish at mission scale).

### 3. Reality pass (`spar-red-team`)
Steelman of the plan first, then per move: action / expected observation (success AND failure — what the human sees or hears) / most-likely reaction from the actor whose payoff drops most, with cause + signals / countermove (pessimistic + optimistic branch). Pack matches and base-rate violations are guaranteed reactions. Standing questions: single-point-of-failure insurance, who-watches-the-failure-trace. A draft where no move fails goes straight back.

### 4. Consequence walk (`spar-cascade`) — ∥ with 5
Per surviving move: order-numbered walk of the actor/incentive map to the depth knob. One step at a time, order number logged per finding, landing time noted (immediate/weeks/next cycle), honest termination (`map-exhausted` ≠ "no consequences").

### 5. Opportunity walk (`spar-scout`) — ∥ with 4
Same map, generative direction: what each move enables / reveals / frees. Extraction signals (a pattern's third occurrence → reusable playbook/clause/template), droppable constraints via the first-principles probe, ranked on the Better rubric, placed in the now/later partition with triggers and seams.

### 6. Assembly (main conversation)
Merge into the war-game file (`../references/templates/wargame-file.md` schema): moves with full triples, fork triggers ("observe X → route A; observe Y → route B" — discriminating observables defined BEFORE acting), consequence tree, opportunity register, partition, assumptions → ledger, **abort conditions** (states where the human must stop and reassess — always last, always specific and observable).

### 7. Judgment (`spar-judge`)
Score against `../references/templates/success.md`, the exemplar standards (`../references/exemplars/README.md`), the Better rubric, and the verdict-integrity rubric. Verdict: accept, or another round with bounded named gaps. Depth theater (claimed order > walked order) is the #1 fraud it hunts.

Rounds repeat 3–7 (2–7 if the move tree itself was the gap) until accept. Batch missions: draft all war-games first, polish none, then loop-polish — breadth beats depth-on-one.

## Execution handoff (human)

The accepted war-game file IS the executor's brief. The human runs moves in order, checks each expected observation, follows fork triggers on divergence, applies countermoves on failure signals, **stops at abort conditions**. During execution, log divergences reality produced that the war-game missed into the mission folder; durable lessons distill into the domain pack (one-confirm diff, redaction rules per `../references/domains/README.md`) — the same feedback loop that grows the packs.

## Escalation seam (both directions)

- **Spar → mission:** a spar that surfaces a one-way door offers promotion; the spar state seeds the mission brief.
- **Mission → spar:** when red-team hits a fork only the human can resolve (a value trade-off, a risk-tolerance call), drop into a live spar round on that fork instead of guessing.

## Calibration protocol (framework evolution)

Run the framework on a mission with model A; produce (or retrieve) a direct war-game of the same mission by model B (Fable-class); `spar-judge` in calibration mode diffs them against the acceptance gate and classifies every gap: **procedure** (patch this SKILL.md) / **knowledge** (patch packs/templates) / **capability** (record in `../references/capability-gap.md` — the honest list of what still needs a frontier model). Exemplars are Fable-direct ground truth; new exemplars only from models at least that strong.

## References
- `../references/templates/mission-brief.md` — intake template (executor = human)
- `../references/templates/wargame-file.md` — output schema
- `../references/templates/success.md` — acceptance criteria seed (copy per mission folder, tighten per mission)
- `../references/templates/ledger.md` — blocked-inputs/assumptions format
- `../references/rubrics/better.md` · `../references/rubrics/verdict-integrity.md`
- `../references/domains/README.md` — pack schema, writeback, staleness
- `../references/exemplars/README.md` — exemplar INDEX (full files live in `SPAR_HOME/exemplars/`)
- `../references/capability-gap.md` — when a mission genuinely warrants a frontier model
