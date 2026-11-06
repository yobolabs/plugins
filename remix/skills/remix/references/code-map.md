# Code map (where each step runs)

Back to [SKILL.md](../SKILL.md). Repo paths are for the dev team; specs and the lab manual are read through the `remix-context` MCP. Paths relative to each repo root; verify in live code (`git grep`) before relying on a name.

| Piece | Where |
|---|---|
| Remix service, tools, storyboards | slides `src/extensions/video-ads/remix-service.ts`, `remix-tools.ts`, `remix-storyboards.ts` |
| Storyboard check (gate) | slides `src/extensions/video-ads/storyboard-check.ts`, `src/lib/video/storyboard-check.ts` |
| Project model, shots, cuts, beat snap | slides `src/lib/video/remix-project.ts` |
| Needs, beats, shot lines, keyframes, video prompt, move-forward | slides `src/lib/video/remix-needs.ts`, `remix-beats.ts`, `remix-shot-lines.ts`, `remix-sketch.ts`, `remix-video-prompt.ts`, `remix-move-forward.ts` |
| Review/approve UI | slides `src/components/video-ads/remix/*` |
| Analyze, brief, scene words, runners, parts, join, post | yobo `src/server/services/video/remix/` (`analyze.ts`, `brief.ts`, `scene-words.ts`, `runners.ts`, `parts.ts`, `video-prompt.ts`, `join.ts`, `post.ts`) |
| Chat taps and deliveries | yobo `.../remix/tap.ts`, `deliver.ts`, `deliver-export.ts` |
| Chat transport | msg-api (reply buttons; native prefixes `needs:`/`go:` handed to yobo) |
| Cadra agent + functions | skill/tools on the remix agent; functions `video_blueprint`, `remix_brief_writer`, `remix_beats_writer`, `remix_scene_idea`, `remix_scene_reword`, `remix_needs_writer`, `remix_storyboard_review` (v7), `remix_set_check` (v2), `remix_video_prompt_writer`, `remix_sheet_*`, `remix_storyboard_*` |
| Specs, audits, journey plan | `remix-context` MCP, source path `_context/slides/_specs/p131-remix-in-ad-studio/` (`HOW-REMIX-WORKS.md`, `REASSESSMENT-2026-11-03.md`, `review-20261103/JOURNEY-PLAN.md`, `WHY.md`) |
| Lab (reference implementation) | `remix-context` search "Remix lab — how it works" |

## Traps

- yobo's remote has a branch named `integration`, so any `integration/<x>` push fails "directory file conflict": name
  integration branches `integration-<x>`.
- Typecheck on the mini needs `NODE_OPTIONS=--max-old-space-size=12288`: without it tsc runs out of memory and a
  `grep "error TS"` filter shows nothing (a false "0 errors"). The mini has no `rg`; use grep in mini-run commands.
- Delivery proof for a remix chat line: yobo `remix_deliveries.message_ids` (+ `remix_action_tokens` for the buttons);
  a msg-api DB from the vault may not be the one the deployed env posts to.
- Config is not code: Cadra prompts/skills/tools/releases are hand-edited per env. Diff dev vs prod before promote; prod may pin an old tool version after a fix.
- Cross-service races: slides project, yobo jobs/worker, Cadra runs, msg-api chat. One idempotent advance per remix owns "what happens next"; do not add another per-hop patch.
- Worker and migration changes do not ship on a merge (see the polyrepo "a merge is not a deploy" rule); verify by code inside the container.
- Model token caps: a thinking model can eat the whole output budget (empty brief); keep writers on a bounded, tested model; re-run the eval set on any model/prompt change.
- Silent errors: log `finishReason` errors; "ready: N" must name failures.
- Worked from the lab: lab frames beats from soft cuts and picks a highlight (★) from motion; the product stores neither soft-cut spans nor motion, and one frame per scene feeds the storyboard. Check `HOW-REMIX-WORKS.md` §C before touching keyframes.
- Error codes die at the tRPC hop: slides' internal remix tool route turns every `TRPCError` except CONFLICT into
  `invalid_request` (BAD_GATEWAY → 502). A refusal the merchant can act on (e.g. `too_large`) must ride as a typed
  `cause` on the TRPCError and be translated into a `RemixToolError` (own code + `outcome`) in `remix-tools.ts`.
  A bare 502 `invalid_request` reads as a platform fault and the agent falls back to payment options.
- Every list that offers a template to REMIX applies the reference copy cap (`ads_gen.video_ref_max_bytes`, read from
  yobo `/enabled`): fit candidates, stored picks and the library fallback, in SQL (`remixSizeSql`) so paging never
  stops at an all-oversized page. The start-time copy check stays; unknown size is offered and re-checked at copy.
- The chat picks message closes the agent's turn (picks intro `closesTurn: true`), so the agent's own reply after it is
  dropped. Any reason line ("that ad is too big, pick another") is posted by the tool BEFORE the cards.
- **"I couldn't open that video" triage** (a link remix stopped at the start): `ad_video_jobs` row (mode
  `remix_analyze`; the error is in `result.error`, there is no `error` column) → `ad_video_blueprints` by
  `input.blueprintUuid` (`fail_reason`, `progress.steps`; FK is `ref_id`) → worker log events
  `video_fetch_ytdlp_failed` / `video_deconstruct_failed`. yt-dlp "Instagram sent an empty media response" = the post
  is hidden from logged-out fetchers: the merchant sends the file (button `needs:file`); re-sending the link fails the
  same way. Check the week's fetch success rate before calling it an outage. The silent retry in `prepareVideo` runs
  only on `file_unavailable`; non-video bytes (`unsupported`) get no retry although the copy says "second try" (YMS-771).
- Develop carries held remix work that prod `main` lacks (e.g. the verified-entry start path). A fix in
  `remix-tools.ts` / `router.ts` / `deconstruct-source.ts` may not cherry-pick onto main: give the release captain a
  main-based port branch (off `origin/main`, tsc = base, same tests) alongside the develop branch.
- Facebook `share/v/…` and `share/p/…` links from the prod worker's IP: the share link 302s to `story.php?story_fbid=…`,
  which is login-walled ("Unsupported URL" / "only available for registered users"), while `facebook.com/watch/?v=<story_fbid>`
  reads. yobo resolves the share link first (`safe-fetch-video.ts` `resolveFacebookShare`, one GET, redirect manual,
  5 s, LIMITS row) and logs `video_fetch_fb_share_resolved` / `_unresolved`. **The User-Agent matters:** a full browser
  User-Agent gets HTTP 400 with no `Location`; `curl/8.5.0` + `accept: */*` gets the 302. `share/r/` (reels) and
  `/reel/` read as sent. `ads_gen.video_fetch_tools` has no facebook entry, so there is no Apify fallback for Facebook.
- Proving a fetch / network fix on prod (free, no data written): `docker cp` a small `.ts` that imports the shipped
  function from `/app/src/...` into the worker container, run it with `node_modules/.bin/tsx` from `/app`, then remove
  it with `docker exec -u root … rm`. A fix that passed unit tests and a fetch from a dev machine failed this way.
- A needs-list drop count over several days mixes builds: split the drops by the time the needs fix reached prod `main`
  before calling it a live cause (most "needs drops" were older than the fix).
- The needs list never marks a missing item with a bare `?`: merchants read it as broken text. The marker is the copy
  row `ads_gen.copy.remix.needs_missing.<lang>` ("Needed:").
- yobo checks on the shared mini: full `pnpm tsc` aborts (SIGABRT, out of memory) and prints NO type errors, so a grep
  on its output looks clean. Run with `NODE_OPTIONS=--max-old-space-size=12288` and count `error TS` against the base.
  The mini has no ffmpeg: `deconstruct.test.ts` fails there with `spawn ffmpeg ENOENT`; `remix-chat-ux.test.ts` needs
  `DATABASE_URL` set to any value.
- **The storyboard job uuid is `scene.storyboard.ref.jobUuid`.** The storyboard object is a strict schema
  (`ref`, `review`, `verdict`, `guide`, `redrawFailed`); `scene.storyboard.jobUuid` does not exist and reads as
  `undefined` with no error. Two R10 fixes (the [Use it anyway] re-send and the web-approval go ask) shipped green and
  did nothing live, because their test fixtures used the same invented shape. Build fixtures from the schema
  (`RemixProjectSchema.parse`) or a real stored row, never by hand.
- **A port rebase can drop commits main no longer has.** `git rebase origin/main` skips a commit as "already applied"
  when main has it by ancestry, even after a later hold-out commit on main reverted its content. Check content
  (`git show origin/main:<file> | grep <new symbol>`), not ancestry; cherry-pick again onto a fresh branch. The branch
  guard blocks a force-push of any branch whose name contains `main`: push the re-made port under a new name.
- **A yobo tsc count is only real next to its base count.** Even with the memory flag, a run can fail fast and print
  `0` (one base run took half the time of a real one). Save the output to a file, check its tail and line count, and
  compare `grep -c "error TS"` on the base commit with the branch (develop carries ~190 known errors).
- `vercel logs` filters to the CURRENT git branch by default: add `--no-branch` (and `--environment production`, or
  the dev domain) or a prod log read shows nothing.
- **Proving on the prod test org (fictional sender number):** every outbound to that number fails delivery
  (WhatsApp 131026), and a tap on an ask whose `remix_deliveries` row is `failed` is refused or re-posted. Before each
  test tap, flip that one row to `delivered` with an undo line logged first (the test org's undo file in the spec's
  `build/`), then inject the tap. Never on a real merchant's chat.
- **A polled Cadra step has no job and no callback: its wake is its only re-check.** The teardown is polled; never clear
  `next_wake_at` while it runs (prod run 836e29c2 stalled when `advance/stall-guard.ts` cleared it; fix yobo 8944fb752).
  A failed, cancelled or vanished (Cadra 404) teardown ends the poll: clear the wake, send the one refusal line.
- **Close a run's open asks when the run ends or is replaced.** Stale asks win the match for a typed reply (35 stale
  asks swallowed a merchant's typed "yes", T1c). A typed reply always resolves against the newest live run.

- yobo's delivery code posts a QA-fix batch even when the fix came back `applied: false`; marking the slides store
  stale does not silence it. A reporter for a fix that did not apply must not call the "remix applied" path.
- **Prod job and money facts beat the run narrative.** A second paid-looking job may be a free QA fix (start key ending
  `:qa-fix`, `redo_of` set), not a second final press. `credit_transactions` is the truth for what was charged.
- yobo `develop` can carry two migrations with the same number; the drizzle journal `idx` keeps them in order. Check
  the journal, not the file number, before calling one missing or duplicated.
- Merchant-facing pages (remix list, detail, review cards) never show model names, prompts, or the source ad's brand
  or product: the product named is always the merchant's own (P5).
- **yobo-owned full run (p148), where each step runs:** front (`advance/steps/front.ts`: reading → needs) → brief half
  (`advance/steps/brief.ts`: teardown, §8 brief rewrite, `beats` = the chat plan in `advance/plan-start.ts` +
  `plan-pass.ts`) → plan ask (`plan-repost.ts` `postPlanAsk`) → the go press → storyboards. A step missing from
  `brief-start.ts` `defaultBriefDeps.ported` refuses with `<step>:input_not_ported`. Before P148-1.17 no yobo run ever
  got past brief (0 of 12 dev runs had `beats`): check `remix_runs.state->project->beats` before trusting a "stuck" run.
- **A key-deduped start returns the SAME applied job.** `startRemixJob` with an unchanged start key hands back the job
  that already landed, so `started:false` can mean "current", not "nothing to do". Check `jobs.applied` to tell them
  apart (the brief rewrite re-asked forever because only `pending` was checked).
- **Template runs keep scene content in the template.** `template/view.ts` `viewRunScenes` takes `text`/`kind`/`seconds`
  from the template on every read, so words saved into `remix_runs.scenes` vanish. Write content as template vN+1
  (`writeTemplateVersion`, same tx as the run state); `remix_runs.scenes` holds run state only.
- **Asks on a yobo run are posted ask-row FIRST** (`fast-asks-wiring.ts` recordAsk + tokens, `postPlanAsk`). The
  deliver paths that post raw button ids (e.g. `plan_ready`) write no ask row, so a press has nothing to consume.
- **"The one open ask" is the newest live run's ask.** Typed yes / typed answers broke when old runs left asks open:
  close a run's asks when it ends (posted / failed / cancelled) or is replaced, and scope every open-ask read to the
  newest live run.
- **Main Chat `/chat` runs on the merchant's WhatsApp conversation**, not a WEBCHAT one: history comes from msg-api
  contact-thread, there is no live push (poll while the run is open and the tab visible), and a web tap is an
  INTERACTIVE inbound via webchat ingress → `consumeRemixTap` → owner-inbound → `tap.ts`.
- **Dev proofs:** dev has no ready ads, and the fit gate needs the same product type as the ad. Create a matching dev
  product (catalog row + photo) before a dev run.
- **Prod has what develop has only by CONTENT.** Selective prod cuts make git ancestry lie: check a commit with
  `git diff <commit> origin/main -- <file>`, never `merge-base --is-ancestor`. A main port: `cherry-pick -x`; for
  `drizzle/meta/_journal.json` keep main's and append the batch's entries after main's last idx; compare tsc errors
  against a clean `origin/main` worktree (normalise the worktree path in the messages before diffing).
- **Reading prod chats: never print sign-in links.** A `cta_url` / open-app message's `content_rich` and button URLs carry
  live signed tokens (7-day chat-entry sign-in). Select only safe columns (id, direction, kind, created_at, status, a
  text length or hash); never `content_rich`, `metadata` URLs or button payloads. A printed link = a leaked login:
  revoke the token and log it in ROTATION-LOG (2026-11-06: prod token 4795 printed from a cta_url row, revoked, #32).
- **Tool results reach msg-api inside an envelope.** A Cadra REST tool's recorded result (completion `toolResults`) is
  `{ success, data: { success, result: { … } } }`. Any msg-api reader of a tool flag must follow `data` / `result` a
  few levels; a parser that looks one level down passes synthetic tests and misses every live run. Debug: cadra-api
  records them in Redis DB 1, key `commerce:results:<executionId>`, 1 h TTL — read it from inside the cadra-api
  container (node + ioredis on its `REDIS_URL`, db 1). Build test fixtures from a real recorded row.
- **App-speaks-next.** A started `remix_start` carries `appSpeaksNext: { ref: remixId }`; msg-api drops the agent's
  own text after it only when its holding line for that execution went out (`agent_text_suppressed`; else
  `agent_text_kept_app_missing`). Refused / resumed starts carry no flag and keep the agent's words.
- **Web chat agent = `COPILOT_TEAM_UUID` (yobo system_config).** Web-only Main Chat AND every side chat use it (via
  msg-api WEBCHAT); a WhatsApp-linked Main Chat uses the WA conversation's agent. The copilot key and that agent must
  sit in the SAME Cadra org: an agent in another org makes cadra-web's stream route answer `wrong_org` → SSE 404
  "Agent run not found" on every web turn. Diff dev vs prod for this row (dev drifted to an agent with no remix tools).
- **A web remix runs in a Side Chat** (Sean 2026-11-06; rule in `engineering.md`). Today `defaultWhatsAppChat`
  (`remix-tools.ts`) returns null for a WEBCHAT conversation, taps are allowed only on Main Chat (webchat ingress), and
  the remix history poll runs only on Main Chat — the side-chat stories close these.
- **Only the run machine writes run state.** `run-machine-writers.test.ts` fails any other `remix_runs` writer. A
  side writer (lease, web focus) is allow-listed with a guard test, writes ONE state key with `jsonb_set`, and never
  bumps `version` (a bump makes the machine's version CAS lose mid-advance).
- **Drizzle journal `when` must be strictly increasing.** Two entries with the same `when` make drizzle skip one; new
  entry = `max(when) + 1000`, and recheck after any renumber.
- **Main ports of develop work:** develop carries features main lacks; port only the net diff of the batch, drop hunks
  for absent features, and fix main-only tests that still assert the old behaviour (baseline them on a clean main
  worktree first). mini-run vitest needs a dummy `DATABASE_URL=postgres://u:p@127.0.0.1:1/x` for files that import db
  clients; tsc needs `NODE_OPTIONS=--max-old-space-size=8192` and a grep on touched files.
- **"No ready ads for <category> yet" is an empty recommender, never a switch.** yobo `recommendFor`
  (`extensions/remix/templates/recommend.ts`) posts that line when zero cards survive. Check in this order: reviewed
  (`review_status='done'`) slides `content_items` with that `category` tag (`content_item_tags.item_id`); a saved
  `video_url` asset (`status='ok'`, `s3_key` set); bytes ≤ yobo `ads_gen.video_ref_max_bytes` (slides filter); length ≤
  `ads_gen.remix_max_source_seconds` (yobo filter, unknown length kept); an https thumb. Usual root cause: the Ad
  Library review backlog (few `done` items per category), not code. Prod DB reads: vault items via `secret-run`, read-only txn.
- **A yobo press job's `runId` is the PRESS run, never a `project.runs` entry.** Only slides' `freezeRun` writes
  `project.runs`; the slides apply rule (runId must be in `project.runs` with the same inputHash) sent every yobo
  sheet / board / review / part / fix / join / export job to `jobs.stale` 'input_changed'. Yobo jobs are current on
  their own pending row (`apply-job.ts` pressRun). A start that gets an ended (stale / failed) job back refuses
  `<step>:job_dead` — re-pending it is a wait nothing wakes.
- **On WhatsApp the go approves the sheets** (slides `approveSheetsOnGo`, journey row 9): yobo's storyboards step does
  it under the consumed go press (approver = the tap message on that ask). Without it boards wait on `to_approve`.
- **Read a run's scenes only through the template view** (`template/run-scenes.ts` runScenesOf / readRunWithTemplate):
  a template run's `remix_runs.scenes` holds run state only (often `[]`), and `apply-port` isScene needs `sceneIndex`.
  A raw read drops landed boards and erases state rows; a guard test fails on new raw reads under `advance/`.
- **Every move INTO a paid phase needs a consumed press**, retries included: [Try again] on a refused part / join /
  board consumes its own ask (press-port consumeFullKeyPress `retry:<step>`) and restarts under that press run.
- **Approval artifacts are strict `{attachmentId, contentHash}`.** Copying a whole storyboard ref (+asset, jobUuid)
  into `approvals[].artifact` makes `state.project` unparseable and every reader returns null ('no_project').
- **Proving on dev:** parse the run's `state.project` inside the worker (tsx, dynamic import of the schema) when a
  step says no_project; one-row fixes on `remix_runs` CAS on `version` with an undo file first.
- **A slides chat remix that stops after its parts: read `jobs.failed` before calling it a lost join.** slides
  `autoJoinDue` logs `remix_auto_join_wait why:parts_missing` when a part never started; a `start-failed:<run>:<part>`
  entry with "needs a top-up" means the credits ran out mid-run (parts after it never start). Re-starting spends the
  merchant's credits: only on the owner's OK, and size the credits first (each part bills at least the model minimum).
- **Fast-cut ads blow up into one paid part per shot** when every scene is `per_scene` and no neighbours merge (a 57 s
  ad with 35 cuts = 36 parts, each billed at the 4 s minimum). Check `plan.groups` strategies and seconds before a
  video go on a long fast-cut source.
- **Slides prod DB has no vault key:** `vercel env pull --environment=production <scratchpad>/.env --yes` (umask 077) from
  the slides repo, read it only via `secret-run ENVF=file:<that> -- sh <script>` using `DATABASE_URL_UNPOOLED`, SELECTs
  only, delete the file after. The vault `msg_api.dev` DB is not the DB the deployed dev msg-api container writes to:
  read dev msg-api rows inside the container.
- **A new caller → new route across repos ships the ROUTE side first.** A fail-open caller hides a wrong order (it 404s,
  falls back, and the old behaviour reaches a real merchant).
