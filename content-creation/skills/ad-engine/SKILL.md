---
name: ad-engine
description: Use when creating short-form campaign ads (product demos, explainers) in CapCut from data, or generating ad variants fast. Also use when the user mentions "campaign ad", "short-form ad", "product demo", "explainer", "ad variant", "generate versions", "ad spec", or "build ad".
---

# Ad Engine

Build a short-form campaign ad from a single JSON **ad spec** — the spec is the source of truth, and **Claude edits it on the user's behalf**. The user never touches CapCut; they describe changes ("swap clip 2", "make the hook bigger", "1:1 format"), Claude edits the spec and re-runs the build, and both outputs regenerate.

`produce.py` compiles one spec into **both** outputs at once:
- a **finished `.mp4`** — rendered by `content-creation:remotion-overlays` (clips, trims, captions, transitions, motion-graphic overlays, music). This is the polished video the user watches.
- an **editable CapCut project** — the raw assembled timeline (clips, trims, captions, canvas) for downstream human editing. Built by `content-creation:capcut`.

**Transitions + overlays live in the mp4** (baked by Remotion). The **CapCut draft is the editable raw cut** — no transitions/overlays; a human refines it in CapCut if they want. (Native CapCut transitions/effects are a future enhancement — they need a CapCut schema round-trip.)

## Produce both outputs (primary command)

```bash
# one-time: install the Remotion render deps
cd "${CLAUDE_PLUGIN_ROOT}/skills/remotion-overlays" && npm install

# build the mp4 + CapCut draft from a spec (CapCut must be CLOSED)
python3.11 "${CLAUDE_PLUGIN_ROOT}/skills/ad-engine/scripts/produce.py" ad.json \
  --mp4 /abs/out/ad.mp4 [--seed DIR] [--capcut-out DIR] [--public DIR]
```

- `--seed` defaults to the shipped real CapCut seed (`content-creation/skills/capcut/fixtures/seed`).
- `--capcut-out` defaults to the local CapCut drafts dir; `--public` defaults to a temp dir.
- Prints `{"capcut": "<project dir>", "mp4": "<file>"}`.

To build only the editable CapCut draft (no render), use `build_ad.py` (documented below). For fast variants of either, use `variants.py`.

---

## Ad Spec JSON Schema

All keys parsed by `ad_spec.py`. Run `build_ad.py` against the spec; `SpecError` is raised on any missing required key or invalid value.

### Required keys

| Key | Type | Notes |
|---|---|---|
| `project_name` | string | Becomes the CapCut project folder name inside `--out`. Must be a valid directory name. |
| `format` | string \| object | See Format Presets below. |
| `slots` | array | Ordered list of media slots that become video segments on the timeline. |

### Optional keys

| Key | Type | Default | Notes |
|---|---|---|---|
| `brand` | object | `{}` | Brand tokens: `primary`, `secondary`, `font`. Applied in the mp4 (overlay colors + fonts). In the CapCut draft, `font` is used for captions; colors are not applied there. |
| `fps` | number | `30` | Frame rate of the rendered mp4. |
| `music` | object \| null | `null` | `{ track, volume }` — background music, mixed into the mp4. `track` resolved relative to the spec file. (Not added to the CapCut draft.) |
| `transition` | object | `{type:"fade",durationInFrames:12}` | Transition between slots in the mp4: `type` ∈ `none\|fade\|slide-left\|slide-right\|slide-up\|slide-down\|wipe`. (mp4 only.) |
| `overlays` | array | `[]` | Motion-graphics overlays baked into the mp4. Each: `{ type, at, durationInFrames, props }` — `type` ∈ `intro\|kinetic-hook\|callout\|cta`; `at` = seconds or `"end"`; `props` forwarded to the overlay (see `content-creation:remotion-overlays`). (mp4 only.) |
| `captions` | array | `[]` | Reserved (global captions). Use per-slot `caption` for captions in both outputs. |

### `format` — string preset or custom object

String presets (see Format Presets table below):

```json
"format": "9x16"
```

Custom format object — all three fields required; `target_dur_s` is optional:

```json
"format": { "ratio": "9:16", "width": 1080, "height": 1920, "target_dur_s": 15 }
```

`ratio` must be a CapCut-valid ratio string (e.g. `"9:16"`, `"16:9"`, `"1:1"`, `"4:3"`).

### `slots[]` — per-clip configuration

Each slot becomes one video segment on the CapCut timeline in the order listed.

| Field | Type | Required | Notes |
|---|---|---|---|
| `clip` | string | yes | Path to the source video. Relative paths are resolved from the directory containing the spec file. The file is copied into the project directory automatically. |
| `trim` | `"auto-silence"` \| `[start_s, end_s]` \| absent | no | `"auto-silence"` runs ffmpeg `silencedetect` and trims leading/trailing silence automatically. `[start_s, end_s]` is a manual trim in seconds (floats). Absent = full clip duration. |
| `caption` | string \| absent | no | Adds a bold white text caption in a dark pill at the lower third (y=0.36) for the full duration of this slot. Uses `brand.font` if set; falls back to CapCut's bundled en.ttf. |

### Complete example spec

```json
{
  "project_name": "summer-sale-demo",
  "format": "9x16",
  "brand": {
    "primary": "#FF5A1F",
    "secondary": "#1A1A1A",
    "font": "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
  },
  "music": null,
  "slots": [
    { "clip": "footage/demo1.mp4", "trim": "auto-silence", "caption": "Just add water" },
    { "clip": "footage/demo2.mp4", "trim": [1.2, 4.8], "caption": "30 seconds, done" }
  ],
  "captions": [],
  "overlays": []
}
```

---

## Format Presets

Three presets are defined in `ad_spec.py`. Use the preset name as the `format` string value.

| Preset | Ratio | Width | Height | Use case |
|---|---|---|---|---|
| `"9x16"` | 9:16 | 1080 | 1920 | TikTok / Reels / Shorts (default for campaign ads) |
| `"1x1"` | 1:1 | 1080 | 1080 | Instagram feed square |
| `"16x9"` | 16:9 | 1920 | 1080 | YouTube / landscape pre-roll |

---

## Build Command

```bash
python3.11 "${CLAUDE_PLUGIN_ROOT}/skills/ad-engine/scripts/build_ad.py" <ad.json> \
  --seed ~/Movies/CapCut/_seeds/empty \
  [--out ~/Movies/CapCut/User\ Data/Projects/com.lveditor.draft] \
  [--register]
```

| Argument | Default | Notes |
|---|---|---|
| `<ad.json>` | (required) | Path to the spec file. Relative clip paths in the spec are resolved from this file's directory. |
| `--seed DIR` | `~/Movies/CapCut/_seeds/empty` | Seed fixture directory containing `draft_info.json` and `draft_meta_info.json` of an empty real CapCut project. **Must exist.** Create with `capture_seed.py` (see below). |
| `--out DIR` | `~/Movies/CapCut/User Data/Projects/com.lveditor.draft` | Root directory where the project folder is created. |
| `--register` | off | Appends an entry to `root_meta_info.json` in `--out` so CapCut shows the project on open. Without this flag the project folder exists but does not appear in CapCut's project list. |

On success, the script prints the absolute path to the created project directory and exits 0.

### What the builder does

1. Loads and validates the spec (`ad_spec.py`).
2. Calls `Draft.from_seed()` — deep-copies the seed fixture, assigns a fresh UUID, clears tracks and materials.
3. Sets the canvas (`canvas_config`) from the format.
4. For each slot in order:
   - Copies the clip into the project directory with `copy_media()`.
   - Runs ffprobe via `media_probe.probe()` to get duration, dimensions, and audio flag.
   - Calculates trim points: `auto-silence` → `media_probe.silence_trim()`; `[a, b]` → converts seconds to microseconds; absent → full clip.
   - Adds a video material entry and a video segment at the current timeline position.
   - If `caption` is set, adds a text material and text segment (bold white pill, y=0.36) spanning the slot duration.
5. Calls `Draft.save()` — writes `draft_info.json` and `draft_meta_info.json`.
6. If `--register`, calls `Draft.register()` to append to `root_meta_info.json`.

---

## Variant Commands

Generate multiple builds from one base spec by overriding individual fields.

### Single-run override

```bash
python3.11 "${CLAUDE_PLUGIN_ROOT}/skills/ad-engine/scripts/variants.py" ad.json \
  --set slots[0].caption="New hook line" \
  --set format=1x1 \
  --seed ~/Movies/CapCut/_seeds/empty
```

Pass `--set key=value` any number of times. Keys use dot-path notation with array indexing:

| Example key | Effect |
|---|---|
| `format=1x1` | Swap canvas format to square |
| `slots[0].clip=footage/v2.mp4` | Replace clip in first slot |
| `slots[0].caption=New hook` | Change caption on first slot |
| `slots[1].trim=auto-silence` | Enable auto-silence trim on second slot |
| `project_name=summer-sale-v2` | Change output project name |

Values are auto-cast: integers and floats are parsed first; anything that fails cast stays as a string.

### Batch run

Place override files (each a flat JSON dict of `key=value` pairs) in a directory:

```
overrides/
  hook-a.json   → { "slots[0].caption": "Variant A hook", "project_name": "sale-variant-a" }
  hook-b.json   → { "slots[0].caption": "Variant B hook", "project_name": "sale-variant-b" }
  hook-c.json   → { "slots[0].caption": "Variant C hook", "project_name": "sale-variant-c" }
```

```bash
python3.11 "${CLAUDE_PLUGIN_ROOT}/skills/ad-engine/scripts/variants.py" ad.json \
  --batch overrides/ \
  --seed ~/Movies/CapCut/_seeds/empty
```

Batch mode globs `*.json` files alphabetically and runs a full build for each. Output project dirs are printed one per line.

---

## Creating a Seed Fixture

A seed fixture is a snapshot of a real, empty CapCut project. It carries the platform/version metadata (`app_id`, `app_version`, `device_id`, etc.) that CapCut needs to accept the draft. Do not fabricate these fields.

```bash
# 1. Create a new empty project in CapCut — do not add any clips.
# 2. Close CapCut.
# 3. Find the project directory:
#    ~/Movies/CapCut/User Data/Projects/com.lveditor.draft/<project-name>/
# 4. Capture the seed:
python3.11 "${CLAUDE_PLUGIN_ROOT}/skills/capcut/scripts/capture_seed.py" \
  ~/Movies/CapCut/User\ Data/Projects/com.lveditor.draft/<project-name>/ \
  --dest ~/Movies/CapCut/_seeds/empty
```

The script strips tracks, materials, and resets IDs, leaving only the structural metadata CapCut requires. The seed directory is reusable across all builds and variants.

---

## Feature Status

### Live now

| Feature | Output | Mechanism |
|---|---|---|
| Dual build from one spec | both | `produce.py` → mp4 + CapCut draft |
| Data-driven assembly | both | clips → trimmed timeline |
| Auto-silence / manual trim | both | `media_probe.silence_trim()`; `slot.trim=[s,e]` |
| Per-slot captions | both | lower-third pill |
| Format presets / custom | both | `9x16\|1x1\|16x9` or object |
| Transitions between clips | mp4 | `transition` → Remotion `TransitionSeries` (fade/slide/wipe) |
| Motion-graphics overlays | mp4 | `overlays[]` → Remotion (intro/kinetic-hook/callout/cta) |
| Brand colors + fonts | mp4 | applied in overlays/captions |
| Background music | mp4 | `music` → Remotion `<Audio>` |
| Variants | both | `variants.py --set` / `--batch` |
| Root-meta registration | CapCut | `build_ad.py --register` |

### Future enhancements (need a CapCut schema round-trip)

Native CapCut versions of features that today live only in the mp4. Each needs CapCut's real schema, harvested by writing a best-effort version, opening CapCut so it canonicalizes, and reading it back (`inspect_draft.py`) — never guessed-and-shipped.

| Feature | Note |
|---|---|
| Native CapCut transitions | so the editable draft also has transitions |
| Native clip animations / keyframes | in/out animations, Ken-Burns in the draft |
| Native CapCut audio track | music inside the draft (not just the mp4) |

---

## Critical Rules

1. **Close CapCut before every build.** CapCut overwrites `draft_info.json` on open and close, destroying programmatic changes.
2. **A seed fixture is required.** The builder uses `Draft.from_seed()` — it cannot create a valid draft from scratch. Always make a seed with `capture_seed.py` before running the first build.
3. **Media is auto-copied into the project directory.** Do not pre-stage files; `copy_media()` handles it. CapCut's sandbox cannot read files outside `~/Movies/CapCut/`.
4. **Use `python3.11`, not system python.** Scripts use f-strings, `subprocess.run(capture_output=True)`, and `json.dumps` behavior that diverges in Python 3.8 and earlier.
5. **Relative clip paths are resolved from the spec file's directory.** Keep footage in a path relative to `ad.json` or use absolute paths.
6. **Variant project names must be unique.** If two variants share the same `project_name` the second build overwrites the first.
7. **`--register` is idempotent per session but not per UUID.** Each build generates a new UUID; running the same spec twice adds two entries to `root_meta_info.json`. Use unique `project_name` values or clean up stale entries manually.

---

## Related Skills

- `content-creation:capcut` — low-level CapCut draft format, all verified schema fields, scripts for inspection and seed capture. Consult when the builder output looks wrong inside CapCut or when implementing any deferred native feature.
- `content-creation:remotion-overlays` — the Remotion render project: renders the finished mp4 (clips/trims/captions/transitions/overlays/music) and the motion-graphics overlays. `produce.py` drives it; run `npm install` there once.
