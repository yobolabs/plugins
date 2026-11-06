# Effect: Recursive Zoom

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-De8SPjEAuV0-claude-edited.md` (43.7–48.2 s).

**Look:** The shot shrinks into a framed picture of itself, which holds a smaller picture of itself, N levels deep (Droste). Then the camera pushes through the frames with a spin and motion blur and lands back on full frame.
**Use when:** A transition that says "deeper" or "inside": going from a summary into detail, or a self-referential "this video" beat.
**Prompt shape:** `On the word "<word>", shrink the shot into a picture of itself, <N> levels deep, then push through it with a spin and blur.`

## Layers (bottom → top)
1. Background: the same plate, blurred `blur(30px)` and darkened 40%.
2. Level 1 … N: the same live plate, each scaled by `k^i` (k ≈ 0.62), centred, white 6 px border, radius 18 px, drop shadow.
3. Captions (hide during the push-through).

## Timing
- Shrink: frames 0–12 after the trigger word, scale 1.0 → 0.62, `Easing.inOut(Easing.cubic)`; inner levels appear together.
- Hold 6–10 frames.
- Push through: 14 frames, scale 1.0 → `1/k^N` on the whole stack, rotate 0 → 90° (or 180°), directional blur peaking mid-move.
- Land: hard cut to the clean plate at 1.0 scale. Total ≈ 1.2–1.6 s.

## Build
- Remotion: `RecursiveZoom`. Props: `levels` (default 3), `ratio` (0.62), `spinDeg` (90), `startFrame`.
- Render levels as nested `<OffthreadVideo>` (or the same frame image) with `transform: scale(ratio ** i)`; all play the same time code.
- Push: wrap the stack in one div, `transform: scale(${s}) rotate(${r}deg)`, `s = interpolate(f, [a, b], [1, ratio ** -levels], { easing: Easing.in(Easing.exp) })`.
- Blur: `filter: blur(${interpolate(f, [a, mid, b], [0, 14, 0])}px)`; Remotion has no directional blur, so add 3 ghost copies at −2°, −4°, −6° rotation with opacity 0.3/0.2/0.1.
- FFmpeg alternative for blur: `tblend=all_mode=average,framestep=1` on the push segment.

## Inputs
- Plate only. No matte needed.

## Traps
- More than 4 levels: inner frames go below 60 px and read as noise. Use 3.
- Spin above 180° in 14 frames makes viewers dizzy; 90° is enough.
- It can look like too much. Use at most once per video, and prefer a whip pan for ordinary transitions (see `whip-pan.md`).
- All levels must show the same frame; a level running behind looks broken.
