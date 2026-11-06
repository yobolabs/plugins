import { AbsoluteFill, Easing, OffthreadVideo, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// Before/after grade slider. The graded plate is a second render of the same
// source (FFmpeg filter in the reference); both layers share the same time base.
export type SliderKey = { frame: number; x: number }; // frame relative to slider entry, x 0-1
export type GradeSliderRevealProps = {
  originalSrc: string;
  gradedSrc: string;
  startFrame: number; // trigger word frame: grade fades in here
  path?: SliderKey[];
  handleY?: number; // 0-1 of height
};

const DEFAULT_PATH: SliderKey[] = [
  { frame: 0, x: 1 },
  { frame: 24, x: 0.5 },
  { frame: 34, x: 0.5 },
  { frame: 50, x: 0.2 },
  { frame: 72, x: 1 },
];

export const GradeSliderReveal: React.FC<GradeSliderRevealProps> = ({
  originalSrc,
  gradedSrc,
  startFrame,
  path = DEFAULT_PATH,
  handleY = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const gradeOpacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sliderStart = startFrame + 25;
  const rel = frame - sliderStart;
  const ease = Easing.inOut(Easing.cubic);
  const x = interpolate(rel, path.map((p) => p.frame), path.map((p) => p.x), {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const lastFrame = path[path.length - 1].frame;
  const lineOpacity =
    rel < 0 ? 0 : interpolate(rel, [lastFrame, lastFrame + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lineX = x * width;
  const handle = width * 0.09;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo src={originalSrc} />
      <AbsoluteFill style={{ opacity: gradeOpacity, clipPath: `inset(0 ${100 - x * 100}% 0 0)` }}>
        <OffthreadVideo src={gradedSrc} muted />
      </AbsoluteFill>
      {lineOpacity > 0 && (
        <AbsoluteFill style={{ opacity: lineOpacity }}>
          <div style={{ position: "absolute", left: lineX - 2, top: 0, width: 4, height, background: "#FFFFFF", boxShadow: "0 0 12px rgba(0,0,0,0.5)" }} />
          <div
            style={{
              position: "absolute",
              left: lineX - handle / 2,
              top: height * handleY - handle / 2,
              width: handle,
              height: handle,
              borderRadius: "50%",
              background: "#FFFFFF",
              boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1C1C1E",
              fontSize: handle * 0.32,
              fontWeight: 900,
              letterSpacing: handle * 0.04,
              fontFamily: "Arial, sans-serif",
            }}
          >
            ◀▶
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
