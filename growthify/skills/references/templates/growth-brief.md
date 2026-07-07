# Growth Brief — template

The assembled mission deliverable: `_context/{project}/growth/{slug}/growth-brief.md`. Section order is load-bearing (specs §5.2) — do not reorder, do not omit. Must be readable end-to-end by a teammate who did not run the mission. Tables terse; prose only where a decision needs context.

```markdown
# Growth Brief — {slug}

## 1. Diagnosis summary
<metric-problem: the funnel picture, where the leak is, what recon verified vs assumed.
 design-surface: the surface, the segment psychology, the constraint set.
 Cite the recon brief; tag remaining unknowns.>

## 2. Ranked portfolio
| # | Mechanism | Lens | Impact (class) | Evidence | Reversibility | Fit | Verdict |
|---|---|---|---|---|---|---|---|
<advance-verdict candidates only, rank order. Grades from ranking.md — honest bands, no invented numbers.>

## 3. Flagged-excluded (dark patterns)
| Mechanism class | Severity | Why excluded |
|---|---|---|
<SUMMARY ROWS ONLY — mechanism class, severity, one-line reason. No implementation detail.
 Full cards: ./flagged.md (this mission dir). `show flagged` re-renders from there; no loop re-run.>

## 4. Experiment cards (top-N)
<the deepened experiment-card blocks, verbatim per template>

## 5. Escalations
- **Spar the winner:** <offer: full spar loop on E-1 — when the top bet is contested or expensive>
- **Wargame the build:** <offer: war-game any one-way-door mechanic before implementation — name which cards qualify and why>

## 6. Feedback hook
Run `growthify feedback {slug}` once any experiment ships and resolves. Insights are written only on complete data (five-state contract).

## 7. Integrity note
<judge protocol outcome: candidates in / killed / flagged / advanced; zero-kill justification block verbatim if one was issued; re-run count (0 or 1).>
```

Rules:
- Section 3 default render is summary-only. Promoting a flagged mechanic into section 2 requires the human to say so explicitly after `show flagged` — the brief never does it silently.
- Section 7 is mandatory even when boring — "9 in, 3 killed, 1 flagged, 5 advanced, no re-run" is one line and keeps the judge honest.
- No time estimates anywhere, including instrumentation checklists. <!-- validator:allow -->
