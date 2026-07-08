---
name: wargame
description: Use when a mission (feature, migration, deploy, epic story, irreversible decision) should be fought on paper before execution — producing a move-by-move war-game any executor model can run cold. Also use when the user says "war-game this", "wargame", "fight it on paper", "see around corners", "what are the second-order effects", "one-way door review", or asks what a change breaks/enables downstream. Not for trivial two-way-door edits — the ceremony must pay for itself.
---

# War-Game — Externalized Foresight

Fight a mission on paper, move by move, before any executor touches reality. The output is a war-game file a cheaper model can execute cold: every move carries its expected observations, its most-likely failures with signals and countermoves, its downstream consequences AND opportunities to order N, fork triggers, and abort conditions.

## The core bet

A weaker model cannot hold a six-move tree in its head. It does not need to. **Depth in the head is unreliable; depth on paper is a loop.** The framework substitutes structure for raw depth:

1. **Externalized state** — facts and dependencies written down (recon), so no stage reasons from vibes.
2. **Iterated local steps** — order-N sight = repeatedly asking "what depends on what just changed?" against a written map. Six one-step walks over paper ≈ six steps in a frontier model's head.
3. **Role separation** — one mind rarely holds optimism and pessimism honestly at once. Five agents each hold one stance without contamination: recon (truth), red-team (reality), cascade (risk depth), scout (opportunity depth), judge (taste + calibration).
4. **Externalized tacit knowledge** — trap libraries from real incidents + domain agents' skills, injected as guaranteed reactions instead of rediscovered failures.

## Non-negotiable disciplines (apply to every stage)

**Epistemic tags.** Every load-bearing claim is `verified` (cited observation from this run) / `inferred` (chain shown) / `assumed` (ledgered, with its verification probe) / `unknown`. An `unknown` triggers an active hunt (codebase probe → artifact read → command probe → web search → designed experiment); "not in training data" is never terminal. Unknowns that survive hunting are surfaced in the ledger — never silently dropped.

**First-principles pass.** Every constraint the mission inherits gets challenged once: why is this the way it is? Is the original reason still true? What becomes possible if dropped? "It's the way it is" is a smell, not an answer.

**Now/later partition.** Every war-game splits scope explicitly: handled **now** / **designed-for** (seam named, not built) / **later** (promotion trigger named) / **rejected** (one line why). Deferred items carry reversibility notes (two-way vs one-way door).

**The Better rubric** (`references/rubrics/better.md`). Better ≠ more complex. Solutions and opportunities are scored on: elegant, simple, performant, usable, integrable, understandable. Complexity is a cost to justify on another axis, explicitly.

## Domain plug-in — where the intelligence comes from

The framework is domain-agnostic scaffolding. Domain intelligence plugs in through the **domain role agents and their skills** — e.g. `cadra:cadra-dev` (agent execution, channels, cadra-api topology), `yobo:yobo-dev` (campaigns, CRM, message-api switchboard), `core:core-dev` (SDK, RBAC, RLS). The mission brief names the domain agent. Then:

- **Recon runs with the domain's skills loaded** — dispatch recon *as* the domain agent (Agent tool `subagent_type: "cadra:cadra-dev"` etc. with the recon role prompt), or have recon invoke the matching domain skills (`cadra:agents`, `cadra:channels`, `yobo:messaging`, `core:rbac`, …) before building the fact base. The domain skills carry the invariants, gotchas, and subsystem maps no generic sweep would find.
- **Red-team draws invariants from the domain skills' gotcha sections** plus the trap library.
- **Cascade gets cross-repo consumer edges from the domain agent's ecosystem map** (the polyrepo table, SDK consumer lists).

Rule of thumb: generic wargame agent + domain skills loaded > generic agent alone; when a stage is dominated by domain terrain (recon, red-team), prefer dispatching the domain agent wearing the stage's role prompt.

## The loop

Phases run as agent dispatches from the main conversation (subagents cannot spawn subagents). Parallelize what's independent; the orchestrator owns sequencing.

**Solo-procedural mode (no subagent dispatch).** When the orchestrator runs the loop itself without dispatching the role subagents, it MUST first read `agents/{recon,red-team,cascade,scout,judge}.md` and apply each agent's standing-question lists as its own checklist — the calibration-sourced questions live in those files, and two of them recurred as gaps in a solo run that skipped them.

### 0. Mission intake
Write the mission brief from `references/templates/mission-brief.md`: objective, named executor model (and its behavioral profile — tailor the war-game to how THAT model fails), domain agent, spec/context paths, scope in/out, primary Better axis, **depth knob** (default order 3; raise to 4–5 for one-way doors), verification paths, deliverable path. Human sets the depth knob and the mission boundaries; everything else the framework earns.

### 1. Recon (`wargame-recon`, domain skills loaded)
Fact base (tagged) + dependency map + trap injection + unknown hunts + elicitation answers. Everything downstream stands on this; a foresight error later is usually a fact error here.

Two mandatory recon sweeps (added from calibration, 2026-07-06):
- **Standing-rules sweep** — user feedback rules and standing constraints (feedback_* memory notes, CLAUDE.md rules like "user controls all pushes/deploys") OVERRIDE any authority the mission seems to imply. Each applicable rule becomes an explicit HUMAN GATE move in the war-game, never a self-decided prior. Rules are applied PER-MOVE, not just listed — a cited rule that no move obeys is a recon failure.
- **Empirical-evidence heuristic** — before ledgering a can-we-even-do-X unknown, hunt for evidence the system already did X (a past push on a remote ref, an existing artifact, a prior successful run). Found evidence converts a human-decision ledger entry into a verified fact.

Added from calibration, 2026-07-07:
- **Live-environment sweep** — probe runtime STATE, not just code: env file end-to-end, storage/auth/tunnel endpoints, DB state, tool PATH, process list. Verify every URL/host the mission hands to an external party or a browser is reachable *by that party*; for every hardcoded external table name, confirm which physical variant (dev/prod suffix) actually holds data.
- **Premise + collision preflight** — verify every filesystem premise the brief asserts before move 1, including that the mission's own artifacts (dirs, tables, repos) don't already exist.
- **Proof standards** — negative-existence claims require a concept-grep, never a line-read; compile-check every import/API path the plan names against the repo; grep memory for every deploy target the mission names.
- **Two-system cross-checks** — when the same quantity exists in two systems, compare both and state the expected delta DIRECTION before probing (e.g. downstream slightly lower is correct; higher is a bug).
- **Source-lifecycle probe** — for any corpus/data source the mission mines or depends on, verify the oldest item on disk, what process rotates/deletes it (retention, cleanup, TTLs), and whether a second copy exists. A source that "has always been there" may be a rolling window (a "deep history" transcript corpus turned out to be a one-month window).

Added from calibration, 2026-07-08 (org-attribution framework-vs-Fable diff — the framework matched Fable on reasoning depth but lost on recon *diligence*; these two close that gap):
- **P1 — close closeable unknowns IN-PASS; ladder only env/gate-dependent ones.** Before laddering an unknown to a story-time probe, ask: can a read / grep / registry-query close it NOW? If yes, close it now. Cheap closers recon must run rather than defer: a session/JWT/config shape read (the `targetOrgName` source was an in-session `currentOrg.name` field, not a needed DB lookup), a registry query (`npm view <pkg> versions time` gives the exact published version list + timestamps), a schema read. Ladder ONLY genuine dev-env values and Gate-2-guarded state (e.g. a live DB id the human must supply). A frontier model closes these in one pass; the framework must too.
- **P2 — verify shared-package/dependency-map edges by grepping REAL imports, not by listing pins or workspace membership.** For every claimed consumer of a shared package, grep its `src` for actual imports before stating the blast radius. A pin (or workspace membership) without an import is a **phantom consumer** — say so at RECON, not three stages later at cascade. (Framework asserted "5 SDK consumers" from the pin table and corrected to "3 real" only at cascade; Fable had it right at recon by grepping imports.)

### 2. Move-tree draft (orchestrator or domain agent)
Enumerate candidate moves toward the objective — including the first-principles alternatives, not just the obvious route. Breadth first: draft ALL moves shallow before deepening any (mirrors draft-all-then-polish at mission scale).

Added from calibration, 2026-07-07:
- **Resilience-proof moves** — every recovery mechanism a move ships (retry, watchdog, restart persistence, CAS claim) gets a paired runtime-proof move: kill/restart persistence, watchdog live-fire by removing the primary, concurrent-claim race. Proven at runtime, never asserted.

### 3. Reality pass (`wargame-red-team`)
Per move: Action / expected observation (success AND failure signature) / most-likely reaction with cause + signals / countermove (pessimistic + optimistic branch). Trap-library matches are guaranteed reactions. A draft where no move fails goes straight back.

Added from calibration, 2026-07-07:
- **Lifecycle×verb matrix** — for every scheduled/stateful artifact, enumerate create/reschedule/cancel/edit/delete and ask: what happens to the artifact the PREVIOUS verb created?
- **First-failing-seam** — per build move, name the first compile/runtime seam that fails and give a ≤5-line fallback.

### 4. Consequence walk (`wargame-cascade`)
Per surviving move: order-numbered walk of the dependency map to the depth knob. One step at a time, order number logged per finding, cross-repo edges mandatory, honest termination (`map-exhausted` ≠ "no consequences").

Added from calibration, 2026-07-07:
- **Close the graph** — after walking outward, check for cycles: does any downstream stage WRITE to a table an upstream stage watermarks/exports? Flag every write-back-into-source loop, not just outward edges.

### 5. Opportunity walk (`wargame-scout`)
Same map, generative direction: what does each move enable / reveal / free? Extraction signals (pattern's third occurrence → SDK/module candidate), droppable constraints, ranked on the Better rubric, placed in the now/later partition with triggers and seams.

### 6. Assembly (orchestrator)
Merge into the war-game file (`references/templates/wargame-file.md` schema): moves with full triples, fork triggers ("observe X → route A; observe Y → route B" — discriminating observables defined BEFORE acting), consequence tree, opportunity register, partition, assumptions→ledger, **abort conditions** (states where the executor must stop and escalate — always last, always specific).

Added from calibration, 2026-07-07:
- **Scoped aborts** — every abort names its SCOPE (which moves stop, which continue mocked/degraded) plus a resume trigger; whole-mission stops only where no mocked lane exists.
- **Door-typed forks** — a fork whose recommended branch is a two-way door with a stated exit command is DEFAULTED (drift fork-triggers + abort), never human-gated; human gates are reserved for one-way doors.
- **Gate consolidation** — front-load ONE human gate that carries all container/one-way-door decisions (homes, delegated classes, batch caps, exposure notices) rather than scattering them across moves; the consolidated gate is what makes an executor stop in the right place once.

### 7. Judgment (`wargame-judge`)
Score against `references/templates/success.md`, the exemplars (`references/exemplars/`), and the Better rubric. Verdict: accept, or another round with bounded named gaps. Depth theater (claimed order > walked order) is the #1 fraud it hunts.

Added from calibration, 2026-07-07 — the judge also rejects: whole-mission aborts where a mocked lane exists; human gates on two-way doors; any mission gate argued away as degenerate instead of materialized as a printed artifact row (e.g. a baseline line in results.tsv).

Rounds repeat 3–7 until accept. Batch missions: draft all war-games first, polish none, then loop-polish — breadth beats depth-on-one.

## Execution handoff

The accepted war-game file IS the executor's brief. The executor (named in the file) runs moves in order, checks each expected observation, follows fork triggers on divergence, applies countermoves on failure signals, respects abort conditions. During execution, log divergences reality produced that the war-game missed — these feed back into the trap library (signal → cause → countermove, sourced) and, if procedural, into this skill.

## Calibration protocol (kept for framework evolution)

To test the framework against a stronger model, or a change to the framework against its previous self: run the framework on a mission with model A; produce (or retrieve) a direct war-game of the same mission by model B; `wargame-judge` in calibration mode diffs them and classifies every gap as **procedure gap** (patch this SKILL.md) / **knowledge gap** (patch traps/maps) / **capability gap** (record in the mission folder's capability-gap.md — the honest list of what still needs a frontier model). Exemplars in `references/exemplars/` are Fable-5-direct ground truth; new exemplars only from models at least that strong.

## References

- `references/templates/mission-brief.md` — intake template
- `references/templates/wargame-file.md` — output schema
- `references/templates/success.md` — acceptance criteria seed (copy per mission folder, tighten per mission)
- `references/templates/ledger.md` — blocked-inputs/assumptions format
- `references/rubrics/better.md` — the Better rubric
- `references/traps/` — trap library, signal→cause→countermove, real incidents only
- `references/exemplars/README.md` — exemplar INDEX: distilled judge-standards + pointers to the full ground-truth war-games, which live in the project's context tree (project artifacts stay out of the plugin)
- `references/capability-gap.md` — when a mission genuinely warrants a frontier model
