// "How to build a well" — pilot for the 3D "How to build a ___" shorts (inspo: How-a-Cave / How-a-Hole).
// 9:16, fast voice-over, one persistent cutaway diorama that grows with every "So you…" fix. Keyed to buildWellWords.ts.
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Cam, CameraRig, ease, FONT, mix, mix3, pop, rnd, useT, V3} from '../day/dayKit';
import {WORDS} from './buildWellWords';

export const WELL_SEC = 64.5;
const JOB = 'jobs/build-well';
const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const HALF = [Math.PI / 2, Math.PI] as const; // back half of a cylinder (z < 0): the cut face is z = 0
const R = 0.7; // shaft radius

// ---------- state, as pure functions of t ----------
const shaftBottom = (t: number) => mix(-0.05, -3.6, ease(t, 0.2, 2.0, Easing.out(Easing.cubic))) + (-6.2 + 3.6) * ease(t, 33.4, 36.6);
const waterTop = (t: number) => {
  const b = shaftBottom(t);
  if (t < 1.6) return b;
  if (t < 30.9) return mix(b, -2.9, ease(t, 1.6, 2.4));
  if (t < 34.5) return mix(-2.9, -3.45, ease(t, 31.6, 32.4));
  return mix(-6.2, -4.4, ease(t, 35.6, 37.4));
};
const waterCol = (t: number): string => {
  if (t > 5.5 && t < 9.2) return '#6b4a2a'; // mud
  if (t > 13.9 && t < 18.6) return '#5f7d3a'; // sick
  if (t > 39.7 && t < 43.4) return '#b39a62'; // sandy
  if (t > 50.9 && t < 53.9) return '#3f8f3a'; // algae
  return '#3d8fd6';
};
const ropeEnd = (t: number) => {
  if (t < 28.6) return 1.6;
  return mix(1.0, -3.15, ease(t, 28.9, 30.4)) + (-4.25 - -3.15) * ease(t, 36.6, 37.6);
};

// ---------- primitives ----------
const M: React.FC<{c: string; e?: number; o?: number; r?: number; m?: number}> = ({c, e = 0, o = 1, r = 0.85, m = 0}) =>
  <meshStandardMaterial color={c} emissive={c} emissiveIntensity={e} roughness={r} metalness={m} transparent={o < 1} opacity={o} />;
const Box: React.FC<{p: V3; s: V3; c: string; e?: number; r?: V3}> = ({p, s, c, e, r}) => <mesh position={p} rotation={r}><boxGeometry args={s} /><M c={c} e={e} /></mesh>;
const Arrow: React.FC<{p: V3; r: V3; k: number; s?: number}> = ({p, r, k, s = 1}) => k <= 0 ? null : (
  <group position={p} rotation={r} scale={s * k}>
    <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.06, 0.06, 0.5, 8]} /><M c="#ffffff" e={0.5} /></mesh>
    <mesh position={[0, 0.6, 0]}><coneGeometry args={[0.15, 0.25, 12]} /><M c="#ffffff" e={0.5} /></mesh>
  </group>
);

// soil layer with the shaft column carved out above the shaft bottom
const LAYERS: [number, number, string][] = [[0, -1.2, '#7b4a2b'], [-1.2, -3.0, '#a5643a'], [-3.0, -4.6, '#8c5a38'], [-4.6, -6.6, '#4b6f96'], [-6.6, -8.5, '#6e6e74']];
const Layer: React.FC<{y0: number; y1: number; c: string; bottom: number}> = ({y0, y1, c, bottom}) => {
  const h = y0 - y1, cy = (y0 + y1) / 2;
  const fillTop = Math.min(y0, bottom);
  return (
    <group>
      <Box p={[-3.35, cy, -2.5]} s={[5.3, h, 5]} c={c} />
      <Box p={[3.35, cy, -2.5]} s={[5.3, h, 5]} c={c} />
      <Box p={[0, cy, -2.85]} s={[1.4, h, 4.3]} c={c} />
      {fillTop > y1 && <Box p={[0, (fillTop + y1) / 2, -0.35]} s={[1.4, fillTop - y1, 0.7]} c={c} />}
      {/* pebbles on the cut face for texture */}
      {Array.from({length: 26}, (_, i) => {
        const x = (rnd(i + y0 * 13) - 0.5) * 11, y = y1 + rnd(i * 3 + y0) * h;
        if (Math.abs(x) < 0.85 && y > bottom) return null;
        return <mesh key={i} position={[x, y, 0.01]} rotation={[0, 0, rnd(i) * 3]}><circleGeometry args={[0.05 + rnd(i * 7) * 0.08, 6]} /><meshStandardMaterial color="#000" transparent opacity={0.18} /></mesh>;
      })}
    </group>
  );
};

const Stone: React.FC<{p: V3; s?: number; c?: string}> = ({p, s = 1, c = '#9a948a'}) =>
  <mesh position={p} scale={[s * 1.25, s * 0.8, s]} rotation={[rnd(p[0] * 9) * 2, rnd(p[1] * 7) * 3, 0]}><dodecahedronGeometry args={[0.12, 0]} /><M c={c} r={0.95} /></mesh>;
const ringStones = (r: number, y: number, n: number, seed: number) =>
  Array.from({length: n}, (_, i) => { const th = Math.PI / 2 + (i + (seed % 2) * 0.5) / (n - 1) * Math.PI; return [r * Math.sin(th), y, r * Math.cos(th)] as V3; }).filter((p) => p[2] < 0.06);

const Tree: React.FC<{p: V3; s?: number}> = ({p, s = 1}) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.08, 0.12, 1, 6]} /><M c="#5a3a22" /></mesh>
    {[[0, 1.3, 0, 0.6], [0.3, 1.1, 0.1, 0.42], [-0.3, 1.15, -0.1, 0.45], [0, 1.7, 0, 0.42]].map(([x, y, z, r], i) => <mesh key={i} position={[x, y, z]}><icosahedronGeometry args={[r, 1]} /><M c="#4f9a3a" /></mesh>)}
  </group>
);
const Cloud: React.FC<{p: V3; s?: number; grey?: number}> = ({p, s = 1, grey = 0}) => (
  <group position={p} scale={s}>{[[0, 0, 0, 1], [0.9, -0.1, 0, 0.75], [-0.9, -0.15, 0, 0.7], [0.4, 0.4, 0, 0.7]].map(([x, y, z, r], i) =>
    <mesh key={i} position={[x, y, z]}><sphereGeometry args={[r, 12, 10]} /><M c={grey > 0.5 ? '#9aa0a8' : '#ffffff'} e={0.25} /></mesh>)}</group>
);
const Bucket: React.FC<{p: V3; tilt?: number}> = ({p, tilt = 0}) => (
  <group position={p} rotation={[0, 0, tilt]}>
    <mesh><cylinderGeometry args={[0.2, 0.16, 0.3, 12, 1, true]} /><meshStandardMaterial color="#7a5232" side={2} /></mesh>
    <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.16, 12]} /><M c="#5a3a22" /></mesh>
    {[0.09, -0.09].map((y) => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[y > 0 ? 0.195 : 0.175, 0.012, 6, 16]} /><M c="#444" m={0.6} /></mesh>)}
    <mesh position={[0, 0.2, 0]}><torusGeometry args={[0.18, 0.012, 6, 16, Math.PI]} /><M c="#444" /></mesh>
  </group>
);
const Rope: React.FC<{a: V3; b: V3}> = ({a, b}) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  return <mesh position={mix3(a, b, 0.5)} rotation={[0, 0, Math.atan2(b[0] - a[0], a[1] - b[1])]}><cylinderGeometry args={[0.018, 0.018, len, 5]} /><M c="#c9b07a" /></mesh>;
};
const Frog: React.FC<{p: V3; k: number}> = ({p, k}) => k <= 0 ? null : (
  <group position={p} scale={k * 0.9}>
    <mesh scale={[1.2, 0.8, 1]}><sphereGeometry args={[0.13, 12, 10]} /><M c="#5fb043" /></mesh>
    {[-0.06, 0.06].map((x) => <group key={x} position={[x, 0.1, 0.06]}><mesh><sphereGeometry args={[0.045, 10, 8]} /><M c="#5fb043" /></mesh><mesh position={[0, 0.01, 0.035]}><sphereGeometry args={[0.022, 8, 6]} /><M c="#111" /></mesh></group>)}
  </group>
);
const Coin: React.FC<{p: V3; r: number}> = ({p, r}) => <mesh position={p} rotation={[r, r * 0.6, 0]}><cylinderGeometry args={[0.07, 0.07, 0.015, 14]} /><M c="#f2c14e" e={0.4} m={0.8} r={0.3} /></mesh>;

// ---------- world ----------
const World: React.FC<{t: number}> = ({t}) => {
  const bottom = shaftBottom(t);
  const wt = waterTop(t);
  const rain = t > 11.3 && t < 20.6 ? ease(t, 11.3, 11.9) * (1 - ease(t, 20, 20.6)) : 0;
  const summer = ease(t, 30.8, 31.4) * (1 - ease(t, 33.2, 34));
  const casingTop = t < 8.4 ? -99 : mix(bottom, 0, ease(t, 8.5, 10.2, Easing.linear));
  const casingBottom = bottom;
  const wellhead = ease(t, 16.9, 18.9, Easing.linear);
  const wind = t > 25.6;
  const roofK = pop(t, 48.2, 0.6);
  const roofLift = ease(t, 50.3, 50.9) * (1 - ease(t, 52.5, 53.1));
  const ry = ropeEnd(t);
  // bucket before the windlass: hangs over the rim, falls at 21.8, rope snaps 23.3
  const fall = ease(t, 21.7, 22.4, Easing.in(Easing.quad));
  const preBucket: V3 = [mix(0.05, 0.05, fall), mix(0.6, -2.75, fall), -0.3];
  const rows = Math.ceil((0 - casingBottom) / 0.22);
  return (
    <>
      <color attach="background" args={[rain > 0.5 ? '#8d97a3' : '#9fd3f5']} />
      <hemisphereLight args={['#ffffff', '#6a5040', 1.1]} />
      <directionalLight position={[4, 8, 6]} intensity={1.5 + summer * 0.8} color={summer > 0.3 ? '#fff0c0' : '#fffaf0'} />
      <ambientLight intensity={0.25} />
      {/* ground layers */}
      {LAYERS.map(([y0, y1, c]) => <Layer key={y0} y0={y0} y1={y1} c={c} bottom={bottom} />)}
      {/* aquifer glow when we reach it */}
      {t > 35.6 && <mesh position={[0, -5.6, 0.02]}><planeGeometry args={[12, 2]} /><meshBasicMaterial color="#6fc3ff" transparent opacity={0.12 * Math.min(1, ease(t, 35.6, 36.4)) * (0.7 + 0.3 * Math.sin(t * 3))} /></mesh>}
      {/* grass + world behind */}
      <Box p={[-3.35, 0.05, -2.5]} s={[5.3, 0.1, 5]} c="#6cbf4a" />
      <Box p={[3.35, 0.05, -2.5]} s={[5.3, 0.1, 5]} c="#6cbf4a" />
      <Box p={[0, 0.05, -2.85]} s={[1.4, 0.1, 4.3]} c="#6cbf4a" />
      <Box p={[0, 0, -14]} s={[40, 0.1, 18]} c="#79c552" />
      {[[-3.5, 0, -3], [4, 0, -4], [-5.5, 0, -7], [2, 0, -8], [6, 0, -9]].map((p, i) => <Tree key={i} p={p as V3} s={1 + (i % 2) * 0.3} />)}
      {[[-4, 6, -14], [5, 7, -16], [0, 8.5, -20]].map((p, i) => <Cloud key={i} p={[p[0] + Math.sin(t * 0.1 + i) * 0.6, p[1], p[2]]} s={1.6} grey={rain} />)}
      {/* shaft wall */}
      {bottom < -0.1 && <mesh position={[0, bottom / 2, 0]}><cylinderGeometry args={[R, R, -bottom, 24, 1, true, ...HALF]} /><meshStandardMaterial color="#4a2e1c" side={1} roughness={1} /></mesh>}
      {bottom < -0.1 && <mesh position={[0, bottom + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[R, 24, Math.PI, Math.PI]} /><M c="#3a2416" /></mesh>}
      {/* casing stones */}
      {Array.from({length: rows}, (_, i) => {
        const y = casingBottom + 0.11 + i * 0.22;
        if (y > casingTop) return null;
        return ringStones(0.64, y, 9, i).map((p, j) => <Stone key={`${i}-${j}`} p={p} s={1} />);
      })}
      {/* gravel pack */}
      {t > 41.4 && Array.from({length: 46}, (_, i) => {
        const at = 41.5 + rnd(i) * 1.6, x = (rnd(i * 3) - 0.5) * 1.1, z = -rnd(i * 5) * 0.55;
        const land = -6.12 + rnd(i * 11) * 0.28;
        const y = mix(-1.5, land, ease(t, at, at + 0.5, Easing.in(Easing.quad)));
        return t > at ? <mesh key={i} position={[x, y, z]}><icosahedronGeometry args={[0.06, 0]} /><M c={['#bdb6a8', '#8f887c', '#d8d0c0'][i % 3]} /></mesh> : null;
      })}
      {/* water */}
      {wt > bottom + 0.02 && <>
        <mesh position={[0, (wt + bottom) / 2, 0]}><cylinderGeometry args={[R - 0.02, R - 0.02, wt - bottom, 24, 1, false, ...HALF]} /><M c={waterCol(t)} o={0.85} r={0.2} e={0.15} /></mesh>
        <mesh position={[0, (wt + bottom) / 2, 0.005]}><planeGeometry args={[2 * R - 0.04, wt - bottom]} /><M c={waterCol(t)} o={0.75} r={0.2} e={0.2} /></mesh>
      </>}
      {/* mud chunks falling in (collapse) */}
      {t > 4.2 && t < 7.4 && Array.from({length: 18}, (_, i) => {
        const at = 4.3 + rnd(i) * 1.9; const k = ease(t, at, at + 0.6, Easing.in(Easing.quad));
        return t > at ? <mesh key={i} position={[(rnd(i * 2) - 0.5) * 1.2, mix(-0.3 - rnd(i * 4) * 2.2, -3.3, k), -rnd(i * 6) * 0.5]}><dodecahedronGeometry args={[0.08 + rnd(i) * 0.08, 0]} /><M c="#6b4426" /></mesh> : null;
      })}
      {/* sand swirl */}
      {t > 39.7 && t < 43.4 && Array.from({length: 30}, (_, i) => <mesh key={i} position={[Math.sin(t * 1.5 + i) * 0.5 * rnd(i), mix(-6.1, -4.5, rnd(i * 3)) + Math.sin(t * 2 + i) * 0.1, -rnd(i * 7) * 0.5]}><sphereGeometry args={[0.025, 5, 4]} /><M c="#e0c88a" /></mesh>)}
      {/* wellhead wall */}
      {Array.from({length: 4}, (_, i) => {
        const y = 0.12 + i * 0.22; if ((i + 1) / 4 > wellhead + 0.01) return null;
        return ringStones(0.82, y, 10, i).map((p, j) => <Stone key={`w${i}-${j}`} p={p} s={1.25} c="#a9a397" />);
      })}
      {/* windlass */}
      {wind && <group>
        {[-1.0, 1.0].map((x) => <mesh key={x} position={[x, mix(-0.6, 1.1, pop(t, 25.8, 0.5)), -0.3]}><boxGeometry args={[0.14, 2.2, 0.14]} /><M c="#6b4528" /></mesh>)}
        {t > 27.4 && <mesh position={[0, 2.05, -0.3]} rotation={[0, 0, Math.PI / 2]} scale={pop(t, 27.5, 0.4)}><cylinderGeometry args={[0.1, 0.1, 2.3, 10]} /><M c="#8a5a34" /></mesh>}
        {t > 28.6 && <group position={[1.2, 2.05, -0.3]} rotation={[t > 28.9 && t < 30.4 ? t * 6 : 0, 0, 0]} scale={pop(t, 28.7, 0.35)}>
          <Box p={[0.06, 0.15, 0]} s={[0.06, 0.32, 0.06]} c="#555" /><Box p={[0.16, 0.3, 0]} s={[0.22, 0.05, 0.05]} c="#555" />
        </group>}
        {t > 28.6 && <><Rope a={[0, 2.0, -0.3]} b={[0, ry + 0.2, -0.3]} /><Bucket p={[0, ry, -0.3]} /></>}
      </group>}
      {/* first bucket, then the snap */}
      {t > 20.6 && t < 25.2 && <>
        <Bucket p={preBucket} tilt={fall * 0.6} />
        {t < 23.3 ? <Rope a={[0.05, 0.85, -0.6]} b={[preBucket[0], preBucket[1] + 0.2, -0.3]} /> : <Rope a={[0.05, mix(-1.0, -2.5, ease(t, 23.3, 23.9)), -0.3]} b={[0.05, mix(-1.6, -2.7, ease(t, 23.3, 23.9)), -0.3]} />}
      </>}
      {/* roof */}
      {roofK > 0 && <group position={[0, 2.35 + roofLift * 1.6, -0.3]} scale={roofK}>
        {[-1, 1].map((s) => <Box key={s} p={[s * 0.62, 0.32, 0]} s={[1.45, 0.08, 1.3]} r={[0, 0, -s * 0.5]} c="#b5532f" />)}
      </group>}
      {/* sun beams when the roof is off */}
      {roofLift > 0.2 && [[-0.3, 0.1], [0.2, -0.3], [0.05, -0.1]].map(([x, z], i) => <mesh key={i} position={[x, -0.9, z]} rotation={[0, 0, 0.12]}><cylinderGeometry args={[0.08, 0.16, 6, 8, 1, true]} /><meshBasicMaterial color="#fff3b0" transparent opacity={0.28 * roofLift} /></mesh>)}
      {t > 50.9 && t < 53.9 && Array.from({length: 14}, (_, i) => <mesh key={i} position={[(rnd(i) - 0.5) * 1.1, wt + 0.01, -rnd(i * 3) * 0.6]} rotation={[-Math.PI / 2, 0, 0]} scale={pop(t, 51 + rnd(i) * 0.8) * (1 - ease(t, 53.3, 53.9))}><circleGeometry args={[0.08 + rnd(i * 5) * 0.06, 7]} /><M c="#2f7a22" /></mesh>)}
      {/* leaves + bird */}
      {t > 45.4 && t < 47.6 && Array.from({length: 14}, (_, i) => {
        const at = 45.5 + rnd(i) * 1.2; const k = ease(t, at, at + 1.0, Easing.linear);
        return t > at ? <mesh key={i} position={[(rnd(i * 2) - 0.5) * 1.0 + Math.sin(t * 4 + i) * 0.15, mix(2.2, -1.5, k), -0.2 - rnd(i * 3) * 0.4]} rotation={[t * 3 + i, t * 2, 0]}><planeGeometry args={[0.14, 0.09]} /><meshStandardMaterial color={i % 2 ? '#d98a2b' : '#7bb33a'} side={2} /></mesh> : null;
      })}
      {t > 46.0 && t < 47.6 && <group position={[0.1, mix(2.0, -1.6, ease(t, 46.1, 47.3, Easing.in(Easing.quad))), -0.3]} rotation={[0, 0, t * 5]}>
        <mesh><sphereGeometry args={[0.12, 10, 8]} /><M c="#4a6fa5" /></mesh>
        {[-1, 1].map((s) => <mesh key={s} position={[s * 0.16, 0.02, 0]} rotation={[0, 0, s * Math.sin(t * 30) * 0.6]}><boxGeometry args={[0.2, 0.03, 0.1]} /><M c="#3a5a8a" /></mesh>)}
      </group>}
      {/* extras */}
      {t > 55.2 && <group scale={pop(t, 55.3, 0.4)}><Bucket p={[-0.95, 1.05, -0.5]} /></group>}
      <Frog p={[0.55, 0.98, -0.55]} k={pop(t, 56.05, 0.4)} />
      {t > 58.5 && Array.from({length: 4}, (_, i) => {
        const at = 58.6 + i * 0.3; const k = ease(t, at, at + 0.9, Easing.in(Easing.quad));
        return t > at && k < 1 ? <Coin key={i} p={[-0.2 + i * 0.12, mix(1.6, wt, k), -0.3]} r={t * 8 + i} /> : null;
      })}
      {/* rain + force arrows */}
      {rain > 0 && Array.from({length: 140}, (_, i) => {
        const y = 6 - (((t * 9 + rnd(i) * 9) % 9));
        return <mesh key={i} position={[(rnd(i * 3) - 0.5) * 9, y, -rnd(i * 5) * 6 + 0.5]}><boxGeometry args={[0.012, 0.28, 0.012]} /><meshBasicMaterial color="#dfe8f2" transparent opacity={0.6 * rain} /></mesh>;
      })}
      {t > 12.2 && t < 16.3 && [-1.8, -1.2, 1.2, 1.8].map((x, i) => <Arrow key={i} p={[x, 0.25, -0.4]} r={[0, 0, x < 0 ? -Math.PI / 2 : Math.PI / 2]} k={pop(t, 12.3 + i * 0.12) * (1 - ease(t, 15.8, 16.3))} s={0.8} />)}
      {t > 13.4 && t < 16.3 && <Arrow p={[0, -0.3, -0.3]} r={[0, 0, Math.PI]} k={pop(t, 13.5) * (1 - ease(t, 15.8, 16.3))} s={1.2} />}
      {t > 18.8 && t < 20.8 && [-1.6, 1.6].map((x, i) => <Arrow key={i} p={[x * 0.72, 0.35, -0.4]} r={[0, 0, x < 0 ? Math.PI * 0.75 : -Math.PI * 0.75]} k={pop(t, 18.9 + i * 0.1) * (1 - ease(t, 20.3, 20.8))} s={0.8} />)}
    </>
  );
};

// ---------- camera ----------
type Shot = {from: number; to: number; a: Cam; b: Cam};
const C = (pos: V3, look: V3, fov = 50): Cam => ({pos, look, fov});
const SHOTS: Shot[] = [
  {from: 0, to: 3.4, a: C([2.6, 4.2, 6.0], [0, -0.6, -0.5]), b: C([1.2, 1.4, 5.2], [0, -1.6, 0])},
  {from: 3.4, to: 7.44, a: C([0.3, -1.4, 4.4], [0, -2.3, 0]), b: C([0, -1.8, 3.7], [0, -2.6, 0])},
  {from: 7.44, to: 11.3, a: C([1.2, -1.0, 5.0], [0, -1.8, 0]), b: C([0.4, -1.4, 4.3], [0, -1.9, 0])},
  {from: 11.3, to: 16.42, a: C([2.2, 1.8, 6.8], [0, -0.8, 0]), b: C([1.0, 0.4, 5.6], [0, -1.6, 0])},
  {from: 16.42, to: 20.78, a: C([-1.6, 1.8, 4.6], [0, 0.1, 0]), b: C([-0.8, 1.3, 4.0], [0, 0.0, 0])},
  {from: 20.78, to: 25.22, a: C([0.9, 0.6, 4.2], [0, -1.1, 0]), b: C([0.4, 0.0, 4.0], [0, -1.8, 0])},
  {from: 25.22, to: 30.76, a: C([2.6, 2.4, 5.8], [0, 0.8, 0]), b: C([1.3, 1.4, 5.6], [0, 0.0, 0])},
  {from: 30.76, to: 33.14, a: C([0.2, -1.2, 4.8], [0, -2.7, 0]), b: C([0, -1.6, 4.3], [0, -2.9, 0])},
  {from: 33.14, to: 38.7, a: C([0.9, -2.0, 6.2], [0, -3.0, 0]), b: C([0.3, -4.0, 5.4], [0, -5.0, 0])},
  {from: 38.7, to: 45.44, a: C([0.1, -4.3, 3.9], [0, -5.3, 0]), b: C([0.6, -4.5, 4.3], [0, -5.4, 0])},
  {from: 45.44, to: 47.54, a: C([1.4, 2.6, 4.6], [0, 0.0, 0]), b: C([0.8, 1.6, 4.2], [0, -0.6, 0])},
  {from: 47.54, to: 49.56, a: C([2.4, 2.8, 5.4], [0, 1.4, 0]), b: C([1.6, 2.4, 5.0], [0, 1.6, 0])},
  {from: 49.56, to: 54.6, a: C([1.0, 0.6, 8.6], [0, -0.9, 0]), b: C([0.6, 0.2, 8.0], [0, -1.2, 0])},
  {from: 54.6, to: 60.08, a: C([1.7, 1.6, 3.9], [0, 0.7, -0.3]), b: C([-0.6, 1.4, 3.6], [0, 0.6, -0.3])},
  {from: 60.08, to: WELL_SEC + 1, a: C([0.4, 1.2, 4.6], [0, 0.4, 0]), b: C([5.2, 4.6, 10.5], [0, -1.0, 0], 46)},
];
const camAt = (t: number): Cam => {
  const s = SHOTS.find((x) => t >= x.from && t < x.to) ?? SHOTS[SHOTS.length - 1];
  const k = ease(t, s.from, s.to, Easing.inOut(Easing.sin));
  const c: Cam = {pos: mix3(s.a.pos, s.b.pos, k), look: mix3(s.a.look, s.b.look, k), fov: mix(s.a.fov, s.b.fov, k)};
  const snap = t > 23.3 && t < 23.7 ? 0.04 : 0;
  return {...c, pos: [c.pos[0] + Math.sin(t * 0.8) * 0.04 + Math.sin(t * 47) * snap, c.pos[1] + Math.sin(t * 1.1) * 0.03 + Math.sin(t * 53) * snap, c.pos[2]]};
};

// ---------- captions: one word at a time, centred ----------
const TERMS = new Set(['casing', 'wellhead', 'windlass', 'aquifer', 'gravel', 'pack', 'decoration', 'congratulations', 'well']);
const Word: React.FC<{t: number}> = ({t}) => {
  const w = WORDS.find(([, s], i) => t >= s - 0.03 && (i === WORDS.length - 1 || t < WORDS[i + 1][1] - 0.03));
  if (!w || t > w[2] + 0.5) return null;
  const clean = w[0].replace(/[.,?!]/g, '');
  const term = TERMS.has(clean.toLowerCase()) && (WORDS.indexOf(w) > 10);
  const k = pop(t, w[1] - 0.03, 0.14);
  return <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center'}}>
    <span style={{fontFamily: FONT, fontWeight: 800, fontSize: term ? 92 : 68, color: term ? '#FFE15A' : 'white', textShadow: '0 4px 14px rgba(0,0,0,0.65), 0 0 2px rgba(0,0,0,0.9)', display: 'inline-block', transform: `scale(${0.85 + 0.15 * k})`}}>
      {clean.charAt(0).toUpperCase() + clean.slice(1)}
    </span>
  </div>;
};

export const SFX: [number, string, number][] = [
  [0.2, 'clunk', 0.35], [0.9, 'clunk', 0.3], [1.6, 'clunk', 0.3], [2.0, 'pop', 0.3], [4.4, 'rattle', 0.4], [6.3, 'impact', 0.3],
  [8.6, 'click', 0.3], [9.0, 'click', 0.3], [9.4, 'click', 0.3], [9.8, 'click', 0.3], [10.4, 'ding', 0.3], [11.3, 'whoosh', 0.3], [15.4, 'growl', 0.15],
  [17.0, 'clunk', 0.3], [17.6, 'clunk', 0.3], [18.2, 'clunk', 0.3], [20.0, 'ding', 0.3], [22.2, 'pop', 0.45], [23.3, 'impact', 0.5],
  [25.8, 'clunk', 0.4], [27.5, 'clunk', 0.4], [28.7, 'click', 0.4], [29.8, 'ding', 0.3], [31.6, 'whoosh', 0.2], [33.4, 'rattle', 0.35], [35.6, 'swell_hit', 0.3], [37.8, 'ding', 0.3],
  [41.5, 'rattle', 0.4], [44.5, 'ding', 0.3], [46.2, 'pop', 0.35], [48.2, 'clunk', 0.4], [50.4, 'whoosh', 0.3], [52.6, 'clunk', 0.35], [55.3, 'pop', 0.4], [56.1, 'pop', 0.4],
  [58.9, 'ding', 0.3], [59.3, 'ding', 0.25], [60.08, 'swell_hit', 0.4],
];

export const BuildWell: React.FC = () => {
  const {width: W, height: H, fps} = useVideoConfig();
  const t = useT();
  const cam = camAt(t);
  const prev = SHOTS.find((s) => s.from > 0 && t >= s.from && t < s.from + 0.12);
  return (
    <AbsoluteFill style={{background: '#9fd3f5'}}>
      <ThreeCanvas width={W} height={H} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
        <CameraRig cam={cam} />
        <World t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.3) 100%)'}} />
      {prev && <AbsoluteFill style={{background: 'white', opacity: 0.12 * (1 - (t - prev.from) / 0.12)}} />}
      <Word t={t} />
      <AbsoluteFill style={{background: 'black', opacity: 1 - ease(t, 0, 0.15) + ease(t, WELL_SEC - 0.6, WELL_SEC)}} />
      <Audio src={staticFile(`${JOB}/voice.mp3`)} />
      <Audio src={staticFile(`${JOB}/music.wav`)} volume={(f) => interpolate(f / fps, [0, 1, WELL_SEC - 1.5, WELL_SEC], [0, 0.14, 0.14, 0], CL)} />
      {SFX.map(([at, name, v], i) => <Sequence key={i} from={Math.round(at * fps)} durationInFrames={Math.round(2.5 * fps)}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v} /></Sequence>)}
    </AbsoluteFill>
  );
};
