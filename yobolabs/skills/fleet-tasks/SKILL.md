---
name: fleet-tasks
description: Use when working on Yobo Fleet Agent Tasks (p37), the per-merchant scheduled agent fan-out where ops runs one agent for every merchant and each gets its own run, brief and delivery. Triggers include "fleet task", "agent task", "daily brief", "scheduled brief", "brief sent twice", "brief from the wrong WhatsApp number", and agent_task_* queries returning 0 rows.
---

# fleet-tasks (p37 Fleet Agent Tasks)

Jira **YMS-191**. Ships in `yobo-merchant`; `cadra-web` contributes the outbound-initiate route.

> **Sibling skills.** The Cadra half — the agent, its tools, and proving it is deployed before a
> task is activated — is `yobolabs:configure-cadra` §"Fleet tasks (yobo p37)". The WhatsApp
> transport, template and gateway truth are `yobo:whatsapp` in the `yobo` plugin.

A Cadra `agent_schedules` row pins exactly one tenant, so "run this agent for every merchant"
has no home in Cadra. p37 puts the fan-out where the merchant list lives — **yobo** — and
dispatches once per merchant with `tenantOrgId` already threaded.

**Fleet tasks address MERCHANTS, never customers.** `taskAudienceSchema` has three modes:
`all`, `filter` (legacy), and **`rules`** — the only mode the ops UI writes (since 2026-09-18). Every
key is a condition on the merchant org. There is no customer predicate, so the feature cannot address
a customer even by misconfiguration. A fleet task is Yobo talking to its merchants; a campaign is a
merchant talking to their customers.

**`rules` keys:** `nameMatches` / `nameExcludes` (`[{op:'startsWith'|'contains', value}]`,
case-insensitive, `%`/`_` literal; matches OR together, excludes remove), `countries` (ISO-2 derived
from `orgs.timezone`, `unknown` for `UTC`/`Etc/*` — `is_indonesian` is NOT a country signal, it
defaults true), `onboardingStatus` (`null` = none), `hasConnector`, `businessCategory`,
`signedUpFrom/To` (UTC date of `created_at`), `requireBusinessProfile`, `requireReachable` (the
task channel's delivery ladder in SQL), `notReceivedTodayTaskId`. All AND together; no rules = every
active merchant. **There are no hand-picked merchant lists** — `includeOrgIds`/`excludeOrgIds`
existed briefly on 2026-09-18 and were removed at Sean's request ("I never wanted to add an explicit
merchant"); a stored one surfaces as a legacy part that blocks saving.

**`rules` is a NEW mode, `.strict()`, on purpose — fail closed.** `readAudience` parses with a plain
`z.object`, which STRIPS unknown keys: a worker built before a new narrowing key would read it as an
empty filter = the whole fleet. An unknown MODE is rejected instead → `InvalidAudienceError` → the
scanner skips that one task. Any future narrowing key must keep this property.

## Shape

Three tables, two lanes plus an outbox (`src/db/schema/agent-tasks.ts`):

| Table | Lane | Notes |
|---|---|---|
| `agent_task_definitions` | ops / fleet | Platform-level, **no `org_id`**. `is_active` ships false — the fleet kill switch |
| `agent_task_subscriptions` | merchant | **Sparse.** A row exists only on first deviation; a NULL column means inherit |
| `agent_task_runs` | outbox | One row per `(task, org, merchant-local day)`. That unique index is both the idempotency key and the scanner's claim |

Workers (`src/server/workers/agent-task-{scanner,runner,reconcile}.worker.ts`): scanner every
5 min, runner at `limits.concurrency`, reconcile every 30 min. All three gated on
`AGENT_TASKS_ENABLED=true` and they run in the hand-deployed **`worker-service` container** (a raw
`docker run`, NOT Coolify — corrected 2026-09-18), not Vercel — a Vercel deploy does not rebuild them.

Surfaces: `/backoffice/agent-tasks` (ops, gated on `admin:agent_tasks_read` / `_manage`,
granted to **Super User only** by migration 0269) and `/settings/scheduled-briefs` (merchant). A
task opens in a **right-side drawer** over the list, addressed as
`/backoffice/agent-tasks?task=<id|new>&tab=<tab>`; `/backoffice/agent-tasks/<id>` redirects there.

## Interval schedules (since `9da1d3406`, 2026-09-02)

`schedule.kind` is `daily`, `weekly`, or **`interval` `{everyMinutes ≥15 multipleOf 5, fromHour, toHour (exclusive), dow?}`**. The
runs idempotency key grew a `run_local_slot` column — `'day'` for daily/weekly, `'HH:MM'` (slot start,
merchant-local) for interval — so an interval task claims one row per slot per merchant-local day.
Gate 7 picks the LATEST due slot only, with the catch-up window shrunk to `min(60, everyMinutes)`;
missed slots are never backfilled. `subscription.send_time_hour` is ignored for interval tasks.
Preflight FAILs `whatsapp` and any reminder allowance on an interval task (heartbeats are
`cadra_channel`/`in_app`/`email`/`mock`), and WARNs the monthly-cap arithmetic
(`slots/day × audience × perRunCostCapUsd × 30`). Editing the schedule of a LIVE task withdraws
activation (tRPC) / `412 preview_required` (REST) exactly like an audience edit. Spec:
`_context/yobo-merchant/_specs/p37-fleet-agent-tasks/SPEC-CHANGE-interval-schedule.md`.

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

Gates 1/3/4 (ops) and 5–7 (merchant); a gate skip writes **NO run row**, so zero runs is a gate
diagnosis, not dead workers. **When a task shows no runs or a merchant got nothing, read
`references/troubleshooting.md`** (gate table, gate-7 catch-up window, `send_time_hour` override, the one `agent_tasks` flag).

## WhatsApp is a two-step pull, never a push

Only an inbound message opens Meta's 24-hour window, and a quick-reply tap is an inbound
message. So `running → notified` sends an **approved UTILITY template with a quick-reply
button**, and the brief TEXT reaches the merchant only when they tap: `notified → viewed`, or
`notified → expired` when the reminder allowance runs out.

⚠️ **The brief is GENERATED BEFORE the CTA is sent — the tap only DELIVERS it.** (Corrected
2026-09-03; this section used to say "produced only when the merchant taps", which contradicted
the mock-delivery trap below and is wrong.) `agent-task-runner.worker.ts:16-24` dispatches to
Cadra at **step 4** and sends the CTA at **step 7b**; on tap `on-demand.ts:162-171` **reads
back** that execution and fails `brief-unavailable` if its output is empty. There is no second
generation, and `agent-task-runner.worker.ts:54` states it as an invariant with a structural
test — the runner must NEVER call `deliverOnDemand`.

MEASURED on dev run `8b6b045c` (org 6864): execution completed **21:55:09**, CTA `notified_at`
**21:55:11**. The brief finished two seconds before the CTA went out, with nothing tapped.

Two consequences, both about money:

- **Every enrolled merchant costs a full LLM run whether or not anyone taps.** A brief nobody
  reads is written and thrown away — the body is never persisted, only a fingerprint
  (`agent-task-runner.worker.ts:44`). Cost the fleet on the AUDIENCE, never on expected taps.
- What starts *after* the tap is the **WhatsApp responder agent** composing its reply. Its
  `get_daily_brief` call is a FETCH of already-written text, not authoring. Confusing the two
  agents is what made this section wrong for months.

The adapter implements `notify` + `deliverOnDemand` and deliberately has **no `deliver`** — a
brief cannot be pushed on this channel even by mistake. The tap answer must land in the SAME
turn as the `get_daily_brief` tool result, because msg-api's composer distrusts price- and
percent-shaped text unless a same-turn tool result backs it. Pre-loading the brief into the
responder's context silently re-breaks that guard — which is why the runner is barred from
`deliverOnDemand` even though the brief already exists by then.

`get_daily_brief` is **split across two repos**: the handler is yobo
(`src/server/tools/get-daily-brief.ts`, reached through the single dispatcher
`POST /api/v1/internal/tools`, no route of its own); the definition is a Cadra `tools` row plus
an `agent_tools` link. **Missing the Cadra half is the gap most likely to be shipped** — the
send half works perfectly without it and the merchant taps into silence.

Full detail: `references/fleet-tasks.md`.

## Which number the CTA leaves from — the platform sender

Yobo runs **more than one platform WhatsApp line** (msg-api `channel_connections` with
`identity_gate IS NOT NULL` — one per region, and more get added). Each merchant talks to the
agent on ONE of them. The CTA must leave on that same line: the tap reply follows the CTA's
line, so a CTA on another line opens a **second thread** with the agent.

**There is no flag.** `AGENT_TASK_PLATFORM_SENDER` was deleted 2026-09-19 (CORRECTED 2026-10-06 - this
section used to say it is set `true` on the prod worker and Vercel; it is not an env var any more,
setting it does nothing). `platformSender` (`src/lib/msg-api/platform-notify.ts:133`) is the ONLY
sender: msg-api `POST /api/v1/platform-notify` (headers `X-Service-Secret` + `X-Org-Id`) -> the line
the merchant has spoken on most. No platform conversation -> refused `no_platform_conversation`, run
`failed`, no brief - by design, **no fallback** (`platform-notify.ts:32`,
`delivery/whatsapp.adapter.ts:62`). The old `defaultSender` / `resolveYoboSender()` path is gone.

⚠️ **The fix sat behind a flag, off, for 15 days (history; the flag is now deleted).** Built
2026-09-03, flipped on the prod worker 2026-09-18. Measured before the flip: all 191 CTAs in 8 days left from one WABA, and 62 of
71 recipients belonged on another line. Nothing errors — Meta delivers, the run reads `notified`,
the gateway says `READ`. The only symptom is a second thread on the merchant's phone. **Answer
"which number did they get it from" in the gateway by wamid (`waba_id`), never in yobo.**

⚠️ **A new platform line needs the CTA template on ITS WABA.** Approved at Meta on that WABA
**and** registered in the gateway for client `msg-api` (registration is per `client_id` +
`waba_id`, with a per-WABA `language`). Otherwise every merchant who resolves to that line
fails `failed to get template: record not found`.

Resolver predicates and the proof recipe: `references/fleet-tasks.md` → "WABA resolution".

## Where the brief is stored

| Store | Org-scoped | Holds the text |
|---|---|---|
| `agent_task_runs.payload_snapshot` | yes | **no** — delivery facts + `bodyHash`/`bodyLength` + masked destination |
| `agent_task_notifications` (`in_app` only) | yes, RLS | yes, sanitized markdown — but **nothing merchant-facing READS it** (only the internal test-account-cleanup daily report). `in_app` was removed from the merchant settings dropdown 2026-09-18; measured 0 subs, 0 runs, 0 rows on prod. Choosing it silently delivers nothing |
| Cadra `agent_executions.output` | by `tenantOrgId` | yes — the only copy for WhatsApp/email/cadra_channel |

The snapshot deliberately excludes the body: "the delivered body" and "MUST NOT contain
customer PII" cannot both be true, and no redaction pass reliably strips names from prose. So
for a WhatsApp task **yobo has no copy of what the merchant was told** — correctness depends on
Cadra execution retention.

## The ops surface — everything is configurable from `/backoffice/agent-tasks`

Drawer, tabs, which control writes which column, preview vs preflight (Activate needs both). **Before
editing a task in the UI, read `references/ops-surface.md`.**

## Managing tasks over REST — no session, no psql

`/api/v1/internal/agent-tasks` with `X-Internal-API-Key`; activation needs a signed `previewToken`
(`412 preview_required` otherwise). **Before scripting any fleet-task change, read `references/rest-api.md`.** Never psql.

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

Lost/late briefs, timezone provenance, destination ladder, test-account reset, duplicates, reminders,
fabrication gate, retry, openable numbers, REST 400s. **Before diagnosing a delivery bug or retrying a run, read `references/traps.md`.**

## Multi-brand owners

One brief **per brand turned ON**, judged per destination owner. Default ON = main brand
(`users.current_org_id` among brands routing to that phone, else newest owned); a brand with a
notified/viewed/delivered/expired run for the same task in the last 7 days stays ON; an explicit
`agent_task_subscriptions` row wins. Agent tools `set_daily_brief_subscription` /
`get_daily_brief_subscriptions` are allowed during onboarding via a separate self-service list in
`onboarding-clamp.ts` (else `403 onboarding_out_of_belt`). msg-api intercepts a message naming
another brand with "Tap to switch" before the agent. **Before touching brand ON/OFF, brand-family
code, the brief CTA payload or the brand tools, read `references/multi-brand.md`.**

Digest v2 (p131, 2026-10-07): a person with several brands' briefs gets ONE CTA for the focus brand
(msg-api `acting-org` -> chat target org -> recent -> main); others held `notified`. Tap adds a
pointer line for other ready+unread brands. Detail in `references/multi-brand.md`.

## Prod procedure

**Before any prod change, read `references/prod-procedure.md`** (runbook pointer, pre-flip checklist,
data-only rollback, single-env-var worker recreate).
