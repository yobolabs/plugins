# Mission Brief — <mission-name>

**War-game order. The model receiving this is NOT executing the mission — it is war-gaming it.**
A cheaper executor model will run the resulting war-game file cold.

## Executor

- **Model:** <e.g. Opus 4.8 running Claude Code in fable-mode>
- **Behavioral profile:** <how THIS model fails: e.g. short-sighted on knock-on effects past order 2; over-trusts green tests; needs explicit verification steps; won't re-derive unstated context. Tailor every move's observations and countermoves to these weaknesses.>

## Domain plug-in

- **Domain agent:** <cadra:cadra-dev | yobo:yobo-dev | core:core-dev | …>
- **Domain skills to load in recon/red-team:** <e.g. cadra:agents, cadra:channels, yobo:messaging>

## Objective

<One paragraph. What done looks like, in observable terms — the final expected observation of the whole mission.>

## Context

- Specs: <paths>
- Prior art / sessions: <paths>
- Known traps (preloaded reality — treat as guaranteed reactions): <list or trap-library refs>

## Scope

- **In:** <…>
- **Out:** <…>
- **Primary Better axis:** <simple | performant | usable | integrable | understandable | elegant — ties break toward this>

## Knobs

- **Depth knob:** order <3 default; 4–5 for one-way doors>
- **Deliverable:** <path>/wargames/<mission>.md
- **Verification paths:** <the concrete checks the executor must run before reporting done — pages to open, endpoints to curl, tests to run, logs to read>

## Open inputs

<Anything the human must supply; anything unresolved goes to ledger.md with a placeholder `(variable)`.>
