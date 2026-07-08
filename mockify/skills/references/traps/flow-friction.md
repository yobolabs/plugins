# Traps: Flow Friction

The screen works; the flow fights the user - dead ends, ceremony, interruptions, and questions the system can already answer. This class is where the ecosystem's standing rules concentrate: toasts are banned (outcomes render inline, next to the thing that changed), confirmation is not the default destructive-action pattern (undo is), and defaults beat questions. The ux-flow-ia and interaction-states packs carry the positive grammar; these entries are the screens that ignored it, and the flow map in the spec file is where the critic hunts them.

How entries are consumed: spec-file avoid-lists cite entries by id; the director walks the flow map against the markers in deepen mode before mockups are cut; the critic replays every path in the flow map - including the failure paths - using these markers, and the judge's usability dimension (dimension one) scores what remains. Each entry carries the eight schema fields (id, anti-pattern, markers, why-it-fails, negative-prompt, severity, provenance-class, privacy-check). Severity bands are closed and honest: kills-the-screen (the spec/mockup cannot ship with it), hurts (ships only with a recorded reason), cosmetic (note it, fix in the next pass).

### flow-friction-01 - dead-end-screens
- id: flow-friction-01
- anti-pattern: Screens with no next action - success pages, error states, and empty results that strand the user instead of advancing the job.
- markers: A confirmation or success screen with no link to the thing just created; an error state with no retry and no path back (state-blindness-03 is the state-side twin); empty search results with no affordance to adjust the query; any node in the flow map with an inbound edge and no outbound edge. Context class: terminal screens are legitimate at true journey ends (logout, final receipt) - the flow map should mark them as intentional exits.
- why-it-fails: Every screen either advances the job or strands it; a dead end converts task momentum into a navigation puzzle, and users who created something they now cannot find assume the creation failed.
- negative-prompt: every screen names its next action, success states link to the created artifact, error states carry retry and a path back, no flow-map nodes without outbound edges
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized flow-failure class; no end-user, customer, or mission data

### flow-friction-02 - confirm-dialog-abuse
- id: flow-friction-02
- anti-pattern: Confirmation as the universal safety mechanism - dialogs interrupting reversible actions, and confirms that do not say what is about to be lost.
- markers: Confirm dialogs on reversible or low-stakes actions; "Are you sure?" copy that names neither consequence nor scope; double confirmations in one flow; type-the-name friction on routine operations. The grammar (ux-flow-ia pack): reversible means act immediately and offer an undo window; truly irreversible means one confirm that states exactly what is lost and at what scope. Context class: type-to-confirm is earned by cascade-scale irreversible deletions, nowhere else.
- why-it-fails: Habitual confirms train click-through - the reflex users build on ten meaningless dialogs is the reflex that fires on the one that mattered, so overuse makes the dangerous action less protected, not more.
- negative-prompt: no confirmation on reversible actions, undo over confirm wherever undo is buildable, confirms state consequence and scope, one confirmation maximum per flow
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized flow-failure class; no end-user, customer, or mission data

### flow-friction-03 - modal-in-modal
- id: flow-friction-03
- anti-pattern: Stacked modal contexts - a dialog opening another dialog, with focus, escape, and dismiss semantics undefined past depth one.
- markers: Any modal spawned from inside a modal; select-with-create flows that stack a creation form over a picker; escape or backdrop-click behavior unspecified for the stack (which layer closes?); unsaved work in the lower modal when the upper one commits. Context class: none for stacking itself - the flow that seems to need it wants a different container: a drawer, a dedicated page, inline expansion, or a wizard step (ux-flow-ia pack).
- why-it-fails: A modal already suspends the page context; a second suspension loses the user's place entirely, and the dismissal semantics are unresolvable - every choice of what escape closes is wrong for someone, which is the sign the pattern itself is broken.
- negative-prompt: no modal opens from inside a modal, select-with-create uses inline creation or a drawer, one suspended context maximum, escape semantics stated for every overlay
- severity: kills-the-screen
- provenance-class: session corpus
- privacy-check: pass - generalized flow-failure class; no end-user, customer, or mission data

### flow-friction-04 - toast-reliance
- id: flow-friction-04
- anti-pattern: Outcomes announced by toast - transient corner notifications carrying success, failure, or anything else a user might need to act on.
- markers: Any toast or snackbar in the mockup; success or failure rendered away from the artifact that changed; error text that disappears on a timer (gone before it is read, unrecoverable after); toast queues stacking notifications; an action whose only evidence of completion is the toast. Context class: none - toasts are banned in this ecosystem as a standing rule; status renders inline (row-level state, an inline banner, the button's own state transition - interaction-states pack carries the replacement grammar).
- why-it-fails: A toast is feedback in the wrong place on a timer - it divorces cause from effect, vanishes for anyone who glanced away, is unreadable to screen-reader users in practice, and papers over the real design work of showing state where the state lives.
- negative-prompt: no toasts or snackbars anywhere, outcomes render inline next to the changed artifact, errors persist until resolved, button and row states carry the feedback
- severity: kills-the-screen
- provenance-class: session corpus
- privacy-check: pass - generalized flow-failure class; no end-user, customer, or mission data

### flow-friction-05 - buried-primary-action
- id: flow-friction-05
- anti-pattern: The screen's primary action hidden - inside overflow menus, behind hover, below the fold, or camouflaged among equally-weighted buttons.
- markers: The primary action inside a kebab or overflow menu; primary action revealed only on hover (responsive-failures-02 is the touch-side twin); several buttons at equal visual weight with no hierarchy (the emphasis budget, visual-hierarchy pack); the one thing this screen exists for not nameable in a sentence - or nameable but rendered below the fold. Context class: genuinely read-only screens may have no primary action; the spec should say so rather than promote a secondary one.
- why-it-fails: Each screen sells one act; hiding it taxes every single visit with a hunt, and equal-weight button rows push the choice cost onto the user at exactly the moment the design was supposed to have made it.
- negative-prompt: one visually primary action per screen, never in an overflow menu, visible without scrolling at every breakpoint, secondary actions visibly subordinate
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized flow-failure class; no end-user, customer, or mission data

### flow-friction-06 - asking-what-the-system-knows
- id: flow-friction-06
- anti-pattern: Forms interrogating the user for data the system already has or could derive - context re-entry, redundant fields, and questions where defaults belong.
- markers: Fields for values the session already carries (organization, locale, the record the user navigated from); required fields the flow could infer or safely default and let the user edit later; the same value asked twice in one journey; up-front configuration questions whose answers could start as sensible defaults (defaults-over-questions, ux-flow-ia pack). Context class: confirmation re-entry is legitimate as a deliberate safety device (flow-friction-02 governs when), not as data collection.
- why-it-fails: Every unnecessary field is friction spent and an error opportunity created - and asking for what the system visibly knows reads as the product not paying attention, which corrodes trust in everything else it claims to know.
- negative-prompt: no field for anything the session already knows, derivable values arrive as editable defaults, every required field justifies itself, nothing asked twice in one flow
- severity: hurts
- provenance-class: session corpus
- privacy-check: pass - generalized flow-failure class; no end-user, customer, or mission data

### flow-friction-07 - ceremony-disproportion
- id: flow-friction-07
- anti-pattern: Flow weight mismatched to job size - a multi-step wizard wrapping a two-field task, required setup before any value is visible, frequent actions behind deep navigation.
- markers: A wizard whose steps could fit one form without crowding; onboarding that demands configuration before showing the product working (a good empty state - state-blindness-02 - usually beats a tour); tasks the persona performs constantly sitting three or more levels deep while rare ones sit on the surface (frequency should buy shallowness); progress ceremony (steppers, percent bars) on trivially short flows. Context class: wizards are earned by genuinely staged decisions where later steps depend on earlier answers.
- why-it-fails: Ceremony signals importance the task does not have and spends the user's patience before the product has earned it; inverted depth-to-frequency mapping means the interface optimizes for the wrong visits every single session.
- negative-prompt: no wizard for what fits one form, value visible before configuration is demanded, frequent tasks at shallow depth, progress ceremony only on genuinely staged flows
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized flow-failure class; no end-user, customer, or mission data
