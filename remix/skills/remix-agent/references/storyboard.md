# Storyboard (per-shot cards)

Back to [SKILL.md](../SKILL.md). Read when building, showing or checking storyboards.

Order per shot: **source frame -> line drawing -> storyboard image**. Each shot gets its OWN line drawing from its OWN
source frame (position and framing only). A master picture or set picture is a reference for one set; it never
substitutes for the shot's own line drawing. Line drawings never go to a video model alone (the old subject's shape
leaks into the new product).

**Video model: Seedance only, never Kling.** Every remix video part, draft and final, runs on Seedance. A clip of one continuous shot uses Seedance
image-to-video with the start picture as `image_url` and the end picture as `end_image_url`. A clip spanning several
shots uses Seedance reference-to-video: ordered `image_urls` (start picture first, end picture last), bound by @ tags
in the prompt. Reference-to-video takes no first/last frame field and must not be mixed with one.

**What a storyboard set must hold:** one image for every UNIQUE shot (a shot that comes back, the same setup and framing,
reuses its image rather than getting a new one), PLUS an image for the first and the last frame of every video part
(clip) sent to the video model. The review fails a set that is missing any of these.

**Clip requests (one rule set for every video part):**
- Each clip gets a storyboard of at least two keyframes: its first picture and its last picture. Add further keyframes only for significant moments that give the clip context.
- Send a clip only the pictures it needs. Never send every picture of the set to one clip.
- The source clip is not a visual reference. It is sent only when the part keeps the ad's audio, and then as the extracted audio track only, never the video file.
- Burned-in text: a storyboard or keyframe that shows source text fails review. Clean the text off source footage only for kept clips (cut, not generated), never for generated clips.
- Template parts: the template's prompt (preset recipe) plus this clip's needed pictures. The template panel is the script only, never a picture (`types/template-reel.md`).
- Picture request order, for every picture or video request: Image 1 is the colour picture being edited or continued (the approved storyboard or the previous colour frame); then the cast and product sheets; the line drawing last, labelled "framing and positions only". A line drawing is never the first or only image. A request with no colour reference is refused before the paid call.

**One storyboard per shot, built from keyframes, decided.** A fast-cut ad gets one storyboard for every measured shot (20-37 on a fast ad), never one per video
part. Each shot's storyboard is ONE keyframe sheet of that shot's key moments: first frame, every beat start, every ★,
last frame. A long shot is split at a real moment (a beat start or a ★), never mid-action. It is redrawn with the merchant's cast and product. That is for any source with no speech, even when people appear in it. People-dialogue ads (people who SPEAK) use
one label-free picture per shot instead: a master per camera setup, and every other shot of that setup drawn from its
own line drawing with the master as a reference (`HOW-REMIX-WORKS.md` §A rule 7, proven on the 10-29 dialogue run).
A product sheet needs only one ticked moment, the same as the lab; there is no minimum of 3. The 4 s floor merges only video parts (`groups.ts`
buildGroups), never storyboards. Do not re-raise this as a cost question.

## Per-card fields (what the card shows and stores)

| Field | Rule |
|---|---|
| Source frame / storyboard | shown side by side; tap to compare big (WhatsApp review page first). The line drawing is not shown (see Rules) |
| Window | frame-exact start-end, **on the music's beat** |
| Windows tile the audio | no gaps, no overlaps, total = audio length |
| Type | `still` / `moving` / `keep` (merchant's clip as is) / `mine` (merchant's clip, mined) |
| Cast / set / product | named people, set picture, product refs for this shot |
| Lines | spoken lines that fit the window (speaker, ON/OFF screen) |
| Brief slice | the shot's own brief row first (`- **S<n> (a–b s):** …`, where `S<n>` is scene `s<n-1>`); the source reading line only for action and framing. The shared brief carries no per-shot rows (see brief.md) |
| Check + approval | AI/code check result; the merchant's approval (never the agent's) |

## Rules

- A still is drawn from its ONE source frame, never from a keyframe sheet. Any reference that names a sheet, even one with a single panel, makes the model draw grids or split panels. Edge frames (single frame) render clean. Video scenes keep their sheet of every moment.
- The AI storyboard review must include the check "one picture, no panels, grid or split". Without it, split frames pass review.
- Seedance renders clips of at least 4 s. A short scene keeps the ad's cut through the preset clip recipe (render window, play the scene).
- A line drawing is an internal framing input to the picture model only. The merchant never sees one: not in chat, the review page, the album, the cards or the video. The merchant sees the source frame and the new storyboard picture. The Remix Lab is a team tool and may show line drawings.

- **Product words in every storyboard prompt come from the approved sheet**, as principle P5 in `../SKILL.md` requires.
- Add no text, captions, logos, labels, numbers or watermarks (panel labels only on keyframe-sequence frame sheets: `types/product-hero.md`). Keep the real product's own printed design exactly as the selected or approved reference shows it. Do not infer hidden packaging surfaces or physical dimensions from generated images. A merchant instruction that excludes overlays also excludes a CTA overlay.
- A scene is one continuous shot between hard cuts; a short scene keeps its own timing (a model may render longer than
  the window; the player stops at the window).
- **The global prompt reaches every storyboard picture.** It holds brand, product, cast and look only; scene beats go
  in each scene's own words. A whole-ad scene plan in the global prompt drew every beat into every scene.
- **The product image goes only to scenes that show the product** (from the plan). Every storyboard and video prompt
  carries the real-size line. Sent to every scene, the product was pasted huge into the room, toast and presenter
  shots, and a "replaces the ad's main subject" line made the presenter hold it.
- **End cards and text masks never reach the picture model.** Drop the source's logo/end-card frames from the panels at
  read time (they came back as a model-drawn brand name), and inpaint caption masks (white boxes were copied as boxes).
- **Re-imagined scene, different business:** pick "a new set" and use the per-scene purpose check's new idea before
  any picture; line drawings of the old place (landmark, stands, logo card, captions) are framing only.
- Redo with notes = edit the last try (Image 1 = last try), change only the note. Removal notes ("remove the plate in
  the foreground") stick; replace notes ("make view 2 a plate") often keep the old content: after one failed edit,
  drop it and draw fresh. A fix typed in chat re-draws only
  that scene, after asking (paid).
- The merchant's instruction goes first in the swap prompt and wins over every default.
- Merchant photo marked "use my image" is used as is for that scene, not redrawn.
- Show each shot's speaker and line next to its storyboard; a picture cannot be judged without the words.
- Review & approve: ONE "storyboards ready" message with one button, not one message per storyboard. A failed one is
  named, never hidden behind a count.
- Models for pictures, which fits which job: `remix-context` search "higgsfield gotchas" and the
  type files. Prompts over 5,000 characters are refused by the many-reference picture model: fall back to each rule's first sentence.
