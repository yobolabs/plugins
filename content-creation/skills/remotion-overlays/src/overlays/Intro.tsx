import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { IntroProps } from "../schema";
import { springIn, inOut } from "../lib";

export const Intro: React.FC<IntroProps> = ({ brand, title }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, height } = useVideoConfig();

  const s = springIn(frame, fps, 0);
  const scale = interpolate(s, [0, 1], [0.8, 1]);
  const vis = inOut(frame, fps, { inDur: 0.4, outDur: 0.4 }, durationInFrames);
  // brand bar wipes in under the title
  const barW = interpolate(frame, [3, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: brand.font }}>
      <div style={{ opacity: vis, transform: `scale(${scale})`, textAlign: "center" }}>
        <div
          style={{
            color: "#fff",
            fontSize: height * 0.07,
            fontWeight: 800,
            letterSpacing: -1,
            textShadow: "0 4px 24px rgba(0,0,0,0.45)",
          }}
        >
          {title}
        </div>
        <div
          style={{
            height: height * 0.008,
            width: `${barW * 60}%`,
            margin: "24px auto 0",
            borderRadius: 999,
            background: brand.primary,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
