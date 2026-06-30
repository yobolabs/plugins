import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "skills", "capcut", "scripts"))
import inspect_draft as ins

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
