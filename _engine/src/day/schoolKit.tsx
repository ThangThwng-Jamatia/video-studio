// School props for the LOCKDOWN series (Day Series). Low-poly, flat-shaded; every pose is a plain prop so episodes drive it from t.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {rnd} from './dayKit';

const M: React.FC<{c: string; e?: number; m?: number; r?: number; o?: number}> = ({c, e = 0, m = 0, r = 0.7, o = 1}) =>
  <meshStandardMaterial color={c} flatShading emissive={c} emissiveIntensity={e} metalness={m} roughness={r} transparent={o < 1} opacity={o} depthWrite={o >= 1} />;
const Box: React.FC<{p: [number, number, number]; s: [number, number, number]; c: string; e?: number; o?: number; r?: [number, number, number]}> = ({p, s, c, e, o, r}) =>
  <mesh position={p} rotation={r}><boxGeometry args={s} /><M c={c} e={e} o={o} /></mesh>;

// ---------- people ----------
export type Look = {skin: string; top: string; bottom: string; hair: string; eyes?: string; glow?: number; shoes?: string};
export const LOOKS = {
  you: {skin: '#e3b08a', top: '#19c2b4', bottom: '#2b3445', hair: '#2a1c14'},
  friend: {skin: '#c98d62', top: '#ff4a3d', bottom: '#30384a', hair: '#151010'},
  teacher: {skin: '#e9c2a0', top: '#e8e2d4', bottom: '#4a4f5c', hair: '#6b5a48'},
} satisfies Record<string, Look>;
const SKINS = ['#f0c6a2', '#d9a27a', '#b77b52', '#8d5a3b', '#e6b991'];
const TOPS = ['#3d6fd8', '#f2b230', '#7a4fd0', '#e8e8e8', '#2f9e5a', '#d84f8a', '#555c6b', '#ff8a3d'];
export const student = (i: number): Look => ({skin: SKINS[i % SKINS.length], top: TOPS[(i * 3) % TOPS.length], bottom: i % 2 ? '#2b3445' : '#4a3d33', hair: ['#1d1410', '#4a3020', '#2a1c14', '#7a5530'][i % 4]});
// zombie version of any look: grey-green skin, torn darker clothes, red glowing eyes
export const zombify = (l: Look, k = 1): Look => ({
  skin: '#' + new THREE.Color(l.skin).lerp(new THREE.Color('#8ea67a'), k).getHexString(),
  top: '#' + new THREE.Color(l.top).lerp(new THREE.Color('#3a3a34'), 0.35 * k).getHexString(),
  bottom: l.bottom, hair: l.hair, eyes: k > 0.5 ? '#ff2a1a' : '#111', glow: k > 0.5 ? 1.6 : 0,
});

type Pose = {walk?: number; walkAmt?: number; arms?: number; armUp?: number; crouch?: number; sit?: number; headYaw?: number; headTilt?: number; lean?: number; lie?: number; phone?: number; reach?: number};
// ~1.75 m tall, faces +z
export const Person: React.FC<{look: Look} & Pose> = ({look, walk = 0, walkAmt = 0, arms = 0, armUp = 0, crouch = 0, sit = 0, headYaw = 0, headTilt = 0, lean = 0, lie = 0, phone = 0, reach = 0}) => {
  const drop = sit * 0.45 + crouch * 0.55;
  const hips = 0.92 - drop;
  const thigh = -(sit * 1.57 + crouch * 1.3), shin = sit * 1.57 + crouch * 2.3;
  const sw = Math.sin(walk) * 0.55 * walkAmt;
  const eye = look.eyes ?? '#111';
  return (
    <group position={[0, lie * 0.18, 0]} rotation={[-lie * Math.PI / 2, 0, 0]}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.11, hips, 0]} rotation={[thigh + s * sw, 0, 0]}>
          <mesh position={[0, -0.23, 0]}><cylinderGeometry args={[0.085, 0.075, 0.46, 6]} /><M c={look.bottom} /></mesh>
          <group position={[0, -0.46, 0]} rotation={[shin + Math.max(0, -s * sw) * 0.6, 0, 0]}>
            <mesh position={[0, -0.22, 0]}><cylinderGeometry args={[0.07, 0.06, 0.44, 6]} /><M c={look.bottom} /></mesh>
            <mesh position={[0, -0.44, 0.06]}><boxGeometry args={[0.12, 0.08, 0.24]} /><M c={look.shoes ?? '#eeeeee'} /></mesh>
          </group>
        </group>
      ))}
      <group position={[0, hips, 0]} rotation={[lean, 0, 0]}>
        <mesh position={[0, 0.28, 0]}><cylinderGeometry args={[0.2, 0.18, 0.56, 7]} /><M c={look.top} /></mesh>
        <mesh position={[0, 0.58, 0]}><cylinderGeometry args={[0.07, 0.08, 0.08, 6]} /><M c={look.skin} /></mesh>
        <group position={[0, 0.76, 0]} rotation={[headTilt * 0.3, headYaw, headTilt * 0.4]}>
          <mesh><icosahedronGeometry args={[0.17, 1]} /><M c={look.skin} /></mesh>
          <mesh position={[0, 0.06, -0.025]} scale={[1.07, 0.75, 1.07]}><icosahedronGeometry args={[0.17, 1]} /><M c={look.hair} /></mesh>
          {[-0.06, 0.06].map((x) => <mesh key={x} position={[x, 0.0, 0.15]}><sphereGeometry args={[0.026, 6, 5]} /><meshStandardMaterial color={eye} emissive={eye} emissiveIntensity={look.glow ?? 0} /></mesh>)}
        </group>
        {[-1, 1].map((s) => {
          const up = s > 0 ? armUp : 0;
          const rx = -arms * 1.45 - up * 2.2 - (s > 0 ? reach : 0) * 1.2 - s * sw * 0.8 * (1 - arms);
          return (
            <group key={s} position={[s * 0.26, 0.52, 0]} rotation={[rx, 0, s * (0.12 - arms * 0.05)]}>
              <mesh position={[0, -0.29, 0]}><cylinderGeometry args={[0.065, 0.055, 0.58, 6]} /><M c={look.top} /></mesh>
              <mesh position={[0, -0.6, 0]}><icosahedronGeometry args={[0.06, 0]} /><M c={look.skin} /></mesh>
              {s > 0 && phone > 0 && <group position={[0, -0.62, 0.05]} rotation={[1.4, 0, 0]}>
                <mesh><boxGeometry args={[0.08, 0.15, 0.012]} /><M c="#111" /></mesh>
                <mesh position={[0, 0, 0.008]}><boxGeometry args={[0.07, 0.13, 0.004]} /><meshBasicMaterial color="#cfe8ff" /></mesh>
                <pointLight position={[0, 0, 0.15]} intensity={1.2 * phone} distance={1.6} color="#bcdcff" />
              </group>}
            </group>
          );
        })}
      </group>
    </group>
  );
};

// ---------- furniture ----------
export const Desk: React.FC = () => (
  <group>
    <Box p={[0, 0.74, 0]} s={[0.66, 0.04, 0.46]} c="#c99a62" />
    {[[-0.29, -0.19], [0.29, -0.19], [-0.29, 0.19], [0.29, 0.19]].map(([x, z], i) => <Box key={i} p={[x, 0.36, z]} s={[0.035, 0.72, 0.035]} c="#5a5f68" />)}
    <Box p={[0, 0.62, -0.05]} s={[0.6, 0.12, 0.36]} c="#3b414b" />
  </group>
);
export const Chair: React.FC = () => (
  <group>
    <Box p={[0, 0.45, 0]} s={[0.42, 0.04, 0.4]} c="#2f5fa8" />
    <Box p={[0, 0.72, 0.2]} s={[0.42, 0.34, 0.04]} c="#2f5fa8" />
    {[[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]].map(([x, z], i) => <Box key={i} p={[x, 0.22, z]} s={[0.03, 0.44, 0.03]} c="#5a5f68" />)}
  </group>
);

// ---------- interior: classroom (x -6..6, z -5..5) + hallway (x 6..9.5, z -18..18) ----------
// door: opening at x=6, z 2.0..3.2, h 2.2, hinge at z=3.2, swings OUT into the hallway (+x)
export const DOOR = {x: 6, z0: 2.0, z1: 3.2, h: 2.2};
export const H = 3.2;
export const Interior: React.FC<{lightsOn: number; ceiling: boolean; door: number; belt: number; strobe: number; deskAt?: number; hall?: number}> = ({lightsOn, ceiling, door, belt, strobe, deskAt, hall = 1}) => {
  const wall = '#e9e2cf', wall2 = '#d7dfe0', trim = '#8d7a62';
  const lockers = useMemo(() => Array.from({length: 62}, (_, i) => -17.6 + i * 0.57), []);
  return (
    <group>
      {/* floors */}
      <Box p={[0, -0.05, 0]} s={[12, 0.1, 10]} c="#bfb39a" />
      <Box p={[7.75, -0.05, 0]} s={[3.5, 0.1, 36]} c="#d6d2c4" />
      {Array.from({length: 18}, (_, i) => <Box key={i} p={[7.75, 0.002, -17 + i * 2]} s={[3.5, 0.004, 0.08]} c="#b9b4a5" />)}
      {/* classroom walls */}
      <Box p={[0, H / 2, -5.05]} s={[12.2, H, 0.1]} c={wall} />
      <Box p={[0, H / 2, 5.05]} s={[12.2, H, 0.1]} c={wall} />
      <Box p={[0, 1.55, -4.98]} s={[5.2, 1.3, 0.04]} c="#24443a" />
      <Box p={[0, 0.88, -4.94]} s={[5.2, 0.05, 0.1]} c={trim} />
      {/* window wall x=-6 */}
      <Box p={[-6.05, 0.5, 0]} s={[0.1, 1, 10]} c={wall} />
      <Box p={[-6.05, 2.85, 0]} s={[0.1, 0.7, 10]} c={wall} />
      {[-5, -2.5, 0, 2.5, 5].map((z) => <Box key={z} p={[-6.05, 1.75, z]} s={[0.12, 1.5, 0.18]} c="#f4f4f4" />)}
      <Box p={[-6.05, 1.75, 0]} s={[0.03, 1.5, 10]} c="#bfe0f5" o={0.12} />
      {/* door wall x=6 (shared with hallway), with the door hole */}
      <Box p={[6.05, H / 2, -11.5]} s={[0.1, H, 13]} c={wall2} />
      <Box p={[6.05, H / 2, 10.6]} s={[0.1, H, 14.8]} c={wall2} />
      <Box p={[6.05, (H + DOOR.h) / 2, 2.6]} s={[0.1, H - DOOR.h, 1.2]} c={wall2} />
      <Box p={[5.98, DOOR.h + 0.04, 2.6]} s={[0.06, 0.08, 1.3]} c={trim} />
      {/* door panel (hinge z1) */}
      <group position={[DOOR.x + 0.05, 0, DOOR.z1]} rotation={[0, -door, 0]}>
        <Box p={[0, 0.59, -0.6]} s={[0.06, 1.18, 1.18]} c="#a8743f" />
        <Box p={[0, 2.065, -0.6]} s={[0.06, 0.27, 1.18]} c="#a8743f" />
        <Box p={[0, 1.555, -0.85]} s={[0.06, 0.75, 0.68]} c="#a8743f" />
        <Box p={[0, 1.555, -0.095]} s={[0.06, 0.75, 0.17]} c="#a8743f" />
        <Box p={[0, 1.55, -0.345]} s={[0.07, 0.75, 0.34]} c="#cfe6f5" o={0.12} />
        <Box p={[-0.07, 1.0, -1.05]} s={[0.06, 0.05, 0.16]} c="#d9d9d9" />
        <Box p={[0.07, 1.0, -1.05]} s={[0.06, 0.05, 0.16]} c="#d9d9d9" />
      </group>
      {/* door closer: body on the header, arm down to the door */}
      <Box p={[5.88, 2.36, 2.95]} s={[0.12, 0.12, 0.42]} c="#9aa0a6" />
      <Box p={[5.86, 2.3, 2.62]} s={[0.04, 0.04, 0.5]} c="#6d7378" r={[0.18 + door * 0.4, 0, 0]} />
      {belt > 0 && <group position={[5.86, 2.32, 2.72]}>
        <mesh rotation={[0, 0, Math.PI / 2]} scale={[belt, belt, belt]}><torusGeometry args={[0.1, 0.028, 5, 12]} /><M c="#6b3f22" /></mesh>
        <mesh position={[0, -0.12 * belt, 0]} scale={[belt, belt, belt]}><boxGeometry args={[0.05, 0.18, 0.05]} /><M c="#6b3f22" /></mesh>
        <mesh position={[0, -0.22 * belt, 0]} scale={[belt, belt, belt]}><boxGeometry args={[0.07, 0.05, 0.02]} /><M c="#d8b25a" m={0.6} /></mesh>
      </group>}
      {deskAt !== undefined && <group position={[5.55, 0, 2.6]} rotation={[0, Math.PI / 2, 0]}><group position={[0, 0, deskAt]}><Desk /></group></group>}
      {/* hallway: lockers on x=9.5, end walls */}
      <Box p={[9.55, H / 2, 0]} s={[0.1, H, 36]} c={wall2} />
      {lockers.map((z, i) => (
        <group key={i} position={[9.3, 0, z]}>
          <Box p={[0, 0.95, 0]} s={[0.4, 1.8, 0.54]} c={i % 9 === 4 ? '#c94a3a' : '#3f6fb5'} />
          <Box p={[-0.205, 1.6, 0]} s={[0.01, 0.2, 0.3]} c="#2b4d80" />
          <Box p={[-0.205, 0.95, 0.18]} s={[0.012, 0.12, 0.04]} c="#cfcfcf" />
        </group>
      ))}
      <Box p={[7.75, H / 2, -18]} s={[3.6, H, 0.1]} c={wall2} />
      <Box p={[7.75, H / 2, 18]} s={[3.6, H, 0.1]} c={wall2} />
      <Box p={[7.75, 2.5, -17.9]} s={[1.4, 0.4, 0.05]} c="#2a8a4a" e={0.6} />
      {/* fire alarm strobe on the locker wall */}
      <group position={[9.0, 2.45, 0.2]}>
        <Box p={[0, 0, 0]} s={[0.12, 0.28, 0.22]} c="#d42020" e={0.2 + strobe * 2.5} />
        <Box p={[-0.07, 0.06, 0]} s={[0.04, 0.08, 0.14]} c="#ffffff" e={strobe * 3} />
      </group>
      {strobe > 0 && <pointLight position={[8.2, 2.6, 0.2]} intensity={10 * strobe} distance={14} decay={1} color="#ff2a2a" />}
      {/* ceilings + lights */}
      {ceiling && <>
        <Box p={[0, H + 0.05, 0]} s={[12.2, 0.1, 10.2]} c="#efeee8" />
        <Box p={[7.75, H + 0.05, 0]} s={[3.6, 0.1, 36]} c="#efeee8" />
        {[[-3, -2.5], [3, -2.5], [-3, 2.5], [3, 2.5]].map(([x, z], i) => <Box key={i} p={[x, H - 0.02, z]} s={[1.6, 0.04, 0.5]} c="#ffffff" e={lightsOn * 1.4} />)}
        {Array.from({length: 7}, (_, i) => <Box key={i} p={[7.75, H - 0.02, -15 + i * 5]} s={[0.5, 0.04, 1.6]} c="#ffffff" e={hall * (0.3 + 1.1 * (1 - strobe * 0))} />)}
      </>}
      {lightsOn > 0 && [[-3, 0], [3, 0]].map(([x, z], i) => <pointLight key={i} position={[x, 2.9, z]} intensity={7 * lightsOn} distance={10} decay={1.2} color="#fff6e6" />)}
      <pointLight position={[7.75, 2.9, -6]} intensity={4 * hall} distance={14} decay={1.1} color="#f4f7ff" />
      <pointLight position={[7.75, 2.9, 6]} intensity={4 * hall} distance={14} decay={1.1} color="#f4f7ff" />
    </group>
  );
};

// ---------- exterior ----------
export const Exterior: React.FC<{windows: number; dusk: number}> = ({windows, dusk}) => {
  const cols = 14;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}><planeGeometry args={[400, 400]} /><M c="#5d9a4a" /></mesh>
      <Box p={[0, 0.0, 14]} s={[120, 0.04, 6]} c="#4a4d52" />
      {[-40, -25, -10, 5, 20, 35].map((x) => <Box key={x} p={[x, 0.03, 14]} s={[4, 0.01, 0.25]} c="#f2d34a" />)}
      <Box p={[0, 0.02, 9.5]} s={[60, 0.04, 2.5]} c="#c9c4b8" />
      {/* building */}
      <Box p={[0, 4, 0]} s={[36, 8, 14]} c="#b25a42" />
      <Box p={[0, 8.15, 0]} s={[36.6, 0.3, 14.6]} c="#d8d2c4" />
      <Box p={[0, 2.6, 7.4]} s={[7, 5.2, 1]} c="#d8d2c4" />
      <Box p={[0, 5.6, 7.95]} s={[7.4, 0.5, 0.2]} c="#2f5fa8" />
      <Box p={[0, 1.3, 7.92]} s={[3.2, 2.6, 0.1]} c="#2d3b4a" />
      {[0, 1].map((fl) => Array.from({length: cols}, (_, i) => {
        const x = -16.5 + i * (33 / (cols - 1));
        if (Math.abs(x) < 4.2) return null;
        const lit = windows * (0.55 + 0.45 * rnd(i + fl * 31));
        const c = new THREE.Color('#9fc6de').lerp(new THREE.Color('#ffd48a'), dusk).lerp(new THREE.Color('#151a22'), dusk * (1 - lit));
        return <Box key={`${fl}-${i}`} p={[x, 2 + fl * 3.4, 7.03]} s={[1.6, 1.8, 0.06]} c={'#' + c.getHexString()} e={dusk * lit * 1.2} />;
      }))}
      {/* flagpole, trees, bus */}
      <Box p={[-6, 5, 10.5]} s={[0.15, 10, 0.15]} c="#dddddd" />
      <Box p={[-5.2, 9.2, 10.5]} s={[1.5, 0.9, 0.04]} c="#e03b3b" />
      {[[-24, 6], [-21, 10], [22, 7], [26, 11], [-30, -4], [31, -2]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}><Box p={[0, 0.8, 0]} s={[0.4, 1.6, 0.4]} c="#6b4a32" /><mesh position={[0, 3, 0]}><coneGeometry args={[2, 3.8, 7]} /><M c={i % 2 ? '#3f7d3a' : '#4f8f45'} /></mesh></group>
      ))}
      <group position={[-15, 0, 14]}>
        <Box p={[0, 1.6, 0]} s={[9, 2.6, 2.5]} c="#f2b51d" />
        <Box p={[0, 2.3, 1.27]} s={[7.6, 0.8, 0.04]} c="#2d3b4a" />
        <Box p={[0, 1.2, 1.27]} s={[9, 0.12, 0.04]} c="#1a1a1a" />
        {[-3, 3].map((x) => <mesh key={x} position={[x, 0.45, 1.2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.45, 0.45, 0.3, 8]} /><M c="#1a1a1a" /></mesh>)}
      </group>
    </group>
  );
};

// ---------- floor-plan map (x -30..30, z -17..17) with 1,000 student tokens ----------
type Room = {x0: number; x1: number; z0: number; z1: number; c: string};
export const ROOMS: Room[] = [
  {x0: -29, x1: 29, z0: -2, z1: 2, c: '#c9c3b2'},
  ...[-29, -23, -17, -11, -5, 1].map((x) => ({x0: x, x1: x + 6, z0: -14, z1: -2, c: '#e6dfcc'})),
  ...[-29, -23, -17, -11].map((x) => ({x0: x, x1: x + 6, z0: 2, z1: 14, c: '#e6dfcc'})),
  {x0: -5, x1: 14, z0: 2, z1: 16, c: '#f1d7a8'},
  {x0: 7, x1: 29, z0: -16, z1: -2, c: '#cfe0e6'},
  {x0: 14, x1: 29, z0: 2, z1: 15, c: '#dcd3ea'},
];
export const CAFE_ROOM = ROOMS[11];
export const YOUR_ROOM = ROOMS[5];
export const ZERO: [number, number] = [-6, 0];
export const TOKENS = (() => {
  const area = ROOMS.map((r) => (r.x1 - r.x0) * (r.z1 - r.z0)), tot = area.reduce((a, b) => a + b, 0);
  const pts: [number, number][] = [];
  ROOMS.forEach((r, ri) => {
    const n = ri === ROOMS.length - 1 ? 1000 - pts.length : Math.round((1000 * area[ri]) / tot);
    for (let i = 0; i < n && pts.length < 1000; i++) pts.push([r.x0 + 0.6 + rnd(pts.length * 2 + 1) * (r.x1 - r.x0 - 1.2), r.z0 + 0.6 + rnd(pts.length * 2 + 2) * (r.z1 - r.z0 - 1.2)]);
  });
  // infection order: nearest to patient zero first (with a little noise)
  return pts.sort((a, b) => Math.hypot(a[0] - ZERO[0], a[1] - ZERO[1]) * (0.8 + rnd(a[0] * 7) * 0.4) - Math.hypot(b[0] - ZERO[0], b[1] - ZERO[1]) * (0.8 + rnd(b[0] * 7) * 0.4));
})();
export const FloorPlan: React.FC<{infected: number; t: number; highlight?: number}> = ({infected, t, highlight = 0}) => {
  const mesh = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.28, 0.28, 0.5, 6);
    const m = new THREE.MeshStandardMaterial({flatShading: true, roughness: 0.6});
    const im = new THREE.InstancedMesh(g, m, TOKENS.length);
    return im;
  }, []);
  const mtx = new THREE.Matrix4(), red = new THREE.Color('#ff2e2e'), blue = new THREE.Color('#4a8cff'), you = new THREE.Color('#19e0cf');
  TOKENS.forEach(([x, z], i) => {
    const inf = i < infected;
    const jig = inf ? Math.sin(t * 6 + i) * 0.06 : 0;
    mtx.makeTranslation(x + jig, inf ? 0.45 : 0.3, z);
    if (inf) mtx.multiply(new THREE.Matrix4().makeScale(1.25, 1.6, 1.25));
    mesh.setMatrixAt(i, mtx);
    mesh.setColorAt(i, inf ? red : blue);
  });
  mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return (
    <group>
      <Box p={[0, -0.3, 0]} s={[70, 0.4, 44]} c="#2a3140" />
      {ROOMS.map((r, i) => {
        const w = r.x1 - r.x0, d = r.z1 - r.z0, cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
        const hl = i === 5 ? highlight : 0;
        return <group key={i}>
          <Box p={[cx, 0, cz]} s={[w - 0.1, 0.12, d - 0.1]} c={hl > 0 ? '#' + new THREE.Color(r.c).lerp(new THREE.Color('#19e0cf'), hl * 0.5).getHexString() : r.c} />
          {[[cx, r.z0, w, 0.25], [cx, r.z1, w, 0.25]].map(([x, z, sx, sz], j) => <Box key={j} p={[x, 0.5, z]} s={[sx, 1, sz]} c="#f7f4ec" />)}
          {[[r.x0, cz, 0.25, d], [r.x1, cz, 0.25, d]].map(([x, z, sx, sz], j) => <Box key={'v' + j} p={[x, 0.5, z]} s={[sx, 1, sz]} c="#f7f4ec" />)}
        </group>;
      })}
      <primitive object={mesh} />
      {highlight > 0 && <mesh position={[(YOUR_ROOM.x0 + YOUR_ROOM.x1) / 2, 0.4, (YOUR_ROOM.z0 + YOUR_ROOM.z1) / 2]}><cylinderGeometry args={[0.45, 0.45, 1.2, 6]} /><meshStandardMaterial color={you} emissive={you} emissiveIntensity={0.8} flatShading /></mesh>}
    </group>
  );
};

// ---------- cafeteria (x -9..9, z -7..7), doors on x=-9 ----------
export const Cafeteria: React.FC<{strobe: number; sun: number}> = ({strobe, sun}) => (
  <group>
    <Box p={[0, -0.05, 0]} s={[18, 0.1, 14]} c="#cbbfa6" />
    {Array.from({length: 9}, (_, i) => Array.from({length: 7}, (_, j) => (i + j) % 2 ? null : <Box key={`${i}-${j}`} p={[-8 + i * 2, 0.002, -6 + j * 2]} s={[2, 0.004, 2]} c="#b9ad94" />))}
    <Box p={[0, 2, -7.05]} s={[18.2, 4, 0.1]} c="#e3dccb" />
    <Box p={[9.05, 2, 0]} s={[0.1, 4, 14]} c="#e3dccb" />
    {/* window wall z=+7 (sunset light) */}
    <Box p={[0, 0.5, 7.05]} s={[18.2, 1, 0.1]} c="#e3dccb" />
    <Box p={[0, 3.5, 7.05]} s={[18.2, 1, 0.1]} c="#e3dccb" />
    {[-9, -6, -3, 0, 3, 6, 9].map((x) => <Box key={x} p={[x, 2, 7.05]} s={[0.2, 2, 0.14]} c="#f4f4f4" />)}
    {/* door wall x=-9 with a double door gap at z -1.4..1.4 */}
    <Box p={[-9.05, 2, -4.2]} s={[0.1, 4, 5.6]} c="#e3dccb" />
    <Box p={[-9.05, 2, 4.2]} s={[0.1, 4, 5.6]} c="#e3dccb" />
    <Box p={[-9.05, 3.3, 0]} s={[0.1, 1.4, 2.8]} c="#e3dccb" />
    <Box p={[-8.3, 1.3, 2.0]} s={[1.3, 2.6, 0.06]} c="#2f5fa8" r={[0, -0.9, 0]} />
    <Box p={[-8.3, 1.3, -2.0]} s={[1.3, 2.6, 0.06]} c="#2f5fa8" r={[0, 0.9, 0]} />
    <Box p={[0, 4.05, 0]} s={[18.2, 0.1, 14.2]} c="#efeee8" />
    {/* long tables + benches */}
    {[-3.6, 0, 3.6].map((z) => [-4.5, 3.2].map((x) => (
      <group key={`${x}${z}`} position={[x, 0, z]}>
        <Box p={[0, 0.78, 0]} s={[6, 0.06, 1.2]} c="#e8e2d4" />
        {[-2.7, 2.7].map((dx) => <Box key={dx} p={[dx, 0.38, 0]} s={[0.1, 0.76, 1.0]} c="#6d7378" />)}
        {[-0.95, 0.95].map((dz) => <Box key={dz} p={[0, 0.42, dz]} s={[6, 0.06, 0.36]} c="#2f5fa8" />)}
      </group>
    )))}
    <Box p={[8.6, 1.2, -4]} s={[0.8, 2.4, 3.5]} c="#9aa0a6" />
    <pointLight position={[0, 3.6, 0]} intensity={3} distance={20} decay={1} color="#dfe6ff" />
    {sun > 0 && <pointLight position={[0, 3, 9]} intensity={8 * sun} distance={22} decay={1} color="#ff9a55" />}
    {strobe > 0 && <pointLight position={[-6, 3.4, 0]} intensity={14 * strobe} distance={20} decay={1} color="#ff2a2a" />}
    <group position={[-8.9, 3.0, -2.2]}><Box p={[0, 0, 0]} s={[0.12, 0.28, 0.22]} c="#d42020" e={0.2 + strobe * 2.5} /></group>
  </group>
);

// ---------- stairwell (x -2.5..2.5, z -3..3), fire door on z=3 (hinge x=+0.5, swings in) ----------
export const Stairwell: React.FC<{door: number; glow?: number}> = ({door, glow = 1}) => {
  const con = '#9a9890', con2 = '#86847c';
  return (
    <group>
      <Box p={[0, -0.05, 1.5]} s={[5, 0.1, 3]} c={con} />
      <Box p={[0, 1.4, -3.05]} s={[5, 6, 0.1]} c={con2} />
      <Box p={[-2.55, 1.4, 0]} s={[0.1, 6, 6]} c={con2} />
      <Box p={[2.55, 1.4, 0]} s={[0.1, 6, 6]} c={con2} />
      <Box p={[-1.5, 1.6, 3.05]} s={[2, 3.2, 0.1]} c={con2} />
      <Box p={[1.75, 1.6, 3.05]} s={[1.5, 3.2, 0.1]} c={con2} />
      <Box p={[0, 2.7, 3.05]} s={[1, 1, 0.1]} c={con2} />
      {/* down flight on the left, up flight on the right */}
      {Array.from({length: 10}, (_, i) => <Box key={'d' + i} p={[-1.25, -0.09 - i * 0.17, -0.15 - i * 0.28]} s={[2.4, 0.17, 0.28]} c={i % 2 ? con : '#a6a49c'} />)}
      {Array.from({length: 10}, (_, i) => <Box key={'u' + i} p={[1.25, 0.09 + i * 0.17, -0.15 - i * 0.28]} s={[2.4, 0.17, 0.28]} c={i % 2 ? con : '#a6a49c'} />)}
      <Box p={[0, 0.5, -1.4]} s={[0.08, 1, 2.8]} c="#c9a227" r={[0.55, 0, 0]} />
      <Box p={[-1.25, -0.05, -3.4]} s={[2.4, 0.1, 1]} c={con} />
      {/* fire door */}
      <group position={[0.5, 0, 3.0]} rotation={[0, -door, 0]}>
        <Box p={[-0.5, 1.1, 0]} s={[1, 2.2, 0.06]} c="#b8322a" />
        <Box p={[-0.7, 1.55, -0.035]} s={[0.22, 0.4, 0.02]} c="#cfe6f5" o={0.5} />
        <Box p={[-0.5, 1.0, -0.06]} s={[0.8, 0.06, 0.06]} c="#cfcfcf" />
        <Box p={[-0.5, 1.8, 0.035]} s={[0.5, 0.12, 0.01]} c="#ffffff" />
      </group>
      <Box p={[0.15, 2.28, 2.92]} s={[0.4, 0.1, 0.12]} c="#9aa0a6" />
      <Box p={[0, 2.5, 2.93]} s={[0.7, 0.24, 0.06]} c="#2a8a4a" e={1.2} />
      {/* battery emergency light */}
      <group position={[-2.45, 2.6, 0.8]}><Box p={[0, 0, 0]} s={[0.1, 0.18, 0.5]} c="#efefef" />{[-0.14, 0.14].map((z) => <Box key={z} p={[0.07, -0.02, z]} s={[0.06, 0.1, 0.1]} c="#fff2c0" e={2 * glow} />)}</group>
      <pointLight position={[-2, 2.4, 0.8]} intensity={5 * glow} distance={9} decay={1.1} color="#ffe7b0" />
      <pointLight position={[0, 2.3, 2.5]} intensity={1.5} distance={4} decay={1} color="#5cff8a" />
    </group>
  );
};

// ---------- walk-in freezer (x -1.5..1.5, z -1.5..1.5, h 2.3), door on z=+1.5 at x 0.3..1.2 (hinge x 1.2) ----------
export const WalkIn: React.FC<{door: number; knock?: number; under?: number}> = ({door, knock = 0, under = 0}) => {
  const st = '#c6ccd2', st2 = '#aeb5bc';
  return (
    <group>
      <Box p={[0, -0.05, 0]} s={[3, 0.1, 3]} c="#8d949b" />
      {Array.from({length: 6}, (_, i) => <Box key={i} p={[-1.25 + i * 0.5, 0.002, 0]} s={[0.04, 0.004, 3]} c="#7a8188" />)}
      <Box p={[0, 1.15, -1.55]} s={[3.1, 2.3, 0.1]} c={st} />
      <Box p={[-1.55, 1.15, 0]} s={[0.1, 2.3, 3.1]} c={st2} />
      <Box p={[1.55, 1.15, 0]} s={[0.1, 2.3, 3.1]} c={st2} />
      <Box p={[0, 2.35, 0]} s={[3.1, 0.1, 3.1]} c="#dfe4e8" />
      <Box p={[-0.6, 1.15, 1.55]} s={[1.8, 2.3, 0.1]} c={st} />
      <Box p={[0.75, 2.2, 1.55]} s={[0.9, 0.3, 0.1]} c={st} />
      {/* shelves with boxes */}
      {[0.4, 1.0, 1.6].map((y, j) => <group key={j}>
        <Box p={[-1.25, y, -0.2]} s={[0.5, 0.04, 2.4]} c="#9aa0a6" />
        {[-1.1, -0.5, 0.2, 0.8].map((z, i) => <Box key={i} p={[-1.25, y + 0.16, z]} s={[0.4, 0.28, 0.42]} c={['#d8c49a', '#e8e2d4', '#c9a87a', '#d1d6dc'][(i + j) % 4]} />)}
      </group>)}
      {/* door: hinge x=1.2, swings out (+z) */}
      <group position={[1.2, 0, 1.5 + knock * 0.012]} rotation={[0, -door, 0]}>
        <Box p={[-0.45, 1.05, 0]} s={[0.9, 2.1, 0.1]} c="#d5dade" />
        {/* inside safety release: red push knob */}
        <Box p={[-0.78, 1.0, -0.09]} s={[0.05, 0.05, 0.1]} c="#9aa0a6" />
        <mesh position={[-0.78, 1.0, -0.16]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.06, 0.06, 0.05, 10]} /><M c="#e02020" e={0.5} /></mesh>
      </group>
      {/* light strip under the door + two shadows (feet) */}
      {under > 0 && <>
        <Box p={[0.75, 0.01, 1.47]} s={[0.86, 0.01, 0.06]} c="#ffd9a0" e={2 * under} />
        <Box p={[0.62, 0.012, 1.47]} s={[0.14, 0.012, 0.065]} c="#111" o={under} />
        <Box p={[0.9, 0.012, 1.47]} s={[0.14, 0.012, 0.065]} c="#111" o={under} />
      </>}
      <Box p={[0, 2.28, 0]} s={[0.5, 0.04, 0.3]} c="#dff4ff" e={0.8} />
      <pointLight position={[0, 2.1, 0]} intensity={2.4} distance={6} decay={1.2} color="#bfe6ff" />
    </group>
  );
};
