import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { NEW_BRANCH } from "../data/branches";
import { SplitText } from "../components/SplitText";
import { BACK, BODY, COLORS, DISPLAY, EASE_IN_OUT, ip } from "../theme";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      {/* rings radiating behind №8 */}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {new Array(5).fill(0).map((_, k) => {
          const ph = ((frame / 60 + k / 5) % 1 + 1) % 1;
          return <circle key={k} cx={540} cy={700} r={120 + ph * 640} fill="none" stroke={COLORS.gold} strokeWidth={2} opacity={(1 - ph) * 0.5 * ip(frame, [10, 30], [0, 1])} />;
        })}
      </svg>
      {/* diagonal gold wipe */}
      <div
        style={{
          position: "absolute",
          top: -400,
          height: 2800,
          width: 520,
          left: ip(frame, [0, 22], [-800, 1500], EASE_IN_OUT),
          rotate: "20deg",
          background: `linear-gradient(90deg, transparent, ${COLORS.gold}, ${COLORS.goldSoft}, ${COLORS.gold}, transparent)`,
          opacity: 0.95,
        }}
      />

      <div style={{ position: "absolute", top: 300, fontFamily: BODY, fontWeight: 800, fontSize: 36, letterSpacing: 14, color: COLORS.goldSoft, opacity: ip(frame, [12, 26], [0, 1]) }}>
        НОВЫЙ ФИЛИАЛ
      </div>
      <div
        style={{
          position: "absolute",
          top: 520,
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: 300,
          lineHeight: 1,
          color: COLORS.gold,
          textShadow: `0 0 100px ${COLORS.gold}88`,
          scale: String(ip(frame, [14, 34], [2.2, 1], BACK)),
          opacity: ip(frame, [14, 22], [0, 1]),
        }}
      >
        №8
      </div>
      <div style={{ position: "absolute", top: 930, width: "100%" }}>
        <SplitText text="ШОХМАНСУР" start={28} stagger={2} duration={18} mode="drop" style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 92, color: COLORS.white }} />
        <div style={{ marginTop: 18, textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 46, color: COLORS.mute, opacity: ip(frame, [44, 58], [0, 1]) }}>
          {NEW_BRANCH.address}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1200,
          padding: "26px 60px",
          borderRadius: 60,
          background: COLORS.gold,
          color: COLORS.ink,
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: 50,
          letterSpacing: 2,
          overflow: "hidden",
          scale: String(ip(frame, [56, 72], [0, 1], BACK)),
          boxShadow: `0 0 60px ${COLORS.gold}77`,
        }}
      >
        СКОРО ОТКРЫТИЕ
        <div style={{ position: "absolute", top: -40, bottom: -40, width: 90, left: ip(frame, [76, 100], [-200, 800]), rotate: "20deg", background: "rgba(255,255,255,0.55)" }} />
      </div>
      <div style={{ position: "absolute", top: 1390, width: 920, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 54, lineHeight: 1.25, color: COLORS.white, opacity: ip(frame, [80, 96], [0, 1]), translate: `0px ${ip(frame, [80, 100], [30, 0])}px` }}>
        Oxford — теперь ещё
        <br />
        ближе к тебе
      </div>
      <div style={{ position: "absolute", bottom: 130, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: ip(frame, [100, 116], [0, 1]) }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: COLORS.white, letterSpacing: 6 }}>OXFORD</div>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 34, letterSpacing: 8, color: COLORS.mute }}>УЧЕБНЫЙ ЦЕНТР · 8 ФИЛИАЛОВ</div>
      </div>
    </AbsoluteFill>
  );
};
