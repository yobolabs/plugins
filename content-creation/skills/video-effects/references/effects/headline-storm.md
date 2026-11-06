# Effect: Headline Storm

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-Det_44sBsPY-20-effects.md` (12.50–14.50 s).

**Look:** Tilted news-ticker strips slam onto the frame one after another, stacking and overlapping. Each strip is a white text bar with a small brand.primary tag at its left end (a "breaking news" style <tag>). After 2 s, 6–8 strips cover the upper and lower thirds; the face stays mostly clear.
**Use when:** Hype, "everyone is talking about it", or a news-style claim.

## Layers (bottom → top)
1. Plate.
2. Strips, one element each: height ~2.6% (50 px), width 70–110% of the frame (running off the edges), rotation between -6° and +4°. brand.surface fill, brand.ink condensed bold caps 28 px. Tag: brand.primary box, white 12 px caps.
3. Captions.

## Timing
- One new strip every 5 frames (6 per second).
- Each strip slides in from off-screen along its own angle, 200 px → 0 over 4 frames, `Easing.out(Easing.exp)`. No fade.
- Later strips draw on top of earlier ones.
- Out: all strips cut at once.

## Build
- Remotion: `HeadlineStorm`, props `{ brand, everyFrames: 5, strips: {tag: string, text: string, y: number, rotDeg: number, from: 'left'|'right'}[] }`.
- Strip i appears at `i * everyFrames`; `x = interpolate(frame - i*everyFrames, [0, 4], [dir*200, 0], {easing: Easing.out(Easing.exp), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})`.
- Put strips in y bands 9–30% and 55–78%. Leave 30–55% (the face) clear.
- Optional ticker feel: text `translateX` -2 px per frame.

## Inputs
- Matte: optional (put 1–2 strips behind the head for depth). Word times: yes (start).
- 6–8 headline lines, each ≤ 5 words, about the video's own claim.

## Traps
- Strips over the face kill the talking head. Keep the 30–55% band clear.
- The same rotation on every strip reads as a pattern, not a storm. Alternate the sign.
- Text runs off-frame on purpose, but the first 3 words must land inside it.
