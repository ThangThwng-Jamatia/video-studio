// Pixel replicas of Minor Builds screens/components, drawn in iPhone points (393 wide).
// Sources: app/(tabs)/index.tsx, components/HabitCard.tsx, WeeklyCalendarNav.tsx, RankBadge.tsx, DailyQuestsWidget.tsx.
import React from 'react';
import {C, PASTEL, FONT, EMOJI, Icon} from './kit';
import {RankGem} from './RankGem';
import {getRankPalette, type WarriorRank} from './rankPalette';

export type HabitUI = {
  emoji: string;
  title: string;
  accent: string;
  fill: number; // 0..1 progress fill
  check: number; // 0..1 checkmark spring
  label: string;
  streak?: boolean;
};

export const HabitCardUI: React.FC<{h: HabitUI; style?: React.CSSProperties}> = ({h, style}) => {
  const [g1, g2] = PASTEL[h.accent] ?? [h.accent, h.accent];
  const grad = `linear-gradient(180deg, ${g1}, ${g2})`;
  return (
    <div
      style={{
        position: 'relative',
        background: C.card,
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        margin: '4px 0',
        fontFamily: FONT,
        ...style,
      }}
    >
      <div style={{position: 'absolute', inset: 0, background: grad, opacity: 0.12}} />
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${h.fill * 100}%`, background: grad}} />
      <div style={{position: 'relative', padding: '8px 12px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4}}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: C.bg2,
              border: `1px solid ${C.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontFamily: EMOJI,
            }}
          >
            {h.emoji}
          </div>
          <div style={{flex: 1, fontSize: 14, fontWeight: 600, color: C.text, letterSpacing: -0.1}}>{h.title}</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
            <div
              style={{
                background: C.bg2,
                border: `1px solid ${C.border}`,
                padding: '3px 8px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                color: C.text,
              }}
            >
              {h.label}
            </div>
            {h.streak && <span style={{fontSize: 11, fontFamily: EMOJI}}>🔥</span>}
          </div>
          <div style={{position: 'relative', width: 28, height: 28}}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 14,
                background: C.card,
                border: `1.5px solid ${C.border}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 1 - Math.min(1, h.check),
              }}
            >
              <Icon name="plus" size={20} color={C.text3} />
            </div>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 14,
                background: grad,
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13,
                scale: String(Math.max(0, h.check)),
                opacity: Math.min(1, h.check),
              }}
            >
              ✓
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** ProgressRing used by WeeklyCalendarNav (coral when partial, green when complete). */
export const DayRing: React.FC<{size: number; progress: number; label: string; num: number; selected?: boolean; future?: boolean}> = ({
  size,
  progress,
  label,
  num,
  selected,
  future,
}) => {
  const sw = 2.5;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const col = progress >= 1 ? C.success : C.coral;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontFamily: FONT}}>
      <div style={{fontSize: 12, fontWeight: 600, color: selected ? C.coral : future ? C.text3 : C.text2}}>{label}</div>
      <div style={{position: 'relative', width: size, height: size}}>
        <svg width={size} height={size} style={{position: 'absolute', inset: 0, rotate: '-90deg'}}>
          <circle cx={size / 2} cy={size / 2} r={r} stroke={C.bg2} strokeWidth={sw} fill="none" />
          {progress > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={col}
              strokeWidth={sw}
              fill="none"
              strokeDasharray={`${circ} ${circ}`}
              strokeDashoffset={circ * (1 - Math.min(progress, 1))}
              strokeLinecap="round"
            />
          )}
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 5,
            borderRadius: '50%',
            background: selected ? C.coral : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
            color: selected ? '#fff' : future ? C.text3 : C.text,
          }}
        >
          {num}
        </div>
      </div>
    </div>
  );
};

export const WeekRow: React.FC<{progress: number[]; selected?: number}> = ({progress, selected = 4}) => {
  const labels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  return (
    <div style={{fontFamily: FONT}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 2px'}}>
        <Icon name="left" size={18} color={C.text2} />
        <div style={{fontSize: 15, fontWeight: 600, color: C.text}}>October 2026</div>
        <Icon name="right" size={18} color={C.text2} />
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        {labels.map((l, i) => (
          <DayRing key={l} size={40} label={l} num={12 + i} progress={progress[i] ?? 0} selected={i === selected} future={i > selected} />
        ))}
      </div>
    </div>
  );
};

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
export const RankPill: React.FC<{rank: WarriorRank; sub: number; xp: number; scale?: number}> = ({rank, sub, xp, scale = 1}) => {
  const col = getRankPalette(rank).color;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6 * scale,
        padding: `${5 * scale}px ${8 * scale}px`,
        borderRadius: 20 * scale,
        background: `${col}26`,
        border: `${scale}px solid ${col}66`,
        fontFamily: FONT,
      }}
    >
      <RankGem rank={rank} size={22 * scale} />
      <div>
        <div style={{fontSize: 11 * scale, fontWeight: 700, letterSpacing: 0.6 * scale, color: C.text}}>
          {rank.toUpperCase()} {ROMAN[sub - 1]}
        </div>
        <div style={{fontSize: 10 * scale, fontWeight: 500, color: C.text3, marginTop: scale}}>{Math.round(xp).toLocaleString('en-US')} XP</div>
      </div>
    </div>
  );
};

export type QuestUI = {label: string; xp: number; done: number};
export const QuestsCard: React.FC<{quests: QuestUI[]; victory?: number; scale?: number}> = ({quests, victory = 0, scale = 1}) => {
  const k = scale;
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.92)',
        borderRadius: 20 * k,
        padding: 12 * k,
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        fontFamily: FONT,
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8 * k, padding: `0 ${4 * k}px`}}>
        <div style={{fontSize: 11 * k, fontWeight: 700, letterSpacing: 1.2 * k, color: C.text3}}>DAILY QUESTS</div>
        <div style={{fontSize: 11 * k, fontWeight: 500, color: C.text3}}>Resets in 6h 12m</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4 * k}}>
        {quests.map((q) => {
          const d = q.done >= 0.5;
          return (
            <div
              key={q.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8 * k,
                padding: `${8 * k}px ${4 * k}px`,
                borderRadius: 8 * k,
                background: d ? 'rgba(110,231,183,0.10)' : 'transparent',
              }}
            >
              <div
                style={{
                  width: 20 * k,
                  height: 20 * k,
                  borderRadius: 10 * k,
                  border: `${1.5 * k}px solid ${d ? C.questGreen : C.text3}`,
                  background: d ? C.questGreen : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  scale: String(d ? 0.8 + 0.2 * Math.min(1, q.done) : 1),
                }}
              >
                {d && <Icon name="check" size={11 * k} color="#fff" stroke={3} />}
              </div>
              <div
                style={{
                  flex: 1,
                  fontSize: 13 * k,
                  fontWeight: 500,
                  color: d ? C.text3 : C.text,
                  textDecoration: d ? 'line-through' : 'none',
                }}
              >
                {q.label}
              </div>
              <div style={{fontSize: 12 * k, fontWeight: 700, color: d ? C.questGreen : C.coral}}>+{q.xp} XP</div>
            </div>
          );
        })}
      </div>
      {victory > 0 && (
        <div
          style={{
            marginTop: 8 * k,
            borderRadius: 8 * k,
            background: 'rgba(110,231,183,0.10)',
            padding: 8 * k,
            textAlign: 'center',
            fontSize: 13 * k,
            fontWeight: 700,
            color: C.questGreen,
            opacity: victory,
            scale: String(0.9 + 0.1 * victory),
          }}
        >
          <span style={{fontFamily: EMOJI}}>⚔️</span> Daily Victory! +50 XP
        </div>
      )}
    </div>
  );
};

export const TabBar: React.FC<{active?: number}> = ({active = 0}) => {
  const tabs: [string, string][] = [
    ['home', 'Today'],
    ['list', 'Habits'],
    ['bar', 'Stats'],
    ['book', 'Chapters'],
    ['settings', 'Settings'],
  ];
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 60 + 34,
        background: '#FFFFFF',
        borderTop: `1px solid ${C.tabBorder}`,
        display: 'flex',
        paddingTop: 8,
        fontFamily: FONT,
      }}
    >
      {tabs.map(([ic, lb], i) => (
        <div key={lb} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: i === active ? C.coral : '#757575'}}>
          <Icon name={ic} size={24} />
          <div style={{fontSize: 12, fontWeight: 500}}>{lb}</div>
        </div>
      ))}
    </div>
  );
};

export const FAB: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <div
    style={{
      position: 'absolute',
      right: 24,
      bottom: 60 + 34 + 16,
      width: 56,
      height: 56,
      borderRadius: 28,
      background: C.coral,
      boxShadow: '0 8px 16px rgba(255,107,107,0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    }}
  >
    <Icon name="plus" size={28} color="#fff" />
  </div>
);

/** The Today tab. Content scrolls by `scrollY` points. */
export const TodayScreen: React.FC<{
  habits: HabitUI[];
  week: number[];
  rank: WarriorRank;
  sub: number;
  xp: number;
  xpFill: number;
  xpLabel: string;
  quests: QuestUI[];
  victory?: number;
  scrollY?: number;
}> = ({habits, week, rank, sub, xp, xpFill, xpLabel, quests, victory, scrollY = 0}) => (
  <div style={{position: 'absolute', inset: 0, background: C.bg, fontFamily: FONT}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 54, bottom: 0, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 4 - scrollY, padding: '0 24px'}}>
      <WeekRow progress={week} />
      <div style={{marginTop: 22, display: 'flex', justifyContent: 'center', marginBottom: 8}}>
        <RankPill rank={rank} sub={sub} xp={xp} />
      </div>
      <div style={{height: 6, borderRadius: 3, background: C.incomplete, overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${xpFill * 100}%`, borderRadius: 3, background: getRankPalette(rank).color}} />
      </div>
      <div style={{fontSize: 10, fontWeight: 500, color: C.text3, textAlign: 'center', marginTop: 4}}>{xpLabel}</div>
      <div style={{marginTop: 16}}>
        <QuestsCard quests={quests} victory={victory} />
      </div>
      <div style={{fontSize: 18, fontWeight: 600, letterSpacing: -0.3, color: C.text, margin: '22px 0 12px'}}>Today's Habits</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        {habits.map((h) => (
          <HabitCardUI key={h.title} h={h} />
        ))}
      </div>
    </div>
    </div>
    <FAB />
    <TabBar />
  </div>
);

/** TimerRing (focus orange) with mm:ss in the middle. */
export const TimerRingUI: React.FC<{size: number; progress: number; time: string; label?: string}> = ({size, progress, time, label = 'FOCUS'}) => {
  const sw = size * 0.06;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{position: 'relative', width: size, height: size, fontFamily: FONT}}>
      <svg width={size} height={size} style={{position: 'absolute', inset: 0, rotate: '-90deg', overflow: 'visible'}}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(0,0,0,0.06)" strokeWidth={sw} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#tgrad)"
          strokeWidth={sw}
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={circ * (1 - progress)}
          strokeLinecap="round"
          style={{filter: 'drop-shadow(0 0 14px rgba(255,130,92,0.45))'}}
        />
        <defs>
          <linearGradient id="tgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF825C" />
            <stop offset="100%" stopColor="#FF6B47" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontSize: size * 0.07, fontWeight: 700, letterSpacing: '0.14em', color: C.orange}}>{label}</div>
        <div style={{fontSize: size * 0.22, fontWeight: 700, letterSpacing: '-0.03em', color: C.text, fontVariantNumeric: 'tabular-nums'}}>{time}</div>
      </div>
    </div>
  );
};
