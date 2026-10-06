---
name: tutorial-page
description: Use when building a "What's new" or how-to tutorial page with real screenshots of a live app (Cadra, Yobo, CRM, Slides), built as a DRAFT Slides microsite plus an offline HTML copy. Triggers include "tutorial page", "what's new page", "release tutorial", "feature tour", "screenshots are hard to see". A bare invocation builds a draft from the last tutorial's session file and never publishes.
---

# Tutorial Landing Pages (What's new / how-to)

Builds a tutorial page that teaches users what changed and how to use it. Each section is:
a plain intro, numbered steps, and **one screenshot per step** with an orange ring on the exact
control. The page is a Slides microsite (draft), built through the `landing-page` skill's API.

It teaches users of any app we build — Cadra, Yobo, CRM, Slides. The page itself is always a
Yobo Slides microsite, which is why this skill lives next to `landing-page` in this plugin.

The reader is a non-author (sales, ops, a merchant). Two rules decide whether they can follow it:
**screenshots must be readable** (§3) and **walkthrough first, developer notes last** (§4).
A page that breaks either one gets rejected — it happened (see Gotchas).

## Before you start — read the last tutorial

Good tutorials were worked out the hard way; do not start from a blank page.

1. Read the newest tutorial session file: `ls -t <repo-root>/_ai/sessions/*tutorial*.md | head -3`
   (first one: `2026-09-29-[cadra,crm]-whats-new-tutorial.md` — read its User Steering and
   Lessons Learned). The owner's corrections there apply to every tutorial.
2. Open the last approved page and copy its **look and structure**: badge, numbered section
   title, plain intro, bold step text above each picture, boxed screenshots, GIFs for waits.
   Quality bar: "What's new in Cadra" (`tech.pages.yobolabs.ai/whats-new-in-cadra`, source
   `_context/cadra/_tutorial/2026-09-29/`). Copy its look, not its shot size: its full-window
   shots predate the legibility rule in §3.
3. **Use this pipeline, not a one-off renderer.** `tutorial.json` → `build_page.py` (Slides) and
   `render_offline.py` (offline copy) — both print the same components, so every tutorial looks
   the same. Missing a feature (a caption, a new block)? Add it to `build_page.py`. Never write
   a custom HTML renderer for one page; the second Link in bio draft did and had to be redone.

**Default:** build a DRAFT end to end and hand back the preview link. Publishing is a one-way
door (public page) — only on the user's explicit word.

Load `yobolabs:landing-page` too — it owns the microsites API, `lp.mjs`, and the Puck catalog.

## Bundled scripts

| Script | Runs where | Does |
|---|---|---|
| `${CLAUDE_PLUGIN_ROOT}/skills/tutorial-page/scripts/capture.py` | inside browser-use `browser_exec` via `exec(open(...).read())` | pinned-tab helpers: `tabs`, `pin`, `goto`, `rect`, `clk`, `typ`, `key`, `mark`, `shot(name, crop=rect)`, `blur_text`, `frame`. Viewport 1100×720 at 2x |
| `${CLAUDE_PLUGIN_ROOT}/skills/tutorial-page/scripts/build_page.py` | shell | `tutorial.json` + `uploads.json` → Puck `content.json`. Shows each PNG at its own size (max 1.5× zoom), never stretched |
| `${CLAUDE_PLUGIN_ROOT}/skills/tutorial-page/scripts/render_offline.py` | shell | same spec → ONE self-contained HTML file (images inlined) via `build_page.build()`. No Slides key needed: use it for the legibility check and as the review copy in `_context/_explainers/` |
| `${CLAUDE_PLUGIN_ROOT}/skills/tutorial-page/scripts/check_legibility.js` | in the rendered page | smallest readable font per screenshot at the current width; pass = every one ≥ 12px |
| `${CLAUDE_PLUGIN_ROOT}/skills/tutorial-page/scripts/upload.py` | shell | uploads every PNG/GIF the spec uses to Slides, caches URLs |
| `${CLAUDE_PLUGIN_ROOT}/skills/tutorial-page/scripts/make_gif.sh` | shell | frames dir → looping GIF (ffmpeg) |

Working folder (not a repo `src/`): `<repo-root>/_context/<app>/_tutorial/<YYYY-MM-DD>/` holding
the PNGs, `tutorial.json`, `uploads.json`, `content.json`, `preview/` proof shots.

## Workflow

### 1. Feature list — only what is live

1. Start from the latest release notes (`_context/<app>/_releases/`), not memory. Take only items
   marked live on prod. Confirm each against git (`origin/main`) or the shipped ledger.
2. Post a short numbered list to the user. **They trim it.** Their framing wins — e.g. "help
   the team improve what they already do", not "show off the product".
3. Ask the product owner how each feature *actually* behaves before writing it. This session's
   first draft got three wrong: a new feature described as a regression, a two-place setup
   that is really automatic, and a "fixed" feature that was still broken.

### 2. Which site and which account

- "Live site" = the production host the user names. Confirm the host and the org first.
  A white-label domain can alias the same deploy.
- Use the user's named Chrome profile for that org. Open the URL in that profile first:
  `open -na 'Google Chrome' --args --profile-directory='<profile>' '<url>'`, then `pin()` to it.
- Capture read-only. Opening menus and dialogs is fine. **Any Save, Create, Generate, Send or
  Connect is a prod write** — say so first and use a test agent or test record. Report every
  side effect afterwards (table: what, where, undo).

### 3. Screenshots — one per step, ringed, readable

In `browser_exec`:

```python
exec(open("${CLAUDE_PLUGIN_ROOT}/skills/tutorial-page/scripts/capture.py").read())
OUT = "<repo-root>/_context/<app>/_tutorial/<date>"
pin("<app-host>/agents")                 # attach by URL substring (refuses if 2 profiles match → tabs(), target_id=)
goto("https://<app-host>/agents")
r = rect("New space")                     # exact visible text → [x,y,w,h]
mark([r + ["2"]]); shot("s3-2-new-space-menu", crop=r); unmark()   # crop = the control + 28px of context
```

#### Screenshots must be readable (hard rule)

A full-window capture dropped into a text column shrinks 12px UI text to about 6px and is mostly
empty space. The owner rejected a whole page for this. Every shot follows all five:

1. **Small viewport.** Keep capture.py's 1100×720 at 2x. Never widen it "to fit more in".
2. **Crop to the action.** `shot(name, crop=rect)` — the control the step is about plus enough
   context to locate it (its label, its neighbours). No shot may be mostly empty space. Keep a
   crop ≤ ~340 CSS px wide so it still reads on a phone. Wide control (a bar with a gap in the
   middle)? Pass two rects and split into two steps, or cut the empty middle out and say so in
   the caption. Phone previews: crop to the phone and show it at phone size.
3. **One numbered ring per shot**, and the number is the step number inside its section
   (`mark([r + ["3"]])` for step 3 — `build_page.py` numbers steps per section). Never four
   rings on one image — that is four steps. Leave ~20px free above-left of the ringed control
   so the badge covers no text.
4. **Instruction above the image.** The step text ("Click Link in bio in the left menu") comes
   first, then its picture. One action per step, one picture per step.
5. **Legibility test, mandatory.** Open the rendered page at 1440 wide and at 390 wide, run
   `check_legibility.js` (`J(open(".../check_legibility.js").read())`), and look at the proof
   shots yourself. The smallest UI text a reader must read in any screenshot is ≥ 12 CSS px at
   both widths (`min` in the output; set `"minfont"` on a step whose shot has smaller UI text
   than 12px). A shot that fails is cropped tighter or split in two. Report both numbers.

No real shot for a step (login blocked, feature flag off)? Say so and use a clearly labelled
drawing built from the component's own layout and wording, captured with the same `mark()` /
`shot(crop=)` helpers, and labelled through the step's `"note"` ("Drawing with demo data, not a
screenshot."). Use `"note"` too when the empty middle of a wide bar was cut out. Never fill the
gap with an unreadable capture, and list those steps in the hand-back.

- Name shots `s<section>-<step>-<slug>` so the spec reads in order.
- **Every step the text mentions must be visible in its shot.** If a step says "click your
  initials", the menu is open in the shot. Re-audit every section before calling it done —
  missing visuals was the user's #1 complaint.
- Ring = 3px orange border + numbered badge. One ring per shot (rule 3 above); if a step truly
  needs two controls, group them in one ring.
- Re-measure `rect()` **after** the UI settles (a dropdown opening shifts the layout).
- Blur before every shot: `shot()` runs SCRUB (emails, phone numbers, `sk_` keys, quoted
  customer text). Add `blur_text(r'<first>|<last>')` for teammate names. Blur long internal
  prompt bodies (skill markdown) with a CSS filter on `textarea,pre,.cm-content`.
- Flows with a wait (AI rewrite, image generation) get a GIF: `frames_start("gif-x")`, then
  `frame()` in the loop, then `make_gif.sh`. Delete frames taken after the dialog closed.
- Check all shots at once: `magick montage s*.png -background '#888' -geometry +8+8 -tile 5x contact.png`
  (no resize — you must see them at real size), then Read it.

### 4. Copy and structure

**Walkthrough first, developer notes last.** Page order, top to bottom:

1. Two or three plain sentences: what the feature is, and what the reader can do after reading.
2. ONE walkthrough in the order the user does it, split into short sections of 3-5 steps
   ("1. Create the page", "2. Add buttons", "3. Publish and share"). One action per step,
   instruction above its picture.
3. What the other side sees (the visitor, the customer), then results / analytics.
4. Limits and common questions.
5. Last, under a badge that says **"For developers"**: how the parts connect, the request
   flow, code paths, flags, ticket and spec names. Never above the walkthrough, never mixed into
   steps. Write it as text; a wide diagram image fails the 390 check.

Hand the owner an **"Outline — confirm or cut"** list before any publish: the walkthrough steps
plus the behaviour claims you are least sure of (§1.3).

8th-grade plain English. Short sentences. The same word for the same thing every time (pick
"button" or "link", not both). No jargon without a one-clause definition on first use.

- Section = badge (`New` / `Changed` / `Easier` / `Fixed` / `Start here`), numbered title,
  one plain intro paragraph, then steps. **No "Why it changed" label.** Explain naturally
  what is different; don't justify.
- Steps: short imperative sentences, the exact UI label in the text ("click Attach").
- Say when the week's changes happened ("this weekend, 26–28 September"). Don't imply a longer release window.
- No billing talk on site-licensed installs (no "uses credits").
- No footer boilerplate ("Questions? …") unless asked.

### 5. Build the draft

```bash
lp(){ node "${CLAUDE_PLUGIN_ROOT}/skills/landing-page/scripts/lp.mjs" "$@"; }
S="${CLAUDE_PLUGIN_ROOT}/skills/tutorial-page/scripts"
export SLIDES_API_URL=https://<slides-host>
export LANDING_PAGES_API_KEY=$(security find-generic-password -s <keychain-service> -w | tr -d '\n')
python3 "$S/render_offline.py" tutorial.json "<repo-root>/_context/_explainers/<Title>.html"   # no key needed; run check_legibility.js on it FIRST
python3 "$S/upload.py" tutorial.json            # --force s3-2-x after a retake
python3 "$S/build_page.py" tutorial.json
lp set-content <microsite-id> content.json
```

Getting the key: it is an org-scoped `sk_live_` Slides key (CRM avatar → API Keys). Collect it
with `tools:collect-api-keys` (keychain pane) — never ask for it in chat.

**Site choice:** REST `POST /microsites` always lands in the org's **default** site (it ignores
`siteId`). To put the page in a named site: in Slides/CRM Landing Pages pick the site in the
Site dropdown, click Create Landing Page, then `lp set-content` the new id. The old copy:
`lp patch <id> '{"status":"archived"}'` — archive, don't delete.

### 6. Preview — desktop and phone

- Draft preview: `https://<slides-host>/microsites/<id>/preview` — needs the org's logged-in
  session (open it top-level in the same Chrome profile; inside the CRM iframe images lazy-load
  late and look missing).
- Check at desktop 1440 and phone 390 with `check_legibility.js`: `fail` is empty (every image
  loaded and ≥ 12px), `sideScroll` is false. Save proof shots to `preview/` and Read them.
- Hand back: preview link, section list, prod side effects, open asks. Publish only on the
  user's word.

## Critical rules

- **Draft only.** `publish` = public page. Never without explicit approval in this conversation.
- **Only live features.** Dev-only work stays off the page.
- **Claims match the product.** If the owner says it is broken, drop the section. Don't soften it.
- **One shot per step.** A step with no visual is not done.
- **Readable or it does not ship.** Small viewport, cropped to the action, one numbered ring,
  ≥ 12px at 1440 and 390 (`check_legibility.js`). See §3.
- **Walkthrough first, "For developers" last.** See §4.
- **Last tutorial first, pipeline only.** Read the previous tutorial's session file and open its
  page before capturing; build with `build_page.py` / `render_offline.py`, no one-off renderer.
- **Pin your tab.** Another session on the same browser-use daemon moves `current_tab` under
  you — even mid-call. After `pin()`, use only the pinned helpers; no `switch_tab`, `click_at_xy`, `new_tab`.
- **Report prod writes.** Some controls save instantly (see Gotchas).

## Gotchas (verified)

| Symptom | Cause | Fix |
|---|---|---|
| Owner: "screenshots are hard to see… tutorial is hard to follow" (Link in bio page, 2026-10-01) | 1400-wide full-window shots of a dark, mostly empty UI shrunk into the column (text ~6px), four rings on one image, "how it connects" before the how-to, and the earlier tutorial's lessons not read | "Before you start" + §3 readable rule (crop, one ring, legibility test) + §4 structure |
| `shot(crop=)` captured the wrong region after scrolling | CDP clip is in page px, `rect()` is viewport px | fixed in `capture.py` (adds scrollX/scrollY); keep the target inside the 1100×720 viewport |
| `pin()` attached to a tab in someone else's Chrome profile | URL match runs across every profile | `pin()` now refuses when 2+ profiles match — `tabs()` then `pin(url, target_id=…)`. Map a profile to its `browserContextId` with a probe tab opened via `--profile-directory` |
| Cropped shot looks blurry and huge on the page | old `.shot{width:100%}` stretched it | `build_page.py` caps each PNG at 1.5× its CSS width |
| Image block shows alt text / broken icon | Slides Image routes remote URLs via `/_next/image` → 400 (no `images` config) | `build_page.py` uses a CustomCode `<img>` |
| Preview blank after wrapping in Container | children put in `zones["<id>:children"]` | Put children in `props.children` (slot) |
| Each step's text appears twice on copy | `<img alt>` repeated the step text | `alt=""` (text sits above the shot) |
| Page landed in the default site | REST create ignores `siteId` | Create in the UI with the site selected, then `set-content` |
| Radix tab/menu does not open on `el.click()` | Radix listens to pointerdown/mousedown | `clk(x, y)` (real mouse press) |
| `Input.dispatchMouseEvent mouseMoved` times out | background window | No hover shots via mouseMoved; find the click that reveals the control |
| Cadra Space ⋯ menu "on hover" | appears only on the **selected** chip | Click the pill first, then ⋯ |
| Cadra avatar Generate saved without pressing Save | generation writes the avatar at once | Use a test agent; report it; Remove picture to undo |
| Cadra prompt writer | opens "What should change?" → dialog with Show changes / Discard / Accept | Discard leaves the text untouched |
| Emulation reset after navigation | override is per navigation | `goto()` re-applies `emu()` |

## Reference documentation

- `yobolabs:landing-page` — microsites REST API, `lp.mjs`, `references/puck-components.md`.
- `tools:collect-api-keys` — keychain pane for the `sk_live_` key.
- Release notes: `_context/<app>/_releases/`.
- Slides renderer source: `slides/src/extensions/microsites/puck/components/` (Image, CustomCode, Container, Text).
