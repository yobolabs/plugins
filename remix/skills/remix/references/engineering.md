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
- **A posted remix ask is stored as `items: [postedAskItem]`.** The caller's items sit at `items[0].items`. Read them through `askItemsOf` (`advance/approve-all.ts`) and build test asks with the real `postedAskItem`, never flat fixtures. A flat fixture passes while [Approve all] approves nothing.
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

- **A model swap checks input modalities first.** Stages that read the source video (the video blueprint, the teardown agent) need a model with video input. A text-or-image model fails them: a function returns `FUNCTION_CONFIG_INVALID`, an agent asks the user for keyframes. Swap text and image stages separately from video stages.
- **LIMITS row before the release request.** Every timer or count a release request names gets its `_context/LIMITS.md` row written and pushed first. The captain checks each one against the file.
- **A stored reading is reused only when its analysis version is the current one.** Otherwise measure again.
- **Testing uses a merchant-only tester with a goal.** The tester plays the merchant and reports what it sees. It never reads code, run tables or internals.
- **Local first on the lead-owned remix loop; dev is the integration test.** Every release-request carries a `local:` proof line. Simple fixes go to the lead's sub-agents; structural changes go to the builder. The only dev Cadra org is Yobo. Never use a copy org.
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

## A delivery row never proves a video was or was not sent (2026-11-09)

- The delivery row's repost payload holds text and buttons only. Media are never re-posted, so the row cannot show a video. The expected-parts and parts counts count message-api messages, not videos. Never conclude "no video in the send" from that row.
- Truth for a QA ask: the prod worker log line `remix_qa_hold {jobUuid, status, videoShown, videoLost}`, read with `docker logs --since/--until` on the worker-service container. Delivery runs in worker-service, not Vercel. Evidence: a prod join showed `videoShown: true` while its delivery row showed one part.
- message-api drops videos on any non-WhatsApp lane, or on a connection without the `video` capability, and reports it in `videosDropped`. Every yobo send that carries videos reads that field.

## Advance loop and failure reading

- **A pass that made progress is never a stall outcome.** Any advance step that changed state returns a non-stall outcome. A refused `needs_help` move sets a retry wake, or nothing wakes the run.
- **"AI provider returned an error" is a label, not a cause.** It is the default text for any image-run throw. Read the job row's `result.error.message` first, then the Cadra `ai_function_runs` row or the Vercel log. A fast failure (seconds) points to our input or ffmpeg; a slow one points to the provider.
- **ffmpeg JPEG frame grabs need `-pix_fmt yuvj420p -strict unofficial`.** Without them, mjpeg refuses limited-range (tv-range) input frames.
- **Worker container logs reset on every redeploy.** Read or save a run's log lines before the next deploy lands, or wake the run for a fresh decision line. A deploy that drains a remix job can drop that run's wake; see the yobo runbook's Worker section.
- **Vercel runtime logs keep no history.** To see a web-path error, run the real code in the dev worker container: write a script under `/tmp`, run `npx tsx --tsconfig /app/tsconfig.json <script>`, import from `/app/src/...`, and write inside a transaction that throws at the end so it rolls back.
- **Review to storyboards is a paid run-machine move.** It needs a merchant press, so a wake never takes it. A redraw from review starts in place and the phase stays `review`. A refused move is never silent: it logs and sets a retry wake (`REVIEW_RETRY_MS` row in `_context/LIMITS.md`).
- **Every phase move outside a job landing wakes its run.** The generation bump and the enqueue happen together, with the enqueue after commit. A move that returns "started" with no job leaves the run idle forever.
- **A deploy can kill a pass mid-way,** leaving the run marked processed with its starts never made. The due sweep must also pick runs idle in a work phase longer than `REMIX_STALL_GUARD_MS` (`_context/LIMITS.md` row).
- **A wake set by hand is cleared after its pass.** A past wake keeps the run due on every sweep and re-runs its owed starts.
- **An approval-only press calls `approve_item` without `askId`.** With an `askId`, `approve_item` takes the paid edge (review to parts) on the last approval (`approve-item-command.ts`). Approving the storyboards is the go for the videos (P0): the cost shows on that approval message. `approve-go.ts` is the loop's step for it.
- **Every chat send goes through the delivery record** (`sendRemixDelivery`). A send that bypasses it is invisible to the retry and give-up path: a send accepted and then failed is never retried. The advance loop sends through `advance/loop-send.ts`.
- **An open merchant grant skips the wait for "set already passed".** Otherwise [Try again] after the album writes a grant nobody reads, and the chat reports a redraw that is not running.

## Staff actions on dev

- Retry and cancel a step from the back office in a staff profile: tRPC `remixMonitor.staffRetryStep` and `staffCancel`. A merchant profile gets 403.
- Dev credits: tRPC `credits.grantCredits` (admin).
- New AI function variables must land in the function version before any caller sends them, and prod function creation goes through an admin session (`prompt.create`). See cadra `ai-functions.md` § Templates and variables.

## Taps on yobo-owned runs

- **Yobo answers run before the slides read.** `tap.ts` reads the remix from slides (`remix_get`) before most branches, and slides answers `not_found` for native yobo runs. Every yobo-owned answer runs before that read.
- **An unknown yobo tap goes to the advance loop** as a press on the open ask that posted the button (`events/yobo-press.ts`). The loop needs a handler for every button an ask posts, on both routes: the tap route and the action-token route.
- **Tests cover yobo-owned taps with `remix_get` answering `not_found`.** A happy slides mock hides this class of failure.

## Source copies and signed links

- **Remix source copies are private.** Anonymous reads are denied on the bucket, so a bare `remix-sources` URL fails. Hand out only a signed GET (`signRemixInput`, `_context/LIMITS.md` row).
- **A signed GET handed to a queued provider must outlive the queue.** Inputs for providers use the two-hour signature from `signRemixInput`. The SDK default of 900 s can expire while a job waits.
- **Signing never depends on one public-base env var.** A worker without that var signs nothing, and the GET fails under the private bucket. The signer matches every own-bucket URL shape by its key, and every unsigned fetch logs. Set the worker env in the host env file, not in code.

## Who decides, budget, pricing (`../remix-agent/SKILL.md` P4)

- **The remix lead decides; never ask Sean for sign-off on video work** (Sean 2026-11-05: "Stop asking me about
  sign-off on these video ads. You have a budget, use the budget, do this autonomously." and "No paid" for vendors).
  Architecture calls go to the agents lead's gate, template approval is the lead's QC check (frames, product right and
  real size, no other brand, no garbled faces/text), spend stays inside the day's budget. No paid third-party vendor
  (music libraries etc.) without Sean naming one. Ask Sean only for what the CLAUDE.md money/customer/delete rules name.
- **No paid render without a cleared budget** (pictures, draft clips, finals all bill the platform key, dev too).
  When Sean has given a budget for the day, the ledger owner (the remix lead) clears each run inside it and logs it in
  the day's paid-budget ledger; never ask Sean again per run (Sean 2026-11-05: "I already gave a budget today so no
  need to ask me if the budget is still there"). A small paid DEV proof inside the standing dev budget runs without an ask; name the cost (pictures/seconds) in the proof line; prod spend, customer sends and above-budget still ask. Prove with unit tests and
  free pages first; name the cost (scenes x seconds x model) before an end-to-end run. Every subagent brief says "no
  paid renders" unless the lead cleared that run.
- **Photo-bind proofs show handling under the msg-api tap timeout on a slow store.** A rig that copies an object already stored nearby hides real fetch latency; prove the real fetch path.
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
- A merchant's FIRST remix is offered 1-2 UNIVERSAL templates, free (no credits), for EVERY business, not only MQLs
  (Sean 2026-11-06: "every business"). One free universal remix per org; an MQL org never gets two free remixes. A universal template fits every
  category and every product: its hook is kept as the ad's own clip, and only the product scenes are remade.
- The universal template recipe (Sean 2026-11-06: "Reuse the first clip of the egg rolling (or other suspense clip),
  then use merchant products to generate stills, then generate a montage. Then generate 2 short clips. Use same
  audio. That's the template"):
  1. Keep the ad's first clip as is: the suspense hook (egg rolling, or another suspense clip) with no product in it.
  2. Make stills (pictures) from the merchant's products.
  3. Cut those stills into a montage, held on the music's beats in the source's own slots.
  4. Make 2 short video clips of the merchant's product (Seedance; the 4 s minimum is trimmed to the slot in the join).
  5. Lay the ad's own audio once over the whole video.
  The hook has no product and everything after it is the merchant's, so it fits any category; the same-type swap rule
  does not apply to a universal template. Source: Sean's egg drop, yobo prod S3
  `remix-lab/211/sean-egg-drop-indomie-20261106/source.mp4`.
  A universal candidate MUST have a reusable product-free opening plus a montage. An ad that starts and ends on the
  product, is not a montage and has no reusable scene is never universal (Sean 2026-11-07, on the sky-drop ad:
  "this video starts and ends showing the product. It's not a montage, and it doesn't have reusable scenes").
- A universal template's remade parts NEVER use the swap prompts (lead-6 2026-11-07, YMS-780 U5). The swap prompts
  ("Recreate @Video1 exactly… the only change: the product" / "Replace the product in image 1… keep everything else")
  keep the source's food, packs and actions and put the merchant's product into them: a polo in a noodle bowl. For a
  universal row, @Video1 and image 1 give camera move, framing, timing and light only; the video shot is a plain hero
  (the product rests on a plain surface, the camera follows @Video1's move, the product stays still, label to camera;
  no hand, it breaks big products), and a still is a product photo in image 1's framing with its subject removed (the
  product's own printed label stays). Code: `clip-request.ts` `universalVideoPrompt` / `universalStillPrompt`, chosen
  by `remix_templates.universal`; normal templates keep the swap prompts. Check a new universal on its first paid run
  with a product from a DIFFERENT category than the source (the hard case).
- Making a universal template: houseRead the source on the house org (back office "Make template from an ad", Cadra
  tokens only) → setRights own_ad + decide approve (staff tRPC) → SQL `universal=true` and `org_id` NULL on the
  template AND its parts (a direct .mp4 read writes the house org, so merchants cannot see it). The read's own plan
  can already be right (egg drop: keep 0–2.47, 4 stills, one 4 s video); check it before hand-editing `plan.parts`.
  On prod, keep it hidden (house org, universal=false) until one paid dev video is checked.
- Template SOURCES and rights (lead-6 2026-11-07). The target is 3 approved templates per category per env; a universal
  template does not count toward the 3. Ad Library items carry rightsClass `third_party_reference` and keep today's
  rules. A brand-WEBSITE product video (a store's own CDN clip) is also `third_party_reference`, but ONLY as a
  `whole_ad` plan: every part is remade, no brand footage is ever kept in a merchant's ad. Copy every source to our S3
  first (never keep a brand or social CDN link) and write the original URL in the notes/undo file. Drop a source with
  printed health or product claims (claims must never come back in a merchant's ad), several products, or a talking
  head as its core. A source longer than 30 s is read from our own ≤30 s cut by link (houseRead has no time window).
  There is no prod→dev template copy: read the same S3 file on each env's house org.
- Every remix video is kept (Sean 2026-11-06: "You need to have every video I make with remix in context stored
  somewhere"). The source ad, every paid output and the final are stored the moment each exists, not only on Save.
  They are listed in one index in context. A source that was only on someone's laptop is lost (the egg-drop original,
  kedai-egg-reel-v6.mp4).
- Sizes start at the cheapest (Sean 2026-11-06: "These montage/slide-style videos are super cheap for us to make, so
  we'll offer more of these at the 'small' or 'tiny' size. Still need to come up with a naming convention"). A
  montage / slide-style template (stills held on beats, little or no paid video) is the smallest size band, and the
  ready-ad stock favours them. Size names: XS / S / M / L (Sean 2026-11-07); montage / slide-style = XS. Credits per
  size are interim config rows (`ads_gen.remix_rate_card.credits_per_size`), set now and recalibrated on measured cost.
  Design: KB `slides/_specs/p131-remix-in-ad-studio/arch-review-20261103/SIZING.md`.
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

- **Finding ready-ad sources for free (2026-11-07, YMS-778).** A store's own product videos sit on its homepage or
  collection page as CDN `.mp4` links (grep the page HTML for `.mp4`, unescape `\/`); check each with `ffprobe`
  (duration) and an 8-frame strip (`ffmpeg -nostdin ... fps=8/duration,scale=-2:150,tile=8x1`), then keep or drop with
  a one-line reason. Beauty, health and gadget stores carry them; pet, candle, toy, stationery, cleaning, detailing and
  salon stores mostly do not, so services and "other" need another source. The slides Ad Library watchlist ingest is a
  PAID Apify run (slides `content-library/services/apify-crawl.ts`): never start it to fill stock without an OK. Ad
  Library stored copies (`content_assets.s3_key`) live in the yobo content-library bucket, not the slides env buckets;
  the house read path reads them. Shell traps in such loops: pass `-nostdin` (ffmpeg eats a `while read` loop's
  input), never name a zsh variable `path` (it is `PATH`), and split a zsh list with `${=VAR}`.
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

## Start and end picture per clip, same-picture repeats (2026-11-07, m-remix-build-56)

- **`toFrame` is exclusive.** A shot's last frame is `toFrame - 1`. Using `toFrame` as the last frame draws the next shot's first frame on every end picture, and the last shot asks for a frame that does not exist. Use one helper, `shotWindow(shot, fps)`, for every window; clamp frame grabs to the copy's last frame.

Storyboard rules (what a set holds, clip requests): `../../remix-agent/references/storyboard.md`.
Rulings by the remix lead; yobo `stages/video/part-edges.ts`, `part-starts.ts`, `advance/edge-scenes.ts`.
- **One continuous shot → Seedance 2.0 i2v**: `image_url` = the clip's start picture, `end_image_url` = its end
  picture, nothing else (cast and product are drawn into the pictures). The prompt writer gets the two pictures as
  "first frame … start exactly on it" / "last frame … end exactly on it", never an empty reference list.
- **Several shots → ref2v**: ordered `image_urls` = start picture, the scenes' storyboards, end picture, then the
  sheets; the prompt says "@Image1 is the first frame, @ImageN the last frame". Never Kling; never mix the two modes.
- **0 extra pictures where one exists**: a storyboard drawn over a line drawing (it has `guide`) is its clip's start;
  a still shot's is also its end. A keyframe sheet is never an edge. Edge pictures are `<scene>@start|end` targets,
  drawn like setup shots (line drawing of THEIR frame: the shot's first-frame still, or its LAST frame cut from the
  stored source copy by the worker, `referenceKind: 'source_frame'`), with the scene's storyboard as look reference.
  They live on `scene.edges`, are reviewed, set-checked and approved as their own cards ("Start of video N" /
  "End of video N"; card titles never say "part").
- **Plan check `part_has_start_end`** before anything is paid: a moving clip on a run read from an ad whose stored
  copy is gone cannot get its end picture → one plain line. Runs made before G1 (no edges) render as before + log.
- **A repeated shot is the SAME PICTURE, not "no hard cut"**: compare the two first frames at 64x64 colour, mean
  difference < 8 AND grey layout correlation >= 0.92 (`scripts/remix/analyze.py` same_picture). The cut detector's
  bar marked 17 different shots as repeats on 3 dev ads (dark products on one set; one presenter in different
  hoodies measured 14 / 0.85). Prove a repeat change free: re-analyze stored dev sources + one A|B|A clip cut from
  them; look at the first frames by eye.
- **A client page must never import `advance/*.ts`** that pulls `node:crypto` (video-view.ts): the merchant page's
  bundle broke on develop. Shared pure helpers go in `stages/` (`groupsOf` lives in `stages/video/groups.ts`).
- **A phase move must run the next step in the same pass.** needs → brief returned without starting the brief, so the
  plan waited for the 5-min stall wake (dev cb6da8a8, 6 min of silence). Never rely on the stall guard to continue.
- **Proving a paid clip**: the job stores no provider body; rebuild it in the dev worker with `submitParameters`
  from the job's frozen `target` and the account row. Compare the video's first/last frames with the pictures by eye.
- **Proof rigs**: a `tsx` script in `/tmp` inside a worker cannot import bare packages — use
  `createRequire('/app/package.json')` + `import(req.resolve('<pkg>'))`; the mini has no `DATABASE_URL` (vitest needs a
  dummy one) and no numpy (run analyze.py measurements in the dev worker). A prod port of work stacked on an unshipped
  change: `git diff <its base>..<tip> | git apply -3` onto main, never a cherry-pick of the stack.

## Proving a port and finding a run's source (2026-11-06, m-remix-build-53)

- **A bundle that conflicts after a prod cut:** check whether the conflict is in the bundle's own commits or only in its
  old base. If only the base, cherry-pick just the bundle's commits onto current `origin/main` as a new branch (no
  "main" in the name); they usually apply clean.
- **Tier 1 on the shared mini:** `remix-tools` / `remix-tap` tests time out at 5 s under load, and which ones fail changes
  each run. Re-run the same files with `--testTimeout=60000` on BOTH base and port and diff failure identities.
  `pnpm exec tsc` on the mini needs `NODE_OPTIONS=--max-old-space-size=12288` or it aborts (SIGABRT).
- **Side-chat remix needs a yobo run row.** Binding, cards and taps all read `remix_runs.state.webChat`; a slides-owned
  start writes no row, so the side chat behaves like plain chat (no buttons) until the owner is yobo.
- **`remix_runs.source_breakdown_id` is never written (YMS-781).** A run cannot be joined to its stored original
  (`remix_source_copies`); match by org and date until it is fixed.

## Starting a remix from a ready-ad template (2026-11-07, m-remix-build-55)

- **A template card starts from the template, never from its link.** `remix_start {templateId}` makes a yobo run at
  fast/product_pick from OUR stored copy + stored plan: no `startDeconstruct`, no fetch, no Cadra reading (remix rule
  "template already read → no new reading"). A link start re-reads the ad per org (paid) and can fail on Instagram.
- **Templates come in two plan modes: `clip` and `whole_ad`.** Both must start natively. On 2026-11-07 prod had 8 whole_ad
  and 2 clip; a start that only took clip sent every whole_ad tap to a paid link reading. Every dev proof taps one
  template of EACH mode; a pass on one mode proves nothing about the other.
- **A link that IS an approved template is that template's start** (match on `remix_source_breakdowns.source_key`, canonical +
  legacy key; `remix_templates.source_key` is our S3 key, not the link). If that start cannot be made (no stored copy,
  plan unreadable, template gone) fall back to the link start and log why; never a dead end.
- **The run pins its template** (`state.templateId`, `templatePlanVersion`, `templatePlanMode`) and seeds `state.qaPlan` from
  the template's plan (whole_ad = the whole ad, from `length_ms`). A pinned run renders only that template; gone or
  changed → refuse, never fall back to another template or to the whole-ad swap (that bills more).
- **Run state a client can write is never a money input.** `remix.create` accepts free `state`: server-owned keys
  (templateId, templatePlanVersion, templatePlanMode, qaPlan) are dropped from client state, and every waiver is bound to
  the run's server-written source, never to a state key alone.
- **The merchant picks the product, never the agent.** On a card tap the agent sometimes passes a catalog product; drop it
  (keep it only if the merchant's own message names it) so the product ask is posted.
- **A repeat "Make a video ad" re-posts fresh cards.** The "cards already in chat" guard is for a re-run of the same ask, a
  system turn, or a card tap; a new ask gets the current set with a new picks version.
- **Copy never states a count it does not send** ("Here are 3 ads" with 2 cards). Fill `{n}` from the cards posted.

## Free first remix waivers (2026-11-07, m-remix-build-55)

- Order everywhere (quote, start, assemble, balance, no-video price): staff retry → MQL → universal, through ONE helper so
  quote and start agree. Quote = no lock, no write; start = locks held until the job row commits.
- Lock order is org, then phone, on EVERY path. One free first remix per business: a used universal blocks a later MQL
  one and vice versa; "earlier remix charged" means net (debits − refunds) plus unsettled holds.
- A cap like "one per org" is a limit: it gets a `LIMITS.md` row and a fire log.

## Real provider cost per remix part (2026-11-07, SIZING.md section 4.1)

A finished Higgsfield video status answer from Cadra carries the provider-rate cost as an OBJECT at
`data.cadra_provider_cost` (`HiggsfieldJobCost`, USD in `.costUsd`, null when Cadra could not price it; also
`metadata.providerCost`). yobo records it only when the answer reaches the finaliser: `pollVideoRequest` returns the
parsed answer (`providerAnswer`), the worker passes it to `finaliseVideoJob`, and `remixJobCostColumns(row, answer)`
writes `cost_usd` and `cost_source='provider_rate'`. A clipping run sums the parts priced in that pass; a resumed run
stays `unknown` (never an under-count). Before this, no writer passed the answer, so prod remix rows had no cost.
Join, storyboard-picture and AI-function jobs still have no cost source (YMS-784). Prove it with the next natural
`remix_part` row (`cost_source = provider_rate`, non-zero), never a paid start. Size bands are XS/S/M/L; band edges,
credits per size, redo factor and margin are rate-card config rows (blank = `not_set`).

## Worker and build traps (2026-11-07, m-remix-build-55)

- **Never queue a one-off boot job on a shared BullMQ queue.** During a deploy the draining old container takes it and
  runs OLD code (posters never filled on dev and prod). Run start-up work in the worker's own process (not awaited,
  idempotent writes, log the result every run).
- **A module a client component imports must not reach server wiring.** `gallery-query.ts` → `ready-ads.ts` →
  recommend-wiring → storage-compat → sharp broke the web build (`node:child_process`). Put shared pure helpers in an
  import-free module.
- **Drizzle skips a migration whose `when` is ≤ the last applied one.** Take the number and `when` from the release
  captain before pushing; renumber when another migration lands first.
- **A prod port of a bundle onto a main that holds work out** cherry-picks only the bundle commits and checks file by
  file that no held develop commit rides along (`git log <main>..origin/develop -- <file>` minus the bundle).

## Card taps, open runs and cancels (2026-11-07, m-remix-build-58)
- A "Use ad N" tap on the "ads like yours" cards is handled by CODE, never an agent turn. The button id carries its
  target (`pick:N:t:<templateId>`; `pick:N:l:<libraryId>` stays agent-bound). msg-api forwards it like needs:/go: with
  NO org field; yobo takes the org ONLY from its own `remix_action_tokens` row written when it posted that card (posting
  org + chat + exact id), consumes it once, decides with local reads inside `remix_pick_tap_safe_ms` (3.5 s, below
  msg-api's 5 s tap timeout), then starts after answering. Not handled (old `pick:N` card, library card, late, spent
  card whose start died) → the agent path, never silence. Before this, every tap re-sent the whole card list: a tap is
  a NEW agent turn that no longer holds the list, so it re-read (and re-posted) it.
- Never send msg-api's own `connection.orgId` to yobo as an org: msg-api numbers orgs differently (cross-tenant start).
- A finished run (exported, posted, failed, cancelled) is never the chat's current remix: a run found only through the
  chat's old jobs is checked for phase, and `statusOf` reports no buttons on a finished run even with stale asks.
- One open run per chat: a new ready-ad start cancels the chat's older UNPAID fast runs at `product_pick` (never
  fast_video or later) and closes their asks. Any cancel (staff or supersede, fast or full machine) closes the run's
  open asks in the same tx. Staff Cancel on a fast run must use the fast machine (the full machine refuses fast phases).
- `plan.dropped` spans are CUT OUT of the output video (plan.ts §21), so a product inside a dropped span does not fail
  a template's QC; only kept (`keep`) parts must be free of the old product.
- Port onto a held-out `main`: develop has work main lacks (yobo `insertRun` ask-close, msg-api origin-web spec blocks).
  Re-run the port's tests on main; a conflict hunk can drag develop-only tests in — drop them, never the fix.

## Web side chat in a hidden tab

- A remix web side chat makes no history read while its tab is hidden, including the first read on open. A hidden test tab shows no run cards and looks like a render bug. Before reading it, force the tab visible and wait about 15 s. Verify cards against the msg-api rows before calling a render gap.
- The side chat renders only cards. Plain status lines are not in the re-read.

## Storyboard gate

- **The storyboard-first gate reads the same part groups as the planner.** Template runs store `plan.groups = []`. A gate that reads only the stored plan refuses every part as `unknown_part`. Read groups through the planner's helper (`groupsOf`: stored groups, else built from scenes).

- Every paid video part passes the storyboard gate before it starts. Each remade scene needs an approved storyboard of that exact picture and a passed AI set review.
- The one exception is a fast swap the merchant chose (the just-swap-product tap, which carries the needs-swap ask). The run's mode never grants it.
- A ready-ad or card template start goes through the full storyboard path, behind its feature switch.
- A set check that cannot start never counts as a pass.
- Lead check before any template or card data or rule change: confirm the universal, free-first template still reaches new merchants.

## Web side chat: sends, media and new surfaces

- A web side chat run sends nothing to WhatsApp: no final video, no timed nudge.
- A new chat surface must be checked for media, plain status lines and inbound files. Earlier surfaces lost media (conversation notify dropped image and video parts), lost plain lines (the side chat showed only card rows) and had no photo upload.

## Higgsfield busy answers

- A busy answer is retryable: account queue full, admission control unavailable, or a concurrent-request limit. These carry no redo credit and no self-score exists.
- Failed, timed-out and NSFW jobs are refunded.
- The Higgsfield tool in a session may be a personal free account, not the team account. Check which one before relying on credits.

## Tool messages are not merchant copy

- A tool's message is written for the agent. Never render it in a merchant UI; map errors to that UI's own merchant copy.

## Proof and tooling traps for builders

- Compare typecheck counts by the same method on both sides: a stale linked core-sdk adds about 20 TS2307 (`@jetdevs/core/errors`) that are not defects. Diff the error lists (file + message, no line numbers). A silent exit 134 or 144 means killed (OOM or load), not zero errors: rerun with `NODE_OPTIONS=--max-old-space-size=10240`.
- A typed-yes or needs-test run needs core pinned: `node scripts/vercel-prebuild.mjs` and `git update-index --skip-worktree package.json pnpm-lock.yaml`; revert both after. Run local vitest with `--pool=threads --maxWorkers=2` when the Mac is loaded.
- The cmux Agent Chrome test browser does not play remote mp4 (a control clip fails). A "video won't play" report is unproven until checked in a browser that plays H.264 (the cmux WebKit tab does).
- The Homebrew aws CLI is broken on the Mac (`_cffi_backend`). Use `@aws-sdk/client-s3` through `createRequire('<yobo-repo>/package.json')` under `secret-run`.
- `secret-run ENVF=file:<path>` puts the whole file into `$ENVF`; it does not export the variables. Parse the file in the child process.
- Payment tools (`remix_payment_options`, `remix_checkout`) work only inside a live WhatsApp turn. A direct call cannot prove them. Never put them in a cut without that proof.
- Dev test credits are unlimited through the dev-only `ads_gen.credits_unlimited` switch (dev seed script). Never set it on prod.
- Local loop: saving a tsx-watch worker file restarts it and kills in-flight renders (BullMQ marks them completed). Check that no run is in `rendering` or `queued` before saving.
- Local loop: `next dev` under memory pressure gets SIGKILLed by the system guardian. Use a built `next start` with the rebuild script.
- Local loop: Cadra image URLs must be https on a public host (cadra-api `stored-url.ts`, cadra-web `attachments-s3.ts`). yobo's download refuses http.
- Local loop: when the tester's browser is flaky, drive the run with headless Chrome and a curl next-auth cookie jar. Never print a credential file.

## Merchant lines follow the agent contract (R11)

- Every merchant message reports finished work or carries the live button that moves the work on. Never send the merchant elsewhere, never "tell me to …", never a second confirm after a choice, never ask for a tap that already happened, never an internal word ("assembly", "pipeline"). Money is solved in place: [Add credits] on that message; the run resumes by itself when credits land.
- A stale button: when the live ask is the newest message, reply with one line ("Your question is just above."). When newer messages sit below, re-post the live ask with its buttons.
- Enforced in code: `ask-has-buttons.test.ts` (no buttonless ask unless allow-listed with a reason) and `copy-lint.test.ts` (banned phrases in fallbacks and copy rows). Any merchant-line change passes the G12 gate.

## A new prod path is proven end to end before the first fix

- Trace every hop to the final row on real data before the first prod release: read-only SQL, a script run inside the worker container, pure functions run locally on a real snapshot. Batch every fix found that way into one release. One bug per release costs one release per bug.

## Repro inside the prod worker

- The worker container has no curl. Fetch the file on the host, `docker cp` it in, and run as root: `docker exec -u 0 worker-service /opt/remix/bin/python scripts/remix/analyze.py <file> --json <out>`.
- During a worker deploy two containers run (`worker-service-new` and the draining `worker-service`). Grep both logs.
