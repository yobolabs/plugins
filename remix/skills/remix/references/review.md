# Review (the gate before the merchant sees any storyboard)

Back to [SKILL.md](../SKILL.md). Rule: **any block is redone before it is shown; good enough passes** (see below). Then the human approves each storyboard.
The AI review and code checks run on every set; "Fix it" for the merchant is a button, never an automatic retry loop.

## How: one review sheet

Put the storyboard NEXT TO the named cast pictures (and the set picture) on ONE image, each labelled with the person's
name. Send that image to the vision call with the shot's brief slice, the identity cards and the seat map. A review
that sees the storyboard alone against brief text passed pictures with the wrong hair, skin and seats.

## Good enough passes: the source ad is a benchmark, not a blueprint

Sean 2026-11-05 ~21:1x: "these remix videos are not blueprints … We need flexibility … think about what the end goal
is … providing a video quality video to the user who has no idea how to do this. They are not gonna be that nitpicky.
We need to reduce how critical we are and pass approve things or pass things that are done well enough." (A reviewer
failed every storyboard because the new cast differed from the source person, and failed one because the source shot
showed a hand and ours showed the hand plus part of the body.)

**The reviewer judges against the brief, never against the source frame.** Its input is built by code from the run
record (approved cast + cast sheet, the scene's beats and lines in the brief, the scene's job), not prose asking it to
remember the brief. The source reading is context only. Every finding has one verdict:

| Verdict | Only for | Effect |
|---|---|---|
| **block** | wrong product (or its label/shape/real size clearly wrong) · another brand's logo, mascot or sign · garbled or invented text, captions or logos · an extra person the brief does not have · broken anatomy (extra limbs, melted faces, a giant or tiny person) · unsafe or off-brand · a screen that is not a flat green phone screen when the scene shows one | the set is held: fixed once automatically, still blocked → shown with the shot, the reason and a way forward |
| **look** | a scene clearly shows a DIFFERENT person from the approved cast (not hair, light or angle) | waivable: fixed once, then [Keep it] |
| **pass** (info at most) | the cast differs from the source ad (that is the remix) · framing, zoom or crop differ from the source or line drawing · pose, beat or moment differ from the one source frame · seats, room details or colours differ slightly from the brief | never shown to the merchant as a problem |

A per-shot block gates the set in code; the set check alone never decides. A check that could not run is a fail, not a
pass.

## Per-storyboard AI checklist (what to look at, verdicts as above)

- [ ] Right person per name vs the approved cast picture (look), nobody duplicated, no extra person (block)
- [ ] Product is the product, label exact, real size (block when clearly wrong)
- [ ] No drawn text, captions, logos; no old-brand logos, mascots or signs (block)
- [ ] Anatomy and scale believable (block when broken)
- [ ] Screens are a phone held by a character with a flat green screen (block)
- [ ] Feeling, room, background people, framing as the brief says (pass/info: good enough wins)

## Set check (whole set, vision)

One cast across all scenes: a person clearly becomes someone else (look), an extra person appears (block), the same
panel repeated (block). Small set or colour drift between scenes = info. (A pass once let 16 repeated panels and an
invented person through: check for repeats explicitly.)

## Code checks (deterministic)

| Check | Fails when |
|---|---|
| scenes = measured shots | a scene has no shot, or two shots share one scene |
| beats map to audio | a beat sits outside its scene; scene windows leave gaps/overlaps; total != audio length |
| every scene has its picture/clip | missing or failed storyboard |
| dialogue across scenes (one LLM pass over ALL lines in order) | contradiction, repeat, speaker change without reason, line longer than its window |
| matches the brief (vision per scene) | the brief slice is not shown |

Built in code: `scenes_match_shots`, `beats_map_audio`, `scene_has_picture` (slides `storyboard-check.ts`).
Cadra functions: `remix_storyboard_review` (v7), `remix_set_check` (v2).

## Known gaps (verified against slides origin/develop, 2026-11-03)

1. Per-shot review sends the whole remix brief section (`remixBriefSection`), not the shot's slice.
2. Review sends cast NAMES, not cast pictures beside the storyboard (the rule above says one sheet with cast pictures).
3. Code comment in `remix-service.ts` (~line 765) says "The check advises; the merchant decides", but the rule is
   any fail is redone before shown. Code and rule disagree; the rule wins.
4. No dialogue-across-scenes check found in code.

Close these before claiming the gate works. After the gate, test the hypothesis on the eval set: storyboard-check pass vs final video quality.

## After video: QC of every part

Second by second, never one frame per scene: 1 fps strip, source over result; against the brief row by row; cut count and times re-measured on the export (more than 1 frame off = fail); sound present; no burned text/labels; no slop (orientation, counts, hands, floating, screen direction). 1-2 bad shots: splice with the fix clip's OWN audio; most bad: remake the part.

## The QA reviewer (one AI reviewer next to the original ad)

One Cadra AI function (`remix_qa_review`) checks the storyboards, each made part and the final joined video **next to
the original ad's own frames**, so a fault the original also shows passes. Switch: yobo config
`ads_gen.remix_qa_function_key` (`''` = off, the old checks run). Order of fixes: free first (re-trim at the join,
redraw a storyboard), then ONE paid re-render of a part per approved go (our cost; the cap has a `LIMITS.md` row),
then hold the video and ask the merchant ONE question with [Remake it] / [Keep it]. A fixed video reaches the chat with
exactly one plain fix line, never a list of checks.

Rules that cost a prod incident to learn:

- **The QA record lives under `result.qaReview`, never `result.review`.** slides reads every remix job result with
  `review: string[]` and drops a result that does not parse; an object there means the part or joined video never
  reaches the remix. `review` stays the plain check lines.
- **A fix job yobo starts on its own must name what it replaces** (`result.qaReview.fixOf` = the replaced job). slides
  never recorded it as started, so without that it is stored stale, slides reports `applied:false`, and the chat gets
  nothing. slides adopts a done part that names the part's current job (same run inputHash); yobo also delivers a done
  QA fix job when slides says `applied:false` (ask → the one question; pass → ready + the one fix line; the replaced
  video is never sent).
- **Unit-green is not done: prove a fix on one real run.** Two chat fixes passed every test and did nothing live (a
  wrong field read on an invented fixture shape). One real run on the dev test chat, free (stop before any paid go),
  per fix, before the prod request.
- **A replay proof must include the consumer's read.** Replaying a gate inside the worker proves the reviewer; it does
  not prove slides parses and applies the result. Before calling a QA change proven, run the produced result through
  slides' own `RemixJobResultSchema` and `applyRemixJob`, or watch one real run reach the chat.
- **Turn the switch off first when the chat goes quiet.** `''` restores the old checks at once; fix, prove, then on again.
