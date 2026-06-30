import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { CalloutProps } from "../schema";
import { springIn, inOut, anchorStyle } from "../lib";

// A pill badge that pops in at an anchor with a subtle pulse — product feature callout.
export const Callout: React.FC<CalloutProps> = ({ brand, text, anchor }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, height } = useVideoConfig();
  const s = springIn(frame, fps, 0);
  const scale = interpolate(s, [0, 1], [0.6, 1]);
  const pulse = 1 + 0.03 * Math.sin((frame / fps) * Math.PI * 2 * 1.2);
  const vis = inOut(frame, fps, { inDur: 0.3, outDur: 0.35 }, durationInFrames);
  const pad = height * 0.06;

  return (
    <AbsoluteFill style={{ fontFamily: brand.font }}>
      <div style={anchorStyle(anchor, pad)}>
        <div
          style={{
            opacity: vis,
            transform: `scale(${scale * pulse})`,
            background: brand.primary,
            color: "#fff",
            fontWeight: 800,
            fontSize: height * 0.03,
            padding: `${height * 0.014}px ${height * 0.028}px`,
            borderRadius: 999,
            boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
