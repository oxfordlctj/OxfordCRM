import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { BODY, COLORS, DISPLAY, EASE_IN, EASE_IN_OUT, EASE_OUT, BACK, ip } from "../theme";
import { AF, KG, TJ, UZ } from "./geo3d";
import { Beam, CamRig, FatLine, Glow, H, NeonLine, W, orbitCam, project } from "./three-kit";
import { HITS, MAP0 } from "./timeline";

const DEPTH = 0.22;
const DUSHANBE: [number, number] = [-3.127, 0.526];
const CITIES = [
  { name: "KHUJAND", p: [-2.057, -2.268] as [number, number] },
  { name: "BOKHTAR", p: [-3.127, 1.681] as [number, number] },
  { name: "KULOB", p: [-1.861, 1.585] as [number, number] },
  { name: "KHOROG", p: [3.99, 2.247] as [number, number] },
];

const toShape = (ring: [number, number][]) => {
  const s = new THREE.Shape();
  ring.forEach(([x, z], i) => (i === 0 ? s.moveTo(x, -z) : s.lineTo(x, -z)));
  return s;
};

const inside = (ring: [number, number][], x: number, z: number) => {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i];
    const [xj, zj] = ring[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
};

// local seconds (scene starts at MAP0)
const T_DUSH = HITS.dushanbe - MAP0;
const T_DIVE = 5.2;

export const mapCam = (t: number) =>
  orbitCam(
    [
      { t: 0, th: -8, r: 1.2, h: 30, tx: 0, tz: 0, fov: 50 },
      { t: 2.6, th: -10, r: 14.5, h: 14.5, tx: 0, tz: 0.3, fov: 52 },
      { t: T_DIVE, th: 6, r: 13, h: 12.5, tx: -0.8, tz: 0.4, fov: 52 },
      { t: 7.5, th: 18, r: 0.9, h: 1.0, tx: DUSHANBE[0], tz: DUSHANBE[1], fov: 40 },
    ],
    t,
  );

const dotTexture = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0e2350";
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = "#3f7dff";
  g.beginPath();
  g.arc(32, 32, 7, 0, Math.PI * 2);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(9, 9);
  return t;
};

const Map3D: React.FC<{ t: number }> = ({ t }) => {
  const tj = TJ[0];
  const country = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(toShape(tj), { depth: DEPTH, bevelEnabled: false, curveSegments: 1 });
    return geo;
  }, [tj]);
  const caps = useMemo(() => new THREE.MeshStandardMaterial({ map: dotTexture(), roughness: 0.6, metalness: 0.3, emissive: new THREE.Color("#0a1f55"), emissiveIntensity: 0.6 }), []);
  const sides = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c08a1c", emissive: new THREE.Color("#f5b935"), emissiveIntensity: 0.55, roughness: 0.4, metalness: 0.6 }), []);
  const border = useMemo(() => tj.map(([x, z]) => new THREE.Vector3(x, DEPTH + 0.01, z)), [tj]);
  const neighbours = useMemo(
    () =>
      [UZ[0], KG[0], AF[0]].map((r) => ({
        geo: new THREE.ShapeGeometry(toShape(r)),
        line: r.map(([x, z]) => new THREE.Vector3(x, 0.005, z)),
      })),
    [],
  );
  const peaks = useMemo(() => {
    const out: { x: number; z: number; h: number; r: number }[] = [];
    for (let i = 0; i < 420; i++) {
      const x = -0.5 + random(`px${i}`) * 5.5;
      const z = -1.6 + random(`pz${i}`) * 4.2;
      if (!inside(tj, x, z)) continue;
      const east = Math.min(1, Math.max(0, (x + 0.5) / 4));
      out.push({ x, z, h: 0.05 + random(`ph${i}`) * 0.35 * (0.3 + east), r: 0.08 + random(`pr${i}`) * 0.12 });
    }
    return out;
  }, [tj]);
  const peakMesh = useMemo(() => {
    const geo = new THREE.ConeGeometry(1, 1, 4);
    geo.translate(0, 0.5, 0);
    const m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: "#1d3d8a", roughness: 0.5, metalness: 0.2, emissive: new THREE.Color("#0c2260"), flatShading: true }), peaks.length);
    return m;
  }, [peaks]);
  const grow = ip(t, [0.9, 2.4], [0.001, 1], EASE_OUT);
  const mtx = new THREE.Matrix4();
  peaks.forEach((p, i) => {
    const g = ip(t, [1.8 + random(`pd${i}`) * 0.9, 2.6 + random(`pd${i}`) * 0.9], [0.001, 1], BACK);
    mtx.compose(new THREE.Vector3(p.x, DEPTH * grow, p.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, random(`pa${i}`) * 3, 0)), new THREE.Vector3(p.r, p.h * g, p.r));
    peakMesh.setMatrixAt(i, mtx);
  });
  peakMesh.instanceMatrix.needsUpdate = true;

  const ringT = (t - T_DUSH) / 1.4;
  return (
    <>
      <color attach="background" args={[COLORS.ink]} />
      <fog attach="fog" args={[COLORS.ink, 14, 34]} />
      <hemisphereLight args={["#6d9bff", "#050c1c", 0.9]} />
      <directionalLight position={[-4, 8, 6]} intensity={1.6} color="#ffffff" />
      <pointLight position={[DUSHANBE[0], 1.2, DUSHANBE[1]]} intensity={ip(t, [T_DUSH, T_DUSH + 0.6], [0, 6])} distance={6} color={COLORS.gold} />

      {/* ground grid */}
      <gridHelper args={[60, 120, "#16306a", "#0c1d44"]} position={[0, -0.002, 0]} />
      {neighbours.map((n, i) => (
        <group key={i}>
          <mesh geometry={n.geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
            <meshBasicMaterial color="#0b1938" transparent opacity={ip(t, [0.2, 1.2], [0, 0.9])} />
          </mesh>
          <FatLine points={n.line} color={COLORS.mute} width={1.6} opacity={ip(t, [0.3, 1.4], [0, 0.45])} />
        </group>
      ))}

      <mesh geometry={country} material={[caps, sides]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, grow]} />
      <primitive object={peakMesh} />
      <NeonLine points={border} color={COLORS.goldSoft} width={3} progress={ip(t, [0.1, 2.2], [0, 1], EASE_IN_OUT)} glow={1.4} />

      {/* cities */}
      {CITIES.map((c, i) => {
        const s = 2.6 + i * 0.18;
        const h = ip(t, [s, s + 0.5], [0, 0.9], BACK);
        return (
          <group key={c.name}>
            <Beam x={c.p[0]} z={c.p[1]} y={DEPTH} height={h} radius={0.02} color={COLORS.sky} />
            <Glow position={[c.p[0], DEPTH + 0.02, c.p[1]]} size={0.5 * ip(t, [s, s + 0.4], [0, 1])} color={COLORS.sky} />
          </group>
        );
      })}

      {/* Dushanbe */}
      <Beam x={DUSHANBE[0]} z={DUSHANBE[1]} y={DEPTH} height={ip(t, [T_DUSH - 0.2, T_DUSH + 0.5], [0, 3.2], BACK)} radius={0.05} color={COLORS.gold} />
      <Glow position={[DUSHANBE[0], DEPTH + 0.05, DUSHANBE[1]]} size={ip(t, [T_DUSH - 0.2, T_DUSH + 0.3], [0, 1.8])} color={COLORS.gold} />
      {[0, 1, 2].map((k) => {
        const ph = ringT - k * 0.33;
        if (ph < 0) return null;
        const f = ph % 1;
        return (
          <mesh key={k} position={[DUSHANBE[0], DEPTH + 0.015, DUSHANBE[1]]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.1 + f * 1.4, 0.1 + f * 1.4, 1]}>
            <ringGeometry args={[0.9, 1, 64]} />
            <meshBasicMaterial color={COLORS.gold} transparent opacity={(1 - f) * 0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        );
      })}
    </>
  );
};

export const MapScene: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const cam = mapCam(t);
  const textOut = ip(t, [T_DIVE - 0.2, T_DIVE + 0.4], [1, 0]);
  const dLabel = project(cam, [DUSHANBE[0], DEPTH + 1.1, DUSHANBE[1]]);
  const labels = CITIES.map((c) => ({ ...c, s: project(cam, [c.p[0], DEPTH + 0.95, c.p[1]]) }));
  const neighbourLabels = [
    { name: "UZBEKISTAN", s: project(cam, [-4.2, 0, -1.2]) },
    { name: "KYRGYZSTAN", s: project(cam, [1.8, 0, -3.6]) },
    { name: "AFGHANISTAN", s: project(cam, [1.0, 0, 4.4]) },
    { name: "CHINA", s: project(cam, [5.6, 0, -0.4]) },
  ];
  const clip = ip(t, [0, 0.55], [0, 160], EASE_OUT);
  return (
    <AbsoluteFill style={{ clipPath: `circle(${clip}% at 50% 50%)` }}>
      <ThreeCanvas width={W} height={H} linear={false}>
        <CamRig cam={cam} />
        <Map3D t={t} />
      </ThreeCanvas>

      {/* neighbour + city labels */}
      <AbsoluteFill style={{ opacity: ip(t, [1.6, 2.4], [0, 1]) * textOut }}>
        {neighbourLabels.map((n) => (
          <div key={n.name} style={{ position: "absolute", left: n.s.x, top: n.s.y, translate: "-50% -50%", fontFamily: BODY, fontWeight: 800, fontSize: 24, letterSpacing: 8, color: COLORS.mute, opacity: 0.55 }}>
            {n.name}
          </div>
        ))}
        {labels.map((c, i) => (
          <div key={c.name} style={{ position: "absolute", left: c.s.x, top: c.s.y, translate: "-50% -100%", fontFamily: BODY, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: COLORS.white, opacity: ip(t, [2.8 + i * 0.18, 3.2 + i * 0.18], [0, 0.9]) }}>
            {c.name}
          </div>
        ))}
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: dLabel.x,
          top: dLabel.y,
          translate: "-50% -100%",
          opacity: ip(t, [T_DUSH + 0.1, T_DUSH + 0.4], [0, 1]) * ip(t, [6.2, 6.6], [1, 0]),
          scale: String(ip(t, [T_DUSH + 0.1, T_DUSH + 0.5], [0.4, 1], BACK)),
          padding: "14px 30px",
          borderRadius: 999,
          background: COLORS.gold,
          color: COLORS.ink,
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: 4,
          boxShadow: `0 0 60px ${COLORS.gold}aa`,
        }}
      >
        DUSHANBE
      </div>

      {/* title */}
      <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", opacity: textOut }}>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 30, letterSpacing: 16, color: COLORS.goldSoft, opacity: ip(t, [0.9, 1.5], [0, 1]) }}>
          THE HEART OF
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 92,
            letterSpacing: ip(t, [0.8, 2.6], [40, 4], EASE_OUT),
            color: COLORS.white,
            marginTop: 10,
            opacity: ip(t, [0.8, 1.4], [0, 1]),
            filter: `blur(${ip(t, [0.8, 1.6], [16, 0])}px)`,
            textShadow: `0 0 50px ${COLORS.sky}88`,
          }}
        >
          TAJIKISTAN
        </div>
      </div>
      {/* dive flash */}
      <AbsoluteFill style={{ backgroundColor: COLORS.goldSoft, mixBlendMode: "screen", opacity: ip(t, [6.7, 7.45], [0, 1], EASE_IN) }} />
    </AbsoluteFill>
  );
};
