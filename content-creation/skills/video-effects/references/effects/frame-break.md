# Effect: Frame Break

Back to [SKILL.md](../../SKILL.md).

- **status:** stub (not proven in a run)
- **seen in:** `_context/yobolabs/video-breakdowns/instagram-Det_44sBsPY-20-effects.md` (35.3–36.7 s) — evidence only, never rules
- **tools:** `content-creation:remotion-overlays`, FFmpeg, person matte (SKILL.md § 2)

**Look:** Crack lines spread across the picture as if the screen is glass. Then the background shatters into sharp shards that fly outward and spin, showing a new colour behind. The person stays whole in front.
**Use when:** "Breaking" something: breaking a rule, breaking the feed, a hard pivot.

## Layers (bottom → top)
1. Reveal background: flat `brand.accent` or a sky gradient.
2. Shards: 18–24 triangles cut from the clean background plate (or the plate itself), each with its own motion.
3. Person matte.
4. Crack lines (white 3 px + dark 1 px shadow), radial from an impact point at ~(75%, 45%).
5. Overlays and captions.

## Timing
- Frames 0–8: cracks draw from the impact point, `strokeDashoffset` 100% → 0, `Easing.out(Easing.quad)`.
- Frames 8–40: shards fly. Each shard: translate away from the impact point 40–90% of width, rotate ±90–270°, scale 1 → 0.7, `Easing.in(Easing.quad)`. Stagger by distance from the impact point, 0–4 frames.
- Hard cut out. Total 42–48 frames.

## Build
- Remotion: `<FrameBreak plate bgPlate matte impact={{x:.75,y:.45}} shards={22} seed>`. Build shards by Delaunay triangulation of 30 random points (fixed `seed`, so every render is the same). Each shard is a `clip-path: polygon()` copy of the plate.
- No FFmpeg step.

## Inputs
- Person matte: yes. Word times: yes (impact on the stressed word). Clean background plate: optional; without it the shards carry ghost pieces of the person.

## Traps
- Random shards change every render. Always seed the random generator.
- Shards that fly over the face hide the speaker. Only shards behind the matte, or keep the impact point away from the face.
- Too many shards (>40) look like confetti and slow the render. Stay near 20.
