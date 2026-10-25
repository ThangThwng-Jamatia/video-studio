import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Captions, fonts} from './Captions';
import type {Placement, Word} from './types';

// "Glowup": monochrome Apple-style long-form edit (lean-physique-claude job).
// A-roll + full-screen layers (b-roll, portrait clips, photos, B&W motion-graphic cards) + captions + SFX.
// Layer times are ABSOLUTE timeline seconds; inside a layer, `lt` = seconds since layer start.

const INK = '#0A0A0B';
const PAPER = '#F5F5F7';
const MUTED = 'rgba(245,245,247,0.5)';
const EASE = Easing.bezier(0.22, 1, 0.36, 1); // Apple-ish ease-out
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export type Pin = {x: number; y: number; r: number}; // normalized to the image box

export type Layer = {start: number; end: number; hideCaps?: boolean; sfxIn?: string} & (
  | {kind: 'video'; src: string; trimFrom?: number; zoom?: 'in' | 'out'; bw?: boolean; label?: string; rate?: number}
  | {kind: 'portrait'; src: string; trimFrom?: number; label?: string; sub?: string; side?: 'center' | 'left' | 'right'}
  | {kind: 'hook'; old: string[]; now: {src: string; trimFrom: number}[]; t: Record<string, number>}
  | {kind: 'title'; text: string; kicker?: string; sub?: string; bg?: 'ink' | 'paper' | 'dim'; italic?: string; at?: number[]}
  | {kind: 'list'; title: string; items: {text: string; at: number; sub?: string; strike?: number}[]; bg?: 'ink' | 'dim'; numbered?: boolean; cross?: boolean}
  | {kind: 'analyze'; src: string; tag: string; pins: (Pin & {at: number; text: string})[]; bars?: {label: string; v: number; at: number; hot?: boolean}[]; verdict?: {text: string; at: number}; scanAt?: number}
  | {kind: 'exercise'; index: string; name: string; muscle: string; at?: number; pills?: string[]}
  | {kind: 'counter'; from: number; to: number; suffix?: string; label: string; sub?: string}
  | {kind: 'split'; left: {src: string; label: string; video?: boolean; trimFrom?: number}; right: {src: string; label: string; video?: boolean; trimFrom?: number}; title?: string}
  | {kind: 'pyramid'; title: string; tiers: {text: string; at: number}[]}
  | {kind: 'equation'; parts: {text: string; at: number; hot?: boolean}[]; sub?: string}
  | {kind: 'bodies'; active: {i: number; at: number}[]; note?: {text: string; at: number}; title?: string}
  | {kind: 'ratio'; title: string; sub?: string; a: number; aAt: number; restAt: number; b?: number; bAt?: number; labelA: string; labelB: string}
  | {kind: 'vtaper'; parts: {part: 'shoulders' | 'lats' | 'arms' | 'waist' | 'back'; text: string; at: number}[]; final?: {text: string; at: number}; title?: string}
  | {kind: 'tiles'; title: string; items: {n: number; unit?: string; label: string; at: number}[]}
  | {kind: 'pause'; text: string; sub?: string; subAt?: number}
  | {kind: 'chaos'; items: string[]; keep: number[]; simpleAt: number; allAt: number; finalAt: number; finalText: string; title?: string}
  | {kind: 'chat'; title?: string; msgs: {text: string; at: number}[]}
  | {kind: 'triptych'; clips: {src: string; trimFrom: number; at: number}[]; text: string; textAt: number; kicker?: string}
);

export type GlowPlan = {
  title: string;
  durationSec: number;
  aroll: string;
  words: Word[];
  placements: Placement[];
  zooms: {start: number; end: number; scale: number; snap?: boolean}[];
  layers: Layer[];
  sfx: {src: string; at: number; volume?: number}[];
};

/* ---------- helpers ---------- */
const useLayer = (l: {start: number; end: number}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const lt = frame / fps;
  const dur = l.end - l.start;
  const u = height / 1080;
  return {frame, fps, lt, dur, u, width, height, abs: l.start + lt};
};
// eased 0→1 starting at local time a, lasting d seconds
const ramp = (lt: number, a: number, d = 0.5) => interpolate(lt, [a, a + d], [0, 1], {...cl, easing: EASE});
const fadeEdges = (lt: number, dur: number, i = 0.25, o = 0.25) =>
  Math.min(interpolate(lt, [0, i], [0, 1], cl), interpolate(lt, [dur - o, dur], [1, 0], cl));

const kickerStyle = (u: number, color = MUTED): React.CSSProperties => ({
  fontFamily: fonts.inter, fontWeight: 600, fontSize: 30 * u, letterSpacing: '0.32em', textTransform: 'uppercase', color,
});
const headStyle = (u: number, size = 150, color = PAPER): React.CSSProperties => ({
  fontFamily: fonts.inter, fontWeight: 800, fontSize: size * u, letterSpacing: '-0.055em', lineHeight: 0.95, color,
});
const serifStyle = (u: number, size = 150, color = PAPER): React.CSSProperties => ({
  fontFamily: fonts.serif, fontStyle: 'italic', fontWeight: 400, fontSize: size * u, letterSpacing: '-0.02em', lineHeight: 1, color,
});

// Word-by-word blur-up reveal (Apple keynote style)
const Reveal: React.FC<{text: string; lt: number; at: number; style: React.CSSProperties; stagger?: number}> = ({text, lt, at, style, stagger = 0.07}) => (
  <span style={{display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center'}}>
    {text.split(' ').map((w, i, arr) => {
      const p = ramp(lt, at + i * stagger, 0.55);
      return (
        <span key={i} style={{...style, display: 'inline-block', marginRight: i < arr.length - 1 ? '0.24em' : 0, opacity: p, filter: `blur(${(1 - p) * 14}px)`, transform: `translateY(${(1 - p) * 0.25}em)`}}>
          {w}
        </span>
      );
    })}
  </span>
);

const Backdrop: React.FC<{bg?: 'ink' | 'paper' | 'dim'; lt: number}> = ({bg = 'ink', lt}) => {
  if (bg === 'dim') return <AbsoluteFill style={{backgroundColor: '#0D0D0F'}} />;
  if (bg === 'paper') return <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #FFFFFF 0%, ${PAPER} 50%, #E4E4E8 100%)`}} />;
  const g = 0.07 + 0.02 * Math.sin(lt * 1.3);
  return (
    <AbsoluteFill style={{backgroundColor: INK, backgroundImage: `radial-gradient(ellipse at 50% 42%, rgba(255,255,255,${g}) 0%, rgba(10,10,11,0) 55%, rgba(0,0,0,0.6) 100%)`}}>
      <Grain />
    </AbsoluteFill>
  );
};

// subtle film grain via SVG turbulence (cheap, static seed per frame-pair)
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: 0.07, mixBlendMode: 'screen'}}>
      <svg width="100%" height="100%">
        <filter id={`gn${frame % 4}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 4} />
        </filter>
        <rect width="100%" height="100%" filter={`url(#gn${frame % 4})`} />
      </svg>
    </AbsoluteFill>
  );
};

const Pill: React.FC<{text: string; u: number; p: number; dark?: boolean}> = ({text, u, p, dark}) => (
  <div
    style={{
      ...kickerStyle(u, dark ? INK : PAPER), fontSize: 24 * u, letterSpacing: '0.24em',
      padding: `${12 * u}px ${26 * u}px`, borderRadius: 999,
      border: `${1.5 * u}px solid ${dark ? 'rgba(10,10,11,0.25)' : 'rgba(245,245,247,0.35)'}`,
      background: dark ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
      opacity: p, transform: `translateY(${(1 - p) * 14 * u}px)`,
    }}
  >
    {text}
  </div>
);

/* ---------- layers ---------- */
const VideoLayer: React.FC<{l: Extract<Layer, {kind: 'video'}>}> = ({l}) => {
  const {fps, lt, dur, u} = useLayer(l);
  const kb = l.zoom === 'in' ? interpolate(lt, [0, dur], [1.02, 1.1]) : l.zoom === 'out' ? interpolate(lt, [0, dur], [1.1, 1.02]) : 1.02;
  const pop = interpolate(lt, [0, 0.22], [1.06, 1], {...cl, easing: EASE});
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <AbsoluteFill style={{transform: `scale(${kb * pop})`, filter: l.bw ? 'grayscale(1) contrast(1.12)' : undefined}}>
        <OffthreadVideo src={staticFile(l.src)} startFrom={Math.round((l.trimFrom ?? 0) * fps)} playbackRate={l.rate ?? 1} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      {l.label && (
        <div style={{position: 'absolute', top: 70 * u, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <Pill text={l.label} u={u} p={ramp(lt, 0.1, 0.4)} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// a vertical clip as a centred 9:16 "device" panel over its own blurred, darkened copy
const PortraitLayer: React.FC<{l: Extract<Layer, {kind: 'portrait'}>}> = ({l}) => {
  const {fps, lt, dur, u, width} = useLayer(l);
  const p = ramp(lt, 0, 0.55);
  const h = 900 * u;
  const w = (h * 9) / 16;
  const cx = l.side === 'left' ? width * 0.3 : l.side === 'right' ? width * 0.7 : width / 2;
  const src = staticFile(l.src);
  const from = Math.round((l.trimFrom ?? 0) * fps);
  return (
    <AbsoluteFill style={{backgroundColor: 'black', opacity: fadeEdges(lt, dur, 0.15, 0.2)}}>
      <AbsoluteFill style={{filter: 'blur(40px) brightness(0.35) grayscale(0.6)', transform: 'scale(1.2)'}}>
        <OffthreadVideo src={src} startFrom={from} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute', left: cx - w / 2, top: (1080 * u - h) / 2, width: w, height: h, borderRadius: 36 * u, overflow: 'hidden',
          boxShadow: '0 40px 120px rgba(0,0,0,0.6)', border: `${2 * u}px solid rgba(255,255,255,0.14)`,
          transform: `translateY(${(1 - p) * 60 * u}px) scale(${0.94 + 0.06 * p})`, opacity: p,
        }}
      >
        <OffthreadVideo src={src} startFrom={from} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      {l.label && (
        <div style={{position: 'absolute', top: '50%', ...(l.side === 'right' ? {left: 140 * u} : {right: 140 * u}), transform: 'translateY(-50%)', textAlign: l.side === 'right' ? 'left' : 'right', width: 560 * u}}>
          <div style={kickerStyle(u)}><Reveal text={l.sub ?? ''} lt={lt} at={0.2} style={{}} /></div>
          <div style={{...headStyle(u, 120), marginTop: 18 * u}}><Reveal text={l.label} lt={lt} at={0.3} style={{}} /></div>
        </div>
      )}
    </AbsoluteFill>
  );
};

const TitleLayer: React.FC<{l: Extract<Layer, {kind: 'title'}>}> = ({l}) => {
  const {lt, dur, u} = useLayer(l);
  const dark = l.bg !== 'paper';
  const fg = dark ? PAPER : INK;
  const at = l.at ?? [0.1, 0.25, 0.6];
  const lineW = ramp(lt, at[1] + 0.15, 0.7);
  return (
    <AbsoluteFill style={{opacity: fadeEdges(lt, dur, 0.18, 0.22)}}>
      <Backdrop bg={l.bg} lt={lt} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: `0 ${140 * u}px`, textAlign: 'center'}}>
        {l.kicker && <div style={{...kickerStyle(u, dark ? MUTED : 'rgba(10,10,11,0.5)'), marginBottom: 34 * u, opacity: ramp(lt, at[0], 0.5)}}>{l.kicker}</div>}
        <div style={{transform: `scale(${1.04 - 0.04 * ramp(lt, at[1], 1.6)})`}}>
          <Reveal text={l.text} lt={lt} at={at[1]} style={headStyle(u, l.text.length > 18 ? 118 : 160, fg)} />
          {l.italic && (
            <div style={{marginTop: 6 * u}}>
              <Reveal text={l.italic} lt={lt} at={at[1] + 0.25} style={serifStyle(u, l.text.length > 18 ? 118 : 150, fg)} />
            </div>
          )}
        </div>
        <div style={{width: 220 * u * lineW, height: 2 * u, background: fg, opacity: 0.35, marginTop: 44 * u}} />
        {l.sub && <div style={{...kickerStyle(u, dark ? MUTED : 'rgba(10,10,11,0.55)'), marginTop: 30 * u, letterSpacing: '0.12em', textTransform: 'none', fontWeight: 500, fontSize: 36 * u, opacity: ramp(lt, at[2], 0.5)}}>{l.sub}</div>}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ListLayer: React.FC<{l: Extract<Layer, {kind: 'list'}>}> = ({l}) => {
  const {lt, dur, u, abs} = useLayer(l);
  return (
    <AbsoluteFill style={{opacity: fadeEdges(lt, dur, 0.2, 0.25)}}>
      <Backdrop bg={l.bg} lt={lt} />
      <AbsoluteFill style={{justifyContent: 'center', paddingLeft: 300 * u, paddingRight: 200 * u}}>
        <div style={{...kickerStyle(u), marginBottom: 46 * u, opacity: ramp(lt, 0.05, 0.5)}}>{l.title}</div>
        {l.items.map((it, i) => {
          const p = ramp(abs, it.at, 0.55);
          const active = l.items.filter((x) => x.at <= abs + 0.01).length - 1 === i;
          const check = ramp(abs, it.at + 0.15, 0.35);
          const st = it.strike !== undefined ? ramp(abs, it.strike, 0.35) : 0;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 36 * u, margin: `${16 * u}px 0`, opacity: p * (active ? 1 : 0.42), transform: `translateX(${(1 - p) * 40 * u}px)`, filter: `blur(${(1 - p) * 10}px)`}}>
              <div style={{width: 64 * u, height: 64 * u, borderRadius: 999, border: `${2.5 * u}px solid ${PAPER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? PAPER : 'transparent', flexShrink: 0}}>
                {l.cross ? (
                  <svg width={30 * u} height={30 * u} viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" fill="none" stroke={active ? INK : PAPER} strokeWidth={3} strokeLinecap="round" strokeDasharray={40} strokeDashoffset={40 * (1 - check)} /></svg>
                ) : l.numbered ? (
                  <span style={{...headStyle(u, 30, active ? INK : PAPER), letterSpacing: 0}}>{i + 1}</span>
                ) : (
                  <svg width={34 * u} height={34 * u} viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke={active ? INK : PAPER} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - check)} /></svg>
                )}
              </div>
              <div style={{position: 'relative', opacity: 1 - 0.45 * st}}>
                <div style={headStyle(u, 84)}>{it.text}</div>
                {st > 0 && <div style={{position: 'absolute', left: -8 * u, top: '52%', height: 6 * u, width: `calc(${st * 100}% + ${16 * u}px)`, background: PAPER, borderRadius: 9}} />}
                {it.sub && <div style={{...kickerStyle(u), fontSize: 24 * u, marginTop: 10 * u}}>{it.sub}</div>}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Physique analysis: photo in a card, scan line sweeps, rings draw on weak points, bar meter + verdict
const AnalyzeLayer: React.FC<{l: Extract<Layer, {kind: 'analyze'}>}> = ({l}) => {
  const {lt, dur, u, abs} = useLayer(l);
  const ih = 860 * u;
  const iw = ih * 0.72;
  const x0 = 260 * u;
  const y0 = (1080 * u - ih) / 2;
  const enter = ramp(lt, 0, 0.6);
  const scanAt = l.scanAt ?? l.start + 0.4;
  const scan = interpolate(abs, [scanAt, scanAt + 1.1], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)});
  const scanOn = abs > scanAt && abs < scanAt + 1.25;
  const firstPin = Math.min(...l.pins.map((p) => p.at));
  const dimRest = ramp(abs, firstPin, 0.6);
  return (
    <AbsoluteFill style={{opacity: fadeEdges(lt, dur, 0.2, 0.25)}}>
      <Backdrop bg="ink" lt={lt} />
      {/* photo card */}
      <div style={{position: 'absolute', left: x0, top: y0, width: iw, height: ih, borderRadius: 28 * u, overflow: 'hidden', opacity: enter, transform: `translateY(${(1 - enter) * 50 * u}px)`, boxShadow: '0 30px 90px rgba(0,0,0,0.7)', border: `${2 * u}px solid rgba(255,255,255,0.12)`}}>
        <Img src={staticFile(l.src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `grayscale(1) contrast(1.1) brightness(${1 - 0.35 * dimRest})`}} />
        {/* spotlight holes on pins: re-draw the photo brighter inside each ring */}
        {l.pins.map((p, i) => {
          const s = ramp(abs, p.at, 0.6);
          return (
            <div key={i} style={{position: 'absolute', inset: 0, clipPath: `circle(${p.r * iw * s}px at ${p.x * 100}% ${p.y * 100}%)`}}>
              <Img src={staticFile(l.src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.15) brightness(1.08)'}} />
            </div>
          );
        })}
        {/* corner ticks */}
        {[0, 1, 2, 3].map((k) => (
          <div key={k} style={{position: 'absolute', width: 40 * u, height: 40 * u, [k < 2 ? 'top' : 'bottom']: 22 * u, [k % 2 ? 'right' : 'left']: 22 * u,
            borderTop: k < 2 ? `${3 * u}px solid ${PAPER}` : undefined, borderBottom: k >= 2 ? `${3 * u}px solid ${PAPER}` : undefined,
            borderLeft: k % 2 === 0 ? `${3 * u}px solid ${PAPER}` : undefined, borderRight: k % 2 ? `${3 * u}px solid ${PAPER}` : undefined, opacity: 0.8}} />
        ))}
        {scanOn && (
          <div style={{position: 'absolute', left: 0, right: 0, top: `${scan * 100}%`, height: 3 * u, background: PAPER, boxShadow: `0 0 ${30 * u}px ${8 * u}px rgba(255,255,255,0.35)`}} />
        )}
        {scanOn && <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: `${scan * 100}%`, background: 'linear-gradient(180deg, rgba(255,255,255,0) 70%, rgba(255,255,255,0.12) 100%)'}} />}
        <div style={{position: 'absolute', left: 30 * u, bottom: 28 * u, ...kickerStyle(u, PAPER), fontSize: 22 * u}}>{l.tag}</div>
      </div>
      {/* rings + leader lines */}
      <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        {l.pins.map((p, i) => {
          const s = ramp(abs, p.at, 0.7);
          const cx = x0 + p.x * iw;
          const cy = y0 + p.y * ih;
          const r = p.r * iw;
          const circ = 2 * Math.PI * r;
          const lx = x0 + iw + 70 * u;
          const ln = ramp(abs, p.at + 0.35, 0.45);
          const pulse = 1 + 0.03 * Math.sin((abs - p.at) * 5);
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r * pulse} fill="none" stroke={PAPER} strokeWidth={3.5 * u} strokeDasharray={circ} strokeDashoffset={circ * (1 - s)} transform={`rotate(-90 ${cx} ${cy})`} />
              <circle cx={cx} cy={cy} r={(r + 14 * u) * pulse} fill="none" stroke={PAPER} strokeOpacity={0.3 * s} strokeWidth={1.5 * u} />
              <line x1={cx + r} y1={cy} x2={cx + r + (lx - cx - r) * ln} y2={cy} stroke={PAPER} strokeWidth={2 * u} strokeOpacity={0.8} />
              <circle cx={lx} cy={cy} r={6 * u * ln} fill={PAPER} />
            </g>
          );
        })}
      </svg>
      {/* pin labels */}
      {l.pins.map((p, i) => {
        const ln = ramp(abs, p.at + 0.55, 0.5);
        return (
          <div key={i} style={{position: 'absolute', left: x0 + iw + 100 * u, top: y0 + p.y * ih, transform: `translateY(-50%) translateX(${(1 - ln) * 30 * u}px)`, opacity: ln, filter: `blur(${(1 - ln) * 8}px)`}}>
            <div style={headStyle(u, 96)}>{p.text}</div>
          </div>
        );
      })}
      {/* bars */}
      {l.bars && (
        <div style={{position: 'absolute', left: x0 + iw + 100 * u, bottom: 150 * u, width: 760 * u}}>
          {l.bars.map((b, i) => {
            const p = ramp(abs, b.at, 0.9);
            return (
              <div key={i} style={{marginTop: 26 * u, opacity: ramp(abs, b.at - 0.1, 0.3)}}>
                <div style={{display: 'flex', justifyContent: 'space-between', ...kickerStyle(u, b.hot ? PAPER : MUTED), fontSize: 22 * u}}>
                  <span>{b.label}</span>
                  <span>{Math.round(b.v * 100 * p)}%</span>
                </div>
                <div style={{height: 10 * u, borderRadius: 99, background: 'rgba(255,255,255,0.1)', marginTop: 10 * u, overflow: 'hidden'}}>
                  <div style={{height: '100%', width: `${b.v * 100 * p}%`, background: b.hot ? PAPER : 'rgba(255,255,255,0.35)', borderRadius: 99}} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {l.verdict && (
        <div style={{position: 'absolute', left: x0 + iw + 100 * u, top: y0 + 10 * u, opacity: ramp(abs, l.verdict.at, 0.5)}}>
          <div style={kickerStyle(u)}>{l.verdict.text}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// exercise card: big index number outline, name reveal, muscle tag, set pills, animated line art bar
const ExerciseLayer: React.FC<{l: Extract<Layer, {kind: 'exercise'}>}> = ({l}) => {
  const {lt, dur, u} = useLayer(l);
  const a = l.at ? l.at - l.start : 0.05;
  const idx = ramp(lt, a, 0.8);
  return (
    <AbsoluteFill style={{opacity: fadeEdges(lt, dur, 0.18, 0.22)}}>
      <Backdrop bg="dim" lt={lt} />
      <AbsoluteFill style={{background: 'rgba(5,5,6,0.55)'}} />
      <div style={{position: 'absolute', left: 150 * u, top: '50%', transform: 'translateY(-50%)', ...headStyle(u, 520, 'transparent'), WebkitTextStroke: `${2.5 * u}px rgba(245,245,247,${0.35 * idx})`, letterSpacing: '-0.06em', transformOrigin: 'left center', scale: `${0.92 + 0.08 * idx}`}}>{l.index}</div>
      <div style={{position: 'absolute', left: 760 * u, top: '50%', transform: 'translateY(-50%)', width: 1050 * u}}>
        <div style={{...kickerStyle(u), opacity: ramp(lt, a + 0.1, 0.4)}}>{l.muscle}</div>
        <div style={{marginTop: 22 * u}}>
          <span style={{display: 'block', textAlign: 'left'}}><Reveal text={l.name} lt={lt} at={a + 0.2} style={headStyle(u, l.name.length > 14 ? 110 : 140)} /></span>
        </div>
        <div style={{display: 'flex', gap: 16 * u, marginTop: 40 * u}}>
          {(l.pills ?? []).map((p, i) => <Pill key={i} text={p} u={u} p={ramp(lt, a + 0.6 + i * 0.12, 0.45)} />)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CounterLayer: React.FC<{l: Extract<Layer, {kind: 'counter'}>}> = ({l}) => {
  const {lt, dur, u} = useLayer(l);
  const p = interpolate(lt, [0.15, Math.min(dur - 0.4, 1.6)], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  const v = Math.round(l.from + (l.to - l.from) * p);
  return (
    <AbsoluteFill style={{opacity: fadeEdges(lt, dur, 0.18, 0.22)}}>
      <Backdrop bg="ink" lt={lt} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <div style={{...kickerStyle(u), opacity: ramp(lt, 0, 0.4)}}>{l.label}</div>
        <div style={{...headStyle(u, 300), fontVariantNumeric: 'tabular-nums', marginTop: 10 * u}}>
          {v}
          <span style={{...serifStyle(u, 200), marginLeft: 18 * u}}>{l.suffix}</span>
        </div>
        {l.sub && <div style={{...kickerStyle(u), letterSpacing: '0.1em', textTransform: 'none', fontSize: 36 * u, opacity: ramp(lt, 0.9, 0.5)}}>{l.sub}</div>}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Media: React.FC<{src: string; video?: boolean; trimFrom?: number; bw?: boolean}> = ({src, video, trimFrom, bw}) => {
  const {fps} = useVideoConfig();
  const st: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', filter: bw ? 'grayscale(1) contrast(1.1)' : undefined};
  return video ? <OffthreadVideo src={staticFile(src)} startFrom={Math.round((trimFrom ?? 0) * fps)} muted style={st} /> : <Img src={staticFile(src)} style={st} />;
};

const SplitLayer: React.FC<{l: Extract<Layer, {kind: 'split'}>}> = ({l}) => {
  const {lt, dur, u, width} = useLayer(l);
  const h = 880 * u;
  const w = (h * 3) / 4;
  const pl = ramp(lt, 0.0, 0.6);
  const pr = ramp(lt, 0.35, 0.6);
  const card = (side: 'l' | 'r', p: number, m: {src: string; label: string; video?: boolean; trimFrom?: number}) => (
    <div style={{position: 'absolute', top: (1080 * u - h) / 2 + 30 * u, left: side === 'l' ? width / 2 - w - 30 * u : width / 2 + 30 * u, width: w, height: h, opacity: p, transform: `translateY(${(1 - p) * 60 * u}px)`}}>
      <div style={{width: '100%', height: '100%', borderRadius: 30 * u, overflow: 'hidden', border: `${2 * u}px solid rgba(255,255,255,0.14)`, boxShadow: '0 30px 90px rgba(0,0,0,0.6)'}}>
        <Media src={m.src} video={m.video} trimFrom={m.trimFrom} bw={side === 'l'} />
      </div>
      <div style={{position: 'absolute', bottom: -64 * u, left: 0, right: 0, textAlign: 'center', ...kickerStyle(u, PAPER)}}>{m.label}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{opacity: fadeEdges(lt, dur, 0.15, 0.25)}}>
      <Backdrop bg="ink" lt={lt} />
      {l.title && <div style={{position: 'absolute', top: 40 * u, left: 0, right: 0, textAlign: 'center', ...kickerStyle(u)}}>{l.title}</div>}
      {card('l', pl, l.left)}
      {card('r', pr, l.right)}
    </AbsoluteFill>
  );
};

const PyramidLayer: React.FC<{l: Extract<Layer, {kind: 'pyramid'}>}> = ({l}) => {
  const {lt, dur, u, abs, width} = useLayer(l);
  const n = l.tiers.length;
  const th = 150 * u;
  const base = 1300 * u;
  const top = 380 * u;
  return (
    <AbsoluteFill style={{opacity: fadeEdges(lt, dur, 0.2, 0.25)}}>
      <Backdrop bg="ink" lt={lt} />
      <div style={{position: 'absolute', top: 90 * u, left: 0, right: 0, textAlign: 'center', ...kickerStyle(u)}}>{l.title}</div>
      {l.tiers.map((t, i) => {
        // tier 0 = base (bottom)
        const wTier = base - ((base - top) * i) / Math.max(1, n - 1);
        const p = ramp(abs, t.at, 0.55);
        const active = l.tiers.filter((x) => x.at <= abs + 0.01).length - 1 === i;
        return (
          <div key={i} style={{position: 'absolute', left: (width - wTier) / 2, width: wTier, height: th - 16 * u, top: 1080 * u - 150 * u - (i + 1) * th, borderRadius: 18 * u,
            background: active ? PAPER : 'rgba(255,255,255,0.07)', border: `${1.5 * u}px solid rgba(255,255,255,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: p, transform: `translateY(${(1 - p) * -40 * u}px)`}}>
            <span style={{...headStyle(u, 56, active ? INK : PAPER), letterSpacing: '-0.03em'}}>{t.text}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const EquationLayer: React.FC<{l: Extract<Layer, {kind: 'equation'}>}> = ({l}) => {
  const {lt, dur, u, abs} = useLayer(l);
  return (
    <AbsoluteFill style={{opacity: fadeEdges(lt, dur, 0.2, 0.25)}}>
      <Backdrop bg="ink" lt={lt} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 36 * u, flexWrap: 'wrap', justifyContent: 'center', padding: `0 ${120 * u}px`}}>
          {l.parts.map((p, i) => {
            const s = ramp(abs, p.at, 0.5);
            const isOp = /^[+=×→−≠>]$/.test(p.text);
            return (
              <span key={i} style={{...(isOp ? {...headStyle(u, 110, MUTED), fontWeight: 300} : p.hot ? serifStyle(u, 150) : headStyle(u, 120)), opacity: s, filter: `blur(${(1 - s) * 12}px)`, transform: `translateY(${(1 - s) * 24 * u}px)`, display: 'inline-block'}}>
                {p.text}
              </span>
            );
          })}
        </div>
        {l.sub && <div style={{...kickerStyle(u), marginTop: 50 * u, opacity: ramp(abs, l.parts[l.parts.length - 1].at + 0.3, 0.5)}}>{l.sub}</div>}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- explainer graphics ---------- */
// minimal line-drawn figure. S = shoulder half-width, W = waist half-width, B = belly bulge half-width
const figurePath = (S: number, W: number, B: number) => {
  const c = 150;
  const L = (x: number) => c - x;
  const R = (x: number) => c + x;
  return [
    // torso
    `M ${c - 22} 118 L ${L(S - 6)} 146 Q ${L(S + 4)} 152 ${L(S)} 176 L ${L(S - 18)} 214`,
    `Q ${L(B)} 285 ${L(W)} 352 L ${L(W + 4)} 392`,
    `L ${R(W + 4)} 392 L ${R(W)} 352 Q ${R(B)} 285 ${R(S - 18)} 214`,
    `L ${R(S)} 176 Q ${R(S + 4)} 152 ${R(S - 6)} 146 L ${c + 22} 118`,
    // arms
    `M ${L(S)} 176 L ${L(S + 14)} 300 L ${L(S + 10)} 384`,
    `M ${R(S)} 176 L ${R(S + 14)} 300 L ${R(S + 10)} 384`,
    // legs
    `M ${L(W + 4)} 392 L ${L(W - 2)} 590`,
    `M ${R(W + 4)} 392 L ${R(W - 2)} 590`,
    `M ${c - 8} 420 L ${c - 12} 590 M ${c + 8} 420 L ${c + 12} 590`,
  ].join(' ');
};
const BODY_TYPES = [
  {name: 'Skinny', S: 52, W: 36, B: 34},
  {name: 'Average', S: 66, W: 50, B: 54},
  {name: 'Overweight', S: 74, W: 78, B: 104},
];

const BodiesLayer: React.FC<{l: Extract<Layer, {kind: 'bodies'}>}> = ({l}) => {
  const {lt, dur, u, abs} = useLayer(l);
  const cur = [...l.active].reverse().find((a) => abs >= a.at);
  return (
    <AbsoluteFill style={{opacity: fadeEdges(lt, dur, 0.2, 0.25)}}>
      <Backdrop bg="ink" lt={lt} />
      {l.title && <div style={{position: 'absolute', top: 80 * u, left: 0, right: 0, textAlign: 'center', ...kickerStyle(u), opacity: ramp(lt, 0, 0.4)}}>{l.title}</div>}
      <div style={{position: 'absolute', left: 0, right: 0, top: 170 * u, display: 'flex', justifyContent: 'center', gap: 120 * u}}>
        {BODY_TYPES.map((b, i) => {
          const draw = ramp(lt, 0.05 + i * 0.12, 0.9);
          const on = cur?.i === i;
          const onP = cur?.i === i ? ramp(abs, cur.at, 0.4) : 0;
          const head = (
            <circle cx={150} cy={74} r={36} fill="none" stroke={PAPER} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          );
          return (
            <div key={i} style={{textAlign: 'center', opacity: cur ? 0.28 + 0.72 * (on ? 1 : 0) : 0.9, transform: `scale(${1 + 0.08 * onP}) translateY(${-14 * onP * u}px)`, transition: 'none'}}>
              <svg width={300 * u * 0.95} height={600 * u * 0.95} viewBox="0 0 300 600" style={{overflow: 'visible', filter: on ? `drop-shadow(0 0 ${18 * u}px rgba(255,255,255,0.35))` : undefined}}>
                {head}
                <path d={figurePath(b.S, b.W, b.B)} fill={on ? 'rgba(255,255,255,0.07)' : 'none'} stroke={PAPER} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
              </svg>
              <div style={{...kickerStyle(u, PAPER), marginTop: 26 * u, fontSize: 28 * u}}>{b.name}</div>
              <div style={{width: 60 * u * onP, height: 3 * u, background: PAPER, margin: `${14 * u}px auto 0`}} />
            </div>
          );
        })}
      </div>
      {l.note && (
        <div style={{position: 'absolute', bottom: 70 * u, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div style={{opacity: ramp(abs, l.note.at, 0.4), transform: `translateY(${(1 - ramp(abs, l.note.at, 0.4)) * 20 * u}px)`, ...headStyle(u, 56, INK), background: PAPER, padding: `${18 * u}px ${40 * u}px`, borderRadius: 999, letterSpacing: '-0.03em'}}>{l.note.text}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.cos((a - 90) * (Math.PI / 180)), cy + r * Math.sin((a - 90) * (Math.PI / 180))];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};

const RatioLayer: React.FC<{l: Extract<Layer, {kind: 'ratio'}>}> = ({l}) => {
  const {lt, dur, u, abs, width} = useLayer(l);
  const grow = ramp(abs, l.aAt, 1.0);
  const morph = l.b !== undefined && l.bAt !== undefined ? ramp(abs, l.bAt, 0.9) : 0;
  const target = l.a + ((l.b ?? l.a) - l.a) * morph;
  const v = target * grow;
  const rest = ramp(abs, l.restAt, 0.6);
  const R = 300 * u;
  const cx = width * 0.36;
  const cy = 560 * u;
  const deg = (v / 100) * 360;
  const pct = Math.round(v);
  return (
    <AbsoluteFill style={{opacity: fadeEdges(lt, dur, 0.2, 0.25)}}>
      <Backdrop bg="ink" lt={lt} />
      <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={46 * u} />
        {deg > 0.5 && <path d={arc(cx, cy, R, 0, Math.min(359.9, deg))} fill="none" stroke={PAPER} strokeWidth={46 * u} strokeLinecap="butt" />}
        {rest > 0 && deg < 359 && (
          <path d={arc(cx, cy, R, deg + 2, deg + 2 + (358 - deg - 2) * rest)} fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth={46 * u} />
        )}
      </svg>
      <div style={{position: 'absolute', left: cx - R, width: 2 * R, top: cy - 100 * u, textAlign: 'center'}}>
        <div style={{...headStyle(u, 150), fontVariantNumeric: 'tabular-nums'}}>
          {pct}
          <span style={{...serifStyle(u, 110), marginLeft: 6 * u}}>%</span>
        </div>
        <div style={{...kickerStyle(u), marginTop: 6 * u}}>{l.labelA}</div>
      </div>
      <div style={{position: 'absolute', left: width * 0.6, top: 300 * u, width: width * 0.32}}>
        <div style={{...kickerStyle(u), opacity: ramp(lt, 0.05, 0.4)}}>{l.title}</div>
        {l.sub && <div style={{...headStyle(u, 64), marginTop: 22 * u, opacity: ramp(lt, 0.2, 0.5), letterSpacing: '-0.035em', lineHeight: 1.05}}>{l.sub}</div>}
        <div style={{marginTop: 60 * u, display: 'flex', flexDirection: 'column', gap: 22 * u}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20 * u, opacity: grow}}>
            <div style={{width: 26 * u, height: 26 * u, borderRadius: 99, background: PAPER}} />
            <span style={headStyle(u, 54)}>{l.labelA} · {Math.round(target)}%</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 20 * u, opacity: rest}}>
            <div style={{width: 26 * u, height: 26 * u, borderRadius: 99, background: 'rgba(255,255,255,0.32)'}} />
            <span style={headStyle(u, 54, MUTED)}>{l.labelB} · {100 - Math.round(target)}%</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// line-drawn V-taper torso with measurement arrows
const VTaperLayer: React.FC<{l: Extract<Layer, {kind: 'vtaper'}>}> = ({l}) => {
  const {lt, dur, u, abs, width} = useLayer(l);
  const draw = ramp(lt, 0.05, 1.1);
  const sc = 1.25 * u;
  const ox = width * 0.33 - 300 * sc;
  const oy = 150 * u;
  const torso =
    'M 255 70 Q 250 105 200 118 L 128 140 Q 92 152 90 200 L 98 250 Q 150 300 185 370 L 205 470 L 210 545 ' +
    'L 390 545 L 395 470 L 415 370 Q 450 300 502 250 L 510 200 Q 508 152 472 140 L 400 118 Q 350 105 345 70';
  const arms = 'M 90 200 Q 70 260 72 330 Q 74 400 88 470 M 132 250 Q 125 320 130 400 M 510 200 Q 530 260 528 330 Q 526 400 512 470 M 468 250 Q 475 320 470 400';
  const abs6 = 'M 300 250 L 300 470 M 250 300 L 350 300 M 255 360 L 345 360 M 260 420 L 340 420';
  const curPart = [...l.parts].reverse().find((p) => abs >= p.at)?.part;
  const hl = (part: string) => (curPart === part ? 1 : 0);
  const arrow = (x1: number, x2: number, y: number, p: number) => {
    const m = (x1 + x2) / 2;
    const a = m - (m - x1) * p;
    const b = m + (x2 - m) * p;
    return (
      <g opacity={p} stroke={PAPER} strokeWidth={3} fill="none" strokeLinecap="round">
        <line x1={a} y1={y} x2={b} y2={y} strokeDasharray="10 8" />
        <path d={`M ${a + 14} ${y - 10} L ${a} ${y} L ${a + 14} ${y + 10}`} />
        <path d={`M ${b - 14} ${y - 10} L ${b} ${y} L ${b - 14} ${y + 10}`} />
      </g>
    );
  };
  const pOf = (part: string) => {
    const p = l.parts.find((x) => x.part === part);
    return p ? ramp(abs, p.at, 0.5) : 0;
  };
  return (
    <AbsoluteFill style={{opacity: fadeEdges(lt, dur, 0.2, 0.25)}}>
      <Backdrop bg="ink" lt={lt} />
      <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${ox} ${oy}) scale(${sc})`}>
          <circle cx={300} cy={10} r={52} fill="none" stroke={PAPER} strokeOpacity={0.5} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          <path d={torso} fill="rgba(255,255,255,0.03)" stroke={PAPER} strokeWidth={3.5} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          <path d={arms} fill="none" stroke={PAPER} strokeOpacity={0.35 + 0.65 * hl('arms')} strokeWidth={3.5 + 3 * hl('arms')} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          <path d={abs6} fill="none" stroke={PAPER} strokeOpacity={0.18} strokeWidth={2.5} strokeLinecap="round" />
          {/* lats glow */}
          <path d="M 98 250 Q 150 300 185 370 M 502 250 Q 450 300 415 370" fill="none" stroke={PAPER} strokeWidth={9} strokeLinecap="round" opacity={pOf('lats') * (0.4 + 0.6 * hl('lats'))} />
          {/* shoulders cap glow */}
          <path d="M 128 140 Q 92 152 90 200 M 472 140 Q 508 152 510 200" fill="none" stroke={PAPER} strokeWidth={9} strokeLinecap="round" opacity={pOf('shoulders') * (0.4 + 0.6 * hl('shoulders'))} />
          {arrow(60, 540, 120, pOf('shoulders'))}
          {arrow(190, 410, 505, pOf('waist'))}
          {/* V lines */}
          {l.final && (
            <g opacity={ramp(abs, l.final.at, 0.5)} stroke={PAPER} strokeWidth={3} strokeDasharray="4 10">
              <line x1={60} y1={120} x2={300} y2={640} />
              <line x1={540} y1={120} x2={300} y2={640} />
            </g>
          )}
        </g>
      </svg>
      <div style={{position: 'absolute', left: width * 0.6, top: 220 * u}}>
        {l.title && <div style={{...kickerStyle(u), marginBottom: 40 * u, opacity: ramp(lt, 0.1, 0.4)}}>{l.title}</div>}
        {l.parts.map((p, i) => {
          const s = ramp(abs, p.at, 0.45);
          const on = curPart === p.part;
          return (
            <div key={i} style={{...headStyle(u, 92, on ? PAPER : 'rgba(245,245,247,0.35)'), margin: `${18 * u}px 0`, opacity: s, transform: `translateX(${(1 - s) * 30 * u}px)`, filter: `blur(${(1 - s) * 8}px)`}}>
              {p.text}
            </div>
          );
        })}
        {l.final && (
          <div style={{marginTop: 30 * u, opacity: ramp(abs, l.final.at, 0.5)}}>
            <Reveal text={l.final.text} lt={abs} at={l.final.at} style={serifStyle(u, 120)} />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

const TilesLayer: React.FC<{l: Extract<Layer, {kind: 'tiles'}>}> = ({l}) => {
  const {lt, dur, u, abs} = useLayer(l);
  return (
    <AbsoluteFill style={{opacity: fadeEdges(lt, dur, 0.2, 0.25)}}>
      <Backdrop bg="ink" lt={lt} />
      <div style={{position: 'absolute', top: 170 * u, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{...kickerStyle(u), opacity: ramp(lt, 0, 0.4)}}>{l.title}</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330 * u, display: 'flex', justifyContent: 'center', gap: 34 * u}}>
        {l.items.map((it, i) => {
          const p = ramp(abs, it.at - 0.1, 0.5);
          const c = interpolate(abs, [it.at - 0.05, it.at + 0.55], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
          const done = ramp(abs, it.at + 0.55, 0.3);
          const r = 34 * u;
          const C = 2 * Math.PI * r;
          return (
            <div key={i} style={{width: 300 * u, height: 420 * u, borderRadius: 34 * u, background: `rgba(255,255,255,${0.05 + 0.9 * done * 0})`, border: `${1.5 * u}px solid rgba(255,255,255,${0.12 + 0.4 * done})`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 50 * u}px) scale(${0.96 + 0.04 * p})`}}>
              <div style={{...headStyle(u, 150), fontVariantNumeric: 'tabular-nums'}}>
                {Math.round(it.n * c)}
                {it.unit && <span style={{...serifStyle(u, 70), marginLeft: 6 * u}}>{it.unit}</span>}
              </div>
              <div style={{...kickerStyle(u, PAPER), fontSize: 26 * u, marginTop: 14 * u, letterSpacing: '0.18em'}}>{it.label}</div>
              <svg width={2 * r + 10 * u} height={2 * r + 10 * u} style={{marginTop: 34 * u}}>
                <circle cx={r + 5 * u} cy={r + 5 * u} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={3 * u} />
                <circle cx={r + 5 * u} cy={r + 5 * u} r={r} fill={done > 0.5 ? PAPER : 'none'} fillOpacity={done} stroke={PAPER} strokeWidth={3 * u} strokeDasharray={C} strokeDashoffset={C * (1 - c)} transform={`rotate(-90 ${r + 5 * u} ${r + 5 * u})`} />
                <path d={`M ${r - 10 * u} ${r + 6 * u} l ${10 * u} ${10 * u} l ${18 * u} ${-20 * u}`} fill="none" stroke={INK} strokeWidth={4 * u} strokeLinecap="round" strokeLinejoin="round" opacity={done} />
              </svg>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const PauseLayer: React.FC<{l: Extract<Layer, {kind: 'pause'}>}> = ({l}) => {
  const {lt, dur, u, abs, fps} = useLayer(l);
  const s = spring({frame: Math.round(lt * fps), fps, config: {damping: 12, stiffness: 160}});
  const bar = (dx: number) => (
    <div style={{width: 70 * u, height: 250 * u, borderRadius: 22 * u, background: INK, transform: `translateX(${dx}px) scaleY(${0.6 + 0.4 * s})`}} />
  );
  return (
    <AbsoluteFill style={{opacity: fadeEdges(lt, dur, 0.12, 0.25)}}>
      <Backdrop bg="paper" lt={lt} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <div style={{display: 'flex', gap: 60 * u, opacity: s, transform: `scale(${0.7 + 0.3 * s})`}}>
          {bar(0)}
          {bar(0)}
        </div>
        <div style={{marginTop: 70 * u}}>
          <Reveal text={l.text} lt={lt} at={0.25} style={headStyle(u, 110, INK)} />
        </div>
        {l.sub && (
          <div style={{marginTop: 18 * u}}>
            <Reveal text={l.sub} lt={abs} at={l.subAt ?? l.start + 0.8} style={serifStyle(u, 90, INK)} />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// pseudo-random but stable scatter positions
const scatter = (i: number) => {
  const a = Math.sin(i * 12.9898 + 4.1) * 43758.5453;
  const b = Math.sin(i * 78.233 + 1.7) * 12345.6789;
  const fx = a - Math.floor(a);
  const fy = b - Math.floor(b);
  const col = i % 4;
  const row = Math.floor(i / 4);
  return {x: 0.14 + col * 0.24 + (fx - 0.5) * 0.08, y: 0.24 + row * 0.25 + (fy - 0.5) * 0.08, r: (fx - 0.5) * 14};
};

const ChaosLayer: React.FC<{l: Extract<Layer, {kind: 'chaos'}>}> = ({l}) => {
  const {lt, dur, u, abs, width, height} = useLayer(l);
  const simple = ramp(abs, l.simpleAt, 0.6) * (1 - ramp(abs, l.allAt, 0.6));
  const fin = ramp(abs, l.finalAt, 0.5);
  return (
    <AbsoluteFill style={{opacity: fadeEdges(lt, dur, 0.2, 0.25)}}>
      <Backdrop bg="ink" lt={lt} />
      {l.title && <div style={{position: 'absolute', top: 70 * u, left: 0, right: 0, textAlign: 'center', ...kickerStyle(u), opacity: ramp(lt, 0, 0.4) * (1 - fin)}}>{l.title}</div>}
      {l.items.map((t, i) => {
        const pos = scatter(i);
        const appear = ramp(lt, 0.1 + i * 0.11, 0.4);
        const k = l.keep.indexOf(i);
        const kept = k >= 0;
        const tx = kept ? 0.5 + (k - (l.keep.length - 1) / 2) * 0.27 : pos.x;
        const ty = kept ? 0.5 : pos.y;
        const x = (pos.x + (tx - pos.x) * simple) * width;
        const y = (pos.y + (ty - pos.y) * simple) * height;
        const op = appear * (kept ? 1 : 1 - 0.85 * simple) * (1 - 0.8 * fin);
        const sc = kept ? 1 + 0.35 * simple : 1;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${pos.r * (1 - simple)}deg) scale(${sc * (0.9 + 0.1 * appear)})`, opacity: op, filter: `blur(${(kept ? 0 : simple * 6) + fin * 6}px)`,
            ...headStyle(u, 46, kept && simple > 0.5 ? INK : PAPER), letterSpacing: '-0.02em', whiteSpace: 'nowrap',
            padding: `${16 * u}px ${30 * u}px`, borderRadius: 999, background: kept && simple > 0.5 ? PAPER : 'rgba(255,255,255,0.06)', border: `${1.5 * u}px solid rgba(255,255,255,0.22)`}}>
            {t}
          </div>
        );
      })}
      {fin > 0 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <Reveal text={l.finalText} lt={abs} at={l.finalAt} style={headStyle(u, 170)} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const ChatLayer: React.FC<{l: Extract<Layer, {kind: 'chat'}>}> = ({l}) => {
  const {lt, dur, u, abs} = useLayer(l);
  return (
    <AbsoluteFill style={{opacity: fadeEdges(lt, dur, 0.2, 0.25)}}>
      <Backdrop bg="ink" lt={lt} />
      {l.title && <div style={{position: 'absolute', top: 120 * u, left: 0, right: 0, textAlign: 'center', ...kickerStyle(u), opacity: ramp(lt, 0, 0.4)}}>{l.title}</div>}
      <div style={{position: 'absolute', top: 240 * u, left: '50%', width: 1100 * u, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', gap: 26 * u}}>
        {l.msgs.map((m, i) => {
          const s = spring({frame: Math.round((abs - m.at) * 30), fps: 30, config: {damping: 14, stiffness: 200}});
          const shown = abs >= m.at;
          const right = i % 2 === 1;
          return (
            <div key={i} style={{alignSelf: right ? 'flex-end' : 'flex-start', opacity: shown ? 1 : 0, transform: `scale(${shown ? 0.7 + 0.3 * s : 0.7})`, transformOrigin: right ? 'right bottom' : 'left bottom',
              ...headStyle(u, 54, right ? INK : PAPER), letterSpacing: '-0.025em', lineHeight: 1.15, fontWeight: 600,
              background: right ? PAPER : 'rgba(255,255,255,0.12)', padding: `${24 * u}px ${38 * u}px`, borderRadius: 44 * u,
              borderBottomRightRadius: right ? 10 * u : 44 * u, borderBottomLeftRadius: right ? 44 * u : 10 * u, maxWidth: 900 * u}}>
              {m.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const TriptychLayer: React.FC<{l: Extract<Layer, {kind: 'triptych'}>}> = ({l}) => {
  const {lt, dur, u, abs, width, fps} = useLayer(l);
  const h = 760 * u;
  const w = (h * 9) / 16;
  const gap = 36 * u;
  const total = l.clips.length * w + (l.clips.length - 1) * gap;
  return (
    <AbsoluteFill style={{opacity: fadeEdges(lt, dur, 0.1, 0.22)}}>
      <Backdrop bg="ink" lt={lt} />
      {l.clips.map((c, i) => {
        const p = ramp(abs, c.at, 0.55);
        const x = (width - total) / 2 + i * (w + gap);
        return (
          <div key={i} style={{position: 'absolute', left: x, top: 90 * u, width: w, height: h, borderRadius: 28 * u, overflow: 'hidden', opacity: p,
            transform: `translateY(${(1 - p) * 120 * u}px)`, border: `${2 * u}px solid rgba(255,255,255,0.16)`, boxShadow: '0 30px 80px rgba(0,0,0,0.6)'}}>
            <Sequence from={Math.round((c.at - l.start) * fps)} layout="none">
              <OffthreadVideo src={staticFile(c.src)} startFrom={Math.round(c.trimFrom * fps)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </Sequence>
          </div>
        );
      })}
      <div style={{position: 'absolute', bottom: 70 * u, left: 0, right: 0, textAlign: 'center'}}>
        {l.kicker && <span style={{...kickerStyle(u), marginRight: 30 * u, opacity: ramp(abs, l.textAt, 0.4)}}>{l.kicker}</span>}
        <Reveal text={l.text} lt={abs} at={l.textAt} style={serifStyle(u, 110)} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- THE HOOK ---------- */
// Beats (seconds, local to the hook layer) in l.t:
//  flash  : white flash in
//  p1,p2,p3 : the three "2 years ago" photos slam in as a stacked deck (B&W, viewfinder)
//  date   : "2 YEARS AGO" year ticker
//  wipe   : vertical wipe → NOW (colour video, portrait panel), deck slides left, B&W→colour
//  now2   : second NOW clip swaps in
//  title  : headline lockup over the pair
const HookLayer: React.FC<{l: Extract<Layer, {kind: 'hook'}>}> = ({l}) => {
  const {lt, dur, u, width, fps} = useLayer(l);
  const T = l.t;
  const H = 1080 * u;

  // photo deck
  const ph = 760 * u;
  const pw = ph * 0.75;
  const deckShift = interpolate(lt, [T.wipe, T.wipe + 0.6], [0, -width * 0.17], {...cl, easing: EASE});
  const deckScale = interpolate(lt, [T.wipe, T.wipe + 0.6], [1, 0.88], {...cl, easing: EASE});
  const photoTimes = [T.p1, T.p2, T.p3];
  const rots = [-5, 4, -1.5];
  const offs = [[-30, 10], [26, -8], [0, 0]];

  // now panel
  const nowP = ramp(lt, T.wipe + 0.05, 0.6);
  const nw = pw;
  const nh = ph;
  const nowIdx = lt >= T.now2 ? 1 : 0;
  const nowClip = l.now[nowIdx];
  const nowStartLocal = nowIdx === 1 ? T.now2 : T.wipe;
  const flashA = interpolate(lt, [T.flash, T.flash + 0.25], [1, 0], cl) + interpolate(lt, [T.wipe - 0.04, T.wipe, T.wipe + 0.28], [0, 0.9, 0], cl);

  // date ticker
  const tick = interpolate(lt, [T.date, T.date + 0.5], [0, 1], {...cl, easing: EASE});
  const yearNow = 2026;
  const year = lt < T.wipe ? yearNow - 2 : Math.round(interpolate(lt, [T.wipe, T.wipe + 0.45], [yearNow - 2, yearNow], cl));

  // breathing zoom on the whole thing
  const breathe = 1 + 0.02 * ramp(lt, 0, dur);
  const outA = interpolate(lt, [dur - 0.2, dur], [1, 0], cl);
  const titleP = ramp(lt, T.title, 0.6);

  return (
    <AbsoluteFill style={{backgroundColor: '#000', opacity: outA}}>
      <Backdrop bg="ink" lt={lt} />
      <AbsoluteFill style={{transform: `scale(${breathe})`}}>
        {/* deck */}
        <div style={{position: 'absolute', left: width / 2 - pw / 2 + deckShift, top: (H - ph) / 2, width: pw, height: ph, transform: `scale(${deckScale})`}}>
          {l.old.map((src, i) => {
            const t0 = photoTimes[i];
            if (lt < t0) return null;
            const s = spring({frame: Math.round((lt - t0) * fps), fps, config: {damping: 15, stiffness: 260, mass: 0.7}});
            const sat = interpolate(lt, [T.wipe, T.wipe + 0.4], [0, 0], cl);
            return (
              <div key={i} style={{position: 'absolute', inset: 0, borderRadius: 22 * u, overflow: 'hidden', border: `${10 * u}px solid ${PAPER}`, borderBottomWidth: 64 * u, boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
                transform: `translate(${offs[i][0] * u}px, ${offs[i][1] * u}px) rotate(${rots[i] * s}deg) scale(${1.5 - 0.5 * s})`, opacity: Math.min(1, s * 1.6), background: PAPER}}>
                <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `grayscale(${1 - sat}) contrast(1.15) brightness(0.95)`}} />
              </div>
            );
          })}
          {/* deck label */}
          <div style={{position: 'absolute', bottom: -10 * u, left: 0, right: 0, textAlign: 'center', ...kickerStyle(u, INK), fontSize: 22 * u, opacity: lt > T.p3 ? 0.85 : 0, transform: `rotate(-1.5deg) translateY(${-14 * u}px)`}}>
            Then · Age 13
          </div>
        </div>

        {/* NOW panel (colour) */}
        {lt >= T.wipe && (
          <div style={{position: 'absolute', left: width / 2 - nw / 2 + width * 0.17, top: (H - nh) / 2, width: nw, height: nh, borderRadius: 30 * u, overflow: 'hidden',
            clipPath: `inset(${(1 - nowP) * 100}% 0 0 0 round ${30 * u}px)`, boxShadow: '0 40px 110px rgba(0,0,0,0.75)', border: `${2 * u}px solid rgba(255,255,255,0.25)`}}>
            <Sequence from={Math.round(nowStartLocal * fps)} layout="none">
              <OffthreadVideo key={nowIdx} src={staticFile(nowClip.src)} startFrom={Math.round(nowClip.trimFrom * fps)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </Sequence>
            <div style={{position: 'absolute', top: 28 * u, left: 28 * u, display: 'flex', alignItems: 'center', gap: 12 * u, ...kickerStyle(u, PAPER), fontSize: 22 * u}}>
              <div style={{width: 14 * u, height: 14 * u, borderRadius: 99, background: '#FF3B30', opacity: Math.floor(lt * 2) % 2 ? 1 : 0.35}} />
              Now · 15
            </div>
          </div>
        )}
      </AbsoluteFill>

      {/* +2 years connector between THEN and NOW */}
      {lt >= T.wipe + 0.3 && (() => {
        const c = ramp(lt, T.wipe + 0.35, 0.6);
        const cx = width * 0.5;
        return (
          <div style={{position: 'absolute', left: cx, top: H / 2, transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * c})`, opacity: c, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 * u}}>
            <svg width={120 * u} height={30 * u} viewBox="0 0 120 30">
              <path d="M 4 15 L 110 15 M 98 5 L 112 15 L 98 25" fill="none" stroke={PAPER} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - c} />
            </svg>
            <div style={{...kickerStyle(u, INK), fontSize: 22 * u, background: PAPER, padding: `${10 * u}px ${20 * u}px`, borderRadius: 999, letterSpacing: '0.18em'}}>+2 years</div>
          </div>
        );
      })()}
      {/* light-leak sweep on the wipe */}
      <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: interpolate(lt, [T.wipe - 0.05, T.wipe + 0.15, T.wipe + 0.7], [0, 0.85, 0], cl),
        background: `linear-gradient(100deg, rgba(255,255,255,0) ${interpolate(lt, [T.wipe - 0.05, T.wipe + 0.7], [-40, 100], cl)}%, rgba(255,255,255,0.9) ${interpolate(lt, [T.wipe - 0.05, T.wipe + 0.7], [-20, 120], cl)}%, rgba(255,255,255,0) ${interpolate(lt, [T.wipe - 0.05, T.wipe + 0.7], [0, 140], cl)}%)`}} />
      {/* viewfinder brackets */}
      {[0, 1, 2, 3].map((k) => {
        const p = ramp(lt, T.flash, 0.5);
        const m = (70 + (1 - p) * 60) * u;
        return (
          <div key={k} style={{position: 'absolute', width: 70 * u, height: 70 * u, [k < 2 ? 'top' : 'bottom']: m, [k % 2 ? 'right' : 'left']: m * 1.6,
            borderTop: k < 2 ? `${3 * u}px solid ${PAPER}` : undefined, borderBottom: k >= 2 ? `${3 * u}px solid ${PAPER}` : undefined,
            borderLeft: k % 2 === 0 ? `${3 * u}px solid ${PAPER}` : undefined, borderRight: k % 2 ? `${3 * u}px solid ${PAPER}` : undefined, opacity: 0.7 * p}} />
        );
      })}

      {/* top-left: year ticker */}
      <div style={{position: 'absolute', top: 104 * u, left: 150 * u, opacity: tick, transform: `translateY(${(1 - tick) * 20 * u}px)`}}>
        <div style={kickerStyle(u)}>{lt < T.wipe ? '2 years ago' : 'today'}</div>
        <div style={{...headStyle(u, 92), fontVariantNumeric: 'tabular-nums', marginTop: 6 * u}}>{year}</div>
      </div>
      {/* REC timecode top-right */}
      <div style={{position: 'absolute', top: 84 * u, right: 120 * u, ...kickerStyle(u, PAPER), fontSize: 24 * u, fontVariantNumeric: 'tabular-nums', opacity: ramp(lt, T.flash, 0.4) * 0.8}}>
        00:00:{String(Math.floor(lt)).padStart(2, '0')}:{String(Math.floor((lt % 1) * 30)).padStart(2, '0')}
      </div>

      {/* "Two years ago." line before the wipe */}
      {lt < T.wipe + 0.2 && (
        <div style={{position: 'absolute', bottom: 40 * u, left: 0, right: 0, textAlign: 'center', opacity: interpolate(lt, [T.wipe - 0.15, T.wipe + 0.05], [1, 0], cl)}}>
          <Reveal text="This was me," lt={lt} at={T.p1 + 0.05} style={headStyle(u, 96)} />
          <span style={{marginLeft: 26 * u}}><Reveal text="two years ago." lt={lt} at={T.date + 0.75} style={serifStyle(u, 104)} /></span>
        </div>
      )}
      {/* bottom title lockup */}
      {lt >= T.title && (
        <div style={{position: 'absolute', bottom: 40 * u, left: 0, right: 0, textAlign: 'center', opacity: titleP}}>
          <Reveal text="Lean & Aesthetic" lt={lt} at={T.title} style={headStyle(u, 96)} />
          <span style={{marginLeft: 26 * u}}><Reveal text="at 15." lt={lt} at={T.title + 0.2} style={serifStyle(u, 104)} /></span>
        </div>
      )}

      <AbsoluteFill style={{backgroundColor: 'white', opacity: Math.min(1, flashA), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

const LayerView: React.FC<{l: Layer}> = ({l}) => {
  switch (l.kind) {
    case 'video': return <VideoLayer l={l} />;
    case 'portrait': return <PortraitLayer l={l} />;
    case 'hook': return <HookLayer l={l} />;
    case 'title': return <TitleLayer l={l} />;
    case 'list': return <ListLayer l={l} />;
    case 'analyze': return <AnalyzeLayer l={l} />;
    case 'exercise': return <ExerciseLayer l={l} />;
    case 'counter': return <CounterLayer l={l} />;
    case 'split': return <SplitLayer l={l} />;
    case 'pyramid': return <PyramidLayer l={l} />;
    case 'equation': return <EquationLayer l={l} />;
    case 'bodies': return <BodiesLayer l={l} />;
    case 'ratio': return <RatioLayer l={l} />;
    case 'vtaper': return <VTaperLayer l={l} />;
    case 'tiles': return <TilesLayer l={l} />;
    case 'pause': return <PauseLayer l={l} />;
    case 'chaos': return <ChaosLayer l={l} />;
    case 'chat': return <ChatLayer l={l} />;
    case 'triptych': return <TriptychLayer l={l} />;
  }
};

const ARoll: React.FC<{plan: GlowPlan}> = ({plan}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  let scale = 1;
  for (const z of plan.zooms) {
    if (t >= z.start && t < z.end) {
      scale = z.snap ? z.scale : interpolate(t, [z.start, Math.min(z.start + 0.4, z.end)], [1, z.scale], {...cl, easing: EASE});
    }
  }
  return (
    <AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: '50% 30%'}}>
      <OffthreadVideo src={staticFile(plan.aroll)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

export const Glowup: React.FC<{plan: GlowPlan}> = ({plan}) => {
  const {fps} = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const hide = plan.layers.filter((l) => l.hideCaps).map((l) => [l.start, l.end] as [number, number]);
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {/* A-roll: gentle cinematic grade, slightly desaturated toward the monochrome look */}
      <AbsoluteFill style={{filter: 'contrast(1.08) saturate(0.82) brightness(1.03)'}}>{plan.aroll && <ARoll plan={plan} />}</AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)'}} />
      {plan.layers.map((l, i) => (
        <Sequence key={i} from={f(l.start)} durationInFrames={Math.max(1, f(l.end) - f(l.start))}>
          <LayerView l={l} />
        </Sequence>
      ))}
      <Captions words={plan.words} preset="serif" position={0.86} placements={plan.placements} hide={hide} />
      {plan.sfx.map((s, i) => (
        <Sequence key={`s${i}`} from={Math.max(0, f(s.at))}>
          <Audio src={staticFile(s.src)} volume={s.volume ?? 0.4} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
