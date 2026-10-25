import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {fonts} from './Captions';
import {loadFont as loadSlab} from '@remotion/google-fonts/AlfaSlabOne';

export const {fontFamily: slab} = loadSlab();

// Event film: 10 s Apple-style motion-graphic hook -> assembled performances (body.mp4) -> end card.
// Everything visual comes from the event's own photos/clips (jobs/<slug>/photos, body.mp4).

export type Chapter = {start: number; end: number; label: string; title: string};
export type SpeechChunk = {start: number; end: number; text: string; gold?: number[]};
export type SpeechLine = {
  start: number;
  end: number;
  role: string;
  mode: 'above' | 'beside' | 'below' | 'free';
  side: 'l' | 'r';
  keys: [number, number, number][]; // [bodyTime, x, y] speaker face (0-1)
  maxW: number;
  chunks: SpeechChunk[];
};
export type CenterTitle = {start: number; end: number; line1: string; line2: string};
export type EventFilmProps = {
  job: string; // e.g. "jobs/kathakaar"
  bodyDur: number; // seconds
  school: string;
  city: string;
  title: string;
  objective: string; // "To develop"
  objectiveWord: string; // "Empathy"
  chapters: Chapter[]; // times on the BODY timeline
  speech?: SpeechLine[]; // body timeline
  centerTitle?: CenterTitle; // body timeline
  pad?: string; // hook music bed
  sfx?: {src: string; at: number; volume: number}[]; // absolute times
};

export const TITLE_SHIFT = 2.6; // photo carousel removed -> title comes in 2.6 s earlier
export const HOOK = 10 - TITLE_SHIFT; // seconds
export const OVERLAP = 0.6; // body fades in under the end of the hook
export const OUTRO = 6.5;

export const ease = Easing.bezier(0.22, 1, 0.36, 1); // Apple-ish ease-out
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const INK = '#04060A';

export const useSec = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps;
};

export const ramp = (t: number, a: number, b: number, from = 0, to = 1, e = ease) =>
  interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

// blur -> sharp, rise, fade. Returns style for an element revealed at `at`.
export const reveal = (t: number, at: number, dur = 0.9, rise = 26, blur = 14): React.CSSProperties => {
  const p = ramp(t, at, at + dur);
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * rise}px)`,
    filter: `blur(${(1 - p) * blur}px)`,
  };
};

// ---------- background: deep ink with two slow glowing orbs ----------
export const Glow: React.FC<{intensity?: number; warm?: number}> = ({intensity = 1, warm = 0.5}) => {
  const t = useSec();
  const ax = 50 + 14 * Math.sin(t * 0.45);
  const ay = 46 + 8 * Math.cos(t * 0.38);
  const bx = 50 - 18 * Math.sin(t * 0.33 + 1.2);
  const by = 56 + 10 * Math.sin(t * 0.41 + 0.4);
  return (
    <AbsoluteFill style={{backgroundColor: INK}}>
      <AbsoluteFill
        style={{
          opacity: intensity,
          background: [
            `radial-gradient(38% 46% at ${ax}% ${ay}%, rgba(255,186,104,${0.30 * warm + 0.06}) 0%, rgba(255,186,104,0) 70%)`,
            `radial-gradient(42% 50% at ${bx}% ${by}%, rgba(86,132,255,${0.26 * (1 - warm) + 0.08}) 0%, rgba(86,132,255,0) 72%)`,
            `radial-gradient(60% 60% at 50% 50%, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0) 70%)`,
          ].join(','),
        }}
      />
      {/* vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)'}} />
    </AbsoluteFill>
  );
};

export const smallCaps = (size: number, spacing = '0.34em', alpha = 0.78): React.CSSProperties => ({
  fontFamily: fonts.inter,
  fontWeight: 600,
  fontSize: size,
  letterSpacing: spacing,
  color: `rgba(235,240,250,${alpha})`,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
});

// ---------- Scene A: school name on a glowing hairline (0 – 2.7 s) ----------
const SceneSchool: React.FC<{p: EventFilmProps}> = ({p}) => {
  const t = useSec();
  const line = ramp(t, 0.35, 1.45, 0, 1, easeInOut);
  const out = ramp(t, 2.25, 2.75);
  const track = 0.5 - 0.16 * ramp(t, 0.6, 2.4, 0, 1, Easing.out(Easing.quad)); // letters slowly settle
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1 - out,
        filter: `blur(${out * 16}px)`,
        transform: `scale(${1 + out * 0.06})`,
      }}
    >
      <div style={{...smallCaps(60, `${track}em`, 0.94), ...reveal(t, 0.6, 1.0), marginBottom: 34, marginRight: `-${track}em`}}>
        {p.school}
      </div>
      <div
        style={{
          width: 980 * line,
          height: 2,
          borderRadius: 2,
          background: 'linear-gradient(90deg, rgba(255,214,150,0) 0%, rgba(255,226,180,1) 50%, rgba(255,214,150,0) 100%)',
          boxShadow: '0 0 18px 2px rgba(255,200,120,0.75), 0 0 60px 8px rgba(255,170,80,0.35)',
        }}
      />
      <div style={{...smallCaps(36, '0.6em', 0.66), ...reveal(t, 1.05, 1.0), marginTop: 34, marginRight: '-0.6em'}}>{p.city}</div>
    </AbsoluteFill>
  );
};

// ---------- Scene C + D: title, then objective (5.3 – 10 s) ----------
const SceneTitle: React.FC<{p: EventFilmProps}> = ({p}) => {
  const t = useSec() + TITLE_SHIFT; // authored on the original 10 s timeline
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame() + Math.round(TITLE_SHIFT * fps);
  const letters = p.title.split('');
  const lift = ramp(t, 7.75, 8.6, 0, 1, easeInOut); // title moves up & shrinks to make room
  const sheen = ramp(t, 6.2, 7.4, -40, 140, Easing.inOut(Easing.quad));
  const end = ramp(t, 9.35, 10.0, 0, 1, Easing.in(Easing.cubic)); // zoom-through into the footage
  const objP = spring({frame: frame - Math.round(8.45 * fps), fps, config: {damping: 200, stiffness: 70}});
  const halo = ramp(t, 5.4, 6.6) * (1 - 0.4 * lift);
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1 - end,
        filter: `blur(${end * 20}px)`,
        transform: `scale(${1 + end * 0.18})`,
      }}
    >
      {/* soft halo behind the word */}
      <div
        style={{
          position: 'absolute',
          width: 1300,
          height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(255,214,160,0.28), rgba(255,214,160,0))',
          opacity: halo,
          transform: `translateY(${-150 * lift}px) scale(${1 - 0.3 * lift})`,
        }}
      />
      <div style={{transform: `translateY(${-150 * lift}px) scale(${1 - 0.36 * lift})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{position: 'relative', display: 'flex'}}>
          {letters.map((ch, i) => {
            const at = 5.45 + i * 0.06;
            const s = spring({frame: frame - Math.round(at * fps), fps, config: {damping: 200, stiffness: 80}});
            return (
              <span
                key={i}
                style={{
                  fontFamily: slab,
                  fontWeight: 400,
                  fontSize: 210,
                  letterSpacing: '0.005em',
                  lineHeight: 1,
                  color: '#F4F6FA',
                  display: 'inline-block',
                  opacity: s,
                  filter: `blur(${(1 - s) * 18}px)`,
                  transform: `translateY(${(1 - s) * 50}px)`,
                  textShadow: '0 0 40px rgba(255,220,170,0.35), 0 0 120px rgba(255,190,110,0.25)',
                }}
              >
                {ch}
              </span>
            );
          })}
          {/* light sweep across the word */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              fontFamily: slab,
              fontWeight: 400,
              fontSize: 210,
              letterSpacing: '0.005em',
              lineHeight: 1,
              backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) ${sheen - 18}%, rgba(255,236,200,0.95) ${sheen}%, rgba(255,255,255,0) ${sheen + 18}%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              opacity: ramp(t, 6.1, 6.3) * (1 - ramp(t, 7.3, 7.5)),
            }}
          >
            {p.title}
          </div>
        </div>
        <div style={{...smallCaps(40, '0.75em', 0.7), ...reveal(t, 6.35, 1.0), marginTop: 36, marginRight: '-0.75em'}}>Activity</div>
      </div>
      {/* objective */}
      <div
        style={{
          position: 'absolute',
          top: 600,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: objP,
          filter: `blur(${(1 - objP) * 16}px)`,
          transform: `translateY(${(1 - objP) * 40}px)`,
        }}
      >
        <div style={{...smallCaps(30, '0.42em', 0.72), marginRight: '-0.42em'}}>Objective · {p.objective}</div>
        <div
          style={{
            fontFamily: fonts.serif,
            fontStyle: 'italic',
            fontSize: 190,
            lineHeight: 1.1,
            marginTop: 10,
            backgroundImage: 'linear-gradient(180deg, #FFF6E0 0%, #FFD89A 55%, #E8A855 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 0 26px rgba(255,190,100,0.55))',
            padding: '0 30px',
          }}
        >
          {p.objectiveWord}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Hook: React.FC<{p: EventFilmProps}> = ({p}) => {
  const t = useSec();
  const warm = ramp(t, 1.9, 5.9, 0.35, 0.85);
  const inn = ramp(t, 0, 1.3);
  const handoff = ramp(t, HOOK - 0.55, HOOK, 0, 1, easeInOut); // dissolve into the footage
  return (
    <AbsoluteFill style={{backgroundColor: INK, opacity: 1 - handoff}}>
      <AbsoluteFill style={{opacity: inn}}>
        <Glow warm={warm} />
      </AbsoluteFill>
      {t < 2.9 && <SceneSchool p={p} />}
      {t > 2.7 && <SceneTitle p={p} />}
    </AbsoluteFill>
  );
};

// ---------- body overlays ----------
const ChapterTag: React.FC<{c: Chapter}> = ({c}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const d = durationInFrames / fps;
  const inn = ramp(t, 0, 0.8);
  const out = ramp(t, d - 0.6, d);
  const v = inn * (1 - out);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', padding: '0 0 84px 96px'}}>
      <div
        style={{
          alignSelf: 'flex-start',
          opacity: v,
          filter: `blur(${(1 - v) * 10}px)`,
          transform: `translateY(${(1 - inn) * 24}px)`,
          padding: '22px 34px 24px',
          borderRadius: 26,
          background: 'rgba(12,14,20,0.42)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.14), 0 20px 60px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{...smallCaps(22, '0.36em', 0.7), color: 'rgba(255,214,160,0.9)'}}>{c.label}</div>
        <div style={{fontFamily: fonts.inter, fontWeight: 800, fontSize: 46, letterSpacing: '-0.02em', color: 'white', marginTop: 8}}>
          {c.title}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- speech bubbles: glass caption beside whoever is talking ----------
const FW = 1920;
const FH = 1080;
const FONT = 52;

const keyAt = (keys: [number, number, number][], t: number): [number, number] => {
  if (keys.length === 1 || t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, x0, y0] = keys[i - 1];
      const [t1, x1, y1] = keys[i];
      const k = Easing.inOut(Easing.quad)((t - t0) / (t1 - t0));
      return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
    }
  }
  const last = keys[keys.length - 1];
  return [last[1], last[2]];
};

const ChunkText: React.FC<{c: SpeechChunk; t: number}> = ({c, t}) => {
  const p = ramp(t, c.start, c.start + 0.28);
  const words = c.text.split(' ');
  return (
    <div style={{opacity: p, filter: `blur(${(1 - p) * 8}px)`, transform: `translateY(${(1 - p) * 10}px)`}}>
      {words.map((w, i) => (
        <span
          key={i}
          style={
            c.gold?.includes(i)
              ? {
                  backgroundImage: 'linear-gradient(180deg, #FFF3D6 0%, #FFD58A 60%, #F0B35A 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }
              : undefined
          }
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </div>
  );
};

const Bubble: React.FC<{l: SpeechLine; t: number}> = ({l, t}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const inn = spring({frame: frame - Math.round(l.start * fps), fps, config: {damping: 18, stiffness: 170, mass: 0.7}});
  const out = ramp(t, l.end - 0.25, l.end);
  const v = Math.min(1, inn) * (1 - out);
  const chunk = [...l.chunks].reverse().find((c) => t >= c.start) ?? l.chunks[0];
  const [fx, fy] = keyAt(l.keys, t);
  const X = fx * FW;
  const Y = fy * FH;
  const r = l.side === 'r';
  const maxW = l.maxW * FW;
  const box: React.CSSProperties = {position: 'absolute'};
  let origin = r ? 'left bottom' : 'right bottom';
  let tail: React.CSSProperties | null = null;
  const TAIL = 16;
  if (l.mode === 'free') {
    box.left = X - maxW / 2;
    box.width = maxW;
    box.top = Y * 1 - 60;
    origin = 'center';
  } else {
    // horizontal: near edge hugs the speaker, bubble opens to `side`
    const gap = l.mode === 'beside' ? 0.055 * FW : l.mode === 'above' ? -0.02 * FW : 0.035 * FW;
    let near = r ? X + gap : X - gap;
    near = r ? Math.min(near, FW - 40 - 300) : Math.max(near, 40 + 300);
    if (r) {
      box.left = Math.max(40, near);
      box.maxWidth = Math.min(maxW, FW - 40 - (box.left as number));
    } else {
      box.right = Math.max(40, FW - near);
      box.maxWidth = Math.min(maxW, FW - 40 - (box.right as number));
    }
    // vertical
    if (l.mode === 'above') {
      box.bottom = FH - Math.max(250, Y - 0.085 * FH);
      tail = {bottom: -TAIL + 1, [r ? 'left' : 'right']: 34, borderTop: `${TAIL}px solid rgba(16,18,26,0.66)`, borderLeft: `${TAIL * 0.7}px solid transparent`, borderRight: `${TAIL * 0.7}px solid transparent`};
    } else if (l.mode === 'beside') {
      box.bottom = FH - Math.max(250, Y + 0.05 * FH);
      tail = {bottom: 26, [r ? 'left' : 'right']: -TAIL + 1, [r ? 'borderRight' : 'borderLeft']: `${TAIL}px solid rgba(16,18,26,0.66)`, borderTop: `${TAIL * 0.7}px solid transparent`, borderBottom: `${TAIL * 0.7}px solid transparent`};
    } else {
      box.top = Math.min(FH - 300, Y + 0.13 * FH);
      origin = r ? 'left top' : 'right top';
      tail = {top: -TAIL + 1, [r ? 'left' : 'right']: 34, borderBottom: `${TAIL}px solid rgba(16,18,26,0.66)`, borderLeft: `${TAIL * 0.7}px solid transparent`, borderRight: `${TAIL * 0.7}px solid transparent`};
    }
  }
  return (
    <div
      style={{
        ...box,
        opacity: v,
        transform: `scale(${0.86 + 0.14 * v})`,
        transformOrigin: origin,
        filter: `blur(${(1 - v) * 6}px)`,
      }}
    >
      <div
        style={{
          position: 'relative',
          padding: '18px 28px 22px',
          borderRadius: 30,
          background: 'rgba(16,18,26,0.66)',
          backdropFilter: 'blur(22px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.5)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.16), 0 24px 60px rgba(0,0,0,0.35), 0 0 40px rgba(255,200,130,0.10)',
          textAlign: l.mode === 'free' ? 'center' : 'left',
        }}
      >
        <div style={{...smallCaps(19, '0.34em', 0.9), color: 'rgba(255,214,160,0.95)', marginBottom: 6}}>{l.role}</div>
        <div style={{fontFamily: fonts.inter, fontWeight: 800, fontSize: FONT, lineHeight: 1.12, letterSpacing: '-0.015em', color: '#FFFFFF'}}>
          <ChunkText key={chunk.start} c={chunk} t={t} />
        </div>
        {tail && <div style={{position: 'absolute', width: 0, height: 0, ...tail}} />}
      </div>
    </div>
  );
};

export const Speech: React.FC<{lines: SpeechLine[]}> = ({lines}) => {
  const t = useSec();
  return (
    <AbsoluteFill>
      {lines.filter((l) => t >= l.start && t <= l.end).map((l, i) => (
        <Bubble key={`${l.start}-${i}`} l={l} t={t} />
      ))}
    </AbsoluteFill>
  );
};

// ---------- centred statement over the opening footage ----------
const CenterCard: React.FC<{c: CenterTitle}> = ({c}) => {
  const t = useSec();
  const out = ramp(t, c.end - 0.6, c.end, 0, 1, Easing.in(Easing.cubic));
  const scrim = ramp(t, c.start - 0.2, c.start + 0.6) * (1 - out);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 48% at 50% 50%, rgba(4,6,10,0.72) 0%, rgba(4,6,10,0.35) 55%, rgba(4,6,10,0) 100%)', opacity: scrim}} />
      <div style={{textAlign: 'center', opacity: 1 - out, filter: `blur(${out * 14}px)`, transform: `scale(${1 + out * 0.04})`}}>
        <div style={{fontFamily: fonts.inter, fontWeight: 800, fontSize: 110, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#F6F7FA', textShadow: '0 0 40px rgba(255,220,170,0.35), 0 6px 30px rgba(0,0,0,0.5)', ...reveal(t, c.start, 1.0, 30, 16)}}>
          {c.line1}
        </div>
        <div
          style={{
            fontFamily: fonts.serif,
            fontStyle: 'italic',
            fontSize: 132,
            lineHeight: 1.15,
            padding: '0 24px',
            backgroundImage: 'linear-gradient(180deg, #FFF6E0 0%, #FFD89A 55%, #E8A855 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            ...reveal(t, c.start + 0.7, 1.0, 30, 16),
          }}
        >
          <span style={{filter: 'drop-shadow(0 0 22px rgba(255,190,100,0.55))'}}>{c.line2}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// CenterCard uses body-absolute times; inside a Sequence we shift the clock back.
const CenterCardAbs: React.FC<{c: CenterTitle; offset: number}> = ({c, offset}) => (
  <CenterCard c={{...c, start: c.start - offset, end: c.end - offset}} />
);

const Body: React.FC<{p: EventFilmProps}> = ({p}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const inn = ramp(t, 0, OVERLAP + 0.2);
  return (
    <AbsoluteFill style={{opacity: inn, transform: `scale(${1.06 - 0.06 * inn})`}}>
      <OffthreadVideo src={staticFile(`${p.job}/body.mp4`)} style={{width: '100%', height: '100%'}} />
      {p.speech && <Speech lines={p.speech} />}
      {p.centerTitle && (
        <Sequence from={Math.round((p.centerTitle.start - 0.3) * fps)} durationInFrames={Math.round((p.centerTitle.end - p.centerTitle.start + 0.4) * fps)}>
          <AbsoluteFill style={{}}>
            <CenterCardAbs c={p.centerTitle} offset={p.centerTitle.start - 0.3} />
          </AbsoluteFill>
        </Sequence>
      )}
      {p.chapters.map((c, i) => (
        <Sequence key={i} from={Math.round(c.start * fps)} durationInFrames={Math.round((c.end - c.start) * fps)}>
          <ChapterTag c={c} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const Outro: React.FC<{p: EventFilmProps}> = ({p}) => {
  const t = useSec();
  const inn = ramp(t, 0, 0.8);
  const out = ramp(t, OUTRO - 0.9, OUTRO);
  return (
    <AbsoluteFill style={{opacity: inn * (1 - out)}}>
      <Glow warm={0.7} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: slab, fontWeight: 400, fontSize: 140, letterSpacing: '0.005em', color: '#F4F6FA', textShadow: '0 0 60px rgba(255,200,130,0.35)', ...reveal(t, 0.2, 1.0, 30, 16)}}>
          {p.title}
        </div>
        <div style={{...smallCaps(30, '0.42em', 0.8), ...reveal(t, 0.6, 1.0), marginTop: 28, marginRight: '-0.42em'}}>
          {p.school} · {p.city}
        </div>
        <div
          style={{
            fontFamily: fonts.serif,
            fontStyle: 'italic',
            fontSize: 58,
            lineHeight: 1.25,
            maxWidth: 1300,
            textAlign: 'center',
            marginTop: 70,
            backgroundImage: 'linear-gradient(180deg, #FFF6E0 0%, #FFD89A 55%, #E8A855 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            ...reveal(t, 1.3, 1.2, 24, 14),
          }}
        >
          “A little empathy can turn a moment of loneliness into a moment of belonging.”
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const EventFilm: React.FC<EventFilmProps> = (p) => {
  const {fps} = useVideoConfig();
  const bodyFrom = Math.round((HOOK - OVERLAP) * fps);
  const bodyLen = Math.round(p.bodyDur * fps);
  return (
    <AbsoluteFill style={{backgroundColor: INK}}>
      <Sequence from={bodyFrom} durationInFrames={bodyLen}>
        <Body p={p} />
      </Sequence>
      <Sequence durationInFrames={Math.round(HOOK * fps)}>
        <Hook p={p} />
      </Sequence>
      <Sequence from={bodyFrom + bodyLen - Math.round(0.4 * fps)}>
        <Outro p={p} />
      </Sequence>
      {p.pad && (
        <Sequence durationInFrames={Math.round((HOOK + 0.5) * fps)}>
          <Audio src={staticFile(p.pad)} volume={(f) => interpolate(f / fps, [0, 1.5, HOOK - 1.2, HOOK + 0.4], [0, 0.55, 0.55, 0], {extrapolateRight: 'clamp'})} />
        </Sequence>
      )}
      {p.sfx?.map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * fps)}>
          <Audio src={staticFile(s.src)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const eventFilmDuration = (p: EventFilmProps) => HOOK - OVERLAP + p.bodyDur - 0.4 + OUTRO;
