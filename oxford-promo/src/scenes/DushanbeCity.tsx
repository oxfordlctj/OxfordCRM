import { evolvePath } from "@remotion/paths";
import React from "react";
import { AbsoluteFill, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRANCHES, COVER_R, NEW_BRANCH } from "../data/branches";
import { BACK, BODY, COLORS, DISPLAY, EASE_IN_OUT, EASE_OUT, ip } from "../theme";

// Stylised Dushanbe on the 1080x1920 canvas (north is up).
const BLOB =
  "M 150 470 C 300 380, 520 360, 700 400 C 860 430, 990 520, 1010 700 C 1030 900, 1020 1120, 990 1280 C 950 1460, 800 1560, 600 1580 C 420 1600, 230 1540, 150 1400 C 70 1260, 80 1050, 90 850 C 100 680, 90 560, 150 470 Z";
const RIVER = "M 410 330 C 395 500, 455 620, 420 780 S 370 1040, 410 1240 S 395 1460, 370 1640";
const ROADS = [
  { name: "пр. Рудаки", d: "M 565 380 C 560 600, 575 800, 560 1000 S 545 1250, 565 1520", w: 7 },
  { name: "пр. Сомони", d: "M 110 600 C 280 640, 430 690, 562 720", w: 5 },
  { name: "ул. Айни", d: "M 560 880 C 700 900, 860 960, 1010 1000", w: 5 },
  { name: "ул. Борбад", d: "M 100 1060 C 260 1030, 410 1010, 556 1000", w: 5 },
  { name: "ул. Гафурова", d: "M 180 1380 C 300 1300, 430 1220, 555 1180", w: 4 },
  { name: "", d: "M 562 1100 C 660 1160, 760 1220, 990 1300", w: 4 },
  { name: "", d: "M 700 400 C 690 560, 700 700, 720 900", w: 3 },
];
const DISTRICTS = [
  { name: "ФИРДАВСИ", x: 230, y: 560 },
  { name: "И. СОМОНИ", x: 760, y: 520 },
  { name: "СИНО", x: 240, y: 1180 },
  { name: "ШОХМАНСУР", x: 850, y: 800 },
];

// procedural street grid, clipped to the city outline
const STREETS: string[] = (() => {
  const out: string[] = [];
  for (let y = 360; y < 1660; y += 36) {
    let x = 40;
    let d = "";
    while (x < 1060) {
      const len = 40 + random(`h${y}-${x}`) * 160;
      if (random(`hg${y}-${x}`) > 0.18) d += `M ${x} ${y + random(`hy${y}${x}`) * 6} L ${x + len} ${y + random(`hy2${y}${x}`) * 6} `;
      x += len + 6;
    }
    out.push(d);
  }
  for (let x = 40; x < 1080; x += 40) {
    let y = 340;
    let d = "";
    while (y < 1680) {
      const len = 40 + random(`v${x}-${y}`) * 180;
      if (random(`vg${x}-${y}`) > 0.2) d += `M ${x + random(`vx${x}${y}`) * 6} ${y} L ${x + random(`vx2${x}${y}`) * 6} ${y + len} `;
      y += len + 6;
    }
    out.push(d);
  }
  return out;
})();

const PIN = "M0,0 C -6,-14 -28,-28 -28,-52 A28,28 0 1 1 28,-52 C 28,-28 6,-14 0,0 Z";
const PIN_START = 62;
const PIN_GAP = 15;
const COVER_AT = 172;
const GAP_AT = 214;
const NEW_AT = 262;

const Pin: React.FC<{
  x: number;
  y: number;
  start: number;
  num: number;
  label: string;
  gold?: boolean;
}> = ({ x, y, start, num, label, gold }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start) return null;
  const s = spring({ frame: frame - start, fps, config: { damping: gold ? 8 : 11, stiffness: gold ? 120 : 170 } });
  const k = gold ? 1.5 : 1;
  const ripple = ip(frame, [start + 6, start + 36], [0, 1]);
  const color = gold ? COLORS.gold : COLORS.sky;
  const labelW = label.length * 15 + 44;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={2} rx={18 * k * s} ry={6 * k * s} fill="#000" opacity={0.45} />
      <circle r={ripple * 90 * k} fill="none" stroke={color} strokeWidth={3} opacity={1 - ripple} />
      <g transform={`translate(0 ${(1 - s) * -160}) scale(${k * Math.min(1, s * 1.2)})`}>
        <path d={PIN} fill={color} stroke={COLORS.ink} strokeWidth={3} />
        <circle cy={-52} r={20} fill={COLORS.ink} />
        <text y={-43} textAnchor="middle" fill={COLORS.white} fontFamily={DISPLAY} fontWeight={800} fontSize={24}>
          {num}
        </text>
      </g>
      {!gold && (
        <g opacity={ip(frame, [start + 8, start + 18], [0, 1])} transform={`translate(0 ${ip(frame, [start + 8, start + 22], [-90, -118])})`}>
          <rect x={-labelW / 2} y={-22} width={labelW} height={42} rx={21} fill={COLORS.ink} fillOpacity={0.82} stroke={COLORS.sky} strokeOpacity={0.6} />
          <text y={8} textAnchor="middle" fill={COLORS.white} fontFamily={BODY} fontWeight={800} fontSize={24}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

export const DushanbeCity: React.FC = () => {
  const frame = useCurrentFrame();

  // camera: pull back from the map dive, then push towards the new branch
  const push = ip(frame, [NEW_AT - 16, NEW_AT + 20], [0, 1], EASE_IN_OUT);
  const scale = ip(frame, [0, 46], [2.8, 1], EASE_OUT) * (1 + 0.32 * push);
  const fx = 540 + (NEW_BRANCH.x - 120 - 540) * push;
  const fy = 960 + (NEW_BRANCH.y - 140 - 960) * push;
  const shakeAmt = ip(frame, [NEW_AT + 8, NEW_AT + 30], [14, 0]) * (frame > NEW_AT + 8 ? 1 : 0);
  const shx = Math.sin(frame * 2.7) * shakeAmt;
  const shy = Math.cos(frame * 3.3) * shakeAmt;

  const gridR = ip(frame, [4, 60], [0, 1300]);
  const river = evolvePath(ip(frame, [10, 54], [0, 1], EASE_IN_OUT), RIVER);
  const blob = evolvePath(ip(frame, [0, 40], [0, 1], EASE_IN_OUT), BLOB);
  const dim = ip(frame, [GAP_AT, GAP_AT + 16], [0, 0.62]) * ip(frame, [NEW_AT + 30, NEW_AT + 60], [1, 0.25]);
  const gapIn = ip(frame, [GAP_AT + 6, GAP_AT + 22], [0, 1], BACK) * ip(frame, [NEW_AT - 4, NEW_AT + 4], [1, 0]);
  const placed = BRANCHES.filter((_, i) => frame >= PIN_START + i * PIN_GAP).length;

  return (
    <AbsoluteFill style={{ translate: `${shx}px ${shy}px` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="cityClip">
            <path d={BLOB} />
          </clipPath>
          <radialGradient id="gridFade">
            <stop offset="0.75" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask id="gridMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920">
            <circle cx={540} cy={960} r={gridR} fill="url(#gridFade)" />
          </mask>
          <radialGradient id="cover">
            <stop offset="0" stopColor={COLORS.sky} stopOpacity={0.34} />
            <stop offset="1" stopColor={COLORS.sky} stopOpacity={0.06} />
          </radialGradient>
          <radialGradient id="coverGold">
            <stop offset="0" stopColor={COLORS.gold} stopOpacity={0.55} />
            <stop offset="1" stopColor={COLORS.gold} stopOpacity={0.1} />
          </radialGradient>
          <radialGradient id="ray" cx="0" cy="0.5" r="1">
            <stop offset="0" stopColor={COLORS.goldSoft} stopOpacity={0.55} />
            <stop offset="1" stopColor={COLORS.goldSoft} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="holeGrad">
            <stop offset="0.6" stopColor="#000" />
            <stop offset="1" stopColor="#fff" />
          </radialGradient>
          <mask id="hole" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920">
            <rect width={1080} height={1920} fill="#fff" />
            <circle cx={NEW_BRANCH.x} cy={NEW_BRANCH.y} r={COVER_R * 1.6} fill="url(#holeGrad)" />
          </mask>
          <filter id="cglow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <g transform={`translate(540 960) scale(${scale}) translate(${-fx} ${-fy})`}>
          <path d={BLOB} fill={COLORS.navy} fillOpacity={ip(frame, [6, 40], [0, 0.85])} />
          <g clipPath="url(#cityClip)" mask="url(#gridMask)">
            {STREETS.map((d, i) => (
              <path key={i} d={d} stroke={COLORS.sky} strokeOpacity={0.16} strokeWidth={1.6} fill="none" />
            ))}
          </g>
          <path d={BLOB} fill="none" stroke={COLORS.sky} strokeOpacity={0.7} strokeWidth={3} strokeDasharray={blob.strokeDasharray} strokeDashoffset={blob.strokeDashoffset} />
          <ellipse cx={560} cy={980} rx={430} ry={560} fill="none" stroke={COLORS.mute} strokeOpacity={0.25} strokeWidth={2} strokeDasharray="10 12" opacity={ip(frame, [30, 60], [0, 1])} />

          {ROADS.map((r, i) => {
            const e = evolvePath(ip(frame, [16 + i * 4, 58 + i * 4], [0, 1], EASE_IN_OUT), r.d);
            return (
              <path key={i} d={r.d} fill="none" stroke={COLORS.white} strokeOpacity={0.55} strokeWidth={r.w} strokeLinecap="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />
            );
          })}
          <path d={RIVER} fill="none" stroke={COLORS.river} strokeWidth={16} filter="url(#cglow)" opacity={0.6} strokeDasharray={river.strokeDasharray} strokeDashoffset={river.strokeDashoffset} />
          <path d={RIVER} fill="none" stroke={COLORS.river} strokeWidth={8} strokeLinecap="round" strokeDasharray={river.strokeDasharray} strokeDashoffset={river.strokeDashoffset} />

          <g opacity={ip(frame, [44, 70], [0, 1])} fontFamily={BODY} fontWeight={700}>
            {DISTRICTS.map((d) => (
              <text key={d.name} x={d.x} y={d.y} textAnchor="middle" fill={COLORS.white} fillOpacity={0.22} fontSize={30} letterSpacing={8}>
                {d.name}
              </text>
            ))}
            <text x={0} y={0} transform="translate(338 1470) rotate(-86)" fill={COLORS.river} fontSize={22} letterSpacing={2}>
              р. Душанбинка
            </text>
            <text x={0} y={0} transform="translate(598 1420) rotate(-90)" fill={COLORS.white} fillOpacity={0.6} fontSize={22} letterSpacing={2}>
              пр. Рудаки
            </text>
            <text x={0} y={0} transform="translate(860 948) rotate(14)" fill={COLORS.white} fillOpacity={0.6} fontSize={22} letterSpacing={2}>
              ул. Айни
            </text>
          </g>

          {/* coverage */}
          {BRANCHES.map((b, i) => {
            const p = ip(frame, [COVER_AT + i * 3, COVER_AT + 26 + i * 3], [0, 1], EASE_OUT);
            return (
              <circle key={b.id} cx={b.x} cy={b.y} r={COVER_R * p} fill="url(#cover)" stroke={COLORS.sky} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="6 8" />
            );
          })}
          <circle cx={NEW_BRANCH.x} cy={NEW_BRANCH.y} r={COVER_R * ip(frame, [NEW_AT + 24, NEW_AT + 56], [0, 1.05], BACK)} fill="url(#coverGold)" stroke={COLORS.gold} strokeWidth={3} />

          {/* dim everything except the empty area */}
          <rect x={-200} y={-200} width={1480} height={2320} fill={COLORS.ink} opacity={dim} mask="url(#hole)" />

          {/* the empty spot */}
          <g transform={`translate(${NEW_BRANCH.x} ${NEW_BRANCH.y})`} opacity={gapIn}>
            <circle r={COVER_R * 0.9 * gapIn} fill="none" stroke={COLORS.goldSoft} strokeWidth={4} strokeDasharray="18 14" transform={`rotate(${frame * 1.5})`} />
            <text y={40} textAnchor="middle" fill={COLORS.goldSoft} fontFamily={DISPLAY} fontWeight={900} fontSize={120} opacity={0.6 + 0.4 * Math.sin(frame / 4)}>
              ?
            </text>
          </g>

          {/* light rays behind the new branch */}
          <g transform={`translate(${NEW_BRANCH.x} ${NEW_BRANCH.y - 70}) rotate(${frame * 0.6})`} opacity={ip(frame, [NEW_AT, NEW_AT + 14], [0, 0.7])}>
            {new Array(14).fill(0).map((_, i) => (
              <path key={i} d="M0,0 L520,-24 L520,24 Z" fill="url(#ray)" transform={`rotate(${(360 / 14) * i})`} />
            ))}
          </g>
          {[0, 1, 2].map((k) => {
            const p = ip(frame, [NEW_AT + 10 + k * 6, NEW_AT + 46 + k * 6], [0, 1]);
            return <circle key={k} cx={NEW_BRANCH.x} cy={NEW_BRANCH.y} r={p * 420} fill="none" stroke={COLORS.goldSoft} strokeWidth={8 * (1 - p)} opacity={1 - p} />;
          })}

          {BRANCHES.map((b, i) => (
            <Pin key={b.id} x={b.x} y={b.y} start={PIN_START + i * PIN_GAP} num={b.id} label={b.name} />
          ))}
          <Pin x={NEW_BRANCH.x} y={NEW_BRANCH.y} start={NEW_AT} num={8} label="" gold />
        </g>
      </svg>

      {/* flash on impact */}
      <AbsoluteFill style={{ backgroundColor: COLORS.goldSoft, mixBlendMode: "screen", opacity: ip(frame, [NEW_AT + 6, NEW_AT + 9, NEW_AT + 26], [0, 0.7, 0]) }} />
      {/* landing flash from the map dive */}
      <AbsoluteFill style={{ backgroundColor: COLORS.goldSoft, mixBlendMode: "screen", opacity: ip(frame, [0, 18], [0.85, 0]) }} />

      {/* top shade keeps the headline readable over the pushed-in map */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${COLORS.ink} 0%, ${COLORS.ink}ee 300px, transparent 520px)`, opacity: ip(frame, [30, 50], [0, 1]) }} />
      {/* header */}
      <div style={{ position: "absolute", top: 120, left: 90, right: 90, display: "flex", alignItems: "center", gap: 28, opacity: ip(frame, [40, 58], [0, 1]) * ip(frame, [NEW_AT - 10, NEW_AT], [1, 0]) }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 170, lineHeight: 1, color: COLORS.gold, width: 150, textAlign: "center", textShadow: `0 0 50px ${COLORS.gold}66` }}>
          {placed}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 30, letterSpacing: 10, color: COLORS.mute }}>ДУШАНБЕ</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, lineHeight: 1.1, color: COLORS.white }}>
            {placed === 1 ? "филиал" : placed < 5 ? "филиала" : "филиалов"}
            <br />
            Oxford
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", opacity: ip(frame, [NEW_AT + 4, NEW_AT + 20], [0, 1]) }}>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 32, letterSpacing: 12, color: COLORS.goldSoft }}>НОВЫЙ ФИЛИАЛ</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 150, lineHeight: 1.1, color: COLORS.gold, scale: String(ip(frame, [NEW_AT + 4, NEW_AT + 24], [1.8, 1], BACK)), textShadow: `0 0 70px ${COLORS.gold}88` }}>
          №8
        </div>
      </div>

      <BottomCard frame={frame} />
    </AbsoluteFill>
  );
};

const BottomCard: React.FC<{ frame: number }> = ({ frame }) => {
  const idx = Math.min(BRANCHES.length - 1, Math.floor((frame - PIN_START) / PIN_GAP));
  let key = "none";
  let since = 0;
  let content: React.ReactNode = null;
  let accent = COLORS.sky;
  if (frame >= NEW_AT + 10) {
    key = "new";
    since = frame - NEW_AT - 10;
    accent = COLORS.gold;
    content = (
      <>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, color: COLORS.gold }}>{NEW_BRANCH.name}</div>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 42, color: COLORS.white }}>{NEW_BRANCH.address}</div>
      </>
    );
  } else if (frame >= GAP_AT) {
    key = "gap";
    since = frame - GAP_AT;
    accent = COLORS.goldSoft;
    content = (
      <>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, color: COLORS.white }}>Но есть район,</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, color: COLORS.goldSoft }}>где нас ещё нет</div>
      </>
    );
  } else if (frame >= COVER_AT) {
    key = "cover";
    since = frame - COVER_AT;
    content = (
      <>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, color: COLORS.white }}>Почти весь город</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, color: COLORS.sky }}>рядом с Oxford</div>
      </>
    );
  } else if (frame >= PIN_START) {
    const b = BRANCHES[idx];
    key = `b${idx}`;
    since = frame - (PIN_START + idx * PIN_GAP);
    content = (
      <>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 54, color: COLORS.white }}>
          <span style={{ color: COLORS.sky }}>№{b.id}</span> · {b.name}
        </div>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 42, color: COLORS.mute }}>{b.address}</div>
      </>
    );
  }
  if (!content) return null;
  return (
    <div
      key={key}
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: 1630,
        padding: "26px 40px",
        borderRadius: 28,
        background: "rgba(5,12,28,0.78)",
        border: `2px solid ${accent}66`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${accent}22`,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        opacity: ip(since, [0, 8], [0, 1]),
        translate: `0px ${ip(since, [0, 12], [40, 0])}px`,
        clipPath: `inset(0 ${ip(since, [0, 12], [100, 0])}% 0 0 round 28px)`,
      }}
    >
      {content}
    </div>
  );
};
