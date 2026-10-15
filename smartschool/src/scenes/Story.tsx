import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import city from '../../public/city.json';
import {Globe, sunFrom, viewBasis} from '../Globe';
import {C, F, clamp, goldFill, inCubic, lerp, outBack, outExpo, prog, rand} from '../lib';
import {MapPlane} from '../MapPlane';
import {Stars} from './Space';

const useT = () => useCurrentFrame() / 30;

// ───────────────────────── word tunnel ─────────────────────────
const WORDS = ['HELLO', 'FUTURE', 'SPEAK', 'DREAM', 'WORLD', 'CONFIDENCE', 'LONDON', 'IELTS', 'GRAMMAR', 'TRAVEL', 'CAREER', 'UNIVERSITY', 'FLUENT', 'LISTEN', 'SUCCESS', 'OPPORTUNITY', 'CONNECT', 'GLOBAL', 'NEW YORK', 'I CAN', 'YES!', 'THINK', 'BELIEVE', 'VOCABULARY', 'FRIENDS', 'GOALS'];
const LEN = 9000;
const speedAt = (t: number) => 700 + 4200 * clamp(Math.min((t - 14.0) / 1.2, (15.9 - t) / 0.4)) + (t > 15.5 ? 500 : 0);
const travelled = (t: number) => {
  let d = 0;
  for (let x = 13.8; x < t; x += 1 / 30) d += speedAt(x) / 30;
  return d;
};

export const Tunnel: React.FC<{dim?: number}> = ({dim: dimIn}) => {
  const t = useT();
  // once the reasons start, the tunnel steps back so the hero objects read cleanly
  const dim = dimIn ?? 0.8 * clamp((t - 15.3) / 0.4);
  const {width, height} = useVideoConfig();
  const D = travelled(t);
  const boost = clamp(Math.min((t - 14.0) / 1.2, (15.9 - t) / 0.4));
  return (
    <AbsoluteFill style={{background: `radial-gradient(70% 45% at 50% 45%, #0c2462 0%, #050b1f 55%, ${C.ink} 90%)`, perspective: 900, perspectiveOrigin: '50% 45%', overflow: 'hidden'}}>
      {/* warp streaks */}
      {Array.from({length: 70}).map((_, i) => {
        const a = rand(i) * Math.PI * 2;
        const z = ((rand(i + 9) * LEN + D * 1.4) % LEN) - LEN;
        const r = 900 + rand(i + 4) * 900;
        return <div key={'s' + i} style={{position: 'absolute', left: width / 2, top: height * 0.45, width: 4, height: 4 + 600 * boost, background: 'linear-gradient(transparent, #8fe9ff)', transform: `translate3d(${Math.cos(a) * r}px, ${Math.sin(a) * r}px, ${z}px) rotateZ(${a + Math.PI / 2}rad) rotateX(90deg)`, opacity: 0.5 * boost}} />;
      })}
      {Array.from({length: 54}).map((_, i) => {
        const w = WORDS[i % WORDS.length];
        const a = (i * 2.399) % (Math.PI * 2);
        const r = 760 + (i % 3) * 260;
        const z = ((i / 54) * LEN + D) % LEN - LEN;
        const fog = clamp((z + LEN * 0.72) / (LEN * 0.4));
        const near = clamp((z + 900) / 900);
        const hot = i % 7 === 0;
        return (
          <div key={i} style={{position: 'absolute', left: width / 2, top: height * 0.45, transform: `translate3d(${Math.cos(a) * r}px, ${Math.sin(a) * r * 1.35}px, ${z}px) translate(-50%, -50%)`, fontFamily: hot ? F.display : F.body, fontWeight: hot ? 700 : 800, fontSize: hot ? 150 : 96, whiteSpace: 'nowrap', opacity: fog * (1 - near * 0.7) * (1 - dim * 0.5), filter: `blur(${(1 - fog) * 6 + near * 8}px)`, ...(hot ? goldFill(t + i, 0.4) : {color: 'rgba(210,230,255,.85)'})}}>
            {w}
          </div>
        );
      })}
      <AbsoluteFill style={{background: 'radial-gradient(40% 25% at 50% 45%, rgba(63,224,255,.25), transparent 70%)', opacity: 0.5 + boost * 0.5}} />
      <AbsoluteFill style={{background: `rgba(3,5,12,${dim * 0.55})`}} />
    </AbsoluteFill>
  );
};

// ───────────────────────── reason objects ─────────────────────────
const Glass: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{background: 'linear-gradient(135deg, rgba(255,255,255,.22), rgba(255,255,255,.06))', border: '1.5px solid rgba(255,255,255,.4)', borderRadius: 34, boxShadow: '0 30px 80px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.5), 0 0 40px rgba(63,224,255,.18)', ...style}}>{children}</div>
);

export const Numeral: React.FC<{n: string; t: number; at: number}> = ({n, t, at}) => {
  const e = outExpo(prog(t, at, at + 0.5));
  const depth = 22;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', perspective: 1200}}>
      <div style={{position: 'relative', transformStyle: 'preserve-3d', transform: `translateZ(${lerp(-900, 0, e)}px) rotateY(${lerp(70, -14, e) + (t - at) * 6}deg) rotateX(8deg)`, fontFamily: F.display, fontWeight: 700, fontSize: 250, lineHeight: 1, opacity: e}}>
        {Array.from({length: depth}).map((_, i) => (
          <div key={i} style={{position: 'absolute', left: 0, top: 0, transform: `translateZ(${-i * 1.1}px)`, color: `rgb(${lerp(30, 6, i / depth)},${lerp(70, 18, i / depth)},${lerp(170, 60, i / depth)})`}}>{n}</div>
        ))}
        <div style={{position: 'relative', transform: 'translateZ(1px)', ...goldFill(t, 0.5), filter: 'drop-shadow(0 0 26px rgba(63,224,255,.5))'}}>{n}</div>
      </div>
    </div>
  );
};

const ChatBubbles: React.FC<{t: number}> = ({t}) => {
  const msgs = [
    {at: 15.75, side: 'L', text: 'Hi! How are you?'},
    {at: 16.35, side: 'R', text: "I'm great, thanks!"},
    {at: 16.95, side: 'L', text: "Let's talk in English!"},
    {at: 17.55, side: 'R', text: "Yes, let's go!"},
  ];
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 520, display: 'flex', flexDirection: 'column', gap: 26, perspective: 1000}}>
      {msgs.map((m, i) => {
        const e = outBack(clamp((t - m.at) / 0.45));
        if (t < m.at) return <div key={i} style={{height: 112}} />;
        const right = m.side === 'R';
        return (
          <div key={i} style={{display: 'flex', justifyContent: right ? 'flex-end' : 'flex-start', transform: `rotateY(${(right ? -1 : 1) * (14 - (t - m.at) * 4)}deg) translateZ(${(1 - e) * -300}px) scale(${e})`, transformOrigin: right ? '100% 50%' : '0 50%'}}>
            <Glass style={{padding: '26px 40px', borderRadius: right ? '40px 40px 8px 40px' : '40px 40px 40px 8px', background: right ? 'linear-gradient(135deg, #3fe0ff, #2f7bff)' : undefined}}>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 52, color: '#fff', whiteSpace: 'nowrap'}}>{m.text}</div>
            </Glass>
          </div>
        );
      })}
    </div>
  );
};

const Ladder: React.FC<{t: number}> = ({t}) => {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const swing = Math.sin((t - 18.5) * 0.9) * 10;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', perspective: 1300}}>
      <div style={{transform: `rotateY(${-18 + swing}deg) rotateX(10deg)`, transformStyle: 'preserve-3d'}}>
        <Glass style={{padding: '40px 48px 30px', display: 'flex', gap: 26, alignItems: 'flex-end', height: 600}}>
          {levels.map((l, i) => {
            const e = outExpo(prog(t, 18.75 + i * 0.22, 19.4 + i * 0.22));
            const h = 90 + i * 72;
            return (
              <div key={l} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
                <div style={{width: 92, height: h * e, borderRadius: 18, background: 'linear-gradient(180deg, #a9f1ff, #3fe0ff 30%, #2f7bff)', boxShadow: `0 0 ${30 * e}px rgba(63,224,255,.65)`}} />
                <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 44, color: C.white, opacity: 0.4 + e * 0.6}}>{l}</div>
              </div>
            );
          })}
        </Glass>
      </div>
    </div>
  );
};

const Group: React.FC<{t: number}> = ({t}) => {
  const n = 8;
  const lt = t - 21.5;
  const spot = Math.floor(lt * 3.2) % n;
  const person = (
    <svg width="58" height="58" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="8" r="4.2" /><path d="M3.5 21c.8-4.6 4.2-7 8.5-7s7.7 2.4 8.5 7z" /></svg>
  );
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 780, height: 0, perspective: 1100}}>
      <div style={{position: 'absolute', left: '50%', top: 0, transformStyle: 'preserve-3d', transform: 'rotateX(64deg)'}}>
        <div style={{position: 'absolute', left: -380, top: -380, width: 760, height: 760, borderRadius: '50%', border: '3px solid rgba(63,224,255,.55)', boxShadow: '0 0 60px rgba(63,224,255,.35), inset 0 0 60px rgba(63,224,255,.25)'}} />
        {Array.from({length: n}).map((_, i) => {
          const a = (i / n) * Math.PI * 2 + lt * 0.6;
          const e = outBack(clamp((lt - 0.15 - i * 0.07) / 0.4));
          const on = i === spot;
          return (
            <div key={i} style={{position: 'absolute', left: Math.cos(a) * 380, top: Math.sin(a) * 380, transformStyle: 'preserve-3d', transform: `rotateX(-64deg) translate(-50%, -100%) scale(${e * (on ? 1.25 : 1)})`}}>
              <div style={{width: 112, height: 112, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? 'linear-gradient(135deg, #3fe0ff, #2f7bff)' : 'rgba(255,255,255,.14)', border: '2px solid rgba(255,255,255,.55)', boxShadow: on ? '0 0 50px #3fe0ff' : '0 10px 30px rgba(0,0,0,.4)'}}>{person}</div>
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 0, top: 0, transform: 'rotateX(-64deg) translate(-50%, -80%)', fontFamily: F.display, fontWeight: 700, fontSize: 70, color: C.white, textShadow: '0 0 30px #3fe0ff'}}>YOU</div>
      </div>
    </div>
  );
};

const Ielts: React.FC<{t: number}> = ({t}) => {
  const lt = t - 24.5;
  const e = outExpo(clamp(lt / 0.7));
  const dest = ['UK', 'USA', 'CANADA', 'AUSTRALIA', 'EUROPE'];
  const depth = 18;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 560, height: 0, perspective: 1200}}>
      <div style={{position: 'absolute', left: '50%', top: 0, transformStyle: 'preserve-3d', transform: `translate(-50%, -50%) rotateY(${lerp(50, -10, e) + Math.sin(lt * 0.8) * 8}deg) rotateX(6deg) scale(${lerp(0.4, 1, e)})`}}>
        <div style={{position: 'relative', fontFamily: F.display, fontWeight: 700, fontSize: 280, lineHeight: 1, transformStyle: 'preserve-3d'}}>
          {Array.from({length: depth}).map((_, i) => (
            <div key={i} style={{position: 'absolute', left: 0, top: 0, transform: `translateZ(${-i * 1.3}px)`, color: `rgb(${lerp(120, 30, i / depth)},${lerp(140, 40, i / depth)},${lerp(170, 70, i / depth)})`}}>IELTS</div>
          ))}
          <div style={{position: 'relative', backgroundImage: `linear-gradient(${100 + lt * 30}deg, #dfe8f5 0%, #ffffff 30%, #8ea2bd 48%, #ffffff 62%, #b9c6d8 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 0 30px rgba(140,200,255,.45))'}}>IELTS</div>
        </div>
      </div>
      {/* destinations orbiting the badge */}
      {dest.map((d, i) => {
        const a = (i / dest.length) * Math.PI * 2 + lt * 0.9;
        const z = Math.sin(a);
        const op = outExpo(clamp((lt - 0.3 - i * 0.1) / 0.5));
        return (
          <div key={d} style={{position: 'absolute', left: `calc(50% + ${Math.cos(a) * 430}px)`, top: z * 150 + 20, transform: `translate(-50%, -50%) scale(${0.75 + (z + 1) * 0.2})`, zIndex: z > 0 ? 2 : 0, opacity: op * (0.45 + (z + 1) * 0.28)}}>
            <Glass style={{padding: '14px 30px', borderRadius: 999}}>
              <div style={{fontFamily: F.mono, fontSize: 34, color: C.white, letterSpacing: '0.12em', whiteSpace: 'nowrap'}}>{d}</div>
            </Glass>
          </div>
        );
      })}
    </div>
  );
};

export const Reasons: React.FC = () => {
  const t = useT();
  const seg = t < 18.5 ? 0 : t < 21.5 ? 1 : t < 24.5 ? 2 : 3;
  const at = [15.5, 18.5, 21.5, 24.5][seg];
  const out = [18.5, 21.5, 24.5, 29.0][seg];
  const x = inCubic(prog(t, out - 0.15, out));
  return (
    <AbsoluteFill style={{opacity: 1 - x, transform: `scale(${1 + x * 0.15})`}}>
      <Numeral n={`0${seg + 1}`} t={t} at={at} />
      {seg === 0 && <ChatBubbles t={t} />}
      {seg === 1 && <Ladder t={t} />}
      {seg === 2 && <Group t={t} />}
      {seg === 3 && <Ielts t={t} />}
    </AbsoluteFill>
  );
};

// ───────────────────────── counter ─────────────────────────
export const Counter: React.FC = () => {
  const t = useT();
  if (t < 4.5 || t > 8.5) return null;
  const e = outExpo(prog(t, 4.6, 6.6));
  const n = Math.round(1_500_000_000 * e);
  const s = n.toLocaleString('en-US').replace(/,/g, ' ');
  const out = inCubic(prog(t, 8.25, 8.5));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, opacity: Math.min(1, (t - 4.5) * 5) * (1 - out), transform: `scale(${1 + (t - 4.6) * 0.02 + out * 0.2})`}}>
      <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 132, lineHeight: 1, fontVariantNumeric: 'tabular-nums', ...goldFill(t, 0.5), filter: 'drop-shadow(0 0 30px rgba(63,224,255,.45))'}}>{s}+</div>
      <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 44, color: C.white, letterSpacing: '0.08em', textAlign: 'center', textShadow: '0 4px 24px rgba(0,0,0,.9)', opacity: outExpo(prog(t, 5.6, 6.2))}}>НАФАР БО АНГЛИСӢ<br />ГАП МЕЗАНАНД</div>
    </div>
  );
};

// ───────────────────────── dive into Dushanbe ─────────────────────────
export const CityDive: React.FC = () => {
  const t = useT();
  const p = prog(t, 8.95, 9.55);
  const cx = (city.pins as unknown as Record<string, number[]>).sadbarg;
  const cam = {cx: cx[0], cy: cx[1], zoom: lerp(0.55, 1.6, inCubic(p)), tilt: lerp(0, 38, p), rz: lerp(-20, 10, p)};
  return (
    <AbsoluteFill style={{opacity: clamp((t - 8.95) / 0.15)}}>
      <MapPlane src="city.jpg" w={city.w} h={city.h} cam={cam} anchorY={760} ground="#070b14">
        <Img src={staticFile('city_glow.png')} style={{position: 'absolute', left: 0, top: 0, width: city.w, height: city.h, opacity: 0.7}} />
        <Img src={staticFile('city_lights.png')} style={{position: 'absolute', left: 0, top: 0, width: city.w, height: city.h}} />
      </MapPlane>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, rgba(63,224,255,.25), transparent 40%)'}} />
    </AbsoluteFill>
  );
};

// ───────────────────────── boarding pass ─────────────────────────
const Barcode: React.FC = () => (
  <div style={{display: 'flex', gap: 3, height: 210, alignItems: 'stretch'}}>
    {Array.from({length: 34}).map((_, i) => <div key={i} style={{width: 2 + Math.floor(rand(i * 3.7) * 6), background: '#0b1224'}} />)}
  </div>
);

export const Ticket: React.FC = () => {
  const t = useT();
  const {width} = useVideoConfig();
  const lt = t - 29.0;
  const e = outExpo(clamp(lt / 0.8));
  const b = viewBasis(20, -20 + lt * 3);
  const view = {lat: 20, lon: -20 + lt * 3, R: 980, cx: width / 2, cy: 1720, sun: sunFrom(0.5, 0.3, 0.8, b), cloudSpin: t * 0.003, exposure: 0.95};
  const holo = (lt * 80) % 360;
  const Field: React.FC<{k: string; v: string; big?: boolean}> = ({k, v, big}) => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{fontFamily: F.mono, fontSize: 18, color: '#6b7895', letterSpacing: '0.18em'}}>{k}</div>
      <div style={{fontFamily: F.display, fontWeight: 700, fontSize: big ? 96 : 40, color: '#0b1224', lineHeight: 1}}>{v}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(100% 60% at 50% 100%, #0c1d44 0%, #03050c 70%)'}} />
      <Stars t={t} n={140} />
      <Globe view={view} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center', perspective: 1400}}>
        <div style={{position: 'relative', transformStyle: 'preserve-3d', transform: `translateY(${(1 - e) * 500 + Math.sin(lt * 1.4) * 14}px) rotateY(${lerp(-60, -12, e) + Math.sin(lt * 0.9) * 10}deg) rotateX(${lerp(40, 12, e)}deg) rotateZ(${lerp(-12, -4, e)}deg)`}}>
          <div style={{width: 940, height: 430, borderRadius: 30, display: 'flex', overflow: 'hidden', background: 'linear-gradient(160deg, #ffffff 0%, #eef2f8 60%, #dfe6f0 100%)', boxShadow: '0 60px 120px rgba(0,0,0,.6), 0 0 80px rgba(63,224,255,.25)'}}>
            <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
              <div style={{height: 78, background: 'linear-gradient(90deg, #2f7bff, #3fe0ff)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px'}}>
                <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, color: '#fff', letterSpacing: '0.06em'}}>SmartSchool</div>
                <div style={{fontFamily: F.mono, fontSize: 20, color: '#fff', letterSpacing: '0.3em'}}>BOARDING PASS</div>
              </div>
              <div style={{flex: 1, padding: '26px 34px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <Field k="FROM · DUSHANBE" v="DYU" big />
                  <svg width="90" height="90" viewBox="0 0 24 24" fill="#2f7bff"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" transform="rotate(90 12 12)" /></svg>
                  <Field k="TO · ANYWHERE" v="WORLD" big />
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <Field k="PASSENGER" v="YOU" />
                  <Field k="CLASS" v="FUTURE" />
                  <Field k="GATE" v="ENGLISH" />
                  <Field k="BOARDING" v="TODAY" />
                </div>
              </div>
            </div>
            {/* perforated stub */}
            <div style={{width: 210, borderLeft: '4px dashed #c3ccda', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#f4f7fb'}}>
              <Barcode />
              <div style={{fontFamily: F.mono, fontSize: 18, color: '#0b1224', letterSpacing: '0.2em'}}>SEAT 1A</div>
            </div>
          </div>
          {/* holographic foil */}
          <div style={{position: 'absolute', left: 620, top: 300, width: 96, height: 96, borderRadius: '50%', background: `conic-gradient(from ${holo}deg, #ff6ad5, #c774e8, #ad8cff, #8795e8, #94d0ff, #7cffcb, #ffe57c, #ff6ad5)`, opacity: 0.85, boxShadow: '0 0 20px rgba(255,255,255,.6)', mixBlendMode: 'multiply'}} />
          {/* moving specular */}
          <div style={{position: 'absolute', inset: 0, borderRadius: 30, background: `linear-gradient(${110}deg, transparent ${((lt * 40) % 160) - 30}%, rgba(255,255,255,.65) ${((lt * 40) % 160) - 20}%, transparent ${((lt * 40) % 160) - 10}%)`, mixBlendMode: 'overlay'}} />
          <Img src={staticFile('grain2.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 30, opacity: 0.08, mixBlendMode: 'multiply'}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
