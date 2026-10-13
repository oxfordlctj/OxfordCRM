import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { FocusLines, Kanji, Letterbox, Petals, SpeedLines, impactFilter, panel, shake } from "../v5/Fx";
import { S, VO } from "../v5/timeline";
import { A, DISPLAY, EASE_IN, EASE_OUT, JP, SUB, ip } from "../v5/theme";
import { LINE, RenHD } from "../v7/RenHD";
import type { Mouth, Pose } from "../v7/RenHD";
import { Embers, Moon, Mountains, Sky, Smoke, Village } from "./BG";
import { FoxHD } from "./Cast";

const useT = () => useCurrentFrame() / 30;

/** Ren placed in scene space. */
export const Ren: React.FC<{ t: number; x: number; y: number; s: number; pose?: Pose; mouth?: Mouth; power?: number; hurt?: boolean; id: string; rot?: number; flip?: boolean; blink?: boolean }> = ({ t, x, y, s, rot = 0, flip, ...p }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
    <RenHD t={t} {...p} />
  </g>
);

/** Close-up on Ren's face: (cx, cy) = centre of the face on screen. */
export const RenFace: React.FC<{ t: number; cx: number; cy: number; k: number; mouth?: Mouth; power?: number; hurt?: boolean; id: string; blink?: boolean }> = ({ cx, cy, k, ...p }) => (
  <g transform={`translate(${cx} ${cy}) scale(${k}) translate(0 1510)`}>
    <RenHD pose="stand" {...p} />
  </g>
);

/** Extreme close-up of a fox eye. */
const FoxEye: React.FC<{ t: number; open: number; slit: number }> = ({ t, open, slit }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    <defs>
      <radialGradient id="foxIris" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFF09A" />
        <stop offset="45%" stopColor="#FFB020" />
        <stop offset="85%" stopColor="#E0420E" />
        <stop offset="100%" stopColor="#7A1406" />
      </radialGradient>
      <clipPath id="foxEyeClip">
        <path d={`M -520 60 Q -100 ${-330 * open} 520 -80 Q 100 ${300 * open} -520 60 Z`} />
      </clipPath>
    </defs>
    <g transform="translate(540 960) rotate(-12)">
      <circle r={560} fill="#FF2A1A" opacity={0.12 * open} />
      <path d={`M -520 60 Q -100 ${-330 * open} 520 -80 Q 100 ${300 * open} -520 60 Z`} fill="#3A0A08" />
      <g clipPath="url(#foxEyeClip)">
        <circle r={330} fill="url(#foxIris)" />
        {new Array(48).fill(0).map((_, i) => {
          const a = (i / 48) * Math.PI * 2;
          return <line key={i} x1={Math.cos(a) * 90} y1={Math.sin(a) * 90} x2={Math.cos(a) * (300 - (i % 3) * 30)} y2={Math.sin(a) * (300 - (i % 3) * 30)} stroke="#B8380C" strokeWidth={3} opacity={0.5} />;
        })}
        <ellipse rx={34 * slit + 6} ry={250} fill="#140405" />
        {/* reflection: burning village */}
        <g opacity={0.5} transform="translate(80 -120) scale(0.25)">
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M ${i * 120 - 240} 0 l 50 -80 l 50 80 Z`} fill="#FFFFFF" />
          ))}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${i * 140 - 160} -60 q 20 ${-80 - Math.sin(t * 10 + i) * 30} 40 0 Z`} fill="#FFF09A" />
          ))}
        </g>
        <ellipse cx={-110} cy={-120} rx={60} ry={40} fill="#FFFFFF" opacity={0.85} />
        <circle cx={120} cy={110} r={18} fill="#FFFFFF" opacity={0.7} />
      </g>
      <path d={`M -560 80 Q -100 ${-360 * open - 20} 560 -100`} stroke={LINE} strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d={`M -500 70 Q 100 ${300 * open} 500 -70`} stroke={LINE} strokeWidth={14} fill="none" strokeLinecap="round" />
      {/* fur strokes */}
      {new Array(10).fill(0).map((_, i) => (
        <path key={i} d={`M ${-500 + i * 110} ${-300 - (i % 2) * 40} l ${30} ${-120}`} stroke="#C44A12" strokeWidth={14} strokeLinecap="round" opacity={0.6} />
      ))}
    </g>
  </svg>
);

/** 0. Cold open. */
export const ColdOpen: React.FC = () => {
  const t = useT();
  const open = ip(t, [0.5, 1.8], [0, 1], EASE_OUT);
  const slit = ip(t, [2.5, 2.7], [1, 0.15]);
  const sh = shake(t, [2.6], 34);
  const zoom = ip(t, [0, 2.6, 3.2, 4.4], [1.25, 1.05, 1.0, 0.9]);
  return (
    <AbsoluteFill style={{ background: "#07050A", translate: `${sh.x}px ${sh.y}px`, overflow: "hidden" }}>
      <Smoke t={t} color="#2A1220" opacity={0.5} />
      <AbsoluteFill style={{ scale: String(zoom) }}>
        <FoxEye t={t} open={open} slit={slit} />
      </AbsoluteFill>
      {t > 2.6 && <FocusLines t={t} color="#000" opacity={ip(t, [2.6, 3.4], [0.8, 0.3])} inner={520} />}
      <AbsoluteFill style={{ background: "#FF2A1A", mixBlendMode: "screen", opacity: ip(t, [2.6, 2.7, 3.2], [0, 0.5, 0]) }} />
      <Embers t={t} n={22} color="#FF7A1A" />
      <Kanji t={t} at={3.0} until={4.4} text="九尾" x={920} y={240} size={200} />
      <Letterbox />
    </AbsoluteFill>
  );
};

/** 1. Opening: fast OP cuts and title. */
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
        <AbsoluteFill>
          <Sky t={t} top="#120C2E" mid="#3A1E5A" low="#A04A6A" stars={60} />
          <Moon x={540} y={820} r={ip(t, [0.6, 1.6], [330, 370])} t={t} />
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <path d="M 0 1500 L 260 1440 L 540 1480 L 820 1430 L 1080 1490 L 1080 1920 L 0 1920 Z" fill="#0A0610" />
            <g style={{ filter: "brightness(0)" }}>
              <Ren t={t} x={540} y={1470} s={0.62} id="op1" />
            </g>
          </svg>
          <Petals t={t} n={34} />
        </AbsoluteFill>
      )}
      {cut === 2 && (
        <AbsoluteFill>
          <AbsoluteFill style={{ clipPath: panel([[0, 0], [1080, 0], [1080, 760], [0, 1100]]), background: "#6A0E1A" }}>
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <g transform="translate(540 1900) scale(0.62)">
                <FoxHD t={t} roar={0.9} />
              </g>
            </svg>
            <SpeedLines t={t} angle={-18} opacity={0.35} />
          </AbsoluteFill>
          <AbsoluteFill style={{ clipPath: panel([[0, 1140], [1080, 800], [1080, 1920], [0, 1920]]), background: "#16224A" }}>
            <FocusLines t={t} color="#2A3A70" opacity={1} inner={420} />
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <RenFace t={t} cx={560} cy={1420} k={3.3} mouth="grit" id="op2" />
            </svg>
          </AbsoluteFill>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1100, height: 40, background: A.ink, rotate: "-17.5deg", scale: "1.3 1" }} />
        </AbsoluteFill>
      )}
      {cut === 3 && (
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, #6E0E1E, ${A.ink} 70%)`, alignItems: "center" }}>
          <FocusLines t={t} color={A.blood} opacity={0.6} />
          <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.35 }}>
            <Ren t={t} x={540} y={2050} s={1.1} pose="wide" id="op3" />
          </svg>
          <Petals t={t} n={34} />
          <div style={{ position: "absolute", top: 560, fontFamily: JP, fontWeight: 900, fontSize: 120, color: A.white, opacity: ip(t, [2.6, 2.8], [0, 1]), letterSpacing: 10 }}>第八話</div>
          <div style={{ position: "absolute", top: 730, fontFamily: DISPLAY, fontWeight: 900, fontSize: 170, color: A.white, WebkitTextStroke: `10px ${A.ink}`, paintOrder: "stroke", scale: String(ip(t, [2.6, 2.85], [3, 1], EASE_OUT)), textShadow: `10px 10px 0 ${A.blood}` }}>OXFORD</div>
          <div style={{ position: "absolute", top: 930, fontFamily: DISPLAY, fontWeight: 900, fontSize: 112, color: A.red, letterSpacing: 18, WebkitTextStroke: `8px ${A.ink}`, paintOrder: "stroke", translate: `${ip(t, [2.8, 3.1], [-900, 0], EASE_OUT)}px 0px` }}>SHINOBI</div>
          <div style={{ position: "absolute", top: 1110, fontFamily: SUB, fontWeight: 1000, fontSize: 52, color: A.moon, opacity: ip(t, [3.2, 3.5], [0, 1]), textAlign: "center", WebkitTextStroke: `8px ${A.ink}`, paintOrder: "stroke" }}>
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
  const rise = ip(t, [0, 3.2], [1100, 0], EASE_OUT);
  const roar = ip(t, [3.4, 3.7, 5.0, 5.4], [0, 1, 1, 0.2]);
  const ball = ip(t, [5.2, 6.0], [0, 1], EASE_IN);
  const burn = ip(t, [6.0, 6.8], [0, 1]);
  const sh = shake(t, [3.6, 6.0], 34, 0.7);
  const push = ip(t, [0, 8.2], [1, 1.12]);
  return (
    <AbsoluteFill style={{ overflow: "hidden", translate: `${sh.x}px ${sh.y}px`, filter: impactFilter(t, [6.0]) }}>
      <AbsoluteFill style={{ scale: String(push) }}>
        <Sky t={t} top="#3A0C2A" mid="#9A2440" low="#FF8A3A" clouds="#C2405A" cloudsS="#7A1E3C" />
        <Moon x={800} y={520} r={120} color="#FFE2C2" t={t} />
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <g transform={`translate(540 ${1260 + rise}) scale(0.6)`}>
            <FoxHD t={t} roar={roar} />
          </g>
        </svg>
        <Mountains y={1000} fill="#4A1238" shade="#2E0A24" />
        <Village t={t} burn={burn} y={1380} />
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {ball > 0 && ball < 1 && (
            <g transform={`translate(${540 + (300 - 540) * ball} ${640 + (1300 - 640) * ball})`}>
              <circle r={150 + ball * 40} fill="#FF6A1A" opacity={0.35} />
              <circle r={90 + ball * 40} fill="#FFB12E" />
              <circle r={45 + ball * 20} fill="#FFF6C8" />
            </g>
          )}
          {t > 6.0 && t < 7.6 && <circle cx={300} cy={1300} r={ip(t, [6.0, 7.0], [0, 620])} fill="#FFB12E" opacity={ip(t, [6.0, 7.6], [0.95, 0])} />}
        </svg>
        <Embers t={t} n={burn > 0 ? 60 : 20} />
        {burn > 0 && <Smoke t={t} color="#1A0A10" opacity={0.35 * burn} y={1000} />}
      </AbsoluteFill>
      {roar > 0.5 && <FocusLines t={t} x={540} y={760} color={A.ink} opacity={0.5} inner={360} />}
      <Kanji t={t} at={3.6} until={5.2} text="狐" x={170} y={260} size={240} color={A.flame} />
      <Letterbox />
    </AbsoluteFill>
  );
};

/** 3. The hero lands on a rooftop and challenges the fox. */
export const Hero: React.FC = () => {
  const t = useT();
  const land = ip(t, [0.3, 0.75], [-1500, 0], EASE_IN);
  const sh = shake(t, [0.75, 4.4], 24);
  const close = t > 1.7 && t < 4.2;
  const r1 = VO.r1 - S.hero[0];
  const r2 = VO.r2 - S.hero[0];
  const loud = t >= 4.2;
  return (
    <AbsoluteFill style={{ overflow: "hidden", translate: `${sh.x}px ${sh.y}px` }}>
      {!close && !loud && (
        <AbsoluteFill>
          <Sky t={t} top="#0E0A2A" mid="#3A1446" low="#C2402E" stars={40} />
          <Moon x={540} y={620} r={260} t={t} />
          <Mountains y={1050} fill="#2A0E2A" shade="#18071A" />
          <Village t={t} burn={1} y={1500} />
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <Ren t={t} x={540} y={1540 + land} s={0.62} pose={t < 0.75 ? "fall" : "wide"} mouth="grit" id="h1" />
            {t > 0.75 &&
              t < 1.7 &&
              [-1, 1].map((s) => <ellipse key={s} cx={540 + s * ip(t, [0.75, 1.6], [80, 380])} cy={1540} rx={180} ry={46} fill="#E8D8D0" opacity={ip(t, [0.75, 1.7], [0.75, 0])} />)}
          </svg>
          {t < 0.75 && <SpeedLines t={t} angle={90} opacity={0.55} />}
          <Embers t={t} n={40} />
        </AbsoluteFill>
      )}
      {close && (
        <AbsoluteFill>
          <AbsoluteFill style={{ clipPath: panel([[0, 0], [1080, 0], [1080, 1050], [0, 1250]]), background: "#16224A" }}>
            <FocusLines t={t} color="#2A3A70" opacity={1} inner={500} />
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <RenFace t={t} cx={540} cy={640} k={ip(t, [1.7, 4.2], [4.2, 4.6])} mouth={t > r1 && t < r1 + 1.0 ? "shout" : "grit"} id="h2" />
            </svg>
            <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(255,110,40,0.35), rgba(0,0,0,0) 40%)", mixBlendMode: "screen" }} />
          </AbsoluteFill>
          <AbsoluteFill style={{ clipPath: panel([[0, 1290], [1080, 1090], [1080, 1920], [0, 1920]]), background: A.ink }}>
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <g transform="translate(540 1540) rotate(-8)">
                <circle r={380} fill="#FF2A1A" opacity={0.15} />
                <path d="M -380 20 Q 0 -230 380 -20 Q 0 210 -380 20 Z" fill="#FFB020" stroke={LINE} strokeWidth={16} />
                <ellipse rx={36} ry={170} fill="#140405" />
                <ellipse cx={-90} cy={-60} rx={40} ry={24} fill="#FFFFFF" opacity={0.8} />
              </g>
            </svg>
          </AbsoluteFill>
        </AbsoluteFill>
      )}
      {loud && (
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #8A1020, #1A0610 70%)` }}>
          <FocusLines t={t} x={540} y={700} color={A.red} opacity={0.55} inner={300} />
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <Ren t={t} x={420} y={1930 + ip(t, [4.2, 7.2], [0, -40])} s={ip(t, [4.2, 7.2], [1.0, 1.06])} pose="point" mouth={t > r2 && t < r2 + 1.3 ? "shout" : "grit"} id="h3" />
          </svg>
          <Embers t={t} n={30} />
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
  const fly = ip(t, [hit, 4.4], [0, 1], EASE_OUT);
  const down = t > 4.6;
  const r4 = VO.r4 - S.battle[0];
  const tail = ip(t, [hit - 0.35, hit, hit + 0.5], [0, 1, 1.3]);
  return (
    <AbsoluteFill style={{ overflow: "hidden", translate: `${sh.x}px ${sh.y}px`, filter: impactFilter(t, [hit, hit + 0.13]) }}>
      {!down && (
        <AbsoluteFill>
          <Sky t={t} top="#2A0A2A" mid="#7A1A34" low="#E0502E" clouds="#9A2A44" cloudsS="#5A1230" />
          <Mountains y={1080} fill="#3A0E2A" shade="#22081C" />
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <g transform="translate(900 1720) scale(0.5)">
              <FoxHD t={t} roar={t > hit - 0.4 && t < hit + 0.8 ? 0.9 : 0.25} />
            </g>
          </svg>
          <Village t={t} burn={1} y={1560} />
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            {t > 0.5 &&
              t < 1.5 &&
              [0, 1, 2].map((k) => {
                const p = ip(t, [0.5 + k * 0.1, 1.2 + k * 0.1], [0, 1]);
                return (
                  <g key={k} transform={`translate(${430 + p * 420} ${1130 - k * 70 - p * 160}) rotate(${t * 1400})`} opacity={p < 1 ? 1 : 0}>
                    <path d="M 0 -44 L 11 -11 L 44 0 L 11 11 L 0 44 L -11 11 L -44 0 L -11 -11 Z" fill="#C9D3E3" stroke={A.ink} strokeWidth={4} />
                    <circle r={8} fill={A.ink} />
                    <path d={`M -44 0 L -${180 * p} 0`} stroke="#FFFFFF" strokeWidth={4} opacity={0.6} />
                  </g>
                );
              })}
            {t > 1.3 && t < 1.7 && new Array(8).fill(0).map((_, i) => <line key={i} x1={860} y1={960} x2={860 + Math.cos(i) * 110} y2={960 + Math.sin(i) * 110} stroke={A.flame} strokeWidth={7} />)}
            {t < 1.2 && <Ren t={t} x={260} y={1620} s={0.5} pose="throw" mouth="shout" id="b1" />}
            {t >= 1.2 &&
              t < hit &&
              [3, 2, 1, 0].map((k) => (
                <g key={k} opacity={k === 0 ? 1 : 0.25} style={{ filter: k === 0 ? undefined : "brightness(2.2) saturate(0.2)" }}>
                  <Ren t={t} x={260 + Math.max(0, dash - k * 0.08) * 420} y={1620} s={0.5} pose="wide" mouth="shout" id={`b2${k}`} rot={14} />
                </g>
              ))}
            {t >= hit && (
              <g transform={`translate(${680 - fly * 560} ${1560 - Math.sin(fly * Math.PI) * 620}) rotate(${-fly * 540})`}>
                <Ren t={t} x={0} y={0} s={0.46} pose="fall" mouth="shout" hurt id="b3" />
              </g>
            )}
            {tail > 0 && t < hit + 0.6 && (
              <g transform={`translate(${1300 - tail * 520} 1300) rotate(${-30 + tail * 30})`}>
                <path d="M 0 0 Q -300 -120 -620 -40 Q -700 0 -620 60 Q -300 120 0 140 Z" fill="#F06A1E" stroke={LINE} strokeWidth={8} />
                <path d="M -620 -40 Q -700 0 -620 60 Q -560 20 -520 0 Z" fill="#FFB04A" />
                <path d="M 0 80 Q -300 90 -600 40" stroke="#B23F10" strokeWidth={30} fill="none" opacity={0.7} />
              </g>
            )}
          </svg>
          {t > 1.2 && t < hit && <SpeedLines t={t} opacity={0.6} />}
          {t >= hit && t < hit + 0.5 && <FocusLines t={t} x={680} y={1300} color={A.white} opacity={0.9} />}
          {t >= hit && t < hit + 0.25 && (
            <svg width={1080} height={1920} style={{ position: "absolute" }}>
              <path d="M 680 900 L 700 1280 L 1080 1300 L 700 1320 L 680 1700 L 660 1320 L 280 1300 L 660 1280 Z" fill="#FFFFFF" />
            </svg>
          )}
          <Embers t={t} n={30} />
        </AbsoluteFill>
      )}
      {down && (
        <AbsoluteFill style={{ background: `linear-gradient(180deg, #120A22, #34122C)` }}>
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <RenFace t={t} cx={540} cy={900} k={ip(t, [4.6, 7.2], [4.3, 4.7])} mouth={t > r4 && t < r4 + 1.1 ? "shout" : "grit"} hurt id="b4" blink={t > r4 + 1.2 && t < r4 + 1.35} />
            {new Array(28).fill(0).map((_, i) => {
              const x = random(`rx${i}`) * 1180;
              const y = (random(`ry${i}`) * 1920 + t * 1900) % 1920;
              return <line key={i} x1={x} y1={y} x2={x - 26} y2={y + 110} stroke="#8FA3BF" strokeWidth={3} opacity={0.55} />;
            })}
          </svg>
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(40,60,120,0.25), rgba(0,0,0,0))" }} />
        </AbsoluteFill>
      )}
      <Letterbox />
    </AbsoluteFill>
  );
};
