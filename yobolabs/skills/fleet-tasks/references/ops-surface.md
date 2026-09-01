# The ops surface — configuring a fleet task without SQL

`src/app/backoffice/agent-tasks/`, gated on `admin:agent_tasks_read` / `_manage`.

Every setting that decides whether a task runs is editable here. Until 2026-09-01 most of them
were reachable only from psql, which is why tasks were activated and then silently reached nobody.

## What each control writes

| Control | Column | Notes |
|---|---|---|
| Cadra agent **picker** | `agent_uuid` | replaced a pasted uuid. A typo, a deleted agent and a DRAFT agent all failed identically at run time — an enqueue 500 reading `Agent is not deployed`. The picker marks what is dispatchable and falls back to a raw field when Cadra is unreachable |
| Cadence / weekday / **hour / minute** | `schedule` | `{kind, hour, minute}`; minute defaults to 0 |
| Audience mode + filters | `audience` | previewable; the preview gates Activate |
| Default channel | `default_channel` | |
| Auto-enrol | `auto_enrol` | off ⇒ explicit cohort only |
| Six limits | `limits` | incl. `monthlyCostCapUsd`, `perRunCostCapUsd` |
| Task input (JSON) | `input_template` | `.strict()` — an unread key is a 400 at save |
| **When the merchant never answers** | `alternative_on_exhaustion` | parsed by `taskAlternativeSchema` at the write boundary; previously a jsonb column with no validation and no screen |
| Merchants tab — enrol / unenrol | `agent_task_subscriptions.enabled` | |
| Merchants tab — clear overrides | `send_time_hour`, `channel`, `destination` | NULL restores inheritance |
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

`bo.explainSkips` re-runs the REAL resolver per merchant and returns the gate verdict, so the
screen cannot drift from the scanner's behaviour.

This exists because a gate 1–7 skip writes **no run row**. The run table showed identical
emptiness for "blocked at a gate" and "never configured", and the per-tick metric
`agent_task.scanner.skipped.<reason>` is fleet-wide — it cannot say WHICH merchant.

## "Enrolled" and "can receive" are different questions

A merchant can be perfectly enrolled and still get nothing. The panel reports both.

⚠️ **The shipped "can receive" column uses a rule measured WRONG on 2026-09-01.** It treats a
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
| `_components/definition-editor.tsx` | the definition form, preview gate, preflight panel, agent picker |
| `_components/enrolment-panel.tsx` | Merchants tab — enrol, can-receive, skip reasons, overrides |
| `_components/run-table.tsx` | runs and their terminal reasons |
| `_components/rollup-panel.tsx` | fleet rollups |
| `page.tsx` | tabs and the send-mode banner |
| `src/server/api/routers/agent-tasks.ts` | `bo.*` procedures |
| `src/server/services/agent-tasks/preflight.ts` | the preflight verdicts |
