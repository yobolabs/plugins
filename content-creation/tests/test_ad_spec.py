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
