// LOCKDOWN — Day 1 (Day Series, 9:16). Zombie outbreak at school. Low-poly 3D world keyed to words in lockdownDay1Words.ts.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {ACC, Cam, CameraRig, Captions, Card, DayAudio, ease, FONT, Grain, handheld, mix, mix3, phaseCol, phaseNum, Pill, pop, projector, Sfx, Sky, Stamp, Stars, Tag, useT, V3, Vignette} from './dayKit';
import {Cafeteria, Chair, Desk, DOOR, Exterior, FloorPlan, Interior, Look, LOOKS, Person, student, zombify, CAFE_ROOM, YOUR_ROOM} from './schoolKit';
import {WORDS} from './lockdownDay1Words';

export const LOCKDOWN1_SEC = 73.0;
const JOB = 'jobs/lockdown-day1';
const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// ---------- story clock ----------
// phase: 0 morning, 1 noon, 2 sunset, 3 night
const phase = (t: number) => interpolate(t, [0, 51.6, 52.4, 56.4, 57.2, 73], [0, 0.15, 1, 1.1, 2, 2.45], CL);
const clockMin = (t: number) => interpolate(t, [0, 5.7, 5.95, 20.38, 40.64, 52.0, 52.3, 56.7, 57.0, 73], [642, 643, 652, 655, 672, 690, 720, 724, 1127, 1146], CL);
const infectedAt = (t: number) => (t < 3.5 ? 0 : Math.min(990, Math.round(Math.pow(2, (clockMin(t) - 642) / 10))));
const SKY_TOP = ['#7fb2e0', '#3d8fe0', '#3a3170', '#0a0c1c'];
const SKY_BOT = ['#f3e2c4', '#cfe9f7', '#ff8a4a', '#1c2448'];

// ---------- shots ----------
type Loc = 'ext' | 'in' | 'map' | 'cafe';
type Shot = {from: number; to: number; loc: Loc; ceil?: boolean; shake?: number; cam: (k: number, t: number) => Cam};
const C = (pos: V3, look: V3, fov = 40): Cam => ({pos, look, fov});
const lerp = (a: Cam, b: Cam) => (k: number): Cam => ({pos: mix3(a.pos, b.pos, k), look: mix3(a.look, b.look, k), fov: mix(a.fov, b.fov, k)});
const SHOTS: Shot[] = [
  {from: 0, to: 1.68, loc: 'ext', cam: lerp(C([28, 7, 46], [0, 3.5, 0], 42), C([19, 5, 35], [0, 4, 0], 42))},
  {from: 1.68, to: 3.5, loc: 'in', ceil: true, cam: lerp(C([7.6, 1.7, 15], [7.7, 1.3, -8], 52), C([7.6, 1.65, 9], [7.7, 1.3, -8], 48))},
  {from: 3.5, to: 5.78, loc: 'in', ceil: true, shake: 3, cam: lerp(C([6.5, 1.5, -4.3], [7.7, 1.25, -7.8], 40), C([6.6, 1.45, -5.2], [7.7, 1.2, -7.8], 36))},
  {from: 5.78, to: 8.58, loc: 'in', ceil: true, cam: lerp(C([8.9, 0.55, -4.4], [7.6, 0.5, -7.6], 46), C([8.7, 0.9, -5.0], [7.6, 1.3, -7.6], 44))},
  {from: 8.58, to: 10.08, loc: 'in', ceil: true, shake: 4, cam: lerp(C([7.6, 1.55, -4.4], [7.6, 1.5, -7.5], 40), C([7.6, 1.5, -4.7], [7.6, 1.55, -7.5], 36))},
  {from: 10.08, to: 14.8, loc: 'map', cam: (k) => { const a = mix(-0.35, 0.05, k); return C([Math.sin(a) * 34, mix(44, 38, k), Math.cos(a) * 34], [0, 0, 0], 44); }},
  {from: 14.8, to: 20.38, loc: 'map', cam: lerp(C([-4, 62, 10], [0, 0, 0.5], 42), C([3, 56, 8], [0, 0, 0.5], 42))},
  {from: 20.38, to: 22.22, loc: 'in', ceil: true, cam: lerp(C([-3.4, 2.3, -4.3], [0.4, 0.9, 1.8], 52), C([-2.6, 2.0, -3.4], [0.4, 0.9, 1.8], 50))},
  {from: 22.22, to: 24.98, loc: 'in', ceil: true, cam: lerp(C([1.6, 1.6, -0.6], [6, 1.5, 2.7], 44), C([3.4, 1.6, 0.8], [6, 1.55, 2.7], 40))},
  {from: 24.98, to: 30.9, loc: 'in', cam: lerp(C([0.4, 12.5, 7.5], [0.6, 0, -0.4], 50), C([1.4, 13.5, 6.2], [1.0, 0, -0.6], 48))},
  {from: 30.9, to: 34.78, loc: 'in', cam: lerp(C([8.4, 7.4, 6.4], [6.6, 0.4, 2.3], 42), C([8.6, 6.4, 5.4], [6.6, 0.4, 2.3], 42))},
  {from: 34.78, to: 36.4, loc: 'in', ceil: true, cam: lerp(C([2.6, 1.9, 4.4], [6, 1, 2.4], 46), C([3.2, 1.8, 4.3], [6, 1, 2.4], 44))},
  {from: 36.4, to: 38.96, loc: 'in', ceil: true, cam: lerp(C([4.4, 1.85, 3.9], [5.9, 2.25, 2.7], 40), C([4.9, 2.0, 3.5], [5.9, 2.28, 2.75], 36))},
  {from: 38.96, to: 40.64, loc: 'in', ceil: true, shake: 2, cam: lerp(C([9.1, 1.7, 5.8], [6.2, 1.3, 2.4], 44), C([8.9, 1.6, 5.2], [6.2, 1.3, 2.4], 42))},
  {from: 40.64, to: 47.64, loc: 'in', ceil: true, cam: lerp(C([3.2, 1.2, -2.2], [5.1, 0.8, -2.85], 46), C([3.6, 1.1, -2.5], [5.1, 0.8, -2.85], 42))},
  {from: 47.64, to: 52.12, loc: 'in', ceil: true, cam: lerp(C([2.9, 2.6, -0.4], [4.6, 0.6, -3.4], 46), C([3.3, 2.3, -0.9], [4.6, 0.6, -3.4], 44))},
  {from: 52.12, to: 56.82, loc: 'in', ceil: true, shake: 0.6, cam: lerp(C([2.8, 1.25, -1.2], [6, 1.6, 2.6], 44), C([4.0, 1.4, 0.4], [6, 1.6, 2.65], 36))},
  {from: 56.82, to: 59.22, loc: 'ext', cam: lerp(C([-17, 3, 27], [0, 4.5, 0], 42), C([-12, 3.2, 21], [0, 4.5, 0], 42))},
  {from: 59.22, to: 62.46, loc: 'in', ceil: true, shake: 1.5, cam: lerp(C([6.9, 1.8, 4.2], [9.2, 2.3, 0.2], 46), C([7.3, 1.9, 3.2], [9.2, 2.3, 0.2], 42))},
  {from: 62.46, to: 65.12, loc: 'in', ceil: true, cam: lerp(C([7.8, 2.0, 9.5], [7.8, 1.2, -6], 50), C([7.8, 1.9, 6.0], [7.8, 1.2, -8], 48))},
  {from: 65.12, to: 68.62, loc: 'cafe', cam: lerp(C([8, 3.2, 6], [-2, 0.6, -0.5], 50), C([6.2, 2.4, 4.2], [0, 0.6, 0.2], 46))},
  {from: 68.62, to: LOCKDOWN1_SEC + 1, loc: 'in', ceil: true, cam: lerp(C([3.9, 1.0, -2.55], [5.2, 0.85, -2.8], 40), C([1.2, 2.8, 0.2], [4.6, 0.6, -3.2], 50))},
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
const YOU_SEAT = 8;
const CORNER: [number, number][] = [[4.4, -2.75], [3.65, -2.9], [5.15, -3.55], [4.4, -3.55], [3.65, -3.7], [5.15, -4.35], [4.4, -4.35], [3.65, -4.45], [5.15, -2.75]];
const ROW_PLACES = SEATS.map((_, i) => i);
// hallway zombies: base x, z, look, appear-from
const TEACHER_Z: V3 = [7.6, 0, -7.5];
const HZ: {x: number; z: number; look: Look; from: number}[] = [
  {x: 7.2, z: -3.4, look: zombify(student(11)), from: 18},
  {x: 8.4, z: 10.5, look: zombify(student(12)), from: 18},
  {x: 7.0, z: 8.5, look: zombify(student(13)), from: 18},
  {x: 8.3, z: -11.5, look: zombify(student(14)), from: 18},
  {x: 8.0, z: 12.5, look: zombify(student(15)), from: 18},
  {x: 8.7, z: 0.8, look: zombify(student(16)), from: 18},
];
const KID = zombify(student(17));
const DOOR_Z = zombify(student(18));
const TURN = 62.9; // zombies turn toward the alarm/cafeteria
const pulling = (t: number) => t > 38.9 && t < 40.7; // door zombie at the handle

const doorAngle = (t: number) => {
  if (t > 31.9 && t < 34.7) return 1.25 * ease(t, 31.94, 32.6, Easing.out(Easing.cubic)) * (1 - ease(t, 33.9, 34.6));
  if (t > 35.2 && t < 36.4) return 1.1 * ease(t, 35.22, 35.7, Easing.out(Easing.cubic)) * (1 - ease(t, 35.95, 36.35));
  if (t > 38.96 && t < 40.64) return 0.035 * Math.abs(Math.sin(t * 17));
  return 0;
};
const strobeAt = (t: number) => (t > 59.48 ? (Math.sin((t - 59.48) * Math.PI * 2 * 1.2) > 0.25 ? 1 : 0.08) : 0);

// sightline cone from the door window across the floor (x/z plane)
const coneGeo = (() => {
  const s = new THREE.Shape();
  const pts: [number, number][] = [[5.95, 2.88], [3.88, 5], [-6, 5], [-6, -5], [-1.88, -5]];
  s.moveTo(pts[0][0], -pts[0][1]); pts.slice(1).forEach(([x, z]) => s.lineTo(x, -z)); s.closePath();
  return new THREE.ShapeGeometry(s).rotateX(-Math.PI / 2);
})();

const Zombie: React.FC<{look: Look; t: number; i: number; walkAmt?: number; reach?: number}> = ({look, t, i, walkAmt = 0.35, reach = 0}) =>
  <Person look={look} walk={t * 3.2 + i} walkAmt={walkAmt} arms={0.85 + Math.sin(t * 1.3 + i) * 0.1} headTilt={0.6 + Math.sin(t * 0.9 + i) * 0.3} lean={0.12} reach={reach} />;

const InWorld: React.FC<{t: number; ceil: boolean}> = ({t, ceil}) => {
  const lightsOn = 1 - ease(t, 25.96, 26.15, Easing.linear);
  const strobe = strobeAt(t);
  const door = doorAngle(t);
  const belt = t > 36.6 ? ease(t, 36.7, 37.9, Easing.out(Easing.back(1.3))) : 0;
  // bite scene
  const bite = ease(t, 3.6, 4.3, Easing.out(Easing.cubic));
  const tLie = t > 4.5 && t < 7.14 ? 1 : t >= 7.14 ? 1 - ease(t, 7.14, 7.9) : 0;
  const tZ = ease(t, 7.2, 7.8);
  const lunge = ease(t, 8.62, 9.3, Easing.out(Easing.cubic));
  const teacherPos: V3 = t < 10.08 ? [TEACHER_Z[0], 0, TEACHER_Z[2] + (t < 4.5 ? 0.7 - bite * 0.15 : 0) + lunge * 1.4] : [TEACHER_Z[0] + Math.sin(t * 0.3) * 0.3, 0, TEACHER_Z[2] + Math.sin(t * 0.2) * 0.8];
  const turnK = ease(t, TURN, TURN + 0.8);
  const awayZ = (z: number, i: number) => z - Math.max(0, t - TURN - 0.4 - i * 0.12) * 1.1;
  return (
    <>
      <Interior lightsOn={lightsOn} ceiling={ceil} door={door} belt={belt} strobe={strobe} deskAt={t > 34.6 && t < 36.4 ? mix(-1.2, 0, ease(t, 34.8, 35.15, Easing.out(Easing.cubic))) : undefined} />
      {/* outside the windows */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-40, -0.03, 0]}><planeGeometry args={[70, 120]} /><meshStandardMaterial color="#5d9a4a" flatShading /></mesh>
      {[[-14, -6], [-18, 3], [-12, 7], [-24, -1]].map(([x, z], i) => <group key={i} position={[x, 0, z]}><mesh position={[0, 0.8, 0]}><boxGeometry args={[0.4, 1.6, 0.4]} /><meshStandardMaterial color="#6b4a32" flatShading /></mesh><mesh position={[0, 3, 0]}><coneGeometry args={[2, 3.8, 7]} /><meshStandardMaterial color="#4f8f45" flatShading /></mesh></group>)}
      {/* desks */}
      {SEATS.map(([x, z], i) => <group key={i} position={[x, 0, z]}><group position={[0, 0, -0.5]}><Desk /></group><group position={[0, 0, 0.08]}><Chair /></group></group>)}
      <group position={[3.6, 0, -3.8]}><mesh position={[0, 0.4, 0]}><boxGeometry args={[1.6, 0.8, 0.8]} /><meshStandardMaterial color="#8a5a34" flatShading /></mesh></group>
      {/* students: seated → corner at "get out of sight" */}
      {ROW_PLACES.map((i) => {
        const [sx, sz] = SEATS[i], [cx, cz] = CORNER[i];
        const st = 26.95 + (i % 5) * 0.12, k = ease(t, st, st + 1.4, Easing.inOut(Easing.quad));
        const x = mix(sx, cx, k), z = mix(sz + 0.05, cz, k);
        const moveDir = Math.atan2(cx - sx, cz - sz);
        const rotY = k <= 0 ? Math.PI : k >= 1 ? -Math.PI / 2 : k < 0.85 ? moveDir : mix(moveDir, -Math.PI / 2, (k - 0.85) / 0.15);
        const sit = 1 - Math.min(1, k / 0.12), crouch = Math.max(0, (k - 0.8) / 0.2);
        const you = i === YOU_SEAT;
        const look = you ? LOOKS.you : student(i);
        const phoneOn = you && t > 40.4 && t < 52.2 ? 1 : 0;
        const fear = t > 3.5 ? Math.sin(t * 2 + i) * 0.25 : 0;
        return <group key={i} position={[x, 0, z]} rotation={[0, rotY, 0]}>
          <Person look={look} sit={sit} crouch={crouch} walk={t * 7} walkAmt={k > 0.1 && k < 0.85 ? 1 : 0} headYaw={k <= 0 ? (t > 2 && t < 25 ? 0.9 + fear * 0.3 : Math.sin(t * 0.6 + i) * 0.2) : 0} lean={crouch * 0.35} phone={phoneOn} reach={you && phoneOn ? 0.15 : 0} />
        </group>;
      })}
      {/* sightline cone + safe zone */}
      {t > 26.6 && t < 30.9 && <>
        <mesh geometry={coneGeo} position={[0, 0.03, 0]}><meshBasicMaterial color="#ff2e2e" transparent opacity={0.28 * ease(t, 26.7, 27.1)} depthWrite={false} /></mesh>
        <mesh position={[4.4, 0.03, -3.6]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.6, 2.2]} /><meshBasicMaterial color="#C8FF3D" transparent opacity={0.3 * ease(t, 28.2, 28.6)} depthWrite={false} /></mesh>
      </>}
      {/* bite scene: kid zombie + teacher */}
      {t < 10.08 && <group position={[7.6, 0, -8.3 + bite * 0.35 - (t > 4.6 ? ease(t, 4.6, 6.5) * 2.2 : 0)]} rotation={[0, t > 4.6 ? Math.PI : 0, 0]}><Zombie look={KID} t={t} i={1} walkAmt={t > 4.6 ? 0.6 : 0.2} reach={t < 4.5 ? bite : 0} /></group>}
      <group position={teacherPos} rotation={[0, Math.PI, 0]}>
        {tZ < 0.5 && t < 7.8
          ? <Person look={LOOKS.teacher} lie={tLie} arms={t < 4.5 ? bite * 0.6 : 0} headYaw={t < 3.5 ? 0.4 : 0} lean={t < 4.5 ? -bite * 0.25 : 0} />
          : <group rotation={[0, t < 10.08 ? Math.PI : Math.sin(t * 0.25) * 0.8, 0]}><Zombie look={zombify(LOOKS.teacher)} t={t} i={2} walkAmt={t > 8.6 && t < 9.3 ? 0.9 : 0.3} reach={lunge * 0.4} /></group>}
      </group>
      {/* the hallway horde */}
      {HZ.map((z, i) => {
        if (t < z.from) return null;
        const wx = z.x + Math.sin(t * 0.35 + i * 2) * 0.35, wz = turnK > 0 ? awayZ(z.z, i) : z.z + Math.sin(t * 0.22 + i) * 0.9;
        const face = mix(Math.sin(t * 0.3 + i) * 1.5 + (i % 2 ? 0.3 : -0.3), Math.PI, turnK);
        return <group key={i} position={[wx, 0, wz]} rotation={[0, face, 0]}><Zombie look={z.look} t={t} i={i} walkAmt={turnK > 0 ? 0.7 : 0.3} /></group>;
      })}
      {/* the one at the door: looks in, pulls, scratches */}
      {t > 21.5 && <group position={[t > TURN ? mix(6.75, 7.6, turnK) : pulling(t) ? 6.95 : 6.75, 0, t > TURN ? awayZ(3.5, 6) : pulling(t) ? 2.4 : 3.5]} rotation={[0, mix(-Math.PI / 2, Math.PI, turnK), 0]}>
        <Zombie look={DOOR_Z} t={t} i={7} walkAmt={turnK > 0 ? 0.7 : 0.1} reach={pulling(t) ? 0.7 : t > 52.9 && t < 56.8 ? 0.35 + Math.sin(t * 9) * 0.2 : 0.1} />
      </group>}
      <hemisphereLight args={['#fff4e2', '#6d5a48', lightsOn > 0.5 ? 0.95 : 0.62]} />
    </>
  );
};

const CafeWorld: React.FC<{t: number}> = ({t}) => {
  const strobe = strobeAt(t);
  return (
    <>
      <Cafeteria strobe={strobe} sun={0.8} />
      <group position={[1.4, 0, 0.15]} rotation={[0, Math.PI / 2 + 0.4, 0]}><Person look={LOOKS.friend} crouch={1} lean={0.55} headYaw={-0.5 + Math.sin(t * 1.5) * 0.2} /></group>
      {[0, 1, 2, 3, 4].map((i) => {
        const st = 65.6 + i * 0.35, x = -10.5 + Math.max(0, t - st) * 1.1, z = (i - 2) * 0.6;
        return <group key={i} position={[x, 0, z]} rotation={[0, Math.PI / 2 + Math.sin(t + i) * 0.2, 0]}><Zombie look={zombify(student(20 + i))} t={t} i={i} walkAmt={0.7} /></group>;
      })}
      <hemisphereLight args={['#ffe9d6', '#5a4a40', 0.7]} />
    </>
  );
};

export const World: React.FC<{t: number; loc?: Loc; ceil?: boolean}> = ({t, loc, ceil}) => {
  const s = SHOTS[shotAt(t)];
  const L = loc ?? s.loc, ce = ceil ?? !!s.ceil;
  const p = phase(t);
  const top = phaseCol(SKY_TOP, p), bot = phaseCol(SKY_BOT, p);
  const el = (phaseNum([28, 70, 5, -15], p) * Math.PI) / 180;
  const sunCol = phaseCol(['#fff0d6', '#ffffff', '#ff8a4a', '#7f9cff'], p);
  const dusk = ease(p, 1.4, 2);
  return (
    <>
      <Sky top={top} bot={bot} />
      <Stars k={ease(p, 2.2, 3) * 0.8} />
      <directionalLight position={[-40 * Math.cos(el), Math.max(3, 50 * Math.sin(el)), 18]} intensity={phaseNum([1.8, 2.3, 1.6, 0.4], p)} color={sunCol} />
      {L !== 'ext' && <fog attach="fog" args={[bot, 30, 140]} />}
      {L === 'ext' && <>
        <fog attach="fog" args={[bot, 60, 260]} />
        <hemisphereLight args={[top, '#4a6a3a', 0.85]} />
        <mesh position={[-300 * Math.cos(el), 300 * Math.sin(el), 60]}><icosahedronGeometry args={[14, 2]} /><meshBasicMaterial color={sunCol} fog={false} /></mesh>
        <Exterior windows={t < 58.06 ? 1 : 0.0} dusk={dusk} />
        {t > 56 && [[-8, 11], [4, 12.5], [12, 10.8]].map(([x, z], i) => <group key={i} position={[x + Math.sin(t * 0.4 + i) * 0.3, 0, z]} rotation={[0, i - 1, 0]}><Zombie look={zombify(student(30 + i))} t={t} i={i} /></group>)}
      </>}
      {L === 'in' && <InWorld t={t} ceil={ce} />}
      {L === 'cafe' && <CafeWorld t={t} />}
      {L === 'map' && <>
        <hemisphereLight args={['#ffffff', '#33405a', 1.0]} />
        <FloorPlan infected={mapInfected(t)} t={t} highlight={ease(t, 10.5, 11)} />
      </>}
    </>
  );
};
const mapInfected = (t: number) => (t < 13.64 ? 1 : t < 15.7 ? 2 : Math.min(1000, Math.round(Math.pow(2, 1 + ease(t, 15.75, 18.9, Easing.in(Easing.quad)) * 9))));

// ---------- HUD + beats ----------
const fmtClock = (m: number) => { const h = Math.floor(m / 60) % 24, mm = Math.floor(m % 60); const ap = h >= 12 ? 'PM' : 'AM'; return `${((h + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${ap}`; };
const HUD: React.FC<{t: number}> = ({t}) => {
  const k = ease(t, 0.25, 0.7, Easing.out(Easing.cubic));
  if (t > 68.6) return null;
  const stat = (at: number) => pop(t, at, 0.35);
  const inf = infectedAt(t);
  const batt = Math.round(interpolate(t, [40.6, 52, 57, 68.6], [64, 58, 41, 37], CL));
  const loud = t > 59.48;
  return (
    <div style={{position: 'absolute', left: 56, right: 56, top: 92, display: 'flex', justifyContent: 'space-between', opacity: k, transform: `translateY(${(1 - k) * -40}px)`, fontFamily: FONT}}>
      <div style={{color: 'white', textShadow: '0 3px 12px rgba(0,0,0,0.7)'}}>
        <div style={{fontWeight: 800, fontSize: 30, letterSpacing: '0.16em', color: ACC.red}}>● DAY 1 <span style={{color: 'white', opacity: 0.8}}>· LOCKDOWN</span></div>
        <div style={{fontWeight: 900, fontSize: 76, lineHeight: 1, marginTop: 6}}>{fmtClock(clockMin(t))}</div>
        <div style={{fontWeight: 700, fontSize: 26, letterSpacing: '0.12em', color: ACC.amber, marginTop: 8}}>RESCUE: UNKNOWN</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14}}>
        {stat(3.6) > 0 && <div style={{transform: `scale(${stat(3.6) * (1 + (inf !== infectedAt(t - 0.1) ? 0.06 : 0))})`}}><Pill color={ACC.red} size={32}><span style={{color: ACC.red}}>{inf >= 990 ? '990+' : inf}</span>INFECTED</Pill></div>}
        {stat(40.8) > 0 && <div style={{transform: `scale(${stat(40.8)})`}}><Pill color={ACC.blue} size={32}><span style={{color: batt > 40 ? ACC.lime : ACC.amber}}>{batt}%</span>PHONE</Pill></div>}
        {stat(54.9) > 0 && <div style={{transform: `scale(${stat(54.9)})`}}><Pill color={loud ? ACC.red : ACC.lime} size={32}><span style={{color: loud ? ACC.red : ACC.lime}}>{loud ? 'MAX' : 'LOW'}</span>NOISE</Pill></div>}
      </div>
    </div>
  );
};

const PhoneCard: React.FC<{t: number}> = ({t}) => {
  if (t < 40.7 || t > 52.1) return null;
  const k = ease(t, 40.7, 41.1, Easing.out(Easing.cubic)) * (1 - ease(t, 51.7, 52.1));
  const failed = t > 42.9, jam = t > 43.98 && t < 47.6, msgs = t > 47.64;
  const ring = (Math.sin(t * 6) + 1) / 2;
  return (
    <div style={{position: 'absolute', left: 300, top: 300, width: 480, height: 820, opacity: k, transform: `translateY(${(1 - k) * 80}px) rotate(${(1 - k) * -4}deg)`, fontFamily: FONT, color: 'white'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 64, background: '#0b0e14', border: '10px solid #2a2f38', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', overflow: 'hidden'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', padding: '26px 36px 0', fontWeight: 800, fontSize: 26}}>
          <span>{fmtClock(clockMin(t)).replace(/ [AP]M/, '')}</span>
          <span style={{display: 'flex', gap: 5, alignItems: 'flex-end'}}>{[10, 15, 20, 26].map((h) => <span key={h} style={{width: 7, height: h, background: 'white', borderRadius: 2, display: 'inline-block'}} />)}<span style={{marginLeft: 8}}>5G</span></span>
        </div>
        {!msgs && <div style={{textAlign: 'center', marginTop: 90}}>
          <div style={{width: 170, height: 170, borderRadius: 999, margin: '0 auto', background: '#3a4150', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, fontWeight: 900, boxShadow: failed ? 'none' : `0 0 0 ${10 + ring * 22}px rgba(92,200,255,${0.25 - ring * 0.2})`}}>M</div>
          <div style={{fontSize: 52, fontWeight: 900, marginTop: 30}}>Mom</div>
          <div style={{fontSize: 34, fontWeight: 700, marginTop: 10, color: failed ? ACC.red : '#9aa4b5'}}>{failed ? 'Call Failed' : 'calling…'}</div>
          {jam && <div style={{margin: '60px 40px 0', padding: '26px 20px', borderRadius: 28, background: 'rgba(255,59,59,0.14)', border: `2px solid ${ACC.red}`, opacity: ease(t, 44.0, 44.3)}}>
            <div style={{fontSize: 70}}>📡</div>
            <div style={{fontSize: 22, fontWeight: 700, letterSpacing: '0.1em', color: '#c9d1dc', marginTop: 6}}>{Array.from({length: 12}, (_, i) => (t > 44.3 + i * 0.12 ? '📱' : '')).join('')}</div>
            <div style={{fontSize: 40, fontWeight: 900, color: ACC.red, marginTop: 14, opacity: ease(t, 45.9, 46.2)}}>NETWORK JAMMED</div>
          </div>}
        </div>}
        {msgs && <div style={{padding: '50px 30px 0'}}>
          <div style={{fontSize: 30, fontWeight: 800, textAlign: 'center', color: '#9aa4b5', marginBottom: 40}}>Mom</div>
          <div style={{marginLeft: 'auto', maxWidth: 330, background: '#2f7bff', borderRadius: '30px 30px 8px 30px', padding: '20px 26px', fontSize: 34, fontWeight: 700, lineHeight: 1.2, transform: `scale(${pop(t, 47.7)})`, transformOrigin: 'right bottom'}}>locked in room 214. safe for now ❤️</div>
          <div style={{textAlign: 'right', fontSize: 26, fontWeight: 800, marginTop: 12, color: ACC.lime, opacity: ease(t, 48.5, 48.8)}}>Delivered ✓</div>
          <div style={{maxWidth: 280, background: '#2a2f38', borderRadius: '30px 30px 30px 8px', padding: '20px 26px', fontSize: 34, fontWeight: 700, marginTop: 30, transform: `scale(${pop(t, 50.6)})`, transformOrigin: 'left bottom'}}>stay there. help is coming</div>
        </div>}
      </div>
    </div>
  );
};

const Beats: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const {width: W, height: Hh} = useVideoConfig();
  const proj = projector(cam, W, Hh);
  const timer = Math.max(0, 600 - Math.max(0, t - 6.0) * 600 / 1.1);
  const n = mapInfected(t);
  const steps = Math.log2(Math.max(1, n));
  const roomS = proj([(YOUR_ROOM.x0 + YOUR_ROOM.x1) / 2, 1.5, (YOUR_ROOM.z0 + YOUR_ROOM.z1) / 2]);
  const cafeS = proj([(CAFE_ROOM.x0 + CAFE_ROOM.x1) / 2, 1.5, (CAFE_ROOM.z0 + CAFE_ROOM.z1) / 2]);
  const zeroS = proj([-6, 1.5, 0]);
  const doorS = proj([DOOR.x, 2.3, 2.6]);
  const armS = proj([5.86, 2.42, 2.7]);
  const coneS = proj([0.5, 0.1, 2.2]), safeS = proj([4.4, 0.6, -3.6]);
  const alarmS = proj([9.0, 2.7, 0.2]);
  const friendS = proj([1.4, 1.35, 0.15]);
  const hallEnd = proj([7.75, 2.2, -17.5]);
  const schoolS = proj([0, 8.6, 7]);
  const x1 = pop(t, 35.42, 0.3);
  return (
    <>
      {t > 0.4 && t < 1.68 && <Tag x={schoolS.x} y={schoolS.y} text="3RD PERIOD" k={pop(t, 0.45)} color={ACC.amber} />}
      {t > 4.3 && t < 5.78 && <Tag x={proj([7.6, 2.05, -7.0]).x} y={proj([7.6, 2.05, -7.0]).y} text="BITTEN" k={pop(t, 4.4)} color={ACC.red} />}
      <Card t={t} at={5.85} out={8.4} y={330} accent={ACC.red}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: 30, fontWeight: 800, letterSpacing: '0.2em', color: ACC.red}}>TURNS IN</div>
          <div style={{fontSize: 190, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: timer <= 0 ? ACC.red : 'white'}}>{`${Math.floor(timer / 60)}:${String(Math.floor(timer % 60)).padStart(2, '0')}`}</div>
          <div style={{fontSize: 26, fontWeight: 600, opacity: 0.6, marginTop: 6}}>this scenario's rule</div>
        </div>
      </Card>
      {/* map */}
      {t > 10.5 && t < 20.38 && <Tag x={roomS.x} y={roomS.y} text="YOU" k={pop(t, 10.6)} color="#19e0cf" />}
      {t > 10.9 && t < 15.5 && <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', opacity: ease(t, 10.9, 11.2) * (1 - ease(t, 15.2, 15.5))}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 130, color: 'white', lineHeight: 1, WebkitTextStroke: '5px rgba(0,0,0,0.8)', paintOrder: 'stroke fill'}}>{Math.round(interpolate(t, [10.5, 11.4], [0, 1000], {...CL, easing: Easing.out(Easing.cubic)})).toLocaleString('en-US')}</div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, color: '#8fb8ff', letterSpacing: '0.16em', marginTop: 8}}>STUDENTS</div>
      </div>}
      {t > 12.8 && t < 15.5 && <Tag x={zeroS.x} y={zeroS.y} text="1 BITE / 10 MIN" k={pop(t, 12.9)} color={ACC.red} />}
      <Card t={t} at={15.6} out={20.1} y={310} accent={ACC.red}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
          <div>
            <div style={{fontSize: 30, fontWeight: 800, letterSpacing: '0.18em', color: ACC.red}}>INFECTED</div>
            <div style={{fontSize: 150, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{n >= 1000 ? '1,000' : n.toLocaleString('en-US')}</div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: 30, fontWeight: 800, letterSpacing: '0.18em', color: ACC.amber}}>TIME</div>
            <div style={{fontSize: 90, fontWeight: 900, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums'}}>{Math.round(steps * 10)}<span style={{fontSize: 44}}> MIN</span></div>
          </div>
        </div>
        <div style={{fontSize: 36, fontWeight: 800, marginTop: 18, color: '#c9d1dc'}}>×2 every 10 min</div>
        {t > 17.3 && <div style={{fontSize: 58, fontWeight: 900, marginTop: 14, color: ACC.red, opacity: ease(t, 17.3, 17.6)}}>WHOLE SCHOOL: &lt; 2 HOURS</div>}
      </Card>
      {t > 15.8 && t < 20.38 && <Tag x={cafeS.x} y={cafeS.y} text="CAFETERIA" k={pop(t, 15.9) * (1 - ease(t, 19.9, 20.3))} color={ACC.amber} />}
      <Stamp t={t} at={20.8} out={22.05} text="DAY 1" sub="LOCKDOWN" y={520} />
      <Card t={t} at={22.25} out={24.85} y={330} accent={ACC.red}>
        <div style={{display: 'inline-block', background: ACC.red, borderRadius: 999, padding: '8px 24px', fontSize: 30, fontWeight: 900, letterSpacing: '0.12em'}}>RULE #1</div>
        <div style={{fontSize: 72, fontWeight: 900, lineHeight: 1.02, marginTop: 20}}>DON'T RUN INTO<br /><span style={{color: ACC.red}}>THE HALLWAY</span></div>
      </Card>
      {/* lockdown checklist */}
      <Card t={t} at={25.0} out={30.7} y={250} accent={ACC.lime}>
        {[['LOCKS', 24.98], ['LIGHTS', 25.96], ['OUT OF SIGHT', 26.92]].map(([l, at]) => {
          const on = t > (at as number);
          return <div key={l as string} style={{display: 'flex', alignItems: 'center', gap: 24, fontSize: 60, fontWeight: 900, marginBottom: 8, opacity: on ? 1 : 0.35}}>
            <span style={{width: 62, height: 62, borderRadius: 16, border: `4px solid ${ACC.lime}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#0b0e14', background: on ? ACC.lime : 'transparent', fontSize: 44, transform: `scale(${on ? pop(t, at as number) : 1})`}}>{on ? '✓' : ''}</span>{l}
          </div>;
        })}
        {t > 28.96 && <div style={{fontSize: 30, fontWeight: 700, color: '#c9d1dc', marginTop: 14, opacity: ease(t, 29, 29.3)}}>Real school lockdown protocol (SRP)</div>}
      </Card>
      {t > 27.1 && t < 30.9 && <Tag x={coneS.x} y={coneS.y} text="SEEN FROM THE DOOR" k={pop(t, 27.2)} color={ACC.red} />}
      {t > 28.4 && t < 30.9 && <Tag x={safeS.x} y={safeS.y} text="BLIND SPOT" k={pop(t, 28.5)} color={ACC.lime} />}
      {/* door opens outward */}
      {t > 32.2 && t < 34.78 && <Tag x={proj([7.0, 2.4, 2.4]).x} y={proj([7.0, 2.4, 2.4]).y} text="OPENS OUTWARD" k={pop(t, 32.35)} color={ACC.amber} />}
      <Card t={t} at={33.5} out={34.7} y={1010} accent={ACC.amber}>
        <div style={{fontSize: 30, fontWeight: 800, letterSpacing: '0.16em', color: ACC.amber}}>FIRE CODE · NFPA 101</div>
        <div style={{fontSize: 42, fontWeight: 900, marginTop: 8}}>50+ people → door swings out</div>
      </Card>
      {x1 > 0 && t < 36.4 && <svg width={W} height={Hh} style={{position: 'absolute', inset: 0}}><g transform={`translate(${proj([5.5, 0.9, 2.6]).x},${proj([5.5, 0.9, 2.6]).y}) scale(${x1})`}><path d="M-80,-80 L80,80 M80,-80 L-80,80" stroke={ACC.red} strokeWidth={30} strokeLinecap="round" /></g></svg>}
      {t > 35.0 && t < 36.4 && <Tag x={proj([5.5, 1.0, 2.6]).x - 40} y={proj([5.5, 1.0, 2.6]).y - 120} text="DESKS WON'T HOLD" k={pop(t, 35.0)} color={ACC.red} />}
      {t > 36.9 && t < 38.96 && <Tag x={armS.x} y={armS.y - 10} text={t > 37.4 ? 'BELT ON THE CLOSER ARM' : 'CLOSER ARM'} k={pop(t, 37.0)} color={ACC.lime} />}
      <Stamp t={t} at={39.32} out={40.5} text="HOLDS." color={ACC.lime} y={560} size={190} />
      <PhoneCard t={t} />
      <Stamp t={t} at={49.74} out={51.9} text="TEXT, DON'T CALL" color={ACC.lime} y={1150} size={88} />
      <Stamp t={t} at={52.12} out={52.9} text="NOON" color={ACC.amber} y={520} size={190} />
      {t > 53.4 && t < 56.82 && <Tag x={doorS.x} y={doorS.y - 30} text="SCRATCH… SCRATCH…" k={pop(t, 53.4)} color={ACC.red} />}
      <Stamp t={t} at={55.0} out={56.5} text="SHHH." color={ACC.white} y={560} size={170} />
      <Stamp t={t} at={56.82} out={57.6} text="SUNSET" color={ACC.amber} y={520} size={170} />
      {t > 58.1 && t < 59.22 && <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: ease(t, 58.1, 58.3)}}><Pill color={ACC.red} size={46}><span style={{color: ACC.red}}>⚡</span>POWER: OFF</Pill></div>}
      {t > 59.5 && t < 62.46 && <Tag x={alarmS.x} y={alarmS.y - 10} text="FIRE ALARM" k={pop(t, 59.6)} color={ACC.red} />}
      <Card t={t} at={60.8} out={62.3} y={1010} accent={ACC.red}>
        <div style={{fontSize: 30, fontWeight: 800, letterSpacing: '0.16em', color: ACC.red}}>BACKUP BATTERY · NFPA 72</div>
        <div style={{fontSize: 42, fontWeight: 900, marginTop: 8}}>24 h standby + 5 min of alarm</div>
      </Card>
      {t > 63.3 && t < 65.12 && <Tag x={hallEnd.x} y={hallEnd.y} text="→ CAFETERIA" k={pop(t, 63.4)} color={ACC.amber} />}
      {t > 66.4 && t < 68.62 && <Tag x={friendS.x} y={friendS.y} text="YOUR BEST FRIEND" k={pop(t, 66.6)} color="#19e0cf" />}
      {/* red alarm wash */}
      {t > 59.48 && t < 68.62 && <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(255,0,0,0) 40%, rgba(255,20,20,0.35) 100%)', opacity: strobeAt(t)}} />}
      {/* end card */}
      {t > 68.62 && <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: FONT}}>
        <div style={{opacity: pop(t, 68.7), transform: `scale(${mix(1.4, 1, Math.min(1, pop(t, 68.7)))})`, fontWeight: 900, fontSize: 120, lineHeight: 0.95, color: 'white', textShadow: '0 6px 0 rgba(0,0,0,0.5)', WebkitTextStroke: '5px rgba(0,0,0,0.8)', paintOrder: 'stroke fill'}}>
          GO GET<br /><span style={{color: ACC.red}}>THEM?</span>
        </div>
        <div style={{marginTop: 50, display: 'flex', justifyContent: 'center', gap: 24, opacity: ease(t, 69.8, 70.2)}}>
          <Pill color={ACC.red} size={40}><span style={{color: ACC.red}}>A</span>GO</Pill>
          <Pill color={ACC.lime} size={40}><span style={{color: ACC.lime}}>B</span>STAY LOCKED IN</Pill>
        </div>
        <div style={{marginTop: 40, fontWeight: 800, fontSize: 36, letterSpacing: '0.2em', color: ACC.amber, opacity: ease(t, 70.5, 70.9)}}>DAY 2 → FOLLOW</div>
      </div>}
    </>
  );
};

const KEYS: Record<string, string> = {
  third: ACC.amber, period: ACC.amber, screams: ACC.red, bit: ACC.red, teacher: ACC.amber, ten: ACC.red, minutes: ACC.red, up: ACC.red, bites: ACC.red,
  thousand: ACC.blue, students: ACC.blue, infected: ACC.red, doubles: ACC.red, gone: ACC.red, two: ACC.amber, hours: ACC.amber, day: ACC.lime,
  rule: ACC.lime, "don't": ACC.red, hallway: ACC.red, lock: ACC.lime, lights: ACC.lime, off: ACC.lime, sight: ACC.lime, lockdown: ACC.lime, drill: ACC.lime,
  outward: ACC.amber, fire: ACC.red, code: ACC.amber, desks: ACC.red, belt: ACC.lime, closer: ACC.lime, arm: ACC.lime, "won't": ACC.lime, open: ACC.lime,
  phone: ACC.blue, full: ACC.blue, bars: ACC.blue, fail: ACC.red, jams: ACC.red, texts: ACC.lime, through: ACC.lime, text: ACC.lime, call: ACC.red,
  noon: ACC.amber, scratches: ACC.red, sound: ACC.red, sunset: ACC.amber, power: ACC.red, dies: ACC.red, alarm: ACC.red, battery: ACC.amber,
  cafeteria: ACC.amber, best: ACC.lime, friend: ACC.lime, hiding: ACC.lime, go: ACC.red, them: ACC.red,
};

const CutFlash: React.FC<{t: number}> = ({t}) => {
  const s = SHOTS.find((x) => x.from > 0 && t >= x.from && t < x.from + 0.16);
  if (!s) return null;
  return <AbsoluteFill style={{background: 'white', opacity: 0.2 * (1 - (t - s.from) / 0.16)}} />;
};

export const SFX: Sfx[] = [
  [0.0, 'whoosh_long', 0.3], [1.68, 'scream', 0.35], [3.5, 'impact', 0.5], [3.7, 'growl', 0.45], [5.78, 'whoosh', 0.3], [6.0, 'click', 0.3], [7.14, 'riser', 0.25],
  [7.7, 'growl', 0.5], [8.58, 'boom', 0.45], [10.08, 'whoosh_long', 0.3], [11.0, 'ding', 0.25], [13.0, 'click', 0.3], [15.6, 'glitch', 0.25], [16.4, 'glitch', 0.2],
  [17.3, 'impact', 0.45], [20.8, 'impact', 0.55], [22.25, 'whoosh', 0.3], [23.3, 'growl', 0.35], [24.98, 'clunk', 0.5], [25.96, 'clunk', 0.55], [26.92, 'ding', 0.3],
  [28.5, 'ding', 0.25], [30.9, 'whoosh', 0.3], [32.0, 'rattle', 0.3], [33.5, 'click', 0.3], [34.8, 'whoosh', 0.25], [35.42, 'impact', 0.5], [36.4, 'whoosh', 0.25],
  [37.2, 'pop', 0.35], [38.96, 'rattle', 0.55], [39.5, 'rattle', 0.45], [39.32, 'ding', 0.3], [40.64, 'whoosh', 0.3], [42.9, 'callfail', 0.35], [46.0, 'glitch', 0.3],
  [47.7, 'send', 0.4], [48.5, 'ding', 0.25], [49.74, 'impact', 0.4], [50.6, 'pop', 0.3], [52.12, 'swell_hit', 0.35], [53.2, 'scratch', 0.45], [54.4, 'scratch', 0.4],
  [55.0, 'heartbeat', 0.5], [55.9, 'heartbeat', 0.5], [56.82, 'whoosh_long', 0.3], [58.06, 'clunk', 0.6], [59.48, 'alarm', 0.3], [61.0, 'alarm', 0.28], [62.46, 'growl', 0.4],
  [62.6, 'alarm', 0.25], [64.2, 'alarm', 0.22], [65.12, 'whoosh', 0.3], [65.8, 'alarm', 0.2], [66.6, 'growl', 0.4], [67.4, 'alarm', 0.2], [68.62, 'boom', 0.5], [69.8, 'heartbeat', 0.45],
];

export const LockdownDay1: React.FC = () => {
  const {width: W, height: Hh} = useVideoConfig();
  const t = useT();
  const cam = camAt(t);
  const dim = (t > 5.85 && t < 8.6 ? 0.35 * ease(t, 5.85, 6.2) * (1 - ease(t, 8.3, 8.6)) : 0) + (t > 40.7 && t < 52.1 ? 0.35 * ease(t, 40.7, 41.1) * (1 - ease(t, 51.7, 52.1)) : 0);
  const biteFlash = t > 3.9 && t < 4.6 ? 0.45 * (1 - ease(t, 3.95, 4.6)) : 0;
  return (
    <AbsoluteFill style={{background: '#05070c'}}>
      <ThreeCanvas width={W} height={Hh} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
        <CameraRig cam={cam} />
        <World t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'black', opacity: dim}} />
      <AbsoluteFill style={{background: '#ff1a1a', opacity: biteFlash, mixBlendMode: 'screen'}} />
      <Vignette />
      <Grain />
      <HUD t={t} />
      <Beats t={t} cam={cam} />
      <Captions words={WORDS} t={t} keys={KEYS} y={1330} hide={(x) => x > 68.6} />
      <CutFlash t={t} />
      <AbsoluteFill style={{background: 'black', opacity: t < 0.5 ? 1 - ease(t, 0, 0.5) : ease(t, LOCKDOWN1_SEC - 0.5, LOCKDOWN1_SEC)}} />
      <DayAudio job={JOB} sec={LOCKDOWN1_SEC} sfx={SFX} musicVol={0.11} />
    </AbsoluteFill>
  );
};

// ---------- thumbnail ----------
export const LockdownDay1Thumb: React.FC = () => {
  const {width: W, height: Hh} = useVideoConfig();
  const t = 61.2;
  const cam: Cam = {pos: [4.85, 1.45, 1.55], look: [6.1, 1.62, 2.95], fov: 36};
  return (
    <AbsoluteFill style={{background: '#05070c', fontFamily: FONT}}>
      <ThreeCanvas width={W} height={Hh} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
        <CameraRig cam={cam} />
        <World t={t} loc="in" ceil />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.75) 100%)'}} />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: ACC.red, color: 'white', fontWeight: 900, fontSize: 52, letterSpacing: '0.14em', padding: '12px 34px', borderRadius: 999}}>ZOMBIE OUTBREAK</div>
        <div style={{fontWeight: 900, fontSize: 300, lineHeight: 0.9, color: 'white', marginTop: 30, WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', textShadow: '0 12px 0 rgba(0,0,0,0.5)'}}>DAY 1</div>
      </div>
      <div style={{position: 'absolute', bottom: 260, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontWeight: 900, fontSize: 100, lineHeight: 1, color: 'white', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>DON'T OPEN</div>
        <div style={{fontWeight: 900, fontSize: 100, lineHeight: 1, color: ACC.lime, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>THE DOOR</div>
      </div>
    </AbsoluteFill>
  );
};
