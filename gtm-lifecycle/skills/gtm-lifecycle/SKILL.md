---
name: gtm-lifecycle
description: End-to-end GTM strategy lifecycle — elicit the real situation (7-question battery), draft a positioning brief with falsifiable load-bearing bets, spar every bet adversarially, war-game the one-way doors, synthesize a challenged strategy. Use when the user says "gtm", "go to market", "find the wedge", "positioning", "launch strategy", "who should we sell to", "who's the buyer", or wants a GTM plan that has survived an adversary. Requires the spar plugin (spar:spar + spar:wargame). The GTM-specialized sibling of spar:strategy-lifecycle.
---

# GTM Lifecycle

Takes a product from "we should do GTM" to a **challenged, durable GTM strategy**: who it's for, what to lead with, who pays, in what order — with every load-bearing assumption named as a falsifiable claim and tested by an adversary before the human commits. Runs in **fable-mode**, **autonomous between exactly two human gates**.

A GTM plan nobody argued against is a guess in a suit. Nothing leaves here until its bets have survived contact with an adversary on paper.

## Operating Mode (fable-mode — apply throughout)

> **Act, don't narrate** — ≤1 status line per tool burst, then act. **Batch** independent reads/greps into single turns. **Think before non-trivial actions.** **Ground every claim in evidence** — cite the source or tag it `assumed`/`unknown`; never assert a market fact from vibes. For the brief: **elicit every big fork up front, write one dense draft, converge in a few rounds, then stop.**

Apply this to your own orchestration AND inject the same contract into every subagent prompt.

## Dependency (hard)

Phases 2–3 **invoke the spar plugin** — `spar:spar` and `spar:wargame`. This skill orchestrates them; it never reimplements the adversary engine (recon/red-team/cascade/scout/judge are spar's). If the spar skills are not available, run Phase 1 and GATE 1 normally, then declare **BLOCKED: spar plugin not installed** — do not fake a spar.

## The Two Gates (the ONLY legitimate human stops)

```
product / goal
 → Phase 1  Elicit + brief (interactive, WITH the human)   → strategy-brief.md
 → [GATE 1 ⛔ approve the brief]
 → Phase 2  Spar the brief          (autonomous — assault every load-bearing bet)
 → Phase 3  War-game one-way doors  (autonomous — fight irreversible moves on paper)
 → Phase 4  Synthesize              → strategy.md + decision-ledger.md + wargames/
 → [GATE 2 ⛔ approve the final strategy]
 → done (execution — Jira/tasks/launch — is a separate step the human triggers)
```

Between the gates you run continuously. The only other stop is a genuine **BLOCKED** state — a decision only the human can make that no research resolves (e.g. risk tolerance on runway, a price the founder won't charge). Surface it; don't guess.

## Artifacts (all under `_context/{project}/gtm/` — or the user's chosen topic slug; never repo `docs/`)

| File | Phase | What |
|---|---|---|
| `strategy-brief.md` | 1 | objective · honest baseline · positioning hypothesis · the buyer-motion question · falsifiable bets · constraints · channels/pricing/sequencing · one-way doors — schema: `references/brief-template.md` |
| `spar-state.md` | 2 | per-bet steelman → attacks → verdicts (spar owns the format; keep a copy or pointer here) |
| `wargames/<move>.md` | 3 | one war-game file per one-way-door move (spar's wargame-file schema) |
| `strategy.md` | 4 | the decided strategy — every bet tagged survived/amended/killed with evidence — schema: `references/strategy-template.md` |
| `decision-ledger.md` | 4 | decision · load-bearing assumption · reversibility · flip observable — schema: `references/strategy-template.md` |

## Phase 1 — Elicit + brief (interactive, WITH the human)

This phase is **not** autonomous — the brief is built on the human's actual situation, not your priors. Run the battery in `references/question-battery.md`: **one question at a time, multiple-choice preferred, every option grounded in the user's real situation** (read their repo/context/memory first so options name their actual products, signal, and competitors — never generic placeholders).

The seven questions, in order: **1 Objective → 2 Current signal → 3 Wedge candidate → 4 Differentiator → 5 ICP → 6 The buyer (crux) → 7 Constraints (multiselect).** Follow-up probes only where an answer is load-bearing and vague.

**The buyer-crux rule (signature move):** Q6 asks who *literally pays*. If the user is torn or unsure, **do not force a pick.** Lay out the competing motions (e.g. builder-platform vs direct vs dual-track) as a table — buyer, end user, what the product *is* under each — and make the buyer/motion question **the central unresolved bet of the brief**. The spar attacks all candidate motions against the constraints; the winner is earned, not asserted.

Then draft `strategy-brief.md` in **ONE dense pass** per `references/brief-template.md`:
- Load-bearing bets named as **falsifiable claims** (`B-<Name>: <claim that an observation could kill>`), 3–7 of them.
- Constraints stated as **fixed rules that rule motions in or out** — and name the tension they create (the "squeeze"); if an honest fourth option emerges from the squeeze, capture it for the spar to test.
- The **default motion** identified — what the company already does that competes for the same marginal hours. It enters the ranking as the null hypothesis; every other motion must justify why a marginal hour beats it.
- One-way doors listed (public positioning commit, pricing-model commit, architecture lock-ins, starving an existing revenue line).
- Open questions that recon should hunt (runway numbers, real inbound signal, named competitors).

Present the brief → **GATE 1**. Batch any remaining forks into this single gate, fable-style.

## Phase 2 — Spar the brief (autonomous)

Invoke **`spar:spar`** with the brief as artifact target. Parameters to pass at intake:
- domain: `gtm` · depth: `deep` (a GTM commit is a real decision)
- pack paths for recon: this skill's `references/domains/gtm/` (starter pack — resolve relative to this SKILL.md) **plus** `SPAR_HOME/domains/gtm/` if it exists (runtime pack from prior missions).

Spar's recon builds the domain brief; red-team steelmans then assaults **every load-bearing bet** — including each candidate buyer motion against the constraints. The spar also attacks the constraints block itself as positions, not rules: every constraint marked fixed gets one first-principles attack — state the real limit it protects, then test whether the stated form is broader than that limit ("no sales force" must not inflate to "no selling"); any motion eliminated primarily by a constraint is re-tested against the narrowed real-limit form before the ranking locks. Run rounds until each bet has a stable closed-vocabulary verdict (**survives / wounded / dead**) with a flip condition. Anti-sycophancy is law (spar's six rules): **a brief where every bet survives untouched means the spar failed — send it back for a harder round.**

Amend the brief **in place** as bets fall: killed bets struck, wounded bets carry their caveats, survivors carry their evidence. Conceded ground is never re-litigated. If the spar resolves the buyer-motion question, record which motion won and *which attack killed the others*.

## Phase 3 — War-game the one-way doors (autonomous)

For each one-way-door move the brief named (and any the spar surfaced), invoke **`spar:wargame`** — one mission per move, executor = the human, domain pack as in Phase 2. Output `wargames/<move>.md` per spar's wargame-file schema: the move, expected observations, most-likely failures + countermoves, order-N consequences, opportunities, fork triggers, abort conditions.

**Two-way doors get NO war-game** — the ceremony must pay for itself. Note them as reversible in the decision ledger and move on. Typical GTM one-way doors: public positioning commit, pricing-model commit (customers anchor), tenancy/architecture lock-ins, starving an existing revenue line, an exclusive channel/partner deal.

## Phase 4 — Synthesize (autonomous)

Merge brief + spar verdicts + war-games per `references/strategy-template.md`:
- `strategy.md` — the decided strategy. The chosen motion and which attacks eliminated the alternatives. Every bet tagged **survived / amended / killed** with the evidence that decided it. Sequenced moves with triggers. Surviving unknowns surfaced, never dropped.
- `decision-ledger.md` — each decision, its load-bearing assumption, reversibility (two-way / one-way), and the observable that would flip it.

Present at **GATE 2**: the strategy, the ledger, the bet delta (brief v0 → final), surviving unknowns.

## What this skill does NOT do

- Decide for the human — it produces a strategy whose bets were tested and whose risks are named; the call stays the human's.
- Execution artifacts (Jira, launch checklists, content calendars) — separate, human-triggered.
- Reimplement spar internals — steelman/assault/verdict mechanics, personas, distill, and the judge all belong to `spar:spar` / `spar:wargame`.

## Subagent dispatch

Spar and wargame own their own agent dispatch (recon/red-team/cascade/scout/judge) — you orchestrate the phase sequence and the gates, not their internals. Any subagent you dispatch yourself gets the fable-mode contract injected verbatim and a self-contained brief.
