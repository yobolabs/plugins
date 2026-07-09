---
name: mockify
description: Run the mockify loop — turn an app feature or redesign need into a buildable design spec plus self-contained HTML mockups through ecosystem recon, 2–3 concept directions, a human pick, director deepening, adversarial crit, and a usability-first judge gate. Also hosts `mockify feedback <slug>` for post-implementation grading. Use when the user says "mockify", "design the app", "design this screen", "design this feature", "mock up", "mockups for", "app design direction", "redesign the <x> page", or "UI spec for" a feature.
---

# Mockify — the loop

You are orchestrating app design, not generating it. The two coupled deliverables this loop produces (design D1) — `spec.md` a non-author can build from, and `mockups/*.html` as spec evidence, not decoration — feed feature-lifecycle, dev-team, and human designers alike. Every dispatch below originates here — **subagents never spawn subagents** (INV-2).

Templates, rubrics, packs, and traps live under `../references/`. The agents (`mock-recon`, `mock-director`, `mock-critic`, `mock-judge`) are this plugin's four roles.

## Care level

Ask once at intake, or infer and confirm:
- **quick** — 2 concept directions, light crit (design-system-drift scan + trap scan only)
- **deep** — 3 concept directions, full five-class crit

Bounds are artifact counts, never time.

## The loop (steps 0–9)

### 0. Intake — brainstorm-style, one question at a time
- Assemble `../references/templates/mission-brief.md` interactively — **one question per message, inline, no popups**: target app + repo path, screen/feature scope (new feature / redesign / net-new app), persona + job-to-be-done, goal, care level.
- **Entity resolution before ANYTHING renders** (mirrored into `../references/templates/mock-ledger.md`): app → exact repo path · design system → `DESIGN.md` path + theme/token source files · screens in scope → exact route list · framework components → package path · output dir. Wrong-app / wrong-design-system / wrong-route mistakes die here or not at all.
- Create the mission dir: `_context/{project}/mockify/{slug}/` with a `mockups/` subdir. Mission artifacts (real screens, briefs, user data) live there — never in this plugin (INV-3 as modified by D7).

### 1. Recon — dispatch `mock-recon` (read-only)
Send: mission brief. Expect back the six-part fact base — design-system facts (tokens, themes, the `@jetdevs/framework` component inventory + the app's `DESIGN.md`), existing-screen sweep (Playwright screenshots when the app runs locally, code-read otherwise), app architecture + what data each screen can actually reach, user/flow context, pattern hunts (perishable, INV-5), standing UX rules — every claim tagged `checked` / `reasoned` / `guessing` / `dont-know`. A `dont-know` on anything load-bearing gets hunted or surfaced to the user before step 3.

### 2. Rule manifest — skill step, here
Extract THIS mission's constraints as numbered **M-rules** into the brief: design-system conformance (named tokens/components), accessibility (WCAG contrast, touch targets, focus order), responsive rules per breakpoint + iOS Safari, i18n slots, standing UX rules (no toasts, etc.), app-specific invariants. The manifest travels with EVERY subsequent dispatch; conformance is checked per rule number, not by vibes.

### 3. Concept fan-out — dispatch `mock-director` in concept mode, 2–3× in parallel
Each dispatch gets: brief + M-rules + recon fact base + the pack set + a **distinct direction seed** (different IA/layout/interaction bet, written from recon findings, not generic style names). Expect back one `../references/templates/concept-card.md` each, plus 1–2 key-screen mockups at `mockups/{slug}-concept-{letter}-{screen}.html`. **Publish each direction's mockups as Artifacts** (hosted pages) so the human can click through them at the pick gate.

### 4. Pick — HUMAN GATE
Dispatch `mock-judge` (concept-scoring context) to score the cards on `../references/rubrics/concept-selection.md` — audience/job fit, usability argument, distinctiveness, execution risk. Present artifact links + cards + scores inline. **The user picks. The judge informs; it never decides.** Record rejected directions with one-line why-nots in the mission dir (calibration feed).

### 5. Deepen — dispatch `mock-director` in deepen mode, once
Send: winning concept card + brief + M-rules + recon fact base + ALL six packs + ALL five traps. Expect back the full screen set at `mockups/{slug}-{screen}.html` plus the spec draft per `../references/templates/spec-file.md`. **Validity rule:** every screen carries its full states matrix AND its responsive spec AND its avoid-list — a draft violating it is returned, not patched here.

### 6. Crit — dispatch `mock-critic`
Send: draft + M-rules + recon fact base + traps + packs. Expect the crit report (`../references/templates/crit-report.md`) across the five attack classes — design-system-drift scan, accessibility attack, UX anti-pattern scan, state/responsive-coverage challenge, implementability attack — every finding evidence-cited (trap id, M-rule number, or recon marker), falsifiable, with severity **kills-the-screen / hurts / cosmetic**. Then dispatch the director once to revise against the findings.
- **Zero-hit protocol:** a crit that lands nothing is suspect. It must carry a per-attack-class justification block; you may re-dispatch ONCE with a stricter instruction; a second zero-hit stands, justification recorded in the spec's integrity note. No forced findings, no loops.

### 7. Judge gate — dispatch `mock-judge` (final-gate context)
Scores the revised spec + mockups: **usability first**, then design-system fit, visual craft, completeness (states/breakpoints), implementability. Closed vocabulary: **accept / one-more-pass** (+ flip condition, per `../references/rubrics/verdict-integrity.md`). One-more-pass names exactly what's missing → max ONE director revision cycle → re-score. A second non-accept stands recorded with its named gaps in the integrity note — **the human decides whether to hand off, not the loop**.

### 8. Assemble
Write `spec.md` in the mission dir per the template, final mockups at `mockups/{slug}-{screen}.html`. Append the integrity note YOURSELF, below the spec's eight numbered sections (crit hit counts per attack class, zero-hit justification if any, judge verdict trail, rejected-concept pointer) — the integrity note is the orchestrator's, never the director's. Offer handoff paths inline — **no execute skill in v1 (D4)**:
- `feature-lifecycle` or `fable-lifecycle` — the spec is the feature's input
- dev-team direct — hand spec + mockups to the implementation pipeline
- hand the spec to a human designer-developer (it is self-sufficient: sections 1–8)

### 9. Feedback — MANDATORY, not polish
When the implementation ships, run `mockify feedback <slug>` (below). Every human correction during ANY step is a candidate trap/pack entry — capture it in the ledger as it happens. Skipping feedback is how the framework stops improving.

## `mockify feedback <slug>` — post-implementation grading

Resolve the slug against `_context/{project}/mockify/`, land in exactly one state:

| State | Condition | Writes |
|---|---|---|
| `slug-not-found` | no mission dir matches | nothing — list available slugs |
| `not_implemented` | spec never picked up | status note in mission dir; NO plugin entries |
| `in_progress` | implementation underway | interim note + corrections-so-far in ledger; NO plugin entries |
| `insufficient_data` | shipped but minimum fields missing | gap list in ledger; NO plugin entries |
| `complete` | all minimum fields present | full analysis → mission dir; **generalized** entries → plugin traps/packs |

Minimum fields for `complete`: implementation-shipped confirmation · **human verdict per spec section** (followed / diverged-better / diverged-worse / dropped, with the correction that caused it) · **screenshot diff** where the app runs locally (Playwright captures of built routes vs winning mockups; skipped-with-reason otherwise — a skip is recorded, not silent) · verdict per spec-file feedback-hook prediction (hit / miss / inconclusive).

Generalization rule for plugin entries: anti-pattern + markers + context class. Never real user/customer data, never mission-specific screens pasted into the plugin (D7 boundary; the validator's privacy scope enforces it). Component/token names are fine.

## Standing discipline

- No time estimates anywhere — in questions, cards, specs, or feedback (INV-4).
- Honest bands, no fake numeric precision, ever.
- Packs are durable craft; anything perishable (current component API surface, what this pattern space looks like right now) comes from recon THIS mission, and goes stale with it (INV-5).
- Mockups are self-contained HTML — inline CSS/JS, assets as data URIs; Artifact CSP blocks external fetches.
