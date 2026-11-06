# Effect: Grade Panel

Back to [SKILL.md](../../SKILL.md).

- **status:** stub (not proven in a run)
- **seen in:** `_context/yobolabs/video-breakdowns/instagram-De8SPjEAuV0-claude-edited.md` (51.5–58.7 s) — evidence only, never rules
- **tools:** `content-creation:remotion-overlays`, FFmpeg

**Look:** The picture goes moody: highlights down, blacks lifted, saturation −15%, soft vignette. A dark panel at the top shows a tone curve and sliders (Highlights, Blacks, Saturation, Vignette); each value moves on the word that names it, and the grade steps in with it.
**Use when:** Explaining how a look is made, or a mood change ("now it gets serious").
**Prompt shape:** `Make it moody. Show a grade panel with a tone curve and sliders; move each value when I say it: highlights <−35>, blacks <+12>, saturation <−15>, vignette <−40>.`

## Layers (bottom → top)
1. Graded plate, built as 4 cumulative stages (curve → +blacks → +saturation → +vignette).
2. Grade panel card.
3. Captions.

## Timing
- Panel pops in (scale 0.9 → 1, fade, 6 frames) on the first trigger word; all values at 0, curve straight.
- Each slider animates 0 → target over 10 frames, `Easing.out(Easing.cubic)`, starting on its word ("highlights", "blacks", "saturation", "vignette"). The matching grade stage crossfades in over the same 10 frames.
- Hold 1 s after the last value; panel fades out over 6 frames, grade stays.

## Build
- FFmpeg, one file per stage (stage 4 = full look):
  1. `curves=all='0/0 0.5/0.45 1/0.82'`
  2. `curves=all='0/0.05 0.5/0.45 1/0.82'`
  3. `curves=all='0/0.05 0.5/0.45 1/0.82',eq=saturation=0.85`
  4. `curves=all='0/0.05 0.5/0.45 1/0.82',eq=saturation=0.85,vignette=angle=PI/5`
- Remotion: `GradePanel`. Props: `controls: { label, target, word frame }[]`, `curvePoints`, `stageSrcs[]`.
- Panel: x 8–92% of width, top y ≈ 5%, height ≈ 11%, `rgba(20,20,22,0.9)`, radius 16 px. Left 40%: "TONE CURVE" label + SVG grid with the curve path (interpolate the highlight point from 1.0 → 0.82 and black point 0 → 0.05). Right 60%: "BASIC" rows Highlights / Blacks / Saturation, "EFFECTS" row Vignette; each row = label, 2 px track, 10 px white knob, signed value.
- Value text: `Math.round(interpolate(...))` with sign (`−35`, `+12`).

## Inputs
- Plate, word timestamps for each control name (SKILL.md § Inputs).

## Traps
- Panel values and the real FFmpeg values must match the story. Do not show −35 and apply nothing.
- Lifting blacks too far (> 0.08) turns the image grey and flat.
- Vignette on a dark room can crush the face; check skin stays above ~25% luma.
- Keep the panel above the head; a panel over the face hides the change it explains.
