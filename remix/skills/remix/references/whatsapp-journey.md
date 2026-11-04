# WhatsApp journey

Back to [SKILL.md](../SKILL.md). Read when adding, changing or debugging any chat step of a remix.

## Principle

Fixed actions are deterministic and bypass the agent. A button tap is routed by msg-api to yobo, which moves the remix
on itself (an idempotent advance of the run). The agent (one general chat agent) only handles free text and questions,
via typed remix tools (`remix_start/get/set/scene/make/approve/edit` + payment tools), never a free-form `call_tool`
for remix writes. Tool arguments: ids come only from a tool result or the merchant's message; `answers` is ONE JSON
string (an object whose keys contain ':' broke every "Use these").

## Tap ids

| Prefix | Meaning | Examples |
|---|---|---|
| `needs:` | answer the questions step | `needs:use`, `needs:change`, `needs:ai` |
| `go:` | answer a recorded go ask (`make:<what>`) | `go:yes`, `go:change` |
| `make:<what>` | what a go starts: `storyboards`, `videos`, `join`, `final`, `cut` (approve + export), `export`, `redraw` of named scenes, `remake` of a named video | |
| `go:post…` | post the finished video (NOT a go ask) | `go:post`, `go:postlater`, `go:postinstagram`, `go:postfacebook`, `go:postthreads` |

A go binds to an open ask, never to a stray "yes". A tap with no handler falls to the agent: that is a bug.

**msg-api forwards only ids matching `^(needs|go):[a-z]+$`** (`msg-api` `remix-tap-forwarder.ts` `REMIX_TAP_ID`): no
`_`, `:`, digits or uppercase after the prefix. Any other id silently goes to the agent. Name new buttons `go:<letters>`,
or change the regex in msg-api first. It also forwards a WhatsApp photo with no tap id (`nativeReplyId: null`,
`photo: { attachmentUuid, mimeType }`, caption in `text`) — see *Needs list and chat photos*.

## Steps as buttons

link/ad pick -> "studying it" -> breakdown (one short message) -> needs list (one message, everything missing, own
catalog products by name, chat's language, at most one short question per message) -> [Make storyboards] -> "Storyboards
ready: N" + [Review & approve] -> [Make the video] -> videos ready + [Put it together] -> joined shown + [Make the
final] -> finals reviewed -> joined again -> [Approve it] -> "Your video is ready." + the MP4 -> [Post it] / [Not now] ->
"Posted: <link>". [Approve it] (`make:cut`) is ONE tap = approve the cut + start the export on that same go (the web
"Approve and export" button); there is no separate [Get the file] step. [Try again] (`make:export`) appears only when
the cut was approved but the export did not start.
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
- **Several failed storyboards** redo on one ask (`make:redraw` + every failed scene). A failed video redoes one at a
  time (`make:remake` + that part); more than one failed video keeps a typed note.

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
