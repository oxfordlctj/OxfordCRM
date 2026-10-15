import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/oswald/700.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/jetbrains-mono/400.css';
import TR from './trailer.json';
import BEATS from './beats.json';
import {C, F, clamp, goldFill, inCubic, lerp, outExpo, prog, rand, shake} from './lib';
import {Space} from './scenes/Space';
import {BrandReveal, Finale} from './scenes/Brand';
import {CityDive, Counter, Reasons, Ticket, Tunnel} from './scenes/Story';

const useT = () => useCurrentFrame() / TR.fps;

const pulse = (t: number, times: number[], k: number) => {
  let last = -99;
  for (const x of times) if (x <= t && x > last) last = x;
  return last < 0 ? 0 : Math.exp(-(t - last) * k);
};

// what's on screen when; overlaps are dissolves, everything else is a hard cut on the beat
const SEGMENTS: {from: number; to: number; node: React.ReactNode; fin?: number}[] = [
  {from: 0, to: 9.25, node: <Space />},
  {from: 8.95, to: 9.5, node: <CityDive />, fin: 0.12},
  {from: 9.5, to: 14.0, node: <BrandReveal />},
  {from: 14.0, to: 29.0, node: <Tunnel />},
  {from: 29.0, to: 33.5, node: <Ticket />},
  {from: 33.5, to: 41.6, node: <Finale />},
];
const CUTS = [9.5, 14.0, 15.5, 18.5, 21.5, 24.5, 29.0, 33.5];

const Footage: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      {SEGMENTS.filter((s) => t >= s.from && t < s.to).map((s, i) => (
        <AbsoluteFill key={s.from} style={{opacity: s.fin ? clamp((t - s.from) / s.fin) : 1}}>{s.node}</AbsoluteFill>
      ))}
      {t >= 15.4 && t < 29.0 && <Reasons />}
      <Counter />
    </AbsoluteFill>
  );
};

type Line = {text: string; at?: number; hot?: boolean; size?: number};
type Card = {at: number; out: number; lines: Line[]; y?: number; glitch?: boolean; track?: boolean};

const CARDS: Card[] = [
  {at: 0.5, out: 1.9, y: 700, track: true, lines: [{text: 'ЯК ЗАБОН...', size: 120}]},
  {at: 1.95, out: 4.45, y: 560, lines: [{text: 'КИ ДАРИ ТАМОМИ'}, {text: 'ҶАҲОНРО', at: 2.75, hot: true, size: 210}, {text: 'МЕКУШОЯД', at: 3.4}]},
  {at: 8.55, out: 9.45, y: 820, glitch: true, lines: [{text: 'ВА ШУМО?', size: 230}]},
  {at: 12.0, out: 13.95, y: 1330, lines: [{text: 'КУРСҲОИ ЗАБОНИ АНГЛИСӢ', size: 64}, {text: 'КИ ВОҚЕАН', at: 12.55, size: 120}, {text: 'НАТИҶА МЕДИҲАНД!', at: 12.95, hot: true, size: 120}]},
  {at: 14.35, out: 15.45, y: 900, glitch: true, lines: [{text: 'ЧАРО'}, {text: 'МАҲЗ МО?', at: 14.65, hot: true, size: 210}]},
  {at: 15.55, out: 18.45, y: 1370, lines: [{text: 'АЗ РӮЗИ АВВАЛ —', size: 90}, {text: 'БО АНГЛИСӢ', at: 16.25, hot: true, size: 130}, {text: 'ГАП МЕЗАНЕД!', at: 16.9, size: 110}]},
  {at: 18.52, out: 21.45, y: 1400, lines: [{text: 'УСТОДОНИ КАСБӢ', hot: true, size: 120}, {text: 'ВА МЕТОДИКАИ', at: 19.5, size: 90}, {text: 'ЗАМОНАВӢ', at: 20.0, size: 110}]},
  {at: 21.52, out: 24.45, y: 1380, lines: [{text: 'ГУРӮҲҲОИ ХУРД', hot: true, size: 130}, {text: 'ДИҚҚАТ БА ҲАР', at: 22.6, size: 90}, {text: 'ЯК ХОНАНДА', at: 23.1, size: 90}]},
  {at: 24.52, out: 28.95, y: 1300, lines: [{text: 'ОМОДАГӢ БА IELTS', hot: true, size: 120}, {text: 'РОҲИ ШУМО БА', at: 25.9, size: 80}, {text: 'ДОНИШГОҲҲОИ', at: 26.5, size: 100}, {text: 'БЕҲТАРИНИ ҶАҲОН', at: 27.2, hot: true, size: 100}]},
  {at: 29.4, out: 33.4, y: 470, lines: [{text: 'ЗАБОНИ АНГЛИСӢ —', size: 96}, {text: 'ЧИПТАИ ШУМО', at: 30.6, size: 130}, {text: 'БА ОЯНДА', at: 31.2, hot: true, size: 170}]},
  {at: 34.55, out: 41.5, y: 1060, lines: [{text: 'ОЯНДАИ ХУДРО', size: 100}, {text: 'ИМРӮЗ ОҒОЗ КУНЕД!', at: 35.3, hot: true, size: 104}]},
];

const SlamLine: React.FC<{line: Line; at: number; out: number; t: number; glitch?: boolean; track?: boolean; i: number}> = ({line, at, out, t, glitch, track, i}) => {
  const start = line.at ?? at;
  const fit = 960 / Math.max(4, line.text.length * 0.56);
  const size = Math.min(line.size ?? 150, fit);
  if (t < start) return <div style={{height: size * 0.98}} />;
  const e = outExpo(prog(t, start, start + (track ? 1.0 : 0.32)));
  const x = inCubic(prog(t, out - 0.14, out));
  const jitter = glitch ? (rand(Math.floor(t * 24) + i * 7) - 0.5) * 26 * (rand(Math.floor(t * 12) + i) > 0.65 ? 1 : 0.15) : 0;
  const split = 16 * (1 - e) + Math.abs(jitter) * 0.6 + (glitch ? 5 : 0);
  const scale = (track ? 1 : lerp(1.55, 1, e)) * (1 + x * 0.18);
  const blur = (1 - e) * 14 + x * 10;
  const base: React.CSSProperties = {fontFamily: F.display, fontWeight: 700, fontSize: size, lineHeight: 0.98, letterSpacing: track ? `${lerp(0.6, 0.18, e)}em` : '0.01em', whiteSpace: 'nowrap'};
  const fill = line.hot ? goldFill(t, 0.6, 100) : {color: C.white};
  return (
    <div style={{position: 'relative', transform: `translateX(${jitter}px) scale(${scale})`, opacity: Math.min(1, e * 2.5) * (1 - x), filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>
      <div style={{...base, position: 'absolute', inset: 0, color: 'rgba(255,50,90,.8)', transform: `translateX(${split}px)`, mixBlendMode: 'screen'}}>{line.text}</div>
      <div style={{...base, position: 'absolute', inset: 0, color: 'rgba(40,230,255,.85)', transform: `translateX(${-split}px)`, mixBlendMode: 'screen'}}>{line.text}</div>
      <div style={{...base, position: 'relative', ...fill, textShadow: line.hot ? undefined : '0 8px 40px rgba(0,0,0,.75)', filter: line.hot ? 'drop-shadow(0 0 24px rgba(63,224,255,.45)) drop-shadow(0 6px 24px rgba(0,0,0,.6))' : undefined}}>{line.text}</div>
    </div>
  );
};

const Cards: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      {CARDS.filter((c) => t >= c.at - 0.05 && t <= c.out + 0.05).map((c) => (
        <div key={c.at} style={{position: 'absolute', left: 60, right: 60, top: c.y ?? 900, transform: `translateY(-50%) scale(${1 + (t - c.at) * 0.022})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center'}}>
          {c.lines.map((l, i) => <SlamLine key={i} i={i} line={l} at={c.at} out={c.out} t={t} glitch={c.glitch} track={c.track} />)}
        </div>
      ))}
    </AbsoluteFill>
  );
};

const Gate: React.FC = () => {
  const t = useT();
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const hit = pulse(t, TR.hits, 9);
  const cut = pulse(t, CUTS, 22);
  const big = pulse(t, TR.bigHits, 4);
  const leak = 0.5 + 0.5 * Math.sin(t * 0.6);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `linear-gradient(to bottom, transparent ${50 - 0.35}%, rgba(120,220,255,${0.75 * hit}) 50%, transparent ${50 + 0.35}%)`, mixBlendMode: 'screen', transform: `scaleX(${1 + hit * 2})`}} />
      <AbsoluteFill style={{background: `radial-gradient(60% 25% at 50% 50%, rgba(90,200,255,${0.45 * big}), transparent 70%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: `radial-gradient(60% 40% at ${15 + leak * 70}% ${8 + leak * 20}%, rgba(80,140,255,.12), transparent 70%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'radial-gradient(110% 80% at 50% 50%, transparent 52%, rgba(0,0,0,.5) 82%, rgba(0,0,0,.88) 100%)'}} />
      <Img src={staticFile(`grain${f % 6}.png`)} style={{position: 'absolute', left: -((f * 37) % 120), top: -((f * 53) % 90), width: width + 120, height: height + 90, opacity: 0.08, mixBlendMode: 'overlay'}} />
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(hit * 0.7, cut * 0.32)}} />
    </AbsoluteFill>
  );
};

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = ['700 40px Oswald', '500 20px Montserrat', '800 20px Montserrat', '400 20px "JetBrains Mono"'];
    Promise.all(faces.flatMap((f) => [document.fonts.load(f, 'ҶӮӢҲҚҒ'), document.fonts.load(f, 'SmartSchool 0123')]))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

export const Reel: React.FC = () => {
  useFonts();
  const t = useT();
  const kick = pulse(t, BEATS.kicks, 11);
  const hit = pulse(t, TR.hits, 6);
  const big = pulse(t, TR.bigHits, 3.5);
  const sh = shake(t, 3 + big * 28 + hit * 8, 2 + big * 9, 31);
  const scale = 1 + kick * 0.028 + hit * 0.05;
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${scale})`}}>
        <Footage />
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${sh.x * 0.5}px, ${sh.y * 0.5}px)`}}>
        <Cards />
      </AbsoluteFill>
      <Gate />
      <Audio src={staticFile('trailer_mix.wav')} />
    </AbsoluteFill>
  );
};

export const REEL_FRAMES = Math.round(TR.duration * TR.fps);
