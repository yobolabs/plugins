import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Video, Audio } from "@remotion/media";
import { TransitionSeries, linearTiming, TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { AdProps } from "./schema";
import { Caption } from "./Caption";
import { Intro } from "../overlays/Intro";
import { KineticHook } from "../overlays/KineticHook";
import { Callout } from "../overlays/Callout";
import { Cta } from "../overlays/Cta";

const overlayComp = {
  intro: Intro,
  "kinetic-hook": KineticHook,
  callout: Callout,
  cta: Cta,
} as const;

const presentationFor = (type: AdProps["transition"]["type"]): TransitionPresentation<any> => {
  switch (type) {
    case "slide-left":
      return slide({ direction: "from-right" });
    case "slide-right":
      return slide({ direction: "from-left" });
    case "slide-up":
      return slide({ direction: "from-bottom" });
    case "slide-down":
      return slide({ direction: "from-top" });
    case "wipe":
      return wipe();
    default:
      return fade();
  }
};

export const Ad: React.FC<AdProps> = ({
  slots,
  transition,
  music,
  brand,
  overlays,
  width,
  height,
}) => {
  const { fps } = useVideoConfig();
  const useTrans = transition.type !== "none" && transition.durationInFrames > 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {slots.flatMap((s, i) => {
          const dur = Math.max(1, Math.round(s.trimDur * fps));
          const seq = (
            <TransitionSeries.Sequence key={`s${i}`} durationInFrames={dur}>
              <AbsoluteFill>
                <Video
                  src={staticFile(s.clip)}
                  trimBefore={Math.round(s.trimStart * fps)}
                  trimAfter={Math.round((s.trimStart + s.trimDur) * fps)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <Caption text={s.caption} brand={brand} />
              </AbsoluteFill>
            </TransitionSeries.Sequence>
          );
          if (i < slots.length - 1 && useTrans) {
            return [
              seq,
              <TransitionSeries.Transition
                key={`t${i}`}
                presentation={presentationFor(transition.type)}
                timing={linearTiming({ durationInFrames: transition.durationInFrames })}
              />,
            ];
          }
          return [seq];
        })}
      </TransitionSeries>

      {music ? <Audio src={staticFile(music.src)} volume={music.volume} /> : null}

      {overlays.map((o, i) => {
        const C = overlayComp[o.type];
        return (
          <Sequence
            key={`o${i}`}
            from={Math.round(o.at * fps)}
            durationInFrames={o.durationInFrames}
            layout="none"
          >
            {/* overlay components read durationInFrames from props, so the in/out fade
                keys off the overlay's own length, not the ad's total. */}
            <C
              {...({
                brand,
                width,
                height,
                fps,
                durationInFrames: o.durationInFrames,
                ...o.props,
              } as any)}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
