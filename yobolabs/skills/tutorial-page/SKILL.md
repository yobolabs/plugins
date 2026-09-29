---
name: tutorial-page
description: Use when building a "What's new" or how-to tutorial landing page that walks users through product changes with real screenshots from the live app — feature list from release notes, one ringed screenshot per step, optional GIFs, published as a DRAFT Slides microsite in CRM Landing Pages. Also use when the user mentions "tutorial page", "what's new page", "release tutorial", "how-to page with screenshots", "take screenshots of the new features", "walkthrough landing page", or "feature tour". Default action for a bare invocation — build a draft page end to end (features → outline → screenshots → page → preview), never publish.
---

# Tutorial Landing Pages (What's new / how-to)

Builds a tutorial page that teaches users what changed and how to use it. Each section is:
a plain intro, numbered steps, and **one screenshot per step** with an orange ring on the exact
control. The page is a Slides microsite (draft), built through the `landing-page` skill's API.

**Default:** build a DRAFT end to end and hand back the preview link. Publishing is a one-way
door (public page) — only on the user's explicit word.

Load `yobolabs:landing-page` too — it owns the microsites API, `lp.mjs`, and the Puck catalog.

## Bundled scripts

| Script | Runs where | Does |
|---|---|---|
| `${CLAUDE_PLUGIN_ROOT}/skills/tutorial-page/scripts/capture.py` | inside browser-use `browser_exec` via `exec(open(...).read())` | pinned-tab helpers: `pin`, `goto`, `rect`, `clk`, `typ`, `key`, `mark`, `shot`, `blur_text`, `frame` |
| `${CLAUDE_PLUGIN_ROOT}/skills/tutorial-page/scripts/build_page.py` | shell | `tutorial.json` + `uploads.json` → Puck `content.json` |
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

### 3. Screenshots — one per step, ringed

In `browser_exec`:

```python
exec(open("${CLAUDE_PLUGIN_ROOT}/skills/tutorial-page/scripts/capture.py").read())
OUT = "<repo-root>/_context/<app>/_tutorial/<date>"
pin("<app-host>/agents")                 # attach by URL substring
goto("https://<app-host>/agents")
r = rect("New space")                     # exact visible text → [x,y,w,h]
mark([r + ["2"]]); shot("s3-2-new-space-menu"); unmark()
```

- Name shots `s<section>-<step>-<slug>` so the spec reads in order.
- **Every step the text mentions must be visible in its shot.** If a step says "click your
  initials", the menu is open in the shot. Re-audit every section before calling it done —
  missing visuals was the user's #1 complaint.
- Ring = 3px orange border + numbered badge on the first ring. Group related controls into one
  ring rather than 4 overlapping ones.
- Re-measure `rect()` **after** the UI settles (a dropdown opening shifts the layout).
- Blur before every shot: `shot()` runs SCRUB (emails, phone numbers, `sk_` keys, quoted
  customer text). Add `blur_text(r'<first>|<last>')` for teammate names. Blur long internal
  prompt bodies (skill markdown) with a CSS filter on `textarea,pre,.cm-content`.
- Flows with a wait (AI rewrite, image generation) get a GIF: `frames_start("gif-x")`, then
  `frame()` in the loop, then `make_gif.sh`. Delete frames taken after the dialog closed.
- Check all shots at once: `magick montage s*.png -geometry 480x300+6+6 -tile 5x contact.png`, then Read it.

### 4. Copy

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
- Check: every `img` has `naturalWidth > 0`, desktop 1440 and phone 390, and
  `document.documentElement.scrollWidth == innerWidth` (no side scroll). Save proof shots to
  `preview/`.
- Hand back: preview link, section list, prod side effects, open asks. Publish only on the
  user's word.

## Critical rules

- **Draft only.** `publish` = public page. Never without explicit approval in this conversation.
- **Only live features.** Dev-only work stays off the page.
- **Claims match the product.** If the owner says it is broken, drop the section. Don't soften it.
- **One shot per step.** A step with no visual is not done.
- **Pin your tab.** Another session on the same browser-use daemon moves `current_tab` under
  you — even mid-call. After `pin()`, use only the pinned helpers; no `switch_tab`, `click_at_xy`, `new_tab`.
- **Report prod writes.** Some controls save instantly (see Gotchas).

## Gotchas (verified)

| Symptom | Cause | Fix |
|---|---|---|
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
