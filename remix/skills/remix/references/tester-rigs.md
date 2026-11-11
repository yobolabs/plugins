# Tester rigs: driving WhatsApp and the web chat without a phone

Read when a tester run must go through a WhatsApp turn or a web side chat from a machine, not from a phone.
Hosts, connection ids and secrets live in the inventory and the vault. Use the placeholders below.

## Dev WhatsApp inbound (no phone)

- POST `http://127.0.0.1:3100/api/v1/webhooks/gateway/<connection-uuid>` with the header `x-gateway-secret`. Run it INSIDE the msg-api container over ssh. The yobo script `scripts/remix/e2e/driver.mjs` (`inbound()`) does this.
- The dev test line's connection uuid and the tester's dev chat (msg-api conversation id) come from the inventory, not from this file.

## Test contacts

- A fresh test contact is any fictional digits used as `phone_number`. It gets its own conversation and auto onboarding.
- Onboarding needs about 12 min of answers before a business exists: name, topics, spend, Instagram handle, website. A phone with no business answers "Can you make me a video ad?" with onboarding, not with ready ads.

## Open remix swallows new input

- An open remix in the chat swallows a new link and "make me a video ad" (it replies "Your remix needs your OK on the draft video" with no agent execution). Test link routing on a phone whose remix is not open.

## Local WhatsApp (fake gateway)

- The fake gateway implements msg-api `gateway-client.ts`: `/oauth/token`, `/api/v1/whatsapp/send/{session,template,interactive}`, `/typing`, and answers `{provider_message_id}`.
- Inject a turn with `local-env exec msg-api --env <env> -- node <absolute-path-to-script>`. The secret comes from the env, and the script path must be absolute (the working directory is `msg-api`).
- With local Cadra off, the agent's remix tools call DEV yobo. Remixes then land in dev rows and the dev web chat. A WhatsApp turn does not exercise local yobo fixes: prove local yobo fixes in the local web side chat.

## Local web login

- Sign in by NextAuth credentials in the same tab: `GET /api/auth/csrf`, then `POST /api/auth/callback/credentials` with the form fields `csrfToken`, `email`, `password`, `redirect=false`, `json=true`.
- The "Continue with email" screen can hang on the auth service. Use the credentials call instead.

## Side chat timing

- The side chat polls only while its tab is in front. Bring the tab to the front before waiting on a reply.
- A draft or final video that fails with a provider HTTP 400 shows "This video isn't working out" with no progress line before it. Check the run record, not the chat.
