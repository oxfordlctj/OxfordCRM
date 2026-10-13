import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { S, VO } from "../v5/timeline";
import { InkFox, InkHead, InkNinja } from "./InkCast";
import { Balloon, Caption, INK, InkLines, InkSpeed, PAPER, Panel, Paper, RED, Sfx, ToneDefs, ip, EASE_OUT } from "./Ink";
import { DISPLAY, JP, SUB } from "../v5/theme";

const useT = () => useCurrentFrame() / 30;
const L = (k: keyof typeof VO, scene: keyof typeof S) => VO[k] - S[scene][0];

const shake = (t: number, hits: number[], amp = 26, dur = 0.45) => {
  let a = 0;
  for (const h of hits) if (t >= h && t < h + dur) a = Math.max(a, amp * (1 - (t - h) / dur));
  return `${Math.sin(t * 97) * a}px ${Math.cos(t * 83) * a}px`;
};
const invert = (t: number, hits: number[]) => (hits.some((h) => t >= h && t < h + 0.1) ? "invert(1)" : "none");

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <ToneDefs />
    {children}
  </svg>
);

const Kanji: React.FC<{ t: number; at: number; until: number; text: string; x: number; y: number; size?: number }> = ({ t, at, until, text, x, y, size = 200 }) =>
  t < at || t > until ? null : (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% 0", writingMode: "vertical-rl", fontFamily: JP, fontWeight: 900, fontSize: size, lineHeight: 1, color: RED, WebkitTextStroke: `8px ${INK}`, paintOrder: "stroke", scale: String(ip(t, [at, at + 0.12], [2, 1])) }}>{text}</div>
  );

const Village: React.FC<{ fire?: number; t: number }> = ({ fire = 0, t }) => (
  <>
    <path d="M 0 420 L 180 200 L 320 330 L 520 140 L 700 330 L 880 180 L 1080 380 L 1080 700 L 0 700 Z" fill="url(#tone20)" stroke={INK} strokeWidth={6} />
    <path d="M 460 200 L 520 140 L 580 210" fill="none" stroke={INK} strokeWidth={6} />
    {new Array(7).fill(0).map((_, i) => {
      const x = i * 165 - 20;
      const h = 120 + (i % 3) * 60;
      return (
        <g key={i}>
          <rect x={x + 20} y={560 - h} width={130} height={h + 200} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
          <path d={`M ${x - 14} ${560 - h} L ${x + 85} ${500 - h} L ${x + 184} ${560 - h} L ${x + 150} ${552 - h} L ${x + 85} ${520 - h} L ${x + 20} ${552 - h} Z`} fill={INK} />
          <rect x={x + 62} y={600 - h} width={46} height={56} fill="url(#tone60)" stroke={INK} strokeWidth={4} />
          {fire > 0 && i % 2 === 0 && <path d={`M ${x + 30} ${560 - h} q 20 ${-90 * fire} 50 ${-(160 + Math.sin(t * 12 + i) * 40) * fire} q 10 ${70 * fire} 50 ${160 * fire} Z`} fill={i % 4 ? INK : RED} />}
        </g>
      );
    })}
  </>
);

/** 0. Cold open */
export const ColdOpen: React.FC = () => {
  const t = useT();
  const eyes = ip(t, [2.5, 2.85], [0, 1], EASE_OUT);
  return (
    <AbsoluteFill style={{ background: INK, translate: shake(t, [2.6], 30) }}>
      <Panel t={t} at={0.2} r={{ x: 30, y: 330, w: 1020, h: 620 }} bg={INK}>
        {() => (
          <Svg>
            {[-1, 1].map((s) => (
              <g key={s} transform={`translate(${540 + s * 240} 640)`}>
                <path d={`M -170 0 Q 0 ${-110 * eyes} 170 0 Q 0 ${110 * eyes} -170 0 Z`} fill={RED} stroke="#FFFFFF" strokeWidth={6} />
                <ellipse rx={20} ry={90 * eyes} fill={INK} />
              </g>
            ))}
          </Svg>
        )}
      </Panel>
      <Panel t={t} at={3.0} r={{ x: 30, y: 980, w: 1020, h: 520, skew: 50 }} bg="#FFFFFF">
        {(l) => (
          <>
            <InkLines t={t} x={540} y={1240} inner={140} />
            <Svg>
              <g transform="translate(540 1240)">
                <path d="M -330 0 Q 0 -200 330 0 Q 0 200 -330 0 Z" fill={RED} stroke={INK} strokeWidth={14} />
                <ellipse rx={40} ry={170 - l * 60} fill={INK} />
              </g>
            </Svg>
          </>
        )}
      </Panel>
      <Caption t={t} at={0.8} until={4.4} text="Давным-давно… проснулся Девятихвостый лис." x={60} y={110} w={900} />
      <Sfx t={t} at={2.6} until={4.4} text="ДОН!" x={850} y={1660} size={170} color="#FFFFFF" stroke={INK} />
      <Kanji t={t} at={3.0} until={4.4} text="九尾" x={960} y={1540} size={150} />
    </AbsoluteFill>
  );
};

/** 1. Opening */
export const Opening: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <Paper t={t} />
      {t < 0.6 && (
        <AbsoluteFill style={{ background: "#FFFFFF" }}>
          <InkLines t={t} inner={300} />
          <div style={{ position: "absolute", left: 540, top: 960, translate: "-50% -50%", fontFamily: JP, fontWeight: 900, fontSize: 620, color: RED, WebkitTextStroke: `14px ${INK}`, paintOrder: "stroke", scale: String(ip(t, [0, 0.15], [2.4, 1])) }}>忍</div>
        </AbsoluteFill>
      )}
      {t >= 0.6 && t < 1.6 && (
        <Panel t={t} at={0.6} r={{ x: 30, y: 30, w: 1020, h: 1860 }} bg={INK}>
          {() => (
            <Svg>
              <rect width={1080} height={1920} fill="url(#tone60)" />
              <circle cx={540} cy={780} r={420} fill={PAPER} stroke={INK} strokeWidth={8} />
              <circle cx={540} cy={780} r={420} fill="url(#tone20)" opacity={0.5} />
              <InkNinja t={t} pose="stand" x={540} y={1380} scale={1.15} silhouette />
              <rect x={0} y={1380} width={1080} height={600} fill={INK} />
            </Svg>
          )}
        </Panel>
      )}
      {t >= 1.6 && t < 2.6 && (
        <>
          <Panel t={t} at={1.6} r={{ x: 30, y: 30, w: 1020, h: 900, skew: 0 }} bg="#FFFFFF">
            {() => (
              <>
                <InkSpeed t={t} angle={-18} />
                <Svg>
                  <InkFox t={t} x={540} y={1150} scale={0.78} roar={0.7} />
                </Svg>
              </>
            )}
          </Panel>
          <Panel t={t} at={1.75} r={{ x: 30, y: 950, w: 1020, h: 940 }} bg="#FFFFFF">
            {() => (
              <>
                <InkLines t={t} x={540} y={1450} inner={420} />
                <Svg>
                  <g transform="translate(540 1820) scale(2.7)">
                    <InkHead t={t} />
                  </g>
                </Svg>
              </>
            )}
          </Panel>
        </>
      )}
      {t >= 2.6 && (
        <AbsoluteFill style={{ alignItems: "center" }}>
          <InkLines t={t} inner={520} n={70} />
          <div style={{ position: "absolute", top: 640, left: -40, right: -40, height: 420, background: RED, rotate: "-6deg", scale: `${ip(t, [2.6, 2.85], [0, 1], EASE_OUT)} 1`, border: `10px solid ${INK}` }} />
          <div style={{ position: "absolute", top: 470, fontFamily: JP, fontWeight: 900, fontSize: 110, color: INK, letterSpacing: 10, opacity: ip(t, [2.6, 2.75], [0, 1]) }}>第八話</div>
          <div style={{ position: "absolute", top: 690, fontFamily: DISPLAY, fontWeight: 900, fontSize: 176, color: "#FFFFFF", WebkitTextStroke: `12px ${INK}`, paintOrder: "stroke", rotate: "-6deg", scale: String(ip(t, [2.7, 2.95], [3, 1], EASE_OUT)) }}>OXFORD</div>
          <div style={{ position: "absolute", top: 890, fontFamily: DISPLAY, fontWeight: 900, fontSize: 110, color: INK, WebkitTextStroke: `6px #FFFFFF`, paintOrder: "stroke", letterSpacing: 16, rotate: "-6deg", translate: `${ip(t, [2.9, 3.2], [-1000, 0], EASE_OUT)}px 0px` }}>SHINOBI</div>
          <div style={{ position: "absolute", top: 1180, padding: "16px 36px", background: "#FFFFFF", border: `7px solid ${INK}`, boxShadow: `12px 12px 0 ${INK}`, fontFamily: SUB, fontWeight: 1000, fontSize: 54, color: INK, textAlign: "center", opacity: ip(t, [3.3, 3.5], [0, 1]) }}>
            Эпизод 8
            <br />
            <span style={{ color: RED }}>«Девятихвостый»</span>
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "#FFFFFF", opacity: [0.6, 1.6, 2.6].some((c) => t >= c && t < c + 0.07) ? 1 : 0 }} />
    </AbsoluteFill>
  );
};

/** 2. The fox attacks */
export const Attack: React.FC = () => {
  const t = useT();
  const rise = ip(t, [1.4, 4.0], [700, 0], EASE_OUT);
  const roar = ip(t, [3.5, 3.8, 5.0, 5.4], [0, 1, 1, 0]);
  return (
    <AbsoluteFill style={{ translate: shake(t, [3.6, 6.0], 34, 0.7), filter: invert(t, [6.0]) }}>
      <Paper t={t} />
      <Panel t={t} at={0} r={{ x: 30, y: 30, w: 1020, h: 560 }}>
        {() => (
          <Svg>
            <rect width={1080} height={600} fill="#FFFFFF" />
            <circle cx={820} cy={150} r={80} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
            <Village t={t} fire={ip(t, [6.0, 6.8], [0, 1])} />
          </Svg>
        )}
      </Panel>
      <Panel t={t} at={1.3} r={{ x: 30, y: 610, w: 1020, h: 820, skew: 50 }} bg="#FFFFFF">
        {() => (
          <>
            {roar > 0.3 && <InkLines t={t} x={540} y={760} inner={200} />}
            <Svg>
              <InkFox t={t} x={540} y={1440 + rise} scale={0.82} roar={roar} />
            </Svg>
          </>
        )}
      </Panel>
      <Panel t={t} at={5.2} r={{ x: 30, y: 1450, w: 1020, h: 440, skew: -40 }} bg={INK}>
        {(l) => (
          <Svg>
            <g transform="translate(540 1670)">
              {new Array(18).fill(0).map((_, i) => {
                const a = (i / 18) * Math.PI * 2;
                const r = 120 + ip(l, [0.8, 1.6], [0, 500]);
                return <path key={i} d={`M 0 0 L ${Math.cos(a - 0.08) * r} ${Math.sin(a - 0.08) * r} L ${Math.cos(a + 0.08) * r} ${Math.sin(a + 0.08) * r} Z`} fill="#FFFFFF" />;
              })}
              <circle r={ip(l, [0, 0.8], [40, 150])} fill={RED} stroke="#FFFFFF" strokeWidth={8} />
            </g>
          </Svg>
        )}
      </Panel>
      <Caption t={t} at={L("n3", "attack") - 0.1} until={4.0} text="Он пришёл, чтобы сжечь нашу деревню дотла." x={60} y={470} w={760} />
      <Sfx t={t} at={3.6} until={5.4} text="ГРРААА!!" x={560} y={1000} size={150} rot={-8} />
      <Sfx t={t} at={6.0} until={8.2} text="БАБАХ!" x={560} y={1640} size={170} color="#FFFFFF" stroke={RED} rot={6} />
    </AbsoluteFill>
  );
};

/** 3. The hero */
export const Hero: React.FC = () => {
  const t = useT();
  const land = ip(t, [0.3, 0.75], [-1300, 0], (x) => x * x);
  return (
    <AbsoluteFill style={{ translate: shake(t, [0.75], 22) }}>
      <Paper t={t} />
      <Panel t={t} at={0} r={{ x: 30, y: 30, w: 1020, h: 900 }} bg="#FFFFFF">
        {() => (
          <>
            {t < 0.75 && <InkSpeed t={t} angle={90} />}
            <Svg>
              <rect width={1080} height={960} fill="url(#tone20)" />
              <circle cx={760} cy={260} r={160} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
              <path d="M 0 780 L 280 700 L 560 720 L 820 690 L 1080 760 L 1080 960 L 0 960 Z" fill={INK} />
              <InkNinja t={t} pose={t < 0.75 ? "jump" : "stand"} x={540} y={790 + land} scale={0.95} />
            </Svg>
          </>
        )}
      </Panel>
      <Panel t={t} at={1.6} r={{ x: 30, y: 950, w: 600, h: 560, skew: 30 }} bg="#FFFFFF">
        {() => (
          <>
            <InkLines t={t} x={330} y={1260} inner={220} />
            <Svg>
              <g transform="translate(330 1640) scale(2.3)">
                <InkHead t={t} mouth={t > 1.8 && t < 2.8 ? "shout" : "calm"} />
              </g>
            </Svg>
          </>
        )}
      </Panel>
      <Panel t={t} at={2.1} r={{ x: 650, y: 950, w: 400, h: 560, skew: 30 }} bg={INK}>
        {() => (
          <Svg>
            <g transform="translate(850 1230)">
              <path d="M -190 0 Q 0 -130 190 0 Q 0 130 -190 0 Z" fill={RED} stroke="#FFFFFF" strokeWidth={8} />
              <ellipse rx={24} ry={110} fill={INK} />
            </g>
          </Svg>
        )}
      </Panel>
      <Panel t={t} at={4.1} r={{ x: 30, y: 1530, w: 1020, h: 360 }} bg="#FFFFFF">
        {() => (
          <>
            <InkLines t={t} x={540} y={1700} inner={160} color={RED} />
            <Svg>
              <g transform="translate(540 1960) scale(1.4)">
                <InkHead t={t} mouth="shout" />
              </g>
            </Svg>
          </>
        )}
      </Panel>
      <Sfx t={t} at={0.75} until={1.8} text="ТУМ!" x={820} y={720} size={140} />
      <Balloon t={t} at={L("r1", "hero") - 0.05} until={4.0} text="Только не сегодня, лис!" x={360} y={1060} w={420} size={44} shout tail={[60, 90]} />
      <Balloon t={t} at={L("r2", "hero") - 0.05} until={7.2} text="Я защищу всех!" x={540} y={1390} w={480} size={56} shout tail={[0, 110]} />
    </AbsoluteFill>
  );
};

/** 4. The clash */
export const Battle: React.FC = () => {
  const t = useT();
  const hit = 2.8;
  const down = t > 4.6;
  return (
    <AbsoluteFill style={{ translate: shake(t, [hit, 3.6], 40, 0.6), filter: invert(t, [hit, hit + 0.13]) }}>
      <Paper t={t} />
      {!down && (
        <>
          <Panel t={t} at={0} r={{ x: 30, y: 30, w: 1020, h: 620 }} bg="#FFFFFF">
            {() => (
              <Svg>
                <InkNinja t={t} pose="throw" x={300} y={640} scale={0.8} mouth="shout" />
                {t > 0.5 &&
                  [0, 1, 2].map((k) => {
                    const p = ip(t, [0.5 + k * 0.1, 1.3 + k * 0.1], [0, 1]);
                    return (
                      <g key={k} transform={`translate(${420 + p * 700} ${300 - k * 70}) rotate(${t * 1400})`}>
                        <path d="M 0 -42 L 11 -11 L 42 0 L 11 11 L 0 42 L -11 11 L -42 0 L -11 -11 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} />
                        <circle r={8} fill={INK} />
                      </g>
                    );
                  })}
              </Svg>
            )}
          </Panel>
          <Panel t={t} at={1.2} r={{ x: 30, y: 670, w: 1020, h: 520, skew: 60 }} bg="#FFFFFF">
            {(l) => (
              <>
                <InkSpeed t={t} />
                <Svg>
                  <InkNinja t={t} pose="run" run={1} x={200 + l * 420} y={1170} scale={0.7} mouth="shout" />
                </Svg>
              </>
            )}
          </Panel>
          <Panel t={t} at={hit} r={{ x: 30, y: 1210, w: 1020, h: 680, skew: -50 }} bg={INK}>
            {(l) => (
              <>
                <InkLines t={t} x={540} y={1550} inner={120} color="#FFFFFF" />
                <Svg>
                  <g transform={`translate(${540 - l * 260} ${1560 - Math.sin(Math.min(1, l) * Math.PI) * 120}) rotate(${-l * 400})`}>
                    <InkNinja t={t} pose="fall" x={0} y={200} scale={0.55} silhouette />
                  </g>
                </Svg>
              </>
            )}
          </Panel>
          <Balloon t={t} at={L("r3", "battle") - 0.05} until={1.6} text="Получай!" x={700} y={180} w={360} size={60} shout tail={[-120, 70]} />
          <Sfx t={t} at={0.5} until={1.6} text="ВЖИХ!" x={860} y={520} size={110} rot={-14} />
          <Sfx t={t} at={1.3} until={2.8} text="ФШШ!" x={850} y={1080} size={100} rot={8} />
          <Sfx t={t} at={hit} until={4.6} text="БАМ!!" x={560} y={1420} size={210} color="#FFFFFF" stroke={RED} rot={-10} />
        </>
      )}
      {down && (
        <Panel t={t} at={4.6} r={{ x: 30, y: 30, w: 1020, h: 1860 }} bg="#FFFFFF">
          {() => (
            <Svg>
              <rect width={1080} height={1920} fill="url(#tone20)" />
              {new Array(26).fill(0).map((_, i) => (
                <line key={i} x1={random(`rx${i}`) * 1080} y1={(random(`ry${i}`) * 1920 + t * 1600) % 1920} x2={random(`rx${i}`) * 1080 - 24} y2={((random(`ry${i}`) * 1920 + t * 1600) % 1920) + 100} stroke={INK} strokeWidth={3} />
              ))}
              <g transform="translate(540 1560) scale(3.2)">
                <InkHead t={t} mouth="hurt" sweat look={-3} />
              </g>
            </Svg>
          )}
        </Panel>
      )}
      <Balloon t={t} at={L("r4", "battle") - 0.05} until={7.2} text="Он… слишком силён…" x={540} y={260} w={560} size={56} tail={[0, 120]} />
    </AbsoluteFill>
  );
};
