# Effect: Whip Pan

Back to [SKILL.md](../../SKILL.md).

- **status:** stub (not proven in a run)
- **seen in:** `_context/yobolabs/video-breakdowns/instagram-De8SPjEAuV0-claude-edited.md` (~48.8–49.3 s) — evidence only, never rules
- **tools:** `content-creation:remotion-overlays`, FFmpeg

**Look:** A fast sideways slide with heavy horizontal motion blur, as if the camera whipped to the next shot. The outgoing shot leaves one side, the incoming shot arrives from the other.
**Use when:** The default transition between two sections or two looks of the same take. Cleaner than a recursive zoom.
**Prompt shape:** `Whip pan <left|right> into the next part on the word "<word>".`

## Layers (bottom → top)
1. Outgoing plate segment (A).
2. Incoming plate segment (B), placed side by side with A in one strip.
3. Captions: hidden for the 8–10 frames of the move.

## Timing
- Centre the move on the trigger word: starts 4 frames before, ends 5 frames after (≈ 9–10 frames, 0.3 s at 30 fps).
- Offset curve: `Easing.inOut(Easing.exp)` from 0 to −100% of width.
- Blur curve: 0 → 60 px → 0, peaking at the midpoint.
- No hold; B continues at full frame.

## Build
- Remotion: `WhipPan`. Props: `direction: "left" | "right"`, `centerFrame`, `durationFrames` (10).
- Strip: A at `translateX(x)`, B at `translateX(x + width)` (mirror for right); `x = interpolate(f, [s, e], [0, -width], { easing: Easing.inOut(Easing.exp) })`.
- Motion blur: `<CameraMotionBlur shutterAngle={270} samples={10}>` from `@remotion/motion-blur` around the strip, or 6 ghost copies offset 1–6% with falling opacity.
- FFmpeg (no Remotion): offset with `xfade=transition=slideleft:duration=0.3:offset=<t>`, then on that window `boxblur=lr=40:lp=1:cr=0` gated with `enable='between(t,<t>,<t+0.3>)'`. boxblur is not directional; for true horizontal blur use `gblur=sigma=40:sigmaV=0`.

## Inputs
- Two plate segments (often the same take, before and after a cut or a grade change).
- Trigger word time.

## Traps
- Longer than 12 frames reads as a slow slide, not a whip.
- No blur = a cheap PowerPoint push. The blur is the effect.
- Faces must not sit mid-blur on the landing frame; B lands sharp, blur 0 by the last frame.
- Captions shown during the move smear; hide them.
