# fleet-tasks — why nothing fired

Moved verbatim from `SKILL.md` (2026-09-30). Read when a task produced no run rows, or a merchant did not get a brief.

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
