# Yobo MCP recipes

## Contents

- [Read anything](#read-anything)
- [Create a segment (new only)](#create-a-segment-new-only)
- [Draft a campaign](#draft-a-campaign)
- [Edit a campaign (DRAFT or PAUSED)](#edit-a-campaign-draft-or-paused)
- [Edit Business DNA](#edit-business-dna)
- [Invite a team member](#invite-a-team-member)
- [Launch a campaign (messages real customers)](#launch-a-campaign-messages-real-customers)
- [Ad creatives (costs money)](#ad-creatives-costs-money)
- [Submit an ad campaign (paused on Meta)](#submit-an-ad-campaign-paused-on-meta)
- [Not possible here (tell the user to use the Yobo app)](#not-possible-here-tell-the-user-to-use-the-yobo-app)

Tool calls in order. `O` = the `org_id` from `list_orgs` (omit when the user has one org). Show every
`view_url` as an "Open in Yobo" link.

## Read anything

1. `list {org_id: O, entity: "<entity>", search?: "...", limit: 25}` → items + `cursor` for the next page.
2. `get {org_id: O, entity: "<entity>", id: "<id>"}` for the full record.
3. Unsure which filters exist? `schema {org_id: O, entity: "<entity>", operation: "list"}`.

Notes:
- `ad_creative` list **requires** `filters: {ad_campaign_id: "<uuid>"}` (from `list ad_campaign`); there is no `get ad_creative` — the list item already carries the full copy, `reviewFlags` and `needs_review`.
- `ad`, `campaign_type`, `role` are list-only. `business_profile` is get-only with `id: "current"`.
- `member` list: `filters: {status: ["invited"]}` finds pending invites. `member` get takes the user id.
- `dashboard_summary {org_id: O}` for "how is my business doing".

## Create a segment (new only)

1. `schema {entity: "segment", operation: "create"}` → the `data` shape (STATIC vs SMART `filterRules`).
2. STATIC: collect customer ids with `list customer` (search by name/phone).
3. `create {entity: "segment", data: {name, type, customerIds | filterRules, ...}}`.
4. `get {entity: "segment", id: "<returned id>"}` → confirm the member count, show the link.

Existing segments cannot be changed from here (a workflow may already use them) — edit them in the app.

## Draft a campaign

1. `list {entity: "campaign_type"}` → pick `campaignTypeId` with the user.
2. `schema {entity: "campaign", operation: "create"}`.
3. `create {entity: "campaign", data: {name, campaignTypeId, startDate?, endDate?, ...}}` → lands **DRAFT**.
   `defaultOutletIds` optional (omit = no outlet restriction).
4. `get {entity: "campaign", id: "<uuid>"}` → show it with the link.

## Edit a campaign (DRAFT or PAUSED)

1. `get {entity: "campaign", id}` → check `status`.
2. ACTIVE → tell the user: pause first. With a yes: `pause_campaign {campaign_id}` → edit → relaunch (below).
3. `schema {entity: "campaign", operation: "update"}` → `update {entity: "campaign", id, data: {...}}`.
4. Result `changed: {field: {before, after}}`; a PAUSED campaign adds a note that the change applies after relaunch.
5. `stale_campaign` → someone edited it meanwhile: `get` again, re-apply, retry.

## Edit Business DNA

1. `get {entity: "business_profile", id: "current"}`.
2. `schema {entity: "business_profile", operation: "update"}`.
3. `update {entity: "business_profile", id: "current", data: {<only changed fields>}}` → `changed {before, after}`.
   Changing `name` also renames the organization — say so before calling.

## Invite a team member

1. `list {entity: "role"}` → only roles this user may grant are listed.
2. **Confirm with the user: the exact email and the role name.** Inviting sends an email.
3. `invite_member {org_id: O, email, role_id}` → `{email, role_id, member_id, status: "invited", email_sent}`.
4. Resend: `list {entity: "member", filters: {status: ["invited"]}}` → confirm with the user →
   `resend_invite {member_id}`.

Errors: `role_not_grantable` (pick another listed role), `seat_limit_reached`, `conflict` (already a
member), `daily_limit_reached`.

## Launch a campaign (messages real customers)

1. `list {entity: "campaign"}` → the `campaign_id` (uuid).
2. `launch_campaign {org_id: O, campaign_id}` → preview + `confirm` code; nothing changes.
3. Show **every** message in `preview.messages` (name, channel, segment + audience count, offer,
   content), `will_send_count`, `first_send_at`, and whether it `resumes` a paused campaign.
4. User says yes → `launch_campaign {org_id: O, campaign_id, confirm: "<code>"}`.
5. `confirm_required` again → the campaign changed or the code expired: show the new preview, ask again.
6. Same code twice → the first result with `replayed: true`; it did not launch twice.

Pause: `pause_campaign {campaign_id}` — no confirm, safe to repeat.

## Ad creatives (costs money)

Only for an ad campaign created in the Yobo ads builder, status draft or error.

1. `list {entity: "ad_campaign"}` → `ad_campaign_id`.
2. `plan_ad_creatives {ad_campaign_id}` → creative count, Meta object tree, estimated cost.
   Hooks come from the brief; to change them, edit the brief in the Yobo builder first.
3. `generate_ad_creatives {ad_campaign_id}` → preview: `creative_count`, `image_count`,
   `caption_call_count`, `estimated_cost_usd`, `run_cap_usd`, `org_remaining_today_usd` + code.
4. Show the cost and the org's remaining daily budget. User says yes →
   `generate_ad_creatives {ad_campaign_id, confirm: "<code>"}`. Creatives appear as the job runs.
5. `list {entity: "ad_creative", filters: {ad_campaign_id}}` → show headline, primary text, CTA,
   image link and any `reviewFlags` per creative.
6. For each creative the user approves: `select_ad_creative {creative_id, selected: true}`
   (reject: `selected: false`). A flag the user has checked and accepts: `clear_ad_creative_flag {creative_id}`.
7. One bad creative: `regenerate_ad_creative {ad_campaign_id, creative_id}` (paid, counts against the org limit).
8. `group_ad_creatives {ad_campaign_id}` → draft ads / ad sets. `precondition_failed` "out of sync"
   → the brief's hooks changed since generation: generate again.

`spend_limit_reached` → over the per-run cap or the org's daily cap: try tomorrow or trim the brief.
`generation_outcome_unconfirmed` (generate or regenerate) → open the builder link first; the creatives may already be there.

## Submit an ad campaign (paused on Meta)

Visible only when Back Office `mcp.ads_publish_enabled` is on.

1. `get_ad_review {ad_campaign_id}` → checklist, budget, ad-set tree. Fix blockers in the app.
2. `submit_ad_for_publish {ad_campaign_id}` → preview + code.
3. Show the review and say: it lands on Meta **paused, no spend**; starting it is done in the Yobo app.
4. User says yes → `submit_ad_for_publish {ad_campaign_id, confirm: "<code>"}`.
5. `stale_ad_campaign` → review again.

## Not possible here (tell the user to use the Yobo app)

Delete anything; start ad spend or change budgets; publish or edit offers; schedule sends; refund;
create or edit products and categories; change customer tags; edit existing segments; change
agent-task settings; create an ad campaign or edit its brief, audience or destination; retry one
failed ad set.
