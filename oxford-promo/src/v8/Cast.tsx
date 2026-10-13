import React from "react";
import { LINE, limb, limbShade } from "../v7/RenHD";
import type { P } from "../v7/RenHD";

const FOX = "#F06A1E";
const FOX_S = "#B23F10";
const FOX_D = "#7A2408";
const FOX_H = "#FFB04A";
const CREAM = "#FFD9A0";
const CREAM_S = "#E8A866";
const MOUTH = "#3E0710";

const f1 = (n: number) => n.toFixed(1);

/** Jagged fur outline along an elliptical arc (angles in radians, y down). */
const furArc = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n: number, spike: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= n * 2; i++) {
    const a = a0 + ((a1 - a0) * i) / (n * 2);
    const k = i % 2 === 1 ? 1 + spike : 1;
    pts.push(`${f1(cx + Math.cos(a) * rx * k)} ${f1(cy + Math.sin(a) * ry * k)}`);
  }
  return pts;
};

/** A flame-shaped tail along a quadratic curve. */
const tailPath = (b: P, c: P, e: P, wMax: number, side = 0) => {
  const N = 16;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const x = (1 - u) * (1 - u) * b[0] + 2 * (1 - u) * u * c[0] + u * u * e[0];
    const y = (1 - u) * (1 - u) * b[1] + 2 * (1 - u) * u * c[1] + u * u * e[1];
    const dx = 2 * (1 - u) * (c[0] - b[0]) + 2 * u * (e[0] - c[0]);
    const dy = 2 * (1 - u) * (c[1] - b[1]) + 2 * u * (e[1] - c[1]);
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l;
    const ny = dx / l;
    const w = (wMax * Math.pow(Math.sin(Math.PI * (0.18 + 0.82 * u)), 0.8) * (1 - u * 0.25)) / 2;
    const wl = side === 1 ? w * 0.15 : w;
    const wr = side === -1 ? w * 0.15 : w;
    left.push(`${f1(x + nx * wl)} ${f1(y + ny * wl)}`);
    right.unshift(`${f1(x - nx * wr)} ${f1(y - ny * wr)}`);
  }
  return `M ${left.join(" L ")} L ${right.join(" L ")} Z`;
};

/**
 * The Nine-Tailed Fox — original design, cel-shaded bust.
 * Origin = bottom centre of the chest; ~1700 units tall including tails.
 */
export const FoxHD: React.FC<{ t: number; roar?: number; hurt?: number; glow?: number }> = ({ t, roar = 0, hurt = 0, glow = 1 }) => {
  const jaw = roar * 170;
  const tilt = Math.sin(t * 1.3) * 3 + hurt * Math.sin(t * 40) * 6;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* chakra flames */}
      {new Array(18).fill(0).map((_, i) => {
        const a = Math.PI + (i / 17) * Math.PI;
        const r = 760 + Math.sin(t * 8 + i * 1.9) * 60;
        const x = Math.cos(a) * r * 0.9;
        const y = -700 + Math.sin(a) * r;
        const h = 220 + Math.abs(Math.sin(t * 6 + i)) * 160;
        return <path key={i} d={`M ${x - 90} ${y + 60} Q ${x - 40} ${y - h * 0.5} ${x + Math.sin(t * 5 + i) * 40} ${y - h} Q ${x + 50} ${y - h * 0.4} ${x + 90} ${y + 60} Z`} fill={i % 2 ? "#FF5A1A" : "#FF9A2A"} opacity={0.22 * glow} />;
      })}

      {/* nine tails */}
      {new Array(9).fill(0).map((_, i) => {
        const a = ((-104 + i * 26) * Math.PI) / 180;
        const sway = Math.sin(t * 2.2 + i * 0.8) * 0.16;
        const L = 1450;
        const b: P = [Math.sin(a) * 60, -600];
        const e: P = [Math.sin(a + sway) * L, -600 - Math.cos(a + sway) * L * 0.95];
        const c: P = [Math.sin(a - sway * 2) * L * 0.45, -600 - Math.cos(a - sway * 2) * L * 0.75 - 200];
        return (
          <g key={i}>
            <path d={tailPath(b, c, e, 300)} fill={FOX} stroke={LINE} strokeWidth={9} />
            <path d={tailPath(b, c, e, 300, a >= 0 ? -1 : 1)} fill={FOX_S} opacity={0.85} />
            <path d={tailPath([b[0] * 0.2 + e[0] * 0.8, b[1] * 0.2 + e[1] * 0.8] as P, [c[0] * 0.1 + e[0] * 0.9, c[1] * 0.1 + e[1] * 0.9] as P, e, 150)} fill={FOX_H} />
          </g>
        );
      })}

      {/* body / shoulders with fur ruff */}
      <path d={`M -560 0 L ${furArc(0, 0, 560, 820, Math.PI, Math.PI * 2, 13, 0.08).join(" L ")} L 560 0 Z`} fill={FOX} stroke={LINE} strokeWidth={10} />
      <path d={`M 120 0 L ${furArc(0, 0, 560, 820, Math.PI * 1.62, Math.PI * 2, 5, 0.08).join(" L ")} L 560 0 Z`} fill={FOX_S} />
      <path d={`M -300 0 L ${furArc(0, -40, 300, 600, Math.PI, Math.PI * 2, 8, 0.12).join(" L ")} L 300 0 Z`} fill={CREAM} stroke={LINE} strokeWidth={7} />
      <path d={`M 60 0 L ${furArc(0, -40, 300, 600, Math.PI * 1.6, Math.PI * 2, 3, 0.12).join(" L ")} L 300 0 Z`} fill={CREAM_S} />
      {/* fur strokes */}
      {[-200, -100, 0, 100, 200].map((x, i) => (
        <path key={i} d={`M ${x} ${-300 - (i % 2) * 60} l ${-20 + i * 10} 70`} stroke={CREAM_S} strokeWidth={6} />
      ))}

      {/* forelegs + claws */}
      {[-1, 1].map((s) => {
        const a: P = [s * 380, -520];
        const b: P = [s * 420, -40];
        return (
          <g key={s}>
            <path d={limb(a, b, 230, 190, 24)} fill={FOX} stroke={LINE} strokeWidth={10} />
            <path d={limbShade(a, b, 230, 190, s > 0 ? -1 : 1, 0.3, 24)} fill={FOX_S} />
            <path d={`M ${s * 420 - 130} 0 Q ${s * 420 - 120} -110 ${s * 420} -110 Q ${s * 420 + 120} -110 ${s * 420 + 130} 0 Z`} fill={FOX} stroke={LINE} strokeWidth={10} />
            {[-90, -30, 30, 90].map((k) => (
              <path key={k} d={`M ${s * 420 + k - 18} -10 Q ${s * 420 + k} 50 ${s * 420 + k + 22} 40 Q ${s * 420 + k + 10} 20 ${s * 420 + k + 16} -10 Z`} fill="#1A0E10" stroke={LINE} strokeWidth={4} />
            ))}
          </g>
        );
      })}

      {/* ===== head ===== */}
      <g transform={`translate(0 -820) rotate(${tilt}) scale(1.75)`}>
        {/* ears */}
        {[-1, 1].map((s) => (
          <g key={s}>
            <path d={`M ${s * 120} -150 L ${s * 280} -440 Q ${s * 250} -260 ${s * 230} -110 Z`} fill={FOX} stroke={LINE} strokeWidth={6} />
            <path d={`M ${s * 150} -170 L ${s * 262} -380 Q ${s * 240} -250 ${s * 214} -140 Z`} fill={FOX_D} />
          </g>
        ))}
        {/* lower jaw + open mouth */}
        <path d={`M -150 80 Q -120 ${170 + jaw * 0.8} 0 ${200 + jaw} Q 120 ${170 + jaw * 0.8} 150 80 Z`} fill={FOX} stroke={LINE} strokeWidth={6} />
        <path d={`M -60 ${150 + jaw * 0.8} Q 0 ${200 + jaw} 60 ${150 + jaw * 0.8} Q 0 ${180 + jaw * 0.9} -60 ${150 + jaw * 0.8} Z`} fill={CREAM} />
        {roar > 0.05 && (
          <g>
            <path d={`M -120 96 Q -100 ${150 + jaw * 0.75} 0 ${176 + jaw * 0.92} Q 100 ${150 + jaw * 0.75} 120 96 Z`} fill={MOUTH} stroke={LINE} strokeWidth={5} />
            <path d={`M -60 ${130 + jaw * 0.7} Q 0 ${160 + jaw * 0.85} 60 ${130 + jaw * 0.7} Q 0 ${150 + jaw * 0.8} -60 ${130 + jaw * 0.7} Z`} fill="#B0303E" />
            {[-90, -50, 50, 90].map((k) => (
              <path key={k} d={`M ${k - 12} ${120 + jaw * 0.5 + Math.abs(k) * 0.2} L ${k} ${80 + jaw * 0.45} L ${k + 12} ${120 + jaw * 0.5 + Math.abs(k) * 0.2} Z`} fill="#FFFFFF" stroke={LINE} strokeWidth={3} />
            ))}
          </g>
        )}
        {/* skull with cheek fur */}
        <path
          d={`M -110 110 L -170 90 L -250 120 L -230 60 L -320 40 L -250 0 L -300 -60 L -220 -80 Q -220 -230 0 -250 Q 220 -230 220 -80 L 300 -60 L 250 0 L 320 40 L 230 60 L 250 120 L 170 90 L 110 110 Q 60 130 0 130 Q -60 130 -110 110 Z`}
          fill={FOX}
          stroke={LINE}
          strokeWidth={6}
        />
        <path d="M 60 -246 Q 220 -230 220 -80 L 300 -60 L 250 0 L 320 40 L 230 60 L 250 120 L 170 90 L 110 110 Q 150 40 120 -40 Q 100 -170 60 -246 Z" fill={FOX_S} />
        {/* forehead highlight */}
        <path d="M -40 -230 Q 0 -150 -10 -60 Q -60 -150 -40 -230 Z" fill={FOX_H} opacity={0.8} />
        {/* muzzle */}
        <path d="M -110 110 Q -90 0 -50 -40 L 50 -40 Q 90 0 110 110 Q 60 130 0 130 Q -60 130 -110 110 Z" fill={CREAM} stroke={LINE} strokeWidth={5} />
        <path d="M 50 -40 Q 90 0 110 110 Q 70 124 40 128 Q 70 40 50 -40 Z" fill={CREAM_S} />
        <path d="M -36 70 Q 0 56 36 70 Q 30 100 0 104 Q -30 100 -36 70 Z" fill="#1A0E10" stroke={LINE} strokeWidth={4} />
        <path d="M -20 70 Q -6 66 4 72" stroke="#6A5A60" strokeWidth={5} fill="none" />
        {/* markings */}
        {[-1, 1].map((s) => (
          <g key={s}>
            {[0, 1, 2].map((k) => (
              <path key={k} d={`M ${s * 130} ${10 + k * 30} L ${s * 230} ${-10 + k * 40}`} stroke="#1A0E10" strokeWidth={10 - k * 2} />
            ))}
            <path d={`M ${s * 160} -100 L ${s * 260} -170 L ${s * 190} -80 Z`} fill="#1A0E10" />
            <path d={`M ${s * 60} -20 L ${s * 80} 40 L ${s * 90} -26 Z`} fill="#1A0E10" />
          </g>
        ))}
        {/* eyes: amber, slit pupil, red glow */}
        {[-1, 1].map((s) => (
          <g key={s}>
            <circle cx={s * 100} cy={-62} r={70} fill="#FF2A1A" opacity={(0.18 + 0.1 * Math.sin(t * 7)) * glow} />
            <path d={`M ${s * 170} -104 Q ${s * 110} -96 ${s * 44} -40 Q ${s * 120} -26 ${s * 170} -104 Z`} fill="#FFD23A" stroke={LINE} strokeWidth={6} />
            <path d={`M ${s * 170} -104 Q ${s * 110} -96 ${s * 44} -40 Q ${s * 100} -64 ${s * 170} -104 Z`} fill="#FF7A12" />
            <ellipse cx={s * 104} cy={-62} rx={6} ry={hurt > 0 ? 6 : 26} fill="#1A0507" transform={`rotate(${s * -30} ${s * 104} -62)`} />
            <circle cx={s * 92} cy={-74} r={5} fill="#FFFFFF" />
            <path d={`M ${s * 186} -128 Q ${s * 110} -128 ${s * 30} -56`} stroke={LINE} strokeWidth={14} fill="none" />
          </g>
        ))}
      </g>
    </g>
  );
};

const RSKIN = "#FCE6D8";
const RSKIN_S = "#EDBBA6";
const RHAIR = "#6B3A22";
const RHAIR_S = "#45220F";
const RHAIR_H = "#B9774C";
const BLAZER = "#E0527E";
const BLAZER_S = "#A93158";

/** Reporter girl (original), bust. Origin = bottom centre, ~1000 units tall. */
export const ReporterHD: React.FC<{ t: number; talk?: boolean; excited?: boolean }> = ({ t, talk, excited }) => {
  const m = talk ? Math.abs(Math.sin(t * 17)) : 0;
  const bob = excited ? Math.abs(Math.sin(t * 9)) * -10 : 0;
  return (
    <g strokeLinejoin="round" strokeLinecap="round" transform={`translate(0 ${bob})`}>
      {/* back hair */}
      <path d="M -190 -560 Q -230 -760 -60 -820 Q 120 -860 210 -700 Q 240 -600 220 -470 L 160 -470 L 150 -560 L -150 -560 L -160 -470 L -220 -470 Q -230 -520 -190 -560 Z" fill={RHAIR_S} stroke={LINE} strokeWidth={5} />
      {/* shoulders / blazer */}
      <path d="M -330 0 Q -330 -260 -150 -300 L 150 -300 Q 330 -260 330 0 Z" fill={BLAZER} stroke={LINE} strokeWidth={6} />
      <path d="M 120 -300 Q 300 -260 330 0 L 180 0 Q 200 -180 120 -300 Z" fill={BLAZER_S} />
      <path d="M -90 -300 L 0 -120 L 90 -300 Z" fill="#FFFFFF" stroke={LINE} strokeWidth={5} />
      <path d="M -90 -300 L -150 -290 L -60 -60 L 0 -120 Z M 90 -300 L 150 -290 L 60 -60 L 0 -120 Z" fill={BLAZER} stroke={LINE} strokeWidth={5} />
      <path d="M -30 -260 L 0 -220 L 30 -260" stroke={LINE} strokeWidth={4} fill="none" />
      <path d="M -10 -226 L 0 -150 L 10 -226 Z" fill="#2B3A78" stroke={LINE} strokeWidth={3} />
      {/* neck */}
      <path d="M -40 -420 L -44 -300 Q 0 -280 44 -300 L 40 -420 Z" fill={RSKIN_S} stroke={LINE} strokeWidth={5} />
      {/* face */}
      <path d="M -150 -680 Q -158 -560 -120 -480 Q -70 -410 0 -394 Q 70 -410 120 -480 Q 158 -560 150 -680 Z" fill={RSKIN} stroke={LINE} strokeWidth={6} />
      <path d="M 90 -680 L 150 -680 Q 158 -560 120 -480 Q 80 -424 30 -400 Q 110 -480 110 -560 Z" fill={RSKIN_S} />
      {/* eyes: big, sparkly */}
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${s * 66} -556)`}>
          <ellipse cx={0} cy={0} rx={36} ry={44} fill="#FFFFFF" />
          <ellipse cx={s * -2} cy={4} rx={28} ry={38} fill="#6A3FB0" />
          <ellipse cx={s * -2} cy={-12} rx={28} ry={20} fill="#3A1C70" opacity={0.85} />
          <ellipse cx={s * -2} cy={16} rx={18} ry={12} fill="#B58CFF" opacity={0.8} />
          <ellipse cx={s * -2} cy={4} rx={11} ry={16} fill="#1A0B30" />
          <ellipse cx={-10} cy={-14} rx={10} ry={12} fill="#FFFFFF" />
          <circle cx={12} cy={18} r={5} fill="#FFFFFF" />
          <path d={`M ${44 * s} -14 Q ${10 * s} -60 ${-42 * s} -34 L ${-46 * s} -44`} stroke={LINE} strokeWidth={9} fill="none" />
          <path d={`M ${44 * s} -14 L ${58 * s} -20 M ${40 * s} -30 L ${54 * s} -42`} stroke={LINE} strokeWidth={4} />
          <path d={`M ${-26 * s} 42 Q 0 50 ${26 * s} 40`} stroke={LINE} strokeWidth={2.5} fill="none" />
          <path d={`M ${-30 * s} -70 Q 0 ${excited ? -94 : -84} ${32 * s} -72`} stroke={RHAIR_S} strokeWidth={6} fill="none" />
          <ellipse cx={s * 14} cy={62} rx={26} ry={10} fill="#FF7FA0" opacity={0.45} />
        </g>
      ))}
      <path d="M 4 -506 L 8 -492" stroke={RSKIN_S} strokeWidth={4} />
      {/* mouth */}
      {talk ? (
        <path d={`M -22 -454 Q 0 -460 22 -454 Q 18 ${-450 + 26 * m} 0 ${-446 + 30 * m} Q -18 ${-450 + 26 * m} -22 -454 Z`} fill="#8A1E30" stroke={LINE} strokeWidth={4} />
      ) : (
        <path d="M -18 -454 Q 0 -440 18 -454" stroke={LINE} strokeWidth={4} fill="none" />
      )}
      {/* front hair: bob with bangs */}
      <path
        d="M -170 -640 Q -190 -800 -20 -820 Q 170 -830 186 -640 L 196 -440 Q 170 -470 150 -460 L 144 -610 L 110 -580 L 96 -640 L 50 -592 L 30 -650 L -10 -598 L -40 -650 L -80 -590 L -110 -636 L -144 -600 L -150 -460 Q -170 -470 -196 -440 Z"
        fill={RHAIR}
        stroke={LINE}
        strokeWidth={6}
      />
      <path d="M 100 -800 Q 180 -760 186 -640 L 196 -440 Q 170 -470 150 -460 L 144 -610 L 110 -580 Q 140 -700 100 -800 Z" fill={RHAIR_S} />
      <path d="M -120 -740 Q -40 -790 60 -770 Q -20 -760 -110 -716 Z" fill={RHAIR_H} />
      {/* hair clip */}
      <path d="M -140 -690 L -100 -706 L -96 -690 L -136 -676 Z" fill="#FFD23A" stroke={LINE} strokeWidth={3} />
      {/* hand + microphone */}
      <g transform={`translate(230 -170) rotate(${-24 + Math.sin(t * 4) * 3})`}>
        <rect x={-14} y={-10} width={28} height={190} rx={10} fill="#22222A" stroke={LINE} strokeWidth={4} />
        <rect x={-46} y={30} width={92} height={70} rx={10} fill="#FFD23A" stroke={LINE} strokeWidth={5} />
        <text x={0} y={78} textAnchor="middle" fontFamily="Unbounded, sans-serif" fontWeight={900} fontSize={30} fill={LINE}>
          8
        </text>
        <circle cx={0} cy={-44} r={44} fill="#7E879A" stroke={LINE} strokeWidth={5} />
        <path d="M -30 -60 Q 0 -80 30 -60 M -40 -40 L 40 -40 M -34 -22 L 34 -22" stroke="#4E5566" strokeWidth={4} fill="none" />
        <circle cx={-14} cy={-60} r={8} fill="#FFFFFF" opacity={0.6} />
        <path d="M -40 110 Q -50 150 -10 160 L 40 156 Q 60 130 40 104 Z" fill={RSKIN} stroke={LINE} strokeWidth={5} />
        <path d="M -40 110 Q -10 100 30 106" stroke={RSKIN_S} strokeWidth={4} fill="none" />
      </g>
    </g>
  );
};

/** The fox after the seal: tiny and harmless (chibi), cel-shaded. */
export const ChibiFoxHD: React.FC<{ t: number; hop?: boolean }> = ({ t, hop = true }) => {
  const y = hop ? -Math.abs(Math.sin(t * 6)) * 30 : 0;
  return (
    <g strokeLinejoin="round" strokeLinecap="round" transform={`translate(0 ${y})`}>
      <ellipse cx={0} cy={-y + 4} rx={90} ry={14} fill="#000" opacity={0.15} />
      {new Array(9).fill(0).map((_, i) => (
        <g key={i} transform={`rotate(${-70 + i * 17.5 + Math.sin(t * 8 + i) * 6} 0 -60)`}>
          <path d="M -18 -60 Q -40 -160 0 -220 Q 40 -160 18 -60 Z" fill={FOX} stroke={LINE} strokeWidth={5} />
          <path d="M -10 -170 Q 0 -210 0 -220 Q 30 -170 14 -150 Z" fill={FOX_H} />
        </g>
      ))}
      <path d="M -80 0 Q -100 -90 -60 -110 L 60 -110 Q 100 -90 80 0 Z" fill={FOX} stroke={LINE} strokeWidth={6} />
      <path d="M -40 0 Q -40 -60 0 -70 Q 40 -60 40 0 Z" fill={CREAM} stroke={LINE} strokeWidth={4} />
      <g transform="translate(0 -170)">
        <path d="M -70 -50 L -100 -150 L -20 -80 Z M 70 -50 L 100 -150 L 20 -80 Z" fill={FOX} stroke={LINE} strokeWidth={6} />
        <path d="M -76 -66 L -92 -126 L -40 -80 Z M 76 -66 L 92 -126 L 40 -80 Z" fill={FOX_D} />
        <ellipse cx={0} cy={0} rx={110} ry={90} fill={FOX} stroke={LINE} strokeWidth={6} />
        <path d="M 60 -70 Q 110 -40 108 10 Q 90 60 40 84 Q 90 20 60 -70 Z" fill={FOX_S} />
        <path d="M -60 40 Q 0 -10 60 40 Q 40 86 0 90 Q -40 86 -60 40 Z" fill={CREAM} />
        {[-1, 1].map((s) => (
          <g key={s}>
            <ellipse cx={s * 40} cy={-6} rx={18} ry={24} fill="#1A0E10" />
            <circle cx={s * 40 - 6} cy={-14} r={7} fill="#FFFFFF" />
            <circle cx={s * 40 + 6} cy={4} r={3} fill="#FFFFFF" />
            <ellipse cx={s * 70} cy={26} rx={16} ry={9} fill="#FF7FA0" opacity={0.6} />
          </g>
        ))}
        <path d="M -8 30 L 8 30 L 0 38 Z" fill="#1A0E10" />
        <path d="M -16 46 Q -8 54 0 46 Q 8 54 16 46" stroke={LINE} strokeWidth={4} fill="none" />
      </g>
    </g>
  );
};
