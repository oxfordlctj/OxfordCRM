import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import city from '../../public/city.json';
import branches from '../branches.json';
import {C, F, Kinetic, T, Wipe, clamp, goldFill, inCubic, lerp, outBack, outCubic, outExpo, prog, rand, shake, track, useTime, window_} from '../lib';
import {Billboard, Cam, Ground, MapPlane} from '../MapPlane';
import {Extruded} from './Opening';

const PINS = city.pins as unknown as Record<string, [number, number]>;
const OLD = branches.filter((b) => b.n <= 7);
const NEW = branches.find((b) => b.n === 8)!;
const [NX, NY] = PINS[NEW.id];
const REVEAL = T.hits.reveal;
const R = T.reasons;
const G = T.hits.growth;
const LOGO = T.hits.logo;
const [PLACE, MALL] = T.place;

// centroid of the existing network
const CX = OLD.reduce((s, b) => s + PINS[b.id][0], 0) / OLD.length;
const CY = OLD.reduce((s, b) => s + PINS[b.id][1], 0) / OLD.length;

const pinT = (n: number) => T.pins[n - 1];

// routes into #8: from each existing branch and from the city's edges, bowed like real roads
const ROUTES: number[][] = [
  ...OLD.map((b, i) => {
    const [x, y] = PINS[b.id];
    const mx = (x + NX) / 2, my = (y + NY) / 2;
    const bend = (rand(i + 3) - 0.5) * 0.5;
    return [x, y, mx - (y - NY) * bend, my + (x - NX) * bend];
  }),
  ...[0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const x = NX + Math.cos(a) * 1300, y = NY + Math.sin(a) * 1000;
    return [x, y, (x + NX) / 2 + Math.sin(a) * 160, (y + NY) / 2 - Math.cos(a) * 160];
  }),
];
const SCHOOLS = [0, 1, 2, 3, 4, 5].map((i) => {
  const a = (i / 6) * Math.PI * 2 + 0.9 + rand(i) * 0.4;
  const r = 140 + rand(i + 11) * 170;
  return [NX + Math.cos(a) * r, NY + Math.sin(a) * r * 0.85];
});

// camera never parks: it orbits the network, leans toward each new pin, then hunts for #8
const KEYS = [
  {t: 13.5, cx: CX, cy: CY + 200, zoom: 0.24, tilt: 22, rz: -16},
  {t: 15.9, cx: CX, cy: CY + 80, zoom: 0.42, tilt: 40, rz: -8},
  {t: 18.7, cx: CX - 20, cy: CY, zoom: 0.58, tilt: 48, rz: -2},
  ...OLD.map((b) => {
    const [x, y] = PINS[b.id];
    const tt = pinT(b.n);
    return {t: tt + 0.25, cx: lerp(CX, x, 0.5), cy: lerp(CY, y, 0.5), zoom: 0.78 + b.n * 0.012, tilt: 50, rz: -2 + b.n * 2.6};
  }),
  {t: G + 1.1, cx: CX + 60, cy: CY + 20, zoom: 0.52, tilt: 40, rz: 22},
  {t: G + 3.6, cx: CX - 120, cy: CY + 40, zoom: 0.5, tilt: 42, rz: 30},
  {t: REVEAL - 0.45, cx: lerp(CX, NX, 0.7), cy: lerp(CY, NY, 0.7), zoom: 0.66, tilt: 48, rz: 34},
  // during the reveal titles the pin sits right of frame centre, clear of the type
  {t: REVEAL + 1.0, cx: NX - 306, cy: NY + 163, zoom: 0.95, tilt: 54, rz: 28},
  {t: REVEAL + 6.0, cx: NX - 259, cy: NY + 75, zoom: 1.22, tilt: 56, rz: 16},
  {t: R[0] + 1.6, cx: NX, cy: NY, zoom: 1.4, tilt: 58, rz: 0},
  {t: R[1] + 1.8, cx: NX, cy: NY + 60, zoom: 0.68, tilt: 50, rz: -14},
  {t: R[2] + 1.4, cx: NX - 30, cy: NY, zoom: 1.15, tilt: 55, rz: -26},
  {t: LOGO - 2.4, cx: NX, cy: NY, zoom: 0.98, tilt: 50, rz: -36},
  {t: LOGO - 0.1, cx: NX, cy: NY, zoom: 0.3, tilt: 14, rz: -50},
];

const PinHead: React.FC<{n: number; gold?: boolean; a: number; t: number}> = ({n, gold, a, t}) => {
  const col = gold ? C.gold : C.white;
  const h = lerp(0, gold ? 260 : 150, outExpo(a));
  return (
    <div style={{position: 'absolute', left: 0, bottom: 0}}>
      {/* light pillar */}
      <div style={{position: 'absolute', left: gold ? -9 : -2, bottom: 0, width: gold ? 18 : 4, height: h, background: `linear-gradient(to top, ${col}, rgba(255,255,255,0))`, opacity: 0.9, boxShadow: `0 0 ${gold ? 40 : 14}px ${col}`}} />
      <div style={{position: 'absolute', left: -22, bottom: h - 22, width: 44, height: 44, borderRadius: '50%', background: gold ? 'radial-gradient(circle at 35% 30%, #fff1c9, #e9b75b 55%, #8a5a17)' : 'radial-gradient(circle at 35% 30%, #ffffff, #dfe6f0 60%, #8d99ab)', boxShadow: `0 0 30px ${col}, 0 0 4px rgba(0,0,0,.6)`, transform: `scale(${outBack(clamp(a * 1.4))})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 700, fontSize: 24, color: gold ? '#2a1704' : '#0b1224'}}>{n}</div>
      {gold && <div style={{position: 'absolute', left: -60, bottom: h - 60, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,214,140,.55), transparent 65%)', transform: `scale(${1 + Math.sin(t * 5) * 0.08})`}} />}
    </div>
  );
};

const PinLabel: React.FC<{b: (typeof branches)[number]; a: number; compact: number; h: number; gold?: boolean}> = ({b, a, compact, h, gold}) => {
  if (a <= 0) return null;
  const e = outExpo(a);
  return (
    <div style={{position: 'absolute', left: 34, bottom: h - 34, whiteSpace: 'nowrap', clipPath: `inset(-10% ${(1 - e) * 100}% -10% 0)`, transform: `translateX(${(1 - e) * -20}px)`}}>
      <div style={{padding: '10px 18px 12px', background: 'rgba(5,9,18,.72)', borderTop: `2px solid ${gold ? C.gold : 'rgba(255,255,255,.75)'}`, boxShadow: '0 12px 40px rgba(0,0,0,.45)'}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
          <span style={{fontFamily: F.mono, fontSize: 16, color: C.gold}}>{String(b.n).padStart(2, '0')}</span>
          <span style={{fontFamily: F.body, fontWeight: 800, fontSize: 25, letterSpacing: '0.06em', color: C.white, textTransform: 'uppercase'}}>{b.name}</span>
        </div>
        <div style={{fontFamily: F.body, fontWeight: 500, fontSize: 16, color: C.dim, marginTop: 4, maxHeight: (1 - compact) * 30, opacity: 1 - compact, overflow: 'hidden'}}>{b.addr}</div>
      </div>
    </div>
  );
};

const Ripple: React.FC<{t: number; start: number; color: string; size: number; z: number; count?: number; period?: number; width?: number}> = ({t, start, color, size, z, count = 3, period = 2.2, width = 3}) => (
  <>
    {Array.from({length: count}).map((_, i) => {
      if (t < start) return null;
      const p = (((t - start) / period + i / count) % 1);
      return <div key={i} style={{position: 'absolute', left: -size / 2, top: -size / 2, width: size, height: size, borderRadius: '50%', border: `${width / z}px solid ${color}`, transform: `scale(${0.1 + p})`, opacity: (1 - p) * 0.8}} />;
    })}
  </>
);

const ReasonRow: React.FC<{t: number; at: number; next: number; icon: React.ReactNode; title: string; sub: string; idx: number}> = ({t, at, next, icon, title, sub, idx}) => {
  const a = outExpo(prog(t, at, at + 0.9));
  const dim = prog(t, next, next + 0.5);
  if (a <= 0) return null;
  return (
    <div style={{display: 'flex', gap: 22, alignItems: 'center', opacity: a * (1 - dim * 0.55), transform: `translateX(${(1 - a) * -80}px) scale(${1 - dim * 0.12})`, transformOrigin: 'left center', filter: a < 1 ? `blur(${(1 - a) * 10}px)` : undefined}}>
      <div style={{width: 72, height: 72, borderRadius: '50%', border: `2px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(233,183,91,.12)', flex: 'none'}}>{icon}</div>
      <div>
        <div style={{fontFamily: F.mono, fontSize: 15, color: C.gold, letterSpacing: '0.2em'}}>ПРИЧИНА {String(idx).padStart(2, '0')}</div>
        <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 54, lineHeight: 1.05, color: C.white, letterSpacing: '0.02em', textShadow: '0 6px 30px rgba(0,0,0,.7)'}}>{title}</div>
        <div style={{fontFamily: F.body, fontWeight: 500, fontSize: 21, color: C.ivory, opacity: 0.85, marginTop: 4}}>{sub}</div>
      </div>
    </div>
  );
};

const Icon = {
  home: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.goldHi} strokeWidth="1.8"><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></svg>,
  school: <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={C.goldHi} strokeWidth="1.8"><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c3 2.5 9 2.5 12 0v-5" /><path d="M22 9v6" /></svg>,
  route: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.goldHi} strokeWidth="1.8"><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="6" r="2.5" /><path d="M8 17c6 0 2-9 8-10" strokeDasharray="2 2.5" /></svg>,
  heart: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.goldHi} strokeWidth="1.8"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>,
};

export const City: React.FC = () => {
  const t = useTime();
  const k = track(KEYS, t);
  const kick = Math.max(0, 1 - (t - REVEAL) / 1.4) * (t >= REVEAL ? 1 : 0);
  const sh = shake(t, 3 + kick * 26, 0.7 + kick * 6, 4);
  const cam: Cam = {cx: k.cx, cy: k.cy, zoom: k.zoom, tilt: k.tilt, rz: k.rz};
  const z = cam.zoom;

  const fadeIn = outCubic(prog(t, 13.55, 14.4));
  const whip = inCubic(prog(t, LOGO - 1.1, LOGO));
  const lightsFlicker = 0.86 + 0.08 * Math.sin(t * 7.1) * Math.sin(t * 3.3);
  const growth = outCubic(prog(t, G, G + 4));
  const scan = prog(t, G + 1.6, REVEAL - 0.2);
  const lock = outExpo(prog(t, REVEAL - 1.1, REVEAL - 0.1));
  const shownPins = OLD.filter((b) => t >= pinT(b.n) - 0.05).length;
  const cover = outExpo(prog(t, R[3], R[3] + 2.2));
  const coverR = 1500 / city.mpp;

  // network ring order (around the centroid)
  const ring = [...OLD].sort((a, b) => Math.atan2(PINS[a.id][1] - CY, PINS[a.id][0] - CX) - Math.atan2(PINS[b.id][1] - CY, PINS[b.id][0] - CX));
  const ringPath = ring.map((b, i) => `${i ? 'L' : 'M'}${PINS[b.id][0]},${PINS[b.id][1]}`).join('') + 'Z';
  const net = outCubic(prog(t, G + 0.2, G + 2.2));

  return (
    <AbsoluteFill style={{background: '#03050a', opacity: fadeIn}}>
      <MapPlane src="city.jpg" w={city.w} h={city.h} cam={cam} anchorY={620} ground="#070b14" sx={sh.x} sy={sh.y} style={{filter: whip > 0.05 ? `blur(${whip * 14}px)` : fadeIn < 1 ? `blur(${(1 - fadeIn) * 10}px)` : undefined}}>
        <Img src={staticFile('city_glow.png')} style={{position: 'absolute', left: 0, top: 0, width: city.w, height: city.h, opacity: 0.55 * lightsFlicker * (1 + growth * 0.4), transform: 'translateZ(1px)'}} />
        <Img src={staticFile('city_lights.png')} style={{position: 'absolute', left: 0, top: 0, width: city.w, height: city.h, opacity: lightsFlicker, transform: 'translateZ(1px)'}} />

        {/* network of the seven */}
        <svg width={city.w} height={city.h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transform: 'translateZ(2px)'}}>
          <path d={ringPath} fill="rgba(255,255,255,0.035)" stroke={C.ivory} strokeOpacity={0.5 * (1 - prog(t, REVEAL + 6.5, REVEAL + 8.5) * 0.6)} strokeWidth={2.2 / z} pathLength={1} strokeDasharray={`${net} 1`} />
          {t > REVEAL + 0.3 && OLD.map((b, i) => {
            const a = outCubic(prog(t, REVEAL + 0.4 + i * 0.12, REVEAL + 1.4 + i * 0.12));
            return <line key={b.id} x1={NX} y1={NY} x2={lerp(NX, PINS[b.id][0], a)} y2={lerp(NY, PINS[b.id][1], a)} stroke={C.gold} strokeOpacity={0.35 * (1 - prog(t, REVEAL + 7, REVEAL + 8.5))} strokeWidth={1.6 / z} strokeDasharray={`${8 / z} ${8 / z}`} strokeDashoffset={-t * 40 / z} />;
          })}
          {/* reason 2: routes from every district converge on #8 */}
          {t > R[1] - 0.2 && t < LOGO && ROUTES.map((r, i) => {
            const grow = outExpo(prog(t, R[1] + i * 0.07, R[1] + 1.3 + i * 0.07));
            const fade = 1 - prog(t, R[2] + 0.4, R[2] + 1.4) * 0.75;
            const d = `M${r[0]},${r[1]} Q${r[2]},${r[3]} ${NX},${NY}`;
            return (
              <g key={i} opacity={fade}>
                <path d={d} fill="none" stroke={C.gold} strokeOpacity={0.35} strokeWidth={7 / z} pathLength={1} strokeDasharray={`${grow} 1`} />
                <path d={d} fill="none" stroke={C.goldHi} strokeWidth={2.4 / z} pathLength={1} strokeDasharray={`${grow} 1`} />
                {/* traffic: light pulses running inward */}
                {[0, 1, 2].map((j) => {
                  const ph = ((t * 0.55 + j / 3 + rand(i) ) % 1);
                  return <path key={j} d={d} fill="none" stroke="#fff6dc" strokeWidth={5 / z} strokeLinecap="round" pathLength={1} strokeDasharray="0.025 1" strokeDashoffset={-ph} opacity={grow} />;
                })}
              </g>
            );
          })}
        </svg>

        {/* growth: the city keeps spreading */}
        <Ground x={NX} y={NY} z={1}>
          <div style={{position: 'absolute', left: -1100, top: -1100, width: 2200, height: 2200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,180,90,.20), rgba(255,160,70,.07) 40%, transparent 65%)', transform: `scale(${0.2 + growth * 0.8})`, opacity: growth * (1 - prog(t, REVEAL + 1.5, REVEAL + 5.5) * 0.5)}} />
        </Ground>

        {/* radar sweep hunting for #8 */}
        {scan > 0 && scan < 1 && (
          <Ground x={CX + 150} y={CY} z={3}>
            <div style={{position: 'absolute', left: -1500, top: -1500, width: 3000, height: 3000, borderRadius: '50%', background: `conic-gradient(from ${scan * 540}deg, rgba(255,214,140,.0) 0deg, rgba(255,214,140,.0) 300deg, rgba(255,214,140,.32) 358deg, rgba(255,255,255,.6) 360deg)`, opacity: window_(scan, 0, 1, 0.1, 0.12)}} />
            <div style={{position: 'absolute', left: -1500, top: -1500, width: 3000, height: 3000, borderRadius: '50%', border: `${2 / z}px solid rgba(255,214,140,.35)`, opacity: window_(scan, 0, 1, 0.1, 0.12)}} />
          </Ground>
        )}

        {/* reason 1: new blocks light up around #8 */}
        {t > R[0] - 0.2 && t < LOGO && (
          <Ground x={NX} y={NY} z={2}>
            {Array.from({length: 46}).map((_, i) => {
              const ang = rand(i) * Math.PI * 2, rad = 70 + rand(i + 50) * 330;
              const a = outExpo(prog(t, R[0] + rand(i + 9) * 1.6, R[0] + rand(i + 9) * 1.6 + 0.5)) * (1 - prog(t, R[3], R[3] + 1.5) * 0.6);
              const s = 26 + rand(i + 3) * 30;
              return <div key={i} style={{position: 'absolute', left: Math.cos(ang) * rad - s / 2, top: Math.sin(ang) * rad - s / 2, width: s, height: s * (0.6 + rand(i + 7) * 0.6), border: `${1.5 / z}px solid rgba(255,214,140,.9)`, background: 'rgba(255,190,90,.22)', transform: `rotate(${6 + rand(i) * 8}deg) scale(${a})`, opacity: a}} />;
            })}
          </Ground>
        )}

        {/* reason 4: coverage */}
        {cover > 0 && (
          <Ground x={NX} y={NY} z={3}>
            <div style={{position: 'absolute', left: -coverR, top: -coverR, width: coverR * 2, height: coverR * 2, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,214,140,.38), rgba(255,190,90,.14) 60%, rgba(255,190,90,0) 72%)', border: `${3 / z}px solid ${C.gold}`, transform: `scale(${cover})`}} />
          </Ground>
        )}

        {/* lock-on brackets */}
        {lock > 0 && t < REVEAL + 0.4 && (
          <Ground x={NX} y={NY} z={4}>
            {[0, 1, 2, 3].map((i) => {
              const s = lerp(700, 120, lock);
              return <div key={i} style={{position: 'absolute', left: -s / 2, top: -s / 2, width: s, height: s, transform: `rotate(${i * 90 + (1 - lock) * 90}deg)`, borderTop: `${5 / z}px solid ${C.goldHi}`, borderLeft: `${5 / z}px solid ${C.goldHi}`, clipPath: 'polygon(0 0, 30% 0, 30% 30%, 0 30%)', opacity: lock}} />;
            })}
          </Ground>
        )}

        {/* reveal shockwave */}
        {t >= REVEAL && (
          <Ground x={NX} y={NY} z={3}>
            {[0, 1, 2].map((i) => {
              const p = outCubic(prog(t, REVEAL + i * 0.18, REVEAL + 1.8 + i * 0.18));
              return <div key={i} style={{position: 'absolute', left: -900, top: -900, width: 1800, height: 1800, borderRadius: '50%', border: `${(10 - i * 3) / z}px solid ${i ? C.gold : '#fff'}`, transform: `scale(${p})`, opacity: (1 - p) * 0.9}} />;
            })}
            <Ripple t={t} start={REVEAL + 1.5} color={C.gold} size={300} z={z} />
          </Ground>
        )}

        {/* the seven */}
        {OLD.map((b) => {
          const [x, y] = PINS[b.id];
          const at = pinT(b.n);
          const a = prog(t, at - 0.05, at + 0.7);
          const compact = prog(t, at + 1.4, at + 2.0);
          // labels step aside once the camera pulls back, so the network reads as one shape
          const labelA = (a > 0 ? 1 : 0) * clamp(a * 3) * (1 - prog(t, G, G + 0.6));
          return (
            <React.Fragment key={b.id}>
              <Ground x={x} y={y} z={2}><Ripple t={t} start={at} color="rgba(255,255,255,.8)" size={150} z={z} count={2} period={2.6} /></Ground>
              <Billboard x={x} y={y} cam={cam} scale={0.9}>
                <PinHead n={b.n} a={a} t={t} />
                <PinLabel b={b} a={labelA} compact={compact} h={lerp(0, 150, outExpo(a))} />
              </Billboard>
            </React.Fragment>
          );
        })}

        {/* scanning question marks before the reveal */}
        {[0, 1, 2, 3, 4].map((i) => {
          const qx = CX + (rand(i + 20) - 0.3) * 1500, qy = CY + (rand(i + 40) - 0.5) * 900;
          const ph = G + 2.6 + i * 0.42;
          const a = window_(t, ph, ph + 0.8, 0.15, 0.3);
          if (a <= 0) return null;
          return (
            <Billboard key={i} x={qx} y={qy} cam={cam}>
              <div style={{position: 'absolute', left: -24, bottom: 0, fontFamily: F.display, fontWeight: 700, fontSize: 64, color: C.goldHi, opacity: a * 0.85, textShadow: `0 0 20px ${C.gold}`}}>?</div>
            </Billboard>
          );
        })}

        {/* #8 */}
        {t >= REVEAL - 0.05 && (
          <Billboard x={NX} y={NY} cam={cam} scale={1.05}>
            <PinHead n={8} gold a={prog(t, REVEAL, REVEAL + 0.9)} t={t} />
            {/* sparks */}
            {Array.from({length: 36}).map((_, i) => {
              const p = prog(t, REVEAL + rand(i) * 0.3, REVEAL + 1.2 + rand(i + 1) * 1.4);
              if (p <= 0 || p >= 1) return null;
              const vx = (rand(i + 5) - 0.5) * 520, vy = -200 - rand(i + 8) * 520;
              return <div key={i} style={{position: 'absolute', left: vx * p, bottom: -(vy * p + 380 * p * p), width: 5, height: 5, borderRadius: '50%', background: '#fff3d1', boxShadow: `0 0 12px ${C.gold}`, opacity: 1 - p}} />;
            })}
          </Billboard>
        )}
        {/* reason 3: schools and universities around (illustrative markers) */}
        {t > R[2] - 0.2 && t < LOGO && SCHOOLS.map(([sx, sy], i) => {
          const a = outBack(clamp(prog(t, R[2] + i * 0.12, R[2] + 0.6 + i * 0.12))) * (1 - prog(t, R[3] + 1.5, R[3] + 2.2) * 0.7);
          if (a <= 0) return null;
          return (
            <Billboard key={i} x={sx} y={sy} cam={cam} scale={0.8}>
              <div style={{position: 'absolute', left: -26, bottom: 0, width: 52, height: 52, borderRadius: '50%', background: 'rgba(8,12,24,.85)', border: `2px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${a})`, transformOrigin: '50% 100%', boxShadow: `0 0 20px rgba(233,183,91,.5)`}}>{Icon.school}</div>
            </Billboard>
          );
        })}
      </MapPlane>

      {/* horizon haze */}
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(10,16,30,.92) 0%, rgba(10,16,30,.45) 20%, transparent 42%)'}} />

      {/* ── typography layer ── */}
      <AbsoluteFill style={{opacity: 1 - whip}}>
        {/* ДУШАНБЕ */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 170, transform: `translateY(${(t - 13.9) * -6}px)`}}>
          <Kinetic text="ДУШАНБЕ" at={14.1} out={17.9} t={t} stagger={0.05} align="center" style={{fontFamily: F.display, fontWeight: 700, fontSize: 230, lineHeight: 1, letterSpacing: '0.08em', color: C.white, textShadow: '0 12px 60px rgba(0,0,0,.7)'}} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 425, display: 'flex', justifyContent: 'center'}}>
          <Wipe at={16.2} out={18.9} t={t}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 32, letterSpacing: '0.34em', color: C.gold, textShadow: '0 2px 20px rgba(0,0,0,.9)'}}>7 ФИЛИАЛОВ OXFORD</div>
          </Wipe>
        </div>

        {/* counter */}
        {t > 19.2 && t < REVEAL + 3 && (
          <div style={{position: 'absolute', right: 110, top: 128, textAlign: 'right', opacity: window_(t, 19.2, REVEAL + 3, 0.4, 0.6)}}>
            <div style={{fontFamily: F.mono, fontSize: 16, letterSpacing: '0.3em', color: C.dim}}>ФИЛИАЛЫ OXFORD</div>
            <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 92, lineHeight: 1, color: t >= REVEAL ? C.gold : C.white}}>
              {t >= REVEAL ? '08' : String(shownPins).padStart(2, '0')}<span style={{color: C.dim, fontSize: 46}}> / 08</span>
            </div>
          </div>
        )}

        {/* growth / question */}
        <div style={{position: 'absolute', left: 110, bottom: 150}}>
          <Kinetic text="ГОРОД РАСТЁТ" at={G} out={G + 1.4} t={t} style={{fontFamily: F.display, fontWeight: 700, fontSize: 120, lineHeight: 1, color: C.white}} />
        </div>
        <div style={{position: 'absolute', left: 110, bottom: 150}}>
          <Kinetic text="И МЫ РАСТЁМ С НИМ" at={G + 1.65} out={G + 3.4} t={t} stagger={0.03} style={{fontFamily: F.display, fontWeight: 700, fontSize: 120, lineHeight: 1, color: C.white}} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 300}}>
          <Kinetic text="ГДЕ БУДЕТ №8?" at={G + 3.85} out={REVEAL - 0.75} t={t} mode="track" align="center" style={{fontFamily: F.display, fontWeight: 700, fontSize: 170, letterSpacing: '0.06em', color: C.white, textShadow: '0 10px 60px rgba(0,0,0,.8)'}} />
        </div>

        {/* reveal typography */}
        {t > REVEAL - 0.1 && t < REVEAL + 7.2 && (
          <div style={{position: 'absolute', left: 120, top: 150, perspective: 1200, opacity: 1 - prog(t, REVEAL + 6.2, REVEAL + 7.0)}}>
            <div style={{transformStyle: 'preserve-3d', transform: `translateZ(${lerp(-1200, 0, outExpo(prog(t, REVEAL, REVEAL + 1.2)))}px) rotateY(${lerp(50, 14, outExpo(prog(t, REVEAL, REVEAL + 2))) - (t - REVEAL) * 3}deg) rotateX(${6}deg)`}}>
              <Extruded text="8" size={560} t={t} depth={30} />
            </div>
          </div>
        )}
        <div style={{position: 'absolute', left: 520, top: 250}}>
          <Wipe at={REVEAL + 0.2} out={REVEAL + 6.2} t={t}>
            <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.4em', color: C.gold}}>НОВЫЙ ФИЛИАЛ OXFORD</div>
          </Wipe>
          <Kinetic text="ФИЛИАЛ" at={REVEAL + 0.3} out={REVEAL + 6.2} t={t} style={{fontFamily: F.display, fontWeight: 700, fontSize: 130, lineHeight: 1.05, color: C.white, marginTop: 8}} />
          <Kinetic text="ДОМПЕЧАТЬ" at={PLACE} out={REVEAL + 6.3} t={t} stagger={0.04} style={{fontFamily: F.display, fontWeight: 700, fontSize: 150, lineHeight: 1.05}} charStyle={goldFill(t, 0.3)} />
          <Wipe at={MALL} out={REVEAL + 6.3} t={t}>
            <div style={{fontFamily: F.body, fontWeight: 500, fontSize: 28, letterSpacing: '0.3em', color: C.ivory, marginTop: 10}}>ТЦ «АЛФЕМО»</div>
          </Wipe>
        </div>

        {/* why here */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 150}}>
          <Kinetic text="ПОЧЕМУ ЗДЕСЬ?" at={T.hits.orbit} out={R[0] - 0.2} t={t} mode="track" align="center" style={{fontFamily: F.display, fontWeight: 700, fontSize: 150, letterSpacing: '0.05em', color: C.white, textShadow: '0 10px 60px rgba(0,0,0,.8)'}} />
        </div>
        <div style={{position: 'absolute', left: 110, top: 190, display: 'flex', flexDirection: 'column', gap: 34, opacity: 1 - prog(t, LOGO - 1.6, LOGO - 0.8)}}>
          <ReasonRow t={t} at={R[0]} next={R[1]} idx={1} icon={Icon.heart} title="СЕРДЦЕ ГОРОДА" sub="Тысячи людей здесь каждый день" />
          <ReasonRow t={t} at={R[1]} next={R[2]} idx={2} icon={Icon.route} title="МАРШРУТЫ ИЗ ВСЕХ РАЙОНОВ" sub="Легко добраться откуда угодно" />
          <ReasonRow t={t} at={R[2]} next={R[3]} idx={3} icon={Icon.school} title="ШКОЛЫ И ВУЗЫ РЯДОМ" sub="Ученики в шаговой доступности" />
          <ReasonRow t={t} at={R[3]} next={99} idx={4} icon={Icon.home} title="В ЦЕНТРЕ ВАШЕЙ ЖИЗНИ" sub="Лучшее образование — рядом" />
        </div>
      </AbsoluteFill>

      {/* reveal flash */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #fff, #ffd79a 40%, rgba(255,200,120,0) 80%)', opacity: t >= REVEAL ? Math.max(0, 1 - (t - REVEAL) / 0.5) * 0.95 : clamp((t - (REVEAL - 0.08)) / 0.08) * 0.5, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};
