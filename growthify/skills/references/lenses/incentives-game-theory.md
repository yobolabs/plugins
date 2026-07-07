# Incentives & Game Theory — lens pack

## Scope
Designed economies and strategic behavior: points, credits, tiers, referral payoffs, commitment devices, two-sided incentive structures, marketplace liquidity plays. Sees users as rational-ish agents responding to payoff structures — and designs structures whose equilibrium is the behavior we want. Ignores habit loops (hooks-habit) and message persuasion (friction-cro); its unit of analysis is the incentive, not the interface.

## Core models

**Mechanism design (reverse game theory), operationalized.** Don't predict behavior in a given system — design the system so self-interested play produces the target outcome. Working checklist: (1) name every player and their REAL payoff (incl. non-monetary: status, convenience, risk); (2) find the current equilibrium — what a self-interested player does today; (3) design the incentive so target behavior strictly dominates alternatives; (4) red-team the exploit: the mechanism's worst user is its real spec — ask "how do I extract maximum value while giving none?"; if the answer is profitable, the mechanism ships broken.

**Loss aversion & the endowment effect.** Losses hurt roughly twice as much as equivalent gains please. Operational forms: framing rewards as already-earned-and-losable beats promising the same as future gain ("your credits expire" > "earn credits" — LEGITIMATE only when the value is real and the expiry honest); trials that endow the full experience make downgrade feel like loss; tier systems where status can be LOST (with fair warning) retain harder than pure accumulation. The dark boundary: manufacturing fake losses = guilt-loops/fabricated-scarcity.

**Commitment devices.** Agents rationally bind their future selves: deposits forfeited on failure, public pledges, pre-purchases, scheduled defaults. Work because they change the future payoff matrix, not the user's willpower. Design rule: the user must OPT INTO the bind knowingly — an unchosen bind is forced-continuity.

**Two-sided referral economics.** A referral is a transaction with three payoffs: referrer reward, referee reward, and the referrer's SOCIAL cost of spending reputation. The social cost is the binding constraint — generous cash to the referrer with nothing for the referee reads as selling your friends and doesn't move. Both-sides rewards denominated in PRODUCT VALUE (credits, storage, service upgrades) — cheaper than cash, reinforce usage, and self-select for users who actually want the product. Payout on the referee's QUALIFYING ACTION (activation), never on signup — otherwise you've designed a fraud bounty (mechanism-design exploit check).

**Marketplace liquidity & cold start.** Two-sided value is nonlinear in density: below critical liquidity nothing works, above it everything compounds. Plays: subsidize the harder side (whichever side's absence kills the first session); shrink the market until density is achievable (one city, one category, one use-case) then replicate; single-player mode (the product delivers value to one side alone while the other side fills).

## Mechanism inventory

### Points & credit economies
- **What:** an internal currency earned by target behaviors, spent on real value (features, discounts, service).
- **Psychology basis:** mechanism design (payoff routing) + endowment (balances feel owned).
- **Preconditions:** a real value sink exists (points with nothing worth buying = decoration); earn-rates priced so the economy is sustainable at success-scale; behaviors rewarded are the ones that CAUSE retention/revenue, not vanity actions.
- **Failure modes:** liability balloon (unredeemed points = real liability at scale — cap, expire honestly, or fund); paying for behavior users already did free (crowding out intrinsic motivation); exploit loops (earn-spend cycles that mint value — run the worst-user check).

### Tier & status systems
- **What:** earned levels (silver/gold/platinum) carrying visible status + real perks, with maintenance requirements.
- **Psychology basis:** loss aversion on earned status; goal-gradient toward the next tier; social comparison.
- **Preconditions:** perks worth wanting at every tier; tier population pyramid managed (if half of users are top-tier, status is worthless); the maintenance bar honest and communicated.
- **Failure modes:** status inflation; demotion without warning (rage-churn — demotion needs notice + a rescue path); airline-style tier devaluation announcements (one-way-door: devaluing earned status is trust damage that never fully heals — wargame it first).

### Two-sided referral programs
- **What:** both-sides rewards in product currency, paid on referee qualification.
- **Psychology basis:** two-sided referral economics; reciprocity between friends.
- **Preconditions:** product retention healthy FIRST (referral multiplies the funnel — multiplying into churn wastes the spend); reward meaningful to both sides; qualification event = real activation.
- **Failure modes:** payout-on-signup fraud farms; single-sided generosity (social-cost failure); rewards in cash attracting mercenaries who churn (product-value denomination self-selects); program buried where sharers never see it (interacts with social-viral placement mechanics).

### Commitment devices & deposits
- **What:** user-chosen binds — goal deposits returned on completion, scheduled commitments with skin in the game, annual-plan pre-commitment framed as a self-binding choice.
- **Psychology basis:** commitment devices; loss aversion on the deposit.
- **Preconditions:** opt-in, transparent, escapable in genuine hardship (the bind must survive the user reading the terms); the committed behavior is one the user WANTS to want.
- **Failure modes:** binds that read as traps once noticed (forced-continuity boundary); deposits sized to punish rather than motivate; the product profiting from user FAILURE (misaligned mechanism — you now want them to fail).

### Earned-value expiry (honest loss framing)
- **What:** real value that genuinely expires (seasonal credits, use-or-lose allowances) with fair warning, driving usage cadence.
- **Psychology basis:** loss aversion, honestly applied.
- **Preconditions:** expiry real, warned, and defensible (accounting or capacity reason beats naked pressure); reminder cadence respectful.
- **Failure modes:** fake expiry (value quietly never expires — fabricated-scarcity dark pattern, S2); expiry as ambush (no warning = trust damage exceeding the usage gain); expiring PURCHASED value (regulatory exposure in several jurisdictions — S3, wargame before shipping).

### Side-subsidy & liquidity plays
- **What:** paying/over-serving the scarce side of a two-sided market until density: guaranteed earnings for early supply, free premium for early demand, category/city concentration.
- **Psychology basis:** marketplace liquidity model; mechanism design on the chicken-egg payoff.
- **Preconditions:** you know which side is binding (recon must answer this); subsidy has a planned taper tied to a density milestone; unit economics survive the subsidy window.
- **Failure modes:** subsidizing both sides forever (no equilibrium without the money hose); mercenary supply that leaves with the subsidy; taper cliff churning the side you bought (taper on milestones, not calendar).

### Gamified challenges & quests
- **What:** time-boxed or milestone-boxed challenges with defined rewards — usage quests, team competitions, seasonal events. <!-- validator:allow -->
- **Psychology basis:** goal-gradient; variable reward (hunt); social comparison in team forms.
- **Preconditions:** challenge behaviors map to real value creation; rewards from the points/tier economy (coherent, not parallel currencies); participation optional without penalty.
- **Failure modes:** quest fatigue (always-on events = new baseline, no lift); challenges rewarding volume over value (Goodhart: support tickets "resolved" fast and badly); pay-to-win creep in competitive forms (dark-pattern boundary).

## Signature questions
1. Who are the players, what are their REAL payoffs today, and what's the current equilibrium behavior?
2. What behavior do we want to dominate — and what does the WORST user do with the incentive we're considering (the exploit check)?
3. What value do users already hold here (balances, status, history) that honest loss-framing could activate?
4. If two-sided: which side is scarce, what's the social cost of a referral, and what's the qualifying event that defeats fraud?
5. Is there a value sink worth earning toward? If we mint a currency, what funds it at success-scale?
6. What would a user willingly bind their future self to — and does the bind survive them reading the terms?

## Metric-family mapping
- **Moves best:** referral rate, loyalty/repeat-purchase, marketplace liquidity (fill rate, both-side activation), redemption-driven retention.
- **Secondary:** paid conversion (annual pre-commit; with pricing-economics), engagement cadence via honest expiry.
- **Does NOT move:** first-visit conversion (friction-cro), organic habit formation (hooks-habit), raw acquisition (social-viral).

## Case pointers
`dropbox-referral` · `uber-driver-guarantees` · `starbucks-rewards-liability` · `duolingo-streak-freeze` · `paypal-referral-bootstrap` · `airline-status-devaluation-backlash` · `opentable-points-liquidity`

## Anti-patterns
- Currency without a sink; tiers without wanted perks — economies of decoration.
- Rewarding the metric instead of the behavior that causes it (Goodhart bait — the judge will check, design for it now).
- Cash where product-value would do — attracts mercenaries, costs more, teaches nothing.
- Skipping the worst-user exploit check — every incentive is a contract with your most adversarial user.
- Nearest dark-pattern boundary: **fabricated-scarcity** (fake expiry), **forced-continuity** (unchosen binds), **pay-to-win-misdirection** (competitive mechanics silently favoring spenders). Devaluing earned status/currency is a ONE-WAY DOOR — always offer the wargame escalation.
