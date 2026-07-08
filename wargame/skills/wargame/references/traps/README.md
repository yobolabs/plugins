# Trap Library

Externalized tacit knowledge: failure classes from REAL incidents in this ecosystem, injected into war-games as guaranteed reactions. Red-team treats a matching trap as a certainty, not a hypothesis.

## Entry format

```
### <trap-id> <one-line name>
- Signal: <what the executor observes>
- Cause: <the actual mechanism>
- Countermove: <the fix that worked>
- Source: <memory slug / session file / commit>
```

No hypotheticals. An entry without a real incident behind it gets deleted.

## Class files

- `env-deploy.md` — env vars, compose interpolation, deploy topology, tunnels, containers
- `rls-db.md` — RLS policies, GUCs, poolers, admin-vs-app connections, backups
- `migrations.md` — drizzle drift, out-of-band schema, reconcile patterns
- `queues-workers.md` — BullMQ, enqueue parity, worker restarts, pause/strand paths
- `streaming-sse.md` — SSE double-connect, event forwarding, buffers, relays
- `channels-messaging.md` — Slack/WhatsApp transports, gateways, responder bindings, callbacks
- `testing-baselines.md` — pre-existing failures, stash-baselines, smoke-vs-unit
- `platform-misc.md` — S3/MinIO, Vercel runtime, npm/link:, auth/JWT staleness, local dev process churn

## Feedback loop

Every executed war-game logs divergences reality produced that the war-game missed → new entries here (with source). The library only grows from contact with reality.
