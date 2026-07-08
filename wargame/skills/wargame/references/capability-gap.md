# Capability Gap — what the framework does NOT replicate

Honest record from calibration. Use this to decide when a mission genuinely warrants a frontier model.

Mission artifacts live at `_context/_wargames/<slug>/` — the calibration-pair layout: `mission-brief.md` + `success.md` + `framework/` (Arm A) + `direct/` (Arm B) + `calibration.md` (judge). The original STORY-011 audit path (`_context/_fable/audits/calibration-story011.md`) is STALE — file missing; its findings survive only in this doc and the 2026-07-06 SKILL.md patches.

## Measured results (four calibrations)

| Mission | Mode | Terrain | Result vs Fable-direct |
|---|---|---|---|
| STORY-011 (2026-07-06) | solo-procedural | operational | ≈85% — same premise-reframe, same core plan, same order-4 chain; gaps one-directional, no material reverse catches |
| p34 social publishing (2026-07-07) | full dispatch | greenfield/build | ≈85% — near-parity on breadth; **reverse lift: 16 rows Fable-direct missed** (1 killer-class dead-flag, 1 falsified Fable claim, 2 high, 12 standard); each arm shipped a defect the other would have caught; estimated ~90–92% with the 2026-07-07 patch set applied |
| ml-campaign-p1 (2026-07-07) | full dispatch | ML/data pipeline | **≈110% (range 105–120%) — first measured crossing of parity.** Framework held the premise-kill (repo already exists) + two verified deadly chains Fable never named; Fable held the single biggest correctness win (storage fork, where the framework asserted a verified falsehood) + implementation-seam depth |
| sean-agent-p1 (2026-07-07) | solo-procedural | agent-infra / corpus pipeline | **≈78% (range 75–80%)** — same premise-reframe + core plan + order-4 chains; gap WIDENED vs STORY-011's 85% because recon aggressiveness compounds on open-surface terrain (live probes produced 4 premise-kills the framework never ran: retention window, structured AskUserQuestion seam, verified secret contamination, class-precedent `cto` plugin); framework held 2 strategic wins Fable lacked (miner-as-product, refusal-class corpus quarantine) |

Read across the three full-dispatch/operational runs: full dispatch (premise-verifying recon + trap library + verification sweeps + red-team/cascade/judge) is worth ≈+25 points over solo-procedural on pipeline terrain and turned the framework into a genuine second pair of eyes rather than a lossy copy. The residual gap is no longer "fewer findings" — it is live-environment grounding, proof engineering, and door judgment.

Caveat, stated honestly (ml-p1): the measured comparison is machinery-vs-none, not model-vs-model. Fable-direct's misses classify as ≈9 procedure + ≈8 knowledge + ≤1 capability — Fable WITH the skill would recover most of them. The reverse lift is a statement about the framework's value, not Opus outreasoning Fable.

**Terrain sensitivity (added sean-agent-p1, 2026-07-07).** The framework fraction is NOT constant across terrains. Solo-procedural measures ≈85% on bounded operational terrain (STORY-011) but ≈78% on recon-heavy corpus/agent-infra terrain (sean-agent-p1), where probe aggressiveness compounds — every un-run live probe (mtime sweep, secret grep, class-precedent find) is a premise-kill the framework forgoes, and open surfaces offer more of them. Solo-procedural remains the measured FLOOR of framework performance; full dispatch (+premise-verifying recon, trap library, verification sweeps) is what lifted pipeline terrain to ≈85–110%. The 2026-07-07 patch set (source-lifecycle probe, live-contamination verification, class-precedent sweep, discriminator-validity, structured-seam-first) targets exactly this recon-aggressiveness gap.

## Residual frontier-only behaviors (observed, deduped across calibrations)

Recurrence across independent missions is evidence — the recurring items are stable model-tier behaviors, not one-off luck.

1. **Second-order epistemics on artifacts** (STORY-011) — treating a red test not as an obstacle but as *evidence* (a failing test asserting the old contract = proof an in-repo consumer expectation existed). The framework can check tests; it doesn't spontaneously reinterpret their failures as information about the world.
2. **Detection-layer / proof-architecture framing** — RECURRED. STORY-011: reframing the risk model around observability ("the regression's only trace lands in a table nobody watches → the mission needs a detection layer"). p34: deriving a two-lane proof architecture from a reachability fact (local MinIO unreachable by Meta → media-free FB lane as the storage-independent E2E proof + public-URL lane for IG). A checklist can force the reachability *question*; generating the architecture that keeps the mission provable anyway is the frontier part.
3. **Mutation-check discipline** (STORY-011) — proving a new test actually guards the thing (delete the guarded code once, watch it go red, revert). Cheap, decisive, rarely spontaneous in weaker models.
4. **Anomaly-driven inference / planning-time empiricism** — RECURRED. STORY-011: noticing a lone commit on a remote branch and extracting "push rights empirically proven." p34: executing probes against runtime state *while planning* (DB rows, redis, process table, tunnel HTTP code) and letting results reshape the move tree — the `:3040` env anomaly, the DB-already-has-0227 inference, failed probe variants documented. The heuristics are in recon now; the *noticing* isn't.
5. **Decisive reversible-door commitment** (p34) — with identical facts and a correct recommendation, the framework still human-gated a two-way door; Fable defaulted it with a stated exit command and put "waiting" in the *rejected* list. The 2026-07-07 door-typed-fork patch narrows this; the spontaneous integration of first-lander-wins + reversibility + collision-elimination into one autonomous ruling remains unprompted judgment.
6. **Single-observation discriminator taste** (p34) — the `expires_at ≈60d vs ≈1–2h` credential probe; "zeros are VALID for a minutes-old post — the proof is the row update." One-observation probes that split signal classes cleanly. The red-team stage produces signal *lists*, not this economy.
7. **Derived-labels reframe** (ml-p1) — "the empty actuals table is one aggregation step away from data we already have at the locked grain"; substitute the label source, keep the gates, label the provenance honestly (`model_version: category-mean-v0`), and the deliverable keeps answering. The framework *considered* the neighborhood and still chose a 503. Nearest partial mitigation is a knowledge hint, expected to fire unreliably.
8. **Executor-disposition modeling** (sean-agent-p1) — modeling the executor model's OWN failure modes as tagged facts (reads big files when curious, self-reports high confidence, gives helpful-bias answers instead of escalating, drifts artifacts into the wrong tree) each with a named guard and a behavioral abort condition. Partially teachable as a checklist; the self-ethnography and its per-move threading are frontier judgment.
9. **Blind-first review origination** (sean-agent-p1) — inventing the blind-first mechanic (reviewer answers a small sample BEFORE seeing the machine candidate) to measure the pipeline's context sufficiency, not just its outputs, and to calibrate the eval's `underspecified` bucket. Teachable forward once named (now PATCH I / judge dimension 9); the origination was unprompted.
10. **Structure-noticing** (sean-agent-p1) — RECURS with #4. The unprompted noticing that a corpus already holds typed, machine-parseable instances of the target signal (144 AskUserQuestion pairs) before any fuzzy extractor is designed. The heuristic is teachable (structured-seam-first, now in recon); the spontaneous noticing is frontier residue.

Also ml-p1: Fable-direct, blind to a repo it didn't know existed, predicted ~2.5 of the 4 verified deadly defects from first principles. That is a capability signature, not a patchable gap.

## When to spend frontier-model budget

- **Default dispatch on pipeline/build terrain** — with the 2026-07-07 patch set applied, framework+Opus dispatch ≥ Fable-direct there (ml-p1 ≈110% measured; p34 ≈85% measured, ~90–92% estimated post-patch).
- **Fable-direct still wins where the residue lives**: live-environment grounding, proof architecture, reversible-door judgment, discriminator taste, deliverable-saving reframes. Spend frontier budget on one-way doors with broad blast radius, missions whose success hinges on runtime/environment truth rather than code truth, and judge duty on high-stakes calibrations.
- **"Brief might be wrong" is no longer automatically frontier terrain**: in ml-p1 the framework's premise-verifying recon killed the brief's false "NEW repo" claim while Fable-direct swallowed it. Premise risk is now a recon-procedure problem; *frame-quality* risk (the derived-labels-class reframe) is still frontier.
- **Likely best value on residue-heavy terrain: Fable WITH the skill** — expected to recover most of Fable-direct's machinery-shaped misses per the ml-p1 gap classification, but this arm is itself unmeasured (see below).

## Untested (be honest about the floor)

- **Pure-decision terrain** — calibrated only by exemplar, never by a blind pair.
- **Executor-fidelity** — no accepted war-game has been EXECUTED yet; reality's scorecard pending. Feed divergences back into the trap library per the skill's feedback loop.
- **Fable+skill arm** — the ml-p1 "would recover most misses" claim is derived from gap classification, never run.

Previously untested, now measured: multi-agent dispatch mode (p34, ml-p1) and greenfield-build terrain (p34).
