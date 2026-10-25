import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts, GOLD_TEXT} from './Captions';
import type {Graphic, GraphicItem} from './types';

// Full-screen motion-graphic cards on a dark backdrop. Rendered inside a <Sequence>,
// so frame 0 = graphic start. Item `at` times are ABSOLUTE timeline seconds.

const GOLD = '#F4D27A';
const GREY = 'rgba(255,255,255,0.55)';

const useT = (g: Graphic) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  return {frame, fps, dur: durationInFrames, t: g.start + frame / fps};
};

// spring that starts at absolute time `at`
const usePop = (g: Graphic, at: number | undefined, cfg = {damping: 13, stiffness: 190}) => {
  const {frame, fps} = useT(g);
  const f0 = Math.round(((at ?? g.start) - g.start) * fps) - 2;
  return spring({frame: frame - f0, fps, config: cfg});
};

const Backdrop: React.FC<{g: Graphic; children: React.ReactNode}> = ({g, children}) => {
  const {frame, dur} = useT(g);
  const inn = interpolate(frame, [0, 6], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const out = interpolate(frame, [dur - 5, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const glow = 0.18 + 0.06 * Math.sin(frame / 14);
  return (
    <AbsoluteFill style={{opacity: inn * out}}>
      <AbsoluteFill style={{backgroundColor: '#050607'}} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 45%, rgba(244,210,122,${glow}) 0%, rgba(20,24,28,1) 38%, #050607 100%)`,
        }}
      />
      {/* fine grid for texture */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />
      <AbsoluteFill style={{transform: `scale(${1.06 - 0.06 * inn})`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const label = (u: number, color = GREY): React.CSSProperties => ({
  fontFamily: fonts.inter,
  fontWeight: 600,
  fontSize: 38 * u,
  letterSpacing: '0.22em',
  color,
  textTransform: 'uppercase',
});

const value = (u: number, size = 150): React.CSSProperties => ({
  fontFamily: fonts.inter,
  fontWeight: 900,
  fontSize: size * u,
  letterSpacing: '-0.05em',
  lineHeight: 1,
  color: 'white',
  textShadow: '0 6px 30px rgba(0,0,0,0.6)',
});

const PopIn: React.FC<{g: Graphic; at?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  g,
  at,
  children,
  style,
}) => {
  const s = usePop(g, at);
  return (
    <div
      style={{
        ...style,
        opacity: Math.min(1, s * 1.5),
        transform: `${style?.transform ?? ''} scale(${0.7 + 0.3 * s}) translateY(${(1 - s) * 30}px)`,
        filter: `blur(${(1 - Math.min(1, s)) * 10}px)`,
      }}
    >
      {children}
    </div>
  );
};

// ---------- mirror: "YOUR FRIENDS: LAZY  =  YOU: LAZY"
const Mirror: React.FC<{g: Graphic; u: number}> = ({g, u}) => {
  const [a, b] = g.items ?? [];
  const eq = usePop(g, b?.at);
  const card = (it: GraphicItem, gold: boolean) => (
    <PopIn g={g} at={it.at} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 * u, width: 720 * u}}>
      <div style={label(u, gold ? GOLD : GREY)}>{it.label}</div>
      <div style={{...value(u, it.size ?? 150), ...(gold ? GOLD_TEXT : {})}}>{it.value}</div>
    </PopIn>
  );
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      {g.title && (
        <PopIn g={g} style={{position: 'absolute', top: '17%', ...label(u, 'white'), fontSize: 44 * u}}>
          {g.title}
        </PopIn>
      )}
      <div style={{display: 'flex', alignItems: 'center', gap: 20 * u}}>
        {a && card(a, false)}
        <div style={{...value(u, 130), color: GOLD, opacity: eq, transform: `scale(${0.5 + 0.5 * eq})`}}>=</div>
        {b && card(b, true)}
      </div>
    </AbsoluteFill>
  );
};

// ---------- circle: YOU in the middle, people connect around it
const Circle: React.FC<{g: Graphic; u: number}> = ({g, u}) => {
  const {frame, fps, width, height} = {...useT(g), ...useVideoConfig()};
  const n = g.count ?? 6;
  const cx = width / 2;
  const cy = height * 0.43;
  const R = 300 * u;
  const rot = frame * 0.25; // slow orbit
  const core = usePop(g, g.start);
  const titleS = usePop(g, g.titleAt ?? g.start + 1.2);
  const pulse = 1 + 0.04 * Math.sin(frame / 6);
  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{position: 'absolute'}}>
        {Array.from({length: n}).map((_, i) => {
          const ang = ((i / n) * 360 + rot - 90) * (Math.PI / 180);
          const x = cx + R * Math.cos(ang);
          const y = cy + R * Math.sin(ang);
          const f0 = Math.round(0.25 * fps + i * 0.16 * fps);
          const s = spring({frame: frame - f0, fps, config: {damping: 12, stiffness: 200}});
          const line = interpolate(frame - f0, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const lx = cx + (x - cx) * line;
          const ly = cy + (y - cy) * line;
          const r = 52 * u * s;
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={lx} y2={ly} stroke={GOLD} strokeOpacity={0.55} strokeWidth={3 * u} />
              <circle cx={x} cy={y} r={r} fill="#14181c" stroke="white" strokeOpacity={0.85} strokeWidth={3 * u} />
              {/* person glyph */}
              <circle cx={x} cy={y - 12 * u * s} r={13 * u * s} fill="white" />
              <path
                d={`M ${x - 24 * u * s} ${y + 26 * u * s} Q ${x} ${y - 6 * u * s} ${x + 24 * u * s} ${y + 26 * u * s} Z`}
                fill="white"
              />
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={120 * u * core * pulse} fill="rgba(244,210,122,0.12)" />
        <circle cx={cx} cy={cy} r={95 * u * core} fill="#0d1013" stroke={GOLD} strokeWidth={5 * u} style={{filter: 'drop-shadow(0 0 18px rgba(255,196,80,0.7))'}} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: cy,
          transform: `translateY(-50%) scale(${core})`,
          textAlign: 'center',
          ...value(u, 64),
          ...GOLD_TEXT,
        }}
      >
        YOU
      </div>
      {g.title && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: height * 0.86,
            transform: `translateY(-50%) scale(${0.7 + 0.3 * titleS})`,
            opacity: Math.min(1, titleS * 1.5),
            textAlign: 'center',
            ...value(u, 120),
            ...GOLD_TEXT,
          }}
        >
          {g.title}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- split: two choices, the second dims at resolveAt
const Split: React.FC<{g: Graphic; u: number}> = ({g, u}) => {
  const {t} = useT(g);
  const items = g.items ?? [];
  const resolve = interpolate(t, [g.resolveAt ?? g.end + 1, (g.resolveAt ?? g.end + 1) + 0.3], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const orS = usePop(g, items[1]?.at);
  const panel = (it: GraphicItem, i: number) => {
    const winner = !it.dim;
    const dim = it.dim ? 1 - 0.65 * resolve : 1;
    const grow = winner ? 1 + 0.05 * resolve : 1 - 0.04 * resolve;
    return (
      <PopIn g={g} at={it.at} key={i}>
        <div
          style={{
            width: 760 * u,
            height: 470 * u,
            borderRadius: 32 * u,
            border: `${3 * u}px solid ${winner ? GOLD : 'rgba(255,255,255,0.25)'}`,
            background: winner ? 'rgba(244,210,122,0.07)' : 'rgba(255,255,255,0.03)',
            boxShadow: winner ? `0 0 ${60 * u * (0.4 + resolve)}px rgba(255,196,80,${0.25 + 0.35 * resolve})` : 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14 * u,
            opacity: dim,
            transform: `scale(${grow})`,
          }}
        >
          <div style={label(u, winner ? GOLD : GREY)}>{it.label}</div>
          <div style={{...value(u, it.size ?? 140), ...(winner ? GOLD_TEXT : {color: 'rgba(255,255,255,0.85)'})}}>
            {it.value}
          </div>
        </div>
      </PopIn>
    );
  };
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 44 * u}}>
        {items[0] && panel(items[0], 0)}
        <div style={{fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 96 * u, color: 'white', opacity: orS, transform: `scale(${0.5 + 0.5 * orS})`}}>
          or
        </div>
        {items[1] && panel(items[1], 1)}
      </div>
    </AbsoluteFill>
  );
};

// ---------- timeline: a line from the first marker to the second, with a tree and a sprout
const Timeline: React.FC<{g: Graphic; u: number}> = ({g, u}) => {
  const {t, frame} = useT(g);
  const {width, height} = useVideoConfig();
  const [a, b] = g.items ?? [];
  const x0 = width * 0.2;
  const x1 = width * 0.8;
  const y = height * 0.6;
  const draw = interpolate(t, [a?.at ?? g.start, (b?.at ?? g.end) - 0.1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const sa = usePop(g, a?.at);
  const sb = usePop(g, b?.at);
  const sbLabel = usePop(g, b?.labelAt ?? b?.at);
  const pastDim = 1 - 0.5 * Math.min(1, sb);
  const pulse = 1 + 0.08 * Math.sin(frame / 5);
  // little tree (crown + trunk) above the past marker, sprout above the NOW marker
  const tree = (x: number, s: number) => (
    <g opacity={s * pastDim} transform={`translate(${x} ${y - 70 * u}) scale(${s})`}>
      <rect x={-7 * u} y={-10 * u} width={14 * u} height={50 * u} rx={4 * u} fill="#8a6a43" />
      <circle cx={0} cy={-55 * u} r={52 * u} fill="#3f7d4f" />
      <circle cx={-34 * u} cy={-30 * u} r={32 * u} fill="#4b9160" />
      <circle cx={34 * u} cy={-30 * u} r={32 * u} fill="#4b9160" />
    </g>
  );
  const sprout = (x: number, s: number) => (
    <g opacity={s} transform={`translate(${x} ${y - 30 * u}) scale(${s})`}>
      <path d={`M 0 ${10 * u} L 0 ${-40 * u}`} stroke="#7fd08f" strokeWidth={6 * u} strokeLinecap="round" />
      <path d={`M 0 ${-30 * u} Q ${-40 * u} ${-60 * u} ${-48 * u} ${-28 * u} Q ${-20 * u} ${-18 * u} 0 ${-30 * u}`} fill="#7fd08f" />
      <path d={`M 0 ${-38 * u} Q ${40 * u} ${-72 * u} ${50 * u} ${-40 * u} Q ${22 * u} ${-26 * u} 0 ${-38 * u}`} fill="#9be3a9" />
    </g>
  );
  return (
    <AbsoluteFill>
      {g.title && (
        <PopIn g={g} style={{position: 'absolute', left: 0, right: 0, top: height * 0.13, textAlign: 'center', ...value(u, 84)}}>
          {g.title}
        </PopIn>
      )}
      <svg width={width} height={height} style={{position: 'absolute'}}>
        <line x1={x0} y1={y} x2={x1} y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth={6 * u} strokeLinecap="round" />
        <line x1={x0} y1={y} x2={x0 + (x1 - x0) * draw} y2={y} stroke={GOLD} strokeWidth={6 * u} strokeLinecap="round" />
        {tree(x0, sa)}
        {sprout(x1, sb)}
        <circle cx={x0} cy={y} r={16 * u * sa} fill="white" opacity={pastDim} />
        <circle cx={x1} cy={y} r={30 * u * sb * pulse} fill="rgba(244,210,122,0.25)" />
        <circle cx={x1} cy={y} r={18 * u * Math.max(sb, sbLabel * 0.6)} fill={GOLD} />
      </svg>
      {a && (
        <div style={{position: 'absolute', left: x0, top: y + 50 * u, transform: `translateX(-50%) scale(${sa})`, opacity: Math.min(1, sa * 1.5) * pastDim, textAlign: 'center', whiteSpace: 'nowrap'}}>
          <div style={label(u)}>{a.label}</div>
          <div style={{...value(u, a.size ?? 80), marginTop: 10 * u}}>{a.value}</div>
        </div>
      )}
      {b && (
        <div style={{position: 'absolute', left: x1, top: y + 50 * u, transform: 'translateX(-50%)', textAlign: 'center', whiteSpace: 'nowrap'}}>
          <div style={{...label(u, GOLD), opacity: Math.min(1, sbLabel * 1.5)}}>{b.label}</div>
          <div style={{...value(u, b.size ?? 130), ...GOLD_TEXT, marginTop: 6 * u, opacity: Math.min(1, sb * 1.5), transform: `scale(${0.6 + 0.4 * sb})`}}>
            {b.value}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const GraphicView: React.FC<{g: Graphic}> = ({g}) => {
  const {width, height} = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const body =
    g.type === 'mirror' ? <Mirror g={g} u={u} /> : g.type === 'circle' ? <Circle g={g} u={u} /> : g.type === 'split' ? <Split g={g} u={u} /> : <Timeline g={g} u={u} />;
  return <Backdrop g={g}>{body}</Backdrop>;
};
