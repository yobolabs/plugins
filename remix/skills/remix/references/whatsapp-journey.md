# WhatsApp journey

Back to [SKILL.md](../SKILL.md). Read when adding, changing or debugging any chat step of a remix.

## Principle

Fixed actions are deterministic and bypass the agent. A button tap is routed by msg-api to yobo, which moves the remix
on itself (an idempotent advance of the run). The agent (one general chat agent) only handles free text and questions,
via typed remix tools (`remix_start/get/set/scene/make/approve/edit` + payment tools), never a free-form `call_tool`
for remix writes. Tool arguments: ids come only from a tool result or the merchant's message; `answers` is ONE JSON
string (an object whose keys contain ':' broke every "Use these").

### WhatsApp first (SKILL.md P3 + P6)

- Every step is a **button tap** in the chat (msg-api reply buttons -> yobo `tap.ts`), never the agent, never typing,
  never a required web page. A web link is an optional extra.
- **Every line remix posts itself speaks in the agent's Instinct persona** (Sean 2026-11-05: "we're supposed to use the
  instinct persona"; p126, Yobo KB `yobo-agent/_specs/p126-instinct-persona/skill/persona-rules.md`). Copy rows and code
  fallbacks are written in that voice and scored with the Jev voice scorer (precedent YMS-490). Never a machine line
  ("That button cannot do this now").
- Every failure is **ONE plain line** in the chat's language saying what happens next, with a button when there is a
  next step. Never silence, two lines, or a contradicting line.
- The agent handles free text and questions only, with typed remix tools. It never presses Approve, never states a
  price, never promises text/logos drawn by AI. Detail: `references/whatsapp-journey.md`.

### Words the merchant sees

- **Say "Remix", never "Remake"** (UI copy, routes, code names, docs).
- **Never call the source ad "your ad"** (Sean 2026-11-05: "why would it tell me a person isn't in my ad — Yobo built
  this ad"). The merchant's ad is the remix; the one being copied is "the original ad" (id "iklan aslinya", es "el
  anuncio original") in every line, copy row and prompt the merchant sees.

## Tap ids

| Prefix | Meaning | Examples |
|---|---|---|
| `needs:` | answer the questions step | `needs:use`, `needs:change`, `needs:ai` |
| `go:` | answer a recorded go ask (`make:<what>`) | `go:yes`, `go:change` |
| `make:<what>` | what a go starts: `storyboards`, `videos`, `join`, `final`, `cut` (approve + export), `export`, `redraw` of named scenes, `remake` of a named video | |
| `go:post…` | post the finished video (NOT a go ask) | `go:post`, `go:postlater`, `go:postinstagram`, `go:postfacebook`, `go:postthreads` |

A go binds to an open ask, never to a stray "yes". A tap with no handler falls to the agent: that is a bug.

**msg-api forwards only ids matching `^(needs|go):[a-z][a-z_]*(:[A-Za-z0-9_-]{16})?$`** (`msg-api`
`remix-tap-forwarder.ts` `REMIX_TAP_ID`, dev + prod since 2026-11): lowercase + `_` after the prefix, plus an optional
16-char action token. Any other id silently goes to the agent. A new id must also be added to yobo
`REMIX_TOKEN_ACTIONS` (`extensions/remix/events/action-tokens.ts`), or it goes out bare and a yobo-owned tap answers
"That button is old". (Corrected: this line used to say `[a-z]+` only.) It also forwards a WhatsApp photo with no tap id
(`nativeReplyId: null`, `photo: { attachmentUuid, mimeType }`, caption in `text`) — see *Needs list and chat photos*.

## Steps as buttons

link/ad pick -> "studying it" -> breakdown (one short message) -> needs list (one message, everything missing, own
catalog products by name, chat's language, at most one short question per message) -> [Make storyboards] -> "Storyboards
ready: N" (the pictures first, then the ask) + [Approve all] / [Change one] -> [Make the video] -> parts render and
JOIN BY THEMSELVES -> ONE joined video + [Looks good] / [Change a part] -> [Make the final] -> finals joined by
themselves -> [Approve it] -> "Your video is ready." + the MP4 -> [Post it] / [Not now] ->
"Posted: <link>". [Approve it] (`make:cut`) is ONE tap = approve the cut + start the export on that same go (the web
"Approve and export" button); there is no separate [Get the file] step. [Try again] (`make:export`) appears only when
the cut was approved but the export did not start.
**The merchant gets the assembled video, never the parts** (Sean 2026-11-05 ~21:5x: "Why is Yobo sending me the
separate clips? I expect the final assembled video."). When every part has landed, the join starts by itself: no parts
approval, no join ask, no web-only review step. The ad's own music is laid once, cuts on its beats. Part clips are shown
only after [Change a part] (one button per part). A web link is an optional extra under the video, never the only way on.
Failure of any step: ONE line + [Make it again] / [Try again]. A photo sent in chat binds to the product row it
answers; the matcher never swaps products.

## Needs list and chat photos (front)

- **No placeholders, ever.** Square-bracket placeholders (`[your product]`, `[your website]`) lost merchants at the
  needs list. Two layers stop them: the Cadra `remix_needs_writer` prompt forbids them (it once *instructed* them —
  check a function's own system prompt before blaming the model), and yobo `needs-message.ts` fills them from the
  org's data or strips the brackets in rows/questions and DROPS any suggestion that still holds one.
- **A found catalog product shows by its own name** (the row's pick label), never the writer's "your product".
- **At most one question WITHOUT a suggestion per message.** Suggested answers all show (the [Use these] tap saves
  exactly them, `needsSuggestionsById`); extra unsuggested questions are held (log `remix_needs_questions_held`,
  LIMITS row). Duplicate rows/questions are dropped.
- **Logo is optional, asked once** when the writer's logo row is missing or the org has no logo anywhere
  (`needs-facts.hasLogo`).
- **Chat language is stamped at the start, never looked up later.** msg-api `by-execution` maps a run to its chat only
  WHILE the run is live; a needs list lands minutes later and read null → English in non-English chats.
  `stampRemixChat` stamps `reply_language` on the analyze job with the chat; delivery, the tap and the needs writer
  (variable `language`) read that stamp. `ad_video_jobs.reply_language` defaults to `'en'` NOT NULL, so `'en'`
  cannot mean "unknown" — treat non-`'en'` as stamped.
- **Matcher: the best NAME wins, a photo only breaks ties** (`needs.ts` `nameScore` = shared tokens / union, short
  tokens kept). Preferring "any described candidate with a photo" swapped look-alike products. A generic product row
  (no name words) still takes a pictured catalog product.
- **A photo sent in chat** (no tap id) is forwarded by msg-api to `owner-inbound` like a tap. yobo `chat-photo.ts`
  decides the row from its own DB (msg-api waits 5 s): caption says logo → logo; missing product row or a
  photo-less catalog product → product; the logo the list asked for → logo; else the main product row; past the
  needs step or no list → `handled:false` (agent). After the response: resolve msg-api's stored key (the bytes are
  still `pending` at forward time → retry, LIMITS row), product → org File (`agent_artifacts`, channel `whatsapp`,
  idempotent on the attachment uuid) + slides `remix_set { needsPick: { rowId, assetId, from: 'whatsapp' } }`;
  logo → `saveMerchantLogoLink` (org `brand_assets`, stable public URL — the end card stores the URL in its
  snapshot, so a needs-row pick alone is not enough) + the logo row's pick. One line back, or one "send it again" line.

## Getting the ad in (front entry)

- **The app speaks after a start, the agent does not.** A started remix posts its next line itself (the breakdown,
  or one failure line), and that line can land before the agent's reply. The `remix_start` tool result tells the agent
  to end its turn with no text; any agent "I'm studying it" contradicts a failure line. Stop narration in the tool
  result, never only in the agent prompt.
- **A link that is not one video is refused before any job,** in one plain line asking for a post / reel link
  (profile and channel pages: `profileLinkOf`). A failed fetch never says "try again" without saying what to send.
- **Too long = use the part we can and say so.** The source is cut to its first (cap − 1) s and the breakdown line says
  how much was read (`trimmed` on the analyze result → `breakdown_trimmed`). Only an uncuttable source fails, with the
  too-long line, not the "couldn't open" line.
- **Ad Studio screen remixes do not chain.** `moveChatRemixForward` is chat-only; a step a screen remix must take
  without a click needs its own server trigger (the needs list: `screenNeedsOwed` on the analyze landing + every
  `getRemix`).
- **Writers get one retry on bad OUTPUT** (Cadra `OUTPUT_INVALID`), never on bad input; a second failure is the job's
  one failed-step line.
- Fetch detail (yt-dlp sections, byte caps, YouTube from a datacenter IP → Apify tool): `remix-context` search
  "higgsfield gotchas remix front entry".
- **A pick tap is checked against msg-api facts, not only the entry.** yobo `remix-entry.ts` accepts a tap only when
  the facts' `customerRun` names this run and generation and its source message is the tap. A refusal returns
  `selection_required` with a `reason` (`no_inbound`, `id_mismatch`, `facts_unavailable`, `run_mismatch`,
  `generation_mismatch`, `not_a_current_pick`) and logs `remix_selection_refused`. Read that reason before
  guessing. A turn that never records `customerRun` refuses every tap (the YMS-750 incident).
- **Re-showing cards already in chat sends nothing.** The same picks under the same idempotency key are a msg-api
  `duplicate`. The entry tool therefore does not re-post cards shown by an earlier run. It returns `alreadyInChat` and
  tells the agent to ask, in one line, for a tap on the cards above. A refused tap tells the agent the same and never
  to claim a start.

## Go-ask rules (back chain)

- **Who records the ask:** the delivery that shows the step records it, as that event's own run (`joined:<job>`,
  `failed:<job>`, `redo:<job>`, `exportfail:<msg>`), so the merchant's tap (run `tap:<msg>`) can answer it. Which ask
  a join records depends on the parts it joined: all final → `make:cut`, else `make:final` (yobo reads the part jobs'
  tier from its own DB).
- **One open go ask per chat session.** Recording a new one replaces the open one, so offer one next step at a time; a
  failure's retry wins over an optional redo.
- **A retry repeats the same tier:** a failed FINAL batch records `make:final`, never `make:videos` (that re-makes
  the drafts).
- **Reply buttons and an `[[open_app]]` link never share a message.** A message that needs the Review link keeps it;
  the redo offer goes in its own message with the button. No recorded ask → link instead of a button.
- **One press = one line.** A start the start route announces (videos, join) gets no line from the tap; a press
  that started nothing (`started: 0`) gets one plain failure line.
- **A refusal the merchant must hear is never HTTP 409.** The tap path reads a slides 409 as "this ask was already
  answered" and stays silent; refuse with 412 (or 400) and the tap posts its failure line.
- **A tap that posts nothing is never silent (R10).** Every tap outcome that leaves the chat without a new line
  (`not_blocked`, a ready re-send that did not go out) logs on the run (`remix_tap_posted_nothing`) and posts ONE plain
  line with the next button. A re-send through `remixApplied` must name its own post key (`resend`), or deliver
  refuses it for having no message key.
- **The last storyboard approved on the web asks the video go in chat** (`sb_approved_go` [Yes, go ahead][Not yet],
  once per storyboard set, key `<remixId>:sb_approved_go:<set>`). The web review page is the path the ready line's link
  offers; without this the merchant approves and hears nothing. An approval is never a go for paid work.
- **A stale or already-used button re-posts the live ask.** Under "That button is old" / "already used", post the
  remix's newest OPEN ask again with fresh tokens; nothing open: the line carries [Pick a ready ad]. "Open" = the
  remix's newest post with stored buttons (`remix_deliveries.payload_ref.repost`) with no tap on this remix after it
  (`remix_events`). Button tokens are NOT an answered signal: most taps never consume theirs.
- **No part ask while the auto-join runs.** A QA LOOK verdict on a part is info (logged on the run); when every part is
  made and the join starts by itself, post no [Approve / Make it again] ask and no QA words ("source cuts").
- **Several failed storyboards** redo on one ask (`make:redraw` + every failed scene). A failed video redoes one at a
  time (`make:remake` + that part); more than one failed video keeps a typed note.

## Problem solver: fix → ask → stop well (SKILL.md P6)

Sean 2026-11-05: "If the agent knows that, oh, okay, there's a problem, I found a problem … why don't they continue
and ask and then deal with it instead of erroring out? … This should be part of the core principles of the agent. It
should be a problem solver."

**Every check fixes or asks. No check ever stops a remix as its first answer.** This holds for every gate in the
pipeline (swap fit, product fit, drift, source length, QA, credits, needs) and for the agent's own turns:

1. **Fix it yourself, once.** Feed what the check found back as a correction and re-run that step ("keep the same
   people as the ad, add nobody"; "show it at 90 ml next to the hand"). Then run the check again.
2. **Still failing → ask ONE specific question with buttons** naming the problem and the choices
   ("The new plan adds a person. [Keep original people] [Allow new person]"). The answer carries the run on from
   the same step. The merchant never retypes what they already gave.
3. **Stop only when nothing is left to try**, and even then say why in one plain line with the next button.
   "I couldn't…" / "I'm looking into it" with no reason and no button is a bug.
4. **Log every fix and every ask on the run** (which check, what it found, what was tried), so a stall is never
   a mystery.
5. **Effort has an end (Sean 2026-11-05: "make sure that the agent will not go on indefinitely if the problem is
   unsolvable … it really made an effort … then at some point it won't be able to continue and … let the team know
   … in the meantime maybe try a different thing, maybe try a different video").** Per check: one self-fix, then one
   ask, and keep going while each attempt changes something. Stop on JUDGMENT, not a count (Sean 2026-11-05: "the
   signals for it's just not going to work appear … there must be some judgment"): the same refusal again with nothing
   changed, a block the remix cannot fix (Higgsfield down, the nsfw filter refusing the theme, an unreadable source), or
   a requirement only someone else can meet (no fitting product, no credits and no payment). The code records these
   signals on the run; the agent judges from them. On stop: tell the merchant ONE line with the way forward
   ("This video isn't working out. The team is looking at it. Meanwhile:" [Pick a ready ad] [Try another video]),
   and alert the team once (the run lands in the back-office Remix monitor "needs help" queue + one team post with the
   remix, the signal, and what was tried). Giving up at the first refusal is as wrong as looping. Never loop, never re-ask the same question, never spend more after the stop.

A new check, gate or refusal is not done until it has its fix step and its question. Reviewers block a gate that
only stops.

**Every choice or stop has a forward option** (Sean 2026-11-05, agent standard R6): the merchant can always move the
work on without fixing anything themselves: [Continue] / [Keep it] / [Use your best pick], with the change option
BESIDE it, never instead. A message whose only button is [Change more], [Try again] or "tell me what to change" is a
bug. When the run truly cannot continue, the forward option is another way: [Pick a ready ad], [Try another video], a
simpler version, or "the team is on it". Passes: [Keep original people] [Allow new person]; [Keep it] [Remake it].

**Where it lives in Cadra (Sean 2026-11-05: "this is where we set the intent … there must be a way for it to solve and
troubleshoot problems … the tools must support this too … the tools need to be accommodating").** Three parts, per
the Cadra standard (root prompt = routing, voice, hard rules only; feature behaviour in the role's skill + reference
files):

| Part | Holds |
|---|---|
| **Intent** (the remix role / skill template, first line) | The mission: this merchant gets a finished video they approve. Every turn is judged by whether it moves the run toward that. |
| **Troubleshooting reference** (a reference file of the remix skill, read on demand) | One row per refusal code: what it means, the fix the agent tries, the question + buttons if the fix fails, which tool applies the answer. |
| **Accommodating tools** | A refusal is never a bare error: it returns `{code, reason (plain), fix, ask: {question, buttons}}`. Anything a check can ask to change has a tool that changes it (cast, people kept, product, size, trim, scene, route), so the answer to a question always has a way to land. |


## Forward option on every stop (R6) — how it is built

The rule is "Every choice or stop has a forward option" in § Problem solver above (SKILL.md P6). How yobo enforces it:

- **ONE table.** `extensions/remix/advance/forward-options.ts` `STOP_FORWARD` maps every stop kind to its forward
  button; every sender builds its buttons with `withForward(kind, changeButtons, titles)`. The contract test
  (`advance/__tests__/forward-options.test.ts`) runs over every kind (≥1 forward id, ≤3 buttons, ids tokenized +
  msg-api-valid) and scans the senders: a file that builds `CHANGE_MORE` / `TRY_AGAIN_BUTTONS` without `withForward`
  fails the build. A new stop = a new `STOP_FORWARD` row first.
- **Never put the forward button first** when other buttons exist: the ask row's `action` is derived from the FIRST
  button (`remixAskActionOf`), and handlers route on that action.
- **Forward ids:** `needs:readyad` [Pick a ready ad] (lists through the one recommender, any run state),
  `needs:another_video` [Try another video] (any ask), `go:continue` [Looks good] / [Continue] / [Keep it] (ask items
  `{resume: <askId> | 'newest'}` → that ask's buttons again as a NEW ask row, else ONE line), `go:keep_draft`.
  `go:yes` never counts as forward on its own (it is [Try again] as often as [Yes, go ahead]).
- **The advance loop answers a forward press FIRST,** whatever the ask's action: an action-specific handler drops
  unknown buttons (a `front_retry` ask returned `front_idle` = silence).
- **A forward press is "done" only on a post msg-api took** (`sent` / `duplicate`); any other status posts the ONE
  line and closes the unposted row — never silence.
- Titles from copy rows in the chat's language (`ads_gen.copy.remix.<copyKey>.<lang>`), ≤20 chars, English fallback.

## Storyboard stop (one open stop per remix)

Both owners' storyboard stops reach the chat through yobo `deliver.ts` `storyboard_check_failed` (slides sends key +
English text only), so the rules live there, once:

- **One open stop per remix, claimed before the post** under a per-remix `pg_advisory_xact_lock` and ordered by the
  JOB's `created_at` (never by delivery order): a newer stop replaces the older ("Update: …", its ask closed); an older
  stop arriving after a newer one posts nothing; a redelivery repeats its text with no second alert.
- **Promise only what is true:** "The team has been told." only when the team alert really went out for this remix
  (once per remix); never "I'm looking into it and will message you here" (nobody owns it).
- **No internal words** (cast sheet, set picture, set check, beats) — replaced with the merchant's words, the article
  consumed with the term. The added prefix / told line come from copy rows in the chat's language.
- A provider render failure is not a merchant stop (it retries) — that is decided at the source (slides set gate),
  because yobo receives no typed reason.

## Owner files and copy

| What | Where |
|---|---|
| Tap handling, go asks | yobo `src/server/services/video/remix/tap.ts` |
| Post taps + "Posted" notice | yobo `.../remix/post.ts`, routed in `src/app/api/v1/internal/owner-inbound/route.ts` before `decideRemixTap`; notice runs on the credit-sweep tick (worker-service) |
| Deliveries to chat | yobo `.../remix/deliver.ts`, `deliver-export.ts` |
| Needs list message | yobo `.../remix/needs-message.ts` (deliver.ts delegates); matcher + writer variables `needs.ts` |
| Chat photo → needs row / logo | yobo `.../remix/chat-photo.ts` + `chat-photo-deps.ts`, routed in `owner-inbound/route.ts` before taps; slides `remix-tools.ts` patch `needsPick` |
| Start a remix, profile-link refusal, start summary | yobo `src/server/tools/remix-tools.ts` (`remix_start`, `remixStartSummary`); `.../video/safe-fetch-video.ts` (`profileLinkOf`) |
| Source fetch, cut, too_long | yobo `.../video/deconstruct.ts` (worker); `.../remix/analyze.ts` (`trimmedOf`) |
| Screen remix needs start | slides `src/lib/video/remix-move-forward.ts` (`screenNeedsOwed`), `src/extensions/video-ads/remix-service.ts` (`startScreenNeeds`) |
| Chat language stamp | yobo `.../remix/chat.ts` (`stampRemixChat`, `remixChatLanguage`) |
| Chat copy | yobo `chat-copy.ts`; seeded rows `ads_gen.copy.remix.*` (en + id at least) |

New copy key = English fallback in code + a `remix_copy_row_missing` log + a seed migration row. Pricing: never add/change;
never say price, credits, "free" in agent text, relay payment tool results only.
Copy with `{placeholders}`: `ads/config.ts` `fillTemplate` THROWS on any var not passed, so a line reader that pre-fills
with `{}` silently falls back to English. Read the raw row (`getAdsText`) and fill your own vars.
Social post: reuses the existing yobo social publish path through Buffer / Hootsuite (`yobo:social` → dev.md "Other
callers of the publish path"); connect = the p130 connect-menu Buffer/Hootsuite rows (signed-in link); direct IG/FB
behind Meta review; no TikTok through Buffer/Hootsuite.
