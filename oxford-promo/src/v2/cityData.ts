import * as THREE from "three";
import { random } from "remotion";

// Stylised Dushanbe. x = east, z = south, 1 unit ≈ 600 m. Not GPS-accurate.
export type Branch = { id: number; name: string; address: string; p: [number, number] };

export const BRANCHES: Branch[] = [
  { id: 1, name: "Sadbarg", address: "46 Ayni St", p: [2.6, -1.3] },
  { id: 2, name: "Guliston", address: "26 N. Karabaev St", p: [-1.9, 4.7] },
  { id: 3, name: "Mardon", address: "101 Borbad St", p: [-5.0, 1.1] },
  { id: 4, name: "Giprozem", address: "100 Somon St", p: [3.6, -5.5] },
  { id: 5, name: "82 mkr", address: "26 B. Gafurov St", p: [-3.9, 6.4] },
  { id: 6, name: "Selkhoz", address: "6 Karamov St", p: [0.3, -7.9] },
  { id: 7, name: "OVIR", address: "1A M. Kurbonov St", p: [-3.4, -4.2] },
];

export const NEW8 = { name: "DOMPECHAT", near: "ALFEMO", p: [0.25, 0] as [number, number] };

export const RIVER: [number, number][] = [[-2.0, -13], [-2.3, -7], [-1.6, -3], [-2.2, 1], [-1.8, 5], [-2.6, 12]];

export const ROADS: { name: string; pts: [number, number][]; major?: boolean }[] = [
  { name: "Rudaki Ave", major: true, pts: [[0.4, -12], [0.2, -6], [0.4, -2], [0.25, 0], [0.0, 4], [0.3, 11]] },
  { name: "Somoni Ave", major: true, pts: [[-9, -5.5], [-5, -4.2], [-2, -3.2], [0.3, -2.4]] },
  { name: "Ayni St", major: true, pts: [[0.3, -0.6], [3, -1.4], [6, -0.6], [9.5, 0.4]] },
  { name: "Borbad St", major: true, pts: [[-9.5, 1.8], [-6, 1.2], [-3, 0.6], [0.25, 0.1]] },
  { name: "Gafurov St", pts: [[-7, 8.5], [-4, 6.2], [-1.5, 3.4], [0.1, 1.6]] },
  { name: "", pts: [[0.3, 1.0], [3, 3.4], [6, 5], [9.5, 6.6]] },
  { name: "", pts: [[0.4, -3.6], [3, -6], [5.5, -9]] },
  { name: "", pts: [[-7.5, -9], [-4.5, -6.5], [-2.2, -5.5], [0.2, -5.8]] },
];

const distToPolyline = (pts: THREE.Vector3[], x: number, z: number) => {
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const ax = pts[i].x, az = pts[i].z, bx = pts[i + 1].x, bz = pts[i + 1].z;
    const dx = bx - ax, dz = bz - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    const ex = ax + t * dx - x, ez = az + t * dz - z;
    best = Math.min(best, ex * ex + ez * ez);
  }
  return Math.sqrt(best);
};

export const curve = (pts: [number, number][], y = 0.02, n = 100) =>
  new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, y, z)), false, "centripetal").getPoints(n);

export type Building = { x: number; z: number; w: number; d: number; h: number; dist: number; delay: number; tone: number };

let cache: Building[] | null = null;
export const buildings = (): Building[] => {
  if (cache) return cache;
  const roads = ROADS.map((r) => curve(r.pts, 0, 60));
  const river = curve(RIVER, 0, 60);
  const out: Building[] = [];
  const step = 0.3;
  for (let gx = -10.5; gx <= 10.5; gx += step) {
    for (let gz = -12.5; gz <= 12.5; gz += step) {
      const k = `${gx.toFixed(2)}:${gz.toFixed(2)}`;
      const x = gx + (random(`bx${k}`) - 0.5) * 0.08;
      const z = gz + (random(`bz${k}`) - 0.5) * 0.08;
      const edge = 1 + 0.12 * Math.sin(Math.atan2(z, x) * 5) + 0.08 * Math.sin(Math.atan2(z, x) * 11);
      const e = (x / 9.2) ** 2 + (z / 11.5) ** 2;
      if (e > edge) continue;
      if (e > 0.75 * edge && random(`be${k}`) > 0.55) continue;
      if (distToPolyline(river, x, z) < 0.55) continue;
      if (roads.some((r, i) => distToPolyline(r, x, z) < (ROADS[i].major ? 0.32 : 0.24))) continue;
      const dist = Math.hypot(x - NEW8.p[0], z - NEW8.p[1]);
      if (dist < 0.75) continue;
      if (BRANCHES.some((b) => Math.hypot(x - b.p[0], z - b.p[1]) < 0.42)) continue;
      if (random(`bs${k}`) < 0.12) continue;
      const core = Math.exp(-(dist * dist) / 14);
      const tower = random(`bt${k}`) > 0.965 ? 1.2 + random(`bh2${k}`) : 0;
      out.push({
        x,
        z,
        w: 0.14 + random(`bw${k}`) * 0.1,
        d: 0.14 + random(`bd${k}`) * 0.1,
        h: 0.08 + random(`bh${k}`) * 0.28 + core * (0.4 + random(`bc${k}`) * 1.1) + tower * (0.4 + core),
        dist,
        delay: dist * 0.09 + random(`bl${k}`) * 0.35,
        tone: random(`tn${k}`),
      });
    }
  }
  cache = out;
  return out;
};
