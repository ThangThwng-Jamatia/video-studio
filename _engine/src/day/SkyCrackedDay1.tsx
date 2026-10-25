// THE SKY CRACKED — Day 1 (Day Series, 9:16). Ranger + 7 hikers under a split sky; flash-to-bang + metal-shell facts inside a fantasy story.
// Low-poly 3D world keyed to words in skyCrackedDay1Words.ts. Voice: Brian narrator + per-character voices (see the script .md).
import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {ACC, Bar, Cam, CameraRig, Captions, Card, DayAudio, ease, FONT, Grain, handheld, mix, mix3, Pill, pop, projector, rnd, Sfx, Sky, Stamp, Stars, Tag, useT, V3, Vignette} from './dayKit';
import {Look, Person, student} from './schoolKit';
import {WORDS} from './skyCrackedDay1Words';

export const SKY1_SEC = 69.6;
const JOB = 'jobs/skycracked-day1';
const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// ---------- story timing (from the words file) ----------
const STRIKES = [{at: 12.8, to: [45, 0, -110] as V3, w: 1.3}, {at: 24.44, to: [18, 0, -45] as V3, w: 0.7}, {at: 35.3, to: [6, 2.4, 2] as V3, w: 0.18}, {at: 43.2, to: [-7, 9.5, 6] as V3, w: 0.3}];
const SLAM = 40.34, TREE_HIT = 43.2, SHARDS = 46.4, CATCH = 51.1, IGNITE = 52.58, RANKUP = 54.2, OPEN = 55.0, FOUND = 58.06, MAP = 58.9, END = 63.95;
const strikeK = (t: number) => STRIKES.reduce((a, s) => a + (t > s.at && t < s.at + 0.45 ? (1 - (t - s.at) / 0.45) * (Math.sin((t - s.at) * 60) > -0.3 ? 1 : 0.3) : 0), 0);
const crackW = (t: number) => interpolate(t, [0, 9, 45, OPEN, FOUND, SKY1_SEC], [3.2, 4.2, 4.6, 5, 11, 12], CL);

// ---------- cast ----------
type Who = {look: Look; p: [number, number]};
const L = {
  you: {skin: '#e3b08a', top: '#c9a24a', bottom: '#3f4a2e', hair: '#2a1c14'},
  dana: {skin: '#f0c6a2', top: '#d84f8a', bottom: '#2b3445', hair: '#7a5530'},
  reyes: {skin: '#a8714e', top: '#4a5a32', bottom: '#2b2b2b', hair: '#9a9a9a'},
  eli: {skin: '#d9a27a', top: '#ff8a3d', bottom: '#30384a', hair: '#1d1410'},
} satisfies Record<string, Look>;
const CAST: Who[] = [
  {look: L.you, p: [0.5, 4]}, {look: L.dana, p: [-0.8, 4.8]}, {look: L.reyes, p: [1.8, 5.0]}, {look: L.eli, p: [-1.6, 5.6]},
  {look: student(1), p: [0.2, 6.1]}, {look: student(4), p: [2.8, 6.0]}, {look: student(6), p: [-2.6, 6.5]}, {look: student(3), p: [1.2, 7.0]},
];
const TRUCK: V3 = [6, 0, 2];
const REYES_OUT: V3 = [4.4, 0, 4.4];
const runTo = (i: number, t: number): V3 => {
  const [x, z] = CAST[i].p;
  const k = ease(t, 38.6 + i * 0.12, 40.0 + i * 0.05, Easing.inOut(Easing.quad));
  return [mix(x, 4.9, k), 0, mix(z, 2.4 + (i % 3) * 0.3, k)];
};

// ---------- shots ----------
type Shot = {from: number; to: number; shake?: number; cam: (k: number, t: number) => Cam};
const C = (pos: V3, look: V3, fov = 42): Cam => ({pos, look, fov});
const lerp = (a: Cam, b: Cam) => (k: number): Cam => ({pos: mix3(a.pos, b.pos, k), look: mix3(a.look, b.look, k), fov: mix(a.fov, b.fov, k)});
const CRACK: V3 = [10, 70, -160];
const SHOTS: Shot[] = [
  {from: 0, to: 1.68, shake: 1.4, cam: lerp(C([2.5, 1.0, 13], [9, 52, -150], 58), C([2.5, 1.2, 12], [9.5, 56, -150], 50))},
  {from: 1.68, to: 2.86, shake: 0.8, cam: lerp(C([0.6, 1.75, 2.2], [-0.8, 1.5, 4.8], 42), C([-0.2, 1.7, 2.5], [-0.8, 1.5, 4.8], 38))},
  {from: 2.86, to: 3.9, cam: lerp(C([1.3, 1.75, 1.7], [0.5, 1.45, 4], 42), C([1.1, 1.72, 1.95], [0.5, 1.45, 4], 38))},
  {from: 3.9, to: 5.1, cam: lerp(C([2.5, 4.2, -2.8], [0.4, 0.9, 5.6], 48), C([1.2, 3.6, -2.0], [0.4, 0.9, 5.6], 46))},
  {from: 5.1, to: 6.7, cam: lerp(C([8, 3, -16], [-3, 5, -3], 44), C([5, 3.8, -14], [-3, 5.5, -3], 42))},
  {from: 6.7, to: 7.98, cam: lerp(C([0.9, 1.7, 1.8], [0.5, 1.5, 4], 40), C([0.8, 1.68, 2.2], [0.5, 1.52, 4], 36))},
  {from: 7.98, to: 9.8, shake: 0.6, cam: lerp(C([2.7, 1.8, 2.5], [1.8, 1.5, 5.0], 42), C([2.5, 1.75, 2.8], [1.8, 1.52, 5.0], 38))},
  {from: 9.8, to: 12.75, cam: lerp(C([0.9, 1.9, 6.6], [22, 14, -100], 44), C([0.8, 1.85, 5.9], [24, 12, -100], 40))},
  {from: 12.75, to: 17.7, cam: lerp(C([0, 2, 9], [40, 10, -110], 40), C([0.5, 2, 8], [42, 8, -110], 36))},
  {from: 17.7, to: 24.4, cam: lerp(C([-12, 16, 22], [20, 0, -60], 46), C([-7, 12, 15], [22, 2, -60], 44))},
  {from: 24.4, to: 28.7, shake: 1, cam: lerp(C([-2, 1.8, 8], [18, 6, -45], 46), C([-1.5, 1.7, 7.2], [18, 5, -45], 40))},
  {from: 28.7, to: 31.2, shake: 0.8, cam: lerp(C([-0.3, 1.8, 3.1], [-1.6, 1.6, 5.6], 44), C([-0.5, 1.75, 3.4], [-1.6, 1.6, 5.6], 40))},
  {from: 31.2, to: 33.3, cam: lerp(C([-1, 2.4, 13], [-7, 5, 6], 46), C([-3, 2.2, 11.5], [-7, 5.5, 6], 42))},
  {from: 33.3, to: 34.7, cam: lerp(C([1.5, 2, 9.5], [6, 1.2, 2], 42), C([2.5, 2.1, 8.5], [6, 1.2, 2], 40))},
  {from: 34.7, to: 38.6, cam: lerp(C([11.5, 4, 8.5], [6, 1.3, 2], 44), C([10.5, 3.4, 7.4], [6, 1.3, 2], 40))},
  {from: 38.6, to: SLAM, cam: lerp(C([1, 4.5, 14], [3, 1, 3.5], 46), C([2, 4, 12.5], [4, 1, 3], 44))},
  {from: SLAM, to: TREE_HIT, cam: lerp(C([9, 1.4, -1], [-7, 4, 6], 46), C([8.5, 1.5, -0.4], [-7, 4.5, 6], 42))},
  {from: TREE_HIT, to: 43.9, shake: 2.5, cam: lerp(C([-2, 3, 15], [-7, 5, 6], 46), C([-2.5, 3, 14], [-7, 4.5, 6], 48))},
  {from: 43.9, to: 45.26, cam: lerp(C([5.3, 1.45, 4.3], [5.4, 1.2, 2.2], 44), C([5.35, 1.42, 4.0], [5.4, 1.2, 2.2], 40))},
  {from: 45.26, to: 49.1, cam: lerp(C([6, 1.2, 9], [8, 28, -60], 56), C([6, 1.3, 8], [9, 34, -80], 52))},
  {from: 49.1, to: CATCH - 0.1, cam: lerp(C([1.5, 2.6, 9], [5, 2, 2], 46), C([2.2, 2.4, 8], [5, 2.2, 2.5], 42))},
  {from: CATCH - 0.1, to: 53.1, cam: lerp(C([3.9, 1.9, 7.4], [4.5, 1.8, 4.4], 44), C([4.0, 1.95, 6.9], [4.6, 1.9, 4.4], 40))},
  {from: 53.1, to: OPEN, cam: lerp(C([4.6, 1.3, 6.8], [4.5, 1.9, 4.4], 48), C([4.8, 1.1, 6.4], [4.5, 2.0, 4.4], 52))},
  {from: OPEN, to: FOUND - 0.06, cam: lerp(C([0, 1.4, 12], [9, 62, -150], 34), C([1, 1.4, 11], [9.5, 66, -150], 28))},
  {from: FOUND - 0.06, to: MAP, shake: 1.2, cam: lerp(C([2, 2, 10], [10, 70, -158], 13), C([2, 2, 10], [10, 70, -158], 10))},
  {from: MAP, to: END, cam: lerp(C([0, 70, 40], [0, 0, -10], 50), C([0, 60, 30], [0, 0, -10], 46))},
  {from: END, to: SKY1_SEC + 1, cam: lerp(C([-1, 1.2, 15], [9, 50, -150], 52), C([-1, 1.2, 14], [9, 54, -150], 48))},
];
const shotAt = (t: number) => Math.max(0, SHOTS.findIndex((s) => t >= s.from && t < s.to));
const camAt = (t: number): Cam => {
  const s = SHOTS[shotAt(t)];
  const c = handheld(s.cam(ease(t, s.from, s.to, Easing.inOut(Easing.sin)), t), t, 1);
  const sh = ((s.shake ?? 0) + strikeK(t) * 0.8) * 0.02;
  return sh ? {...c, pos: [c.pos[0] + Math.sin(t * 37) * sh, c.pos[1] + Math.sin(t * 43 + 1) * sh, c.pos[2]]} : c;
};

// ---------- props ----------
const M: React.FC<{c: string; e?: number}> = ({c, e = 0}) => <meshStandardMaterial color={c} emissive={c} emissiveIntensity={e} flatShading roughness={0.7} />;
const B: React.FC<{p: V3; s: V3; c: string; e?: number}> = ({p, s, c, e}) => <mesh position={p}><boxGeometry args={s} /><M c={c} e={e} /></mesh>;

const Terrain: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(420, 420, 70, 70).rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z);
      const hill = 2.2 * Math.sin(x * 0.07) * Math.cos(z * 0.06) + 1.4 * Math.sin(x * 0.19 + z * 0.13);
      p.setY(i, r < 16 ? 0 : (hill + 1.2) * Math.min(1, (r - 16) / 14) - (r > 60 ? (r - 60) * 0.08 : 0));
    }
    g.computeVertexNormals(); return g;
  }, []);
  return <mesh geometry={geo}><meshStandardMaterial color="#3e5a34" flatShading roughness={0.9} /></mesh>;
};
const PEAKS = Array.from({length: 22}, (_, i) => { const a = -Math.PI * 0.95 + rnd(i) * Math.PI * 0.9 - 0.2, r = 90 + rnd(i + 50) * 90; return {x: Math.cos(a) * r, z: Math.sin(a) * r, h: 30 + rnd(i + 9) * 45, w: 20 + rnd(i + 3) * 18}; });
const PINES = Array.from({length: 46}, (_, i) => { const a = rnd(i + 200) * Math.PI * 2, r = 19 + rnd(i + 300) * 40; return {x: Math.cos(a) * r, z: Math.sin(a) * r, s: 0.8 + rnd(i + 400) * 0.8}; });
const Pine: React.FC<{s?: number}> = ({s = 1}) => (
  <group scale={s}>
    <mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.18, 0.25, 1.6, 5]} /><M c="#4a3424" /></mesh>
    <mesh position={[0, 3.2, 0]}><coneGeometry args={[1.6, 3.6, 6]} /><M c="#24452c" /></mesh>
    <mesh position={[0, 5.0, 0]}><coneGeometry args={[1.1, 2.8, 6]} /><M c="#2c5434" /></mesh>
  </group>
);
const Tower: React.FC = () => (
  <group position={[-3, 0, -3]}>
    {[[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].map(([x, z], i) => <mesh key={i} position={[x * 0.85, 3.2, z * 0.85]} rotation={[z * 0.04, 0, -x * 0.04]}><boxGeometry args={[0.22, 6.4, 0.22]} /><M c="#6b5a44" /></mesh>)}
    {[1.6, 3.2, 4.8].map((y) => <B key={y} p={[0, y, 0]} s={[2.3, 0.12, 2.3]} c="#5a4a38" />)}
    <B p={[0, 6.5, 0]} s={[3.4, 0.25, 3.4]} c="#7a6650" />
    <B p={[0, 7.6, 0]} s={[2.6, 2.0, 2.6]} c="#d8cfb8" />
    <B p={[0, 7.8, 1.31]} s={[2.0, 0.9, 0.02]} c="#ffcf7a" e={0.8} />
    <mesh position={[0, 9.1, 0]}><coneGeometry args={[2.3, 1.2, 4]} /><M c="#7a2e22" /></mesh>
  </group>
);
// pickup with open windows (roof on pillars) so faces read inside
const Truck: React.FC<{glow: number; doorOpen: number}> = ({glow, doorOpen}) => (
  <group position={TRUCK} rotation={[0, Math.PI / 2, 0]}>
    <B p={[0, 0.85, 0]} s={[1.9, 0.75, 4.6]} c="#e8e6dc" />
    <B p={[0, 0.85, 0.02]} s={[1.92, 0.18, 4.62]} c="#2f6b3a" />
    <B p={[0, 1.95, 0.3]} s={[1.85, 0.1, 1.8]} c="#e8e6dc" />
    {[[-0.88, -0.55], [0.88, -0.55], [-0.88, 1.15], [0.88, 1.15]].map(([x, z], i) => <B key={i} p={[x, 1.6, z + 0.3]} s={[0.1, 0.8, 0.1]} c="#d8d6cc" />)}
    {[-1, 1].map((x) => [-1.4, 1.5].map((z) => <mesh key={`${x}${z}`} position={[x * 0.95, 0.45, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.45, 0.45, 0.32, 10]} /><M c="#1a1a1a" /></mesh>))}
    <B p={[0, 0.95, 2.31]} s={[1.6, 0.25, 0.04]} c="#ffe9a8" e={0.6} />
    <group position={[0.95, 1.2, 0.85]} rotation={[0, doorOpen * 1.1, 0]}><B p={[0, 0, -0.55]} s={[0.06, 0.7, 1.1]} c="#e8e6dc" /></group>
    <mesh position={[0, 1.6, 0.3]}><boxGeometry args={[1.8, 0.72, 1.75]} /><meshStandardMaterial color="#1c2a38" transparent opacity={0.45} roughness={0.1} metalness={0.4} /></mesh>
    {glow > 0 && <mesh position={[0, 1.15, 0]}><boxGeometry args={[2.05, 1.75, 4.75]} /><meshBasicMaterial color={ACC.lime} wireframe transparent opacity={glow} /></mesh>}
  </group>
);
// current running over the shell: sparks travel roof → pillars → body → wheels → ground
const SPARK_PATHS: V3[][] = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => [[6, 2.0, 2.3], [6 + sz * 0.9, 1.95, 2 + sx * 0.88], [6 + sz * 0.9, 1.2, 2 + sx * 0.95], [6 + sz * 1.45, 0.45, 2 + sx * 0.95], [6 + sz * 1.6, 0, 2 + sx * 1.6]] as V3[]));
const Sparks: React.FC<{t: number}> = ({t}) => {
  if (t < 35.35 || t > 38.6) return null;
  return <>{SPARK_PATHS.flatMap((path, j) => [0, 1, 2].map((n) => {
    const k = ((t - 35.35 + n * 0.33 + j * 0.07) % 1.0) / 1.0;
    const seg = Math.min(path.length - 2, Math.floor(k * (path.length - 1))), f = k * (path.length - 1) - seg;
    return <mesh key={`${j}${n}`} position={mix3(path[seg], path[seg + 1], f)}><icosahedronGeometry args={[0.09, 0]} /><meshBasicMaterial color={ACC.lime} /></mesh>;
  }))}</>;
};

const Bolt: React.FC<{from: V3; to: V3; seed: number; w: number}> = ({from, to, seed, w}) => {
  const segs = useMemo(() => {
    const n = 11, d = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
    const pts: V3[] = Array.from({length: n + 1}, (_, i) => {
      const p = mix3(from, to, i / n), j = i === 0 || i === n ? 0 : d * 0.06;
      return [p[0] + (rnd(seed + i) - 0.5) * j, p[1], p[2] + (rnd(seed + i + 50) - 0.5) * j];
    });
    const up = new THREE.Vector3(0, 1, 0);
    return pts.slice(1).map((b, i) => {
      const a = pts[i], v = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      return {mid: mix3(a, b, 0.5), len: v.length(), q: new THREE.Quaternion().setFromUnitVectors(up, v.clone().normalize())};
    });
  }, [from, to, seed]);
  return <>{segs.map((s, i) => <mesh key={i} position={s.mid} quaternion={s.q}><cylinderGeometry args={[w, w, s.len, 4]} /><meshBasicMaterial color="#eef3ff" fog={false} /></mesh>)}</>;
};

// the crack: jagged ribbon, black core + magenta glow, widens over the episode
const JAG = Array.from({length: 26}, (_, i) => (rnd(i + 700) - 0.5) * 7);
const crackShape = (w: number, len = 70) => {
  const s = new THREE.Shape(), n = JAG.length - 1;
  const xy = (i: number, side: number) => { const x = -len + (2 * len * i) / n, taper = 1 - Math.pow(x / len, 2); return [x, JAG[i] + side * (w / 2) * taper * (0.6 + 0.4 * Math.abs(Math.sin(i * 1.7)))]; };
  s.moveTo(...(xy(0, 1) as [number, number]));
  for (let i = 1; i <= n; i++) s.lineTo(...(xy(i, 1) as [number, number]));
  for (let i = n; i >= 0; i--) s.lineTo(...(xy(i, -1) as [number, number]));
  return new THREE.ShapeGeometry(s);
};
const Crack: React.FC<{t: number}> = ({t}) => {
  const w = crackW(t), pulse = 0.85 + 0.15 * Math.sin(t * 6);
  return (
    <group position={CRACK} rotation={[0, -0.06, -0.12]}>
      <mesh geometry={crackShape(w + 9)} position={[0, 0, -1.2]}><meshBasicMaterial color="#ff3ce6" transparent opacity={0.22 * pulse} fog={false} /></mesh>
      <mesh geometry={crackShape(w + 2.6)} position={[0, 0, -0.6]}><meshBasicMaterial color="#c873ff" fog={false} /></mesh>
      <mesh geometry={crackShape(w)}><meshBasicMaterial color="#07000d" fog={false} /></mesh>
      <Hand t={t} />
      <Eye t={t} />
    </group>
  );
};
// clawed hand gripping the lower edge (hook) — retracts once the storm starts
const Hand: React.FC<{t: number}> = ({t}) => {
  const k = t < 9.8 ? 0.65 + 0.35 * ease(t, 0, 1.6, Easing.out(Easing.cubic)) : 1 - ease(t, 9.8, 11);
  if (k <= 0) return null;
  return (
    <group position={[4, -4 - 9 * k, 3]} scale={2.1}>
      <mesh position={[0, 2.6, -0.6]} rotation={[0.3, 0, 0]}><boxGeometry args={[12, 4.4, 3.2]} /><meshBasicMaterial color="#12081a" fog={false} /></mesh>
      {[-4.5, -1.5, 1.5, 4.5].map((x) => <mesh key={x} position={[x, 0.9, 0.6]}><icosahedronGeometry args={[1.35, 0]} /><meshBasicMaterial color="#1e0f2a" fog={false} /></mesh>)}
      {[-4.5, -1.5, 1.5, 4.5].map((x, i) => (
        <group key={i} position={[x, 0.8, 0]} rotation={[0.5 + Math.sin(t * 2 + i) * 0.06, 0, (x / 4.5) * 0.18]}>
          <mesh position={[0, -4, 0.8]}><cylinderGeometry args={[0.9, 1.1, 8, 5]} /><meshBasicMaterial color="#1a0d24" fog={false} /></mesh>
          <mesh position={[0, -8.6, 2.0]} rotation={[0.6, 0, 0]}><coneGeometry args={[0.8, 3.2, 5]} /><meshBasicMaterial color="#e8e0ff" fog={false} /></mesh>
        </group>
      ))}
    </group>
  );
};
const Eye: React.FC<{t: number}> = ({t}) => {
  const open = ease(t, OPEN + 0.8, FOUND - 0.2), red = ease(t, FOUND, FOUND + 0.25);
  if (open <= 0) return null;
  return (
    <group position={[2, JAG[13], 0.5]} scale={[1, open, 1]}>
      <mesh scale={[1.6, 1, 0.3]}><sphereGeometry args={[4.4, 14, 10]} /><meshBasicMaterial color="#e9dcc4" fog={false} /></mesh>
      <mesh position={[0, 0, 1.4]}><circleGeometry args={[2.6, 18]} /><meshBasicMaterial color={new THREE.Color('#f2b230').lerp(new THREE.Color('#ff1a1a'), red)} fog={false} /></mesh>
      <mesh position={[0, 0, 1.5]} scale={[0.25 + 0.15 * (1 - red), 1, 1]}><circleGeometry args={[2.3, 14]} /><meshBasicMaterial color="#050005" fog={false} /></mesh>
    </group>
  );
};
// sky shards: glowing faceted crystals falling from the crack
const SHARD_N = 34;
const shardPos = (i: number, t: number): V3 | null => {
  const st = SHARDS + i * 0.21, dur = 2.8 + rnd(i + 900) * 1.2;
  if (i === 0) { // the one Reyes catches
    const k = ease(t, CATCH - 2.2, CATCH, Easing.in(Easing.quad));
    return t < CATCH - 2.2 ? null : t < CATCH ? mix3([4.0, 40, -20], [4.66, 1.82, 4.9], k) : [4.66, 1.82, 4.9];
  }
  if (t < st) return null;
  const k = Math.min(1, (t - st) / dur), x = -6 + rnd(i + 800) * 30, z = -44 + rnd(i + 850) * 30;
  return [x + (1 - k) * 8, mix(46, 0.3, Easing.in(Easing.quad)(k)), z];
};
const Shards: React.FC<{t: number}> = ({t}) => {
  if (t < SHARDS - 1) return null;
  return <>{Array.from({length: SHARD_N}, (_, i) => {
    const p = shardPos(i, t); if (!p) return null;
    return <mesh key={i} position={p} rotation={[t * 2 + i, t * 3 + i, 0]}><octahedronGeometry args={[i === 0 ? 0.09 : 0.9, 0]} /><meshBasicMaterial color="#8ff0ff" fog={false} /></mesh>;
  })}{t > IGNITE && <mesh position={[4.66, 1.82, 4.9]} scale={0.1 + 0.02 * Math.sin(t * 22)}><icosahedronGeometry args={[1, 1]} /><meshBasicMaterial color="#8ff0ff" transparent opacity={0.75} /></mesh>}<pointLight position={[4.66, 2.0, 5.2]} intensity={t > IGNITE ? 9 + Math.sin(t * 20) : t > CATCH ? 3 : 0} distance={8} decay={1.4} color="#5ce8ff" /></>;
};
// tree that explodes into flat-shaded chunks
const TreeLone: React.FC<{t: number}> = ({t}) => {
  if (t < TREE_HIT) return <group position={[-7, 0, 6]}><Pine s={1.75} /></group>;
  const k = t - TREE_HIT;
  return (
    <group position={[-7, 0, 6]}>
      <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.3, 0.42, 1.2, 5]} /><M c="#1e1410" /></mesh>
      {Array.from({length: 14}, (_, i) => {
        const a = rnd(i + 60) * Math.PI * 2, v = 4 + rnd(i + 70) * 6, up = 6 + rnd(i + 80) * 7;
        const y = Math.max(0.3, 4 + up * k - 9.8 * k * k);
        return <mesh key={i} position={[Math.cos(a) * v * k, y, Math.sin(a) * v * k]} rotation={[k * 5 + i, k * 4, 0]}><tetrahedronGeometry args={[0.4 + rnd(i) * 0.5, 0]} /><M c={i % 3 ? '#2c5434' : '#4a3424'} /></mesh>;
      })}
      {k < 1.5 && <mesh position={[0, 4, 0]} scale={1 + k * 3}><icosahedronGeometry args={[0.6, 1]} /><meshBasicMaterial color="#ffb347" transparent opacity={Math.max(0, 0.55 - k * 0.8)} /></mesh>}
      {k < 1.2 && <pointLight position={[0, 4, 0]} intensity={30 * (1 - k / 1.2)} distance={30} color="#ffb347" />}
    </group>
  );
};

const inTruck = (t: number) => t > SLAM - 0.05;
const World: React.FC<{t: number}> = ({t}) => {
  const storm = ease(t, 8, 26), sk = strikeK(t), shard = ease(t, SHARDS, SHARDS + 3);
  const top = new THREE.Color('#2a1640').lerp(new THREE.Color('#120a24'), storm).lerp(new THREE.Color('#0d3a5a'), shard * 0.6);
  const bot = new THREE.Color('#ff7a3a').lerp(new THREE.Color('#8a3a5a'), storm).lerp(new THREE.Color('#3aa0c8'), shard * 0.4).lerp(new THREE.Color('#ffffff'), sk * 0.5);
  return (
    <>
      <Sky top={top} bot={bot} />
      <Stars k={0.3 * storm} />
      <fog attach="fog" args={[bot, 70, 330]} />
      <hemisphereLight args={['#ffd2b0', '#2a2440', 0.95 + sk * 1.6 + shard * 0.3]} />
      <directionalLight position={[60, 30, -120]} intensity={1.0 - storm * 0.5} color="#ff9a5a" />
      <directionalLight position={[-20, 40, 30]} intensity={0.4} color="#a7b4ff" />
      <mesh position={[70, 8, -300]}><circleGeometry args={[16, 20]} /><meshBasicMaterial color="#ffb070" fog={false} transparent opacity={1 - storm * 0.8} /></mesh>
      <Terrain />
      {PEAKS.map((p, i) => <group key={i} position={[p.x, -2, p.z]}><mesh position={[0, p.h / 2, 0]}><coneGeometry args={[p.w, p.h, 6]} /><M c={i % 2 ? '#3b4252' : '#454c5e'} /></mesh><mesh position={[0, p.h * 0.86, 0]}><coneGeometry args={[p.w * 0.28, p.h * 0.28, 6]} /><M c="#e6ecf5" /></mesh></group>)}
      {PINES.map((p, i) => <group key={i} position={[p.x, 0, p.z]}><Pine s={p.s} /></group>)}
      <Crack t={t} />
      <Tower />
      <TreeLone t={t} />
      <Truck glow={t > 35.35 && t < 38.6 ? 0.5 + 0.4 * Math.sin(t * 25) : 0} doorOpen={t > 45.8 && t < 50 ? ease(t, 45.8, 46.3) : 0} />
      <Sparks t={t} />
      {STRIKES.map((s, i) => t > s.at && t < s.at + 0.45 && strikeK(t) > 0.5 && <Bolt key={i} from={[s.to[0] + 6, s.to[1] + (i === 2 ? 30 : 70), s.to[2] - 10]} to={s.to} seed={i * 31 + Math.floor((t - s.at) * 12)} w={s.w} />)}
      {sk > 0 && <pointLight position={[STRIKES.find((s) => t > s.at && t < s.at + 0.45)?.to[0] ?? 0, 20, STRIKES.find((s) => t > s.at && t < s.at + 0.45)?.to[2] ?? 0]} intensity={60 * sk} distance={200} decay={1} color="#dfe8ff" />}
      {/* cast: on the ridge until they run, then in the truck */}
      {CAST.map((c, i) => {
        if (inTruck(t)) {
          if (i === 2 && t > 46.2) { // Reyes steps out to catch a shard
            const k = ease(t, 46.2, 48.5);
            return <group key={i} position={mix3([4.9, 0, 3.4], REYES_OUT, k)} rotation={[0, 0, 0]}><Person look={c.look} walk={t * 4} walkAmt={k < 1 ? 0.5 : 0} armUp={ease(t, CATCH - 0.6, CATCH - 0.1)} headTilt={t > CATCH ? -0.3 : -0.8} /></group>;
          }
          if (i === 1) return <group key={i} position={[5.4, 0.35, 2.2]} rotation={[0, Math.PI / 2 - 0.2, 0]}><Person look={c.look} sit={1} headYaw={-0.4} arms={0.3} /></group>;
          return null;
        }
        const run = t > 38.6;
        const [x, , z] = run ? runTo(i, t) : [c.p[0], 0, c.p[1]];
        const point = i === 3 && t > 28.9 && t < 31.3 ? 1 : 0;
        const face = i === 0 && t > 33.4 && t < 38.6 ? 1 : 0;
        const rot = run ? Math.atan2(4.9 - c.p[0], 2.4 - c.p[1]) : Math.PI + (point ? 0.9 : 0) + (face ? -1.1 : 0) + Math.sin(t * 0.5 + i) * 0.08;
        return <group key={i} position={[x, 0, z]} rotation={[0, rot, 0]}><Person look={c.look} walk={t * 9 + i} walkAmt={run ? 1 : 0} lean={run ? 0.25 : 0} armUp={point || face} headTilt={!run && t < 9.8 ? -0.6 : 0} arms={i === 1 && t < 3 ? 0.6 : 0} /></group>;
      })}
      <Shards t={t} />
    </>
  );
};

// ---------- HUD ----------
const fmtClock = (m: number) => { const h = Math.floor(m / 60) % 24, mm = Math.floor(m % 60); return `${((h + 11) % 12) + 1}:${String(mm).padStart(2, '0')} PM`; };
const clockMin = (t: number) => interpolate(t, [0, SKY1_SEC], [1092, 1111], CL);
const stormKm = (t: number) => (t < 18.3 ? null : t < 26.8 ? '1.0 KM' : t < TREE_HIT ? '0.7 KM' : 'OVERHEAD');
const HUD: React.FC<{t: number}> = ({t}) => {
  if (t < 1.68 || t > END) return null;
  const k = ease(t, 1.68, 2.1, Easing.out(Easing.cubic));
  const lvl = t > RANKUP ? 2 : 1, bump = t > RANKUP && t < RANKUP + 0.8 ? 1 + 0.25 * (1 - (t - RANKUP) / 0.8) : 1;
  const st = stormKm(t);
  return (
    <div style={{position: 'absolute', left: 56, right: 56, top: 92, display: 'flex', justifyContent: 'space-between', opacity: k, transform: `translateY(${(1 - k) * -40}px)`, fontFamily: FONT}}>
      <div style={{color: 'white', textShadow: '0 3px 12px rgba(0,0,0,0.7)'}}>
        <div style={{fontWeight: 800, fontSize: 28, letterSpacing: '0.16em', color: ACC.red}}>● DAY 1 <span style={{color: 'white', opacity: 0.8}}>· THE SKY CRACKED</span></div>
        <div style={{fontWeight: 900, fontSize: 76, lineHeight: 1, marginTop: 6}}>{fmtClock(clockMin(t))}</div>
        <div style={{marginTop: 10, transform: `scale(${bump})`, transformOrigin: 'left center'}}><Pill color={ACC.lime} size={28}><span style={{color: ACC.lime}}>LVL {lvl}</span>RANGER</Pill></div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14}}>
        <Pill color={ACC.lime} size={30}><span style={{color: ACC.lime}}>7/7</span>SURVIVORS</Pill>
        <Pill color="#c873ff" size={30}><span style={{color: '#e0a8ff'}}>{t > OPEN ? 'OPENING' : 'GROWING'}</span>CRACK</Pill>
        {st && <div style={{transform: `scale(${pop(t, 18.3)})`, transformOrigin: 'right center'}}><Pill color={ACC.red} size={30}><span style={{color: t < 26.8 ? ACC.amber : ACC.red}}>{st}</span>STORM</Pill></div>}
      </div>
    </div>
  );
};

// ---------- beats ----------
const Big: React.FC<{t: number; at: number; text: string; color?: string; x?: number; y?: number; size?: number}> = ({t, at, text, color = 'white', x = 540, y = 760, size = 260}) => {
  const k = pop(t, at, 0.25);
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${mix(1.8, 1, Math.min(1, k))})`, opacity: Math.min(1, k * 2), fontFamily: FONT, fontWeight: 900, fontSize: size, color, WebkitTextStroke: '7px rgba(0,0,0,0.85)', paintOrder: 'stroke fill', textShadow: '0 10px 0 rgba(0,0,0,0.45)'}}>{text}</div>;
};
const MapCard: React.FC<{t: number}> = ({t}) => {
  if (t < MAP || t > END) return null;
  const k = ease(t, MAP, MAP + 0.4, Easing.out(Easing.cubic)), path = ease(t, MAP + 0.3, MAP + 2.2);
  const climb = t > 61.4;
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 300, height: 900, opacity: k, transform: `scale(${mix(0.92, 1, k)})`, borderRadius: 40, overflow: 'hidden', border: `3px solid ${ACC.amber}88`, background: 'rgba(10,14,18,0.86)', fontFamily: FONT}}>
      <svg width="100%" height="100%" viewBox="0 0 940 900">
        <defs><radialGradient id="fog"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.85" /></radialGradient></defs>
        {Array.from({length: 18}, (_, i) => <path key={i} d={`M${rnd(i) * 900},${80 + rnd(i + 5) * 760} l40,-70 l40,70 z`} fill="#2f3a46" opacity={0.8} />)}
        <path d="M60,640 C220,560 330,700 470,600 S700,420 900,470" stroke="#3a7ab0" strokeWidth={14} fill="none" opacity={0.7} />
        <path d="M250,690 C330,560 470,520 560,420 S700,250 720,210" stroke={ACC.amber} strokeWidth={10} strokeDasharray="22 18" fill="none" pathLength={1} strokeDashoffset={0} style={{clipPath: `inset(${(1 - path) * 100}% 0 0 0)`}} />
        <circle cx={250} cy={690} r={climb ? 26 + Math.sin(t * 8) * 4 : 20} fill={climb ? ACC.lime : '#19e0cf'} />
        <text x={250} y={760} textAnchor="middle" fill="white" fontSize={34} fontWeight={900}>RIDGE TOWER · YOU</text>
        {climb && <path d="M250,640 l0,-90 m-26,26 l26,-26 l26,26" stroke={ACC.lime} strokeWidth={10} fill="none" strokeLinecap="round" />}
        <g opacity={path}><rect x={680} y={170} width={80} height={60} rx={8} fill={ACC.amber} /><text x={720} y={140} textAnchor="middle" fill={ACC.amber} fontSize={40} fontWeight={900}>HOLLOW CREEK</text><text x={720} y={280} textAnchor="middle" fill="white" fontSize={36} fontWeight={800}>11 KM</text></g>
        <rect width={940} height={900} fill="url(#fog)" />
        <text x={470} y={70} textAnchor="middle" fill="white" fontSize={36} fontWeight={800} letterSpacing={6} opacity={0.85}>MAP · 1 ZONE UNLOCKED</text>
      </svg>
    </div>
  );
};
const Beats: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const {width: W, height: Hh} = useVideoConfig();
  const proj = projector(cam, W, Hh);
  const reyesHand = proj([4.66, 2.1, 4.9]);
  return (
    <>
      {/* hook title — on screen from frame 0 */}
      {t < 1.68 && <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 132, lineHeight: 0.92, color: 'white', WebkitTextStroke: '6px rgba(0,0,0,0.85)', paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(0,0,0,0.45)', transform: `scale(${mix(1.08, 1, ease(t, 0, 1.6))})`}}>THE SKY<br /><span style={{color: '#e0a8ff'}}>CRACKED</span></div>}
      {t > 3.95 && t < 5.1 && CAST.slice(1).map((c, i) => { const s = proj([c.p[0], 2.1, c.p[1]]); return <div key={i} style={{position: 'absolute', left: s.x, top: s.y, transform: `translate(-50%,-100%) scale(${pop(t, 4.0 + i * 0.1)})`, fontFamily: FONT, fontWeight: 900, fontSize: 44, color: ACC.lime, WebkitTextStroke: '3px #000', paintOrder: 'stroke fill'}}>{i + 1}</div>; })}
      {t > 5.2 && t < 6.7 && (() => { const s = proj([-3, 9.6, -3]); return <Tag x={s.x} y={s.y} text="ONE TOWER" k={pop(t, 5.3)} color={ACC.amber} />; })()}
      {t > 3.0 && t < 3.9 && (() => { const s = proj([0.5, 1.1, 4]); return <Tag x={s.x} y={s.y} text="YOU · RANGER" k={pop(t, 3.05)} color="#19e0cf" />; })()}
      {/* flash-to-bang count */}
      {t > 14.6 && t < 17.7 && [['1', 14.68], ['2', 15.34], ['3', 16.14]].map(([n, at], i) => t > (at as number) && <Big key={n as string} t={t} at={at as number} text={n as string} x={300 + i * 240} y={720} size={220} color={i === 2 ? ACC.amber : 'white'} />)}
      <Stamp t={t} at={17.06} out={17.7} text="BOOM" color={ACC.red} y={880} size={200} />
      <Card t={t} at={17.8} out={24.3} y={330} accent={ACC.amber}>
        <div style={{fontSize: 30, fontWeight: 800, letterSpacing: '0.16em', color: ACC.amber}}>FLASH → BOOM</div>
        <div style={{fontSize: 96, fontWeight: 900, lineHeight: 1.05, marginTop: 8}}>3 SEC <span style={{color: ACC.amber}}>≈ 1 KM</span></div>
        <div style={{marginTop: 26}}>
          <Bar label="LIGHT" value="instant" k={ease(t, 20.5, 20.8)} color={ACC.amber} />
          <Bar label="SOUND" value="343 m / sec" k={ease(t, 21.5, 24.0, Easing.linear)} color={ACC.blue} />
        </div>
      </Card>
      {t > 25.5 && t < 27.4 && [['1', 25.5], ['2', 26.14]].map(([n, at], i) => <Big key={n as string} t={t} at={at as number} text={n as string} x={420 + i * 240} y={720} size={220} color={i === 1 ? ACC.red : 'white'} />)}
      {t > 26.9 && t < 28.7 && <Big t={t} at={26.9} text="≈ 700 M" x={540} y={760} size={150} color={ACC.red} />}
      {/* tree vs truck */}
      {t > 31.4 && t < 33.3 && (() => { const s = proj([-7, 6, 6]); return <><Tag x={s.x} y={s.y - 80} text="LIGHTNING ROD" k={pop(t, 32.6)} color={ACC.red} />
        {t > 31.5 && <svg width={W} height={Hh} style={{position: 'absolute', inset: 0}}><g transform={`translate(${s.x},${s.y + 120}) scale(${pop(t, 31.5)})`}><path d="M-150,-150 L150,150 M150,-150 L-150,150" stroke={ACC.red} strokeWidth={34} strokeLinecap="round" /></g></svg>}</>; })()}
      {t > 33.5 && t < 34.7 && (() => { const s = proj([6, 2.4, 2]); return <Tag x={s.x} y={s.y} text="TRUCK" k={pop(t, 33.55)} color={ACC.lime} />; })()}
      {t > 34.8 && t < 38.6 && (() => { const s = proj([6, 2.5, 2]); return <Tag x={s.x} y={s.y} text="METAL SHELL" k={pop(t, 34.85)} color={ACC.lime} />; })()}
      <Card t={t} at={36.0} out={38.5} y={300} accent={ACC.lime}>
        <div style={{fontSize: 30, fontWeight: 800, letterSpacing: '0.16em', color: ACC.lime}}>WHY IT WORKS</div>
        <div style={{fontSize: 50, fontWeight: 900, marginTop: 8, lineHeight: 1.1}}>Current flows <span style={{color: ACC.lime}}>around</span> the metal,<br />not through you</div>
      </Card>
      <Stamp t={t} at={SLAM} out={41.6} text="SLAM." y={620} size={190} />
      <Stamp t={t} at={43.25} out={43.9} text="BOOM" color={ACC.amber} y={640} size={240} />
      {/* shards + power */}
      {t > 47.3 && t < 49.1 && <Stamp t={t} at={47.3} out={48.9} text="SKY SHARDS" color="#8ff0ff" y={1080} size={110} />}
      {t > CATCH && t < 53.1 && <Tag x={reyesHand.x} y={reyesHand.y - 30} text={t < IGNITE ? 'REYES CATCHES ONE' : 'POWER?'} k={pop(t, t < IGNITE ? CATCH + 0.05 : IGNITE)} color={t < IGNITE ? ACC.amber : '#8ff0ff'} />}
      <Stamp t={t} at={53.1} out={OPEN - 0.1} text="RANK UP" sub="RANGER · LVL 2" color={ACC.lime} y={560} size={170} />
      {/* found you */}
      {t > FOUND && t < MAP && <div style={{position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 170, color: ACC.red, WebkitTextStroke: '7px #000', paintOrder: 'stroke fill', transform: `scale(${mix(1.6, 1, Math.min(1, pop(t, FOUND, 0.2)))})`}}>FOUND YOU.</div>}
      <MapCard t={t} />
      {/* end card */}
      {t > END && <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: FONT}}>
        <div style={{opacity: pop(t, END + 0.05), transform: `scale(${mix(1.4, 1, Math.min(1, pop(t, END + 0.05)))})`, fontWeight: 900, fontSize: 150, lineHeight: 0.95, color: 'white', WebkitTextStroke: '6px rgba(0,0,0,0.85)', paintOrder: 'stroke fill'}}>
          <div>RUN</div><div style={{color: ACC.amber, fontSize: 80, margin: '14px 0'}}>OR</div><div style={{color: ACC.lime}}>CLIMB?</div>
        </div>
        <div style={{marginTop: 50, display: 'flex', justifyContent: 'center', gap: 24, opacity: ease(t, END + 0.9, END + 1.3)}}>
          <Pill color={ACC.amber} size={38}><span style={{color: ACC.amber}}>A</span>HOLLOW CREEK</Pill>
          <Pill color={ACC.lime} size={38}><span style={{color: ACC.lime}}>B</span>THE TOWER</Pill>
        </div>
        <div style={{marginTop: 40, fontWeight: 800, fontSize: 36, letterSpacing: '0.2em', color: ACC.amber, opacity: ease(t, END + 2.6, END + 3.0)}}>DAY 2 → FOLLOW</div>
      </div>}
      {/* lightning flash wash */}
      <AbsoluteFill style={{background: '#eef3ff', opacity: Math.min(0.55, strikeK(t) * 0.45), pointerEvents: 'none'}} />
      {t > FOUND && t < FOUND + 0.5 && <AbsoluteFill style={{background: '#ff1a1a', opacity: 0.35 * (1 - (t - FOUND) / 0.5)}} />}
    </>
  );
};

// ---------- captions: narrator keywords; dialogue in the speaker's colour with a name tag ----------
const KEYS: Record<string, string> = {
  sky: ACC.red, split: ACC.red, open: ACC.red, ranger: ACC.amber, seven: ACC.lime, hikers: ACC.lime, tower: ACC.amber, nobody: ACC.red,
  lightning: ACC.amber, flashes: ACC.amber, count: ACC.lime, boom: ACC.red, seconds: ACC.lime, kilometer: ACC.lime, light: ACC.amber, instant: ACC.amber,
  sound: ACC.blue, walks: ACC.blue, '340': ACC.blue, meters: ACC.blue, flash: ACC.amber, toward: ACC.red, tree: ACC.red, rod: ACC.red, truck: ACC.lime,
  metal: ACC.lime, shell: ACC.lime, current: ACC.blue, around: ACC.lime, outside: ACC.lime, now: ACC.red, slam: ACC.amber, explodes: ACC.red,
  crack: '#e0a8ff', raining: ACC.blue, shards: ACC.blue, glowing: ACC.blue, blue: ACC.blue, reyes: ACC.amber, ignites: ACC.blue, rank: ACC.lime, up: ACC.lime, level: ACC.lime,
  wider: ACC.red, speaks: ACC.red, '11': ACC.amber, kilometers: ACC.amber, hollow: ACC.amber, creek: ACC.amber, climb: ACC.lime, signal: ACC.lime, run: ACC.amber, comments: ACC.lime, follows: ACC.lime,
};
const LINES: {from: number; to: number; who: string; color: string}[] = [
  {from: 1.6, to: 2.85, who: 'DANA', color: '#FF7AC8'}, {from: 7.95, to: 9.78, who: 'REYES', color: '#FFD166'}, {from: 28.6, to: 31.2, who: 'ELI', color: '#FF9F45'},
  {from: 43.85, to: 45.24, who: 'DANA', color: '#FF7AC8'}, {from: 58.0, to: 58.88, who: '???', color: ACC.red},
];
const lineOf = (s: number) => LINES.find((l) => s >= l.from && s < l.to);
const NARR = WORDS.filter((w) => !lineOf(w[1]));
const all = (c: string) => new Proxy({}, {get: () => c}) as Record<string, string>;
const SpeakerCaptions: React.FC<{t: number}> = ({t}) => {
  const l = LINES.find((x) => t >= x.from - 0.05 && t < x.to + 0.4);
  if (l && l.who === '???') return null; // "FOUND YOU." is its own big beat
  if (!l) return <Captions words={NARR} t={t} keys={KEYS} y={1330} hide={(x) => x > END - 0.05 || (x > MAP && x < END)} />;
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
  return s ? <AbsoluteFill style={{background: 'white', opacity: 0.22 * (1 - (t - s.from) / 0.12)}} /> : null;
};

export const SFX: Sfx[] = [
  [0.0, 'boom', 0.75], [0.0, 'glitch', 0.5], [0.05, 'impact', 0.6], [0.4, 'growl', 0.5], [1.68, 'scream', 0.35], [1.68, 'whoosh', 0.3],
  [3.95, 'pop', 0.25], [5.1, 'whoosh_long', 0.25], [7.98, 'whoosh', 0.3], [9.8, 'riser', 0.25],
  [12.8, 'glitch', 0.35], [14.68, 'click', 0.45], [15.34, 'click', 0.45], [16.14, 'click', 0.5], [17.06, 'boom', 0.75],
  [17.8, 'whoosh', 0.25], [20.5, 'ding', 0.25], [24.44, 'glitch', 0.4], [25.5, 'click', 0.45], [26.14, 'click', 0.5], [26.8, 'boom', 0.85], [26.9, 'heartbeat', 0.45],
  [28.7, 'whoosh', 0.3], [31.5, 'impact', 0.45], [33.5, 'pop', 0.3], [35.3, 'boom', 0.6], [35.35, 'rattle', 0.35], [36.0, 'whoosh', 0.2],
  [38.6, 'whoosh_long', 0.3], [SLAM, 'clunk', 0.85], [41.0, 'heartbeat', 0.5], [42.0, 'heartbeat', 0.55], [TREE_HIT, 'boom', 0.95], [TREE_HIT + 0.02, 'impact', 0.7],
  [45.26, 'riser', 0.3], [46.4, 'swell_hit', 0.3], [47.3, 'ding', 0.25], [CATCH, 'pop', 0.4], [IGNITE, 'swell_hit', 0.45], [53.1, 'ding', 0.45], [RANKUP, 'riser', 0.25],
  [OPEN, 'growl', 0.45], [56.5, 'heartbeat', 0.5], [57.4, 'heartbeat', 0.55], [FOUND, 'impact', 0.8], [FOUND, 'growl', 0.6], [MAP, 'whoosh', 0.3], [61.4, 'pop', 0.3],
  [END, 'boom', 0.55], [END + 1.0, 'heartbeat', 0.45],
];

export const SkyCrackedDay1: React.FC = () => {
  const {width: W, height: Hh} = useVideoConfig();
  const t = useT();
  const cam = camAt(t);
  const dim = t > MAP && t < END ? 0.45 * ease(t, MAP, MAP + 0.3) : 0;
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
      <AbsoluteFill style={{background: 'black', opacity: ease(t, SKY1_SEC - 0.5, SKY1_SEC)}} />
      <DayAudio job={JOB} sec={SKY1_SEC} sfx={SFX} musicVol={0.12} />
    </AbsoluteFill>
  );
};

// ---------- thumbnail ----------
export const SkyCrackedDay1Thumb: React.FC = () => {
  const {width: W, height: Hh} = useVideoConfig();
  const t = 1.2;
  const cam: Cam = {pos: [3.5, 0.9, 14], look: [9, 50, -150], fov: 56};
  return (
    <AbsoluteFill style={{background: '#05070c', fontFamily: FONT}}>
      <ThreeCanvas width={W} height={Hh} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
        <CameraRig cam={cam} />
        <World t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.75) 100%)'}} />
      <div style={{position: 'absolute', top: 130, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: ACC.red, color: 'white', fontWeight: 900, fontSize: 52, letterSpacing: '0.14em', padding: '12px 34px', borderRadius: 999}}>THE SKY CRACKED</div>
        <div style={{fontWeight: 900, fontSize: 300, lineHeight: 0.9, color: 'white', marginTop: 30, WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', textShadow: '0 12px 0 rgba(0,0,0,0.5)'}}>DAY 1</div>
      </div>
      <div style={{position: 'absolute', bottom: 260, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontWeight: 900, fontSize: 100, lineHeight: 1, color: 'white', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>SOMETHING IS</div>
        <div style={{fontWeight: 900, fontSize: 100, lineHeight: 1, color: ACC.lime, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>COMING THROUGH</div>
      </div>
    </AbsoluteFill>
  );
};
