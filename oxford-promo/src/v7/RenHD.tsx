import React from "react";

// Cel-shaded anime palette for Ren (original character).
const LINE = "#1E1517";
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

type P = [number, number];

/** Tapered, slightly bulging limb between two joints. */
const limb = (a: P, b: P, w1: number, w2: number, bulge = 6) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l;
  const ny = dx / l;
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const wm = (w1 + w2) / 4 + bulge;
  const p = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  return (
    `M ${p(a[0] + (nx * w1) / 2, a[1] + (ny * w1) / 2)} ` +
    `Q ${p(mx + nx * wm, my + ny * wm)} ${p(b[0] + (nx * w2) / 2, b[1] + (ny * w2) / 2)} ` +
    `L ${p(b[0] - (nx * w2) / 2, b[1] - (ny * w2) / 2)} ` +
    `Q ${p(mx - nx * wm, my - ny * wm)} ${p(a[0] - (nx * w1) / 2, a[1] - (ny * w1) / 2)} Z`
  );
};

/** Cel shadow strip along one side (side = +1 / -1) of a limb. */
const limbShade = (a: P, b: P, w1: number, w2: number, side: 1 | -1, k = 0.42, bulge = 6) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  const nx = (-dy / l) * side;
  const ny = (dx / l) * side;
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const wm = (w1 + w2) / 4 + bulge;
  const inner = 0.5 - k;
  const p = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  return (
    `M ${p(a[0] + (nx * w1) / 2, a[1] + (ny * w1) / 2)} ` +
    `Q ${p(mx + nx * wm, my + ny * wm)} ${p(b[0] + (nx * w2) / 2, b[1] + (ny * w2) / 2)} ` +
    `L ${p(b[0] + nx * w2 * inner, b[1] + ny * w2 * inner)} ` +
    `Q ${p(mx + nx * (wm * 0.2), my + ny * (wm * 0.2))} ${p(a[0] + nx * w1 * inner, a[1] + ny * w1 * inner)} Z`
  );
};

/**
 * Ren — full-body anime character, cel-shaded, front 3/4-ish stance.
 * Origin = between the feet; ~1600 units to the top of the skull.
 */
export const RenHD: React.FC<{ t: number; power?: number; blink?: boolean; id?: string }> = ({
  t,
  power = 0,
  blink,
  id = "ren",
}) => {
  const w = Math.sin(t * 3.1);
  const w2 = Math.sin(t * 2.3 + 1);
  const red = power > 0.5;
  const iris = red ? "#D41E36" : "#2E3350";
  const irisD = red ? "#7A0C1C" : "#14172A";

  // joints
  const shL: P = [-168, -1318];
  const elL: P = [-212, -1092];
  const wrL: P = [-204, -872];
  const shR: P = [168, -1318];
  const elR: P = [282, -1112];
  const wrR: P = [160, -962];
  const hipL: P = [-66, -880];
  const knL: P = [-92, -488];
  const anL: P = [-104, -96];
  const hipR: P = [64, -880];
  const knR: P = [80, -486];
  const anR: P = [96, -96];

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

      {/* ground shadow */}
      <ellipse cx={0} cy={6} rx={230} ry={26} fill="#000" opacity={0.12} />

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
      <path d="M 158 -1610 L 246 -1592 L 160 -1530 L 214 -1478 L 146 -1466 L 158 -1400 L 110 -1450 L 130 -1560 Z" fill={HAIR_S} />

      {/* ===== legs: wide shinobi pants ===== */}
      {/* hip block */}
      <path d="M -128 -930 L 128 -930 Q 140 -870 132 -820 L 8 -790 L -8 -790 L -132 -820 Q -140 -870 -128 -930 Z" fill={PANTS} stroke={LINE} strokeWidth={OUT} />
      {/* thighs */}
      <path d={limb(hipL, knL, 150, 112, 14)} fill={PANTS} stroke={LINE} strokeWidth={OUT} />
      <path d={limbShade(hipL, knL, 150, 112, 1, 0.3, 14)} fill={PANTS_S} />
      <path d={limb(hipR, knR, 150, 112, 14)} fill={PANTS} stroke={LINE} strokeWidth={OUT} />
      <path d={limbShade(hipR, knR, 150, 112, 1, 0.38, 14)} fill={PANTS_S} />
      {/* shins (baggy, blousing over wraps) */}
      <path d={limb(knL, [-100, -300], 112, 116, 10)} fill={PANTS} stroke={LINE} strokeWidth={OUT} />
      <path d={limbShade(knL, [-100, -300], 112, 116, 1, 0.3, 10)} fill={PANTS_S} />
      <path d={limb(knR, [90, -300], 112, 116, 10)} fill={PANTS} stroke={LINE} strokeWidth={OUT} />
      <path d={limbShade(knR, [90, -300], 112, 116, 1, 0.4, 10)} fill={PANTS_S} />
      {/* cloth folds */}
      <g stroke={LINE} strokeWidth={IN} fill="none">
        <path d="M -40 -800 Q -60 -700 -100 -640" />
        <path d="M -120 -560 Q -100 -520 -64 -530" />
        <path d="M -140 -430 Q -110 -400 -70 -420" />
        <path d="M -60 -360 Q -80 -330 -120 -330" />
        <path d="M 36 -800 Q 60 -700 104 -650" />
        <path d="M 40 -560 Q 76 -530 120 -560" />
        <path d="M 46 -420 Q 80 -390 128 -416" />
        <path d="M 60 -360 Q 90 -330 130 -334" />
      </g>
      {/* leg wraps + sandals */}
      {[
        { a: [-100, -318] as P, b: anL, s: -1 },
        { a: [90, -318] as P, b: anR, s: 1 },
      ].map(({ a, b, s }, k) => (
        <g key={k}>
          <path d={limb(a, b, 92, 70, 2)} fill={WRAP} stroke={LINE} strokeWidth={OUT} />
          <path d={limbShade(a, b, 92, 70, 1, 0.3, 2)} fill={WRAP_S} />
          {[0, 1, 2, 3, 4].map((i) => {
            const y = a[1] + 22 + i * 42;
            const f = (y - a[1]) / (b[1] - a[1]);
            const cx = a[0] + (b[0] - a[0]) * f;
            const hw = (92 + (70 - 92) * f) / 2;
            return <path key={i} d={`M ${cx - hw + 4} ${y} Q ${cx} ${y + 16} ${cx + hw - 4} ${y + 6}`} stroke={WRAP_S} strokeWidth={IN} fill="none" />;
          })}
          {/* pant cuff blousing over the wrap */}
          <path d={`M ${a[0] - 60} ${a[1] - 30} Q ${a[0]} ${a[1] + 26} ${a[0] + 60} ${a[1] - 30} L ${a[0] + 58} ${a[1] - 6} Q ${a[0]} ${a[1] + 44} ${a[0] - 58} ${a[1] - 6} Z`} fill={PANTS_S} stroke={LINE} strokeWidth={IN} />
          {/* foot */}
          <path
            d={`M ${b[0] - 34} ${b[1] + 6} Q ${b[0] + s * 4} ${b[1] - 10} ${b[0] + 34} ${b[1] + 6}
                Q ${b[0] + 46 + s * 10} -30 ${b[0] + 40 + s * 12} -10 L ${b[0] - 40 + s * 12} -10
                Q ${b[0] - 46 + s * 10} -30 ${b[0] - 34} ${b[1] + 6} Z`}
            fill={SKIN}
            stroke={LINE}
            strokeWidth={OUT}
          />
          <path d={`M ${b[0] - 20 + s * 12} -12 L ${b[0] - 18 + s * 12} -26 M ${b[0] + s * 12} -12 L ${b[0] + s * 12} -26 M ${b[0] + 18 + s * 12} -12 L ${b[0] + 18 + s * 12} -24`} stroke={SKIN_D} strokeWidth={IN} />
          <path d={`M ${b[0] - 50 + s * 12} -10 L ${b[0] + 50 + s * 12} -10 L ${b[0] + 54 + s * 12} 8 L ${b[0] - 54 + s * 12} 8 Z`} fill={SOLE} stroke={LINE} strokeWidth={OUT} />
          <path d={`M ${b[0] - 36} ${b[1] + 24} L ${b[0] + s * 12} -18 L ${b[0] + 36} ${b[1] + 24}`} stroke={SOLE} strokeWidth={9} fill="none" />
        </g>
      ))}

      {/* ===== arm behind torso: viewer-right, hand on hip ===== */}
      <path d={limb(shR, elR, 84, 66, 8)} fill={SHIRT} stroke={LINE} strokeWidth={OUT} />
      <path d={limbShade(shR, elR, 84, 66, -1, 0.36, 8)} fill={SHIRT_S} />
      <path d={limb(elR, wrR, 68, 54, 6)} fill={VEST} stroke={LINE} strokeWidth={OUT} />
      <path d={limbShade(elR, wrR, 68, 54, -1, 0.34, 6)} fill={VEST_S} />
      <path d="M 262 -1096 L 288 -1064 M 236 -1064 L 254 -1030" stroke={VEST_H} strokeWidth={IN} />

      {/* ===== torso: sleeveless zipped vest over white shirt ===== */}
      <path
        d="M -168 -1344 Q -196 -1270 -170 -1160 Q -140 -1050 -120 -950 L 120 -950 Q 140 -1050 170 -1160 Q 196 -1270 168 -1344 Q 0 -1372 -168 -1344 Z"
        fill={VEST}
        stroke={LINE}
        strokeWidth={OUT}
      />
      {/* cel shadow: right side of body + under chest */}
      <path d="M 60 -1350 Q 110 -1250 96 -1140 Q 82 -1040 92 -950 L 120 -950 Q 140 -1050 170 -1160 Q 196 -1270 168 -1344 Z" fill={VEST_S} />
      <path d="M -150 -1170 Q -60 -1130 0 -1150 Q 50 -1132 96 -1150 L 90 -1120 Q 0 -1100 -140 -1140 Z" fill={VEST_S} opacity={0.8} />
      {/* rim light on lit side */}
      <path d="M -176 -1300 Q -186 -1240 -164 -1160" stroke={VEST_H} strokeWidth={7} fill="none" />
      {/* zipper + seams */}
      <path d="M 0 -1330 L 0 -950" stroke={LINE} strokeWidth={IN} />
      <path d="M -7 -1320 L -7 -955 M 7 -1320 L 7 -955" stroke={VEST_H} strokeWidth={1.5} />
      <path d="M -120 -1330 Q -100 -1220 -110 -1120 M 120 -1330 Q 100 -1220 110 -1120" stroke={LINE} strokeWidth={IN} fill="none" />
      <path d="M -60 -1040 Q -30 -1030 -10 -1046 M 30 -1010 Q 56 -1000 80 -1016" stroke={VEST_S} strokeWidth={IN} fill="none" />
      {/* gold crest */}
      <circle cx={-72} cy={-1236} r={22} fill="none" stroke={GOLD} strokeWidth={8} />
      <circle cx={-72} cy={-1236} r={22} fill="none" stroke={LINE} strokeWidth={1.5} />
      {/* armholes showing shirt */}
      <path d="M -168 -1344 Q -190 -1300 -184 -1240 L -150 -1250 Q -152 -1300 -132 -1340 Z" fill={SHIRT} stroke={LINE} strokeWidth={IN} />
      <path d="M 168 -1344 Q 190 -1300 184 -1240 L 150 -1250 Q 152 -1300 132 -1340 Z" fill={SHIRT_S} stroke={LINE} strokeWidth={IN} />

      {/* ===== sash ===== */}
      <path d="M -132 -976 Q 0 -950 132 -976 L 138 -906 Q 0 -880 -138 -906 Z" fill={RED} stroke={LINE} strokeWidth={OUT} />
      <path d="M 40 -958 Q 90 -962 132 -976 L 138 -906 Q 90 -896 40 -890 Z" fill={RED_S} />
      <path d="M -120 -958 Q 0 -936 120 -958" stroke={RED_H} strokeWidth={IN} fill="none" />
      {/* knot + tails (wind) */}
      <path d="M -112 -960 Q -92 -980 -70 -956 Q -76 -922 -100 -914 Q -122 -928 -112 -960 Z" fill={RED} stroke={LINE} strokeWidth={OUT} />
      <path d={`M -100 -918 Q ${-120 + w2 * 6} -840 ${-150 + w2 * 18} -760 L ${-110 + w2 * 18} -750 Q ${-90 + w2 * 6} -830 -80 -918 Z`} fill={RED} stroke={LINE} strokeWidth={OUT} />
      <path d={`M -84 -918 Q ${-70 + w2 * 8} -850 ${-80 + w2 * 22} -790 L ${-48 + w2 * 22} -800 Q ${-48 + w2 * 8} -860 -66 -922 Z`} fill={RED_S} stroke={LINE} strokeWidth={OUT} />

      {/* ===== hand on hip (viewer-right) ===== */}
      <path d="M 186 -990 Q 150 -1000 122 -978 Q 104 -952 112 -930 Q 140 -910 176 -926 Q 196 -950 186 -990 Z" fill={SKIN} stroke={LINE} strokeWidth={OUT} />
      <path d="M 122 -978 Q 140 -968 150 -950 M 116 -952 Q 136 -944 148 -930" stroke={SKIN_D} strokeWidth={IN} fill="none" />
      <path d="M 176 -926 Q 196 -950 186 -990 L 170 -982 Q 178 -950 166 -930 Z" fill={SKIN_S} />

      {/* ===== arm in front: viewer-left, relaxed ===== */}
      <path d={limb(shL, elL, 86, 66, 8)} fill={SHIRT} stroke={LINE} strokeWidth={OUT} />
      <path d={limbShade(shL, elL, 86, 66, -1, 0.3, 8)} fill={SHIRT_S} />
      <path d="M -200 -1240 Q -190 -1200 -196 -1160" stroke={SHIRT_S} strokeWidth={IN} fill="none" />
      <path d={limb(elL, wrL, 70, 54, 6)} fill={VEST} stroke={LINE} strokeWidth={OUT} />
      <path d={limbShade(elL, wrL, 70, 54, -1, 0.34, 6)} fill={VEST_S} />
      {/* metal arm guard */}
      <path d="M -236 -1036 L -186 -1032 L -180 -916 L -226 -920 Z" fill={METAL} stroke={LINE} strokeWidth={IN} />
      <path d="M -196 -1032 L -190 -918 L -180 -916 L -186 -1032 Z" fill={METAL_S} />
      <path d="M -228 -1020 L -222 -940" stroke="#FFFFFF" strokeWidth={4} />
      {/* hand: relaxed, fingers curled */}
      <path
        d="M -232 -878 Q -244 -830 -232 -790 Q -222 -760 -200 -758 Q -176 -762 -172 -790 Q -170 -830 -178 -876 Z"
        fill={SKIN}
        stroke={LINE}
        strokeWidth={OUT}
      />
      <path d="M -186 -870 Q -172 -830 -174 -792 L -190 -790 Q -186 -830 -196 -868 Z" fill={SKIN_S} />
      <path d="M -226 -800 Q -214 -788 -198 -792 M -230 -822 Q -216 -812 -200 -816" stroke={SKIN_D} strokeWidth={IN} fill="none" />

      {/* ===== neck ===== */}
      <path d="M -32 -1420 Q -30 -1380 -38 -1350 L 38 -1350 Q 30 -1380 32 -1420 Z" fill={SKIN_S} stroke={LINE} strokeWidth={OUT} />
      {/* high collar */}
      <path d="M -78 -1338 L -70 -1408 Q 0 -1424 70 -1408 L 78 -1338 Q 0 -1350 -78 -1338 Z" fill={VEST} stroke={LINE} strokeWidth={OUT} />
      <path d="M 20 -1418 Q 50 -1414 70 -1408 L 78 -1338 Q 50 -1342 26 -1344 Z" fill={VEST_S} />
      <path d="M -66 -1400 Q 0 -1414 66 -1400" stroke={VEST_H} strokeWidth={IN} fill="none" />
      {/* scarf wrap */}
      <path d="M -112 -1352 Q -40 -1300 0 -1308 Q 60 -1300 112 -1352 L 118 -1318 Q 40 -1258 -30 -1268 Q -80 -1276 -118 -1316 Z" fill={RED} stroke={LINE} strokeWidth={OUT} />
      <path d="M 30 -1300 Q 70 -1310 112 -1352 L 118 -1318 Q 80 -1286 40 -1272 Z" fill={RED_S} />
      <path d="M -90 -1330 Q -30 -1290 40 -1300" stroke={RED_H} strokeWidth={IN} fill="none" />
      {/* front scarf end */}
      <path d={`M 40 -1290 Q 64 -1220 ${54 + w * 6} -1150 L ${86 + w * 6} -1160 Q 92 -1230 74 -1296 Z`} fill={RED} stroke={LINE} strokeWidth={OUT} />
      <path d={`M 74 -1296 Q 92 -1230 ${86 + w * 6} -1160 L ${74 + w * 6} -1158 Q 80 -1230 62 -1292 Z`} fill={RED_S} />

      {/* ===== head ===== */}
      {/* face */}
      <path
        d="M -90 -1590 Q -94 -1500 -82 -1468 Q -64 -1430 -22 -1404 Q 0 -1394 22 -1404 Q 64 -1430 82 -1468 Q 94 -1500 90 -1590 Z"
        fill={SKIN}
        stroke={LINE}
        strokeWidth={OUT}
      />
      {/* cel shadow: right cheek + hair shadow band */}
      <path d="M 52 -1590 L 90 -1590 Q 94 -1500 82 -1468 Q 64 -1430 22 -1404 Q 62 -1446 66 -1500 Q 70 -1550 52 -1590 Z" fill={SKIN_S} />
      <path d="M -90 -1560 L 90 -1560 L 90 -1530 Q 60 -1540 40 -1528 Q 20 -1546 0 -1530 Q -24 -1548 -46 -1530 Q -66 -1544 -90 -1532 Z" fill={SKIN_S} />
      {/* ears */}
      <path d="M -90 -1530 Q -114 -1540 -110 -1504 Q -104 -1476 -84 -1480" fill={SKIN} stroke={LINE} strokeWidth={OUT} />
      <path d="M -98 -1520 Q -104 -1504 -94 -1492" stroke={SKIN_D} strokeWidth={IN} fill="none" />
      <path d="M 90 -1530 Q 114 -1540 110 -1504 Q 104 -1476 84 -1480" fill={SKIN_S} stroke={LINE} strokeWidth={OUT} />

      {/* eyes */}
      {[
        { s: -1, clip: `${id}-eyeL` },
        { s: 1, clip: `${id}-eyeR` },
      ].map(({ s, clip }) => (
        <g key={s} transform={`translate(${s * 40} -1500)`}>
          {blink ? (
            <path d={`M ${28 * s} 2 Q 0 10 ${-28 * s} 0`} stroke={LINE} strokeWidth={6} fill="none" />
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
                      return <path key={a} d={`M ${Math.cos(r) * 8} ${Math.sin(r) * 8} m -2.6 0 a 2.6 2.6 0 1 0 5.2 0 a 2.6 2.6 0 1 0 -5.2 0 M ${Math.cos(r) * 8 + 2} ${Math.sin(r) * 8} q 3 4 -1 7`} fill="#1A0A0E" stroke="#1A0A0E" strokeWidth={1} />;
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
              {/* heavy upper lash line, sharp outer flick */}
              <path d={s < 0 ? "M -36 -10 Q -6 -20 27 1 L 30 4" : "M 36 -10 Q 6 -20 -27 1 L -30 4"} stroke={LINE} strokeWidth={7} fill="none" />
              <path d={s < 0 ? "M -36 -10 L -42 -4" : "M 36 -10 L 42 -4"} stroke={LINE} strokeWidth={4} />
              <path d={s < 0 ? "M -20 10 Q 0 15 16 10" : "M 20 10 Q 0 15 -16 10"} stroke={LINE} strokeWidth={2} fill="none" />
            </>
          )}
          {/* angled brow: low at center (determined) */}
          <path d={s < 0 ? "M -38 -34 Q -6 -36 28 -18" : "M 38 -34 Q 6 -36 -28 -18"} stroke={HAIR} strokeWidth={7} fill="none" />
        </g>
      ))}
      {power > 0 &&
        [-1, 1].map((s) => (
          <circle key={s} cx={s * 40} cy={-1500} r={34 * power} fill="#FF2A3D" opacity={0.16 * power} />
        ))}
      {/* nose & mouth */}
      <path d="M 6 -1478 L 12 -1452 L 2 -1449" stroke={SKIN_D} strokeWidth={IN} fill="none" />
      <path d="M -16 -1424 Q 0 -1428 18 -1424" stroke={LINE} strokeWidth={4} fill="none" />
      <path d="M -6 -1414 L 8 -1414" stroke={SKIN_D} strokeWidth={2} />
      {/* chin shadow onto neck */}
      <path d="M -30 -1406 Q 0 -1384 30 -1406 L 32 -1392 Q 0 -1372 -32 -1392 Z" fill={SKIN_D} opacity={0.55} />

      {/* front hair: crown spikes above band */}
      <path
        d="M -112 -1596 Q -122 -1640 -100 -1680 L -66 -1650 L -46 -1716 L -8 -1664 L 30 -1726 L 50 -1660 L 102 -1690 L 98 -1634 L 120 -1596 Z"
        fill={HAIR}
        stroke={LINE}
        strokeWidth={OUT}
      />
      {/* long bangs falling over the band and face */}
      <path
        d="M -118 -1608 L -128 -1460 L -104 -1504 L -100 -1420 L -78 -1520 L -62 -1560 L -40 -1490 L -26 -1568 L -2 -1514
           L 14 -1574 L 36 -1520 L 58 -1572 L 74 -1500 L 90 -1440 L 102 -1510 L 126 -1450 L 118 -1612 Q 0 -1640 -118 -1608 Z"
        fill={HAIR}
        stroke={LINE}
        strokeWidth={OUT}
      />
      <path d="M 70 -1600 L 118 -1612 L 126 -1450 L 102 -1510 L 90 -1440 L 80 -1530 Z" fill={HAIR_S} />
      {/* blue sheen highlights */}
      <path d="M -66 -1650 L -50 -1690 L -42 -1648 Z M -2 -1656 L 22 -1700 L 26 -1656 Z M -90 -1590 L -100 -1520 L -84 -1580 Z M -40 -1600 L -36 -1520 L -28 -1596 Z" fill={HAIR_H} />
      <path d="M -108 -1628 Q -40 -1650 40 -1640" stroke={HAIR_H} strokeWidth={5} fill="none" />
      {/* headband */}
      <path d={`M -96 -1598 L 96 -1598 L 100 -1566 L -100 -1566 Z`} fill={VEST} stroke={LINE} strokeWidth={OUT} />
      <path d={`M -96 -1586 Q -150 ${-1570 + w * 6} ${-212 + w * 6} ${-1520 + w * 16}`} stroke={VEST} strokeWidth={16} fill="none" />
      <path d={`M -96 -1572 Q -142 ${-1540 + w * 6} ${-176 + w * 4} ${-1470 + w * 14}`} stroke={VEST} strokeWidth={13} fill="none" />
      <rect x={-52} y={-1608} width={104} height={50} rx={8} fill={METAL} stroke={LINE} strokeWidth={OUT} />
      <path d="M 20 -1606 L 50 -1606 L 50 -1562 L 26 -1562 Z" fill={METAL_S} />
      <path d="M -42 -1598 L -16 -1598" stroke="#FFFFFF" strokeWidth={4} />
      <circle cx={0} cy={-1583} r={13} fill="none" stroke={LINE} strokeWidth={5} />
      <circle cx={-38} cy={-1572} r={2.5} fill={LINE} />
      <circle cx={38} cy={-1572} r={2.5} fill={LINE} />

    </g>
  );
};
