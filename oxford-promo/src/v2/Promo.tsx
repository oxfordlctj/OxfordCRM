import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Background, Finish } from "../components/Atmosphere";
import "../theme";
import { CityScene } from "./CityScene";
import { IntroV2 } from "./Intro";
import { MapScene } from "./MapScene";
import { OutroV2 } from "./Outro";
import { Subtitles } from "./Subtitles";
import { SCENES } from "./timeline";

export const OxfordBranch8: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#050C1C" }}>
      <Background />
      <Sequence name="Intro" from={SCENES.intro[0] * fps} durationInFrames={(SCENES.intro[1] - SCENES.intro[0]) * fps} premountFor={fps}>
        <IntroV2 />
      </Sequence>
      <Sequence name="City 3D" from={SCENES.city[0] * fps} durationInFrames={(SCENES.city[1] - SCENES.city[0]) * fps} premountFor={fps}>
        <CityScene />
      </Sequence>
      <Sequence name="Tajikistan 3D" from={Math.round(SCENES.map[0] * fps)} durationInFrames={Math.round((SCENES.map[1] - SCENES.map[0]) * fps)} premountFor={fps}>
        <MapScene />
      </Sequence>
      <Sequence name="Outro" from={SCENES.outro[0] * fps} durationInFrames={(SCENES.outro[1] - SCENES.outro[0]) * fps} premountFor={fps}>
        <OutroV2 />
      </Sequence>
      <Subtitles />
      <Finish />
      <Audio src={staticFile("audio/soundtrack.wav")} />
    </AbsoluteFill>
  );
};
