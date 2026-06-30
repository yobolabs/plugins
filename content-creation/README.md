# content-creation

Build short-form **campaign ads** (product demos, explainers) by talking to Claude. You describe the ad; Claude does all the editing. You never need to know CapCut.

From one **ad spec** (JSON), the engine produces **both**:
- a finished **`.mp4`** — clips, trims, captions, transitions, motion-graphic overlays, music (rendered with Remotion).
- an editable **CapCut project** — the raw assembled timeline, for downstream human editing.

You edit by talking to Claude ("swap clip 2", "make the hook bigger", "give me a 1:1 version"); Claude edits the spec and rebuilds both.

## Setup (once)

```bash
cd skills/remotion-overlays && npm install
```
Requires Node 20+, `ffmpeg`/`ffprobe`, and Python 3.11+.

## Use

Write an ad spec (or just ask Claude to), then:

```bash
python3.11 skills/ad-engine/scripts/produce.py ad.json --mp4 /abs/out/ad.mp4
# -> {"capcut": "<CapCut project dir>", "mp4": "/abs/out/ad.mp4"}
```

Minimal spec:

```json
{
  "project_name": "summer-sale",
  "format": "9x16",
  "brand": { "primary": "#FF5A1F", "font": "Inter, sans-serif" },
  "slots": [
    { "clip": "footage/demo1.mp4", "trim": "auto-silence", "caption": "Just add water" },
    { "clip": "footage/demo2.mp4", "trim": [1.2, 4.8], "caption": "30 seconds, done" }
  ],
  "transition": { "type": "slide-left", "durationInFrames": 14 },
  "overlays": [
    { "type": "kinetic-hook", "at": 0, "durationInFrames": 45,
      "props": { "text": "This fixed my mornings", "emphasis": [1] } },
    { "type": "cta", "at": "end", "durationInFrames": 60,
      "props": { "text": "Shop now — 20% off", "url": "brand.com" } }
  ],
  "music": null
}
```

CapCut must be **closed** when building (it overwrites drafts on open).

## What's inside

| Skill | Role |
|---|---|
| `ad-engine` | the ad spec + `produce.py` (one spec → both outputs), `build_ad.py`, `variants.py` |
| `remotion-overlays` | the Remotion render project — renders the mp4 + the motion-graphics overlays |
| `capcut` | low-level CapCut draft format + scripts (assembly, inspector, seed capture) |
| agent `creator` | orchestrates the above; the persona that edits on the user's behalf |

## Scope notes

- **Transitions + overlays are baked into the mp4.** The CapCut project is the editable raw cut (a human adds transitions/effects there if they want).
- **Native CapCut transitions/effects** are a planned enhancement — they need CapCut's real JSON schema, harvested via a build → open-CapCut → read-back round-trip. CapCut schema is never guessed-and-shipped.
