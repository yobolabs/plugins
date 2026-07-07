# Insights — the generative trap-library

Generalized hits and misses from reality: `growthify feedback` completions and `simulate` replays write here. Insights feed the judge's novelty check (previously-failed mechanics get killed/flagged citing the entry) and future lens patches. This is the file-level analog of wargame's trap library, pointed in the generative direction.

## Entry convention — one file per insight

Filename: `{lens}-{mechanism-slug}-{worked|failed|calibration}.md`

```markdown
- **id:** <filename sans .md>
- **mechanism:** <mechanic, as the lens pack names it>
- **lens:** <owning pack>
- **context class:** <B2B SaaS / consumer app / marketplace / e-commerce — never a named merchant>
- **what happened (generalized):** <mechanism worked/failed + WHY, in mechanism terms — "streak mechanic failed: cadence forced daily on weekly-value product; repair tokens unused" — no raw numbers>
- **magnitude-class error** (calibration entries): <predicted class vs actual class>
- **source:** <mission or replay slug — pointer, local-only; teammate machines may not resolve it>
- **implication:** <what the judge or a lens should do differently — the actionable line>
```

## Rules
- **Privacy:** no raw metrics, no merchant/org names, no revenue figures. Context class + outcome class carry the signal. The validator privacy scope scans this directory like any other.
- Generalize to the mechanism level: "referral payout on signup attracted fraud" is an insight; "merchant X lost $Y" is a leak. <!-- validator:allow -->
- One insight per file — grep-ability beats prose.
- Insights are never deleted; a later reversal gets its own entry citing the earlier one.
