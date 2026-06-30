import { AbsoluteFill, useVideoConfig } from "remotion";
import { Brand } from "../schema";

// Lower-third caption pill — mirrors the CapCut caption look (white text, dark pill).
export const Caption: React.FC<{ text: string; brand: Brand }> = ({ text, brand }) => {
  const { height } = useVideoConfig();
  if (!text) return null;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: height * 0.16,
        fontFamily: brand.font,
      }}
    >
      <div
        style={{
          background: "rgba(26,26,26,0.65)",
          color: "#fff",
          fontWeight: 800,
          fontSize: height * 0.03,
          padding: `${height * 0.012}px ${height * 0.028}px`,
          borderRadius: height * 0.014,
          maxWidth: "82%",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
