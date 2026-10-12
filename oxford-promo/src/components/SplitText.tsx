import React from "react";
import { useCurrentFrame } from "remotion";
import { BACK, EASE_OUT, ip } from "../theme";

type Props = {
  text: string;
  start: number;
  stagger?: number;
  duration?: number;
  mode?: "drop" | "rise" | "blur";
  style?: React.CSSProperties;
  charStyle?: (i: number) => React.CSSProperties;
};

/** Per-letter reveal, the bread and butter of kinetic type. */
export const SplitText: React.FC<Props> = ({
  text,
  start,
  stagger = 2,
  duration = 18,
  mode = "rise",
  style,
  charStyle,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", justifyContent: "center", whiteSpace: "pre", ...style }}>
      {text.split("").map((ch, i) => {
        const s = start + i * stagger;
        const p = ip(frame, [s, s + duration], [0, 1], mode === "drop" ? BACK : EASE_OUT);
        const o = ip(frame, [s, s + duration * 0.6], [0, 1]);
        const blur = ip(frame, [s, s + duration], [mode === "blur" ? 24 : 10, 0]);
        const tr =
          mode === "drop"
            ? `0px ${(1 - p) * -90}px`
            : mode === "rise"
              ? `0px ${(1 - p) * 80}px`
              : "0px 0px";
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: o,
              translate: tr,
              scale: mode === "blur" ? String(1 + (1 - p) * 1.4) : String(0.6 + 0.4 * p),
              filter: `blur(${blur}px)`,
              ...(charStyle ? charStyle(i) : {}),
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** Text that slides up from behind a mask line. */
export const MaskLine: React.FC<{
  start: number;
  end?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ start, end, children, style }) => {
  const frame = useCurrentFrame();
  const inP = ip(frame, [start, start + 20], [140, 0], EASE_OUT);
  const outP = end === undefined ? 0 : ip(frame, [end, end + 14], [0, -110], EASE_OUT);
  return (
    <div style={{ overflow: "hidden", paddingBottom: 8, ...style }}>
      <div style={{ translate: `0px ${inP + outP}%` }}>{children}</div>
    </div>
  );
};
