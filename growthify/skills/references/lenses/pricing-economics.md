# Pricing & Economics — lens pack

## Scope
The money decision: what to charge, how to present it, where the paywall sits, how discounts behave, how packaging shapes willingness to pay. Sees paid conversion, ARPU/expansion, and the psychology of price perception. Ignores traffic and habit; co-owns trial design with friction-cro (they own the flow, this lens owns the offer) and referral economics with incentives-game-theory (they own the mechanism, this lens owns the price effects).

## Core models

**Reference-price psychology.** Buyers never evaluate price absolutely — always against a reference. You can SET the reference: *anchoring* (the first/highest number seen frames everything after — enterprise tier priced high partly to make the mid-tier read cheap); *decoy/asymmetric dominance* (an option clearly worse than one neighbor steers choice to the dominator — classic: small $5 / large $7 becomes small $5 / medium $6.50 / large $7, and large wins); *framing units* (per-seat/per-month/per-order reframe the same total against different mental budgets; "less than your daily coffee" moves the comparison class).

**Value-metric alignment.** The unit you charge by is the strategy: the right value metric scales price WITH the customer's realized value (per-seat, per-order, per-GB, per-location), making expansion automatic and entry cheap. Test: (1) does the metric grow when the customer wins? (2) is it legible before purchase? (3) does it punish the behavior you want? (charging per-message on a product whose value is messaging throttles usage — a self-defeating metric). Wrong metric = permanent growth tax; changing it later is a one-way door (repricing existing customers).

**Paywall & trial economics.** Three placements, three failure shapes: *free-tier/freemium* (widest top, monetizes single-digit %, risks a free tier good enough to live in forever); *trial-with-wall* (value first then decision — time-based trials pressure calendars, usage-based trials pressure value moments; usage-based generally converts more honestly); *hard wall/demo-first* (B2B norm; converts trust built elsewhere). Placement rule: the wall goes AFTER the aha, BEFORE the habit is fully free-fed — pay-me-before-value converts desperate users only; everything-free-forever converts nobody.

**Discount game theory.** A discount is a signal and a training program, not just a price cut. Predictable sales train waiting (customers learn the November price IS the price); list-price integrity with targeted, reasoned exceptions (student, annual, launch, hardship) preserves the reference while capturing price-sensitive segments. Personalized/opaque discounting risks fairness blowups when discovered (and it gets discovered). Every discount needs a REASON the full-price buyer would accept as fair — that's the test that keeps the reference price intact.

## Mechanism inventory

### Anchor & decoy tier architecture
- **What:** 3-tier menus engineered around the target tier: high anchor above, decoy below, "recommended" label on the one most users should honestly pick.
- **Psychology basis:** anchoring; asymmetric dominance; paradox-of-choice curation (3 beats 7).
- **Preconditions:** real feature/value differences between tiers (decoys must be honest products someone could rationally want); the recommended tier genuinely recommendable.
- **Failure modes:** anchor tier so empty it reads as a joke (damages trust in the whole menu); >4 options re-introducing choice paralysis; "recommended" serving revenue over fit (consent-erosion boundary — the label must survive scrutiny).

### Value-metric repricing / packaging
- **What:** move the price axis onto the unit that tracks customer value — per-seat→per-usage, flat→per-location, tier caps on the value metric with graceful overage.
- **Psychology basis:** value-metric alignment; fairness perception (price grows because you grew).
- **Preconditions:** the metric passes the three-question test; billing infrastructure can meter it; overage handling designed (surprise bills = trust damage, hidden-costs boundary).
- **Failure modes:** metering the value-creating behavior itself (self-throttling); illegible metrics buyers can't predict (kills the purchase — pair with calculators/estimates); REPRICING EXISTING CUSTOMERS: one-way door, grandfathering + notice or trust never recovers — always offer the wargame escalation.

### Usage-based trial with value-moment wall
- **What:** trial bounded by usage (N projects, N sends, N orders) rather than the calendar, with the wall firing at a measured value moment ("your 10th report — this is where teams upgrade").
- **Psychology basis:** endowment (they've built value inside); reciprocity; the wall lands at peak realized value, not an arbitrary date.
- **Preconditions:** aha + value moments instrumented (friction-cro coordination); usage bound sized so the aha fits comfortably inside.
- **Failure modes:** bound too tight (walled before value = desperate-only conversion); too loose (free-living); calendar trials on slow-adoption products (the deadline fires before value does — usage bounds fix exactly this).

### Freemium ceiling engineering
- **What:** design WHAT the free tier lacks around the natural growth path — free until team-size N, until publish, until custom domain — so upgrading is triggered by the user's own success.
- **Psychology basis:** value-metric alignment applied to the free boundary; success-triggered upgrade framing (positive moment, not punishment).
- **Preconditions:** a legible success line users cross visibly; free tier still genuinely useful (bait-and-switch free tiers poison acquisition).
- **Failure modes:** ceiling on a vanity dimension nobody hits; free tier so complete the ceiling never binds (the live-in-free-forever trap); ceiling communicated as punishment at the moment of success (frame as graduation, not fine).

### Annual pre-commit & expansion offers
- **What:** annual plans framed as commitment-with-reward (2 months' equivalent discount convention), expansion prompts timed to usage thresholds, upgrade offers at renewal peaks.
- **Psychology basis:** commitment device (incentives-game-theory co-own); reference-price integrity (the annual discount has a REASON: churn risk transfer).
- **Preconditions:** retention curve supports annual honesty (selling annual on a product people quit monthly = refund war); expansion triggers from real usage data.
- **Failure modes:** auto-renew without notice (forced-continuity, S2–S3 by jurisdiction — renewal notice is both law and good economics); discount stacking eroding the reference; expansion nags untethered from usage (reads as greed).

### Reasoned-discount targeting
- **What:** structured exceptions with public reasons — launch pricing (dated, real), student/nonprofit tiers, win-back offers with a stated basis, hardship policies.
- **Psychology basis:** discount game theory — every cut carries a fairness story that protects the list price.
- **Preconditions:** the reason is checkable (edu email, launch date real); finance guardrails on discount depth/frequency.
- **Failure modes:** predictable seasonal sales training the wait (the signature self-inflicted wound); secret personalized pricing discovered (fairness blowup); win-back discounts training deliberate churn (cap per lifetime; coordinate with the recovery-flow anti-pattern in friction-cro).

### Price-framing & unit reframes
- **What:** present the same economics against a friendlier mental budget — per-day price equivalents for annual tools, per-order for commerce fees, savings-vs-alternative calculators, ROI framings for B2B. <!-- validator:allow — price-unit framing, not a schedule -->
- **Psychology basis:** framing units; comparison-class control.
- **Preconditions:** the reframe is arithmetically honest and checkable; the comparison class defensible (comparing to the thing it actually replaces).
- **Failure modes:** cutesy reframes on serious buyers (B2B CFOs want the annual number); drip-priced "from $X" framings that unravel at checkout (hidden-costs dark pattern, S2–S3); calculators with thumb-on-scale assumptions (checked, then trust-dead).

## Signature questions
1. What reference price does the buyer walk in with — and which mechanism (anchor, decoy, unit reframe) sets a better one honestly?
2. What unit does customer value ACTUALLY scale with — and is that what we charge by? (If not: what's the migration cost, and is it a one-way door?)
3. Where is the aha relative to the wall — does anyone hit the paywall before feeling the value, or live free forever after it?
4. What would a usage-based trial bound look like for this product, and what's the measured value moment the wall should fire on?
5. Every discount currently offered: what's its reason, and would a full-price customer accept that reason as fair?
6. What does the buyer's success look like, and can the free/tier ceiling sit exactly on it?

## Metric-family mapping
- **Moves best:** free→paid conversion, trial conversion, ARPU, expansion revenue, plan-mix.
- **Secondary:** churn (annual mix, value-metric fairness), acquisition (freemium top-width; with social-viral), LTV.
- **Does NOT move:** habit/frequency (hooks-habit), invite loops (social-viral), step-level funnel friction (friction-cro owns the flow to the buy button; this lens owns what's on it).

## Case pointers
`economist-decoy` · `slack-fair-billing` · `dropbox-freemium-ceiling` · `netflix-price-anchor-shift` · `jcpenney-no-discount-disaster` · `adobe-subscription-transition` · `superhuman-onboarding-wall` · `zoom-40min-ceiling`

## Anti-patterns
- Charging by the unit that punishes the value behavior (per-message on a messaging product) — the self-throttling metric.
- Repricing existing customers casually — it is a ONE-WAY DOOR; grandfather, notice, wargame.
- Sales calendars that train waiting; discounts without a fairness reason.
- Copying a competitor's pricing page without their cost structure or segment — pricing is strategy, not decoration.
- More than 4 visible tiers; anchors nobody could rationally buy; "recommended" labels serving margin over fit.
- Nearest dark-pattern boundary: **hidden-costs** (drip pricing, checkout-step fees), **forced-continuity** (silent auto-renew, cancel mazes), **fabricated-scarcity** (fake "offer ends" timers). The fairness test: every price presentation must survive the buyer seeing the full picture at once.
