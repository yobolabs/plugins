# Mission Brief — template

Intake artifact. One per mission, first file in `_context/{project}/growth/{slug}/`. Fill every field; `unknown` is a legal value that recon must then hunt or surface — a blank is not.

```markdown
# Mission: {slug}

- **Objective (observable):** <the metric movement or design outcome that would count as success, stated so a third party could check it — "activation 30%→50%" / "a loyalty mechanic set worth A/B testing on segment X">
- **Input shape:** metric-problem | design-surface
- **Product + vertical:** <e.g. merchant SaaS / F&B CRM / consumer marketplace>
- **Metric target** (metric-problem only): <metric, current value, target value, measurement source>
- **Design surface** (design-surface only): <the surface being designed — onboarding, loyalty, referral, checkout, pricing page>
- **Segment:** <who moves the number — new merchants, lapsed diners, trial users>
- **Depth:** quick (3 lenses, top-3 deepened) | deep (5 lenses, top-5 deepened)
- **Lenses selected:** <from the metric-family mapping; name them + why>
- **Constraints:** <brand voice, compliance, platform limits, standing exclusions>
- **Already known tried-and-failed:** <anything the requester knows offhand; recon sweeps for more>
- **Deliverable path:** _context/{project}/growth/{slug}/growth-brief.md
```

Rules:
- Depth bounds are artifact counts (lenses, deepened cards), never durations. <!-- validator:allow -->
- Objective must be observable — "improve engagement" fails the template; "raise D7 return rate for new merchants" passes.
- If the requester has no current metric value on a metric-problem mission, record `current: unknown` — recon asks the user before lenses fire; lenses never run on invented numbers.
