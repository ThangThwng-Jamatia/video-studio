// Full-screen and overlay graphics for the Long composition (Look A tokens from theme.ts).
// Glass is plain rgba + gradients, never backdrop-filter (it drops frames in headless Chrome).
import React from 'react';
import {AbsoluteFill, Easing, useVideoConfig} from 'remotion';
import {C, ease, GOLD_SHADOW, mix, out, popK, popStyle, reveal, rnd, SHADOW, sora, tight} from './theme';
import {Icon} from './Icons';
import {posStyle, ScriptWrite, SIZE, StackLine, wordStyle} from './Text';
import {Panel, PhoneDevice} from './Depth';
import type {CalendarBeat, ChainBeat, ChapterBeat, CounterBeat, CounterItem, PhoneBeat, PhoneScreen, PillsBeat, TrackerBeat, VersusBeat, Word} from './types';

export const glass = (r: number): React.CSSProperties => ({
  background: 'linear-gradient(160deg, rgba(44,60,104,0.86) 0%, rgba(14,20,38,0.92) 60%, rgba(10,14,28,0.95) 100%)',
  border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: r,
  boxShadow: '0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.16)',
});

// ---------- background + snow ----------
export const LookBg: React.FC<{t: number}> = ({t}) => {
  const breathe = 0.85 + 0.15 * Math.sin(t * 0.9);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#03050b 0%,#060c1f 55%,#0a1838 100%)'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 95% 55% at 50% 118%, rgba(47,107,255,${0.85 * breathe}) 0%, rgba(30,70,210,0.35) 32%, rgba(10,20,48,0) 62%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 5% at 50% 90%, rgba(190,220,255,${0.55 * breathe}) 0%, rgba(120,170,255,0.15) 45%, rgba(0,0,0,0) 70%)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

export const Snow: React.FC<{t: number; amount?: number; opacity?: number}> = ({t, amount = 90, opacity = 1}) => {
  const {width: W, height: H} = useVideoConfig();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
      {Array.from({length: amount}, (_, i) => {
        const depth = rnd(i * 3.1);
        const sz = 2 + depth * 6;
        const speed = 30 + depth * 90;
        const x = rnd(i) * W + Math.sin(t * (0.4 + depth) + i) * 18 * (1 + depth);
        const y = ((rnd(i + 7) * (H + 60) + t * speed) % (H + 60)) - 30;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: sz, height: sz, borderRadius: '50%',
            background: 'rgba(235,244,255,0.9)', opacity: 0.25 + depth * 0.6, filter: depth > 0.7 ? 'blur(1.5px)' : undefined,
            boxShadow: '0 0 6px rgba(200,225,255,0.6)'}} />
        );
      })}
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{text: string; t: number; at: number; top: number}> = ({text, t, at, top}) => {
  const {height: H} = useVideoConfig();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: top * H, textAlign: 'center', fontFamily: tight, fontWeight: 700, fontSize: 0.032 * H,
      letterSpacing: '0.24em', color: C.gold, textTransform: 'uppercase', ...reveal(t, at)}}>{text}</div>
  );
};

// ---------- pills ----------
export const PillsView: React.FC<{b: PillsBeat; t: number}> = ({b, t}) => {
  const {width: W, height: H} = useVideoConfig();
  const fs = (b.bg === 'look' ? 0.072 : b.dir === 'col' && b.items.length > 4 ? 0.05 : 0.058) * H;
  return (
    <>
      {b.kicker && <Kicker text={b.kicker} t={t} at={b.start} top={0.2} />}
      <div style={{position: 'absolute', display: 'flex', flexDirection: b.dir === 'col' ? 'column' : 'row', flexWrap: 'wrap', gap: 0.016 * H,
        maxWidth: (b.pos === 'center' || b.pos === 'top' || b.pos === 'bottom' ? 0.86 : 0.36) * W, justifyContent: 'center', ...posStyle(b.pos, W, H)}}>
        {b.items.map((p, i) => {
          if (t < p.at) return <div key={i} style={{visibility: 'hidden'}} />;
          const n = Math.max(1, Math.floor((t - p.at) * 34));
          const col = p.color ?? C.gold;
          const strike = p.strikeAt !== undefined ? ease(t, p.strikeAt, p.strikeAt + 0.22) : 0;
          return (
            <div key={i} style={{...popStyle(t, p.at, 0.28), position: 'relative', display: 'flex', alignItems: 'center', gap: fs * 0.45,
              padding: `${fs * 0.42}px ${fs * 0.7}px`, borderRadius: 999, background: 'rgba(12,16,28,0.82)',
              border: `1.5px solid ${col}66`, boxShadow: `0 10px 30px rgba(0,0,0,0.45), 0 0 22px ${col}33`, opacity: strike > 0 ? 1 - 0.45 * strike : undefined}}>
              {p.icon ? <Icon name={p.icon} size={fs * 1.05} color={col} stroke={2.4} /> : (
                <div style={{width: fs * 0.42, height: fs * 0.42, borderRadius: '50%', background: col, boxShadow: `0 0 12px ${col}`}} />
              )}
              <span style={{fontFamily: tight, fontWeight: 650, fontSize: fs, color: 'white', whiteSpace: 'nowrap', letterSpacing: '-0.01em'}}>
                {p.text.slice(0, n)}
              </span>
              {strike > 0 && <div style={{position: 'absolute', left: fs * 0.5, top: '50%', height: 4, width: `calc(${strike * 100}% - ${fs}px)`,
                background: C.bad, borderRadius: 3, boxShadow: '0 0 10px rgba(255,77,77,0.8)'}} />}
            </div>
          );
        })}
      </div>
    </>
  );
};

// ---------- good vs bad ----------
const Badge: React.FC<{good: boolean; size: number; t: number; at: number}> = ({good, size, t, at}) => {
  const col = good ? C.good : C.bad;
  return (
    <div style={{...popStyle(t, at, 0.3), width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `${col}26`, border: `2.5px solid ${col}`, boxShadow: `0 0 30px ${col}66`}}>
      <Icon name={good ? 'check' : 'x'} size={size * 0.56} color={col} stroke={3} />
    </div>
  );
};
const SideWords: React.FC<{words: Word[]; t: number; size: number; color: string; align: 'left' | 'right'}> = ({words, t, size, color, align}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: align === 'left' ? 'flex-end' : 'flex-start', gap: `0 ${size * 0.26}px`,
    textAlign: align === 'left' ? 'right' : 'left'}}>
    {words.map((w, i) => (
      <span key={i} style={{fontFamily: sora, fontWeight: 700, fontSize: size, color, letterSpacing: '-0.03em', lineHeight: 1.12, textShadow: SHADOW,
        ...wordStyle(w, size), ...reveal(t, w.at)}}>{w.t}</span>
    ))}
  </div>
);
export const VersusView: React.FC<{b: VersusBeat; t: number}> = ({b, t}) => {
  const {width: W, height: H} = useVideoConfig();
  const chars = Math.max(...[b.bad, b.good].map((ws) => ws.reduce((n, w) => n + w.t.length + 1, 0)));
  const size = Math.min(0.085 * H, (0.34 * W * 1.9) / (chars * 0.6));
  const line = ease(t, b.badAt + 0.15, b.goodAt, Easing.inOut(Easing.quad));
  return (
    <>
      {b.kicker && <Kicker text={b.kicker} t={t} at={b.start} top={0.2} />}
      <div style={{position: 'absolute', left: 0.04 * W, right: 0.04 * W, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center'}}>
        <div style={{width: 0.36 * W, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.025 * H}}>
          <Badge good={false} size={0.075 * H} t={t} at={b.badAt} />
          <SideWords words={b.bad} t={t} size={size} color="rgba(255,255,255,0.78)" align="left" />
        </div>
        <div style={{flex: 1, height: 4, margin: `0 ${0.025 * W}px`, position: 'relative', top: 0.05 * H}}>
          <div style={{width: `${line * 100}%`, height: '100%', backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.75) 0 14px, transparent 14px 26px)'}} />
        </div>
        <div style={{width: 0.36 * W, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.025 * H}}>
          <Badge good size={0.075 * H} t={t} at={b.goodAt} />
          <SideWords words={b.good} t={t} size={size} color="white" align="right" />
        </div>
      </div>
    </>
  );
};

// ---------- calendar ----------
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export const CalendarView: React.FC<{b: CalendarBeat; t: number}> = ({b, t}) => {
  const {width: W, height: H} = useVideoConfig();
  const tw = 0.115 * W, th = 0.17 * H, g = 0.016 * W;
  const stamps = b.stampAts ?? MONTHS.slice(0, 9).map((_, i) => b.start + 0.25 + (i * (b.litAt - b.start - 0.6)) / 9);
  const lit = ease(t, b.litAt, b.litAt + 0.35);
  const pct = b.pctAt !== undefined ? ease(t, b.pctAt, b.pctAt + 0.9, Easing.out(Easing.cubic)) : 0;
  return (
    <>
      <Kicker text={b.kicker ?? '2026'} t={t} at={b.start} top={0.11} />
      <div style={{position: 'absolute', left: '50%', top: 0.2 * H, transform: 'translateX(-50%)', display: 'grid',
        gridTemplateColumns: `repeat(6, ${tw}px)`, gap: g}}>
        {MONTHS.map((m, i) => {
          const past = i < 9;
          const appear = b.start + i * 0.035;
          const st = past ? (b.mode === 'callback' ? 1 : ease(t, stamps[i], stamps[i] + 0.12)) : 0;
          const on = !past ? lit : 0;
          const pulse = !past ? 1 + 0.06 * Math.sin(Math.min(1, ease(t, b.litAt, b.litAt + 0.5)) * Math.PI) : 1;
          return (
            <div key={m} style={{...popStyle(t, appear, 0.3), width: tw, height: th, position: 'relative', borderRadius: 0.022 * H,
              ...glass(0.022 * H), transform: `scale(${pulse})`,
              background: on > 0 ? `linear-gradient(160deg, rgba(255,214,110,${0.55 * on}) 0%, rgba(120,80,10,${0.5 * on}) 100%), rgba(16,22,40,0.92)` : glass(0).background,
              border: on > 0 ? `2px solid rgba(255,214,110,${0.4 + 0.6 * on})` : '1.5px solid rgba(255,255,255,0.12)',
              boxShadow: on > 0 ? `0 0 ${40 * on}px rgba(245,196,81,${0.55 * on}), 0 20px 50px rgba(0,0,0,0.5)` : '0 20px 50px rgba(0,0,0,0.5)'}}>
              <div style={{position: 'absolute', left: 0, right: 0, top: 0.035 * H, textAlign: 'center', fontFamily: sora, fontWeight: 700, fontSize: 0.045 * H,
                color: on > 0 ? '#fff6d8' : past && st > 0 ? 'rgba(255,255,255,0.35)' : 'white', letterSpacing: '0.04em',
                textShadow: on > 0 ? GOLD_SHADOW : undefined}}>{m}</div>
              {past && st > 0 && (
                <div style={{position: 'absolute', left: '50%', top: '64%', transform: `translate(-50%,-50%) scale(${mix(1.6, 1, st)}) rotate(-8deg)`, opacity: st}}>
                  <Icon name="x" size={0.07 * H} color={C.bad} stroke={3.2} />
                </div>
              )}
              {!past && on > 0 && (
                <div style={{position: 'absolute', left: '50%', top: '66%', transform: 'translate(-50%,-50%)', opacity: on}}>
                  <Icon name="star" size={0.05 * H} color={C.gold2} stroke={2.4} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0.66 * H, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 0.03 * W}}>
        <span style={{fontFamily: sora, fontWeight: 800, fontSize: 0.085 * H, color: C.gold, letterSpacing: '-0.03em', textShadow: GOLD_SHADOW,
          ...reveal(t, b.labelAt, 0.25)}}>{b.label}</span>
        {b.pctAt !== undefined && t >= b.pctAt && (
          <span style={{fontFamily: sora, fontWeight: 800, fontSize: 0.085 * H, color: 'white', letterSpacing: '-0.03em', textShadow: SHADOW,
            ...reveal(t, b.pctAt, 0.15)}}>{Math.round(pct * 100)}%</span>
        )}
      </div>
    </>
  );
};

// ---------- counters ----------
export const fmtVal = (v: number, it: CounterItem, done: boolean) => {
  const r = Math.round(v);
  switch (it.fmt) {
    case 'clock': {
      const m = ((r % 1440) + 1440) % 1440;
      const h = Math.floor(m / 60), mm = m % 60;
      return `${h % 12 === 0 ? 12 : h % 12}:${String(mm).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
    }
    case 'dur': {
      const h = Math.floor(r / 60), mm = r % 60;
      return h ? `${h}h ${String(mm).padStart(2, '0')}m` : `${mm}m`;
    }
    case 'pct': return `${r}%`;
    case 'plus': return `${r.toLocaleString('en-US')}${done ? '+' : ''}`;
    default: return r.toLocaleString('en-US');
  }
};
export const CounterView: React.FC<{b: CounterBeat; t: number}> = ({b, t}) => {
  const {width: W, height: H} = useVideoConfig();
  const n = b.items.length;
  const big = (n === 1 ? 0.17 : 0.12) * H;
  const body = (
    <div style={{display: 'flex', gap: 0.07 * W, alignItems: 'flex-end'}}>
      {b.items.map((it, i) => {
        const d = it.dur ?? 1.0;
        const k = ease(t, it.at, it.at + d, Easing.out(Easing.cubic));
        const v = mix(it.from, it.to, k);
        const rolling = k > 0 && k < 1;
        const col = it.color ?? C.white;
        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', ...popStyle(t, Math.min(it.at - 0.15, b.start - 0.1 + i * 0.12), 0.3)}}>
            {it.icon && <Icon name={it.icon} size={0.07 * H} color={it.color ?? C.gold} stroke={2.2} style={{marginBottom: 0.015 * H}} />}
            <div style={{fontFamily: sora, fontWeight: 800, fontSize: big, color: col, letterSpacing: '-0.04em', lineHeight: 1,
              textShadow: col === C.white ? '0 0 40px rgba(169,207,255,0.35), 0 6px 30px rgba(0,0,0,0.6)' : `0 0 30px ${col}66`,
              filter: rolling ? 'blur(1.2px)' : undefined, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
              {it.prefix ?? ''}{fmtVal(v, it, k >= 1)}{it.suffix ?? ''}
            </div>
            <div style={{fontFamily: tight, fontWeight: 600, fontSize: 0.04 * H, color: C.dim, marginTop: 0.015 * H, whiteSpace: 'nowrap', ...reveal(t, it.at)}}>
              {it.label}
            </div>
          </div>
        );
      })}
    </div>
  );
  if (b.bg === 'bare') {
    return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 60%)'}}>{body}</AbsoluteFill>;
  }
  if (b.bg === 'none') {
    return (
      <div style={{position: 'absolute', display: 'flex', ...posStyle(b.pos ?? 'right', W, H)}}>
        <div style={{...glass(0.03 * H), padding: `${0.035 * H}px ${0.045 * W}px`, ...popStyle(t, b.start, 0.3)}}>{body}</div>
      </div>
    );
  }
  return (
    <>
      {b.kicker && <Kicker text={b.kicker} t={t} at={b.start} top={0.2} />}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>{body}</AbsoluteFill>
    </>
  );
};

// ---------- chain (A → B → C, or equation with custom separators) ----------
export const ChainView: React.FC<{b: ChainBeat; t: number}> = ({b, t}) => {
  const {width: W, height: H} = useVideoConfig();
  const n = b.items.length;
  const sepW = 0.05 * W;
  const pw = (0.9 * W - sepW * (n - 1)) / n;
  const longest = Math.max(...b.items.flatMap((w) => w.t.split(' ').map((x) => x.length)));
  const fs = Math.min(0.075 * H, (pw * 0.82) / (longest * 0.62));
  const x0 = 0.05 * W;
  return (
    <>
      {b.kicker && <Kicker text={b.kicker} t={t} at={b.start - 0.15} top={0.16} />}
      {b.items.map((w, i) => {
        const last = i === n - 1;
        const at = Math.min(w.at, b.start + 0.1 + i * 0.12);
        const k = ease(t, at - 0.15, at + 0.35, Easing.out(Easing.cubic));
        const lit = ease(t, w.at, w.at + 0.3);
        const cx = x0 + i * (pw + sepW) + pw / 2;
        const sep = b.seps?.[i - 1];
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <div style={{position: 'absolute', left: cx - pw / 2 - sepW, width: sepW, top: 0.5 * H, transform: 'translateY(-50%)', display: 'flex',
                justifyContent: 'center', opacity: ease(t, w.at - 0.2, w.at + 0.1)}}>
                {sep && sep !== '→' ? <span style={{fontFamily: sora, fontWeight: 800, fontSize: 0.08 * H, color: C.gold}}>{sep}</span>
                  : <Icon name="arrow" size={0.06 * H} color={C.ice} stroke={2.6} />}
              </div>
            )}
            <Panel x={cx} y={0.52 * H} w={pw} h={0.34 * H} ry={(i - (n - 1) / 2) * -6} o={k} blur={(1 - k) * 10} s={mix(0.94, 1, k)}
              glow={last ? C.gold : '#7aa6ff'} glowK={last ? lit : lit * 0.35} sheen={ease(t, w.at, w.at + 0.8)}>
              <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: pw * 0.08, textAlign: 'center'}}>
                <span style={{fontFamily: sora, fontWeight: 800, fontSize: fs, lineHeight: 1.08, letterSpacing: '-0.03em',
                  color: last ? C.gold2 : `rgba(255,255,255,${0.55 + 0.45 * lit})`, textShadow: last ? GOLD_SHADOW : SHADOW}}>{w.t}</span>
              </div>
            </Panel>
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---------- chapter card ----------
export const ChapterCard: React.FC<{b: ChapterBeat; t: number}> = ({b, t}) => {
  const {width: W, height: H} = useVideoConfig();
  const tile = 0.16 * H, gap = 0.04 * H;
  const slide = ease(t, b.start, b.start + 0.9, Easing.out(Easing.cubic));
  const offset = mix(2.5, 0, slide);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0.13 * H, textAlign: 'center', fontFamily: sora, fontWeight: 700, fontSize: 0.085 * H,
        color: 'white', letterSpacing: '-0.02em', textShadow: '0 0 40px rgba(169,207,255,0.35)', ...reveal(t, b.start - 0.15, 0.3)}}>{b.kicker}</div>
      <div style={{position: 'absolute', left: '50%', top: 0.36 * H, height: tile * 1.4, display: 'flex', alignItems: 'center', gap,
        transform: `translateX(${-(b.focus + offset) * (tile + gap) - tile / 2}px)`}}>
        {b.icons.map((ic, i) => {
          const f = i === b.focus;
          const k = f ? ease(t, b.start + 0.5, b.start + 0.9) : 0;
          const s = f ? mix(1, 1.4, k) : 0.92;
          return (
            <div key={i} style={{width: tile, height: tile, flexShrink: 0, transform: `scale(${s})`, borderRadius: tile * 0.24, display: 'flex', alignItems: 'center',
              justifyContent: 'center', ...glass(tile * 0.24), opacity: f ? 1 : 0.42,
              border: f ? `2px solid rgba(122,166,255,${0.4 + 0.6 * k})` : glass(0).border,
              boxShadow: f ? `0 0 ${50 * k}px rgba(47,107,255,0.75), inset 0 1px 0 rgba(255,255,255,0.2)` : glass(0).boxShadow}}>
              <Icon name={ic} size={tile * 0.5} color={f ? '#dbe8ff' : 'rgba(255,255,255,0.8)'} stroke={2} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0.6 * H, display: 'flex', justifyContent: 'center'}}>
        <ScriptWrite text={b.title} t={t} at={b.titleAt} size={0.17 * H} dur={0.8} />
      </div>
    </>
  );
};

// ---------- tracker (5 fixes) ----------
export const TrackerView: React.FC<{b: TrackerBeat; t: number}> = ({b, t}) => {
  const {width: W, height: H} = useVideoConfig();
  const tw = 0.155 * W, th = 0.32 * H, g = 0.018 * W;
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0.1 * H, textAlign: 'center', fontFamily: sora, fontWeight: 800, fontSize: 0.075 * H,
        color: 'white', letterSpacing: '-0.03em', textShadow: '0 0 40px rgba(169,207,255,0.35)', ...reveal(t, b.titleAt ?? b.start, 0.3)}}>{b.title}</div>
      <div style={{position: 'absolute', left: '50%', top: 0.28 * H, transform: 'translateX(-50%)', display: 'flex', gap: g}}>
        {b.items.map((it, i) => {
          const appear = b.mode === 'intro' ? (b.introAts?.[i] ?? b.start + 0.2 + i * 0.16) : b.start + i * 0.03;
          const isTick = b.mode === 'tick' && i === b.done && b.tickAt !== undefined;
          const tk = isTick ? ease(t, b.tickAt!, b.tickAt! + 0.3) : 0;
          const done = i < b.done || tk > 0;
          const dk = i < b.done ? 1 : tk;
          const bump = isTick ? 1 + 0.08 * Math.sin(Math.min(1, ease(t, b.tickAt!, b.tickAt! + 0.45)) * Math.PI) : 1;
          const next = b.mode === 'tick' && i === b.done;
          return (
            <div key={i} style={{...popStyle(t, appear, 0.32)}}>
              <div style={{width: tw, height: th, position: 'relative', transform: `scale(${bump})`, ...glass(0.03 * H),
                border: done ? `2px solid rgba(245,196,81,${0.35 + 0.65 * dk})` : next ? '2px solid rgba(122,166,255,0.6)' : glass(0).border,
                boxShadow: done ? `0 0 ${46 * dk}px rgba(245,196,81,${0.45 * dk}), 0 24px 60px rgba(0,0,0,0.55)` : glass(0).boxShadow,
                opacity: b.mode === 'tick' && !done && !next ? 0.55 : 1}}>
                <div style={{position: 'absolute', left: 0.018 * H, top: 0.014 * H, fontFamily: sora, fontWeight: 700, fontSize: 0.032 * H, color: C.dim}}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{position: 'absolute', left: 0, right: 0, top: 0.07 * H, display: 'flex', justifyContent: 'center'}}>
                  <Icon name={it.icon} size={0.11 * H} color={done ? C.gold2 : '#dbe8ff'} stroke={1.8} />
                </div>
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 0.035 * H, textAlign: 'center', fontFamily: sora, fontWeight: 700,
                  fontSize: 0.036 * H, color: done ? C.gold2 : 'white', letterSpacing: '-0.01em'}}>{it.label}</div>
                {done && (
                  <div style={{position: 'absolute', right: -0.018 * H, top: -0.018 * H, width: 0.06 * H, height: 0.06 * H, borderRadius: '50%',
                    background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: GOLD_SHADOW,
                    transform: `scale(${i < b.done ? 1 : popK(t, b.tickAt!, 0.3)})`}}>
                    <Icon name="check" size={0.04 * H} color="#2a1c00" stroke={3.2} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {b.week && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 0.72 * H, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.025 * H}}>
          <div style={{fontFamily: sora, fontWeight: 800, fontSize: 0.06 * H, color: C.gold, letterSpacing: '-0.02em', textShadow: GOLD_SHADOW,
            ...reveal(t, b.week.at, 0.25)}}>{b.week.label}</div>
          <div style={{display: 'flex', gap: 0.014 * W}}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
              const k = ease(t, b.week!.at + 0.15 + i * 0.09, b.week!.at + 0.3 + i * 0.09);
              return (
                <div key={i} style={{width: 0.05 * H, height: 0.05 * H, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: tight, fontWeight: 700, fontSize: 0.022 * H, color: k > 0.5 ? '#2a1c00' : 'rgba(255,255,255,0.6)',
                  background: k > 0 ? `rgba(245,196,81,${k})` : 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(245,196,81,0.5)',
                  boxShadow: k > 0.5 ? GOLD_SHADOW : undefined, opacity: out(t, b.week!.at, 0.2)}}>{d}</div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

// ---------- phone mockup ----------
const AppIcon: React.FC<{name: string; color: string; size: number}> = ({name, color, size}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.26, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 18px rgba(0,0,0,0.35)', flexShrink: 0}}>
    <span style={{fontFamily: sora, fontWeight: 800, fontSize: size * 0.46, color: 'white'}}>{name[0]}</span>
  </div>
);
const Screen: React.FC<{s: PhoneScreen; t: number; w: number; h: number}> = ({s, t, w, h}) => {
  const u = w / 100; // 1 unit = 1% of the screen width
  switch (s.kind) {
    case 'notifs': {
      const shown = s.items.filter((_, i) => t >= s.at + 0.15 + i * 0.16);
      const k = ease(t, s.at, s.at + 1.6, Easing.out(Easing.quad));
      const cnt = Math.round(mix(0, s.count, k));
      return (
        <div style={{position: 'absolute', inset: 0, padding: `${16 * u}px ${6 * u}px`}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 * u}}>
            <span style={{fontFamily: sora, fontWeight: 700, fontSize: 7.5 * u, color: 'white'}}>Notifications</span>
            <span style={{fontFamily: sora, fontWeight: 800, fontSize: 6.5 * u, color: 'white', background: C.bad, borderRadius: 99,
              padding: `${1 * u}px ${3.5 * u}px`, boxShadow: '0 0 16px rgba(255,77,77,0.7)'}}>{cnt}{k >= 1 ? '+' : ''}</span>
          </div>
          {shown.slice(-6).reverse().map((n, i) => (
            <div key={`${n.app}${i}${shown.length}`} style={{display: 'flex', gap: 3 * u, alignItems: 'center', padding: 3 * u, marginBottom: 2.5 * u,
              borderRadius: 4.5 * u, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)', ...(i === 0 ? reveal(t, s.at + 0.15 + (shown.length - 1) * 0.16, 0.15) : {})}}>
              <AppIcon name={n.app} color={n.color} size={10 * u} />
              <div style={{minWidth: 0}}>
                <div style={{fontFamily: tight, fontWeight: 700, fontSize: 4.2 * u, color: 'white'}}>{n.app}</div>
                <div style={{fontFamily: tight, fontWeight: 500, fontSize: 3.9 * u, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{n.text}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    case 'screentime': {
      const k = ease(t, s.at + 0.3, s.at + 0.3 + (s.dur ?? 1.6), Easing.inOut(Easing.quad));
      const v = mix(s.from, s.to, k);
      const it: CounterItem = {label: '', from: s.from, to: s.to, at: s.at, fmt: 'dur'};
      return (
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 22 * u}}>
          <span style={{fontFamily: tight, fontWeight: 600, fontSize: 5 * u, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em'}}>SCREEN TIME</span>
          <div style={{marginTop: 8 * u}}><AppIcon name={s.app} color={s.color} size={30 * u} /></div>
          <span style={{fontFamily: tight, fontWeight: 600, fontSize: 5.5 * u, color: 'white', marginTop: 4 * u}}>{s.app}</span>
          <span style={{fontFamily: sora, fontWeight: 800, fontSize: 17 * u, color: k > 0.6 ? '#ff8a8a' : 'white', marginTop: 8 * u, letterSpacing: '-0.04em',
            fontVariantNumeric: 'tabular-nums', filter: k > 0 && k < 1 ? 'blur(0.8px)' : undefined}}>{fmtVal(v, it, k >= 1)}</span>
          <div style={{width: 76 * u, height: 3.2 * u, borderRadius: 99, background: 'rgba(255,255,255,0.12)', marginTop: 6 * u, overflow: 'hidden'}}>
            <div style={{width: `${8 + 92 * k}%`, height: '100%', background: `linear-gradient(90deg, ${C.gold}, ${C.bad})`}} />
          </div>
        </div>
      );
    }
    case 'chat': {
      const x = s.xAt !== undefined ? ease(t, s.xAt, s.xAt + 0.2) : 0;
      return (
        <div style={{position: 'absolute', inset: 0, padding: `${16 * u}px ${6 * u}px`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 3 * u, paddingBottom: 4 * u, borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 6 * u}}>
            <div style={{width: 11 * u, height: 11 * u, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#ec4899)'}} />
            <span style={{fontFamily: tight, fontWeight: 700, fontSize: 9 * u, color: 'white'}}>{s.name}</span>
          </div>
          {s.bubbles.filter((bb) => t >= bb.at).map((bb, i) => (
            <div key={i} style={{display: 'flex', justifyContent: bb.me ? 'flex-end' : 'flex-start', marginBottom: 3 * u}}>
              <div style={{maxWidth: 86 * u, padding: `${4 * u}px ${6 * u}px`, borderRadius: 7 * u, fontFamily: tight, fontWeight: 600, fontSize: 10 * u,
                color: 'white', background: bb.me ? '#2f6bff' : 'rgba(255,255,255,0.14)', ...popStyle(t, bb.at, 0.25)}}>{bb.text}</div>
            </div>
          ))}
          {x > 0 && (
            <div style={{position: 'absolute', left: '50%', top: '55%', transform: `translate(-50%,-50%) scale(${mix(1.8, 1, x)}) rotate(-10deg)`, opacity: x}}>
              <Icon name="x" size={60 * u} color={C.bad} stroke={3.4} style={{filter: 'drop-shadow(0 0 20px rgba(255,77,77,0.8))'}} />
            </div>
          )}
        </div>
      );
    }
    case 'alarm': {
      const ring = Math.sin(t * 40) * 6 * (t - s.at < 1.2 ? 1 : 0);
      return (
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 30 * u}}>
          <div style={{transform: `rotate(${ring}deg)`}}><Icon name="alarm" size={26 * u} color={C.gold} stroke={1.8} /></div>
          <span style={{fontFamily: sora, fontWeight: 800, fontSize: 20 * u, color: 'white', marginTop: 6 * u, letterSpacing: '-0.04em'}}>{s.time}</span>
          <span style={{fontFamily: tight, fontWeight: 600, fontSize: 5 * u, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em'}}>ALARM</span>
        </div>
      );
    }
    case 'text':
      return (
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8 * u}}>
          <span style={{fontFamily: sora, fontWeight: 800, fontSize: 13 * u, color: s.color ?? 'white', textAlign: 'center', lineHeight: 1.05,
            letterSpacing: '-0.03em', textShadow: `0 0 30px ${(s.color ?? '#ffffff')}66`, ...popStyle(t, s.at, 0.3)}}>{s.text}</span>
          {s.sub && <span style={{fontFamily: tight, fontWeight: 600, fontSize: 5 * u, color: 'rgba(255,255,255,0.65)', marginTop: 4 * u, ...reveal(t, s.at + 0.2)}}>{s.sub}</span>}
        </div>
      );
    case 'dnd': {
      const on = ease(t, s.onAt, s.onAt + 0.25);
      return (
        <div style={{position: 'absolute', inset: 0, padding: `${30 * u}px ${7 * u}px`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 4 * u, padding: 5 * u, borderRadius: 6 * u,
            background: on > 0.5 ? 'rgba(124,92,255,0.35)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)'}}>
            <div style={{width: 13 * u, height: 13 * u, borderRadius: '50%', background: on > 0.5 ? '#7c5cff' : 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="moon" size={7.5 * u} color="white" /></div>
            <span style={{fontFamily: tight, fontWeight: 700, fontSize: 5.4 * u, color: 'white', flex: 1}}>Do Not Disturb</span>
            <div style={{width: 16 * u, height: 9 * u, borderRadius: 99, background: on > 0.5 ? '#4ade80' : 'rgba(255,255,255,0.25)', position: 'relative'}}>
              <div style={{position: 'absolute', top: 1 * u, left: mix(1, 8, on) * u, width: 7 * u, height: 7 * u, borderRadius: '50%', background: 'white'}} />
            </div>
          </div>
          <div style={{fontFamily: tight, fontWeight: 600, fontSize: 4.6 * u, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 6 * u,
            opacity: on}}>Notifications silenced</div>
        </div>
      );
    }
    case 'apps':
      return (
        <div style={{position: 'absolute', inset: 0, padding: `${20 * u}px ${8 * u}px`, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', rowGap: 8 * u,
          justifyItems: 'center'}}>
          {s.apps.map((ap, i) => {
            const x = ap.xAt !== undefined ? ease(t, ap.xAt, ap.xAt + 0.2) : 0;
            return (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 * u, position: 'relative', ...popStyle(t, s.at + i * 0.05, 0.25)}}>
                <div style={{filter: x > 0 ? `grayscale(${x}) brightness(${1 - 0.5 * x})` : undefined}}><AppIcon name={ap.name} color={ap.color} size={20 * u} /></div>
                <span style={{fontFamily: tight, fontWeight: 600, fontSize: 3.8 * u, color: 'rgba(255,255,255,0.8)'}}>{ap.name}</span>
                {x > 0 && <div style={{position: 'absolute', top: -2 * u, left: '50%', transform: `translateX(-50%) scale(${mix(1.6, 1, x)})`, opacity: x}}>
                  <Icon name="x" size={24 * u} color={C.bad} stroke={3.4} /></div>}
              </div>
            );
          })}
        </div>
      );
  }
};
export const PhoneMock: React.FC<{b: PhoneBeat; t: number}> = ({b, t}) => {
  const {width: W, height: H} = useVideoConfig();
  const h = 0.8 * H, w = h * 0.485;
  const cx = b.side === 'right' ? 0.74 * W : b.side === 'left' ? 0.26 * W : b.caption ? 0.68 * W : 0.5 * W;
  const inK = ease(t, b.start - 0.22, b.start + 0.35, Easing.out(Easing.cubic));
  const cur = [...b.screens].reverse().find((s) => t >= s.at) ?? b.screens[0];
  const float = Math.sin(t * 1.3) * 0.006 * H;
  const inner = h - 2 * 0.011 * h - 2 * 0.012 * h;
  return (
    <>
      {b.caption && (
        <div style={{position: 'absolute', left: 0.07 * W, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', maxWidth: 0.44 * W}}>
          {b.caption.map((l, i) => <StackLine key={i} l={l} t={t} size={Math.min(SIZE[l.size ?? 'l'] * H, (0.44 * W) / (l.words.reduce((n, x) => n + x.t.length + 1, 0) * 0.56))} />)}
        </div>
      )}
      <PhoneDevice x={cx} y={H / 2 + float + (1 - inK) * 0.1 * H} h={h} ry={b.caption ? mix(-34, -14, inK) : mix(-20, -6, inK)} rx={4} o={inK}
        glow="#2f6bff" glowK={0.35 * inK}>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#121a33 0%,#0a0f1f 60%,#070a14 100%)'}} />
        <div style={{position: 'absolute', top: 0.022 * h, left: w * 0.1, fontFamily: tight, fontWeight: 700, fontSize: 0.02 * h, color: 'white'}}>9:41</div>
        <Screen key={cur.at} s={cur} t={t} w={inner * 0.485} h={inner} />
      </PhoneDevice>
    </>
  );
};

// text pinned over 3D scenes
export const GfxTexts: React.FC<{texts: {words: Word[]; at: number; style: string; x: number; y: number; align?: string}[]; t: number}> = ({texts, t}) => {
  const {width: W, height: H} = useVideoConfig();
  return (
    <>
      {texts.map((g, i) => {
        if (t < g.at - 0.05) return null;
        const tr = g.align === 'left' ? 'translateY(-50%)' : g.align === 'right' ? 'translate(-100%,-50%)' : 'translate(-50%,-50%)';
        const base: React.CSSProperties = {position: 'absolute', left: g.x * W, top: g.y * H, transform: tr, whiteSpace: 'nowrap'};
        if (g.style === 'neon') {
          return <div key={i} style={base}><ScriptWrite text={g.words.map((w) => w.t).join(' ')} t={t} at={g.at} size={0.13 * H} /></div>;
        }
        const size = g.style === 'small' ? 0.045 * H : g.style === 'gold' ? 0.085 * H : 0.068 * H;
        const color = g.style === 'gold' ? C.gold : g.style === 'bad' ? C.bad : g.style === 'good' ? C.good : 'white';
        const glow = g.style === 'gold' ? GOLD_SHADOW : g.style === 'bad' ? '0 0 24px rgba(255,77,77,0.55)' : g.style === 'good' ? '0 0 24px rgba(74,222,128,0.5)' : SHADOW;
        return (
          <div key={i} style={{...base, display: 'flex', gap: `0 ${size * 0.26}px`}}>
            {g.words.map((w, j) => (
              <span key={j} style={{fontFamily: sora, fontWeight: g.style === 'small' ? 600 : 800, fontSize: size, color, letterSpacing: '-0.03em',
                textShadow: glow, ...wordStyle(w, size), ...reveal(t, w.at)}}>{w.t}</span>
            ))}
          </div>
        );
      })}
    </>
  );
};

