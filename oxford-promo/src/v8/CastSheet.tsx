import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { RenHD } from "../v7/RenHD";
import type { Pose } from "../v7/RenHD";
import { ChibiFoxHD, FoxHD, ReporterHD } from "./Cast";

const POSES: Pose[] = ["wide", "throw", "fall", "seal", "thumbs", "point"];

export const CastSheet: React.FC = () => {
  const t = useCurrentFrame() / 30;
  return (
    <AbsoluteFill style={{ background: "#E9EBF2" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {POSES.map((p, i) => (
          <g key={p} transform={`translate(${110 + (i % 3) * 330} ${560 + Math.floor(i / 3) * 560}) scale(0.3)`}>
            <RenHD t={t} pose={p} id={`p${i}`} mouth={i === 4 ? "grin" : i === 2 ? "shout" : "grit"} power={i === 3 ? 1 : 0} hurt={i === 2} />
          </g>
        ))}
        <g transform="translate(300 1900) scale(0.42)">
          <FoxHD t={t} roar={1} />
        </g>
        <g transform="translate(800 1900) scale(0.62)">
          <ReporterHD t={t} talk />
        </g>
        <g transform="translate(980 1880) scale(0.6)">
          <ChibiFoxHD t={t} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
