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
