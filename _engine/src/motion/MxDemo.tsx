// Kit smoke test for the motion-explainer skill: every transition, both worlds, main type styles. No voice (hand-typed times).
import React from 'react';
import {AppWindow, Chip, Counter, CtaCard, Dust, GridFloor, Haze, ListRoll, Lockup, MxStage, Scene, Sfx, Volt} from './mxKit';

export const MX_DEMO_SEC = 14;

const SCENES: Scene[] = [
  {from: 0, to: 2.2, world: 'sky', C: ({t}) => (<><Haze t={t} /><Lockup t={t} size={130} words={[{w: 'What', at: 0.2, s: 'big'}, {w: 'if...', at: 0.5, s: 'serif'}]} /></>)},
  {from: 2.2, to: 4.4, world: 'sky', in: 'flash', C: ({t}) => (<><Haze t={t} /><ListRoll t={t} x="44%" items={[{w: 'Not a studio.', at: 2.3}, {w: 'Not an editor.', at: 2.9}, {w: 'Not a team.', at: 3.5}]} /></>)},
  {from: 4.4, to: 6.6, world: 'night', in: 'pixel', C: ({t}) => (<><Haze t={t} /><Dust t={t} /><Volt t={t} x="30%" y="55%" s={1.6} at={4.5} mood="wow" /><Lockup t={t} x="66%" w="50%" align="left" size={130} words={[{w: "everyone's", at: 4.6, s: 'small'}, {w: 'asking', at: 4.8, s: 'body', br: true}, {w: 'the', at: 5.0, s: 'small', br: true}, {w: 'SAME', at: 5.2, s: 'hero'}, {w: 'thing', at: 5.6, s: 'serif', br: true}]} /></>)},
  {from: 6.6, to: 8.6, world: 'night', in: 'glitch', C: ({t}) => (<><Haze t={t} /><Lockup t={t} size={150} words={[{w: 'WRONG', at: 6.7, s: 'glitch'}, {w: 'question.', at: 7.1, s: 'mark', br: true}]} /></>)},
  {from: 8.6, to: 10.6, world: 'night', in: 'iris', cam: 'drift', C: ({t}) => (<><Haze t={t} /><GridFloor t={t} /><AppWindow t={t} at={8.7} x="35%" y="45%" w={640} title="claude — mx" lines={['> make the video', 'script ✓  voice ✓', 'scenes 24/24 ✓', 'render ▓▓▓▓▓▓▓░ 88%']} /><Chip t={t} at={9.2} x="72%" y="34%" icon="🎙" label="Voice" /><Chip t={t} at={9.4} x="84%" y="34%" icon="🎬" label="Scenes" /><Chip t={t} at={9.6} x="78%" y="62%" icon="🔊" label="Sound" /></>)},
  {from: 10.6, to: 12, world: 'night', in: 'push', C: ({t}) => (<><Haze t={t} /><Counter t={t} at={10.7} to={500} suffix="+" /><Lockup t={t} y="72%" size={90} words={[{w: 'people', at: 11.0, s: 'body'}, {w: 'already', at: 11.2, s: 'body'}, {w: 'have it', at: 11.4, s: 'serif'}]} /></>)},
  {from: 12, to: MX_DEMO_SEC, world: 'sky', in: 'flash', C: ({t}) => (<><Haze t={t} /><Lockup t={t} y="20%" size={70} words={[{w: 'Follow and comment', at: 12.1, s: 'body'}, {w: '"VIDEO"', at: 12.3, s: 'mark'}]} /><CtaCard t={t} at={12.3} handle="@minormoney" keyword="VIDEO" /><Volt t={t} x="80%" y="78%" s={0.9} at={12.6} mood="happy" wave /></>)},
];
const SFX: Sfx[] = [[2.15, 'whoosh', 0.4], [4.35, 'glitch', 0.4], [5.2, 'impact', 0.4], [6.55, 'glitch', 0.45], [8.6, 'whoosh', 0.35], [10.7, 'riser', 0.3], [11.6, 'ding', 0.35], [12, 'whoosh', 0.4], [13.2, 'click', 0.5]];

export const MxDemo: React.FC = () => <MxStage sec={MX_DEMO_SEC} scenes={SCENES} sfx={SFX} />;
