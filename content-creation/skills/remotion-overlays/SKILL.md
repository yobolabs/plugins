---
name: remotion-overlays
description: Use when building or rendering motion-graphics overlays (animated intros, kinetic captions, product callouts, CTA end-cards) for campaign ads, to composite over CapCut video. Also use when the user mentions "motion graphics", "kinetic text", "animated caption", "intro", "callout", "end card", "CTA", "overlay", or "remotion".
---

# Remotion Overlays

A Remotion (React/TypeScript) project that renders **transparent-background motion graphics** as ProRes 4444 `.mov` files, for `ad-engine` to import as an overlay track over the CapCut video. Props come straight from the ad spec's `overlays[]` + `brand`, so variants drive overlays too.

## Project location

`content-creation/skills/remotion-overlays/` — a self-contained Node project (Remotion 4, React 19, zod 4). Run `npm install` once before first render. `node_modules/` is git-ignored.

## Compositions

| id | Component | Purpose | Default frames |
|---|---|---|---|
| `intro` | `src/overlays/Intro.tsx` | Branded open: title + brand bar wipe | 45 |
| `kinetic-hook` | `src/overlays/KineticHook.tsx` | Word-by-word kinetic headline; `emphasis` words paint brand.primary | 60 |
| `callout` | `src/overlays/Callout.tsx` | Pill badge pop-in at an `anchor` | 60 |
| `cta` | `src/overlays/Cta.tsx` | End-card: offer text + URL button | 75 |

## Prop contract (zod — `src/schema.ts`)

Every composition takes `brand` + format + its own fields. `calculateMetadata` reads `width`/`height`/`fps`/`durationInFrames` from props, so one composition renders any ad format.

```jsonc
// shared
"brand": { "primary": "#FF5A1F", "secondary": "#1A1A1A", "font": "Inter, sans-serif" },
"width": 1080, "height": 1920, "fps": 30, "durationInFrames": 60,
// intro:        "title": "Your Brand"
// kinetic-hook: "text": "This fixed my mornings", "emphasis": [1]   // word indices to highlight
// callout:      "text": "BPA-free", "anchor": "top-right"           // top-left|top-right|bottom-left|bottom-right|center
// cta:          "text": "Shop now — 20% off", "url": "yourbrand.com"
```

## Rendering

Output is **transparent ProRes 4444** (`yuva444` — alpha present), set by each composition's `calculateMetadata` — no extra CLI flags needed.

Single overlay:
```bash
cd "${CLAUDE_PLUGIN_ROOT}/skills/remotion-overlays"
npx remotion render kinetic-hook /abs/out/hook.mov --props=props.json
```

Batch (what `ad-engine` calls — one `.mov` per `overlays[]` entry):
```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/remotion-overlays/render-overlays.mjs" manifest.json
# manifest.json: [{ "id": "kinetic-hook", "out": "/abs/hook.mov", "props": { ... } }, ...]
```

Preview while designing: `npx remotion studio`.

## Integration with ad-engine

`build_ad.py` maps each ad-spec `overlays[]` entry → a manifest item (id = `type`, props from `brand` + entry text/anchor/url + `format`), calls `render-overlays.mjs`, then imports each resulting `.mov` as a video material + segment on a **top overlay track** at the entry's `at` time (overlay = a video segment on a higher track — uses the VERIFIED video-segment schema in `content-creation:capcut`).

## Critical rules

- **Transparent output only.** Keep the composition root background transparent (no `backgroundColor` on the outer `AbsoluteFill`). The ProRes 4444 alpha is what lets CapCut composite the overlay over the video.
- **No CSS transitions/animations, no Tailwind animation classes** — they don't render. Animate with `useCurrentFrame()` + `interpolate()`/`spring()` + `Easing` only.
- **Props are the variant surface.** Never hardcode brand colors or copy in a component — read them from props so the same overlay serves every ad variant.
- **Use `python3.11` and `npx remotion`** from this directory; `node_modules` must be installed.
