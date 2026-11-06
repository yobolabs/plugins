# Effect: Zoom Through Cut

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-Det_44sBsPY-20-effects.md` (30.8–33.3 s).

**Look:** A fast push-in with motion blur into the face, then a cut to the next line, which lands on a slightly tighter or shifted framing and settles back.
**Use when:** Joining two takes or two lines with energy; hiding a jump cut.

## Layers (bottom → top)
1. Outgoing plate (take A), then incoming plate (take B), hard cut between them.
2. Overlays and captions (they do not zoom).

## Timing
- The cut sits on the first word of the new line (take B start).
- Take A: last 6 frames scale 1.0 → 1.6, `Easing.in(Easing.cubic)`, blur 0 → 12 px.
- Take B: first 8 frames scale 1.6 → 1.08, `Easing.out(Easing.cubic)`, blur 12 → 0 px. Hold at 1.08 (the "slightly different framing") until the next cut.
- Zoom anchor: between the eyes, from the face box.

## Build
- Remotion: `<ZoomThroughCut a b cutFrame anchor peakScale={1.6} landScale={1.08}>`; CSS `transform: scale()` + `filter: blur()`, both from `interpolate`.
- FFmpeg (optional extra smear on the render): `tmix=frames=3:weights='1 2 1'` applied only to the 14 frames around the cut.

## Inputs
- Person matte: no. Word times: yes (cut point). Face box: yes, from the matte bounding box or a face detector.

## Traps
- Scaling 1.6 on 1080p looks soft. It is hidden by the blur; do not hold above 1.2 without blur.
- Anchor on frame centre pushes into the chest. Always anchor on the face.
- Both takes must match in grade and light, or the cut reads as a mistake.
