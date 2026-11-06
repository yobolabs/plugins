# Effect: Liquid Glass

Back to [SKILL.md](../../SKILL.md).

- **status:** stub (not proven in a run)
- **seen in:** `_context/yobolabs/video-breakdowns/instagram-Det_44sBsPY-20-effects.md` (29.4–30.8 s) — evidence only, never rules
- **tools:** `content-creation:remotion-overlays`, FFmpeg

**Look:** A clear glass blob slides across the frame. Under it the picture is magnified and bent, with a bright rim and a soft highlight, like a drop of water on the lens.
**Use when:** A smooth, premium beat; naming a design or "glass" feature; a soft transition between two lines.

## Layers (bottom → top)
1. Plate (full frame).
2. Lens: inside a circle ⌀ 35% width, the same plate again scaled 1.15 around the lens centre and offset −3% opposite the motion (refraction).
3. Rim: 2% wide inner ring, white at 35% opacity with a radial gradient; inner shadow rgba(0,0,0,.18) on the lower edge.
4. Highlight: white ellipse 30% × 12% of the lens size, upper-left, 50% opacity, 6 px blur.
5. Overlays and captions.

## Timing
- Starts on the trigger word. Total 36–42 frames.
- Lens centre x: −20% → 120% of width; y fixed near the face line (≈ 30%). `Easing.inOut(Easing.quad)`.
- Optional wobble: lens scaleX/scaleY = 1 ± 0.04 × sin(frame / 4), opposite phase, so it reads as liquid.

## Build
- Remotion: `<LiquidGlass plate diameter={0.35} path={[[-0.2,0.3],[1.2,0.3]]} magnify={1.15}>`. The lens draws a second `<OffthreadVideo>` of the plate inside `clip-path: circle()`, so this renders in the same composition as the plate, not as a transparent overlay.
- No FFmpeg step.

## Inputs
- Person matte: no. Word times: yes. Assets: none.

## Traps
- `backdrop-filter` does not see the plate in a transparent ProRes overlay render. Use the second-plate method above.
- The two plate copies drift out of sync. Fix: both use the same `startFrom`, and render with `--concurrency` that keeps frame-accurate seeking (OffthreadVideo, not `<Video>`).
- Lens too big hides the face for too long. Keep ⌀ ≤ 40% and the crossing ≤ 1.4 s.
