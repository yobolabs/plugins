# Move: Card Wall Dolly

Back to [SKILL.md](../../SKILL.md).

- **status:** stub
- **seen in:** `_context/yobolabs/video-breakdowns/youtube-cDb-wPq0Iyk-claude-motion-graphics.md` (2:15–2:22 player card joins a tilted wall of playlist cards, camera dollies across) — evidence only, never rules
- **frame strip:** `_context/yobolabs/video-breakdowns/frames/cDb-wPq0Iyk-card-wall-dolly.jpg` (source)
- **tools:** Remotion CSS 3D (`perspective`, `rotateY`) with real screenshots

**Use when:** Showing breadth (many items, many features, a big catalogue) after one item has been the hero.
**Look:** The hero card shrinks into its place in a large grid of cards; the grid tilts into perspective (rotateY
20–35°) and the camera slides along it; foreground cards sharp, far ones blurred.

## Timing
- Card into grid 15 frames; tilt 20 frames; dolly continuous 2–4 s; exit by pushing into one card (`shape-morph`).

## Build
- Grid of real cards (screenshots or rendered tiles) on a 3D plane: parent `perspective: 1600px`, child `rotateY`.
- Depth of field: blur by distance from the focus column (0 → 6 px).

## Traps
- Repeating the same 4 tiles reads as fake; use ≥ 12 distinct ones.
- Text on cards becomes unreadable when tilted; nothing must need reading on the wall.
