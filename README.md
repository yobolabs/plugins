# YoboLabs — Claude Code plugins

Claude Code plugins for working with **YoboLabs apps** (Slides landing pages /
microsites, and more to come). This repository is a Claude Code **marketplace**
named `yobolabs` containing the `yobolabs` plugin.

## Install

In a Claude Code session:

```text
/plugin marketplace add yobolabs/plugins
/plugin install yobolabs@yobolabs
```

Then reload plugins (`/reload-plugins`) if prompted.

> The marketplace lives at `github.com/yobolabs/plugins`. Update the
> `marketplace add` argument if the repository slug differs.

## What's inside

### Plugin: `yobolabs`

| Skill | What it does |
|-------|--------------|
| `landing-page` | Create, edit, configure, and publish Slides landing pages (microsites) through the REST API at `/api/v1/microsites` — including rewriting Puck page content. Invoke with `/landing-page`. |

More YoboLabs skills (campaigns, segments, etc.) will be added to this plugin
over time.

## Setup

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

## Repository layout

```text
yobolabs-plugins/
  .claude-plugin/
    marketplace.json          # marketplace manifest (name: "yobolabs")
  yobolabs/                    # the plugin
    .claude-plugin/
      plugin.json             # plugin manifest (name: "yobolabs")
    skills/
      landing-page/
        SKILL.md
        scripts/lp.mjs         # REST helper CLI
        references/puck-components.md
  README.md
```

## Developing

Edit files in this source repo (never in `~/.claude/plugins/…`, which is
overwritten on install). After changes:

1. Bump `version` in `yobolabs/.claude-plugin/plugin.json` and in
   `.claude-plugin/marketplace.json`.
2. Commit and push.
3. Re-run `/plugin` to pull the update, then `/reload-plugins`.
