# The ops surface — configuring a fleet task without SQL

`src/app/backoffice/agent-tasks/`, gated on `admin:agent_tasks_read` / `_manage`.

Every setting that decides whether a task runs is editable here. Until 2026-09-01 most of them
were reachable only from psql, which is why tasks were activated and then silently reached nobody.

## Layout (rebuilt 2026-09-18, YMS-191 SPEC-CHANGE-ops-ux-audience)

- **List page** `/backoffice/agent-tasks`: two SDK tables (`makeDataTable` + `useStandardListPage`) —
  Tasks (client-side sort/search, State + Channel filters) and fleet-wide Runs (server-side paging,
  search by merchant name or id, sort, Task/Status/Channel filters).
- **Task detail = a drawer from the RIGHT over the list**, never its own page. It is driven by the
  URL: `/backoffice/agent-tasks?task=<id|new>&tab=<audience|runs|setup|schedule|advanced>`, so a link
  opens it on a tab and Back closes it. The old `/backoffice/agent-tasks/[id]` and `/new` routes are
  server redirects into the drawer. Closing with unsaved edits asks "Discard unsaved changes?".
- Tabs, most-used first: **Audience** (rules only) · Runs · Setup (agent, prompt JSON, channel,
  WhatsApp template) · Schedule · Advanced (limits, reminders, paywall, auto-enrol, never-answers).
  Header: state, Preflight, Activate/Deactivate. ONE Save bar for all tabs.
- **Audience tab shows ONLY the rules.** Matching merchants are behind a **View matching merchants**
  button that opens a modal; nothing is queried until it is clicked (Sean: "Don't default show the
  audience. The user should click on something to view a modal.").
- **There is no hand-picked merchant list and no "Add a merchant"** (Sean, 2026-09-18). Merchants are
  chosen only by conditions — a name condition is `starts with` / `contains`, not a picker. The
  2026-09-01 enrolment panel (Explicit rows / Add a merchant / skip table) and the merchant pickers
  were deleted.

## What each control writes

| Control | Column | Notes |
|---|---|---|
| Cadra agent **picker** | `agent_uuid` | replaced a pasted uuid. A typo, a deleted agent and a DRAFT agent all failed identically at run time — an enqueue 500 reading `Agent is not deployed`. The picker marks what is dispatchable and falls back to a raw field when Cadra is unreachable |
| Cadence / weekday / **hour / minute** | `schedule` | `{kind, hour, minute}`; minute defaults to 0 |
| Audience rules | `audience` (`mode: 'rules'`) | name matches / name excludes (`starts with` or `contains`, case-insensitive, `%`/`_` literal), country (from `orgs.timezone`; `UTC` = unknown), onboarding status (incl. none), connector, business category, signup date range, has business profile, reachable on the task's channel, didn't receive a chosen task today. No rules = every active merchant, shown in words. Legacy `all`/`filter` audiences still run; a legacy part with no `rules` equivalent (e.g. `isIndonesian`, a stored `includeOrgIds`) blocks saving until removed |
| Default channel | `default_channel` | |
| Auto-enrol | `auto_enrol` | off ⇒ explicit cohort only |
| Six limits | `limits` | incl. `monthlyCostCapUsd`, `perRunCostCapUsd` |
| Task input (JSON) | `input_template` | `.strict()` — an unread key is a 400 at save |
| **When the merchant never answers** | `alternative_on_exhaustion` | parsed by `taskAlternativeSchema` at the write boundary; previously a jsonb column with no validation and no screen |
| Matching-merchants modal — Disable / Enable for this task | `agent_task_subscriptions.bo_disabled` | row action |
| Matching-merchants modal — Enrol / Un-enrol | `agent_task_subscriptions.enabled` | row action, offered only when the task's `auto_enrol` is off (legacy cohorts) |
| Matching-merchants modal — Clear overrides | `send_time_hour`, `channel`, `destination` | row action when the merchant has any; NULL restores inheritance |
| Delivery banner toggle | `system_config.daily_digest.send_mode` | shared with the daily digest — the copy says so |

## Preview and preflight answer different questions

**Preview** counts the audience — gate 4 only. It reports a number, and that number is not the
recipient count. A task previewing 619 merchants delivered to 1.

**Preflight** (`bo.preflight`) proves a SAVED definition against one enrolled merchant, per layer:

| Layer | What it proves |
|---|---|
| agent | resolves in Cadra, and is deployed |
| prompt | `task` present; every key is one the runner reads |
| audience | non-empty, and someone is enrolled when `auto_enrol` is off |
| channel | an adapter exists |
| destination | this merchant resolves a number |
| template | an APPROVED UTILITY CTA resolves |
| budget | caps are non-zero and the monthly cap is not below the per-run cap |
| send-mode | whether anything will actually leave the process |

The editor disables Activate on any `fail`. **A layer that cannot be evaluated is a `warn`, never
a pass** — an unreachable Cadra must not read as a healthy agent.

## Why a merchant will or will not receive

The matching-merchants modal is backed by `bo.listAudienceMembers` (paged; search by name or id;
sort name/id/createdAt). Membership comes from `buildAudiencePredicate` — the scanner's own
predicate — so the list is exactly who the scanner evaluates. Per row: country, onboarding status,
**Reachable** (WhatsApp via the BO recipient preview, email via `resolveEmailDestination`; null for
other channels) and **Will run**, computed by calling the REAL `resolveEffectiveTask` with the task
forced active and in-audience: `bo-disabled` / `snoozed` / `merchant-disabled` show as "Disabled by
ops" / "Snoozed by merchant" / "Not enrolled"; `not-due` is ignored because Will-run answers WHO, not
WHEN. `bo.explainSkips` (REST `…/skips`) still returns the full gate verdict per merchant.

This exists because a gate 1–7 skip writes **no run row**. The run table showed identical
emptiness for "blocked at a gate" and "never configured", and the per-tick metric
`agent_task.scanner.skipped.<reason>` is fleet-wide — it cannot say WHICH merchant.

## "Enrolled" and "can receive" are different questions

A merchant can be perfectly enrolled and still get nothing. The modal reports both (Will run +
Reachable). For a targeted audience, add the **Reachable** rule so unreachable merchants are not
matched at all; it restates each channel's delivery ladder in SQL and is parity-tested against the
adapters.

⚠️ **Historical (2026-09-01, the deleted enrolment panel): its "can receive" column used a rule measured WRONG.** It treats a
missing `message_phone_numbers` row as unable-to-receive, on the reading that
`skipDefaultConfig: true` disables the platform default. Two orgs with zero rows of their own both
sent successfully via the active `org_id IS NULL` default. **The column produces false negatives
until it is corrected.**

## Reading the numbers on this screen

`agent_task_runs.cost_usd` is a **reservation**, written before the run as `perRunCostCapUsd`.
Measured cost is `ai_usage_records.cost_usd` joined on `execution_uuid`. Three runs read
`0.500000` while costing `~0.0106` — 47× over. Caps are per definition, never global.

## Source

| File | Role |
|---|---|
| `page.tsx` | list page: Tasks + Runs tables, send-mode banner, hosts the drawer |
| `_components/task-drawer.tsx` | the right-side drawer, URL-driven (`?task=&tab=`), discard-changes guard |
| `_components/detail/task-detail.tsx` | header + five tabs + Save bar |
| `_components/detail/{audience,runs,setup,schedule,advanced}-tab.tsx`, `new-task-panel.tsx`, `task-header.tsx`, `save-bar.tsx` | the tabs, create flow, activation header (Activate re-counts the SAVED audience) |
| `_components/audience/{rule-builder,name-pattern-list,multi-select,matching-merchants}.tsx` | rules UI and the matching-merchants modal table |
| `_lib/{draft,use-definition-draft,task-url}.ts` | draft model, save/activate rules, drawer URLs |
| `_components/tasks-table.tsx`, `_components/run-table.tsx`, `_components/rollup-panel.tsx` | SDK tables and fleet rollups |
| `src/server/services/agent-tasks/audience.ts` | `buildAudiencePredicate` — every rule's SQL, shared by scanner, runner, preview and the list |
| `src/server/api/routers/agent-tasks.ts` | `bo.*` procedures |
| `src/server/services/agent-tasks/preflight.ts` | the preflight verdicts |
