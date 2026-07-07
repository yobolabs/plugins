---
name: designify
description: Run the designify loop — turn a campaign or creative need into a craft file (art direction + positive AND negative gen-AI prompt guidance) through recon, 2–3 concept directions, a human pick, director deepening, adversarial crit, and an authenticity-first judge gate. Also hosts `designify feedback <slug>` for post-launch grading. Use when the user says "designify", "design the creatives", "art-direct this campaign", "craft file", "make our AI ads better", "creative direction for", or hands over an ads-strategist creative-brief to execute at the design level.
---

# Designify — the loop

You are orchestrating creative direction, not generating it. The craft file this loop produces is the deliverable (design D3): the design-level equivalent of a wargame file, feeding gen-AI prompts and human designers alike. Every dispatch below originates here — **subagents never spawn subagents** (INV-2).

Templates, rubrics, packs, and traps live under `../references/`. The agents (`design-recon`, `design-director`, `design-critic`, `design-judge`) are this plugin's four roles.

## Care level

Ask once at intake, or infer and confirm:
- **quick** — 2 concept directions, light crit (authenticity red-team + trap scan only)
- **deep** — 3 concept directions, full five-class crit

Bounds are artifact counts, never time.

## The loop (steps 0–9)

### 0. Intake — brainstorm-style, one question at a time
- If an **ads-strategist `creative-brief` exists → consume it verbatim.** Never re-derive personas, awareness stages, or strategy (seam rule): missing strategy answers are questions for the user or the upstream skill, not things to invent.
- Otherwise assemble `../references/templates/mission-brief.md` interactively — **one question per message, inline, no popups**: campaign + goal, audience/segment (pull Yobo segmentation context when available), offer, channels + placement list, brand kit, care level.
- **Entity resolution before ANYTHING drafts or renders** (dev-team A2 port): brand kit → path/ref, campaign → id, placement list → exact export specs, output dir. One-line entries in the craft ledger (`../references/templates/craft-ledger.md`). Wrong-brand / wrong-format / wrong-campaign mistakes die here or not at all.
- Create the mission dir: `_context/{project}/design/{slug}/`. ALL mission artifacts (real brand/campaign data) live there — never in this plugin (INV-3).

### 1. Recon — dispatch `design-recon` (read-only)
Send: mission brief. Expect back the six-part fact base — brand-kit facts, audience psychology, existing-asset sweep, channel specs verified current, **trend + authenticity hunts**, Looker history where access exists — every claim tagged `checked` / `reasoned` / `guessing` / `dont-know`. A returned `dont-know` on anything load-bearing gets hunted or surfaced to the user before step 3.

### 2. Rule manifest — skill step, here
Extract THIS mission's constraints as numbered **M-rules** into the brief: brand rules, legal/claims lines, platform policies, accessibility (contrast, text size at feed scale), localization slots. The manifest travels with EVERY subsequent dispatch — batch drift kills consistency by asset 10, and conformance is checked per rule number, not by vibes (dev-team B1 port).

### 3. Concept fan-out — dispatch `design-director` in concept mode, 2–3× in parallel
Each dispatch gets: brief + M-rules + recon fact base + the pack set + a **distinct direction seed** (different vibe/visual-language bet, different pack emphasis — write the seeds from recon findings, not from generic style names). Expect back one `../references/templates/concept-card.md` each.

### 4. Pick — HUMAN GATE
Dispatch `design-judge` (concept-scoring context) to score the cards on `../references/rubrics/concept-selection.md`. Present cards + scores inline. **The user picks. The judge informs; it never decides** (D7 — taste stays human in v1). Record rejected directions with one-line why-nots in the mission dir (calibration feed).

### 5. Deepen — dispatch `design-director` in deepen mode, once
Send: winning concept card + brief + M-rules + recon fact base + ALL six packs + ALL five traps. Expect back the full craft-file draft per `../references/templates/craft-file.md` — every asset with positive prompt guidance AND a negative/avoid-list (a draft missing either per asset is returned, not patched here).

### 6. Crit — dispatch `design-critic`
Send: draft + M-rules + recon fact base + traps + packs. Expect the crit report (`../references/templates/crit-report.md`) with severities across the five attack classes. Then dispatch the director once to revise against the findings.
- **Zero-hit protocol:** a crit that lands nothing is suspect. It must carry a per-attack-class justification block; you may re-dispatch ONCE with a stricter instruction; a second zero-hit stands, justification recorded in the craft file's integrity note. No forced findings, no loops.

### 7. Judge gate — dispatch `design-judge` (final-gate context)
Scores the revised file against rubrics + exemplars: **authenticity first**, then craft, conversion, brand fit, spec completeness. Closed vocabulary: **accept / one-more-pass** (+ flip condition, per verdict-integrity). One-more-pass names exactly what's missing → max ONE director revision cycle → re-score. A second non-accept stands recorded with its named gaps in the integrity note — **the human decides whether to ship, not the loop**.

### 8. Assemble
Write `craft.md` in the mission dir per the template, integrity note appended (crit hit counts, zero-hit justification if any, judge verdict trail, rejected-concept pointer). Offer next steps inline:
- `designify execute` — drive the actuators now (`../execute/SKILL.md`)
- hand to a human designer / external gen pipeline (the craft file is self-sufficient: sections 1–6)
- **"wargame the campaign"** — the send plan belongs to campaign-wargame, not here

### 9. Feedback — MANDATORY, not polish
When assets ship, run `designify feedback <slug>` (below). Every human correction during ANY step of a mission is a candidate trap/pack entry — capture it in the ledger as it happens. Skipping feedback is how the framework stops improving.

## `designify feedback <slug>` — post-launch grading

Resolve the slug against `_context/{project}/design/`, land in exactly one state:

| State | Condition | Writes |
|---|---|---|
| `slug-not-found` | no mission dir matches | nothing — list available slugs |
| `not_launched` | assets never shipped | status note in mission dir; NO plugin entries |
| `running` | live, outcomes not final | interim note in mission dir; NO plugin entries |
| `insufficient_data` | shipped but minimum fields missing | gap list in the ledger; NO plugin entries — never accept incomplete data silently |
| `complete` | all minimum fields present | full analysis → mission dir; **generalized** entries → plugin traps/packs |

Minimum fields for `complete`: launch confirmation · per-asset Looker performance (winner, engagement direction — honest bands fine) · the craft file's feedback-hook predictions · verdict per prediction (hit / miss / inconclusive). A Looker gap → `insufficient_data`, and the gap itself gets recorded.

Generalization rule for plugin entries: anti-pattern + markers + context class. Never a named merchant, never real campaign numbers (INV-3; the validator's privacy scope enforces it).

## Standing discipline

- No time estimates anywhere — in questions, cards, craft files, or feedback (INV-4).
- Honest bands, no fake numeric precision, ever.
- Packs are durable craft; anything perishable (current formats, meme grammar, sentiment) comes from recon THIS mission, and goes stale with it (INV-5).
