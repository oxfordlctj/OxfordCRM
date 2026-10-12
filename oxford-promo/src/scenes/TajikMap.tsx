import { evolvePath } from "@remotion/paths";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AFGHANISTAN, KYRGYZSTAN, TAJIKISTAN, UZBEKISTAN } from "../data/geo";
import { SplitText } from "../components/SplitText";
import { BACK, BODY, COLORS, DISPLAY, EASE_IN, EASE_IN_OUT, ip } from "../theme";

// Map frame (1000x720) placed on the 1080x1920 canvas.
const OX = 40;
const OY = 600;
const DUSHANBE = { x: 187.3, y: 412.6 };

const CITIES = [
  { name: "Худжанд", x: 294.3, y: 133.2, dx: 18, anchor: "start" },
  { name: "Бохтар", x: 187.3, y: 528.1, dx: -18, anchor: "end" },
  { name: "Куляб", x: 313.9, y: 518.5, dx: 18, anchor: "start" },
  { name: "Хорог", x: 899, y: 584.7, dx: -18, anchor: "end" },
] as const;

const NEIGHBOURS = [
  { name: "УЗБЕКИСТАН", x: -10, y: 64 },
  { name: "КЫРГЫЗСТАН", x: 620, y: 95 },
  { name: "АФГАНИСТАН", x: 560, y: 760 },
];

export const TajikMap: React.FC = () => {
  const frame = useCurrentFrame();

  // camera: gentle push, then dive into Dushanbe
  const dive = ip(frame, [148, 210], [0, 1], EASE_IN);
  const scale = Math.exp(Math.log(18) * dive) * ip(frame, [0, 148], [0.92, 1], EASE_IN_OUT);
  const fx = 540 + (OX + DUSHANBE.x - 540) * ip(frame, [140, 200], [0, 1], EASE_IN_OUT);
  const fy = 960 + (OY + DUSHANBE.y - 960) * ip(frame, [140, 200], [0, 1], EASE_IN_OUT);

  const outline = evolvePath(ip(frame, [6, 66], [0, 1], EASE_IN_OUT), TAJIKISTAN);
  const reveal = ip(frame, [40, 100], [0, 1200]);
  const textOut = ip(frame, [140, 156], [1, 0]);
  const pulse = (frame - 92) / 30;

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="tjFill" x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0" stopColor={COLORS.royal} stopOpacity={0.75} />
            <stop offset="1" stopColor={COLORS.navy} stopOpacity={0.95} />
          </linearGradient>
          <pattern id="dots" width="11" height="11" patternUnits="userSpaceOnUse">
            <circle cx="5.5" cy="5.5" r="1.6" fill={COLORS.sky} opacity={0.55} />
          </pattern>
          <radialGradient id="soft">
            <stop offset="0.7" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask id="revealMask" maskUnits="userSpaceOnUse" x="-500" y="-500" width="2000" height="2000">
            <circle cx={DUSHANBE.x} cy={DUSHANBE.y} r={reveal} fill="url(#soft)" />
          </mask>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <clipPath id="tjClip">
            <path d={TAJIKISTAN} />
          </clipPath>
        </defs>

        <g transform={`translate(540 960) scale(${scale}) translate(${-fx} ${-fy})`}>
          <g transform={`translate(${OX} ${OY})`}>
            <g opacity={ip(frame, [0, 30], [0, 1])}>
              {[UZBEKISTAN, KYRGYZSTAN, AFGHANISTAN].map((d, i) => (
                <path key={i} d={d} fill={COLORS.navy} fillOpacity={0.55} stroke={COLORS.mute} strokeOpacity={0.3} strokeWidth={1.5} />
              ))}
            </g>
            <g mask="url(#revealMask)">
              <path d={TAJIKISTAN} fill="url(#tjFill)" />
              <path d={TAJIKISTAN} fill="url(#dots)" />
              {/* topographic rings over the Pamirs */}
              <g clipPath="url(#tjClip)" opacity={0.35}>
                {new Array(9).fill(0).map((_, i) => (
                  <ellipse key={i} cx={760} cy={430} rx={60 + i * 42} ry={36 + i * 26} fill="none" stroke={COLORS.sky} strokeWidth={1.2} />
                ))}
              </g>
            </g>
            <path d={TAJIKISTAN} fill="none" stroke={COLORS.gold} strokeWidth={7} filter="url(#glow)" opacity={0.8} strokeDasharray={outline.strokeDasharray} strokeDashoffset={outline.strokeDashoffset} />
            <path d={TAJIKISTAN} fill="none" stroke={COLORS.goldSoft} strokeWidth={3} strokeLinejoin="round" strokeDasharray={outline.strokeDasharray} strokeDashoffset={outline.strokeDashoffset} />

            <g opacity={ip(frame, [60, 84], [0, 1]) * textOut}>
              {NEIGHBOURS.map((n) => (
                <text key={n.name} x={n.x} y={n.y} fill={COLORS.mute} fontFamily={BODY} fontWeight={700} fontSize={24} letterSpacing={6} opacity={0.75}>
                  {n.name}
                </text>
              ))}
              <text x={760} y={500} textAnchor="middle" fill={COLORS.sky} fontFamily={BODY} fontWeight={700} fontSize={22} letterSpacing={10} opacity={0.6}>
                ПАМИР
              </text>
            </g>

            {CITIES.map((c, i) => {
              const s = 70 + i * 5;
              const p = ip(frame, [s, s + 14], [0, 1], BACK);
              return (
                <g key={c.name} opacity={ip(frame, [s, s + 8], [0, 1]) * textOut}>
                  <circle cx={c.x} cy={c.y} r={7 * p} fill={COLORS.white} />
                  <text x={c.x + c.dx} y={c.y + 8} textAnchor={c.anchor} fill={COLORS.white} fontFamily={BODY} fontWeight={700} fontSize={24}>
                    {c.name}
                  </text>
                </g>
              );
            })}

            {/* Dushanbe */}
            <g opacity={ip(frame, [88, 96], [0, 1])}>
              {[0, 1, 2].map((k) => {
                const ph = (((pulse + k / 3) % 1) + 1) % 1;
                return frame > 92 ? (
                  <circle key={k} cx={DUSHANBE.x} cy={DUSHANBE.y} r={10 + ph * 60} fill="none" stroke={COLORS.gold} strokeWidth={3} opacity={1 - ph} />
                ) : null;
              })}
              <circle cx={DUSHANBE.x} cy={DUSHANBE.y} r={22} fill={COLORS.gold} opacity={0.35} filter="url(#glow)" />
              <circle cx={DUSHANBE.x} cy={DUSHANBE.y} r={11 * ip(frame, [88, 102], [0, 1], BACK)} fill={COLORS.gold} stroke={COLORS.ink} strokeWidth={3} />
              <g opacity={textOut}>
                <rect x={DUSHANBE.x - 128} y={DUSHANBE.y - 92} width={256} height={54} rx={27} fill={COLORS.gold} opacity={ip(frame, [96, 108], [0, 1])} />
                <text x={DUSHANBE.x} y={DUSHANBE.y - 54} textAnchor="middle" fill={COLORS.ink} fontFamily={DISPLAY} fontWeight={800} fontSize={28} letterSpacing={3} opacity={ip(frame, [100, 110], [0, 1])}>
                  ДУШАНБЕ
                </text>
              </g>
            </g>
          </g>
        </g>
      </svg>

      <div style={{ position: "absolute", top: 230, width: "100%", opacity: textOut }}>
        <SplitText
          text="ТАДЖИКИСТАН"
          start={30}
          stagger={2}
          duration={20}
          mode="rise"
          style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 76, color: COLORS.white, letterSpacing: 2 }}
        />
        <div
          style={{
            marginTop: 26,
            textAlign: "center",
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 40,
            color: COLORS.goldSoft,
            letterSpacing: 2,
            opacity: ip(frame, [56, 74], [0, 1]),
          }}
        >
          Oxford растёт вместе со страной
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1480,
          width: "100%",
          textAlign: "center",
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 58,
          color: COLORS.white,
          opacity: ip(frame, [110, 124], [0, 1]) * textOut,
          translate: `0px ${ip(frame, [110, 130], [40, 0])}px`,
        }}
      >
        Всё начинается
        <br />с <span style={{ color: COLORS.gold }}>Душанбе</span>
      </div>
      {/* flash as we land in the city */}
      <AbsoluteFill style={{ backgroundColor: COLORS.goldSoft, opacity: ip(frame, [192, 210], [0, 0.85], EASE_IN), mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
