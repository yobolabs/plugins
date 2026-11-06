# Effect: Word Captions

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-Det_44sBsPY-20-effects.md` (0–59.5 s, one word) and `breakdown-ig-De8SPjEAuV0-claude-edited.md` (whole video, 2–3 word phrases).

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
- Remotion: extend the house caption component `remotion-overlays/src/ad/Caption.tsx`. It renders a dark pill today (`background rgba(26,26,26,0.65)`); add a `variant: "pill" | "shadow"` prop and default new work to `"shadow"`.
- Shadow variant: `color #FFFFFF`, `fontWeight 800`, `textShadow: 0 4px 12px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.8)`, no background.
- Single mode: font size 7–8% of height (≈140 px at 1920), y centre ≈ 63%.
- Phrase mode: font size ≈ 3.2% of height (≈62 px), y centre ≈ 61%, max width 82%.
- Active word: wrap in `<span style={{ color: brand.accent }}>`; other words white.
- Props: `words: { text, start, end }[]`, `mode`, `brand` (font, accent).

## Inputs
- Whisper word timestamps (SKILL.md § Inputs). Use word-level output, not segment-level.
- Brand font and accent colour from props.

## Traps
- A coloured box behind the text looks heavier and cheaper than plain shadow text. Default to shadow; use the pill only when the background is too busy to read.
- Whisper mishears product and brand names. Fix the word list against the script before render.
- Keep captions out of the top 12% and bottom 18% (platform UI covers them).
- When an effect puts large text in the same band (magazine cover, text behind subject), move captions to y ≈ 72% or hide them for that span.
- Use the same y position all video long; a jumping caption reads as a glitch.
