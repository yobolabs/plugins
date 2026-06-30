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
    with open(dest / "draft_info.json", encoding="utf-8") as f:
        info = json.load(f)
    assert info["tracks"] == []
    assert info["materials"]["videos"] == []
    assert info["duration"] == 0
    with open(dest / "draft_meta_info.json", encoding="utf-8") as f:
        meta = json.load(f)
    assert meta["draft_materials"][0]["value"] == []
