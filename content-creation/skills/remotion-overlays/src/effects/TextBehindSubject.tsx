import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Framed, SeqLayer, noTransform } from "./matte";

export const zTextBehindSubject = z.object({
  width: z.number(), height: z.number(), fps: z.number(), durationInFrames: z.number(),
  platePattern: z.string(), // e.g. "plate/{n}.png"
  mattePattern: z.string(), // e.g. "matte/{n}.png" (straight alpha, same size/count as plate)
  lines: z.array(z.string()).min(1).max(3),
  style: z.enum(["solid", "twoTone", "outline"]),
  colors: z.object({ fill: z.string(), accent: z.string(), stroke: z.string() }),
  font: z.string(),
  y: z.number(), // vertical centre of the text block, fraction of height
  sizeFrac: z.number(), // max line height, fraction of frame height
  startFrame: z.number(),
  endFrame: z.number(),
  greyToWhite: z.boolean(),
});
export type TextBehindSubjectProps = z.infer<typeof zTextBehindSubject>;

export const TextBehindSubject: React.FC<TextBehindSubjectProps> = (p) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const on = frame >= p.startFrame && frame < p.endFrame;
  const local = frame - p.startFrame;
  const rise = interpolate(local, [0, 6], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const fillMix = p.greyToWhite
    ? interpolate(local, [6, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  const grey = Math.round(interpolate(fillMix, [0, 1], [150, 255]));

  // Fit the longest line to 90% of the width (condensed fonts ~0.5 em per glyph), capped by sizeFrac.
  const longest = Math.max(...p.lines.map((l) => l.length));
  const fontSize = Math.min(height * p.sizeFrac, (width * 0.9) / (longest * 0.5));
  const lineH = fontSize * 0.92;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Framed t={noTransform}>
        {/* 1 plate */}
        <SeqLayer pattern={p.platePattern} />
        {/* 3 text behind the speaker */}
        {on ? (
          <AbsoluteFill
            style={{
              top: height * p.y - (lineH * p.lines.length) / 2,
              height: lineH * p.lines.length,
              opacity: rise,
              transform: `translateY(${(1 - rise) * height * 0.04}px)`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}
          >
            {p.lines.map((line, i) => {
              const words = line.split(" ");
              return (
                <div
                  key={i}
                  style={{
                    fontFamily: p.font, fontWeight: 900, fontSize, lineHeight: `${lineH}px`,
                    letterSpacing: "-0.02em", textTransform: "uppercase", whiteSpace: "nowrap",
                    color:
                      p.style === "outline"
                        ? "transparent"
                        : p.greyToWhite
                          ? `rgb(${grey},${grey},${grey})`
                          : p.colors.fill,
                    WebkitTextStroke: p.style === "outline" ? `4px ${p.colors.stroke}` : undefined,
                    textShadow: p.style === "outline" ? undefined : "0 6px 24px rgba(0,0,0,0.4)",
                  }}
                >
                  {p.style === "twoTone"
                    ? words.map((w, j) => (
                        <span key={j} style={{ color: i === 0 && j === 0 ? p.colors.accent : undefined }}>
                          {w}
                          {j < words.length - 1 ? " " : ""}
                        </span>
                      ))
                    : line}
                </div>
              );
            })}
          </AbsoluteFill>
        ) : null}
        {/* 4 person matte on top of the text */}
        {on ? <SeqLayer pattern={p.mattePattern} /> : null}
      </Framed>
    </AbsoluteFill>
  );
};
