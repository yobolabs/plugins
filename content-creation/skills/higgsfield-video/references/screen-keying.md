# Screen keying: putting a real screenshot into a green phone

Back to [SKILL.md](../SKILL.md) §2. Read before keying any app, chat or website screen into a generated video.
Every rule here was learned on a real run where the human rejected the result until it was fixed.

## The rules

| Rule | Why (what went wrong without it) |
|---|---|
| **Only the merchant's own screenshots.** Never redraw, restyle or invent a screen (no "big-type" redesigns, no made-up app pages, no ad picture standing in for a chat). | Made-up screens were rejected on sight: "you're still not using our images". |
| **A phone shot is ONE still frame**: take the middle frame of the shot and hold it for the whole shot. | The held phone barely moves (median 0 px per frame), so a still loses nothing; a moving shot only adds jitter. |
| **Pin the screen once**: measure the screen's corners on every frame of the shot, take the **median**, key once. No scroll, no per-frame re-fit. | Per-frame corner fitting shook the screen 0.7–1.7 px per frame on a still phone, and a slow scroll read as "the screen keeps moving". |
| **Corners from the edges, not a box**: fit a straight line to the middle ~64% of each of the 4 screen edges (skip the rounded corners and finger notches) and intersect them. Take the outline with every pixel (OpenCV `CHAIN_APPROX_NONE`). | A rotated-box fit misses the phone's tilt and perspective. A compressed outline (`CHAIN_APPROX_SIMPLE`) leaves ~6 points on an edge, too few for a steady line. |
| **Full bleed, like print**: warp the screenshot's content to the exact screen corners, and let its edge pixels run on past the edge (`warpPerspective` with `BORDER_REPLICATE`). Show it wherever the source was green: the green mask dilated ~9 px and feathered. Despill only what is left. | Clearing green to black (despill without bleed) left black blocky borders and green slivers at the screen edge. |
| **Catch every green**: key the dark and pale greens of the anti-aliased edge too (HSV hue 40–85, saturation ≥ 60, value ≥ 40), not only the bright green. | Thin green lines stayed along one side of the screen. |
| **Fit the screenshot's width to the screen, keep its top** (status bar, chat header), crop the bottom. | Generated phones are not iPhone-shaped; a cover crop cut the sides or the header. |
| **Key at 1080p**: upscale the draft video first (lanczos), never soften the screenshot. | In a 480p draft the screen is ~145 px wide: an 8× shrink turns the merchant's screenshot into mush. |
| **Pad each phone range by a frame** on both ends. | The first frame of a phone shot stayed green. |
| **An action on the screen needs its own screenshot** (the button before and after the tap). A still cannot fake a press. | A "Done" beat needs a real approve or done screen from the merchant. |

## Check before showing

1. Green scan at full resolution over every frame: **0 frames** with green left.
2. Frame-to-frame change inside each phone shot ≈ 0 (only the cut between two shots changes).
3. Close-up crop of every phone shot, looked at by eye: no edge, no sliver, no black border, text readable.
