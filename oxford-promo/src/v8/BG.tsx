import React from "react";
import { AbsoluteFill, random } from "remotion";
import { LINE } from "../v7/RenHD";

/** Painted anime sky: gradient, stars, cel-shaded cloud bands. */
export const Sky: React.FC<{ t: number; top: string; mid: string; low: string; stars?: number; clouds?: string; cloudsS?: string }> = ({ t, top, mid, low, stars = 0, clouds, cloudsS }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${mid} 50%, ${low} 85%)` }} />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      {new Array(stars).fill(0).map((_, i) => (
        <circle key={i} cx={random(`st${i}`) * 1080} cy={random(`sy${i}`) * 900} r={1 + random(`sr${i}`) * 2.5} fill="#FFFFFF" opacity={0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i))} />
      ))}
      {clouds &&
        [0, 1, 2, 3].map((i) => {
          const y = 300 + i * 190;
          const x = ((i * 380 + t * (14 + i * 6)) % 1700) - 500;
          return (
            <g key={i} transform={`translate(${x} ${y})`} opacity={0.9}>
              <path d="M 0 60 Q 40 0 120 20 Q 180 -40 270 10 Q 360 -20 420 40 Q 520 40 560 70 L 0 70 Z" fill={clouds} />
              <path d="M 20 70 Q 200 40 540 70 Z" fill={cloudsS ?? clouds} />
            </g>
          );
        })}
    </svg>
  </AbsoluteFill>
);

/** Big moon with halo. */
export const Moon: React.FC<{ x: number; y: number; r: number; color?: string; t: number }> = ({ x, y, r, color = "#FFF2D6", t }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    <circle cx={x} cy={y} r={r * 2.2} fill={color} opacity={0.07 + 0.02 * Math.sin(t * 2)} />
    <circle cx={x} cy={y} r={r * 1.5} fill={color} opacity={0.12} />
    <circle cx={x} cy={y} r={r} fill={color} />
    <circle cx={x + r * 0.3} cy={y - r * 0.2} r={r * 0.22} fill="#000" opacity={0.06} />
    <circle cx={x - r * 0.35} cy={y + r * 0.3} r={r * 0.14} fill="#000" opacity={0.06} />
  </svg>
);

/** Snow-capped mountain range with cel shading. */
export const Mountains: React.FC<{ y: number; fill: string; shade: string; snow?: string; scale?: number }> = ({ y, fill, shade, snow = "#F2E6EC", scale = 1 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    <g transform={`translate(0 ${y}) scale(1 ${scale})`}>
      <path d="M -40 380 L 160 60 L 300 230 L 520 -80 L 720 200 L 880 20 L 1120 330 L 1120 900 L -40 900 Z" fill={fill} stroke={LINE} strokeWidth={4} />
      <path d="M 520 -80 L 600 120 L 560 300 L 720 200 Z M 160 60 L 210 200 L 300 230 Z M 880 20 L 940 180 L 1120 330 Z" fill={shade} />
      <path d="M 520 -80 L 460 10 L 490 0 L 510 30 L 540 0 L 580 20 Z" fill={snow} />
      <path d="M 880 20 L 840 80 L 870 70 L 890 90 L 910 60 Z" fill={snow} />
    </g>
  </svg>
);

/** Village of pagoda roofs with lit windows; burn = 0..1 adds flames. */
export const Village: React.FC<{ t: number; y?: number; burn?: number; dark?: string; lit?: string }> = ({ t, y = 1360, burn = 0, dark = "#1C0B18", lit = "#FFB12E" }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    {[0, 1].map((row) =>
      new Array(6).fill(0).map((_, i) => {
        const x = i * 200 - 60 + row * 100;
        const h = 140 + ((i * 7 + row * 3) % 4) * 50 + row * -40;
        const base = y + row * 120;
        const roofW = 200;
        return (
          <g key={`${row}-${i}`}>
            <rect x={x + 30} y={base - h} width={roofW - 60} height={h + 600} fill={row ? "#12060F" : dark} stroke={LINE} strokeWidth={3} />
            {/* curved double-eave roof */}
            <path d={`M ${x - 10} ${base - h} Q ${x + roofW / 2} ${base - h - 30} ${x + roofW + 10} ${base - h} L ${x + roofW - 20} ${base - h - 30} Q ${x + roofW / 2} ${base - h - 60} ${x + 20} ${base - h - 30} Z`} fill={row ? "#12060F" : dark} stroke={LINE} strokeWidth={3} />
            <path d={`M ${x + 20} ${base - h - 50} Q ${x + roofW / 2} ${base - h - 80} ${x + roofW - 20} ${base - h - 50} L ${x + roofW / 2} ${base - h - 110} Z`} fill={row ? "#12060F" : dark} stroke={LINE} strokeWidth={3} />
            {[0, 1].map((k) => (
              <rect key={k} x={x + 55 + k * 55} y={base - h + 40} width={34} height={44} fill={lit} opacity={0.55 + 0.35 * Math.sin(t * 4 + i + k + row)} />
            ))}
            {burn > 0 &&
              (i + row) % 2 === 0 &&
              [0, 1, 2].map((k) => {
                const fx = x + 40 + k * 50;
                const fh = (140 + Math.sin(t * 13 + k * 2 + i) * 50) * burn;
                return (
                  <g key={k}>
                    <path d={`M ${fx - 30} ${base - h - 20} Q ${fx - 20} ${base - h - fh * 0.6} ${fx + Math.sin(t * 9 + k) * 14} ${base - h - fh} Q ${fx + 26} ${base - h - fh * 0.5} ${fx + 30} ${base - h - 20} Z`} fill="#FF6A1A" />
                    <path d={`M ${fx - 14} ${base - h - 20} Q ${fx - 8} ${base - h - fh * 0.4} ${fx} ${base - h - fh * 0.65} Q ${fx + 12} ${base - h - fh * 0.3} ${fx + 14} ${base - h - 20} Z`} fill="#FFD23A" />
                  </g>
                );
              })}
          </g>
        );
      }),
    )}
    <rect x={0} y={y + 220} width={1080} height={800} fill="#0C040A" />
  </svg>
);

/** Rising embers. */
export const Embers: React.FC<{ t: number; n?: number; color?: string }> = ({ t, n = 40, color = "#FFB12E" }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", pointerEvents: "none" }}>
    {new Array(n).fill(0).map((_, i) => {
      const sp = 120 + random(`ev${i}`) * 260;
      const y = 1920 - ((random(`ey${i}`) * 2100 + t * sp) % 2100);
      const x = random(`ex${i}`) * 1080 + Math.sin(t * 2 + i) * 40;
      const r = 2 + random(`er${i}`) * 5;
      return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 6 + i))} />;
    })}
  </svg>
);

/** Drifting smoke bands. */
export const Smoke: React.FC<{ t: number; color?: string; opacity?: number; y?: number }> = ({ t, color = "#2A1A2E", opacity = 0.4, y = 900 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", pointerEvents: "none" }}>
    {new Array(8).fill(0).map((_, i) => (
      <ellipse key={i} cx={((i * 260 + t * (30 + i * 8)) % 1500) - 200} cy={y + Math.sin(i * 1.7) * 380} rx={380} ry={100} fill={color} opacity={opacity} />
    ))}
  </svg>
);

/** God rays from a point. */
export const Rays: React.FC<{ t: number; x: number; y: number; color?: string; opacity?: number; n?: number }> = ({ t, x, y, color = "#FFF6C8", opacity = 0.18, n = 12 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", pointerEvents: "none", opacity }}>
    <g transform={`rotate(${t * 6} ${x} ${y})`}>
      {new Array(n).fill(0).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        return <path key={i} d={`M ${x} ${y} L ${x + Math.cos(a - 0.07) * 2400} ${y + Math.sin(a - 0.07) * 2400} L ${x + Math.cos(a + 0.07) * 2400} ${y + Math.sin(a + 0.07) * 2400} Z`} fill={color} />;
      })}
    </g>
  </svg>
);

/** Anime post: vignette + film grain + subtle chromatic tint. */
export const Post: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
    <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.09, mixBlendMode: "overlay" }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 12} />
      </filter>
      <rect width={1080} height={1920} filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);
