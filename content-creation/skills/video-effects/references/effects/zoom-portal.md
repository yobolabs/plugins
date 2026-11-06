# Effect: Zoom Portal

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-Det_44sBsPY-20-effects.md` (14.50–16.60 s).

**Look:** A small circle with a brand.primary ring appears at one side and shows a live mini copy of the speaker. The camera then zooms toward the circle with a blur, as if diving through a portal, and lands back on the normal shot.
**Use when:** A transition into a new idea, "go deeper", or a picture-in-picture "here's me again" beat.

## Layers (bottom → top)
1. Plate (scaled toward the portal during the dive).
2. Portal: circle ~17% of width (180 px), centre at x ~10%, y ~45% of the frame (left edge, beside the head), brand.primary ring 6 px. Inside: the plate scaled to ~0.25, cropped to the circle.
3. Captions.

## Timing
- Frames 0–6: portal scales 0 → 1, `spring({damping: 12})`.
- Hold ~20 frames so the viewer reads it.
- Dive, frames ~26–40: plate scale 1 → 2.5 centred on the portal, `Easing.in(Easing.cubic)`; gaussian blur 0 → 12 px; portal scales with the plate.
- At the end of the dive, hard cut to the normal plate (scale 1, no blur). The landing reads as "through the portal".

## Build
- Remotion: `ZoomPortal`, props `{ brand, center: {x: 0.10, y: 0.45}, radius: 0.085, ringPx: 6, appearFrame: 0, diveFrom: 26, diveTo: 40 }`. Plate as `<OffthreadVideo>` twice: main layer and a clipped `borderRadius: '50%'` copy.
- Dive: `scale = interpolate(frame, [diveFrom, diveTo], [1, 2.5], {easing: Easing.in(Easing.cubic)})`, `transformOrigin` = portal centre; `filter: blur(${interpolate(frame, [diveFrom, diveTo], [0, 12])}px)`.
- FFmpeg alternative for the blur: `gblur=sigma=6` on the dive span only.

## Inputs
- Matte: no. Word times: yes (start; time the dive end to a word).

## Traps
- Place the portal on empty wall, not over the face or shoulders. Check the matte bbox.
- Without blur the zoom looks like a slow crop. Blur must peak on the last frame before the cut.
- Zoom origin must be the portal centre, or the circle slides out of frame during the dive.
