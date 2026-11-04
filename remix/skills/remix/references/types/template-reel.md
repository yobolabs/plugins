# Type: template reel (ad beside a prompt panel)

Load when the source ad is a "template" post: the ad plays in one part of the frame, and a static panel beside it
shows the prompt that made it (often with a small product photo and a "comment X for the prompt" line).

## What is different

- **The panel prompt is the script.** Read it with the transcribe function (`panel_prompt_reader`, one call on the
  full-height side strip, ≤420 px wide, ≈35 s). It pre-fills the lab's Prompt box; the team edits it there.
- **The script decides the remade parts.** Every scene overlapping a timed line that names the product (@Image1,
  product, logo, branding, label, packaging) is remade, even where the reading saw no product.
- **Clip to the ad area.** Kept clips, remade parts and held pictures are all cut to the ad area (pixels that change
  across frames) and resized to a standard shape. Never send the panel as an image: its product photo wins.
- **Check how the product appears.** Template reels often print the product on props (flyers, posters, a shirt
  pocket). That is an indirect appearance: no swap, use the storyboard pipeline (SKILL.md → "Swap only when the
  product is shown as itself").

## Worked example (2026-11-04)

Flyer reel DfICvQhO4UL: woman, taxi gust, flying flyers printed with the advertised cup and "SAVE THE DATE 11.27",
ending on a held flyer close-up. Panel prompt 1543 characters. Runs 1–2 as a swap (Seedance 2.0 480p) failed:
the flyers kept the original cup art and words even with the edited script and a product sheet; the held picture kept
"SAVE THE DATE". Best swap plan the lab found: video 0–6.8 s (7 s billed) + 1 picture for 6.8–8.9 s. Outcome: this
reel goes to the storyboard pipeline (Sean). Learnings: Remix KB `…template-reel-remix-failed-panel-prompt-9fd8.md`,
`…seedance-copies-2704.md`.
