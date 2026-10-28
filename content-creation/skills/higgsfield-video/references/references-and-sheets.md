# References: character sheets, product storyboards, video references

Back to [SKILL.md](../SKILL.md). Read when deciding which pictures and videos to send, or when making them.

## The ACTIVE REFERENCES block

One line per reference: `<Image|Video N> — <TYPE> — <NAME>: <what it controls>. <what it must not do>.`
Close the block with: "Preserve these exact bindings. References control their assigned roles; framing and
camera movement follow the shot instructions."

| Type | Controls | Must say |
|---|---|---|
| STORYBOARD (real frames, product swapped in) | environment, people, light, angle, distance, where the subject is, per panel | "Match each panel at its time" |
| STORYBOARD (line drawing) | where things are, the subject's path | "the outline of the <old subject> only marks WHERE the <product> is and how big; never copy its shape — no wheels, lights, windows, plates or body panels" |
| PRODUCT CHARACTER SHEET | what the product looks like from every side | "views of ONE <product>"; "never sets camera position, framing or how big it is in frame" |
| PRODUCT VIEW (extra photo of the same product) | another side of the same product | "the same ONE <product>, never framing" — do not call it a prop |
| PROP | another object's look | "looks exactly like its photo whenever it appears" |
| LOGO | the logo | "appears only in the final 2 s, exactly as drawn; before that, no logo anywhere" |
| VIDEO REFERENCE (source ad / its shot) | cuts, camera moves, framing, timing | "never how anything looks" |

Name the product by its base name: photos named "<product> left side", "<product> top" are views of one product.

## Character sheet (product or person) — 1 paid picture

CTLT order (Camera → Tone → Lighting → Texture). Input = only the merchant's own photo(s); never a frame of the
source ad (it drags the scene and framing in).

```
Character turnaround sheet, studio product photography, normal lens, eye level: the <product> shown four times
side by side at the same size and spacing — front, three-quarter, side and back — each fully visible.
Calm, clean reference sheet: the <product> alone on a plain mid-grey seamless background, nothing else, no scene.
Even soft studio light from the front and above, soft grounded shadow under each view, no colour cast.
The <product> looks exactly like Image 1 in every view: same shape, colours, materials, size and real surface
detail, sharp focus. Image 1 gives only the <product>'s look. No logo, label, sticker, text or watermark.
```

Aspect 16:9.

**Redo with notes = edit the last try**, never re-run the first edit: Image 1 = the last try, Image 2 = the
product, "Keep everything in it exactly … and change only this: <notes>. The <product> must still look exactly
like Image 2." This also fits models that take only 2 pictures (Nano Banana). Nano Banana Pro answers square,
which squashes a storyboard sheet; use GPT Image Flare (`aspect_ratio` auto) for sheets.

## Product storyboard — 1 paid picture per shot

The strongest layout reference: the source's real frames with the product swapped in.

1. Build a sheet from the source's real frames for the moments that matter (fewer panels = more pixels per
   product; 4–8 is a good range). Keep the panel labels (number, time, ★ for highlights).
2. Image model (GPT Image Flare, `resolution` 2k, `aspect_ratio` auto) with the sheet + the character sheet:

```
Image 1 is a storyboard sheet of real frames from one continuous shot of an ad, panel by panel in time order.
Redraw the whole sheet exactly, panel for panel: the same layout, panel labels, environment, people, light,
effects, colours, camera angle, distance and framing in every panel. In every panel replace the <old subject> with
the <product> from Image 2, at the same place, size, angle and pose. Change nothing else. One <product> per
panel. No logo, label, sticker or watermark on the <product>.
This is ONE continuous shot: in every panel the <product> is seen from the same side and angle the <old subject>
is seen from, turned the same way, with the same kind of contact — resting on a surface, held in a hand, worn,
or moving — and a real contact shadow, never floating. It sits in the natural position for that contact, never
stood on end or tipped up to show a side the <old subject> does not show; if it moves, its front points the way
it moves. Image 2 only shows what it looks like; never copy its separate views into the panels. People, hands
and everything else stay exactly as they are. Fill the whole picture edge to edge: no borders, no black bars.
```

3. Check every panel before approving: the old subject is gone, the setting and people kept their shape, the product sits naturally.

## Things that went wrong

| Reference | What happened |
|---|---|
| Line-drawing storyboard traced from the source | The new product grew the old subject's taillights and bumper |
| "Hero still" (product in the ad's scene and light) | Became frame 1; its framing overrode the camera; its sticker leaked the logo |
| Product photo with a sticker | Logo visible from the first frame despite "logo at the end" |
| Tiny 10-panel storyboard | Panels too small to carry anything; the model invented angles |
| Product storyboard with a character sheet as Image 2 | Each panel copied a different sheet view (side, top, three-quarter), product floating, sheet letterboxed in black — say "ONE continuous shot: same side and angle in every panel, rests on the ground; never copy the sheet's views", and ask for the sheet's own aspect ratio |
| Redo that re-ran the original edit with the notes added | A completely different product: the fix re-rolled everything (Nano Banana takes only 2 pictures, so the last try was never sent) |
