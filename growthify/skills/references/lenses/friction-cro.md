# Friction & CRO — lens pack

## Scope
The path from intent to done: onboarding, activation, checkout, signup, any funnel where users who WANT the outcome still leak out. Sees friction, choice architecture, persuasion at the decision point, aha-moment delivery. Ignores why users show up (acquisition) and whether they come back (hooks-habit) — its jurisdiction ends when the target action completes.

## Core models

**Friction audit, operationalized.** Every funnel step imposes four costs: *cognitive* (decisions, reading, understanding), *labor* (typing, uploading, navigating), *emotional* (fear of commitment, embarrassment, distrust), *waiting* (latency, approval delays). The audit: walk the funnel as the recon-profiled segment, price each step in all four currencies, rank the leaks. The biggest drop is usually emotional or cognitive, not labor — teams over-fix form fields and under-fix fear.

**Cialdini's persuasion forces at the decision point** — the four that matter most in product funnels:
- *Social proof* — evidence that people-like-me do this and it works. Strongest when specific and similar ("3,200 restaurants in Singapore" beats "trusted by thousands"). MUST be real (fabrication = dark pattern).
- *Authority* — credible endorsement, certifications, security badges at the moment of fear (payment forms).
- *Commitment/consistency* — small yeses precede big yeses; users who state a goal complete flows toward that goal at higher rates. Basis of progressive profiling.
- *Reciprocity* — value delivered BEFORE the ask (free insight before the paywall, results preview before signup).

**Choice architecture.** Defaults are the strongest force in interface design — whatever requires no action is what most users get; own the default and you own the outcome (must be user-positive; self-serving defaults are consent-erosion). Option-set size: more choices → lower completion (paradox of choice); curate to 3, hide the long tail behind "more". Smart defaults + progressive disclosure beat configurability at every activation stage.

**The aha-moment model.** Activation = fastest honest path to the moment the product's core value is FELT, not described. Method: (1) identify the aha behaviorally (what did retained users do in their first sessions that churned users didn't — correlation-then-causation-check); (2) count clicks/decisions from signup to aha; (3) delete, defer, or default everything not on that path. Setup steps that can happen AFTER the aha, must.

## Mechanism inventory

### Funnel-step deletion & deferral
- **What:** remove or postpone steps between intent and aha/checkout — social signup, guest checkout, ask-later profiling, skip-for-now defaults.
- **Psychology basis:** friction audit (labor + cognitive); B=MAP ability-raising.
- **Preconditions:** deleted data genuinely deferrable (billing address isn't, at payment); analytics per step exist so the leak is located, not guessed.
- **Failure modes:** deferring the aha's own prerequisites (deleting the setup the value depends on); guest checkout without an account-conversion moment afterwards leaks lifetime value.

### Aha-first onboarding (do, don't tour)
- **What:** restructure first-run so the user DOES the core thing immediately — template pre-loaded, sample data live, first action pre-staged; tours and feature carousels deleted.
- **Psychology basis:** aha-moment model; reciprocity (value first); commitment (a completed first action predicts the second).
- **Preconditions:** the aha is known behaviorally (recon or analytics), not asserted by the founder; product can demonstrate value on sample/prefilled state.
- **Failure modes:** optimizing to a false aha (correlation-picked, never causation-checked) — activation "improves" while retention doesn't; skipping consent/compliance steps that legally can't defer.

### Progressive profiling & commitment ladders
- **What:** ask for information/permissions in small steps, each AFTER a value beat; open with a micro-commitment (state a goal, pick a preference) that frames the rest.
- **Psychology basis:** commitment/consistency; friction spread over reciprocity beats friction lumped upfront.
- **Preconditions:** multiple natural value beats exist to hang asks on; asks genuinely needed (an ask you never use is pure cost).
- **Failure modes:** the ladder's first rung too tall (asking for the sensitive thing first); profiling that never visibly improves the experience (users notice extraction without return).

### Decision-point social proof & authority
- **What:** specific, similar, real proof placed AT the hesitation point — counts, named peers, outcome stats, security signals on payment steps.
- **Psychology basis:** social proof + authority, timed to the emotional-friction peak.
- **Preconditions:** the proof is true and verifiable; specificity available (segment-matched numbers); placement at the measured drop-step, not sprayed everywhere.
- **Failure modes:** generic badges everywhere (banner blindness); proof that outs how small you are ("12 customers!"); fabricated/rounded-up activity (dark pattern — fabricated-scarcity/consent-erosion boundary).

### Default-state engineering
- **What:** set every choice's no-action outcome to the option that serves the USER's stated goal — recommended plan pre-selected with honest labeling, best-practice settings on, curated 3-option menus.
- **Psychology basis:** default force; paradox-of-choice curation.
- **Preconditions:** a defensible "best for most" exists; labeling honest ("recommended" must be recommendable to the user, not just to revenue).
- **Failure modes:** self-serving defaults (auto-added add-ons, pre-ticked consents — consent-erosion dark pattern, S3 regulatory exposure); over-curation hiding an option a large minority needs.

### Objection-timed reassurance
- **What:** answer the exact fear at the exact step it fires — "cancel anytime" at subscribe, "no card required" at trial start, refund policy at payment, "your data stays yours" at import.
- **Psychology basis:** emotional-friction audit; authority.
- **Preconditions:** the fear is identified from real signal (support tickets, session recordings, recon psychology profile — not guessed); the reassurance is TRUE.
- **Failure modes:** reassuring against fears users don't have (adds cognitive load + plants the fear); promises the fine print contradicts (trust collapse, hidden-costs dark pattern).

### Recovery flows (abandonment rescue)
- **What:** structured second chances — cart/setup abandonment follow-ups that restore state in one click, resume-where-you-left links, "your draft is saved".
- **Psychology basis:** Zeigarnik (open loops nag); friction removal on the return path.
- **Preconditions:** state genuinely restorable in one click (a rescue that restarts the flow is an insult); contact channel consented.
- **Failure modes:** instant-discount rescues that train deliberate abandonment (interacts with pricing-economics — coordinate); nagging cadence (channel burn).

## Signature questions
1. Where exactly does the funnel leak (step-level numbers from recon), and is that step's dominant friction cognitive, labor, emotional, or waiting?
2. What is this product's aha moment, behaviorally — and how many decisions stand between signup and it? Which of those decisions could be deleted, deferred, or defaulted?
3. What is the user afraid of at the drop step, and what true reassurance answers it?
4. What proof do we have that people-like-this-segment succeed here — and is it placed at the hesitation point?
5. What does the no-action path give the user at each choice — is every default the user-positive option?
6. Who abandons recoverably, and can we restore their exact state in one click?

## Metric-family mapping
- **Moves best:** activation rate, onboarding completion, checkout/signup conversion, step-level funnel conversion, trial-to-active.
- **Secondary:** trial-to-paid (with pricing-economics), form completion, permission grant rates.
- **Does NOT move:** retention beyond first value (hooks-habit), traffic (social-viral), ARPU (pricing-economics).

## Case pointers
`amazon-one-click` · `dropbox-onboarding-aha` · `slack-teams-aha` · `airbnb-social-proof-booking` · `guest-checkout-baymard` · `booking-urgency-backlash` · `canva-templates-first`

## Anti-patterns
- Fixing form fields when the leak is fear — labor optimizations on an emotional-friction step move nothing.
- Founder-asserted aha moments — the aha is discovered from retained-user behavior, then causation-checked, never declared in a meeting.
- Persuasion-stacking every widget on one page (proof + urgency + authority + scarcity = bazaar, trust drops).
- A/B-testing micro-copy while a whole step could be deleted — sequence: structure first, persuasion second, polish third.
- Nearest dark-pattern boundary: **fabricated-scarcity** (fake counters/timers at decision points), **consent-erosion** (self-serving defaults, pre-ticked boxes), **hidden-costs** (fees revealed at the last step). The urgency rule: real deadlines may speak; invented ones may not.
