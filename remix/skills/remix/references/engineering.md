# Engineering rules (builders only)

Back to [SKILL.md](../SKILL.md). For sessions that change remix code, Cadra rows or prompts; a lab user's session
does not need this file. Every rule keeps its source quote and date.

## Where remix lives and how a run is planned (SKILL.md P1, P3)

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
Music: `join-and-sound.md` § Music.

**a source ad is optional; the storyboard is the contract (Sean 2026-11-05).**

Sean: "I don't think we need an existing ad. We can create them from scratch as long as we can come up with a script
and then a storyboard can be generated. Remember, the key is we get to a storyboard, and the storyboard has all the
elements to generate the video."

- A remix starts from a source ad OR from a script (the agent's agreed concept). With a script, the script IS the
  brief: scenes, seconds, what each shows, lines, cast roles, product scenes. Then the same storyboard → review →
  approval → video pipeline runs.
- Never answer "make this idea" by offering unrelated ads. A source ad, when used, is a quality benchmark (SKILL.md P2).
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

## Who decides, budget, pricing (SKILL.md P4)

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
- **Agents make, self-check, show and wait.** A failed self-check is fixed or asked about, never a stop (SKILL.md P6, `whatsapp-journey.md` § Problem solver).

## Pictures sent to people are compressed (Sean 2026-11-06)

Sean: "we are not sending large files, right? We're going to compress them, of course, as our standard". Every picture a merchant's phone or browser loads (review page, WhatsApp album, gallery, back office) is a compressed rendition: WebP or JPEG, long side ~720 px, about 200 KB or less. The raw model output (2k PNG) stays only as the source for models and the final export. Harm if not: 5-6 MB PNGs stall in the WhatsApp in-app browser and show blank tiles (prod remix a524de0a, 2026-11-06).
