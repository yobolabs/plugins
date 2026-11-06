# Effect: Paper Cutout

Back to [SKILL.md](../../SKILL.md).

- **status:** stub (not proven in a run)
- **seen in:** `_context/yobolabs/video-breakdowns/instagram-Det_44sBsPY-20-effects.md` (23.5–25.4 s) — evidence only, never rules
- **tools:** `content-creation:remotion-overlays`, FFmpeg, person matte (SKILL.md § 2)

**Look:** The room behind the person is replaced by a flat graphic poster: solid colour field, a big circle, a star, dots and diagonal stripes. The person gets a thick white sticker outline, like a paper cut-out glued on top.
**Use when:** The line is playful or names a style; a loud, flat "zine" beat between plain talking-head shots.

## Layers (bottom → top)
1. Flat background: `brand.primary` fill, full 1080x1920.
2. Shapes: circle `brand.accent` ⌀ 30% width, centre (88%, 33%); black 5-point star ⌀ 12% width at (8%, 37%); white dots ⌀ 3% at (2%, 50%) and (96%, 50%); two diagonal bands (white 6% thick, black 4% thick) at −12°, across y ≈ 60–75%.
3. Sticker outline: the person matte grown by 2% width (≈ 22 px), filled white, soft drop shadow (0 8px 0 rgba(0,0,0,.25)).
4. Person matte (plate × alpha), scaled 1.08 around the face so the head fills more of the frame.
5. Overlays and captions per SKILL.md § Layer stack.

## Timing
- Hard cut in on the trigger word, hard cut out. Typical hold 50–60 frames.
- Shapes are static. Optional: shapes pop in over frames 0–6 with `spring({damping: 12})` scale 0 → 1, staggered 2 frames each.

## Build
- Remotion: `<PaperCutoutBg colors={{field, accent, ink}} seed>`; renders layers 1–2 as SVG. Render it as the background layer, not as a transparent overlay.
- FFmpeg (outline from the matte): `[m]alphaextract,gblur=sigma=8,lut=y='if(gt(val,24),255,0)'[grow];color=white:s=1080x1920[w];[w][grow]alphamerge[outline]` then overlay `outline` under the person.

## Inputs
- Person matte: yes. Word times: yes (trigger word). Assets: none; all shapes are drawn.

## Traps
- Outline jitters frame to frame because the matte edge flickers. Fix: smooth the matte over time first (`tmix=frames=3` on the alpha) before growing it.
- Hair edges show the old room colour through the outline. Fix: erode the person alpha 1–2 px before compositing.
- Hands that leave the matte (fast gestures) vanish. Pick a take where hands stay low, or accept it for ≤ 2 s.
