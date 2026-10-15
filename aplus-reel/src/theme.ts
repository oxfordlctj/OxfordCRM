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
export const DURATION_S = 44.5;

// Voiceover starts this many seconds into the composition (room for the opening boom).
export const VO_OFFSET = 0.5;

// Brand colours sampled from the A+ kids logo.
export const C = {
  blue: "#4BB6E3",
  red: "#E8141B",
  orange: "#F7731C",
  yellow: "#FFC20E",
  navy: "#16203D",
  paper: "#FFFDF7",
  ink: "#0A0A0D",
  ash: "#8A8F99",
};

export const s = (seconds: number) => Math.round(seconds * FPS);

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
export const punch = Easing.bezier(0.2, 0.9, 0.1, 1);

// Every cue below is in composition seconds, already synced to the voiceover take.
export const T = {
  // ACT 1 — the pain
  oneDay: 0.6,
  child: 1.7,
  toSchool: 2.7,
  goes: 3.1,
  but: 4.8,
  isHe: 5.2,
  ready: 5.35,
  pain1: 6.5,
  pain2: 8.3,
  pain3: 10.4,
  peers: 12.5,
  ahead: 13.4,
  andHe: 15.2,
  behind: 15.6,
  question: 16.35,
  blackout: 18.45,
  // DROP
  no: 18.7,
  // ACT 2 — the solution
  center: 19.7,
  learning: 20.3,
  logo: 21.6,
  course: 23.3,
  forSchool: 24.3,
  skills: [25.2, 25.9, 26.9, 27.35, 28.5],
  yourChild: 29.5,
  toSchool2: 30.9,
  notFear: 31.8,
  strike: 32.7,
  but2: 33.5,
  smile: 33.7,
  goes2: 34.7,
  seats: 36.3,
  seats2: 36.6,
  enroll: 37.5,
  end: 38.6,
};

// Moments that kick the virtual camera.
export const HITS: { t: number; power: number }[] = [
  { t: 0, power: 22 },
  { t: T.but, power: 8 },
  { t: T.pain1, power: 16 },
  { t: T.pain2, power: 16 },
  { t: T.pain3, power: 18 },
  { t: T.peers, power: 10 },
  { t: T.andHe, power: 10 },
  { t: T.no, power: 46 },
  { t: T.logo, power: 14 },
  ...[25.2, 25.9, 26.9, 27.35, 28.5].map((t) => ({ t, power: 7 })),
  { t: T.end, power: 20 },
];
