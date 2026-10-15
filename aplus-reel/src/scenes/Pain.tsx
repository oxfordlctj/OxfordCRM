import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Bokeh, Flare, GodRays, Kid, School, Sky } from "../art";
import { FIRE, FlipText, GOLD, ICE, fadeOut } from "../fx";
import { C, DISPLAY, MONO, T, clamp, easeInOut, easeOut, s } from "../theme";

const Stack: React.FC<{ top: number; children: React.ReactNode; gap?: number; style?: React.CSSProperties }> = ({
  top,
  children,
  gap = 6,
  style,
}) => (
  <AbsoluteFill style={{ alignItems: "center", top, gap, padding: "0 70px", ...style }}>{children}</AbsoluteFill>
);

/** 0 – 2.5 s: "A+ presents" cold open. */
export const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const end = s(2.6);
  if (frame >= end) return null;
  const sweep = interpolate(frame, [4, 40], [-20, 120], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fadeOut(frame, end, 10) }}>
      <Flare x={540} y={930} opacity={interpolate(frame, [2, 14, 60, 76], [0, 1, 0.8, 0], clamp)} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 22 }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 40,
            letterSpacing: interpolate(frame, [0, end], [14, 26], clamp),
            color: "rgba(255,255,255,0.75)",
            opacity: interpolate(frame, [6, 18], [0, 1], clamp),
          }}
        >
          МАРКАЗИ ТАЪЛИМИИ
        </div>
        <div
          style={{
            position: "relative",
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 170,
            lineHeight: 1,
            color: "transparent",
            backgroundImage: GOLD,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            opacity: interpolate(frame, [10, 22], [0, 1], clamp),
            scale: interpolate(frame, [10, end], [1.12, 1], { ...clamp, easing: easeOut }),
            filter: "drop-shadow(0 0 30px rgba(255,200,120,0.45))",
          }}
        >
          A+ KIDS
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(105deg, rgba(255,255,255,0) ${sweep - 10}%, rgba(255,255,255,0.9) ${sweep}%, rgba(255,255,255,0) ${sweep + 10}%)`,
              mixBlendMode: "overlay",
            }}
          />
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 40,
            letterSpacing: 16,
            color: "rgba(255,255,255,0.75)",
            opacity: interpolate(frame, [26, 38], [0, 1], clamp),
          }}
        >
          ПЕШКАШ МЕКУНАД
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Sunrise: a child walks to school. Freezes and drains of colour on "Аммо...". */
export const Morning: React.FC = () => {
  const frame = useCurrentFrame();
  const start = s(2.3);
  const freeze = s(T.but);
  const end = s(T.pain1);
  if (frame < start || frame >= end) return null;
  const f = Math.min(frame, freeze);
  const frozen = interpolate(frame, [freeze, freeze + 12], [0, 1], { ...clamp, easing: easeOut });
  const push = interpolate(frame, [start, end], [1, 1.18], clamp);
  const kidX = interpolate(f, [start, freeze], [-80, 300], clamp);
  return (
    <AbsoluteFill style={{ opacity: interpolate(frame, [start, start + 10], [0, 1], clamp) * fadeOut(frame, end, 3) }}>
      <AbsoluteFill style={{ scale: String(push), filter: `saturate(${1 - frozen * 0.8}) brightness(${1 - frozen * 0.25})` }}>
        <Sky warmth={interpolate(f, [start, freeze], [0.55, 1], clamp)} sunY={interpolate(f, [start, freeze], [1180, 1020], clamp)} />
        <GodRays x={540} y={interpolate(f, [start, freeze], [1180, 1020], clamp)} opacity={0.9} />
        <Bokeh colors={["#FFE2A8", "#FFB27A", "#9FD8FF"]} opacity={0.45} />
        <AbsoluteFill style={{ alignItems: "center", top: 1030 }}>
          <div style={{ opacity: 0.85, filter: "blur(1.5px)" }}>
            <School color="#3B2D5E" windowGlow={0.9} width={900} />
          </div>
        </AbsoluteFill>
        {/* ground */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1580, bottom: 0, background: "#140F24" }} />
        <div
          style={{
            position: "absolute",
            left: kidX,
            top: 1250,
            filter: "drop-shadow(0 0 22px rgba(255,190,120,0.8))",
          }}
        >
          <Kid color="#07050F" pack="#120C22" height={460} walk={f / 4.2} />
        </div>
        <Flare x={540} y={interpolate(f, [start, freeze], [1180, 1020], clamp)} opacity={0.7 * (1 - frozen)} />
      </AbsoluteFill>
      {/* freeze-frame cold tint + scan lines */}
      <AbsoluteFill style={{ backgroundColor: "rgba(40,70,140,0.35)", opacity: frozen, mixBlendMode: "multiply" }} />
      <AbsoluteFill
        style={{
          opacity: frozen * 0.25,
          background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px)",
        }}
      />
      {/* captions */}
      <AbsoluteFill style={{ opacity: fadeOut(frame, freeze, 5) }}>
        <Stack top={300} gap={4}>
          <FlipText at={s(T.oneDay)} text="ЯК РӮЗ..." size={58} weight={700} gradient={GOLD} sweep={false} style={{ letterSpacing: 12 }} />
          <FlipText at={s(T.child)} text="ФАРЗАНДИ ШУМО" size={90} glow="rgba(0,0,0,0.35)" />
          <FlipText at={s(T.toSchool)} text="БА МАКТАБ" size={118} gradient={GOLD} glow="rgba(255,170,90,0.45)" />
          <FlipText at={s(T.goes)} text="МЕРАВАД." size={118} gradient={GOLD} glow="rgba(255,170,90,0.45)" />
        </Stack>
      </AbsoluteFill>
      {frame >= freeze ? (
        <Stack top={300} gap={0}>
          <FlipText at={freeze} text="АММО..." size={70} weight={700} sweep={false} style={{ letterSpacing: 14, color: "#fff" }} />
          <FlipText at={s(T.isHe)} text="ОЁ Ӯ" size={110} />
          <FlipText at={s(T.ready)} text="ОМОДА" size={180} gradient={FIRE} glow="rgba(232,20,27,0.5)" />
          <FlipText at={s(T.ast)} text="АСТ?" size={150} />
        </Stack>
      ) : null}
    </AbsoluteFill>
  );
};

/** Midnight-blue stage with a spotlight cone. */
export const NightStage: React.FC<{ tint?: string }> = ({ tint = "60,110,200" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.midnight }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 45% at 50% 52%, rgba(${tint},0.38), rgba(0,0,0,0) 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `conic-gradient(from 168deg at 50% -8%, rgba(255,255,255,0) 0deg, rgba(190,220,255,0.16) 12deg, rgba(255,255,255,0) 24deg)`,
          opacity: 0.8 + Math.sin(frame / 9) * 0.1,
        }}
      />
      <Bokeh colors={["#5EA8FF", "#9C7CFF", "#FF7A7A"]} opacity={0.35} seed="n" count={18} />
    </AbsoluteFill>
  );
};

const LETTERS = Array.from("АБВГҒДЕЁЖЗИӢЙКҚЛМНОПРСТУӮФХҲЧҶШЪЭЮЯ");

const LetterTiles: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 200px)", gap: 26, perspective: 1000 }}>
      {new Array(6).fill(0).map((_, i) => {
        const a = i * 2;
        const flip = Math.floor(Math.max(0, t - a) / 4);
        const ch = LETTERS[Math.floor(random(`lt${i}-${flip}`) * LETTERS.length)];
        const ph = (Math.max(0, t - a) % 4) / 4;
        return (
          <div
            key={i}
            style={{
              width: 200,
              height: 200,
              borderRadius: 28,
              background: "linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04))",
              border: "2px solid rgba(255,255,255,0.22)",
              boxShadow: "0 30px 60px rgba(0,0,0,0.4), inset 0 0 40px rgba(100,160,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: 120,
              color: i % 2 ? "#fff" : C.red,
              rotate: `y ${Math.sin(ph * Math.PI) * 70}deg`,
              opacity: interpolate(t, [a, a + 5], [0, 1], clamp),
              translate: `0px ${interpolate(t, [a, a + 10], [80, 0], { ...clamp, easing: easeOut })}px`,
            }}
          >
            {ch}
          </div>
        );
      })}
    </div>
  );
};

const FallingNumbers: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  return (
    <div style={{ position: "relative", width: 900, height: 420 }}>
      <div style={{ position: "absolute", left: 40, right: 40, top: 230, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.35)" }} />
      {[1, 2, 3, 4, 5].map((n, i) => {
        const x = 70 + i * 170;
        const drop = 8 + i * 5 + random(`fn${i}`) * 6;
        const tt = Math.max(0, t - drop);
        const fall = i === 0 ? 0 : tt * tt * 1.6;
        return (
          <React.Fragment key={n}>
            <div style={{ position: "absolute", left: x + 40, top: 214, width: 6, height: 42, background: "rgba(255,255,255,0.5)" }} />
            <div
              style={{
                position: "absolute",
                left: x,
                top: 60 + fall,
                width: 90,
                textAlign: "center",
                fontFamily: DISPLAY,
                fontWeight: 900,
                fontSize: 130,
                lineHeight: 1,
                color: i === 0 ? "#fff" : i % 2 ? C.blue : C.yellow,
                rotate: `${i === 0 ? 0 : tt * (random(`fr${i}`) - 0.5) * 18}deg`,
                opacity: interpolate(t, [i * 2, i * 2 + 5], [0, 1], clamp) * interpolate(fall, [500, 900], [1, 0], clamp),
                filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.5))",
              }}
            >
              {n}
            </div>
          </React.Fragment>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 430,
          top: 40,
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: 150,
          color: C.red,
          opacity: interpolate(t, [30, 38], [0, 1], clamp),
          scale: interpolate(t, [30, 40], [2, 1], { ...clamp, easing: easeOut }),
        }}
      >
        ?
      </div>
    </div>
  );
};

const BigDoor: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  const open = interpolate(t, [0, 30], [0, 1], { ...clamp, easing: easeInOut });
  const tremble = Math.sin(frame * 2.3) * 2.5;
  return (
    <div style={{ position: "relative", width: 560, height: 560, perspective: 1200 }}>
      {/* light from the classroom */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 0,
          width: 360,
          height: 520,
          borderRadius: "180px 180px 0 0",
          background: "linear-gradient(180deg, #FFE7B8, #FFB060)",
          boxShadow: `0 0 ${60 + open * 80}px rgba(255,190,110,${0.4 + open * 0.4})`,
        }}
      />
      {/* door leaf */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 0,
          width: 360,
          height: 520,
          borderRadius: "180px 180px 0 0",
          background: "linear-gradient(90deg, #2A2350, #1A1538)",
          transformOrigin: "0% 50%",
          rotate: `y ${-open * 72}deg`,
          border: "4px solid rgba(255,255,255,0.15)",
        }}
      />
      {/* light spill on floor */}
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 515,
          width: 480,
          height: 200,
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,200,130,0.55), rgba(0,0,0,0) 70%)",
          opacity: open,
        }}
      />
      <div style={{ position: "absolute", left: 245, top: 395 + 0, translate: `${tremble}px 0px` }}>
        <Kid color="#0B0A1C" pack="#1B1736" height={140} walk={0} />
      </div>
    </div>
  );
};

const PainCard: React.FC<{
  at: number;
  end: number;
  index: string;
  top: string;
  bottom: string;
  bottomAt: number;
  art: React.ReactNode;
}> = ({ at, end, index, top, bottom, bottomAt, art }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame >= end) return null;
  const t = frame - at;
  return (
    <AbsoluteFill style={{ opacity: fadeOut(frame, end, 4) }}>
      <AbsoluteFill style={{ alignItems: "center", top: 300 }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 40,
            color: "#9FC4FF",
            letterSpacing: 10,
            opacity: interpolate(t, [0, 5], [0, 1], clamp),
          }}
        >
          {index} / 03
        </div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          top: -120,
          scale: interpolate(t, [0, end - at], [1, 1.07], clamp),
        }}
      >
        {art}
      </AbsoluteFill>
      <Stack top={1180} gap={0}>
        <FlipText at={at} text={top} size={104} gradient={ICE} />
        <FlipText at={bottomAt} text={bottom} size={112} gradient={FIRE} glow="rgba(232,20,27,0.45)" />
      </Stack>
    </AbsoluteFill>
  );
};

export const PainList: React.FC = () => (
  <>
    <PainCard at={s(T.pain1)} end={s(T.pain2)} index="01" top="ҲАРФҲОРО" bottom="НАМЕДОНАД" bottomAt={s(T.pain1b)} art={<LetterTiles at={s(T.pain1)} />} />
    <PainCard at={s(T.pain2)} end={s(T.pain3)} index="02" top="РАҚАМҲОРО" bottom="ГУМ МЕКУНАД" bottomAt={s(T.pain2b)} art={<FallingNumbers at={s(T.pain2)} />} />
    <PainCard at={s(T.pain3)} end={s(T.peers)} index="03" top="АЗ СИНФ" bottom="МЕТАРСАД" bottomAt={s(T.pain3b)} art={<BigDoor at={s(T.pain3)} />} />
  </>
);

/** Progress-bar race: peers fill up, our child is stuck. */
export const Race: React.FC = () => {
  const frame = useCurrentFrame();
  const start = s(T.peers);
  const end = s(T.question);
  if (frame < start || frame >= end) return null;
  const t = frame - start;
  const rows = [
    { name: "Ҳамсол 1", to: 92, col: C.green },
    { name: "Ҳамсол 2", to: 86, col: C.blue },
    { name: "Ҳамсол 3", to: 95, col: C.yellow },
  ];
  const stuck = interpolate(t, [0, 30], [0, 17], { ...clamp, easing: easeOut });
  const blink = frame > s(T.behind) ? (Math.floor(frame / 5) % 2 ? 1 : 0.35) : 1;
  return (
    <AbsoluteFill style={{ opacity: fadeOut(frame, end, 6) }}>
      <Stack top={290} gap={0}>
        <FlipText at={start} text="ҲАМСОЛОНАШ" size={100} gradient={ICE} />
        <FlipText at={s(T.ahead)} text="ПЕШ МЕРАВАНД..." size={100} gradient={ICE} />
      </Stack>
      <AbsoluteFill style={{ alignItems: "center", top: 640 }}>
        <div
          style={{
            width: 900,
            padding: "44px 46px",
            borderRadius: 40,
            background: "linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))",
            border: "2px solid rgba(255,255,255,0.18)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.45)",
            display: "flex",
            flexDirection: "column",
            gap: 34,
            translate: `0px ${interpolate(t, [0, 14], [80, 0], { ...clamp, easing: easeOut })}px`,
            opacity: interpolate(t, [0, 8], [0, 1], clamp),
          }}
        >
          {rows.map((r, i) => {
            const v = interpolate(t, [4 + i * 3, 70 + i * 6], [0, r.to], { ...clamp, easing: easeInOut });
            return (
              <Bar key={r.name} label={r.name} value={v} color={r.col} />
            );
          })}
          <div style={{ height: 2, background: "rgba(255,255,255,0.15)" }} />
          <div style={{ opacity: blink }}>
            <Bar label="Фарзанди шумо" value={stuck} color={C.red} bold />
          </div>
        </div>
      </AbsoluteFill>
      <Stack top={1260} gap={0}>
        <FlipText at={s(T.andHe)} text="...ВА Ӯ" size={70} weight={700} sweep={false} style={{ color: "#B9C3D9" }} />
        <FlipText at={s(T.behind)} text="АҚИБ МЕМОНАД." size={112} gradient={FIRE} glow="rgba(232,20,27,0.5)" />
      </Stack>
    </AbsoluteFill>
  );
};

const Bar: React.FC<{ label: string; value: number; color: string; bold?: boolean }> = ({ label, value, color, bold }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: DISPLAY, fontWeight: bold ? 900 : 700, fontSize: bold ? 44 : 38, color: "#fff" }}>
      <span>{label}</span>
      <span style={{ color }}>{Math.round(value)}%</span>
    </div>
    <div style={{ height: bold ? 34 : 26, borderRadius: 20, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          borderRadius: 20,
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
          boxShadow: `0 0 24px ${color}`,
        }}
      />
    </div>
  </div>
);


/** "Оё шумо ҳамин ояндаро барои фарзандатон мехоҳед?" — a lone child under a spotlight. */
export const Question: React.FC = () => {
  const frame = useCurrentFrame();
  const start = s(T.question);
  const end = s(T.no) - 8;
  if (frame < start || frame >= end) return null;
  return (
    <AbsoluteFill style={{ opacity: interpolate(frame, [start, start + 6], [0, 1], clamp) * fadeOut(frame, end, 4) }}>
      <AbsoluteFill style={{ backgroundColor: "#05070F" }} />
      <AbsoluteFill
        style={{
          background: "conic-gradient(from 166deg at 50% -6%, rgba(255,255,255,0) 0deg, rgba(220,230,255,0.22) 14deg, rgba(255,255,255,0) 28deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 340,
          top: 1520,
          width: 400,
          height: 70,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(220,230,255,0.35), rgba(0,0,0,0) 70%)",
        }}
      />
      <div style={{ position: "absolute", left: 470, top: 1250, scale: String(interpolate(frame, [start, end], [1, 1.06], clamp)) }}>
        <Kid color="#0E1224" pack="#1C2240" height={290} walk={0} />
      </div>
      <Stack top={300} gap={0} style={{ scale: String(interpolate(frame, [start, end], [1, 1.05], clamp)) }}>
        <FlipText at={start} text="ОЁ ШУМО" size={96} gradient={ICE} />
        <FlipText at={s(T.q2)} text="ҲАМИН ОЯНДАРО" size={80} gradient={ICE} />
        <FlipText at={s(T.q3)} text="БАРОИ ФАРЗАНДАТОН" size={66} gradient={ICE} />
        <FlipText at={s(T.q4)} text="МЕХОҲЕД?" size={130} gradient={FIRE} glow="rgba(232,20,27,0.5)" />
      </Stack>
    </AbsoluteFill>
  );
};
