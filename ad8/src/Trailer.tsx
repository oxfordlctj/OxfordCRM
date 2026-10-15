import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/oswald/700.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/jetbrains-mono/400.css';
import TR from './trailer.json';
import BEATS from './beats.json';
import {Bare, C, F, TimeMap, goldFill, inCubic, lerp, outExpo, prog, rand, shake} from './lib';
import {Country} from './scenes/Country';
import {City} from './scenes/City';
import {Logo} from './scenes/Logo';
import {Dust, Extruded, Opening} from './scenes/Opening';

const useT = () => useCurrentFrame() / TR.fps;

/** piecewise-linear retime: [[editTime, sceneTime], ...], extrapolated with the end slopes */
const remap = (map: number[][]) => (t: number) => {
  if (map.length === 1) return map[0][1] + (t - map[0][0]);
  let i = 0;
  while (i < map.length - 2 && t > map[i + 1][0]) i++;
  const [a0, b0] = map[i], [a1, b1] = map[i + 1];
  return b0 + ((t - a0) * (b1 - b0)) / (a1 - a0);
};

const CUTS = TR.shots.map((s) => s.at);
const SCENES: Record<string, React.FC> = {country: Country, city: City, opening: Opening, logo: Logo};

const BlackStage: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: `radial-gradient(80% 50% at 50% 45%, #0f1830 0%, ${C.ink} 75%)`}}>
      <AbsoluteFill style={{opacity: 0.5, transform: `rotate(${t * 6}deg) scale(2.2)`, background: 'repeating-conic-gradient(from 0deg at 50% 45%, rgba(255,200,120,.09) 0deg 2deg, transparent 2deg 10deg)', maskImage: 'radial-gradient(50% 40% at 50% 45%, black, transparent 75%)', WebkitMaskImage: 'radial-gradient(50% 40% at 50% 45%, black, transparent 75%)'}} />
      <Dust t={t} n={110} speed={1.6} seed={3} />
    </AbsoluteFill>
  );
};

const Footage: React.FC = () => {
  const t = useT();
  const idx = CUTS.filter((c) => c <= t).length - 1;
  const shot = TR.shots[Math.max(0, idx)];
  const Scene = shot.scene === 'black' ? BlackStage : SCENES[shot.scene];
  const node = <Scene />;
  if (!shot.map) return node;
  return (
    <TimeMap.Provider value={remap(shot.map)}>
      <Bare.Provider value={true}>{node}</Bare.Provider>
    </TimeMap.Provider>
  );
};

/** decaying pulse after the most recent event in a list */
const pulse = (t: number, times: number[], k: number) => {
  let last = -99;
  for (const x of times) if (x <= t && x > last) last = x;
  return last < 0 ? 0 : Math.exp(-(t - last) * k);
};

type Line = {text: string; at?: number; gold?: boolean; size?: number};
type Card = {at: number; out: number; lines: Line[]; y?: number; glitch?: boolean; sub?: {text: string; at: number}; kicker?: string};

const CARDS: Card[] = [
  {at: 0.3, out: 4.45, lines: [{text: 'ДАР ҶАҲОНЕ,'}, {text: 'КИ ДОНИШ', at: 1.85}, {text: 'ҲАМА ЧИЗРО', at: 2.55}, {text: 'ҲАЛ МЕКУНАД', at: 3.25, gold: true}]},
  {at: 4.7, out: 6.95, lines: [{text: 'БАЪЗЕҲО —'}, {text: 'ОРЗУ', at: 5.55, size: 230}, {text: 'МЕКУНАНД', at: 6.0}]},
  {at: 7.05, out: 9.45, lines: [{text: 'ДИГАРОН —'}, {text: 'АМАЛ', at: 7.9, gold: true, size: 260}, {text: 'МЕКУНАНД!', at: 8.3}]},
  {at: 9.55, out: 10.72, y: 1300, lines: [{text: 'ҲАФТ'}, {text: 'ФИЛИАЛ', at: 9.8}]},
  {at: 10.8, out: 11.95, lines: [{text: 'ЯК ШАҲР', size: 200}], sub: {text: 'ДУШАНБЕ', at: 11.1}},
  {at: 12.0, out: 12.94, lines: [{text: 'ЯК ДАСТА', size: 200}]},
  {at: 12.98, out: 14.9, kicker: 'МАРКАЗИ ОМӮЗИШӢ', lines: [{text: 'OXFORD', gold: true, size: 270}]},
  {at: 15.6, out: 17.62, lines: [{text: 'АММО ШАҲР'}, {text: 'РУШД МЕКУНАД...', at: 16.25}]},
  {at: 17.7, out: 19.38, lines: [{text: 'ВА МО ҲАМ'}, {text: 'БА ПЕШ', at: 18.3, gold: true, size: 210}, {text: 'МЕРАВЕМ!', at: 18.75}]},
  {at: 19.45, out: 21.28, glitch: true, lines: [{text: 'ФИЛИАЛИ НАВ —'}, {text: 'ДАР КУҶО?', at: 20.3, size: 200}]},
  {at: 21.5, out: 22.95, y: 1260, lines: [{text: 'ФИЛИАЛИ'}, {text: 'ҲАШТУМ!', gold: true, at: 21.85, size: 200}]},
  {at: 23.0, out: 25.45, lines: [{text: 'ДОМПЕЧАТЬ', gold: true, size: 190}], sub: {text: 'ДАР НАЗДИ АЛФЕМО', at: 23.95}},
  {at: 25.52, out: 26.96, y: 560, lines: [{text: 'ДАР МАРКАЗИ'}, {text: 'ДУШАНБЕ!', gold: true, at: 25.95}]},
  {at: 27.02, out: 28.95, y: 560, lines: [{text: 'АЗ ҲАР НОҲИЯ —'}, {text: 'РОҲИ ОСОН!', gold: true, at: 27.75}]},
  {at: 29.0, out: 31.4, y: 560, lines: [{text: 'МАКТАБҲО ВА'}, {text: 'ДОНИШГОҲҲО —', at: 29.6}, {text: 'ДАР НАЗДИКӢ!', gold: true, at: 30.35}]},
  {at: 36.02, out: 39.45, y: 1240, lines: [{text: 'ФИЛИАЛИ №8', size: 96}, {text: 'ДОМПЕЧАТЬ', gold: true, at: 36.5, size: 120}]},
  {at: 37.52, out: 39.45, y: 1440, lines: [{text: 'БА ЗУДӢ КУШОДА МЕШАВАД!', size: 58}]},
  {at: 39.6, out: 44, y: 1290, lines: [{text: 'ОМОДА', size: 170}, {text: 'БОШЕД!', gold: true, at: 39.95, size: 170}]},
];

/** trailer slam: overshoot scale, motion blur, RGB split that settles, push while held */
const SlamLine: React.FC<{line: Line; at: number; out: number; t: number; glitch?: boolean; i: number}> = ({line, at, out, t, glitch, i}) => {
  const start = line.at ?? at;
  if (t < start) return <div style={{height: (line.size ?? 150) * 0.98}} />;
  const e = outExpo(prog(t, start, start + 0.32));
  const x = inCubic(prog(t, out - 0.14, out));
  // Oswald caps run ~0.56em wide; keep every line inside the 960px text column
  const fit = 960 / Math.max(4, line.text.length * 0.56);
  const size = Math.min(line.size ?? 160, fit);
  const jitter = glitch ? (rand(Math.floor(t * 24) + i * 7) - 0.5) * 22 * (rand(Math.floor(t * 12) + i) > 0.7 ? 1 : 0.15) : 0;
  const split = 16 * (1 - e) + Math.abs(jitter) * 0.6 + (glitch ? 4 : 0);
  const scale = lerp(1.55, 1, e) * (1 + x * 0.18);
  const blur = (1 - e) * 14 + x * 10;
  const base: React.CSSProperties = {fontFamily: F.display, fontWeight: 700, fontSize: size, lineHeight: 0.98, letterSpacing: '0.01em', whiteSpace: 'nowrap'};
  const fill = line.gold ? goldFill(t, 0.6, 100) : {color: C.white};
  return (
    <div style={{position: 'relative', transform: `translateX(${jitter}px) scale(${scale})`, opacity: Math.min(1, e * 2.5) * (1 - x), filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>
      <div style={{...base, position: 'absolute', inset: 0, color: 'rgba(255,40,70,.85)', transform: `translateX(${split}px)`, mixBlendMode: 'screen'}}>{line.text}</div>
      <div style={{...base, position: 'absolute', inset: 0, color: 'rgba(40,220,255,.85)', transform: `translateX(${-split}px)`, mixBlendMode: 'screen'}}>{line.text}</div>
      <div style={{...base, position: 'relative', ...fill, textShadow: line.gold ? undefined : '0 8px 40px rgba(0,0,0,.65)', filter: line.gold ? 'drop-shadow(0 6px 30px rgba(0,0,0,.6))' : undefined}}>{line.text}</div>
    </div>
  );
};

const Cards: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      {CARDS.filter((c) => t >= c.at - 0.05 && t <= c.out + 0.05).map((c, k) => {
        const push = 1 + (t - c.at) * 0.025;
        return (
          <div key={k} style={{position: 'absolute', left: 60, right: 60, top: c.y ?? 900, transform: `translateY(-50%) scale(${push})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center'}}>
            {c.kicker && (
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 38, letterSpacing: '0.42em', marginRight: '-0.42em', color: C.ivory, opacity: outExpo(prog(t, c.at + 0.1, c.at + 0.5)) * (1 - prog(t, c.out - 0.15, c.out))}}>{c.kicker}</div>
            )}
            {c.lines.map((l, i) => <SlamLine key={i} i={i} line={l} at={c.at} out={c.out} t={t} glitch={c.glitch} />)}
            {c.sub && t >= c.sub.at && (
              <div style={{marginTop: 18, display: 'flex', alignItems: 'center', gap: 22, opacity: outExpo(prog(t, c.sub.at, c.sub.at + 0.4)) * (1 - prog(t, c.out - 0.15, c.out)), transform: `translateY(${(1 - outExpo(prog(t, c.sub.at, c.sub.at + 0.5))) * 30}px)`}}>
                <div style={{width: 70, height: 3, background: C.gold}} />
                <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 52, letterSpacing: '0.14em', color: C.white, textShadow: '0 4px 24px rgba(0,0,0,.8)'}}>{c.sub.text}</div>
                <div style={{width: 70, height: 3, background: C.gold}} />
              </div>
            )}
          </div>
        );
      })}
      {/* the 8: a sculpted gold numeral that punches out of the reveal */}
      {t >= 21.45 && t < 23.0 && (
        <AbsoluteFill style={{perspective: 1400, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', justifyContent: 'center', transformStyle: 'preserve-3d', transform: `translateZ(${lerp(-1400, 0, outExpo(prog(t, 21.5, 22.1)))}px) rotateY(${lerp(55, -8, outExpo(prog(t, 21.5, 22.6))) - (t - 21.5) * 6}deg)`, opacity: 1 - inCubic(prog(t, 22.8, 23.0))}}>
            <Extruded text="8" size={640} t={t} depth={32} />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const Gate: React.FC = () => {
  const t = useT();
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const hit = pulse(t, TR.hits, 9);
  const cut = pulse(t, CUTS.slice(1), 22);
  const big = pulse(t, TR.bigHits, 4);
  const leak = 0.5 + 0.5 * Math.sin(t * 0.7);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `linear-gradient(to bottom, transparent ${50 - 0.35}%, rgba(140,190,255,${0.7 * hit}) 50%, transparent ${50 + 0.35}%)`, mixBlendMode: 'screen', transform: `scaleX(${1 + hit * 2})`}} />
      <AbsoluteFill style={{background: `radial-gradient(60% 25% at 50% 50%, rgba(255,200,130,${0.45 * big}), transparent 70%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: `radial-gradient(60% 40% at ${15 + leak * 70}% ${10 + leak * 25}%, rgba(255,130,50,.12), transparent 70%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'radial-gradient(110% 80% at 50% 50%, transparent 50%, rgba(0,0,0,.55) 82%, rgba(0,0,0,.9) 100%)'}} />
      <Img src={staticFile(`grain${f % 6}.png`)} style={{position: 'absolute', left: -((f * 37) % 120), top: -((f * 53) % 90), width: width + 120, height: height + 90, opacity: 0.1, mixBlendMode: 'overlay'}} />
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(hit * 0.75, cut * 0.35)}} />
    </AbsoluteFill>
  );
};

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = ['700 40px Oswald', '500 20px Montserrat', '800 20px Montserrat', '400 20px "JetBrains Mono"'];
    Promise.all(faces.flatMap((f) => [document.fonts.load(f, 'ҶӮӢҲҚҒ'), document.fonts.load(f, 'OXFORD 0123')]))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

export const Trailer: React.FC = () => {
  useFonts();
  const t = useT();
  const kick = pulse(t, BEATS.kicks, 11);
  const hit = pulse(t, TR.hits, 6);
  const big = pulse(t, TR.bigHits, 3.5);
  const sh = shake(t, 4 + big * 30 + hit * 8, 2 + big * 9, 21);
  const scale = 1 + kick * 0.03 + hit * 0.05;
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

export const TRAILER_FRAMES = Math.round(TR.duration * TR.fps);
