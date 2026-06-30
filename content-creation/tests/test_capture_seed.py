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


def test_capture_strips_host_identifying_values(tmp_path):
    src = tmp_path / "proj"; src.mkdir()
    plat = {"app_id": 1, "device_id": "DEAD", "hard_disk_id": "BEEF", "mac_address": "FACE", "os": "mac"}
    (src / "draft_info.json").write_text(json.dumps({
        "id": "X", "name": "real", "duration": 0, "tracks": [], "path": "/Users/someone/x",
        "materials": {"videos": []}, "platform": dict(plat), "last_modified_platform": dict(plat)}), encoding="utf-8")
    (src / "draft_meta_info.json").write_text(json.dumps({
        "draft_materials": [], "draft_id": "REALID", "draft_name": "real",
        "draft_fold_path": "/Users/someone/Movies/CapCut/x",
        "draft_root_path": "/Users/someone/Movies/CapCut",
        "tm_draft_create": 123, "tm_draft_modified": 456}), encoding="utf-8")
    dest = tmp_path / "seed"
    capture_seed.capture(str(src), str(dest))
    with open(dest / "draft_info.json", encoding="utf-8") as f:
        info = json.load(f)
    assert info["path"] == ""
    for pkey in ("platform", "last_modified_platform"):
        for hk in ("device_id", "hard_disk_id", "mac_address"):
            assert info[pkey][hk] == ""
    with open(dest / "draft_meta_info.json", encoding="utf-8") as f:
        meta = json.load(f)
    assert meta["draft_id"] == "SEED"
    assert meta["draft_name"] == "seed"
    assert meta["draft_fold_path"] == ""
    assert meta["draft_root_path"] == ""
    assert meta["tm_draft_create"] == 0 and meta["tm_draft_modified"] == 0
    # no host home path leaks anywhere
    blob = (dest / "draft_info.json").read_text() + (dest / "draft_meta_info.json").read_text()
    assert "/Users/someone" not in blob
