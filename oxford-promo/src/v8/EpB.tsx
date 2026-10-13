import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Fansub, FocusLines, Kanji, Letterbox, Petals, Seal, impactFilter, shake } from "../v5/Fx";
import { End } from "../v5/ScenesB";
import { S, SUBS, VO } from "../v5/timeline";
import durations from "../v5/vo-durations.json";
import { A, BACK, DISPLAY, EASE_OUT, JP, SUB, ip } from "../v5/theme";
import { LINE } from "../v7/RenHD";
import { Embers, Post, Rays, Sky } from "./BG";
import { ChibiFoxHD, FoxHD, ReporterHD } from "./Cast";
import { Attack, Battle, ColdOpen, Hero, Opening, Ren } from "./EpA";

const useT = () => useCurrentFrame() / 30;

/** Ren's own eye, extreme close-up, in the character's drawing style. */
const RenEye: React.FC<{ t: number; red: number; at: number }> = ({ t, red, at }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    <defs>
      <clipPath id="renEyeBig">
        <path d="M -480 -60 Q -60 -300 430 30 Q 300 160 30 190 Q -300 170 -480 -60 Z" />
      </clipPath>
      <radialGradient id="renIrisRed" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FF6A7A" />
        <stop offset="60%" stopColor="#D41E36" />
        <stop offset="100%" stopColor="#5A0612" />
      </radialGradient>
      <radialGradient id="renIrisDark" cx="50%" cy="60%" r="50%">
        <stop offset="0%" stopColor="#5A6390" />
        <stop offset="70%" stopColor="#2E3350" />
        <stop offset="100%" stopColor="#14172A" />
      </radialGradient>
    </defs>
    <g transform="translate(540 960)">
      <rect x={-800} y={-1200} width={1600} height={2400} fill="#FBE3D3" />
      <path d="M -800 -1200 L 800 -1200 L 800 -250 Q 0 -330 -800 -220 Z" fill="#E8B7A2" />
      <path d="M -800 -1200 L 800 -1200 L 800 -420 Q 0 -560 -800 -460 Z" fill="#1A1B29" />
      <path d="M -480 -60 Q -60 -300 430 30 Q 300 160 30 190 Q -300 170 -480 -60 Z" fill="#FFFFFF" />
      <g clipPath="url(#renEyeBig)">
        <circle cx={-20} cy={0} r={250} fill={red > 0 ? "url(#renIrisRed)" : "url(#renIrisDark)"} />
        <path d="M -480 -60 Q -60 -300 430 30 L 430 120 Q -60 -160 -480 30 Z" fill="#000" opacity={0.22} />
        {red > 0 ? (
          <g transform={`translate(-20 0) rotate(${(t - at) * 420})`}>
            <circle r={150} fill="none" stroke="#1A0A0E" strokeWidth={10} />
            <circle r={150} fill="none" stroke={A.gold} strokeWidth={3} opacity={0.8} />
            {[0, 120, 240].map((a) => (
              <g key={a} transform={`rotate(${a}) translate(150 0)`}>
                <circle r={32} fill="#1A0A0E" />
                <path d="M 10 -28 Q 60 -10 30 40" stroke="#1A0A0E" strokeWidth={16} fill="none" />
              </g>
            ))}
            <circle r={44} fill="#0B0B12" />
          </g>
        ) : (
          <ellipse cx={-20} cy={0} rx={80} ry={100} fill="#07070D" />
        )}
        <ellipse cx={-110} cy={-90} rx={56} ry={44} fill="#FFFFFF" opacity={0.95} />
        <circle cx={80} cy={90} r={22} fill="#FFFFFF" opacity={0.8} />
      </g>
      <path d="M -540 -110 Q -60 -360 450 10 L 500 50" stroke={LINE} strokeWidth={46} fill="none" strokeLinecap="round" />
      <path d="M -540 -110 L -600 -60" stroke={LINE} strokeWidth={22} strokeLinecap="round" />
      <path d="M -300 170 Q 30 210 300 160" stroke={LINE} strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d="M -560 -330 Q -60 -420 440 -200" stroke="#1A1B29" strokeWidth={48} fill="none" strokeLinecap="round" />
      {red > 0 && <circle cx={-20} cy={0} r={600} fill="#FF2A3D" opacity={0.1 * red} />}
    </g>
  </svg>
);

/** 5. The ancient scroll, the Eye of Knowledge, the seal stance. */
export const Awaken: React.FC = () => {
  const t = useT();
  const eyeAt = VO.r5 - S.awaken[0] + 0.4;
  const castAt = VO.r6 - S.awaken[0];
  const unroll = ip(t, [0.3, 1.4], [0, 1], EASE_OUT);
  const sh = shake(t, [eyeAt, castAt], 30, 0.6);
  const phase = t < eyeAt - 0.4 ? "scroll" : t < castAt ? "eye" : "cast";
  return (
    <AbsoluteFill style={{ overflow: "hidden", translate: `${sh.x}px ${sh.y}px`, filter: impactFilter(t, [eyeAt]) }}>
      {phase === "scroll" && (
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, #4A3410, ${A.ink} 75%)` }}>
          <Rays t={t} x={540} y={960} color="#FFE7A0" opacity={0.15} />
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <rect x={140} y={960 - 420 * unroll} width={800} height={840 * unroll} fill="#EED9A8" stroke={LINE} strokeWidth={8} />
            <rect x={140} y={960 - 420 * unroll} width={60} height={840 * unroll} fill="#D9BE84" />
            <rect x={110} y={940 - 420 * unroll - 30} width={860} height={50} rx={25} fill="#7A3B1E" stroke={LINE} strokeWidth={6} />
            <rect x={110} y={940 + 420 * unroll + 10} width={860} height={50} rx={25} fill="#7A3B1E" stroke={LINE} strokeWidth={6} />
            <g opacity={ip(t, [1.2, 1.8], [0, 1])}>
              <text x={540} y={700} textAnchor="middle" fontFamily={JP} fontWeight={900} fontSize={110} fill={A.blood}>
                封印
              </text>
              {["SEAL OF LIGHT", "To stop the beast,", "speak these words:", "“Seal of Light,", "activate!”"].map((l, i) => (
                <text key={i} x={540} y={830 + i * 82} textAnchor="middle" fontFamily={SUB} fontWeight={1000} fontSize={i === 0 ? 70 : 56} fill={i === 0 ? A.blood : "#3A2410"}>
                  {l}
                </text>
              ))}
              <circle cx={540} cy={1330} r={46} fill="none" stroke={A.blood} strokeWidth={8} />
              <text x={540} y={1348} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={46} fill={A.blood}>
                O
              </text>
            </g>
          </svg>
          <Embers t={t} n={24} color="#FFE7A0" />
        </AbsoluteFill>
      )}
      {phase === "eye" && (
        <AbsoluteFill style={{ background: A.ink }}>
          <AbsoluteFill style={{ scale: String(ip(t, [eyeAt - 0.4, castAt], [1.0, 1.15])) }}>
            <RenEye t={t} red={t > eyeAt ? 1 : 0} at={eyeAt} />
          </AbsoluteFill>
          {t > eyeAt && <FocusLines t={t} color={A.ink} opacity={0.5} inner={560} />}
          <Kanji t={t} at={eyeAt} until={castAt} text="知眼" x={920} y={200} size={170} color={A.red} />
          <div style={{ position: "absolute", top: 1420, width: "100%", textAlign: "center", fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: A.white, WebkitTextStroke: `8px ${A.ink}`, paintOrder: "stroke", opacity: ip(t, [eyeAt, eyeAt + 0.2], [0, 1]), letterSpacing: 4 }}>
            ОКО ЗНАНИЙ
          </div>
        </AbsoluteFill>
      )}
      {phase === "cast" && (
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 70%, #6A1020, ${A.ink} 70%)` }}>
          <Rays t={t} x={540} y={1100} color="#FFD23A" opacity={0.12} />
          <Seal t={t} x={540} y={1620} r={460} p={ip(t, [castAt, castAt + 0.8], [0, 1], EASE_OUT)} color={A.gold} />
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <Ren t={t} x={540} y={1700} s={0.92} pose="seal" power={1} mouth="shout" id="aw" />
          </svg>
          <FocusLines t={t} x={540} y={900} color={A.gold} opacity={0.35} />
          <Embers t={t} n={40} color="#FF5A6A" />
        </AbsoluteFill>
      )}
      <Letterbox />
    </AbsoluteFill>
  );
};

/** 6. The seal of light swallows the fox. */
export const Final: React.FC = () => {
  const t = useT();
  const boom = 3.2;
  const sh = shake(t, [1.0, boom], 44, 0.8);
  const beam = ip(t, [2.0, 2.4], [0, 1], EASE_OUT);
  const white = ip(t, [boom, boom + 0.3, 4.4, 5.0], [0, 1, 1, 0]);
  const after = t > 4.4;
  return (
    <AbsoluteFill style={{ overflow: "hidden", translate: `${sh.x}px ${sh.y}px`, filter: impactFilter(t, [boom, boom + 0.2]) }}>
      {!after && (
        <AbsoluteFill>
          <Sky t={t} top="#0E0620" mid="#3A0E36" low="#8A1E3A" stars={30} />
          <Seal t={t} x={540} y={760} r={520} p={ip(t, [0.8, 2.0], [0, 1], EASE_OUT)} color={A.gold} />
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <g transform="translate(540 1700) scale(0.62)">
              <FoxHD t={t} roar={t > 1 ? 1 : 0.5} hurt={beam} />
            </g>
            {beam > 0 && (
              <>
                <rect x={540 - 300 * beam} y={0} width={600 * beam} height={1500} fill="#FFF6C8" opacity={0.7} />
                <rect x={540 - 130 * beam} y={0} width={260 * beam} height={1500} fill={A.white} />
              </>
            )}
            <g style={{ filter: "drop-shadow(0 0 30px #FF2A3D)" }}>
              <Ren t={t} x={190} y={1820} s={0.36} pose="seal" power={1} mouth="shout" id="fi" />
            </g>
          </svg>
          <FocusLines t={t} x={540} y={900} color={A.white} opacity={beam * 0.6} />
          <Kanji t={t} at={2.2} until={boom} text="封印" x={900} y={200} size={190} color={A.gold} />
        </AbsoluteFill>
      )}
      {after && (
        <AbsoluteFill>
          <Sky t={t} top="#6EB6FF" mid="#BFE2FF" low="#FFE9C8" clouds="#FFFFFF" cloudsS="#DCEBFA" />
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <path d="M 0 1420 Q 540 1340 1080 1420 L 1080 1920 L 0 1920 Z" fill="#7FB069" stroke={LINE} strokeWidth={4} />
            <path d="M 0 1500 Q 540 1440 1080 1500 L 1080 1920 L 0 1920 Z" fill="#6A9A58" />
            {new Array(10).fill(0).map((_, i) => (
              <circle key={i} cx={random(`sm${i}`) * 1080} cy={1300 + random(`sn${i}`) * 300} r={160 * ip(t, [4.4, 6.5], [1, 0.1])} fill="#FFFFFF" opacity={0.75} />
            ))}
            <g transform="translate(540 1560) scale(1.5)">
              <ChibiFoxHD t={t} />
            </g>
            <text x={700} y={1080} fontFamily={DISPLAY} fontWeight={900} fontSize={130} fill={A.white} stroke={LINE} strokeWidth={8} paintOrder="stroke" opacity={ip(t, [5.4, 5.6], [0, 1])}>
              ?
            </text>
          </svg>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: A.white, opacity: white }} />
      <Letterbox />
    </AbsoluteFill>
  );
};

/** 7. The interview. */
export const Interview: React.FC = () => {
  const t = useT();
  const ans = VO.r8 - S.interview[0];
  const q = VO.q1 - S.interview[0];
  const glint = ip(t, [ans + 0.5, ans + 0.7, ans + 0.9], [0, 1, 0]);
  const answered = t > ans;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Sky t={t} top="#5AAEFF" mid="#A8D8FF" low="#FFF0D6" clouds="#FFFFFF" cloudsS="#DCEBFA" />
      {answered && <Rays t={t} x={760} y={900} color="#FFE27A" opacity={0.3} n={16} />}
      <Petals t={t} n={24} />
      {answered && <FocusLines t={t} x={760} y={900} color={A.gold} opacity={0.4} inner={460} />}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <g transform="translate(250 1790) scale(1.0)">
          <ReporterHD t={t} talk={t > q && t < q + 1.4} excited={t > q && t < q + 1.6} />
        </g>
        <Ren t={t} x={650} y={2520 + (answered ? ip(t, [ans, ans + 0.25], [40, 0], BACK) : 0)} s={1.18} pose={answered ? "thumbs" : "stand"} mouth={answered ? "grin" : "smile"} id="iv" />
        <g transform="translate(860 1100)" opacity={glint}>
          <path d="M 0 -60 L 12 -12 L 60 0 L 12 12 L 0 60 L -12 12 L -60 0 L -12 -12 Z" fill={A.white} />
        </g>
        <g transform="translate(560 1890) scale(0.75)">
          <ChibiFoxHD t={t} />
        </g>
      </svg>
      {t > ans + 0.1 && (
        <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", scale: String(ip(t, [ans + 0.1, ans + 0.4], [2.6, 1], EASE_OUT)), rotate: "-4deg" }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 132, lineHeight: 1, color: A.gold, WebkitTextStroke: `10px ${A.ink}`, paintOrder: "stroke", textShadow: `8px 8px 0 ${A.blood}` }}>OXFORD</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 62, color: A.white, WebkitTextStroke: `8px ${A.ink}`, paintOrder: "stroke", marginTop: 8 }}>LEARNING CENTRE</div>
        </div>
      )}
      <div style={{ position: "absolute", left: 620, top: 1500, fontFamily: SUB, fontWeight: 1000, fontSize: 46, color: A.ink, background: A.white, border: `5px solid ${A.ink}`, borderRadius: 30, padding: "6px 22px", opacity: ip(t, [ans + 2.0, ans + 2.2], [0, 1]) }}>Yip!</div>
    </AbsoluteFill>
  );
};

const f = (s: number) => Math.round(s * 30);
const len = (s: readonly number[]) => f(s[1] - s[0]);

const Subs: React.FC = () => {
  const t = useCurrentFrame() / 30;
  return (
    <>
      {(Object.keys(VO) as (keyof typeof VO)[]).map((k) => (
        <Fansub key={k} t={t} at={VO[k] - 0.05} until={VO[k] + (durations as Record<string, number>)[k] + 0.35} text={SUBS[k].ru} who={SUBS[k].who} />
      ))}
    </>
  );
};

/** «Oxford Shinobi», episode 8 — redrawn with the cel-shaded cast. */
export const OxfordShinobiHD: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const scenes: [string, readonly number[], React.FC][] = [
    ["Пролог", S.cold, ColdOpen],
    ["Опенинг", S.op, Opening],
    ["Атака лиса", S.attack, Attack],
    ["Герой", S.hero, Hero],
    ["Схватка", S.battle, Battle],
    ["Пробуждение", S.awaken, Awaken],
    ["Печать Света", S.final, Final],
    ["Интервью", S.interview, Interview],
    ["Продолжение следует", S.end, End],
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: "#0D0B12" }}>
      {scenes.map(([name, s, C]) => (
        <Sequence key={name} name={name} from={f(s[0])} durationInFrames={len(s)} premountFor={fps}>
          <C />
        </Sequence>
      ))}
      <Post frame={frame} />
      <Subs />
      <Audio src={staticFile("audio/shinobi.wav")} />
    </AbsoluteFill>
  );
};
