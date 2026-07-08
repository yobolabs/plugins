# Mission Brief — <feature / redesign need>

> Care level: **quick** (2 concept directions, light crit) | **deep** (3 directions, full five-class crit). Status: <intake | resolved | in-loop>.
> Source: interactive intake — brainstorm-style, one question at a time; never a form dump.
> Mission dir: `_context/<project>/mockify/<slug>/` with a `mockups/` subdir.

## 1. Mission summary
- **Target app + repo path:** <app name + exact repo path — resolved to a CONFIRMED row in §2 before anything renders>
- **Scope:** <new feature | redesign | net-new> — <one line on what changes and what stays>
- **Screens in scope:** <exact routes — every route gets its own per-screen section in the spec file; list them all now>
- **Persona + job-to-be-done:** <named persona + the one job they hire these screens for — not a role title>
- **Goal:** <the one thing this design must achieve, stated observably>
- **Care level:** quick | deep — bounds are artifact counts, never schedule

## 2. Entity resolution — before anything renders
Nothing renders until every row reads CONFIRMED. Wrong-app, wrong-design-system, and wrong-route mistakes die here or not at all. Each row is mirrored as a one-line entry in the mock ledger.

| Entity | Resolved to | Source | Confirmed |
|---|---|---|---|
| App | <exact repo path> | <who or where it came from> | ☐ |
| Design system | <`DESIGN.md` path + theme/token source file paths> | <recon-verified on disk> | ☐ |
| Screens in scope | <exact route list> | <app router / extension map> | ☐ |
| Framework components | <package path the component inventory comes from> | | ☐ |
| Output dir | `_context/<project>/mockify/<slug>/` + `mockups/` | | ☐ |

## 3. M-rules
Empty at intake — filled at loop step 2, once recon returns the fact base. This mission's constraints as numbered rules. The manifest travels with EVERY dispatch; every downstream artifact checks conformance rule by rule — unnumbered rules can't be checked.

| # | Class | Rule | Source |
|---|---|---|---|
| M1 | design-system | <e.g. components from the recon inventory only; colors by token role, never raw hex> | <DESIGN.md § / token source> |
| M2 | accessibility | <WCAG contrast floor · touch-target minimum · keyboard/focus order> | |
| M3 | responsive | <breakpoint behavior + the iOS Safari constraints this screen set triggers> | |
| M4 | i18n | <language slots; what must survive translation and text expansion> | |
| M5 | ux-standing | <standing rules: no toasts, defaults over questions, app-specific invariants> | |

Classes: design-system · accessibility · responsive · i18n · ux-standing. Add rows; never merge rules — one rule, one number, one check.

## 4. Recon hunt list
What `mock-recon` must return for this mission (every claim tagged `checked` / `reasoned` / `guessing` / `dont-know`):
- Design-system facts: <what's unclear about tokens, themes, the component inventory>
- Existing-screen sweep: <which in-scope routes need screenshots — or code-reads when the app isn't running>
- App architecture: <routes, extensions, what data each screen can actually show>
- User/flow context: <entry points, adjacent flows — the specific question, not "understand the user">
- Pattern hunts: <how comparable products solve this — perishable, dies with the mission>
- Standing UX rules: <which conventions need re-verification for THIS app>

Known `dont-know`s at intake: <list — each one is a hunt, not a shrug>

## 5. Open questions at intake
<what the user/team must answer before or during the loop, and what is assumed meanwhile>
