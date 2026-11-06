# Effect: Frame Escape

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-Det_44sBsPY-20-effects.md` (6.77–8.33 s).

**Look:** The video becomes a tilted photo with a thick white border on a dark background. The photo then drops to the lower third, and the speaker's head and shoulders stick out above its top edge, as if climbing out of the picture.
**Use when:** "Breaking out", "beyond the frame", or any beat about escaping limits.

## Layers (bottom → top)
1. Background: brand.bgDark, radial blue glow @ 20% behind the head.
2. Photo card: plate inside a white border (~2.5% of width, 27 px), rotated -4° to -6°.
3. Person matte at full size, masked to the area ABOVE the card's top edge. Inside the card the plate already shows the person.
4. Captions.

## Timing
- Frames 0–6: plate scales 1 → 0.92 and rotates 0 → -4°; white border fades in. The card still covers most of the frame.
- Frames 6–14: card top edge slides from y ~4% to y ~55% (card height shrinks to ~25% of the frame), `spring({damping: 18})`. The person does not move.
- Hold. Out: hard cut.

## Build
- Remotion: `FrameEscape`, props `{ brand, borderPx: 27, tiltDeg: -5, cardTopFrom: 0.04, cardTopTo: 0.55, settleFrame: 14 }`. Renders bg + border + card with the plate in a clip-path rect.
- Escape layer: matte alpha AND (y < cardTop(frame)), on top of the card render.
- FFmpeg: `[plate][matte]alphamerge[person];[cardRender][person]overlay=0:0` with the person pre-masked by a top-region mask that moves with the card.

## Inputs
- Matte: yes (the whole effect). Word times: yes (start).

## Traps
- The card's bottom edge must sit below the shoulders, or the body looks cut off in mid-air.
- Matte halos show against the dark bg. Erode the matte 1 px, feather 2 px.
- Card tilt over 8° next to an upright body reads as a mistake.
