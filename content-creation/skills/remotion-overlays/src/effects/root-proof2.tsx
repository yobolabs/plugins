import React from "react";
import { CalculateMetadataFunction, Composition, registerRoot } from "remotion";
import { TextBehindSubject, zTextBehindSubject, TextBehindSubjectProps } from "./TextBehindSubject";
import { MagazineCover, zMagazineCover, MagazineCoverProps } from "./MagazineCover";

// Proof entry for the matte effects. Render with:
//   npx remotion render src/effects/root-proof2.tsx <id> out.mp4 --public-dir=<dir with plate/ and matte/>
type Fmt = { width: number; height: number; fps: number; durationInFrames: number };
const meta =
  <T extends Fmt>(): CalculateMetadataFunction<T> =>
  async ({ props }) => ({
    width: props.width, height: props.height, fps: props.fps, durationInFrames: props.durationInFrames,
  });
const fmt = { width: 1080, height: 1920, fps: 30, durationInFrames: 117 };
const seq = { platePattern: "plate/{n}.png", mattePattern: "matte/{n}.png" };

const tbs: TextBehindSubjectProps = {
  ...fmt, ...seq, lines: ["STUDIO"], style: "solid",
  colors: { fill: "#FFFFFF", accent: "#FFB020", stroke: "#FFFFFF" },
  font: "Impact, 'Arial Narrow', sans-serif", y: 0.3, sizeFrac: 0.18,
  startFrame: 8, endFrame: 117, greyToWhite: true,
};
const mag: MagazineCoverProps = {
  ...fmt, ...seq, masthead: "STUDIO", issueLine: "The Creator Issue - Vol. 7",
  coverLines: ["Edit faster than you film", "12 effects, zero credits"], stickerText: "NEW ISSUE",
  startFrame: 6, beats: [18, 32, 46, 62, 76],
  brand: { accent: "#E0302A", serif: "Didot, 'Bodoni 72', 'Playfair Display', serif", ink: "#111111" },
  flatten: null, plate: { scale: 1.27, originX: 0.5, originY: 1 }, feather: 0.5,
};

const Root: React.FC = () => (
  <>
    <Composition id="text-behind-subject" component={TextBehindSubject} schema={zTextBehindSubject}
      defaultProps={tbs} calculateMetadata={meta<TextBehindSubjectProps>()} {...fmt} />
    <Composition id="magazine-cover" component={MagazineCover} schema={zMagazineCover}
      defaultProps={mag} calculateMetadata={meta<MagazineCoverProps>()} {...fmt} />
  </>
);
registerRoot(Root);
