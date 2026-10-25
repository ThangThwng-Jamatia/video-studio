// Minor Builds — 32 s vertical launch promo (1080×1920 @ 60 fps), cut to a 120 bpm bed (1 beat = 0.5 s).
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, interpolate} from 'remotion';
import {LiquidBG, SceneFX, s2f, FPS} from './kit';
import {S1Hook, S2Logo, S3Today, S4BuildQuit, S5Track, S6Rank, S7Stats, S8Features, S9Statement, S10End, RANK_TIMES, FEATURES, PILL_STEP} from './scenes';

export const PROMO_SEC = 32;
const OVERLAP = 6;

const SCENES: {from: number; to: number; C: React.FC; inF?: number; outF?: number}[] = [
  {from: 0, to: 4, C: S1Hook, inF: 1, outF: 4},
  {from: 4, to: 6, C: S2Logo, inF: 1},
  {from: 6, to: 12, C: S3Today},
  {from: 12, to: 14.5, C: S4BuildQuit},
  {from: 14.5, to: 17, C: S5Track},
  {from: 17, to: 20.5, C: S6Rank},
  {from: 20.5, to: 23, C: S7Stats},
  {from: 23, to: 26, C: S8Features},
  {from: 26, to: 28, C: S9Statement, outF: 3},
  {from: 28, to: 32, C: S10End, inF: 1, outF: 1},
];

type Cue = [number, string, number]; // [sec, sfx file, volume]
const SFX: Cue[] = [
  // hook
  [0.1, 'pop', 0.28], [0.35, 'pop', 0.28], [0.6, 'pop', 0.22],
  [1.5, 'pop', 0.3], [1.75, 'pop', 0.3], [2.0, 'ding', 0.25],
  [2.35, 'click', 0.18], [2.6, 'click', 0.18], [2.85, 'click', 0.18], [3.1, 'click', 0.18],
  [3.5, 'whoosh', 0.32],
  // logo
  [4.55, 'ding', 0.2], [5.7, 'whoosh_long', 0.3],
  // today
  [7.0, 'pop', 0.4], [7.06, 'ding', 0.2], [8.0, 'pop', 0.4], [8.06, 'ding', 0.2], [9.0, 'pop', 0.4], [9.06, 'ding', 0.24],
  [9.3, 'click', 0.2], [10.0, 'click', 0.25], [10.3, 'click', 0.25], [10.6, 'pop', 0.3],
  [11.75, 'whoosh', 0.3],
  // build / quit
  [12.05, 'whoosh', 0.22], [12.8, 'ding', 0.22], [13.05, 'whoosh', 0.22],
  [13.45, 'click', 0.12], [13.6, 'click', 0.12], [13.75, 'click', 0.12], [13.9, 'click', 0.12], [14.05, 'click', 0.12],
  [14.3, 'whoosh', 0.28],
  // track
  [14.75, 'pop', 0.3], [14.95, 'pop', 0.3], [15.15, 'pop', 0.3], [15.35, 'click', 0.2], [16.15, 'click', 0.2],
  [16.25, 'pop', 0.35], [16.3, 'ding', 0.25],
  [16.8, 'whoosh', 0.28],
  // rank
  ...RANK_TIMES.slice(0, 4).map((t): Cue => [17 + t, 'click', 0.3]),
  [17.9, 'swell_hit', 0.45],
  [18.9, 'whoosh', 0.2], [19.3, 'ding', 0.18], [19.55, 'ding', 0.18], [19.8, 'ding', 0.18], [20.0, 'pop', 0.3],
  [20.3, 'whoosh', 0.28],
  // stats
  [21.9, 'ding', 0.22], [22.8, 'whoosh', 0.28],
  // features
  ...FEATURES.map((_, i): Cue => [23.5 + i * PILL_STEP, 'pop', 0.16]),
  // statement
  [26.0, 'click', 0.22], [26.25, 'click', 0.22], [27.0, 'pop', 0.3], [27.25, 'pop', 0.34],
  // end
  [28.75, 'ding', 0.2],
];

export const MinorBuildsPromo: React.FC = () => (
  <AbsoluteFill style={{background: '#F8F9FB'}}>
    <LiquidBG />
    {SCENES.map(({from, to, C, inF, outF}, i) => {
      // Each scene runs OVERLAP frames past its cut so it crossfades under the next one (no empty frames).
      // Hard cuts (next scene has inF: 1, i.e. on a music hit) don't overlap.
      const soft = i < SCENES.length - 1 && SCENES[i + 1].inF !== 1;
      const dur = s2f(to - from) + (soft ? OVERLAP : 0);
      return (
      <Sequence key={from} from={s2f(from)} durationInFrames={dur}>
        <SceneFX dur={dur} inF={inF ?? 14} outF={soft ? OVERLAP * 2 : outF}>
          <C />
        </SceneFX>
      </Sequence>
      );
    })}
    <Audio
      src={staticFile('jobs/minor-builds-promo/music.wav')}
      volume={(f) => interpolate(f, [0, 6, s2f(PROMO_SEC) - 24, s2f(PROMO_SEC)], [0, 0.6, 0.6, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
    />
    {SFX.map(([t, file, v], i) => (
      <Sequence key={`sfx${i}`} from={Math.round(t * FPS)} durationInFrames={s2f(2)}>
        <Audio src={staticFile(`sfx/${file}.wav`)} volume={v} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
