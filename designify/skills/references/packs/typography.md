# Pack: Typography

The lens for type as it survives a phone screen in a moving feed - pairing, scale, glance legibility, and brand-type fidelity.

## 1. Scope

This lens owns type selection and pairing, type scale at feed size, legibility at glance-speed, and conformance to the brand kit's typefaces. It treats type as a visual system first and a carrier of words second.

Not covered here: what the words say (copy comes from ads-strategist ad-copy; the craft file only defines copy SLOTS), the color of type against its background (color-contrast pack owns contrast mechanics), where type sits in the reading order (visual-hierarchy pack), and per-platform text-coverage norms (channel-grammar pack; recon fetches current thresholds).

## 2. Core craft principles

- **Design at render size, not canvas size.** The audience sees this type on a phone, small, in motion, at arm's length, often in sunlight. Type that looks elegant on a zoomed design canvas routinely dies at feed size. The only honest proof is viewing the asset at the size it will actually render.
- **Headlines are display objects, not sentences.** At glance-speed a headline is seen as a shape before it is read as words. Few words, set large, with a tight visual footprint, beat a full sentence every time. If it needs a second line of explanation, the message is wrong, not the type.
- **Pair by contrast, cap at two.** Two type families maximum: one with a voice (display/headline) and one workhorse (support/CTA/legal). Pairs work when they contrast clearly (a strong display against a plain sans); near-miss pairs that almost match read as a mistake.
- **Weight before size.** When something needs more emphasis, try a heavier weight before a larger size - it strengthens the read without breaking the layout or the tier ladder.
- **Case and spacing are legibility levers.** All-caps works only for short labels (CTA buttons, kickers) - it slows reading of anything longer. Small type needs more generous letter spacing and line height, not less. Tight, dark, dense settings are for posters viewed at leisure, which an ad never is.
- **Brand type is identity.** Regular customers recognize the brand's typeface the way they recognize its logo - without being able to name it. A near-miss substitute reads as counterfeit at a subconscious level. Use the kit's faces or the kit's documented fallback; never a lookalike.
- **In gen-AI work, type belongs to post, not to the model.** Image generators garble text. Words, logos, and prices are composited as an overlay layer after generation; the generated image should be directed to leave clean space for them.

## 3. Directive inventory

**TY-1 - Prove type at render size**
- principle: design at render size - legibility claims are only valid at the size and distance the placement delivers.
- preconditions: every asset with any type. The check happens on an actual phone-scale render, not a zoomed canvas; this is an expected-vs-broken line in the craft file.
- failure modes: fine type invisible at feed scale (chan-thumbnail-blind); body copy that forces zooming (hier-text-wall).
- prompt hooks: verification directive; in generation prompts, reserve the slot: "clean empty area in the [upper/lower] third for text overlay", "uncluttered background region suitable for headline placement".

**TY-2 - Two families, contrasting roles**
- principle: pair by contrast, cap at two - one voice face, one workhorse face, clearly different.
- preconditions: applies to overlay/composite design. When the brand kit names its pair, the kit wins; this directive then only governs role assignment (which face gets headline duty).
- failure modes: three or more families making the asset read as a ransom note; two near-identical sans faces reading as a rendering error (brand-type-swap when one is a kit face).
- prompt hooks: overlay-stage directive; not prompt language.

**TY-3 - Headline word budget**
- principle: headlines are display objects - a handful of words set large beats a sentence set medium.
- preconditions: feed and story assets always; cards usually carry product name and price instead of a headline; hero images can afford one more beat. The budget disciplines the copy SLOT definition, not the copy itself (copy is ads-strategist territory - the craft file states the slot's word budget).
- failure modes: full sentences at feed scale (hier-text-wall); the headline wrapping to three lines and colliding with the safe zone (chan-safe-zone-clip).
- prompt hooks: slot definition, e.g. "headline slot: max 5 words, display size" written into the craft file's copy-slot spec.

**TY-4 - Emphasize with weight first**
- principle: weight before size - a heavier cut of the same face adds emphasis without inflating the layout.
- preconditions: whenever a word inside a tier needs stress (the offer number, the product name). Size jumps are reserved for tier changes (visual-hierarchy VH-2).
- failure modes: emphasis by making everything bigger until tiers blur (hier-everything-shouts); emphasis by adding a third color (color-contrast CC-1 owns accent discipline).
- prompt hooks: overlay-stage directive.

**TY-5 - Case and spacing discipline**
- principle: case and spacing are legibility levers - caps for short labels only; small sizes get looser spacing and taller line height.
- preconditions: all overlay text. CTA buttons and kickers may be caps; headlines in sentence case or title case per brand kit tone; legal small print never in caps.
- failure modes: all-caps paragraphs that read as shouting and scan slowly; tight tracking at small size smearing into illegibility on compressed renders.
- prompt hooks: overlay-stage directive.

**TY-6 - Brand-type conformance**
- principle: brand type is identity - kit faces or documented fallback, nothing else, on every asset in the batch.
- preconditions: always when a brand kit exists (entity resolution pins the kit at intake). When no kit face is available in the rendering tool, the fallback must be the kit's documented substitute, and the deviation goes in the craft ledger.
- failure modes: silent lookalike substitution (brand-type-swap); the renderer's default font leaking into one asset of a batch (brand-batch-drift).
- prompt hooks: overlay-stage directive; conformance is checked per M-rule in the crit pass.

**TY-7 - Keep words out of the generator**
- principle: in gen-AI work, type belongs to post - generated text garbles, and garbled text outs the whole asset as AI.
- preconditions: any generated image. Exceptions are none for headline/CTA/price; incidental environmental text (a distant shop sign) is directed AWAY from legibility or excluded outright.
- failure modes: in-image gibberish lettering (ai-text-garble); generated fake logos or labels misrepresenting the product (ai-product-mutation).
- prompt hooks: positive - "no visible text or signage", "clean unlabeled packaging", "plain storefront without readable signs"; the avoid-list side is carried by the ai-text-garble trap entry.

## 4. Signature questions

1. Viewed at actual render size on a phone - can every word that matters be read without effort?
2. How many words is the headline, and would it lose anything at half the count?
3. How many type families are in the frame, and can each justify its seat?
4. Is anything all-caps that is longer than a label?
5. Is every face on this asset from the brand kit (or its documented fallback), including numbers and currency symbols?
6. Is there any text the generator is being asked to render? (The answer should be no.)
7. Does the type treatment on this asset match asset #1 of the batch?

## 5. Placement / asset-class mapping

| Placement class | Weight | What this lens demands here |
|---|---|---|
| Feed image (square / tall portrait) | primary | Headline at display scale, tight word budget; support line optional; CTA short and set in the workhorse face |
| Story / full-screen vertical | primary | Larger type than instinct suggests (viewed briefly, full screen); keep all type inside safe zones; one message per frame |
| Marketplace / product card | primary | Product name and price legible at grid size - this is the whole typographic job; no decorative type |
| Banner / leaderboard (wide) | secondary | One line, one face, maximum legibility; there is no room for a pair to perform |
| Hero / landing image | secondary | The one placement where a longer support line can live; still display-first, still kit faces |

## 6. Exemplar pointers

Slots for the exemplar stories to fill; do not invent files:

- exemplar needed: a feed ad whose headline reads as a shape at thumbnail size and holds at full size (positive anchor for TY-1/TY-3)
- exemplar needed: a pair of assets, one with kit type and one with a near-miss substitute, annotated with what gives the counterfeit away (anchor for TY-6)
- exemplar needed: a generated image directed to leave a clean overlay zone, shown before and after text compositing (anchor for TY-7)

## 7. Trap cross-references

- ai-text-garble (`../traps/ai-artifacts.md`) - the render-side shadow of TY-7
- ai-product-mutation (`../traps/ai-artifacts.md`) - generated labels/packaging misrepresenting the product (TY-7)
- hier-text-wall (`../traps/hierarchy-failures.md`) - the word-budget failure at layout level (TY-1, TY-3)
- chan-text-overload (`../traps/channel-violations.md`) - text share beyond the placement's norm (TY-3)
- chan-thumbnail-blind (`../traps/channel-violations.md`) - approval at design size only (TY-1)
- brand-type-swap (`../traps/brand-drift.md`) - the identity failure TY-6 exists to prevent
