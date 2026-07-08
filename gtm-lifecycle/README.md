# gtm-lifecycle

End-to-end GTM strategy process, run in fable-mode with exactly two human gates:

```
product/goal
 → Phase 1  Elicit + brief (interactive, 7-question battery)  → strategy-brief.md
 → GATE 1 ⛔ approve the brief
 → Phase 2  Spar (spar:spar) — steelman + assault every load-bearing bet
 → Phase 3  War-game (spar:wargame) — fight each one-way-door move on paper
 → Phase 4  Synthesize → strategy.md + decision-ledger.md + wargames/<move>.md
 → GATE 2 ⛔ approve the final strategy
```

The GTM-specialized sibling of `spar:strategy-lifecycle`: same two-gate spine, but the brainstorm phase is a purpose-built GTM elicitation battery (objective → signal → wedge → differentiator → ICP → **the buyer crux** → constraints), the brief template is GTM-shaped (competing buyer motions, falsifiable bets, constraint squeeze), and phases 2–3 run against a sourced GTM domain pack (positioning frameworks, SaaS base rates, real GTM failure cases, the adversaries a GTM brief must survive).

The signature move: if the user doesn't know who literally pays, the skill does **not** force an answer — the buyer/motion becomes the central unresolved bet the spar attacks.

## Dependency

**Requires the `spar` plugin.** Phases 2 and 3 invoke `spar:spar` and `spar:wargame` — this plugin orchestrates them, it does not reimplement the adversary engine. If spar is not installed, the lifecycle blocks at GATE 1 and says so.

## Run

```
/gtm Northwind — reposition and find the first paying wedge
```

Or invoke the `gtm-lifecycle` skill directly. Artifacts land under `_context/{project}/gtm/` (or the user's chosen topic slug), never in repo `docs/`.

## Layout

```
commands/gtm.md                          /gtm wrapper
skills/gtm-lifecycle/SKILL.md            the process (phases, gates, orchestration)
skills/gtm-lifecycle/references/
  question-battery.md                    Phase 1 elicitation battery + probes
  brief-template.md                      strategy-brief.md schema
  strategy-template.md                   strategy.md + decision-ledger.md schemas
  domains/gtm/                           GTM domain pack (spar-schema: brief, base-rates,
                                         failure-modes, personas, questions, sources)
```
