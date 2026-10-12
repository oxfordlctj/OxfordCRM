import React from "react";
import { Composition, Folder } from "remotion";
import { OxfordBranch8 } from "./v2/Promo";
import { CityScene } from "./v2/CityScene";
import { IntroV2 } from "./v2/Intro";
import { MapScene } from "./v2/MapScene";
import { OutroV2 } from "./v2/Outro";
import { DURATION, SCENES } from "./v2/timeline";

const len = (s: number[]) => Math.round((s[1] - s[0]) * 30);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="OxfordBranch8" component={OxfordBranch8} durationInFrames={Math.round(DURATION * 30)} fps={30} width={1080} height={1920} />
      <Folder name="Scenes">
        <Composition id="Intro" component={IntroV2} durationInFrames={len(SCENES.intro)} fps={30} width={1080} height={1920} />
        <Composition id="Tajikistan" component={MapScene} durationInFrames={len(SCENES.map)} fps={30} width={1080} height={1920} />
        <Composition id="Dushanbe" component={CityScene} durationInFrames={len(SCENES.city)} fps={30} width={1080} height={1920} />
        <Composition id="Outro" component={OutroV2} durationInFrames={len(SCENES.outro)} fps={30} width={1080} height={1920} />
      </Folder>
    </>
  );
};
