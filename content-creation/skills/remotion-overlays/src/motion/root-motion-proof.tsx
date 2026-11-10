import React from "react";
import { CalculateMetadataFunction, Composition, registerRoot } from "remotion";
import { ShapeMorph, zShapeMorph, ShapeMorphProps } from "./ShapeMorph";
import { WordSlideUp, zWordSlideUp, WordSlideUpProps } from "./WordSlideUp";

// Proof entry for content-creation:motion-graphics moves. No footage, no generation. Render with:
//   npx remotion render src/motion/root-motion-proof.tsx <id> out.mp4
type Fmt = { width: number; height: number; fps: number; durationInFrames: number };
const meta =
  <T extends Fmt>(): CalculateMetadataFunction<T> =>
  async ({ props }) => ({
    width: props.width, height: props.height, fps: props.fps, durationInFrames: props.durationInFrames,
  });

const vertical = { width: 1080, height: 1920, fps: 30 };

const morph: ShapeMorphProps = {
  ...vertical, durationInFrames: 210, bg: "#0B0A10", glow: true, push: 0.06, damping: 16, contentDelay: 6,
  states: [
    { at: 0, w: 0.05, h: 0.05, radius: 0.5, rotate: 0, fill: "#7C5CFF", image: null, words: [], textColor: "#FFFFFF", accentColor: "#FFFFFF" },
    { at: 12, w: 0.34, h: 0.34, radius: 0.5, rotate: 0, fill: "#7C5CFF", image: null, words: [], textColor: "#FFFFFF", accentColor: "#FFFFFF" },
    { at: 42, w: 0.34, h: 0.34, radius: 0.22, rotate: 90, fill: "#9B7BFF", image: null, words: [], textColor: "#FFFFFF", accentColor: "#FFFFFF" },
    {
      at: 72, w: 0.8, h: 1.05, radius: 0.06, rotate: 0, fill: "#17141F", image: null,
      words: [{ text: "Plan your week", accentWords: [] }, { text: "in one tap", accentWords: ["one"] }],
      textColor: "#FFFFFF", accentColor: "#A68BFF",
    },
    {
      at: 150, w: 0.66, h: 0.15, radius: 0.5, rotate: 0, fill: "#7C5CFF", image: null,
      words: [{ text: "Get the app", accentWords: [] }], textColor: "#FFFFFF", accentColor: "#FFFFFF",
    },
  ],
};

const words: WordSlideUpProps = {
  ...vertical, durationInFrames: 105,
  lines: [
    { text: "Every word", accentWords: [] },
    { text: "slides up", accentWords: ["slides"] },
    { text: "into place", accentWords: [] },
  ],
  startFrame: 6, wordFrames: 10, staggerFrames: 4, exitFrame: 78, fontSizeFrac: 0.075,
  font: "Inter, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
  colors: { text: "#FFFFFF", accent: "#A68BFF", bg: "#0B0A10" }, transparent: false,
};

const Root: React.FC = () => (
  <>
    <Composition id="shape-morph" component={ShapeMorph} schema={zShapeMorph}
      defaultProps={morph} calculateMetadata={meta<ShapeMorphProps>()} {...morph} />
    <Composition id="word-slide-up" component={WordSlideUp} schema={zWordSlideUp}
      defaultProps={words} calculateMetadata={meta<WordSlideUpProps>()} {...words} />
  </>
);
registerRoot(Root);
