import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AMIR, Kid, TEACHER, isBlink } from "./Characters";
import { Bubble, Sparkles, Stars, Tale, pop } from "./Kit";
import { BACK, C, EASE_IN_OUT, EASE_OUT, LOGO, STORY, ip } from "./theme";

const STEPS = 7;
const stepX = (i: number) => 90 + i * 115;
const stepTop = (i: number) => 1720 - (i + 1) * 135;

/** 5. The mountain has become stairs: Amir climbs to the top and the world talks back. */
export const Summit: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const climb = ip(t, [0.5, 4.0], [0, 1], EASE_IN_OUT);
  const pos = climb * (STEPS - 1);
  const i0 = Math.floor(pos);
  const fr = pos - i0;
  const ax = stepX(i0) + 80 + fr * 115;
  const ay = stepTop(i0) - Math.sin(fr * Math.PI) * 40 - (fr > 0.5 ? 135 * (fr - 0.5) * 2 : 0);
  const top = t > 4.0;
  const sun = ip(t, [0, 5], [900, 520], EASE_OUT);
  const globe = pop(t, 4.4, 0.6);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #5BA8FF 0%, #FFB37A 55%, #FF8A65 100%)`, overflow: "hidden" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <circle cx={540} cy={sun} r={170} fill="#FFE27A" />
        <circle cx={540} cy={sun} r={260} fill="#FFE27A" opacity={0.25} />
        {globe > 0 && (
          <g transform={`translate(540 560) scale(${globe})`}>
            <circle r={250} fill={C.sky} stroke={C.ink} strokeWidth={8} />
            <g transform={`translate(${((t * 60) % 500) - 250} 0)`}>
              {[-500, 0, 500].map((o) => (
                <path key={o} transform={`translate(${o} 0)`} d="M -160 -90 Q -100 -170 -20 -120 Q 30 -60 -40 -20 Q -120 10 -160 -90 Z M 40 40 Q 120 10 170 80 Q 120 170 60 130 Q 10 90 40 40 Z M -140 80 Q -100 60 -80 110 Q -110 160 -140 80 Z" fill={C.green} />
              ))}
            </g>
            <circle r={250} fill="none" stroke={C.ink} strokeWidth={8} />
            {[0, 1].map((k) => {
              const a = t * 1.6 + k * Math.PI;
              return (
                <g key={k} transform={`translate(${Math.cos(a) * 320} ${Math.sin(a) * 110}) rotate(${(a * 180) / Math.PI + 90})`}>
                  <path d="M 0 -26 L 8 -6 L 30 4 L 8 8 L 6 26 L 0 22 L -6 26 L -8 8 L -30 4 L -8 -6 Z" fill={C.white} stroke={C.ink} strokeWidth={3} />
                </g>
              );
            })}
          </g>
        )}
        {new Array(STEPS).fill(0).map((_, i) => (
          <g key={i}>
            <rect x={stepX(i)} y={stepTop(i)} width={190} height={1920} fill={["#6C5CE7", "#8E7CF0", "#5A4BD6", "#A29BFE"][i % 4]} stroke={C.ink} strokeWidth={6} />
            <text x={stepX(i) + 95} y={stepTop(i) + 60} textAnchor="middle" fontFamily={STORY} fontWeight={900} fontSize={34} fill={C.white}>
              {["A1", "A2", "B1", "B2", "C1", "C2", "★"][i]}
            </text>
          </g>
        ))}
        {top && (
          <g transform={`translate(${stepX(STEPS - 1) + 160} ${stepTop(STEPS - 1)})`}>
            <rect x={-5} y={-300 * pop(t, 4.1)} width={10} height={300 * pop(t, 4.1)} fill={C.ink} />
            <path d={`M 5 ${-300 * pop(t, 4.1)} Q 70 ${-300 * pop(t, 4.1) + Math.sin(t * 8) * 12} 150 ${-290 * pop(t, 4.1)} L 150 ${-200 * pop(t, 4.1)} Q 70 ${-210 * pop(t, 4.1) + Math.sin(t * 8 + 1) * 12} 5 ${-200 * pop(t, 4.1)} Z`} fill={C.gold} stroke={C.ink} strokeWidth={5} />
            <text x={78} y={-238 * pop(t, 4.1)} textAnchor="middle" fontFamily={LOGO} fontWeight={900} fontSize={24} fill={C.ink} opacity={pop(t, 4.3)}>
              OXFORD
            </text>
          </g>
        )}
        <Kid look={AMIR} mood={top ? "wow" : "happy"} x={top ? stepX(STEPS - 1) + 90 : ax} y={top ? stepTop(STEPS - 1) : ay} scale={0.62} walk={t * 10} walkAmp={top ? 0 : 1} arms={top ? [165, 165] : [6, 6]} blink={isBlink(f)} lookX={5} bob={top ? -Math.abs(Math.sin(t * 6)) * 30 : 0} />
        <Sparkles t={t} at={4.2} x={stepX(STEPS - 1) + 90} y={stepTop(STEPS - 1) - 200} n={22} spread={360} />
      </svg>
      <Bubble t={t} at={4.8} until={8.2} text="Hi, Amir!" x={70} y={420} tail="left" />
      <Bubble t={t} at={5.3} until={8.2} text="Welcome!" x={1010} y={330} tail="right" color="#D7FFE6" />
      <Bubble t={t} at={5.8} until={8.2} text="Great English!" x={110} y={900} tail="left" color="#FFE3F1" />
      <Tale t={t} at={0.4} until={3.9} text="Шаг за шагом — к вершине!" top={1700} accent={["вершине"]} />
      <Tale t={t} at={4.4} until={8.0} text="И весь мир заговорил с ним!" top={1700} accent={["мир"]} />
    </AbsoluteFill>
  );
};

/** 6. Call to action. */
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const pulse = 1 + Math.sin(t * 6) * 0.04 * ip(t, [4.2, 4.6], [0, 1]);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${C.dusk} 0%, ${C.night} 55%, ${C.deep} 100%)`, overflow: "hidden", alignItems: "center" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Stars t={t} n={70} h={1920} />
        {new Array(16).fill(0).map((_, i) => {
          const a = (i / 16) * Math.PI * 2 + t * 0.3;
          return <path key={i} d={`M 540 760 L ${540 + Math.cos(a - 0.06) * 1500} ${760 + Math.sin(a - 0.06) * 1500} L ${540 + Math.cos(a + 0.06) * 1500} ${760 + Math.sin(a + 0.06) * 1500} Z`} fill={C.gold} opacity={0.07} />;
        })}
        <Kid look={AMIR} mood="happy" x={260} y={1900} scale={0.8} arms={[8, 150 + Math.sin(t * 8) * 20]} blink={isBlink(f)} lookX={5} />
        <Kid look={TEACHER} mood="happy" x={830} y={1900} scale={0.88} arms={[150 + Math.sin(t * 8 + 1) * 20, 8]} blink={isBlink(f, 3)} lookX={-5} flip />
        <Sparkles t={t} at={4.2} x={540} y={1300} n={24} spread={480} />
      </svg>
      <div style={{ position: "absolute", top: 170, textAlign: "center", scale: String(pop(t, 0.3, 0.45)), rotate: `${(1 - pop(t, 0.3, 0.45)) * -6}deg` }}>
        <div style={{ display: "inline-block", background: C.paper, border: `6px solid ${C.ink}`, borderRadius: 40, padding: "22px 46px", fontFamily: STORY, fontWeight: 900, fontSize: 68, lineHeight: 1.1, color: C.ink, boxShadow: "0 14px 0 rgba(0,0,0,0.25)" }}>
          Твоя сказка
          <br />
          <span style={{ color: C.coral }}>начинается здесь</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: 560, display: "flex" }}>
        {"OXFORD".split("").map((ch, i) => {
          const p = ip(t, [1.3 + i * 0.07, 1.7 + i * 0.07], [0, 1], BACK);
          return (
            <span key={i} style={{ display: "inline-block", fontFamily: LOGO, fontWeight: 900, fontSize: 160, color: C.gold, WebkitTextStroke: `7px ${C.ink}`, paintOrder: "stroke", scale: String(p), translate: `0px ${(1 - p) * 160}px`, textShadow: `0 12px 0 ${C.ink}` }}>
              {ch}
            </span>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 790, fontFamily: STORY, fontWeight: 900, fontSize: 54, color: C.white, opacity: ip(t, [2.0, 2.3], [0, 1]) }}>учебный центр</div>
      <div style={{ position: "absolute", top: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div style={{ fontFamily: STORY, fontWeight: 900, fontSize: 50, color: C.ink, background: C.teal, border: `5px solid ${C.ink}`, borderRadius: 999, padding: "12px 36px", scale: String(pop(t, 2.6)) }}>8 филиалов в Душанбе</div>
        <div style={{ fontFamily: STORY, fontWeight: 900, fontSize: 42, color: C.ink, background: C.paper, border: `5px solid ${C.ink}`, borderRadius: 999, padding: "12px 32px", scale: String(pop(t, 3.0)), textAlign: "center" }}>
          новый — <b>Домпечать</b>, рядом с Алфемо
        </div>
      </div>
      <div style={{ position: "absolute", top: 1180, scale: String(pop(t, 3.9, 0.45) * pulse), fontFamily: STORY, fontWeight: 1000, fontSize: 60, color: C.ink, background: `linear-gradient(180deg, #FFE27A, ${C.gold})`, border: `6px solid ${C.ink}`, borderRadius: 999, padding: "24px 54px", boxShadow: "0 12px 0 rgba(0,0,0,0.35)", textAlign: "center", lineHeight: 1.1 }}>
        Запишись на
        <br />
        пробный урок!
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: ip(t, [7.6, 8.3], [0, 1], EASE_OUT) }} />
    </AbsoluteFill>
  );
};
