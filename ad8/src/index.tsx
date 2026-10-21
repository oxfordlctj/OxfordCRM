import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {DURATION, Film} from './Film';
import {T} from './lib';
import {TRAILER_FRAMES, Trailer} from './Trailer';
import {QUIZ_FRAMES, Quiz} from './quiz/Quiz';
import {EVENT_FRAMES, EventReel} from './event/Event';
import {ROOTS_FRAMES, Roots} from './roots/Roots';
import {NATIVE_FRAMES, Native} from './native/Native';

const Root: React.FC = () => (
  <>
    {/* the same story shot like a phone over a notebook */}
    <Composition id="OxfordNative" component={Native} durationInFrames={NATIVE_FRAMES} fps={30} width={1080} height={1920} />
    {/* viral reel: Tajik words with 6000-year-old English roots */}
    <Composition id="OxfordRoots" component={Roots} durationInFrames={ROOTS_FRAMES} fps={30} width={1080} height={1920} />
    {/* guest lecture promo: Shoira Pulatova at branch #8 */}
    <Composition id="OxfordEvent" component={EventReel} durationInFrames={EVENT_FRAMES} fps={30} width={1080} height={1920} />
    {/* viral quiz-challenge reel */}
    <Composition id="OxfordQuiz" component={Quiz} durationInFrames={QUIZ_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="OxfordReel" component={Trailer} durationInFrames={TRAILER_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Oxford8" component={Film} durationInFrames={DURATION} fps={T.fps} width={1920} height={1080} />
  </>
);

registerRoot(Root);
