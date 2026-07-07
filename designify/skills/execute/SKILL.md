---
name: execute
description: Drive the existing actuator tools from a designify craft file — reuse gate, render via higgsfield/slides ad-studio/frontend-design, then climb the proof ladder L0–L4 with a stall protocol and a batch ledger. Use when the user says "designify execute", "execute the craft file", "render the creatives", "generate the assets from the craft file", or after a designify mission assembles craft.md and the user wants assets now.
---

# Execute — the hands, disciplined

Consumes a `craft.md` (the designify loop's deliverable). This skill disciplines the actuators; it never replaces them, and it never redesigns — direction questions go back to the craft file's owner, not into improvisation.

**Inputs:** the mission dir (`_context/{project}/design/{slug}/`) — craft file + ledger. If either is missing, stop: run the designify loop first.

## Before the first render

1. **Re-verify entity resolution** from the ledger: brand kit path, output dir, placement export specs. Stale entries re-probe; a WRITE never depends on a carried fact.
2. **Load the M-rules** — every render is checked against them by number.

## Per asset (walk the craft file's per-asset sections in order)

1. **Reuse gate** — does an existing asset satisfy the directive? Search the recon existing-asset sweep + the mission dir + brand asset library; **cite the search in the ledger** (found → adapt/skip; absent → the citation IS the license to generate).
2. **Actuator call** — pick by asset class:
   - `higgsfield-generate` / `higgsfield-product-photoshoot` / `higgsfield-marketplace-cards` — image generation
   - slides ad-studio — composed/branded layouts
   - `frontend-design` — HTML statics
   - Prompt = the asset's **positive block + negative/avoid-list verbatim** from the craft file. Do not freelance prompt content; mission-specific tweaks get recorded in the ledger as deviations.
   - (v2, not now: ad-engine/capcut/remotion for motion.)
3. **Proof ladder** — every claim states its rung; partial evidence is declared partial:
   - **L0** — renders without errors
   - **L1** — platform-spec compliant: dims, file size, safe zones — mechanically checkable against the asset's platform-spec block
   - **L2** — brief + brand conformance: M-rule pass by number + the asset's expected-vs-broken checklist; **vision check at actual placement size, not zoomed**
   - **L3** — judge panel pass: dispatch `design-judge` with the real render against the authenticity + craft rubrics
   - **L4** — live performance vs benchmark (Looker; arms when access lands)
   - **Default DoD = L3.** "Done" without a rung is not a claim.
4. **Ledger every asset** — prompts used (positive + negative), actuator, verdicts per rung, M-rule conformance, corrections received. Handoff-ready at any moment.

## Stall protocol

Same defect across **3 generations** of one asset → STOP. No fourth blind attempt. Output a structured help request: what was tried, what was ruled out, what is verified vs assumed, the narrowest open question. Then escalate to the user or route the defect back to the craft file (a directive that can't render may be a directive problem — that's a designify feedback entry, not an execute failure to hide).

## Batch re-grounding

Every **5 assets** (or at any natural break): re-touch the M-rules — still held over the last chunk? — and compare the newest render against asset #1 for drift (palette, tone, weight, framing). Drift found → fix forward AND record the drift signature in the ledger (candidate `brand-drift.md` trap entry).

## Discipline

- Corrections from the user mid-batch are gold: ledger them verbatim — each is a candidate trap/pack entry at feedback time.
- No time estimates. No fake precision in any quality judgment — rubric bands only.
- Real campaign data stays in the mission dir (INV-3).
