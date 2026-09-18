---
name: fleet-tasks
description: Use when working on p37 Fleet Agent Tasks — yobo's per-merchant scheduled agent fan-out, where ops says "run this agent for every merchant" and each merchant gets their own run, brief and delivery. Also use when the user mentions "fleet task", "fleet agent task", "agent task", "agent_task_definitions", "agent_task_runs", "agent_task_subscriptions", "daily brief", "morning brief", "scheduled brief", "brief CTA", "AGENT_TASK_CTA", "get_daily_brief", "dev_smoke_brief", "the JSON field" or "Task input (JSON)" on a task, "input_template", "dataGate", "audience preview", "auto_enrol", "agent_tasks" feature flag, "AGENT_TASKS_ENABLED", "task-inactive / feature-disabled / bo-disabled / not-in-audience / snoozed / merchant-disabled / not-due", "skipped_no_data", "skipped_unreliable", "notified / viewed / expired" run states, "template-unresolved", "template-not-approved", "template-category-drift", "132000", "localizable_params", "backoffice/agent-tasks", "settings/scheduled-briefs", "budget-cap", "monthlyCostCapUsd", or Jira YMS-191, "schedule minute", "send_time_hour", "catch-up window", "preflight", "Merchants tab", "enrolment", "can receive", "send mode", "mock gateway", "wamid", "notified but not delivered", or "cost_usd". ALSO use when a fleet task shows no runs at all, or a query on `agent_task_*` returns 0 rows — "no definitions", "no runs", "table is empty", "nothing fired", "feature was never used", "false clean", "RLS", "app_user", "rolbypassrls" — those tables are RLS-gated and the app role reads empty. ALSO use for MANAGING fleet tasks over REST rather than through the ops UI — "manage fleet tasks from the plugin", "fleet task API", "agent-tasks API", "/api/v1/internal/agent-tasks", "internal API key", "X-Internal-API-Key", "INTERNAL_API_KEY", "create a fleet task with curl", "activate a task over REST", "previewToken", "preview token", "audience fingerprint", "AGENT_TASK_PREVIEW_SECRET", "preview_required", "audience-changed", "412", "activation endpoint", "explain skips endpoint", "retry a run", or "why did nobody get it". ALSO use when a merchant got the brief from the WRONG WhatsApp number or MORE THAN ONCE — "wrong number", "different WABA", "second thread", "platform sender", "platform-notify", "AGENT_TASK_PLATFORM_SENDER", "no_platform_conversation", "duplicate brief", "brief twice", "reminders", "reminderMaxCount".
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
`AGENT_TASKS_ENABLED=true` and they run in the hand-deployed **`worker-service` container** (a raw
`docker run`, NOT Coolify — corrected 2026-09-18), not Vercel — a Vercel deploy does not rebuild them.

Surfaces: `/backoffice/agent-tasks` (ops, gated on `admin:agent_tasks_read` / `_manage`,
granted to **Super User only** by migration 0269) and `/settings/scheduled-briefs` (merchant).

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

| `AGENT_TASK_PLATFORM_SENDER` | Sender | Result |
|---|---|---|
| `true` (**prod since 2026-09-18**) | `platformSender` (`src/lib/msg-api/platform-notify.ts`) → msg-api `POST /api/v1/platform-notify` → the line the merchant has spoken on most | right line. No platform conversation → refused `no_platform_conversation`, run `failed`, no brief — by design, never a fallback |
| anything else | `defaultSender` → `resolveYoboSender()` → the ONE `message_phone_numbers` row with `org_id IS NULL` and category `DAILY_DIGEST` | every merchant on that one line |

The flag is read in **two** places: the worker (it sends) and Vercel (preflight only,
`preflight.ts:549`). Set both, or preflight grades a path the sender does not take.

⚠️ **The fix sat behind this flag, off, for 15 days.** Built 2026-09-03, flipped on the prod
worker 2026-09-18. Measured before the flip: all 191 CTAs in 8 days left from one WABA, and 62 of
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
- **Destination ladder has THREE rungs, and rung 3 IS `users.phone`** (CORRECTED 2026-09-18; this
  entry used to say the ladder never reads it, which sent a live investigation down the wrong path).
  `whatsapp.adapter.ts:672-726`: (1) subscription `destination.phone` (E.164), (2)
  `daily_digest_configs.phone_number`, (3) the org's **ACTIVE OWNER's `users.phone`** via
  `resolveOwnerPhone` (`:650`, predicate `role='owner' AND status='active'`). Rung 3 is a deliberate
  deviation from implementation.md §5, decided by Sean 2026-09-01 with the WABA quality-rating
  tradeoff in front of him and narrowed to `owner` — the reasoning is in a comment at `:625-648`,
  so read it before "restoring" the two-rung version. Email falls back to the org's active owner.
  `cadra_channel` has **no** fallback and fails `no-destination`.
- **`skipped_no_destination` is usually the TEST-ACCOUNT RESET, not a bug.** A recurring prod
  `WHATSAPP_TEST_ACCOUNT_RESET` deliberately strips test accounts' phones so WhatsApp onboarding can
  be retested clean (Sean, 2026-09-18). It nulls `users.phone`, sets `org_members.status='removed'`,
  and on newer runs also sets `agent_task_subscriptions.enabled=false` + `bo_disabled=true` — so it
  empties rung 3's BOTH halves at once and the org goes dark silently. Check `audit_logs` for
  `WHATSAPP_TEST_ACCOUNT_RESET` near the date before investigating (2026-09-16 id 249/250 = 17 orgs,
  20 users). **It costs nothing**: destination resolves BEFORE dispatch, so these runs carry 0 Cadra
  executions and $0.00 (measured 2026-09-18 prod: 161 such runs, 0 executions, $0). The reset tool's
  source is NOT in the polyrepo, so its behaviour can only be read off `audit_logs`.
- **The merchant's own `message_phone_numbers` row is NEVER read on this path** (CORRECTED
  2026-09-18; the older `skipDefaultConfig` / `META_DEFAULT` note described a lookup the adapter
  no longer makes). The merchant is only a recipient. The sender is either msg-api's line
  resolution or Yobo's own `org_id IS NULL` `DAILY_DIGEST` row — see "Which number the CTA
  leaves from".
- **"Got the brief twice" — check DEV before prod.** Prod cannot double-send one task to one
  org: `agent_task_runs` is UNIQUE on `(task, org, run_local_date, run_local_slot)`. A real
  duplicate needs two active definitions, two orgs whose owner shares a phone (ladder rung 3),
  or reminders. Measured 2026-09-18: prod sent ≤1 CTA per person per day, while the **dev**
  gateway sent 110 real (`is_mock=0`) CTAs from the dev WABA to 9 whitelisted prod recipients —
  7 active dev test definitions plus dev reminders. Map runs to people by decoding the wamid
  (recipient MSISDN is in it), not by joining phone columns.
- **Reminders on a DAILY task stack with the next day's CTA.** Defaults are
  `reminderMaxCount 3`, `reminderIntervalHours 24` — so day N's reminder lands in the same hour
  as day N+1's CTA (dev org 6912: 3 CTAs in one hour). Nothing supersedes an older run's
  reminders. Set `reminderMaxCount: 0` on daily tasks; prod `morning_brief` has 0.
- **Mock delivery still costs an LLM run.** The runner dispatches to Cadra *before* delivery;
  `mock` only suppresses the send. Watch `limits.monthlyCostCapUsd` or expect `budget-cap`.
- **The preview gate is deliberate.** Activate is unavailable until the audience currently in
  the form has been previewed, and editing any audience control withdraws activation. It stops
  previewing twelve merchants, widening, and activating against four thousand paid runs.
- **A template approved on the dev WABA does not exist on prod.** Different WABA, separate Meta
  submission and approval.
- **The fabrication gate kills a brief when a p78 READER call fails, even one the model retried.**
  `fabrication-gate.ts` suppresses on any `success === false`, and p78's `read_result` /
  `search_result` introduced a recoverable failure class: the model writes one malformed call
  (`bad_args`, empty `resultId`), the tool refuses, and it retries correctly a second later. Fixed
  2026-09-18 — the exemption is narrow on three axes (reader tool **AND** one of four recoverable
  error codes `bad_args`/`bad_query`/`bad_pattern`/`too_large` **AND** a successful reader result at
  a LATER index). An unknown code fails closed. Do not widen it to "any reader failure": `evicted`,
  `expired`, `unknown` and `query_timeout` are per-handle, so exempting them ships a brief with half
  its data invented.
- **`retry` used to be INERT — fixed 2026-09-18.** It moved the run `failed → pending` and enqueued
  nothing; the scanner only claims runs whose slot is DUE, and a retried run's slot is in the past,
  so the reconcile worker failed it again ~2 h later while the operator saw "retry succeeded". It
  now enqueues on the scanner's own queue with `jobId = runId` (dedup; a uuid has no colon, and a
  colon makes BullMQ drop the job silently) behind a **5 s deadline** — the shared ioredis client
  uses `maxRetriesPerRequest: null`, so `queue.add` **hangs rather than throws** during a Redis
  outage and a bare `await` never reaches its catch. On failure the run is rolled back to `failed`
  with reason `retry-enqueue-failed` and logs `agent_task.retry.enqueue_failed`.
- **A deliverable number is not an OPENABLE one.** The send side resolves a phone through the
  destination ladder; the TAP resolves the acting org from that phone's chat identity. They can
  disagree — a CTA lands on a handset that answers as a different org and `get_daily_brief` returns
  `BRIEF_NOT_FOUND`, with the run stuck at `notified`, preflight passed and the gateway reporting
  READ. Guarded since 2026-09-18 at the destination gate (before dispatch, so a mismatch costs no
  brief). The check compares the run's org against the number's **ACTIVE MEMBERSHIPS** — never
  `resolveChatIdentity`'s `orgId`, which may be `users.currentOrgId`, mutable web-session state that
  changes when an owner switches org in the browser.
- **The internal REST API answered 400 for server faults, and could 400 AFTER writing the row.**
  Until 2026-09-18 every route funnelled its catch into `code:'invalid'` → 400, so `POST
  /definitions` could create the definition and still report failure; the operator retries, the
  `key` now collides, and the first failure is unreproducible. Unexpected throws are now **500
  `internal`**, dependency failures **503 `unavailable`**. If you are reading older transcripts, a
  400 from these routes does NOT prove the request was malformed.

## Prod procedure

**The runbook EXISTS: `_context/_runbooks/yobo-fleet-agent-tasks-prod.md`** (written 2026-09-01; earlier skill versions wrongly said it did not). Read it before touching prod — it corrects three things this skill used to get wrong: an org does NOT need its own `message_phone_numbers` row (the merchant's row is never read — see "Which number the CTA leaves from"), the prod worker is a raw `docker run` on the prod merchant box (`hosts.qraved-merchant` in `server-inventory.yaml`), not Coolify, and `AGENT_TASKS_ENABLED` needs a container RECREATE.

**The REST management API is on prod since `9da1d3406` (2026-09-02)** — `X-Internal-API-Key` with the prod `INTERNAL_API_KEY`, same routes as dev. Before that cut the only prod write paths were the backoffice UI as Super User or SQL as `neondb_owner` with preview + preflight done by hand. `GET /definitions` returns `data.items` (not `definitions`).

**A template approved at Meta must ALSO be registered in the gateway** (`whatsapp_templates`, the sending `client_id`) or every send 500s `failed to get template: record not found` while preflight passes — see `yobo:whatsapp`. The wamid of a sent run is at `payload_snapshot.notifications[0].providerRef`.

**"Every org whose owner has a phone" cannot be an `audience` filter** (keys are org columns only). The ladder DOES reach the active owner's `users.phone` at rung 3 (see Traps), but relying on it is fragile — the test-account reset empties it, and a membership that leaves `active` silently kills delivery. For a cohort you want to stay reachable, pin rung 1: audience `all`, `auto_enrol=false`, one enabled subscription per org with `destination.phone` = the owner's E.164 phone. Check `orgs.timezone` on the cohort first — a UTC default makes "07:00 local" fire at 14:00 WIB.

Provisioned 2026-09-01 (inert, `is_active=false`, kill-switch flag false): see `_ai/sessions/2026-09-01-[yobo]-morning-brief-prod-recon.md`.

Rollback needs no code, because every gate is data:

| Scope | Action |
|---|---|
| Whole fleet | `is_active = false` (gate 1) |
| One merchant | `bo_disabled = true` on their subscription (gate 3) |
| A cohort | narrow the `audience` filter (gate 4) |

Before any prod flip, check the halves that ship separately and fail silently (CORRECTED
2026-09-18 — this used to demand each org's own `message_phone_numbers` row, which is never read):

- the CTA template `APPROVED` on the **prod** WABA of **every** platform line (a dev approval does
  not carry over) and registered in the gateway for the sending client;
- `AGENT_TASK_PLATFORM_SENDER=true` on the prod worker **and** Vercel prod;
- `reminderMaxCount: 0` on any daily or interval task.

**Changing ONE worker env var: recreate from the RUNNING container's env, not the file.**
`deploy-worker-v2.sh` recreates from `.env.production`, and that file collects other people's
staged, never-activated edits (2026-09-18: a teammate's feature flag sat in it, absent from the
container). A file-based recreate activates all of them as a side effect. Dump
`docker inspect worker-service --format '{{range .Config.Env}}{{println .}}{{end}}'`, change the
one line, `docker run` with the same image, binds, network and restart policy, then swap names —
keep the old container stopped for rollback. Update the file too, so the next deploy keeps it.
A var that looks container-only may just have a leading space in the file (Docker trims it).
