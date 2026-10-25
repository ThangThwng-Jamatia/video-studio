// Motion Explainer kit (skill: .claude/skills/motion-explainer). Every mx video (src/motion/<Pascal>.tsx) imports from here.
// Kinetic type + 2.5D worlds + scene transitions + audio bed, all timed to word starts. Add reusable pieces here, not in video files.
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadSans} from '@remotion/google-fonts/InterTight';
import {loadFont as loadSerif} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as loadDisplay} from '@remotion/google-fonts/BricolageGrotesque';

export const SANS = loadSans().fontFamily;
export const SERIF = loadSerif('italic').fontFamily;
export const DISPLAY = loadDisplay().fontFamily;

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ramp = (t: number, a: number, b: number, from = 0, to = 1, ease = Easing.out(Easing.cubic)) =>
  interpolate(t, [a, b], [from, to], {...CL, easing: ease});
export const back = (t: number, a: number, dur = 0.35) => ramp(t, a, a + dur, 0, 1, Easing.out(Easing.back(1.8)));
const rnd = (i: number) => {const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x);};

// ---------- worlds (palettes + backgrounds). A "world" is the visual skin of a video; the directing rules stay the same. ----------
export type World = {name: string; bg: string; bg2: string; ink: string; dim: string; accent: string; accent2: string; glass: string; glow: string; dark: boolean};
export const WORLDS = {
  // dark desk-at-night studio: near-black, warm lamp pools, hot coral hero words, teal UI
  night: {name: 'night', bg: '#07080C', bg2: '#1A1220', ink: '#F4EFE6', dim: '#8A8594', accent: '#FF5A3C', accent2: '#3EE6D0', glass: 'rgba(255,255,255,0.07)', glow: '#FF8A4C', dark: true},
  // bright airy sky: pale blue-lilac haze, cobalt hero words, serif italic accents, frosted glass
  sky: {name: 'sky', bg: '#EEF2FF', bg2: '#F7EEF8', ink: '#171B2C', dim: '#A3A9BF', accent: '#3557F0', accent2: '#E5577A', glass: 'rgba(255,255,255,0.55)', glow: '#9DB4FF', dark: false},
  // Minor Money bridge: cream paper + terra/mustard (use when a video must sit on the paper-explainer channel)
  paper: {name: 'paper', bg: '#F4EBD6', bg2: '#EADCBF', ink: '#3B2F2A', dim: '#A8977F', accent: '#C8553D', accent2: '#E3A32B', glass: 'rgba(255,255,255,0.5)', glow: '#E3A32B', dark: false},
} satisfies Record<string, World>;
const WorldCtx = React.createContext<World>(WORLDS.night);
export const useWorld = () => React.useContext(WorldCtx);

// ---------- word timings ----------
export type Word = [string, number, number?];
// at(WORDS)('prompt', 2) = start of the 2nd "prompt" (punctuation/case ignored). Throws on a missing word so typos fail in tsc/still QA.
export const makeAt = (words: Word[]) => (token: string, nth = 1, after = 0) => {
  const k = token.toLowerCase().replace(/[^a-z0-9']/g, '');
  let n = 0;
  for (const [w, s] of words) if (s >= after && w.toLowerCase().replace(/[^a-z0-9']/g, '') === k && ++n === nth) return s;
  throw new Error(`word not found: ${token} #${nth}`);
};

// ---------- scenes + stage ----------
export type Trans = 'cut' | 'flash' | 'pixel' | 'blur' | 'glitch' | 'iris' | 'push';
export type Scene = {from: number; to: number; C: React.FC<{t: number; d: number}>; in?: Trans; world?: keyof typeof WORLDS; cam?: 'push' | 'pull' | 'drift' | 'still'};
export type Sfx = [number, string, number];

const TD = 0.32; // transition length (s)
export const MxStage: React.FC<{job?: string; sec: number; scenes: Scene[]; sfx?: Sfx[]; world?: keyof typeof WORLDS; musicVol?: number; captions?: Word[]}> = ({job, sec, scenes, sfx = [], world = 'night', musicVol = 0.12, captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cur = scenes.find((s) => t >= s.from && t < s.to) ?? scenes[scenes.length - 1];
  const W = WORLDS[cur.world ?? world];
  return (
    <WorldCtx.Provider value={W}>
      <AbsoluteFill style={{backgroundColor: W.bg, overflow: 'hidden', fontFamily: SANS}}>
        {scenes.map((s, i) => {
          if (t < s.from - 0.01 || t > s.to + TD) return null;
          const SW = WORLDS[s.world ?? world];
          const d = t - s.from;
          const tr = s.in ?? (i === 0 ? 'cut' : 'blur');
          const k = ramp(t, s.from, s.from + TD); // 0→1 entering
          const out = scenes[i + 1] && t >= s.to; // still drawn under the next scene's entrance
          const cam = s.cam ?? 'push';
          const z = cam === 'push' ? ramp(t, s.from, s.to, 1, 1.06, Easing.inOut(Easing.sin)) : cam === 'pull' ? ramp(t, s.from, s.to, 1.08, 1, Easing.inOut(Easing.sin)) : 1;
          const dx = cam === 'drift' || cam === 'push' ? Math.sin(t * 0.6 + i) * 10 : 0;
          const dy = cam === 'drift' || cam === 'push' ? Math.cos(t * 0.5 + i) * 6 : 0;
          let style: React.CSSProperties = {transform: `translate(${dx}px,${dy}px) scale(${z})`};
          if (!out && k < 1) {
            if (tr === 'blur') style = {...style, opacity: k, filter: `blur(${(1 - k) * 18}px)`, transform: `${style.transform} scale(${1.04 - 0.04 * k})`};
            if (tr === 'push') style = {...style, transform: `translateX(${(1 - k) * 8}%) ${style.transform}`, opacity: k};
            if (tr === 'iris') style = {...style, clipPath: `circle(${k * 75}% at 50% 50%)`};
            if (tr === 'glitch') style = {...style, transform: `${style.transform} translateX(${Math.round(rnd(frame) * 2 - 1) * (1 - k) * 60}px)`, filter: `hue-rotate(${(1 - k) * 90}deg) saturate(${1 + (1 - k) * 2})`};
          }
          return (
            <WorldCtx.Provider key={i} value={SW}>
              <AbsoluteFill style={{...style, zIndex: i, backgroundColor: SW.bg}}>
                <s.C t={t} d={d} />
              </AbsoluteFill>
            </WorldCtx.Provider>
          );
        })}
        {/* transition overlays drawn on top of everything */}
        {scenes.map((s, i) => {
          const d = t - s.from;
          if (i === 0 || d < -TD || d > TD) return null;
          const tr = s.in ?? 'blur';
          if (tr === 'flash') return <AbsoluteFill key={'f' + i} style={{zIndex: 900, background: `radial-gradient(circle at 50% 45%, #fff 0%, ${WORLDS[s.world ?? world].glow} 40%, transparent 75%)`, opacity: interpolate(d, [-TD, 0, TD], [0, 1, 0], CL), mixBlendMode: 'screen'}} />;
          if (tr === 'pixel') return <PixelWipe key={'p' + i} d={d} color={WORLDS[s.world ?? world].accent} seed={i} />;
          if (tr === 'glitch') return <Scanlines key={'g' + i} k={1 - Math.abs(d) / TD} />;
          return null;
        })}
        <Grain dark={W.dark} />
        <AbsoluteFill style={{zIndex: 950, pointerEvents: 'none', background: W.dark ? 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)' : 'radial-gradient(ellipse at center, transparent 65%, rgba(120,130,180,0.18) 100%)'}} />
        {captions && <MiniCaption words={captions} t={t} />}
        <AbsoluteFill style={{zIndex: 999, backgroundColor: '#000', opacity: ramp(t, sec - 0.5, sec)}} />
        {job && <Audio src={staticFile(`${job}/voice.mp3`)} />}
        {job && <Audio src={staticFile(`${job}/music.wav`)} volume={(f) => interpolate(f / fps, [0, 0.8, sec - 1.5, sec], [0, musicVol, musicVol, 0], CL)} />}
        {sfx.map(([at, name, v], i) => (
          <Sequence key={i} from={Math.max(0, Math.round(at * fps))} durationInFrames={Math.round(2.5 * fps)}>
            <Audio src={staticFile(`sfx/${name}.wav`)} volume={v} />
          </Sequence>
        ))}
      </AbsoluteFill>
    </WorldCtx.Provider>
  );
};

// pixel dissolve: a grid of blocks pops on then off around the cut
export const PixelWipe: React.FC<{d: number; color: string; seed?: number; cols?: number}> = ({d, color, seed = 0, cols = 16}) => {
  const {width: Wd, height: H} = useVideoConfig();
  const sz = Wd / cols, rows = Math.ceil(H / sz);
  const cells: React.ReactNode[] = [];
  const pal = [color, '#FFFFFF', '#0A0A0A'];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const r = rnd(x * 31 + y * 17 + seed * 7);
    const on = d < 0 ? (d + TD) / TD > r : (TD - d) / TD > r;
    if (on) cells.push(<div key={x + '_' + y} style={{position: 'absolute', left: x * sz, top: y * sz, width: sz + 1, height: sz + 1, background: pal[Math.floor(rnd(r * 99) * 3)]}} />);
  }
  return <AbsoluteFill style={{zIndex: 900}}>{cells}</AbsoluteFill>;
};
const Scanlines: React.FC<{k: number}> = ({k}) => (
  <AbsoluteFill style={{zIndex: 900, opacity: k * 0.5, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0 2px, transparent 2px 6px)', mixBlendMode: 'overlay'}} />
);
const Grain: React.FC<{dark: boolean}> = ({dark}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{zIndex: 940, pointerEvents: 'none', opacity: dark ? 0.12 : 0.06, mixBlendMode: dark ? 'screen' : 'multiply'}}>
      <svg width="100%" height="100%"><filter id="mxg"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 8} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#mxg)" /></svg>
    </AbsoluteFill>
  );
};

// small one-line caption, optional (most mx videos let the kinetic type carry the words)
export const MiniCaption: React.FC<{words: Word[]; t: number; max?: number}> = ({words, t, max = 5}) => {
  const W = useWorld();
  const i = words.findIndex(([, s], j) => t >= s && (j === words.length - 1 || t < words[j + 1][1]));
  if (i < 0) return null;
  const start = Math.floor(i / max) * max;
  return (
    <div style={{position: 'absolute', zIndex: 960, bottom: '6%', width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 34, color: W.ink, opacity: 0.85}}>
      {words.slice(start, start + max).map(([w], j) => <span key={j} style={{opacity: start + j <= i ? 1 : 0.25}}>{w} </span>)}
    </div>
  );
};

// ---------- backgrounds ----------
// soft gradient haze with slowly drifting light blobs (sky = airy, night = lamp glow)
export const Haze: React.FC<{t: number; blobs?: number}> = ({t, blobs = 3}) => {
  const W = useWorld();
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${W.bg} 0%, ${W.bg2} 100%)`}}>
      {Array.from({length: blobs}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: `${20 + 30 * i + Math.sin(t * 0.3 + i) * 6}%`, top: `${25 + 20 * Math.cos(i * 2.1) + Math.cos(t * 0.25 + i) * 5}%`, width: 700, height: 700, borderRadius: '50%', background: i % 2 ? W.accent2 : W.glow, opacity: W.dark ? 0.16 : 0.22, filter: 'blur(140px)', transform: 'translate(-50%,-50%)'}} />
      ))}
    </AbsoluteFill>
  );
};
// perspective neon grid floor (night) / faint grid (sky)
export const GridFloor: React.FC<{t: number; y?: number}> = ({t, y = 58}) => {
  const W = useWorld();
  return (
    <div style={{position: 'absolute', left: '-50%', width: '200%', top: `${y}%`, height: '80%', perspective: 600}}>
      <div style={{width: '100%', height: '100%', transform: 'rotateX(68deg)', transformOrigin: 'top', backgroundImage: `linear-gradient(${W.accent2}55 2px, transparent 2px), linear-gradient(90deg, ${W.accent2}55 2px, transparent 2px)`, backgroundSize: '90px 90px', backgroundPosition: `0 ${(t * 40) % 90}px`, maskImage: 'linear-gradient(to bottom, #000 0%, transparent 80%)'}} />
    </div>
  );
};
// floating dust / sparks
export const Dust: React.FC<{t: number; n?: number; color?: string}> = ({t, n = 40, color}) => {
  const W = useWorld();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: n}).map((_, i) => {
        const x = (rnd(i) * 100 + t * (1 + rnd(i + 9) * 2)) % 100, y = (rnd(i + 3) * 100 - t * (2 + rnd(i + 5) * 4) + 200) % 100;
        return <div key={i} style={{position: 'absolute', left: `${x}%`, top: `${y}%`, width: 3 + rnd(i + 1) * 4, height: 3 + rnd(i + 1) * 4, borderRadius: 4, background: color ?? W.glow, opacity: 0.25 + 0.5 * Math.abs(Math.sin(t * 2 + i))}} />;
      })}
    </AbsoluteFill>
  );
};
// depth layer: children move with the camera at a parallax factor and get a depth-of-field blur
export const Layer: React.FC<{depth: number; t: number; blur?: number; children: React.ReactNode}> = ({depth, t, blur = 0, children}) => (
  <AbsoluteFill style={{transform: `translate(${Math.sin(t * 0.6) * 18 * depth}px, ${Math.cos(t * 0.5) * 10 * depth}px) scale(${1 + 0.02 * depth})`, filter: blur ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>
);

// ---------- kinetic type ----------
// One "Lockup" = a short phrase built word by word on the narration. Mix sizes/fonts per word: small connectors, one huge hero word.
export type W8 = 'small' | 'body' | 'big' | 'hero' | 'serif' | 'mark' | 'glitch' | 'ghost' | 'type';
export type LockWord = {w: string; at: number; s?: W8; color?: string; br?: boolean; rot?: number};
const SIZE: Record<W8, number> = {small: 0.32, body: 0.55, big: 0.9, hero: 1.6, serif: 0.9, mark: 0.7, glitch: 1.3, ghost: 0.55, type: 0.55};
export const Lockup: React.FC<{t: number; words: LockWord[]; size?: number; align?: 'center' | 'left' | 'right'; x?: string; y?: string; w?: string; exit?: number}> = ({t, words, size = 120, align = 'center', x = '50%', y = '50%', w = '80%', exit}) => {
  const W = useWorld();
  const {width: VW} = useVideoConfig();
  const boxW = (parseFloat(w) / 100) * VW; // words never overflow the box: shrink a word to fit its width
  const fit = (wd: LockWord, px: number) => Math.min(px, boxW / Math.max(1, wd.w.length * 0.62));
  const lines: LockWord[][] = [[]];
  words.forEach((wd) => {if (wd.br && lines[lines.length - 1].length) lines.push([]); lines[lines.length - 1].push(wd);});
  const ex = exit ? ramp(t, exit, exit + 0.25) : 0;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translate(-50%,-50%) translateY(${-ex * 30}px)`, opacity: 1 - ex, filter: ex ? `blur(${ex * 10}px)` : undefined, textAlign: align, lineHeight: 0.95}}>
      {lines.map((ln, li) => (
        <div key={li} style={{display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end', gap: `0 ${size * 0.2}px`, marginBottom: size * 0.06}}>
          {ln.map((wd, i) => <KWord key={i} t={t} wd={wd} px={fit(wd, size * SIZE[wd.s ?? 'body'])} W={W} />)}
        </div>
      ))}
    </div>
  );
};
const KWord: React.FC<{t: number; wd: LockWord; px: number; W: World}> = ({t, wd, px, W}) => {
  const s = wd.s ?? 'body';
  if (t < wd.at - 0.02) return <span style={{fontSize: px, visibility: 'hidden', fontFamily: s === 'serif' ? SERIF : DISPLAY}}>{wd.w}</span>;
  const k = ramp(t, wd.at, wd.at + 0.22), pop = back(t, wd.at, 0.32);
  const col = wd.color ?? (s === 'hero' || s === 'glitch' ? W.accent : s === 'ghost' ? W.dim : W.ink);
  const base: React.CSSProperties = {display: 'inline-block', fontSize: px, color: col, fontFamily: s === 'serif' ? SERIF : s === 'small' || s === 'body' || s === 'ghost' || s === 'type' ? SANS : DISPLAY, fontWeight: s === 'small' ? 500 : s === 'body' || s === 'ghost' || s === 'type' ? 600 : 800, fontStyle: s === 'serif' ? 'italic' : undefined, letterSpacing: s === 'hero' || s === 'big' || s === 'glitch' ? '-0.03em' : undefined, transform: `rotate(${wd.rot ?? 0}deg)`};
  if (s === 'type') {
    const n = Math.floor(ramp(t, wd.at, wd.at + wd.w.length * 0.04, 0, wd.w.length, Easing.linear));
    return <span style={base}>{wd.w.slice(0, n)}<span style={{opacity: n < wd.w.length || Math.floor(t * 2) % 2 ? 1 : 0, color: W.accent}}>|</span></span>;
  }
  if (s === 'mark') {
    const m = ramp(t, wd.at + 0.05, wd.at + 0.3);
    return <span style={{...base, position: 'relative', padding: '0 0.15em', color: m > 0.5 ? (W.dark ? '#000' : '#fff') : col}}><span style={{position: 'absolute', inset: '0.05em 0', background: W.accent, transformOrigin: 'left', transform: `scaleX(${m})`, zIndex: -1, borderRadius: 6}} />{wd.w}</span>;
  }
  if (s === 'glitch') {
    const j = t - wd.at < 0.4 ? (rnd(Math.floor(t * 30)) - 0.5) * 24 : 0;
    return (
      <span style={{...base, position: 'relative', transform: `${base.transform} scale(${0.6 + 0.4 * pop})`}}>
        <span style={{position: 'absolute', left: j, color: '#00E5FF', mixBlendMode: W.dark ? 'screen' : 'multiply', opacity: 0.8}}>{wd.w}</span>
        <span style={{position: 'absolute', left: -j, color: '#FF2E63', mixBlendMode: W.dark ? 'screen' : 'multiply', opacity: 0.8}}>{wd.w}</span>
        <span style={{position: 'relative'}}>{wd.w}</span>
      </span>
    );
  }
  if (s === 'hero' || s === 'big') return <span style={{...base, transform: `${base.transform} scale(${0.4 + 0.6 * pop}) translateY(${(1 - k) * 20}px)`, textShadow: W.dark ? `0 0 40px ${col}66` : undefined}}>{wd.w}</span>;
  return <span style={{...base, opacity: k, filter: `blur(${(1 - k) * 8}px)`, transform: `${base.transform} translateY(${(1 - k) * 0.25 * px}px)`}}>{wd.w}</span>;
};

// vertical list that rolls: active line crisp with an arrow, neighbours faded + blurred ("Not a studio. → Not an editor. Not a team.")
export const ListRoll: React.FC<{t: number; items: {w: string; at: number}[]; size?: number; x?: string; y?: string}> = ({t, items, size = 84, x = '50%', y = '50%'}) => {
  const W = useWorld();
  let pos = 0;
  items.forEach((it, i) => {if (i > 0) pos += ramp(t, it.at - 0.12, it.at + 0.18, 0, 1, Easing.inOut(Easing.cubic));});
  const gap = size * 1.5;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', fontFamily: SANS, fontWeight: 600, fontSize: size}}>
      <div style={{position: 'absolute', left: -size * 1.1, top: -size * 0.62, color: W.accent, fontSize: size * 0.8}}>→</div>
      {items.map((it, i) => {
        const off = i - pos, a = Math.abs(off);
        return <div key={i} style={{position: 'absolute', whiteSpace: 'nowrap', top: off * gap - size * 0.6, color: W.ink, opacity: Math.max(0, 1 - a * 0.75), filter: `blur(${a * 3}px)`, transform: `scale(${1 - a * 0.12})`, transformOrigin: 'left'}}>{it.w}</div>;
      })}
    </div>
  );
};

// big counter that ticks up (numbers are shown, never only said)
export const Counter: React.FC<{t: number; at: number; to: number; dur?: number; prefix?: string; suffix?: string; size?: number; x?: string; y?: string}> = ({t, at, to, dur = 0.9, prefix = '', suffix = '', size = 220, x = '50%', y = '50%'}) => {
  const W = useWorld();
  const v = Math.round(ramp(t, at, at + dur, 0, to, Easing.out(Easing.quad)));
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * back(t, at)})`, opacity: ramp(t, at, at + 0.15), fontFamily: DISPLAY, fontWeight: 800, fontSize: size, color: W.accent, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums'}}>{prefix}{v.toLocaleString()}{suffix}</div>;
};

// ---------- UI objects ----------
// frosted glass card that floats in; children = whatever UI you draw inside
export const Glass: React.FC<{t: number; at: number; x: string; y: string; w: number; h?: number; tilt?: number; children?: React.ReactNode; pad?: number}> = ({t, at, x, y, w, h, tilt = 0, children, pad = 28}) => {
  const W = useWorld();
  const k = back(t, at, 0.45), f = Math.sin((t - at) * 1.4) * 6;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, padding: pad, boxSizing: 'border-box', transform: `translate(-50%,-50%) translateY(${(1 - k) * 60 + f}px) perspective(1200px) rotateY(${tilt * (1 - 0.3 * k)}deg) scale(${0.85 + 0.15 * k})`, opacity: ramp(t, at, at + 0.2), background: W.glass, backdropFilter: 'blur(24px)', border: `1.5px solid ${W.dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.9)'}`, borderRadius: 26, boxShadow: W.dark ? `0 30px 80px rgba(0,0,0,0.6), 0 0 40px ${W.accent2}22` : '0 30px 70px rgba(60,80,160,0.18)', color: W.ink, fontFamily: SANS}}>
      {children}
    </div>
  );
};
// fake app window (traffic lights + title) for "the AI is working" shots; lines type out from `at`
export const AppWindow: React.FC<{t: number; at: number; x: string; y: string; w: number; title?: string; lines: string[]; tilt?: number}> = ({t, at, x, y, w, title = 'terminal', lines, tilt = -8}) => {
  const W = useWorld();
  return (
    <Glass t={t} at={at} x={x} y={y} w={w} tilt={tilt} pad={0}>
      <div style={{display: 'flex', gap: 8, padding: '14px 18px', borderBottom: `1px solid ${W.dark ? '#ffffff18' : '#00000012'}`, alignItems: 'center'}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />)}
        <div style={{marginLeft: 12, fontSize: 18, color: W.dim}}>{title}</div>
      </div>
      <div style={{padding: '18px 22px', fontFamily: 'monospace', fontSize: 22, lineHeight: 1.6}}>
        {lines.map((l, i) => {
          const s = at + 0.3 + i * 0.35, n = Math.floor(ramp(t, s, s + l.length * 0.02, 0, l.length, Easing.linear));
          return <div key={i} style={{color: i === 0 ? W.accent2 : W.ink, opacity: t > s ? 1 : 0}}>{l.slice(0, n)}</div>;
        })}
      </div>
    </Glass>
  );
};
// icon chip: rounded tile with an emoji/glyph + label (tool lists, step rows)
export const Chip: React.FC<{t: number; at: number; x: string; y: string; icon: string; label?: string; size?: number}> = ({t, at, x, y, icon, label, size = 110}) => {
  const W = useWorld();
  const k = back(t, at, 0.4);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${k}) translateY(${Math.sin((t - at) * 2) * 5}px)`, textAlign: 'center', fontFamily: SANS}}>
      <div style={{width: size, height: size, borderRadius: size * 0.28, background: W.glass, backdropFilter: 'blur(16px)', border: `1.5px solid ${W.dark ? '#ffffff22' : '#ffffffee'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.48, boxShadow: W.dark ? `0 0 30px ${W.accent2}33` : '0 14px 30px rgba(60,80,160,0.15)'}}>{icon}</div>
      {label && <div style={{marginTop: 14, fontSize: size * 0.24, fontWeight: 600, color: W.ink, opacity: ramp(t, at + 0.15, at + 0.35)}}>{label}</div>}
    </div>
  );
};

// ---------- mascot: "Volt" (ours, original) ----------
// A round charcoal/cream spark with a lightning-bolt antenna and big oval eyes. Moods change the eyes + mouth. Blinks and bobs by itself.
export type Mood = 'happy' | 'wow' | 'sly' | 'sad' | 'think';
export const Volt: React.FC<{t: number; x: string; y: string; s?: number; mood?: Mood; at?: number; look?: number; wave?: boolean}> = ({t, x, y, s = 1, mood = 'happy', at = 0, look = 0, wave}) => {
  const W = useWorld();
  const body = W.dark ? '#F4EFE6' : '#1F2333', face = W.dark ? '#1F2333' : '#F4EFE6';
  const k = back(t, at, 0.45), bob = Math.sin(t * 3) * 6, blink = (t * 1000) % 3200 < 120 ? 0.1 : 1;
  const ey = mood === 'wow' ? 1.25 : mood === 'sly' ? 0.45 : mood === 'sad' ? 0.8 : 1;
  const arm = wave ? -40 + Math.sin(t * 10) * 25 : 15;
  return (
    <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible', transform: `translate(-50%,-50%) scale(${s * k}) translateY(${bob}px)`}} width={220} height={240} viewBox="-110 -130 220 240">
      <ellipse cx={0} cy={100} rx={60 - bob} ry={10} fill="#000" opacity={0.2} />
      <path d="M-4,-118 L14,-92 L2,-92 L10,-70 L-14,-98 L-2,-98 Z" fill={W.accent} style={{filter: `drop-shadow(0 0 8px ${W.accent})`}} />
      <line x1={0} y1={-72} x2={0} y2={-60} stroke={body} strokeWidth={6} strokeLinecap="round" />
      <g transform={`rotate(${arm} -70 10)`}><rect x={-96} y={4} width={34} height={16} rx={8} fill={body} /></g>
      <rect x={62} y={4} width={34} height={16} rx={8} fill={body} transform="rotate(-15 70 10)" />
      <rect x={-74} y={-64} width={148} height={140} rx={62} fill={body} />
      <rect x={-56} y={-40} width={112} height={78} rx={34} fill={face} />
      {[-22, 22].map((ex) => <ellipse key={ex} cx={ex + look * 8} cy={-4} rx={9} ry={15 * ey * blink} fill={W.accent2} style={{filter: `drop-shadow(0 0 6px ${W.accent2})`}} />)}
      {mood === 'happy' && <path d="M-12,20 Q0,30 12,20" stroke={W.accent2} strokeWidth={4} fill="none" strokeLinecap="round" />}
      {mood === 'wow' && <ellipse cx={0} cy={24} rx={7} ry={9} fill={W.accent2} />}
      {mood === 'sly' && <path d="M-10,22 Q4,26 14,16" stroke={W.accent2} strokeWidth={4} fill="none" strokeLinecap="round" />}
      {mood === 'sad' && <path d="M-12,26 Q0,16 12,26" stroke={W.accent2} strokeWidth={4} fill="none" strokeLinecap="round" />}
      {mood === 'think' && <circle cx={10} cy={22} r={4} fill={W.accent2} />}
      <rect x={-44} y={72} width={26} height={22} rx={10} fill={body} /><rect x={18} y={72} width={26} height={22} rx={10} fill={body} />
    </svg>
  );
};

// ---------- end card: comment-keyword CTA ----------
export const CtaCard: React.FC<{t: number; at: number; handle: string; keyword: string; sub?: string}> = ({t, at, handle, keyword, sub = 'and I’ll send it to your DMs'}) => {
  const W = useWorld();
  const typed = Math.floor(ramp(t, at + 0.9, at + 0.9 + keyword.length * 0.08, 0, keyword.length, Easing.linear));
  return (
    <Glass t={t} at={at} x="50%" y="54%" w={980} pad={44}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{width: 72, height: 72, borderRadius: 36, background: `linear-gradient(135deg, ${W.accent}, ${W.accent2})`}} />
        <div style={{fontSize: 30, fontWeight: 700}}>{handle}</div>
        <div style={{marginLeft: 'auto', fontSize: 22, fontWeight: 600, padding: '10px 20px', borderRadius: 20, background: t > at + 0.6 ? W.accent : 'transparent', color: t > at + 0.6 ? '#fff' : W.accent, border: `2px solid ${W.accent}`}}>{t > at + 0.6 ? 'Following ✓' : 'Follow'}</div>
      </div>
      <div style={{marginTop: 30, display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderRadius: 18, border: `1.5px solid ${W.dark ? '#ffffff22' : '#00000018'}`, fontSize: 30}}>
        <span style={{fontWeight: 700, color: W.ink}}>{keyword.slice(0, typed)}</span>
        <span style={{opacity: Math.floor(t * 2) % 2 ? 1 : 0, color: W.accent}}>|</span>
        <span style={{marginLeft: 'auto', width: 46, height: 46, borderRadius: 23, background: typed === keyword.length ? W.accent : W.dim, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>➤</span>
      </div>
      <div style={{marginTop: 16, fontSize: 20, color: W.dim}}>{sub}</div>
    </Glass>
  );
};
