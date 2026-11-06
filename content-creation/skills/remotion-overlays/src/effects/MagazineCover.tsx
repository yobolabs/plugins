import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Framed, SeqLayer } from "./matte";

export const zMagazineCover = z.object({
  width: z.number(), height: z.number(), fps: z.number(), durationInFrames: z.number(),
  platePattern: z.string(),
  mattePattern: z.string(),
  masthead: z.string(),
  issueLine: z.string(),
  coverLines: z.array(z.string()).max(3),
  stickerText: z.string(),
  startFrame: z.number(), // masthead hard-cuts in
  beats: z.array(z.number()), // issue, cover lines..., barcode, sticker (absolute frames)
  brand: z.object({ accent: z.string(), serif: z.string(), ink: z.string() }),
  flatten: z.string().nullable(), // colour field behind the matte (e.g. cream), or null to keep the room
  plate: z.object({ scale: z.number(), originX: z.number(), originY: z.number() }),
  feather: z.number(),
});
export type MagazineCoverProps = z.infer<typeof zMagazineCover>;

const Barcode: React.FC<{ w: number; h: number; ink: string }> = ({ w, h, ink }) => {
  const bars = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2];
  const step = 1.6;
  const total = bars.reduce((a, b) => a + b, 0) * step;
  const xs = bars.map((_, i) => bars.slice(0, i).reduce((a, b) => a + b * step, 0));
  return (
    <svg width={w} height={h} viewBox={`-3 0 ${total + 6} 50`} preserveAspectRatio="none">
      <rect x={-3} y={0} width={total + 6} height={50} fill="#fff" />
      {bars.map((b, i) => (
        <rect key={i} x={xs[i]} y={3} width={b} height={44} fill={ink} />
      ))}
    </svg>
  );
};

export const MagazineCover: React.FC<MagazineCoverProps> = (p) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const on = frame >= p.startFrame;
  const pop = (beat: number | undefined) => {
    if (beat === undefined || frame < beat) return null;
    const s = spring({ frame: frame - beat, fps, config: { damping: 14 }, durationInFrames: 5 });
    return { opacity: s, transform: `scale(${0.9 + 0.1 * s})` };
  };
  const nCover = p.coverLines.length;
  const issueB = p.beats[0];
  const lineB = p.beats.slice(1, 1 + nCover);
  const barB = p.beats[1 + nCover];
  const stickB = p.beats[2 + nCover];
  // Sticker: overshoots to ~1.1 then settles at 1.0 over ~8 frames.
  const stick =
    stickB !== undefined && frame >= stickB
      ? spring({ frame: frame - stickB, fps, config: { damping: 8, stiffness: 180 }, durationInFrames: 8 })
      : 0;
  const lineColor = p.flatten ? p.brand.ink : "#fff";
  const shadow = p.flatten ? undefined : "0 3px 14px rgba(0,0,0,0.55)";
  const issue = pop(issueB);
  const bar = pop(barB);

  return (
    <AbsoluteFill style={{ backgroundColor: p.flatten ?? "black" }}>
      <Framed t={p.plate}>
        {/* 1 plate (2 = flat colour field instead, when flatten is set) */}
        {p.flatten && on ? null : <SeqLayer pattern={p.platePattern} />}
        {/* 3 masthead, behind the person; sized in output pixels despite the plate scale */}
        {on ? (
          <div
            style={{
              // Inverse of the plate transform, so the masthead lands at y = 6% of the OUTPUT frame.
              position: "absolute", left: 0, right: 0, textAlign: "center",
              top: p.plate.originY * H + (H * 0.06 - p.plate.originY * H) / p.plate.scale,
              fontFamily: p.brand.serif, fontWeight: 900,
              // 15% of height, but never wider than 92% of the frame (wide serif caps ~0.75 em each).
              fontSize: Math.min(H * 0.15, (W * 0.92) / (p.masthead.length * 0.75)) / p.plate.scale,
              lineHeight: 1, color: p.brand.accent, letterSpacing: "-0.01em", whiteSpace: "nowrap",
            }}
          >
            {p.masthead}
          </div>
        ) : null}
        {/* 4 person matte */}
        {on ? <SeqLayer pattern={p.mattePattern} feather={p.feather} /> : null}
      </Framed>
      {/* 5 overlays, not transformed with the plate */}
      {on && issue ? (
        <div
          style={{
            position: "absolute", top: H * 0.035, left: 0, right: 0, textAlign: "center", ...issue,
            fontFamily: p.brand.serif, fontSize: H * 0.016, letterSpacing: "0.25em", fontVariant: "small-caps",
            color: lineColor, textShadow: shadow,
          }}
        >
          {p.issueLine}
        </div>
      ) : null}
      {on ? (
        <div
          style={{
            position: "absolute", left: W * 0.06, width: W * 0.42, top: H * 0.55,
            display: "flex", flexDirection: "column", gap: H * 0.02,
          }}
        >
          {p.coverLines.map((l, i) => {
            const st = pop(lineB[i]);
            return st ? (
              <div
                key={i}
                style={{
                  ...st, transformOrigin: "left center", fontFamily: p.brand.serif, fontWeight: 800,
                  fontSize: H * 0.035, lineHeight: 1.05, color: lineColor, textShadow: shadow,
                }}
              >
                {l}
              </div>
            ) : null;
          })}
        </div>
      ) : null}
      {on && bar ? (
        <div style={{ position: "absolute", left: W * 0.06, top: H * 0.83, ...bar, transformOrigin: "left bottom" }}>
          <Barcode w={W * 0.14} h={H * 0.05} ink="#111" />
        </div>
      ) : null}
      {on && stick > 0 ? (
        <div
          style={{
            position: "absolute", width: W * 0.18, height: W * 0.18, left: W * 0.76, top: H * 0.6 - W * 0.09,
            borderRadius: "50%", background: p.brand.accent, color: "#fff", display: "flex",
            alignItems: "center", justifyContent: "center", textAlign: "center", padding: W * 0.015,
            fontFamily: p.brand.serif, fontWeight: 900, fontSize: W * 0.032, lineHeight: 1.05,
            transform: `scale(${stick}) rotate(-12deg)`, boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
          }}
        >
          {p.stickerText}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
