# Ranking Rubric — how the portfolio orders

Binds `growth-judge` after the gate. Ranks **advance-verdict candidates only** (killed and flagged never rank). Honest bands throughout — no invented percentages, no false precision, and **no effort or time dimension of any kind**: reversibility and instrumentation cost carry the "how hard" signal without schedule language. <!-- validator:allow -->

## Dimensions

### 1. Impact potential — {small | moderate | large}
Anchored to precedent: the class of movement the cited cases actually produced on the same metric family, adjusted for product-fit. A candidate with no precedent caps at `moderate` no matter how exciting the theory.

### 2. Evidence grade — {A | B | C}
- **A** — multiple cited cases (case library or recon hunts, dated sources) + a coherent mechanism theory.
- **B** — one solid cited case, OR strong mechanism theory with clear preconditions met.
- **C** — plausible-only. C-grade candidates may advance but never above a B-grade with comparable impact, and their experiment cards must say `evidence: C — this test IS the evidence`.

### 3. Reversibility / blast radius — {flag-gated | ship-and-kill | one-way}
- **flag-gated** — behind a feature flag, per-segment, instant off. Floats UP the ranking.
- **ship-and-kill** — removable, but users will have seen it (pricing display, badge economies).
- **one-way** — hard to retract without trust damage (loyalty currency devaluation, public leaderboards, pricing structure). Sinks DOWN and triggers the "wargame the build" escalation offer.

### 4. Product fit — {native | adjacent | stretch}
Stage, brand voice, segment psychology. `stretch` is legal (sometimes the stretch IS the insight) but must name what has to be true for it to land.

### 5. Instrumentation cost — {measured-today | small-build | new-surface}
What must exist before the experiment can read out. `new-surface` (needs events/pipelines that don't exist) is a real cost — cards carrying it rank below equals that can read out on existing instrumentation.

## Ordering rule
Rank lexicographically by: evidence-weighted impact first (A-large > B-large ≥ A-moderate > …), then reversibility (flag-gated up), then instrumentation (measured-today up), then fit. Ties are legal — say so rather than inventing separation.

**Structural-precondition override** — a mechanic that is the structural precondition for other portfolio members (its ABSENCE makes their primary metric un-producible: no autonomous runs → empty digest → empty inbox → nothing to win back) floats ABOVE evidence-grade lexicography. Rank it first even at a lower evidence grade, tag it `structural-precondition`, and name the dependency it unblocks.

## Output row (matches growth-brief §2)
`| rank | mechanism | lens | impact class | evidence grade | reversibility | fit | verdict |`

## Prohibitions
- No numeric scores, no weighted averages, no pseudo-precision ("7.5/10"). Bands + ordering rule only.
- No effort, size, or schedule column. <!-- validator:allow -->
- Impact class may never exceed what the cited precedent class supports.
