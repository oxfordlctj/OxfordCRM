import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/caveat/600.css';
import '@fontsource/caveat/700.css';
import '@fontsource/inter-tight/700.css';
import '@fontsource/inter-tight/800.css';
import N from '../native.json';
import TL from '../native_tl.json';
import logo from '../logo.json';
import {clamp, inOutCubic, lerp, outBack, outCubic, prog, rand} from '../lib';

/*
 * The same "6000-year-old words" story told the way a person would film it: a phone over a
 * squared school notebook, a pen writing the pairs out, a sticky note, a sticker, CapCut-style
 * captions and Instagram text boxes. No neon, no 3D, no trailer.
 */

const HAND = '"Caveat", cursive';
const UI = '"Inter Tight", "Helvetica Neue", Arial, sans-serif';
const INK = {blue: '#1d3c9e', black: '#1b1d24', red: '#d23b34'};
const EV = N.ev;
const X = TL.extra;
const NT = TL.note;
const PAGE = {w: 1080, h: 3100};
const TJX = 110, ARROW = [455, 585], ENX = 625;

let ctx: CanvasRenderingContext2D | null = null;
const widthOf = (text: string, size: number, weight = 700) => {
  ctx = ctx ?? document.createElement('canvas').getContext('2d')!;
  ctx.font = `${weight} ${size}px Caveat`;
  return ctx.measureText(text).width;
};

// ───────── camera: a hand holding a phone ─────────
type Key = {t: number; d: number; y: number; z: number};
const lineY = (i: number) => TL.lines[i].y;
const KEYS: Key[] = [
  {t: -1, d: 0.01, y: 600, z: 1.0},
  ...TL.lines.map((l, i) => ({t: l.t - 0.45, d: 0.6, y: Math.max(620, lineY(i) + 40), z: 1.0})).filter((k) => k.t < NT.in || k.t > NT.out),
  {t: NT.in - 0.25, d: 0.5, y: 900, z: 0.98},
];
KEYS.sort((a, b) => a.t - b.t);
KEYS.push({t: X.zoomOut, d: 1.0, y: 1400, z: 0.58}, {t: X.toBottom, d: 0.9, y: 2620, z: 0.95});
KEYS.sort((a, b) => a.t - b.t);
const camAt = (t: number) => {
  let y = KEYS[0].y, z = KEYS[0].z;
  for (const k of KEYS) {
    if (t < k.t) break;
    const e = inOutCubic(clamp((t - k.t) / k.d));
    y = lerp(y, k.y, e); z = lerp(z, k.z, e);
  }
  if (t < EV.madar) z *= lerp(1.0, 1.06, t / EV.madar);   // slow push in on the hook
  return {y, z};
};
const handheld = (t: number) => ({
  x: Math.sin(t * 1.1 + 0.3) * 5 + Math.sin(t * 2.7 + 1.1) * 2.5 + Math.sin(t * 6.3) * 0.8,
  y: Math.sin(t * 0.9 + 2.0) * 6 + Math.sin(t * 2.3 + 0.5) * 2.5 + Math.sin(t * 7.1 + 3) * 0.8,
  r: Math.sin(t * 0.7 + 1.3) * 0.35 + Math.sin(t * 1.9) * 0.12,
});

// ───────── handwriting ─────────
const Ink: React.FC<{t: number; at: number; d: number; x: number; y: number; size: number; color: string; children: string; weight?: number; rot?: number}> = ({t, at, d, x, y, size, color, children, weight = 700, rot = -1}) => {
  if (t < at) return null;
  const p = clamp((t - at) / d);
  const edge = p * 112 - 8;
  const mask = p >= 1 ? undefined : `linear-gradient(90deg, #000 ${edge}%, transparent ${edge + 6}%)`;
  return (
    <div style={{position: 'absolute', left: x, top: y - size * 0.62, fontFamily: HAND, fontWeight: weight, fontSize: size, lineHeight: 1.2, color, whiteSpace: 'nowrap', opacity: 0.93, transform: `rotate(${rot}deg)`, transformOrigin: '0 50%', textShadow: `0 0 1px ${color}`, maskImage: mask, WebkitMaskImage: mask}}>{children}</div>
  );
};

const Draw: React.FC<{t: number; at: number; d: number; path: string; color: string; width?: number; len?: number}> = ({t, at, d, path, color, width = 5, len = 1400}) => {
  if (t < at) return null;
  const p = outCubic(clamp((t - at) / d));
  return <path d={path} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} opacity={0.9} />;
};

type Stroke = {t: number; d: number; x0: number; x1: number; y: number};

const PageContent: React.FC<{t: number; strokes: Stroke[]}> = ({t, strokes}) => {
  const items: React.ReactNode[] = [];
  TL.lines.forEach((l, i) => {
    if (l.kind === 'header') {
      items.push(<Ink key={`h${i}`} t={t} at={l.t} d={l.d!} x={TJX} y={l.y} size={84} color={INK.red}>рақамҳо ҳам! 😳</Ink>);
      const w = widthOf('рақамҳо ҳам!', 84);
      strokes.push({t: l.t, d: l.d!, x0: TJX, x1: TJX + w, y: l.y});
      return;
    }
    const tjW = widthOf(l.tj!, 92), enW = widthOf(l.en!, 100);
    items.push(<Ink key={`tj${i}`} t={t} at={l.t} d={l.dtj!} x={TJX} y={l.y} size={92} color={INK.blue}>{l.tj!}</Ink>);
    strokes.push({t: l.t, d: l.dtj!, x0: TJX, x1: TJX + tjW, y: l.y});
    // highlighter goes down first, then the word is written over it
    const hl = clamp((t - (l.te! + l.den! + 0.08)) / 0.28);
    if (hl > 0) items.push(<div key={`hl${i}`} style={{position: 'absolute', left: ENX - 14, top: l.y - 30, width: (enW + 28) * outCubic(hl), height: 62, background: l.kind === 'bad' ? 'rgba(255,150,170,.55)' : 'rgba(255,224,40,.55)', mixBlendMode: 'multiply', borderRadius: '10px 26px 14px 30px', transform: `rotate(${-1.2 + rand(i) * 1.5}deg)`}} />);
    items.push(<Ink key={`en${i}`} t={t} at={l.te!} d={l.den!} x={ENX} y={l.y} size={100} color={INK.black}>{l.en!}</Ink>);
    strokes.push({t: l.arrowT!, d: l.arrowD!, x0: ARROW[0], x1: ARROW[1], y: l.y});
    strokes.push({t: l.te!, d: l.den!, x0: ENX, x1: ENX + enW, y: l.y});
    items.push(
      <svg key={`ar${i}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
        <Draw t={t} at={l.arrowT!} d={l.arrowD!} color={INK.blue} width={5} len={260} path={`M${ARROW[0]} ${l.y + 4} C ${ARROW[0] + 40} ${l.y - 10}, ${ARROW[1] - 60} ${l.y + 10}, ${ARROW[1]} ${l.y} M${ARROW[1] - 22} ${l.y - 16} L${ARROW[1]} ${l.y} L${ARROW[1] - 20} ${l.y + 17}`} />
        {l.num && <Draw t={t} at={l.te! + l.den! + 0.1} d={0.35} color={INK.red} width={5} len={400} path={`M1048 ${l.y - 40} C 990 ${l.y - 52}, 978 ${l.y + 40}, 1022 ${l.y + 44} C 1066 ${l.y + 46}, 1074 ${l.y - 30}, 1030 ${l.y - 46}`} />}
        {l.kind === 'bad' && <Draw t={t} at={X.scribble} d={0.35} color={INK.red} width={7} len={1600} path={`M${ENX - 10} ${l.y + 6} l40 -34 l30 52 l40 -56 l34 54 l38 -52 l30 50 l36 -46 l24 30`} />}
      </svg>,
    );
    if (l.num) items.push(<Ink key={`n${i}`} t={t} at={l.te! + l.den! + 0.1} d={0.2} x={1008} y={l.y} size={70} color={INK.red}>{l.num}</Ink>);
    if (l.kind === 'bad') {
      items.push(<Ink key="no" t={t} at={X.noText} d={0.5} x={ENX + enW + 40} y={l.y + 4} size={92} color={INK.red} rot={-6}>НЕ! 😅</Ink>);
      strokes.push({t: X.scribble, d: 0.35, x0: ENX, x1: ENX + enW, y: l.y}, {t: X.noText, d: 0.5, x0: ENX + enW + 40, x1: ENX + enW + 220, y: l.y});
    }
  });
  // the total
  const tenW = widthOf('= 10 калима!', 116);
  items.push(<Ink key="ten" t={t} at={X.ten} d={0.7} x={TJX} y={X.tenY} size={116} color={INK.red} rot={-2}>= 10 калима!</Ink>);
  items.push(
    <svg key="tenu" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
      <Draw t={t} at={X.ten + 0.7} d={0.3} color={INK.red} width={6} len={700} path={`M${TJX} ${X.tenY + 50} C ${TJX + 200} ${X.tenY + 42}, ${TJX + 420} ${X.tenY + 56}, ${TJX + tenW} ${X.tenY + 44}`} />
      <Draw t={t} at={X.ten + 0.85} d={0.3} color={INK.red} width={6} len={700} path={`M${TJX + 20} ${X.tenY + 68} C ${TJX + 220} ${X.tenY + 62}, ${TJX + 400} ${X.tenY + 74}, ${TJX + tenW - 10} ${X.tenY + 64}`} />
      <Draw t={t} at={X.ten + 1.0} d={0.25} color={INK.red} width={9} len={200} path={`M${TJX + tenW + 40} ${X.tenY - 4} l26 30 l54 -70`} />
    </svg>,
  );
  strokes.push({t: X.ten, d: 0.7, x0: TJX, x1: TJX + tenW, y: X.tenY});
  // the question for the comments
  items.push(<Ink key="blank" t={t} at={X.blank} d={0.9} x={TJX} y={X.blankY} size={96} color={INK.blue}>_______ → _______ ?</Ink>);
  strokes.push({t: X.blank, d: 0.9, x0: TJX, x1: TJX + widthOf('_______ → _______ ?', 96), y: X.blankY});
  items.push(<Ink key="cm" t={t} at={X.commentNote} d={0.6} x={TJX + 260} y={X.blankY + 120} size={78} color={INK.red} rot={-3}>дар коммент навис 👇</Ink>);
  strokes.push({t: X.commentNote, d: 0.6, x0: TJX + 260, x1: TJX + 260 + widthOf('дар коммент навис', 78), y: X.blankY + 120});
  return <>{items}</>;
};

// a sticky note slapped onto the page, then peeled off again
const NOTE = {x: 540, y: 900, w: 800, h: 860};
const Sticky: React.FC<{t: number; strokes: Stroke[]}> = ({t, strokes}) => {
  const ox = NOTE.x - NOTE.w / 2, oy = NOTE.y - NOTE.h / 2;
  const S = (s: Stroke) => strokes.push({...s, x0: s.x0 + ox, x1: s.x1 + ox, y: s.y + oy});
  const headW = widthOf('ТАСОДУФ НЕСТ!', 100);
  S({t: NT.head, d: 0.6, x0: 400 - headW / 2, x1: 400 + headW / 2, y: 120});
  S({t: NT.root, d: 0.6, x0: 230, x1: 570, y: 790});
  S({t: NT.trunk, d: 0.9, x0: 400, x1: 400, y: 520});
  S({t: NT.en, d: 0.5, x0: 90, x1: 330, y: 250});
  S({t: NT.tj, d: 0.5, x0: 480, x1: 720, y: 250});
  if (t < NT.in || t > NT.out + 0.6) return null;
  const inP = clamp((t - NT.in) / 0.14);
  const outP = clamp((t - NT.out) / 0.5) ** 2;
  return (
    <div style={{position: 'absolute', left: ox, top: oy, width: NOTE.w, height: NOTE.h, transformOrigin: '50% 0%', transform: `translate(${outP * 1300}px, ${-outP * 260}px) rotate(${-3 + outP * 28}deg) scale(${lerp(1.18, 1, inP)})`, opacity: inP,
      background: 'linear-gradient(170deg, #fff38f 0%, #ffe95c 60%, #f6dc4e 100%)', boxShadow: `0 ${lerp(60, 14, inP) + outP * 50}px ${lerp(80, 26, inP) + outP * 60}px rgba(60,40,0,${0.28 + outP * 0.1})`}}>
      {/* the curled bottom edge */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, background: 'linear-gradient(to top, rgba(140,110,0,.18), transparent)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 90, background: 'linear-gradient(to bottom, rgba(170,140,0,.12), transparent)'}} />
      <Ink t={t} at={NT.head} d={0.6} x={400 - headW / 2} y={120} size={100} color={INK.red} rot={-2}>ТАСОДУФ НЕСТ!</Ink>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={NOTE.w} height={NOTE.h}>
        <Draw t={t} at={NT.trunk} d={0.9} color={INK.black} width={7} len={1600} path="M400 700 C 396 640, 404 580, 400 520 C 380 430, 290 360, 210 300 M400 520 C 420 430, 510 360, 590 300 M400 700 C 360 720, 340 740, 330 750 M400 700 C 440 720, 460 740, 470 752" />
      </svg>
      <div style={{position: 'absolute', left: 386, top: 690, width: 28, height: 28, borderRadius: '50%', background: INK.black, opacity: t > NT.root ? 0.9 : 0}} />
      <Ink t={t} at={NT.root} d={0.6} x={230} y={790} size={76} color={INK.black}>6000 сол пеш</Ink>
      <Ink t={t} at={NT.en} d={0.5} x={90} y={250} size={76} color={INK.blue}>English 🇬🇧</Ink>
      <Ink t={t} at={NT.tj} d={0.5} x={480} y={250} size={76} color={INK.blue}>Тоҷикӣ 🇹🇯</Ink>
    </div>
  );
};

// the Oxford sticker
const Sticker: React.FC<{t: number}> = ({t}) => {
  if (t < X.sticker) return null;
  const p = clamp((t - X.sticker) / 0.16);
  return (
    <div style={{position: 'absolute', left: 540 - 420, top: X.stickerY - 150, width: 840, height: 300, transform: `rotate(-4deg) scale(${lerp(1.35, 1, outCubic(p))})`, opacity: clamp(p * 3), borderRadius: 40, background: '#fff', padding: 14, boxShadow: `0 ${lerp(70, 12, p)}px ${lerp(90, 22, p)}px rgba(0,0,0,${lerp(0.15, 0.28, p)})`}}>
      <div style={{width: '100%', height: '100%', borderRadius: 30, background: 'linear-gradient(135deg, #0d2f86, #0a1f5c)', display: 'flex', alignItems: 'center', gap: 28, padding: '0 40px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden'}}>
        <svg viewBox={`0 0 ${logo.w} 352`} width={150} height={(150 * 352) / logo.w}><path d={logo.emblem} fill="#fff" fillRule="evenodd" /></svg>
        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          <svg viewBox={`0 398 ${logo.w} 69`} width={470} height={(470 * 69) / logo.w}><path d={logo.wordmark} fill="#fff" fillRule="evenodd" /></svg>
          <div style={{fontFamily: UI, fontWeight: 700, fontSize: 30, letterSpacing: '0.38em', color: '#cfe0ff'}}>LEARNING CENTRE</div>
          <div style={{fontFamily: UI, fontWeight: 700, fontSize: 30, color: '#ffd86b'}}>📍 Филиали №8 · назди Алфемо</div>
        </div>
        {/* glossy vinyl */}
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,.18) 42%, transparent 55%)'}} />
      </div>
    </div>
  );
};

// the pen: its tip follows whatever is being written
const Pen: React.FC<{t: number; strokes: Stroke[]}> = ({t, strokes}) => {
  const s = [...strokes].sort((a, b) => a.t - b.t);
  let x = 760, y = 620, down = 0, vis = 1;
  const cur = s.find((k) => t >= k.t && t <= k.t + k.d);
  if (cur) {
    const p = (t - cur.t) / cur.d;
    x = lerp(cur.x0, cur.x1, p) + Math.sin(t * 47) * 4;
    y = cur.y + 10 + Math.sin(t * 31) * 9 + Math.sin(t * 13) * 4;
    down = 1;
  } else {
    const prev = [...s].reverse().find((k) => k.t + k.d < t);
    const next = s.find((k) => k.t > t);
    const from = prev ? {x: prev.x1, y: prev.y + 10} : {x: 760, y: 620};
    const to = next ? {x: next.x0, y: next.y + 10} : {x: from.x + 120, y: from.y + 160};
    const gap = (next ? next.t : t + 9) - (prev ? prev.t + prev.d : -9);
    const q = clamp((t - (prev ? prev.t + prev.d : 0)) / Math.max(0.05, gap));
    if (gap < 1.6) {
      x = lerp(from.x, to.x, inOutCubic(q)); y = lerp(from.y, to.y, inOutCubic(q)) - Math.sin(Math.PI * q) * 40;
    } else {
      // rests off to the side, comes back in time for the next word
      const away = Math.min(clamp((t - (prev ? prev.t + prev.d : -9)) / 0.5), clamp(((next ? next.t : 1e9) - t) / 0.5));
      x = lerp(from.x, from.x + 260, inOutCubic(away)); y = lerp(from.y, from.y + 380, inOutCubic(away));
      if (away > 0.98 && !next) vis = 0;
      if (q > 0.5) { x = lerp(to.x, to.x + 260, inOutCubic(away)); y = lerp(to.y, to.y + 380, inOutCubic(away)); }
    }
  }
  if (t > NT.in - 0.1 && t < NT.out && !cur) {
    // keep it off the sticky note between strokes
  }
  const lift = 1 - down;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: vis, pointerEvents: 'none'}}>
      {/* shadow on the paper: further away when the pen is lifted */}
      <div style={{position: 'absolute', left: 14 + lift * 26, top: 16 + lift * 30, width: 640, height: 40, borderRadius: 20, background: 'rgba(30,25,15,.28)', filter: `blur(${8 + lift * 8}px)`, transform: 'rotate(38deg)', transformOrigin: '0 50%'}} />
      <svg width={700} height={60} style={{position: 'absolute', left: 0, top: -30, overflow: 'visible', transform: `rotate(${36 + lift * 3}deg) translateY(${-lift * 6}px)`, transformOrigin: '0 30px'}}>
        <defs>
          <linearGradient id="barrel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5d7fe0" /><stop offset="0.35" stopColor="#c9d6ff" /><stop offset="0.6" stopColor="#2f55c8" /><stop offset="1" stopColor="#142f7d" />
          </linearGradient>
          <linearGradient id="grip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#444" /><stop offset="0.35" stopColor="#999" /><stop offset="1" stopColor="#111" />
          </linearGradient>
          <linearGradient id="tip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bbb" /><stop offset="0.4" stopColor="#fff" /><stop offset="1" stopColor="#777" />
          </linearGradient>
        </defs>
        <path d="M0 30 L34 22 L34 38 Z" fill="url(#tip)" />
        <path d="M34 18 L150 12 L150 48 L34 42 Z" fill="url(#grip)" />
        <rect x="150" y="10" width="520" height="40" rx="8" fill="url(#barrel)" />
        <rect x="560" y="4" width="22" height="22" rx="4" fill="#1d3c9e" />
        <rect x="150" y="16" width="520" height="5" fill="rgba(255,255,255,.45)" />
      </svg>
    </div>
  );
};

// ───────── screen-space: captions and Instagram text boxes ─────────
type Word = {w: string; t: number; e: number};
const WORDS = N.words as Word[];
const CHUNKS: Word[][] = [];
{
  let cur: Word[] = [];
  WORDS.forEach((w) => {
    cur.push(w);
    if (cur.length >= 3 || /[.!?,]$/.test(w.w)) { CHUNKS.push(cur); cur = []; }
  });
  if (cur.length) CHUNKS.push(cur);
}
const Captions: React.FC<{t: number}> = ({t}) => {
  if (t > X.zoomOut + 0.2 && t < X.toBottom + 0.6) return null;   // the page speaks for itself here
  const c = CHUNKS.find((ch) => t >= ch[0].t - 0.05 && t < ch[ch.length - 1].e + 0.12);
  if (!c) return null;
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 1330, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 18px'}}>
      {c.map((w, i) => {
        const on = t >= w.t && t < w.e + 0.05;
        const pop = on ? 1 + 0.08 * (1 - clamp((t - w.t) / 0.12)) : 1;
        return (
          <span key={i} style={{fontFamily: UI, fontWeight: 800, fontSize: 70, color: on ? '#ffe14d' : '#ffffff', WebkitTextStroke: '11px #000', paintOrder: 'stroke fill', transform: `scale(${pop})`, display: 'inline-block', textShadow: '0 4px 10px rgba(0,0,0,.35)', opacity: t >= w.t - 0.05 ? 1 : 0.0}}>{w.w.replace(/[.,]$/, '')}</span>
        );
      })}
    </div>
  );
};

const IGText: React.FC<{t: number; at: number; out: number; lines: string[]; top?: number}> = ({t, at, out, lines, top = 230}) => {
  if (t < at || t > out) return null;
  const p = outBack(clamp((t - at) / 0.18));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${lerp(0.85, 1, p)})`, opacity: clamp(p * 2)}}>
      {lines.map((l, i) => (
        <span key={i} style={{fontFamily: UI, fontWeight: 700, fontSize: 54, color: '#111', background: '#fff', padding: '8px 22px', borderRadius: 16, marginTop: i ? -4 : 0, lineHeight: 1.15, whiteSpace: 'nowrap'}}>{l}</span>
      ))}
    </div>
  );
};

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const faces = ['700 40px Caveat', '600 40px Caveat', '700 40px "Inter Tight"', '800 40px "Inter Tight"'];
    Promise.all(faces.flatMap((f) => [document.fonts.load(f, 'ҳӯӣҷқғ ҲӮӢҶҚҒ'), document.fonts.load(f, 'mother АБВ 10')]))
      .then(() => document.fonts.ready)
      .then(() => { setReady(true); continueRender(handle); })
      .catch(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  return ready;
};

export const Native: React.FC = () => {
  const ready = useFonts();
  const f = useCurrentFrame();
  const t = f / N.fps;
  if (!ready) return <AbsoluteFill style={{background: '#efece4'}} />;
  const cam = camAt(t);
  const hunt = t < 0.6 ? (1 - t / 0.6) * 3.5 : 0;                     // autofocus hunting on the first frames
  const blur = hunt;   // a moving-camera blur would mean re-blurring the whole page every frame
  const hh = handheld(t);
  const strokes: Stroke[] = [];
  const content = <PageContent t={t} strokes={strokes} />;
  const sticky = <Sticky t={t} strokes={strokes} />;
  return (
    <AbsoluteFill style={{background: '#cdbfae', overflow: 'hidden'}}>
      <AbsoluteFill>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920}}>
          <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${540 + hh.x}px, ${860 + hh.y}px) rotate(${hh.r}deg) scale(${cam.z}) translate(-540px, ${-cam.y}px)`, filter: blur > 0.4 ? `blur(${blur}px)` : undefined}}>
            {/* the table */}
            <div style={{position: 'absolute', left: -520, top: -900, width: 2120, height: PAGE.h + 1500, backgroundImage: `url(${staticFile('table.jpg')})`, backgroundSize: '1080px 1920px'}} />
            {/* the notebook page */}
            <div style={{position: 'absolute', left: 0, top: 0, width: PAGE.w, height: PAGE.h, boxShadow: '0 30px 60px rgba(40,30,20,.35), 0 4px 10px rgba(40,30,20,.25)'}}>
              <Img src={staticFile('paper.jpg')} style={{position: 'absolute', inset: 0, width: PAGE.w, height: PAGE.h}} />
              {/* already on the page before the video starts */}
              <div style={{position: 'absolute', left: TJX, top: 150, fontFamily: HAND, fontWeight: 700, fontSize: 104, color: INK.blue, opacity: 0.92, transform: 'rotate(-1.5deg)'}}>Калимаҳо</div>
              <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}><path d={`M${TJX} 292 C 220 286, 330 298, 470 288`} stroke={INK.blue} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.85} /></svg>
              <div style={{position: 'absolute', left: 780, top: 120, fontFamily: HAND, fontWeight: 600, fontSize: 64, color: '#4a5a8a', opacity: 0.8}}>21.10</div>
              {content}
              <Sticker t={t} />
              {sticky}
              <Pen t={t} strokes={strokes} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
      {/* auto-exposure breathing */}
      <AbsoluteFill style={{background: '#000', opacity: Math.max(0, Math.sin(t * 0.6) * 0.018 + (1 - cam.z) * 0.06)}} />
      {/* desk lamp from the top left, the phone's own shadow bottom right */}
      <AbsoluteFill style={{background: 'radial-gradient(70% 50% at 18% 8%, rgba(255,236,200,.35), transparent 70%)', mixBlendMode: 'soft-light'}} />
      <AbsoluteFill style={{background: `radial-gradient(60% 40% at ${88 + hh.x * 0.2}% ${100 + hh.y * 0.2}%, rgba(40,30,20,.22), transparent 70%)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(120% 90% at 50% 45%, transparent 60%, rgba(30,20,10,.28) 100%)'}} />
      {/* sensor noise */}
      <Img src={staticFile(`grain${f % 6}.png`)} style={{position: 'absolute', left: -((f * 37) % 120), top: -((f * 53) % 90), width: 1200, height: 2010, opacity: 0.16, mixBlendMode: 'overlay'}} />
      <Img src={staticFile(`grain${(f + 3) % 6}.png`)} style={{position: 'absolute', left: -((f * 61) % 120), top: -((f * 29) % 90), width: 1200, height: 2010, opacity: 0.06, mixBlendMode: 'multiply'}} />
      <IGText t={t} at={0.15} out={EV.madar - 0.1} lines={['ту аллакай англисӣ медонӣ', 'ҷиддӣ мегӯям 🤯']} />
      <IGText t={t} at={EV.boz} out={N.duration} lines={['боз кадом калима', 'монанд аст? 🤔']} top={200} />
      <Captions t={t} />
      <Audio src={staticFile('native_mix.wav')} />
    </AbsoluteFill>
  );
};

export const NATIVE_FRAMES = Math.round(N.duration * N.fps);
