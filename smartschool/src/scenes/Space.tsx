import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Arc, Globe, GlobeView, LatLon, sunFrom, viewBasis} from '../Globe';
import {clamp, inCubic, lerp, outExpo, prog, rand, track} from '../lib';

export const DYU: LatLon = [38.56, 68.78];
const ROUTES: {to: LatLon; label: string; at: number}[] = [
  {to: [51.51, -0.13], label: 'LONDON', at: 2.1},
  {to: [25.2, 55.27], label: 'DUBAI', at: 2.35},
  {to: [37.57, 126.98], label: 'SEOUL', at: 2.6},
  {to: [40.71, -74.0], label: 'NEW YORK', at: 2.85},
  {to: [52.52, 13.4], label: 'BERLIN', at: 3.1},
  {to: [1.35, 103.82], label: 'SINGAPORE', at: 3.35},
  {to: [43.65, -79.38], label: 'TORONTO', at: 3.6},
  {to: [-33.87, 151.21], label: 'SYDNEY', at: 3.85},
  {to: [41.01, 28.98], label: 'ISTANBUL', at: 4.1},
];

// camera: begins skimming the limb at sunrise, pulls back to the whole planet, then dives to Dushanbe
const KEYS = [
  {t: 0.0, lat: -12, lon: 58, R: 1650, cy: 2350, sunUp: 1.0, sunCam: -0.62},
  {t: 1.9, lat: 2, lon: 62, R: 1350, cy: 2050, sunUp: 0.9, sunCam: -0.45},
  {t: 4.4, lat: 30, lon: 66, R: 760, cy: 1020, sunUp: 0.2, sunCam: -0.15},
  {t: 7.9, lat: 36, lon: 60, R: 700, cy: 960, sunUp: 0.15, sunCam: -0.05},
  {t: 8.6, lat: 38, lon: 66, R: 900, cy: 960, sunUp: 0.15, sunCam: -0.02},
];

export const spaceView = (t: number, width: number): GlobeView => {
  const k = track(KEYS, Math.min(t, 8.6));
  // the dive: exponential zoom onto Dushanbe
  const dive = inCubic(prog(t, 8.55, 9.5));
  const lat = lerp(k.lat, DYU[0], outExpo(prog(t, 8.3, 9.0)));
  const lon = lerp(k.lon, DYU[1], outExpo(prog(t, 8.3, 9.0)));
  const R = k.R * Math.pow(22, dive);
  const b = viewBasis(lat, lon);
  // sun sits to the left (west) so Europe is in daylight while Dushanbe glows at dusk
  const sun = sunFrom(k.sunUp, -0.85, k.sunCam, b);
  const arcs: Arc[] = ROUTES.map((r) => ({from: DYU, to: r.to, label: r.label, p: outExpo(prog(t, r.at, r.at + 1.4)), alpha: 1 - prog(t, 8.4, 8.9)}));
  return {lat, lon, R, cx: width / 2, cy: k.cy, sun, cloudSpin: t * 0.004, arcs, exposure: 1 + dive * 0.4};
};

export const Stars: React.FC<{t: number; n?: number}> = ({t, n = 220}) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill>
      {Array.from({length: n}).map((_, i) => {
        const s = rand(i * 3.3) < 0.08 ? 2.6 : rand(i * 1.7) < 0.3 ? 1.6 : 1;
        const tw = 0.55 + 0.45 * Math.sin(t * (1 + rand(i) * 3) + i);
        return (
          <div key={i} style={{position: 'absolute', left: rand(i) * width - t * 6 * (s / 2), top: rand(i + 0.5) * height + t * 3, width: s, height: s, borderRadius: '50%', background: '#dfe9ff', opacity: (0.25 + 0.6 * rand(i * 9)) * tw, boxShadow: s > 2 ? '0 0 6px #bcd6ff' : undefined}} />
        );
      })}
    </AbsoluteFill>
  );
};

export const Space: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const t = f / fps;
  const view = spaceView(t, width);
  const halo = view.R * 1.12;
  const flare = clamp(1 - Math.abs(t - 0.9) / 1.4) * (1 - prog(t, 3.5, 5));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 100%, #0b1a3a 0%, #03050c 60%)'}}>
      <Stars t={t} />
      {/* atmospheric halo behind the disc */}
      <div style={{position: 'absolute', left: view.cx - halo, top: view.cy - halo, width: halo * 2, height: halo * 2, borderRadius: '50%', background: 'radial-gradient(circle, rgba(70,150,255,0) 86%, rgba(80,160,255,.38) 89.5%, rgba(60,130,255,.12) 93%, rgba(40,90,255,0) 100%)'}} />
      <Globe view={view} />
      {/* sunrise over the limb */}
      <div style={{position: 'absolute', left: width * 0.18 - 500, top: view.cy - view.R - 520, width: 1000, height: 1000, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.95) 0%, rgba(255,226,170,.6) 6%, rgba(255,170,90,.18) 22%, rgba(255,150,80,0) 50%)', opacity: flare, mixBlendMode: 'screen'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: view.cy - view.R - 6, height: 12, background: 'linear-gradient(90deg, transparent, rgba(160,220,255,.9) 20%, rgba(255,240,210,1) 30%, rgba(160,220,255,.6) 45%, transparent 80%)', filter: 'blur(4px)', opacity: flare, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};
