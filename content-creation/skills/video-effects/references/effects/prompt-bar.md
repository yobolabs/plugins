# Effect: Prompt Bar

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-De8SPjEAuV0-claude-edited.md` (24.6–26.8, 35.0–37.0, 45.5–48.0, 60.4–62.8 s; chat bubbles ~23.0, ~50.0 s) and `breakdown-ig-Det_44sBsPY-20-effects.md` (comment bar 52.6–56.0 s).

**Look:** Three variants of "text being typed".
- **Prompt bar:** dark rounded bar near the top; text types letter by letter; round send button on the right.
- **Sent bubble:** a chat bubble with the message and a small "SENT" tag.
- **Comment bar (CTA):** "Add a comment…" placeholder, then a keyword types in and the button turns to "SENT".
**Use when:** Showing the exact instruction that made the next effect, or showing the viewer the CTA action (comment a keyword).
**Prompt shape:** `Show a prompt bar typing "<prompt>" at the top, then run the effect it describes.` / `End with a comment bar typing "<KEYWORD>" and a SENT tag.`

## Layers (bottom → top)
1. Plate and any running effect.
2. Bar or bubble.
3. Captions.

## Timing
- Bar slides down 3% + fades in over 6 frames on the trigger word.
- Typing: 1 character per frame for short prompts (< 30 chars); fit long prompts to 1.5–2.5 s (`chars / frames`). Caret blinks every 15 frames.
- Send: button scales 1.0 → 0.85 → 1.0 over 6 frames, 4 frames after the last character. Hold 0.5–1 s, then fade out over 6 frames or the effect starts.
- Comment bar: placeholder visible 10 frames, keyword types at 2 frames per letter, "SENT" swaps in on send.

## Build
- Remotion: `PromptBar` with `variant: "prompt" | "bubble" | "comment"`, `text`, `startFrame`, `typeFrames`, `brand`.
- Visible text: `text.slice(0, Math.floor(interpolate(frame, [start, start+typeFrames], [0, text.length], { extrapolateRight: "clamp" })))`.
- Bar: x 6–94% of width, top y ≈ 3.5%, min height 5% of height, radius 24 px, `rgba(28,28,30,0.88)` + `backdrop-filter: blur(12px)`, text `#F5F5F5` 2.2% height, wraps to 3 lines max.
- Send button: circle 4.4% of width, `brand.accent` fill, white ↑ arrow.
- Bubble: right-aligned, max 70% width, radius 20 px, `brand.accent` fill, white text; "SENT" 1.2% height under it.

## Inputs
- Prompt or keyword copy; trigger word time from Whisper.

## Traps
- Long prompts typed at 1 char/frame run 3+ s and stall the video; speed typing to fit 2.5 s max.
- Do not leave the bar on top of a face or the masthead of another effect; push it to y ≈ 3.5% and keep it ≤ 3 lines.
- Keep wording identical to what the voice says or what the next effect does; a mismatch reads as fake.
