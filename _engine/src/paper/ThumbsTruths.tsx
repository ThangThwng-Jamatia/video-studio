// 16:9 thumbnails (1280x720) for "30 Brutal Money Truths I Wish I Knew at 20": dark-green collage style (2026-10-22 preference).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, fontFamily, Person, BigArrow, Tree, Sneaker, CreditCard, Bill} from './kit';

const W = 1280, H = 720;
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
  <g transform="scale(1.18,0.375)" stroke={G.line} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.9}>
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


// A — title punch: 30 BRUTAL / MONEY TRUTHS, shocked Sam
export const TruthsThumbA: React.FC = () => (
  <Frame>
    <Doodles />
    <Block x={360} y={150} text="30 BRUTAL" size={120} r={-3} />
    <Paper x={380} y={320} w={660} h={150} r={2}><Big x={0} y={6} size={104}>MONEY</Big></Paper>
    <Block x={380} y={480} text="TRUTHS" size={120} bg={G.lime} fg="#111" r={-2} />
    <Paper x={380} y={630} w={560} h={80} r={-1} fill="#fff"><Big x={0} y={4} size={50}>I wish I knew at 20</Big></Paper>
    <SamBig x={1000} y={1080} s={1.5} mood="o" armR={-150} />
  </Frame>
);

// B — contrast split: AT 20 (spending, credit card) vs AT 30 (money tree)
export const TruthsThumbB: React.FC = () => (
  <Frame>
    <rect width={640} height={H} fill="#4A1F1A" /><rect x={640} width={640} height={H} fill={G.mid} />
    <line x1={640} y1={0} x2={640} y2={H} stroke="#fff" strokeWidth={12} />
    <Block x={320} y={90} text="AT 20" size={96} bg={C.red} />
    <Block x={960} y={90} text="AT 30" size={96} bg={G.lime} fg="#111" />
    <g transform="translate(200,330) rotate(-12)" filter="url(#sticker)"><CreditCard s={1.1} /></g>
    <g transform="translate(200,540)" filter="url(#sticker)"><Sneaker s={1.4} /></g>
    <g filter="url(#sticker)"><Person t={1} x={470} y={860} s={0.9} kind="adult" shirt={C.navy} hair={C.ink} mood="o" armL={150} armR={-12} /></g>
    <g transform="translate(1110,640)" filter="url(#drop)"><Tree s={0.95} coins /></g>
    <SamBig x={850} y={860} s={0.9} mood="grin" armR={-150} />
    <Block x={640} y={380} text="VS" size={80} bg={C.mustard} fg="#111" />
  </Frame>
);

// C — editorial: income line rising, lifestyle line chasing it, "STOP DOING THIS"
export const TruthsThumbC: React.FC = () => (
  <Frame>
    <Doodles />
    <Block x={420} y={110} text="STOP DOING" size={96} r={-2} />
    <Block x={420} y={240} text="THIS AT 20" size={96} bg={G.lime} fg="#111" r={1} />
    <path d="M80,660 L300,600 L480,520 L660,380 L820,220" fill="none" stroke={C.cash} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" filter="url(#drop)" />
    <path d="M80,680 L300,630 L480,550 L660,420 L820,260" fill="none" stroke={C.red} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="34 20" filter="url(#drop)" />
    <Paper x={300} y={420} w={300} h={70} r={-3}><Big x={0} y={4} size={40} fill={C.red}>LIFESTYLE</Big></Paper>
    <g transform="translate(560,560) rotate(8)" filter="url(#sticker)"><Bill label="$0 LEFT" w={240} /></g>
    <SamBig x={1060} y={1090} s={1.45} mood="o" armR={-110} flip />
  </Frame>
);
