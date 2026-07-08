# Pack: UX Flow & Information Architecture

The lens for the path through the app - navigation depth, progressive disclosure, forms that respect the user, and destructive moments handled like an adult.

## 1. Scope

This lens owns the journey level of the design: information architecture and navigation depth, progressive disclosure, form design as a conversation, destructive-action patterns, defaults, and naming. It answers: how many decisions and detours stand between the user's intent and its completion - and does every one of them earn its place?

Not covered here: how navigation collapses across viewports (layout-responsive pack), field-level validation timing and feedback (interaction-states pack), visual emphasis of the path (visual-hierarchy pack), and how labels render (ui-typography pack; this lens chooses the words, that one sets them).

## 2. Core craft principles

- **Depth is a cost the user pays per visit.** Two levels of ambient navigation - the sidebar and a tab/section row - cover almost every app; things used constantly live shallow, things configured rarely live in settings. Every added level is a toll charged on every trip.
- **Disclose progressively.** The common case is ambient; the advanced case is folded behind an explicit "Advanced" section or expandable region; the rare-and-dangerous case is deliberately distant. Power features should be discoverable on intent, not ambient as noise.
- **Forms are conversations with a competent clerk.** Ask only what is needed to proceed, in the order the user thinks, with everything pre-filled that can be. Every field must justify itself: cut it, default it, or defer it to a later edit.
- **A wizard is a dependency, not a style.** Multi-step flows are earned when steps genuinely depend on earlier answers or the whole is too long to face at once. Otherwise one page with clear sections beats stepping through screens; and any wizard preserves state on back-navigation.
- **Undo beats confirm.** Confirmation dialogs train blind clicking; for reversible actions, act immediately and offer an inline undo window. Reserve real friction - type-to-confirm, explicit consequence lists - for the genuinely irreversible, and never stack confirmations.
- **Destructive actions live apart.** Spatially separated from routine actions, styled in the destructive vocabulary, never adjacent to the primary button where a misclick lands. The danger zone pattern in settings exists for a reason.
- **Defaults over questions.** Every setting ships with an opinionated default; the fast path through any flow is accepting what is already filled. A question the product can answer for itself is work shipped to the customer.
- **Users navigate by recognition.** Entities carry the user's domain names, one name per entity everywhere it appears; buttons carry verbs that state their outcome ("Create segment", not "Submit"). Renaming an entity between screens is a maze built from vocabulary.

## 3. Directive inventory

**UX-1 - Draw the flow map first**
- principle: the journey precedes the screens - entry points, steps, exits, and error/recovery routes are mapped before any screen is composed.
- preconditions: every mission; the spec's flow-map section is the deliverable, feeding each per-screen section.
- failure modes: screens designed in isolation that do not connect; no recovery route from a failed step; an entry point the navigation cannot actually reach.
- spec hooks: flow map lists entries, steps, exits, and recovery per route; each per-screen section names its upstream and downstream screens.

**UX-2 - Cap navigation depth**
- principle: depth is a toll - two ambient levels; deeper structures use in-page patterns (tabs, sections) or a breadcrumb-anchored detail.
- preconditions: all IA decisions. New features extend an existing level before they add one.
- failure modes: nav trees four levels deep; sibling features scattered across levels; a detail page with no route back but the browser.
- spec hooks: spec states each screen's position in the nav (level, parent, siblings); avoid-list bans adding a nav level without an explicit argument.

**UX-3 - Disclose progressively**
- principle: common case ambient, advanced folded, dangerous distant - complexity revealed on intent.
- preconditions: settings surfaces, configuration forms, filter panels, any feature-rich screen.
- failure modes: every option at full volume on one screen; advanced options hidden so deep they are effectively removed; disclosure that resets on every visit.
- spec hooks: per-screen section marks each control ambient / folded / distant, with the fold mechanism named.

**UX-4 - Every field earns its place**
- principle: forms are conversations - each field is cut, defaulted, or deferred unless proceeding truly requires it.
- preconditions: every form and wizard; creation flows especially, where optional metadata loves to accumulate.
- failure modes: a creation form demanding what edit-later could collect; duplicate asks the product already knows; optional fields presented at the same weight as required ones.
- spec hooks: spec lists each field with its justification (required-to-proceed / defaulted / deferred); avoid-list bans fields without one.

**UX-5 - Wizard only when steps depend**
- principle: a wizard is a dependency - one page with sections is the default; steps are earned by genuine sequential dependency or unmanageable length.
- preconditions: any flow longer than a handful of fields.
- failure modes: a three-field wizard; steps that could be one screen; back-navigation that discards entered state; no progress indication across steps.
- spec hooks: flow map justifies the wizard choice; each step's spec notes preserved state and the back/exit behavior.

**UX-6 - Undo over confirm**
- principle: undo beats confirm - reversible actions act immediately with an inline undo affordance; irreversible ones get proportionate, singular friction.
- preconditions: deletes, bulk operations, sends, and anything with a blast radius. The undo affordance is inline (banner or row-level), never a toast.
- failure modes: confirm dialogs on trivially reversible actions; irreversible deletes behind a single reflexive click; stacked are-you-sure dialogs; undo promised but not actually wired in the flow.
- spec hooks: spec classifies each destructive action reversible/irreversible and names its pattern (undo window vs type-to-confirm) and where the affordance renders.

**UX-7 - Name from the user's domain**
- principle: recognition over recall - one name per entity everywhere, verbs on buttons, labels in the user's vocabulary per the app's DESIGN.md.
- preconditions: all navigation labels, headings, buttons, and empty-state copy in the mock.
- failure modes: "Submit" and "OK" buttons; an entity called three names across three screens; internal jargon (table names, API nouns) surfacing in the UI.
- spec hooks: spec carries the mission's entity vocabulary table; crit pass greps the mock for generic verbs and off-vocabulary names.

## 4. Signature questions

1. Trace the user's intent to its completion: how many clicks, decisions, and detours - and which one can go?
2. Where does this screen sit in the nav, and can the user say how they got here and how to get back?
3. What is folded, what is ambient, and does anything dangerous sit one reflexive click away?
4. For each form field: what breaks if it is cut, defaulted, or deferred?
5. Does this flow need steps, or is it one page wearing a wizard costume?
6. Which actions here are irreversible, and does their friction match - undo for the reversible, real friction for the rest?
7. Would a user recognize every label on this screen as their own vocabulary?

## 5. Placement / asset-class mapping

| Screen class | Weight | What this lens demands here |
|---|---|---|
| Form + wizard | primary | Field justification per UX-4; wizard earned or refused; state preserved on back; verbs on actions |
| Settings | primary | Disclosure tiers explicit; danger zone distant and quarantined; defaults opinionated |
| Marketing-in-app | primary | Upsell moments placed at intent, not interrupting mid-task; one action, honest labeling, dismissible |
| Dashboard | secondary | Drill-down routes named in the flow map; no dead-end tiles; depth paid only where detail exists |
| List + detail | secondary | Row actions match the entity vocabulary; bulk operations carry undo; detail links back cleanly |
| Mobile-PWA shell | secondary | The capped depth becomes non-negotiable; primary tasks reachable within the bottom nav's reach |

## 6. Exemplar pointers

The `../exemplars/` directory starts empty; `../exemplars/README.md` defines how slots fill from graded missions. Kinds this pack needs:

- exemplar needed: a flow map for a create-flow with entries, exits, and recovery routes, beside the screen-by-screen draft that missed a dead end (negative/positive pair for UX-1)
- exemplar needed: the same task as a one-page sectioned form and as the wizard it replaced, with the dependency argument annotated (anchor for UX-4/UX-5)
- exemplar needed: a destructive-moment pattern sheet - undo window, danger zone, type-to-confirm - each matched to its reversibility class (anchor for UX-6)

## 7. Trap cross-references

- `../traps/flow-friction.md` - the home file for this lens: needless depth, unjustified fields, confirm-dialog reflexes, dead ends, and vocabulary mazes (violates UX-1 through UX-7)
- `../traps/flow-friction.md` - generic "Submit"/"OK" labeling and jargon leaking from the schema into the UI (violates UX-7)
- `../traps/state-blindness.md` - flows mapped only for success, with no designed route out of a failed step (violates UX-1)
- `../traps/ai-slop-ui.md` - wizard costumes and stepper theater added for visual interest rather than dependency (violates UX-5)
- `../traps/design-system-drift.md` - navigation paradigms invented per feature against the app's established shell and DESIGN.md conventions (violates UX-2)
- `../traps/responsive-failures.md` - journeys that dead-end on mobile because a step's affordance never survived the collapse (violates UX-1)
