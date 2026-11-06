# Effect: Orbit

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-Det_44sBsPY-20-effects.md` (3.25–4.50 s).

**Look:** Six small app-style icon chips circle the speaker's head on a thin dashed ellipse. Chips on the far side pass behind the head.
**Use when:** Naming a set of tools or features "around" the person, or an "everything at your fingertips" beat.

## Layers (bottom → top)
1. Plate.
2. Back half: dashed ellipse + chips whose angle puts them behind the head.
3. Person matte (re-composite the speaker on top).
4. Front half: chips in front of the head.
5. Captions.

## Timing
- In: chips scale 0 → 1 over 8 frames, stagger 2 frames, `spring({damping: 14})`.
- Rotation: one full turn per 90 frames (4°/frame), constant speed. Start angle offset = 360°/n per chip.
- Out: hard cut.

## Build
- Remotion: `Orbit`, props `{ brand, icons: url[] (4–8), center: {x: 0.5, y: 0.36}, rx: 0.34, ry: 0.10, tiltDeg: -8, speedDegPerFrame: 4, layer: 'back'|'front' }` (positions as fractions of 1080x1920).
- Chip i: `a = frame*speed + i*360/n`; `x = cx + rx*W*cos(a)`, `y = cy + ry*H*sin(a)`; depth scale `interpolate(sin(a), [-1, 1], [0.8, 1.05])`.
- Render `layer` only shows chips with `sin(a) < 0` (back) or `>= 0` (front).
- Chip: ~6% of width (65 px), rounded square r=14, brand.surface fill, brand.ink glyph; one chip brand.primary as accent.
- Ellipse: SVG `stroke-dasharray="6 8"`, white @ 60%, 2 px, drawn in the back render only.
- Two ProRes renders; composite back → matte → front.

## Inputs
- Matte: yes (head occlusion). Word times: yes (start).
- Icons: generic UI glyphs (captions, text, scissors, play, waveform, plus).

## Traps
- If the speaker moves, a fixed centre lets the orbit slide off the head. Drive `center` per frame from the matte's head bbox (top 35% of the matte).
- Without the back/front split, chips float flat over the face and read as stickers.
- `rx` over 0.35 clips chips at the frame edges.
