# Exemplars — Ground Truth War-Games (index of pointers)

War-games produced DIRECT (no framework) by a frontier model — currently Fable 5, 2026-07-06, before access cutoff. These are the standard `wargame-judge` scores framework output against, and the few-shot references for full-depth foresight.

**The full war-game files are PROJECT artifacts and live outside the plugin** (they contain initiative-specific detail that doesn't belong in a distributable). Canonical copies:

| Exemplar | Terrain | Path |
|---|---|---|
| One-way-doors review | decision | `_context/_fable/wargames/one-way-doors.md` |
| Commerce Platform P1 | greenfield multi-repo build | `_context/commerce/_specs/p1-commerce-platform/wargame.md` |
| STORY-011 gateway merge-back | operational git/deploy (calibration baseline) | `_context/_fable/blind/story011-wargame-fable-direct.md` |
| Sean-agent P1 | agent-infra / corpus pipeline | `_context/sean-agent/wargame-fable-direct.md` (Fable-5-direct, 2026-07-07) |

Calibration analysis:
- `_context/_fable/audits/calibration-story011.md` (framework+Opus ≈ 85% of Fable-direct; operational terrain; gap classification; patch log).
- `_context/sean-agent/calibration.md` (framework+Opus ≈ 78% of Fable-direct; recon-heavy corpus/agent-infra terrain; gap classification; PATCH A–K log).

## Exemplar behaviors the judge should demand (distilled from the four)

- **Premise-kill:** recon that corrects the mission brief's own framing when the facts contradict it (STORY-011: "recover a lost commit" → the commit was never lost). Run safe probes DURING the war-game, don't only design them.
- **Beyond-the-list findings:** the unknown-unknown hunt must surface items nobody asked about (one-way-doors found 4 unlisted doors).
- **Stored-data-outlives-code insight:** contracts embedded in persisted data (Puck block schema, golden-pair schema) get versioning at birth — retrofit impossible (commerce-p1, sean-agent-p1).
- **Challenged constraints get VERDICTS with fork triggers**, not mentions (commerce-p1: D7 separate-repo risk + reversible fold-in trigger).
- **Calibrate-the-extractor-first:** small hand-verified batch before bulk-processing agent-authored sources (sean-agent-p1 — convergent: appeared in BOTH the Opus framework run 2026-07-06 and the Fable-direct 2026-07-07).
- **Confidence as mechanics, not vibes:** any self-graded gate (trust ladder) bound to citations/observables (sean-agent-p1 — convergent across the same pair).
- **Derived confidence at design time:** the contract ships NO self-reported confidence in v1 — confidence is a checkable conjunction (basis stated + citation resolves + class membership + door type), designed in, not patched in as the countermove after eval failure (sean-agent-p1, Fable-direct).
- **Blind-first review sample:** the human-review gate has the reviewer answer a small sample BEFORE seeing the machine candidate — measuring the pipeline's context sufficiency, not just its outputs (sean-agent-p1).
- **Source-lifecycle probe / retention premise-kill:** verify how deep a mined corpus actually goes and what deletes it — a "deep history" transcript source turned out to be a one-month rolling window (sean-agent-p1 — now encoded in recon).
- **Order-5 forward walk into future consumers:** walk persisted artifacts forward into later-phase KB indexing and name the exclusion seam NOW (`golden/`/`decision-log/` never KB-indexed) (sean-agent-p1 — now encoded in cascade).
- **Executor-disposition modeling:** model the executor model's own failure modes as tagged facts with per-disposition guards and behavioral aborts (sean-agent-p1; frontier residue — see capability-gap.md #8).
- **Insurance before reliance** (git bundle/snapshot, widened beyond mutation to ambient retention/cleanup threats), **empirical-rights inference**, **who-watches-the-trace** (STORY-011 + sean-agent-p1 — now also encoded in recon/red-team prompts).

Rules for adding exemplars:
- Only from models at least as strong as the existing set's source.
- Full war-game files live beside the specs that generated them (`_context/<initiative>/`); this index is pointers + behavior notes only — never copy files here.
- Note whether it was executed and what reality diverged on (the honest asterisk) — never edit an exemplar to look better than the model did.
