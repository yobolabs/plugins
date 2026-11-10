import React from "react";
import {
  AbsoluteFill, Img, interpolate, interpolateColors, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { z } from "zod";
import { WordStack, zWordLine } from "./WordSlideUp";

// Move: shape-morph (content-creation:motion-graphics → references/moves/shape-morph.md).
// ONE hero shape stays in the centre and changes geometry state to state (dot → circle → rounded square →
// card → pill ...). Each new state is the next "shot": no cut, no cross-dissolve. The camera keeps a slow push
// and the background glow follows the shape colour, so something always moves.
export const zMorphState = z.object({
  at: z.number(), // frame the morph INTO this state starts (first state: 0)
  w: z.number(), // fraction of frame width
  h: z.number(), // fraction of frame width (keeps aspect independent of frame shape)
  radius: z.number(), // 0..0.5 of the short side (0.5 = circle / pill)
  rotate: z.number().default(0), // degrees
  fill: z.string(),
  image: z.string().nullable().default(null), // file in public dir, shown inside the shape once settled
  words: z.array(zWordLine).default([]), // text inside the shape once settled (word-slide-up)
  textColor: z.string().default("#FFFFFF"),
  accentColor: z.string().default("#FFFFFF"),
});

export const zShapeMorph = z.object({
  width: z.number(),
  height: z.number(),
  fps: z.number(),
  durationInFrames: z.number(),
  states: z.array(zMorphState).min(2),
  bg: z.string(),
  glow: z.boolean().default(true),
  push: z.number().default(0.06), // camera push over the whole piece (tip: always motion)
  damping: z.number().default(16), // spring damping per morph; lower = more overshoot
  contentDelay: z.number().default(6), // frames after a morph lands before its content enters
});
export type ShapeMorphProps = z.infer<typeof zShapeMorph>;

export const ShapeMorph: React.FC<ShapeMorphProps> = ({ states, bg, glow, push, damping, contentDelay, width, height, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // active segment: last state whose `at` has passed
  let k = 0;
  for (let i = 0; i < states.length; i++) if (frame >= states[i].at) k = i;
  const cur = states[k];
  const prev = states[Math.max(0, k - 1)];
  const p = k === 0 ? 1 : spring({ frame: frame - cur.at, fps, config: { damping, mass: 0.9, stiffness: 140 } });
  const pc = Math.min(1, Math.max(0, p)); // colours and radius never overshoot

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const W = lerp(prev.w, cur.w, p) * width;
  const H = lerp(prev.h, cur.h, p) * width;
  const R = lerp(prev.radius, cur.radius, pc) * Math.min(W, H);
  const rot = lerp(prev.rotate, cur.rotate, p);
  const fill = interpolateColors(pc, [0, 1], [prev.fill, cur.fill]);

  const cam = 1 + push * (frame / Math.max(1, durationInFrames));
  const settled = k === 0 ? cur.at : cur.at + Math.round(fps * 0.45);
  const contentStart = settled + contentDelay;
  const contentIn = interpolate(frame, [contentStart, contentStart + 8], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // content of the previous state leaves as the morph starts, so two layouts never overlap
  const next = states[k + 1];
  const contentOut = next ? interpolate(frame, [next.at - 4, next.at], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>
      {glow && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 50%, ${fill}55 0%, ${fill}22 28%, transparent 62%)`,
            transform: `scale(${1.2 + 0.08 * Math.sin(frame / 22)})`,
          }}
        />
      )}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${cam})` }}>
        <div
          style={{
            width: W, height: H, borderRadius: R, backgroundColor: fill, transform: `rotate(${rot}deg)`,
            overflow: "hidden", position: "relative",
            boxShadow: `0 ${Math.round(H * 0.06)}px ${Math.round(H * 0.25)}px rgba(0,0,0,0.35)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {cur.image && (
            <Img
              src={staticFile(cur.image)}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: contentIn * contentOut }}
            />
          )}
          {cur.words.length > 0 && (
            <div style={{ opacity: contentOut, transform: `rotate(${-rot}deg)` }}>
              <WordStack
                lines={cur.words} startFrame={contentStart} wordFrames={10} staggerFrames={4} exitFrame={null}
                fontSizeFrac={Math.min(0.06, (H / height) * 0.4)} height={height}
                font="Inter, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
                colors={{ text: cur.textColor, accent: cur.accentColor, bg: null }}
              />
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
