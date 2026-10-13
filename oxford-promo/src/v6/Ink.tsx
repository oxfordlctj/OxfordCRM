import React from "react";
import { AbsoluteFill, random } from "remotion";
import { A, BACK, DISPLAY, EASE_OUT, SUB, ip } from "../v5/theme";

export { A, ip, BACK, EASE_OUT };
export const PAPER = "#F3EFE6";
export const INK = "#111014";
export const RED = "#D7263D";

/** Screentone / hatching patterns. Put <ToneDefs/> inside every <svg> that uses them. */
export const ToneDefs: React.FC = () => (
  <defs>
    <pattern id="tone20" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx="4.5" cy="4.5" r="1.4" fill={INK} />
    </pattern>
    <pattern id="tone40" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx="4" cy="4" r="2.2" fill={INK} />
    </pattern>
    <pattern id="tone60" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx="3.5" cy="3.5" r="2.6" fill={INK} />
    </pattern>
    <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
      <line x1="0" y1="0" x2="0" y2="10" stroke={INK} strokeWidth="2.4" />
    </pattern>
    <pattern id="toneRed" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx="4" cy="4" r="2.4" fill={RED} />
    </pattern>
    <radialGradient id="fadeTone">
      <stop offset="0" stopColor="#fff" />
      <stop offset="1" stopColor="#000" />
    </radialGradient>
  </defs>
);

/** Paper grain behind the pages. */
export const Paper: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: PAPER }}>
    <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.12 }}>
      <filter id="paperGrain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(t * 8) % 4} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paperGrain)" />
    </svg>
  </AbsoluteFill>
);

export type Rect = { x: number; y: number; w: number; h: number; skew?: number };

/** A manga panel: thick ink border, slams in, content gets a slow camera push. */
export const Panel: React.FC<{ t: number; at: number; r: Rect; children: (local: number) => React.ReactNode; bg?: string; until?: number; push?: number }> = ({ t, at, r, children, bg = PAPER, until = 999, push = 0.06 }) => {
  if (t < at || t > until) return null;
  const local = t - at;
  const p = ip(local, [0, 0.22], [0, 1], EASE_OUT);
  const sk = r.skew ?? 0;
  const pts = `${r.x + sk},${r.y} ${r.x + r.w},${r.y} ${r.x + r.w - sk},${r.y + r.h} ${r.x},${r.y + r.h}`;
  const clip = `polygon(${r.x + sk}px ${r.y}px, ${r.x + r.w}px ${r.y}px, ${r.x + r.w - sk}px ${r.y + r.h}px, ${r.x}px ${r.y + r.h}px)`;
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  return (
    <AbsoluteFill style={{ opacity: p, scale: String(1.06 - 0.06 * p), transformOrigin: `${cx}px ${cy}px` }}>
      <AbsoluteFill style={{ clipPath: clip, background: bg }}>
        <AbsoluteFill style={{ scale: String(1 + local * push), transformOrigin: `${cx}px ${cy}px` }}>{children(local)}</AbsoluteFill>
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <polygon points={pts} fill="none" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};

/** Ink focus lines on a panel. */
export const InkLines: React.FC<{ t: number; x?: number; y?: number; n?: number; inner?: number; color?: string; width?: number }> = ({ t, x = 540, y = 960, n = 90, inner = 260, color = INK, width = 0.012 }) => {
  const f = Math.floor(t * 12);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {new Array(n).fill(0).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + random(`ia${i}-${f}`) * 0.05;
        const r0 = inner + random(`ir${i}-${f}`) * 200;
        const w = width * (0.4 + random(`iw${i}-${f}`));
        return <path key={i} d={`M ${x + Math.cos(a) * r0} ${y + Math.sin(a) * r0} L ${x + Math.cos(a - w) * 2300} ${y + Math.sin(a - w) * 2300} L ${x + Math.cos(a + w) * 2300} ${y + Math.sin(a + w) * 2300} Z`} fill={color} />;
      })}
    </svg>
  );
};

/** Parallel speed lines. */
export const InkSpeed: React.FC<{ t: number; angle?: number; n?: number; color?: string }> = ({ t, angle = 0, n = 60, color = INK }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, rotate: `${angle}deg`, scale: "1.5" }}>
    {new Array(n).fill(0).map((_, i) => {
      const y = random(`ky${i}`) * 1920;
      const len = 400 + random(`kl${i}`) * 900;
      const x = ((random(`kx${i}`) * 2600 - t * 4000) % 2600 + 2600) % 2600 - 700;
      return <path key={i} d={`M ${x} ${y} L ${x + len} ${y - 2} L ${x + len} ${y + 2 + random(`kh${i}`) * 4} Z`} fill={color} />;
    })}
  </svg>
);

/** Manga sound effect lettering. */
export const Sfx: React.FC<{ t: number; at: number; until: number; text: string; x: number; y: number; size?: number; rot?: number; color?: string; stroke?: string }> = ({ t, at, until, text, x, y, size = 160, rot = -12, color = INK, stroke = PAPER }) => {
  if (t < at || t > until) return null;
  const p = ip(t, [at, at + 0.15], [0, 1], BACK);
  const jit = Math.sin(t * 60) * 3 * ip(t, [at, at + 0.4], [1, 0]);
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", rotate: `${rot + jit}deg`, scale: String(p), fontFamily: DISPLAY, fontWeight: 900, fontSize: size, color, WebkitTextStroke: `${size * 0.09}px ${stroke}`, paintOrder: "stroke", fontStyle: "italic", letterSpacing: -4, whiteSpace: "nowrap", lineHeight: 1 }}>
      {text}
    </div>
  );
};

/** Speech balloon (round, or spiky for shouts) with Russian lettering. */
export const Balloon: React.FC<{ t: number; at: number; until: number; text: string; x: number; y: number; w?: number; shout?: boolean; tail?: [number, number]; size?: number }> = ({ t, at, until, text, x, y, w = 520, shout, tail = [0, 120], size = 50 }) => {
  if (t < at || t > until) return null;
  const p = ip(t, [at, at + 0.18], [0, 1], BACK);
  const h = size * 1.35 * Math.ceil(text.length / Math.floor(w / (size * 0.62))) + 70;
  const pts: string[] = [];
  if (shout) {
    const n = 22;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = i % 2 ? 1.0 : 1.22 + random(`b${i}${at}`) * 0.12;
      pts.push(`${Math.cos(a) * (w / 2) * rr},${Math.sin(a) * (h / 2) * rr}`);
    }
  }
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: String(p) }}>
      <svg width={w * 1.6} height={h * 1.6 + 260} style={{ position: "absolute", left: -w * 0.3, top: -h * 0.3, overflow: "visible" }}>
        <g transform={`translate(${w * 0.8} ${h * 0.8})`}>
          <path d={`M ${-30} ${h * 0.3} L ${tail[0]} ${tail[1] + h * 0.3} L ${30} ${h * 0.3} Z`} fill="#FFFFFF" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          {shout ? <polygon points={pts.join(" ")} fill="#FFFFFF" stroke={INK} strokeWidth={7} strokeLinejoin="round" /> : <ellipse rx={w / 2 + 30} ry={h / 2 + 20} fill="#FFFFFF" stroke={INK} strokeWidth={7} />}
          <path d={`M ${-26} ${h * 0.26} L ${tail[0]} ${tail[1] + h * 0.3 - 14} L ${26} ${h * 0.26} Z`} fill="#FFFFFF" />
        </g>
      </svg>
      <div style={{ position: "relative", width: w, minHeight: h, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SUB, fontWeight: 1000, fontSize: size, lineHeight: 1.15, color: INK }}>{text}</div>
    </div>
  );
};

/** Rectangular narration box. */
export const Caption: React.FC<{ t: number; at: number; until: number; text: string; x: number; y: number; w?: number; dark?: boolean }> = ({ t, at, until, text, x, y, w = 760, dark }) => {
  if (t < at || t > until) return null;
  const p = ip(t, [at, at + 0.2], [0, 1], EASE_OUT);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, translate: `${(1 - p) * -40}px 0px`, opacity: p, background: dark ? INK : "#FFFFFF", color: dark ? "#FFFFFF" : INK, border: `6px solid ${INK}`, padding: "18px 26px", fontFamily: SUB, fontWeight: 900, fontSize: 44, lineHeight: 1.2, boxShadow: `10px 10px 0 ${INK}` }}>
      {text}
    </div>
  );
};
