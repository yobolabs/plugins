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
