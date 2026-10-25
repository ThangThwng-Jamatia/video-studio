// LOCKDOWN — Day 2 (Day Series, 9:16). Night run to the cafeteria to get your best friend. Low-poly 3D world keyed to words in lockdownDay2Words.ts.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {ACC, Cam, CameraRig, Captions, Card, DayAudio, ease, FONT, Grain, handheld, mix, mix3, Pill, pop, projector, Sfx, Sky, Stamp, Stars, Tag, useT, V3, Vignette} from './dayKit';
import {Cafeteria, Chair, Desk, Exterior, FloorPlan, Interior, Look, LOOKS, Person, Stairwell, student, WalkIn, zombify, CAFE_ROOM, YOUR_ROOM} from './schoolKit';
import {WORDS} from './lockdownDay2Words';

export const LOCKDOWN2_SEC = 74.0;
const JOB = 'jobs/lockdown-day2';
const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// ---------- story clock (Day 1 ended ~7:06 PM, phone 37%) ----------
const clockMin = (t: number) => interpolate(t, [0, 32.2, 47, 61.0, 61.3, 74], [1146, 1151, 1158, 1166, 1440, 1446], CL);
const ALARM_OFF = 32.18;
const strobeAt = (t: number) => (t < ALARM_OFF ? (Math.sin(t * Math.PI * 2 * 1.2) > 0.25 ? 1 : 0.08) : 0);

// ---------- shots ----------
type Loc = 'ext' | 'in' | 'map' | 'cafe' | 'stair' | 'frz';
type Shot = {from: number; to: number; loc: Loc; ceil?: boolean; shake?: number; cam: (k: number, t: number) => Cam};
const C = (pos: V3, look: V3, fov = 40): Cam => ({pos, look, fov});
const lerp = (a: Cam, b: Cam) => (k: number): Cam => ({pos: mix3(a.pos, b.pos, k), look: mix3(a.look, b.look, k), fov: mix(a.fov, b.fov, k)});

// your path down the hallway (toward the stairwell at the +z end)
const youZ = (t: number) => (t < 10.6 ? 2.6 : Math.min(15.0, 3.2 + (t - 10.6) * 0.3));
const youX = (t: number) => (t < 9.9 ? 5.15 : t < 10.6 ? mix(5.15, 7.4, ease(t, 9.9, 10.6)) : 7.4);
const follow = (dx: number, dy: number, dz: number, lx: number, ly: number, lz: number, fov = 42) => (k: number, t: number): Cam => {
  const z = youZ(t);
  return C([7.4 + dx, dy, z + dz], [7.4 + lx, ly, z + lz], fov);
};

const SHOTS: Shot[] = [
  {from: 0, to: 2.36, loc: 'ext', cam: lerp(C([-18, 3, 28], [0, 4.5, 0], 44), C([-11, 3.4, 20], [0, 4.5, 0], 42))},
  {from: 2.36, to: 4.72, loc: 'map', cam: lerp(C([-4, 62, 10], [0, 0, 0.5], 42), C([1, 50, 7], [1, 0, 1], 42))},
  {from: 4.72, to: 5.8, loc: 'in', ceil: true, cam: lerp(C([2.9, 2.6, -0.4], [4.6, 0.6, -3.4], 46), C([3.3, 2.3, -0.9], [4.6, 0.6, -3.4], 44))},
  {from: 5.8, to: 7.06, loc: 'cafe', cam: lerp(C([6.2, 2.4, 4.2], [1.4, 0.6, 0.2], 46), C([4.6, 1.6, 2.8], [1.4, 0.5, 0.2], 42))},
  {from: 7.06, to: 8.62, loc: 'in', ceil: true, cam: lerp(C([3.9, 1.0, -2.55], [5.2, 0.85, -2.8], 40), C([3.6, 1.1, -2.2], [5.0, 0.8, -3.2], 46))},
  {from: 8.62, to: 9.78, loc: 'in', ceil: true, cam: lerp(C([3.0, 1.3, -0.9], [5.15, 1.2, -2.75], 44), C([3.3, 1.5, -1.2], [5.15, 1.5, -2.75], 40))},
  {from: 9.78, to: 13.1, loc: 'in', ceil: true, shake: 1, cam: lerp(C([7.9, 1.6, 9], [7.2, 1.2, -6], 46), C([7.9, 1.6, 7.6], [7.2, 1.2, -6], 44))},
  {from: 13.1, to: 16.96, loc: 'in', ceil: true, cam: follow(1.0, 2.2, 3.6, 0.1, 1.1, -7, 46)},
  {from: 16.96, to: 18.94, loc: 'in', ceil: true, cam: follow(1.0, 0.35, 1.5, 0, 0.15, 0, 44)},
  {from: 18.94, to: 24.06, loc: 'in', ceil: true, shake: 0.6, cam: follow(-1.1, 1.5, 1.2, 1.0, 1.2, 0, 46)},
  {from: 24.06, to: 26.38, loc: 'in', ceil: true, cam: follow(1.1, 0.55, 1.3, 0, 0.2, -0.3, 44)},
  {from: 26.38, to: 32.18, loc: 'in', ceil: true, cam: follow(0.9, 1.65, 1.2, 0, 1.3, 0, 44)},
  {from: 32.18, to: 35.04, loc: 'in', ceil: true, cam: follow(0.7, 2.0, 4.5, 0, 1.0, -3, 48)},
  {from: 35.04, to: 42.18, loc: 'in', ceil: true, cam: follow(0.15, 1.6, 0.75, 0.3, 1.4, 8, 56)},
  {from: 42.18, to: 47.1, loc: 'stair', cam: lerp(C([1.7, 1.9, -1.7], [0, 1.2, 2.6], 52), C([1.5, 1.7, -1.2], [-0.6, 0.9, 1.4], 48))},
  {from: 47.1, to: 50.76, loc: 'cafe', cam: lerp(C([3.4, 0.7, 2.6], [1.4, 0.5, 0.1], 44), C([2.7, 0.6, 1.8], [1.4, 0.55, 0.1], 40))},
  {from: 50.76, to: 52.88, loc: 'cafe', cam: lerp(C([1.0, 3.4, 6.2], [5.5, 0.4, -0.6], 52), C([2.6, 3.2, 5.6], [7, 0.6, -1.0], 50))},
  {from: 52.88, to: 58.22, loc: 'frz', cam: lerp(C([-1.0, 1.6, -1.1], [0.7, 1.0, 1.5], 50), C([-0.6, 1.4, -0.6], [0.5, 1.0, 1.5], 44))},
  {from: 58.22, to: 61.2, loc: 'frz', cam: lerp(C([1.2, 2.15, 1.2], [-0.4, 0.5, -0.6], 56), C([1.0, 2.0, 0.9], [-0.5, 0.5, -0.7], 52))},
  {from: 61.2, to: 64.72, loc: 'frz', cam: lerp(C([1.1, 1.3, 1.1], [-0.5, 0.6, -0.9], 50), C([0.9, 1.2, 0.9], [-0.5, 0.6, -0.9], 46))},
  {from: 64.72, to: 68.44, loc: 'frz', shake: 1.2, cam: lerp(C([-0.7, 1.3, -0.8], [0.6, 1.0, 1.5], 46), C([-0.5, 1.2, -0.4], [0.7, 0.9, 1.5], 40))},
  {from: 68.44, to: 70.1, loc: 'frz', cam: lerp(C([0.9, 1.15, 0.8], [-0.4, 0.7, -0.9], 44), C([0.7, 1.1, 0.6], [-0.4, 0.7, -0.9], 40))},
  {from: 70.1, to: LOCKDOWN2_SEC + 1, loc: 'frz', cam: lerp(C([-0.5, 1.2, -0.5], [0.7, 1.1, 1.5], 46), C([-1.0, 1.5, -1.1], [0.7, 1.0, 1.5], 52))},
];
const shotAt = (t: number) => Math.max(0, SHOTS.findIndex((s) => t >= s.from && t < s.to));
const camAt = (t: number): Cam => {
  const s = SHOTS[shotAt(t)];
  const base = s.cam(ease(t, s.from, s.to, Easing.inOut(Easing.sin)), t);
  const c = handheld(base, t, 1);
  const sh = (s.shake ?? 0) * 0.012;
  return sh ? {...c, pos: [c.pos[0] + Math.sin(t * 37) * sh, c.pos[1] + Math.sin(t * 43 + 1) * sh, c.pos[2]]} : c;
};

// ---------- cast ----------
const SEATS: [number, number][] = [[-4, -2.4], [-2, -2.4], [2, -2.4], [-4, -0.4], [-2, -0.4], [0, -0.4], [2, -0.4], [-2, 1.6], [0, 1.6]];
const CORNER: [number, number][] = [[4.4, -2.75], [3.65, -2.9], [5.15, -3.55], [4.4, -3.55], [3.65, -3.7], [5.15, -4.35], [4.4, -4.35], [3.65, -4.45], [5.15, -2.75]];
const YOU = 8;
const SOCKS = '#5a6372';
const youLook = (t: number): Look => ({...LOOKS.you, shoes: t > 24.4 ? SOCKS : undefined});
const HORDE = [0, 1, 2, 3, 4, 5].map((i) => ({x: 6.9 + (i % 3) * 0.9, z: -8 - i * 1.3, look: zombify(student(11 + i))}));
const LURKER = zombify(student(19));

const Zombie: React.FC<{look: Look; t: number; i: number; walkAmt?: number; reach?: number}> = ({look, t, i, walkAmt = 0.35, reach = 0}) =>
  <Person look={look} walk={t * 3.2 + i} walkAmt={walkAmt} arms={0.85 + Math.sin(t * 1.3 + i) * 0.1} headTilt={0.6 + Math.sin(t * 0.9 + i) * 0.3} lean={0.12} reach={reach} />;

const B: React.FC<{p: V3; s: V3; c: string; e?: number}> = ({p, s, c, e = 0}) =>
  <mesh position={p}><boxGeometry args={s} /><meshStandardMaterial color={c} emissive={c} emissiveIntensity={e} flatShading /></mesh>;

const doorAngle = (t: number) => (t > 9.8 && t < 13.1 ? 1.2 * ease(t, 9.85, 10.4, Easing.out(Easing.cubic)) * (1 - ease(t, 11.6, 12.4)) : 0);

const InWorld: React.FC<{t: number; ceil: boolean}> = ({t, ceil}) => {
  const strobe = strobeAt(t);
  const dark = ease(t, ALARM_OFF, ALARM_OFF + 0.15, Easing.linear);
  const flash = t > 40.34 && t < 41.0 ? 1 - ease(t, 40.75, 41.0) : 0;
  const yz = youZ(t);
  const walking = t > 10.0 && t < 42.1;
  const lurkTurn = ease(t, 40.6, 41.4);
  return (
    <>
      <Interior lightsOn={0} ceiling={ceil} door={doorAngle(t)} belt={t < 9.0 ? 1 : 0} strobe={strobe} hall={0} />
      {[[-14, -6], [-18, 3], [-12, 7]].map(([x, z], i) => <group key={i} position={[x, 0, z]}><mesh position={[0, 3, 0]}><coneGeometry args={[2, 3.8, 7]} /><meshStandardMaterial color="#1f3a2a" flatShading /></mesh></group>)}
      {SEATS.map(([x, z], i) => <group key={i} position={[x, 0, z]}><group position={[0, 0, -0.5]}><Desk /></group><group position={[0, 0, 0.08]}><Chair /></group></group>)}
      {/* class in the blind-spot corner */}
      {CORNER.map(([cx, cz], i) => {
        if (i === YOU) return null;
        return <group key={i} position={[cx, 0, cz]} rotation={[0, -Math.PI / 2 + (t > 8.7 && t < 10 ? 0.6 : 0), 0]}><Person look={student(i)} crouch={1} lean={0.35} headYaw={t > 8.7 && t < 10.5 ? 0.6 : Math.sin(t * 0.6 + i) * 0.15} /></group>;
      })}
      {/* you: corner → door → hallway → stairwell */}
      {t < 42.18 && (() => {
        const stand = ease(t, 8.7, 9.4);
        const rot = t < 9.9 ? mix(-Math.PI / 2, 0, stand) : t < 10.6 ? mix(Math.PI / 2, 0, ease(t, 10.2, 10.6)) : 0;
        const pz = t < 9.9 ? -2.75 + stand * 0.3 : t < 10.6 ? mix(-2.45, 2.6, ease(t, 9.9, 10.3)) : yz;
        const ph = t > 26.6 && t < 31.6 ? 1 : 0;
        return <group position={[youX(t), 0, pz]} rotation={[0, rot, 0]}>
          <Person look={youLook(t)} crouch={1 - stand} lean={0.35 * (1 - stand) + (walking ? 0.15 : 0)} walk={t * 4.2} walkAmt={walking ? 0.55 : 0} phone={ph} reach={ph ? 0.15 : 0} headYaw={t > 13 && t < 17 ? Math.sin(t * 0.8) * 0.5 : 0} />
        </group>;
      })()}
      {/* shoes left behind */}
      {t > 24.4 && [-0.12, 0.12].map((dx, i) => <group key={i} position={[7.4 + dx, 0.04, youZ(24.4) - 0.2 + i * 0.08]} rotation={[0, 0.3 * (i ? 1 : -1), 0]}><B p={[0, 0, 0]} s={[0.12, 0.08, 0.26]} c="#eeeeee" /></group>)}
      {/* horde at the far end, turned toward the cafeteria */}
      {HORDE.map((z, i) => <group key={i} position={[z.x + Math.sin(t * 0.4 + i) * 0.2, 0, z.z + Math.sin(t * 0.3 + i * 2) * 0.4]} rotation={[0, Math.PI + Math.sin(t * 0.5 + i) * 0.4, 0]}><Zombie look={z.look} t={t} i={i} walkAmt={0.25} /></group>)}
      {/* the lurker by the lockers near the stairwell — only the flash shows him */}
      {t > 34 && <group position={[8.3, 0, 16.2]} rotation={[0, mix(0, Math.PI + 0.3, lurkTurn), 0]}><Zombie look={LURKER} t={t} i={9} walkAmt={0.05} /></group>}
      {/* stairwell door + EXIT sign on the +z end wall */}
      <B p={[7.75, 1.1, 17.93]} s={[1.0, 2.2, 0.06]} c="#b8322a" />
      <B p={[7.75, 2.5, 17.9]} s={[1.0, 0.3, 0.05]} c="#2a8a4a" e={1.4} />
      <pointLight position={[7.75, 2.3, 17.2]} intensity={1.0} distance={6} decay={1.2} color="#5cff8a" />
      {flash > 0 && <spotLight position={[7.5, 1.4, yz + 0.4]} target-position={[7.8, 1.2, yz + 8]} angle={0.5} penumbra={0.4} intensity={25 * flash} distance={20} decay={1} color="#f2f6ff" />}
      <hemisphereLight args={['#5a6a9a', '#1a1a26', mix(0.55, 0.45, dark)]} />
    </>
  );
};

const StairWorld: React.FC<{t: number}> = ({t}) => {
  const door = t < 44.9 ? 1.25 * ease(t, 42.25, 42.9, Easing.out(Easing.cubic)) : 1.25 * (1 - ease(t, 44.9, 45.7, Easing.in(Easing.quad)));
  const enter = ease(t, 42.4, 44.4);
  const down = ease(t, 44.6, 47.1);
  const pos: V3 = t < 44.6 ? [mix(0, -1.2, ease(t, 43.6, 44.5)), 0, mix(3.9, 0.6, enter)] : [-1.2, -down * 1.6, 0.6 - down * 2.6];
  return (
    <>
      <Stairwell door={door} />
      <group position={pos} rotation={[0, Math.PI + (t > 43.6 && t < 44.6 ? 0.4 : 0), 0]}><Person look={youLook(t)} walk={t * 4.5} walkAmt={0.6} lean={0.15} /></group>
      <hemisphereLight args={['#c9c2b0', '#2a2620', 0.6]} />
    </>
  );
};

const FRIEND_AT: V3 = [1.4, 0, 0.15];
const FRZ_DOOR: V3 = [8.55, 0, -1.6];
const runPath = (k: number, lane: number): V3 => {
  const pts: V3[] = [[1.6, 0, 1.0], [1.6, 0, 1.8 + lane], [7.4, 0, 1.8 + lane], [8.2, 0, FRZ_DOOR[2]]];
  const seg = Math.min(2, Math.floor(k * 3)), f = k * 3 - seg;
  return mix3(pts[seg], pts[seg + 1], Math.min(1, f));
};
const CafeWorld: React.FC<{t: number}> = ({t}) => {
  const night = t > 40;
  const run = ease(t, 51.4, 52.88, Easing.inOut(Easing.quad));
  const shake = t > 47 && t < 51 ? Math.sin(t * 40) * 0.012 : 0;
  return (
    <>
      <Cafeteria strobe={night ? 0 : strobeAt(t)} sun={0} />
      {/* walk-in freezer door on the kitchen wall */}
      <group position={[FRZ_DOOR[0], 0, FRZ_DOOR[2]]}>
        <B p={[0.35, 1.1, 0]} s={[0.12, 2.2, 1.1]} c="#d5dade" />
        <B p={[0.25, 1.1, -0.42]} s={[0.1, 0.5, 0.06]} c="#888" />
        <B p={[0.28, 2.4, 0]} s={[0.04, 0.24, 0.8]} c="#2f5fa8" e={0.3} />
      </group>
      {/* friend under the table, shaking; then runs with you */}
      {t < 51.4
        ? <group position={[FRIEND_AT[0] + shake, 0, FRIEND_AT[2]]} rotation={[0, Math.PI / 2 + 0.4, 0]}><Person look={LOOKS.friend} crouch={1} lean={1.0} headYaw={-0.5 + Math.sin(t * 1.5) * 0.2} arms={0.4} /></group>
        : <group position={runPath(run, 0.25)} rotation={[0, run < 0.33 ? 0 : run < 0.66 ? Math.PI / 2 : Math.PI * 0.85, 0]}><Person look={LOOKS.friend} walk={t * 9} walkAmt={1} lean={0.25} /></group>}
      {night && t > 50.76 && (t < 51.4
        ? <group position={[1.6, 0, 1.25]} rotation={[0, Math.PI, 0]}><Person look={youLook(t)} crouch={0.7} lean={0.4} reach={ease(t, 50.9, 51.2)} /></group>
        : <group position={runPath(Math.max(0, run - 0.06), -0.25)} rotation={[0, run < 0.4 ? 0 : run < 0.7 ? Math.PI / 2 : Math.PI * 0.85, 0]}><Person look={youLook(t)} walk={t * 9 + 1} walkAmt={1} lean={0.25} /></group>)}
      {/* zombies by the main doors, drawn there by the alarm */}
      {[0, 1, 2, 3, 4].map((i) => {
        const x = night ? -7.2 + (i % 2) * 0.8 : -10.5 + Math.max(0, t - 6) * 1.1, z = (i - 2) * 0.7 + (night ? Math.sin(t * 0.3 + i) * 0.3 : 0);
        return <group key={i} position={[x, 0, z]} rotation={[0, night ? -Math.PI / 2 + Math.sin(t * 0.4 + i) * 0.8 : Math.PI / 2, 0]}><Zombie look={zombify(student(20 + i))} t={t} i={i} walkAmt={night ? 0.2 : 0.7} /></group>;
      })}
      <hemisphereLight args={[night ? '#6a7cb0' : '#ffe9d6', night ? '#1a1a2a' : '#5a4a40', night ? 0.6 : 0.7]} />
      {night && <pointLight position={[0, 3, 9]} intensity={3} distance={22} decay={1} color="#7f9cff" />}
    </>
  );
};

const FrzWorld: React.FC<{t: number}> = ({t}) => {
  const door = t < 53.6 ? 1.0 * (1 - ease(t, 52.9, 53.5, Easing.in(Easing.quad))) : 0;
  const knockT = [65.4, 65.75, 66.1];
  const knock = knockT.reduce((a, k) => a + (t > k && t < k + 0.18 ? 1 - (t - k) / 0.18 : 0), 0);
  const under = t > 64.6 ? ease(t, 64.7, 65.1) : 0;
  const breath = Math.sin(t * 2.2) * 0.04;
  return (
    <>
      <WalkIn door={door} knock={knock} under={under} />
      <group position={[-0.75, 0, -0.9]} rotation={[0, 0.7, 0]}><Person look={youLook(t)} crouch={1} lean={0.3 + breath} phone={t > 61.2 && t < 64.6 ? 1 : 0} reach={t > 61.2 && t < 64.6 ? 0.15 : 0} headYaw={t > 64.7 ? 0.5 : 0} /></group>
      <group position={[-0.05, 0, -1.05]} rotation={[0, 0.2, 0]}><Person look={LOOKS.friend} crouch={1} lean={0.45 - breath} arms={0.35} headYaw={t > 64.7 ? 0.2 : -0.4} /></group>
      <hemisphereLight args={['#cfe6ff', '#3a4450', 0.75]} />
    </>
  );
};

export const World: React.FC<{t: number; loc?: Loc; ceil?: boolean}> = ({t, loc, ceil}) => {
  const s = SHOTS[shotAt(t)];
  const L = loc ?? s.loc, ce = ceil ?? !!s.ceil;
  const top = new THREE.Color('#0a0c1c'), bot = new THREE.Color('#1c2448');
  return (
    <>
      <Sky top={top} bot={bot} />
      <Stars k={0.8} />
      <directionalLight position={[-30, 30, 18]} intensity={0.45} color="#7f9cff" />
      <fog attach="fog" args={[bot, L === 'ext' ? 60 : 30, L === 'ext' ? 260 : 140]} />
      {L === 'ext' && <>
        <hemisphereLight args={['#4a5a8a', '#1e2a22', 0.75]} />
        <mesh position={[120, 160, -200]}><icosahedronGeometry args={[9, 2]} /><meshBasicMaterial color="#dfe6ff" fog={false} /></mesh>
        <Exterior windows={0} dusk={1} />
        <pointLight position={[0, 3.5, 9]} intensity={10 * strobeAt(t)} distance={30} decay={1} color="#ff2a2a" />
        {[[-8, 11], [4, 12.5], [12, 10.8], [-3, 10], [8, 9.6]].map(([x, z], i) => <group key={i} position={[x + Math.sin(t * 0.4 + i) * 0.3, 0, z]} rotation={[0, i - 2, 0]}><Zombie look={zombify(student(30 + i))} t={t} i={i} /></group>)}
      </>}
      {L === 'in' && <InWorld t={t} ceil={ce} />}
      {L === 'stair' && <StairWorld t={t} />}
      {L === 'cafe' && <CafeWorld t={t} />}
      {L === 'frz' && <FrzWorld t={t} />}
      {L === 'map' && <>
        <hemisphereLight args={['#ffffff', '#33405a', 1.0]} />
        <FloorPlan infected={990} t={t} highlight={1} />
      </>}
    </>
  );
};

// ---------- HUD + beats ----------
const fmtClock = (m: number) => { const h = Math.floor(m / 60) % 24, mm = Math.floor(m % 60); const ap = h >= 12 ? 'PM' : 'AM'; return `${((h + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${ap}`; };
const battAt = (t: number) => Math.round(interpolate(t, [0, 26, 32, 61.2, 74], [37, 35, 33, 19, 19], CL));
const HUD: React.FC<{t: number}> = ({t}) => {
  const k = ease(t, 8.7, 9.2, Easing.out(Easing.cubic));
  if (t > 70.1 || t < 8.7) return null;
  const batt = battAt(t);
  const noise = t < 18.94 ? ['MASKED', ACC.lime] : t < ALARM_OFF ? ['MASKED', ACC.amber] : t < 53.5 ? ['EXPOSED', ACC.red] : ['MUFFLED', ACC.lime];
  const bump = t > 61.2 && t < 64.7 ? 1 + 0.08 * Math.abs(Math.sin(t * 5)) : 1;
  return (
    <div style={{position: 'absolute', left: 56, right: 56, top: 92, display: 'flex', justifyContent: 'space-between', opacity: k, transform: `translateY(${(1 - k) * -40}px)`, fontFamily: FONT}}>
      <div style={{color: 'white', textShadow: '0 3px 12px rgba(0,0,0,0.7)'}}>
        <div style={{fontWeight: 800, fontSize: 30, letterSpacing: '0.16em', color: ACC.red}}>● DAY 2 <span style={{color: 'white', opacity: 0.8}}>· LOCKDOWN</span></div>
        <div style={{fontWeight: 900, fontSize: 76, lineHeight: 1, marginTop: 6}}>{fmtClock(clockMin(t))}</div>
        <div style={{fontWeight: 700, fontSize: 26, letterSpacing: '0.12em', color: ACC.amber, marginTop: 8}}>RESCUE: UNKNOWN</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14}}>
        <Pill color={ACC.red} size={32}><span style={{color: ACC.red}}>990+</span>INFECTED</Pill>
        <div style={{transform: `scale(${bump})`, transformOrigin: 'right center'}}><Pill color={ACC.blue} size={32}><span style={{color: batt > 30 ? ACC.lime : batt > 20 ? ACC.amber : ACC.red}}>{batt}%</span>PHONE</Pill></div>
        <Pill color={noise[1]} size={32}><span style={{color: noise[1]}}>{noise[0]}</span>NOISE</Pill>
      </div>
    </div>
  );
};

const Toggle: React.FC<{on: boolean; label: string; k: number}> = ({on, label, k}) => (
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '26px 30px', borderRadius: 28, background: '#1a1f28', marginBottom: 20, fontSize: 38, fontWeight: 800, opacity: k}}>
    <span>{label}</span>
    <span style={{width: 110, height: 62, borderRadius: 999, background: on ? ACC.lime : '#3a4150', position: 'relative', display: 'inline-block'}}>
      <span style={{position: 'absolute', top: 6, left: on ? 54 : 6, width: 50, height: 50, borderRadius: 999, background: 'white'}} />
    </span>
  </div>
);
const PhoneCard: React.FC<{t: number}> = ({t}) => {
  if (t < 26.5 || t > 32.1) return null;
  const k = ease(t, 26.5, 26.9, Easing.out(Easing.cubic)) * (1 - ease(t, 31.7, 32.1));
  const buzz = t > 30.3 && t < 31.3 ? Math.sin(t * 90) * 8 : 0;
  return (
    <div style={{position: 'absolute', left: 300 + buzz, top: 330, width: 480, height: 760, opacity: k, transform: `translateY(${(1 - k) * 80}px)`, fontFamily: FONT, color: 'white'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 64, background: '#0b0e14', border: '10px solid #2a2f38', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', overflow: 'hidden', padding: '40px 26px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 26, marginBottom: 40}}><span>{fmtClock(clockMin(t)).replace(/ [AP]M/, '')}</span><span>{battAt(t)}%</span></div>
        <div style={{fontSize: 30, fontWeight: 800, color: '#9aa4b5', marginBottom: 24, letterSpacing: '0.1em'}}>SOUNDS</div>
        <Toggle on={t > 27.6} label="🔕 Silent" k={1} />
        <Toggle on={t > 28.9} label="📳 Vibrate off" k={ease(t, 28.3, 28.6)} />
        {t > 30.3 && <div style={{marginTop: 50, textAlign: 'center', fontSize: 40, fontWeight: 900, color: ACC.red, opacity: ease(t, 30.3, 30.5)}}>bzzz = they hear it</div>}
      </div>
    </div>
  );
};

const Beats: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const {width: W, height: Hh} = useVideoConfig();
  const proj = projector(cam, W, Hh);
  const yz = youZ(t);
  const roomS = proj([(YOUR_ROOM.x0 + YOUR_ROOM.x1) / 2, 1.5, (YOUR_ROOM.z0 + YOUR_ROOM.z1) / 2]);
  const cafeS = proj([(CAFE_ROOM.x0 + CAFE_ROOM.x1) / 2, 1.5, (CAFE_ROOM.z0 + CAFE_ROOM.z1) / 2]);
  const friendS = proj([1.4, 1.2, 0.15]);
  const youS = proj([5.15, 1.4, -2.75]);
  const hordeS = proj([7.6, 2.3, -10]);
  const feetS = proj([7.4, 0.35, yz]);
  const stairS = proj([0, 2.5, 3.0]);
  const knobS = proj([0.42, 1.0, 1.34]);
  const wallS = proj([-1.5, 1.6, 0.2]);
  const timer = Math.max(0, 300 - Math.max(0, t - 19.3) * 300 / (ALARM_OFF - 19.3));
  const adapt = interpolate(t, [36.8, 40.3, 40.4, 42], [0, 0.72, 0, 0.05], CL);
  return (
    <>
      {/* hook */}
      {t > 0.3 && t < 2.36 && <Tag x={proj([0, 8.6, 7]).x} y={proj([0, 8.6, 7]).y} text="YOUR SCHOOL" k={pop(t, 0.4)} color={ACC.amber} />}
      {t > 2.5 && t < 4.72 && <Tag x={roomS.x} y={roomS.y} text="YOU" k={pop(t, 2.6)} color="#19e0cf" />}
      {t > 3.0 && t < 4.72 && <Tag x={cafeS.x} y={cafeS.y} text="BEST FRIEND" k={pop(t, 3.1)} color={ACC.lime} />}
      <Stamp t={t} at={4.72} out={5.75} text="DAY 2" sub="LOCKDOWN" y={520} />
      {t > 5.8 && t < 8.62 && <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: FONT}}>
        <div style={{transform: `scale(${pop(t, 5.85)})`, fontWeight: 900, fontSize: 104, lineHeight: 1, color: t < 7.06 ? ACC.lime : 'rgba(255,255,255,0.35)', WebkitTextStroke: '5px rgba(0,0,0,0.8)', paintOrder: 'stroke fill'}}>SAVE THE<br />BEST FRIEND</div>
        <div style={{fontWeight: 900, fontSize: 56, color: ACC.amber, margin: '18px 0', opacity: ease(t, 6.7, 7.0)}}>— OR —</div>
        <div style={{transform: `scale(${pop(t, 7.06)})`, fontWeight: 900, fontSize: 104, lineHeight: 1, color: ACC.red, WebkitTextStroke: '5px rgba(0,0,0,0.8)', paintOrder: 'stroke fill'}}>STAY HIDDEN?</div>
      </div>}
      {t > 5.9 && t < 7.06 && <Tag x={friendS.x} y={friendS.y} text="ALONE" k={pop(t, 6.0)} color={ACC.lime} />}
      {t > 7.2 && t < 8.62 && <Tag x={youS.x} y={youS.y} text="SAFE… FOR NOW" k={pop(t, 7.3)} color="#19e0cf" />}
      <Stamp t={t} at={8.62} out={9.7} text="YOU GO." color={ACC.lime} y={560} size={190} />
      {/* alarm cover */}
      {t > 10.4 && t < 13.1 && <Tag x={hordeS.x} y={hordeS.y} text="FACING THE ALARM" k={pop(t, 10.5)} color={ACC.red} />}
      <Card t={t} at={13.2} out={16.9} y={330} accent={ACC.amber}>
        <div style={{fontSize: 30, fontWeight: 800, letterSpacing: '0.16em', color: ACC.amber}}>FIRE CODE · NFPA 72</div>
        {[['ALARM', 1, ACC.red, 'ROOM + 15 dB'], ['ROOM', 0.55, '#8fb8ff', 'baseline'], ['YOUR STEPS', 0.3, ACC.lime, 'hidden']].map(([l, w, c, n], i) => (
          <div key={l as string} style={{marginTop: 18}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 32, fontWeight: 800}}><span>{l}</span><span style={{opacity: 0.7}}>{n}</span></div>
            <div style={{height: 34, borderRadius: 12, background: 'rgba(255,255,255,0.08)', marginTop: 6}}><div style={{height: '100%', borderRadius: 12, width: `${(w as number) * 100 * ease(t, 13.4 + i * 0.5, 14.2 + i * 0.5, Easing.out(Easing.cubic))}%`, background: c as string}} /></div>
          </div>
        ))}
      </Card>
      {t > 17.2 && t < 18.94 && <Tag x={feetS.x} y={feetS.y - 40} text="DROWNED OUT" k={pop(t, 17.3)} color={ACC.lime} />}
      <Card t={t} at={19.3} out={23.9} y={330} accent={ACC.red}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: 30, fontWeight: 800, letterSpacing: '0.2em', color: ACC.red}}>ALARM BATTERY</div>
          <div style={{fontSize: 180, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: timer < 120 ? ACC.red : 'white'}}>{`${Math.floor(timer / 60)}:${String(Math.floor(timer % 60)).padStart(2, '0')}`}</div>
          <div style={{fontSize: 28, fontWeight: 600, opacity: 0.65, marginTop: 6}}>code minimum: 5 min of alarm</div>
        </div>
      </Card>
      <Stamp t={t} at={22.08} out={23.9} text="MOVE. NOW." color={ACC.red} y={1040} size={130} />
      {t > 24.2 && t < 26.38 && <Tag x={feetS.x} y={feetS.y - 50} text="SOCKS = QUIET" k={pop(t, 25.0)} color={ACC.lime} />}
      {t > 24.4 && t < 26.38 && <Tag x={proj([7.4, 0.2, youZ(24.4) - 0.2]).x} y={proj([7.4, 0.2, youZ(24.4) - 0.2]).y} text="SHOES OFF" k={pop(t, 24.4)} color={ACC.amber} />}
      <PhoneCard t={t} />
      <Stamp t={t} at={30.3} out={31.7} text="A BUZZ IS ENOUGH" color={ACC.red} y={1150} size={84} />
      {/* darkness */}
      <Stamp t={t} at={32.3} out={34.9} text="SILENCE." color={ACC.white} y={560} size={170} />
      {t > 35.04 && t < 36.7 && <svg width={W} height={Hh} style={{position: 'absolute', inset: 0}}><g transform={`translate(540,640) scale(${pop(t, 35.3)})`}>
        <text x={0} y={30} textAnchor="middle" fontSize={180}>🔦</text>
        <path d="M-130,-130 L130,130 M130,-130 L-130,130" stroke={ACC.red} strokeWidth={30} strokeLinecap="round" />
      </g></svg>}
      <Card t={t} at={36.8} out={42.0} y={330} accent={ACC.blue}>
        <div style={{fontSize: 30, fontWeight: 800, letterSpacing: '0.16em', color: ACC.blue}}>NIGHT VISION</div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10}}>
          <div style={{fontSize: 110, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: t > 40.34 ? ACC.red : 'white'}}>{t > 40.34 ? '0' : Math.round(adapt / 0.72 * 20)}<span style={{fontSize: 44}}> / 20 MIN</span></div>
        </div>
        <div style={{height: 34, borderRadius: 12, background: 'rgba(255,255,255,0.08)', marginTop: 16}}><div style={{height: '100%', borderRadius: 12, width: `${(adapt / 0.72) * 100}%`, background: ACC.blue}} /></div>
        {t > 40.34 && <div style={{fontSize: 46, fontWeight: 900, color: ACC.red, marginTop: 14, opacity: ease(t, 40.4, 40.6)}}>ONE FLASH → RESET</div>}
      </Card>
      {t > 40.6 && t < 42.18 && <Tag x={proj([8.3, 1.9, 16.2]).x + 160} y={proj([8.3, 1.9, 16.2]).y} text="IT SAW THE LIGHT" k={pop(t, 40.7)} color={ACC.red} />}
      {/* stairwell */}
      {t > 43.4 && t < 47.1 && <Tag x={stairS.x} y={stairS.y - 30} text={t < 44.9 ? 'FIRE-RATED DOOR' : 'SELF-CLOSING'} k={pop(t, t < 44.9 ? 43.5 : 44.95)} color={ACC.lime} />}
      {/* cafeteria */}
      <Stamp t={t} at={47.1} out={48.2} text="CAFETERIA" color={ACC.amber} y={520} size={140} />
      {t > 48.4 && t < 50.76 && <Tag x={friendS.x} y={friendS.y} text="YOUR BEST FRIEND" k={pop(t, 48.5)} color="#19e0cf" />}
      {t > 51.6 && t < 52.88 && <Tag x={proj([8.6, 1.6, -1.6]).x} y={proj([8.6, 1.6, -1.6]).y} text="WALK-IN FREEZER" k={pop(t, 51.7)} color={ACC.blue} />}
      {/* freezer */}
      <Stamp t={t} at={54.4} out={55.4} text="TRAP?" color={ACC.red} y={560} size={190} />
      {t > 55.8 && t < 58.22 && <Tag x={knobS.x} y={knobS.y} text="INSIDE RELEASE" k={pop(t, 55.9)} color={ACC.lime} />}
      <Card t={t} at={56.6} out={58.1} y={1010} accent={ACC.lime}>
        <div style={{fontSize: 30, fontWeight: 800, letterSpacing: '0.16em', color: ACC.lime}}>SAFETY RULE</div>
        <div style={{fontSize: 44, fontWeight: 900, marginTop: 8}}>Walk-ins always open from inside</div>
      </Card>
      {t > 58.6 && t < 61.2 && <Tag x={wallS.x} y={wallS.y} text="THICK FOAM WALLS" k={pop(t, 58.75)} color={ACC.blue} />}
      {t > 59.2 && t < 61.2 && <svg width={W} height={Hh} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        {[0, 1, 2].map((i) => { const r = ((t - 59.2 + i * 0.4) % 1.2) / 1.2; return <circle key={i} cx={540} cy={900} r={60 + r * 260} fill="none" stroke={ACC.blue} strokeWidth={8} opacity={(1 - r) * 0.7} />; })}
      </svg>}
      <Stamp t={t} at={61.2} out={62.3} text="MIDNIGHT" color={ACC.blue} y={520} size={150} />
      {/* knocks */}
      {[65.4, 65.75, 66.1].map((k, i) => t > k && t < 68.44 && <div key={i} style={{position: 'absolute', left: 260 + i * 200, top: 560 - i * 40, fontFamily: FONT, fontWeight: 900, fontSize: 80, color: 'white', WebkitTextStroke: '4px #000', paintOrder: 'stroke fill', transform: `scale(${pop(t, k, 0.25)}) rotate(${(i - 1) * 8}deg)`}}>KNOCK</div>)}
      {t > 68.44 && t < 70.1 && <div style={{position: 'absolute', left: 140, right: 140, top: 520, textAlign: 'center', fontFamily: FONT}}>
        <div style={{display: 'inline-block', background: 'rgba(10,12,18,0.85)', border: `3px solid ${ACC.amber}`, borderRadius: 40, padding: '26px 40px', fontSize: 60, fontWeight: 900, color: 'white', transform: `scale(${pop(t, 68.5)})`}}>“Is anyone in there?”</div>
      </div>}
      {/* darkness/adaptation + flash */}
      {t > 32.18 && t < 42.18 && <AbsoluteFill style={{background: 'black', opacity: t < 40.34 ? 0.6 - adapt * 0.55 : t < 40.9 ? 0 : 0.62, pointerEvents: 'none'}} />}
      {t > 40.34 && t < 40.7 && <AbsoluteFill style={{background: 'white', opacity: 0.3 * (1 - ease(t, 40.34, 40.7))}} />}
      {/* red alarm wash */}
      {t > 9.78 && t < ALARM_OFF && <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(255,0,0,0) 40%, rgba(255,20,20,0.35) 100%)', opacity: strobeAt(t)}} />}
      {/* end card */}
      {t > 70.1 && <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: FONT}}>
        <div style={{opacity: pop(t, 70.15), transform: `scale(${mix(1.4, 1, Math.min(1, pop(t, 70.15)))})`, fontWeight: 900, fontSize: 130, lineHeight: 0.95, color: 'white', textShadow: '0 6px 0 rgba(0,0,0,0.5)', WebkitTextStroke: '5px rgba(0,0,0,0.8)', paintOrder: 'stroke fill'}}>
          OPEN<br /><span style={{color: ACC.red}}>THE DOOR?</span>
        </div>
        <div style={{marginTop: 50, display: 'flex', justifyContent: 'center', gap: 24, opacity: ease(t, 71.0, 71.4)}}>
          <Pill color={ACC.red} size={40}><span style={{color: ACC.red}}>A</span>OPEN IT</Pill>
          <Pill color={ACC.lime} size={40}><span style={{color: ACC.lime}}>B</span>STAY SILENT</Pill>
        </div>
        <div style={{marginTop: 40, fontWeight: 800, fontSize: 36, letterSpacing: '0.2em', color: ACC.amber, opacity: ease(t, 71.7, 72.1)}}>DAY 3 → FOLLOW</div>
      </div>}
    </>
  );
};

const KEYS: Record<string, string> = {
  zombie: ACC.red, apocalypse: ACC.red, school: ACC.amber, day: ACC.lime, save: ACC.lime, best: ACC.lime, friend: ACC.lime, stay: ACC.red, hidden: ACC.red, go: ACC.lime,
  fire: ACC.red, alarm: ACC.red, blaring: ACC.red, cover: ACC.lime, code: ACC.amber, fifteen: ACC.amber, decibels: ACC.amber, louder: ACC.amber, drowns: ACC.lime, footsteps: ACC.lime,
  battery: ACC.red, five: ACC.red, minutes: ACC.red, move: ACC.red, now: ACC.red, shoes: ACC.amber, off: ACC.lime, socks: ACC.lime, quieter: ACC.lime,
  phone: ACC.blue, silent: ACC.lime, vibration: ACC.red, buzz: ACC.red, enough: ACC.red, cuts: ACC.red, total: ACC.red, darkness: ACC.red,
  "don't": ACC.red, flashlight: ACC.red, eyes: ACC.blue, twenty: ACC.blue, dark: ACC.blue, flash: ACC.red, resets: ACC.red,
  stairwell: ACC.lime, doors: ACC.lime, rated: ACC.lime, close: ACC.lime, own: ACC.lime, cafeteria: ACC.amber, table: ACC.amber, shaking: ACC.red, grab: ACC.lime, run: ACC.lime,
  freezer: ACC.blue, freezers: ACC.blue, trap: ACC.red, open: ACC.lime, inside: ACC.lime, thick: ACC.blue, walls: ACC.blue, swallow: ACC.lime, sound: ACC.lime,
  midnight: ACC.blue, '19%': ACC.amber, three: ACC.red, knocks: ACC.red, door: ACC.red, voice: ACC.amber, anyone: ACC.amber, there: ACC.amber,
};

const CutFlash: React.FC<{t: number}> = ({t}) => {
  const s = SHOTS.find((x) => x.from > 0 && t >= x.from && t < x.from + 0.16);
  if (!s || (t > 32.18 && t < 42.18)) return null;
  return <AbsoluteFill style={{background: 'white', opacity: 0.2 * (1 - (t - s.from) / 0.16)}} />;
};

const ALARMS: Sfx[] = Array.from({length: 13}, (_, i) => [9.8 + i * 1.7, 'alarm', 0.22] as Sfx).filter((s) => s[0] < ALARM_OFF - 1.2);
export const SFX: Sfx[] = [
  [0.0, 'whoosh_long', 0.3], [0.6, 'growl', 0.35], [2.36, 'glitch', 0.25], [3.1, 'ding', 0.25], [4.72, 'impact', 0.55], [5.8, 'whoosh', 0.3], [7.06, 'heartbeat', 0.45],
  [8.62, 'boom', 0.45], [9.85, 'clunk', 0.45], ...ALARMS, [13.2, 'whoosh', 0.25], [14.4, 'click', 0.3], [17.3, 'ding', 0.25], [19.3, 'riser', 0.25], [22.08, 'impact', 0.5],
  [24.1, 'pop', 0.3], [24.3, 'pop', 0.3], [27.6, 'click', 0.35], [28.9, 'click', 0.35], [30.3, 'rattle', 0.3], [32.18, 'clunk', 0.65], [33.5, 'heartbeat', 0.5], [34.4, 'heartbeat', 0.5],
  [35.3, 'impact', 0.35], [37.0, 'heartbeat', 0.4], [38.0, 'heartbeat', 0.4], [40.34, 'glitch', 0.4], [40.7, 'growl', 0.55], [42.18, 'whoosh', 0.3], [42.3, 'clunk', 0.4],
  [45.6, 'boom', 0.45], [47.1, 'whoosh_long', 0.3], [48.6, 'heartbeat', 0.4], [50.9, 'whoosh', 0.3], [51.6, 'growl', 0.35], [53.4, 'clunk', 0.6], [54.4, 'impact', 0.45],
  [56.0, 'ding', 0.3], [58.8, 'swell_hit', 0.3], [61.2, 'whoosh_long', 0.3], [63.0, 'ding', 0.2], [65.4, 'clunk', 0.7], [65.75, 'clunk', 0.7], [66.1, 'clunk', 0.75],
  [67.2, 'heartbeat', 0.5], [68.1, 'heartbeat', 0.5], [70.1, 'boom', 0.5], [71.2, 'heartbeat', 0.45],
];

export const LockdownDay2: React.FC = () => {
  const {width: W, height: Hh} = useVideoConfig();
  const t = useT();
  const cam = camAt(t);
  const dim = t > 26.5 && t < 32.1 ? 0.35 * ease(t, 26.5, 26.9) * (1 - ease(t, 31.7, 32.1)) : 0;
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
      <Captions words={WORDS} t={t} keys={KEYS} y={1330} hide={(x) => x > 70.1} />
      <CutFlash t={t} />
      <AbsoluteFill style={{background: 'black', opacity: t < 0.4 ? 1 - ease(t, 0, 0.4) : ease(t, LOCKDOWN2_SEC - 0.5, LOCKDOWN2_SEC)}} />
      <DayAudio job={JOB} sec={LOCKDOWN2_SEC} sfx={SFX} musicVol={0.11} />
    </AbsoluteFill>
  );
};

// ---------- thumbnail ----------
export const LockdownDay2Thumb: React.FC = () => {
  const {width: W, height: Hh} = useVideoConfig();
  const t = 66.0;
  const cam: Cam = {pos: [1.15, 1.35, 1.2], look: [-0.45, 0.55, -0.85], fov: 54};
  return (
    <AbsoluteFill style={{background: '#05070c', fontFamily: FONT}}>
      <ThreeCanvas width={W} height={Hh} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
        <CameraRig cam={cam} />
        <World t={t} loc="frz" />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.75) 100%)'}} />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: ACC.red, color: 'white', fontWeight: 900, fontSize: 52, letterSpacing: '0.14em', padding: '12px 34px', borderRadius: 999}}>ZOMBIE OUTBREAK</div>
        <div style={{fontWeight: 900, fontSize: 300, lineHeight: 0.9, color: 'white', marginTop: 30, WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', textShadow: '0 12px 0 rgba(0,0,0,0.5)'}}>DAY 2</div>
      </div>
      <div style={{position: 'absolute', bottom: 260, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontWeight: 900, fontSize: 96, lineHeight: 1, color: 'white', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>WHO'S KNOCKING</div>
        <div style={{fontWeight: 900, fontSize: 96, lineHeight: 1, color: ACC.lime, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>ON THE FREEZER?</div>
      </div>
    </AbsoluteFill>
  );
};
