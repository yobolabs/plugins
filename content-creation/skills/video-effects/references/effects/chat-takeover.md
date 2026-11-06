# Effect: Chat Takeover

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-Det_44sBsPY-20-effects.md` (4.50–6.77 s).

**Look:** The video shrinks into a chat-app window on a dark glowing background. The user's prompt bubble sits top right with the live video as its attachment. The assistant answers with a short line, then tick rows appear one by one under it.
**Use when:** Showing that a task was "asked for" in an AI chat and then done.

## Layers (bottom → top)
1. Background: brand.bgDark, radial glow brand.primary @ 25% at the top, cool blue @ 20% at the bottom.
2. Chat card: 90% wide, y 22–58%, brand.surface, radius 24 px, shadow `0 30px 60px` black @ 50%.
3. Inside the card: title bar (app glyph + <assistant name>), prompt bubble (right side, ~60% of card width, light grey), live plate tile 9:16 (~30% of card width) under the bubble, reply bar at the bottom.
4. Assistant reply: typing dots → <reply line> → tick rows (brand.primary check circle + <step text>).
5. Captions.

## Timing
- Frames 0–8: the full plate scales 1 → 0.30 and moves into the tile slot, `Easing.inOut(Easing.cubic)`. Card fades 0 → 1 over the same frames.
- Typing dots frames 10–24. Reply line at 24. Tick rows every 10 frames from 34; each pops scale 0.6 → 1 over 6 frames.
- The last row may stay an empty circle until its word is spoken.
- Out: hard cut back to the full plate.

## Build
- Remotion: `ChatTakeover`, props `{ brand, assistantName, prompt, reply, steps: string[], stepFrames: number[], tileRect: {x, y, w, h} }`. Plate as `<OffthreadVideo>` inside the tile, or leave the tile transparent and composite in FFmpeg.
- FFmpeg tile: `[0:v]scale=324:576,setsar=1[tile];[card][tile]overlay=x=X:y=Y`.

## Inputs
- Matte: no. Word times: yes (start + one per step).
- A generic chat UI. Do not copy a real product's UI pixel for pixel.

## Traps
- Card text is 16–20 px. Keep the prompt under 12 words or it wraps to 4 lines.
- The plate tile must keep playing with lip sync; a frozen tile looks broken.
- The chapter label stays above the card (top layer).
