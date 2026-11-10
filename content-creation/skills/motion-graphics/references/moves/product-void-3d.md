# Move: Product Void 3D

Back to [SKILL.md](../../SKILL.md).

- **status:** stub
- **seen in:** `_context/yobolabs/video-breakdowns/youtube-cDb-wPq0Iyk-claude-motion-graphics.md` (0:00–0:03 and 13:47–15:20 case tumbles in a black void, lid opens, buds lift out) — evidence only, never rules
- **frame strip:** `_context/yobolabs/video-breakdowns/frames/cDb-wPq0Iyk-product-void-3d.jpg` (source)
- **tools:** Blender headless (`blender -b -P scene.py`), not installed on the Macs yet

**Use when:** A physical product is the hero and must look photographed (premium launch look).
**Look:** Pure black void, the product lit by ONE key light from above/side, soft falloff, deep shadows; slow
turns, a lid opening, parts separating; macro passes with a shallow depth of field.

## Timing
- Each beat 1.5–3 s; camera always moving (orbit or push); cut only by a transform (part fills frame → next beat).

## Build
- Model from real reference photos (and dimensions); one area light + faint rim; Cycles; depth of field on the camera.
- Render frames headless; compose in Remotion with `stat-callout` text.
- Code-only (CSS/WebGL) versions of a physical product look flat and fake; use Blender for this move.

## Traps
- First passes get the shape wrong (case proportions, parts clipping through each other, wrong model variant).
  Check against the real product (SKILL.md § 5).
