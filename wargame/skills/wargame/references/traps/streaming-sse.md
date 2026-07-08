# Traps — Streaming, SSE, Event Pipelines

### SSE-01 SDK stream() connects internally — calling connect() again doubles connections
- Signal: duplicate events, double renders, two live SSE connections per chat
- Cause: `agents.stream()` calls `execute()` then `controller.connect()` internally; consumer code calling connect() again opens a second stream
- Countermove: consumers never call connect() after stream(); check the controller contract before wiring
- Source: MEMORY.md cadra-sdk streaming

### SSE-02 Events fire before the subscriber connects
- Signal: fast executions show nothing / miss their terminal; slow ones fine
- Cause: pub/sub is fire-and-forget; the run publishes before the SSE/relay subscriber attaches
- Countermove: buffer + replay on attach (P25 event buffer, `readBufferedTerminalEvent`); any new consumer of `execution:{id}*` must replay the buffer first
- Source: p39-channel-delegation-inline-trap, cadra P25
- Generalizes: every subscribe-after-start consumer needs replay, not just live tail

### SSE-03 Child→parent event forwarding drops event types
- Signal: specialist/team-member narration or text never reaches the parent surface
- Cause: forwarding whitelist dropped `text_delta` (STORY-013 `300a58e`); each forwarded type is an explicit decision
- Countermove: dedicated forwarded+buffered event types (e.g. `narration` with its own buffer key); when a child event class goes missing, diff the forward whitelist first
- Source: slack-chat-narration-persistent-ux-decision

### SSE-04 SSE formatter drops the envelope; named events never hit onmessage
- Signal: browser client gets events with missing fields, or nothing at all while the wire shows traffic
- Cause: `formatSSE` emitted `data: ${JSON.stringify(event.data)}` only (drops top-level type/orgId/uuid); a named `event:` line means `onmessage` never fires (needs addEventListener)
- Countermove: unnamed events + full envelope in data for onmessage consumers; contract-test the exact wire format
- Source: session 2026-07-05 crossorg-cs-inbox-phase-b

### SSE-05 Producer/consumer envelope mismatch: nested vs top-level fields
- Signal: empty chat bubble on completion; data present in Redis capture
- Cause: inline path published output at `result.output` while the SDK reads top-level `data.output`
- Countermove: one envelope contract asserted by parity/golden tests across every producer path (queue, inline, forwarded)
- Source: p41-agent-latency-rag-epic (fix `056db7a`)

### SSE-06 One semantic event emitted in N forms, deduped in M places
- Signal: same sentence appears twice (once as narration, once as answer) — or disappears on one surface when fixed on another
- Cause: `isFinalAnswer` flag, per-surface delivery conditionals, and 3 independent dedup implementations (SDK solidify / relay held-final / callback strip) each re-derive "show once"
- Countermove: producer decides role ONCE (EventRole pattern); flush a held final only on a genuine continuation event (subsequent narration/tool_call), drop at terminal; cross-surface golden conformance harness
- Source: p39-channel-final-answer-narration-double-post (cadra-api `956a776`), narration-lump session

### SSE-07 Heuristic gates false-positive on real data (code×data bug)
- Signal: works local, breaks on dev with EMPTY code diff on the path
- Cause: narration gate regex (`schemaKeys ≥2` with no sentence-punctuation guard) rejects KB-grounded prose containing `snake_case:` tokens — only triggered where RAG data exists
- Countermove: "local worked / dev broke + empty diff" = suspect code×data; golden fixtures must include data-shaped inputs (schema-token prose), not just clean happy-path text
- Source: session 2026-07-02 narration-lump-rootcause

### SSE-08 Transient errors classified as rate-limit → long frozen backoff
- Signal: status line frozen INCLUDING its counter for up to 60s, then recovers
- Cause: classifier treated any `fetch failed|timeout|ECONNRESET` as throttle → exponential connection-wide backoff on one blip
- Countermove: throttle ONLY on a real 429 (honor Retry-After); cap backoff (8s); transient → no backoff. Discriminator: counter ticking = starvation; counter frozen = backoff
- Source: p39-channel-vercel-slack-resilience (`682e6a2`)

### SSE-09 Diagnostic logs gated on NODE_ENV — absence proves nothing on prod boxes
- Signal: `[Redis Forward]`/`[Redis PubSub] Published` missing on the dev box → looks like forwarding is broken
- Cause: those logs only emit when `NODE_ENV==='development'`; the dev box runs `production`
- Countermove: know which logs are env-gated before treating absence as evidence; probe the pipe directly (Redis psubscribe capture) instead
- Source: p39-channel-vercel-slack-resilience

### SSE-10 The definitive producer probe: live Redis capture
- Signal: (technique, not failure) — can't tell producer bug from delivery bug
- Cause: N surfaces re-process the same stream; UI evidence conflates layers
- Countermove: `psubscribe execution:*` on the box's Redis, trigger ONE run, count event frames by type — splits producer vs delivery deterministically; pair with DB row checks (where did the row land, which org)
- Source: narration-lump session, typed-entity-cards session
