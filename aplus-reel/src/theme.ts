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
export const DURATION_S = 55.5;

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

// Word onsets from an ElevenLabs Scribe transcript of public/vo2.mp3, in VO seconds.
const VO = {
  oneDay: 0.14,
  child: 1.38,
  toSchool: 2.28,
  goes: 2.84,
  but: 4.16,
  isHe: 5.22,
  ready: 6.08,
  ast: 6.62,
  pain1: 8.3,
  pain1b: 8.8,
  pain2: 9.8,
  pain2b: 10.42,
  pain3: 11.48,
  pain3b: 12.04,
  peers: 13.14,
  ahead: 13.92,
  andHe: 15.3,
  behind: 15.66,
  question: 17.64,
  q2: 18.52,
  q3: 19.36,
  q4: 20.28,
  no: 21.82,
  center: 22.74,
  learning: 23.22,
  aplus: 23.76,
  course: 24.58,
  forSchool: 25.28,
  english: 26.4,
  russian: 27.76,
  math: 29.0,
  world: 30.2,
  reading: 31.42,
  writing: 32.4,
  logic: 33.5,
  confidence: 34.54,
  yourChild: 36.26,
  toSchool2: 37.34,
  notFear: 37.9,
  fear: 38.26,
  but2: 39.04,
  smile: 40.06,
  goes2: 40.72,
  seats: 42.2,
  seats2: 42.6,
  enroll: 43.64,
  brand: 45.36,
  tag1: 46.78,
  tag2: 47.92,
};

// Cues in composition seconds; text lands on the frame the word starts.
const LEAD = 0;
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
  ...[T.english, T.russian, T.math, T.world, T.reading, T.writing, T.logic].map((t) => ({ t, power: 6 })),
  { t: T.confidence, power: 10 },
  { t: T.enroll, power: 8 },
  { t: T.brand, power: 18 },
];
