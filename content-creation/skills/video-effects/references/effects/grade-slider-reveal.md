# Effect: Grade Slider Reveal

Back to [SKILL.md](../../SKILL.md).

- **status:** proven 2026-11-07 (local talking-head test clip, Remotion + FFmpeg) — proof strip `_context/yobolabs/video-breakdowns/proof/grade-slider-reveal-strip.png`
- **seen in:** `_context/yobolabs/video-breakdowns/instagram-De8SPjEAuV0-claude-edited.md` (26.8–31.5 s) — evidence only, never rules
- **tools:** `content-creation:remotion-overlays` (src/effects/GradeSliderReveal.tsx), FFmpeg

**Look:** The picture warms up. Then a vertical white line with a round ◂▸ handle sweeps across: one side shows the warm grade, the other the original. Before/after in one shot.
**Use when:** Showing a change or improvement: "before vs after", a colour look, a product making things better.
**Prompt shape:** `Warm the whole video, then on the word "<word>" sweep a before/after slider <left→right> to show the original.`

## Layers (bottom → top)
1. Original plate (ungraded).
2. Graded plate, clipped to one side of the line.
3. Wipe line + handle.
4. Tool label chip (optional), then captions.

## Timing
- Warm-up: graded plate fades 0 → 1 over 15 frames on the trigger word.
- Slider enters 10 frames later at x = 100% and sweeps to x = 50% over 24 frames, `Easing.inOut(Easing.cubic)`; hold 10 frames; optional sweep to 20% and back.
- Line and handle fade out over 6 frames; the warm grade stays on. Total 2–4 s.

## Build
- FFmpeg (warm grade, render a second plate; filter works as written):
  `ffmpeg -i plate.mp4 -vf "colorbalance=rs=0.08:gs=0.02:bs=-0.08:rm=0.06:bm=-0.06:rh=0.04:bh=-0.04,eq=saturation=1.12:gamma=1.02" -c:v libx264 -crf 16 -pix_fmt yuv420p -an graded.mp4`
- Remotion: `GradeSliderReveal`. Props: `originalSrc`, `gradedSrc`, `startFrame`, `path` (`{ frame, x }[]`, frame relative to slider entry, x 0–1), `handleY`. Default path: 1 → 0.5 (24 f) → hold 10 f → 0.2 → back to 1, then the line fades, so the warm grade fills the frame at the end instead of leaving a half/half split.
- Clip: graded layer `clipPath: inset(0 ${100 - x*100}% 0 0)` (graded on the left of the line).
- Line: 4 px wide, full height, `#FFFFFF`, shadow `0 0 12px rgba(0,0,0,0.5)`.
- Handle: circle 9% of width at y = 50%, white fill, two dark chevrons ◂▸, shadow `0 6px 18px rgba(0,0,0,0.35)`.
- Both video layers must be frame-locked (`<OffthreadVideo>` with the same `startFrom`).

## Inputs
- Plate; graded copy from the FFmpeg filter above.
- Trigger word time.

## Traps
- A warm grade that pushes skin orange looks fake; keep `rs` ≤ 0.10 and check skin on the before/after split.
- If the two layers drift by one frame, the line shows a doubled edge. Render both from the same source time code.
- Do not put the handle on the face; start the sweep from the side away from the head. In a seated talking head, `handleY` 0.5 lands on the chin when x = 0.5; set `handleY` ≈ 0.6–0.65 for those plates.
- On a dark, low-key plate the `bs=-0.08` shadow shift crushes blue to near zero, so grey walls turn olive-yellow rather than golden. Read the split on the wall, not only the skin. If it reads olive, try a smaller `bs` (untested).
