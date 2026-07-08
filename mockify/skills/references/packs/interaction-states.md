# Pack: Interaction & States

The lens for every component's other lives - empty, loading, error, disabled, optimistic - designed on purpose instead of discovered in production.

## 1. Scope

This lens owns the state matrix of every screen and component: which states exist, how each renders, how feedback reaches the user without toasts, when to skeleton and when to spin, how optimistic writes reconcile, and when validation fires. It answers: what does this screen look like on its worst request, not just its best?

Not covered here: the colors states wear (color-tokens-a11y pack owns the reserved vocabulary), where status sits in the scan order (visual-hierarchy pack), layout survival under content extremes (layout-responsive pack), and flow-level recovery routes between screens (ux-flow-ia pack; this lens handles recovery within the screen).

## 2. Core craft principles

- **A screen is not designed until its states are.** Default, empty, loading, error, disabled - plus optimistic wherever writes happen. The happy path with pretty placeholder data is the machine-generated default; the state matrix is where app-design craft actually lives.
- **Feedback is inline, never a toast.** This ecosystem bans toast notifications: status renders where the action happened - the button shows its pending state, the row shows its result, the form shows its error, an inline banner owns anything page-scoped. Feedback that appears far from its cause makes the user hunt for what just happened.
- **Optimistic is the default for low-risk writes.** Update the UI immediately, reconcile in the background, and on failure revert visibly with an inline explanation and a retry. Making the user watch a spinner for a rename is borrowing their attention to cover for the network.
- **Skeletons for structure, spinners for actions.** A read whose layout shape is known gets a skeleton that matches the real geometry. A user-triggered action gets its indicator inside the triggering control. Full-screen spinners are a last resort, and a layout-shifting skeleton is worse than none.
- **Empty is three different states.** First-run empty teaches and invites the first action; filtered empty says no matches and offers to clear; error empty admits failure and offers retry. Collapsing the three into one gray illustration wastes the screen's best teaching moment.
- **Disabled must explain itself - or not exist.** Prefer enabled controls that validate on use, or hide what truly cannot apply. Where disabled is right, the reason sits visibly nearby - not in a hover tooltip that touch users will never see.
- **Validate when the user is done, not while they type.** Field validation fires on blur or submit; per-keystroke errors scold users for unfinished input. Errors render inline at the field, focus moves to the first failure, and user input is never cleared by a failed submit.
- **Affordance is a contract.** Interactive things look interactive - cursor, hover tint, focus ring, pressed state. Static things do not: a hover effect on a non-clickable card is a promise the screen refuses to keep.

## 3. Directive inventory

**IS-1 - Draw the state matrix**
- principle: a screen is not designed until its states are - every data-bearing or write-capable component lists its states and their renderings.
- preconditions: every screen; the spec's states-matrix block is mandatory, not decorative.
- failure modes: happy-path-only mocks; states listed but identical in rendering; the matrix covering the table and skipping the header actions.
- spec hooks: states matrix per component: default / empty / loading / error / disabled (+ optimistic where writes occur), each with a one-line rendering.

**IS-2 - Feedback inline, no toasts**
- principle: feedback is inline - co-located with its cause; toast notifications are banned in this ecosystem.
- preconditions: every mutation and every async result the user cares about.
- failure modes: a toast reflex imported from other ecosystems; success reported in a corner while the changed row sits unchanged-looking; errors that vanish on a timer before being read.
- spec hooks: for each action, the spec names where feedback renders (in-button, row-level, inline banner); avoid-list bans toasts by name.

**IS-3 - Optimistic writes with visible reconciliation**
- principle: optimistic is the default for low-risk writes - immediate UI update, background reconcile, visible revert with explanation and retry on failure.
- preconditions: renames, toggles, reorderings, status changes - writes that are cheap to revert. Destructive or high-cost writes stay pessimistic by design.
- failure modes: optimistic updates that fail silently, leaving the UI lying; revert with no explanation; optimism applied to an irreversible action.
- spec hooks: states matrix carries the optimistic row: what updates instantly, what the failure revert looks like, where the retry lives.

**IS-4 - Skeleton for reads, spinner in the control**
- principle: skeletons match known structure; action indicators live inside the triggering control; full-screen spinners are the last resort.
- preconditions: all loading surfaces. Skeleton geometry mirrors the loaded layout so nothing shifts on arrival.
- failure modes: spinner-only pages with no structure; skeletons that reflow when data lands; a submit button that stays idle while the request runs, inviting the double-click.
- spec hooks: spec names the loading treatment per surface; expected-vs-broken line: "content arrival causes no layout shift; every pending action is visibly pending in place".

**IS-5 - Design the three empties**
- principle: empty is three states - first-run (teach + invite), filtered (no matches + clear), error (admit + retry) - each with its own next action.
- preconditions: every list, table, dashboard region, and search surface.
- failure modes: one generic illustration for all three; empty states with no action; first-run screens that dead-end new users at the product's most impressionable moment.
- spec hooks: states matrix distinguishes the three empties per surface, each with copy intent and its action.

**IS-6 - Disable with a reason, or don't**
- principle: disabled must explain itself - prefer enabled-then-validate or hidden; a kept disabled control carries a visible nearby reason.
- preconditions: any control gated by permissions, plan tier, or prerequisite state.
- failure modes: mystery-disabled buttons; reasons hidden in hover tooltips; controls disabled for reasons the user could resolve if only told how.
- spec hooks: spec lists every disabled control with its reason and where that reason renders; avoid-list bans tooltip-only explanations.

**IS-7 - Validate on blur or submit**
- principle: validate when the user is done - inline errors at the field, focus to the first failure, input always preserved.
- preconditions: all forms and inline-editing surfaces.
- failure modes: per-keystroke error flashing; errors summarized only at the top with no field anchors; a failed submit that clears the form; success with no confirmation at the point of action.
- spec hooks: form specs state the validation trigger per field and the error rendering; expected-vs-broken line: "a failed submit preserves every entered value".

## 4. Signature questions

1. Show me this screen empty, loading, and failing - do all three renderings exist in the mock?
2. Where does the user look to learn their action worked - and is that where they were already looking?
3. Which writes are optimistic, and what exactly happens on their failure?
4. Does any loading treatment shift the layout when content arrives?
5. Which of the three empties is this - and what is its next action?
6. Why is that control disabled, and where does the screen say so?
7. Type an invalid value and submit: when does the error appear, where, and is the input still there?

## 5. Placement / asset-class mapping

| Screen class | Weight | What this lens demands here |
|---|---|---|
| List + detail | primary | Row-level pending and failure states; three empties; inline row feedback for every action |
| Form + wizard | primary | Blur/submit validation; preserved input; pending submit state; step-level error recovery |
| Dashboard | primary | Skeleton tiles matching real geometry; per-tile error and empty states, not one dead page |
| Settings | secondary | Optimistic toggles with visible revert; disabled options carrying visible reasons |
| Marketing-in-app | secondary | Dismiss and loading states designed; no dead-end CTAs when the offer fails to load |
| Mobile-PWA shell | secondary | Offline and degraded states acknowledged; pending states legible at thumb distance |

## 6. Exemplar pointers

The `../exemplars/` directory starts empty; `../exemplars/README.md` defines how slots fill from graded missions. Kinds this pack needs:

- exemplar needed: a complete states matrix for one list screen with all renderings mocked, beside the happy-path-only draft (negative/positive pair for IS-1)
- exemplar needed: an optimistic-update sequence strip - instant update, failure, visible revert with retry (positive anchor for IS-2/IS-3)
- exemplar needed: the three-empties trio for one surface, each with its distinct action (anchor for IS-5)

## 7. Trap cross-references

- `../traps/state-blindness.md` - the home file for this lens: happy-path-only mocks, missing empties, undesigned errors, silent optimistic failures (violates IS-1 through IS-5)
- `../traps/ai-slop-ui.md` - pretty placeholder perfection that hides every state a real user meets (violates IS-1)
- `../traps/design-system-drift.md` - toast usage and per-screen invented feedback patterns against the ecosystem's inline-feedback convention (violates IS-2)
- `../traps/flow-friction.md` - feedback rendered far from its cause, mystery-disabled controls, and validation that punishes typing (violates IS-2, IS-6, IS-7)
- `../traps/responsive-failures.md` - pending and feedback states legible on desktop but invisible at mobile sizes (violates IS-4)
