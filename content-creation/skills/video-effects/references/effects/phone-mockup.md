# Effect: Phone Mockup

Back to [SKILL.md](../../SKILL.md).

- **status:** stub (not proven in a run)
- **seen in:** `_context/yobolabs/video-breakdowns/instagram-Det_44sBsPY-20-effects.md` (38.4–39.7 s) — evidence only, never rules
- **tools:** `content-creation:remotion-overlays`

**Look:** The full-screen shot shrinks into a phone frame floating on a dark background. On the next beat a generic short-video app interface appears around the video inside the phone, so it looks like a posted reel.
**Use when:** "This is what it looks like on your feed", posting, social proof, before-you-post.

## Layers (bottom → top)
1. Dark background: `ink` with a soft radial glow of `brand.primary` at 25% opacity behind the phone.
2. Phone: rounded rect, final size 45% width × 50% height, centred at y ≈ 50%. Bezel 1.5% width `#111`, corner radius 12% of phone width, small pill-shaped camera cut-out at the top.
3. Plate inside the phone screen, `object-fit: cover`.
4. Feed UI inside the screen (phase 2): "<feed label>" top-left, right rail of 4 generic icons (heart, comment, share, more) at 70–90% screen height, bottom-left avatar + "<handle>" + one-line "<caption>".
5. Captions (outside the phone, normal position).

## Timing
- Frames 0–10: plate scales 1.0 → phone size, `spring({damping: 14, stiffness: 120})`; the frame and bezel fade in over frames 4–10.
- Phase 2 on the next stressed word (~frame 18): feed UI fades in over 4 frames; phone scales 1.0 → 1.06 over 8 frames.
- Hard cut out. Total 36–45 frames.

## Build
- Remotion: `<PhoneMockup plate feedUi={{label, handle, caption}} phase2Frame>`. Draw the phone and icons as SVG; no screenshots of a real app.

## Inputs
- Person matte: no. Word times: yes. Copy: `<handle>`, `<caption>`.

## Traps
- Do not copy a real platform's logo, wordmark or exact UI. Generic icons only.
- Captions placed over the phone get unreadable at this size. Keep captions outside the phone frame.
- The scaled plate looks letterboxed if the screen aspect is not 9:19.5. Use `cover`, centred on the face.

**See also:** no-footage version (phone with real UI, no filmed take) → `content-creation:motion-graphics` → `references/moves/device-land.md`.
