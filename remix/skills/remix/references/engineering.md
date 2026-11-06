# Engineering rules (builders only)

Back to [SKILL.md](../SKILL.md). For sessions that change remix code, Cadra rows or prompts; a lab user's session
does not need this file. Every rule keeps its source quote and date.

## Where remix lives and how a run is planned (`../remix-agent/SKILL.md` P1, P3)

**remix lives in yobo only (Sean 2026-11-05).**

Sean: "move everything to Yobo out of slides, put it directly in Yobo." Every remix runs in yobo on the one yobo record;
the slides remix pipeline is switched off (never a second path), then the Ad Studio remix editor and the Ad Library move
into yobo. New remix work goes into yobo; never add remix behaviour to slides. Design: `REVIEW.md` §13.29.

**build every video from a template (Sean 2026-11-05, architect gate-20261105-22).**

Sean: "Templates give us a step-by-step way to build a video. We just have to build from a template."
Every way in (library template, the agent's script, a source ad) first becomes a TEMPLATE: each scene's job (hook,
product hero, proof, CTA), timing, roles, product scenes, reusable clips. The template is the plan on the one yobo run
record, versioned per edit; every step reads and writes it, and no step keeps its own copy. Then one pipeline builds
from it. Another merchant's offers, prices, brand and product names in a stored template become placeholders on load.
Design: `REVIEW.md` §13.28.
Music: `../remix-agent/references/join-and-sound.md` § Music.

**a source ad is optional; the storyboard is the contract (Sean 2026-11-05).**

Sean: "I don't think we need an existing ad. We can create them from scratch as long as we can come up with a script
and then a storyboard can be generated. Remember, the key is we get to a storyboard, and the storyboard has all the
elements to generate the video."

- A remix starts from a source ad OR from a script (the agent's agreed concept). With a script, the script IS the
  brief: scenes, seconds, what each shows, lines, cast roles, product scenes. Then the same storyboard → review →
  approval → video pipeline runs.
- Never answer "make this idea" by offering unrelated ads. A source ad, when used, is a quality benchmark (`../remix-agent/SKILL.md` P2).
- Design: `REVIEW.md` §13.27 (remix_start script source; architect gate pending).

## Shipping and proving

- **"On prod" is checked by content, never by git ancestry.** Grep the changed line on `main`. A release can hold code
  out while its commits stay ancestors (2026-11-06: slides typed-product fix was "on main" by history, absent by content).
- **Tests use the real data shape.** A fixture with an invented field passes while prod reads a field that does not
  exist (2026-11-06: `storyboard.jobUuid` vs the real `storyboard.ref.jobUuid` made every set-check tap silent). Back
  every reader change with a free read-only replay of real runs (old view vs new view, 0 diffs).
- **Worker code never imports web-only modules** (`server-only`, `lib/cadra/client.ts`); use the `*.shared` variants.
  The import throws only in the worker and the step quietly falls back (2026-11-06: the post caption writer always fell
  back to the product name). The worker import-graph test guards it; the prod worker has no deploy workflow (hand
  deploy + grep inside the container).
- **Every chat line and button exists in en / id / es as data.** Missing copy rows fall back to English silently, and
  every job after needs must carry the chat's `reply_language`. The source-reading copy test checks every chat-line key.
- **Code ends the agent's turn; a "say nothing" instruction alone does not.** After a start the app posts one line with
  `closesTurn`; a duplicate send that posted nothing never closes a turn (msg-api, YMS-750).
- **Never hold a run-row lock while another connection writes a row that references it** (2026-11-06 deadlock: FOR
  UPDATE on `remix_runs` + a second-connection `remix_asks` insert).

- **Before porting a held-out chain to main, look for its owner's port** (`git branch -r | grep <ticket>`, the lane's
  session file). Refresh that port (new branch, merge main) instead of building a second one.
- **When main deliberately held out a sibling feature, a port merge keeps only your ticket's half.** Trace each
  conflicting line to its commit (`git log -S`); lines from another ticket stay out and its owner is named.
- **"Port-only" failures from a loaded full-suite run are re-run alone on both trees** (port and main) before
  anyone calls them regressions; a slow graph-walking test needs a raised timeout.

- **A limit needs a `LIMITS.md` row** (caps, timeouts, retries); a limit that fires logs on the job.
- **Never remove what another ad type needs.** Diff against the last version before shipping a fix for one type.
- **Proofs and proof replays never post into a chat a person is using** (a dev chat may be someone's phone; 2026-11-05: test replays landed in Sean's live dev chat 3 min
  after his real tap and read as his remix dying). Replays and injected taps go to a test conversation or test number.
  With no test line, mark every posted text "[TEST]" and tell whoever watches that chat first. One driver per chat:
  when the person is live, builders watch and do not tap.
- **Dev passing is not prod passing.** Cadra prompts/skills/tools are per-env rows; diff dev vs prod before a promote.
  A proof is a real end-to-end run (link to delivered video) per ad type, not free steps on a synthetic inbound.
- **Team alerts stay in their own env** (YMS-738, 2026-11-05: a dev alert in the prod channel linked to prod → "remix
  not found"). Links use the server's own host (`NEXT_PUBLIC_APP_URL`, else `NEXTAUTH_URL`), never a hard-coded prod
  fallback; the env label comes from `NEXT_PUBLIC_ENVIRONMENT`, never `NODE_ENV` (it is `production` on the dev
  worker); dev reads only `YOBO_REMIX_ALERTS_DEV_CHANNEL_ID`. Never join a dev bot into a prod channel or put a prod
  channel id in a dev proof to make it pass.

## Who decides, budget, pricing (`../remix-agent/SKILL.md` P4)

- **The remix lead decides; never ask Sean for sign-off on video work** (Sean 2026-11-05: "Stop asking me about
  sign-off on these video ads. You have a budget, use the budget, do this autonomously." and "No paid" for vendors).
  Architecture calls go to the agents lead's gate, template approval is the lead's QC check (frames, product right and
  real size, no other brand, no garbled faces/text), spend stays inside the day's budget. No paid third-party vendor
  (music libraries etc.) without Sean naming one. Ask Sean only for what the CLAUDE.md money/customer/delete rules name.
- **No paid render without a cleared budget** (pictures, draft clips, finals all bill the platform key, dev too).
  When Sean has given a budget for the day, the ledger owner (the remix lead) clears each run inside it and logs it in
  the day's paid-budget ledger; never ask Sean again per run (Sean 2026-11-05: "I already gave a budget today so no
  need to ask me if the budget is still there"). No budget given → ask Sean for that run. Prove with unit tests and
  free pages first; name the cost (scenes x seconds x model) before an end-to-end run. Every subagent brief says "no
  paid renders" unless the lead cleared that run.
- **Pricing is parked.** Never add or change a price or credit UX. The free first remix is the MQL waiver; every paid
  quote or start must name the remix so the waiver applies.
- **Agents make, self-check, show and wait.** A failed self-check is fixed or asked about, never a stop (`../remix-agent/SKILL.md` P6, `../remix-agent/references/whatsapp-journey.md` § Problem solver).

## Pictures sent to people are compressed (Sean 2026-11-06)

Sean: "we are not sending large files, right? We're going to compress them, of course, as our standard". Every picture a merchant's phone or browser loads (review page, WhatsApp album, gallery, back office) is a compressed rendition: WebP quality 82, 720 px wide (Sean: "WebP is the smallest and fastest"; measured 5 271 KB PNG → 82 KB). The raw model output (2k PNG) stays only as the source for models and the final export. Harm if not: 5-6 MB PNGs stall in the WhatsApp in-app browser and show blank tiles (prod remix a524de0a, 2026-11-06).

## A lab change is ported the same day (Sean 2026-11-06)

Sean: "every time Remix Lab is updated with skills, it should be ported, it should be moved into Cadra". A Remix Lab change (process step, prompt, rule, setting) is not done until the same change is on the prod path: Cadra skill / function rows (dev, then prod through the agents gate) or yobo / slides code. If it cannot move the same day, it gets a row in the lab→prod parity list (`yobo-merchant/_specs/p148-remix-in-yobo/lab-prod-parity-20261106.md` in the KB) with an owner. Cite the lab version and the prod row or commit together. Rules port one-to-one; lab controls do not (Sean 2026-11-06: "make sure that the skills are actually one-to-one
because … the controls and pages UI of Remix Lab is different"): every lab control maps to a named prod control
(WhatsApp button id, Ad Studio route, agent tool) or is a parity-gap row; a lab-click step is rewritten as that prod
control, never copied. Harm if not: the lab makes good videos while merchants on WhatsApp get the old process (prod run 8d05707d: a different person in every scene because the cast step never got the lab's identity cards).

## Web chat runs the same remix (Sean 2026-11-06)

Sean: "a pure Yobo web chat experience … which will need to work with WhatsApp". Only merchants who use WhatsApp get
it. `/chat` Main Chat already runs on the merchant's WhatsApp conversation (yobo `webchat/ingress/route.ts`), so the
responder is the same Yobo agent: no responder swap, no second agent. A run started or driven from the web is
`surface='web'`: step turns go to the web only (msg-api `webOnly`). WhatsApp then gets ONE line + [Continue in Yobo]
per step only while the merchant is off the web, one status line if they write there mid-run, and the final video.
Harm if not: every step lands twice, once in each place.

## Offers the merchant types (Sean 2026-11-06)

A typed offer is saved to the merchant's Yobo offers as INACTIVE (`isActive:false`, name de-duplicated): it is on the
account, never redeemable until the merchant turns it on. Find-first reads active, in-date offers first. Harm if not:
an ad line becomes a live discount nobody approved.

## Template gallery (Sean 2026-11-06)

Merchant gallery = 3 cards per row on phone, auto-fill grid on desktop (Sean: cards "too big"). Each card may carry
the Ad Library proof (days the source ran) and one recommender "Why:" line; the gallery shows templates only, never
raw Ad Library ads.

## Entry link, gate, handoff and sample ads (verified 2026-11-06)

- **Entry link call:** `POST /api/public/whatsapp-links/<code>/resolve?entry=remix` (yobo). The body must be JSON
  `{"referrer": null | string}` (strict zod; `{}` answers 400 `INVALID_CODE`). A curl user agent counts as a bot and
  answers 503 by design (`isBotRequest` in the route); send a browser UA. The route rate-limits after about 4 calls.
- **The r2 entry gate** needs all of: link market `us` or `id`, a non-Kahi target, and an ARMED
  `chat_onboarding_connections` row for the inbound connection. `system_config` `chat.remix.entry_links` is only a
  legacy fallback (`src/extensions/chat-identity/remix-entry.ts` in yobo).
- **No agent text is needed to move the chain.** The remix tools return `handoffContext` (`remix-handoff.ts`):
  `complete_onboarding`, then `recommend_templates`, then `remix_get view=recommended`.
- **Stale docs:** the r1 photo-collector release notes were retired by migration 0602; do not follow them.
- **Sample ads auto-start from the DNA reply.** When the agent's DNA reply ends with `[[continue_onboarding_ads]]`,
  msg-api (`src/services/onboarding-ads.ts`, `onboarding-ads-continue.ts`) injects the copy row
  `chat.onboarding_ads.continue_turn` as a system inbound. There is no env switch. When dev and prod differ in this
  step, diff the onboarding root skill text between the two, not env.
- **Default remix owner on prod is slides** unless a `system_config` row `ads_gen.remix_owner_at_start` (or the
  `.org.<id>` variant) exists; prod has no global row. The value is bare text (`config_value` is TEXT: write
  `yobo`, not `"yobo"`).
