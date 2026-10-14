import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, Sequence, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/oswald/700.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/jetbrains-mono/400.css';
import {C, T, clamp, prog, useTime} from './lib';
import {Opening} from './scenes/Opening';
import {Country} from './scenes/Country';
import {City} from './scenes/City';
import {Logo} from './scenes/Logo';

const fps = T.fps;
const at = (s: number) => Math.round(s * fps);

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = ['700 40px Oswald', '500 20px Montserrat', '800 20px Montserrat', '400 20px "JetBrains Mono"'];
    Promise.all(faces.flatMap((f) => [document.fonts.load(f, 'ДӮӣҶ'), document.fonts.load(f, 'OXFORD 0123')]))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

/** film gate: grain, vignette, letterbox, light leaks, flare on hits */
const Gate: React.FC = () => {
  const t = useTime();
  const f = useCurrentFrame();
  const hits = Object.values(T.hits);
  const flare = Math.max(0, ...hits.map((h) => (t >= h ? Math.max(0, 1 - (t - h) / 1.2) : 0)));
  const leak = 0.5 + 0.5 * Math.sin(t * 0.31);
  const bar = 92;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* anamorphic streak on every hit */}
      <AbsoluteFill style={{background: `linear-gradient(to bottom, transparent ${50 - 0.6}%, rgba(140,190,255,${0.55 * flare}) 50%, transparent ${50 + 0.6}%)`, mixBlendMode: 'screen', transform: `scaleX(${1 + flare})`}} />
      <AbsoluteFill style={{background: `radial-gradient(40% 18% at 50% 50%, rgba(255,200,130,${0.35 * flare}), transparent 70%)`, mixBlendMode: 'screen'}} />
      {/* light leak drifting across */}
      <AbsoluteFill style={{background: `radial-gradient(50% 60% at ${10 + leak * 80}% ${20 + leak * 20}%, rgba(255,140,60,.10), transparent 70%)`, mixBlendMode: 'screen'}} />
      {/* vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(120% 95% at 50% 50%, transparent 55%, rgba(0,0,0,.55) 85%, rgba(0,0,0,.85) 100%)'}} />
      {/* grain */}
      <Img src={staticFile(`grain${f % 6}.png`)} style={{position: 'absolute', left: -((f * 37) % 120), top: -((f * 53) % 90), width: 1920 + 120, height: 1080 + 90, opacity: 0.09, mixBlendMode: 'overlay', imageRendering: 'auto'}} />
      {/* letterbox */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bar, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bar, background: '#000'}} />
    </AbsoluteFill>
  );
};

/** cross-dissolves are motion-matched: each scene is still moving when the next one takes over */
const Fade: React.FC<{from: number; to: number; fin?: number; fout?: number; children: React.ReactNode}> = ({from, to, fin = 0.01, fout = 0.01, children}) => {
  const t = useTime();
  const a = Math.min(clamp(prog(t, from, from + fin)), 1 - clamp(prog(t, to - fout, to)));
  if (a <= 0) return null;
  return <AbsoluteFill style={{opacity: a}}>{children}</AbsoluteFill>;
};

export const Film: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: C.ink}}>
      {/* scenes share the master clock (no Sequence offset) so timings read straight off the VO */}
      <Fade from={0} to={6.0} fout={0.7}><Opening /></Fade>
      <Fade from={4.8} to={14.4} fin={0.8} fout={0.5}><Country /></Fade>
      <Fade from={13.5} to={T.hits.logo + 0.4} fin={0.01} fout={0.6}><City /></Fade>
      <Fade from={T.hits.logo - 0.2} to={T.duration + 1} fin={0.6}><Logo /></Fade>
      <Gate />
      <Sequence from={0}>
        <Audio src={staticFile('soundtrack.wav')} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const DURATION = at(T.duration);
