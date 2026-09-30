# fleet-tasks — prod procedure

Moved verbatim from `SKILL.md` (2026-09-30). Read before ANY prod change: activation, env flip, template, audience, rollback.

## Prod procedure

**The runbook EXISTS: `_context/_runbooks/yobo-fleet-agent-tasks-prod.md`** (written 2026-09-01; earlier skill versions wrongly said it did not). Read it before touching prod — it corrects three things this skill used to get wrong: an org does NOT need its own `message_phone_numbers` row (the merchant's row is never read — see "Which number the CTA leaves from"), the prod worker is a raw `docker run` on the prod merchant box (`hosts.qraved-merchant` in `server-inventory.yaml`), not Coolify, and `AGENT_TASKS_ENABLED` needs a container RECREATE.

**The REST management API is on prod since `9da1d3406` (2026-09-02)** — `X-Internal-API-Key` with the prod `INTERNAL_API_KEY`, same routes as dev. Before that cut the only prod write paths were the backoffice UI as Super User or SQL as `neondb_owner` with preview + preflight done by hand. `GET /definitions` returns `data.items` (not `definitions`).

**A template approved at Meta must ALSO be registered in the gateway** (`whatsapp_templates`, the sending `client_id`) or every send 500s `failed to get template: record not found` while preflight passes — see `yobo:whatsapp`. The wamid of a sent run is at `payload_snapshot.notifications[0].providerRef`.

**"Every org whose owner has a phone" IS now an audience rule** (corrected 2026-09-18): `rules.requireReachable` evaluates the task channel's delivery ladder in SQL, including rung 3 (active owner's `users.phone`), parity-tested against the adapters. It is evaluated at scan time, so the test-account reset or an owner leaving `active` drops the merchant out cleanly instead of producing a failed run. For a single test merchant use a name rule (`nameMatches startsWith '<name>'`), not a hand-picked list. Check `orgs.timezone` on the cohort first — a UTC default makes "07:00 local" fire at 14:00 WIB, and the brief prompt uses the timezone for the merchant's country and language.

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
