import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Rise, Slam, Typewriter, fadeOut } from "../fx";
import { C, DISPLAY, MONO, T, clamp, easeIn, easeOut, s } from "../theme";

const Center: React.FC<{ children: React.ReactNode; gap?: number; style?: React.CSSProperties }> = ({
  children,
  gap = 10,
  style,
}) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      gap,
      padding: "0 90px",
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Dark stage with drifting dust and a slow push-in. */
export const DarkStage: React.FC = () => {
  const frame = useCurrentFrame();
  const end = s(T.blackout);
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 38%, rgba(70,90,130,0.35), rgba(0,0,0,0) 60%),
             radial-gradient(circle at 50% 100%, rgba(232,20,27,${interpolate(frame, [0, end], [0.05, 0.32], clamp)}), rgba(0,0,0,0) 55%)`,
          scale: interpolate(frame, [0, end], [1, 1.15], clamp),
        }}
      />
      {new Array(40).fill(0).map((_, i) => {
        const x = random(`dx${i}`) * 1080;
        const y0 = random(`dy${i}`) * 1920;
        const sp = 0.3 + random(`ds${i}`) * 0.9;
        const y = (y0 - frame * sp + 1920 * 4) % 1920;
        const r = 1.5 + random(`dr${i}`) * 3.5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(frame / 40 + i) * 14,
              top: y,
              width: r,
              height: r,
              borderRadius: r,
              backgroundColor: "rgba(255,255,255,0.45)",
              filter: "blur(1px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** "Як рӯз... фарзанди шумо ба мактаб меравад." */
export const OneDay: React.FC = () => {
  const frame = useCurrentFrame();
  const end = s(T.but) - 2;
  return (
    <Center gap={18} style={{ opacity: fadeOut(frame, end, 8) }}>
      <Rise at={s(T.oneDay)} size={54} weight={600} tracking={18} color="rgba(255,255,255,0.7)">
        ЯК РӮЗ...
      </Rise>
      <Rise at={s(T.child)} size={96} weight={800}>
        ФАРЗАНДИ ШУМО
      </Rise>
      <Slam at={s(T.toSchool)} size={128} color="#fff">
        БА МАКТАБ
      </Slam>
      <Slam at={s(T.goes)} size={128} color={C.blue}>
        МЕРАВАД.
      </Slam>
    </Center>
  );
};

/** "Аммо... оё ӯ ОМОДА аст?" */
export const ButReady: React.FC = () => {
  const frame = useCurrentFrame();
  const start = s(T.but);
  const end = s(T.pain1) - 1;
  return (
    <AbsoluteFill style={{ opacity: fadeOut(frame, end, 4) }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 1300,
            color: C.red,
            opacity: interpolate(frame, [start, start + 20], [0, 0.18], clamp),
            scale: interpolate(frame, [start, end], [0.9, 1.15], clamp),
            lineHeight: 1,
          }}
        >
          ?
        </div>
      </AbsoluteFill>
      <Center gap={16}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 64,
            color: "rgba(255,255,255,0.75)",
            opacity: interpolate(frame, [start, start + 6], [0, 1], clamp),
            letterSpacing: interpolate(frame, [start, end], [8, 34], clamp),
          }}
        >
          АММО...
        </div>
        <Rise at={s(T.isHe)} size={92}>
          ОЁ Ӯ
        </Rise>
        <Slam at={s(T.ready)} size={180} color={C.red}>
          ОМОДА
        </Slam>
        <Slam at={s(T.ready) + 6} size={150}>
          АСТ?
        </Slam>
      </Center>
    </AbsoluteFill>
  );
};

const Scatter: React.FC<{ at: number; glyphs: string[]; mode: "fall" | "drift" }> = ({ at, glyphs, mode }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - at);
  return (
    <AbsoluteFill>
      {glyphs.map((g, i) => {
        const x0 = 140 + random(`gx${g}${i}`) * 800;
        const y0 = 330 + random(`gy${g}${i}`) * 1250;
        const rot0 = (random(`gr${g}${i}`) - 0.5) * 50;
        const avoidMid = y0 > 760 && y0 < 1160 ? (y0 < 960 ? -260 : 260) : 0;
        const vy = mode === "fall" ? t * t * 0.05 : -t * 1.2;
        const vx = mode === "drift" ? (random(`gv${i}`) - 0.5) * t * 6 : 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x0 + vx,
              top: y0 + avoidMid + vy,
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: 90 + random(`gs${i}`) * 90,
              color: "rgba(255,255,255,0.13)",
              rotate: `${rot0 + (mode === "fall" ? t * 1.5 : t * (random(`gw${i}`) - 0.5) * 6)}deg`,
              opacity: interpolate(t, [0, 6], [0, 1], clamp),
            }}
          >
            {g}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const PainCard: React.FC<{
  at: number;
  end: number;
  index: string;
  top: string;
  bottom: string;
  scatter?: { glyphs: string[]; mode: "fall" | "drift" };
  tremble?: boolean;
}> = ({ at, end, index, top, bottom, scatter, tremble }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame >= end) return null;
  const t = frame - at;
  const jitter = tremble ? Math.sin(frame * 2.7) * 5 * interpolate(t, [6, 20], [0, 1], clamp) : 0;
  const strike = interpolate(frame, [at + 14, at + 24], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill style={{ opacity: fadeOut(frame, end, 4) }}>
      {scatter ? <Scatter at={at} glyphs={scatter.glyphs} mode={scatter.mode} /> : null}
      <Center gap={6}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 44,
            color: C.red,
            letterSpacing: 10,
            marginBottom: 26,
            opacity: interpolate(t, [0, 4], [0, 1], clamp),
          }}
        >
          {index} / 03
        </div>
        <Slam at={at} size={118} style={{ translate: `${jitter}px 0px` }}>
          {top}
        </Slam>
        <div style={{ position: "relative" }}>
          <Slam at={at + 4} size={118} color={C.red} style={{ translate: `${-jitter}px 0px` }}>
            {bottom}
          </Slam>
          {tremble ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                fontFamily: DISPLAY,
                fontWeight: 900,
                fontSize: 118,
                lineHeight: 1.02,
                textAlign: "center",
                color: C.blue,
                mixBlendMode: "screen",
                opacity: interpolate(t, [8, 12], [0, 0.55], clamp),
                translate: `${jitter * 2.5 + 6}px ${-jitter}px`,
              }}
            >
              {bottom}
            </div>
          ) : (
            <div
              style={{
                position: "absolute",
                left: "-4%",
                top: "52%",
                height: 14,
                borderRadius: 7,
                width: `${strike * 108}%`,
                backgroundColor: "#fff",
                rotate: "-3deg",
                boxShadow: "0 0 30px rgba(255,255,255,0.6)",
              }}
            />
          )}
        </div>
      </Center>
    </AbsoluteFill>
  );
};

export const PainList: React.FC = () => (
  <>
    <PainCard
      at={s(T.pain1)}
      end={s(T.pain2)}
      index="01"
      top="ҲАРФҲОРО"
      bottom="НАМЕДОНАД"
      scatter={{ glyphs: ["А", "Б", "Ҷ", "Ӯ", "Ғ", "Қ", "Ҳ", "Д", "Ӣ"], mode: "fall" }}
    />
    <PainCard
      at={s(T.pain2)}
      end={s(T.pain3)}
      index="02"
      top="РАҚАМҲОРО"
      bottom="ГУМ МЕКУНАД"
      scatter={{ glyphs: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], mode: "drift" }}
    />
    <PainCard at={s(T.pain3)} end={s(T.peers) - 1} index="03" top="АЗ СИНФ" bottom="МЕТАРСАД" tremble />
  </>
);

/** Peers race ahead, one child falls behind. */
export const FallBehind: React.FC = () => {
  const frame = useCurrentFrame();
  const start = s(T.peers);
  const end = s(T.question) - 1;
  if (frame < start || frame >= end) return null;
  const t = frame - start;
  const dots = [C.blue, C.yellow, C.orange, C.blue, C.yellow];
  return (
    <AbsoluteFill style={{ opacity: fadeOut(frame, end, 6) }}>
      {/* race lane */}
      <div
        style={{
          position: "absolute",
          top: 1395,
          left: 90,
          right: 90,
          height: 2,
          backgroundColor: "rgba(255,255,255,0.15)",
        }}
      />
      {dots.map((col, i) => {
        const x = interpolate(t, [0, end - start], [140 + i * 70, 760 + i * 60], { ...clamp, easing: easeIn });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 1360 + (i % 2) * 8,
              left: x,
              width: 54,
              height: 54,
              borderRadius: 27,
              backgroundColor: col,
              opacity: 0.85,
              boxShadow: `0 0 30px ${col}`,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          top: 1356,
          left: interpolate(t, [0, end - start], [110, 170], clamp),
          width: 62,
          height: 62,
          borderRadius: 31,
          backgroundColor: C.red,
          boxShadow: `0 0 40px ${C.red}`,
          opacity: interpolate(frame, [s(T.behind), s(T.behind) + 20], [1, 0.45], clamp),
        }}
      />
      <Center gap={8} style={{ justifyContent: "flex-start", paddingTop: 470 }}>
        <div
          style={{
            translate: interpolate(frame, [start, end], ["0px 0px", "0px -90px"], clamp),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Slam at={start} size={110}>
            ҲАМСОЛОНАШ
          </Slam>
          <Slam at={s(T.ahead)} size={110} color={C.blue}>
            ПЕШ МЕРАВАНД...
          </Slam>
        </div>
        <div
          style={{
            marginTop: 120,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            translate: interpolate(frame, [s(T.andHe), end], ["0px 0px", "0px 70px"], clamp),
            scale: interpolate(frame, [s(T.andHe), end], [1, 0.9], clamp),
          }}
        >
          <Rise at={s(T.andHe)} size={70} weight={600} color={C.ash}>
            ...ВА Ӯ
          </Rise>
          <Slam at={s(T.behind)} size={120} color={C.red}>
            АҚИБ МЕМОНАД.
          </Slam>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

/** "Оё шумо ҳамин ояндаро мехоҳед?" — typed out, then cut to black. */
export const Question: React.FC = () => {
  const frame = useCurrentFrame();
  const start = s(T.question);
  const end = s(T.blackout);
  if (frame < start || frame >= end) return null;
  return (
    <Center>
      <div style={{ scale: interpolate(frame, [start, end], [1, 1.08], clamp) }}>
        <Typewriter at={start} text={"ОЁ ШУМО\nҲАМИН ОЯНДАРО\nМЕХОҲЕД?"} size={104} cps={24} />
      </div>
    </Center>
  );
};
