// "Cine Lockup" shorts (style-guide.md section 2, Family A). 16:9, built by `pipeline.py cine`.
// Layers (bottom → top): picture (A-roll + zooms, inserts) · behind-person words · person cut-out ·
// captions / heroes / lockups · creator tag · letterbox · end card. All times are seconds.
import React from 'react';
import {
  AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
import {loadFont as loadInterTight} from '@remotion/google-fonts/InterTight';
import {loadFont as loadPinyon} from '@remotion/google-fonts/PinyonScript';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';
import {Gfx} from './gfx/registry';

const latin = {subsets: ['latin'] as ['latin']};
// User rule (2026-10-14): max 3 font families per video. Cine uses exactly these 3:
//   Inter Tight (sans: captions, heroes, grotesk/heavy words, behind words, end card)
//   Playfair Display (serif: didone caps + italic chunks)   ·   Pinyon Script (script accent words)
const {fontFamily: tight} = loadInterTight('normal', {weights: ['600', '700', '800'], ...latin});
loadInterTight('italic', {weights: ['800'], ...latin});
const {fontFamily: script} = loadPinyon('normal', {weights: ['400'], ...latin});
const {fontFamily: playfair} = loadPlayfair('normal', {weights: ['400', '500'], ...latin});
loadPlayfair('italic', {weights: ['400', '500'], ...latin});

export type Anchor = {x: number; y: number; align: 'left' | 'center' | 'right'; scale?: number};
export type Fill = 'white' | 'chrome' | 'silver' | 'red' | 'teal' | 'orange' | 'yellow' | 'pink';
export type Face = 'script' | 'didone' | 'grotesk' | 'heavy' | 'serif';
export type CineChunk = {start: number; end: number; words: {text: string; at: number}[]; serif?: boolean; anchor?: Anchor};
export type CineHero = {text: string; start: number; end: number; fill?: Fill; anchor?: Anchor; size?: number};
export type CineLockup = {start: number; end: number; anchor: Anchor; words: {text: string; face: Face; at: number; size?: number; fill?: Fill}[]};
export type CineBehind = {text: string; start: number; end: number; style: 'condensed' | 'red' | 'warm'; fg: string; on: 'aroll' | 'insert';
  y?: number; size?: number; x?: number; script?: string};
export type CineInsert = {src?: string; gfx?: string; gfxScene?: string; start: number; end: number; trimFrom?: number};
export type CinePlan = {
  title: string; width: number; height: number; fps: number; durationSec: number; talkEnd: number;
  aroll: string; zooms: {start: number; end: number; scale: number}[];
  inserts: CineInsert[]; chunks: CineChunk[]; anchor: Anchor; capSize?: number; textScale?: number;
  heroes: CineHero[]; lockups: CineLockup[]; behind: CineBehind[];
  letterbox?: {dur: number}; tag?: string;
  endCard?: {start: number; dur: number; text: string; font?: 'caps' | 'italic'; reveal?: 'fade' | 'blur'};
  sfx: {src: string; at: number; volume?: number}[];
  music?: {src: string; volume: number; duckTo?: number; endVolume?: number};
  grade?: {contrast?: number; saturate?: number; brightness?: number; vignette?: number};
};

const FILLS: Record<Fill, string | null> = {
  white: null,
  chrome: 'linear-gradient(180deg,#FFFFFF 0%,#BFDcFA 38%,#FFFFFF 52%,#7E9DC2 78%,#E9F3FF 100%)',
  silver: 'linear-gradient(180deg,#FFFFFF 0%,#CFCFCF 40%,#FFFFFF 55%,#8C8C8C 82%,#F2F2F2 100%)',
  red: null,
  teal: 'linear-gradient(170deg,#F2FFFF 0%,#9FD3CF 35%,#FFFFFF 55%,#5E9C98 85%,#DFF6F4 100%)',
  orange: null,
  yellow: null,
  pink: 'linear-gradient(120deg,#FF4FA3 0%,#FFFFFF 45%,#FFC6E2 60%,#C83CFF 100%)',
};
const fillStyle = (fill: Fill = 'white'): React.CSSProperties => {
  if (fill === 'red') return {color: '#FF1A1A'};
  if (fill === 'orange') return {color: '#FF6A1A'};
  if (fill === 'yellow') return {color: '#FFC21A'};
  const g = FILLS[fill];
  if (!g) return {color: 'white'};
  return {backgroundImage: g, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};
};
const SOFT = 'drop-shadow(0 3px 14px rgba(0,0,0,0.55)) drop-shadow(0 0 2px rgba(0,0,0,0.25))';

const FACE: Record<Face, (H: number) => React.CSSProperties> = {
  script: (H) => ({fontFamily: script, fontSize: 0.23 * H, lineHeight: 0.95, letterSpacing: '0em', paddingRight: '0.15em'}),
  didone: (H) => ({fontFamily: playfair, fontWeight: 400, fontSize: 0.17 * H, lineHeight: 0.86, letterSpacing: '-0.01em'}),
  grotesk: (H) => ({fontFamily: tight, fontWeight: 700, fontSize: 0.11 * H, lineHeight: 0.92, letterSpacing: '-0.055em'}),
  heavy: (H) => ({fontFamily: tight, fontWeight: 800, fontStyle: 'italic', fontSize: 0.16 * H, lineHeight: 0.88, letterSpacing: '-0.04em', textTransform: 'uppercase'}),
  serif: (H) => ({fontFamily: playfair, fontStyle: 'italic', fontWeight: 400, fontSize: 0.14 * H, lineHeight: 0.9, letterSpacing: '-0.01em', textTransform: 'uppercase'}),
};

// Safe zone (user 2026-10-14): nothing too close to the edges, where IG/YT like/share UI sits after 9:16 conversion.
const SAFE = {l: 0.1, r: 0.88, t: 0.1, b: 0.86};
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const anchorStyle = (a0: Anchor, W: number, H: number): React.CSSProperties => {
  const a = {...a0, x: clamp(a0.x, SAFE.l, SAFE.r), y: clamp(a0.y, SAFE.t, SAFE.b)};
  const base: React.CSSProperties = {position: 'absolute', top: a.y * H, whiteSpace: 'nowrap'};
  if (a.align === 'left') return {...base, left: a.x * W, transform: 'translateY(-50%)', textAlign: 'left'};
  if (a.align === 'right') return {...base, right: (1 - a.x) * W, transform: 'translateY(-50%)', textAlign: 'right'};
  return {...base, left: a.x * W, transform: 'translate(-50%,-50%)', textAlign: 'center'};
};

const zoomAt = (plan: CinePlan, t: number) => {
  for (const z of plan.zooms) if (t >= z.start && t < z.end) return z.scale;
  return 1;
};

// ---------- layers ----------
const Picture: React.FC<{plan: CinePlan}> = ({plan}) => {
  const {fps} = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const f = (s: number) => Math.round(s * fps);
  return (
    <>
      <AbsoluteFill style={{transform: `scale(${zoomAt(plan, t)})`}}>
        <OffthreadVideo src={staticFile(plan.aroll)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      {plan.inserts.map((b, i) => (
        <Sequence key={i} from={f(b.start)} durationInFrames={Math.max(1, f(b.end) - f(b.start))}>
          {b.gfx ? <Gfx scene={b.gfxScene} kind={b.gfx} start={b.start} /> : (
            <OffthreadVideo src={staticFile(b.src!)} startFrom={Math.round((b.trimFrom ?? 0) * fps)} muted
              style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          )}
        </Sequence>
      ))}
    </>
  );
};

const BehindWord: React.FC<{b: CineBehind; plan: CinePlan; filter: string}> = ({b, plan, filter}) => {
  const {width: W, height: H, fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const t = b.start + frame / fps;
  const pop = frame === 0 ? 0.92 : 1; // one-frame micro pop, as in Inspo6
  const n = Math.max(1, b.text.replace(/\s/g, '').length);
  const fit = (want: number, em: number) => Math.min(want, (0.94 * W) / (n * em));
  let text: React.CSSProperties;
  if (b.style === 'red') {
    text = {fontFamily: tight, fontWeight: 800, fontSize: fit((b.size ?? 0.2) * H, 0.62), letterSpacing: '-0.045em', color: '#FF1A1A', lineHeight: 1};
  } else {
    text = {fontFamily: tight, fontWeight: 800, fontSize: fit((b.size ?? 0.8) * H, 0.6), lineHeight: 0.9,
      letterSpacing: '-0.045em', textTransform: 'uppercase',
      ...(b.style === 'warm'
        ? {backgroundImage: 'linear-gradient(180deg,rgba(255,246,230,0.95) 10%,rgba(255,206,150,0.55) 65%,rgba(255,190,120,0) 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}
        : {color: 'rgba(255,255,255,0.80)'})};
  }
  const zoom = b.on === 'aroll' ? zoomAt(plan, t) : 1;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <div style={{position: 'absolute', left: (b.x ?? 0.5) * W, top: (b.y ?? 0.5) * H, transform: `translate(-50%,-50%) scale(${pop})`,
          whiteSpace: 'nowrap', textAlign: 'center', ...text}}>
          {b.text}
          {b.script && <span style={{fontFamily: script, fontSize: 0.16 * H, color: 'white', marginLeft: '-0.2em', letterSpacing: 0, textTransform: 'none'}}>{b.script}</span>}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${zoom})`, filter}}>
        <OffthreadVideo src={staticFile(b.fg)} transparent muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Captions: React.FC<{plan: CinePlan}> = ({plan}) => {
  const {width: W, height: H, fps} = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const busy = [...plan.heroes, ...plan.lockups].some((h) => t >= h.start && t < h.end);
  if (busy) return null;
  const c = plan.chunks.find((ch) => t >= ch.start && t < ch.end);
  if (!c) return null;
  const shown = c.words.filter((w) => t >= w.at).map((w) => w.text);
  if (!shown.length) return null;
  const a0 = c.anchor ?? plan.anchor;
  const lb = plan.letterbox?.dur ?? 0;
  const open = lb > 0 && t < lb ? interpolate(t, [0, lb], [0, 1], {easing: Easing.inOut(Easing.cubic)}) : 1;
  const anchor = {...a0, y: 0.5 + (a0.y - 0.5) * open};
  const style: React.CSSProperties = c.serif
    ? {fontFamily: playfair, fontStyle: 'italic', fontWeight: 400, fontSize: (plan.capSize ?? 0.11) * 1.02 * H * (a0.scale ?? 1), letterSpacing: '-0.02em'}
    : {fontFamily: tight, fontWeight: 700, fontSize: (plan.capSize ?? 0.11) * H * (a0.scale ?? 1), letterSpacing: '-0.055em'};
  return (
    <div style={{...anchorStyle(anchor, W, H), ...style, color: 'white', lineHeight: 1,
      textShadow: '0 2px 12px rgba(0,0,0,0.35)'}}>
      {shown.join(' ')}
    </div>
  );
};

const Hero: React.FC<{h: CineHero; plan: CinePlan}> = ({h, plan}) => {
  const {width: W, height: H} = useVideoConfig();
  const an = h.anchor ?? {...plan.anchor, align: 'center' as const};
  // auto-fit: Inter Tight 800 italic caps ≈ 0.64 em per char; keep inside the safe zone width
  const want = (h.size ?? 0.21) * H * (an.scale ?? 1) * (plan.textScale ?? 1);
  const fontSize = Math.min(want, ((SAFE.r - SAFE.l) * W) / (Math.max(1, h.text.length) * 0.64));
  return (
    <div style={{...anchorStyle(an, W, H), filter: SOFT}}>
      <span style={{fontFamily: tight, fontWeight: 800, fontStyle: 'italic', fontSize, letterSpacing: '-0.04em',
        lineHeight: 1, textTransform: 'uppercase', paddingRight: '0.08em', ...fillStyle(h.fill)}}>{h.text}</span>
    </div>
  );
};

const Lockup: React.FC<{l: CineLockup; k?: number}> = ({l, k = 1}) => {
  const {width: W, height: H, fps} = useVideoConfig();
  const t = l.start + useCurrentFrame() / fps;
  return (
    <div style={{...anchorStyle(l.anchor, W, H), filter: SOFT, display: 'flex', flexDirection: 'column',
      alignItems: l.anchor.align === 'left' ? 'flex-start' : l.anchor.align === 'right' ? 'flex-end' : 'center'}}>
      {l.words.map((w, i) => {
        const face = FACE[w.face](H);
        const size = {fontSize: (w.size ?? (face.fontSize as number) / H) * H * k};
        const overlap = w.face === 'script' ? {marginBottom: -0.035 * H, marginTop: -0.02 * H, zIndex: 2} : {};
        return (
          <div key={i} style={{...face, ...size, ...overlap, visibility: t >= w.at ? 'visible' : 'hidden', position: 'relative'}}>
            <span style={fillStyle(w.fill)}>{w.text}</span>
          </div>
        );
      })}
    </div>
  );
};

const Letterbox: React.FC<{dur: number}> = ({dur}) => {
  const {height: H, fps} = useVideoConfig();
  const t = useCurrentFrame() / fps;
  if (t >= dur) return null;
  const p = interpolate(t, [0, dur], [0, 1], {easing: Easing.inOut(Easing.cubic), extrapolateRight: 'clamp'});
  const bar = (H / 2) * (1 - p);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bar, background: 'black'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bar, background: 'black'}} />
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{e: NonNullable<CinePlan['endCard']>}> = ({e}) => {
  const {height: H, fps} = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const out = interpolate(t, [e.dur - 0.4, e.dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const font: React.CSSProperties = e.font === 'italic'
    ? {fontFamily: tight, fontWeight: 800, fontStyle: 'italic', fontSize: 0.032 * H, letterSpacing: '-0.01em'}
    : {fontFamily: tight, fontWeight: 700, fontSize: 0.042 * H, letterSpacing: '0.04em'};
  const words = e.text.split(' ');
  return (
    <AbsoluteFill style={{background: 'black', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{...font, color: 'white', textTransform: 'uppercase', opacity: out, whiteSpace: 'nowrap'}}>
        {words.map((w, i) => {
          const t0 = 0.3 + (e.reveal === 'blur' ? i * 0.15 : 0);
          const s = interpolate(t, [t0, t0 + 0.3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
          return (
            <span key={i} style={{display: 'inline-block', opacity: s, filter: e.reveal === 'blur' ? `blur(${(1 - s) * 12}px)` : undefined,
              marginRight: i < words.length - 1 ? '0.3em' : 0}}>{w}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Cine: React.FC<{plan: CinePlan}> = ({plan}) => {
  const {fps, height: H, width: W} = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const g = plan.grade ?? {};
  const filter = `contrast(${g.contrast ?? 1.1}) saturate(${g.saturate ?? 1.1}) brightness(${g.brightness ?? 1})`;
  const m = plan.music;
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <Sequence durationInFrames={f(plan.talkEnd)}>
        <AbsoluteFill style={{filter}}><Picture plan={plan} /></AbsoluteFill>
        <AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${g.vignette ?? 0.32}) 100%)`}} />
        {plan.behind.map((b, i) => (
          <Sequence key={`bh${i}`} from={f(b.start)} durationInFrames={Math.max(1, f(b.end) - f(b.start))}>
            <BehindWord b={b} plan={plan} filter={filter} />
          </Sequence>
        ))}
        <Captions plan={plan} />
        {plan.heroes.map((h, i) => (
          <Sequence key={`h${i}`} from={f(h.start)} durationInFrames={Math.max(1, f(h.end) - f(h.start))}><Hero h={h} plan={plan} /></Sequence>
        ))}
        {plan.lockups.map((l, i) => (
          <Sequence key={`l${i}`} from={f(l.start)} durationInFrames={Math.max(1, f(l.end) - f(l.start))}><Lockup l={l} k={plan.textScale ?? 1} /></Sequence>
        ))}
        {plan.tag && (
          <div style={{position: 'absolute', left: 0.88 * W, top: 0.06 * H, fontFamily: tight, fontWeight: 600, fontSize: 0.022 * H,
            color: 'white', borderLeft: '2px solid #FF2A2A', paddingLeft: 6, transform: 'translateX(-50%)'}}>{plan.tag}</div>
        )}
        {plan.letterbox && <Letterbox dur={plan.letterbox.dur} />}
      </Sequence>
      {plan.endCard && (
        <Sequence from={f(plan.endCard.start)} durationInFrames={f(plan.endCard.dur)}><EndCard e={plan.endCard} /></Sequence>
      )}
      {plan.sfx.map((s, i) => (
        <Sequence key={`s${i}`} from={Math.max(0, f(s.at))}><Audio src={staticFile(s.src)} volume={s.volume ?? 0.4} /></Sequence>
      ))}
      {m && (
        <Audio src={staticFile(m.src)} volume={(fr) => {
          const t = fr / fps;
          const talk = m.duckTo ?? m.volume;
          return interpolate(t, [plan.talkEnd - 0.05, plan.talkEnd + 0.35], [talk, m.endVolume ?? 0.7], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        }} />
      )}
    </AbsoluteFill>
  );
};
