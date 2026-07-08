# Traps — Testing, Verification, Diagnosis Method

### TB-01 Pre-existing baseline failures blamed on the diff
- Signal: full test run "fails" after your change — cadra-api ~54 env-dependent failures, cadra-web ~33 failed files + `pnpm build` fails at `/api/auth/desktop/token` — all pre-existing on clean HEAD
- Cause: env-dependent suites (Redis/DB/keys absent locally) fail identically on clean HEAD
- Countermove: stash-baseline (`git stash -u && rerun && git stash pop`), compare failure SETS not counts; report "N failed, verified pre-existing via stash-baseline on <sha>"; targeted suites for diff-touched paths are the real signal
- Source: cadra-preexisting-local-test-build-failures

### TB-02 Green unit tests over a dead runtime path
- Signal: all tests pass; the feature does nothing live
- Cause: no test exercised the real boundary (BullMQ queue.add→consumer; the actual HTTP hop; the real browser)
- Countermove: every feature crossing a process/system boundary gets one live smoke of that boundary; Playwright smoke > vitest for "does it work" (standing rule)
- Source: p41-agent-latency-rag-epic, feedback_smoke_tests_playwright

### TB-03 Golden fixtures only catch what their inputs exercise
- Signal: conformance harness green, prod broken by the same class it guards
- Cause: fixture used clean prose; the bug triggered on data-shaped input (schema-token narration)
- Countermove: fixtures must include code×data-shaped inputs from real traffic, not just happy-path; capture a real trip-string as the regression fixture
- Source: session 2026-07-02 narration-lump-rootcause

### TB-04 Measuring on local topology misses deployed bottlenecks
- Signal: audit finds nothing where prod hurts; local numbers don't reproduce prod latency
- Cause: structural differences (e.g. `REDIS_PUBSUB_URL` unset locally → the ~380ms/event awaited Upstash mirror publish is invisible)
- Countermove: reconstruct ≥1 deployed-env execution from `agent_execution_logs` (seq + timestamp gaps); wall-clock ∝ step-count = per-event tax, profile the event pipeline not the LLM
- Source: session 2026-07-04 p42-instant-response-audit2

### TB-05 Trusting a log line over the behavior it claims
- Signal: "Skipping upfront RAG (JIT)" logged — followed immediately by KB-skill auto-activation doing the RAG anyway
- Cause: the reassuring log and the actual behavior diverged; audits believed the string
- Countermove: verify optimizations by their EFFECTS (grep for the embedding calls, measure the timing), never by their announcement
- Source: session 2026-07-04 p42-instant-response-audit2

### TB-06 Implemented-but-never-instantiated infrastructure
- Signal: cache/feature class exists, fully tested, zero prod effect
- Cause: constructor never called in the live wiring (`HybridAgentCache`)
- Countermove: when auditing, grep the CONSTRUCTOR CALL / registration site, not the class definition
- Source: session 2026-07-04 p42-instant-response-audit2

### TB-07 Fixing the method the callsite doesn't use
- Signal: change deployed, data present, UI still empty
- Cause: enrichment added to `findByUuid` while the panel calls `findByUuidWithOrg` (org-scoped twin)
- Countermove: trace the ACTUAL callsite chain before editing; repo layers with org/non-org twins are a standing ambush
- Source: session 2026-06-22 clay-connector
- Generalizes: verify your edit is on the executed path — grep callers, not just names

### TB-08 Non-reproducible inference vs the user's runtime observation
- Signal: your probes "prove" X; user insists not-X
- Cause: probe artifacts (owner-role checks racing the app's commit produced false "rows still present"; the real issue was list auto-refresh)
- Countermove: trust the user's runtime observation as a datapoint to explain, not explain away; separate data-layer truth (DB query) from view-layer truth (cache/refetch)
- Source: session 2026-06-22 clay-connector

### TB-09 "Broken" things that were never broken
- Signal: fix proposed for code that works
- Cause: stale context (assumed neon-http still in use; assumed wrong password when the pooler auth just differs from psql)
- Countermove: verify current state first; when "this wasn't a problem before", diff what CHANGED, don't hunt theoretical bugs in old code
- Source: feedback_verify_before_fixing

### TB-10 Rollback didn't fix it → the cause was never in that layer
- Signal: pre-ship image restored, symptom persists
- Cause: the symptom predated the ship (agent prompt config, not code)
- Countermove: a failed rollback is strong evidence — redirect to config/data/env layers; keep the bad image dangling (`docker tag` retag beats rebuild for roll-forward)
- Source: session 2026-07-02 narration-lump-rootcause

### TB-11 Subagent output is not durable and not ground truth
- Signal: findings vanish (never written to disk); summary omits the decisive detail
- Cause: subagent inline returns aren't persisted; the real evidence lives in the subagent transcript
- Countermove: persist subagent reports to `_specs`/session files deliberately; for forensic work read the transcripts, not just the returned summary
- Source: session 2026-07-04 p42 + 2026-07-02 narration sessions

### TB-12 External review loops: converge, ground, and scope
- Signal: review "done" after one pass; or a fix introduces a fresh hole
- Cause: R2/R3 each caught bugs the PREVIOUS round's fix introduced (auth bypass twice); ungrounded review claims can patch fiction into specs
- Countermove: run review loops to true convergence (trajectory narrowing = signal); ground-truth every code claim read-only before patching; scope each review to its own feedback file (stray procs clobber)
- Source: session 2026-07-05 crossorg-cs-inbox-phase-b

### TB-13 ML evaluation: partial leakage batteries and self-corrupting gates
- Signal: pooled AUC looks great (or a promote gate "passes") on a model that memorized group base rates or gated against a nan baseline
- Cause: single-probe batteries miss whole classes — a group/tenant id as a declared feature is a base-rate memorization vector; thin/single-class bootstrap CI goes nan or deceptively narrow, and every candidate "beats" nan
- Countermove: run the UNION battery — shuffled-label control (>0.55 = mechanical leak), temporal-vs-random split comparison (equality = leak), importance audit, per-group AUC on the tenant key, too-good-heuristic tripwire (heuristic AUC ≥0.85 pre-training) — and assert CI validity BEFORE it gates anything
- Source: `_context/_wargames/ml-campaign-p1/calibration.md` F4/F13/F17 — verified `org_id` in CAT_COLS `ml-campaign/src/mlc/train.py:15`
