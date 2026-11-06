# Effect: Magazine Cover

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-Det_44sBsPY-20-effects.md` (27.3–29.4 s) and `breakdown-ig-De8SPjEAuV0-claude-edited.md` (31.5–37.6 s).

**Look:** The shot becomes a magazine cover. A big serif masthead sits **behind the head**; cover lines, issue line, a barcode and a round sticker arrive one per beat on top of the person.
**Use when:** A "this is the big story" moment: a launch, a headline claim, a feature reveal.
**Prompt shape:** `Make this a magazine cover: <MASTHEAD> masthead behind my head, cover lines "<line 1>" and "<line 2>", a barcode and a sticker "<sticker text>", one per beat.`

## Layers (bottom → top)
1. Plate (optionally flattened to a cream background `#F2EBDD` behind the person matte).
2. Masthead text — between background and person.
3. Person matte (cut-out from the same frame).
4. Issue line, cover lines, barcode, sticker.
5. Captions (move to y ≈ 72% or hide for the span).

## Timing
- Masthead hard-cuts in on the trigger word.
- Then one element per spoken beat (word timestamps), in order: issue line → cover line 1 → cover line 2 → barcode → sticker last.
- Each element: scale 0.9 → 1.0 + opacity 0 → 1 over 5 frames (30 fps), `spring({ damping: 14 })`. Sticker: scale 0 → 1.1 → 1.0 over 8 frames, rotate −12°.
- Hold 0.5 s after the sticker, hard cut out. Total 2–6 s.

## Build
- Remotion: `MagazineCover` component. Props: `masthead`, `issueLine`, `coverLines[]`, `stickerText`, `beats[]` (frame numbers), `brand` (accent, serif font).
- Masthead: serif display (e.g. Playfair Display 900), width 92% of frame, top at y ≈ 6%, font size ≈ 15% of height, colour `brand.accent`.
- Issue line: small caps 1.6% height, top y ≈ 4%, centred.
- Cover lines: left column x 6–48%, y 55–75%, serif bold 3.5% height, white with shadow or black on cream.
- Barcode: SVG bars 14% wide × 5% high, bottom-left at y ≈ 88%.
- Sticker: circle 18% of width, `brand.accent` fill, white bold text, right side y ≈ 60%.
- Mask the masthead with the person matte: render masthead, then the matte frame on top (`<Img>` sequence with alpha).

## Inputs
- Person matte, word timestamps (SKILL.md § Inputs).
- Copy: masthead, issue line, 2–3 cover lines, sticker text.

## Traps
- The masthead must be **behind** the head. Overlapping the head on top of the text is the whole effect; text over the face kills it.
- Keep the head top within the masthead band. If the head sits low, scale the plate up 110% so the head overlaps the letters.
- Do not show all elements at once. One per beat is what makes it feel edited.
- Matte edge must be clean around hair; a 1 px feather (`blur(0.5px)` on the alpha) hides jaggies.
