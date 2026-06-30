"""Extract the exact JSON schema of a CapCut feature from a real draft, so native
features (transitions/animations/keyframes/audio) are documented, never guessed."""
import json, sys

FEATURE_ARRAY = {
    "transition": "transitions",
    "animation": "material_animations",
    "keyframe": "common_keyframes",   # lives on segments, handled specially
    "audio": "audios",
    "effect": "video_effects",
}

def _type_name(v):
    return type(v).__name__

def _collect_keyframes(info):
    items = []
    for t in info.get("tracks", []):
        for s in t.get("segments", []):
            for kf in (s.get("common_keyframes") or []):
                items.append(kf)
    return items

def feature_schema(info, feature):
    if feature not in FEATURE_ARRAY:
        raise ValueError(f"unknown feature {feature!r}; choose {sorted(FEATURE_ARRAY)}")
    if feature == "keyframe":
        items = _collect_keyframes(info)
        array = "common_keyframes"
    else:
        array = FEATURE_ARRAY[feature]
        items = info.get("materials", {}).get(array, [])
    if not items:
        return {"material_array": array, "count": 0, "fields": {}, "example": None}
    example = items[0]
    fields = {k: _type_name(v) for k, v in example.items()}
    return {"material_array": array, "count": len(items), "fields": fields, "example": example}

def main(argv):
    if len(argv) != 3:
        print("usage: inspect_draft.py <draft_info.json> <feature>", file=sys.stderr)
        return 2
    with open(argv[1], encoding="utf-8") as f:
        info = json.load(f)
    try:
        schema = feature_schema(info, argv[2])
    except ValueError as e:
        print(e, file=sys.stderr)
        return 1
    print(json.dumps(schema, ensure_ascii=False, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
