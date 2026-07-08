# Traps — Queues, Workers, Async Execution

### QW-01 BullMQ jobId cannot contain `:`
- Signal: job never appears; enqueue error swallowed as non-fatal ("Custom Id cannot contain :")
- Cause: jobId built like `reembed:{org}:{kb}:{dims}` — colons banned in custom ids (Redis KEY colons are fine)
- Countermove: dash-separated jobIds (`reembed-{org}-{kb}-{dims}`); treat "swallowed non-fatal enqueue" as a red-team default on any new queue
- Source: p41-agent-latency-rag-epic (fix `a547792`)

### QW-02 Worker class defined but never instantiated
- Signal: jobs stuck `waiting` forever; all unit tests green
- Cause: worker never added to `startWorkers()`; no test exercised the REAL `queue.add` → consumer path
- Countermove: grep for the constructor CALL, not the class; smoke the live producer→consumer hop before calling a queue feature done
- Source: p41-agent-latency-rag-epic (fix `9bb2204`)

### QW-03 Worker process has no --watch → stale code
- Signal: API hot-reloads a change, worker behavior unchanged; feature "silently dies" after an edit/merge
- Cause: MC runs the worker as `tsx src/worker.ts` (no watch); only the API runs under `tsx watch`
- Countermove: explicit worker restart after worker-path edits: `curl -XPOST localhost:7777/api/action -d '{"id":"cadra-worker","action":"restart"}'`
- Source: p39-channel-status-relay-worker-host

### QW-04 One worker exit path skips the completion callback → permanent strand
- Signal: conversation gated forever (`active_ai_execution_id` never clears); job shows completed
- Cause: pause branch (`ask_user` → `isPaused:true`) early-returned WITHOUT firing the responder callback; success/on_error/failure paths all did fire it
- Countermove: enumerate EVERY worker exit path (success, error, failure, pause, cancel) and assert each fires the callback/terminal; add a watchdog sweeper (CAS-guarded) as defense-in-depth
- Source: msgapi-responder-ask-user-pause-strand (cadra-api `6dbd05e`)
- Generalizes: any "notify on completion" contract must be proven on ALL exit paths, not the happy one

### QW-05 New input fields silently dropped at the enqueue boundary
- Signal: feature works inline/fast-path, dead via the queue (or vice versa)
- Cause: new FastPathInput-style fields not threaded into `enqueueToQueue`'s payload
- Countermove: parity tests asserting inline vs queue payload field-by-field (`inline-runtime-parity.test.ts` pattern); every new field goes into the parity assertion
- Source: p42-s006-detached-inline-contract

### QW-06 afterCommit AWAITS — a slow downstream POST hangs the whole mutation
- Signal: web mutation hangs for an entire generation; timeouts under load
- Cause: core-sdk `with-actor.ts` `await cb()` on after-commit callbacks; the enqueue POST must reply in ms — any synchronous generation behind it blocks the caller
- Countermove: dispatch detached (`inlineDetached` contract), reply 201 immediately; timer-failover cancels use silent `'failover'` mode (publishes/persists nothing — the queue re-run owns the one terminal); never re-enqueue if runtime resolved despite the timer
- Source: p42-s006-detached-inline-contract

### QW-07 Delegated child loses parent linkage → runs inline → parent hangs to timeout
- Signal: team execution hangs ~20 min then delegation timeout; no subagent progress; child DB row stuck `queued`
- Cause: channel-originated delegation omitted `parentExecutionId` → fast-path child-skip gate doesn't skip → child runs inline in the API process → terminal never persisted, child events never forwarded
- Countermove: propagate `parent_execution_id` on every child-create path; buffer-replay on the delegation wait as mitigation; verify child rows reach terminal status in DB
- Source: p39-channel-delegation-inline-trap

### QW-08 Transport green ≠ execution healthy
- Signal: "bot didn't respond" while every pipeline log shows success
- Cause: inbound 200 + reply plumbing fine, but the agent/team execution itself timed out (delegation starvation, worker concurrency)
- Countermove: triage transport health (inbound count, reply ts) SEPARATELY from execution health (worker completion, delegation success); count delivered replies vs inbound before declaring anything
- Source: session 2026-06-27 slack-channel-live-bringup (6 inbound → 2 delivered)

### QW-09 Live delayed jobs are neither completed nor failed — terminal cleanup misses them
- Signal: a rescheduled job also fires at the OLD time; duplicate side-effects hours/days later
- Cause: BullMQ delayed jobs pass neither `isCompleted()` nor `isFailed()` — terminal-cleanup patterns (getJob→isFailed/isCompleted→remove) skip them; a new jobId per reschedule strands the old LIVE job
- Countermove: reschedule = remove the live delayed job by id FIRST, then add; plus a worker-side stale-revision no-op guard (stale jobs die silently BY DESIGN, log at debug)
- Source: `_context/_wargames/p34-social-publishing/calibration.md` F9

### QW-10 Queue default job options silently inject retries
- Signal: an exactly-once side-effect (vendor publish, payment) fires twice under failure; IG double-container
- Cause: queueManager-level `defaultJobOptions` (attempts/backoff) apply to every job on the queue — CAS/idempotency designs assume one attempt
- Countermove: publish-shaped jobs set `attempts: 1` explicitly at enqueue; the service layer owns retries
- Source: `_context/_wargames/p34-social-publishing/calibration.md` F11
