# p37 Fleet Agent Tasks — deep reference

Companion to `../SKILL.md`. Jira **YMS-191**. Paths are relative to the `yobo-merchant`
repo root unless stated otherwise.

---

## Data model

`src/db/schema/agent-tasks.ts`.

### `agent_task_definitions` — the ops lane

Platform-level, deliberately **no `org_id`**. The RLS registry entry cannot use
`isolation: 'platform'` (the generator throws "Unknown isolation level" on anything outside
`public|org|workspace|user`, which would fail the RLS deploy for *every* table), and `public`
is wrong because it force-disables RLS.

| Column | Notes |
|---|---|
| `key` | Stable handle. It used to name a per-task feature flag; that gate is retired, so renaming is now safe |
| `agent_uuid` | The Cadra agent. No picker in the UI — paste it |
| `input_template` | jsonb. See *The JSON contract* below |
| `schedule` | `{kind:'daily',hour}` or `{kind:'weekly',dow,hour}`; `dow` 0 = Sunday |
| `audience` | `{mode:'all'}` or `{mode:'filter', …}` |
| `default_channel` | one of `mock` `in_app` `email` `whatsapp` `cadra_channel` |
| `auto_enrol` | do merchants with no subscription row participate |
| `is_active` | ships **false**; the fleet kill switch, gate 1 |
| `limits` | jsonb, see defaults below |
| `alternative_on_exhaustion` | jsonb, fires once on `notified → expired`. Deliberately **not** Zod-validated — its shape is unspecified and inventing one would pin a guess |

### `agent_task_subscriptions` — the merchant lane

**Sparse.** A row exists only on first deviation or explicit enrolment; a missing row means
inherit everything. A NULL column means inherit that field. Ops' `bo_disabled` lives here too
and is read at gate 3, *before* the merchant's own `enabled` at gate 6 — so a merchant can
never re-enable what ops disabled.

### `agent_task_runs` — the outbox

Since 2026-09-02 the unique index is `(task_id, org_id, run_local_date, run_local_slot)`;
`run_local_slot` is `'day'` for daily/weekly and the merchant-local `'HH:MM'` slot start for
`interval` schedules. The scanner writes it from the resolver's due result and emits
`agent_task.scanner.claimed.slot.<slot>` per tick; reconcile never schedules a reminder or
`alternative_on_exhaustion` for a slot row.

`unique(task_id, org_id, run_local_date)` is both the idempotency key and the scanner's claim:
`INSERT … ON CONFLICT DO NOTHING RETURNING id` hands an id to exactly one pod, so exactly one
pod enqueues. An integration test fires three concurrent claims and asserts one winner.

### `agent_task_notifications` — the in-app inbox

Org-scoped, RLS-isolated, `unique(run_id)` — that uniqueness *is* the idempotency guard, so a
retried delivery updates one row rather than filling the merchant's inbox with copies of one
morning. Scoped to p37 on purpose; it is named in the schema as the migration source for a
real notification centre, and must not become one by accretion.

### `orgs.timezone`

Added by STORY-001 with a backfill. Every schedule hour is **merchant-local**, which also
spreads the fleet over ~24 waves for free. An unreadable zone skips with `invalid-timezone`,
never throws.

---

## The JSON contract (`input_template`)

Validated as `z.record(z.string(), z.unknown())` — any object saves. Read by
`buildDispatchInput` in `src/server/workers/agent-task-runner.worker.ts` and by
`readDataGate` in `src/server/services/agent-tasks/gates.ts`.

```json
{
  "task": "Write {{merchantName}}'s daily brief for {{runLocalDate}}. Use only this merchant's own data. If a tool fails, say so plainly — never estimate a number.",
  "context": { "briefStyle": "concise", "locale": "id-ID" },
  "dataGate": "had_activity_yesterday"
}
```

- Only `task`, `context`, `dataGate` are read. **Every other top-level key is silently
  ignored at run time** while still saving and rendering back — the top failure mode.
- `task` missing, non-string, or blank ⇒ the default prompt.
- `context` non-object ⇒ dropped without complaint. Reserved keys `tenantOrgId`, `trigger`,
  `metadata` are **stripped**, not rejected: a definition with a stray key must still run,
  under the correct tenant. `tenantOrgId` matters most — `getCadraClient` merges as
  `{tenantOrgId: orgId, ...callerContext}` and the caller wins, so a template carrying it
  would silently redirect the run to another org.
- The runner sets `context.trigger = 'scheduled_fleet'` and
  `context.metadata = {yoboTaskKey, yoboTaskRunId}` **inside** `context`, not at the top
  level: `ExecuteInput` declares neither, `AgentsResource.execute` forwards a fixed field
  list, and cadra-web's `sdkFormatSchema` strips unknown keys — a top-level `trigger` would
  vanish at three separate layers.

### Data gate

| Gate | Passes when |
|---|---|
| `always` (default) | always |
| `had_activity_yesterday` | ≥1 campaign send, transaction, or customer event in the merchant's previous local day |

Failing writes `skipped_no_data`. An unknown or malformed value reads as `always` — the one
place in p37 where an unreadable field opens a gate, and it is deliberate: closing here would
make one jsonb typo silently stop a fleet task forever, indistinguishable from a task nobody
qualifies for. Over-spending is visible in the cost column and capped by the budget gate;
never-delivering is invisible.

### Limits defaults

`concurrency` 10 · `monthlyCostCapUsd` 500 · `perRunCostCapUsd` 0.50 · `runTimeoutMinutes` 30
· `reminderMaxCount` 3 · `reminderIntervalHours` 24.

`reminderIntervalHours` is `min(1)`: `0` would let the 30-minute reconcile tick burn a
merchant's whole allowance inside 90 minutes.

`reminderMaxCount` is **`min(0)`** (CORRECTED 2026-09-18 — this section said `min(1)`; the code
changed in `d337ff71c`, see the comment at `src/db/schema/agent-tasks.ts:291`). `0` means
"notify once, never re-send, expire when the interval elapses". It became necessary because an
interval task MUST carry `0` (slot N's reminder would land on slot N+1's brief) and preflight
FAILs it otherwise.

⚠️ **The default `3` is wrong for a DAILY task, for the same reason.** With a 24h interval, day
N's reminder lands in the same hour as day N+1's CTA, and day N-1's second reminder can land
there too. See "Reminders". Set `0` on every daily task; prod `morning_brief` carries `0`.

---

## Audience

A **query, not a stored list** — a merchant onboarded this morning is in tonight's audience
with no provisioning job. There is deliberately no `list` mode: a hand-picked cohort is
`auto_enrol: false` plus explicit subscription rows, reusing the override table rather than
adding a parallel one.

Filter keys: `businessCategory` (enum-bound, so a typo fails at write time instead of
resolving to an empty audience), `isIndonesian`, `onboardingStatus` (deliberately **not**
enum-bound — that column carries no check constraint precisely so a new discriminator needs no
DDL), `hasConnector`.

**The preview gate** (`_components/definition-editor.tsx`): Activate is unavailable until the
audience currently in the form has been previewed; editing any audience control withdraws
activation and invalidates the preview, and forces `isActive` false on the same edit — a
switch left checked while disabled still submits `isActive: true`. The mistake this stops is
not "ops forgot to preview", it is previewing twelve merchants, widening, and activating
against four thousand paid runs. A stale preview that survives an edit is worse than none,
because the number it reports is one ops has every reason to trust.

---

## Run state machine

`pending` `running` `notified` `viewed` `delivered` `failed` `skipped_no_data`
`skipped_unreliable` `cancelled` `expired`.

`delivered` is the **direct**-mode terminus only. A `pull` channel goes `running → notified`
and then `→ viewed` or `→ expired`.

`expired` is deliberately **not** folded into `cancelled`: a cancelled run never reached the
LLM and cost nothing, while an expired run ran, cost money, and produced a brief nobody
pulled. Merging them would put paid-for runs in the bucket cost rollups treat as free.

Terminal: `delivered` `viewed` `expired` `cancelled` `skipped_no_data` `skipped_unreliable`.

### Never lose a brief (YMS-191, prod 2026-09-18)

`failed` is NOT terminal. Three guarded edges revive a run whose brief already exists — no new LLM
run, the body is read back from the run's own Cadra execution:

| Edge | Reason | Guard |
|---|---|---|
| `failed → running` | `finish-late` (was `timeout-swept`), `resend` (was `send-error` / `send-unconfirmed` / `resend-stale`) | the run's OWN execution is `completed` |
| `failed → viewed` | `brief-pulled` (a merchant tap) | failure is tap-recoverable (below) AND own execution completed |
| `running → cancelled` | `disabled-between-enqueue-and-run` | only an ops kill |

Guards read the failure off the **locked row** in `transitionRun` (`fromStatusReason`,
`fromErrorMessage`, `fromSendFailureDefinitive`), never from the caller.

**Reconciler** (every 30 min): pass 2 finishes stranded/late runs; pass 2b re-sends
`failed/send-error` rows **automatically only when** the attempt was a definitive rejection OR
both the recorded and the current transport replay the run's key — up to
`MAX_DELIVERY_ATTEMPTS = 3` in total, within `RESEND_WINDOW_HOURS = 24`, never behind a closed
ops gate / `agent_tasks` flag / audience (gates 1, 3, 4, 5, 6 pre-checked — counted
`resendGateClosed`), never after the run's merchant-local day (`resend-stale`). Ambiguous
failures on a keyless transport (email, `cadra_channel`, WhatsApp without the platform sender)
stay failed and are counted `resendAmbiguous`.

**Facts each attempt records** on `payload_snapshot`: `sendFailure {definitive, replaySafe}` (a
THROW is never definitive), `automaticResend` (so a pass-2 re-claim still meets the stale check),
and a `sendInFlight` marker written by a compare-and-set on the lease immediately before the
transport call — a stalled worker that loses it stands down instead of sending.

**One idempotency key per run + reminder**: `agent-task:<run>:a<n>`, reused by every attempt. A
per-attempt key turned an ambiguous failure (msg-api sent, yobo saw a network error) into a double
CTA and was reverted. The key is safe because msg-api (`platform-notify`) answers a reused key by
state:

| msg-api claim state | Answer | yobo records |
|---|---|---|
| completed (has provider id) | `replayed` + original wamid | `notified` — no second CTA |
| released (gateway gave an HTTP error, msg-api ≥ `240f51df`) | sends again | normal |
| held (timeout / 2xx without id / throw) | `send_in_flight` | `failed/send-unconfirmed` — "the CTA may have been delivered" |

⚠️ msg-api's **first** answer on a held claim is `gateway_rejected`, not `send_in_flight`, so an
ambiguous attempt first lands as `send-error` with `sendFailure.definitive = false`.

**Tap-recoverable failures** (`isTapRecoverableFailure`): `send-unconfirmed`, a `send-error`
naming `send_in_flight`, or a `send-error` with `definitive === false`. The tap proves the CTA
arrived; it is honoured inside the window a `notified` run would have had. Every other failure
refuses the tap with the usual 404.

**Ops retry** (`POST /runs/{id}/retry`, tRPC `bo.retryRun`): a `failed` run WITH a completed
execution is re-sent / finished (`mode` in the response), not regenerated. Refused with 409 /
`PRECONDITION_FAILED` when a gate is closed or msg-api holds the send claim
(`send_claim_held`). Only a run with no usable brief regenerates (`failed → pending`), and that now
enqueues the runner job under `retry-<runId>-<pendingAt ms>`. A bare run id was silently swallowed
by BullMQ while an earlier job with that id was still retained (the runner queue keeps 100
completed / 500 failed), and the retry still reported `enqueued: true`.

**`notReceivedTodayTaskId`** counts a likely-delivered failed run (`send-unconfirmed`, or a
`send-error` held / not definitive) as RECEIVED, so a fallback task does not send a second CTA.

---

## Delivery

`src/server/services/agent-tasks/delivery/`. Adapters are resolved at **send** time, not boot
time, so flipping `daily_digest.send_mode` in `system_config` is one SQL UPDATE with no worker
restart.

| Channel | Mode | Destination | Fallback |
|---|---|---|---|
| `mock` | direct | — | dev only, never sends |
| `in_app` | direct | — | always works |
| `email` | direct | `{email}` | the org's **active owner**'s email |
| `whatsapp` | **pull** | `{phone}` E.164 | `daily_digest_configs.phone_number`, then the org's **active owner**'s `users.phone` |
| `cadra_channel` | depends on transport | `{connectionUuid, transport?, threadKey?}` | **none** — `no-destination` |

Two rules overlap on exactly one input, "unknown channel in mock mode": validity is checked
**first**, so a typo in `default_channel` fails closed rather than being laundered into a mock
success. An unbuilt channel is refused with the same `channel_unavailable` as an outright typo
— returning the mock adapter in live mode would report `delivered` on a row nothing was sent
for.

A `pull` adapter must implement **both** `notify` and `deliverOnDemand`. An adapter that can
send a CTA but cannot answer the tap produces exactly the failure the design exists to avoid:
a merchant taps and receives nothing. Checked at resolve time, so it surfaces as a `failed`
row on the first tick instead.

### `cadra_channel`

Transport is recorded **on the destination** and it has to be: the transport decides whether
the run takes the pull or direct journey, and yobo has no other way to learn it — it stores no
mirror of cadra-web's `channel_connections`, and cadra-web's outbound route takes only
`{tenantOrgId, text, threadKey?, idempotencyKey}` and its 202 names no channel.

Absent transport resolves to **`pull`**. Guessing `direct` on WhatsApp pushes free-form text at
a possibly closed window, which msg-api DROPS; guessing `pull` on Slack costs one extra round
trip. One of those failures is silent. Windowless transports (slack/telegram/discord) ⇒
`direct`; whatsapp ⇒ `pull`.

Transport is trimmed and lowercased before matching, so a destination written `" Slack "`
cannot resolve `direct` on dev and be refused as unparseable on prod.

**Slack must carry `threadKey`.** cadra-web never persists a Slack channel id — 
`channel_conversations.external_user_id` holds the USER id — so with no `threadKey` the route
falls back to the most recent conversation and `chat.postMessage` opens a DM instead of posting
in the channel. Telegram and WhatsApp store the chat id there, so their fallback lands right.

cadra-web side: `POST /api/v1/internal/channels/[connectionUuid]/messages`, plus migration
0118's `channel_outbound_dedupe` 24-hour idempotency store. The tenant assertion is a **gate,
not a column compare** — it requires `identity_gate = 'connection_pin'` AND a positive
`tenant_org_id`, and fails closed on a NULL gate, on `thread_pin`, on `chat_identity` and on
any future mode. Migration 0104's CHECK does not force `tenant_org_id` NULL under `thread_pin`,
so a multi-tenant connection can carry a stale value a bare equality check would accept.
`allowed_tenant_orgs` is never consulted: it is an allowlist for thread resolution, not
authorisation for an unprompted send.

---

## WhatsApp CTA

`delivery/whatsapp.adapter.ts`.

### Caps, all validated before a byte leaves the process

`WA_MAX_REPLY_BUTTONS` 3 · `WA_BUTTON_TITLE_MAX` 20 (binds at **submission**, not send) ·
`WA_QUICK_REPLY_PAYLOAD_MAX` 128 · `WA_TEMPLATE_PARAM_MAX` 1024 ·
`WA_TEMPLATE_PARAM_MAX_COUNT` 10 · `WA_TEMPLATE_PARAM_FORBIDDEN` = newline, tab, or 4+
consecutive spaces (Meta `132000`).

Exceeding any one rejects the **entire** message, so the merchant taps a button that was never
delivered and nobody is told — hence local validation first. The payload is never clamped: it
is the selection key and must round-trip byte-identical, so an overlong one is a refusal. The
**title** is the display-only field and the one that gets clamped.

The parameter-format rule doubles as structural proof that a brief never rides a parameter —
prose over merchant data has newlines. The primary guarantee is still that `TaskNotifyInput`
has no `body` field at all, so no call site can pass one and an object literal that tries is a
compile error.

### Body parameter count

The runner passes a fixed pair (`orgName`, `runLocalDate`) to whatever template resolves,
because at dispatch it does not know which one that will be. `resolveCtaTemplate` therefore
reads the stored `components` and returns `bodyParamCount`; `notify` clamps to it and emits
`agent_task.delivery.whatsapp.template_params_clamped`.

Clamps **down only** — a template declaring more than the runner supplies is one nobody has
wired, and padding blanks would send a sentence with a hole in it. `null` means **unknown**,
never zero, so a row whose components were never synced keeps unclamped behaviour. The count
is the **highest** `{{n}}`, not the number of matches: Meta numbers positionally, so a body
using `{{2}}` twice and never `{{1}}` is still a two-parameter template.

### Template resolution ladder

Org row (`org_id` + `type='AGENT_TASK_CTA'`, newest by `updated_at`) → `system_config`
`agent_task.cta_template_id` → `APPROVED` and only `APPROVED` → category check.

The platform default's status is looked up **by template id, not by org** — it is one Meta
template shared by the fleet, and reading status from anywhere else would let an unapproved
template send. A default naming an id with no describing row refuses `template-unknown`.

A **NULL** category is not drift, it is "never synced", the state every fresh template starts
in; failing closed there would block the first send of every new template. A **known, wrong**
category is different — Meta has told us, and continuing keeps writing `notified` on rows
nobody receives.

### Category drift

A UTILITY submission can be approved as MARKETING, and an approved template can be
recategorised later, with no notification. A brief that has quietly become MARKETING falls
under marketing opt-in and send limits: the fleet keeps "sending", merchants stop receiving,
every run row still reads `notified`. **No other gate in p37 catches it.** msg-api has a
watcher (`template-category-watch.ts`) but it is unreachable for a yobo-submitted template —
yobo submits through the WhatsApp *gateway* while the watcher reads its own tables keyed by
msg-api org ids, and the two org spaces must never be conflated. So the adapter consumes
yobo's own copy of Meta's answer, `whatsapp_template.category`.

### Refusal reasons

`template-unresolved` · `template-unknown` · `template-not-approved` ·
`template-category-drift` · `destination-invalid` · `no-merchant-phone` · `too-many-buttons` ·
`payload-invalid` · `too-many-template-params` · `template-param-too-long` ·
`template-param-format` · `org-mismatch`.

`org-mismatch` guards a real hazard: nothing structurally forces the constructor's org and the
input's org to agree, and a mismatch would WhatsApp one merchant on another merchant's WABA.

### WABA resolution

(REWRITTEN 2026-09-18. This section used to say the adapter calls
`getOrgWabaConfig(orgId, {skipDefaultConfig: true})` on the MERCHANT's org. It no longer does —
that looked up the recipient's own sending config to decide who a Yobo message came from, a
category error that survived only because every merchant row carried `META_DEFAULT`.)

A fleet task is Yobo messaging a merchant, so the merchant is **only a recipient** and their
`message_phone_numbers` row is never read. The sender is picked by `whatsapp.adapter.ts:994`:

```ts
const send = this.deps.sendTemplate ?? (isPlatformSenderEnabled() ? platformSender : defaultSender);
```

| Path | When | Picks the line from |
|---|---|---|
| `platformSender` (`src/lib/msg-api/platform-notify.ts`) | `AGENT_TASK_PLATFORM_SENDER=true` — **prod since 2026-09-18**, dev since 2026-09-03 | msg-api `POST /api/v1/platform-notify` (`X-Service-Secret` + `X-Org-Id` = the msg-api org owning the platform connections, env `MSG_API_URL` / `MSG_API_SERVICE_SECRET` / `MSG_API_PLATFORM_ORG_ID`). Fails LOUD if any is unset — never falls back |
| `defaultSender` → `resolveYoboSender()` (`:787`) | flag unset / anything but `true` | the lowest-id active `message_phone_numbers` row with `org_id IS NULL` and category `LIKE '%DAILY_DIGEST%'`, read privileged (the app role cannot see `org_id IS NULL` rows). One line for every merchant |

**msg-api's resolver** — `ConversationRepository.findPlatformConnectionForTenantOrg`
(msg-api `src/repositories/conversation.repository.ts:1468`). Four predicates, each forced by a
measurement:

1. `channel_connections.identity_gate IS NOT NULL` — platform lines only. NULL is a merchant's
   OWN (B2B2C) number, which must never carry a Yobo→merchant brief.
2. the recipient phone matched against `contact_identities` (bare digits both sides) — several
   orgs have more than one platform conversation, one per staff member.
3. `last_inbound_at IS NOT NULL` — "the line they last SPOKE on"; an outbound nobody answered
   proves nothing.
4. rank by **inbound message volume**, then recency, then connection id. Recency alone latches
   onto a mistake: one tap on a wrongly-sent CTA becomes the newest inbound on the wrong line.

No match → `no_platform_conversation` → the adapter throws → run `failed`. Deliberate: a
fallback that always has an answer is the defect this path removed. Idempotency key
`agent-task:<runId>:a<attempt>` (the attempt is in it so reminders are not treated as replays).
The template parameter clamp stays in yobo — msg-api cannot read the gateway's template registry.

**Proving which line a send used — the gateway, never yobo.** yobo stores only the wamid
(`payload_snapshot.notifications[].providerRef`). The gateway's `whatsapp_messages` row for that
`provider_message_id` has `client_id` (`msg-api` on the platform path, `yobo-cms-merchant` on the
legacy path) and `waba_id`. The worker also logs `agent_task.delivery.whatsapp.platform_sent`
with `connectionUuid`, `conversationUuid`, `wabaId`.

**Simulate the resolver before a flip** by running its CTE read-only on the msg-api DB over the
cohort's `(org, recipient phone)` pairs (recipient decoded from each run's wamid — see
"Diagnosing"). Measured 2026-09-18 over 71 prod recipients: 62 → one line, 8 → another, 1 → none.

⚠️ **Every platform line needs the CTA template.** Registration in the gateway's
`whatsapp_templates` is per (`client_id`, `waba_id`) with a per-WABA `language`. A line added
after the template was registered has no row, and merchants resolved there fail
`failed to get template: record not found` while preflight passes (preflight cannot see the
gateway). Check: `SELECT client_id, waba_id, language, status FROM whatsapp_templates WHERE name = '<cta>'`
against the list of identity-gated WhatsApp connections.

⚠️ **Do not use "has no `message_phone_numbers` row" as a can-this-org-receive test** (measured
2026-09-01) — it produces false negatives, and a back-office column was once shipped encoding
exactly that rule. `message_phone_numbers` is a SENDER table. Recipients come only from the
destination ladder above.

### Reminders

`reconcile` pass 4. `attempt` 1..`reminderMaxCount`, spaced `reminderIntervalHours`, same
message every time — not new copy and not a new template. `reminder_count` increments **only
on a successful send** (`recordReminderSent`, which never calls `machine.execute()` because a
reminder is not a transition), so a failing transport cannot burn a merchant's allowance.
`notified → expired` fires on `reminder-threshold-exhausted`, or on `ops-gate-closed` with no
send at all.

**What they are for:** re-knocking a merchant who has not tapped, while the brief is still
worth reading. That only holds when nothing newer replaces the brief within the interval — a
weekly task, say. Each reminder is a paid template send (it goes outside the 24h window by
definition).

⚠️ **Reminders are per run and nothing supersedes them.** When day N+1's run notifies, day N's
and N-1's runs are still `notified` and keep their own schedules. With the defaults (`3`, 24h)
on a daily task they fire on the same reconcile tick as the new CTA. Measured on dev org 6912,
2026-09-18: today's CTA 23:03Z, yesterday's reminder #1 23:30Z, the day before's reminder #2
00:00Z — three identical CTAs in one hour, reported by users as "the brief came three times".
Fix used: `reminderMaxCount: 0` on daily tasks. A code fix (a newer run expires older `notified`
runs of the same task + org) is not built. YMS-230 separately limits reminders to Meta's 72h
Free Entry Point window.

---

## The tap: `get_daily_brief`

`src/server/tools/get-daily-brief.ts`. **A registry entry, not a route** — yobo exposes one
tool dispatcher, `POST /api/v1/internal/tools`, which authenticates with `validateToolCallback`,
derives the tenant, opens the RLS context and delegates to `handleToolExecution`. Every merchant
tool is an entry there: `get_campaigns`, `get_segments`, `get_org_context`, `get_products`,
`search_insights`, and this.

**The name is load-bearing.** The batch route classifies a tool as a READ purely by name and
splits the batch on it: reads run in parallel with per-tool error isolation, writes run
sequentially in one transaction with all-or-nothing rollback. `fetch_brief` or `load_brief`
would be classified a WRITE and dragged into the write transaction alongside mutating tools.
The rule lives in `read-tool-names.ts` and a test calls the actual predicate.

**Security.** The run id in the CTA payload travels through Meta in the clear; it is an
identifier, not a capability, and authorises nothing. Three rules, each the whole defence for
its own case:

1. **Fail closed when the tenant is absent** — no default org, no fallback. An orchestrator
   DIRECT tool call does not propagate `tenantOrgId`, so a handler that shrugged would serve
   Cadra's own internal org.
2. **Resolve the run by id AND org in one predicate** — another tenant's run is a **404, never
   a 403**; a 403 confirms the id exists, which is the oracle a guessed id needs.
3. **The body's `orgId` is ignored** — a test sends a body org differing from the scope and
   asserts the scope's answer.

**It returns the brief; it does not send it.** The agent's own reply in the same turn is the
send, which is what satisfies msg-api's money guard. The body is fetched from the **Cadra
execution**, never the run row.

**A tap can recover a `failed` run** whose CTA probably arrived — see "Never lose a brief". The
run moves `failed → viewed`; `notified_at` is set to the CTA attempt time.

**Cadra side.** The definition is a `tools` row plus an `agent_tools` link. Tool rows are
per-org. ⚠️ Any agent tools save deletes and recreates all links — re-verify after any agent
edit.

---

## Storage and retention

`payload_snapshot` stores delivery facts and a fingerprint, never agent text: channel, mode,
`deliveredAt`, `bodyHash`, `bodyLength`, artifact uuids, and a **masked** destination. The
schema originally called the column "the delivered body, MUST NOT contain customer PII" —
both halves cannot be true, since a brief saying "Sarah Tan spent Rp 480,000" is doing its job
and is PII, and no redaction pass reliably removes names from prose. An integration test seeds
real customer rows, builds a body from their names, emails and phones, and asserts none of it
reaches the snapshot.

Stated plainly: **you cannot read back what a merchant was told from the run row.** If that is
ever needed it belongs in a separate, short-retention, access-controlled store — not the fleet
outbox every ops surface joins against.

Delivery correctness therefore depends on Cadra execution retention. Probed 2026-08-26:
`agent_executions` held 10,867 rows spanning 2026-02-13 → 2026-08-26 with no gap, `output`
intact, and no prune job in cadra-web or cadra-api. "Holds today" is not "holds" — hence the
410 path and an alert on the **first** `brief_unavailable` at any rate above zero.

---

## What a run row proves, and what it does not

**`status = 'notified'` means yobo handed the message off. It does NOT mean anything was
delivered, and on dev it usually means nothing was sent at all.** Three layers each fake a
success, and each one is invisible in the run table. Check all three before believing a send.

| Layer | Where it lives | What a fake success looks like |
|---|---|---|
| 1. Send-mode switch | `system_config.daily_digest.send_mode` | anything but the exact string `live` returns the MOCK ADAPTER; the run still reaches `notified`, and only `payload_snapshot.mode` says `mock` |
| 2. Gateway provider | the host in `WHATSAPP_SERVICE_API_URL` | a mock provider returns synthetic `wamid.` values **with the real recipient encoded in the base64** — indistinguishable from Meta without checking the provider |
| 3. Meta delivery | Meta's status webhook | never recorded anywhere; `providerRef` is written once at send and never updated |

**A `wamid` that decodes to the correct phone number proves the MOCK knew the recipient.** It is
not evidence Meta accepted the message. Verified 2026-09-01: 14 fleet-task sends read `notified`
with valid-looking wamids and not one reached a handset.

**How the mock leaked, and the general rule.** Fifteen orgs got a mock success; ONE got a mock
error, which named itself:

```
provider failed to send message: mock api error: [Mock Send Failed 131026] Message undeliverable
```

On any fan-out send, **read the single error before the many successes** — a uniform mock only
reveals its identity on the input it fails.

### `cost_usd` on a run row is a RESERVATION, not spend

`reserveBudget` writes `cost_usd = COALESCE(cost_usd, perRunCostCapUsd)` **before** the run, so a
fresh row reads the per-run cap. Measured cost lives in `ai_usage_records.cost_usd`, joined on
`execution_uuid`. On 2026-09-01 three runs read `0.500000` each while actually costing `~0.0106` —
a 47× overstatement.

The budget gate sums `COALESCE(r.cost_usd, u.cost_usd, 0)`, so an un-reconciled run consumes the
monthly cap at the reserved rate until the reconciler replaces it. That is deliberate — it is why
the reservation exists — but **never quote a run row as spend.**

Caps are **per definition**, not global: each `agent_task_definitions.limits` carries its own
`monthlyCostCapUsd`. Raising one task's cap changes nothing for another.

---

## Operations

### Diagnosing — read the tables as the OWNER

Every p37 query must run as a role with `rolbypassrls = true`. The four tables carry RLS with 2
policies each; `agent_task_definitions` has no `org_id`, so the app role's answer is **0 rows,
no error**. That is not "the feature was never used" — it is the query being answered under a
policy that admits nothing.

```sql
-- always first
SELECT current_user, (SELECT rolbypassrls FROM pg_roles WHERE rolname = current_user);

-- then the three questions, in this order
SELECT key, is_active, default_channel, schedule, limits, input_template
  FROM agent_task_definitions ORDER BY created_at;

-- ONE feature-level flag. NO ROW = ENABLED; only an explicit false stops the fleet.
SELECT name, org_id, is_enabled FROM feature_flags WHERE name = 'agent_tasks';

SELECT d.key, r.status, r.status_reason, count(*) n, max(r.run_local_date) last
  FROM agent_task_runs r JOIN agent_task_definitions d ON d.id = r.task_id
  GROUP BY 1,2,3 ORDER BY n DESC;
```

Measured 2026-08-31, same dev database, two roles:

| Role | definitions | runs |
|---|---|---|
| app role (`DATABASE_URL`) | 0 | 0 |
| `neondb_owner` (`ADMIN_DATABASE_URL`) | 3 | 659 |

Use `ADMIN_DATABASE_URL` or `DATABASE_MIGRATE_URL`. The env→host mapping, and the trap where the
`preview` environment is a different and much smaller database, are in
`_context/_runbooks/yobo-dev-db-migrations.md`.

### Reading the result — which silence means what

| Symptom | Means | Where the evidence is |
|---|---|---|
| 0 definitions **as owner** | nothing was created | — |
| definition exists, **0 run rows** | gate 1–7 blocked it before the claim | nowhere on disk; scanner's in-memory `result.skips` only |
| run rows, all `cancelled`/`budget-cap` | `limits.monthlyCostCapUsd` reached this calendar month | `sum(cost_usd)` for the month |
| run rows `notified`, never `viewed` | merchant never tapped, or the template never arrived | `whatsapp_template.status` / `.category` |
| merchant got it from a **number they don't chat on** | legacy sender in use — `AGENT_TASK_PLATFORM_SENDER` not `true` on the worker | gateway `whatsapp_messages.waba_id` / `client_id` by wamid; `printenv` inside the worker |
| merchant got it **more than once a day** | reminders stacking, two active definitions, two orgs sharing an owner phone — or **dev** | see below |

**"Got it twice" recipe** (measured 2026-09-18 — the answer was dev, not prod):

1. Map runs to people without touching PII columns: the recipient MSISDN is inside the wamid.
   `base64decode(wamid[6:])` → byte `[2]` is the length, bytes `[3:3+len]` are the digits.
2. Per (phone, local day), count CTAs across ALL definitions from the runs' `notifications[]`
   (both `cta` and `reminder` kinds).
3. Query the **dev** gateway for `is_mock = 0` sends to the same phones. The dev gateway mocks
   only recipients absent from its `phone_whitelist`, so a whitelisted merchant gets real dev
   briefs from the dev WABA on top of prod's.
4. Gateway recipient formats differ by client: template sends via `yobo-cms-merchant` store
   `+E164`, msg-api session sends store bare digits. Normalise with
   `replace(recipient_phone_number, '+', '')` or one person looks like two.

**A gate skip still leaves no run row** — gates run before `claimRuns`, so
`task-inactive`, `bo-disabled`, `not-in-audience`, `snoozed`, `merchant-disabled` and `not-due`
never appear in `agent_task_runs.status_reason`. Only post-claim reasons (`budget-cap`,
`skipped_no_data`, `tool-failure-gate`, `send-ok`, `send-error`) are persisted.

**But the silence is now instrumented, twice:**

| Signal | Where | Answers |
|---|---|---|
| `agent_task.scanner.skipped.<reason>` | every scanner tick, per reason | *why* nothing was claimed |
| `agent_task.alert.task-never-ran` | reconcile pass 5, once per task per day | *that* an active task has never produced a row, past 25h (daily) or 8d (weekly) |

Corollary: **zero run rows is not evidence that the workers are down.** Check for a
same-database task that *does* have recent rows before concluding `AGENT_TASKS_ENABLED` is off.

### The budget cap is per definition, and it is sticky

`limits.monthlyCostCapUsd` is read from the definition, so a task seeded with smoke-test limits
keeps them. A task that worked for days then went silent with every run `cancelled`/`budget-cap`
has not broken — it has spent its month. Observed 2026-08-31: a task carrying
`{concurrency: 1, monthlyCostCapUsd: 5, runTimeoutMinutes: 5}` delivered 5 briefs, then produced
648 consecutive `budget-cap` cancels once the month's spend reached exactly $5.0000.

Raise the cap on the definition; there is no separate reset, the window is the calendar month.

### Flags

Two gates, both shipping OFF:

1. `AGENT_TASKS_ENABLED` env — gates worker boot entirely. Lives on the **worker container**,
   not Vercel, so its absence from `vercel env ls` proves nothing.
2. `agent_tasks` — ONE feature-level flag, read once per tick. **An absent row means ENABLED.**
   `rollout_percentage` is not consulted; a partial fleet is an `audience` filter.

Flag resolution is one query per definition (global row + this audience's overrides), not one
per merchant — the live digest scanner's per-merchant `isEnabled` call is 5000 round trips a
tick at 5000 merchants. Precedence is copied from `FeatureFlagService.evaluate`, not
reinvented: `org_id ASC NULLS FIRST, id DESC`, take the last, so a per-org row beats the global
row and among duplicate globals the highest id wins (`UNIQUE(name, org_id)` treats NULLs as
distinct, so duplicate globals really are possible).

**One deliberate deviation:** rollout hashes the **org id** rather than falling back to
`Math.random()` as `evaluateRollout` does when the context carries no user. A scanner tick has
no user, so random would re-roll every merchant every five minutes and a merchant at 50% would
receive their brief on a coin flip with no way to reproduce a complaint. Hashing means the same
merchant is on the same side forever, and widening only ever adds.

### Permissions

`admin:agent_tasks_read` / `admin:agent_tasks_manage`, granted to **Super User only** by
migration 0269. The registry (`src/permissions/registry.ts`) is a code manifest and does not
write rows — the original migrations shipped the tables without the permissions, so the feature
was deployed and unreachable: no role could hold it, the sidebar entry was hidden from every
user, and every `bo.*` procedure rejected. Log out and back in after granting; it rides the JWT.

### Ops surface

`/backoffice/agent-tasks` — definitions list with a Sheet editor, plus a fleet run table
filterable by task, date and status with `status_reason` visible by default. The per-merchant
disable control lives **on the run row**, because that is where ops actually decides: you watch
a merchant's brief fail four days running and disable from there rather than navigating away.

### Deploy topology

Workers ride `start-workers.ts` in the **`worker-service` container**, alongside the Klaviyo
outbound sync family. This is *not* the `connector-worker` container (POS/Shopify inbound,
`src/workers/connector-worker.ts`). A Vercel deploy rebuilds neither.

⚠️ CORRECTED — **not Coolify.** Dev is rebuilt by `deploy-worker-dev.yml` on every push to
`develop`. **Prod has NO workflow**: it is a hand-deployed container on the prod merchant box
(`hosts.qraved-merchant` in `server-inventory.yaml`) — `git pull --ff-only` on `main` as the repo
owner, then `sudo ./deploy-worker-v2.sh`, which builds a versioned image `saas-workers:v<stamp>`
and keeps the previous ones (`./rollback-worker.sh`). Verify by grepping the changed line inside
the container and requiring the three `agent-task-{scanner,runner,reconcile}] worker started`
lines. Runbook: `_context/_runbooks/yobo-fleet-agent-tasks-prod.md` §3.2.

### Rollback — every gate is data

| Scope | Action |
|---|---|
| Whole fleet | `is_active = false` (gate 1) |
| One merchant | `bo_disabled = true` on their subscription (gate 3) |
| A cohort | narrow the `audience` filter (gate 4) |
| Everything, hard | `AGENT_TASKS_ENABLED=false` + redeploy the worker container |

No code rollback is needed for any of these.

---

## Verification

Prove each layer separately; never infer one from another.

1. **Routes exist** — `/backoffice/agent-tasks` returns 307→login while a nonsense back-office
   path returns 404; `/settings/scheduled-briefs` returns 200.
2. **Workers boot** — a run row appears within 5 minutes of the scheduled local hour. No row at
   all means gate 1/2/4 or `AGENT_TASKS_ENABLED`.
3. **Send succeeds** — the run reaches `notified`, not `failed`. `send-error` with `132000`
   means the template's parameter count is wrong or the clamp is not deployed.
4. **Tap answers** — the merchant taps and receives the brief. This is the only step that
   exercises `get_daily_brief`; nothing else does.

Cheap isolation trick: send the template straight through the WhatsApp gateway
(`POST /api/v1/whatsapp/send/template`, client-credentials token from `/oauth/token`) with
`body.parameters: []` and one `button`/`quick_reply` payload. A `SENT` with a real `wamid`
proves template + WABA + number + payload independently of the pipeline; a `mock_*` id means
the gateway fell back to mock and nothing was delivered.
