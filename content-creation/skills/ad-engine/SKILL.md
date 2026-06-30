---
name: ad-engine
description: Use when creating short-form campaign ads (product demos, explainers) in CapCut from data, or generating ad variants fast. Also use when the user mentions "campaign ad", "short-form ad", "product demo", "explainer", "ad variant", "generate versions", "ad spec", or "build ad".
---

# Ad Engine

Data-driven pipeline for compiling short-form campaign ads into CapCut drafts from a single JSON spec. One command reads the spec, copies media into the project directory, trims clips, lays the timeline, stamps captions, and writes the CapCut draft files ready to open.

Relies on `content-creation:capcut` for native draft authoring and is designed to feed `content-creation:remotion-overlays` (motion-graphics layer, currently deferred — see Feature Status below).

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
| `brand` | object | `{}` | Brand tokens. `font` (string path) is the only field consumed by the builder today — falls back to the CapCut system font when absent. `primary` / `secondary` color tokens are parsed but not yet applied (deferred). |
| `music` | object \| null | absent | Object with `track` (file path, resolved relative to the spec file). Path is resolved at load time but music assembly is deferred (see Feature Status). |
| `captions` | array | `[]` | Global (non-slot) caption list. Parsed but not yet assembled into the draft — deferred. Use per-slot `caption` for live caption support. |
| `overlays` | array | `[]` | Remotion motion-graphics overlay list. Parsed but not yet assembled — deferred (Plan 2). |

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
cd ~/path/to/content-creation
python3.11 skills/ad-engine/scripts/build_ad.py <ad.json> \
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
python3.11 skills/ad-engine/scripts/variants.py ad.json \
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
python3.11 skills/ad-engine/scripts/variants.py ad.json \
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
python3.11 skills/capcut/scripts/capture_seed.py \
  ~/Movies/CapCut/User\ Data/Projects/com.lveditor.draft/<project-name>/ \
  --dest ~/Movies/CapCut/_seeds/empty
```

The script strips tracks, materials, and resets IDs, leaving only the structural metadata CapCut requires. The seed directory is reusable across all builds and variants.

---

## Feature Status

### Live now (Task 1–7 foundation)

| Feature | Mechanism |
|---|---|
| Data-driven assembly | Spec JSON → CapCut draft in one command |
| Auto-silence trim | `media_probe.silence_trim()` via ffmpeg silencedetect |
| Manual trim | `slot.trim = [start_s, end_s]` |
| Per-slot text captions | Bold white pill, lower third (y=0.36), slot duration |
| Format / canvas config | `format` preset or custom object → `canvas_config` |
| Media auto-copy | `copy_media()` copies every clip into the project dir; CapCut sandbox cannot read `/Volumes/` |
| Variants — single override | `variants.py --set key=value` |
| Variants — batch | `variants.py --batch dir/` |
| Root-meta registration | `--register` appends to `root_meta_info.json` |

### Deferred — do not implement until schema is verified

| Feature | Plan | Blocker |
|---|---|---|
| Transitions between clips | Plan 3 | Run `inspect_draft.py` on a CapCut draft with a real transition to get the verified schema first |
| Clip animations (in/out) | Plan 3 | Run `inspect_draft.py feature=animation` on reference draft |
| Keyframes | Plan 3 | Run `inspect_draft.py feature=keyframe` on reference draft |
| Audio / music track assembly | Plan 3 | `music.track` is path-resolved but not wired into the draft builder |
| Global `captions[]` list | Plan 3 | Parsed but not assembled; use per-slot `caption` for now |
| Remotion motion-graphics overlays | Plan 2 | `overlays[]` parsed but not assembled; requires `content-creation:remotion-overlays` skill |
| `brand.primary` / `brand.secondary` colors | Plan 3 | Tokens are in the spec schema but not consumed by the builder |

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
- `content-creation:remotion-overlays` — motion-graphics overlay layer (deferred, Plan 2). Will consume the `overlays[]` array from the spec when implemented.
