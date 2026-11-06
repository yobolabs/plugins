# Effect: Effect Tally

Back to [SKILL.md](../../SKILL.md).

- **status:** stub (not proven in a run)
- **seen in:** `_context/yobolabs/video-breakdowns/instagram-Det_44sBsPY-20-effects.md` (39.7–41.0 s) — evidence only, never rules
- **tools:** `content-creation:remotion-overlays`

**Look:** A full-screen dark card with a big counter ("0 / <total> <items>.") and two columns listing every item the video covered. Ticks fill one by one and the counter climbs to the total.
**Use when:** Closing a list video: "that's all <n> of them", recap before the CTA.

## Layers (bottom → top)
1. Card background: `ink` with a soft `brand.accent` glow at the bottom (radial, 30% opacity).
2. Counter: number in `brand.primary`, bold, 9% of frame height, at (6%, 14%); after it "/ <total> <items>." white bold 2.5%; subline "<tagline>" white 2.2% below.
3. List: two columns at x 6% and 52%, from y 22%, row height 2.6%. Each row = checkbox (1.8% square, grey outline) + item name (grey 60% white, 2% height).
4. Captions.

## Timing
- Card hard cuts in on the trigger word, counter at 0, all boxes empty.
- Ticks fill in list order, one every 1–2 frames, starting frame 6. Each tick: box fills `brand.primary` and a white check draws over 3 frames; the item text turns full white.
- Counter = number of ticked rows, updated per frame (no tweening of the digit).
- Hold the full card 6–10 frames after the last tick. Hard cut out. Total 38–45 frames.

## Build
- Remotion: `<EffectTally items={[...]} total tagline startFrame={6} perItem={1.25}>`; `ticked = Math.floor(clamp((frame - 6) / perItem, 0, items.length))`.

## Inputs
- Person matte: no. Word times: yes (trigger only). Item list: the real list of beats in the video, in order.

## Traps
- List longer than 24 items does not fit two columns at a readable size. Use three columns or show only the last 12.
- A tick rate faster than 1 per frame cannot be seen. If the list is long, extend the effect instead.
- Item names must match the on-screen labels used earlier, word for word.
