# Traps — RLS, Auth Context, Database Access

### RLS-01 Empty GUC casts differently on pooler vs local
- Signal: org-scoped reads throw `ERROR: invalid input syntax for type integer: ""` on dev/Neon; identical code clean locally
- Cause: system-actor path skips `set_config('rls.current_user_id',…)`; Neon POOLER returns unset GUC as `''` (local Postgres returns NULL) → inline `current_setting(...)::integer` throws
- Countermove: exception-safe getter functions (`NULLIF(current_setting(…,true),'')::integer` + `EXCEPTION WHEN OTHERS RETURN NULL`) in every policy; `pnpm db:rls:deploy` to dev AND prod (per-env DBs)
- Source: p39-channel-rls-empty-user-guc-throw
- Generalizes: any GUC-reading SQL behaves differently on pooled vs direct connections — test on the pooler

### RLS-02 RLS session-variable names differ per app
- Signal: RLS "not working" though set_config is called
- Cause: cadra stack uses `rls.current_org_id` (NOT `app.current_org_id`); msg-api uses `app.current_org_id` — per-app divergence
- Countermove: read the app's policy generator before assuming the var name
- Source: CLAUDE.md, p4-unified-messaging-live-deploy

### RLS-03 Wrong DB user: runtime user is RLS-restricted / underprivileged
- Signal: `permission denied for schema drizzle` (pg_dump/migrations); queries silently filtered
- Cause: `DATABASE_URL` = app_user (RLS-restricted); admin ops need `ADMIN_DATABASE_URL` (owner)
- Countermove: direct queries/dumps/migrations always via ADMIN/owner URL; migrations set `DATABASE_MIGRATE_URL` to the owner URL
- Source: CLAUDE.md, reference_qraved_db_backups, reference_msgapi_dev_deploy

### RLS-04 Neon `-pooler` host breaks pg_dump/direct tooling
- Signal: pg_dump/psql failures against a working app DB URL
- Cause: PgBouncer pooler endpoint doesn't support everything direct does
- Countermove: strip `-pooler` from the host (use the `*_UNPOOLED` var when present) for dumps/migrations
- Source: reference_qraved_db_backups

### RLS-05 System actor userId=0/null breaks every user-assuming layer
- Signal: 422 `Validation failed` on internal execution create; agent has no memory of prior turns (re-asks forever); team resolution returns no lead/members; `SQLSTATE 23503` FK on agent_sessions (fail-open)
- Cause: channel/responder runs have no real user — `userId=0`/null; schemas with `.positive()`, FK to users(id), and actor-scoped reads all assume a positive logged-in userId
- Countermove: schema preprocess non-positive→undefined (stored NULL); write NULL not 0; `withPrivilegedDb` re-resolve for actor-scoped reads; every new internal route/read on the channel path must be checked against "works with no user"
- Source: p39-channel-userid-delegation-trap, msgapi-responder-ask-user-pause-strand
- Generalizes: the channel-vs-chat divergence family — chat has a real userId, channels don't; anything assuming one silently diverges

### RLS-06 RLS fails silently — never the only layer
- Signal: none until data leaks (that's the trap)
- Cause: forgot to deploy policies, migration overwrote them, session vars unset on a new code path, `withPrivilegedDb` bypasses entirely
- Countermove: app-level ownership/visibility checks in repository + router alongside RLS; platform-superuser bypass (`isSystemUser`) built in from the start; test with admin AND non-admin
- Source: feedback_defense_in_depth

### RLS-07 Permissions live in the JWT — stale until re-login
- Signal: newly seeded permission "doesn't work" for the user who just got it
- Cause: permissions snapshot into the JWT at auth; seeding doesn't refresh live sessions
- Countermove: after `db:seed:rbac`, re-login before judging
- Source: CLAUDE.md permission registration

### RLS-08 Org identity: integer id vs uuid confusion at service boundaries
- Signal: `Organization not found` with a "correct" org id; SSE org filter never matches
- Cause: tier auth resolves org by uuid/external_id only (int fails); SSE events carry NUMERIC DB id while the caller filters by uuid
- Countermove: at every cross-service boundary state which org identity form travels; resolve uuid→numeric at connect/ingress, don't compare across forms
- Source: reference_msgapi_dev_deploy, session 2026-07-05 crossorg-cs-inbox-phase-b
