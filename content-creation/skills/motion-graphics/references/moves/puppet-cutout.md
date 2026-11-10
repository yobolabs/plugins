# Move: Puppet Cutout

Back to [SKILL.md](../../SKILL.md).

- **status:** stub
- **seen in:** `_context/yobolabs/video-breakdowns/youtube-cDb-wPq0Iyk-claude-motion-graphics.md` (10:00–12:25 illustrated characters on a billboard in a flat street, one line per board) — evidence only, never rules
- **frame strip:** `_context/yobolabs/video-breakdowns/frames/cDb-wPq0Iyk-puppet-cutout.jpg` (source)
- **tools:** Remotion; cut-outs from the brand's existing art (background removal); pivot rigs

**Use when:** The brand already owns illustrations or AI images and wants them to move, without new generation.
**Look:** A flat illustrated scene; characters cut out of existing art, each limb or prop on its own layer, move by
rotation about joints (wave, raise, point, hold up a prop). The scene element in the centre (a billboard, a card)
changes per line, and the camera drifts.

## Timing
- Each pose change 8–12 frames, ease-in-out; idle sway ±2° on a 2 s cycle so nothing is frozen.
- Board/line change on each VO line; text by `word-slide-up`.

## Build
- Cut parts with a local background remover (rembg), then split limbs by hand-drawn masks; set pivot points at joints.
- Layers: background → scene element → character body → limbs → props → text.

## Traps
- Cutting a limb leaves a hole in the body; paint the hidden part or keep the joint covered.
- Large rotations look like paper; keep joint angles under ~35°.
