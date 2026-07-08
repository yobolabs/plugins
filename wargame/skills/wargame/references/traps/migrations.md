# Traps — Migrations & Schema Drift

### MIG-01 Local drizzle tracking drift: applied-but-untracked migration
- Signal: `pnpm db:migrate:run` fails `column ... already exists`
- Cause: a migration was applied out-of-band (only 0001 tracked, 0002's columns exist)
- Countermove: LOCAL only — apply new migrations' SQL directly via psql (additive = safe), verify via information_schema; do NOT rewrite migrations to "fix" local drift (fresh prod migrates cleanly in order)
- Source: msg-api-local-drizzle-migration-drift

### MIG-02 push-created schema has ZERO tracked migrations; drizzle watermark is created_at-based
- Signal: migrator wants to re-apply everything from 0001 against a schema that already exists
- Cause: schema born via `drizzle-kit push` → `__drizzle_migrations` empty; the migrator watermarks by `created_at desc limit 1` (NOT a hash set)
- Countermove: reconcile with ONE INSERT `(hash, created_at=<journal.when>)` for the drifted migration, then migrate normally applies the rest
- Source: reference_msgapi_dev_deploy

### MIG-03 UNIQUE-index migration fails on pre-existing duplicates
- Signal: migration bombs adding a unique index (e.g. `(org_id, external_id)` inbound rows)
- Cause: historical dup rows predate the constraint
- Countermove: dedupe first (keep-lowest), then the index; whole run is transactional so a failure rolls back cleanly
- Source: reference_msgapi_dev_deploy (migration 0007)

### MIG-04 Runner image can't run migrations
- Signal: no `scripts/`, no `drizzle/*.sql`, no tsx in the deployed container
- Cause: production image is runtime-only
- Countermove: run migrate/rls from a throwaway `node:22-alpine` mounting the checkout: `pnpm install --frozen-lockfile --ignore-scripts`, `apk add postgresql-client` (rls deploy shells psql), `DATABASE_MIGRATE_URL=$ADMIN_DATABASE_URL`
- Source: reference_msgapi_dev_deploy

### MIG-05 Clean rebuild blocked by a broken schema import → DB stuck on old baseline
- Signal: runtime failures on MISSING BASE columns/tables even though the newest migrations applied; `drizzle-kit push`/db:reset all die `MODULE_NOT_FOUND`
- Cause: schema file imports a nonexistent module (`agents.ts` → `./organizations.js`) so every regeneration tool fails; base tables silently sit on an old shape
- Countermove: hand-apply the additive DDL to match checked-in schema (empty local tables = safe); real fix is repairing the import
- Source: msg-api-local-drizzle-migration-drift

### MIG-06 Code shipped ≠ data migrated
- Signal: new code errors on old-shaped rows/tables in exactly one env
- Cause: DDL-shape change (e.g. chunk_id integer→text) needs a backfill per env; `CREATE TABLE IF NOT EXISTS` helpers won't migrate types of existing tables
- Countermove: make the backfill `--apply` an ordered deploy step for EVERY env; new-env-only testing hides it
- Source: session 2026-07-02 p40-kb-retrieval-repair

### MIG-07 Raw sql`` interpolation bypasses drizzle column mapping
- Signal: 500 `ERR_INVALID_ARG_TYPE: … Received an instance of Date` on a DB write
- Cause: a `sql\`COALESCE(...)\`` interpolated a raw Date — drizzle's column serialization never touched it (sibling params fine)
- Countermove: fix at the interpolation site (`.toISOString()` + cast), not the column; audit param lists when one param serializes differently than siblings
- Source: session 2026-06-27 slack-channel-live-bringup-callback-date-bug
