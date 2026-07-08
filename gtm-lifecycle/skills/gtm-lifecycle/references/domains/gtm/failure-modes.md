---
domain: gtm
updated: 2026-07-06
half_life: 1y
missions: 0
---

# GTM — Failure Modes

Format: signal → cause → countermove, each behind a real case. Red-team's guaranteed reactions for GTM spars. (Incumbent-response, TAM-fallacy, platform-dependency, premature-scaling live in the `business-strategy` pack — cite those there, don't re-derive.)

## Adoption without value capture
- signal: usage/download/star metrics soar while revenue stays flat; the monetization slide says "enterprise features later"; the value your product creates is captured at a layer you don't own.
- cause: the wedge job and the paid job are different jobs; an open/free core commoditizes exactly the thing users love, while orchestration/management — where budgets live — is taken by someone else.
- countermove: identify WHERE in the stack the budget line sits before scaling adoption; monetize a job the payer owns (Docker only found revenue when Docker Desktop subscriptions charged for the developer job itself, 2021).
- case: Docker — de-facto container standard with millions of users; Kubernetes (Google, 2014→CNCF) captured orchestration where enterprise budgets pooled; Docker sold its enterprise business to Mirantis (Nov 2019) and recapitalized, pivoting to paid developer tooling.
- date: 2026-07-06 · source: Mirantis/Docker acquisition announcements + contemporaneous coverage (TechCrunch, Nov 2019); Docker subscription announcements 2021 · grade: A

## Developer love without a buyer
- signal: enthusiastic individual users, strong community, zero procurement conversations; "we'll monetize the enterprise version"; users adopt but nobody's budget is assigned to the category.
- cause: optimizing for the users' values (correctness, elegance) in a market that buys on the payer's values (convenience, support, de-risking) — and the users never controlled budget at all.
- countermove: before building the motion, find three orgs where a named budget owner would sign; sell the painkiller framing to the payer even if the wedge is user-love.
- case: RethinkDB — beloved database, shut down Oct 2016; founder's post-mortem names the market: developers loved it but "open-source developer tools" buyers paid for convenience (MongoDB won on it), and willingness-to-pay never materialized.
- date: 2026-07-06 · source: Akhmechet, "RethinkDB: why we failed," defmacro.org, Jan 2017 (founder primary) · grade: A

## Product-over-distribution
- signal: the roadmap is dense and the growth plan is a paragraph; team celebrates craft while signups flatline; conversion of the few who arrive is actually GOOD.
- cause: builder culture treats distribution as beneath the product; the team spends its runway perfecting what nobody hears about.
- countermove: fix a distribution budget (time and money) as a constraint, not a leftover; one named, measured channel before further product investment. Good conversion + no traffic = a distribution problem, not a product problem.
- case: Everpix — press-lauded photo service, ~55,000 users / ~6,800 paying (strong conversion), shut down Nov 2013 with almost nothing spent on growth; the post-mortem's own numbers show a product that converted and a company that never filled the funnel.
- date: 2026-07-06 · source: Newton, "Out of the picture," The Verge, Nov 2013 (with internal documents/data) · grade: B

## Toxic acquisition-channel cohorts
- signal: top-line growth driven by discounts/deals; blended CAC looks fine but cohort repeat/retention is dismal; growth stalls the moment promotions stop.
- cause: the channel selects for deal-hunters, not the ICP — the acquisition machine imports customers who never had the job the product serves.
- countermove: cohort-level retention by channel, not blended; kill channels whose cohorts don't retain regardless of volume; grow only the channel whose users look like the retained ICP.
- case: Homejoy — home-cleaning platform scaled on heavy discount promotions; retention of deal-acquired customers was weak, unit economics never closed (worker-classification suits compounded), shut July 2015.
- date: 2026-07-06 · source: Farr, "Why Homejoy Failed," Backchannel/WIRED, 2015 · grade: B

## No job / failed cheapest-kill-test
- signal: impressive technology, vague answer to "what does this replace?"; the cheapest possible test of the value prop has never been run because everyone fears the answer.
- cause: conviction and capital substitute for a validated job; the team scales GTM for a product whose alternative is trivially good enough.
- countermove: run the kill test FIRST — the cheapest experiment that would prove the alternative suffices; if the product only survives when the test isn't run, the GTM plan is a burn schedule.
- case: Juicero — ~$118M raised for a $400 wifi juice press; Bloomberg demonstrated hands squeezed the juice packs just as well (Apr 2017); company shut Sept 2017, ~16 months after launch.
- date: 2026-07-06 · source: Bloomberg News, Apr 2017 + shutdown coverage Sept 2017 · grade: A

## GTM outruns delivery capacity
- signal: sales targets set from fundraising narrative, not delivery capacity; onboarding/compliance/support corners cut to hit growth numbers; internal tooling built to skirt the slow parts.
- cause: growth pace is chosen by the board slide; the machinery that fulfills what's sold (ops, compliance, CS) scales slower than quota.
- countermove: gate quota growth on delivery capacity metrics (onboarding SLA, compliance clearance, support load per account); treat a quarter of missed delivery as a stop trigger, not a staffing footnote.
- case: Zenefits — hypergrowth insurance-brokerage SaaS; unlicensed selling (including a tool to fake license-training hours) surfaced 2016; CEO out Feb 2016, valuation cut ~4.5B→2B, SEC settlement 2017.
- date: 2026-07-06 · source: SEC press release 2017; contemporaneous WSJ/BuzzFeed reporting 2016 · grade: A

## Pilot purgatory
- signal: multiple "successful" enterprise pilots, zero conversions; pilots are free or success criteria were never written; the champion can't name the budget line production would come from.
- cause: a pilot without pre-agreed conversion terms is a free consulting engagement — the buyer's cheapest option is another pilot.
- countermove: paid pilots only; conversion terms + success criteria + executive sponsor signed BEFORE the pilot starts; a prospect who won't pre-agree conversion terms has told you the verdict early — believe them.
- case: McKinsey's cross-industry surveys: 84% of companies stuck >1 year in pilot mode, 28% >2 years (2017); 56–74% of manufacturers stuck in later surveys (2019–2020) — the buy-side base rate any enterprise-pilot GTM must price in.
- date: 2026-07-06 · source: McKinsey digital-manufacturing "pilot purgatory" research 2017–2020 (mckinsey.com) · grade: B

## Positioning whiplash
- signal: second (third…) repositioning in as many years; each pivot announced to the same audience; press and early users can no longer say what the company is.
- cause: positioning treated as a costless message swap; growth pressure forces pivots before any positioning has had time to compound.
- countermove: test positioning cheaply and privately (sales conversations, landing-page tests) before public commits; treat the PUBLIC commit as the one-way door it is — war-game it, then hold it long enough to read the signal.
- case: Fab.com — flash-sales design darling, ~$336M raised, ~$1B valuation (2013); serial repositioning (flash sales → e-commerce → custom furniture) burned audience and team; sold to PCH for a reported low-tens-of-millions (2015).
- date: 2026-07-06 · source: contemporaneous TechCrunch/Business Insider coverage 2013–2015 · grade: B

## Premature sales scaling
- signal: VP Sales + AE team hired before any founder has closed a repeatable sale; pipeline reviews start before the ICP or objection map exists; new reps each "figure out" their own pitch.
- cause: sales hiring used as a substitute for the founder learning the sale; board pattern ("you need a sales leader") applied ahead of repeatability.
- countermove: founders close the first ~10–20 deals personally; write down the repeatable sale (ICP, objections, close pattern); hire the first reps to EXECUTE that playbook, a VP to scale it — in that order.
- date: 2026-07-06 · source: Roberge, The Sales Acceleration Formula, 2015 (HubSpot's staged sales-scaling record); SaaStr/practitioner canon on first-sales-hire sequencing · grade: B

## Growth priced below unit cost
- signal: explosive signup growth at a price point that loses money on every active user; the deck says scale/data/partnerships will fix margins later; heavy users are the least profitable.
- cause: price set to manufacture growth optics, not to map to value or cost; the "we'll renegotiate supply at scale" assumption never lands.
- countermove: contribution margin per active user at CURRENT terms must be survivable before scaling spend; any pricing that only works after a future renegotiation is a bet, name it in the ledger and cap exposure.
- case: MoviePass — $9.95/month unlimited movies (Aug 2017) while paying theaters ~full ticket price; 3M+ subscribers, catastrophic losses, service dead Sept 2019, parent HMNY bankrupt, FTC action 2021.
- date: 2026-07-06 · source: HMNY SEC filings + contemporaneous coverage 2017–2019; FTC settlement announcement 2021 · grade: A

## Constraint inflation (self-imposed)
- signal: a stated constraint quietly broadened in use — "no sales force" becomes "no selling"; "product-led" becomes "no outbound of any kind"; a motion dies citing the broad form.
- cause: constraints treated as identity, not as protections of a specific limit; nobody restates what the rule actually protects.
- countermove: restate every fixed constraint as the real limit it protects + the cheapest compliant version of the action it appears to forbid (founder-led selling to N≤5 design partners is not a sales force); re-test any constraint-eliminated motion against the narrowed form.
- case: Northwind GTM (illustrative) — "no sales force" was inflated to "no selling", killing the founder-led design-partner motion; restating the constraint to its real limit (no quota-carrying reps) surfaced a compliant motion — the founder selling to N≤5 paid design partners.
- date: 2026-07-06 · source: illustrative GTM calibration exemplar · grade: B

## Passive detector where signal must be manufactured
- signal: the strategy gates on a pull signal (installs, inbound, badge clicks) after the run's own facts establish pull=0 and slow channels; expected time-to-verdict exceeds the runway or decision clock.
- cause: build-strong teams prefer instruments to conversations; passive detection feels rigorous while dodging the ask.
- countermove: manufacture the signal — direct ask, paid design partners, time-boxed outreach — designed to terminate unambiguously; the detector's expected time-to-verdict must beat the mission clock, or take the active alternative.
- case: Northwind GTM (illustrative) — a 2-quarter marketplace-listing tripwire whose most likely outcome was "test never ran — no verdict" inside a short-runway mission; a 7-day $0 outbound smoke test to on-call teams existed as the active alternative.
- date: 2026-07-06 · source: illustrative GTM calibration exemplar · grade: B
