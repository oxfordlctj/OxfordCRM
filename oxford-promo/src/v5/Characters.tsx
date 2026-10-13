import React from "react";
import { A } from "./theme";

/** Anime head. Origin = chin. `power` 0..1 turns the Eye of Knowledge on. */
export const Head: React.FC<{ t: number; power?: number; mouth?: "calm" | "shout" | "smile" | "grin"; look?: number; blink?: boolean; angry?: boolean }> = ({ t, power = 0, mouth = "calm", look = 0, blink, angry = true }) => {
  const iris = power > 0.5 ? A.red : "#2A2F55";
  return (
    <g>
      {/* back hair */}
      <path d="M -120 -150 L -150 -60 L -110 -90 L -125 -10 L -80 -60 L 80 -60 L 125 -10 L 110 -90 L 150 -60 L 120 -150 Z" fill={A.ink} />
      {/* face */}
      <path d="M -88 -170 L -90 -80 Q -86 -40 -50 -18 L 0 6 L 50 -18 Q 86 -40 90 -80 L 88 -170 Z" fill={A.skin} stroke={A.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 40 -150 L 88 -150 L 90 -80 Q 86 -40 50 -18 L 30 -8 Q 70 -60 40 -150 Z" fill="#E7BBA4" />
      {/* eyes */}
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${s * 42} -98)`}>
          {blink ? (
            <path d={`M -26 0 L 26 0`} stroke={A.ink} strokeWidth={7} strokeLinecap="round" />
          ) : (
            <>
              <path d={`M ${-30 * s} 6 Q 0 -26 ${30 * s} -6 Q 0 18 ${-30 * s} 6 Z`} fill={A.white} stroke={A.ink} strokeWidth={6} strokeLinejoin="round" />
              <circle cx={look} cy={-2} r={13} fill={iris} />
              {power > 0.5 && (
                <g transform={`translate(${look} -2) rotate(${t * 360})`}>
                  <circle r={8} fill="none" stroke={A.gold} strokeWidth={2.5} />
                  {[0, 120, 240].map((a) => (
                    <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 8} cy={Math.sin((a * Math.PI) / 180) * 8} r={2.6} fill={A.ink} />
                  ))}
                </g>
              )}
              <circle cx={look} cy={-2} r={power > 0.5 ? 2.5 : 6} fill={A.ink} />
              <circle cx={look + 5} cy={-8} r={3.5} fill={A.white} />
            </>
          )}
          <path d={`M ${-34 * s} ${angry ? -24 : -32} L ${30 * s} ${angry ? -36 : -30}`} stroke={A.ink} strokeWidth={9} strokeLinecap="round" />
        </g>
      ))}
      {/* power glow */}
      {power > 0 && [-1, 1].map((s) => <circle key={s} cx={s * 42} cy={-100} r={30 * power} fill={A.red} opacity={0.25 * power} />)}
      {/* nose + mouth */}
      <path d="M 4 -70 L 10 -54" stroke={A.ink} strokeWidth={4} strokeLinecap="round" />
      {mouth === "calm" && <path d="M -14 -34 L 14 -34" stroke={A.ink} strokeWidth={5} strokeLinecap="round" />}
      {mouth === "smile" && <path d="M -20 -38 Q 0 -24 20 -38" stroke={A.ink} strokeWidth={5} fill="none" strokeLinecap="round" />}
      {mouth === "grin" && <path d="M -26 -40 Q 0 -10 26 -40 Z" fill={A.white} stroke={A.ink} strokeWidth={5} strokeLinejoin="round" />}
      {mouth === "shout" && <path d="M -22 -44 Q 0 -6 22 -44 Z" fill="#6E1020" stroke={A.ink} strokeWidth={5} strokeLinejoin="round" />}
      {/* headband with the Oxford plate */}
      <path d="M -96 -150 L 96 -150 L 98 -122 L -98 -122 Z" fill={A.navy} stroke={A.ink} strokeWidth={5} />
      <rect x={-46} y={-156} width={92} height={40} rx={6} fill="#C9D3E3" stroke={A.ink} strokeWidth={5} />
      <circle cx={0} cy={-136} r={12} fill="none" stroke={A.ink} strokeWidth={5} />
      <path d="M -96 -140 Q -150 -130 -190 -100 M -96 -132 Q -140 -110 -170 -70" stroke={A.navy} strokeWidth={10} fill="none" strokeLinecap="round" transform={`rotate(${Math.sin(t * 9) * 6} -96 -136)`} />
      {/* spiky fringe */}
      <path d="M -110 -150 L -100 -230 L -70 -190 L -60 -260 L -20 -200 L 0 -280 L 30 -205 L 60 -255 L 70 -190 L 104 -225 L 110 -150 Z" fill={A.ink} />
      <path d="M -60 -200 L -40 -240 M 20 -215 L 40 -245" stroke="#3D4E8A" strokeWidth={6} strokeLinecap="round" />
    </g>
  );
};

export type Pose = "stand" | "run" | "jump" | "throw" | "fall" | "cast" | "thumbs";

const POSES: Record<Pose, { lean: number; armL: number; armR: number; legL: number; legR: number }> = {
  stand: { lean: 0, armL: 12, armR: 12, legL: 6, legR: 6 },
  run: { lean: 22, armL: -60, armR: -60, legL: 40, legR: -30 },
  jump: { lean: -8, armL: 120, armR: 40, legL: 30, legR: -50 },
  throw: { lean: 10, armL: -20, armR: 110, legL: 30, legR: -20 },
  fall: { lean: -50, armL: 140, armR: 160, legL: 40, legR: 70 },
  cast: { lean: 0, armL: 80, armR: 80, legL: 18, legR: 18 },
  thumbs: { lean: 0, armL: 12, armR: 70, legL: 8, legR: 8 },
};

/** Full-body ninja. Origin = between the feet, ~640 units tall. */
export const Ninja: React.FC<{ t: number; pose?: Pose; x?: number; y?: number; scale?: number; flip?: boolean; power?: number; mouth?: "calm" | "shout" | "smile" | "grin"; run?: number }> = ({ t, pose = "stand", x = 0, y = 0, scale = 1, flip, power = 0, mouth = "calm", run = 0 }) => {
  const p = POSES[pose];
  const cyc = Math.sin(t * 22) * run;
  const legL = p.legL + cyc * 35;
  const legR = p.legR - cyc * 35;
  const scarfWave = (k: number) => Math.sin(t * 10 - k * 0.8) * 22;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <g transform={`rotate(${p.lean} 0 -300)`}>
        {/* scarf */}
        <path d={`M -10 -440 C -120 ${-450 + scarfWave(1)}, -230 ${-420 + scarfWave(2)}, -340 ${-460 + scarfWave(3)} L -330 ${-420 + scarfWave(3)} C -220 ${-380 + scarfWave(2)}, -120 ${-410 + scarfWave(1)}, -10 -410 Z`} fill={A.blood} stroke={A.ink} strokeWidth={5} />
        {/* legs */}
        {[
          { s: -1, a: legL },
          { s: 1, a: legR },
        ].map(({ s, a }) => (
          <g key={s} transform={`translate(${s * 26} -250) rotate(${s * a * (s < 0 ? -1 : 1)})`}>
            <path d="M -24 0 L 24 0 L 20 220 L -20 220 Z" fill={A.navy} stroke={A.ink} strokeWidth={5} />
            <rect x={-20} y={190} width={40} height={30} fill="#E8E2D8" stroke={A.ink} strokeWidth={4} />
            <path d="M -26 220 L 36 220 L 36 240 L -26 240 Z" fill="#3A2C22" stroke={A.ink} strokeWidth={4} />
          </g>
        ))}
        {/* torso */}
        <path d="M -70 -440 L 70 -440 L 60 -250 L -60 -250 Z" fill="#232A4D" stroke={A.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -60 -300 L 60 -300 L 58 -270 L -58 -270 Z" fill={A.blood} stroke={A.ink} strokeWidth={4} />
        <circle cx={0} cy={-375} r={24} fill="none" stroke={A.gold} strokeWidth={8} />
        <path d="M -44 -470 L 44 -470 L 54 -430 L -54 -430 Z" fill="#1A1F3A" stroke={A.ink} strokeWidth={5} />
        {/* arms */}
        {[
          { s: -1, a: p.armL - cyc * 20 },
          { s: 1, a: p.armR + cyc * 20 },
        ].map(({ s, a }) => (
          <g key={s} transform={`translate(${s * 66} -420) rotate(${-s * a})`}>
            <path d="M -18 0 L 18 0 L 15 120 L -15 120 Z" fill="#232A4D" stroke={A.ink} strokeWidth={5} />
            <rect x={-15} y={110} width={30} height={60} fill="#E8E2D8" stroke={A.ink} strokeWidth={4} />
            <circle cx={0} cy={180} r={18} fill={A.skin} stroke={A.ink} strokeWidth={4} />
            {pose === "thumbs" && s === 1 && <rect x={-6} y={150} width={12} height={26} rx={6} fill={A.skin} stroke={A.ink} strokeWidth={3} transform="rotate(180 0 170)" />}
          </g>
        ))}
        <g transform="translate(0 -470) scale(0.62)">
          <Head t={t} power={power} mouth={mouth} />
        </g>
        {power > 0 && (
          <g opacity={power}>
            {new Array(10).fill(0).map((_, i) => {
              const a = (i / 10) * Math.PI * 2;
              const h = 120 + Math.abs(Math.sin(t * 14 + i)) * 120;
              return <path key={i} d={`M ${Math.cos(a) * 120} -250 Q ${Math.cos(a) * 150} ${-250 - h / 2} ${Math.cos(a) * 90} ${-250 - h * 2}`} stroke={A.red} strokeWidth={14} fill="none" opacity={0.35} strokeLinecap="round" />;
            })}
          </g>
        )}
      </g>
    </g>
  );
};

/** The giant nine-tailed fox of the legends. Origin = between the front paws. */
export const Fox: React.FC<{ t: number; x?: number; y?: number; scale?: number; roar?: number; hurt?: number }> = ({ t, x = 0, y = 0, scale = 1, roar = 0, hurt = 0 }) => {
  const jaw = roar * 60;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* chakra aura */}
      {new Array(14).fill(0).map((_, i) => {
        const a = -Math.PI + (i / 13) * Math.PI;
        const r = 520 + Math.sin(t * 9 + i * 1.3) * 40;
        return <circle key={i} cx={Math.cos(a) * r} cy={-420 + Math.sin(a) * r * 0.8} r={90 + Math.sin(t * 7 + i) * 20} fill={A.orange} opacity={0.12} />;
      })}
      {/* nine tails */}
      {new Array(9).fill(0).map((_, i) => {
        const base = -160 + i * 40;
        const a = (-70 + i * 17.5) * (Math.PI / 180);
        const sway = Math.sin(t * 2.4 + i * 0.7) * 0.25;
        const L = 620;
        const ex = Math.sin(a + sway) * L;
        const ey = -Math.cos(a + sway) * L * 0.9 - 300;
        const cx1 = Math.sin(a - sway) * L * 0.5;
        const cy1 = -Math.cos(a - sway) * L * 0.5 - 300;
        return (
          <g key={i}>
            <path d={`M ${base * 0.3 - 40} -300 Q ${cx1} ${cy1} ${ex} ${ey} Q ${cx1 + 60} ${cy1 + 30} ${base * 0.3 + 40} -280 Z`} fill={A.orange} stroke={A.ink} strokeWidth={8} strokeLinejoin="round" />
            <path d={`M ${ex} ${ey} q ${-30} 60 ${-10} 120 q 40 -40 60 -110 Z`} fill={A.flame} opacity={0.9} />
          </g>
        );
      })}
      {/* body */}
      <path d="M -300 0 Q -340 -300 -160 -420 Q 0 -500 160 -420 Q 340 -300 300 0 Z" fill={A.orange} stroke={A.ink} strokeWidth={10} />
      <path d="M -140 0 Q -120 -200 0 -260 Q 120 -200 140 0 Z" fill={A.flame} opacity={0.6} />
      {/* paws */}
      {[-1, 1].map((s) => (
        <path key={s} d={`M ${s * 200} -40 L ${s * 280} 0 L ${s * 130} 0 Z`} fill={A.ink} />
      ))}
      {/* head */}
      <g transform={`translate(0 -520) rotate(${Math.sin(t * 1.5) * 4 + hurt * 20})`}>
        <path d="M -220 -40 L -250 -300 L -110 -160 Z" fill={A.orange} stroke={A.ink} strokeWidth={10} strokeLinejoin="round" />
        <path d="M 220 -40 L 250 -300 L 110 -160 Z" fill={A.orange} stroke={A.ink} strokeWidth={10} strokeLinejoin="round" />
        <path d="M -200 -60 Q -220 -200 0 -210 Q 220 -200 200 -60 Q 160 60 0 110 Q -160 60 -200 -60 Z" fill={A.orange} stroke={A.ink} strokeWidth={10} />
        {/* markings */}
        <path d="M -150 -40 L -60 -60 M 150 -40 L 60 -60" stroke={A.ink} strokeWidth={12} strokeLinecap="round" />
        {[-1, 1].map((s) => (
          <g key={s}>
            <path d={`M ${s * 40} -110 L ${s * 150} -140 L ${s * 130} -80 Z`} fill={A.flame} stroke={A.ink} strokeWidth={6} />
            <ellipse cx={s * 105} cy={-112} rx={10} ry={22} fill={A.blood} />
            <circle cx={s * 105} cy={-112} r={46} fill={A.red} opacity={0.18 + 0.12 * Math.sin(t * 6)} />
          </g>
        ))}
        {/* jaw */}
        <path d={`M -110 40 Q 0 ${70 + jaw} 110 40 Q 0 ${140 + jaw * 1.6} -110 40 Z`} fill="#4A0710" stroke={A.ink} strokeWidth={8} />
        {[-80, -40, 0, 40, 80].map((k) => (
          <path key={k} d={`M ${k - 12} 46 L ${k} ${80 + jaw * 0.3} L ${k + 12} 46 Z`} fill={A.white} />
        ))}
        <ellipse cx={0} cy={-6} rx={22} ry={14} fill={A.ink} />
      </g>
    </g>
  );
};

/** The fox after the seal: tiny and harmless. */
export const ChibiFox: React.FC<{ t: number; x: number; y: number; scale?: number }> = ({ t, x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y + Math.abs(Math.sin(t * 6)) * -14}) scale(${scale})`}>
    {new Array(9).fill(0).map((_, i) => (
      <ellipse key={i} cx={-40 + Math.cos((i / 8) * Math.PI) * -10} cy={-60} rx={14} ry={50} fill={A.orange} stroke={A.ink} strokeWidth={4} transform={`rotate(${-60 + i * 15 + Math.sin(t * 8 + i) * 6} -40 -40)`} />
    ))}
    <ellipse cx={0} cy={-50} rx={70} ry={55} fill={A.orange} stroke={A.ink} strokeWidth={5} />
    <path d="M -55 -95 L -60 -150 L -20 -105 Z M 55 -95 L 60 -150 L 20 -105 Z" fill={A.orange} stroke={A.ink} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={-22} cy={-60} r={10} fill={A.ink} />
    <circle cx={22} cy={-60} r={10} fill={A.ink} />
    <circle cx={-19} cy={-64} r={3.5} fill={A.white} />
    <circle cx={25} cy={-64} r={3.5} fill={A.white} />
    <path d="M -10 -36 Q 0 -28 10 -36" stroke={A.ink} strokeWidth={4} fill="none" />
    <circle cx={-44} cy={-40} r={9} fill="#FF8FA3" opacity={0.6} />
    <circle cx={44} cy={-40} r={9} fill="#FF8FA3" opacity={0.6} />
  </g>
);

/** Reporter girl, bust. Origin = bottom centre. */
export const Reporter: React.FC<{ t: number; x: number; y: number; scale?: number; talk?: boolean }> = ({ t, x, y, scale = 1, talk }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -170 0 Q -160 -180 0 -200 Q 160 -180 170 0 Z" fill="#E94F7A" stroke={A.ink} strokeWidth={6} />
    <path d="M -130 -330 Q -150 -150 -100 -150 L 100 -150 Q 150 -150 130 -330 Z" fill="#7A3B1E" stroke={A.ink} strokeWidth={6} />
    <path d="M -95 -360 L -95 -260 Q -90 -220 -50 -200 L 0 -185 L 50 -200 Q 90 -220 95 -260 L 95 -360 Z" fill={A.skin} stroke={A.ink} strokeWidth={6} />
    {[-1, 1].map((s) => (
      <g key={s}>
        <ellipse cx={s * 42} cy={-280} rx={22} ry={28} fill={A.white} stroke={A.ink} strokeWidth={5} />
        <circle cx={s * 42} cy={-278} r={15} fill="#5B3A9E" />
        <circle cx={s * 42 + 5} cy={-286} r={5} fill={A.white} />
      </g>
    ))}
    <ellipse cx={0} cy={-228} rx={14} ry={talk ? 6 + Math.abs(Math.sin(t * 16)) * 10 : 4} fill="#7A1E2E" />
    <path d="M -110 -330 Q -60 -420 40 -400 Q 120 -390 120 -320 Q 60 -370 -10 -350 Q -60 -340 -110 -330 Z" fill="#7A3B1E" stroke={A.ink} strokeWidth={6} />
    {/* microphone */}
    <g transform="translate(150 -170) rotate(-30)">
      <rect x={-12} y={0} width={24} height={150} rx={8} fill={A.ink} />
      <circle cx={0} cy={-6} r={30} fill="#9AA3B5" stroke={A.ink} strokeWidth={5} />
      <rect x={-30} y={40} width={60} height={40} rx={6} fill={A.gold} stroke={A.ink} strokeWidth={4} />
    </g>
  </g>
);
