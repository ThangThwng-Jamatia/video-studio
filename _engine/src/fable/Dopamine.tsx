// "DOPAMINE" — pilot for the 2D no-voice cinematic fable longs (inspo: DISCIPLINE / LUST VS LOVE).
// 16:9, music + SFX only, story told by an everyman, a glowing inner-voice demon, a counter HUD and short text cards.
// Everything is a pure function of the absolute second t.
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadNunito} from '@remotion/google-fonts/Nunito';
import {loadFont as loadHand} from '@remotion/google-fonts/PatrickHand';

const {fontFamily: SANS} = loadNunito('normal', {weights: ['400', '700', '900'], subsets: ['latin']});
const {fontFamily: HAND} = loadHand('normal', {weights: ['400'], subsets: ['latin']});

export const DOPAMINE_SEC = 86;
const JOB = 'jobs/dopamine';
const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = (t: number, a: number, b: number, e = Easing.inOut(Easing.cubic)) => interpolate(t, [a, b], [0, 1], {...CL, easing: e});
const win = (t: number, a: number, b: number, f = 0.4) => ease(t, a, a + f) * (1 - ease(t, b - f, b));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const SKIN = '#ECE6D8', INK = '#16161a', PINK = '#ff2d78', RED = '#ff3344', WARM = '#ffcf8a', BLUE = '#8fc4ff';
const FLOOR = 840;

// ---------- characters ----------
type Mood = 'flat' | 'tired' | 'sad' | 'smile' | 'wide' | 'closed';
const Face: React.FC<{mood: Mood; look?: number}> = ({mood, look = 0}) => {
  const er = mood === 'wide' ? 7.5 : 5.5;
  const eyes = mood === 'closed'
    ? [-18, 18].map((x) => <path key={x} d={`M${x - 9} -2 q9 7 18 0`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />)
    : [-18, 18].map((x) => <g key={x}>
      {mood === 'wide' && <circle cx={x} cy={-4} r={13} fill="white" stroke={INK} strokeWidth={2.5} />}
      <circle cx={x + look * 4} cy={-4} r={er} fill={INK} />
      {(mood === 'tired' || mood === 'sad') && <path d={`M${x - 11} -6 L${x + 11} -6 L${x + 11} -14 L${x - 11} -14 Z`} fill={SKIN} />}
      {(mood === 'tired' || mood === 'sad') && <line x1={x - 10} y1={-6} x2={x + 10} y2={-6} stroke={INK} strokeWidth={3} strokeLinecap="round" />}
    </g>);
  const brows = mood === 'sad' && [-1, 1].map((s) => <line key={s} x1={s * 10} y1={-22} x2={s * 28} y2={-17} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />);
  const mouth = mood === 'smile' ? 'M-12 18 q12 10 24 0' : mood === 'sad' ? 'M-11 24 q11 -8 22 0' : mood === 'wide' ? 'M-6 22 q6 4 12 0' : 'M-10 21 L10 21';
  return <g>{eyes}{brows}<path d={mouth} stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" /></g>;
};

type Pose = 'stand' | 'sit' | 'hug';
type GuyP = {x: number; y?: number; s?: number; pose?: Pose; mood?: Mood; phone?: number; reach?: number; tilt?: number; look?: number; demon?: boolean; o?: number; guitar?: number; strum?: number; flip?: boolean};
const Guy: React.FC<GuyP> = ({x, y = FLOOR, s = 1, pose = 'stand', mood = 'flat', phone = 0, reach = 0, tilt = 0, look = 0, demon, o = 1, guitar = 0, strum = 0, flip}) => {
  const fill = demon ? '#08040a' : SKIN;
  const st = demon ? {stroke: PINK, strokeWidth: 3, filter: 'url(#glow)'} : {};
  const limb = {stroke: fill, strokeWidth: 24, strokeLinecap: 'round' as const, fill: 'none'};
  const limbEdge = demon ? <></> : null;
  const sit = pose === 'sit', hug = pose === 'hug';
  const headY = hug ? -170 : sit ? -320 : -300;
  const sh = sit ? -255 : -215;
  const hand: [number, number] = phone ? [14, headY + 50] : reach ? [mix(46, 150, reach), mix(sh + 90, sh + 10, reach)] : [48, sh + 95];
  const face = demon
    ? <g><path d="M-26 -8 l16 5 M26 -8 l-16 5" stroke={PINK} strokeWidth={5} strokeLinecap="round" /><path d="M-22 16 q22 16 44 0" stroke={PINK} strokeWidth={4.5} fill="none" strokeLinecap="round" /></g>
    : <Face mood={mood} look={look} />;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={o}>
      {demon && <ellipse cx={0} cy={headY + 120} rx={150} ry={260} fill="url(#demonGlow)" />}
      {hug ? <>
        <ellipse cx={-6} cy={-80} rx={52} ry={78} fill={fill} {...st} />
        <circle cx={34} cy={-90} r={42} fill={fill} {...st} />
        <path d="M-30 -120 Q40 -150 60 -70" {...limb} />
      </> : sit ? <>
        {[-14, 14].map((d) => <path key={d} d={`M${d} -140 L${80 + d / 2} -140 L${84 + d / 2} -6`} {...limb} />)}
        <rect x={-42} y={-290} width={84} height={165} rx={40} fill={fill} {...st} />
      </> : <>
        {[-17, 17].map((d) => <line key={d} x1={d} y1={-110} x2={d * 1.1} y2={-6} {...limb} />)}
        <rect x={-42} y={-250} width={84} height={150} rx={40} fill={fill} {...st} />
      </>}
      {!hug && <>
        <path d={`M-36 ${sh + 8} L-50 ${sh + 98}`} {...limb} />
        <path d={`M36 ${sh + 8} L${phone ? 54 : (hand[0] + 36) / 2 + 8} ${phone ? sh + 70 : (sh + 8 + hand[1]) / 2 + 6} L${hand[0]} ${hand[1]}`} {...limb} />
      </>}
      {limbEdge}
      {guitar > 0 && <g transform={`translate(30 ${sh + 110}) rotate(-28)`} opacity={guitar}>
        <rect x={-6} y={-150} width={12} height={150} fill="#3b2a1e" />
        <ellipse cx={0} cy={20} rx={46} ry={40} fill="#9a6338" /><ellipse cx={0} cy={-18} rx={34} ry={30} fill="#9a6338" />
        <circle cx={0} cy={4} r={11} fill="#2a1a10" />
        <line x1={-24 + strum * 6} y1={-30} x2={-24 + strum * 6} y2={40} stroke={SKIN} strokeWidth={20} strokeLinecap="round" />
      </g>}
      <g transform={`rotate(${tilt} 0 ${headY + 60})`}>
        <circle cx={0} cy={headY} r={58} fill={fill} {...st} />
        <g transform={`translate(0 ${headY})`}>{face}</g>
      </g>
      {phone > 0 && <g>
        <rect x={hand[0] - 13} y={hand[1] - 46} width={28} height={48} rx={6} fill="#0b0b10" stroke="#333" strokeWidth={2} />
        <rect x={hand[0] - 10} y={hand[1] - 43} width={22} height={40} rx={3} fill={BLUE} opacity={0.6 + 0.4 * phone} />
      </g>}
    </g>
  );
};

// ---------- set pieces ----------
const Floor: React.FC<{c?: string}> = ({c = '#2a2a30'}) => <line x1={-400} y1={FLOOR} x2={2400} y2={FLOOR} stroke={c} strokeWidth={3} />;
const Window: React.FC<{x: number; y: number; day?: number}> = ({x, y, day = 0}) => (
  <g>
    <polygon points={`${x - 70},${y + 70} ${x + 70},${y + 70} ${x + 260},${FLOOR} ${x - 160},${FLOOR}`} fill={day > 0.5 ? WARM : '#c8d8ff'} opacity={day > 0.5 ? 0.09 : 0.045} />
    <rect x={x - 70} y={y - 70} width={140} height={140} fill={day > 0.5 ? '#ffb46b' : '#0a0c14'} stroke="#9a9aa8" strokeWidth={5} />
    {day < 0.5 ? <circle cx={x + 24} cy={y - 24} r={13} fill="#f4f1e6" /> : <circle cx={x} cy={y + 46} r={34} fill="#fff1c9" />}
    <line x1={x} y1={y - 70} x2={x} y2={y + 70} stroke="#9a9aa8" strokeWidth={5} /><line x1={x - 70} y1={y} x2={x + 70} y2={y} stroke="#9a9aa8" strokeWidth={5} />
  </g>
);
const Clock: React.FC<{x: number; y: number; text: string; s?: number}> = ({x, y, text, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-56} y={-34} width={112} height={68} rx={10} fill="#141418" stroke="#3a3a42" strokeWidth={3} />
    <text x={0} y={14} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={40} fill={RED} filter="url(#glowSoft)">{text}</text>
  </g>
);
const Nightstand: React.FC<{x: number; drawer?: number; clock: string}> = ({x, drawer = 0, clock}) => (
  <g>
    <rect x={x - 80} y={FLOOR - 140} width={160} height={140} rx={6} fill="#1d1d22" stroke="#34343c" strokeWidth={3} />
    <rect x={x - 66 + drawer * 70} y={FLOOR - 120} width={132} height={50} rx={4} fill="#25252b" stroke="#3c3c44" strokeWidth={3} />
    <circle cx={x + drawer * 70} cy={FLOOR - 95} r={5} fill="#666" />
    <Clock x={x} y={FLOOR - 176} text={clock} />
  </g>
);
const Bed: React.FC<{x: number; lying?: boolean; mood?: Mood; glow?: number}> = ({x, lying, mood = 'tired', glow = 0}) => (
  <g>
    <rect x={x} y={FLOOR - 120} width={560} height={90} rx={10} fill="#1c1c24" />
    <rect x={x - 10} y={FLOOR - 230} width={22} height={230} rx={8} fill="#22222a" />
    <rect x={x + 24} y={FLOOR - 170} width={120} height={50} rx={22} fill="#d8d2c4" />
    {lying && <>
      <circle cx={x + 110} cy={FLOOR - 190} r={52} fill={SKIN} />
      <g transform={`translate(${x + 110} ${FLOOR - 190}) scale(0.9)`}><Face mood={mood} /></g>
      {glow > 0 && <ellipse cx={x + 110} cy={FLOOR - 190} rx={110} ry={90} fill={BLUE} opacity={0.12 * glow} />}
      {glow > 0 && <g transform={`translate(${x + 180} ${FLOOR - 250}) rotate(-20)`}>
        <path d="M0 80 L-30 140" stroke={SKIN} strokeWidth={22} strokeLinecap="round" />
        <rect x={-14} y={-24} width={30} height={50} rx={6} fill="#0b0b10" /><rect x={-11} y={-21} width={24} height={42} rx={3} fill={BLUE} opacity={0.7 + 0.3 * glow} />
      </g>}
    </>}
    <path d={`M${x + 120} ${FLOOR - 150} Q${x + 140} ${FLOOR - 200} ${x + 300} ${FLOOR - 190} L${x + 560} ${FLOOR - 170} L${x + 560} ${FLOOR - 100} L${x + 110} ${FLOOR - 100} Z`} fill="#2d3a5c" />
  </g>
);
const Desk: React.FC<{x: number; lamp?: number}> = ({x, lamp = 1}) => (
  <g>
    <polygon points={`${x + 300},${FLOOR - 300} ${x + 200},${FLOOR - 196} ${x + 470},${FLOOR - 196}`} fill={WARM} opacity={0.14 * lamp} />
    <ellipse cx={x + 300} cy={FLOOR - 196} rx={190} ry={18} fill={WARM} opacity={0.16 * lamp} />
    <rect x={x} y={FLOOR - 200} width={480} height={18} rx={4} fill="#3a2c22" />
    <rect x={x + 20} y={FLOOR - 182} width={14} height={182} fill="#2c2119" /><rect x={x + 446} y={FLOOR - 182} width={14} height={182} fill="#2c2119" />
    <path d={`M${x + 290} ${FLOOR - 200} L${x + 270} ${FLOOR - 270} L${x + 300} ${FLOOR - 310}`} stroke="#555" strokeWidth={6} fill="none" />
    <path d={`M${x + 280} ${FLOOR - 320} L${x + 330} ${FLOOR - 296} L${x + 300} ${FLOOR - 286} Z`} fill="#666" />
    {[0, 1, 2].map((i) => <rect key={i} x={x + 360} y={FLOOR - 222 - i * 18} width={90 - i * 8} height={16} rx={2} fill={['#7a4a4a', '#4a6a7a', '#6a7a4a'][i]} />)}
  </g>
);
const LeanGuitar: React.FC<{x: number; dim?: number}> = ({x, dim = 0}) => (
  <g transform={`translate(${x} ${FLOOR}) rotate(-12)`} opacity={1 - dim * 0.6}>
    <rect x={-6} y={-330} width={12} height={200} fill="#3b2a1e" />
    <ellipse cx={0} cy={-60} rx={62} ry={56} fill="#9a6338" /><ellipse cx={0} cy={-130} rx={46} ry={42} fill="#9a6338" />
    <circle cx={0} cy={-95} r={14} fill="#2a1a10" /><rect x={-10} y={-350} width={20} height={30} rx={4} fill="#2a1a10" />
  </g>
);
const Mirror: React.FC<{x: number; crack: number; t: number}> = ({x, crack, t}) => (
  <g>
    <defs><clipPath id="mclip"><ellipse cx={x} cy={FLOOR - 270} rx={120} ry={180} /></clipPath></defs>
    <ellipse cx={x} cy={FLOOR - 270} rx={128} ry={188} fill="#0c0c10" stroke="#8a8a96" strokeWidth={8} />
    <g clipPath="url(#mclip)"><Guy x={x} y={FLOOR - 60} s={0.82} demon /></g>
    {crack > 0 && <g stroke="#e8e8f0" strokeWidth={3} fill="none" opacity={crack}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${x + 10} ${FLOOR - 300} l${Math.cos(i * 0.9 + 0.3) * 60} ${Math.sin(i * 0.9 + 0.3) * 60} l${Math.cos(i * 0.9 + 0.6) * 70 * crack} ${Math.sin(i * 0.9 + 0.6) * 90 * crack}`} />)}
    </g>}
    <rect x={x - 60} y={FLOOR - 70} width={120} height={70} rx={6} fill="#24242a" />
    {t < 0 && null}
  </g>
);
const Notes: React.FC<{t: number; x: number; y: number; n?: number}> = ({t, x, y, n = 4}) => (
  <g>{Array.from({length: n}, (_, i) => {
    const k = ((t * 0.5 + i / n) % 1);
    return <text key={i} x={x + Math.sin(k * 6 + i) * 30 + i * 18} y={y - k * 220} fontSize={46} fill={WARM} opacity={Math.sin(k * Math.PI)} filter="url(#glowSoft)">{i % 2 ? '♪' : '♫'}</text>;
  })}</g>
);

// ---------- scenes ----------
type Cam = {x: number; y: number; s: number};
type Scene = {from: number; to: number; a: Cam; b: Cam; draw: (t: number) => React.ReactNode; bg?: string};
const clockText = (t: number, a: number, b: number, m0: number, m1: number) => {
  const m = Math.round(mix(m0, m1, ease(t, a, b, Easing.linear))); const h = Math.floor(m / 60) % 12 || 12; return `${h}:${String(m % 60).padStart(2, '0')}`;
};
const C = (x: number, y: number, s: number): Cam => ({x, y, s});

const SCENES: Scene[] = [
  {from: 0, to: 5, a: C(960, 540, 1), b: C(960, 540, 1), draw: () => null},
  // night: scrolling in bed
  {from: 5, to: 16, a: C(860, 640, 1.05), b: C(760, 650, 1.35), draw: (t) => <>
    <Floor /><Window x={1180} y={360} />
    <Nightstand x={420} clock={clockText(t, 5, 16, 72, 227)} />
    <Bed x={560} lying mood={t > 12 ? 'tired' : 'flat'} glow={0.7 + 0.3 * Math.sin(t * 9)} />
    <Guy x={1060} s={0.9} demon o={win(t, 8, 16, 0.6) * 0.95} />
  </>},
  // DAY 12: desk, guitar, demon says boring
  {from: 16, to: 27, a: C(1000, 580, 1.0), b: C(1080, 580, 1.12), draw: (t) => <>
    <Floor /><Window x={480} y={380} day={1} />
    <Desk x={760} />
    <LeanGuitar x={1460} dim={ease(t, 21.5, 23)} />
    <Guy x={980} pose="sit" mood={t < 21.5 ? 'flat' : 'tired'} reach={t > 17.5 && t < 21 ? ease(t, 17.5, 18.5) * (1 - ease(t, 20.4, 21)) : 0} look={t < 21 ? 1 : 0} phone={t > 21.3 ? 1 : 0} />
    <Guy x={1260} s={0.95} demon o={win(t, 19, 27, 0.5)} />
  </>},
  // DAY 47: close on face, screen light flicker
  {from: 27, to: 35, a: C(990, 540, 2.3), b: C(990, 530, 2.8), draw: (t) => <>
    <Floor /><Desk x={760} lamp={0.3} />
    <circle cx={990} cy={530} r={150} fill={rnd(Math.floor(t * 6)) > 0.5 ? PINK : BLUE} opacity={0.1} filter="url(#glow)" />
    <Guy x={980} pose="sit" mood="wide" phone={1} />
  </>},
  // mirror: the reflection is the demon
  {from: 35, to: 44, a: C(1060, 560, 1.15), b: C(1060, 560, 1.32), draw: (t) => <>
    <Floor />
    <Mirror x={1220} crack={ease(t, 39.3, 39.6, Easing.out(Easing.cubic))} t={t} />
    <Guy x={880} mood={t > 39.4 ? 'sad' : 'tired'} tilt={t > 39.4 ? 8 : 0} />
  </>},
  // rock bottom: spotlight
  {from: 44, to: 54, a: C(960, 620, 1.2), b: C(960, 660, 1.4), draw: () => <>
    <polygon points="900,0 1020,0 1160,840 760,840" fill="#fff" opacity={0.05} />
    <ellipse cx={960} cy={FLOOR} rx={200} ry={26} fill="#fff" opacity={0.08} />
    <Guy x={950} pose="hug" mood="closed" />
  </>},
  // DAY 1: phone in the drawer, the demon screams
  {from: 54, to: 63, a: C(760, 600, 1.15), b: C(700, 620, 1.25), draw: (t) => {
    const put = ease(t, 56.2, 57.2);
    const drawer = ease(t, 55.4, 56.0) * (1 - ease(t, 57.6, 58.1));
    return <>
      <Floor /><Window x={1180} y={360} />
      <Bed x={560} />
      <Nightstand x={420} drawer={drawer} clock="11:58" />
      <Guy x={mix(640, 560, ease(t, 54.3, 55.3))} mood={t > 58 ? 'sad' : 'flat'} phone={t < 56.6 ? 1 - put : 0} reach={t > 55.3 && t < 57.6 ? 1 : 0} flip />
      {t > 56.6 && t < 57.3 && <rect x={440} y={FLOOR - 100 - (1 - put) * 60} width={24} height={40} rx={4} fill={BLUE} opacity={0.8} />}
      <Guy x={940} s={mix(1.0, 1.35, ease(t, 58, 59))} demon o={win(t, 57.8, 63, 0.4)} />
    </>;
  }},
  // DAY 2: bored, slow clock
  {from: 63, to: 68, a: C(780, 640, 1.25), b: C(760, 640, 1.32), draw: (t) => <>
    <Floor /><Window x={1180} y={360} day={1} />
    <Bed x={560} /><Nightstand x={420} clock={clockText(t, 63, 68, 840, 841)} />
    <Guy x={760} pose="sit" mood="tired" look={-1} />
    <Guy x={1120} s={0.6} demon o={0.7 * win(t, 63.5, 68)} />
  </>},
  // DAY 6: first notes
  {from: 68, to: 73, a: C(800, 600, 1.3), b: C(820, 590, 1.42), draw: (t) => <>
    <Floor /><Window x={1180} y={360} day={1} />
    <Bed x={560} />
    <Guy x={760} pose="sit" mood="flat" guitar={1} strum={Math.abs(Math.sin(t * 3))} />
    <Notes t={t} x={880} y={420} n={2} />
    <Guy x={1180} s={0.35} demon o={0.5 * win(t, 68, 73)} />
  </>},
  // DAY 21: sunrise, playing, the demon fades
  {from: 73, to: 80, a: C(860, 560, 1.1), b: C(960, 540, 0.95), draw: (t) => <>
    <rect x={-200} y={-200} width={2400} height={1500} fill={WARM} opacity={0.06 * ease(t, 73, 76)} />
    <Floor c="#3a332a" /><Window x={1180} y={360} day={1} />
    <Bed x={560} />
    <Guy x={760} pose="sit" mood={t > 75 ? 'smile' : 'flat'} guitar={1} strum={Math.abs(Math.sin(t * 5))} />
    <Notes t={t} x={880} y={420} n={5} />
    <Guy x={1260} s={0.2} demon o={0.4 * (1 - ease(t, 74, 77))} />
  </>},
  {from: 80, to: DOPAMINE_SEC + 1, a: C(960, 540, 1), b: C(960, 540, 1), draw: () => null},
];

// ---------- overlays ----------
const Whisper: React.FC<{t: number; at: number; out: number; x: number; y: number; text: string; size?: number; color?: string}> = ({t, at, out, x, y, text, size = 46, color = PINK}) => {
  const k = win(t, at, out, 0.3); if (k <= 0) return null;
  const f = Math.floor(t * 12);
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) translate(${(rnd(f) - 0.5) * 3}px, ${(rnd(f + 9) - 0.5) * 3}px) rotate(-3deg)`, fontFamily: HAND, fontSize: size, color, opacity: k, textShadow: `0 0 18px ${color}`, whiteSpace: 'nowrap'}}>{text}</div>;
};
const Narr: React.FC<{t: number; at: number; out: number; a: string; b?: string; bAt?: number; y?: number}> = ({t, at, out, a, b, bAt, y = 500}) => {
  const k = win(t, at, out, 0.6); if (k <= 0) return null;
  return <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: SANS, color: 'white', opacity: k}}>
    <div style={{fontSize: 40, fontWeight: 400, opacity: b && t > (bAt ?? 0) ? 0.55 : 1}}>{a}</div>
    {b && <div style={{fontSize: 46, fontWeight: 900, marginTop: 12, opacity: ease(t, bAt ?? at, (bAt ?? at) + 0.6)}}>{b}</div>}
  </div>;
};
const DAYS: [number, string][] = [[5, 'NIGHT 1'], [16, 'DAY 12'], [27, 'DAY 47'], [35, 'DAY 88'], [44, ''], [54, 'DAY 1'], [63, 'DAY 2'], [68, 'DAY 6'], [73, 'DAY 21'], [80, '']];
const HUD: React.FC<{t: number}> = ({t}) => {
  const lbl = [...DAYS].reverse().find(([a]) => t >= a)?.[1] ?? '';
  if (!lbl) return null;
  const offline = t >= 54;
  const hours = offline ? 0 : Math.round(interpolate(t, [5, 16, 27, 35, 44], [3, 6, 9, 11, 11], CL) * 10) / 10;
  const urge = Math.round(interpolate(t, [5, 44, 54, 63, 68, 73, 79], [40, 100, 100, 90, 55, 20, 8], CL));
  return <div style={{position: 'absolute', left: 52, top: 40, fontFamily: SANS, fontWeight: 900, fontSize: 26, letterSpacing: '0.08em', color: 'white', lineHeight: 1.35}}>
    <div style={{opacity: 0.9}}>{lbl}</div>
    <div style={{fontSize: 20, opacity: 0.8}}>SCREEN <span style={{color: offline ? '#9dff8a' : PINK}}>{offline ? 'OFF' : `${hours}h`}</span></div>
    <div style={{fontSize: 20, opacity: 0.8}}>URGE <span style={{color: urge > 50 ? PINK : '#9dff8a'}}>{urge}%</span></div>
  </div>;
};

export const SFX: [number, string, number][] = [
  [5.1, 'whoosh', 0.2], [6, 'click', 0.15], [7, 'click', 0.15], [8.1, 'heartbeat', 0.25], [9.2, 'click', 0.15], [10.4, 'click', 0.15], [12.6, 'click', 0.15],
  [16, 'whoosh', 0.2], [19.1, 'growl', 0.2], [21.4, 'click', 0.25], [27, 'swell_hit', 0.25], [28, 'click', 0.12], [28.6, 'click', 0.12], [29.2, 'click', 0.12], [29.8, 'click', 0.12], [30.4, 'click', 0.12], [31, 'click', 0.12],
  [35, 'whoosh', 0.2], [37.2, 'heartbeat', 0.35], [39.35, 'impact', 0.55], [39.4, 'glitch', 0.25], [44, 'boom', 0.3],
  [55.4, 'clunk', 0.35], [57.6, 'clunk', 0.45], [58, 'scream', 0.25], [58.1, 'glitch', 0.4], [63, 'whoosh', 0.15], [68, 'swell_hit', 0.2], [80, 'whoosh_long', 0.25],
];

const Glitch: React.FC<{t: number; a: number; b: number}> = ({t, a, b}) => {
  if (t < a || t > b) return null;
  const f = Math.floor(t * 30);
  return <AbsoluteFill>
    <AbsoluteFill style={{background: RED, opacity: 0.14 + rnd(f) * 0.12, mixBlendMode: 'screen'}} />
    {Array.from({length: 6}, (_, i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: rnd(f * 7 + i) * 1080, height: 4 + rnd(f + i) * 26, background: rnd(i + f) > 0.5 ? PINK : '#00e5ff', opacity: 0.35}} />)}
  </AbsoluteFill>;
};

export const Dopamine: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  const sc = SCENES.find((s) => t >= s.from && t < s.to) ?? SCENES[SCENES.length - 1];
  const k = ease(t, sc.from, sc.to, Easing.inOut(Easing.sin));
  const cam = {x: mix(sc.a.x, sc.b.x, k), y: mix(sc.a.y, sc.b.y, k), s: mix(sc.a.s, sc.b.s, k)};
  const shake = (t > 39.3 && t < 39.8 ? 10 : 0) + (t > 58 && t < 59.2 ? 14 : 0);
  const sx = Math.sin(t * 61) * shake, sy = Math.cos(t * 53) * shake;
  const cut = Math.min(ease(t, sc.from, sc.from + 0.35), 1 - ease(t, sc.to - 0.3, sc.to));
  return (
    <AbsoluteFill style={{background: '#0b0b0e'}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="glowSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <radialGradient id="demonGlow"><stop offset="0" stopColor={PINK} stopOpacity={0.22} /><stop offset="1" stopColor={PINK} stopOpacity={0} /></radialGradient>
          <radialGradient id="vig" cx="50%" cy="50%" r="70%"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.75} /></radialGradient>
        </defs>
        <g opacity={cut} transform={`translate(${960 + sx} ${540 + sy}) scale(${cam.s}) translate(${-cam.x} ${-cam.y})`}>{sc.draw(t)}</g>
        <rect width={1920} height={1080} fill="url(#vig)" />
      </svg>
      <HUD t={t} />
      <Narr t={t} at={0.8} out={4.6} a="He never let himself get bored." />
      <Whisper t={t} at={8.6} out={11} x={1240} y={360} text="just one more." />
      <Whisper t={t} at={11.6} out={15.4} x={1240} y={360} text="one more." size={56} />
      <Whisper t={t} at={19.3} out={21.6} x={1340} y={250} text="boring." size={58} />
      <Whisper t={t} at={22.2} out={26.4} x={1340} y={250} text="you'll start tomorrow." />
      <Whisper t={t} at={30} out={34.5} x={960} y={150} text="nothing else feels like this." color={PINK} />
      <Whisper t={t} at={37.4} out={43.6} x={960} y={170} text="you can't even focus." size={96} color={RED} />
      <Narr t={t} at={44.8} out={53.5} a="It wasn't laziness." b="His brain had forgotten how to want slow things." bAt={47.6} y={150} />
      <Whisper t={t} at={58.1} out={62} x={1000} y={170} text="GIVE IT BACK." size={110} color={RED} />
      <Whisper t={t} at={64.3} out={67.6} x={1160} y={400} text="so bored..." size={40} />
      <Narr t={t} at={80.4} out={DOPAMINE_SEC - 0.3} a="Boredom wasn't the enemy." b="It was the way back." bAt={82.2} />
      <Glitch t={t} a={58} b={59.1} />
      <Glitch t={t} a={39.35} b={39.6} />
      <AbsoluteFill style={{background: 'black', opacity: 1 - ease(t, 0, 0.5) + ease(t, DOPAMINE_SEC - 0.6, DOPAMINE_SEC)}} />
      <Audio src={staticFile(`${JOB}/music.wav`)} volume={(f) => interpolate(f / fps, [0, 1, DOPAMINE_SEC - 2, DOPAMINE_SEC], [0, 0.55, 0.55, 0], CL)} />
      {SFX.map(([at, name, v], i) => <Sequence key={i} from={Math.round(at * fps)} durationInFrames={Math.round(2.5 * fps)}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v} /></Sequence>)}
    </AbsoluteFill>
  );
};
