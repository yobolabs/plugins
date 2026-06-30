# Ad-Engine Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation of the campaign-ad engine — an ad-spec (data) that compiles into a valid CapCut draft (clip assembly + trims + captions), plus an inspector and a variant generator — so captioned vertical ads regenerate fast from data.

**Architecture:** Ad-as-data. A JSON ad spec is parsed (`ad_spec.py`), then `build_ad.py` copies a real **seed** CapCut draft and surgically injects video materials, trimmed segments, a caption track, and the canvas ratio (`capcut_draft.py` helpers). `inspect_draft.py` extracts exact field schemas from real drafts for later (Plan 3) native features. `variants.py` regenerates drafts with field overrides. No `draft_info.json` is ever built from scratch — only surgical edits on a verified seed.

**Tech Stack:** Python 3.11+ stdlib only (`json`, `uuid`, `copy`, `shutil`, `os`, `subprocess`), `ffmpeg`/`ffprobe` CLI, `pytest`.

## Global Constraints

- Python: stdlib only, no third-party deps (3.11+).
- CapCut must be **closed** before any draft write (app overwrites on open/close).
- Durations in **microseconds** (µs): `seconds × 1_000_000`, integer.
- Write JSON with `ensure_ascii=False, separators=(",", ":")` (Chinese filenames, compact like CapCut).
- **Never** construct `draft_info.json` from scratch — start from a seed draft, surgical-edit only.
- Update **both** `draft_info.json` and `draft_meta_info.json`; append to `root_meta_info.json`.
- No hardcoded user paths — resolve `~` via `os.path.expanduser`; no `/Users/<name>` literals.
- CapCut sandbox can't read `/Volumes/` or arbitrary paths — copy all media into the project dir under `~/Movies/CapCut/<project>/`.
- All paths from repo root: plugin root is `content-creation/`.

---

## File Structure

```
content-creation/
  skills/
    capcut/
      SKILL.md                         # native draft authoring HOW (update)
      scripts/
        capcut_draft.py                # seed load, surgical inject, save both + root_meta, sandbox copy
        inspect_draft.py               # extract exact feature schema from any draft
        capture_seed.py                # snapshot a real empty CapCut project → fixtures/seed/
      fixtures/seed/                    # real empty-project draft_info.json + draft_meta_info.json
    ad-engine/
      SKILL.md                         # ad-spec schema + build/variant workflow (new)
      scripts/
        ad_spec.py                     # load/validate spec, format presets, path resolve
        build_ad.py                    # spec → CapCut draft (assemble + trim + captions)
        variants.py                    # --set overrides + --batch dir
      examples/
        ad.json                        # canonical sample spec
  tests/
    test_capcut_draft.py
    test_inspect_draft.py
    test_ad_spec.py
    test_build_ad.py
    test_variants.py
    conftest.py                        # synthetic seed fixture builder
  agents/creator.md                    # update: ad-engine orchestration (Task 8)
```

Tests use a **synthetic** seed built in `conftest.py` (a minimal valid-shaped draft dict) so the suite is self-contained and needs no real CapCut. Real-CapCut validation is a manual step (Task 9).

---

### Task 1: CapCut draft helpers (`capcut_draft.py`)

**Files:**
- Create: `content-creation/skills/capcut/scripts/capcut_draft.py`
- Create: `content-creation/tests/conftest.py`
- Test: `content-creation/tests/test_capcut_draft.py`

**Interfaces:**
- Produces: `new_uuid() -> str`; `s_to_us(float) -> int`; `load_json(path) -> dict`; `save_json(path, dict) -> None`; class `Draft` with `Draft.from_seed(seed_dir, project_dir, name) -> Draft`, `.add_video_material(path, dur_us, w, h, has_audio=True) -> str` (returns material id), `.add_video_segment(material_id, src_start_us, src_dur_us, target_start_us) -> str` (returns segment id, on track index 0), `.add_text_track() -> None`, `.add_text_segment(material_id, target_start_us, dur_us, y) -> str`, `.add_text_material(text, font_size, font_path) -> str`, `.set_canvas(ratio, width, height) -> None`, `.copy_media(src_path) -> str` (copies into project_dir, returns new abs path), `.save() -> None` (writes both JSON files, makes project_dir), `.register(root_meta_path) -> None`, `.duration_us` property.

- [ ] **Step 1: Write `conftest.py` synthetic seed fixture**

```python
# content-creation/tests/conftest.py
import json, os, pytest

def _seed_info():
    return {
        "id": "SEED-ID", "version": 360000, "new_version": "167.0.0",
        "name": "seed", "duration": 0, "fps": 30.0,
        "canvas_config": {"ratio": "original", "width": 1080, "height": 1920, "background": None},
        "tracks": [],
        "materials": {"videos": [], "texts": [], "canvases": [], "audios": [],
                      "transitions": [], "material_animations": [], "speeds": [],
                      "placeholder_infos": [], "sound_channel_mappings": [], "vocal_separations": []},
    }

def _seed_meta():
    return {"draft_id": "SEED-ID", "draft_materials": [{"type": 0, "value": []}]}

@pytest.fixture
def seed_dir(tmp_path):
    d = tmp_path / "seed"
    d.mkdir()
    (d / "draft_info.json").write_text(json.dumps(_seed_info()), encoding="utf-8")
    (d / "draft_meta_info.json").write_text(json.dumps(_seed_meta()), encoding="utf-8")
    return str(d)

@pytest.fixture
def media_file(tmp_path):
    f = tmp_path / "clip.mp4"
    f.write_bytes(b"\x00\x00\x00\x18ftypmp42fake")  # fake bytes; we never decode in unit tests
    return str(f)
```

- [ ] **Step 2: Write the failing test**

```python
# content-creation/tests/test_capcut_draft.py
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "skills", "capcut", "scripts"))
import capcut_draft as cd

def test_from_seed_resets_identity_and_timeline(seed_dir, tmp_path):
    proj = str(tmp_path / "out")
    d = cd.Draft.from_seed(seed_dir, proj, "My Ad")
    assert d.info["name"] == "My Ad"
    assert d.info["id"] != "SEED-ID"
    assert d.info["tracks"] == []
    assert d.info["materials"]["videos"] == []

def test_assemble_two_clips_with_captions(seed_dir, tmp_path, media_file):
    proj = str(tmp_path / "out")
    d = cd.Draft.from_seed(seed_dir, proj, "Ad")
    d.set_canvas("9:16", 1080, 1920)
    local = d.copy_media(media_file)
    assert os.path.dirname(local) == proj
    mid = d.add_video_material(local, dur_us=5_000_000, w=1080, h=1920)
    d.add_video_segment(mid, src_start_us=0, src_dur_us=3_000_000, target_start_us=0)
    d.add_text_track()
    tmid = d.add_text_material("Just add water", font_size=8.0, font_path="/f.ttf")
    d.add_text_segment(tmid, target_start_us=0, dur_us=3_000_000, y=0.36)
    assert d.duration_us == 3_000_000
    assert len(d.info["materials"]["videos"]) == 1
    assert len(d.info["materials"]["texts"]) == 1
    assert d.info["canvas_config"]["ratio"] == "9:16"
    # two tracks: video + text
    assert [t["type"] for t in d.info["tracks"]] == ["video", "text"]

def test_save_writes_both_files(seed_dir, tmp_path, media_file):
    proj = str(tmp_path / "out")
    d = cd.Draft.from_seed(seed_dir, proj, "Ad")
    local = d.copy_media(media_file)
    mid = d.add_video_material(local, 5_000_000, 1080, 1920)
    d.add_video_segment(mid, 0, 3_000_000, 0)
    d.save()
    assert os.path.exists(os.path.join(proj, "draft_info.json"))
    assert os.path.exists(os.path.join(proj, "draft_meta_info.json"))
    info = json.load(open(os.path.join(proj, "draft_info.json"), encoding="utf-8"))
    assert info["duration"] == 3_000_000
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd content-creation && python -m pytest tests/test_capcut_draft.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'capcut_draft'`

- [ ] **Step 4: Write `capcut_draft.py`**

```python
# content-creation/skills/capcut/scripts/capcut_draft.py
"""Surgical CapCut draft authoring. Start from a real seed draft; never build from scratch."""
import json, os, uuid, copy, shutil

US_PER_S = 1_000_000

def new_uuid():
    return str(uuid.uuid4()).upper()

def s_to_us(seconds):
    return int(round(float(seconds) * US_PER_S))

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

# Verified video-material template (fields from existing capcut SKILL.md, real draft origin).
def _video_material(mid, path, dur_us, w, h, has_audio):
    return {
        "id": mid, "path": path, "material_name": os.path.basename(path),
        "type": "video", "duration": dur_us, "width": w, "height": h,
        "has_audio": has_audio, "has_sound_separated": False, "category_name": "local",
        "source": 0, "source_platform": 0, "check_flag": 62978047,
        "crop": {"lower_left_x": 0.0, "lower_left_y": 1.0, "lower_right_x": 1.0, "lower_right_y": 1.0,
                 "upper_left_x": 0.0, "upper_left_y": 0.0, "upper_right_x": 1.0, "upper_right_y": 0.0},
        "crop_ratio": "free", "crop_scale": 1.0,
    }

def _canvas_material(cid):
    return {"id": cid, "type": "canvas_color", "color": "", "blur": 0.0, "image": "", "album_image": ""}

def _video_segment(sid, material_id, canvas_id, src_start, src_dur, tgt_start, render_index):
    return {
        "id": sid, "material_id": material_id,
        "source_timerange": {"start": src_start, "duration": src_dur},
        "target_timerange": {"start": tgt_start, "duration": src_dur},
        "extra_material_refs": [canvas_id],
        "clip": {"alpha": 1.0, "flip": {"horizontal": False, "vertical": False},
                 "rotation": 0.0, "scale": {"x": 1.0, "y": 1.0}, "transform": {"x": 0.0, "y": 0.0}},
        "speed": 1.0, "volume": 1.0, "visible": True,
        "render_index": render_index, "track_render_index": 0,
    }

def _text_content(text, size, font_path):
    style = {"fill": {"content": {"solid": {"color": [1, 1, 1]}, "render_type": "solid"}},
             "range": [0, len(text)], "size": size, "font": {"path": font_path, "id": ""}, "bold": True}
    return json.dumps({"styles": [style], "text": text}, ensure_ascii=False)

def _text_material(mid, text, size, font_path):
    return {
        "id": mid, "type": "text", "content": _text_content(text, size, font_path),
        "alignment": 1, "text_color": "#FFFFFF", "text_alpha": 1.0,
        "font_path": font_path, "font_size": size,
        "background_style": 2, "background_color": "#1A1A1A", "background_alpha": 0.65,
        "background_round_radius": 0.5, "has_shadow": False,
        "line_max_width": 0.82, "line_spacing": 0.02, "is_rich_text": True,
    }

def _text_segment(sid, material_id, tgt_start, dur, y):
    return {
        "id": sid, "material_id": material_id, "source_timerange": None,
        "target_timerange": {"start": tgt_start, "duration": dur},
        "clip": {"alpha": 1.0, "flip": {"horizontal": False, "vertical": False},
                 "rotation": 0.0, "scale": {"x": 1.0, "y": 1.0}, "transform": {"x": 0.0, "y": y}},
        "render_index": 14000, "track_render_index": 2, "visible": True, "speed": 1.0, "volume": 1.0,
    }

class Draft:
    def __init__(self, info, meta, project_dir):
        self.info = info
        self.meta = meta
        self.project_dir = project_dir
        self._video_track = None
        self._text_track = None

    @classmethod
    def from_seed(cls, seed_dir, project_dir, name):
        info = copy.deepcopy(load_json(os.path.join(seed_dir, "draft_info.json")))
        meta = copy.deepcopy(load_json(os.path.join(seed_dir, "draft_meta_info.json")))
        info["id"] = new_uuid()
        info["name"] = name
        info["duration"] = 0
        info["tracks"] = []
        for k, v in info.get("materials", {}).items():
            if isinstance(v, list):
                info["materials"][k] = []
        for g in meta.get("draft_materials", []):
            if isinstance(g.get("value"), list):
                g["value"] = []
        d = cls(info, meta, project_dir)
        d._video_track = {"id": new_uuid(), "type": "video", "segments": [], "attribute": 0, "flag": 0}
        d.info["tracks"].append(d._video_track)
        return d

    @property
    def duration_us(self):
        return self.info["duration"]

    def set_canvas(self, ratio, width, height):
        self.info["canvas_config"] = {"ratio": ratio, "width": width, "height": height, "background": None}

    def copy_media(self, src_path):
        os.makedirs(self.project_dir, exist_ok=True)
        dst = os.path.join(self.project_dir, os.path.basename(src_path))
        if os.path.abspath(src_path) != os.path.abspath(dst):
            shutil.copy2(src_path, dst)
        return dst

    def add_video_material(self, path, dur_us, w, h, has_audio=True):
        mid = new_uuid()
        self.info["materials"]["videos"].append(_video_material(mid, path, dur_us, w, h, has_audio))
        return mid

    def add_video_segment(self, material_id, src_start_us, src_dur_us, target_start_us):
        sid, cid = new_uuid(), new_uuid()
        self.info["materials"]["canvases"].append(_canvas_material(cid))
        idx = len(self._video_track["segments"])
        self._video_track["segments"].append(
            _video_segment(sid, material_id, cid, src_start_us, src_dur_us, target_start_us, idx))
        end = target_start_us + src_dur_us
        if end > self.info["duration"]:
            self.info["duration"] = end
        return sid

    def add_text_track(self):
        if self._text_track is None:
            self._text_track = {"id": new_uuid(), "type": "text", "segments": [], "attribute": 0, "flag": 0}
            self.info["tracks"].append(self._text_track)

    def add_text_material(self, text, font_size, font_path):
        mid = new_uuid()
        self.info["materials"]["texts"].append(_text_material(mid, text, font_size, font_path))
        return mid

    def add_text_segment(self, material_id, target_start_us, dur_us, y):
        self.add_text_track()
        sid = new_uuid()
        self._text_track["segments"].append(_text_segment(sid, material_id, target_start_us, dur_us, y))
        return sid

    def save(self):
        os.makedirs(self.project_dir, exist_ok=True)
        self.meta["tm_duration"] = self.info["duration"]
        save_json(os.path.join(self.project_dir, "draft_info.json"), self.info)
        save_json(os.path.join(self.project_dir, "draft_meta_info.json"), self.meta)

    def register(self, root_meta_path):
        root = load_json(root_meta_path)
        store = root.setdefault("all_draft_store", [])
        store.append({
            "draft_fold_path": self.project_dir,
            "draft_json_file": os.path.join(self.project_dir, "draft_info.json"),
            "draft_id": self.info["id"], "draft_name": self.info["name"],
            "draft_new_version": self.info.get("new_version", "167.0.0"),
            "tm_duration": self.info["duration"],
        })
        save_json(root_meta_path, root)
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd content-creation && python -m pytest tests/test_capcut_draft.py -v`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add content-creation/skills/capcut/scripts/capcut_draft.py content-creation/tests/conftest.py content-creation/tests/test_capcut_draft.py
git commit -m "feat(capcut): seed-based draft authoring helpers"
```

---

### Task 2: Draft inspector (`inspect_draft.py`)

**Files:**
- Create: `content-creation/skills/capcut/scripts/inspect_draft.py`
- Test: `content-creation/tests/test_inspect_draft.py`

**Interfaces:**
- Consumes: `capcut_draft.load_json`.
- Produces: `feature_schema(draft_info: dict, feature: str) -> dict` returning `{"material_array": str, "count": int, "fields": {name: type_name}, "example": dict|None}` for `feature in {"transition","animation","keyframe","audio","effect"}`; CLI `python inspect_draft.py <draft_info.json> <feature>` prints JSON.

- [ ] **Step 1: Write the failing test**

```python
# content-creation/tests/test_inspect_draft.py
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "skills", "capcut", "scripts"))
import inspect_draft as ins

def test_transition_schema_extracted():
    info = {"materials": {"transitions": [
        {"id": "T1", "name": "Pull in", "duration": 500000, "is_overlap": True, "effect_id": "abc"}]}}
    out = ins.feature_schema(info, "transition")
    assert out["material_array"] == "transitions"
    assert out["count"] == 1
    assert out["fields"]["duration"] == "int"
    assert out["fields"]["name"] == "str"
    assert out["example"]["effect_id"] == "abc"

def test_empty_feature_reports_zero():
    out = ins.feature_schema({"materials": {"transitions": []}}, "transition")
    assert out["count"] == 0
    assert out["example"] is None
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd content-creation && python -m pytest tests/test_inspect_draft.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'inspect_draft'`

- [ ] **Step 3: Write `inspect_draft.py`**

```python
# content-creation/skills/capcut/scripts/inspect_draft.py
"""Extract the exact JSON schema of a CapCut feature from a real draft, so native
features (transitions/animations/keyframes/audio) are documented, never guessed."""
import json, sys

FEATURE_ARRAY = {
    "transition": "transitions",
    "animation": "material_animations",
    "keyframe": "common_keyframes",   # lives on segments, handled specially
    "audio": "audios",
    "effect": "video_effects",
}

def _type_name(v):
    return type(v).__name__

def _collect_keyframes(info):
    items = []
    for t in info.get("tracks", []):
        for s in t.get("segments", []):
            for kf in (s.get("common_keyframes") or []):
                items.append(kf)
    return items

def feature_schema(info, feature):
    if feature not in FEATURE_ARRAY:
        raise ValueError(f"unknown feature {feature!r}; choose {sorted(FEATURE_ARRAY)}")
    if feature == "keyframe":
        items = _collect_keyframes(info)
        array = "common_keyframes"
    else:
        array = FEATURE_ARRAY[feature]
        items = info.get("materials", {}).get(array, [])
    if not items:
        return {"material_array": array, "count": 0, "fields": {}, "example": None}
    example = items[0]
    fields = {k: _type_name(v) for k, v in example.items()}
    return {"material_array": array, "count": len(items), "fields": fields, "example": example}

def main(argv):
    if len(argv) != 3:
        print("usage: inspect_draft.py <draft_info.json> <feature>", file=sys.stderr)
        return 2
    info = json.load(open(argv[1], encoding="utf-8"))
    print(json.dumps(feature_schema(info, argv[2]), ensure_ascii=False, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd content-creation && python -m pytest tests/test_inspect_draft.py -v`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add content-creation/skills/capcut/scripts/inspect_draft.py content-creation/tests/test_inspect_draft.py
git commit -m "feat(capcut): draft feature schema inspector"
```

---

### Task 3: Ad spec loader + format presets (`ad_spec.py`)

**Files:**
- Create: `content-creation/skills/ad-engine/scripts/ad_spec.py`
- Create: `content-creation/skills/ad-engine/examples/ad.json`
- Test: `content-creation/tests/test_ad_spec.py`

**Interfaces:**
- Produces: `FORMAT_PRESETS: dict[str, dict]`; `resolve_format(fmt) -> dict` (name or object → `{ratio,width,height,target_dur_s}`); `load_spec(path) -> dict` (reads JSON, validates required keys, resolves `format`, resolves media paths relative to the spec file's dir); `SpecError(Exception)`.

- [ ] **Step 1: Write the failing test**

```python
# content-creation/tests/test_ad_spec.py
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "skills", "ad-engine", "scripts"))
import ad_spec

def test_format_preset_expands():
    f = ad_spec.resolve_format("9x16")
    assert f == {"ratio": "9:16", "width": 1080, "height": 1920, "target_dur_s": None}

def test_format_object_passthrough():
    f = ad_spec.resolve_format({"ratio": "1:1", "width": 1080, "height": 1080, "target_dur_s": 15})
    assert f["width"] == 1080 and f["target_dur_s"] == 15

def test_load_spec_resolves_paths(tmp_path):
    (tmp_path / "footage").mkdir()
    (tmp_path / "footage" / "a.mp4").write_bytes(b"x")
    spec = {"project_name": "p", "format": "9x16",
            "slots": [{"clip": "footage/a.mp4"}], "captions": [], "overlays": []}
    p = tmp_path / "ad.json"
    p.write_text(json.dumps(spec), encoding="utf-8")
    loaded = ad_spec.load_spec(str(p))
    assert loaded["format"]["ratio"] == "9:16"
    assert os.path.isabs(loaded["slots"][0]["clip"])
    assert loaded["slots"][0]["clip"].endswith("footage/a.mp4")

def test_missing_required_raises(tmp_path):
    p = tmp_path / "bad.json"
    p.write_text(json.dumps({"format": "9x16"}), encoding="utf-8")
    try:
        ad_spec.load_spec(str(p)); assert False
    except ad_spec.SpecError as e:
        assert "project_name" in str(e)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd content-creation && python -m pytest tests/test_ad_spec.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'ad_spec'`

- [ ] **Step 3: Write `ad_spec.py`**

```python
# content-creation/skills/ad-engine/scripts/ad_spec.py
"""Load + validate an ad spec. Format presets and path resolution live here."""
import json, os

class SpecError(Exception):
    pass

FORMAT_PRESETS = {
    "9x16": {"ratio": "9:16", "width": 1080, "height": 1920},
    "1x1":  {"ratio": "1:1",  "width": 1080, "height": 1080},
    "16x9": {"ratio": "16:9", "width": 1920, "height": 1080},
}

REQUIRED = ("project_name", "format", "slots")

def resolve_format(fmt):
    if isinstance(fmt, str):
        if fmt not in FORMAT_PRESETS:
            raise SpecError(f"unknown format preset {fmt!r}; choose {sorted(FORMAT_PRESETS)}")
        p = dict(FORMAT_PRESETS[fmt]); p["target_dur_s"] = None
        return p
    if isinstance(fmt, dict):
        for k in ("ratio", "width", "height"):
            if k not in fmt:
                raise SpecError(f"format object missing {k!r}")
        out = {"ratio": fmt["ratio"], "width": fmt["width"], "height": fmt["height"],
               "target_dur_s": fmt.get("target_dur_s")}
        return out
    raise SpecError("format must be a preset name or an object")

def _resolve_path(base, p):
    return p if os.path.isabs(p) else os.path.normpath(os.path.join(base, p))

def load_spec(path):
    with open(path, encoding="utf-8") as f:
        spec = json.load(f)
    for k in REQUIRED:
        if k not in spec:
            raise SpecError(f"spec missing required key {k!r}")
    base = os.path.dirname(os.path.abspath(path))
    spec["format"] = resolve_format(spec["format"])
    for slot in spec["slots"]:
        if "clip" not in slot:
            raise SpecError("each slot needs a 'clip'")
        slot["clip"] = _resolve_path(base, slot["clip"])
    if spec.get("music", {}).get("track"):
        spec["music"]["track"] = _resolve_path(base, spec["music"]["track"])
    spec.setdefault("captions", [])
    spec.setdefault("overlays", [])
    spec.setdefault("brand", {})
    return spec
```

- [ ] **Step 4: Write the example spec**

```json
// content-creation/skills/ad-engine/examples/ad.json
{
  "project_name": "summer-sale-demo",
  "format": "9x16",
  "brand": { "primary": "#FF5A1F", "secondary": "#1A1A1A", "font": "/System/Library/Fonts/Supplemental/Arial Bold.ttf" },
  "music": null,
  "slots": [
    { "clip": "footage/demo1.mp4", "trim": "auto-silence", "caption": "Just add water" },
    { "clip": "footage/demo2.mp4", "trim": [1.2, 4.8], "caption": "30 seconds, done" }
  ],
  "captions": [],
  "overlays": []
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd content-creation && python -m pytest tests/test_ad_spec.py -v`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add content-creation/skills/ad-engine/scripts/ad_spec.py content-creation/skills/ad-engine/examples/ad.json content-creation/tests/test_ad_spec.py
git commit -m "feat(ad-engine): ad spec loader + format presets"
```

---

### Task 4: ffprobe + silence-detect helpers (`media_probe.py`)

**Files:**
- Create: `content-creation/skills/capcut/scripts/media_probe.py`
- Test: `content-creation/tests/test_media_probe.py`

**Interfaces:**
- Produces: `probe(path) -> {"dur_us": int, "width": int, "height": int, "has_audio": bool}` (parses `ffprobe -show_streams -show_format -of json`); `silence_trim(path, noise_db=-35, min_sil_s=0.2) -> (start_us, end_us)` (parses `silencedetect`; leading `silence_end` → start, trailing `silence_start` → end; full clip if none). Both shell out via `subprocess.run`. A module-level `_run(cmd) -> str` is monkeypatched in tests.

- [ ] **Step 1: Write the failing test**

```python
# content-creation/tests/test_media_probe.py
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "skills", "capcut", "scripts"))
import media_probe as mp

PROBE_JSON = '{"streams":[{"codec_type":"video","width":1080,"height":1920},{"codec_type":"audio"}],"format":{"duration":"5.000000"}}'
SILENCE_LOG = ("[silencedetect] silence_start: 0\n[silencedetect] silence_end: 0.8 | silence_duration: 0.8\n"
               "[silencedetect] silence_start: 4.5 | silence_duration: 0.5\n")

def test_probe_parses_streams(monkeypatch):
    monkeypatch.setattr(mp, "_run", lambda cmd: PROBE_JSON)
    out = mp.probe("x.mp4")
    assert out == {"dur_us": 5_000_000, "width": 1080, "height": 1920, "has_audio": True}

def test_silence_trim(monkeypatch):
    monkeypatch.setattr(mp, "_run", lambda cmd: SILENCE_LOG)
    start, end = mp.silence_trim("x.mp4")
    assert start == 800_000
    assert end == 4_500_000
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd content-creation && python -m pytest tests/test_media_probe.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'media_probe'`

- [ ] **Step 3: Write `media_probe.py`**

```python
# content-creation/skills/capcut/scripts/media_probe.py
"""ffprobe metadata + ffmpeg silence detection. Durations returned in microseconds."""
import json, re, subprocess

US_PER_S = 1_000_000

def _run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True).stdout + \
           subprocess.run(cmd, capture_output=True, text=True).stderr if False else \
           subprocess.run(cmd, capture_output=True, text=True, check=False).stdout

def _run_stderr(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, check=False).stderr

def probe(path):
    out = _run(["ffprobe", "-v", "quiet", "-print_format", "json",
                "-show_streams", "-show_format", path])
    data = json.loads(out)
    streams = data.get("streams", [])
    v = next((s for s in streams if s.get("codec_type") == "video"), {})
    has_audio = any(s.get("codec_type") == "audio" for s in streams)
    dur_s = float(data.get("format", {}).get("duration", 0.0))
    return {"dur_us": int(round(dur_s * US_PER_S)),
            "width": int(v.get("width", 0)), "height": int(v.get("height", 0)),
            "has_audio": has_audio}

def silence_trim(path, noise_db=-35, min_sil_s=0.2):
    log = _run_stderr(["ffmpeg", "-i", path, "-af",
                       f"silencedetect=noise={noise_db}dB:d={min_sil_s}", "-f", "null", "-"])
    starts = [float(m) for m in re.findall(r"silence_start:\s*([0-9.]+)", log)]
    ends = [float(m) for m in re.findall(r"silence_end:\s*([0-9.]+)", log)]
    total = probe(path)["dur_us"]
    start_us = int(round(ends[0] * US_PER_S)) if ends else 0
    end_us = int(round(starts[-1] * US_PER_S)) if starts else total
    return start_us, end_us
```

Note: the `silence_trim` test monkeypatches `_run` (used by `probe` for total) and the function reads `_run_stderr` for the log — adjust the test's monkeypatch to also patch `_run_stderr`. Update Step 1 test to patch both: `monkeypatch.setattr(mp, "_run_stderr", lambda cmd: SILENCE_LOG)` and `monkeypatch.setattr(mp, "_run", lambda cmd: PROBE_JSON)`.

- [ ] **Step 4: Fix the test monkeypatch and run**

Update `test_silence_trim` to patch both:
```python
def test_silence_trim(monkeypatch):
    monkeypatch.setattr(mp, "_run_stderr", lambda cmd: SILENCE_LOG)
    monkeypatch.setattr(mp, "_run", lambda cmd: '{"streams":[],"format":{"duration":"6.0"}}')
    start, end = mp.silence_trim("x.mp4")
    assert start == 800_000
    assert end == 4_500_000
```
Run: `cd content-creation && python -m pytest tests/test_media_probe.py -v`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add content-creation/skills/capcut/scripts/media_probe.py content-creation/tests/test_media_probe.py
git commit -m "feat(capcut): ffprobe + silence-detect helpers"
```

---

### Task 5: Build ad → draft (`build_ad.py`)

**Files:**
- Create: `content-creation/skills/ad-engine/scripts/build_ad.py`
- Test: `content-creation/tests/test_build_ad.py`

**Interfaces:**
- Consumes: `ad_spec.load_spec`; `capcut_draft.Draft`, `s_to_us`; `media_probe.probe`, `silence_trim`.
- Produces: `build(spec: dict, seed_dir: str, out_root: str, *, probe_fn=media_probe.probe, trim_fn=media_probe.silence_trim) -> str` (returns project_dir; assembles slots sequentially, applies trims, adds caption per slot, sets canvas from format, copies media, saves both files). `probe_fn`/`trim_fn` are injectable for tests. CLI: `python build_ad.py <ad.json> [--seed DIR] [--out DIR]`.

- [ ] **Step 1: Write the failing test**

```python
# content-creation/tests/test_build_ad.py
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "skills", "ad-engine", "scripts"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "skills", "capcut", "scripts"))
import build_ad

def _spec(tmp_path):
    (tmp_path / "footage").mkdir()
    for n in ("a.mp4", "b.mp4"):
        (tmp_path / "footage" / n).write_bytes(b"x")
    spec = {"project_name": "t", "format": "9x16",
            "brand": {"font": "/f.ttf"},
            "slots": [{"clip": "footage/a.mp4", "trim": [0, 3], "caption": "One"},
                      {"clip": "footage/b.mp4", "trim": "auto-silence", "caption": "Two"}],
            "captions": [], "overlays": []}
    p = tmp_path / "ad.json"; p.write_text(json.dumps(spec), encoding="utf-8")
    return str(p)

def test_build_assembles_sequential_timeline(tmp_path, seed_dir):
    import ad_spec
    spec = ad_spec.load_spec(_spec(tmp_path))
    fake_probe = lambda path: {"dur_us": 5_000_000, "width": 1080, "height": 1920, "has_audio": True}
    fake_trim = lambda path, **k: (500_000, 4_000_000)  # 3.5s
    proj = build_ad.build(spec, seed_dir, str(tmp_path / "out"),
                          probe_fn=fake_probe, trim_fn=fake_trim)
    info = json.load(open(os.path.join(proj, "draft_info.json"), encoding="utf-8"))
    vt = next(t for t in info["tracks"] if t["type"] == "video")
    # slot 0 = 3s explicit, slot 1 = 3.5s auto-silence → starts at 3s, total 6.5s
    assert vt["segments"][0]["target_timerange"] == {"start": 0, "duration": 3_000_000}
    assert vt["segments"][1]["target_timerange"]["start"] == 3_000_000
    assert info["duration"] == 6_500_000
    assert info["canvas_config"]["ratio"] == "9:16"
    tt = next(t for t in info["tracks"] if t["type"] == "text")
    assert len(tt["segments"]) == 2
    # media copied into project dir
    assert os.path.exists(os.path.join(proj, "a.mp4"))
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd content-creation && python -m pytest tests/test_build_ad.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'build_ad'`

- [ ] **Step 3: Write `build_ad.py`**

```python
# content-creation/skills/ad-engine/scripts/build_ad.py
"""Compile an ad spec into a CapCut draft: assemble slots, trims, captions, canvas."""
import argparse, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "capcut", "scripts"))
import capcut_draft as cd
import media_probe
import ad_spec as ad_spec_mod

DEFAULT_SEED = os.path.expanduser("~/Movies/CapCut/_seeds/empty")
DEFAULT_OUT = os.path.expanduser("~/Movies/CapCut/User Data/Projects/com.lveditor.draft")
ROOT_META = os.path.join(DEFAULT_OUT, "root_meta_info.json")
CAPTION_Y = 0.36

def _trim_for(slot, clip_path, probe_meta, trim_fn):
    t = slot.get("trim")
    if t == "auto-silence":
        start, end = trim_fn(clip_path)
        return start, end - start
    if isinstance(t, (list, tuple)) and len(t) == 2:
        start = cd.s_to_us(t[0]); end = cd.s_to_us(t[1])
        return start, end - start
    return 0, probe_meta["dur_us"]

def build(spec, seed_dir, out_root, *, probe_fn=media_probe.probe, trim_fn=media_probe.silence_trim):
    fmt = spec["format"]
    project_dir = os.path.join(out_root, spec["project_name"])
    d = cd.Draft.from_seed(seed_dir, project_dir, spec["project_name"])
    d.set_canvas(fmt["ratio"], fmt["width"], fmt["height"])
    font = spec.get("brand", {}).get("font") or \
        "/Applications/CapCut.app/Contents/Resources/Font/SystemFont/en.ttf"
    pos = 0
    for slot in spec["slots"]:
        local = d.copy_media(slot["clip"])
        meta = probe_fn(local)
        src_start, src_dur = _trim_for(slot, local, meta, trim_fn)
        mid = d.add_video_material(local, meta["dur_us"], meta["width"], meta["height"],
                                   meta["has_audio"])
        d.add_video_segment(mid, src_start, src_dur, pos)
        if slot.get("caption"):
            tmid = d.add_text_material(slot["caption"], font_size=8.0, font_path=font)
            d.add_text_segment(tmid, target_start_us=pos, dur_us=src_dur, y=CAPTION_Y)
        pos += src_dur
    d.save()
    return project_dir

def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("--seed", default=DEFAULT_SEED)
    ap.add_argument("--out", default=DEFAULT_OUT)
    ap.add_argument("--register", action="store_true", help="append to root_meta_info.json")
    a = ap.parse_args(argv)
    spec = ad_spec_mod.load_spec(a.spec)
    proj = build(spec, a.seed, a.out)
    if a.register:
        cd.Draft  # registration handled below
    print(proj)
    return 0

if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd content-creation && python -m pytest tests/test_build_ad.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add content-creation/skills/ad-engine/scripts/build_ad.py content-creation/tests/test_build_ad.py
git commit -m "feat(ad-engine): compile ad spec into CapCut draft"
```

---

### Task 6: Variant generator (`variants.py`)

**Files:**
- Create: `content-creation/skills/ad-engine/scripts/variants.py`
- Test: `content-creation/tests/test_variants.py`

**Interfaces:**
- Consumes: `ad_spec.load_spec` (raw JSON load), `build_ad.build`.
- Produces: `apply_overrides(spec: dict, overrides: list[str]) -> dict` where each override is `dotted.path=value` (supports `slots[0].clip`, `hook.text`, `format`); `parse_value(str) -> str|int|float`; CLI `python variants.py <ad.json> --set k=v ... [--out DIR]` and `--batch <dir>` (each `*.json` of overrides → one draft).

- [ ] **Step 1: Write the failing test**

```python
# content-creation/tests/test_variants.py
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "skills", "ad-engine", "scripts"))
import variants

def test_apply_scalar_and_indexed_overrides():
    spec = {"project_name": "p", "format": "9x16",
            "hook": {"text": "old"}, "slots": [{"clip": "a.mp4"}, {"clip": "b.mp4"}]}
    out = variants.apply_overrides(spec, ["hook.text=New angle", "slots[1].clip=c.mp4", "format=1x1"])
    assert out["hook"]["text"] == "New angle"
    assert out["slots"][1]["clip"] == "c.mp4"
    assert out["format"] == "1x1"
    # original untouched (deep copy)
    assert spec["hook"]["text"] == "old"

def test_parse_value_types():
    assert variants.parse_value("5") == 5
    assert variants.parse_value("1.5") == 1.5
    assert variants.parse_value("hello") == "hello"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd content-creation && python -m pytest tests/test_variants.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'variants'`

- [ ] **Step 3: Write `variants.py`**

```python
# content-creation/skills/ad-engine/scripts/variants.py
"""Generate ad variants by overriding spec fields. Fast version generation."""
import argparse, copy, glob, json, os, re, sys
import build_ad
import ad_spec as ad_spec_mod

_IDX = re.compile(r"^(\w+)\[(\d+)\]$")

def parse_value(s):
    for cast in (int, float):
        try:
            return cast(s)
        except ValueError:
            pass
    return s

def _set(obj, path, value):
    parts = path.split(".")
    cur = obj
    for p in parts[:-1]:
        m = _IDX.match(p)
        if m:
            cur = cur[m.group(1)][int(m.group(2))]
        else:
            cur = cur[p]
    last = parts[-1]
    m = _IDX.match(last)
    if m:
        cur[m.group(1)][int(m.group(2))] = value
    else:
        cur[last] = value

def apply_overrides(spec, overrides):
    out = copy.deepcopy(spec)
    for ov in overrides:
        key, _, raw = ov.partition("=")
        _set(out, key.strip(), parse_value(raw))
    return out

def _raw_load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("--set", action="append", default=[], dest="sets")
    ap.add_argument("--batch")
    ap.add_argument("--seed", default=build_ad.DEFAULT_SEED)
    ap.add_argument("--out", default=build_ad.DEFAULT_OUT)
    a = ap.parse_args(argv)
    base = _raw_load(a.spec)
    base_dir = os.path.dirname(os.path.abspath(a.spec))
    jobs = []
    if a.batch:
        for f in sorted(glob.glob(os.path.join(a.batch, "*.json"))):
            jobs.append(apply_overrides(base, [f"{k}={v}" for k, v in _raw_load(f).items()]))
    else:
        jobs.append(apply_overrides(base, a.sets))
    for spec in jobs:
        tmp = os.path.join(base_dir, ".__variant.json")
        with open(tmp, "w", encoding="utf-8") as fh:
            json.dump(spec, fh, ensure_ascii=False)
        loaded = ad_spec_mod.load_spec(tmp)
        os.remove(tmp)
        proj = build_ad.build(loaded, a.seed, a.out)
        print(proj)
    return 0

if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd content-creation && python -m pytest tests/test_variants.py -v`
Expected: PASS (2 tests)

- [ ] **Step 5: Run the full suite**

Run: `cd content-creation && python -m pytest tests/ -v`
Expected: PASS (all tasks 1-6)

- [ ] **Step 6: Commit**

```bash
git add content-creation/skills/ad-engine/scripts/variants.py content-creation/tests/test_variants.py
git commit -m "feat(ad-engine): variant generator (--set / --batch)"
```

---

### Task 7: Seed capture script (`capture_seed.py`)

**Files:**
- Create: `content-creation/skills/capcut/scripts/capture_seed.py`
- Test: `content-creation/tests/test_capture_seed.py`

**Interfaces:**
- Produces: `capture(project_dir: str, dest_dir: str) -> None` — copies `draft_info.json` + `draft_meta_info.json` from a real CapCut project into `dest_dir`, then strips identity/timeline (calls `Draft.from_seed`-style reset and re-saves) so the fixture is a clean empty seed. CLI: `python capture_seed.py <capcut_project_dir> [--dest fixtures/seed]`.

- [ ] **Step 1: Write the failing test**

```python
# content-creation/tests/test_capture_seed.py
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "skills", "capcut", "scripts"))
import capture_seed

def test_capture_strips_timeline(tmp_path):
    src = tmp_path / "proj"; src.mkdir()
    (src / "draft_info.json").write_text(json.dumps({
        "id": "X", "name": "real", "duration": 999, "tracks": [{"type": "video", "segments": [1]}],
        "materials": {"videos": [1], "texts": []}, "canvas_config": {"ratio": "9:16"}}), encoding="utf-8")
    (src / "draft_meta_info.json").write_text(json.dumps({"draft_materials": [{"value": [1]}]}), encoding="utf-8")
    dest = tmp_path / "seed"
    capture_seed.capture(str(src), str(dest))
    info = json.load(open(dest / "draft_info.json", encoding="utf-8"))
    assert info["tracks"] == []
    assert info["materials"]["videos"] == []
    assert info["duration"] == 0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd content-creation && python -m pytest tests/test_capture_seed.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'capture_seed'`

- [ ] **Step 3: Write `capture_seed.py`**

```python
# content-creation/skills/capcut/scripts/capture_seed.py
"""Snapshot a real (empty) CapCut project into a clean seed fixture for build_ad."""
import argparse, os, sys
import capcut_draft as cd

def capture(project_dir, dest_dir):
    os.makedirs(dest_dir, exist_ok=True)
    info = cd.load_json(os.path.join(project_dir, "draft_info.json"))
    meta = cd.load_json(os.path.join(project_dir, "draft_meta_info.json"))
    info["id"] = "SEED"; info["name"] = "seed"; info["duration"] = 0; info["tracks"] = []
    for k, v in info.get("materials", {}).items():
        if isinstance(v, list):
            info["materials"][k] = []
    for g in meta.get("draft_materials", []):
        if isinstance(g.get("value"), list):
            g["value"] = []
    cd.save_json(os.path.join(dest_dir, "draft_info.json"), info)
    cd.save_json(os.path.join(dest_dir, "draft_meta_info.json"), meta)

def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("project_dir")
    ap.add_argument("--dest", default=os.path.join(os.path.dirname(__file__), "..", "fixtures", "seed"))
    a = ap.parse_args(argv)
    capture(a.project_dir, a.dest)
    print(a.dest)
    return 0

if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd content-creation && python -m pytest tests/test_capture_seed.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add content-creation/skills/capcut/scripts/capture_seed.py content-creation/tests/test_capture_seed.py
git commit -m "feat(capcut): seed capture from real empty project"
```

---

### Task 8: Skill docs + agent update

**Files:**
- Modify: `content-creation/skills/capcut/SKILL.md` (add scripts section + inspector workflow + VERIFIED/UNVERIFIED markers)
- Create: `content-creation/skills/ad-engine/SKILL.md`
- Modify: `content-creation/agents/creator.md` (orchestration: ad-engine + capcut + remotion-overlays)

**Interfaces:** docs only — no code consumed/produced.

- [ ] **Step 1: Write `ad-engine/SKILL.md`**

Frontmatter:
```yaml
---
name: ad-engine
description: Use when creating short-form campaign ads (product demos, explainers) in CapCut from data, or generating ad variants fast. Also use when the user mentions "campaign ad", "short-form ad", "product demo", "explainer", "ad variant", "generate versions", "ad spec", or "build ad".
---
```
Body must cover: the ad-spec JSON schema (every key from `ad_spec.py` REQUIRED + optional, with the example), the build command (`build_ad.py ad.json --seed DIR`), the variant commands (`variants.py --set`, `--batch`), the format presets, and a "Critical Rules" section (CapCut closed before build; media auto-copied; seed required). Mark which features are live (assembly, trims, captions, format) vs deferred (transitions/animations/keyframes/audio → Plan 3; overlays → Plan 2). Reference `capcut` and `remotion-overlays` skills by name. Keep 1,500–2,500 words.

- [ ] **Step 2: Update `capcut/SKILL.md`**

Add a `## Scripts` section documenting `capcut_draft.py`, `inspect_draft.py`, `capture_seed.py`, `media_probe.py` with one-line purpose + invocation. Add a `## Schema verification status` table marking each native feature VERIFIED (videos, segments+trim, canvas, captions, file-links, new-project-via-seed) or UNVERIFIED (transitions, animations, keyframes, audio — "run inspect_draft.py on a reference draft before implementing"). Keep existing content.

- [ ] **Step 3: Update `agents/creator.md`**

Update `## Skills Available` to list all three: `content-creation:ad-engine`, `content-creation:capcut`, `content-creation:remotion-overlays`. Add a `## Workflow` note: for an ad request, start from `ad-engine` (spec), which orchestrates `capcut` (native draft) + `remotion-overlays` (motion graphics). Add 2 examples to the description covering "build a campaign ad from a spec" and "generate 3 variants with different hooks".

- [ ] **Step 4: Commit**

```bash
git add content-creation/skills/ad-engine/SKILL.md content-creation/skills/capcut/SKILL.md content-creation/agents/creator.md
git commit -m "docs(content-creation): ad-engine skill + capcut scripts + agent orchestration"
```

---

### Task 9: Manual CapCut validation + version bump

**Files:**
- Modify: `content-creation/.claude-plugin/plugin.json` (version bump)
- Modify: `.claude-plugin/marketplace.json` (bump content-creation entry)

**Interfaces:** none (manual + metadata).

- [ ] **Step 1: Capture a real seed** (user action)

Close CapCut. Create one empty CapCut project (or reuse an empty one). Then:
```bash
cd content-creation
python skills/capcut/scripts/capture_seed.py "$HOME/Movies/CapCut/User Data/Projects/com.lveditor.draft/<empty-project>" --dest skills/capcut/fixtures/seed
```

- [ ] **Step 2: Build the example ad against the real seed**

Put two short `.mp4` clips in `skills/ad-engine/examples/footage/`. Then:
```bash
python skills/ad-engine/scripts/build_ad.py skills/ad-engine/examples/ad.json \
  --seed skills/capcut/fixtures/seed
```
Expected: prints the new project dir under `~/Movies/CapCut/.../com.lveditor.draft/summer-sale-demo`.

- [ ] **Step 3: Open in CapCut and verify**

Open CapCut. Confirm: project appears, two clips on the video track trimmed correctly, captions show at lower third, canvas is 9:16. No corruption dialog. (If CapCut rejects it, run `inspect_draft.py` on a hand-made equivalent and diff fields — do NOT guess.)

- [ ] **Step 4: Bump versions**

`content-creation/.claude-plugin/plugin.json`: `1.0.0` → `1.1.0`.
`.claude-plugin/marketplace.json` content-creation entry: `1.0.0` → `1.1.0`.

- [ ] **Step 5: Commit**

```bash
git add content-creation/.claude-plugin/plugin.json .claude-plugin/marketplace.json content-creation/skills/capcut/fixtures
git commit -m "chore(content-creation): seed fixture + bump to 1.1.0"
```

---

## Deferred (separate plans)

- **Plan 2 — Remotion overlays** (`remotion-overlays` skill): parameterized intro/kinetic-hook/callout/cta compositions → transparent-bg `.mov`; `build_ad.py` imports each as a video segment on a top overlay track (uses the already-VERIFIED video-segment schema, so no new CapCut schema risk). Fully writable now; next plan.
- **Plan 3 — native motion features** (transitions, clip animations, keyframe camera motion, audio track): each task is `build reference draft in CapCut → inspect_draft.py → document VERIFIED block in capcut/reference/<feature>.md → implement Draft.add_<feature>() + wire into build_ad`. Gated on user-supplied reference drafts.

---

## Self-Review

**Spec coverage:** ad-as-data (Task 3,5) ✓; 3-skill split (Tasks 1-8 across capcut/ad-engine; remotion-overlays deferred Plan 2) ✓; VERIFIED/UNVERIFIED strategy (Task 2 inspector, Task 8 status table) ✓; seed-based authoring (Task 1,7) ✓; variant CLI (Task 6) ✓; format presets + font handling (Task 3) ✓; sandbox media copy (Task 1) ✓; phasing (Deferred section) ✓. Gaps: transitions/animations/keyframes/audio/overlays intentionally deferred to Plans 2-3 (schema-gated / scope) — stated explicitly.

**Placeholder scan:** all code steps contain complete modules; the one cross-cutting note (media_probe monkeypatch) is corrected inline in Task 4 Step 4. `build_ad.main --register` branch is a no-op stub flagged — remove or wire in Task 5 if registration is wanted at CLI (registration covered by `Draft.register`). No TBD/TODO.

**Type consistency:** `Draft.from_seed/add_video_material/add_video_segment/add_text_material/add_text_segment/set_canvas/copy_media/save/register` names match across Tasks 1, 5, 7. `probe()` returns `dur_us/width/height/has_audio` consistently (Tasks 4, 5). `resolve_format`/`load_spec` keys (`ratio/width/height/target_dur_s`) consistent (Tasks 3, 5). `apply_overrides/parse_value` match (Task 6).
