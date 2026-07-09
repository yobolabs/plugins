---
name: grading
description: Set up and run a HIGH-QUALITY grading session for mockify — the readiness checklist and quality bar that every judge run stands on (concept scoring, the final gate, blind-pair calibration, post-launch feedback). Use when the user says "grading session", "set up grading", "grading readiness", "grading checklist", "calibration setup", "blind pair setup", "what do we need to grade / calibrate / score", "high-quality grading", "judge session setup", "get screenshot-diff access for grading", or "seed the exemplar anchors". Read this BEFORE dispatching mock-judge in any calibration or gate context.
---

# Grading Sessions — readiness & quality bar

A grading session is any run where `agents/mock-judge.md` scores something. This skill is the setup layer: what must be in place BEFORE the judge runs, and the bar every verdict is held to. It does not replace the judge (the scorer) — mockify has no `simulate` skill in v1 (D10; deferred to post-v1) — it gates the go/no-go.

**Founding rule:** a grading session with the wrong inputs does not produce a weak grade — it produces a *confident wrong* grade, and a confident wrong grade poisons every pack, trap, and exemplar it feeds. Set up the session or do not run it.

## The four grading contexts

Each is a real judge dispatch already defined elsewhere. This skill tells you what each one needs.

| # | Context | Where it lives | The judge is… |
|---|---------|----------------|---------------|
| G1 | **Concept scoring** | mockify loop step 4 (`../mockify/SKILL.md`) | decision support — informs the HUMAN pick, never makes it |
| G2 | **Final gate** | mockify loop step 7 | the accept / one-more-pass gate on the spec + mockups |
| G3 | **Blind-pair calibration** | `../references/capability-gap.md` producer | the diff instrument: framework run vs Fable-direct run |
| G4 | **Post-launch feedback grading** | `mockify feedback <slug>` (loop step 9) | prediction-vs-actual scorer |

G1–G2 run every mission. G3–G4 are the calibration channel — the framework's report card — and are the ones this skill exists to protect, because they are the ones most often run with missing inputs. (Designify's simulate-blind-replay context has no mockify slot: `simulate` is deferred post-v1 per D10 — when it ports, it resumes the reserved next slot.)

## The quality bar — non-negotiable in ALL four

Read `../references/rubrics/verdict-integrity.md` — all six rules bind every verdict, and the judge's own output is scored against them first. The floor:

1. **Zero unearned praise (R2).** Every positive statement cites the evidence that earned it. Silence about quality is always allowed; flattery never is.
2. **Closed verdict vocabulary (R3).** The context's exact bands only — `accept / one-more-pass`, `strong / adequate / weak`, or `kills-the-screen / hurts / cosmetic`. No "interesting", "has potential", "largely holds". Every verdict names its **flip condition**.
3. **Evidence, not vibes.** A design-system-drift finding cites the recon component inventory; a usability finding cites the mechanism plus a recon marker (`../references/rubrics/verdict-integrity.md`'s R5 attack-quality floor). "Feels off" is not a finding — reject it, from the critic and from yourself.
4. **Depth-theater = zero tolerance (calibration #1 fraud).** A claimed pack walk with no pack-specific directives, a claimed trap scan with no trap ids — struck and counted against the run. Calibration built on theater calibrates nothing.
5. **Bounded revision.** One director revision cycle, maximum. A verdict that improved because the spec came back — with no new evidence — is agreement creep (R6), not a better spec.

A session that cannot meet this bar is not ready. That is the whole point of the checklist below.

## Universal readiness checklist (every context)

Gate each before dispatch. A `no` is a stop, not a proceed-anyway.

- [ ] **Rubrics resolve** — the context's rubrics are on disk and loaded into the dispatch, not paraphrased from memory: verdict-integrity always; usability/craft/implementability for gates; concept-selection for G1.
- [ ] **Exemplar anchors present** — at least the anchors this grade needs (see below). A judge with no anchor cannot say what "good" looked like; it can only assert.
- [ ] **Care level fixed** — quick vs deep is set (bounds are artifact counts, never schedule). It changes crit depth and concept count, so it changes what the gate is grading.
- [ ] **The scored artifact is complete** — G2 will *invalidate* a spec missing any per-screen states matrix, responsive spec, or avoid-list; do not send a partial spec to a gate expecting a soft "one-more-pass".
- [ ] **Evidence surface is real** — recon fact base attached where the grade leans on it; `dont-know` on a load-bearing fact is hunted or surfaced, not graded around.

## Setup by context

### G1 — Concept scoring
Needs: the 2–3 concept cards, `../references/rubrics/concept-selection.md`, the recon fact base (the scorecards cite `checked`/`reasoned` tags — a card standing on `guessing` scores **weak**). Output is scorecards **side by side, then stop** — no winner, no ranking header. Setup failure to avoid: dispatching the judge with an instruction that asks it to recommend. It informs; the human picks.

### G2 — Final gate
Needs: the crit-revised spec + mockups, all four scoring rubrics (usability first → craft → implementability, plus design-system fit against the M-rule manifest by number), and the exemplars for the anchor comparison. Setup failures to avoid: grading against memory of the design system instead of the manifest; accepting a spec whose usability dimension is unscored (invalid) or whose any screen lacks a states matrix / responsive spec / avoid-list (invalid, whatever the other scores).

### G3 — Blind-pair calibration
The held-out real design need run twice, same brief: (a) Opus + mockify, (b) Fable-direct. Judge diffs the two.

Setup requirements:
- [ ] **Held-out mission selected** — a real design need the framework AND its authors have not already worked (contamination note in the header if any prior exposure exists).
- [ ] **One brief, byte-identical** to both runs. Any divergence in the brief voids the diff.
- [ ] **Ground-truth channel decided** — screenshot diff (G4-grade, once the app runs locally) makes the diff objective; without it, the diff is judge-vs-Fable-direct on direction quality, spec-silence catches (M-rule conformance), usability-argument quality, and avoid-list coverage only. State which mode you are in.
- [ ] **Gap classification ready** — every diff is `procedure` / `knowledge` / `capability`. Procedure and knowledge gaps get patched into SKILLs / packs / traps. Only `capability` residue lands in `../references/capability-gap.md`, per its schema.

An empty `capability-gap.md` after a real calibration is suspicious, not clean.

### G4 — Post-launch feedback grading
`mockify feedback <slug>` (mirrored from `../mockify/SKILL.md`) lands in exactly one of five states — `slug-not-found` / `not_implemented` / `in_progress` / `insufficient_data` / `complete` — and only `complete` writes generalized plugin entries. Minimum fields for `complete`:
- [ ] implementation-shipped confirmation
- [ ] human verdict per spec section (followed / diverged-better / diverged-worse / dropped, with the correction that caused it)
- [ ] screenshot diff where the app runs locally (Playwright captures of built routes vs winning mockups; skipped-with-reason otherwise — a skip is recorded, not silent)
- [ ] verdict per spec-file feedback-hook prediction (hit / miss / inconclusive)

An `insufficient_data` state records the gap list in the ledger, writes NO plugin entries. Never accept incomplete data silently to force a grade.

## Ground truth — screenshot diff + human verdict (G3/G4)

Objective grading needs reality's own evidence. Per design D6, mockify's ground-truth channel is **both**: the cheap-and-local screenshot diff, and the always-required human verdict — there is no external analytics system to arm (unlike designify's Looker gate).

To arm it:
- [ ] **The target app runs locally** — Playwright captures of built routes only work against a running dev server; if it isn't running, the diff step is `skipped-with-reason`, recorded, not silent.
- [ ] **Routes mapped to their winning mockup files** — from the mock-ledger §3 screens table, so the diff is repeatable per screen.
- [ ] **Playwright MCP tools available** (`browser-testing` skill) — the capture mechanism; recon and feedback both degrade to code-read/skip-with-reason without it.
- [ ] **Human verdict always collected**, regardless of screenshot-diff availability — it is the richer signal (corrections made during implementation), not a fallback.

The captured screenshots and per-screen diffs are mission evidence: they live in the mission dir (`_context/{project}/mockify/{slug}/`), NEVER in this plugin. Only generalized entries (anti-pattern + markers + context class) cross back into packs/traps.

## Exemplar anchors — the calibration substrate

`../references/exemplars/README.md` defines the entry kind; a grade is only as good as the anchors it is measured against.

- [ ] **Fable-direct distillations** — accepted spec+mockup pairs from frontier-direct missions, distilled + redacted. These are what "good" looked like: direction chosen, distilled judge standards, usability-argument quality. New entries only from a model at least that strong.
- [ ] **Self-containment holds** — a judge briefed with only the exemplars dir can apply the standards; `_context/` pointers are optional and `local-only`.

Before G2/G3: if the relevant anchor slot is empty, seeding it IS the setup step — do it first, or run the grade knowing it has no anchor and say so in the header.

## Filing results (all contexts)

- **Full analysis** (real screens, real app data) → the mission dir under `_context/{project}/mockify/`. Never here (INV-3, modified per D7).
- **Generalized entries** → plugin traps/packs: anti-pattern + markers + context class. No real user/customer data, no mission-specific screens pasted into the plugin (the validator's `privacy` scope enforces this). Component/token names are fine (D7).
- **`capability` residue** → `../references/capability-gap.md` only, per its schema.
- **Exemplar-worthy runs** → `../references/exemplars/`, redacted per its README.
- Log the grade in the mission ledger (`../references/templates/mock-ledger.md`) so the session is handoff-ready.

## Go / no-go — the one-screen gate

Run only when all are yes:

1. Rubrics on disk and in the dispatch (not from memory)?
2. The anchor this grade needs is present (or its absence is stated in the header)?
3. For G3: is the blind quarantine intact and the brief identical across runs?
4. For G3/G4: is the ground-truth channel (screenshot diff) armed, or is the degraded mode named explicitly?
5. Is every verdict going to carry evidence + closed vocabulary + a flip condition?

Any `no` → set it up first. A grading session is cheap to delay and expensive to redo — a contaminated calibration or an anchorless gate cannot be trusted after the fact, only re-run.

## Standing discipline

- No time estimates anywhere — questions, headers, ledgers (INV-4). Bounds are artifact counts.
- Honest bands only; no fake numeric precision in any quality judgment.
- Real screens and app data stay in the mission dir (INV-3 modified per D7); this skill and everything it seeds hold method + generalized app-design craft only.
