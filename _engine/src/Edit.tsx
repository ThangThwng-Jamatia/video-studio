import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Captions} from './Captions';
import {AccentView, HeadlineView} from './Overlays';
import {GraphicView} from './Graphics';
import type {BRoll, Plan} from './types';

const BRollClip: React.FC<{b: BRoll}> = ({b}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const pop = b.pop === false ? 1 : interpolate(frame, [0, 6], [1.12, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const kb =
    b.zoom === 'in'
      ? interpolate(frame, [0, durationInFrames], [1, 1.08])
      : b.zoom === 'out'
        ? interpolate(frame, [0, durationInFrames], [1.08, 1])
        : 1;
  return (
    <AbsoluteFill style={{transform: `scale(${pop * kb})`}}>
      <OffthreadVideo
        src={staticFile(b.src)}
        startFrom={Math.round((b.trimFrom ?? 0) * fps)}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
    </AbsoluteFill>
  );
};

const ARoll: React.FC<{plan: Plan}> = ({plan}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  // punch-in zooms: snap = hard jump-cut zoom, otherwise eased push
  let scale = 1;
  for (const z of plan.zooms) {
    if (t >= z.start && t < z.end) {
      scale = z.snap
        ? z.scale
        : interpolate(t, [z.start, Math.min(z.start + 0.35, z.end)], [1, z.scale], {
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          });
    }
  }
  return (
    <AbsoluteFill style={{transform: `scale(${scale})`}}>
      <OffthreadVideo
        src={staticFile(plan.aroll)}
        volume={plan.arollVolume ?? 1}
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
    </AbsoluteFill>
  );
};

export const Edit: React.FC<{plan: Plan}> = ({plan}) => {
  const {fps} = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const g = plan.grade ?? {};
  const filter = `contrast(${g.contrast ?? 1.08}) saturate(${g.saturate ?? 1.1}) brightness(${g.brightness ?? 1})`;
  const capPos = plan.captionPosition ?? (plan.format === 'long' ? 0.8 : 0.62);
  const speaking = (t: number) => plan.words.some((w) => t >= w.start - 0.1 && t <= w.end + 0.2);

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {/* picture layer, graded */}
      <AbsoluteFill style={{filter}}>
        {plan.aroll && <ARoll plan={plan} />}
        {plan.broll.map((b, i) => (
          <Sequence key={`b${i}`} from={f(b.start)} durationInFrames={Math.max(1, f(b.end) - f(b.start))}>
            <BRollClip b={b} />
          </Sequence>
        ))}
      </AbsoluteFill>

      {/* vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${g.vignette ?? 0.35}) 100%)`,
        }}
      />

      {plan.accents.map((a, i) => (
        <Sequence key={`a${i}`} from={f(a.start)} durationInFrames={Math.max(1, f(a.end) - f(a.start))}>
          <AccentView a={a} />
        </Sequence>
      ))}

      {(plan.graphics ?? []).map((g, i) => (
        <Sequence key={`g${i}`} from={f(g.start)} durationInFrames={Math.max(1, f(g.end) - f(g.start))}>
          <GraphicView g={g} />
        </Sequence>
      ))}

      {plan.headlines.map((h, i) => (
        <Sequence key={`h${i}`} from={f(h.start)} durationInFrames={Math.max(1, f(h.end) - f(h.start))}>
          <HeadlineView h={h} />
        </Sequence>
      ))}

      <Captions words={plan.words} preset={plan.preset} position={capPos} placements={plan.placements}
        scale={plan.captionScale}
        hide={(plan.graphics ?? []).filter((g) => g.hideCaptions !== false).map((g) => [g.start, g.end] as [number, number])}
      />

      {plan.sfx.map((s, i) => (
        <Sequence key={`s${i}`} from={Math.max(0, f(s.at))}>
          <Audio src={staticFile(s.src)} volume={s.volume ?? 0.5} />
        </Sequence>
      ))}

      {plan.music && (
        <Audio
          src={staticFile(plan.music.src)}
          loop
          volume={(fr) => (speaking(fr / fps) ? (plan.music!.duckTo ?? 0.08) : plan.music!.volume)}
        />
      )}
    </AbsoluteFill>
  );
};
