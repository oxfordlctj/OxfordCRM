import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { C, DISPLAY, HITS, clamp, easeOut, punch, s } from "./theme";

/** Camera shake offset for the given absolute frame. */
export const shakeAt = (frame: number) => {
  let x = 0;
  let y = 0;
  let r = 0;
  for (const h of HITS) {
    const d = frame - s(h.t);
    if (d < 0 || d > 24) continue;
    const k = h.power * Math.exp(-d / 4.5);
    x += (random(`x${h.t}${d}`) - 0.5) * 2 * k;
    y += (random(`y${h.t}${d}`) - 0.5) * 2 * k;
    r += (random(`r${h.t}${d}`) - 0.5) * 0.06 * k;
  }
  return { x, y, r };
};

/** Animated film grain. */
export const Grain: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed={frame % 12}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.85 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 35%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** Quick full-frame flash at the given frame. */
export const Flash: React.FC<{ at: number; color?: string; peak?: number; len?: number }> = ({
  at,
  color = "#fff",
  peak = 0.6,
  len = 8,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 1, at + len], [0, peak, 0], clamp);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ backgroundColor: color, opacity: o }} />;
};

/** A word that slams into place from a big blurred scale. */
export const Slam: React.FC<{
  at: number;
  children: React.ReactNode;
  size: number;
  color?: string;
  weight?: number;
  from?: number;
  tracking?: number;
  style?: React.CSSProperties;
}> = ({ at, children, size, color = "#fff", weight = 900, from = 1.9, tracking = 0, style }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.02,
        color,
        letterSpacing: tracking,
        textAlign: "center",
        opacity: interpolate(frame, [at, at + 3], [0, 1], clamp),
        scale: interpolate(frame, [at, at + 9], [from, 1], { ...clamp, easing: punch }),
        filter: `blur(${interpolate(frame, [at, at + 7], [14, 0], clamp)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Text that rises in from below with a soft fade. */
export const Rise: React.FC<{
  at: number;
  children: React.ReactNode;
  size: number;
  color?: string;
  weight?: number;
  tracking?: number;
  style?: React.CSSProperties;
}> = ({ at, children, size, color = "#fff", weight = 800, tracking = 0, style }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.05,
        color,
        letterSpacing: tracking,
        textAlign: "center",
        opacity: interpolate(frame, [at, at + 10], [0, 1], clamp),
        translate: interpolate(frame, [at, at + 14], ["0px 60px", "0px 0px"], { ...clamp, easing: easeOut }),
        filter: `blur(${interpolate(frame, [at, at + 10], [10, 0], clamp)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Letters appear one by one, like a typewriter, with a blinking cursor. */
export const Typewriter: React.FC<{
  at: number;
  text: string;
  size: number;
  cps?: number;
  color?: string;
}> = ({ at, text, size, cps = 26, color = "#fff" }) => {
  const frame = useCurrentFrame();
  const shown = Math.max(0, Math.floor(((frame - at) / 30) * cps));
  const cursorOn = Math.floor(frame / 8) % 2 === 0;
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.12,
        color,
        textAlign: "center",
        whiteSpace: "pre-wrap",
      }}
    >
      {text.slice(0, shown)}
      <span style={{ color: C.red, opacity: cursorOn ? 1 : 0 }}>|</span>
    </div>
  );
};

/** Rounded bar — the visual DNA of the A+ logo. */
export const Pill: React.FC<{
  color: string;
  w: number;
  h: number;
  x: number;
  y: number;
  rot: number;
  opacity?: number;
}> = ({ color, w, h, x, y, rot, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      borderRadius: h / 2,
      backgroundColor: color,
      rotate: `${rot}deg`,
      opacity,
      boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
    }}
  />
);

export const fadeOut = (frame: number, end: number, len = 6) =>
  interpolate(frame, [end - len, end], [1, 0], clamp);

/**
 * Cinematic per-letter reveal: each glyph flips up in 3D with a short stagger,
 * then a light sweep travels across the word.
 */
export const FlipText: React.FC<{
  at: number;
  text: string;
  size: number;
  color?: string;
  gradient?: string;
  weight?: number;
  stagger?: number;
  sweep?: boolean;
  glow?: string;
  style?: React.CSSProperties;
}> = ({ at, text, size, color = "#fff", gradient, weight = 900, stagger = 1.2, sweep = true, glow, style }) => {
  const frame = useCurrentFrame();
  const chars = Array.from(text);
  const sweepX = interpolate(frame, [at + 6, at + 26], [-30, 130], clamp);
  return (
    <div
      style={{
        position: "relative",
        fontFamily: DISPLAY,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.04,
        textAlign: "center",
        perspective: 900,
        whiteSpace: "nowrap",
        filter: glow ? `drop-shadow(0 0 28px ${glow})` : undefined,
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const a = at + i * stagger;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              color: gradient ? "transparent" : color,
              backgroundImage: gradient,
              backgroundClip: gradient ? "text" : undefined,
              WebkitBackgroundClip: gradient ? "text" : undefined,
              transformOrigin: "50% 100%",
              rotate: `x ${interpolate(frame, [a, a + 9], [95, 0], { ...clamp, easing: punch })}deg`,
              translate: `0px ${interpolate(frame, [a, a + 9], [size * 0.35, 0], { ...clamp, easing: easeOut })}px`,
              opacity: interpolate(frame, [a, a + 4], [0, 1], clamp),
            }}
          >
            {ch}
          </span>
        );
      })}
      {sweep ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(105deg, rgba(255,255,255,0) ${sweepX - 12}%, rgba(255,255,255,0.75) ${sweepX}%, rgba(255,255,255,0) ${sweepX + 12}%)`,
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  );
};

export const GOLD = "linear-gradient(180deg, #FFFFFF 0%, #FFF3D6 45%, #FFC66B 100%)";
export const ICE = "linear-gradient(180deg, #FFFFFF 0%, #D9F1FF 50%, #7CCBF0 100%)";
export const FIRE = "linear-gradient(180deg, #FFB199 0%, #FF4A3D 50%, #C90E18 100%)";
