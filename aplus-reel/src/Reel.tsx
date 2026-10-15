import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Flash, Grain, Vignette, shakeAt } from "./fx";
import { ColdOpen, Morning, NightStage, PainList, Race } from "./scenes/Pain";
import { DayStage, EndCard, Reveal, Seats, Shatter, SmileRun, Subjects } from "./scenes/Hope";
import { T, VO_OFFSET, clamp, s } from "./theme";

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { x, y, r } = shakeAt(frame);
  const night = frame >= s(T.pain1) && frame < s(T.no);
  const day = frame >= s(T.no);
  const blackout = frame >= s(T.no) - 8 && frame < s(T.no);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ translate: `${x}px ${y}px`, rotate: `${r}deg`, scale: "1.04" }}>
        <ColdOpen />
        <Morning />
        {night ? (
          <>
            <NightStage tint={frame >= s(T.peers) ? "200,60,80" : "60,110,200"} />
            <PainList />
            <Race />
          </>
        ) : null}
        {day ? (
          <>
            <DayStage />
            <Reveal />
            <Subjects />
            <SmileRun />
            <Seats />
            <EndCard />
            <Shatter />
          </>
        ) : null}
      </AbsoluteFill>

      {blackout ? <AbsoluteFill style={{ backgroundColor: "#000" }} /> : null}

      {/* anamorphic letterbox while the story is serious */}
      {frame >= s(2.3) && frame < s(T.no) ? (
        <>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 70, backgroundColor: "#000" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, backgroundColor: "#000" }} />
        </>
      ) : null}

      {[T.pain1, T.pain2, T.pain3].map((t) => (
        <Flash key={t} at={s(t)} color="#9FC4FF" peak={0.3} len={7} />
      ))}
      <Flash at={s(T.no)} peak={1} len={9} />
      <Flash at={s(T.aplus)} peak={0.55} len={8} />
      <Flash at={s(T.brand)} peak={0.6} len={10} />

      <Vignette strength={day ? 0.22 : 0.7} />
      <Grain opacity={day ? 0.1 : 0.28} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: interpolate(frame, [s(46), s(47)], [0, 1], clamp) }} />

      <Audio src={staticFile("music_duck.wav")} volume={0.9} />
      <Audio src={staticFile("vo.mp3")} from={s(VO_OFFSET)} volume={1} />
    </AbsoluteFill>
  );
};
