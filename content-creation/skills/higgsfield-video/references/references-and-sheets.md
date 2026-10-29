# References: character sheets, product storyboards, video references

Back to [SKILL.md](../SKILL.md). Read when deciding which pictures and videos to send, or when making them.

## The ACTIVE REFERENCES block

One line per reference: `<Image|Video N> — <TYPE> — <NAME>: <what it controls>. <what it must not do>.`
Close the block with: "Preserve these exact bindings. References control their assigned roles; framing and
camera movement follow the shot instructions."

| Type | Controls | Must say |
|---|---|---|
| STORYBOARD (real frames, new cast, set and product drawn in) | environment, people, light, colours, angle, distance, where the subject is, per panel | "Match each panel at its time" |
| STORYBOARD (line drawing) | only alongside the storyboard images, never alone: where things are, the subject's path | "the outline of the <old subject> only marks WHERE the <product> is and how big; never copy its shape — no wheels, lights, windows, plates or body panels" |
| SET — <PLACE> | the place: room, furniture, colours, light, where everyone sits (with the written seat map) | "this is the place for every shot; seats as the seat map" — one approved master picture |
| CAST — <NAME> | what that named person looks like, and their voice description | "<Name> only; never framing" — one picture per person (background people too), file named after the person, cleaned of logos first |
| PRODUCT CHARACTER SHEET | what the product looks like from every side | "views of ONE <product>"; "never sets camera position, framing or how big it is in frame" |
| PRODUCT VIEW (extra photo of the same product) | another side of the same product | "the same ONE <product>, never framing" — do not call it a prop |
| PROP | another object's look | "looks exactly like its photo whenever it appears" |
| VIDEO REFERENCE (source ad / its shot) | cuts, camera moves, framing, timing | "never how anything looks" |

Name the product by its base name: photos named "<product> left side", "<product> top" are views of one product.
No LOGO reference: end cards and logos are added in post-production (SKILL.md §2), and a logo the merchant left out
is never sent.

## Character sheet (product or person) — 1 paid picture

CTLT order (Camera → Tone → Lighting → Texture). Input = only the merchant's own photo(s); never a frame of the
source ad (it drags the scene and framing in).

```
Character turnaround sheet, studio product photography, normal lens, eye level: the <product> shown four times
side by side at the same size and spacing — front, three-quarter, side and back — each fully visible.
Calm, clean reference sheet: the <product> alone on a plain mid-grey seamless background, nothing else, no scene.
Even soft studio light from the front and above, soft grounded shadow under each view, no colour cast.
The <product> looks exactly like Image 1 in every view: same shape, colours, materials, size and real surface
detail, sharp focus. Image 1 gives the <product>'s exact look, including its own printed design: every label,
logo, word and colour on it stays exactly as in the photo, sharp and readable. Add nothing else: no extra text,
captions, numbers or watermark.
```

Aspect 16:9.

**Cast (person) sheets are cleaned before use.** Remove every logo, emblem, crest or symbol on clothes, bags and
props first (an edit pass on the sheet), then check it. A logo left on a cast sheet appears in every scene.

**Redo with notes = edit the last try**, never re-run the first edit: Image 1 = the last try, Image 2 = the
product, "Keep everything in it exactly … and change only this: <notes>. The <product> must still look exactly
like Image 2." This also fits models that take only 2 pictures (Nano Banana). Nano Banana Pro answers square,
which squashes a storyboard sheet; use GPT Image Flare (`aspect_ratio` auto) for sheets.

## Storyboard images — 1 paid picture per shot (a required step, never skipped)

The strongest layout reference and the one that tells the video model how things look: the source's real frames
redrawn with the new cast, set and product. Line drawings come first (position and framing) and become these
pictures; a video request never goes out with line drawings alone.

**Which layout:** ads with people or dialogue get ONE picture per shot (next section), never a multi-panel sheet.
Ads without people whose scenes are keyframe sequences (a product moving through one shot) use the frame sheet
below.

1. Build a sheet from the source's real frames for the moments that matter (fewer panels = more pixels per
   product; 4–8 is a good range). Keyframe-sequence sheets keep their small panel labels (panel order and time):
   the ad types that use them need them, and removing them broke those types. Labels must never reach a
   video: every video prompt says "no text, panel labels or numbers anywhere", and QC checks for them
   ("10 · 2.3 s" once leaked into a final video). Per-shot pictures carry no labels at all.
2. Image model (GPT Image Flare, `resolution` 2k, `aspect_ratio` auto) with the sheet + the character sheet:

```
Image 1 is a storyboard sheet of real frames from one continuous shot of an ad, panel by panel in time order.
Redraw the whole sheet exactly, panel for panel: the same layout, environment, people, light, effects, colours,
camera angle, distance and framing in every panel. No labels, numbers, captions, text or logos in any panel. In every panel replace the <old subject> with
the <product> from Image 2, at the same place, size, angle and pose. Change nothing else. One <product> per
panel. Its own printed labels, logo and text exactly as in Image 2; add no other text or watermark.
This is ONE continuous shot: keep the camera angle of each panel and the same <product> position in every panel.
Turn the <product> so its front — the side with its main logo or label — faces the camera as much as that angle
allows; never show its back, base or a blank side. It takes the <old subject>'s place and contact exactly: on
the ground → stands on the ground, upright, contact shadow, never floating; held or worn by a person → held or
worn the same way. Never add hands, people, light streaks or effects that are not already in that panel.
Image 2 only shows what it looks like; never copy its separate views into the panels. Answer with ONLY the
redrawn sheet of Image 1, edge to edge: never paste Image 2 into the picture, no borders, no black bars.

Put the merchant's own instructions and the shot's beats into the swap prompt, first, with "they win over every
default below" — a default ("upright") silently overrode "the can lies on its side" when they were left out.
Defaults only fill what the merchant did not say.

Use GPT Image Flare for storyboards (`aspect_ratio` = the sheet's own shape). Nano Banana squared the sheet,
pasted the character sheet under it and added a hand.
```

   **With people**: each person becomes the cast member for that role (one CAST SHEET per role, named); the
   people the ad shows behind or around the speaker stay, as the new team, softly out of focus — a speaker is never
   alone on a bare wall unless the ad shows that. The room's colours and set follow the brief's set + palette.
   The source brand's logos, mascots and signs are removed. An app or chat screen is a phone held by a character,
   its screen flat chroma green (SKILL.md §2).
3. AI review of every panel against the brief (`review.md` → Storyboard review), then the human approves each
   storyboard. The agent never clicks Approve for them.

## People and dialogue ads: one picture per shot, on a fixed set

A multi-panel sheet with several people fails (wrong person per panel, different person per frame, the cast
sheet drawn into the picture). Make one storyboard picture per shot, and give every shot the same three anchors:

1. **The SET**: one approved master picture of the place (room, furniture, colours, light) plus a written **seat
   map** — who sits or stands where, in the layout the source actually has (desk pods, a counter, a sofa; never
   classroom rows unless the source shows rows). Send both with every storyboard. Without them each shot invents
   its own room and seats.
2. **Named cast**: every character has a name; rename the cast picture files to those names. Each gets a one-line
   **identity card** (hair, skin tone, clothes, seat, role, feeling) used word for word in storyboard prompts,
   video prompts, voice descriptions and reviews. **Every visible person, background included, has their own
   reference picture**; a person with no picture gets invented.
3. **The shot's brief slice**: that shot's row from the brief (action, line, feeling) plus the brief's tone, set,
   colours, light and "never" list (`remix-workflow.md` → Brief).

Picture models behave differently here; pick by what the shot needs:

| Model | Takes | Does well | Fails at | Write in the prompt |
|---|---|---|---|---|
| Nano Banana / Nano Banana Pro (2-image functions) | prompt + Image 1 + Image 2 only | edits Image 1's composition; realistic expressions | cannot move the camera away from Image 1; with a combined cast sheet as Image 2 it copied the sheet's full-body pose | Image 1 = the frame to keep; "keep EXACT framing; the sheet is reference only" |
| GPT Image Flare | ≤16 reference pictures | send the set picture + EACH person's own picture by name: identities and seats stay stable across calls | ignores Image 1 as a camera reference; drew smiling background people by default | the camera every time in words (shot size, angle, who is in frame, where); the feeling from the brief, and for a tense brief "nobody smiles" |

Never merge several people into one cast sheet for a model that can take them one by one.

### Masters per camera setup: every shot is an edit of its master

The fixed set and seat map are not enough on their own. Drawn one by one, each shot re-imagines the desks and seats
and drifts to a wide view of the whole room, so people move between shots and nothing follows the source. What
holds (proven on a dialogue ad: 11 shots, 11 pictures, faces and rooms stable):

1. **List the source's camera setups** from the teardown (`analyze-video` → Camera setups): who is in frame, shot size,
   angle, which way they face, depth of field, what is behind them, and which shots reuse the setup.
2. **One master picture per setup**, framed like the source frame, with the framing written in words. Do not send a
   captioned source frame: Flare copies captions and UI into the picture. Send the person's own picture and the set
   picture. When the source uses a shallow depth of field, ask for it: a blurred background also hides small layout
   differences between shots.
3. **Every other shot of that setup is an edit of its master**: Image 1 = the master to keep ("same person, clothes,
   chair, desk, background, light and camera angle"), Image 2 = the person's picture. Change only the expression,
   gesture, a held prop, or "the camera a little closer". Never redraw a shot of an existing setup from scratch.
4. **Inserts** (an object close-up, a screen) are their own pictures, no people.
5. A phone whose screen is keyed later: "a smartphone whose whole screen is plain flat bright green (#00FF00) with
   nothing on it, held upright, screen facing the camera".
6. Show each shot's speaker and line next to its storyboard; the human cannot judge a picture without the words.

## Things that went wrong

| Reference | What happened |
|---|---|
| Line-drawing storyboard traced from the source | The new product grew the old subject's taillights and bumper |
| A whole-ad part made from line drawings only | Wrong room colours, speaker alone on a bare wall, two look-alike cast members swapped, a laptop with garbled text instead of a phone |
| Storyboard with panel labels drawn in | The label ("10 · 2.3 s") came out burned into the final video |
| Cast sheet with a logo on the shirt | The logo showed in every scene |
| "Hero still" (product in the ad's scene and light) | Became frame 1; its framing overrode the camera; its sticker leaked the logo |
| Product photo with a sticker | Logo visible from the first frame despite "logo at the end" — the fix is never stripping the product; the logo end card is added in post-production |
| "Same side as the old subject" when the source shows it from behind | A can turned its back (nutrition panel) to camera; say "front label faces the camera" |
| Listing contact types ("held in a hand") | A hand appeared in a panel with no person |
| Sheet prompt said "no logo, label, text" | A branded can came out blank: the label is the product |
| Every people-shot drawn fresh from the set picture + seat map, no source frame | Desks and people moved between shots; every shot became a wide view; shots stopped following the source — use masters per camera setup |
| Tiny 10-panel storyboard | Panels too small to carry anything; the model invented angles |
| Multi-panel sheets for a dialogue ad, all roles on one cast board, no pictures for background people | Old cast kept, wrong person per role, cast board drawn into the picture, a different person per frame |
| No set picture or seat map | Every shot invented its own room and seating |
| One combined cast sheet sent to a 2-image model | It copied the sheet's full-body pose instead of the frame's framing |
| Many-reference model given the frame as Image 1 and no camera words | Right people, wrong camera: it ignores Image 1 as a camera reference |
| No feeling written for background people | Everyone smiling in a tense scene |
| Product storyboard with a character sheet as Image 2 | Each panel copied a different sheet view (side, top, three-quarter), product floating, sheet letterboxed in black — say "ONE continuous shot: same side and angle in every panel, rests on the ground; never copy the sheet's views", and ask for the sheet's own aspect ratio |
| Redo that re-ran the original edit with the notes added | A completely different product: the fix re-rolled everything (Nano Banana takes only 2 pictures, so the last try was never sent) |
