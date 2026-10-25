// Channel brand stills for "Minor Money": Sam exports (transparent) + logo variants. Rendered with `remotion still`.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, Person, Coin, fontFamily} from './kit';

// Sam's head in kit coordinates (feet at 0,0): head centre ≈ (0,-355), r 84, cap brim to x≈+136.
const SamFig: React.FC<{mood?: 'smile' | 'grin'; armR?: number; headOnly?: boolean}> = ({mood = 'grin', armR = -10, headOnly}) => (
  <Person t={1} x={0} y={0} cap stripe mood={mood} armL={12} armR={armR} headOnly={headOnly} />
);

export const SamFull: React.FC = () => (
  <AbsoluteFill><svg width="100%" height="100%" viewBox="-260 -500 520 540"><SamFig armR={-150} /></svg></AbsoluteFill>
);
export const SamFace: React.FC = () => (
  <AbsoluteFill><svg width="100%" height="100%" viewBox="-130 -490 300 300"><SamFig headOnly /></svg></AbsoluteFill>
);

const Ring: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width="100%" height="100%" viewBox="0 0 1024 1024">
    <defs>
      <clipPath id="inner"><circle cx={512} cy={512} r={430} /></clipPath>
      <path id="arcTop" d="M 162,512 A 350,350 0 0 1 862,512" />
    </defs>
    <circle cx={512} cy={512} r={500} fill={C.navy} />
    <circle cx={512} cy={512} r={474} fill={C.mustard} stroke={C.ink} strokeWidth={10} />
    <circle cx={512} cy={512} r={430} fill={C.paper} stroke={C.ink} strokeWidth={10} />
    <g clipPath="url(#inner)">{children}</g>
  </svg>
);

// Badge: profile-picture logo. Sam's face + coin, name on a ribbon.
export const LogoBadge: React.FC = () => (
  <AbsoluteFill>
    <Ring>
      <circle cx={512} cy={1030} r={420} fill={C.sage} />
      <g transform="translate(500,940) scale(1.75)"><SamFig /></g>
      <g transform="translate(840,560) rotate(14) scale(2.1)"><Coin /></g>
      <g transform="translate(250,380) rotate(-12) scale(1.5)"><Coin /></g>
    </Ring>
    <svg style={{position: 'absolute', inset: 0}} width="100%" height="100%" viewBox="0 0 1024 1024">
      <g transform="translate(512,800) rotate(-3)">
        <path d="M-420,-70 L420,-70 L390,0 L420,70 L-420,70 L-390,0 Z" fill={C.terra} stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
        <text x={0} y={6} fontFamily={fontFamily} fontWeight={700} fontSize={104} fill={C.paper} textAnchor="middle" dominantBaseline="middle" letterSpacing={2}>MINOR MONEY</text>
      </g>
    </svg>
  </AbsoluteFill>
);

// Face-only badge: cleanest at tiny sizes (YouTube avatar shows ~40 px).
export const LogoFace: React.FC = () => (
  <AbsoluteFill>
    <Ring>
      <g transform="translate(455,1500) scale(2.9)"><SamFig headOnly /></g>
      <g transform="translate(730,790) rotate(14) scale(1.9)"><Coin /></g>
    </Ring>
  </AbsoluteFill>
);

// Horizontal wordmark for banners / end screens (transparent).
export const LogoWordmark: React.FC = () => (
  <AbsoluteFill>
    <svg width="100%" height="100%" viewBox="0 0 2000 600">
      <g transform="translate(300,300) scale(0.5)"><svg x={-512} y={-512} width={1024} height={1024} viewBox="0 0 1024 1024" overflow="visible">
        <circle cx={512} cy={512} r={500} fill={C.navy} /><circle cx={512} cy={512} r={474} fill={C.mustard} stroke={C.ink} strokeWidth={10} />
        <circle cx={512} cy={512} r={430} fill={C.paper} stroke={C.ink} strokeWidth={10} />
        <clipPath id="wm"><circle cx={512} cy={512} r={430} /></clipPath>
        <g clipPath="url(#wm)"><g transform="translate(455,1500) scale(2.9)"><SamFig headOnly /></g><g transform="translate(730,790) rotate(14) scale(1.9)"><Coin /></g></g>
      </svg></g>
      <text x={600} y={250} fontFamily={fontFamily} fontWeight={700} fontSize={210} fill={C.navy} stroke={C.ink} strokeWidth={0}>MINOR</text>
      <text x={600} y={470} fontFamily={fontFamily} fontWeight={700} fontSize={210} fill={C.terra}>MONEY</text>
    </svg>
  </AbsoluteFill>
);

// YouTube banner 2560×1440. Everything important sits in the mobile safe area (1546×423 centred: x 507–2053, y 508–931);
// the street scene outside it only shows on TV / desktop.
import {House, Stall, Car} from './kit';
export const Banner: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.paper}}>
    <svg width="100%" height="100%" viewBox="0 0 2560 1440">
      <defs>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={4} /><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.18  0 0 0 0.22 0" /></filter>
      </defs>
      <rect width={2560} height={1440} fill={C.paper} />
      {/* outer scene (TV/desktop only) */}
      {[[220, 170], [1280, 230], [2330, 150]].map(([x, y], i) => <g key={i} fill="#fff" stroke={C.ink} strokeWidth={6}><ellipse cx={x} cy={y} rx={130} ry={46} /><ellipse cx={x + 70} cy={y - 30} rx={70} ry={42} /></g>)}
      <rect y={1130} width={2560} height={310} fill={C.ground} /><line x1={0} y1={1130} x2={2560} y2={1130} stroke={C.ink} strokeWidth={7} />
      <House x={230} y={1130} body="#E7C9A2" roof={C.sage} />
      <g transform="translate(2390,1130)"><Stall color={C.mustard} sign="LEMONADE" s={0.85} /></g>
      <g transform="translate(560,1140) scale(0.8)"><Car x={0} y={0} color={C.terra} /></g>
      <Person t={2} x={2080} y={1340} s={0.7} shirt={C.sage} hair={C.terra} mood="grin" armR={-150} />
      <Person t={3} x={1930} y={1340} s={0.7} shirt={C.navy} hair={C.ink} mood="smile" armL={20} armR={-40} />
      {/* safe area band */}
      <rect x={430} y={470} width={1700} height={500} rx={60} fill={C.mustard} stroke={C.ink} strokeWidth={10} />
      <rect x={455} y={495} width={1650} height={450} rx={44} fill={C.paper} stroke={C.ink} strokeWidth={6} />
      <g transform="translate(740,915) scale(0.9)"><Person t={1} x={0} y={0} cap stripe mood="grin" armL={12} armR={-150} /></g>
      <g transform="translate(925,690) rotate(14) scale(1.3)"><Coin /></g>
      <text x={1000} y={670} fontFamily={fontFamily} fontWeight={700} fontSize={150}><tspan fill={C.navy}>MINOR </tspan><tspan fill={C.terra}>MONEY</tspan></text>
      <text x={1010} y={790} fontFamily={fontFamily} fontWeight={600} fontSize={60} fill={C.ink}>Money lessons nobody teaches you.</text>
      <g transform="translate(1010,860)">
        <rect x={0} y={-38} width={560} height={76} rx={38} fill={C.terra} stroke={C.ink} strokeWidth={5} />
        <text x={280} y={4} fontFamily={fontFamily} fontWeight={700} fontSize={44} fill={C.paper} textAnchor="middle" dominantBaseline="middle">NEW VIDEOS EVERY WEEK</text>
      </g>
      <rect width={2560} height={1440} filter="url(#grain)" style={{mixBlendMode: 'multiply'}} />
    </svg>
  </AbsoluteFill>
);
