import { AbsoluteFill, Composition, OffthreadVideo, registerRoot, staticFile } from "remotion";
import { WordCaptions, WordCaptionsProps } from "./WordCaptions";
import { PromptBar, PromptBarProps } from "./PromptBar";
import { GradeSliderReveal } from "./GradeSliderReveal";

// Proof-only entry: plate + one effect per composition. Render with
// npx remotion render src/effects/root-proof1.tsx <id> out.mp4 --public-dir <dir with clip.mp4, graded.mp4> --props=...
type Fmt = { durationInFrames: number; plate: string };
const fmt = { width: 1080, height: 1920, fps: 30 };
const meta = async ({ props }: { props: Fmt }) => ({ durationInFrames: props.durationInFrames });
const brand = { font: "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif", accent: "#FFD400" };

const CaptionsProof: React.FC<Fmt & WordCaptionsProps> = ({ plate, ...p }) => (
  <AbsoluteFill>
    <OffthreadVideo src={staticFile(plate)} />
    <WordCaptions {...p} />
  </AbsoluteFill>
);
const PromptProof: React.FC<Fmt & PromptBarProps> = ({ plate, ...p }) => (
  <AbsoluteFill>
    <OffthreadVideo src={staticFile(plate)} />
    <PromptBar {...p} />
  </AbsoluteFill>
);
const SliderProof: React.FC<Fmt & { graded: string; startFrame: number; handleY?: number }> = ({ plate, graded, startFrame, handleY }) => (
  <GradeSliderReveal originalSrc={staticFile(plate)} gradedSrc={staticFile(graded)} startFrame={startFrame} handleY={handleY} />
);

const Root: React.FC = () => (
  <>
    <Composition id="proof-word-captions" component={CaptionsProof as React.FC<any>} {...fmt} durationInFrames={117} calculateMetadata={meta as any}
      defaultProps={{ plate: "clip.mp4", durationInFrames: 117, words: [], mode: "phrase", brand }} />
    <Composition id="proof-prompt-bar" component={PromptProof as React.FC<any>} {...fmt} durationInFrames={117} calculateMetadata={meta as any}
      defaultProps={{ plate: "clip.mp4", durationInFrames: 117, variant: "prompt", text: "Make the whole video warm and golden", startFrame: 5, brand }} />
    <Composition id="proof-grade-slider" component={SliderProof as React.FC<any>} {...fmt} durationInFrames={117} calculateMetadata={meta as any}
      defaultProps={{ plate: "clip.mp4", graded: "graded.mp4", durationInFrames: 117, startFrame: 5 }} />
  </>
);
registerRoot(Root);
