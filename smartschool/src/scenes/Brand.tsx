import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F, clamp, goldFill, inCubic, lerp, outBack, outExpo, prog, rand} from '../lib';

const useT = () => useCurrentFrame() / 30;

/** placeholder mark: a speech bubble carrying the S — speaking is the product */
export const LogoMark: React.FC<{size: number; t: number; sheen?: number}> = ({size, t, sheen = 0}) => {
  const p = ((t * 0.35) % 1) * 140 - 20;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#58e6ff" />
          <stop offset="55%" stopColor="#2f7bff" />
          <stop offset="100%" stopColor="#1638b8" />
        </linearGradient>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset={`${p - 12}%`} stopColor="#fff" stopOpacity="0" />
          <stop offset={`${p}%`} stopColor="#fff" stopOpacity={0.75 * sheen} />
          <stop offset={`${p + 12}%`} stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
      </defs>
      <path d="M40 18h120a26 26 0 0 1 26 26v84a26 26 0 0 1-26 26H86l-38 32 6-32H40a26 26 0 0 1-26-26V44a26 26 0 0 1 26-26z" fill="#2f7bff" filter="url(#glow)" opacity="0.55" />
      <path d="M40 18h120a26 26 0 0 1 26 26v84a26 26 0 0 1-26 26H86l-38 32 6-32H40a26 26 0 0 1-26-26V44a26 26 0 0 1 26-26z" fill="url(#lg)" />
      <path d="M40 18h120a26 26 0 0 1 26 26v84a26 26 0 0 1-26 26H86l-38 32 6-32H40a26 26 0 0 1-26-26V44a26 26 0 0 1 26-26z" fill="url(#sheen)" />
      <path d="M40 19h120a25 25 0 0 1 25 25v6H15v-6a25 25 0 0 1 25-25z" fill="#fff" opacity="0.14" />
      <text x="100" y="124" textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize="104" fill="#fff">S</text>
    </svg>
  );
};

export const Wordmark: React.FC<{t: number; scale?: number; reveal?: number}> = ({t, scale = 1, reveal = 1}) => {
  const letters = Array.from('SmartSchool');
  return (
    <div style={{display: 'flex', alignItems: 'baseline', fontFamily: F.body, fontSize: 122 * scale, letterSpacing: '-0.01em', lineHeight: 1}}>
      {letters.map((ch, i) => {
        const e = outExpo(clamp(reveal * 1.6 - i * 0.06));
        const isSchool = i >= 5;
        return (
          <span key={i} style={{display: 'inline-block', fontWeight: isSchool ? 500 : 800, transform: `translateY(${(1 - e) * 60}px) scale(${lerp(1.6, 1, e)})`, opacity: e, filter: e < 1 ? `blur(${(1 - e) * 10}px)` : undefined, ...(isSchool ? goldFill(t, 0.3) : {color: C.white})}}>{ch}</span>
        );
      })}
    </div>
  );
};

/** god rays + floor glow + particles: the stage the logo lands on */
export const Stage: React.FC<{t: number; intensity?: number}> = ({t, intensity = 1}) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 55% at 50% 42%, #0e2a6e 0%, #061233 45%, ${C.ink} 80%)`}}>
      <AbsoluteFill style={{opacity: 0.55 * intensity, transform: `rotate(${t * 5}deg) scale(2.4)`, background: 'repeating-conic-gradient(from 0deg at 50% 42%, rgba(90,190,255,.16) 0deg 2.2deg, transparent 2.2deg 9deg)', maskImage: 'radial-gradient(45% 35% at 50% 42%, black, transparent 80%)', WebkitMaskImage: 'radial-gradient(45% 35% at 50% 42%, black, transparent 80%)'}} />
      <div style={{position: 'absolute', left: -200, right: -200, top: height * 0.6, height: 600, background: 'radial-gradient(50% 40% at 50% 0%, rgba(63,224,255,.35), transparent 70%)', transform: 'perspective(800px) rotateX(70deg)', opacity: intensity}} />
      {Array.from({length: 90}).map((_, i) => {
        const sp = 0.4 + rand(i) * 1.2;
        const y = (((rand(i + 3) * height - t * 90 * sp) % height) + height) % height;
        const s = 1 + rand(i * 7) * 3;
        return <div key={i} style={{position: 'absolute', left: rand(i * 2) * width + Math.sin(t + i) * 20, top: y, width: s, height: s, borderRadius: '50%', background: '#9fe8ff', opacity: 0.25 + rand(i * 5) * 0.5, boxShadow: '0 0 10px #3fe0ff'}} />;
      })}
    </AbsoluteFill>
  );
};

/** 9.5–14.0: the brand lands with the first big hit */
export const BrandReveal: React.FC = () => {
  const t = useT();
  const {width} = useVideoConfig();
  const lt = t - 9.5;
  const mark = outBack(clamp(lt / 0.6));
  const streaks = 1 - outExpo(clamp(lt / 0.7));
  return (
    <AbsoluteFill>
      <Stage t={t} />
      {/* light streaks converging into the mark */}
      {Array.from({length: 14}).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const d = 900 * streaks + 40;
        return <div key={i} style={{position: 'absolute', left: width / 2 + Math.cos(a) * d - 180, top: 640 + Math.sin(a) * d, width: 360, height: 3, background: 'linear-gradient(90deg, transparent, #bff4ff, transparent)', transform: `rotate(${a}rad)`, opacity: streaks * 0.9, boxShadow: '0 0 20px #3fe0ff'}} />;
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44, transform: `scale(${1 + lt * 0.02})`}}>
        <div style={{transform: `scale(${lerp(3.2, 1, mark)}) rotate(${(1 - mark) * -30}deg)`, opacity: clamp(lt * 4), filter: mark < 0.95 ? `blur(${(1 - mark) * 12}px)` : undefined}}>
          <LogoMark size={330} t={t} sheen={clamp((lt - 0.6) * 2)} />
        </div>
        <Wordmark t={t} reveal={prog(t, 9.75, 10.6)} />
        <div style={{fontFamily: F.mono, fontSize: 30, letterSpacing: '0.5em', marginRight: '-0.5em', color: C.cyan, opacity: outExpo(prog(t, 10.4, 11.0))}}>ENGLISH CENTER</div>
      </div>
    </AbsoluteFill>
  );
};

/** 33.5–41.5: final lockup and call to action */
export const Finale: React.FC = () => {
  const t = useT();
  const lt = t - 33.5;
  const mark = outBack(clamp(lt / 0.55));
  const cta = outExpo(prog(t, 37.05, 37.6));
  const pulse = 1 + Math.max(0, Math.sin((t - 37.6) * 6)) * 0.035 * (t > 37.6 ? 1 : 0);
  const fadeOut = inCubic(prog(t, 40.9, 41.5));
  return (
    <AbsoluteFill style={{opacity: 1 - fadeOut}}>
      <Stage t={t} intensity={1.2} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, transform: `scale(${0.96 + lt * 0.012})`}}>
        <div style={{transform: `scale(${lerp(2.6, 1, mark)})`, opacity: clamp(lt * 5), filter: mark < 0.95 ? `blur(${(1 - mark) * 10}px)` : undefined}}>
          <LogoMark size={280} t={t} sheen={1} />
        </div>
        <Wordmark t={t} reveal={prog(t, 33.6, 34.3)} />
        <div style={{fontFamily: F.mono, fontSize: 28, letterSpacing: '0.5em', marginRight: '-0.5em', color: C.cyan, opacity: outExpo(prog(t, 34.0, 34.6))}}>ENGLISH CENTER</div>
      </div>
      {/* call to action */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1290, display: 'flex', justifyContent: 'center', opacity: cta, transform: `translateY(${(1 - cta) * 60}px) scale(${pulse})`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 26, padding: '30px 54px', borderRadius: 999, background: 'linear-gradient(90deg, #2f7bff, #3fe0ff)', boxShadow: '0 0 60px rgba(63,224,255,.55), 0 20px 50px rgba(0,0,0,.5)'}}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>
          <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 62, color: '#fff', letterSpacing: '0.04em'}}>БА ДИРЕКТ НАВИСЕД</div>
        </div>
      </div>
      {/* a sweep of light across the button */}
      <div style={{position: 'absolute', left: ((t - 37.6) % 1.6) * 900 - 200, top: 1270, width: 140, height: 160, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent)', transform: 'skewX(-20deg)', opacity: t > 37.6 ? cta : 0, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};
