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
        # Pre-allocate video track in memory; appended to info["tracks"] lazily on first add_video_segment call.
        d._video_track = {"id": new_uuid(), "type": "video", "segments": [], "attribute": 0, "flag": 0}
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
        # Lazily register the video track the first time a segment is added.
        if self._video_track not in self.info["tracks"]:
            self.info["tracks"].insert(0, self._video_track)
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
