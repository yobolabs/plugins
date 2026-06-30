"""Produce BOTH outputs from ONE ad spec: a finished mp4 (Remotion) and an editable
CapCut draft. This is the single command behind conversational editing — Claude edits
the spec, then re-runs this to regenerate both.

  python3.11 produce.py ad.json --mp4 /abs/out/ad.mp4 [--seed DIR] [--capcut-out DIR] [--public DIR]
"""
import argparse, json, os, shutil, subprocess, sys, tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "capcut", "scripts"))
import ad_spec as ad_spec_mod
import build_ad
import media_probe

OVERLAYS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "remotion-overlays"))
SEED_FIXTURE = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "capcut", "fixtures", "seed")
)


def _trim_seconds(slot, clip_path, trim_fn, probe_fn):
    """Resolve a slot's trim to (start_seconds, duration_seconds)."""
    t = slot.get("trim")
    if t == "auto-silence":
        start_us, end_us = trim_fn(clip_path)
        return start_us / 1e6, (end_us - start_us) / 1e6
    if isinstance(t, (list, tuple)) and len(t) == 2:
        return float(t[0]), float(t[1]) - float(t[0])
    dur_us = probe_fn(clip_path)["dur_us"]
    return 0.0, dur_us / 1e6


def _copy_into(src, public_dir):
    dst = os.path.join(public_dir, os.path.basename(src))
    if os.path.abspath(src) != os.path.abspath(dst):
        shutil.copy2(src, dst)
    return os.path.basename(dst)


def remotion_props(spec, public_dir, trim_fn=media_probe.silence_trim, probe_fn=media_probe.probe):
    """Build the `ad` composition props from a resolved spec, copying media into public_dir."""
    fmt, fps = spec["format"], spec["fps"]
    slots = []
    for slot in spec["slots"]:
        name = _copy_into(slot["clip"], public_dir)
        ts, td = _trim_seconds(slot, slot["clip"], trim_fn, probe_fn)
        slots.append({"clip": name, "trimStart": ts, "trimDur": td, "caption": slot.get("caption", "")})

    trans = spec.get("transition", {"type": "fade", "durationInFrames": 12})
    use_trans = trans.get("type", "fade") != "none" and trans.get("durationInFrames", 0) > 0
    overlap_s = (max(0, len(slots) - 1) * trans.get("durationInFrames", 0) / fps) if use_trans else 0.0
    total_s = sum(s["trimDur"] for s in slots) - overlap_s

    music = None
    if spec.get("music") and spec["music"].get("track"):
        music = {"src": _copy_into(spec["music"]["track"], public_dir),
                 "volume": spec["music"].get("volume", 0.6)}

    overlays = []
    for o in spec.get("overlays", []):
        at = o.get("at", 0)
        dur_f = o.get("durationInFrames", 60)
        if at == "end":
            at = max(0.0, total_s - dur_f / fps)
        overlays.append({"type": o["type"], "at": float(at),
                         "durationInFrames": dur_f, "props": o.get("props", {})})

    return {"width": fmt["width"], "height": fmt["height"], "fps": fps,
            "brand": spec.get("brand", {}), "slots": slots, "transition": trans,
            "overlays": overlays, "music": music}


def _default_runner(cmd, cwd):
    subprocess.run(cmd, cwd=cwd, check=True)


def render_mp4(props, out_path, public_dir, runner=_default_runner):
    props_file = os.path.join(public_dir, "__ad_props.json")
    with open(props_file, "w", encoding="utf-8") as f:
        json.dump(props, f, ensure_ascii=False)
    runner(["npx", "remotion", "render", "ad", out_path, f"--props={props_file}",
            f"--public-dir={public_dir}", "--log=error"], OVERLAYS_DIR)
    return out_path


def produce(spec, *, seed_dir, capcut_out, mp4_out, public_dir,
            trim_fn=media_probe.silence_trim, probe_fn=media_probe.probe,
            runner=_default_runner, build_fn=build_ad.build):
    os.makedirs(public_dir, exist_ok=True)
    capcut_dir = build_fn(spec, seed_dir, capcut_out)            # editable CapCut draft
    props = remotion_props(spec, public_dir, trim_fn=trim_fn, probe_fn=probe_fn)
    render_mp4(props, mp4_out, public_dir, runner=runner)        # finished mp4
    return {"capcut": capcut_dir, "mp4": mp4_out, "props": props}


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("--mp4", required=True)
    ap.add_argument("--seed", default=SEED_FIXTURE)
    ap.add_argument("--capcut-out", default=build_ad.DEFAULT_OUT)
    ap.add_argument("--public", default=None)
    a = ap.parse_args(argv)
    spec = ad_spec_mod.load_spec(a.spec)
    public = a.public or tempfile.mkdtemp(prefix="ad-public-")
    out = produce(spec, seed_dir=a.seed, capcut_out=a.capcut_out, mp4_out=a.mp4, public_dir=public)
    print(json.dumps({"capcut": out["capcut"], "mp4": out["mp4"]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
