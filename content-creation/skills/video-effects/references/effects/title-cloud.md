# Effect: Title Cloud

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-Det_44sBsPY-20-effects.md` (0.00–3.25 s).

**Look:** A big two-line title pill sits at the top. Small dark tags fly in down both sides, one per item in a list. On a trigger word a group of tags turns brand.primary. Then the title shrinks and slides up into a small header that stays for the rest of the video.
**Use when:** The hook announces a list ("N ways", "N tools") and the whole list should be visible in the first 3 s.

## Layers (bottom → top)
1. Plate (talking head, untouched).
2. Tag columns: left x 2–20%, right x 80–98%, from y ~12% down to ~30%. Tag height ~1.3% (25 px), text 14 px, brand.ink @ 85% pill, white text.
3. Title pill: brand.surface fill, brand.ink bold text, 2 lines, line height ~6.5% of width (~70 px), y 3–6%. Optional small icon above it.
4. Captions (SKILL.md § Layer stack).

## Timing
- Title in at frame 0, hard cut.
- Tags: one every 2 frames. Each slides 24 px in from its outer edge and fades 0 → 1 over 6 frames, `Easing.out(Easing.cubic)`. Right column starts 4 frames after left.
- Highlight: on the trigger word, the chosen tags switch fill to brand.primary in one frame (no fade).
- Collapse at the end of the hook (~frame 90): title scale 1 → 0.45 and moves to the header slot over 8 frames, `spring({damping: 200})`. Tags fade out over the same 6–8 frames.

## Build
- Remotion: `TitleCloud`, props `{ brand, titleLines: string[], icon?: url, tags: string[], highlight: number[], highlightAtFrame: number, collapseAtFrame: number }`.
- Tag i: `x = interpolate(frame - i*2, [0, 6], [side*24, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})`.
- Transparent ProRes 4444. The collapsed header continues in [chapter-label.md](chapter-label.md).

## Inputs
- Matte: no. Word times: yes (trigger word for the highlight, end of hook for the collapse).
- Tag list = the video's own item names.

## Traps
- More than ~12 tags per side reaches the face. Cap at 12 per column.
- Tags at 14 px are texture, not reading. Never put meaning only in them.
- The collapse must land exactly on the persistent header's position, or the header jumps one frame later. Share one position constant between both components.
