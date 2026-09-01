---
name: fleet-tasks
description: Use when working on p37 Fleet Agent Tasks — yobo's per-merchant scheduled agent fan-out, where ops says "run this agent for every merchant" and each merchant gets their own run, brief and delivery. Also use when the user mentions "fleet task", "fleet agent task", "agent task", "agent_task_definitions", "agent_task_runs", "agent_task_subscriptions", "daily brief", "morning brief", "scheduled brief", "brief CTA", "AGENT_TASK_CTA", "get_daily_brief", "dev_smoke_brief", "the JSON field" or "Task input (JSON)" on a task, "input_template", "dataGate", "audience preview", "auto_enrol", "agent_tasks" feature flag, "AGENT_TASKS_ENABLED", "task-inactive / feature-disabled / bo-disabled / not-in-audience / snoozed / merchant-disabled / not-due", "skipped_no_data", "skipped_unreliable", "notified / viewed / expired" run states, "template-unresolved", "template-not-approved", "template-category-drift", "132000", "localizable_params", "backoffice/agent-tasks", "settings/scheduled-briefs", "budget-cap", "monthlyCostCapUsd", or Jira YMS-191, "schedule minute", "send_time_hour", "catch-up window", "preflight", "Merchants tab", "enrolment", "can receive", "send mode", "mock gateway", "wamid", "notified but not delivered", or "cost_usd". ALSO use when a fleet task shows no runs at all, or a query on `agent_task_*` returns 0 rows — "no definitions", "no runs", "table is empty", "nothing fired", "feature was never used", "false clean", "RLS", "app_user", "rolbypassrls" — those tables are RLS-gated and the app role reads empty. ALSO use for MANAGING fleet tasks over REST rather than through the ops UI — "manage fleet tasks from the plugin", "fleet task API", "agent-tasks API", "/api/v1/internal/agent-tasks", "internal API key", "X-Internal-API-Key", "INTERNAL_API_KEY", "create a fleet task with curl", "activate a task over REST", "previewToken", "preview token", "audience fingerprint", "AGENT_TASK_PREVIEW_SECRET", "preview_required", "audience-changed", "412", "activation endpoint", "explain skips endpoint", "retry a run", or "why did nobody get it".
---

# fleet-tasks (p37 Fleet Agent Tasks)

Jira **YMS-191**. Ships in `yobo-merchant`; `cadra-web` contributes the outbound-initiate route.

> **Sibling skills.** The Cadra half — the agent, its tools, and proving it is deployed before a
> task is activated — is `yobolabs:configure-cadra` §"Fleet tasks (yobo p37)". The WhatsApp
> transport, template and gateway truth are `yobo:whatsapp` in the `yobo` plugin.

A Cadra `agent_schedules` row pins exactly one tenant, so "run this agent for every merchant"
has no home in Cadra. p37 puts the fan-out where the merchant list lives — **yobo** — and
dispatches once per merchant with `tenantOrgId` already threaded.

**Fleet tasks address MERCHANTS, never customers.** `taskAudienceSchema` has two modes,
`all` and `filter`, and every filter key is an org column. There is no customer predicate,
so the feature cannot address a customer even by misconfiguration. A fleet task is Yobo
talking to its merchants; a campaign is a merchant talking to their customers.

## Shape

Three tables, two lanes plus an outbox (`src/db/schema/agent-tasks.ts`):

| Table | Lane | Notes |
|---|---|---|
| `agent_task_definitions` | ops / fleet | Platform-level, **no `org_id`**. `is_active` ships false — the fleet kill switch |
| `agent_task_subscriptions` | merchant | **Sparse.** A row exists only on first deviation; a NULL column means inherit |
| `agent_task_runs` | outbox | One row per `(task, org, merchant-local day)`. That unique index is both the idempotency key and the scanner's claim |

Workers (`src/server/workers/agent-task-{scanner,runner,reconcile}.worker.ts`): scanner every
5 min, runner at `limits.concurrency`, reconcile every 30 min. All three gated on
`AGENT_TASKS_ENABLED=true` and they run in the **`worker-service` container on Coolify**, not
Vercel — a Vercel deploy does not rebuild them.

Surfaces: `/backoffice/agent-tasks` (ops, gated on `admin:agent_tasks_read` / `_manage`,
granted to **Super User only** by migration 0269) and `/settings/scheduled-briefs` (merchant).

## The JSON field — the single biggest source of confusion

The ops form's one free-text box, **Task input (JSON)**, writes `input_template`. Its Zod type
is `z.record(z.string(), z.unknown())`, so **any object saves**. Only three top-level keys are
ever read:

| Key | Type | Behaviour |
|---|---|---|
| `task` | string | The prompt. Missing/blank falls back to `Run the scheduled fleet task "<key>" for this merchant and produce the brief.` |
| `context` | object | Merged into agent context. `tenantOrgId`, `trigger`, `metadata` are stripped |
| `dataGate` | `always` \| `had_activity_yesterday` | Pre-LLM cost gate. A typo resolves to `always` — the only field in p37 that fails **open** |

Anything else at the top level is stored, echoed back on reload, and **silently ignored at run
time**. `{"prompt": "..."}` saves cleanly and runs the default prompt forever. The form's only
hint mentions `{{merchantName}}` and never names the three keys, so the shape is not
discoverable from the page.

Tokens resolved at dispatch: `{{merchantName}}` `{{orgId}}` `{{taskKey}}` `{{runLocalDate}}`
`{{timezone}}`. An unknown token is left **verbatim** rather than blanked — a literal
`{{merchantname}}` in the execution input is visible; a silently emptied token produces a
prompt that reads fine and asks about nothing.

## Reading the tables — query as OWNER, or you get a FALSE CLEAN

**Do this before trusting any count.** All four `agent_task_*` tables have RLS enabled with 2
policies each, and `agent_task_definitions` has **no `org_id`** — so the app role sees **zero
rows**. Not an error, not a permission message: an empty result that reads exactly like "this
feature was never used".

| Env var | Role | Result on p37 tables |
|---|---|---|
| `DATABASE_URL` | app role | **FALSE CLEAN** — 0 rows, no error |
| `ADMIN_DATABASE_URL`, `DATABASE_MIGRATE_URL` | `neondb_owner` | correct — `rolbypassrls = true` |

```sql
SELECT current_user, (SELECT rolbypassrls FROM pg_roles WHERE rolname = current_user);
```

Measured 2026-08-31 against the same dev database: the app role reported **0 definitions, 0
runs**; the owner reported **3 definitions, 659 runs, 5 delivered**. A whole afternoon of
diagnosis was spent on the wrong system because of the first answer.

Same trap for the merchant lane — `agent_task_subscriptions` and `agent_task_notifications` are
org-scoped, so the app role sees one org's rows and no more. Env→host mapping for the dev
database is in `_context/_runbooks/yobo-dev-db-migrations.md`; the preview database is a
different, much smaller one.

## Why nothing fired — the six gates

First blocker wins. Gates 1, 3 and 4 are ops and 5–7 are the merchant, so a merchant can never
re-enable what ops disabled.

**Gate 2 was RETIRED** (`feature/YMS-191-fleet-task-no-flag-toggle`). It was the per-task,
per-org `agent_task:<key>` flag, and it was three-quarters duplicate: "turn this task off" is
gate 1, "which merchants" is gate 4, "not this merchant" is gates 3/6. Its only unique
capability was a hashed percentage rollout, which a previewable `audience` filter replaces.
Numbering keeps the spec's 1/3/4/5/6/7 so §2.4 references still resolve.

⚠️ **A gate 1–7 skip writes NO run row.** `resolveEffectiveTask` returns
`{due:false, reason}`, the scanner increments an **in-memory counter**
(`agent-task-scanner.worker.ts:357`) and only `due` rows reach `claimRuns` at `:364`. So none of
the seven reasons below ever appears in `agent_task_runs.status_reason`, and a blocked task is
**invisible in the ops run table** — indistinguishable from a task nobody has created. Only
reasons produced *after* the claim (`budget-cap`, `skipped_no_data`, `tool-failure-gate`,
`send-ok`, `send-error`) land on a row. **Zero run rows for a task is a gate 1–7 diagnosis, not
evidence that the workers are down.**

| # | Gate | Reason |
|---|---|---|
| 1 | `definition.is_active` | `task-inactive` |
| 3 | ops per-merchant disable | `bo-disabled` |
| 4 | audience membership | `not-in-audience` |
| 5 | merchant snooze | `snoozed` |
| 6 | merchant enabled / `auto_enrol` | `merchant-disabled` |
| 7 | right local **hour AND minute**, and weekday | `not-due` |

Plus `invalid-schedule` and `invalid-timezone`, which skip rather than throw.

**Gate 7 is AT-OR-AFTER inside a 60-minute catch-up window, not equality.** `schedule` carries
`minute` as well as `hour` (absent ⇒ 0, so every pre-minute schedule keeps its meaning). Equality
cannot work: the scanner ticks every 5 minutes, so any minute that is not a multiple of 5 would be
unreachable. Unbounded at-or-after is worse — activating a task at 23:00 with an 07:00 schedule
would fire that morning's brief the same night. The window also repairs a tick lost to a worker
restart, which under equality skipped that merchant for the whole day. Double firing is impossible
regardless: `agent_task_runs` is UNIQUE on `(task, org, run_local_date)`.

⚠️ **A per-merchant `send_time_hour` override BEATS the definition's hour**, and it is invisible
unless you look. An org silently pinned to another hour reads as `not-due` with nothing on any
screen explaining it. Check `agent_task_subscriptions.send_time_hour` before debugging gate 7.


**There is now ONE flag, and it is feature-level: `agent_tasks`.**

| | |
|---|---|
| **Absent row** | **ENABLED** — this inversion is the point; a task runs the moment ops activates it |
| `is_enabled = false` | the fleet kill switch, one UPDATE, no restart |
| `rollout_percentage` | **not read.** A partial fleet is an `audience` filter, which ops can preview |

The old gate answered "was a second, invisible switch also thrown?" — and creating a definition
never threw it. Two live tasks were lost that way. Nothing to toggle now.

## WhatsApp is a two-step pull, never a push

Only an inbound message opens Meta's 24-hour window, and a quick-reply tap is an inbound
message. So `running → notified` sends an **approved UTILITY template with a quick-reply
button**, and the brief is produced only when the merchant taps: `notified → viewed`, or
`notified → expired` when the reminder allowance runs out.

The adapter implements `notify` + `deliverOnDemand` and deliberately has **no `deliver`** — a
brief cannot be pushed on this channel even by mistake. The tap answer must land in the SAME
turn as the `get_daily_brief` tool result, because msg-api's composer distrusts price- and
percent-shaped text unless a same-turn tool result backs it. Pre-loading the brief silently
re-breaks that guard.

`get_daily_brief` is **split across two repos**: the handler is yobo
(`src/server/tools/get-daily-brief.ts`, reached through the single dispatcher
`POST /api/v1/internal/tools`, no route of its own); the definition is a Cadra `tools` row plus
an `agent_tools` link. **Missing the Cadra half is the gap most likely to be shipped** — the
send half works perfectly without it and the merchant taps into silence.

Full detail: `references/fleet-tasks.md`.

## Where the brief is stored

| Store | Org-scoped | Holds the text |
|---|---|---|
| `agent_task_runs.payload_snapshot` | yes | **no** — delivery facts + `bodyHash`/`bodyLength` + masked destination |
| `agent_task_notifications` (`in_app` only) | yes, RLS | yes, sanitized markdown |
| Cadra `agent_executions.output` | by `tenantOrgId` | yes — the only copy for WhatsApp/email/cadra_channel |

The snapshot deliberately excludes the body: "the delivered body" and "MUST NOT contain
customer PII" cannot both be true, and no redaction pass reliably strips names from prose. So
for a WhatsApp task **yobo has no copy of what the merchant was told** — correctness depends on
Cadra execution retention.

## The ops surface — everything is configurable from `/backoffice/agent-tasks`

Definitions, schedule (hour **and** minute), audience, channel, `auto_enrol`, all six limits,
`alternative_on_exhaustion`, per-merchant enrolment, per-merchant overrides, the delivery kill
switch, and a preflight gate on Activate. Detail, including which control writes which column and
what preflight actually proves: `references/ops-surface.md`.

**Preflight before Activate.** `bo.preflight` proves a saved definition against one enrolled
merchant across agent, prompt, audience, channel, destination, template, budget and send-mode. A
layer that cannot be evaluated is a WARNING, never a pass — an unreachable Cadra must not read as
a healthy agent.

## Managing tasks over REST — no session, no psql

`/backoffice/agent-tasks` needs a Super User NextAuth session, which a script, an agent or a
teammate does not have. The supported alternative is the internal REST API — **not psql**, which
bypasses every gate in this feature.

| | |
|---|---|
| Base | `/api/v1/internal/agent-tasks` on `https://<yobo-merchant-host>` — dev and prod origins are in `_ai/server/server-inventory.yaml` |
| Auth | `X-Internal-API-Key: $INTERNAL_API_KEY`. Platform-scoped, no `orgId` |
| Covers | definitions, audience preview, preflight, per-merchant skips, enrolment + overrides, runs, rollup, retry |
| Reads | `withPrivilegedDb` throughout — the app role would report a **false clean** |
| Omits | `setSendMode`. Read-only `fleet.sendMode` comes back with the definition list |

**The preview gate survives the port, and is stricter here.** tRPC accepts a bare
`previewFingerprint` — fine for a browser that can only get it by previewing, useless against a
script that can echo any string. So `POST /audience/preview` mints a signed, expiring,
audience-bound `previewToken` and activation demands one. Widen the filter after previewing and
you get `412 preview_required` with `reason: "audience-changed"`.

`POST /definitions` **cannot set `is_active` at all** — `POST /definitions/{id}/activation` is
the only writer, so both gates (preview token, and preflight with no `fail`) sit on one path.
Re-pointing a LIVE task's audience needs a token too: that is the server form of the editor's
"editing an audience control withdraws activation". Deactivation never needs anything.

Endpoints, curl sequences, the token's secret ladder and the operator traps:
`references/rest-api.md`.

## "Sent" is not "delivered" — three layers each fake success

A run reaching `notified` means yobo handed the message off. It does not mean anything arrived,
and on dev it usually means nothing left the process.

| Layer | Where | The fake success |
|---|---|---|
| 1 | `system_config.daily_digest.send_mode` | anything but the exact string `live` swaps in the mock ADAPTER; the run still reaches `notified` and only `payload_snapshot.mode` says `mock` |
| 2 | the gateway behind `WHATSAPP_SERVICE_API_URL` | a mock provider returns synthetic `wamid.` ids **with the real recipient encoded in them** |
| 3 | Meta delivery | never recorded — `providerRef` is written once and never updated |

Fixing layer 1 reveals layer 2 underneath. Full detail in `yobo:whatsapp` →
`references/dev-gateway-and-delivery-truth.md`.

## Traps

- **Meta `132000` / `localizable_params`** — the runner passes a fixed pair to whatever template
  resolves. A template declaring a different parameter count rejects the **whole** message: the
  merchant gets nothing and the run row still reads `notified`. The adapter clamps to the count
  declared in the stored `components`.
- **Category drift is silent at Meta.** A UTILITY template can be approved as MARKETING or
  recategorised later with no notification; sends keep "succeeding" and merchants stop
  receiving. msg-api's watcher is unreachable for a yobo-submitted template, so the adapter
  checks `whatsapp_template.category` itself on every send.
- **Destination ladder never reads `users.phone`** — subscription `destination.phone` (E.164),
  then `daily_digest_configs.phone_number`. Email falls back to the org's active owner.
  `cadra_channel` has **no** fallback and fails `no-destination`.
- **`skipDefaultConfig: true`** on the send means the global `org_id IS NULL`
  `message_phone_numbers` row is not a fallback — each participating org needs its own row
  carrying the WABA that owns the template.
- **Mock delivery still costs an LLM run.** The runner dispatches to Cadra *before* delivery;
  `mock` only suppresses the send. Watch `limits.monthlyCostCapUsd` or expect `budget-cap`.
- **The preview gate is deliberate.** Activate is unavailable until the audience currently in
  the form has been previewed, and editing any audience control withdraws activation. It stops
  previewing twelve merchants, widening, and activating against four thousand paid runs.
- **A template approved on the dev WABA does not exist on prod.** Different WABA, separate Meta
  submission and approval.

## Prod procedure

⚠️ **`_context/_runbooks/yobo-fleet-agent-tasks-prod.md` DOES NOT EXIST** (checked 2026-08-31).
Earlier versions of this skill cited it as written. Do not go looking for it, and do not treat
its absence as "the procedure is somewhere else" — nobody has written one.

Until it is written, prod state is: **nothing is provisioned.** Verified 2026-08-31 as
`neondb_owner` on prod — 0 definitions, 0 subscriptions, 0 runs, 0 `agent_task:*` flags. Rollback
needs no code either way, because every gate is data:

| Scope | Action |
|---|---|
| Whole fleet | `is_active = false` (gate 1) |
| One merchant | `bo_disabled = true` on their subscription (gate 3) |
| A cohort | narrow the `audience` filter (gate 4) |

Before any prod flip, check the two halves that ship separately and fail silently: a CTA template
`APPROVED` on the **prod** WABA (a dev approval does not carry over), and each participating org's
own `message_phone_numbers` row — `sendTemplateMessage` passes `skipDefaultConfig: true`, so the
global `org_id IS NULL` row is not a fallback.
