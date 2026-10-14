import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {DURATION, Film} from './Film';
import {T} from './lib';

const Root: React.FC = () => (
  <Composition id="Oxford8" component={Film} durationInFrames={DURATION} fps={T.fps} width={1920} height={1080} />
);

registerRoot(Root);
