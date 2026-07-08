# Traps — Channels, Slack, WhatsApp, Gateways

### CHM-01 channel_connection status ≠ active → host opens 0 sockets → bot silent
- Signal: boot log `boot reconnect complete active:0 opened:0`; bot dead after a restart though it worked before
- Cause: managed host only hosts `status='active'` rows; transient auth.test failure during process churn flips status to `pending`/`auth_test_failed`; a RUNNING host's in-memory socket keeps working — only a fresh host re-reads the DB (divergence bites later)
- Countermove: UI pause→unpause (re-fires activateConnection→slackSubscribe) or the headless activate script; NEVER SQL the status; stale `status_message` text after recovery is cosmetic
- Source: p39-channel-connection-stuck-pending-reactivate

### CHM-02 Bot handle ≠ display name; hop-0 goes first
- Signal: "can't invite the bot"/"bot doesn't exist"; bot silent in-channel
- Cause: display name "AriaDev" but handle `@cadra` — invite/mention key off the handle; channel bot only reacts to @mention (plain messages deliver nothing)
- Countermove: BEFORE suspecting the box: `auth.test` on the stored bot token (reveals real team/handle/bot_id) + grep host log for an inbound envelope — Slack delivering nothing ≠ box broken; `channel_connections` has no team_id column
- Source: p39-slack-bot-handle-cadra-vs-ariadev

### CHM-03 Same Slack app on two sockets → events split nondeterministically
- Signal: ~4/5 mentions show no progress / hit the "wrong" environment; "duplicate inbound event dropped" on the loser
- Cause: local host AND dev box both socket-subscribe the same app — Slack load-balances events across sockets
- Countermove: know every live socket for the app before judging behavior; synthetic POST to `/api/v1/internal/channel-message` forces local handling (bypasses the split)
- Source: p39-channel-status-relay-worker-host

### CHM-04 Synthetic smoke bypasses the hop that's actually broken
- Signal: synthetic test green, real traffic dead
- Cause: the synthetic POST enters downstream of the failing hop (e.g. bypasses the socket→forward hop with its missing env; hardcodes message_id the real gateway branch doesn't send)
- Countermove: map which hops the synthetic covers; after any synthetic pass, run ONE real end-to-end message before declaring victory; a stuck event won't re-deliver (host acks the envelope even when the forward drops) — send a FRESH message
- Source: p39-slack-forward-cadra-web-url-env, p4-wa-gateway-oauth-and-enrichment

### CHM-05 Gateway OAuth is form-encoded
- Signal: `401 unsupported_grant_type` with a valid client
- Cause: `/oauth/token` (go-oauth2) accepts `application/x-www-form-urlencoded` only; JSON body rejected
- Countermove: URLSearchParams client_credentials; token carries no waba claim — sender resolves via `oauth_clients.waba_id` binding
- Source: p4-wa-gateway-oauth-and-enrichment (fix `1bd46bd`)

### CHM-06 senderLabel is the registered LABEL, not the phone
- Signal: `/send/session 400 "sender … not found"` with the correct display phone
- Cause: gateway resolves senders by label (`META_DEFAULT`), not display number
- Countermove: discover via `GET /api/v1/whatsapp/senders?waba_id=<waba>`; set connection senderLabel to the label field
- Source: reference_msgapi_dev_deploy

### CHM-07 Enrichment deployed from a DELETED branch — redeploy regresses it
- Signal: after a routine gateway redeploy, msg-api ingress 400s (missing message_id) on real traffic
- Cause: the live binary was built from a feature branch since deleted from the remote; develop HEAD lacks the enrichment entirely
- Countermove: verify the deployed behavior is ON the deploy branch before any redeploy; merge the orphan first; the no-kb_id else-branch payload contract must be re-verified with a REAL message (synthetic hardcodes the fields)
- Source: p4-wa-gateway-oauth-and-enrichment
- Generalizes: "deployed" and "on the deploy branch" are separate facts — check both

### CHM-08 Vercel kills fire-and-forget work after the response
- Signal: final answer intermittently never posts; status line stuck at the end; clean on localhost
- Cause: `void deliverChannelResponse(...)` — Vercel freezes the function after the 200, killing the in-flight side effect
- Countermove: `await` (or `after()`/`waitUntil`) every side effect that must reach an external system from a Vercel route; post-answer-BEFORE-delete-status so a failed post can't leave an empty thread
- Source: p39-channel-vercel-slack-resilience (`603ee75d`)
- Generalizes: never bare-void an externally-visible side effect in serverless

### CHM-09 Slack mrkdwn ≠ markdown
- Signal: `**bold**` renders literal; `*x*` renders bold when italic intended; links broken
- Cause: mrkdwn: `*bold*`, `_italic_`, `<url|text>`; plain_text Block Kit headers drop inline formatting
- Countermove: convert through a formatter (links, emphasis, `&<>` escapes on literal text only, headers→bold mrkdwn section); no "typing" API — placeholder post + chat.update, both under chat:write
- Source: session 2026-06-27 slack-channel-live-bringup

### CHM-10 "Reply success:true" ≠ the user saw it
- Signal: logs report success; user reports silence
- Cause: success logged at postMessage; the reply may land threaded/elsewhere, or only a fraction of inbound got replies (delegation timeouts invisible in success logs)
- Countermove: verify the actual Slack ts + where it posted; count `channel.response.sent` vs inbound `execution_started` per test window
- Source: session 2026-06-27 slack-channel-live-bringup (6 in → 2 out)

### CHM-11 Gateway infra facts that surprise
- Signal: config edits "don't apply"; wrong DB assumed
- Cause: gateway DB is MySQL (`dev.qraved.internal:3307/whatsapp`), not Postgres; `client_webhooks` config is read PER-REQUEST (edits live instantly, no restart); USER_ACTION category dispatches BEFORE CHAT_BOT but dev row returns consumed:false (both fire)
- Countermove: trace via `whatsapp_webhook_logs` (inbound) + `whatsapp_webhook_send_logs` (dispatch payload/response_status) with MAX(id) baselines captured BEFORE the test
- Source: reference_whatsapp_gateway_config_trace

### CHM-12 responder_bindings.kind is the semantic driver, not the adapter — a mis-seed silences the AI
- Signal: after backfilling a `responder_bindings` row the live AI goes SILENT (no reply, conversation lands in inbox) though it answered off the config blob before; or the seed is rejected by `rb_kind_check`
- Cause: the table splits `kind` (semantic driver: agent|team|human, CHECK `rb_kind_check`) from `provider` (adapter selector, e.g. 'cadra'). `resolveResponder` returns null when the resolved binding's `view.kind==='human'` (or the row is disabled) → `shouldStartResponder` is STILL true (`responder_binding_id != null`) → "no responder resolved → land in inbox" → the AI stops. A war-game shorthand "provider/kind=cadra" mis-seeds: `rb_kind_check` forbids 'cadra' in `kind`; the adapter belongs in `provider`. `bindingToResponderRef` sets `ref.kind = provider`, so `provider` must equal the blob's kind for the registry `get(ref.kind)` to hit the same adapter.
- Countermove: seed `kind='agent'` (agent_uuid NOT NULL per `rb_target_check`) + `provider='cadra'` + `enabled=true` + `agent_uuid` == the connection's `config.responderRef.ref.agentUuid` EXACTLY; also set `conversations.responder_binding_id` (the console badge reads the join, never `responderRef`). Verify BY EFFECT: a fresh live inbound still gets an AI reply, same `responderSessionUuid`. A silent AI post-seed = wrong kind/provider/enabled/agent.
- Source: crossorg-cs-inbox-A-deploy war-game (impl `seed-responder-binding.ts`); cascade Chain-3 o3
- Generalizes: verify a domain-shorthand seed contract against the DB CHECK constraints before seeding; a binding table's `kind` is rarely the adapter name
