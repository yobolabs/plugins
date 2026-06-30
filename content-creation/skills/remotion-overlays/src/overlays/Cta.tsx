import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { CtaProps } from "../schema";
import { springIn, inOut } from "../lib";

// End-card: offer text + URL button slide up and hold.
export const Cta: React.FC<CtaProps> = ({ brand, text, url, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const s = springIn(frame, fps, 0);
  const y = interpolate(s, [0, 1], [height * 0.08, 0]);
  const btn = springIn(frame, fps, 8);
  const vis = inOut(frame, fps, { inDur: 0.4, outDur: 0.4 }, durationInFrames);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: brand.font, opacity: vis }}>
      <div style={{ textAlign: "center", transform: `translateY(${y}px)` }}>
        <div
          style={{
            color: "#fff",
            fontSize: height * 0.058,
            fontWeight: 800,
            letterSpacing: -1,
            textShadow: "0 4px 24px rgba(0,0,0,0.5)",
            maxWidth: "84%",
            margin: "0 auto",
          }}
        >
          {text}
        </div>
        <div
          style={{
            opacity: btn,
            transform: `scale(${interpolate(btn, [0, 1], [0.8, 1])})`,
            display: "inline-block",
            marginTop: height * 0.03,
            background: brand.primary,
            color: "#fff",
            fontWeight: 800,
            fontSize: height * 0.032,
            padding: `${height * 0.016}px ${height * 0.04}px`,
            borderRadius: 999,
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          }}
        >
          {url}
        </div>
      </div>
    </AbsoluteFill>
  );
};
