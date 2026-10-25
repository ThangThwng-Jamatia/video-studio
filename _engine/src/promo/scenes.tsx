// Scenes for the Minor Builds promo. All times are scene-local seconds; frames via s2f().
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {C, FONT, EMOJI, Glass, Kinetic, Pill, Phone, Tap, lerp, easeOut, easeInOut, s2f, useSpr, Icon} from './kit';
import {TodayScreen, HabitCardUI, QuestsCard, TimerRingUI, type HabitUI} from './ui';
import {RankGem} from './RankGem';
import {getRankPalette, type WarriorRank} from './rankPalette';

const W = 1080;
const H = 1920;

/** One phrase at a time, each punching in (fast captions). */
const Flash: React.FC<{items: {t: number; text: string; accent?: boolean}[]; top?: number; size?: number; until?: number}> = ({
  items,
  top = 230,
  size = 130,
  until,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cur = [...items].reverse().find((it) => f >= s2f(it.t));
  if (!cur || (until !== undefined && f >= s2f(until))) return null;
  const p = spring({frame: f - s2f(cur.t), fps, config: {damping: 14, stiffness: 260, mass: 0.6}});
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 60,
        right: 60,
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: '-0.045em',
        lineHeight: 1,
        color: cur.accent ? C.coral : C.text,
        textShadow: '0 0 30px rgba(248,249,251,0.95), 0 0 60px rgba(248,249,251,0.8)',
        scale: String(1.18 - 0.18 * p),
        filter: 1 - Math.min(1, p) > 0.01 ? `blur(${(1 - Math.min(1, p)) * 16}px)` : 'none',
        opacity: Math.min(1, p * 1.6),
      }}
    >
      {cur.text}
    </div>
  );
};

/** "+10 XP" chip that floats up from a point. */
const XPChip: React.FC<{x: number; y: number; at: number; text?: string}> = ({x, y, at, text = '+10 XP'}) => {
  const f = useCurrentFrame();
  const a = s2f(at);
  const p = lerp(f, [a, a + 50], [0, 1], easeOut);
  const o = lerp(f, [a, a + 6, a + 38, a + 54], [0, 1, 1, 0]);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y - p * 160,
        translate: '-50% -50%',
        opacity: o,
        scale: String(0.7 + 0.3 * Math.min(1, p * 3)),
      }}
    >
      <Glass radius={999} strong style={{padding: '14px 28px'}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 38, color: C.coral, letterSpacing: '-0.02em'}}>{text}</div>
      </Glass>
    </div>
  );
};

// ───────────────────────────────── S1 · Hook (4.0 s)
export const S1Hook: React.FC = () => {
  const f = useCurrentFrame();
  const cols = 7;
  const rows = 5;
  const size = 96;
  const gap = 22;
  const gw = cols * size + (cols - 1) * gap;
  const gx = (W - gw) / 2;
  const gy = 1060;
  const conv = lerp(f, [s2f(3.55), s2f(3.98)], [0, 1], easeInOut);
  return (
    <AbsoluteFill>
      <Kinetic
        top={540}
        size={136}
        out={3.45}
        words={[
          {t: 0.1, text: 'Big'},
          {t: 0.35, text: 'goals'},
          {t: 0.6, text: 'fade.', fade: true},
          {t: 1.5, text: 'Small', br: true},
          {t: 1.75, text: 'habits'},
          {t: 2.0, text: 'stick.', accent: true, br: true},
        ]}
      />
      {Array.from({length: cols * rows}).map((_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const at = s2f(2.35) + i * 2;
        const p = spring({frame: f - at, fps: 60, config: {damping: 13, stiffness: 240, mass: 0.6}});
        const x0 = gx + c * (size + gap);
        const y0 = gy + r * (size + gap);
        const x = x0 + (W / 2 - size / 2 - x0) * conv;
        const y = y0 + (H / 2 - size / 2 - y0) * conv;
        const done = (i * 7) % 10 < 8;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: 30,
              background: done ? `linear-gradient(160deg, ${C.coral}, ${C.orange})` : 'rgba(255,255,255,0.8)',
              boxShadow: done ? '0 10px 24px rgba(255,107,107,0.28)' : '0 6px 16px rgba(0,0,0,0.05)',
              border: done ? 'none' : `2px solid ${C.border}`,
              opacity: f < at ? 0 : Math.min(1, p) * (1 - conv * 0.6),
              scale: String(p * (1 - conv * 0.7)),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {done && <Icon name="check" size={46} color="#fff" stroke={3.2} />}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ───────────────────────────────── S2 · Logo (2.0 s)
export const S2Logo: React.FC = () => {
  const f = useCurrentFrame();
  const pIcon = useSpr(0, {damping: 13, stiffness: 150});
  const ring = lerp(f, [4, 34], [0, 1], easeOut);
  const size = 330;
  const r = 92;
  const circ = 2 * Math.PI * r;
  const title = 'Minor Builds';
  const sweep = lerp(f, [s2f(0.5), s2f(1.3)], [-30, 130], easeInOut);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', top: 560, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div
          style={{
            width: size,
            height: size,
            borderRadius: 78,
            background: '#161616',
            boxShadow: `0 40px 90px rgba(0,0,0,0.28), 0 0 ${120 * ring}px rgba(255,255,255,0.4)`,
            scale: String(0.55 + 0.45 * pIcon),
            opacity: Math.min(1, pIcon * 2),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <svg width={240} height={240} viewBox="0 0 240 240" style={{rotate: '-90deg'}}>
            <circle
              cx={120}
              cy={120}
              r={r}
              stroke="#fff"
              strokeWidth={34}
              fill="none"
              strokeDasharray={`${circ} ${circ}`}
              strokeDashoffset={circ * (1 - ring)}
              strokeLinecap="round"
              style={{filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.55))'}}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(115deg, transparent ${sweep - 18}%, rgba(255,255,255,0.22) ${sweep}%, transparent ${sweep + 18}%)`,
            }}
          />
        </div>
        <div style={{marginTop: 80, fontFamily: FONT, fontWeight: 800, fontSize: 132, letterSpacing: '-0.05em', color: C.text, display: 'flex'}}>
          {title.split('').map((ch, i) => {
            const p = spring({frame: f - 8 - i * 1.5, fps: 60, config: {damping: 15, stiffness: 220, mass: 0.6}});
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  width: ch === ' ' ? '0.26em' : undefined,
                  opacity: Math.min(1, p * 1.5),
                  translate: `0 ${(1 - p) * 60}px`,
                  filter: 1 - Math.min(1, p) > 0.01 ? `blur(${(1 - Math.min(1, p)) * 10}px)` : 'none',
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{marginTop: 34, opacity: lerp(f, [s2f(0.6), s2f(0.9)], [0, 1])}}>
          <Pill bg="rgba(255,107,107,0.12)" color={C.coral} size={30}>
            HABIT TRACKER
          </Pill>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────────────── S3 · Today screen (6.0 s)
const PHONE_W = 640;
const PHONE_TOP = 520;
const K = (PHONE_W - 32) / 393;
const SCROLL = 100;
// check-button centre of habit card i in screen points at full scroll (see ui.tsx layout)
const checkPt = (i: number) => ({x: 343, y: 58 - SCROLL + 417 + 64 + i * 102});

export const S3Today: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = useSpr(0, {damping: 18, stiffness: 120});
  const scroll = lerp(f, [s2f(0.35), s2f(0.85)], [0, SCROLL], easeInOut);
  const taps = [1.0, 2.0, 3.0];
  const doneP = taps.map((t) => spring({frame: f - s2f(t), fps, config: {damping: 14, stiffness: 220, mass: 0.6}}));
  const fillP = taps.map((t) => lerp(f, [s2f(t), s2f(t) + 24], [0, 1], easeOut));
  const nDone = taps.filter((t) => f >= s2f(t)).length;
  const water = lerp(f, [s2f(3.6), s2f(3.9)], [5 / 8, 6 / 8], easeOut);
  const habits: HabitUI[] = [
    {emoji: '🏃', title: 'Morning Run', accent: '#FF825C', fill: fillP[0], check: doneP[0], label: f >= s2f(1.0) ? '13 day streak' : '12 day streak', streak: true},
    {emoji: '📚', title: 'Read 20 Pages', accent: '#A78BFA', fill: fillP[1], check: doneP[1], label: f >= s2f(2.0) ? '8 day streak' : '7 day streak', streak: true},
    {emoji: '🧘', title: 'Meditate', accent: '#4ECDC4', fill: fillP[2], check: doneP[2], label: f >= s2f(3.0) ? '22 day streak' : '21 day streak', streak: true},
    {emoji: '💧', title: 'Drink Water', accent: '#FF6B6B', fill: water, check: 0, label: f >= s2f(3.6) ? '6/8' : '5/8'},
  ];
  const todayProg = (nDone + water) / 4;
  const xp = 18_420 + nDone * 10;
  const pushIn = lerp(f, [s2f(3.95), s2f(4.6)], [0, 1], easeInOut);
  const tilt = (1 - enter) * 28;
  const floatY = Math.sin(f / 40) * 6;
  const screenX = (W - PHONE_W) / 2 + 16;
  const screenY = PHONE_TOP + 16;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          perspective: 2400,
          scale: String(1 + pushIn * 0.15),
          translate: `0px ${-pushIn * 120}px`,
          transformOrigin: '50% 50%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: (W - PHONE_W) / 2,
            top: PHONE_TOP + floatY,
            transform: `translateY(${(1 - enter) * 1100}px) rotateX(${tilt}deg)`,
            transformOrigin: '50% 100%',
          }}
        >
          <Phone width={PHONE_W}>
            <TodayScreen
              habits={habits}
              week={[1, 1, 0.75, 1, todayProg, 0, 0]}
              rank="champion"
              sub={4}
              xp={xp}
              xpFill={0.5 + nDone * 0.03}
              xpLabel={`${(21_580 - nDone * 10).toLocaleString('en-US')} XP to Legend`}
              quests={[
                {label: 'Complete 3 habits', xp: 15, done: f >= s2f(3.3) ? lerp(f, [s2f(3.3), s2f(3.5)], [0.5, 1]) : 0},
                {label: 'Log a win in Done List', xp: 10, done: 1},
                {label: 'Keep a 7-day streak', xp: 20, done: 1},
              ]}
              scrollY={scroll}
            />
          </Phone>
        </div>
        {taps.map((t, i) => {
          const p = checkPt(i);
          return <Tap key={t} at={s2f(t)} x={screenX + p.x * K} y={screenY + p.y * K + floatY} />;
        })}
        {taps.map((t, i) => {
          const p = checkPt(i);
          return <XPChip key={`x${t}`} at={t + 0.05} x={screenX + p.x * K - 120} y={screenY + p.y * K - 40} />;
        })}
      </AbsoluteFill>
      <Flash
        items={[
          {t: 0.2, text: 'Your day,'},
          {t: 0.6, text: 'at a glance.'},
          {t: 1.0, text: 'Tap.'},
          {t: 2.0, text: 'Track.'},
          {t: 3.0, text: 'Done.', accent: true},
          {t: 4.0, text: 'Every.'},
          {t: 4.3, text: 'Single.'},
          {t: 4.6, text: 'Day.', accent: true},
        ]}
      />
    </AbsoluteFill>
  );
};

// ───────────────────────────────── S4 · Build or Quit (2.5 s)
export const S4BuildQuit: React.FC = () => {
  const f = useCurrentFrame();
  const inA = useSpr(s2f(0.05), {damping: 17, stiffness: 150});
  const inB = useSpr(s2f(1.05), {damping: 17, stiffness: 150});
  const fill = lerp(f, [s2f(0.45), s2f(0.8)], [0, 1], easeOut);
  const check = spring({frame: f - s2f(0.8), fps: 60, config: {damping: 13, stiffness: 240, mass: 0.6}});
  const days = Math.round(lerp(f, [s2f(1.4), s2f(2.1)], [1, 12], easeOut));
  const sc = 2.3;
  const card = (h: HabitUI) => (
    <div style={{width: 345, scale: String(sc), transformOrigin: '0 0'}}>
      <HabitCardUI h={h} />
    </div>
  );
  return (
    <AbsoluteFill>
      <Kinetic
        top={220}
        size={118}
        words={[
          {t: 0.05, text: 'Build'},
          {t: 0.2, text: 'the'},
          {t: 0.35, text: 'good.', accent: true},
          {t: 1.05, text: 'Quit', br: true},
          {t: 1.2, text: 'the'},
          {t: 1.35, text: 'bad.'},
        ]}
      />
      <div style={{position: 'absolute', left: 60, top: 640, translate: `${(1 - inA) * -1100}px 0`}}>
        <Glass style={{width: 960, height: 420, padding: 44}}>
          <Pill size={28}>BUILD</Pill>
          <div style={{marginTop: 34, height: 230}}>
            {card({emoji: '🏋️', title: 'Workout 30 min', accent: '#FF825C', fill, check, label: f >= s2f(0.8) ? '21 day streak' : '20 day streak', streak: true})}
          </div>
        </Glass>
      </div>
      <div style={{position: 'absolute', left: 60, top: 1110, translate: `${(1 - inB) * 1100}px 0`}}>
        <Glass style={{width: 960, height: 420, padding: 44}}>
          <Pill size={28} bg={C.text}>
            QUIT
          </Pill>
          <div style={{marginTop: 34, height: 230}}>
            {card({emoji: '🚭', title: 'No Smoking', accent: '#A78BFA', fill: days / 14, check: 0, label: `${days} day streak`, streak: true})}
          </div>
        </Glass>
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────────────── S5 · Track any way (2.5 s)
export const S5Track: React.FC = () => {
  const f = useCurrentFrame();
  const focus = (t0: number, t1: number) => lerp(f, [s2f(t0), s2f(t0) + 8, s2f(t1) - 4, s2f(t1) + 4], [0, 1, 1, 0]);
  const fq = focus(0.05, 0.85);
  const ft = focus(0.85, 1.65);
  const fc = focus(1.65, 2.6);
  const plusTaps = [0.25, 0.45, 0.65];
  const cnt = 5 + plusTaps.filter((t) => f >= s2f(t)).length;
  const remain = lerp(f, [0, s2f(2.5)], [25 * 60, 18 * 60 + 42]);
  const mm = String(Math.floor(remain / 60)).padStart(2, '0');
  const ss = String(Math.floor(remain % 60)).padStart(2, '0');
  const ringP = 1 - remain / (25 * 60);
  const chk = spring({frame: f - s2f(1.75), fps: 60, config: {damping: 12, stiffness: 240, mass: 0.6}});
  const enter = (i: number) => spring({frame: f - i * 4, fps: 60, config: {damping: 16, stiffness: 170}});
  const hl = (p: number): React.CSSProperties => ({
    scale: String(1 + 0.035 * p),
    boxShadow: `0 30px 80px rgba(28,28,30,0.10), 0 0 0 ${4 * p}px rgba(255,107,107,${0.55 * p}), 0 0 ${60 * p}px rgba(255,107,107,${0.25 * p})`,
  });
  return (
    <AbsoluteFill>
      <Flash
        top={210}
        items={[
          {t: 0.05, text: 'Count it.'},
          {t: 0.85, text: 'Time it.'},
          {t: 1.65, text: 'Check it.', accent: true},
        ]}
      />
      <div style={{position: 'absolute', left: 140, top: 450, translate: `0 ${(1 - enter(0)) * 400}px`, opacity: enter(0)}}>
        <Glass style={{width: 800, height: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', ...hl(ft)}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 50}}>
            <TimerRingUI size={500} progress={ringP} time={`${mm}:${ss}`} />
            <div style={{display: 'flex', gap: 28, marginTop: 34}}>
              <div style={{width: 92, height: 92, borderRadius: 46, background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(255,130,92,0.35)'}}>
                <Icon name="pause" size={38} color="#fff" />
              </div>
            </div>
          </div>
        </Glass>
      </div>
      <div style={{position: 'absolute', left: 80, top: 1200, translate: `0 ${(1 - enter(1)) * 400}px`, opacity: enter(1)}}>
        <Glass style={{width: 440, height: 470, padding: 40, ...hl(fq)}}>
          <div style={{fontFamily: EMOJI, fontSize: 80}}>💧</div>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.text, marginTop: 12}}>Drink Water</div>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 96, color: C.text, letterSpacing: '-0.04em', marginTop: 6}}>
            {cnt}
            <span style={{color: C.text3, fontSize: 60}}>/8</span>
          </div>
          <div style={{display: 'flex', gap: 10, marginTop: 14}}>
            {Array.from({length: 8}).map((_, i) => (
              <div key={i} style={{width: 34, height: 12, borderRadius: 6, background: i < cnt ? C.coral : C.incomplete}} />
            ))}
          </div>
        </Glass>
      </div>
      <div style={{position: 'absolute', left: 560, top: 1200, translate: `0 ${(1 - enter(2)) * 400}px`, opacity: enter(2)}}>
        <Glass style={{width: 440, height: 470, padding: 40, ...hl(fc)}}>
          <div style={{fontFamily: EMOJI, fontSize: 80}}>🛏️</div>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.text, marginTop: 12}}>Make Bed</div>
          <div style={{marginTop: 34, position: 'relative', width: 150, height: 150}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: 75, border: `5px solid ${C.incomplete}`, background: '#fff'}} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 75,
                background: `linear-gradient(160deg, ${C.success}, #10B981)`,
                boxShadow: '0 14px 30px rgba(52,211,153,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                scale: String(Math.max(0, chk)),
                opacity: f >= s2f(1.75) ? 1 : 0,
              }}
            >
              <Icon name="check" size={84} color="#fff" stroke={3.4} />
            </div>
          </div>
        </Glass>
      </div>
      {plusTaps.map((t) => (
        <Tap key={t} at={s2f(t)} x={420} y={1560} size={80} />
      ))}
      <Tap at={s2f(1.75)} x={635} y={1500} />
    </AbsoluteFill>
  );
};

// ───────────────────────────────── S6 · Rank up (3.5 s)
const CYCLE: WarriorRank[] = ['recruit', 'soldier', 'veteran', 'elite', 'champion'];
export const RANK_TIMES = [0, 0.3, 0.6, 0.9, 1.2];
export const S6Rank: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const idx = RANK_TIMES.filter((t) => f >= s2f(t)).length - 1;
  const rank = CYCLE[Math.max(0, idx)];
  const pal = getRankPalette(rank);
  const pop = spring({frame: f - s2f(RANK_TIMES[Math.max(0, idx)]), fps, config: {damping: 11, stiffness: 260, mass: 0.6}});
  const landed = f >= s2f(1.2);
  const burst = lerp(f, [s2f(1.2), s2f(1.9)], [0, 1], easeOut);
  const xp = Math.round(lerp(f, [0, s2f(1.2)], [0, 18_450], easeOut));
  const qIn = spring({frame: f - s2f(1.9), fps, config: {damping: 17, stiffness: 150}});
  const qt = [2.3, 2.55, 2.8];
  const qd = (i: number) => (f >= s2f(qt[i]) ? lerp(f, [s2f(qt[i]), s2f(qt[i]) + 10], [0.5, 1]) : 0);
  const vic = spring({frame: f - s2f(3.0), fps, config: {damping: 14, stiffness: 200}});
  const badgeUp = lerp(f, [s2f(1.9), s2f(2.3)], [0, 1], easeInOut);
  return (
    <AbsoluteFill>
      <Flash
        top={200}
        items={[
          {t: 0.0, text: 'Earn XP.'},
          {t: 0.6, text: 'Rank up.'},
          {t: 1.2, text: 'Level up.', accent: true},
          {t: 1.9, text: 'Win the day.'},
        ]}
      />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: H, transformOrigin: '50% 860px', translate: `0 ${-badgeUp * 90}px`, scale: String(1 - badgeUp * 0.3)}}>
        {/* rays */}
        <div
          style={{
            position: 'absolute',
            left: W / 2 - 520,
            top: 860 - 520,
            width: 1040,
            height: 1040,
            borderRadius: '50%',
            background: `repeating-conic-gradient(from ${f * 0.4}deg, ${pal.color}55 0deg 6deg, transparent 6deg 22deg)`,
            maskImage: 'radial-gradient(circle, black 18%, transparent 68%)',
            WebkitMaskImage: 'radial-gradient(circle, black 18%, transparent 68%)',
            opacity: landed ? burst * 0.9 : 0,
            scale: String(0.6 + 0.4 * burst),
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: W / 2 - 300,
            top: 860 - 300,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${pal.color}66, ${pal.color}22 40%, transparent 68%)`,
          }}
        />
        <div style={{position: 'absolute', left: W / 2 - 260, top: 860 - 260, scale: String(0.75 + 0.25 * pop + (landed ? 0.08 * burst : 0)), rotate: `${(1 - pop) * -14}deg`}}>
          <RankGem rank={rank} size={520} />
        </div>
        <div style={{position: 'absolute', top: 1150, left: 0, right: 0, textAlign: 'center', fontFamily: FONT}}>
          <svg width={W} height={130} style={{display: 'block', overflow: 'visible', scale: String(0.9 + 0.1 * pop), filter: `drop-shadow(0 6px 16px ${pal.color}55)`}}>
            <defs>
              <linearGradient id="rankText" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={pal.light} />
                <stop offset="100%" stopColor={pal.dark} />
              </linearGradient>
            </defs>
            <text x={W / 2} y={104} textAnchor="middle" fill="url(#rankText)" style={{fontFamily: FONT, fontSize: 104, fontWeight: 900, letterSpacing: '0.06em'}}>
              {rank.toUpperCase()}
              {landed ? ' IV' : ''}
            </text>
          </svg>
          <div style={{fontSize: 46, fontWeight: 700, color: C.text2, marginTop: 6, fontVariantNumeric: 'tabular-nums'}}>{xp.toLocaleString('en-US')} XP</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: (W - 345 * 2.5) / 2, top: 1290, translate: `0 ${(1 - qIn) * 700}px`, opacity: Math.min(1, qIn * 1.5)}}>
        <div style={{width: 345 * 2.5}}>
          <QuestsCard
            scale={2.5}
            quests={[
              {label: 'Complete 3 habits', xp: 15, done: qd(0)},
              {label: 'Finish a 25-min focus', xp: 20, done: qd(1)},
              {label: 'Plan tomorrow’s to-dos', xp: 10, done: qd(2)},
            ]}
            victory={f >= s2f(3.0) ? Math.min(1, vic) : 0}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────────────── S7 · Stats (2.5 s)
const HEAT = [
  0.9, 1, 0.7, 1, 0.4, 1, 0.8, //
  1, 0.6, 1, 1, 0.9, 0.3, 1, //
  0.8, 1, 1, 0.5, 1, 1, 0.9, //
  1, 0.9, 1, 1, 0.7, 1, 1, //
  1, 1, 0.8, 1, 1, 0, 0,
];
export const S7Stats: React.FC = () => {
  const f = useCurrentFrame();
  const inA = useSpr(0, {damping: 18, stiffness: 150});
  const inB = useSpr(s2f(0.25), {damping: 18, stiffness: 150});
  const pct = Math.round(lerp(f, [s2f(0.2), s2f(1.4)], [0, 87], easeOut));
  const bars = [0.62, 0.8, 0.7, 0.95, 1, 0.74, 0.88];
  const cell = 92;
  const gap = 14;
  return (
    <AbsoluteFill>
      <Kinetic
        top={200}
        size={118}
        words={[
          {t: 0.0, text: 'Watch'},
          {t: 0.15, text: 'your'},
          {t: 0.3, text: 'streaks', br: true},
          {t: 0.45, text: 'grow.', accent: true},
        ]}
      />
      <div style={{position: 'absolute', left: 80, top: 520, translate: `0 ${(1 - inA) * 500}px`, opacity: inA}}>
        <Glass style={{width: 920, padding: 52}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: FONT}}>
            <div>
              <div style={{fontSize: 30, fontWeight: 700, letterSpacing: '0.12em', color: C.text3}}>OCTOBER</div>
              <div style={{fontSize: 44, fontWeight: 700, color: C.text, marginTop: 6}}>Completion</div>
            </div>
            <div style={{fontSize: 130, fontWeight: 800, letterSpacing: '-0.05em', color: C.coral, lineHeight: 0.9, fontVariantNumeric: 'tabular-nums'}}>
              {pct}%
            </div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: `repeat(7, ${cell}px)`, gap, marginTop: 44, justifyContent: 'space-between'}}>
            {HEAT.map((v, i) => {
              const c = i % 7;
              const r = Math.floor(i / 7);
              const at = s2f(0.2) + (c + r) * 3.2;
              const p = spring({frame: f - at, fps: 60, config: {damping: 14, stiffness: 220, mass: 0.6}});
              const on = f >= at;
              return (
                <div key={i} style={{width: cell, height: cell, borderRadius: 24, background: C.bg2, position: 'relative'}}>
                  {v > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 24,
                        background: v >= 1 ? `linear-gradient(160deg, ${C.coral}, ${C.orange})` : `rgba(255,107,107,${0.25 + v * 0.55})`,
                        opacity: on ? Math.min(1, p) : 0,
                        scale: String(on ? 0.5 + 0.5 * p : 0),
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Glass>
      </div>
      <div style={{position: 'absolute', left: 80, top: 1330, translate: `0 ${(1 - inB) * 500}px`, opacity: inB}}>
        <Glass style={{width: 920, height: 400, padding: '44px 52px'}}>
          <div style={{fontFamily: FONT, fontSize: 30, fontWeight: 700, letterSpacing: '0.12em', color: C.text3}}>THIS WEEK</div>
          <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 220, marginTop: 24}}>
            {bars.map((b, i) => {
              const p = spring({frame: f - s2f(0.55) - i * 3, fps: 60, config: {damping: 15, stiffness: 160}});
              return (
                <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
                  <div
                    style={{
                      width: 74,
                      height: 180 * b * Math.max(0, p),
                      borderRadius: 18,
                      background: i === 4 ? `linear-gradient(180deg, ${C.coral}, ${C.orange})` : 'rgba(255,107,107,0.28)',
                      boxShadow: i === 4 ? '0 10px 24px rgba(255,107,107,0.35)' : 'none',
                    }}
                  />
                  <div style={{fontFamily: FONT, fontSize: 26, fontWeight: 600, color: i === 4 ? C.coral : C.text2}}>{['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'][i]}</div>
                </div>
              );
            })}
          </div>
        </Glass>
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────────────── S8 · Feature montage (3.0 s)
export const FEATURES: [string, string][] = [
  ['🔥', 'Streaks'],
  ['📖', 'Life Chapters'],
  ['⚔️', 'Daily Quests'],
  ['📝', 'Plan-Ahead To-dos'],
  ['⏱️', 'Focus Timer'],
  ['🔔', 'Smart Reminders'],
  ['✅', 'Done List'],
  ['📊', 'Yearly Heatmaps'],
  ['🏆', '7 Ranks'],
  ['🌙', 'Dark Mode'],
];
export const PILL_STEP = 0.125;
export const S8Features: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Kinetic
        top={260}
        size={118}
        words={[
          {t: 0.0, text: 'Everything'},
          {t: 0.2, text: 'you', br: true},
          {t: 0.35, text: 'need.', accent: true},
        ]}
      />
      <div style={{position: 'absolute', left: 60, right: 60, top: 700, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 26}}>
        {FEATURES.map(([e, t], i) => {
          const at = s2f(0.5 + i * PILL_STEP);
          const p = spring({frame: f - at, fps, config: {damping: 12, stiffness: 230, mass: 0.6}});
          const bob = Math.sin((f + i * 23) / 28) * 6;
          return (
            <div key={t} style={{opacity: f < at ? 0 : Math.min(1, p * 1.5), scale: String(0.4 + 0.6 * p), translate: `0 ${bob + (1 - p) * 60}px`}}>
              <Glass radius={999} strong style={{padding: '26px 40px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: FONT, fontWeight: 700, fontSize: 48, color: C.text, letterSpacing: '-0.02em'}}>
                  <span style={{fontFamily: EMOJI, fontSize: 50}}>{e}</span>
                  {t}
                </div>
              </Glass>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────────────── S9 · Statement (2.0 s)
export const S9Statement: React.FC = () => {
  const f = useCurrentFrame();
  const ring = lerp(f, [0, s2f(2.0)], [0, 1], easeInOut);
  const collapse = lerp(f, [s2f(1.75), s2f(2.0)], [0, 1], Easing2);
  const r = 430;
  const circ = 2 * Math.PI * r;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <circle
          cx={W / 2}
          cy={H / 2}
          r={r * (1 - collapse * 0.6)}
          stroke="url(#sg)"
          strokeWidth={10}
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={circ * (1 - ring)}
          strokeLinecap="round"
          transform={`rotate(-90 ${W / 2} ${H / 2})`}
          style={{filter: 'drop-shadow(0 0 20px rgba(255,107,107,0.4))'}}
        />
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={C.coral} />
            <stop offset="100%" stopColor={C.orange} />
          </linearGradient>
        </defs>
      </svg>
      <Kinetic
        top={H / 2 - 165}
        size={150}
        words={[
          {t: 0.0, text: 'Small'},
          {t: 0.25, text: 'habits.'},
          {t: 1.0, text: 'Big', br: true},
          {t: 1.25, text: 'builds.', accent: true},
        ]}
      />
    </AbsoluteFill>
  );
};
const Easing2 = (t: number) => t * t * t;

// ───────────────────────────────── S10 · End card (4.0 s)
const StoreButton: React.FC<{top: string; bottom: string; glyph: React.ReactNode}> = ({top, bottom, glyph}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 22,
      background: '#000',
      color: '#fff',
      borderRadius: 30,
      padding: '24px 40px',
      width: 400,
      boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
      fontFamily: FONT,
    }}
  >
    {glyph}
    <div>
      <div style={{fontSize: 24, fontWeight: 500, opacity: 0.85}}>{top}</div>
      <div style={{fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05}}>{bottom}</div>
    </div>
  </div>
);

export const S10End: React.FC = () => {
  const f = useCurrentFrame();
  const icon = useSpr(0, {damping: 12, stiffness: 160});
  const t1 = useSpr(s2f(0.25));
  const t2 = useSpr(s2f(0.45));
  const b = useSpr(s2f(0.75), {damping: 15, stiffness: 180});
  const b2 = useSpr(s2f(0.85), {damping: 15, stiffness: 180});
  const t3 = useSpr(s2f(1.1));
  const glow = 0.6 + 0.4 * Math.sin(f / 22);
  const rise = (p: number): React.CSSProperties => ({opacity: Math.min(1, p * 1.5), translate: `0 ${(1 - p) * 60}px`, filter: 1 - Math.min(1, p) > 0.01 ? `blur(${(1 - Math.min(1, p)) * 10}px)` : 'none'});
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 470, display: 'flex', flexDirection: 'column', alignItems: 'center', width: W}}>
        <div style={{position: 'relative', scale: String(0.4 + 0.6 * icon), opacity: Math.min(1, icon * 2)}}>
          <div style={{position: 'absolute', inset: -60, borderRadius: 120, background: `radial-gradient(circle, rgba(255,107,107,${0.28 * glow}), rgba(255,107,107,${0.1 * glow}) 40%, transparent 72%)`}} />
          <Img src={staticFile('jobs/minor-builds-promo/app-icon.png')} style={{position: 'relative', width: 300, height: 300, borderRadius: 70, boxShadow: '0 40px 80px rgba(0,0,0,0.25)'}} />
        </div>
        <div style={{marginTop: 70, fontFamily: FONT, fontWeight: 800, fontSize: 128, letterSpacing: '-0.05em', color: C.text, ...rise(t1)}}>Minor Builds</div>
        <div style={{marginTop: 18, fontFamily: FONT, fontWeight: 500, fontSize: 50, letterSpacing: '-0.02em', color: C.text2, ...rise(t2)}}>
          Small habits. <span style={{color: C.coral, fontWeight: 700}}>Big builds.</span>
        </div>
        <div style={{display: 'flex', gap: 30, marginTop: 110}}>
          <div style={rise(b)}>
            <StoreButton
              top="Download on the"
              bottom="App Store"
              glyph={
                <svg width={56} height={56} viewBox="0 0 24 24" fill="#fff">
                  <path d="M16.37 12.6c-.02-2.1 1.72-3.12 1.8-3.17-0.98-1.43-2.5-1.63-3.04-1.65-1.29-.13-2.52.76-3.18.76-.66 0-1.67-.74-2.75-.72-1.41.02-2.72.82-3.44 2.09-1.47 2.55-.38 6.32 1.05 8.39.7 1.01 1.53 2.15 2.62 2.11 1.05-.04 1.45-.68 2.72-.68 1.27 0 1.63.68 2.74.66 1.13-.02 1.85-1.03 2.54-2.05.8-1.17 1.13-2.31 1.15-2.37-.03-.01-2.2-.84-2.21-3.37zM14.28 6.43c.58-.7.97-1.68.86-2.65-.83.03-1.84.55-2.44 1.25-.53.62-1 1.61-.88 2.56.93.07 1.88-.47 2.46-1.16z" />
                </svg>
              }
            />
          </div>
          <div style={rise(b2)}>
            <StoreButton
              top="GET IT ON"
              bottom="Google Play"
              glyph={
                <svg width={52} height={52} viewBox="0 0 24 24">
                  <path d="M3.6 2.3 13.4 12l-9.8 9.7c-.35-.2-.6-.6-.6-1.1V3.4c0-.5.25-.9.6-1.1z" fill="#34D399" />
                  <path d="m16.8 8.6-3.4 3.4-9.8-9.7c.3-.2.8-.2 1.2 0z" fill="#60A5FA" />
                  <path d="m16.8 15.4-12 6.3c-.4.2-.9.2-1.2 0l9.8-9.7z" fill="#FF6B6B" />
                  <path d="M20.3 10.5c.9.5.9 2.5 0 3l-3.5 1.9-3.4-3.4 3.4-3.4z" fill="#FBBF24" />
                </svg>
              }
            />
          </div>
        </div>
        <div style={{marginTop: 50, fontFamily: FONT, fontWeight: 600, fontSize: 34, color: C.text3, letterSpacing: '0.02em', ...rise(t3)}}>Free on iPhone & Android</div>
      </div>
    </AbsoluteFill>
  );
};
