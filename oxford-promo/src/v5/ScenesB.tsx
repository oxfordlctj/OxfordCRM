import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { ChibiFox, Fox, Head, Ninja, Reporter } from "./Characters";
import { FocusLines, Kanji, Letterbox, Petals, Seal, impactFilter, shake } from "./Fx";
import { S, VO } from "./timeline";
import { A, BACK, DISPLAY, EASE_IN, EASE_OUT, JP, SUB, ip } from "./theme";

const useT = () => useCurrentFrame() / 30;

/** 5. The ancient scroll, the Eye of Knowledge awakens, the hero reads the seal in English. */
export const Awaken: React.FC = () => {
  const t = useT();
  const eyeAt = VO.r5 - S.awaken[0] + 0.4;
  const castAt = VO.r6 - S.awaken[0];
  const unroll = ip(t, [0.3, 1.4], [0, 1], EASE_OUT);
  const sh = shake(t, [eyeAt], 30, 0.6);
  const phase = t < eyeAt - 0.4 ? "scroll" : t < castAt ? "eye" : "cast";
  return (
    <AbsoluteFill style={{ overflow: "hidden", translate: `${sh.x}px ${sh.y}px`, filter: impactFilter(t, [eyeAt]) }}>
      {phase === "scroll" && (
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, #3A2A10, ${A.ink} 75%)` }}>
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <rect x={140} y={960 - 420 * unroll} width={800} height={840 * unroll} fill="#EED9A8" stroke="#8A5A2B" strokeWidth={10} />
            <rect x={110} y={940 - 420 * unroll - 30} width={860} height={50} rx={25} fill="#7A3B1E" />
            <rect x={110} y={940 + 420 * unroll + 10} width={860} height={50} rx={25} fill="#7A3B1E" />
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
            <circle cx={540} cy={960} r={500} fill={A.gold} opacity={0.08 + 0.05 * Math.sin(t * 6)} />
          </svg>
        </AbsoluteFill>
      )}
      {phase === "eye" && (
        <AbsoluteFill style={{ background: A.ink }}>
          <FocusLines t={t} color={A.blood} opacity={t > eyeAt ? 0.9 : 0.3} inner={420} />
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <g transform="translate(540 960)">
              <path d="M -480 40 Q 0 -330 480 -40 Q 0 300 -480 40 Z" fill={A.white} stroke={A.ink} strokeWidth={18} />
              <clipPath id="eyeclip">
                <path d="M -480 40 Q 0 -330 480 -40 Q 0 300 -480 40 Z" />
              </clipPath>
              <g clipPath="url(#eyeclip)">
                <circle r={220} fill={t > eyeAt ? A.red : "#2A2F55"} />
                {t > eyeAt && (
                  <g transform={`rotate(${(t - eyeAt) * 500})`}>
                    <circle r={150} fill="none" stroke={A.gold} strokeWidth={12} />
                    <circle r={90} fill="none" stroke={A.gold} strokeWidth={6} />
                    {[0, 120, 240].map((a) => (
                      <g key={a} transform={`rotate(${a}) translate(150 0)`}>
                        <circle r={30} fill={A.ink} />
                        <path d="M 0 -30 Q 40 -10 20 30" stroke={A.ink} strokeWidth={14} fill="none" />
                      </g>
                    ))}
                  </g>
                )}
                <circle r={t > eyeAt ? 40 : 100} fill={A.ink} />
                <circle cx={60} cy={-70} r={34} fill={A.white} opacity={0.9} />
              </g>
              <path d="M -500 -40 Q 0 -420 520 -120" stroke={A.ink} strokeWidth={34} fill="none" strokeLinecap="round" />
            </g>
          </svg>
          <Kanji t={t} at={eyeAt} until={castAt} text="知眼" x={920} y={180} size={170} color={A.red} />
          <div style={{ position: "absolute", top: 1380, width: "100%", textAlign: "center", fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: A.white, WebkitTextStroke: `8px ${A.ink}`, paintOrder: "stroke", opacity: ip(t, [eyeAt, eyeAt + 0.2], [0, 1]), letterSpacing: 4 }}>
            ОКО ЗНАНИЙ
          </div>
        </AbsoluteFill>
      )}
      {phase === "cast" && (
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 75%, #5A1020, ${A.ink} 70%)` }}>
          <Seal t={t} x={540} y={1560} r={420} p={ip(t, [castAt, castAt + 0.8], [0, 1], EASE_OUT)} color={A.gold} />
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <Ninja t={t} pose="cast" x={540} y={1560} scale={1.4} power={1} mouth="shout" />
          </svg>
          <FocusLines t={t} x={540} y={900} color={A.gold} opacity={0.35} />
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
  const sh = shake(t, [boom, 1.0], 44, 0.8);
  const beam = ip(t, [2.0, 2.4], [0, 1], EASE_OUT);
  const white = ip(t, [boom, boom + 0.3, 4.4, 5.0], [0, 1, 1, 0]);
  const after = t > 4.4;
  return (
    <AbsoluteFill style={{ overflow: "hidden", translate: `${sh.x}px ${sh.y}px`, filter: impactFilter(t, [boom, boom + 0.2]) }}>
      {!after && (
        <>
          <AbsoluteFill style={{ background: `linear-gradient(180deg, #14082A, #5A1430)` }} />
          <Seal t={t} x={540} y={1150} r={520} p={ip(t, [0.8, 2.0], [0, 1], EASE_OUT)} color={A.gold} />
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            <Fox t={t} x={540} y={1420} scale={0.85} roar={t > 1 ? 1 : 0.5} hurt={beam * Math.sin(t * 30) * 0.3} />
            {beam > 0 && (
              <>
                <rect x={540 - 260 * beam} y={0} width={520 * beam} height={1500} fill="#FFF6C8" opacity={0.75} />
                <rect x={540 - 120 * beam} y={0} width={240 * beam} height={1500} fill={A.white} />
              </>
            )}
            <g transform={`translate(160 1700) scale(0.55)`}>
              <Ninja t={t} pose="cast" power={1} mouth="shout" />
            </g>
          </svg>
          <FocusLines t={t} x={540} y={900} color={A.white} opacity={beam * 0.6} />
          <Kanji t={t} at={2.2} until={boom} text="封印" x={900} y={200} size={190} color={A.gold} />
        </>
      )}
      {after && (
        <AbsoluteFill style={{ background: `linear-gradient(180deg, #8EC5FF 0%, #FFE4C2 100%)` }}>
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            {new Array(10).fill(0).map((_, i) => (
              <circle key={i} cx={random(`sm${i}`) * 1080} cy={1300 + random(`sn${i}`) * 400} r={140 * ip(t, [4.4, 6.5], [1, 0.2])} fill="#FFFFFF" opacity={0.7} />
            ))}
            <rect x={0} y={1500} width={1080} height={420} fill="#7FB069" />
            <ChibiFox t={t} x={540} y={1520} scale={1.6} />
            <text x={640} y={1180} fontFamily={DISPLAY} fontWeight={900} fontSize={110} fill={A.ink} opacity={ip(t, [5.4, 5.6], [0, 1])}>
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
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #7EC8FF 0%, #FFF0D6 100%)`, overflow: "hidden" }}>
      <Petals t={t} n={22} />
      {t > ans && <FocusLines t={t} x={760} y={900} color={A.gold} opacity={0.45} inner={420} />}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Reporter t={t} x={270} y={1920} scale={1.25} talk={t > q && t < q + 1.4} />
        <g transform={`translate(780 1920)`}>
          <path d="M -230 0 Q -220 -220 0 -250 Q 220 -220 230 0 Z" fill="#232A4D" stroke={A.ink} strokeWidth={6} />
          <path d="M -230 -40 Q -340 -140 -380 -60" stroke={A.blood} strokeWidth={30} fill="none" strokeLinecap="round" />
          <circle cx={0} cy={-150} r={34} fill="none" stroke={A.gold} strokeWidth={9} />
          <g transform="translate(0 -230) scale(1.5)">
            <Head t={t} mouth={t > ans ? "grin" : "smile"} angry={false} look={-4} />
          </g>
          {t > ans && (
            <g transform={`translate(-170 -330) scale(${ip(t, [ans, ans + 0.25], [0, 1], BACK)})`}>
              <rect x={-55} y={-40} width={110} height={110} rx={30} fill={A.skin} stroke={A.ink} strokeWidth={6} />
              <rect x={-24} y={-140} width={48} height={120} rx={24} fill={A.skin} stroke={A.ink} strokeWidth={6} />
            </g>
          )}
          <g transform="translate(60 -280)" opacity={glint}>
            <path d="M 0 -50 L 10 -10 L 50 0 L 10 10 L 0 50 L -10 10 L -50 0 L -10 -10 Z" fill={A.white} />
          </g>
        </g>
        <ChibiFox t={t} x={540} y={1880} scale={0.9} />
      </svg>
      {t > ans + 0.1 && (
        <div style={{ position: "absolute", top: 260, width: "100%", textAlign: "center", scale: String(ip(t, [ans + 0.1, ans + 0.4], [2.6, 1], EASE_OUT)), rotate: "-4deg" }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 132, lineHeight: 1, color: A.gold, WebkitTextStroke: `10px ${A.ink}`, paintOrder: "stroke", textShadow: `8px 8px 0 ${A.blood}` }}>OXFORD</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 62, color: A.white, WebkitTextStroke: `8px ${A.ink}`, paintOrder: "stroke", marginTop: 8 }}>LEARNING CENTRE</div>
        </div>
      )}
      <div style={{ position: "absolute", left: 560, top: 1560, fontFamily: SUB, fontWeight: 1000, fontSize: 46, color: A.ink, background: A.white, border: `5px solid ${A.ink}`, borderRadius: 30, padding: "6px 22px", opacity: ip(t, [ans + 2.0, ans + 2.2], [0, 1]) }}>Yip!</div>
    </AbsoluteFill>
  );
};

/** 8. "To be continued" + call to action. */
export const End: React.FC = () => {
  const t = useT();
  const card = ip(t, [2.2, 2.7], [0, 1], EASE_OUT);
  return (
    <AbsoluteFill style={{ background: A.ink, overflow: "hidden", alignItems: "center" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #4A1020, ${A.ink} 70%)`, opacity: 0.9 }} />
      <Petals t={t} n={20} opacity={0.6} />
      <div style={{ position: "absolute", top: 160, fontFamily: JP, fontWeight: 900, fontSize: 200, color: A.red, WebkitTextStroke: `8px ${A.ink}`, paintOrder: "stroke", scale: String(ip(t, [0.2, 0.45], [2, 1], EASE_OUT)), opacity: ip(t, [0.2, 0.3], [0, 1]) }}>続く</div>
      <div style={{ position: "absolute", top: 440, left: ip(t, [0.3, 0.7], [-900, 60], EASE_OUT), display: "flex", alignItems: "center" }}>
        <div style={{ background: A.gold, color: A.ink, fontFamily: SUB, fontWeight: 1000, fontSize: 52, padding: "14px 30px", border: `6px solid ${A.ink}` }}>Продолжение следует…</div>
        <div style={{ width: 0, height: 0, borderTop: "48px solid transparent", borderBottom: "48px solid transparent", borderLeft: `60px solid ${A.gold}` }} />
      </div>
      <div style={{ position: "absolute", top: 640, left: 70, right: 70, translate: `0px ${(1 - card) * 300}px`, opacity: card, background: A.moon, border: `8px solid ${A.ink}`, borderRadius: 30, padding: "40px 40px", textAlign: "center", boxShadow: `14px 14px 0 ${A.blood}` }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 110, color: A.ink, lineHeight: 1 }}>OXFORD</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, color: A.blood, marginTop: 6 }}>LEARNING CENTRE</div>
        <div style={{ height: 6, background: A.ink, margin: "28px 60px" }} />
        <div style={{ fontFamily: SUB, fontWeight: 1000, fontSize: 52, color: A.ink, lineHeight: 1.2 }}>8 филиалов в Душанбе</div>
        <div style={{ fontFamily: SUB, fontWeight: 900, fontSize: 40, color: A.ink, marginTop: 10 }}>
          новый — <span style={{ background: A.gold, padding: "0 10px" }}>Домпечать</span>, рядом с Алфемо
        </div>
      </div>
      <div style={{ position: "absolute", top: 1240, textAlign: "center", scale: String(ip(t, [3.0, 3.35], [0, 1], BACK) * (1 + Math.sin(t * 6) * 0.03)) }}>
        <div style={{ fontFamily: SUB, fontWeight: 1000, fontSize: 64, color: A.white, WebkitTextStroke: `10px ${A.ink}`, paintOrder: "stroke" }}>Следующий герой — ты!</div>
        <div style={{ marginTop: 18, display: "inline-block", fontFamily: SUB, fontWeight: 1000, fontSize: 54, color: A.ink, background: `linear-gradient(180deg, #FFE27A, ${A.gold})`, border: `6px solid ${A.ink}`, borderRadius: 999, padding: "18px 48px" }}>Запишись на пробный урок</div>
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: ip(t, [5.3, 5.8], [0, 1], EASE_IN) }} />
    </AbsoluteFill>
  );
};
