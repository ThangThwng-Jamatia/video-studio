// Paper-explainer kit: palette, timing helpers, rigged characters, props, backgrounds and the PaperStage shell.
// Every paper video (src/paper/<Slug>.tsx) imports from here; add new props here so later videos can reuse them.
import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Fredoka';

export const {fontFamily} = loadFont();
export const C = {
  paper: '#F4EBD6', paper2: '#E9DCBC', ink: '#3B2F2A', terra: '#C8553D', mustard: '#E3A32B', sage: '#7C9A7E',
  navy: '#2E4057', skin: '#F2C29B', blush: '#E89A7A', cash: '#6BBF59', cashD: '#3F8F3A', dirt: '#7A5B3A',
  ground: '#D9C6A0', red: '#D2402F', glass: '#CFE3E6', grey: '#9A948A',
};
export const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ramp = (t: number, a: number, b: number, f = 0, to = 1) =>
  interpolate(t, [a, b], [f, to], {...CL, easing: Easing.inOut(Easing.cubic)});
export const pop = (t: number, at: number, d = 0.4) =>
  interpolate(t, [at, at + d], [0, 1], {...CL, easing: Easing.out(Easing.back(2.2))});

// ---------- primitives ----------
export const Pop: React.FC<{t: number; at: number; x: number; y: number; s?: number; r?: number; children: React.ReactNode}> = ({t, at, x, y, s = 1, r = 0, children}) => {
  const p = pop(t, at);
  if (p <= 0) return null;
  const d = React.useContext(DepthCtx);
  // depth mode: props spin in on a faux Y-rotation (scaleX), lift on a soft cast shadow and get clay/bevel lighting
  const spin = d ? Math.max(0.05, Math.min(1, pop(t, at, 0.5))) : 1;
  return <g transform={`translate(${x},${y}) rotate(${r}) scale(${p * s * spin},${p * s})`} opacity={Math.min(1, p * 3)} filter={d ? 'url(#clay)' : undefined}>{children}</g>;
};
// 2.5D "depth" mode (2026-10-24): set by PaperStage depth={true}; Pop/Txt read it.
export const DepthCtx = React.createContext(false);
export const Lift: React.FC<{children: React.ReactNode}> = ({children}) => <g filter="url(#clay)">{children}</g>;
export const DepthDefs: React.FC = () => (
  <defs>
    <filter id="clay" x="-25%" y="-25%" width="150%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation={5} result="b" />
      <feSpecularLighting in="b" surfaceScale={4} specularConstant={0.75} specularExponent={16} lightingColor="#FFF6E0" result="sp"><feDistantLight azimuth={225} elevation={48} /></feSpecularLighting>
      <feComposite in="sp" in2="SourceAlpha" operator="in" result="spIn" />
      <feDiffuseLighting in="b" surfaceScale={4} diffuseConstant={1.05} lightingColor="#fff" result="df"><feDistantLight azimuth={225} elevation={55} /></feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="df" operator="arithmetic" k1={1} k2={0} k3={0} k4={0} result="shaded" />
      <feComposite in="shaded" in2="SourceAlpha" operator="in" result="sh2" />
      <feComposite in="sh2" in2="spIn" operator="arithmetic" k1={0} k2={1} k3={0.5} k4={0} result="lit" />
      <feGaussianBlur in="SourceAlpha" stdDeviation={10} result="sb" /><feOffset in="sb" dx={12} dy={20} result="so" />
      <feFlood floodColor="#2A1F1A" floodOpacity={0.32} /><feComposite in2="so" operator="in" result="shadow" />
      <feMerge><feMergeNode in="shadow" /><feMergeNode in="lit" /></feMerge>
    </filter>
  </defs>
);

export const Txt: React.FC<{x: number; y: number; size: number; color?: string; children: React.ReactNode; anchor?: 'middle' | 'start'; weight?: number}> = ({x, y, size, color = C.ink, children, anchor = 'middle', weight = 600}) => {
  const d = React.useContext(DepthCtx);
  const T = (dx: number, fill: string, k?: number) => <text key={k} x={x + dx} y={y + dx} fontFamily={fontFamily} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor} dominantBaseline="middle">{children}</text>;
  // depth mode: big bold text is extruded (stacked darker copies down-right) for block-letter 3D
  if (!d || weight < 700 || size < 70) return T(0, color);
  const n = Math.round(size / 14), shade = color === C.ink ? '#B89A6A' : C.ink;
  return <g>{Array.from({length: n}).map((_, i) => T(n - i, shade, i))}{T(0, color)}</g>;
};

export const XMark: React.FC<{t: number; at: number; x: number; y: number; size?: number}> = ({t, at, x, y, size = 90}) => {
  const a = ramp(t, at, at + 0.15), b = ramp(t, at + 0.12, at + 0.27);
  const L = size * 2.83;
  return (
    <g transform={`translate(${x},${y})`} stroke={C.red} strokeWidth={22} strokeLinecap="round">
      <line x1={-size} y1={-size} x2={size} y2={size} strokeDasharray={L} strokeDashoffset={L * (1 - a)} />
      <line x1={size} y1={-size} x2={-size} y2={size} strokeDasharray={L} strokeDashoffset={L * (1 - b)} />
    </g>
  );
};

export const Arm: React.FC<{sx: number; sy: number; ang: number; len: number; color: string; skin?: string; children?: React.ReactNode}> = ({sx, sy, ang, len, color, skin = C.skin, children}) => (
  <g transform={`translate(${sx},${sy}) rotate(${ang})`}>
    <line x1={0} y1={0} x2={0} y2={len} stroke={color} strokeWidth={24} strokeLinecap="round" />
    <circle cx={0} cy={len} r={14} fill={skin} stroke={C.ink} strokeWidth={4} />
    {children ? <g transform={`translate(0,${len}) rotate(${-ang})`}>{children}</g> : null}
  </g>
);

export type PersonP = {
  x: number; y: number; t: number; s?: number; kind?: 'kid' | 'adult'; shirt?: string; pants?: string; hair?: string;
  cap?: boolean; stache?: boolean; stripe?: boolean; armL?: number; armR?: number; walk?: number; flip?: boolean;
  handL?: React.ReactNode; handR?: React.ReactNode; shades?: boolean; mood?: 'smile' | 'flat' | 'o' | 'grin'; tie?: boolean; headOnly?: boolean; skin?: string; zombie?: boolean; mask?: boolean;
};
export const Person: React.FC<PersonP> = ({x, y, t, s = 1, kind = 'kid', shirt = C.terra, pants = C.navy, hair = C.ink, cap, stache, stripe, armL = 12, armR = -12, walk = 0, flip, handL, handR, shades, mood = 'smile', tie, headOnly, skin, zombie, mask}) => {
  const A = kind === 'adult';
  const legH = A ? 220 : 150, torsoH = A ? 220 : 165, headR = A ? 66 : 84, tw = A ? 120 : 126;
  const hipY = -legH, top = hipY - torsoH + 26, headY = top - headR + 18;
  const sw = walk ? Math.sin(walk * Math.PI * 2) : 0;
  const bob = walk ? -Math.abs(Math.cos(walk * Math.PI * 2)) * 8 : Math.sin(t * 2.2) * 2.5;
  const blink = t % 3.7 < 0.12 ? 0.15 : 1;
  const sleeve = shirt;
  const sk = skin ?? (zombie ? '#9DBB84' : C.skin);
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      {!headOnly && <ellipse cx={0} cy={4} rx={80} ry={13} fill="rgba(59,47,42,.14)" />}
      <g transform={`translate(0,${bob})`}>
        {!headOnly && <>
        {[-1, 1].map((side) => (
          <g key={side} transform={`translate(${side * 24},${hipY}) rotate(${side * sw * 24})`}>
            <line x1={0} y1={0} x2={0} y2={legH - 14} stroke={A ? pants : sk} strokeWidth={A ? 26 : 24} strokeLinecap="round" />
            {!A && <rect x={-20} y={-6} width={40} height={60} rx={10} fill={pants} />}
            <ellipse cx={side * 0 + 10} cy={legH - 8} rx={28} ry={13} fill={C.ink} />
          </g>
        ))}
        <rect x={-tw / 2} y={top - 26} width={tw} height={torsoH + 10} rx={44} fill={shirt} stroke={C.ink} strokeWidth={5} />
        {stripe && <rect x={-tw / 2 + 3} y={top + 50} width={tw - 6} height={22} fill={C.mustard} />}
        {zombie && <path d={`M${-tw / 2 + 6},${top + torsoH - 30} l20,22 l18,-18 l22,24 l20,-20 l18,22 l${tw - 132},-26`} fill="none" stroke={C.ink} strokeWidth={4} />}
        {tie && <path d={`M0,${top - 18} l-12,20 l12,90 l12,-90 Z`} fill={C.terra} stroke={C.ink} strokeWidth={4} />}
        <Arm sx={-tw / 2 + 14} sy={top - 4} ang={armL} len={A ? 150 : 115} color={sleeve} skin={sk}>{handL}</Arm>
        <Arm sx={tw / 2 - 14} sy={top - 4} ang={armR} len={A ? 150 : 115} color={sleeve} skin={sk}>{handR}</Arm>
        </>}
        {/* head */}
        <g transform={`translate(0,${headY})`}>
          <circle cx={-headR + 4} cy={8} r={16} fill={sk} stroke={C.ink} strokeWidth={4} />
          <circle cx={headR - 4} cy={8} r={16} fill={sk} stroke={C.ink} strokeWidth={4} />
          <circle r={headR} fill={sk} stroke={C.ink} strokeWidth={5} />
          {cap ? (
            <g>
              <path d={`M${-headR + 4},-10 A${headR - 4},${headR - 4} 0 0 1 ${headR - 4},-10 Z`} fill={C.mustard} stroke={C.ink} strokeWidth={5} />
              <path d={`M${headR - 16},-14 Q${headR + 40},-16 ${headR + 52},-2 L${headR - 10},-2 Z`} fill={C.mustard} stroke={C.ink} strokeWidth={5} />
              <circle cx={0} cy={-headR + 2} r={8} fill={C.terra} />
            </g>
          ) : (
            <path d={`M${-headR + 2},-6 Q${-headR + 6},${-headR - 14} 0,${-headR - 8} Q${headR - 6},${-headR - 14} ${headR - 2},-6 Q${headR * 0.3},-${headR * 0.55} ${-headR + 2},-6 Z`} fill={hair} stroke={C.ink} strokeWidth={4} />
          )}
          {shades ? (
            <g fill={C.ink}><rect x={-46} y={-4} width={38} height={22} rx={8} /><rect x={8} y={-4} width={38} height={22} rx={8} /><line x1={-8} y1={4} x2={8} y2={4} stroke={C.ink} strokeWidth={5} /></g>
          ) : (
            <g>
              {zombie && <g fill="#6E8A5C" opacity={0.8}><circle cx={-26} cy={6} r={20} /><circle cx={26} cy={6} r={20} /></g>}
              {zombie && <path d="M-56,-30 l40,10 M-48,-40 l6,22 M-34,-36 l6,22" stroke={C.ink} strokeWidth={4} fill="none" />}
              <g fill={zombie ? '#F4EBD6' : C.ink}><ellipse cx={-26} cy={6} rx={8} ry={10 * blink} /><ellipse cx={26} cy={6} rx={8} ry={10 * blink} /></g>
            </g>
          )}
          {!A && <g fill={C.blush}>{[[-44, 30], [-34, 36], [-50, 38], [44, 30], [34, 36], [50, 38]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={3.5} />)}</g>}
          {stache && <path d="M-34,30 Q-16,18 0,28 Q16,18 34,30 Q16,40 0,34 Q-16,40 -34,30 Z" fill={hair} />}
          {mood === 'smile' && <path d="M-20,36 Q0,52 20,36" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />}
          {mood === 'grin' && <path d="M-26,32 Q0,64 26,32 Z" fill={C.ink} />}
          {mood === 'flat' && <line x1={-16} y1={42} x2={16} y2={42} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />}
          {mood === 'o' && <ellipse cx={0} cy={42} rx={9} ry={12} fill={C.ink} />}
          {mask && <g stroke={C.ink} strokeWidth={4}><line x1={-headR + 6} y1={14} x2={-40} y2={22} /><line x1={headR - 6} y1={14} x2={40} y2={22} /><path d="M-42,18 Q0,10 42,18 L38,52 Q0,66 -38,52 Z" fill="#CFE3E6" /></g>}
        </g>
      </g>
    </g>
  );
};

export const Car: React.FC<{x: number; y: number; s?: number; dirt?: number; color?: string}> = ({x, y, s = 1, dirt = 0, color = C.sage}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={250} ry={16} fill="rgba(59,47,42,.14)" />
    <path d="M-240,-30 L-240,-80 Q-236,-104 -200,-108 L-130,-112 L-76,-176 Q-66,-188 -44,-188 L92,-188 Q114,-188 130,-172 L182,-112 L222,-104 Q248,-96 248,-66 L248,-30 Z" fill={color} stroke={C.ink} strokeWidth={6} />
    <path d="M-110,-116 L-64,-170 L0,-170 L0,-116 Z M16,-116 L16,-170 L90,-170 Q102,-170 110,-160 L150,-116 Z" fill={C.glass} stroke={C.ink} strokeWidth={5} />
    <rect x={190} y={-96} width={36} height={16} rx={6} fill={C.mustard} />
    {[-140, 150].map((wx) => <g key={wx}><circle cx={wx} cy={-30} r={46} fill={C.ink} /><circle cx={wx} cy={-30} r={18} fill={C.paper2} /></g>)}
    <g fill={C.dirt} opacity={dirt}>
      {[[-180, -80, 40, 22], [-60, -70, 60, 26], [70, -86, 44, 20], [180, -66, 38, 18], [-20, -150, 30, 14], [100, -60, 30, 16], [-200, -50, 30, 14], [40, -140, 26, 12]].map(([a, b, c, d], i) => <ellipse key={i} cx={a} cy={b} rx={c} ry={d} />)}
    </g>
  </g>
);

export const Stink: React.FC<{t: number; x: number; y: number; o: number}> = ({t, x, y, o}) => (
  <g transform={`translate(${x},${y})`} opacity={o} stroke="#8A9A4A" strokeWidth={8} fill="none" strokeLinecap="round">
    {[-90, 0, 90].map((dx, i) => {
      const lift = ((t * 0.8 + i * 0.33) % 1);
      return <path key={i} opacity={1 - lift} transform={`translate(${dx},${-lift * 70})`} d="M0,0 q-18,-20 0,-40 q18,-20 0,-40" />;
    })}
    {[0, 1, 2].map((i) => <circle key={i} cx={Math.sin(t * 5 + i * 2) * 110} cy={-60 + Math.cos(t * 7 + i) * 30} r={6} fill={C.ink} stroke="none" />)}
  </g>
);

export const House: React.FC<{x: number; y: number; body: string; roof: string; w?: number; h?: number}> = ({x, y, body, roof, w = 300, h = 250}) => (
  <g transform={`translate(${x},${y})`} stroke={C.ink} strokeWidth={6}>
    <rect x={-w / 2} y={-h} width={w} height={h} fill={body} />
    <path d={`M${-w / 2 - 26},${-h} L0,${-h - 130} L${w / 2 + 26},${-h} Z`} fill={roof} strokeLinejoin="round" />
    <rect x={-w / 2 + 34} y={-h + 50} width={70} height={70} fill={C.glass} />
    <rect x={w / 2 - 104} y={-h + 50} width={70} height={70} fill={C.glass} />
    <rect x={-34} y={-120} width={68} height={120} fill={C.terra} />
    <circle cx={20} cy={-60} r={5} fill={C.ink} />
  </g>
);

export const Cash: React.FC<{w?: number}> = ({w = 150}) => (
  <g>
    {[16, 8, 0].map((o) => <rect key={o} x={-w / 2 + o} y={-w * 0.25 - o} width={w} height={w * 0.5} rx={10} fill={o ? C.cashD : C.cash} stroke={C.ink} strokeWidth={5} />)}
    <circle cx={0} cy={0} r={w * 0.14} fill="none" stroke={C.cashD} strokeWidth={5} />
    <Txt x={0} y={2} size={w * 0.2} color={C.cashD}>$</Txt>
  </g>
);
export const Bill: React.FC<{label: string; w?: number}> = ({label, w = 220}) => (
  <g><rect x={-w / 2} y={-w * 0.26} width={w} height={w * 0.52} rx={12} fill={C.cash} stroke={C.ink} strokeWidth={6} />
    <rect x={-w / 2 + 14} y={-w * 0.26 + 14} width={w - 28} height={w * 0.52 - 28} rx={8} fill="none" stroke={C.cashD} strokeWidth={4} />
    <Txt x={0} y={4} size={w * 0.26} color={C.cashD} weight={700}>{label}</Txt></g>
);
export const Browser = () => (
  <g stroke={C.ink} strokeWidth={6}><rect x={-110} y={-80} width={220} height={160} rx={14} fill={C.paper} /><rect x={-110} y={-80} width={220} height={36} rx={14} fill={C.navy} />
    {[-86, -64, -42].map((cx) => <circle key={cx} cx={cx} cy={-62} r={6} fill={C.paper} strokeWidth={0} />)}
    <rect x={-80} y={-20} width={90} height={60} fill={C.sage} strokeWidth={4} /><line x1={30} y1={-14} x2={86} y2={-14} /><line x1={30} y1={10} x2={86} y2={10} /><line x1={30} y1={34} x2={70} y2={34} /></g>
);
export const Clipboard = () => (
  <g stroke={C.ink} strokeWidth={6}><rect x={-80} y={-105} width={160} height={210} rx={14} fill={C.dirt} /><rect x={-62} y={-80} width={124} height={170} fill={C.paper} strokeWidth={4} />
    <rect x={-34} y={-118} width={68} height={30} rx={8} fill={C.grey} />
    {[-40, -5, 30, 65].map((yy) => <g key={yy}><path d={`M-44,${yy} l8,8 l14,-16`} fill="none" stroke={C.sage} strokeWidth={6} /><line x1={-10} y1={yy} x2={44} y2={yy} strokeWidth={5} /></g>)}</g>
);
export const Bucket: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} stroke={C.ink} strokeWidth={6}>
    <path d="M-40,-40 Q0,-110 40,-40" fill="none" />
    <path d="M-52,-40 L52,-40 L40,60 L-40,60 Z" fill="#4F86A8" strokeLinejoin="round" />
    <ellipse cx={0} cy={-40} rx={52} ry={12} fill="#BFE0EE" />
    {[[-20, -54], [8, -62], [26, -50]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={10} fill="#fff" strokeWidth={3} />)}
  </g>
);
export const Sponge: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`}><rect x={-46} y={-30} width={92} height={60} rx={16} fill="#F3D04A" stroke={C.ink} strokeWidth={6} />
    {[[-24, -8], [4, 8], [24, -12], [-6, -14], [-26, 14]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={5} fill="#D3A92A" />)}</g>
);
export const Coin: React.FC = () => (<g><circle r={30} fill={C.mustard} stroke={C.ink} strokeWidth={5} /><Txt x={0} y={2} size={34} color={C.ink} weight={700}>$</Txt></g>);
export const Sparkle: React.FC<{t: number; at: number; x: number; y: number; s?: number}> = ({t, at, x, y, s = 1}) => {
  const p = ramp(t, at, at + 0.5), o = 1 - ramp(t, at + 0.6, at + 1.1);
  if (p <= 0 || o <= 0) return null;
  return <path transform={`translate(${x},${y}) scale(${p * s}) rotate(${p * 90})`} opacity={o} d="M0,-40 Q6,-6 40,0 Q6,6 0,40 Q-6,6 -40,0 Q-6,-6 0,-40 Z" fill="#fff" stroke={C.ink} strokeWidth={4} />;
};
export const Bubble: React.FC<{w?: number; h?: number; children: React.ReactNode}> = ({w = 200, h = 150, children}) => (
  <g><path d={`M${-w / 2},${-h / 2} h${w} v${h} h${-w / 2 + 30} l-40,40 l0,-40 h${-w / 2 + 10} Z`} fill="#fff" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />{children}</g>
);
export const Arrow: React.FC<{t: number; a: number; x1: number; x2: number; y: number; lift?: number}> = ({t, a, x1, x2, y, lift = 160}) => {
  const p = ramp(t, a, a + 0.45);
  const d = `M${x1},${y} Q${(x1 + x2) / 2},${y - lift} ${x2},${y}`;
  return <path d={d} fill="none" stroke={C.terra} strokeWidth={12} strokeLinecap="round" strokeDasharray="2000" strokeDashoffset={2000 * (1 - p * 0.55)} pathLength={1100} />;
};

// ---------- backgrounds ----------
export const Street: React.FC = () => (
  <g>
    <rect x={-400} y={0} width={3200} height={1080} fill={C.paper} />
    <rect x={-400} y={800} width={3200} height={280} fill={C.ground} />
    <line x1={-400} y1={800} x2={2800} y2={800} stroke={C.ink} strokeWidth={6} />
    {[[200, '#E7C9A2'], [1500, '#CFD8C0'], [2250, '#E7C9A2']].map(([x, b], i) => <House key={i} x={x as number} y={800} body={b as string} roof={i % 2 ? C.terra : C.sage} />)}
    {[[-200, 180], [900, 130], [1900, 210]].map(([x, y], i) => <g key={i} fill="#fff" stroke={C.ink} strokeWidth={5} opacity={0.9}><ellipse cx={x} cy={y} rx={110} ry={40} /><ellipse cx={x + 60} cy={y - 26} rx={60} ry={36} /></g>)}
  </g>
);


export type Scene = {from: number; to: number; C: React.FC<{t: number}>};
export type Sfx = [number, string, number];

// ---------- captions: one short line at the bottom, built from whisper word times (public/<job>/voice.json) ----------
type Cap = {start: number; end: number; text: string};
const buildCaptions = (json: any, maxChars: number): Cap[] => {
  const words: {w: string; s: number; e: number}[] = [];
  for (const seg of json.segments ?? []) for (const w of seg.words ?? []) words.push({w: String(w.word).trim(), s: w.start, e: w.end});
  const caps: Cap[] = []; let cur: typeof words = [];
  const flush = () => { if (cur.length) caps.push({start: cur[0].s, end: cur[cur.length - 1].e, text: cur.map((x) => x.w).join(' ').replace(/ -/g, '-').replace(/ ,(\d)/g, ',$1').replace(/ %/g, '%')}); cur = []; };
  for (const w of words) {
    const len = cur.map((x) => x.w).join(' ').length + w.w.length + 1;
    if (cur.length && (len > maxChars || w.s - cur[cur.length - 1].e > 0.7)) flush();
    cur.push(w);
    if (/[.?!]$/.test(w.w) || (/,$/.test(w.w) && cur.length >= 4)) flush();
  }
  flush();
  return caps;
};
export const PaperCaptions: React.FC<{job: string; maxChars?: number; bottom?: number; size?: number}> = ({job, maxChars = 42, bottom = 46, size = 40}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  const [caps, setCaps] = React.useState<Cap[] | null>(null);
  const [handle] = React.useState(() => delayRender('captions'));
  React.useEffect(() => {
    fetch(staticFile(`${job}/voice.json`)).then((r) => r.json()).then((j) => { setCaps(buildCaptions(j, maxChars)); continueRender(handle); })
      .catch(() => { setCaps([]); continueRender(handle); });
  }, [job, maxChars, handle]);
  if (!caps) return null;
  const i = caps.findIndex((c, k) => t >= c.start - 0.05 && t < Math.max(c.end + 0.4, 0) && (k === caps.length - 1 || t < caps[k + 1].start - 0.05));
  if (i < 0) return null;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: bottom, pointerEvents: 'none'}}>
      <div style={{fontFamily, fontWeight: 600, fontSize: size, lineHeight: 1.15, color: '#FFF8EC', background: 'rgba(42,33,29,0.78)', borderRadius: 14,
        padding: '8px 22px', whiteSpace: 'nowrap', maxWidth: '92%', overflow: 'hidden', textOverflow: 'ellipsis'}}>{caps[i].text}</div>
    </AbsoluteFill>
  );
};

// Shared composition shell: scenes crossfade + push-in, paper grain, vignette, boil, voice + music + SFX.
// captions default ON (user rule 2026-10-23): one small line at the bottom; for 9:16 pass captionChars ~26.
export const PaperStage: React.FC<{job: string; sec: number; scenes: Scene[]; sfx: Sfx[]; musicVol?: number; captions?: boolean; captionChars?: number; depth?: boolean}> = ({job, sec, scenes, sfx, musicVol = 0.13, captions = true, captionChars = 42, depth}) => {
  if (depth) return <DepthStage job={job} sec={sec} scenes={scenes} sfx={sfx} musicVol={musicVol} captions={captions} captionChars={captionChars} />;
  const frame = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const t = frame / fps;
  // hand-drawn "boil": the drawing layer jitters slightly every 4 frames
  const k = Math.floor(frame / 4);
  const jx = Math.sin(k * 12.9898) * 1.4, jy = Math.cos(k * 78.233) * 1.4;
  const fadeOut = ramp(t, sec - 0.6, sec);
  return (
    <AbsoluteFill style={{backgroundColor: C.paper}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={4} /><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.18  0 0 0 0.28 0" /></filter>
          <radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset="60%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#3B2F2A" stopOpacity={0.28} /></radialGradient>
        </defs>
        {scenes.map(({from, to, C: Scene}, i) => {
          if (t < from || t > to + 0.35) return null;
          const fin = i === 0 ? 1 : ramp(t, from, from + 0.3);
          const push = ramp(t, from, to, 1, 1.04);
          return (
            <g key={i} opacity={fin} transform={`translate(${W / 2 + jx},${H / 2 + jy}) scale(${push * (0.97 + fin * 0.03)}) translate(${-W / 2},${-H / 2})`}>
              <Scene t={t} />
            </g>
          );
        })}
        <rect width={W} height={H} filter="url(#paper)" style={{mixBlendMode: 'multiply'}} />
        <rect width={W} height={H} fill="url(#vig)" />
        <rect width={W} height={H} fill={C.paper} opacity={fadeOut} />
      </svg>
      {captions && <PaperCaptions job={job} maxChars={captionChars} {...(H > W ? {bottom: 150, size: 46} : {})} />}
      <Audio src={staticFile(`${job}/voice.mp3`)} />
      <Audio src={staticFile(`${job}/music.wav`)} volume={(f) => interpolate(f / fps, [0, 1, sec - 1.5, sec], [0, musicVol, musicVol, 0], CL)} />
      {sfx.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.round(at * fps)} durationInFrames={Math.round(2.5 * fps)}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ---------- props added for "Basic Economics" (2026-10-22) ----------
export const Rat: React.FC<{s?: number; t?: number}> = ({s = 1, t = 0}) => (
  <g transform={`scale(${s})`} stroke={C.ink} strokeWidth={5}>
    <path d={`M60,10 Q120,${20 + Math.sin(t * 8) * 12} 150,-10`} fill="none" stroke="#C98E7A" strokeWidth={8} strokeLinecap="round" />
    <ellipse cx={0} cy={0} rx={70} ry={42} fill={C.grey} />
    <circle cx={-58} cy={-30} r={20} fill="#C98E7A" />
    <path d="M-60,-10 L-110,10 L-60,22 Z" fill={C.grey} strokeLinejoin="round" />
    <circle cx={-108} cy={10} r={7} fill={C.ink} />
    <circle cx={-72} cy={-2} r={6} fill={C.ink} stroke="none" />
  </g>
);
export const CoffeeCup: React.FC<{s?: number; t?: number}> = ({s = 1, t = 0}) => (
  <g transform={`scale(${s})`} stroke={C.ink} strokeWidth={6}>
    {[-24, 0, 24].map((dx, i) => <path key={i} d={`M${dx},-90 q-12,-18 0,-36 q12,-18 0,-36`} fill="none" stroke={C.grey} opacity={0.5 + 0.4 * Math.sin(t * 4 + i)} strokeLinecap="round" />)}
    <path d="M-60,-70 L60,-70 L48,60 L-48,60 Z" fill="#fff" strokeLinejoin="round" />
    <rect x={-58} y={-30} width={116} height={40} fill={C.dirt} />
    <path d="M58,-40 q44,0 40,36 q-4,30 -46,26" fill="none" />
  </g>
);
export const PriceTag: React.FC<{label: string; color?: string; s?: number}> = ({label, color = C.mustard, s = 1}) => (
  <g transform={`scale(${s})`}><path d="M-110,-50 L80,-50 L130,0 L80,50 L-110,50 Z" fill={color} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={86} cy={0} r={10} fill={C.paper} stroke={C.ink} strokeWidth={4} /><Txt x={-14} y={4} size={52} weight={700}>{label}</Txt></g>
);
export const Sneaker: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} stroke={C.ink} strokeWidth={6} strokeLinejoin="round">
    <path d="M-110,30 L-110,-40 Q-80,-50 -50,-30 L10,-10 Q90,0 110,20 L110,30 Z" fill={C.terra} />
    <rect x={-116} y={26} width={232} height={22} rx={10} fill="#fff" />
    {[-60, -40, -20].map((x) => <line key={x} x1={x} y1={-30} x2={x + 10} y2={-12} stroke="#fff" strokeWidth={5} />)}
  </g>
);
export const Phone: React.FC<{s?: number; glow?: boolean}> = ({s = 1, glow}) => (
  <g transform={`scale(${s})`}><rect x={-50} y={-90} width={100} height={180} rx={16} fill={C.ink} />
    <rect x={-40} y={-74} width={80} height={140} rx={6} fill={glow ? '#9FD3E0' : C.navy} />
    {glow && [0, 1, 2].map((i) => <rect key={i} x={-30} y={-62 + i * 40} width={60} height={28} rx={4} fill="#fff" opacity={0.8} />)}</g>
);
export const Book: React.FC<{s?: number; color?: string}> = ({s = 1, color = C.navy}) => (
  <g transform={`scale(${s})`} stroke={C.ink} strokeWidth={5}><path d="M0,-50 Q-50,-70 -100,-50 L-100,50 Q-50,30 0,50 Z" fill="#fff" /><path d="M0,-50 Q50,-70 100,-50 L100,50 Q50,30 0,50 Z" fill="#fff" />
    <path d="M-100,50 Q-50,30 0,50 Q50,30 100,50 L100,60 L-100,60 Z" fill={color} /></g>
);
export const Clock: React.FC<{t: number; s?: number; speed?: number}> = ({t, s = 1, speed = 1}) => (
  <g transform={`scale(${s})`}><circle r={80} fill="#fff" stroke={C.ink} strokeWidth={7} />
    <line x1={0} y1={0} x2={0} y2={-56} stroke={C.ink} strokeWidth={7} strokeLinecap="round" transform={`rotate(${t * 360 * speed})`} />
    <line x1={0} y1={0} x2={0} y2={-36} stroke={C.terra} strokeWidth={9} strokeLinecap="round" transform={`rotate(${t * 30 * speed})`} /><circle r={8} fill={C.ink} /></g>
);
export const Stall: React.FC<{color: string; sign: string; s?: number}> = ({color, sign, s = 1}) => (
  <g transform={`scale(${s})`} stroke={C.ink} strokeWidth={6}>
    <rect x={-180} y={-150} width={360} height={150} fill="#D9B27C" />
    {[-180, 160].map((x) => <rect key={x} x={x} y={-330} width={20} height={180} fill={C.dirt} />)}
    <path d="M-200,-330 L200,-330 L200,-280 Q180,-250 160,-280 Q140,-250 120,-280 Q100,-250 80,-280 Q60,-250 40,-280 Q20,-250 0,-280 Q-20,-250 -40,-280 Q-60,-250 -80,-280 Q-100,-250 -120,-280 Q-140,-250 -160,-280 Q-180,-250 -200,-280 Z" fill={color} strokeLinejoin="round" />
    <rect x={-130} y={-120} width={260} height={70} rx={10} fill={C.paper} /><Txt x={0} y={-84} size={44} weight={700}>{sign}</Txt>
  </g>
);
export const BigArrow: React.FC<{up: boolean; s?: number}> = ({up, s = 1}) => (
  <g transform={`scale(${s}) rotate(${up ? 0 : 180})`}><path d="M0,-120 L90,-20 L40,-20 L40,110 L-40,110 L-40,-20 L-90,-20 Z" fill={up ? C.cash : C.red} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" /></g>
);
export const Plant: React.FC<{g?: number}> = ({g = 1}) => (
  <g><path d={`M0,0 L0,${-120 * g}`} stroke={C.cashD} strokeWidth={10} />
    {g > 0.3 && <><ellipse cx={-34} cy={-70 * g} rx={34} ry={16} fill={C.cash} stroke={C.ink} strokeWidth={4} transform={`rotate(-30,${-34},${-70 * g})`} /><ellipse cx={34} cy={-100 * g} rx={34} ry={16} fill={C.cash} stroke={C.ink} strokeWidth={4} transform={`rotate(30,34,${-100 * g})`} /></>}
    {g > 0.8 && [-12, 10, 0].map((x, i) => <circle key={i} cx={x} cy={-120 - i * 10} r={9} fill={C.red} stroke={C.ink} strokeWidth={3} />)}</g>
);
export const Chair: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} stroke={C.ink} strokeWidth={7} strokeLinecap="round">
    <line x1={-70} y1={0} x2={-70} y2={-110} /><line x1={70} y1={0} x2={70} y2={-110} />
    <rect x={-90} y={-130} width={180} height={26} rx={8} fill={C.dirt} /><rect x={-90} y={-280} width={26} height={170} rx={8} fill={C.dirt} />
  </g>
);

// ---------- icons (Basic Economics, 2026-10-22) ----------
const st = {stroke: C.ink, strokeWidth: 6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
export const Envelope: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...st}><rect x={-110} y={-70} width={220} height={140} rx={10} fill="#fff" /><path d="M-110,-70 L0,10 L110,-70" fill="none" /><circle cx={70} cy={-40} r={16} fill={C.terra} /></g>
);
export const Briefcase: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...st}><rect x={-40} y={-90} width={80} height={40} rx={10} fill="none" /><rect x={-110} y={-60} width={220} height={140} rx={14} fill={C.dirt} /><rect x={-20} y={-10} width={40} height={24} fill={C.mustard} /></g>
);
export const Dumbbell: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...st}><rect x={-80} y={-8} width={160} height={16} fill={C.grey} />{[-1, 1].map((k) => <rect key={k} x={k * 80 - 20} y={-50} width={40} height={100} rx={8} fill={C.navy} />)}</g>
);
export const Bed: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...st}><rect x={-120} y={-20} width={240} height={50} fill={C.sage} /><rect x={-120} y={-70} width={20} height={130} fill={C.dirt} /><rect x={-96} y={-46} width={70} height={30} rx={12} fill="#fff" />
    <Txt x={60} y={-80} size={54} weight={700}>z z</Txt></g>
);
export const Blocks: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...st}><rect x={-90} y={0} width={80} height={60} fill={C.terra} /><rect x={10} y={0} width={80} height={60} fill={C.mustard} /><rect x={-40} y={-60} width={80} height={60} fill={C.sage} /></g>
);
export const Battery: React.FC<{s?: number; level?: number}> = ({s = 1, level = 1}) => (
  <g transform={`scale(${s})`} {...st}><rect x={-90} y={-46} width={170} height={92} rx={12} fill="#fff" /><rect x={80} y={-18} width={16} height={36} fill={C.ink} />
    <rect x={-78} y={-34} width={146 * level} height={68} rx={6} fill={level > 0.4 ? C.cash : C.red} strokeWidth={0} /></g>
);
export const GradCap: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...st}><path d="M-130,-20 L0,-80 L130,-20 L0,40 Z" fill={C.navy} /><path d="M-70,10 L-70,60 Q0,100 70,60 L70,10" fill={C.navy} /><path d="M100,-10 L100,60" fill="none" stroke={C.mustard} strokeWidth={8} /></g>
);
export const Gavel: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...st}><g transform="rotate(-35)"><rect x={-70} y={-40} width={140} height={60} rx={12} fill={C.dirt} /><rect x={-10} y={20} width={20} height={150} rx={8} fill={C.dirt} /></g><rect x={-60} y={150} width={160} height={30} rx={8} fill={C.dirt} /></g>
);
export const Laptop: React.FC<{s?: number; lines?: number}> = ({s = 1, lines = 3}) => (
  <g transform={`scale(${s})`} {...st}><rect x={-130} y={-150} width={260} height={160} rx={12} fill={C.ink} /><rect x={-114} y={-136} width={228} height={132} fill={C.navy} />
    {Array.from({length: Math.min(8, Math.floor(lines))}).map((_, i) => <line key={i} x1={-96 + (i % 3) * 14} y1={-120 + i * 15} x2={-20 + ((i * 37) % 80)} y2={-120 + i * 15} stroke={[C.cash, C.mustard, '#9FD3E0'][i % 3]} strokeWidth={6} />)}
    <path d="M-160,10 L160,10 L180,40 L-180,40 Z" fill={C.grey} /></g>
);
export const Pot: React.FC<{s?: number; t?: number}> = ({s = 1, t = 0}) => (
  <g transform={`scale(${s})`} {...st}>{[-30, 0, 30].map((dx, i) => <path key={i} d={`M${dx},-80 q-10,-16 0,-32 q10,-16 0,-32`} fill="none" stroke={C.grey} opacity={0.6 + 0.3 * Math.sin(t * 4 + i)} />)}
    <rect x={-100} y={-60} width={200} height={110} rx={20} fill={C.grey} /><rect x={-120} y={-70} width={240} height={22} rx={10} fill={C.ink} /></g>
);
export const Carrot: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...st}><path d="M-20,-60 L20,-60 L0,80 Z" fill={C.terra} /><path d="M0,-60 L-24,-100 M0,-60 L0,-110 M0,-60 L24,-100" stroke={C.cashD} strokeWidth={9} fill="none" /></g>
);
export const CalendarPage: React.FC<{label: string; s?: number}> = ({label, s = 1}) => (
  <g transform={`scale(${s})`} {...st}><rect x={-100} y={-100} width={200} height={200} rx={14} fill="#fff" /><rect x={-100} y={-100} width={200} height={56} rx={14} fill={C.terra} />
    <Txt x={0} y={28} size={label.length > 3 ? 54 : 74} weight={700}>{label}</Txt></g>
);
export const Doc: React.FC<{s?: number; title?: string; color?: string}> = ({s = 1, title = '', color = '#fff'}) => (
  <g transform={`scale(${s})`} {...st}><path d="M-80,-110 L50,-110 L80,-80 L80,110 L-80,110 Z" fill={color} />
    {title && <Txt x={0} y={-70} size={30} weight={700}>{title}</Txt>}{[-30, 0, 30, 60].map((y) => <line key={y} x1={-56} y1={y} x2={56} y2={y} strokeWidth={5} />)}</g>
);
export const StormCloud: React.FC<{t: number; s?: number}> = ({t, s = 1}) => (
  <g transform={`scale(${s})`}>
    {[-80, -30, 20, 70].map((dx, i) => <line key={i} x1={dx} y1={60 + ((t * 400 + i * 50) % 120)} x2={dx - 14} y2={90 + ((t * 400 + i * 50) % 120)} stroke="#4F86A8" strokeWidth={8} strokeLinecap="round" />)}
    <g fill={C.grey} {...st}><ellipse cx={-70} cy={0} rx={100} ry={56} /><ellipse cx={50} cy={-20} rx={110} ry={70} /><ellipse cx={0} cy={26} rx={150} ry={44} /></g>
    <path d="M10,40 L-20,100 L10,100 L-10,160" fill="none" stroke={C.mustard} strokeWidth={10} strokeLinecap="round" opacity={Math.sin(t * 9) > 0.6 ? 1 : 0} />
  </g>
);
export const Bulb: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...st}><path d="M-60,30 a80,80 0 1 1 120,0 l-16,40 l-88,0 Z" fill="#FFF3B0" /><rect x={-40} y={74} width={80} height={36} rx={8} fill={C.grey} /></g>
);
export const Gear: React.FC<{s?: number; t?: number}> = ({s = 1, t = 0}) => (
  <g transform={`scale(${s}) rotate(${t * 60})`} {...st}>{Array.from({length: 8}).map((_, i) => <rect key={i} x={-14} y={-86} width={28} height={30} fill={C.grey} transform={`rotate(${i * 45})`} />)}
    <circle r={62} fill={C.grey} /><circle r={22} fill={C.paper} /></g>
);
export const Scissors: React.FC<{s?: number; open?: number}> = ({s = 1, open = 1}) => (
  <g transform={`scale(${s})`} {...st} fill="none">{[-1, 1].map((k) => <g key={k} transform={`rotate(${k * 15 * open})`}><line x1={0} y1={0} x2={140} y2={0} strokeWidth={10} /><circle cx={-40} cy={k * 20} r={26} fill={C.terra} /></g>)}</g>
);
export const Shelf: React.FC<{items: number; t?: number}> = ({items}) => (
  <g {...st}><rect x={-260} y={-300} width={520} height={340} fill="#D9B27C" /><line x1={-260} y1={-140} x2={260} y2={-140} /><line x1={-260} y1={20} x2={260} y2={20} />
    {Array.from({length: 8}).map((_, i) => i < items ? <g key={i} transform={`translate(${-195 + (i % 4) * 130},${i < 4 ? -150 : 10}) scale(0.5)`}><CoffeeCup /></g> : null)}</g>
);
export const Heart: React.FC<{s?: number}> = ({s = 1}) => (
  <path transform={`scale(${s})`} d="M0,60 C-120,-20 -60,-110 0,-50 C60,-110 120,-20 0,60 Z" fill={C.terra} stroke={C.ink} strokeWidth={6} />
);
export const Signpost: React.FC<{s?: number; a?: string; b?: string}> = ({s = 1, a = '', b = ''}) => (
  <g transform={`scale(${s})`} {...st}><rect x={-10} y={-180} width={20} height={240} fill={C.dirt} />
    <path d="M-10,-170 L-170,-170 L-200,-140 L-170,-110 L-10,-110 Z" fill={C.sage} /><path d="M10,-90 L170,-90 L200,-60 L170,-30 L10,-30 Z" fill={C.mustard} />
    <Txt x={-100} y={-138} size={30} weight={700}>{a}</Txt><Txt x={100} y={-58} size={30} weight={700}>{b}</Txt></g>
);

// ---------- scene helpers ----------
export const Floor: React.FC<{bg?: string; ground?: string; y?: number}> = ({bg = C.paper, ground = C.paper2, y = 860}) => (
  <g><rect width={1920} height={1080} fill={bg} /><rect y={y} width={1920} height={1080 - y} fill={ground} /></g>
);
// Chapter number card: solid colour, big "#n", title lines popping on word times.
export const NumberCard: React.FC<{t: number; bg: string; num: string; at: number; lines: [number, string][]; accent?: string}> = ({t, bg, num, at, lines, accent = C.paper}) => (
  <g><rect width={1920} height={1080} fill={bg} />
    <Pop t={t} at={at} x={960} y={360}><Txt x={0} y={0} size={280} color={C.mustard === bg ? C.paper : C.mustard} weight={700}>{num}</Txt></Pop>
    {lines.map(([a, s], i) => <Pop key={i} t={t} at={a} x={960} y={620 + i * 110}><Txt x={0} y={0} size={86} color={accent} weight={700}>{s}</Txt></Pop>)}</g>
);
// Takeaway card: mustard, bulb, up to 3 lines.
export const TakeawayCard: React.FC<{t: number; at: number; lines: [number, string, string?][]}> = ({t, at, lines}) => (
  <g><rect width={1920} height={1080} fill={C.mustard} />
    <Pop t={t} at={at - 0.3} x={960} y={190}><Bulb s={0.9} /></Pop>
    <Pop t={t} at={at} x={960} y={380}><Txt x={0} y={0} size={96} weight={700}>THE TAKEAWAY</Txt></Pop>
    {lines.map(([a, s, col], i) => <Pop key={i} t={t} at={a} x={960} y={560 + i * 130}><Txt x={0} y={0} size={72} color={col ?? C.ink} weight={600}>{s}</Txt></Pop>)}</g>
);

// ---------- props for "Stocks Explained" (2026-10-22) ----------
// Pizza cut into n slices; `taken` slices are pulled out / highlighted (0..n).
export const Pizza: React.FC<{n?: number; taken?: number; pull?: number; s?: number; hi?: string}> = ({n = 8, taken = 0, pull = 0, s = 1, hi = C.mustard}) => (
  <g transform={`scale(${s})`}>
    {Array.from({length: n}).map((_, i) => {
      const a0 = (i / n) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2, am = (a0 + a1) / 2;
      const off = i < taken ? pull : 0, dx = Math.cos(am) * off, dy = Math.sin(am) * off, R = 160;
      const p = `M${dx},${dy} L${dx + Math.cos(a0) * R},${dy + Math.sin(a0) * R} A${R},${R} 0 0 1 ${dx + Math.cos(a1) * R},${dy + Math.sin(a1) * R} Z`;
      return <g key={i}><path d={p} fill={i < taken ? hi : '#F2C46B'} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        {[0.45, 0.72].map((k, j) => <circle key={j} cx={dx + Math.cos(am + (j ? 0.12 : -0.1)) * R * k} cy={dy + Math.sin(am + (j ? 0.12 : -0.1)) * R * k} r={14} fill={C.red} stroke={C.ink} strokeWidth={3} />)}</g>;
    })}
    <circle r={160} fill="none" stroke="#C98E4A" strokeWidth={16} opacity={0.6} />
  </g>
);
export const Shop: React.FC<{sign: string; color?: string; s?: number; closed?: boolean}> = ({sign, color = C.sage, s = 1, closed}) => (
  <g transform={`scale(${s})`} stroke={C.ink} strokeWidth={6} strokeLinejoin="round">
    <rect x={-200} y={-300} width={400} height={300} fill="#E7C9A2" />
    <path d="M-220,-300 L220,-300 L220,-250 Q198,-220 176,-250 Q154,-220 132,-250 Q110,-220 88,-250 Q66,-220 44,-250 Q22,-220 0,-250 Q-22,-220 -44,-250 Q-66,-220 -88,-250 Q-110,-220 -132,-250 Q-154,-220 -176,-250 Q-198,-220 -220,-250 Z" fill={color} />
    <rect x={-160} y={-380} width={320} height={70} rx={10} fill={C.paper} /><Txt x={0} y={-344} size={40} weight={700}>{sign}</Txt>
    <rect x={-170} y={-200} width={170} height={120} fill={C.glass} /><rect x={40} y={-190} width={110} height={190} fill={C.terra} />
    {closed && <g><rect x={-160} y={-170} width={150} height={60} rx={8} fill={C.red} /><Txt x={-85} y={-138} size={30} color="#fff" weight={700}>CLOSED</Txt></g>}
  </g>
);
export const Bike: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx={-80} cy={0} r={55} /><circle cx={80} cy={0} r={55} />
    <path d="M-80,0 L-20,-70 L50,-70 L80,0 M-20,-70 L0,0 L50,-70 M0,0 L-80,0" stroke={C.terra} strokeWidth={9} />
    <path d="M-30,-90 L-5,-90 M50,-70 L45,-100 L70,-104" />
  </g>
);
export const Bank: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} stroke={C.ink} strokeWidth={6} strokeLinejoin="round">
    <path d="M-220,-200 L0,-310 L220,-200 Z" fill={C.paper2} /><rect x={-210} y={-200} width={420} height={30} fill={C.paper2} />
    {[-160, -80, 0, 80, 160].map((x) => <rect key={x} x={x - 18} y={-170} width={36} height={150} fill="#fff" />)}
    <rect x={-230} y={-20} width={460} height={30} fill={C.paper2} /><Txt x={0} y={-236} size={40} weight={700}>BANK</Txt>
  </g>
);
// Exchange board: plain name (no real logos), ticker rows with up/down arrows.
export const ExchangeBoard: React.FC<{t: number; name: string; s?: number}> = ({t, name, s = 1}) => (
  <g transform={`scale(${s})`}>
    <rect x={-330} y={-220} width={660} height={440} rx={20} fill={C.ink} stroke={C.ink} strokeWidth={6} />
    <rect x={-310} y={-200} width={620} height={80} rx={10} fill={C.navy} /><Txt x={0} y={-158} size={46} color={C.paper} weight={700}>{name}</Txt>
    {['PIZZ', 'BIKE', 'SNAK', 'GAME'].map((k, i) => {
      const up = Math.sin(t * 2 + i * 1.7) > 0;
      return <g key={k} transform={`translate(0,${-70 + i * 72})`}>
        <Txt x={-200} y={0} size={40} color={C.paper} weight={700}>{k}</Txt>
        <Txt x={40} y={0} size={40} color={up ? C.cash : C.red} weight={700}>{(20 + i * 7 + Math.sin(t * 2 + i) * 3).toFixed(2)}</Txt>
        <Txt x={220} y={0} size={44} color={up ? C.cash : C.red} weight={700}>{up ? '▲' : '▼'}</Txt>
      </g>;
    })}
  </g>
);
export const Ballot: React.FC<{s?: number; checks?: number}> = ({s = 1, checks = 2}) => (
  <g transform={`scale(${s}) rotate(-6)`} stroke={C.ink} strokeWidth={6}>
    <rect x={-110} y={-140} width={220} height={280} rx={10} fill="#fff" /><Txt x={0} y={-100} size={34} weight={700}>VOTE</Txt>
    {[0, 1, 2].map((i) => <g key={i}><rect x={-80} y={-60 + i * 60} width={36} height={36} fill="#fff" strokeWidth={5} />
      {i < checks && <path d={`M-74,${-42 + i * 60} l10,12 l20,-26`} fill="none" stroke={C.terra} strokeWidth={7} />}
      <line x1={-26} y1={-42 + i * 60} x2={80} y2={-42 + i * 60} strokeWidth={5} /></g>)}
  </g>
);
export const Jar: React.FC<{fill?: number; s?: number; label?: string}> = ({fill = 0.3, s = 1, label}) => (
  <g transform={`scale(${s})`} stroke={C.ink} strokeWidth={6}>
    <rect x={-70} y={-150} width={140} height={26} rx={8} fill={C.grey} />
    <path d="M-80,-124 L80,-124 L90,100 Q90,120 70,120 L-70,120 Q-90,120 -90,100 Z" fill={C.glass} opacity={0.9} />
    <rect x={-84} y={120 - 240 * fill} width={168} height={240 * fill} fill={C.mustard} strokeWidth={0} opacity={0.9} />
    {label && <Txt x={0} y={170} size={44} weight={700}>{label}</Txt>}
  </g>
);
export const Tree: React.FC<{g?: number; s?: number; coins?: boolean}> = ({g = 1, s = 1, coins}) => (
  <g transform={`scale(${s})`} stroke={C.ink} strokeWidth={6}>
    <path d={`M-20,0 L-14,${-200 * g} L14,${-200 * g} L20,0 Z`} fill={C.dirt} />
    <g transform={`translate(0,${-250 * g}) scale(${g})`}>
      {[[-80, 20, 90], [80, 20, 90], [0, -60, 110], [0, 40, 100]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={C.cash} />)}
      {coins && [[-90, 10], [60, -60], [90, 50], [-20, 60], [10, -110]].map(([x, y], i) => <g key={i} transform={`translate(${x},${y}) scale(0.8)`}><Coin /></g>)}
    </g>
  </g>
);
export const EggBasket: React.FC<{s?: number; eggs?: number}> = ({s = 1, eggs = 5}) => (
  <g transform={`scale(${s})`} stroke={C.ink} strokeWidth={6}>
    <path d="M-120,-40 Q0,-220 120,-40" fill="none" stroke={C.dirt} strokeWidth={14} />
    {Array.from({length: eggs}).map((_, i) => <ellipse key={i} cx={-80 + i * 40} cy={-50 - (i % 2) * 20} rx={26} ry={34} fill="#FFF8EC" />)}
    <path d="M-140,-40 L140,-40 L110,70 L-110,70 Z" fill="#C9A46A" strokeLinejoin="round" />
    {[-90, -30, 30, 90].map((x) => <line key={x} x1={x} y1={-40} x2={x * 0.8} y2={70} strokeWidth={4} />)}
  </g>
);
export const Factory: React.FC<{s?: number; t?: number}> = ({s = 1, t = 0}) => (
  <g transform={`scale(${s})`} stroke={C.ink} strokeWidth={6} strokeLinejoin="round">
    {[0, 1].map((i) => <circle key={i} cx={130} cy={-330 - ((t * 60 + i * 40) % 80)} r={26 + i * 6} fill="#fff" opacity={0.7} />)}
    <rect x={100} y={-320} width={60} height={200} fill={C.grey} />
    <path d="M-200,0 L-200,-160 L-110,-110 L-110,-160 L-20,-110 L-20,-160 L70,-110 L70,-120 L200,-120 L200,0 Z" fill={C.terra} />
    {[-160, -70, 20, 120].map((x) => <rect key={x} x={x} y={-70} width={44} height={40} fill={C.glass} />)}
  </g>
);
export const Queue: React.FC<{t: number; labels: string[]; hi?: number; s?: number}> = ({t, labels, hi = -1, s = 1}) => (
  <g transform={`scale(${s})`}>
    {labels.map((l, i) => <g key={i} transform={`translate(${i * 230},0)`}>
      <Person t={t + i} x={0} y={0} s={0.55} kind="adult" shirt={[C.navy, C.grey, C.sage, C.terra][i % 4]} hair={C.ink} mood={i === labels.length - 1 ? 'o' : 'flat'} />
      <rect x={-95} y={20} width={190} height={56} rx={12} fill={i === hi ? C.mustard : C.paper} stroke={C.ink} strokeWidth={5} />
      <Txt x={0} y={50} size={30} weight={700}>{l}</Txt></g>)}
  </g>
);

// ---------- shared scene helpers (2026-10-22, from BasicEconomics) ----------
export const Fly: React.FC<{t: number; at: number; x0: number; y0: number; x1: number; y1: number; dur?: number; arc?: number; children: React.ReactNode}> = ({t, at, x0, y0, x1, y1, dur = 0.6, arc = 200, children}) => {
  const p = ramp(t, at, at + dur);
  if (p <= 0) return null;
  return <g transform={`translate(${x0 + (x1 - x0) * p},${y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * arc})`}>{children}</g>;
};
export const Label: React.FC<{t: number; at: number; x: number; y: number; text: string; color?: string; size?: number; r?: number}> = ({t, at, x, y, text, color = C.ink, size = 64, r = 0}) => (
  <Pop t={t} at={at} x={x} y={y} r={r}><Txt x={0} y={0} size={size} color={color} weight={700}>{text}</Txt></Pop>
);
export const Stamp: React.FC<{t: number; at: number; x: number; y: number; text: string; color?: string; size?: number}> = ({t, at, x, y, text, color = C.red, size = 90}) => (
  <Pop t={t} at={at} x={x} y={y} r={-6}>
    <rect x={-text.length * size * 0.36 - 30} y={-size * 0.7} width={text.length * size * 0.72 + 60} height={size * 1.4} rx={16} fill="none" stroke={color} strokeWidth={10} />
    <Txt x={0} y={4} size={size} color={color} weight={700}>{text}</Txt>
  </Pop>
);
// White card with a number/value, e.g. "$40,000".
export const ValueCard: React.FC<{t: number; at: number; x: number; y: number; title?: string; value: string; color?: string; w?: number}> = ({t, at, x, y, title, value, color = C.ink, w = 420}) => (
  <Pop t={t} at={at} x={x} y={y}>
    <rect x={-w / 2} y={title ? -90 : -60} width={w} height={title ? 180 : 120} rx={18} fill="#fff" stroke={C.ink} strokeWidth={7} />
    {title && <Txt x={0} y={-42} size={40} weight={600}>{title}</Txt>}
    <Txt x={0} y={title ? 32 : 4} size={74} color={color} weight={700}>{value}</Txt>
  </Pop>
);
// Line chart drawn left→right between t0..t1 from normalized points (0..1).
export const LineChart: React.FC<{t: number; t0: number; t1: number; pts: number[]; x: number; y: number; w: number; h: number; color?: string; fillArea?: boolean}> = ({t, t0, t1, pts, x, y, w, h, color = C.cashD, fillArea}) => {
  const p = ramp(t, t0, t1);
  const n = Math.max(2, Math.ceil(pts.length * p));
  const xy = pts.slice(0, n).map((v, i) => [x + (i / (pts.length - 1)) * w, y + h - v * h]);
  const d = 'M' + xy.map((q) => q.join(',')).join(' L');
  return (
    <g>
      <line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke={C.ink} strokeWidth={6} /><line x1={x} y1={y} x2={x} y2={y + h} stroke={C.ink} strokeWidth={6} />
      {fillArea && <path d={`${d} L${xy[xy.length - 1][0]},${y + h} L${x},${y + h} Z`} fill={color} opacity={0.15} />}
      <path d={d} fill="none" stroke={color} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
};

// ---------- props for "Zombie Economy" (2026-10-23, first 9:16 paper short) ----------
export const Truck: React.FC<{s?: number; label?: string}> = ({s = 1, label = ''}) => (
  <g transform={`scale(${s})`} {...st}>
    <rect x={-260} y={-230} width={340} height={190} rx={10} fill="#fff" /><Txt x={-90} y={-136} size={44} weight={700}>{label}</Txt>
    <path d="M80,-170 L190,-170 L250,-100 L250,-40 L80,-40 Z" fill={C.terra} /><path d="M100,-155 L180,-155 L222,-105 L100,-105 Z" fill={C.glass} />
    {[-180, 0, 170].map((x) => <g key={x}><circle cx={x} cy={-30} r={40} fill={C.ink} /><circle cx={x} cy={-30} r={16} fill={C.grey} /></g>)}
  </g>
);
export const BeanCan: React.FC<{s?: number}> = ({s = 1}) => (<>
  <g transform={`scale(${s})`} {...st}>
    <rect x={-80} y={-110} width={160} height={220} rx={14} fill={C.grey} /><rect x={-80} y={-60} width={160} height={120} fill={C.terra} />
    <ellipse cx={0} cy={-110} rx={80} ry={18} fill="#C9C3B8" />
    {[[-30, 0], [0, -14], [28, 4], [-10, 22], [22, 30]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={14} ry={9} fill="#E8B07A" strokeWidth={3} />)}
  </g>
  <g transform={`scale(${s})`}><Txt x={0} y={44} size={30} color={C.paper} weight={700}>BEANS</Txt></g>
</>);
export const PillBottle: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...st}>
    <rect x={-70} y={-130} width={140} height={44} rx={8} fill="#fff" /><rect x={-60} y={-86} width={120} height={190} rx={14} fill={C.mustard} />
    <rect x={-60} y={-40} width={120} height={80} fill="#fff" /><path d="M-14,0 h28 M0,-14 v28" stroke={C.red} strokeWidth={10} />
  </g>
);
export const Bat: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...st}><path d="M-14,140 L-10,0 Q-30,-120 -24,-170 Q0,-190 24,-170 Q30,-120 10,0 L14,140 Z" fill="#D9A866" />
    <rect x={-20} y={140} width={40} height={16} rx={6} fill={C.ink} /><path d="M-12,90 L12,80 M-12,110 L12,100" stroke={C.terra} strokeWidth={5} /></g>
);
// Wallet: `empty` 0..1 empties the cash; at 1 a moth flutters out.
export const Wallet: React.FC<{s?: number; empty?: number; t?: number}> = ({s = 1, empty = 0, t = 0}) => (
  <g transform={`scale(${s})`} {...st}>
    {empty < 1 && <g transform={`translate(0,${-40 - (1 - empty) * 30})`} opacity={1 - empty}><rect x={-90} y={-40} width={180} height={80} rx={10} fill={C.cash} /><Txt x={0} y={2} size={44} color={C.cashD} weight={700}>$</Txt></g>}
    <rect x={-140} y={-70} width={280} height={160} rx={22} fill={C.dirt} /><rect x={40} y={-10} width={110} height={60} rx={18} fill="#8E6B46" /><circle cx={110} cy={20} r={10} fill={C.mustard} />
    {empty >= 1 && <g transform={`translate(${-20 + Math.sin(t * 5) * 30},${-120 - (t * 40) % 60})`}><ellipse cx={-16} cy={0} rx={18} ry={12} fill="#fff" transform={`rotate(${Math.sin(t * 30) * 30})`} /><ellipse cx={16} cy={0} rx={18} ry={12} fill="#fff" transform={`rotate(${-Math.sin(t * 30) * 30})`} /></g>}
  </g>
);
// Money printer that spits a bill every 0.35 s after `at`.
export const Printer: React.FC<{t: number; at: number; s?: number}> = ({t, at, s = 1}) => (
  <g transform={`scale(${s})`}>
    {t > at && [0, 1, 2, 3].map((i) => { const p = ((t - at) / 0.35 + i / 4 * 4) % 4 / 4; return <g key={i} transform={`translate(${-60 + p * 120},${-30 - p * 260}) rotate(${-20 + p * 50})`} opacity={1 - p}><Bill label="$" w={170} /></g>; })}
    <g {...st}><rect x={-200} y={-60} width={400} height={200} rx={20} fill={C.grey} /><rect x={-150} y={-80} width={300} height={30} rx={8} fill={C.ink} />
      <rect x={-160} y={-10} width={160} height={70} rx={8} fill={C.cashD} /><Txt x={-80} y={26} size={34} color="#fff" weight={700}>$$$</Txt>
      <circle cx={100} cy={20} r={22} fill={t > at && Math.sin(t * 12) > 0 ? C.red : '#7A2A20'} /></g>
  </g>
);
export const Virus: React.FC<{s?: number; t?: number}> = ({s = 1, t = 0}) => (
  <g transform={`scale(${s}) rotate(${t * 25})`} {...st}>
    {Array.from({length: 10}).map((_, i) => <g key={i} transform={`rotate(${i * 36})`}><line x1={0} y1={-90} x2={0} y2={-130} /><circle cx={0} cy={-138} r={16} fill={C.red} /></g>)}
    <circle r={95} fill="#8DBE6A" /><circle cx={-30} cy={-20} r={16} fill="#6E9A50" /><circle cx={28} cy={24} r={22} fill="#6E9A50" />
  </g>
);
// Domino tile that tips over (fall 0..1) around its bottom-right corner.
export const Domino: React.FC<{fall: number; label: string; color?: string; s?: number}> = ({fall, label, color = '#fff', s = 1}) => (
  <g transform={`scale(${s}) rotate(${fall * 64},60,0)`} {...st}><rect x={-60} y={-280} width={120} height={280} rx={14} fill={color} />
    <g transform="translate(0,-140) rotate(-90)"><Txt x={0} y={4} size={46} weight={700}>{label}</Txt></g></g>
);
// 9:16 chapter card and takeaway card (1080x1920).
export const NumberCardV: React.FC<{t: number; bg: string; num: string; at: number; lines: [number, string][]; accent?: string}> = ({t, bg, num, at, lines, accent = C.paper}) => (
  <g><rect width={1080} height={1920} fill={bg} />
    <Pop t={t} at={at} x={540} y={640}><Txt x={0} y={0} size={340} color={C.mustard === bg ? C.paper : C.mustard} weight={700}>{num}</Txt></Pop>
    {lines.map(([a, s], i) => <Pop key={i} t={t} at={a} x={540} y={960 + i * 130}><Txt x={0} y={0} size={110} color={accent} weight={700}>{s}</Txt></Pop>)}</g>
);
export const TakeawayCardV: React.FC<{t: number; at: number; lines: [number, string, string?][]}> = ({t, at, lines}) => (
  <g><rect width={1080} height={1920} fill={C.mustard} />
    <Pop t={t} at={at - 0.3} x={540} y={330}><Bulb s={1.1} /></Pop>
    <Pop t={t} at={at} x={540} y={560}><Txt x={0} y={0} size={110} weight={700}>THE LESSON</Txt></Pop>
    {lines.map(([a, s, col], i) => <Pop key={i} t={t} at={a} x={540} y={740 + i * 120}><Txt x={0} y={0} size={84} color={col ?? C.ink} weight={600}>{s}</Txt></Pop>)}</g>
);
export const CreditCard: React.FC<{s?: number; color?: string}> = ({s = 1, color = C.navy}) => (
  <g transform={`scale(${s})`} stroke={C.ink} strokeWidth={6}><rect x={-140} y={-88} width={280} height={176} rx={18} fill={color} />
    <rect x={-140} y={-50} width={280} height={34} fill={C.ink} strokeWidth={0} /><rect x={-110} y={4} width={54} height={40} rx={6} fill={C.mustard} strokeWidth={4} />
    <line x1={-110} y1={64} x2={60} y2={64} stroke={C.paper} strokeWidth={8} strokeDasharray="22 12" /></g>
);

// ---------- 2.5D stage (2026-10-24, "30 Money Truths"): each scene is its own paper plane in CSS 3D space ----------
// Scenes swing in on rotateY with a slow camera drift (rotateX/Y sway + dolly), props get clay lighting via DepthCtx.
const DepthStage: React.FC<{job: string; sec: number; scenes: Scene[]; sfx: Sfx[]; musicVol: number; captions: boolean; captionChars: number}> = ({job, sec, scenes, sfx, musicVol, captions, captionChars}) => {
  const frame = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const t = frame / fps;
  const k = Math.floor(frame / 4);
  const jx = Math.sin(k * 12.9898) * 1.2, jy = Math.cos(k * 78.233) * 1.2;
  const fadeOut = ramp(t, sec - 0.6, sec);
  return (
    <AbsoluteFill style={{backgroundColor: '#2A211D', perspective: 1800, perspectiveOrigin: '50% 45%'}}>
      {scenes.map(({from, to, C: Scene}, i) => {
        if (t < from || t > to + 0.45) return null;
        const fin = i === 0 ? 1 : interpolate(t, [from, from + 0.55], [0, 1], {...CL, easing: Easing.out(Easing.cubic)});
        const dir = i % 2 ? 1 : -1;
        const lt = t - from, push = ramp(t, from, to, 1.06, 1.12);
        const ry = (1 - fin) * 38 * dir + Math.sin(lt * 0.5 + i) * 2.2, rx = 3 + Math.cos(lt * 0.4 + i) * 1.6;
        const tz = (1 - fin) * -500;
        return (
          <AbsoluteFill key={i} style={{transform: `translateZ(${tz}px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${push})`, opacity: Math.min(1, fin * 1.6), transformStyle: 'preserve-3d'}}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
              <DepthDefs />
              <g transform={`translate(${jx},${jy})`}><DepthCtx.Provider value={true}><Scene t={t} /></DepthCtx.Provider></g>
            </svg>
          </AbsoluteFill>
        );
      })}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="paperD"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={4} /><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.18  0 0 0 0.22 0" /></filter>
          <radialGradient id="vigD" cx="50%" cy="45%" r="75%"><stop offset="55%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#2A1F1A" stopOpacity={0.4} /></radialGradient>
          <linearGradient id="keyD" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF4D8" stopOpacity={0.16} /><stop offset="0.6" stopColor="#FFF4D8" stopOpacity={0} /></linearGradient>
        </defs>
        <rect width={W} height={H} filter="url(#paperD)" style={{mixBlendMode: 'multiply'}} />
        <rect width={W} height={H} fill="url(#keyD)" />
        <rect width={W} height={H} fill="url(#vigD)" />
        <rect width={W} height={H} fill={C.paper} opacity={fadeOut} />
      </svg>
      {captions && <PaperCaptions job={job} maxChars={captionChars} />}
      <Audio src={staticFile(`${job}/voice.mp3`)} />
      <Audio src={staticFile(`${job}/music.wav`)} volume={(f) => interpolate(f / fps, [0, 1, sec - 1.5, sec], [0, musicVol, musicVol, 0], CL)} />
      {sfx.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.round(at * fps)} durationInFrames={Math.round(2.5 * fps)}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ---------- props for "30 Money Truths" (2026-10-24) ----------
const st6 = {stroke: C.ink, strokeWidth: 6, strokeLinejoin: 'round' as const};
export const Dice: React.FC<{s?: number; n?: number; r?: number}> = ({s = 1, n = 5, r = 0}) => {
  const P: Record<number, number[][]> = {1: [[0, 0]], 2: [[-30, -30], [30, 30]], 3: [[-30, -30], [0, 0], [30, 30]], 4: [[-30, -30], [30, -30], [-30, 30], [30, 30]], 5: [[-30, -30], [30, -30], [0, 0], [-30, 30], [30, 30]], 6: [[-30, -32], [30, -32], [-30, 0], [30, 0], [-30, 32], [30, 32]]};
  return <g transform={`scale(${s}) rotate(${r})`}><rect x={-70} y={-70} width={140} height={140} rx={26} fill="#fff" {...st6} />{P[n].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={12} fill={C.red} />)}</g>;
};
export const SlotMachine: React.FC<{t: number; s?: number; spin?: boolean}> = ({t, s = 1, spin = true}) => {
  const sym = ['$', '7', '★'];
  return <g transform={`scale(${s})`} {...st6}>
    <rect x={-170} y={-200} width={340} height={380} rx={30} fill={C.red} /><rect x={-140} y={-120} width={280} height={130} rx={14} fill="#fff" />
    {[0, 1, 2].map((i) => <Txt key={i} x={-90 + i * 90} y={-52} size={72} weight={700} color={C.ink}>{sym[spin ? Math.floor(t * 12 + i * 2) % 3 : 0]}</Txt>)}
    <rect x={-120} y={60} width={240} height={50} rx={10} fill={C.mustard} /><line x1={170} y1={-60} x2={230} y2={-160} strokeWidth={10} /><circle cx={230} cy={-170} r={24} fill={C.red} />
  </g>;
};
export const Wave: React.FC<{t: number; w?: number; h?: number; rising?: boolean; color?: string}> = ({t, w = 900, h = 260, rising = true, color = '#5FA8C9'}) => {
  const pts = Array.from({length: 31}).map((_, i) => { const x = (i / 30) * w; const base = rising ? h * (1 - i / 30) * 0.8 : h * (i / 30) * 0.8; return `${x},${base + Math.sin(i * 0.7 + t * 3) * 18}`; });
  return <g><path d={`M0,${h + 40} L${pts.join(' L')} L${w},${h + 40} Z`} fill={color} {...st6} /></g>;
};
export const Hourglass: React.FC<{s?: number; sand?: number}> = ({s = 1, sand = 0.5}) => (
  <g transform={`scale(${s})`} {...st6}><rect x={-90} y={-150} width={180} height={24} rx={8} fill={C.dirt} /><rect x={-90} y={126} width={180} height={24} rx={8} fill={C.dirt} />
    <path d="M-70,-126 L70,-126 L10,0 L70,126 L-70,126 L-10,0 Z" fill={C.glass} />
    <path d={`M${-60 * (1 - sand) - 8},${-110 + 100 * sand} L${60 * (1 - sand) + 8},${-110 + 100 * sand} L4,-4 L-4,-4 Z`} fill={C.mustard} strokeWidth={0} />
    <path d={`M-60,120 L60,120 L${30 * (1 - sand)},${120 - 90 * sand} L${-30 * (1 - sand)},${120 - 90 * sand} Z`} fill={C.mustard} strokeWidth={0} /></g>
);
export const Sandwich: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...st6}><path d="M-120,10 Q0,-10 120,10 L110,40 L-110,40 Z" fill="#E7B66A" /><path d="M-125,0 Q-60,-25 0,0 T125,0 L125,12 L-125,12 Z" fill={C.cash} />
    <rect x={-118} y={-16} width={236} height={18} fill={C.red} /><path d="M-120,-16 Q-120,-80 0,-84 Q120,-80 120,-16 Z" fill="#E7B66A" /></g>
);
export const Moon: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`}><path d="M30,-80 A85,85 0 1,0 30,80 A65,65 0 1,1 30,-80 Z" fill="#F6E3B4" {...st6} />
    {[[90, -60], [120, 20], [70, 70]].map(([x, y], i) => <path key={i} d={`M${x},${y - 12} L${x + 4},${y - 4} L${x + 12},${y} L${x + 4},${y + 4} L${x},${y + 12} L${x - 4},${y + 4} L${x - 12},${y} L${x - 4},${y - 4} Z`} fill={C.mustard} />)}</g>
);
export const Rocket: React.FC<{t: number; s?: number}> = ({t, s = 1}) => (
  <g transform={`scale(${s})`} {...st6}><path d={`M-26,90 L0,${150 + Math.sin(t * 30) * 20} L26,90 Z`} fill={C.mustard} />
    <path d="M0,-150 Q60,-80 50,90 L-50,90 Q-60,-80 0,-150 Z" fill="#fff" /><circle cx={0} cy={-40} r={26} fill={C.glass} />
    <path d="M-50,30 L-90,100 L-48,90 Z" fill={C.red} /><path d="M50,30 L90,100 L48,90 Z" fill={C.red} /></g>
);
// balance beam / seesaw: tilt -1..1 (positive = right side down)
export const Seesaw: React.FC<{tilt?: number; w?: number; left?: React.ReactNode; right?: React.ReactNode}> = ({tilt = 0, w = 700, left, right}) => (
  <g><path d="M-70,0 L0,-120 L70,0 Z" fill={C.dirt} {...st6} />
    <g transform={`translate(0,-120) rotate(${tilt * 14})`}><rect x={-w / 2} y={-14} width={w} height={28} rx={10} fill={C.mustard} {...st6} />
      <g transform={`translate(${-w / 2 + 90},-14) rotate(${-tilt * 14})`}>{left}</g><g transform={`translate(${w / 2 - 90},-14) rotate(${-tilt * 14})`}>{right}</g></g></g>
);
export const Magnifier: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...st6}><line x1={50} y1={50} x2={130} y2={130} strokeWidth={22} strokeLinecap="round" /><circle r={80} fill={C.glass} fillOpacity={0.7} /></g>
);
