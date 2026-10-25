// THE PROMISE — Day 1 (Day Series, 9:16). Fantasy village: the blacksmith's boy learns at the harvest feast he was promised at birth to the chief's daughter.
// Low-poly 3D world keyed to words in promiseDay1Words.ts. Voice: Brian narrator + Harry (chief), Bill (grandpa), Jessica (Lyra). Script: Day Series/Scripts/THE PROMISE - Day 1.md
import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {ACC, Cam, CameraRig, Captions, Card, DayAudio, ease, FONT, Grain, handheld, mix, mix3, Pill, pop, projector, rnd, Sfx, Sky, Stamp, Stars, Tag, useT, V3, Vignette} from './dayKit';
import {Look, Person, student} from './schoolKit';
import {WORDS} from './promiseDay1Words';

export const PROMISE1_SEC = 60.6;
const JOB = 'jobs/promise-day1';
const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// ---------- story timing (word starts) ----------
const FEAST = 15.14, WALK = 17.0, SIT = 19.45, BLUSH = 20.06, FACT1 = 21.78, TOAST = 24.66, ROAR = 27.26, GRANDPA = 29.56, FACT2 = 33.4,
  LEAN = 37.14, LYRA1 = 40.4, HEART = 41.9, LYRA2 = 43.6, CURSED = 46.9, DOORS = 48.26, RIDER = 49.58, FIRST = 51.04, END = 54.36;

// ---------- cast ----------
const L = {
  you: {skin: '#e3b08a', top: '#5a4636', bottom: '#2e2a26', hair: '#1d1410', shoes: '#3a2a1e'},
  lyra: {skin: '#f0c6a2', top: '#2f8f7a', bottom: '#e8dcc0', hair: '#d9a441', shoes: '#6b4a2e'},
  chief: {skin: '#c98d62', top: '#8a2a2a', bottom: '#3a3028', hair: '#c8c8c8', shoes: '#2a1e16'},
  grandpa: {skin: '#d9a27a', top: '#6b6b5a', bottom: '#3a3530', hair: '#eeeeee', shoes: '#2a1e16'},
  rider: {skin: '#b88a6a', top: '#141418', bottom: '#0c0c10', hair: '#0a0a0a', shoes: '#0a0a0a'},
} satisfies Record<string, Look>;
const blush = (t: number) => (t < BLUSH ? 0 : interpolate(t, [BLUSH, BLUSH + 0.9, FACT2, LEAN, HEART, HEART + 0.5, END], [0, 1, 0.5, 0.8, 0.8, 1, 0.9], CL));
const youLook = (t: number): Look => ({...L.you, skin: '#' + new THREE.Color(L.you.skin).lerp(new THREE.Color('#e2523e'), blush(t) * 0.75).getHexString()});
// villagers on the benches: [x, side] (side +1 = your side, facing -z)
const SEATS: [number, number][] = [[-3, 1], [-2, 1], [-1, 1], [1.6, 1], [2.6, 1], [3.6, 1], [-3, -1], [-2, -1], [0, -1], [1, -1], [2.2, -1], [3.4, -1]];
const cheer = (t: number) => (t < 2.86 ? 1 : t > ROAR && t < GRANDPA ? ease(t, ROAR, ROAR + 0.3) : 0);

// ---------- shots ----------
type Loc = 'hall' | 'ext';
type Shot = {from: number; to: number; loc: Loc; shake?: number; cam: (k: number) => Cam};
const C = (pos: V3, look: V3, fov = 42): Cam => ({pos, look, fov});
const lerp = (a: Cam, b: Cam) => (k: number): Cam => ({pos: mix3(a.pos, b.pos, k), look: mix3(a.look, b.look, k), fov: mix(a.fov, b.fov, k)});
const YOU_HEAD: V3 = [0, 1.22, 0.8], LYRA_HEAD: V3 = [0.6, 1.22, 0.8];
const SHOTS: Shot[] = [
  {from: 0, to: 2.86, loc: 'hall', shake: 1, cam: lerp(C([5.5, 2.8, -3.6], [0, 1.0, 0.4], 52), C([4.2, 2.3, -2.6], [0, 1.1, 0.6], 46))},
  {from: 2.86, to: 4.26, loc: 'hall', cam: lerp(C([0.3, 1.36, -1.0], YOU_HEAD, 40), C([0.2, 1.32, -0.7], YOU_HEAD, 36))},
  {from: 4.26, to: 5.84, loc: 'ext', cam: lerp(C([3.4, 2.2, 5.2], [0, 1.0, 0], 44), C([2.4, 1.9, 4.2], [0, 1.1, 0], 42))},
  {from: 5.84, to: 8.74, loc: 'ext', cam: lerp(C([0.9, 0.7, 1.7], [0, 0.4, 0.1], 42), C([0.9, 1.5, 1.9], [0, 1.45, 0], 40))},
  {from: 8.74, to: 11.92, loc: 'ext', cam: lerp(C([-4.2, 1.75, 0.8], [-6, 1.45, -3], 40), C([-4.9, 1.7, -0.2], [-6, 1.5, -3], 36))},
  {from: 11.92, to: FEAST, loc: 'ext', cam: lerp(C([8, 4.2, 10], [2, 0.8, 3], 46), C([7, 3.6, 7], [2, 0.8, 1], 44))},
  {from: FEAST, to: WALK, loc: 'ext', cam: lerp(C([3.5, 1.7, 0.5], [12, 2.6, -12], 48), C([5.2, 1.9, -2.6], [12, 2.6, -12], 42))},
  {from: WALK, to: BLUSH, loc: 'hall', cam: lerp(C([4.4, 2.2, 4.6], [2.5, 1, 1.5], 46), C([2.6, 1.9, 3.8], [0.4, 1, 1], 44))},
  {from: BLUSH, to: TOAST, loc: 'hall', cam: lerp(C([0.25, 1.34, -0.9], [0.2, 1.2, 0.8], 40), C([0.15, 1.3, -0.45], [0.1, 1.22, 0.8], 34))},
  {from: TOAST, to: ROAR, loc: 'hall', cam: lerp(C([-2.4, 1.5, 1.4], [-4.6, 1.75, 0], 44), C([-2.9, 1.55, 1.0], [-4.6, 1.85, 0], 40))},
  {from: ROAR, to: GRANDPA, loc: 'hall', shake: 0.8, cam: lerp(C([0, 4.8, 5.2], [0, 0.8, 0], 50), C([0.5, 4.0, 4.0], [0, 0.9, 0], 46))},
  {from: GRANDPA, to: FACT2, loc: 'hall', cam: lerp(C([-1.4, 1.35, 0.4], [-1, 1.2, -0.8], 42), C([-1.25, 1.32, 0.1], [-1, 1.25, -0.8], 38))},
  {from: FACT2, to: LEAN, loc: 'hall', cam: lerp(C([-6, 3.2, 4.5], [0, 1, 0], 48), C([-4, 2.8, 5.5], [0.5, 1, 0], 46))},
  {from: LEAN, to: LYRA1, loc: 'hall', cam: lerp(C([0.3, 1.42, -1.4], [0.3, 1.2, 0.8], 40), C([0.3, 1.38, -1.0], [0.3, 1.2, 0.8], 36))},
  {from: LYRA1, to: HEART, loc: 'hall', cam: lerp(C([-0.15, 1.33, -0.55], LYRA_HEAD, 38), C([-0.05, 1.3, -0.3], LYRA_HEAD, 34))},
  {from: HEART, to: LYRA2, loc: 'hall', shake: 1.4, cam: lerp(C([0.05, 1.28, -0.35], YOU_HEAD, 32), C([0.03, 1.26, -0.2], YOU_HEAD, 26))},
  {from: LYRA2, to: DOORS - 0.1, loc: 'hall', cam: lerp(C([-0.35, 1.36, -0.6], [0.45, 1.22, 0.8], 38), C([-0.2, 1.3, -0.3], [0.5, 1.22, 0.8], 32))},
  {from: DOORS - 0.1, to: FIRST, loc: 'hall', shake: 1.6, cam: lerp(C([1.6, 1.6, 1.6], [7.8, 1.5, 1.2], 46), C([2.6, 1.5, 1.6], [7.8, 1.6, 1.2], 40))},
  {from: FIRST, to: END, loc: 'hall', cam: lerp(C([4.6, 0.8, 2.6], [5.9, 1.65, 1.2], 44), C([4.9, 0.85, 2.3], [5.9, 1.7, 1.2], 38))},
  {from: END, to: PROMISE1_SEC + 1, loc: 'hall', cam: lerp(C([-6.5, 3.4, 4.2], [2, 1, 0.5], 50), C([-5.5, 3.0, 3.6], [2, 1, 0.5], 48))},
];
const shotAt = (t: number) => Math.max(0, SHOTS.findIndex((s) => t >= s.from && t < s.to));
const camAt = (t: number): Cam => {
  const s = SHOTS[shotAt(t)];
  const c = handheld(s.cam(ease(t, s.from, s.to, Easing.inOut(Easing.sin))), t, 0.5);
  const sh = ((s.shake ?? 0) + (t > DOORS && t < DOORS + 0.5 ? 3 * (1 - (t - DOORS) / 0.5) : 0)) * 0.015;
  return sh ? {...c, pos: [c.pos[0] + Math.sin(t * 37) * sh, c.pos[1] + Math.sin(t * 43 + 1) * sh, c.pos[2]]} : c;
};

// ---------- props ----------
const M: React.FC<{c: string; e?: number}> = ({c, e = 0}) => <meshStandardMaterial color={c} emissive={c} emissiveIntensity={e} flatShading roughness={0.75} />;
const B: React.FC<{p: V3; s: V3; c: string; e?: number; r?: V3}> = ({p, s, c, e, r}) => <mesh position={p} rotation={r}><boxGeometry args={s} /><M c={c} e={e} /></mesh>;

// hall: x -8..8, z -6..5, door in the x=8 wall (z 0..2.4)
const Hall: React.FC<{t: number}> = ({t}) => {
  const door = t > DOORS ? ease(t, DOORS, DOORS + 0.35, Easing.out(Easing.back(1.4))) : 0;
  const fl = 1 + 0.15 * Math.sin(t * 13) + 0.1 * Math.sin(t * 7.3);
  return (
    <group>
      <B p={[0, -0.05, -0.5]} s={[16, 0.1, 11]} c="#5a3f2a" />
      <B p={[0, 2.4, -6]} s={[16, 4.8, 0.3]} c="#6e4e34" />
      <B p={[0, 2.4, 5]} s={[16, 4.8, 0.3]} c="#6e4e34" />
      <B p={[-8, 2.4, -0.5]} s={[0.3, 4.8, 11]} c="#6e4e34" />
      <B p={[8, 2.4, -3.1]} s={[0.3, 4.8, 5.8]} c="#6e4e34" />
      <B p={[8, 2.4, 3.7]} s={[0.3, 4.8, 2.6]} c="#6e4e34" />
      <B p={[8, 3.9, 1.2]} s={[0.3, 1.8, 2.4]} c="#6e4e34" />
      {[-6, -3, 0, 3, 6].map((x) => <B key={x} p={[x, 4.6, -0.5]} s={[0.35, 0.35, 11]} c="#3e2a1c" />)}
      {[-6, -2, 2, 6].map((x, i) => <B key={x} p={[x, 3.0, -5.8]} s={[1.1, 2.0, 0.05]} c={i % 2 ? '#8a2a2a' : '#2f6b5a'} />)}
      {/* door leaves, swinging inward */}
      {[0, 1].map((i) => <group key={i} position={[8, 0, i ? 2.4 : 0]} rotation={[0, (i ? 1 : -1) * door * 1.45, 0]}><B p={[-0.08, 1.5, i ? -0.6 : 0.6]} s={[0.12, 3.0, 1.2]} c="#4a3220" /></group>)}
      {/* night outside the door */}
      <mesh position={[9.6, 1.5, 1.2]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[4, 3.4]} /><meshBasicMaterial color="#26355e" /></mesh>
      {door > 0 && <pointLight position={[8.6, 2.2, 1.2]} intensity={6 * door} distance={9} color="#9fb4ff" />}
      {/* long table + benches */}
      <B p={[0, 0.72, 0]} s={[9, 0.1, 1.1]} c="#8a6240" />
      {[-4, -1.3, 1.3, 4].map((x) => <B key={x} p={[x, 0.36, 0]} s={[0.15, 0.7, 0.9]} c="#5a3f2a" />)}
      {[0.8, -0.8].map((z) => <B key={z} p={[0, 0.42, z]} s={[9, 0.08, 0.38]} c="#6a4a30" />)}
      {Array.from({length: 14}, (_, i) => <mesh key={i} position={[-4 + i * 0.62, 0.84, (i % 2 ? 0.3 : -0.3)]}><cylinderGeometry args={[0.05, 0.04, 0.14, 6]} /><M c="#b08a4a" /></mesh>)}
      {[-2.6, 0.9, 3].map((x) => <mesh key={x} position={[x, 0.83, 0]}><cylinderGeometry args={[0.26, 0.2, 0.1, 8]} /><M c="#c9a46a" /></mesh>)}
      {[-2.6, 0.9, 3].map((x) => <mesh key={`f${x}`} position={[x, 0.93, 0]}><icosahedronGeometry args={[0.15, 0]} /><M c="#c0603a" /></mesh>)}
      {/* fire pit */}
      <mesh position={[0, 0.15, -4]}><cylinderGeometry args={[0.9, 1.0, 0.3, 8]} /><M c="#4a4a4a" /></mesh>
      <mesh position={[0, 0.6, -4]} scale={[1, fl, 1]}><coneGeometry args={[0.55, 1.0, 6]} /><meshBasicMaterial color="#ffa040" /></mesh>
      <mesh position={[0, 0.5, -4]} scale={[1, fl * 0.8, 1]}><coneGeometry args={[0.32, 0.7, 6]} /><meshBasicMaterial color="#ffe08a" /></mesh>
      <pointLight position={[0, 1.6, -4]} intensity={14 * fl} distance={14} decay={1.4} color="#ff9a4a" />
      {[[-6, 3.2, 4.7], [6, 3.2, 4.7], [-6, 3.2, -5.7], [6, 3.2, -5.7]].map((p, i) => <group key={i}><mesh position={p as V3}><octahedronGeometry args={[0.14, 0]} /><meshBasicMaterial color="#ffd27a" /></mesh><pointLight position={p as V3} intensity={3} distance={7} color="#ffb060" /></group>)}
    </group>
  );
};

const HOUSES = [[-8, -7, 0.2, '#8a2a2a', 1.4], [4, -24, -0.4, '#6b4a2e', 1], [-7, 7, 0.6, '#5a6b3a', 1], [8, 6, -0.3, '#6b4a2e', 1], [-12, 1, 0.3, '#4a5a6b', 1], [13, -1, -0.2, '#7a5a3a', 1], [-3, -14, 0, '#6b4a2e', 1.1]] as const;
const House: React.FC<{roof: string; s: number; lit: number}> = ({roof, s, lit}) => (
  <group scale={s}>
    <B p={[0, 1.2, 0]} s={[3.2, 2.4, 3]} c="#d8c8a8" />
    <mesh position={[0, 3.1, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[2.6, 1.6, 4]} /><M c={roof} /></mesh>
    <B p={[0, 0.8, 1.51]} s={[0.8, 1.6, 0.04]} c="#4a3220" />
    {[-1, 1].map((x) => <B key={x} p={[x, 1.6, 1.51]} s={[0.6, 0.5, 0.04]} c="#ffd27a" e={lit} />)}
  </group>
);
const PINES = Array.from({length: 30}, (_, i) => { const a = rnd(i + 20) * Math.PI * 2, r = 18 + rnd(i + 40) * 30; return {x: Math.cos(a) * r, z: Math.sin(a) * r, s: 0.8 + rnd(i + 60) * 0.9}; });
const Pine: React.FC<{s: number}> = ({s}) => (
  <group scale={s}><mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.18, 0.25, 1.6, 5]} /><M c="#4a3424" /></mesh><mesh position={[0, 3.0, 0]}><coneGeometry args={[1.5, 3.4, 6]} /><M c="#24452c" /></mesh></group>
);
const Forge: React.FC<{t: number}> = ({t}) => (
  <group>
    {[[-1.6, -1.2], [1.6, -1.2], [-1.6, 1.2], [1.6, 1.2]].map(([x, z], i) => <B key={i} p={[x, 1.4, z - 0.6]} s={[0.16, 2.8, 0.16]} c="#4a3424" />)}
    <B p={[0, 2.9, -0.6]} s={[3.8, 0.15, 3]} c="#5a4a3a" r={[0.1, 0, 0]} />
    <B p={[-1.0, 0.5, -1.4]} s={[1.2, 1.0, 1.0]} c="#555" />
    <B p={[-1.0, 1.02, -1.4]} s={[0.9, 0.05, 0.7]} c="#ff6a20" e={1.2 + 0.4 * Math.sin(t * 9)} />
    <pointLight position={[-1.0, 1.5, -1.2]} intensity={6} distance={6} color="#ff7a30" />
    <B p={[0.2, 0.35, 0.5]} s={[0.3, 0.7, 0.3]} c="#3a3028" />
    <B p={[0.2, 0.78, 0.5]} s={[0.7, 0.18, 0.3]} c="#2c2c30" />
    {t > 5.84 && t < 8.74 && Array.from({length: 10}, (_, i) => { const k = ((t * 1.6 + rnd(i)) % 1); return <mesh key={i} position={[0.2 + (rnd(i + 5) - 0.5) * 1.2 * k, 0.9 + k * 0.9 - k * k * 0.8, 0.5 + (rnd(i + 9) - 0.3) * k]}><octahedronGeometry args={[0.025, 0]} /><meshBasicMaterial color="#ffc040" /></mesh>; })}
  </group>
);
const Village: React.FC<{t: number}> = ({t}) => {
  const night = ease(t, FEAST - 0.1, FEAST + 0.1);
  const top = new THREE.Color('#3a3a7a').lerp(new THREE.Color('#0a1028'), night), bot = new THREE.Color('#ff9a5a').lerp(new THREE.Color('#2a2a5a'), night);
  const youWalk = t > 11.92 && t < FEAST;
  const yz = youWalk ? mix(8, 1.5, ease(t, 11.92, FEAST, Easing.linear)) : 0;
  return (
    <>
      <Sky top={top} bot={bot} />
      <Stars k={night * 0.8} />
      <fog attach="fog" args={[bot, 30, 120]} />
      <hemisphereLight args={[night ? '#8a9ad0' : '#ffd8b0', '#3a3020', 0.9 - night * 0.3]} />
      <directionalLight position={[30, 20, -20]} intensity={1.1 - night * 0.7} color={night ? '#8fa8ff' : '#ff9a5a'} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[120, 24]} /><M c="#4a6a34" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, 0.01, 2]}><planeGeometry args={[2.4, 40]} /><M c="#8a7050" /></mesh>
      {HOUSES.map(([x, z, r, c, s], i) => <group key={i} position={[x, 0, z]} rotation={[0, r, 0]}><House roof={c} s={s} lit={0.3 + night * 1.2} /></group>)}
      {PINES.map((p, i) => <group key={i} position={[p.x, 0, p.z]}><Pine s={p.s} /></group>)}
      <Forge t={t} />
      {/* the feast hall, lit */}
      <group position={[12, 0, -12]} rotation={[0, -0.6, 0]}>
        <B p={[0, 2, 0]} s={[9, 4, 5]} c="#7a5a3a" />
        <mesh position={[0, 5, 0]} rotation={[0, 0, 0]} scale={[1.6, 1, 1]}><coneGeometry args={[3.6, 2.4, 4]} /><M c="#3e2a1c" /></mesh>
        {[-3, -1, 1, 3].map((x) => <B key={x} p={[x, 2.2, 2.52]} s={[0.9, 0.9, 0.04]} c="#ffc060" e={1.4} />)}
        <pointLight position={[0, 2.5, 4]} intensity={night * 10} distance={14} color="#ffb060" />
      </group>
      {/* you */}
      {t < 11.92 && <group position={[0.2, 0, 1.1]} rotation={[0, Math.PI, 0]}><Person look={youLook(t)} arms={0.4} reach={t > 5.84 && t < 8.74 ? Math.abs(Math.sin(t * 5)) : 0} headTilt={-0.3} /></group>}
      {youWalk && <group position={[2, 0, yz]} rotation={[0, Math.PI, 0]}><Person look={L.you} walk={t * 8} walkAmt={1} headTilt={-0.4} /></group>}
      {/* Lyra at the chief's house */}
      {t < 11.92 && <group position={[-6, 0, -3]} rotation={[0, 0.3, 0]}><Person look={L.lyra} headYaw={Math.sin(t) * 0.15} /></group>}
      {/* girls who veer off the road */}
      {youWalk && [0, 1, 2].map((i) => {
        const z = mix(-3 - i * 0.8, 6, ease(t, 11.92, FEAST, Easing.linear)), near = Math.max(0, 1 - Math.abs(z - yz) / 3.5);
        const x = 2.2 + (i - 1) * 0.6 + Math.max(near, z > yz ? 1 : 0) * (2.6 + i * 0.4);
        return <group key={i} position={[x, 0, z]} rotation={[0, z > yz ? 0.4 : -0.5, 0]}><Person look={student(i * 2 + 1)} walk={t * 8 + i} walkAmt={1} headYaw={z > yz ? -0.8 : 0} /></group>;
      })}
    </>
  );
};

const Feast: React.FC<{t: number}> = ({t}) => {
  const ch = cheer(t);
  const lyraSeated = t < 4.26 || t >= SIT;
  const lw = ease(t, WALK, SIT, Easing.linear);
  const lean = t > LEAN && t < END ? ease(t, LEAN, LEAN + 0.6) : 0;
  const lyraLean = t > LYRA2 && t < DOORS ? ease(t, LYRA2, LYRA2 + 0.5) : 0;
  const turnDoor = t > DOORS + 0.2 ? ease(t, DOORS + 0.2, DOORS + 0.8) : 0;
  const rk = ease(t, RIDER - 0.4, FIRST + 0.8, Easing.out(Easing.quad));
  return (
    <>
      <color attach="background" args={['#120a06']} />
      <hemisphereLight args={['#ffd2a0', '#3a2414', 0.75]} />
      <directionalLight position={[3, 6, 4]} intensity={0.35} color="#ffcf9a" />
      <Hall t={t} />
      {SEATS.map(([x, side], i) => <group key={i} position={[x, 0, side * 0.8]} rotation={[0, side > 0 ? Math.PI : 0, 0]}><Person look={student(i + 3)} sit={1} armUp={ch * (i % 3 ? 1 : 0.7)} arms={0.25} headYaw={turnDoor * (side > 0 ? -1.1 : 1.1)} /></group>)}
      {/* you (rotation PI → facing -z, local -x = world +x toward Lyra) */}
      <group position={[0, 0, 0.8]} rotation={[0, Math.PI, 0]}><Person look={youLook(t)} sit={1} arms={0.3} headYaw={-0.9 * lean - 0.5 * (t > WALK && t < SIT ? ease(t, WALK, SIT) : 0) + turnDoor * -1.2} lean={0.15 * lean} headTilt={t > GRANDPA && t < FACT2 ? 0.2 : 0} /></group>
      {/* Lyra */}
      {lyraSeated
        ? <group position={[0.6, 0, 0.8]} rotation={[0, Math.PI, 0]}><Person look={L.lyra} sit={1} arms={0.3} headYaw={(t > BLUSH && t < TOAST) || (t > LYRA1 && t < DOORS) ? 0.8 : turnDoor * -1.2} lean={0.2 * lyraLean} /></group>
        : t >= WALK && <group position={[mix(5.5, 0.9, lw), 0, mix(2.2, 1.4, lw)]} rotation={[0, -Math.PI / 2 - 0.2, 0]}><Person look={L.lyra} walk={t * 8} walkAmt={1} headYaw={-0.3} /></group>}
      {/* chief at the head of the table */}
      <group position={[-4.7, 0, 0]} rotation={[0, Math.PI / 2, 0]}><Person look={L.chief} armUp={t < 2.86 || (t > TOAST && t < GRANDPA) ? 1 : 0} headYaw={turnDoor * 1.0} /></group>
      {t < 2.86 || (t > TOAST && t < GRANDPA) ? <mesh position={[-4.7, 2.6, -0.26]}><cylinderGeometry args={[0.07, 0.05, 0.18, 6]} /><M c="#c9a24a" e={0.2} /></mesh> : null}
      {/* grandpa across from you */}
      <group position={[-1, 0, -0.8]}><Person look={L.grandpa} sit={1} arms={0.3} headYaw={t > GRANDPA && t < FACT2 ? 0.5 : turnDoor * 1.3} /></group>
      {/* rider */}
      {t > RIDER - 0.4 && <group position={[mix(8.6, 6.0, rk), 0, 1.2]} rotation={[0, -Math.PI / 2, 0]}>
        <Person look={L.rider} walk={t * 6} walkAmt={rk < 1 ? 0.7 : 0} armUp={t > FIRST ? ease(t, FIRST, FIRST + 0.4) : 0} />
        <B p={[0, 1.15, -0.2]} s={[0.55, 1.2, 0.08]} c="#0a0a0e" />
        {t > FIRST && <mesh position={[0.26, 2.15, 0.12]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04, 0.04, 0.3, 6]} /><M c="#e8dcb0" /></mesh>}
        {t > FIRST && <mesh position={[0.26, 2.15, 0.16]}><sphereGeometry args={[0.04, 6, 4]} /><meshBasicMaterial color="#c01818" /></mesh>}
      </group>}
    </>
  );
};

const World: React.FC<{t: number}> = ({t}) => (SHOTS[shotAt(t)].loc === 'ext' ? <Village t={t} /> : <Feast t={t} />);

// ---------- HUD ----------
const fmtClock = (m: number) => { const h = Math.floor(m / 60) % 24, mm = Math.floor(m % 60); return `${((h + 11) % 12) + 1}:${String(mm).padStart(2, '0')} PM`; };
const clockMin = (t: number) => (t < 4.26 ? 1170 : t < FEAST ? interpolate(t, [0, FEAST], [1080, 1102], CL) : interpolate(t, [FEAST, PROMISE1_SEC], [1170, 1201], CL));
const bpm = (t: number) => Math.round(interpolate(t, [0, BLUSH, BLUSH + 1.5, ROAR, LEAN, HEART, HEART + 0.8, DOORS, END], [74, 76, 118, 124, 110, 138, 146, 150, 162], CL));
const HUD: React.FC<{t: number}> = ({t}) => {
  if (t < 2.86 || t > END) return null;
  const k = ease(t, 2.86, 3.2, Easing.out(Easing.cubic));
  const promised = t > ROAR, rivals = t > FIRST ? 1 : 0;
  const beat = 1 + 0.08 * Math.max(0, Math.sin(t * bpm(t) / 60 * Math.PI * 2));
  return (
    <div style={{position: 'absolute', left: 56, right: 56, top: 92, display: 'flex', justifyContent: 'space-between', opacity: k, transform: `translateY(${(1 - k) * -40}px)`, fontFamily: FONT}}>
      <div style={{color: 'white', textShadow: '0 3px 12px rgba(0,0,0,0.7)'}}>
        <div style={{fontWeight: 800, fontSize: 28, letterSpacing: '0.16em', color: ACC.red}}>● DAY 1 <span style={{color: 'white', opacity: 0.8}}>· THE PROMISE</span></div>
        <div style={{fontWeight: 900, fontSize: 76, lineHeight: 1, marginTop: 6}}>{fmtClock(clockMin(t))}</div>
        <div style={{marginTop: 10, transform: `scale(${promised && t < ROAR + 0.8 ? 1 + 0.25 * (1 - (t - ROAR) / 0.8) : 1})`, transformOrigin: 'left center'}}>
          <Pill color={promised ? ACC.amber : '#bbbbbb'} size={28}><span style={{color: promised ? ACC.amber : '#bbbbbb'}}>{promised ? 'PROMISED' : "SMITH'S BOY"}</span>STATUS</Pill>
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14}}>
        {t > BLUSH && <div style={{transform: `scale(${pop(t, BLUSH) * beat})`, transformOrigin: 'right center'}}><Pill color={ACC.red} size={30}><span style={{color: ACC.red}}>♥ {bpm(t)}</span>BPM</Pill></div>}
        {t > 8.74 && <div style={{transform: `scale(${pop(t, 8.74)})`, transformOrigin: 'right center'}}><Pill color="#FF7AC8" size={30}><span style={{color: '#FF9AD5'}}>{t < WALK ? '0' : t < LYRA1 ? '1' : '3'}</span>{t >= WALK && t < LYRA1 ? 'WORD' : 'WORDS'} FROM LYRA</Pill></div>}
        {t > FIRST && <div style={{transform: `scale(${pop(t, FIRST)})`, transformOrigin: 'right center'}}><Pill color={ACC.red} size={30}><span style={{color: ACC.red}}>{rivals}</span>RIVAL OATH</Pill></div>}
      </div>
    </div>
  );
};

// ---------- beats ----------
const Beats: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const {width: W, height: Hh} = useVideoConfig();
  const proj = projector(cam, W, Hh);
  return (
    <>
      {t < 2.86 && <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 150, lineHeight: 0.92, color: 'white', WebkitTextStroke: '6px rgba(0,0,0,0.85)', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(0,0,0,0.45)', transform: `scale(${mix(1.1, 1, ease(t, 0, 2.6))})`}}>THE<br /><span style={{color: ACC.amber}}>PROMISE</span></div>}
      {t > 2.9 && t < 4.26 && (() => { const s = proj([0, 1.55, 0.8]); return <Tag x={s.x} y={s.y} text="YOU" k={pop(t, 2.95)} color="#19e0cf" />; })()}
      {t > 4.4 && t < 5.84 && (() => { const s = proj([0.2, 2.0, 1.1]); return <Tag x={s.x} y={s.y} text="BLACKSMITH'S BOY" k={pop(t, 4.46)} color={ACC.amber} />; })()}
      {t > 9.1 && t < 11.92 && (() => { const s = proj([-6, 2.05, -3]); return <Tag x={s.x} y={s.y} text="LYRA · CHIEF'S DAUGHTER" k={pop(t, 9.16)} color="#FF7AC8" />; })()}
      {t > 13.0 && t < FEAST && <svg width={W} height={Hh} style={{position: 'absolute', inset: 0}}>{(() => { const a = proj([2.6, 1.0, 2.5]), b = proj([5.4, 1.0, 3.5]); return <path d={`M${a.x},${a.y} Q${(a.x + b.x) / 2},${a.y - 120} ${b.x},${b.y}`} stroke={ACC.red} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray="30 20" opacity={pop(t, 13.04)} />; })()}</svg>}
      <Stamp t={t} at={FEAST + 0.2} out={WALK - 0.2} text="HARVEST FEAST" color={ACC.amber} y={380} size={120} />
      {t > 17.7 && t < SIT && [0, 1, 2].map((i) => { const s = proj([4.4 - i * 1.2, 0.7, 0.8]); return <div key={i} style={{position: 'absolute', left: s.x, top: s.y, transform: `translate(-50%,-50%) scale(${pop(t, 17.72 + i * 0.28)})`}}><svg width={90} height={90} viewBox="-50 -50 100 100"><path d="M-35,-35 L35,35 M35,-35 L-35,35" stroke={ACC.red} strokeWidth={16} strokeLinecap="round" /></svg></div>; })}
      <Card t={t} at={FACT1} out={TOAST - 0.2} y={300} accent={ACC.red}>
        <div style={{fontSize: 30, fontWeight: 800, letterSpacing: '0.16em', color: ACC.red}}>WHY YOU BLUSH</div>
        <div style={{fontSize: 64, fontWeight: 900, lineHeight: 1.08, marginTop: 10}}>ADRENALINE <span style={{color: ACC.red}}>→</span><br />cheek veins <span style={{color: ACC.red}}>widen</span></div>
      </Card>
      <Stamp t={t} at={ROAR + 0.1} out={GRANDPA - 0.2} text="PROMISED?!" color={ACC.amber} y={560} size={150} />
      <Card t={t} at={FACT2 + 0.1} out={LEAN - 0.15} y={300} accent={ACC.amber}>
        <div style={{fontSize: 30, fontWeight: 800, letterSpacing: '0.16em', color: ACC.amber}}>MEDIEVAL CHURCH LAW</div>
        <div style={{fontSize: 92, fontWeight: 900, lineHeight: 1.05, marginTop: 8}}>BETROTHED <span style={{color: ACC.amber}}>AT 7</span></div>
        <div style={{fontSize: 38, fontWeight: 700, marginTop: 14, opacity: 0.85}}>families sealed it, kids had no say</div>
      </Card>
      {t > HEART && t < LYRA2 && <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 35%, rgba(180,0,0,${0.35 + 0.25 * Math.max(0, Math.sin(t * 15))}) 100%)`}} />}
      {t > CURSED && t < DOORS && <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 190, color: '#c873ff', WebkitTextStroke: '7px #000', paintOrder: 'stroke fill', transform: `scale(${mix(1.6, 1, Math.min(1, pop(t, CURSED, 0.2)))}) rotate(-4deg)`}}>"CURSED"</div>}
      <Stamp t={t} at={DOORS} out={RIDER - 0.1} text="BANG" color={ACC.red} y={620} size={230} />
      {t > RIDER && t < FIRST && (() => { const s = proj([6.6, 2.1, 1.2]); return <Tag x={s.x} y={s.y} text="RIDER IN BLACK" k={pop(t, RIDER + 0.05)} color={ACC.red} />; })()}
      <Stamp t={t} at={52.5} out={END - 0.1} text="PROMISED FIRST" sub="ANOTHER FAMILY'S OATH" color={ACC.red} y={500} size={120} />
      {t > END && <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: FONT}}>
        <div style={{opacity: pop(t, END + 0.05), transform: `scale(${mix(1.4, 1, Math.min(1, pop(t, END + 0.05)))})`, fontWeight: 900, fontSize: 150, lineHeight: 0.95, color: 'white', WebkitTextStroke: '6px rgba(0,0,0,0.85)', paintOrder: 'stroke fill'}}>
          <div style={{color: '#FF9AD5'}}>LYRA</div><div style={{color: ACC.amber, fontSize: 80, margin: '14px 0'}}>OR</div><div>THE OATH?</div>
        </div>
        <div style={{marginTop: 50, display: 'flex', justifyContent: 'center', gap: 24, opacity: ease(t, END + 1.7, END + 2.1)}}>
          <Pill color="#FF7AC8" size={38}><span style={{color: '#FF9AD5'}}>A</span>LYRA</Pill>
          <Pill color={ACC.red} size={38}><span style={{color: ACC.red}}>B</span>FIRST OATH</Pill>
        </div>
        <div style={{marginTop: 40, fontWeight: 800, fontSize: 36, letterSpacing: '0.2em', color: ACC.amber, opacity: ease(t, END + 3.0, END + 3.4)}}>DAY 2 → FOLLOW</div>
      </div>}
      {t > DOORS && t < DOORS + 0.35 && <AbsoluteFill style={{background: '#cfd8ff', opacity: 0.4 * (1 - (t - DOORS) / 0.35)}} />}
    </>
  );
};

// ---------- captions ----------
const KEYS: Record<string, string> = {
  village: ACC.amber, married: ACC.red, last: ACC.red, know: ACC.red, "blacksmith's": ACC.amber, soot: '#bbbbbb', holes: '#bbbbbb',
  lyra: '#FF9AD5', "chief's": ACC.amber, daughter: '#FF9AD5', never: ACC.red, every: ACC.red, girl: '#FF9AD5', crosses: ACC.red,
  harvest: ACC.amber, feast: ACC.amber, three: ACC.lime, empty: ACC.lime, benches: ACC.lime, next: '#FF9AD5', face: ACC.red, burns: ACC.red, red: ACC.red,
  adrenaline: ACC.red, widening: ACC.blue, blood: ACC.red, vessels: ACC.red, roars: ACC.amber, everyone: ACC.amber,
  medieval: ACC.amber, church: ACC.amber, law: ACC.amber, promise: ACC.lime, children: ACC.lime, seven: ACC.lime, whisper: ACC.blue, joke: ACC.blue,
  heart: ACC.red, pounding: ACC.red, doors: ACC.red, crash: ACC.red, rider: ACC.red, black: ACC.red, another: ACC.red, family: ACC.red, first: ACC.red,
  oath: ACC.amber, comment: ACC.lime, a: ACC.lime, b: ACC.lime,
};
const LINES: {from: number; to: number; who: string; color: string}[] = [
  {from: TOAST, to: ROAR - 0.05, who: 'CHIEF TORVALD', color: ACC.amber}, {from: GRANDPA, to: FACT2 - 0.05, who: 'GRANDPA EDRIN', color: ACC.blue},
  {from: LYRA1, to: HEART - 0.05, who: 'LYRA', color: '#FF9AD5'}, {from: LYRA2, to: 47.7, who: 'LYRA', color: '#FF9AD5'},
];
const lineOf = (s: number) => LINES.find((l) => s >= l.from && s < l.to);
const NARR = WORDS.filter((w) => !lineOf(w[1]));
const all = (c: string) => new Proxy({}, {get: () => c}) as Record<string, string>;
const SpeakerCaptions: React.FC<{t: number}> = ({t}) => {
  const l = LINES.find((x) => t >= x.from - 0.05 && t < x.to + 0.3);
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
  [0, 'boom', 0.6], [0, 'impact', 0.5], [0.05, 'swell_hit', 0.4], [2.86, 'glitch', 0.35], [2.9, 'whoosh', 0.3], [4.26, 'clunk', 0.5], [5.84, 'clunk', 0.45], [6.5, 'clunk', 0.4], [7.2, 'clunk', 0.4],
  [8.74, 'whoosh', 0.3], [9.16, 'pop', 0.3], [11.92, 'whoosh', 0.25], [13.04, 'scratch', 0.35], [FEAST, 'whoosh_long', 0.3], [FEAST + 0.2, 'impact', 0.45],
  [WALK, 'whoosh', 0.25], [17.72, 'pop', 0.25], [18.0, 'pop', 0.25], [18.28, 'pop', 0.25], [SIT, 'clunk', 0.45], [BLUSH, 'heartbeat', 0.5], [21.0, 'heartbeat', 0.5], [FACT1, 'ding', 0.3],
  [TOAST, 'swell_hit', 0.4], [ROAR, 'boom', 0.55], [ROAR + 0.1, 'impact', 0.5], [GRANDPA, 'whoosh', 0.25], [FACT2 + 0.1, 'ding', 0.3], [LEAN, 'whoosh', 0.2],
  [LYRA1, 'riser', 0.3], [HEART, 'heartbeat', 0.7], [42.6, 'heartbeat', 0.75], [LYRA2, 'heartbeat', 0.45], [CURSED, 'glitch', 0.5], [CURSED, 'impact', 0.55],
  [DOORS, 'boom', 0.9], [DOORS, 'clunk', 0.8], [RIDER, 'growl', 0.35], [FIRST, 'riser', 0.3], [52.5, 'impact', 0.6], [END, 'boom', 0.55], [END + 1.8, 'pop', 0.3], [END + 2.2, 'heartbeat', 0.45],
];

export const PromiseDay1: React.FC = () => {
  const {width: W, height: Hh} = useVideoConfig();
  const t = useT();
  const cam = camAt(t);
  const dim = t > END ? 0.45 * ease(t, END, END + 0.4) : 0;
  return (
    <AbsoluteFill style={{background: '#05070c'}}>
      <ThreeCanvas width={W} height={Hh} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
        <CameraRig cam={cam} />
        <World t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'black', opacity: dim}} />
      <Vignette />
      <Grain />
      <HUD t={t} />
      <Beats t={t} cam={cam} />
      <SpeakerCaptions t={t} />
      <CutFlash t={t} />
      <AbsoluteFill style={{background: 'black', opacity: ease(t, PROMISE1_SEC - 0.5, PROMISE1_SEC)}} />
      <DayAudio job={JOB} sec={PROMISE1_SEC} sfx={SFX} musicVol={0.12} />
    </AbsoluteFill>
  );
};

// ---------- thumbnail ----------
export const PromiseDay1Thumb: React.FC = () => {
  const {width: W, height: Hh} = useVideoConfig();
  const t = 21.0;
  const cam: Cam = {pos: [0.32, 1.34, -0.85], look: [0.3, 1.2, 0.8], fov: 40};
  return (
    <AbsoluteFill style={{background: '#05070c', fontFamily: FONT}}>
      <ThreeCanvas width={W} height={Hh} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
        <CameraRig cam={cam} />
        <Feast t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.75) 100%)'}} />
      <div style={{position: 'absolute', top: 130, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: ACC.red, color: 'white', fontWeight: 900, fontSize: 52, letterSpacing: '0.14em', padding: '12px 34px', borderRadius: 999}}>THE PROMISE</div>
        <div style={{fontWeight: 900, fontSize: 300, lineHeight: 0.9, color: 'white', marginTop: 30, WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', textShadow: '0 12px 0 rgba(0,0,0,0.5)'}}>DAY 1</div>
      </div>
      <div style={{position: 'absolute', bottom: 260, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontWeight: 900, fontSize: 100, lineHeight: 1, color: 'white', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>PROMISED TO HER</div>
        <div style={{fontWeight: 900, fontSize: 100, lineHeight: 1, color: ACC.lime, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>AT BIRTH</div>
      </div>
    </AbsoluteFill>
  );
};
