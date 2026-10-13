import React from "react";
import { Composition, Folder } from "remotion";
import { CityV3 } from "./v3/City";
import { HookV3 } from "./v3/Hook";
import { OutroV3 } from "./v3/Outro";
import { OxfordBranch8 } from "./v3/Promo";
import { RevealV3 } from "./v3/Reveal";
import { TajikV3 } from "./v3/Tajik";
import { DURATION, SCENES } from "./v3/timeline";
import { WhyV3 } from "./v3/Why";
import { OxfordStory } from "./v4/Story";
import { OxfordShinobi } from "./v5/Episode";

const len = (s: number[]) => Math.round((s[1] - s[0]) * 30);
const V = { fps: 30, width: 1080, height: 1920 };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="OxfordShinobi" component={OxfordShinobi} durationInFrames={60 * 30} {...V} />
      <Composition id="OxfordStory" component={OxfordStory} durationInFrames={60 * 30} {...V} />
      <Composition id="OxfordBranch8" component={OxfordBranch8} durationInFrames={Math.round(DURATION * 30)} {...V} />
      <Folder name="Scenes">
        <Composition id="Hook" component={HookV3} durationInFrames={len(SCENES.hook)} {...V} />
        <Composition id="Tajikistan" component={TajikV3} durationInFrames={len(SCENES.tajik)} {...V} />
        <Composition id="Dushanbe" component={CityV3} durationInFrames={len(SCENES.city)} {...V} />
        <Composition id="Reveal" component={RevealV3} durationInFrames={len(SCENES.reveal)} {...V} />
        <Composition id="WhyHere" component={WhyV3} durationInFrames={len(SCENES.why)} {...V} />
        <Composition id="Outro" component={OutroV3} durationInFrames={len(SCENES.outro)} {...V} />
      </Folder>
    </>
  );
};
