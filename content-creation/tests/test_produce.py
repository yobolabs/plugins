import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "skills", "ad-engine", "scripts"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "skills", "capcut", "scripts"))
import produce
import ad_spec


def _spec(tmp_path):
    (tmp_path / "footage").mkdir()
    for n in ("a.mp4", "b.mp4"):
        (tmp_path / "footage" / n).write_bytes(b"x")
    spec = {
        "project_name": "p", "format": "9x16", "fps": 30,
        "brand": {"font": "/f.ttf"},
        "slots": [
            {"clip": "footage/a.mp4", "trim": [0, 3], "caption": "One"},
            {"clip": "footage/b.mp4", "trim": "auto-silence", "caption": "Two"},
        ],
        "transition": {"type": "fade", "durationInFrames": 12},
        "overlays": [{"type": "cta", "at": "end", "durationInFrames": 60, "props": {"text": "Buy"}}],
        "music": None,
    }
    p = tmp_path / "ad.json"
    p.write_text(json.dumps(spec), encoding="utf-8")
    return ad_spec.load_spec(str(p))


def test_produce_builds_both_outputs(tmp_path):
    calls = []
    out = produce.produce(
        _spec(tmp_path),
        seed_dir="SEED",
        capcut_out=str(tmp_path / "cc"),
        mp4_out=str(tmp_path / "out.mp4"),
        public_dir=str(tmp_path / "pub"),
        trim_fn=lambda path: (500_000, 3_500_000),  # 0.5s..3.5s -> 3.0s
        probe_fn=lambda path: {"dur_us": 5_000_000, "width": 1080, "height": 1920, "has_audio": True},
        runner=lambda cmd, cwd: calls.append((cmd, cwd)),
        build_fn=lambda spec, seed, out_root: os.path.join(out_root, spec["project_name"]),
    )
    assert out["capcut"].endswith("/p")
    assert out["mp4"].endswith("out.mp4")

    props = out["props"]
    # explicit trim [0,3]
    assert props["slots"][0]["trimStart"] == 0 and props["slots"][0]["trimDur"] == 3
    # auto-silence -> (0.5, 3.0)
    assert props["slots"][1]["trimStart"] == 0.5 and props["slots"][1]["trimDur"] == 3.0
    # media copied into public dir by basename
    assert props["slots"][0]["clip"] == "a.mp4"
    assert os.path.exists(str(tmp_path / "pub" / "a.mp4"))
    # overlay "end": total = 3 + 3 - (1*12/30=0.4) = 5.6; cta 60f=2s -> at 3.6
    assert abs(props["overlays"][0]["at"] - 3.6) < 1e-6
    # the ad composition was rendered
    assert calls and calls[0][0][2] == "render" and calls[0][0][3] == "ad"
