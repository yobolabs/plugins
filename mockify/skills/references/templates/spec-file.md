# Spec File — <mission slug>

> The deliverable. Buildable by a non-author — a teammate, feature-lifecycle, or dev-team — from sections 1–8 alone, with no context of the run. The mockups in `mockups/` are spec evidence, not decoration: where prose and mockup disagree, that is a defect, not a tiebreak.
> **Validity rule:** every per-screen section carries a full states matrix AND a responsive spec AND an avoid-list. A spec missing any of the three on any screen is INVALID — the judge may not accept it.
> Honest bands everywhere; no invented numbers in predictions.

## 1. Mission summary
App: <name + repo path> · Scope: <new feature | redesign | net-new> · Screens: <route list> · Persona + job: <> · Goal: <> · Care level: <quick | deep>

## 2. M-rules
The manifest that traveled with every dispatch. Downstream conformance is checked per rule number — quote them exactly as numbered in the mission brief.

| # | Class | Rule |
|---|---|---|
| M1 | <class> | <rule> |

## 3. Chosen direction
<IA/layout bet + visual language of the winning concept, and why it's usable for this persona — carried from the winning concept card, sharpened by the deepen pass.>

**Rejected directions:**
| Concept | One-line why-not |
|---|---|
| <id: name> | <the recorded reason — these why-nots stand; they feed calibration> |

## 4. Flow map
<Screen-to-screen flow: entry points, the persona's path through the job, exits, and edge paths. Mermaid or an indented list — every node here has a per-screen section in §5, and every screen in §5 appears here. Dead ends are defects.>

## 5. Per-screen sections
One block per in-scope route. Repeat the block. Every field filled — a blank field is a decision nobody made.

### Screen <n> — <route / name>
- **Purpose:** <the one job this screen does in the flow, and what the persona arrives wanting>
- **Component map:** <every UI element → a real component from the recon inventory, by name (framework package or app extension). Anything with no real component goes to §6 as a new-component request — never invented inline>
- **Layout:** <structure per the 3-layer system: what's fixed, what scrolls, where density lives — tied to the chosen direction's layout grammar>
- **States matrix:** every applicable state specified, not implied — "n/a" is a decision, written down.

  | State | Behavior |
  |---|---|
  | empty | <first-run / zero-data: what shows, what it invites> |
  | loading | <skeleton vs spinner; what keeps the layout stable> |
  | error | <what failed, in whose words, and what the user can do about it> |
  | disabled | <what's disabled when, and how it explains itself> |
  | optimistic | <what updates before the server confirms, and the rollback story> |

- **Responsive spec:** behavior per breakpoint — <mobile: … · tablet: … · desktop: …> — plus iOS Safari notes wherever the screen has sticky/fixed elements. Touch targets at minimum size on the smallest breakpoint.
- **Interactions:** <every affordance: trigger → feedback → outcome. Feedback without toasts. Form-validation timing where forms exist. Keyboard/focus path>
- **i18n slots:** <every user-facing string as a slot; which slots risk text expansion and what the layout does about it>
- **Avoid-list:** <what this screen must NOT do. Each item cites its source — a trap entry id (`traps/<file>#<id>`) or an M-rule number. From traps: <…> · Mission-specific: <…>>
- **Mockup:** `mockups/<slug>-<screen>.html` — <what the mockup proves for this screen: what a correct build shows, observably · what drift looks like, observably>

## 6. New-component requests
Every element that maps to NO existing component. An empty section is a claim — it means every element in §5 resolved to the recon inventory.

| Request | Closest existing component | Why it can't stretch | Justification |
|---|---|---|---|
| <name + one-line spec> | <component> | <the gap> | <why the persona's job needs it> |

## 7. Open questions
<Surviving unknowns for the user/team + what is assumed meanwhile.>

## 8. Feedback hook
Falsifiable predictions for the grading pass (`mockify feedback <slug>`) once the implementation ships. Each gets a verdict then: hit / miss / inconclusive. Honest bands, no invented numbers.

| Prediction | Basis |
|---|---|
| Which spec sections survive implementation unchanged: <sections> | <the craft reason — cite the M-rule or recon tag that should earn it> |
| Where implementation diverges first: <screen / section> | <the risk carried from the concept card or crit> |
| What the screenshot diff shows: <which screens match their mockups, where drift appears> | <the spec element that anchors it> |

---

## Integrity note
*Appended by the orchestrator — not authored by the director.*
Crit outcome: <hit counts per attack class · zero-hit justification if any> · Judge trail: <accept | one-more-pass gaps | recorded non-accept + named gaps> · Rejected-concept why-nots: <pointer to §3 table>
