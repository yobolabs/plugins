# Candidate Card — template

One per generated mechanic, produced by `growth-lens`. Field order is load-bearing (specs §5.2) — the judge and the growth-brief consume cards positionally. Keep each field to 1–3 lines; a card is a dense claim, not an essay.

```markdown
### C-{lens}-{n}: {mechanism name}

1. **Mechanism:** <the mechanic itself, one line — what the user experiences / what the product does>
2. **Psychology basis:** <which model from the lens pack this draws on, and the specific force it uses — e.g. "Hooked variable reward: unpredictable social validation on post">
3. **Cited precedent:** <case-library id OR recon web hit with source+date; "none found" is legal and honest — grade will reflect it>
4. **Product-fit sketch:** <stage / brand / segment fit in one line; name the mismatch if partial>
5. **Expected metric impact:** <direction + magnitude class: small / moderate / large — anchored to what the precedent actually moved; never an invented percentage>
6. **Instrumentation needs:** <events/fields that must exist to measure it; "already instrumented" if known true>
```

Rules:
- Magnitude classes only — a card claiming "+23%" without a cited precedent doing exactly that is invalid.
- Precedent field cites; it never asserts from vibes. No source → say so.
- The lens agent generates and STOPS — no self-ranking, no verdicts, no dark-pattern self-clearing. That is the judge's job.
- One mechanism per card. A "combo" mechanic is legal only if the combination itself is the mechanism (e.g. streak + repair token).
