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
- **No `as never` on a ledger, state or wait-reason value.** The cast hides a value the DB CHECK refuses (2026-11-06:
  wait_reason 'staff_retry' violated remix_run_steps_wait_ck; tsc passed, the staff retry threw on dev). Use the
  real union type (`satisfies RemixWaitReason`), and run a real-PG test on any new path that writes a row with a CHECK constraint.
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
  An agent ships as a WHOLE VERSION, never piecemeal (Sean 2026-11-01 + 2026-11-06: "we're deploying the entire version
  from dev to prod. That's how we do deployments of agents"). A release (p144) pins one version of every tool, skill,
  role lock, harness and delegate (`agent_version_pins`). Change dev 443 first, prove it, then promote that release to
  prod 362 as one new prod release. The one-step tool `cadra agent promote` (p151) is SPEC ONLY, not built
  (agents-lead 2026-11-06); until it exists, dev-proven objects are copied to prod one by one under the agents-lead
  gate, with a full release diff before and after proving no prod-only item was overwritten. Never hand-edit a prod tool/skill/prompt row. Before any promote, dry-run BOTH ways: anything prod
  has that dev lacks (a fix made live on prod only) would be OVERWRITTEN by the promote, so port it to dev, prove it,
  then promote (Sean 2026-11-06: "if anything changes … because it's live, but it was not done on dev, then will we be
  overwriting"). Same as code: main never carries what develop lacks. Comparing dev vs prod = diff the two pinned releases
  in full (harness, skills, tools, KBs, model, guardrails, channel profile) plus the yobo copy rows and switches they
  read. A difference you did not diff is not "model variance" (dev 443 vs prod 362 sample-ads gap, 2026-11-06).
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
it. **A web remix runs in a SIDE CHAT, never in Main Chat** (Sean 2026-11-06: "the idea of doing a remix inside of a
Yobo web chat it's to use a side chat not the main chat because the main chat is a mirror of the WhatsApp chat the
point of using side chat is to do very specific tasks"). Main Chat (`/chat`) mirrors the merchant's WhatsApp
conversation (yobo `webchat/ingress/route.ts`); a Side Chat (`ChatSessionKind.SIDE`, p143) is one task. Harm if not:
the remix's steps, buttons and progress lines flood the merchant's WhatsApp thread. Web proofs and web entry points
(an "Open side chat" card, a remix deep link) open or create a side chat for the run. The responder is the same Yobo
agent: no second agent with its own remix rules. A run started or driven from the web is
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

## Default open: warn, don't refuse (Sean 2026-11-06)

Sean: "server refuses to do something is something we see everywhere, and so I'd rather keep them open and then we'll
add the rules as we see needed". A business rule (template not delivered yet, rights not set, QA said ask, tags
missing) is a WARNING the user sees, never a server refusal or a hidden button. Refuse only for: security and tenant
isolation (staff auth, another org's data), money spent without a press, and what is technically impossible (no
breakdown, no source copy). Add a hard gate only after a real problem happened, and name that problem in the code
comment. Harm if not: work stops on rules nobody needed (staff could not approve a template; dev remix path off).

## Prove in Yobo web chat first (Sean 2026-11-06)

Sean: "a major thing that we should've done first was to make sure that our Yobo web chat could do this and create a
remix first before WhatsApp". Every remix change is proven end to end in a dev Yobo web SIDE CHAT first, driven in
the session's own browser tab (start → storyboards → parts → join → final). Web chat and WhatsApp share one run engine,
so engine bugs show up there without a phone. Then the WhatsApp proof on a real handset, then prod.

## Ship the called side first (2026-11-06)

When a release adds a NEW caller → route pair across repos (msg-api calls a new yobo route), the ROUTE ships to prod
first, the caller second. "msg-api first" is right only when msg-api is the side being called. A fail-open caller
hides a wrong order: prod conv 2612 got sample ads at 06:34Z because msg-api went live 06:29Z and called a yobo route
that only arrived ~06:39Z (404 → fail open → old behaviour). The release-request names the order.

## Recovering a merchant's failed remix: the agent carries on (Sean 2026-11-06)

Sean: "We should have just acted like the YOBO agent figured it out and is now working on it and then the normal
remix begins" · "I wanted a natural agent response, not a takeover response" · "This is why I wanted you to do this".
When a live merchant's remix fails on our side (e.g. a login-walled Instagram reel), the lead session fixes it ITSELF
at once, before the team has to take the chat over:
1. Get the input another way (here: the reel's mp4 through a logged-in browser session's media API), into the org's Files.
2. ONE agent turn on the merchant's real session with a system note: start the remix from the file, and tell the
   merchant in one natural line that you have it and are working on it. No mention of private links, fetching, the
   team or an operator.
3. The normal remix journey follows (breakdown, asks, storyboards, video), posted by the app.
Facts from the 2026-11-06 recovery (investor org 4115):
- **Restricted Instagram reel:** both Apify scrapers (post, reel) return `restricted_page`, and analyze fails
  `file_unavailable`. Check once, then get the mp4 another way (a logged-in session's IG media API
  `/api/v1/media/<pk>/info/` → `video_versions[0].url`, downloaded server-side) → `publishOrgFile` → `remix_start
  {fileUuid}`; or the agent asks for another link or the file.
- **A server-side `remix_start` needs a LIVE chat.** msg-api maps an execution to a chat only while that run is live
  (yobo `src/server/services/video/remix/chat.ts:4`). An ended or made-up execution id leaves the analyze job with
  no `conversation_uuid`, so every line is lost (a "sent" notify that never arrives). Stamp the chat right after the
  start (`recoverRemixChat`) and check `ad_video_jobs.conversation_uuid` on the analyze job; later jobs read the chat
  from it (`remixChatOf`).
- msg-api has no system-note → agent-turn route; the app path (breakdown first) is the working start.
- **Never emulate the merchant's taps** (Sean 2026-11-06: "don't emulate the taps"). A recovery moves the run
  server-side (the same code path a tap calls, run as the system), never as a fake inbound from the merchant's
  number. Where only a merchant press can move it, the merchant presses.
Never a human takeover reply for a pipeline failure. Harm if not: the merchant sees silence, then a person
apologising, instead of a product that works.

## The yobo start switch waits for the yobo-path bundle (2026-11-06)

`ads_gen.remix_owner_at_start = yobo` is ON for dev (global) and, since 2026-11-06 13:13Z, ON for prod too (global row,
system_config 23867; yobo main 0037ded3f carried the bundle). The rule stays for any future rollback or new env:
**do NOT copy it by switch parity** until these yobo-path fixes are on prod main, checked by content:
analyze start after a native source read (build-49, the 'reading' stall), part record at part start (7b505f735),
retry consumes its ask without re-billing parts (115607fe4 + d51b44674 + c89791249), join startKey
`<pressRunId>:main`. Harm if not: every new prod remix waits at 'reading' forever, or re-bills parts, or never
joins. This is the one named exception to switch parity, and it ends when the bundle ships.

## Ready ads (approved templates): stock and quality (Sean 2026-11-06)

Sean: "I need to make sure we're always having ready to go ads on Dev and prod." Then, the same day: "We'll start by
providing 1 or 2 universal templates for free. This will be either the 'egg drop' template or one other TBD."
- A merchant's FIRST remix is offered 1-2 UNIVERSAL templates, free (no credits). A universal template fits every
  category and every product: its hook is kept as the ad's own clip, and only the product scenes are remade.
- The universal shape (Sean 2026-11-06, the egg drop: "Reused beginning clip, then montage"): the ad's own opening clip
  is kept as is (a suspense hook with no product in it), then a montage of the merchant's product, held on the music's
  beats. Because the hook has no product and the montage is all product, it fits any category, so the same-type swap
  rule does not apply to a universal template.
- Every remix video is kept (Sean 2026-11-06: "You need to have every video I make with remix in context stored
  somewhere"). The source ad, every paid output and the final are stored the moment each exists, not only on Save.
  They are listed in one index in context. A source that was only on someone's laptop is lost (the egg-drop original,
  kedai-egg-reel-v6.mp4).
- Every remix after the first is offered per-category ready ads (Sean: "3 per category is after the first one"). Every
  category keeps at least 3 approved templates on dev and on prod. A daily check logs `remix_template_stock_low`, and
  the back-office Overview shows a count per category (YMS-778).
- A business with no fit record for a template is offered that template only when it is in the business's own
  category. A known misfit is never offered ("only suggest a template the product fits", same product type).
- A category with 0 templates gets one plain line plus [Send me a video] and [Paste a link], never a dead end. It is
  never offered other categories' templates (cross-type swaps are banned).
- A ready ad is at most 30 s of source and shows one product as itself, with no captions, prices or logos burned in.
  The reason is "spend the fewest paid seconds": every merchant remix of a long template pays for its remade seconds
  (a 78 s ad cost about 70 paid seconds per remix). Staff fill gaps with free reads only. A link that would need the
  paid fetcher (Apify) is skipped; a direct public .mp4 is fine.
- **Scheduled remix work (stock check, sweeps) runs as a worker scheduler job, never a `vercel.json` cron.** Vercel
  crons never fire on yobo dev (custom env `dev`), so a cron-driven job is silently dead there (2026-11-06).
- **The house picker lists only library items with a stored video copy** (dev had 3). An empty picker is a missing
  copy, not a switch. Every accepted SOCIAL link can fall back to the paid Apify fetch tool (`ads_gen.video_fetch_tools`
  is set on dev and prod); a direct https .mp4 has no Apify path, so use it for free fills.

## A reel we cannot download: plain steps, no login (Sean 2026-11-06)

Sean: "be clear to the user about what a public and private video is. They're not gonna know the difference."
Then he decided "no login": the server never signs in to Instagram to fetch a reel. Many failed reels are not private.
Instagram hides them from downloaders that are not logged in (yt-dlp "empty media response"). The chat line never
says "private" or "public". It gives the steps: save the reel on the phone (⋯ → Save, or screen-record it) and send
the file here, with [Send the video here] and [Pick a ready ad]. It never claims a second try that did not run.

## A proof number must be fresh (2026-11-06)

Before a dev proof sends from a fictional or test number, check that the number has no open remix, conversation or
org binding (msg-api contact → conversations; yobo remix_runs for that org). A reused number answers someone else's
open ask: a "1" meant for a menu proof started a paid storyboard batch on another dev org's remix. Use a new number,
or close the old conversation first.


## Paid starts on yobo-native runs: keys, go, parts, retries (2026-11-06)
The first yobo run past storyboard approval hit six gaps in a row. Each rule below holds for every yobo-owned run.
- **A paid start key is exactly `runId:target`** (`jobs.ts` `checkRemixStartKey`). Never add a suffix to a paid key.
  A [Try again] into a paid phase consumes its ask as a NEW press (`press-port` `consumeFullKeyPress`) and restarts
  under that press's plain key. The join body keys `<press>:main`; the run's own record key stays `<press>:join:main`.
- **Every paid go carries `approvalId`**: the ask the press consumed (`db-ports` `pressAskIdOf`). This is the same for
  parts and the join, whether the press is a system auto_join or a [Try again].
- **A part start writes its `project.parts` entry** (`video-view` `partRecord`, slides `makeRemixVideos` upsert).
  Without it `applyPart` drops every landed video: `made` stays empty, the join never starts, and a retry bills done
  parts again.
- **Prove a new paid start path with every pure check before the first paid run**: key, then input, then go, then quote
  (`paid-start-contract.test.ts` `startChecks`). The worker log drops the 400 message (`part:invalid_request`). To read
  it for free, rebuild the body in the dev worker with a tsx script in `/tmp` (never `/app`) and remove it as root.
- **There is no staff resume out of `needs_help` yet.** A second 400 on the same step is a system stop. To resume by
  hand, use the legal edge `needs_help → waiting_merchant` (it needs `waitReason` and `pausedFrom`). Then re-post the
  refusal ask through `postFrontRefusal` with the repeat check off. Back up the run state first.
- **Product photos have one rule**: `spend.ts` `productPhotoUrls` (the product's own images, else research photos with
  a `usable` verdict) feeds the video catalog, storyboard assets and chat-photo. A storyboard sheet with no photo asks
  in chat: ONE `photo` ask naming the item, with the sheet target on its item. A chat photo then binds to that ask
  (`sheet-photo-bind.ts`), consumes it as the `retry:sheet` press, and wakes the run.

## Switches a remix prod release must carry (2026-11-06)

Check each one on prod by name before calling a remix release done (switch parity):
- yobo `SLIDES_API_URL` + `SLIDES_API_KEY` (slides PROD key): the one Ad Library adapter reads slides with them.
  Missing → every staff read fails "That ad could not be read." (log `remix_adlib_read_failed …unset`).
- yobo `REMIX_HOUSE_ORG_ID` = the prod YoboLabs org (211 on prod; 1 on dev). Prod org 1 is a merchant.
- `ads_gen.remix_owner_at_start`: global `yobo` on dev and prod (prod since 2026-11-06). The bundle check above applies
  before setting it on any env. The owner is read uncached at each remix_start, and a run keeps the owner it started with.


## Storyboard plan rules and proof traps (2026-11-06, m-remix-build-54)

**Storyboard plan (HOW-REMIX-WORKS §A r7, Sean 22:3x / 22:4x):**
- A product shot's storyboard is its keyframe sheet from ONE ticked moment up (`KEYFRAME_SHEET_MIN_MOMENTS = 1`, yobo
  `stages/storyboards/references.ts`, slides `remix-storyboards.ts`). People ads keep one label-free picture per shot,
  with a master per camera setup.
- One image per UNIQUE shot. analyze.py marks `repeat_of` when jumping from a shot's first frame to an earlier shot's
  first frame would not be a hard cut. analyze-output maps it to `shot.repeatOf`. `storyboardTargets` skips the repeat,
  and `applyStoryboard` copies the original's picture onto it (`storyboard.copiedFrom`, free). Runs analyzed before
  this change have no `repeatOf`.
- The model-input sheet carries no text. keysheet.py draws labels only on `labels: true`, and nobody passes it. The lab
  grid has been label-free since v9.15 (YMS-777).
- A script run (no measured shots) never checks the plan against shots or source audio. Its scene windows are its own
  `seconds` laid end to end (plan-pass.ts `spanOf`). First-at-0 and gap/overlap checks still apply.
- R10 stands: one scene's failed picture never stops the whole set. New completeness rules are PLAN checks, run
  before anything is paid.

**Proof rigs and env traps:**
- An injected chat photo or video from a fictional number cannot work. msg-api downloads inbound media only from the
  gateway's own origin (`gateway-client.ts` resolveGatewayUrl). Media proofs need a real handset.
- Vault `msg_api.dev.*` points at the PROD msg-api DB. Read dev with `docker exec msg-api-dev-api` (its own env, host
  5.223.63.43). Prod is `msg-api-prod-api` on 5.223.55.178. Prove which DB you read by looking for a known message id.
- During a worker swap the name `worker-service` can point at a stopped container. Exec into whichever
  `worker-service*` is running (`docker ps`).
- A free proof of plan logic: run a tsx script in the dev worker that calls the real function (`decidePlan`,
  `defaultPlanPorts().read`) on the stored run. Put the script in `/tmp`, never `/app`, and remove it as root.
- Lab publish: send the HTML into a sean-jetdevs cmux tab as base64 chunks (about 90 KB per eval), then call tRPC
  `prototypes.update` and verify with curl + cmp. Keep the undo copy first, and copy the new vNNN over remix-lab.html.
- The secret-guard hook flags regexes like `.*?` and SQL aliases like `v.key` in heredocs. Write those scripts with the
  Write tool and run them by path.
