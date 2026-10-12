import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BODY, COLORS, DISPLAY } from "../theme";
import { BACK, EASE_IN, EASE_OUT, Glitch, Photo, Ring, Slam, ip, photo } from "./fx";
import { SCENES, VO } from "./timeline";

const T0 = SCENES.why[0];
const L = (g: number) => g - T0;
const TQ = L(VO.s12);
const R = [L(VO.s13), L(VO.s14), L(VO.s15)];
const END = SCENES.why[1] - T0;

/** Whip-pan panel: slides in from the right, out to the left, with motion blur. */
const Panel: React.FC<{ t: number; from: number; to: number; children: React.ReactNode }> = ({ t, from, to, children }) => {
  const i = ip(t, [from - 0.1, from + 0.35], [1, 0], EASE_OUT);
  const o = ip(t, [to - 0.3, to + 0.05], [0, 1], EASE_IN);
  if (t < from - 0.1 || t > to + 0.05) return null;
  const v = Math.max(i, o);
  return <AbsoluteFill style={{ translate: `${i * 1100 - o * 1100}px 0px`, filter: `blur(${v * 26}px)` }}>{children}</AbsoluteFill>;
};

const Title: React.FC<{ t: number; at: number; n: string; title: string; sub: string }> = ({ t, at, n, title, sub }) => (
  <div style={{ position: "absolute", top: 330, left: 80, right: 80 }}>
    <div style={{ display: "flex", alignItems: "flex-end", gap: 26 }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 170, lineHeight: 0.85, color: "transparent", WebkitTextStroke: `4px ${COLORS.gold}`, scale: String(ip(t, [at, at + 0.35], [0.5, 1], BACK)) }}>{n}</div>
      <div style={{ paddingBottom: 6 }}>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 30, letterSpacing: 10, color: COLORS.goldSoft, opacity: ip(t, [at + 0.2, at + 0.4], [0, 1]) }}>{sub}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 70, lineHeight: 1.05, color: COLORS.white, clipPath: `inset(0 ${ip(t, [at + 0.15, at + 0.55], [100, 0], EASE_OUT)}% 0 0)` }}>{title}</div>
      </div>
    </div>
  </div>
);

const Center: React.FC<{ t: number }> = ({ t }) => {
  const a = R[0];
  const cx = 540;
  const cy = 1120;
  const ds = [
    { n: "Фирдавси", x: cx - 330, y: cy - 260 },
    { n: "И. Сомони", x: cx + 330, y: cy - 260 },
    { n: "Сино", x: cx - 330, y: cy + 260 },
    { n: "Шохмансур", x: cx + 330, y: cy + 260 },
  ];
  return (
    <>
      <Title t={t} at={a} n="01" title="САМЫЙ ЦЕНТР" sub="ДУШАНБЕ" />
      <Ring t={t} x={cx} y={cy} r={420} speed={8} dash="3 16" color={COLORS.sky} opacity={0.5} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2].map((k) => {
          const ph = (((t - a) / 1.4 + k / 3) % 1 + 1) % 1;
          return <circle key={k} cx={cx} cy={cy} r={60 + ph * 380} fill="none" stroke={COLORS.gold} strokeWidth={3} opacity={(1 - ph) * ip(t, [a + 0.3, a + 0.6], [0, 0.8])} />;
        })}
        {ds.map((d, i) => {
          const s = a + 0.5 + i * 0.12;
          const p = ip(t, [s, s + 0.5], [0, 1], EASE_OUT);
          return (
            <g key={d.n}>
              <line x1={d.x} y1={d.y} x2={d.x + (cx - d.x) * p} y2={d.y + (cy - d.y) * p} stroke={COLORS.white} strokeWidth={4} strokeDasharray="12 10" strokeDashoffset={-t * 60} />
              <circle cx={d.x} cy={d.y} r={20 * ip(t, [s - 0.1, s + 0.2], [0, 1], BACK)} fill={COLORS.sky} />
              <text x={d.x} y={d.y + (d.y < cy ? -40 : 64)} textAnchor="middle" fontFamily={BODY} fontWeight={800} fontSize={34} fill={COLORS.white} opacity={ip(t, [s, s + 0.3], [0, 1])}>
                {d.n}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={64 * ip(t, [a + 0.2, a + 0.5], [0, 1], BACK)} fill={COLORS.gold} />
        <text x={cx} y={cy + 22} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={64} fill={COLORS.ink} opacity={ip(t, [a + 0.4, a + 0.5], [0, 1])}>
          8
        </text>
      </svg>
      <div style={{ position: "absolute", top: 1560, width: "100%", textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 48, color: COLORS.white, opacity: ip(t, [a + 1.4, a + 1.7], [0, 1]) }}>
        одинаково близко <span style={{ color: COLORS.gold }}>из всех районов</span>
      </div>
    </>
  );
};

const LINES = [
  { name: "пр. Рудаки", color: "#ff7a3d", d: "M 540 520 L 540 1060", bus: [540, 520, 540, 1060] },
  { name: "пр. Сомони", color: "#3ccf91", d: "M 80 760 L 300 760 L 540 1060", bus: [80, 760, 540, 1060] },
  { name: "ул. Айни", color: "#5EA8FF", d: "M 1000 760 L 780 760 L 540 1060", bus: [1000, 760, 540, 1060] },
  { name: "ул. Борбад", color: "#c77dff", d: "M 80 1400 L 300 1400 L 540 1060", bus: [80, 1400, 540, 1060] },
  { name: "пр. Рудаки (юг)", color: "#ff7a3d", d: "M 540 1500 L 540 1060", bus: [540, 1500, 540, 1060] },
  { name: "Шохмансур", color: "#ffd978", d: "M 1000 1400 L 780 1400 L 540 1060", bus: [1000, 1400, 540, 1060] },
];

const Routes: React.FC<{ t: number }> = ({ t }) => {
  const a = R[1];
  return (
    <>
      <Title t={t} at={a} n="02" title="ВСЕ МАРШРУТЫ" sub="ГЛАВНЫЕ ДОРОГИ ГОРОДА" />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {LINES.map((l, i) => {
          const s = a + 0.3 + i * 0.1;
          const p = ip(t, [s, s + 0.7], [0, 1], EASE_OUT);
          return (
            <g key={i}>
              <path d={l.d} fill="none" stroke={l.color} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} opacity={0.95} />
              <path d={l.d} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="6 26" strokeDashoffset={-t * 90} opacity={p > 0.99 ? 0.8 : 0} />
            </g>
          );
        })}
        {LINES.map((l, i) => {
          const s = a + 1.2 + i * 0.15;
          if (t < s) return null;
          const ph = ((t - s) / 1.6) % 1;
          const pts = l.d.replace(/[ML]/g, "").trim().split(/\s+/).map(Number);
          const segs: [number, number][] = [];
          for (let k = 0; k < pts.length; k += 2) segs.push([pts[k], pts[k + 1]]);
          const lens = segs.slice(1).map((q, k) => Math.hypot(q[0] - segs[k][0], q[1] - segs[k][1]));
          let dist = ph * lens.reduce((x, y) => x + y, 0);
          let k = 0;
          while (k < lens.length - 1 && dist > lens[k]) dist -= lens[k++];
          const f = dist / lens[k];
          const x = segs[k][0] + (segs[k + 1][0] - segs[k][0]) * f;
          const y = segs[k][1] + (segs[k + 1][1] - segs[k][1]) * f;
          return (
            <g key={`b${i}`} transform={`translate(${x} ${y})`}>
              <rect x={-26} y={-18} width={52} height={36} rx={9} fill="#fff" stroke={l.color} strokeWidth={5} />
              <rect x={-18} y={-11} width={14} height={12} rx={2} fill={l.color} />
              <rect x={4} y={-11} width={14} height={12} rx={2} fill={l.color} />
            </g>
          );
        })}
        <circle cx={540} cy={1060} r={86 * ip(t, [a + 0.8, a + 1.1], [0, 1], BACK)} fill={COLORS.ink} stroke={COLORS.gold} strokeWidth={12} />
        <text x={540} y={1084} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={70} fill={COLORS.gold} opacity={ip(t, [a + 1, a + 1.1], [0, 1])}>
          8
        </text>
      </svg>
      {LINES.slice(0, 4).map((l, i) => {
        const pos = [
          { x: 560, y: 560, al: "left" },
          { x: 90, y: 700, al: "left" },
          { x: 990, y: 700, al: "right" },
          { x: 90, y: 1460, al: "left" },
        ][i];
        return (
          <div key={l.name} style={{ position: "absolute", top: pos.y, [pos.al === "left" ? "left" : "right"]: pos.al === "left" ? pos.x : 1080 - pos.x, fontFamily: BODY, fontWeight: 800, fontSize: 30, color: l.color, opacity: ip(t, [a + 0.8 + i * 0.1, a + 1.1 + i * 0.1], [0, 1]) }}>
            {l.name}
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 1560, width: "100%", textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 46, color: COLORS.white, opacity: ip(t, [a + 1.8, a + 2.1], [0, 1]) }}>
        все дороги ведут <span style={{ color: COLORS.gold }}>к нам</span>
      </div>
    </>
  );
};

const Crowd: React.FC<{ t: number }> = ({ t }) => {
  const a = R[2];
  const cols = 10;
  const rows = 4;
  return (
    <>
      <Title t={t} at={a} n="03" title="РЯДОМ АЛФЕМО" sub="ЖИВОЕ МЕСТО ГОРОДА" />
      <div style={{ position: "absolute", top: 600, left: 70, right: 70, height: 560, borderRadius: 40, overflow: "hidden", clipPath: `inset(${ip(t, [a + 0.2, a + 0.7], [50, 0], EASE_OUT)}% 0 ${ip(t, [a + 0.2, a + 0.7], [50, 0], EASE_OUT)}% 0 round 40px)`, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
        <Photo src={photo("video-banner.jpg")} t={t} from={a} to={a + 7} zoom={[1.05, 1.25]} pan={[0, 0, -40, 0]} tone={0.45} />
        <div style={{ position: "absolute", left: 30, bottom: 30, display: "flex", gap: 14 }}>
          <div style={{ padding: "12px 24px", borderRadius: 999, background: COLORS.gold, color: COLORS.ink, fontFamily: DISPLAY, fontWeight: 900, fontSize: 32, scale: String(ip(t, [a + 0.9, a + 1.2], [0, 1], BACK)) }}>OXFORD №8</div>
          <div style={{ padding: "12px 24px", borderRadius: 999, background: COLORS.white, color: COLORS.ink, fontFamily: DISPLAY, fontWeight: 900, fontSize: 32, scale: String(ip(t, [a + 1.1, a + 1.4], [0, 1], BACK)) }}>АЛФЕМО</div>
        </div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {new Array(cols * rows).fill(0).map((_, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          const s = a + 1.8 + (r * cols + c) * 0.035;
          const p = ip(t, [s, s + 0.25], [0, 1], BACK);
          const x = 120 + c * 93;
          const y = 1240 + r * 84;
          const gold = (i * 7) % 11 === 0;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${p})`} fill={gold ? COLORS.gold : COLORS.sky} opacity={gold ? 1 : 0.75}>
              <circle cy={-22} r={14} />
              <path d="M -22 30 Q -22 0 0 0 Q 22 0 22 30 Z" />
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", top: 1580, width: "100%", textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 46, color: COLORS.white, opacity: ip(t, [a + 3.2, a + 3.5], [0, 1]) }}>
        <span style={{ color: COLORS.gold }}>тысячи людей</span> каждый день
      </div>
    </>
  );
};

export const WhyV3: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const up = ip(t, [R[0] - 0.4, R[0]], [0, 1], EASE_OUT);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 60%, ${COLORS.navy}, ${COLORS.ink} 70%)` }} />
      {/* question, then it shrinks into a header */}
      <div style={{ position: "absolute", top: 760 - up * 640, width: "100%", scale: String(1 - up * 0.55), transformOrigin: "50% 0%", opacity: ip(t, [END - 0.4, END], [1, 0]) }}>
        <Glitch t={t} at={TQ + 0.55} amount={26}>
          <Slam t={t} words={[{ w: "ПОЧЕМУ", at: TQ }, { w: "ИМЕННО", at: TQ + 0.3 }, { w: "ЗДЕСЬ?", at: TQ + 0.55, color: COLORS.gold, size: 170 }]} />
        </Glitch>
      </div>
      {/* progress 01 / 02 / 03 */}
      <div style={{ position: "absolute", top: 1780, width: "100%", display: "flex", justifyContent: "center", gap: 20, opacity: up * ip(t, [END - 0.4, END], [1, 0]) }}>
        {R.map((r, i) => {
          const on = t >= r && (i === 2 || t < R[i + 1]);
          return <div key={i} style={{ width: on ? 80 : 26, height: 14, borderRadius: 7, background: on ? COLORS.gold : "rgba(255,255,255,0.3)" }} />;
        })}
      </div>
      <Panel t={t} from={R[0]} to={R[1]}>
        <Center t={t} />
      </Panel>
      <Panel t={t} from={R[1]} to={R[2]}>
        <Routes t={t} />
      </Panel>
      <Panel t={t} from={R[2]} to={END + 0.2}>
        <Crowd t={t} />
      </Panel>
    </AbsoluteFill>
  );
};
