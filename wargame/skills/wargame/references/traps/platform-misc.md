# Traps — Platform, SDK, Build, Misc

### PM-01 MinIO on `localhost` → MetadataTooLarge from browser cookies
- Signal: every browser request to MinIO fails MetadataTooLarge, even for objects with zero metadata
- Cause: browsers share cookies across ALL ports on a hostname — app cookies on localhost:3000 ride to localhost:9000 and count toward MinIO's metadata cap
- Countermove: `S3_ENDPOINT=http://127.0.0.1:9000` everywhere (separate cookie domain) + MinIO `--address 127.0.0.1:9000`
- Source: feedback_minio_localhost

### PM-02 AWS SDK v3 auto-checksums break MinIO uploads
- Signal: `MetadataTooLarge` on upload via SDK ≥3.614
- Cause: SDK adds CRC32 checksums MinIO stores as metadata
- Countermove: `requestChecksumCalculation: "WHEN_REQUIRED"` in S3Client config
- Source: MEMORY.md common pitfalls

### PM-03 TypeScript `private` fields compile away
- Signal: property undefined at runtime though "stored" in the class
- Cause: value lives in a `private options` object; consumers need a public getter
- Countermove: expose public getters for anything read outside the class
- Source: MEMORY.md common pitfalls

### PM-04 `npm whoami` 401 on automation tokens — EXPECTED
- Signal: token "invalid" per whoami; publish would actually succeed
- Cause: automation tokens don't answer whoami; interactive publish fails EOTP (2FA) — automation token bypasses OTP
- Countermove: publish with `--//registry.npmjs.org/:_authToken=<token>`; never persist the token; after publish bump `sdk-versions.json`
- Source: reference_secrets_server_inventory, reference_npm_publish

### PM-05 `link:` refs and the prod swap
- Signal: prod missing an SDK change that works locally; or someone "fixed" package.json by hardcoding a version
- Cause: apps use `link:../core-sdk/*` locally; `vercel-prebuild.mjs` swaps to versions from `sdk-versions.json` at deploy — a core-sdk change reaches prod ONLY after publish + version bump
- Countermove: never manually change `link:` in package.json; SDK change checklist = publish package → bump `sdk-versions.json` → deploy app
- Source: CLAUDE.md, p41 merge caveats

### PM-06 HTTP/CDN caching of tRPC breaks invalidation + leaks cross-org
- Signal: list won't refresh after a mutation (invalidate() present and correct); only on deployed Vercel
- Cause: middleware/responseMeta set `public, s-maxage` on `/api/trpc/*.list` — edge serves the cached body to the refetch; `public` + Vercel ignoring `Vary: cookie` can serve one org's list to another
- Countermove: `private, no-store` unconditionally for tRPC responses; also: framework `withCache`/`invalidatePattern` are NO-OP STUBS — code "invalidating" them busts nothing
- Source: session 2026-06-22 clay-connector (`f5051ec`)

### PM-07 Packaged builds bundle stale gitignored `dist`
- Signal: "my fix didn't work" on EAS/packaged builds; fine in dev/sim
- Cause: workspace package resolves via exports→`dist`; dist is gitignored and no build hook runs in CI → stale cached dist ships
- Countermove: when a change "has no effect" in a packaged build, suspect the BUILD: verify the package's dist was rebuilt, not just the commit hash
- Source: session 2026-06-23 typed-entity-cards-eas-stale-dist

### PM-08 Conflicting directives: the strongest copy wins
- Signal: agent does X despite the system prompt saying don't — a tool description said "required"
- Cause: behavioral directives duplicated across system prompt / tool descriptions / seeds; the model obeys the most forceful copy
- Countermove: each behavioral directive lives in exactly ONE place; audit tool descriptions when prompt changes don't take
- Source: session 2026-07-04 p42-instant-response-audit2

### PM-09 Vector dimensions cap indexing at 2000
- Signal: KB search seq-scans (slow); HNSW/IVFFlat index creation fails
- Cause: 4096-dim embeddings exceed pgvector index caps; also query embedding model+dims must match the stored table's per-KB
- Countermove: ≤1536 dims (Matryoshka param); check `dimension-manager.getTableDimension` before vector search; model slug switch = new stamp = lazy re-embed, not swappable in place
- Source: p41-agent-latency-audit-findings, p41-agent-latency-rag-epic

### PM-10 Worktree/branch mechanics that corrupt merges
- Signal: `git worktree add … develop` fails "already checked out"; a merge lands on the wrong branch after a stray `cd`
- Cause: develop held by another worktree; compound commands with `cd` change context mid-flow
- Countermove: throwaway worktree off `origin/develop` + `git push origin HEAD:develop`; absolute paths, no cd-chains during merge ops
- Source: p41-agent-latency-rag-epic deploy gotchas

### PM-11 zsh/sandbox shell quirks
- Signal: loop over `$VAR` runs once; CLI args concatenate into one token
- Cause: zsh doesn't word-split unquoted vars; this sandbox mangles `$S`/`--scope` passed via vars
- Countermove: literal lists / `while read` / `${(f)}`; pass CLI flags inline-literal
- Source: reference_qraved_db_backups, session 2026-07-03 superhost

### PM-12 Config identity doesn't cross environments
- Signal: agent/provider works in one env, "not found" in another with the same uuid
- Cause: agent uuids, provider rows, org ids are PER-ENV rows (dev app-dev vs prod); OpenRouter embed key resolves from the DB providers row (org_id NULL), not env vars
- Countermove: re-resolve every uuid/key per environment; never copy uuids across env configs
- Source: p4-unified-messaging-live-deploy, p41-agent-latency-rag-epic

### PM-13 The dumbest failure class (checked first, found often)
- Signal: anything
- Cause: wrong directory (polyrepo — this is NOT a monorepo; each app its own repo), wrong checkout on the port, stale build, service not booted, `yobo/` not `yobo-merchant/` (CLAUDE.md table stale)
- Countermove: confirm repo/dir/branch/process before deeper theories; boot order cadra-web BEFORE cadra-api
- Source: CLAUDE.md, yobo-app-path-correction, feedback_dev_process_churn_one_supervisor

### PM-14 Templating on a feature flag nobody consumes
- Signal: new `features.hide_X` flag seeds fine, gates nothing; nav item never hides
- Cause: the copied "pattern" only DEFINES the flag (`isAdStudioHidden`, Sidebar.tsx:750, never consumed) — the live patterns are the consumed spreads (`!isReferralHidden` :839, `!isWorkflowsHidden` :852)
- Countermove: before templating on a flag, grep the CONSUMPTION site, not the definition; prove by seeding the flag and observing the gate flip
- Source: `_context/_wargames/p34-social-publishing/calibration.md` F29 — verified `yobo` Sidebar.tsx:747/:750 vs :839/:852 (Fable-direct shipped this defect)

### PM-15 Calendar surfaces bucket by the browser tz, not the artifact's stored tz
- Signal: a scheduled item's calendar chip renders a day off; composer tz picker looks correct
- Cause: day-boundary bucketing computed in the viewer's local tz while the artifact stores its own tz
- Countermove: bucket calendar cells by the artifact's STORED tz; tz pills in the composer don't fix the calendar
- Source: `_context/_wargames/p34-social-publishing/calibration.md` F45

### PM-16 Cross-system entity joins on raw equality are silently mostly-NULL
- Signal: joined features/enrichment mostly NULL while both sides "have the data"; row counts pass
- Cause: format drift across systems — message history stores bare `62…`, customers store E.164 `+62…`; `w.recipient_phone = cu.phone` raw equality matches almost nothing
- Countermove: probe format distribution + match RATE before trusting any cross-system join (phone/email); normalize at export (`COALESCE(normalized_phone, phone)`)
- Source: `_context/_wargames/ml-campaign-p1/calibration.md` F34 — verified raw join `ml-campaign` features.sql:43,47; `customers.normalizedPhone` E.164 exists

### PM-17 Bulk writeback without applied/skipped counts hides partial application
- Signal: writeback "succeeds"; some rows silently never land (snapshot INNER-join drops customers unnoticed)
- Cause: bulk upsert contract returns only ok/200 — dropped writes are invisible at the API boundary
- Countermove: bulk writeback contracts return `{upserted, skipped}` counts; caller asserts the sum against what it sent; silent partial application is a defect
- Source: `_context/_wargames/ml-campaign-p1/calibration.md` F21b

### PM-18 Secondhand-spec citation — §numbers transcribed from code comments, spec never opened
- Signal: implementation constants/shapes diverge from the cited section (headers, retry envelope, endpoints), while comments and ledger cite the § pervasively; artifact LOOKS spec-conformant to reviewers who trust citations
- Cause: executor harvested §-references from existing code comments and reasoned from repo internals; never hunted `_context/{project}/_specs/**` for the actual section
- Countermove: cite-as-READ rule — quoting one concrete constant from the section proves it was opened; reviewers diff implementation constants against every cited section (dev-team reviewer audit 5b)
- Source: `_context/_fable/execution/calibration-story008/judge-verdict.md` §4 — verified: Run A cited "§14.4" ~15× while its signature headers, retry constants, and health surfacing all contradicted §14.4
