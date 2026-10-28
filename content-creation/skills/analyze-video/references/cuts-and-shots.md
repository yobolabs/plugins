# Cuts and shots

Back to [SKILL.md](../SKILL.md). Read when the shots look wrong, or before changing a threshold.

## The measure

Each sampled frame (4 per second) is shrunk to 32×32 grey. The change between two neighbours is the mean
absolute difference of the 1,024 pixels (0–255 scale). Typical values:

| Content | Change |
|---|---|
| Still photo held on screen | 0–0.2 (compression noise) |
| Locked camera, small subject moving far away | ≈1 |
| Locked camera, close subject moving | 2–5 |
| Handheld phone footage | 5–30 |
| A cut | 40–110 |

## The three reference ads

| Ad | Shape | Expected shots |
|---|---|---|
| Car stunt, 16 s (ramp) | 1 short opener, then one long locked wide take | 0–2.25 motion · 2.25–16 motion |
| Lip balm, 9.5 s | Handheld store clip, then 9 still photos on the beat | 0–4.25 motion · then 9 stills of 0.5–0.75 s |
| Macarons, 8.6 s | Egg rolling (moving), 4 still photos, 2 handheld box shots | 0–2.5 motion · 4 stills · 2 motion |

## Known failure shapes

| Shape | Symptom | Rule that fixes it |
|---|---|---|
| Slideshow (many stills, a cut every ~0.5 s) | High median hides cuts; neighbours merge | Spike ≥ 25 and ≥ 4× neighbours; min gap 0.45 s |
| A cut out of a moving shot into a still | Moving shot + photo merge into one "moving" shot | Jump ≥ 40 and ≥ 1.6× both neighbours |
| Beat-cut reel with moving shots (a cut every beat, ~0.65 s; two cuts 0.23 s apart) | 4 fps scan misses cuts inside motion and merges close cuts; re-read lands 1 frame late | Hard cuts from the full-rate pass: change ≥ 20 and ≥ 4× the median of 5 frames each side (`FR_*` in analyze.py) |
| Dissolve / cross-fade | Change spread over several samples, no spike | Not handled — split by hand |
| Flash frame or whip pan | Spike inside one shot | Not handled — join by hand |
| Long slow push-in | Continuous small change | Correctly one motion shot |

## Shot type

`still` only when no sampled change inside the shot (away from its edges) reaches 0.5. Shots too short to
measure (no inner sample) count as `still` under 1 s. Always let a person switch the type: a photo with a slow
zoom is `motion` to the measure but is made as a photo plus a zoom in the edit.
