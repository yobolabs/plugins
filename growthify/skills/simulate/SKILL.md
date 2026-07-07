---
name: simulate
description: Use to train growthify on the team's own history — "blind replay", "growthify simulate", "replay a past growth initiative", "replay that launch/pricing change", "train growthify on history". Runs the growthify loop blind against a past initiative whose outcomes are already known, then reveals reality and scores the difference into insights and exemplars. NOT for practicing marketing-campaign war-games on past campaign sends — that is campaign-wargame:simulate; this skill replays GROWTH initiatives (feature launches, pricing changes, mechanic rollouts) through the growthify generation loop.
---

# Simulate — blind replay on history

The fastest calibration is your own past: reality already graded the exam, ground truth is free, nothing gets shipped. A replay runs the full growthify loop against the night-before picture of a past initiative, WITHOUT peeking at what happened, then compares.

## The five steps

### 1. Pick a past initiative with known outcomes
Good picks: a launch that surprised (best), one that flopped, one that worked but nobody knows why. Need: enough to reconstruct the pre-launch picture AND the actual results (metric movement, adoption, backlash — wherever they live).

### 2. Quarantine the results
Whoever runs the replay must NOT look at the outcomes. Reconstruct only the night-before picture into a mission-brief (`../references/templates/mission-brief.md`): the metric/surface as it was, the segment as it was, constraints as they were. Facts tagged from what was knowable THEN.

### 3. Run the growthify loop blind
Execute the full seven-step procedure from `../growthify/SKILL.md` (do not duplicate it here) against the reconstructed brief — recon, lens fan-out, judge gate, deepen, assemble. The blind growth-brief lands in `_context/{project}/growth/replays/{slug}-blind/`.

### 4. Reveal and compare — exactly four buckets
| Bucket | Meaning | Routes to |
|---|---|---|
| **generated + worked** | the blind run proposed what reality validated | exemplar material → `../references/exemplars/` (redacted schema) |
| **missed what worked** | reality's winner never surfaced in the blind run | insight entry → `../references/insights/` + consider a lens patch (which pack SHOULD have caught it?) |
| **generated + never tried** | blind-run candidates the team never attempted | live backlog — hand to the requester as free candidates (a side benefit the adversarial siblings lack) |
| **impact prediction vs actual** | magnitude-class error on what WAS tried | magnitude-calibration insight → `../references/insights/` |

### 5. Route the artifacts
- Full comparison analysis (real numbers) → `_context/{project}/growth/replays/{slug}/`.
- Generalized entries → `../references/insights/` per its README convention (no raw metrics, no merchant names).
- A blind run strong across buckets → exemplar index entry per the redacted schema (mission class, lens set, judge standards, outcome classes only).

## Discipline
- Quarantine is absolute: a peeked replay is void — restart with a different initiative.
- Score honestly: over-caution (predicted-failure that didn't happen) is a finding too; note patterns.
- Every replay must add at least one insight or one exemplar — a replay that adds nothing was graded dishonestly.
- No durations anywhere. <!-- validator:allow -->
