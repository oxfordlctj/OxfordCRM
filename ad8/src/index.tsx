import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {DURATION, Film} from './Film';
import {T} from './lib';
import {TRAILER_FRAMES, Trailer} from './Trailer';
import {QUIZ_FRAMES, Quiz} from './quiz/Quiz';
import {EVENT_FRAMES, EventReel} from './event/Event';

const Root: React.FC = () => (
  <>
    {/* Instagram Reels cut: vertical trailer with Tajik VO */}
 {/* guest lecture promo: Shoira Pulatova at branch #8 */}
    <Composition id="OxfordEvent" component={EventReel} durationInFrames={EVENT_FRAMES} fps={30} width={1080} height={1920} />
    {/* viral quiz-challenge reel */}
    <Composition id="OxfordQuiz" component={Quiz} durationInFrames={QUIZ_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="OxfordReel" component={Trailer} durationInFrames={TRAILER_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Oxford8" component={Film} durationInFrames={DURATION} fps={T.fps} width={1920} height={1080} />
  </>
);

registerRoot(Root);
