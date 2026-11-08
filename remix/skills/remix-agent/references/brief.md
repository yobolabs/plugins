# Brief (the contract for every later stage)

Back to [SKILL.md](../SKILL.md). Read when writing, rewriting, or feeding the brief to a prompt or check.

## Contents (all required)

| Section | Holds |
|---|---|
| Source | ad type, style, what made it work |
| Cast per role | one named person per role (identity card: hair, skin tone, clothes, seat, role, feeling); background people too |
| Set + palette | the place, colours, light; written seat map for people ads |
| Product | name, shape sentence, which photos are views of the ONE product |
| Goal / platform / length | |
| Dialogue track | each line: start-end time, speaker, ON or OFF screen. A line may start before its speaker appears and cross a cut. Never one line per shot |
| Per-shot rows | what happens, **keep / change / never**, size (shot size, angle, lens), tone/feeling, lines in its window |
| Voice parts | the teardown marks which source parts carry a voice (measured speech, set by code). A REMADE voice part gets its source clip, with its audio, as a voice reference, so the new clip speaks the brief's line in that voice (Sean 2026-11-05). No separate voiceover, TTS or sound-effect track |
| Never list | content the merchant excluded; no added text, captions, logos, labels, numbers or watermarks; the product keeps its own printed design (see P5 and storyboard.md Rules) |

## Rules

- **Each scene carries timed lines ("a–b s: what happens"), editable by the merchant.** They feed the storyboard sheet and the video prompt; a line is never written only into the video prompt.
- **The Product line's shape sentence comes from the approved product sheet, read once at sheet approval.** It holds pack type, material, colour, label text, what is inside, and real size if known. The brief carries it word for word, and so does every storyboard and video prompt. A brief written from the product's name alone guesses the vessel.
- **The product is described only as its approved sheet shows it** (principle P5 in `../SKILL.md`).
- **The teardown works from the measured shot-list text, never the video.** The teardown agent does not open the source video. A failed fetch of the source link never shows in the brief, so judge a brief by its content, not by its source link.
- **Per-shot slice** = that shot's row + the brief's tone, set, colours, light, people and never list. The slice, not the
  whole brief, feeds (1) the storyboard prompt, (2) the video prompt, (3) the AI review of that shot. A brief that
  reaches only text steps steers nothing.
- The brief is drafted right after the reading, but the merchant's direction and answers come later. **Rewrite the
  remix section after the answers**: stamp it with the inputs it used; rewrite only when they change.
- Version the saved brief with the rules it was written under; a brief from older rules is never reused.
- Placeholders ("merchant to fill") never reach a model: fill from answers or drop before any paid request.
- A check needs a field the brief lacks (beat window, per-scene line)? Add the field to the brief. Checks never invent targets.
- Brief-writer output that fails validation: retry once, then ONE plain line to the merchant.
- Ad notes (per source ad) and product notes (per merchant product) are saved after every remix and loaded into the
  brief next time. Ad- and product-specific detail lives only there, never in generic rules.
