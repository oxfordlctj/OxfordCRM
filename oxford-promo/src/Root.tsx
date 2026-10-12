import React from "react";
import { Composition, Folder } from "remotion";
import { OxfordPromo, PROMO_DURATION } from "./OxfordPromo";
import { DushanbeCity } from "./scenes/DushanbeCity";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";
import { Question } from "./scenes/Question";
import { Reasons } from "./scenes/Reasons";
import { TajikMap } from "./scenes/TajikMap";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="OxfordBranch8" component={OxfordPromo} durationInFrames={PROMO_DURATION} fps={30} width={1080} height={1920} />
      <Folder name="Scenes">
        <Composition id="Intro" component={Intro} durationInFrames={150} fps={30} width={1080} height={1920} />
        <Composition id="Question" component={Question} durationInFrames={96} fps={30} width={1080} height={1920} />
        <Composition id="Tajikistan" component={TajikMap} durationInFrames={210} fps={30} width={1080} height={1920} />
        <Composition id="Dushanbe" component={DushanbeCity} durationInFrames={360} fps={30} width={1080} height={1920} />
        <Composition id="Reasons" component={Reasons} durationInFrames={250} fps={30} width={1080} height={1920} />
        <Composition id="Outro" component={Outro} durationInFrames={180} fps={30} width={1080} height={1920} />
      </Folder>
    </>
  );
};
