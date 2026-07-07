# Traps: Channel Violations

Placement-fitness failures - the asset is wrong for the surface it ships to: clipped by platform UI, over-texted for the format, mis-shaped for the slot, or speaking the wrong placement dialect. This class is the failure shadow of the channel-grammar pack. Most entries are mechanically checkable at execute's L1 (against the format matrix's recon-current numbers) or by a render-size proof view; they are the cheapest trap class to catch and the most embarrassing to ship.

Durability note (INV-5): entries name the violation CLASS; the current numeric thresholds (safe-zone insets, text norms, exact dims) drift and are recon's per-mission fetch - the format matrix row is the ground truth each entry is checked against. Entries carry the eight schema fields; several negative-prompt fields serve primarily as reviewer-checklist phrasing since the defect is born at composition/export rather than generation.

### chan-safe-zone-clip
- id: chan-safe-zone-clip
- anti-pattern: Critical content under platform UI - headline, CTA, product, or faces sitting where the surface draws its chrome, captions, rails, or buttons.
- markers: Any first-tier element inside the top or bottom overlay regions on a vertical surface; a proof render with the platform UI mockup shows occlusion; the craft file's per-asset platform spec has no recon-verified inset values to check against (that absence is itself the finding).
- why-it-fails: The platform draws its UI regardless of what is under it; occluded content simply does not exist for the viewer (channel-grammar CG-2) - the asset ships pre-damaged.
- negative-prompt: key content at frame edges, text at extreme top of frame, text at extreme bottom of frame, subject touching frame boundary
- severity: kills-the-asset
- provenance-class: published craft knowledge
- privacy-check: pass - generalized placement-failure class; no merchant, campaign, or customer data

### chan-text-overload
- id: chan-text-overload
- anti-pattern: Text share past the placement's norm - the image doing the copy's job, with multiple messages rendered into the pixels.
- markers: Text occupying a visibly large share of the canvas; more than one message in-image; the current platform text norm (recon's fetch) exceeded in the format matrix check; the caption/copy field left empty because everything was pushed into the image.
- why-it-fails: Heavy in-image text reads as spam grammar to audiences and to platform delivery systems alike; surfaces penalize it in distribution and viewers penalize it with the scroll (channel-grammar CG-4, typography TY-3).
- negative-prompt: image covered in text, text-heavy design, multiple text blocks on image, poster-style dense text
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized placement-failure class; no merchant, campaign, or customer data

### chan-wrong-aspect
- id: chan-wrong-aspect
- anti-pattern: Asset shape mismatched to the slot - letterboxed, stretched, squashed, or auto-cropped into the placement instead of composed for it.
- markers: Black or blurred fill bars; subjects amputated at torso or crown; a horizontal composition squeezed vertical; export dimensions differing from the format matrix row; the platform's auto-crop cutting through the focal point.
- why-it-fails: Composition does not survive cropping (channel-grammar CG-1) - the focal point moves, the eye path breaks, and the mismatch reads as neglect: a brand that could not be bothered to make one for here.
- negative-prompt: letterboxing, black bars, stretched image, squashed proportions, awkward crop, cut-off subject
- severity: kills-the-asset
- provenance-class: published craft knowledge
- privacy-check: pass - generalized placement-failure class; no merchant, campaign, or customer data

### chan-grammar-transplant
- id: chan-grammar-transplant
- anti-pattern: Placement-dialect mismatch - a story-grammar asset (casual, immediate, UI-native) shipped to feed, polished feed gloss shipped to story, or either shipped to a marketplace card.
- markers: A story asset carrying feed-style margins and border framing; fake platform UI elements rendered where they mean nothing; a card slot filled with an atmospheric lifestyle scene; the asset visibly imported when placed beside the surface's organic content.
- why-it-fails: Each surface has trained its audience on a native dialect (channel-grammar CG-3), and native grammar is an authenticity input - the wrong dialect announces "advertisement from elsewhere" and forfeits the context's trust before the message lands.
- negative-prompt: fake interface elements, screenshot borders, mismatched platform style, imported layout style
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized placement-failure class; no merchant, campaign, or customer data

### chan-one-size-export
- id: chan-one-size-export
- anti-pattern: One master auto-resized to every placement - the batch shipped as crops of a single composition instead of per-family compositions.
- markers: Identical composition across all placements in the batch; safe zones violated only in the vertical export (the giveaway that it was cropped, not composed); focal point off-center after the fit; the format matrix showing one source file feeding every row.
- why-it-fails: Composition is aspect-specific (channel-grammar CG-1); auto-fit guarantees at least one placement gets a broken layout, and the spend behind that placement buys impressions of a damaged asset - the efficiency is false.
- negative-prompt: identical composition across aspect ratios, auto-cropped export, same framing reused for all formats
- severity: hurts
- provenance-class: session corpus
- privacy-check: pass - generalized placement-failure class; no merchant, campaign, or customer data

### chan-thumbnail-blind
- id: chan-thumbnail-blind
- anti-pattern: Approved at design size, never proofed at render size - the asset exists only in a zoomed canvas nobody will ever see.
- markers: Legible on the desktop canvas, illegible on a phone; key product detail smaller than a fingertip at actual size; approval screenshots all taken at zoom; no render-size proof in the craft ledger.
- why-it-fails: The audience only ever sees the render size (typography TY-1, channel-grammar CG-5); a design-size approval approves a different asset from the one that ships. This is the process failure behind half the other entries in this file - it is how they get through.
- negative-prompt: fine detail invisible at small size, intricate elements at thumbnail scale, small text at feed scale
- severity: hurts
- provenance-class: session corpus
- privacy-check: pass - generalized placement-failure class; no merchant, campaign, or customer data

### chan-card-noise
- id: chan-card-noise
- anti-pattern: Marketplace-card grammar ignored - a busy lifestyle scene, angled artistic product view, or moody shadow where the grid demands product-forward clarity.
- markers: The product is not the dominant element of the tile; background competes with neighboring tiles in the mock grid; name or price illegible at grid size; dramatic lighting hiding the product's true color (an honesty problem as well as a craft one).
- why-it-fails: Cards are compared side by side in a utility context; the clearest honest product presentation wins the tap, and atmosphere belongs to the feed and story placements that lead people here (channel-grammar CG-5, authenticity's card rule: clarity IS this surface's truth).
- negative-prompt: busy background behind product, moody dark product shot, angled artistic product view, cluttered product card, atmospheric product scene
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized placement-failure class; no merchant, campaign, or customer data
