// `Long` composition (long-video-editor skill): A-roll with per-sentence framing ("smooth cuts") + snap punch-ins,
// full-screen beats (B-roll, depth cards, 3D) entered by hard cut or card-shrink, overlay beats (stacks, pills, text
// behind the head, phones), persistent neon chapter label, flashes, SFX and a music bed.
// Built by `pipeline.py long` → long_plan.json. v2 (2026-10-19): DepthBg + glass panels replace the flat Look cards.
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Gfx} from '../gfx/registry';
import {ease, mix, out, reveal, SHADOW, sora, tight} from './theme';
import {ChapterLabel, HeadTitle, StackLine, SIZE, WordStack} from './Text';
import {ChainView, ChapterCard, CounterView, GfxTexts, PhoneMock, PillsView, Snow} from './Ui';
import {MGView} from './MG';
import {BatteryCard, CalendarV2, DepthBg, DopamineCascade, PhonePair, TrackerV2, VersusV2} from './Depth';
import type {Angle, Beat, BehindBeat, LongPlan} from './types';

export type {LongPlan} from './types';

const angleAt = (plan: LongPlan, t: number): Angle =>
  plan.angles.find((a) => t >= a.start && t < a.end) ?? {start: 0, end: 1e9, scale: 1, ox: 0.5, oy: 0.4};
// snap punch-in: 4-frame ease to the punch scale, hold, 3-frame release
const punchAt = (plan: LongPlan, t: number) => {
  const p = (plan.punches ?? []).find((q) => t >= q.start && t < q.end);
  if (!p) return 1;
  const k = ease(t, p.start, p.start + 0.13, Easing.out(Easing.cubic)) * (1 - ease(t, p.end - 0.1, p.end));
  return mix(1, p.scale, k);
};
const gradeFilter = (plan: LongPlan, bw = false) => {
  const g = plan.grade ?? {};
  return `brightness(${g.brightness ?? 1.06}) contrast(${g.contrast ?? 1.08}) saturate(${bw ? 0 : g.saturate ?? 1.06})`;
};
const arollTransform = (plan: LongPlan, t: number): React.CSSProperties => {
  const a = angleAt(plan, t);
  return {transform: `scale(${a.scale * punchAt(plan, t)})`, transformOrigin: `${a.ox * 100}% ${a.oy * 100}%`, filter: gradeFilter(plan, a.bw)};
};

const Aroll: React.FC<{plan: LongPlan; t: number; startFrom?: number; muted?: boolean}> = ({plan, t, startFrom = 0, muted}) => (
  <AbsoluteFill style={arollTransform(plan, t)}>
    <OffthreadVideo src={staticFile(plan.aroll)} startFrom={startFrom} muted={muted} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </AbsoluteFill>
);

const Grade: React.FC<{plan: LongPlan}> = ({plan}) => {
  const g = plan.grade ?? {};
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(255,170,90,${g.warmth ?? 0.05}) 0%, rgba(0,0,0,0) 60%)`, mixBlendMode: 'soft-light'}} />
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(20,70,90,0.18) 0%, rgba(0,0,0,0) 55%)', mixBlendMode: 'soft-light'}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 52%, rgba(0,0,0,${g.vignette ?? 0.38}) 100%)`}} />
    </>
  );
};

const useT = (start: number) => {
  const {fps} = useVideoConfig();
  return start + useCurrentFrame() / fps;
};

const DEPTH_BG = new Set(['versus', 'calendar', 'chain', 'chapter', 'tracker', 'battery', 'dopamine', 'phonePair']);
const needsBg = (b: Beat) => DEPTH_BG.has(b.type) || (b.layer === 'full' && (b.type === 'stack' || b.type === 'pills' || b.type === 'counter' || b.type === 'phone'));

// giant words BEHIND the person (person cut-out on top), plus optional kicker/sub lines in front
const Behind: React.FC<{b: BehindBeat; t: number; plan: LongPlan}> = ({b, t, plan}) => {
  const {width: W, height: H} = useVideoConfig();
  const split = b.words.length === 2 && b.faceX !== undefined && b.gap !== undefined;
  const chars = b.words.reduce((n, w) => n + w.t.length + 1, 0);
  const em = 0.8;
  const size = split
    ? Math.min(b.size * H, ((b.faceX! - b.gap! / 2 - 0.03) * W) / (b.words[0].t.length * em), ((0.97 - b.faceX! - b.gap! / 2) * W) / (b.words[1].t.length * em))
    : Math.min(b.size * H, (0.94 * W) / (chars * 0.62));
  const word = (w: (typeof b.words)[number], i: number) => {
    const k = out(t, w.at, 0.28);
    return (
      <span key={i} style={{fontFamily: sora, fontWeight: 800, fontSize: size, letterSpacing: '-0.045em', lineHeight: 1,
        backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #e4efff 45%, #9cc0ff 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text',
        color: 'transparent', filter: `drop-shadow(0 0 40px rgba(120,170,255,0.45))${k < 1 ? ` blur(${(1 - k) * 18}px)` : ''}`,
        opacity: k, transform: `translateY(${(1 - k) * 40}px) scale(${mix(1.08, 1, k)})`, display: 'inline-block', whiteSpace: 'nowrap'}}>{w.t}</span>
    );
  };
  return (
    <AbsoluteFill>
      {split ? (
        <>
          <div style={{position: 'absolute', right: (1 - (b.faceX! - b.gap! / 2)) * W, top: b.y * H, transform: 'translateY(-50%)'}}>{word(b.words[0], 0)}</div>
          <div style={{position: 'absolute', left: (b.faceX! + b.gap! / 2) * W, top: b.y * H, transform: 'translateY(-50%)'}}>{word(b.words[1], 1)}</div>
        </>
      ) : (
        <div style={{position: 'absolute', left: 0, right: 0, top: b.y * H, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center',
          gap: `0 ${size * 0.22}px`, whiteSpace: 'nowrap'}}>{b.words.map(word)}</div>
      )}
      <AbsoluteFill style={arollTransform(plan, t)}>
        <OffthreadVideo src={staticFile(b.fg)} transparent muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      {b.kicker && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 0.085 * H, display: 'flex', justifyContent: 'center', gap: '0 0.4em'}}>
          {b.kicker.map((w, i) => <span key={i} style={{fontFamily: tight, fontWeight: 700, fontSize: 0.036 * H, letterSpacing: '0.32em', color: 'white',
            textTransform: 'uppercase', textShadow: SHADOW, ...reveal(t, w.at, 0.15)}}>{w.t}</span>)}
        </div>
      )}
      {b.sub && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 0.78 * H, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          {b.sub.map((l, i) => <StackLine key={i} l={{...l, align: 'center'}} t={t} size={SIZE[l.size ?? 'l'] * H} />)}
        </div>
      )}
    </AbsoluteFill>
  );
};

const Content: React.FC<{b: Beat; t: number; plan: LongPlan}> = ({b, t, plan}) => {
  const {fps} = useVideoConfig();
  switch (b.type) {
    case 'stack': return <WordStack b={b} t={t} />;
    case 'headTitle': return <HeadTitle b={b} t={t} />;
    case 'pills': return <PillsView b={b} t={t} />;
    case 'versus': return <VersusV2 b={b} t={t} />;
    case 'calendar': return <CalendarV2 b={b} t={t} />;
    case 'counter': return <CounterView b={b} t={t} />;
    case 'chain': return <ChainView b={b} t={t} />;
    case 'chapter': return <ChapterCard b={b} t={t} />;
    case 'tracker': return <TrackerV2 b={b} t={t} />;
    case 'phone': return <PhoneMock b={b} t={t} />;
    case 'battery': return <BatteryCard b={b} t={t} />;
    case 'dopamine': return <DopamineCascade b={b} t={t} />;
    case 'phonePair': return <PhonePair b={b} t={t} />;
    case 'behind': return <Behind b={b} t={t} plan={plan} />;
    case 'mg': return <MGView b={b} t={t} />;
    case 'snow': return <Snow t={t} amount={b.amount ?? 80} opacity={ease(t, b.start, b.start + 0.4) * (1 - ease(t, b.end - 0.4, b.end))} />;
    case 'broll': {
      const p = (t - b.start) / (b.end - b.start);
      const z = b.zoom === 'out' ? mix(1.1, 1.0, p) : b.zoom === 'none' ? 1 : b.zoom === 'push' ? mix(1.0, 1.14, Easing.out(Easing.quad)(p)) : mix(1.0, 1.07, p);
      const f = b.grade === 'warm' ? 'brightness(1.02) contrast(1.08) saturate(1.1) sepia(0.12)' : b.grade === 'none' ? undefined
        : 'brightness(0.98) contrast(1.1) saturate(0.92) hue-rotate(-6deg)';
      return (
        <AbsoluteFill>
          <AbsoluteFill style={{transform: `scale(${z})`, filter: f}}>
            <OffthreadVideo src={staticFile(b.src)} startFrom={Math.round((b.trimFrom ?? 0) * fps)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </AbsoluteFill>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
          {b.dim ? <AbsoluteFill style={{background: `rgba(2,4,10,${b.dim})`}} /> : null}
        </AbsoluteFill>
      );
    }
    case 'gfx3d':
      return (
        <>
          <Gfx scene={b.scene} kind={b.kind} start={b.start} end={b.end} cues={b.cues} />
          {b.texts && <GfxTexts texts={b.texts} t={t} />}
        </>
      );
    case 'flash': return <AbsoluteFill style={{background: 'white', opacity: 1 - ease(t, b.start, b.end)}} />;
    default: return null;
  }
};

const FullBeat: React.FC<{b: Beat; plan: LongPlan}> = ({b, plan}) => {
  const {fps} = useVideoConfig();
  const t = useT(b.start);
  const shrink = b.enter === 'shrink' ? ease(t, b.start, b.start + 0.45) : 1;
  const grow = b.exit === 'grow' ? ease(t, b.end - 0.42, b.end) : 0;
  const contentIn = b.enter === 'shrink' ? out(t, b.start + 0.18, 0.3) : b.enter === 'fade' ? out(t, b.start, 0.25) : 1;
  const contentOut = b.exit === 'fade' ? 1 - ease(t, b.end - 0.25, b.end) : 1;
  const showCard = (b.enter === 'shrink' && shrink < 1) || grow > 0;
  const cardK = grow > 0 ? 1 - grow : shrink;
  const s = mix(1, 0.5, cardK);
  const cardOpacity = grow > 0 ? Math.min(1, grow * 3) : 1 - ease(t, b.start + 0.3, b.start + 0.45);
  return (
    <AbsoluteFill style={{opacity: contentOut}}>
      {needsBg(b) && <DepthBg t={t} />}
      <AbsoluteFill style={{opacity: contentIn}}><Content b={b} t={t} plan={plan} /></AbsoluteFill>
      {showCard && (
        <AbsoluteFill style={{transform: `translateY(${-cardK * 4}%) scale(${s})`, opacity: cardOpacity, borderRadius: 24 / s, overflow: 'hidden',
          border: cardK > 0.02 ? `${1.5 / s}px solid rgba(255,255,255,0.25)` : undefined, boxShadow: `0 40px 120px rgba(0,0,0,${0.6 * cardK})`}}>
          <Aroll plan={plan} t={t} startFrom={Math.round(b.start * fps)} muted />
          <Grade plan={plan} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const OverBeat: React.FC<{b: Beat; plan: LongPlan}> = ({b, plan}) => {
  const t = useT(b.start);
  const o = b.type === 'flash' ? 1 : 1 - ease(t, b.end - 0.18, b.end);
  const isStack = b.type === 'stack';
  const scrimSide = isStack && b.bg === 'scrim' && b.pos !== 'lower';
  const scrimLow = isStack && b.pos === 'lower';
  const dim = isStack && b.bg === 'dim';
  const right = isStack && (b.anchor ? b.anchor.align === 'right' : b.pos.endsWith('r') || b.pos === 'right');
  return (
    <AbsoluteFill style={{opacity: o}}>
      {scrimSide && <AbsoluteFill style={{background: right ? 'linear-gradient(270deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 45%)'
        : 'linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 45%)'}} />}
      {scrimLow && <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.25) 28%, rgba(0,0,0,0) 50%)'}} />}
      {dim && <AbsoluteFill style={{background: 'rgba(2,4,10,0.42)'}} />}
      <Content b={b} t={t} plan={plan} />
    </AbsoluteFill>
  );
};

export const Long: React.FC<{plan: LongPlan}> = ({plan}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;
  const f = (s: number) => Math.round(s * fps);
  const full = plan.beats.filter((b) => b.layer === 'full');
  const over = plan.beats.filter((b) => b.layer === 'over');
  const coveredByCard = full.some((b) => t >= b.start && t < b.end && b.type !== 'broll');
  const m = plan.music;
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <Sequence durationInFrames={f(plan.talkEnd)}>
        <Aroll plan={plan} t={t} />
        <Grade plan={plan} />
      </Sequence>
      {full.map((b, i) => (
        <Sequence key={`f${i}`} from={f(b.start)} durationInFrames={Math.max(1, f(b.end) - f(b.start))}><FullBeat b={b} plan={plan} /></Sequence>
      ))}
      {!coveredByCard && plan.labels.map((l, i) => (
        t >= l.start && t < l.end ? <ChapterLabel key={`l${i}`} text={l.text} t={t} start={l.start} end={l.end} /> : null
      ))}
      {over.map((b, i) => (
        <Sequence key={`o${i}`} from={f(b.start)} durationInFrames={Math.max(1, f(b.end) - f(b.start))}><OverBeat b={b} plan={plan} /></Sequence>
      ))}
      {t >= plan.talkEnd && <AbsoluteFill style={{background: 'black', opacity: ease(t, plan.talkEnd, plan.talkEnd + 0.6)}} />}
      {plan.sfx.map((s, i) => (
        <Sequence key={`s${i}`} from={Math.max(0, f(s.at))} durationInFrames={f(4)}><Audio src={staticFile(s.src)} volume={s.volume ?? 0.3} /></Sequence>
      ))}
      {m && (
        <Audio src={staticFile(m.src)} volume={(fr) => interpolate(fr / fps, [plan.talkEnd - 0.2, plan.talkEnd + 0.4], [m.volume, m.tailVolume ?? m.volume * 2.5],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      )}
    </AbsoluteFill>
  );
};

