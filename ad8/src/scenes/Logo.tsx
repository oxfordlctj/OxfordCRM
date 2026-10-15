import React from 'react';
import {AbsoluteFill} from 'remotion';
import logo from '../logo.json';
import {C, F, Kinetic, T, Wipe, clamp, inOutSine, lerp, outExpo, prog, shake, useBare, usePortrait, useTime} from '../lib';
import {Dust} from './Opening';

const L0 = T.hits.logo;

export const Logo: React.FC = () => {
  const t = useTime();
  const bare = useBare();
  const {width, portrait} = usePortrait();
  const lt = t - L0;
  const sh = shake(t, 3, 0.4, 9);
  const reveal = outExpo(prog(lt, 0.0, 2.4));
  const sweep = lerp(-40, 140, inOutSine(prog(lt, 0.4, 3.4)));
  const sheen = ((lt * 0.22) % 1) * 260 - 80;
  const word = outExpo(prog(lt, 0.7, 2.0));
  const tag = outExpo(prog(lt, 1.2, 2.4));
  const end = prog(t, T.duration - 1.2, T.duration);
  // slow, endless dolly-in with a little yaw: the camera never parks on the logo
  const dolly = 0.86 + lt * 0.018;
  const yaw = lerp(-14, 6, inOutSine(prog(lt, 0, 8.5)));

  const w = portrait ? 660 : 560;
  const sc = w / logo.w;

  return (
    <AbsoluteFill style={{background: `radial-gradient(70% 70% at 50% 42%, #14203d 0%, #070b16 55%, ${C.ink} 100%)`, opacity: 1 - end}}>
      {/* god rays behind the lion */}
      <AbsoluteFill style={{opacity: 0.6 * reveal, transform: `rotate(${lt * 3}deg) scale(1.8)`, background: 'repeating-conic-gradient(from 0deg at 50% 36%, rgba(255,205,130,.14) 0deg 2deg, transparent 2deg 9deg)', maskImage: 'radial-gradient(45% 45% at 50% 36%, black, transparent 75%)', WebkitMaskImage: 'radial-gradient(45% 45% at 50% 36%, black, transparent 75%)'}} />
      <Dust t={t} n={90} speed={0.5} seed={7} />

      <AbsoluteFill style={{perspective: 1400, transform: `translate(${sh.x}px, ${sh.y}px)`}}>
        <div style={{position: 'absolute', left: width / 2 - w / 2, top: portrait ? 190 : 108, width: w, transformStyle: 'preserve-3d', transform: `scale(${dolly}) rotateY(${yaw}deg) rotateX(${lerp(8, 0, reveal)}deg)`, transformOrigin: '50% 40%'}}>
          <svg viewBox={`0 0 ${logo.w} ${logo.h}`} width={w} height={logo.h * sc} style={{overflow: 'visible'}}>
            <defs>
              <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0.35">
                <stop offset="0%" stopColor="#7a4c15" />
                <stop offset={`${clamp(sheen - 12, 0, 100)}%`} stopColor="#d49a3c" />
                <stop offset={`${clamp(sheen, 0, 100)}%`} stopColor="#fff4d6" />
                <stop offset={`${clamp(sheen + 12, 0, 100)}%`} stopColor="#d49a3c" />
                <stop offset="100%" stopColor="#8a5a17" />
              </linearGradient>
              <linearGradient id="revealMask" x1="0" y1="1" x2="0.3" y2="0">
                <stop offset={`${sweep - 30}%`} stopColor="#fff" />
                <stop offset={`${sweep}%`} stopColor="#000" />
              </linearGradient>
              <mask id="m"><rect x="-50" y="-50" width={logo.w + 100} height={logo.h + 100} fill="url(#revealMask)" /></mask>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter>
            </defs>
            {/* bloom */}
            <path d={logo.emblem} fill="#ffcf7a" fillRule="evenodd" filter="url(#glow)" opacity={0.35 * reveal} mask="url(#m)" />
            <path d={logo.emblem} fill="url(#gold)" fillRule="evenodd" mask="url(#m)" />
            {/* edge of the reveal: a hot line */}
            <path d={logo.emblem} fill="none" stroke="#fff3d0" strokeWidth={0.8} fillRule="evenodd" opacity={(1 - reveal) * 0.9} mask="url(#m)" />
            <g style={{transform: `translateY(${(1 - tag) * 14}px)`, opacity: tag}}>
              <path d={logo.tagline} fill={C.ivory} fillRule="evenodd" />
            </g>
            <g style={{transform: `translateY(${(1 - word) * 30}px) scale(${lerp(1.25, 1, word)})`, transformOrigin: '50% 92%', opacity: word}}>
              <path d={logo.wordmark} fill="url(#gold)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </AbsoluteFill>

      {/* end card copy */}
      {!bare && <div style={{position: 'absolute', left: 0, right: 0, top: 830, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
        <Kinetic text="ФИЛИАЛ №8 · ДОМПЕЧАТЬ" at={T.endcard[0]} out={T.duration + 2} t={t} stagger={0.025} align="center" style={{fontFamily: F.display, fontWeight: 700, fontSize: 58, letterSpacing: '0.12em', color: C.white}} />
        <Wipe at={T.endcard[1]} out={T.duration + 2} t={t}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <div style={{width: 60, height: 1.5, background: C.gold}} />
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: '0.5em', color: C.gold}}>СКОРО ОТКРЫТИЕ</div>
            <div style={{width: 60, height: 1.5, background: C.gold}} />
          </div>
        </Wipe>
      </div>}
    </AbsoluteFill>
  );
};
