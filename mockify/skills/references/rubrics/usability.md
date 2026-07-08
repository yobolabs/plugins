# Usability Rubric — judge dimension #1

The flagship dimension, scored FIRST at the final gate — the judge's order is **usability → design-system fit → visual craft → completeness (states/breakpoints) → implementability**, because a screen that fails its persona's job is not rescued by perfect tokens or gorgeous spacing. This rubric makes "feels confusing" an evidence claim, not a mood: **every usability call cites the persona + job step from the mission brief, plus the exact screen and element where it happens.** "Feels clunky" is not a finding. An accept with this dimension unscored is invalid.

Scored by walking the mission brief's persona through their job-to-be-done, step by step along the spec's flow map, at the breakpoints the spec declares — never by admiring screens one at a time.

## Bands

- **frictionless** — the persona completes the job on the first pass with no step requiring knowledge the UI never gives; every check below passes; the praise cites the observable that earned it (verdict-integrity R2).
- **passes-with-notes** — the job completes; one or two friction points land at cosmetic weight; the notes name each with its location and fix.
- **fights-the-user** — the job completes only with persistence or luck: a load-bearing step is undiscoverable, an error dead-ends, the scan order buries the primary action. Names each failure + screen + element. Not acceptable at the judge gate.
- **job-fails** — the persona cannot complete the job from what the screens show, or a step depends on data the app cannot provide (recon fact base). Kill; return to the direction, not the pixels.

## Checks

### U1 — Job completion
Walk the persona's job step by step through the flow map: every step has a visible affordance on a screen in the set; no step requires data the app doesn't have or knowledge the UI never provides; the flow ends where the job ends, not where the screens run out. A job walk that skips steps is depth theater (verdict-integrity, adjacent fraud).

### U2 — Scan cost
On each screen, what the persona needs first is what the eye finds first — tested against the screen's grammar (a dashboard scans differently from a form, a form differently from a list). The primary action is seen, not discovered. Density serves the job: nothing the job needs is buried, nothing the job ignores shouts.

### U3 — Error recovery
Every error state answers three questions on the screen itself: what happened, what do I do now, how do I get back. No dead ends; destructive actions prefer undo over confirm; recovery never discards work the persona already entered.

### U4 — Learned-in-one-session
The first successful pass teaches the pattern: repeated actions live in consistent positions across screens, controls look like what they do, and the second pass runs on memory of the layout rather than re-reading. Any interaction that would need documentation to survive fails this check.

## Citation rules

- Usability finding ⇒ persona + job step + screen/element location, plus the recon tag it stands on for any claim about the user.
- frictionless ⇒ the specific observable per check, cited with its location. Uncited praise is a verdict-integrity violation (R2).
- Every band assignment names its flip condition: the single change that would move the spec one band.
