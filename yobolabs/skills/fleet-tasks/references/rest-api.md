# Driving fleet tasks over REST — `/api/v1/internal/agent-tasks/*`

The API-key management surface for p37. Use it instead of `/backoffice/agent-tasks` when a
script, an agent, or a teammate without a Super User session needs to manage the fleet.

**NEVER manage fleet tasks with psql.** Every gate in this feature is enforced in application
code — the preview token, the jsonb validators, the state machine, the FK on `created_by`. A
direct UPDATE bypasses all of them, and both ways p37 has actually lost tasks in anger were "a
row was written that no code path would have written".

Ships on `feature/YMS-191-fleet-tasks-rest-api`. Source: `yobo/src/app/api/v1/internal/agent-tasks/**`
(routes), `yobo/src/server/services/agent-tasks/management.ts` (service),
`yobo/src/server/services/agent-tasks/preview-token.ts` (the gate).

## Auth

One header, every call:

```bash
export YOBO=https://<yobo-merchant-host>           # dev and prod origins: _ai/server/server-inventory.yaml
export KEY="$(grep -E '^INTERNAL_API_KEY=' /path/to/yobo/.env.local | cut -d= -f2-)"

curl -s -H "X-Internal-API-Key: $KEY" "$YOBO/api/v1/internal/agent-tasks/definitions"
```

| | |
|---|---|
| Header | `X-Internal-API-Key`, validated timing-safe against `INTERNAL_API_KEY` |
| Scope | **platform-wide.** No `orgId` param — `agent_task_definitions` has no `org_id` column |
| Envelope | `{"success":true,"data":…}` / `{"success":false,"error":…,"code":…}` |
| Identity | **none.** The key names no person — see *The actor is caller-asserted* |

`CADRA_API_KEY` is a different key for a different subsystem and 401s here. So does a NextAuth
cookie: this lane does not read sessions, which is the whole reason it exists.

## Route table

| Method | Path | What it does |
|---|---|---|
| `GET` | `/definitions?includeInactive=` | list + **fleet status** (feature flag, send mode) |
| `POST` | `/definitions` | create (`id` absent) or update (`id` present). **Cannot set `is_active`** |
| `GET` | `/definitions/{taskId}` | one row + `audienceFingerprint` + live `audienceCount` |
| `POST` | `/definitions/{taskId}/activation` | **the only writer of `is_active`.** Both gates live here |
| `GET` | `/definitions/{taskId}/preflight?sampleOrgId=` | the eight verdicts |
| `GET` | `/definitions/{taskId}/skips?limit=` | per-merchant gate verdict — why nobody got it |
| `GET` | `/definitions/{taskId}/enrolments` | rows that EXIST (the table is sparse) |
| `POST` | `/definitions/{taskId}/enrolments` | enrol / ops-kill / per-merchant overrides |
| `POST` | `/audience/preview` | count + sample + **`previewToken`** |
| `GET` | `/merchants?search=` | merchant lookup for building a cohort (max 50) |
| `GET` | `/runs?taskId=&orgId=&status=&fromLocalDate=&toLocalDate=&limit=` | the run table |
| `GET` | `/runs/rollup?runLocalDate=YYYY-MM-DD&taskId=` | daily rollup + the alerts that day fires |
| `POST` | `/runs/{runId}/retry` | `failed → pending`, through `transitionRun` |

Codes: `401` bad key · `400` schema (`issues[]` names the field) · `404` no such task/run/org ·
`409` preflight failed, or an illegal state-machine edge · `412` **the preview gate**, with
`reason`.

**`setSendMode` is deliberately absent.** Flipping the delivery kill switch has a wider blast
radius than the rest of this surface. `send_mode` is returned READ-ONLY on `GET /definitions`;
change it in the ops UI.

## The activation gate — and why REST is stricter than tRPC

The rule: **a task cannot be activated against an audience nobody previewed.** It exists because
ops previews twelve merchants, widens `businessCategory`, and activates against four thousand
paid runs. Nothing downstream catches that — the scanner does exactly what it was told, and a
gate 1–7 skip writes no row, so the mistake stays invisible until the bill arrives.

`bo.upsertDefinition` enforces it with a bare `previewFingerprint`. That is enough for a browser,
which can only obtain the hash by calling `bo.previewAudience`. **It is not enough for a lane a
script drives** — a script can echo any string. So REST issues a capability token:

```
v1.<audience fingerprint>.<issuedAtMs>.<HMAC-SHA256>
```

| Property | Job |
|---|---|
| **Signed** | cannot be constructed by a caller who never previewed |
| **Audience-bound** | activate re-derives the fingerprint from the audience being written; widening after previewing is `412 audience-changed` |
| **Expiring** | 15 min default (`AGENT_TASK_PREVIEW_TTL_SECONDS`, clamped 60–3600). A preview is a snapshot of a fleet that moves |

Secret ladder, first match wins: `AGENT_TASK_PREVIEW_SECRET` → `EXECUTION_CONTEXT_SECRET` →
`INTERNAL_API_KEY`. The last rung is **degraded, and every preview reports which one minted it in
`secretSource`** — the caller holds that key, so a determined caller could reimplement the HMAC.
It still stops the mistake the gate is for, which is a widened filter, not an attacker. Set
`AGENT_TASK_PREVIEW_SECRET` to close it properly. With **no** secret the gate fails CLOSED and
activation over REST is refused entirely.

### Both doors are gated

There are exactly two ways `is_active` could move. Neither is open:

| Door | Rule |
|---|---|
| `POST /definitions` with `isActive` | **400 — the field is not on the schema.** One activation path is what keeps the gate greppable |
| `POST /definitions` changing the audience of an ALREADY-ACTIVE task | needs a `previewToken` for the NEW audience, else 412. This is the server form of the editor's *"editing an audience control withdraws activation"* |

Activation **also** refuses on any preflight `fail` (409, failing layers named), matching the
editor. A `warn` never blocks — unreachable Cadra and a mocked `send_mode` are reported, not
refused. **There is no override parameter**, under any spelling.

### The full sequence

```bash
# 1. Save it. Born INACTIVE; there is no way to say otherwise.
curl -s -X POST -H "X-Internal-API-Key: $KEY" -H 'Content-Type: application/json' \
  -d '{"key":"morning_brief","name":"Morning Brief",
       "agentUuid":"<deployed cadra agent uuid>",
       "schedule":{"kind":"daily","hour":7,"minute":30},
       "audience":{"mode":"filter","businessCategory":["food_beverage"]},
       "defaultChannel":"whatsapp",
       "inputTemplate":{"task":"Write today’s brief for {{merchantName}}."}}' \
  "$YOBO/api/v1/internal/agent-tasks/definitions"          # 201 → data.definition.id

# 2. LOOK at who it reaches. This is the step the gate exists to force.
curl -s -X POST -H "X-Internal-API-Key: $KEY" -H 'Content-Type: application/json' \
  -d '{"audience":{"mode":"filter","businessCategory":["food_beverage"]},"sampleSize":10}' \
  "$YOBO/api/v1/internal/agent-tasks/audience/preview"     # count, sample, previewToken

# 3. Prove it can run. Read every verdict yourself — canActivate is an opinion.
curl -s -H "X-Internal-API-Key: $KEY" \
  "$YOBO/api/v1/internal/agent-tasks/definitions/$TASK/preflight"

# 4. Activate with the token from step 2, for the SAME audience.
curl -s -X POST -H "X-Internal-API-Key: $KEY" -H 'Content-Type: application/json' \
  -d '{"isActive":true,"previewToken":"v1.…","actor":{"actorLabel":"sean via skill"}}' \
  "$YOBO/api/v1/internal/agent-tasks/definitions/$TASK/activation"
```

Change the audience between 2 and 4 and step 4 answers:

```json
{"success":false,"code":"preview_required","reason":"audience-changed",
 "error":"The audience has changed since it was previewed. Preview the audience you are about to activate, then activate with the token that preview returns."}
```

`reason` is one of `missing` · `expired` · `audience-changed` · `bad-signature` · `malformed` ·
`no-secret`. They need different fixes, which is why they are not one 403.

### Rolling back

Instant, needs no token, never refused:

```bash
curl -s -X POST -H "X-Internal-API-Key: $KEY" -H 'Content-Type: application/json' \
  -d '{"isActive":false}' "$YOBO/api/v1/internal/agent-tasks/definitions/$TASK/activation"
```

A kill switch that needs a working preview is one that is unavailable in the minute it is needed.
One merchant instead of the fleet: `{"orgId":N,"boDisabled":true}` on `/enrolments`.

## Traps this API will not save you from

### 1. `agent_tasks` ABSENT means ENABLED

`GET /definitions` returns `fleet.featureEnabled` so you never have to guess. An absent
`feature_flags` row is **ON** — the inversion is deliberate, so a task runs the moment ops
activates it. Only a present row with `is_enabled=false` kills the fleet. `rollout_percentage` is
**not read**; a partial fleet is an `audience` filter, which is previewable.

An operator assuming the usual polarity concludes the fleet is off while it is running.

### 2. Zero runs is a GATE diagnosis, not "the workers are down"

**A gate 1–7 skip writes NO run row.** `resolveEffectiveTask` returns `{due:false, reason}`, the
scanner bumps an *in-memory* counter, and only `due` rows reach `claimRuns`. So none of the seven
reasons ever reaches `agent_task_runs.status_reason`, and in the run table a blocked task and a
task nobody created are the same emptiness.

`GET /runs` returning `items: []` means **go to `/skips`**, not "restart the workers":

```bash
curl -s -H "X-Internal-API-Key: $KEY" \
  "$YOBO/api/v1/internal/agent-tasks/definitions/$TASK/skips?limit=100"
```

It re-runs the REAL resolver, so it cannot drift from the scanner. Reasons: `task-inactive` (1) ·
`bo-disabled` (3) · `not-in-audience` (4) · `snoozed` (5) · `merchant-disabled` (6) ·
`not-due` (7).

⚠️ `not-due` only means "not this hour". Read `sendTimeHourOverride` on the same row **before**
debugging it: a per-merchant `send_time_hour` BEATS the definition's hour and is invisible on
every other surface. Gate 7 is at-or-after inside a 60-minute catch-up window, not equality.

### 3. `notified` is not delivery

A run reaching `notified` means yobo handed the message to a transport. Three layers below that
each fake success:

| Layer | Fake success |
|---|---|
| `system_config.daily_digest.send_mode` | anything but the exact string `live` swaps in the MOCK adapter; the run still reaches `notified` |
| the gateway behind `WHATSAPP_SERVICE_API_URL` | a mock provider returns synthetic `wamid.` ids **with the real recipient encoded in them** |
| Meta delivery | never recorded — `providerRef` is written once and never updated |

`GET /definitions` returns `fleet.sendMode` and a sentence saying which is in force. Fixing layer
1 reveals layer 2 underneath; on dev the gateway is a mock. See `yobo:whatsapp`.

### 4. The other four

- **`inputTemplate` is `.strict()`.** Only `task`, `context` and `dataGate` are ever read.
  `{"prompt":"…"}` is a **400 here** — it used to save cleanly and run the default prompt forever.
- **Enrolments are SPARSE.** An empty list with `autoEnrol: true` means "nobody customised
  anything"; with `autoEnrol: false` it means the task runs for **nobody**. The `note` field says
  which — read it.
- **`enabled` (gate 6) and `boDisabled` (gate 3) are different switches.** Gate 3 sits above every
  merchant gate; an enrol must never clear an ops kill, so they are separate fields. `null` on an
  override clears it and restores inheritance — and `null` is not `0`, which is midnight.
- **`cost_usd` on a run is a RESERVATION**, written before the run as `perRunCostCapUsd`. Three
  runs read `0.500000` while costing ~`0.0106`. Measured cost is `ai_usage_records.cost_usd`
  joined on `execution_uuid`.

## The actor is caller-asserted

`INTERNAL_API_KEY` is one shared string that names no person, so **nothing this API writes claims
to know who acted.** Every mutation accepts an optional `actor`:

```json
{"actor": {"actorUserId": 12, "actorLabel": "sean via fleet-tasks skill"}}
```

`actorUserId` is validated against `users.id` — a dangling `created_by` is refused, not written —
and comes back as `assertedActorUserId` under `identity: "caller-asserted"`. Do not read it as an
audit identity. If you need a real one, act in `/backoffice/agent-tasks`.

## Reading the tables directly — if you must, query as OWNER

This API always reads through `withPrivilegedDb`, so its numbers are correct. A hand-rolled query
is where the false clean lives: all four `agent_task_*` tables are RLS-gated and
`agent_task_definitions` has **no `org_id`**, so the app role sees zero rows — no error, no
permission message. Measured on the same dev database: app role **0 definitions, 0 runs**; owner
**3 / 659**. Use `ADMIN_DATABASE_URL` — and prefer this API.
