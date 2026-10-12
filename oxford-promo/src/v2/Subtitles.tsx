import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BODY, COLORS, ip } from "../theme";
import { SUBTITLES, VO } from "./timeline";

/** Russian subtitles for the English voice-over. */
export const Subtitles: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const cur = SUBTITLES.find((s) => t >= VO[s.key] - 0.1 && t <= VO[s.key] + s.dur + 0.25);
  if (!cur) return null;
  const s = VO[cur.key];
  const o = ip(t, [s - 0.1, s + 0.1, s + cur.dur + 0.05, s + cur.dur + 0.25], [0, 1, 1, 0]);
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          bottom: 130,
          maxWidth: 900,
          textAlign: "center",
          padding: "12px 26px",
          borderRadius: 16,
          background: "rgba(3,8,20,0.55)",
          fontFamily: BODY,
          fontWeight: 700,
          fontSize: 40,
          lineHeight: 1.25,
          color: COLORS.white,
          opacity: o,
          translate: `0px ${(1 - o) * 10}px`,
        }}
      >
        {cur.text}
      </div>
    </AbsoluteFill>
  );
};
