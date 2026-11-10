import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";

// Move: word-slide-up (content-creation:motion-graphics → references/moves/word-slide-up.md).
// Each word rises into place from behind a mask, one after another. No bounce, no per-letter fades.
export const zWordLine = z.object({
  text: z.string(),
  accentWords: z.array(z.string()).default([]),
});

export const zWordSlideUp = z.object({
  width: z.number(),
  height: z.number(),
  fps: z.number(),
  durationInFrames: z.number(),
  lines: z.array(zWordLine),
  startFrame: z.number().default(0),
  wordFrames: z.number().default(10), // rise time of one word
  staggerFrames: z.number().default(4), // gap between word starts
  exitFrame: z.number().nullable().default(null), // null = stay
  fontSizeFrac: z.number().default(0.075), // of height
  font: z.string().default("Inter, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"),
  colors: z.object({ text: z.string(), accent: z.string(), bg: z.string().nullable() }),
  transparent: z.boolean().default(false),
});
export type WordSlideUpProps = z.infer<typeof zWordSlideUp>;

const ease = Easing.bezier(0.16, 1, 0.3, 1); // fast out, long settle, no overshoot

export const WordStack: React.FC<
  Omit<WordSlideUpProps, "width" | "height" | "fps" | "durationInFrames" | "transparent"> & { height: number }
> = ({ lines, startFrame, wordFrames, staggerFrames, exitFrame, fontSizeFrac, font, colors, height }) => {
  const frame = useCurrentFrame();
  const size = Math.round(height * fontSizeFrac);
  let i = 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.12 }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", gap: size * 0.28, flexWrap: "wrap", justifyContent: "center" }}>
          {line.text.split(/\s+/).map((w, wi) => {
            const n = i++;
            const t0 = startFrame + n * staggerFrames;
            let y = interpolate(frame, [t0, t0 + wordFrames], [105, 0], {
              easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            if (exitFrame !== null) {
              // exit in the same order, upward, so the motion keeps one direction
              const e0 = exitFrame + n * Math.max(1, Math.round(staggerFrames / 2));
              y += interpolate(frame, [e0, e0 + wordFrames * 0.8], [0, -105], {
                easing: Easing.in(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp",
              });
            }
            const accent = line.accentWords.includes(w.replace(/[^\p{L}\p{N}]/gu, ""));
            return (
              <span key={wi} style={{ overflow: "hidden", display: "inline-block", lineHeight: 1.08, paddingBottom: size * 0.06 }}>
                <span
                  style={{
                    display: "inline-block",
                    transform: `translateY(${y}%)`,
                    fontFamily: font,
                    fontWeight: 700,
                    fontSize: size,
                    letterSpacing: "-0.03em",
                    color: accent ? colors.accent : colors.text,
                  }}
                >
                  {w}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const WordSlideUp: React.FC<WordSlideUpProps> = (p) => (
  <AbsoluteFill
    style={{
      backgroundColor: p.transparent || !p.colors.bg ? "transparent" : p.colors.bg,
      alignItems: "center",
      justifyContent: "center", // dead centre (motion-graphics rule)
    }}
  >
    <WordStack {...p} />
  </AbsoluteFill>
);
