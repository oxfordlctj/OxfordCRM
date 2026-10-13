import React from "react";

// Cel-shaded anime palette for Ren (original character).
export const LINE = "#1E1517";
const SKIN = "#FBE3D3";
const SKIN_S = "#E8B7A2";
const SKIN_D = "#CF9682";
const HAIR = "#1A1B29";
const HAIR_S = "#0B0B14";
const HAIR_H = "#4A5C96";
const VEST = "#252B47";
const VEST_S = "#161A2E";
const VEST_H = "#3D4876";
const SHIRT = "#F4F4F7";
const SHIRT_S = "#C7CBDA";
const PANTS = "#363C4F";
const PANTS_S = "#22262F";
const RED = "#C9283B";
const RED_S = "#8C1525";
const RED_H = "#E8505F";
const GOLD = "#E9B949";
const WRAP = "#E2DED6";
const WRAP_S = "#B3ADA2";
const METAL = "#C3CBD8";
const METAL_S = "#8E98AA";
const SOLE = "#3A3030";

const OUT = 5.5; // silhouette line
const IN = 3; // inner line

export type P = [number, number];

const f1 = (n: number) => n.toFixed(1);

/** Tapered, slightly bulging limb between two joints. */
export const limb = (a: P, b: P, w1: number, w2: number, bulge = 6) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l;
  const ny = dx / l;
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const wm = (w1 + w2) / 4 + bulge;
  return (
    `M ${f1(a[0] + (nx * w1) / 2)} ${f1(a[1] + (ny * w1) / 2)} ` +
    `Q ${f1(mx + nx * wm)} ${f1(my + ny * wm)} ${f1(b[0] + (nx * w2) / 2)} ${f1(b[1] + (ny * w2) / 2)} ` +
    `L ${f1(b[0] - (nx * w2) / 2)} ${f1(b[1] - (ny * w2) / 2)} ` +
    `Q ${f1(mx - nx * wm)} ${f1(my - ny * wm)} ${f1(a[0] - (nx * w1) / 2)} ${f1(a[1] - (ny * w1) / 2)} Z`
  );
};

/** Cel shadow strip along one side (side = +1 / -1) of a limb. */
export const limbShade = (a: P, b: P, w1: number, w2: number, side: 1 | -1, k = 0.42, bulge = 6) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  const nx = (-dy / l) * side;
  const ny = (dx / l) * side;
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const wm = (w1 + w2) / 4 + bulge;
  const inner = 0.5 - k;
  return (
    `M ${f1(a[0] + (nx * w1) / 2)} ${f1(a[1] + (ny * w1) / 2)} ` +
    `Q ${f1(mx + nx * wm)} ${f1(my + ny * wm)} ${f1(b[0] + (nx * w2) / 2)} ${f1(b[1] + (ny * w2) / 2)} ` +
    `L ${f1(b[0] + nx * w2 * inner)} ${f1(b[1] + ny * w2 * inner)} ` +
    `Q ${f1(mx + nx * (wm * 0.2))} ${f1(my + ny * (wm * 0.2))} ${f1(a[0] + nx * w1 * inner)} ${f1(a[1] + ny * w1 * inner)} Z`
  );
};

const lerp = (a: P, b: P, k: number): P => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

type HandKind = "fist" | "open" | "thumb" | "relaxed";

/** A hand at the wrist, oriented along the forearm. side mirrors the thumb. */
const Hand: React.FC<{ el: P; wr: P; kind: HandKind; side: 1 | -1 }> = ({ el, wr, kind, side }) => {
  const ang = (Math.atan2(wr[1] - el[1], wr[0] - el[0]) * 180) / Math.PI;
  return (
    <g transform={`translate(${f1(wr[0])} ${f1(wr[1])}) rotate(${f1(ang)}) scale(1 ${side})`}>
      {kind === "open" ? (
        <>
          <path d="M -6 -26 L 44 -30 Q 54 -28 54 -18 L 54 22 Q 52 30 40 30 L -6 26 Z" fill={SKIN} stroke={LINE} strokeWidth={OUT} />
          {[-22, -8, 6, 20].map((y, i) => {
            const L = i === 1 || i === 2 ? 8 : 0;
            return <path key={i} d={`M 50 ${y - 6} L ${86 + L} ${y - 5} Q ${94 + L} ${y} ${86 + L} ${y + 5} L 50 ${y + 6}`} fill={SKIN} stroke={LINE} strokeWidth={IN + 0.5} />;
          })}
          <path d="M 20 -28 Q 30 -60 52 -64 Q 60 -58 50 -48 Q 40 -40 36 -26 Z" fill={SKIN} stroke={LINE} strokeWidth={IN + 0.5} />
          <path d="M -6 10 L 40 14 L 40 26 L -6 26 Z" fill={SKIN_S} />
        </>
      ) : kind === "relaxed" ? (
        <>
          <path d="M -6 -26 Q 40 -34 66 -16 Q 80 0 70 18 Q 50 34 -6 26 Z" fill={SKIN} stroke={LINE} strokeWidth={OUT} />
          <path d="M 40 -24 Q 62 -6 46 16 M 22 -26 Q 40 -4 26 20" stroke={SKIN_D} strokeWidth={IN} fill="none" />
          <path d="M -6 12 Q 30 30 66 12 L 62 22 Q 30 36 -6 26 Z" fill={SKIN_S} />
        </>
      ) : (
        <>
          <path d="M -6 -30 Q 30 -40 60 -26 Q 76 -6 70 16 Q 60 36 30 36 L -6 30 Z" fill={SKIN} stroke={LINE} strokeWidth={OUT} />
          <path d="M 58 -18 L 40 -16 M 64 0 L 42 0 M 62 16 L 42 14" stroke={SKIN_D} strokeWidth={IN} />
          <path d="M -6 16 Q 30 30 66 16 L 60 30 Q 30 40 -6 30 Z" fill={SKIN_S} />
          {kind === "thumb" ? (
            <>
              <path d="M 40 -34 Q 44 -64 74 -70 L 112 -66 Q 136 -58 124 -36 L 74 -24 Z" fill={SKIN} stroke={LINE} strokeWidth={OUT} />
              <path d="M 104 -64 Q 124 -58 122 -42 L 104 -44 Z" fill="#FFF3EC" stroke={LINE} strokeWidth={2} />
              <path d="M 74 -24 Q 96 -30 120 -38" stroke={SKIN_D} strokeWidth={IN} fill="none" />
              {[4, 22, 40].map((x) => (
                <path key={x} d={`M ${x} 32 q 9 14 18 0`} stroke={LINE} strokeWidth={IN} fill={SKIN} />
              ))}
            </>
          ) : (
            <path d="M 14 -32 Q 36 -44 52 -30 Q 50 -18 30 -16 Z" fill={SKIN} stroke={LINE} strokeWidth={IN + 0.5} />
          )}
        </>
      )}
    </g>
  );
};

export type Pose = "stand" | "wide" | "throw" | "fall" | "seal" | "thumbs" | "point";
export type Mouth = "calm" | "shout" | "grin" | "smile" | "grit";

type Rig = {
  shL: P;
  elL: P;
  wrL: P;
  hL: HandKind;
  shR: P;
  elR: P;
  wrR: P;
  hR: HandKind | "hip";
  knL: P;
  anL: P;
  knR: P;
  anR: P;
  rFront?: boolean;
};

const BASE = { shL: [-168, -1318] as P, shR: [168, -1318] as P };
const RIGS: Record<Pose, Rig> = {
  stand: { ...BASE, elL: [-212, -1092], wrL: [-204, -872], hL: "relaxed", elR: [282, -1112], wrR: [160, -962], hR: "hip", knL: [-92, -488], anL: [-104, -96], knR: [80, -486], anR: [96, -96] },
  wide: { ...BASE, elL: [-236, -1100], wrL: [-262, -884], hL: "fist", elR: [236, -1100], wrR: [262, -884], hR: "fist", knL: [-150, -500], anL: [-210, -96], knR: [150, -500], anR: [210, -96] },
  throw: { ...BASE, elL: [-280, -1130], wrL: [-150, -1200], hL: "fist", elR: [390, -1290], wrR: [600, -1300], hR: "open", knL: [-120, -490], anL: [-170, -96], knR: [130, -500], anR: [200, -96] },
  fall: { ...BASE, elL: [-330, -1440], wrL: [-400, -1640], hL: "open", elR: [330, -1430], wrR: [420, -1620], hR: "open", knL: [-200, -560], anL: [-170, -200], knR: [120, -560], anR: [260, -330] },
  seal: { ...BASE, elL: [-270, -1140], wrL: [-46, -1196], hL: "fist", elR: [270, -1140], wrR: [46, -1196], hR: "fist", knL: [-130, -496], anL: [-170, -96], knR: [130, -496], anR: [170, -96], rFront: true },
  thumbs: { ...BASE, elL: [-212, -1092], wrL: [-204, -872], hL: "relaxed", elR: [300, -1130], wrR: [262, -1330], hR: "thumb", knL: [-92, -488], anL: [-104, -96], knR: [80, -486], anR: [96, -96], rFront: true },
  point: { ...BASE, elL: [-212, -1092], wrL: [-204, -872], hL: "relaxed", elR: [370, -1250], wrR: [560, -1380], hR: "fist", knL: [-110, -490], anL: [-150, -96], knR: [100, -488], anR: [140, -96] },
};

/**
 * Ren — full-body anime character, cel-shaded.
 * Origin = between the feet; ~1600 units to the top of the skull.
 */
export const RenHD: React.FC<{
  t: number;
  power?: number;
  blink?: boolean;
  id?: string;
  pose?: Pose;
  mouth?: Mouth;
  hurt?: boolean;
  wind?: number;
}> = ({ t, power = 0, blink, id = "ren", pose = "stand", mouth = "calm", hurt, wind = 1 }) => {
  const w = Math.sin(t * 3.1) * wind;
  const w2 = Math.sin(t * 2.3 + 1) * wind;
  const red = power > 0.5;
  const iris = red ? "#D41E36" : "#2E3350";
  const irisD = red ? "#7A0C1C" : "#14172A";
  const R = RIGS[pose];
  const { shL, elL, wrL, shR, elR, wrR, knL, anL, knR, anR } = R;
  const hipL: P = [-66, -880];
  const hipR: P = [64, -880];
  const squint = mouth === "grin" || mouth === "smile";

  const legs = [
    { hip: hipL, kn: knL, an: anL, s: -1 as const },
    { hip: hipR, kn: knR, an: anR, s: 1 as const },
  ];

  const backArm = (
    <g>
      <path d={limb(shR, elR, 84, 66, 8)} fill={SHIRT} stroke={LINE} strokeWidth={OUT} />
      <path d={limbShade(shR, elR, 84, 66, -1, 0.36, 8)} fill={SHIRT_S} />
      <path d={limb(elR, wrR, 68, 54, 6)} fill={VEST} stroke={LINE} strokeWidth={OUT} />
      <path d={limbShade(elR, wrR, 68, 54, -1, 0.34, 6)} fill={VEST_S} />
      {R.hR !== "hip" && <Hand el={elR} wr={wrR} kind={R.hR} side={-1} />}
    </g>
  );

  const guardA = lerp(elL, wrL, 0.2);
  const guardB = lerp(elL, wrL, 0.75);

  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <clipPath id={`${id}-eyeL`}>
          <path d="M -30 -4 Q -4 -17 26 2 Q 18 11 2 13 Q -18 12 -30 -4 Z" />
        </clipPath>
        <clipPath id={`${id}-eyeR`}>
          <path d="M 30 -4 Q 4 -17 -26 2 Q -18 11 -2 13 Q 18 12 30 -4 Z" />
        </clipPath>
      </defs>

      {pose !== "fall" && <ellipse cx={0} cy={6} rx={260} ry={28} fill="#000" opacity={0.14} />}

      {/* red chakra aura */}
      {power > 0 &&
        new Array(14).fill(0).map((_, i) => {
          const x = -280 + i * 42;
          const h = 520 + Math.abs(Math.sin(t * 9 + i * 1.7)) * 620;
          return (
            <path
              key={i}
              d={`M ${x} 0 Q ${x + Math.sin(t * 7 + i) * 60} ${-h * 0.5} ${x + Math.sin(t * 5 + i) * 30} ${-h * 1.4} Q ${x + 40} ${-h * 0.5} ${x + 50} 0 Z`}
              fill={i % 3 === 0 ? "#FF6A4A" : "#E0213B"}
              opacity={0.28 * power}
            />
          );
        })}

      {/* ===== scarf tail (behind) ===== */}
      <path
        d={`M 60 -1330 C 220 ${-1350 + w * 10}, 360 ${-1300 + w * 26}, 520 ${-1370 + w * 40}
            C 470 ${-1310 + w * 30}, 520 ${-1260 + w * 24}, 470 ${-1210 + w * 30}
            C 360 ${-1220 + w * 18}, 240 ${-1250 + w * 10}, 90 -1270 Z`}
        fill={RED}
        stroke={LINE}
        strokeWidth={OUT}
      />
      <path
        d={`M 90 -1270 C 240 ${-1250 + w * 10}, 360 ${-1220 + w * 18}, 470 ${-1210 + w * 30}
            C 430 ${-1240 + w * 26}, 330 ${-1250 + w * 16}, 230 ${-1280 + w * 10} Z`}
        fill={RED_S}
      />
      <path d={`M 250 ${-1310 + w * 14} C 330 ${-1300 + w * 20}, 400 ${-1290 + w * 28}, 470 ${-1320 + w * 36}`} stroke={RED_S} strokeWidth={IN} fill="none" />

      {/* ===== back hair mass ===== */}
      <path
        d={`M -100 -1440 L -150 -1400 L -138 -1462 L -205 -1470 L -150 -1520 L -232 -1580 L -150 -1600
            L -184 -1670 L -104 -1662 L -98 -1726 L -36 -1686 L 4 -1744 L 40 -1690 L 106 -1730
            L 108 -1664 L 190 -1676 L 152 -1610 L 226 -1592 L 160 -1530 L 214 -1478 L 146 -1466
            L 158 -1400 L 100 -1440 Z`}
        fill={HAIR}
        stroke={LINE}
        strokeWidth={OUT}
      />
      <path d="M 152 -1610 L 226 -1592 L 160 -1530 L 214 -1478 L 146 -1466 L 158 -1400 L 110 -1450 L 130 -1560 Z" fill={HAIR_S} />

      {/* ===== legs: wide shinobi pants ===== */}
      <path d="M -128 -930 L 128 -930 Q 140 -870 132 -820 L 8 -790 L -8 -790 L -132 -820 Q -140 -870 -128 -930 Z" fill={PANTS} stroke={LINE} strokeWidth={OUT} />
      {legs.map(({ hip, kn, an, s }) => {
        const shinEnd = lerp(kn, an, 0.47);
        const wrapTop = lerp(kn, an, 0.43);
        return (
          <g key={s}>
            <path d={limb(hip, kn, 150, 112, 14)} fill={PANTS} stroke={LINE} strokeWidth={OUT} />
            <path d={limbShade(hip, kn, 150, 112, 1, s < 0 ? 0.3 : 0.38, 14)} fill={PANTS_S} />
            <path d={limb(kn, shinEnd, 112, 116, 10)} fill={PANTS} stroke={LINE} strokeWidth={OUT} />
            <path d={limbShade(kn, shinEnd, 112, 116, 1, 0.34, 10)} fill={PANTS_S} />
            <g stroke={LINE} strokeWidth={IN} fill="none">
              {[0.3, 0.62].map((k) => {
                const p = lerp(hip, kn, k);
                return <path key={k} d={`M ${p[0] + 30 * s} ${p[1] - 10} Q ${p[0]} ${p[1] + 30} ${p[0] - 40 * s} ${p[1] + 4}`} />;
              })}
              {(() => {
                const p = lerp(kn, shinEnd, 0.35);
                return <path d={`M ${p[0] - 40} ${p[1]} Q ${p[0]} ${p[1] + 28} ${p[0] + 40} ${p[1] - 4}`} />;
              })()}
            </g>
            <path d={limb(wrapTop, an, 92, 70, 2)} fill={WRAP} stroke={LINE} strokeWidth={OUT} />
            <path d={limbShade(wrapTop, an, 92, 70, 1, 0.3, 2)} fill={WRAP_S} />
            {[0.15, 0.32, 0.5, 0.68, 0.85].map((k) => {
              const c = lerp(wrapTop, an, k);
              const hw = (92 + (70 - 92) * k) / 2;
              return <path key={k} d={`M ${c[0] - hw + 4} ${c[1] - 8} Q ${c[0]} ${c[1] + 8} ${c[0] + hw - 4} ${c[1] - 2}`} stroke={WRAP_S} strokeWidth={IN} fill="none" />;
            })}
            <path
              d={`M ${shinEnd[0] - 60} ${shinEnd[1] - 30} Q ${shinEnd[0]} ${shinEnd[1] + 26} ${shinEnd[0] + 60} ${shinEnd[1] - 30} L ${shinEnd[0] + 58} ${shinEnd[1] - 6} Q ${shinEnd[0]} ${shinEnd[1] + 44} ${shinEnd[0] - 58} ${shinEnd[1] - 6} Z`}
              fill={PANTS_S}
              stroke={LINE}
              strokeWidth={IN}
            />
            <g transform={`translate(${an[0]} ${an[1]})`}>
              <path
                d={`M -34 6 Q ${s * 4} -10 34 6 Q ${46 + s * 10} 66 ${40 + s * 12} 86 L ${-40 + s * 12} 86 Q ${-46 + s * 10} 66 -34 6 Z`}
                fill={SKIN}
                stroke={LINE}
                strokeWidth={OUT}
              />
              <path d={`M ${-20 + s * 12} 84 L ${-18 + s * 12} 70 M ${s * 12} 84 L ${s * 12} 70 M ${18 + s * 12} 84 L ${18 + s * 12} 72`} stroke={SKIN_D} strokeWidth={IN} />
              <path d={`M ${-50 + s * 12} 86 L ${50 + s * 12} 86 L ${54 + s * 12} 104 L ${-54 + s * 12} 104 Z`} fill={SOLE} stroke={LINE} strokeWidth={OUT} />
              <path d={`M -36 24 L ${s * 12} 78 L 36 24`} stroke={SOLE} strokeWidth={9} fill="none" />
            </g>
          </g>
        );
      })}

      {!R.rFront && backArm}

      {/* ===== torso: sleeveless zipped vest over white shirt ===== */}
      <path
        d="M -168 -1344 Q -196 -1270 -170 -1160 Q -140 -1050 -120 -950 L 120 -950 Q 140 -1050 170 -1160 Q 196 -1270 168 -1344 Q 0 -1372 -168 -1344 Z"
        fill={VEST}
        stroke={LINE}
        strokeWidth={OUT}
      />
      <path d="M 60 -1350 Q 110 -1250 96 -1140 Q 82 -1040 92 -950 L 120 -950 Q 140 -1050 170 -1160 Q 196 -1270 168 -1344 Z" fill={VEST_S} />
      <path d="M -150 -1170 Q -60 -1130 0 -1150 Q 50 -1132 96 -1150 L 90 -1120 Q 0 -1100 -140 -1140 Z" fill={VEST_S} opacity={0.8} />
      <path d="M -176 -1300 Q -186 -1240 -164 -1160" stroke={VEST_H} strokeWidth={7} fill="none" />
      <path d="M 0 -1330 L 0 -950" stroke={LINE} strokeWidth={IN} />
      <path d="M -7 -1320 L -7 -955 M 7 -1320 L 7 -955" stroke={VEST_H} strokeWidth={1.5} />
      <path d="M -120 -1330 Q -100 -1220 -110 -1120 M 120 -1330 Q 100 -1220 110 -1120" stroke={LINE} strokeWidth={IN} fill="none" />
      <path d="M -60 -1040 Q -30 -1030 -10 -1046 M 30 -1010 Q 56 -1000 80 -1016" stroke={VEST_S} strokeWidth={IN} fill="none" />
      <circle cx={-72} cy={-1236} r={22} fill="none" stroke={GOLD} strokeWidth={8} />
      <circle cx={-72} cy={-1236} r={22} fill="none" stroke={LINE} strokeWidth={1.5} />
      <path d="M -168 -1344 Q -190 -1300 -184 -1240 L -150 -1250 Q -152 -1300 -132 -1340 Z" fill={SHIRT} stroke={LINE} strokeWidth={IN} />
      <path d="M 168 -1344 Q 190 -1300 184 -1240 L 150 -1250 Q 152 -1300 132 -1340 Z" fill={SHIRT_S} stroke={LINE} strokeWidth={IN} />

      {/* ===== sash ===== */}
      <path d="M -132 -976 Q 0 -950 132 -976 L 138 -906 Q 0 -880 -138 -906 Z" fill={RED} stroke={LINE} strokeWidth={OUT} />
      <path d="M 40 -958 Q 90 -962 132 -976 L 138 -906 Q 90 -896 40 -890 Z" fill={RED_S} />
      <path d="M -120 -958 Q 0 -936 120 -958" stroke={RED_H} strokeWidth={IN} fill="none" />
      <path d="M -112 -960 Q -92 -980 -70 -956 Q -76 -922 -100 -914 Q -122 -928 -112 -960 Z" fill={RED} stroke={LINE} strokeWidth={OUT} />
      <path d={`M -100 -918 Q ${-120 + w2 * 6} -840 ${-150 + w2 * 18} -760 L ${-110 + w2 * 18} -750 Q ${-90 + w2 * 6} -830 -80 -918 Z`} fill={RED} stroke={LINE} strokeWidth={OUT} />
      <path d={`M -84 -918 Q ${-70 + w2 * 8} -850 ${-80 + w2 * 22} -790 L ${-48 + w2 * 22} -800 Q ${-48 + w2 * 8} -860 -66 -922 Z`} fill={RED_S} stroke={LINE} strokeWidth={OUT} />

      {R.hR === "hip" && (
        <g>
          <path d="M 186 -990 Q 150 -1000 122 -978 Q 104 -952 112 -930 Q 140 -910 176 -926 Q 196 -950 186 -990 Z" fill={SKIN} stroke={LINE} strokeWidth={OUT} />
          <path d="M 122 -978 Q 140 -968 150 -950 M 116 -952 Q 136 -944 148 -930" stroke={SKIN_D} strokeWidth={IN} fill="none" />
          <path d="M 176 -926 Q 196 -950 186 -990 L 170 -982 Q 178 -950 166 -930 Z" fill={SKIN_S} />
        </g>
      )}

      {/* ===== arm in front (viewer-left) ===== */}
      <path d={limb(shL, elL, 86, 66, 8)} fill={SHIRT} stroke={LINE} strokeWidth={OUT} />
      <path d={limbShade(shL, elL, 86, 66, -1, 0.3, 8)} fill={SHIRT_S} />
      <path d={limb(elL, wrL, 70, 54, 6)} fill={VEST} stroke={LINE} strokeWidth={OUT} />
      <path d={limbShade(elL, wrL, 70, 54, -1, 0.34, 6)} fill={VEST_S} />
      <path d={limb(guardA, guardB, 64, 58, 0)} fill={METAL} stroke={LINE} strokeWidth={IN} />
      <path d={limbShade(guardA, guardB, 64, 58, -1, 0.36, 0)} fill={METAL_S} />
      <Hand el={elL} wr={wrL} kind={R.hL} side={1} />

      {R.rFront && backArm}

      {/* ===== neck, collar, scarf ===== */}
      <path d="M -32 -1420 Q -30 -1380 -38 -1350 L 38 -1350 Q 30 -1380 32 -1420 Z" fill={SKIN_S} stroke={LINE} strokeWidth={OUT} />
      <path d="M -78 -1338 L -70 -1408 Q 0 -1424 70 -1408 L 78 -1338 Q 0 -1350 -78 -1338 Z" fill={VEST} stroke={LINE} strokeWidth={OUT} />
      <path d="M 20 -1418 Q 50 -1414 70 -1408 L 78 -1338 Q 50 -1342 26 -1344 Z" fill={VEST_S} />
      <path d="M -66 -1400 Q 0 -1414 66 -1400" stroke={VEST_H} strokeWidth={IN} fill="none" />
      <path d="M -112 -1352 Q -40 -1300 0 -1308 Q 60 -1300 112 -1352 L 118 -1318 Q 40 -1258 -30 -1268 Q -80 -1276 -118 -1316 Z" fill={RED} stroke={LINE} strokeWidth={OUT} />
      <path d="M 30 -1300 Q 70 -1310 112 -1352 L 118 -1318 Q 80 -1286 40 -1272 Z" fill={RED_S} />
      <path d="M -90 -1330 Q -30 -1290 40 -1300" stroke={RED_H} strokeWidth={IN} fill="none" />
      <path d={`M 40 -1290 Q 64 -1220 ${54 + w * 6} -1150 L ${86 + w * 6} -1160 Q 92 -1230 74 -1296 Z`} fill={RED} stroke={LINE} strokeWidth={OUT} />
      <path d={`M 74 -1296 Q 92 -1230 ${86 + w * 6} -1160 L ${74 + w * 6} -1158 Q 80 -1230 62 -1292 Z`} fill={RED_S} />

      {/* ===== head ===== */}
      <path
        d="M -90 -1590 Q -94 -1500 -82 -1468 Q -64 -1430 -22 -1404 Q 0 -1394 22 -1404 Q 64 -1430 82 -1468 Q 94 -1500 90 -1590 Z"
        fill={SKIN}
        stroke={LINE}
        strokeWidth={OUT}
      />
      <path d="M 52 -1590 L 90 -1590 Q 94 -1500 82 -1468 Q 64 -1430 22 -1404 Q 62 -1446 66 -1500 Q 70 -1550 52 -1590 Z" fill={SKIN_S} />
      <path d="M -90 -1560 L 90 -1560 L 90 -1530 Q 60 -1540 40 -1528 Q 20 -1546 0 -1530 Q -24 -1548 -46 -1530 Q -66 -1544 -90 -1532 Z" fill={SKIN_S} />
      <path d="M -90 -1530 Q -114 -1540 -110 -1504 Q -104 -1476 -84 -1480" fill={SKIN} stroke={LINE} strokeWidth={OUT} />
      <path d="M -98 -1520 Q -104 -1504 -94 -1492" stroke={SKIN_D} strokeWidth={IN} fill="none" />
      <path d="M 90 -1530 Q 114 -1540 110 -1504 Q 104 -1476 84 -1480" fill={SKIN_S} stroke={LINE} strokeWidth={OUT} />

      {/* eyes */}
      {[
        { s: -1, clip: `${id}-eyeL` },
        { s: 1, clip: `${id}-eyeR` },
      ].map(({ s, clip }) => (
        <g key={s} transform={`translate(${s * 40} -1500)`}>
          {blink || mouth === "grin" ? (
            <path d={mouth === "grin" ? `M ${28 * s} 4 Q 0 -14 ${-28 * s} 4` : `M ${28 * s} 2 Q 0 10 ${-28 * s} 0`} stroke={LINE} strokeWidth={6} fill="none" />
          ) : (
            <>
              <path d={s < 0 ? "M -30 -4 Q -4 -17 26 2 Q 18 11 2 13 Q -18 12 -30 -4 Z" : "M 30 -4 Q 4 -17 -26 2 Q -18 11 -2 13 Q 18 12 30 -4 Z"} fill="#FFFFFF" />
              <g clipPath={`url(#${clip})`}>
                <ellipse cx={3 * s} cy={1} rx={13} ry={16} fill={iris} />
                <ellipse cx={3 * s} cy={-7} rx={13} ry={8} fill={irisD} opacity={0.85} />
                <ellipse cx={3 * s} cy={7} rx={8} ry={5} fill={red ? "#FF5A6A" : "#5A6390"} opacity={0.8} />
                {red ? (
                  <g transform={`translate(${3 * s} 0) rotate(${t * 360})`}>
                    <circle r={8} fill="none" stroke="#1A0A0E" strokeWidth={1.8} />
                    {[0, 120, 240].map((a) => {
                      const r = (a * Math.PI) / 180;
                      return (
                        <path
                          key={a}
                          d={`M ${Math.cos(r) * 8} ${Math.sin(r) * 8} m -2.6 0 a 2.6 2.6 0 1 0 5.2 0 a 2.6 2.6 0 1 0 -5.2 0 M ${Math.cos(r) * 8 + 2} ${Math.sin(r) * 8} q 3 4 -1 7`}
                          fill="#1A0A0E"
                          stroke="#1A0A0E"
                          strokeWidth={1}
                        />
                      );
                    })}
                    <circle r={2.6} fill="#0B0B12" />
                  </g>
                ) : (
                  <ellipse cx={3 * s} cy={0} rx={4.5} ry={6} fill="#07070D" />
                )}
                <circle cx={3 * s - 5} cy={-6} r={3.6} fill="#FFFFFF" />
                <circle cx={3 * s + 5} cy={5} r={1.6} fill="#FFFFFF" />
                <path d={s < 0 ? "M -30 -4 Q -4 -17 26 2 L 26 8 Q -4 -9 -30 2 Z" : "M 30 -4 Q 4 -17 -26 2 L -26 8 Q 4 -9 30 2 Z"} fill="#000" opacity={0.18} />
              </g>
              <path d={s < 0 ? "M -36 -10 Q -6 -20 27 1 L 30 4" : "M 36 -10 Q 6 -20 -27 1 L -30 4"} stroke={LINE} strokeWidth={7} fill="none" />
              <path d={s < 0 ? "M -36 -10 L -42 -4" : "M 36 -10 L 42 -4"} stroke={LINE} strokeWidth={4} />
              <path d={s < 0 ? "M -20 10 Q 0 15 16 10" : "M 20 10 Q 0 15 -16 10"} stroke={LINE} strokeWidth={2} fill="none" />
            </>
          )}
          <path
            d={
              squint
                ? s < 0
                  ? "M -38 -32 Q -6 -42 28 -30"
                  : "M 38 -32 Q 6 -42 -28 -30"
                : mouth === "shout" || mouth === "grit"
                  ? s < 0
                    ? "M -38 -38 Q -6 -36 28 -14"
                    : "M 38 -38 Q 6 -36 -28 -14"
                  : s < 0
                    ? "M -38 -34 Q -6 -36 28 -18"
                    : "M 38 -34 Q 6 -36 -28 -18"
            }
            stroke={HAIR}
            strokeWidth={7}
            fill="none"
          />
        </g>
      ))}
      {power > 0 && [-1, 1].map((s) => <circle key={s} cx={s * 40} cy={-1500} r={34 * power} fill="#FF2A3D" opacity={0.16 * power} />)}
      <path d="M 6 -1478 L 12 -1452 L 2 -1449" stroke={SKIN_D} strokeWidth={IN} fill="none" />
      {/* mouth */}
      {mouth === "calm" && (
        <>
          <path d="M -16 -1424 Q 0 -1428 18 -1424" stroke={LINE} strokeWidth={4} fill="none" />
          <path d="M -6 -1414 L 8 -1414" stroke={SKIN_D} strokeWidth={2} />
        </>
      )}
      {mouth === "shout" && (
        <g>
          <path d="M -30 -1436 Q 0 -1446 30 -1436 Q 26 -1400 0 -1398 Q -26 -1400 -30 -1436 Z" fill="#5A0F18" stroke={LINE} strokeWidth={4} />
          <path d="M -26 -1436 Q 0 -1444 26 -1436 L 24 -1428 Q 0 -1434 -24 -1428 Z" fill="#FFFFFF" />
          <path d="M -14 -1408 Q 0 -1418 14 -1408 Q 0 -1400 -14 -1408 Z" fill="#D9576A" />
        </g>
      )}
      {mouth === "grit" && (
        <g>
          <path d="M -26 -1434 L 26 -1434 Q 24 -1416 0 -1414 Q -24 -1416 -26 -1434 Z" fill="#FFFFFF" stroke={LINE} strokeWidth={4} />
          <path d="M -24 -1425 L 24 -1425 M -10 -1434 L -10 -1416 M 8 -1434 L 8 -1416" stroke={LINE} strokeWidth={2} />
        </g>
      )}
      {mouth === "grin" && (
        <g>
          <path d="M -34 -1438 Q 0 -1428 34 -1440 Q 24 -1406 0 -1404 Q -24 -1406 -34 -1438 Z" fill="#FFFFFF" stroke={LINE} strokeWidth={4} />
          <path d="M -30 -1432 Q 0 -1424 30 -1434" stroke={LINE} strokeWidth={2} fill="none" />
        </g>
      )}
      {mouth === "smile" && <path d="M -20 -1430 Q 0 -1416 22 -1432" stroke={LINE} strokeWidth={4} fill="none" />}
      <path d="M -30 -1406 Q 0 -1384 30 -1406 L 32 -1392 Q 0 -1372 -32 -1392 Z" fill={SKIN_D} opacity={0.55} />
      {hurt && (
        <g>
          <path d="M -70 -1462 L -50 -1452 M -74 -1450 L -54 -1440" stroke="#C0394A" strokeWidth={3} />
          <path d="M 50 -1470 L 70 -1460" stroke="#C0394A" strokeWidth={3} />
          <path d={`M 96 ${-1560 + ((t * 60) % 40)} q 14 26 0 40 q -14 -14 0 -40 Z`} fill="#BFE6FF" stroke={LINE} strokeWidth={3} />
          <path d="M -60 -1050 L -20 -1030 M 60 -1200 L 90 -1180" stroke="#0E0E18" strokeWidth={4} opacity={0.5} />
        </g>
      )}

      {/* front hair: long bangs */}
      <path
        d="M -118 -1608 L -128 -1460 L -104 -1504 L -100 -1420 L -78 -1520 L -62 -1560 L -40 -1490 L -26 -1568 L -2 -1514
           L 14 -1574 L 36 -1520 L 58 -1572 L 74 -1500 L 90 -1440 L 102 -1510 L 126 -1450 L 118 -1612 Q 0 -1640 -118 -1608 Z"
        fill={HAIR}
        stroke={LINE}
        strokeWidth={OUT}
      />
      <path d="M 70 -1600 L 118 -1612 L 126 -1450 L 102 -1510 L 90 -1440 L 80 -1530 Z" fill={HAIR_S} />
      <path d="M -90 -1590 L -100 -1520 L -84 -1580 Z M -40 -1600 L -36 -1520 L -28 -1596 Z" fill={HAIR_H} />

      {/* headband */}
      <path d="M -96 -1598 L 96 -1598 L 100 -1566 L -100 -1566 Z" fill={VEST} stroke={LINE} strokeWidth={OUT} />
      <path d={`M -96 -1586 Q -150 ${-1570 + w * 6} ${-212 + w * 6} ${-1520 + w * 16}`} stroke={VEST} strokeWidth={16} fill="none" />
      <path d={`M -96 -1572 Q -142 ${-1540 + w * 6} ${-176 + w * 4} ${-1470 + w * 14}`} stroke={VEST} strokeWidth={13} fill="none" />
      <rect x={-52} y={-1608} width={104} height={50} rx={8} fill={METAL} stroke={LINE} strokeWidth={OUT} />
      <path d="M 20 -1606 L 50 -1606 L 50 -1562 L 26 -1562 Z" fill={METAL_S} />
      <path d="M -42 -1598 L -16 -1598" stroke="#FFFFFF" strokeWidth={4} />
      <circle cx={0} cy={-1583} r={13} fill="none" stroke={LINE} strokeWidth={5} />
      <circle cx={-38} cy={-1572} r={2.5} fill={LINE} />
      <circle cx={38} cy={-1572} r={2.5} fill={LINE} />

      {/* crown spikes above band */}
      <path
        d="M -112 -1596 Q -122 -1640 -100 -1680 L -66 -1650 L -46 -1716 L -8 -1664 L 30 -1726 L 50 -1660 L 102 -1690 L 98 -1634 L 120 -1596 Z"
        fill={HAIR}
        stroke={LINE}
        strokeWidth={OUT}
      />
      <path d="M -66 -1650 L -50 -1690 L -42 -1648 Z M -2 -1656 L 22 -1700 L 26 -1656 Z" fill={HAIR_H} />
      <path d="M -108 -1628 Q -40 -1650 40 -1640" stroke={HAIR_H} strokeWidth={5} fill="none" />
    </g>
  );
};
