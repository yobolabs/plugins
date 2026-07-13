---
name: crm
description: Use when reading or updating Yobo CRM records through the REST API — companies, deals, leads, people, tasks, notes, custom fields, lifecycles, and GTM campaigns. Listing, creating, updating, deleting, moving a deal stage, advancing a lead between GTM board lanes, pausing/resuming a campaign, or flagging needs-attention. Also use when the user mentions "CRM", "update the CRM", "create a company/deal/lead/contact", "move deal stage", "advance lead", "GTM campaign", "pipeline", or "/api/v1" on the CRM.
---

# Update Yobo CRM (companies, deals, leads, people, tasks, GTM)

Read and write Yobo CRM records through the CRM REST API at `/api/v1`. Every
entity is CRUD over an org-scoped Bearer-authed endpoint that returns the
`{ success, data }` envelope. This skill lets you drive the CRM directly from
Claude Code instead of clicking the UI.

## Setup (required)

Two environment variables drive everything:

| Env var | Purpose |
|---------|---------|
| `CRM_API_KEY` | A `jetai_…` key with the permissions for the verbs you use (e.g. `companies:read`, `deals:update`, `leads:create`, `gtm:transition`) |
| `CRM_API_URL` | Base origin of the CRM app, no trailing slash. Dev: `http://localhost:4100` (crm `pnpm dev` port). Set to your deployed CRM origin in prod. |

**Getting a key**: in the CRM, go to **Backoffice → Settings → API Keys**
(`/backoffice/settings/api-keys`) → create one (it shows once — copy it). This
key **auto-inherits your admin role's full permission set** (companies, deals,
leads, people, tasks, notes, lifecycles, GTM — everything), so there's no
checklist to fill. Keys are scoped to one organization; every call only sees and
edits that org's data.

> ⚠️ Do NOT use the **profile menu → API Keys** dialog — that one is the
> **Slides / microsites** key creator (Landing Pages / Sites / Prototypes perms
> only) and will NOT authorize CRM calls. A `403` from a CRM call usually means
> you minted a microsites key by mistake, or your admin role lacks that perm.

Confirm the live API contract anytime at `GET {CRM_API_URL}/api/v1/docs`
(OpenAPI) — or run `crm docs` (below). **The OpenAPI is the source of truth; when
in doubt, read it rather than guessing paths or fields.**

## The helper script

A bundled CLI wraps the REST calls so you don't hand-roll HTTP. Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/crm/scripts/crm.mjs" <command> [...]
```

It reads the two env vars, adds the Bearer header, unwraps the `{success,data}`
envelope, prints `data` as pretty JSON, and exits non-zero on any HTTP error
(printing the `code`/`message`/`details`).

```bash
# Define a wrapper that works in BOTH bash and zsh. (Do NOT use the
# `CRM="node …"; crm cmd` shorthand — zsh does not word-split unquoted
# parameters, so `crm list companies` runs as one command and fails. A
# function avoids that.)
crm(){ node "${CLAUDE_PLUGIN_ROOT}/skills/crm/scripts/crm.mjs" "$@"; }
```

### Friendly entity aliases (the common 90%)

`<entity>` is one of: `companies`, `deals`, `leads`, `people`, `tasks`, `notes`,
`custom-fields`, `lifecycles`, `gtm-campaigns`.

```bash
crm list   companies --status CUSTOMER --search acme --page 1 --pageSize 20
crm show   companies <uuid>
crm create companies '{"name":"Acme Inc","industry":"SaaS"}'
crm update deals <uuid> '{"amount":50000}'
crm remove tasks <uuid>
```

### Generic verbs (cover EVERYTHING in the OpenAPI)

For any endpoint not covered by an alias — sub-resources, bulk ops, board reads,
counts, campaign dials — use the path-based verbs. Extra `--flags` on `get`
become query params.

```bash
crm get  /deals/kanban --lifecycleId 12
crm post /people/bulk-status '{"ids":["…","…"],"status":"ACTIVE"}'
crm post /gtm-campaigns/<uuid>/pause '{}'
crm post /gtm-campaigns/<uuid>/transition '{"toStatus":"approved"}'
crm del  /leads/<uuid>
crm docs                       # fetch the live OpenAPI spec
```

### Special-cased ops

```bash
# Move a deal to another pipeline stage
crm move-deal <deal-uuid> '{"stageId":7}'

# Advance a lead between GTM board lanes (idempotent, sole-writer seam).
# Auto-sends the REQUIRED Idempotency-Key header; re-running with the SAME
# --key is a safe replay (no second move). Lane values are KEYS (capitalized).
crm advance-lead <lead-uuid> '{"from_lane":"Sourced","to_lane":"Enriched"}' --key my-run-123
```

## The core update workflow (read → mutate → write)

For any **update**, fetch the current record first, change only what you mean to,
then PATCH — never guess the current values.

```bash
crm show companies <uuid> > /tmp/co.json      # 1. read
# 2. edit /tmp/co.json (or build a minimal patch of just the changed fields)
crm update companies <uuid> '{"industry":"Fintech","segment":"Enterprise"}'   # 3. write
```

PATCH bodies are **partial** for scalar fields (send only what changes). Confirm
each entity's exact field names and enums in `references/entities.md` or the live
OpenAPI — don't invent field names.

## GTM campaigns — the status machine

`gtm-campaigns` carry a status machine (the Approve gate):

```
draft → copy_review → approved → running ⇄ paused → done
```

- `status` is **NOT** settable via `update`. Use the dedicated ops:
  - `crm post /gtm-campaigns/<uuid>/transition '{"toStatus":"copy_review"}'`
  - `crm post /gtm-campaigns/<uuid>/pause '{}'` / `.../resume '{}'`
- `copy_review → approved` (the **Approve gate**) needs the extra
  `gtm-campaigns:approve` permission; other legal moves need `gtm-campaigns:update`.
- Editing CONTENT (sequences / icpDefinition / channelMix / name) on an
  approved-or-later campaign **re-arms the gate** — it drops back to `copy_review`.
- An illegal transition returns **400**.

## Listing, pagination & finding records

List endpoints return a paginated envelope:
`{ items, total, pagination: { page, pageSize, hasMore } }`.

```bash
crm list leads --search jane --sortBy createdAt --sortOrder desc
crm list deals --page 2 --pageSize 50
```

Common query params: `page`, `pageSize` (≤100), `search`, `sortBy`, `sortOrder`,
plus per-entity filters (`status`, `industry`, `segment`, `lifecycleId`, …).
See `references/entities.md`.

## Raw REST (if not using the helper)

```bash
# List
curl -H "Authorization: Bearer $CRM_API_KEY" \
  "$CRM_API_URL/api/v1/companies?status=CUSTOMER&pageSize=20"

# Create
curl -X POST -H "Authorization: Bearer $CRM_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Acme Inc"}' "$CRM_API_URL/api/v1/companies"

# Update (partial PATCH)
curl -X PATCH -H "Authorization: Bearer $CRM_API_KEY" -H "Content-Type: application/json" \
  -d '{"amount":50000}' "$CRM_API_URL/api/v1/deals/<uuid>"

# Advance a lead (Idempotency-Key is REQUIRED)
curl -X POST -H "Authorization: Bearer $CRM_API_KEY" -H "Content-Type: application/json" \
  -H "Idempotency-Key: my-run-123" \
  -d '{"from_lane":"Sourced","to_lane":"Enriched"}' \
  "$CRM_API_URL/api/v1/leads/<uuid>/gtm-transition"
```

Responses use the envelope `{ "success": true, "data": … }` (errors:
`{ "success": false, "error": { code, message, details? } }`).

## Critical rules

- **Read before you write.** Fetch the record, PATCH only what changes.
- **Don't invent field names / enums.** Check `references/entities.md` or
  `crm docs`. Unknown fields fail validation (`422`) or are ignored.
- **`gtm-transition` requires an `Idempotency-Key`** (the helper adds one). Reuse
  the same key to safely retry; a stale `from_lane` returns **409**.
- **Campaign `status` is transition-only** — never PATCH it.
- **`403`** = key missing that verb's permission. **`404`** = wrong uuid / not in
  this org. **`409`** = conflict (stale lane, duplicate). **`422`** = bad body.
- Keys are **org-scoped** — a key only ever touches its own org's data.
- **`pageSize` caps at 100**; paginate with `page` using `total`/`hasMore`.

## Reference documentation

- `references/entities.md` — the entity catalog: paths, key fields, enums,
  permissions, and the special seams (move-stage, gtm-transition, campaign
  dials, needs-attention). **Read before creating/updating.**
- `scripts/crm.mjs` — the REST helper CLI (see its header for full usage).
- Live OpenAPI: `GET {CRM_API_URL}/api/v1/docs` or `crm docs`.
