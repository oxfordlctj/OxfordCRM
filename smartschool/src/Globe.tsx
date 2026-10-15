import React, {useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender, staticFile, useVideoConfig} from 'remotion';

/**
 * Canvas globe: per-pixel orthographic projection of baked equirectangular textures.
 * Day side is sun-lit terrain with ocean glint, the night side shows city lights,
 * clouds ride on top, and the limb gets an atmospheric scatter.
 */
type Tex = {w: number; h: number; day: Uint8ClampedArray; night: Uint8ClampedArray; cloud: Uint8ClampedArray};
let texPromise: Promise<Tex> | null = null;

const loadImg = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
const pixels = (img: HTMLImageElement) => {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext('2d')!;
  g.drawImage(img, 0, 0);
  return g.getImageData(0, 0, c.width, c.height).data;
};
const loadTex = () =>
  (texPromise ??= Promise.all(['earth_day.jpg', 'earth_lights.jpg', 'earth_clouds.jpg'].map((f) => loadImg(staticFile(f))))
    .then(([d, n, c]) => ({w: d.width, h: d.height, day: pixels(d), night: pixels(n), cloud: pixels(c)})));

export type LatLon = [number, number];
export type Arc = {from: LatLon; to: LatLon; p: number; alpha: number; label?: string};
export type GlobeView = {
  lat: number;
  lon: number;
  R: number;
  cx: number;
  cy: number;
  sun: [number, number, number]; // world-space direction
  cloudSpin: number;
  arcs?: Arc[];
  exposure?: number;
};

const D = Math.PI / 180;
export const toVec = ([la, lo]: LatLon): [number, number, number] => [Math.cos(la * D) * Math.sin(lo * D), Math.sin(la * D), Math.cos(la * D) * Math.cos(lo * D)];

/** world vector -> screen, plus whether it is in front of the globe or lifted past the limb */
export const project = (v: number[], view: GlobeView) => {
  const cl = Math.cos(view.lon * D), sl = Math.sin(view.lon * D), cp = Math.cos(view.lat * D), sp = Math.sin(view.lat * D);
  const x = v[0] * cl - v[2] * sl;
  const z0 = v[0] * sl + v[2] * cl;
  const y = v[1] * cp - z0 * sp;
  const z = v[1] * sp + z0 * cp;
  return {x: view.cx + x * view.R, y: view.cy - y * view.R, front: z > 0 || x * x + y * y > 1};
};

/** the direction 'up the screen' and 'toward the camera' in world space, for staging the sun */
export const viewBasis = (lat: number, lon: number) => {
  const cl = Math.cos(lon * D), sl = Math.sin(lon * D), cp = Math.cos(lat * D), sp = Math.sin(lat * D);
  const toWorld = (x: number, y: number, z: number): [number, number, number] => {
    const y1 = y * cp + z * sp, z1 = -y * sp + z * cp;
    return [x * cl + z1 * sl, y1, -x * sl + z1 * cl];
  };
  return {up: toWorld(0, 1, 0), right: toWorld(1, 0, 0), toCam: toWorld(0, 0, 1)};
};

const norm = (v: number[]): [number, number, number] => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
export const sunFrom = (up: number, right: number, toCam: number, b: ReturnType<typeof viewBasis>) =>
  norm([0, 1, 2].map((i) => b.up[i] * up + b.right[i] * right + b.toCam[i] * toCam));

export const Globe: React.FC<{view: GlobeView; style?: React.CSSProperties}> = ({view, style}) => {
  const {width, height} = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const [tex, setTex] = useState<Tex | null>(null);
  const [handle] = useState(() => delayRender('earth textures'));
  useLayoutEffect(() => {
    loadTex().then((t) => {
      setTex(t);
      continueRender(handle);
    });
  }, [handle]);

  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !tex) return;
    const g = cv.getContext('2d')!;
    const img = g.createImageData(width, height);
    const out = img.data;
    const {R, cx, cy} = view;
    const cl = Math.cos(view.lon * D), sl = Math.sin(view.lon * D), cp = Math.cos(view.lat * D), sp = Math.sin(view.lat * D);
    const [sx, sy, sz] = view.sun;
    const c = [cp * sl, sp, cp * cl];
    const h = norm([sx + c[0], sy + c[1], sz + c[2]]);
    const tw = tex.w, th = tex.h;
    const exposure = view.exposure ?? 1;
    const spin = view.cloudSpin;
    const x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(width - 1, Math.ceil(cx + R));
    const y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(height - 1, Math.ceil(cy + R));
    const smooth = R > 1400;
    const sample = (arr: Uint8ClampedArray, u: number, v: number, k: number) => {
      if (!smooth) return arr[((v | 0) * tw + ((u | 0) % tw)) * 4 + k];
      const ui = Math.floor(u), vi = Math.min(th - 2, Math.floor(v));
      const fu = u - ui, fv = v - vi;
      const a = (vi * tw + (ui % tw)) * 4 + k, b = (vi * tw + ((ui + 1) % tw)) * 4 + k;
      const a2 = a + tw * 4, b2 = b + tw * 4;
      return (arr[a] * (1 - fu) + arr[b] * fu) * (1 - fv) + (arr[a2] * (1 - fu) + arr[b2] * fu) * fv;
    };
    for (let py = y0; py <= y1; py++) {
      const y = (cy - py) / R;
      for (let px = x0; px <= x1; px++) {
        const x = (px - cx) / R;
        const r2 = x * x + y * y;
        if (r2 >= 1) continue;
        const z = Math.sqrt(1 - r2);
        const yy = y * cp + z * sp, zz = -y * sp + z * cp;
        const wx = x * cl + zz * sl, wy = yy, wz = -x * sl + zz * cl;
        const lat = Math.asin(wy), lon = Math.atan2(wx, wz);
        const u = (lon / (2 * Math.PI) + 0.5) * tw;
        const v = Math.min(th - 1, (0.5 - lat / Math.PI) * th);
        let uc = u + spin * tw;
        uc = ((uc % tw) + tw) % tw;
        const ndl = wx * sx + wy * sy + wz * sz;
        const lit = Math.max(0, Math.min(1.25, ndl * 1.3 + 0.03));
        let r = sample(tex.day, u, v, 0), gg = sample(tex.day, u, v, 1), b = sample(tex.day, u, v, 2);
        // polar caps: the source tiles stop at 85°, so blend to ice before the seam shows
        const pole = Math.max(0, Math.min(1, (Math.abs(lat) - 1.36) / 0.14));
        r = r * (1 - pole) + 222 * pole; gg = gg * (1 - pole) + 230 * pole; b = b * (1 - pole) + 240 * pole;
        const ocean = b > r + 18 && pole < 0.5 ? 1 : 0;
        r *= lit; gg *= lit; b *= lit;
        // sun glint on water
        if (ocean && ndl > 0) {
          const nh = wx * h[0] + wy * h[1] + wz * h[2];
          const s = Math.pow(Math.max(0, nh), 70) * 260;
          r += s; gg += s * 0.95; b += s * 0.85;
        }
        // warm terminator
        const term = Math.exp(-(((ndl - 0.02) / 0.05) ** 2)) * Math.min(1, (r + gg + b) / 120);
        r += 26 * term; gg += 9 * term; b += 2 * term;
        // clouds
        const cl_ = sample(tex.cloud, uc, v, 0) / 255;
        const cLit = 240 * Math.max(0.025, Math.min(1.1, ndl * 1.2 + 0.05));
        r = r * (1 - cl_ * 0.9) + cLit * cl_ * 0.9;
        gg = gg * (1 - cl_ * 0.9) + cLit * cl_ * 0.92;
        b = b * (1 - cl_ * 0.9) + cLit * cl_ * 0.96;
        // city lights on the night side
        const night = Math.max(0, Math.min(1, (0.1 - ndl) / 0.25));
        if (night > 0) {
          const L = (sample(tex.night, u, v, 0) / 255) * night * (1 - cl_ * 0.75);
          r += 255 * L * 1.25; gg += 182 * L * 1.25; b += 96 * L * 1.25;
        }
        // atmosphere scatter at the limb
        const rim = Math.pow(1 - z, 2.6);
        const atm = rim * (0.12 + 0.88 * Math.max(0, Math.min(1, ndl + 0.35)));
        r += 60 * atm; gg += 140 * atm; b += 255 * atm;
        const o = (py * width + px) * 4;
        // soft edge
        const edge = Math.min(1, (1 - Math.sqrt(r2)) * R * 0.8);
        out[o] = r * exposure; out[o + 1] = gg * exposure; out[o + 2] = b * exposure; out[o + 3] = 255 * edge;
      }
    }
    g.clearRect(0, 0, width, height);
    g.putImageData(img, 0, 0);

    // routes: great circles lifted off the surface, drawn with a hot head
    for (const arc of view.arcs ?? []) {
      if (arc.p <= 0 || arc.alpha <= 0) continue;
      const a = toVec(arc.from), b = toVec(arc.to);
      const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
      const om = Math.acos(dot);
      const N = 90;
      const pts: {x: number; y: number; front: boolean}[] = [];
      for (let i = 0; i <= N * arc.p; i++) {
        const t = i / N;
        const s0 = Math.sin((1 - t) * om) / Math.sin(om), s1 = Math.sin(t * om) / Math.sin(om);
        const lift = 1 + 0.22 * om * Math.sin(Math.PI * t);
        pts.push(project([(a[0] * s0 + b[0] * s1) * lift, (a[1] * s0 + b[1] * s1) * lift, (a[2] * s0 + b[2] * s1) * lift], view));
      }
      g.save();
      g.lineCap = 'round';
      for (const [w, col, blur] of [[10, 'rgba(63,224,255,0.18)', 30], [3.2, 'rgba(160,240,255,0.95)', 12]] as const) {
        g.lineWidth = w;
        g.strokeStyle = col;
        g.shadowColor = '#3fe0ff';
        g.shadowBlur = blur;
        g.globalAlpha = arc.alpha;
        g.beginPath();
        let pen = false;
        for (const p of pts) {
          if (!p.front) { pen = false; continue; }
          if (!pen) g.moveTo(p.x, p.y); else g.lineTo(p.x, p.y);
          pen = true;
        }
        g.stroke();
      }
      const head = pts[pts.length - 1];
      if (head && head.front) {
        g.globalAlpha = arc.alpha;
        g.fillStyle = '#ffffff';
        g.shadowBlur = 28;
        g.beginPath();
        g.arc(head.x, head.y, arc.p >= 1 ? 7 : 5, 0, Math.PI * 2);
        g.fill();
        if (arc.p >= 1 && arc.label) {
          g.shadowBlur = 10;
          g.font = '800 30px Montserrat';
          g.textAlign = 'center';
          g.fillText(arc.label, head.x, head.y - 22);
        }
      }
      g.restore();
    }
  }, [tex, view, width, height]);

  return <canvas ref={ref} width={width} height={height} style={{position: 'absolute', inset: 0, ...style}} />;
};
