import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { RenHD } from "./RenHD";
import { DISPLAY } from "../theme";

const Portrait: React.FC<{ y: number; t: number; power?: number; id: string; label: string }> = ({ y, t, power, id, label }) => (
  <g>
    <defs>
      <clipPath id={`${id}-frame`}>
        <rect x={640} y={y} width={400} height={480} rx={18} />
      </clipPath>
    </defs>
    <rect x={640} y={y} width={400} height={480} rx={18} fill={power ? "#2A0A10" : "#EEF0F6"} />
    <g clipPath={`url(#${id}-frame)`}>
      <g transform={`translate(840 ${y + 250}) scale(2.1) translate(0 1520)`}>
        <RenHD t={t} power={power} id={id} />
      </g>
    </g>
    <rect x={640} y={y} width={400} height={480} rx={18} fill="none" stroke="#1E1517" strokeWidth={5} />
    <text x={644} y={y + 520} fontFamily={DISPLAY} fontWeight={800} fontSize={30} fill={power ? "#FF4A5C" : "#1E1517"}>
      {label}
    </text>
  </g>
);

export const RenSheet: React.FC = () => {
  const t = useCurrentFrame() / 30;
  return (
    <AbsoluteFill style={{ background: "#FFFFFF" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <text x={50} y={110} fontFamily={DISPLAY} fontWeight={900} fontSize={84} fill="#1E1517">
          REN
        </text>
        <text x={54} y={160} fontFamily={DISPLAY} fontWeight={600} fontSize={28} fill="#C9283B">
          OXFORD SHINOBI · character sheet
        </text>
        <g transform="translate(320 1860) scale(0.93)">
          <RenHD t={t} id="full" />
        </g>
        <Portrait y={260} t={t} id="p1" label="NORMAL" />
        <Portrait y={820} t={t} power={1} id="p2" label="EYE OF KNOWLEDGE" />
      </svg>
    </AbsoluteFill>
  );
};
