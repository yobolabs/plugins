# Multi-brand owners — one brief per brand

An owner can hold several brands (orgs) behind one WhatsApp number. The morning brief is judged
**per brand**, not per person.

## Rule A — which brands get a brief

- **One brief per brand turned ON.**
- **Default ON = the main brand**: `users.current_org_id` among the brands that route to that
  owner's phone; if none, the newest owned brand.
- A brand with a `notified` / `viewed` / `delivered` / `expired` run for the **same task in the last
  7 days stays ON** (so a brand that has been getting briefs does not silently stop).
- An explicit `agent_task_subscriptions` row **wins** over both defaults, on or off.
- Judged **per destination owner** (`pickLadderOwner`, `brand-family.ts`).

## Brand set

Parent family + every active org the owner(s) own (`org_members` role owner, **not**
`is_system_role`) + children. The caller only ever sees `manageableBrands`, never the full set.

## Where it lives (yobo)

| Concern | File |
|---|---|
| Family + ladder owner | `src/server/services/agent-tasks/brand-family.ts` |
| Queries | `src/server/services/agent-tasks/brand-family.repository.ts` |
| ON/OFF resolution, subscription writes | `src/server/services/agent-tasks/brand-subscriptions.ts` |
| Settings router (list / set) | settings router `agent-tasks.ts` |
| UI "Your brands" | `brief-card.tsx` |
| Agent tools | `src/server/tools/daily-brief-subscription.ts` |

## Agent tools

`set_daily_brief_subscription {enabled, brand?, taskKey?}` and `get_daily_brief_subscriptions {}`,
called via `POST /api/v1/internal/tools` with header `X-Chat-Customer-Ref: {ctx.customerRef}`.

Cadra dev tool ids: org 36 -> 648 / 649 (agent 443); org 4 -> 650 / 651 (agent 445).

**Onboarding:** these two are allowed during onboarding through a **separate self-service list** in
`onboarding-clamp.ts`. The onboarding tool list is capped at **7**, so do not add them there —
otherwise the call returns `403 onboarding_out_of_belt`.

## CTA + tap

- CTA payload is `brief:<orgId>:<runId>` (`deliver.ts`).
- msg-api's brief-tap handler **pins the org** when the sender is a member of it.
- Template `{{1}}` = the **brand name**.

## Traps

- msg-api **intercepts a message that names another brand** with a "Tap to switch" reply *before*
  the agent sees it — a brand-name test never reaches the agent.
- Dev `send_mode` must be `live` or the brief is mocked (see SKILL.md "Sent is not delivered").

## Digest v2 — ONE CTA = the focus brand (p131 v2, 2026-10-07)

Replaces the merged digest. A person with several brands' briefs gets **one** CTA, for the
**focus** brand; the other briefs are held `notified` under the digest.

- **Focus pick** (`digest.ts` `chooseFocusRun`, ~line 85): msg-api
  `POST /api/v1/platform-notify/acting-org` (read-only; candidates = the digest run orgs) ->
  the chat's `conversations.target_org_id` -> most recent -> main-brand pick.
- **Tap** -> that brand's own brief + a **pointer line** naming the other brands whose brief is
  ready and unread (max 3). Copy: `agent_task.digest_copy.{en,id}.pointer` / `pointerMore`
  (migration 0428).
- **"brief X"** -> p129 brand switch -> X's own brief.
- **Switch:** `system_config` `agent_task.digest` ON in prod since 2026-10-07 12:37 (row 445).
