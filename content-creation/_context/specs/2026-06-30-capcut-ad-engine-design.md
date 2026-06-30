# content-creation → Campaign-Ad Short-Form Engine — Design

**Date**: 2026-06-30
**Plugin**: `content-creation` (yobo-plugins marketplace `yobolabs`)
**Status**: Approved (design), pending implementation plan

## Goal

Make the `content-creation` plugin a robust generator of **short-form campaign ads** (mostly product demos + explainers) built in CapCut: captions, transitions, motion graphics. Core requirement beyond one-off creation: **regenerate variants fast** by changing data, not rebuilding — for ad testing and multi-placement output.

## Variant axes (the template's parameters)

Versions vary on:
1. **Hook + caption text** — headline/angle/script copy + caption wording & style.
2. **Footage / b-roll** — swap product clips, takes, screen recordings into timeline slots.
3. **Brand kit + format** — colors / fonts / logo + aspect ratio & length (9:16, 1:1, 16:9 · ~15s/30s).

Music is a single optional track per template, **not** a variant axis.

**Font handling**: custom brand fonts apply only in Remotion overlays (loaded in the composition). Native CapCut captions use an installed font path (`brand.font` resolved to a real `.ttf`/`.otf`, falling back to the CapCut system font). Keeps native captions valid without bundling fonts into the draft.

**Format presets**: `format` accepts a named preset (`9x16`, `1x1`, `16x9`) that expands to `ratio` + `width`/`height`, or an explicit object. `--set format=1x1` uses the preset shorthand.

## Architecture — "ad-as-data → CapCut draft"

Three layers, three skills.

### Layer 1 — Ad spec (data)

One JSON file = the whole ad as parameters. Variant = copy spec, change a few fields, re-run.

```jsonc
{
  "project_name": "summer-sale-demo",
  "format": { "ratio": "9:16", "width": 1080, "height": 1920, "target_dur_s": 20 },
  "brand":  { "primary": "#FF5A1F", "secondary": "#1A1A1A", "font": "Poppins-Bold",
              "logo": "assets/logo.png" },
  "hook":   { "text": "This fixed my mornings", "style": "kinetic", "overlay": true },
  "music":  { "track": "assets/upbeat.mp3", "volume": 0.6, "fade_in_s": 0.3, "fade_out_s": 0.5 },
  "slots": [
    { "clip": "footage/demo1.mp4", "trim": "auto-silence",
      "motion": "zoom-in", "transition_in": "none",
      "caption": "Just add water" },
    { "clip": "footage/demo2.mp4", "trim": [1.2, 4.8],
      "motion": "pan-left", "transition_in": "pull-in",
      "caption": "30 seconds, done" }
  ],
  "overlays": [
    { "type": "intro",    "at": 0.0 },
    { "type": "callout",  "at": 6.0, "text": "BPA-free", "anchor": "top-right" },
    { "type": "cta",      "at": "end", "text": "Shop now — 20% off", "url": "brand.com" }
  ]
}
```

### Layer 2 — Builder (Python) — skill `ad-engine` + `capcut`

`build_ad.py ad.json` reads the spec and emits a CapCut project:
- `draft_info.json` — main timeline
- `draft_meta_info.json` — material file list (kept in sync)
- appends entry to `root_meta_info.json`

Native CapCut (stays GUI-editable after):
- clip segments + trims (incl. ffmpeg silence-detect `auto-silence`)
- canvas ratio per `format`
- **transitions** between slots
- **clip in/out animations**
- **keyframe motion** — Ken Burns zoom/pan via segment `common_keyframes`
- caption track from `slots[].caption` + `hook` (non-overlay captions)
- audio track from `music` + fade

Media handling: copy every referenced clip/track/logo into `~/Movies/CapCut/<project>/` (CapCut sandbox can't read `/Volumes/` or arbitrary paths). Resolve `~` at write time — no hardcoded user paths.

Overlay integration: call the renderer (Layer 3) for each `overlays[]` entry; import each resulting transparent-bg `.mov` as a video segment on a top overlay track at its `at` time.

### Layer 3 — Overlay renderer (Remotion) — skill `remotion-overlays`

Parameterized React compositions. Props come straight from the ad spec (`brand`, text, anchor) → the **same variant data drives both layers**. Render transparent-bg `.mov` (or PNG sequence + alpha) per overlay type:
- `intro` — branded open
- `kinetic` hook — animated headline (when `hook.overlay = true`)
- `callout` — product feature pointer/badge
- `cta` — end-card with offer + URL

Render via the existing Remotion skill (`remotion-best-practices`). ffmpeg only for probing/encoding/concat, not for motion graphics.

## Schema-accuracy strategy (robustness core)

CapCut `draft_info.json` is strict — wrong/missing fields corrupt the draft or crash CapCut. **No hallucinated schema.**

- `inspect_draft.py` — read any CapCut draft and dump the exact JSON shape for a feature (transition / animation / keyframe / audio / effect): field list, types, example values, and which `extra_material_refs` / material arrays it populates.
- Per native feature workflow: user builds a tiny reference draft in CapCut using that feature **once** → run `inspect_draft.py` → document the verified schema block in the reference docs → builder uses it.
- Every native-feature block is tagged **VERIFIED** (extracted from a real draft) or **UNVERIFIED** (needs a sample) so guesses never ship.

Verified now (from the existing skill, real `draft_info.json` origin): `materials.videos`, segments + `source/target_timerange` trims, `canvas_config` + canvas blur, text captions, file-link repair, new-project scaffold.

Needs a sample draft before implementing: **transitions, clip animations, keyframes, audio**. (Effects/filters optional — defer.)

## Skill structure (3 skills, feature-area split)

```
content-creation/
  agents/dev.md                      # content-dev → ad-engine workflow + remotion + orchestration
  skills/
    capcut/
      SKILL.md                       # draft anatomy, critical rules, native-feature schema (VERIFIED/UNVERIFIED)
      reference/
        transitions.md  animations.md  keyframes.md  audio.md  captions.md
      scripts/
        inspect_draft.py             # extract real schema from any draft
        capcut_draft.py              # draft read/write helpers (sandbox copy, µs, sync both files)
    remotion-overlays/
      SKILL.md                       # overlay comp catalog + prop contract + render command
      compositions/                  # intro / kinetic / callout / cta (parameterized)
    ad-engine/
      SKILL.md                       # ad-spec schema, build + variant workflow (orchestrates capcut + remotion)
      scripts/
        build_ad.py                  # spec → CapCut draft (+ overlay render calls)
        variants.py                  # --set overrides + batch from variants/ dir
```

- `capcut` — native CapCut draft authoring HOW + verified schema. Triggers: capcut, draft_info, transition, keyframe, animation, etc.
- `remotion-overlays` — render parameterized motion-gfx overlays. Triggers: overlay, motion graphics, intro, kinetic text, callout, cta, remotion.
- `ad-engine` — the ad-as-data spec + build/variant orchestration. Triggers: campaign ad, short-form, product demo, explainer, ad variant, generate versions.

## Variant workflow

```bash
build_ad.py ad.json                                   # base draft
variants.py ad.json --set hook.text="New angle" \
                    --set slots[0].clip=footage/demo3.mp4 \
                    --set format=1x1                  # one new version
variants.py ad.json --batch variants/                 # N specs of overrides → N drafts
```

## Phasing (by dependency, each independently usable)

1. **Native core** — `capcut` skill: `inspect_draft.py`, `capcut_draft.py`, verified schema for transitions/animations/keyframes/audio (gated on sample drafts), `build_ad.py` emitting a native-only ad from spec. → usable: data-driven CapCut ads, no overlays.
2. **Remotion overlays** — `remotion-overlays` skill + overlay import in builder. → usable: motion-gfx intros/hooks/callouts/CTA.
3. **Variant engine** — `variants.py` `--set` + `--batch`. → usable: fast version generation.

Depends on: Phase 1 needs user-built reference drafts for the 4 unverified features. Phases 2–3 parallel-safe after Phase 1.

## Out of scope (YAGNI)

- Music as a variant axis (single optional track only)
- Sticker library, advanced video effects/filters/LUTs
- TTS / voiceover generation, auto-caption transcription

## Testing / verification

- `inspect_draft.py` round-trip: build draft → re-parse → schema matches expected.
- Manual: open each generated draft in CapCut — no corruption, features render correctly.
- Golden draft: one canonical ad spec → committed golden `draft_info.json`; diff on regression.
- Smoke: build base + 2 variants, assert valid JSON + media copied into project dir.

## Open items resolved

- **Multiple skills**: yes — 3 (`capcut`, `remotion-overlays`, `ad-engine`).
- **Render engine**: Remotion (confirmed).
- **Design doc location**: this file, `content-creation/_context/specs/` (plugin convention).
