import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts, GOLD_TEXT} from './Captions';
import type {Accent, Headline} from './types';

export const HeadlineView: React.FC<{h: Headline}> = ({h}) => {
  // Rendered inside a <Sequence>, so frame 0 = headline start.
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const s = spring({frame, fps, config: {damping: 13, stiffness: 180}});
  const out = interpolate(frame, [durationInFrames - 4, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const style = h.style ?? 'gold';
  const size = (h.size ?? 120) * u;
  const base: React.CSSProperties = {
    fontFamily: fonts.inter,
    fontWeight: 800,
    fontSize: size,
    lineHeight: 0.95,
    letterSpacing: '-0.05em',
    whiteSpace: 'pre-line',
    textAlign: 'center',
  };
  const look: React.CSSProperties =
    style === 'gold'
      ? GOLD_TEXT
      : style === 'serif'
        ? {fontFamily: fonts.serif, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.02em', color: 'white', textShadow: '0 4px 24px rgba(0,0,0,0.5)'}
        : {color: 'white', textShadow: '0 4px 24px rgba(0,0,0,0.5)'};
  const top = h.position === 'top' ? '16%' : h.position === 'bottom' ? '78%' : '45%';
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top,
          transform: `translateY(-50%) scale(${0.7 + 0.3 * s})`,
          opacity: Math.min(s * 1.4, 1) * out,
          display: 'flex',
          justifyContent: 'center',
          padding: `0 ${50 * u}px`,
        }}
      >
        <div style={{...base, ...look}}>{h.text}</div>
      </div>
    </AbsoluteFill>
  );
};

export const AccentView: React.FC<{a: Accent}> = ({a}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const u = Math.min(width, height) / 1080;

  if (a.type === 'flash') {
    const o = interpolate(frame, [0, durationInFrames], [0.85, 0], {extrapolateRight: 'clamp'});
    return <AbsoluteFill style={{backgroundColor: 'white', opacity: o}} />;
  }

  if (a.type === 'redbar') {
    // flickering red block (Inspo3 "completely")
    const on = Math.floor(frame / 2) % 3 !== 0;
    return (
      <AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            left: '17%',
            top: '56%',
            width: 26 * u,
            height: 60 * u,
            backgroundColor: '#E01B1B',
            opacity: on ? 1 : 0.2,
          }}
        />
      </AbsoluteFill>
    );
  }

  // camera-viewfinder corner brackets (Inspo1 hook)
  const inset = 0.05 * Math.min(width, height);
  const len = 46 * u;
  const th = 4 * u;
  const c = (pos: React.CSSProperties, rot: number) => (
    <div style={{position: 'absolute', width: len, height: len, ...pos, transform: `rotate(${rot}deg)`}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: len, height: th, background: 'white'}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: th, height: len, background: 'white'}} />
    </div>
  );
  return (
    <AbsoluteFill>
      {c({left: inset, top: inset}, 0)}
      {c({right: inset, top: inset}, 90)}
      {c({right: inset, bottom: inset}, 180)}
      {c({left: inset, bottom: inset}, 270)}
    </AbsoluteFill>
  );
};
