---
name: grading
description: Set up and run a HIGH-QUALITY grading session for designify — the readiness checklist and quality bar that every judge run stands on (concept scoring, the final gate, blind-pair calibration, simulate replay, post-launch feedback). Use when the user says "grading session", "set up grading", "grading readiness", "grading checklist", "calibration setup", "blind pair setup", "what do we need to grade / calibrate / score", "high-quality grading", "judge session setup", "get Looker access for grading", or "seed the exemplar anchors". Read this BEFORE dispatching design-judge in any calibration or gate context.
---

# Grading Sessions — readiness & quality bar

A grading session is any run where `agents/design-judge.md` scores something. This skill is the setup layer: what must be in place BEFORE the judge runs, and the bar every verdict is held to. It does not replace the judge (the scorer) or `../simulate/SKILL.md` (the replay protocol) — it gates the go/no-go.

**Founding rule:** a grading session with the wrong inputs does not produce a weak grade — it produces a *confident wrong* grade, and a confident wrong grade poisons every pack, trap, and exemplar it feeds. Set up the session or do not run it.

## The five grading contexts

Each is a real judge dispatch already defined elsewhere. This skill tells you what each one needs.

| # | Context | Where it lives | The judge is… |
|---|---------|----------------|---------------|
| G1 | **Concept scoring** | designify loop step 4 (`../designify/SKILL.md`) | decision support — informs the HUMAN pick, never makes it |
| G2 | **Final gate** | designify loop step 7 | the accept / one-more-pass gate on the craft file |
| G3 | **Blind-pair calibration** | `../references/capability-gap.md` producer (STORY-012) | the diff instrument: framework run vs Fable-direct run |
| G4 | **Simulate blind replay** | `../simulate/SKILL.md` (STORY-010) | the diff instrument vs reality's own grade (Looker) |
| G5 | **Post-launch feedback grading** | `designify feedback <slug>` (loop step 9) | prediction-vs-actual scorer |

G1–G2 run every mission. G3–G5 are the calibration channel — the framework's report card — and are the ones this skill exists to protect, because they are the ones most often run with missing inputs.

## The quality bar — non-negotiable in ALL five

Read `../references/rubrics/verdict-integrity.md` — all six rules bind every verdict, and the judge's own output is scored against them first. The floor:

1. **Zero unearned praise (R2).** Every positive statement cites the evidence that earned it. Silence about quality is always allowed; flattery never is.
2. **Closed verdict vocabulary (R3).** The context's exact bands only — `accept / one-more-pass`, or `strong / adequate / weak`. No "interesting", "has potential", "largely holds". Every verdict names its **flip condition**.
3. **Evidence, not vibes.** A fake-read cites a marker id + location (`../references/rubrics/authenticity.md`); a reads-real cites an R-marker. "Feels off" is not a finding — reject it, from the critic and from yourself.
4. **Depth-theater = zero tolerance (calibration #1 fraud).** A claimed lens walk with no lens fingerprints, a claimed trap scan with no trap ids — struck and counted against the run. Calibration built on theater calibrates nothing.
5. **Bounded revision.** One director revision cycle, maximum. A verdict that improved because the file came back — with no new evidence — is agreement creep (R6), not a better file.

A session that cannot meet this bar is not ready. That is the whole point of the checklist below.

## Universal readiness checklist (every context)

Gate each before dispatch. A `no` is a stop, not a proceed-anyway.

- [ ] **Rubrics resolve** — the context's rubrics are on disk and loaded into the dispatch, not paraphrased from memory: verdict-integrity + authenticity always; craft/conversion for gates; concept-selection for G1.
- [ ] **Exemplar anchors present** — at least the anchors this grade needs (see below). A judge with no anchor cannot say what "good" looked like; it can only assert.
- [ ] **Care level fixed** — quick vs deep is set (bounds are artifact counts, never schedule). It changes crit depth and concept count, so it changes what the gate is grading.
- [ ] **The scored artifact is complete** — G2/G4 will *invalidate* on a craft file missing any per-asset avoid-list; do not send a partial file to a gate expecting a soft "one-more-pass".
- [ ] **Evidence surface is real** — recon fact base attached where the grade leans on it; `dont-know` on a load-bearing fact is hunted or surfaced, not graded around.

## Setup by context

### G1 — Concept scoring
Needs: the 2–3 concept cards, `../references/rubrics/concept-selection.md`, the recon fact base (the scorecards cite `checked`/`reasoned` tags — a card standing on `guessing` scores **weak**). Output is scorecards **side by side, then stop** — no winner, no ranking header. Setup failure to avoid: dispatching the judge with an instruction that asks it to recommend. It informs; the human picks.

### G2 — Final gate
Needs: the crit-revised craft file, all four scoring rubrics (authenticity → craft → conversion, plus brand-fit against the M-rule manifest by number), and the exemplars for the anchor comparison. Setup failures to avoid: grading against memory of the brand instead of the manifest; accepting a file whose authenticity dimension is unscored (invalid) or whose any asset lacks an avoid-list (invalid, whatever the other scores).

### G3 — Blind-pair calibration (STORY-012)
The held-out real creative mission run twice, same brief: (a) Opus + designify, (b) Fable-direct. Judge diffs the two.

Setup requirements:
- [ ] **Held-out mission selected** — a real creative need the framework AND its authors have not already worked (contamination note in the header if any prior exposure exists).
- [ ] **One brief, byte-identical** to both runs. Any divergence in the brief voids the diff.
- [ ] **Ground-truth channel decided** — Looker access (G4-grade) makes the diff objective; without it, the diff is judge-vs-Fable-direct on direction quality, spec-silence catches, authenticity-guardrail quality, and negative-prompt coverage only. State which mode you are in.
- [ ] **Gap classification ready** — every diff is `procedure` / `knowledge` / `capability`. Procedure and knowledge gaps get patched into SKILLs / packs / traps. Only `capability` residue lands in `../references/capability-gap.md`, per its schema.

An empty `capability-gap.md` after a real calibration is suspicious, not clean.

### G4 — Simulate blind replay (STORY-010)
Follow `../simulate/SKILL.md` exactly. The setup that makes or breaks it is the **quarantine**:
- [ ] **Reconstruct the night-before picture only** — brief, audience/segment, offer, placements, brand kit, assets as-shipped. NOT their performance.
- [ ] **Outcomes quarantined** — no agent dispatch and no prompt sees Looker results until the reveal step. If outcome data leaks into any dispatch, the replay is **void** — restart with a different campaign, and record the contamination.
- [ ] **Prediction stated before reveal** — rank the shipped variants by expected performance with a one-line mechanism each, honest bands, no fake precision.

### G5 — Post-launch feedback grading
`designify feedback <slug>` lands in exactly one state; only `complete` writes generalized plugin entries. Minimum fields for `complete`:
- [ ] launch confirmation
- [ ] per-asset Looker performance (winner + engagement direction — honest bands fine)
- [ ] the craft file's feedback-hook predictions
- [ ] a verdict per prediction: hit / miss / inconclusive

A Looker gap → state `insufficient_data`, record the gap itself, write NO plugin entries. Never accept incomplete data silently to force a grade.

## Ground truth — the Looker setup (G3/G4/G5, STORY-010, gated on Sean)

Objective grading needs reality's own scores. Without them, L4 stays a wired-but-dormant hook and calibration runs on the Fable-direct diff alone.

To arm it:
- [ ] Working Looker access to campaign creative performance (the `yobo:looker` skill is the entry point; access is a build task, gated on the human).
- [ ] The exact query/report that returns **per-asset** engagement + winner identification for a campaign — document it once so replays are repeatable.
- [ ] A clean campaign to grade — final outcomes, minimum fields present.

The pulled numbers are real merchant data: they live in the mission dir (`_context/{project}/design/replays/{slug}.md` for replays), NEVER in this plugin. Only generalized entries (anti-pattern + markers + context class) cross back into packs/traps.

## Exemplar anchors — the calibration substrate

`../references/exemplars/README.md` defines the two entry kinds; a grade is only as good as the anchors it is measured against.

- [ ] **Fable-direct distillations** — accepted craft files from frontier-direct missions, distilled + redacted. These are what "good" looked like: direction chosen, distilled judge standards, authenticity-guardrail quality. New entries only from a model at least that strong. (Seeded by STORY-011.)
- [ ] **Real-ad taste anchors** — public ads, cited by public source, in BOTH directions: real-feeling AND fake-feeling. The authenticity rubric scores against both, so both must exist or the fake-detection side is untested.
- [ ] **Self-containment holds** — a judge briefed with only the exemplars dir can apply the standards; `_context/` pointers are optional and `local-only`.

Before G2/G3/G4: if the relevant anchor slot is empty, seeding it IS the setup step — do it first, or run the grade knowing it has no anchor and say so in the header.

## Filing results (all contexts)

- **Full analysis** (real numbers, real merchant) → the mission dir under `_context/{project}/design/`. Never here (INV-3).
- **Generalized entries** → plugin traps/packs: anti-pattern + markers + context class. No merchant name, no raw campaign number (the validator's `privacy` scope enforces this).
- **`capability` residue** → `../references/capability-gap.md` only, per its schema.
- **Exemplar-worthy runs** → `../references/exemplars/`, redacted per its README.
- Log the grade in the mission ledger (`../references/templates/craft-ledger.md`) so the session is handoff-ready.

## Go / no-go — the one-screen gate

Run only when all are yes:

1. Rubrics on disk and in the dispatch (not from memory)?
2. The anchor this grade needs is present (or its absence is stated in the header)?
3. For G3/G4: is the blind quarantine intact and the brief identical across runs?
4. For G4/G5: is the ground-truth channel (Looker) armed, or is the degraded mode named explicitly?
5. Is every verdict going to carry evidence + closed vocabulary + a flip condition?

Any `no` → set it up first. A grading session is cheap to delay and expensive to redo — a contaminated replay or an anchorless gate cannot be trusted after the fact, only re-run.

## Standing discipline

- No time estimates anywhere — questions, headers, ledgers (INV-4). Bounds are artifact counts.
- Honest bands only; no fake numeric precision in any quality judgment.
- Real campaign data stays in the mission dir (INV-3); this skill and everything it seeds hold method + generalized craft only.
