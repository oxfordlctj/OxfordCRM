import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { BODY, COLORS, DISPLAY } from "../theme";
import { BACK, Burst, EASE_OUT, Flash, LightLeak, Marker, Ring, Scramble, Shockwave, ip } from "./fx";
import { CityBase } from "./cityMap";
import { SCENES, VO } from "./timeline";

const T0 = SCENES.reveal[0];
const HIT = VO.s11 - T0;

export const RevealV3: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const cx = 540;
  const cy = 760;
  const pin = ip(t, [HIT - 0.15, HIT + 0.25], [0, 1], BACK);
  const shake = ip(t, [HIT, HIT + 0.5], [16, 0]) * (t > HIT ? 1 : 0);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, translate: `${Math.sin(t * 90) * shake}px ${Math.cos(t * 70) * shake}px` }}>
      {/* the city, blown up around the new spot */}
      <AbsoluteFill style={{ transformOrigin: "555px 980px", scale: "3.2", translate: `${cx - 555}px ${cy - 980}px`, opacity: 0.55 }}>
        <CityBase t={10} colorRoads={ip(t, [HIT, HIT + 0.6], [0, 1])} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${cx}px ${cy}px, ${COLORS.gold}55 0%, transparent 45%)`, opacity: ip(t, [HIT, HIT + 0.3], [0, 1]) }} />

      {/* sun rays */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: ip(t, [HIT, HIT + 0.4], [0, 0.35]) }}>
        {new Array(18).fill(0).map((_, i) => {
          const a = (i / 18) * Math.PI * 2 + t * 0.25;
          return <path key={i} d={`M ${cx} ${cy} L ${cx + Math.cos(a - 0.06) * 1400} ${cy + Math.sin(a - 0.06) * 1400} L ${cx + Math.cos(a + 0.06) * 1400} ${cy + Math.sin(a + 0.06) * 1400} Z`} fill={COLORS.goldSoft} opacity={0.5} />;
        })}
      </svg>
      <Ring t={t} x={cx} y={cy} r={260} speed={30} opacity={ip(t, [HIT + 0.2, HIT + 0.5], [0, 0.9])} />
      <Ring t={-t} x={cx} y={cy} r={320} speed={18} dash="2 18" width={5} color={COLORS.white} opacity={ip(t, [HIT + 0.3, HIT + 0.6], [0, 0.5])} />
      <Burst t={t} at={HIT} x={cx} y={cy} />
      <Shockwave t={t} at={HIT} x={cx} y={cy} max={900} count={4} />

      {/* the pin */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <ellipse cx={cx} cy={cy + 8} rx={70 * pin} ry={18 * pin} fill="#000" opacity={0.45} />
        <g transform={`translate(${cx} ${cy + (1 - pin) * -500}) scale(${2.6 * Math.max(0.01, pin)})`}>
          <path d="M0,0 C -6,-14 -30,-30 -30,-56 A30,30 0 1 1 30,-56 C 30,-30 6,-14 0,0 Z" fill={COLORS.gold} stroke={COLORS.ink} strokeWidth={2.5} />
          <circle cy={-56} r={21} fill={COLORS.ink} />
          <text y={-46} textAnchor="middle" fill={COLORS.gold} fontFamily={DISPLAY} fontWeight={900} fontSize={26}>
            8
          </text>
        </g>
      </svg>
      {/* embers */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {t > HIT &&
          new Array(40).fill(0).map((_, i) => {
            const age = t - HIT - random(`d${i}`) * 0.6;
            if (age < 0) return null;
            const a = random(`a${i}`) * Math.PI * 2;
            const v = 200 + random(`v${i}`) * 500;
            return <circle key={i} cx={cx + Math.cos(a) * v * age} cy={cy + Math.sin(a) * v * age - 120 * age} r={3 + random(`r${i}`) * 5} fill={COLORS.goldSoft} opacity={Math.max(0, 1 - age / 1.6)} />;
          })}
      </svg>

      <div style={{ position: "absolute", top: 180, width: "100%", textAlign: "center", opacity: ip(t, [HIT + 0.1, HIT + 0.3], [0, 1]) }}>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 38, letterSpacing: 16, color: COLORS.goldSoft }}>НОВЫЙ ФИЛИАЛ</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 200, lineHeight: 1.05, color: COLORS.gold, scale: String(ip(t, [HIT + 0.1, HIT + 0.4], [2.2, 1], EASE_OUT)), textShadow: `0 0 80px ${COLORS.gold}` }}>№8</div>
      </div>
      <div style={{ position: "absolute", top: 1180, width: "100%", textAlign: "center" }}>
        <Scramble text="ДОМПЕЧАТЬ" t={t} at={HIT + 0.35} perChar={0.06} style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 116, color: COLORS.white, letterSpacing: 2, textShadow: "0 10px 40px rgba(0,0,0,0.7)" }} />
        <div style={{ marginTop: 34, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, opacity: ip(t, [HIT + 1.2, HIT + 1.4], [0, 1]) }}>
          <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 52, color: COLORS.white }}>рядом с</span>
          <span style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: COLORS.ink }}>
            <Marker t={t} at={HIT + 1.3}>АЛФЕМО</Marker>
          </span>
        </div>
      </div>
      <Flash t={t} at={HIT} peak={0.95} dur={0.6} />
      <LightLeak t={t} at={HIT + 0.2} dur={1.8} />
      <AbsoluteFill style={{ backgroundColor: COLORS.goldSoft, mixBlendMode: "screen", opacity: ip(t, [0, 0.5], [1, 0]) }} />
    </AbsoluteFill>
  );
};
