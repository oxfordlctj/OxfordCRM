import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Pill, Rise, Slam, fadeOut } from "../fx";
import { Logo } from "../Logo";
import { C, DISPLAY, T, clamp, easeOut, punch, s } from "../theme";

const BRAND = [C.blue, C.red, C.orange, C.yellow];

/** "НЕ!" — the turn. White flash, colour bursts outward. */
export const Drop: React.FC = () => {
  const frame = useCurrentFrame();
  const at = s(T.no);
  const end = s(T.center);
  if (frame < at || frame >= end) return null;
  const t = frame - at;
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper, overflow: "hidden" }}>
      {new Array(18).fill(0).map((_, i) => {
        const ang = (i / 18) * Math.PI * 2 + random(`na${i}`) * 0.3;
        const dist = interpolate(t, [0, 22], [80, 900 + random(`nd${i}`) * 400], { ...clamp, easing: easeOut });
        return (
          <Pill
            key={i}
            color={BRAND[i % 4]}
            w={190 + random(`nw${i}`) * 120}
            h={70}
            x={540 + Math.cos(ang) * dist}
            y={900 + Math.sin(ang) * dist}
            rot={(ang * 180) / Math.PI}
            opacity={interpolate(t, [0, 3, 24, 30], [0, 1, 1, 0], clamp)}
          />
        );
      })}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 520,
            color: C.red,
            lineHeight: 1,
            scale: interpolate(t, [0, 6, 30], [2.6, 1, 0.94], { ...clamp, easing: punch }),
            filter: `blur(${interpolate(t, [0, 5], [20, 0], clamp)}px)`,
            textShadow: "0 30px 80px rgba(232,20,27,0.35)",
          }}
        >
          НЕ!
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Bright paper background with soft colour blobs and drifting pills. */
export const BrightStage: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper, overflow: "hidden" }}>
      {BRAND.map((col, i) => (
        <div
          key={col}
          style={{
            position: "absolute",
            width: 760,
            height: 760,
            borderRadius: 380,
            backgroundColor: col,
            opacity: 0.16,
            filter: "blur(120px)",
            left: 160 + Math.cos(frame / 70 + i * 1.7) * 380 - 380 + 380 * (i % 2),
            top: 300 + Math.sin(frame / 55 + i * 2.1) * 520 + i * 260 - 300,
          }}
        />
      ))}
      {new Array(10).fill(0).map((_, i) => {
        const sp = 0.6 + random(`ps${i}`) * 1.4;
        const y = ((random(`py${i}`) * 2400 - frame * sp * 2) % 2400 + 2400) % 2400 - 240;
        return (
          <Pill
            key={i}
            color={BRAND[i % 4]}
            w={120 + random(`pw${i}`) * 140}
            h={34 + random(`ph${i}`) * 20}
            x={random(`px${i}`) * 1080}
            y={y}
            rot={-35 + random(`pr${i}`) * 20}
            opacity={0.22}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Center: React.FC<{ children: React.ReactNode; gap?: number; style?: React.CSSProperties }> = ({
  children,
  gap = 10,
  style,
}) => (
  <AbsoluteFill
    style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap, padding: "0 80px", ...style }}
  >
    {children}
  </AbsoluteFill>
);

/** "Маркази таълимии" → logo build → "Курси тайёрӣ ба мактаб". */
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const start = s(T.center);
  const end = s(T.skills[0]) - 1;
  if (frame < start || frame >= end) return null;
  const logoAt = s(T.logo);
  const headerUp = interpolate(frame, [logoAt - 6, logoAt + 10], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill style={{ opacity: fadeOut(frame, end, 5) }}>
      <Center gap={0} style={{ justifyContent: "flex-start", paddingTop: interpolate(headerUp, [0, 1], [700, 290]) }}>
        <div style={{ scale: interpolate(headerUp, [0, 1], [1, 0.55]), display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Slam at={start} size={128} color={C.navy}>
            МАРКАЗИ
          </Slam>
          <Slam at={s(T.learning)} size={128} color={C.navy}>
            ТАЪЛИМИИ
          </Slam>
        </div>
      </Center>
      <AbsoluteFill style={{ alignItems: "center", top: 520 }}>
        {frame >= logoAt - 1 ? <Logo at={logoAt} size={560} showKids={false} /> : null}
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", top: 1150, gap: 22 }}>
        <Rise at={s(T.course)} size={96} weight={900} color={C.navy}>
          КУРСИ ТАЙЁРӢ
        </Rise>
        <PillLabel at={s(T.forSchool)} color={C.blue} size={92}>
          БА МАКТАБ
        </PillLabel>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const PillLabel: React.FC<{ at: number; color: string; size: number; children: React.ReactNode; textColor?: string }> = ({
  at,
  color,
  size,
  children,
  textColor = "#fff",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 170 } });
  return (
    <div
      style={{
        backgroundColor: color,
        color: textColor,
        fontFamily: DISPLAY,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        padding: `${size * 0.32}px ${size * 0.6}px`,
        borderRadius: size,
        whiteSpace: "nowrap",
        scale: String(p),
        opacity: frame >= at ? 1 : 0,
        boxShadow: `0 24px 60px ${color}55`,
      }}
    >
      {children}
    </div>
  );
};

const SKILLS: { label: string; color: string; text?: string; icon: string }[] = [
  { label: "ХОНДАН", color: C.red, icon: "Аа" },
  { label: "НАВИШТАН", color: C.orange, icon: "✎" },
  { label: "ҲИСОБ", color: C.blue, icon: "1+2" },
  { label: "МАНТИҚ", color: C.yellow, text: C.navy, icon: "?!" },
  { label: "БОВАРӢ БА ХУД", color: C.navy, icon: "★" },
];

/** Five skills slam in as pills, alternating sides. */
export const Skills: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = s(T.skills[0]);
  const end = s(T.yourChild) - 1;
  if (frame < start || frame >= end) return null;
  return (
    <AbsoluteFill style={{ opacity: fadeOut(frame, end, 5), justifyContent: "center", alignItems: "center", gap: 34 }}>
      {SKILLS.map((sk, i) => {
        const at = s(T.skills[i]);
        const p = spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 190, mass: 0.8 } });
        const dir = i % 2 === 0 ? -1 : 1;
        return (
          <div
            key={sk.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              backgroundColor: sk.color,
              borderRadius: 90,
              padding: "26px 54px 26px 26px",
              minWidth: 640,
              translate: `${(1 - p) * 1100 * dir}px 0px`,
              rotate: `${(1 - p) * 8 * dir}deg`,
              opacity: frame >= at ? 1 : 0,
              boxShadow: `0 24px 50px ${sk.color}55`,
            }}
          >
            <div
              style={{
                width: 112,
                height: 112,
                borderRadius: 56,
                backgroundColor: "rgba(255,255,255,0.95)",
                color: sk.color === C.yellow ? C.orange : sk.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: DISPLAY,
                fontWeight: 900,
                fontSize: sk.icon.length > 2 ? 40 : 52,
              }}
            >
              {sk.icon}
            </div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 900,
                fontSize: sk.label.length > 10 ? 70 : 84,
                color: sk.text ?? "#fff",
                lineHeight: 1,
              }}
            >
              {sk.label}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** "Фарзанди шумо ба мактаб на бо тарс... балки бо ТАБАССУМ меравад." */
export const Smile: React.FC = () => {
  const frame = useCurrentFrame();
  const start = s(T.yourChild);
  const end = s(T.seats) - 1;
  if (frame < start || frame >= end) return null;
  const strike = interpolate(frame, [s(T.strike), s(T.strike) + 8], [0, 1], { ...clamp, easing: easeOut });
  const fearOut = interpolate(frame, [s(T.but2) - 6, s(T.but2)], [1, 0], clamp);
  const smileDraw = interpolate(frame, [s(T.smile) + 4, s(T.smile) + 22], [1, 0], { ...clamp, easing: easeOut });
  const smileOn = frame >= s(T.but2) - 2;
  return (
    <AbsoluteFill style={{ opacity: fadeOut(frame, end, 5) }}>
      <AbsoluteFill style={{ alignItems: "center", top: 300, gap: 0 }}>
        <Rise at={start} size={92} weight={900} color={C.navy}>
          ФАРЗАНДИ ШУМО
        </Rise>
        <Rise at={s(T.toSchool2)} size={92} weight={900} color={C.blue}>
          БА МАКТАБ
        </Rise>
      </AbsoluteFill>
      {!smileOn ? (
        <Center style={{ paddingTop: 200, opacity: fearOut }}>
          <Rise at={s(T.notFear)} size={70} weight={600} color={C.ash}>
            НА БО
          </Rise>
          <div style={{ position: "relative" }}>
            <Slam at={s(T.notFear) + 8} size={170} color={C.ash}>
              ТАРС
            </Slam>
            <div
              style={{
                position: "absolute",
                left: "-8%",
                top: "46%",
                height: 22,
                borderRadius: 11,
                width: `${strike * 116}%`,
                backgroundColor: C.red,
                rotate: "-6deg",
              }}
            />
          </div>
        </Center>
      ) : (
        <Center style={{ paddingTop: 230 }} gap={0}>
          <Rise at={s(T.but2)} size={70} weight={600} color={C.navy}>
            БАЛКИ БО
          </Rise>
          <Slam at={s(T.smile)} size={140} color={C.orange} style={{ textShadow: "0 20px 60px rgba(247,115,28,0.35)" }}>
            ТАБАССУМ
          </Slam>
          <svg width={520} height={150} viewBox="0 0 520 150" style={{ marginTop: -6 }}>
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
          <Rise at={s(T.goes2)} size={96} weight={900} color={C.navy}>
            МЕРАВАД!
          </Rise>
        </Center>
      )}
    </AbsoluteFill>
  );
};

/** "Ҷойҳо маҳдуданд! Ҳозир сабт шавед!" */
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const start = s(T.seats);
  const end = s(T.end);
  if (frame < start || frame >= end) return null;
  const pulse = 1 + Math.max(0, Math.sin((frame - s(T.enroll)) / 4)) * 0.04 * (frame > s(T.enroll) + 8 ? 1 : 0);
  return (
    <Center gap={30} style={{ opacity: fadeOut(frame, end, 3) }}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 44,
          color: "#fff",
          backgroundColor: C.red,
          padding: "16px 34px",
          borderRadius: 50,
          letterSpacing: 4,
          opacity: interpolate(frame, [start, start + 4], [0, 1], clamp),
        }}
      >
        ● ДИҚҚАТ
      </div>
      <Slam at={start} size={130} color={C.navy}>
        ҶОЙҲО
      </Slam>
      <Slam at={s(T.seats2)} size={112} color={C.red}>
        МАҲДУДАНД!
      </Slam>
      <div style={{ height: 30 }} />
      <div style={{ scale: String(pulse) }}>
        <PillLabel at={s(T.enroll)} color={C.orange} size={68}>
          ҲОЗИР САБТ ШАВЕД!
        </PillLabel>
      </div>
    </Center>
  );
};

/** Logo, tagline and call to action. */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const start = s(T.end);
  if (frame < start) return null;
  const t = frame - start;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", top: 250 }}>
        <div style={{ scale: interpolate(t, [0, 160], [1, 1.04], clamp) }}>
          <Logo at={start} size={520} fast />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", top: 1010, gap: 26, padding: "0 80px" }}>
        <Rise at={start + 22} size={64} weight={800} color={C.navy}>
          АВВАЛИН ҚАДАМ
        </Rise>
        <Rise at={start + 28} size={64} weight={800} color={C.navy} style={{ marginTop: -18 }}>
          БА СӮИ <span style={{ color: C.orange }}>МУВАФФАҚИЯТ</span>
        </Rise>
        <div style={{ height: 14 }} />
        <PillLabel at={start + 44} color={C.blue} size={50}>
          КУРСИ ТАЙЁРӢ БА МАКТАБ
        </PillLabel>
        <div
          style={{
            marginTop: 18,
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 50,
            color: C.red,
            opacity: interpolate(t, [58, 68], [0, 1], clamp),
            translate: `0px ${interpolate(t, [58, 72], [30, 0], { ...clamp, easing: easeOut }) + Math.sin(t / 6) * 6}px`,
          }}
        >
          Ба Direct нависед ↓
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
