# YoboLabs — Claude Code plugins

Claude Code plugins for working with **YoboLabs apps** (Slides landing pages /
microsites) and for **content creation** (short-form campaign ads, CapCut
automation, motion-graphics overlays). This repository is a Claude Code
**marketplace** named `yobolabs` containing two plugins: `yobolabs` and
`content-creation`.

## Install

In a Claude Code session:

```text
/plugin marketplace add yobolabs/plugins
/plugin install yobolabs@yobolabs
/plugin install content-creation@yobolabs
```

Install either or both. Then reload plugins (`/reload-plugins`) if prompted.

> The marketplace lives at `github.com/yobolabs/plugins`. Update the
> `marketplace add` argument if the repository slug differs.

## What's inside

### Plugin: `yobolabs`

| Skill | What it does |
|-------|--------------|
| `landing-page` | Create, edit, configure, and publish Slides landing pages (microsites) through the REST API at `/api/v1/microsites` — including rewriting Puck page content. Invoke with `/landing-page`. |
| `app` | Create, edit, configure, and publish Slides Apps (single-file code prototypes) through the REST API at `/api/v1/prototypes`. Invoke with `/app`. |

| Command | What it does |
|---------|--------------|
| `/session-start` | Start a RAG-optimized development session file in the configured sessions dir. |
| `/session-update` | Append detailed, RAG-optimized progress to the active session. |
| `/session-end` | Close the active session with a comprehensive summary. |
| `/session-from-transcript` | Reconstruct a session file (or a quick recap) by mining a past Claude Code session's raw `.jsonl` transcript with `jq` — for sessions that were never logged, or when `/resume` is blocked by the 1M-context billing gate. |

More YoboLabs skills (campaigns, segments, etc.) will be added to this plugin
over time.

### Plugin: `content-creation`

Build short-form campaign ads by talking to Claude — one ad spec produces both a
finished `.mp4` (Remotion) and an editable CapCut project.

| Skill | What it does |
|-------|--------------|
| `ad-engine` | Build a short-form campaign ad from a single JSON ad spec — produces both a finished mp4 and an editable CapCut project, plus fast variant generation. Invoke with `/ad-engine`. |
| `capcut` | Create, edit, and automate CapCut video projects programmatically (trims, silence detection, captions, canvas blur, aspect ratio). Invoke with `/capcut`. |
| `remotion-overlays` | Render transparent motion-graphics overlays (animated intros, kinetic captions, product callouts, CTA end-cards) to composite over the video. Invoke with `/remotion-overlays`. |

## Setup

### `yobolabs`

The `landing-page` skill needs two environment variables:

| Env var | Purpose |
|---------|---------|
| `LANDING_PAGES_API_KEY` | An `sk_live_…` key with `microsite.*` permissions |
| `SLIDES_API_URL` | Base origin of the Slides app, no trailing slash (e.g. `https://slides.yourdomain.com`) |

**Getting a key:** in the app, open the profile menu → **API Keys** → create one
(it's shown once — copy it). Keys are scoped to a single organization.

Once installed and configured, ask Claude things like _"list my landing pages"_,
_"add a pricing tier to landing page <id>"_, or _"publish the spring campaign
page"_.

### `content-creation`

No API keys. The skills shell out to local tools — install these first:

| Tool | Used by |
|------|---------|
| `python3.11` | `ad-engine`, `capcut` scripts |
| `ffmpeg` / `ffprobe` | media probing, silence detection, trims |
| Node.js + `npm` | `remotion-overlays` render project (run `npm install` in `content-creation/skills/remotion-overlays/` once) |
| CapCut (macOS) | opening the assembled draft |

Once installed, ask Claude things like _"build a 9x16 campaign ad from ad.json"_
or _"generate 3 variants with different hooks"_.

## Repository layout

```text
yobolabs-plugins/
  .claude-plugin/
    marketplace.json          # marketplace manifest (name: "yobolabs")
  yobolabs/                    # plugin: yobolabs
    .claude-plugin/
      plugin.json             # plugin manifest (name: "yobolabs")
    commands/                  # session-lifecycle slash commands
      session-start.md
      session-update.md
      session-end.md
      session-from-transcript.md  # reconstruct a session from a raw .jsonl transcript
    scripts/
      mine.sh                  # one-pass transcript extractor (used by /session-from-transcript)
    skills/
      landing-page/
        SKILL.md
        scripts/lp.mjs         # REST helper CLI
        references/puck-components.md
      app/
        SKILL.md
        scripts/app.mjs        # REST helper CLI
        references/app-format.md
  content-creation/            # plugin: content-creation
    .claude-plugin/
      plugin.json             # plugin manifest (name: "content-creation")
    skills/
      ad-engine/               # build ads from a JSON spec (mp4 + CapCut draft)
        SKILL.md
        scripts/               # produce.py, build_ad.py, ad_spec.py, variants.py
      capcut/                  # CapCut draft automation
        SKILL.md
        scripts/               # capcut_draft.py, capture_seed.py, inspect_draft.py, media_probe.py
      remotion-overlays/       # Remotion motion-graphics render project
        SKILL.md
        render-overlays.mjs
  README.md
```

## Developing

Edit files in this source repo (never in `~/.claude/plugins/…`, which is
overwritten on install). After changes:

1. Bump `version` in the changed plugin's `.claude-plugin/plugin.json`
   (`yobolabs/` or `content-creation/`) and its entry in
   `.claude-plugin/marketplace.json`.
2. Commit and push.
3. Re-run `/plugin` to pull the update, then `/reload-plugins`.
