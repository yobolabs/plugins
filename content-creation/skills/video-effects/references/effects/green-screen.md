# Effect: Green Screen

Back to [SKILL.md](../../SKILL.md).

- **status:** stub (not proven in a run)
- **seen in:** `_context/yobolabs/video-breakdowns/instagram-Det_44sBsPY-20-effects.md` (33.3–35.3 s) — evidence only, never rules
- **tools:** `content-creation:remotion-overlays`, FFmpeg, person matte (SKILL.md § 2)

**Look:** The room behind the person turns flat chroma green, as if shot on a green screen. A beat later the green is swapped for a new scene (for example a city skyline at dusk).
**Use when:** "Put yourself anywhere", location changes, or a joke about a fake set.

## Layers (bottom → top)
1. Phase 1: flat green `#00B140`, full frame. Phase 2: `<background>` scene.
2. Person matte.
3. Overlays and captions.

## Timing
- Phase 1 starts hard on the trigger word, lasts 18–30 frames.
- Phase 2 starts hard on the next stressed word, lasts until the effect ends (total 55–60 frames).
- No transitions inside the effect. Optional: a 2-frame white flash (opacity 0.6 → 0) at the swap.

## Build
- Remotion: `<GreenScreen matte swapFrame background={<SkylineScene/> | image}>`. A drawn scene can be SVG: sky gradient `brand.accent` → `brand.primary` top to bottom, black building silhouettes in the lower 55%, small lit windows in `brand.primary`.
- FFmpeg (phase 1 only): `color=c=0x00B140:s=1080x1920:r=30[g];[g][person]overlay=format=auto`

## Inputs
- Person matte: yes (this is NOT a chroma key; the green is fake). Word times: yes. Background: drawn SVG or a licensed still.

## Traps
- The scene's light does not match the person (warm face on a cold night). Fix: grade the person slightly toward the scene (`colorbalance` or `eq=gamma`) for phase 2 only.
- Horizon at the wrong height makes the person look tiny or floating. Keep the skyline top at 35–45% of frame height, behind the shoulders.
- Do not use a stock image with a visible brand or landmark watermark.
