import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadSerif} from '@remotion/google-fonts/InstrumentSerif';
import type {CaptionPreset, Placement, Word} from './types';

const {fontFamily: inter} = loadInter('normal', {weights: ['500', '600', '800', '900']});
const {fontFamily: serif} = loadSerif('italic');

export const fonts = {inter, serif};

export const GOLD_TEXT: React.CSSProperties = {
  backgroundImage: 'linear-gradient(180deg, #FFF3C4 0%, #F4D27A 45%, #C9952E 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  filter: 'drop-shadow(0 0 18px rgba(255, 196, 80, 0.55)) drop-shadow(0 3px 6px rgba(0,0,0,0.45))',
};

type Chunk = {words: Word[]; start: number; end: number};

// Groups words into on-screen chunks the way the inspo does:
// 1-3 small words at a time, a "big" word opens its own chunk (followed by up to 2 small words),
// break on punctuation and on pauses.
// `breaks` = shot-change times: a chunk never spans a cut, and it disappears on the cut.
export const chunkWords = (words: Word[], breaks: number[] = []): Chunk[] => {
  const chunks: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) chunks.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
    cur = [];
  };
  words.forEach((w, i) => {
    const prev = words[i - 1];
    const gap = prev ? w.start - prev.end : 0;
    const prevPunct = prev ? /[.,!?;:]$/.test(prev.text) : false;
    const bigRun = w.emph === 'big' && prev?.emph === 'big' && gap < 0.2; // keep '12 hours' together
    const crossesCut = prev ? breaks.some((b) => b > prev.start + 0.05 && b <= w.start + 0.05) : false;
    if (cur.length && ((w.emph === 'big' && !bigRun) || cur.length >= 3 || gap > 0.35 || prevPunct || crossesCut)) flush();
    cur.push(w);
  });
  flush();
  // each chunk holds until the next one starts (max +0.6s after its last word)
  return chunks.map((c, i) => {
    const nextCut = breaks.filter((b) => b > c.start + 0.05).sort((a, b) => a - b)[0] ?? Infinity;
    return {...c, end: Math.min(chunks[i + 1]?.start ?? c.end + 0.6, c.end + 0.6, nextCut)};
  });
};

const clean = (t: string) => t.replace(/[.,!?;:"]/g, '').trim();

const WordPop: React.FC<{word: Word; children: React.ReactNode; style: React.CSSProperties}> = ({
  word,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const startF = Math.round(word.start * fps) - 2;
  const s = spring({frame: frame - startF, fps, config: {damping: 14, stiffness: 220, mass: 0.6}});
  const blur = interpolate(frame - startF, [0, 4], [8, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opacity = interpolate(frame - startF, [0, 3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <span
      style={{
        display: 'inline-block',
        ...style,
        transform: `scale(${0.82 + 0.18 * s}) translateY(${(1 - s) * 12}px)`,
        filter: `${style.filter ?? ''} blur(${blur}px)`,
        opacity,
      }}
    >
      {children}
    </span>
  );
};

export const Captions: React.FC<{
  words: Word[];
  preset: CaptionPreset;
  position: number;
  placements?: Placement[];
  scale?: number;
  hide?: [number, number][]; // time ranges with no captions (motion-graphic cards)
}> = ({words, preset, position, placements = [], scale = 1, hide = []}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  const u = (Math.min(width, height) / 1080) * scale; // scale unit (scale = plan.captionScale)
  const breaks = placements.map((p) => p.start);
  const chunk = chunkWords(words, breaks).find((c) => t >= c.start - 0.07 && t < c.end);
  if (!chunk) return null;
  if (hide.some(([a, b]) => t >= a && t < b)) return null;
  // placement is fixed per chunk (taken at the chunk's first word) so text never jumps mid-chunk
  const pl = placements.find((p) => chunk.start + 0.06 >= p.start && chunk.start + 0.06 < p.end);
  const align = pl?.align ?? 'center';
  const y = pl?.y ?? position;
  const x = pl?.x ?? 0.5;
  const uu = u * (pl?.scale ?? 1);

  const big = chunk.words.filter((w) => w.emph === 'big');
  const small = chunk.words.filter((w) => w.emph !== 'big');

  const smallStyle: React.CSSProperties = {
    fontFamily: inter,
    fontWeight: 700,
    fontSize: 70 * uu,
    letterSpacing: '-0.03em',
    color: 'white',
    textShadow: '0 3px 16px rgba(0,0,0,0.75), 0 2px 4px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)',
    margin: `0 ${9 * uu}px`,
  };
  const italicStyle: React.CSSProperties = {
    ...smallStyle,
    fontFamily: serif,
    fontStyle: 'italic',
    fontWeight: 400,
    fontSize: 86 * uu,
    letterSpacing: '-0.01em',
  };
  const bigStyle: React.CSSProperties =
    preset === 'gold'
      ? {fontFamily: inter, fontWeight: 800, fontSize: 150 * uu, letterSpacing: '-0.05em', lineHeight: 1, ...GOLD_TEXT}
      : {
          fontFamily: inter,
          fontWeight: 900,
          fontSize: 160 * uu,
          letterSpacing: '-0.06em',
          lineHeight: 1,
          color: 'rgba(255,255,255,0.96)',
          textShadow: '0 4px 24px rgba(0,0,0,0.45)',
        };

  return (
    <div
      style={{
        position: 'absolute',
        top: `${y * 100}%`,
        ...(align === 'left'
          ? {left: `${x * 100}%`, maxWidth: '44%'}
          : align === 'right'
            ? {right: `${(1 - x) * 100}%`, maxWidth: '44%'}
            : {left: 0, right: 0, padding: `0 ${60 * uu}px`}),
        transform: `translateY(-50%) rotate(${pl?.rotate ?? 0}deg)`,
        transformOrigin: align === 'left' ? 'left center' : align === 'right' ? 'right center' : 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
        textAlign: align,
      }}
    >
      {big.length > 0 && (
        <div style={{display: 'flex', gap: 18 * uu, marginBottom: -10 * uu}}>
          {big.map((w, i) => (
            <WordPop key={i} word={w} style={bigStyle}>
              {clean(w.text)}
            </WordPop>
          ))}
        </div>
      )}
      {small.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
            alignItems: 'baseline',
            margin: align === 'center' ? 0 : `0 ${-7 * uu}px`,
          }}
        >
          {small.map((w, i) => (
            <WordPop key={i} word={w} style={preset === 'serif' && w.emph === 'italic' ? italicStyle : smallStyle}>
              {clean(w.text)}
            </WordPop>
          ))}
        </div>
      )}
    </div>
  );
};
