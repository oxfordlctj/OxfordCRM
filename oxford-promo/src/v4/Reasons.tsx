import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { AMIR, KIDS, Kid, TEACHER, isBlink } from "./Characters";
import { Bubble, Sparkles, pop } from "./Kit";
import { T } from "./timeline";
import { C, EASE_IN_OUT, EASE_OUT, STORY, ip } from "./theme";

const R = T.R.map((r) => r - T.reasons[0]);
const FLOOR = 1620;

const REASONS = [
  { title: "Опытные учителя", sub: "объясняют просто и с душой", icon: "key" },
  { title: "Говоришь с первого урока", sub: "живой английский, а не зубрёжка", icon: "talk" },
  { title: "Маленькие группы", sub: "внимание каждому ученику", icon: "group" },
  { title: "Игры и разговорные клубы", sub: "учиться интересно!", icon: "star" },
  { title: "8 филиалов в Душанбе", sub: "новый — на Домпечати, рядом с Алфемо", icon: "pin" },
] as const;
const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

const Icon: React.FC<{ kind: string; size?: number }> = ({ kind, size = 120 }) => (
  <svg width={size} height={size} viewBox="-60 -60 120 120" style={{ overflow: "visible" }}>
    <circle r={56} fill={C.gold} stroke={C.ink} strokeWidth={6} />
    {kind === "key" && (
      <g fill={C.ink}>
        <circle cx={-14} cy={0} r={18} />
        <circle cx={-14} cy={0} r={7} fill={C.gold} />
        <rect x={0} y={-5} width={34} height={10} rx={3} />
        <rect x={24} y={5} width={8} height={12} />
      </g>
    )}
    {kind === "talk" && <path d="M -32 -22 H 32 Q 40 -22 40 -14 V 12 Q 40 20 32 20 H -6 L -22 34 V 20 H -32 Q -40 20 -40 12 V -14 Q -40 -22 -32 -22 Z" fill={C.ink} />}
    {kind === "group" && (
      <g fill={C.ink}>
        <circle cx={-22} cy={-12} r={11} />
        <circle cx={22} cy={-12} r={11} />
        <circle cx={0} cy={-18} r={13} />
        <path d="M -40 30 Q -40 4 -22 4 Q -4 4 -4 30 Z M 4 30 Q 4 4 22 4 Q 40 4 40 30 Z M -16 30 Q -16 -2 0 -2 Q 16 -2 16 30 Z" />
      </g>
    )}
    {kind === "star" && <path d="M 0 -38 L 11 -12 L 38 -10 L 17 8 L 24 36 L 0 21 L -24 36 L -17 8 L -38 -10 L -11 -12 Z" fill={C.ink} />}
    {kind === "pin" && (
      <g>
        <path d="M 0 38 C -6 26 -28 10 -28 -8 A 28 28 0 1 1 28 -8 C 28 10 6 26 0 38 Z" fill={C.ink} />
        <text y={2} textAnchor="middle" fontFamily={STORY} fontWeight={900} fontSize={28} fill={C.gold}>
          8
        </text>
      </g>
    )}
  </svg>
);

const PINS = [
  [250, 560], [380, 470], [520, 610], [650, 500], [780, 580], [330, 690], [700, 700],
] as const;

export const Reasons: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const idx = Math.max(0, Math.min(4, R.filter((r) => t >= r - 0.2).length - 1));
  const local = t - R[idx];
  const level = R.filter((r) => t >= r + 3.9).length;

  const teacherX = ip(t, [R[0], R[0] + 1.0], [1250, 790], EASE_OUT) + ip(t, [R[2] - 0.2, R[2] + 0.6], [0, 140], EASE_IN_OUT);
  const teacherWalking = (t > R[0] && t < R[0] + 1.0) || (t > R[2] - 0.2 && t < R[2] + 0.6);
  const amirX = 400;
  const party = idx === 3 ? Math.abs(Math.sin(local * 7)) * -40 * ip(local, [0.2, 0.5], [0, 1]) : 0;
  const keyP = ip(t, [R[0] + 1.4, R[0] + 2.1], [0, 1], EASE_IN_OUT);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #FFE7C2 0%, #FFD7A8 70%, #F7C38A 100%)`, overflow: "hidden" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {/* window */}
        <rect x={60} y={900} width={240} height={300} rx={18} fill={C.sky} stroke="#C98A4B" strokeWidth={14} />
        <circle cx={130} cy={980} r={40} fill="#FFE27A" />
        <line x1={180} y1={900} x2={180} y2={1200} stroke="#C98A4B" strokeWidth={10} />
        {/* posters */}
        <rect x={830} y={920} width={180} height={230} rx={12} fill={C.white} stroke={C.ink} strokeWidth={5} />
        <text x={920} y={1010} textAnchor="middle" fontFamily={STORY} fontWeight={900} fontSize={60} fill={C.coral}>
          ABC
        </text>
        <text x={920} y={1090} textAnchor="middle" fontFamily={STORY} fontWeight={900} fontSize={34} fill={C.teal}>
          hello!
        </text>
        {/* floor */}
        <rect x={0} y={FLOOR - 20} width={1080} height={420} fill="#C98A4B" />
        {new Array(8).fill(0).map((_, i) => (
          <line key={i} x1={i * 150} y1={FLOOR - 20} x2={i * 150 - 80} y2={1920} stroke="#B07438" strokeWidth={6} />
        ))}
        {/* board */}
        <rect x={70} y={330} width={940} height={500} rx={24} fill="#8B5A2B" />
        <rect x={95} y={355} width={890} height={450} rx={14} fill="#2F5D50" />
        {idx === 4 && (
          <g opacity={ip(local, [0.2, 0.6], [0, 1])}>
            <path d="M 160 600 Q 300 420 540 450 Q 820 470 900 620 Q 820 780 540 770 Q 260 780 160 600 Z" fill="#3E7A68" stroke="#CFE8DE" strokeWidth={4} strokeDasharray="10 10" />
            <path d="M 470 420 Q 450 600 500 790" stroke={C.sky} strokeWidth={8} fill="none" />
            {PINS.map(([x, y], i) => {
              const p = pop(local, 0.6 + i * 0.12);
              return (
                <g key={i} transform={`translate(${x} ${y}) scale(${p})`}>
                  <path d="M 0 0 C -4 -10 -20 -20 -20 -34 A 20 20 0 1 1 20 -34 C 20 -20 4 -10 0 0 Z" fill={C.sky} stroke={C.ink} strokeWidth={4} />
                  <text y={-27} textAnchor="middle" fontFamily={STORY} fontWeight={900} fontSize={20} fill={C.ink}>
                    {i + 1}
                  </text>
                </g>
              );
            })}
            {(() => {
              const p = pop(local, 1.6, 0.5);
              return (
                <g transform={`translate(560 640) scale(${p * 1.6})`}>
                  <circle r={34 + Math.sin(local * 6) * 4} fill={C.gold} opacity={0.35} />
                  <path d="M 0 0 C -4 -10 -20 -20 -20 -34 A 20 20 0 1 1 20 -34 C 20 -20 4 -10 0 0 Z" fill={C.gold} stroke={C.ink} strokeWidth={4} />
                  <text y={-27} textAnchor="middle" fontFamily={STORY} fontWeight={900} fontSize={20} fill={C.ink}>
                    8
                  </text>
                </g>
              );
            })()}
          </g>
        )}

        {/* kids (from reason 3) */}
        {KIDS.map((k, i) => {
          const xs = [130, 250, 610, 720];
          const p = pop(t, R[2] + 0.3 + i * 0.12, 0.45);
          if (p <= 0) return null;
          const wave = idx === 2 ? 150 + Math.sin(t * 10 + i) * 25 : 20;
          return (
            <g key={i} transform={`translate(0 ${(1 - p) * 400})`}>
              <Kid look={k} mood="happy" x={xs[i]} y={FLOOR - 60} scale={0.72} arms={[wave, 10]} blink={isBlink(f, i + 2)} bob={party * (i % 2 ? 1 : 0.7)} flip={i >= 2} />
            </g>
          );
        })}
        <Kid look={TEACHER} mood={idx === 1 && local > 2.4 ? "wow" : "happy"} x={teacherX} y={FLOOR} scale={1.08} walk={t * 9} walkAmp={teacherWalking ? 1 : 0} arms={idx === 0 && local > 1.0 && local < 2.2 ? [10, 70] : [6, 6]} blink={isBlink(f, 5)} lookX={-6} flip talk={idx === 1 && local > 2.4 && local < 3.6 ? Math.abs(Math.sin(t * 14)) : 0} bob={party} />
        <Kid look={AMIR} mood={idx === 1 && local > 0.4 && local < 3 ? "talk" : idx === 3 ? "wow" : "happy"} x={amirX} y={FLOOR} scale={1} arms={idx === 4 ? [8, 150] : idx === 0 && keyP >= 1 ? [8, 70] : idx === 3 ? [150, 150] : [6, 6]} blink={isBlink(f)} lookX={6} talk={idx === 1 && local > 0.4 && local < 3 ? Math.abs(Math.sin(t * 14)) : 0} bob={party} />

        {/* golden key handed over */}
        {idx === 0 && local > 1.2 && (
          <g transform={`translate(${720 - keyP * 230} ${1380 - Math.sin(keyP * Math.PI) * 160}) rotate(${keyP * 360})`}>
            <circle r={40} fill={C.gold} opacity={0.35} />
            <circle cx={-14} cy={0} r={16} fill="none" stroke={C.gold} strokeWidth={9} />
            <rect x={0} y={-5} width={40} height={10} rx={3} fill={C.gold} />
            <rect x={28} y={4} width={8} height={14} fill={C.gold} />
          </g>
        )}
        {idx === 0 && <Sparkles t={t} at={R[0] + 2.1} x={490} y={1380} n={14} spread={200} />}
        {idx === 3 &&
          new Array(60).fill(0).map((_, i) => {
            const age = local - 0.2 - random(`cd${i}`) * 0.5;
            if (age < 0) return null;
            const x = random(`cx${i}`) * 1080 + Math.sin(age * 3 + i) * 40;
            const y = -40 + age * (300 + random(`cv${i}`) * 300);
            return <rect key={i} x={x} y={y} width={18} height={10} fill={[C.coral, C.teal, C.gold, C.green, "#9B5DE5"][i % 5]} transform={`rotate(${age * 400 + i * 40} ${x} ${y})`} />;
          })}
      </svg>

      {/* board text */}
      {idx < 4 && (
        <div key={idx} style={{ position: "absolute", top: 400, left: 120, right: 120, height: 380, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, textAlign: "center" }}>
          <div style={{ fontFamily: STORY, fontWeight: 900, fontSize: 40, color: C.gold, opacity: ip(local, [0, 0.2], [0, 1]) }}>секрет №{idx + 1}</div>
          <div style={{ fontFamily: STORY, fontWeight: 900, fontSize: REASONS[idx].title.length > 18 ? 70 : 84, lineHeight: 1.05, color: C.white, clipPath: `inset(0 ${ip(local, [0.15, 0.8], [100, 0])}% 0 0)` }}>{REASONS[idx].title}</div>
          <div style={{ fontFamily: STORY, fontWeight: 800, fontSize: 42, color: "#CFE8DE", opacity: ip(local, [0.8, 1.1], [0, 1]) }}>{REASONS[idx].sub}</div>
        </div>
      )}
      {idx === 4 && (
        <div style={{ position: "absolute", top: 860, left: 60, right: 60, textAlign: "center" }}>
          <div style={{ display: "inline-block", fontFamily: STORY, fontWeight: 900, fontSize: 62, color: C.ink, background: C.paper, border: `5px solid ${C.ink}`, borderRadius: 30, padding: "14px 34px", scale: String(pop(local, 0.2)) }}>
            {REASONS[4].title}
          </div>
          <div style={{ marginTop: 18, display: "inline-block", fontFamily: STORY, fontWeight: 900, fontSize: 42, color: C.ink, background: C.paper, border: `4px solid ${C.ink}`, borderRadius: 24, padding: "8px 22px", opacity: ip(local, [1.7, 2.0], [0, 1]) }}>
            новый — на <span style={{ background: C.gold, padding: "2px 14px", borderRadius: 12 }}>Домпечати</span>, рядом с Алфемо
          </div>
        </div>
      )}

      {/* level meter */}
      <div style={{ position: "absolute", top: 120, left: 70, right: 70 }}>
        <div style={{ fontFamily: STORY, fontWeight: 900, fontSize: 36, color: C.ink, marginBottom: 10 }}>Уровень английского Амира</div>
        <div style={{ display: "flex", gap: 12 }}>
          {LEVELS.map((l, i) => {
            const on = i < level;
            const justOn = on && t < R[i] + 4.3;
            return (
              <div key={l} style={{ flex: 1, height: 70, borderRadius: 18, border: `5px solid ${C.ink}`, background: on ? C.green : "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: STORY, fontWeight: 900, fontSize: 36, color: on ? C.white : "#B9A27C", scale: String(justOn ? 1 + 0.15 * Math.sin((t - R[i] - 3.9) * 12) * Math.max(0, 1 - (t - R[i] - 3.9) * 2) : 1) }}>
                {l}
              </div>
            );
          })}
        </div>
      </div>

      {/* power-up badge flying to the meter */}
      {R.map((r, i) => {
        const fly = ip(t, [r + 3.2, r + 3.9], [0, 1], EASE_IN_OUT);
        const show = pop(t, r + 1.0) * (fly < 1 ? 1 : 0);
        if (show <= 0) return null;
        const slotX = 70 + (i + 0.5) * ((1080 - 140 - 48) / 5) + i * 12;
        const x = 900 + (slotX - 900) * fly;
        const y = 1080 + (190 - 1080) * fly - Math.sin(fly * Math.PI) * 200;
        return (
          <div key={i} style={{ position: "absolute", left: x - 60, top: y - 60, scale: String(show * (1 - fly * 0.5)), rotate: `${fly * 360}deg` }}>
            <Icon kind={REASONS[i].icon} />
          </div>
        );
      })}

      <Bubble t={t} at={R[0] + 0.9} until={R[0] + 2.8} text="Let's start!" x={980} y={1170} tail="right" />
      <Bubble t={t} at={R[1] + 0.4} until={R[1] + 3.0} text="Hello! My name is Amir!" x={150} y={1180} tail="left" size={42} />
      <Bubble t={t} at={R[1] + 2.4} until={R[1] + 4.3} text="Excellent!" x={1010} y={1120} tail="right" color="#D7FFE6" />
      <Bubble t={t} at={R[3] + 0.6} until={R[3] + 3.6} text="Speaking club!" x={560} y={1290} tail="left" color="#FFE3F1" />
      <AbsoluteFill style={{ background: "#FFF6D8", opacity: ip(t, [0, 0.5], [1, 0]) }} />
    </AbsoluteFill>
  );
};
