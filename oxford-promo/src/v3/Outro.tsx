import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { BODY, COLORS, DISPLAY } from "../theme";
import { EASE_IN_OUT } from "../theme";
import { BACK, Confetti, EASE_OUT, Flash, Ring, ip, photo } from "./fx";
import { SCENES, VO } from "./timeline";

const T0 = SCENES.outro[0];
const TL = VO.s16 - T0;
const TS = VO.s17 - T0;
const END = SCENES.outro[1] - T0;

const POLAROIDS = [
  { src: "smile.jpg", x: -40, y: 140, r: -12, from: [-700, 0] },
  { src: "blog-2.jpg", x: 760, y: 120, r: 10, from: [700, 0] },
  { src: "course-3.jpg", x: -130, y: 1500, r: 8, from: [-700, 200] },
  { src: "hero-banner-1.jpg", x: 870, y: 1520, r: -9, from: [700, 200] },
];

export const OutroV3: React.FC = () => {
  const t = useCurrentFrame() / 30;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, alignItems: "center" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${COLORS.royal}88, ${COLORS.ink} 65%)` }} />
      <Ring t={t} x={540} y={820} r={430} speed={10} opacity={0.5} />
      <Ring t={-t} x={540} y={820} r={480} speed={7} dash="1 12" color={COLORS.sky} width={4} opacity={0.4} />

      {POLAROIDS.map((p, i) => {
        const s = TS + 0.3 + i * 0.1;
        const k = ip(t, [s, s + 0.5], [0, 1], EASE_OUT);
        return (
          <div key={p.src} style={{ position: "absolute", left: p.x, top: p.y, width: 340, padding: "14px 14px 50px", background: "#fdfcf8", rotate: `${p.r}deg`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", translate: `${p.from[0] * (1 - k)}px ${p.from[1] * (1 - k)}px`, opacity: k }}>
            <Img src={photo(p.src)} style={{ width: "100%", height: 300, objectFit: "cover" }} />
          </div>
        );
      })}

      <div style={{ position: "absolute", top: -400, height: 2800, width: 380, left: ip(t, [0, 0.6], [-700, 1400], EASE_IN_OUT), rotate: "20deg", background: `linear-gradient(90deg, transparent, ${COLORS.gold}cc, #fff7df, ${COLORS.gold}cc, transparent)` }} />

      <div style={{ position: "absolute", top: 560, display: "flex", perspective: 1200 }}>
        {"OXFORD".split("").map((ch, i) => {
          const s = TL + i * 0.06;
          return (
            <span key={i} style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 900, fontSize: 170, color: COLORS.white, rotate: `y ${ip(t, [s, s + 0.5], [90, 0], EASE_OUT)}deg`, opacity: ip(t, [s, s + 0.2], [0, 1]), textShadow: `0 0 50px ${COLORS.sky}66` }}>
              {ch}
            </span>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 790, display: "flex", alignItems: "baseline", gap: 24, opacity: ip(t, [TL + 0.9, TL + 1.0], [0, 1]), scale: String(ip(t, [TL + 0.9, TL + 1.2], [1.8, 1], EASE_OUT)) }}>
        <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 56, color: COLORS.goldSoft, letterSpacing: 6 }}>ФИЛИАЛ</span>
        <span style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 200, color: COLORS.gold, textShadow: `0 0 70px ${COLORS.gold}aa` }}>№8</span>
      </div>
      <div style={{ position: "absolute", top: 1060, fontFamily: BODY, fontWeight: 800, fontSize: 42, color: COLORS.white, letterSpacing: 2, opacity: ip(t, [TL + 1.4, TL + 1.7], [0, 1]) }}>
        Домпечать · рядом с Алфемо
      </div>
      <div style={{ position: "absolute", top: 1170, padding: "26px 64px", borderRadius: 999, background: `linear-gradient(180deg, ${COLORS.goldSoft}, ${COLORS.gold})`, color: COLORS.ink, fontFamily: DISPLAY, fontWeight: 900, fontSize: 60, overflow: "hidden", scale: String(ip(t, [TS, TS + 0.35], [0, 1], BACK)), boxShadow: `0 0 80px ${COLORS.gold}99` }}>
        СКОРО ОТКРЫТИЕ
        <div style={{ position: "absolute", top: -60, bottom: -60, width: 110, left: ip(t, [TS + 0.5, TS + 1.1], [-200, 900]), rotate: "20deg", background: "rgba(255,255,255,0.7)" }} />
      </div>
      <div style={{ position: "absolute", top: 1340, fontFamily: DISPLAY, fontWeight: 900, fontSize: 72, color: COLORS.white, opacity: ip(t, [TS + 1.0, TS + 1.2], [0, 1]), scale: String(ip(t, [TS + 1.0, TS + 1.3], [1.6, 1], EASE_OUT)) }}>
        ЗАПИШИСЬ ПЕРВЫМ!
      </div>
      <Confetti t={t} at={TS + 1.0} x={540} y={1380} />
      <Flash t={t} at={TS + 1.0} peak={0.35} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: ip(t, [END - 0.5, END], [0, 1]) }} />
    </AbsoluteFill>
  );
};
