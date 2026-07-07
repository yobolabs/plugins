---
name: simulate
description: Blind-replay a past campaign whose creative performance is already known (Looker) — reconstruct the night-before picture, run the designify loop blind, predict the shipped variants' performance rank, then reveal and compare. The trainer and continuous calibration channel. Use when the user says "designify simulate", "blind replay", "replay that campaign's creatives", "train designify on history", or wants to measure the framework against real outcomes.
---

# Simulate — blind replay on graded history

Reality already graded these exams. Replaying them blind is the cheapest calibration signal any member of the wargame family has — no sibling gets objective per-artifact scores this cheaply (design D10).

## Protocol

### 1. Pick the campaign
A past campaign whose creative performance is known (Looker: per-asset engagement, winner identification). Prefer campaigns this framework (and its authors) haven't studied — a replay you've already discussed is contaminated; note any known contamination in the analysis header.

### 2. Quarantine the results — HARD RULE
Reconstruct the **night-before picture only**: the brief as it stood, audience/segment, offer, placements, brand kit, and the assets as-shipped (descriptions/files — not their performance). Nobody in the loop — no agent dispatch, no prompt — sees outcomes until step 4. If outcome data leaks into any dispatch, the replay is void; restart with a different campaign.

### 3. Run the loop blind
Full designify loop (steps 1–7; intake replaced by the reconstructed brief) against the night-before picture. Produce:
- the craft file the framework WOULD have shipped, and
- **the prediction:** rank the actually-shipped creative variants by expected performance, with a one-line mechanism ("expected winner: variant B — strongest hook at glance-speed") — honest bands, no fake precision.

### 4. Reveal and compare — four buckets
| Bucket | Meaning | Goes to |
|---|---|---|
| **directed + worked** | the craft file directed what reality rewarded | credit; exemplar material (`../references/exemplars/`, redacted) |
| **missed what worked** | reality rewarded something the framework didn't direct | gap → trap/pack entry; classify procedure / knowledge / capability (capability → `../references/capability-gap.md`) |
| **directed + never tried** | the framework directed something never shipped | free live backlog for the next real campaign — a side benefit no adversarial sibling has |
| **prediction vs actual rank** | rank accuracy per variant | calibrates the judge's conversion dimension; log hit / miss / inconclusive per prediction |

### 5. File the results
- **Full analysis** (real numbers, real merchant) → `_context/{project}/design/replays/{slug}.md`.
- **Generalized entries** (anti-pattern + markers + context class — never names or numbers, INV-3) → plugin traps/packs.
- Exemplar-worthy runs → `exemplars/`, redacted per its README.

## Cadence

One replay validates the pipe (STORY-010); a standing habit compounds. After any campaign with clean Looker data closes, it is replay-eligible. Track cumulative prediction accuracy across replays — that trend line IS the framework's report card, and feeds the measured %-of-Fable calibration number (specs §6.6).
