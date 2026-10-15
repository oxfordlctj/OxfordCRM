import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Flash, Grain, Vignette, shakeAt } from "./fx";
import { ButReady, DarkStage, FallBehind, OneDay, PainList, Question } from "./scenes/Act1";
import { BrightStage, Cta, Drop, EndCard, Reveal, Skills, Smile } from "./scenes/Act2";
import { C, T, VO_OFFSET, clamp, s } from "./theme";

const Window: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  return frame >= from && frame < to ? <>{children}</> : null;
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { x, y, r } = shakeAt(frame);
  const act1 = frame < s(T.no);
  const blackout = frame >= s(T.blackout) && frame < s(T.no);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <AbsoluteFill style={{ translate: `${x}px ${y}px`, rotate: `${r}deg`, scale: "1.04" }}>
        {act1 ? (
          <>
            <DarkStage />
            <Window from={0} to={s(T.but)}>
              <OneDay />
            </Window>
            <Window from={s(T.but)} to={s(T.pain1)}>
              <ButReady />
            </Window>
            <PainList />
            <FallBehind />
            <Question />
          </>
        ) : (
          <>
            <BrightStage />
            <Drop />
            <Reveal />
            <Skills />
            <Smile />
            <Cta />
            <EndCard />
          </>
        )}
      </AbsoluteFill>

      {blackout ? <AbsoluteFill style={{ backgroundColor: "#000" }} /> : null}

      {/* cinematic letterbox in act 1 */}
      {act1 ? (
        <>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 90, backgroundColor: "#000" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 90, backgroundColor: "#000" }} />
        </>
      ) : null}

      {[T.pain1, T.pain2, T.pain3].map((t) => (
        <Flash key={t} at={s(t)} color={C.red} peak={0.28} len={7} />
      ))}
      <Flash at={s(T.no)} peak={1} len={10} />
      <Flash at={s(T.logo)} peak={0.5} len={8} />
      <Flash at={s(T.end)} peak={0.7} len={10} />

      <Vignette strength={act1 ? 0.85 : 0.18} />
      <Grain opacity={act1 ? 0.35 : 0.12} />
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [0, 10], [1, 0], clamp),
        }}
      />

      <Audio src={staticFile("music_duck.wav")} volume={0.9} />
      <Audio src={staticFile("vo.mp3")} from={s(VO_OFFSET)} volume={1} />
    </AbsoluteFill>
  );
};
