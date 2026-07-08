---
name: strategy-lifecycle
description: End-to-end lifecycle for a strategic decision — GTM, pricing, market entry, hire, partnership, pivot, any big call — run in fable-mode, autonomous between two human gates. Chains brainstorming → spar (adversarial challenge) → war-game (one-way doors) → a durable strategy doc. Use when the user says "strategy lifecycle", "let's do the GTM", "work up a strategy for", "strategize X end to end", "brainstorm and spar this", or wants the full idea→challenged-strategy workflow. The strategy analog of feature-lifecycle.
---

# Strategy Lifecycle

Single canonical workflow for taking a strategic decision from raw idea to a **challenged, durable strategy document**. It runs in **fable-mode** and is **autonomous between exactly two human gates**. The back half of feature-lifecycle (specs → code) is replaced with **spar** (challenge every load-bearing bet) and **war-game** (fight the irreversible moves on paper).

This is the decision-quality workflow: a strategy nobody argued against is a guess in a suit. Nothing ships from here until its load-bearing assumptions have survived contact with an adversary on paper.

## Operating Mode (fable-mode — apply throughout)

> **Act, don't narrate** — ≤1 status line per tool burst, then act. **Batch** independent reads/greps into single turns. **Think before non-trivial actions.** **Ground every claim in evidence** — cite the source or tag it `assumed`/`unknown`; never assert a market fact from vibes. For the brief: **ask every big fork up front, write one dense draft, converge in a few rounds, then stop.**

Apply this to your own orchestration AND inject the same contract into every subagent you dispatch.

## The Two Gates (the ONLY legitimate human stops)

```
idea / goal
 → brainstorm (WITH the human)         → strategy-brief.md
 → [GATE 1 ⛔ approve the brief]
 → spar the brief                       (autonomous — challenge every bet)
 → war-game the one-way doors           (autonomous — fight irreversible moves)
 → synthesize                           → strategy.md + decision-ledger.md + wargames/
 → [GATE 2 ⛔ approve the final strategy]
 → done (execution — Jira/tasks — is a separate step the human triggers)
```

- **GATE 1** — after brainstorming produces `strategy-brief.md`, before any adversary touches it. Present the brief, get a go-ahead. Batch remaining forks here, fable-style.
- **GATE 2** — after synthesis, before the strategy is treated as decided. Present `strategy.md` + the decision ledger + surviving unknowns.

Between the gates you run continuously. The only other stop is a genuine **BLOCKED** state (a decision only the human can make that no research resolves — surface it, don't guess).

## Artifacts (all under `_context/{project}/{topic}/`)

`{topic}` is the decision slug (e.g. `gtm`, `pricing-2026`, `series-a`). Never in repo `docs/`.

| File | Phase | What |
|---|---|---|
| `strategy-brief.md` | 1 | positioning · ICP · the load-bearing bets · channels · pricing · sequencing · non-negotiables · open questions |
| `spar-state.md` | 2 | per-bet steelman → attacks → verdicts (the spar transcript; resumable) |
| `wargames/<move>.md` | 3 | one war-game file per one-way-door move |
| `strategy.md` | 4 | the decided strategy — each bet tagged survived / amended / killed, with the evidence |
| `decision-ledger.md` | 4 | every decision made, the assumption it rests on, its reversibility, and what would flip it |

## Phase 1 — Brainstorm the brief (interactive, WITH the human)

Invoke `superpowers:brainstorming`. This phase is **not** autonomous — it is the elicitation that builds the strategy on the human's actual intent, traction, and constraints. Drive it toward a `strategy-brief.md` that names, explicitly:
- **Objective** — what winning looks like, by when.
- **Positioning + ICP** — who it's for, the wedge, why now.
- **The load-bearing bets** — the 3–7 assumptions the whole strategy rests on. These are what spar attacks. Name them as falsifiable claims, not vibes.
- **Channels · pricing · sequencing** — the plan of moves.
- **One-way doors** — moves that are expensive/impossible to reverse (these go to war-game).
- **Non-negotiables + open questions.**

Write it with the create-specs-style rigor but strategy-shaped. Then **GATE 1**.

## Phase 2 — Spar the brief (autonomous)

Invoke `spar:spar` on `strategy-brief.md`. Recon builds the domain brief (research + personas + base rates); red-team steelmans then assaults **every load-bearing bet**. The spar attacks the brief's constraints block as positions, not rules; any motion eliminated primarily by a constraint is re-tested against the narrowed (real-limit) form of that constraint before the ranking locks. Identify the default motion (what the company already does that competes for the same marginal hours) — it enters the ranking as the null hypothesis; every other motion must state why a marginal hour beats it. Run rounds until each bet has a stable verdict (survives / wounded / dead) with a flip condition. Anti-sycophancy is law — a brief where every bet survives untouched means the spar failed; send it back. Persist to `spar-state.md`.

Amend the brief in place as bets fall: killed bets are struck, wounded bets get their caveats, survivors get their evidence. Conceded ground is never re-litigated.

## Phase 3 — War-game the one-way doors (autonomous)

For each one-way-door move the brief named (and any the spar surfaced), invoke `spar:wargame`. Produce a war-game file per move: the move, its expected observations, most-likely failures + countermoves, order-N consequences, opportunities, fork triggers, abort conditions — written for the human to execute. Two-way-door moves do NOT get a war-game (the ceremony must pay for itself); note them as reversible in the ledger and move on.

## Phase 4 — Synthesize (autonomous)

Merge brief + spar verdicts + war-games into:
- `strategy.md` — the decided strategy. Every bet tagged survived / amended / killed with the evidence that decided it. Sequenced plan of moves. Surviving unknowns surfaced, never dropped.
- `decision-ledger.md` — each decision, its load-bearing assumption, reversibility (two-way / one-way door), and the observable that would flip it.

Then **GATE 2**.

## What this skill does NOT do

- It does not decide for the human — it produces a strategy whose bets have been tested and whose risks are named. The call stays the human's.
- It does not create Jira / execution artifacts (separate, human-triggered step).
- It does not invoke `wargame:wargame` (that's for code/platform missions) — strategy war-games use `spar:wargame`.

## Subagent dispatch

Same discipline as feature-lifecycle: in-conversation `Agent` tool, explicit `subagent_type` and `model`, self-contained briefs, fable inject. The spar/wargame skills own their own agent dispatch (recon/red-team/cascade/scout/judge) — you orchestrate the phase sequence and the gates, not the internals.
