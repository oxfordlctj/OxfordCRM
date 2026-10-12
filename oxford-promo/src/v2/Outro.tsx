import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BACK, BODY, COLORS, DISPLAY, EASE_IN_OUT, EASE_OUT, ip } from "../theme";
import { HITS, SCENES } from "./timeline";

const T0 = SCENES.outro[0];
const L = (g: number) => g - T0;

export const OutroV2: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const tl = L(HITS.logo);
  const ts = L(HITS.soon);
  const end = SCENES.outro[1] - T0;
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ position: "absolute", top: -400, height: 2800, width: 380, left: ip(t, [0, 0.7], [-700, 1400], EASE_IN_OUT), rotate: "20deg", background: `linear-gradient(90deg, transparent, ${COLORS.gold}cc, #fff7df, ${COLORS.gold}cc, transparent)`, opacity: 0.9 }} />

      <div style={{ position: "absolute", top: 520, display: "flex", perspective: 1400 }}>
        {"OXFORD".split("").map((ch, i) => {
          const s = tl + i * 0.06;
          return (
            <span key={i} style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 900, fontSize: 176, color: COLORS.white, transformOrigin: "50% 50% -60px", rotate: `y ${ip(t, [s, s + 0.55], [90, 0], EASE_OUT)}deg`, opacity: ip(t, [s, s + 0.2], [0, 1]), textShadow: `0 0 60px ${COLORS.sky}66` }}>
              {ch}
            </span>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 740, display: "flex", alignItems: "center", gap: 26, opacity: ip(t, [tl + 0.7, tl + 1.0], [0, 1]) }}>
        <div style={{ width: ip(t, [tl + 0.7, tl + 1.2], [0, 140], EASE_OUT), height: 4, background: COLORS.gold }} />
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 40, letterSpacing: 16, color: COLORS.goldSoft }}>BRANCH</div>
        <div style={{ width: ip(t, [tl + 0.7, tl + 1.2], [0, 140], EASE_OUT), height: 4, background: COLORS.gold }} />
      </div>
      <div style={{ position: "absolute", top: 800, fontFamily: DISPLAY, fontWeight: 900, fontSize: 300, lineHeight: 1.1, color: COLORS.gold, textShadow: `0 0 90px ${COLORS.gold}aa`, scale: String(ip(t, [tl + 1.0, tl + 1.35], [2.4, 1], EASE_OUT)), opacity: ip(t, [tl + 1.0, tl + 1.12], [0, 1]), filter: `blur(${ip(t, [tl + 1.0, tl + 1.3], [24, 0])}px)` }}>
        №8
      </div>
      <div style={{ position: "absolute", top: 1170, fontFamily: BODY, fontWeight: 800, fontSize: 40, letterSpacing: 6, color: COLORS.white, opacity: ip(t, [tl + 1.6, tl + 2.0], [0, 1]) }}>
        DOMPECHAT · NEXT TO ALFEMO
      </div>
      <div
        style={{
          position: "absolute",
          top: 1300,
          padding: "28px 70px",
          borderRadius: 999,
          background: `linear-gradient(180deg, ${COLORS.goldSoft}, ${COLORS.gold})`,
          color: COLORS.ink,
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: 58,
          letterSpacing: 3,
          overflow: "hidden",
          scale: String(ip(t, [ts, ts + 0.35], [0, 1], BACK)),
          boxShadow: `0 0 80px ${COLORS.gold}99`,
        }}
      >
        OPENING SOON
        <div style={{ position: "absolute", top: -60, bottom: -60, width: 110, left: ip(t, [ts + 0.5, ts + 1.1], [-200, 900]), rotate: "20deg", background: "rgba(255,255,255,0.7)" }} />
      </div>
      <div style={{ position: "absolute", top: 1480, fontFamily: DISPLAY, fontWeight: 800, fontSize: 50, color: COLORS.white, opacity: ip(t, [ts + 1.2, ts + 1.5], [0, 1]), translate: `0px ${ip(t, [ts + 1.2, ts + 1.6], [30, 0], EASE_OUT)}px` }}>
        Be the first to join
      </div>
      <div style={{ position: "absolute", top: 1560, fontFamily: BODY, fontWeight: 700, fontSize: 32, letterSpacing: 6, color: COLORS.mute, opacity: ip(t, [ts + 1.6, ts + 1.9], [0, 1]) }}>
        OXFORD LEARNING CENTER · DUSHANBE
      </div>
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: ip(t, [end - 0.6, end], [0, 1]) }} />
    </AbsoluteFill>
  );
};
