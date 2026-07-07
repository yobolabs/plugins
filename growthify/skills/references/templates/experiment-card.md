# Experiment Card — template

One per deepened winner (top-3 quick / top-5 deep). This is the ship-ready artifact: a team should be able to build and run the test from the card alone. Field order is load-bearing (specs §5.2). Ledger-compatible by design — a future experiment-ledger consumes cards without rework.

```markdown
### E-{n}: {mechanism name}  (from C-{lens}-{n})

1. **Hypothesis (falsifiable):** <IF we ship X to segment Y, THEN metric M moves in direction D by at least magnitude-class Z, BECAUSE psychological force F — every clause required>
2. **Primary metric:** <exact definition + measurement source; the ONE number that decides>
3. **Guardrail metrics (FROZEN):** <2–3 metrics that must not degrade, each with its frozen definition written HERE — the definition may not change after launch; anti-Goodhart>
4. **Cell design:** <A/B (split + allocation) | pre/post (window + seasonality note) — and the unit of randomization>
5. **Success threshold:** <the pre-committed line that counts as a win, on the primary metric>
6. **Kill criteria:** <the pre-committed line that stops the experiment — guardrail breach level or primary-metric harm>
7. **Upstream dependency:** <any card whose mechanic PRODUCES this card's content or moves its primary metric — name it and the fix-order; if this card's surface would be empty without the upstream mechanic, say so as an empty-content guard ("ship E-{m} first or this card tests nothing"); if none, "none">
8. **Instrumentation checklist:** <every event/field needed, exists-today vs must-build>
```

Rules:
- Guardrail definitions are FROZEN at card-writing. Re-defining a guardrail mid-experiment = the experiment is void. The eval harness is never owned by the thing being optimized. <!-- validator:allow -->
- Success threshold and kill criteria are written BEFORE launch. A threshold chosen after seeing data is not a threshold.
- Every card names at least one guardrail. A mechanic that "can't hurt anything" hasn't been thought about — the Goodhart check output belongs here.
- Cell design must name the randomization unit (user / merchant / session); mismatched units are the most common silent experiment bug.
