---
name: yobo-mcp
description: Use when the user wants Claude to read or change a merchant's Yobo data through the Yobo MCP (products, customers, segments, orders, campaigns, offers, ads, team), or to connect Claude, Claude Code or Codex to Yobo. Triggers include "yobo mcp", "connect claude to yobo", "list my products in yobo", "draft a campaign in yobo", "/api/mcp/yobo".
---

# yobo-mcp (p99 Yobo MCP)

The Yobo MCP lets Claude act **as the signed-in Yobo user, with that user's own role** in each
organization. It reads most merchant data, writes a small safe set (segment and campaign drafts,
draft/paused campaign edits, Business DNA), and does four outward things only after the user says
yes: invite a team member, launch a campaign, generate ad creatives (costs money), and submit an ad
campaign to Meta paused.

**Default action for a bare "use Yobo" request:** check the `yobo` MCP tools are available. If they
are, call `list_orgs` and answer. If they are not, walk the user through **Connect** below — the
Claude app path first.

| | URL |
|---|---|
| Production (give users this one) | `https://app.yobolabs.ai/api/mcp/yobo` |
| Dev (internal testing only) | `https://app-dev.yobolabs.ai/api/mcp/yobo` |

Recipes per entity and per action: `references/recipes.md`.

## Connect

### 1. Claude app (web, desktop, mobile) — the default

Easiest from inside Yobo: **Yobo → Settings → Connect Claude** shows the user's URL with a copy
button and these same steps.

1. Copy the URL (Yobo → Settings → Connect Claude, or the production URL above).
2. In Claude: **Settings → Connectors → Add custom connector**.
3. Name `Yobo`, URL `<url>` → **Add**.
4. **Connect** → sign in at **Yobo Connect** → **Allow**.
5. You are back in Claude. Ask: "what can you see in Yobo".

Claude registers itself (client ID metadata document) — nothing to type for the client.

**If Connect fails** — open the connector in Claude → **Advanced settings → OAuth client → Use your
own OAuth client** → client ID `yobo-claude-app`, client secret **blank** → Connect again.

**Claude Team / Enterprise Owners** add it once for the whole Claude organization: Organization
settings → Connectors → add a custom connector with the same URL. Each member then clicks Connect
and signs in with their own Yobo account.

### 2. Developers: Claude Code / Codex

Exact lines, in this order (`<url>` = the production URL above; use the dev URL only when testing dev):

```bash
claude mcp add --transport http yobo <url>
claude mcp add --transport http --client-id yobo-claude-code --callback-port 43118 yobo <url>   # fallback
codex mcp add yobo --url <url> --oauth-client-id yobo-codex
codex mcp login yobo --scopes yobo:read,yobo:write,offline_access
```

Claude Code: after the `add`, run `/mcp` → `yobo` → **Authenticate**. Use the fallback line only when
the first one fails to sign in (remove the first with `claude mcp remove yobo` before re-adding).

**Wrong account?** Sign out at Yobo Connect first, then reconnect — the browser signs in as whoever
is already signed in there.

**No `.mcp.json` ships with this plugin, on purpose:** declaring the server would add a production
MCP server and a sign-in prompt to every session of every plugin user, including people with no Yobo
account. Users add it with the one line above.

## Pick the organization

1. Call `list_orgs` first. It returns `{orgs: [{id, name, default}], default_org_id}`.
2. One org → `default_org_id` is set; `org_id` can be omitted everywhere.
3. More than one → pass `org_id` on **every** call. Omitting it answers `org_required`.
4. Ask the user which org when the request does not make it obvious. Never guess between two
   merchants.

## The 19 tools

18 are visible while Back Office `mcp.ads_publish_enabled` is off (the seeded default):
`submit_ad_for_publish` is hidden until it is switched on. A user also only sees the tools and
entities their Yobo role allows — a missing tool is usually a missing permission.

**Read (7)**

| tool | args | use |
|---|---|---|
| `list_orgs` | — | orgs you can use + default |
| `list` | `entity, search?, filters?, cursor?, limit? (1..100, 25)` | page through an entity |
| `get` | `entity, id` | one record |
| `schema` | `entity, operation: list\|create\|update` | JSON Schema of `filters` / `data` — call before any create/update |
| `dashboard_summary` | — | headline stats + recent activity |
| `get_ad_review` | `ad_campaign_id` | publish checklist, budget, ad-set tree, `revision` |
| `plan_ad_creatives` | `ad_campaign_id` | creative count, Meta object tree, cost estimate |

**Write (12)**

| tool | args | effect |
|---|---|---|
| `create` | `entity, data` | `segment` (new only), `campaign` (lands DRAFT) |
| `update` | `entity, id, data` | `campaign` (DRAFT or PAUSED only), `business_profile` (`id: "current"`) |
| `invite_member` | `email, role_id` | **sends one invite email** |
| `resend_invite` | `member_id` | **sends one email** |
| `launch_campaign` | `campaign_id, confirm?` | **messages real customers** — two-step confirm |
| `pause_campaign` | `campaign_id` | stops further sends; no confirm |
| `submit_ad_for_publish` | `ad_campaign_id, confirm?` | submits to Meta **PAUSED, zero spend** — two-step confirm |
| `generate_ad_creatives` | `ad_campaign_id, confirm?` | **paid** caption + image generation — two-step confirm |
| `regenerate_ad_creative` | `ad_campaign_id, creative_id` | **paid**, one creative |
| `select_ad_creative` | `creative_id, selected` | approve / reject a creative |
| `clear_ad_creative_flag` | `creative_id` | clear a review flag after the user checked it |
| `group_ad_creatives` | `ad_campaign_id` | selected creatives → draft ads / ad sets (no Meta call) |

Every tool except `list_orgs` takes an optional `org_id`. Parsers are strict: an unknown key
(e.g. `hooks`, `ad_set_id`, `axes`, `languages`, `destination`) → `invalid_input` naming it.

**Entities by verb**

| verb | entities |
|---|---|
| `list` | `product`, `category`, `customer`, `segment`, `order`, `campaign`, `campaign_type`, `offer`, `loyalty_program`, `agent_task`, `ad_campaign`, `ad`, `ad_creative` (needs `filters.ad_campaign_id`), `member`, `role` |
| `get` | `product`, `category`, `customer`, `segment`, `order`, `campaign`, `offer`, `loyalty_program`, `agent_task`, `ad_campaign`, `business_profile` (`id: "current"`), `member` (id = user id) |
| `create` | `segment`, `campaign` |
| `update` | `campaign`, `business_profile` |

Ids: `product`, `order`, `campaign`, `offer`, `agent_task`, `ad_campaign` and every action tool's
`campaign_id` / `ad_campaign_id` / `creative_id` are uuids; `category`, `segment`, `loyalty_program`,
`member_id`, `role_id` are integers; `customer` takes either. Anything else → `invalid_input`.

## Confirm flows (launch, generate creatives, submit ad)

1. Call the tool **without** `confirm`. It changes nothing and returns
   `{confirm_required: true, confirm, expires_at, preview}`.
2. **Show the user the preview** — for a launch, every message it turns on (channel, segment and
   audience count, offer, content, first send time); for generation, the creative / image / caption
   counts and `estimated_cost_usd`; for a submit, the review checklist and budget.
3. Wait for a clear **yes** in the user's own words. Never infer consent.
4. Call again with the same args plus `confirm: <code>`.

Rules:
- The code lasts **10 minutes** and binds this tool, this user, this org, this target and these args.
  Changed args, a different org, or an edit to the campaign/brief since the preview →
  `confirm_required` with a **fresh preview**: show it again and ask again.
- **A reused confirm code returns the first result** with `replayed: true` — nothing runs twice and
  nothing is charged twice. `replayed` with `status: "in_progress"` means the first call is still
  running.
- A launch preview too large to show in full → `precondition_failed`, no code: launch it in the app.

## Ad creatives

Only for ad campaigns already created in the Yobo ads builder — the MCP never creates an ad
campaign and never sets objective, destination, languages, audience or hooks. **Hooks come from the
campaign's brief**; to change them, edit the brief in the Yobo builder, then plan again.

Generation costs money (Cadra caption calls + image renders). The preview shows the estimate, the
per-run cap and `org_remaining_today_usd`: a **per-organization daily spend limit** is shared by every
member and every client. Over the per-run cap or the org limit → `spend_limit_reached` (no code).
Flow: `plan_ad_creatives` → `generate_ad_creatives` preview → yes → confirm → `list ad_creative` →
`select_ad_creative` / `clear_ad_creative_flag` → `group_ad_creatives`. Detail: `references/recipes.md`.

## View links

Every record, list item and action result carries `view_url`. Show it as a clickable
**"Open in Yobo"** link; tell the user it needs a Yobo login. `null` means the app has no page for
that record — never build a URL by hand. Creative `image_url` / `asset_urls` are public images.

## Safety — say this, do this

- v1 **never** starts ad spend, changes budgets, publishes offers, schedules, refunds or deletes
  anything.
- Products, categories, offers, customer tags, existing segments and agent-task settings are changed
  **in the Yobo app only** — the MCP reads them but cannot write them. Tell the user so; do not
  look for a workaround.
- Launching a campaign **messages real customers**; inviting **sends an email**; generating creatives
  **costs money** within a per-organization daily limit. Always confirm with the user first.
- `launch_campaign`, `generate_ad_creatives` and `submit_ad_for_publish` run only with the user's
  explicit yes (the confirm code). For `invite_member` / `resend_invite`, confirm **the email and the
  role** with the user before calling.
- An ACTIVE campaign cannot be edited: pause → edit → launch again (each step visible to the user).
- Submitted ads land on Meta **paused**; starting them is done in the Yobo app.

## Limits

| limit | default |
|---|---|
| all calls / write calls | 120 / 30 per minute per user+client |
| invites + resends | 10 per day |
| executing launches + ad submits | 10 per day (previews and pauses do not count) |
| creative generations / regenerations | 3 / 30 per day per org+user |
| creative spend | per-run cap and per-org daily cap (Back Office `mcp.ads.*`) |

Defaults live in Back Office `system_config` (category `mcp`), not in code.

## Error codes

Tool errors come back as `isError: true` with `{error, message}`. Relay the message; act on the code.

| code | meaning → do |
|---|---|
| `account_not_linked` | Connect sign-in not linked to a Yobo account → sign in once at the Yobo app with "Sign in with Yobo", then reconnect |
| `no_org` | the user has no active Yobo org membership |
| `org_required` | several orgs → call `list_orgs`, pass `org_id` |
| `org_not_found` | `org_id` not one of the user's orgs |
| `permission_denied` | the user's role lacks it → ask an admin in Yobo |
| `invalid_input` | bad id/arg, unknown key, or "not available in v1" → fix args; check `schema` |
| `not_found` | no such record (or no Business DNA yet) |
| `conflict` | duplicate, e.g. already a member |
| `precondition_failed` | state forbids it (ACTIVE/COMPLETED campaign, preview too large, creatives out of sync with the brief) |
| `write_disabled` | assistant writes (or ad publishing) switched off → do it in the app |
| `rate_limited` | too fast → wait the retry-after seconds |
| `daily_limit_reached` | daily invite / launch / generation count used up |
| `spend_limit_reached` | creative spend over the run cap or the org's daily cap |
| `seat_limit_reached` | plan seat limit → free a seat or upgrade in Yobo |
| `role_not_grantable` | the role is above the inviter's or is admin/Owner/Super User/system → pick another from `list role` |
| `confirm_required` | code missing/expired/stale → show the fresh preview, ask again |
| `stale_campaign` | campaign changed since read/preview → re-read, retry |
| `stale_ad_campaign` | ad campaign changed since reviewed/previewed → review again |
| `ad_campaign_not_editable` | ad campaign publishing or live → change creatives in the app |
| `unauthorized` | token expired/revoked → reconnect |
| `insufficient_scope` | token lacks `yobo:write` → reconnect and grant write |
| `deadline_exceeded` | took too long → retry once |
| `generation_outcome_unconfirmed` | generate/regenerate may have enqueued despite the error → check the builder link before retrying |
| `internal_error` | unexpected |

## Revoke

Remove the connector in Claude (Settings → Connectors), or revoke it at **Yobo Connect → Account →
Connected apps**. Claude Code: `claude mcp remove yobo`.

## Troubleshooting (connection, not tool errors)

These happen during Connect, before any tool call — different from the `isError` codes above.

| Symptom | Cause | Fix |
|---|---|---|
| **"No active authorization"** right after signing in at Yobo Connect | Consent page was outside the oidc-provider interaction cookie's path | Fixed yobo-auth `c70938b` — if it recurs, confirm the consent route is under `/oauth/interaction/<uid>/consent`, not a bare `/consent` |
| **"Allow access" spins forever** and never returns to Claude | Allow/Deny went through a Next.js server-action redirect, which drops the path-scoped resume cookie server-side | Fixed yobo-auth `a0c68ce` — Allow/Deny must be a route handler returning a real 303 |
| **Connects fine, then "no tools available"** | `freshness_refused {reason:'unreadable'}` — the signed-in user has no `rp_identity_map` row for `source_system='yobo'`, so Connect's freshness check can't confirm the account and looks identical to a bad key | Link the account: `POST /api/internal/connect/identity/register` (existing Connect users only; `404 subject_unknown` if they have none yet — sign in with "Sign in with Yobo" first). Bulk: `pnpm connect:reconcile --env <env> --rp yobo=<origin>` |

Full root-cause detail and the cadra-auth precedent: `yobo:auth` skill,
`references/mcp-connector-oauth.md`.

## Slides + CRM MCP (p12)

Two sibling servers, same Yobo Connect sign-in, same clients. Dev only for now (prod is blocked on p9).
Full procedure, error fixes and rollout: `_context/_runbooks/slides-crm-mcp-connect.md`.

```bash
claude mcp add --transport http crm    https://crm-dev.yobolabs.ai/api/mcp/crm
claude mcp add --transport http slides https://slides-dev.yobolabs.ai/api/mcp/slides
# fallback: add --client-id yobo-claude-code --callback-port 43117 (crm) / 43119 (slides)
```

Then `/mcp` → **Authenticate** for each. Issuer `https://auth-dev.yobolabs.ai`; scopes `crm:*` / `slides:*`.

## Reference documentation

- Spec: `_context/yobo-merchant/_specs/p99-yobo-mcp/specs.md` (§5 tools, §9 excluded ops, §11, §13)
- Operator runbook: `_context/_runbooks/yobo-mcp-connect.md` (Slides + CRM MCP: `_context/_runbooks/slides-crm-mcp-connect.md`)
- Code (yobo repo): `src/server/mcp/yobo-tools.ts` (`ENTITY_OPS`, action tools), `src/server/mcp/yobo-server.ts`
- Content (tool descriptions, messages, limits): `system_config` category `mcp`, editable in Back Office
