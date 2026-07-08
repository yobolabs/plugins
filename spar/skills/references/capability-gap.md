# Capability Gap — what the framework does NOT replicate

**First spar-domain calibration: COMPLETE (2026-07-07).** Mission: CadraOS GTM (`_context/cadra/gtm/`, spar rounds 1-4 + strategy.md + wargames M1-M3) diffed against Fable-direct single-pass (`SPAR_HOME/exemplars/cadraos-gtm-FABLE-DIRECT-2026-07-07/direct-wargame.md`). Same starting brief (`strategy-brief.md`). Judge: Fable 5. This replaces the inherited code-calibration placeholder.

## Verdict

**The framework run FAILS the §9 calibration gate.** It fails failure-branch coverage (~55-60% of direct's distinct surfaces vs the ≥80% gate) and fails opportunity findings value-weighted (nominal count passes; the two highest-value findings are absent). It passes epistemic hygiene, attack quality, verdict integrity, and depth mechanics cleanly — the scaffolding held; the reach inside it didn't. Estimated overall: **~70% of the Fable-direct ceiling on strategy terrain** — below the 85% code-terrain prior. Strategy terrain punishes the framework harder because the decisive moves (constraint challenge, cross-bet fusion) are generative, not map-walks.

**And the headline divergence is real, verified, and the framework's strategy is worse on the merits.** Direct challenged the "no sales force" constraint from first principles (founder-led sales to 3-5 paid design partners ≠ a sales force), derived motion D (manufacture the missing signal: 7-day $0 watering-hole smoke test → 3 paid founding partners → day-30 unambiguous gate), and correctly called the framework's gallery/tripwire "fatally passive." The framework accepted the constraint as terrain, wielded it as attack evidence 3+ times, and never attacked it once. Its Round-2 kill line — *"required either pull or a sales motion; both absent"* — treats the sales motion as absent **by fact** when it was absent **by inflated constraint**. Everything downstream (motion-A elimination, the passive detector, R3's question #1 pre-excluding builders from the audience answer) inherits that inflation. Worse: by the framework's own facts (E4: SEO 8-18 months; A-3: ≥500 visits/mo floor *assumed*; badge CTR removed from the math), the most likely outcome of its 2-quarter tripwire is **"test never ran — no verdict this cycle"** inside a short-runway mission whose primary axis is evidence speed. It noticed this (M1 A-3, the two-leak split) and shipped it anyway, because the active alternative was constraint-forbidden. The pack's cheapest-kill-test question fired — and was answered inside the false constraint ("the gallery is the cheapest kill test available"), when a 7-day $0 outbound test existed. Knowledge present; procedure failed.

**Why the framework didn't challenge the constraint (diagnosis, verified against the SKILLs):**
1. **Spar mode has NO first-principles pass at all.** `skills/spar/SKILL.md` step 4 challenges "the unstated frame (is the goal itself right?)" but never the constraints. The first-principles discipline lives only in `skills/wargame/SKILL.md` (Non-negotiable disciplines) and success.md item 7.
2. **Sequencing:** the war-game stage — where the pass does exist — ran AFTER Round 2 locked the motion. By then "no selling" was baked into the converged strategy; the pass ran downstream of the decision it should have interrogated.
3. **Aim:** where the first-principles muscle did fire (R3 scout: "pull detection requires content marketing — droppable"), it targeted *instrumentation* constraints, never the brief's §6 block — which the brief labeled "fixed" and the framework honored as ground truth. Nothing in any rubric forbids accepting a mislabeled constraint.

**One agreement to correct the record on:** direct's "Yobo revenue TREND silently gates everything, nobody listed it" is true of the *brief* (§9 omits it) but NOT of the framework — Round 1's blocked ledger has **L5** with the exact gating consequence ("Yobo flat/declining → the whole board resets"). Both found it; direct's marginal addition is severity ("fix Yobo first — the GTM question is premature") and the **null-hypothesis formalization** ("motion B already exists — it is called Yobo"; every platform hour must beat the marginal Yobo hour). The framework demoted B as "it *is* Yobo" — same observation — but never installed the default motion as the benchmark all spend must beat.

## Side-by-side scores (§9 gate)

| Dimension | Framework | Direct | Gate | Result |
|---|---|---|---|---|
| Failure-branch coverage | ~16-17 of direct's ~30 distinct surfaces (misses: metaphor-vs-chassis conflation, codegen deflation, GHL substitute, consulting death-spiral, ambiguous-failure order-4, LLM-cache positioning stickiness, API-contract door + death-by-GitHub-issues, constraint inflation, null hypothesis, pricing-model-decidable, stale-architecture-door) | reference | ≥80% | **FAIL (~55-60%)** |
| Consequence depth | order 4 claimed & walked; chains shown; landing times; no renumbering fraud | order 4; richer causality per step (ambiguous failure, accidental-door entry) | ≥ direct on same moves; 0 theater | **PASS** (parity on overlap) |
| Opportunity findings | larger register by count (14+ across M1-M3 + R3 scout) | 8 inline, incl. run-time positioning, Gartner-wave-as-TAM, graveyard-as-buyer-pool, payment-as-filter, migrate-for-them-as-research | ≥2/3 of direct's | **MARGINAL** — passes count, fails value-weighted: misses direct's top 3 |
| Epistemic hygiene | exemplary: F1-F18 tagged/graded/dated, deliberate nulls, blocked ledger, caps + documented lift | well-cited, less formal | 0 untagged / 0 unhunted closures | **PASS** |
| Attack quality | ~100% attributed + evidence-classed + falsifiable | grounded + falsifiable, unattributed personas | ≥90% | **PASS** |
| Verdict integrity | closed vocab, flip conditions everywhere, concession symmetry (R3 M-PLG), no dead-on-unresearched (B-Reachable capped until L4), no drift | flip conditions per bet | 0 violations | **PASS** |

Input-asymmetry note (fairness): framework rounds 3-4 had live founder inputs (L4=0 confirmed, viral prompt, 3-slot answers) direct never saw; direct additionally read `_overview.md`. Neither excuses the core misses — the framework HAD the chassis facts (B-Moat steelman: "SaaS-infra-grade RLS/RBAC/orgs/billing") and never fused them into positioning, and the constraint inflation needed no extra input to spot.

## Classified gaps

### Procedure gaps (SKILL/agent edits — these were forceable)

- **P1 — Constraint-challenge pass absent in spar mode, mis-sequenced in mission mode.** THE headline gap.
  - `skills/spar/SKILL.md` step 4 (Assault), point 1: after "including the unstated frame", add: *"and a CONSTRAINT-challenge pass — every constraint the position marks fixed gets one first-principles attack: state the real limit it protects, then test whether the stated form is broader than that limit ('no sales force' must not inflate to 'no selling'). A constraint that eliminates a motion carries its own verdict + flip condition, like any bet."*
  - `skills/strategy-lifecycle/SKILL.md` Phase 2: add: *"The spar attacks the brief's constraints block as positions, not rules. Any motion eliminated primarily by a constraint is re-tested against the narrowed (real-limit) form of that constraint before the ranking locks."*
  - `skills/wargame/SKILL.md` stage 1 (Recon): move the first-principles pass INTO recon's standing-rules sweep — *"each inherited constraint is restated as the limit it protects + the cheapest compliant version of the action it appears to forbid"* — so it runs before the move tree, not after the motion locks.
- **P2 — No active-instrument comparison for detector/tripwire moves.** `references/templates/success.md`, Mission mode, add gate item: *"Any detector/tripwire move must price at least one ACTIVE evidence-manufacturing alternative (direct ask, paid pilot, outreach) and beat it on evidence-per-day and evidence-quality — or take it. A detector whose expected time-to-verdict exceeds the mission's own time constraint fails Taste (item 9)."* The framework's gallery loses this comparison instantly to the 7-day smoke test.
- **P3 — Null-hypothesis framing for strategy spars.** `skills/strategy-lifecycle/SKILL.md` Phase 2: *"Identify the default motion (what the company already does that competes for the same marginal hours). It enters the ranking as the null hypothesis; every other motion must state why a marginal hour beats it."*
- **P4 — Evidence hierarchy: payment > usage > signup > attention.** `skills/spar/SKILL.md` Verdict section + success.md: *"A mission whose objective is revenue must contain at least one move that requests payment; a free instrument measures politeness/curiosity, not demand."* The framework's instrument never touches payment in a mission literally titled "who pays Cadra?".

### Knowledge gaps (pack entries — `references/domains/business-strategy/`)

- **K1 — `failure-modes.md`: add "Constraint inflation (self-imposed)."** signal: a stated constraint quietly broadened in use ("no sales force"→"no selling"; "product-led"→"no outbound of any kind"); cause: constraints treated as identity, not as protections of a specific limit; countermove: restate as real limit + cheapest compliant version of the forbidden action (founder-led selling to N≤5 is not a sales force). Case: this calibration.
- **K2 — `failure-modes.md`: add "Passive detector where signal must be manufactured."** signal: strategy gates on a pull signal after the run's own facts establish pull=0 and slow channels; cause: build-strong teams prefer instruments to conversations; countermove: manufacture the signal (paid design partners, time-boxed, designed to *terminate unambiguously*); detector's expected time-to-verdict must beat the runway.
- **K3 — recon standing rule (`sources.md` or `questions.md`): the revenue-ranked incumbent sweep.** *"Name the LARGEST company already monetizing this exact buyer, by revenue/users — not the most similar-looking startup."* The framework's F6 found the Stammer-class shelf and missed **GoHighLevel** (~70k domains, the agency→SMB white-label chassis, already adding agents) — the single most dangerous substitute, present in the very listicle both runs cited. Also add 2026 AI-market rates: PLG free→paid ~9% median; time-to-$1M-ARR ~2.75y; agency price points $300-1,500/mo; founder-led design-partner sales as the standard 0→1 platform motion.
- **K4 — `questions.md`: three new questions.** (a) **Deflation:** "Is the value you sell deflating (AI/commoditization shrinking it quarterly)? Which half of the value prop deflates slower — sell that half." (direct's B5 attack: codegen deflates build-time leverage; run-time/ops value doesn't). (b) **Null hypothesis:** "What is the company already doing that this strategy competes with for marginal hours?" (c) **Evidence velocity:** "What is the fastest instrument producing an unambiguous verdict on the core unknown — cost in days and dollars? Payment-grade evidence preferred."
- **K5 — `personas.md`: add "The Design-Partner Veteran."** stance: has run 0→1 platform motions; allergic to instruments-instead-of-conversations; knows the consulting death-spiral ("can you just build it for me?") and the ambiguous-failure trap. attacks first: passive detectors, free pilots, unfalsifiable "materially cheaper" claims. signature question: *"Who did you ASK to pay, and what exactly did they say?"*

### Capability gaps (frontier-only — honest record; for this class of move, use Fable)

- **C1 — Cross-bet fusion into re-positioning.** Direct fused B1 (metaphor copyable / chassis hard) + B5 (deflation) + B6 (substitutes) into a NEW one-liner — run-time/day-2 positioning ("your agent demo worked; production is the hard part") — and inverted the Gartner 40%-cancelation risk into the TAM (failed POCs = buyers with budget and burned fingers). The framework held every ingredient scattered across verdicts and never fused them; strategy.md kept the brief's SOP front door. Fusion can be prompted ("write the positioning the surviving evidence implies, ignoring the brief's draft"); the inversion is frontier taste.
- **C2 — Novel causal-mechanism invention in war-games.** LLM-cache positioning stickiness (pivots now propagate through model indexes for months); "terminate unambiguously" as the program's design goal after walking ambiguous-failure as the order-4 worst case; death-by-a-thousand-GitHub-issues as the *accidental* route through the starve-Yobo door with no decision ever made. Cascade walks written maps; it does not invent edges like these.
- **C3 — Spotting WHICH constraint is inflated and generating the compliant-active alternative** (motion D). P1 converts this from "never happens" to "prompted, quality varies" — but the generative leap stays frontier-weighted.
- **C4 — Weighing instrument validity against the mission clock.** The framework *noticed* its detector might produce no verdict (A-3) and shipped anyway; direct treated expected-time-to-verdict as disqualifying. Multi-constraint judgment, not a checkable rule.

## Where the framework BEAT direct (calibration is bidirectional)

- **Test-validity engineering:** the two-leak split (D10/M1 — traffic floor vs conversion leak; "no installs ≠ thesis false if the test never ran") is cleaner than the smoke test's pass/fail, which under-separates reach-failure from demand-failure. Port this INTO active motions: direct's smoke test should carry the same split.
- **M3 reversibility engineering:** job-indexed vs identity-indexed SEO (authority survives repositioning), the 5-reader echo test, the install signal-shape classifier (one instrument adjudicates both positioning and B-vsZapier), and the asymmetric-irreversibility note (the dangerous zone is *half-success*). Direct's WG-2 is comparable but has no echo test and no signal-shape classifier.
- **M2 terrain entirely:** consent sweep, publicity clause compounding into the contract template, dogfood-story-never-logo-wall (the one un-rung bell correctly identified), joint abort on bidirectional brand coupling. Direct never produced these (its motion needs them less; partially input asymmetry).
- **R3 mechanism decomposition:** "viral" split into three loops with different physics (person-to-person dead / badge / template-remix), grounded in the F11 closure conditions and the GPT-Store/Poe graveyard — direct-grade analysis. Its one blind spot: the decomposition was MECE over *marketing* mechanisms and omitted direct solicitation — the inflation again.
- **Interactive elicitation + bookkeeping:** rounds resolved L4 and the three slots mid-flight; formal tags/grades/deliberate-nulls/caps make the run resumable and auditable. A single-pass direct cannot do either.

## Prioritized patch list (highest value first)

1. **P1 — constraint-challenge pass** in `spar/SKILL.md` step 4 + `strategy-lifecycle/SKILL.md` Phase 2 + recon sequencing in `wargame/SKILL.md`. The headline miss and everything downstream of it flow from this one hole.
2. **P2 + P4 — active-instrument comparison + payment-grade evidence rule** in `success.md` (+ one line in spar Verdict). Kills the passive-detector failure class outright.
3. **K1 + K2 + K4 — the two failure-mode entries and three questions.** Cheap, durable, would have fired as guaranteed reactions in Round 1.
4. **K3 — revenue-ranked incumbent sweep as a recon standing rule.** A GHL-class miss in a GTM spar is disqualifying; one sentence in recon's procedure prevents it.

## When to spend frontier-model budget (updated)

- Missions where the brief itself may be wrong — **including its constraints block**; frontier models kill false premises AND false constraints harder (this calibration's proof).
- One-way doors with broad blast radius; judge duty on calibrations; thin-pack domains. (Unchanged from code calibration.)
- Positioning/synthesis steps that must FUSE findings across bets (C1) — consider a frontier pass on synthesis even when the spar ran on a weaker model.

## Status of priors

- Code terrain (STORY-011, 2026-07-06): ~85% of ceiling — held.
- **Strategy terrain (this run): ~70% of ceiling — gate FAILED.** One data point; second held-out strategy mission required after patches land. Executor fidelity still untested (no human has run either war-game; reality's scorecard pending).
