// Text components for the Long composition: WordStack (keyword stacks / lists), HeadTitle (two huge words either
// side of the head), ChapterLabel (persistent neon script), WordRun (word-append with blur-in + per-word styles).
import React from 'react';
import {useVideoConfig} from 'remotion';
import {C, dafoe, ease, GOLD_SHADOW, NEON_SHADOW, out, popStyle, reveal, SHADOW, sora, tight} from './theme';
import {Icon} from './Icons';
import type {HeadTitleBeat, Line, Pos, Size, StackBeat, Word} from './types';

export const SIZE: Record<Size, number> = {xxl: 0.18, xl: 0.135, l: 0.095, m: 0.072, s: 0.05};
const COLOR = {white: C.white, gold: C.gold, ice: C.ice, dim: C.dim};

export const wordStyle = (w: Word, base: number): React.CSSProperties => {
  switch (w.f) {
    case 'script':
      return {fontFamily: dafoe, fontWeight: 400, fontSize: base * 1.5, color: '#e9f1ff', textShadow: NEON_SHADOW, letterSpacing: 0,
        lineHeight: 0.8, padding: '0 0.12em', margin: '0 -0.04em'};
    case 'italic':
      return {fontFamily: tight, fontStyle: 'italic', fontWeight: 800, letterSpacing: '-0.03em'};
    case 'gold':
      return {color: C.gold, textShadow: GOLD_SHADOW};
    case 'ice':
      return {color: C.ice, textShadow: '0 0 22px rgba(120,170,255,0.6)'};
    case 'bad':
      return {color: C.bad, textShadow: '0 0 18px rgba(255,77,77,0.45)'};
    case 'good':
      return {color: C.good, textShadow: '0 0 18px rgba(74,222,128,0.45)'};
    default:
      return {};
  }
};

// one run of words, each revealed on its spoken time
export const WordRun: React.FC<{words: Word[]; t: number; size: number; color?: string; weight?: number; family?: string}> = ({
  words, t, size, color = C.white, weight = 700, family = sora,
}) => (
  <span style={{display: 'inline-flex', alignItems: 'baseline', flexWrap: 'nowrap', gap: `0 ${size * 0.26}px`, whiteSpace: 'nowrap'}}>
    {words.map((w, i) => (
      <span key={i} style={{display: 'inline-block', fontFamily: family, fontWeight: weight, fontSize: size, color, letterSpacing: '-0.025em',
        lineHeight: 1.08, textShadow: SHADOW, ...wordStyle(w, size), ...reveal(t, w.at)}}>{w.t}</span>
    ))}
  </span>
);

const lineChars = (l: Line) => l.words.reduce((n, w) => n + w.t.length * (w.f === 'script' ? 1.1 : 1) + 1, 0) + (l.icon ? 2 : 0);

export const posStyle = (pos: Pos, W: number, H: number): React.CSSProperties => {
  const m = 0.05 * W;
  switch (pos) {
    case 'tl': return {left: m, top: 0.085 * H, alignItems: 'flex-start'};
    case 'tr': return {right: m, top: 0.085 * H, alignItems: 'flex-end'};
    case 'bl': return {left: m, bottom: 0.13 * H, alignItems: 'flex-start'};
    case 'br': return {right: m, bottom: 0.13 * H, alignItems: 'flex-end'};
    case 'left': return {left: m, top: '50%', transform: 'translateY(-50%)', alignItems: 'flex-start'};
    case 'right': return {right: m, top: '50%', transform: 'translateY(-50%)', alignItems: 'flex-end'};
    case 'top': return {left: '50%', top: 0.1 * H, transform: 'translateX(-50%)', alignItems: 'center'};
    case 'bottom': return {left: '50%', bottom: 0.12 * H, transform: 'translateX(-50%)', alignItems: 'center'};
    default: return {left: '50%', top: '50%', transform: 'translate(-50%,-50%)', alignItems: 'center'};
  }
};

export const StackLine: React.FC<{l: Line; t: number; size: number}> = ({l, t, size}) => {
  const iconCol = l.iconColor ?? (l.icon === 'x' ? C.bad : l.icon === 'check' ? C.good : l.icon === 'down' ? C.bad : l.icon === 'up' ? C.good : C.gold);
  const strike = l.strikeAt !== undefined ? ease(t, l.strikeAt, l.strikeAt + 0.25) : 0;
  const scriptLine = l.words.some((w) => w.f === 'script');
  return (
    <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: size * 0.3, marginBottom: size * (scriptLine ? 0.32 : 0.12),
      justifyContent: l.align === 'center' ? 'center' : l.align === 'right' ? 'flex-end' : 'flex-start'}}>
      {l.icon && (
        <div style={{...popStyle(t, l.at), width: size * 0.95, height: size * 0.95, borderRadius: size * 0.28, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: `${iconCol}22`, border: `2px solid ${iconCol}88`, boxShadow: `0 0 18px ${iconCol}44`}}>
          <Icon name={l.icon} size={size * 0.6} color={iconCol} stroke={2.6} />
        </div>
      )}
      <WordRun words={l.words} t={t} size={size} color={COLOR[l.color ?? 'white']} />
      {strike > 0 && (
        <div style={{position: 'absolute', left: l.icon ? size * 1.25 : 0, top: '54%', height: Math.max(4, size * 0.07), width: `calc(${strike * 100}% - ${l.icon ? size * 1.25 * strike : 0}px)`,
          background: C.bad, borderRadius: 4, boxShadow: '0 0 14px rgba(255,77,77,0.7)'}} />
      )}
    </div>
  );
};

export const WordStack: React.FC<{b: StackBeat; t: number}> = ({b, t}) => {
  const {width: W, height: H} = useVideoConfig();
  const side = b.pos !== 'center' && b.pos !== 'top' && b.pos !== 'bottom';
  const low = b.pos === 'bl' || b.pos === 'br' || b.pos === 'lower';
  const a = b.anchor;
  const maxW = (a?.maxW ?? b.maxW ?? (low ? 0.7 : side ? 0.37 : 0.84)) * W;
  const box: React.CSSProperties = a
    ? {top: a.y * H, transform: 'translateY(-50%)', alignItems: a.align === 'right' ? 'flex-end' : a.align === 'center' ? 'center' : 'flex-start',
      ...(a.align === 'right' ? {right: (1 - a.x) * W} : a.align === 'center' ? {left: a.x * W, transform: 'translate(-50%,-50%)'} : {left: a.x * W})}
    : b.pos === 'lower' ? {left: 0.06 * W, bottom: 0.1 * H, alignItems: 'flex-start'} : posStyle(b.pos as Pos, W, H);
  const lineAlign = a ? a.align : b.pos === 'lower' ? 'left' : undefined;
  return (
    <div style={{position: 'absolute', display: 'flex', flexDirection: 'column', ...box}}>
      {b.kicker && (
        <div style={{fontFamily: tight, fontWeight: 700, fontSize: 0.03 * H, letterSpacing: '0.2em', color: C.gold, textTransform: 'uppercase',
          marginBottom: 0.02 * H, ...reveal(t, b.start)}}>{b.kicker}</div>
      )}
      {b.lines.map((l, i) => {
        const want = SIZE[l.size ?? 'l'] * H;
        const size = Math.min(want, maxW / (lineChars(l) * 0.56));
        return <StackLine key={i} l={{...l, align: l.align ?? lineAlign ?? (b.pos === 'center' || b.pos === 'top' || b.pos === 'bottom' ? 'center' : b.pos.endsWith('r') || b.pos === 'right' ? 'right' : 'left')}} t={t} size={size} />;
      })}
    </div>
  );
};

export const HeadTitle: React.FC<{b: HeadTitleBeat; t: number}> = ({b, t}) => {
  const {width: W, height: H} = useVideoConfig();
  const [x0, y0, x1, y1] = b.face;
  const gap = 0.025 * W;
  const eye = (y0 + 0.42 * (y1 - y0)) * H;
  const availL = x0 * W - gap - 0.03 * W, availR = (1 - x1) * W - gap - 0.03 * W;
  const fit = (w: Word, avail: number) => Math.min(0.2 * H, avail / (w.t.length * 0.6));
  const size = Math.min(fit(b.left, availL), fit(b.right, availR));
  const big = (w: Word): React.CSSProperties => ({fontFamily: sora, fontWeight: 800, fontSize: size, letterSpacing: '-0.04em', color: C.white,
    lineHeight: 1, textShadow: '0 0 40px rgba(169,207,255,0.45), 0 6px 30px rgba(0,0,0,0.6)', whiteSpace: 'nowrap', ...wordStyle(w, size), ...reveal(t, w.at, 0.25)});
  const subSize = SIZE.m * H;
  return (
    <>
      <div style={{position: 'absolute', right: W - (x0 * W - gap), top: eye, transform: 'translateY(-50%)'}}><span style={big(b.left)}>{b.left.t}</span></div>
      <div style={{position: 'absolute', left: x1 * W + gap, top: eye, transform: 'translateY(-50%)'}}><span style={big(b.right)}>{b.right.t}</span></div>
      {b.sub && (
        <div style={{position: 'absolute', left: '50%', top: Math.min(y1 * H + 0.1 * H, 0.82 * H), transform: 'translateX(-50%)', display: 'flex',
          flexDirection: 'column', alignItems: 'center'}}>
          {b.sub.map((l, i) => <StackLine key={i} l={{...l, align: 'center'}} t={t} size={SIZE[l.size ?? 'm'] * H || subSize} />)}
        </div>
      )}
    </>
  );
};

export const ChapterLabel: React.FC<{text: string; t: number; start: number; end: number}> = ({text, t, start, end}) => {
  const {width: W, height: H} = useVideoConfig();
  const wipe = ease(t, start, start + 0.8);
  const o = 1 - ease(t, end - 0.3, end);
  return (
    <div style={{position: 'absolute', left: 0.035 * W, bottom: 0.045 * H, opacity: o, clipPath: `inset(-40% ${(1 - wipe) * 100}% -40% -5%)`}}>
      <span style={{fontFamily: dafoe, fontSize: 0.062 * H, color: '#eef4ff', textShadow: NEON_SHADOW, whiteSpace: 'nowrap', padding: '0 0.2em'}}>{text}</span>
    </div>
  );
};

// neon script word that writes on (mask wipe) – used over 3D and cards
export const ScriptWrite: React.FC<{text: string; t: number; at: number; size: number; color?: string; dur?: number}> = ({
  text, t, at, size, color = '#eef4ff', dur = 0.7,
}) => {
  const w = ease(t, at, at + dur, (x) => x);
  if (t < at) return null;
  return (
    <span style={{display: 'inline-block', clipPath: `inset(-50% ${(1 - w) * 100}% -50% -5%)`, fontFamily: dafoe, fontSize: size, color,
      textShadow: NEON_SHADOW, whiteSpace: 'nowrap', padding: '0 0.25em', lineHeight: 1.1, opacity: out(t, at, 0.1)}}>{text}</span>
  );
};
