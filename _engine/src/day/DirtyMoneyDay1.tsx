// DIRTY MONEY — Day 1 (Day Series, 9:16). Armored-truck heist → ink-trap boxes, Form 8300, casino CTR; Mason buys the truck, a sedan waits.
// Low-poly 3D sets keyed to words in dirtyMoneyDay1Words.ts. Voice: Brian narrator, Liam = Mason, Harry = dealer (script .md).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {ACC, Cam, CameraRig, Captions, Card, DayAudio, ease, FONT, Grain, handheld, mix, mix3, Pill, pop, projector, rnd, Sfx, Sky, Stamp, Stars, Tag, useT, V3, Vignette} from './dayKit';
import {Look, Person} from './schoolKit';
import {WORDS} from './dirtyMoneyDay1Words';

export const DM1_SEC = 62.2;
const JOB = 'jobs/dirtymoney-day1';
const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// ---------- story timing (word starts) ----------
const BLUE = 3.96, OPEN = 7.8, RUINED = 10.82, CLEAN = 12.78, MASON1 = 15.12, RULE = 17.16, BURN = 19.86, DAY2 = 21.12, FIFTY = 23.46, ID = 26.12,
  FORM = 27.6, CASINO = 35.3, CHIPS = 36.6, REPORT = 39.62, CAMS = 43.08, DAY3 = 45.14, SEDAN = 48.8, MASON2 = 52.14, END = 53.74;

// ---------- sets: each lives at its own origin, only one is drawn per shot ----------
type Loc = 'road' | 'motel' | 'lot' | 'casino' | 'ext';
const O: Record<Loc, V3> = {road: [0, 0, 0], motel: [100, 0, 0], lot: [200, 0, 0], casino: [300, 0, 0], ext: [400, 0, 0]};
const at = (l: Loc, p: V3): V3 => [O[l][0] + p[0], O[l][1] + p[1], O[l][2] + p[2]];

type Shot = {from: number; to: number; loc: Loc; shake?: number; cam: (k: number) => Cam};
const C = (l: Loc, pos: V3, look: V3, fov = 42): Cam => ({pos: at(l, pos), look: at(l, look), fov});
const lerp = (a: Cam, b: Cam) => (k: number): Cam => ({pos: mix3(a.pos, b.pos, k), look: mix3(a.look, b.look, k), fov: mix(a.fov, b.fov, k)});
const S = (from: number, to: number, loc: Loc, a: [V3, V3, number], b: [V3, V3, number], shake = 0): Shot => ({from, to, loc, shake, cam: lerp(C(loc, ...a), C(loc, ...b))});
const SHOTS: Shot[] = [
  S(0, 2.05, 'road', [[1.6, 1.0, 7.2], [0, 1.0, 3.4], 50], [[1.2, 1.1, 6.4], [0, 1.0, 3.4], 44], 1.4),
  S(2.05, 3.4, 'road', [[-5, 3.2, 10], [0, 1.2, 2], 46], [[-3.5, 2.8, 9], [0, 1.2, 2], 44]),
  S(3.4, 4.8, 'road', [[0.9, 1.6, 5.6], [0.2, 0.5, 3.6], 40], [[0.6, 1.4, 5.0], [0.2, 0.5, 3.6], 34], 0.6),
  S(4.8, 7.18, 'road', [[2.2, 1.2, 5.2], [0, 0.45, 3.6], 38], [[1.4, 1.0, 4.7], [0, 0.45, 3.6], 34]),
  S(7.18, 10.82, 'road', [[0, 2.6, 6.6], [0, 0.6, 3.6], 44], [[0.4, 2.0, 5.6], [0, 0.6, 3.6], 46], 0.8),
  S(10.82, 15.12, 'motel', [[0, 2.8, 3.6], [0, 0.6, 0], 44], [[0.8, 2.2, 2.8], [0, 0.6, 0], 40]),
  S(MASON1, RULE, 'motel', [[-0.4, 1.55, 1.2], [-1.6, 1.5, -0.4], 40], [[-0.6, 1.55, 1.5], [-1.6, 1.5, -0.4], 36]),
  S(RULE, BURN - 0.1, 'motel', [[2.6, 2.4, 3.6], [0, 0.8, 0], 46], [[2.0, 2.0, 3.0], [0, 0.8, 0], 44]),
  S(BURN - 0.1, DAY2, 'motel', [[2.9, 1.1, 1.9], [2.0, 0.6, 0.6], 44], [[2.7, 1.0, 1.6], [2.0, 0.6, 0.6], 38], 0.5),
  S(DAY2, 24.6, 'lot', [[-7, 3.5, 11], [0, 1, 0], 44], [[-4.5, 2.6, 8.5], [0, 1, 0], 42]),
  S(24.6, ID, 'lot', [[3.6, 1.8, 5.2], [3.0, 0.9, 2.4], 40], [[3.4, 1.6, 4.4], [3.0, 0.9, 2.4], 36]),
  S(ID, FORM, 'lot', [[3.5, 1.65, 4.3], [4.0, 1.55, 1.6], 38], [[3.6, 1.62, 3.9], [4.0, 1.55, 1.6], 33]),
  S(FORM, CASINO, 'lot', [[6, 6, 9], [1.5, 0.6, 1], 50], [[4.5, 4.5, 7.5], [1.5, 0.6, 1], 48]),
  S(CASINO, REPORT, 'casino', [[0, 2.4, 8], [0, 1, 0], 48], [[0.5, 1.9, 5.5], [0, 1, 0], 44]),
  S(REPORT, CAMS, 'casino', [[-2.4, 1.6, 2.4], [-3, 1.5, -2.5], 44], [[-2.2, 1.6, 1.6], [-3, 1.5, -2.5], 40]),
  S(CAMS, DAY3, 'casino', [[0, 1.2, 4], [0, 3.6, -1], 58], [[0, 1.1, 3.2], [0, 3.7, -1], 52], 0.4),
  S(DAY3, SEDAN, 'ext', [[0.5, 1.8, 8], [-2.8, 1, 2.2], 46], [[0, 1.7, 7], [-2.8, 1, 2.2], 42]),
  S(SEDAN, MASON2, 'ext', [[1.2, 2.0, 2.2], [6, 0.8, 9], 42], [[1.6, 1.9, 2.8], [6, 0.8, 9], 34]),
  S(MASON2, END, 'ext', [[-0.3, 1.6, 3.4], [-1.6, 1.5, 0.9], 40], [[-0.5, 1.6, 3.7], [-1.6, 1.5, 0.9], 36]),
  S(END, DM1_SEC + 1, 'ext', [[3, 1.4, 4.5], [6, 0.9, 9], 48], [[3.4, 1.3, 5.3], [6, 0.9, 9], 40]),
];
const shotAt = (t: number) => Math.max(0, SHOTS.findIndex((s) => t >= s.from && t < s.to));
const camAt = (t: number): Cam => {
  const s = SHOTS[shotAt(t)];
  const c = handheld(s.cam(ease(t, s.from, s.to, Easing.inOut(Easing.sin))), t, 0.8);
  const sh = (s.shake ?? 0) * 0.02 * Math.max(0, 1 - (t - s.from) / 1.2);
  return sh ? {...c, pos: [c.pos[0] + Math.sin(t * 37) * sh, c.pos[1] + Math.sin(t * 43 + 1) * sh, c.pos[2]]} : c;
};

// ---------- cast ----------
const L = {
  you: {skin: '#d9a27a', top: '#1f2328', bottom: '#2b3445', hair: '#141010', shoes: '#d8d8d8'},
  mason: {skin: '#f0c6a2', top: '#7a2e2e', bottom: '#30384a', hair: '#c99a50'},
  dealer: {skin: '#a8714e', top: '#dfe6ee', bottom: '#2b2b2b', hair: '#3a2a20'},
  teller: {skin: '#e3b08a', top: '#2a2a40', bottom: '#202020', hair: '#1d1410'},
} satisfies Record<string, Look>;

// ---------- props ----------
const M: React.FC<{c: string; e?: number}> = ({c, e = 0}) => <meshStandardMaterial color={c} emissive={c} emissiveIntensity={e} flatShading roughness={0.7} />;
const B: React.FC<{p: V3; s: V3; c: string; e?: number; r?: V3}> = ({p, s, c, e, r}) => <mesh position={p} rotation={r}><boxGeometry args={s} /><M c={c} e={e} /></mesh>;
const Wheel: React.FC<{p: V3}> = ({p}) => <mesh position={p} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.4, 0.4, 0.3, 10]} /><M c="#141414" /></mesh>;
const Ground: React.FC<{c: string; s?: number}> = ({c, s = 80}) => <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[s, s]} /><M c={c} /></mesh>;
// one bundle of bills; `blue` 0..1 = ink stain
const STACK_GREEN = new THREE.Color('#7fae6a'), STACK_BLUE = new THREE.Color('#1f5bd8');
const Stack: React.FC<{p: V3; blue?: number; r?: number}> = ({p, blue = 0, r = 0}) => (
  <group position={p} rotation={[0, r, 0]}>
    <mesh><boxGeometry args={[0.3, 0.12, 0.14]} /><meshStandardMaterial color={STACK_GREEN.clone().lerp(STACK_BLUE, blue)} flatShading /></mesh>
    <mesh><boxGeometry args={[0.06, 0.125, 0.145]} /><meshStandardMaterial color={blue > 0.5 ? '#123a8a' : '#e8e2c8'} /></mesh>
  </group>
);
const Box: React.FC<{p: V3; open?: number; blue?: number}> = ({p, open = 0, blue = 0}) => (
  <group position={p}>
    <B p={[0, 0.2, 0]} s={[0.7, 0.4, 0.5]} c="#8a9098" />
    <group position={[0, 0.4, -0.25]} rotation={[-open * 1.9, 0, 0]}><B p={[0, 0.02, 0.25]} s={[0.72, 0.05, 0.52]} c="#9aa0a8" /></group>
    {blue > 0 && <mesh position={[0, 0.41, 0]}><boxGeometry args={[0.6, 0.02, 0.4]} /><meshBasicMaterial color="#2a6bff" /></mesh>}
  </group>
);
// ink burst: blue particles spraying out of the box, then hanging as a cloud
const Ink: React.FC<{p: V3; t: number; t0: number; n?: number}> = ({p, t, t0, n = 40}) => {
  if (t < t0) return null;
  const k = t - t0;
  return <group position={p}>{Array.from({length: n}, (_, i) => {
    const a = rnd(i + 11) * Math.PI * 2, v = 0.6 + rnd(i + 22) * 1.6, up = 1.5 + rnd(i + 33) * 2.2, d = Math.min(k, 1.4);
    const y = Math.max(0.05, 0.4 + up * d - 2.2 * d * d * 0.5);
    return <mesh key={i} position={[Math.cos(a) * v * d, y, Math.sin(a) * v * d]} scale={0.05 + Math.min(1, k) * 0.09 * (1 + rnd(i))}><icosahedronGeometry args={[1, 0]} /><meshBasicMaterial color={i % 3 ? '#2a6bff' : '#5cc8ff'} transparent opacity={Math.max(0.25, 1 - k * 0.25)} /></mesh>;
  })}<pointLight position={[0, 1, 0]} intensity={Math.max(0, 5 - k * 3)} distance={6} color="#3a7bff" /></group>;
};
const Fire: React.FC<{p: V3; t: number; k: number}> = ({p, t, k}) => k <= 0 ? null : (
  <group position={p}>
    {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[Math.sin(i * 2.1) * 0.12, 0.25 + 0.1 * Math.sin(t * 14 + i), Math.cos(i * 2.1) * 0.12]} scale={[1, k * (0.8 + 0.3 * Math.sin(t * 11 + i * 1.7)), 1]}><coneGeometry args={[0.13, 0.6, 5]} /><meshBasicMaterial color={i % 2 ? '#ffb23d' : '#ff6a2a'} /></mesh>)}
    <pointLight position={[0, 0.8, 0]} intensity={4 * k * (0.85 + 0.15 * Math.sin(t * 23))} distance={6} color="#ff8a3a" />
  </group>
);

const Van: React.FC<{doors: number}> = ({doors}) => (
  <group>
    <B p={[0, 1.35, -0.6]} s={[2.1, 2.1, 4.2]} c="#c9ccd0" />
    <B p={[0, 1.0, -0.6]} s={[2.12, 0.25, 4.22]} c="#1d4f8a" />
    <B p={[0, 1.05, -3.4]} s={[2.0, 1.4, 1.5]} c="#b8bcc2" />
    <B p={[0, 1.45, -4.16]} s={[1.7, 0.5, 0.02]} c="#22303c" />
    {[-1, 1].map((x) => [-3.4, -1.6, 0.9].map((z) => <Wheel key={`${x}${z}`} p={[x * 1.02, 0.4, z]} />))}
    {[-1, 1].map((s) => <group key={s} position={[s * 1.02, 1.35, 1.52]} rotation={[0, s * doors * 1.9, 0]}><B p={[-s * 0.5, 0, 0.03]} s={[1.0, 1.95, 0.06]} c="#b8bcc2" /></group>)}
    <B p={[0, 1.3, 1.45]} s={[1.9, 1.9, 0.02]} c="#15181c" />
    {[-0.7, 0.7].map((x) => <B key={x} p={[x, 0.9, 1.5]} s={[0.2, 0.12, 0.05]} c="#ff3b3b" e={1.2} />)}
  </group>
);
const Car: React.FC<{c: string; pickup?: boolean}> = ({c, pickup}) => (
  <group>
    <B p={[0, 0.75, 0]} s={[1.9, 0.7, 4.4]} c={c} />
    <B p={[0, 1.35, pickup ? 0.6 : -0.1]} s={[1.75, 0.6, pickup ? 1.7 : 2.3]} c={c} />
    <B p={[0, 1.38, pickup ? 0.6 : -0.1]} s={[1.78, 0.42, pickup ? 1.5 : 2.1]} c="#1c2a38" />
    {[-1, 1].map((x) => [-1.4, 1.45].map((z) => <Wheel key={`${x}${z}`} p={[x * 0.92, 0.4, z]} />))}
    {[-0.6, 0.6].map((x) => <B key={x} p={[x, 0.85, 2.21]} s={[0.35, 0.16, 0.03]} c="#fff2c0" e={0.8} />)}
  </group>
);
const StreetLamp: React.FC<{p: V3}> = ({p}) => (
  <group position={p}>
    <B p={[0, 2.5, 0]} s={[0.12, 5, 0.12]} c="#3a3f46" />
    <B p={[0.5, 5, 0]} s={[1.0, 0.15, 0.35]} c="#3a3f46" />
    <B p={[0.8, 4.9, 0]} s={[0.4, 0.06, 0.25]} c="#ffcf7a" e={2} />
    <pointLight position={[0.8, 4.6, 0]} intensity={14} distance={16} decay={1.4} color="#ffb860" />
  </group>
);

const Road: React.FC<{t: number}> = ({t}) => {
  const boxBlue = (i: number) => (i < 3 ? ease(t, OPEN + 0.2 + i * 0.25, OPEN + 1.2 + i * 0.25) : 0);
  return (
    <>
      <Ground c="#22262b" />
      {Array.from({length: 12}, (_, i) => <B key={i} p={[-3.3, 0.01, -30 + i * 6]} s={[0.15, 0.02, 2.6]} c="#d8c36a" />)}
      <StreetLamp p={[-5, 0, 1]} />
      <StreetLamp p={[5.5, 0, -12]} />
      <group rotation={[0, 0.04, 0]}><Van doors={1} /></group>
      {/* the four boxes on the asphalt; three trigger, one survives */}
      {[[-1.1, 3.3], [-0.2, 3.9], [0.7, 3.4], [1.5, 4.4]].map(([x, z], i) => <Box key={i} p={[x, 0, z]} open={i < 3 ? ease(t, OPEN - 0.2 + i * 0.25, OPEN + 0.1 + i * 0.25) : 0} blue={boxBlue(i)} />)}
      <Ink p={[0, 0, 3.6]} t={t} t0={-0.3} n={50} />
      {[0, 1, 2].map((i) => <Ink key={i} p={[[-1.1, -0.2, 0.7][i], 0, [3.3, 3.9, 3.4][i]]} t={t} t0={OPEN + 0.1 + i * 0.25} n={26} />)}
      <group position={[2.4, 0, 5.0]} rotation={[0, -2.5, 0]}><Person look={L.you} crouch={t > 4.8 && t < 10.8 ? 0.6 : 0} headTilt={-0.5} arms={0.3} /></group>
      <group position={[-2.3, 0, 5.2]} rotation={[0, 2.6, 0]}><Person look={L.mason} armUp={t < 2 ? 1 : 0} headYaw={0.3} /></group>
    </>
  );
};

const Motel: React.FC<{t: number}> = ({t}) => {
  const burn = ease(t, BURN - 0.3, BURN + 0.4);
  return (
    <>
      <Ground c="#4a3a34" s={20} />
      <B p={[0, 1.6, -2.4]} s={[8, 3.2, 0.1]} c="#5a4652" />
      <B p={[-3.5, 1.6, 0]} s={[0.1, 3.2, 6]} c="#544350" />
      <B p={[3.6, 1.6, 0]} s={[0.1, 3.2, 6]} c="#544350" />
      <B p={[1.6, 1.8, -2.33]} s={[1.6, 1.0, 0.02]} c="#ff3ca8" e={1.4} />
      {[0, 1, 2, 3, 4].map((i) => <B key={i} p={[1.6, 1.4 + i * 0.2, -2.3]} s={[1.6, 0.04, 0.03]} c="#2a1a24" />)}
      <pointLight position={[1.6, 1.8, -1.6]} intensity={5} distance={8} color="#ff4fb0" />
      {/* bed */}
      <B p={[0, 0.25, 0]} s={[2.2, 0.5, 2.8]} c="#3a2a24" />
      <B p={[0, 0.55, 0.05]} s={[2.15, 0.12, 2.7]} c="#c98a6a" />
      <B p={[0, 0.65, -1.2]} s={[1.8, 0.16, 0.4]} c="#efe6d8" />
      {/* lamp */}
      <B p={[-1.7, 0.3, -1.6]} s={[0.6, 0.6, 0.6]} c="#3a2a24" />
      <mesh position={[-1.7, 0.95, -1.6]}><coneGeometry args={[0.25, 0.35, 6, 1, true]} /><M c="#ffd890" e={1} /></mesh>
      <pointLight position={[-1.7, 1.0, -1.4]} intensity={4} distance={6} color="#ffcc80" />
      {/* duffel bags + cash: 3 blue piles, 1 green */}
      {[[-0.6, -0.4], [0.5, -0.5]].map(([x, z], i) => <mesh key={i} position={[x, 0.82, z]} rotation={[0, 0.3 * i, Math.PI / 2]}><cylinderGeometry args={[0.24, 0.24, 0.8, 8]} /><M c="#15181c" /></mesh>)}
      {Array.from({length: 4}, (_, pile) => Array.from({length: 6}, (_, j) => {
        const gone = pile < 3 ? burn : 0;
        if (gone >= 1) return null;
        return <Stack key={`${pile}${j}`} p={[-0.75 + pile * 0.5, 0.67 + Math.floor(j / 2) * 0.12, 0.6 + (j % 2) * 0.16]} blue={pile < 3 ? ease(t, RUINED - 1, RUINED) : 0} r={rnd(pile * 6 + j) * 0.3} />;
      }))}
      {/* burn barrel in the bathroom corner */}
      <mesh position={[2.0, 0.3, 0.6]}><cylinderGeometry args={[0.32, 0.28, 0.6, 8]} /><M c="#5a5e64" /></mesh>
      <Fire p={[2.0, 0.55, 0.6]} t={t} k={burn} />
      {t > BURN && Array.from({length: 6}, (_, i) => { const k = ((t - BURN) * 0.7 + i / 6) % 1; return <mesh key={i} position={[2 + Math.sin(i * 3) * 0.2 * k, 0.9 + k * 1.6, 0.6]} scale={0.04 * (1 - k)}><icosahedronGeometry args={[1, 0]} /><meshBasicMaterial color="#ffb23d" /></mesh>; })}
      <group position={[1.7, 0, 1.3]} rotation={[0, -2.4, 0]}><Person look={L.you} headTilt={-0.4} /></group>
      <group position={[-1.6, 0, -0.4]} rotation={[0, 0.8, 0]}><Person look={L.mason} arms={t > MASON1 && t < RULE ? 0.5 : 0} headYaw={0.2} /></group>
    </>
  );
};

const Lot: React.FC<{t: number}> = ({t}) => {
  const cash = t > FIFTY;
  return (
    <>
      <Ground c="#8a8a84" />
      {/* showroom */}
      <B p={[4, 1.6, -0.8]} s={[6, 3.2, 0.1]} c="#e8e4da" />
      <B p={[4, 3.25, 1.6]} s={[6.2, 0.15, 5]} c="#c9c4b8" />
      <B p={[4, 0.5, 1.6]} s={[1.6, 1.0, 0.7]} c="#6a4a34" />
      {cash && Array.from({length: 10}, (_, j) => <Stack key={j} p={[3.5 + (j % 5) * 0.2, 1.06 + Math.floor(j / 5) * 0.12, 1.7]} r={rnd(j) * 0.2} />)}
      <group position={[4.1, 0, 1.0]}><Person look={L.dealer} arms={t > ID - 0.3 && t < FORM ? 0.6 : 0.2} headTilt={t > ID && t < FORM ? 0.15 : 0} /></group>
      <group position={[2.9, 0, 3.0]} rotation={[0, Math.PI - 0.4, 0]}><Person look={L.mason} reach={t > FIFTY && t < ID ? 1 : 0} /></group>
      <group position={[2.1, 0, 3.4]} rotation={[0, Math.PI - 0.6, 0]}><Person look={L.you} /></group>
      {/* the red pickup + rows of cars + flags */}
      <group position={[-1.8, 0, 1.5]} rotation={[0, 0.5, 0]}><Car c="#c0392b" pickup /></group>
      {[-7, -3.5, 7.5, 11].map((x, i) => <group key={x} position={[x, 0, -4]}><Car c={['#3a6ea8', '#e8e6dc', '#2c2c2c', '#7a8a5a'][i]} /></group>)}
      {Array.from({length: 14}, (_, i) => <mesh key={i} position={[-8 + i * 1.4, 4 + Math.sin(i) * 0.1, -3]} rotation={[0, 0, Math.PI + Math.sin(t * 4 + i) * 0.2]}><coneGeometry args={[0.2, 0.5, 3]} /><M c={[ACC.red, ACC.amber, ACC.blue][i % 3]} /></mesh>)}
    </>
  );
};

const CAM_POS: V3[] = [[-2, 3.6, -1], [0, 3.7, -1], [2, 3.6, -1], [-3.6, 2.9, -2.2], [3.6, 3.0, -2.2]];
const Casino: React.FC<{t: number}> = ({t}) => (
  <>
    <Ground c="#5a1a24" s={30} />
    <B p={[0, 3.9, 0]} s={[14, 0.1, 14]} c="#2a1a20" />
    <B p={[0, 2, -3]} s={[12, 4, 0.1]} c="#3a2228" />
    {/* cage */}
    <B p={[-3, 0.6, -2.7]} s={[3, 1.2, 0.5]} c="#6a4a2a" />
    {Array.from({length: 13}, (_, i) => <B key={i} p={[-4.4 + i * 0.23, 1.9, -2.5]} s={[0.04, 1.4, 0.04]} c="#d8b45a" />)}
    <B p={[-3, 2.65, -2.5]} s={[3.1, 0.1, 0.1]} c="#d8b45a" />
    <group position={[-3, 0, -3.0]}><Person look={L.teller} arms={0.4} /></group>
    {/* tables + chips */}
    {[[1.5, 0], [-0.5, 1.8], [3, 2.6]].map(([x, z], i) => (
      <group key={i} position={[x, 0, z]}>
        <mesh position={[0, 0.8, 0]}><cylinderGeometry args={[1.0, 1.0, 0.12, 12]} /><M c="#1e6b3a" /></mesh>
        <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.2, 0.3, 0.8, 8]} /><M c="#3a2a24" /></mesh>
        {[0, 1, 2].map((j) => <mesh key={j} position={[Math.sin(j * 2.1 + i) * 0.5, 0.9 + (t > CHIPS && i === 0 ? 0.05 * j : 0), Math.cos(j * 2.1 + i) * 0.5]}><cylinderGeometry args={[0.07, 0.07, 0.1 + j * 0.06, 10]} /><M c={[ACC.red, ACC.blue, ACC.amber][j]} /></mesh>)}
      </group>
    ))}
    {/* slot machines glowing on the back wall */}
    {[0, 1, 2, 3, 4].map((i) => <group key={i} position={[0.6 + i * 1.0, 0, -2.6]}><B p={[0, 0.9, 0]} s={[0.7, 1.8, 0.5]} c="#2a2a3a" /><B p={[0, 1.25, 0.26]} s={[0.5, 0.4, 0.02]} c={i % 2 ? '#ff3ca8' : ACC.amber} e={1.3 + 0.4 * Math.sin(t * 6 + i)} /></group>)}
    {/* ceiling cameras with blinking red lights */}
    {CAM_POS.map((p, i) => <group key={i} position={p}><mesh><sphereGeometry args={[0.16, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} /><M c="#111" /></mesh><mesh position={[0, -0.06, 0.12]}><sphereGeometry args={[0.03, 6, 4]} /><meshBasicMaterial color={Math.sin(t * 5 + i) > 0 ? '#ff2020' : '#401010'} /></mesh></group>)}
    <pointLight position={[0, 3.2, 1]} intensity={14} distance={16} color="#ffd8a0" /><pointLight position={[-3, 3, -1]} intensity={10} distance={8} color="#ffcf7a" />
    <group position={[-2.6, 0, -1.4]} rotation={[0, Math.PI, 0]}><Person look={L.mason} arms={t < REPORT ? 0.5 : 0.2} /></group>
    <group position={[1.0, 0, 1.2]} rotation={[0, 2.6, 0]}><Person look={L.you} headTilt={t > CAMS ? -0.9 : 0} /></group>
  </>
);

const Ext: React.FC<{t: number}> = ({t}) => (
  <>
    <Ground c="#2a2c30" />
    {/* motel row */}
    {[-4, -2, 0, 2].map((x, i) => <group key={x}>
      <B p={[x, 1.4, -0.5]} s={[2, 2.8, 0.2]} c="#c8b8a0" />
      <B p={[x - 0.4, 1.0, -0.38]} s={[0.8, 2.0, 0.05]} c={['#7a2e22', '#3a6ea8', '#7a2e22', '#3a6ea8'][i]} />
      <B p={[x + 0.5, 1.5, -0.38]} s={[0.7, 0.6, 0.04]} c={i === 1 ? '#ffcf7a' : '#1c2a38'} e={i === 1 ? 1.2 : 0} />
    </group>)}
    <B p={[-1, 2.95, 0.2]} s={[8.4, 0.12, 1.6]} c="#8a7a64" />
    <group position={[-6.5, 0, 0.5]}><B p={[0, 2.5, 0]} s={[0.15, 5, 0.15]} c="#333" /><B p={[0, 5, 0]} s={[1.6, 1.0, 0.15]} c="#ff3ca8" e={1.2 + 0.5 * (Math.sin(t * 9) > 0.9 ? 0 : 1)} /></group>
    <group position={[-4.2, 0, 3.2]} rotation={[0, Math.PI / 2, 0]}><Car c="#c0392b" pickup /></group>
    {/* grey sedan across the street, someone inside */}
    <group position={[6, 0, 9]} rotation={[0, -2.2, 0]}>
      <Car c="#7d8288" />
      <mesh position={[0.35, 1.45, -0.2]}><icosahedronGeometry args={[0.17, 1]} /><M c="#2a2020" /></mesh>
      {t > SEDAN + 2 && <B p={[0.35, 1.45, 0.4]} s={[0.05, 0.05, 0.05]} c="#ffb23d" e={2 * (Math.sin(t * 3) > 0.3 ? 1 : 0)} />}
    </group>
    <StreetLamp p={[8, 0, 7]} />
    <group position={[-1.6, 0, 0.9]} rotation={[0, 0.3, 0]}><Person look={L.mason} arms={t > MASON2 && t < END ? 0.4 : 0} headYaw={0.2} /></group>
    <group position={[0.2, 0, 0.6]} rotation={[0, 0.9, 0]}><Person look={L.you} headYaw={0.5} /></group>
  </>
);

const World: React.FC<{t: number}> = ({t}) => {
  const loc = SHOTS[shotAt(t)].loc;
  const day = loc === 'lot';
  const top = new THREE.Color(day ? '#5aa0e0' : loc === 'ext' ? '#2a3a5a' : '#0a0e1c');
  const bot = new THREE.Color(day ? '#ffe2b0' : loc === 'ext' ? '#ff9a6a' : '#3a2a4a');
  return (
    <>
      <Sky top={top} bot={bot} />
      {!day && <Stars k={loc === 'road' ? 0.8 : 0.3} />}
      <hemisphereLight args={[day ? '#fff2dc' : '#9aa8ff', '#4a3a40', day ? 1.4 : loc === 'road' ? 0.7 : 1.15]} />
      <directionalLight position={[20, 30, 20]} intensity={day ? 1.6 : 0.4} color={day ? '#fff0d0' : '#8aa0ff'} />
      <group position={O[loc]}>
        {loc === 'road' && <Road t={t} />}
        {loc === 'motel' && <Motel t={t} />}
        {loc === 'lot' && <Lot t={t} />}
        {loc === 'casino' && <Casino t={t} />}
        {loc === 'ext' && <Ext t={t} />}
      </group>
    </>
  );
};

// ---------- HUD ----------
const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
const clock = (t: number) => t < DAY2 ? `${t < 10.82 ? '11:52' : '12:' + String(Math.floor(interpolate(t, [10.82, DAY2], [14, 31]))).padStart(2, '0')} ${t < 10.82 ? 'PM' : 'AM'}`
  : t < CASINO ? '10:40 AM' : t < DAY3 ? '9:12 PM' : t < SEDAN ? '7:05 AM' : '1:18 PM';
const dayN = (t: number) => (t < DAY2 ? 1 : t < DAY3 ? 2 : 3);
const cashAt = (t: number) => (t < BURN + 0.4 ? 4_000_000 : t < FIFTY ? interpolate(t, [BURN + 0.4, BURN + 1.2], [4_000_000, 1_000_000], CL) : t < DAY3 ? 1_000_000 : 950_000);
const susp = (t: number) => Math.round(interpolate(t, [ID + 1.2, ID + 1.8, CAMS + 0.8, CAMS + 1.6, SEDAN + 2.4, SEDAN + 3.2], [0, 15, 15, 40, 40, 75], CL));
const HUD: React.FC<{t: number}> = ({t}) => {
  if (t > END) return null;
  const k = ease(t, 0.3, 0.7, Easing.out(Easing.cubic)), s = susp(t);
  const cleanK = pop(t, CLEAN + 0.4), suspK = pop(t, ID + 1.2);
  const flash = (a: number) => (t > a && t < a + 0.6 ? 1 + 0.2 * (1 - (t - a) / 0.6) : 1);
  return (
    <div style={{position: 'absolute', left: 56, right: 56, top: 92, display: 'flex', justifyContent: 'space-between', opacity: k, transform: `translateY(${(1 - k) * -40}px)`, fontFamily: FONT}}>
      <div style={{color: 'white', textShadow: '0 3px 12px rgba(0,0,0,0.7)'}}>
        <div style={{fontWeight: 800, fontSize: 28, letterSpacing: '0.16em', color: ACC.red}}>● DAY {dayN(t)} <span style={{color: 'white', opacity: 0.8}}>· DIRTY MONEY</span></div>
        <div style={{fontWeight: 900, fontSize: 76, lineHeight: 1, marginTop: 6}}>{clock(t)}</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14}}>
        <div style={{transform: `scale(${flash(BURN + 0.4)})`, transformOrigin: 'right center'}}><Pill color={ACC.lime} size={30}><span style={{color: t > BURN ? ACC.amber : ACC.lime}}>{fmt(cashAt(t))}</span>CASH</Pill></div>
        {cleanK > 0 && <div style={{transform: `scale(${cleanK})`, transformOrigin: 'right center'}}><Pill color={ACC.lime} size={30}><span style={{color: ACC.lime}}>25%</span>CLEAN</Pill></div>}
        {suspK > 0 && <div style={{transform: `scale(${suspK * flash(CAMS + 0.8) * flash(SEDAN + 2.4)})`, transformOrigin: 'right center'}}><Pill color={ACC.red} size={30}><span style={{color: s > 30 ? ACC.red : ACC.amber}}>{s}%</span>SUSPICION</Pill></div>}
      </div>
    </div>
  );
};

// ---------- beats ----------
const Big: React.FC<{t: number; at: number; out: number; text: string; color?: string; y?: number; size?: number}> = ({t, at: a, out, text, color = 'white', y = 760, size = 200}) => {
  if (t < a || t > out) return null;
  const k = pop(t, a, 0.25);
  return <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', transform: `scale(${mix(1.8, 1, Math.min(1, k))})`, opacity: Math.min(1, k * 2) * (1 - ease(t, out - 0.2, out)), fontFamily: FONT, fontWeight: 900, fontSize: size, color, WebkitTextStroke: '7px rgba(0,0,0,0.85)', paintOrder: 'stroke fill', textShadow: '0 10px 0 rgba(0,0,0,0.45)'}}>{text}</div>;
};
const Row: React.FC<{t: number; at: number; label: string; value: string; color?: string}> = ({t, at: a, label, value, color = ACC.red}) => {
  const k = pop(t, a, 0.3);
  return <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 46, fontWeight: 800, marginTop: 18, opacity: Math.min(1, k * 2), transform: `translateX(${(1 - Math.min(1, k)) * 40}px)`}}><span>{label}</span><span style={{color}}>{value}</span></div>;
};
const Beats: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const {width: W, height: Hh} = useVideoConfig();
  const proj = projector(cam, W, Hh);
  const tagAt = (l: Loc, p: V3, text: string, a: number, b: number, color?: string) => { if (t < a || t > b) return null; const s = proj(at(l, p)); return <Tag x={s.x} y={s.y} text={text} k={pop(t, a)} color={color} />; };
  return (
    <>
      {/* hook */}
      <Big t={t} at={2.1} out={3.4} text="$4,000,000" color={ACC.lime} y={560} size={150} />
      {tagAt('road', [0, 0.9, 3.6], 'TURNING BLUE', BLUE, 4.8, ACC.blue)}
      {tagAt('road', [0, 0.6, 3.6], 'INK TRAP', 5.2, 7.1, ACC.red)}
      <Card t={t} at={8.0} out={10.7} y={300} accent={ACC.blue}>
        <div style={{fontSize: 30, fontWeight: 800, letterSpacing: '0.16em', color: ACC.blue}}>CASH-IN-TRANSIT BOX</div>
        <div style={{fontSize: 58, fontWeight: 900, marginTop: 8, lineHeight: 1.1}}>Forced open → <span style={{color: ACC.blue}}>ink floods</span> every bill</div>
        <div style={{fontSize: 40, fontWeight: 800, marginTop: 14, color: ACC.red}}>STAINED FOR GOOD</div>
      </Card>
      {[0, 1, 2].map((i) => <React.Fragment key={i}>{tagAt('motel', [-0.75 + i * 0.5, 1.0, 0.68], 'RUINED', RUINED + 0.15 * i, MASON1 - 0.1, ACC.red)}</React.Fragment>)}
      {tagAt('motel', [0.75, 1.0, 0.68], 'CLEAN', CLEAN, MASON1 - 0.1, ACC.lime)}
      <Big t={t} at={13.74} out={MASON1} text="$1,000,000" color={ACC.lime} y={520} size={140} />
      <Stamp t={t} at={RULE} out={BURN - 0.2} text="RULE 1" sub="STAINED CASH = EVIDENCE" color={ACC.lime} y={560} size={200} />
      {tagAt('motel', [2.0, 1.2, 0.6], 'BURN IT', BURN, DAY2 - 0.1, ACC.amber)}
      <Stamp t={t} at={DAY2} out={22.3} text="DAY 2" color={ACC.amber} y={600} size={240} />
      {tagAt('lot', [-1.8, 2.1, 1.5], 'NEW TRUCK', 22.4, 24.5, ACC.amber)}
      <Big t={t} at={FIFTY} out={ID - 0.1} text="$50,000 CASH" color={ACC.lime} y={420} size={120} />
      <Card t={t} at={FORM} out={CASINO - 0.15} y={320} accent={ACC.red}>
        <div style={{fontSize: 30, fontWeight: 800, letterSpacing: '0.16em', color: ACC.red}}>FORM 8300 · IRS</div>
        <div style={{fontSize: 60, fontWeight: 900, marginTop: 8, lineHeight: 1.1}}>Business paid <span style={{color: ACC.amber}}>over $10,000</span> in cash</div>
        <Row t={t} at={32.24} label="Your name" value="✓" />
        <Row t={t} at={33.14} label="Your address" value="✓" />
        <Row t={t} at={34.04} label="Filed within" value="15 DAYS" />
      </Card>
      {tagAt('casino', [1.5, 1.2, 0], 'CHIPS', CHIPS, REPORT - 0.1, ACC.amber)}
      <Big t={t} at={38.78} out={REPORT - 0.05} text="CLEAN?" color={ACC.lime} y={520} size={170} />
      <Card t={t} at={REPORT} out={CAMS - 0.1} y={300} accent={ACC.red}>
        <div style={{fontSize: 30, fontWeight: 800, letterSpacing: '0.16em', color: ACC.red}}>CASINO RULE</div>
        <div style={{fontSize: 60, fontWeight: 900, marginTop: 8, lineHeight: 1.1}}>Cash over <span style={{color: ACC.amber}}>$10,000</span> in one day → <span style={{color: ACC.red}}>reported</span></div>
      </Card>
      {CAM_POS.map((p, i) => <React.Fragment key={i}>{tagAt('casino', [p[0], p[1] - 0.15, p[2]], 'CAMERA', CAMS + 0.2 + i * 0.15, DAY3 - 0.1, ACC.red)}</React.Fragment>)}
      <Stamp t={t} at={DAY3} out={46.3} text="DAY 3" color={ACC.red} y={600} size={240} />
      {tagAt('ext', [-4.2, 2.1, 3.2], 'HE BOUGHT IT', 47.3, SEDAN - 0.1, ACC.red)}
      {tagAt('ext', [6, 2.0, 9], '6 HOURS', 51.26, MASON2 - 0.1, ACC.red)}
      {/* end card */}
      {t > END && <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: FONT}}>
        <div style={{opacity: pop(t, END + 0.05), transform: `scale(${mix(1.4, 1, Math.min(1, pop(t, END + 0.05)))})`, fontWeight: 900, fontSize: 160, lineHeight: 0.95, color: 'white', WebkitTextStroke: '6px rgba(0,0,0,0.85)', paintOrder: 'stroke fill'}}>
          <div style={{color: ACC.red}}>CUT</div><div style={{color: ACC.amber, fontSize: 80, margin: '14px 0'}}>OR</div><div style={{color: ACC.lime}}>STAY?</div>
        </div>
        <div style={{marginTop: 50, display: 'flex', justifyContent: 'center', gap: 24, opacity: ease(t, 56.2, 56.6)}}>
          <Pill color={ACC.red} size={38}><span style={{color: ACC.red}}>A</span>CUT MASON</Pill>
          <Pill color={ACC.lime} size={38}><span style={{color: ACC.lime}}>B</span>STAY</Pill>
        </div>
        <div style={{marginTop: 40, fontWeight: 800, fontSize: 36, letterSpacing: '0.2em', color: ACC.amber, opacity: ease(t, 59.0, 59.4)}}>PART 2 → FOLLOW</div>
      </div>}
      {t < 0.35 && <AbsoluteFill style={{background: '#5cc8ff', opacity: 0.6 * (1 - t / 0.35)}} />}
      {t > BURN && t < BURN + 0.4 && <AbsoluteFill style={{background: '#ff8a3a', opacity: 0.3 * (1 - (t - BURN) / 0.4)}} />}
    </>
  );
};

// ---------- captions: narrator keywords; dialogue in the speaker's colour with a name tag ----------
const KEYS: Record<string, string> = {
  robbed: ACC.red, armored: ACC.amber, truck: ACC.amber, million: ACC.lime, dollars: ACC.lime, blue: ACC.blue, booby: ACC.red, trapped: ACC.red, ink: ACC.blue, forever: ACC.red,
  ruined: ACC.red, survived: ACC.lime, clean: ACC.lime, rule: ACC.lime, stain: ACC.blue, evidence: ACC.red, burns: ACC.amber, tonight: ACC.amber, day: ACC.amber, two: ACC.amber, three: ACC.red,
  '50': ACC.lime, grand: ACC.lime, cash: ACC.lime, '$10': ACC.amber, ',000': ACC.amber, irs: ACC.red, name: ACC.red, address: ACC.red, '15': ACC.red, days: ACC.red,
  casino: ACC.amber, chips: ACC.amber, casinos: ACC.amber, report: ACC.red, '10': ACC.amber, '40': ACC.red, cameras: ACC.red, cage: ACC.red, anyway: ACC.red, gray: ACC.blue, sedan: ACC.blue, six: ACC.red, hours: ACC.red,
  cut: ACC.red, stay: ACC.lime, crew: ACC.lime, answer: ACC.amber,
};
const LINES: {from: number; to: number; who: string; color: string}[] = [
  {from: MASON1 - 0.05, to: RULE - 0.05, who: 'MASON', color: '#FF7A6A'}, {from: ID - 0.05, to: FORM - 0.05, who: 'DEALER', color: '#FFD166'}, {from: MASON2 - 0.05, to: END - 0.05, who: 'MASON', color: '#FF7A6A'},
];
const lineOf = (s: number) => LINES.find((l) => s >= l.from && s < l.to);
const NARR = WORDS.filter((w) => !lineOf(w[1]));
const all = (c: string) => new Proxy({}, {get: () => c}) as Record<string, string>;
const SpeakerCaptions: React.FC<{t: number}> = ({t}) => {
  const l = LINES.find((x) => t >= x.from && t < x.to + 0.3);
  if (!l) return <Captions words={NARR} t={t} keys={KEYS} y={1330} hide={(x) => x > END - 0.05} />;
  const words = WORDS.filter((w) => w[1] >= l.from && w[1] < l.to);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1240, textAlign: 'center', transform: `scale(${pop(t, l.from)})`}}><Pill color={l.color} size={30}><span style={{color: l.color}}>●</span>{l.who}</Pill></div>
      <Captions words={words} t={t} keys={all(l.color)} y={1330} />
    </>
  );
};

const CutFlash: React.FC<{t: number}> = ({t}) => {
  const s = SHOTS.find((x) => x.from > 0 && t >= x.from && t < x.from + 0.12);
  return s ? <AbsoluteFill style={{background: 'white', opacity: 0.2 * (1 - (t - s.from) / 0.12)}} /> : null;
};

export const SFX: Sfx[] = [
  [0.0, 'boom', 0.8], [0.0, 'impact', 0.6], [0.05, 'glitch', 0.4], [2.1, 'ding', 0.3], [2.05, 'whoosh', 0.3], [BLUE, 'riser', 0.25],
  [4.8, 'heartbeat', 0.4], [OPEN, 'boom', 0.55], [OPEN + 0.25, 'impact', 0.4], [OPEN + 0.5, 'impact', 0.35], [8.0, 'whoosh', 0.25],
  [RUINED, 'whoosh_long', 0.3], [RUINED + 0.15, 'click', 0.4], [RUINED + 0.3, 'click', 0.4], [RUINED + 0.45, 'click', 0.4], [CLEAN, 'ding', 0.4], [13.74, 'pop', 0.3],
  [MASON1, 'whoosh', 0.2], [RULE, 'swell_hit', 0.4], [BURN, 'boom', 0.45], [BURN, 'rattle', 0.3], [DAY2, 'impact', 0.7], [DAY2, 'whoosh_long', 0.3],
  [FIFTY, 'ding', 0.35], [ID, 'clunk', 0.4], [ID + 1.2, 'glitch', 0.35], [FORM, 'whoosh', 0.25], [32.24, 'click', 0.45], [33.14, 'click', 0.45], [34.04, 'impact', 0.45],
  [CASINO, 'whoosh_long', 0.3], [CHIPS, 'rattle', 0.35], [38.78, 'ding', 0.3], [REPORT, 'swell_hit', 0.35], [CAMS, 'heartbeat', 0.5], [CAMS + 0.8, 'glitch', 0.45],
  [DAY3, 'impact', 0.75], [DAY3, 'boom', 0.4], [47.3, 'pop', 0.3], [SEDAN, 'riser', 0.3], [50.5, 'heartbeat', 0.5], [51.3, 'heartbeat', 0.55], [SEDAN + 2.4, 'glitch', 0.45],
  [MASON2, 'heartbeat', 0.45], [END, 'boom', 0.6], [56.2, 'pop', 0.35], [59.0, 'ding', 0.3],
];

export const DirtyMoneyDay1: React.FC = () => {
  const {width: W, height: Hh} = useVideoConfig();
  const t = useT();
  const cam = camAt(t);
  return (
    <AbsoluteFill style={{background: '#05070c'}}>
      <ThreeCanvas width={W} height={Hh} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
        <CameraRig cam={cam} />
        <World t={t} />
      </ThreeCanvas>
      {t > END && <AbsoluteFill style={{background: 'black', opacity: 0.45 * ease(t, END, END + 0.3)}} />}
      <Vignette />
      <Grain />
      <HUD t={t} />
      <Beats t={t} cam={cam} />
      <SpeakerCaptions t={t} />
      <CutFlash t={t} />
      <AbsoluteFill style={{background: 'black', opacity: ease(t, DM1_SEC - 0.5, DM1_SEC)}} />
      <DayAudio job={JOB} sec={DM1_SEC} sfx={SFX} musicVol={0.13} />
    </AbsoluteFill>
  );
};

// ---------- thumbnail ----------
export const DirtyMoneyDay1Thumb: React.FC = () => {
  const {width: W, height: Hh} = useVideoConfig();
  const t = 1.0;
  const cam: Cam = {pos: [1.4, 1.1, 6.6], look: [0, 0.9, 3.4], fov: 50};
  return (
    <AbsoluteFill style={{background: '#05070c', fontFamily: FONT}}>
      <ThreeCanvas width={W} height={Hh} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
        <CameraRig cam={cam} />
        <World t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.75) 100%)'}} />
      <div style={{position: 'absolute', top: 130, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: ACC.red, color: 'white', fontWeight: 900, fontSize: 52, letterSpacing: '0.14em', padding: '12px 34px', borderRadius: 999}}>DIRTY MONEY</div>
        <div style={{fontWeight: 900, fontSize: 300, lineHeight: 0.9, color: 'white', marginTop: 30, WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', textShadow: '0 12px 0 rgba(0,0,0,0.5)'}}>DAY 1</div>
      </div>
      <div style={{position: 'absolute', bottom: 260, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontWeight: 900, fontSize: 100, lineHeight: 1, color: 'white', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>$4 MILLION</div>
        <div style={{fontWeight: 900, fontSize: 100, lineHeight: 1, color: ACC.lime, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>TURNING BLUE</div>
      </div>
    </AbsoluteFill>
  );
};
