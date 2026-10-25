// Shorts cover (1080x1920) for "How Rich and Poor Kids Get Their First Paycheck": dark-green collage style (2026-10-22 preference).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, fontFamily, Person, Bill, Sneaker, Jar, Tree} from './kit';

const W = 1080, H = 1920;
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
    <path d="M640,140 L760,240 L860,200 L1000,330" /><path d="M960,330 L1000,330 L1000,290" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={80 + i * 60} y={1100 + i * 50} width={40} height={60 + i * 50} />)}
    <circle cx={900} cy={1250} r={110} /><path d="M900,1250 L900,1140 M900,1250 L995,1300" />
    <path d="M700,1500 L820,1600 L900,1560 L1020,1760" /><path d="M980,1760 L1020,1760 L1020,1720" />
    <circle cx={200} cy={1650} r={90} /><path d="M140,1600 l120,100 M260,1600 l-120,100" />
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

const LeoBig: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g filter="url(#sticker)"><Person t={1} x={x} y={y} s={s} kind="adult" shirt={C.navy} hair={C.ink} mood="o" armL={150} armR={-12} flip /></g>
);

// contrast split: same $200, rich habit (save + grow) vs poor habit (spend)
export const PaycheckThumb: React.FC = () => (
  <Frame>
    <rect width={W} height={960} fill={G.mid} /><rect y={960} width={W} height={960} fill="#4A1F1A" />
    <Doodles />
    <line x1={0} y1={960} x2={W} y2={960} stroke="#fff" strokeWidth={14} />
    <Block x={540} y={150} text="FIRST $200" size={120} />
    <Block x={300} y={330} text="RICH" size={110} bg={G.lime} fg="#111" r={-3} />
    <g transform="translate(330,880)" filter="url(#drop)"><Tree s={1.15} coins /></g>
    <SamBig x={800} y={940} s={1.15} mood="grin" armR={-150} flip />
    <Block x={760} y={1150} text="POOR" size={110} bg={C.red} r={3} />
    <g transform="translate(330,1500) rotate(-10)" filter="url(#sticker)"><Sneaker s={2.1} /></g>
    <g transform="translate(330,1250) rotate(12)" filter="url(#drop)"><Bill label="$0" w={240} /></g>
    <LeoBig x={790} y={1900} s={1.15} />
    <Block x={540} y={960} text="VS" size={100} bg={C.mustard} fg="#111" />
  </Frame>
);
