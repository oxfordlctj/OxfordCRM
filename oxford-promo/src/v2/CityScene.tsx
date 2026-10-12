import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { BACK, BODY, COLORS, DISPLAY, EASE_IN, EASE_IN_OUT, EASE_OUT, ip } from "../theme";
import { BRANCHES, NEW8, RIVER, ROADS, buildings, curve } from "./cityData";
import { Beam, CamRig, FatLine, Glow, H, NeonLine, W, orbitCam, project } from "./three-kit";
import { CITY0, HITS, VO } from "./timeline";

// local seconds
const L = (g: number) => g - CITY0;
const NAME_T = BRANCHES.map((_, i) => L(VO[`n${i + 1}` as keyof typeof VO]));
const T_ALL = L(VO.v08);
const T_DIM = L(VO.v09) - 0.2;
const T_IMP = L(HITS.impact);
const T_NAME8 = L(VO.v11);
const T_WHY = L(VO.v12);
const T_R1 = L(HITS.r1);
const T_R2 = L(HITS.r2);
const T_R3 = L(HITS.r3);
const T_OUT = L(HITS.outro);
const C8: [number, number] = NEW8.p;

const DISTRICTS = [
  { name: "FIRDAVSI", p: [-6.2, -2.4] as [number, number] },
  { name: "SINO", p: [-4.6, 4.2] as [number, number] },
  { name: "SHOHMANSUR", p: [5.4, 2.4] as [number, number] },
  { name: "I. SOMONI", p: [2.6, -6.6] as [number, number] },
];

export const cityCam = (t: number) => {
  const c = orbitCam(
    [
      { t: 0, th: 0, r: 1.0, h: 26, tx: 0, tz: 0, fov: 52 },
      { t: 3.0, th: -32, r: 15, h: 13, tx: 0, tz: 0.8, fov: 58 },
      { t: 9.5, th: 8, r: 16, h: 14, tx: 0, tz: 0.4, fov: 58 },
      { t: T_DIM + 0.2, th: 22, r: 17.5, h: 17, tx: 0, tz: 0.2, fov: 58 },
      { t: T_IMP - 0.1, th: 32, r: 8, h: 5.2, tx: C8[0], tz: C8[1], fov: 55 },
      { t: T_IMP + 0.7, th: 36, r: 10.5, h: 7.5, tx: C8[0], tz: C8[1], fov: 58 },
      { t: T_WHY - 0.4, th: 96, r: 9.5, h: 6.5, tx: C8[0], tz: C8[1], fov: 58 },
      { t: T_WHY + 1.2, th: 112, r: 16.5, h: 15, tx: C8[0], tz: 0.6, fov: 58 },
      { t: T_OUT - 0.5, th: 168, r: 17.5, h: 16.5, tx: C8[0], tz: 0.6, fov: 58 },
      { t: T_OUT + 3.5, th: 182, r: 4, h: 30, tx: C8[0], tz: 0.6, fov: 52 },
      { t: T_OUT + 9, th: 192, r: 3.5, h: 32, tx: C8[0], tz: 0.6, fov: 52 },
    ],
    t,
  );
  const shake = ip(t, [T_IMP, T_IMP + 0.8], [0.35, 0]) * (t >= T_IMP ? 1 : 0);
  c.pos = [c.pos[0] + Math.sin(t * 61) * shake, c.pos[1] + Math.cos(t * 53) * shake, c.pos[2] + Math.sin(t * 47) * shake];
  return c;
};

const City3D: React.FC<{ t: number }> = ({ t }) => {
  const list = useMemo(buildings, []);
  const mesh = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.translate(0, 0.5, 0);
    const mat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5, metalness: 0.35 });
    const m = new THREE.InstancedMesh(geo, mat, list.length);
    m.frustumCulled = false;
    return m;
  }, [list]);
  const roads = useMemo(() => ROADS.map((r) => ({ ...r, line: curve(r.pts, 0.02, 120) })), []);
  const river = useMemo(() => curve(RIVER, 0.015, 160), []);
  const arcs = useMemo(
    () =>
      [...BRANCHES.map((b) => b.p), ...DISTRICTS.map((d) => d.p)].map(([x, z]) => {
        const mid = new THREE.Vector3((x + C8[0]) / 2, 1.6 + Math.hypot(x - C8[0], z - C8[1]) * 0.28, (z + C8[1]) / 2);
        return new THREE.QuadraticBezierCurve3(new THREE.Vector3(x, 0.05, z), mid, new THREE.Vector3(C8[0], 0.05, C8[1]));
      }),
    [],
  );
  const arcPts = useMemo(() => arcs.map((a) => a.getPoints(80)), [arcs]);

  // global lighting mood
  const dim = ip(t, [T_DIM, T_DIM + 0.8], [1, 0.32]) + ip(t, [T_IMP, T_IMP + 0.3], [0, 0.68]);
  const outroDim = ip(t, [T_OUT, T_OUT + 2], [1, 0.55]);
  const mood = dim * outroDim;
  const wave = (t - T_IMP) * 11;

  const mtx = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const col = new THREE.Color();
  const base = new THREE.Color("#10265a");
  const hi = new THREE.Color("#2a55b8");
  const lit = new THREE.Color("#7fb2ff");
  const gold = new THREE.Color(COLORS.gold);
  list.forEach((b, i) => {
    const g = ip(t, [0.2 + b.delay, 0.9 + b.delay], [0.0001, 1], EASE_OUT);
    mtx.compose(new THREE.Vector3(b.x, 0, b.z), q, new THREE.Vector3(b.w, b.h * g, b.d));
    mesh.setMatrixAt(i, mtx);
    col.copy(base).lerp(hi, b.tone * 0.8);
    if (b.tone > 0.94) col.copy(lit);
    if (t > T_IMP) {
      const dw = Math.abs(b.dist - wave);
      const k = Math.max(0, 1 - dw / 1.4) * ip(t, [T_IMP, T_IMP + 1.6], [1, 0]);
      const warm = Math.exp(-(b.dist * b.dist) / 5) * 0.55;
      col.lerp(gold, Math.min(1, k + warm));
    }
    col.multiplyScalar(mood);
    mesh.setColorAt(i, col);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  const imp = t >= T_IMP;
  const beam8 = ip(t, [T_IMP, T_IMP + 0.35], [0, 13], BACK);

  return (
    <>
      <color attach="background" args={[COLORS.ink]} />
      <fog attach="fog" args={[COLORS.ink, 16, 46]} />
      <hemisphereLight args={["#7aa5ff", "#040a18", 1.1 * mood]} />
      <directionalLight position={[-6, 10, 8]} intensity={1.5 * mood} />
      <pointLight position={[C8[0], 2.2, C8[1]]} intensity={imp ? ip(t, [T_IMP, T_IMP + 0.2, T_IMP + 2], [0, 120, 40]) : 0} distance={10} decay={1.6} color={COLORS.gold} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#071330" roughness={0.9} />
      </mesh>
      <gridHelper args={[60, 150, "#132a62", "#0b1a40"]} position={[0, -0.005, 0]} />
      <primitive object={mesh} />

      {roads.map((r, i) => (
        <FatLine key={i} points={r.line} color="#9cc0ff" width={r.major ? 3 : 2} progress={ip(t, [0.4 + i * 0.12, 2.0 + i * 0.12], [0, 1], EASE_IN_OUT)} opacity={0.42 * mood} />
      ))}
      <NeonLine points={river} color={COLORS.river} width={4} progress={ip(t, [0.3, 2.4], [0, 1], EASE_IN_OUT)} opacity={0.9 * mood} glow={1.3} />

      {/* reason 2: every major route lights up towards the centre */}
      {roads.filter((r) => r.major).map((r, i) => (
        <FatLine key={`g${i}`} points={r.line} color={COLORS.gold} width={6} dashed dashSize={0.35} gapSize={0.25} dashOffset={-t * 2.2} opacity={ip(t, [T_R2, T_R2 + 0.5, T_R3 + 0.3, T_R3 + 1], [0, 1, 1, 0.25])} additive />
      ))}

      {/* branches */}
      {BRANCHES.map((b, i) => {
        const s = NAME_T[i];
        const h = ip(t, [s - 0.15, s + 0.3], [0, 4.2], BACK);
        const ph = ((t - s) / 1.6) % 1;
        const fade = imp ? 0.75 : 1;
        return (
          <group key={b.id}>
            <Beam x={b.p[0]} z={b.p[1]} height={h} radius={0.06} color={COLORS.sky} opacity={fade * outroDim} />
            <Glow position={[b.p[0], 0.08, b.p[1]]} size={ip(t, [s - 0.1, s + 0.2], [0, 1.6])} color={COLORS.sky} opacity={fade} />
            {t > s && (
              <mesh position={[b.p[0], 0.03, b.p[1]]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.2 + ph * 1.2, 0.2 + ph * 1.2, 1]}>
                <ringGeometry args={[0.85, 1, 48]} />
                <meshBasicMaterial color={COLORS.sky} transparent opacity={(1 - ph) * 0.8 * fade} blending={THREE.AdditiveBlending} depthWrite={false} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* the empty heart before the reveal */}
      {t > T_DIM && !imp && (
        <mesh position={[C8[0], 0.04, C8[1]]} rotation={[-Math.PI / 2, 0, t * 1.5]}>
          <ringGeometry args={[0.55, 0.62, 6]} />
          <meshBasicMaterial color={COLORS.goldSoft} transparent opacity={ip(t, [T_DIM, T_DIM + 0.6], [0, 0.9]) * (0.6 + 0.4 * Math.sin(t * 12))} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}

      {/* №8 */}
      {imp && (
        <>
          <Beam x={C8[0]} z={C8[1]} height={beam8} radius={0.16} color={COLORS.gold} />
          <Beam x={C8[0]} z={C8[1]} height={beam8 * 0.9} radius={0.05} color="#fff4d6" />
          <Glow position={[C8[0], 0.2, C8[1]]} size={ip(t, [T_IMP, T_IMP + 0.15, T_IMP + 1.2], [0, 9, 4])} color={COLORS.gold} />
          <Glow position={[C8[0], 0.2, C8[1]]} size={1.6} color="#fff4d6" />
          {[0, 1, 2].map((k) => {
            const p = ip(t, [T_IMP + k * 0.12, T_IMP + 1.8 + k * 0.12], [0, 1], EASE_OUT);
            return (
              <mesh key={k} position={[C8[0], 0.05, C8[1]]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.1 + p * 16, 0.1 + p * 16, 1]}>
                <ringGeometry args={[0.96, 1, 96]} />
                <meshBasicMaterial color={COLORS.goldSoft} transparent opacity={(1 - p) * 0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
              </mesh>
            );
          })}
          {/* rising embers */}
          {new Array(70).fill(0).map((_, i) => {
            const life = 2.2 + random(`el${i}`) * 1.8;
            const age = (t - T_IMP - random(`ed${i}`) * 1.5 + life * 10) % life;
            const a = random(`ea${i}`) * Math.PI * 2;
            const r = 0.2 + random(`er${i}`) * 1.4 + age * 0.15;
            return (
              <Glow key={i} position={[C8[0] + Math.cos(a) * r, age * (1.2 + random(`ev${i}`) * 1.8), C8[1] + Math.sin(a) * r]} size={0.18 + random(`es${i}`) * 0.2} color={COLORS.goldSoft} opacity={Math.sin((age / life) * Math.PI) * ip(t, [T_IMP, T_IMP + 0.3], [0, 1])} />
            );
          })}
          {/* network of light from every branch and district */}
          {arcPts.map((pts, i) => {
            const isDistrict = i >= BRANCHES.length;
            const s = isDistrict ? T_R3 + (i - BRANCHES.length) * 0.15 : T_IMP + 0.9 + i * 0.1;
            const prog = ip(t, [s, s + 0.9], [0, 1], EASE_IN_OUT);
            const boost = ip(t, [T_R3, T_R3 + 0.4, T_OUT, T_OUT + 1.5], [0.55, 1, 1, 0.6]);
            const pulse = ((t * 0.55 + i / 11) % 1 + 1) % 1;
            const pp = arcs[i].getPoint(pulse);
            return (
              <group key={i}>
                <NeonLine points={pts} color={isDistrict ? COLORS.white : COLORS.goldSoft} width={2.2} progress={prog} opacity={boost} glow={1.2} />
                {prog >= 1 && <Glow position={[pp.x, pp.y, pp.z]} size={0.7} color={COLORS.goldSoft} opacity={boost} />}
              </group>
            );
          })}
        </>
      )}

      {/* reason 1: the geometric centre */}
      {t > T_R1 &&
        [0, 1, 2, 3].map((k) => {
          const ph = (((t - T_R1) / 1.2 - k / 4) % 1 + 1) % 1;
          const on = ip(t, [T_R1, T_R1 + 0.4, T_R2, T_R2 + 0.6], [0, 1, 1, 0]);
          return (
            <mesh key={k} position={[C8[0], 0.06, C8[1]]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.4 + ph * 9, 0.4 + ph * 9, 1]}>
              <ringGeometry args={[0.97, 1, 96]} />
              <meshBasicMaterial color={COLORS.white} transparent opacity={(1 - ph) * on} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          );
        })}
    </>
  );
};

const Pill: React.FC<{ x: number; y: number; num: number; name: string; address: string; t: number; start: number; dim: number }> = ({ x, y, num, name, address, t, start, dim }) => {
  const appear = ip(t, [start + 0.05, start + 0.35], [0, 1], BACK);
  const showAddr = ip(t, [start + 0.2, start + 0.45, start + 1.3, start + 1.6], [0, 1, 1, 0]);
  if (t < start) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -100%", scale: String(appear), opacity: dim, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 20px 8px 8px", borderRadius: 999, background: "rgba(5,12,28,0.82)", border: `2px solid ${COLORS.sky}aa`, boxShadow: `0 0 30px ${COLORS.sky}55` }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: COLORS.sky, color: COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 900, fontSize: 22 }}>{num}</div>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 28, color: COLORS.white, whiteSpace: "nowrap" }}>{name}</div>
      </div>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 22, color: COLORS.mute, opacity: showAddr, whiteSpace: "nowrap" }}>{address}</div>
    </div>
  );
};

const REASONS = [
  { t: T_R1, n: "01", title: "THE VERY CENTER", sub: "The heart of Dushanbe", icon: "center" },
  { t: T_R2, n: "02", title: "ALL MAJOR ROUTES", sub: "Every road leads here", icon: "route" },
  { t: T_R3, n: "03", title: "ANY DISTRICT", sub: "Easy to reach from everywhere", icon: "pin" },
] as const;

const Icon: React.FC<{ kind: string }> = ({ kind }) => (
  <svg width={96} height={96} viewBox="0 0 48 48" fill="none" stroke={COLORS.gold} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    {kind === "center" && (
      <>
        <circle cx={24} cy={24} r={18} />
        <circle cx={24} cy={24} r={10} />
        <circle cx={24} cy={24} r={3} fill={COLORS.gold} />
      </>
    )}
    {kind === "route" && (
      <>
        <path d="M6 40 L20 26 M42 40 L28 26 M24 6 L24 20" />
        <circle cx={24} cy={24} r={4} fill={COLORS.gold} />
        <path d="M6 8 L18 20 M42 8 L30 20" strokeDasharray="3 4" />
      </>
    )}
    {kind === "pin" && (
      <>
        <path d="M24 44 C24 44 10 30 10 19 A14 14 0 0 1 38 19 C38 30 24 44 24 44 Z" />
        <circle cx={24} cy={19} r={5} />
      </>
    )}
  </svg>
);

export const CityScene: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const cam = cityCam(t);
  const placed = NAME_T.filter((s) => t >= s).length;
  const imp = t >= T_IMP;
  const p8 = project(cam, [C8[0], 1.2, C8[1]]);

  const headerOn = ip(t, [1.8, 2.3], [0, 1]) * ip(t, [T_DIM, T_DIM + 0.4], [1, 0]);
  const outro = ip(t, [T_OUT, T_OUT + 0.8], [0, 1]);

  return (
    <AbsoluteFill>
      <ThreeCanvas width={W} height={H}>
        <CamRig cam={cam} />
        <City3D t={t} />
      </ThreeCanvas>

      {/* branch tags */}
      <AbsoluteFill style={{ opacity: 1 - ip(t, [T_WHY - 0.6, T_WHY], [0, 1]) }}>
        {BRANCHES.map((b, i) => {
          const s = project(cam, [b.p[0], 4.4, b.p[1]]);
          return <Pill key={b.id} x={s.x} y={s.y} num={b.id} name={b.name} address={b.address} t={t} start={NAME_T[i]} dim={imp ? 0 : t > T_DIM ? 0.4 : 1} />;
        })}
      </AbsoluteFill>

      {/* district labels for reason 3 */}
      <AbsoluteFill style={{ opacity: ip(t, [T_R3, T_R3 + 0.5, T_OUT - 0.4, T_OUT], [0, 1, 1, 0]) }}>
        {DISTRICTS.map((d) => {
          const s = project(cam, [d.p[0], 0.4, d.p[1]]);
          return (
            <div key={d.name} style={{ position: "absolute", left: s.x, top: s.y, translate: "-50% -50%", fontFamily: BODY, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: COLORS.white, textShadow: "0 2px 16px #000" }}>
              {d.name}
            </div>
          );
        })}
      </AbsoluteFill>

      {/* header: counter */}
      <div style={{ position: "absolute", top: 150, left: 90, right: 90, display: "flex", alignItems: "center", gap: 30, opacity: headerOn }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 200, lineHeight: 0.9, color: "transparent", WebkitTextStroke: `4px ${COLORS.gold}`, width: 170, textAlign: "center", textShadow: `0 0 40px ${COLORS.gold}55` }}>
          {placed}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 28, letterSpacing: 12, color: COLORS.goldSoft }}>DUSHANBE</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, lineHeight: 1, color: COLORS.white }}>{placed === 1 ? "BRANCH" : "BRANCHES"}</div>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 30, color: COLORS.mute, opacity: ip(t, [T_ALL, T_ALL + 0.4], [0, 1]) }}>all around the city</div>
        </div>
      </div>

      {/* and now… */}
      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 60, letterSpacing: ip(t, [T_DIM + 0.2, T_IMP], [6, 22]), color: COLORS.white, opacity: ip(t, [T_DIM + 0.2, T_DIM + 0.6, T_IMP - 0.15, T_IMP], [0, 1, 1, 0]) }}>
        AND NOW…
      </div>

      {/* №8 slam */}
      {imp && (
        <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", opacity: ip(t, [T_WHY - 0.6, T_WHY - 0.1], [1, 0]) }}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 34, letterSpacing: 18, color: COLORS.goldSoft, opacity: ip(t, [T_IMP + 0.2, T_IMP + 0.5], [0, 1]) }}>NEW BRANCH</div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: 250,
              lineHeight: 1.05,
              color: COLORS.gold,
              scale: String(ip(t, [T_IMP, T_IMP + 0.3], [3.2, 1], EASE_OUT)),
              filter: `blur(${ip(t, [T_IMP, T_IMP + 0.25], [30, 0])}px)`,
              opacity: ip(t, [T_IMP, T_IMP + 0.1], [0, 1]),
              textShadow: `0 0 80px ${COLORS.gold}, 0 0 20px ${COLORS.goldSoft}`,
            }}
          >
            №8
          </div>
        </div>
      )}

      {/* №8 name */}
      <div style={{ position: "absolute", top: 1330, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: ip(t, [T_WHY - 0.6, T_WHY - 0.1], [1, 0]) }}>
        <div style={{ display: "flex" }}>
          {NEW8.name.split("").map((ch, i) => {
            const s = T_NAME8 + i * 0.035;
            return (
              <span key={i} style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 900, fontSize: 104, color: COLORS.white, opacity: ip(t, [s, s + 0.2], [0, 1]), translate: `0px ${ip(t, [s, s + 0.4], [70, 0], EASE_OUT)}px`, rotate: `${ip(t, [s, s + 0.4], [12, 0], EASE_OUT)}deg`, textShadow: "0 8px 40px rgba(0,0,0,0.7)" }}>
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: ip(t, [T_NAME8 + 1.1, T_NAME8 + 1.4], [0, 1]), translate: `0px ${ip(t, [T_NAME8 + 1.1, T_NAME8 + 1.5], [30, 0])}px` }}>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 40, color: COLORS.white }}>right next to</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 44, color: COLORS.ink, background: COLORS.gold, padding: "8px 26px", borderRadius: 14 }}>{NEW8.near}</div>
        </div>
      </div>

      {/* №8 marker tag following the beam */}
      {imp && (
        <div style={{ position: "absolute", left: p8.x, top: p8.y, translate: "-50% -50%", opacity: ip(t, [T_IMP + 0.4, T_IMP + 0.8], [0, 1]) * (1 - outro) }}>
          <div style={{ width: 66, height: 66, borderRadius: 33, background: COLORS.gold, color: COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 900, fontSize: 32, boxShadow: `0 0 50px ${COLORS.gold}` }}>8</div>
        </div>
      )}

      {/* why here + reasons */}
      <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center", opacity: ip(t, [T_WHY, T_WHY + 0.3, T_OUT - 0.5, T_OUT], [0, 1, 1, 0]) }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 120, lineHeight: 1, color: COLORS.white, scale: String(ip(t, [T_WHY, T_WHY + 0.35], [1.6, 1], EASE_OUT)), filter: `blur(${ip(t, [T_WHY, T_WHY + 0.3], [20, 0])}px)` }}>
          WHY <span style={{ color: COLORS.gold }}>HERE?</span>
        </div>
      </div>
      {REASONS.map((r, i) => {
        const end = i < 2 ? REASONS[i + 1].t : T_OUT - 0.2;
        const inP = ip(t, [r.t, r.t + 0.45], [0, 1], EASE_OUT);
        const outP = ip(t, [end - 0.25, end + 0.15], [0, 1], EASE_IN);
        if (inP <= 0 || outP >= 1) return null;
        return (
          <div
            key={r.n}
            style={{
              position: "absolute",
              left: 70,
              right: 70,
              top: 1300,
              padding: "36px 40px",
              borderRadius: 40,
              background: "linear-gradient(135deg, rgba(20,40,90,0.55), rgba(5,12,28,0.65))",
              border: "2px solid rgba(255,217,120,0.35)",
              backdropFilter: "blur(18px)",
              boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              gap: 34,
              opacity: inP * (1 - outP),
              translate: `${(1 - inP) * 260 - outP * 260}px 0px`,
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: -120, bottom: -120, width: 140, left: ip(t, [r.t + 0.3, r.t + 0.9], [-300, 1100]), rotate: "18deg", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)" }} />
            <Icon kind={r.icon} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
              <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 28, letterSpacing: 8, color: COLORS.gold }}>REASON {r.n}</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, lineHeight: 1.05, color: COLORS.white }}>{r.title}</div>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 34, color: COLORS.mute }}>{r.sub}</div>
            </div>
          </div>
        );
      })}

      {/* impact flash */}
      <AbsoluteFill style={{ backgroundColor: "#fff3d0", mixBlendMode: "screen", opacity: ip(t, [T_IMP, T_IMP + 0.04, T_IMP + 0.5], [0, 0.9, 0]) }} />
      {/* arrival flash from the map dive */}
      <AbsoluteFill style={{ backgroundColor: COLORS.goldSoft, mixBlendMode: "screen", opacity: ip(t, [0, 0.7], [1, 0], EASE_OUT) }} />
      {/* outro darkening */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(5,12,28,0.35), rgba(5,12,28,0.92))`, opacity: outro }} />
    </AbsoluteFill>
  );
};
