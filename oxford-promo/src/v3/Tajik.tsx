import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BODY, COLORS, DISPLAY } from "../theme";
import { BACK, EASE_IN, EASE_OUT, Marker, Photo, Preload, Rise, Shockwave, ip, photo } from "./fx";
import { AF_PATH, KG_PATH, TJ_PATH, UZ_PATH } from "./geo2d";
import { SCENES, VO } from "./timeline";

const T0 = SCENES.tajik[0];
const OX = 40;
const OY = 640;
const DU = { x: OX + 187.3, y: OY + 412.6 };
const CITIES = [
  { n: "Худжанд", x: 294.3, y: 133.2 },
  { n: "Бохтар", x: 187.3, y: 528.1 },
  { n: "Куляб", x: 313.9, y: 518.5 },
  { n: "Хорог", x: 899, y: 584.7 },
];

export const TajikV3: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const tH = VO.s06 - T0;
  const zoom = ip(t, [4.3, 5.8], [0, 1], EASE_IN);
  const s = Math.exp(Math.log(16) * zoom);
  const draw = ip(t, [0.5, 2.0], [0, 1], (x) => x * x * (3 - 2 * x));
  const fill = ip(t, [1.4, 2.2], [0, 1]);
  const textOut = ip(t, [4.1, 4.5], [1, 0]);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <Preload srcs={[photo("mountains-2.jpg")]} />
      <Photo src={photo("mountains-1.jpg")} t={t} from={0} to={6} zoom={[1.15, 1.35]} pan={[0, 0, -40, 30]} tone={0.85} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${COLORS.ink}cc 0%, ${COLORS.ink}55 35%, ${COLORS.ink}aa 100%)` }} />

      <div style={{ position: "absolute", inset: 0, transformOrigin: `${DU.x}px ${DU.y}px`, scale: String(s), filter: `blur(${zoom * 6}px)` }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <defs>
            <clipPath id="tjclip">
              <path d={TJ_PATH} transform={`translate(${OX} ${OY})`} />
            </clipPath>
            <pattern id="dots3" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="6" cy="6" r="1.6" fill={COLORS.white} opacity={0.35} />
            </pattern>
            <filter id="gl3">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          <g transform={`translate(${OX} ${OY})`} opacity={ip(t, [0.2, 1], [0, 0.5])}>
            {[UZ_PATH, KG_PATH, AF_PATH].map((d, i) => (
              <path key={i} d={d} fill={COLORS.ink} fillOpacity={0.5} stroke={COLORS.mute} strokeOpacity={0.5} strokeWidth={1.5} />
            ))}
          </g>
          <g clipPath="url(#tjclip)" opacity={fill}>
            <image href={photo("mountains-2.jpg")} x={-200} y={OY - 150} width={1500} height={1000} preserveAspectRatio="xMidYMid slice" style={{ filter: "grayscale(1) contrast(1.2)" }} />
            <rect x={0} y={OY} width={1080} height={760} fill={COLORS.royal} opacity={0.55} style={{ mixBlendMode: "multiply" }} />
            <rect x={0} y={OY} width={1080} height={760} fill="url(#dots3)" />
          </g>
          <path d={TJ_PATH} transform={`translate(${OX} ${OY})`} fill="none" stroke={COLORS.gold} strokeWidth={9} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} filter="url(#gl3)" opacity={0.8} />
          <path d={TJ_PATH} transform={`translate(${OX} ${OY})`} fill="none" stroke={COLORS.goldSoft} strokeWidth={3.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} strokeLinejoin="round" />
          {CITIES.map((c, i) => {
            const a = 2.0 + i * 0.1;
            return (
              <g key={c.n} opacity={ip(t, [a, a + 0.2], [0, 1]) * textOut}>
                <circle cx={OX + c.x} cy={OY + c.y} r={7 * ip(t, [a, a + 0.3], [0, 1], BACK)} fill={COLORS.white} />
                <text x={OX + c.x + 16} y={OY + c.y + 8} fill={COLORS.white} fontFamily={BODY} fontWeight={700} fontSize={26}>
                  {c.n}
                </text>
              </g>
            );
          })}
          {/* the heart */}
          {t > tH &&
            [0, 1, 2].map((k) => {
              const ph = (((t - tH) / 0.9 + k / 3) % 1 + 1) % 1;
              return <circle key={k} cx={DU.x} cy={DU.y} r={14 + ph * 90} fill="none" stroke={COLORS.gold} strokeWidth={4} opacity={1 - ph} />;
            })}
          <circle cx={DU.x} cy={DU.y} r={16 * ip(t, [tH, tH + 0.3], [0, 1], BACK) * (1 + 0.15 * Math.max(0, Math.sin((t - tH) * 7)))} fill={COLORS.gold} stroke={COLORS.ink} strokeWidth={4} />
        </svg>
        <div style={{ position: "absolute", left: DU.x, top: DU.y - 70, translate: "-50% -100%", padding: "12px 28px", borderRadius: 999, background: COLORS.gold, color: COLORS.ink, fontFamily: DISPLAY, fontWeight: 900, fontSize: 32, letterSpacing: 3, scale: String(ip(t, [tH + 0.2, tH + 0.5], [0, 1], BACK)), boxShadow: `0 0 50px ${COLORS.gold}aa`, whiteSpace: "nowrap" }}>
          ДУШАНБЕ
        </div>
      </div>
      <Shockwave t={t} at={tH} x={DU.x} y={DU.y} max={500} />

      <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", opacity: textOut }}>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 40, letterSpacing: 18, color: COLORS.goldSoft, opacity: ip(t, [0.3, 0.6], [0, 1]) }}>ЭТО</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 82, color: COLORS.white, textShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>
          <Rise text="ТАДЖИКИСТАН" t={t} at={0.4} stagger={0.03} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 1440, width: "100%", textAlign: "center", opacity: textOut }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, color: COLORS.white, opacity: ip(t, [tH, tH + 0.3], [0, 1]), translate: `0px ${ip(t, [tH, tH + 0.4], [40, 0], EASE_OUT)}px` }}>Его сердце —</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 110, color: COLORS.ink, marginTop: 10, opacity: ip(t, [tH + 0.6, tH + 0.7], [0, 1]) }}>
          <Marker t={t} at={tH + 0.6}>ДУШАНБЕ</Marker>
        </div>
      </div>
      <AbsoluteFill style={{ backgroundColor: COLORS.goldSoft, mixBlendMode: "screen", opacity: ip(t, [5.3, 5.8], [0, 1], EASE_IN) }} />
    </AbsoluteFill>
  );
};
