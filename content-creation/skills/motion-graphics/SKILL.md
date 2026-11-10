---
name: motion-graphics
description: "Use when making a no-footage motion ad for an app, product or brand: shapes, UI cards, phones, logos, text and 3D products animated in code (Remotion, WebGL, Blender headless), with no camera footage and no AI video generation. Covers the method (ingredients folder, numbered storyboard approved first, build, sound last), the look rules (every shot transforms into the next, dead-centre action, always motion, one key light, shallow depth of field) and a library of moves. Also use when the user mentions \"motion graphics\", \"SaaS animation\", \"app ad animation\", \"product animation\", \"logo animation\", \"shape morph\", \"no cross-dissolve\", \"word slide-up\", \"puppet animation\", \"Blender product ad\" or \"end on this frame\". Bare invocation: ask for the brand assets, then write the numbered storyboard and wait for approval."
---

# Motion graphics (no-footage motion ads)

A motion ad drawn entirely in code: shapes, real UI screenshots, devices, logos, text and 3D product renders.
No filmed take (that is `content-creation:video-effects`) and no AI video generation, so no credits per shot.
Bare invocation: collect the ingredients (§ 1), write the numbered storyboard (§ 2), wait for approval.

Each move has its own file in `references/moves/<slug>.md` (index in § 6). Load only the moves you use.
One video's names, words and colours live in its breakdown under `_context/yobolabs/video-breakdowns/`, never here.

## 1 · Ingredients folder (before anything)

One folder per ad. Claude works only from what is in it.

| Ingredient | Rule |
|---|---|
| Logo | High-res PNG or SVG from the brand. Never redraw a logo from shapes or crop it from a screenshot: it is never exact |
| UI screenshots | Real screens of the real app, full resolution. A made-up UI looks fake |
| Product reference | Photos of the real product from several sides (3D work), plus the real thing to check against (§ 5) |
| Existing brand art | Illustrations or AI images the brand already owns; cut out and puppet them (`puppet-cutout`) |
| Sound library | Licensed SFX files in the folder; Claude places them (§ 4) |
| Music | A licensed track of the target length, or none until § 4 |

## 2 · Numbered storyboard, approved before any build

Ask for a numbered storyboard of the whole sequence: one frame per beat, a caption each, rendered as a grid.
Approve or change it **before** any animation; changing a board is cheap, re-rendering is not.

While reviewing, for every pair of neighbouring frames ask: **"how does this shape turn into that shape?"** and
write the answer into the board (e.g. "circle squares off into the app icon"). A pair with no answer becomes a
cross-dissolve, which is the default and looks cheap.

| # | t (s) | On screen | Transform into next | Move | Text |
|---|---|---|---|---|---|

## 3 · Look rules (every motion ad)

1. **Every shot transforms into the next.** One hero object carries through: it morphs, opens, zooms or flips
   into the next frame. No cross-dissolves, no plain cuts between frames inside the ad.
2. **Action dead centre.** The hero object sits in the centre; effects happen around it. The eye never hunts.
3. **Always some motion.** At least a slow camera push or drift in every frame; a still frame feels dead.
4. **Text: words slide up in place, one after another.** No bouncing, no per-letter fades (`word-slide-up`).
5. **Shallow depth of field** on 2.5D/3D scenes: foreground sharp, background blurred, so it reads as filmed.
6. **One key light** for 3D products, in a dark void. Lights everywhere make it flat and plastic.
7. **Real assets only** (§ 1). Fake UI or a redrawn logo makes the whole ad read as fake.
8. **End on the brand.** Logo + wordmark + one CTA line, held at least 1.5 s.

## 4 · Sound last

Picture first, sound after the picture is locked. Re-timing the picture after sound breaks the sync.

- **SFX:** place files from the folder's library on each transform (whoosh on a morph, click on a tap, riser into
  the logo). Claude reads the frame times from the storyboard.
- **Voice-over:** write the script AFTER the build, to the exact length of the render, one line per beat; then
  generate it (ElevenLabs connector).
- **Music:** write a prompt for the exact length and mood (Suno), mix under the VO, duck under speech.
- ElevenLabs and Suno are paid. Never run them without the video-production lead's clearance and a cost line.

## 5 · Build and check

| Engine | Use for | Tool |
|---|---|---|
| 2D code | Shapes, cards, UI, text, logos, devices | Remotion: `content-creation:remotion-overlays` → `src/motion/` (opaque mp4, full frame) |
| Puppet | Existing illustrations brought to life | Remotion + cut-out layers with pivot rigs (`puppet-cutout`) |
| 3D product | A physical product as the hero | Blender headless, driven by a Python script (`product-void-3d`); not installed on the Macs yet |

- Render a 480p draft first; look at a contact sheet (2 fps) before the full render.
- **Check against the real product and the real app**, frame by frame: shape, buttons, colours, stems, text. 3D
  first passes get the shape and part placement wrong.
- Proof entry: `remotion-overlays/src/motion/root-motion-proof.tsx`
  (`npx remotion render src/motion/root-motion-proof.tsx <id> out.mp4`).

## 6 · Move index

Each file: when to use it, look, timing, build, traps, a frame strip, and status.

| Slug | Move | Status |
|---|---|---|
| `shape-morph` | One centred shape changes state (dot → circle → rounded square → card → pill); each state is the next shot | proven 2026-11-10 |
| `word-slide-up` | Words rise into place behind a mask, one after another; leave the same way | proven 2026-11-10 |
| `logo-build` | Logo draws itself from strokes, or the icon lands and the wordmark slides out from behind it | stub |
| `card-wall-dolly` | A card joins a tilted 3D wall of cards; the camera dollies across it | stub |
| `device-land` | A phone settles in the centre, real UI on its screen, then pushes into the screen | stub |
| `puppet-cutout` | Cut-out characters from existing art, moved by a pivot rig, inside a flat scene | stub |
| `product-void-3d` | A 3D product in a black void, one key light, slow turn, shallow depth of field | stub |
| `stat-callout` | A big number + small label beside the product, one per beat | stub |
| `silhouette-flip` | The product (or frame) flattens to a pure silhouette; black and white swap | stub |
| `end-on-frame` | The animation ends on a given still, so it match-cuts into real footage | stub |

Related: footage edits → `content-creation:video-effects` (`phone-mockup`, `reel-wall` are their footage cousins);
transparent overlays for CapCut → `content-creation:remotion-overlays`; remixing an existing ad → `remix:remix`.

## 7 · Rules that never change

- No AI video generation in this skill. A shot that needs it belongs in the remix pipeline.
- Moves are general building blocks. Never name a move after one brand or one video.
- A move is `proven` only after a rendered frame strip was looked at; the strip lives in
  `_context/yobolabs/video-breakdowns/proof/`.
