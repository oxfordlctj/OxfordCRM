import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Door } from "./Door";
import { Cta, Summit } from "./Finale";
import { PageTurn } from "./Kit";
import { Mountain } from "./Mountain";
import { Night } from "./Night";
import { Reasons } from "./Reasons";
import { T } from "./timeline";
import "./theme";

const f = (s: number) => Math.round(s * 30);
const len = (s: readonly number[]) => f(s[1] - s[0]);

const Turns: React.FC = () => {
  const t = useCurrentFrame() / 30;
  return (
    <>
      {T.turns.map((at) => (
        <PageTurn key={at} t={t} at={at} />
      ))}
    </>
  );
};

/** «Сказка про Амира»: a 60-second animated story for Oxford. */
export const OxfordStory: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B1033" }}>
      <Sequence name="1. Ночь и мечта" from={f(T.night[0])} durationInFrames={len(T.night)} premountFor={fps}>
        <Night />
      </Sequence>
      <Sequence name="2. Гора английского" from={f(T.mountain[0])} durationInFrames={len(T.mountain)} premountFor={fps}>
        <Mountain />
      </Sequence>
      <Sequence name="3. Волшебная дверь" from={f(T.door[0])} durationInFrames={len(T.door)} premountFor={fps}>
        <Door />
      </Sequence>
      <Sequence name="4. Почему Oxford" from={f(T.reasons[0])} durationInFrames={len(T.reasons)} premountFor={fps}>
        <Reasons />
      </Sequence>
      <Sequence name="5. Вершина" from={f(T.summit[0])} durationInFrames={len(T.summit)} premountFor={fps}>
        <Summit />
      </Sequence>
      <Sequence name="6. Запись" from={f(T.cta[0])} durationInFrames={len(T.cta)} premountFor={fps}>
        <Cta />
      </Sequence>
      <Turns />
      <Audio src={staticFile("audio/story.wav")} />
    </AbsoluteFill>
  );
};
