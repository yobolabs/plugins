# Pack: Layout & Responsive

The lens for the skeleton that holds on every viewport - the 3-layer shell, honest breakpoints, real overflow plans, and iOS Safari survival.

## 1. Scope

This lens owns the structural frame of every screen: the 3-layer layout system (fixed shell / scroll container / content), breakpoint behavior per screen class, overflow containment, touch ergonomics, and the mobile-browser traps that break naive layouts. It answers: does this screen's skeleton hold at every width, height, and input mode the product actually meets?

Not covered here: what fills the regions (visual-hierarchy pack), text behavior inside them (ui-typography pack), token and contrast rules (color-tokens-a11y pack), and which navigation exists at all (ux-flow-ia pack owns the IA; this lens owns how it collapses).

## 2. Core craft principles

- **Three layers, one scroller.** Fixed shell (sidebar, topbar, sticky toolbars) / one designated scroll container / content. Sticky elements live OUTSIDE the scroll container with `shrink-0`; the page body itself never scrolls. Every scroll bug traces back to violating one of those clauses.
- **100vh lies on iOS.** Mobile Safari's address bar makes the viewport dynamic: `100vh` overflows when the bar is visible, and sticky headers detach when the browser chrome animates. Build heights from the shell's flex chain or dynamic viewport units, and test with the address bar in both states.
- **Design the narrow view; don't shrink the wide one.** Mobile is a re-layout, not a scale-down: the sidebar becomes a drawer or bottom bar, tables become cards or gain their own horizontal scroll, multi-pane splits become stacked navigation. Each screen class has a known collapse pattern - the spec states it.
- **Breakpoints are few and content-driven.** The framework's standard breakpoints, chosen by where the content actually breaks - not per-device special cases. Every additional custom breakpoint is a maintenance debt with no owner.
- **Touch is the baseline pointer.** Interactive targets are at least 44px in the touch dimension, and hover is an enhancement, never the only affordance - touch has no hover. Row actions revealed only on hover do not exist on a phone.
- **Overflow is designed, not discovered.** Every wide thing - table, code block, chart, long unbroken string - sits in its own `overflow-x` container. The screen assumes unbounded user content; the layout decides where the scrollbar lives before the content forces one.
- **Fixed dimensions are debt.** Prefer flex and grid with min/max constraints; heights especially - content grows, translations run long, users resize. A hardcoded height is a promise the data will break.
- **Safe areas exist.** Installed-PWA and notched-device rendering respects `env(safe-area-inset-*)`: bottom navigation clears the home indicator, fixed headers clear the notch. A shell that ignores insets ships a broken app to every modern phone.

## 3. Directive inventory

**LR-1 - Build on the 3-layer shell**
- principle: three layers, one scroller - shell fixed, one scroll container, sticky elements outside it with `shrink-0`.
- preconditions: every screen. The spec declares which regions are shell, which container scrolls, and what is sticky.
- failure modes: sticky headers placed inside the scroller detaching mid-scroll; nested competing scrollbars; the body scrolling behind a modal.
- spec hooks: per-screen layout block names the three layers explicitly; avoid-list bans `position: sticky` inside the scroll container.

**LR-2 - Never trust 100vh**
- principle: the viewport is dynamic on mobile - heights come from the flex chain or dynamic viewport units, verified with browser chrome in both states.
- preconditions: any full-height surface: shells, modals, drawers, bottom sheets, PWA screens.
- failure modes: content clipped behind the address bar; a bottom action bar unreachable until the bar hides; double scrollbars from stacked full-height ancestors.
- spec hooks: expected-vs-broken line: "on iOS Safari with the address bar visible AND hidden, the action bar stays reachable and nothing clips".

**LR-3 - Declare the collapse**
- principle: mobile is a re-layout - each screen's spec states what happens at each breakpoint, per its screen class's known pattern.
- preconditions: every screen; mandatory for list + detail (pane stacking) and dashboard (grid reflow).
- failure modes: a desktop-only mock with no narrow story; a table shrunk until cells are unreadable instead of re-formed; a drawer pattern invented per screen instead of reusing the shell's.
- spec hooks: responsive spec block per screen: layout at each breakpoint, what collapses, what hides, what re-forms.

**LR-4 - Touch targets and no hover-only affordances**
- principle: touch is the baseline - 44px minimum targets; anything revealed on hover has a touch-reachable equivalent.
- preconditions: all interactive elements; row actions, icon buttons, and dense toolbars are the usual offenders.
- failure modes: icon buttons at cursor size; hover-revealed row menus unreachable on touch; adjacent targets so close mis-taps are routine.
- spec hooks: spec marks each interactive cluster with its touch strategy; avoid-list bans hover-only reveals.

**LR-5 - Contain overflow at the source**
- principle: overflow is designed - every wide element owns an `overflow-x` container; the page never scrolls horizontally.
- preconditions: tables, charts, code, tab strips, breadcrumbs, unbroken identifiers.
- failure modes: one wide table making the whole page pan; a chart clipped silently; a long token string stretching a card off-canvas.
- spec hooks: spec lists each potentially-wide element and its containment; expected-vs-broken line: "the body never scrolls sideways at any width".

**LR-6 - Constrain with min/max, not fixed**
- principle: fixed dimensions are debt - flex/grid with min and max bounds absorb growth; hardcoded sizes break with it.
- preconditions: panes, cards, columns, modals; anywhere content length varies (it always does).
- failure modes: a fixed-height card cutting its own content; a fixed-width sidebar truncating every label; modal height tuned to one screenshot's content.
- spec hooks: layout block expresses dimensions as min/max ranges; avoid-list bans fixed heights on content-bearing containers.

**LR-7 - Respect safe areas in the PWA shell**
- principle: safe areas exist - `env(safe-area-inset-*)` padding on fixed edges; bottom bars clear the home indicator.
- preconditions: the mobile-PWA shell class, and any fixed-position element on mobile widths.
- failure modes: bottom nav straddling the home indicator; content underlapping the notch in landscape; full-bleed sheets ignoring the inset.
- spec hooks: PWA shell spec carries an inset-handling block; expected-vs-broken line: "on a notched device, no fixed element collides with system UI".

## 4. Signature questions

1. Name the three layers on this screen - which single container scrolls, and is everything sticky outside it?
2. What happens to this screen when the iOS address bar shows and hides - was that actually exercised?
3. What is the declared collapse at the narrow breakpoint, and does it re-form the content or just shrink it?
4. Which affordances exist only on hover, and where do they go on touch?
5. Which element on this screen can get wide enough to force horizontal scroll - and what contains it?
6. Which dimension here is hardcoded, and what realistic content growth breaks it?
7. On an installed PWA with a notch and home indicator, what collides?

## 5. Placement / asset-class mapping

| Screen class | Weight | What this lens demands here |
|---|---|---|
| Mobile-PWA shell | primary | Full 3-layer discipline; dynamic-viewport heights; safe-area insets; bottom nav ergonomics |
| Dashboard | primary | Grid reflow declared per breakpoint; charts in overflow containers; tiles constrained min/max |
| List + detail | primary | Pane-stacking collapse; table containment or card re-forming; sticky toolbars outside the scroller |
| Form + wizard | secondary | Single-column baseline; action bar reachable at every viewport height; keyboard-overlap story on mobile |
| Settings | secondary | Long sections in the one scroller; sticky section nav outside it; no fixed-height groups |
| Marketing-in-app | secondary | Full-bleed surfaces still honor the shell; no layout that only works at hero width |

## 6. Exemplar pointers

The `../exemplars/` directory starts empty; `../exemplars/README.md` defines how slots fill from graded missions. Kinds this pack needs:

- exemplar needed: an annotated 3-layer shell skeleton showing the fixed chrome, the one scroller, and every sticky element's placement (positive anchor for LR-1/LR-2)
- exemplar needed: a table-to-card collapse pair for the same list screen at wide and narrow widths (anchor for LR-3/LR-5)
- exemplar needed: a PWA bottom-nav treatment with safe-area handling, beside the colliding draft (negative/positive pair for LR-7)

## 7. Trap cross-references

- `../traps/responsive-failures.md` - the home file for this lens: detached sticky headers, 100vh clipping, desktop-only mocks, horizontal body scroll (violates LR-1 through LR-5)
- `../traps/responsive-failures.md` - hover-only affordances and sub-44px targets shipping a cursor-only product (violates LR-4)
- `../traps/state-blindness.md` - layouts tuned to one content volume, breaking when panes fill or empty (violates LR-6)
- `../traps/design-system-drift.md` - reinvented drawer and navigation patterns off the framework's shell instead of reusing its collapse grammar (violates LR-3)
- `../traps/ai-slop-ui.md` - decorative full-height heroes and device-frame chrome pasted into working screens, fighting the shell (violates LR-1)
- `../traps/flow-friction.md` - actions stranded below the fold or behind a collapse with no path to them (violates LR-2, LR-3)
