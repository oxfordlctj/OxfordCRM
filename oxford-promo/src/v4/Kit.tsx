import React from "react";
import { AbsoluteFill, random } from "remotion";
import { BACK, C, EASE_IN, EASE_OUT, STORY, ip } from "./theme";

/** Storybook narration card: words pop in one by one. */
export const Tale: React.FC<{ t: number; at: number; until: number; text: string; top?: number; size?: number; accent?: string[] }> = ({ t, at, until, text, top = 150, size = 58, accent = [] }) => {
  if (t < at - 0.1 || t > until + 0.3) return null;
  const words = text.split(" ");
  const out = ip(t, [until, until + 0.25], [0, 1], EASE_IN);
  const inn = ip(t, [at, at + 0.3], [0, 1], BACK);
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, display: "flex", justifyContent: "center", opacity: 1 - out, translate: `0px ${out * -40}px` }}>
      <div style={{ background: C.paper, borderRadius: 34, padding: "26px 38px", boxShadow: "0 18px 0 rgba(0,0,0,0.18), 0 30px 60px rgba(0,0,0,0.25)", border: `5px solid ${C.ink}`, scale: String(0.7 + 0.3 * inn), rotate: `${(1 - inn) * -4}deg`, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 16, rowGap: 4 }}>
        {words.map((w, i) => {
          const s = at + 0.15 + i * 0.09;
          const p = ip(t, [s, s + 0.25], [0, 1], BACK);
          const hot = accent.some((a) => w.toLowerCase().startsWith(a.toLowerCase()));
          return (
            <span key={i} style={{ display: "inline-block", fontFamily: STORY, fontWeight: 900, fontSize: size, lineHeight: 1.2, color: hot ? C.coral : C.ink, opacity: p, scale: String(0.4 + 0.6 * p), translate: `0px ${(1 - p) * 30}px` }}>
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Speech bubble with typewriter text. */
export const Bubble: React.FC<{ t: number; at: number; until: number; text: string; x: number; y: number; tail?: "left" | "right"; color?: string; size?: number }> = ({ t, at, until, text, x, y, tail = "left", color = C.white, size = 46 }) => {
  if (t < at || t > until + 0.2) return null;
  const p = ip(t, [at, at + 0.25], [0, 1], BACK) * ip(t, [until, until + 0.2], [1, 0]);
  const n = Math.floor(ip(t, [at + 0.15, at + 0.15 + text.length * 0.035], [0, text.length]));
  return (
    <div style={{ position: "absolute", left: x, top: y, scale: String(p), transformOrigin: tail === "left" ? "0% 100%" : "100% 100%", translate: tail === "left" ? "0 -100%" : "-100% -100%" }}>
      <div style={{ position: "relative", background: color, border: `5px solid ${C.ink}`, borderRadius: 40, padding: "18px 30px", fontFamily: STORY, fontWeight: 900, fontSize: size, color: C.ink, whiteSpace: "nowrap" }}>
        {text.slice(0, n)}
        <span style={{ opacity: 0 }}>{text.slice(n)}</span>
        <svg width={50} height={40} style={{ position: "absolute", bottom: -36, [tail]: 34 }}>
          <path d={tail === "left" ? "M 0 0 L 10 34 L 34 0" : "M 50 0 L 40 34 L 16 0"} fill={color} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <rect x={tail === "left" ? 4 : 18} y={-6} width={28} height={9} fill={color} />
        </svg>
      </div>
    </div>
  );
};

/** Sparkle star burst. */
export const Sparkles: React.FC<{ t: number; at: number; x: number; y: number; n?: number; color?: string; spread?: number }> = ({ t, at, x, y, n = 16, color = C.gold, spread = 260 }) => {
  if (t < at || t > at + 1.4) return null;
  const age = t - at;
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + random(`sa${i}${at}`) * 0.4;
        const d = spread * (0.5 + random(`sd${i}${at}`) * 0.6) * (1 - Math.exp(-age * 5));
        const s = (14 + random(`ss${i}${at}`) * 18) * Math.max(0, 1 - age / 1.4);
        const px = x + Math.cos(a) * d;
        const py = y + Math.sin(a) * d + age * age * 120;
        return <path key={i} d={`M ${px} ${py - s} L ${px + s * 0.3} ${py - s * 0.3} L ${px + s} ${py} L ${px + s * 0.3} ${py + s * 0.3} L ${px} ${py + s} L ${px - s * 0.3} ${py + s * 0.3} L ${px - s} ${py} L ${px - s * 0.3} ${py - s * 0.3} Z`} fill={color} />;
      })}
    </>
  );
};

/** Storybook page-turn: a paper sheet sweeps across with a curl shadow. */
export const PageTurn: React.FC<{ t: number; at: number; dur?: number }> = ({ t, at, dur = 0.7 }) => {
  const p = ip(t, [at, at + dur], [0, 1], (x) => x * x * (3 - 2 * x));
  if (p <= 0 || p >= 1) return null;
  const xx = 1400 - p * 2600;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="curl" x1="0" x2="1">
            <stop offset="0" stopColor={C.paper} />
            <stop offset="0.7" stopColor="#E8D5AE" />
            <stop offset="1" stopColor="#B99A66" />
          </linearGradient>
        </defs>
        <path d={`M ${xx} -100 L ${xx + 2000} -100 L ${xx + 2000} 2100 L ${xx - 500} 2100 Z`} fill={C.paper} />
        <path d={`M ${xx} -100 L ${xx + 140} -100 L ${xx - 360} 2100 L ${xx - 500} 2100 Z`} fill="url(#curl)" />
        <path d={`M ${xx - 500} 2100 L ${xx} -100`} stroke="rgba(0,0,0,0.35)" strokeWidth={30} style={{ filter: "blur(12px)" }} />
      </svg>
    </AbsoluteFill>
  );
};

/** Twinkling night stars. */
export const Stars: React.FC<{ t: number; n?: number; h?: number }> = ({ t, n = 60, h = 900 }) => (
  <>
    {new Array(n).fill(0).map((_, i) => {
      const x = random(`stx${i}`) * 1080;
      const y = random(`sty${i}`) * h;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (1 + random(`stw${i}`) * 2) + i));
      return <circle key={i} cx={x} cy={y} r={1.5 + random(`str${i}`) * 3} fill="#fff" opacity={tw} />;
    })}
  </>
);

export const pop = (t: number, at: number, dur = 0.35) => ip(t, [at, at + dur], [0, 1], BACK);
export const fade = (t: number, a: number, b: number) => ip(t, [a, b], [0, 1], EASE_OUT);
