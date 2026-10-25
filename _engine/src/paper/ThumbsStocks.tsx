// Thumbnails for "Stocks Explained for Those Who Want to Be Rich!" — styled after the user's own Economics 101 thumb:
// dark-green collage, black title blocks with white type, torn-paper sub-labels, lime highlight bar, sticker-outlined Sam.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, fontFamily, Person, Coin, Pizza, Jar, Tree, BigArrow, Shop} from './kit';

const W = 1920, H = 1080;
const G = {dark: '#16301F', mid: '#24472F', line: '#3E6B4A', lime: '#B8E06A'};

const Frame: React.FC<{bg?: string; children: React.ReactNode}> = ({bg = G.dark, children}) => (
  <AbsoluteFill style={{backgroundColor: bg}}>
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={7} /><feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.05  0 0 0 0.35 0" /></filter>
        {/* white sticker outline around a shape */}
        <filter id="sticker" x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" operator="dilate" radius={14} result="d" /><feFlood floodColor="#fff" /><feComposite in2="d" operator="in" result="o" />
          <feGaussianBlur in="SourceAlpha" stdDeviation={10} result="b" /><feOffset in="b" dx={8} dy={12} result="sh" /><feFlood floodColor="#000" floodOpacity={0.45} /><feComposite in2="sh" operator="in" result="s" />
          <feMerge><feMergeNode in="s" /><feMergeNode in="o" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="drop"><feDropShadow dx={8} dy={10} stdDeviation={6} floodOpacity={0.45} /></filter>
      </defs>
      <rect width={W} height={H} fill={bg} />
      {children}
      <rect width={W} height={H} filter="url(#grain)" style={{mixBlendMode: 'multiply'}} />
    </svg>
  </AbsoluteFill>
);
// chalk-style doodles: rising charts, arrows, pie, on the dark green
const Doodles: React.FC = () => (
  <g stroke={G.line} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.9}>
    <path d="M80,300 L220,200 L320,250 L470,90" /><path d="M430,90 L470,90 L470,130" />
    <path d="M1300,140 L1420,80 L1520,120 L1680,30" /><path d="M1640,30 L1680,30 L1680,70" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={140 + i * 60} y={900 - i * 50} width={40} height={60 + i * 50} />)}
    <circle cx={1760} cy={900} r={110} /><path d="M1760,900 L1760,790 M1760,900 L1855,950" />
    <path d="M760,1000 L880,960 L980,990 L1120,900" /><path d="M1080,900 L1120,900 L1120,940" />
  </g>
);
const Block: React.FC<{x: number; y: number; text: string; size: number; bg?: string; fg?: string; r?: number; pad?: number}> = ({x, y, text, size, bg = '#111', fg = '#fff', r = 0, pad = 40}) => {
  const w = text.length * size * 0.66 + pad * 2;
  return (
    <g transform={`translate(${x},${y}) rotate(${r})`} filter="url(#drop)">
      <rect x={-w / 2} y={-size * 0.62} width={w} height={size * 1.24} fill={bg} />
      <text x={0} y={size * 0.06} fontFamily={fontFamily} fontWeight={700} fontSize={size} fill={fg} textAnchor="middle" dominantBaseline="middle">{text}</text>
    </g>
  );
};
// torn-paper strip
const Paper: React.FC<{x: number; y: number; w: number; h: number; r?: number; children: React.ReactNode; fill?: string}> = ({x, y, w, h, r = 0, children, fill = '#EFE4CC'}) => {
  const jag = Array.from({length: 18}).map((_, i) => `${-w / 2 + (i / 17) * w},${-h / 2 + (i % 2 ? 8 : -6)}`).join(' L');
  const jagB = Array.from({length: 18}).map((_, i) => `${w / 2 - (i / 17) * w},${h / 2 + (i % 2 ? -7 : 6)}`).join(' L');
  return <g transform={`translate(${x},${y}) rotate(${r})`} filter="url(#drop)"><path d={`M${jag} L${jagB} Z`} fill={fill} />{children}</g>;
};
const Big: React.FC<{x: number; y: number; size: number; fill?: string; children: React.ReactNode}> = ({x, y, size, fill = C.ink, children}) => (
  <text x={x} y={y} fontFamily={fontFamily} fontWeight={700} fontSize={size} fill={fill} textAnchor="middle" dominantBaseline="middle">{children}</text>
);
const SamBig: React.FC<{x: number; y: number; s: number; mood?: 'grin' | 'o' | 'flat'; armR?: number; flip?: boolean}> = ({x, y, s, mood = 'grin', armR = -150, flip}) => (
  <g filter="url(#sticker)"><Person t={1} x={x} y={y} s={s} cap stripe mood={mood} armL={12} armR={armR} flip={flip} /></g>
);

// A — collage title (closest to the user's Economics 101 thumb)
export const StocksThumbA: React.FC = () => (
  <Frame>
    <Doodles />
    <g transform="translate(150,980)" filter="url(#drop)">{[0, 1, 2, 3, 4].map((i) => <g key={i} transform={`translate(${(i % 2) * 30},${-i * 40}) scale(2.2)`}><Coin /></g>)}</g>
    <g transform="translate(330,250) rotate(-10)" filter="url(#sticker)"><Pizza n={8} taken={1} pull={50} s={0.95} hi={C.mustard} /></g>
    <Block x={760} y={400} text="STOCKS" size={210} r={-2} />
    <Paper x={760} y={600} w={700} h={150} r={2}><Big x={0} y={4} size={110}>EXPLAINED</Big></Paper>
    <Block x={760} y={760} text="FOR THOSE WHO WANT TO BE" size={52} r={-1} pad={30} />
    <Block x={760} y={880} text="RICH" size={130} bg={G.lime} fg="#111" r={1} />
    <SamBig x={1530} y={1420} s={2.1} />
    <g transform="translate(1250,220) rotate(10)" filter="url(#drop)"><BigArrow up s={0.7} /></g>
  </Frame>
);

// B — contrast split: bank vs stocks
export const StocksThumbB: React.FC = () => (
  <Frame>
    <rect width={960} height={H} fill="#4A1F1A" /><rect x={960} width={960} height={H} fill={G.mid} />
    <Doodles />
    <line x1={960} y1={0} x2={960} y2={H} stroke="#fff" strokeWidth={14} />
    <Block x={480} y={120} text="BANK" size={120} />
    <Block x={1440} y={120} text="STOCKS" size={120} bg={G.lime} fg="#111" />
    <g transform="translate(300,620)" filter="url(#sticker)"><Jar fill={0.2} s={1.5} /></g>
    <Paper x={300} y={940} w={360} h={110} r={-3}><Big x={0} y={4} size={64} fill={C.red}>1–2%</Big></Paper>
    <g filter="url(#sticker)"><Person t={1} x={720} y={1180} s={1.25} cap stripe mood="flat" armL={10} armR={-10} /></g>
    <g transform="translate(1660,880)" filter="url(#sticker)"><Tree g={1} s={1.1} coins /></g>
    <Paper x={1660} y={960} w={380} h={110} r={3}><Big x={0} y={4} size={64} fill={C.cashD}>7–10%</Big></Paper>
    <g filter="url(#sticker)"><Person t={1} x={1200} y={1180} s={1.25} cap stripe mood="grin" armL={150} armR={-150} /></g>
    <Block x={960} y={540} text="VS" size={110} bg={C.mustard} fg="#111" />
  </Frame>
);

// C — "Own a slice" visual metaphor + rising chart
export const StocksThumbC: React.FC = () => {
  const pts = [[980, 860], [1060, 820], [1140, 840], [1220, 760], [1300, 780], [1380, 690], [1460, 700], [1540, 560], [1620, 520], [1700, 360], [1780, 260]];
  const d = 'M' + pts.map((p) => p.join(',')).join(' L');
  return (
    <Frame>
      <Doodles />
      <Block x={480} y={170} text="OWN A" size={150} r={-2} />
      <Paper x={480} y={350} w={760} h={170} r={2}><Big x={0} y={6} size={130} fill={C.terra}>SLICE</Big></Paper>
      <Block x={480} y={530} text="OF THE COMPANY" size={70} bg={G.lime} fg="#111" />
      <g transform="translate(1250,330)" filter="url(#sticker)"><Shop sign="BIG CO." color={C.terra} s={0.75} /></g>
      <path d={d} fill="none" stroke={G.lime} strokeWidth={18} strokeLinejoin="round" strokeLinecap="round" filter="url(#drop)" />
      <g transform="translate(1780,260)"><BigArrow up s={0.45} /></g>
      <g transform="translate(1520,840) rotate(-14)" filter="url(#sticker)"><Pizza n={8} taken={1} pull={60} s={0.9} hi={C.mustard} /></g>
      <SamBig x={560} y={1500} s={1.9} armR={-120} />
    </Frame>
  );
};
