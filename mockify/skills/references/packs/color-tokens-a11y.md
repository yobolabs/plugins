# Pack: Color, Tokens & Accessibility

The lens for color as a semantic token system with measurable floors - meaning first, hue second, and both themes proven.

## 1. Scope

This lens owns how color is used, not which colors exist: semantic token roles over raw values, WCAG contrast floors, dark/light theme parity, the state-color vocabulary, accent discipline, and focus visibility. The app's theme file owns the actual values; recon reports them, tagged `checked` when read from the theme source, `guessing` when inferred - and a guessing-tagged token value never anchors a spec.

Not covered here: where colored elements sit in the scan order (visual-hierarchy pack), which states exist per component (interaction-states pack owns the matrix; this lens colors it), type sizing (ui-typography pack), and chart-heavy composition (this lens sets the data-palette rule; the mission's dataviz guidance carries the rest).

## 2. Core craft principles

- **Name the role, not the hue.** `background`, `foreground`, `muted`, `accent`, `destructive`, `border`, `ring` - the shadcn-derived semantic vocabulary the @jetdevs/framework themes expose. A mock that hardcodes a hex value is a mock that breaks in dark mode and drifts from every future theme change.
- **Every color has two renderings.** Light and dark are parallel themes served by the same semantic tokens, not an afterthought filter. Shadows weaken in dark themes (borders take over); pure white text vibrates on pure black; both renderings get judged, not just the one the mock was drafted in.
- **Contrast is a floor with numbers.** 4.5:1 for body text, 3:1 for large text and for essential UI graphics - borders of inputs, focus indicators, icons that carry meaning. The habitual failure is `muted-foreground` on `muted` backgrounds: check it, in both themes.
- **State colors are a reserved vocabulary.** Destructive/error, warning, success, info - each maps to a fixed token family and means one thing. Red is spent on destruction and failure only; spend it on decoration and the user stops flinching when it matters.
- **Color never signals alone.** Any meaning carried by hue is also carried by an icon, a label, or a position - for color-blind users and for grayscale renderings. A status system that is only a colored dot is half a status system.
- **Interactive color derives, never invents.** Hover, active, selected, and focus tints derive from the base token through the system's own state layers. A component inventing its own hover blue is drift with a halo.
- **Neutral dominates; accent points.** Working UI runs on background/muted/border neutrals; the accent appears on the primary action, active navigation, and selection - and almost nowhere else. Saturation everywhere is the machine-generated tell.
- **Focus is a color obligation.** Every interactive element shows a visible focus ring (`ring` token) meeting 3:1 against its surroundings. Keyboard users navigate by it; a mock without focus states is a mock of half the product.

## 3. Directive inventory

**CT-1 - Tokens only**
- principle: name the role, not the hue - every color in mock and spec is a semantic token reference.
- preconditions: always. When no existing token expresses the need, the escalation is a new-component/token request in the spec, never an inline value.
- failure modes: hex values pasted from screenshots; Tailwind palette classes (`slate-500`) bypassing the theme; one screen themed, its sibling hardcoded.
- spec hooks: per-screen color inventory lists only token names; avoid-list bans raw hex and raw palette classes.

**CT-2 - Prove both themes**
- principle: every color has two renderings - each screen is checked in light and dark before it ships.
- preconditions: all screens; the HTML mock renders both via the theme toggle, not by hand-swapping values.
- failure modes: dark mode as an unreviewed inversion; shadows that vanish leaving groups unbounded; images and illustrations with baked-in light backgrounds.
- spec hooks: expected-vs-broken line: "both themes rendered; every boundary that separates in light separates in dark".

**CT-3 - Hold the contrast floors**
- principle: 4.5:1 body, 3:1 large text and essential UI graphics - measured, not eyeballed.
- preconditions: all text and meaningful graphics, in both themes; muted text, placeholder text, and text over tinted fills are the mandatory checks. Disabled elements are exempt from the floor but must remain perceivable as present.
- failure modes: muted-on-muted below the floor; placeholder text passing in light and failing in dark; white text on the accent color assumed rather than measured.
- spec hooks: spec flags every token pairing used for reading-critical text; crit pass measures the flagged pairs.

**CT-4 - Reserve the state vocabulary**
- principle: state colors are a fixed mapping - destructive, warning, success, info - and never decoration.
- preconditions: any screen expressing status, validation, or risk. The mapping comes from the theme; the spec references it, never re-derives it.
- failure modes: red section headers on healthy screens; success-green used as a brand flourish; five badge colors where the domain has three states.
- spec hooks: spec lists the screen's state vocabulary with token per state; avoid-list bans state colors outside state meaning.

**CT-5 - Pair color with a second signal**
- principle: color never signals alone - icon, label, or position carries the same meaning in parallel.
- preconditions: status indicators, validation, diffs, chart series, anywhere hue differentiates.
- failure modes: dot-only status columns; error borders with no message; a chart legend that is the only decoder.
- spec hooks: states matrix notes the redundant channel per colored signal; expected-vs-broken line: "meaning survives grayscale".

**CT-6 - Budget the accent**
- principle: neutral dominates; accent points - primary action, active nav, selection, and little else.
- preconditions: all working screens. Marketing-in-app surfaces get a wider budget but still one dominant accent moment per surface.
- failure modes: accent borders, accent icons, and accent badges everywhere until nothing points; gradient washes and glow effects announcing generated-by-default styling.
- spec hooks: spec names each accent appearance and its justification; avoid-list bans gradients and glows unless the DESIGN.md defines them.

**CT-7 - Show focus everywhere**
- principle: focus is a color obligation - visible `ring` on every interactive element, 3:1 against adjacent colors.
- preconditions: every button, input, link, row action, and custom interactive element in the mock.
- failure modes: `outline: none` with nothing replacing it; focus visible on inputs but missing on icon buttons and rows; ring invisible on tinted fills.
- spec hooks: expected-vs-broken line: "tab through the screen - every stop is visibly ringed in both themes".

## 4. Signature questions

1. Can every color on this screen be named as a semantic token - and does any hex value survive in the mock?
2. Rendered in dark: does every boundary, shadow-group, and status still separate?
3. What are the three worst contrast pairings here, and do they clear their floors in both themes?
4. What does red mean on this screen - and is it spent anywhere that is not destructive or failing?
5. If this screen rendered in grayscale, what meaning would disappear?
6. How many times does the accent appear, and does each appearance point at something?
7. Tab through the mock: where does focus vanish?

## 5. Placement / asset-class mapping

| Screen class | Weight | What this lens demands here |
|---|---|---|
| Dashboard | primary | State colors on status only; data palette distinct from state vocabulary; tiles legible in both themes |
| List + detail | primary | Badge vocabulary fixed and redundant-signaled; row hover/selected derive from tokens; muted cells above floor |
| Marketing-in-app | primary | The widest accent budget - and the strongest gradient/glow temptation to refuse |
| Form + wizard | secondary | Validation states from the reserved vocabulary; error text and borders above floor; focus rings on every field |
| Settings | secondary | Danger zone in destructive tokens, quarantined; toggles readable in both themes without hue alone |
| Mobile-PWA shell | secondary | Floors rechecked outdoors-brightness small-screen honest; active nav state unmistakable |

## 6. Exemplar pointers

The `../exemplars/` directory starts empty; `../exemplars/README.md` defines how slots fill from graded missions. Kinds this pack needs:

- exemplar needed: one screen rendered in both themes side by side with every token pairing annotated (positive anchor for CT-1/CT-2)
- exemplar needed: a status-badge system that survives grayscale, beside a dot-only draft that does not (negative/positive pair for CT-4/CT-5)
- exemplar needed: an accent-audit of a screen before and after the budget was enforced (anchor for CT-6)

## 7. Trap cross-references

- `../traps/design-system-drift.md` - hex leaks, raw palette classes, and invented hover tints bypassing the theme's semantic tokens (violates CT-1, CT-6's derive rule)
- `../traps/ai-slop-ui.md` - gradient washes, glow effects, and saturation-everywhere styling that reads as generated-by-default (violates CT-6)
- `../traps/state-blindness.md` - state colors never designed because only the happy path was mocked; disabled and error renderings missing (violates CT-4, CT-7)
- `../traps/responsive-failures.md` - contrast judged on a bright desktop canvas only, failing at small sizes and dark theme (violates CT-2, CT-3)
- `../traps/flow-friction.md` - a destructive action styled at primary-accent strength, inviting the misclick (violates CT-4)
