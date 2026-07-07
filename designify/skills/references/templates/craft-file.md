# Craft File — <campaign / slug>

> The deliverable. Executable by a non-author — a teammate, a human designer, or a downstream gen pipeline — from sections 1–6 alone, with no context of the run.
> **Validity rule:** every per-asset section carries BOTH a positive-prompt block AND a negative-prompts / avoid-list block. A craft file missing an avoid-list on any asset is INVALID — the judge may not accept it.
> Honest bands everywhere; no invented percentages in predictions.

## 1. Mission summary
Campaign: <> · Audience/segment: <> · Offer: <> · Placements: <list> · Brand kit: <resolved ref> · Care level: <quick | deep>

## 2. M-rules
The manifest that traveled with every dispatch. Downstream conformance is checked per rule number — quote them exactly as numbered in the mission brief.

| # | Class | Rule |
|---|---|---|
| M1 | <class> | <rule> |

## 3. Chosen direction
<Vibe/theme/visual language of the winning concept + why it fits this audience — carried from the winning concept card, sharpened by the deepen pass.>

**Rejected directions:**
| Concept | One-line why-not |
|---|---|
| <id: name> | <the recorded reason — these why-nots stand; they feed calibration> |

## 4. Authenticity guardrails
Specific to THIS audience, from recon's hunts — never generic boilerplate. Every guardrail traces to a recon finding by tag.

- **Reads real to them:** <what recon found this audience responds to as genuine — cite tag>
- **Trips the fake-detector:** <the specific markers this audience punishes — cite recon evidence: what got ratio'd, which inauthenticity markers are live right now>
- **This direction's exposure:** <where the chosen direction runs closest to the line, and the guardrail that keeps it honest>

## 5. Per-asset sections
One per placement/format. Repeat the block. Every field filled — a blank field is a decision nobody made.

### Asset <n> — <placement / format>
- **Composition directive + visual-hierarchy order:** <what the eye hits 1st / 2nd / 3rd, and why that order sells the offer>
- **Color / type treatment:** <tied to brand kit refs — palette roles, type roles, scale at this placement's feed size>
- **Copy slots:** <headline slot · CTA slot — copy itself comes from ads-strategist ad-copy when present; this file never writes final copy>
- **Positive prompt guidance:** <gen-AI-ready prompt language for this asset: subject, composition, lighting, palette, style, mood — concrete nouns and art direction, no vibes-only adjectives>
- **Negative prompts / avoid-list:** <gen-AI-ready avoid phrasing. Each item cites its source — a trap entry id (`traps/<file>#<id>`) or a mission-specific recon marker. From traps: <…> · Mission-specific: <…>>
- **Platform spec:** <exact dims · safe zones · file limits · text rules — recon-verified current; mechanically checkable at L1>
- **Expected vs broken:** <what a good render shows, observably · what failure looks like, observably — this IS the L1/L2 checklist `execute` runs against the real render>

## 6. Batch discipline
- **Re-grounding checkpoints:** every <N, default 5> assets — M-rules still held, rule by rule? Drift check vs asset #1?
- **Watch-points:** <what to look for as the batch grows — palette creep, type-scale wobble, tone drift>
- **Stop conditions:** <the specific defects that STOP the batch — no judgment calls mid-render. Same defect across <N, default 3> generations = STOP + structured help request>

## 7. Open questions
<Surviving unknowns for merchant/team + what is assumed meanwhile.>

## 8. Feedback hook
Predictions to grade post-launch against Looker actuals (`designify feedback <slug>`). Honest bands, no invented numbers.

| Prediction | Basis |
|---|---|
| Which asset wins: <asset n> | <the craft reason — cite the directive that should earn it> |
| Expected reaction, per asset: <direction — up / flat / down vs campaign baseline> | <recon tag or rubric basis> |

---

## Integrity note
*Appended by the orchestrator — not authored by the director.*
Crit outcome: <hit counts per attack class · zero-hit justification if any> · Judge trail: <accept | one-more-pass gaps | recorded non-accept + named gaps> · Rejected-concept why-nots: <pointer to §3 table>
