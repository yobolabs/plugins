# Code map (where each step runs)

Back to [SKILL.md](../SKILL.md). Paths relative to each repo root; verify in live code (`git grep`) before relying on a name.

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
| Specs, audits, journey plan | `_context/slides/_specs/p131-remix-in-ad-studio/` (`HOW-REMIX-WORKS.md`, `REASSESSMENT-2026-11-03.md`, `review-20261103/JOURNEY-PLAN.md`, `WHY.md`) |
| Lab (reference implementation) | `yobo:ad-studio-video` `references/remix-lab.md` |

## Traps

- Config is not code: Cadra prompts/skills/tools/releases are hand-edited per env. Diff dev vs prod before promote; prod may pin an old tool version after a fix.
- Cross-service races: slides project, yobo jobs/worker, Cadra runs, msg-api chat. One idempotent advance per remix owns "what happens next"; do not add another per-hop patch.
- Worker and migration changes do not ship on a merge (see the polyrepo "a merge is not a deploy" rule); verify by code inside the container.
- Model token caps: a thinking model can eat the whole output budget (empty brief); keep writers on a bounded, tested model; re-run the eval set on any model/prompt change.
- Silent errors: log `finishReason` errors; "ready: N" must name failures.
- Worked from the lab: lab frames beats from soft cuts and picks a highlight (★) from motion; the product stores neither soft-cut spans nor motion, and one frame per scene feeds the storyboard. Check `HOW-REMIX-WORKS.md` §C before touching keyframes.
