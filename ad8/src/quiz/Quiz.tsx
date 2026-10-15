import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/oswald/700.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/jetbrains-mono/400.css';
import Q from '../quiz.json';
import BEATS from '../quiz_beats.json';
import logo from '../logo.json';
import {C, F, clamp, goldFill, inCubic, lerp, outBack, outExpo, prog, rand, shake} from '../lib';
import {Dust} from '../scenes/Opening';

const useT = () => useCurrentFrame() / Q.fps;
const RED = '#ff3b55';
const GREEN = '#25d07a';

const pulse = (t: number, times: number[], k: number) => {
  let last = -99;
  for (const x of times) if (x <= t && x > last) last = x;
  return last < 0 ? 0 : Math.exp(-(t - last) * k);
};

type Opt = {text: string; ok: boolean; sub?: string};
type Question = {at: number; out: number; label: string; prompt: React.ReactNode; options: Opt[]; explain: string};

const QS: Question[] = [
  {
    at: 3.4, out: 13.0, label: 'САВОЛИ 1/3',
    prompt: (
      <>
        <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 104, color: C.white, lineHeight: 1.05}}>«МАН 22 СОЛА<br />ҲАСТАМ»</div>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 46, color: C.dim, marginTop: 14}}>бо англисӣ чӣ мешавад?</div>
      </>
    ),
    options: [{text: 'I have 22 years', ok: false}, {text: 'I am 22 years old', ok: true}],
    explain: 'I HAVE ✕   →   I AM ✓',
  },
  {
    at: 13.0, out: 20.1, label: 'САВОЛИ 2/3',
    prompt: <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 110, color: C.white, lineHeight: 1.05}}>КАДОМАШ<br />ДУРУСТ АСТ?</div>,
    options: [{text: "He doesn't know", ok: true}, {text: "He don't know", ok: false}],
    explain: "HE · SHE · IT  →  DOESN'T",
  },
  {
    at: 20.1, out: 30.2, label: 'САВОЛИ 3/3 · ДУШВОРТАРИН',
    prompt: (
      <>
        <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 150, lineHeight: 1, letterSpacing: '0.02em', ...goldFill(20, 0.3)}}>WEDNESDAY</div>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 46, color: C.dim, marginTop: 14}}>чӣ тавр мехонанд?</div>
      </>
    ),
    options: [{text: 'ВЕД-НЕС-ДЕЙ', ok: false}, {text: 'ВЕНЗ-ДЕЙ', ok: true, sub: '/ˈwenzdeɪ/'}],
    explain: 'ҲАРФИ «D» ХОНДА НАМЕШАВАД',
  },
];

// ───────── background stage: never still ─────────
const Stage: React.FC<{t: number; tension: number}> = ({t, tension}) => (
  <AbsoluteFill style={{background: `radial-gradient(85% 55% at 50% 42%, ${tension > 0.5 ? '#2a0f1c' : '#14203d'} 0%, #070b16 55%, ${C.ink} 100%)`}}>
    <AbsoluteFill style={{opacity: 0.5, transform: `rotate(${t * (6 + tension * 30)}deg) scale(2.4)`, background: `repeating-conic-gradient(from 0deg at 50% 45%, ${tension > 0.5 ? 'rgba(255,80,100,.12)' : 'rgba(255,200,120,.11)'} 0deg 2deg, transparent 2deg 10deg)`, maskImage: 'radial-gradient(55% 40% at 50% 45%, black, transparent 78%)', WebkitMaskImage: 'radial-gradient(55% 40% at 50% 45%, black, transparent 78%)'}} />
    <Dust t={t} n={90} speed={1 + tension * 2} seed={11} />
  </AbsoluteFill>
);

const Header: React.FC<{t: number}> = ({t}) => {
  const qi = QS.findIndex((q) => t >= q.at && t < q.out);
  const a = outExpo(prog(t, 3.3, 3.8)) * (1 - prog(t, 30.0, 30.4));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 210, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, opacity: a}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <svg viewBox={`0 0 ${logo.w} 352`} width={58} height={58 * 352 / logo.w}><path d={logo.emblem} fill={C.gold} fillRule="evenodd" /></svg>
        <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 40, letterSpacing: '0.24em', color: C.ivory}}>OXFORD</div>
      </div>
      <div style={{display: 'flex', gap: 12}}>
        {QS.map((q, i) => (
          <div key={i} style={{width: 90, height: 10, borderRadius: 5, background: i < qi || (i === qi && t >= Q.reveals[i]) ? C.gold : i === qi ? 'rgba(233,183,91,.5)' : 'rgba(255,255,255,.18)'}} />
        ))}
      </div>
    </div>
  );
};

const Hook: React.FC<{t: number}> = ({t}) => {
  if (t > 3.5) return null;
  const e1 = outExpo(prog(t, 0.0, 0.3));
  const e2 = outExpo(prog(t, 0.45, 0.75));
  const chips = outBack(clamp((t - 1.7) / 0.4));
  const out = inCubic(prog(t, 3.2, 3.45));
  const jit = (rand(Math.floor(t * 24)) - 0.5) * 18;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 640, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 1 - out, transform: `scale(${1 + t * 0.03 + out * 0.4})`}}>
      <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 128, color: C.white, transform: `scale(${lerp(1.6, 1, e1)})`, opacity: e1, lineHeight: 1}}>ШУМО ҲАТМАН</div>
      <div style={{position: 'relative', transform: `scale(${lerp(1.8, 1, e2)}) translateX(${t > 0.45 ? jit : 0}px)`, opacity: e2}}>
        <div style={{position: 'absolute', inset: 0, fontFamily: F.display, fontWeight: 700, fontSize: 132, color: 'rgba(40,220,255,.8)', transform: 'translateX(-9px)', mixBlendMode: 'screen', lineHeight: 1}}>ХАТО МЕКУНЕД!</div>
        <div style={{position: 'relative', fontFamily: F.display, fontWeight: 700, fontSize: 132, color: RED, lineHeight: 1, textShadow: '0 0 40px rgba(255,59,85,.6)'}}>ХАТО МЕКУНЕД!</div>
      </div>
      <div style={{display: 'flex', gap: 22, marginTop: 40, transform: `scale(${chips})`}}>
        {['3 САВОЛ', '3 СОНИЯ'].map((c) => (
          <div key={c} style={{padding: '18px 36px', borderRadius: 999, border: `3px solid ${C.gold}`, fontFamily: F.display, fontWeight: 700, fontSize: 60, color: C.gold, background: 'rgba(233,183,91,.1)'}}>{c}</div>
        ))}
      </div>
    </div>
  );
};

const Confetti: React.FC<{t: number; at: number; y: number}> = ({t, at, y}) => {
  const {width} = useVideoConfig();
  if (t < at || t > at + 1.8) return null;
  const lt = t - at;
  return (
    <>
      {Array.from({length: 70}).map((_, i) => {
        const a = rand(i) * Math.PI * 2;
        const v = 500 + rand(i + 3) * 1100;
        const x = width / 2 + Math.cos(a) * v * lt;
        const yy = y + Math.sin(a) * v * lt * 0.8 + 1100 * lt * lt;
        const col = [C.gold, GREEN, '#ffffff', '#ffd27a', '#7af0b4'][i % 5];
        return <div key={i} style={{position: 'absolute', left: x, top: yy, width: 14, height: 22, background: col, transform: `rotate(${lt * (400 + rand(i) * 600)}deg)`, opacity: 1 - lt / 1.8, borderRadius: 3}} />;
      })}
    </>
  );
};

const Timer: React.FC<{t: number; a: number; b: number}> = ({t, a, b}) => {
  if (t < a - 0.2 || t > b + 0.4) return null;
  const p = clamp((t - a) / (b - a));
  const left = Math.max(1, 3 - Math.floor(t - a));
  const tick = Math.exp(-((t - a) % 1) * 7);
  const col = p < 0.66 ? C.gold : RED;
  const R = 110, L = 2 * Math.PI * R;
  const vis = outBack(clamp((t - a + 0.2) / 0.3)) * (1 - prog(t, b + 0.1, b + 0.4));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1395, display: 'flex', justifyContent: 'center', transform: `scale(${vis * (1 + tick * 0.08)})`}}>
      <div style={{position: 'relative', width: 260, height: 260}}>
        <svg width={260} height={260} style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
          <circle cx={130} cy={130} r={R} fill="rgba(0,0,0,.35)" stroke="rgba(255,255,255,.12)" strokeWidth={16} />
          <circle cx={130} cy={130} r={R} fill="none" stroke={col} strokeWidth={16} strokeLinecap="round" strokeDasharray={`${L * (1 - p)} ${L}`} style={{filter: `drop-shadow(0 0 14px ${col})`}} />
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontWeight: 700, fontSize: 130, color: col, transform: `scale(${1 + tick * 0.25})`}}>{t < b ? left : '!'}</div>
      </div>
    </div>
  );
};

const QuestionCard: React.FC<{t: number; q: Question; i: number}> = ({t, q, i}) => {
  if (t < q.at - 0.1 || t > q.out + 0.1) return null;
  const r = Q.reveals[i];
  const [ta, tb] = Q.timers[i];
  const inE = outExpo(prog(t, q.at, q.at + 0.45));
  const outE = inCubic(prog(t, q.out - 0.25, q.out));
  const push = 1 + clamp((t - ta) / (tb - ta)) * 0.05 * (t < r ? 1 : 0);
  return (
    <AbsoluteFill style={{transform: `translateY(${(1 - inE) * 260 - outE * 500}px) scale(${push})`, opacity: inE * (1 - outE)}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: '12px 30px', borderRadius: 999, background: C.gold, fontFamily: F.display, fontWeight: 700, fontSize: 40, color: '#1b1206', letterSpacing: '0.08em'}}>{q.label}</div>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 480, textAlign: 'center'}}>{q.prompt}</div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 880, display: 'flex', flexDirection: 'column', gap: 30}}>
        {q.options.map((o, k) => {
          const shown = outBack(clamp((t - q.at - 0.4 - k * 0.15) / 0.4));
          const wrongHit = !o.ok && t >= r;
          const rightHit = o.ok && t >= r + 0.22;
          const shakeX = wrongHit ? Math.sin((t - r) * 70) * 22 * Math.exp(-(t - r) * 6) : 0;
          const pop = rightHit ? 1 + 0.1 * Math.exp(-(t - r - 0.22) * 6) : 1;
          const bg = rightHit ? `linear-gradient(90deg, ${GREEN}, #12a85c)` : wrongHit ? `linear-gradient(90deg, ${RED}, #c4172f)` : 'linear-gradient(135deg, rgba(255,255,255,.16), rgba(255,255,255,.05))';
          return (
            <div key={k} style={{height: 160, borderRadius: 34, display: 'flex', alignItems: 'center', gap: 28, padding: '0 34px', background: bg, border: `2px solid ${rightHit ? '#8af5c0' : wrongHit ? '#ff8a99' : 'rgba(255,255,255,.35)'}`, boxShadow: rightHit ? `0 0 60px ${GREEN}` : '0 20px 50px rgba(0,0,0,.4)', transform: `translateX(${shakeX + (1 - shown) * (k ? 300 : -300)}px) scale(${shown * pop})`, opacity: wrongHit ? 0.85 : 1}}>
              <div style={{width: 92, height: 92, flex: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: rightHit || wrongHit ? 'rgba(255,255,255,.25)' : C.gold, fontFamily: F.display, fontWeight: 700, fontSize: 56, color: rightHit || wrongHit ? '#fff' : '#1b1206'}}>
                {rightHit ? '✓' : wrongHit ? '✕' : k ? 'B' : 'A'}
              </div>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{fontFamily: F.body, fontWeight: 800, fontSize: o.text.length > 15 ? 54 : 62, color: '#fff', whiteSpace: 'nowrap', textDecoration: wrongHit ? 'line-through' : undefined}}>{o.text}</div>
                {o.sub && rightHit && <div style={{fontFamily: F.mono, fontSize: 34, color: '#eafff3'}}>{o.sub}</div>}
              </div>
            </div>
          );
        })}
        {/* the rule, so the viewer learns something */}
        <div style={{alignSelf: 'center', marginTop: 16, padding: '16px 34px', borderRadius: 20, border: `2px solid ${C.gold}`, background: 'rgba(233,183,91,.12)', fontFamily: F.display, fontWeight: 700, fontSize: 50, color: C.goldHi, opacity: outExpo(prog(t, r + 0.6, r + 1.0)), transform: `translateY(${(1 - outExpo(prog(t, r + 0.6, r + 1.0))) * 40}px)`}}>{q.explain}</div>
      </div>
      <Timer t={t} a={ta} b={tb} />
      <Confetti t={t} at={r + 0.22} y={1050} />
    </AbsoluteFill>
  );
};

/** points at Instagram's own right-rail buttons: comment (~y1330) and share (~y1480) */
const RailArrow: React.FC<{t: number; at: number; y: number; label: string; icon: React.ReactNode}> = ({t, at, y, label, icon}) => {
  const e = outBack(clamp((t - at) / 0.45));
  if (e <= 0) return null;
  const bob = Math.sin((t - at) * 9) * 14;
  return (
    <div style={{position: 'absolute', right: 140, top: y - 60, display: 'flex', alignItems: 'center', gap: 22, transform: `translateX(${(1 - e) * 300 + bob}px) scale(${e})`, transformOrigin: '100% 50%'}}>
      <div style={{padding: '18px 30px', borderRadius: 26, background: 'rgba(255,255,255,.95)', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 20px 50px rgba(0,0,0,.5)'}}>
        {icon}
        <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 50, color: '#0b1224', whiteSpace: 'nowrap'}}>{label}</div>
      </div>
      <svg width="90" height="60" viewBox="0 0 90 60"><path d="M0 30h70M50 8l26 22-26 22" stroke={C.gold} strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  );
};

const Outro: React.FC<{t: number}> = ({t}) => {
  const c = Q.cta;
  if (t < c.count - 0.1) return null;
  const e = outExpo(prog(t, c.count, c.count + 0.35));
  const brand = outBack(clamp((t - c.brand) / 0.5));
  const qOut = inCubic(prog(t, c.brand - 0.2, c.brand + 0.1));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 40, right: 40, top: 430, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 1 - qOut, transform: `scale(${lerp(1.5, 1, e) + (t - c.count) * 0.02})`}}>
        <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 150, color: C.white, lineHeight: 1}}>ЧАНДТО</div>
        <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 150, lineHeight: 1, ...goldFill(t, 0.6)}}>ДУРУСТ?</div>
        <div style={{display: 'flex', gap: 26, marginTop: 50}}>
          {['0', '1', '2', '3'].map((d, i) => {
            const b = Math.max(0, Math.sin((t - c.count) * 6 - i * 0.9)) ** 4;
            return <div key={d} style={{width: 150, height: 150, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `4px solid ${C.gold}`, fontFamily: F.display, fontWeight: 700, fontSize: 96, color: C.gold, background: 'rgba(233,183,91,.12)', transform: `translateY(${-b * 40}px) scale(${outBack(clamp((t - c.count - 0.3 - i * 0.1) / 0.35))})`}}>{d}</div>;
          })}
        </div>
      </div>
      <div style={{opacity: 1 - qOut}}>
        <RailArrow t={t} at={c.count + 0.9} y={1330} label="ДАР КОММЕНТ НАВИСЕД!" icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0b1224" strokeWidth="2.4"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z" /></svg>} />
        <RailArrow t={t} at={c.share} y={1480} label="БА ДӮСТАТОН ФИРИСТЕД" icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0b1224" strokeWidth="2.4" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>} />
      </div>
      {t >= c.brand - 0.05 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
          <svg viewBox={`0 0 ${logo.w} ${logo.h}`} width={560} height={560 * logo.h / logo.w} style={{transform: `scale(${brand})`, filter: 'drop-shadow(0 0 40px rgba(255,200,120,.35))'}}>
            <defs>
              <linearGradient id="qg" x1="0" y1="0" x2="1" y2="0.3">
                <stop offset="0%" stopColor="#7a4c15" />
                <stop offset={`${clamp(((t * 25) % 140) - 20, 0, 100)}%`} stopColor="#fff2cf" />
                <stop offset="100%" stopColor="#c38a2e" />
              </linearGradient>
            </defs>
            <path d={logo.emblem} fill="url(#qg)" fillRule="evenodd" />
            <path d={logo.tagline} fill={C.ivory} fillRule="evenodd" />
            <path d={logo.wordmark} fill="url(#qg)" fillRule="evenodd" />
          </svg>
          <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 70, color: C.white, textAlign: 'center', lineHeight: 1.1, opacity: outExpo(prog(t, c.brand + 0.4, c.brand + 0.9))}}>
            ХАТО НАКУНЕД —<br /><span style={goldFill(t, 0.5)}>OXFORD ИНТИЗОРИ ШУМОСТ!</span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = ['700 40px Oswald', '500 20px Montserrat', '800 20px Montserrat', '400 20px "JetBrains Mono"'];
    Promise.all(faces.flatMap((f) => [document.fonts.load(f, 'ҶӮӢҲҚҒ'), document.fonts.load(f, "WEDNESDAY doesn't ˈ")]))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

export const Quiz: React.FC = () => {
  useFonts();
  const t = useT();
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const tension = Q.timers.some(([a, b]) => t >= a && t < b) ? 1 : 0;
  const kick = pulse(t, BEATS.kicks, 11);
  const hit = pulse(t, Q.hits, 7);
  const rev = pulse(t, Q.reveals.map((r) => r + 0.22), 5);
  const sh = shake(t, 3 + hit * 14 + rev * 16 + tension * 3, 2 + hit * 6 + tension * 3, 7);
  // the loop seam: last frames flash back toward the hook
  const loop = prog(t, Q.duration - 0.35, Q.duration);
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${1 + kick * 0.02 + hit * 0.04 + Math.sin(t * 0.7) * 0.01})`}}>
        <Stage t={t} tension={tension} />
        <Header t={t} />
        <Hook t={t} />
        {QS.map((q, i) => <QuestionCard key={i} t={t} q={q} i={i} />)}
        <Outro t={t} />
      </AbsoluteFill>
      {/* film finish */}
      <AbsoluteFill style={{background: 'radial-gradient(110% 80% at 50% 50%, transparent 55%, rgba(0,0,0,.55) 85%, rgba(0,0,0,.85) 100%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{boxShadow: `inset 0 0 ${120 * tension}px rgba(255,40,70,${0.35 * tension * (0.6 + 0.4 * Math.sin(t * 12))})`}} />
      <Img src={staticFile(`grain${f % 6}.png`)} style={{position: 'absolute', left: -((f * 37) % 120), top: -((f * 53) % 90), width: width + 120, height: height + 90, opacity: 0.07, mixBlendMode: 'overlay'}} />
      <AbsoluteFill style={{background: '#fff', opacity: Math.max(hit * 0.45, rev * 0.35, loop * 0.9)}} />
      <Audio src={staticFile('quiz_mix.wav')} />
    </AbsoluteFill>
  );
};

export const QUIZ_FRAMES = Math.round(Q.duration * Q.fps);
