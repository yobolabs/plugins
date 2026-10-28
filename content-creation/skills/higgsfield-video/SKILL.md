---
name: higgsfield-video
description: "Use when writing prompts or references for AI video on Higgsfield (Seedance 2.0 / 2.5, Kling O3 / 4.0), remixing a reference ad with a new product, or judging why a generated video ignored the camera, the cuts or the product. Also use when the user mentions \"Higgsfield\", \"Seedance\", \"Kling\", \"remix this ad\", \"video prompt\", \"camera not followed\", \"character sheet\", \"storyboard\", \"product video\" or \"why did it cut\". Bare invocation: ask which style (product-hero, presenter, UGC, cinematic dialogue), then write the prompt for it."
---

# Higgsfield video

Write video prompts and reference sets that Higgsfield models actually follow, and review results against the
source frame by frame. Bare invocation: ask which **style** the video is (table below), load that style's file,
then build the prompt with the layout in this file.

## 1 · Pick the style first

The style decides the references, the camera language and what can go wrong. Load its file before writing.

| Style | Has people | Has voice | File | Status |
|---|---|---|---|---|
| **Product-hero** — the product is the only character (stunt, reveal, transformation) | No | No (music + SFX) | `references/styles/product-hero.md` | Proven in runs |
| Creator product reel — a compilation of one-shot product ads, product fills the frame, bold colour | Sometimes (hands, a model) | No (music) | `references/styles/product-reel.md` | One remix run, lessons from review |
| Presenter — a person talks about the product | Yes | Yes | `references/styles/presenter.md` | Stub, not proven |
| UGC — someone filmed doing something, phone look | Yes | Sometimes | `references/styles/ugc.md` | Stub, not proven |
| Cinematic dialogue — scenes, characters, acting | Yes | Yes | `references/styles/cinematic-dialogue.md` | Stub, from Higgsfield's own tutorial |

A stub holds what is known but untested. Update it with evidence after real runs; never present a stub as proven.

## 2 · The prompt layout (every style)

Higgsfield's own Seedance layout. Write the blocks in this order, headings in capitals, one blank line between.

```
ACTIVE REFERENCES
Image 1 — STORYBOARD — SHOT 1: <what it controls>.
Image 3 — PRODUCT CHARACTER SHEET — <NAME>: <what it controls>. It never sets framing.
Video 1 — VIDEO REFERENCE — <NAME>: <what it controls>.
Preserve these exact bindings. References control their assigned roles; framing and camera movement follow the shot instructions.

SCENE CONTEXT
<length>-second <multi-shot sequence, N shots | single continuous shot>. Exactly <N-1> cut(s), at <times>.
Every shot is ONE unbroken take: no other cuts, no new angles, no close-ups not written below.
<The story in plain order, each shot opened by its camera.>

OPTICS
Keep the lens fixed within each shot.
SHOT 1 (0–2 s): <lens>.

CAMERA
SHOT 1 (0–2 s): <size>, <height + position: head-on / side-on / three-quarter>, <distance>, <lens>; <subject size + place in frame>; <static camera, no movement | the move with direction + speed>.

ACTION TIMING
0–2 s SHOT 1 (Image 1, camera as in CAMERA). <action, second by second; subject's place in frame in brackets>.
HARD CUT.
2–16 s SHOT 2 …

LIGHTING · SOUND · STYLE
<light source + direction + quality>; <music / SFX / voice>; <look, grade, texture>.
```

Every prompt also carries the **core rules** (continuity, references do only their job, camera and time obey the
words, real physics, nothing added, printed text, light) as a `CORE RULES` block after ACTIVE REFERENCES; pictures
get their own short set. Keep them in one constant: `references/principles.md`.

Rules that came from failed runs — each one cost a paid video:

1. **Camera first, never trimmed.** Never cut a prompt to fit a length you invented; Seedance accepted a
   30,000-character prompt. When something must be shortened, shorten the action, never the camera line.
2. **One framing per locked shot.** A static camera cannot reframe. Giving each moment its own size inside one
   take makes the model cut. Write the camera once per shot; moments only say where the subject is.
3. **Count the cuts out loud**: "Exactly 1 cut, at 1.7 s." Otherwise the model adds angles.
4. **Say "static camera, no movement", never "tripod".** The model drew a real tripod under the product.
5. **Three-quarter vs side-on matters.** Side-on reads flat; most real shots are three-quarter. Say which, plus
   distance ("far back, the whole setting in frame").
6. **Every reference states its job and what it must NOT do** ("defines what it looks like — never framing").
   An unlabelled product picture becomes the opening frame.
7. **Time the end-card logo, never strip the product's own print.** The separate logo picture: "shown on its own
   only in the final 2 s". The product's printed design (a can's label, a box's artwork) IS the product: "its own
   labels, logo and text stay exactly as in its pictures". Forbid only ADDED text. A "no logo, no text" rule on
   the character sheet turned a branded can blank.

Camera vocabulary (sizes, angles, lenses, moves) and the wording that works: `references/camera-language.md`.

## 3 · References: what to send

| Reference | Use for | Never use for |
|---|---|---|
| **Character sheet** (product or person: front, three-quarter, side, back on plain grey) | What the subject looks like from every side | Framing — label it so |
| **Product storyboard** (the source's real frames, product swapped in by an image model, 1 paid picture per shot) | Real environment, light, angle, distance, where the subject is | — strongest layout reference we have |
| Line-drawing storyboard traced from the source | Motion path when nothing better exists | Shape — it carries the OLD subject's outline (a mouse came out with car taillights) |
| Video reference (the source ad or its shot) | Camera moves, cuts, timing | Looks — say "never how anything looks" |
| A "hero still" of the product in the scene | Nothing — dropped | It sets the opening framing and is copied as frame 1 |

How to make each one, prompts included: `references/references-and-sheets.md`.

## 4 · Models

| Model | Pictures | Videos | Length | Quality knob | Notes |
|---|---|---|---|---|---|
| Seedance 2.5 reference-to-video | 30 | 10 | 4–30 s | `resolution` 480p/720p/1080p | Best for many references; `generate_audio` defaults true — send it |
| Seedance 2.0 reference-to-video | 9 | 3 | 4–15 s | `resolution` | Runs ahead of the timing on long single takes |
| Kling O3 image-reference | 7 | 0 | 3–15 s | `mode` std/pro/4k | `sound` on/off; prompt over 2,500 chars is cut by Kling |
| Kling O3 video-reference | 4 | exactly 1 | 3–10 s | `mode` std/pro | Needs one video to copy |
| Kling 4.0 reference-to-video | Kling **elements** only | — | 3–30 s | 720p/1080p | Picture links are refused; register elements first |

Request shapes, how to read a model's real limits without paying, and costs: `references/models.md`.

## 5 · Remixing a source video

0. **Analyze first** with `content-creation:analyze-video`: cuts, shots, still vs moving, beats, and a suggested
   structure. Wrong cuts corrupt everything after them.
1. **Read the source** with a video model and ask for the camera like a director (size, height, three-quarter /
   side-on / head-on, distance, lens, subject size and place, direction of travel, move or static).
2. **Find the real cuts** from the pixels, not from the reading; pass them in so no shot crosses a cut.
3. **Purpose → fit → new idea, every scene (a must).** What is each shot FOR (what it makes the viewer feel or
   believe about the product)? Does its place, props and action make sense for the new product? If not, move it to a
   comparable shot in the new product's world with the same purpose, framing, timing and energy (lip-balm ad →
   gelato: jeans pocket ✗ → cooler bag; make-up display → supermarket freezer).
4. **Rewrite the subject** in each beat (plus the re-themed place). The merchant's note says what to swap; it never
   rewords a beat.
5. **Build references** (§3), then the prompt (§2). Draft at 480p; re-render winners at 1080p.

Detail, including cache traps that silently reuse an old reading: `references/remix-workflow.md`.
Driving the merchant's open lab tab for them (one CDP connection, DOM only): `references/lab-driving.md`.

## 6 · Review every result against the source

Never judge from a single frame or a task id. Extract frames from both at matched times, side by side, then a
table: time · source · ours · verdict. Check sound with `ffmpeg -af volumedetect`. Commands and the review
checklist: `references/review.md`.

## Before you send a paid run

- [ ] Style file loaded; references labelled with role + what they must not do
- [ ] CAMERA block present, one line per shot, no "tripod"
- [ ] Cut count and times stated; no length cap you invented
- [ ] End-card logo timed; the product's own printed design kept, only added text forbidden
- [ ] The person who pays approved the run (renders cost real money)
