// 3D motion-graphic simulations for "How I Became My School's Video Editor" (jobs/school-video-editor).
// One shared assembly-hall model; each `kind` is a camera move + animation state over it. All times are
// ABSOLUTE seconds on the cut timeline, so the scenes stay locked to the words in words.json.
// Rendered with @remotion/three (needs --gl=angle, set in remotion.config.ts). Fonts: Inter Tight only.
import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {loadFont as loadInterTight} from '@remotion/google-fonts/InterTight';

const {fontFamily: tight} = loadInterTight('normal', {weights: ['600', '700', '800'], subsets: ['latin']});
loadInterTight('italic', {weights: ['800'], subsets: ['latin']});

export type GfxKind = 'hook' | 'hook916' | 'outro916' | 'assembly' | 'shout' | 'eyes' | 'aura' | 'biryani';

type V3 = [number, number, number];
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = (t: number, a: number, b: number, e = Easing.inOut(Easing.cubic)) => interpolate(t, [a, b], [0, 1], {...cl, easing: e});
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const mix3 = (a: V3, b: V3, k: number): V3 => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
const yawTo = (from: V3, to: V3) => Math.atan2(to[0] - from[0], to[2] - from[2]);
// deterministic pseudo-random
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- world layout ----------
const ROWS = 6, COLS = 9;
const SEATS = Array.from({length: ROWS * COLS}, (_, i) => {
  const r = Math.floor(i / COLS), c = i % COLS;
  return {i, r, c, x: -5 + c * 1.25 + (rnd(i) - 0.5) * 0.18, z: -3.2 + r * 1.1 + (rnd(i + 99) - 0.5) * 0.12};
});
const ME_I = 4 * COLS + 6;
const ME: V3 = [SEATS[ME_I].x, 0, SEATS[ME_I].z];
const STAGE_Y = 0.6, STAGE_Z = -7;
const PRINCIPAL_SPOT: V3 = [0, STAGE_Y, STAGE_Z];
const HEAD = 1.22;

// ---------- story state (absolute seconds, from words.json) ----------
const principalAt = (t: number): {p: V3; yaw: number} => {
  if (t < 2.5) return {p: PRINCIPAL_SPOT, yaw: 0}; // 'hook' cold open (0–1.7): already on stage, asking
  const k = ease(t, 4.45, 5.9, Easing.inOut(Easing.quad));
  const p = mix3([-5.4, STAGE_Y, STAGE_Z], PRINCIPAL_SPOT, k);
  const walking = k > 0 && k < 1;
  p[1] += walking ? Math.abs(Math.sin(t * 9)) * 0.05 : 0;
  let yaw = walking ? Math.PI / 2 : 0;
  if (t > 24.3) yaw = mix(0, yawTo(PRINCIPAL_SPOT, teacherAt(24.3).p), ease(t, 24.3, 24.7)); // turns to the shout
  if (t > 29.2) yaw = yawTo(PRINCIPAL_SPOT, ME); // "including that principal was looking at me"
  return {p, yaw};
};
const T_START: V3 = [6.3, 0, -4.2], T_MID: V3 = [6.3, 0, ME[2] - 0.55], T_END: V3 = [ME[0] - 0.62, 0, ME[2] - 0.55];
// walks in from the stage side down the aisle, then along the gap in front of me
function teacherAt(t: number): {p: V3; yaw: number; on: boolean} {
  const k1 = ease(t, 20.8, 21.75, Easing.in(Easing.quad)), k2 = ease(t, 21.75, 22.7, Easing.out(Easing.quad));
  const p = k2 > 0 ? mix3(T_MID, T_END, k2) : mix3(T_START, T_MID, k1);
  const walking = t > 20.8 && t < 22.7;
  p[1] += walking ? Math.abs(Math.sin(t * 9)) * 0.05 : 0;
  const yaw = t < 21.75 ? 0 : t < 22.7 ? -Math.PI / 2 : mix(-Math.PI / 2, Math.PI, ease(t, 22.7, 23.1));
  return {p, yaw, on: t >= 20.7};
}
// whole audience turns to look at me, a wave spreading out from me (27.4 → ~29.3)
const studentYaw = (s: (typeof SEATS)[number], t: number) => {
  const d = Math.hypot(s.x - ME[0], s.z - ME[2]);
  const k = ease(t, 27.45 + d * 0.11, 27.95 + d * 0.11, Easing.inOut(Easing.quad));
  if (k <= 0) return Math.PI;
  let target = yawTo([s.x, 0, s.z], ME);
  if (target < 0) target += Math.PI * 2; // turn the short way round from π
  return mix(Math.PI, target, k);
};
const auraAt = (t: number) => {
  if (t < 31.9) return 100;
  if (t < 34.85) return mix(100, -100, ease(t, 31.9, 33.45, Easing.in(Easing.quad)));
  return mix(-100, 100, ease(t, 34.85, 35.2, Easing.out(Easing.cubic)));
};

// ---------- camera per scene ----------
type Cam = {pos: V3; look: V3; fov: number};
// 9:16 cold-open poses: A = frame 0 (principal + question), B = ME in the spotlight. outro916 flies B → A so the video loops.
const H916_A: Cam = {pos: [0.7, 2.3, -2.9], look: [0.1, 1.75, -7], fov: 50};
const H916_B: Cam = {pos: [3.2, 6.0, 9.0], look: [2.0, 0.3, -2.5], fov: 62};
const camAt = (kind: GfxKind, t: number): Cam => {
  switch (kind) {
    case 'hook': { // cold open: tight on the question, pull back over the crowd and land on ME
      const k = ease(t, 0, 1.7, Easing.inOut(Easing.sin));
      return {pos: mix3([1.9, 2.7, -0.6], [3.4, 5.6, 8.2], k), look: mix3([0.3, 1.45, -7], [1.4, 0.7, -1.6], k), fov: mix(34, 44, k)};
    }
    case 'hook916': { // same cold open framed for a full 9:16 frame (0–2.47): stage on top, ME at the bottom
      const k = ease(t, 0, 2.3, Easing.out(Easing.cubic));
      return {pos: mix3(H916_A.pos, H916_B.pos, k), look: mix3(H916_A.look, H916_B.look, k), fov: mix(H916_A.fov, H916_B.fov, k)};
    }
    case 'outro916': { // loop ending (local time 0–1.933): hook916 in reverse, from ME back to the principal = frame 0 of the video
      const k = ease(t, 0.45, 1.933, Easing.inOut(Easing.cubic));
      return {pos: mix3(H916_B.pos, H916_A.pos, k), look: mix3(H916_B.look, H916_A.look, k), fov: mix(H916_B.fov, H916_A.fov, k)};
    }
    case 'assembly': {
      const k = ease(t, 4.3, 9.4, Easing.inOut(Easing.sin));
      return {pos: mix3([1.2, 6.2, 10.5], [0.5, 2.7, -1.4], k), look: mix3([0, 0.6, -3.5], [0, 1.5, -7], k), fov: mix(42, 36, k)};
    }
    case 'shout': {
      const k = ease(t, 20.8, 24.8, Easing.inOut(Easing.sin));
      return {pos: mix3([11.2, 3.6, 2.8], [9.0, 3.4, 3.4], k), look: mix3([3.0, 0.9, -0.8], [0.2, 1.1, -3.0], k), fov: 40};
    }
    case 'eyes': {
      const k = ease(t, 27.0, 30.8, Easing.inOut(Easing.sin));
      return {pos: mix3([-2.4, 3.6, -6.2], [1.4, 2.9, -2.2], k), look: mix3([1.0, 0.6, 0.6], [ME[0], 1.0, ME[2]], k), fov: 44};
    }
    case 'aura': {
      const a = mix(-0.75, 0.35, ease(t, 30.8, 35.25, Easing.inOut(Easing.sin)));
      const r = mix(3.8, 2.9, ease(t, 30.8, 35.25));
      const shake = t > 33.43 && t < 33.9 ? Math.sin(t * 90) * 0.05 * (1 - ease(t, 33.43, 33.9)) : 0;
      return {pos: [ME[0] + Math.sin(a) * r + shake, 3.2, ME[2] + Math.cos(a) * r], look: [ME[0], 0.95 + shake, ME[2]], fov: 42};
    }
    case 'biryani': {
      const a = mix(-0.5, 0.25, ease(t, 43.2, 46.0, Easing.inOut(Easing.sin)));
      return {pos: [Math.sin(a) * 2.9 - 0.55, 2.2, Math.cos(a) * 2.9], look: [-0.5, 0.95, 0], fov: 37};
    }
  }
};
const CameraRig: React.FC<{cam: Cam}> = ({cam}) => {
  const {camera} = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...cam.pos);
  c.fov = cam.fov;
  c.near = 0.1; c.far = 80;
  c.lookAt(...cam.look);
  c.updateProjectionMatrix();
  return null;
};
// same camera outside the canvas, to pin HTML labels on 3D points
const projector = (cam: Cam, W: number, H: number) => {
  const c = new THREE.PerspectiveCamera(cam.fov, W / H, 0.1, 80);
  c.position.set(...cam.pos);
  c.lookAt(...cam.look);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  return (p: V3) => {
    const v = new THREE.Vector3(...p).project(c);
    return {x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, front: v.z < 1};
  };
};

// ---------- 3D pieces ----------
const Person: React.FC<{p: V3; yaw: number; color: string; scale?: number; glow?: number; emissive?: string}> = ({p, yaw, color, scale = 1, glow = 0, emissive}) => (
  <group position={p} rotation={[0, yaw, 0]} scale={scale}>
    <mesh position={[0, 0.55, 0]}>
      <capsuleGeometry args={[0.22, 0.5, 6, 16]} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} emissive={emissive ?? color} emissiveIntensity={glow} />
    </mesh>
    <mesh position={[0, HEAD, 0]}>
      <sphereGeometry args={[0.2, 24, 16]} />
      <meshStandardMaterial color={color} roughness={0.5} emissive={emissive ?? color} emissiveIntensity={glow} />
    </mesh>
    {[-0.07, 0.07].map((x) => (
      <mesh key={x} position={[x, HEAD + 0.03, 0.18]}>
        <sphereGeometry args={[0.028, 10, 8]} />
        <meshStandardMaterial color="#0b0b0e" roughness={0.3} />
      </mesh>
    ))}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
      <circleGeometry args={[0.36, 24]} />
      <meshBasicMaterial color="black" transparent opacity={0.45} />
    </mesh>
  </group>
);

const Hall: React.FC<{t: number; meGlow: number; dimOthers?: number; teacher?: boolean}> = ({t, meGlow, dimOthers = 0, teacher = false}) => {
  const pr = principalAt(t);
  const te = teacherAt(t);
  return (
    <>
      <color attach="background" args={['#07080b']} />
      <fog attach="fog" args={['#07080b', 9, 30]} />
      <ambientLight intensity={0.32} />
      <directionalLight position={[4, 9, 6]} intensity={1.1} color="#dfe6ff" />
      <pointLight position={[0, 4.2, -4.6]} intensity={28} distance={14} color="#ffd8a0" />
      <pointLight position={[-7, 3, 3]} intensity={10} distance={14} color="#7aa7ff" />
      {/* floor + stage + back wall + projector screen */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#111319" roughness={0.9} /></mesh>
      <mesh position={[0, STAGE_Y / 2, -7.4]}><boxGeometry args={[10, STAGE_Y, 3.4]} /><meshStandardMaterial color="#23262f" roughness={0.7} /></mesh>
      <mesh position={[0, STAGE_Y - 0.04, -5.7]}><boxGeometry args={[10, 0.05, 0.05]} /><meshBasicMaterial color="#ffcf8a" /></mesh>
      <mesh position={[0, 3, -9.2]}><planeGeometry args={[16, 6]} /><meshStandardMaterial color="#14161c" roughness={0.95} /></mesh>
      <mesh position={[0, 2.6, -9.15]}><planeGeometry args={[5.6, 2.4]} /><meshBasicMaterial color="#2a2c33" /></mesh>
      {/* mic stand */}
      <mesh position={[0, STAGE_Y + 0.55, STAGE_Z + 0.42]}><cylinderGeometry args={[0.015, 0.015, 1.1, 8]} /><meshStandardMaterial color="#9aa0aa" metalness={0.8} roughness={0.3} /></mesh>
      <mesh position={[0, STAGE_Y + 1.12, STAGE_Z + 0.42]}><sphereGeometry args={[0.05, 12, 10]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      {/* audience */}
      {SEATS.map((s) => s.i === ME_I ? null : (
        <Person key={s.i} p={[s.x, 0, s.z]} yaw={studentYaw(s, t)}
          color={dimOthers > 0 ? '#3a3f4a' : ['#6b7280', '#737b88', '#646b77'][s.i % 3]} />
      ))}
      <Person p={ME} yaw={studentYaw(SEATS[ME_I], 0)} color="#ffb347" glow={meGlow} emissive="#ff9a2e" />
      <Person p={pr.p} yaw={pr.yaw} color="#f1ddb0" scale={1.15} glow={0.12} />
      {teacher && te.on && <Person p={te.p} yaw={te.yaw} color="#43c6b6" scale={1.1} glow={0.18} />}
    </>
  );
};

// a fake volumetric spotlight cone from above
const Spot: React.FC<{p: V3; k: number; color?: string}> = ({p, k, color = '#ffd9a0'}) => k <= 0 ? null : (
  <>
    <mesh position={[p[0], 3.2, p[2]]}>
      <coneGeometry args={[0.95, 6.4, 40, 1, true]} />
      <meshBasicMaterial color={color} transparent opacity={0.13 * k} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[p[0], 0.01, p[2]]}>
      <circleGeometry args={[0.95, 40]} />
      <meshBasicMaterial color={color} transparent opacity={0.35 * k} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
    <pointLight position={[p[0], 2.6, p[2] + 0.4]} intensity={9 * k} distance={5} color={color} />
  </>
);

// expanding sound rings flying from the teacher to the principal ("shouted")
const ShoutRings: React.FC<{t: number}> = ({t}) => {
  const from: V3 = [T_END[0], HEAD * 1.1, T_END[2] - 0.1];
  const to: V3 = [PRINCIPAL_SPOT[0], STAGE_Y + HEAD * 1.15, PRINCIPAL_SPOT[2]];
  const dir = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
  return (
    <>
      {[23.72, 23.92, 24.12, 24.32].map((t0, i) => {
        const k = interpolate(t, [t0, t0 + 0.85], [0, 1], cl);
        if (k <= 0 || k >= 1) return null;
        return (
          <mesh key={i} position={mix3(from, to, k)} quaternion={q} scale={0.25 + k * 1.4}>
            <torusGeometry args={[0.5, 0.035, 10, 48]} />
            <meshBasicMaterial color="#e9fffb" transparent opacity={(1 - k) * 0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        );
      })}
    </>
  );
};

const lineObj = (a: V3, b: V3, color: string, opacity: number) => {
  const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]);
  return new THREE.Line(g, new THREE.LineBasicMaterial({color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false}));
};
// gaze lines from many heads to mine ("looking at me")
const GAZERS = SEATS.filter((s) => s.i !== ME_I && rnd(s.i + 7) < 0.45);
const GazeLines: React.FC<{t: number}> = ({t}) => {
  const meHead: V3 = [ME[0], HEAD, ME[2]];
  const lines = GAZERS.map((s, n) => {
    const k = ease(t, 29.9 + n * 0.015, 30.35 + n * 0.015, Easing.out(Easing.cubic));
    if (k <= 0) return null;
    const a: V3 = [s.x, HEAD + 0.03, s.z];
    return <primitive key={s.i} object={lineObj(a, mix3(a, meHead, k), '#ffd27a', 0.95)} />;
  });
  const pr = principalAt(t);
  const kp = ease(t, 29.4, 29.9);
  const pa: V3 = [pr.p[0], pr.p[1] + HEAD * 1.15, pr.p[2]];
  return (
    <>
      {lines}
      {kp > 0 && <primitive object={lineObj(pa, mix3(pa, meHead, kp), '#fff1d0', 0.8)} />}
    </>
  );
};

const auraColor = (v: number) => new THREE.Color('#ff2d2d').lerp(new THREE.Color('#3dff8a'), (v + 100) / 200);
const Aura: React.FC<{t: number}> = ({t}) => {
  const v = auraAt(t);
  const col = auraColor(v);
  const n = Math.round(48 * ((v + 100) / 200));
  const burst = interpolate(t, [34.95, 35.5], [0, 1], cl);
  return (
    <>
      <mesh position={[ME[0], 1.05, ME[2]]}>
        <cylinderGeometry args={[0.62, 0.62, 2.3, 40, 1, true]} />
        <meshBasicMaterial color={col} transparent opacity={0.16 + 0.1 * Math.abs(v) / 100} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ME[0], 0.02, ME[2]]}>
        <ringGeometry args={[0.62, 0.78, 48]} />
        <meshBasicMaterial color={col} transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {Array.from({length: n}, (_, i) => {
        const a = (i / 48) * Math.PI * 2 + t * (1.2 + rnd(i) * 0.8);
        const y = 0.2 + rnd(i + 3) * 1.9 + Math.sin(t * 2 + i) * 0.08;
        const r = 0.7 + rnd(i + 5) * 0.25;
        return (
          <mesh key={i} position={[ME[0] + Math.cos(a) * r, y, ME[2] + Math.sin(a) * r]}>
            <sphereGeometry args={[0.03, 8, 6]} />
            <meshBasicMaterial color={col} />
          </mesh>
        );
      })}
      {burst > 0 && burst < 1 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ME[0], 0.05, ME[2]]} scale={1 + burst * 5}>
          <ringGeometry args={[0.6, 0.7, 64]} />
          <meshBasicMaterial color="#3dff8a" transparent opacity={1 - burst} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      )}
      <pointLight position={[ME[0], 1.4, ME[2] + 0.6]} intensity={6} distance={4} color={col} />
    </>
  );
};

// ---------- biryani ----------
const Bowl: React.FC<{t: number}> = ({t}) => {
  const lathe = useMemo(() => {
    const pts = [[0, 0], [0.5, 0], [0.62, 0.05], [0.95, 0.32], [1.12, 0.62], [1.16, 0.66], [1.08, 0.66], [0.9, 0.38], [0.55, 0.14], [0, 0.12]]
      .map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  const rice = useMemo(() => {
    const N = 2200;
    const geo = new THREE.CapsuleGeometry(0.014, 0.03, 3, 6);
    const mat = new THREE.MeshStandardMaterial({roughness: 0.6});
    const m = new THREE.InstancedMesh(geo, mat, N);
    const o = new THREE.Object3D();
    const cols = ['#fbf5e8', '#fbf5e8', '#f8eedb', '#fbf5e8', '#f5e3bf', '#fbf5e8', '#f2b450', '#fbf5e8', '#f8eedb', '#e89a3a'].map((c) => new THREE.Color(c));
    for (let i = 0; i < N; i++) {
      const r = Math.sqrt(rnd(i)) * 0.98, a = rnd(i + 1000) * Math.PI * 2;
      const y = 0.66 + 0.32 * (1 - (r / 1.0) ** 2) + rnd(i + 2000) * 0.03;
      o.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      o.rotation.set(rnd(i + 3) * 3, rnd(i + 4) * 3, rnd(i + 5) * 3);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, cols[i % cols.length]);
    }
    return m;
  }, []);
  const puff = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d')!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  const rise = interpolate(t, [43.2, 43.75], [-1.2, 0], {...cl, easing: Easing.out(Easing.back(1.4))});
  const spin = (t - 43.2) * 0.35;
  return (
    <>
      <color attach="background" args={['#0a0807']} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} color="#fff1dc" />
      <pointLight position={[-2.5, 2, 2]} intensity={10} distance={8} color="#ff9c4a" />
      <pointLight position={[1.5, 1.2, -2]} intensity={4} distance={6} color="#ffcf9a" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}><circleGeometry args={[6, 64]} /><meshStandardMaterial color="#14100d" roughness={0.95} /></mesh>
      <group position={[0, rise, 0]} rotation={[0, spin, 0]}>
        <mesh geometry={lathe}><meshStandardMaterial color="#1c1b20" roughness={0.35} metalness={0.2} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0.66, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.12, 0.035, 12, 64]} /><meshStandardMaterial color="#d9a441" metalness={0.9} roughness={0.25} /></mesh>
        <primitive object={rice} />
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos(i * 1.7) * 0.42, 0.93, Math.sin(i * 1.7) * 0.42]} scale={[1, 0.75, 1]}>
            <sphereGeometry args={[0.13, 16, 12]} />
            <meshStandardMaterial color="#8a4b2a" roughness={0.7} />
          </mesh>
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={`l${i}`} position={[Math.cos(i * 2.3 + 0.4) * 0.6, 0.95, Math.sin(i * 2.3 + 0.4) * 0.6]} rotation={[0.3, i, 0.2]}>
            <boxGeometry args={[0.09, 0.008, 0.05]} />
            <meshStandardMaterial color="#3f8f2e" roughness={0.6} />
          </mesh>
        ))}
      </group>
      {/* steam: soft radial sprites */}
      {Array.from({length: 22}, (_, i) => {
        const life = 2.2, ph = (t - 43.4 + rnd(i) * life) % life;
        if (t < 43.5 || ph < 0) return null;
        const k = ph / life;
        return (
          <sprite key={`s${i}`} position={[(rnd(i + 9) - 0.5) * 1.0 + Math.sin(t * 1.3 + i) * 0.15, 1.0 + k * 1.6, (rnd(i + 19) - 0.5) * 1.0]} scale={0.35 + k * 0.9}>
            <spriteMaterial map={puff} transparent opacity={0.22 * Math.sin(k * Math.PI)} depthWrite={false} />
          </sprite>
        );
      })}
    </>
  );
};

// ---------- HTML overlays pinned to 3D points ----------
const Tag: React.FC<{x: number; y: number; text: string; k: number; accent?: string}> = ({x, y, text, k, accent = 'rgba(255,255,255,0.35)'}) => {
  const {height: H} = useVideoConfig();
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-100%) translateY(${(1 - k) * 12}px)`, opacity: k,
      display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{fontFamily: tight, fontWeight: 700, fontSize: 0.024 * H, letterSpacing: '0.12em', color: 'white', whiteSpace: 'nowrap',
        padding: `${0.008 * H}px ${0.016 * H}px`, borderRadius: 999, background: 'rgba(8,9,12,0.62)', border: `1.5px solid ${accent}`}}>{text}</div>
      <div style={{width: 1.5, height: 0.035 * H, background: accent}} />
    </div>
  );
};
const Bubble: React.FC<{x: number; y: number; text: string; k: number; side?: 'left' | 'right' | 'center'}> = ({x, y, text, k, side = 'right'}) => {
  const {height: H, width: W} = useVideoConfig();
  if (k <= 0) return null;
  const s = interpolate(k, [0, 0.6, 1], [0.6, 1.06, 1]);
  if (side === 'center') // portrait: big, centred above the speaker, wraps to two lines
    return (
      <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-100%) scale(${s})`, transformOrigin: 'bottom center', opacity: Math.min(1, k * 2)}}>
        <div style={{fontFamily: tight, fontWeight: 800, fontStyle: 'italic', fontSize: 0.088 * W, lineHeight: 1.02, letterSpacing: '-0.025em', color: '#0b0b0e',
          background: 'white', borderRadius: 0.05 * W, padding: `${0.03 * W}px ${0.055 * W}px`, width: 0.74 * W, textAlign: 'center',
          boxShadow: '0 16px 60px rgba(0,0,0,0.55)'}}>{text}</div>
      </div>
    );
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${side === 'right' ? '0%' : '-100%'},-100%) scale(${s})`,
      transformOrigin: side === 'right' ? 'bottom left' : 'bottom right', opacity: Math.min(1, k * 2)}}>
      <div style={{fontFamily: tight, fontWeight: 800, fontStyle: 'italic', fontSize: 0.042 * H, letterSpacing: '-0.02em', color: '#0b0b0e',
        background: 'white', borderRadius: 0.03 * H, padding: `${0.016 * H}px ${0.026 * H}px`, whiteSpace: 'nowrap',
        boxShadow: '0 10px 40px rgba(0,0,0,0.45)'}}>{text}</div>
    </div>
  );
};
const AuraMeter: React.FC<{t: number}> = ({t}) => {
  const {width: W, height: H} = useVideoConfig();
  const v = auraAt(t);
  const col = '#' + auraColor(v).getHexString();
  const k = ease(t, 30.85, 31.2);
  const shake = t > 33.43 && t < 33.9 ? Math.sin(t * 80) * 8 * (1 - ease(t, 33.43, 33.9)) : 0;
  const num = Math.round(v);
  return (
    <div style={{position: 'absolute', left: 0.66 * W, top: 0.2 * H, width: 0.22 * W, opacity: k, transform: `translateX(${shake}px)`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        <span style={{fontFamily: tight, fontWeight: 800, fontStyle: 'italic', fontSize: 0.05 * H, color: 'white', letterSpacing: '-0.02em'}}>AURA</span>
        <span style={{fontFamily: tight, fontWeight: 800, fontSize: 0.075 * H, color: col, letterSpacing: '-0.04em',
          textShadow: `0 0 24px ${col}`}}>{num > 0 ? `+${num}` : num < 0 ? `−${-num}` : '0'}</span>
      </div>
      <div style={{height: 0.018 * H, borderRadius: 99, background: 'rgba(255,255,255,0.12)', overflow: 'hidden', marginTop: 0.01 * H}}>
        <div style={{width: `${(v + 100) / 2}%`, height: '100%', background: col, boxShadow: `0 0 18px ${col}`}} />
      </div>
    </div>
  );
};

// ---------- scene ----------
export const SchoolGfx: React.FC<{kind: GfxKind; start: number}> = ({kind, start}) => {
  const {width: W, height: H, fps} = useVideoConfig();
  const t = start + useCurrentFrame() / fps;
  const cam = camAt(kind, t);
  const proj = projector(cam, W, H);
  const isHook = kind === 'hook' || kind === 'hook916';
  const isOutro = kind === 'outro916';
  const tw = isOutro ? 0 : t; // outro shows the hall as it was at the start (audience facing the stage)
  const outK = isOutro ? 1 - ease(t, 0.6, 1.2) : 0; // spotlight/ME fade out as we leave
  const meGlow = isOutro ? mix(0.05, 0.6, outK) : isHook ? mix(0.05, 0.6, ease(t, 0.8, 1.3)) : kind === 'assembly' ? 0.05 : kind === 'shout' ? 0.35 : 0.6;
  const fadeIn = isHook || isOutro ? 1 : ease(t, start, start + 0.12); // hook: full picture on frame 0
  const pr = principalAt(tw), te = teacherAt(tw);
  const above = (p: V3, h = HEAD + 0.45) => proj([p[0], p[1] + h, p[2]]);
  const overlays: React.ReactNode[] = [];
  if (kind === 'assembly') {
    const a = above(pr.p, HEAD * 1.15 + 0.5);
    overlays.push(<Tag key="pt" x={a.x} y={a.y} text="PRINCIPAL" k={ease(t, 5.0, 5.3)} accent="#f1ddb0" />);
    const b = proj([pr.p[0] + 0.35, pr.p[1] + HEAD * 1.15 + 0.2, pr.p[2]]);
    overlays.push(<Bubble key="pb" x={b.x} y={b.y} text="Anyone know video editing?" k={ease(t, 7.05, 7.35)} />);
  }
  if (kind === 'hook') {
    const b = proj([pr.p[0] + 0.35, pr.p[1] + HEAD * 1.15 + 0.2, pr.p[2]]);
    overlays.push(<Bubble key="pb" x={b.x} y={b.y} text="Anyone know video editing?" k={1} />);
  }
  if (kind === 'hook916') {
    const b = proj([pr.p[0], pr.p[1] + HEAD * 1.15 + 0.45, pr.p[2]]);
    overlays.push(<Bubble key="pb" x={b.x} y={b.y} text="Anyone know video editing?" k={1} side="center" />);
  }
  if (isOutro) {
    const b = proj([pr.p[0], pr.p[1] + HEAD * 1.15 + 0.45, pr.p[2]]);
    overlays.push(<Bubble key="pb" x={b.x} y={b.y} text="Anyone know video editing?" k={ease(t, 1.25, 1.6)} side="center" />);
    const m = above(ME);
    overlays.push(<Tag key="me" x={m.x} y={m.y} text="ME" k={outK} accent="#ffb347" />);
  }
  if (isHook) {
    const m = above(ME);
    overlays.push(<Tag key="me" x={m.x} y={m.y} text="ME" k={ease(t, 0.85, 1.15)} accent="#ffb347" />);
  }
  if (kind === 'shout' || kind === 'eyes' || kind === 'aura') {
    const m = above(ME);
    overlays.push(<Tag key="me" x={m.x} y={m.y} text="ME" k={ease(t, start + 0.15, start + 0.45)} accent="#ffb347" />);
  }
  if (kind === 'shout') {
    const a = above(te.p, HEAD * 1.1 + 0.95);
    overlays.push(<Tag key="tt" x={a.x} y={a.y} text="ECONOMICS TEACHER" k={ease(t, 21.6, 21.9)} accent="#43c6b6" />);
    const b = proj([te.p[0] - 0.3, te.p[1] + HEAD * 1.1 + 0.15, te.p[2]]);
    overlays.push(<Bubble key="tb" x={b.x} y={b.y} text="He will do it!" k={ease(t, 23.72, 23.95)} side="left" />);
  }
  if (kind === 'eyes') {
    const a = above(pr.p, HEAD * 1.15 + 0.45);
    overlays.push(<Tag key="pt" x={a.x} y={a.y} text="PRINCIPAL" k={ease(t, 29.3, 29.6)} accent="#f1ddb0" />);
  }
  return (
    <AbsoluteFill style={{opacity: fadeIn}}>
      <ThreeCanvas width={W} height={H} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
        <CameraRig cam={cam} />
        {kind === 'biryani' ? <Bowl t={t} /> : (
          <>
            <Hall t={tw} meGlow={meGlow} teacher={kind === 'shout'} />
            {kind === 'shout' && <ShoutRings t={t} />}
            {isHook && <Spot p={ME} k={ease(t, 0.8, 1.3)} />}
            {isOutro && <Spot p={ME} k={outK} />}
            {kind === 'eyes' && <><Spot p={ME} k={ease(t, 28.2, 29.4)} /><GazeLines t={t} /></>}
            {kind === 'aura' && <><Spot p={ME} k={1} /><Aura t={t} /></>}
          </>
        )}
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
      {overlays}
      {kind === 'aura' && <AuraMeter t={t} />}
    </AbsoluteFill>
  );
};

// standalone preview composition: all scenes back to back (for QA renders)
export const GFX_TEST: {kind: GfxKind; start: number; end: number}[] = [
  {kind: 'assembly', start: 4.3, end: 9.35}, {kind: 'shout', start: 20.8, end: 24.8}, {kind: 'eyes', start: 27.0, end: 30.8},
  {kind: 'aura', start: 30.8, end: 35.25}, {kind: 'biryani', start: 43.2, end: 46.0},
];
export const SchoolGfxTest: React.FC = () => {
  const {fps} = useVideoConfig();
  let from = 0;
  return (
    <AbsoluteFill style={{background: 'black'}}>
      {GFX_TEST.map((g) => {
        const d = Math.round((g.end - g.start) * fps), f0 = from;
        from += d;
        return <Sequence key={g.kind} from={f0} durationInFrames={d}><SchoolGfx kind={g.kind} start={g.start} /></Sequence>;
      })}
    </AbsoluteFill>
  );
};
