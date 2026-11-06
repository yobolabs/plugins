# Effect: Matte Reveal

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-De8SPjEAuV0-claude-edited.md` (8.0–9.9 s).

**Look:** The room vanishes and is replaced by a transparency checkerboard (the grey-and-white pattern editors use for "no background"). Only the cut-out person remains.
**Use when:** Explaining a cut-out, background removal or "text behind your head"; showing the raw matte before a background effect.

## Layers (bottom → top)
1. Checkerboard: squares 3.7% of width (40 px at 1080), `#CCCCCC` and `#FFFFFF`.
2. Person matte (plate × alpha), unchanged position and scale.
3. Captions (keep the normal shadow; it reads fine on the checkerboard).

## Timing
- Hard cut in on the trigger word (for example "cut … out"), hold 45–60 frames, hard cut out on the next phrase.
- Optional settle: person scale 1.0 → 0.92 over the first 10 frames, `Easing.out(Easing.cubic)`, to show the edges.

## Build
- Remotion: `<MatteReveal plate matte squarePx={40}>`; background CSS `repeating-conic-gradient(#ccc 0 25%, #fff 0 50%) 0 0 / 80px 80px`.
- FFmpeg alternative: `color=white:s=1080x1920[w];[w]geq=lum='if(eq(mod(floor(X/40)+floor(Y/40),2),0),204,255)':cb=128:cr=128[cb];[cb][person]overlay=format=auto`

## Inputs
- Person matte: yes. Word times: yes. Assets: none.

## Traps
- The matte is fully exposed here, so every error shows: desk, laptop or chair pieces glued to the body, holes in the hair. Fix: pick the cleanest 2 s of the take, and clip the matte to a box around the person (drop blobs not connected to the largest one).
- A low-light take gives a noisy edge. Feather the alpha 1 px (`gblur=sigma=1` on the alpha only).
- The checkerboard must not move or scale; only the person can.
