# Remixing a source video with a new product

Back to [SKILL.md](../SKILL.md). Read when the job starts from an existing ad or clip.

## Steps

1. **Get the source as a file or direct link.** Page links (TikTok, Instagram, YouTube) need a fetcher first.
   A browser page cannot read frames from a site that sends no CORS headers; fetch it through a same-origin
   proxy or upload the file.
2. **Find the hard cuts from the pixels** (frame-difference peaks). A reading model guesses cuts; pixels don't.
3. **Read the source with a video model.** Pass the cut times and ask for every movement step and the camera
   like a director. Note to send:

   > In every shot's camera field write: shot size, exact; camera height; where the camera stands relative to the
   > subject and the setting — head-on, side-on (flat, no depth) or three-quarter (at an angle, so you
   > feel depth); how far away it stands and what that shows; lens feel; how much of the frame the subject fills
   > and where; which way it moves across the frame; then the camera move with direction and speed, or
   > "static camera, no movement". Inside one continuous shot keep the same size, angle and lens on every beat
   > unless the camera really moves.

   Do not put an example that matches one ad's framing ("eye level from the side") — the reading copies it.
4. **Re-theme every scene to the new product's world — a must, not an option.** The source ad was made for
   another product; its places, props and actions belong to that product. First identify the source's style and load
   its file from `styles/` (SKILL.md §1); the style file says what made that kind of ad work. Then, for each scene,
   still photos included:
   1. **Purpose**: what is this shot FOR — what does it make the viewer feel or believe about the product?
   2. **Fit**: do its place, props and action make sense for the new product — would a real person buy, keep,
      carry, use or eat THIS product there? Check physical sense: temperature, size, how it is held, opened, used
      or eaten.
   3. **New idea** when it doesn't fit: a comparable shot in the new product's world with the SAME purpose.
   Universal checks for every new idea:
   - **Keep the source's own style**: the product as big in the frame as the old one was, the same kind of scene,
     background, colour and energy. Whatever the source did, the new idea does too.
   - **Smallest change**: swap only the wrong prop or action. A different shape, angle, stack or pose is not a
     misfit.
   - **Each scene keeps its own product** (name every scene's product in the pass, not only the main one).
   - **No two scenes get the same new idea.**
   One text pass over all scenes answers this as `Scene N | purpose | fits | why | new` (lab "Check what each scene
   is for"); the merchant picks "Use this idea" per scene. Write the new place into the scene's words before any
   picture is made; the merchant approves the scene plan. Worked example and its mistakes:
   `styles/product-reel.md` (lip balm → gelato).
5. **Rewrite the subject in each beat.** Send the beats plus the merchant's note, framed as: "use it ONLY for what
   to swap or add, never to reword a beat. Keep each beat's own words; change only the words that name or describe
   the old subject" — and the place, props and action already re-themed in step 4.
6. **References**: character sheet → product storyboard per shot (see `references-and-sheets.md`).
7. **Prompt** in the SKILL.md layout. Draft, review (`review.md`), fix, repeat.

## Traps

| Trap | Effect | Fix |
|---|---|---|
| A saved reading is reused per source link | Old wording keeps coming back after the instructions changed | Version the cache key with the reading instructions; show when it was made |
| Browser restores textarea text on reload | An old note is sent again unseen | `autocomplete="off"` on note fields |
| The reading names an adjective as the subject ("the ad's futuristic") | Garbled reference line | Fall back to "the original main subject" |
| An invented prompt-length cap trimmed the end | Camera and style lines lost | No cap except a model's documented one; trim actions first |
| Durations scaled (16 s source → 12 s) | Beats compress; the model runs ahead | Prefer the source length; otherwise scale every time, cuts included |
