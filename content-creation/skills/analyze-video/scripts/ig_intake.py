#!/usr/bin/env python3
"""ig_intake — turn new reels in a saved Instagram collection into ONE queued breakdown task.

Read-only. Input is the collection page HTML (saved from the logged-in intake browser profile).
The script never logs in, never clicks, never likes/follows/posts. See
references/breakdown-to-skill.md -> "Intake from an IG collection" and _context/LIMITS.md (rows: ig_intake).

  ig_intake.py --html page.html [--state ~/.ig-intake/seen.json] [--log ~/Library/Logs/ig-intake.log]
               [--max-per-run 3] [--hours 8-23] [--now ISO] [--queue | --dry-run]

Exit codes: 0 ran (maybe nothing new) · 2 bad input · 3 login wall / checkpoint (stop, file the ask, never re-login)
            · 4 outside active hours (logged, nothing read).

Limits (each logged when it fires, one JSON line per run):
  max_per_run  new URLs queued per run; the rest stay UNSEEN and the next run takes them (never dropped)
  hours        local hours the poller may read the page (default 08-23)
"""
import argparse
import datetime as dt
import glob
import json
import os
import re
import subprocess
import sys
import tempfile

REEL_RE = re.compile(r'href="(?:https://www\.instagram\.com)?/(?:[A-Za-z0-9_.]+/)?(reel|p)/([A-Za-z0-9_-]{5,})/?[^"]*"')
WALL_MARKERS = (
    'id="loginForm"', 'name="username"', "/accounts/login", "/challenge/", "checkpoint_required",
    "Log in to Instagram", "Suspicious Login Attempt",
)


def parse(html):
    """-> (status, [codes in page order, de-duplicated]). status = ok | login_wall."""
    if any(m in html for m in WALL_MARKERS) and not REEL_RE.search(html):
        return "login_wall", []
    seen, codes = set(), []
    for _kind, code in REEL_RE.findall(html):
        if code not in seen:
            seen.add(code)
            codes.append(code)
    return "ok", codes


def url(code):
    return f"https://www.instagram.com/reel/{code}/"


def load_state(path):
    try:
        with open(path) as f:
            return json.load(f)
    except FileNotFoundError:
        return {"seen": {}}


def save_state(path, state):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path) or ".")
    with os.fdopen(fd, "w") as f:
        json.dump(state, f, indent=1, sort_keys=True)
    os.replace(tmp, path)


def in_hours(now, hours):
    start, end = (int(x) for x in hours.split("-"))
    return start <= now.hour < end


def run(html, state, now, max_per_run, hours):
    """Pure core. -> (result dict, new_state)."""
    res = {"t": now.isoformat(timespec="seconds"), "found": 0, "new": 0, "queued": [], "left": 0, "limit_hit": []}
    if not in_hours(now, hours):
        res["status"] = "outside_hours"
        res["limit_hit"].append(f"hours {hours}")
        return res, state
    status, codes = parse(html)
    res["status"] = status
    if status != "ok":
        return res, state
    res["found"] = len(codes)
    fresh = [c for c in codes if c not in state["seen"]]  # page order = newest saved first
    res["new"] = len(fresh)
    take, rest = fresh[:max_per_run], fresh[max_per_run:]
    if rest:
        res["limit_hit"].append(f"max_per_run {max_per_run}")
        res["left"] = len(rest)
    new_state = {"seen": dict(state["seen"])}
    for c in take:
        new_state["seen"][c] = res["t"]
    res["queued"] = [url(c) for c in take]
    return res, new_state


def log(path, res):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "a") as f:
        f.write(json.dumps(res) + "\n")


def tasks_py():
    hits = sorted(glob.glob(os.path.expanduser(
        "~/.claude/plugins/cache/sean/chief-of-staff/*/skills/chief-of-staff/scripts/lib/tasks.py")))
    return hits[-1] if hits else None


def queue_task(urls, now, tasks_dir):
    """ONE task per run listing every new URL (lead rule: never one message per URL)."""
    name = f"m-ig-breakdown-{now.strftime('%m%d-%H%M')}"
    charter = "\n".join([
        "task goal: Break down new reels from Sean's IG collection and fold their techniques into the skills.",
        "parent goal: Y1",
        "",
        "## Charter",
        "New reels saved to the intake collection (ig_intake.py). For EACH URL follow",
        "_context/_runbooks/yobo-video-breakdown.md end to end (fetch free, S3, breakdown, technique map,",
        "lead APPROVED, skill refs). Check _context/yobolabs/video-breakdowns/INDEX.md first; skip any already there.",
        "no paid generation; breakdown only, follow _runbooks/yobo-video-breakdown.md; 20 min budget",
        "",
        *[f"- {u}" for u in urls],
        "",
        "## Reports",
    ])
    tp = tasks_py()
    if not tp:
        raise RuntimeError("tasks.py not found")
    with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False) as f:
        f.write(charter)
    path = os.path.join(tasks_dir, f"{name}.md")
    subprocess.run([sys.executable, tp, "new", path, "--name", name, "--to", "m", "--from", "ig-intake",
                    "--charter", f.name, "parent_goal=Y1", "category=yobo",
                    "task_goal=Break down new IG reels into skill knowledge"], check=True)
    return path


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--html", required=True, help="saved collection page HTML")
    ap.add_argument("--state", default="~/.ig-intake/seen.json")
    ap.add_argument("--log", default="~/Library/Logs/ig-intake.log")
    ap.add_argument("--max-per-run", type=int, default=3)
    ap.add_argument("--hours", default="8-23")
    ap.add_argument("--now", help="ISO time (tests)")
    ap.add_argument("--tasks-dir", default=os.path.expanduser(
        "~/.claude/chief-of-staff/vault/Projects/Chief of Staff/Orchestrator/tasks"))
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--queue", action="store_true", help="write the task file for queue-run.sh")
    g.add_argument("--dry-run", action="store_true", help="print, change nothing (no state, no log)")
    a = ap.parse_args(argv)

    now = dt.datetime.fromisoformat(a.now) if a.now else dt.datetime.now()
    state_path, log_path = os.path.expanduser(a.state), os.path.expanduser(a.log)
    try:
        html = open(os.path.expanduser(a.html), encoding="utf-8", errors="replace").read()
    except OSError as e:
        print(f"bad input: {e}", file=sys.stderr)
        return 2
    res, new_state = run(html, load_state(state_path), now, a.max_per_run, a.hours)
    if res["queued"] and a.queue:
        res["task"] = queue_task(res["queued"], now, a.tasks_dir)
    print(json.dumps(res))
    if a.dry_run:
        return {"login_wall": 3, "outside_hours": 4}.get(res["status"], 0)
    log(log_path, res)
    if res["status"] == "ok" and (not res["queued"] or a.queue):
        save_state(state_path, new_state)  # mark seen only once queued (or nothing new)
    return {"login_wall": 3, "outside_hours": 4}.get(res["status"], 0)


if __name__ == "__main__":
    sys.exit(main())
