import React from "react";
import { random } from "remotion";
import { BODY, COLORS } from "../theme";
import { ip } from "./fx";

// Stylised Dushanbe on the 1080x1920 canvas. Not GPS-accurate.
export const CENTER = { x: 555, y: 980 };

export const BRANCHES = [
  { id: 1, name: "Садбарг", address: "ул. Айни 46", x: 691, y: 905, side: "right", img: "blog-1.jpg" },
  { id: 2, name: "Гулистон", address: "ул. Н. Карабаева 26", x: 430, y: 1253, side: "right", img: "course-2.jpg" },
  { id: 3, name: "Мардон", address: "ул. Борбад 101", x: 250, y: 1044, side: "right", img: "hero-banner-1.jpg" },
  { id: 4, name: "Гипрозем", address: "ул. Сомон 100", x: 749, y: 661, side: "left", img: "blog-3.jpg" },
  { id: 5, name: "82 мкр", address: "ул. Б. Гафурова 26", x: 314, y: 1351, side: "right", img: "course-1.jpg" },
  { id: 6, name: "Сельхоз", address: "ул. Карамова 6", x: 557, y: 522, side: "right", img: "hero-banner-2.jpg" },
  { id: 7, name: "ОВИР", address: "ул. М. Курбонова 1А", x: 343, y: 736, side: "right", img: "about-banner.jpg" },
] as const;

const P = (x: number, z: number) => [540 + x * 58, 980 + z * 58] as const;
const path = (pts: [number, number][]) => {
  const q = pts.map(([x, z]) => P(x, z));
  let d = `M ${q[0][0]} ${q[0][1]}`;
  for (let i = 1; i < q.length; i++) {
    const [x0, y0] = q[i - 1];
    const [x1, y1] = q[i];
    d += ` Q ${x0 + (x1 - x0) * 0.5 + (y1 - y0) * 0.08} ${y0 + (y1 - y0) * 0.5 - (x1 - x0) * 0.08} ${x1} ${y1}`;
  }
  return d;
};

export const ROADS = [
  { name: "пр. Рудаки", d: path([[0.4, -12], [0.2, -6], [0.4, -2], [0.25, 0], [0.0, 4], [0.3, 11]]), w: 7, color: "#ff7a3d" },
  { name: "пр. Сомони", d: path([[-9, -5.5], [-5, -4.2], [-2, -3.2], [0.3, -2.4], [0.25, 0]]), w: 6, color: "#3ccf91" },
  { name: "ул. Айни", d: path([[9.5, 0.4], [6, -0.6], [3, -1.4], [0.3, -0.6], [0.25, 0]]), w: 6, color: COLORS.sky },
  { name: "ул. Борбад", d: path([[-9.5, 1.8], [-6, 1.2], [-3, 0.6], [0.25, 0]]), w: 6, color: "#c77dff" },
  { name: "", d: path([[-7, 8.5], [-4, 6.2], [-1.5, 3.4], [0.25, 0]]), w: 4, color: COLORS.goldSoft },
  { name: "", d: path([[9.5, 6.6], [6, 5], [3, 3.4], [0.25, 0]]), w: 4, color: COLORS.goldSoft },
];
export const RIVER = path([[-2.0, -13], [-2.3, -7], [-1.6, -3], [-2.2, 1], [-1.8, 5], [-2.6, 12]]);
export const BLOB =
  "M 150 470 C 300 380, 520 360, 700 400 C 860 430, 990 520, 1010 700 C 1030 900, 1020 1120, 990 1280 C 950 1460, 800 1560, 600 1580 C 420 1600, 230 1540, 150 1400 C 70 1260, 80 1050, 90 850 C 100 680, 90 560, 150 470 Z";

const STREETS: string[] = (() => {
  const out: string[] = [];
  for (let y = 360; y < 1660; y += 34) {
    let x = 40;
    let d = "";
    while (x < 1060) {
      const len = 40 + random(`h${y}-${x}`) * 150;
      if (random(`hg${y}-${x}`) > 0.15) d += `M ${x} ${y + random(`hy${y}${x}`) * 5} L ${x + len} ${y + random(`hy2${y}${x}`) * 5} `;
      x += len + 7;
    }
    out.push(d);
  }
  for (let x = 40; x < 1080; x += 38) {
    let y = 340;
    let d = "";
    while (y < 1680) {
      const len = 40 + random(`v${x}-${y}`) * 170;
      if (random(`vg${x}-${y}`) > 0.18) d += `M ${x + random(`vx${x}${y}`) * 5} ${y} L ${x + random(`vx2${x}${y}`) * 5} ${y + len} `;
      y += len + 7;
    }
    out.push(d);
  }
  return out;
})();

/** The base map: blob, street grid, roads and river, drawn on over `t`. */
export const CityBase: React.FC<{ t: number; start?: number; dim?: number; colorRoads?: number; flow?: number }> = ({ t, start = 0, dim = 1, colorRoads = 0, flow = 0 }) => {
  const g = ip(t, [start, start + 1.4], [0, 1400]);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <clipPath id="cityClip3">
          <path d={BLOB} />
        </clipPath>
        <radialGradient id="gf3">
          <stop offset="0.8" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id="gm3" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920">
          <circle cx={CENTER.x} cy={CENTER.y} r={g} fill="url(#gf3)" />
        </mask>
        <filter id="rglow">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g opacity={dim}>
        <path d={BLOB} fill="#0c1d44" opacity={ip(t, [start, start + 0.8], [0, 0.9])} />
        <g clipPath="url(#cityClip3)" mask="url(#gm3)">
          {STREETS.map((d, i) => (
            <path key={i} d={d} stroke={COLORS.sky} strokeOpacity={0.2} strokeWidth={1.6} fill="none" />
          ))}
        </g>
        <path d={BLOB} fill="none" stroke={COLORS.sky} strokeOpacity={0.6} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ip(t, [start, start + 1.2], [0, 1])} />
        {ROADS.map((r, i) => {
          const p = ip(t, [start + 0.3 + i * 0.08, start + 1.5 + i * 0.08], [0, 1]);
          const c = colorRoads > 0 ? r.color : "#cfe0ff";
          return (
            <g key={i}>
              {colorRoads > 0 && <path d={r.d} fill="none" stroke={c} strokeWidth={r.w * 3} filter="url(#rglow)" opacity={colorRoads * 0.7} />}
              <path d={r.d} fill="none" stroke={c} strokeOpacity={colorRoads > 0 ? 1 : 0.5} strokeWidth={colorRoads > 0 ? r.w + 2 : r.w * 0.6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
              {flow > 0 && <path d={r.d} fill="none" stroke="#fff" strokeWidth={r.w * 0.7} strokeLinecap="round" strokeDasharray="10 40" strokeDashoffset={-t * 120} opacity={flow} />}
            </g>
          );
        })}
        <path d={RIVER} fill="none" stroke={COLORS.river} strokeWidth={18} filter="url(#rglow)" opacity={0.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ip(t, [start + 0.2, start + 1.6], [0, 1])} />
        <path d={RIVER} fill="none" stroke={COLORS.river} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ip(t, [start + 0.2, start + 1.6], [0, 1])} />
        <path d={RIVER} fill="none" stroke="#e6fbff" strokeWidth={3} strokeDasharray="14 30" strokeDashoffset={-t * 60} opacity={ip(t, [start + 1.6, start + 2], [0, 0.7])} />
        <g fontFamily={BODY} fontWeight={800} fontSize={28} letterSpacing={8} fill={COLORS.white} fillOpacity={0.2} opacity={ip(t, [start + 1, start + 1.6], [0, 1])}>
          <text x={200} y={600} textAnchor="middle">ФИРДАВСИ</text>
          <text x={800} y={540} textAnchor="middle">И. СОМОНИ</text>
          <text x={230} y={1200} textAnchor="middle">СИНО</text>
          <text x={850} y={1120} textAnchor="middle">ШОХМАНСУР</text>
        </g>
      </g>
    </svg>
  );
};
