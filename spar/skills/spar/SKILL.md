---
name: spar
description: Use when a position should be genuinely challenged — an idea, proposal, design, or goal stress-tested in interactive rounds by domain-grounded adversaries with honest closed-vocabulary verdicts. Use when the user says "spar", "challenge this", "poke holes in this", "devil's advocate", "stress-test this idea/proposal/design/plan", "am I wrong about", "fight me on this", or points at a spec/PRD/doc for adversarial review. NOT for trivial questions, factual lookups, or decisions too small to defend — the ceremony must pay for itself; if it wouldn't, just answer.
---

# Spar — Interactive Adversarial Sparring

Rounds of **steelman → assault → verdict** run in the main conversation; agents are dispatched only where their latency pays (prep research, deep dives, disputed-claim hunts, close audit). The product is honest verdicts: anti-sycophancy is law here (six rules, enforced by audit — see Verdict integrity below), and a spar that ends in polite agreement is a failed spar.

## Home & privacy (check once, first run)

- `SPAR_HOME` env var; default `~/sparring/`. If missing, create `$SPAR_HOME/{domains,missions,exemplars}/` silently and tell the user once.
- **Write boundary:** write ONLY under `SPAR_HOME` (plus the invoking project's context tree when the user explicitly requests a mission artifact there). NEVER write under the plugin directory — the plugin's starter packs are read-only seeds; distill targets live in `SPAR_HOME/domains/`.
- **Never persist:** credentials/secrets, third-party personal data, verbatim quotes from private conversations, anything the user marks `off-record` (honor immediately — strike it from the state file too).

## The loop

### 1. Intake (main conversation)
1. Parse the target: readable file path → artifact spar · `resume <slug>` → step 8 · anything else → the position text. If the conversation already references an existing `SPAR_HOME/missions/<slug>/`, offer resume.
2. Classify **position type** (table below), **domain** (kebab-case), and propose **depth**: `light` (casual — prep ≈ minutes, timeboxed research) or `deep` (real decision — full research). Reflect all three back in one line; the user may override any.
3. Check `SPAR_HOME/domains/<domain>/` — if a pack exists, say so (warm start; J9).
4. Create `SPAR_HOME/missions/<slug>/spar-state.md` per `../references/templates/spar-verdict.md`: position v0 (dated), type, domain, depth.

| Type | Example | Attack surface | Persona examples |
|---|---|---|---|
| Opinion/thesis | "AI agents will eat SaaS" | evidence, base rates, falsifiability | domain skeptic, incumbent |
| Proposal/plan | "enter Indonesia Q4" | feasibility, incentives, 2nd-order effects | competitor, regulator, burned operator |
| Design | onboarding flow, pricing page, API shape | user behavior, drop-off, unconsidered alternatives, jobs-to-be-done | first-time mobile user, skeptical team admin, churned user, support agent |
| Goal/metric | "100 activations/wk" | is it the RIGHT goal, metric gaming, opportunity cost | CFO, executing team, Goodhart |

### 2. Prep (one dispatch: `spar-recon`)
Dispatch spar-recon with: position (or artifact path), type, domain, depth, pack path(s) if any, output path `SPAR_HOME/missions/<slug>/domain-brief.md`. It returns the **domain brief**: tagged fact base (A/B/C source grades), actor/incentive map, base rates, 2–4 named personas, question battery, hunts run/open, standing-rule human gates, and degraded-mode flags. Record the brief path in state; show the user a one-line summary (personas found, base rates found, open unknowns).

- **"skip research" / "spar now"** → no dispatch; degraded mode ON (rules below); offer to run the research later.
- Artifact targets: recon hybrid-sweeps the artifact + codebase/memory/sessions + web, so attacks can cite the artifact's actual content ("§3 assumes the user has created an org before seeing value").

### 3. Steelman (main conversation) — GATE
Restate the position STRONGER than the user made it: add the best evidence they didn't cite, take the most defensible reading of every vague claim, repair weak framing. Ask: **"Is this steelman fair?"** — **no attack before an explicit confirm.** Unfair → revise until confirmed. Log the confirm in the state file. (Attacking a weak form proves nothing; the steelman also forces you to find the actual load-bearing structure — that's what you attack.)

### 4. Assault (main conversation VOICES red-team — no dispatch, no latency)
Run the red-team procedure (`agents/red-team.md`) inline, using the brief + personas + pack:
1. Decompose the steelman into its claim chain; list every load-bearing assumption **including the unstated frame** (is the goal itself right?) — and run a **CONSTRAINT-challenge pass**: every constraint the position marks fixed gets one first-principles attack — state the real limit it protects, then test whether the stated form is broader than that limit ("no sales force" must not inflate to "no selling"). A constraint that eliminates a motion carries its own verdict + flip condition, like any bet.
2. Guaranteed reactions first: matching failure-modes pack entries + base-rate violations are certainties, not hypotheticals — cite them.
3. Per assumption, walk the four evidence classes — **base rate / incentive / precedent / logic** — wearing the persona whose incentives most oppose it; open with their signature question. Attack the strongest point too, not just flanks.
4. Keep the top **3–5** attacks that clear the quality floor (attributed + evidence-classed + falsifiable); drop the rest. Format each:
   `A<round>.<n> — <persona/stance> [<evidence class>]: <attack, naming the target assumption>` · Evidence: <grounding, cited> · Falsifier: <what observation would kill this attack>.

Never attack conceded ground. Always attack position vN (the latest amendment), not stale versions.

### 5. Verdict (main conversation)
Per attack **surface** (not per attack): **survives / wounded / dead** + the single flip condition (the one thing that would most change the verdict). Closed vocabulary — no "interesting", no "worth considering". Demand evidence ranks **payment > usage > signup > attention** — a free instrument measures politeness/curiosity, not demand. Degraded cap: no `dead` on `unresearched` evidence — maximum is "wounded, pending verification (hunt: X)".

Then the user responds free-form:
- **concede** → log the concession; that ground is never re-litigated.
- **counter** → if the counter defeats an attack, declare that attack **DEAD explicitly** (concession symmetry) and log it.
- **amend** → log position vN+1 (dated, with which attack forced it); the next round attacks the amended position only.

Append attacks, verdicts, and responses to the state file **after every round**. Loop to step 4 until the user closes, accepts a verdict, or triggers a between-rounds move.

### 6. Between rounds (user-triggered)
- **"go deep"** → dispatch `spar-cascade` ∥ `spar-scout` (parallel, one message). Each receives: position vN + the actor/incentive map + depth knob. Cascade returns an order-numbered consequence tree; scout returns a Better-ranked opportunity register. Fold findings into the next round; append to state.
- **"check that"** → dispatch `spar-recon` in single-claim hunt mode with the disputed claim. It returns `verified`/`refuted` + dated citation + grade, or `unknown` + the hunt trail. Verdicts depending on the claim are **suspended** until it returns; patch the fact base with the result.

### 7. Close
1. **Verdict summary** — every attack surface with final verdict + flip condition.
2. **Position delta** — v0 vs vN: what changed and which attacks forced it.
3. **Surviving unknowns** + open hunts; under degraded mode, list **every verdict capped by missing research** and offer to resolve them by running the research now.
4. **Ledger** — assumptions and human decisions carried out of the spar.
5. One-way door surfaced? → offer **promotion to mission mode** (`spar:wargame`); the spar state seeds the mission brief.
6. Dispatch `spar-judge` with the full spar-state.md for the **drift audit**; report violations to the user honestly (including your own).
7. **Distill** — propose a domain-pack writeback as a DIFF of durable knowledge only (personas that landed, base rates verified, failure modes observed with their signal→cause→countermove, questions that proved sharp). **Redact first:** strip counterparty names, financial figures, and mission-identifying specifics unless the user opts in per item. ONE confirm → merge per the writeback contract (`../references/domains/README.md`): append new entries; conflicts newest-wins with the older entry preserved under a `superseded:` note; bump `updated` + `missions`; write atomically (temp + rename). Target is `SPAR_HOME/domains/<domain>/` — never the plugin's starter packs.

### 8. Resume
`resume <slug>` → read `SPAR_HOME/missions/<slug>/spar-state.md`; reload the position log, concessions (still binding), verdicts, and open unknowns; continue at step 4 against vN.

## Orchestration contract

| Step | Who runs | Input | Output | State update |
|---|---|---|---|---|
| Intake | main conversation | position/artifact path | position type, domain, depth | state file created: position v0, type, domain |
| Prep | 1 dispatch: `spar-recon` | position, type, domain, pack path if exists | domain brief (fact base, actor map, base rates, personas, question battery) | brief path recorded |
| Steelman | main conversation | position vN + brief | steelman text | user confirm logged |
| Assault | main conversation (voices red-team; no dispatch = no latency) | steelman + brief + prior concessions | 3–5 attacks (attributed, evidence-classed, falsifiable) | attacks appended |
| Verdict | main conversation | attacks + user responses | per-surface verdicts + flip conditions | verdicts + concessions appended; position vN+1 if amended |
| "go deep" | 2 ∥ dispatches: `spar-cascade`, `spar-scout` | position vN + actor map | consequence tree / opportunity register | findings appended |
| "check that" | 1 dispatch: `spar-recon` | disputed claim | verified/refuted + citation, or `unknown` + hunt trail | fact base patched |
| Close | main conversation, then 1 dispatch: `spar-judge` | full state file | verdict summary, position delta, unknowns, ledger; drift-audit report | state finalized; distill proposed |

The `spar-red-team` agent is dispatched only in mission mode — or when the judge audit flags the main-conversation attacks as below the quality floor, in which case re-run the assault via dispatch before closing.

## Degraded mode ("skip research", or hunts unavailable)
Evidence ladder, in order: (1) user-provided docs → (2) internal artifacts + memory/sessions → (3) cached domain pack, staleness disclosed → (4) model knowledge, tagged `unresearched`. Under degradation: every claim that would need a fresh source is tagged `unresearched`; base-rate attacks downgrade to `logic` evidence class; **no `dead` verdicts on `unresearched` evidence** (cap: "wounded, pending verification (hunt: X)"); the close lists every capped verdict.

## Verdict integrity (law — all six, every spar)
Full rubric with detection checks: `../references/rubrics/verdict-integrity.md`. In brief: **R1** no attack before the steelman is confirmed fair · **R2** no unearned praise — every positive cites the evidence that earned it · **R3** closed verdict vocabulary + flip conditions, always · **R4** concession symmetry — defeated attacks are declared dead; a red team that never loses a point is theater · **R5** attack quality floor — attributed + evidence-classed + falsifiable, or it's filler · **R6** drift audit at close — softening across rounds gets flagged openly. Depth theater (claimed order > walked order) is the judge's #1 fraud target on deep dives.

## Ceremony budget
Every ritual must earn its tokens. Light spars shrink prep, persona count, and round length — never the gates: steelman confirm, quality floor, closed vocabulary, and concession logging always hold. If a position is too trivial to deserve the gates, decline to spar and just answer the question.

## References
- `../references/templates/spar-verdict.md` — state-file sections, round format, close format
- `../references/templates/domain-brief.md` — recon's output schema
- `../references/templates/ledger.md` — assumptions/blocked-inputs format
- `../references/templates/mission-brief.md` — promotion target (mission mode)
- `../references/rubrics/verdict-integrity.md` · `../references/rubrics/better.md`
- `../references/domains/README.md` — pack schema, writeback contract, staleness rules
- `../references/exemplars/README.md` — judge standards · `../references/capability-gap.md`
