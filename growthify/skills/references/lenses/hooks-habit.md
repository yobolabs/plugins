# Hooks & Habit — lens pack

## Scope
Repeat-use behavior: how a product becomes a routine rather than a decision. Sees triggers, rewards, investment loops, streaks, habit anchors. Ignores acquisition (social-viral's job), monetization (pricing-economics), and first-run friction (friction-cro) — except where habit formation starts inside onboarding.

## Core models

**The Hook loop (Eyal), operationalized.** Four phases that must EACH exist for a habit loop to close:
1. *Trigger* — external (notification, email, physical context) graduating to internal (an emotion or situation that fires the product to mind: bored→feed, anxious-about-sales→dashboard). The design goal is always the internal trigger; external triggers are scaffolding you plan to remove.
2. *Action* — the smallest behavior done in anticipation of reward. Must be easier than thinking (open app, pull to refresh, glance at widget).
3. *Variable reward* — the engine. Three types: **tribe** (social validation — likes, replies, being seen), **hunt** (material/informational search — deals, news, revenue numbers), **self** (mastery/completion — levels, inbox-zero, progress bars). Variability is load-bearing: predictable rewards habituate and die; uncertain ones sustain dopamine response.
4. *Investment* — the user puts something in (data, content, reputation, configuration, followers) that makes the NEXT loop more valuable. Investment is what compounds; loops without it plateau.
Diagnosis use: find which phase is missing/weak in the product's current loop — that phase is the mechanic target.

**Fogg Behavior Model: B = MAP.** A behavior fires when Motivation, Ability, and Prompt converge. Operational rules: (1) when a desired behavior isn't happening, raising ABILITY (making it smaller/easier) beats raising motivation almost always; (2) prompts without ability produce frustration, prompts without motivation produce annoyance — match prompt to the segment's real MAP state; (3) anchor new habits to existing ones ("after I check X, I do Y" — the anchor is an existing internal trigger you borrow).

**The habit zone.** Habits form when frequency is high AND perceived utility is above baseline. Low-frequency products (annual tax filing) cannot be habits — don't force streaks on them; find the high-frequency satellite behavior (checking, tracking, monitoring) and build the habit there.

**Builder-platform lifecycle.** Builders configure in bursts (project energy), then drop to operations mode; the product must convert from build-tool to colleague or it becomes shelfware after the build burst. This is why a configure-then-vanish cohort churns on cue — the vanish happens on a lifecycle schedule, not at random — so the mechanic target is the build→operate transition, not generic re-engagement.

## Mechanism inventory

### Streaks (with repair)
- **What:** visible count of consecutive daily/weekly actions; breaks reset it.
- **Psychology basis:** loss aversion on the accumulated count (self-type reward) + implementation intention ("do it daily").
- **Preconditions:** the action is genuinely valuable at that frequency; action is small (Fogg ability); the streak's cadence matches natural use (forcing daily on a weekly-value product = resentment).
- **Failure modes:** streak anxiety → churn on first break (MUST pair with repair/freeze tokens); streaks on low-value actions train hollow ritual; leaderboarded streaks turn into compulsion (dark-pattern boundary).

### Smart external triggers (graduating to internal)
- **What:** notifications/emails/badges timed to the segment's real context, designed to hand off to internal triggers over the arc of use.
- **Psychology basis:** prompt in B=MAP; trigger-reward association building.
- **Preconditions:** a reward genuinely waits on the other side of the tap (a notification that opens to nothing burns the channel); frequency caps; channel consent healthy.
- **Failure modes:** notification spam → channel dead + uninstalls (the most common self-inflicted wound in retention work); triggers that never graduate (product stays dependent on push forever); generic broadcasts where behavioral triggers were possible.

### Variable-reward feeds & reveals
- **What:** unpredictable-payoff surfaces — activity feeds, daily deal reveals, "what changed since you left" summaries, spin-style reward moments.
- **Psychology basis:** variable reward (hunt/tribe); curiosity gap.
- **Preconditions:** real underlying variance exists (a feed of nothing can't be variable); reveal cadence matches content supply.
- **Failure modes:** manufactured variance reads fake fast; compulsion-beyond-value at the extreme (infinite scroll without stopping cues — dark-pattern boundary); reward inflation (each reveal must escalate → unsustainable).

### Investment ladders
- **What:** structured ways users deposit value that raises switching cost and next-loop value: saved configurations, accumulated history, trained personalization, built reputation, imported data.
- **Psychology basis:** investment phase of the Hook; endowed value; sunk-cost (the honest, value-backed kind).
- **Preconditions:** the deposit genuinely improves the user's next session (fake investment = busywork); early asks small (Fogg).
- **Failure modes:** onboarding front-loads investment before any reward (loop runs backwards — reward must come first); investment that can't be exported reads as lock-in and poisons trust when noticed.

### Habit anchors & routines
- **What:** attaching product use to an existing routine — morning-coffee report email, end-of-shift summary, Monday planning view.
- **Psychology basis:** Fogg anchoring; context-dependent memory.
- **Preconditions:** you know the segment's real routine (recon's psychology profile); the anchored moment has slack attention.
- **Failure modes:** anchoring to a routine the segment doesn't have (fantasy personas); competing with an entrenched product already anchored there.

### Completion & progress mechanics
- **What:** progress bars, profile-completeness meters, level systems, checklists that make advancement visible.
- **Psychology basis:** self-type reward; Zeigarnik effect (open loops nag); goal-gradient (effort accelerates near the goal).
- **Preconditions:** a real journey with real milestones exists; completion delivers actual capability, not just a badge.
- **Failure modes:** progress theater (meters measuring nothing) — users notice and trust drops; endless levels devalue each level; goal-gradient abused into grind (dark-pattern boundary at compulsion).

### Re-engagement loops (win-back hooks)
- **What:** structured comebacks for lapsing users — "your dashboard changed", milestone summaries ("your month in review"), expiring earned value handled honestly.
- **Psychology basis:** curiosity gap + endowed value; the internal trigger re-fired externally once.
- **Preconditions:** something genuinely accrued while they were gone; lapse detection accurate.
- **Failure modes:** "we miss you" with nothing behind it (burns the channel); fake urgency on non-expiring value (dark pattern — fabricated-scarcity); win-back aimed at users who churned for cause (fix the cause first).

## Signature questions
1. Where is this product's loop today — which Hook phase (trigger/action/reward/investment) is weakest or missing?
2. What internal trigger COULD own this product ("when I feel/need X, I open Y") — and what's the graduation path from external prompts to it?
3. What does the user deposit that makes session N+1 better than session N? If nothing: what could they?
4. What is the natural use frequency, honestly? Does the habit mechanic under consideration match it, or fight it?
5. Which reward type (tribe/hunt/self) fits this segment's psychology per recon — and does the product have real variance to feed it?
6. What existing routine could this product anchor to?
7. Delivery-location check — does the product's recurring value arrive where the user already lives (a channel/inbox they're already in), or does it demand a visit? Value that demands a visit inverts the loop.
   - When sweeping, split *deploy-as-chatbot* (agent answers messages in a channel) from *output-delivery-location* (autonomous-run results arrive where work happens) — different surfaces; "channel deploy exists" does NOT mean the delivery-location lever is taken.

## Metric-family mapping
- **Moves best:** retention (D1/D7/D30), DAU/MAU ratio, session frequency, resurrection/win-back rate.
- **Secondary:** activation (only the habit-formation tail of onboarding), feature adoption depth.
- **Does NOT move:** acquisition, virality, first-visit conversion, ARPU (send those to social-viral / friction-cro / pricing-economics).

## Case pointers
`duolingo-streaks` · `duolingo-streak-freeze` · `linkedin-profile-completeness` · `spotify-discover-weekly` · `github-contribution-graph` · `headspace-reminders` · `wordle-daily-cadence`

## Anti-patterns
- Streaks/notifications bolted onto a product whose value isn't frequency-shaped — the mechanic manufactures guilt, not habit.
- Prompting before ability: sending more push at a flow users find hard. Shrink the action first (B=MAP).
- Investment before reward in onboarding — asking for the deposit before demonstrating the payoff runs the Hook backwards.
- Reward inflation arms races — each escalation habituates; variance beats magnitude.
- Nearest dark-pattern boundary: **guilt-loops** (shame-framed streak breaks) and **compulsion-beyond-value** (variable reward without stopping cues). The line: the mechanic must survive the user seeing exactly how it works.
