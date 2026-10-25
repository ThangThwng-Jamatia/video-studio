// WHERE IT STARTS · Ep 1 "35,000 FEET" (zombie anthology, 9:16). Flat 2D cinematic vector style (the viral format):
// readable faces, one idea per frame, a moving camera on every shot (push/pan + handheld drift + shake on hits),
// parallax foreground with focus blur, light cones, flicker, breathing/blinking characters, ticking counters.
// Voice: Brian narrator, Nadia = Jessica, Captain = Harry. Words in wisPlaneWords.ts.
import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Oswald';
import {DayAudio, Grain, Sfx, useT} from './dayKit';
import {WORDS} from './wisPlaneWords';

const {fontFamily: OSW} = loadFont('normal', {weights: ['500', '700'], subsets: ['latin']});
export const WIS_PLANE_SEC = 73.6;
const JOB = 'jobs/wis-plane';
const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const io = Easing.inOut(Easing.cubic);
const ez = (t: number, a: number, b: number, e = io) => interpolate(t, [a, b], [0, 1], {...CL, easing: e});
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const rnd = (i: number) => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };
const back = Easing.out(Easing.back(1.8));

const P = {
  bg: '#0d1422', wall: '#1b2638', wall2: '#232f45', bin: '#1e293c', binHi: '#2b3953', seat: '#26385f', seatHi: '#31477a', head: '#3a4f86',
  floor: '#151c2a', aisle: '#2a2230', red: '#ff3b3b', amber: '#ffc04d', pink: '#ff7eb6', green: '#3ccf6e', cream: '#f2ead8',
  skin: '#f0c39a', skin2: '#c98f63', you: '#2f8f83', youHair: '#2a1d16', nadia: '#1f2b4d', nadiaHair: '#5a3422', zskin: '#8fa877', steel: '#7d8796', steelD: '#4d5563',
};

// ---------------- character ----------------
type Mouth = 'flat' | 'o' | 'frown' | 'open' | 'grit' | 'smile';
type Face = {look?: [number, number]; brow?: number; mouth?: Mouth; wide?: number};
type PP = {
  t: number; x?: number; y?: number; s?: number; top: string; hair: string; skin?: string; pants?: string; face?: Face;
  armL?: number; armR?: number; walk?: number; zombie?: boolean; bun?: boolean; scarf?: boolean; sit?: boolean; tilt?: number; back?: boolean; seed?: number; hood?: boolean; flip?: boolean;
};
const Arm: React.FC<{x: number; y: number; a: number; c: string; skin: string; len?: number}> = ({x, y, a, c, skin, len = 175}) => (
  <g transform={`rotate(${a} ${x} ${y})`}>
    <rect x={x - 21} y={y - 10} width={42} height={len} rx={21} fill={c} />
    <circle cx={x} cy={y + len + 4} r={22} fill={skin} />
  </g>
);
export const Person: React.FC<PP> = ({t, x = 0, y = 0, s = 1, top, hair, skin = P.skin, pants = '#283044', face = {}, armL = 8, armR = -8, walk, zombie, bun, scarf, sit, tilt = 0, back: bk, seed = 0, hood, flip}) => {
  const sk = zombie ? P.zskin : skin;
  const br = Math.sin(t * 2.3 + seed) * 4;
  const blink = (() => { const p = (t + seed * 1.37) % 3.4; return p < 0.13 ? Math.max(0.08, Math.abs(p - 0.065) / 0.065) : 1; })();
  const wa = walk !== undefined ? Math.sin(walk) * 24 : 0;
  const bob = walk !== undefined ? -Math.abs(Math.cos(walk)) * 10 : 0;
  const {look = [0, 0], brow = 0, mouth = 'flat', wide = 1} = face;
  const ey = zombie ? 1 : blink * wide;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${flip ? -s : s} ${s})`}>
      {/* legs */}
      {sit ? (
        <g>
          <rect x={-70} y={-215} width={200} height={50} rx={25} fill={pants} />
          <rect x={-10} y={-215} width={200} height={50} rx={25} fill={pants} transform="rotate(4 -10 -190)" />
          <rect x={150} y={-200} width={46} height={190} rx={23} fill={pants} />
          <ellipse cx={185} cy={-8} rx={42} ry={18} fill="#e8e8ee" />
        </g>
      ) : (
        <g>
          <g transform={`rotate(${wa} -30 -200)`}><rect x={-55} y={-210} width={50} height={205} rx={24} fill={pants} /><ellipse cx={-26} cy={-6} rx={38} ry={17} fill="#e8e8ee" /></g>
          <g transform={`rotate(${-wa} 30 -200)`}><rect x={5} y={-210} width={50} height={205} rx={24} fill={pants} /><ellipse cx={34} cy={-6} rx={38} ry={17} fill="#e8e8ee" /></g>
        </g>
      )}
      <g transform={`translate(0 ${br * 0.5})`}>
        <Arm x={-82} y={-370} a={armL + (walk !== undefined ? -wa * 0.8 : 0)} c={top} skin={sk} />
        {/* torso */}
        <path d={`M-98,-385 Q-104,-260 -88,-190 L88,-190 Q104,-260 98,-385 Q0,${-420 - br} -98,-385Z`} fill={top} />
        <path d="M-88,-200 L88,-200 L88,-190 L-88,-190Z" fill="rgba(0,0,0,0.18)" />
        {hood && !bk && <g stroke="#e8e8ee" strokeWidth={6} strokeLinecap="round"><line x1={-20} y1={-370} x2={-24} y2={-300} /><line x1={20} y1={-370} x2={24} y2={-300} /></g>}
        {scarf && !bk && <path d="M-34,-392 L34,-392 L0,-330Z" fill={P.red} />}
        {scarf && !bk && <g fill="#c9a24a"><circle cx={-48} cy={-330} r={6} /><circle cx={-48} cy={-290} r={6} /></g>}
        <rect x={-24} y={-408} width={48} height={30} fill={sk} />
        {hood && <path d="M-96,-390 Q0,-350 96,-390 Q60,-410 0,-408 Q-60,-410 -96,-390Z" fill={top} stroke="rgba(0,0,0,0.15)" strokeWidth={4} />}
        <Arm x={82} y={-370} a={armR + (walk !== undefined ? wa * 0.8 : 0)} c={top} skin={sk} />
        {/* head */}
        <g transform={`translate(0 -500) rotate(${tilt})`}>
          {bun && <circle cx={bk ? 0 : -40} cy={-92} r={44} fill={hair} />}
          <circle cx={-98} cy={8} r={20} fill={sk} /><circle cx={98} cy={8} r={20} fill={sk} />
          <circle r={104} fill={sk} />
          {bk ? <circle r={106} fill={hair} /> : (
            <g>
              <path d={bun ? 'M-108,0 Q-112,-112 0,-116 Q112,-112 108,0 Q90,-50 40,-62 Q-10,-40 -70,-55 Q-100,-40 -108,0Z'
                : 'M-110,6 Q-118,-115 0,-118 Q118,-115 110,6 Q100,-48 74,-52 L60,-30 L44,-58 L22,-34 L4,-62 L-16,-34 L-36,-60 L-52,-32 L-72,-56 Q-100,-48 -110,6Z'} fill={hair} />
              {/* eyes */}
              {[-38, 38].map((ex, i) => (
                <g key={i}>
                  <ellipse cx={ex} cy={6} rx={25} ry={29 * ey} fill={zombie ? '#e9f0d6' : 'white'} />
                  {!zombie && ey > 0.3 && <circle cx={ex + look[0] * 10} cy={6 + look[1] * 10} r={12 * Math.min(1, 0.85 + 0.15 / wide)} fill="#141414" />}
                  {zombie && <circle cx={ex} cy={6} r={7} fill={P.red} opacity={0.9} />}
                </g>
              ))}
              {/* brows */}
              <g stroke={zombie ? '#3d4a33' : '#2a1d16'} strokeWidth={9} strokeLinecap="round">
                <line x1={-62} y1={-36} x2={-16} y2={-36 - brow * 13} />
                <line x1={62} y1={-36} x2={16} y2={-36 - brow * 13} />
              </g>
              {/* mouth */}
              <g transform="translate(0 56)">
                {mouth === 'flat' && <line x1={-16} y1={0} x2={16} y2={0} stroke="#5a2a20" strokeWidth={7} strokeLinecap="round" />}
                {mouth === 'smile' && <path d="M-20,-4 Q0,14 20,-4" stroke="#5a2a20" strokeWidth={7} fill="none" strokeLinecap="round" />}
                {mouth === 'frown' && <path d="M-20,8 Q0,-10 20,8" stroke="#5a2a20" strokeWidth={7} fill="none" strokeLinecap="round" />}
                {mouth === 'o' && <ellipse rx={11} ry={15} fill="#3a1410" />}
                {mouth === 'open' && <g><ellipse rx={26} ry={22} fill="#3a1410" /><rect x={-18} y={-20} width={36} height={8} fill="white" /></g>}
                {mouth === 'grit' && <g><rect x={-24} y={-10} width={48} height={20} rx={6} fill="white" stroke="#5a2a20" strokeWidth={4} /><line x1={-24} y1={0} x2={24} y2={0} stroke="#5a2a20" strokeWidth={3} /></g>}
              </g>
              {zombie && <path d="M-60,40 Q-40,60 -55,80 M70,-20 Q60,10 75,30" stroke="#5d6e4c" strokeWidth={5} fill="none" />}
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

// ---------------- shared bits ----------------
const Defs: React.FC = () => (
  <defs>
    <filter id="b4"><feGaussianBlur stdDeviation="4" /></filter>
    <filter id="b10"><feGaussianBlur stdDeviation="10" /></filter>
    <filter id="b22"><feGaussianBlur stdDeviation="22" /></filter>
    <filter id="glow"><feGaussianBlur stdDeviation="14" result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <radialGradient id="lamp" cx="50%" cy="0%" r="100%"><stop offset="0" stopColor="#ffe0a0" stopOpacity="0.55" /><stop offset="1" stopColor="#ffe0a0" stopOpacity="0" /></radialGradient>
    <radialGradient id="redglow"><stop offset="0" stopColor="#ff3b3b" stopOpacity="0.7" /><stop offset="1" stopColor="#ff3b3b" stopOpacity="0" /></radialGradient>
    <radialGradient id="warm"><stop offset="0" stopColor="#ffb85c" stopOpacity="0.55" /><stop offset="1" stopColor="#ffb85c" stopOpacity="0" /></radialGradient>
    <radialGradient id="cool"><stop offset="0" stopColor="#8fb8ff" stopOpacity="0.35" /><stop offset="1" stopColor="#8fb8ff" stopOpacity="0" /></radialGradient>
    <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe6b0" stopOpacity="0.45" /><stop offset="1" stopColor="#ffe6b0" stopOpacity="0" /></linearGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#050912" /><stop offset="0.6" stopColor="#14213b" /><stop offset="1" stopColor="#2a3756" /></linearGradient>
  </defs>
);
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}><Defs />{children}</svg>
);
// floating dust in a light beam
const Dust: React.FC<{t: number; x: number; y: number; w: number; h: number; n?: number; c?: string}> = ({t, x, y, w, h, n = 26, c = '#fff1cf'}) => (
  <g>{Array.from({length: n}, (_, i) => {
    const px = x + ((rnd(i) * w + t * (8 + rnd(i + 9) * 14)) % w), py = y + ((rnd(i + 3) * h - t * (10 + rnd(i + 5) * 18)) % h + h) % h;
    return <circle key={i} cx={px} cy={py} r={1.5 + rnd(i + 7) * 2.5} fill={c} opacity={0.25 + 0.5 * Math.abs(Math.sin(t * 1.3 + i))} />;
  })}</g>
);

// ---------------- sets ----------------
// Aisle looking aft. VP at (540,760); depth d -> scale s = 1/(1+d*5)
type Walker = {d: number; x: number; top: string; hair: string; zombie?: boolean; walk?: number; back?: boolean; face?: Face; armL?: number; armR?: number; bun?: boolean; scarf?: boolean; sit?: boolean};
const VPY = 760;
const sc = (d: number) => 1 / (1 + d * 5);
const fy = (d: number) => VPY + 1250 * sc(d);
const Aisle: React.FC<{t: number; mood?: 'night' | 'red' | 'dark'; stand?: number; walkers?: Walker[]; rearGlow?: number; heads?: boolean; empty?: number}> = ({t, mood = 'night', stand = 0, walkers = [], rearGlow = 0.4, heads = true, empty = 0}) => {
  const rows = Array.from({length: 15}, (_, i) => 0.05 + i * 0.29).reverse();
  const far = sc(4.6);
  const flick = mood === 'red' ? 0.55 + 0.45 * Math.abs(Math.sin(t * 9)) : 1;
  const Q = (pts: number[][], fill: string, op = 1) => <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={fill} opacity={op} />;
  const wallX = 640, binB = 150;
  return (
    <g>
      <rect width={1080} height={1920} fill={P.bg} />
      {/* ceiling + bins + floor as perspective quads */}
      {Q([[540 - wallX, VPY - 1150], [540 + wallX, VPY - 1150], [540 + wallX * far, VPY - 1150 * far], [540 - wallX * far, VPY - 1150 * far]], '#151e2e')}
      {Q([[540 - wallX, VPY - 1150], [540 - binB, VPY - 820], [540 - binB * far, VPY - 820 * far], [540 - wallX * far, VPY - 1150 * far]], P.bin)}
      {Q([[540 + wallX, VPY - 1150], [540 + binB, VPY - 820], [540 + binB * far, VPY - 820 * far], [540 + wallX * far, VPY - 1150 * far]], P.bin)}
      {Q([[540 - binB, VPY - 820], [540 - binB - 30, VPY - 760], [540 - (binB + 30) * far, VPY - 760 * far], [540 - binB * far, VPY - 820 * far]], P.binHi)}
      {Q([[540 + binB, VPY - 820], [540 + binB + 30, VPY - 760], [540 + (binB + 30) * far, VPY - 760 * far], [540 + binB * far, VPY - 820 * far]], P.binHi)}
      {Q([[540 - wallX, VPY + 1250], [540 + wallX, VPY + 1250], [540 + wallX * far, VPY + 1250 * far], [540 - wallX * far, VPY + 1250 * far]], P.floor)}
      {Q([[540 - 150, VPY + 1250], [540 + 150, VPY + 1250], [540 + 150 * far, VPY + 1250 * far], [540 - 150 * far, VPY + 1250 * far]], P.aisle)}
      {/* ceiling light strip */}
      <g opacity={mood === 'dark' ? 0.05 : 0.3 * flick}>
        {Q([[540 - 40, VPY - 1150], [540 + 40, VPY - 1150], [540 + 40 * far, VPY - 1150 * far], [540 - 40 * far, VPY - 1150 * far]], mood === 'red' ? '#ff6a6a' : '#9fb6e6')}
      </g>
      {/* rear galley */}
      <rect x={540 - wallX * far} y={VPY - 1150 * far} width={wallX * 2 * far} height={2400 * far} fill="#2d2a35" />
      <ellipse cx={540} cy={VPY} rx={160} ry={140} fill={mood === 'red' ? 'url(#redglow)' : 'url(#warm)'} opacity={rearGlow} />
      {/* bin seams */}
      {rows.map((d, i) => { const s = sc(d); return <g key={'b' + i} stroke="#111826" strokeWidth={3 * s + 0.5}><line x1={540 - wallX * s} y1={VPY - 1150 * s} x2={540 - binB * s} y2={VPY - 820 * s} /><line x1={540 + wallX * s} y1={VPY - 1150 * s} x2={540 + binB * s} y2={VPY - 820 * s} /></g>; })}
      {/* seat rows far -> near */}
      {rows.map((d, ri) => {
        const s = sc(d), f = fy(d);
        return (
          <g key={ri}>
            {[-1, 1].map((side) => (
              <g key={side}>
                {[0, 1, 2].map((k) => {
                  const cx = 540 + side * (215 + k * 140) * s;
                  const id = ri * 7 + k * 2 + (side > 0 ? 1 : 0);
                  const occ = rnd(id) > 0.22 && rnd(id + 50) > empty;
                  const rise = Math.max(0, Math.min(1, stand * 1.6 - rnd(id + 20) * 0.6));
                  const hy = f - 600 * s - rise * 230 * s;
                  const hc = ['#2a1d16', '#5a3a22', '#141414', '#8a6a3a', '#b8b8b8'][Math.floor(rnd(id + 3) * 5)];
                  return (
                    <g key={k}>
                      {heads && occ && <g>
                        {rise > 0.05 && <rect x={cx - 62 * s} y={hy + 40 * s} width={124 * s} height={260 * s} rx={40 * s} fill={['#6b4c8a', '#3d6e9e', '#9a4b3d', '#4b7a4b', '#7a7a8a'][Math.floor(rnd(id + 8) * 5)]} />}
                        <circle cx={cx} cy={hy} r={56 * s} fill={hc} />
                      </g>}
                      <rect x={cx - 66 * s} y={f - 560 * s} width={132 * s} height={560 * s} rx={30 * s} fill={P.seat} />
                      <rect x={cx - 58 * s} y={f - 555 * s} width={116 * s} height={110 * s} rx={22 * s} fill={P.seatHi} />
                    </g>
                  );
                })}
              </g>
            ))}
          </g>
        );
      })}
      {/* people in the aisle, far -> near */}
      {[...walkers].sort((a, b) => b.d - a.d).map((w, i) => (
        <g key={'w' + i}>
          {w.zombie && <circle cx={540 + w.x * sc(w.d)} cy={fy(w.d) - 500 * sc(w.d)} r={260 * sc(w.d)} fill="url(#redglow)" opacity={0.6} />}
          <Person t={t} seed={i * 3} x={540 + w.x * sc(w.d)} y={fy(w.d)} s={sc(w.d) * 1.05} top={w.top} hair={w.hair} zombie={w.zombie} walk={w.walk} back={w.back} face={w.face} armL={w.armL} armR={w.armR} bun={w.bun} scarf={w.scarf} />
        </g>
      ))}
      {/* floor emergency strips */}
      {(mood === 'dark' || mood === 'red') && rows.map((d, i) => <g key={'e' + i}><circle cx={540 - 150 * sc(d)} cy={fy(d)} r={6 * sc(d) + 1.5} fill="#ffd27a" filter="url(#b4)" /><circle cx={540 + 150 * sc(d)} cy={fy(d)} r={6 * sc(d) + 1.5} fill="#ffd27a" filter="url(#b4)" /></g>)}
      {mood === 'red' && <rect width={1080} height={1920} fill="#ff1e1e" opacity={0.22 * flick} style={{mixBlendMode: 'multiply'}} />}
      {mood === 'dark' && <rect width={1080} height={1920} fill="#050a18" opacity={0.55} />}
    </g>
  );
};
// blurred foreground seat edges (depth of field + parallax)
const FgSeats: React.FC<{px: number; dark?: boolean}> = ({px, dark}) => (
  <g filter="url(#b22)" opacity={dark ? 0.9 : 1}>
    <rect x={-120 + px} y={1150} width={300} height={900} rx={90} fill={P.seat} />
    <rect x={-100 + px} y={1160} width={260} height={180} rx={60} fill={P.seatHi} />
    <rect x={900 + px * 1.2} y={1080} width={320} height={950} rx={90} fill={P.seat} />
    <rect x={920 + px * 1.2} y={1090} width={280} height={190} rx={60} fill={P.seatHi} />
  </g>
);

const Exterior: React.FC<{t: number; alarm?: number; dive?: number}> = ({t, alarm = 0, dive = 0}) => {
  const cl = (y: number, sp: number, sz: number, op: number, seed: number) => Array.from({length: 7}, (_, i) => {
    const x = ((rnd(i + seed) * 1800 - t * sp) % 1800 + 1800) % 1800 - 360;
    return <ellipse key={i} cx={x} cy={y + rnd(i + seed + 1) * 140} rx={sz * (0.7 + rnd(i + seed + 2) * 0.6)} ry={sz * 0.28} fill="#3a4767" opacity={op} />;
  });
  const bob = Math.sin(t * 1.4) * 8;
  const nav = Math.sin(t * 6) > 0.6 ? 1 : 0.15;
  return (
    <g>
      <rect width={1080} height={1920} fill="url(#sky)" />
      {Array.from({length: 90}, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 99) * 1100} r={rnd(i + 7) * 2.2 + 0.6} fill="white" opacity={0.3 + 0.6 * Math.abs(Math.sin(t * 0.8 + i))} />)}
      <circle cx={820} cy={330} r={70} fill="#f4f1e2" filter="url(#glow)" />
      <circle cx={845} cy={315} r={14} fill="#dcd8c6" />
      <g filter="url(#b10)">{cl(1250, 60, 300, 0.6, 1)}</g>
      <g transform={`translate(540 ${960 + bob}) rotate(${-4 + dive * 9}) translate(-540 -960)`}>
        {/* plane side view */}
        <path d="M120,960 Q130,900 220,890 L860,890 Q960,890 1010,930 Q1030,955 1000,975 L220,1010 Q130,1010 120,960Z" fill="#dfe4ec" />
        <path d="M220,990 L1000,975 Q1030,955 1010,930 L1010,960 Q980,1000 900,1005 L220,1012Z" fill="#b9c1ce" />
        <path d="M180,893 L120,760 L200,760 L300,893Z" fill="#c9d0db" />
        <path d="M150,770 L200,770 L260,880 L190,880Z" fill={P.red} />
        <path d="M520,985 L380,1110 L460,1110 L660,985Z" fill="#aab3c2" />
        <ellipse cx={470} cy={1030} rx={60} ry={22} fill="#8b95a6" />
        {Array.from({length: 18}, (_, i) => <rect key={i} x={300 + i * 34} y={922} width={16} height={22} rx={7} fill={i > 13 ? '#ffd27a' : alarm > 0 && i < 6 ? (Math.sin(t * 10 + i) > 0 ? '#ff4d4d' : '#ffd27a') : '#ffd27a'} opacity={0.95} />)}
        <path d="M940,912 Q975,915 995,935 L955,935Z" fill="#2a3550" />
        <circle cx={200} cy={762} r={9} fill={P.red} opacity={nav} filter="url(#glow)" />
        <circle cx={450} cy={1108} r={8} fill={P.green} opacity={1 - nav * 0.8} filter="url(#glow)" />
        {alarm > 0 && <circle cx={600} cy={950} r={420} fill="url(#redglow)" opacity={alarm * (0.4 + 0.4 * Math.abs(Math.sin(t * 5)))} />}
      </g>
      <g filter="url(#b22)">{cl(1550, 160, 520, 0.85, 20)}</g>
    </g>
  );
};

const Galley: React.FC<{t: number; curtain?: number; cart?: number; lights?: number; aisleZ?: number; bulge?: number}> = ({t, curtain = 0, cart = 0, lights = 1, aisleZ = 0, bulge = 0}) => (
  <g>
    <rect width={1080} height={1920} fill="#202a3a" />
    <rect y={1480} width={1080} height={440} fill="#161c27" />
    {/* cabinets */}
    {Array.from({length: 12}, (_, i) => { const c = i % 4, r = Math.floor(i / 4); return (
      <g key={i}><rect x={400 + c * 160} y={470 + r * 230} width={150} height={215} rx={10} fill={P.steel} /><rect x={410 + c * 160} y={480 + r * 230} width={130} height={195} rx={8} fill="#8e98a8" /><rect x={460 + c * 160} y={555 + r * 230} width={30} height={10} rx={5} fill={P.steelD} /></g>
    ); })}
    <rect x={390} y={1170} width={690} height={60} fill="#5d6675" />
    <rect x={400} y={1230} width={680} height={250} fill="#6b7483" />
    {/* opening to the aisle on the left */}
    <rect x={30} y={420} width={340} height={1060} fill="#0b0f18" />
    <g>
      {aisleZ > 0 && Array.from({length: 3}, (_, i) => (
        <g key={i} opacity={aisleZ}>
          <circle cx={120 + i * 100} cy={820 + i * 30} r={120} fill="url(#redglow)" />
          <Person t={t} seed={i + 5} x={120 + i * 95} y={1480 - i * 40} s={0.55 + i * 0.08} top={['#6b4c8a', '#3d6e9e', '#9a4b3d'][i]} hair="#2a1d16" zombie armL={-70} armR={-80} tilt={i * 6 - 6} />
        </g>
      ))}
    </g>
    {/* curtain */}
    <rect x={20} y={392} width={370} height={14} rx={7} fill="#9aa3b2" />
    <Curtain t={t} x={30} y={405} w={40 + 320 * curtain} h={1075} bulge={bulge} />
    {/* cart */}
    <g transform={`translate(${mix(820, 240, cart)} 0)`}>
      <rect x={0} y={1130} width={230} height={350} rx={12} fill="#aeb7c6" />
      <rect x={10} y={1140} width={210} height={330} rx={8} fill="#c2cad6" />
      <rect x={0} y={1200} width={230} height={22} fill={P.red} />
      {Array.from({length: 3}, (_, i) => <rect key={i} x={30} y={1260 + i * 60} width={170} height={8} rx={4} fill="#9aa3b2" />)}
      <circle cx={30} cy={1490} r={14} fill="#333" /><circle cx={200} cy={1490} r={14} fill="#333" />
    </g>
    {/* ceiling light */}
    <rect x={380} y={300} width={700} height={40} fill="#cfd8ea" opacity={lights} />
    <polygon points="380,340 1080,340 1080,1500 300,1500" fill="url(#cone)" opacity={0.5 * lights} />
    <rect width={1080} height={1920} fill="#050a18" opacity={(1 - lights) * 0.72} />
    {lights < 1 && <g opacity={1 - lights}>{Array.from({length: 8}, (_, i) => <circle key={i} cx={60 + i * 140} cy={1495} r={7} fill="#ffd27a" filter="url(#glow)" />)}</g>}
  </g>
);
const Curtain: React.FC<{t: number; x: number; y: number; w: number; h: number; bulge?: number; bx?: number; by?: number; col?: string}> = ({t, x, y, w, h, bulge = 0, bx = 0.5, by = 0.45, col = '#2f3f6b'}) => {
  const n = Math.max(3, Math.round(w / 42));
  const cx = x + w * bx, cy = y + h * by;
  const pts = (fx: number) => Array.from({length: 25}, (_, j) => {
    const yy = y + (h * j) / 24;
    const xx = x + fx;
    const g = Math.exp(-(((xx - cx) / (w * 0.35)) ** 2 + ((yy - cy) / (h * 0.25)) ** 2));
    const sway = Math.sin(t * 1.6 + j * 0.3 + fx * 0.02) * 4;
    return [xx + (xx - cx) * bulge * 0.35 * g + sway, yy + (yy - cy) * bulge * 0.2 * g];
  });
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={col} />
      {Array.from({length: n}, (_, i) => {
        const p = pts((w * (i + 0.5)) / n);
        return <polyline key={i} points={p.map((q) => q.join(',')).join(' ')} fill="none" stroke={i % 2 ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.10)'} strokeWidth={w / n * 0.5} />;
      })}
      {bulge > 0.05 && <ellipse cx={cx} cy={cy} rx={w * 0.3 * bulge} ry={h * 0.2 * bulge} fill="white" opacity={0.12 * bulge} filter="url(#b22)" />}
      {bulge > 0.25 && <g opacity={Math.min(0.55, bulge * 0.6)} fill="#0a0d16" filter="url(#b4)">
        <ellipse cx={cx} cy={cy + 20} rx={70} ry={80} />
        {[-60, -25, 10, 45].map((dx, i) => <rect key={i} x={cx + dx} y={cy - 120 - (i === 0 || i === 3 ? 0 : 20)} width={26} height={100} rx={13} />)}
      </g>}
    </g>
  );
};

// ---------------- cards / HUD ----------------
const RuleCard: React.FC<{t: number; at: number; tag: string; text: string; y?: number}> = ({t, at, tag, text, y = 1440}) => {
  const k = ez(t, at, at + 0.4, back);
  if (t < at) return null;
  return (
    <div style={{position: 'absolute', left: 120, right: 120, top: y, transform: `translateY(${(1 - k) * 80}px) rotate(${(1 - k) * -6 - 1.5}deg) scale(${0.85 + 0.15 * k})`, opacity: Math.min(1, k * 1.5),
      background: P.cream, borderRadius: 12, padding: '26px 30px 30px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', textAlign: 'center'}}>
      <div style={{display: 'inline-block', background: P.red, color: 'white', fontFamily: OSW, fontWeight: 700, fontSize: 26, padding: '4px 16px', borderRadius: 30, letterSpacing: 1}}>{tag}</div>
      <div style={{fontFamily: OSW, fontWeight: 700, fontSize: 50, color: '#1b1b1b', marginTop: 12, lineHeight: 1.1, textTransform: 'uppercase'}}>{text.slice(0, Math.round(text.length * ez(t, at + 0.15, at + 0.75, Easing.linear)))}</div>
    </div>
  );
};
const GlassCard: React.FC<{t: number; at: number; title: string; rows: string[]; rowAt: number[]; y?: number; col?: string}> = ({t, at, title, rows, rowAt, y = 300, col = P.amber}) => {
  const k = ez(t, at, at + 0.35, back);
  if (t < at) return null;
  return (
    <div style={{position: 'absolute', left: 150, right: 150, top: y, transform: `scale(${0.8 + 0.2 * k})`, opacity: k, background: 'rgba(10,14,24,0.82)', border: `2px solid ${col}88`, borderRadius: 18, padding: '24px 34px'}}>
      <div style={{fontFamily: OSW, fontWeight: 700, color: col, fontSize: 30, letterSpacing: 3, textAlign: 'center', marginBottom: 10}}>{title}</div>
      {rows.map((r, i) => { const rk = ez(t, rowAt[i], rowAt[i] + 0.25, back); return (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: OSW, fontWeight: 500, fontSize: 40, color: 'white', opacity: rk, transform: `translateX(${(1 - rk) * -40}px)`, margin: '8px 0'}}>
          <span style={{width: 40, height: 40, borderRadius: 8, background: P.green, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, transform: `scale(${rk})`}}>✓</span>{r}
        </div>
      ); })}
    </div>
  );
};
const Timer: React.FC<{t: number}> = ({t}) => {
  const at = 45.7;
  if (t < at || t > 67.7) return null;
  const k = ez(t, at, at + 0.4, back);
  const left = Math.max(0, 40 * 60 - Math.max(0, t - 46.2) * 3);
  const mm = Math.floor(left / 60), ss = Math.floor(left % 60);
  return (
    <div style={{position: 'absolute', right: 50, top: 70, transform: `scale(${k})`, transformOrigin: 'top right', background: 'rgba(10,14,24,0.85)', border: `2px solid ${P.amber}`, borderRadius: 14, padding: '10px 22px', textAlign: 'right'}}>
      <div style={{fontFamily: OSW, fontWeight: 500, fontSize: 22, color: P.amber, letterSpacing: 2}}>✈ LANDING IN</div>
      <div style={{fontFamily: OSW, fontWeight: 700, fontSize: 56, color: 'white', lineHeight: 1}}>{mm}:{String(ss).padStart(2, '0')}</div>
    </div>
  );
};
const HUD: React.FC<{t: number}> = ({t}) => {
  if (t > 67.7) return null;
  const big = 1 - ez(t, 2.7, 3.2);
  const min = 14 + Math.floor(t / 9);
  const clock = `2:${String(min).padStart(2, '0')} AM`;
  return (
    <>
      {big > 0.01 && <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: big, transform: `scale(${0.6 + 0.4 * ez(t, 0.15, 0.5, back)})`}}>
        <div style={{display: 'inline-block', background: P.red, color: 'white', fontFamily: OSW, fontWeight: 700, fontSize: 34, padding: '4px 18px', letterSpacing: 2, borderRadius: 4}}>ZOMBIE OUTBREAK</div>
        <div style={{fontFamily: OSW, fontWeight: 700, fontSize: 130, color: 'white', lineHeight: 1.05, textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>DAY 1</div>
        <div style={{display: 'inline-block', background: 'rgba(0,0,0,0.6)', color: 'white', fontFamily: OSW, fontWeight: 500, fontSize: 28, padding: '2px 16px', borderRadius: 20}}>{clock} · 35,000 FT</div>
      </div>}
      <div style={{position: 'absolute', left: 50, top: 70, opacity: 1 - big}}>
        <div style={{fontFamily: OSW, fontWeight: 700, fontSize: 24, color: P.red, letterSpacing: 2}}>● DAY 1</div>
        <div style={{fontFamily: OSW, fontWeight: 700, fontSize: 44, color: 'white', lineHeight: 1}}>{clock}</div>
        <div style={{fontFamily: OSW, fontWeight: 500, fontSize: 20, color: '#9fb0cc', letterSpacing: 2}}>35,000 FT</div>
      </div>
      <Timer t={t} />
    </>
  );
};

// ---------------- captions ----------------
const LINES = [{from: 32.85, to: 33.6, c: P.pink}, {from: 43.35, to: 46.3, c: P.amber}, {from: 57.25, to: 60.1, c: P.pink}];
const RED = /^(zombie|back|coughing|screaming|never|scratch|bleeding|fresh|nobody|they|turns|again|hits|aisle|no)/i;
const AMB = /^(plane|4c|31|cockpit|reinforced|locked|forward|galley|curtain|cart|lights|40|paper|captain|code|door|you\.|answer|yes)/i;
type Chunk = {w: [string, number, number][]; from: number; to: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = []; let cur: [string, number, number][] = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const nx = WORDS[i + 1];
    if (cur.length >= 4 || /[.,?!]$/.test(w[0]) || !nx || nx[1] - w[2] > 0.35) { out.push({w: cur, from: cur[0][1] - 0.04, to: nx ? nx[1] - 0.04 : w[2] + 0.6}); cur = []; }
  });
  return out;
})();
const Captions: React.FC<{t: number}> = ({t}) => {
  if (t > 69.45) return null;
  const c = CHUNKS.find((x) => t >= x.from && t < x.to);
  if (!c) return null;
  const line = LINES.find((l) => c.from >= l.from && c.from < l.to);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1215, textAlign: 'center', fontFamily: OSW, fontWeight: 700, fontSize: 66, lineHeight: 1.1, textTransform: 'uppercase'}}>
      {c.w.map(([w, s], i) => {
        const k = ez(t, s - 0.03, s + 0.12, Easing.out(Easing.quad));
        const col = line ? line.c : RED.test(w) ? P.red : AMB.test(w) ? P.amber : 'white';
        return <span key={i} style={{display: 'inline-block', marginRight: 16, color: col, opacity: Math.max(0.0, k), transform: `translateY(${(1 - k) * 18}px) scale(${0.9 + 0.1 * k})`,
          textShadow: '0 4px 0 rgba(0,0,0,0.85), 0 0 24px rgba(0,0,0,0.7)', WebkitTextStroke: '3px rgba(0,0,0,0.75)', paintOrder: 'stroke fill'}}>{w}</span>;
      })}
    </div>
  );
};

// ---------------- shots ----------------
type Cam = {z?: [number, number]; x?: [number, number]; y?: [number, number]; drift?: number; hits?: number[]; ease?: (n: number) => number};
type Shot = {from: number; to: number; cam: Cam; draw: (t: number, k: number) => React.ReactNode; over?: (t: number) => React.ReactNode};
const you = (t: number, extra: Partial<PP> = {}) => <Person t={t} top={P.you} hair={P.youHair} hood {...extra} />;
const nadia = (t: number, extra: Partial<PP> = {}) => <Person t={t} top={P.nadia} hair={P.nadiaHair} bun scarf pants="#1a2238" seed={2} {...extra} />;

const SeatYou: React.FC<{t: number; k: number}> = ({t, k}) => {
  const look = ez(t, 5.6, 6.1);
  return (
    <g>
      <rect width={1080} height={1920} fill="#1a2335" />
      {/* window */}
      <g transform="translate(110 520)">
        <rect width={260} height={360} rx={120} fill="#3a465e" />
        <rect x={20} y={20} width={220} height={320} rx={105} fill="#0a1222" />
        <circle cx={150} cy={110} r={26} fill="#f4f1e2" filter="url(#glow)" />
        {Array.from({length: 4}, (_, i) => <ellipse key={i} cx={((i * 90 - t * 40) % 300 + 300) % 300 - 20} cy={250 + i * 18} rx={70} ry={14} fill="#33405e" />)}
      </g>
      <polygon points="640,250 760,250 1000,1500 380,1500" fill="url(#cone)" opacity={0.65} />
      <Dust t={t} x={420} y={300} w={560} h={1100} />
      {/* seat */}
      <rect x={430} y={620} width={460} height={1000} rx={80} fill={P.seat} />
      <rect x={450} y={630} width={420} height={200} rx={60} fill={P.seatHi} />
      <g transform="translate(660 1640) scale(1.35)">{you(t, {face: {look: [mix(0.2, 1, look), mix(0, -0.2, look)], brow: mix(0, 0.8, look), mouth: look > 0.5 ? 'flat' : 'flat'}, armL: 20, armR: -25, tilt: look * 6})}</g>
      <rect x={380} y={1500} width={700} height={420} rx={40} fill="#2a3150" />
      <rect x={350} y={1480} width={760} height={40} rx={20} fill="#3a4466" />
    </g>
  );
};
const CrossSection: React.FC<{t: number; k: number}> = ({t, k}) => (
  <g>
    <rect width={1080} height={1920} fill="url(#sky)" />
    <g transform={`translate(${mix(-250, -2650, k)} 640) scale(1.5)`}>
      <rect x={0} y={0} width={2500} height={420} rx={200} fill="#c9d0db" />
      <rect x={40} y={40} width={2420} height={340} rx={170} fill="#1c2536" />
      {Array.from({length: 34}, (_, i) => {
        const x = 260 + i * 62, row = i + 1, hot = row === 31 || row === 4;
        return <g key={i}>
          <rect x={x} y={170} width={40} height={140} rx={10} fill={row === 31 ? P.red : row === 4 ? P.amber : P.seat} opacity={hot ? 1 : 0.9} />
          <circle cx={x + 18} cy={160} r={17} fill={row === 31 ? '#8fa877' : row === 4 ? P.youHair : '#5a4a3a'} opacity={rnd(i) > 0.15 || hot ? 1 : 0} />
        </g>;
      })}
      <rect x={60} y={90} width={150} height={260} rx={20} fill="#3a465e" />
      <rect x={2300} y={90} width={140} height={260} rx={20} fill="#3a2f3a" />
      <Tag x={260 + 3 * 62 + 20} y={100} text="4C · YOU" col={P.amber} show={ez(t, 9.0, 9.3, back)} />
      <Tag x={260 + 30 * 62 + 20} y={100} text="ROW 31" col={P.red} show={ez(t, 11.4, 11.7, back)} />
      <circle cx={260 + 30 * 62 + 20} cy={240} r={90 + 30 * Math.sin(t * 6)} fill="url(#redglow)" opacity={ez(t, 11.4, 11.8)} />
    </g>
  </g>
);
const Tag: React.FC<{x: number; y: number; text: string; col: string; show: number}> = ({x, y, text, col, show}) => (
  <g transform={`translate(${x} ${y}) scale(${show})`} opacity={show}>
    <line x1={0} y1={0} x2={0} y2={-60} stroke={col} strokeWidth={4} />
    <rect x={-110} y={-130} width={220} height={70} rx={35} fill="rgba(10,14,24,0.9)" stroke={col} strokeWidth={4} />
    <text x={0} y={-82} textAnchor="middle" fontFamily={OSW} fontWeight={700} fontSize={36} fill={col}>{text}</text>
  </g>
);
const Row31: React.FC<{t: number}> = ({t}) => {
  const cough = [12.1, 12.55, 12.95].reduce((a, c) => a + (t > c && t < c + 0.3 ? Math.sin((t - c) * 30) * (1 - (t - c) / 0.3) : 0), 0);
  return (
    <g>
      <rect width={1080} height={1920} fill="#141b29" />
      <circle cx={540} cy={800} r={600} fill="url(#cool)" />
      <rect x={180} y={700} width={420} height={1000} rx={70} fill={P.seat} />
      <g transform={`translate(${520 + cough * 10} ${1650 + cough * 6}) scale(1.3)`}>
        <Person t={t} top="#7a6a5a" hair="#5a4a3a" skin="#d8b896" face={{look: [0, 0.5], brow: 0.9, mouth: cough > 0.1 ? 'open' : 'o', wide: 0.7}} armR={-150 + cough * 10} armL={10} tilt={-8 + cough * 6} sit seed={4} />
      </g>
      <rect x={640} y={680} width={420} height={1020} rx={70} fill={P.seat} filter="url(#b10)" />
      <rect y={1650} width={1080} height={270} fill="#1a2236" />
    </g>
  );
};
const CockpitDoor: React.FC<{t: number; lock: number}> = ({t, lock}) => (
  <g>
    <rect width={1080} height={1920} fill="#1d2738" />
    <rect x={0} y={1500} width={1080} height={420} fill="#161c27" />
    <rect x={250} y={380} width={580} height={1120} rx={14} fill="#4d5a70" />
    <rect x={280} y={410} width={520} height={1060} rx={10} fill="#5b6a83" />
    {Array.from({length: 6}, (_, i) => <circle key={i} cx={i % 2 ? 770 : 310} cy={480 + Math.floor(i / 2) * 420} r={12} fill="#3a4559" />)}
    <rect x={350} y={520} width={380} height={70} rx={8} fill="#2a3346" />
    <text x={540} y={568} textAnchor="middle" fontFamily={OSW} fontWeight={700} fontSize={40} fill="#cfd8ea" letterSpacing={4}>CREW ONLY</text>
    {/* keypad */}
    <rect x={640} y={860} width={130} height={200} rx={10} fill="#222a38" />
    {Array.from({length: 9}, (_, i) => <rect key={i} x={655 + (i % 3) * 38} y={900 + Math.floor(i / 3) * 44} width={30} height={34} rx={5} fill="#3a4559" />)}
    <circle cx={705} cy={880} r={9} fill={lock > 0.5 ? P.red : P.green} filter="url(#glow)" />
    {/* bolts sliding */}
    {[700, 1000, 1300].map((y, i) => <rect key={i} x={800 - 70 * lock} y={y} width={90} height={26} rx={6} fill="#c2cad6" opacity={0.9} />)}
    <ellipse cx={540} cy={1500} rx={500} ry={60} fill="black" opacity={0.3} />
    <polygon points="440,250 640,250 900,1500 180,1500" fill="url(#cone)" opacity={0.35} />
    <Dust t={t} x={200} y={300} w={700} h={1200} n={20} />
  </g>
);
const PA: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect width={1080} height={1920} fill="#0f1522" />
    {Array.from({length: 4}, (_, i) => { const p = ((t * 0.9 + i * 0.25) % 1); return <circle key={i} cx={540} cy={800} r={240 + p * 420} fill="none" stroke={P.amber} strokeWidth={6} opacity={(1 - p) * 0.5} />; })}
    <circle cx={540} cy={800} r={240} fill="#c9ced8" />
    <circle cx={540} cy={800} r={215} fill="#aeb4c0" />
    {Array.from({length: 120}, (_, i) => { const a = i * 2.39996, r = Math.sqrt(i / 120) * 190; return <circle key={i} cx={540 + Math.cos(a) * r} cy={800 + Math.sin(a) * r} r={9} fill="#2b2f38" />; })}
    <circle cx={720} cy={630} r={14} fill={P.amber} opacity={0.6 + 0.4 * Math.sin(t * 8)} filter="url(#glow)" />
  </g>
);
const Huddle: React.FC<{t: number; k: number}> = ({t, k}) => (
  <g>
    <Galley t={t} curtain={1} cart={1} lights={0} bulge={0.15 + 0.15 * Math.max(0, Math.sin(t * 3.1))} />
    <g transform="translate(560 1560) scale(0.95)">{you(t, {sit: true, face: {look: [-0.8, 0], brow: 0.8, mouth: 'flat'}, armL: -20, armR: -60})}</g>
    <g transform="translate(860 1560) scale(-0.92 0.92)">{nadia(t, {sit: true, face: {look: [0.6, 0.3], brow: 0.9, mouth: 'frown'}, armL: 30, armR: -20})}</g>
    <circle cx={700} cy={1100} r={420} fill="url(#cool)" opacity={0.6} />
  </g>
);
const Sleeve: React.FC<{t: number; k: number}> = ({t, k}) => {
  const up = ez(t, 54.7, 55.2);
  const pulse = 0.6 + 0.4 * Math.sin(t * 7);
  return (
    <g>
      <rect width={1080} height={1920} fill="#10151f" />
      <circle cx={540} cy={900} r={700} fill="url(#cool)" opacity={0.5} />
      <g transform="rotate(-18 540 960)">
        <rect x={60} y={760} width={1000} height={300} rx={150} fill={P.skin} />
        <rect x={930} y={770} width={220} height={280} rx={120} fill={P.skin} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${420 + i * 60},${830 + i * 6} L${560 + i * 60},${980 + i * 6}`} stroke="#b0182a" strokeWidth={14} strokeLinecap="round" opacity={0.9} />)}
        {[0, 1, 2].map((i) => <path key={'g' + i} d={`M${420 + i * 60},${830 + i * 6} L${560 + i * 60},${980 + i * 6}`} stroke="#ff3b3b" strokeWidth={30} strokeLinecap="round" opacity={0.25 * pulse} filter="url(#b10)" />)}
        <path d="M520,930 q8,40 0,70" stroke="#b0182a" strokeWidth={10} fill="none" strokeLinecap="round" opacity={up} />
        <rect x={mix(-100, -520, up)} y={740} width={760} height={340} rx={60} fill={P.nadia} />
        <rect x={mix(620, 200, up)} y={740} width={40} height={340} fill="#2b3a66" />
      </g>
    </g>
  );
};
const Keypad: React.FC<{t: number}> = ({t}) => {
  const press = Math.floor(Math.max(0, t - 60.4) / 0.35);
  return (
    <g>
      <rect width={1080} height={1920} fill="#2a3346" />
      <rect x={240} y={420} width={600} height={900} rx={30} fill="#1a202c" />
      <rect x={290} y={470} width={500} height={130} rx={14} fill="#0b2014" />
      <text x={540} y={560} textAnchor="middle" fontFamily={OSW} fontWeight={700} fontSize={80} fill={P.green} letterSpacing={20}>{'• • • •'.slice(0, Math.min(7, press * 2 + 1))}</text>
      {Array.from({length: 12}, (_, i) => <g key={i}><rect x={300 + (i % 3) * 165} y={650 + Math.floor(i / 3) * 160} width={145} height={140} rx={16} fill={press % 12 === i && t > 60.4 ? '#5a6a86' : '#3a4559'} /><text x={372 + (i % 3) * 165} y={740 + Math.floor(i / 3) * 160} textAnchor="middle" fontFamily={OSW} fontSize={54} fill="#cfd8ea">{'123456789*0#'[i]}</text></g>)}
      <circle cx={540} cy={430} r={14} fill={P.red} filter="url(#glow)" />
      <g transform={`translate(${mix(900, 470 + (press % 3) * 165, ez(t, 60.3, 60.6))} ${mix(1500, 820 + (press % 4) * 120, ez(t, 60.3, 60.6))}) rotate(-20)`}>
        <rect x={-40} y={0} width={80} height={600} rx={40} fill={P.skin} />
        <rect x={-60} y={300} width={120} height={500} rx={30} fill={P.nadia} />
        <path d="M-30,140 l60,40" stroke="#b0182a" strokeWidth={8} strokeLinecap="round" />
      </g>
    </g>
  );
};
const EndCard: React.FC<{t: number}> = ({t}) => {
  const q = ez(t, 69.5, 69.9, back), y = ez(t, 70.35, 70.6, back), n = ez(t, 71.5, 71.75, back);
  const knock = [72.3, 72.7, 73.1].some((c) => t > c && t < c + 0.12);
  return (
    <AbsoluteFill>
      <Svg>
        <rect width={1080} height={1920} fill="#05070c" />
        <rect x={340} y={600} width={400} height={1000} fill="#0c1220" />
        <rect x={340} y={1590} width={400} height={14} fill="#ffd27a" filter="url(#glow)" opacity={0.6 + 0.4 * Math.sin(t * 3)} />
        <ellipse cx={540} cy={1640} rx={300} ry={40} fill="url(#warm)" />
        <g opacity={0.5}><Person t={t} x={540} y={1595} s={0.75} top={P.nadia} hair={P.nadiaHair} bun back /></g>
      </Svg>
      <AbsoluteFill style={{transform: knock ? 'translate(6px, -4px)' : undefined}}>
        <div style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', transform: `scale(${ez(t, 67.8, 68.2, back)})`}}>
          <div style={{fontFamily: OSW, fontWeight: 700, fontSize: 170, color: 'white', lineHeight: 1}}>PART 2</div>
          <div style={{width: 260, height: 6, background: P.red, margin: '10px auto'}} />
        </div>
        <div style={{position: 'absolute', top: 640, left: 80, right: 80, textAlign: 'center', fontFamily: OSW, fontWeight: 700, fontSize: 74, color: P.amber, lineHeight: 1.05, opacity: q, transform: `scale(${0.8 + 0.2 * q})`}}>DO YOU TELL<br />THE CAPTAIN?</div>
        <div style={{position: 'absolute', top: 860, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40}}>
          <div style={{transform: `scale(${y})`, background: P.green, color: 'white', fontFamily: OSW, fontWeight: 700, fontSize: 64, padding: '10px 60px', borderRadius: 60}}>YES</div>
          <div style={{transform: `scale(${n})`, background: P.red, color: 'white', fontFamily: OSW, fontWeight: 700, fontSize: 64, padding: '10px 60px', borderRadius: 60}}>NO</div>
        </div>
        <div style={{position: 'absolute', top: 1010, left: 0, right: 0, textAlign: 'center', fontFamily: OSW, fontWeight: 500, fontSize: 36, color: '#cfd8ea', letterSpacing: 2, opacity: ez(t, 68.0, 68.5)}}>PART 2 STARTS WITH YOUR ANSWER</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const FA = {top: P.nadia, hair: '#2a1d16', bun: true, scarf: true};
const SHOTS: Shot[] = [
  {from: 0, to: 2.96, cam: {z: [1.18, 1.05], y: [40, 0]}, draw: (t) => <Exterior t={t} />},
  {from: 2.96, to: 4.24, cam: {z: [1.05, 1.25], drift: 1.2, hits: [2.96]}, draw: (t) => <><Aisle t={t} heads rearGlow={0.8} walkers={[{d: 4.1, x: 0, top: '#7a6a5a', hair: '#5a4a3a', zombie: true, armL: -60, armR: -70}]} /><FgSeats px={(t - 2.96) * -30} /></>},
  {from: 4.24, to: 8.88, cam: {z: [1.05, 1.28], x: [0, -40], y: [0, 60]}, draw: (t, k) => <SeatYou t={t} k={k} />},
  {from: 8.88, to: 12.0, cam: {z: [1.0, 1.06]}, draw: (t, k) => <CrossSection t={t} k={ez(t, 9.4, 11.6)} />},
  {from: 12.0, to: 13.34, cam: {z: [1.1, 1.3], y: [0, 120], hits: [12.1, 12.55, 12.95]}, draw: (t) => <Row31 t={t} />},
  {from: 13.34, to: 16.86, cam: {z: [1.08, 1.22], drift: 0.8}, draw: (t) => {
    const k = ez(t, 13.4, 15.6, Easing.inOut(Easing.quad));
    const gone = ez(t, 15.5, 15.9);
    return <><Aisle t={t} heads rearGlow={0.55} walkers={gone < 1 ? [{d: mix(0.25, 3.8, k), x: 0, ...FA, back: true, walk: t * 7, armL: 50, armR: -10}] : []} /><g opacity={gone}><circle cx={540} cy={VPY} r={90} fill="url(#redglow)" /></g><FgSeats px={(t - 13.34) * -20} /></>;
  }},
  {from: 16.86, to: 20.04, cam: {z: [1.25, 1.08], hits: [16.86, 17.2, 18.4]}, draw: (t) => <><Aisle t={t} mood="red" stand={ez(t, 18.3, 19.6)} rearGlow={1} /><FgSeats px={0} /></>},
  {from: 20.04, to: 22.1, cam: {z: [1.05, 1.12], drift: 1.4}, draw: (t) => {
    const k = ez(t, 20.0, 22.4, Easing.linear);
    return <><Aisle t={t} mood="red" stand={1} empty={0.5} rearGlow={1} walkers={Array.from({length: 6}, (_, i) => ({d: 0.3 + k * 2.6 + i * 0.35, x: (i % 2 ? 50 : -50), top: ['#6b4c8a', '#3d6e9e', '#9a4b3d', '#4b7a4b', '#7a7a8a', '#8a6a3a'][i], hair: '#2a1d16', back: true, walk: t * 9 + i, armL: 30, armR: -40}))} /><FgSeats px={k * -60} /></>;
  }},
  {from: 22.1, to: 22.94, cam: {z: [1.12, 1.28], hits: [22.1]}, draw: (t) => (
    <g>
      <g filter="url(#b10)"><Aisle t={t} mood="red" stand={1} rearGlow={1} walkers={Array.from({length: 5}, (_, i) => ({d: 1.2 + i * 0.3 + (t - 22) * 0.8, x: i % 2 ? 60 : -60, top: '#6b4c8a', hair: '#2a1d16', back: true, walk: t * 9 + i}))} /></g>
      <g transform="translate(540 2050) scale(1.9)">{you(t, {face: {look: [0, -0.1], brow: -0.8, mouth: 'flat'}, armL: 6, armR: -6})}</g>
    </g>
  )},
  {from: 22.94, to: 26.8, cam: {z: [1.0, 1.35], y: [0, -40], drift: 0.8}, draw: (t) => <CockpitDoor t={t} lock={0} />},
  {from: 26.8, to: 30.5, cam: {z: [1.4, 1.55], x: [-60, -120], y: [20, 40], hits: [27.22, 29.34]}, draw: (t) => <CockpitDoor t={t} lock={ez(t, 27.1, 27.5, back)} />},
  {from: 30.5, to: 32.9, cam: {z: [1.05, 1.1], x: [60, -60]}, draw: (t) => {
    const k = ez(t, 30.5, 32.8, Easing.inOut(Easing.quad));
    return <><Galley t={t} />{nadia(t, {x: 760, y: 1500, s: 0.95, face: {look: [-0.8, 0], brow: 0, mouth: 'flat'}, armL: 20, armR: -10})}<g>{you(t, {x: mix(-150, 330, k), y: 1530, s: 1.0, walk: k < 0.98 ? t * 8 : undefined, face: {look: [1, 0], brow: 0.6}})}</g></>;
  }},
  {from: 32.9, to: 34.0, cam: {z: [3.0, 3.2], x: [-640, -690], y: [-340, -370], hits: [32.95]}, draw: (t) => <><Galley t={t} />{nadia(t, {x: 760, y: 1500, s: 0.95, face: {look: [-1, 0], brow: -1, mouth: 'open'}, armL: 20, armR: -100})}</>},
  {from: 34.0, to: 34.8, cam: {z: [3.2, 3.5], x: [-690, -750], y: [-370, -400]}, draw: (t) => <><Galley t={t} />{nadia(t, {x: 760, y: 1500, s: 0.95, face: {look: [-1, -0.2], brow: 1, mouth: 'o', wide: 1.35}, armL: 20, armR: -30, tilt: -6})}</>},
  {from: 34.8, to: 36.06, cam: {z: [1.05, 1.25], drift: 1.6, hits: [34.8]}, draw: (t) => {
    const k = ez(t, 34.8, 36.1, Easing.linear);
    return <><Aisle t={t} mood="dark" rearGlow={0.9} empty={0.6} walkers={Array.from({length: 4}, (_, i) => ({d: mix(2.2, 0.9, k) + i * 0.45, x: [-40, 60, -70, 30][i], top: ['#6b4c8a', '#3d6e9e', '#9a4b3d', '#7a6a5a'][i], hair: '#2a1d16', zombie: true, walk: t * 5 + i, armL: -70, armR: -80}))} /><FgSeats px={0} dark /></>;
  }},
  {from: 36.06, to: 39.8, cam: {z: [1.08, 1.0], x: [40, 0], hits: [37.36, 38.62]}, draw: (t) => <><Galley t={t} curtain={ez(t, 36.1, 36.6, Easing.out(Easing.cubic))} cart={ez(t, 37.3, 37.85, Easing.out(Easing.back(1.2)))} lights={1 - ez(t, 38.6, 38.7)} aisleZ={1 - ez(t, 36.1, 36.5)} />{nadia(t, {x: 860, y: 1500, s: 0.85, face: {look: [-1, 0], brow: 1, mouth: 'frown'}, armL: 10, armR: -40})}{you(t, {x: 580, y: 1520, s: 0.9, face: {look: [-1, 0], brow: 0.7, mouth: 'grit'}, armL: 60, armR: -60})}</>, over: (t) => <RuleCard t={t} at={37.5} tag="SURVIVAL RULE #1" text="A loaded cart weighs ~100 kg. Brakes on." y={1440} />},
  {from: 39.8, to: 43.42, cam: {z: [1.12, 1.25], drift: 1.4, hits: [40.54, 41.36, 42.72]}, draw: (t) => {
    const b = [40.54, 41.36, 42.72].reduce((a, h) => Math.max(a, t > h ? Math.exp(-(t - h) * 5) : 0), 0);
    return <g>
      <rect width={1080} height={1920} fill="#0b1020" />
      <Curtain t={t} x={60} y={200} w={960} h={1500} bulge={0.15 + b * 1.1} bx={0.45 + 0.1 * Math.sin(t)} by={0.42} />
      <rect x={0} y={170} width={1080} height={30} fill="#7d8796" />
      <g transform={`translate(${200 + b * 30} 0)`}><rect x={0} y={1420} width={680} height={500} rx={18} fill="#8f98a8" /><rect x={0} y={1490} width={680} height={36} fill={P.red} /></g>
      <rect width={1080} height={1920} fill="#050a18" opacity={0.35} />
      {Array.from({length: 7}, (_, i) => <circle key={i} cx={80 + i * 150} cy={1880} r={8} fill="#ffd27a" filter="url(#glow)" />)}
    </g>;
  }},
  {from: 43.42, to: 46.76, cam: {z: [1.0, 1.15], drift: 0.6}, draw: (t) => <PA t={t} />},
  {from: 46.76, to: 49.74, cam: {z: [1.15, 1.05], y: [-60, -20]}, draw: (t, k) => <Huddle t={t} k={k} />},
  {from: 49.74, to: 51.94, cam: {z: [1.05, 1.1]}, draw: (t, k) => <g filter="url(#b10)"><Huddle t={t} k={k} /></g>, over: (t) => <GlassCard t={t} at={49.8} title="ON PAPER" rows={['Cockpit: locked', 'Cart: wedged', 'Landing: 40 min']} rowAt={[50.0, 50.4, 50.8]} y={520} />},
  {from: 51.94, to: 54.72, cam: {z: [1.45, 1.65], x: [-250, -300], y: [-150, -170]}, draw: (t) => {
    const pull = ez(t, 53.6, 53.95, Easing.out(Easing.cubic));
    return <><Galley t={t} curtain={1} cart={1} lights={0.15} />{nadia(t, {x: 760, y: 1500, s: 0.95, face: {look: [mix(0, -0.9, pull), 0.5], brow: 0.9, mouth: 'frown'}, armL: mix(-30, 20, pull), armR: mix(-120, -30, pull), tilt: -4})}<circle cx={760} cy={1000} r={400} fill="url(#cool)" /></>;
  }},
  {from: 54.72, to: 57.32, cam: {z: [1.0, 1.4], hits: [54.72]}, draw: (t, k) => <Sleeve t={t} k={k} />},
  {from: 57.32, to: 60.28, cam: {z: [3.2, 3.45], x: [-680, -740], y: [-360, -390]}, draw: (t) => <><Galley t={t} curtain={1} cart={1} lights={0.1} />{nadia(t, {x: 760, y: 1500, s: 0.95, face: {look: [-0.9, -0.1], brow: 1, mouth: Math.sin(t * 14) > 0 ? 'o' : 'flat', wide: 1.1}, armL: 10, armR: -20, tilt: 4})}<circle cx={600} cy={980} r={260} fill="url(#warm)" opacity={0.5} /></>},
  {from: 60.28, to: 62.82, cam: {z: [1.0, 1.15], drift: 0.6}, draw: (t) => <Keypad t={t} />},
  {from: 62.82, to: 64.34, cam: {z: [1.05, 1.2], hits: [62.85]}, draw: (t) => <Exterior t={t} alarm={1} dive={ez(t, 62.8, 64.3)} />},
  {from: 64.34, to: 67.78, cam: {z: [2.9, 3.3], x: [-55, -65], y: [-400, -450], hits: [66.2]}, draw: (t) => {
    const b = t > 66.2 ? Math.exp(-(t - 66.2) * 3) : 0;
    return <><Galley t={t} curtain={1} cart={1} lights={0.12} bulge={0.2 + b * 1.2} />{you(t, {x: 560, y: 1520, s: 0.95, face: {look: [t < 65.5 ? 1 : -1, 0], brow: 0.9, mouth: b > 0.2 ? 'grit' : 'frown', wide: 1 + b * 0.4}, armL: 10, armR: -10})}<circle cx={560} cy={1000} r={300} fill="url(#cool)" /></>;
  }},
];

const Shots: React.FC<{t: number}> = ({t}) => {
  const s = SHOTS.find((x) => t >= x.from && t < x.to);
  if (!s) return null;
  const k = (t - s.from) / (s.to - s.from);
  const e = (s.cam.ease ?? io)(Math.max(0, Math.min(1, k)));
  const z = s.cam.z ? mix(s.cam.z[0], s.cam.z[1], e) : 1.05;
  const x = s.cam.x ? mix(s.cam.x[0], s.cam.x[1], e) : 0;
  const y = s.cam.y ? mix(s.cam.y[0], s.cam.y[1], e) : 0;
  const d = (s.cam.drift ?? 1) * 1;
  const dx = (Math.sin(t * 0.9) * 7 + Math.sin(t * 2.3) * 2.5) * d, dy = (Math.cos(t * 0.7) * 6 + Math.sin(t * 1.9) * 2) * d;
  let hx = 0, hy = 0, hz = 0;
  for (const h of s.cam.hits ?? []) { const q = t - h; if (q >= 0 && q < 0.45) { const a = (1 - q / 0.45) ** 2; hx += Math.sin(q * 95) * 24 * a; hy += Math.cos(q * 80) * 16 * a; hz += 0.04 * a; } }
  const punch = 0.035 * (1 - ez(t, s.from, s.from + 0.25, Easing.out(Easing.cubic)));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${x + dx + hx}px, ${y + dy + hy}px) scale(${z + hz + punch})`, transformOrigin: '50% 50%'}}>
        <Svg>{s.draw(t, k)}</Svg>
      </AbsoluteFill>
      {s.over?.(t)}
      <AbsoluteFill style={{background: 'black', opacity: 0.5 * (1 - ez(t, s.from, s.from + 0.12))}} />
    </AbsoluteFill>
  );
};

const SFX: Sfx[] = [
  [0, 'swell_hit', 0.6], [2.96, 'impact', 0.5], [8.88, 'click', 0.35], [11.5, 'heartbeat', 0.35], [15.56, 'heartbeat', 0.5], [16.86, 'scream', 0.55], [16.86, 'impact', 0.6],
  [22.1, 'swell_hit', 0.5], [27.22, 'clunk', 0.7], [29.34, 'click', 0.5], [30.6, 'whoosh', 0.25], [32.9, 'whoosh', 0.3], [34.8, 'growl', 0.55],
  [36.06, 'whoosh', 0.5], [37.36, 'rattle', 0.6], [38.62, 'click', 0.6], [38.62, 'boom', 0.3], [40.54, 'impact', 0.8], [41.36, 'impact', 0.8], [41.5, 'growl', 0.4], [42.72, 'impact', 0.9],
  [43.05, 'ding', 0.4], [49.74, 'heartbeat', 0.5], [53.65, 'whoosh', 0.3], [54.72, 'swell_hit', 0.6], [57.3, 'heartbeat', 0.4], [60.4, 'click', 0.3], [60.75, 'click', 0.3], [61.1, 'click', 0.3],
  [62.82, 'alarm', 0.25], [64.34, 'heartbeat', 0.45], [66.2, 'impact', 0.7], [66.25, 'growl', 0.5], [67.78, 'boom', 0.6], [70.35, 'pop', 0.5], [71.5, 'pop', 0.5],
  [72.3, 'impact', 0.35], [72.7, 'impact', 0.35], [73.1, 'impact', 0.35],
];

export const WisPlane: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: 'black'}}>
      {t < 67.78 ? <Shots t={t} /> : <EndCard t={t} />}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none'}} />
      <HUD t={t} />
      <Captions t={t} />
      <Grain />
      <DayAudio job={JOB} sec={WIS_PLANE_SEC} sfx={SFX} musicVol={0.3} />
    </AbsoluteFill>
  );
};

export const WisPlaneThumb: React.FC = () => {
  const t = 66.3;
  return (
    <AbsoluteFill style={{background: 'black'}}>
      <AbsoluteFill style={{transform: 'translate(-30px, -330px) scale(1.7)'}}>
        <Svg><Galley t={t} curtain={1} cart={1} lights={0.25} bulge={1.0} />{you(t, {x: 560, y: 1520, s: 0.95, face: {look: [-1, 0], brow: 1, mouth: 'grit', wide: 1.35}})}<circle cx={560} cy={1000} r={300} fill="url(#cool)" /></Svg>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)'}} />
      <div style={{position: 'absolute', top: 130, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: P.red, color: 'white', fontFamily: OSW, fontWeight: 700, fontSize: 52, padding: '6px 26px', letterSpacing: 3, borderRadius: 6}}>ZOMBIE OUTBREAK</div>
        <div style={{fontFamily: OSW, fontWeight: 700, fontSize: 240, color: 'white', lineHeight: 1, textShadow: '0 10px 40px rgba(0,0,0,0.8)'}}>DAY 1</div>
      </div>
      <div style={{position: 'absolute', bottom: 210, left: 40, right: 40, textAlign: 'center', fontFamily: OSW, fontWeight: 700, fontSize: 110, lineHeight: 1.0, color: 'white', textShadow: '0 8px 30px rgba(0,0,0,0.9)'}}>
        ON A PLANE?<br /><span style={{color: '#C8FF3D'}}>DON'T GO BACK.</span>
      </div>
    </AbsoluteFill>
  );
};
