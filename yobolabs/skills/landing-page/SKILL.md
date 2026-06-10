---
name: landing-page
description: Use when creating, editing, configuring, or publishing CadraOS/Slides landing pages (microsites) through the REST API — listing pages, rewriting Puck page content, or publishing/unpublishing. Also use when the user mentions "landing page", "landing pages", "microsite", "puck content", "publish a page", "edit landing page", "configure landing page", or "/api/v1/microsites".
---

# Configure Landing Pages (CadraOS/Slides microsites)

Create, edit, and publish landing pages through the Slides REST API at
`/api/v1/microsites`. A landing page = a **microsite**: metadata (name, slug,
status) plus a **Puck `content`** page body. Editing the look of a page means
rewriting that `content` JSON.

## Setup (required)

Two environment variables drive everything:

| Env var | Purpose |
|---------|---------|
| `LANDING_PAGES_API_KEY` | An `sk_live_…` key with `microsite.*` permissions |
| `SLIDES_API_URL` | Base origin of the Slides app, no trailing slash (e.g. `https://slides.yourdomain.com`; dev `http://localhost:3100`) |

**Getting a key**: in the CRM, open the profile menu (avatar) → **API Keys**
tab → create one (it shows once — copy it). Or, in Slides directly, the
`/api-keys` page. Keys are scoped to one organization; every call only sees and
edits that org's pages.

Confirm the API contract anytime at `GET {SLIDES_API_URL}/api/v1/docs` (OpenAPI).

## The helper script

A bundled CLI wraps the REST calls so you don't hand-roll HTTP. Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/landing-page/scripts/lp.mjs" <command> [...]
```

Commands: `list`, `get <id>`, `get-content <id>`, `create <name>`,
`set-content <id> <file.json>`, `patch <id> <json|@file>`, `publish <id>`,
`unpublish <id>`, `delete <id>`, `new-id <ComponentType>`. It reads the two env
vars above, unwraps the `{success,data}` envelope, and exits non-zero on errors.

You can also use plain `curl` (see "Raw REST" below) — the helper is just safer.

## The core editing workflow (read → mutate → write)

**Editing page content is ALWAYS a 3-step round-trip.** `PATCH content` replaces
the entire page body, so never construct a partial — start from the current one.

```bash
# Define a wrapper that works in BOTH bash and zsh. (Do NOT use the
# `LP="node …"; lp cmd` shorthand — zsh does not word-split unquoted
# parameters, so `lp list` runs as one command and fails with
# "no such file or directory: node /…/lp.mjs". A function avoids that.)
lp(){ node "${CLAUDE_PLUGIN_ROOT}/skills/landing-page/scripts/lp.mjs" "$@"; }

# 1. Pull the current content to a file
lp get-content 3a0420fa-c4bd-453b-91f6-1942c424d3d9 > /tmp/page.json

# 2. Edit /tmp/page.json — mutate the `content[]` array (add/remove/reorder/edit
#    components). See references/puck-components.md for the model + catalog.
#    Generate ids for new components:
lp new-id Heading        # → Heading-<uuid>

# 3. Write the whole object back
lp set-content 3a0420fa-c4bd-453b-91f6-1942c424d3d9 /tmp/page.json
```

For metadata (name/slug/status/description) use `patch`:

```bash
lp patch <id> '{"name":"Q1 Campaign — v2"}'
```

## Puck content — what you're editing

`content` is `{ root, content, zones }`. The `content[]` array is the ordered
list of components; each is `{ "type": "Heading", "props": { "id": "...", ... } }`.

**You MUST read `references/puck-components.md` before authoring content.** It has
the full component catalog (22 components), exact prop names, the content shape,
the zones model for nesting, and a full worked example. Do not guess prop names.

The non-negotiables (full detail in the reference):
- Every component needs a unique **`id`** prop in the form `<Type>-<uuid>` (use `new-id`).
- **`Heading` uses `text`; `Text` uses `content`** — don't swap.
- Numeric-looking props are **strings** (`"fontSize": "40"`).
- For bespoke/animated sections that don't map to a component, use the
  **`CustomCode`** component (`html`/`css`/`js`). For standard copy/CTAs use the
  structured components (Heading, Text, Button, Image, …).
- Nesting (inside Container/Card/Columns) lives in `zones`, not inline — keep
  pages flat unless you need columns.

## Lifecycle

```bash
lp create "Q1 Campaign Landing Page"   # → new draft, returns its id + slug
# …edit content via the 3-step workflow…
lp publish <id>     # status → published, stamps publishedAt, live at /site/<slug>
lp unpublish <id>   # status → draft, clears publishedAt, stops serving
lp delete <id>      # permanent
```

- New pages start as **draft**. They only serve at `/site/<slug>` once published.
- **Slug** derives from the name and is **unique per org**. A duplicate name/slug
  returns **409 CONFLICT** — pick a different name (or pass an explicit `--slug`).
- `publish`/`unpublish` are the right way to flip live state; you *can* also
  `patch <id> '{"status":"published"}'` (it derives `publishedAt`), but prefer the
  dedicated commands.

## Listing & finding pages

```bash
lp list                                  # first page (limit 20)
lp list --status draft --search promo    # filter by status + name/slug search
lp list --limit 50 --offset 50           # paginate (max limit 50)
```

List returns **summaries** (no `content` body) plus
`pagination: { total, limit, offset, hasMore }`. Fetch a single page with `get`
to see its `content`.

## Raw REST (if not using the helper)

```bash
# List
curl -H "Authorization: Bearer $LANDING_PAGES_API_KEY" \
  "$SLIDES_API_URL/api/v1/microsites?status=draft&limit=20"

# Get one (incl. content)
curl -H "Authorization: Bearer $LANDING_PAGES_API_KEY" \
  "$SLIDES_API_URL/api/v1/microsites/<id>"

# Create
curl -X POST -H "Authorization: Bearer $LANDING_PAGES_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Q1 Campaign Landing Page"}' \
  "$SLIDES_API_URL/api/v1/microsites"

# Update content (send the WHOLE content object)
curl -X PATCH -H "Authorization: Bearer $LANDING_PAGES_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content": { "root": {"props":{}}, "zones": {}, "content": [ ... ] }}' \
  "$SLIDES_API_URL/api/v1/microsites/<id>"

# Publish / Unpublish / Delete
curl -X POST   -H "Authorization: Bearer $LANDING_PAGES_API_KEY" "$SLIDES_API_URL/api/v1/microsites/<id>/publish"
curl -X POST   -H "Authorization: Bearer $LANDING_PAGES_API_KEY" "$SLIDES_API_URL/api/v1/microsites/<id>/unpublish"
curl -X DELETE -H "Authorization: Bearer $LANDING_PAGES_API_KEY" "$SLIDES_API_URL/api/v1/microsites/<id>"
```

Responses use the envelope `{ "success": true, "data": … }` (errors:
`{ "success": false, "error": { code, message } }`).

## Endpoint reference

| Method | Path | Permission | Notes |
|--------|------|-----------|-------|
| GET | `/api/v1/microsites` | `microsite.read` | List summaries; query: `status`, `search`, `limit`(≤50), `offset` |
| POST | `/api/v1/microsites` | `microsite.create` | Body `{name, slug?, description?}`; 409 on duplicate name/slug |
| GET | `/api/v1/microsites/{id}` | `microsite.read` | Full record incl. `content` + `settings` |
| PATCH | `/api/v1/microsites/{id}` | `microsite.update` | Partial; `content` replaces the body wholesale; `status` allowed |
| DELETE | `/api/v1/microsites/{id}` | `microsite.delete` | Permanent |
| POST | `/api/v1/microsites/{id}/publish` | `microsite.publish` | → published + publishedAt |
| POST | `/api/v1/microsites/{id}/unpublish` | `microsite.publish` | → draft, publishedAt cleared |

## Critical rules

- **Round-trip content edits**: GET content → mutate → PATCH the whole object.
  Never PATCH a partial `content` — it overwrites the entire page body.
- **Always set a unique `id`** (`<Type>-<uuid>`) on every component. Use `new-id`.
- **Read `references/puck-components.md`** for prop names; don't invent props.
  Unknown/extra props are ignored or break rendering.
- **A 403** means the key lacks the permission for that verb — mint a key with the
  needed `microsite.*` perm.
- **A 409** on create = duplicate name/slug in that org — change the name.
- **`limit` caps at 50**; paginate with `offset` using the returned `total`/`hasMore`.
- Pages serve at **`/site/<slug>`** only after `publish`.

## Reference documentation

- `references/puck-components.md` — content model, 22-component catalog with props,
  zones/nesting, CustomCode, full worked example. **Read before editing content.**
- `scripts/lp.mjs` — the REST helper CLI (see its header for full usage).
- Live OpenAPI: `GET {SLIDES_API_URL}/api/v1/docs`.
