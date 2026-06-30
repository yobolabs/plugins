import { z } from "zod";

// Brand tokens + format flow straight from the ad spec's `brand` / `format`.
export const zBrand = z.object({
  primary: z.string().default("#FF5A1F"),
  secondary: z.string().default("#1A1A1A"),
  font: z.string().default(
    "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif",
  ),
});
export type Brand = z.infer<typeof zBrand>;

// Common props every overlay accepts. width/height/fps/durationInFrames drive
// calculateMetadata so one composition renders any ad format.
const base = {
  brand: zBrand.prefault({}),
  width: z.number().int().default(1080),
  height: z.number().int().default(1920),
  fps: z.number().int().default(30),
  durationInFrames: z.number().int().default(60),
};

export const zIntro = z.object({
  ...base,
  title: z.string().default("Your Brand"),
});
export type IntroProps = z.infer<typeof zIntro>;

export const zKineticHook = z.object({
  ...base,
  text: z.string().default("This changed everything"),
  // word indices (0-based) to paint in brand.primary
  emphasis: z.array(z.number().int()).default([]),
});
export type KineticHookProps = z.infer<typeof zKineticHook>;

export const zCallout = z.object({
  ...base,
  text: z.string().default("BPA-free"),
  anchor: z
    .enum(["top-left", "top-right", "bottom-left", "bottom-right", "center"])
    .default("top-right"),
});
export type CalloutProps = z.infer<typeof zCallout>;

export const zCta = z.object({
  ...base,
  text: z.string().default("Shop now — 20% off"),
  url: z.string().default("yourbrand.com"),
});
export type CtaProps = z.infer<typeof zCta>;
