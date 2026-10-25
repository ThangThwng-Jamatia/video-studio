// v2 design system for long edits (user 2026-10-19: "more depth, cleaner, less cartoonish"). 2.5D: perspective glass
// panels with sheen + floor shadows, parallax bokeh backgrounds, realistic phone devices. No primitive 3D here.
import React from 'react';
import {AbsoluteFill, Easing, useVideoConfig} from 'remotion';
import {C, ease, GOLD_SHADOW, mix, out, popK, reveal, rnd, SHADOW, sora, tight} from './theme';
import {Icon, type IconName} from './Icons';
import {ScriptWrite, wordStyle} from './Text';
import type {BatteryBeat, CalendarBeat, DopamineBeat, PhonePairBeat, TrackerBeat, VersusBeat, Word} from './types';

// ---------- background with depth ----------
export const DepthBg: React.FC<{t: number; warm?: number}> = ({t, warm = 0}) => {
  const {width: W, height: H} = useVideoConfig();
  const layers = [
    {n: 34, size: [3, 9], blur: 1, speed: 6, alpha: 0.55},
    {n: 16, size: [14, 36], blur: 6, speed: 14, alpha: 0.22},
    {n: 7, size: [60, 140], blur: 22, speed: 30, alpha: 0.12},
  ];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#02040a 0%,#050b1d 48%,#091633 78%,#0c1d45 100%)', overflow: 'hidden'}}>
      {/* soft light shafts from above */}
      {[0, 1, 2].map((i) => (
        <div key={`s${i}`} style={{position: 'absolute', top: -0.2 * H, left: (0.18 + i * 0.3) * W + Math.sin(t * 0.25 + i) * 40, width: 0.14 * W,
          height: 1.3 * H, transform: `rotate(${18 - i * 6}deg)`, transformOrigin: 'top center', filter: 'blur(40px)',
          background: 'linear-gradient(180deg, rgba(140,180,255,0.10) 0%, rgba(140,180,255,0.03) 55%, rgba(0,0,0,0) 100%)'}} />
      ))}
      {/* parallax bokeh */}
      {layers.map((L, li) => Array.from({length: L.n}, (_, i) => {
        const seed = li * 100 + i;
        const sz = mix(L.size[0], L.size[1], rnd(seed * 1.3));
        const x = (((rnd(seed) * W * 1.2 + t * L.speed * (rnd(seed + 7) > 0.5 ? 1 : -1)) % (W * 1.2)) + W * 1.2) % (W * 1.2) - W * 0.1;
        const y = rnd(seed + 3) * H * 0.95 + Math.sin(t * 0.4 + seed) * 12;
        const gold = rnd(seed + 11) < 0.22 + warm * 0.4;
        return <div key={`b${seed}`} style={{position: 'absolute', left: x, top: y, width: sz, height: sz, borderRadius: '50%',
          background: gold ? `rgba(255,205,130,${L.alpha})` : `rgba(150,190,255,${L.alpha})`, filter: `blur(${L.blur}px)`}} />;
      }))}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 42% at 50% 112%, rgba(60,120,255,0.55) 0%, rgba(30,70,210,0.18) 40%, rgba(0,0,0,0) 70%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 55% 3.5% at 50% 89%, rgba(200,225,255,0.45) 0%, rgba(0,0,0,0) 100%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 75% at 50% 46%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------- glass panel in perspective ----------
type PanelProps = {x: number; y: number; w: number; h: number; ry?: number; rx?: number; z?: number; s?: number; o?: number; blur?: number;
  glow?: string; glowK?: number; dim?: number; sheen?: number; r?: number; children?: React.ReactNode; tint?: string};
export const Panel: React.FC<PanelProps> = ({x, y, w, h, ry = 0, rx = 0, z = 0, s = 1, o = 1, blur = 0, glow, glowK = 0, dim = 0, sheen = -1, r = 28, children, tint}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: o,
    transform: `perspective(1800px) translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`,
    filter: [blur > 0.2 ? `blur(${blur}px)` : '', dim > 0 ? `grayscale(${dim}) brightness(${1 - 0.4 * dim})` : ''].join(' ') || undefined}}>
    {/* floor shadow */}
    <div style={{position: 'absolute', left: '8%', right: '8%', bottom: -h * 0.12, height: h * 0.12, borderRadius: '50%',
      background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(8px)'}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: r, overflow: 'hidden',
      background: `linear-gradient(150deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.03) 32%, rgba(255,255,255,0) 60%), ${tint ?? 'linear-gradient(180deg, rgba(22,30,56,0.94) 0%, rgba(9,13,26,0.96) 100%)'}`,
      border: `1.5px solid rgba(255,255,255,${0.14 + 0.2 * glowK})`,
      boxShadow: [glow && glowK > 0 ? `0 0 ${70 * glowK}px ${glow}${Math.round(0x66 * glowK).toString(16).padStart(2, '0')}, 0 0 0 ${1.5 * glowK}px ${glow}` : '',
        '0 50px 120px rgba(0,0,0,0.6)', 'inset 0 1px 0 rgba(255,255,255,0.22)'].filter(Boolean).join(', ')}}>
      {children}
      {sheen >= 0 && sheen <= 1 && (
        <div style={{position: 'absolute', top: '-20%', bottom: '-20%', width: '35%', left: `${mix(-45, 120, sheen)}%`, transform: 'skewX(-18deg)',
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0) 100%)'}} />
      )}
    </div>
  </div>
);

const fitSize = (words: Word[], maxW: number, want: number, perLine = 2) => {
  const longest = Math.max(...words.map((w) => w.t.length * (w.f === 'script' ? 1.15 : 1)));
  const total = words.reduce((n, w) => n + w.t.length + 1, 0);
  return Math.min(want, maxW / (longest * 0.6), (maxW * perLine) / (total * 0.6));
};
const BigWords: React.FC<{words: Word[]; t: number; size: number; color?: string; align?: 'center' | 'left'}> = ({words, t, size, color = 'white', align = 'center'}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', alignItems: 'baseline',
    gap: `0 ${size * 0.25}px`, textAlign: align}}>
    {words.map((w, i) => (
      <span key={i} style={{fontFamily: sora, fontWeight: 800, fontSize: size, color, letterSpacing: '-0.035em', lineHeight: 1.04,
        textShadow: SHADOW, ...wordStyle(w, size), ...reveal(t, w.at, 0.22)}}>{w.t}</span>
    ))}
  </div>
);
const Badge: React.FC<{good: boolean; size: number; k: number}> = ({good, size, k}) => {
  const col = good ? C.good : C.bad;
  return (
    <div style={{width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: good ? 'linear-gradient(160deg,#5ef08f,#1f9a4c)' : 'linear-gradient(160deg,#ff6b6b,#b3121f)',
      boxShadow: `0 0 40px ${col}aa, 0 10px 30px rgba(0,0,0,0.5)`, transform: `scale(${k})`, opacity: Math.min(1, k * 2)}}>
      <Icon name={good ? 'check' : 'x'} size={size * 0.55} color="white" stroke={3.2} />
    </div>
  );
};
const Kicker: React.FC<{text: string; t: number; at: number; y: number}> = ({text, t, at, y}) => {
  const {height: H} = useVideoConfig();
  return <div style={{position: 'absolute', left: 0, right: 0, top: y * H, textAlign: 'center', fontFamily: tight, fontWeight: 700,
    fontSize: 0.034 * H, letterSpacing: '0.3em', color: C.gold, textTransform: 'uppercase', textShadow: GOLD_SHADOW, ...reveal(t, at)}}>{text}</div>;
};

// ---------- versus v2: two panels in perspective ----------
const Thumb: React.FC<{big: string; title: string; meta: string; w: number; h: number; t: number; at: number}> = ({big, title, meta, w, h, t, at}) => {
  const th = w * 0.5625;
  return (
    <div style={{position: 'absolute', inset: w * 0.045, display: 'flex', flexDirection: 'column'}}>
      <div style={{position: 'relative', width: '100%', height: th, borderRadius: 18, overflow: 'hidden',
        background: 'radial-gradient(ellipse at 30% 30%, #ff7a2f 0%, #d1202f 45%, #4a0610 100%)'}}>
        <div style={{position: 'absolute', left: '7%', top: '9%', padding: '4px 14px', background: 'black', color: 'white', fontFamily: tight,
          fontWeight: 800, fontSize: th * 0.07, letterSpacing: '0.06em'}}>SUCCESS</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: '30%', textAlign: 'center', fontFamily: sora, fontWeight: 800, fontSize: th * 0.3,
          color: '#ffe14a', letterSpacing: '-0.04em', transform: 'rotate(-5deg)', WebkitTextStroke: `${th * 0.012}px #1a0000`,
          textShadow: '0 8px 0 rgba(0,0,0,0.45)', ...reveal(t, at, 0.2)}}>{big}</div>
        <div style={{position: 'absolute', right: '4%', bottom: '8%', padding: '2px 8px', background: 'rgba(0,0,0,0.8)', color: 'white',
          fontFamily: tight, fontWeight: 700, fontSize: th * 0.06, borderRadius: 6}}>12:04</div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: th * 0.025, background: 'rgba(255,255,255,0.3)'}}>
          <div style={{width: '62%', height: '100%', background: '#ff0033'}} /></div>
      </div>
      <div style={{fontFamily: tight, fontWeight: 700, fontSize: h * 0.06, color: 'white', marginTop: h * 0.035, lineHeight: 1.2}}>{title}</div>
      <div style={{fontFamily: tight, fontWeight: 500, fontSize: h * 0.042, color: 'rgba(255,255,255,0.55)', marginTop: h * 0.012}}>{meta}</div>
    </div>
  );
};
export const VersusV2: React.FC<{b: VersusBeat; t: number}> = ({b, t}) => {
  const {width: W, height: H} = useVideoConfig();
  const pw = 0.37 * W, ph = 0.52 * H, py = 0.55 * H;
  const badIn = Math.min(b.badAt - 0.35, b.start - 0.18);
  const kIn = ease(t, badIn, badIn + 0.5, Easing.out(Easing.cubic));
  const stampAt = b.badAt + 0.55;
  const stamp = popK(t, stampAt, 0.3);
  const dim = ease(t, stampAt + 0.25, stampAt + 0.7);
  const gIn = Math.min(b.goodAt - 0.3, stampAt + 0.35);
  const kg = ease(t, gIn, gIn + 0.5, Easing.out(Easing.cubic));
  const badWords = b.bad.map((w, j) => ({...w, at: Math.min(w.at, badIn + 0.25 + j * 0.07)}));
  const qK = 1 - ease(t, b.goodAt - 0.2, b.goodAt + 0.1);
  const glowK = ease(t, b.goodAt, b.goodAt + 0.6);
  const strike = ease(t, stampAt, stampAt + 0.25);
  const textW = pw * 0.84;
  const badSize = fitSize(b.bad, textW, 0.11 * H, 3);
  const goodSize = fitSize(b.good, textW, 0.12 * H, 2);
  return (
    <>
      {b.kicker && <Kicker text={b.kicker} t={t} at={b.start - 0.15} y={0.1} />}
      <Panel x={mix(0.12, 0.27, kIn) * W} y={py} w={pw} h={ph} ry={14} s={mix(1, 0.94, dim)} o={kIn} blur={(1 - kIn) * 14} dim={dim * 0.8}
        sheen={ease(t, badIn + 0.2, badIn + 1.0)} tint="linear-gradient(180deg, rgba(40,16,22,0.94) 0%, rgba(14,8,14,0.96) 100%)">
        {b.thumb ? <Thumb big={b.thumb.big} title={b.thumb.title} meta={b.thumb.meta} w={pw} h={ph} t={t} at={badIn + 0.1} /> : (
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: pw * 0.08}}>
            <BigWords words={badWords} t={t} size={badSize} color="rgba(255,255,255,0.86)" />
          </div>
        )}
        {strike > 0 && <div style={{position: 'absolute', left: '6%', top: b.thumb ? '30%' : '50%', width: `${88 * strike}%`, height: Math.max(6, 0.008 * H),
          background: C.bad, borderRadius: 6, transform: 'rotate(-8deg)', transformOrigin: 'left center', boxShadow: '0 0 24px rgba(255,77,77,0.9)'}} />}
      </Panel>
      <div style={{position: 'absolute', left: 0.27 * W - pw / 2 - 0.02 * H, top: py - ph / 2 - 0.035 * H}}><Badge good={false} size={0.09 * H} k={stamp} /></div>
      <Panel x={mix(0.88, 0.73, kg) * W} y={py} w={pw} h={ph} ry={-14} s={mix(0.96, 1.04, glowK)} o={kg} blur={(1 - kg) * 14}
        glow={C.gold} glowK={glowK} sheen={ease(t, b.goodAt + 0.1, b.goodAt + 1.0)}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: pw * 0.08}}>
          {b.goodKicker && <div style={{fontFamily: tight, fontWeight: 700, fontSize: 0.03 * H, letterSpacing: '0.28em', color: C.gold, marginBottom: 0.03 * H,
            ...reveal(t, gIn + 0.15)}}>{b.goodKicker}</div>}
          <BigWords words={b.good} t={t} size={goodSize} />
        </div>
        {qK > 0 && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: sora,
          fontWeight: 800, fontSize: 0.22 * H, color: `rgba(245,196,81,${0.28 * qK})`, textShadow: GOLD_SHADOW}}>?</div>}
      </Panel>
      <div style={{position: 'absolute', left: 0.73 * W - pw / 2 - 0.02 * H, top: py - ph / 2 - 0.035 * H}}><Badge good size={0.09 * H} k={popK(t, b.goodAt + 0.1, 0.3)} /></div>
    </>
  );
};

// ---------- calendar v2 ----------
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export const CalendarV2: React.FC<{b: CalendarBeat; t: number}> = ({b, t}) => {
  const {width: W, height: H} = useVideoConfig();
  if (b.mode === 'last3') {
    const ats = b.litAts ?? [b.litAt, b.litAt + 0.35, b.litAt + 0.7];
    const push = ease(t, b.start, b.end, Easing.inOut(Easing.sin));
    return (
      <>
        <Kicker text={b.kicker ?? '2026'} t={t} at={b.start - 0.15} y={0.12} />
        <div style={{position: 'absolute', inset: 0, transform: `scale(${mix(1, 1.06, push)})`}}>
          {['OCT', 'NOV', 'DEC'].map((m, i) => {
            const k = ease(t, ats[i], ats[i] + 0.35);
            const pin = out(t, b.start - 0.22 + i * 0.07, 0.4);
            return (
              <Panel key={m} x={(0.3 + i * 0.2) * W} y={0.48 * H} w={0.17 * W} h={0.38 * H} ry={(1 - i) * 10} o={pin} blur={(1 - pin) * 10}
                glow={C.gold} glowK={k} sheen={ease(t, ats[i], ats[i] + 0.8)} s={1 + 0.05 * k}
                tint={k > 0 ? `linear-gradient(170deg, rgba(255,214,120,${0.55 * k}) 0%, rgba(120,70,10,${0.6 * k}) 100%), rgba(14,18,34,0.95)` : undefined}>
                <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.03 * H}}>
                  <span style={{fontFamily: sora, fontWeight: 800, fontSize: 0.1 * H, color: k > 0.5 ? '#fff7dc' : 'rgba(255,255,255,0.75)',
                    letterSpacing: '0.02em', textShadow: k > 0.5 ? GOLD_SHADOW : undefined}}>{m}</span>
                  <Icon name="star" size={0.06 * H} color={k > 0.5 ? C.gold2 : 'rgba(255,255,255,0.3)'} stroke={2} />
                </div>
              </Panel>
            );
          })}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0.77 * H, textAlign: 'center', fontFamily: sora, fontWeight: 800, fontSize: 0.1 * H,
          color: C.gold, letterSpacing: '-0.03em', textShadow: GOLD_SHADOW, ...reveal(t, b.labelAt, 0.3)}}>{b.label}</div>
      </>
    );
  }
  const stamps = b.stampAts ?? MONTHS.slice(0, 9).map((_, i) => b.start + 0.3 + (i * (b.litAt - b.start - 0.6)) / 9);
  // user 2026-10-20: grid sat in the top half (empty bottom, stamps too small) -> bigger tiles, gentler tilt, fills to ~0.83 H
  const tilt = mix(14, 7, ease(t, b.start, b.end, Easing.inOut(Easing.sin)));
  const tw = 0.128 * W, th = 0.2 * H, g = 0.014 * W;
  return (
    <>
      <Kicker text={b.kicker ?? '2026'} t={t} at={b.start - 0.15} y={0.09} />
      {b.headline && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 0.15 * H, display: 'flex', justifyContent: 'center'}}>
          <BigWords words={b.headline} t={t} size={0.1 * H} />
        </div>
      )}
      <div style={{position: 'absolute', left: '50%', top: 0.37 * H, transform: `translateX(-50%) perspective(1600px) rotateX(${tilt}deg)`,
        transformOrigin: 'center top', display: 'grid', gridTemplateColumns: `repeat(6, ${tw}px)`, gap: g}}>
        {MONTHS.map((m, i) => {
          const past = i < 9;
          const st = past ? ease(t, stamps[i], stamps[i] + 0.12) : 0;
          const pin = out(t, b.start - 0.2 + i * 0.025, 0.35);
          return (
            <div key={m} style={{width: tw, height: th, position: 'relative', borderRadius: 18, opacity: pin, transform: `translateY(${(1 - pin) * 30}px)`,
              background: 'linear-gradient(160deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 40%), rgba(14,20,40,0.94)',
              border: past ? '1.5px solid rgba(255,255,255,0.13)' : '1.5px solid rgba(122,166,255,0.55)',
              boxShadow: past ? '0 24px 60px rgba(0,0,0,0.55)' : '0 0 30px rgba(47,107,255,0.35), 0 24px 60px rgba(0,0,0,0.55)'}}>
              <div style={{position: 'absolute', left: 0, right: 0, top: '18%', textAlign: 'center', fontFamily: sora, fontWeight: 700, fontSize: 0.058 * H,
                color: past && st > 0 ? 'rgba(255,255,255,0.3)' : 'white'}}>{m}</div>
              {st > 0 && (
                <div style={{position: 'absolute', left: '50%', top: '68%', transform: `translate(-50%,-50%) scale(${mix(1.8, 1, st)}) rotate(-10deg)`, opacity: st}}>
                  <Icon name="x" size={0.085 * H} color={C.bad} stroke={3.4} style={{filter: 'drop-shadow(0 0 10px rgba(255,77,77,0.8))'}} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

// ---------- tracker v2 ----------
export const TrackerV2: React.FC<{b: TrackerBeat; t: number}> = ({b, t}) => {
  const {width: W, height: H} = useVideoConfig();
  const n = b.items.length;
  const intro = b.mode === 'intro';
  const ats = b.introAts ?? b.items.map((_, i) => b.start + 0.2 + i * 0.16);
  const settle = intro ? ease(t, ats[n - 1] + 0.5, ats[n - 1] + 1.3) : 1;
  const tw = 0.155 * W, th = 0.38 * H;
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0.08 * H, textAlign: 'center', fontFamily: sora, fontWeight: 800, fontSize: 0.09 * H,
        color: 'white', letterSpacing: '-0.03em', textShadow: '0 0 40px rgba(169,207,255,0.4)', ...reveal(t, (b.titleAt ?? b.start) - 0.15, 0.3)}}>{b.title}</div>
      {b.items.map((it, i) => {
        const a = intro ? ats[i] : b.start + i * 0.03;
        const k = ease(t, a - 0.05, a + 0.45, Easing.out(Easing.cubic));
        const isTick = b.mode === 'tick' && i === b.done && b.tickAt !== undefined;
        const tk = isTick ? ease(t, b.tickAt!, b.tickAt! + 0.3) : 0;
        const done = i < b.done || tk > 0;
        const dk = i < b.done ? 1 : tk;
        const next = b.mode === 'tick' && i === b.done;
        // fan (staircase in depth) → row
        const fx = 0.5 + (i - (n - 1) / 2) * 0.13, fy = 0.54 + (i - (n - 1) / 2) * -0.025, fz = -i * 70, fry = -30;
        const rx = 0.5 + (i - (n - 1) / 2) * 0.172, ry0 = 0.53;
        const x = mix(fx, rx, settle) * W, y = mix(fy, ry0, settle) * H;
        return (
          <Panel key={i} x={x} y={y + (1 - k) * 0.25 * H} w={tw} h={th} ry={mix(fry, 0, settle)} z={mix(fz, 0, settle)} o={k} blur={(1 - k) * 12}
            glow={done ? C.gold : '#7aa6ff'} glowK={done ? dk : next ? 0.5 : 0} dim={b.mode === 'tick' && !done && !next ? 0.5 : 0}
            sheen={isTick ? ease(t, b.tickAt!, b.tickAt! + 0.8) : intro ? ease(t, a + 0.1, a + 0.9) : -1}
            s={isTick ? 1 + 0.06 * Math.sin(Math.min(1, ease(t, b.tickAt!, b.tickAt! + 0.45)) * Math.PI) : 1}>
            <div style={{position: 'absolute', left: 0.022 * H, top: 0.018 * H, fontFamily: sora, fontWeight: 800, fontSize: 0.05 * H,
              color: done ? C.gold : 'rgba(255,255,255,0.35)'}}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 0.1 * H, display: 'flex', justifyContent: 'center'}}>
              <Icon name={it.icon as IconName} size={0.11 * H} color={done ? C.gold2 : '#dbe8ff'} stroke={1.7} />
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0.04 * H, textAlign: 'center', fontFamily: sora, fontWeight: 700,
              fontSize: 0.038 * H, color: done ? C.gold2 : 'white'}}>{it.label}</div>
            {done && (
              <div style={{position: 'absolute', right: 0.016 * H, top: 0.016 * H}}><Badge good size={0.05 * H} k={i < b.done ? 1 : popK(t, b.tickAt!, 0.3)} /></div>
            )}
          </Panel>
        );
      })}
      {b.week && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 0.8 * H, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.03 * W}}>
          <span style={{fontFamily: sora, fontWeight: 800, fontSize: 0.06 * H, color: C.gold, letterSpacing: '-0.02em', textShadow: GOLD_SHADOW,
            ...reveal(t, b.week.at, 0.25)}}>{b.week.label}</span>
          <div style={{display: 'flex', gap: 0.008 * W}}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
              const k = ease(t, b.week!.at + 0.2 + i * 0.08, b.week!.at + 0.35 + i * 0.08);
              return <div key={i} style={{width: 0.048 * H, height: 0.048 * H, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontFamily: tight, fontWeight: 800, fontSize: 0.022 * H, color: k > 0.5 ? '#2a1c00' : 'rgba(255,255,255,0.6)',
                background: k > 0 ? `rgba(245,196,81,${k})` : 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(245,196,81,0.5)',
                opacity: out(t, b.week!.at, 0.2)}}>{d}</div>;
            })}
          </div>
        </div>
      )}
    </>
  );
};

// ---------- battery ----------
export const BatteryCard: React.FC<{b: BatteryBeat; t: number}> = ({b, t}) => {
  const {width: W, height: H} = useVideoConfig();
  let lv = b.from;
  for (const s of b.steps) lv = mix(lv, s.to, ease(t, s.at, s.at + 0.8, Easing.inOut(Easing.cubic)));
  const hue = Math.max(0, Math.min(120, (lv - 0.08) * 150));
  const col = `hsl(${hue}, 85%, 55%)`;
  const low = lv < 0.25 ? 0.5 + 0.5 * Math.sin(t * 9) : 0;
  const bw = 0.34 * W, bh = 0.3 * H, inset = 0.016 * H;
  const pin = out(t, b.start - 0.2, 0.5);
  return (
    <>
      <div style={{position: 'absolute', left: 0.07 * W, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 0.012 * H}}>
        {b.lines.map((l, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 0.02 * W}}>
            {i > 0 && <div style={{...reveal(t, l.at)}}><Icon name="down" size={0.06 * H} color={C.bad} stroke={2.8} /></div>}
            <span style={{fontFamily: sora, fontWeight: 800, fontSize: (i === 0 ? 0.1 : 0.085) * H, color: i === b.lines.length - 1 ? '#ff8a8a' : 'white',
              letterSpacing: '-0.035em', textShadow: SHADOW, ...reveal(t, l.at, 0.25)}}>
              {l.words.map((w, j) => <span key={j} style={{...wordStyle(w, 0.09 * H), marginRight: '0.25em'}}>{w.t}</span>)}
            </span>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0.69 * W - bw / 2, top: 0.5 * H - bh / 2, width: bw, height: bh, opacity: pin,
        transform: `perspective(1600px) rotateY(-16deg) rotateX(6deg) translateY(${(1 - pin) * 40}px)`}}>
        <div style={{position: 'absolute', left: '6%', right: '6%', bottom: -bh * 0.18, height: bh * 0.14, borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(10px)'}} />
        <div style={{position: 'absolute', right: -0.03 * W, top: '32%', width: 0.03 * W, height: '36%', borderRadius: '0 18px 18px 0',
          background: 'linear-gradient(180deg,#cfd6e4,#6b7385)'}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: 0.07 * H, border: '6px solid rgba(230,238,255,0.55)',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02) 45%), rgba(10,14,26,0.85)',
          boxShadow: `0 0 ${60 * low}px rgba(255,60,60,${0.7 * low}), 0 50px 120px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.3)`}}>
          <div style={{position: 'absolute', left: inset, top: inset, bottom: inset, width: `calc(${lv * 100}% - ${2 * inset * lv}px)`,
            borderRadius: 0.05 * H, overflow: 'hidden', background: `linear-gradient(180deg, ${col} 0%, hsl(${hue}, 80%, 38%) 100%)`,
            boxShadow: `0 0 50px hsla(${hue}, 90%, 55%, 0.6)`}}>
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 40%)'}} />
            <div style={{position: 'absolute', top: 0, bottom: 0, width: '30%', left: `${((t * 40) % 160) - 40}%`, transform: 'skewX(-20deg)',
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%)'}} />
          </div>
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: sora, fontWeight: 800,
            fontSize: 0.15 * H, color: 'white', letterSpacing: '-0.04em', textShadow: '0 4px 30px rgba(0,0,0,0.6)', fontVariantNumeric: 'tabular-nums'}}>
            {Math.round(lv * 100)}%
          </div>
        </div>
      </div>
    </>
  );
};

// ---------- dopamine: notifications from depth + heartbeat trace ----------
const NOTIFS = [
  {app: 'Instagram', msg: 'liked your reel', col: 'linear-gradient(135deg,#feda75,#d62976,#4f5bd5)'},
  {app: 'YouTube', msg: 'New video for you', col: '#ff0033'},
  {app: 'Snapchat', msg: '3 new snaps', col: '#f7d000'},
  {app: 'WhatsApp', msg: '24 new messages', col: '#25d366'},
  {app: 'Instagram', msg: 'started following you', col: 'linear-gradient(135deg,#feda75,#d62976,#4f5bd5)'},
  {app: 'Free Fire', msg: 'Daily reward ready', col: '#ff7a00'},
  {app: 'YouTube', msg: 'Shorts: trending now', col: '#ff0033'},
  {app: 'Instagram', msg: '12 people liked your post', col: 'linear-gradient(135deg,#feda75,#d62976,#4f5bd5)'},
];
export const DopamineCascade: React.FC<{b: DopamineBeat; t: number}> = ({b, t}) => {
  const {width: W, height: H} = useVideoConfig();
  const n = b.count ?? 16;
  const span = b.end - b.start - 0.6;
  const hits = Array.from({length: n}, (_, i) => b.start + 0.2 + span * (1 - Math.pow(1 - i / n, 1.7)));
  const nw = 0.34 * W, nh = 0.1 * H;
  const shown = hits.filter((h) => t >= h - 0.4);
  // heartbeat trace over the shot
  const pts: string[] = [];
  const x0 = 0.06 * W, x1 = 0.94 * W, yb = 0.86 * H;
  const now = Math.min(1, (t - b.start) / (b.end - b.start));
  const steps = 240;
  for (let s = 0; s <= steps * now; s++) {
    const tt = b.start + (s / steps) * (b.end - b.start);
    let y = 0;
    for (const h of hits) {
      const d = tt - h;
      if (d > -0.05 && d < 0.25) y += d < 0 ? (d + 0.05) * 8 * 0.4 : Math.exp(-d * 18) * (1 - Math.abs(Math.sin(d * 60)) * 0.3);
    }
    pts.push(`${x0 + (x1 - x0) * (s / steps)},${yb - Math.min(1.4, y) * 0.07 * H}`);
  }
  return (
    <>
      <div style={{position: 'absolute', inset: 0, perspective: 1200, perspectiveOrigin: '50% 45%'}}>
        {shown.map((h, i) => {
          const nt = NOTIFS[i % NOTIFS.length];
          const k = ease(t, h - 0.4, h, Easing.out(Easing.cubic));
          const age = Math.max(0, t - h);
          const ang = rnd(i * 3.3) * Math.PI * 2;
          const rr = 0.16 + rnd(i * 1.7) * 0.26;
          const fx = 0.5 + Math.cos(ang) * rr * 1.05, fy = 0.56 + Math.sin(ang) * rr * 0.6;
          const z = mix(-2400, -40 - rnd(i) * 300, k) - age * 200;
          const blur = Math.max(0, (-z - 200) / 220);
          return (
            <div key={i} style={{position: 'absolute', left: fx * W - nw / 2, top: fy * H - nh / 2, width: nw, height: nh,
              transform: `translateZ(${z}px) rotateY(${(fx - 0.5) * -30}deg) rotateX(${(fy - 0.46) * 20}deg)`, opacity: Math.min(1, k * 1.4) * Math.max(0.25, 1 - age * 0.35),
              filter: blur > 0.3 ? `blur(${Math.min(8, blur)}px)` : undefined, borderRadius: nh * 0.32, display: 'flex', alignItems: 'center',
              gap: nh * 0.2, padding: `0 ${nh * 0.22}px`, background: 'rgba(38,40,48,0.88)', border: '1px solid rgba(255,255,255,0.14)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)'}}>
              <div style={{width: nh * 0.6, height: nh * 0.6, borderRadius: nh * 0.16, background: nt.col, flexShrink: 0}} />
              <div style={{minWidth: 0, flex: 1}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: tight, fontWeight: 700, fontSize: nh * 0.24, color: 'white'}}>
                  <span>{nt.app}</span><span style={{color: 'rgba(255,255,255,0.45)', fontWeight: 500}}>now</span></div>
                <div style={{fontFamily: tight, fontWeight: 500, fontSize: nh * 0.23, color: 'rgba(255,255,255,0.78)', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis'}}>{nt.msg}</div>
              </div>
            </div>
          );
        })}
      </div>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <polyline points={pts.join(' ')} fill="none" stroke="#ff5b8a" strokeWidth={4} strokeLinejoin="round"
          style={{filter: 'drop-shadow(0 0 8px rgba(255,91,138,0.9)) drop-shadow(0 0 22px rgba(255,91,138,0.6))'}} />
      </svg>
      <div style={{position: 'absolute', left: 0.06 * W, top: 0.885 * H, fontFamily: tight, fontWeight: 800, fontSize: 0.026 * H, letterSpacing: '0.3em',
        color: '#ff8fb0'}}>DOPAMINE · {shown.filter((h) => t >= h).length} HITS</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0.07 * H, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {b.headline && <div style={{display: 'flex', gap: `0 ${0.075 * H * 0.26}px`}}>{b.headline.map((w, i) => (
          <span key={i} style={{fontFamily: sora, fontWeight: 800, fontSize: 0.075 * H, color: 'white', letterSpacing: '-0.03em', textShadow: SHADOW,
            ...wordStyle(w, 0.075 * H), ...reveal(t, w.at)}}>{w.t}</span>))}</div>}
        {b.neon && <ScriptWrite text={b.neon.text} t={t} at={b.neon.at} size={0.16 * H} color="#ffe8f0" />}
      </div>
    </>
  );
};

// ---------- realistic phone device ----------
export const PhoneDevice: React.FC<{x: number; y: number; h: number; ry?: number; rx?: number; s?: number; o?: number; dim?: number;
  glow?: string; glowK?: number; children?: React.ReactNode}> = ({x, y, h, ry = 0, rx = 0, s = 1, o = 1, dim = 0, glow, glowK = 0, children}) => {
  const w = h * 0.485, r = h * 0.085, frame = h * 0.011, bezel = h * 0.012;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: o,
      transform: `perspective(2000px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${s})`,
      filter: dim > 0 ? `grayscale(${dim * 0.7}) brightness(${1 - 0.45 * dim})` : undefined}}>
      <div style={{position: 'absolute', left: '10%', right: '10%', bottom: -h * 0.07, height: h * 0.07, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(10px)'}} />
      {[0.2, 0.28].map((p) => <div key={p} style={{position: 'absolute', left: -frame * 0.5, top: `${p * 100}%`, width: frame, height: h * 0.06,
        borderRadius: 3, background: 'linear-gradient(90deg,#4a4f59,#9aa1ad)'}} />)}
      <div style={{position: 'absolute', right: -frame * 0.5, top: '24%', width: frame, height: h * 0.09, borderRadius: 3,
        background: 'linear-gradient(270deg,#4a4f59,#9aa1ad)'}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: r, padding: frame,
        background: 'linear-gradient(135deg,#a7adb8 0%,#3a3e46 22%,#70757f 50%,#2a2d33 78%,#8c919c 100%)',
        boxShadow: [glow && glowK > 0 ? `0 0 ${90 * glowK}px ${glow}99` : '', '0 60px 140px rgba(0,0,0,0.7)'].filter(Boolean).join(', ')}}>
        <div style={{position: 'absolute', inset: frame, borderRadius: r - frame, background: '#000', padding: bezel}}>
          <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: r - frame - bezel, overflow: 'hidden', background: '#0a0c14'}}>
            {children}
            <div style={{position: 'absolute', top: h * 0.016, left: '50%', transform: 'translateX(-50%)', width: w * 0.3, height: h * 0.034,
              borderRadius: 99, background: '#000'}} />
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(125deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.03) 28%, rgba(255,255,255,0) 45%)'}} />
          </div>
        </div>
      </div>
    </div>
  );
};

// doom feed (left) vs tool screen (right)
const POSTS = ['#ff4d6d', '#7c5cff', '#00c2a8', '#ffb020', '#3b82f6', '#ef4444', '#a855f7', '#f97316'];
const DoomFeed: React.FC<{t: number; h: number; red: number}> = ({t, h, red}) => {
  const ph = h * 0.62;
  const off = (t * h * 0.55) % (ph * POSTS.length);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: -off, filter: 'blur(1.2px)'}}>
        {[...POSTS, ...POSTS].map((c, i) => (
          <div key={i} style={{height: ph, position: 'relative', background: `linear-gradient(160deg, ${c} 0%, #10131c 120%)`}}>
            <div style={{position: 'absolute', right: '6%', bottom: '18%', display: 'flex', flexDirection: 'column', gap: h * 0.03, alignItems: 'center'}}>
              {(['star', 'chat', 'arrow'] as IconName[]).map((ic) => <Icon key={ic} name={ic} size={h * 0.045} color="white" stroke={2.2} />)}
            </div>
            <div style={{position: 'absolute', left: '7%', bottom: '8%', display: 'flex', alignItems: 'center', gap: h * 0.012}}>
              <div style={{width: h * 0.04, height: h * 0.04, borderRadius: '50%', background: 'rgba(255,255,255,0.8)'}} />
              <div style={{width: h * 0.14, height: h * 0.014, borderRadius: 4, background: 'rgba(255,255,255,0.8)'}} />
            </div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', inset: 0, background: `rgba(160,0,20,${0.45 * red})`, mixBlendMode: 'multiply'}} />
      <div style={{position: 'absolute', top: h * 0.07, left: 0, right: 0, textAlign: 'center', fontFamily: tight, fontWeight: 800, fontSize: h * 0.03,
        color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.6)'}}>Reels</div>
    </div>
  );
};
const ToolScreen: React.FC<{t: number; h: number; s: number}> = ({t, h, s}) => {
  const tasks = ['Deep work · 2h', 'Edit the video', 'Gym · push day', 'Read 20 pages'];
  const secs = Math.floor((t - s) * 7 + 6129);
  const clock = `${Math.floor(secs / 3600)}:${String(Math.floor(secs / 60) % 60).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  return (
    <div style={{position: 'absolute', inset: 0, padding: `${h * 0.08}px ${h * 0.035}px`, background: 'linear-gradient(180deg,#141a2e 0%,#0b0f1c 100%)'}}>
      <div style={{fontFamily: sora, fontWeight: 800, fontSize: h * 0.05, color: 'white'}}>Today</div>
      <div style={{display: 'flex', alignItems: 'center', gap: h * 0.02, margin: `${h * 0.025}px 0`, padding: h * 0.02, borderRadius: h * 0.025,
        background: 'rgba(245,196,81,0.12)', border: '1px solid rgba(245,196,81,0.4)'}}>
        <svg width={h * 0.09} height={h * 0.09} viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.15)" strokeWidth="5" fill="none" />
          <circle cx="20" cy="20" r="16" stroke="#f5c451" strokeWidth="5" fill="none" strokeDasharray={`${100 * 0.72} 100`} pathLength={100}
            transform="rotate(-90 20 20)" strokeLinecap="round" /></svg>
        <div><div style={{fontFamily: tight, fontWeight: 600, fontSize: h * 0.022, color: 'rgba(255,255,255,0.6)'}}>FOCUS</div>
          <div style={{fontFamily: sora, fontWeight: 800, fontSize: h * 0.04, color: C.gold2, fontVariantNumeric: 'tabular-nums'}}>{clock}</div></div>
      </div>
      {tasks.map((tk, i) => {
        const dk = ease(t, s + 0.6 + i * 0.9, s + 0.8 + i * 0.9);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: h * 0.018, padding: `${h * 0.016}px 0`, borderBottom: '1px solid rgba(255,255,255,0.07)'}}>
            <div style={{width: h * 0.032, height: h * 0.032, borderRadius: '50%', border: `2px solid ${dk > 0.5 ? C.good : 'rgba(255,255,255,0.35)'}`,
              background: dk > 0.5 ? C.good : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {dk > 0.5 && <Icon name="check" size={h * 0.022} color="#062" stroke={3.4} />}</div>
            <span style={{fontFamily: tight, fontWeight: 600, fontSize: h * 0.026, color: dk > 0.5 ? 'rgba(255,255,255,0.5)' : 'white',
              textDecoration: dk > 0.5 ? 'line-through' : undefined}}>{tk}</span>
          </div>
        );
      })}
    </div>
  );
};
export const PhonePair: React.FC<{b: PhonePairBeat; t: number}> = ({b, t}) => {
  const {width: W, height: H} = useVideoConfig();
  const ph = 0.74 * H;
  const inL = ease(t, b.start - 0.25, b.start + 0.4, Easing.out(Easing.cubic));
  const inR = ease(t, b.start - 0.1, b.start + 0.55, Easing.out(Easing.cubic));
  const red = ease(t, b.redAt, b.redAt + 0.6);
  const goldK = ease(t, b.goldAt, b.goldAt + 0.6);
  const float = Math.sin(t * 1.2) * 0.006 * H;
  const lab = (side: 'left' | 'right') => [...b.labels].filter((l) => l.side === side && t >= l.at - 0.05).pop();
  const L = lab('left'), R = lab('right');
  return (
    <>
      <PhoneDevice x={0.3 * W} y={0.45 * H + float} h={ph} ry={mix(30, 16, inL)} s={mix(0.92, 1, inL) * (1 - 0.04 * goldK)} o={inL}
        dim={goldK * 0.7} glow="#ff2d3d" glowK={red * (1 - goldK)}>
        <DoomFeed t={t} h={ph} red={red} />
      </PhoneDevice>
      <PhoneDevice x={0.7 * W} y={0.45 * H - float} h={ph} ry={mix(-30, -16, inR)} s={mix(0.92, 1, inR) * (1 + 0.04 * goldK)} o={inR}
        dim={(1 - goldK) * 0.55} glow={C.gold} glowK={goldK}>
        <ToolScreen t={t} h={ph} s={b.start} />
      </PhoneDevice>
      {L && <div key={`l${L.at}`} style={{position: 'absolute', left: 0.3 * W, top: 0.875 * H, transform: 'translateX(-50%)', whiteSpace: 'nowrap',
        opacity: 1 - 0.5 * goldK}}><div style={{fontFamily: sora, fontWeight: 800, fontSize: 0.05 * H, color: '#ff6b6b', letterSpacing: '-0.02em',
        textShadow: '0 0 24px rgba(255,60,60,0.5)', ...reveal(t, L.at, 0.25)}}>{L.text}</div></div>}
      {R && <div key={`r${R.at}`} style={{position: 'absolute', left: 0.7 * W, top: 0.875 * H, transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>
        <div style={{fontFamily: sora, fontWeight: 800, fontSize: 0.05 * H, color: C.gold, letterSpacing: '-0.02em', textShadow: GOLD_SHADOW,
        ...reveal(t, R.at, 0.25)}}>{R.text}</div></div>}
    </>
  );
};
