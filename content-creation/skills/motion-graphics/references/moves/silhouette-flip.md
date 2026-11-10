# Move: Silhouette Flip

Back to [SKILL.md](../../SKILL.md).

- **status:** stub
- **seen in:** `_context/yobolabs/video-breakdowns/youtube-cDb-wPq0Iyk-claude-motion-graphics.md` (0:04–0:07 product turns into a flat white shape on black, then the frame inverts to a black head silhouette on white) — evidence only, never rules
- **frame strip:** `_context/yobolabs/video-breakdowns/frames/cDb-wPq0Iyk-silhouette-flip.jpg` (source)
- **tools:** Remotion (threshold/flat fill) or the 3D render's alpha

**Use when:** Moving from product detail to a person/lifestyle beat, or into an ending, with one graphic gesture.
**Look:** The lit product loses its shading and becomes a pure flat shape; then black and white swap across the whole
frame; the next scene is drawn in the same two tones.

## Timing
- Shading → flat: 6–8 frames. Invert: 2–4 frames (a hard flip reads as intentional).

## Build
- Use the render's alpha as a mask filled with flat white; invert by swapping bg and fill colours.

## Traps
- Soft alpha edges glow grey after the flip; harden the mask edge first.
