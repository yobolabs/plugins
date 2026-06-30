import { Composition, CalculateMetadataFunction } from "remotion";
import { Intro } from "./overlays/Intro";
import { KineticHook } from "./overlays/KineticHook";
import { Callout } from "./overlays/Callout";
import { Cta } from "./overlays/Cta";
import {
  zIntro,
  zKineticHook,
  zCallout,
  zCta,
  IntroProps,
  KineticHookProps,
  CalloutProps,
  CtaProps,
} from "./schema";

// Every overlay renders as a transparent ProRes 4444 .mov (alpha) so it composites
// over the video track in CapCut. Dimensions + duration come from the props.
type AnyProps = { width: number; height: number; fps: number; durationInFrames: number };

const mkMeta =
  <T extends AnyProps>(): CalculateMetadataFunction<T> =>
  async ({ props }) => ({
    width: props.width,
    height: props.height,
    fps: props.fps,
    durationInFrames: props.durationInFrames,
    defaultCodec: "prores",
    defaultVideoImageFormat: "png",
    defaultPixelFormat: "yuva444p10le",
    defaultProResProfile: "4444",
  });

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="intro"
        component={Intro}
        schema={zIntro}
        defaultProps={zIntro.parse({})}
        calculateMetadata={mkMeta<IntroProps>()}
        durationInFrames={45}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="kinetic-hook"
        component={KineticHook}
        schema={zKineticHook}
        defaultProps={zKineticHook.parse({})}
        calculateMetadata={mkMeta<KineticHookProps>()}
        durationInFrames={60}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="callout"
        component={Callout}
        schema={zCallout}
        defaultProps={zCallout.parse({})}
        calculateMetadata={mkMeta<CalloutProps>()}
        durationInFrames={60}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="cta"
        component={Cta}
        schema={zCta}
        defaultProps={zCta.parse({})}
        calculateMetadata={mkMeta<CtaProps>()}
        durationInFrames={75}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
