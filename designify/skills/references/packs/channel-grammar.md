# Pack: Channel Grammar

The lens for what each placement natively demands - format matrix structure, the safe-zone concept, and per-placement visual dialect.

DURABILITY RULE (INV-5): this pack carries STRUCTURE only. Exact pixel dimensions, safe-zone insets, text-coverage thresholds, file-size limits, and platform policy lines drift with platform releases - they are NEVER trusted from memory or from this file. Section 3's CG-4 names precisely which numbers recon must fetch per mission; the craft file then carries the recon-current values per asset.

## 1. Scope

This lens owns placement fitness: the format matrix that maps every placement in the mission to its geometry and constraints, the safe-zone concept (platform UI overlays part of every canvas), and the native grammar each placement class has trained its audience to expect.

Not covered here: the current numeric specs themselves (recon fetches, per mission), what the message is (conversion-craft), how elements are ordered inside the canvas (visual-hierarchy), and motion/video placements (v2 - this pack is static-only in v1).

## 2. Core craft principles

- **Every placement is a dialect.** Audiences have been trained by millions of impressions on what content natively looks like in each surface: feed posts look one way, full-screen stories another, marketplace listings another. An asset that speaks the wrong dialect is spotted as an intruder before its message is read - and placement-native grammar is an authenticity input (authenticity pack), not just a compliance box.
- **The placement classes are durable even when specs are not.** Static ad surfaces cluster into stable classes: the FEED unit (square-to-tall-portrait, seen between organic content, sound-off world), the FULL-SCREEN VERTICAL story unit (immersive, ephemeral feel, casual grammar), the CARD unit (product tile inside a comparison grid), the WIDE BANNER unit (thin horizontal strip, one line of attention), and the HERO unit (owned-surface lead image). New placements almost always slot into one of these classes; the class tells you the grammar before recon tells you the numbers.
- **Aspect families are geometry; assignments are per-mission facts.** Square (1:1-class), tall portrait (4:5-class), full-screen vertical (9:16-class), and wide (16:9 / 1.91:1-class) are durable families to compose FOR. Which placement takes which family, and at what exact pixel dimensions, is a recon-verified fact in the format matrix - never assumed.
- **The safe zone is a concept with per-mission numbers.** Platforms draw UI over the ad canvas: profile chrome and controls at the top, captions/CTA furniture and interaction rails at the bottom, and on some surfaces side rails. Critical content (headline, product, CTA, faces) lives inside the safe area; only bleed and atmosphere touch the edges. The concept never changes; the insets do - recon fetches them.
- **Composition does not survive cropping.** A composition is made for one aspect family. Auto-cropping a square master to vertical (or vice versa) moves the focal point, breaks the eye path, and clips safe zones. One master per aspect family, each composed natively.
- **The format matrix is the contract.** Before anything is generated, the mission's placements are enumerated in a matrix - placement, aspect family, recon-current dims, safe-zone insets, text norms, file constraints, grammar notes. Every per-asset section of the craft file binds to its row; execute's L1 check is mechanical against it.

## 3. Directive inventory

**CG-1 - Compose per aspect family, never auto-crop**
- principle: composition does not survive cropping - one master composition per aspect family in the mission.
- preconditions: any mission with more than one placement class (which is nearly all). Variants within a family (e.g. two feed sizes) may share a master; across families they may share a concept, never a crop.
- failure modes: single-master exports with off-center focal points and clipped subjects (chan-one-size-export); letterboxed or stretched fills (chan-wrong-aspect).
- prompt hooks: generate per family - "vertical 9:16 composition, subject in the center band", "square composition, subject centered with margin", "wide landscape composition, subject left of center".

**CG-2 - Design inside the safe area**
- principle: the safe zone is a concept with per-mission numbers - critical content inside, only bleed outside.
- preconditions: all placements, most acutely full-screen vertical (UI at both top and bottom) and feed units with overlaid CTA furniture. The craft file's per-asset platform spec carries the recon-current insets; this directive states the discipline.
- failure modes: headline under the platform's caption block, CTA under the interaction rail, face behind profile chrome (chan-safe-zone-clip).
- prompt hooks: "subject in the middle band of the frame", "top and bottom margins kept clear", "key elements away from frame edges".

**CG-3 - Match the native dialect**
- principle: every placement is a dialect - the asset should look like it was made FOR this surface.
- preconditions: always; the dial setting comes from the concept direction (a deliberately polished object can work in a casual surface, but as a chosen contrast, not an accident). Story surfaces reward immediacy and UI-native feel; feed rewards polished-but-native; cards reward catalog clarity; banners reward signage economy.
- failure modes: story-grammar casualness shipped to a marketplace card, or feed gloss shipped to story (chan-grammar-transplant); print-poster density on any small-screen surface; fake platform UI elements used as decoration.
- prompt hooks: per class - story: "candid handheld feel, natural framing"; feed: "clean editorial product photography"; card: "catalog product shot, even lighting, plain background"; hero: "wide establishing shot with clear focal subject".

**CG-4 - Build the format matrix first, from recon**
- principle: the format matrix is the contract - enumerate before generating. Recon must fetch, per placement: exact pixel dimensions and aspect ratio, safe-zone insets, text-coverage norm or policy, file type/size limits, logo or CTA overlay furniture the platform adds, and any category policy constraints (e.g. restricted-category imagery rules).
- preconditions: every mission, at the rule-manifest step, before any generation. A placement without a completed matrix row is not ready to design for; a matrix cell recon could not verify is marked dont-know and surfaced, never guessed.
- failure modes: designing to remembered specs that drifted (chan-wrong-aspect, chan-safe-zone-clip); discovering file limits at export; text norms discovered after the batch is generated (chan-text-overload).
- prompt hooks: process directive - its output feeds every per-asset platform-spec block in the craft file.

**CG-5 - Check cards in grid context**
- principle: the card unit lives inside a comparison grid - it is judged against its neighbors simultaneously, not alone.
- preconditions: marketplace/catalog card placements. The proof view is a mock grid at actual render size with plausible neighbor tiles, not the card floating on a design canvas.
- failure modes: atmospheric lifestyle art where the grid demands product-forward clarity (chan-card-noise); name/price illegible at grid size (chan-thumbnail-blind).
- prompt hooks: "single product centered on clean background", "even shadowless product lighting", "full product visible, no crop".

**CG-6 - Compose vertical natively for story surfaces**
- principle: full-screen vertical is its own composition problem - a vertical stage with the action in the center band, not a tall crop of a horizontal idea.
- preconditions: any 9:16-class placement. Subjects, eye path, and text slots are arranged vertically (hook high, hero center, action low - see visual-hierarchy VH-3/VH-6 for the path itself).
- failure modes: horizontal scene squeezed or cropped to vertical, amputating the subject (chan-wrong-aspect); all content top-loaded while the lower third under-delivers.
- prompt hooks: "vertical full-frame composition", "portrait orientation scene", "subject fills the center of a tall frame", "vertical environment with headroom".

## 4. Signature questions

1. Does the format matrix have a completed, recon-verified row for every placement in the mission - and is any cell a guess?
2. For each asset: which aspect family was this composed for, and is it being shipped anywhere outside that family?
3. Overlay the platform UI mockup: does anything that matters sit under chrome, captions, or rails?
4. Would a native user of this surface believe this was made for it - or does it smell imported?
5. For cards: viewed in a grid of competitors at render size, does this tile win on clarity?
6. What did recon flag as dont-know in the matrix, and has it been resolved or surfaced?
7. Is any platform policy (text norms, category imagery rules) binding on this mission, and is it in the M-rules?

## 5. Placement / asset-class mapping

This lens applies to every row by definition; the table states each class's grammar headline. Walk order: primary rows first.

| Placement class | Weight | Native grammar headline |
|---|---|---|
| Feed image (square / tall portrait) | primary | Polished-but-native; one message; safe from overlaid furniture; composed for its family, not cropped |
| Story / full-screen vertical | primary | Immersive and immediate; casual dialect; center-band composition; strictest safe zones (UI top and bottom) |
| Marketplace / product card | primary | Catalog clarity; product-forward; judged in a grid; name/price legible at tile size |
| Banner / leaderboard (wide) | secondary | Signage economy: one line, one mark, one action; nothing survives clutter at this size |
| Hero / landing image | secondary | Owned surface, loosest platform constraints; still composed per family and consistent with the campaign's dialect |

## 6. Exemplar pointers

Slots for the exemplar stories to fill; do not invent files:

- exemplar needed: the same concept composed natively for square, vertical, and wide, side by side with the auto-cropped versions that would have shipped instead (anchor for CG-1/CG-6)
- exemplar needed: a story asset shown with the platform UI overlay mockup, safe zones respected vs violated (anchor for CG-2)
- exemplar needed: a marketplace card that wins its mock grid, beside an atmospheric card that loses it (anchor for CG-5)

## 7. Trap cross-references

This lens's failure shadow lives in `../traps/channel-violations.md`:

- chan-safe-zone-clip - critical content under platform UI (violates CG-2)
- chan-text-overload - text share past the placement norm (violates CG-4's fetched norms)
- chan-wrong-aspect - shipped outside its composed family (violates CG-1, CG-6)
- chan-grammar-transplant - wrong dialect for the surface (violates CG-3)
- chan-one-size-export - one master auto-fit to everything (violates CG-1)
- chan-thumbnail-blind - never proofed at render size (violates CG-5 and typography TY-1)
- chan-card-noise - grid context ignored (violates CG-5)
