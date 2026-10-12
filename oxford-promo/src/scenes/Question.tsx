import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MaskLine } from "../components/SplitText";
import { BACK, COLORS, DISPLAY, EASE_IN, ip } from "../theme";

export const Question: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = ip(frame, [72, 96], [1, 9], EASE_IN);
  const fill = ip(frame, [18, 42], [100, 0]);
  const eight: React.CSSProperties = {
    position: "absolute",
    fontFamily: DISPLAY,
    fontWeight: 900,
    fontSize: 1150,
    lineHeight: 1,
  };
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: String(ip(frame, [0, 26], [0.5, 1], BACK) * zoom),
          rotate: `${ip(frame, [0, 26], [-14, 0], BACK)}deg`,
          opacity: ip(frame, [0, 8], [0, 1]) * ip(frame, [84, 96], [1, 0]),
          translate: `0px 40px`,
        }}
      >
        <div style={{ ...eight, color: "transparent", WebkitTextStroke: `5px ${COLORS.gold}` }}>8</div>
        <div
          style={{
            ...eight,
            color: COLORS.gold,
            clipPath: `inset(${fill}% 0 0 0)`,
            textShadow: `0 0 120px ${COLORS.gold}88`,
          }}
        >
          8
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 170,
          width: "100%",
          textAlign: "center",
          opacity: ip(frame, [66, 78], [1, 0]),
        }}
      >
        <MaskLine start={8}>
          <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 84, color: COLORS.white }}>
            Где откроется
          </span>
        </MaskLine>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 190,
          width: "100%",
          textAlign: "center",
          opacity: ip(frame, [66, 78], [1, 0]),
        }}
      >
        <MaskLine start={18}>
          <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 84, color: COLORS.white }}>
            филиал <span style={{ color: COLORS.gold }}>Oxford</span>?
          </span>
        </MaskLine>
      </div>
    </AbsoluteFill>
  );
};
