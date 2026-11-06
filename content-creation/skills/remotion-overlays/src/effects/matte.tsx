import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";

// Frame-exact image sequences (plate + person matte) from --public-dir.
// Pattern uses {n} for the 1-based, zero-padded frame number, e.g. "matte/{n}.png".
export const seqSrc = (pattern: string, frame: number, pad = 4) =>
  staticFile(pattern.replace("{n}", String(frame + 1).padStart(pad, "0")));

export type FrameTransform = { scale: number; originX: number; originY: number };
export const noTransform: FrameTransform = { scale: 1, originX: 0.5, originY: 0.5 };

// One transform shared by plate and matte so they never drift apart (video-effects SKILL.md § 3).
export const Framed: React.FC<{ t: FrameTransform; children: React.ReactNode }> = ({ t, children }) => (
  <AbsoluteFill
    style={{ transform: `scale(${t.scale})`, transformOrigin: `${t.originX * 100}% ${t.originY * 100}%` }}
  >
    {children}
  </AbsoluteFill>
);

export const SeqLayer: React.FC<{ pattern: string; feather?: number }> = ({ pattern, feather = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Img
        src={seqSrc(pattern, frame)}
        style={{ width: "100%", height: "100%", filter: feather ? `blur(${feather}px)` : undefined }}
      />
    </AbsoluteFill>
  );
};
