// Minor Money — "How To Use Your First Credit Card" (paper-explainer script, Day Series 3D look, 9:16). Low-poly bedroom world keyed to creditCardWords.ts.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {ACC, Bar, Cam, CameraRig, Captions, Card, DayAudio, ease, FONT, Grain, handheld, mix, mix3, Pill, pop, projector, Sfx, Stamp, Tag, useT, V3, Vignette} from './dayKit';
import {Look, Person} from './schoolKit';
import {WORDS} from './creditCardWords';

export const CREDIT_SEC = 52.0;
const JOB = 'jobs/credit-card';
const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// ---------- cast (Minor Money brand) ----------
const SAM: Look = {skin: '#f0c6a2', top: '#E07A3A', bottom: '#2E4057', hair: '#5a3a22'};
const LEO: Look = {skin: '#b77b52', top: '#2E4057', bottom: '#3a3a44', hair: '#151010'};
const MOM: Look = {skin: '#e6b991', top: '#7C9A7E', bottom: '#4a3d33', hair: '#C8553D'};
const MUSTARD = '#E3A32B';

// ---------- shots ----------
type Shot = {from: number; to: number; shake?: number; cam: (k: number) => Cam};
const C = (pos: V3, look: V3, fov = 42): Cam => ({pos, look, fov});
const lerp = (a: Cam, b: Cam) => (k: number): Cam => ({pos: mix3(a.pos, b.pos, k), look: mix3(a.look, b.look, k), fov: mix(a.fov, b.fov, k)});
const SHOTS: Shot[] = [
  {from: 0, to: 5.96, cam: lerp(C([2.6, 2.6, 6.2], [0, 1.6, 0], 44), C([0.9, 1.9, 3.6], [0, 1.6, 0.6], 42))},
  {from: 5.96, to: 9.0, cam: lerp(C([-0.6, 1.7, 4.4], [1.0, 1.4, 0], 42), C([-0.2, 1.6, 3.6], [1.1, 1.5, 0], 40))},
  {from: 9.0, to: 10.42, shake: 1.2, cam: lerp(C([1.6, 1.7, 2.6], [1.3, 1.6, 0], 40), C([1.5, 1.7, 2.2], [1.3, 1.6, 0], 36))},
  {from: 10.42, to: 14.16, cam: lerp(C([-2.4, 2.4, 5.0], [0, 1.6, 0], 46), C([-1.4, 2.0, 4.2], [0, 1.7, 0], 44))},
  {from: 14.16, to: 17.68, cam: lerp(C([0, 1.75, 3.2], [0, 1.7, 0.8], 40), C([0, 1.75, 2.6], [0, 1.7, 0.8], 36))},
  {from: 17.68, to: 19.8, cam: lerp(C([2.2, 1.9, 3.4], [0, 1.2, 0.5], 44), C([1.6, 1.7, 2.8], [0, 1.2, 0.5], 42))},
  {from: 19.8, to: 23.32, cam: lerp(C([-1.8, 1.5, 3.0], [0, 1.3, 0.6], 44), C([-1.2, 1.4, 2.6], [0, 1.3, 0.6], 42))},
  {from: 23.32, to: 26.4, cam: lerp(C([0, 1.5, 3.4], [0, 1.35, 1.0], 44), C([0, 1.5, 3.0], [0, 1.35, 1.0], 42))},
  {from: 26.4, to: 29.62, cam: lerp(C([3.2, 2.4, 4.4], [0, 1.4, 0], 46), C([2.4, 2.0, 3.8], [0, 1.4, 0], 44))},
  {from: 29.62, to: 33.86, shake: 0.5, cam: lerp(C([1.2, 1.7, 4.6], [-1.6, 1.4, -0.5], 46), C([0.6, 1.7, 4.0], [-1.8, 1.4, -0.8], 44))},
  {from: 33.86, to: 36.38, cam: lerp(C([1.4, 2.6, 2.6], [0.6, 0.9, 0.2], 46), C([1.1, 2.3, 2.2], [0.6, 0.9, 0.2], 42))},
  {from: 36.38, to: 40.88, cam: lerp(C([-0.8, 1.6, 3.6], [0, 1.5, 0], 42), C([-0.4, 1.6, 3.1], [0, 1.5, 0], 40))},
  {from: 40.88, to: 44.18, shake: 1.0, cam: lerp(C([1.8, 1.4, 3.4], [-0.6, 1.2, 0.6], 46), C([1.2, 1.3, 2.8], [-0.6, 1.2, 0.6], 42))},
  {from: 44.18, to: 47.16, cam: lerp(C([0, 2.0, 4.2], [0, 1.5, 0], 44), C([0.4, 1.9, 3.6], [0, 1.5, 0], 42))},
  {from: 47.16, to: CREDIT_SEC + 1, cam: lerp(C([0, 1.4, 3.2], [0, 1.6, 0], 42), C([0, 3.2, 6.6], [0, 1.5, 0], 50))},
];
const shotAt = (t: number) => Math.max(0, SHOTS.findIndex((s) => t >= s.from && t < s.to));
const camAt = (t: number): Cam => {
  const s = SHOTS[shotAt(t)];
  const c = handheld(s.cam(ease(t, s.from, s.to, Easing.inOut(Easing.sin))), t, 1);
  const sh = (s.shake ?? 0) * 0.012;
  return sh ? {...c, pos: [c.pos[0] + Math.sin(t * 37) * sh, c.pos[1] + Math.sin(t * 43 + 1) * sh, c.pos[2]]} : c;
};

// ---------- money state (pure functions of t) ----------
const balanceAt = (t: number) => {
  if (t < 18.5) return 0;
  if (t < 26.4) return 25;
  if (t < 29.62) return Math.round(interpolate(t, [27.6, 28.4], [25, 280], CL));
  if (t < 33.86) return Math.round(interpolate(t, [29.7, 30.6], [280, 1000], CL));
  if (t < 38.8) return 280;
  return Math.round(interpolate(t, [38.8, 39.6], [280, 0], CL));
};
const dayAt = (t: number) => (t < 17.68 ? 0 : t < 26.4 ? 1 : t < 33.86 ? 10 : t < 47.16 ? 30 : 365);
const scoreAt = (t: number) => Math.round(interpolate(t, [47.6, 50.6], [0, 742], {...CL, easing: Easing.out(Easing.cubic)}));

// ---------- props ----------
const M: React.FC<{c: string; e?: number; m?: number; r?: number}> = ({c, e = 0, m = 0, r = 0.6}) =>
  <meshStandardMaterial color={c} emissive={c} emissiveIntensity={e} metalness={m} roughness={r} flatShading />;
const B: React.FC<{p: V3; s: V3; c: string; e?: number; r?: V3; m?: number}> = ({p, s, c, e, r, m}) =>
  <mesh position={p} rotation={r}><boxGeometry args={s} /><M c={c} e={e} m={m} /></mesh>;

const CreditCard: React.FC<{glow?: number; red?: number}> = ({glow = 0, red = 0}) => (
  <group>
    <B p={[0, 0, 0]} s={[0.86, 0.54, 0.03]} c={red > 0.5 ? '#8a1f1f' : '#2E4057'} e={0.1 + glow * 0.4} m={0.3} />
    <B p={[0, 0.17, 0.017]} s={[0.86, 0.06, 0.005]} c="#B8E06A" e={0.4 + glow} />
    <B p={[-0.25, 0.0, 0.018]} s={[0.15, 0.11, 0.006]} c={MUSTARD} e={0.3} m={0.8} r={[0, 0, 0]} />
    {[0, 1, 2, 3].map((i) => <B key={i} p={[-0.27 + i * 0.13, -0.16, 0.018]} s={[0.1, 0.03, 0.004]} c="#e8e2d4" e={0.2} />)}
  </group>
);
const Cap: React.FC = () => (
  <group position={[0, 1.74, 0]}>
    <mesh scale={[1.12, 0.62, 1.12]}><sphereGeometry args={[0.17, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2]} /><M c={MUSTARD} /></mesh>
    <B p={[0, 0.005, 0.2]} s={[0.26, 0.02, 0.16]} c={MUSTARD} />
  </group>
);
const Pizza: React.FC = () => (
  <group rotation={[0.5, 0, 0]}>
    <mesh><cylinderGeometry args={[0.32, 0.32, 0.04, 9, 1, false, 0, Math.PI / 3]} /><M c="#E3A32B" /></mesh>
    <mesh position={[0, 0.025, 0]}><cylinderGeometry args={[0.28, 0.28, 0.02, 9, 1, false, 0.05, Math.PI / 3 - 0.1]} /><M c="#C8553D" /></mesh>
    {[[0.08, 0.14], [0.15, 0.05], [0.04, 0.22]].map(([x, z], i) => <mesh key={i} position={[x, 0.04, z]}><cylinderGeometry args={[0.03, 0.03, 0.015, 6]} /><M c="#8a1f1f" /></mesh>)}
  </group>
);
const Remote: React.FC = () => (
  <group>
    <B p={[0, 0, 0]} s={[0.14, 0.5, 0.06]} c="#2a2a30" />
    <B p={[0, 0.17, 0.035]} s={[0.05, 0.05, 0.02]} c="#FF3B3B" e={0.8} />
    {[0, 1, 2, 3, 4, 5].map((i) => <B key={i} p={[-0.03 + (i % 2) * 0.06, 0.05 - Math.floor(i / 2) * 0.08, 0.035]} s={[0.035, 0.035, 0.015]} c="#bbb" />)}
  </group>
);
const Wallet: React.FC = () => (
  <group>
    <B p={[0, 0, 0]} s={[0.46, 0.34, 0.08]} c="#6b4226" />
    <B p={[0, 0.08, 0.045]} s={[0.46, 0.16, 0.01]} c="#5a361e" />
    <B p={[0.1, 0.2, 0]} s={[0.3, 0.12, 0.03]} c="#7fae5a" />
  </group>
);
const Bill: React.FC = () => (
  <group>
    <B p={[0, 0, 0]} s={[0.6, 0.4, 0.02]} c="#f4ebd6" />
    <B p={[0, 0.12, 0.012]} s={[0.6, 0.06, 0.005]} c="#C8553D" />
    {[0, 1, 2].map((i) => <B key={i} p={[-0.08, -0.02 - i * 0.07, 0.012]} s={[0.36, 0.025, 0.004]} c="#8a8070" />)}
  </group>
);
// interest monster: faceted red blob with teeth and a chomping jaw
const Monster: React.FC<{t: number}> = ({t}) => {
  const chomp = Math.abs(Math.sin(t * 9)) * 0.35;
  return (
    <group>
      <mesh position={[0, 0.12, 0]}><icosahedronGeometry args={[0.45, 1]} /><M c="#c0262a" e={0.15} /></mesh>
      <group position={[0, -0.05, 0.05]} rotation={[chomp, 0, 0]}><mesh position={[0, -0.12, 0]}><icosahedronGeometry args={[0.33, 1]} /><M c="#9a1c20" /></mesh>
        {[-0.18, -0.06, 0.06, 0.18].map((x) => <mesh key={x} position={[x, 0.08, 0.28]}><coneGeometry args={[0.04, 0.1, 4]} /><M c="#ffffff" /></mesh>)}</group>
      {[-0.18, 0.18].map((x) => <mesh key={x} position={[x, 0.3, 0.38]}><sphereGeometry args={[0.07, 6, 5]} /><meshStandardMaterial color="#FFB23D" emissive="#FFB23D" emissiveIntensity={1.4} /></mesh>)}
      {[-0.06, 0.06, 0.12, -0.12].map((x, i) => <mesh key={i} position={[x * 2.2, 0.06, 0.4]} rotation={[0, 0, 3.14]}><coneGeometry args={[0.04, 0.1, 4]} /><M c="#ffffff" /></mesh>)}
    </group>
  );
};
const Bank: React.FC = () => (
  <group>
    <B p={[0, 0.25, 0]} s={[1.0, 0.5, 0.7]} c="#e8e2d4" />
    {[-0.36, -0.12, 0.12, 0.36].map((x) => <mesh key={x} position={[x, 0.25, 0.38]}><cylinderGeometry args={[0.05, 0.05, 0.5, 6]} /><M c="#f4ebd6" /></mesh>)}
    <mesh position={[0, 0.62, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[0.75, 0.3, 4]} /><M c="#C8553D" /></mesh>
    <B p={[0, 0.02, 0.1]} s={[1.15, 0.05, 0.9]} c="#cfc6b2" />
  </group>
);
const Coin: React.FC = () => <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.09, 0.09, 0.02, 10]} /><M c={MUSTARD} e={0.35} m={0.7} r={0.3} /></mesh>;
const Calendar: React.FC<{page: string}> = () => (
  <group>
    <B p={[0, 0, 0]} s={[0.7, 0.8, 0.03]} c="#f4ebd6" />
    <B p={[0, 0.32, 0.02]} s={[0.7, 0.16, 0.01]} c="#C8553D" />
    {Array.from({length: 20}, (_, i) => <B key={i} p={[-0.24 + (i % 5) * 0.12, 0.15 - Math.floor(i / 5) * 0.13, 0.02]} s={[0.08, 0.08, 0.005]} c="#d9cbb0" />)}
  </group>
);

// ---------- bedroom ----------
const Room: React.FC<{sun: number}> = ({sun}) => (
  <>
    <B p={[0, -0.05, 0]} s={[14, 0.1, 14]} c="#c9a77c" />
    <B p={[0, 2.5, -2.4]} s={[14, 5, 0.1]} c="#8fb3a8" />
    <B p={[-4, 2.5, 0]} s={[0.1, 5, 14]} c="#a8c4b8" />
    {/* window with sky */}
    <B p={[1.6, 2.3, -2.33]} s={[1.6, 1.3, 0.04]} c={sun > 0.5 ? '#ffd9a0' : '#bfe2ff'} e={0.9} />
    <B p={[1.6, 2.3, -2.3]} s={[0.06, 1.3, 0.04]} c="#f4ebd6" />
    <B p={[1.6, 2.3, -2.3]} s={[1.6, 0.06, 0.04]} c="#f4ebd6" />
    {/* bed */}
    <B p={[-2.6, 0.3, -1.0]} s={[1.6, 0.5, 2.4]} c="#2E4057" />
    <B p={[-2.6, 0.6, -2.0]} s={[1.3, 0.25, 0.5]} c="#f4ebd6" />
    {/* desk */}
    <B p={[1.3, 0.78, -0.4]} s={[1.6, 0.06, 0.8]} c="#7a5236" />
    {[[-0.7, -0.33], [0.7, -0.33], [-0.7, 0.33], [0.7, 0.33]].map(([x, z], i) => <B key={i} p={[1.3 + x, 0.38, -0.4 + z]} s={[0.06, 0.76, 0.06]} c="#5a3a22" />)}
    <B p={[1.7, 1.1, -0.65]} s={[0.6, 0.4, 0.03]} c="#1a1a20" e={0.1} />
    {/* door (mom peeks from here) */}
    <B p={[-3.94, 1.1, 1.6]} s={[0.04, 2.2, 1.0]} c="#7a5236" />
    {/* rug */}
    <mesh position={[0, 0.01, 0.8]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.5, 8]} /><M c="#C8553D" /></mesh>
    <hemisphereLight args={['#fff4e0', '#5a4636', 0.9]} />
    <directionalLight position={[3, 6, 4]} intensity={sun > 0.5 ? 1.4 : 1.8} color={sun > 0.5 ? '#ffc58a' : '#fff6ea'} />
    <pointLight position={[1.6, 2.3, -1.6]} intensity={1.2} distance={6} color="#ffe7c0" />
  </>
);

const World: React.FC<{t: number}> = ({t}) => {
  const sun = t > 33.86 ? 1 : 0;
  // card: drops in, floats in front of Sam; turns red when maxed
  const drop = ease(t, 0.3, 2.4, Easing.out(Easing.back(1.2)));
  const red = t > 29.7 && t < 33.86 ? 1 : 0;
  const cardHide = t > 23.32 && t < 26.4;
  const spin = t < 5.96 ? t * 1.6 : Math.sin(t * 0.9) * 0.35;
  const cardPos: V3 = t < 47.16 ? [0.42, mix(4.2, 1.2, drop) + Math.sin(t * 1.7) * 0.04, 0.8] : [0.15, 2.25 + Math.sin(t * 1.7) * 0.05, 0.4];
  const cardScale = t > 36.38 && t < 40.88 ? 1.15 : 1;
  const leoIn = ease(t, 5.96, 6.6, Easing.out(Easing.cubic)) * (1 - ease(t, 10.0, 10.5));
  const momIn = ease(t, 30.6, 31.3, Easing.out(Easing.cubic)) * (1 - ease(t, 33.4, 33.86));
  const monster = ease(t, 40.9, 41.4, Easing.out(Easing.back(1.6))) * (1 - ease(t, 43.8, 44.18));
  const banks = ease(t, 48.5, 49.4, Easing.out(Easing.back(1.4)));
  return (
    <>
      <Room sun={sun} />
      {/* Sam */}
      <group position={[0, 0, 0]} rotation={[0, t > 29.62 && t < 33.86 ? -0.5 : 0, 0]}>
        <Person look={SAM} armUp={t > 47.6 ? 1 : t > 38.8 && t < 40.0 ? 0.6 : 0} reach={t > 18.0 && t < 19.4 ? 0.8 : 0} headTilt={t > 9 && t < 10.4 ? 0.4 : 0} />
        <Cap />
        {t > 49 && <group position={[0, 2.08 + Math.sin(t * 2) * 0.03, 0]} rotation={[0, t * 1.2, 0]}>
          <mesh><cylinderGeometry args={[0.2, 0.18, 0.12, 6, 1, true]} /><M c={MUSTARD} e={0.6} m={0.8} /></mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => <mesh key={i} position={[Math.cos(i) * 0.2, 0.1, Math.sin(i) * 0.2]}><coneGeometry args={[0.04, 0.1, 4]} /><M c={MUSTARD} e={0.6} /></mesh>)}
        </group>}
      </group>
      {/* the card */}
      {!cardHide && <group position={cardPos} rotation={[0.1, spin, 0]} scale={cardScale}><CreditCard glow={t > 10.42 && t < 14.16 ? 1 : t > 47.16 ? 1 : 0} red={red} /></group>}
      {/* Leo, "free money" */}
      {leoIn > 0 && <group position={[mix(4, 1.3, leoIn), 0, 0.2]} rotation={[0, -0.6, 0]}><Person look={LEO} armUp={t < 9 ? 1 : 0} headTilt={t > 9 ? 0.5 : 0} /></group>}
      {/* future: blocks stacking 10.4–14.2 */}
      {t > 10.42 && t < 14.16 && [0, 1, 2, 3, 4].map((i) => {
        const k = pop(t, 11.0 + i * 0.4, 0.35);
        return k > 0 ? <group key={i} position={[-1.2, 0.2 + i * 0.4, 0.4]} scale={k}><B p={[0, 0, 0]} s={[0.5, 0.36, 0.5]} c={['#7C9A7E', '#E3A32B', '#C8553D', '#2E4057', '#B8E06A'][i]} /></group> : null;
      })}
      {/* Day 1 pizza */}
      {t > 17.9 && t < 23.32 && <group position={[0.9, mix(2.6, 1.3, ease(t, 17.9, 18.5, Easing.out(Easing.back(1.4)))), 0.6]} rotation={[0, t * 0.8, 0]}><Pizza /></group>}
      {/* Day 1: coins already in the bank */}
      {t > 20.7 && t < 23.32 && Array.from({length: 8}, (_, i) => {
        const k = pop(t, 20.8 + i * 0.12, 0.3);
        return <group key={i} position={[-1.0, 0.85 + i * 0.03, 0.6]} scale={k}><Coin /></group>;
      })}
      {t > 20.7 && t < 23.32 && <group position={[-1.0, 0, 0.6]} scale={pop(t, 20.7, 0.4) * 0.8}><Bank /></group>}
      {/* remote vs wallet */}
      {t > 23.32 && t < 26.4 && <>
        <group position={[-0.2, 1.3 + Math.sin(t * 2) * 0.03, 1.5]} rotation={[0, 0.3, -0.2]} scale={pop(t, 23.5, 0.35) * 0.7}><Remote /></group>
        <group position={[0.2, 1.3 + Math.sin(t * 2 + 1) * 0.03, 1.5]} rotation={[0, -0.3, 0.1]} scale={pop(t, 24.6, 0.35) * 0.7}><Wallet /></group>
      </>}
      {/* mom peeks in */}
      {momIn > 0 && <group position={[-2.6 + momIn * 0.9, 0, 0.6]} rotation={[0, Math.PI / 2, 0]}><Person look={MOM} headTilt={0.3} arms={0.4} /></group>}
      {/* Day 30 bill lands on desk */}
      {t > 34.6 && t < 40.88 && <group position={[0.8, mix(2.4, 0.83, ease(t, 34.9, 35.4, Easing.out(Easing.bounce))), -0.2]} rotation={[-Math.PI / 2 + 0.1, 0, 0.2]}><Bill /></group>}
      {/* interest monster eats Sam's coins */}
      {monster > 0 && <group position={[-0.9, 1.0, 0.8]} scale={monster} rotation={[0, 0.5, 0]}><Monster t={t} /></group>}
      {monster > 0 && Array.from({length: 6}, (_, i) => {
        const k = ((t - 41 + i * 0.25) % 1.5) / 1.5;
        return <group key={i} position={mix3([0.3, 1.0, 0.8], [-0.8, 1.05, 0.9], k)} rotation={[0, t * 4, 0]}><Coin /></group>;
      })}
      {/* autopay calendar */}
      {t > 44.18 && t < 47.16 && <group position={[-1.1, 1.7, 0.2]} rotation={[0, 0.4, 0]} scale={pop(t, 44.3, 0.4)}><Calendar page="due" /></group>}
      {/* one year later: banks bow, coins rain */}
      {t > 48.3 && [-2.2, 2.2, -1.4, 1.4].map((x, i) => (
        <group key={i} position={[x, 0, i < 2 ? -0.6 : -1.6]} scale={banks} rotation={[Math.sin(t * 3 + i) > 0 ? 0.25 : 0.05, i % 2 ? -0.4 : 0.4, 0]}><Bank /></group>
      ))}
      {t > 49 && Array.from({length: 26}, (_, i) => {
        const y = 4.5 - (((t - 49) * 2.2 + i * 0.37) % 4.5);
        return <group key={i} position={[-2 + (i * 0.61) % 4, y, -0.5 + (i * 0.37) % 2]} rotation={[t * 3 + i, t * 2, 0]}><Coin /></group>;
      })}
    </>
  );
};

// ---------- HUD ----------
const money = (n: number) => '$' + n.toLocaleString('en-US');
const HUD: React.FC<{t: number}> = ({t}) => {
  const k = ease(t, 2.4, 2.9, Easing.out(Easing.cubic));
  if (t < 2.4) return null;
  const bal = balanceAt(t), day = dayAt(t);
  const balCol = bal > 300 ? ACC.red : bal > 0 ? ACC.amber : ACC.lime;
  const balBump = 1 + 0.1 * Math.max(0, 1 - Math.abs(t - 30.2) * 2) + 0.1 * Math.max(0, 1 - Math.abs(t - 39.2) * 2);
  const sk = ease(t, 47.4, 47.9);
  return (
    <div style={{position: 'absolute', left: 56, right: 56, top: 92, display: 'flex', justifyContent: 'space-between', opacity: k, transform: `translateY(${(1 - k) * -40}px)`, fontFamily: FONT}}>
      <div style={{color: 'white', textShadow: '0 3px 12px rgba(0,0,0,0.7)'}}>
        <div style={{fontWeight: 800, fontSize: 30, letterSpacing: '0.16em', color: ACC.lime}}>● FIRST CARD <span style={{color: 'white', opacity: 0.8}}>· MINOR MONEY</span></div>
        <div style={{fontWeight: 900, fontSize: 76, lineHeight: 1, marginTop: 6}}>{day === 0 ? 'AGE 18' : day === 365 ? '1 YEAR' : `DAY ${day}`}</div>
        <div style={{fontWeight: 700, fontSize: 26, letterSpacing: '0.12em', color: ACC.amber, marginTop: 8}}>{t < 38.8 ? 'INTEREST: AVOIDABLE' : 'INTEREST: $0'}</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14}}>
        <Pill color={ACC.blue} size={32}><span style={{color: ACC.blue}}>$1,000</span>LIMIT</Pill>
        <div style={{transform: `scale(${balBump})`, transformOrigin: 'right center'}}><Pill color={balCol} size={32}><span style={{color: balCol}}>{money(bal)}</span>BALANCE</Pill></div>
        {sk > 0 && <div style={{opacity: sk}}><Pill color={ACC.lime} size={32}><span style={{color: ACC.lime}}>{scoreAt(t)}</span>SCORE</Pill></div>}
      </div>
    </div>
  );
};

// ---------- beats ----------
const X: React.FC<{k: number}> = ({k}) => (
  <svg width="140" height="140" viewBox="0 0 100 100" style={{position: 'absolute', right: 30, top: '50%', marginTop: -70}}>
    <path d="M15 15 L85 85 M85 15 L15 85" stroke={ACC.red} strokeWidth="14" strokeLinecap="round" fill="none" strokeDasharray="200" strokeDashoffset={200 * (1 - k)} />
  </svg>
);
const Row: React.FC<{text: string; ok: boolean; k: number; sub?: string}> = ({text, ok, k, sub}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 24, padding: '22px 28px', borderRadius: 26, background: ok ? 'rgba(200,255,61,0.12)' : 'rgba(255,59,59,0.12)', marginBottom: 18, opacity: k, transform: `translateX(${(1 - k) * 40}px)`}}>
    <span style={{fontSize: 56, fontWeight: 900, color: ok ? ACC.lime : ACC.red}}>{ok ? '✓' : '✗'}</span>
    <div><div style={{fontSize: 46, fontWeight: 900}}>{text}</div>{sub && <div style={{fontSize: 30, fontWeight: 700, opacity: 0.75}}>{sub}</div>}</div>
  </div>
);
const Toggle: React.FC<{on: number}> = ({on}) => (
  <span style={{width: 130, height: 72, borderRadius: 999, background: on > 0.5 ? ACC.lime : '#3a4150', position: 'relative', display: 'inline-block'}}>
    <span style={{position: 'absolute', top: 7, left: mix(7, 65, on), width: 58, height: 58, borderRadius: 999, background: 'white'}} />
  </span>
);

const Beats: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const {width: W, height: Hh} = useVideoConfig();
  const P = projector(cam, W, Hh);
  const leoHead = P([1.3, 2.05, 0.2]);
  const momHead = P([-1.7, 2.0, 0.6]);
  const util = interpolate(t, [27.6, 28.4, 29.7, 30.6], [0.025, 0.28, 0.28, 1], CL);
  return (
    <>
      <Stamp t={t} at={0.0} out={1.0} text="CONGRATS" color={ACC.lime} y={520} size={170} />
      <Stamp t={t} at={4.0} out={5.7} text="$1,000" sub="CREDIT LIMIT" color={ACC.blue} y={420} size={210} />
      <Tag x={leoHead.x} y={leoHead.y} text='"FREE MONEY"' k={t > 7.6 && t < 9.0 ? pop(t, 7.6) : 0} color={ACC.amber} />
      <Stamp t={t} at={9.5} out={10.3} text="WRONG." color={ACC.red} y={500} />
      <Stamp t={t} at={10.5} out={13.9} text="SURVIVE" sub="30 DAYS" color={ACC.lime} y={330} size={190} />
      <Card t={t} at={15.1} out={17.5} y={330} accent={ACC.red}>
        <div style={{fontWeight: 900, fontSize: 44, marginBottom: 24}}>WHAT COSTS MORE?</div>
        <Bar label="Girlfriend" value="$$$" k={ease(t, 15.4, 15.9) * 0.55} color={ACC.amber} />
        <Bar label="Car" value="$$$$" k={ease(t, 15.6, 16.1) * 0.75} color={ACC.blue} />
        <Bar label="Card mistakes" value="$$$$$" k={ease(t, 16.1, 16.7)} color={ACC.red} />
      </Card>
      <Stamp t={t} at={17.68} out={19.6} text="DAY 1" color="white" y={360} />
      <Card t={t} at={19.8} out={23.1} y={330} accent={ACC.lime}>
        <div style={{fontWeight: 800, fontSize: 32, letterSpacing: '0.16em', color: ACC.lime}}>RULE 1</div>
        <div style={{fontWeight: 900, fontSize: 60, lineHeight: 1.05, marginTop: 10}}>Only swipe money<br />you already have.</div>
      </Card>
      {t > 23.32 && t < 26.4 && (() => { const r = P([-0.2, 1.55, 1.5]), w = P([0.2, 1.5, 1.5]); return <>
        <Tag x={r.x} y={r.y} text="REMOTE ✓" k={pop(t, 23.9)} color={ACC.lime} />
        <Tag x={w.x} y={w.y} text="WALLET ✗" k={pop(t, 24.9)} color={ACC.red} />
      </>; })()}
      <Stamp t={t} at={26.4} out={27.3} text="DAY 10" color="white" y={360} />
      <Card t={t} at={27.3} out={33.5} y={330} accent={util > 0.3 ? ACC.red : ACC.lime}>
        <Bar label="Card used" value={`${Math.round(util * 100)}%`} k={util} color={util > 0.3 ? ACC.red : ACC.lime} />
        <div style={{fontWeight: 800, fontSize: 36, color: util > 0.3 ? ACC.red : ACC.lime}}>{util > 0.3 ? 'LENDERS: 😬' : 'UNDER 30% = SAFE'}</div>
      </Card>
      <Tag x={momHead.x} y={momHead.y} text="MOM: 9H SCREEN TIME?!" k={t > 31.3 && t < 33.6 ? pop(t, 31.4) : 0} color={ACC.red} />
      <Stamp t={t} at={33.86} out={34.8} text="DAY 30" color="white" y={360} />
      {t > 35.2 && t < 36.4 && (() => { const b = P([0.8, 1.05, -0.2]); return <Tag x={b.x} y={b.y} text="BILL: $280" k={pop(t, 35.3)} color={ACC.amber} />; })()}
      <Card t={t} at={36.4} out={40.7} y={1000 - 620} accent={ACC.lime}>
        <Row text="PAY IN FULL" sub="$0 interest" ok k={ease(t, 36.6, 37.0)} />
        <div style={{position: 'relative'}}><Row text="Minimum only" sub="interest piles up" ok={false} k={ease(t, 37.5, 37.9)} /></div>
      </Card>
      <Stamp t={t} at={41.4} out={43.9} text="20%+" sub="INTEREST A YEAR" color={ACC.red} y={330} size={240} />
      <Card t={t} at={44.2} out={47.0} y={330} accent={ACC.lime}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 900, fontSize: 54}}><span>AUTOPAY</span><Toggle on={ease(t, 44.4, 44.7)} /></div>
        <div style={{fontWeight: 800, fontSize: 34, marginTop: 20, color: ACC.amber}}>On-time payments ≈ 35% of your score</div>
      </Card>
      <Stamp t={t} at={49.7} out={CREDIT_SEC} text="MILLIONAIRE" sub="TREATMENT UNLOCKED" color={ACC.amber} y={360} size={150} />
      {t > 9.5 && t < 10.3 && <div style={{position: 'absolute', left: leoHead.x - 140, top: leoHead.y - 70, width: 280, height: 140}}><X k={ease(t, 9.5, 9.8)} /></div>}
    </>
  );
};

const KEYS: Record<string, string> = {
  congrats: ACC.lime, '18': ACC.amber, credit: ACC.blue, card: ACC.blue, thousand: ACC.blue, dollar: ACC.blue, limit: ACC.blue, free: ACC.amber, money: ACC.lime,
  wrong: ACC.red, survive: ACC.lime, '30': ACC.amber, days: ACC.amber, future: ACC.lime, mess: ACC.red, expensive: ACC.red, girlfriend: ACC.amber,
  day: ACC.lime, '1': ACC.lime, one: ACC.lime, pizza: ACC.amber, rule: ACC.lime, swipe: ACC.lime, already: ACC.lime, bank: ACC.lime, remote: ACC.lime, wallet: ACC.red,
  '10': ACC.lime, balance: ACC.amber, under: ACC.lime, '300': ACC.lime, maxing: ACC.red, scares: ACC.red, lenders: ACC.red, mom: ACC.amber, screen: ACC.amber,
  bill: ACC.amber, full: ACC.lime, amount: ACC.lime, minimum: ACC.red, zero: ACC.lime, interest: ACC.red, '20': ACC.red, '%': ACC.red, eating: ACC.red, alive: ACC.red,
  autopay: ACC.lime, never: ACC.red, miss: ACC.red, due: ACC.amber, date: ACC.amber, year: ACC.amber, banks: ACC.lime, millionaire: ACC.amber,
};

const CutFlash: React.FC<{t: number}> = ({t}) => {
  const s = SHOTS.find((x) => x.from > 0 && t >= x.from && t < x.from + 0.16);
  if (!s) return null;
  return <AbsoluteFill style={{background: 'white', opacity: 0.2 * (1 - (t - s.from) / 0.16)}} />;
};

export const SFX: Sfx[] = [
  [0.0, 'whoosh_long', 0.3], [0.2, 'ding', 0.3], [2.3, 'impact', 0.45], [4.1, 'ding', 0.3], [5.96, 'whoosh', 0.3], [7.6, 'pop', 0.4], [9.5, 'scratch', 0.45],
  [10.42, 'riser', 0.25], [11.0, 'pop', 0.3], [11.8, 'pop', 0.3], [12.6, 'pop', 0.3], [14.16, 'whoosh', 0.3], [15.4, 'click', 0.3], [16.2, 'impact', 0.4],
  [17.68, 'swell_hit', 0.35], [18.4, 'pop', 0.4], [19.8, 'whoosh', 0.25], [20.8, 'ding', 0.25], [23.32, 'whoosh', 0.3], [23.9, 'pop', 0.4], [24.9, 'pop', 0.4],
  [26.4, 'swell_hit', 0.35], [27.7, 'click', 0.35], [29.7, 'glitch', 0.35], [30.4, 'alarm', 0.15], [31.4, 'scratch', 0.35], [33.86, 'swell_hit', 0.35],
  [35.1, 'clunk', 0.5], [36.4, 'whoosh', 0.25], [36.7, 'ding', 0.3], [37.6, 'boom', 0.3], [38.9, 'ding', 0.35], [40.88, 'growl', 0.45], [41.4, 'impact', 0.5],
  [42.4, 'growl', 0.3], [44.2, 'whoosh', 0.25], [44.5, 'click', 0.45], [45.7, 'ding', 0.3], [47.16, 'whoosh_long', 0.3], [48.5, 'riser', 0.3], [49.7, 'swell_hit', 0.4], [50.2, 'ding', 0.35],
];

export const FirstCreditCard: React.FC = () => {
  const {width: W, height: Hh} = useVideoConfig();
  const t = useT();
  const cam = camAt(t);
  const redWash = t > 40.9 && t < 44.1 ? 0.18 * ease(t, 40.9, 41.2) * (1 - ease(t, 43.8, 44.1)) : 0;
  return (
    <AbsoluteFill style={{background: '#0c0f14'}}>
      <ThreeCanvas width={W} height={Hh} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
        <CameraRig cam={cam} />
        <World t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{background: '#ff1a1a', opacity: redWash, mixBlendMode: 'multiply'}} />
      <Vignette />
      <Grain />
      <HUD t={t} />
      <Beats t={t} cam={cam} />
      <Captions words={WORDS} t={t} keys={KEYS} y={1330} />
      <CutFlash t={t} />
      <AbsoluteFill style={{background: 'black', opacity: t < 0.3 ? 1 - ease(t, 0, 0.3) : ease(t, CREDIT_SEC - 0.5, CREDIT_SEC)}} />
      <DayAudio job={JOB} sec={CREDIT_SEC} sfx={SFX} musicVol={0.12} />
    </AbsoluteFill>
  );
};

// ---------- thumbnail ----------
export const FirstCreditCardThumb: React.FC = () => {
  const {width: W, height: Hh} = useVideoConfig();
  const t = 41.8;
  const cam: Cam = {pos: [1.3, 1.5, 3.3], look: [-0.4, 1.3, 0.4], fov: 46};
  return (
    <AbsoluteFill style={{background: '#0c0f14', fontFamily: FONT}}>
      <ThreeCanvas width={W} height={Hh} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
        <CameraRig cam={cam} />
        <World t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 36%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.8) 100%)'}} />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: ACC.red, color: 'white', fontWeight: 900, fontSize: 52, letterSpacing: '0.12em', padding: '12px 34px', borderRadius: 999}}>FIRST CREDIT CARD</div>
        <div style={{fontWeight: 900, fontSize: 250, lineHeight: 0.9, color: 'white', marginTop: 30, WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', textShadow: '0 12px 0 rgba(0,0,0,0.5)'}}>30 DAYS</div>
      </div>
      <div style={{position: 'absolute', bottom: 260, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontWeight: 900, fontSize: 100, lineHeight: 1, color: 'white', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>DON'T GET</div>
        <div style={{fontWeight: 900, fontSize: 100, lineHeight: 1, color: ACC.lime, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>EATEN ALIVE</div>
      </div>
    </AbsoluteFill>
  );
};
