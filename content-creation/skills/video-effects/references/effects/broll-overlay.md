# Effect: B-roll Overlay

Back to [SKILL.md](../../SKILL.md).

- **status:** stub (not proven in a run)
- **seen in:** `_context/yobolabs/video-breakdowns/instagram-Det_44sBsPY-20-effects.md` (21.00–23.50 s) — evidence only, never rules
- **tools:** `content-creation:remotion-overlays`, FFmpeg

**Look:** The video shrinks into a video-editor window on a dark background: a preview panel on top, a timeline below. A brand.primary "<B-roll>" clip drops onto a track above a blue "<Talking head>" track, and a white playhead sweeps right across both.
**Use when:** Explaining editing, layering, or "how this was made".

## Layers (bottom → top)
1. Background: brand.bgDark with a soft blue glow @ 20% at the bottom.
2. Editor window: 92% wide, y ~22–54%, white chrome, radius 12 px. Dark preview panel (top 60% of the window) holding the live plate as a 9:16 tile ~22% of window width, centred.
3. Timeline strip under the window, y ~54–60%: two tracks. Lower track = blue bar "<Talking head>" full width. Upper track = brand.primary bar "<B-roll>" ~45% wide. Small 10 px labels.
4. Playhead: 2 px white line with a round handle, height across both tracks.
5. Captions.

## Timing
- Frames 0–8: plate scales 1 → 0.22 into the preview tile, `Easing.inOut(Easing.cubic)`; window fades in.
- B-roll clip drops on its word: y -40 px → 0 and opacity 0 → 1 over 6 frames, `spring({damping: 14})`.
- Playhead moves x 5% → 95% of the strip over the whole effect, linear.
- Optional: while the playhead is over the B-roll bar, the preview tile shows the B-roll clip.
- Out: hard cut to the full plate.

## Build
- Remotion: `BrollOverlay`, props `{ brand, tileRect, tracks: {label: string, color: token, from: number, to: number}[], dropFrame: number, playhead: {from: 0.05, to: 0.95}, brollSrc?: url }`.
- The editor chrome is generic (title bar, toolbar row, timeline). Draw it, or use a screenshot of the house editor.
- FFmpeg tile: `[0:v]scale=238:424,setsar=1[tile];[editor][tile]overlay=X:Y`.

## Inputs
- Matte: no. Word times: yes (start, drop word).
- Optional: one B-roll clip; an editor screenshot if not drawn.

## Traps
- Never copy a third-party editor's branding or UI. Draw a generic one.
- The tile is small; keep the plate playing with lip sync or it reads as a still.
- Track labels under 10 px are unreadable; they are decoration, so keep colours carrying the meaning (red = B-roll, blue = talking head).
