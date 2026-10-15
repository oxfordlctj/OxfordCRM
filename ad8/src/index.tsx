import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {DURATION, Film} from './Film';
import {T} from './lib';
import {TRAILER_FRAMES, Trailer} from './Trailer';

const Root: React.FC = () => (
  <>
    {/* Instagram Reels cut: vertical trailer with Tajik VO */}
    <Composition id="OxfordReel" component={Trailer} durationInFrames={TRAILER_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Oxford8" component={Film} durationInFrames={DURATION} fps={T.fps} width={1920} height={1080} />
  </>
);

registerRoot(Root);
