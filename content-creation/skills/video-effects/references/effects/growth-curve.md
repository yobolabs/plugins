# Effect: Growth Curve

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-Det_44sBsPY-20-effects.md` (16.60–18.90 s).

**Look:** The background is replaced by a dark navy grid. A brand.primary line chart climbs from bottom left to top right behind the speaker, with a filled area under it. A brand.primary badge top right counts up (1× → 4× → 10×). A small "SAMPLE DATA" tag sits top left.
**Use when:** Any growth, results or "this scales" claim.

## Layers (bottom → top)
1. Background: navy (#0b1630 or brand.bgDark) with a grid, cells ~7% of width, lines white @ 8%.
2. Chart: line 6 px brand.primary with glow (drop-shadow 0 0 12px brand.primary); area fill below the line, vertical gradient blue @ 60% → 0%. Dot at the line head (white, 14 px).
3. Person matte.
4. Badge top right (x 80–96%, y ~10%): brand.primary box, white bold number 40 px + small caps label "<GROWTH>". Tag top left: white @ 60%, 12 px caps, red dot.
5. Captions.

## Timing
- Frame 0: bg + grid swap in with a hard cut.
- Line draws frames 0–45: SVG `stroke-dashoffset` from path length → 0, `Easing.in(Easing.quad)` so it accelerates (an exponential look).
- Badge value steps with the line: 1× at frame 0, 4× at ~20, 10× at ~40; each step pops scale 1.2 → 1 over 5 frames.
- Hold to the end. Out: hard cut.

## Build
- Remotion: `GrowthCurve`, props `{ brand, points: [x, y][] (fractions), badgeSteps: {value: string, atFrame: number}[], label: string, sampleTag: string, drawFrames: 45 }`.
- Path: exponential-ish points from (0, 0.75) to (0.98, 0.10). Draw with `strokeDasharray = L`, `strokeDashoffset = interpolate(frame, [0, drawFrames], [L, 0])`.
- The area fill uses the same path closed to the bottom, revealed with a clip rect whose width follows the line head.
- Composite: chart render → matte → badge render.

## Inputs
- Matte: yes (person over the chart). Word times: yes (start, optional per badge step).
- Numbers: label them as sample data unless they are the business's real, provable figures.

## Traps
- Showing invented numbers as real results is a false claim. Keep the "sample data" tag or use the merchant's real data.
- Line through the face is lost behind the matte. Route it low left, rising up the right side.
- Matte edge flicker is very visible on the flat navy bg. Temporal-smooth the matte (median over 3 frames).
