// TEMPLATE (skill: 3d-motion-graphics). Copy to _engine/src/gfx/<Name>Gfx.tsx, rename SceneGfx/SceneGfxTest,
// fill SHOTS + story state + camAt + the per-shot content, register it in src/gfx/registry.tsx.
// All times are ABSOLUTE seconds on the job's cut timeline (words.json), so motion lands on spoken words.
// Full worked example with more effects: _engine/src/SchoolGfx.tsx.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {loadFont as loadInterTight} from '@remotion/google-fonts/InterTight';

const {fontFamily: tight} = loadInterTight('normal', {weights: ['700', '800'], subsets: ['latin']});
loadInterTight('italic', {weights: ['800'], subsets: ['latin']});

// ---------- shots (kind → time range). Same values go into edits_cine.json inserts ----------
export const SHOTS = {
  intro: {start: 2.0, end: 5.0},
  // payoff: {start: 9.4, end: 12.0},
} as const;
type Kind = keyof typeof SHOTS;

// ---------- helpers ----------
type V3 = [number, number, number];
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = (t: number, a: number, b: number, e = Easing.inOut(Easing.cubic)) => interpolate(t, [a, b], [0, 1], {...cl, easing: e});
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const mix3 = (a: V3, b: V3, k: number): V3 => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
const yawTo = (from: V3, to: V3) => Math.atan2(to[0] - from[0], to[2] - from[2]); // figure front = +z
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }; // deterministic
const HEAD = 1.22;

// ---------- story state: pure functions of t (shared by the 3D scene AND the HTML labels) ----------
const ME: V3 = [0, 0, 0];
const heroAt = (t: number): {p: V3; yaw: number} => {
  const k = ease(t, 2.2, 3.4, Easing.inOut(Easing.quad)); // e.g. walks in on the word at 2.2 s
  const p = mix3([-4, 0, -2], [-1.2, 0, -0.4], k);
  if (k > 0 && k < 1) p[1] += Math.abs(Math.sin(t * 9)) * 0.05; // walking bob
  return {p, yaw: k < 1 ? Math.PI / 2 : yawTo(p, ME)};
};

// ---------- camera per shot (one continuous move per shot; ease with sin for a smooth dolly) ----------
type Cam = {pos: V3; look: V3; fov: number};
const camAt = (kind: Kind, t: number): Cam => {
  const s = SHOTS[kind];
  const k = ease(t, s.start, s.end, Easing.inOut(Easing.sin));
  switch (kind) {
    case 'intro': return {pos: mix3([5, 4.5, 7], [2.5, 2.6, 4.2], k), look: mix3([0, 0.6, 0], [-0.4, 1.0, -0.2], k), fov: 40};
  }
};
const CameraRig: React.FC<{cam: Cam}> = ({cam}) => {
  const c = useThree().camera as THREE.PerspectiveCamera;
  c.position.set(...cam.pos); c.fov = cam.fov; c.near = 0.1; c.far = 80; c.lookAt(...cam.look); c.updateProjectionMatrix();
  return null;
};
// identical camera outside the canvas → screen position of any 3D point (for HTML tags/bubbles)
const projector = (cam: Cam, W: number, H: number) => {
  const c = new THREE.PerspectiveCamera(cam.fov, W / H, 0.1, 80);
  c.position.set(...cam.pos); c.lookAt(...cam.look); c.updateMatrixWorld(); c.updateProjectionMatrix();
  return (p: V3) => { const v = new THREE.Vector3(...p).project(c); return {x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H}; };
};

// ---------- 3D building blocks ----------
// stylised figure: capsule body + sphere head + two eyes (eyes make "who is looking where" readable)
const Person: React.FC<{p: V3; yaw: number; color: string; scale?: number; glow?: number}> = ({p, yaw, color, scale = 1, glow = 0}) => (
  <group position={p} rotation={[0, yaw, 0]} scale={scale}>
    <mesh position={[0, 0.55, 0]}><capsuleGeometry args={[0.22, 0.5, 6, 16]} /><meshStandardMaterial color={color} roughness={0.55} emissive={color} emissiveIntensity={glow} /></mesh>
    <mesh position={[0, HEAD, 0]}><sphereGeometry args={[0.2, 24, 16]} /><meshStandardMaterial color={color} roughness={0.5} emissive={color} emissiveIntensity={glow} /></mesh>
    {[-0.07, 0.07].map((x) => <mesh key={x} position={[x, HEAD + 0.03, 0.18]}><sphereGeometry args={[0.028, 10, 8]} /><meshStandardMaterial color="#0b0b0e" /></mesh>)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}><circleGeometry args={[0.36, 24]} /><meshBasicMaterial color="black" transparent opacity={0.45} /></mesh>
  </group>
);
// fake volumetric spotlight (cheap, no shadow maps)
const Spot: React.FC<{p: V3; k: number; color?: string}> = ({p, k, color = '#ffd9a0'}) => k <= 0 ? null : (
  <>
    <mesh position={[p[0], 3.2, p[2]]}><coneGeometry args={[0.95, 6.4, 40, 1, true]} />
      <meshBasicMaterial color={color} transparent opacity={0.13 * k} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[p[0], 0.01, p[2]]}><circleGeometry args={[0.95, 40]} />
      <meshBasicMaterial color={color} transparent opacity={0.35 * k} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
    <pointLight position={[p[0], 2.6, p[2] + 0.4]} intensity={9 * k} distance={5} color={color} />
  </>
);
const World: React.FC<{t: number}> = ({t}) => {
  const h = heroAt(t);
  return (
    <>
      <color attach="background" args={['#07080b']} />
      <fog attach="fog" args={['#07080b', 9, 30]} />
      <ambientLight intensity={0.32} />
      <directionalLight position={[4, 9, 6]} intensity={1.1} color="#dfe6ff" />
      <pointLight position={[-6, 3, 3]} intensity={10} distance={14} color="#7aa7ff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#111319" roughness={0.9} /></mesh>
      <Person p={ME} yaw={0} color="#ffb347" glow={0.4} />
      <Person p={h.p} yaw={h.yaw} color="#43c6b6" scale={1.1} glow={0.15} />
      <Spot p={ME} k={ease(t, 3.4, 3.9)} />
    </>
  );
};

// ---------- HTML overlays (Inter Tight only) ----------
const Tag: React.FC<{x: number; y: number; text: string; k: number; accent?: string}> = ({x, y, text, k, accent = 'rgba(255,255,255,0.35)'}) => {
  const {height: H} = useVideoConfig();
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-100%) translateY(${(1 - k) * 12}px)`, opacity: k, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{fontFamily: tight, fontWeight: 700, fontSize: 0.024 * H, letterSpacing: '0.12em', color: 'white', whiteSpace: 'nowrap',
        padding: `${0.008 * H}px ${0.016 * H}px`, borderRadius: 999, background: 'rgba(8,9,12,0.62)', border: `1.5px solid ${accent}`}}>{text}</div>
      <div style={{width: 1.5, height: 0.035 * H, background: accent}} />
    </div>
  );
};
const Bubble: React.FC<{x: number; y: number; text: string; k: number; side?: 'left' | 'right'}> = ({x, y, text, k, side = 'right'}) => {
  const {height: H} = useVideoConfig();
  if (k <= 0) return null;
  const s = interpolate(k, [0, 0.6, 1], [0.6, 1.06, 1]);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${side === 'right' ? '0%' : '-100%'},-100%) scale(${s})`,
      transformOrigin: side === 'right' ? 'bottom left' : 'bottom right', opacity: Math.min(1, k * 2)}}>
      <div style={{fontFamily: tight, fontWeight: 800, fontStyle: 'italic', fontSize: 0.042 * H, color: '#0b0b0e', background: 'white',
        borderRadius: 0.03 * H, padding: `${0.016 * H}px ${0.026 * H}px`, whiteSpace: 'nowrap', boxShadow: '0 10px 40px rgba(0,0,0,0.45)'}}>{text}</div>
    </div>
  );
};

// ---------- the scene ----------
export const SceneGfx: React.FC<{kind: string; start: number}> = ({kind, start}) => {
  const {width: W, height: H, fps} = useVideoConfig();
  const t = start + useCurrentFrame() / fps;
  const k = kind as Kind;
  const cam = camAt(k, t);
  const proj = projector(cam, W, H);
  const above = (p: V3, h = HEAD + 0.45) => proj([p[0], p[1] + h, p[2]]);
  const h = heroAt(t);
  const me = above(ME), hero = above(h.p, HEAD * 1.1 + 0.45), hb = proj([h.p[0] + 0.3, h.p[1] + HEAD * 1.1 + 0.15, h.p[2]]);
  return (
    <AbsoluteFill style={{opacity: ease(t, start, start + 0.12)}}>
      <ThreeCanvas width={W} height={H} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
        <CameraRig cam={cam} />
        <World t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
      <Tag x={me.x} y={me.y} text="ME" k={ease(t, start + 0.15, start + 0.45)} accent="#ffb347" />
      <Tag x={hero.x} y={hero.y} text="FRIEND" k={ease(t, 2.6, 2.9)} accent="#43c6b6" />
      <Bubble x={hb.x} y={hb.y} text="Let's go!" k={ease(t, 3.5, 3.75)} />
    </AbsoluteFill>
  );
};

// QA composition: every shot back to back. Register in Root.tsx with durationInFrames = sum of shot lengths × 30.
export const SceneGfxTest: React.FC = () => {
  const {fps} = useVideoConfig();
  let from = 0;
  return (
    <AbsoluteFill style={{background: 'black'}}>
      {(Object.keys(SHOTS) as Kind[]).map((kind) => {
        const s = SHOTS[kind], d = Math.round((s.end - s.start) * fps), f0 = from;
        from += d;
        return <Sequence key={kind} from={f0} durationInFrames={d}><SceneGfx kind={kind} start={s.start} /></Sequence>;
      })}
    </AbsoluteFill>
  );
};
