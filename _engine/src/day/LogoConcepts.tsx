// Day Series channel logo concepts (2048x2048 stills). A = 2D cartoon sticker, B = 3D chunky "DAY" block, C = 3D cartoon mascot badge.
// Palette from Day Series/Channel/Logo (navy, lime, red, amber).
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import bold from 'three/examples/fonts/helvetiker_bold.typeface.json';
import {FONT} from './dayKit';

const NAVY = '#0B1020', LIME = '#C8FF3D', RED = '#FF3B3B', AMBER = '#FFB23D', SKIN = '#F0B287', INK = '#0A0A12';
const S = 2048;

// ============ A: 2D cartoon sticker ============
const stroke = {stroke: INK, strokeWidth: 16, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
export const LogoA: React.FC = () => (
  <AbsoluteFill style={{background: NAVY, fontFamily: FONT}}>
    <svg width={S} height={S} viewBox="0 0 1000 1000">
      <defs>
        <clipPath id="disc"><circle cx="500" cy="470" r="360" /></clipPath>
        <radialGradient id="bg" cx="50%" cy="35%" r="75%"><stop offset="0" stopColor="#2A4B7A" /><stop offset="1" stopColor="#101A33" /></radialGradient>
      </defs>
      {/* sticker outline */}
      <circle cx="500" cy="470" r="420" fill="#fff" {...stroke} strokeWidth={20} />
      <circle cx="500" cy="470" r="388" fill={LIME} {...stroke} />
      <circle cx="500" cy="470" r="360" fill="url(#bg)" />
      <g clipPath="url(#disc)">
        {/* sunburst */}
        {Array.from({length: 16}).map((_, i) => (
          <polygon key={i} points={`500,470 ${500 + Math.cos((i / 16) * Math.PI * 2) * 600},${470 + Math.sin((i / 16) * Math.PI * 2) * 600} ${500 + Math.cos(((i + 0.5) / 16) * Math.PI * 2) * 600},${470 + Math.sin(((i + 0.5) / 16) * Math.PI * 2) * 600}`} fill="#fff" opacity={0.07} />
        ))}
        {/* shoulders / shirt */}
        <path d="M170 830 Q190 700 360 690 L640 690 Q810 700 830 830 Z" fill="#FFC93D" {...stroke} />
        <path d="M420 690 L500 770 L580 690" fill={INK} {...stroke} />
        {/* neck */}
        <rect x="440" y="640" width="120" height="80" rx="20" fill="#D8966B" {...stroke} />
        {/* ears */}
        <ellipse cx="258" cy="460" rx="38" ry="52" fill={SKIN} {...stroke} />
        <ellipse cx="742" cy="460" rx="38" ry="52" fill={SKIN} {...stroke} />
        {/* head */}
        <path d="M270 400 Q270 215 500 215 Q730 215 730 400 L730 480 Q730 670 500 690 Q270 670 270 480 Z" fill={SKIN} {...stroke} />
        {/* hair */}
        <path d="M268 380 Q250 250 360 205 L330 150 L430 190 L480 125 L540 190 L650 150 L640 205 Q750 250 732 380 Q690 300 500 300 Q310 300 268 380 Z" fill="#1B2438" {...stroke} />
        {/* headband */}
        <path d="M262 330 Q500 255 738 330 L742 392 Q500 322 258 392 Z" fill={RED} {...stroke} />
        <path d="M738 345 L840 300 L805 365 L860 410 L748 395 Z" fill={RED} {...stroke} />
        <polygon points="500,298 540,321 540,366 500,389 460,366 460,321" fill={AMBER} {...stroke} strokeWidth={12} />
        {/* brows */}
        <path d="M335 445 L450 470" {...stroke} strokeWidth={26} />
        <path d="M665 445 L550 470" {...stroke} strokeWidth={26} />
        {/* eyes */}
        <ellipse cx="392" cy="525" rx="52" ry="46" fill="#fff" {...stroke} strokeWidth={12} />
        <ellipse cx="608" cy="525" rx="52" ry="46" fill="#fff" {...stroke} strokeWidth={12} />
        <circle cx="404" cy="530" r="25" fill={INK} /><circle cx="620" cy="530" r="25" fill={INK} />
        <circle cx="413" cy="520" r="8" fill="#fff" /><circle cx="629" cy="520" r="8" fill="#fff" />
        {/* nose + smirk + cheeks */}
        <path d="M500 535 Q520 575 495 590" fill="none" {...stroke} strokeWidth={12} />
        <path d="M425 635 Q510 665 590 620" fill="none" {...stroke} strokeWidth={14} />
        <ellipse cx="330" cy="590" rx="34" ry="20" fill="#FF8A6B" opacity={0.55} />
        <ellipse cx="670" cy="590" rx="34" ry="20" fill="#FF8A6B" opacity={0.55} />
      </g>
      {/* ribbon */}
      <g>
        <path d="M80 800 L215 790 L215 925 L80 935 L130 868 Z" fill="#D92B2B" {...stroke} />
        <path d="M920 800 L785 790 L785 925 L920 935 L870 868 Z" fill="#D92B2B" {...stroke} />
        <path d="M185 775 Q500 815 815 775 L815 905 Q500 945 185 905 Z" fill={RED} {...stroke} />
        <text x="500" y="885" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={118} letterSpacing={6} fill="#fff" stroke={INK} strokeWidth={14} paintOrder="stroke" strokeLinejoin="round">DAY 1</text>
      </g>
      <circle cx="500" cy="60" r="26" fill={RED} {...stroke} strokeWidth={12} />
    </svg>
  </AbsoluteFill>
);

// ============ shared 3D helpers ============
const toon = (c: string) => new THREE.MeshToonMaterial({color: c});
const mkText = (s: string, size: number, depth: number) => {
  const g = new TextGeometry(s, {font: new FontLoader().parse(bold as never), size, depth, curveSegments: 10, bevelEnabled: true, bevelThickness: depth * 0.22, bevelSize: size * 0.045, bevelSegments: 5});
  g.computeBoundingBox();
  const b = g.boundingBox!;
  g.translate(-(b.max.x + b.min.x) / 2, -(b.max.y + b.min.y) / 2, -(b.max.z + b.min.z) / 2);
  return g;
};
const Lights: React.FC = () => (
  <>
    <hemisphereLight args={['#bcd4ff', '#1a2038', 0.9]} />
    <directionalLight position={[-6, 8, 9]} intensity={2.4} color="#fff3dd" />
    <directionalLight position={[8, -3, 5]} intensity={0.9} color="#6fb8ff" />
    <pointLight position={[0, 0, 8]} intensity={25} color="#ffffff" />
  </>
);

// ============ B: 3D chunky DAY block ============
const BlockB: React.FC = () => {
  const day = useMemo(() => mkText('DAY', 2.5, 1.4), []);
  const one = useMemo(() => mkText('1', 1.35, 0.6), []);
  const star = useMemo(() => {
    const sh = new THREE.Shape();
    for (let i = 0; i < 10; i++) {const r = i % 2 ? 0.45 : 1; const a = (i / 10) * Math.PI * 2 + Math.PI / 2; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r);}
    return new THREE.ExtrudeGeometry(sh, {depth: 0.35, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.08, bevelSegments: 3});
  }, []);
  return (
    <group position={[0, 0.5, 0]} rotation={[-0.12, 0.32, 0.02]}>
      {/* black outline copy (cartoon sticker edge) */}
      <mesh geometry={day} position={[0, 0.9, -0.3]} scale={[1.07, 1.12, 1.15]}><meshBasicMaterial color={INK} /></mesh>
      <mesh geometry={day} position={[0, 0.9, 0]} material={toon(LIME)} />
      {/* red slab with the 1 */}
      <mesh position={[0, -2.2, 0]}><boxGeometry args={[4.6, 2.2, 1.0]} /><meshToonMaterial color={RED} /></mesh>
      <mesh position={[0, -2.2, 0]} scale={[1.05, 1.07, 1.1]}><boxGeometry args={[4.6, 2.2, 1.0]} /><meshBasicMaterial color={INK} side={THREE.BackSide} /></mesh>
      <mesh geometry={one} position={[-0.3, -2.2, 0.75]} material={toon('#ffffff')} />
      {/* stars */}
      <mesh geometry={star} position={[-4.6, 3.1, 0]} rotation={[0, 0.3, 0.3]} material={toon(AMBER)} scale={0.9} />
      <mesh geometry={star} position={[4.7, -0.4, 0]} rotation={[0, -0.3, -0.25]} material={toon(AMBER)} scale={0.65} />
      <mesh geometry={star} position={[3.8, 3.4, 0.4]} rotation={[0, -0.2, 0.5]} material={toon(LIME)} scale={0.45} />
    </group>
  );
};
export const LogoB: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #27406b 0%, ${NAVY} 70%)`}}>
    <ThreeCanvas width={S} height={S} camera={{fov: 30, position: [0, 0.3, 24]}} gl={{antialias: true}}>
      <Lights />
      <BlockB />
    </ThreeCanvas>
  </AbsoluteFill>
);

// ============ C: 3D cartoon mascot in a lime ring ============
const Mascot: React.FC = () => {
  const m = (c: string, rough = 0.55) => <meshStandardMaterial color={c} roughness={rough} metalness={0.05} />;
  const gem = useMemo(() => new THREE.CylinderGeometry(0.3, 0.3, 0.16, 6), []);
  return (
    <group rotation={[0.04, -0.18, 0]}>
      {/* badge disc + ring */}
      <mesh position={[0, 0, -1.2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[4.6, 4.6, 0.5, 64]} />{m('#1a2a52', 0.7)}</mesh>
      <mesh position={[0, 0, -0.9]} rotation={[0, 0, 0]}><torusGeometry args={[4.55, 0.32, 24, 96]} />{m(LIME, 0.35)}</mesh>
      <mesh position={[0, 4.75, -0.7]}><sphereGeometry args={[0.34, 24, 24]} />{m(RED, 0.3)}</mesh>
      {/* shoulders */}
      <mesh position={[0, -3.25, 0]} scale={[1.25, 0.75, 0.8]}><sphereGeometry args={[1.9, 40, 24]} />{m('#FFC93D')}</mesh>
      <mesh position={[0, -2.1, 0]}><cylinderGeometry args={[0.65, 0.75, 1.1, 24]} />{m('#d9946a')}</mesh>
      {/* head (slightly squashed, cartoon proportions) */}
      <mesh position={[0, 0.3, 0]} scale={[1.12, 1.0, 1.0]}><sphereGeometry args={[2.6, 64, 48]} />{m(SKIN, 0.5)}</mesh>
      {/* ears */}
      {[-1, 1].map((s) => <mesh key={s} position={[s * 2.9, 0.1, 0]} scale={[0.5, 0.8, 0.6]}><sphereGeometry args={[0.7, 24, 20]} />{m(SKIN)}</mesh>)}
      {/* hair cap */}
      <mesh position={[0, 1.15, -0.25]} scale={[1.17, 0.95, 1.04]}><sphereGeometry args={[2.6, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.42]} />{m('#1B2438', 0.7)}</mesh>
      {[-1.4, -0.45, 0.6, 1.5].map((x, i) => <mesh key={i} position={[x * 1.05, 3.3 - Math.abs(x) * 0.3, 0.2]} rotation={[0, 0, -x * 0.25]}><coneGeometry args={[0.55, 1.4, 5]} />{m('#1B2438', 0.7)}</mesh>)}
      {/* headband */}
      <mesh position={[0, 1.9, 0.08]} rotation={[Math.PI / 2 - 0.12, 0, 0]} scale={[1.15, 1.02, 1]}><torusGeometry args={[2.55, 0.34, 20, 64]} />{m(RED, 0.4)}</mesh>
      <mesh position={[0, 1.75, 2.85]} rotation={[Math.PI / 2 - 0.1, 0, 0]} geometry={gem}>{m(AMBER, 0.2)}</mesh>
      <mesh position={[3.1, 1.35, -0.6]} rotation={[0, 0.2, -0.6]}><boxGeometry args={[1.3, 0.38, 0.14]} />{m(RED, 0.5)}</mesh>
      <mesh position={[3.35, 0.9, -0.5]} rotation={[0, 0.2, -1.1]}><boxGeometry args={[1.1, 0.34, 0.14]} />{m(RED, 0.5)}</mesh>
      {/* eyes */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.95, 0.35, 2.3]}>
          <mesh scale={[1, 1.1, 0.55]}><sphereGeometry args={[0.62, 32, 24]} />{m('#ffffff', 0.2)}</mesh>
          <mesh position={[s * 0.06, -0.02, 0.28]}><sphereGeometry args={[0.3, 24, 20]} />{m(INK, 0.2)}</mesh>
          <mesh position={[s * 0.06 + 0.1, 0.1, 0.52]}><sphereGeometry args={[0.1, 12, 12]} /><meshBasicMaterial color="#fff" /></mesh>
          {/* brow */}
          <mesh position={[0, 0.82, 0.3]} rotation={[0, 0, -s * 0.3]}><boxGeometry args={[1.1, 0.26, 0.22]} />{m(INK, 0.6)}</mesh>
        </group>
      ))}
      {/* nose, smirk */}
      <mesh position={[0, -0.25, 2.65]} scale={[0.8, 1, 0.9]}><sphereGeometry args={[0.28, 20, 16]} />{m('#e39d73')}</mesh>
      <mesh position={[0, -0.5, 2.2]} rotation={[0, 0, Math.PI * 1.1]}><torusGeometry args={[0.7, 0.07, 10, 28, Math.PI * 0.8]} />{m(INK, 0.6)}</mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 1.85, -0.55, 1.75]} scale={[1.2, 0.7, 0.3]}><sphereGeometry args={[0.45, 16, 12]} /><meshStandardMaterial color="#ff8a6b" transparent opacity={0.55} /></mesh>)}
    </group>
  );
};
export const LogoC: React.FC = () => {
  const day = useMemo(() => mkText('DAY 1', 0.95, 0.35), []);
  return (
    <AbsoluteFill style={{background: NAVY}}>
      <ThreeCanvas width={S} height={S} camera={{fov: 30, position: [0, -0.2, 27]}} gl={{antialias: true}}>
        <Lights />
        <Mascot />
        <mesh geometry={day} position={[0, -5.2, 1.5]} scale={[1.07, 1.12, 1.4]} rotation={[-0.05, 0, 0]}><meshBasicMaterial color={INK} /></mesh>
        <mesh geometry={day} position={[0, -5.2, 1.9]} rotation={[-0.05, 0, 0]} material={toon(LIME)} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
