# Pack: UI Typography

The lens for type as a working instrument - token scales, truncation plans, numbers that line up, and labels that survive density.

## 1. Scope

This lens owns how text renders in app UI: the type scale as a token system, line length and leading at working density, truncation and wrapping behavior for unbounded user data, numeric typography, label-value grammar, and casing conventions. It treats interface text as fragments parsed at a glance, not prose read at leisure.

Not covered here: the color of text against its background (color-tokens-a11y pack owns contrast math), where text blocks sit in the scan order (visual-hierarchy pack), how text regions reflow across breakpoints (layout-responsive pack), and what the words say - microcopy, field labels, and button verbs belong to the ux-flow-ia pack; this lens owns how those words render.

## 2. Core craft principles

- **The type scale is a token set, not a taste decision.** Every size traces to the theme scale (`text-xs` through `text-2xl` territory); app UI lives almost entirely in two or three sizes. A one-off pixel value is drift, and drift compounds across screens.
- **Interfaces are fragments, not paragraphs.** Labels, values, cells, captions - each is parsed in a glance. Optimize for glance parsing with stable size-weight pairings, and reserve paragraph styling for the rare block of explanatory prose.
- **Every dynamic string needs a truncation plan.** User data is unbounded: names run long, identifiers run longer. Every rendered string decides its behavior - truncate with ellipsis and expose the full value on demand, wrap, or clamp to N lines. Tables truncate; detail panes wrap.
- **Numbers are UI citizens.** Any column of numbers gets tabular figures (`tabular-nums`), right alignment, and a fixed decimal precision. Proportional figures in a data column make identical values look different lengths and destroy vertical comparison.
- **Label-value grammar stays constant.** Muted small label, stronger value; one orientation (stacked or inline) per screen class, held everywhere. The pair is the atom of detail panes and settings - inconsistency there reads as three different apps.
- **Leading scales against size.** Dense UI text takes tighter line height than marketing prose; small text takes looser letter spacing. The floor is readability at arm's length on a mid laptop screen, never below.
- **Casing is a system.** Sentence case for labels, headings, and buttons per the app's DESIGN.md conventions; all-caps reserved for tiny overline/eyebrow labels with added letter spacing; never caps for anything longer than a short label.
- **Prove type at density.** The mock is judged with realistic data volume and realistic string lengths, at the sizes the screen actually renders. Placeholder-width strings are how typography bugs hide.

## 3. Directive inventory

**UT-1 - Hold the token scale**
- principle: the scale is a token set - every font size, weight, and leading in the mock traces to the theme's typography tokens.
- preconditions: always. When a screen seems to need an off-scale size, the escalation is a new-component request in the spec, never an inline one-off.
- failure modes: arbitrary pixel sizes leaking in; heading levels chosen by visual whim so `h2` and `h3` swap roles between screens; marketing display sizes inside working chrome.
- spec hooks: per-screen type inventory listing each text role with its scale token; avoid-list bans raw font-size values.

**UT-2 - Size for structure, weight for emphasis**
- principle: within a text level, emphasis comes from weight (medium, semibold) before a size jump; size jumps are reserved for structural tier changes.
- preconditions: any region needing internal stress - a value inside a sentence, the changed field in a diff, the total row of a table.
- failure modes: emphasis by enlarging until tiers blur (visual-hierarchy VH-5's ladder collapses); emphasis by color alone (color-tokens-a11y owns why that fails).
- spec hooks: spec names the emphasis mechanism per region; avoid-list bans size-based emphasis inside a tier.

**UT-3 - Write the truncation plan**
- principle: every dynamic string decides truncate / wrap / line-clamp before the mock ships, tested against long realistic values.
- preconditions: every user-sourced string - names, titles, email-shaped identifiers, URLs, descriptions. Table cells default to single-line ellipsis; detail views wrap; cards clamp.
- failure modes: a long name blowing a table row to double height; an identifier pushing actions out of the viewport; ellipsis with no way to reach the full value.
- spec hooks: the states matrix carries a long-content row per component; spec notes where the full value is recoverable (title attribute, detail pane, copy affordance).

**UT-4 - Set numbers in tabular figures**
- principle: numbers are UI citizens - `tabular-nums`, right-aligned, fixed precision per column.
- preconditions: every numeric column, KPI tile, and any place values update in place (an optimistic counter that shifts width jitters the layout).
- failure modes: proportional figures wrecking column comparison; mixed precision within a column; currency or unit symbols breaking alignment.
- spec hooks: table specs mark numeric columns with alignment and precision; KPI tiles note tabular figures for live-updating values.

**UT-5 - Fix the label-value grammar**
- principle: muted label, stronger value, one orientation per screen class - the pair renders identically everywhere it appears.
- preconditions: detail panes, settings rows, dashboard tiles, confirmation summaries.
- failure modes: stacked pairs on one screen and inline on its sibling; labels darker than values inverting the read; label styled as a heading tier.
- spec hooks: spec declares the pair pattern once per screen class and references it per region rather than restyling.

**UT-6 - Case by convention**
- principle: sentence case per DESIGN.md; all-caps only for overlines with letter spacing; never caps for running text.
- preconditions: all authored text in the mock, including column headers and empty-state copy.
- failure modes: Title Case buttons imported from another ecosystem's habits; shouting caps column headers; mixed casing across sibling screens.
- spec hooks: avoid-list carries the casing rule; crit pass checks casing against the app's DESIGN.md.

**UT-7 - Prove type at density**
- principle: judgment happens at realistic volume - full tables, long strings, narrow-split windows - not on a sparse canvas.
- preconditions: every screen before handoff; mandatory for list + detail and dashboard classes.
- failure modes: type that reads at three rows and smears at fifty; truncation plans that were never triggered by the demo data; readable only at full-screen width.
- spec hooks: expected-vs-broken line: "at full data volume and narrow width, every reading-critical string is legible and every truncation behaves as specified".

## 4. Signature questions

1. Can every font size in this mock be named as a scale token without looking anything up?
2. What happens to each dynamic string at three times its placeholder length - and was that actually rendered?
3. Do the numeric columns hold vertical alignment when values change width?
4. Is the label-value pair rendered the same way here as on every sibling screen?
5. Is anything all-caps that is longer than an overline label?
6. Where is emphasis coming from - weight, or a size jump that breaks the tier ladder?
7. Was this judged at working density and split-screen width, or on a sparse full-width canvas?

## 5. Placement / asset-class mapping

| Screen class | Weight | What this lens demands here |
|---|---|---|
| Dashboard | primary | Value-first tiles in tabular figures; label-value grammar constant across tiles; no display-size creep |
| List + detail | primary | Single-line ellipsis discipline in cells; wrap in the detail pane; numeric columns aligned and fixed-precision |
| Form + wizard | primary | Label grammar constant; help text one tier below labels; error text legible without dominating |
| Settings | secondary | Long option descriptions wrap; pair orientation identical across every section |
| Marketing-in-app | secondary | The one class allowed display sizes - bounded to its own surface, never leaking into working chrome |
| Mobile-PWA shell | secondary | Floor sizes hold at arm's length; truncation plans retested at the narrowest width |

## 6. Exemplar pointers

The `../exemplars/` directory starts empty; `../exemplars/README.md` defines how slots fill from graded missions. Kinds this pack needs:

- exemplar needed: a data table with tabular numerics and single-line truncation holding at full volume (positive anchor for UT-3/UT-4/UT-7)
- exemplar needed: a detail pane whose label-value sheet survives long real-world strings, beside the placeholder-data draft that hid the bug (negative/positive pair for UT-3/UT-5)
- exemplar needed: a screen caught using off-scale sizes and its re-tokenized revision (anchor for UT-1)

## 7. Trap cross-references

- `../traps/design-system-drift.md` - off-scale font sizes and invented text styles outside the theme's typography tokens (violates UT-1)
- `../traps/ai-slop-ui.md` - marketing display type inside working screens, oversized headings announcing what the data already says (violates UT-1, UT-2)
- `../traps/state-blindness.md` - placeholder-width strings hiding truncation and overflow failures until real data arrives (violates UT-3, UT-7)
- `../traps/responsive-failures.md` - type and truncation tested only at full desktop width (violates UT-7)
- `../traps/flow-friction.md` - labels and values styled so alike the user re-reads to parse them (violates UT-5)
