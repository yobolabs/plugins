---
name: analyze-video
description: "Use when breaking down a source video or ad before remixing or editing it: finding cuts, shot boundaries, still vs moving shots, music tempo and beats, whether cuts land on the beat, and suggesting how to structure and make each shot. Also use when the user mentions \"analyze this video\", \"break down the ad\", \"scenes are wrong\", \"cuts\", \"shots\", \"beats\", \"BPM\", \"slideshow\" or \"how should we structure this video\". Bare invocation: run the analysis script on the given video and report the shot table and the suggested structure."
---

# Analyze a video

Decompose a video into **cuts → shots → types → music**, then suggest how to make each shot. Every remix
starts here: a wrong cut corrupts everything after it, because the reading model and the prompts are told
never to cross our cuts. Bare invocation: run the script, show the shot table and the plan.

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/analyze-video/scripts/analyze.py" <video file or https url> \
  --json analysis.json --sheet sheet.jpg
```

Needs `ffmpeg`, `ffprobe`, `numpy`. Prints one line per shot plus the plan; `--json` has everything;
`--sheet` writes a contact sheet (2 frames a second) to look at before trusting the numbers.

## What it measures

| Output | How | Trust |
|---|---|---|
| **Cuts** | 32×32 grey frames at 4 fps; mean change between neighbours; a cut is a spike (rules below); then each cut is re-read ±0.3 s at full frame rate and set to the first frame of the new shot (`t` to 3 decimals + `frame`). A 4 fps cut is up to 0.125 s off, enough to put every edit off the music's beat | High — tuned on real ads |
| **Shots** | The time between hard cuts | High |
| **Shot type** | `still` when NO change inside the shot reaches 0.5; else `motion` | High — a locked wide shot with a tiny moving subject measures ≈1, so it stays `motion` |
| **Music** | Spectral-flux onsets → tempo by autocorrelation → beat grid | **Experimental**: can lock on half or double tempo (184 bpm on a ~92 bpm track) |
| **Cuts on beat** | Share of hard cuts within 0.12 s of a beat | As good as the beat grid |
| **Plan** | Per shot: photo / video / video + trim; one mode for the whole video | Heuristic; see `references/plan.md` |

## Cut rules (each came from a real miss)

1. Normal cut: change ≥ 3× the video's median, and a local peak.
2. **Between stills:** a spike ≥ 25 that is ≥ 4× both neighbours (0 → 52 → 0). A slideshow's high median hid these.
3. **Beside a moving shot:** a jump ≥ 40 and ≥ 1.6× both neighbours (69 after motion of 28). Missing this merged an egg clip with a photo.
4. Cuts closer than 0.45 s are one cut (two cuts 0.5 s apart measured 0.4999 and merged).

Details, the three test ads and their expected shots: `references/cuts-and-shots.md`.

## After the numbers

1. **Look at the contact sheet.** If a visible change has no cut, or a cut splits one shot, fix the cut list
   by hand before anything else.
2. **Read the source with a video model**, passing the cut times and the shot list, and asking for the camera
   like a director (`content-creation:higgsfield-video` → `references/remix-workflow.md`). With correct cuts
   the reading is reliable; with wrong cuts no model can fix it.
3. **Plan** each shot from its type and length (`references/plan.md`).

## Tests

`tests/expected.json` holds the expected shots for the three reference ads. After changing a threshold, run
the script on all three and compare; a change that fixes one ad must not break another.
