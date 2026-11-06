# Effect: Digital Zoom

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-Det_44sBsPY-20-effects.md` (36.7–38.4 s).

**Look:** A camera viewfinder sits over the shot: red REC dot, timecode, four corner brackets and a zoom pill. The picture jumps in zoom steps (1.0× → 1.6× → 2.6× → 1.0×), with a short focus-hunt blur at each step.
**Use when:** "Look closer", "zoom in on this", or a camera / recording topic.

## Layers (bottom → top)
1. Plate, cropped and scaled per zoom step.
2. Viewfinder UI (transparent overlay): corner brackets (white 3 px, arms 6% width, inset 5% from edges, at y 8%–92%); "● REC" top-left at (6%, 8%), dot `#FF3B30` ⌀ 1.2%; timecode `00:00:00:00` top-right, white mono 2.2% height; zoom pill top-centre at y 8%, dark 40% fill, text "<n>×".
3. Captions.

## Timing
- UI appears hard on the trigger word and stays for the whole effect (45–55 frames).
- Zoom steps on stressed words, or every 12–15 frames: 1.0 → 1.6 → 2.6 → 1.0. Each step is a hard scale jump plus blur 10 px → 0 over 5 frames.
- REC dot blinks: opacity 1 for 15 frames, 0.2 for 15 frames. Timecode counts real frames.

## Build
- Remotion: `<DigitalZoom plate steps={[{at:0,z:1},{at:14,z:1.6},{at:28,z:2.6},{at:42,z:1}]} anchor>`; pill text = current `z.toFixed(1)` + "×".
- FFmpeg (one step, z = 2.6, anchored at face y ≈ 35%): `crop=iw/2.6:ih/2.6:(iw-iw/2.6)/2:(ih-ih/2.6)*0.35,scale=1080:1920:flags=lanczos`

## Inputs
- Person matte: no. Word times: yes. Face box: yes (zoom anchor).

## Traps
- 2.6× on a 1080p source is soft. Prefer a 4K source; if only 1080p, cap the top step at 2.0×.
- Anchoring at frame centre crops the face out at 2.6×. Anchor on the eyes.
- The UI must not zoom with the plate. Keep it in its own layer.
