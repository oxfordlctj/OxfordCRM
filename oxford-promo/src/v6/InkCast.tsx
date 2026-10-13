import React from "react";
import { INK, RED } from "./Ink";

const W = "#FFFFFF";

/** Manga-style head of Ren. Origin = chin. power turns the Eye of Knowledge red. */
export const InkHead: React.FC<{ t: number; power?: number; mouth?: "calm" | "shout" | "grin" | "hurt"; look?: number; blink?: boolean; sweat?: boolean }> = ({ t, power = 0, mouth = "calm", look = 0, blink, sweat }) => {
  const crown = "M -116 -170 L -160 -214 L -126 -226 L -196 -292 L -120 -286 L -168 -372 L -78 -326 L -70 -414 L -14 -338 L 30 -424 L 54 -336 L 122 -392 L 108 -306 L 182 -318 L 128 -250 L 170 -222 L 116 -170 Z";
  return (
    <g>
      {/* back hair mass */}
      <path d={crown} fill={INK} />
      <path d="M -60 -350 L -40 -300 M 24 -380 L 34 -320 M 100 -350 L 86 -300" stroke={W} strokeWidth={5} strokeLinecap="round" />
      {/* neck */}
      <path d="M -30 -24 L -34 44 L 34 44 L 30 -24 Z" fill={W} stroke={INK} strokeWidth={6} />
      <path d="M -30 -24 L 30 -24 L 32 6 Q 0 22 -32 6 Z" fill="url(#tone40)" />
      {/* face */}
      <path d="M -104 -200 L -104 -110 Q -100 -60 -64 -30 L -10 2 Q 0 8 10 2 L 64 -30 Q 100 -60 104 -110 L 104 -200 Z" fill={W} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <clipPath id="faceClip">
        <path d="M -104 -200 L -104 -110 Q -100 -60 -64 -30 L -10 2 Q 0 8 10 2 L 64 -30 Q 100 -60 104 -110 L 104 -200 Z" />
      </clipPath>
      <g clipPath="url(#faceClip)">
        <path d="M 30 -210 Q 90 -150 110 -40 L 120 -40 L 120 -210 Z" fill="url(#tone20)" />
        <path d="M -110 -205 L 110 -205 L 110 -165 Q 0 -140 -110 -165 Z" fill="url(#tone40)" />
      </g>
      {/* ears */}
      {[-1, 1].map((s) => (
        <path key={s} d={`M ${s * 104} -130 Q ${s * 130} -140 ${s * 124} -100 Q ${s * 118} -76 ${s * 100} -84`} fill={W} stroke={INK} strokeWidth={6} />
      ))}
      {/* eyes */}
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${s * 48} -106)`}>
          {blink ? (
            <path d={`M ${-30 * s} -2 Q 0 6 ${30 * s} -6`} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
          ) : (
            <>
              <path d={`M ${-40 * s} 4 Q ${-6 * s} -30 ${42 * s} -12 Q ${6 * s} 26 ${-40 * s} 4 Z`} fill={W} />
              <clipPath id={`eye${s}`}>
                <path d={`M ${-40 * s} 4 Q ${-6 * s} -30 ${42 * s} -12 Q ${6 * s} 26 ${-40 * s} 4 Z`} />
              </clipPath>
              <g clipPath={`url(#eye${s})`}>
                <ellipse cx={look} cy={-2} rx={19} ry={23} fill={power > 0.5 ? RED : "url(#tone60)"} stroke={INK} strokeWidth={3} />
                <rect x={-40} y={-30} width={80} height={16} fill={INK} opacity={power > 0.5 ? 0.2 : 0.85} />
                {power > 0.5 ? (
                  <g transform={`translate(${look} -3) rotate(${t * 420})`}>
                    <circle r={10} fill="none" stroke={INK} strokeWidth={2.5} />
                    {[0, 120, 240].map((a) => (
                      <path key={a} transform={`rotate(${a}) translate(10 0)`} d="M 0 -4 Q 6 0 0 6 Q -3 0 0 -4 Z" fill={INK} />
                    ))}
                    <circle r={3} fill={INK} />
                  </g>
                ) : (
                  <ellipse cx={look} cy={-1} rx={6} ry={9} fill={INK} />
                )}
                <circle cx={look + 6} cy={-10} r={5} fill={W} />
                <circle cx={look - 5} cy={6} r={2.5} fill={W} />
              </g>
              {/* heavy upper lash line with flick */}
              <path d={`M ${-44 * s} 6 Q ${-8 * s} -34 ${46 * s} -14 L ${54 * s} -20`} stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
              <path d={`M ${-10 * s} 16 L ${16 * s} 10`} stroke={INK} strokeWidth={3} />
            </>
          )}
          {/* brow */}
          <path d={`M ${-40 * s} ${-36} L ${34 * s} ${-50} L ${36 * s} ${-42} L ${-38 * s} ${-28} Z`} fill={INK} />
        </g>
      ))}
      {power > 0 && [-1, 1].map((s) => <circle key={s} cx={s * 48} cy={-114} r={40 * power} fill={RED} opacity={0.18 * power} />)}
      {/* nose */}
      <path d="M 6 -92 L 14 -66 L 2 -64" stroke={INK} strokeWidth={4} fill="none" strokeLinejoin="round" />
      {/* mouth */}
      {mouth === "calm" && <path d="M -16 -40 L 16 -42" stroke={INK} strokeWidth={5} strokeLinecap="round" />}
      {mouth === "hurt" && <path d="M -18 -38 Q 0 -46 18 -38" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />}
      {mouth === "grin" && (
        <g>
          <path d="M -30 -48 Q 0 -14 30 -48 Z" fill={W} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -26 -46 L 26 -46" stroke={INK} strokeWidth={3} />
        </g>
      )}
      {mouth === "shout" && (
        <g>
          <path d="M -28 -54 Q 0 -2 28 -54 Z" fill={INK} />
          <path d="M -24 -52 L 24 -52 L 20 -44 L -20 -44 Z" fill={W} />
        </g>
      )}
      {sweat && <path d="M 92 -168 q 16 30 0 46 q -16 -16 0 -46 Z" fill={W} stroke={INK} strokeWidth={4} />}
      {/* headband */}
      <path d="M -112 -200 L 112 -200 L 114 -168 L -114 -168 Z" fill={INK} />
      <rect x={-56} y={-210} width={112} height={50} rx={8} fill={W} stroke={INK} strokeWidth={6} />
      <path d="M -46 -200 L -30 -200 M 34 -170 L 46 -170" stroke={INK} strokeWidth={3} />
      <circle cx={0} cy={-185} r={14} fill="none" stroke={INK} strokeWidth={6} />
      <g transform={`rotate(${Math.sin(t * 9) * 7} -112 -184)`}>
        <path d="M -112 -190 Q -170 -180 -220 -140 L -214 -128 Q -170 -164 -112 -174 Z" fill={INK} />
        <path d="M -112 -182 Q -160 -150 -186 -100 L -176 -96 Q -152 -142 -112 -168 Z" fill={INK} />
      </g>
      {/* front bangs over the band */}
      <path d="M -120 -200 L -112 -166 L -84 -198 L -72 -150 L -46 -200 L -22 -160 L 0 -206 L 24 -156 L 44 -202 L 70 -152 L 86 -200 L 112 -166 L 120 -200 L 110 -260 L -110 -260 Z" fill={INK} />
      <path d="M -76 -222 L -60 -170 M 8 -232 L 20 -176 M 70 -226 L 80 -184" stroke={W} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

export type Pose = "stand" | "run" | "jump" | "throw" | "fall" | "cast" | "kneel";
const POSES: Record<Pose, { lean: number; armL: number; armR: number; legL: number; legR: number }> = {
  stand: { lean: 0, armL: 14, armR: 14, legL: 8, legR: 8 },
  run: { lean: 24, armL: -70, armR: -70, legL: 46, legR: -36 },
  jump: { lean: -8, armL: 130, armR: 50, legL: 34, legR: -56 },
  throw: { lean: 12, armL: -24, armR: 115, legL: 34, legR: -24 },
  fall: { lean: -55, armL: 140, armR: 165, legL: 40, legR: 75 },
  cast: { lean: 0, armL: 85, armR: 85, legL: 22, legR: 22 },
  kneel: { lean: 12, armL: 20, armR: -10, legL: 80, legR: -10 },
};

/** Full-body Ren in ink. Origin = feet. ~700 units tall. */
export const InkNinja: React.FC<{ t: number; pose?: Pose; x?: number; y?: number; scale?: number; flip?: boolean; power?: number; mouth?: "calm" | "shout" | "grin" | "hurt"; run?: number; silhouette?: boolean }> = ({ t, pose = "stand", x = 0, y = 0, scale = 1, flip, power = 0, mouth = "calm", run = 0, silhouette }) => {
  const p = POSES[pose];
  const cyc = Math.sin(t * 22) * run;
  const fillW = silhouette ? INK : W;
  const wave = (k: number) => Math.sin(t * 10 - k * 0.8) * 26;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <g transform={`rotate(${p.lean} 0 -300)`}>
        <path d={`M -10 -455 C -130 ${-465 + wave(1)}, -250 ${-430 + wave(2)}, -380 ${-470 + wave(3)} L -368 ${-428 + wave(3)} C -240 ${-388 + wave(2)}, -130 ${-418 + wave(1)}, -10 -420 Z`} fill={silhouette ? INK : "url(#hatch)"} stroke={INK} strokeWidth={6} />
        {[
          { s: -1, a: p.legL + cyc * 38 },
          { s: 1, a: p.legR - cyc * 38 },
        ].map(({ s, a }) => (
          <g key={s} transform={`translate(${s * 28} -260) rotate(${a})`}>
            <path d="M -27 0 L 27 0 L 22 230 L -22 230 Z" fill={INK} />
            <path d="M 10 20 L 6 200" stroke={W} strokeWidth={3} opacity={silhouette ? 0 : 0.8} />
            <rect x={-22} y={196} width={44} height={34} fill={fillW} stroke={INK} strokeWidth={5} />
            <path d="M -22 206 L 22 214 M -22 218 L 22 226" stroke={INK} strokeWidth={3} />
            <path d="M -30 230 L 40 230 L 40 250 L -30 250 Z" fill={INK} />
          </g>
        ))}
        <path d="M -76 -455 L 76 -455 L 64 -258 L -64 -258 Z" fill={INK} />
        {!silhouette && <path d="M -50 -440 L -44 -280 M 56 -430 L 48 -300" stroke={W} strokeWidth={3} opacity={0.7} />}
        <path d="M -64 -310 L 64 -310 L 62 -280 L -62 -280 Z" fill={silhouette ? INK : "url(#tone40)"} stroke={INK} strokeWidth={5} />
        <circle cx={0} cy={-385} r={24} fill="none" stroke={silhouette ? INK : W} strokeWidth={7} />
        <path d="M -48 -488 L 48 -488 L 58 -446 L -58 -446 Z" fill={INK} stroke={silhouette ? INK : W} strokeWidth={2} />
        {[
          { s: -1, a: p.armL - cyc * 22 },
          { s: 1, a: p.armR + cyc * 22 },
        ].map(({ s, a }) => (
          <g key={s} transform={`translate(${s * 70} -436) rotate(${-s * a})`}>
            <path d="M -20 0 L 20 0 L 16 124 L -16 124 Z" fill={INK} />
            <rect x={-16} y={114} width={32} height={64} fill={fillW} stroke={INK} strokeWidth={5} />
            <path d="M -16 128 L 16 136 M -16 144 L 16 152 M -16 160 L 16 168" stroke={INK} strokeWidth={3} />
            <circle cx={0} cy={188} r={20} fill={fillW} stroke={INK} strokeWidth={5} />
          </g>
        ))}
        <g transform="translate(0 -486) scale(0.6)">{silhouette ? <path d="M -120 -200 L 120 -200 L 104 -110 Q 60 -20 0 6 Q -60 -20 -104 -110 Z M -120 -200 L -100 -330 L 100 -330 L 120 -200 Z" fill={INK} /> : <InkHead t={t} power={power} mouth={mouth} />}</g>
        {power > 0 &&
          new Array(12).fill(0).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const h = 140 + Math.abs(Math.sin(t * 14 + i)) * 140;
            return <path key={i} d={`M ${Math.cos(a) * 130} -250 Q ${Math.cos(a) * 170} ${-250 - h / 2} ${Math.cos(a) * 100} ${-250 - h * 2}`} stroke={RED} strokeWidth={10} fill="none" opacity={0.6 * power} strokeLinecap="round" />;
          })}
      </g>
    </g>
  );
};

/** Nine-tailed fox in ink with screentone; eyes in spot red. Origin = front paws. */
export const InkFox: React.FC<{ t: number; x?: number; y?: number; scale?: number; roar?: number; hurt?: number }> = ({ t, x = 0, y = 0, scale = 1, roar = 0, hurt = 0 }) => {
  const jaw = roar * 70;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {new Array(9).fill(0).map((_, i) => {
        const a = (-72 + i * 18) * (Math.PI / 180);
        const sway = Math.sin(t * 2.4 + i * 0.7) * 0.22;
        const L = 660;
        const ex = Math.sin(a + sway) * L;
        const ey = -Math.cos(a + sway) * L * 0.9 - 300;
        const c1x = Math.sin(a - sway) * L * 0.55;
        const c1y = -Math.cos(a - sway) * L * 0.55 - 300;
        const base = -170 + i * 42;
        return (
          <g key={i}>
            <path d={`M ${base * 0.3 - 70} -300 Q ${c1x - 60} ${c1y - 30} ${ex} ${ey} Q ${c1x + 150} ${c1y + 80} ${base * 0.3 + 70} -270 Z`} fill={i % 2 ? "url(#tone20)" : "#FFFFFF"} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
            <path d={`M ${c1x * 0.9} ${c1y + 10} Q ${(c1x + ex) / 2 + 20} ${(c1y + ey) / 2} ${ex * 0.95} ${ey + 20}`} stroke={INK} strokeWidth={4} fill="none" />
            <path d={`M ${ex} ${ey} q -60 70 -30 170 q 70 -60 100 -160 Z`} fill={INK} />
          </g>
        );
      })}
      <path d="M -310 0 Q -350 -310 -165 -430 Q 0 -515 165 -430 Q 350 -310 310 0 Z" fill="#FFFFFF" stroke={INK} strokeWidth={11} />
      <path d="M 60 -460 Q 300 -330 310 0 L 150 0 Q 200 -240 60 -460 Z" fill="url(#tone40)" />
      <path d="M -260 -100 L -200 -60 M -240 -200 L -170 -170 M 230 -240 L 170 -210" stroke={INK} strokeWidth={6} />
      {[-1, 1].map((s) => (
        <path key={s} d={`M ${s * 210} -40 L ${s * 290} 0 L ${s * 140} 0 Z`} fill={INK} />
      ))}
      <g transform={`translate(0 -540) rotate(${Math.sin(t * 1.5) * 4 + hurt * 20})`}>
        <path d="M -230 -40 L -260 -320 L -110 -170 Z" fill="#FFFFFF" stroke={INK} strokeWidth={11} strokeLinejoin="round" />
        <path d="M -230 -60 L -246 -280 L -150 -180 Z" fill="url(#tone60)" />
        <path d="M 230 -40 L 260 -320 L 110 -170 Z" fill="#FFFFFF" stroke={INK} strokeWidth={11} strokeLinejoin="round" />
        <path d="M 230 -60 L 246 -280 L 150 -180 Z" fill="url(#tone60)" />
        <path d="M -210 -60 Q -230 -210 0 -220 Q 230 -210 210 -60 Q 170 70 0 120 Q -170 70 -210 -60 Z" fill="#FFFFFF" stroke={INK} strokeWidth={11} />
        <path d="M 40 -215 Q 220 -200 210 -60 Q 170 70 40 110 Q 150 -20 40 -215 Z" fill="url(#tone20)" />
        <path d="M -160 -40 L -60 -64 M 160 -40 L 60 -64 M -150 -10 L -70 -20 M 150 -10 L 70 -20" stroke={INK} strokeWidth={12} strokeLinecap="round" />
        {[-1, 1].map((s) => (
          <g key={s}>
            <path d={`M ${s * 40} -116 L ${s * 160} -150 L ${s * 136} -82 Z`} fill={RED} stroke={INK} strokeWidth={7} />
            <ellipse cx={s * 110} cy={-118} rx={9} ry={24} fill={INK} />
            <path d={`M ${s * 30} -150 L ${s * 170} -186`} stroke={INK} strokeWidth={12} strokeLinecap="round" />
          </g>
        ))}
        <path d={`M -116 44 Q 0 ${76 + jaw} 116 44 Q 0 ${150 + jaw * 1.6} -116 44 Z`} fill={INK} />
        {[-84, -42, 0, 42, 84].map((k) => (
          <path key={k} d={`M ${k - 13} 50 L ${k} ${88 + jaw * 0.35} L ${k + 13} 50 Z`} fill="#FFFFFF" />
        ))}
        <ellipse cx={0} cy={-8} rx={24} ry={15} fill={INK} />
      </g>
    </g>
  );
};

export const InkChibiFox: React.FC<{ t: number; x: number; y: number; scale?: number }> = ({ t, x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y + Math.abs(Math.sin(t * 6)) * -14}) scale(${scale})`}>
    {new Array(9).fill(0).map((_, i) => (
      <ellipse key={i} cx={-40} cy={-60} rx={14} ry={50} fill={i % 2 ? "url(#tone20)" : "#FFFFFF"} stroke={INK} strokeWidth={4} transform={`rotate(${-60 + i * 15 + Math.sin(t * 8 + i) * 6} -40 -40)`} />
    ))}
    <ellipse cx={0} cy={-50} rx={70} ry={55} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
    <path d="M -55 -95 L -60 -150 L -20 -105 Z M 55 -95 L 60 -150 L 20 -105 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={-22} cy={-60} r={11} fill={INK} />
    <circle cx={22} cy={-60} r={11} fill={INK} />
    <circle cx={-18} cy={-65} r={4} fill="#FFFFFF" />
    <circle cx={26} cy={-65} r={4} fill="#FFFFFF" />
    <path d="M -10 -36 Q 0 -28 10 -36" stroke={INK} strokeWidth={4} fill="none" />
    <path d="M -54 -42 l 14 -4 M -54 -34 l 14 -4 M 40 -46 l 14 4 M 40 -38 l 14 4" stroke={RED} strokeWidth={3} />
  </g>
);

export const InkReporter: React.FC<{ t: number; x: number; y: number; scale?: number; talk?: boolean }> = ({ t, x, y, scale = 1, talk }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -170 0 Q -160 -180 0 -200 Q 160 -180 170 0 Z" fill="url(#tone20)" stroke={INK} strokeWidth={6} />
    <path d="M -130 -330 Q -150 -150 -100 -150 L 100 -150 Q 150 -150 130 -330 Z" fill={INK} />
    <path d="M -95 -360 L -95 -260 Q -90 -220 -50 -200 L 0 -185 L 50 -200 Q 90 -220 95 -260 L 95 -360 Z" fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    {[-1, 1].map((s) => (
      <g key={s} transform={`translate(${s * 42} -280)`}>
        <ellipse rx={22} ry={28} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
        <ellipse cy={3} rx={15} ry={22} fill="url(#tone60)" stroke={INK} strokeWidth={3} />
        <circle cx={5} cy={-8} r={6} fill="#FFFFFF" />
        <circle cx={-5} cy={10} r={3} fill="#FFFFFF" />
        <path d={`M ${-26 * s} -18 Q 0 -40 ${28 * s} -26 L ${36 * s} -32`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
        {[0, 1, 2].map((k) => <path key={k} d={`M ${(22 + k * 4) * s} ${-26 + k * 6} l ${10 * s} -6`} stroke={INK} strokeWidth={3} />)}
      </g>
    ))}
    <ellipse cx={0} cy={-224} rx={14} ry={talk ? 6 + Math.abs(Math.sin(t * 16)) * 10 : 4} fill={INK} />
    <path d="M -36 -240 l 10 -4 M 26 -244 l 10 4" stroke={RED} strokeWidth={3} />
    <path d="M -112 -330 Q -60 -430 40 -406 Q 124 -392 122 -320 Q 60 -372 -10 -352 Q -60 -340 -112 -330 Z" fill={INK} />
    <path d="M -60 -380 L -40 -350 M 30 -396 L 50 -366" stroke="#FFFFFF" strokeWidth={4} />
    <g transform="translate(150 -170) rotate(-30)">
      <rect x={-12} y={0} width={24} height={150} rx={8} fill={INK} />
      <circle cx={0} cy={-6} r={30} fill="url(#tone40)" stroke={INK} strokeWidth={5} />
      <rect x={-30} y={40} width={60} height={40} rx={6} fill={RED} stroke={INK} strokeWidth={4} />
      <text x={0} y={70} textAnchor="middle" fontFamily="Unbounded" fontWeight={900} fontSize={26} fill="#FFFFFF">O</text>
    </g>
  </g>
);
