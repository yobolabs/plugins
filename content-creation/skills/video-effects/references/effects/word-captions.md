# Effect: Word Captions

Back to [SKILL.md](../../SKILL.md).

- **status:** proven 2026-11-07 (local talking-head test clip, Remotion + FFmpeg) — proof strip `_context/yobolabs/video-breakdowns/proof/word-captions-strip.png`
- **seen in:** `_context/yobolabs/video-breakdowns/instagram-Det_44sBsPY-20-effects.md` (0–59.5 s, one word) and `_context/yobolabs/video-breakdowns/instagram-De8SPjEAuV0-claude-edited.md` (whole video, 2–3 word phrases) — evidence only, never rules
- **tools:** `content-creation:remotion-overlays` (src/effects/WordCaptions.tsx)

**Look:** Spoken words appear on screen in sync with the voice. Two modes: **single** shows one big word at a time; **phrase** shows 2–3 words, with the word being spoken in the accent colour. White bold sans, soft black shadow, **no box**.
**Use when:** Always-on layer for any talking-head video; sound-off viewers read along.
**Prompt shape:** `Caption every word, <single|phrase> mode, white bold with shadow, no box, active word in <accent colour>.`

## Layers (bottom → top)
1. Plate and all effect layers (see SKILL.md § Layer stack).
2. Captions — always the top layer, above every overlay.

## Timing
- Each word shows from its Whisper `start` to the next word's `start` (no gaps; hold the last word of a line to its `end` + 6 frames).
- Phrase mode: group 2–3 words; break a group at punctuation or a pause > 0.35 s. The group holds for its whole span.
- Active-word highlight switches on the word's `start` frame, hard cut, no fade.
- Optional pop-in: scale 0.85 → 1.0 over 4 frames, `spring({ damping: 200 })`. Never fade.

## Build
- Remotion: `remotion-overlays/src/effects/WordCaptions.tsx` (`variant: "shadow" | "pill"`, default `"shadow"`; the pill matches the house `src/ad/Caption.tsx` look). `groupWords()` does the grouping and hold rules below.
- Shadow variant: `color #FFFFFF`, `fontWeight 800`, `textShadow: 0 4px 12px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.8)`, no background.
- Single mode: font size 7–8% of height (≈140 px at 1920), y centre ≈ 63%.
- Phrase mode: font size ≈ 3.2% of height (≈62 px), y centre ≈ 61%, max width 82%.
- Active word: wrap in `<span style={{ color: brand.accent }}>`; other words white.
- Props: `words: { text, start, end }[]`, `mode`, `brand` (font, accent), optional `y` (0–1), `maxWords`, `pauseBreak`, `popIn`.
- Word list from Whisper JSON: flatten `segments[].words[]`, `text = word.strip()` (Whisper prefixes a space).

## Inputs
- Whisper word timestamps (SKILL.md § Inputs). Use word-level output, not segment-level.
- Brand font and accent colour from props.

## Traps
- When an effect has its own text band (cover lines, ticker strips, a card), move the caption band clear of it or hide captions for that effect.
- A coloured box behind the text looks heavier and cheaper than plain shadow text. Default to shadow; use the pill only when the background is too busy to read.
- Whisper mishears product and brand names. Fix the word list against the script before render.
- Keep captions out of the top 12% and bottom 18% (platform UI covers them).
- When an effect puts large text in the same band (magazine cover, text behind subject), move captions to y ≈ 72% or hide them for that span.
- Use the same y position all video long; a jumping caption reads as a glitch.
- Whisper can drop a clipped first word or two at the very start of a cut ("It's a free" came back as "free"); check the opening words against the script.
- A word may hold to the next word's start only inside a line; across a pause > 0.35 s, end it at `end + 6 frames` or the caption sits on screen through silence.
