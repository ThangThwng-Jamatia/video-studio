// Clean motion-graphics kit (2026-10-23, long-video-editor → references/mg-style.md). Measured from
// Inspiration Video Edits/Motion Graphics/: one canvas + a slow camera, a single accent colour, glowing glass icon
// nodes, thin drawn connector lines, word-by-word blur-in text with accent words and a highlighter underline.
// One `mg` beat = one 10–25 s explainer sequence; every element appears on its spoken word (`at`) and may leave (`out`).
import React from 'react';
import {AbsoluteFill, Easing, useVideoConfig} from 'remotion';
import {ease, mix, out, rnd, sora, tight} from './theme';
import {Icon, type IconName} from './Icons';

export type MGTheme = 'teal' | 'emerald' | 'sky';
export type Tone = 'accent' | 'red' | 'green' | 'gold' | 'white' | 'dim';
export type MGWord = {t: string; at: number; f?: string};
type B = {id?: string; x: number; y: number; at: number; out?: number; s?: number};
export type NodeState = {at: number; tone?: Tone; dim?: boolean; strike?: boolean; pulse?: boolean; x?: number; y?: number; label?: string};
export type TileState = {at: number; idx: number[]; tone?: Tone; tag?: string; dim?: boolean};
export type MGEl =
  | (B & {kind: 'text'; words: MGWord[]; size?: number; align?: 'left' | 'center' | 'right'; font?: 'sora' | 'tight'; weight?: number; maxW?: number})
  | (B & {kind: 'node'; icon: IconName; label?: string; sub?: string; tone?: Tone; size?: number; states?: NodeState[]})
  | (B & {kind: 'link'; from: string; to: string; dur?: number; bend?: number; tone?: Tone; dot?: boolean; arrow?: boolean})
  | (B & {kind: 'tiles'; items: {label: string; sub?: string; icon?: IconName}[]; w: number; h: number; states?: TileState[]})
  | (B & {kind: 'bar'; label?: string; w: number; tone?: Tone; fills: {at: number; to: number; dur?: number}[]; rough?: number})
  | (B & {kind: 'meter'; labels: string[]; w: number; marks: {at: number; to: number}[]; ghost?: {at: number; to: number; label?: string}})
  | (B & {kind: 'chart'; w: number; h: number; xLabels?: string[]; series: {label: string; tone: Tone; pts: [number, number][]; at: number; dur?: number}[]})
  | (B & {kind: 'bubble'; text: string; icon?: IconName; w?: number; side?: 'left' | 'right'})
  | (B & {kind: 'counter'; from: number; to: number; dur?: number; prefix?: string; suffix?: string; size?: number; label?: string; tone?: Tone})
  | (B & {kind: 'pill'; text: string; icon?: IconName; tone?: Tone; size?: number})
  | (B & {kind: 'cycle'; items: {label: string; icon: IconName; tone?: Tone}[]; r: number; ats: number[]; spinAt?: number; period?: number;
      center?: string; count?: boolean});
export type MGCam = {at: number; x: number; y: number; z: number; dur?: number};
export type MGBeatData = {theme?: MGTheme; cam?: MGCam[]; els: MGEl[]};

type Pal = {bg: string; accent: string; accent2: string; hl: string; text: string; sub: string; red: string; green: string; gold: string;
  glass: string; border: string; line: string; dark: boolean};
const PAL: Record<MGTheme, Pal> = {
  teal: {bg: 'radial-gradient(ellipse 120% 95% at 32% 18%, #12343d 0%, #0a2026 42%, #040d10 78%, #020607 100%)', accent: '#5fd8ec', accent2: '#c8f7ff',
    hl: '#d9f75c', text: '#ffffff', sub: 'rgba(255,255,255,0.6)', red: '#ff5d5d', green: '#5cf2a8', gold: '#ffd36b', glass: 'rgba(16,40,48,0.72)',
    border: 'rgba(160,235,255,0.24)', line: 'rgba(215,245,255,0.62)', dark: true},
  emerald: {bg: 'radial-gradient(ellipse 120% 95% at 50% 10%, #0f4a36 0%, #062a1e 45%, #021510 78%, #010805 100%)', accent: '#3ef0a6', accent2: '#c2ffe3',
    hl: '#e8ff6a', text: '#ffffff', sub: 'rgba(255,255,255,0.6)', red: '#ff6b6b', green: '#3ef0a6', gold: '#ffd36b', glass: 'rgba(10,46,34,0.72)',
    border: 'rgba(150,255,210,0.24)', line: 'rgba(200,255,230,0.6)', dark: true},
  sky: {bg: 'linear-gradient(135deg, #ffffff 0%, #e8efff 40%, #9db8ff 80%, #5b8cff 100%)', accent: '#3f6fff', accent2: '#8fb0ff', hl: '#ffd84a',
    text: '#0b1020', sub: 'rgba(11,16,32,0.5)', red: '#ef4444', green: '#16a34a', gold: '#d99a00', glass: 'rgba(255,255,255,0.78)',
    border: 'rgba(255,255,255,0.95)', line: 'rgba(30,50,120,0.45)', dark: false},
};
const tone = (p: Pal, t: Tone | undefined) =>
  t === 'red' ? p.red : t === 'green' ? p.green : t === 'gold' ? p.gold : t === 'white' ? p.text : t === 'dim' ? p.sub : p.accent;
const alpha = (hex: string, a: number) => hex.startsWith('#') ? `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}` : hex;

// appear / leave envelope shared by every element
const env = (t: number, at: number, outAt?: number) => {
  const k = out(t, at, 0.42);
  const e = outAt !== undefined ? ease(t, outAt, outAt + 0.35) : 0;
  return {o: k * (1 - e), blur: (1 - k) * 12 + e * 10, s: mix(0.9, 1, k) * (1 + 0.04 * e), k};
};
const envStyle = (v: ReturnType<typeof env>, extra = ''): React.CSSProperties => ({
  opacity: v.o, filter: v.blur > 0.3 ? `blur(${v.blur}px)` : undefined, transform: `${extra} scale(${v.s})`.trim(),
});

// ---------- background ----------
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;
const Gear: React.FC<{size: number; teeth?: number}> = ({size, teeth = 12}) => {
  const r0 = 0.36, r1 = 0.46, pts: string[] = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2, r = i % 4 < 2 ? r1 : r0;
    pts.push(`${50 + Math.cos(a) * r * 100},${50 + Math.sin(a) * r * 100}`);
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"><polygon points={pts.join(' ')} fill="rgba(120,210,230,0.5)" />
      <circle cx="50" cy="50" r="16" fill="#061418" /></svg>
  );
};
export const MGBg: React.FC<{theme: MGTheme; t: number; px: number; py: number}> = ({theme, t, px, py}) => {
  const {width: W, height: H} = useVideoConfig();
  const p = PAL[theme];
  return (
    <AbsoluteFill style={{background: p.bg, overflow: 'hidden'}}>
      {theme === 'teal' && [{x: -0.06, y: 0.05, s: 0.62, d: 1}, {x: 0.78, y: 0.62, s: 0.5, d: -1}].map((g, i) => (
        <div key={i} style={{position: 'absolute', left: (g.x - px * 0.1) * W, top: (g.y - py * 0.1) * H, opacity: 0.1, filter: 'blur(7px)',
          transform: `rotate(${t * 4 * g.d}deg)`}}><Gear size={g.s * H} /></div>
      ))}
      {theme === 'emerald' && [0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: (-0.25 + i * 0.12 - px * 0.08) * W, top: (0.38 + i * 0.06) * H, width: 1.5 * W, height: 1.1 * H,
          borderRadius: '50%', border: `${3 + i * 2}px solid rgba(120,255,200,${0.16 - i * 0.04})`, filter: `blur(${10 + i * 8}px)`,
          transform: `rotate(${-8 + i * 5 + Math.sin(t * 0.2 + i) * 2}deg)`}} />
      ))}
      {theme === 'sky' && [0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: (rnd(i) * 0.9 - px * 0.1) * W, top: rnd(i + 5) * 0.9 * H, width: 0.5 * W, height: 0.5 * W,
          borderRadius: '50%', background: 'rgba(255,255,255,0.55)', filter: 'blur(90px)', transform: `translateY(${Math.sin(t * 0.3 + i) * 30}px)`}} />
      ))}
      {p.dark && Array.from({length: 26}, (_, i) => (
        <div key={`d${i}`} style={{position: 'absolute', left: (((rnd(i) + t * 0.006 * (rnd(i + 2) - 0.5) - px * 0.05) % 1 + 1) % 1) * W,
          top: ((rnd(i + 9) + t * 0.004) % 1) * H, width: 2 + rnd(i + 4) * 3, height: 2 + rnd(i + 4) * 3, borderRadius: '50%',
          background: alpha(p.accent2, 0.25 + rnd(i + 7) * 0.3), filter: 'blur(0.6px)'}} />
      ))}
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 45% at 50% 108%, ${alpha(p.accent, p.dark ? 0.18 : 0.12)} 0%, rgba(0,0,0,0) 70%)`}} />
      {p.dark && <AbsoluteFill style={{backgroundImage: GRAIN, backgroundSize: '220px 220px', opacity: 0.07, mixBlendMode: 'overlay',
        backgroundPosition: `${Math.floor(rnd(Math.floor(t * 24)) * 220)}px ${Math.floor(rnd(Math.floor(t * 24) + 3) * 220)}px`}} />}
      {p.dark && <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 80% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />}
    </AbsoluteFill>
  );
};

// ---------- camera ----------
const camAt = (cams: MGCam[] | undefined, t: number, start: number) => {
  let c = {x: 0.5, y: 0.5, z: 1};
  if (cams && cams.length) {
    c = {x: cams[0].x, y: cams[0].y, z: cams[0].z};
    for (const k of cams.slice(1)) {
      if (t < k.at) break;
      const q = ease(t, k.at, k.at + (k.dur ?? 1.4), Easing.inOut(Easing.cubic));
      c = {x: mix(c.x, k.x, q), y: mix(c.y, k.y, q), z: mix(c.z, k.z, q)};
    }
  }
  return {...c, z: c.z * (1 + 0.005 * (t - start))}; // slow constant push
};

// ---------- elements ----------
const Text: React.FC<{el: Extract<MGEl, {kind: 'text'}>; t: number; p: Pal}> = ({el, t, p}) => {
  const {width: W, height: H} = useVideoConfig();
  const fs = (el.size ?? 0.06) * H;
  const e = el.out !== undefined ? ease(t, el.out, el.out + 0.35) : 0;
  const al = el.align ?? 'center';
  const tx = al === 'center' ? 'translate(-50%,-50%)' : al === 'right' ? 'translate(-100%,-50%)' : 'translate(0,-50%)';
  return (
    <div style={{position: 'absolute', left: el.x * W, top: el.y * H, transform: tx, width: el.maxW ? el.maxW * W : 'max-content',
      opacity: 1 - e, filter: e > 0 ? `blur(${e * 10}px)` : undefined}}>
      <div style={{display: 'flex', flexWrap: el.maxW ? 'wrap' : 'nowrap', justifyContent: al === 'center' ? 'center' : al === 'right' ? 'flex-end' : 'flex-start',
        whiteSpace: el.maxW ? undefined : 'nowrap', rowGap: fs * 0.05, fontFamily: el.font === 'sora' ? sora : tight, fontWeight: el.weight ?? 600,
        fontSize: fs, letterSpacing: '-0.02em', lineHeight: 1.12}}>
        {el.words.map((w, i) => {
          const k = out(t, w.at, 0.24);
          const col = w.f === 'gold' ? p.accent : w.f === 'bad' ? p.red : w.f === 'good' ? p.green : w.f === 'italic' ? p.sub : p.text;
          const glow = w.f === 'gold' || w.f === 'bad' || w.f === 'good' ? `0 0 ${fs * 0.4}px ${alpha(col, 0.55)}` : p.dark ? '0 2px 16px rgba(0,0,0,0.45)' : 'none';
          const hl = w.f === 'ice' ? out(t, w.at + 0.18, 0.4) : 0;
          return (
            <span key={i} style={{position: 'relative', display: 'inline-block', marginRight: i < el.words.length - 1 ? '0.26em' : 0, color: col,
              textShadow: glow, fontStyle: w.f === 'italic' ? 'italic' : undefined, opacity: k, filter: k < 1 ? `blur(${(1 - k) * 10}px)` : undefined,
              transform: `translateY(${(1 - k) * fs * 0.18}px)`}}>
              {w.t}
              {w.f === 'ice' && <span style={{position: 'absolute', left: '-2%', right: '-2%', bottom: '-0.04em', height: '0.1em', borderRadius: 4,
                background: p.hl, boxShadow: `0 0 ${fs * 0.3}px ${alpha(p.hl, 0.8)}`, transform: `scaleX(${hl})`, transformOrigin: 'left center'}} />}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const stateAt = <S extends {at: number}>(states: S[] | undefined, t: number) => {
  const done = (states ?? []).filter((s) => s.at <= t);
  return {cur: done[done.length - 1], prev: done[done.length - 2]};
};
const Disc: React.FC<{S: number; col: string; icon: IconName; p: Pal; o?: number}> = ({S, col, icon, p, o = 1}) => (
  <div style={{position: 'absolute', inset: 0, borderRadius: '50%', opacity: o,
    background: `radial-gradient(circle at 34% 28%, ${alpha('#ffffff', p.dark ? 0.55 : 0.9)} 0%, ${alpha(col, 0.95)} 34%, ${alpha(col, 0.55)} 70%, ${alpha(col, 0.3)} 100%)`,
    boxShadow: `0 0 ${S * 0.55}px ${alpha(col, 0.5)}, 0 0 ${S * 0.12}px ${alpha(col, 0.9)}, inset 0 -${S * 0.08}px ${S * 0.2}px rgba(0,0,0,0.25), inset 0 ${S * 0.04}px ${S * 0.06}px rgba(255,255,255,0.5)`,
    border: '1px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <Icon name={icon} size={S * 0.46} color={p.dark ? '#04161b' : '#ffffff'} stroke={2.4} />
  </div>
);
const Node: React.FC<{el: Extract<MGEl, {kind: 'node'}>; t: number; p: Pal}> = ({el, t, p}) => {
  const {width: W, height: H} = useVideoConfig();
  const S = (el.size ?? 0.12) * H;
  const v = env(t, el.at, el.out);
  const {cur, prev} = stateAt(el.states, t);
  const q = cur ? out(t, cur.at, 0.35) : 1;
  const tNow = cur?.tone ?? el.tone, tPrev = prev?.tone ?? el.tone;
  const x = cur?.x !== undefined ? mix(prev?.x ?? el.x, cur.x, q) : el.x;
  const y = cur?.y !== undefined ? mix(prev?.y ?? el.y, cur.y, q) : el.y;
  const dim = cur?.dim ? q : prev?.dim && !cur?.dim ? 1 - q : 0;
  const label = cur?.label ?? el.label;
  const chars = label ? Math.max(0, Math.floor((t - el.at - 0.2) * 32)) : 0;
  const pulse = cur?.pulse ? ease(t, cur.at, cur.at + 0.8, Easing.out(Easing.quad)) : 1;
  const strike = (el.states ?? []).find((s) => s.strike && s.at <= t);
  return (
    <div style={{position: 'absolute', left: x * W, top: y * H, width: 0, height: 0}}>
      <div style={{position: 'absolute', left: -S / 2, top: -S / 2, width: S, height: S, ...envStyle(v),
        filter: [v.blur > 0.3 ? `blur(${v.blur}px)` : '', dim ? `grayscale(${dim}) brightness(${1 - 0.45 * dim})` : ''].join(' ') || undefined}}>
        {pulse < 1 && <div style={{position: 'absolute', inset: -S * 0.6 * pulse, borderRadius: '50%', border: `2px solid ${tone(p, tNow)}`, opacity: 1 - pulse}} />}
        <Disc S={S} col={tone(p, tPrev)} icon={el.icon} p={p} />
        {tNow !== tPrev && <Disc S={S} col={tone(p, tNow)} icon={el.icon} p={p} o={q} />}
      </div>
      {label && (
        <div style={{position: 'absolute', left: 0, top: S * 0.62, transform: 'translateX(-50%)', textAlign: 'center', whiteSpace: 'nowrap',
          opacity: v.o * (1 - 0.55 * dim)}}>
          <div style={{position: 'relative', display: 'inline-block', fontFamily: tight, fontWeight: 600, fontSize: Math.max(S * 0.25, 0.036 * H), color: p.text,
            letterSpacing: '-0.01em', textShadow: p.dark ? '0 2px 12px rgba(0,0,0,0.5)' : undefined}}>
            {label.slice(0, chars)}
            {strike && <span style={{position: 'absolute', left: -4, right: -4, top: '54%', height: 3, background: p.red, borderRadius: 2,
              transform: `scaleX(${out(t, strike.at, 0.3)})`, transformOrigin: 'left', boxShadow: `0 0 10px ${p.red}`}} />}
          </div>
          {el.sub && <div style={{fontFamily: tight, fontWeight: 500, fontSize: Math.max(S * 0.18, 0.026 * H), color: p.sub, marginTop: 2, ...envStyle(env(t, el.at + 0.45, el.out))}}>{el.sub}</div>}
        </div>
      )}
    </div>
  );
};

const bez = (a: number[], c: number[], b: number[], u: number) => [
  (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];
const Link: React.FC<{el: Extract<MGEl, {kind: 'link'}>; t: number; p: Pal; nodes: Record<string, {x: number; y: number; r: number}>}> = ({el, t, p, nodes}) => {
  const {width: W, height: H} = useVideoConfig();
  const A = nodes[el.from], Bn = nodes[el.to];
  if (!A || !Bn) return null;
  const a0 = [A.x * W, A.y * H], b0 = [Bn.x * W, Bn.y * H];
  const dx = b0[0] - a0[0], dy = b0[1] - a0[1], L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L;
  const a = [a0[0] + ux * (A.r + 10), a0[1] + uy * (A.r + 10)], b = [b0[0] - ux * (Bn.r + 10), b0[1] - uy * (Bn.r + 10)];
  const bend = el.bend ?? 0.18;
  const c = [(a[0] + b[0]) / 2 - uy * L * bend, (a[1] + b[1]) / 2 + ux * L * bend];
  const pr = ease(t, el.at, el.at + (el.dur ?? 0.7), Easing.inOut(Easing.cubic));
  const fade = el.out !== undefined ? 1 - ease(t, el.out, el.out + 0.35) : 1;
  const col = el.tone ? tone(p, el.tone) : p.line;
  const head = bez(a, c, b, pr);
  const tan = bez(a, c, b, Math.max(0, pr - 0.02));
  const ang = Math.atan2(head[1] - tan[1], head[0] - tan[0]);
  const dotU = el.dot && pr >= 1 ? ((t - el.at - (el.dur ?? 0.7)) * 0.7) % 1 : -1;
  const dp = dotU >= 0 ? bez(a, c, b, dotU) : null;
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: fade}}>
      <path d={`M${a[0]},${a[1]} Q${c[0]},${c[1]} ${b[0]},${b[1]}`} pathLength={1} fill="none" stroke={col} strokeWidth={2.4}
        strokeDasharray="1 1" strokeDashoffset={1 - pr} strokeLinecap="round" style={{filter: `drop-shadow(0 0 6px ${alpha(el.tone ? col : p.accent, 0.6)})`}} />
      {pr > 0 && pr < 1 && <circle cx={head[0]} cy={head[1]} r={4} fill={p.accent2} style={{filter: `drop-shadow(0 0 8px ${p.accent})`}} />}
      {el.arrow && pr >= 0.98 && <path d="M-11,-7 L0,0 L-11,7" fill="none" stroke={col} strokeWidth={2.4} strokeLinecap="round"
        transform={`translate(${b[0]},${b[1]}) rotate(${(ang * 180) / Math.PI})`} />}
      {dp && <circle cx={dp[0]} cy={dp[1]} r={5} fill={p.accent2} style={{filter: `drop-shadow(0 0 10px ${p.accent})`}} />}
    </svg>
  );
};

const Glass: React.FC<{p: Pal; col?: string; glowK?: number; style?: React.CSSProperties; children?: React.ReactNode; r?: number}> = ({p, col, glowK = 0, style, children, r}) => {
  const {height: H} = useVideoConfig();
  return (
    <div style={{borderRadius: r ?? 0.02 * H, background: `linear-gradient(160deg, rgba(255,255,255,${p.dark ? 0.1 : 0.6}) 0%, rgba(255,255,255,0) 45%), ${p.glass}`,
      border: `1.5px solid ${col && glowK > 0 ? alpha(col, 0.35 + 0.5 * glowK) : p.border}`,
      boxShadow: [col && glowK > 0 ? `0 0 ${60 * glowK}px ${alpha(col, 0.35 * glowK)}` : '', p.dark ? '0 30px 80px rgba(0,0,0,0.5)' : '0 20px 60px rgba(40,60,140,0.18)',
        'inset 0 1px 0 rgba(255,255,255,0.18)'].filter(Boolean).join(', '), ...style}}>{children}</div>
  );
};

const Tiles: React.FC<{el: Extract<MGEl, {kind: 'tiles'}>; t: number; p: Pal}> = ({el, t, p}) => {
  const {width: W, height: H} = useVideoConfig();
  const n = el.items.length, gap = 0.018 * W, tw = (el.w * W - gap * (n - 1)) / n, th = el.h * H;
  return (
    <div style={{position: 'absolute', left: el.x * W - (el.w * W) / 2, top: el.y * H - th / 2, display: 'flex', gap}}>
      {el.items.map((it, i) => {
        const v = env(t, el.at + i * 0.14, el.out);
        const sts = (el.states ?? []).filter((s) => s.idx.includes(i));
        const {cur, prev} = stateAt(sts, t);
        const q = cur ? out(t, cur.at, 0.35) : 0;
        const col = cur?.tone ? tone(p, cur.tone) : undefined;
        const dim = cur?.dim ? q : 0;
        const tagK = cur?.tag ? out(t, cur.at + 0.1, 0.3) : 0;
        return (
          <div key={i} style={{position: 'relative', width: tw, height: th, ...envStyle(v, `translateY(${(1 - v.k) * 24}px)`)}}>
            {cur?.tag && <div style={{position: 'absolute', left: '50%', top: -0.085 * H, transform: `translate(-50%, ${(1 - tagK) * 10}px)`, opacity: tagK,
              whiteSpace: 'nowrap', fontFamily: tight, fontWeight: 700, fontSize: 0.032 * H, color: col ?? p.text, padding: '0.25em 0.8em', borderRadius: 999,
              background: alpha(col ?? p.accent, 0.14), border: `1px solid ${alpha(col ?? p.accent, 0.5)}`, textShadow: `0 0 12px ${alpha(col ?? p.accent, 0.6)}`}}>{cur.tag}</div>}
            <Glass p={p} col={col ?? prev?.tone} glowK={col ? q : 0} style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 0.01 * H, opacity: 1 - 0.6 * dim, filter: dim ? `grayscale(${dim})` : undefined}}>
              <div style={{fontFamily: tight, fontWeight: 600, fontSize: 0.03 * H, letterSpacing: '0.16em', color: p.sub, textTransform: 'uppercase'}}>{it.label}</div>
              {it.icon && <Icon name={it.icon} size={0.085 * H} color={col ?? p.accent} stroke={2} style={{filter: `drop-shadow(0 0 10px ${alpha(col ?? p.accent, 0.6)})`}} />}
              {it.sub && <div style={{fontFamily: sora, fontWeight: 700, fontSize: 0.045 * H, color: col ?? p.text, letterSpacing: '-0.02em'}}>{it.sub}</div>}
            </Glass>
          </div>
        );
      })}
    </div>
  );
};

const seqVal = (fills: {at: number; to: number; dur?: number}[], t: number, from = 0) => {
  let v = from;
  for (const f of fills) {
    if (t < f.at) break;
    v = mix(v, f.to, ease(t, f.at, f.at + (f.dur ?? 1.0), Easing.out(Easing.cubic)));
  }
  return v;
};
const Bar: React.FC<{el: Extract<MGEl, {kind: 'bar'}>; t: number; p: Pal}> = ({el, t, p}) => {
  const {width: W, height: H} = useVideoConfig();
  const v = env(t, el.at, el.out);
  const val = seqVal(el.fills, t);
  const col = tone(p, el.tone);
  const bw = el.w * W, bh = 0.034 * H;
  return (
    <div style={{position: 'absolute', left: el.x * W - bw / 2, top: el.y * H - bh / 2, width: bw, ...envStyle(v)}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: tight, fontWeight: 600, fontSize: 0.04 * H, color: p.text, marginBottom: 0.014 * H}}>
        <span>{el.label}</span><span style={{color: col, textShadow: `0 0 14px ${alpha(col, 0.6)}`, fontVariantNumeric: 'tabular-nums'}}>{Math.round(val * 100)}%</span>
      </div>
      <div style={{position: 'relative', height: bh, borderRadius: bh, background: p.dark ? 'rgba(255,255,255,0.08)' : 'rgba(20,40,100,0.1)',
        border: `1px solid ${p.border}`, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${val * 100}%`, borderRadius: bh,
          background: el.rough ? `repeating-linear-gradient(115deg, ${col} 0px, ${col} 14px, ${alpha(col, 0.35)} 14px, ${alpha(col, 0.35)} 26px)`
            : `linear-gradient(90deg, ${alpha(col, 0.55)}, ${col})`, boxShadow: `0 0 22px ${alpha(col, 0.7)}`}} />
      </div>
    </div>
  );
};

const Meter: React.FC<{el: Extract<MGEl, {kind: 'meter'}>; t: number; p: Pal}> = ({el, t, p}) => {
  const {width: W, height: H} = useVideoConfig();
  const v = env(t, el.at, el.out);
  const mw = el.w * W, mh = 0.032 * H;
  const val = seqVal(el.marks.map((m) => ({...m, dur: 1.1})), t, 0);
  const n = el.labels.length;
  const gk = el.ghost ? out(t, el.ghost.at, 0.5) : 0;
  return (
    <div style={{position: 'absolute', left: el.x * W - mw / 2, top: el.y * H - mh / 2, width: mw, ...envStyle(v)}}>
      <div style={{position: 'relative', height: mh, borderRadius: mh, background: `linear-gradient(90deg, ${alpha(p.red, 0.75)}, ${alpha(p.gold, 0.8)} 50%, ${alpha(p.green, 0.9)})`,
        boxShadow: '0 0 30px rgba(0,0,0,0.35)'}}>
        {el.ghost && <div style={{position: 'absolute', left: `${el.ghost.to * 100}%`, top: -0.035 * H, bottom: -0.035 * H, width: 0, opacity: gk,
          borderLeft: `2.5px dashed ${p.text}`}}>
          {el.ghost.label && <div style={{position: 'absolute', bottom: '100%', left: 0, transform: 'translate(-50%,-6px)', whiteSpace: 'nowrap', fontFamily: tight,
            fontWeight: 600, fontSize: 0.032 * H, color: p.sub}}>{el.ghost.label}</div>}
        </div>}
        <div style={{position: 'absolute', left: `${val * 100}%`, top: '50%', width: 0.065 * H, height: 0.065 * H, transform: 'translate(-50%,-50%)', borderRadius: '50%',
          background: '#fff', boxShadow: `0 0 0 5px ${alpha(p.accent, 0.35)}, 0 0 30px ${alpha(p.accent, 0.9)}`, opacity: el.marks[0] && t >= el.marks[0].at ? 1 : 0}} />
      </div>
      <div style={{position: 'relative', height: 0.08 * H}}>
        {el.labels.map((l, i) => (
          <div key={i} style={{position: 'absolute', top: 0.018 * H, left: `${n === 1 ? 50 : (i / (n - 1)) * 100}%`, transform: 'translateX(-50%)', whiteSpace: 'nowrap',
            fontFamily: tight, fontWeight: 600, fontSize: 0.042 * H, color: Math.abs(val - i / Math.max(1, n - 1)) < 0.12 && t >= (el.marks[0]?.at ?? 1e9) ? p.text : p.sub}}>{l}</div>
        ))}
      </div>
    </div>
  );
};

const Chart: React.FC<{el: Extract<MGEl, {kind: 'chart'}>; t: number; p: Pal}> = ({el, t, p}) => {
  const {width: W, height: H} = useVideoConfig();
  const v = env(t, el.at, el.out);
  const cw = el.w * W, ch = el.h * H;
  return (
    <div style={{position: 'absolute', left: el.x * W - cw / 2, top: el.y * H - ch / 2, width: cw, height: ch, ...envStyle(v)}}>
      <svg width={cw} height={ch} style={{overflow: 'visible', position: 'absolute', inset: 0}}>
        <path d={`M0,0 L0,${ch} L${cw},${ch}`} fill="none" stroke={p.border} strokeWidth={2} />
        {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={0} x2={cw} y1={ch * g} y2={ch * g} stroke={p.border} strokeOpacity={0.35} strokeDasharray="4 8" />)}
        {el.series.map((s, i) => {
          const pr = ease(t, s.at, s.at + (s.dur ?? 1.6), Easing.inOut(Easing.cubic));
          const col = tone(p, s.tone);
          const d = s.pts.map(([x, y], j) => `${j ? 'L' : 'M'}${x * cw},${(1 - y) * ch}`).join(' ');
          const last = s.pts[s.pts.length - 1];
          return (
            <g key={i}>
              <path d={d} pathLength={1} fill="none" stroke={col} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round"
                strokeDasharray="1 1" strokeDashoffset={1 - pr} style={{filter: `drop-shadow(0 0 10px ${alpha(col, 0.8)})`}} />
              {pr >= 0.99 && <circle cx={last[0] * cw} cy={(1 - last[1]) * ch} r={8} fill="#fff" style={{filter: `drop-shadow(0 0 12px ${col})`}} />}
            </g>
          );
        })}
      </svg>
      {el.series.map((s, i) => {
        const last = s.pts[s.pts.length - 1];
        const k = out(t, s.at + (s.dur ?? 1.6) - 0.1, 0.3);
        const col = tone(p, s.tone);
        return <div key={i} style={{position: 'absolute', left: last[0] * cw + 18, top: (1 - last[1]) * ch, transform: 'translateY(-50%)', whiteSpace: 'nowrap',
          fontFamily: tight, fontWeight: 700, fontSize: 0.04 * H, color: col, opacity: k, textShadow: `0 0 14px ${alpha(col, 0.6)}`}}>{s.label}</div>;
      })}
      {el.xLabels && <div style={{position: 'absolute', top: ch + 0.016 * H, left: 0, right: 0, display: 'flex', justifyContent: 'space-between',
        fontFamily: tight, fontWeight: 600, fontSize: 0.03 * H, color: p.sub, letterSpacing: '0.12em', textTransform: 'uppercase'}}>
        {el.xLabels.map((l, i) => <span key={i}>{l}</span>)}</div>}
    </div>
  );
};

const Bubble: React.FC<{el: Extract<MGEl, {kind: 'bubble'}>; t: number; p: Pal}> = ({el, t, p}) => {
  const {width: W, height: H} = useVideoConfig();
  const v = env(t, el.at, el.out);
  const chars = Math.max(0, Math.floor((t - el.at - 0.15) * 30));
  const S = 0.095 * H;
  const right = el.side === 'right';
  return (
    <div style={{position: 'absolute', left: el.x * W, top: el.y * H, transform: 'translate(-50%,-50%)', display: 'flex', alignItems: 'flex-end', gap: 0.012 * W,
      flexDirection: right ? 'row-reverse' : 'row', ...envStyle(v, 'translate(-50%,-50%)')}}>
      <div style={{width: S, height: S, flexShrink: 0, position: 'relative'}}><Disc S={S} col={p.accent} icon={el.icon ?? 'brain'} p={p} /></div>
      <Glass p={p} r={0.03 * H} style={{padding: `${0.018 * H}px ${0.028 * H}px`, maxWidth: (el.w ?? 0.4) * W, minWidth: 0.08 * W,
        borderBottomLeftRadius: right ? undefined : 6, borderBottomRightRadius: right ? 6 : undefined}}>
        <div style={{fontFamily: tight, fontWeight: 600, fontSize: 0.05 * H, color: p.text, letterSpacing: '-0.01em', lineHeight: 1.25}}>
          {el.text.slice(0, chars)}<span style={{opacity: chars < el.text.length ? 0.8 : 0}}>|</span>
        </div>
      </Glass>
    </div>
  );
};

const Counter: React.FC<{el: Extract<MGEl, {kind: 'counter'}>; t: number; p: Pal}> = ({el, t, p}) => {
  const {width: W, height: H} = useVideoConfig();
  const v = env(t, el.at, el.out);
  const val = mix(el.from, el.to, ease(t, el.at, el.at + (el.dur ?? 1.2), Easing.out(Easing.cubic)));
  const col = tone(p, el.tone);
  return (
    <div style={{position: 'absolute', left: el.x * W, top: el.y * H, textAlign: 'center', ...envStyle(v, 'translate(-50%,-50%)')}}>
      <div style={{fontFamily: sora, fontWeight: 700, fontSize: (el.size ?? 0.14) * H, color: col, letterSpacing: '-0.04em', lineHeight: 1,
        textShadow: `0 0 40px ${alpha(col, 0.5)}`, fontVariantNumeric: 'tabular-nums'}}>{el.prefix}{Math.round(val)}{el.suffix}</div>
      {el.label && <div style={{fontFamily: tight, fontWeight: 600, fontSize: 0.03 * H, color: p.sub, marginTop: 0.01 * H, letterSpacing: '0.14em', textTransform: 'uppercase'}}>{el.label}</div>}
    </div>
  );
};

const PillEl: React.FC<{el: Extract<MGEl, {kind: 'pill'}>; t: number; p: Pal}> = ({el, t, p}) => {
  const {width: W, height: H} = useVideoConfig();
  const v = env(t, el.at, el.out);
  const col = tone(p, el.tone);
  const chars = Math.max(0, Math.floor((t - el.at - 0.1) * 34));
  const fs = (el.size ?? 0.042) * H;
  return (
    <div style={{position: 'absolute', left: el.x * W, top: el.y * H, ...envStyle(v, 'translate(-50%,-50%)')}}>
      <Glass p={p} col={col} glowK={0.6} r={999} style={{display: 'flex', alignItems: 'center', gap: fs * 0.5, padding: `${fs * 0.42}px ${fs * 0.9}px`, whiteSpace: 'nowrap'}}>
        {el.icon && <Icon name={el.icon} size={fs * 1.05} color={col} stroke={2.2} />}
        <span style={{fontFamily: tight, fontWeight: 600, fontSize: fs, color: p.text}}>{el.text.slice(0, chars)}</span>
      </Glass>
    </div>
  );
};

const Cycle: React.FC<{el: Extract<MGEl, {kind: 'cycle'}>; t: number; p: Pal}> = ({el, t, p}) => {
  const {width: W, height: H} = useVideoConfig();
  const n = el.items.length, R = el.r * H, cx = el.x * W, cy = el.y * H, S = 0.125 * H;
  const angOf = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const period = el.period ?? 2.2;
  const spin = el.spinAt !== undefined && t >= el.spinAt ? (t - el.spinAt) / period : -1;
  const lap = spin >= 0 ? Math.floor(spin) : 0;
  const cometA = spin >= 0 ? -Math.PI / 2 + (spin % 1) * Math.PI * 2 : 0;
  const fade = el.out !== undefined ? 1 - ease(t, el.out, el.out + 0.35) : 1;
  const arcs = el.items.map((_, i) => {
    const a0 = angOf(i) + 0.33, a1 = angOf(i + 1) - 0.33;
    const pr = ease(t, el.ats[(i + 1) % n] - (i === n - 1 ? -0.1 : 0.25), el.ats[(i + 1) % n] + 0.45);
    const k = i === n - 1 ? ease(t, el.ats[n - 1] + 0.3, el.ats[n - 1] + 0.9) : pr;
    const x0 = cx + Math.cos(a0) * R, y0 = cy + Math.sin(a0) * R, x1 = cx + Math.cos(a1) * R, y1 = cy + Math.sin(a1) * R;
    return {d: `M${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1}`, k, a1, x1, y1};
  });
  return (
    <div style={{position: 'absolute', inset: 0, opacity: fade}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {arcs.map((a, i) => (
          <g key={i}>
            <path d={a.d} pathLength={1} fill="none" stroke={p.line} strokeWidth={2.4} strokeDasharray="1 1" strokeDashoffset={1 - a.k} strokeLinecap="round" />
            {a.k > 0.97 && <path d="M-10,-7 L0,0 L-10,7" fill="none" stroke={p.line} strokeWidth={2.4} strokeLinecap="round"
              transform={`translate(${a.x1},${a.y1}) rotate(${(a.a1 * 180) / Math.PI + 90})`} />}
          </g>
        ))}
        {spin >= 0 && Array.from({length: 14}, (_, j) => {
          const aa = cometA - j * 0.045;
          return <circle key={j} cx={cx + Math.cos(aa) * R} cy={cy + Math.sin(aa) * R} r={7 - j * 0.4} fill={p.accent2} opacity={(1 - j / 14) * 0.9}
            style={{filter: `drop-shadow(0 0 10px ${p.accent})`}} />;
        })}
      </svg>
      {el.items.map((it, i) => {
        const v = env(t, el.ats[i], undefined);
        const a = angOf(i);
        let hot = 0;
        if (spin >= 0) {
          const d = Math.abs((((cometA - a) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
          hot = Math.max(0, 1 - d / 0.5);
        }
        const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: 0, height: 0}}>
            <div style={{position: 'absolute', left: -S / 2, top: -S / 2, width: S, height: S, ...envStyle(v, `scale(${1 + 0.14 * hot})`)}}>
              <Disc S={S} col={tone(p, it.tone)} icon={it.icon} p={p} />
            </div>
            <div style={{position: 'absolute', left: 0, top: Math.sin(a) > 0.3 ? S * 0.62 : Math.sin(a) < -0.3 ? -S * 0.62 - 0.04 * H : -0.02 * H,
              transform: Math.abs(Math.cos(a)) > 0.5 ? `translateX(${Math.cos(a) > 0 ? S * 0.62 : `calc(-100% - ${S * 0.62}px)`})` : 'translateX(-50%)',
              whiteSpace: 'nowrap', fontFamily: tight, fontWeight: 600, fontSize: 0.042 * H, color: hot > 0.3 ? tone(p, it.tone) : p.text, opacity: v.o,
              textShadow: hot > 0.3 ? `0 0 16px ${alpha(tone(p, it.tone), 0.7)}` : '0 2px 12px rgba(0,0,0,0.5)'}}>{it.label}</div>
          </div>
        );
      })}
      {(el.center || el.count) && (
        <div style={{position: 'absolute', left: cx, top: cy, transform: 'translate(-50%,-50%)', textAlign: 'center', opacity: out(t, el.ats[n - 1] + 0.4, 0.4)}}>
          {el.center && <div style={{fontFamily: tight, fontWeight: 600, fontSize: 0.036 * H, color: p.sub, letterSpacing: '0.16em', textTransform: 'uppercase'}}>{el.center}</div>}
          {el.count && spin >= 0 && <div style={{fontFamily: sora, fontWeight: 700, fontSize: 0.13 * H, color: p.text, letterSpacing: '-0.03em',
            textShadow: `0 0 30px ${alpha(p.accent, 0.6)}`}}>×{lap + 1}</div>}
        </div>
      )}
    </div>
  );
};

// ---------- the beat ----------
export const MGView: React.FC<{b: MGBeatData & {start: number; end: number}; t: number}> = ({b, t}) => {
  const {width: W, height: H} = useVideoConfig();
  const theme = b.theme ?? 'teal';
  const p = PAL[theme];
  const cam = camAt(b.cam, t, b.start);
  const nodes: Record<string, {x: number; y: number; r: number}> = {};
  for (const e of b.els) if (e.id && e.kind === 'node') nodes[e.id] = {x: e.x, y: e.y, r: ((e.size ?? 0.12) * H) / 2};
  const render = (e: MGEl, i: number) => {
    if (t < e.at - 0.05 && e.kind !== 'text' && e.kind !== 'cycle') return null;
    if (e.out !== undefined && t > e.out + 0.4) return null;
    switch (e.kind) {
      case 'text': return <Text key={i} el={e} t={t} p={p} />;
      case 'node': return <Node key={i} el={e} t={t} p={p} />;
      case 'link': return <Link key={i} el={e} t={t} p={p} nodes={nodes} />;
      case 'tiles': return <Tiles key={i} el={e} t={t} p={p} />;
      case 'bar': return <Bar key={i} el={e} t={t} p={p} />;
      case 'meter': return <Meter key={i} el={e} t={t} p={p} />;
      case 'chart': return <Chart key={i} el={e} t={t} p={p} />;
      case 'bubble': return <Bubble key={i} el={e} t={t} p={p} />;
      case 'counter': return <Counter key={i} el={e} t={t} p={p} />;
      case 'pill': return <PillEl key={i} el={e} t={t} p={p} />;
      case 'cycle': return <Cycle key={i} el={e} t={t} p={p} />;
      default: return null;
    }
  };
  return (
    <AbsoluteFill>
      <MGBg theme={theme} t={t} px={cam.x - 0.5} py={cam.y - 0.5} />
      <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${W / 2}px, ${H / 2}px) scale(${cam.z}) translate(${-cam.x * W}px, ${-cam.y * H}px)`}}>
        {b.els.map(render)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
