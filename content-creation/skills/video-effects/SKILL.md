---
name: video-effects
description: "Use when adding edit effects to a talking-head or creator video after it is filmed: captions timed to each word, text behind the speaker's head, cut-outs, zooms, whip pans, colour grades with a before/after slider, magazine covers, prompt bars, screenshots, phone mockups, reel walls and similar motion graphics, built with Remotion and FFmpeg from one real take. Also use when the user mentions \"video effects\", \"edit effects\", \"text behind head\", \"word captions\", \"snap zoom\", \"dolly zoom\", \"whip pan\", \"green screen\", \"recursive zoom\", \"magazine cover effect\", \"colour grade\", \"slider reveal\", \"reel wall\" or \"make it look edited\". Bare invocation: ask for the video and the effects wanted, then write the storyboard table first."
---

# Video effects (post-production on a real take)

Turn one filmed take into an edited video: captions, cut-outs, zooms, grades and motion graphics. Every
effect here is an **edit of real footage**. None needs AI video generation, so none costs credits.
Bare invocation: get the video, ask which effects, then write the storyboard table (§ 1) and wait for approval.

Each effect has its own file in `references/effects/<slug>.md` (index in § 6). Load only the files for the effects
you will use. One-video detail (a creator's exact words, labels, colours) lives in that video's breakdown file,
never here.

## 1 · Storyboard first, then edit

Before touching footage, write the whole video as a table and get it approved:

| # | t (s) | Line said | On screen | Effect file | Tool |
|---|---|---|---|---|---|

- One row per spoken line that gets an effect. `t` = start of the trigger word (from word times, § 2).
- The human fixes the plan in the table. Only then build. Changing a row is cheap; re-rendering is not.
- Store the table next to the output (`storyboard.md`). It is also the QC checklist (§ 5).

## 2 · Inputs (every effect draws from these)

| Input | How | Used by |
|---|---|---|
| **Word times** | Whisper with word timestamps: `uvx --from openai-whisper whisper in.mp4 --model small --word_timestamps True --output_format json --fp16 False`. Fix misheard names by hand | captions, every word-triggered effect |
| **Person matte** | Per-frame alpha of the speaker from a free local segmentation model (proven: `uvx --from "rembg[cli,cpu]" rembg p -m u2net_human_seg <frames> <out>`, ≈ 0.3 s/frame on CPU); save as a PNG sequence or ProRes 4444 with alpha at the source fps and size | text behind subject, cut-outs, background swaps, frame escape/break |
| **Plate** | The source take, trimmed of pauses if asked, at its native fps (usually 30) and 1080x1920 | all |
| **Clean background plate** | The room without the speaker: the matte's hole filled by a free local inpainting model, one still if the camera is locked | effects that move the background apart from the speaker (dolly zoom, frame break) |
| **Assets** | Real screenshots, logos, downloaded reels (yt-dlp, no login), brand colours and fonts from props | cards, callouts, walls |

- Measure cuts and beats with `content-creation:analyze-video` when music matters. Talking-head edits cut on
  **words**, not on beats.
- Matte quality decides every matte effect. Check edges on hair and hands on 3 frames before building on it.
  A matte that flickers frame to frame shows as a shimmering halo; smooth it over time or pick a video model.

## 3 · Layer stack (same order for every effect)

1. **Plate** (the take, possibly scaled, moved or graded)
2. **Background** (replacement bg, grid, studio, colour field) — only when the effect swaps the bg
3. **Text or graphics behind the speaker**
4. **Person matte** (the speaker cut out, placed over layers 2–3)
5. **Overlays** (cards, labels, bars, stickers, UI)
6. **Captions** (always on top, never covered)

Effects that move the whole frame (zooms, whip pan, frame shrink) transform layers 1–4 together, so the matte
must get the same transform as the plate.

## 4 · Timing rules

- An effect starts on its **trigger word** (word time from § 2), not on a round second.
- Typical length 1.2–2.5 s per effect in a list video; hold longer only when the line needs reading time.
- Hard cut in and out unless the effect file says otherwise. Entrances: spring or ease-out, 6–10 frames at 30 fps.
- Elements in one effect arrive **one per beat or one per word**, never all at once.
- One effect at a time. Persistent layers (captions, a header, a PiP card) stay on and never collide with it.
- When an effect puts its own text in a band (cover lines, ticker strips, a card), move the caption band clear of
  it or hide captions for that effect. Captions on top of effect text read as clutter.

## 5 · Build and check

- **Remotion** for every graphic and composite (house stack: `content-creation:remotion-overlays` — animate only
  with `useCurrentFrame` + `interpolate`/`spring`; props carry brand colours and copy; transparent ProRes 4444).
- **FFmpeg** for grades, blurs, keying, scaling and the final mux.
- **Proven components** live in `content-creation:remotion-overlays` → `src/effects/` (`WordCaptions`, `PromptBar`,
  `GradeSliderReveal`, `TextBehindSubject`, `MagazineCover`, `matte.tsx`). Proof entries `src/effects/root-proof1.tsx`
  and `root-proof2.tsx` show the wiring: `npx remotion render src/effects/root-proof1.tsx <id> out.mp4 --public-dir <media dir> --props=<json>`.
  Keep media (plate, matte frames) in a scratch `--public-dir`, never in the plugin repo.
- First render on a fresh install downloads headless Chrome: run ONE render alone before any parallel renders.
- Assemble in Remotion when an effect needs the plate and the matte together; overlay-only effects can render
  as transparent `.mov` for `content-creation:ad-engine` / CapCut.
- **QC every row of the storyboard:** grab a frame strip around each trigger word
  (`ffmpeg -ss <t-0.3> -t 1 -i out.mp4 -vf fps=10,scale=270:-1,tile=10x1 strip.png`) and check: effect on the word,
  captions readable, nothing covers the face, matte edges clean, no text cut off at the 1080 width.

## 6 · Effect index

Every effect file opens with three fields:

- `status:` `stub` (written from source videos, not yet rendered) or `proven <date> <clip>` with a proof strip.
- `seen in:` links to the breakdown files where the effect appears — evidence only, never rules.
- `tools:` the skill that builds it (`content-creation:remotion-overlays` components, FFmpeg, person matte).

**Each effect is described in one place: its file here.** Tool skills (remotion-overlays, capcut,
higgsfield-video) link to the effect file instead of describing the effect again. A new video's techniques go
through `content-creation:analyze-video` → `references/breakdown-to-skill.md`: match an existing effect file or
add one, and put only universal lessons in this SKILL.md.

| Slug | Effect | Needs matte | Status |
|---|---|---|---|
| `word-captions` | Captions timed to each word (single word, or phrase with active word) | no | proven 2026-11-07 |
| `text-behind-subject` | Big text placed behind the speaker's head | yes | proven 2026-11-07 |
| `matte-reveal` | Background drops to a transparency checkerboard, only the speaker stays | yes | stub |
| `magazine-cover` | Frame becomes a magazine cover, masthead behind the head, cover lines per beat | yes | proven 2026-11-07 |
| `prompt-bar` | A chat prompt bar types the instruction, then sends; also a comment bar CTA | no | proven 2026-11-07 |
| `screen-card` | A real screenshot, document or price card floats in as a card | optional | stub |
| `tool-callout` | Logo + name label, repo card, or struck-out app icon on the spoken word | no | stub |
| `pip-reference-card` | Another video in a rounded card top-left, grows when discussed | no | stub |
| `title-cloud` | Opening title with item names flying in as tags | no | stub |
| `chapter-label` | Numbered label + segmented progress bar for list videos | no | stub |
| `effect-tally` | Checklist card counting items to the total | no | stub |
| `orbit` | Small icons orbit the speaker's head | optional | stub |
| `chat-takeover` | Frame shrinks into a chat window with the video inside | no | stub |
| `frame-escape` | Video becomes a tilted photo; the speaker breaks out over its edge | yes | stub |
| `snap-zoom` | Hard punch-in to a close-up, no ease | no | stub |
| `checklist-pop` | Pills with ticks pop in one per word | no | stub |
| `headline-storm` | Tilted news-ticker strips stack over the frame | no | stub |
| `zoom-portal` | Circle inset of the speaker; the camera zooms through it | no | stub |
| `growth-curve` | Chart line climbs behind the speaker with a counting badge | yes | stub |
| `studio-reveal` | Background goes black, studio lights and an ON AIR sign appear | yes | stub |
| `broll-overlay` | Frame shrinks into an editor; a B-roll clip drops on the timeline | no | stub |
| `paper-cutout` | Flat graphic background, speaker with a white sticker outline | yes | stub |
| `dolly-zoom` | Speaker stays the same size while the background stretches | yes | stub |
| `liquid-glass` | A glass blob slides across and refracts the picture | no | stub |
| `zoom-through-cut` | Fast blurred push-in that lands on the next take | no | stub |
| `green-screen` | Background keyed to green, then swapped for a scene | yes | stub |
| `frame-break` | Cracks, then the frame shatters into shards | yes | stub |
| `digital-zoom` | Camera viewfinder UI with stepped zooms | no | stub |
| `phone-mockup` | Video shrinks into a phone frame or a reels UI | no | stub |
| `recursive-zoom` | Shot shrinks into a picture of itself N levels, then push through with spin + blur | no | stub |
| `whip-pan` | Fast horizontal motion-blur slide between shots | no | stub |
| `grade-slider-reveal` | Warm grade with a vertical before/after wipe line and handle | no | proven 2026-11-07 |
| `grade-panel` | Moody grade with an on-screen curves/sliders panel moving on each word | no | stub |
| `reel-wall` | Shot shrinks to the centre of a 3×3 grid, 8 reels pop in one per frame | no | stub |

## 7 · Rules that never change

- **No paid generation** without the owner's OK. These effects need none. If a shot ever must be generated, use
  Seedance, never Kling (`content-creation:higgsfield-video`).
- **Real over drawn.** A real screenshot of a tool looks better than a drawn mockup of it; use the real one.
- **Plain caption text with a soft shadow** reads cleaner than text in a coloured box.
- Restraint: big zooms and recursive zooms tire fast. One showy transition per video; the rest hard cuts or whip pans.
- Never cover the face or the active caption with an effect element.
- Download reference reels with yt-dlp, free, no login.
