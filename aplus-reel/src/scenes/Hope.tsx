import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Bokeh, Confetti, GodRays, Kid, School } from "../art";
import { FIRE, FlipText, GOLD, Pill, fadeOut } from "../fx";
import { Logo } from "../Logo";
import { C, DISPLAY, T, clamp, easeOut, punch, s } from "../theme";

const BRAND = [C.blue, C.red, C.orange, C.yellow];

const Stack: React.FC<{ top: number; children: React.ReactNode; gap?: number; style?: React.CSSProperties }> = ({
  top,
  children,
  gap = 6,
  style,
}) => (
  <AbsoluteFill style={{ alignItems: "center", top, gap, padding: "0 60px", ...style }}>{children}</AbsoluteFill>
);

/** "НЕ!" — the dark world shatters into a bright one. */
export const Shatter: React.FC = () => {
  const frame = useCurrentFrame();
  const at = s(T.no);
  const end = s(T.center) + 4;
  if (frame < at || frame >= end) return null;
  const t = frame - at;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* shards of the dark world flying off */}
      {new Array(26).fill(0).map((_, i) => {
        const ang = random(`sa${i}`) * Math.PI * 2;
        const d = interpolate(t, [0, 18], [0, 1300], { ...clamp, easing: easeOut }) * (0.6 + random(`sd${i}`) * 0.6);
        const size = 200 + random(`ss${i}`) * 260;
        const cx = 540 + Math.cos(ang) * (120 + random(`sr${i}`) * 300);
        const cy = 960 + Math.sin(ang) * (160 + random(`sr2${i}`) * 520);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx - size / 2 + Math.cos(ang) * d,
              top: cy - size / 2 + Math.sin(ang) * d,
              width: size,
              height: size,
              background: C.midnight,
              clipPath: `polygon(${random(`p1${i}`) * 40}% 0%, 100% ${random(`p2${i}`) * 50}%, ${60 + random(`p3${i}`) * 40}% 100%, 0% ${50 + random(`p4${i}`) * 50}%)`,
              rotate: `${t * (random(`sw${i}`) - 0.5) * 16}deg`,
              opacity: interpolate(t, [10, 22], [1, 0], clamp),
            }}
          />
        );
      })}
      {[0, 5, 10].map((delay, i) => {
        const tt = t - delay;
        const r = interpolate(tt, [0, 22], [40, 1400], { ...clamp, easing: easeOut });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 - r,
              top: 960 - r,
              width: r * 2,
              height: r * 2,
              borderRadius: r,
              border: `${interpolate(tt, [0, 22], [40, 2], clamp)}px solid ${BRAND[i]}`,
              opacity: tt < 0 ? 0 : interpolate(tt, [0, 22], [0.9, 0], clamp),
            }}
          />
        );
      })}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 480,
            lineHeight: 1,
            color: "transparent",
            backgroundImage: FIRE,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            scale: interpolate(t, [0, 6, 30], [3, 1, 0.92], { ...clamp, easing: punch }),
            filter: `blur(${interpolate(t, [0, 5], [24, 0], clamp)}px) drop-shadow(0 30px 60px rgba(232,20,27,0.45))`,
            opacity: interpolate(t, [24, 31], [1, 0], clamp),
          }}
        >
          НЕ!
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Bright sunny sky with clouds, rays and drifting brand pills. */
export const DayStage: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #5EC4F2 0%, #A9E1FA 38%, #FFF4E0 78%, #FFFDF7 100%)", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at 80% 14%, rgba(255,255,230,1) 0px, rgba(255,240,180,0.7) 90px, rgba(255,220,140,0) 520px)",
        }}
      />
      <GodRays x={860} y={270} opacity={0.6} color="255,250,220" />
      {new Array(6).fill(0).map((_, i) => {
        const w = 360 + random(`cw${i}`) * 300;
        const x = ((random(`cx${i}`) * 1600 + frame * (0.4 + random(`cs${i}`) * 0.6)) % 1700) - 400;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: 120 + random(`cy${i}`) * 900,
              width: w,
              height: w * 0.32,
              borderRadius: w,
              background: "rgba(255,255,255,0.75)",
              filter: "blur(18px)",
            }}
          />
        );
      })}
      {new Array(12).fill(0).map((_, i) => {
        const sp = 0.6 + random(`ps${i}`) * 1.4;
        const y = ((random(`py${i}`) * 2400 - frame * sp * 2) % 2400 + 2400) % 2400 - 240;
        return (
          <Pill
            key={i}
            color={BRAND[i % 4]}
            w={110 + random(`pw${i}`) * 130}
            h={32 + random(`ph${i}`) * 20}
            x={random(`px${i}`) * 1080}
            y={y}
            rot={-35 + random(`pr${i}`) * 20}
            opacity={0.35}
          />
        );
      })}
      <Bokeh colors={["#FFFFFF", "#FFE9A8"]} opacity={0.5} seed="d" count={16} />
    </AbsoluteFill>
  );
};

/** "Маркази таълимии" → logo swings in → "Курси тайёрӣ ба мактаб". */
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = s(T.center);
  const end = s(T.reading) - 1;
  if (frame < start || frame >= end) return null;
  const logoAt = s(T.aplus);
  const up = interpolate(frame, [logoAt - 8, logoAt + 8], [0, 1], { ...clamp, easing: easeOut });
  const swing = spring({ frame: frame - logoAt, fps, config: { damping: 9, stiffness: 90 } });
  const sweep = interpolate(frame, [logoAt + 18, logoAt + 40], [-20, 120], clamp);
  return (
    <AbsoluteFill style={{ opacity: fadeOut(frame, end, 5) }}>
      <Stack top={interpolate(up, [0, 1], [720, 230])} gap={0}>
        <div style={{ scale: String(interpolate(up, [0, 1], [1, 0.5])), transformOrigin: "50% 0%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <FlipText at={start} text="МАРКАЗИ" size={140} color={C.navy} glow="rgba(255,255,255,0.8)" />
          <FlipText at={s(T.center) + 14} text="ТАЪЛИМИИ" size={140} color={C.navy} glow="rgba(255,255,255,0.8)" />
        </div>
      </Stack>
      {frame >= logoAt - 1 ? (
        <AbsoluteFill style={{ alignItems: "center", top: 420, perspective: 1400 }}>
          <div
            style={{
              position: "relative",
              padding: 40,
              borderRadius: 80,
              background: "rgba(255,255,255,0.88)",
              boxShadow: "0 50px 120px rgba(20,60,120,0.25)",
              rotate: `y ${(1 - swing) * -80}deg`,
              scale: String(interpolate(swing, [0, 1], [0.6, 1])),
              overflow: "hidden",
            }}
          >
            <Logo at={logoAt} size={520} showKids={false} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(110deg, rgba(255,255,255,0) ${sweep - 10}%, rgba(255,255,255,0.9) ${sweep}%, rgba(255,255,255,0) ${sweep + 10}%)`,
              }}
            />
          </div>
        </AbsoluteFill>
      ) : null}
      <Confetti at={logoAt + 4} x={540} y={760} count={90} />
      <Stack top={1180} gap={20}>
        <FlipText at={s(T.course)} text="КУРСИ ТАЙЁРӢ" size={100} color={C.navy} />
        <PillLabel at={s(T.forSchool)} color={C.orange} size={92}>
          БА МАКТАБ
        </PillLabel>
      </Stack>
    </AbsoluteFill>
  );
};

export const PillLabel: React.FC<{ at: number; color: string; size: number; children: React.ReactNode }> = ({
  at,
  color,
  size,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 170 } });
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: color,
        color: "#fff",
        fontFamily: DISPLAY,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        whiteSpace: "nowrap",
        padding: `${size * 0.32}px ${size * 0.6}px`,
        borderRadius: size,
        scale: String(p),
        opacity: frame >= at ? 1 : 0,
        boxShadow: `0 24px 60px ${color}66`,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(110deg, rgba(255,255,255,0) ${interpolate(frame, [at + 8, at + 30], [-20, 120], clamp) - 10}%, rgba(255,255,255,0.55) ${interpolate(frame, [at + 8, at + 30], [-20, 120], clamp)}%, rgba(255,255,255,0) ${interpolate(frame, [at + 8, at + 30], [-20, 120], clamp) + 10}%)`,
        }}
      />
    </div>
  );
};

const Icon: React.FC<{ kind: string; color: string }> = ({ kind, color }) => {
  const st = { fill: "none", stroke: color, strokeWidth: 9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "book":
      return (
        <svg width={90} height={90} viewBox="0 0 100 100">
          <path d="M50 28 Q32 18 12 22 V80 Q32 76 50 86 Q68 76 88 80 V22 Q68 18 50 28 Z" {...st} />
          <path d="M50 28 V86" {...st} />
        </svg>
      );
    case "pen":
      return (
        <svg width={90} height={90} viewBox="0 0 100 100">
          <path d="M22 78 L30 56 L70 16 L84 30 L44 70 Z" {...st} />
          <path d="M60 26 L74 40" {...st} />
          <path d="M14 90 Q40 80 60 90 T96 88" {...st} strokeWidth={6} />
        </svg>
      );
    case "globe":
      return (
        <svg width={90} height={90} viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={36} {...st} />
          <ellipse cx={50} cy={50} rx={16} ry={36} {...st} />
          <path d="M14 50 H86 M20 32 H80 M20 68 H80" {...st} strokeWidth={6} />
        </svg>
      );
    case "puzzle":
      return (
        <svg width={90} height={90} viewBox="0 0 100 100">
          <path
            d="M20 30 H40 Q40 14 52 14 Q64 14 62 30 H80 V48 Q94 48 94 60 Q94 72 80 70 V86 H20 V68 Q34 70 34 58 Q34 46 20 48 Z"
            {...st}
          />
        </svg>
      );
    default:
      return (
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: kind.length > 2 ? 46 : 56, color }}>{kind}</div>
      );
  }
};

const SUBJECTS: { label: string; icon: string; color: string; at: number }[] = [
  { label: "Хондан", icon: "book", color: C.red, at: T.reading },
  { label: "Навиштан", icon: "pen", color: C.orange, at: T.writing },
  { label: "Англисӣ", icon: "ABC", color: C.blue, at: T.writing + 0.33 },
  { label: "Русӣ", icon: "АБВ", color: C.red, at: T.writing + 0.66 },
  { label: "Математика", icon: "1+2", color: C.blue, at: T.math },
  { label: "Мантиқ", icon: "puzzle", color: C.orange, at: T.logic },
  { label: "Олами атроф", icon: "globe", color: "#2BB673", at: T.logic + 0.4 },
];

/** Seven subject tiles pop in on the beat; "Боварӣ ба худ" crowns them. */
export const Subjects: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = s(T.reading);
  const end = s(T.yourChild) - 1;
  if (frame < start || frame >= end) return null;
  const crown = s(T.confidence);
  const dim = interpolate(frame, [crown, crown + 8], [1, 0.9], clamp);
  const crownP = spring({ frame: frame - crown, fps, config: { damping: 10, stiffness: 140 } });
  return (
    <AbsoluteFill style={{ opacity: fadeOut(frame, end, 5) }}>
      <Stack top={260} gap={0}>
        <FlipText at={start} text="ДАР КУРС:" size={64} weight={800} color={C.navy} sweep={false} style={{ letterSpacing: 8 }} />
      </Stack>
      <AbsoluteFill style={{ alignItems: "center", top: 380 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 26,
            width: 960,
            scale: String(dim),
            translate: `0px ${interpolate(frame, [crown, crown + 10], [0, -40], { ...clamp, easing: easeOut })}px`,
          }}
        >
          {SUBJECTS.map((sub, i) => {
            const a = s(sub.at);
            const p = spring({ frame: frame - a, fps, config: { damping: 12, stiffness: 200, mass: 0.7 } });
            const hot = interpolate(frame, [a, a + 4, a + 16], [0, 1, 0], clamp);
            return (
              <div
                key={sub.label}
                style={{
                  width: 452,
                  height: 150,
                  borderRadius: 40,
                  background: "rgba(255,255,255,0.92)",
                  boxShadow: `0 20px 50px rgba(20,60,120,0.16), 0 0 0 ${hot * 8}px ${sub.color}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  padding: "0 26px",
                  scale: String(p),
                  rotate: `${(1 - p) * (i % 2 ? 12 : -12)}deg`,
                  opacity: frame >= a ? 1 : 0,
                }}
              >
                <div
                  style={{
                    width: 104,
                    height: 104,
                    borderRadius: 32,
                    background: `${sub.color}1f`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon kind={sub.icon} color={sub.color} />
                </div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: sub.label.length > 9 ? 44 : 52, color: C.navy, lineHeight: 1.05 }}>
                  {sub.label}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {frame >= crown ? (
        <AbsoluteFill style={{ alignItems: "center", top: 1170 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              padding: "34px 56px",
              borderRadius: 100,
              background: `linear-gradient(135deg, ${C.navy}, #2C3D78)`,
              boxShadow: "0 30px 70px rgba(22,32,61,0.45)",
              scale: String(crownP),
            }}
          >
            <svg width={96} height={96} viewBox="0 0 100 100" style={{ rotate: `${(frame - crown) * 2}deg` }}>
              <polygon points="50,6 61,38 95,38 67,58 78,92 50,72 22,92 33,58 5,38 39,38" fill={C.yellow} />
            </svg>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 900,
                fontSize: 78,
                color: "transparent",
                backgroundImage: GOLD,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                whiteSpace: "nowrap",
              }}
            >
              БОВАРӢ БА ХУД
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      <Confetti at={crown} x={540} y={1250} count={60} seed="cr" />
    </AbsoluteFill>
  );
};

/** The same child — now in colour — runs to school smiling. */
export const SmileRun: React.FC = () => {
  const frame = useCurrentFrame();
  const start = s(T.yourChild);
  const end = s(T.seats) - 1;
  if (frame < start || frame >= end) return null;
  const t = frame - start;
  const strike = interpolate(frame, [s(T.fear) + 6, s(T.fear) + 14], [0, 1], { ...clamp, easing: easeOut });
  const smileOn = frame >= s(T.but2) - 2;
  const smileDraw = interpolate(frame, [s(T.smile) + 6, s(T.smile) + 24], [1, 0], { ...clamp, easing: easeOut });
  const kidX = interpolate(t, [0, end - start], [-120, 620], clamp);
  return (
    <AbsoluteFill style={{ opacity: fadeOut(frame, end, 5) }}>
      <AbsoluteFill style={{ alignItems: "center", top: 1010 }}>
        <School color="#2C3D78" windowGlow={1} width={980} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1610, bottom: 0, background: "linear-gradient(180deg, #8ED36B, #5DB548)" }} />
      <div style={{ position: "absolute", left: kidX, top: 1250 }}>
        <Kid color={C.navy} pack={C.orange} height={380} walk={frame / 2.6} stride={34} bob={14} />
      </div>
      <Stack top={250} gap={0}>
        <FlipText at={start} text="ФАРЗАНДИ ШУМО" size={86} color={C.navy} glow="rgba(255,255,255,0.8)" />
        <FlipText at={s(T.toSchool2)} text="БА МАКТАБ" size={96} color={C.blue} glow="rgba(255,255,255,0.8)" />
      </Stack>
      {!smileOn ? (
        <Stack top={560} gap={0} style={{ opacity: interpolate(frame, [s(T.but2) - 8, s(T.but2) - 2], [1, 0], clamp) }}>
          <FlipText at={s(T.notFear)} text="НА БО" size={70} weight={700} color={C.navy} sweep={false} />
          <div style={{ position: "relative" }}>
            <FlipText at={s(T.fear)} text="ТАРС" size={170} color="#7D8597" sweep={false} />
            <div
              style={{
                position: "absolute",
                left: "-8%",
                top: "46%",
                height: 24,
                borderRadius: 12,
                width: `${strike * 116}%`,
                backgroundColor: C.red,
                rotate: "-6deg",
              }}
            />
          </div>
        </Stack>
      ) : (
        <Stack top={540} gap={0}>
          <FlipText at={s(T.but2)} text="БАЛКИ БО" size={70} weight={700} color={C.navy} sweep={false} />
          <FlipText at={s(T.smile)} text="ТАБАССУМ" size={150} color={C.orange} glow="rgba(255,255,255,0.9)" />
          <svg width={520} height={130} viewBox="0 0 520 150" style={{ marginTop: -10 }}>
            <path
              d="M30 30 Q260 190 490 30"
              fill="none"
              stroke={C.yellow}
              strokeWidth={30}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={smileDraw}
            />
          </svg>
          <FlipText at={s(T.goes2)} text="МЕРАВАД!" size={92} color={C.navy} />
        </Stack>
      )}
      <Confetti at={s(T.smile) + 4} x={540} y={720} count={50} seed="sm" />
    </AbsoluteFill>
  );
};

/** Seats fill up — "Ҷойҳо маҳдуданд!" — then the CTA button gets tapped. */
export const Seats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = s(T.seats);
  const end = s(T.brand);
  if (frame < start || frame >= end) return null;
  const t = frame - start;
  const tap = s(T.enroll) + 18;
  const ripple = frame - tap;
  const press = interpolate(ripple, [0, 3, 8], [1, 0.92, 1], clamp);
  const btn = spring({ frame: frame - s(T.enroll), fps, config: { damping: 11, stiffness: 170 } });
  return (
    <AbsoluteFill style={{ opacity: fadeOut(frame, end, 3) }}>
      <Stack top={260} gap={0}>
        <FlipText at={start} text="ҶОЙҲО" size={130} color={C.navy} glow="rgba(255,255,255,0.8)" />
        <FlipText at={s(T.seats2)} text="МАҲДУДАНД!" size={104} color={C.red} glow="rgba(255,255,255,0.8)" />
      </Stack>
      <AbsoluteFill style={{ alignItems: "center", top: 640 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 130px)", gap: 24 }}>
          {new Array(15).fill(0).map((_, i) => {
            const filled = i < 13;
            const a = 3 + i * 1.6;
            const p = filled ? interpolate(t, [a, a + 5], [0, 1], { ...clamp, easing: easeOut }) : 0;
            const col = BRAND[i % 4];
            const pulse = !filled ? 0.5 + Math.abs(Math.sin(frame / 6)) * 0.5 : 1;
            return (
              <div
                key={i}
                style={{
                  width: 130,
                  height: 130,
                  borderRadius: 36,
                  border: `5px solid ${filled ? col : C.green}`,
                  background: filled ? col : "rgba(255,255,255,0.7)",
                  opacity: filled ? 0.25 + p * 0.75 : pulse,
                  scale: String(filled ? 0.85 + p * 0.15 : 1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {filled ? (
                  <svg width={70} height={70} viewBox="0 0 100 100" style={{ opacity: p }}>
                    <circle cx={50} cy={32} r={18} fill="#fff" />
                    <path d="M18 92 Q18 56 50 56 Q82 56 82 92 Z" fill="#fff" />
                  </svg>
                ) : (
                  <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 70, color: C.green }}>+</div>
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", top: 1230 }}>
        <div style={{ position: "relative", scale: String(btn * press), opacity: frame >= s(T.enroll) ? 1 : 0 }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: 72,
              color: "#fff",
              whiteSpace: "nowrap",
              padding: "34px 60px",
              borderRadius: 80,
              background: `linear-gradient(135deg, ${C.orange}, ${C.red})`,
              boxShadow: `0 30px 70px ${C.red}55`,
            }}
          >
            ҲОЗИР САБТ ШАВЕД!
          </div>
          {ripple >= 0 ? (
            <div
              style={{
                position: "absolute",
                left: "72%",
                top: "50%",
                width: 40,
                height: 40,
                marginLeft: -20,
                marginTop: -20,
                borderRadius: 20,
                border: "6px solid #fff",
                scale: String(interpolate(ripple, [0, 18], [0.5, 6], clamp)),
                opacity: interpolate(ripple, [0, 18], [0.9, 0], clamp),
              }}
            />
          ) : null}
          {/* tapping finger */}
          <svg
            width={120}
            height={150}
            viewBox="0 0 100 125"
            style={{
              position: "absolute",
              left: "66%",
              top: "40%",
              translate: `${interpolate(frame, [tap - 14, tap], [140, 0], { ...clamp, easing: easeOut })}px ${interpolate(frame, [tap - 14, tap, tap + 6], [200, 0, 14], { ...clamp, easing: easeOut })}px`,
              opacity: interpolate(frame, [tap - 14, tap - 8], [0, 1], clamp),
            }}
          >
            <path
              d="M38 10 Q38 0 47 0 Q56 0 56 10 V48 Q62 42 70 46 Q76 40 84 46 Q92 44 94 54 V86 Q94 112 70 118 H52 Q34 116 24 98 L6 68 Q2 58 12 56 Q20 54 26 64 L38 78 Z"
              fill="#FFE0C7"
              stroke={C.navy}
              strokeWidth={4}
            />
          </svg>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Final card: logo, tagline, subjects, CTA. */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const start = s(T.brand);
  if (frame < start) return null;
  const t = frame - start;
  const chips = ["Англисӣ", "Русӣ", "Математика", "Олами атроф", "Хондан", "Навиштан", "Мантиқ"];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "rgba(255,253,247,0.7)" }} />
      <AbsoluteFill style={{ alignItems: "center", top: 230 }}>
        <div style={{ scale: String(interpolate(t, [0, 200], [1, 1.04], clamp)) }}>
          <Logo at={start} size={470} fast />
        </div>
      </AbsoluteFill>
      <Confetti at={start + 2} x={540} y={520} count={110} seed="end" />
      <Stack top={930} gap={8}>
        <FlipText at={start + 18} text="АВВАЛИН ҚАДАМ" size={70} color={C.navy} />
        <FlipText at={start + 26} text="БА СӮИ МУВАФФАҚИЯТ" size={70} color={C.orange} />
      </Stack>
      <AbsoluteFill style={{ alignItems: "center", top: 1130 }}>
        <PillLabel at={start + 40} color={C.blue} size={50}>
          КУРСИ ТАЙЁРӢ БА МАКТАБ
        </PillLabel>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", top: 1260 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, width: 920 }}>
          {chips.map((c, i) => (
            <div
              key={c}
              style={{
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: 32,
                color: C.navy,
                background: "#fff",
                border: `3px solid ${BRAND[i % 4]}`,
                borderRadius: 40,
                padding: "10px 24px",
                opacity: interpolate(t, [50 + i * 3, 56 + i * 3], [0, 1], clamp),
                translate: `0px ${interpolate(t, [50 + i * 3, 60 + i * 3], [30, 0], { ...clamp, easing: easeOut })}px`,
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", top: 1500 }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 52,
            color: C.red,
            opacity: interpolate(t, [80, 90], [0, 1], clamp),
            translate: `0px ${Math.sin(t / 6) * 6}px`,
          }}
        >
          Ба Direct нависед ↓
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
