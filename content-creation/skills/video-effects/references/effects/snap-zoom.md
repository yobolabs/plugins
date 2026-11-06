# Effect: Snap Zoom

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-Det_44sBsPY-20-effects.md` (8.33–10.60 s, steps at 9.57 and 10.37).

**Look:** Hard punch-ins on the face with no easing. Each step jumps one size closer. Two or three steps on stressed words.
**Use when:** Emphasis, a punchline, or rhythm on a list of words.

## Layers (bottom → top)
1. Plate, scaled and cropped (the only change).
2. Captions + chapter label at their normal size (not zoomed).

## Timing
- Step 1 on the trigger word: scale 1.0 → 1.35 in 0 frames (hard cut).
- Step 2 on the next stressed word (~1.2 s later): 1.35 → 1.7.
- Optional step 3: 1.7 → 2.0. Hard cut back to 1.0 when the next effect starts.
- Optional 2-frame shake on each step: translate ±12 px, then 0.

## Build
- Remotion: not needed.
- FFmpeg per step (face centre FX, FY in source pixels):
  `crop=w=iw/1.35:h=ih/1.35:x=FX-iw/1.35/2:y=FY-ih/1.35/2,scale=1080:1920:flags=lanczos`
- Or one pass with steps on time: `scale=2160:3840,crop=w='2160/if(lt(t,T1),1,if(lt(t,T2),1.35,1.7))':h='3840/if(lt(t,T1),1,if(lt(t,T2),1.35,1.7))':x=...:y=...,scale=1080:1920`. (Upscale first so `crop` gets integer-friendly sizes.)

## Inputs
- Matte: no (its head bbox is a handy face-centre source). Word times: yes (one per step).
- Source at least 1080x1920, sharp focus; 4K source gives a clean 2.0x.

## Traps
- Clamp crop x/y inside the frame, or FFmpeg fails or shows black edges.
- Zoom on the point between the eyes, not the frame centre, or the face drifts off-axis.
- More than 3 steps in 2 s reads as a glitch.
- Do not zoom the caption layer; render captions after the zoom.
