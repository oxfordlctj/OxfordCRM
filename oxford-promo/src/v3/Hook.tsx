import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { BODY, COLORS, DISPLAY } from "../theme";
import { BACK, EASE_IN, EASE_OUT, Flash, Glitch, LightLeak, Preload, Ring, Rise, ip, photo } from "./fx";
import { VO } from "./timeline";

const T1 = VO.s01;
const T2 = VO.s02;
const T3 = VO.s03;
const T4 = VO.s04;

const TILES = ["blog-1.jpg", "course-2.jpg", "hero-banner-1.jpg", "course-1.jpg", "video-banner.jpg", "blog-3.jpg", "hero-banner-2.jpg", "about-banner.jpg", "course-3.jpg"];

/** Act 1: "7" with an echo trail. */
const Seven: React.FC<{ t: number }> = ({ t }) => {
  const out = ip(t, [T2 - 0.12, T2 + 0.15], [0, 1], EASE_IN);
  if (out >= 1) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - out, scale: String(1 + out * 0.6) }}>
      <Ring t={t} x={540} y={900} r={420} speed={14} opacity={ip(t, [T1, T1 + 0.4], [0, 0.7])} />
      <Ring t={-t} x={540} y={900} r={470} speed={9} dash="1 10" color={COLORS.sky} width={4} opacity={ip(t, [T1 + 0.1, T1 + 0.5], [0, 0.6])} />
      {[5, 4, 3, 2, 1, 0].map((k) => {
        const d = k * 0.045;
        const y = ip(t, [T1 + d, T1 + d + 0.5], [700, 0], EASE_OUT);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              top: 330,
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: 900,
              lineHeight: 1,
              translate: `0px ${y + k * 14}px`,
              color: k === 0 ? COLORS.gold : "transparent",
              WebkitTextStroke: k === 0 ? "0px" : `3px ${COLORS.gold}`,
              opacity: k === 0 ? 1 : 0.5 - k * 0.07,
              textShadow: k === 0 ? `0 30px 80px rgba(0,0,0,0.5)` : "none",
            }}
          >
            7
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 1330, fontFamily: DISPLAY, fontWeight: 900, fontSize: 92, color: COLORS.white, letterSpacing: 4 }}>
        <Rise text="ФИЛИАЛОВ" t={t} at={T1 + 0.25} />
      </div>
    </AbsoluteFill>
  );
};

/** Act 2: photo mosaic of students. */
const Students: React.FC<{ t: number }> = ({ t }) => {
  if (t < T2 - 0.05 || t > T3 + 0.3) return null;
  const out = ip(t, [T3 - 0.15, T3 + 0.2], [0, 1], EASE_IN);
  const size = 360;
  return (
    <AbsoluteFill>
      {TILES.map((src, i) => {
        const r = Math.floor(i / 3);
        const c = i % 3;
        const order = Math.abs(r - 1) + Math.abs(c - 1);
        const s = T2 + order * 0.07;
        const p = ip(t, [s, s + 0.35], [0, 1], BACK);
        return (
          <div
            key={src}
            style={{
              position: "absolute",
              left: c * size,
              top: 420 + r * size,
              width: size,
              height: size,
              overflow: "hidden",
              scale: String(p * (1 - out * 0.2)),
              rotate: `${(1 - p) * (c - 1) * 20}deg`,
              translate: `${out * (c - 1) * 600}px ${out * (r - 1) * 900}px`,
              border: `3px solid ${COLORS.ink}`,
            }}
          >
            <Img src={photo(src)} style={{ width: "100%", height: "100%", objectFit: "cover", scale: String(1.15 - (t - s) * 0.05), filter: "saturate(0.9)" }} />
          </div>
        );
      })}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${COLORS.ink}00 30%, ${COLORS.ink}cc 70%)` }} />
      <div style={{ position: "absolute", top: 1180, width: "100%", textAlign: "center", opacity: 1 - out }}>
        <Glitch t={t} at={T2 + 0.15}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 150, color: COLORS.white, lineHeight: 1, scale: String(ip(t, [T2 + 0.15, T2 + 0.4], [1.6, 1], EASE_OUT)), opacity: ip(t, [T2 + 0.15, T2 + 0.22], [0, 1]) }}>ТЫСЯЧИ</div>
        </Glitch>
        <div style={{ display: "inline-block", marginTop: 20, padding: "8px 30px", background: COLORS.gold, color: COLORS.ink, fontFamily: DISPLAY, fontWeight: 900, fontSize: 80, scale: String(ip(t, [T2 + 0.45, T2 + 0.75], [0, 1], BACK)), rotate: "-2deg" }}>СТУДЕНТОВ</div>
      </div>
    </AbsoluteFill>
  );
};

/** Act 3: OXFORD with photos running inside the letters. */
const One: React.FC<{ t: number }> = ({ t }) => {
  if (t < T3 - 0.1 || t > T4 + 0.3) return null;
  const out = ip(t, [T4 - 0.15, T4 + 0.2], [0, 1], EASE_IN);
  const circle = ip(t, [T3, T3 + 0.6], [0, 1], EASE_OUT);
  return (
    <AbsoluteFill style={{ alignItems: "center", opacity: 1 - out, scale: String(1 - out * 0.15) }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <circle cx={540} cy={960} r={circle * 460} fill={COLORS.royal} opacity={0.35} />
        <circle cx={540} cy={960} r={circle * 520} fill="none" stroke={COLORS.gold} strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", top: 700, fontFamily: BODY, fontWeight: 800, fontSize: 46, letterSpacing: ip(t, [T3, T3 + 0.8], [40, 16], EASE_OUT), color: COLORS.goldSoft, opacity: ip(t, [T3, T3 + 0.3], [0, 1]) }}>
        ОДИН БОЛЬШОЙ
      </div>
      <div
        style={{
          position: "absolute",
          top: 790,
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: 200,
          lineHeight: 1.1,
          // eslint-disable-next-line @remotion/no-background-image -- preloaded via <Preload>
          backgroundImage: `url(${photo("video-banner.jpg")})`,
          backgroundSize: "160% auto",
          backgroundPosition: `${ip(t, [T3, T4 + 0.3], [0, 100])}% 40%`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          WebkitTextStroke: `3px ${COLORS.white}`,
          scale: String(ip(t, [T3 + 0.1, T3 + 0.5], [0.6, 1], BACK)),
          opacity: ip(t, [T3 + 0.1, T3 + 0.25], [0, 1]),
        }}
      >
        OXFORD
      </div>
      <div style={{ position: "absolute", top: 1050, width: ip(t, [T3 + 0.4, T3 + 0.9], [0, 700], EASE_OUT), height: 8, background: COLORS.gold, borderRadius: 4, boxShadow: `0 0 30px ${COLORS.gold}` }} />
    </AbsoluteFill>
  );
};

/** Act 4: growth bars — seven blue, the eighth is gold and still a question. */
const Grow: React.FC<{ t: number }> = ({ t }) => {
  if (t < T4 - 0.1) return null;
  const heights = [220, 280, 330, 380, 440, 500, 560];
  const iris = ip(t, [6.9, 7.4], [0, 1], EASE_IN);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 260, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 66, color: COLORS.white }}>
          <Rise text="И МЫ ПРОДОЛЖАЕМ" t={t} at={T4} stagger={0.02} />
        </div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 170, color: COLORS.gold, lineHeight: 1.1, textShadow: `0 0 60px ${COLORS.gold}66` }}>
          <Rise text="РАСТИ" t={t} at={T4 + 0.35} stagger={0.05} />
        </div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <line x1={90} y1={1560} x2={990} y2={1560} stroke={COLORS.mute} strokeWidth={3} opacity={ip(t, [T4, T4 + 0.3], [0, 0.6])} />
        {heights.map((h, i) => {
          const s = T4 + 0.3 + i * 0.07;
          const hh = ip(t, [s, s + 0.45], [0, h], BACK);
          return <rect key={i} x={110 + i * 108} y={1560 - hh} width={78} height={hh} rx={10} fill={COLORS.sky} opacity={0.35 + i * 0.08} />;
        })}
        {(() => {
          const s = T4 + 1.0;
          const hh = ip(t, [s, s + 0.6], [0, 680], BACK);
          return (
            <g>
              <rect x={110 + 7 * 108} y={1560 - hh} width={78} height={hh} rx={10} fill={COLORS.gold} />
              <text x={110 + 7 * 108 + 39} y={1560 - hh - 30} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={64} fill={COLORS.gold} opacity={ip(t, [s + 0.4, s + 0.6], [0, 1])}>
                8?
              </text>
            </g>
          );
        })()}
      </svg>
      {/* iris out of the gold bar into the next scene */}
      <AbsoluteFill style={{ background: COLORS.ink, clipPath: `circle(${iris * 150}% at ${(110 + 7 * 108 + 39) / 10.8}% ${(1560 - 340) / 19.2}%)` }} />
    </AbsoluteFill>
  );
};

export const HookV3: React.FC = () => {
  const t = useCurrentFrame() / 30;
  return (
    <AbsoluteFill>
      <Preload srcs={[photo("video-banner.jpg")]} />
      <div style={{ position: "absolute", top: 958, left: ip(t, [0.0, 0.4], [-1000, 1200], EASE_IN), width: 900, height: 4, background: "linear-gradient(90deg, transparent, #fff, transparent)", boxShadow: `0 0 50px 14px ${COLORS.gold}88`, opacity: ip(t, [0, 0.08, 0.35, 0.45], [0, 1, 1, 0]) }} />
      <Seven t={t} />
      <Students t={t} />
      <One t={t} />
      <Grow t={t} />
      <Flash t={t} at={T1} peak={0.5} />
      <Flash t={t} at={T2} peak={0.4} dur={0.3} />
      <LightLeak t={t} at={T3 - 0.2} dur={1.4} />
    </AbsoluteFill>
  );
};
