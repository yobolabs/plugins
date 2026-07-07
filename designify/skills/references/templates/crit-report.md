# Crit Report — <mission slug>, draft <n>

> Adversarial pass over the craft-file draft. The critic names failures; it does not fix them. A finding without evidence and a falsifier is filler and gets struck.

## Steelman
<Before any attack: the draft's strongest case, stated fairly — best audience-fit claim + best authenticity argument, with the evidence that earns them. Attacks that skip this are invalid (R1). A steelman that weakens the draft counts as a violation even here.>

## Findings
One block per finding. Severity bands (closed): **kills-the-asset** · **hurts** · **cosmetic**.

### <F-n> — <asset / section it targets>
- **Attack class:** <1 authenticity-red-team | 2 anti-pattern-scan | 3 channel-compliance | 4 brand-conformance | 5 expected-vs-broken>
- **Severity:** <kills-the-asset | hurts | cosmetic>
- **What fails:** <the observable failure, at actual placement size — not a preference>
- **Evidence:** <trap entry id `traps/<file>#<id>` | M-rule number | recon marker/tag — every finding cites exactly what it stands on>
- **Falsifier:** <what a passing render/draft would show — the observation that kills this finding>

The five attack classes, all walked every pass:
1. **Authenticity red-team** — would THIS audience call it fake, contrived, or slop? Every hit cites recon evidence.
2. **Anti-pattern scan** — the draft against all five trap files.
3. **Channel compliance** — safe zones, text rules, dims, per placement.
4. **Brand conformance** — per M-rule, rule by rule.
5. **Expected-vs-broken challenge** — per asset: is the failure description honest, observable, and checkable at L1/L2?

## Zero-hit justification
Only for attack classes that produced NO findings. A crit that lands zero hits is suspect — earn the clean pass or it doesn't count.

| Attack class | What was checked | Why it passed |
|---|---|---|
| <class> | <the specific things examined — traps walked, rules checked, markers hunted> | <the evidence the draft survived on> |

## Summary
| Attack class | kills-the-asset | hurts | cosmetic |
|---|---|---|---|
| 1 authenticity | | | |
| 2 anti-pattern | | | |
| 3 channel | | | |
| 4 brand | | | |
| 5 expected-vs-broken | | | |

<If ALL classes are zero-hit: this pass is suspect. The orchestrator may re-dispatch ONCE with a stricter instruction; a second zero-hit stands, with this justification recorded in the craft file's integrity note.>

## Director response
Filled during revision. Concession symmetry (R4): findings the director refutes with evidence are declared **dead** explicitly, with the defeating evidence; fixed findings name the fix. Nothing silently disappears.

| Finding | Disposition | Evidence / fix |
|---|---|---|
| <F-n> | fixed | <what changed> |
| <F-n> | dead — refuted | <the evidence that defeated it> |
