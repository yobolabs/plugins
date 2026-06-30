import { spring, interpolate, Easing } from "remotion";

// Spring-in 0→1, frame-delayed. Used for pop/slide entrances.
export const springIn = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 140 } });

// Ease-in/out window: 0 before `start`, 1 across the entrance, holds, then 0 after `outStart`.
export const inOut = (
  frame: number,
  fps: number,
  { inDur = 0.4, hold = 0.8, outDur = 0.4 }: { inDur?: number; hold?: number; outDur?: number } = {},
  total?: number,
) => {
  const inF = inDur * fps;
  const outF = outDur * fps;
  const end = (total ?? frame + 1) - outF;
  const up = interpolate(frame, [0, inF], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const down = interpolate(frame, [end, end + outF], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 1, 1),
  });
  return Math.min(up, down);
};

export const anchorStyle = (
  anchor: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center",
  pad: number,
): React.CSSProperties => {
  const v: React.CSSProperties = { position: "absolute" };
  if (anchor === "center") return { ...v, inset: 0, justifyContent: "center", alignItems: "center", display: "flex" };
  if (anchor.startsWith("top")) v.top = pad; else v.bottom = pad;
  if (anchor.endsWith("left")) v.left = pad; else v.right = pad;
  return v;
};
