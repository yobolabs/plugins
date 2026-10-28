# Camera language that video models follow

Back to [SKILL.md](../SKILL.md). Read when writing the OPTICS and CAMERA blocks, or when a result ignored framing.

## One camera line per shot

Order: **size · height · position · distance · lens ; subject size + place ; move or static.**

```
WIDE from far back at a three-quarter angle, slightly low, normal lens;
the whole setting in frame, the subject small in the left third, moving right; static camera, no movement.

CLOSE-UP, eye level, head-on, normal lens; the face fills the frame, centred; slow push-in.
```

Examples show the form only. Never paste an example that matches one source into a reading or prompt template:
the model copies it into every video.

## Words

| Part | Use | Avoid |
|---|---|---|
| Size | extreme close-up, close-up, medium close-up, medium, medium-wide, wide, extreme wide | "shot" alone; vague "big" |
| Height | eye level, low, high, overhead | — |
| Position | head-on, side-on (flat, no depth), **three-quarter** (depth), from behind, rear three-quarter | "from the side" when the source is at an angle — it gives a flat profile |
| Distance | "far back, the whole setting in frame", "close enough that the product fills the lower half" | none — the model then frames the product big |
| Lens | wide-angle, normal, telephoto (compressed), or mm / field of view (close-ups 47°, medium-wide 63°, wide 84°) | changing lens inside a shot — say "keep the lens fixed within each shot" |
| Static | "static camera, no movement" | **"tripod", "locked-off tripod"** — the model drew a tripod into the scene |
| Moves | slow push-in, pull back, pan left/right, tilt up/down, tracking alongside, orbit, crane up, handheld sway, whip pan | several moves in one shot unless it is one smooth move between named framings |

## Cuts

- State the count and the times: "Exactly 1 cut, at 1.7 s." Then "Every shot is ONE unbroken take to its end:
  no other cuts, no new angles, no close-ups that are not written below."
- A shot whose moments each name a different size reads as "cut here". Inside one take, either the camera is
  static (one size, written once) or it moves smoothly between named framings at named times.
- Write `HARD CUT.` on its own line between shots in ACTION TIMING.

## Why the camera was ignored (seen in runs)

| Symptom | Cause | Fix |
|---|---|---|
| Camera words missing from the sent prompt | The tool trimmed the prompt from the end and the camera sat at the end of each moment | Camera first; never trim the camera line |
| Extra cuts and product close-ups | Per-moment framing inside a locked shot; product reference not told it never sets framing | One camera line per shot; label references |
| Flat, straight-on view | The source reading (or your example) said "from the side" | Ask for head-on / side-on / three-quarter explicitly |
| Product framed big in shot 1 | A product picture with no role became the opening frame | "It never sets camera position, framing or how big it is in frame" |
