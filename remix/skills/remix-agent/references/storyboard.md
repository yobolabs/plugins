# Storyboard (per-shot cards)

Back to [SKILL.md](../SKILL.md). Read when building, showing or checking storyboards.

Order per shot: **source frame -> line drawing -> storyboard image**. Each shot gets its OWN line drawing from its OWN
source frame (position and framing only). A master picture or set picture is a reference for one set; it never
substitutes for the shot's own line drawing. Line drawings never go to a video model alone (the old subject's shape
leaks into the new product).

**One storyboard per shot, decided** (Sean 2026-11-06, "keep per shot"): a fast-cut ad gets one storyboard for every
measured shot (20-37 on a fast ad), never one per video part. The 4 s floor merges only video parts (`groups.ts`
buildGroups), never storyboards. Do not re-raise this as a cost question.

## Per-card fields (what the card shows and stores)

| Field | Rule |
|---|---|
| Source frame / line drawing / storyboard | shown side by side; tap to compare big (WhatsApp review page first) |
| Window | frame-exact start-end, **on the music's beat** |
| Windows tile the audio | no gaps, no overlaps, total = audio length |
| Type | `still` / `moving` / `keep` (merchant's clip as is) / `mine` (merchant's clip, mined) |
| Cast / set / product | named people, set picture, product refs for this shot |
| Lines | spoken lines that fit the window (speaker, ON/OFF screen) |
| Brief slice | the shot's slice (see brief.md) |
| Check + approval | AI/code check result; the merchant's approval (never the agent's) |

## Rules

- No text, captions, logos or numbers drawn (panel labels only on keyframe-sequence frame sheets: `types/product-hero.md`).
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
