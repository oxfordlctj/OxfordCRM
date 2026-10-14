import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import country from '../../public/country.json';
import {C, F, Kinetic, Wipe, clamp, inCubic, lerp, outExpo, prog, shake, track, useTime} from '../lib';
import {Billboard, Cam, Ground, MapPlane} from '../MapPlane';

const L = country.labels as unknown as Record<string, [number, number]>;
const [DX, DY] = L.dushanbe;

const KEYS = [
  {t: 4.3, cx: 2700, cy: 1560, zoom: 0.36, tilt: 10, rz: -10},
  {t: 6.6, cx: 2380, cy: 1470, zoom: 0.5, tilt: 30, rz: -5},
  {t: 9.4, cx: 1750, cy: 1450, zoom: 0.74, tilt: 46, rz: 2},
  {t: 12.0, cx: 1250, cy: 1490, zoom: 1.25, tilt: 54, rz: 7},
  {t: 13.4, cx: DX + 10, cy: DY, zoom: 3.6, tilt: 60, rz: 11},
  {t: 14.4, cx: DX, cy: DY, zoom: 14, tilt: 64, rz: 14},
];

const PlaceLabel: React.FC<{name: string; sub?: string; t: number; at: number; out: number; big?: boolean; gold?: boolean}> = ({name, sub, t, at, out, big, gold}) => {
  const a = outExpo(prog(t, at, at + 0.8)) * (1 - prog(t, out, out + 0.5));
  if (a <= 0) return null;
  const col = gold ? C.gold : C.white;
  return (
    <div style={{position: 'absolute', left: 0, bottom: 0, transform: `translate(-50%, 0)`, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: a}}>
      <div style={{transform: `translateY(${(1 - a) * 20}px)`, textAlign: 'center', whiteSpace: 'nowrap', marginBottom: 8}}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: big ? 30 : 22, letterSpacing: '0.18em', color: col, textShadow: '0 2px 12px rgba(0,0,0,.8)'}}>{name}</div>
        {sub && <div style={{fontFamily: F.mono, fontSize: 15, letterSpacing: '0.12em', color: C.dim, marginTop: 4, textShadow: '0 2px 10px rgba(0,0,0,.9)'}}>{sub}</div>}
      </div>
      <div style={{width: 2, height: lerp(0, big ? 120 : 70, a), background: `linear-gradient(to top, ${col}, transparent)`}} />
      <div style={{width: 10, height: 10, borderRadius: '50%', background: col, boxShadow: `0 0 18px ${col}`, transform: 'translateY(5px)'}} />
    </div>
  );
};

export const Country: React.FC = () => {
  const t = useTime();
  const k = track(KEYS, t);
  const sh = shake(t, 4, 0.5, 2);
  const cam: Cam = {cx: k.cx, cy: k.cy, zoom: k.zoom, tilt: k.tilt, rz: k.rz + sh.r * 20};
  const z = cam.zoom;

  const draw = inOut(prog(t, 5.5, 9.0));
  const dive = inCubic(prog(t, 13.0, 14.3));
  const cloudsA = 1 - outExpo(prog(t, 4.4, 7.0));

  return (
    <AbsoluteFill style={{background: `linear-gradient(to bottom, #1b2a44 0%, #2d3c55 30%, #0b1120 60%)`}}>
      <MapPlane src="country.jpg" w={country.w} h={country.h} cam={cam} anchorY={640} ground="#1b2230" sx={sh.x} sy={sh.y} style={{filter: dive > 0.05 ? `blur(${dive * 6}px) brightness(${1 + dive * 0.6})` : undefined}}>
        {/* border: glow + core, drawn on */}
        <svg width={country.w} height={country.h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transform: 'translateZ(1px)'}}>
          <path d={country.border} fill="rgba(255,205,120,0.06)" opacity={draw} />
          <path d={country.border} fill="none" stroke={C.gold} strokeOpacity={0.25} strokeWidth={14 / z} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} strokeLinejoin="round" />
          <path d={country.border} fill="none" stroke={C.goldHi} strokeWidth={2.6 / z} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} strokeLinejoin="round" />
        </svg>

        {/* Dushanbe beacon */}
        <Ground x={DX} y={DY} z={2}>
          {[0, 1, 2].map((i) => {
            const p = ((t - 10.4 + i * 0.6) % 1.8) / 1.8;
            const vis = clamp(prog(t, 10.4, 10.8));
            return <div key={i} style={{position: 'absolute', left: 0, top: 0, width: 160, height: 160, marginLeft: -80, marginTop: -80, borderRadius: '50%', border: `${3 / z}px solid ${C.gold}`, transform: `scale(${p * 1.2 / Math.max(z, 0.6)})`, opacity: (1 - p) * vis}} />;
          })}
        </Ground>

        <Billboard x={L.somoni[0]} y={L.somoni[1]} cam={cam}><PlaceLabel t={t} at={5.4} out={9.6} name="ПИК ИСМОИЛИ СОМОНӢ" sub="7495 м · ПАМИР" /></Billboard>
        <Billboard x={L.khorog[0]} y={L.khorog[1]} cam={cam}><PlaceLabel t={t} at={6.0} out={9.4} name="ХОРУҒ" /></Billboard>
        <Billboard x={L.khujand[0]} y={L.khujand[1]} cam={cam}><PlaceLabel t={t} at={7.6} out={11.6} name="ХУҶАНД" /></Billboard>
        <Billboard x={L.kulob[0]} y={L.kulob[1]} cam={cam}><PlaceLabel t={t} at={8.0} out={11.8} name="КӮЛОБ" /></Billboard>
        <Billboard x={L.bokhtar[0]} y={L.bokhtar[1]} cam={cam}><PlaceLabel t={t} at={8.4} out={12.0} name="БОХТАР" /></Billboard>
        <Billboard x={L.hissar_c[0] - 120} y={L.hissar_c[1] + 40} cam={cam}><PlaceLabel t={t} at={7.0} out={11.0} name="ГИССАРСКАЯ ДОЛИНА" /></Billboard>
        <Billboard x={DX} y={DY} cam={cam}><PlaceLabel t={t} at={11.3} out={13.6} name="ДУШАНБЕ" sub="38°33′ N · 68°46′ E" big gold /></Billboard>

        {/* cloud decks above the ground: real parallax as the camera moves */}
        <div style={{position: 'absolute', left: 1500, top: 600, width: 2600, height: 2600, transform: `translateZ(${420}px) translate(${t * 40}px, ${t * 10}px)`, opacity: 0.9 * cloudsA + 0.18}}>
          <Img src={staticFile('clouds0.png')} style={{width: '100%', height: '100%'}} />
        </div>
        <div style={{position: 'absolute', left: 300, top: 900, width: 2400, height: 2400, transform: `translateZ(${260}px) translate(${t * 25}px, 0)`, opacity: 0.7 * cloudsA + 0.12}}>
          <Img src={staticFile('clouds1.png')} style={{width: '100%', height: '100%'}} />
        </div>
      </MapPlane>

      {/* atmosphere: haze toward the horizon */}
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(40,60,90,.75) 0%, rgba(30,45,70,.35) 22%, transparent 45%)'}} />

      {/* title */}
      <AbsoluteFill style={{transform: `translateX(${-(t - 8.4) * 14}px)`}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150}}>
          <Kinetic text="ТОҶИКИСТОН" at={8.4} out={11.1} t={t} mode="track" align="center" style={{fontFamily: F.display, fontWeight: 700, fontSize: 210, letterSpacing: '0.16em', color: 'rgba(255,255,255,.92)', textShadow: '0 10px 60px rgba(0,0,0,.6)'}} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 452, display: 'flex', justifyContent: 'center'}}>
          <Wipe at={9.2} out={11.0} t={t}>
            <div style={{fontFamily: F.body, fontWeight: 500, fontSize: 28, letterSpacing: '0.42em', color: C.ivory, textShadow: '0 2px 20px rgba(0,0,0,.8)'}}>ОТ ПАМИРА ДО ГИССАРА</div>
          </Wipe>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{background: '#fff', opacity: clamp((dive - 0.6) * 1.6) * 0.9}} />
    </AbsoluteFill>
  );
};

function inOut(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
