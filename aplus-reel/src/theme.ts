import { Easing, continueRender, delayRender, staticFile } from "remotion";
import faces from "./fonts.json";

// Fonts are bundled locally (public/fonts) so rendering works offline.
const fontHandle = delayRender("Loading fonts");
Promise.all(
  faces.map((f) => {
    const face = new FontFace(f.family, `url(${staticFile(`fonts/${f.file}`)}) format("woff2")`, {
      weight: f.weight,
      unicodeRange: f.range,
    });
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(fontHandle));

export const DISPLAY = "Montserrat, DejaVu Sans, sans-serif";
export const MONO = "'Fira Mono', monospace";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION_S = 47;

// Voiceover starts after a 2.5 s "A+ presents" cold open.
export const VO_OFFSET = 2.5;

// Brand colours sampled from the A+ kids logo.
export const C = {
  blue: "#4BB6E3",
  red: "#E8141B",
  orange: "#F7731C",
  yellow: "#FFC20E",
  navy: "#16203D",
  midnight: "#0B1430",
  paper: "#FFFDF7",
  ink: "#0A0A0D",
  ash: "#8A8F99",
  gold: "#FFD68A",
  green: "#3DD68C",
};

export const s = (seconds: number) => Math.round(seconds * FPS);

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const punch = Easing.bezier(0.2, 0.9, 0.1, 1);

// Word onsets measured from the voiceover waveform (10 ms resolution), in VO seconds.
const VO = {
  oneDay: 0.16,
  child: 1.06,
  toSchool: 2.26,
  goes: 2.72,
  but: 4.37,
  ready: 4.75,
  pain1: 6.07,
  pain2: 7.79,
  pain3: 9.91,
  pain3b: 10.59,
  peers: 12.03,
  ahead: 12.82,
  andHe: 14.77,
  behind: 15.83,
  no: 18.25,
  center: 19.26,
  aplus: 21.05,
  course: 22.83,
  forSchool: 23.71,
  reading: 24.68,
  writing: 25.38,
  math: 26.45,
  logic: 27.0,
  confidence: 28.07,
  yourChild: 29.0,
  toSchool2: 30.35,
  notFear: 31.3,
  fear: 31.8,
  but2: 33.0,
  smile: 33.4,
  goes2: 34.25,
  seats: 35.79,
  seats2: 36.2,
  enroll: 36.99,
  brand: 38.07,
};

// Cues in composition seconds; text lands one frame before the syllable.
const LEAD = 1 / FPS;
export const T = Object.fromEntries(
  Object.entries(VO).map(([k, v]) => [k, v + VO_OFFSET - LEAD]),
) as Record<keyof typeof VO, number>;

// Moments that kick the virtual camera.
export const HITS: { t: number; power: number }[] = [
  { t: 0.15, power: 10 },
  { t: T.oneDay, power: 8 },
  { t: T.pain1, power: 14 },
  { t: T.pain2, power: 14 },
  { t: T.pain3, power: 16 },
  { t: T.no, power: 46 },
  { t: T.aplus, power: 16 },
  { t: T.reading, power: 6 },
  { t: T.writing, power: 6 },
  { t: T.math, power: 6 },
  { t: T.logic, power: 6 },
  { t: T.confidence, power: 10 },
  { t: T.enroll, power: 8 },
  { t: T.brand, power: 18 },
];
