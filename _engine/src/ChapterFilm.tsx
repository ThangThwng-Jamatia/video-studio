import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts} from './Captions';
import {Glow, Hook, INK, ramp, reveal, slab, smallCaps, Speech, useSec, type EventFilmProps, type SpeechLine} from './Kathakaar';

// Chapter film (Kathakaar film 2): opening quote -> title hook -> per-segment chapters
// (black card, then photos + clips crossfading) -> end card. Timeline is computed by the
// job's build.py; every start below is absolute (seconds).

export type FilmItem = {
  kind: 'card' | 'photo' | 'multi' | 'clip';
  start: number;
  dur: number;
  // card
  seg?: string;
  classes?: string;
  group?: string;
  // photo / multi
  srcs?: string[];
  portrait?: boolean[];
  move?: 'in' | 'out' | 'left' | 'right';
  layout?: 'auto' | 'framed' | 'row';
  tag?: string;
  // clip
  src?: string;
  vol?: number;
  speech?: boolean;
};

export type ChapterFilmProps = Omit<EventFilmProps, 'bodyDur' | 'chapters'> & {
  items: FilmItem[];
  speech: SpeechLine[];
  quote: string;
  quoteGold: string;
  quoteDur: number;
  hookAt: number;
  endStart: number;
  endDur: number;
  total: number;
  music?: string;
  duck: [number, number][];
  sfx?: {src: string; at: number; volume: number}[];
  endLine1: string;
  endLine2: string;
};

const X = 0.5; // crossfade (matches build.py)
const HOOK_LEN = 7.4;
const GOLD = 'linear-gradient(180deg, #FFF6E0 0%, #FFD89A 55%, #E8A855 100%)';
const goldText: React.CSSProperties = {backgroundImage: GOLD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

// ---------- opening quote ----------
const Quote: React.FC<{p: ChapterFilmProps}> = ({p}) => {
  const t = useSec();
  const out = ramp(t, p.quoteDur - 1.1, p.quoteDur - 0.45, 0, 1, Easing.in(Easing.cubic));
  const lines = p.quote.split('|').map((l) => l.split(' '));
  const nWords = lines.reduce((a, l) => a + l.length, 0);
  const gold = p.quoteGold.split(' ');
  return (
    <AbsoluteFill style={{backgroundColor: INK}}>
      <AbsoluteFill style={{opacity: ramp(t, 0, 1.2)}}>
        <Glow warm={0.6} intensity={0.85} />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - out, filter: `blur(${out * 14}px)`, transform: `scale(${1 + out * 0.04})`}}>
        <div style={{width: 220 * ramp(t, 0.1, 1.0), height: 2, marginBottom: 46, background: 'linear-gradient(90deg, rgba(255,214,150,0) 0%, rgba(255,226,180,1) 50%, rgba(255,214,150,0) 100%)', boxShadow: '0 0 14px 2px rgba(255,200,120,0.55)'}} />
        <div style={{maxWidth: 1480, textAlign: 'center', fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 84, lineHeight: 1.22, color: '#F4F6FA', textShadow: '0 4px 30px rgba(0,0,0,0.45)'}}>
          {lines.map((l, li) => (
            <div key={li}>
              {l.map((w, i) => {
                const k = lines.slice(0, li).reduce((a, x) => a + x.length, 0) + i;
                return (
                  <span key={i} style={{display: 'inline-block', margin: '0 0.13em', ...reveal(t, 0.35 + k * 0.09, 0.8, 18, 10)}}>
                    {w}
                  </span>
                );
              })}
            </div>
          ))}
          {gold.map((w, i) => (
            <span key={`g${i}`} style={{display: 'inline-block', margin: '0 0.13em', fontSize: 104, ...reveal(t, 0.35 + nWords * 0.09 + 0.25 + i * 0.16, 0.9, 20, 12)}}>
              <span style={{...goldText, filter: 'drop-shadow(0 0 22px rgba(255,190,100,0.5))', padding: '0 6px'}}>{w}</span>
            </span>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- chapter card on black ----------
const Card: React.FC<{it: FilmItem}> = ({it}) => {
  const t = useSec();
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const out = ramp(t, it.dur - 0.55, it.dur, 0, 1, Easing.in(Easing.cubic));
  const line = ramp(t, 0.55, 1.4, 0, 1, Easing.bezier(0.65, 0, 0.35, 1));
  const letters = (it.seg ?? '').split('');
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AbsoluteFill style={{background: 'radial-gradient(50% 45% at 50% 50%, rgba(255,200,130,0.07) 0%, rgba(0,0,0,0) 70%)'}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - out, filter: `blur(${out * 12}px)`}}>
        <div style={{display: 'flex'}}>
          {letters.map((ch, i) => {
            const s = spring({frame: frame - Math.round((0.15 + i * 0.045) * fps), fps, config: {damping: 200, stiffness: 90}});
            return (
              <span key={i} style={{fontFamily: slab, fontSize: 150, lineHeight: 1, color: '#F4F6FA', whiteSpace: 'pre', display: 'inline-block', opacity: s, filter: `blur(${(1 - s) * 14}px)`, transform: `translateY(${(1 - s) * 40}px)`, textShadow: '0 0 50px rgba(255,210,150,0.25)'}}>
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{width: 760 * line, height: 2, marginTop: 34, marginBottom: 34, background: 'linear-gradient(90deg, rgba(255,214,150,0) 0%, rgba(255,226,180,1) 50%, rgba(255,214,150,0) 100%)', boxShadow: '0 0 16px 2px rgba(255,200,120,0.6)'}} />
        <div style={{...smallCaps(42, '0.32em', 0.92), marginRight: '-0.32em', ...reveal(t, 0.75, 0.9)}}>{it.classes}</div>
        <div style={{fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 78, lineHeight: 1.3, marginTop: 14, padding: '0 20px', ...goldText, ...reveal(t, 1.05, 1.0)}}>{it.group}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- photos ----------
const kb = (move: FilmItem['move'], p: number) => {
  switch (move) {
    case 'out':
      return `scale(${1.13 - 0.09 * p})`;
    case 'left':
      return `scale(1.1) translateX(${40 - 80 * p}px)`;
    case 'right':
      return `scale(1.1) translateX(${-40 + 80 * p}px)`;
    default:
      return `scale(${1.03 + 0.09 * p})`;
  }
};

const Blurred: React.FC<{src: string}> = ({src}) => (
  <AbsoluteFill>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(38px) brightness(0.48) saturate(1.1)', transform: 'scale(1.18)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 100%)'}} />
  </AbsoluteFill>
);

const card: React.CSSProperties = {borderRadius: 22, boxShadow: '0 0 0 1px rgba(255,255,255,0.12), 0 30px 80px rgba(0,0,0,0.55)', objectFit: 'cover'};

const Photo: React.FC<{it: FilmItem}> = ({it}) => {
  const t = useSec();
  const p = ramp(t, 0, it.dur, 0, 1, Easing.linear);
  const src = it.srcs![0];
  if (!it.portrait?.[0] && it.layout !== 'framed') {
    return (
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: kb(it.move, p)}} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Blurred src={src} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <Img src={staticFile(src)} style={{...card, height: it.layout === 'framed' ? 880 : 960, maxWidth: 1640, transform: `${it.move === 'out' ? `scale(${1.05 - 0.05 * p})` : `scale(${1 + 0.05 * p})`} translateY(${(1 - ramp(t, 0, 0.9)) * 24}px)`}} />
      </AbsoluteFill>
      {it.tag && (
        <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 30}}>
          <div style={{...smallCaps(22, '0.4em', 0.9), marginRight: '-0.4em', color: 'rgba(255,214,160,0.95)', padding: '12px 26px', borderRadius: 999, background: 'rgba(12,14,20,0.45)', backdropFilter: 'blur(18px)', boxShadow: '0 0 0 1px rgba(255,255,255,0.14)', ...reveal(t, 0.3, 0.8, 12, 8)}}>{it.tag}</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const Multi: React.FC<{it: FilmItem}> = ({it}) => {
  const t = useSec();
  const p = ramp(t, 0, it.dur, 0, 1, Easing.linear);
  const n = it.srcs!.length;
  const h = n >= 3 ? 790 : 900;
  return (
    <AbsoluteFill>
      <Blurred src={it.srcs![0]} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 44, transform: `scale(${1 + 0.035 * p})`}}>
        {it.srcs!.map((s, i) => {
          const e = ramp(t, 0.05 + i * 0.13, 0.85 + i * 0.13);
          return <Img key={i} src={staticFile(s)} style={{...card, height: h, width: h * 0.75, opacity: e, transform: `translateY(${(1 - e) * 70}px)`}} />;
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Clip: React.FC<{it: FilmItem}> = ({it}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={staticFile(it.src!)}
        style={{width: '100%', height: '100%'}}
        volume={(f) => {
          const t = f / fps;
          return (it.vol ?? 1) * Math.max(0, Math.min(1, t / X, (it.dur - t) / X));
        }}
      />
    </AbsoluteFill>
  );
};

const Item: React.FC<{it: FilmItem}> = ({it}) => {
  const t = useSec();
  const inn = ramp(t, 0, X, 0, 1, Easing.inOut(Easing.quad));
  return (
    <AbsoluteFill style={{opacity: inn}}>
      {it.kind === 'card' && <Card it={it} />}
      {it.kind === 'photo' && <Photo it={it} />}
      {it.kind === 'multi' && <Multi it={it} />}
      {it.kind === 'clip' && <Clip it={it} />}
    </AbsoluteFill>
  );
};

// ---------- end card ----------
const End: React.FC<{p: ChapterFilmProps}> = ({p}) => {
  const t = useSec();
  const inn = ramp(t, 0, 0.9);
  const out = ramp(t, p.endDur - 1.1, p.endDur);
  return (
    <AbsoluteFill style={{opacity: inn * (1 - out), backgroundColor: INK}}>
      <Glow warm={0.7} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <div style={{fontFamily: fonts.inter, fontWeight: 800, fontSize: 104, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#F6F7FA', textShadow: '0 0 40px rgba(255,220,170,0.3)', ...reveal(t, 0.3, 1.0, 30, 16)}}>{p.endLine1}</div>
        <div style={{fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 128, lineHeight: 1.2, padding: '0 24px', ...goldText, ...reveal(t, 0.9, 1.0, 30, 16)}}>
          <span style={{filter: 'drop-shadow(0 0 22px rgba(255,190,100,0.5))'}}>{p.endLine2}</span>
        </div>
        <div style={{fontFamily: slab, fontSize: 64, color: '#F4F6FA', marginTop: 64, opacity: 0.92, ...reveal(t, 1.6, 1.0, 20, 12)}}>{p.title}</div>
        <div style={{...smallCaps(26, '0.42em', 0.75), marginTop: 18, marginRight: '-0.42em', ...reveal(t, 1.9, 1.0)}}>
          {p.school} · {p.city}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const musicVol = (t: number, p: ChapterFilmProps) => {
  const base = t < p.hookAt + HOOK_LEN ? 0.55 : 0.42;
  let duck = 1;
  for (const [a, b] of p.duck) {
    const d = ramp(t, a - 0.5, a + 0.2, 0, 1, Easing.linear) * (1 - ramp(t, b - 0.2, b + 0.5, 0, 1, Easing.linear));
    duck = Math.min(duck, 1 - 0.78 * d);
  }
  const fade = ramp(t, 0, 2, 0, 1, Easing.linear) * (1 - ramp(t, p.total - 3.2, p.total, 0, 1, Easing.linear));
  return base * duck * fade;
};

const HookIn: React.FC<{p: ChapterFilmProps}> = ({p}) => {
  const t = useSec();
  return (
    <AbsoluteFill style={{opacity: ramp(t, 0, 0.5)}}>
      <Hook p={{...p, bodyDur: 0, chapters: []}} />
    </AbsoluteFill>
  );
};

export const ChapterFilm: React.FC<ChapterFilmProps> = (p) => {
  const {fps} = useVideoConfig();
  const F = (s: number) => Math.round(s * fps);
  return (
    <AbsoluteFill style={{backgroundColor: INK}}>
      {p.items.map((it, i) => (
        <Sequence key={i} from={F(it.start)} durationInFrames={F(it.dur)}>
          <Item it={it} />
        </Sequence>
      ))}
      <Sequence from={F(p.endStart)} durationInFrames={F(p.endDur)}>
        <End p={p} />
      </Sequence>
      <Speech lines={p.speech} />
      <Sequence durationInFrames={F(p.quoteDur)}>
        <Quote p={p} />
      </Sequence>
      <Sequence from={F(p.hookAt)} durationInFrames={F(HOOK_LEN)}>
        <HookIn p={p} />
      </Sequence>
      {p.music && <Audio src={staticFile(p.music)} volume={(f) => musicVol(f / fps, p)} />}
      {p.sfx?.map((s, i) => (
        <Sequence key={i} from={F(s.at)}>
          <Audio src={staticFile(s.src)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
