# Type: template reel (ad beside a prompt panel)

Load when the source ad is a "template" post: the ad plays in one part of the frame, and a static panel beside it
shows the prompt that made it (often with a small product photo and a "comment X for the prompt" line).

## What is different

- **Template reels carry their own prompt** (Sean 2026-11-04: "grab the prompt from the video because it's shown on
  the left side … we should actually include that"). When the ad sits beside a static text panel, crop that panel
  strip (full height, ≤420 px wide) and read it with a plain TRANSCRIBE function (`panel_prompt_reader`: "copy every
  word exactly, never summarise"), ONE call on the whole strip (≈35 s); ≥200 characters = the prompt that made the ad.
  A yes/no or describe function summarises long text ("a long paragraph of prompt text"), and a layout reader
  (`ad_layout_reader`) runs past 90 s; slicing the strip did not help and repeated the overlap.
  Give it to the model as the script ("follow it shot for shot; wherever it names the advertised product, use ours
  and adapt how it is shown"). **The script also decides which parts are remade:** every scene overlapping a timed
  line that names the product (@Image1, product, logo, branding, label, packaging) is remade, even if the reading
  saw no product there (the product printed on flyers or a shirt pocket); a script with no time codes = remake the
  whole ad. Text the script prints on props (a flyer's words) follows the script, edited for the merchant; no
  captions or added text. Never send the panel as a reference IMAGE: the model copies images visually, and the
  panel's own product photo won. The read prompt pre-fills the run's prompt; edits change that prompt, never replace it.
- **Clip to the ad area.** Kept clips, remade parts and held pictures are all cut to the ad area (pixels that change
  across frames) and resized to a standard shape. Never send the panel as an image: its product photo wins.
- **Check how the product appears.** Template reels often print the product on props (flyers, posters, a shirt
  pocket). That is an indirect appearance: no swap, use the storyboard pipeline (`../fast-swap.md` → "Swap only when the
  product is shown as itself").
- **The reference video of a preset part is the raw template window.** The video model can copy the source product out of it even with correct storyboards, and template part clips are not text-cleaned, so source captions can ride along. The result is a draw, not deterministic: a redo with identical inputs can pass. Check the reference clip for the source product before paying for a part.

## Worked example (2026-11-04)

Flyer reel DfICvQhO4UL: woman, taxi gust, flying flyers printed with the advertised cup and "SAVE THE DATE 11.27",
ending on a held flyer close-up. Panel prompt 1543 characters. Runs 1–2 as a swap (Seedance 2.0 480p) failed:
the flyers kept the original cup art and words even with the edited script and a product sheet; the held picture kept
"SAVE THE DATE". Best swap plan the lab found: video 0–6.8 s (7 s billed) + 1 picture for 6.8–8.9 s. Outcome: this
reel goes to the storyboard pipeline (Sean). Learnings: Remix KB `…template-reel-remix-failed-panel-prompt-9fd8.md`,
`…seedance-copies-2704.md`.

## The full path needs the real reading

- The template full path needs the real storyboard reading: every shot gets its own line drawing from its own source frame, and nothing is stubbed.
