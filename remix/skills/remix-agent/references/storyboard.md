# Storyboard (per-shot cards)

Back to [SKILL.md](../SKILL.md). Read when building, showing or checking storyboards.

Order per shot: **source frame -> line drawing -> storyboard image**. Each shot gets its OWN line drawing from its OWN
source frame (position and framing only). A master picture or set picture is a reference for one set; it never
substitutes for the shot's own line drawing. Line drawings never go to a video model alone (the old subject's shape
leaks into the new product).

**Video model: Seedance only, never Kling.** Every remix video part, draft and final, runs on Seedance 2.5. Never route drafts to Seedance 2.0: its queue stalls past the part deadline. The draft model comes from the first profile with stage "drafts" in `ads_gen.remix_model_profiles`, not from the run's chosen model. Every remix video part, one shot or several, uses Seedance
reference-to-video, as the Remix Lab does: ordered `image_urls` = the clip's storyboard keyframe sheet(s), then the cast
and product sheets, then the product photos, bound by @ tags in the prompt. The prompt writer's labels follow that exact
order; a part whose labels and pictures do not line up is held before submit with the mismatch fact, for the run owner to decide. Image-to-video (first and last frame
only) drops the sheets and is never used for remix parts. Reference-to-video takes no first/last frame field.

**What a storyboard set must hold:** one image for every UNIQUE shot (a shot that comes back, the same setup and framing,
reuses its image rather than getting a new one). Each video part's storyboard is ONE timed keyframe sheet: panel 1 =
the clip's first keyframe, last panel = its last keyframe, each with its time. The review fails a set missing either edge panel.

People who speak: every moving shot, speech shots included, gets its timed sheet like any clip (`types/people-dialogue.md`).
The setup master is passed beside the sheet as the set and cast reference. Stills keep one frame.

**Clip requests (one rule set for every video part):**
- Each clip gets ONE timed keyframe sheet: panel 1 its first keyframe, last panel its last keyframe, each with its time; between them every beat start of the reading and every ★. A clip of several shots is one sheet across them, hard cut marked. No separate start/end pictures.
- Send a clip only the pictures it needs. Never send every picture of the set to one clip.
- The source clip is not a visual reference. It is sent only when the part keeps the ad's audio, and then as the extracted audio track only, never the video file.
- Mode: every clip is a reference-to-video clip: ordered `image_urls` = its sheet(s), then the cast and product sheets, then the product photos, only what that clip needs. The prompt binds each @ImageN by that order. Never send a first/last frame field.
- Edge frames are the first and last panels of the clip sheet. A still shot's sheet is one frame. Edge panels are drawn like setup shots, from their own frame, with the scene's storyboard as look reference. A line drawing is never a panel or an image on its own.
- Burned-in text: a storyboard or keyframe that shows source text fails review. Clean the text off source footage only for kept clips (cut, not generated), never for generated clips.
- Template parts: the template's prompt (preset recipe) plus this clip's needed pictures. The template panel is the script only, never a picture (`types/template-reel.md`).
- Picture request order, for a picture request: Image 1 is the colour picture being edited or continued (the approved storyboard or the previous colour frame); then the cast and product sheets; the line drawing last, labelled "framing and positions only". For a video request the order is the reference-to-video order above (sheet(s), cast and product sheets, product photos). A line drawing is never the first or only image. A clip request with no colour picture is not sent to the video model: it has no approved storyboard yet (RULES 12, storyboard first). The fact (which clip, colour picture missing) goes to the run's owner, who draws or redraws that storyboard.
- Video words for a clip never append a scene's own text: scene text can come from an earlier pack and name a product the brief replaced. What the approved storyboard shows reaches the video as each shot's first line.

**One storyboard per video clip, built from keyframes, decided.** A fast-cut ad gets one storyboard per video clip, never
one per measured shot. Each clip's storyboard is ONE keyframe sheet of its key moments: first frame, every beat start,
every ★, last frame. A long shot is split at a real moment (a beat start or a ★), never mid-action. It is redrawn with the merchant's cast and product. That is for any source with no speech, even when people appear in it. People-dialogue ads (people who SPEAK) use the same timed sheet for every moving shot, speech shots included; the setup master is passed beside it as the set and cast reference (`types/people-dialogue.md`).

**Redraw keeps the sheet.** A redraw keeps the sheet's panel count, order and shape and never brings back the source ad's object. The code checks the panel count. A mismatch is redrawn at most once per part (a per-part limit in the team limits register), then a failure line with [Fix it].
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

## Keyframe sheet

- A keyframe sheet never leaves an empty grid cell: its moments are padded to the full grid with in-between moments inside the same shot.
- A video part drawn as one clip sheet is the same picture on every member scene. Anything the review reads per scene (failures, redraws, remakes, grants, the quality-fix count) is read through the part, so a failed part sheet ends in the storyboard failure line and [Fix it] redraws the part once.

## Model fallback

- A fallback redraw on another model carries the scene's data, never another model's own variables. A variable only some board functions declare is listed as function-only and dropped for a function that does not declare it. Add a new function-only variable to that list; never copy a full per-function list, since it drifts and drops live variables.

## Numbering

- The merchant's scene number is the caption number: the ad's kept shot is Scene 1, and internal scene indexes never reach the merchant. The agent passes the merchant's number in scene operations and the app maps it.
