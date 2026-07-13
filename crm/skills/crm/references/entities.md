# Yobo CRM — Entity Catalog

Accurate paths, filters, body fields, and permissions for the CRM REST API
(`/api/v1`). Generated from the live OpenAPI spec — when in doubt, fetch the
source of truth with `crm docs` (or `GET {CRM_API_URL}/api/v1/docs`).

Conventions:
- `field*` = **required** on create. Update (PATCH) bodies are partial — send
  only what changes.
- All list endpoints share `page`, `pageSize` (≤100), `search`, `sortBy`,
  `sortOrder` plus the per-entity filters below, and return
  `{ items, total, pagination: { page, pageSize, hasMore } }`.
- Every verb needs its permission (`403` if the key lacks it). Auth = Bearer
  `jetai_…` key, org-scoped.
- Envelope: `{ success, data }` (errors `{ success, error: { code, message, details? } }`).

---

## Companies — `/companies` (perms `companies:{read,create,update,delete}`)

- **List filters**: `status`, `industry`, `segment`, `lifecycleId`, `standardStage`
- **Create/Update body**: `name*`, `industry`, `status`, `segment`, `revenue`,
  `employees`, `website`, `phone`, `address`, `city`, `state`, `country`,
  `description`, `customData`
- **`status` enum**: `CUSTOMER`, `OPPORTUNITY`, `LEAD`, `CHURNED`
- **Bulk**: `POST /companies/bulk-status` `{ uuids*, status* }` ·
  `POST /companies/import` `{ records* }`

## Deals — `/deals` (perms `deals:{read,create,update,delete}`)

- **List filters**: `companyId`, `repId`, `lifecycleId`, `currentStateId`, `standardStage`
- **Create/Update body**: `title*`, `description`, `value`, `currency`,
  `companyId`, `repId`, `lifecycleId`, `currentStateId`, `expectedCloseDate`,
  `probability`, `customData`
- **Move stage**: `POST /deals/{uuid}/move-stage` `{ toStateId* }`
  (helper: `crm move-deal <uuid> '{"toStateId":7}'`)
- **Contacts**: `POST /deals/{uuid}/contacts` `{ personId*, role }` ·
  `DELETE /deals/{uuid}/contacts/{personId}`
- **Kanban / counts**: `GET /deals/kanban?lifecycleId=` ·
  `GET /deals/count-by-state?stateId=` ·
  `POST /deals/reassign-state` `{ fromStateId*, targetStateId* }`
- **Needs-attention**: `PATCH /deals/{uuid}/needs-attention` `{ value*, reason? }` (perm `deals:update`)

## Leads — `/leads` (perms `leads:{read,create,update,delete}`)

- **List filters**: `source`, `ownerId`, `lifecycleId`, `currentStateId`,
  `standardStage`, `leadSourceDetail`, `includeConverted`
- **Create/Update body**: `name*`, `companyId`, `jobTitle`, `email`, `phone`,
  `source`, `score`, `lifecycleId`, `currentStateId`, `ownerId`, `personId`,
  `standardStage`, `customData`
- **Lifecycle transition** (generic state machine): `POST /leads/{uuid}/transition` `{ newStateId* }`
- **GTM board lane advance** (the idempotent, sole-writer seam — perm
  `gtm:transition`): `POST /leads/{uuid}/gtm-transition`
  `{ from_lane*, to_lane*, context_patch? }` + **required `Idempotency-Key` header**.
  Lane values are KEYS (capitalized, e.g. `Sourced`). Stale `from_lane` → `409`.
  (helper: `crm advance-lead <uuid> '{"from_lane":"Sourced","to_lane":"Enriched"}' --key K`)
- **Needs-attention**: `PATCH /leads/{uuid}/needs-attention` `{ value*, reason? }` (perm `leads:update`)
- **Bulk**: `POST /leads/import` `{ records* }` · `POST /leads/bulk-delete` `{ uuids* }`

## People (contacts) — `/people` (perms `people:{read,create,update,delete}`)

- **List filters**: `companyId`, `status`
- **Create/Update body**: `firstName*`, `lastName*`, `email`, `phone`, `title`,
  `companyId`, `status`, `description`, `customData`
- **Bulk**: `POST /people/bulk-create` `{ records* }` ·
  `POST /people/bulk-delete` `{ uuids* }` ·
  `POST /people/bulk-status` `{ uuids*, status* }` ·
  `POST /people/find-companies` `{ names* }`

## Tasks — `/tasks` (perms `tasks:{read,create,update,delete}`)

- **List filters**: `status`, `priority`, `assigneeId`, `linkedEntityType`, `linkedEntityId`
- **Create/Update body**: `title*`, `description`, `status`, `priority`,
  `assigneeId`, `dueDate`, `linkedEntityType`, `linkedEntityId`
- **Board**: `GET /tasks/board` · **Bulk**: `POST /tasks/bulk-delete`, `POST /tasks/bulk-status`

## Notes — `/notes` (perms `notes:{read,create,update,delete}`)

- **List filters**: `type`, `linkedEntityType`, `linkedEntityId`, `authorId`, `isStarred`
- **Create body**: `content*`, `title`, `type`, `linkedEntityType`,
  `linkedEntityId`, `isStarred` · **Update body**: `content`, `title`, `type`, `isStarred`

## Custom Fields — `/custom-fields` (perms `custom-fields:{read,create,update,delete}`)

- **By entity**: `GET /custom-fields/by-entity?entityType=company|deal|lead|person` ·
  `GET /custom-fields/count-by-entity?entityType=…`
- **Reorder**: `POST /custom-fields/reorder`
- Full create/update body: see `crm docs`.

## Lifecycles — `/lifecycles` (perms `lifecycles:{read,create,update,delete}`)

Workflow definitions + states + transitions. Highlights:
- **Lifecycle**: `{ name*, category*, description, isActive, isDefault }`; filters `category`, `isActive`
- **States**: `GET|POST /lifecycles/{uuid}/states` `{ name*, description, color, position, standardStage, isInitial, isFinal }`
- **Transitions**: `POST /lifecycles/{uuid}/transitions` `{ fromStateUuid*, toStateUuid*, name, description, isAutomatic, conditions }`
- **Execute**: `POST /lifecycles/execute-transition` `{ lifecycleUuid*, fromStateUuid*, toStateUuid*, entityType*, entityId*, metadata }`
- **Available / log**: `GET /lifecycles/available-transitions?lifecycleUuid=&currentStateUuid=` ·
  `GET /lifecycles/transition-log?entityType=&entityId=`
- State actions + field-permissions sub-resources — see `crm docs`.

## GTM Campaigns — `/gtm-campaigns` (perms `gtm-campaigns:{read,create,update,approve}`)

Outbound campaigns with a status machine (the Approve gate):
`draft → copy_review → approved → running ⇄ paused → done`.

- **List filters**: `status`, `paused`; `sortBy ∈ {name,status,priority,createdAt,updatedAt}`
- **Create body**: `name*`, `icpDefinition`, `channelMix[]`, `dailyCaps{}`,
  `priority`, `sequences[]` (`{ channel*, step*, delayHours?, subject?, body? }`)
- **Update body**: `name`, `icpDefinition`, `channelMix`, `dailyCaps`, `priority`,
  `sequences`, `segmentCounts`, `providerRefs`. **`status` is NOT settable here.**
  Editing content on an approved-or-later campaign re-arms the gate (→ `copy_review`).
- **Status ops**:
  - `POST /gtm-campaigns/{uuid}/transition` `{ toStatus* }` — legality enforced
    (illegal → 400); `copy_review → approved` also needs `gtm-campaigns:approve`
  - `POST /gtm-campaigns/{uuid}/pause` (running→paused) ·
    `POST /gtm-campaigns/{uuid}/resume` (paused→running)
  - `GET /gtm-campaigns/{uuid}/counts` — caps + paused + priority + per-segment counts

## Other reads

- **Audit status**: `GET /audit-status?domain=` (perm `companies:read`) — poll async
  brand-audit generation; returns `{ status, slug, url, done }`.
- **Merchant events** (inbound from saas-merchant): `POST /merchant-events`
  `{ event*, identifier*, occurredAt*, metadata }`.

---

**Not exposed here** (machine-to-machine / inbound plumbing, not part of this
skill's surface): the cadra board-host API (`/board-host/*`), inbound webhooks
(`/webhooks/*`), the sheet ingest (`/ingest/brand`), and the kanban callback
(`/kanban/cards/{id}/transition`, perm `kanban:callback`). Use the GTM lane
advance (`/leads/{uuid}/gtm-transition`) for board moves from this skill.
