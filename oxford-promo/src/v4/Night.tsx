import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { AMIR, Kid, isBlink } from "./Characters";
import { Stars, Tale } from "./Kit";
import { C, EASE_IN_OUT, STORY, ip } from "./theme";

/** 1. A boy in a lit window in night-time Dushanbe, dreaming of the world. */
export const Night: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const zoom = ip(t, [0, 7.6], [1, 1.32], EASE_IN_OUT);
  const dream = ip(t, [3.0, 3.6], [0, 1]);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.deep} 0%, ${C.night} 45%, ${C.dusk} 100%)`, overflow: "hidden" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", transformOrigin: "540px 1100px", scale: String(zoom) }}>
        <Stars t={t} />
        <circle cx={820} cy={330} r={150} fill={C.lamp} opacity={0.12} />
        <circle cx={820} cy={330} r={86} fill="#FFF1C9" />
        <circle cx={850} cy={310} r={70} fill={C.night} opacity={0.15} />
        {/* mountains around Dushanbe */}
        <path d="M 0 1050 L 160 820 L 300 960 L 480 760 L 640 940 L 820 800 L 1080 1000 L 1080 1920 L 0 1920 Z" fill="#2A2266" />
        <path d="M 380 790 L 480 760 L 560 850 L 520 840 L 480 870 Z" fill="#EDEBFF" opacity={0.7} />
        <path d="M 0 1180 L 220 1020 L 420 1140 L 640 1000 L 860 1120 L 1080 1040 L 1080 1920 L 0 1920 Z" fill="#221B55" />
        {/* city blocks */}
        {new Array(9).fill(0).map((_, i) => {
          const w = 100 + random(`bw${i}`) * 70;
          const h = 220 + random(`bh${i}`) * 260;
          const x = i * 125 - 20;
          return (
            <g key={i}>
              <rect x={x} y={1520 - h} width={w} height={h + 400} fill="#181345" />
              {new Array(12).fill(0).map((__, k) => {
                const on = random(`wo${i}-${k}`) > 0.55 && Math.sin(t * 0.7 + k + i) > -0.8;
                return <rect key={k} x={x + 16 + (k % 3) * 28} y={1520 - h + 24 + Math.floor(k / 3) * 46} width={16} height={22} rx={3} fill={on ? C.lamp : "#2B2470"} opacity={on ? 0.9 : 1} />;
              })}
            </g>
          );
        })}
        {/* Amir's house */}
        <rect x={190} y={880} width={700} height={1100} rx={20} fill="#3A2F86" />
        <path d="M 160 900 L 540 700 L 920 900 Z" fill="#2B2270" />
        <rect x={270} y={960} width={540} height={460} rx={24} fill={C.lamp} />
        <rect x={270} y={960} width={540} height={460} rx={24} fill="url(#lampGlow)" />
        <defs>
          <radialGradient id="lampGlow" cx="0.3" cy="0.3">
            <stop offset="0" stopColor="#FFF4C2" />
            <stop offset="1" stopColor="#F39C34" />
          </radialGradient>
          <clipPath id="win">
            <rect x={270} y={960} width={540} height={460} rx={24} />
          </clipPath>
        </defs>
        <g clipPath="url(#win)">
          <Kid look={AMIR} mood={t > 3.2 ? "happy" : "sad"} x={540} y={1490} scale={1.05} blink={isBlink(f)} lookX={t > 3.2 ? 6 : -4} arms={[20, 20]} bob={Math.sin(t * 2) * 3} />
          <rect x={250} y={1300} width={600} height={160} fill="#8B5A2B" />
          <rect x={250} y={1290} width={600} height={24} fill="#A86E37" />
          <rect x={300} y={1240} width={130} height={50} rx={6} fill={C.coral} />
          <rect x={310} y={1200} width={110} height={40} rx={6} fill={C.teal} />
          <path d="M 700 1290 L 720 1180 L 760 1180" stroke={C.ink} strokeWidth={8} fill="none" />
          <path d="M 730 1170 L 810 1170 L 790 1130 L 750 1130 Z" fill={C.ink} />
        </g>
        <rect x={270} y={960} width={540} height={460} rx={24} fill="none" stroke="#24195E" strokeWidth={16} />
        <line x1={540} y1={960} x2={540} y2={1420} stroke="#24195E" strokeWidth={10} />
        {/* the dream */}
        <g opacity={dream} transform={`translate(0 ${(1 - dream) * 40})`}>
          <circle cx={700} cy={900} r={16} fill={C.white} />
          <circle cx={760} cy={830} r={26} fill={C.white} />
          <g transform="translate(560 420)">
            <path d="M 60 200 Q -40 200 0 120 Q -30 30 80 30 Q 120 -40 220 10 Q 320 -30 360 60 Q 460 80 410 170 Q 440 250 330 240 Q 280 300 180 250 Q 100 290 60 200 Z" fill={C.white} />
            <g transform={`translate(210 140) rotate(${t * 40})`}>
              <circle r={78} fill={C.sky} />
              <path d="M -50 -30 Q -20 -60 10 -40 Q 30 -10 0 10 Q -30 20 -50 -30 Z M 20 20 Q 50 10 60 40 Q 40 70 20 50 Z" fill={C.green} />
            </g>
          </g>
        </g>
      </svg>
      {t > 3.6 &&
        ["Hello!", "Hi!", "Bonjour", "Hey!"].map((w, i) => {
          const s = 3.8 + i * 0.5;
          const age = t - s;
          if (age < 0) return null;
          return (
            <div key={w} style={{ position: "absolute", left: 560 + (i % 2) * 230 + Math.sin(age * 2 + i) * 20, top: 520 - age * 90 + (i > 1 ? 120 : 0), fontFamily: STORY, fontWeight: 900, fontSize: 40, color: C.white, opacity: Math.max(0, 1 - age / 3), scale: String(zoom) }}>
              {w}
            </div>
          );
        })}
      <Tale t={t} at={0.4} until={3.0} text="Жил-был мальчик Амир." accent={["Амир"]} />
      <Tale t={t} at={3.2} until={7.4} text="Он мечтал говорить со всем миром…" accent={["миром"]} />
    </AbsoluteFill>
  );
};
