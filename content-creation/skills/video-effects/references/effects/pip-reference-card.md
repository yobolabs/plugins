# Effect: PiP Reference Card

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-De8SPjEAuV0-claude-edited.md` (0–2.5 s big; small for most of the video).

**Look:** A rounded card in the top-left plays another video (the one being reacted to). It stays small most of the time and grows when the speaker talks about it, then shrinks back.
**Use when:** Reacting to, reviewing or remaking another clip; "this guy did X, here's how".

## Layers (bottom → top)
1. Plate (talking head, framed so the top-left is empty wall).
2. Card: the reference video, muted, `object-fit: cover`, corner radius 4% of card width, shadow 0 12px 32px rgba(0,0,0,.35). No border.
3. Pop-ons on the card (price card, icon strike, chat bubble): see [tool-callout.md](tool-callout.md).
4. Captions.

## Sizes
- Big: 50% width × 55% height, top-left at (1%, 1%).
- Small: 20% width × 22% height, left edge at x 1%, y ≈ 33%.

## Timing
- Big on its trigger words (when the speaker names or points at the reference), small otherwise.
- Size change: `spring({damping: 16, stiffness: 140})`, ~12 frames, animating width, height and position together. Anchor the transform at the top-left.
- The reference video keeps playing through size changes; it does not restart.

## Build
- Remotion: `<PipCard src states={[{from, to, size: "big"|"small"}]}>`; one `<OffthreadVideo muted>` inside a div whose box is interpolated between the two size presets.
- FFmpeg (fetch + trim the reference): `yt-dlp -f "bv*[height<=1280]" -o ref.mp4 <url>` then `ffmpeg -ss <start> -t <dur> -i ref.mp4 -an -c:v libx264 ref-trim.mp4`.

## Inputs
- Person matte: no. Word times: yes (big/small switches). Assets: the reference clip (downloaded), trimmed.

## Traps
- Reference audio leaks under the voice. Always mute it (`-an`).
- The big card covers the speaker's face if the plate is centred. Frame the plate right-of-centre, or keep big ≤ 2.5 s.
- Rights: the reference is someone else's content. Use short excerpts, credit "<handle>", and check with the user before posting.
