import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { S, VO } from "../v5/timeline";
import { InkChibiFox, InkFox, InkNinja, InkReporter, InkHead } from "./InkCast";
import { BACK, Balloon, Caption, EASE_OUT, INK, InkLines, PAPER, Panel, Paper, RED, Sfx, ToneDefs, ip } from "./Ink";
import { Attack, Battle, ColdOpen, Hero, Opening } from "./Pages";
import { DISPLAY, JP, SUB } from "../v5/theme";

const useT = () => useCurrentFrame() / 30;
const L = (k: keyof typeof VO, scene: keyof typeof S) => VO[k] - S[scene][0];
const shake = (t: number, hits: number[], amp = 26, dur = 0.45) => {
  let a = 0;
  for (const h of hits) if (t >= h && t < h + dur) a = Math.max(a, amp * (1 - (t - h) / dur));
  return `${Math.sin(t * 97) * a}px ${Math.cos(t * 83) * a}px`;
};
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <ToneDefs />
    {children}
  </svg>
);

/** Ring of English words used for the Seal of Light. */
const SealRing: React.FC<{ t: number; x: number; y: number; r: number; p: number }> = ({ t, x, y, r, p }) => {
  if (p <= 0) return null;
  const words = "LIGHT · COURAGE · KNOWLEDGE · SEAL · ENGLISH · POWER · ";
  return (
    <g opacity={p} transform={`rotate(${t * 40} ${x} ${y})`}>
      <defs>
        <path id={`sr${r}`} d={`M ${x - r * 0.83} ${y} a ${r * 0.83} ${r * 0.83} 0 1 1 ${r * 1.66} 0 a ${r * 0.83} ${r * 0.83} 0 1 1 ${-r * 1.66} 0`} />
      </defs>
      <circle cx={x} cy={y} r={r * p} fill="none" stroke={RED} strokeWidth={12} />
      <circle cx={x} cy={y} r={r * 0.68 * p} fill="none" stroke={INK} strokeWidth={7} />
      <text fontFamily={SUB} fontWeight={900} fontSize={r * 0.1} fill={INK} letterSpacing={4}>
        <textPath href={`#sr${r}`}>{words + words}</textPath>
      </text>
      {new Array(6).fill(0).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return <line key={i} x1={x + Math.cos(a) * r * 0.68 * p} y1={y + Math.sin(a) * r * 0.68 * p} x2={x + Math.cos(a + 2.1) * r * 0.68 * p} y2={y + Math.sin(a + 2.1) * r * 0.68 * p} stroke={RED} strokeWidth={6} />;
      })}
    </g>
  );
};

/** 5. Scroll → the Eye awakens → casting */
export const Awaken: React.FC = () => {
  const t = useT();
  const eyeOn = L("r5", "awaken") + 0.4;
  const cast = L("r6", "awaken");
  return (
    <AbsoluteFill style={{ translate: shake(t, [eyeOn], 30, 0.6), filter: t >= eyeOn && t < eyeOn + 0.1 ? "invert(1)" : "none" }}>
      <Paper t={t} />
      {t < eyeOn - 0.4 && (
        <Panel t={t} at={0} r={{ x: 30, y: 30, w: 1020, h: 1860 }} bg="#FFFFFF">
          {(l) => (
            <Svg>
              <rect width={1080} height={1920} fill="url(#tone20)" />
              <rect x={150} y={960 - 640 * ip(l, [0.2, 1.2], [0, 1], EASE_OUT)} width={780} height={1280 * ip(l, [0.2, 1.2], [0, 1], EASE_OUT)} fill="#FFFFFF" stroke={INK} strokeWidth={10} />
              <g opacity={ip(l, [1.1, 1.6], [0, 1])}>
                <text x={540} y={560} textAnchor="middle" fontFamily={JP} fontWeight={900} fontSize={140} fill={RED}>
                  封印
                </text>
                {["SEAL OF LIGHT", "To stop the beast,", "speak these words:", "“Seal of Light,", "activate!”"].map((s, i) => (
                  <text key={i} x={540} y={720 + i * 100} textAnchor="middle" fontFamily={SUB} fontWeight={1000} fontSize={i === 0 ? 84 : 64} fill={INK}>
                    {s}
                  </text>
                ))}
                <circle cx={540} cy={1330} r={60} fill="none" stroke={RED} strokeWidth={10} />
                <text x={540} y={1356} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={60} fill={RED}>
                  O
                </text>
              </g>
            </Svg>
          )}
        </Panel>
      )}
      {t >= eyeOn - 0.4 && t < cast && (
        <AbsoluteFill style={{ background: "#FFFFFF" }}>
          <InkLines t={t} inner={460} color={t > eyeOn ? INK : "#888"} />
          <Svg>
            <g transform="translate(540 960)">
              <path d="M -500 50 Q 0 -360 500 -40 Q 0 320 -500 50 Z" fill="#FFFFFF" stroke={INK} strokeWidth={20} />
              <clipPath id="bigEye">
                <path d="M -500 50 Q 0 -360 500 -40 Q 0 320 -500 50 Z" />
              </clipPath>
              <g clipPath="url(#bigEye)">
                <circle r={230} fill={t > eyeOn ? RED : "url(#tone60)"} stroke={INK} strokeWidth={10} />
                <rect x={-520} y={-300} width={1040} height={150} fill={INK} opacity={0.85} />
                {t > eyeOn && (
                  <g transform={`rotate(${(t - eyeOn) * 500})`}>
                    <circle r={150} fill="none" stroke={INK} strokeWidth={10} />
                    {[0, 120, 240].map((a) => (
                      <g key={a} transform={`rotate(${a}) translate(150 0)`}>
                        <circle r={32} fill={INK} />
                        <path d="M 0 -32 Q 44 -10 22 34" stroke={INK} strokeWidth={14} fill="none" />
                      </g>
                    ))}
                  </g>
                )}
                <circle r={t > eyeOn ? 44 : 110} fill={INK} />
                <circle cx={70} cy={-80} r={40} fill="#FFFFFF" />
                <circle cx={-60} cy={70} r={16} fill="#FFFFFF" />
              </g>
              <path d="M -520 -50 Q 0 -440 540 -130" stroke={INK} strokeWidth={40} fill="none" strokeLinecap="round" />
            </g>
          </Svg>
          <div style={{ position: "absolute", left: 950, top: 180, writingMode: "vertical-rl", fontFamily: JP, fontWeight: 900, fontSize: 170, color: RED, WebkitTextStroke: `8px ${INK}`, paintOrder: "stroke", opacity: t > eyeOn ? 1 : 0 }}>知眼</div>
          <Sfx t={t} at={eyeOn} until={cast} text="ДОН!!" x={360} y={1500} size={220} rot={-10} />
        </AbsoluteFill>
      )}
      {t >= cast && (
        <Panel t={t} at={cast} r={{ x: 30, y: 30, w: 1020, h: 1860 }} bg="#FFFFFF">
          {(l) => (
            <>
              <InkLines t={t} x={540} y={900} inner={300} color={RED} n={60} />
              <Svg>
                <SealRing t={t} x={540} y={1580} r={430} p={ip(l, [0, 0.8], [0, 1], EASE_OUT)} />
                <InkNinja t={t} pose="cast" x={540} y={1580} scale={1.45} power={1} mouth="shout" />
              </Svg>
            </>
          )}
        </Panel>
      )}
      <Caption t={t} at={L("n4", "awaken") - 0.1} until={eyeOn - 0.4} text="Только Око Знаний может прочесть древнюю печать." x={60} y={110} w={900} dark />
      <Balloon t={t} at={L("r5", "awaken") - 0.05} until={cast} text="Око Знаний… пробудись!" x={540} y={260} w={600} size={58} shout tail={[0, 120]} />
      <Balloon t={t} at={cast - 0.05} until={8.2} text="Печать Света… активация!" x={540} y={250} w={640} size={58} shout tail={[0, 120]} />
    </AbsoluteFill>
  );
};

/** 6. Seal of Light */
export const Final: React.FC = () => {
  const t = useT();
  const boom = 3.2;
  const beam = ip(t, [2.0, 2.4], [0, 1], EASE_OUT);
  const after = t > 4.4;
  return (
    <AbsoluteFill style={{ translate: shake(t, [1.0, boom], 44, 0.8), filter: t >= boom && t < boom + 0.12 ? "invert(1)" : "none" }}>
      <Paper t={t} />
      {!after && (
        <Panel t={t} at={0} r={{ x: 30, y: 30, w: 1020, h: 1860 }} bg="#FFFFFF">
          {() => (
            <>
              <Svg>
                <rect width={1080} height={1920} fill="url(#tone40)" />
                <SealRing t={t} x={540} y={1100} r={520} p={ip(t, [0.6, 1.8], [0, 1], EASE_OUT)} />
                <InkFox t={t} x={540} y={1460} scale={0.8} roar={1} hurt={beam * Math.sin(t * 30) * 0.3} />
                {beam > 0 && (
                  <>
                    <rect x={540 - 280 * beam} y={0} width={560 * beam} height={1500} fill="#FFFFFF" stroke={INK} strokeWidth={10} />
                    {new Array(8).fill(0).map((_, i) => (
                      <line key={i} x1={540 - 230 * beam + i * 66 * beam} y1={0} x2={540 - 230 * beam + i * 66 * beam} y2={1500} stroke={INK} strokeWidth={3} opacity={0.4} />
                    ))}
                  </>
                )}
                <rect x={0} y={1640} width={1080} height={300} fill="#FFFFFF" />
                <InkNinja t={t} pose="cast" power={1} x={220} y={1880} scale={0.5} mouth="shout" />
              </Svg>
              {t > boom && (
                <AbsoluteFill style={{ background: "#FFFFFF", opacity: ip(t, [boom, boom + 0.3], [0, 1]) }}>
                  <InkLines t={t} inner={80} n={120} />
                </AbsoluteFill>
              )}
            </>
          )}
        </Panel>
      )}
      {after && (
        <Panel t={t} at={4.4} r={{ x: 30, y: 30, w: 1020, h: 1860 }} bg="#FFFFFF">
          {() => (
            <Svg>
              <path d="M 0 1500 Q 540 1440 1080 1500 L 1080 1920 L 0 1920 Z" fill="url(#tone20)" stroke={INK} strokeWidth={8} />
              {new Array(8).fill(0).map((_, i) => (
                <ellipse key={i} cx={150 + i * 120} cy={1320 + (i % 2) * 60} rx={130 * ip(t, [4.4, 6.5], [1, 0.3])} ry={80 * ip(t, [4.4, 6.5], [1, 0.3])} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
              ))}
              <InkChibiFox t={t} x={540} y={1530} scale={1.7} />
              <text x={680} y={1140} fontFamily={DISPLAY} fontWeight={900} fontSize={140} fill={INK} opacity={ip(t, [5.3, 5.5], [0, 1])}>
                ?
              </text>
            </Svg>
          )}
        </Panel>
      )}
      <Balloon t={t} at={L("r7", "final") - 0.05} until={2.6} text="Это конец!" x={540} y={240} w={440} size={66} shout tail={[-120, 100]} />
      <div style={{ position: "absolute", left: 950, top: 160, writingMode: "vertical-rl", fontFamily: JP, fontWeight: 900, fontSize: 180, color: RED, WebkitTextStroke: `8px ${INK}`, paintOrder: "stroke", opacity: t > 2.2 && t < boom ? 1 : 0 }}>封印</div>
      <Sfx t={t} at={boom} until={4.4} text="ГО-О-ОН!!" x={540} y={960} size={180} rot={-8} />
      <Sfx t={t} at={4.6} until={7.2} text="пуф…" x={300} y={1100} size={90} rot={-6} />
    </AbsoluteFill>
  );
};

/** 7. Interview */
export const Interview: React.FC = () => {
  const t = useT();
  const q = L("q1", "interview");
  const ans = L("r8", "interview");
  const glint = ip(t, [ans + 0.5, ans + 0.7, ans + 0.9], [0, 1, 0]);
  return (
    <AbsoluteFill>
      <Paper t={t} />
      <Panel t={t} at={0} r={{ x: 30, y: 30, w: 1020, h: 860 }} bg="#FFFFFF">
        {() => (
          <Svg>
            <rect width={1080} height={900} fill="url(#tone20)" opacity={0.6} />
            <InkReporter t={t} x={330} y={900} scale={1.35} talk={t > q && t < q + 1.4} />
          </Svg>
        )}
      </Panel>
      <Panel t={t} at={ans - 0.3} r={{ x: 30, y: 910, w: 1020, h: 980, skew: 40 }} bg="#FFFFFF">
        {() => (
          <>
            <InkLines t={t} x={600} y={1350} inner={330} color={RED} n={60} />
            <Svg>
              <g transform="translate(600 1890)">
                <path d="M -240 0 Q -230 -230 0 -260 Q 230 -230 240 0 Z" fill={INK} />
                <circle cx={0} cy={-150} r={34} fill="none" stroke="#FFFFFF" strokeWidth={8} />
                <g transform="translate(0 -250) scale(1.45)">
                  <InkHead t={t} mouth="grin" />
                </g>
                <g transform={`translate(-260 -360) scale(${ip(t, [ans, ans + 0.25], [0, 1], BACK)})`}>
                  <rect x={-60} y={-40} width={120} height={120} rx={30} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
                  <rect x={-26} y={-150} width={52} height={130} rx={26} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
                  <path d="M -60 0 L 60 0 M -60 30 L 60 30" stroke={INK} strokeWidth={4} />
                </g>
                <path d="M 70 -330 L 82 -300 L 112 -290 L 82 -280 L 70 -250 L 58 -280 L 28 -290 L 58 -300 Z" fill={INK} opacity={glint} transform="scale(1.4)" />
              </g>
              <InkChibiFox t={t} x={170} y={1860} scale={0.85} />
            </Svg>
          </>
        )}
      </Panel>
      <Balloon t={t} at={q - 0.05} until={ans - 0.3} text="Рэн! Что помогло тебе победить?!" x={700} y={300} w={520} size={52} tail={[-150, 120]} />
      {t > ans && (
        <div style={{ position: "absolute", top: 940, left: 0, right: 0, textAlign: "center", rotate: "-5deg", scale: String(ip(t, [ans, ans + 0.3], [2.6, 1], EASE_OUT)) }}>
          <div style={{ display: "inline-block", background: "#FFFFFF", border: `10px solid ${INK}`, boxShadow: `14px 14px 0 ${RED}`, padding: "18px 40px" }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 120, lineHeight: 1, color: INK }}>OXFORD</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 52, color: RED, marginTop: 6 }}>LEARNING CENTRE!</div>
          </div>
        </div>
      )}
      <Balloon t={t} at={ans + 2.0} until={8.2} text="Yip!" x={250} y={1560} w={140} size={46} tail={[-20, 80]} />
    </AbsoluteFill>
  );
};

/** 8. To be continued */
export const End: React.FC = () => {
  const t = useT();
  const card = ip(t, [2.2, 2.7], [0, 1], EASE_OUT);
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <Paper t={t} />
      <InkLines t={t} inner={600} n={50} />
      <div style={{ position: "absolute", top: 140, fontFamily: JP, fontWeight: 900, fontSize: 210, color: RED, WebkitTextStroke: `10px ${INK}`, paintOrder: "stroke", scale: String(ip(t, [0.2, 0.45], [2, 1], EASE_OUT)), opacity: ip(t, [0.2, 0.3], [0, 1]) }}>続く</div>
      <Caption t={t} at={0.5} until={6} text="Продолжение следует…" x={170} y={430} w={740} dark />
      <div style={{ position: "absolute", top: 640, left: 70, right: 70, translate: `0px ${(1 - card) * 300}px`, opacity: card, background: "#FFFFFF", border: `10px solid ${INK}`, padding: "40px", textAlign: "center", boxShadow: `16px 16px 0 ${RED}` }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 112, color: INK, lineHeight: 1 }}>OXFORD</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 42, color: RED, marginTop: 6 }}>LEARNING CENTRE</div>
        <div style={{ height: 8, background: INK, margin: "28px 60px" }} />
        <div style={{ fontFamily: SUB, fontWeight: 1000, fontSize: 54, color: INK }}>8 филиалов в Душанбе</div>
        <div style={{ fontFamily: SUB, fontWeight: 900, fontSize: 40, color: INK, marginTop: 10 }}>
          новый — <span style={{ background: RED, color: "#FFFFFF", padding: "0 12px" }}>Домпечать</span>, рядом с Алфемо
        </div>
      </div>
      <div style={{ position: "absolute", top: 1260, textAlign: "center", scale: String(ip(t, [3.0, 3.35], [0, 1], BACK) * (1 + Math.sin(t * 6) * 0.03)) }}>
        <div style={{ fontFamily: SUB, fontWeight: 1000, fontSize: 66, color: INK, WebkitTextStroke: `8px ${PAPER}`, paintOrder: "stroke" }}>Следующий герой — ты!</div>
        <div style={{ marginTop: 20, display: "inline-block", fontFamily: SUB, fontWeight: 1000, fontSize: 54, color: "#FFFFFF", background: RED, border: `8px solid ${INK}`, padding: "18px 48px", boxShadow: `10px 10px 0 ${INK}` }}>Запишись на пробный урок</div>
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: ip(t, [5.3, 5.8], [0, 1]) }} />
    </AbsoluteFill>
  );
};

const f = (s: number) => Math.round(s * 30);
const len = (s: readonly number[]) => f(s[1] - s[0]);

/** «Oxford Shinobi», episode 8 — animated manga edition. */
export const OxfordShinobiManga: React.FC = () => {
  const { fps } = useVideoConfig();
  const scenes: [keyof typeof S, string, React.FC][] = [
    ["cold", "Пролог", ColdOpen],
    ["op", "Опенинг", Opening],
    ["attack", "Атака лиса", Attack],
    ["hero", "Герой", Hero],
    ["battle", "Схватка", Battle],
    ["awaken", "Око Знаний", Awaken],
    ["final", "Печать Света", Final],
    ["interview", "Интервью", Interview],
    ["end", "Продолжение следует", End],
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {scenes.map(([k, name, C]) => (
        <Sequence key={k} name={name} from={f(S[k][0])} durationInFrames={len(S[k])} premountFor={fps}>
          <C />
        </Sequence>
      ))}
      <Audio src={staticFile("audio/shinobi.wav")} />
    </AbsoluteFill>
  );
};
