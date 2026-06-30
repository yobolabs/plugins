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
