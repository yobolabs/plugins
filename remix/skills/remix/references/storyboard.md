# Storyboard (per-shot cards)

Back to [SKILL.md](../SKILL.md). Read when building, showing or checking storyboards.

Order per shot: **source frame -> line drawing -> storyboard image**. Each shot gets its OWN line drawing from its OWN
source frame (position and framing only). A master picture or set picture is a reference for one set; it never
substitutes for the shot's own line drawing. Line drawings never go to a video model alone (the old subject's shape
leaks into the new product).

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
- Redo with notes = edit the last try (Image 1 = last try), change only the note. A fix typed in chat re-draws only
  that scene, after asking (paid).
- The merchant's instruction goes first in the swap prompt and wins over every default.
- Merchant photo marked "use my image" is used as is for that scene, not redrawn.
- Show each shot's speaker and line next to its storyboard; a picture cannot be judged without the words.
- Review & approve: ONE "storyboards ready" message with one button, not one message per storyboard. A failed one is
  named, never hidden behind a count.
- Models for pictures, which fits which job: `yobo:ad-studio-video` `references/higgsfield-and-gotchas.md` and the
  type files. Prompts over 5,000 characters are refused by the many-reference picture model: fall back to each rule's first sentence.
