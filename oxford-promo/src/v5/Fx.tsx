import React from "react";
import { AbsoluteFill, random } from "remotion";
import { A, JP, SUB, ip } from "./theme";

/** Radial speed lines (focus lines) — the anime staple. */
export const FocusLines: React.FC<{ t: number; x?: number; y?: number; n?: number; color?: string; opacity?: number; inner?: number }> = ({ t, x = 540, y = 960, n = 70, color = A.white, opacity = 0.8, inner = 260 }) => {
  const f = Math.floor(t * 24);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}>
      {new Array(n).fill(0).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + random(`fa${i}-${f}`) * 0.08;
        const r0 = inner + random(`fr${i}-${f}`) * 180;
        const w = 0.006 + random(`fw${i}-${f}`) * 0.014;
        return <path key={i} d={`M ${x + Math.cos(a) * r0} ${y + Math.sin(a) * r0} L ${x + Math.cos(a - w) * 2200} ${y + Math.sin(a - w) * 2200} L ${x + Math.cos(a + w) * 2200} ${y + Math.sin(a + w) * 2200} Z`} fill={color} />;
      })}
    </svg>
  );
};

/** Horizontal speed lines for dashes. */
export const SpeedLines: React.FC<{ t: number; n?: number; color?: string; opacity?: number; angle?: number }> = ({ t, n = 40, color = A.white, opacity = 0.7, angle = 0 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity, rotate: `${angle}deg`, scale: "1.4", pointerEvents: "none" }}>
    {new Array(n).fill(0).map((_, i) => {
      const y = random(`sy${i}`) * 1920;
      const len = 300 + random(`sl${i}`) * 700;
      const x = ((random(`sx${i}`) * 2400 - t * 5200 * (0.6 + random(`sv${i}`))) % 2400 + 2400) % 2400 - 600;
      return <rect key={i} x={x} y={y} width={len} height={3 + random(`sh${i}`) * 8} fill={color} />;
    })}
  </svg>
);

/** Shake offset for the whole frame. */
export const shake = (t: number, hits: number[], amp = 26, dur = 0.45) => {
  let a = 0;
  for (const h of hits) if (t >= h && t < h + dur) a = Math.max(a, amp * (1 - (t - h) / dur));
  return { x: Math.sin(t * 97) * a, y: Math.cos(t * 83) * a };
};

/** Impact frame: inverted, high-contrast flash for a couple of frames. */
export const impactFilter = (t: number, hits: number[]) => (hits.some((h) => t >= h && t < h + 0.1) ? "invert(1) contrast(1.8) grayscale(1)" : "none");

/** Sakura petals drifting. */
export const Petals: React.FC<{ t: number; n?: number; opacity?: number }> = ({ t, n = 26, opacity = 1 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}>
    {new Array(n).fill(0).map((_, i) => {
      const sp = 120 + random(`pv${i}`) * 160;
      const y = ((random(`py${i}`) * 2200 + t * sp) % 2200) - 140;
      const x = random(`px${i}`) * 1180 - 50 + Math.sin(t * 1.4 + i) * 60 - t * 40;
      const r = t * (60 + random(`pr${i}`) * 120) + i * 30;
      return <ellipse key={i} cx={((x % 1180) + 1180) % 1180} cy={y} rx={12} ry={7} fill="#FFB7C9" transform={`rotate(${r} ${((x % 1180) + 1180) % 1180} ${y})`} opacity={0.85} />;
    })}
  </svg>
);

/** Fansub-style subtitle: yellow with heavy black outline. */
export const Fansub: React.FC<{ t: number; at: number; until: number; text: string; who?: string; y?: number }> = ({ t, at, until, text, who, y = 1640 }) => {
  if (t < at || t > until) return null;
  const o = ip(t, [at, at + 0.08, until - 0.08, until], [0, 1, 1, 0]);
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: y, maxWidth: 960, textAlign: "center", opacity: o }}>
        {who && <div style={{ fontFamily: SUB, fontWeight: 900, fontSize: 34, color: A.steel, WebkitTextStroke: `8px ${A.ink}`, paintOrder: "stroke", marginBottom: 4 }}>{who}</div>}
        <div style={{ fontFamily: SUB, fontWeight: 1000, fontSize: 56, lineHeight: 1.15, color: "#FFE14D", WebkitTextStroke: `12px ${A.ink}`, paintOrder: "stroke" }}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};

/** Big vertical kanji stamped on screen. */
export const Kanji: React.FC<{ t: number; at: number; until: number; text: string; x: number; y: number; size?: number; color?: string; vertical?: boolean }> = ({ t, at, until, text, x, y, size = 220, color = A.red, vertical = true }) => {
  if (t < at || t > until) return null;
  const p = ip(t, [at, at + 0.12], [2.2, 1]);
  const o = ip(t, [at, at + 0.06, until - 0.15, until], [0, 1, 1, 0]);
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% 0", writingMode: vertical ? "vertical-rl" : "horizontal-tb", fontFamily: JP, fontWeight: 900, fontSize: size, lineHeight: 1, color, WebkitTextStroke: `8px ${A.ink}`, paintOrder: "stroke", scale: String(p), opacity: o }}>
      {text}
    </div>
  );
};

/** Diagonal manga panel mask. */
export const panel = (pts: [number, number][]) => `polygon(${pts.map(([x, y]) => `${x}px ${y}px`).join(", ")})`;

/** Letterbox bars for a cinematic look. */
export const Letterbox: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: size, background: A.ink }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: size, background: A.ink }} />
  </>
);

/** Rotating seal circle with English runes. */
export const Seal: React.FC<{ t: number; x: number; y: number; r: number; p: number; color?: string }> = ({ t, x, y, r, p, color = A.gold }) => {
  if (p <= 0) return null;
  const words = "LIGHT · COURAGE · KNOWLEDGE · SEAL · ENGLISH · POWER · ";
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <defs>
        <path id={`ring${r}`} d={`M ${x - r * 0.82} ${y} a ${r * 0.82} ${r * 0.82} 0 1 1 ${r * 1.64} 0 a ${r * 0.82} ${r * 0.82} 0 1 1 ${-r * 1.64} 0`} />
      </defs>
      <g opacity={p} transform={`rotate(${t * 40} ${x} ${y})`}>
        <circle cx={x} cy={y} r={r * p} fill="none" stroke={color} strokeWidth={10} />
        <circle cx={x} cy={y} r={r * 0.7 * p} fill="none" stroke={color} strokeWidth={6} />
        <text fontFamily={SUB} fontWeight={900} fontSize={r * 0.11} fill={color} letterSpacing={4}>
          <textPath href={`#ring${r}`}>{words + words}</textPath>
        </text>
        {new Array(6).fill(0).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return <line key={i} x1={x + Math.cos(a) * r * 0.7 * p} y1={y + Math.sin(a) * r * 0.7 * p} x2={x + Math.cos(a + 2.1) * r * 0.7 * p} y2={y + Math.sin(a + 2.1) * r * 0.7 * p} stroke={color} strokeWidth={5} />;
        })}
      </g>
    </svg>
  );
};
