import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Background, Finish } from "./components/Atmosphere";
import { DushanbeCity } from "./scenes/DushanbeCity";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";
import { Question } from "./scenes/Question";
import { Reasons } from "./scenes/Reasons";
import { TajikMap } from "./scenes/TajikMap";
import "./theme";

export const OxfordPromo: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        <TransitionSeries.Sequence name="Intro" durationInFrames={150} premountFor={fps}>
          <Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence name="Question" durationInFrames={96} premountFor={fps}>
          <Question />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
        <TransitionSeries.Sequence name="Tajikistan" durationInFrames={210} premountFor={fps}>
          <TajikMap />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 6 })} />
        <TransitionSeries.Sequence name="Dushanbe" durationInFrames={360} premountFor={fps}>
          <DushanbeCity />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 14 })} />
        <TransitionSeries.Sequence name="Reasons" durationInFrames={250} premountFor={fps}>
          <Reasons />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence name="Outro" durationInFrames={180} premountFor={fps}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Finish />
    </AbsoluteFill>
  );
};

// 150+96+210+360+250+180 - (10+8+6+14+12)
export const PROMO_DURATION = 1196;
