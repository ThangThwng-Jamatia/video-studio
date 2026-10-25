// Day Series kit (skill: day-series). Low-poly 3D world + HUD + captions for 9:16 "Day N" survival shorts.
// Everything is a pure function of the absolute second t, so motion lands on the narrator's words.
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {loadFont as loadInterTight} from '@remotion/google-fonts/InterTight';

export const {fontFamily: FONT} = loadInterTight('normal', {weights: ['600', '800', '900'], subsets: ['latin']});

// ---------- math ----------
export type V3 = [number, number, number];
export const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const ease = (t: number, a: number, b: number, e = Easing.inOut(Easing.cubic)) => interpolate(t, [a, b], [0, 1], {...CL, easing: e});
export const pop = (t: number, a: number, d = 0.35) => interpolate(t, [a, a + d], [0, 1], {...CL, easing: Easing.out(Easing.back(1.8))});
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const mix3 = (a: V3, b: V3, k: number): V3 => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const lerpCol = (a: string, b: string, k: number) => new THREE.Color(a).lerp(new THREE.Color(b), k);
// piecewise colour along a phase value (0..n-1)
export const phaseCol = (cols: string[], p: number) => {
  const i = Math.max(0, Math.min(cols.length - 2, Math.floor(p)));
  return lerpCol(cols[i], cols[i + 1], Math.max(0, Math.min(1, p - i)));
};
export const phaseNum = (vals: number[], p: number) => {
  const i = Math.max(0, Math.min(vals.length - 2, Math.floor(p)));
  return mix(vals[i], vals[i + 1], Math.max(0, Math.min(1, p - i)));
};

// ---------- camera ----------
export type Cam = {pos: V3; look: V3; fov: number};
export const camMix = (a: Cam, b: Cam, k: number): Cam => ({pos: mix3(a.pos, b.pos, k), look: mix3(a.look, b.look, k), fov: mix(a.fov, b.fov, k)});
// subtle handheld drift so no frame is ever static
export const handheld = (c: Cam, t: number, amt = 1): Cam => ({...c, pos: [c.pos[0] + Math.sin(t * 0.9) * 0.06 * amt, c.pos[1] + Math.sin(t * 1.3 + 1) * 0.05 * amt, c.pos[2] + Math.cos(t * 0.7) * 0.05 * amt]});
export const CameraRig: React.FC<{cam: Cam}> = ({cam}) => {
  const c = useThree().camera as THREE.PerspectiveCamera;
  c.position.set(...cam.pos); c.fov = cam.fov; c.near = 0.1; c.far = 600; c.lookAt(...cam.look); c.updateProjectionMatrix();
  return null;
};
export const projector = (cam: Cam, W: number, H: number) => {
  const c = new THREE.PerspectiveCamera(cam.fov, W / H, 0.1, 600);
  c.position.set(...cam.pos); c.lookAt(...cam.look); c.updateMatrixWorld(); c.updateProjectionMatrix();
  return (p: V3) => { const v = new THREE.Vector3(...p).project(c); return {x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H}; };
};

// ---------- sea + sky ----------
export const waveH = (x: number, z: number, t: number, amp = 1) =>
  amp * (0.32 * Math.sin(0.33 * x + 1.05 * t) + 0.24 * Math.sin(0.41 * z - 0.8 * t + 1.3) + 0.12 * Math.sin(0.9 * (x + z) + 1.7 * t));
// low-poly faceted ocean: displaced plane, flat shading
export const Ocean: React.FC<{t: number; color: THREE.Color; amp?: number; size?: number}> = ({t, color, amp = 1, size = 260}) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(size, size, 90, 90).rotateX(-Math.PI / 2), [size]);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const far = Math.min(1, Math.hypot(x, z) / 60); // calmer toward the horizon
    pos.setY(i, waveH(x, z, t, amp) * (1 - far * 0.6));
  }
  pos.needsUpdate = true; geo.computeVertexNormals();
  return <mesh geometry={geo}><meshStandardMaterial color={color} flatShading roughness={0.55} metalness={0.05} /></mesh>;
};
const skyVert = 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
const skyFrag = 'uniform vec3 top; uniform vec3 bot; varying vec3 vP; void main(){ float h = clamp(vP.y*1.6+0.05,0.0,1.0); gl_FragColor = vec4(mix(bot, top, pow(h,0.7)),1.0); }';
export const Sky: React.FC<{top: THREE.Color; bot: THREE.Color}> = ({top, bot}) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({vertexShader: skyVert, fragmentShader: skyFrag, side: THREE.BackSide, depthWrite: false, uniforms: {top: {value: new THREE.Color()}, bot: {value: new THREE.Color()}}}), []);
  mat.uniforms.top.value.copy(top); mat.uniforms.bot.value.copy(bot);
  return <mesh material={mat}><sphereGeometry args={[400, 32, 16]} /></mesh>;
};
export const Stars: React.FC<{k: number}> = ({k}) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry(), a: number[] = [];
    for (let i = 0; i < 700; i++) { const th = rnd(i) * Math.PI * 2, ph = 0.05 + rnd(i + 999) * 1.4; a.push(Math.cos(th) * Math.cos(ph) * 380, Math.sin(ph) * 380, Math.sin(th) * Math.cos(ph) * 380); }
    g.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); return g;
  }, []);
  if (k <= 0) return null;
  return <points geometry={geo}><pointsMaterial color="#ffffff" size={1.6} sizeAttenuation={false} transparent opacity={k} fog={false} /></points>;
};

// ---------- props (faceted, flat-shaded) ----------
const M: React.FC<{c: string; e?: number; m?: number; r?: number; o?: number}> = ({c, e = 0, m = 0, r = 0.6, o = 1}) =>
  <meshStandardMaterial color={c} flatShading emissive={c} emissiveIntensity={e} metalness={m} roughness={r} transparent={o < 1} opacity={o} />;
export const Raft: React.FC<{canopy: number}> = ({canopy}) => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.25, 0]}><torusGeometry args={[1.35, 0.34, 6, 14]} /><M c="#ff6a1f" /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.62, 0]}><torusGeometry args={[1.32, 0.22, 6, 14]} /><M c="#ff8a3d" /></mesh>
    <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[1.3, 1.3, 0.12, 14]} /><M c="#2b2f36" /></mesh>
    {[0, 1, 2, 3].map((i) => <mesh key={i} position={[Math.cos(i * 1.57 + 0.78) * 1.35, 0.62, Math.sin(i * 1.57 + 0.78) * 1.35]}><boxGeometry args={[0.16, 0.5, 0.16]} /><M c="#f2f2f2" /></mesh>)}
    {/* canopy arch + cover */}
    <mesh position={[0, 0.7, 0]} rotation={[0, 0, 0]}><torusGeometry args={[1.3, 0.06, 5, 14, Math.PI]} /><M c="#ffb070" /></mesh>
    {canopy > 0.01 && <mesh position={[0, 0.7, 0]} scale={[1, canopy, 1]}><sphereGeometry args={[1.32, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2]} /><M c="#ff7a2a" o={0.97} /></mesh>}
  </group>
);
// seated survivor; lie = 0..1 (1 = lying back), headYaw turns the head
export const Survivor: React.FC<{lie?: number; headYaw?: number; armUp?: number; drink?: number}> = ({lie = 0, headYaw = 0, armUp = 0}) => (
  <group position={[0, 0.2, 0.15]} rotation={[-lie * 1.25, 0, 0]}>
    <mesh position={[0, 0.55, 0]}><cylinderGeometry args={[0.3, 0.36, 0.75, 7]} /><M c="#ffcf33" /></mesh>
    <mesh position={[0, 0.9, 0]}><cylinderGeometry args={[0.2, 0.3, 0.12, 7]} /><M c="#ffb800" /></mesh>
    <group position={[0, 1.22, 0]} rotation={[0, headYaw, 0]}>
      <mesh><icosahedronGeometry args={[0.3, 1]} /><M c="#e9b48c" /></mesh>
      <mesh position={[0, 0.1, -0.02]} scale={[1.05, 0.7, 1.05]}><icosahedronGeometry args={[0.3, 1]} /><M c="#2a1d17" /></mesh>
      {[-0.1, 0.1].map((x) => <mesh key={x} position={[x, 0.0, 0.27]}><sphereGeometry args={[0.04, 8, 6]} /><meshBasicMaterial color="#111" /></mesh>)}
    </group>
    {[-1, 1].map((s) => (
      <group key={s} position={[s * 0.36, 0.82, 0]} rotation={[-(s > 0 ? armUp : 0) * 2.4, 0, s * 0.25]}>
        <mesh position={[0, -0.28, 0.05]}><cylinderGeometry args={[0.09, 0.08, 0.58, 6]} /><M c="#e9b48c" /></mesh>
      </group>
    ))}
  </group>
);
export const Ship: React.FC = () => (
  <group>
    <mesh position={[0, 0.6, 0]}><boxGeometry args={[9, 2.4, 2.2]} /><M c="#7b1e1e" /></mesh>
    <mesh position={[0, 2.2, 0]}><boxGeometry args={[9, 0.8, 2.2]} /><M c="#e9e9e9" /></mesh>
    <mesh position={[2, 3.4, 0]}><boxGeometry args={[3, 1.6, 1.8]} /><M c="#f4f4f4" /></mesh>
    <mesh position={[-1.4, 3.8, 0]}><cylinderGeometry args={[0.45, 0.55, 2.2, 6]} /><M c="#222" /></mesh>
  </group>
);
export const Island: React.FC = () => (
  <group>
    <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[7, 8, 0.8, 9]} /><M c="#e8cf92" /></mesh>
    <mesh position={[0, 2.4, 0]}><coneGeometry args={[5.5, 5, 7]} /><M c="#3d8c4a" /></mesh>
    <mesh position={[2.5, 1.6, 2]}><coneGeometry args={[2.5, 3, 6]} /><M c="#4fa35b" /></mesh>
  </group>
);
export const Bottle: React.FC = () => (
  <group>
    <mesh><cylinderGeometry args={[0.22, 0.22, 0.7, 8]} /><M c="#7fd3ff" o={0.75} r={0.1} /></mesh>
    <mesh position={[0, 0.42, 0]}><cylinderGeometry args={[0.1, 0.1, 0.14, 8]} /><M c="#1e6fff" /></mesh>
  </group>
);
export const Flare: React.FC<{lit?: number}> = ({lit = 0}) => (
  <group>
    <mesh><cylinderGeometry args={[0.1, 0.1, 0.8, 7]} /><M c="#e5262c" e={0.15 + lit * 0.4} /></mesh>
    <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.11, 0.11, 0.12, 7]} /><M c="#f2f2f2" /></mesh>
    {lit > 0 && <><mesh position={[0, 0.6, 0]}><icosahedronGeometry args={[0.12 + lit * 0.12, 0]} /><meshBasicMaterial color="#ffd0b0" /></mesh><pointLight position={[0, 0.7, 0]} intensity={6 * lit} distance={4} color="#ff4a2a" /></>}
  </group>
);
export const Mirror: React.FC = () => (
  <group>
    <mesh><boxGeometry args={[0.55, 0.55, 0.04]} /><M c="#dfe8f2" m={0.9} r={0.08} /></mesh>
    <mesh position={[0, 0, -0.03]}><boxGeometry args={[0.6, 0.6, 0.03]} /><M c="#333" /></mesh>
  </group>
);
export const Ring: React.FC<{r: number; w?: number; color: string; o?: number}> = ({r, w = 0.25, color, o = 1}) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.9, 0]}><ringGeometry args={[r - w, r, 64]} /><meshBasicMaterial color={color} transparent opacity={o} side={THREE.DoubleSide} depthWrite={false} /></mesh>
);

// ---------- 2D overlays ----------
export const ACC = {lime: '#C8FF3D', red: '#FF3B3B', blue: '#5CC8FF', amber: '#FFB23D', white: '#FFFFFF'};
const shadow = '0 4px 0 rgba(0,0,0,0.55), 0 0 24px rgba(0,0,0,0.6)';
export const Pill: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({children, color = ACC.white, size = 34, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, padding: `${size * 0.32}px ${size * 0.6}px`, borderRadius: 999, background: 'rgba(8,12,20,0.72)',
    border: `2px solid ${color}55`, fontFamily: FONT, fontWeight: 800, fontSize: size, color: 'white', letterSpacing: '0.04em', ...style}}>{children}</div>
);

// word-by-word captions; chunks break at punctuation or every 3 words; keywords coloured
export const Captions: React.FC<{words: [string, number, number][]; t: number; keys: Record<string, string>; y?: number; hide?: (t: number) => boolean}> = ({words, t, keys, y = 1300, hide}) => {
  const chunks = useMemo(() => {
    const out: {w: [string, number, number][]}[] = []; let cur: [string, number, number][] = [];
    words.forEach((w) => { cur.push(w); if (/[.,?!:]$/.test(w[0]) || cur.length >= 3) { out.push({w: cur}); cur = []; } });
    if (cur.length) out.push({w: cur});
    return out;
  }, [words]);
  if (hide?.(t)) return null;
  const i = chunks.findIndex((c, j) => t >= c.w[0][1] - 0.05 && (j === chunks.length - 1 || t < chunks[j + 1].w[0][1] - 0.05));
  if (i < 0) return null;
  const c = chunks[i];
  if (t > c.w[c.w.length - 1][2] + 0.6) return null;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 22px'}}>
      {c.w.map(([w, s], j) => {
        const k = pop(t, s - 0.04, 0.22);
        const clean = w.replace(/[.,?!:]/g, '');
        const col = keys[clean.toLowerCase()] ?? ACC.white;
        return <span key={j} style={{fontFamily: FONT, fontWeight: 900, fontSize: 82, color: col, textTransform: 'uppercase', textShadow: shadow,
          WebkitTextStroke: '3px rgba(0,0,0,0.85)', paintOrder: 'stroke fill', opacity: k > 0 ? 1 : 0, transform: `scale(${0.7 + 0.3 * k}) translateY(${(1 - k) * 18}px)`, display: 'inline-block'}}>{clean}</span>;
      })}
    </div>
  );
};

// big stamped title (DAY 1, DON'T, …)
export const Stamp: React.FC<{t: number; at: number; out: number; text: string; sub?: string; color?: string; y?: number; size?: number}> = ({t, at, out, text, sub, color = ACC.white, y = 640, size = 230}) => {
  if (t < at || t > out + 0.3) return null;
  const k = pop(t, at, 0.3), o = 1 - ease(t, out, out + 0.3);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: o, transform: `scale(${mix(1.6, 1, k)})`, filter: `blur(${(1 - Math.min(1, k)) * 8}px)`}}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 0.9, color, textShadow: shadow, WebkitTextStroke: '6px rgba(0,0,0,0.8)', paintOrder: 'stroke fill', letterSpacing: '-0.02em'}}>{text}</div>
      {sub && <div style={{marginTop: 26, fontFamily: FONT, fontWeight: 800, fontSize: 44, color: 'white', letterSpacing: '0.18em', textShadow: shadow}}>{sub}</div>}
    </div>
  );
};

// glass info card that slides up
export const Card: React.FC<{t: number; at: number; out: number; y?: number; children: React.ReactNode; accent?: string}> = ({t, at, out, y = 300, children, accent = ACC.lime}) => {
  if (t < at || t > out + 0.35) return null;
  const k = ease(t, at, at + 0.35, Easing.out(Easing.cubic)), o = 1 - ease(t, out, out + 0.3);
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: y, opacity: Math.min(k, o), transform: `translateY(${(1 - k) * 60}px)`,
      background: 'rgba(8,12,20,0.78)', border: `2px solid ${accent}66`, borderRadius: 36, padding: '40px 46px', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', fontFamily: FONT, color: 'white'}}>{children}</div>
  );
};
export const Bar: React.FC<{label: string; value: string; k: number; color: string}> = ({label, value, k, color}) => (
  <div style={{marginBottom: 26}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 40, marginBottom: 12}}><span>{label}</span><span style={{color}}>{value}</span></div>
    <div style={{height: 30, borderRadius: 15, background: 'rgba(255,255,255,0.12)', overflow: 'hidden'}}><div style={{width: `${k * 100}%`, height: '100%', background: color, borderRadius: 15}} /></div>
  </div>
);
// label pinned to a 3D point
export const Tag: React.FC<{x: number; y: number; text: string; k: number; color?: string}> = ({x, y, text, k, color = ACC.lime}) => {
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-100%) scale(${0.6 + 0.4 * k})`, opacity: Math.min(1, k * 1.5), display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <Pill color={color} size={36}><span style={{color}}>●</span>{text}</Pill>
      <div style={{width: 3, height: 50, background: color}} />
    </div>
  );
};

// ---------- stage: 3D canvas + overlays + audio ----------
export type Sfx = [number, string, number];
export const DayAudio: React.FC<{job: string; sec: number; sfx: Sfx[]; musicVol?: number}> = ({job, sec, sfx, musicVol = 0.12}) => {
  const {fps} = useVideoConfig();
  return (
    <>
      <Audio src={staticFile(`${job}/voice.mp3`)} />
      <Audio src={staticFile(`${job}/music.wav`)} volume={(f) => interpolate(f / fps, [0, 1, sec - 1.5, sec], [0, musicVol, musicVol, 0], CL)} />
      {sfx.map(([at, name, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(at * fps))} durationInFrames={Math.round(2.5 * fps)}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v} /></Sequence>
      ))}
    </>
  );
};
export const useT = () => { const f = useCurrentFrame(); const {fps} = useVideoConfig(); return f / fps; };
export const Vignette: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none'}} />;
// film grain via SVG noise, re-seeded every 2 frames
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: 0.07, mixBlendMode: 'overlay'}}><svg width="100%" height="100%"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(f / 2)} /></filter><rect width="100%" height="100%" filter="url(#g)" /></svg></AbsoluteFill>;
};
