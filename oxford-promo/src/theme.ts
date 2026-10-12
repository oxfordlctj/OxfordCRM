import { loadFont } from "@remotion/fonts";
import { Easing, interpolate, staticFile } from "remotion";

export const COLORS = {
  ink: "#050C1C",
  navy: "#0A1A3A",
  royal: "#1B3F8F",
  sky: "#5EA8FF",
  river: "#3CC8FF",
  gold: "#F5B935",
  goldSoft: "#FFD978",
  white: "#F4F7FF",
  mute: "#8FA3C8",
};

export const DISPLAY = "Unbounded, 'Arial Black', sans-serif";
export const BODY = "Manrope, 'Helvetica Neue', Arial, sans-serif";

const LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const CYRILLIC = "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116";

for (const family of ["Unbounded", "Manrope"]) {
  loadFont({
    family,
    url: staticFile(`fonts/${family}-latin.woff2`),
    weight: "200 900",
    unicodeRange: LATIN,
  });
  loadFont({
    family,
    url: staticFile(`fonts/${family}-cyrillic.woff2`),
    weight: "200 900",
    unicodeRange: CYRILLIC,
  });
}

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

/** Clamped interpolate with an ease-out default. */
export const ip = (
  frame: number,
  input: number[],
  output: number[],
  easing: (t: number) => number = EASE_OUT,
) =>
  interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
