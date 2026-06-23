---
name: app
description: Use when creating, editing, configuring, or publishing Slides Apps (code prototypes) through the REST API — listing apps, uploading or replacing source, publishing/unpublishing. Also use when the user mentions "app", "apps", "prototype", "html prototype", "single-file app", "publish app", "code prototype", or "/api/v1/prototypes".
---

# Configure Slides Apps (code prototypes)

Create, edit, and publish single-file code apps through the Slides REST API at
`/api/v1/prototypes`. An "app" = a **prototype**: metadata (name, slug, language,
status) plus a raw **`html` blob** that is the entire source. Editing the app means
replacing that blob wholesale.

## Setup (required)

Two environment variables drive everything:

| Env var | Purpose |
|---------|---------|
| `APPS_API_KEY` | An `sk_live_…` key with `prototype.*` permissions |
| `SLIDES_API_URL` | Base origin of the Slides app, no trailing slash (e.g. `https://slides.yourdomain.com`; dev `http://localhost:3100`) |

**Getting a key**: in the CRM, open the profile menu (avatar) → **API Keys**
tab → create one (it shows once — copy it). Or, in Slides directly, the
`/api-keys` page. Keys are scoped to one organization; every call only sees and
edits that org's apps.

Confirm the API contract anytime at `GET {SLIDES_API_URL}/api/v1/docs` (OpenAPI).

## The helper script

A bundled CLI wraps the REST calls so you don't hand-roll HTTP. Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/app/scripts/app.mjs" <command> [...]
```

Commands: `list`, `get <id>`, `get-source <id>`, `create <name>`,
`set-source <id> <file>`, `patch <id> <json|@file>`, `publish <id>`,
`unpublish <id>`, `delete <id>`. It reads the two env vars above, unwraps the
`{success,data}` envelope, and exits non-zero on errors.

You can also use plain `curl` (see "Raw REST" below) — the helper is just safer.

## The core editing workflow (get → edit → set-source)

Editing an app's source is always a 3-step round-trip. `set-source` replaces the
entire `html` blob, so never construct a partial — start from the current one.

```bash
# Define a wrapper that works in BOTH bash and zsh. (Do NOT use the
# `APP="node …"; app cmd` shorthand — zsh does not word-split unquoted
# parameters, so `app list` runs as one command and fails with
# "no such file or directory: node /…/app.mjs". A function avoids that.)
app(){ node "${CLAUDE_PLUGIN_ROOT}/skills/app/scripts/app.mjs" "$@"; }

# 1. Pull the current source to a file
app get-source 3a0420fa-c4bd-453b-91f6-1942c424d3d9 > /tmp/app.html

# 2. Edit /tmp/app.html — rewrite the single-file source.
#    See references/app-format.md for the language model + servability rules.

# 3. Write the whole blob back
app set-source 3a0420fa-c4bd-453b-91f6-1942c424d3d9 /tmp/app.html
```

For metadata (name/slug/status/description/language) use `patch`:

```bash
app patch <id> '{"name":"Pricing Calculator — v2"}'
```

## The single-file model

An app is one self-contained file stored as a raw text blob in the `html` field.
The `language` field tells the editor how to syntax-highlight it and — crucially —
whether the app can be **served** (published and accessed in a browser):

| language | Served at `/proto/<slug>`? |
|----------|---------------------------|
| `html` | YES — served verbatim |
| `jsx` | YES — transformed in-browser via CDN React + Babel |
| `css` | no (edit + export only) |
| `javascript` | no |
| `python` | no |
| `json` | no |
| `sql` | no |

**Only `html` and `jsx` can be published.** Calling `publish` on any other
language returns **422**. See `references/app-format.md` for authoring guidance
and the jsx/multi-file bundling recipe.

## Lifecycle

```bash
app create "Pricing Calculator"          # → new draft, language defaults to "html"
# …edit source via the 3-step workflow…
app publish <id>       # status → published, stamps publishedAt, live at /proto/<slug>
app unpublish <id>     # status → draft, clears publishedAt, stops serving
app delete <id>        # permanent
```

- New apps start as **draft**. They only serve at `/proto/<slug>` once published.
- **Slug** derives from the name and is **unique per site**. A duplicate name/slug
  returns **409 CONFLICT** — pick a different name (or pass an explicit `--slug`).
- `publish`/`unpublish` are the right way to flip live state; you can also
  `patch <id> '{"status":"published"}'` (publishedAt is derived), but prefer the
  dedicated commands.

## Listing & finding apps

```bash
app list                                   # first page (limit 20)
app list --status draft --search pricing   # filter by status + name/slug search
app list --site <siteId>                   # scope to a site
app list --limit 50 --offset 50            # paginate (max limit 50)
```

List returns **summaries** (no `html` blob) plus
`pagination: { total, limit, offset, hasMore }`. Fetch a single app with `get`
to see its full source.

## Raw REST (if not using the helper)

```bash
# List
curl -H "Authorization: Bearer $APPS_API_KEY" \
  "$SLIDES_API_URL/api/v1/prototypes?status=draft&limit=20"

# Get one (incl. html source)
curl -H "Authorization: Bearer $APPS_API_KEY" \
  "$SLIDES_API_URL/api/v1/prototypes/<id>"

# Create
curl -X POST -H "Authorization: Bearer $APPS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Pricing Calculator","language":"html"}' \
  "$SLIDES_API_URL/api/v1/prototypes"

# Update source (send the WHOLE html blob)
curl -X PATCH -H "Authorization: Bearer $APPS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"html":"<!doctype html><h1>Updated</h1>"}' \
  "$SLIDES_API_URL/api/v1/prototypes/<id>"

# Publish / Unpublish / Delete
curl -X POST   -H "Authorization: Bearer $APPS_API_KEY" "$SLIDES_API_URL/api/v1/prototypes/<id>/publish"
curl -X POST   -H "Authorization: Bearer $APPS_API_KEY" "$SLIDES_API_URL/api/v1/prototypes/<id>/unpublish"
curl -X DELETE -H "Authorization: Bearer $APPS_API_KEY" "$SLIDES_API_URL/api/v1/prototypes/<id>"
```

Responses use the envelope `{ "success": true, "data": … }` (errors:
`{ "success": false, "error": { code, message } }`).

## Endpoint reference

| Method | Path | Permission | Notes |
|--------|------|-----------|-------|
| GET | `/api/v1/prototypes` | `prototype.read` | List summaries; query: `status`, `search`, `siteId`, `limit`(≤50), `offset` |
| POST | `/api/v1/prototypes` | `prototype.create` | Body `{name, slug?, description?, language?, html?, siteId?}`; 409 on dup name/slug within site |
| GET | `/api/v1/prototypes/{id}` | `prototype.read` | Full record incl. `html` + `settings` |
| PATCH | `/api/v1/prototypes/{id}` | `prototype.update` | Partial; `html` replaces the blob wholesale |
| DELETE | `/api/v1/prototypes/{id}` | `prototype.delete` | Permanent; returns `{deleted:true}` |
| POST | `/api/v1/prototypes/{id}/publish` | `prototype.publish` | → published + publishedAt; 422 if language not html/jsx |
| POST | `/api/v1/prototypes/{id}/unpublish` | `prototype.publish` | → draft, publishedAt cleared |

## Critical rules

- **Round-trip source edits**: get-source → edit → set-source the whole blob.
  Never PATCH a partial `html` — it overwrites the entire source.
- **Only `html` or `jsx` can be published.** Other languages return 422 on publish.
- **A 403** means the key lacks the permission for that verb — mint a key with the
  needed `prototype.*` perm.
- **A 409** on create = duplicate name/slug in that site — change the name.
- **`limit` caps at 50**; paginate with `offset` using the returned `total`/`hasMore`.
- Apps serve at **`/proto/<slug>`** only after `publish`.

## Reference documentation

- `references/app-format.md` — the single-file model, language table, servability
  rules, jsx mode constraints, and multi-file bundling recipe.
- `scripts/app.mjs` — the REST helper CLI (see its header for full usage).
- Live OpenAPI: `GET {SLIDES_API_URL}/api/v1/docs`.
