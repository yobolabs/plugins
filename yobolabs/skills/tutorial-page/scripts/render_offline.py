#!/usr/bin/env python3
"""Offline copy of a tutorial page: tutorial.json + the images next to it → ONE self-contained HTML file.

    python3 render_offline.py <tutorial.json> "<out>.html"

Use it for the review copy (`_context/_explainers/`) and for the legibility check before any
upload — it needs no Slides key. It is NOT a second renderer to maintain: it calls
build_page.build() with the images inlined and prints the same components (Heading, Text, Badge,
CustomCode, Spacer) with the sizes the Slides renderer gives them, so it looks like the published
page. Change the page in build_page.py, never here.
"""
import base64, html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_page import build, keys  # noqa: E402

if len(sys.argv) < 3: sys.exit(__doc__)
spec_path, out = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(spec_path))
spec = json.load(open(spec_path))

def data_uri(k):
    f = next((os.path.join(here, k + x) for x in (".gif", ".png") if os.path.exists(os.path.join(here, k + x))), None)
    if not f: sys.exit(f"missing file for {k} (.gif/.png next to the spec)")
    return f"data:image/{'gif' if f.endswith('.gif') else 'png'};base64,{base64.b64encode(open(f, 'rb').read()).decode()}"

wrap = build(spec, {k: data_uri(k) for k in keys(spec)}, here)["content"][0]["props"]
css, body, e = set(), [], html.escape
for c in wrap["children"]:
    t, p = c["type"], c["props"]
    if t == "Heading":
        body.append(f'<{p["level"]} style="font-size:{p["fontSize"]}px;margin:0 0 {p["marginBottom"]}px">{e(p["text"])}</{p["level"]}>')
    elif t == "Text":
        w = {"normal": 400, "semibold": 600, "bold": 700}[p["fontWeight"]]
        body.append(f'<p style="font-size:{p["fontSize"]}px;font-weight:{w};color:{p["color"]};margin:0 0 {p["marginBottom"]}px">{e(p["content"])}</p>')
    elif t == "Badge":
        body.append(f'<div style="margin-bottom:{p["marginBottom"]}px"><span class="badge" style="background:{p["backgroundColor"]};color:{p["textColor"]}">{e(p["text"])}</span></div>')
    elif t == "CustomCode":
        css.add(p["css"]); body.append(p["html"].replace(' loading="lazy"', ""))
    elif t == "Spacer":
        body.append(f'<div class="spacer" style="height:{p["height"]}px"><hr style="border-top-color:{p["dividerColor"]}"></div>')
pad = wrap["padding"]
page = f"""<!doctype html>
<html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(spec['title'])}</title>
<style>
*{{box-sizing:border-box}}
body{{margin:0;background:{wrap["backgroundColor"]};color:#0f172a;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%}}
main{{max-width:{int(wrap["maxWidth"]) + pad["left"] + pad["right"]}px;margin:0 auto;padding:{pad["top"]}px {pad["right"]}px {pad["bottom"]}px {pad["left"]}px}}
h1,h2{{font-weight:700;line-height:1.1;color:#0f172a}}
p{{line-height:1.625;white-space:pre-wrap}}
.badge{{display:inline-flex;font-size:13px;font-weight:600;line-height:1.5;letter-spacing:.05em;text-transform:uppercase;border-radius:999px;padding:4px 12px}}
.spacer{{display:flex;align-items:center}}.spacer hr{{width:100%;border:0;border-top:1px solid;margin:0}}
{chr(10).join(sorted(css))}
</style></head><body><main>
{chr(10).join(body)}
</main></body></html>
"""
open(out, "w").write(page)
print(out, f"{len(page)/1e6:.2f} MB, {sum('<img' in b for b in body)} images")
