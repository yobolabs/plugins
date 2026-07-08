# Traps: Responsive Failures

The screen only works at the width it was designed at - desktop-first fixed geometry, hover-dependent function, iOS Safari shell breaks, and controls a thumb cannot reach. In this ecosystem the mobile story is load-bearing (merchant tools live on phones, and app shells get installed as PWAs), and the durable defenses are already named: the 3-layer layout system and the iOS Safari trap list carried by the layout-responsive pack. Every entry below is a way a mockup that looked right in a desktop browser ships a broken phone.

How entries are consumed: spec-file avoid-lists cite entries by id; the director designs against the markers in deepen mode and states the responsive spec per breakpoint; the critic checks mockups at phone, tablet, and desktop widths using the markers as the walk. Each entry carries the eight schema fields (id, anti-pattern, markers, why-it-fails, negative-prompt, severity, provenance-class, privacy-check). Severity bands are closed and honest: kills-the-screen (the spec/mockup cannot ship with it), hurts (ships only with a recorded reason), cosmetic (note it, fix in the next pass).

### responsive-failures-01 - fixed-width-thinking
- id: responsive-failures-01
- anti-pattern: Desktop-first fixed geometry - pixel-fixed containers, columns, and modals that overflow or clip below the width they were designed at.
- markers: Fixed pixel widths on containers, modals, and columns; horizontal scrollbars at phone widths on non-tabular content; min-width values that exceed a phone viewport; only a desktop mockup exists and the responsive spec says "scales down"; side-by-side panels with no stacking decision. Context class: intrinsically sized elements (icons, avatars) are fixed by nature; layout containers are not.
- why-it-fails: Fixed geometry does not degrade, it breaks - content gets clipped, forms become unreachable, and the narrow-width experience becomes whatever overflow behavior the browser defaults to, which nobody designed.
- negative-prompt: no fixed pixel widths on layout containers, max-width plus fluid behavior instead, a stacking decision for every side-by-side arrangement, design the narrow width not just the wide one
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized responsive-failure class; no end-user, customer, or mission data

### responsive-failures-02 - hover-only-function
- id: responsive-failures-02
- anti-pattern: Function reachable only through hover - row actions that appear on mouse-over, tooltips as the sole carrier of information, menus that open on hover.
- markers: Row or card actions hidden until hover; a tooltip that is the only place a value or explanation lives; hover-triggered dropdowns or previews; drag-only interactions with no tap-accessible alternative; cursor-dependent affordances (pointer changes as the only clickability cue). Context class: hover as progressive enhancement over an always-visible or tap-accessible affordance is craft, not a trap.
- why-it-fails: Touch has no hover - on a phone or tablet the function is not degraded, it is gone; the same defect also breaks keyboard users, so the miss is an accessibility failure twice over.
- negative-prompt: no hover-only actions, row actions visible or behind an explicit tap affordance, no tooltip-only information, every drag interaction has a tap alternative
- severity: kills-the-screen
- provenance-class: published craft knowledge
- privacy-check: pass - generalized responsive-failure class; no end-user, customer, or mission data

### responsive-failures-03 - ios-viewport-breaks
- id: responsive-failures-03
- anti-pattern: The shell breaks under iOS Safari's dynamic chrome - full-height layouts sized with 100vh, sticky elements detaching, inputs triggering focus zoom, notch insets ignored.
- markers: 100vh on the app shell (the bottom hides behind the dynamic address bar - dvh is the unit that tracks it); position-sticky headers that detach or judder as the address bar collapses; inputs with font-size below 16px (iOS zooms the whole page on focus); safe-area insets absent on screens that touch the notch or home-indicator regions. Context class: a desktop-only internal tool may record the exemption in its responsive spec.
- why-it-fails: These are not cosmetic - the address-bar viewport bug hides primary actions behind browser chrome and the focus zoom derails every form entry; this exact trap list is why the layout-responsive pack pins the iOS Safari rules as durable ecosystem knowledge.
- negative-prompt: dvh not 100vh for full-height shells, inputs at 16px font size or larger, safe-area insets on mobile shells, sticky elements tested against dynamic browser chrome
- severity: kills-the-screen
- provenance-class: session corpus
- privacy-check: pass - generalized responsive-failure class; no end-user, customer, or mission data

### responsive-failures-04 - scroll-container-anarchy
- id: responsive-failures-04
- anti-pattern: Page structure that fights scrolling - chrome inside the scroll region, nested vertical scroll areas, and no single owner of overflow.
- markers: Header or footer placed inside the scrolling container instead of as shrink-0 siblings outside it; two or more nested vertical scroll regions on one screen; the whole body scrolling when one panel should; scroll position lost on tab switches because the container remounts. The 3-layer system is the standing repair: fixed shell, shrink-0 chrome outside the scroll container, exactly one scrolling layer. Context class: independent scroll in a second pane is legitimate in split-view layouts when each pane's scroll owner is explicit.
- why-it-fails: Scroll anarchy produces the signature mobile jank - sticky headers that drift, double-scroll traps where the page moves instead of the list, and keyboards that shove the wrong layer; users cannot name the bug but abandon the screen that has it.
- negative-prompt: 3-layer layout with one scrolling layer, header and footer as shrink-0 siblings outside the scroll container, no nested vertical scroll regions, scroll ownership stated per pane
- severity: hurts
- provenance-class: session corpus
- privacy-check: pass - generalized responsive-failure class; no end-user, customer, or mission data

### responsive-failures-05 - thumb-zone-blindness
- id: responsive-failures-05
- anti-pattern: Mobile controls placed for a mouse - primary actions in top corners, targets too small to hit, destructive and primary actions adjacent.
- markers: Primary actions at the top of phone layouts while the thumb-reachable bottom band holds nothing; touch targets under 44px in either dimension; interactive elements packed closer than a fingertip; destructive actions adjacent to frequent ones with no spacing or confirmation asymmetry; pull and swipe gestures with no visible equivalent. Context class: top placement is fine on desktop breakpoints - the trap is carrying it into the phone layout unexamined.
- why-it-fails: On a phone the bottom third of the screen is the cheap real estate and the top corners are the expensive stretch; ignoring that inverts the effort map of the whole interface, and undersized targets convert routine taps into misfires next to destructive ones.
- negative-prompt: primary actions thumb-reachable on phone layouts, touch targets at 44px minimum, spacing between adjacent interactive elements, destructive actions never beside frequent ones
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized responsive-failure class; no end-user, customer, or mission data

### responsive-failures-06 - breakpoint-teleport
- id: responsive-failures-06
- anti-pattern: The layout reorganizes drastically at a single breakpoint with nothing in between - and content order scrambles between widths.
- markers: A composition that jumps from desktop grid to phone stack with no intermediate story (tablet renders as a stretched phone or a squeezed desktop); visual order diverging from DOM order at some widths (keyboard and screen-reader order breaks); elements silently vanishing at narrow widths with no recorded decision about where their function went. Context class: hiding a genuinely redundant affordance at narrow widths is a decision - the spec must name what replaced it.
- why-it-fails: Users move between devices carrying spatial memory; a teleporting layout resets it, and order scrambling breaks the invisible contract that tab order follows reading order - an accessibility defect that no visual review catches.
- negative-prompt: continuous behavior across breakpoints with a stated tablet story, DOM order matches visual order at every width, nothing disappears at narrow widths without a named replacement
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized responsive-failure class; no end-user, customer, or mission data

### responsive-failures-07 - table-shrink-denial
- id: responsive-failures-07
- anti-pattern: Data tables "made responsive" by shrinking - micro type to keep every column, or columns silently clipped, instead of a real narrow-width decision.
- markers: Table type shrunk below the scale's floor to fit columns; columns clipped at narrow widths with no horizontal-scroll container; no column-priority order (which columns survive narrowing) and no card-collapse pattern where one is warranted; row actions unreachable at phone widths. Context class: a wide table may legitimately scroll horizontally inside its own overflow container with the identifying column pinned - that is a recorded decision, shrinking is a default.
- why-it-fails: Tables are where merchant work actually happens, and the shrink non-decision makes the densest, highest-value screens the least usable on the device where quick checks happen; the DataTable's narrow-width behavior must be specified, not inherited.
- negative-prompt: a named narrow-width strategy per table (column priority, card collapse, or contained horizontal scroll with pinned identifier), no type below the scale floor, row actions reachable at phone widths
- severity: hurts
- provenance-class: session corpus
- privacy-check: pass - generalized responsive-failure class; no end-user, customer, or mission data
