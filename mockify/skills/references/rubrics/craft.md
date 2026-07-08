# Craft Rubric — hierarchy, type, spacing, polish

Scores the visual quality of the mockups themselves — judge dimension #3 at the final gate, after usability and design-system fit. Honest bands, no fake numeric precision — a number would claim a measurement nobody made. **Judge at the breakpoints the spec declares, never only a maximized desktop window**: the screens live at real viewport sizes, and most craft failures surface at the dense or narrow end.

## Bands

- **gallery** — a senior product designer would show this uncredited without flinching; every dimension below at "ships" and at least two demonstrably better than the app's ambient standard. Rare by design; cite what earns it.
- **ships** — every dimension passes its checks below. The default acceptable band.
- **needs-work** — one or more dimensions fail; each failure named with its observable and its fix. Bounded: the list must be closable in one director pass.
- **rejected** — failures compound across dimensions, or a single failure kills the legibility of a load-bearing screen. Name the shortest path back (usually: return to the spec's directive, not patch the mockup).

## Dimensions

### Visual hierarchy
- **Ships:** the eye lands 1st / 2nd / 3rd exactly where the screen's job says it should; one focal point per screen; emphasis (size, weight, color, position) is spent deliberately on that order; the hierarchy holds at the narrow breakpoint, not only the wide one.
- **Fails:** everything shouts (uniform emphasis = no emphasis); two elements fight for first; the primary action is discovered rather than seen; hierarchy exists on desktop and dies on mobile.

### Type
- **Ships:** the app's UI type scale used as intended, with clear roles per step; label-value pairs read without ambiguity; truncation and wrapping designed, not left to overflow; digits align for comparison where columns of numbers meet (tabular figures).
- **Fails:** scale steps too timid to rank information, near-enough sizes off the scale, label-value pairs dissolving into prose soup, long-content behavior undesigned.

### Spacing & alignment
- **Ships:** spacing from the token scale, deployed to group and separate meaningfully; elements align to the grid or to each other, never to nothing; whitespace does work (grouping, breathing, pointing).
- **Fails:** trapped whitespace, off-scale one-off gaps, elements floating unanchored, density fluctuating across a screen for no stated reason.

### Color & contrast
- **Ships:** color roles semantic per the theme tokens, deployed as the system intends; text passes the accessibility contrast floor (M-rule) at its rendered size in BOTH light and dark themes; color ranks information where ranking is the job and decorates nowhere it isn't.
- **Fails:** off-token hues, contrast that passes in one theme and dies in the other, color as the only carrier of a state, decorative color where the job needed ranking.

### Polish
- **Ships:** radii, borders, and shadows consistent from the token system; icons from one family at one visual weight; data reads real — names, quantities, and states this app's users would actually produce, never lorem ipsum; interactive elements look interactive and static ones don't.
- **Fails:** border-radius soup, icon-family mixing, placeholder or obviously fake data, affordance ambiguity — the mechanical finish that separates designed from generated (route generated-looking screens to the ai-slop-ui trap as well).

## Scoring rules
- Band per dimension, then an overall band no higher than the lowest dimension — craft doesn't average.
- Every band assignment cites its observable ("hierarchy: ships — balance, due date, pay action in that order at the narrow breakpoint").
- Every non-ships verdict names its flip condition: the specific change that flips the band.
- Praise cites the observable that earned it; silence is always allowed, flattery never (verdict-integrity R2).
