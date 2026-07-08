# Implementability Rubric — judge dimension #5

Scores whether the spec + mockups can be built as drawn — the last dimension at the final gate, and the one that decides whether the handoff is real. A gorgeous spec that names components that don't exist is fiction with good hierarchy. The test is mechanical: **every element maps to a real component and real tokens, or to a declared new-component request with justification — and every state and breakpoint is specified, never implied.**

## Bands

- **buildable-as-specced** — every check below passes; an implementer could build the screens from the spec without inventing a single answer; the praise cites the mapping that earned it (verdict-integrity R2).
- **buildable-with-notes** — one or two gaps at cosmetic weight (a missing disabled state on a secondary control, a breakpoint note needing one more sentence); each named with its location and fix.
- **hand-wavy** — load-bearing elements unmapped, states left "implied by convention", responsive behavior described as an adjective. The implementer would be designing, not implementing. Not acceptable at the judge gate.
- **fiction** — the spec depends on components or capabilities that don't exist and aren't requested, or on data the app cannot provide (recon fact base). Kill; return to the direction.

## Checks

### I1 — Component map fidelity
Every element on every mockup appears in the spec's component map with a real component name — from the framework package (@jetdevs/framework) or the app's own extensions, per recon's component inventory. An element with no mapping and no new-component request is an invention: flagged, never assumed away.

### I2 — Token fidelity
Colors, spacing, type, and radii trace to the app's theme tokens or its DESIGN.md. A raw value that bypasses an existing token is drift (design-system-drift trap); a raw value with no token analog belongs inside a new-component request, not inline in a screen spec.

### I3 — New-component requests earn their existence
Each request carries: the job no existing component serves, the closest existing component considered and why it falls short, and the new component's own states. An undeclared invention is a violation; a well-argued request is the design system working as intended.

### I4 — States specified, not implied
The states matrix per screen is explicit: empty / loading / error / disabled where each applies, and what the screen actually shows in each. "Standard states" or a blank matrix cell is implied-not-specified — the signature violation of this rubric.

### I5 — Breakpoints specified, not implied
Per declared breakpoint: what reflows, what collapses, what hides, what the touch targets become. "Fully responsive" as an adjective is a violation; a breakpoint behavior is a sentence with a subject.

## Scoring rules

- Band per check, then an overall band no higher than the lowest check — implementability doesn't average.
- Every finding names the element + screen + the check it fails, and its falsifier: the spec line that would resolve it.
- Every band assignment names its flip condition: the single change that would move the spec one band.
- Praise cites the mapping or matrix that earned it (verdict-integrity R2).
