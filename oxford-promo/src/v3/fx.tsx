import React from "react";
import { AbsoluteFill, Img, random, staticFile } from "remotion";
import { BACK, COLORS, DISPLAY, EASE_IN, EASE_OUT, ip } from "../theme";

export { ip, BACK, EASE_IN, EASE_OUT };

export const photo = (name: string) => staticFile(`photos/${name}`);

/** Full-bleed photo with Ken Burns drift and a navy/gold duotone grade. */
export const Photo: React.FC<{
  src: string;
  t: number;
  from?: number;
  to?: number;
  zoom?: [number, number];
  pan?: [number, number, number, number];
  tone?: number;
  style?: React.CSSProperties;
}> = ({ src, t, from = 0, to = 6, zoom = [1.08, 1.22], pan = [0, 0, -30, -20], tone = 0.65, style }) => {
  const p = ip(t, [from, to], [0, 1], (x) => x);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: String(zoom[0] + (zoom[1] - zoom[0]) * p),
          translate: `${pan[0] + (pan[2] - pan[0]) * p}px ${pan[1] + (pan[3] - pan[1]) * p}px`,
          filter: `grayscale(${tone}) contrast(1.1) brightness(0.95)`,
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${COLORS.royal}cc, ${COLORS.ink}ee)`, mixBlendMode: "multiply", opacity: tone }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 80% 15%, ${COLORS.gold}55, transparent 55%)`, mixBlendMode: "screen", opacity: tone }} />
    </div>
  );
};

/** Chromatic split that kicks on a hit and settles. */
export const Glitch: React.FC<{ t: number; at: number; children: React.ReactNode; amount?: number; style?: React.CSSProperties }> = ({ t, at, children, amount = 18, style }) => {
  const k = t >= at ? ip(t, [at, at + 0.35], [1, 0]) : 0;
  const jitter = k > 0 ? (random(`g${Math.floor(t * 30)}`) - 0.5) * amount * k : 0;
  return (
    <div style={{ position: "relative", ...style }}>
      {k > 0.02 && (
        <>
          <div style={{ position: "absolute", inset: 0, color: "#ff2e63", mixBlendMode: "screen", translate: `${-amount * k + jitter}px 0px`, opacity: 0.85 }}>{children}</div>
          <div style={{ position: "absolute", inset: 0, color: "#08d9d6", mixBlendMode: "screen", translate: `${amount * k - jitter}px ${jitter * 0.3}px`, opacity: 0.85 }}>{children}</div>
        </>
      )}
      <div style={{ position: "relative", translate: `${jitter * 0.4}px 0px` }}>{children}</div>
    </div>
  );
};

const GLYPHS = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ0123456789#%&";
/** Decoder-style reveal: random glyphs resolve into the text letter by letter. */
export const Scramble: React.FC<{ text: string; t: number; at: number; perChar?: number; style?: React.CSSProperties }> = ({ text, t, at, perChar = 0.05, style }) => {
  if (t < at) return <span style={{ ...style, opacity: 0 }}>{text}</span>;
  const f = Math.floor(t * 30);
  return (
    <span style={style}>
      {text.split("").map((ch, i) => {
        const done = t > at + i * perChar + 0.25;
        if (ch === " " || done) return <span key={i}>{ch}</span>;
        if (t < at + i * perChar * 0.5) return <span key={i} style={{ opacity: 0 }}>{ch}</span>;
        return (
          <span key={i} style={{ color: COLORS.gold }}>
            {GLYPHS[Math.floor(random(`s${i}-${f}`) * GLYPHS.length)]}
          </span>
        );
      })}
    </span>
  );
};

/** Marker sweep behind a word. */
export const Marker: React.FC<{ t: number; at: number; color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, at, color = COLORS.gold, children, style }) => (
  <span style={{ position: "relative", display: "inline-block", padding: "0 14px", ...style }}>
    <span style={{ position: "absolute", left: 0, right: 0, top: "12%", bottom: "8%", background: color, transformOrigin: "0 50%", scale: `${ip(t, [at, at + 0.35], [0, 1], EASE_OUT)} 1`, rotate: "-1.5deg", borderRadius: 6 }} />
    <span style={{ position: "relative" }}>{children}</span>
  </span>
);

/** Words that slam in one after another (scale + blur). */
export const Slam: React.FC<{ words: { w: string; at: number; color?: string; size?: number }[]; t: number; style?: React.CSSProperties; gap?: number }> = ({ words, t, style, gap = 0 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap, ...style }}>
    {words.map(({ w, at, color, size }) => (
      <div
        key={w + at}
        style={{
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: size ?? 110,
          lineHeight: 1.02,
          color: color ?? COLORS.white,
          opacity: ip(t, [at, at + 0.08], [0, 1]),
          scale: String(ip(t, [at, at + 0.28], [2.2, 1], EASE_OUT)),
          filter: `blur(${ip(t, [at, at + 0.22], [18, 0])}px)`,
          whiteSpace: "nowrap",
        }}
      >
        {w}
      </div>
    ))}
  </div>
);

/** Letters rising from a mask, staggered. */
export const Rise: React.FC<{ text: string; t: number; at: number; stagger?: number; style?: React.CSSProperties }> = ({ text, t, at, stagger = 0.035, style }) => (
  <div style={{ display: "flex", justifyContent: "center", overflow: "hidden", paddingBottom: "0.08em", whiteSpace: "pre", ...style }}>
    {text.split("").map((ch, i) => (
      <span key={i} style={{ display: "inline-block", translate: `0px ${ip(t, [at + i * stagger, at + i * stagger + 0.45], [110, 0], EASE_OUT)}%`, rotate: `${ip(t, [at + i * stagger, at + i * stagger + 0.45], [14, 0], EASE_OUT)}deg` }}>
        {ch}
      </span>
    ))}
  </div>
);

/** Radial speed-lines burst. */
export const Burst: React.FC<{ t: number; at: number; x: number; y: number; color?: string; rays?: number; len?: number }> = ({ t, at, x, y, color = COLORS.goldSoft, rays = 28, len = 900 }) => {
  if (t < at || t > at + 0.9) return null;
  const p = ip(t, [at, at + 0.7], [0, 1], EASE_OUT);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {new Array(rays).fill(0).map((_, i) => {
        const a = (i / rays) * Math.PI * 2 + random(`ba${i}`) * 0.1;
        const r0 = 60 + p * len * 0.55;
        const r1 = r0 + (1 - p) * (120 + random(`bl${i}`) * 260);
        return <line key={i} x1={x + Math.cos(a) * r0} y1={y + Math.sin(a) * r0} x2={x + Math.cos(a) * r1} y2={y + Math.sin(a) * r1} stroke={color} strokeWidth={6 * (1 - p) + 1} strokeLinecap="round" opacity={1 - p} />;
      })}
    </svg>
  );
};

/** Expanding rings. */
export const Shockwave: React.FC<{ t: number; at: number; x: number; y: number; color?: string; max?: number; count?: number }> = ({ t, at, x, y, color = COLORS.gold, max = 700, count = 3 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    {new Array(count).fill(0).map((_, k) => {
      const p = ip(t, [at + k * 0.1, at + 1.1 + k * 0.1], [0, 1], EASE_OUT);
      if (p <= 0 || p >= 1) return null;
      return <circle key={k} cx={x} cy={y} r={p * max} fill="none" stroke={color} strokeWidth={10 * (1 - p) + 1} opacity={1 - p} />;
    })}
  </svg>
);

/** Moving light leak (screen-blended blobs). */
export const LightLeak: React.FC<{ t: number; at: number; dur?: number; hue?: string }> = ({ t, at, dur = 1.2, hue = COLORS.gold }) => {
  const p = ip(t, [at, at + dur], [0, 1], (x) => x);
  if (p <= 0 || p >= 1) return null;
  const o = Math.sin(p * Math.PI);
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: o, pointerEvents: "none" }}>
      <div style={{ position: "absolute", width: 1400, height: 1400, left: -600 + p * 900, top: -300 + p * 400, borderRadius: "50%", background: `radial-gradient(circle, ${hue}cc, transparent 60%)` }} />
      <div style={{ position: "absolute", width: 1000, height: 1000, left: 600 - p * 700, top: 1100 - p * 500, borderRadius: "50%", background: `radial-gradient(circle, #ff7a3d99, transparent 60%)` }} />
    </AbsoluteFill>
  );
};

/** Flash frame for hard cuts. */
export const Flash: React.FC<{ t: number; at: number; color?: string; dur?: number; peak?: number }> = ({ t, at, color = "#fff6dc", dur = 0.45, peak = 0.85 }) => (
  <AbsoluteFill style={{ backgroundColor: color, mixBlendMode: "screen", opacity: ip(t, [at - 0.03, at, at + dur], [0, peak, 0]), pointerEvents: "none" }} />
);

/** Deterministic confetti burst. */
export const Confetti: React.FC<{ t: number; at: number; x?: number; y?: number; n?: number }> = ({ t, at, x = 540, y = 900, n = 140 }) => {
  if (t < at) return null;
  const age = t - at;
  const cols = [COLORS.gold, COLORS.goldSoft, COLORS.white, COLORS.sky, "#ff7a3d"];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {new Array(n).fill(0).map((_, i) => {
        const a = random(`ca${i}`) * Math.PI * 2;
        const v = 600 + random(`cv${i}`) * 1300;
        const px = x + Math.cos(a) * v * age * Math.exp(-age * 1.2) * 1.4;
        const py = y + Math.sin(a) * v * age * Math.exp(-age * 1.2) * 1.4 + 520 * age * age;
        const rot = age * (300 + random(`cr${i}`) * 700);
        const w = 10 + random(`cw${i}`) * 14;
        return <rect key={i} x={px - w / 2} y={py - w / 4} width={w} height={w / 2} fill={cols[i % cols.length]} transform={`rotate(${rot} ${px} ${py})`} opacity={ip(age, [2.4, 3.2], [1, 0])} />;
      })}
    </svg>
  );
};

/** Iris (circle) reveal of children. */
export const Iris: React.FC<{ t: number; at: number; dur?: number; x?: string; y?: string; children: React.ReactNode }> = ({ t, at, dur = 0.6, x = "50%", y = "50%", children }) => (
  <AbsoluteFill style={{ clipPath: `circle(${ip(t, [at, at + dur], [0, 150], EASE_IN)}% at ${x} ${y})` }}>{children}</AbsoluteFill>
);

/** Slow spinning dashed ring decoration. */
export const Ring: React.FC<{ t: number; x: number; y: number; r: number; color?: string; speed?: number; dash?: string; width?: number; opacity?: number }> = ({ t, x, y, r, color = COLORS.gold, speed = 20, dash = "4 14", width = 3, opacity = 1 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity }}>
    <circle cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} transform={`rotate(${t * speed} ${x} ${y})`} />
  </svg>
);

/** Hidden <Img>s so photos used by SVG <image> / CSS are decoded before the frame is captured. */
export const Preload: React.FC<{ srcs: string[] }> = ({ srcs }) => (
  <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 }}>
    {srcs.map((s) => (
      <Img key={s} src={s} style={{ width: 1, height: 1 }} />
    ))}
  </div>
);
