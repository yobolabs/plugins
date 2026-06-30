import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "skills", "capcut", "scripts"))
import inspect_draft as ins
import pytest

def test_transition_schema_extracted():
    info = {"materials": {"transitions": [
        {"id": "T1", "name": "Pull in", "duration": 500000, "is_overlap": True, "effect_id": "abc"}]}}
    out = ins.feature_schema(info, "transition")
    assert out["material_array"] == "transitions"
    assert out["count"] == 1
    assert out["fields"]["duration"] == "int"
    assert out["fields"]["name"] == "str"
    assert out["example"]["effect_id"] == "abc"

def test_empty_feature_reports_zero():
    out = ins.feature_schema({"materials": {"transitions": []}}, "transition")
    assert out["count"] == 0
    assert out["example"] is None

def test_keyframe_schema_extracted():
    info = {"tracks": [{"segments": [{"common_keyframes": [{"id": "K1", "value": 0.5}]}]}]}
    out = ins.feature_schema(info, "keyframe")
    assert out["material_array"] == "common_keyframes"
    assert out["count"] == 1
    assert out["fields"]["value"] == "float"

def test_unknown_feature_raises():
    with pytest.raises(ValueError):
        ins.feature_schema({"materials": {}}, "bogus")
