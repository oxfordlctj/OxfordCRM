import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AMIR, Kid, isBlink } from "./Characters";
import { Sparkles, Stars, Tale } from "./Kit";
import { T } from "./timeline";
import { BACK, C, EASE_IN, LOGO, STORY, ip } from "./theme";

const DROP = T.drop - T.door[0];
const DX = 640;
const DY = 1250;

/** 3. The magic door. It bursts open exactly on the music drop. */
export const Door: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const walk = ip(t, [0.2, 3.0], [0, 1]);
  const ax = -120 + walk * 480;
  const open = ip(t, [DROP, DROP + 0.35], [0, 1], BACK);
  const zoom = ip(t, [5.6, 6.8], [0, 1], EASE_IN);
  const s = Math.exp(Math.log(7) * zoom);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #2A1F6B 0%, #7B3F8C 55%, #F08A5D 100%)`, overflow: "hidden" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", transformOrigin: `${DX}px ${DY}px`, scale: String(s) }}>
        <Stars t={t} n={30} h={500} />
        <path d="M 0 900 L 200 760 L 380 880 L 560 720 L 760 860 L 1080 760 L 1080 1920 L 0 1920 Z" fill="#4B2C7A" opacity={0.6} />
        {/* facade */}
        <rect x={380} y={760} width={720} height={1200} fill="#5A3E9C" />
        <rect x={380} y={760} width={720} height={40} fill="#4A3088" />
        {[0, 1].map((i) => (
          <rect key={i} x={420 + i * 480} y={900} width={140} height={200} rx={12} fill={C.lamp} opacity={0.8} />
        ))}
        {/* sign */}
        <rect x={470} y={830} width={340} height={96} rx={20} fill={C.ink} stroke={open > 0 ? C.gold : "#6E5BB8"} strokeWidth={6} />
        <text x={640} y={898} textAnchor="middle" fontFamily={LOGO} fontWeight={900} fontSize={54} fill={open > 0 ? C.gold : "#8C7BD0"} style={{ filter: open > 0 ? `drop-shadow(0 0 18px ${C.gold})` : "none" }}>
          OXFORD
        </text>
        {/* light behind the door */}
        <rect x={520} y={1000} width={240} height={500} rx={16} fill="#FFF3C4" />
        {open > 0 && (
          <g opacity={Math.min(1, open)}>
            {new Array(14).fill(0).map((_, i) => {
              const a = (i / 14) * Math.PI * 2 + t * 0.6;
              return <path key={i} d={`M ${DX} ${DY} L ${DX + Math.cos(a - 0.08) * 1600} ${DY + Math.sin(a - 0.08) * 1600} L ${DX + Math.cos(a + 0.08) * 1600} ${DY + Math.sin(a + 0.08) * 1600} Z`} fill="#FFE9A0" opacity={0.28} />;
            })}
            <circle cx={DX} cy={DY} r={300 + open * 120} fill="#FFE9A0" opacity={0.35} />
          </g>
        )}
        {/* door panel swinging open */}
        <g transform={`translate(520 1000) scale(${1 - open * 0.85} 1)`}>
          <rect x={0} y={0} width={240} height={500} rx={16} fill="#B5562F" stroke={C.ink} strokeWidth={6} />
          <rect x={30} y={40} width={180} height={180} rx={10} fill="#9C4523" />
          <rect x={30} y={260} width={180} height={190} rx={10} fill="#9C4523" />
          <circle cx={205} cy={260} r={12} fill={C.gold} />
        </g>
        <rect x={510} y={990} width={260} height={520} rx={18} fill="none" stroke={C.ink} strokeWidth={10} />
        <rect x={0} y={1500} width={1080} height={420} fill="#3A2470" />
        <Kid look={AMIR} mood={open > 0 ? "wow" : "happy"} x={ax} y={1640} scale={0.85} walk={t * 9} walkAmp={walk < 1 ? 1 : 0} arms={open > 0 ? [160, 160] : [6, 6]} blink={isBlink(f)} lookX={6} />
        <Sparkles t={t} at={DROP} x={DX} y={DY} n={26} spread={520} />
        <Sparkles t={t} at={DROP + 0.5} x={DX} y={DY - 200} n={18} color={C.white} spread={420} />
      </svg>
      <Tale t={t} at={0.4} until={3.3} text="Но однажды он нашёл волшебную дверь…" accent={["волшебную"]} />
      {/* big title on the drop */}
      <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", opacity: ip(t, [5.4, 5.8], [1, 0]) }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {"OXFORD".split("").map((ch, i) => {
            const p = ip(t, [DROP + 0.2 + i * 0.06, DROP + 0.55 + i * 0.06], [0, 1], BACK);
            return (
              <span key={i} style={{ display: "inline-block", fontFamily: LOGO, fontWeight: 900, fontSize: 150, color: C.gold, WebkitTextStroke: `6px ${C.ink}`, paintOrder: "stroke", scale: String(p), translate: `0px ${(1 - p) * -200}px`, rotate: `${(1 - p) * (i % 2 ? 20 : -20)}deg`, textShadow: `0 10px 0 ${C.ink}` }}>
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{ fontFamily: STORY, fontWeight: 900, fontSize: 52, color: C.white, opacity: ip(t, [DROP + 0.7, DROP + 0.9], [0, 1]), textShadow: `0 4px 0 ${C.ink}` }}>учебный центр</div>
      </div>
      <AbsoluteFill style={{ background: "#FFF6D8", opacity: ip(t, [6.2, 6.8], [0, 1], EASE_IN) }} />
    </AbsoluteFill>
  );
};
