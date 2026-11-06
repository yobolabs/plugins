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
- **A polled Cadra step (the teardown) has no job row and no callback: `next_wake_at` is its ONLY re-check.** Any code
  that clears the wake while that step is out (a stall guard, a "nothing running" check that only looks at job rows)
  strands the run silently after needs. Give each polled step its own start key (teardown vs teardown pull), and make a
  FAILED / CANCELLED / not-found poll result stop the wake and post one retry line instead of polling forever.
- yobo's delivery code posts a QA-fix batch even when the fix came back `applied: false`; marking the slides store
  stale does not silence it. A reporter for a fix that did not apply must not call the "remix applied" path.
- **Prod job and money facts beat the run narrative.** A second paid-looking job may be a free QA fix (start key ending
  `:qa-fix`, `redo_of` set), not a second final press. `credit_transactions` is the truth for what was charged.
- yobo `develop` can carry two migrations with the same number; the drizzle journal `idx` keeps them in order. Check
  the journal, not the file number, before calling one missing or duplicated.
- Merchant-facing pages (remix list, detail, review cards) never show model names, prompts, or the source ad's brand
  or product: the product named is always the merchant's own (P5).
