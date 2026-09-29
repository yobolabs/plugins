#!/usr/bin/env python3
"""Upload every image a tutorial spec uses to Slides, caching URLs in uploads.json.

    LANDING_PAGES_API_KEY=... SLIDES_API_URL=https://<slides-host> \
      python3 upload.py <tutorial.json> [--force key1,key2]

Looks for <key>.gif, then <key>.png, next to the spec. Skips keys already in uploads.json
unless --force names them (use after you retake a shot — same key, new file).
POST {SLIDES_API_URL}/api/upload (multipart `file`, png/jpg/webp/gif/svg, max 13 MB) → {url}.
The key is read from the environment and never printed.
"""
import json, os, subprocess, sys

a = sys.argv[1:]
if not a: sys.exit(__doc__)
spec_path = a[0]; here = os.path.dirname(os.path.abspath(spec_path))
force = set(a[a.index("--force") + 1].split(",")) if "--force" in a else set()
key, base = os.environ.get("LANDING_PAGES_API_KEY"), os.environ.get("SLIDES_API_URL", "").rstrip("/")
if not key or not base: sys.exit("set LANDING_PAGES_API_KEY and SLIDES_API_URL")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_page import keys  # noqa: E402

upath = os.path.join(here, "uploads.json")
up = json.load(open(upath)) if os.path.exists(upath) else {}
for k in keys(json.load(open(spec_path))):
    if k in up and k not in force: continue
    f = next((os.path.join(here, k + e) for e in (".gif", ".png") if os.path.exists(os.path.join(here, k + e))), None)
    if not f: sys.exit(f"missing file for {k} (.gif/.png next to the spec)")
    ctype = "image/gif" if f.endswith(".gif") else "image/png"
    out = subprocess.run(["curl", "-s", "-H", f"Authorization: Bearer {key}", "-F", f"file=@{f};type={ctype}",
                          f"{base}/api/upload"], capture_output=True, text=True).stdout
    try:
        up[k] = json.loads(out)["url"]
    except Exception:
        sys.exit(f"upload failed for {k}: {out[:200]}")
    json.dump(up, open(upath, "w"), indent=1)
    print(k, "ok")
print(f"{len(up)} images in {upath}")
