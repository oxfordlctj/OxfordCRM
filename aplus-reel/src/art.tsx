import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { C, clamp } from "./theme";

/** Sunrise sky; `warmth` 0 = cold night, 1 = golden morning. `sat` scales saturation. */
export const Sky: React.FC<{ warmth: number; sunY: number; sat?: number }> = ({ warmth, sunY, sat = 1 }) => {
  const mix = (a: number[], b: number[]) =>
    `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * warmth)).join(",")})`;
  const top = mix([8, 14, 36], [28, 44, 104]);
  const mid = mix([20, 26, 62], [120, 86, 160]);
  const low = mix([40, 34, 70], [246, 140, 84]);
  const hor = mix([60, 40, 60], [255, 204, 120]);
  return (
    <AbsoluteFill style={{ filter: `saturate(${sat})` }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${mid} 38%, ${low} 66%, ${hor} 80%)` }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% ${sunY}px, rgba(255,240,200,${0.95 * warmth}) 0px, rgba(255,190,110,${0.55 * warmth}) 140px, rgba(255,140,80,${0.25 * warmth}) 420px, rgba(0,0,0,0) 900px)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Slowly rotating volumetric light rays from a point. */
export const GodRays: React.FC<{ x: number; y: number; opacity: number; color?: string }> = ({
  x,
  y,
  opacity,
  color = "255,226,170",
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: "screen",
        background: `repeating-conic-gradient(from ${frame * 0.15}deg at ${x}px ${y}px, rgba(${color},0.22) 0deg 3deg, rgba(${color},0) 3deg 11deg)`,
        maskImage: `radial-gradient(circle at ${x}px ${y}px, black 0px, black 200px, transparent 1300px)`,
        WebkitMaskImage: `radial-gradient(circle at ${x}px ${y}px, black 0px, black 200px, transparent 1300px)`,
        filter: "blur(6px)",
      }}
    />
  );
};

/** Anamorphic horizontal lens flare. */
export const Flare: React.FC<{ x: number; y: number; opacity: number; color?: string }> = ({
  x,
  y,
  opacity,
  color = "120,190,255",
}) => {
  const frame = useCurrentFrame();
  const flick = 0.85 + Math.sin(frame / 3.3) * 0.08 + Math.sin(frame / 1.7) * 0.05;
  return (
    <AbsoluteFill style={{ opacity: opacity * flick, mixBlendMode: "screen", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: x - 900,
          top: y - 6,
          width: 1800,
          height: 12,
          borderRadius: 6,
          background: `linear-gradient(90deg, rgba(${color},0), rgba(${color},0.9) 50%, rgba(${color},0))`,
          filter: "blur(3px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - 70,
          top: y - 70,
          width: 140,
          height: 140,
          borderRadius: 70,
          background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,240,210,0.6) 30%, rgba(255,200,140,0) 70%)",
        }}
      />
      {[0.35, 0.6, 1.35].map((k, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x + (540 - x) * k * 2 - 40 - i * 10,
            top: y + (960 - y) * k * 2 - 40 - i * 10,
            width: 80 + i * 20,
            height: 80 + i * 20,
            borderRadius: 100,
            border: `2px solid rgba(${color},0.25)`,
            background: `radial-gradient(circle, rgba(${color},0.12), rgba(${color},0))`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** Soft out-of-focus light orbs drifting upward. */
export const Bokeh: React.FC<{ count?: number; colors: string[]; opacity?: number; seed?: string }> = ({
  count = 22,
  colors,
  opacity = 0.5,
  seed = "b",
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "screen", pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const size = 30 + random(`${seed}s${i}`) * 150;
        const sp = 0.3 + random(`${seed}v${i}`) * 1.2;
        const x = random(`${seed}x${i}`) * 1080 + Math.sin(frame / 50 + i) * 30;
        const y = ((random(`${seed}y${i}`) * 2200 - frame * sp) % 2200 + 2200) % 2200 - 140;
        const col = colors[i % colors.length];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y,
              width: size,
              height: size,
              borderRadius: size,
              background: `radial-gradient(circle, ${col} 0%, ${col} 45%, rgba(0,0,0,0) 72%)`,
              opacity: 0.25 + random(`${seed}o${i}`) * 0.5,
              filter: `blur(${2 + random(`${seed}b${i}`) * 6}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Backlit school building silhouette with lit windows and a waving flag. */
export const School: React.FC<{ color: string; windowGlow: number; width?: number }> = ({
  color,
  windowGlow,
  width = 1000,
}) => {
  const frame = useCurrentFrame();
  const wave = (x: number) => Math.sin(frame / 5 + x / 18) * 8 * (x / 120);
  const flag = `M0 0 ${[0, 30, 60, 90, 120].map((x) => `L${x} ${wave(x)}`).join(" ")} L120 ${70 + wave(120)} ${[90, 60, 30, 0]
    .map((x) => `L${x} ${70 + wave(x)}`)
    .join(" ")} Z`;
  return (
    <svg width={width} height={width * 0.62} viewBox="0 0 1000 620">
      {/* flag */}
      <rect x={496} y={20} width={8} height={170} fill={color} />
      <g transform="translate(504 26)">
        <path d={flag} fill={color} opacity={0.9} />
      </g>
      {/* roof */}
      <polygon points="300,250 500,150 700,250" fill={color} />
      <rect x={60} y={250} width={880} height={370} fill={color} />
      <rect x={260} y={250} width={480} height={370} fill={color} />
      {/* clock */}
      <circle cx={500} cy={215} r={30} fill={`rgba(255,220,150,${0.25 + windowGlow * 0.5})`} />
      {/* windows */}
      {new Array(3).fill(0).flatMap((_, r) =>
        new Array(8).fill(0).map((__, c) => {
          const x = 100 + c * 104 + (c >= 4 ? 30 : 0);
          const y = 300 + r * 92;
          if (c === 3 || c === 4) return null;
          const lit = random(`w${r}${c}`) > 0.25;
          return (
            <rect
              key={`${r}-${c}`}
              x={x}
              y={y}
              width={62}
              height={58}
              rx={6}
              fill={lit ? `rgba(255,214,140,${windowGlow * (0.6 + random(`wl${r}${c}`) * 0.4)})` : "rgba(0,0,0,0)"}
            />
          );
        }),
      )}
      {/* doors */}
      <rect x={430} y={470} width={140} height={150} rx={70} fill={`rgba(255,226,170,${windowGlow})`} />
      {/* steps */}
      <rect x={380} y={600} width={240} height={20} fill={color} />
    </svg>
  );
};

/** Child silhouette with backpack and a walk/run cycle. */
export const Kid: React.FC<{
  color: string;
  height: number;
  walk: number; // phase in radians
  stride?: number;
  pack?: string;
  bob?: number;
}> = ({ color, height, walk, stride = 26, pack, bob = 6 }) => {
  const leg = Math.sin(walk) * stride;
  const arm = -Math.sin(walk) * stride * 0.9;
  const lift = Math.abs(Math.cos(walk)) * bob;
  return (
    <svg width={height * 0.5} height={height} viewBox="0 0 200 400" style={{ overflow: "visible" }}>
      <g transform={`translate(0 ${-lift})`}>
        {/* back leg/arm */}
        <g transform={`rotate(${-leg} 100 228)`}>
          <rect x={86} y={222} width={28} height={150} rx={14} fill={color} />
          <ellipse cx={108} cy={372} rx={24} ry={12} fill={color} />
        </g>
        <g transform={`rotate(${-arm} 100 112)`}>
          <rect x={90} y={108} width={22} height={110} rx={11} fill={color} />
        </g>
        {/* backpack */}
        <rect x={48} y={104} width={52} height={104} rx={20} fill={pack ?? color} />
        <rect x={58} y={150} width={34} height={36} rx={8} fill="rgba(255,255,255,0.18)" />
        {/* torso */}
        <rect x={74} y={98} width={58} height={136} rx={26} fill={color} />
        {/* head + hair */}
        <circle cx={104} cy={58} r={40} fill={color} />
        <path d="M66 52 Q74 10 112 14 Q146 18 144 56 Q120 34 92 40 Z" fill={color} />
        {/* front leg/arm */}
        <g transform={`rotate(${leg} 100 228)`}>
          <rect x={86} y={222} width={28} height={150} rx={14} fill={color} />
          <ellipse cx={108} cy={372} rx={24} ry={12} fill={color} />
        </g>
        <g transform={`rotate(${arm} 104 112)`}>
          <rect x={94} y={108} width={22} height={110} rx={11} fill={color} />
        </g>
      </g>
    </svg>
  );
};

/** Burst of brand-coloured confetti from a point. */
export const Confetti: React.FC<{ at: number; x: number; y: number; count?: number; seed?: string }> = ({
  at,
  x,
  y,
  count = 70,
  seed = "c",
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 110) return null;
  const cols = [C.blue, C.red, C.orange, C.yellow, C.green];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const ang = random(`${seed}a${i}`) * Math.PI * 2;
        const v = 18 + random(`${seed}v${i}`) * 30;
        const drag = 1 - Math.exp(-t / 14);
        const px = x + Math.cos(ang) * v * 14 * drag + Math.sin(t / 6 + i) * 10;
        const py = y + Math.sin(ang) * v * 14 * drag + t * t * 0.045;
        const w = 14 + random(`${seed}w${i}`) * 16;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: w,
              height: w * 0.45,
              borderRadius: 4,
              backgroundColor: cols[i % cols.length],
              rotate: `${t * (6 + random(`${seed}r${i}`) * 14)}deg`,
              scale: `1 ${Math.cos(t / 3 + i)}`,
              opacity: interpolate(t, [0, 2, 80, 110], [0, 1, 1, 0], clamp),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
