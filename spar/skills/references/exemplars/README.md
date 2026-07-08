# Exemplars — Ground Truth (index of pointers)

Spars and war-games produced DIRECT (no framework) by a frontier model — the standard `spar-judge` scores framework output against, and the few-shot references for full-depth adversarial reasoning.

**Full exemplar files are PRIVATE artifacts and live in `SPAR_HOME/exemplars/`, never in the plugin** (they contain mission-identifying detail that doesn't belong in a distributable).

## Status

**First exemplar captured: CadraOS GTM (2026-07-06).** A full lifecycle run — brainstorm → brief → spar (4 rounds) → war-game (3 one-way doors) → synthesized strategy — that converged to a GATE-2-approved decision.

**Provenance (honest asterisk):** this is a **framework-run** exemplar, not pure Fable-direct — the recon/red-team/scout/war-game stages were Fable-5 subagents wearing the role prompts, orchestrated by the main loop. It is therefore a *worked example of the process hitting the bar*, not the frontier-direct ceiling the judge calibrates against. Treat it as demandable standards + few-shot, and still produce a Fable-direct exemplar for true calibration.

| Exemplar | Mode | Terrain | Full file |
|---|---|---|---|
| CadraOS GTM (framework-run) | mission (strategy-lifecycle) | GTM / positioning / one-way doors | `SPAR_HOME/exemplars/cadraos-gtm-2026-07-06/` (canonical: monorepo `_context/cadra/gtm/`) |
| CadraOS GTM (**Fable-direct**) | mission, direct ceiling | same, brief-only isolation | `SPAR_HOME/exemplars/cadraos-gtm-FABLE-DIRECT-2026-07-07/` |

**Calibration result (2026-07-06 → 07):** framework-run scored **~70% of the Fable-direct ceiling — FAILS the §9 gate.** Craft passed (attack floor ~100%, 0 verdict-integrity violations, order-4 depth, no theater); reach failed (failure-branch coverage ~55-60% vs ≥80%; missed direct's top-3 opportunity findings). Headline miss: the framework accepted the brief's "no sales force" constraint as fixed and built a *passive* pull-detector; Fable-direct challenged the constraint (founder-led ≠ a sales force) and derived an *active* evidence-manufacturing motion that dominates on evidence-velocity. Full diff + classified gaps + prioritized patch list → `../capability-gap.md`.

### What the CadraOS GTM exemplar demonstrates (the bar, with the concrete moves)

- **Anti-sycophancy held under a full run:** round 1 returned all 7 load-bearing bets `WOUNDED` — zero clean survivors AND zero clean kills; every dead-path routed through a blocked fact. A run where bets survive untouched is a failed spar; so is one that kills on flattery.
- **Silence-as-data / premise-kill:** "a working product with zero external pull *this long* is itself evidence" — recon turned the absence of a fact into a load-bearing one, and it eliminated a whole motion (builder-platform-now).
- **Scout finds the ONE real thing and kills the rest:** the founder's "viral agents / social / video" list was split by *mechanism*; person-to-person viral agents died on hard precedent (an agent is a *destination with no exhaust*; GPT-Store 95%-unlisted graveyard; no actor whose recipient shares their job), while the template-gallery-as-pull-detector survived — reshaped, not rubber-stamped. Honoring a founder's idea means fighting it, not validating it.
- **Blocked facts surfaced, never dropped:** L1–L6 ledgered with which bet each gates; L4 (external pull) flagged as the single highest-leverage unknown *before* it was answered — and answering it (zero) reordered the whole motion ranking.
- **Test-validity guard (a foresight move, not just risk):** the "two-leak split" — "no installs ≠ thesis false if the test never ran (no traffic)" — prevents the executor misreading a failed *distribution* as a failed *thesis*.
- **War-game guardrails are specific + reversibility-aware:** replay-first (flagship templates can't demo live unauthenticated); *never a family-logo customer wall* (the one genuinely un-rung bell — agent-washing); narrow positioning over the broad Zapier arena; and the finding that M3's irreversibility is **asymmetric** (cheap to reverse on clean failure, expensive only in the half-success middle — which is exactly what the pre-committed numbers are for).
- **Closed verdict vocabulary + flip conditions throughout** — every verdict names what would change it; the decision-ledger tags each decision's reversibility (two-way / one-way) + flip observable.

## Standards inherited from the code-wargame exemplars (judge demands these pending spar-native ground truth)

- **Premise-kill:** recon that corrects the brief's/position's own framing when the facts contradict it — run safe probes DURING the engagement, don't only design them.
- **Beyond-the-list findings:** the question battery / unknown-unknown hunt must surface items nobody asked about.
- **Challenged constraints get VERDICTS with fork triggers**, not mentions.
- **Confidence as mechanics, not vibes:** any self-graded gate bound to citations/observables.
- **Insurance before irreversible moves;** empirical-evidence inference (proof X already happened beats a ledger entry asking whether X is possible); **who-watches-the-failure-trace** (silent failures outrank loud ones).

## Rules for adding exemplars

- Only from models at least as strong as the existing set's source (Fable-class).
- Full file → `SPAR_HOME/exemplars/`; this index gets the pointer + one-line behavior notes.
- Note whether it was executed and what reality diverged on (the honest asterisk) — never edit an exemplar to look better than the model did.
