import { Composition } from "remotion";
import { Reel } from "./Reel";
import { DURATION_S, FPS, HEIGHT, WIDTH } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="APlusReel"
      component={Reel}
      durationInFrames={Math.round(DURATION_S * FPS)}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
