# Review (the gate before the merchant sees any storyboard)

Back to [SKILL.md](../SKILL.md). Rule: **any fail is redone before it is shown.** Then the human approves each storyboard.
The AI review and code checks run on every set; "Fix it" for the merchant is a button, never an automatic retry loop.

## How: one review sheet

Put the storyboard NEXT TO the named cast pictures (and the set picture) on ONE image, each labelled with the person's
name. Send that image to the vision call with the shot's brief slice, the identity cards and the seat map. A review
that sees the storyboard alone against brief text passed pictures with the wrong hair, skin and seats.

## Per-storyboard AI checklist

- [ ] Right person per name: face, hair, skin, clothes match that person's picture; no look-alike swaps; nobody duplicated
- [ ] Seats as the seat map; room = the set picture
- [ ] Scale: nobody tiny or giant for where they stand
- [ ] Framing as the shot asks (size, angle, who is in frame)
- [ ] Feeling as the brief says, background people included
- [ ] Background people the ad shows are kept (the new team, softly out of focus); no speaker alone on a bare wall unless the ad shows that
- [ ] Room, set and colours match the brief
- [ ] No text, captions, logos drawn; no old-brand logos, mascots or signs
- [ ] Screens are a phone held by a character with a flat green screen
- [ ] Product is the product (shape, label), at the source subject's size and place
- [ ] Matches the line drawing's framing and position

## Set check (whole set, vision)

One cast, one set across all scenes: a person changes look, an extra person appears, the set drifts, the same panel
repeated. (A pass once let 16 repeated panels and an invented person through: check for repeats explicitly.)

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
- **A replay proof must include the consumer's read.** Replaying a gate inside the worker proves the reviewer; it does
  not prove slides parses and applies the result. Before calling a QA change proven, run the produced result through
  slides' own `RemixJobResultSchema` and `applyRemixJob`, or watch one real run reach the chat.
- **Turn the switch off first when the chat goes quiet.** `''` restores the old checks at once; fix, prove, then on again.
