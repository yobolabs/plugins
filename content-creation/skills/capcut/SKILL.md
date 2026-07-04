---
name: capcut
description: Use when building, editing, or automating CapCut video projects programmatically. Also use when the user mentions "capcut", "draft_info", "trim clips", "silence detection", "video captions", "canvas blur", "aspect ratio", or "CapCut project".
---

# CapCut Project Automation

Programmatic creation and editing of CapCut projects on macOS via direct JSON manipulation.

## Project File Locations

```
~/Movies/CapCut/User Data/Projects/com.lveditor.draft/
  {Project Name}/
    draft_info.json        ← main timeline (primary file to edit)
    draft_info.json.bak    ← CapCut's auto-backup (same content usually)
    draft_meta_info.json   ← also stores file paths — must be kept in sync
    draft_cover.jpg
    attachment_pc_common.json
    template-2.tmp
    timeline_layout.json
    Timelines/
    Resources/

root_meta_info.json        ← index of all projects (add entry when creating new)
```

## Critical Rules

1. **CapCut must be closed before writing any file** — it overwrites on open/close, losing all programmatic changes
2. **Always read the file before modifying** — never rebuild from scratch; make surgical edits
3. **Both JSON files store paths** — update `draft_info.json` materials AND `draft_meta_info.json` draft_materials
4. **All durations are in microseconds** — multiply seconds × 1,000,000
5. **File paths must be accessible** — CapCut sandbox cannot reach `/Volumes/`; copy files to `~/Movies/CapCut/` first

## Project JSON Structure

```python
data = {
    "id": "UUID",
    "version": 360000,
    "new_version": "167.0.0",
    "name": "Project Name",
    "duration": 41_200_000,       # total timeline duration in µs
    "fps": 30.0,
    "canvas_config": {
        "ratio": "9:16",          # "9:16", "16:9", "4:3", "3:4", "1:1", "original"
        "width": 1080,
        "height": 1920,
        "background": None
    },
    "tracks": [...],              # video track first, then text tracks
    "materials": {
        "videos": [...],          # one entry per source file
        "texts": [...],           # text overlay materials
        "canvases": [...],        # background fill materials (one per video segment)
        "audios": [],
        "transitions": [],
        # ... many more empty arrays
    }
}
```

## Video Materials (`materials.videos`)

One entry per source file. `duration` = full source file duration (not trimmed).

```python
{
    "id": "UUID",
    "path": "/Users/<user>/Movies/CapCut/<project-name>/video.MP4",  # absolute; expand ~ at write time
    "material_name": "video.MP4",
    "type": "video",              # "video" or "photo"
    "duration": 15_333_333,       # full source duration in µs
    "width": 720,
    "height": 1280,
    "has_audio": True,
    "has_sound_separated": False,
    "category_name": "local",
    "source": 0,
    "source_platform": 0,
    "check_flag": 62978047,
    "crop": {
        "lower_left_x": 0.0, "lower_left_y": 1.0,
        "lower_right_x": 1.0, "lower_right_y": 1.0,
        "upper_left_x": 0.0, "upper_left_y": 0.0,
        "upper_right_x": 1.0, "upper_right_y": 0.0
    },
    "crop_ratio": "free",
    "crop_scale": 1.0,
    # ... many other fields (see full template below)
}
```

## Video Track Segments

Segments define what portion of a source clip appears where on the timeline.

```python
{
    "id": "UUID",
    "material_id": "UUID",        # references materials.videos[n].id
    "source_timerange": {
        "start": 1_038_095,       # trim start in µs (from source file)
        "duration": 11_752_857    # trimmed duration in µs
    },
    "target_timerange": {
        "start": 0,               # position on timeline in µs
        "duration": 11_752_857    # must match source duration (at speed 1.0)
    },
    "extra_material_refs": [      # CapCut auto-populates; includes canvas material ID
        "canvas-material-uuid",
        "speed-material-uuid",
        "placeholder-info-uuid",
        ...
    ],
    "clip": {
        "alpha": 1.0,
        "flip": {"horizontal": False, "vertical": False},
        "rotation": 0.0,
        "scale": {"x": 1.0, "y": 1.0},
        "transform": {"x": 0.0, "y": 0.0}
    },
    "speed": 1.0,
    "volume": 1.0,
    "visible": True,
    "render_index": 0,
    "track_render_index": 0,
    # ... many other fields
}
```

## Trimming Clips

### Silence Detection with ffmpeg
```bash
ffmpeg -i "video.MP4" -af "silencedetect=noise=-35dB:d=0.2" -f null - 2>&1 | grep -E "silence_(start|end)"
```

- `noise=-35dB` — threshold (try `-30dB` for stricter detection)
- `d=0.2` — minimum silence duration in seconds
- Leading silence: first `silence_end` value → use as `source_timerange.start`
- Trailing silence: last `silence_start` value → use as trim end point
- Long mid-clip pause (>1s) often signals a "cheers" or closing remark to cut

### Applying Trims (surgical edit)
```python
import json, os

with open(DRAFT, "r", encoding="utf-8") as f:
    data = json.load(f)

mat_map = {v["id"]: os.path.basename(v["path"]) for v in data["materials"]["videos"]}

trims = {
    "video1.MP4": (start_us, end_us),
    "video2.MP4": (start_us, end_us),
}

target_pos = 0
for seg in data["tracks"][0]["segments"]:
    name = mat_map[seg["material_id"]]
    start_us, end_us = trims[name]
    dur_us = end_us - start_us
    seg["source_timerange"]["start"]    = start_us
    seg["source_timerange"]["duration"] = dur_us
    seg["target_timerange"]["start"]    = target_pos
    seg["target_timerange"]["duration"] = dur_us
    target_pos += dur_us

data["duration"] = target_pos

with open(DRAFT, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
```

## Canvas / Background Fill

CapCut auto-creates one `canvas_color` material per video segment (stored in `materials.canvases`), already referenced in each segment's `extra_material_refs`.

### Enable Blur Background (surgical — only change these two fields)
```python
with open(DRAFT, "r", encoding="utf-8") as f:
    data = json.load(f)

for c in data["materials"]["canvases"]:
    if c.get("type") == "canvas_color":
        c["type"] = "canvas_blur"
        c["blur"] = 1.0           # 0.0–1.0

with open(DRAFT, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
```

**Note**: Blur background only has visible effect when the canvas ratio differs from the video's native ratio (e.g., 4:3 canvas with 9:16 portrait videos). The blurred video fills the pillarbox areas.

### Change Canvas Aspect Ratio (surgical)
```python
data["canvas_config"] = {"ratio": "4:3", "width": 1440, "height": 1080, "background": None}
# Common ratios: "9:16" (1080×1920), "16:9" (1920×1080), "4:3" (1440×1080), "1:1" (1080×1080)
```

## Text Captions

### Text Material Format
```python
import json

FONT = "/Applications/CapCut.app/Contents/Resources/Font/SystemFont/en.ttf"

def make_text_content(text, size, bold=False):
    style = {
        "fill": {"content": {"solid": {"color": [1, 1, 1]}, "render_type": "solid"}},
        "range": [0, len(text)],
        "size": size,
        "font": {"path": FONT, "id": ""}
    }
    if bold:
        style["bold"] = True
    return json.dumps({"styles": [style], "text": text}, ensure_ascii=False)

text_material = {
    "id": new_uuid(),
    "type": "text",
    "content": make_text_content("Hello", size=8.0, bold=True),
    "alignment": 1,                    # 1=center
    "text_color": "#FFFFFF",
    "text_alpha": 1.0,
    "font_path": FONT,
    "font_size": 8.0,
    # Dark pill background:
    "background_style": 2,             # 2=filled rounded box
    "background_color": "#1A1A1A",
    "background_alpha": 0.65,
    "background_round_radius": 0.5,
    "has_shadow": False,
    "line_max_width": 0.82,
    "line_spacing": 0.02,
    "is_rich_text": True,
    # ... many other fields required
}
```

### Text Segment Positioning

Text segments go in a separate `text` track. Position is controlled by `clip.transform.y`:
- `y = 0.0` → center of frame
- `y = 0.36` → lower third (name line)
- `y = 0.42` → below lower third (location line)
- Positive y = downward, negative y = upward
- `render_index: 14000` ensures text renders above video

```python
text_segment = {
    "id": new_uuid(),
    "material_id": text_material_id,
    "source_timerange": None,          # always None for text
    "target_timerange": {
        "start": clip_start_us,
        "duration": clip_duration_us
    },
    "clip": {
        "alpha": 1.0,
        "flip": {"horizontal": False, "vertical": False},
        "rotation": 0.0,
        "scale": {"x": 1.0, "y": 1.0},
        "transform": {"x": 0.0, "y": 0.36}
    },
    "render_index": 14000,
    "track_render_index": 2,
    "visible": True,
    "speed": 1.0,
    "volume": 1.0,
}
```

## Fixing Broken File Links

CapCut stores absolute paths. When files move or are renamed, links break.

### Fix paths (surgical — only update path fields)
```python
import os
PROJECT_NAME = "my-project"  # your CapCut project folder name
NEW_BASE = os.path.expanduser(f"~/Movies/CapCut/{PROJECT_NAME}")

# Fix draft_info.json
for v in data["materials"]["videos"]:
    v["path"] = f"{NEW_BASE}/{os.path.basename(v['path'])}"

# Fix draft_meta_info.json
for group in meta["draft_materials"]:
    for item in group.get("value", []):
        if "file_Path" in item and item["file_Path"]:
            item["file_Path"] = f"{NEW_BASE}/{os.path.basename(item['file_Path'])}"
```

**CapCut sandbox**: The app cannot access `/Volumes/` (external drives). Copy media files to `~/Movies/CapCut/{project-name}/` before linking.

## Creating a New Project

```python
import json, uuid, time, os

def new_uuid(): return str(uuid.uuid4()).upper()

PROJECT_NAME = "My Project"
DRAFT_ROOT   = os.path.expanduser("~/Movies/CapCut/User Data/Projects/com.lveditor.draft")
PROJECT_DIR  = f"{DRAFT_ROOT}/{PROJECT_NAME}"
ROOT_META    = f"{DRAFT_ROOT}/root_meta_info.json"

os.makedirs(PROJECT_DIR, exist_ok=True)
now_us = int(time.time() * 1_000_000)

# Build draft_info.json with tracks, materials, canvas_config
# Build draft_meta_info.json with draft_materials file list
# Append entry to root_meta_info.json all_draft_store array
```

Key fields for `root_meta_info.json` entry:
```python
{
    "draft_fold_path": PROJECT_DIR,
    "draft_json_file": f"{PROJECT_DIR}/draft_info.json",
    "draft_id": project_id,
    "draft_name": PROJECT_NAME,
    "draft_new_version": "167.0.0",
    "draft_root_path": ".../com.lveditor.draft",
    "tm_draft_create": now_us,
    "tm_draft_modified": now_us,
    "tm_duration": total_duration_us,
}
```

## Platform / Version Info

```python
platform = {
    "os": "mac", "os_version": "26.2",
    "app_id": 359289, "app_version": "8.5.0", "app_source": "cc",
    # device_id, hard_disk_id, mac_address — copy from existing project
}
```

## Getting Video Metadata

```bash
# Duration in microseconds
ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1 "video.MP4"

# Width, height, fps
ffprobe -v quiet -show_streams -select_streams v "video.MP4" | grep -E "width|height|r_frame_rate"
```

## Common Pitfalls

- **CapCut overwrites on open** — always close before any write; reapply all changes if CapCut was open
- **Rebuilding wipes user edits** — only modify specific fields, never reconstruct entire file
- **Extra material refs** — CapCut auto-manages these; don't add refs CapCut didn't create (except canvas material IDs which go at the start of the refs list)
- **Text material `content` field** — must be a JSON-encoded string, not a nested object
- **Chinese filenames** — use `ensure_ascii=False` when writing JSON
- **Both JSON files** — `draft_meta_info.json` also needs path updates or links will break
- **Canvas blur requires aspect ratio mismatch** — blur background is invisible when canvas and video are the same ratio

## Scripts

Four scripts live in `content-creation/skills/capcut/scripts/`. All require `python3.11`.

### `capcut_draft.py` — seed-based Draft authoring (module, not a CLI)

High-level Python API for building a CapCut draft programmatically. Import and use in other scripts; do not invoke directly.

Key API:
```python
import capcut_draft as cd

# Create a new draft from a seed fixture (required — never build from scratch)
d = cd.Draft.from_seed(seed_dir, project_dir, "My Project")

d.set_canvas("9:16", 1080, 1920)           # set canvas config
local = d.copy_media("/path/to/clip.mp4")  # copy into project dir, returns local path
mid = d.add_video_material(local, dur_us, w, h, has_audio)
d.add_video_segment(mid, src_start_us, src_dur_us, target_start_us)
tmid = d.add_text_material("Caption", font_size=8.0, font_path="/path/to/font.ttf")
d.add_text_segment(tmid, target_start_us=0, dur_us=src_dur_us, y=0.36)
d.save()                                   # writes draft_info.json + draft_meta_info.json
d.register("~/Movies/CapCut/.../root_meta_info.json")  # add to CapCut project list
```

Helper: `cd.s_to_us(seconds)` → microseconds.

### `inspect_draft.py` — extract exact JSON schema of a CapCut feature

Reads a real `draft_info.json` and extracts the field names + types of a native feature's first entry. Use this before implementing any deferred feature (transitions, animations, keyframes, audio) to get the verified schema instead of guessing.

```bash
python3.11 "${CLAUDE_PLUGIN_ROOT}/skills/capcut/scripts/inspect_draft.py" \
  ~/Movies/CapCut/User\ Data/Projects/com.lveditor.draft/<project>/draft_info.json \
  <feature>
```

`<feature>` must be one of: `transition`, `animation`, `keyframe`, `audio`, `effect`.

Output is JSON with `material_array`, `count`, `fields` (key → Python type name), and `example` (first item verbatim).

### `capture_seed.py` — snapshot an empty CapCut project into a seed fixture

Reads `draft_info.json` and `draft_meta_info.json` from a real CapCut project, strips tracks/materials/IDs, and saves the clean result as a reusable seed fixture for `build_ad.py` and `Draft.from_seed()`.

```bash
# Close CapCut first, then:
python3.11 "${CLAUDE_PLUGIN_ROOT}/skills/capcut/scripts/capture_seed.py" \
  ~/Movies/CapCut/User\ Data/Projects/com.lveditor.draft/<empty-project>/ \
  --dest ~/Movies/CapCut/_seeds/empty
```

`--dest` defaults to `skills/capcut/fixtures/seed` (relative to the script). Use `--dest` to place the seed where `build_ad.py --seed` expects it.

### `media_probe.py` — ffprobe metadata + ffmpeg silence detection (module, not a CLI)

```python
import media_probe

meta = media_probe.probe("/path/to/clip.mp4")
# → {"dur_us": 15333333, "width": 1080, "height": 1920, "has_audio": True}

start_us, end_us = media_probe.silence_trim("/path/to/clip.mp4")
# runs silencedetect=noise=-35dB:d=0.2; returns (leading-silence-end, trailing-silence-start) in µs
```

Optional kwargs for `silence_trim`: `noise_db=-35` and `min_sil_s=0.2`.

---

## Schema Verification Status

Features marked VERIFIED have been extracted from a real CapCut draft and are safe to implement. Features marked UNVERIFIED must not be implemented by guessing — run `inspect_draft.py` on a reference draft that contains the feature first.

VERIFIED means a *field template* was sourced from a real draft. A `build_ad.py`-assembled draft has been confirmed to **open and play in CapCut (8.5.0)** via a build → open-in-CapCut → read-back round-trip. See **Builder output coverage** after the table for what CapCut completes automatically and where the captured canonical schema lives.

| Feature | Status | Notes |
|---|---|---|
| Video materials (`materials.videos`) | VERIFIED | Template in `capcut_draft._video_material()`; confirmed from real draft |
| Segments + trim (`source_timerange` / `target_timerange`) | VERIFIED | `_video_segment()` confirmed; surgical trim pattern documented above |
| `canvas_config` + canvas blur (`materials.canvases`) | VERIFIED | `set_canvas()` + `_canvas_material()`; blur type-swap confirmed |
| Text captions (`materials.texts` + text track) | VERIFIED | `_text_material()` + `_text_segment()` confirmed; `content` field is JSON-encoded string |
| File-link repair (`draft_info.json` + `draft_meta_info.json`) | VERIFIED | Path update pattern documented in Fixing Broken File Links section above |
| New project via seed (`Draft.from_seed()`) | VERIFIED | Field templates from a real draft via `capture_seed.py` + `Draft.from_seed()`; assembled output coverage noted below |
| Transitions (`materials.transitions`) | UNVERIFIED | Run `inspect_draft.py <draft> transition` on a draft with a real transition before implementing |
| Clip animations (`materials.material_animations`) | UNVERIFIED | Run `inspect_draft.py <draft> animation` on a draft with an in/out animation |
| Keyframes (`common_keyframes` on segments) | UNVERIFIED | Run `inspect_draft.py <draft> keyframe` on a draft with keyframe animation |
| Audio (`materials.audios`) | UNVERIFIED | Run `inspect_draft.py <draft> audio` on a draft with a music or audio track |

## Builder output coverage

Verified by a round-trip (build → open in CapCut 8.5.0 → quit → read back the canonical rewrite). What the builder writes versus what CapCut does on its own:

1. **`draft_meta_info.json` media list — empty is fine.** The builder leaves `draft_materials` value arrays empty; CapCut **also leaves them empty** (the meta file was byte-identical after the round-trip) and the draft still opened and played. Media linkage comes from `materials.videos[].path` in `draft_info.json`. (`from_seed`/`register` do stamp the meta/root_meta identity + path + `tm_*` fields per project.)
2. **Segment companions — CapCut auto-completes on open.** The builder writes a minimal segment with one `extra_material_refs` entry (its canvas). On open, CapCut expands it to a 6-ref segment and creates per-segment companion materials: `speeds`, `placeholder_infos`, `sound_channel_mappings`, `vocal_separations`, `material_colors`. The draft opens and plays without them, but for canonical-grade output (robust re-edits/exports) build them directly. The exact CapCut-written schema — 6-ref order, 50-field segment, every companion material — is captured in [`reference/canonical-video-segment.json`](reference/canonical-video-segment.json) (real CapCut output, sanitized).
3. **`register()` root_meta entry.** Writes the full real entry shape (`draft_root_path`, `draft_type`, `tm_draft_create`/`tm_draft_modified`/`tm_duration`) and keeps `draft_ids` in sync.
