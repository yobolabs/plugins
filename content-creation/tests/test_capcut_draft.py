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
