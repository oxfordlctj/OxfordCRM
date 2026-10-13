import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { Fox, Head, Ninja } from "./Characters";
import { FocusLines, Kanji, Letterbox, Petals, SpeedLines, impactFilter, panel, shake } from "./Fx";
import { A, DISPLAY, EASE_IN, EASE_OUT, JP, SUB, ip } from "./theme";

const useT = () => useCurrentFrame() / 30;

/** Mountains + pagoda-roof village silhouette. */
const Village: React.FC<{ t: number; burn?: number; sky?: [string, string] }> = ({ t, burn = 0, sky = ["#5B1030", "#F26B38"] }) => (
  <>
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${sky[0]} 0%, ${sky[1]} 75%)` }} />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <circle cx={760} cy={520} r={150} fill={A.moon} opacity={0.9} />
      <path d="M 0 1120 L 180 840 L 330 1000 L 520 760 L 700 980 L 880 800 L 1080 1040 L 1080 1920 L 0 1920 Z" fill="#3A1030" />
      <path d="M 470 800 L 520 760 L 570 820 L 540 812 L 520 830 Z" fill="#F7E8E8" opacity={0.6} />
      {new Array(7).fill(0).map((_, i) => {
        const x = i * 165 - 20;
        const h = 160 + (i % 3) * 70;
        return (
          <g key={i}>
            <rect x={x + 20} y={1500 - h} width={130} height={h + 500} fill="#1E0B1E" />
            <path d={`M ${x - 10} ${1500 - h} L ${x + 85} ${1440 - h} L ${x + 180} ${1500 - h} L ${x + 150} ${1490 - h} L ${x + 85} ${1460 - h} L ${x + 20} ${1490 - h} Z`} fill="#1E0B1E" />
            <rect x={x + 60} y={1540 - h} width={40} height={50} fill={A.flame} opacity={0.6 + 0.3 * Math.sin(t * 5 + i)} />
            {burn > 0 && i % 2 === 0 &&
              [0, 1, 2].map((k) => (
                <path key={k} d={`M ${x + 40 + k * 40} ${1500 - h} q ${-20} ${-60 * burn} ${10} ${-(120 + Math.sin(t * 12 + k + i) * 40) * burn} q 30 ${50 * burn} 20 ${110 * burn} Z`} fill={k === 1 ? A.flame : A.orange} opacity={0.9} />
              ))}
          </g>
        );
      })}
      <rect x={0} y={1500} width={1080} height={420} fill="#14070F" />
    </svg>
  </>
);

/** 0. Cold open: the fox's eyes open in the dark. */
export const ColdOpen: React.FC = () => {
  const t = useT();
  const eyes = ip(t, [2.5, 2.9], [0, 1], EASE_OUT);
  const sh = shake(t, [2.6], 30);
  return (
    <AbsoluteFill style={{ background: A.ink, translate: `${sh.x}px ${sh.y}px` }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {new Array(8).fill(0).map((_, i) => (
          <ellipse key={i} cx={((i * 260 + t * 40) % 1400) - 160} cy={900 + Math.sin(i) * 300} rx={360} ry={90} fill="#2A1A2E" opacity={0.35} />
        ))}
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${540 + s * 230} 900)`}>
            <ellipse rx={150} ry={150 * eyes} fill={A.red} opacity={0.25} />
            <path d={`M -140 0 Q 0 ${-90 * eyes} 140 0 Q 0 ${90 * eyes} -140 0 Z`} fill={A.flame} stroke={A.ink} strokeWidth={10} />
            <ellipse rx={18} ry={70 * eyes} fill={A.ink} />
          </g>
        ))}
      </svg>
      <Kanji t={t} at={3.0} until={4.4} text="九尾" x={920} y={240} size={200} />
    </AbsoluteFill>
  );
};

/** 1. Opening: fast anime OP cuts and the title. */
export const Opening: React.FC = () => {
  const t = useT();
  const cut = t < 0.6 ? 0 : t < 1.6 ? 1 : t < 2.6 ? 2 : 3;
  return (
    <AbsoluteFill style={{ background: A.ink, overflow: "hidden" }}>
      {cut === 0 && (
        <AbsoluteFill style={{ background: A.white }}>
          <FocusLines t={t} color={A.ink} opacity={1} />
          <Kanji t={t} at={0.05} until={0.6} text="忍" x={540} y={620} size={600} color={A.red} />
        </AbsoluteFill>
      )}
      {cut === 1 && (
        <AbsoluteFill style={{ background: `linear-gradient(180deg, #1C0F3A, #4A1E5A)` }}>
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <circle cx={540} cy={820} r={ip(t, [0.6, 1.6], [380, 430])} fill={A.moon} />
            <g style={{ filter: "brightness(0)" }}>
              <Ninja t={t} pose="stand" x={540} y={1300} scale={1.1} />
            </g>
          </svg>
          <Petals t={t} n={30} />
        </AbsoluteFill>
      )}
      {cut === 2 && (
        <AbsoluteFill>
          <AbsoluteFill style={{ clipPath: panel([[0, 0], [1080, 0], [1080, 760], [0, 1100]]), background: A.blood }}>
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <Fox t={t} x={540} y={1250} scale={0.75} roar={0.6} />
            </svg>
            <SpeedLines t={t} angle={-18} opacity={0.4} />
          </AbsoluteFill>
          <AbsoluteFill style={{ clipPath: panel([[0, 1140], [1080, 800], [1080, 1920], [0, 1920]]), background: "#16224A" }}>
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <g transform="translate(560 1720) scale(2.6)">
                <Head t={t} mouth="calm" />
              </g>
            </svg>
          </AbsoluteFill>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1100, height: 40, background: A.ink, rotate: "-17.5deg", scale: "1.3 1" }} />
        </AbsoluteFill>
      )}
      {cut === 3 && (
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, #6E0E1E, ${A.ink} 70%)`, alignItems: "center" }}>
          <FocusLines t={t} color={A.blood} opacity={0.6} />
          <Petals t={t} n={34} />
          <div style={{ position: "absolute", top: 560, fontFamily: JP, fontWeight: 900, fontSize: 120, color: A.white, opacity: ip(t, [2.6, 2.8], [0, 1]), letterSpacing: 10 }}>第八話</div>
          <div style={{ position: "absolute", top: 730, fontFamily: DISPLAY, fontWeight: 900, fontSize: 170, color: A.white, WebkitTextStroke: `10px ${A.ink}`, paintOrder: "stroke", scale: String(ip(t, [2.6, 2.85], [3, 1], EASE_OUT)), textShadow: `10px 10px 0 ${A.blood}` }}>OXFORD</div>
          <div style={{ position: "absolute", top: 930, fontFamily: DISPLAY, fontWeight: 900, fontSize: 112, color: A.red, letterSpacing: 18, WebkitTextStroke: `8px ${A.ink}`, paintOrder: "stroke", translate: `${ip(t, [2.8, 3.1], [-900, 0], EASE_OUT)}px 0px` }}>SHINOBI</div>
          <div style={{ position: "absolute", top: 1110, fontFamily: SUB, fontWeight: 1000, fontSize: 52, color: A.moon, opacity: ip(t, [3.2, 3.5], [0, 1]), textAlign: "center" }}>
            Эпизод 8
            <br />
            <span style={{ color: A.flame }}>«Девятихвостый»</span>
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: A.white, opacity: [0.6, 1.6, 2.6].some((c) => t >= c && t < c + 0.08) ? 0.9 : 0 }} />
    </AbsoluteFill>
  );
};

/** 2. The fox rises over the mountains and attacks the village. */
export const Attack: React.FC = () => {
  const t = useT();
  const rise = ip(t, [0, 3.2], [900, 0], EASE_OUT);
  const roar = ip(t, [3.4, 3.7, 5.0, 5.4], [0, 1, 1, 0]);
  const ball = ip(t, [5.2, 6.0], [0, 1], EASE_IN);
  const burn = ip(t, [6.0, 6.8], [0, 1]);
  const sh = shake(t, [3.6, 6.0], 34, 0.7);
  return (
    <AbsoluteFill style={{ overflow: "hidden", translate: `${sh.x}px ${sh.y}px`, filter: impactFilter(t, [6.0]) }}>
      <Village t={t} burn={burn} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Fox t={t} x={560} y={1180 + rise} scale={0.95} roar={roar} />
        {ball > 0 && ball < 1 && (
          <g transform={`translate(${560 + (300 - 560) * ball} ${700 + (1380 - 700) * ball})`}>
            <circle r={70 + ball * 40} fill={A.flame} />
            <circle r={110 + ball * 40} fill={A.orange} opacity={0.5} />
          </g>
        )}
        {t > 6.0 && t < 7.4 && <circle cx={300} cy={1380} r={ip(t, [6.0, 7.0], [0, 520])} fill={A.flame} opacity={ip(t, [6.0, 7.4], [0.9, 0])} />}
      </svg>
      {roar > 0.5 && <FocusLines t={t} x={560} y={700} color={A.ink} opacity={0.5} />}
      <Kanji t={t} at={3.6} until={5.2} text="狐" x={170} y={260} size={240} color={A.flame} />
      <Letterbox />
    </AbsoluteFill>
  );
};

/** 3. The hero lands on a rooftop. */
export const Hero: React.FC = () => {
  const t = useT();
  const land = ip(t, [0.4, 0.75], [-1200, 0], EASE_IN);
  const sh = shake(t, [0.75], 22);
  const close = t > 1.7 && t < 4.2;
  const loud = t > 4.2;
  return (
    <AbsoluteFill style={{ overflow: "hidden", translate: `${sh.x}px ${sh.y}px` }}>
      {!close && (
        <>
          <Village t={t} burn={1} sky={["#1A0E3A", "#7A1E3C"]} />
          {loud && <FocusLines t={t} x={540} y={1000} color={A.red} opacity={0.55} />}
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <Ninja t={t} pose={t < 0.75 ? "jump" : "stand"} x={540} y={1460 + land} scale={loud ? 1.35 : 1.1} mouth={loud ? "shout" : "calm"} />
            {t > 0.75 && t < 1.6 && [-1, 1].map((s) => <ellipse key={s} cx={540 + s * ip(t, [0.75, 1.5], [60, 300])} cy={1470} rx={140} ry={40} fill="#E8D8D0" opacity={ip(t, [0.75, 1.6], [0.7, 0])} />)}
          </svg>
          {t < 0.75 && <SpeedLines t={t} angle={90} opacity={0.5} />}
        </>
      )}
      {close && (
        <AbsoluteFill>
          <AbsoluteFill style={{ clipPath: panel([[0, 0], [1080, 0], [1080, 1050], [0, 1250]]), background: "#16224A" }}>
            <FocusLines t={t} color="#2A3A70" opacity={1} inner={500} />
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <g transform={`translate(540 1230) scale(${ip(t, [1.7, 4.2], [3.1, 3.4])})`}>
                <Head t={t} mouth={t > 1.8 && t < 2.8 ? "shout" : "calm"} look={4} />
              </g>
            </svg>
          </AbsoluteFill>
          <AbsoluteFill style={{ clipPath: panel([[0, 1290], [1080, 1090], [1080, 1920], [0, 1920]]), background: A.ink }}>
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <g transform="translate(540 1520)">
                <path d="M -320 0 Q 0 -210 320 0 Q 0 210 -320 0 Z" fill={A.flame} stroke={A.blood} strokeWidth={14} />
                <ellipse rx={40} ry={150} fill={A.ink} />
              </g>
            </svg>
          </AbsoluteFill>
        </AbsoluteFill>
      )}
      <Letterbox />
    </AbsoluteFill>
  );
};

/** 4. First clash: shuriken, a dash, and the hero is swatted away. */
export const Battle: React.FC = () => {
  const t = useT();
  const hit = 2.8;
  const sh = shake(t, [hit, 3.6], 40, 0.6);
  const dash = ip(t, [1.2, 2.7], [0, 1], EASE_IN);
  const fly = ip(t, [hit, 3.6], [0, 1], EASE_OUT);
  const down = t > 4.6;
  return (
    <AbsoluteFill style={{ overflow: "hidden", translate: `${sh.x}px ${sh.y}px`, filter: impactFilter(t, [hit, hit + 0.13]) }}>
      {!down && (
        <>
          <Village t={t} burn={1} sky={["#2A0A2A", "#C2402E"]} />
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <Fox t={t} x={860} y={1500} scale={0.85} roar={t > hit - 0.4 && t < hit + 0.6 ? 0.8 : 0.2} />
            {t > 0.5 &&
              t < 1.5 &&
              [0, 1, 2].map((k) => {
                const p = ip(t, [0.5 + k * 0.1, 1.2 + k * 0.1], [0, 1]);
                return (
                  <g key={k} transform={`translate(${280 + p * 520} ${1150 - k * 60 + p * -200}) rotate(${t * 1400})`} opacity={p < 1 ? 1 : 0}>
                    <path d="M 0 -40 L 10 -10 L 40 0 L 10 10 L 0 40 L -10 10 L -40 0 L -10 -10 Z" fill="#C9D3E3" stroke={A.ink} strokeWidth={4} />
                    <circle r={7} fill={A.ink} />
                  </g>
                );
              })}
            {t > 1.3 && t < 1.7 && new Array(6).fill(0).map((_, i) => <line key={i} x1={820} y1={950} x2={820 + Math.cos(i) * 90} y2={950 + Math.sin(i) * 90} stroke={A.flame} strokeWidth={6} />)}
            {t < hit ? (
              <Ninja t={t} pose={t < 1.2 ? "throw" : "run"} run={t > 1.2 ? 1 : 0} x={260 + dash * 380} y={1500} scale={1.0} mouth="shout" />
            ) : (
              <g transform={`translate(${640 - fly * 520} ${1500 - Math.sin(fly * Math.PI) * 500}) rotate(${-fly * 540})`}>
                <Ninja t={t} pose="fall" x={0} y={0} scale={0.95} mouth="shout" />
              </g>
            )}
          </svg>
          {t > 1.2 && t < hit && <SpeedLines t={t} opacity={0.6} />}
          {t >= hit && t < hit + 0.5 && <FocusLines t={t} x={640} y={1200} color={A.white} opacity={0.9} />}
        </>
      )}
      {down && (
        <AbsoluteFill style={{ background: `linear-gradient(180deg, #1A0E2E, #3A1430)` }}>
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <g transform={`translate(540 1500) scale(3.1)`}>
              <Head t={t} mouth="calm" look={-3} />
              <path d="M 70 -150 q 14 26 0 40 q -14 -14 0 -40 Z" fill="#9FD4FF" stroke={A.ink} strokeWidth={3} />
              <path d="M -60 -60 l 20 6 M -64 -50 l 18 4" stroke="#B83A3A" strokeWidth={4} />
            </g>
            {new Array(20).fill(0).map((_, i) => (
              <line key={i} x1={random(`rx${i}`) * 1080} y1={((random(`ry${i}`) * 1920 + t * 1600) % 1920)} x2={random(`rx${i}`) * 1080 - 20} y2={((random(`ry${i}`) * 1920 + t * 1600) % 1920) + 80} stroke="#8FA3BF" strokeWidth={3} opacity={0.5} />
            ))}
          </svg>
        </AbsoluteFill>
      )}
      <Letterbox />
    </AbsoluteFill>
  );
};
