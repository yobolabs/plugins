# Effect: Reel Wall

Back to [SKILL.md](../../SKILL.md).

- **status:** stub (not proven in a run)
- **seen in:** `_context/yobolabs/video-breakdowns/instagram-De8SPjEAuV0-claude-edited.md` (60.4–62.8 s) — evidence only, never rules
- **tools:** `content-creation:remotion-overlays`, FFmpeg

**Look:** The main shot shrinks into the centre tile of a 3×3 grid. The other 8 tiles pop in around it, one per frame: other reels, or the same shot in different looks (B/W, warm, false colour, desaturated).
**Use when:** "Everyone is doing this", "many versions", "one video, many outputs", social proof.
**Prompt shape:** `Shrink my shot into the centre tile of a 3×3 grid, then pop <8 reels | 8 looks of my shot> in around it, one per frame.`

## Layers (bottom → top)
1. Background: black `#0B0B0C` (or blurred plate at 30% brightness).
2. 8 outer tiles.
3. Centre tile = live plate.
4. Prompt bar (optional), captions.

## Timing
- Shrink: on the trigger word, plate scales 1.0 → 0.32 into the centre tile over 10 frames, `Easing.out(Easing.cubic)`.
- Pop: tiles 1–8 appear **one per frame** starting the frame after the shrink lands; each tile scales 0.6 → 1.0 over 4 frames. Order: clockwise from top-left, or random fixed seed.
- Hold 1–1.5 s; out by hard cut, or reverse the shrink (centre tile → full frame, 8 frames).

## Build
- Remotion: `ReelWall`. Props: `tiles: string[8]` (video or image paths), `gap` (12 px), `startFrame`, `popOrder`.
- Grid: 3 columns, 3 rows; tile width ≈ 31.5% of width, tile aspect 9:16, so grid height ≈ 3 × 31.5% × 1080 × 16/9 ≈ 1814 px; centre it vertically. Radius 14 px per tile.
- Centre tile: `<OffthreadVideo>` of the plate with `transform: scale(s)`.
- Outer tiles: `<OffthreadVideo muted>` each from a different start time, or stills.
- Same-shot looks, FFmpeg per tile: B/W `hue=s=0`; warm `colorbalance=rs=0.1:bs=-0.1`; false colour `pseudocolor=preset=turbo`; desat `eq=saturation=0.4`; high contrast `eq=contrast=1.4`; invert `negate`; cool `colorbalance=bs=0.12:rs=-0.06`; sepia `colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131`.

## Inputs
- Plate; 8 tile sources. Downloaded reels need rights to reuse; same-shot looks need nothing extra.

## Traps
- Other people's reels: use only with permission or the merchant's own content. Same-shot looks are the safe default.
- Mute every outer tile; only the main audio plays.
- At 31% scale, captions on the centre tile are unreadable; keep the main caption layer full-size on top.
- Popping slower than 1 tile per 2 frames loses the "burst" feel.

**See also:** no-footage version (tilted wall of cards, camera dolly) → `content-creation:motion-graphics` → `references/moves/card-wall-dolly.md`.
