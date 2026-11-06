# Effect: Dolly Zoom

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-Det_44sBsPY-20-effects.md` (25.4–27.3 s).

**Look:** Vertigo shot. The person stays the same size and position while the room behind them slides away, as if the camera dollied in and zoomed out at once.
**Use when:** A reveal, a shock, a "wait, what?" beat. One per video at most.

## Layers (bottom → top)
1. Edge fill: the clean background plate scaled 1.3 and blurred (`gblur=sigma=30`), darkened 30%. Hides the gap when the background shrinks below 1.0.
2. Clean background plate (room with the person removed), animated scale.
3. Person matte at constant scale 1.0, unmoved.
4. Overlays and captions.

## Timing
- Starts on the trigger word. Total 55–60 frames.
- Background scale 1.15 → 0.85 over the whole clip, `Easing.inOut(Easing.cubic)`. Anchor the scale at the person's face centre, not the frame centre.
- Hard cut in and out.

## Build
- Remotion: `<DollyZoom plate bgPlate matte from={1.15} to={0.85} anchor={{x, y}}>`; `scale = interpolate(frame, [0, dur], [1.15, 0.85], {easing: Easing.inOut(Easing.cubic)})` on layer 2 only.
- Clean plate, once per take: inpaint one frame with the matte dilated 30 px, using a free local inpainting model (for example LaMa). The camera must be static.
- FFmpeg (dilate mask for inpainting): `alphaextract,gblur=sigma=10,lut=y='if(gt(val,16),255,0)'`

## Inputs
- Person matte: yes. Word times: yes. Clean background plate: yes (one inpainted still).

## Traps
- Ghost outline of the person on the background (inpaint did not cover the whole body). Fix: dilate the mask more, and check the inpainted frame by eye.
- Moving camera breaks the still plate. Only use on a locked-off shot.
- Shadows and lighting changes on the wall stay frozen in the plate. Keep the effect ≤ 2 s so it does not read as fake.
