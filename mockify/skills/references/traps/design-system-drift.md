# Traps: Design System Drift

Failures of design-system fidelity - the mockup or spec quietly forks the system it claims to build on: invented components, off-token values, one-off variants, override styling, and the same job solved two different ways. In this ecosystem the system is real and named - @jetdevs/framework components, per-app theme tokens, DESIGN.md conventions - so drift is checkable, not a taste call: the mock-ledger pins the component inventory and token source at entity resolution, and every entry below is screened against that pinned inventory. The implementability rubric is the enforcement instrument - an element that maps to nothing real is a spec that cannot be built.

How entries are consumed: spec-file avoid-lists cite entries by id; the director screens the deepen-mode draft against the markers before the crit ever sees it; the critic's anti-pattern scan walks each mockup element against the ledger inventory using these markers. Each entry carries the eight schema fields (id, anti-pattern, markers, why-it-fails, negative-prompt, severity, provenance-class, privacy-check). Severity bands are closed and honest: kills-the-screen (the spec/mockup cannot ship with it), hurts (ships only with a recorded reason), cosmetic (note it, fix in the next pass).

### design-system-drift-01 - invented-component
- id: design-system-drift-01
- anti-pattern: The mockup draws a novel widget where the pinned inventory has an equivalent - hand-rolled table markup instead of the framework DataTable, a bespoke dialog instead of the system modal, a custom dropdown instead of the system select.
- markers: An element in the mockup that maps to no component in the mock-ledger inventory AND no declared new-component request; near-miss re-implementations (a table that is almost DataTable but with a different header treatment or its own pagination grammar); the spec's component map naming a component the mockup visibly does not render.
- why-it-fails: An unmapped element is an unbuildable spec (implementability rubric) - the implementer either rebuilds the system component badly or silently substitutes it, and either way the mockup was evidence for nothing. Context class: genuinely novel needs are legitimate through the spec's new-component request channel with justification - never silently.
- negative-prompt: every widget must be a named component from the pinned inventory, no hand-rolled tables or dialogs or selects, unmet needs go to the new-component request section not into invented markup
- severity: kills-the-screen
- provenance-class: session corpus
- privacy-check: pass - generalized system-fidelity failure class; component and token names are ecosystem-allowed (D7); no end-user, customer, or mission data

### design-system-drift-02 - off-token-color
- id: design-system-drift-02
- anti-pattern: Raw color values where the theme defines semantic roles - literal hex codes, arbitrary palette steps, and status colors that bypass the state tokens.
- markers: Hex literals in mockup CSS where a semantic token exists (background, foreground, muted, border, destructive); raw palette-step utilities instead of semantic classes; success/warning/error conveyed in colors the state tokens do not produce; anything that breaks when the theme flips - the dark/light parity check is the cheapest detector (color-tokens-a11y pack). Context class: data-viz series colors may extend beyond the semantic set when a declared viz palette defines them.
- why-it-fails: Semantic tokens are the mechanism by which both themes, future rebrands, and per-app theming come for free; every raw value is a small fork that must be found by hand later, and the mockup stops being evidence of what the themed app will look like.
- negative-prompt: semantic theme tokens only, no raw hex values, no arbitrary palette steps, status colors from the state tokens, must survive a dark/light theme flip
- severity: hurts
- provenance-class: session corpus
- privacy-check: pass - generalized system-fidelity failure class; component and token names are ecosystem-allowed (D7); no end-user, customer, or mission data

### design-system-drift-03 - off-scale-spacing
- id: design-system-drift-03
- anti-pattern: Spacing off the scale - arbitrary pixel values, margin nudges, and gutters that differ between sibling elements doing the same job.
- markers: Paddings and gaps at values the spacing scale does not contain; margins used to nudge individual elements where the layout grammar uses container gap; card grids whose gutters differ from screen to screen; the same composition spaced differently in two places. Context class: a one-step optical correction on an icon or badge is craft when recorded, drift when habitual.
- why-it-fails: The scale is what makes screens feel like one product; off-scale values read as wobble at a glance even when no one can name why, and they multiply into per-screen CSS the implementer must reverse-engineer.
- negative-prompt: spacing values from the scale only, container gap over margin nudges, identical gutters for identical compositions
- severity: cosmetic
- provenance-class: published craft knowledge
- privacy-check: pass - generalized system-fidelity failure class; component and token names are ecosystem-allowed (D7); no end-user, customer, or mission data

### design-system-drift-04 - variant-proliferation
- id: design-system-drift-04
- anti-pattern: A new visual variant of an existing component minted for one screen - a fourth button style, a custom-padded card, a novel badge shape the system never defined.
- markers: A component rendered differently from its system appearance (border, padding, typography) under no variant name the component's API offers; the same component styled two ways on two screens; variant names invented in the spec that the inventory cannot confirm. Context class: a missing variant that several screens genuinely need is a new-component/variant request with justification - one screen's preference is not.
- why-it-fails: Variants are the system's controlled extension points; uncontrolled proliferation means the next designer finds six button styles and picks a seventh, and the system's promise - decided once, consistent everywhere - is spent.
- negative-prompt: only variants the component API defines, no one-off restyling of system components, missing variants become a declared request not a local invention
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized system-fidelity failure class; component and token names are ecosystem-allowed (D7); no end-user, customer, or mission data

### design-system-drift-05 - override-forking
- id: design-system-drift-05
- anti-pattern: Bending system components with style overrides - inline styles, important-flag escalation, or deep selectors reaching into component internals instead of the variant API or a declared request.
- markers: Style attributes on framework component markup; CSS targeting a component's internal structure; a spec whose component map says DataTable while the mockup demonstrates behavior DataTable does not have (the silent behavioral fork); overrides that reproduce what an existing variant already does.
- why-it-fails: Overrides are the mechanism by which design systems die - the forked copy stops receiving system fixes, breaks on the next component upgrade, and teaches every subsequent screen that the system is optional. Context class: none in a spec deliverable; the escape valve is the new-component request, which is visible and reviewable where an override is neither.
- negative-prompt: no inline style overrides on system components, no CSS reaching into component internals, use the variant API or file a new-component request
- severity: kills-the-screen
- provenance-class: session corpus
- privacy-check: pass - generalized system-fidelity failure class; component and token names are ecosystem-allowed (D7); no end-user, customer, or mission data

### design-system-drift-06 - off-scale-typography
- id: design-system-drift-06
- anti-pattern: Type outside the system - novel display faces the theme never loads, arbitrary font sizes between scale steps, weight soup across one screen.
- markers: A font family the theme does not define; sizes that sit between the type scale's steps; four or more weights on a single screen; UI labels set at display sizes or display copy at label sizes (the ui-typography pack owns the scale grammar). Context class: marketing-in-app surfaces may use the display end of the existing scale - not new faces.
- why-it-fails: Type is the most-repeated element in a product; off-scale type makes one screen feel foreign inside its own app, and a novel face is a licensing, loading, and fallback liability the spec never priced.
- negative-prompt: theme font families only, sizes from the type scale, at most three weights per screen, no display faces smuggled in for one heading
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized system-fidelity failure class; component and token names are ecosystem-allowed (D7); no end-user, customer, or mission data

### design-system-drift-07 - pattern-drift
- id: design-system-drift-07
- anti-pattern: The same job solved with two different patterns across screens - two filter grammars, two date pickers, inline edit here and modal edit there, for the same data shape.
- markers: Sibling screens in the spec solving one interaction job with different patterns; a pattern imported from another ecosystem app without the context that justified it there; the flow map showing two entry points to the same task with different mechanics. Context class: divergence is legitimate when the jobs actually differ (bulk table edit vs single-record form) and the spec says why (ux-flow-ia pack).
- why-it-fails: Users learn patterns, not screens - each divergence resets that learning and doubles the implementation and maintenance surface for zero user value; pattern consistency is the cheapest usability the system sells.
- negative-prompt: one pattern per job across all screens in scope, reuse the app's existing filter and edit and picker grammars, divergence requires a recorded reason
- severity: hurts
- provenance-class: session corpus
- privacy-check: pass - generalized system-fidelity failure class; component and token names are ecosystem-allowed (D7); no end-user, customer, or mission data
