# Effect: Chapter Label

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-Det_44sBsPY-20-effects.md` (3.25–39.7 s, persistent).

**Look:** Under a small header, a brand.primary square with a two-digit number (01, 02…) sits beside a white pill with the item name. A thin segmented progress line under it fills one segment per item. Number and name swap with a hard cut on each new item.
**Use when:** A list video walks through N items and the viewer should always know which item it is and how many are left.

## Layers (bottom → top)
1. Plate + whatever effect is running.
2. Header pill (from [title-cloud.md](title-cloud.md)): y ~3%, height ~2.6% (50 px).
3. Chapter row at y ~6.3%: number box ~4.6% wide square (50 px), brand.primary fill, white bold digits. Name pill brand.surface, brand.ink bold 24 px, 8 px gap after the box.
4. Progress line at y ~8.3%: 70% of width, centred, 3 px tall, N segments with 4 px gaps. Done = brand.primary, to-do = white @ 30%.
5. Captions.

## Timing
- Starts on the first item word. Each swap on the first word of the next item name.
- Text swap: hard cut. The new progress segment fills left → right over 6 frames, linear.
- Optional pop on the number box: scale 1.15 → 1 over 5 frames, `spring({damping: 12})`.
- Hard cut out after the last item.

## Build
- Remotion: `ChapterLabel`, props `{ brand, headerLines: string[], items: {label: string, startFrame: number}[] }`.
- Current index = last item with `startFrame <= frame`. Number = `String(i + 1).padStart(2, '0')`.
- Render the whole span as ONE ProRes file, not one file per item, so positions never drift.

## Inputs
- Matte: no. Word times: yes (one start per item).
- Item labels from the script.

## Traps
- Effects that shrink the plate (chat window, editor, phone) must keep this row on top. It is never inside the shrunk frame.
- Name pill width changes per item. Anchor it left to the number box, not centred, or the row jitters.
- On white walls the white pill disappears. Add a shadow `0 2px 8px` black @ 25%.
