# Remixing a source video with a new product

Back to [SKILL.md](../SKILL.md). Read when the job starts from an existing ad or clip. The order is fixed
(SKILL.md §0): read the ad → brief → line drawings → storyboard images → AI review → human approval → video.
No step is optional; a video request never goes out with line drawings alone.

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
   picture is made; the merchant approves the scene plan.
5. **Rewrite the subject in each beat.** Send the beats plus the merchant's note, framed as: "use it ONLY for what
   to swap or add, never to reword a beat. Keep each beat's own words; change only the words that name or describe
   the old subject" — and the place, props and action already re-themed in step 4.
6. **Brief + script check**: the brief (`content-creation:ad-brief`) names the cast per role, set + palette and
   product. Who says which line is fixed in the script now, before any storyboard.
   Write the script as a **dialogue track**: each line with start–end time, speaker, ON or OFF screen. A line can start
   over the shot before its speaker appears and carry across a cut; never assign one line per shot.
   **The brief is written right after the reading, but the merchant's direction and answers to the questions come
   later.** Rewrite the brief's remix section when the questions are done: stamp it with the inputs it used and
   rewrite only when they change. Version the brief's saved copy with the rules it was written under, so a brief
   from older rules is never reused (one asked for captions and logo overlays after both were banned). Feed each
   shot's slice of the brief (its row + tone, set, colours, light, people, never) into that shot's storyboard
   prompt, its video prompt and its review. A brief that reaches only text steps steers nothing.
7. **References**: clean cast sheets (logos removed) and the product character sheet → line drawings (position and
   framing) → storyboard image per shot (`references-and-sheets.md`; people ads: masters per camera setup, every shot an edit of its master) → AI review against the brief (`review.md` →
   Storyboard review) → the human approves each storyboard. The agent shows and waits; it never approves for them.
8. **Video** in parts (below), in the SKILL.md layout. Draft (480p video, 1k pictures), QC (`review.md`), fix,
   repeat; final quality only after the human signs off.
9. **Save what this ad and this product needed.** After the remix, write the **ad notes** (keyed by the source
   ad: format, exact cuts, what made it work, caption handling, scene ideas that worked, traps) and the **product
   notes** (keyed by the product: shape sentence, reference photos, packs never to mix, colours). Load both at
   step 1 next time that ad or product comes up, so it comes out right the first time. Ad- and product-specific
   detail lives only in these notes, never in the generic rules.

## Whole ad in parts (ads with people or dialogue)

Never one clip per scene when the ad has people or dialogue: per-scene clips drift in voice, change the people,
add captions and logos, and each clip bills at least 4 s. Instead:

- **Split into n = ceil(ad length / the model's max)** parts (Seedance 2.5: 30 s), near-equal lengths, each part
  ending on a hard cut of the source.
- **Generate incrementally**: part 1 → QC against the source and the brief → part 2, with part 1's video as a
  reference (same people, clothes, voices) → … Never fire all parts at once.
- **Voices**: the video model speaks the lines inside each part; no separate TTS laid over. Each role has ONE fixed
  voice description taken from the NEW cast member (never the old ad's person), word-for-word the same in every
  part. The source's soundtrack is never laid over voiced parts.
- **No text or logos** in any part; the merchant adds captions, prices, titles and the end card in post.
- **Screens**: phone held by a character, flat green screen; key the real screenshot in afterwards (SKILL.md §2).
- **The part request must agree with the approved storyboards**: each shot's camera words (shot size, lens) come
  from its storyboard, not from the first reading; a single-picture storyboard is described as one picture of the
  shot, never as "panels"; each line names its speaker and marks off-screen voices.
- **No placeholders reach a model**: fill "merchant to fill" fields from the merchant's answers or drop them before
  any paid request.
- **Fix by splicing** when 1–2 shots are wrong; remake the part when most are (`review.md` → Fixing a part).

## Paid results

Before any paid render, check what was already made (earlier executions and provider requests) and reuse it. Save
every paid output to disk the moment it lands; a result that only lives behind a request id gets paid for twice.

## Assembly (cutting the parts into the source's timeline)

- **Cuts go on the beat, not on the source's cut frames.** With the source's music, place each cut at
  `analyze-video` `cuts[].on_beat` (nearest beat; the half-beat after it when two cuts share one beat). Source reels
  often cut 100–250 ms after the beat; copying their cut times copies the lag. Check the export: re-run
  `analyze-video` on it and give a table cut · beat · offset ms; more than 1 frame (33 ms at 30 fps) is a fail.

- **Pick each clip's payoff, not a fixed offset.** Make a timed contact sheet of every clip (2–4 fps, time on each
  frame) and give each slot the moment that pays off: the landing, the reveal, the label turned to camera. A slot
  shorter than the payoff starts just before it so the payoff lands inside the slot. Put the payoff frame ON a beat and keep at least
  one beat after it on screen (a landing that hits on the cut is never seen); find the frame on a frame-exact strip.
- **Each picture and each clip window once.** Fewer assets than slots → hold some shots for 2 beats (cuts stay on
  beats); never fill a slot with a second window of a clip already shown or a near-twin picture (same product, same
  angle). Viewers read both as repeats.
- **Never the same product in two shots in a row.** Reorder stills and clips first; reuse a clip only when its two
  windows look clearly different (an invisible jump cut is a lost beat).
- **No audio in the parts when the source's music replaces the sound** (only for parts with no voice; voiced
  parts keep their own audio and the source's track is never laid over them). A silent AAC track on each part adds
  padding at the join; on a 24-shot reel it pushed later cuts 33–100 ms late.
- **Stop each part by frame count only** (`-frames:v N`), never an output `-t`: a short part from a 24 fps clip
  loses a frame to `-t` rounding. Read the clip with ~0.5 s spare so the frame count can be met.
- **Measure the export:** run `analyze-video` on the result; cut count and times must equal the source's.

## Traps

| Trap | Effect | Fix |
|---|---|---|
| A saved reading is reused per source link | Old wording keeps coming back after the instructions changed | Version the cache key with the reading instructions; show when it was made |
| Fixing one ad type in a shared tool | A fix for dialogue ads removed what product ads needed (frame-sheet panel labels, Mix as the default) | Before shipping a tool change, diff against the last version and restore anything another ad type relies on. The default mode follows the ad: people talking → whole ad in parts, otherwise Mix; the user's pick wins |
| Browser restores textarea text on reload | An old note is sent again unseen | `autocomplete="off"` on note fields |
| The reading names an adjective as the subject ("the ad's futuristic") | Garbled reference line | Fall back to "the original main subject" |
| An invented prompt-length cap trimmed the end | Camera and style lines lost | No cap except a model's documented one; trim actions first |
| Durations scaled (16 s source → 12 s) | Beats compress; the model runs ahead | Prefer the source length; otherwise scale every time, cuts included |
