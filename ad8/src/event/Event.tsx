import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/oswald/700.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/jetbrains-mono/400.css';
import E from '../event.json';
import BEATS from '../event_beats.json';
import logo from '../logo.json';
import city from '../../public/city.json';
import {F, clamp, inCubic, lerp, outBack, outExpo, prog, rand, shake} from '../lib';
import {Billboard, Cam, Ground, MapPlane} from '../MapPlane';

const useT = () => useCurrentFrame() / E.fps;
const B = {deep: '#03123a', blue: '#0b46c9', bright: '#2f86ff', glow: '#6cc4ff', white: '#ffffff', gold: '#e9b75b', ink: '#020818'};
const CUT = {w: 798, h: 682};

const pulse = (t: number, times: number[], k: number) => {
  let last = -99;
  for (const x of times) if (x <= t && x > last) last = x;
  return last < 0 ? 0 : Math.exp(-(t - last) * k);
};
const blueFill = (t: number): React.CSSProperties => {
  const p = ((t * 0.5) % 1) * 260 - 80;
  return {backgroundImage: `linear-gradient(100deg, #9fdcff 0%, #e8f7ff ${p - 8}%, #ffffff ${p}%, #e8f7ff ${p + 8}%, #6cc4ff 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};
};

// ───────── stage ─────────
const Stage: React.FC<{t: number; dark?: number}> = ({t, dark = 0}) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 45%, ${dark > 0.5 ? '#061a52' : '#1356e0'} 0%, ${dark > 0.5 ? '#020a24' : '#06258a'} 45%, ${B.ink} 100%)`}}>
      <AbsoluteFill style={{opacity: 0.45, transform: `rotate(${t * 7}deg) scale(2.4)`, background: 'repeating-conic-gradient(from 0deg at 50% 42%, rgba(140,210,255,.13) 0deg 2deg, transparent 2deg 9deg)', maskImage: 'radial-gradient(50% 38% at 50% 42%, black, transparent 78%)', WebkitMaskImage: 'radial-gradient(50% 38% at 50% 42%, black, transparent 78%)'}} />
      {/* soft orbit rings like the poster */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: width / 2 - 700 - i * 200, top: height * 0.55 - 700 - i * 200, width: 1400 + i * 400, height: 1400 + i * 400, borderRadius: '50%', border: '2px solid rgba(120,190,255,.10)', transform: `rotate(${t * (8 + i * 4)}deg) scaleY(0.55)`}} />
      ))}
      {Array.from({length: 70}).map((_, i) => {
        const sp = 0.4 + rand(i) * 1.2;
        const y = (((rand(i + 3) * height - t * 110 * sp) % height) + height) % height;
        const s = 1 + rand(i * 7) * 3;
        return <div key={i} style={{position: 'absolute', left: rand(i * 2) * width + Math.sin(t + i) * 20, top: y, width: s, height: s, borderRadius: '50%', background: '#cfeaff', opacity: 0.25 + rand(i * 5) * 0.5, boxShadow: '0 0 10px #6cc4ff'}} />;
      })}
    </AbsoluteFill>
  );
};

// ───────── portrait (cut from the poster) ─────────
const Portrait: React.FC<{t: number; top: number; width: number; silhouette?: number; reveal?: number; tilt?: number; style?: React.CSSProperties}> = ({t, top, width, silhouette = 0, reveal = 1, tilt = 0, style}) => {
  const {width: W} = useVideoConfig();
  const h = (width * CUT.h) / CUT.w;
  const edge = reveal * 120 - 10;
  return (
    <div style={{position: 'absolute', left: W / 2 - width / 2, top, width, height: h, perspective: 1400, ...style}}>
      <div style={{position: 'relative', width: '100%', height: '100%', transform: `rotateY(${tilt}deg)`, transformStyle: 'preserve-3d'}}>
        {/* silhouette with rim light */}
        <Img src={staticFile('shoira_cut.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', filter: 'brightness(0) drop-shadow(0 0 2px #9fdcff) drop-shadow(0 0 18px #2f86ff)', opacity: silhouette}} />
        {/* the real photo, revealed by a light sweep */}
        <Img src={staticFile('shoira_cut.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', filter: 'drop-shadow(0 30px 60px rgba(0,0,0,.45))', maskImage: `linear-gradient(100deg, #000 ${edge - 12}%, transparent ${edge}%)`, WebkitMaskImage: `linear-gradient(100deg, #000 ${edge - 12}%, transparent ${edge}%)`}} />
        {reveal > 0 && reveal < 1 && (
          <div style={{position: 'absolute', top: -40, bottom: -40, left: `${edge - 6}%`, width: 26, background: 'linear-gradient(90deg, transparent, #ffffff, transparent)', filter: 'blur(6px)', transform: 'skewX(-10deg)', boxShadow: '0 0 60px #6cc4ff'}} />
        )}
      </div>
    </div>
  );
};

// ───────── typography ─────────
const Slam: React.FC<{t: number; at: number; out: number; children: React.ReactNode; style?: React.CSSProperties; glitch?: boolean; from?: number}> = ({t, at, out, children, style, glitch, from = 1.6}) => {
  if (t < at || t > out + 0.05) return null;
  const e = outExpo(prog(t, at, at + 0.32));
  const x = inCubic(prog(t, out - 0.15, out));
  const j = glitch ? (rand(Math.floor(t * 24)) - 0.5) * 24 * (rand(Math.floor(t * 12)) > 0.6 ? 1 : 0.15) : 0;
  const split = 14 * (1 - e) + Math.abs(j) * 0.5 + (glitch ? 4 : 0);
  return (
    <div style={{position: 'relative', transform: `translateX(${j}px) scale(${lerp(from, 1, e) * (1 + x * 0.2) * (1 + (t - at) * 0.02)})`, opacity: Math.min(1, e * 2.5) * (1 - x), filter: (1 - e) * 12 + x * 10 > 0.3 ? `blur(${(1 - e) * 12 + x * 10}px)` : undefined, ...style}}>
      <div style={{position: 'absolute', inset: 0, color: 'rgba(255,60,110,.75)', transform: `translateX(${split}px)`, mixBlendMode: 'screen'}}>{children}</div>
      <div style={{position: 'absolute', inset: 0, color: 'rgba(60,220,255,.85)', transform: `translateX(${-split}px)`, mixBlendMode: 'screen'}}>{children}</div>
      <div style={{position: 'relative'}}>{children}</div>
    </div>
  );
};

const H: React.CSSProperties = {fontFamily: F.body, fontWeight: 800, color: B.white, lineHeight: 0.95, textAlign: 'center', letterSpacing: '-0.01em', whiteSpace: 'nowrap', textShadow: '0 10px 40px rgba(0,0,0,.45)'};
const Center: React.FC<{top: number; children: React.ReactNode; gap?: number}> = ({top, children, gap = 8}) => (
  <div style={{position: 'absolute', left: 30, right: 30, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap}}>{children}</div>
);

// ───────── scenes ─────────
const Mystery: React.FC<{t: number}> = ({t}) => {
  const dolly = 1 + t * 0.03;
  return (
    <AbsoluteFill>
      <Stage t={t} dark={1} />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${dolly})`}}>
        <Portrait t={t} top={700} width={1080} silhouette={clamp(t * 2)} reveal={0} />
      </div>
      {/* searchlight */}
      <AbsoluteFill style={{background: `radial-gradient(22% 14% at ${50 + Math.sin(t * 1.4) * 30}% ${46 + Math.cos(t * 1.1) * 8}%, rgba(160,220,255,.28), transparent 70%)`, mixBlendMode: 'screen'}} />
      <Center top={330}>
        <Slam t={t} at={0.3} out={3.35} style={{...H, fontSize: 86}}>МЕҲМОНИ МАХСУС</Slam>
        <Slam t={t} at={2.1} out={3.35} style={{...H, fontSize: 96, color: B.glow}}>ДАР OXFORD</Slam>
      </Center>
      <Center top={900}>
        <Slam t={t} at={3.45} out={4.48} glitch from={2.2} style={{...H, fontFamily: F.display, fontWeight: 700, fontSize: 380}}>КӢ?</Slam>
      </Center>
    </AbsoluteFill>
  );
};

const Reveal: React.FC<{t: number}> = ({t}) => {
  const lt = t - 4.5;
  const bgIn = outExpo(clamp(lt / 0.6));
  return (
    <AbsoluteFill>
      <Stage t={t} />
      {/* GUEST / LECTURE wall behind her, sliding in opposite directions */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{...H, fontSize: 250, transform: `translateX(${(1 - bgIn) * -900 + lt * -14}px)`}}>GUEST</div>
        <div style={{...H, fontSize: 228, ...blueFill(t), transform: `translateX(${(1 - bgIn) * 900 + lt * 14}px)`, filter: 'drop-shadow(0 0 30px rgba(108,196,255,.6))'}}>LECTURE</div>
      </div>
      <Portrait t={t} top={540 - lt * 6} width={1040 + lt * 14} silhouette={1 - clamp(lt / 0.6)} reveal={outExpo(clamp(lt / 0.7))} tilt={lerp(-14, 6, clamp(lt / 5))} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, transparent 58%, rgba(2,8,24,.85) 82%)'}} />
      <Center top={1230} gap={4}>
        <Slam t={t} at={4.55} out={9.45} style={{...H, fontSize: 138}}>SHOIRA</Slam>
        <Slam t={t} at={4.75} out={9.45} style={{...H, fontSize: 138}}>PULATOVA</Slam>
        <div style={{width: lerp(0, 720, outExpo(prog(t, 5.0, 5.6))), height: 4, margin: '16px 0', background: 'linear-gradient(90deg, transparent, #9fdcff, transparent)', boxShadow: '0 0 20px #6cc4ff'}} />
        <Slam t={t} at={6.3} out={9.45} from={1.2} style={{fontFamily: F.body, fontWeight: 500, fontSize: 46, color: B.white, letterSpacing: '0.12em', whiteSpace: 'nowrap'}}>ИНФЛЮЕНСЕР ВА СОҲИБКОР</Slam>
        <div style={{height: 14}} />
        <Slam t={t} at={7.7} out={9.45} style={{padding: '14px 34px', borderRadius: 999, background: B.white, fontFamily: F.display, fontWeight: 700, fontSize: 54, color: B.blue, whiteSpace: 'nowrap'}}>БО ШУМО РӮ БА РӮ!</Slam>
      </Center>
    </AbsoluteFill>
  );
};

const DateTime: React.FC<{t: number}> = ({t}) => {
  const lt = t - 9.5;
  const flips = Math.min(6, Math.floor(clamp(lt / 0.7) * 6));
  const day = 21 + flips;
  const flipP = (clamp(lt / 0.7) * 6) % 1;
  const card = outBack(clamp(lt / 0.4));
  const ct = t - 10.95;
  const clockIn = outBack(clamp(ct / 0.4));
  const ang = lerp(0, 150, outExpo(clamp(ct / 0.9)));          // hour hand to 5
  const mins = lerp(0, 720, outExpo(clamp(ct / 0.9)));         // minute hand spins round to 12
  return (
    <AbsoluteFill>
      <Stage t={t} />
      <div style={{...H, position: 'absolute', left: 0, right: 0, top: 260, fontSize: 600, color: 'rgba(255,255,255,.06)', transform: `scale(${1 + lt * 0.03})`}}>27</div>
      {/* calendar */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', perspective: 1200}}>
        <div style={{width: 560, borderRadius: 40, overflow: 'hidden', background: '#fff', boxShadow: '0 40px 90px rgba(0,0,0,.5), 0 0 60px rgba(108,196,255,.35)', transform: `scale(${card}) rotateY(${-16 + Math.sin(lt * 1.2) * 6}deg) rotateX(8deg)`}}>
          <div style={{height: 120, background: `linear-gradient(90deg, ${B.blue}, ${B.bright})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 700, fontSize: 70, color: '#fff', letterSpacing: '0.1em'}}>ОКТЯБР</div>
          <div style={{position: 'relative', height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 800}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 290, color: '#0a1f55', transform: lt < 0.7 ? `rotateX(${flipP * 90}deg)` : undefined, transformOrigin: '50% 0%'}}>{day}</div>
          </div>
        </div>
      </div>
      {/* clock */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 960, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 50, opacity: ct > 0 ? 1 : 0}}>
        <svg width="300" height="300" viewBox="0 0 100 100" style={{transform: `scale(${clockIn})`, filter: 'drop-shadow(0 0 20px rgba(108,196,255,.6))'}}>
          <circle cx="50" cy="50" r="46" fill="rgba(255,255,255,.1)" stroke="#fff" strokeWidth="3" />
          {Array.from({length: 12}).map((_, i) => <line key={i} x1="50" y1="8" x2="50" y2={i % 3 ? 13 : 16} stroke="#cfeaff" strokeWidth={i % 3 ? 1.5 : 3} transform={`rotate(${i * 30} 50 50)`} />)}
          <line x1="50" y1="50" x2="50" y2="26" stroke="#fff" strokeWidth="5" strokeLinecap="round" transform={`rotate(${ang} 50 50)`} />
          <line x1="50" y1="50" x2="50" y2="14" stroke={B.glow} strokeWidth="3" strokeLinecap="round" transform={`rotate(${mins} 50 50)`} />
          <circle cx="50" cy="50" r="4" fill="#fff" />
        </svg>
        <Slam t={t} at={11.0} out={12.45} style={{...H, fontSize: 190, ...blueFill(t)}}>17:00</Slam>
      </div>
      <Center top={1340}>
        <Slam t={t} at={9.6} out={12.45} from={1.3} style={{...H, fontSize: 84}}>27 ОКТЯБР</Slam>
        <Slam t={t} at={11.1} out={12.45} from={1.3} style={{...H, fontSize: 60, color: B.glow}}>СОАТИ 5-И БЕГОҲ</Slam>
      </Center>
    </AbsoluteFill>
  );
};

const PINS = city.pins as unknown as Record<string, [number, number]>;
const Location: React.FC<{t: number}> = ({t}) => {
  const lt = t - 12.5;
  const [nx, ny] = PINS.new8;
  const p = outExpo(clamp(lt / 1.6));
  const cam: Cam = {cx: lerp(nx - 500, nx, p), cy: lerp(ny + 400, ny, p), zoom: lerp(0.35, 1.05, p) + lt * 0.03, tilt: lerp(20, 55, p), rz: lerp(-40, 10, p) + lt * 4};
  const pinA = outBack(clamp((lt - 0.6) / 0.5));
  return (
    <AbsoluteFill style={{background: '#03050a'}}>
      <MapPlane src="city.jpg" w={city.w} h={city.h} cam={cam} anchorY={640} ground="#070b14">
        <Img src={staticFile('city_glow.png')} style={{position: 'absolute', left: 0, top: 0, width: city.w, height: city.h, opacity: 0.6, transform: 'translateZ(1px)'}} />
        <Img src={staticFile('city_lights.png')} style={{position: 'absolute', left: 0, top: 0, width: city.w, height: city.h, transform: 'translateZ(1px)'}} />
        <Ground x={nx} y={ny} z={3}>
          {[0, 1, 2].map((i) => {
            const q = ((lt + i * 0.6) % 1.8) / 1.8;
            return <div key={i} style={{position: 'absolute', left: -300, top: -300, width: 600, height: 600, borderRadius: '50%', border: `${4 / cam.zoom}px solid ${B.glow}`, transform: `scale(${q})`, opacity: (1 - q) * clamp(lt - 0.5)}} />;
          })}
        </Ground>
        <Billboard x={nx} y={ny} cam={cam} scale={1.1}>
          <div style={{position: 'absolute', left: -12, bottom: 0, width: 24, height: 300 * pinA, background: `linear-gradient(to top, ${B.glow}, transparent)`, boxShadow: `0 0 40px ${B.glow}`}} />
          <div style={{position: 'absolute', left: -60, bottom: 300 * pinA - 60, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #ffffff, #6cc4ff 55%, #0b46c9)', boxShadow: `0 0 50px ${B.glow}`, transform: `scale(${pinA})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 700, fontSize: 64, color: '#03123a'}}>8</div>
        </Billboard>
      </MapPlane>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(2,8,24,.95) 0%, rgba(2,8,24,.4) 22%, transparent 40%, transparent 70%, rgba(2,8,24,.8) 100%)'}} />
      <Center top={260}>
        <Slam t={t} at={12.55} out={15.95} style={{...H, fontSize: 64, color: B.glow, letterSpacing: '0.2em'}}>ФИЛИАЛИ НАВИ</Slam>
        <Slam t={t} at={12.75} out={15.95} style={{...H, fontSize: 132}}>OXFORD №8</Slam>
      </Center>
      <Center top={1330}>
        <Slam t={t} at={14.45} out={15.95} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '20px 40px', borderRadius: 999, background: '#fff'}}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill={B.blue}><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /></svg>
          <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 70, color: B.deep, whiteSpace: 'nowrap'}}>ДАР НАЗДИ АЛФЕМО</span>
        </Slam>
      </Center>
    </AbsoluteFill>
  );
};

const Ask: React.FC<{t: number}> = ({t}) => {
  const lt = t - 16.0;
  const qs = Array.from({length: 9}).map((_, i) => ({a: rand(i) * Math.PI * 2, r: 380 + rand(i + 4) * 160, s: 70 + rand(i + 8) * 90, d: i * 0.12}));
  return (
    <AbsoluteFill>
      <Stage t={t} />
      <Portrait t={t} top={560} width={980 + lt * 18} tilt={Math.sin(lt * 0.9) * 8} />
      {qs.map((q, i) => {
        const e = outBack(clamp((lt - q.d) / 0.45));
        const a = q.a + lt * 0.5;
        return (
          <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * q.r - q.s / 2, top: 820 + Math.sin(a) * q.r * 0.9 - q.s / 2, width: q.s, height: q.s, borderRadius: '30% 30% 30% 6px', background: 'linear-gradient(135deg, rgba(255,255,255,.28), rgba(255,255,255,.08))', border: '2px solid rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 700, fontSize: q.s * 0.6, color: '#fff', transform: `scale(${e})`, boxShadow: '0 0 30px rgba(108,196,255,.5)'}}>?</div>
        );
      })}
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(2,8,24,.7) 0%, transparent 25%, transparent 62%, rgba(2,8,24,.9) 85%)'}} />
      <Center top={280}>
        <Slam t={t} at={16.05} out={19.45} style={{...H, fontSize: 88}}>САВОЛҲОЯТОНРО</Slam>
        <Slam t={t} at={16.45} out={19.45} style={{...H, fontSize: 88, ...blueFill(t)}}>ОМОДА КУНЕД</Slam>
      </Center>
      <Center top={1330}>
        <Slam t={t} at={17.6} out={19.45} from={1.8} style={{...H, fontSize: 112}}>АЗ ДАСТ</Slam>
        <Slam t={t} at={17.85} out={19.45} from={1.8} style={{...H, fontSize: 112, color: B.gold}}>НАДИҲЕД!</Slam>
      </Center>
    </AbsoluteFill>
  );
};

const Poster: React.FC<{t: number}> = ({t}) => {
  const lt = t - 19.5;
  const a = (d: number) => outExpo(clamp((lt - d) / 0.45));
  const cta = 1 + Math.max(0, Math.sin((t - 20.6) * 6)) * 0.04 * (t > 20.6 ? 1 : 0);
  return (
    <AbsoluteFill>
      <Stage t={t} />
      {/* brand bar */}
      <div style={{position: 'absolute', left: 70, right: 70, top: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: a(0), transform: `translateY(${(1 - a(0)) * -40}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <svg viewBox={`0 0 ${logo.w} 352`} width={92} height={92 * 352 / logo.w}><path d={logo.emblem} fill="#fff" fillRule="evenodd" /></svg>
          <div style={{width: 2, height: 80, background: 'rgba(255,255,255,.6)'}} />
          <div>
            <svg viewBox={`0 398 ${logo.w} 69`} width={240} height={240 * 69 / logo.w}><path d={logo.wordmark} fill="#fff" fillRule="evenodd" /></svg>
            <div style={{fontFamily: F.body, fontWeight: 500, fontSize: 20, letterSpacing: '0.32em', color: '#fff', marginTop: 4}}>LEARNING CENTRE</div>
          </div>
        </div>
        <div style={{padding: '12px 26px', borderRadius: 999, border: '2px solid rgba(255,255,255,.7)', fontFamily: F.body, fontWeight: 500, fontSize: 24, letterSpacing: '0.16em', color: '#fff'}}>GUEST LECTURE</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${lerp(1.3, 1, a(0.05))})`, opacity: a(0.05)}}>
        <div style={{...H, fontSize: 200}}>GUEST</div>
        <div style={{...H, fontSize: 184, ...blueFill(t), filter: 'drop-shadow(0 0 30px rgba(108,196,255,.6))'}}>LECTURE</div>
      </div>
      <Portrait t={t} top={600} width={960 + lt * 10} reveal={a(0.1)} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, transparent 56%, rgba(2,8,24,.9) 74%)'}} />
      <Center top={1150} gap={6}>
        <div style={{...H, fontSize: 104, opacity: a(0.3), transform: `translateY(${(1 - a(0.3)) * 40}px)`}}>Shoira Pulatova</div>
        <div style={{fontFamily: F.body, fontWeight: 500, fontSize: 36, color: '#dbeeff', opacity: a(0.45)}}>Influencer and Entrepreneur</div>
        <div style={{display: 'flex', gap: 22, marginTop: 26, opacity: a(0.6)}}>
          {[['27 ОКТЯБР · 17:00', 'M7 2v3M17 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z'], ['OXFORD · АЛФЕМО', 'M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z']].map(([txt, d]) => (
            <div key={txt} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', borderRadius: 18, background: 'rgba(255,255,255,.12)', border: '1.5px solid rgba(255,255,255,.4)'}}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d={d} /></svg>
              <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 36, color: '#fff', whiteSpace: 'nowrap'}}>{txt}</span>
            </div>
          ))}
        </div>
        <div style={{marginTop: 34, padding: '26px 56px', borderRadius: 999, background: '#fff', boxShadow: '0 0 60px rgba(108,196,255,.7)', fontFamily: F.display, fontWeight: 700, fontSize: 60, color: B.blue, opacity: a(0.9), transform: `scale(${lerp(0.6, 1, a(0.9)) * cta})`, whiteSpace: 'nowrap'}}>САБТИ НОМ — ДАР ДИРЕКТ</div>
      </Center>
      <div style={{position: 'absolute', left: ((t - 20.6) % 1.4) * 1100 - 200, top: 1500, width: 120, height: 150, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent)', transform: 'skewX(-20deg)', opacity: t > 20.6 ? 0.8 : 0, mixBlendMode: 'overlay'}} />
    </AbsoluteFill>
  );
};

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = ['700 40px Oswald', '500 20px Montserrat', '800 20px Montserrat'];
    Promise.all(faces.flatMap((f) => [document.fonts.load(f, 'ҶӮӢҲҚҒ'), document.fonts.load(f, 'Shoira GUEST 17:00')]))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

export const EventReel: React.FC = () => {
  useFonts();
  const t = useT();
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const kick = pulse(t, BEATS.kicks, 11);
  const hit = pulse(t, E.hits, 8);
  const big = pulse(t, E.bigHits, 4);
  const sh = shake(t, 3 + big * 26 + hit * 8, 2 + big * 8, 13);
  const scene = t < 4.5 ? <Mystery t={t} /> : t < 9.5 ? <Reveal t={t} /> : t < 12.5 ? <DateTime t={t} /> : t < 16.0 ? <Location t={t} /> : t < 19.5 ? <Ask t={t} /> : <Poster t={t} />;
  const loop = prog(t, E.duration - 0.35, E.duration);
  return (
    <AbsoluteFill style={{background: B.ink, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${1 + kick * 0.025 + hit * 0.04})`}}>{scene}</AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(to bottom, transparent ${50 - 0.35}%, rgba(150,220,255,${0.7 * hit}) 50%, transparent ${50 + 0.35}%)`, mixBlendMode: 'screen', transform: `scaleX(${1 + hit * 2})`, pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'radial-gradient(110% 80% at 50% 50%, transparent 55%, rgba(0,0,0,.5) 85%, rgba(0,0,0,.85) 100%)', pointerEvents: 'none'}} />
      <Img src={staticFile(`grain${f % 6}.png`)} style={{position: 'absolute', left: -((f * 37) % 120), top: -((f * 53) % 90), width: width + 120, height: height + 90, opacity: 0.07, mixBlendMode: 'overlay'}} />
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(hit * 0.55, loop * 0.9), pointerEvents: 'none'}} />
      <Audio src={staticFile('event_mix.wav')} />
    </AbsoluteFill>
  );
};

export const EVENT_FRAMES = Math.round(E.duration * E.fps);
