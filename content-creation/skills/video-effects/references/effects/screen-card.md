# Effect: Screen Card

Back to [SKILL.md](../../SKILL.md).

- **status:** stub (not proven in a run)
- **seen in:** `_context/yobolabs/video-breakdowns/instagram-De8SPjEAuV0-claude-edited.md` (4.0–5.0 price card, 37.6–42.0 editor screenshot, 15.0–17.0 and 63.0–65.0 repo cards, 74.1–82.8 doc behind subject) — evidence only, never rules
- **tools:** `content-creation:remotion-overlays`, person matte optional (SKILL.md § 2)

**Look:** A real screenshot, document, repo page or a price tag floats over the shot as a rounded card with a soft shadow. Optional: the card sits behind the head (person matte on top).
**Use when:** The voice names a real thing: a tool, a document, a price, a product page. The card is the proof.
**Prompt shape:** `When I say "<word>", pop <screenshot path | price "<amount>"> as a floating card <top-left | centre | behind my head> for <N> s.`

## Layers (bottom → top)
1. Plate.
2. Card (for the "behind" variant).
3. Person matte (only for the "behind" variant).
4. Card (normal variant), then captions.

## Timing
- Pop in on the trigger word: scale 0.8 → 1.0, opacity 0 → 1, `spring({ damping: 12, stiffness: 180 })` ≈ 8 frames.
- Hold 1–3 s (docs up to 8 s while the voice walks through them).
- Out: scale 1.0 → 0.9 + fade over 5 frames, or hard cut on the next effect.
- Long doc: slow vertical scroll 0 → −20% of card height over the hold, linear.

## Build
- Remotion: `ScreenCard`. Props: `src` (image) or `price` + `label`, `anchor: "topLeft" | "center" | "behind"`, `widthPct`, `startFrame`, `holdFrames`.
- Sizes: repo/tool card 60% width at top y ≈ 8%; screenshot card 86% width centred y ≈ 35%; price card 22% width, white `#FFFFFF`, black bold 4% height text; doc behind subject 90% width, top y ≈ 10%.
- Style: radius 28 px, `boxShadow: 0 20px 60px rgba(0,0,0,0.45)`, 1 px border `rgba(255,255,255,0.12)`.
- Optional tilt −2° to 2° for a hand-placed feel.

## Inputs
- A real image: screenshot PNG at ≥ 2× display size, a repo page capture, a document export.
- Trigger word time; person matte for the behind variant (SKILL.md § Inputs).

## Traps
- **A real screenshot beats a drawn mockup.** A vector-drawn imitation of an app UI looks fake next to real video. Capture the real screen; draw only when no real source exists.
- Blurry screenshots: capture at 2× and downscale, never upscale.
- Crop out personal data, notifications, tabs and other people's names before use.
- Do not stack two cards; replace one with the next.
