import { useThree } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

export const W = 1080;
export const H = 1920;

export type Cam = {
  pos: [number, number, number];
  target: [number, number, number];
  fov: number;
};

/** Applies a frame-computed camera. Must be a child of <ThreeCanvas>. */
export const CamRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(...cam.pos);
  camera.fov = cam.fov;
  camera.near = 0.05;
  camera.far = 400;
  camera.up.set(0, 1, 0);
  camera.lookAt(...cam.target);
  camera.updateProjectionMatrix();
  return null;
};

const projCam = new THREE.PerspectiveCamera(50, W / H, 0.05, 400);
const v = new THREE.Vector3();

/** World -> screen pixels for the same camera the canvas uses. */
export const project = (cam: Cam, p: [number, number, number]) => {
  projCam.position.set(...cam.pos);
  projCam.fov = cam.fov;
  projCam.up.set(0, 1, 0);
  projCam.lookAt(...cam.target);
  projCam.updateProjectionMatrix();
  projCam.updateMatrixWorld();
  v.set(...p).project(projCam);
  return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, visible: v.z < 1 };
};

type Key = { t: number; th: number; r: number; h: number; tx: number; tz: number; fov: number };

const smooth = (x: number) => x * x * (3 - 2 * x);

/** Orbit-style camera keyframes: angle (deg), radius, height and target. */
export const orbitCam = (keys: Key[], t: number): Cam => {
  let a = keys[0];
  let b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (t >= keys[i].t && t <= keys[i + 1].t) {
      a = keys[i];
      b = keys[i + 1];
      break;
    }
  }
  if (t < keys[0].t) b = a;
  if (t > keys[keys.length - 1].t) a = b;
  const p = a === b ? 0 : smooth(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))));
  const L = (k: keyof Key) => a[k] + (b[k] - a[k]) * p;
  const th = (L("th") * Math.PI) / 180;
  const tx = L("tx");
  const tz = L("tz");
  return {
    pos: [tx + L("r") * Math.sin(th), L("h"), tz + L("r") * Math.cos(th)],
    target: [tx, 0, tz],
    fov: L("fov"),
  };
};

let glowTex: THREE.Texture | null = null;
/** Soft radial sprite used for every glow in the film. */
export const getGlowTexture = () => {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.18, "rgba(255,255,255,0.55)");
  grd.addColorStop(0.45, "rgba(255,255,255,0.12)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
};

export const Glow: React.FC<{
  position: [number, number, number];
  size: number;
  color: string;
  opacity?: number;
}> = ({ position, size, color, opacity = 1 }) => {
  const tex = useMemo(getGlowTexture, []);
  if (opacity <= 0.001 || size <= 0.001) return null;
  return (
    <sprite position={position} scale={[size, size, size]}>
      <spriteMaterial map={tex} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
    </sprite>
  );
};

const beamVert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const beamFrag = `uniform vec3 color; uniform float opacity; varying vec2 vUv;
void main(){ float a = pow(1.0 - vUv.y, 1.6) * opacity; gl_FragColor = vec4(color * a, a); }`;

/** Vertical light pillar standing on the ground at (x, z). */
export const Beam: React.FC<{
  x: number;
  z: number;
  height: number;
  radius: number;
  color: string;
  opacity?: number;
  y?: number;
}> = ({ x, z, height, radius, color, opacity = 1, y = 0 }) => {
  const uniforms = useMemo(() => ({ color: { value: new THREE.Color(color) }, opacity: { value: 1 } }), [color]);
  uniforms.opacity.value = opacity;
  if (height <= 0.001 || opacity <= 0.001) return null;
  return (
    <group position={[x, y + height / 2, z]}>
      <mesh>
        <cylinderGeometry args={[radius, radius, height, 24, 1, true]} />
        <shaderMaterial vertexShader={beamVert} fragmentShader={beamFrag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[radius * 3.2, radius * 3.2, height, 24, 1, true]} />
        <shaderMaterial vertexShader={beamVert} fragmentShader={beamFrag} uniforms={{ color: uniforms.color, opacity: { value: opacity * 0.22 } }} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

/** Screen-space thick polyline with progressive draw and optional glow. */
export const FatLine: React.FC<{
  points: THREE.Vector3[];
  color: string;
  width: number;
  progress?: number;
  opacity?: number;
  additive?: boolean;
  dashed?: boolean;
  dashOffset?: number;
  dashSize?: number;
  gapSize?: number;
}> = ({ points, color, width, progress = 1, opacity = 1, additive, dashed, dashOffset = 0, dashSize = 0.3, gapSize = 0.3 }) => {
  const line = useMemo(() => {
    const geo = new LineGeometry();
    geo.setPositions(points.flatMap((p) => [p.x, p.y, p.z]));
    const mat = new LineMaterial({
      color: new THREE.Color(color).getHex(),
      linewidth: width,
      transparent: true,
      depthWrite: false,
      dashed: !!dashed,
      dashSize,
      gapSize,
    });
    if (additive) mat.blending = THREE.AdditiveBlending;
    mat.resolution.set(W, H);
    const l = new Line2(geo, mat);
    l.computeLineDistances();
    l.frustumCulled = false;
    return l;
  }, [points, color, width, additive, dashed, dashSize, gapSize]);
  const segs = points.length - 1;
  line.geometry.instanceCount = Math.max(0, Math.floor(segs * Math.min(1, progress)));
  line.material.opacity = opacity;
  line.material.dashOffset = dashOffset;
  line.visible = progress > 0 && opacity > 0.001;
  return <primitive object={line} />;
};

/** Thin line + wide additive halo = a neon stroke without post-processing. */
export const NeonLine: React.FC<{
  points: THREE.Vector3[];
  color: string;
  width: number;
  progress?: number;
  opacity?: number;
  glow?: number;
}> = ({ points, color, width, progress = 1, opacity = 1, glow = 1 }) => (
  <>
    <FatLine points={points} color={color} width={width * 6} progress={progress} opacity={opacity * 0.12 * glow} additive />
    <FatLine points={points} color={color} width={width * 2.6} progress={progress} opacity={opacity * 0.3 * glow} additive />
    <FatLine points={points} color={color} width={width} progress={progress} opacity={opacity} />
  </>
);

export const curvePoints = (ctrl: [number, number][], y = 0.03, n = 120) =>
  new THREE.CatmullRomCurve3(ctrl.map(([x, z]) => new THREE.Vector3(x, y, z)), false, "centripetal").getPoints(n);
