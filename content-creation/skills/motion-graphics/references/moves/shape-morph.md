# Move: Shape Morph

Back to [SKILL.md](../../SKILL.md).

- **status:** proven 2026-11-10 (Remotion proof render, 1080x1920) — strip `_context/yobolabs/video-breakdowns/proof/mg-shape-morph-strip.png`
- **seen in:** `_context/yobolabs/video-breakdowns/youtube-cDb-wPq0Iyk-claude-motion-graphics.md` (2:09–2:16 logo → circle → rounded square → player card) — evidence only, never rules
- **frame strip:** `_context/yobolabs/video-breakdowns/frames/cDb-wPq0Iyk-shape-morph.jpg` (source)
- **tools:** `content-creation:remotion-overlays` (src/motion/ShapeMorph.tsx)

**Use when:** Moving from one idea to the next inside a motion ad without a cut: logo → app icon → screen card →
CTA pill. The default bridge between any two storyboard frames.
**Look:** One hero shape stays dead centre and changes geometry: size, corner radius, rotation, colour. When it
settles, its content (image, words) enters inside it; before the next morph the content leaves first.

## Timing
- Morph by spring (damping ~16, stiffness ~140): ~0.45 s to settle, a slight overshoot on size, none on radius or colour.
- Content enters ~6 frames after settle (fade 8 frames; text via `word-slide-up`), leaves 4 frames before the next morph.
- Hold each state 1–2.5 s; the camera push (6% over the piece) and the colour glow keep it moving while held.

## Build
- `ShapeMorph` props: `states[]` = `{ at, w, h, radius, rotate, fill, image, words[] }` (w and h as fractions of frame
  width, radius 0–0.5 of the short side), `bg`, `glow`, `push`, `damping`, `contentDelay`.
- Circle = w=h, radius 0.5. App icon = radius ~0.22. Card = radius ~0.06. Pill = radius 0.5 with w ≫ h.
- Text in a short shape ≈ 40% of its height (built in).

## Traps
- Two layouts visible at once reads as a dissolve: the old content must be gone before the new shape grows.
- Overshoot on radius looks like a wobble; keep radius and colour clamped.
- Very large size jumps (dot → full card) in one morph look like a cut; add a middle state.
