import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {REEL_FRAMES, Reel} from './Reel';

const Root: React.FC = () => (
  // Instagram Reels: vertical trailer, Tajik VO
  <Composition id="SmartReel" component={Reel} durationInFrames={REEL_FRAMES} fps={30} width={1080} height={1920} />
);
registerRoot(Root);
