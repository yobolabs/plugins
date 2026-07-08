# Crit Report — <mission slug>, draft <n>

> Adversarial pass over the spec + mockup draft. The critic names failures; it does not fix them. A finding without evidence and a falsifier is filler and gets struck.

## Steelman
<Before any attack: the draft's strongest case, stated fairly — best usability claim + best design-system-fit argument, with the evidence that earns them. Attacks that skip this are invalid (R1). A steelman that weakens the draft counts as a violation even here.>

## Findings
One block per finding, grouped by attack class. Severity bands (closed): **kills-the-screen** · **hurts** · **cosmetic**.

### <F-n> — <screen / spec section it targets>
- **Attack class:** <1 design-system-drift | 2 accessibility | 3 ux-anti-pattern | 4 state-responsive-coverage | 5 implementability>
- **Severity:** <kills-the-screen | hurts | cosmetic>
- **What fails:** <the observable failure, at real viewport size and real data volume — not a preference>
- **Evidence:** <trap entry id `traps/<file>#<id>` | M-rule number | recon marker/tag — every finding cites exactly what it stands on>
- **Falsifier:** <what a passing screen/spec would show — the observation that kills this finding>

The five attack classes, all walked every pass:
1. **Design-system-drift scan** — invented components, off-token colors/spacing, one-off variants, vs the recon inventory.
2. **Accessibility attack** — contrast, touch targets, keyboard/focus order, at-density readability.
3. **UX anti-pattern scan** — the draft against all five trap files.
4. **State/responsive-coverage challenge** — hunt the missing state, the breaking breakpoint, the unhandled long-content case.
5. **Implementability attack** — does every spec element map to a real component or a declared new-component request? Invented capabilities flagged.

## Zero-hit justification
Only for attack classes that produced NO findings. A crit that lands zero hits is suspect — earn the clean pass or it doesn't count.

| Attack class | What was checked | Why it passed |
|---|---|---|
| <class> | <the specific things examined — traps walked, M-rules checked, components verified against the inventory> | <the evidence the draft survived on> |

## Summary
| Attack class | kills-the-screen | hurts | cosmetic |
|---|---|---|---|
| 1 design-system-drift | | | |
| 2 accessibility | | | |
| 3 ux-anti-pattern | | | |
| 4 state-responsive-coverage | | | |
| 5 implementability | | | |

<If ALL classes are zero-hit: this pass is suspect. The orchestrator may re-dispatch ONCE with a stricter instruction; a second zero-hit stands, with this justification recorded in the spec file's integrity note.>

## Director response
Filled during revision. Concession symmetry (R4): findings the director refutes with evidence are declared **dead** explicitly, with the defeating evidence; fixed findings name the fix. Nothing silently disappears.

| Finding | Disposition | Evidence / fix |
|---|---|---|
| <F-n> | fixed | <what changed> |
| <F-n> | dead — refuted | <the evidence that defeated it> |
