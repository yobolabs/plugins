import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { KineticHookProps } from "../schema";
import { springIn, inOut } from "../lib";

// Word-by-word kinetic headline. Each word springs up in sequence; emphasis words
// paint in brand.primary.
export const KineticHook: React.FC<KineticHookProps> = ({ brand, text, emphasis, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  const words = text.split(/\s+/).filter(Boolean);
  const vis = inOut(frame, fps, { inDur: 0.3, outDur: 0.4 }, durationInFrames);
  const stagger = 4; // frames between words

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: brand.font, opacity: vis }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: `${height * 0.005}px ${width * 0.02}px`,
          maxWidth: "82%",
        }}
      >
        {words.map((w, i) => {
          const s = springIn(frame, fps, i * stagger);
          const y = interpolate(s, [0, 1], [height * 0.06, 0]);
          const hot = emphasis.includes(i);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                transform: `translateY(${y}px)`,
                opacity: s,
                color: hot ? brand.primary : "#fff",
                fontSize: height * 0.072,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: -1,
                textShadow: "0 4px 24px rgba(0,0,0,0.5)",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
