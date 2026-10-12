import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { BODY, COLORS, DISPLAY } from "../theme";
import { BACK, EASE_IN, EASE_OUT, Glitch, Rise, Shockwave, ip, photo } from "./fx";
import { BRANCHES, CENTER, CityBase } from "./cityMap";
import { SCENES, VO } from "./timeline";

const T0 = SCENES.city[0];
const L = (g: number) => g - T0;
const NAMES = BRANCHES.map((_, i) => L(VO[`n${i + 1}` as keyof typeof VO]));
const T_Q = L(VO.s08);
const T_SEARCH = L(VO.s09);
const T_FOUND = L(VO.s10);
const END = SCENES.city[1] - T0;

const Pin: React.FC<{ b: (typeof BRANCHES)[number]; t: number; at: number; dim: number }> = ({ b, t, at, dim }) => {
  if (t < at - 0.05) return null;
  const drop = ip(t, [at, at + 0.4], [0, 1], BACK);
  const full = ip(t, [at + 0.15, at + 0.4, at + 1.7, at + 2.0], [0, 1, 1, 0]);
  const right = b.side === "right";
  return (
    <div style={{ position: "absolute", left: b.x, top: b.y, opacity: dim }}>
      <svg width={300} height={300} style={{ position: "absolute", left: -150, top: -150, overflow: "visible" }}>
        {[0, 1].map((k) => {
          const p = ip(t, [at + 0.2 + k * 0.15, at + 1.2 + k * 0.15], [0, 1], EASE_OUT);
          return <circle key={k} cx={150} cy={150} r={40 + p * 90} fill="none" stroke={COLORS.sky} strokeWidth={4} opacity={(1 - p) * 0.9} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: -48, top: -48, width: 96, height: 96, borderRadius: 48, overflow: "hidden", border: `5px solid ${COLORS.sky}`, boxShadow: `0 0 30px ${COLORS.sky}88, 0 10px 30px rgba(0,0,0,0.6)`, scale: String(drop), translate: `0px ${(1 - drop) * -120}px` }}>
        <Img src={photo(b.img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: 22, top: -58, width: 40, height: 40, borderRadius: 20, background: COLORS.gold, color: COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 900, fontSize: 22, scale: String(ip(t, [at + 0.2, at + 0.45], [0, 1], BACK)) }}>{b.id}</div>
      <div
        style={{
          position: "absolute",
          top: -34,
          [right ? "left" : "right"]: 62,
          padding: "10px 20px",
          borderRadius: 16,
          background: "rgba(5,12,28,0.88)",
          border: `2px solid ${COLORS.sky}88`,
          whiteSpace: "nowrap",
          opacity: ip(t, [at + 0.15, at + 0.35], [0, 1]),
          translate: `${(right ? -1 : 1) * ip(t, [at + 0.15, at + 0.45], [30, 0], EASE_OUT)}px 0px`,
          clipPath: `inset(0 ${right ? ip(t, [at + 0.15, at + 0.45], [100, 0], EASE_OUT) : 0}% 0 ${right ? 0 : ip(t, [at + 0.15, at + 0.45], [100, 0], EASE_OUT)}% round 16px)`,
        }}
      >
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 30, color: COLORS.white }}>{b.name}</div>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 22, color: COLORS.mute, height: 30 * full, opacity: full, overflow: "hidden" }}>{b.address}</div>
      </div>
    </div>
  );
};

const Cross: React.FC<{ x: number; y: number; ok?: boolean; s: number }> = ({ x, y, ok, s }) => (
  <svg width={140} height={140} style={{ position: "absolute", left: x - 70, top: y - 70, scale: String(s) }}>
    <circle cx={70} cy={70} r={50} fill={ok ? COLORS.gold : "#ff4d5e"} opacity={0.95} />
    {ok ? <path d="M48 72 L64 88 L94 54" stroke={COLORS.ink} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M52 52 L88 88 M88 52 L52 88" stroke="#fff" strokeWidth={10} strokeLinecap="round" />}
  </svg>
);

export const CityV3: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const placed = NAMES.filter((s) => t >= s).length;
  const dimMap = ip(t, [T_Q - 0.2, T_Q + 0.3], [1, 0.45]) + ip(t, [T_SEARCH, T_SEARCH + 0.6], [0, 0.35]);
  const pinDim = ip(t, [T_Q - 0.2, T_Q + 0.3], [1, 0.35]) + ip(t, [T_SEARCH, T_SEARCH + 0.6], [0, 0.4]);
  const zoom = ip(t, [T_FOUND + 0.2, END], [0, 1], EASE_IN);
  const camS = ip(t, [0, 2.5], [1.6, 1], EASE_OUT) * (1 + zoom * 2.2);
  const drift = ip(t, [2.5, T_Q], [0, 1], (x) => x);

  // crosshair path during the search
  const keys = [
    { t: T_SEARCH + 0.6, x: 540, y: 300 },
    { t: T_SEARCH + 1.6, x: 860, y: 1400 },
    { t: T_SEARCH + 2.7, x: 220, y: 560 },
    { t: T_SEARCH + 3.9, x: CENTER.x, y: CENTER.y },
  ];
  let cx = keys[0].x;
  let cy = keys[0].y;
  for (let i = 0; i < keys.length - 1; i++) {
    const p = ip(t, [keys[i].t, keys[i + 1].t - 0.35], [0, 1], (x) => x * x * (3 - 2 * x));
    if (t >= keys[i].t) {
      cx = keys[i].x + (keys[i + 1].x - keys[i].x) * p;
      cy = keys[i].y + (keys[i + 1].y - keys[i].y) * p;
    }
  }
  const crossOn = ip(t, [T_SEARCH + 0.4, T_SEARCH + 0.8], [0, 1]) * ip(t, [T_FOUND + 0.6, T_FOUND + 1.0], [1, 0]);
  const locked = t > keys[3].t - 0.3;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <AbsoluteFill style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px`, scale: String(camS), translate: `${(1 - drift) * 0 + drift * -10}px ${drift * 20}px` }}>
        <CityBase t={t} start={0} dim={Math.max(0.25, dimMap)} />
        {BRANCHES.map((b, i) => (
          <Pin key={b.id} b={b} t={t} at={NAMES[i]} dim={Math.max(0.3, pinDim)} />
        ))}

        {/* arrows from every edge of the city to the centre */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {new Array(10).fill(0).map((_, i) => {
            const a = (i / 10) * Math.PI * 2 + 0.2;
            const x0 = CENTER.x + Math.cos(a) * 470;
            const y0 = CENTER.y + Math.sin(a) * 600;
            const s = T_SEARCH + 0.1 + i * 0.06;
            const p = ip(t, [s, s + 0.8], [0, 1], EASE_OUT);
            const o = ip(t, [s, s + 0.2, T_FOUND + 0.8, T_FOUND + 1.1], [0, 0.9, 0.9, 0]);
            const x1 = x0 + (CENTER.x - x0) * 0.82 * p;
            const y1 = y0 + (CENTER.y - y0) * 0.82 * p;
            return (
              <g key={i} opacity={o}>
                <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={COLORS.goldSoft} strokeWidth={5} strokeDasharray="14 12" strokeDashoffset={-t * 80} />
                <circle cx={x0} cy={y0} r={10} fill={COLORS.goldSoft} />
              </g>
            );
          })}
        </svg>

        {/* candidate spots */}
        {t > keys[1].t - 0.1 && <Cross x={keys[1].x} y={keys[1].y} s={ip(t, [keys[1].t - 0.1, keys[1].t + 0.15], [0, 1], BACK) * ip(t, [keys[2].t - 0.1, keys[2].t + 0.2], [1, 0])} />}
        {t > keys[2].t - 0.1 && <Cross x={keys[2].x} y={keys[2].y} s={ip(t, [keys[2].t - 0.1, keys[2].t + 0.15], [0, 1], BACK) * ip(t, [keys[3].t - 0.1, keys[3].t + 0.2], [1, 0])} />}
        {locked && <Cross x={CENTER.x} y={CENTER.y} ok s={ip(t, [keys[3].t - 0.1, keys[3].t + 0.2], [0, 1], BACK) * ip(t, [T_FOUND + 0.6, T_FOUND + 0.9], [1, 0])} />}

        {/* crosshair */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: crossOn }}>
          <g transform={`translate(${cx} ${cy})`}>
            <circle r={locked ? 70 : 95} fill="none" stroke={locked ? COLORS.gold : COLORS.white} strokeWidth={4} strokeDasharray="18 10" transform={`rotate(${t * 90})`} />
            <circle r={8} fill={locked ? COLORS.gold : COLORS.white} />
            <path d="M -140 0 L -50 0 M 50 0 L 140 0 M 0 -140 L 0 -50 M 0 50 L 0 140" stroke={locked ? COLORS.gold : COLORS.white} strokeWidth={4} />
          </g>
          <line x1={0} y1={cy} x2={1080} y2={cy} stroke={COLORS.white} strokeOpacity={0.15} strokeWidth={2} />
          <line x1={cx} y1={0} x2={cx} y2={1920} stroke={COLORS.white} strokeOpacity={0.15} strokeWidth={2} />
        </svg>
      </AbsoluteFill>
      <Shockwave t={t} at={T_FOUND} x={CENTER.x} y={CENTER.y} max={600} />

      {/* header: counter */}
      <div style={{ position: "absolute", top: 120, left: 80, right: 80, display: "flex", alignItems: "center", gap: 28, opacity: ip(t, [0.3, 0.7], [0, 1]) * ip(t, [T_Q - 0.3, T_Q], [1, 0]) }}>
        <div style={{ width: 170, height: 170, borderRadius: 85, border: `5px solid ${COLORS.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 900, fontSize: 110, color: COLORS.gold, boxShadow: `0 0 40px ${COLORS.gold}55`, background: "rgba(5,12,28,0.7)" }}>
          <span key={placed} style={{ display: "inline-block", scale: String(placed ? ip(t, [NAMES[placed - 1], NAMES[placed - 1] + 0.25], [1.6, 1], BACK) : 1) }}>{placed}</span>
        </div>
        <div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 70, lineHeight: 1, color: COLORS.white }}>
            <Rise text="ФИЛИАЛОВ" t={t} at={0.4} stagger={0.03} style={{ justifyContent: "flex-start" }} />
          </div>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 36, color: COLORS.goldSoft, marginTop: 8, opacity: ip(t, [0.8, 1.1], [0, 1]) }}>уже работают в Душанбе</div>
        </div>
      </div>

      {/* question */}
      <div style={{ position: "absolute", top: 220, width: "100%", textAlign: "center", opacity: ip(t, [T_Q, T_Q + 0.1, T_SEARCH - 0.2, T_SEARCH + 0.2], [0, 1, 1, 0]) }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 70, color: COLORS.white }}>
          <Rise text="НО ГДЕ ОТКРОЕТСЯ" t={t} at={T_Q} stagger={0.02} />
        </div>
        <Glitch t={t} at={T_Q + 0.6} amount={30}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 118, color: COLORS.gold, lineHeight: 1.1, scale: String(ip(t, [T_Q + 0.6, T_Q + 0.9], [2.4, 1], EASE_OUT)), opacity: ip(t, [T_Q + 0.6, T_Q + 0.7], [0, 1]), textShadow: `0 0 60px ${COLORS.gold}88` }}>ВОСЬМОЙ?</div>
        </Glitch>
      </div>

      {/* search status */}
      <div style={{ position: "absolute", top: 140, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: ip(t, [T_SEARCH + 0.2, T_SEARCH + 0.5, T_FOUND - 0.2, T_FOUND], [0, 1, 1, 0]) }}>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 34, letterSpacing: 10, color: COLORS.goldSoft }}>ИЩЕМ ИДЕАЛЬНОЕ МЕСТО</div>
        <div style={{ width: 640, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
          <div style={{ width: `${ip(t, [T_SEARCH + 0.3, T_FOUND - 0.3], [0, 100])}%`, height: "100%", background: `linear-gradient(90deg, ${COLORS.sky}, ${COLORS.gold})` }} />
        </div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, color: COLORS.white, fontVariantNumeric: "tabular-nums" }}>{Math.round(ip(t, [T_SEARCH + 0.3, T_FOUND - 0.3], [0, 100]))}%</div>
      </div>
      <div style={{ position: "absolute", top: 1540, width: "100%", textAlign: "center", opacity: ip(t, [T_SEARCH + 0.6, T_SEARCH + 1.0, T_FOUND - 0.2, T_FOUND], [0, 1, 1, 0]) }}>
        <div style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 800, fontSize: 46, lineHeight: 1.25, color: COLORS.white, padding: "18px 34px", borderRadius: 24, background: "rgba(5,12,28,0.8)" }}>
          легко добраться
          <br />
          <span style={{ color: COLORS.gold }}>из любой точки города</span>
        </div>
      </div>

      {/* found it */}
      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", opacity: ip(t, [T_FOUND, T_FOUND + 0.1], [0, 1]) }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 120, color: COLORS.white, scale: String(ip(t, [T_FOUND, T_FOUND + 0.3], [2, 1], EASE_OUT)), filter: `blur(${ip(t, [T_FOUND, T_FOUND + 0.25], [16, 0])}px)` }}>
          И НАШЛИ <span style={{ color: COLORS.gold }}>ЕГО</span>
        </div>
      </div>
      <AbsoluteFill style={{ backgroundColor: "#fff6dc", mixBlendMode: "screen", opacity: ip(t, [END - 0.45, END], [0, 1], EASE_IN) }} />
      <AbsoluteFill style={{ backgroundColor: COLORS.goldSoft, mixBlendMode: "screen", opacity: ip(t, [0, 0.5], [0.9, 0]) }} />
    </AbsoluteFill>
  );
};
