# Traps: AI Slop UI

The generic-generated-UI aesthetic - the visual signature that marks a screen as unconsidered AI output rather than a designed product surface. These defects matter double in mockify because the mockups ARE generated: the director wields artifact-design/frontend-design craft against exactly this gravity, and a mockup that reads as slop poisons the human pick gate - the concept underneath never gets a fair reading. The signature is recognizable as a set: violet gradients, emoji icons, stock shadcn furniture, hero composition on work screens, one radius everywhere, data that announces itself as fake.

How entries are consumed: spec-file avoid-lists cite entries by id; the director pastes each entry's negative-prompt phrasing into per-screen mockup briefs in deepen mode; the critic's anti-pattern scan and the judge's craft dimension use the markers as a defect checklist against the actual HTML. Each entry carries the eight schema fields (id, anti-pattern, markers, why-it-fails, negative-prompt, severity, provenance-class, privacy-check). Severity bands are closed and honest: kills-the-screen (the spec/mockup cannot ship with it), hurts (ships only with a recorded reason), cosmetic (note it, fix in the next pass).

### ai-slop-ui-01 - gradient-wash
- id: ai-slop-ui-01
- anti-pattern: Gratuitous gradients - purple-to-blue washes on buttons, headers, cards, and headings with no basis in the app's token system.
- markers: Gradient backgrounds on functional surfaces (buttons, badges, card headers, sidebars); gradient text on headings; the violet-blue-cyan family specifically (the default-model palette); any gradient no DESIGN.md or theme token defines. Context class: a kit-defined gradient on a marketing-in-app surface (upgrade banner, onboarding splash) is legitimate.
- why-it-fails: The unearned gradient is the fastest "AI made this" tell in product UI, and it breaks semantic theming - a gradient hardcodes colors the token system cannot re-theme, so dark/light parity dies with it (color-tokens-a11y pack).
- negative-prompt: no gradient backgrounds on functional surfaces, no gradient buttons, no gradient text headings, no violet-to-cyan washes, flat semantic token colors only
- severity: hurts
- provenance-class: session corpus
- privacy-check: pass - generalized generated-UI defect class; no end-user, customer, or mission data

### ai-slop-ui-02 - emoji-iconography
- id: ai-slop-ui-02
- anti-pattern: Emoji standing in for functional iconography - rocket, sparkle, chart, and lightbulb emoji doing the icon set's job.
- markers: Emoji in navigation, buttons, section headers, stat tiles, or table cells where ecosystem screens use lucide glyphs; emoji rendered at icon sizes, inheriting platform-specific glyph shapes; the sparkle emoji marking AI features. Context class: emoji inside user-authored content, or one emoji in celebratory empty-state copy where the app's DESIGN.md tone allows it.
- why-it-fails: Emoji are uncontrollable - platform-rendered, unthemeable, off-grid, inconsistent in stroke and weight against a real icon set - and they read as the generator not having an icon system, because product teams in this ecosystem always do.
- negative-prompt: no emoji as icons, no emoji in navigation or buttons or stat tiles, use the app's icon set (lucide) at consistent stroke weight and size
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized generated-UI defect class; no end-user, customer, or mission data

### ai-slop-ui-03 - cookie-cutter-shadcn
- id: ai-slop-ui-03
- anti-pattern: The unmodified-default shadcn look - a screen indistinguishable from every other generated dashboard: stock radius and muted-gray palette, stat-card row plus area chart plus table, sidebar with the same five items.
- markers: Zero deviation from library defaults where the app's theme defines overrides; the stat-cards-then-chart-then-table composition regardless of the screen's actual job; visual sameness across the concept fan-out (the tell that no direction seed was served); components recognizably shadcn-example rather than this app's DESIGN.md voice.
- why-it-fails: The pick gate needs distinct directions, and cookie-cutter output collapses the fan-out into one concept wearing three names; the shipped app then reads as template, not product (concept-selection rubric: distinctiveness within the design system). Context class: library defaults are legitimate where the app's theme IS the default theme and the screen class is an internal tool - recorded, not accidental.
- negative-prompt: do not default to the stock shadcn dashboard composition, serve the direction seed, use this app's theme tokens and radii not library defaults, differ visibly from sibling concepts
- severity: hurts
- provenance-class: session corpus
- privacy-check: pass - generalized generated-UI defect class; no end-user, customer, or mission data

### ai-slop-ui-04 - hero-composition-everywhere
- id: ai-slop-ui-04
- anti-pattern: Every screen composed as a centered hero - big centered heading, subtitle, single CTA - including dense work screens whose job is scanning and acting on many records.
- markers: Centered display-size type on list, table, settings, or form screens; vertically centered content wells on screens whose grammar is top-left scan (visual-hierarchy pack); a work surface whose above-the-fold is mostly whitespace and one button. Context class: hero composition is earned on auth screens, true empty states, and single-action confirmation pages.
- why-it-fails: Screen-grammar mismatch - dashboards, lists, and forms have known scan grammars, and hero composition throws away the screen's job to look like a landing page; the persona cannot do work on a poster.
- negative-prompt: no centered hero composition on work screens, top-left scan origin for lists and forms and dashboards, density appropriate to the screen class, no landing-page grammar inside the app shell
- severity: kills-the-screen
- provenance-class: published craft knowledge
- privacy-check: pass - generalized generated-UI defect class; no end-user, customer, or mission data

### ai-slop-ui-05 - border-radius-soup
- id: ai-slop-ui-05
- anti-pattern: One radius applied uniformly to every element - cards, inputs, buttons, badges, avatars, modals - with nested rounded containers ignoring concentric-radius logic.
- markers: Identical radius on containers and their children so nested corners visibly collide; pill badges, buttons, inputs, and cards all at one value so nothing signals its containment level; radii that come from nowhere in the theme scale. Context class: a deliberately flat single-radius system declared in DESIGN.md is a design decision, not soup.
- why-it-fails: Radius is a containment cue - inner elements want a smaller radius than their container (concentric logic), and uniform soup flattens the surface hierarchy the eye uses to parse what belongs to what.
- negative-prompt: no uniform border radius across all elements, concentric radii for nested containers, radius values from the theme scale only
- severity: cosmetic
- provenance-class: published craft knowledge
- privacy-check: pass - generalized generated-UI defect class; no end-user, customer, or mission data

### ai-slop-ui-06 - data-that-reads-fake
- id: ai-slop-ui-06
- anti-pattern: Placeholder content that announces itself - "John Doe", "Lorem ipsum", "Product 1/2/3", uniformly round figures, every trend arrow pointing up.
- markers: Sequential or generic record names; metrics that are all suspiciously tidy; charts that only go up; every date the same date; content lengths uniform (no long name, no empty field, no awkward value anywhere); the mockup's data contradicting the states matrix it claims to evidence. Context class: the fix is invented-but-plausible domain data - realistic merchant/agent/record shapes with awkward lengths and mixed outcomes - never real customer data (the D7 boundary).
- why-it-fails: The mockup is spec evidence - the human gate judges layout under realistic load, and fake-reading data hides exactly the density, truncation, and volume problems the states matrix exists to catch (state-blindness-05, state-blindness-06).
- negative-prompt: no lorem ipsum, no John Doe or sequential Product-N names, invent plausible domain records with awkward lengths and mixed outcomes, include at least one long name and one zero value
- severity: hurts
- provenance-class: session corpus
- privacy-check: pass - generalized generated-UI defect class; no end-user, customer, or mission data

### ai-slop-ui-07 - gratuitous-garnish
- id: ai-slop-ui-07
- anti-pattern: Decorative effects with no informational role - glassmorphism blur panels, glow shadows, animated gradient blobs, staggered entrance animations on a work tool.
- markers: Backdrop blur on surfaces that never overlap content; colored glow box-shadows; per-card entrance animations in a grid; hover scale-ups on non-interactive elements; sparkle or particle ornament. Context class: motion that carries state information (skeleton shimmer, an optimistic-update transition - interaction-states pack) is craft, not garnish.
- why-it-fails: Ornament competes with the emphasis budget (visual-hierarchy pack), adds implementation surface downstream for zero information, and reads as the generator decorating instead of designing; a work tool is entered thousands of times - garnish is charming once and a tax forever.
- negative-prompt: no glassmorphism, no glow shadows, no animated gradient blobs, no entrance animations on work screens, motion only where it communicates state
- severity: cosmetic
- provenance-class: published craft knowledge
- privacy-check: pass - generalized generated-UI defect class; no end-user, customer, or mission data
