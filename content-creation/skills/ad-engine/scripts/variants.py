# content-creation/skills/ad-engine/scripts/variants.py
"""Generate ad variants by overriding spec fields. Fast version generation."""
import argparse, copy, glob, json, os, re, sys
import build_ad
import ad_spec as ad_spec_mod

_IDX = re.compile(r"^(\w+)\[(\d+)\]$")

def parse_value(s):
    for cast in (int, float):
        try:
            return cast(s)
        except ValueError:
            pass
    return s

def _set(obj, path, value):
    parts = path.split(".")
    cur = obj
    for p in parts[:-1]:
        m = _IDX.match(p)
        if m:
            cur = cur[m.group(1)][int(m.group(2))]
        else:
            cur = cur[p]
    last = parts[-1]
    m = _IDX.match(last)
    if m:
        cur[m.group(1)][int(m.group(2))] = value
    else:
        cur[last] = value

def apply_overrides(spec, overrides):
    out = copy.deepcopy(spec)
    for ov in overrides:
        key, _, raw = ov.partition("=")
        _set(out, key.strip(), parse_value(raw))
    return out

def _raw_load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("--set", action="append", default=[], dest="sets")
    ap.add_argument("--batch")
    ap.add_argument("--seed", default=build_ad.DEFAULT_SEED)
    ap.add_argument("--out", default=build_ad.DEFAULT_OUT)
    a = ap.parse_args(argv)
    base = _raw_load(a.spec)
    base_dir = os.path.dirname(os.path.abspath(a.spec))
    jobs = []
    if a.batch:
        for f in sorted(glob.glob(os.path.join(a.batch, "*.json"))):
            jobs.append(apply_overrides(base, [f"{k}={v}" for k, v in _raw_load(f).items()]))
    else:
        jobs.append(apply_overrides(base, a.sets))
    for spec in jobs:
        tmp = os.path.join(base_dir, ".__variant.json")
        with open(tmp, "w", encoding="utf-8") as fh:
            json.dump(spec, fh, ensure_ascii=False)
        loaded = ad_spec_mod.load_spec(tmp)
        os.remove(tmp)
        proj = build_ad.build(loaded, a.seed, a.out)
        print(proj)
    return 0

if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
