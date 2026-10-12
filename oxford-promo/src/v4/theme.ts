import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export { ip, BACK, EASE_OUT, EASE_IN, EASE_IN_OUT } from "../theme";

// Storybook palette: night indigo, warm lamp orange, cream paper, Oxford gold.
export const C = {
  night: "#141B4D",
  deep: "#0B1033",
  dusk: "#3B2C78",
  lamp: "#FFB347",
  gold: "#F5B935",
  cream: "#FFF4DE",
  paper: "#FBEFD5",
  ink: "#1E1A3A",
  teal: "#2EC4B6",
  coral: "#FF6B6B",
  sky: "#7EC8FF",
  green: "#59C36A",
  white: "#FFFFFF",
};

export const STORY = "Nunito, 'Arial Rounded MT Bold', sans-serif";
export const LOGO = "Unbounded, 'Arial Black', sans-serif";

const LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const CYRILLIC = "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116";
loadFont({ family: "Nunito", url: staticFile("fonts/Nunito-latin.woff2"), weight: "200 1000", unicodeRange: LATIN });
loadFont({ family: "Nunito", url: staticFile("fonts/Nunito-cyrillic.woff2"), weight: "200 1000", unicodeRange: CYRILLIC });
