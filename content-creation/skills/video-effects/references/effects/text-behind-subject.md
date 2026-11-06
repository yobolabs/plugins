# Effect: Text Behind Subject

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-De8SPjEAuV0-claude-edited.md` (6.1–7.9 s, 10.0–12.0 s, 82.8–84.9 s outline CTA).

**Look:** Huge words sit in the room behind the person: the head and shoulders cover part of the letters. Variants: solid fill, two-tone (first word accent, second white), or outline-only for a CTA keyword.
**Use when:** Stating a topic, a name or a CTA keyword with weight, without covering the face.
**Prompt shape:** `Put "<text>" behind my head, <solid|two-tone|outline>, on the word "<word>".`

## Layers (bottom → top)
1. Plate (background part).
2. Big text.
3. Person matte (same frame, alpha).
4. Small overlays (tool chip, logo), then captions.

## Timing
- Text starts on the trigger word. Hard cut in, or a rise: translateY +4% → 0 and opacity 0 → 1 over 6 frames, `Easing.out(Easing.cubic)`.
- Hold 1.5–2.5 s; hard cut out on the next phrase.
- Optional grey → white fill change over 10 frames after entry.

## Build
- Remotion: `TextBehindSubject`. Props: `lines[]`, `style: "solid" | "twoTone" | "outline"`, `colors`, `y` (default 0.30), `startFrame`, `matteSrc`.
- Size: fit width to 90% of frame; one line ≈ 12–18% of height. Bold condensed sans (900 weight), letter-spacing −0.02em.
- Position: text vertical centre at head height (y ≈ 25–35%) so the head overlaps it.
- Outline: `WebkitTextStroke: 4px #FFFFFF`, `color: transparent`, font size ≈ 22% of height.
- Two-tone: first word `brand.accent`, rest `#FFFFFF`.
- Composite the matte frame on top: `<Img src={matteFrame(frame)} />` with straight alpha.

## Inputs
- Person matte per frame (SKILL.md § Inputs). Must match the plate frame-for-frame.
- Copy (1–3 words), trigger word time.

## Traps
- If the person moves, a matte that lags by even one frame shows text over the hair. Check offsets on a fast head turn.
- Text must be large enough that most of it stays readable around the head; under ~60% coverage it reads as a mistake. Short words only (≤ 12 letters per line).
- Dark text on a dark room disappears. Use white or the accent, or add a soft shadow `0 6px 24px rgba(0,0,0,0.4)`.
- Captions drop to y ≈ 72% or hide while big text is up.
