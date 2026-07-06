---
title: "Build + ship the content-creation plugin: CapCut + Remotion dual-output campaign-ad engine (v1.2.0)"
date: 2026-06-30
projects: [yobo-plugins]
branch: main
status: completed
type: feature
topics: [capcut, remotion, video-editing, ad-engine, plugin-authoring, schema-harvest, transparent-render, dual-output]
tags: [capcut, remotion, ffmpeg, prores, transitions, motion-graphics, ad-spec, zod, claude-as-editor, short-form-video]
last_updated: 2026-06-30T16:45:00
sdk_touched: [remotion, "@remotion/media", "@remotion/transitions", zod, ffmpeg]
apps_touched: [yobo-plugins]
commits: ["1fce1aa","44784ca","ba3b7ec","4739f75","ddf9ba5","b1a8518","5975986","b3858d2","ed25364","90077dc","b4efda6","79067c9","b461a3a","200cfdf","22dcfc6","b8fc8be","458d9cb","aa600f1","2b360c3","29db759","fd43b82","0e42558"]
related_sessions: []
specs: ["content-creation/_context/specs/2026-06-30-capcut-ad-engine-design.md", "content-creation/_context/plans/2026-06-30-ad-engine-foundation.md"]
---

# content-creation: CapCut + Remotion dual-output campaign-ad engine

Built and shipped (to `yobolabs/plugins` main, v1.2.0) a Claude Code plugin that lets a user build short-form campaign ads **by talking to Claude** — the user never touches CapCut. One JSON **ad spec** compiles into BOTH a finished `.mp4` (Remotion) and an editable CapCut project. The plugin started as an import of an existing `content-creation` plugin and grew, over the session, into a comprehensive ad engine.

---

### Update — 2026-06-30 16:45

#### What Changed (end-to-end, in order)

1. **Imported the `content-creation` plugin into `yobo-plugins`** (marketplace `yobolabs`). Originally tried copying into the jetdevs monorepo (`/Volumes/HD/code/monorepo/plugins`) — wrong destination; fully reverted — then copied into `/Volumes/HD/code/ai/yobo-plugins/content-creation` and registered in `.claude-plugin/marketplace.json`. Author set to `YoboLabs`.
2. **Genericized the capcut skill** — stripped hardcoded `/Users/seanliao/...` paths and the `jayden-graduation` project name; replaced with `os.path.expanduser("~/...")` and `<user>`/`<project>` placeholders.
3. **Brainstormed + spec'd + planned** a campaign-ad engine (design doc + Plan 1 implementation plan under `content-creation/_context/`). Executed Plan 1 via subagent-driven development (fresh implementer + reviewer subagent per task, ledger at `.superpowers/sdd/progress.md`). 9 tasks, TDD, 21 tests.
4. **Built the CapCut draft builder** (Python, stdlib only): `capcut_draft.py` (seed-based surgical authoring), `inspect_draft.py` (schema extractor), `media_probe.py` (ffprobe + silencedetect), `capture_seed.py` (sanitized real-seed capture), `ad_spec.py` (spec loader + format presets), `build_ad.py` (spec→draft), `variants.py` (`--set`/`--batch`).
5. **Round-trip validated against real CapCut 8.5.0**: a Claude-built draft opens AND plays. Captured CapCut's canonical schema (segment companions + 6-ref segment) into `reference/canonical-video-segment.json`.
6. **Built the Remotion render project** (`skills/remotion-overlays/`, Remotion 4.0.484 / React 19 / zod 4): 4 transparent ProRes-4444 overlays (intro, kinetic-hook, callout, cta), then a full **`ad` composition** rendering the whole ad (trimmed `@remotion/media` `<Video>` clips + `TransitionSeries` transitions + lower-third captions + `<Audio>` music + overlays) to `.mp4`.
7. **Unified orchestrator `produce.py`**: one ad spec → both outputs (CapCut draft + Remotion mp4) in one command. Validated end-to-end (rendered two 1080×1920 ads, frames verified, sent to user).
8. **Shipped v1.2.0**: docs (ad-engine SKILL led by `produce.py`, agent `creator` rewritten to "you are the editor", team README), version bump, cleaned test projects out of the user's CapCut, merged branch → main, pushed.

#### Commit Log (key)

| Hash | Message |
|------|---------|
| `1fce1aa` | Add content-creation plugin + campaign-ad engine design |
| `ba3b7ec`..`79067c9` | ad-engine foundation Plan 1 (capcut_draft, inspector, ad_spec, media_probe, build_ad, variants, capture_seed) |
| `458d9cb` | ship sanitized real seed + wire per-project meta/register |
| `aa600f1` | validate assembled draft in CapCut + capture canonical schema |
| `2b360c3` | transparent motion-graphics overlay project |
| `29db759` | full-ad renderer — spec to finished mp4 |
| `fd43b82` | produce.py — one spec, both outputs |
| `0e42558` | ship 1.2.0 — produce-driven, dual-output |

#### Git Status
- Branch: `main` (feature branch `add-content-creation-plugin` merged ff + deleted)
- Last commit: `0e42558`, pushed to `origin/main` (`yobolabs/plugins`)
- Working tree: clean (node_modules + `.superpowers/` gitignored)

#### Commands Run

| Command | Purpose | Result |
|---------|---------|--------|
| `python3.11 -m pytest content-creation/tests/` | suite | 21/21 passing |
| `npx tsc --noEmit` (remotion-overlays) | typecheck | clean |
| `npx remotion render kinetic-hook out.mov` | overlay render | ProRes `yuva444` (alpha) |
| `npx remotion render ad ad.mp4 --public-dir=...` | full ad render | h264 1080×1920 4.65s + audio |
| `produce.py unified.json --mp4 ...` | dual output | CapCut draft + mp4, one command |
| `open -a CapCut` + read-back | schema round-trip | draft opened+played; canonical schema harvested |

## SDK Notes

- **Remotion transparent overlays**: render alpha with `--codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png`, OR set these as defaults via `calculateMetadata` (`defaultCodec:"prores"`, `defaultPixelFormat:"yuva444p10le"`, `defaultProResProfile:"4444"`). Output verified as `yuva444` (alpha present). ProRes 4444 `.mov` is the right interchange for importing into editors.
- **Remotion + zod 4**: Remotion 4.0.484 requires `zod@4.3.6` (mismatch warns but still renders). zod 4 made `.default({})` on an all-defaulted nested object a TYPE error (expects full output type) — use `.prefault({})` (input-side default) instead.
- **`@remotion/media` `<Video>`**: trim via `trimBefore`/`trimAfter` in **frames** (docs say "seconds" but examples use `n*fps`). `objectFit:"cover"` to fill vertical canvas.
- **`@remotion/transitions`**: `TransitionSeries` with `.Sequence` + `.Transition` (presentation `fade()/slide({direction})/wipe()`, `timing=linearTiming({durationInFrames})`). Total duration = Σ sequence frames − Σ transition frames. A union of presentation types fails to typecheck — annotate the factory return `TransitionPresentation<any>`.
- **Reusing a composition component inside another composition**: don't read `durationInFrames` from `useVideoConfig()` (returns the parent composition's), pass it as a prop so the in/out fade keys off the embedded sequence length.
- **CapCut draft format (8.5.0)**: `draft_info.json` is the source of truth; media linkage = `materials.videos[].path`. `draft_meta_info.json` `draft_materials` arrays can be **empty** and the draft still opens/plays (CapCut keeps them empty too). On open, CapCut auto-completes each video segment: expands `extra_material_refs` 1→6 and creates per-segment `speeds`/`placeholder_infos`/`sound_channel_mappings`/`vocal_separations`/`material_colors`. `0630` was a usable plaintext empty draft; `0630 (1)` was encrypted (unusable). Durations in microseconds. Write JSON `ensure_ascii=False, separators=(",",":")`.

## Architecture Issues

### CapCut has no CLI/API — GUI-only edit + export
- **Status**: known-limitation (designed around)
- **Topics**: capcut, automation
- **Issue**: CapCut cannot be driven headlessly; editing and final export are GUI-only.
- **Impact**: a fully-automated *finished video* cannot come from CapCut. Resolved by making **Remotion** the render engine for the mp4; CapCut project is the editable secondary artifact.
- **Correct pattern**: dual output from one spec — Remotion mp4 (automated) + CapCut draft (editable raw cut).

### "Meta-sync" suspected blocker was a false alarm
- **Status**: resolved
- **Topics**: capcut, schema-harvest
- **Issue**: a review flagged that the builder leaves `draft_meta_info.json` `draft_materials` empty as a likely "offline media" cause.
- **Impact**: none — round-trip proved CapCut leaves meta empty too and the draft opens+plays. Builder writes only `draft_info.json` media; that is sufficient.

### Native CapCut transitions/effects not yet implemented
- **Status**: unresolved (future enhancement)
- **Topics**: capcut, transitions, schema-harvest
- **Issue**: the editable CapCut draft has no transitions/effects (only the mp4 does). CapCut won't auto-add transitions on open, so the schema can't be harvested without writing a best-effort version and round-tripping.
- **Correct pattern**: write best-effort transition → open CapCut → read back canonical → bake in. NEVER ship guessed CapCut schema (breaks drafts).

## Context Documents

| Document | Path | Why It Matters |
|----------|------|----------------|
| Design spec | `content-creation/_context/specs/2026-06-30-capcut-ad-engine-design.md` | approved architecture (ad-as-data, 3 skills, VERIFIED/UNVERIFIED) |
| Implementation plan | `content-creation/_context/plans/2026-06-30-ad-engine-foundation.md` | Plan 1, 9 TDD tasks |
| Canonical CapCut schema | `content-creation/skills/capcut/reference/canonical-video-segment.json` | real CapCut-written segment + companion materials (sanitized) |
| Real seed fixture | `content-creation/skills/capcut/fixtures/seed/` | sanitized real empty CapCut draft used by the builder |
| Memory | `~/.claude/projects/-/memory/content-creation-ad-engine-model.md` | the Claude-as-editor / dual-output model |

## Lessons Learned

### Schema harvesting
- **Lesson**: harvest a closed-source app's file schema by round-trip — write a minimal/best-effort file, let the app open and rewrite it canonically, then read it back. Never hand-guess + ship.
  - Topics: `schema-harvest`, `capcut`
  - Applies to: capcut skill, any binary/opaque project format
  - Confidence: confirmed
  - Evidence: commit `aa600f1` (draft 8593→25238 bytes after CapCut canonicalized; companions captured)

### Transparent render for editor interchange
- **Lesson**: motion-graphic overlays for an NLE should render as alpha ProRes 4444 `.mov`; verify `pix_fmt` is `yuva*` with ffprobe before trusting transparency.
  - Topics: `remotion`, `transparent-render`
  - Applies to: remotion-overlays
  - Confidence: confirmed
  - Evidence: kinetic-hook render `yuva444p12le`

### Host-data hygiene in fixtures
- **Lesson**: real app project files leak host fingerprints — `device_id`/`hard_disk_id`/`mac_address`, absolute home paths, real ids/timestamps. Sanitize ALL of these before committing a captured fixture/reference.
  - Topics: `security`, `plugin-authoring`
  - Applies to: capture_seed.py, reference docs
  - Confidence: confirmed
  - Evidence: `capture_seed.py` sanitize block + grep sweeps; commits `458d9cb`, `aa600f1`

### Environment
- **Lesson**: on this Mac, bare `python` is 2.7 — underscore numeric literals (`5_000_000`) fail. Always invoke `python3.11`.
  - Topics: `environment`
  - Confidence: confirmed
  - Evidence: Task 1 implementer report

## User Steering & Corrections

### Corrections (agent was wrong / heading wrong direction)
- **User said**: "I asked you to put the plugin here /Volumes/HD/code/ai/yobo-plugins/ not in Jetdevs plugins"
  - Agent had copied content-creation into the jetdevs monorepo + registered it. Root cause: ambiguous "this current plugin" + the active skill living in the jetdevs `agents` plugin biased the destination. Lesson: confirm the exact destination repo before writing; "current plugin" ≠ the skill's home repo.
- **User said**: "The skill @capcut/SKILL.md should not be specific to a user seanliao. Make sure the skill is make generic"
  - Agent shipped a copy with hardcoded `/Users/seanliao` paths. Lesson: genericize on import; sweep for host paths.
- **User said**: "don't use the skill.md for progress"
  - Agent put Task-9/"pending"/validation-status language into SKILL.md. Lesson: SKILLs are timeless reference, NOT progress trackers — progress belongs in the ledger/session/plan.

### Steering (user redirected approach/priorities)
- **User said**: "just copy over" / "and configure"
  - Cut the agent's review/upgrade analysis; user wanted the copy+register done.
- **User said**: "I don't want any manual editing of capcut. This should be assuming the user doesn't know how to use capcut"
  - Forced the architecture: finished video must be automatable → Remotion, not CapCut GUI export.
- **User said**: "complete this plugin autonomously. Stop stopping and asking. I need to get a plugin to the team ASAP"
  - Agent was check-pointing/asking too often. Lesson: once direction is clear, execute the whole completion (build → docs → version → merge → push) without per-step questions.

### Requirements additions (scope added mid-session)
- **User said**: "I want my capcut skill to be very robust ... short form videos mostly for campaign ads including product demos, explainers, captions, transitions, motion graphics"
  - Expanded a CapCut JSON helper into a full ad engine.
- **User said**: "assume the user is using claude to edit the video continuously ... allow the user to do anything they want as far as editing and producing the video"
  - Defined the Claude-as-editor model; ad spec = source of truth; dual output.
- **User said**: "The reason we need CapCut a project is so that this project can be worked on and edited for other purposes."
  - Locked CapCut project as a first-class editable deliverable (not just raw assembly).
- **User said**: "native CapCut transitions and other native effects and editing and CapCut. These are all the things I want the skill to be able to do for the user."
  - Reinstated native CapCut editing as in-scope (Claude-applied) — deferred as a round-trip-gated enhancement, not dropped.

## Decisions

- **Decision:** Remotion is the render engine for the finished mp4; CapCut is the editable secondary output.
  **Why:** CapCut export is GUI-only; the user must get a video with zero CapCut skill.
  **Alternatives:** CapCut-only (rejected: needs GUI export), ffmpeg-only (rejected: weak motion graphics).
- **Decision:** Builder starts from a real sanitized CapCut seed (`from_seed`), never constructs `draft_info.json` from scratch.
  **Why:** canonical scaffolding (config/platform/60 material arrays) → CapCut accepts it; respects "never guess schema".
- **Decision:** Transitions + overlays baked into the mp4 only; CapCut draft is the raw cut.
  **Why:** native CapCut transition schema unharvested; shipping guessed schema would corrupt drafts. Robust + honest.
- **Decision:** Single `produce.py` orchestrator from one spec.
  **Why:** backbone of the conversational-edit loop (edit spec → both regenerate).

## Next Steps

1. **Native CapCut transitions/effects** — write best-effort transition into a draft → open CapCut → read-back canonical (`inspect_draft.py`) → bake `Draft.add_transition()` + companion handling; same for clip animations/keyframes and a native audio track. Gated on a CapCut open/close.
2. **Bake canonical companions** into `build_ad`'s segments (speeds/placeholder/sound/vocal/material_color + 6-ref) using `reference/canonical-video-segment.json`, so the CapCut draft is canonical-grade (re-validate via round-trip).
3. **Render polish (autonomous)**: real brand fonts via `@remotion/google-fonts`; validate `music` + fades end-to-end; Ken-Burns zoom on slots; more overlay types.
4. **Team onboarding**: confirm install path (`/plugin marketplace update yobolabs` → install → `/reload-plugins`) + the one-time `npm install` in `remotion-overlays`.
5. Carried Minor findings (deferred, see `.superpowers/sdd/progress.md`): variants temp-file try/finally + non-scalar `--batch` values; media_probe `json.loads` guard.
