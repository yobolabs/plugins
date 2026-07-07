# Dark-Patterns Rubric — the line, drawn consciously

Binds `growth-judge` on every candidate. Policy (locked, spec D6): **label + default-exclude** — the generator may surface dark patterns, the judge tags them with severity, they are excluded from the ranked portfolio, and the growth-brief shows summary rows only. Full cards persist in the mission dir's `flagged.md`; the human can `show flagged` and consciously override. The framework never promotes a flagged mechanic silently. A hard ban would hide ideas the team should knowingly reject — seeing the line is how the team keeps it.

## Taxonomy

| Class | Definition | Signature examples |
|---|---|---|
| **fabricated-scarcity** | urgency/scarcity signals not backed by reality | fake countdown timers; "3 left!" on unlimited inventory; invented "offer expires" |
| **forced-continuity** | friction asymmetry between entering and leaving | one-click subscribe, phone-call cancel; hidden auto-renew; roach-motel flows |
| **guilt-loops** | shame or social pressure as the retention force | confirmshaming copy ("No thanks, I hate saving money"); guilt-framed streak breaks; "your friends will see you left" |
| **hidden-costs** | material costs revealed after commitment | drip pricing; fees at final checkout step; teaser rates without disclosure |
| **compulsion-beyond-value** | engagement loops that extract time/attention past user benefit | infinite-scroll + variable reward with no stopping cue aimed at vulnerable segments; appointment mechanics that punish absence disproportionately |
| **pay-to-win-misdirection** | monetization disguised as merit or chance | odds-hidden loot boxes; leaderboards silently favoring spenders; "skill" contests decided by purchases |
| **consent-erosion** | choice architecture that manufactures agreement | pre-ticked boxes; disguised ads-as-content; settings mazes for privacy opt-outs |

## Severity

- **S1 — reputational** — legal but corrosive; users feel manipulated when they notice (confirmshaming, mild fabricated urgency).
- **S2 — trust-breaking** — measurable trust/churn backlash documented in precedent; often platform-policy violations (hidden costs, forced continuity).
- **S3 — regulatory** — exposure under consumer-protection / dark-pattern regulation (FTC, EU DSA, GDPR consent rules): odds-hidden loot boxes, drip pricing, consent erosion.

## The borderline rule
**Real-deadline urgency is fine; fabricated urgency is dark.** A discount that genuinely ends Sunday may say so. A timer that resets on reload is `fabricated-scarcity`. The test: *would the mechanic survive the user learning exactly how it works?* Transparent mechanics survive; dark ones depend on the user not looking.

Adjacent borderlines, same test:
- Streaks with repair/freeze tokens = fine (Duolingo-style, user-positive). Streaks whose break triggers shame copy = `guilt-loops`.
- Social proof with real numbers = fine. Rounded-up or invented activity ("12 people are viewing") = `fabricated-scarcity`.
- Loss-framed offers ("don't lose your credits") on real expiring value = fine. On value that never actually expires = dark.
- Real-but-business-manufactured expiry: value technically expires (a real reset/accounting event exists) BUT the expiry is engineered on ~zero-marginal-cost capacity purely to force a return cadence. Same test — would the user, learning exactly WHY it expires, feel manipulated? Genuinely perishable or capacity/accounting-backed expiry = fine. Expiry manufactured only to drive cadence = `fabricated-scarcity`, even though the reset is "real" — the honest version surfaces the same accrued value on a cadence without the expiry pressure.

## Judge procedure
1. Classify: any taxonomy match → `flag` verdict + class + severity + one-line reason (this feeds the growth-brief §3 summary row).
2. Write the FULL candidate-card (untruncated) to the mission dir's `flagged.md` — never delete, never summarize away (R4: revival keeps tag).
3. Exclude from ranked portfolio. No flagged candidate ranks, regardless of impact class.
4. On `show flagged`: re-render §3 from `flagged.md` — no loop re-run, tags and severities intact. Promotion into the portfolio is a human decision recorded in the brief's integrity note.

Encoded in BOTH this rubric and the `growth-judge` agent prompt (specs §6.4) — one drifting from the other is a validator-era bug worth filing.
