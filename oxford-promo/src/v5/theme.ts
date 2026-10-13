import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import "../v4/theme";

export { ip, BACK, EASE_OUT, EASE_IN, EASE_IN_OUT } from "../theme";

// Shonen-anime palette: ink black, blood red, chakra orange, moon cream, steel blue.
export const A = {
  ink: "#0D0B12",
  night: "#120F24",
  blood: "#D7263D",
  red: "#FF3B3B",
  orange: "#FF7A1A",
  flame: "#FFB12E",
  moon: "#FFF2D6",
  steel: "#8FA3BF",
  navy: "#1D2340",
  skin: "#F6D7C3",
  gold: "#F5C542",
  white: "#FFFFFF",
  sky: "#3A2A6E",
};

export const JP = "'Noto Sans JP', 'Unbounded', sans-serif";
export const DISPLAY = "Unbounded, 'Arial Black', sans-serif";
export const SUB = "Nunito, 'Arial Rounded MT Bold', sans-serif";

loadFont({ family: "Noto Sans JP", url: staticFile("fonts/NotoJP-subset.woff2"), weight: "900" });
