import { z } from "zod";
import { zBrand } from "../schema";

// The full ad as data — the single source of truth Claude edits on request.
// Mirrors the Python ad spec; clip/music are filenames resolved from the render
// public dir (passed via --public-dir).

export const zSlot = z.object({
  clip: z.string(), // filename in the public dir
  trimStart: z.number().default(0), // seconds into the source
  trimDur: z.number(), // trimmed length, seconds
  caption: z.string().default(""),
});
export type Slot = z.infer<typeof zSlot>;

export const zTransition = z.object({
  type: z
    .enum(["none", "fade", "slide-left", "slide-right", "slide-up", "slide-down", "wipe"])
    .default("fade"),
  durationInFrames: z.number().int().default(12),
});

export const zOverlayRef = z.object({
  type: z.enum(["intro", "kinetic-hook", "callout", "cta"]),
  at: z.number().default(0), // seconds from start; the orchestrator resolves "end"
  durationInFrames: z.number().int().default(60),
  // free-form props forwarded to the overlay composition (text/anchor/url/emphasis…)
  props: z.record(z.string(), z.any()).default({}),
});
export type OverlayRef = z.infer<typeof zOverlayRef>;

export const zMusic = z
  .object({
    src: z.string(),
    volume: z.number().default(0.6),
    fadeInS: z.number().default(0.3),
    fadeOutS: z.number().default(0.5),
  })
  .nullable()
  .default(null);

export const zAd = z.object({
  width: z.number().int().default(1080),
  height: z.number().int().default(1920),
  fps: z.number().int().default(30),
  brand: zBrand.prefault({}),
  slots: z.array(zSlot).default([]),
  transition: zTransition.prefault({}),
  overlays: z.array(zOverlayRef).default([]),
  music: zMusic,
});
export type AdProps = z.infer<typeof zAd>;
