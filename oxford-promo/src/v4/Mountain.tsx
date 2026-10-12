import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AMIR, Kid, isBlink } from "./Characters";
import { Tale, pop } from "./Kit";
import { BACK, C, EASE_OUT, STORY, ip } from "./theme";

const WORDS = ["GRAMMAR", "PRESENT PERFECT", "IRREGULAR VERBS", "a / an / the", "WORDS", "LISTENING", "IELTS", "PHRASAL VERBS", "SPELLING", "TENSES", "ARTICLES", "PREPOSITIONS", "IDIOMS", "ACCENT"];
const BLOCK_COLORS = ["#6C5CE7", "#8E7CF0", "#5A4BD6", "#A29BFE", "#4B3FC0"];

/** Pyramid of word blocks; `rows` grow in with a stagger. */
export const WordMountain: React.FC<{ t: number; at: number; cx: number; base: number; scale?: number; rows?: number }> = ({ t, at, cx, base, scale = 1, rows = 7 }) => {
  const blocks: React.ReactNode[] = [];
  let k = 0;
  for (let r = 0; r < rows; r++) {
    const n = rows - r;
    for (let i = 0; i < n; i++) {
      const w = 150;
      const h = 92;
      const x = cx + (i - (n - 1) / 2) * w;
      const y = base - (r + 1) * h;
      const s = at + r * 0.14 + i * 0.03;
      const p = ip(t, [s, s + 0.35], [0, 1], BACK);
      const word = WORDS[k % WORDS.length];
      blocks.push(
        <g key={`${r}-${i}`} transform={`translate(${x} ${y + (1 - p) * -300}) scale(${p})`} opacity={p}>
          <rect x={-w / 2 + 3} y={0} width={w - 6} height={h - 6} rx={14} fill={BLOCK_COLORS[k % 5]} stroke={C.ink} strokeWidth={5} />
          <text x={0} y={h / 2 + 4} textAnchor="middle" fontFamily={STORY} fontWeight={900} fontSize={word.length > 9 ? 17 : 24} fill={C.white}>
            {word}
          </text>
        </g>,
      );
      k++;
    }
  }
  return <g transform={`translate(${cx} ${base}) scale(${scale}) translate(${-cx} ${-base})`}>{blocks}</g>;
};

const ICONS = [
  { label: "▶", bg: C.coral },
  { label: "APP", bg: C.teal },
  { label: "ABC", bg: C.lamp },
  { label: "?!", bg: "#9B5DE5" },
  { label: "≡", bg: C.green },
];

export const Mountain: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const flash = (Math.max(0, 1 - Math.abs(t - 2.2) * 6) + Math.max(0, 1 - Math.abs(t - 6.3) * 6)) * 0.8;
  const chaos = ip(t, [3.8, 4.2], [0, 1], EASE_OUT);
  const grow = 1 + ip(t, [6.1, 6.8], [0, 0.25], BACK);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #1A1446 0%, #3B2C78 60%, #5B3E8F 100%)`, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "#EDE7FF", opacity: flash }} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {/* storm clouds */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${((i * 320 + t * 30) % 1400) - 200} ${380 + (i % 2) * 90})`} opacity={0.75}>
            <ellipse cx={0} cy={0} rx={150} ry={60} fill="#2A2160" />
            <ellipse cx={90} cy={-30} rx={110} ry={70} fill="#2A2160" />
            <ellipse cx={-80} cy={-20} rx={90} ry={55} fill="#2A2160" />
          </g>
        ))}
        {flash > 0.2 && <path d="M 760 420 L 700 620 L 760 620 L 690 820" stroke="#FFF6B0" strokeWidth={12} fill="none" strokeLinejoin="round" />}
        <g opacity={1 - chaos * 0.35}>
          <WordMountain t={t} at={0.3} cx={540} base={1700} scale={grow} />
        </g>
        <rect x={0} y={1690} width={1080} height={240} fill="#2B2160" />
        {/* tiny Amir looking up */}
        <g opacity={1 - chaos}>
          <Kid look={AMIR} mood="sad" x={150} y={1730} scale={0.42} blink={isBlink(f)} lookX={4} />
        </g>
        {/* chaos: everything at once */}
        {chaos > 0 && (
          <g opacity={chaos}>
            <circle cx={540} cy={1180} r={420 * chaos} fill="#1A1446" opacity={0.55} />
            <Kid look={AMIR} mood="dizzy" x={540} y={1650} scale={1.05} arms={[150 + Math.sin(t * 9) * 15, 150 + Math.cos(t * 9) * 15]} blink={false} />
            {[0, 1].map((k) => (
              <path key={k} d="M 0 0 C 20 -20 40 0 20 20 C 0 40 -30 10 -10 -10" transform={`translate(${500 + k * 80} 1220) rotate(${t * 400 + k * 90})`} stroke={C.white} strokeWidth={6} fill="none" />
            ))}
            {ICONS.map((ic, i) => {
              const a = t * 2.2 + (i / ICONS.length) * Math.PI * 2;
              const x = 540 + Math.cos(a) * 400;
              const y = 960 + Math.sin(a) * 120;
              const p = pop(t, 3.9 + i * 0.1);
              return (
                <g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(t * 3 + i) * 15}) scale(${p})`}>
                  <rect x={-62} y={-100} width={124} height={200} rx={24} fill={C.ink} />
                  <rect x={-50} y={-82} width={100} height={164} rx={14} fill={ic.bg} />
                  <text x={0} y={18} textAnchor="middle" fontFamily={STORY} fontWeight={900} fontSize={40} fill={C.white}>
                    {ic.label}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </svg>
      <Tale t={t} at={0.5} until={3.7} text="…но английский казался ему огромной горой." accent={["горой"]} />
      <Tale t={t} at={3.95} until={6.0} text="Видео, приложения, зубрёжка…" />
      <Tale t={t} at={6.1} until={7.8} text="А гора всё росла!" accent={["росла"]} size={70} />
      <div style={{ position: "absolute", top: 1760, width: "100%", textAlign: "center", fontFamily: STORY, fontWeight: 900, fontSize: 64, color: C.white, opacity: ip(t, [4.4, 4.7, 6.0, 6.2], [0, 1, 1, 0]) * chaos, rotate: `${Math.sin(t * 8) * 3}deg` }}>
        ничего не понятно…
      </div>
    </AbsoluteFill>
  );
};
