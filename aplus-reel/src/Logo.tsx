import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, MONO, clamp, easeOut } from "./theme";

/**
 * The A+ kids mark, rebuilt as vector strokes so it can be drawn on.
 * `at` is the frame the build starts; `fast` compresses the build for the end card.
 */
export const Logo: React.FC<{ at: number; size: number; showKids?: boolean; fast?: boolean }> = ({
  at,
  size,
  showKids = true,
  fast = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = fast ? 0.6 : 1;
  const f = (n: number) => at + Math.round(n * k);

  const draw = interpolate(frame, [f(0), f(14)], [1, 0], { ...clamp, easing: easeOut });
  const bar = interpolate(frame, [f(8), f(14)], [1, 0], { ...clamp, easing: easeOut });
  const sp = (d: number) =>
    spring({ frame: frame - f(d), fps, config: { damping: 11, stiffness: 160, mass: 0.7 } });
  const red = sp(10);
  const yellow = sp(14);
  const orange = interpolate(frame, [f(16), f(26)], [1, 0], { ...clamp, easing: easeOut });
  const orangeOn = frame >= f(16) ? 1 : 0;

  const W = 22; // white separation outline

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size} viewBox="230 30 540 540" style={{ overflow: "visible" }}>
        <g strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* A */}
          <path
            d="M300 505 L470 82 L548 272"
            stroke={C.blue}
            strokeWidth={88}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={draw}
          />
          <path
            d="M405 388 L480 388"
            stroke={C.blue}
            strokeWidth={70}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={bar}
          />
          {/* red stroke — right leg continuation */}
          <g
            style={{
              transformOrigin: "548px 272px",
              transformBox: "view-box",
              scale: String(red),
              opacity: red > 0.01 ? 1 : 0,
            }}
          >
            <path d="M548 272 L602 350" stroke="#fff" strokeWidth={80 + W} />
            <path d="M548 272 L602 350" stroke={C.red} strokeWidth={80} />
          </g>
          {/* yellow bar */}
          <g
            style={{
              translate: `${(1 - yellow) * 260}px 0px`,
              opacity: interpolate(yellow, [0, 0.2], [0, 1], clamp),
            }}
          >
            <path d="M575 386 L705 386" stroke={C.yellow} strokeWidth={80} />
          </g>
          {/* orange hook */}
          <g style={{ opacity: orangeOn }}>
            <path
              d="M462 388 L585 388 L640 505"
              stroke="#fff"
              strokeWidth={86 + W}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={orange}
            />
            <path
              d="M462 388 L585 388 L640 505"
              stroke={C.orange}
              strokeWidth={86}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={orange}
            />
          </g>
        </g>
      </svg>
      {showKids ? (
        <div
          style={{
            display: "flex",
            gap: size * 0.11,
            marginTop: -size * 0.02,
            fontFamily: MONO,
            fontWeight: 500,
            fontSize: size * 0.32,
            lineHeight: 1,
          }}
        >
          {(["k", "i", "d", "s"] as const).map((ch, i) => {
            const p = sp(24 + i * 3);
            return (
              <span
                key={ch}
                style={{
                  color: [C.red, C.orange, C.blue, C.yellow][i],
                  display: "inline-block",
                  opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
                  translate: `0px ${(1 - p) * 80}px`,
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
