# Effect: Studio Reveal

Back to [SKILL.md](../../SKILL.md).

- **status:** stub (not proven in a run)
- **seen in:** `_context/yobolabs/video-breakdowns/instagram-Det_44sBsPY-20-effects.md` (18.90–21.00 s) — evidence only, never rules
- **tools:** `content-creation:remotion-overlays`, FFmpeg, person matte (SKILL.md § 2)

**Look:** The background goes black around the speaker. Then two big glowing softbox panels and a brand.primary "<on-air sign>" light up behind them, like a TV studio switching on.
**Use when:** "Go pro", "level up your production", or a launch / going-live beat.

## Layers (bottom → top)
1. Background: black (#050505) with a faint floor gradient.
2. Studio set: two softbox panels (white rounded rects ~28% of width, tilted ±12° in perspective, at x ~15% and ~85%, y ~25–45%), bloom glow around each. Sign: brand.primary pill, white bold caps 28 px, centred above the head at y ~12%, with its own glow.
3. Person matte, plus a soft rim light: matte edge tinted white @ 30%.
4. Captions.

## Timing
- Frame 0: bg cuts to black (hard cut). The sign shows unlit (brand.primary @ 15%).
- Frames 8–20: softboxes fade 0 → 1 with a flicker (opacity 0, 0.7, 0.2, 1 on frames 8, 10, 12, 14), then bloom grows to full by 20.
- Sign lights at ~frame 14: opacity 0.15 → 1 in 2 frames, glow 0 → 24 px.
- Hold. Out: hard cut.

## Build
- Remotion: `StudioReveal`, props `{ brand, signText: string, lightsOnFrame: 8, signOnFrame: 14 }`. Panels are divs with `boxShadow: 0 0 120px 40px rgba(255,255,255,.6)`; panel tilt via CSS `perspective` + `rotateY`.
- Composite: studio render → matte (with rim) → captions.
- FFmpeg rim light: `[matte]edgedetect=low=0.1:high=0.3,gblur=sigma=3[rim]`, blend `screen` at 30% over the person.

## Inputs
- Matte: yes. Word times: yes (start; time the sign to a stressed word).

## Traps
- A daylight-lit person on a black studio bg looks pasted. Lower the plate exposure ~10% and add the rim light.
- Hair matte edges on black show the old wall colour. Despill: `colorchannelmixer` toward neutral on the matte edge band.
- Panels must stay behind the shoulders, never cross the face.
