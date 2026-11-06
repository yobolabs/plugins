# Breakdown to skill — learning techniques from a video

Back to [SKILL.md](../SKILL.md). Use when someone sends a video to **learn from** (edit effects, a format, a
transition style), not to remix. The output is knowledge in three layers:

| Layer | What | Where |
|---|---|---|
| Instance | One video: storyboard table, every technique with timestamps, exact on-screen text | `_context/yobolabs/video-breakdowns/<platform>-<id>-<slug>.md` + a row in `INDEX.md` there |
| Type | One technique: look, layers, timing, build, traps, status | the owning skill's reference, e.g. `content-creation:video-effects` → `references/effects/<slug>.md` |
| Universal | A rule true for every video the skill covers | that skill's `SKILL.md` |

Never put one video's words, names, labels or colours into a type or universal file. Link the breakdown as
`seen in:` evidence instead.

## Steps

1. **Fetch free, no login.** `yt-dlp -o 'source.%(ext)s' --write-info-json <url>`. If the platform hides it, ask
   the owner for the file. Never sign in to fetch.
2. **Store a copy** in yobo prod S3 `yobo-oss-bucket`, key `remix-lab/211/<kind>-<id>/source.mp4` (HeadObject first,
   never overwrite). Note length, size and the first 16 hex of its sha256.
3. **Measure.** Run this skill's `analyze.py` for cuts and beats. Make 2 fps contact sheets
   (`ffmpeg -i source.mp4 -vf "fps=2,scale=270:-1,tile=6x5" grid%02d.jpg`, frame i at t = i × 0.5 s within the
   whole video). Transcribe with Whisper word timestamps. When labels mark sections, read them at 4 fps from a
   cropped strip for exact boundaries.
4. **Read the text exactly.** Post caption, voice-over, and every on-screen instruction or prompt: extract
   full-resolution frames where text appears and copy it word for word. Mark hidden parts `[occluded]`.
5. **Write the breakdown** from `breakdown-template.md`: persistent layers, then one row per technique with its
   time range and what the viewer sees.
6. **Name each technique** and match it to an existing type file. Same technique in two videos = one file with
   both breakdowns under `seen in:`. A new technique = a new type file with `status: stub`.
7. **Plan, then approve.** Send the technique list and the file layout to the domain lead before writing skill files.
8. **Write.** Type files per the owning skill's template; universal lessons (true for every video) into its
   SKILL.md. Bump the plugin version, commit, push.
9. **Prove** the most-used techniques on a free local clip. Change `status:` to `proven <date> <clip>` only after
   looking at a frame strip, and save the strip under `_context/yobolabs/video-breakdowns/proof/`.
10. **Index.** Fill the row in `video-breakdowns/INDEX.md` (techniques → skill refs, status).

Repeatable checklist: `_context/_runbooks/yobo-video-breakdown.md`.
