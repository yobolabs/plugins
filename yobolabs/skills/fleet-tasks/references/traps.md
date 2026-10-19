# fleet-tasks — traps

Moved verbatim from `SKILL.md` (2026-09-30). Read before diagnosing a lost, late, duplicate or wrong-number brief, or retrying a run.

## Traps

- **A finished brief is no longer lost (YMS-191, on prod 2026-09-18).** Before this, a brief that
  finished after `limits.runTimeoutMinutes` was swept `failed/timeout-swept` and never sent, and a
  failed CTA send could only be retried by REGENERATING (new LLM cost, different brief). Now the
  reconciler FINISHES a late run from the stored execution and RE-SENDS a failed CTA; ops retry
  re-sends a stored brief; a merchant's tap recovers a run whose CTA probably arrived. Rules, edges
  and the msg-api half: `references/fleet-tasks.md` → "Never lose a brief". **Do not "fix" a
  `failed` run by hand with psql** — every recovery goes through guarded `@jetdevs/state` edges.
- **A timezone "set" that reads `timezone_source='browser'` did not save.** `orgs.timezone_source`
  records provenance: `NULL`/`phone` = a guess, replaced once by the OWNER's browser zone; `browser`
  = observed, kept; `admin` = set in back office, never overwritten
  (`src/server/services/domain/org-timezone.service.ts`, `sdk-org.ts` writes `admin`). A back-office
  change always leaves `admin`; if you still see `browser` with the old zone, the edit never
  persisted in THAT environment. The zone drives both the fire time and the brief's country/language.
- **`tenantOrgId` is a label, not a Cadra org.** Yobo runs every brief on its own org-scoped
  `CADRA_API_KEY`; the merchant org id rides along as `context.tenantOrgId` (`src/lib/cadra/client.shared.ts`)
  so Cadra can echo it to yobo's tools. The SDK also sends it as `X-Org-Id`, which cadra-web honours
  ONLY for its internal key (as a Cadra org id, default 1) and ignores for org-scoped keys
  (`cadra-web/src/lib/api/auth.ts`). Harmless today; never switch yobo to the internal key without
  changing what goes into that header.
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
- **The runner's `pollToTerminal` backs off; before 2026-10-05 it did not.** It polls the Cadra
  execution with base 2 s + jitter, exponential to a 30 s ceiling, and honours `Retry-After` from
  `@cadraos/sdk` `RateLimitError.retryAfter` (seconds, capped at 60 s) — since yobo `42450118c`
  (YMS-370). Before that it polled a flat 1 s, which 429-stormed the shared Cadra key on
  2026-10-05 (4618 `poll_error`) and starved the other workloads on that key. The runner logs only
  errors, so call-rate proof is the Cadra per-key Redis counter (`ratelimit:{env}:{apiKeyId}:{windowStart}`),
  never worker logs (a container recreate also wipes them).

## YMS-508 (2026-10-12): the tap, repeated content, team-member 409

**Tap wire shape.** The gateway (`whatsapp/internal/service/webhook_handle_service.go`,
`buildN8nChatbotRequestBody`) forwards a template quick-reply id as top-level `payload`. It never sends
`button`. Every msg-api reader (`brief-tap.ts`, `system-tap.ts`, `business-created-carry.ts`) reads
`providerMetadata.button.payload`, which was set only from `p.button`. On prod 0 of 30 taps stored it.
The YMS-363 pin never fired, so a person tapping brand B's CTA while their chat was on brand A got
BRIEF_NOT_FOUND ("The prepared brief isn't available right now") or A's brief. Fixed in msg-api
`171d0fa7`, prod `fe8a5d58`. Find taps in msg-api `messages` with `direction='INBOUND'` (uppercase) and
`metadata->>'type'='button'`. The gateway log line `received button quick reply - payload: brief:<org>:<run>`
shows what was really tapped. A used WhatsApp button cannot be tapped again, so prod proof must be a
natural tap.

**Repeated content.** Skill 338 deduped through `memory_search`/`memory_write`. Cadra suppresses
`memory_write` for org-scope agents (`cadra-api/src/services/tool-executor/memory-tools.ts:216`, agent 369
`memory_scope='org'`), so the list of sent links was always empty. Baseline: 15 of 38 links repeated
across 7 briefs. The fix has two halves:
- yobo `already-sent-links.ts` reads this task's runs from the last 7 merchant-local days and pulls the
  links from their Cadra execution outputs.
- `withAlreadySentLinks` appends `Already sent links (last 7 days):` to the task text. The links also go
  in `context.alreadySentLinks`, but the model never sees context keys.

Skill 338 v7 (id 249; v5 id 224 kept) step 1a reads that block. Normalized form: host without scheme or
`www.` + path without trailing slash + non-tracking params. Brief outputs write bare `www.` links, and
`v=`/`id=` name the video or ad. Proof: prod exec 485f1618 had 0 repeats.

**Team member, no thread.** A recipient whose phone never messaged a platform line gets msg-api 409
"Org N has no conversation on any active platform WhatsApp line". The recipient row reads
`failed / send-error` (prod: 2 a day since 10-10). It is the designed no-fallback
(`platform-notify.ts:32`). The member messages the line once, or msg-api adds an org-line fallback (a
product call). `generation-unavailable` "failures" are runs skipped before generation (no business profile,
tool gate), not send failures.


## p141 (2026-10-19): sending ONE test brief hit five silent rules

A dev test brief for one recipient was stopped five different ways, each silently. Root cause: the
brief's rules are scattered (~31 rules across ~19 files; p141 consolidates them, p142 moves the
decisions out of msg-api). Until then, check all of these before concluding "the brief is broken":

1. **The p75 payment gate checks the PLAN, not credits.** A brand with credits but no paid plan is
   still gated. A test org needs the paywall switched off on the definition (`no_paywall`).
2. **A CRM `Test` tag skips the contact.** A recipient whose contact carries the Test tag is skipped
   from sends. Untag it for the run, restore the tag after (tester numbers keep it permanently).
3. **Deactivating a task expired already-sent CTAs.** Turning a task OFF marked its `notified` runs
   `expired`, so a merchant tapping an older CTA got nothing. Fixed by p141 S2 (reminders-stopped
   path, prod worker `v20261019-142528`). On older builds never turn the task off before the CTA is
   tapped.
4. **The main-brand rule follows `users.current_org_id`.** The default-ON brand is the owner's CURRENT
   org (multi-brand.md Rule A). Create or switch to a new brand and the previous brands silently
   stop getting a brief unless they hold an explicit enabled `agent_task_subscriptions` row.
5. **One prompt per day counted EXPIRED prompts.** A run that expired (see 3) still used the day's
   slot, so the re-send was dropped as already prompted. Fixed by p141 S1 (`already-prompted-today`
   no longer counts expired).

Two reading traps from the same sitting:

- **A recipient with `covered` / `duplicate_prompt` and NO `provider_ref` looks sent and is not.** It
  means a rule absorbed the send. Proof of a send is a `provider_ref` on the recipient row, never the
  run status or the recipient's reason text.
- **Preview does not apply the main-brand rule.** The ops preview renders a brief for any brand; it
  proves content, not that the real fan-out would pick that brand.

**Recipe: send ONE dev test brief to a chosen phone.** (1) untag `Test` on the contact; (2) write an
explicit **enabled** `agent_task_subscriptions` row for the brand (beats the main-brand default);
(3) set `no_paywall` on the definition; (4) run, and keep the task ON until the CTA is tapped
(deactivating it expires the CTA on pre-S2 builds); (5) confirm a `provider_ref`; (6) restore the
`Test` tag and turn the task OFF after the tap. Dev `send_mode` must be `live` (SKILL.md "Sent is
not delivered").
