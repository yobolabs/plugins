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
        return {**FORMAT_PRESETS[fmt], "target_dur_s": None}
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
    music = spec.get("music")
    if music and music.get("track"):
        music["track"] = _resolve_path(base, music["track"])
    spec.setdefault("captions", [])
    spec.setdefault("overlays", [])
    spec.setdefault("brand", {})
    return spec
