# Move: Logo Build

Back to [SKILL.md](../../SKILL.md).

- **status:** stub
- **seen in:** `_context/yobolabs/video-breakdowns/youtube-cDb-wPq0Iyk-claude-motion-graphics.md` (2:09–2:11 marks draw into the logo; 2:26–2:29 dock icon zooms to centre, wordmark slides out from behind it) — evidence only, never rules
- **frame strip:** `_context/yobolabs/video-breakdowns/frames/cDb-wPq0Iyk-logo-build.jpg` (source)
- **tools:** Remotion SVG (stroke-dashoffset), the brand's own SVG

**Use when:** Opening or closing a motion ad on the brand mark.
**Look:** Variant A: the logo's strokes draw on, then fill. Variant B: the app icon lands centre (often zoomed out of a
phone dock), then slides left while the wordmark slides out from behind it; a small "Get it on the App Store" line
types under it.

## Timing
- Draw-on 12–18 frames per stroke, staggered 4; fill 8 frames after the last stroke.
- Variant B: icon settles, 6 frames, wordmark slides 12 frames from behind the icon (masked), CTA line 10 frames later.

## Build
- Use the brand's own SVG paths (stroke-dasharray = path length, animate dashoffset to 0). Never trace or redraw.
- Wordmark: masked container right of the icon; translateX −100% → 0.

## Traps
- A logo cropped from a screenshot is blurry at full frame; demand the source file (SKILL.md § 1).
