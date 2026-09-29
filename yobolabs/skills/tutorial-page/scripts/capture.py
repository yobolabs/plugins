"""Screenshot helpers for tutorial pages — load INSIDE a browser-use `browser_exec` call:

    exec(open("<plugin-root>/skills/tutorial-page/scripts/capture.py").read())
    OUT = "<repo-root>/_context/<app>/_tutorial/<date>"   # where PNGs land
    pin("ai.example.com/agents")                          # attach to YOUR tab by URL substring

Every call is pinned to one CDP session (SID), so another agent driving the same
browser-use daemon cannot move you to its tab mid-capture. Never call switch_tab(),
click_at_xy() or new_tab() after pin() — they act on the daemon's shared "current" tab.

Helpers:  goto(url) emu() J(js) R(js_expr_returning_element) rect(text) clk(x,y) typ(text)
          key('Escape'|'Enter') mark([[x,y,w,h,'1'], ...]) unmark() shot(name)
          blur_text(regex) frames_start(dir) frame(n, delay)
"""
import base64, json, os, time
import browser_harness.helpers as _H

SID = None
OUT = globals().get("OUT", ".")
WIDTH, HEIGHT, DPR = 1440, 900, 2   # one width for every shot; 2x for crisp text

# Blur emails, long digit runs (phones), sk_ keys, and quoted run text (customer content).
SCRUB = r"""
(() => { const re=/([\w.+-]+@[\w-]+\.[\w.]+)|(\+?\d[\d\s-]{8,}\d)|(sk_(live|test)_\w+)/;
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n,c=0;
 while(n=w.nextNode()){ if((re.test(n.textContent)||/^\s*[“"]/.test(n.textContent))&&n.parentElement){n.parentElement.style.filter='blur(6px)';c++;} }
 document.querySelectorAll('input').forEach(i=>{if(re.test(i.value)){i.style.filter='blur(6px)';c++;}});
 document.querySelectorAll('com-1password-button,com-1password-menu').forEach(e=>e.remove());
 return c; })()
"""

MARK_JS = r"""
window.__mk = (rects) => {
  document.querySelectorAll('.__mk').forEach(e=>e.remove());
  rects.filter(Boolean).forEach(([x,y,w,h,n])=>{
    const r=document.createElement('div'); r.className='__mk';
    Object.assign(r.style,{position:'fixed',left:(x-6)+'px',top:(y-6)+'px',width:(w+12)+'px',height:(h+12)+'px',
      border:'3px solid #f97316',borderRadius:'10px',boxShadow:'0 0 0 4px rgba(249,115,22,.25)',zIndex:2147483647,pointerEvents:'none'});
    if(n){const b=document.createElement('div');b.textContent=n;Object.assign(b.style,{position:'absolute',left:'-16px',top:'-16px',width:'28px',height:'28px',
      borderRadius:'50%',background:'#f97316',color:'#fff',font:'700 15px/28px system-ui',textAlign:'center'});r.appendChild(b);}
    document.body.appendChild(r);});
};
window.__find = (txt) => { const els=[...document.querySelectorAll('button,a,[role=tab],[role=menuitem],[role=option],label,h1,h2,h3,span,div,p')];
  const hit=els.filter(e=>e.innerText&&e.innerText.trim()===txt&&e.offsetParent!==null);
  hit.sort((a,b)=>a.getBoundingClientRect().width*a.getBoundingClientRect().height-b.getBoundingClientRect().width*b.getBoundingClientRect().height);
  const e=hit[0]; if(!e) return null; const c=e.closest('button,a,[role=tab],[role=menuitem],[role=option]')||e; const r=c.getBoundingClientRect(); return [r.x,r.y,r.width,r.height]; };
"""

def pin(url_substring):
    """Attach to the page target whose URL contains url_substring. Open it first in the right
    Chrome profile (open -na 'Google Chrome' --args --profile-directory='<profile>' '<url>')."""
    global SID
    ts = [t for t in cdp("Target.getTargets")["targetInfos"] if t["type"] == "page" and url_substring in t["url"]]
    if not ts:
        raise RuntimeError(f"no tab with {url_substring!r} — open it in the right Chrome profile first")
    SID = cdp("Target.attachToTarget", targetId=ts[-1]["targetId"], flatten=True)["sessionId"]
    emu()
    return ts[-1]["targetId"]

def J(expr):
    try:
        return _H._runtime_evaluate(expr, session_id=SID, await_promise=True)
    except RuntimeError as ex:
        if "Illegal return" in str(ex) or "SyntaxError" in str(ex):
            return _H._runtime_evaluate(_H._wrap_js_function(expr), session_id=SID, await_promise=True)
        raise

def emu():
    # Navigation drops the override — call again after every goto().
    cdp("Emulation.setDeviceMetricsOverride", session_id=SID, width=WIDTH, height=HEIGHT, deviceScaleFactor=DPR, mobile=False)
    time.sleep(1)

def goto(url, wait=4):
    cdp("Page.navigate", session_id=SID, url=url); time.sleep(wait); emu()

def R(expr):
    """Rect [x,y,w,h] of the element a JS expression returns, or None."""
    return J("(()=>{const e=(" + expr + ");if(!e)return null;const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]})()")

def rect(text):
    """Rect of the smallest visible element whose innerText is exactly `text`."""
    J(MARK_JS); return J(f"window.__find({json.dumps(text)})")

def clk(x, y):
    # Real mouse press/release: opens Radix tabs/menus that ignore element.click().
    # Do NOT use Input mouseMoved for hover — it hangs when the window is in the background.
    for t in ("mousePressed", "mouseReleased"):
        cdp("Input.dispatchMouseEvent", session_id=SID, type=t, x=x, y=y, button="left", clickCount=1)

def typ(text):
    cdp("Input.insertText", session_id=SID, text=text)

def key(k):
    codes = {"Escape": 27, "Enter": 13, "Tab": 9}
    for t in ("keyDown", "keyUp"):
        cdp("Input.dispatchKeyEvent", session_id=SID, type=t, key=k, code=k, windowsVirtualKeyCode=codes[k])

def mark(items):
    """items: [[x,y,w,h,'1'], [x,y,w,h]] — first ring carries the step number."""
    J(MARK_JS); J(f"window.__mk({json.dumps(items)})")

def unmark():
    J("document.querySelectorAll('.__mk').forEach(e=>e.remove())")

def blur_text(regex):
    """Blur every text node matching a JS regex source, e.g. r'Jane|Doe' for teammate names."""
    J(f"""(()=>{{const re=new RegExp({json.dumps(regex)},'i');const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){{if(re.test(n.textContent))n.parentElement.style.filter='blur(6px)'}}}})()""")

def shot(name, scrub=True):
    if scrub: J(SCRUB)
    time.sleep(0.5)
    d = cdp("Page.captureScreenshot", session_id=SID, format="png")
    p = os.path.join(OUT, f"{name}.png"); open(p, "wb").write(base64.b64decode(d["data"])); print(p)
    return p

_F = {"dir": None, "i": 0}
def frames_start(dirname):
    _F["dir"] = os.path.join(OUT, dirname); _F["i"] = 0; os.makedirs(_F["dir"], exist_ok=True)

def frame(n=1, delay=0.5):
    """Capture n GIF frames. Build with scripts/make_gif.sh <dir> <out.gif>."""
    for _ in range(n):
        d = cdp("Page.captureScreenshot", session_id=SID, format="png")
        open(os.path.join(_F["dir"], f"{_F['i']:03d}.png"), "wb").write(base64.b64decode(d["data"]))
        _F["i"] += 1; time.sleep(delay)
