import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// "Text being typed": prompt bar (top), sent bubble, or comment-bar CTA.
export type PromptBarProps = {
  variant: "prompt" | "bubble" | "comment";
  text: string;
  startFrame: number;
  typeFrames?: number; // default: 1 char/frame (<30 chars), else fit to 2 s; comment = 2 frames/letter
  holdFrames?: number; // after the send press
  placeholder?: string; // comment variant
  y?: number; // top of bar, 0-1 of height (default 0.035; comment default 0.80)
  brand: { font: string; accent: string };
};

export const PromptBar: React.FC<PromptBarProps> = ({
  variant,
  text,
  startFrame,
  typeFrames,
  holdFrames = 20,
  placeholder = "Add a comment…",
  y,
  brand,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = frame - startFrame;
  if (f < 0) return null;

  const placeholderFrames = variant === "comment" ? 10 : 0;
  const tf =
    typeFrames ??
    (variant === "comment"
      ? text.length * 2
      : text.length < 30
        ? text.length
        : Math.min(Math.round(2.5 * fps), Math.max(Math.round(1.5 * fps), Math.round(2 * fps))));
  const typeStart = 6 + placeholderFrames;
  const typeEnd = typeStart + tf;
  const sendAt = typeEnd + 4;
  const fadeAt = sendAt + 6 + holdFrames;
  if (f > fadeAt + 6) return null;

  const enter = interpolate(f, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = interpolate(f, [fadeAt, fadeAt + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = enter * exit;
  const slide = (1 - enter) * -0.03 * height;

  const shown = text.slice(
    0,
    Math.floor(interpolate(f, [typeStart, typeEnd], [0, text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })),
  );
  const caretOn = f < sendAt && Math.floor(f / 15) % 2 === 0;
  const press = interpolate(f, [sendAt, sendAt + 3, sendAt + 6], [1, 0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sent = f >= sendAt;
  const fs = height * 0.022;
  const caret = <span style={{ opacity: caretOn ? 1 : 0, fontWeight: 300 }}>|</span>;

  if (variant === "bubble") {
    return (
      <AbsoluteFill style={{ fontFamily: brand.font, opacity }}>
        <div style={{ position: "absolute", right: width * 0.06, top: height * (y ?? 0.2) + slide, maxWidth: "70%", textAlign: "right" }}>
          <div style={{ display: "inline-block", background: brand.accent, color: "#fff", fontSize: fs, fontWeight: 600, padding: `${fs * 0.6}px ${fs * 0.9}px`, borderRadius: 20, textAlign: "left", lineHeight: 1.3, boxShadow: "0 6px 18px rgba(0,0,0,0.3)" }}>
            {shown}
            {!sent && caret}
          </div>
          <div style={{ marginTop: 6, fontSize: height * 0.012, fontWeight: 700, letterSpacing: 1, color: "#fff", opacity: sent ? 1 : 0, textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>SENT</div>
        </div>
      </AbsoluteFill>
    );
  }

  const btn = width * 0.07; // 4.4% of width read as a dot next to 2.2%-height text
  return (
    <AbsoluteFill style={{ fontFamily: brand.font, opacity }}>
      <div
        style={{
          position: "absolute",
          left: width * 0.06,
          right: width * 0.06,
          top: height * (y ?? (variant === "comment" ? 0.8 : 0.035)) + slide,
          minHeight: height * 0.05,
          borderRadius: 24,
          background: "rgba(28,28,30,0.88)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          padding: `${fs * 0.5}px ${fs * 0.5}px ${fs * 0.5}px ${fs * 0.9}px`,
          gap: fs * 0.6,
          boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            flex: 1,
            color: shown || variant !== "comment" ? "#F5F5F5" : "rgba(245,245,245,0.5)",
            fontSize: fs,
            fontWeight: 500,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {variant === "comment" && !shown ? placeholder : shown}
          {f >= typeStart && caret}
        </div>
        {variant === "comment" && sent ? (
          <div style={{ height: btn, padding: `0 ${fs * 0.8}px`, borderRadius: btn / 2, background: brand.accent, color: "#fff", fontSize: fs * 0.8, fontWeight: 800, letterSpacing: 1, display: "flex", alignItems: "center", transform: `scale(${press})` }}>SENT</div>
        ) : (
          <div style={{ width: btn, height: btn, flexShrink: 0, borderRadius: "50%", background: brand.accent, color: "#fff", fontSize: btn * 0.55, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${press})` }}>↑</div>
        )}
      </div>
    </AbsoluteFill>
  );
};
