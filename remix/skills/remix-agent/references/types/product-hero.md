# Type: product hero

Back to [SKILL.md](../../SKILL.md). Load when a product moves through the shot(s) and nobody speaks.

- A scene is one continuous shot driven by its WHOLE ordered **keyframe sequence** (never start/end still pairs, which drop highlights between them). Beats are delineated, keyframes tickable, **highlight moments always in**, one reference set, one video.
- Storyboard = a **frame sheet** of 4-8 panels from the source's real frames, redrawn with the new product. Panel labels (order and time) are kept on the sheet; the video prompt forbids labels or numbers and QC checks every second for them.
- Keep ONE framing per locked shot (size, angle, lens); beats move only the subject.
- Redraw prompt: ONE continuous shot, same side and angle every panel, product rests as the old subject did, front label faces camera, no hands/people/effects not already there, never copy the character sheet's separate views, answer edge to edge at the sheet's own aspect ratio.
- Use the many-reference picture model for sheets (the 2-image model squares the sheet and pastes the character sheet).
- Re-theme every scene: purpose -> fit -> new idea (smallest change, source style kept, each scene its own product, no two scenes share an idea); "Use this idea" is the merchant's tap, never automatic.
- First frame exactness: pick the video model that opens on an exact frame; per-scene clips are allowed here (no voices).
- Known product gap: the product stores one frame per scene, not the keyframe sequence/sheet; soft-cut spans and motion samples are not stored (builder map: `remix` skill `references/code-map.md`).
- Product sheet: turnaround from the merchant's own photos only, never a frame of the source ad.

## Making-of ads (ingredients turn into the product)

**A making-of ad needs a real recipe** (Sean 2026-11-04: "I don't think that's how you make a chicken with just an
egg. There needs to be a chicken added"). When the ad shows ingredients turning into the product, the swapped
ingredients must be a believable recipe for the merchant's product, with its MAIN raw ingredient in the most visible
slot (the biggest pile, the first pour). Write this into the prompt; a 1:1 ingredient swap is not enough.
On a swap this usually means more than one thing changes: use the storyboard pipeline (`../fast-swap.md` → "Swap only when ONE thing changes").
