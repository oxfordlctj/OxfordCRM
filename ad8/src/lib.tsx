import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import timeline from './timeline.json';

export const T = timeline;
export const W = 1920;
export const H = 1080;

export const C = {
  ink: '#04060b',
  navy: '#0a1224',
  ivory: '#f3e6c4',
  white: '#f7f4ec',
  gold: '#e9b75b',
  goldHi: '#ffe0a1',
  goldDeep: '#a86f1f',
  cool: '#9fd2ff',
  dim: 'rgba(243,230,196,.62)',
};

export const F = {
  display: '"Oswald", "Roboto Condensed", Impact, sans-serif',
  body: '"Montserrat", "Helvetica Neue", Arial, sans-serif',
  mono: '"JetBrains Mono", Menlo, monospace',
};

/** an edit can retime a scene: shots map their own clock onto the scene's clock */
export const TimeMap = React.createContext<((t: number) => number) | null>(null);
/** 'bare' scenes drop their screen-space titles so the trailer can set its own type */
export const Bare = React.createContext(false);

export const useTime = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const map = React.useContext(TimeMap);
  return map ? map(f / fps) : f / fps;
};
export const useBare = () => React.useContext(Bare);
export const usePortrait = () => {
  const {width, height} = useVideoConfig();
  return {width, height, portrait: height > width};
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const outExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
export const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const inCubic = (x: number) => x * x * x;
export const inOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const inOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
export const outBack = (x: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/** in/hold/out envelope: 0→1 over `fin`, 1 until `b`, →0 over `fout` */
export const window_ = (t: number, a: number, b: number, fin = 0.5, fout = 0.5) =>
  Math.min(outCubic(prog(t, a, a + fin)), 1 - inCubic(prog(t, b - fout, b)));

/**
 * Camera track: cubic Hermite through keyframes with Catmull-Rom tangents.
 * Tangents are never zero between keys, so the camera never comes to rest.
 */
export type Key = {t: number} & Record<string, number>;
export function track(keys: Key[], t: number): Record<string, number> {
  const names = Object.keys(keys[0]).filter((k) => k !== 't');
  const out: Record<string, number> = {};
  const n = keys.length;
  const tangent = (i: number, name: string) => {
    const p = (j: number) => keys[Math.max(0, Math.min(n - 1, j))];
    const a = p(i - 1), b = p(i + 1);
    const dt = b.t - a.t || 1;
    return (b[name] - a[name]) / dt;
  };
  if (t <= keys[0].t || t >= keys[n - 1].t) {
    // extrapolate linearly with end tangent: still moving
    const i = t <= keys[0].t ? 0 : n - 1;
    for (const name of names) out[name] = keys[i][name] + tangent(i, name) * (t - keys[i].t);
    return out;
  }
  let i = 0;
  while (i < n - 2 && t > keys[i + 1].t) i++;
  const k0 = keys[i], k1 = keys[i + 1];
  const h = k1.t - k0.t;
  const s = (t - k0.t) / h;
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
  for (const name of names) {
    out[name] = h00 * k0[name] + h10 * h * tangent(i, name) + h01 * k1[name] + h11 * h * tangent(i + 1, name);
  }
  return out;
}

/** deterministic pseudo-random */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** smooth value noise for handheld shake */
export const noise1 = (x: number, seed = 0) => {
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(rand(i + seed * 57), rand(i + 1 + seed * 57), u) * 2 - 1;
};
export const shake = (t: number, amp: number, freq = 1.3, seed = 0) => ({
  x: (noise1(t * freq, seed) + 0.5 * noise1(t * freq * 2.7, seed + 9)) * amp,
  y: (noise1(t * freq, seed + 3) + 0.5 * noise1(t * freq * 2.3, seed + 17)) * amp,
  r: noise1(t * freq * 0.7, seed + 5) * amp * 0.02,
});

/**
 * Kinetic text: letters fold up from below a mask on their baseline,
 * keep drifting while held, and fall away into depth on exit.
 */
export const Kinetic: React.FC<{
  text: string;
  at: number;
  out: number;
  t: number;
  style?: React.CSSProperties;
  stagger?: number;
  mode?: 'fold' | 'track' | 'blur';
  align?: 'left' | 'center' | 'right';
  charStyle?: React.CSSProperties;
}> = ({text, at, out, t, style, stagger = 0.035, mode = 'fold', align = 'left', charStyle}) => {
  if (t < at - 0.1 || t > out + 0.6) return null;
  const chars = Array.from(text);
  const holdDrift = (t - at) * 0.012;
  return (
    <div style={{display: 'flex', justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start', whiteSpace: 'pre', perspective: 800, ...style}}>
      {chars.map((ch, i) => {
        const ein = outExpo(prog(t, at + i * stagger, at + i * stagger + 0.9));
        const eout = inCubic(prog(t, out + i * stagger * 0.6, out + i * stagger * 0.6 + 0.55));
        let tr = '';
        let op = 1;
        let filt = 'none';
        if (mode === 'fold') {
          tr = `translate3d(0,${(1 - ein) * 100}%,${(1 - ein) * 40 - eout * 260}px) rotateX(${(1 - ein) * -90 + eout * 70}deg)`;
          op = Math.min(1, ein * 3) * (1 - eout);
        } else if (mode === 'track') {
          const sp = (1 - ein) * 0.9 + holdDrift;
          tr = `translate3d(${(i - chars.length / 2) * sp * 0.5}em,0,${-eout * 300}px)`;
          op = ein * (1 - eout);
          filt = ein < 1 ? `blur(${(1 - ein) * 14}px)` : eout > 0 ? `blur(${eout * 12}px)` : 'none';
        } else {
          tr = `translate3d(0,${(1 - ein) * 30}px,0) scale(${1 + (1 - ein) * 0.4})`;
          op = ein * (1 - eout);
          filt = `blur(${(1 - ein) * 18 + eout * 14}px)`;
        }
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'visible'}}>
            <span style={{display: 'inline-block', transform: tr, opacity: op, filter: filt, transformOrigin: '50% 100%', ...charStyle}}>{ch === ' ' ? ' ' : ch}</span>
          </span>
        );
      })}
    </div>
  );
};

/** a line that wipes in left→right then out right→left */
export const Wipe: React.FC<{at: number; out: number; t: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, out, t, children, style}) => {
  if (t < at - 0.1 || t > out + 0.8) return null;
  const a = outExpo(prog(t, at, at + 0.8));
  const b = inCubic(prog(t, out, out + 0.6));
  return (
    <div style={{clipPath: `inset(-20% ${(1 - a) * 100}% -20% ${b * 100}%)`, transform: `translateX(${(1 - a) * -30 + b * 30}px)`, ...style}}>{children}</div>
  );
};

/** metallic gold fill for big type (background-clip text) with a moving sheen */
export const goldFill = (t: number, speed = 0.25, angle = 100): React.CSSProperties => {
  const p = ((t * speed) % 1) * 300 - 100;
  return {
    backgroundImage: `linear-gradient(${angle}deg, #6b4211 0%, #c38a2e 18%, #ffe2a3 ${p - 6}%, #fff6dc ${p}%, #ffe2a3 ${p + 6}%, #c38a2e 70%, #7a4c15 100%)`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  };
};
