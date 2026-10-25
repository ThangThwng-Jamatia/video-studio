// Shorts covers (1080x1920) for "What a Zombie Pandemic Would Do to Your Money": dark-green collage style (2026-10-22 preference).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, fontFamily, Person, BigArrow, PriceTag, BeanCan, Virus} from './kit';

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

const Zombie: React.FC<{x: number; y: number; s: number; flip?: boolean}> = ({x, y, s, flip}) => (
  <g filter="url(#sticker)"><Person t={1} x={x} y={y} s={s} kind="adult" zombie shirt={C.grey} pants={C.navy} hair={C.dirt} mood="o" armL={95} armR={-95} flip={flip} /></g>
);

// A — title punch: ZOMBIE ECONOMY, scared Sam with a zombie behind him
export const ZombieThumbA: React.FC = () => (
  <Frame>
    <Doodles />
    <g transform="translate(830,330) scale(1.1)" filter="url(#drop)"><Virus t={0.6} /></g>
    <Block x={500} y={560} text="ZOMBIE" size={190} r={-3} />
    <Paper x={540} y={760} w={760} h={170} r={2}><Big x={0} y={6} size={130}>ECONOMY</Big></Paper>
    <Block x={540} y={940} text="WHO GETS RICH?" size={80} bg={G.lime} fg="#111" r={-1} />
    <Zombie x={250} y={1820} s={1.15} />
    <SamBig x={660} y={1900} s={1.75} mood="o" armR={-150} />
  </Frame>
);

// B — contrast split: normal week vs zombie week (beans $2 vs $20)
export const ZombieThumbB: React.FC = () => (
  <Frame>
    <rect width={W} height={960} fill={G.mid} /><rect y={960} width={W} height={960} fill="#4A1F1A" />
    <Doodles />
    <line x1={0} y1={960} x2={W} y2={960} stroke="#fff" strokeWidth={14} />
    <Block x={540} y={170} text="NORMAL" size={110} bg={G.lime} fg="#111" />
    <g transform="translate(330,560)" filter="url(#sticker)"><BeanCan s={1.6} /></g>
    <g transform="translate(790,500) rotate(-8)" filter="url(#drop)"><PriceTag label="$2" s={1.5} /></g>
    <Block x={540} y={1160} text="ZOMBIES" size={110} />
    <g transform="translate(330,1480)" filter="url(#sticker)"><BeanCan s={1.6} /></g>
    <g transform="translate(790,1420) rotate(-8)" filter="url(#drop)"><PriceTag label="$20" color={C.terra} s={1.8} /></g>
    <g transform="translate(800,1700)" filter="url(#drop)"><BigArrow up s={0.6} /></g>
    <Block x={540} y={960} text="VS" size={100} bg={C.mustard} fg="#111" />
  </Frame>
);

// C — the crash: red falling chart, zombie on top of it, Sam pointing
export const ZombieThumbC: React.FC = () => {
  const pts = [[120, 760], [220, 720], [320, 760], [420, 860], [520, 840], [620, 960], [720, 1000], [820, 1120], [900, 1100], [1000, 1200]];
  const d = 'M' + pts.map((p) => p.join(',')).join(' L');
  return (
    <Frame>
      <Doodles />
      <Block x={540} y={260} text="ZOMBIES" size={170} r={-2} />
      <Paper x={540} y={460} w={820} h={160} r={2}><Big x={0} y={6} size={110} fill={C.red}>CRASH THE</Big></Paper>
      <Block x={540} y={640} text="ECONOMY" size={120} bg={G.lime} fg="#111" />
      <path d={d} fill="none" stroke={C.red} strokeWidth={22} strokeLinejoin="round" strokeLinecap="round" filter="url(#drop)" />
      <g transform="translate(990,1250) rotate(180)" filter="url(#drop)"><BigArrow up s={0.4} /></g>
      <Zombie x={800} y={1880} s={0.95} flip />
      <SamBig x={300} y={1900} s={1.6} mood="o" armR={-120} />
    </Frame>
  );
};
