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
| Audio plan | decided at the teardown, never at the join (Sean 2026-11-05: "This needs to be determined during the ad teardown"). The teardown records per scene the source sound (dialogue on screen · voiceover · music · sfx · silent) and whether the source track carries speech; the brief then sets per scene: **voiced** (the part is made with voices, every line generated inside the clip, off-screen voiceover included, one fixed voice per speaking role) · **source-music** (only when the track has no speech) · **ambience** · **tts** only for a window with no video clip (a held still). The teardown's dialogue track (each line: start-end, role, exact words, ON/OFF screen) feeds it. Reference run: `p130 …/remix-lab/notes/ads/tryholo-clay-office.md` (Seedance with voices, part1c). Its cost is in the parts quote. Unclassified = treated as speech |
| Never list | old brand logos, mascots, signs; text, captions, logos drawn by a model |

## Rules

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
