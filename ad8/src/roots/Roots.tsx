import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/oswald/700.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/800.css';
import R from '../roots.json';
import BEATS from '../roots_beats.json';
import LAND from '../roots_land.json';
import logo from '../logo.json';
import {F, clamp, inCubic, inOutCubic, lerp, outBack, outExpo, prog, rand, shake} from '../lib';

/*
 * "You already speak English": Tajik words that share a 6000-year-old root with English.
 * One particle system carries the whole reel: every word, the globe and the Oxford emblem
 * are point sets, and the particles fly from one set to the next.
 */

const W = 1080, HH = 1920;
const N = 2600;
const FOCAL = 1500;
const CY = 860;
const C = {ink: '#02050e', gold: '#ffc864', blue: '#5ec8ff', red: '#ff3b5c', white: '#ffffff', violet: '#b48cff'};

const pulse = (t: number, times: number[], k: number) => {
  let last = -99;
  for (const x of times) if (x <= t && x > last) last = x;
  return last < 0 ? 0 : Math.exp(-(t - last) * k);
};

// ───────── point sets ─────────
type Pts = Float32Array; // x, y, z per particle, centred on (0, 0)
const cache = new Map<string, Pts>();

const fill = (cand: number[], seed: number, jitter: number): Pts => {
  const m = cand.length / 3;
  const out = new Float32Array(N * 3);
  const order = Array.from({length: m}, (_, i) => i).sort((a, b) => rand(a * 1.37 + seed) - rand(b * 1.37 + seed));
  const pick: number[] = [];
  for (let i = 0; i < N; i++) pick.push(order[i % m]);
  pick.sort((a, b) => cand[a * 3] - cand[b * 3]); // left to right, so morphs sweep across
  pick.forEach((k, i) => {
    const dup = i >= m ? 1 : 0;
    out[i * 3] = cand[k * 3] + dup * (rand(i * 3.1) - 0.5) * jitter;
    out[i * 3 + 1] = cand[k * 3 + 1] + dup * (rand(i * 5.7) - 0.5) * jitter;
    out[i * 3 + 2] = cand[k * 3 + 2] + (rand(i * 7.3) - 0.5) * 34;
  });
  return out;
};

let measurer: CanvasRenderingContext2D | null = null;
/** the font size textPts() fits a word to, so crisp DOM copies match the particles */
const fitSize = (text: string, maxSize: number, maxW: number) => {
  measurer = measurer ?? document.createElement('canvas').getContext('2d')!;
  measurer.font = `800 ${maxSize}px Montserrat`;
  const w0 = measurer.measureText(text).width;
  return w0 > maxW ? Math.floor((maxSize * maxW) / w0) : maxSize;
};
const textPts = (text: string, maxSize = 300, maxW = 930, dy = 0): Pts => {
  const key = `t:${text}:${maxSize}:${dy}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = 1080; cv.height = 520;
  const g = cv.getContext('2d')!;
  const size = fitSize(text, maxSize, maxW);
  g.font = `800 ${size}px Montserrat`;
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
  g.fillText(text, 540, 260);
  const d = g.getImageData(0, 0, 1080, 520).data;
  const cand: number[] = [];
  const step = size > 200 ? 4 : 3;
  for (let y = 0; y < 520; y += step) for (let x = 0; x < 1080; x += step) if (d[(y * 1080 + x) * 4 + 3] > 128) cand.push(x - 540, y - 260, 0);
  const pts = fill(cand, text.length * 13.1, step);
  for (let i = 1; i < pts.length; i += 3) pts[i] += dy;
  cache.set(key, pts);
  return pts;
};

const emblemPts = (): Pts => {
  const hit = cache.get('emblem');
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = 1080; cv.height = 900;
  const g = cv.getContext('2d')!;
  const s = 560 / logo.w;
  g.setTransform(s, 0, 0, s, 540 - 280, 450 - (352 * s) / 2);
  g.fillStyle = '#fff';
  g.fill(new Path2D(logo.emblem), 'evenodd');
  const d = g.getImageData(0, 0, 1080, 900).data;
  const cand: number[] = [];
  for (let y = 0; y < 900; y += 3) for (let x = 0; x < 1080; x += 3) if (d[(y * 1080 + x) * 4 + 3] > 128) cand.push(x - 540, y - 450, 0);
  const pts = fill(cand, 7, 3);
  cache.set('emblem', pts);
  return pts;
};

const dustPts = (radius: number, seed: number): Pts => {
  const key = `d:${radius}:${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const out = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const u = rand(i * 1.9 + seed) * 2 - 1, a = rand(i * 2.7 + seed) * Math.PI * 2, r = radius * Math.cbrt(0.2 + 0.8 * rand(i * 4.1 + seed));
    const q = Math.sqrt(1 - u * u);
    out[i * 3] = Math.cos(a) * q * r; out[i * 3 + 1] = u * r * 0.9; out[i * 3 + 2] = Math.sin(a) * q * r;
  }
  cache.set(key, out);
  return out;
};

// ───────── globe ─────────
const GR = 400;
const land = LAND as number[][];
const globeView = (t: number) => ({lon0: lerp(-5, 62, inOutCubic(prog(t, 7.2, 10.2))), lat0: 28});
const sph = (lat: number, lon: number, v: {lon0: number; lat0: number}, alt = 1) => {
  const la = (lat * Math.PI) / 180, dl = ((lon - v.lon0) * Math.PI) / 180, p0 = (v.lat0 * Math.PI) / 180;
  const x = Math.cos(la) * Math.sin(dl);
  const y = Math.sin(la) * Math.cos(p0) - Math.cos(la) * Math.sin(p0) * Math.cos(dl);
  const z = Math.sin(la) * Math.sin(p0) + Math.cos(la) * Math.cos(p0) * Math.cos(dl);
  return [x * GR * alt, -y * GR * alt, z * GR * alt];
};
const GLOBE_PICK = Array.from({length: N}, (_, i) => Math.floor(rand(i * 9.13 + 2) * land.length)).sort((a, b) => land[a][0] - land[b][0]);
const globePts = (t: number): Pts => {
  const v = globeView(t);
  const out = new Float32Array(N * 3);
  GLOBE_PICK.forEach((k, i) => {
    const [x, y, z] = sph(land[k][1], land[k][0], v);
    out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z;
  });
  return out;
};
const ORIGIN = [47, 45], ENGLAND = [52.5, -1.5], TAJIK = [38.6, 68.8];

// ───────── schedule: which shape the particles hold, and when they leave for the next ─────────
// during the word run the Tajik word sits on top and its English twin below it
const TJ = {size: 190, dy: -200};
const EN = {size: 250, dy: 110};
type Shape = {at: number; md: number; burst: number; pts: (t: number) => Pts; color: string; label?: string};
const P = R.pairs;
const SHAPES: Shape[] = [
  {at: -1, md: 0.01, burst: 0, pts: () => textPts('МОДАР'), color: C.gold},
  {at: 4.98, md: 0.6, burst: 1.3, pts: () => textPts('MOTHER'), color: C.blue},
  {at: 7.35, md: 0.8, burst: 0.6, pts: globePts, color: C.blue},
  ...P.flatMap((p) => [
    {at: p.at - 0.26, md: 0.3, burst: 0.45, pts: () => textPts(p.tj, TJ.size, 900, TJ.dy), color: C.gold},
    {at: p.enAt - 0.1, md: 0.28, burst: 0.6, pts: () => textPts(p.en, EN.size, 940, EN.dy), color: C.blue},
  ]),
  {at: R.bad - 0.3, md: 0.36, burst: 0.5, pts: () => textPts('БАД', TJ.size, 900, TJ.dy), color: C.gold},
  {at: R.badEn - 0.08, md: 0.45, burst: 0.4, pts: () => textPts('BAD?', EN.size, 940, EN.dy), color: C.violet},
  {at: R.no - 0.02, md: 0.5, burst: 0.2, pts: () => dustPts(900, 3), color: C.red},
  {at: R.cta - 0.3, md: 0.5, burst: 0.4, pts: () => textPts('10', 520), color: C.blue},
  {at: R.cta2, md: 0.7, burst: 0.3, pts: () => dustPts(560, 9), color: C.blue},
  {at: R.oxford - 0.1, md: 0.45, burst: 0.9, pts: () => emblemPts(), color: C.white},
  {at: R.duration - 0.85, md: 0.8, burst: 0.4, pts: () => textPts('МОДАР'), color: C.gold},
];
const shapeAt = (t: number) => {
  let i = 0;
  while (i + 1 < SHAPES.length && SHAPES[i + 1].at <= t) i++;
  return i;
};

// per-particle random direction for bursts
const DIR = (() => {
  const d = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const u = rand(i * 3.3) * 2 - 1, a = rand(i * 6.1) * Math.PI * 2, q = Math.sqrt(1 - u * u);
    d[i * 3] = Math.cos(a) * q; d[i * 3 + 1] = u; d[i * 3 + 2] = Math.sin(a) * q;
  }
  return d;
})();

const sprites = new Map<string, HTMLCanvasElement>();
const sprite = (color: string) => {
  const hit = sprites.get(color);
  if (hit) return hit;
  const s = document.createElement('canvas');
  s.width = s.height = 32;
  const g = s.getContext('2d')!;
  const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.22, color); gr.addColorStop(0.55, color + '55'); gr.addColorStop(1, color + '00');
  g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
  sprites.set(color, s);
  return s;
};

const camera = (t: number) => {
  let yaw = Math.sin(t * 0.55) * 0.22 + Math.sin(t * 1.3) * 0.05;
  let pitch = Math.sin(t * 0.42) * 0.1;
  let zoom = 1 + Math.sin(t * 0.3) * 0.04;
  if (t < 5) { zoom = lerp(0.82, 1.08, t / 5); yaw = Math.sin(t * 0.7) * 0.3; }
  if (t >= 7.35 && t < 10) { yaw *= 0.2; pitch *= 0.2; }
  if (t >= P[0].at - 0.4 && t < R.no) { yaw *= 0.3; pitch *= 0.3; }
  if (t >= R.oxford) yaw *= 0.4;
  return {yaw, pitch, zoom};
};

// ───────── the canvas: background letters, globe, arcs and particles ─────────
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГҒДЕЁЖЗИӢЙКҚЛМНОПРСТУӮФХҲЧҶШЪЭЮЯ';
const Field: React.FC<{t: number; ready: boolean}> = ({t, ready}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !ready) return;
    const g = cv.getContext('2d')!;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, W, HH);
    const cam = camera(t);
    const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    const proj = (x: number, y: number, z: number, oy = CY): [number, number, number, number] => {
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      const y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      const s = (FOCAL / (FOCAL - z2)) * cam.zoom;
      return [W / 2 + x1 * s, oy + y1 * s, s, z2];
    };

    // flying letters tunnel: the camera flies through the alphabet
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const speed = t < 5 ? 120 : t < 10 ? 260 : 520;
    for (let i = 0; i < 46; i++) {
      const depth = ((rand(i * 2.3) * 3000 + t * speed) % 3000);
      const z = -2600 + depth;
      const ang = rand(i * 4.4) * Math.PI * 2, rad = 520 + rand(i * 8.8) * 700;
      const [sx, sy2, s] = proj(Math.cos(ang) * rad, Math.sin(ang) * rad * 1.5, z);
      const a = clamp(depth / 1200) * clamp((3000 - depth) / 400) * 0.22;
      if (a <= 0.01) continue;
      g.font = `800 ${Math.round(120 * s)}px Montserrat`;
      g.fillStyle = i % 2 ? `rgba(94,200,255,${a})` : `rgba(255,200,100,${a * 0.8})`;
      g.fillText(GLYPHS[Math.floor(rand(i * 5.5) * GLYPHS.length)], sx, sy2);
    }

    // globe body, its land dots and the two roads
    const gA = clamp((t - 7.35) / 0.6) * (1 - clamp((t - P[0].at + 0.4) / 0.35));
    if (gA > 0) {
      const v = globeView(t);
      const [gx, gy, gs] = proj(0, 0, 0);
      const halo = g.createRadialGradient(gx, gy, GR * gs * 0.9, gx, gy, GR * gs * 1.35);
      halo.addColorStop(0, `rgba(80,170,255,${0.35 * gA})`); halo.addColorStop(1, 'rgba(80,170,255,0)');
      g.fillStyle = halo; g.beginPath(); g.arc(gx, gy, GR * gs * 1.35, 0, Math.PI * 2); g.fill();
      const body = g.createRadialGradient(gx - GR * gs * 0.3, gy - GR * gs * 0.35, 10, gx, gy, GR * gs);
      body.addColorStop(0, `rgba(30,70,140,${0.9 * gA})`); body.addColorStop(1, `rgba(4,12,34,${0.95 * gA})`);
      g.fillStyle = body; g.beginPath(); g.arc(gx, gy, GR * gs, 0, Math.PI * 2); g.fill();
      for (let k = 0; k < land.length; k++) {
        const [x, y, z] = sph(land[k][1], land[k][0], v);
        if (z < -40) continue;
        const [sx, sy2, s] = proj(x, y, z);
        g.fillStyle = `rgba(150,215,255,${gA * (0.25 + 0.6 * clamp(z / GR))})`;
        g.fillRect(sx - 1.3 * s, sy2 - 1.3 * s, 2.6 * s, 2.6 * s);
      }
      const road = (to: number[], at: number, color: string, label: string) => {
        const q = outExpo(clamp((t - at) / 1.0));
        if (q <= 0) return;
        const a0 = ORIGIN.map((d) => (d * Math.PI) / 180), a1 = to.map((d) => (d * Math.PI) / 180);
        const v0 = [Math.cos(a0[0]) * Math.cos(a0[1]), Math.cos(a0[0]) * Math.sin(a0[1]), Math.sin(a0[0])];
        const v1 = [Math.cos(a1[0]) * Math.cos(a1[1]), Math.cos(a1[0]) * Math.sin(a1[1]), Math.sin(a1[0])];
        const om = Math.acos(v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2]);
        g.strokeStyle = color; g.lineWidth = 6; g.shadowColor = color; g.shadowBlur = 24; g.globalAlpha = gA;
        g.beginPath();
        let end: [number, number] = [0, 0];
        for (let j = 0; j <= 40; j++) {
          const u = (j / 40) * q;
          const a = Math.sin((1 - u) * om) / Math.sin(om), b = Math.sin(u * om) / Math.sin(om);
          const p = [a * v0[0] + b * v1[0], a * v0[1] + b * v1[1], a * v0[2] + b * v1[2]];
          const lat = (Math.asin(p[2]) * 180) / Math.PI, lon = (Math.atan2(p[1], p[0]) * 180) / Math.PI;
          const [x, y, z] = sph(lat, lon, v, 1 + Math.sin(Math.PI * (j / 40)) * 0.22 * q);
          const [sx, sy2] = proj(x, y, z);
          if (j === 0) g.moveTo(sx, sy2); else g.lineTo(sx, sy2);
          end = [sx, sy2];
        }
        g.stroke();
        g.shadowBlur = 0;
        g.fillStyle = '#fff'; g.beginPath(); g.arc(end[0], end[1], 10, 0, Math.PI * 2); g.fill();
        g.font = '800 46px Montserrat'; g.fillStyle = color;
        g.globalAlpha = gA * clamp((t - at - 0.6) / 0.3);
        g.fillText(label, end[0], end[1] - 46);
        g.globalAlpha = 1;
      };
      // the origin: the steppe, 6000 years ago
      const [ox, oy] = proj(...(sph(ORIGIN[0], ORIGIN[1], v) as [number, number, number]));
      const ring = ((t * 1.2) % 1);
      g.strokeStyle = `rgba(255,200,100,${gA * (1 - ring)})`; g.lineWidth = 4;
      g.beginPath(); g.arc(ox, oy, 14 + ring * 60, 0, Math.PI * 2); g.stroke();
      g.fillStyle = `rgba(255,220,140,${gA})`; g.beginPath(); g.arc(ox, oy, 12, 0, Math.PI * 2); g.fill();
      road(ENGLAND, 8.2, C.blue, 'ENGLISH');
      road(TAJIK, 8.85, C.gold, 'ТОҶИКӢ');
    }

    // particles
    const i = shapeAt(t);
    const cur = SHAPES[i], prev = SHAPES[Math.max(0, i - 1)];
    const p = i === 0 ? 1 : clamp((t - cur.at) / cur.md);
    const e = inOutCubic(p);
    const A = prev.pts(t), B = cur.pts(t);
    const burst = Math.sin(Math.PI * p) * cur.burst * 300;
    const heat = t < 5 ? clamp((t - 3.3) / 0.9) * (1 - clamp((t - 4.15) / 0.3)) : 0;
    const quiver = t >= 4.15 && t < 5 ? (t - 4.15) * 6 : 0;
    const badGlitch = t > R.badEn && t < R.no ? 1 : 0;
    const sA = sprite(prev.color), sB = sprite(cur.color);
    const hot = sprite('#ff9a3c');
    g.globalCompositeOperation = 'lighter';
    const dotScale = cur.pts === globePts && p > 0.95 ? 0.55 : 1;
    for (let k = 0; k < N; k++) {
      const o = k * 3;
      const flick = Math.sin(t * 3 + k) * 1.4;
      let x = lerp(A[o], B[o], e) + DIR[o] * burst + Math.sin(t * 1.7 + k * 0.37) * 1.6;
      let y = lerp(A[o + 1], B[o + 1], e) + DIR[o + 1] * burst + flick;
      const z = lerp(A[o + 2], B[o + 2], e) + DIR[o + 2] * burst;
      if (heat + quiver > 0) { x += (rand(k + Math.floor(t * 30)) - 0.5) * (heat * 3 + quiver); y += (rand(k * 2 + Math.floor(t * 30)) - 0.5) * (heat * 3 + quiver); }
      if (badGlitch && rand(Math.floor(t * 15) + k * 0.01) > 0.85) x += (rand(k + Math.floor(t * 20)) - 0.5) * 60;
      const [sx, sy2, s, zz] = proj(x, y, z);
      if (zz > FOCAL - 50) continue;
      const useB = rand(k * 0.913) < e * 1.1 - 0.05;
      const size = (9 + rand(k * 1.7) * 6) * s * dotScale;
      g.globalAlpha = 0.85 * (cur.pts === globePts && zz < -30 ? 0.2 : 1);
      g.drawImage(heat > 0.3 && rand(k * 3.3) < heat * 0.5 ? hot : useB ? sB : sA, sx - size / 2, sy2 - size / 2, size, size);
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }, [t, ready]);
  return <canvas ref={ref} width={W} height={HH} style={{position: 'absolute', inset: 0}} />;
};

// ───────── typography ─────────
const Slam: React.FC<{t: number; at: number; out: number; children: React.ReactNode; style?: React.CSSProperties; from?: number}> = ({t, at, out, children, style, from = 1.6}) => {
  if (t < at || t > out + 0.05) return null;
  const e = outExpo(prog(t, at, at + 0.3));
  const x = inCubic(prog(t, out - 0.15, out));
  const split = 12 * (1 - e);
  return (
    <div style={{position: 'relative', transform: `scale(${lerp(from, 1, e) * (1 + x * 0.2) * (1 + (t - at) * 0.02)})`, opacity: Math.min(1, e * 2.5) * (1 - x), filter: (1 - e) * 12 + x * 10 > 0.3 ? `blur(${(1 - e) * 12 + x * 10}px)` : undefined, ...style}}>
      <div style={{position: 'absolute', inset: 0, color: 'rgba(255,60,110,.75)', transform: `translateX(${split}px)`, mixBlendMode: 'screen'}}>{children}</div>
      <div style={{position: 'absolute', inset: 0, color: 'rgba(60,220,255,.85)', transform: `translateX(${-split}px)`, mixBlendMode: 'screen'}}>{children}</div>
      <div style={{position: 'relative'}}>{children}</div>
    </div>
  );
};
const H: React.CSSProperties = {fontFamily: F.body, fontWeight: 800, color: C.white, lineHeight: 1, textAlign: 'center', whiteSpace: 'nowrap', textShadow: '0 8px 40px rgba(0,0,0,.6)'};
const Center: React.FC<{top: number; children: React.ReactNode; gap?: number}> = ({top, children, gap = 10}) => (
  <div style={{position: 'absolute', left: 20, right: 20, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap}}>{children}</div>
);
const Tag: React.FC<{children: React.ReactNode; color: string}> = ({children, color}) => (
  <div style={{padding: '12px 30px', borderRadius: 999, border: `2px solid ${color}`, background: 'rgba(2,5,14,.55)', fontFamily: F.body, fontWeight: 800, fontSize: 40, letterSpacing: '0.18em', color, whiteSpace: 'nowrap', boxShadow: `0 0 30px ${color}55`}}>{children}</div>
);

// ───────── overlays per beat of the story ─────────
const Hook: React.FC<{t: number}> = ({t}) => {
  const n = Math.round(lerp(0, 6000, outExpo(prog(t, 1.6, 2.9))));
  return (
    <>
      <Center top={300}>
        <Slam t={t} at={0.2} out={4.1} from={1.2} style={{...H, fontSize: 64, letterSpacing: '0.3em', color: '#ffe2a8'}}>ИН КАЛИМА</Slam>
      </Center>
      <Center top={1120}>
        <Slam t={t} at={1.55} out={4.1} style={{...H, fontFamily: F.display, fontWeight: 700, fontSize: 230, color: C.gold, textShadow: '0 0 40px rgba(255,170,60,.7)'}}>{n.toLocaleString('ru-RU')}</Slam>
        <Slam t={t} at={2.2} out={4.1} from={1.3} style={{...H, fontSize: 70, letterSpacing: '0.25em'}}>СОЛ ДОРАД</Slam>
      </Center>
    </>
  );
};

const Mother: React.FC<{t: number}> = ({t}) => (
  <>
    <Center top={560}>
      <Slam t={t} at={5.25} out={7.3} from={1.2} style={{...H, fontSize: 58, letterSpacing: '0.3em', color: C.gold}}>МОДАР =</Slam>
    </Center>
    <Center top={1130}>
      <Slam t={t} at={5.94} out={7.3} style={{...H, fontSize: 104}}>ИН ТАСОДУФ</Slam>
      <Slam t={t} at={6.3} out={7.3} style={{...H, fontSize: 132, color: C.blue, textShadow: '0 0 40px rgba(94,200,255,.8)'}}>НЕСТ!</Slam>
    </Center>
  </>
);

const Globe: React.FC<{t: number}> = ({t}) => (
  <>
    <Center top={250}>
      <Slam t={t} at={7.5} out={9.65} style={{...H, fontSize: 96}}>ЯК ЗАБОН</Slam>
      <Slam t={t} at={8.85} out={9.65} style={{...H, fontSize: 96, color: C.gold}}>ДУ РОҲ</Slam>
    </Center>
    <Center top={1420}>
      <Slam t={t} at={7.9} out={9.65} from={1.2}><Tag color="#ffd28a">6000 СОЛ ПЕШ</Tag></Slam>
    </Center>
  </>
);

const Run: React.FC<{t: number}> = ({t}) => {
  let k = -1;
  P.forEach((p, i) => { if (t >= p.at - 0.32) k = i; });
  if (k < 0) return null;
  const count = 1 + P.filter((q) => t >= q.enAt).length;
  const bump = pulse(t, P.map((q) => q.enAt), 6);
  return (
    <>
      {/* counter: how many English words you already know */}
      <div style={{position: 'absolute', right: 60, top: 220, width: 190, height: 190, transform: `scale(${1 + bump * 0.18})`}}>
        <svg width="190" height="190" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="rgba(2,5,14,.6)" stroke="rgba(255,255,255,.2)" strokeWidth="5" />
          <circle cx="50" cy="50" r="44" fill="none" stroke={C.blue} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(count / 10) * 276} 276`} transform="rotate(-90 50 50)" style={{filter: 'drop-shadow(0 0 4px #5ec8ff)'}} />
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 70, color: '#fff', lineHeight: 1}}>{count}<span style={{fontSize: 36, opacity: 0.6}}>/10</span></div>
        </div>
      </div>
      <Center top={250}>
        <div style={{...H, fontSize: 40, letterSpacing: '0.24em', color: 'rgba(255,255,255,.75)'}}>ТОҶИКӢ → ENGLISH</div>
      </Center>
      {/* crisp copies take over from the particles and hold until the next pair arrives */}
      {P.map((q, i) => {
        const next = P[i + 1];
        const until = next ? next.enAt : R.bad + 0.2;
        if (t < q.enAt - 0.12 || t > until + 0.3) return null;
        const inE = clamp((t - q.enAt - 0.16) / 0.12);
        const away = clamp((t - until) / 0.3);
        const tjIn = clamp((t - q.enAt + 0.12) / 0.1);
        const tjOut = next ? clamp((t - (next.at - 0.26)) / 0.12) : clamp((t - R.bad + 0.3) / 0.12);
        const cam = camera(t);
        const plane: React.CSSProperties = {position: 'absolute', left: 0, right: 0, top: 0, height: HH, perspective: FOCAL, perspectiveOrigin: `540px ${CY}px`};
        const word = (txt: string, size: number, dy: number, color: string, op: number, extra = '') => (
          <div style={plane}>
            <div style={{position: 'absolute', left: 0, right: 0, top: CY + dy, transform: `translateY(-50%) rotateY(${(cam.yaw * 180) / Math.PI}deg) rotateX(${(-cam.pitch * 180) / Math.PI}deg) ${extra}`, transformOrigin: `540px ${-dy}px`, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: size * cam.zoom, lineHeight: 1, color, opacity: op, whiteSpace: 'nowrap', textShadow: `0 0 18px ${color}, 0 0 50px ${color}88`}}>{txt}</div>
          </div>
        );
        return (
          <React.Fragment key={q.en}>
            {word(q.tj, fitSize(q.tj, TJ.size, 900), TJ.dy, '#ffe2a8', tjIn * (1 - tjOut))}
            {word(q.en, fitSize(q.en, EN.size, 940), EN.dy, '#e6f6ff', inE * (1 - away), `translateZ(${away * 700}px)`)}
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: CY - 112, display: 'flex', justifyContent: 'center'}}>
        <svg width="64" height="56" viewBox="0 0 24 21" style={{opacity: 0.8, filter: 'drop-shadow(0 0 8px #5ec8ff)'}}><path d="M12 2v15M6 11l6 6 6-6" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </>
  );
};

const Bad: React.FC<{t: number}> = ({t}) => (
  <>
    <Center top={420}>
      <Slam t={t} at={R.bad} out={R.no - 0.05} style={{...H, fontSize: 92}}>ВА ИН ҲАМ?</Slam>
    </Center>
    <Center top={1160}>
      <Slam t={t} at={R.badEn + 0.1} out={R.no - 0.05} from={2}><div style={{...H, fontFamily: F.display, fontWeight: 700, fontSize: 200, color: C.violet, transform: `scale(${1 + Math.sin(t * 9) * 0.04})`}}>?</div></Slam>
    </Center>
  </>
);

const No: React.FC<{t: number}> = ({t}) => {
  const lt = t - R.no;
  const st = outBack(clamp(lt / 0.25));
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', opacity: clamp((R.cta - 0.2 - t) / 0.2)}}>
        <div style={{padding: '20px 70px', border: `14px solid ${C.red}`, borderRadius: 30, transform: `rotate(-9deg) scale(${lerp(3, 1, st)})`, opacity: clamp(lt / 0.1), fontFamily: F.display, fontWeight: 700, fontSize: 280, lineHeight: 1, color: C.red, textShadow: '0 0 50px rgba(255,59,92,.7)', boxShadow: '0 0 60px rgba(255,59,92,.5), inset 0 0 40px rgba(255,59,92,.4)'}}>НЕ!</div>
      </div>
      <Center top={1130}>
        <Slam t={t} at={R.no + 0.86} out={R.cta - 0.2} style={{...H, fontSize: 92}}>ИН — ТАСОДУФ</Slam>
        <Slam t={t} at={R.no + 1.2} out={R.cta - 0.2} from={1.2}><Tag color="#ffb3c0">БАД ≠ BAD</Tag></Slam>
      </Center>
    </>
  );
};

const WORDS = ['MOTHER', ...P.map((p) => p.en)];
const Cta: React.FC<{t: number}> = ({t}) => {
  const lt = t - R.cta;
  const ox = R.oxford;
  const a = (d: number) => outExpo(clamp((t - ox - d) / 0.45));
  const fade = 1 - clamp((t - (R.duration - 0.6)) / 0.4);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: fade}}>
      {t < ox - 0.1 && (
        <>
          {/* the ten words orbit the "10" */}
          <div style={{position: 'absolute', left: 540, top: CY, perspective: 1200, opacity: clamp(lt / 0.4) * (1 - clamp((t - R.cta2) / 0.4))}}>
            {WORDS.map((w, i) => {
              const ang = (i / WORDS.length) * Math.PI * 2 + lt * 0.9;
              const z = Math.cos(ang);
              return (
                <div key={w} style={{position: 'absolute', transform: `translate(-50%, -50%) translate3d(${Math.sin(ang) * 420}px, ${Math.cos(ang) * 120 - 20}px, ${z * 200}px)`, fontFamily: F.body, fontWeight: 800, fontSize: 40, color: C.blue, opacity: 0.35 + 0.65 * (z + 1) / 2, textShadow: '0 0 20px rgba(94,200,255,.7)', whiteSpace: 'nowrap'}}>{w}</div>
              );
            })}
          </div>
          <Center top={330}>
            <Slam t={t} at={R.cta} out={R.cta2 - 0.05} style={{...H, fontSize: 84}}>ТУ АЛЛАКАЙ</Slam>
          </Center>
          <Center top={1170}>
            <Slam t={t} at={R.cta + 0.9} out={R.cta2 - 0.05} style={{...H, fontSize: 64}}>КАЛИМАИ АНГЛИСӢ</Slam>
            <Slam t={t} at={R.cta + 1.6} out={R.cta2 - 0.05} style={{...H, fontSize: 96, color: C.blue}}>МЕДОНӢ!</Slam>
          </Center>
          <Center top={760}>
            <Slam t={t} at={R.cta2} out={ox - 0.1} style={{...H, fontSize: 92}}>БОҚИМОНДААШ —</Slam>
            <Slam t={t} at={R.cta2 + 1.0} out={ox - 0.1} style={{...H, fontSize: 92, color: C.gold}}>ДАР…</Slam>
          </Center>
        </>
      )}
      {t >= ox - 0.1 && (
        <>
          <Center top={1150} gap={8}>
            <div style={{opacity: a(0.05), transform: `scale(${lerp(1.4, 1, a(0.05))})`}}>
              <svg viewBox={`0 398 ${logo.w} 69`} width={760} height={(760 * 69) / logo.w} style={{filter: 'drop-shadow(0 0 30px rgba(94,200,255,.8))'}}><path d={logo.wordmark} fill="#fff" fillRule="evenodd" /></svg>
            </div>
            <div style={{fontFamily: F.body, fontWeight: 500, fontSize: 30, letterSpacing: '0.5em', color: '#dbeeff', opacity: a(0.2)}}>LEARNING CENTRE</div>
            <div style={{marginTop: 22, opacity: a(0.35), transform: `translateY(${(1 - a(0.35)) * 30}px)`}}><Tag color={C.gold}>ФИЛИАЛИ №8 · НАЗДИ АЛФЕМО</Tag></div>
          </Center>
          <Center top={250} gap={6}>
            <div style={{...H, fontSize: 56, opacity: a(0.6), transform: `translateY(${(1 - a(0.6)) * -30}px)`}}>БОЗ КАДОМ КАЛИМА</div>
            <div style={{...H, fontSize: 56, color: C.blue, opacity: a(0.75), transform: `translateY(${(1 - a(0.75)) * -30}px)`}}>МОНАНД АСТ?</div>
            <svg width="70" height="70" viewBox="0 0 24 24" style={{marginTop: 10, opacity: a(0.9), transform: `translateY(${Math.sin(t * 8) * 8}px)`, filter: 'drop-shadow(0 0 10px #5ec8ff)'}}><path d="M12 3v16M5 12l7 7 7-7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div style={{...H, fontSize: 44, letterSpacing: '0.2em', color: C.gold, opacity: a(1.0)}}>ДАР КОММЕНТ НАВИС</div>
          </Center>
        </>
      )}
    </div>
  );
};

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const faces = ['700 40px Oswald', '500 20px Montserrat', '800 20px Montserrat'];
    Promise.all(faces.flatMap((f) => [document.fonts.load(f, 'ҶӮӢҲҚҒ МОДАР'), document.fonts.load(f, 'MOTHER 6000')]))
      .then(() => document.fonts.ready)
      .then(() => { setReady(true); continueRender(handle); })
      .catch(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  return ready;
};

export const Roots: React.FC = () => {
  const ready = useFonts();
  const f = useCurrentFrame();
  const t = f / R.fps;
  const {width, height} = useVideoConfig();
  const kick = pulse(t, BEATS.kicks, 11);
  const hit = pulse(t, R.hits, 9);
  const big = pulse(t, R.bigHits, 4);
  const sh = shake(t, 2 + big * 28 + hit * 6, 1.5 + big * 9, 13);
  const warm = t < 5;
  const red = t >= R.no && t < R.cta - 0.2 ? Math.exp(-(t - R.no) * 2) : 0;
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: warm ? 'radial-gradient(80% 50% at 50% 45%, #3a2208 0%, #120a04 50%, #030201 100%)' : 'radial-gradient(85% 55% at 50% 45%, #0b2a6b 0%, #050f2e 50%, #01030a 100%)'}} />
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${1 + kick * 0.02 + hit * 0.035})`}}>
        <Field t={t} ready={ready} />
        {t < 5 && <Hook t={t} />}
        {t >= 5 && t < 7.4 && <Mother t={t} />}
        {t >= 7.4 && t < 9.75 && <Globe t={t} />}
        {t >= 9.6 && t < R.bad - 0.3 && <Run t={t} />}
        {t >= R.bad - 0.3 && t < R.no && <Bad t={t} />}
        {t >= R.no && t < R.cta - 0.2 && <No t={t} />}
        {t >= R.cta - 0.3 && <Cta t={t} />}
      </AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(255,30,60,${red * 0.35})`, mixBlendMode: 'screen', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: `linear-gradient(to bottom, transparent ${50 - 0.3}%, rgba(150,220,255,${0.6 * hit}) 50%, transparent ${50 + 0.3}%)`, mixBlendMode: 'screen', transform: `scaleX(${1 + hit * 2})`, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'radial-gradient(110% 80% at 50% 50%, transparent 55%, rgba(0,0,0,.55) 85%, rgba(0,0,0,.9) 100%)', pointerEvents: 'none'}} />
      <Img src={staticFile(`grain${f % 6}.png`)} style={{position: 'absolute', left: -((f * 37) % 120), top: -((f * 53) % 90), width: width + 120, height: height + 90, opacity: 0.07, mixBlendMode: 'overlay'}} />
      <AbsoluteFill style={{background: '#fff', opacity: big * 0.5, pointerEvents: 'none'}} />
      <Audio src={staticFile('roots_mix.wav')} />
    </AbsoluteFill>
  );
};

export const ROOTS_FRAMES = Math.round(R.duration * R.fps);
