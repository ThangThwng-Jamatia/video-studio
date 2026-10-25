// Thumbnails (1280×720) for "Basic Economics You Need to Understand Before Turning 18". Minor Money brand, kit cast.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, fontFamily, Person, Coin, PriceTag, CoffeeCup, BigArrow, Stall, Envelope, Phone, Sneaker, Clock, Bill, Rat} from './kit';

const W = 1920, H = 1080; // drawn at 1080p, rendered at 1280×720 via viewBox
const Frame: React.FC<{bg: string; children: React.ReactNode}> = ({bg, children}) => (
  <AbsoluteFill style={{backgroundColor: bg}}>
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
      <defs><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={4} /><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0.2 0" /></filter></defs>
      <rect width={W} height={H} fill={bg} />
      {children}
      <rect width={W} height={H} filter="url(#g)" style={{mixBlendMode: 'multiply'}} />
    </svg>
  </AbsoluteFill>
);
const Big: React.FC<{x: number; y: number; size: number; fill: string; children: React.ReactNode; anchor?: 'middle' | 'start'; stroke?: string}> = ({x, y, size, fill, children, anchor = 'middle', stroke = C.ink}) => (
  <text x={x} y={y} fontFamily={fontFamily} fontWeight={700} fontSize={size} fill={fill} stroke={stroke} strokeWidth={size * 0.06} paintOrder="stroke" textAnchor={anchor} strokeLinejoin="round">{children}</text>
);
const Pill: React.FC<{x: number; y: number; w: number; text: string; bg?: string; fg?: string; size?: number; r?: number}> = ({x, y, w, text, bg = C.paper, fg = C.ink, size = 64, r = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${r})`}><rect x={-w / 2} y={-size * 0.75} width={w} height={size * 1.5} rx={16} fill={bg} stroke={C.ink} strokeWidth={8} />
    <text x={0} y={size * 0.05} fontFamily={fontFamily} fontWeight={700} fontSize={size} fill={fg} textAnchor="middle" dominantBaseline="middle">{text}</text></g>
);
// doodle wallpaper of kit icons, low contrast
const Doodles: React.FC<{color: string}> = ({color}) => (
  <g opacity={0.16} style={{mixBlendMode: 'multiply'}}>
    {Array.from({length: 24}).map((_, i) => {
      const x = (i % 6) * 340 + 120 + (Math.floor(i / 6) % 2) * 160, y = Math.floor(i / 6) * 280 + 120;
      const k = i % 6;
      return <g key={i} transform={`translate(${x},${y}) rotate(${(i * 37) % 40 - 20}) scale(0.7)`} fill={color}>
        {k === 0 ? <Coin /> : k === 1 ? <PriceTag label="$" color={color} /> : k === 2 ? <Envelope s={0.6} /> : k === 3 ? <Phone s={0.6} /> : k === 4 ? <Clock t={i} s={0.6} /> : <Bill label="$" w={140} />}
      </g>;
    })}
  </g>
);

// A — title punch: "ECONOMICS" + "before 18", Sam shocked on a red doodle wall.
export const ThumbA: React.FC = () => (
  <Frame bg={C.terra}>
    <Doodles color={C.ink} />
    <Pill x={560} y={150} w={600} text="NOBODY TEACHES" bg={C.ink} fg={C.paper} size={66} r={-3} />
    <Big x={560} y={420} size={250} fill={C.paper}>4 RULES</Big>
    <Big x={560} y={620} size={150} fill={C.mustard}>OF MONEY</Big>
    <Pill x={560} y={820} w={620} text="BEFORE YOU'RE 18" bg={C.mustard} size={70} r={2} />
    <g transform="translate(1480,1130) scale(1.9)"><Person t={1} x={0} y={0} cap stripe mood="o" armL={150} armR={-150} /></g>
    <g transform="translate(1180,250) rotate(-14) scale(2.4)"><Coin /></g>
    <g transform="translate(1800,240) rotate(12) scale(0.9)"><Bill label="$50" w={240} /></g>
  </Frame>
);

// B — contrast split: PROFIT vs LOSS, Maya vs Leo.
export const ThumbB: React.FC = () => (
  <Frame bg={C.paper}>
    <rect width={960} height={H} fill={C.sage} /><rect x={960} width={960} height={H} fill={C.red} />
    <Doodles color={C.ink} />
    <line x1={960} y1={0} x2={960} y2={H} stroke={C.ink} strokeWidth={12} />
    <Pill x={480} y={120} w={560} text="PROFIT" bg={C.paper} size={100} />
    <Pill x={1440} y={120} w={520} text="LOSS" bg={C.paper} size={100} />
    <g transform="translate(300,1060)"><Stall color={C.mustard} sign="LEMONADE" s={0.8} /></g>
    <g transform="translate(600,1060) scale(0.95)"><Person t={1} x={0} y={0} shirt={C.paper} hair={C.terra} mood="grin" armR={-150} /></g>
    <g transform="translate(760,420)"><BigArrow up s={1.3} /></g>
    {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${440 + (i % 2) * 90},${700 - Math.floor(i / 2) * 80}) scale(1.4)`}><Coin /></g>)}
    <g transform="translate(1640,1060)"><Stall color={C.terra} sign="HOT SOUP" s={0.8} /></g>
    <g transform="translate(1340,1060) scale(0.95)"><Person t={1} x={0} y={0} shirt={C.navy} hair={C.ink} mood="o" armL={40} armR={-40} /></g>
    <g transform="translate(1180,420)"><BigArrow up={false} s={1.3} /></g>
    <Pill x={960} y={740} w={300} text="BOTH" bg={C.mustard} size={60} r={-6} />
    <Pill x={960} y={840} w={380} text="TEACH YOU" bg={C.mustard} size={50} r={-6} />
  </Frame>
);

// C — chart spike: coffee price rocketing, Sam pointing, editorial headline.
export const ThumbC: React.FC = () => {
  const pts = [[880, 820], [960, 790], [1040, 810], [1120, 760], [1200, 780], [1280, 740], [1360, 760], [1440, 720], [1520, 700], [1600, 520], [1680, 360], [1760, 220]];
  const d = 'M' + pts.map((p) => p.join(',')).join(' L');
  return (
    <Frame bg={C.paper}>
      <Big x={70} y={210} size={150} fill={C.ink} anchor="start" stroke="none">Prices Are</Big>
      <Big x={70} y={380} size={150} fill={C.terra} anchor="start" stroke="none">Messages.</Big>
      <text x={880} y={150} fontFamily={fontFamily} fontWeight={700} fontSize={44} fill={C.ink}>Coffee price after the storm</text>
      {[300, 500, 700].map((y) => <line key={y} x1={880} y1={y} x2={1840} y2={y} stroke={C.grey} strokeWidth={3} strokeDasharray="8 10" />)}
      <path d={d + ' L1760,880 L880,880 Z'} fill={C.red} opacity={0.15} />
      <path d={d} fill="none" stroke={C.red} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={1760} cy={220} r={20} fill={C.red} stroke={C.ink} strokeWidth={5} />
      <g transform="translate(1600,200) rotate(-8)"><PriceTag label="$6" color={C.terra} s={1.1} /></g>
      <g transform="translate(1000,700) rotate(4)"><PriceTag label="$3" s={0.8} /></g>
      <g transform="translate(1560,880) scale(1.3)"><CoffeeCup t={1} /></g>
      <g transform="translate(380,1150) scale(1.15)"><Person t={1} x={0} y={0} cap stripe mood="o" armL={10} armR={-110} /></g>
      <Pill x={420} y={950} w={560} text="BEFORE 18" bg={C.mustard} size={70} r={-3} />
    </Frame>
  );
};
