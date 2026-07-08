# Traps — Env, Deploy, Infra

### ED-01 Compose `$`-interpolation corrupts secrets containing `$`
- Signal: auth that "should work" always 401s; stored bcrypt hash is 56 chars/2×`$` instead of 60/3×`$`
- Cause: docker-compose `--env-file` interpolates `${…}` inside values — bcrypt hashes (`$2b$12$…`) get segments eaten, salt-dependent
- Countermove: never pass `$`-bearing secrets through compose interpolation; use `$`-free secrets (e.g. msg-api `x-service-secret` trusted path instead of the corrupt `PLATFORM_API_KEY_HASH` Tier-1)
- Source: reference_msgapi_dev_deploy, p4-unified-messaging-live-deploy
- Generalizes: any secret with `$` through compose env-file interpolation is silently mangled

### ED-02 Coolify non-literal env vars escape quotes → JSON env broken
- Signal: `JSON.parse` fails at position 1 on an env var that looks fine in the UI (e.g. `INTEGRATION_ENCRYPTION_KEYS not valid JSON`)
- Cause: Coolify `is_literal=false` (default) runs `escapeEnvVariables()` → every `"` becomes `\"`; UI paste also adds stray whitespace in long strings
- Countermove: set `is_literal=true` on the row (via tinker/Eloquent, never raw UPDATE on encrypted column), then QUEUE A DEPLOYMENT (env needs recreation, not restart); verify in-container with `node -e 'JSON.parse(process.env.VAR)'`
- Source: project_coolify_env_is_literal

### ED-03 deploy-dev.sh exits non-zero though deploy succeeded
- Signal: `Conflict. The container name "/<old>_ai-saas-dev-api" is already in use`; script aborts before its own health check
- Cause: `dc up -d --force-recreate` name-conflict + `set -e`; new image already built, new container already healthy, old removed
- Countermove: NEVER trust the exit code — verify END-STATE: `docker inspect <name>` (image + StartedAt + Health), `curl localhost:PORT/health/live` = 200, exactly one running container
- Source: reference_cadra_api_worker_deploy (recurs EVERY cadra-api dev deploy)

### ED-04 Deploy checkout silently deleted → every deploy fails at `cd`
- Signal: GH Action fails in ~10s with `cd: can't cd to ***`
- Cause: on-box checkout dir (`/mnt/apps/message-api`) was deleted; deploys had failed since 2026-03-19 unnoticed
- Countermove: re-clone via the box root `server-deploy` key; reconstruct `.env.*` from the live container env (`docker inspect .Config.Env`)
- Source: reference_msgapi_dev_deploy

### ED-05 Corepack pnpm drift breaks builds
- Signal: `ERR_PNPM_IGNORED_BUILDS` (sharp/bcrypt/baileys) on `pnpm install --frozen-lockfile --prod`
- Cause: no `packageManager` pin → corepack pulls pnpm 11.x which drops `pnpm.onlyBuiltDependencies`
- Countermove: pin `"packageManager": "pnpm@10.34.4"` in package.json
- Source: reference_msgapi_dev_deploy (commit `01d32af`)

### ED-06 Dockerfile CMD is API-only; workers never run
- Signal: inbound processed, replies enqueue, nothing ever sends; no worker logs
- Cause: image CMD `dist/server.js` (API-only) while dev needs `dist/local.js` (server+workers); compose override missing
- Countermove: compose `command: ["node","dist/local.js"]`; verify the worker queue consumer logs at boot
- Source: p4-unified-messaging-live-deploy

### ED-07 Directional env-var confusion: forward vs egress creds
- Signal: Slack socket open + healthy, bot totally silent; log `[slack-host] CADRA_WEB_URL / internal key not configured — cannot forward channel.message`
- Cause: `CADRA_WEB_URL`+`CADRA_API_INTERNAL_KEY` (inbound-forward direction) are DISTINCT names from the already-set `CADRA_API_URL`/`CADRA_API_KEY` (egress direction)
- Countermove: set both forward vars in the box env + container RECREATE; verify with `docker exec <c> printenv`
- Source: p39-slack-forward-cadra-web-url-env
- Generalizes: a bidirectional service pair has TWO credential sets — check the direction that's failing

### ED-08 Env change + `restart` does nothing
- Signal: new env var set in file, container restarted, behavior unchanged; `printenv` in container shows old/missing value
- Cause: docker restart reuses the created container's env; env is baked at CREATE
- Countermove: `up -d --force-recreate` (recreate, not restart) after env edits
- Source: p39-slack-forward-cadra-web-url-env

### ED-09 Deploy dir on a stray branch builds a hybrid
- Signal: deployed behavior matches neither develop nor the feature branch
- Cause: `deploy-dev.sh update` runs `git pull origin develop` INTO whatever branch is checked out
- Countermove: before deploy: `git checkout develop && git reset --hard origin/develop` on the box
- Source: reference_cadra_api_worker_deploy

### ED-10 Vercel deploy gated on bot commit author
- Signal: push to develop → deployment readyState BLOCKED (or nothing builds)
- Cause: cadra-web Vercel only deploys commits authored by the bot (`jetdevs <sean@jetdevs.com>`); human-authored direct push doesn't trip it
- Countermove: ALWAYS `pnpm merge:develop` for cadra-web (stamps `VERCEL_BOT_NAME/EMAIL`); if a manual merge landed, push a follow-up bot-stamped commit
- Source: p41-agent-latency-rag-epic (bit twice: `5223d05d`, `ed1677b0`)

### ED-11 `vercel env add` with piped stdin writes EMPTY
- Signal: env var exists but empty; app fail-closes at boot
- Cause: `--value … --yes` on piped stdin silently writes nothing; also `vercel redeploy` rebuilds the deployment's ORIGINAL commit (stale code, new env)
- Countermove: use `--no-sensitive --force`, then `vercel env pull` and verify non-empty BEFORE deploy; confirm redeploy target is at tip
- Source: session 2026-07-03 superhost prod-provisioning (bit 4 vars)

### ED-12 `NEXT_PUBLIC_*` inlines at build time
- Signal: env var set on Vercel, page still throws/uses old value
- Cause: `NEXT_PUBLIC_*` is baked into the client bundle at build; setting it does nothing without a rebuild; some code reads raw `process.env` bypassing validated env
- Countermove: set var → redeploy (fresh build); route reads through the validated `env` module
- Source: session 2026-07-03 superhost prod-provisioning

### ED-13 cloudflared: quic protocol + launchd label collision
- Signal: tunnel 530s/flaky on some networks; or killing "the tunnel" kills the wrong one
- Cause: quic = UDP/7844, blocked/throttled widely; healthy user tunnel and dead root orphan BOTH labeled `com.cloudflare.cloudflared` (gui/501 vs system domain)
- Countermove: all tunnels `--protocol http2`; bootout only `system/…`, never `gui/501/…`; MC row label must match exactly (no `.tunnel` suffix)
- Source: reference_cadra_mini_cloudflare_tunnels

### ED-14 Tunnel URL routes to the WRONG checkout → internal forward 401s
- Signal: cadra-api→cadra-web internal POST 401 despite correct key
- Cause: `CADRA_WEB_URL` tunnel host routes to a different machine/checkout than the one validating the shared key
- Countermove: confirm the tunnel ingress maps to the LOCAL `:3000` checkout being tested; -mini/-max hostnames both resolve — cookie/key collisions across them
- Source: feedback_always_tunnel_urls_nextjs, reference_cadra_mini_cloudflare_tunnels

### ED-15 Sandbox network artifacts: fake open ports, fake DNS
- Signal: fresh remote box shows listeners (RDP/VNC "open"), sub-ms ping ttl=64 to a far host; `*.yobolabs.ai` resolves to `198.18.x.x`
- Cause: sandbox egress routes via `utun4 → 198.18.0.1` which answers locally; DNS intercepted
- Countermove: never trust port probes/DNS from the sandbox for remote hosts — verify on-box (`ss -tlnp`); host-key fingerprint proves SSH reached the real box; prove domains via raw `*.vercel.app` or `curl --resolve`
- Source: env-sandbox-port-probe-false-positive, session 2026-07-03 superhost

### ED-16 SSH "accepts key then Permission denied" with no TTY
- Signal: `Server accepts key` → `Permission denied`; `read_passphrase: can't open /dev/tty`
- Cause: key is passphrase-encrypted, agent empty, Bash tool has no TTY to prompt
- Countermove: check `ssh-add -l` FIRST; `~/.ssh/config` Host * with `AddKeysToAgent yes` + `UseKeychain yes` + explicit `IdentityFile` (non-default key name is never tried otherwise); box is fine
- Source: reference_secrets_server_inventory

### ED-17 Local dev port churn = multiple supervisors fighting
- Signal: repeated EADDRINUSE, transient pids, servers "randomly" dying; connection status flipping to pending
- Cause: MC + terminal `pnpm dev` + manual kills all supervising the same port; `pnpm dev` is a process TREE (killing the listener leaves the respawning parent); zombies hold sockets
- Countermove: ONE supervisor (Mission Control only), one checkout per port, MC stop BEFORE switching checkouts, boot cadra-web BEFORE cadra-api; diagnose with `lsof -ti tcp:PORT -sTCP:LISTEN` + `lsof -p PID -a -d cwd`
- Source: feedback_dev_process_churn_one_supervisor

### ED-18 Browser flows ride the NEXTAUTH_URL/APP_URL domain, never localhost
- Signal: browser E2E/OAuth moves scripted on `http://localhost:PORT` fail — session missing, OAuth callback mismatch — while the app "works" in a manual tab
- Cause: `NEXTAUTH_URL`/`APP_URL` point at the tunnel domain (e.g. `https://yobo-mini.cafesean.com`); Secure cookies and the OAuth redirect_uri are DERIVED from it — a localhost session and a tunnel-derived callback never share state
- Countermove: drive every browser/OAuth flow on the exact NEXTAUTH_URL/APP_URL host; register the derived redirect_uri with the vendor; localhost is for curl only
- Source: `_context/_wargames/p34-social-publishing/calibration.md` §1 — verified `yobo/.env.local:85,150,180`

### ED-19 Local object store is unreachable by external vendors
- Signal: vendor-pull integration (Meta/IG media fetch) fails `(#100)`-class on assets that download fine locally
- Cause: local S3 is MinIO on `localhost:9000` — categorically unreachable from outside; presigning a localhost URL fixes nothing
- Countermove: design the E2E proof around reachability — a media-free lane (text/link posts) plus a public-URL seeded-asset lane; presign-at-fire-time is the deployed-env answer only
- Source: `_context/_wargames/p34-social-publishing/calibration.md` §1 — verified `yobo/.env.local:50` `S3_ENDPOINT="http://localhost:9000"`

### ED-20 Split-service deploys: the cron service fails while the API looks healthy
- Signal: request-path service green, health checks pass; the nightly/cron sibling has been failing silently for days
- Cause: only the cron service touches the external dependency (BQ, SA creds, egress) — the API hot path never exercises it, so API health proves nothing about the cron lane
- Countermove: check BOTH services' logs; give the cron lane its own observable (last-success timestamp, row-count delta) — never infer it from API health
- Source: `_context/_wargames/ml-campaign-p1/calibration.md` F24 — verified serve hot path is parquet-only (`ml-campaign/serve/app.py`)
