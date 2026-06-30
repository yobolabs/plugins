# content-creation/skills/ad-engine/scripts/build_ad.py
"""Compile an ad spec into a CapCut draft: assemble slots, trims, captions, canvas."""
import argparse, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "capcut", "scripts"))
import capcut_draft as cd
import media_probe
import ad_spec as ad_spec_mod

DEFAULT_SEED = os.path.expanduser("~/Movies/CapCut/_seeds/empty")
DEFAULT_OUT = os.path.expanduser("~/Movies/CapCut/User Data/Projects/com.lveditor.draft")
CAPTION_Y = 0.36

def _trim_for(slot, clip_path, probe_meta, trim_fn):
    t = slot.get("trim")
    if t == "auto-silence":
        start, end = trim_fn(clip_path)
        return start, end - start
    if isinstance(t, (list, tuple)) and len(t) == 2:
        start = cd.s_to_us(t[0]); end = cd.s_to_us(t[1])
        return start, end - start
    return 0, probe_meta["dur_us"]

def build(spec, seed_dir, out_root, *, probe_fn=media_probe.probe, trim_fn=media_probe.silence_trim,
          register_root=None):
    fmt = spec["format"]
    project_dir = os.path.join(out_root, spec["project_name"])
    d = cd.Draft.from_seed(seed_dir, project_dir, spec["project_name"])
    d.set_canvas(fmt["ratio"], fmt["width"], fmt["height"])
    font = spec.get("brand", {}).get("font") or \
        "/Applications/CapCut.app/Contents/Resources/Font/SystemFont/en.ttf"
    pos = 0
    for slot in spec["slots"]:
        local = d.copy_media(slot["clip"])
        meta = probe_fn(local)
        src_start, src_dur = _trim_for(slot, local, meta, trim_fn)
        mid = d.add_video_material(local, meta["dur_us"], meta["width"], meta["height"],
                                   meta["has_audio"])
        d.add_video_segment(mid, src_start, src_dur, pos)
        if slot.get("caption"):
            tmid = d.add_text_material(slot["caption"], font_size=8.0, font_path=font)
            d.add_text_segment(tmid, target_start_us=pos, dur_us=src_dur, y=CAPTION_Y)
        pos += src_dur
    d.save()
    if register_root:
        d.register(register_root)
    return project_dir

def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("--seed", default=DEFAULT_SEED)
    ap.add_argument("--out", default=DEFAULT_OUT)
    ap.add_argument("--register", action="store_true", help="append to root_meta_info.json")
    a = ap.parse_args(argv)
    spec = ad_spec_mod.load_spec(a.spec)
    register_root = os.path.join(a.out, "root_meta_info.json") if a.register else None
    proj = build(spec, a.seed, a.out, register_root=register_root)
    print(proj)
    return 0

if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
