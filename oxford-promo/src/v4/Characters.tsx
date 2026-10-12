import React from "react";
import { C } from "./theme";

export type Mood = "happy" | "sad" | "wow" | "talk" | "dizzy";

type Look = {
  hoodie: string;
  pants: string;
  hair: string;
  skin: string;
  long?: boolean;
  glasses?: boolean;
  backpack?: boolean;
};

export const AMIR: Look = { hoodie: "#2F6FDB", pants: "#1F2A55", hair: "#2B1D14", skin: "#F2C29B", backpack: true };
export const TEACHER: Look = { hoodie: C.teal, pants: "#2D3A6B", hair: "#4A2C1A", skin: "#EDBB93", long: true, glasses: true };
export const KIDS: Look[] = [
  { hoodie: C.coral, pants: "#2D3A6B", hair: "#1B120C", skin: "#E8B48C", long: true },
  { hoodie: C.green, pants: "#2D3A6B", hair: "#3B2416", skin: "#F4C9A4" },
  { hoodie: "#9B5DE5", pants: "#2D3A6B", hair: "#20140C", skin: "#DDA57C", long: true },
  { hoodie: C.lamp, pants: "#2D3A6B", hair: "#2B1D14", skin: "#F2C29B" },
];

/**
 * A rigged cartoon kid drawn in SVG. Origin is between the feet; the figure is ~420 units tall.
 * walk: phase in radians (0 = standing). arms: [left, right] angles in degrees (0 = down, 180 = up).
 */
export const Kid: React.FC<{
  look?: Look;
  mood?: Mood;
  walk?: number;
  walkAmp?: number;
  arms?: [number, number];
  blink?: boolean;
  lookX?: number;
  talk?: number;
  x?: number;
  y?: number;
  scale?: number;
  flip?: boolean;
  bob?: number;
}> = ({ look = AMIR, mood = "happy", walk = 0, walkAmp = 0, arms = [6, 6], blink, lookX = 0, talk = 0, x = 0, y = 0, scale = 1, flip, bob = 0 }) => {
  const legA = Math.sin(walk) * 28 * walkAmp;
  const bounce = -Math.abs(Math.cos(walk)) * 10 * walkAmp + bob;
  const armSwing = Math.sin(walk) * 30 * walkAmp;
  const aL = arms[0] - armSwing;
  const aR = arms[1] + armSwing;
  const eyeH = blink ? 1 : mood === "wow" ? 15 : 12;
  const mouth =
    mood === "sad"
      ? "M -16 -286 Q 0 -298 16 -286"
      : mood === "wow"
        ? null
        : mood === "dizzy"
          ? "M -14 -290 Q -7 -284 0 -290 Q 7 -296 14 -290"
          : "M -20 -294 Q 0 -274 20 -294";
  const brow = mood === "sad" ? 10 : mood === "wow" ? -8 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <ellipse cx={0} cy={4} rx={70} ry={12} fill="#000" opacity={0.18} />
      <g transform={`translate(0 ${bounce})`}>
        {/* legs */}
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * 22} -150) rotate(${s * legA})`}>
            <rect x={-17} y={0} width={34} height={140} rx={16} fill={look.pants} />
            <ellipse cx={8} cy={146} rx={28} ry={14} fill="#F7F7F7" stroke="#222" strokeWidth={3} />
          </g>
        ))}
        {/* backpack */}
        {look.backpack && <rect x={-62} y={-262} width={124} height={110} rx={30} fill="#E85D3F" />}
        {/* torso */}
        <rect x={-56} y={-262} width={112} height={128} rx={40} fill={look.hoodie} />
        <path d="M -30 -262 Q 0 -232 30 -262" fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={5} />
        {look.backpack && (
          <>
            <rect x={-44} y={-258} width={10} height={100} rx={5} fill="#C9442B" />
            <rect x={34} y={-258} width={10} height={100} rx={5} fill="#C9442B" />
          </>
        )}
        {/* arms */}
        {[
          { s: -1, a: aL },
          { s: 1, a: aR },
        ].map(({ s, a }) => (
          <g key={s} transform={`translate(${s * 52} -248) rotate(${s * -a})`}>
            <rect x={-14} y={0} width={28} height={104} rx={14} fill={look.hoodie} />
            <circle cx={0} cy={110} r={17} fill={look.skin} />
          </g>
        ))}
        {/* head */}
        <g transform="translate(0 0)">
          {look.long && <path d="M -70 -330 Q -78 -230 -40 -232 L 40 -232 Q 78 -230 70 -330 Z" fill={look.hair} />}
          <circle cx={-64} cy={-318} r={14} fill={look.skin} />
          <circle cx={64} cy={-318} r={14} fill={look.skin} />
          <circle cx={0} cy={-322} r={66} fill={look.skin} />
          <path d="M -68 -330 Q -70 -402 0 -398 Q 70 -402 68 -330 Q 50 -360 20 -366 Q 6 -350 -16 -364 Q -46 -366 -68 -330 Z" fill={look.hair} />
          {[-1, 1].map((s) => (
            <g key={s}>
              <ellipse cx={s * 24 + lookX} cy={-326} rx={10} ry={eyeH} fill={C.ink} />
              {!blink && <circle cx={s * 24 + lookX + 3} cy={-330} r={3.5} fill="#fff" />}
              <line x1={s * 14} y1={-352 - (s < 0 ? brow : 0)} x2={s * 36} y2={-352 - (s > 0 ? brow : 0) + (mood === "sad" ? 4 : 0)} stroke={look.hair} strokeWidth={6} strokeLinecap="round" />
            </g>
          ))}
          {look.glasses && (
            <g fill="none" stroke={C.ink} strokeWidth={4}>
              <circle cx={-24} cy={-326} r={20} />
              <circle cx={24} cy={-326} r={20} />
              <line x1={-4} y1={-326} x2={4} y2={-326} />
            </g>
          )}
          <circle cx={-40} cy={-300} r={10} fill={C.coral} opacity={0.35} />
          <circle cx={40} cy={-300} r={10} fill={C.coral} opacity={0.35} />
          {mood === "wow" || talk > 0 ? (
            <ellipse cx={0} cy={-286} rx={mood === "wow" ? 12 : 14} ry={mood === "wow" ? 16 : 4 + talk * 12} fill="#7A2E2E" />
          ) : (
            <path d={mouth!} fill="none" stroke="#7A2E2E" strokeWidth={6} strokeLinecap="round" />
          )}
        </g>
      </g>
    </g>
  );
};

/** Blink helper: closed for 3 frames every ~2.7 s, offset per character. */
export const isBlink = (frame: number, seed = 0) => (frame + seed * 17) % 80 < 3;
