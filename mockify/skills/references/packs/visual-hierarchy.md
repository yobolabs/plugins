# Pack: Visual Hierarchy

The lens that decides what a working user sees first, second, third on a screen full of their own data - and what never earned its pixels.

## 1. Scope

This lens owns the ORDER of perception inside an app screen: scan order per screen grammar, emphasis budget, grouping and alignment, and density management. It answers one question: when a user lands on this screen mid-task - often for the hundredth time - what do they read first, what do they act on, and how much of the surface is spent on things that help neither?

Not covered here: type mechanics and truncation (ui-typography pack), token roles and contrast math (color-tokens-a11y pack), the layout skeleton and breakpoint behavior (layout-responsive pack), which states each component carries (interaction-states pack), and where the screen sits in the journey (ux-flow-ia pack). This lens takes their outputs and arranges them into one readable surface.

## 2. Core craft principles

- **Users scan on task rails, not curiosity.** An app screen is revisited, and hierarchy serves the repeat glance more than the first impression. The eye runs a learned route: current status, then what changed, then the next action. The craft is designing that route on purpose.
- **One primary action per screen.** The emphasis budget allows exactly one filled primary button per view; everything else drops to secondary, outline, or ghost variants. Two primaries do not double the action - they split it, and the user hesitates.
- **Density is a feature.** Professional tools earn trust by showing more of the user's data per glance, managed with alignment and grouping - not by padding everything into a sparse card garden. Whitespace maximalism is the machine-generated default, not craft.
- **The data is the hero; chrome is the crew.** The user's rows, numbers, and names get the contrast; containers, borders, and decorative icons recede. When the frame outshines the contents, the hierarchy is inverted.
- **Alignment is the invisible hierarchy.** A shared left edge and a consistent spacing scale group harder than any box. Reach for a border, and especially for a nested card, only after spacing and section headings have failed.
- **Value first, label second.** In data-first regions the value is large and the label is small and muted - the user already knows what the metric is; they came for its current value.
- **Screen grammar dictates the ladder.** Dashboard: KPI row first, anomaly second, supporting table third. List: identity column leftmost, status scannable in one vertical sweep, actions at the row edge. Form: title, fields in a single column, actions at the end. Each grammar has its own correct first read - importing one grammar into another screen class is a hierarchy bug.
- **Squint at working size.** Blur the screen or shrink it to a laptop-corner window: the primary action and the current status must survive. If everything survives, nothing does.

## 3. Directive inventory

**VH-1 - Crown one primary action**
- principle: one primary per screen - a single filled `default`-variant Button; peers demoted to `secondary`/`outline`/`ghost`.
- preconditions: every screen with any action. The winner is the action that advances the user's task, chosen from the flow map (ux-flow-ia), not the one stakeholders like most.
- failure modes: three filled buttons competing; a destructive action styled at primary strength beside the real primary; the winner buried below the fold.
- spec hooks: the per-screen spec names the primary action and lists every demoted peer with its assigned variant.

**VH-2 - Put the contrast on the data**
- principle: the data is the hero - user content carries the strongest foreground; chrome sits in muted and border tokens.
- preconditions: all screens that render user data. Marketing-in-app surfaces may invert this (the message is the content there).
- failure modes: decorative icon rows louder than the values; headers heavier than cells; illustration blocks stealing the first read from live data.
- spec hooks: per-region note of what carries `foreground` weight vs `muted-foreground`; avoid-list entry banning decorative imagery inside working regions.

**VH-3 - Build the ladder in the screen's grammar**
- principle: screen grammar dictates the ladder - dashboard/list/form each have a known correct first-second-third read.
- preconditions: every screen; the grammar comes from the screen class declared in the mission brief.
- failure modes: a dashboard that reads like a brochure (hero banner first, numbers third); a form with fields in multiple columns breaking the top-to-bottom rail; a list whose identity column sits mid-table.
- spec hooks: the spec states the intended scan order as an ordered list - first read, second read, third read - per screen.

**VH-4 - Group with space before boxes**
- principle: alignment is the invisible hierarchy - spacing-scale gaps and section headings group; borders and nested cards are the last resort.
- preconditions: any screen with three or more regions. One card level maximum; a card inside a card is a smell, a third level is a defect.
- failure modes: card-in-card nesting; every list row its own bordered card; gratuitous separators where a gap would do.
- spec hooks: spec declares the grouping mechanism per region (gap step, heading, or card) and the avoid-list bans nesting past one card level.

**VH-5 - Spend density deliberately**
- principle: density is a feature - repeat-use working screens run compact; entry and onboarding surfaces run looser.
- preconditions: density is chosen per screen class and held constant within a component (a table does not mix compact and comfortable rows).
- failure modes: a dashboard where three tiles fill the whole viewport; padding so generous the working set needs three scrolls; or the inverse - a first-run screen at expert density.
- spec hooks: spec names the density tier per screen (compact / default / comfortable) and the row height for tables.

**VH-6 - Make status scannable, not shouty**
- principle: status reads in one vertical sweep - badges and status dots sized to be caught peripherally without competing with the primary action.
- preconditions: lists, dashboards, and any screen with per-row or per-entity state.
- failure modes: full-saturation badges on every row turning the column into noise; status conveyed only by hover; status text styled identically to body text so nothing separates.
- spec hooks: spec lists the status vocabulary for the screen and the Badge variant assigned to each value.

**VH-7 - Pass the squint test at working size**
- principle: squint at working size - the primary action and current status must survive blur and a small window.
- preconditions: every screen, checked at realistic data volume and at a narrow laptop split-screen width, before the mock ships.
- failure modes: hierarchy that only holds with placeholder data; a winner that vanishes when the table fills; even gray mush where nothing wins.
- spec hooks: verification line in the spec's expected-vs-broken checklist: "squinted, [primary action] wins and [status] is findable".

## 4. Signature questions

1. What does the returning user need in the first glance - and does the screen give it first?
2. Which single control is primary, and what argument earned it that slot?
3. Squint: does exactly one thing win in each region?
4. Can status be read in one vertical sweep without reading any row?
5. Is every group made by spacing and alignment, or is a box doing work a gap could do?
6. Which element could be deleted with zero loss to the task? (There is almost always one - delete it.)
7. Is the densest region of the screen the most valuable data, or decoration?

## 5. Placement / asset-class mapping

Walk order for the director in deepen mode: primary rows first.

| Screen class | Weight | What this lens demands here |
|---|---|---|
| Dashboard | primary | KPI ladder with value-first tiles; anomaly readable second; no brochure grammar |
| List + detail | primary | Identity column leftmost; status sweepable; row actions at the edge; one winner per pane |
| Mobile-PWA shell | primary | Ruthless emphasis budget - one primary per viewport; density recalibrated for thumb distance |
| Form + wizard | secondary | Single-column rail; primary action at the end of the path; no competing emphasis mid-form |
| Settings | secondary | Scan-by-heading; groups made with space; danger area visually quarantined |
| Marketing-in-app | secondary | The one class where message may outrank data - but still one winner, one action |

## 6. Exemplar pointers

The `../exemplars/` directory starts empty; `../exemplars/README.md` defines how slots fill from graded missions. Kinds this pack needs:

- exemplar needed: a dashboard with a disciplined KPI ladder where squinting yields value-first tiles and one primary action (positive anchor for VH-1/VH-3/VH-7)
- exemplar needed: a dense list screen that stays scannable at full data volume beside its padded card-garden first draft (negative/positive pair for VH-4/VH-5)
- exemplar needed: a screen where chrome outshone data, annotated with the demotions that fixed it (anchor for VH-2)

## 7. Trap cross-references

- `../traps/ai-slop-ui.md` - padding maximalism, card gardens, and icon confetti that dissolve working density (violates VH-2, VH-4, VH-5)
- `../traps/ai-slop-ui.md` - the everything-is-a-hero grammar import, brochure composition on working screens (violates VH-3)
- `../traps/flow-friction.md` - competing primary actions that make the next step ambiguous (violates VH-1)
- `../traps/state-blindness.md` - hierarchy tuned only for pretty placeholder data, collapsing at real volume or at empty (violates VH-7)
- `../traps/responsive-failures.md` - a ladder that only holds at full desktop width (violates VH-7)
- `../traps/design-system-drift.md` - inventing emphasis levels outside the component set's variants instead of demoting within them (violates VH-1)
