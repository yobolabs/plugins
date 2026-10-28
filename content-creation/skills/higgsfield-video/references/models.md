# Models on Higgsfield

Back to [SKILL.md](../SKILL.md). Read when picking a model, building a request, or checking a limit.

## Request shapes (platform API paths)

| Model | Path | Body |
|---|---|---|
| Seedance 2.5 reference-to-video | `/bytedance/seedance-2.5/reference-to-video` | `prompt`, `image_urls` ≤30, `video_urls` ≤10, `audio_urls` ≤10, `duration` 4–30, `resolution` 480p/720p/1080p, `aspect_ratio` 16:9 4:3 1:1 3:4 9:16 21:9, `generate_audio` (default true), `bitrate_mode` |
| Seedance 2.0 reference-to-video | `/bytedance/seedance-2.0/reference-to-video` | as above; `image_urls` ≤9, `video_urls` ≤3, `duration` ≤15 |
| Kling O3 image-reference | `/kling-video/o3/image-reference` | `prompt` (≤2,500, longer is cut), `image_urls` ≤7, `duration` 3–15, `mode` std/pro/4k, `sound` on/off (default off), `aspect_ratio` 16:9 9:16 1:1, optional `first_frame_url` / `last_frame_url`, `multi_shots` + `multi_prompt` (1–6 shots, each `{prompt, duration}`) |
| Kling O3 video-reference | `/kling-video/o3/video-reference` | `prompt`, `video_urls` exactly 1, `image_urls` ≤4, `duration` 3–10, `mode` std/pro |
| Kling 4.0 reference-to-video | `/kling-video/v4.0/reference-to-video` | `prompt` + `elements` (integer Kling element ids, required). Picture links are not accepted |
| Kling 4.0 image-to-video | `/kling-video/v4.0/image-to-video` | `prompt` + `image_url` (one start frame), 3–30 s, 720p/1080p |
| GPT Image Flare (pictures) | via the Higgsfield image tool | `prompt`, `image_urls` ≤16, `resolution` 1k/2k/4k, `aspect_ratio` auto 1:1 3:2 2:3 4:3 3:4 16:9 9:16 21:9, `quality` low…max |

Seedance reference-to-video cannot pin the first frame. To force an exact opening, use a model that takes
`first_frame_url` (Kling O3) or put the opening in the storyboard.

## Read a real limit without paying

Send a deliberately invalid request: keep one required field the wrong type (for example `"duration": "bad"`) so
validation always fails, and vary only what you are testing. The error names the first failing field. Example:
a 30,000-character prompt with `duration: "bad"` failed on `duration`, so the length passed. Never send a body
that could validate — it starts a paid job.

## Choosing

| Need | Model |
|---|---|
| Many references (storyboards + sheets + props), up to 30 s | Seedance 2.5 |
| Copy one video's motion closely | Kling O3 video-reference, or Seedance with the video in `video_urls` |
| Native multi-shot with per-shot prompts | Kling O3 `multi_shots` |
| Exact first frame | Kling O3 `first_frame_url` |

## Cost habits

- Draft at 480p (Seedance) or `std` (Kling); re-render only winners at 1080p / `pro`.
- A paid run needs the payer's OK. Free checks: reading the source, building sheets locally, invalid-body probes.
