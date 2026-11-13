# Type: screens (phone / app / website shown)

Back to [SKILL.md](../../SKILL.md). Applies inside any other type when a screen appears.

- Storyboard and video show a **phone held by a character**, close-up, phone about 2/3 of the frame, held steady, screen a flat chroma green: "a smartphone whose whole screen is plain flat bright green (#00FF00) with nothing on it, held upright, screen facing the camera".
- The merchant's real screenshot is **keyed in afterwards**, one still per phone shot, median corners, full bleed, at 1080p (upscale the draft first). Never a full-frame screenshot; never model-drawn screen text.
- The review checks green and keyable; a laptop with garbled text instead of a phone is a fail.
- Needs step asks no screenshot or logo up front; keying is a post step.
- With no people in the ad, one pair of hands holds the phone; never a phone standing or lying on its own.

## Detection and keying

- Screens are a fact beside the ad type, not a type of their own. One classification over every scene's words decides it; the keyword list is only a hint and the fallback when the classifier returns nothing. A run read before this existed is detected on first read and stored back.
- The screens picture rule is data: it lives in a config row read into the type rules, never in a code string, so it can change without a release.
- Every owned read of a run carries the ad type and how it was read beside the screens fact, and a weak fit does not repeat the type.
- The own-screen needs row stays a prop row. A location or background row would become the merchant's set, so the source's website-screen background must never reach it. The row is keyed after the join and never asked up front.
- The screen is keyed inside the join, never as its own job. The phone-screen runner bills with no bill item, so a separate start would need its own go and fund another video. The join input carries the screen key: the screen file, the spans of live scenes in the join's timeline, and one frame of pad.
- The screenshot is the merchant's own, found first: the picture chosen on the own-screen row, else one classification over the org's image files for a screenshot of the business's own site or app, above a confidence bar. Below the bar the draft stays green and the same message asks for the screenshot. A late photo binds to the own-screen row and triggers one free system re-join with no join-started line.
- Never a half-keyed phone. After keying, scan only the screen's edge ring for the key colour inside the held range, and the whole screen on the frames just past each end. A hit means an unkeyed join with a recorded reason and a missed-screen record.
- The agent's read of a run carries the phone fact on every read: keyed, or green with the reason. It is a fact to state, never a block.
