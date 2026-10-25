// 3D explanation scenes for "Winter Glow Up" (jobs/winter-glow-up, long). Look A recipe (long-style.md §7): navy fog,
// warm key spotlight with a visible cone, cool rim light, gold / glass materials, one slow camera move per shot.
// Props: start/end = absolute cut-timeline seconds of the shot; cues = absolute word times (pipeline.py long), each
// scene falls back to fractions of its duration when a cue is missing (WinterGfxTest uses that).
import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {loadFont as loadSora} from '@remotion/google-fonts/Sora';

const {fontFamily: sora} = loadSora('normal', {weights: ['700', '800'], subsets: ['latin']});

type V3 = [number, number, number];
export type WinterKind = 'hourglass' | 'globe' | 'battery' | 'brain' | 'phone' | 'bricks';

const ease = (t: number, a: number, b: number, e: (x: number) => number = Easing.inOut(Easing.cubic)) =>
  b <= a ? (t >= a ? 1 : 0) : e(Math.min(1, Math.max(0, (t - a) / (b - a))));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const mix3 = (a: V3, b: V3, k: number): V3 => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};


// ---------- shared stage ----------
type Cam = {pos: V3; look: V3; fov: number};
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
const radialTex = (inner: string, outer: string) => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
};
// warm spotlight from above with a soft visible cone and a light pool on the floor
const Spot: React.FC<{p: V3; k: number; color?: string; h?: number; r?: number}> = ({p, k, color = '#ffcf8a', h = 7, r = 2.2}) => {
  const pool = useMemo(() => radialTex('rgba(255,214,150,0.55)', 'rgba(255,214,150,0)'), []);
  return (
    <group position={p}>
      <spotLight position={[0, h, 0.6]} angle={0.42} penumbra={0.85} intensity={60 * k} distance={22} decay={1.6} color={color}
        />
      <mesh position={[0, h / 2, 0]}>
        <coneGeometry args={[r, h, 48, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.03 * k} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[r * 2.6, r * 2.6]} />
        <meshBasicMaterial map={pool} transparent opacity={k} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};
const Floor: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
    <planeGeometry args={[60, 60]} />
    <meshStandardMaterial color="#0a0f1e" roughness={0.85} metalness={0.15} />
  </mesh>
);
const ContactShadow: React.FC<{p: V3; r: number; o?: number}> = ({p, r, o = 0.7}) => {
  const tex = useMemo(() => radialTex('rgba(0,0,0,0.9)', 'rgba(0,0,0,0)'), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[p[0], p[1] + 0.01, p[2]]}>
      <planeGeometry args={[r * 2, r * 2]} />
      <meshBasicMaterial map={tex} transparent opacity={o} depthWrite={false} />
    </mesh>
  );
};
const Stage: React.FC<{cam: Cam; children: React.ReactNode; fade: number; floor?: boolean; overlay?: React.ReactNode}> = ({cam, children, fade, floor = true, overlay}) => {
  const {width: W, height: H} = useVideoConfig();
  return (
    <AbsoluteFill style={{opacity: fade, background: '#050812'}}>
      <ThreeCanvas width={W} height={H} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
        <CameraRig cam={cam} />
        <color attach="background" args={['#050812']} />
        <fog attach="fog" args={['#050812', 8, 26]} />
        <ambientLight intensity={0.28} color="#9fb4ff" />
        <directionalLight position={[-5, 4, -4]} intensity={0.9} color="#6b8cff" />
        <directionalLight position={[4, 6, 6]} intensity={0.35} color="#ffe2b8" />
        {floor && <Floor />}
        {children}
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 45% at 50% 112%, rgba(47,107,255,0.45) 0%, rgba(0,0,0,0) 60%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)'}} />
      {overlay}
    </AbsoluteFill>
  );
};
const gold = {color: '#d9a640', metalness: 1, roughness: 0.28} as const;

// ---------- 1. hourglass: the last grains fall ("no time left") ----------
const glassProfile = (() => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 40; i++) {
    const y = -1.6 + (3.2 * i) / 40;
    const a = Math.abs(y);
    const r = a < 0.08 ? 0.07 : 0.07 + 0.72 * Math.sin(Math.min(1, (a - 0.08) / 1.1) * Math.PI * 0.62) * (a > 1.35 ? 1 - (a - 1.35) * 1.4 : 1);
    pts.push(new THREE.Vector2(Math.max(0.07, r), y));
  }
  return pts;
})();
const Hourglass: React.FC<{t: number; s: number; e: number; cue: number}> = ({t, s, e, cue}) => {
  const level = mix(0.3, 0, ease(t, s, cue, (x) => x)); // top sand left
  const pile = 1 - level * 1.6;
  const flowing = level > 0.005;
  const glow = ease(t, cue, cue + 0.4);
  return (
    <group position={[0, 1.75, 0]}>
      <mesh>
        <latheGeometry args={[glassProfile, 64]} />
        <meshStandardMaterial color="#cfe3ff" transparent opacity={0.16} roughness={0.05} metalness={0.1} side={THREE.DoubleSide} depthWrite={false}
          emissive="#3d6bff" emissiveIntensity={0.08} />
      </mesh>
      {[1.68, -1.68].map((y) => (
        <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[0.95, 0.95, 0.14, 48]} /><meshStandardMaterial {...gold} /></mesh>
      ))}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.4;
        return <mesh key={i} position={[Math.cos(a) * 0.86, 0, Math.sin(a) * 0.86]}><cylinderGeometry args={[0.045, 0.045, 3.3, 12]} /><meshStandardMaterial {...gold} /></mesh>;
      })}
      {/* top sand: inverted cone shrinking toward the neck */}
      {level > 0.003 && (
        <mesh position={[0, 0.08 + level * 1.6 * 0.5, 0]} scale={[Math.sqrt(level / 0.3), 1, Math.sqrt(level / 0.3)]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.6, level * 1.6, 40]} />
          <meshStandardMaterial color="#f2c25a" emissive="#b8800f" emissiveIntensity={0.55} roughness={0.7} />
        </mesh>
      )}
      <mesh position={[0, -1.55 + pile * 0.35, 0]}>
        <coneGeometry args={[0.66, pile * 0.7, 40]} />
        <meshStandardMaterial color="#f2c25a" emissive="#b8800f" emissiveIntensity={0.55 + glow * 1.2} roughness={0.7} />
      </mesh>
      {flowing && (
        <mesh position={[0, -0.75, 0]}><cylinderGeometry args={[0.018, 0.018, 1.5, 8]} />
          <meshStandardMaterial color="#ffd877" emissive="#ffb21a" emissiveIntensity={1.2} /></mesh>
      )}
      {flowing && Array.from({length: 6}, (_, i) => {
        const y = -((t * 2.4 + i / 6) % 1) * 1.45;
        return <mesh key={i} position={[0, y, 0]}><sphereGeometry args={[0.03, 8, 8]} /><meshStandardMaterial color="#ffe08a" emissive="#ffb21a" emissiveIntensity={1.5} /></mesh>;
      })}
      <pointLight position={[0, -1.2, 0.6]} intensity={2 + glow * 10} distance={4} color="#ffc458" />
    </group>
  );
};

// ---------- 2. globe → gold figure ("fix yourself before you fix the world") ----------
const GoldFigure: React.FC<{p: V3; glow: number}> = ({p, glow}) => (
  <group position={p}>
    <mesh position={[0, 0.78, 0]}><capsuleGeometry args={[0.3, 0.72, 8, 24]} />
      <meshStandardMaterial color="#e2b04a" metalness={0.9} roughness={0.25} emissive="#ffb21a" emissiveIntensity={0.15 + glow * 0.9} /></mesh>
    <mesh position={[0, 1.66, 0]}><sphereGeometry args={[0.27, 32, 24]} />
      <meshStandardMaterial color="#e2b04a" metalness={0.9} roughness={0.25} emissive="#ffb21a" emissiveIntensity={0.15 + glow * 0.9} /></mesh>
    <pointLight position={[0, 1.2, 0.8]} intensity={1 + glow * 14} distance={5} color="#ffcf6a" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <ringGeometry args={[0.55, 0.55 + 0.06 + glow * 0.1, 64]} />
      <meshBasicMaterial color="#ffd36a" transparent opacity={0.3 + glow * 0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  </group>
);
const Globe: React.FC<{t: number}> = ({t}) => {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.4, 3)), []);
  return (
    <group position={[-2.8, 3.1, -6.2]} rotation={[0.25, t * 0.35, 0.1]}>
      <mesh><sphereGeometry args={[2.36, 48, 32]} /><meshStandardMaterial color="#0a1a4a" emissive="#163a99" emissiveIntensity={0.45} transparent opacity={0.6} /></mesh>
      <lineSegments geometry={geo}><lineBasicMaterial color="#a9cfff" transparent opacity={0.55} /></lineSegments>
      {[0.6, 0, -0.6, -1.2, 1.2].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[Math.sqrt(2.42 ** 2 - y * y), 0.008, 6, 96]} /><meshBasicMaterial color="#a9cfff" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- 3. battery draining ----------
const Battery: React.FC<{level: number; t: number}> = ({level, t}) => {
  const col = new THREE.Color().setHSL(0.33 * Math.max(0, Math.min(1, (level - 0.1) / 0.8)), 0.85, 0.5);
  const flick = level < 0.2 ? 0.6 + 0.4 * Math.abs(Math.sin(t * 13)) : 1;
  const h = 2.5 * level;
  return (
    <group position={[0, 1.6, 0]}>
      <mesh><boxGeometry args={[1.5, 2.8, 1.1]} />
        <meshStandardMaterial color="#bcd4ff" transparent opacity={0.14} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} emissive="#3d6bff" emissiveIntensity={0.1} /></mesh>
      <mesh position={[0, 1.55, 0]}><boxGeometry args={[0.6, 0.28, 0.5]} /><meshStandardMaterial {...gold} /></mesh>
      <mesh position={[0, -1.25 + h / 2, 0]}><boxGeometry args={[1.28, Math.max(0.02, h), 0.9]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.9 * flick} roughness={0.4} transparent opacity={0.92} /></mesh>
      <pointLight position={[0, -0.6, 1.2]} intensity={6 * flick} distance={5} color={col} />
    </group>
  );
};

// ---------- 4. dopamine brain ----------
const brainGeo = (() => {
  const g = new THREE.SphereGeometry(1, 128, 96);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = v.clone().normalize();
    let d = 0.055 * Math.sin(n.x * 11 + Math.sin(n.y * 7)) * Math.sin(n.y * 13 + n.z * 5) + 0.035 * Math.sin(n.z * 17 + n.x * 9);
    d -= 0.16 * Math.exp(-Math.pow(n.x / 0.07, 2)) * (n.y > -0.2 ? 1 : 0.2); // the central fissure
    v.copy(n).multiplyScalar(1 + d);
    v.x *= 1.0; v.y *= 0.82; v.z *= 1.22;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
})();
const badgeTex = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ff3b3b'; g.beginPath(); g.arc(64, 64, 56, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'white'; g.font = 'bold 72px Helvetica, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('♥', 64, 70);
  return new THREE.CanvasTexture(c);
};
const Brain: React.FC<{t: number; s: number; e: number}> = ({t, s, e}) => {
  const tex = useMemo(() => badgeTex(), []);
  const orbs = Array.from({length: 16}, (_, i) => {
    const hit = s + 0.35 + i * ((e - s - 0.9) / 16);
    const a = rnd(i) * Math.PI * 2, el = (rnd(i + 5) - 0.4) * 1.4;
    const from: V3 = [Math.cos(a) * 6, 1.8 + el * 2, Math.sin(a) * 6 - 1];
    const to: V3 = [Math.cos(a) * 1.0, 1.8 + el * 0.55, Math.sin(a) * 1.1];
    return {hit, from, to};
  });
  const pulse = orbs.reduce((m, o) => Math.max(m, t >= o.hit ? Math.exp(-(t - o.hit) * 5) : 0), 0);
  return (
    <group>
      <group position={[0, 1.8, 0]} rotation={[0.15, t * 0.4 - 0.4, 0]}>
        <mesh geometry={brainGeo}>
          <meshStandardMaterial color="#d47a99" roughness={0.5} metalness={0.05} emissive="#ff7a3d" emissiveIntensity={0.02 + pulse * 0.28} />
        </mesh>
      </group>
      <pointLight position={[0, 1.8, 2.2]} intensity={1 + pulse * 10} distance={6} color="#ffc458" />
      {orbs.map((o, i) => {
        const k = ease(t, o.hit - 0.55, o.hit, Easing.in(Easing.quad));
        if (k <= 0) return null;
        const after = t - o.hit;
        if (after > 0.3) return null;
        const p = mix3(o.from, o.to, k);
        const sc = after > 0 ? 0.55 * (1 + after * 5) : 0.55;
        return (
          <sprite key={i} position={p} scale={[sc, sc, sc]}>
            <spriteMaterial map={tex} transparent opacity={after > 0 ? 1 - after / 0.3 : 1} depthWrite={false} />
          </sprite>
        );
      })}
    </group>
  );
};

// ---------- 5. two-faced phone ----------
const phoneScreenTex = () => {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 1024;
  const g = c.getContext('2d')!;
  const L = g.createLinearGradient(0, 0, 0, 1024); L.addColorStop(0, '#5a0a10'); L.addColorStop(1, '#1a0204');
  g.fillStyle = L; g.fillRect(0, 0, 256, 1024);
  const R = g.createLinearGradient(256, 0, 512, 1024); R.addColorStop(0, '#ffe39a'); R.addColorStop(0.5, '#e0a63c'); R.addColorStop(1, '#7a4d0c');
  g.fillStyle = R; g.fillRect(256, 0, 256, 1024);
  g.strokeStyle = 'rgba(255,190,190,0.85)'; g.lineWidth = 3; // cracks on the red half
  const crack = (x: number, y: number, n: number, seed: number) => {
    let cx = x, cy = y;
    g.beginPath(); g.moveTo(cx, cy);
    for (let i = 0; i < n; i++) { cx += (rnd(seed + i) - 0.65) * 70; cy += (rnd(seed + i + 50) - 0.5) * 110; cx = Math.min(250, Math.max(4, cx)); g.lineTo(cx, cy); }
    g.stroke();
  };
  for (let k = 0; k < 7; k++) crack(140, 420, 6, k * 13);
  g.fillStyle = 'rgba(255,255,255,0.9)';
  for (let k = 0; k < 40; k++) { const x = 270 + rnd(k) * 230, y = rnd(k + 9) * 1000; g.globalAlpha = rnd(k + 3); g.fillRect(x, y, 3, 3); }
  g.globalAlpha = 1;
  g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(254, 0, 4, 1024);
  return new THREE.CanvasTexture(c);
};
const phoneShape = (() => {
  const s = new THREE.Shape(), w = 1.7, h = 3.4, r = 0.28;
  s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
})();
const Phone3D: React.FC<{t: number; s: number; red: number; gold: number}> = ({t, s, red, gold: g}) => {
  const tex = useMemo(() => phoneScreenTex(), []);
  return (
    <group>
      <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[1.25, 1.4, 0.9, 64]} /><meshStandardMaterial color="#111827" metalness={0.6} roughness={0.35} /></mesh>
      <mesh position={[0, 0.91, 0]}><cylinderGeometry args={[1.26, 1.26, 0.03, 64]} /><meshStandardMaterial {...gold} /></mesh>
      <group position={[0, 2.75, 0]} rotation={[-0.08, Math.sin((t - s) * 0.5) * 0.25, 0]}>
        <mesh position={[0, 0, -0.09]}>
          <extrudeGeometry args={[phoneShape, {depth: 0.16, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 12}]} />
          <meshStandardMaterial color="#0b0d12" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.115]}><planeGeometry args={[1.56, 3.24]} />
          <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.55 + 0.3 * Math.max(red, g)} roughness={0.2} /></mesh>
      </group>
      <pointLight position={[-2.2, 2.8, 1.6]} intensity={2 + red * 16} distance={7} color="#ff3b3b" />
      <pointLight position={[2.2, 2.8, 1.6]} intensity={2 + g * 18} distance={7} color="#ffc458" />
    </group>
  );
};

// ---------- 6. foundation bricks ----------
const brickTex = (label: string) => {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const g = c.getContext('2d')!;
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#ffe39a'); gr.addColorStop(0.5, '#d9a640'); gr.addColorStop(1, '#8a5a10');
  g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
  g.font = `800 112px "${sora}", "Helvetica Neue", Arial`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = 'rgba(255,240,200,0.55)'; g.fillText(label, 258, 134);
  g.fillStyle = '#5a3606'; g.fillText(label, 256, 130);
  return new THREE.CanvasTexture(c);
};
const BRICKS: {label: string; at: V3}[] = [
  {label: 'SLEEP', at: [-1.62, 0.36, 0]}, {label: 'ROOM', at: [0, 0.36, 0]}, {label: 'BODY', at: [1.62, 0.36, 0]},
  {label: 'MIND', at: [-0.81, 1.08, 0]}, {label: 'PHONE', at: [0.81, 1.08, 0]},
];
const Brick: React.FC<{label: string; p: V3; rot: number; glow: number}> = ({label, p, rot, glow}) => {
  const mats = useMemo(() => {
    const plain = new THREE.MeshStandardMaterial({color: '#d9a640', metalness: 0.95, roughness: 0.3});
    const face = new THREE.MeshStandardMaterial({map: brickTex(label), metalness: 0.75, roughness: 0.35});
    return [plain, plain, plain, plain, face, plain];
  }, [label]);
  mats[1].emissive = new THREE.Color('#ffb21a'); mats[1].emissiveIntensity = glow * 0.4;
  return (
    <mesh position={p} rotation={[rot * 0.6, rot, rot * 0.3]} material={mats}>
      <boxGeometry args={[1.54, 0.68, 0.78]} />
    </mesh>
  );
};

// ---------- scene ----------
export const WinterGfx: React.FC<{kind: WinterKind; start: number; end?: number; cues?: number[]}> = ({kind, start, end, cues = []}) => {
  const {fps} = useVideoConfig();
  const t = start + useCurrentFrame() / fps;
  const e = end ?? start + 4;
  const d = e - start;
  const cue = (i: number, frac: number) => cues[i] ?? start + d * frac;
  const fade = ease(t, start, start + 0.12);
  const k = ease(t, start, e, Easing.inOut(Easing.sin));
  switch (kind) {
    case 'hourglass': {
      const c0 = cue(0, 0.6);
      const cam: Cam = {pos: mix3([2.6, 2.5, 9.2], [1.2, 2.0, 7.2], k), look: [0, 1.75, 0], fov: 38};
      return (
        <Stage cam={cam} fade={fade}>
          <Spot p={[0, 0, 0]} k={1} r={2.4} />
          <ContactShadow p={[0, 0, 0]} r={1.4} />
          <Hourglass t={t} s={start} e={e} cue={c0} />
        </Stage>
      );
    }
    case 'globe': {
      const c0 = cue(0, 0.3);
      const kk = ease(t, c0 - 0.3, Math.min(e, c0 + 1.6), Easing.inOut(Easing.sin));
      const cam: Cam = {pos: mix3([0, 2.6, 4.5], [1.1, 1.6, 4.9], kk), look: mix3([0, 2.7, -5], [0, 1.15, 0.6], kk), fov: mix(44, 36, kk)};
      return (
        <Stage cam={cam} fade={fade}>
          <Globe t={t} />
          <Spot p={[0, 0, 0.6]} k={0.3 + 0.7 * ease(t, c0, c0 + 0.6)} r={1.6} />
          <ContactShadow p={[0, 0, 0.6]} r={0.9} />
          <GoldFigure p={[0, 0, 0.6]} glow={ease(t, c0, c0 + 0.8)} />
        </Stage>
      );
    }
    case 'battery': {
      const [c0, c1, c2] = [cue(0, 0.1), cue(1, 0.4), cue(2, 0.7)];
      const lv = 0.92 - 0.3 * ease(t, c0, c0 + 0.7) - 0.27 * ease(t, c1, c1 + 0.7) - 0.24 * ease(t, c2, c2 + 0.8);
      const cam: Cam = {pos: [Math.sin(mix(-0.35, 0.3, k)) * 6, 2.4, Math.cos(mix(-0.35, 0.3, k)) * 6], look: [0.6, 1.6, 0], fov: 38};
      const pct = Math.round(lv * 100);
      const col = pct > 55 ? '#4ade80' : pct > 30 ? '#facc15' : '#ff4d4d';
      return (
        <Stage cam={cam} fade={fade} overlay={
          <div style={{position: 'absolute', left: '66%', top: '44%', transform: 'translateY(-50%)', fontFamily: sora, fontWeight: 800, fontSize: 150, color: col,
            letterSpacing: '-0.04em', textShadow: `0 0 40px ${col}88`, fontVariantNumeric: 'tabular-nums'}}>{pct}%</div>}>
          <Spot p={[0, 0, 0]} k={0.8} r={2} />
          <ContactShadow p={[0, 0, 0]} r={1.3} />
          <Battery level={lv} t={t} />
        </Stage>
      );
    }
    case 'brain': {
      const cam: Cam = {pos: mix3([0.3, 2.2, 5.2], [0.1, 1.95, 3.9], k), look: [0, 1.8, 0], fov: 40};
      return (
        <Stage cam={cam} fade={fade} floor={false}>
          <Brain t={t} s={start} e={e} />
        </Stage>
      );
    }
    case 'phone': {
      const [c0, c1, c2] = [cue(0, 0.1), cue(1, 0.45), cue(2, 0.75)];
      const red = Math.max(ease(t, c0, c0 + 0.5), ease(t, c1, c1 + 0.5)) * (1 - 0.6 * ease(t, c2, c2 + 0.6));
      const g = ease(t, c2, c2 + 0.6);
      const a = mix(-0.5, 0.5, ease(t, start, e, Easing.inOut(Easing.sin)));
      const cam: Cam = {pos: [Math.sin(a) * 5.0, 3.0, Math.cos(a) * 5.0], look: [0, 2.6, 0], fov: 40};
      return (
        <Stage cam={cam} fade={fade}>
          <Spot p={[0, 0, 0]} k={1} r={2.2} />
          <ContactShadow p={[0, 0, 0]} r={1.8} />
          <Phone3D t={t} s={start} red={red} gold={g} />
        </Stage>
      );
    }
    case 'bricks': {
      const arr = BRICKS.map((_, i) => cue(i + 1, 0.3 + i * 0.13));
      const last = arr[arr.length - 1];
      const glow = ease(t, last + 0.3, last + 0.8);
      const cam: Cam = {pos: mix3([0.5, 1.6, 6.0], [0.1, 1.25, 4.8], k), look: [0, 0.72, 0], fov: 38};
      return (
        <Stage cam={cam} fade={fade}>
          <Spot p={[0, 0, 0]} k={1} r={3} />
          <ContactShadow p={[0, 0, 0]} r={2.8} o={0.8} />
          {BRICKS.map((b, i) => {
            const land = arr[i];
            const kk = ease(t, land - 0.45, land, Easing.in(Easing.quad));
            if (kk <= 0) return null;
            const from: V3 = [b.at[0] + (i % 2 ? 4 : -4), b.at[1] + 4.5, b.at[2] + 1.5];
            const p = mix3(from, b.at, kk);
            p[1] += Math.sin(kk * Math.PI) * 0.8;
            const bounce = t > land ? Math.exp(-(t - land) * 9) * Math.abs(Math.sin((t - land) * 22)) * 0.12 : 0;
            p[1] += bounce;
            return <Brick key={b.label} label={b.label} p={p} rot={(1 - kk) * (i % 2 ? 1.2 : -1.2)} glow={glow} />;
          })}
          <pointLight position={[0, 1.2, 2.4]} intensity={3 + glow * 16} distance={7} color="#ffc458" />
        </Stage>
      );
    }
  }
};

// QA composition: every scene back to back with fallback cues
const TEST: {kind: WinterKind; d: number}[] = [
  {kind: 'hourglass', d: 2.4}, {kind: 'globe', d: 4}, {kind: 'battery', d: 5.6}, {kind: 'brain', d: 4}, {kind: 'phone', d: 6}, {kind: 'bricks', d: 5.8},
];
export const WinterGfxTest: React.FC = () => {
  const {fps} = useVideoConfig();
  let from = 0;
  return (
    <AbsoluteFill style={{background: 'black'}}>
      {TEST.map((g) => {
        const n = Math.round(g.d * fps), f0 = from;
        from += n;
        return <Sequence key={g.kind} from={f0} durationInFrames={n}><WinterGfx kind={g.kind} start={0} end={g.d} /></Sequence>;
      })}
    </AbsoluteFill>
  );
};
