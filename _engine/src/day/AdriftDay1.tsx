// ADRIFT — Day 1 (Day Series, 9:16). Low-poly 3D world keyed to words in adriftDay1Words.ts.
import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useVideoConfig} from 'remotion';
import {
  ACC, Bar, Bottle, Cam, CameraRig, Captions, Card, DayAudio, Flare, FONT, Grain, handheld, Island, Mirror, mix, mix3, Ocean, phaseCol, phaseNum,
  Pill, pop, projector, Raft, Ring, Ship, Sky, Stamp, Stars, Survivor, Tag, useT, V3, Vignette, waveH, ease, Sfx,
} from './dayKit';
import {WORDS} from './adriftDay1Words';
import {interpolate} from 'remotion';

export const ADRIFT1_SEC = 68.4;
const JOB = 'jobs/adrift-day1';
const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// ---------- story clock ----------
// phase: 0 morning, 1 noon, 2 sunset, 3 night
const phase = (t: number) => interpolate(t, [0, 36.8, 38.2, 50.8, 52.6, 57.6, 59.2], [0, 0.25, 1, 1, 2, 2.35, 3], CL);
const clockMin = (t: number) => interpolate(t, [0, 37.68, 51.68, 59.06, 68.4], [6 * 60 + 41, 12 * 60, 19 * 60 + 34, 23 * 60 + 47, 23 * 60 + 52], CL);
const SKY_TOP = ['#5f9ccc', '#2f86d6', '#2c2a5a', '#04060d'];
const SKY_BOT = ['#f6d7b0', '#c4e6f5', '#ff8645', '#18264a'];
const SEA = ['#2b6f8f', '#1c84ad', '#6a4a6e', '#0c1c33'];

// ---------- shots ----------
type Shot = {from: number; to: number; cam: (k: number, t: number) => Cam};
const C = (pos: V3, look: V3, fov = 40): Cam => ({pos, look, fov});
const lerp = (a: Cam, b: Cam) => (k: number): Cam => ({pos: mix3(a.pos, b.pos, k), look: mix3(a.look, b.look, k), fov: mix(a.fov, b.fov, k)});
const SHIP_AT: V3 = [-7, 0, -26];
const LAND_AT: V3 = [32, 0, -46];
const WRECK_AT: V3 = [-4, 0, -14];
const NIGHT_SHIP: V3 = [28, 5, 130];
const SHOTS: Shot[] = [
  {from: 0, to: 2.16, cam: lerp(C([0, 9, 0.6], [0, 0.4, 0], 42), C([0, 4.6, 3.4], [0, 0.8, 0], 42))},
  {from: 2.16, to: 3.34, cam: lerp(C([3.2, 2.2, 6.5], [-6, 1.5, -26], 34), C([2.6, 2.0, 5], [-6, 0.5, -26], 30))},
  {from: 3.34, to: 5.42, cam: (k) => { const a = mix(0.4, 1.5, k), r = mix(9, 30, k); return C([Math.sin(a) * r, mix(5, 24, k), Math.cos(a) * r], [0, 0, 0], 46); }},
  {from: 5.42, to: 8.8, cam: lerp(C([-9, 1.3, 10], [0, 1, 0], 38), C([-6, 1.6, 7.5], [0, 1.2, 0], 38))},
  {from: 8.8, to: 10.58, cam: lerp(C([0, 0.8, 7], [0, 1.5, 0], 40), C([0, 1.5, 4.4], [0, 1.5, 0], 40))},
  {from: 10.58, to: 17.28, cam: lerp(C([0, 2.8, 6.4], [0, 1.8, 0.6], 40), C([0.3, 2.6, 5.6], [0, 1.9, 0.6], 40))},
  {from: 17.28, to: 23.58, cam: lerp(C([2.8, 1.9, 2.6], [0, 1.4, 0], 38), C([2.0, 1.7, 1.9], [0, 1.4, 0], 36))},
  {from: 23.58, to: 26.58, cam: lerp(C([0, 6, 5.5], [0, 0.4, 0], 40), C([0, 8, 6.5], [0, 0.4, 0], 40))},
  {from: 26.58, to: 29.7, cam: lerp(C([1.7, 0.55, 3.2], [3, 0, 0.6], 44), C([1.4, 0.45, 2.6], [3, -0.1, 0.4], 44))},
  {from: 29.7, to: 37.68, cam: (k) => { const a = mix(-0.6, 0.6, k); return C([Math.sin(a) * 7, 2.4, Math.cos(a) * 7], [0, 1.0, 0], 40); }},
  {from: 37.68, to: 40.6, cam: lerp(C([0, 1.2, 5.5], [0, 7, -5], 50), C([0, 1.4, 6.2], [0, 9, -4], 50))},
  {from: 40.6, to: 43.28, cam: lerp(C([3.6, 3.4, 5.2], [0, 1, 0], 40), C([2.8, 2.6, 4.4], [0, 1, 0], 40))},
  {from: 43.28, to: 51.68, cam: lerp(C([6, 82, 8], [6, 0, -14], 45), C([5, 70, 6], [6, 0, -14], 45))},
  {from: 51.68, to: 58.62, cam: lerp(C([-6, 1.5, 9], [0, 2, -40], 40), C([-4, 1.4, 6.8], [0, 2, -40], 38))},
  {from: 58.62, to: 63.32, cam: lerp(C([-1.6, 3.4, -3.4], [12, 0.5, 50], 44), C([-1.2, 3.1, -2.6], [14, 1, 60], 38))},
  {from: 63.32, to: 65.02, cam: lerp(C([0, 2.3, 5.2], [0, 1.9, 1.2], 38), C([0, 2.2, 4.4], [0, 1.9, 1.2], 38))},
  {from: 65.02, to: ADRIFT1_SEC + 1, cam: lerp(C([0, 3, 6], [0, 1, 0], 40), C([0, 12, 20], [0, 0, 0], 40))},
];
const shotAt = (t: number) => SHOTS.findIndex((s) => t >= s.from && t < s.to);
const camAt = (t: number): Cam => {
  const s = SHOTS[Math.max(0, shotAt(t))];
  const k = ease(t, s.from, s.to, Easing.inOut(Easing.sin));
  const base = s.cam(k, t);
  const bob = waveH(0, 0, t) * 0.35; // camera rides the swell a little
  return handheld({...base, pos: [base.pos[0], base.pos[1] + bob, base.pos[2]]}, t);
};

// ---------- world ----------
const raftPose = (t: number) => {
  const y = waveH(0, 0, t), dx = (waveH(0.6, 0, t) - waveH(-0.6, 0, t)) / 1.2, dz = (waveH(0, 0.6, t) - waveH(0, -0.6, t)) / 1.2;
  return {y: y + 0.05, rx: dz * 0.7, rz: -dx * 0.7};
};
// kit item float-in (k 0..1) toward the camera
const itemK = (t: number, at: number) => (t < 10.5 || t > 17.4 ? 0 : pop(t, at, 0.45));
const ITEMS = {bottle: {at: 13.36, p: [-0.6, 2.15, 0.9] as V3}, flares: {at: 14.8, p: [0, 2.3, 0.9] as V3}, mirror: {at: 16.0, p: [0.6, 2.15, 0.9] as V3}};

export const World: React.FC<{t: number}> = ({t}) => {
  const p = phase(t);
  const top = phaseCol(SKY_TOP, p), bot = phaseCol(SKY_BOT, p), sea = phaseCol(SEA, p);
  const el = (phaseNum([14, 78, 3, -30], p) * Math.PI) / 180;
  const sunDir: V3 = [0.25, Math.sin(el), -Math.cos(el)];
  const sunCol = phaseCol(['#ffe0b5', '#ffffff', '#ff8a4a', '#7f9cff'], p);
  const night = ease(p, 2.3, 3, Easing.linear);
  const rp = raftPose(t);
  const sink = ease(t, -0.5, 7, Easing.in(Easing.quad));
  const lie = 1 - ease(t, 0.5, 1.9);
  const canopy = ease(t, 40.68, 41.7, Easing.out(Easing.back(1.2))) * (1 - ease(t, 51.7, 52.6));
  const headYaw = t > 58.6 && t < 63.3 ? Math.PI : t > 26.6 && t < 29.7 ? 1.1 : Math.sin(t * 0.5) * 0.25;
  const blink = t > 59.8 ? (Math.sin(t * 6) > 0.2 ? 1 : 0.35) * ease(t, 59.8, 60.2) : 0;
  const ring = ease(t, 47.28, 47.9, Easing.out(Easing.back(1.4)));
  const flaresLit = t > 63.3 && t < 66 ? ease(t, 63.9, 64.3) * (0.8 + Math.sin(t * 20) * 0.2) : 0;
  return (
    <>
      <Sky top={top} bot={bot} />
      <fog attach="fog" args={[bot, 40, 230]} />
      <Stars k={night} />
      <hemisphereLight args={[top, sea, mix(0.9, 0.55, night)]} />
      <directionalLight position={[sunDir[0] * 50, Math.max(4, sunDir[1] * 50), sunDir[2] * 50]} intensity={phaseNum([1.8, 2.6, 1.5, 0.35], p)} color={sunCol} />
      {/* sun / moon disc */}
      <mesh position={[sunDir[0] * 300, sunDir[1] * 300 + (night > 0.5 ? 120 : 0), sunDir[2] * 300]}><icosahedronGeometry args={[night > 0.5 ? 8 : 14, 2]} /><meshBasicMaterial color={night > 0.5 ? '#e8eeff' : sunCol} fog={false} /></mesh>
      <Ocean t={t} color={sea} />
      <group position={[0, rp.y, 0]} rotation={[rp.rx, 0, rp.rz]}>
        <Raft canopy={canopy} />
        <Survivor lie={lie} headYaw={headYaw} armUp={t > 63.3 && t < 65 ? ease(t, 63.4, 63.9) * 0.5 : 0} />
      </group>
      {/* the ship going down */}
      {t < 4.2 && <group position={[SHIP_AT[0], mix(-0.6, -9, sink), SHIP_AT[2]]} rotation={[mix(0.45, 1.15, sink), 0.6, 0.15]}><Ship /></group>}
      {/* debris */}
      {t < 10.6 && [0, 1, 2, 3, 4].map((i) => { const x = -3 + rnd2(i) * 8, z = -6 - rnd2(i + 5) * 12; return <mesh key={i} position={[x, waveH(x, z, t) + 0.1, z]} rotation={[0, i, 0.2]}><boxGeometry args={[0.9 + i * 0.2, 0.2, 0.5]} /><meshStandardMaterial color="#6b4a32" flatShading /></mesh>; })}
      {/* kit items */}
      {(Object.keys(ITEMS) as (keyof typeof ITEMS)[]).map((key) => {
        const it = ITEMS[key], k = itemK(t, it.at);
        if (k <= 0) return null;
        const pos: V3 = [it.p[0], it.p[1] + Math.sin(t * 2 + it.at) * 0.05 - (1 - k) * 0.8, it.p[2]];
        return <group key={key} position={pos} scale={k * 0.5} rotation={[0.15, t * 0.8 + it.at, 0]}>
          {key === 'bottle' && <Bottle />}
          {key === 'mirror' && <Mirror />}
          {key === 'flares' && [-0.22, 0, 0.22].map((x) => <group key={x} position={[x, 0, 0]} rotation={[0, 0, x * 0.6]}><Flare /></group>)}
        </group>;
      })}
      {/* three flares, final beat */}
      {t > 63.3 && t < 65.1 && [-0.45, 0, 0.45].map((x, i) => <group key={x} position={[x, 1.9 + Math.sin(t * 2 + i) * 0.04, 1.2]} rotation={[0, 0, x * 0.4]} scale={pop(t, 63.66 + i * 0.12) * 0.55}><Flare lit={flaresLit} /></group>)}
      {/* map beats: land + search zone */}
      {t > 43 && t < 52 && <group position={LAND_AT}><Island /></group>}
      {t > 47 && t < 52 && <group position={WRECK_AT}>
        <Ring r={26 * ring} w={0.6} color="#5CC8FF" o={0.9} />
        <Ring r={26 * ring * (0.4 + ((t * 0.6) % 1) * 0.6)} w={0.4} color="#5CC8FF" o={0.35 * (1 - ((t * 0.6) % 1))} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.85, 0]}><circleGeometry args={[26 * ring, 64]} /><meshBasicMaterial color="#5CC8FF" transparent opacity={0.12} depthWrite={false} /></mesh>
      </group>}
      {/* the ship light at midnight */}
      {blink > 0 && <group position={NIGHT_SHIP}>
        <mesh><icosahedronGeometry args={[1.3, 1]} /><meshBasicMaterial color="#fff3c4" fog={false} transparent opacity={blink} /></mesh><mesh><sphereGeometry args={[3.5, 16, 12]} /><meshBasicMaterial color="#ffd27a" fog={false} transparent opacity={0.25 * blink} depthWrite={false} /></mesh>
        <mesh position={[-3, -0.6, 0]}><boxGeometry args={[9, 1.2, 1.5]} /><meshBasicMaterial color="#05080f" fog={false} /></mesh>
      </group>}
    </>
  );
};
const rnd2 = (i: number) => { const x = Math.sin(i * 91.7 + 7.3) * 43758.5453; return x - Math.floor(x); };

// ---------- HUD + beats (HTML) ----------
const fmtClock = (m: number) => { const h = Math.floor(m / 60) % 24, mm = Math.floor(m % 60); const ap = h >= 12 ? 'PM' : 'AM'; return `${((h + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${ap}`; };
const HUD: React.FC<{t: number}> = ({t}) => {
  if (t < 9.26) return null;
  const k = ease(t, 9.26, 9.7, Easing.out(Easing.cubic));
  const water = 1.5; // no water drunk on Day 1
  const temp = Math.round(interpolate(t, [0, 37.6, 39, 51.7, 57.5, 62], [24, 27, 34, 33, 21, 19], CL));
  const stat = (at: number) => pop(t, at, 0.35);
  return (
    <div style={{position: 'absolute', left: 56, right: 56, top: 92, display: 'flex', justifyContent: 'space-between', opacity: k, transform: `translateY(${(1 - k) * -40}px)`, fontFamily: FONT}}>
      <div style={{color: 'white', textShadow: '0 3px 12px rgba(0,0,0,0.7)'}}>
        <div style={{fontWeight: 800, fontSize: 30, letterSpacing: '0.16em', color: ACC.red}}>● DAY 1 <span style={{color: 'white', opacity: 0.8}}>· ADRIFT</span></div>
        <div style={{fontWeight: 900, fontSize: 76, lineHeight: 1, marginTop: 6}}>{fmtClock(clockMin(t))}</div>
        <div style={{fontWeight: 700, fontSize: 26, letterSpacing: '0.12em', color: ACC.amber, marginTop: 8}}>RESCUE: UNKNOWN</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14}}>
        {stat(13.8) > 0 && <div style={{transform: `scale(${stat(13.8)})`}}><Pill color={ACC.blue} size={32}><span style={{color: ACC.blue}}>{water.toFixed(1)} L</span>WATER</Pill></div>}
        {stat(15.06) > 0 && <div style={{transform: `scale(${stat(15.06)})`}}><Pill color={ACC.red} size={32}><span style={{color: ACC.red}}>3</span>FLARES</Pill></div>}
        {stat(38.7) > 0 && <div style={{transform: `scale(${stat(38.7)})`}}><Pill color={ACC.amber} size={32}><span style={{color: temp > 30 ? ACC.amber : ACC.blue}}>{temp}°C</span>TEMP</Pill></div>}
      </div>
    </div>
  );
};

const Beats: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const {width: W, height: H} = useVideoConfig();
  const proj = projector(cam, W, H);
  const rp = raftPose(t);
  const n76 = Math.round(interpolate(t, [5.9, 6.9], [0, 76], {...CL, easing: Easing.out(Easing.cubic)}));
  const cd = Math.max(0, 24 * 3600 - Math.max(0, t - 20.9) * 3600 * 0.9); // fast-forward countdown
  const hh = Math.floor(cd / 3600), mm = Math.floor((cd % 3600) / 60), ss = Math.floor(cd % 60);
  const salt = ease(t, 30.3, 31.1), kid = ease(t, 31.4, 32.2), thirst = ease(t, 35.0, 36.4, Easing.out(Easing.cubic));
  // map projections
  const raftS = proj([0, 1, 0]), landS = proj([LAND_AT[0], 2, LAND_AT[2]]), wreckS = proj([WRECK_AT[0], 1, WRECK_AT[2] - 26]);
  const arrowK = ease(t, 44.2, 45.0);
  const x = pop(t, 46.14, 0.3);
  const shipS = proj(NIGHT_SHIP);
  return (
    <>
      {/* 0–8: compass + 76 days */}
      {t > 3.4 && t < 5.5 && <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', opacity: ease(t, 3.5, 3.8) * (1 - ease(t, 5.1, 5.4))}}>
        <Pill size={34} color={ACC.blue}>N · E · S · W  —  <span style={{color: ACC.blue}}>0 LAND IN SIGHT</span></Pill>
      </div>}
      <Card t={t} at={5.5} out={8.6} y={420} accent={ACC.amber}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: 34, fontWeight: 800, letterSpacing: '0.2em', color: ACC.amber}}>RECORD TO BEAT</div>
          <div style={{fontSize: 260, fontWeight: 900, lineHeight: 1, margin: '10px 0'}}>{n76}</div>
          <div style={{fontSize: 48, fontWeight: 900, letterSpacing: '0.08em'}}>DAYS ADRIFT</div>
          <div style={{fontSize: 30, fontWeight: 600, opacity: 0.7, marginTop: 14}}>Steven Callahan · Atlantic · 1982</div>
        </div>
      </Card>
      <Stamp t={t} at={9.26} out={10.4} text="DAY 1" sub="ADRIFT" color={ACC.white} y={520} />
      {/* kit tags */}
      {t > 13 && t < 17.3 && (Object.keys(ITEMS) as (keyof typeof ITEMS)[]).map((key) => {
        const it = ITEMS[key], s = proj([it.p[0], it.p[1] + 0.32, it.p[2]]);
        const label = key === 'bottle' ? '1.5 L WATER' : key === 'flares' ? '3 FLARES' : 'MIRROR';
        return <Tag key={key} x={s.x} y={s.y} text={label} k={pop(t, it.at + 0.15)} color={key === 'bottle' ? ACC.blue : key === 'flares' ? ACC.red : ACC.lime} />;
      })}
      {/* rule #1 */}
      <Card t={t} at={20.7} out={26.4} y={330} accent={ACC.red}>
        <div style={{display: 'inline-block', background: ACC.red, borderRadius: 999, padding: '8px 24px', fontSize: 30, fontWeight: 900, letterSpacing: '0.12em'}}>RULE #1</div>
        <div style={{fontSize: 74, fontWeight: 900, lineHeight: 1.02, marginTop: 20}}>NO WATER FOR<br /><span style={{color: ACC.lime}}>24 HOURS</span></div>
        <div style={{fontSize: 64, fontWeight: 900, marginTop: 20, fontVariantNumeric: 'tabular-nums', color: ACC.amber}}>{`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`}</div>
        {t > 23.5 && <div style={{fontSize: 36, fontWeight: 700, marginTop: 16, opacity: ease(t, 23.6, 24)}}>💧 Body switches to <span style={{color: ACC.blue}}>water-saving mode</span></div>}
      </Card>
      <Stamp t={t} at={27.82} out={29.5} text="DON'T." color={ACC.red} y={460} size={200} />
      {/* seawater maths */}
      <Card t={t} at={29.9} out={37.4} y={300} accent={ACC.blue}>
        <div style={{fontSize: 32, fontWeight: 800, letterSpacing: '0.18em', color: ACC.blue, marginBottom: 24}}>WHY SEAWATER KILLS</div>
        <Bar label="Seawater salt" value="3.5%" k={salt} color={ACC.red} />
        <Bar label="Max your kidneys flush" value="~2%" k={kid * 0.57} color={ACC.lime} />
        {t > 32 && <div style={{fontSize: 40, fontWeight: 800, marginTop: 10, opacity: ease(t, 32.1, 32.5)}}>1 sip in → <span style={{color: ACC.red}}>MORE water out</span></div>}
        {t > 34.9 && <div style={{marginTop: 26, opacity: ease(t, 34.9, 35.2)}}><Bar label="Thirst" value={`${Math.round(40 + thirst * 55)}%`} k={0.4 + thirst * 0.55} color={ACC.amber} /></div>}
      </Card>
      <Stamp t={t} at={37.68} out={38.5} text="NOON" color={ACC.amber} y={520} size={190} />
      {t > 38.6 && t < 40.5 && <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: ease(t, 38.7, 39) * (1 - ease(t, 40.2, 40.5))}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, color: 'white', textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>UV INDEX <span style={{color: ACC.red}}>11+</span></div>
      </div>}
      {t > 41.2 && t < 43.2 && <Tag x={proj([0, rp.y + 2.3, 0]).x} y={proj([0, rp.y + 2.3, 0]).y} text="SHADE = LESS SWEAT" k={pop(t, 41.3)} color={ACC.lime} />}
      {/* map: land vs search zone */}
      {t > 43.4 && t < 51.7 && <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <line x1={raftS.x} y1={raftS.y} x2={mix(raftS.x, landS.x, arrowK)} y2={mix(raftS.y, landS.y, arrowK)} stroke={ACC.red} strokeWidth={10} strokeDasharray="28 18" strokeLinecap="round" opacity={1 - ease(t, 47.2, 47.6) * 0.6} />
        {x > 0 && <g transform={`translate(${mix(raftS.x, landS.x, 0.5)},${mix(raftS.y, landS.y, 0.5)}) scale(${x})`}><path d="M-60,-60 L60,60 M60,-60 L-60,60" stroke={ACC.red} strokeWidth={26} strokeLinecap="round" /></g>}
      </svg>}
      {t > 43.6 && t < 51.7 && <Tag x={landS.x} y={landS.y} text="LAND · 80 KM" k={pop(t, 44.6)} color={ACC.amber} />}
      {t > 43.4 && t < 51.7 && <Tag x={raftS.x} y={raftS.y - 10} text="YOU" k={pop(t, 43.5)} color={ACC.white} />}
      {t > 47.5 && t < 51.7 && <div style={{position: 'absolute', left: wreckS.x, top: wreckS.y, transform: 'translate(-50%,-50%)', opacity: ease(t, 47.6, 48)}}><Pill color={ACC.blue} size={34}><span style={{color: ACC.blue}}>◎</span>SEARCH ZONE</Pill></div>}
      {/* sunset: temp + 25x */}
      <Stamp t={t} at={51.68} out={52.5} text="SUNSET" color={ACC.amber} y={520} size={170} />
      <Card t={t} at={54.24} out={58.4} y={340} accent={ACC.blue}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: 220, fontWeight: 900, lineHeight: 1, color: ACC.blue}}>{Math.round(interpolate(t, [55.6, 56.4], [1, 25], CL))}×</div>
          <div style={{fontSize: 46, fontWeight: 900, marginTop: 10}}>FASTER HEAT LOSS</div>
          <div style={{fontSize: 32, fontWeight: 600, opacity: 0.75, marginTop: 8}}>in water vs. in air</div>
        </div>
      </Card>
      {/* midnight */}
      {t > 60.88 && t < 63.3 && <Tag x={shipS.x} y={shipS.y - 20} text="SHIP · MILES AWAY" k={pop(t, 61.0)} color={ACC.amber} />}
      {/* end card */}
      {t > 65.0 && <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: FONT}}>
        <div style={{opacity: pop(t, 65.1), transform: `scale(${mix(1.4, 1, Math.min(1, pop(t, 65.1)))})`, fontWeight: 900, fontSize: 120, lineHeight: 0.95, color: 'white', textShadow: '0 6px 0 rgba(0,0,0,0.5)', WebkitTextStroke: '5px rgba(0,0,0,0.8)', paintOrder: 'stroke fill'}}>
          FIRE ONE<br /><span style={{color: ACC.red}}>NOW?</span>
        </div>
        <div style={{marginTop: 50, display: 'flex', justifyContent: 'center', gap: 24, opacity: ease(t, 66.2, 66.6)}}>
          <Pill color={ACC.red} size={40}><span style={{color: ACC.red}}>A</span>FIRE IT</Pill>
          <Pill color={ACC.blue} size={40}><span style={{color: ACC.blue}}>B</span>WAIT</Pill>
        </div>
        <div style={{marginTop: 40, fontWeight: 800, fontSize: 36, letterSpacing: '0.2em', color: ACC.amber, opacity: ease(t, 66.8, 67.2)}}>DAY 2 → FOLLOW</div>
      </div>}
    </>
  );
};

// keyword colours in captions
const KEYS: Record<string, string> = {
  raft: ACC.amber, gone: ACC.red, every: ACC.blue, direction: ACC.blue, '76': ACC.amber, days: ACC.amber, one: ACC.lime, kit: ACC.lime, liters: ACC.blue, water: ACC.blue,
  three: ACC.red, flares: ACC.red, mirror: ACC.lime, thirsty: ACC.amber, nothing: ACC.red, '24': ACC.lime, hours: ACC.lime, saving: ACC.blue, ocean: ACC.blue, "don't": ACC.red,
  salty: ACC.red, kidneys: ACC.amber, thirstier: ACC.red, noon: ACC.amber, sun: ACC.amber, killer: ACC.red, canopy: ACC.lime, shade: ACC.lime, land: ACC.amber, rescuers: ACC.blue,
  stay: ACC.lime, sunset: ACC.amber, drops: ACC.blue, '25': ACC.blue, faster: ACC.blue, midnight: ACC.blue, light: ACC.amber, ship: ACC.amber, fire: ACC.red, now: ACC.red,
};

// scene-cut flash + slight blur kick
const CutFlash: React.FC<{t: number}> = ({t}) => {
  const s = SHOTS.find((x) => x.from > 0 && t >= x.from && t < x.from + 0.16);
  if (!s) return null;
  return <AbsoluteFill style={{background: 'white', opacity: 0.22 * (1 - (t - s.from) / 0.16)}} />;
};

export const SFX: Sfx[] = [
  [0.0, 'whoosh_long', 0.35], [2.16, 'boom', 0.4], [3.34, 'whoosh', 0.3], [5.5, 'swell_hit', 0.35], [6.4, 'click', 0.3], [9.26, 'impact', 0.5],
  [10.58, 'whoosh', 0.3], [13.36, 'pop', 0.45], [14.8, 'pop', 0.45], [16.0, 'pop', 0.45], [17.28, 'whoosh', 0.25], [20.8, 'impact', 0.45],
  [23.58, 'click', 0.3], [26.58, 'whoosh', 0.3], [27.82, 'impact', 0.55], [29.9, 'whoosh', 0.3], [31.5, 'click', 0.3], [34.96, 'glitch', 0.25],
  [37.68, 'swell_hit', 0.4], [40.68, 'whoosh', 0.3], [43.28, 'whoosh_long', 0.35], [46.14, 'impact', 0.5], [47.28, 'ding', 0.35], [51.68, 'swell_hit', 0.35],
  [54.24, 'whoosh', 0.3], [56.0, 'impact', 0.4], [57.6, 'riser', 0.3], [59.9, 'ding', 0.3], [63.66, 'pop', 0.4], [63.9, 'pop', 0.4], [64.0, 'boom', 0.35], [65.1, 'impact', 0.55],
];

export const AdriftDay1: React.FC = () => {
  const {width: W, height: H} = useVideoConfig();
  const t = useT();
  const cam = camAt(t);
  const dim = t > 5.5 && t < 8.8 ? 0.4 * ease(t, 5.5, 5.9) * (1 - ease(t, 8.5, 8.8)) : 0;
  return (
    <AbsoluteFill style={{background: '#04060d'}}>
      <ThreeCanvas width={W} height={H} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
        <CameraRig cam={cam} />
        <World t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'black', opacity: dim}} />
      <Vignette />
      <Grain />
      <HUD t={t} />
      <Beats t={t} cam={cam} />
      <Captions words={WORDS} t={t} keys={KEYS} y={1330} hide={(x) => x > 65.0} />
      <CutFlash t={t} />
      <AbsoluteFill style={{background: 'black', opacity: ease(t, 0, 0.4) < 1 ? 1 - ease(t, 0, 0.5) : ease(t, ADRIFT1_SEC - 0.5, ADRIFT1_SEC)}} />
      <DayAudio job={JOB} sec={ADRIFT1_SEC} sfx={SFX} />
    </AbsoluteFill>
  );
};

// ---------- thumbnail (9:16, one per short) ----------
export const AdriftDay1Thumb: React.FC = () => {
  const {width: W, height: H} = useVideoConfig();
  const t = 52.2;
  const cam: Cam = {pos: [1.6, 2.4, 6.8], look: [-0.3, 0.9, -6], fov: 44};
  return (
    <AbsoluteFill style={{background: '#04060d', fontFamily: FONT}}>
      <ThreeCanvas width={W} height={H} camera={{fov: cam.fov, position: cam.pos}} gl={{antialias: true}}>
        <CameraRig cam={cam} />
        <World t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.75) 100%)'}} />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: ACC.red, color: 'white', fontWeight: 900, fontSize: 52, letterSpacing: '0.14em', padding: '12px 34px', borderRadius: 999}}>LOST AT SEA</div>
        <div style={{fontWeight: 900, fontSize: 300, lineHeight: 0.9, color: 'white', marginTop: 30, WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', textShadow: '0 12px 0 rgba(0,0,0,0.5)'}}>DAY 1</div>
      </div>
      <div style={{position: 'absolute', bottom: 260, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontWeight: 900, fontSize: 104, lineHeight: 1, color: 'white', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>DON'T DRINK</div>
        <div style={{fontWeight: 900, fontSize: 104, lineHeight: 1, color: ACC.lime, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>THE WATER</div>
      </div>
    </AbsoluteFill>
  );
};
