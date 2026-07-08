# Phase 1 — GTM Elicitation Battery

Seven questions, asked **one at a time**, in this order. Multiple-choice preferred — the human picks faster and more honestly from grounded options than from a blank page. Free-text always allowed.

## Grounding rule (before Q1)

Read what exists FIRST — the user's repo, `_context/`, memory, prior briefs — so every option names **their actual products, users, signal, and competitors**, never generic placeholders. "Which use is the sharpest wedge: (a) your incident-triage flow, (b) your dashboard/alerting engine, (c) …" beats "(a) feature A (b) feature B". If nothing exists to read, ask the user for a 3-sentence description of the product and who touches it today, then proceed.

## The battery

### Q1 — Objective: what is this GTM push FOR?
Options (adapt to their situation):
- **Reposition / find the wedge** — product works, market and ICP fuzzy; decide who it's for and what to lead with.
- **First paying revenue** — positioning roughly known; get from zero to paying logos.
- **Scale an existing wedge** — a motion already converts; pour on more.
- **Raise / prove the narrative** — the audience is investors; GTM proof-points serve the raise.

Why it matters: everything downstream (brief shape, what "success" means, which bets are load-bearing) keys off this. Probe if vague: "what does success look like in 2 quarters, in $/logos/signal?"

### Q2 — Current signal: what real demand evidence exists TODAY?
Options:
- **Design partners / pilots** — external orgs using it, paying or not.
- **Inbound / waitlist** — people asking for it unprompted.
- **Internal dogfood only** — we use it ourselves; no external users.
- **Greenfield** — none of the above.

Why it matters: this changes the whole approach — **mine real signal vs reason from zero**. Dogfood-only means the wedge hypothesis hides in the internal job the product already does well (and "the dogfood generalizes" becomes a named bet). Probe: "any uncounted pull — people asking to use/build on it?"

### Q3 — Wedge candidate: which single use/capability is the SHARPEST wedge?
Options = their product's actual capabilities (from grounding). The wedge is where it **clearly beats the incumbent alternative for one user on one job** — not the most impressive feature, the most *displacing* one. Probe: "when you use it yourselves, which part would hurt most to lose?"

### Q4 — Differentiator: the ONE thing it does that the crowded field doesn't?
Free-text or grounded options. The positioning one-liner hangs on this. Force specificity: a different *mental model* or *mechanism*, not an adjective ("faster", "easier" = not differentiators). Probe: "name the crowded field explicitly — who gets compared against you in the buyer's head?" (feeds recon).

### Q5 — ICP: who feels the pain hard enough to BUY?
Options grounded in who plausibly touches the product (from Q2/Q3). Distinguish *feels the pain* from *has budget* — that split is Q6's job; here nail the pain-holder. Probe: "describe the one person whose week your wedge fixes."

### Q6 — THE BUYER (crux): who LITERALLY pays?
Disambiguate explicitly — for platforms this is the fork that determines the entire motion:
- **Builder/platform buyer** — others pay to build on it (the product is infrastructure).
- **End-org buyer** — the org with the pain pays directly (the product is an app).
- **Dual-track** — you build the app on your own platform AND sell the platform.

**THE RULE: if the user is unsure or torn, DO NOT force a pick.** Lay the candidate motions out as a table (motion · buyer · end user · what the product *is* under each) and make the buyer/motion question **the central unresolved bet of the brief** — the thing the spar attacks hardest and the constraints squeeze. A forced answer here poisons every section below it; an honest "open" makes the whole lifecycle earn the answer.

### Q7 — Constraints (multiselect): what is FIXED?
- **Team / sales force** — headcount, no sales muscle, build-heavy skill mix.
- **Must keep existing revenue** — a current line can't be starved to fund the push.
- **Runway / revenue-soon** — a clock; no 4-quarter patience play.
- **Build-vs-GTM strength** — building is the strong muscle, selling the weak one.
- (plus anything they volunteer: geography, regulatory, brand, founder red-lines)

Constraints **rule motions in or out** — state them as rules, not context. Then name the tension they create (the "squeeze"): e.g. "revenue-soon + no sales force + platform ambition" squeezes all three motions; if an honest fourth option emerges from the squeeze, capture it in the brief for the spar to test. Probe: runway in months; the actual "revenue soon" number.

## After the battery

Draft `strategy-brief.md` in **one dense pass** per `brief-template.md`:
- Bets as falsifiable claims (`B-<Name>`), 3–7.
- The buyer-motion table if Q6 stayed open.
- One-way doors + open questions for recon.

Then GATE 1. Do not start a second elicitation round unless a section is genuinely empty — converge, don't circle.
