# Move: Word Slide-Up

Back to [SKILL.md](../../SKILL.md).

- **status:** proven 2026-11-10 (Remotion proof render, 1080x1920) — strip `_context/yobolabs/video-breakdowns/proof/mg-word-slide-up-strip.png`
- **seen in:** `_context/yobolabs/video-breakdowns/youtube-cDb-wPq0Iyk-claude-motion-graphics.md` (10:33–10:36 tagline, and every line of the puppet ad) — evidence only, never rules
- **frame strip:** `_context/yobolabs/video-breakdowns/frames/cDb-wPq0Iyk-word-slide-up.jpg` (source)
- **tools:** `content-creation:remotion-overlays` (src/motion/WordSlideUp.tsx; `WordStack` inside other moves)

**Use when:** Any headline, tagline or CTA in a motion ad. The premium default for text.
**Look:** Each word rises from behind an invisible line into place, one after another, left to right. No bounce, no
per-letter fade, no scale. An accent word takes the brand colour. Exit: the same words rise out upward in order.

## Timing
- One word: 10 frames, fast-out curve `bezier(0.16, 1, 0.3, 1)`. Next word starts 4 frames later.
- Exit: 8 frames per word, `Easing.in(cubic)`, stagger half the entry stagger.
- Hold the full line ≥ 1 s per 3 words.

## Build
- `WordSlideUp` props: `lines[] { text, accentWords[] }`, `startFrame`, `wordFrames`, `staggerFrames`, `exitFrame`,
  `fontSizeFrac`, `font`, `colors { text, accent, bg }`, `transparent`.
- Each word sits in an `overflow: hidden` span with a small bottom padding so descenders are not cut.
- Bold sans (700), letter-spacing −0.03em, centred.

## Traps
- Words not yet risen still take layout space, so a half-built line looks left-aligned; that is expected.
- Too many words per line (> 4 on vertical) wraps mid-entry; split into lines in the props.
