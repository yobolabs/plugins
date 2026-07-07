# Pack: Color & Contrast

The lens for palette discipline, contrast that works twice (accessibility and thumb-stop), and durable color psychology by audience class.

## 1. Scope

This lens owns how color is budgeted against the brand kit, how contrast is engineered so the asset is both readable and scroll-stopping, and the durable directional layer of color psychology per audience class.

Not covered here: which colors the brand owns (the kit, pinned at entity resolution; recon reports the values), what is currently fashionable (perishable - recon's trend hunt), where colored elements sit in the reading order (visual-hierarchy pack), and lighting realism inside generated scenes (the ai-artifacts trap file owns render defects; this lens sets the intended palette and grade).

## 2. Core craft principles

- **Budget the palette: dominant, secondary, accent.** A disciplined asset runs roughly one dominant field, one supporting color, and one accent - and the accent is spent on the action (CTA or key message), nowhere else. The classic 60-30-10 split is a starting ratio, not a law; the law is that the accent is scarce, because scarcity is what makes it point.
- **Value contrast beats hue contrast.** Light-against-dark is what the eye actually reads; two hues of the same darkness vibrate but do not separate. The grayscale check (desaturate the asset mentally or literally) reveals whether the structure survives - if it does not, no amount of colorfulness will save it.
- **Contrast has two customers.** The same value contrast that lets a low-vision user read the headline is what makes the asset legible on a dim phone in daylight glare. Accessibility contrast on all text is a floor, not a virtue signal - the accessible version is the version that survives real viewing conditions.
- **The feed is the visual competitor.** An ad's palette is seen against platform chrome and the neighboring content above and below it. A palette that blends into the ambient feed disappears; one that violates the brand kit to chase contrast reads as counterfeit. The craft is finding contrast against the CONTEXT from inside the kit.
- **Color psychology is directional, never deterministic.** Durable associations exist at the audience-class level: warm saturated tones read as appetite, energy, urgency; deep muted tones read as premium, calm, considered; high-saturation high-contrast schemes read as youthful and loud; desaturated naturals read as organic, honest, handmade. Category and culture override all of these - recon verifies the direction for THIS audience and market before the direction is trusted.
- **One grade per world.** Whatever the palette, the color treatment (grade, temperature, saturation ceiling) must be consistent within the asset and across the batch. A subject graded differently from its background reads as a composite; asset 10 graded differently from asset 1 reads as a different brand.
- **Restraint reads as confidence.** Maximum saturation everywhere is the house style of machine-generated filler. Deliberate, bounded color choices signal that a human with intent made this.

## 3. Directive inventory

**CC-1 - Spend the accent on the action**
- principle: budget the palette - the accent color exists to make exactly one thing point (usually the CTA).
- preconditions: any asset with an action or key message. If the kit has no designated accent, the director nominates one from the kit and records it as an M-rule so the batch stays consistent.
- failure modes: accent used on badges, borders, and underlines until it points at nothing (hier-everything-shouts, color edition); accent invented outside the kit (brand-off-palette).
- prompt hooks: "restrained color palette", "muted background with a single [color] accent", "[brand color] as the only saturated element".

**CC-2 - Pass the grayscale check**
- principle: value contrast beats hue - structure must survive desaturation.
- preconditions: every asset; mandatory for any text-over-image region. This is a mechanical expected-vs-broken line for the crit pass and for execute's L2 vision check.
- failure modes: hue-only separation vibrating at feed size; text floating on a background of the same darkness; the focal point vanishing under squint (hier-no-focal).
- prompt hooks: "strong tonal contrast between subject and background", "dark subject against light background" (or inverse), "clear value separation".

**CC-3 - Hold the kit palette**
- principle: the feed is the competitor, but the kit is the constitution - contrast is found inside the brand's palette, not by escaping it.
- preconditions: whenever a brand kit exists. Where the kit is genuinely too quiet for a placement, the escalation is an open question to the merchant in the craft file, never a silent new color.
- failure modes: near-miss hues drifting from kit values (brand-off-palette); gradient inventions and duotones the kit never defined; batch members each solving contrast differently (brand-batch-drift).
- prompt hooks: name the actual values in the mission prompt - "color palette of [kit values from recon]", "background in [kit neutral]", "product in its true brand colors".

**CC-4 - One dominant field**
- principle: budget the palette - the dominant color is a field the eye can rest on, not a contest.
- preconditions: layout-led assets (cards, banners, offer posts). Photography-led assets inherit their dominant field from the scene, which the grade must then unify.
- failure modes: gradient soup and multi-color backgrounds that eat the emphasis budget; backgrounds competing with the product's own colors on cards (chan-card-noise).
- prompt hooks: "solid [color] background", "clean single-color backdrop", "simple uncluttered background in [kit neutral]".

**CC-5 - Aim the psychology, then verify it**
- principle: color psychology is directional - use the durable class-level associations to pick a starting direction, then have recon verify against THIS audience and category.
- preconditions: concept stage, when the direction's mood is chosen. The associations in this pack are the durable layer; anything trend-scented (this season's palette, a viral aesthetic) is recon's to fetch and the craft file's to carry as mission-specific guidance.
- failure modes: appetite colors on a premium calm offer (mixed signals); borrowed palette from another category reading as cosplay (cliche-premium-cosplay); assuming an association that the local culture inverts.
- prompt hooks: "warm appetizing tones", "deep muted premium palette", "fresh natural desaturated tones", "bold high-energy color scheme" - chosen per the verified direction.

**CC-6 - Accessibility floor on all text**
- principle: contrast has two customers - every piece of text meets readable contrast against its actual background region.
- preconditions: all text, all placements, no exceptions for legal small print (if it must be present, it must be readable). Busy image regions behind text need a scrim, a plate, or a relocated slot - not thinner type.
- failure modes: white text on a bright variable background readable only in the lucky regions; brand-colored text on brand-colored field passing on the canvas and failing on a dim screen.
- prompt hooks: "clean dark area in [region] for light text overlay" (or inverse), "even background tone behind the text area".

**CC-7 - Saturation restraint**
- principle: restraint reads as confidence - cap saturation and let one element carry the intensity.
- preconditions: all generated imagery; especially portraits and food, where generators over-saturate by default.
- failure modes: the max-saturation max-contrast everything-glows look that audiences now read as AI slop (cliche-slop-aesthetic); skin tones pushed to orange; food pushed to radioactive.
- prompt hooks: "natural color grading", "realistic saturation", "soft natural light", "true-to-life skin tones", "editorial color grade".

## 4. Signature questions

1. Desaturated, does the asset still have structure - subject separated, text readable, focal point winning?
2. What is the accent color, and how many things is it on? (The right answer is one.)
3. Is every color on this asset traceable to the brand kit, and if not, where is the deviation recorded?
4. What does this palette read as to THIS audience - and is that read verified by recon or assumed from the durable defaults?
5. Where will this sit in the feed - does it separate from the platform chrome and typical neighboring content without leaving the kit?
6. Is any text sitting on a region where its contrast is a gamble?
7. Put asset 1 beside this one: same grade, same temperature, same saturation ceiling?

## 5. Placement / asset-class mapping

| Placement class | Weight | What this lens demands here |
|---|---|---|
| Feed image (square / tall portrait) | primary | Separation from feed chrome; accent on CTA; grayscale check at render size |
| Story / full-screen vertical | primary | Full-bleed color owns the whole screen - dominant field discipline matters most here; text contrast against video-adjacent brightness |
| Marketplace / product card | primary | Background must flatter and never compete with the product's true colors; true-to-life product color is an honesty requirement, not just craft |
| Banner / leaderboard (wide) | secondary | Small canvas = strictest accent discipline; one dominant field, one accent, done |
| Hero / landing image | secondary | Grade sets the tone for the whole page; consistency with the campaign's feed assets keeps the scent trail intact |

## 6. Exemplar pointers

Slots for the exemplar stories to fill; do not invent files:

- exemplar needed: an ad that passes the grayscale check and its color-blind-safe rendering side by side (anchor for CC-2/CC-6)
- exemplar needed: a kit-constrained asset that still thumb-stops, annotated with where the contrast comes from (anchor for CC-3)
- exemplar needed: a slop-graded generation vs the same scene re-prompted with restraint hooks (negative/positive pair for CC-7)

## 7. Trap cross-references

- brand-off-palette (`../traps/brand-drift.md`) - the kit-drift failure CC-3 exists to prevent
- brand-batch-drift (`../traps/brand-drift.md`) - grade/palette divergence across the batch (CC-3, one-grade principle)
- brand-logo-abuse (`../traps/brand-drift.md`) - recoloring or effecting the mark is the sharpest form of kit violation (CC-3's hard edge)
- cliche-slop-aesthetic (`../traps/cliche-inauthentic.md`) - the saturation failure CC-7 guards against
- cliche-premium-cosplay (`../traps/cliche-inauthentic.md`) - borrowed premium palette without the offer to back it (CC-5)
- ai-lighting-mismatch (`../traps/ai-artifacts.md`) - render-side grade incoherence; CC's one-grade principle at scene level
- hier-everything-shouts (`../traps/hierarchy-failures.md`) - the color edition: accent everywhere, pointing nowhere (CC-1)
- chan-card-noise (`../traps/channel-violations.md`) - background color competing with the product on cards (CC-4)
