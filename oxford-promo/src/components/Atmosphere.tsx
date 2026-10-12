import React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

const DUST = new Array(70).fill(0).map((_, i) => ({
  x: random(`dx${i}`),
  y: random(`dy${i}`),
  r: 1 + random(`dr${i}`) * 2.6,
  v: 0.2 + random(`dv${i}`) * 0.8,
  a: 0.15 + random(`da${i}`) * 0.5,
  gold: random(`dg${i}`) > 0.8,
}));

/** Deep navy backdrop with slow light blobs and drifting dust. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 30;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1200px 1100px at 50% 45%, ${COLORS.navy} 0%, ${COLORS.ink} 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: 540 - 450 + Math.sin(t * 0.35) * 220,
          top: 300 + Math.cos(t * 0.27) * 160,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.royal}55 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          left: 540 - 400 + Math.cos(t * 0.3) * 260,
          top: 1150 + Math.sin(t * 0.22) * 180,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.gold}1c 0%, transparent 65%)`,
        }}
      />
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {DUST.map((d, i) => {
          const y = (((d.y * height - frame * d.v * 1.4) % height) + height) % height;
          const x = d.x * width + Math.sin(frame / 50 + i) * 14;
          const tw = 0.6 + 0.4 * Math.sin(frame / 12 + i * 1.7);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={d.r}
              fill={d.gold ? COLORS.goldSoft : COLORS.sky}
              opacity={d.a * tw}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Film grain + vignette that sit on top of everything. */
export const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 75% 60% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)",
        }}
      />
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.09, mixBlendMode: "screen" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 9} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
