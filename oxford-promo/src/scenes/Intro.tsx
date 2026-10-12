import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MaskLine, SplitText } from "../components/SplitText";
import { BODY, COLORS, DISPLAY, EASE_IN, EASE_IN_OUT, ip } from "../theme";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = ip(frame, [128, 150], [0, 1], EASE_IN);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {/* light streak */}
      <div
        style={{
          position: "absolute",
          top: 860,
          left: ip(frame, [0, 26], [-900, 1200], EASE_IN_OUT),
          width: 700,
          height: 4,
          background: `linear-gradient(90deg, transparent, ${COLORS.goldSoft}, transparent)`,
          boxShadow: `0 0 40px 10px ${COLORS.gold}66`,
          opacity: ip(frame, [0, 6, 22, 26], [0, 1, 1, 0]),
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          scale: String(1 + exit * 0.25),
          opacity: 1 - exit,
          filter: `blur(${exit * 16}px)`,
        }}
      >
        <SplitText
          text="OXFORD"
          start={8}
          stagger={3}
          duration={22}
          mode="blur"
          style={{
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 150,
            color: COLORS.white,
            letterSpacing: 6,
            textShadow: `0 0 60px ${COLORS.sky}66`,
          }}
        />
        <div
          style={{
            height: 6,
            width: 640,
            marginTop: 18,
            background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldSoft})`,
            borderRadius: 3,
            scale: `${ip(frame, [30, 55], [0, 1])} 1`,
            boxShadow: `0 0 30px ${COLORS.gold}aa`,
          }}
        />
        <div
          style={{
            marginTop: 30,
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 40,
            color: COLORS.mute,
            letterSpacing: ip(frame, [35, 70], [40, 16]),
            opacity: ip(frame, [35, 55], [0, 1]),
          }}
        >
          УЧЕБНЫЙ ЦЕНТР
        </div>
        <div style={{ height: 120 }} />
        <div style={{ position: "relative", height: 110, width: 1000 }}>
          <MaskLine start={66} end={98} style={{ position: "absolute", inset: 0, textAlign: "center" }}>
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 66, color: COLORS.white }}>
              7 филиалов
            </span>
          </MaskLine>
          <MaskLine start={104} style={{ position: "absolute", inset: 0, textAlign: "center" }}>
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 66, color: COLORS.white }}>
              Мы <span style={{ color: COLORS.gold }}>растём</span>
            </span>
          </MaskLine>
        </div>
      </div>
    </AbsoluteFill>
  );
};
