# Effect: Checklist Pop

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-Det_44sBsPY-20-effects.md` (10.60–12.50 s).

**Look:** Small white pills pop in one under another at the side of the frame, one per spoken word. Each pill has a brand.primary tick circle and a short label.
**Use when:** The speaker lists 2–5 short things ("<step>, <step>, <step>").

## Layers (bottom → top)
1. Plate.
2. Pill stack, right side x ~84–98%, first pill y ~34%, pill height ~2.3% (44 px), gap ~1% (20 px). brand.surface fill, brand.ink 18 px text, brand.primary check circle 24 px on the left.
3. Captions.

## Timing
- Each pill on its word: scale 0.4 → 1 over 6 frames, `spring({damping: 11, stiffness: 180})`; opacity 0 → 1 in 3 frames.
- Tick draws after the pill lands: SVG `stroke-dashoffset` 1 → 0 over 5 frames.
- Optional: faint dots (white @ 30%) mark where the next pills will land.
- Out: hard cut.

## Build
- Remotion: `ChecklistPop`, props `{ brand, items: {label: string, atFrame: number}[], side: 'left'|'right', top: 0.34 }`.
- Pill i: `s = spring({frame: frame - items[i].atFrame, fps, config: {damping: 11, stiffness: 180}})`; `transform: scale(interpolate(s, [0, 1], [0.4, 1]))`.

## Inputs
- Matte: no. Word times: yes (one per item).

## Traps
- Keep pills off the face. If the matte's head bbox is right of centre, use `side: 'left'`.
- Labels over 12 characters stretch the pill into the face. Max 2 words.
- Words closer than 6 frames make the springs pile up. Enforce a 6-frame minimum gap.
- More than 5 pills crowds the side column. Use [effect-tally](effect-tally.md) (full card) for longer lists.
