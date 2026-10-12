import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { REASONS } from "../data/branches";
import { MaskLine } from "../components/SplitText";
import { BODY, COLORS, DISPLAY, EASE_IN, EASE_IN_OUT, EASE_OUT, ip } from "../theme";

const CARD_AT = 36;
const CARD_GAP = 42;

export const Reasons: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = ip(frame, [228, 250], [0, 1], EASE_IN);
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, scale: String(1 - exit * 0.06) }}>
      <div style={{ position: "absolute", top: 190, left: 90, right: 90 }}>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 32, letterSpacing: 10, color: COLORS.gold, opacity: ip(frame, [0, 14], [0, 1]) }}>
          ФИЛИАЛ №8 · ШОХМАНСУР
        </div>
        <div style={{ height: 24 }} />
        <MaskLine start={6}>
          <span style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 96, color: COLORS.white, lineHeight: 1.1 }}>Почему</span>
        </MaskLine>
        <MaskLine start={12}>
          <span style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 96, color: COLORS.gold, lineHeight: 1.1 }}>именно здесь?</span>
        </MaskLine>
      </div>

      {REASONS.map((r, i) => {
        const s = CARD_AT + i * CARD_GAP;
        const p = ip(frame, [s, s + 22], [0, 1], EASE_OUT);
        const value = Math.round(ip(frame, [s + 6, s + 40], [r.from, r.to], EASE_IN_OUT));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 80,
              right: 80,
              top: 640 + i * 360,
              height: 320,
              borderRadius: 36,
              padding: "36px 44px",
              background: "linear-gradient(135deg, rgba(27,63,143,0.55), rgba(5,12,28,0.7))",
              border: "2px solid rgba(94,168,255,0.28)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 10,
              opacity: p,
              translate: `${(1 - p) * 420}px 0px`,
              rotate: `${(1 - p) * 6}deg`,
              overflow: "hidden",
            }}
          >
            {/* shine sweep */}
            <div
              style={{
                position: "absolute",
                top: -100,
                bottom: -100,
                width: 160,
                left: ip(frame, [s + 14, s + 40], [-300, 1100]),
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
                rotate: "18deg",
              }}
            />
            <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
              <span style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 112, color: COLORS.gold, lineHeight: 1, fontVariantNumeric: "tabular-nums", textShadow: `0 0 40px ${COLORS.gold}55` }}>
                {r.prefix}
                {value}
                {r.suffix}
              </span>
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, color: COLORS.white, lineHeight: 1.2 }}>{r.title}</div>
            <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 34, color: COLORS.mute, lineHeight: 1.3 }}>{r.text}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
