import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Fansub } from "./Fx";
import { Attack, Battle, ColdOpen, Hero, Opening } from "./ScenesA";
import { Awaken, End, Final, Interview } from "./ScenesB";
import { S, SUBS, VO } from "./timeline";
import durations from "./vo-durations.json";
import "./theme";

const f = (s: number) => Math.round(s * 30);
const len = (s: readonly number[]) => f(s[1] - s[0]);

const Subs: React.FC = () => {
  const t = useCurrentFrame() / 30;
  return (
    <>
      {(Object.keys(VO) as (keyof typeof VO)[]).map((k) => (
        <Fansub key={k} t={t} at={VO[k] - 0.05} until={VO[k] + (durations as Record<string, number>)[k] + 0.35} text={SUBS[k].ru} who={SUBS[k].who} />
      ))}
    </>
  );
};

/** «Oxford Shinobi», episode 8: an anime-style ad. */
export const OxfordShinobi: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0D0B12" }}>
      <Sequence name="Пролог" from={f(S.cold[0])} durationInFrames={len(S.cold)} premountFor={fps}>
        <ColdOpen />
      </Sequence>
      <Sequence name="Опенинг" from={f(S.op[0])} durationInFrames={len(S.op)} premountFor={fps}>
        <Opening />
      </Sequence>
      <Sequence name="Атака лиса" from={f(S.attack[0])} durationInFrames={len(S.attack)} premountFor={fps}>
        <Attack />
      </Sequence>
      <Sequence name="Герой" from={f(S.hero[0])} durationInFrames={len(S.hero)} premountFor={fps}>
        <Hero />
      </Sequence>
      <Sequence name="Схватка" from={f(S.battle[0])} durationInFrames={len(S.battle)} premountFor={fps}>
        <Battle />
      </Sequence>
      <Sequence name="Пробуждение" from={f(S.awaken[0])} durationInFrames={len(S.awaken)} premountFor={fps}>
        <Awaken />
      </Sequence>
      <Sequence name="Печать Света" from={f(S.final[0])} durationInFrames={len(S.final)} premountFor={fps}>
        <Final />
      </Sequence>
      <Sequence name="Интервью" from={f(S.interview[0])} durationInFrames={len(S.interview)} premountFor={fps}>
        <Interview />
      </Sequence>
      <Sequence name="Продолжение следует" from={f(S.end[0])} durationInFrames={len(S.end)} premountFor={fps}>
        <End />
      </Sequence>
      <Subs />
      <Audio src={staticFile("audio/shinobi.wav")} />
    </AbsoluteFill>
  );
};
