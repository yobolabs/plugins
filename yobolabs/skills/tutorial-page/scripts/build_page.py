#!/usr/bin/env python3
"""Build Puck page content for a tutorial landing page from a spec file.

    python3 build_page.py <tutorial.json> [--uploads uploads.json] [--out content.json]
    python3 build_page.py <tutorial.json> --keys      # list every image key the spec uses

Spec shape (tutorial.json):
{
  "title": "What's new in <App>",
  "intro": "One or two plain sentences. Orange rings mark where to click.",
  "updated": "Updated 29 September 2026",
  "sections": [
    {"tag": "New", "title": "1. Pick a model",
     "intro": "What is different, in plain words. No 'Why' label.",
     "steps": [{"text": "Click the Model box.", "shots": ["s1-1-model-box"],
                "note": "Drawing with demo data, not a screenshot."}],        # note: optional small caption under the shot
     "gif": {"key": "s1-flow", "caption": "The whole flow, start to finish"}}   # optional
  ]
}
Image keys map to files <key>.png / <key>.gif next to the spec and to URLs in uploads.json.
Optional per step: "minfont": <smallest font, in CSS px, the reader must read in the shot> (default 12).

Images are shown at their own size, never stretched to the column: a PNG captured at 2x is shown
at most ZOOM x its CSS width, left-aligned with the text. A cropped shot therefore stays sharp and a wide shot is not
blown up. Each <img> carries data-srcw / data-minfont for scripts/check_legibility.js.
Output: {root, zones, content:[Container{children:[...]}]} ready for `lp.mjs set-content`.
"""
import json, os, struct, sys, uuid

INK, MUTED, FAINT = "#0f172a", "#475569", "#94a3b8"
TAG_COLORS = {"Do this now": ("#fee2e2", "#991b1b")}   # everything else: teal

def cid(t): return f"{t}-{uuid.uuid4()}"

def heading(text, level="h2", size="32", mb="12"):
    return {"type": "Heading", "props": {"id": cid("Heading"), "text": text, "level": level, "color": INK,
            "fontSize": size, "fontWeight": "bold", "textAlign": "left", "marginBottom": mb}}

def text(content, size="18", color=MUTED, mb="16", weight="normal"):
    # Text renders white-space: pre-wrap, so "\n" line breaks survive.
    return {"type": "Text", "props": {"id": cid("Text"), "content": content, "color": color, "fontSize": size,
            "fontWeight": weight, "textAlign": "left", "lineHeight": "relaxed", "marginBottom": mb}}

def badge(tag):
    bg, fg = TAG_COLORS.get(tag, ("#ccfbf1", "#115e59"))
    return {"type": "Badge", "props": {"id": cid("Badge"), "text": tag, "backgroundColor": bg, "textColor": fg,
            "fontSize": "13", "fontWeight": "semibold", "align": "left", "marginBottom": "12", "borderRadius": "999"}}

SHOT_DPR, ZOOM = 2, 1.5   # capture.py shoots at 2x; allow up to 1.5x zoom on wide screens

def css_width(path):
    """CSS px width of a PNG captured at SHOT_DPR (IHDR width / DPR). None for GIFs or missing files."""
    try:
        with open(path, "rb") as f:
            head = f.read(24)
        return struct.unpack(">I", head[16:20])[0] / SHOT_DPR if head[:8] == b"\x89PNG\r\n\x1a\n" else None
    except OSError:
        return None

def image(src, key="", srcw=None, minfont=12, mb=28):
    # Plain <img> in CustomCode, NOT the Image block: Image routes remote URLs through /_next/image,
    # which 400s on Slides (no images config). alt="" because the step text sits right above it —
    # a repeated alt duplicates every step when the page is copied or read aloud.
    return {"type": "CustomCode", "props": {"id": cid("CustomCode"),
            "html": (f'<img class="shot" src="{src}" alt="" loading="lazy" data-shot="{key}" data-srcw="{round(srcw)}" data-minfont="{minfont}" '
                     f'style="max-width:{round(srcw * ZOOM)}px;margin-bottom:{mb}px">' if srcw
                     else f'<img class="shot" src="{src}" alt="" loading="lazy" data-shot="{key}" style="margin-bottom:{mb}px">'),
            "css": ".shot{display:block;width:100%;height:auto;border-radius:12px;border:1px solid #e2e8f0;"
                   "box-shadow:0 10px 15px rgba(0,0,0,.08);margin:0 0 28px}",
            "js": "", "backgroundColor": "transparent", "minHeight": "auto", "maxWidth": "full",
            "borderRadius": "0", "overflow": "visible"}}

def spacer():
    return {"type": "Spacer", "props": {"id": cid("Spacer"), "height": "56", "showDivider": "true", "dividerColor": "#e2e8f0"}}

def keys(spec):
    ks = []
    for s in spec["sections"]:
        for st in s["steps"]:
            ks += st.get("shots", [])
        if s.get("gif"): ks.append(s["gif"]["key"])
    return list(dict.fromkeys(ks))

def build(spec, up, here="."):
    missing = [k for k in keys(spec) if k not in up]
    if missing: sys.exit(f"not uploaded yet: {missing} — run upload.py first")
    c = [heading(spec["title"], "h1", "48"), text(spec["intro"], "20", MUTED, "8")]
    if spec.get("updated"): c.append(text(spec["updated"], "14", FAINT, "24"))
    c.append(spacer())
    for s in spec["sections"]:
        c += [badge(s["tag"]), heading(s["title"]), text(s["intro"], "18", MUTED, "24")]
        for i, st in enumerate(s["steps"], 1):
            c.append(text(f"{i}. {st['text']}", "18", INK, "12", "semibold"))
            note = st.get("note")
            c += [image(up[k], k, css_width(os.path.join(here, k + ".png")), st.get("minfont", 12), 8 if note else 28) for k in st.get("shots", [])]
            if note: c.append(text(note, "14", FAINT, "28"))
        if s.get("gif"):
            c += [text(s["gif"]["caption"], "15", MUTED, "8", "semibold"), image(up[s["gif"]["key"]], s["gif"]["key"])]
        c.append(spacer())
    # Children of a layout block go in props.children (Puck slot). The older zones model
    # ("<id>:children" in zones) renders a BLANK page on current Slides.
    wrap = {"type": "Container", "props": {"id": cid("Container"), "children": c, "maxWidth": "1000",
            "backgroundColor": "#ffffff", "padding": {"top": 48, "right": 24, "bottom": 48, "left": 24}}}
    return {"root": {"props": {}}, "zones": {}, "content": [wrap]}

if __name__ == "__main__":
    a = sys.argv[1:]
    if not a: sys.exit(__doc__)
    spec_path = a[0]; here = os.path.dirname(os.path.abspath(spec_path))
    spec = json.load(open(spec_path))
    if "--keys" in a:
        print("\n".join(keys(spec))); sys.exit(0)
    upath = a[a.index("--uploads") + 1] if "--uploads" in a else os.path.join(here, "uploads.json")
    opath = a[a.index("--out") + 1] if "--out" in a else os.path.join(here, "content.json")
    page = build(spec, json.load(open(upath)) if os.path.exists(upath) else {}, here)
    json.dump(page, open(opath, "w"), indent=1, ensure_ascii=False)
    n = page["content"][0]["props"]["children"]
    print(f"{opath}: {len(n)} components, {sum(x['type']=='CustomCode' for x in n)} images")
