// Premium product-style 3D (user 2026-10-19 v2: "less cartoonish, more depth, cleaner"). Only clean, physical objects
// (glass, gold, metal) lit by a studio environment map (RoomEnvironment → PMREM) with ACES tone mapping, a warm key,
// a cool rim and a soft backlight halo. Shots cut in hard (no fade over the talking head).
// Kinds: 'hourglass' (glass + gold frame, last grains falling), 'bullion' (gold bars stamped with labels, stacking).
// Props: start/end = absolute cut-timeline seconds; cues = absolute word times (pipeline.py long).
import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

type V3 = [number, number, number];
const ease = (t: number, a: number, b: number, e: (x: number) => number = Easing.inOut(Easing.cubic)) =>
  b <= a ? (t >= a ? 1 : 0) : e(Math.min(1, Math.max(0, (t - a) / (b - a))));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const mix3 = (a: V3, b: V3, k: number): V3 => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type Cam = {pos: V3; look: V3; fov: number};
const Rig: React.FC<{cam: Cam; exposure?: number; env?: number}> = ({cam, exposure = 1.05, env = 0.9}) => {
  const {camera, gl, scene} = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.035).texture;
    pm.dispose();
  }, [gl, scene]);
  scene.environmentIntensity = env;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = exposure;
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...cam.pos);
  c.fov = cam.fov; c.near = 0.1; c.far = 100;
  c.lookAt(...cam.look);
  c.updateProjectionMatrix();
  return null;
};
const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
const radial = (stops: [number, string][]) => canvasTex(256, 256, (g) => {
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  stops.forEach(([o, c]) => gr.addColorStop(o, c));
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
});

// studio: dark glossy floor, backlight halo, warm key + cool rim
const Studio: React.FC<{halo: V3; haloSize: number; haloK: number; floorY: number}> = ({halo, haloSize, haloK, floorY}) => {
  const haloTex = useMemo(() => radial([[0, 'rgba(120,170,255,0.9)'], [0.35, 'rgba(60,110,255,0.35)'], [1, 'rgba(0,0,0,0)']]), []);
  const pool = useMemo(() => radial([[0, 'rgba(255,220,170,0.55)'], [1, 'rgba(255,220,170,0)']]), []);
  return (
    <>
      <color attach="background" args={['#03050b']} />
      <fog attach="fog" args={['#03050b', 9, 26]} />
      <mesh position={halo}>
        <planeGeometry args={[haloSize, haloSize]} />
        <meshBasicMaterial map={haloTex} transparent opacity={haloK} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#010204" roughness={0.88} metalness={0} envMapIntensity={0.03} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY + 0.005, 0.4]}>
        <planeGeometry args={[6, 6]} />
        <meshBasicMaterial map={pool} transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <ambientLight intensity={0.08} color="#9fb4ff" />
      <spotLight position={[3.5, 7, 5]} angle={0.42} penumbra={0.9} intensity={170} distance={30} decay={1.7} color="#ffd9a8" />
      <directionalLight position={[-6, 3, -5]} intensity={2.2} color="#7aa6ff" />
      <directionalLight position={[5, 2, -4]} intensity={0.8} color="#a9cfff" />
    </>
  );
};

// HTML layers that sell depth: out-of-focus dust in front, vignette, grain-free gradient
const DepthOverlay: React.FC<{t: number; dust?: number}> = ({t, dust = 26}) => {
  const {width: W, height: H} = useVideoConfig();
  return (
    <>
      {Array.from({length: dust}, (_, i) => {
        const d = rnd(i * 1.7);
        const sz = 6 + d * 34;
        const x = (rnd(i) * 1.2 - 0.1) * W + Math.sin(t * 0.3 + i) * 30;
        const y = (rnd(i + 3) * 1.1 - 0.05) * H - t * (8 + d * 22);
        const yy = ((y % H) + H) % H;
        return <div key={i} style={{position: 'absolute', left: x, top: yy, width: sz, height: sz, borderRadius: '50%',
          background: d > 0.6 ? 'rgba(255,214,150,0.18)' : 'rgba(170,200,255,0.14)', filter: `blur(${2 + d * 7}px)`}} />;
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 70% at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.72) 100%)'}} />
    </>
  );
};

// ---------- hourglass ----------
const R = (u: number) => 0.055 + 0.74 * Math.pow(Math.sin(Math.PI * Math.min(1, u) * 0.82), 0.85); // u = |y| / 1.5
const glassPts = (() => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 160; i++) {
    const y = -1.5 + (3 * i) / 160;
    pts.push(new THREE.Vector2(R(Math.abs(y) / 1.5), y));
  }
  return pts;
})();
const sandTop = (level: number) => { // sand left in the upper bulb, 0..1 of a full bulb, with a funnel dip
  const ytop = 0.05 + level * 1.25;
  const pts: THREE.Vector2[] = [new THREE.Vector2(0.001, 0.05)];
  for (let i = 1; i <= 40; i++) {
    const y = 0.05 + ((ytop - 0.05) * i) / 40;
    pts.push(new THREE.Vector2(R(y / 1.5) * 0.93, y));
  }
  pts.push(new THREE.Vector2(0.001, Math.max(0.06, ytop - 0.22 * Math.min(1, level * 3))));
  return pts;
};
const pile = (k: number) => { // mound in the lower bulb, k 0..1
  const base = -1.42, h = 0.18 + 0.75 * k;
  const rb = R(1.42 / 1.5) * 0.93;
  const pts: THREE.Vector2[] = [new THREE.Vector2(0.001, base)];
  for (let i = 0; i <= 30; i++) {
    const s = i / 30;
    const y = base + h * s;
    const rr = Math.min(R(Math.abs(y) / 1.5) * 0.93, rb * Math.pow(1 - s, 1.25) + 0.02);
    pts.push(new THREE.Vector2(Math.max(0.001, rr), y));
  }
  return pts;
};
const discPts = (r: number, h: number) => {
  const pts: THREE.Vector2[] = [new THREE.Vector2(0.001, -h / 2)];
  const bev = 0.05;
  for (let i = 0; i <= 8; i++) {
    const a = -Math.PI / 2 + (i / 8) * Math.PI;
    pts.push(new THREE.Vector2(r - bev + Math.cos(a) * bev, Math.sin(a) * (h / 2)));
  }
  pts.push(new THREE.Vector2(0.001, h / 2));
  return pts;
};
const goldMat = {color: '#f2c66e', metalness: 1, roughness: 0.16, clearcoat: 0.5, clearcoatRoughness: 0.1, envMapIntensity: 1.4} as const;
const Hourglass: React.FC<{t: number; s: number; cue: number}> = ({t, s, cue}) => {
  const level = mix(0.16, 0, ease(t, s, cue, (x) => x));
  const lv = Math.round(level * 400) / 400;
  const topGeo = useMemo(() => new THREE.LatheGeometry(sandTop(lv), 96), [lv]);
  const pk = Math.round((1 - level / 0.16) * 100) / 100;
  const pileGeo = useMemo(() => new THREE.LatheGeometry(pile(0.75 + 0.25 * pk), 96), [pk]);
  const flowing = level > 0.002;
  const pileTop = -1.42 + 0.18 + 0.75 * (0.75 + 0.25 * pk);
  return (
    <group rotation={[0, t * 0.15, 0]}>
      <mesh>
        <latheGeometry args={[glassPts, 128]} />
        <meshPhysicalMaterial color="#ffffff" transmission={1} thickness={0.35} roughness={0.03} ior={1.48} metalness={0}
          clearcoat={1} clearcoatRoughness={0.03} specularIntensity={1} attenuationColor="#dcebff" attenuationDistance={2.5} envMapIntensity={1.4} />
      </mesh>
      {level > 0.002 && <mesh geometry={topGeo}><meshStandardMaterial color="#b98a46" roughness={0.95} /></mesh>}
      <mesh geometry={pileGeo}><meshStandardMaterial color="#b98a46" roughness={0.95} /></mesh>
      {flowing && (
        <mesh position={[0, (0.05 + pileTop) / 2, 0]}>
          <cylinderGeometry args={[0.011, 0.011, 0.05 - pileTop, 8]} />
          <meshStandardMaterial color="#e8bf72" roughness={0.8} emissive="#6b4a12" emissiveIntensity={0.4} />
        </mesh>
      )}
      {flowing && Array.from({length: 18}, (_, i) => {
        const f = (t * 1.9 + rnd(i)) % 1;
        const y = mix(0.03, pileTop, f);
        return <mesh key={i} position={[(rnd(i + 9) - 0.5) * 0.03, y, (rnd(i + 4) - 0.5) * 0.03]}>
          <sphereGeometry args={[0.012, 6, 6]} /><meshStandardMaterial color="#f0c97e" roughness={0.7} /></mesh>;
      })}
      {[1.62, -1.62].map((y) => (
        <mesh key={y} position={[0, y, 0]}><latheGeometry args={[discPts(1.0, 0.2), 96]} /><meshPhysicalMaterial {...goldMat} /></mesh>
      ))}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.5;
        return <mesh key={i} position={[Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9]}>
          <cylinderGeometry args={[0.04, 0.04, 3.1, 24]} /><meshPhysicalMaterial {...goldMat} /></mesh>;
      })}
    </group>
  );
};

// ---------- gold bullion ----------
const barGeo = (() => {
  const s = new THREE.Shape(); // cross-section (z, y): trapezoid
  s.moveTo(-0.4, 0); s.lineTo(0.4, 0); s.lineTo(0.31, 0.3); s.lineTo(-0.31, 0.3); s.lineTo(-0.4, 0);
  const g = new THREE.ExtrudeGeometry(s, {depth: 1.5, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: 4, curveSegments: 4});
  g.translate(0, 0, -0.75);
  g.rotateY(Math.PI / 2); // length along x
  return g;
})();
const stampTex = (label: string) => canvasTex(1024, 200, (g) => {
  g.clearRect(0, 0, 1024, 200);
  g.fillStyle = 'white';
  g.font = '800 132px "Sora", "Helvetica Neue", Arial';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(label, 512, 108);
});
const Bar: React.FC<{label: string; p: V3; rot: V3}> = ({label, p, rot}) => {
  const tex = useMemo(() => stampTex(label), [label]);
  return (
    <group position={p} rotation={rot}>
      <mesh geometry={barGeo}><meshPhysicalMaterial {...goldMat} roughness={0.13} /></mesh>
      <mesh position={[0, 0.155, 0.385]} rotation={[-0.29, 0, 0]}>
        <planeGeometry args={[1.32, 0.255]} />
        <meshStandardMaterial alphaMap={tex} transparent color="#5a3a0a" metalness={0.85} roughness={0.5} depthWrite={false}
          polygonOffset polygonOffsetFactor={-2} />
      </mesh>
    </group>
  );
};
const SLOTS: {label: string; at: V3}[] = [
  {label: 'SLEEP', at: [-1.72, 0, 0]}, {label: 'ROOM', at: [0, 0, 0]}, {label: 'BODY', at: [1.72, 0, 0]},
  {label: 'MIND', at: [-0.86, 0.335, -0.12]}, {label: 'PHONE', at: [0.86, 0.335, -0.12]},
];

// ---------- scene ----------
export const PremiumGfx: React.FC<{kind: string; start: number; end?: number; cues?: number[]}> = ({kind, start, end, cues = []}) => {
  const {width: W, height: H, fps} = useVideoConfig();
  const t = start + useCurrentFrame() / fps;
  const e = end ?? start + 4;
  const d = e - start;
  const cue = (i: number, frac: number) => cues[i] ?? start + d * frac;
  const k = ease(t, start, e, Easing.inOut(Easing.sin));
  if (kind === 'hourglass') {
    const c0 = cue(0, 0.65);
    const cam: Cam = {pos: mix3([1.3, 0.3, 7.9], [0.4, 0.12, 6.5], k), look: [0, 0.0, 0], fov: 32};
    return (
      <AbsoluteFill style={{background: '#03050b'}}>
        <ThreeCanvas width={W} height={H} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
          <Rig cam={cam} />
          <Studio halo={[0, 0.3, -2.2]} haloSize={7} haloK={0.75} floorY={-1.73} />
          <Hourglass t={t} s={start} cue={c0} />
        </ThreeCanvas>
        <DepthOverlay t={t} />
      </AbsoluteFill>
    );
  }
  // bullion: bars land on cues[1..5]; cues[0] = title word
  const lands = SLOTS.map((_, i) => cue(i + 1, 0.25 + i * 0.13));
  const last = lands[lands.length - 1];
  const glow = ease(t, last + 0.15, last + 0.7);
  const cam: Cam = {pos: mix3([0.5, 1.2, 6.3], [0.12, 1.0, 5.2], k), look: [0, 0.3, 0], fov: 35};
  return (
    <AbsoluteFill style={{background: '#03050b'}}>
      <ThreeCanvas width={W} height={H} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
        <Rig cam={cam} exposure={1.0 + glow * 0.15} />
        <Studio halo={[0, 0.8, -3]} haloSize={9} haloK={0.55 + glow * 0.3} floorY={-0.035} />
        {SLOTS.map((sl, i) => {
          const land = lands[i];
          const kk = ease(t, land - 0.42, land, Easing.in(Easing.quad));
          if (kk <= 0) return null;
          const from: V3 = [sl.at[0] * 1.3, sl.at[1] + 3.2, sl.at[2] + 1.6];
          const p = mix3(from, sl.at, kk);
          p[1] += Math.sin(kk * Math.PI) * 0.35;
          const settle = t > land ? Math.exp(-(t - land) * 10) * Math.sin((t - land) * 30) * 0.03 : 0;
          p[1] += Math.abs(settle);
          const r = (1 - kk) * (i % 2 ? 0.5 : -0.5);
          return <Bar key={sl.label} label={sl.label} p={p} rot={[r * 0.4, r, r * 0.2]} />;
        })}
        <pointLight position={[0, 1.6, 2.2]} intensity={2 + glow * 10} distance={8} color="#ffcf7a" />
      </ThreeCanvas>
      <DepthOverlay t={t} dust={18} />
    </AbsoluteFill>
  );
};

const TEST: {kind: string; d: number}[] = [{kind: 'hourglass', d: 2.6}, {kind: 'bullion', d: 5.4}];
export const PremiumGfxTest: React.FC = () => {
  const {fps} = useVideoConfig();
  let from = 0;
  return (
    <AbsoluteFill style={{background: 'black'}}>
      {TEST.map((g) => {
        const n = Math.round(g.d * fps), f0 = from;
        from += n;
        return <Sequence key={g.kind} from={f0} durationInFrames={n}><PremiumGfx kind={g.kind} start={0} end={g.d} /></Sequence>;
      })}
    </AbsoluteFill>
  );
};
