import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import logo from '../logo.json';
import {C, F, Kinetic, Wipe, clamp, goldFill, inCubic, lerp, outExpo, prog, rand, shake, useBare, usePortrait, useTime} from '../lib';

/** dust motes flying toward a camera that dollies forward the whole time */
export const Dust: React.FC<{t: number; n?: number; speed?: number; color?: string; seed?: number}> = ({t, n = 140, speed = 1, color = C.goldHi, seed = 0}) => {
  const {width, height} = useVideoConfig();
  return (
  <AbsoluteFill>
    {Array.from({length: n}).map((_, i) => {
      const r1 = rand(i + seed), r2 = rand(i * 3.1 + seed), r3 = rand(i * 7.7 + seed);
      const depth = 1 + ((r3 * 10 + t * 0.9 * speed) % 10);   // 1..11, loops toward camera
      const z = 11 - depth + 0.4;
      const x = width / 2 + ((r1 - 0.5) * width * 1.9) / z;
      const y = height / 2 + ((r2 - 0.5) * height * 2) / z;
      const s = Math.max(1, 7 / z);
      const a = clamp((11 - z) / 3) * clamp(z / 1.2) * 0.75;
      const b = z < 1.6 ? (1.6 - z) * 10 : 0;
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: color, opacity: a, filter: b ? `blur(${b}px)` : undefined, boxShadow: `0 0 ${s * 3}px ${color}`}} />;
    })}
  </AbsoluteFill>
  );
};

/** CSS-extruded number: stacked slices give it real depth when it turns */
export const Extruded: React.FC<{text: string; size: number; t: number; depth?: number; style?: React.CSSProperties}> = ({text, size, t, depth = 26, style}) => (
  <div style={{position: 'relative', transformStyle: 'preserve-3d', fontFamily: F.display, fontWeight: 700, fontSize: size, lineHeight: 1, ...style}}>
    {Array.from({length: depth}).map((_, i) => (
      <div key={i} style={{position: 'absolute', left: 0, top: 0, transform: `translateZ(${-i * (size / 260)}px)`, color: i === depth - 1 ? '#1b1206' : `rgb(${lerp(120, 40, i / depth)},${lerp(78, 24, i / depth)},${lerp(24, 8, i / depth)})`}}>{text}</div>
    ))}
    <div style={{position: 'relative', transform: 'translateZ(1px)', ...goldFill(t, 0.35, 110), filter: 'drop-shadow(0 0 30px rgba(255,190,90,.35))'}}>{text}</div>
  </div>
);

export const Opening: React.FC = () => {
  const t = useTime();
  const bare = useBare();
  const {portrait} = usePortrait();
  const sh = shake(t, 6, 0.6);
  // the push through: everything accelerates toward lens at the end
  const push = inCubic(prog(t, 4.6, 5.9));
  const camZ = t * 60 + push * 1400;

  // "7" choreography
  const in7 = outExpo(prog(t, 0.55, 1.8));
  const out7 = inCubic(prog(t, 2.35, 3.2));
  const rotY = lerp(-38, 14, prog(t, 0.4, 3.2)) + out7 * 30;
  const z7 = lerp(-900, -120, in7) + out7 * 1500 + camZ * 0.3;

  // lion silhouette behind, lit by a sweep
  const lionA = clamp(prog(t, 1.8, 3.4)) * (1 - push) * 0.22;
  const sweep = lerp(-60, 160, prog(t, 2.0, 5.4));

  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 70% at 50% 55%, #101a33 0%, ${C.ink} 70%)`, overflow: 'hidden'}}>
      {/* volumetric rays */}
      <AbsoluteFill style={{opacity: 0.55 * (1 - push * 0.5), transform: `rotate(${t * 4}deg) scale(1.6)`, background: 'repeating-conic-gradient(from 0deg at 50% 38%, rgba(255,200,120,.10) 0deg 3deg, transparent 3deg 11deg)', maskImage: 'radial-gradient(60% 60% at 50% 40%, black 0%, transparent 70%)', WebkitMaskImage: 'radial-gradient(60% 60% at 50% 40%, black 0%, transparent 70%)'}} />

      <AbsoluteFill style={{perspective: 1200, transform: `translate(${sh.x}px,${sh.y}px)`}}>
        {/* lion emblem silhouette */}
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateZ(${-600 + camZ * 0.25}px)`}}>
          <svg viewBox={`0 0 ${logo.w} 352`} width={900} height={900 * 352 / logo.w} style={{opacity: lionA}}>
            <defs>
              <linearGradient id="lsweep" x1="0" x2="1" y1="0" y2="0.3">
                <stop offset={`${sweep - 40}%`} stopColor="#3a2a10" />
                <stop offset={`${sweep}%`} stopColor="#ffe6b0" />
                <stop offset={`${sweep + 25}%`} stopColor="#3a2a10" />
              </linearGradient>
            </defs>
            <path d={logo.emblem} fill="url(#lsweep)" fillRule="evenodd" />
          </svg>
        </AbsoluteFill>

        {/* the 7 */}
        {t < 3.4 && (
          <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', transformStyle: 'preserve-3d'}}>
            <div style={{transformStyle: 'preserve-3d', transform: `translate3d(${portrait ? -30 : -260}px, ${portrait ? -60 : 10}px, ${z7}px) rotateY(${rotY}deg) rotateX(${8 - t * 2}deg)`, opacity: Math.min(1, in7 * 2) * (1 - out7 * out7), filter: out7 > 0.3 ? `blur(${(out7 - 0.3) * 30}px)` : undefined}}>
              <Extruded text="7" size={760} t={t} />
            </div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>

      {/* type */}
      {!bare && (<AbsoluteFill style={{transform: `translate3d(${sh.x * 0.5}px, ${sh.y * 0.5}px, 0) scale(${1 + t * 0.012 + push * 1.8})`, opacity: 1 - push, filter: push > 0.2 ? `blur(${push * 20}px)` : undefined}}>
        <div style={{position: 'absolute', left: 1010, top: 395, transform: `translateX(${-t * 8}px)`}}>
          <Wipe at={1.0} out={2.3} t={t}>
            <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.4em', color: C.gold}}>OXFORD · ДУШАНБЕ</div>
          </Wipe>
          <Kinetic text="ФИЛИАЛОВ" at={1.05} out={2.35} t={t} stagger={0.045} style={{fontFamily: F.display, fontWeight: 700, fontSize: 168, lineHeight: 1, color: C.white, letterSpacing: '0.02em', marginTop: 10}} />
        </div>

        <div style={{position: 'absolute', left: 0, right: 0, top: 360, transform: `translateY(${-t * 6}px)`}}>
          <Kinetic text="ОДНА ЦЕЛЬ" at={2.6} out={4.55} t={t} mode="track" align="center" style={{fontFamily: F.display, fontWeight: 700, fontSize: 96, letterSpacing: '0.32em', color: C.white}} />
          <div style={{height: 18}} />
          <Kinetic text="ВАШЕ БУДУЩЕЕ" at={3.75} out={4.7} t={t} stagger={0.04} align="center" style={{fontFamily: F.display, fontWeight: 700, fontSize: 190, lineHeight: 1, letterSpacing: '0.01em'}} charStyle={goldFill(t, 0.4)} />
        </div>
      </AbsoluteFill>)}

      <Dust t={t} speed={1 + push * 8} />
    </AbsoluteFill>
  );
};
