import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Background, Finish } from "../components/Atmosphere";
import "../theme";
import { CityV3 } from "./City";
import { HookV3 } from "./Hook";
import { OutroV3 } from "./Outro";
import { RevealV3 } from "./Reveal";
import { Subs } from "./Subs";
import { TajikV3 } from "./Tajik";
import { SCENES } from "./timeline";
import { WhyV3 } from "./Why";

const f = (s: number) => Math.round(s * 30);

export const OxfordBranch8: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#050C1C" }}>
      <Background />
      <Sequence name="Хук" from={f(SCENES.hook[0])} durationInFrames={f(SCENES.hook[1] - SCENES.hook[0])} premountFor={fps}>
        <HookV3 />
      </Sequence>
      <Sequence name="Таджикистан" from={f(SCENES.tajik[0])} durationInFrames={f(SCENES.tajik[1] - SCENES.tajik[0])} premountFor={fps}>
        <TajikV3 />
      </Sequence>
      <Sequence name="Душанбе" from={f(SCENES.city[0])} durationInFrames={f(SCENES.city[1] - SCENES.city[0])} premountFor={fps}>
        <CityV3 />
      </Sequence>
      <Sequence name="Филиал №8" from={f(SCENES.reveal[0])} durationInFrames={f(SCENES.reveal[1] - SCENES.reveal[0])} premountFor={fps}>
        <RevealV3 />
      </Sequence>
      <Sequence name="Почему здесь" from={f(SCENES.why[0])} durationInFrames={f(SCENES.why[1] - SCENES.why[0])} premountFor={fps}>
        <WhyV3 />
      </Sequence>
      <Sequence name="Финал" from={f(SCENES.outro[0])} durationInFrames={f(SCENES.outro[1] - SCENES.outro[0])} premountFor={fps}>
        <OutroV3 />
      </Sequence>
      <Subs />
      <Finish />
      <Audio src={staticFile("audio/soundtrack.wav")} />
    </AbsoluteFill>
  );
};
