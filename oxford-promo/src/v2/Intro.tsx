import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BACK, BODY, COLORS, DISPLAY, EASE_IN, EASE_OUT, ip } from "../theme";
import { HITS } from "./timeline";

const T7 = HITS.intro;
const TS = HITS.students;
const TC = HITS.oneCity;
const TO = HITS.oxford;

const Seven: React.FC<{ t: number }> = ({ t }) => {
  const draw = ip(t, [T7, T7 + 0.9], [3200, 0], EASE_OUT);
  const fill = ip(t, [T7 + 0.6, T7 + 1.0], [0, 1]);
  const out = ip(t, [TS - 0.15, TS + 0.25], [0, 1], EASE_IN);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", scale: String(ip(t, [T7, TS], [1.1, 1]) + out * 2.5), opacity: 1 - out, filter: `blur(${out * 20}px)` }}>
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", background: `radial-gradient(circle, ${COLORS.gold}40, transparent 60%)`, opacity: fill }} />
      <svg width={1080} height={1100} viewBox="0 0 1080 1100" style={{ position: "absolute", top: 330 }}>
        <defs>
          <linearGradient id="g7" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={COLORS.goldSoft} />
            <stop offset="0.55" stopColor={COLORS.gold} />
            <stop offset="1" stopColor="#b9780f" />
          </linearGradient>
        </defs>
        <text x={540} y={900} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={1000} fill="url(#g7)" fillOpacity={fill} stroke={COLORS.goldSoft} strokeWidth={6} strokeDasharray={3200} strokeDashoffset={draw}>
          7
        </text>
      </svg>
      <div style={{ position: "absolute", top: 1400, fontFamily: BODY, fontWeight: 800, fontSize: 52, letterSpacing: ip(t, [T7 + 0.5, TS], [60, 26], EASE_OUT), color: COLORS.white, opacity: ip(t, [T7 + 0.5, T7 + 0.8], [0, 1]) }}>
        BRANCHES
      </div>
    </AbsoluteFill>
  );
};

const Thousands: React.FC<{ t: number }> = ({ t }) => {
  const inP = ip(t, [TS, TS + 0.35], [0, 1], EASE_OUT);
  const out = ip(t, [TC - 0.2, TC + 0.15], [0, 1], EASE_IN);
  if (inP <= 0 || out >= 1) return null;
  const rows = new Array(11).fill(0);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: inP * (1 - out), scale: String(1 - out * 0.4), rotate: "-8deg" }}>
      {rows.map((_, i) => {
        const dir = i % 2 ? 1 : -1;
        const mid = i === 5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 960 + (i - 5) * 150 - 75,
              whiteSpace: "nowrap",
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: 130,
              lineHeight: 1,
              color: mid ? COLORS.white : "transparent",
              WebkitTextStroke: mid ? "0px" : `2px ${COLORS.sky}55`,
              translate: `${mid ? (t - TS) * 40 : dir * (t - TS) * 260 + dir * -200}px 0px`,
              textShadow: mid ? `0 0 40px ${COLORS.sky}` : "none",
            }}
          >
            {mid ? "THOUSANDS" : "THOUSANDS THOUSANDS THOUSANDS"}
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 1140, fontFamily: DISPLAY, fontWeight: 900, fontSize: 84, color: COLORS.ink, background: COLORS.gold, padding: "6px 34px", rotate: "0deg", scale: String(ip(t, [TS + 0.45, TS + 0.75], [0, 1], BACK)) }}>
        OF STUDENTS
      </div>
    </AbsoluteFill>
  );
};

const OneCity: React.FC<{ t: number }> = ({ t }) => {
  const out = ip(t, [TO - 0.15, TO + 0.15], [0, 1], EASE_IN);
  if (t < TC - 0.1 || out >= 1) return null;
  const ring = ip(t, [TC, TC + 0.7], [0, 1], EASE_OUT);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - out, scale: String(1 + out * 0.3) }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <circle cx={540} cy={960} r={ring * 420} fill="none" stroke={COLORS.gold} strokeWidth={3} opacity={1 - ring * 0.6} />
        <circle cx={540} cy={960} r={ring * 300} fill="none" stroke={COLORS.sky} strokeWidth={1.5} strokeDasharray="6 10" opacity={0.6} />
        <circle cx={540} cy={960} r={ip(t, [TC, TC + 0.2], [0, 14], BACK)} fill={COLORS.gold} />
      </svg>
      <div style={{ position: "absolute", top: 600, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {["ONE", "CITY."].map((w, i) => (
          <div key={w} style={{ overflow: "hidden", height: 190 }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 180, lineHeight: 1.05, color: COLORS.white, translate: `0px ${ip(t, [TC + i * 0.12, TC + 0.4 + i * 0.12], [200, 0], EASE_OUT)}px` }}>{w}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1420, fontFamily: BODY, fontWeight: 800, fontSize: 30, letterSpacing: 10, color: COLORS.goldSoft, opacity: ip(t, [TC + 0.4, TC + 0.7], [0, 1]) }}>
        DUSHANBE · 38.56° N · 68.78° E
      </div>
    </AbsoluteFill>
  );
};

const Oxford: React.FC<{ t: number }> = ({ t }) => {
  if (t < TO - 0.05) return null;
  const zoom = ip(t, [7.25, 8.0], [0, 1], EASE_IN);
  const words = [
    { w: "NEVER", s: TO + 1.0 },
    { w: "STOPS", s: TO + 1.3 },
    { w: "GROWING", s: TO + 1.65 },
  ];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", perspective: 1400, scale: String(1 + zoom * 7), opacity: 1 - ip(t, [7.6, 8.0], [0, 1]), filter: `blur(${zoom * 14}px)` }}>
      <div style={{ position: "absolute", top: 700, display: "flex" }}>
        {"OXFORD".split("").map((ch, i) => {
          const s = TO + i * 0.05;
          return (
            <span key={i} style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 900, fontSize: 168, color: COLORS.white, transformOrigin: "50% 100%", rotate: `x ${ip(t, [s, s + 0.45], [-95, 0], EASE_OUT)}deg`, opacity: ip(t, [s, s + 0.15], [0, 1]), textShadow: `0 0 50px ${COLORS.sky}88` }}>
              {ch}
            </span>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 905, width: 760, height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldSoft})`, boxShadow: `0 0 30px ${COLORS.gold}`, scale: `${ip(t, [TO + 0.35, TO + 0.8], [0, 1], EASE_OUT)} 1` }} />
      <div style={{ position: "absolute", top: 1000, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {words.map(({ w, s }) => (
          <div key={w} style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: w === "GROWING" ? 120 : 76, lineHeight: 1.05, color: w === "GROWING" ? COLORS.gold : COLORS.white, opacity: ip(t, [s, s + 0.12], [0, 1]), scale: String(ip(t, [s, s + 0.3], [1.8, 1], EASE_OUT)), filter: `blur(${ip(t, [s, s + 0.2], [14, 0])}px)`, textShadow: w === "GROWING" ? `0 0 50px ${COLORS.gold}88` : "none" }}>
            {w}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const IntroV2: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill>
      {/* opening streak */}
      <div style={{ position: "absolute", top: 958, left: ip(t, [0.05, 0.45], [-1000, 1200], EASE_IN), width: 900, height: 4, background: `linear-gradient(90deg, transparent, #fff, transparent)`, boxShadow: `0 0 50px 14px ${COLORS.gold}88`, opacity: ip(t, [0.05, 0.12, 0.4, 0.5], [0, 1, 1, 0]) }} />
      <Seven t={t} />
      <Thousands t={t} />
      <OneCity t={t} />
      <Oxford t={t} />
    </AbsoluteFill>
  );
};
