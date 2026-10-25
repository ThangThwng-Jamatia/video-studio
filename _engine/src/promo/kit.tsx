// Shared primitives for the Minor Builds promo. Tokens mirror HabitTracker theme/colors.ts (light theme).
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

export const FPS = 60;
export const s2f = (s: number) => Math.round(s * FPS);

export const C = {
  bg: '#F8F9FB',
  bg2: '#F0F2F5',
  card: '#FFFFFF',
  text: '#1C1C1E',
  text2: '#8E8E93',
  text3: '#AEAEB2',
  coral: '#FF6B6B',
  coralDeep: '#FF5252',
  coralTint: '#FFE5E5',
  orange: '#FF825C',
  success: '#34D399',
  questGreen: '#34A853',
  border: 'rgba(0,0,0,0.04)',
  tabBorder: '#E0E0E0',
  incomplete: 'rgba(0,0,0,0.06)',
};

// HabitCard.tsx gradient map (accent -> soft pastel pair)
export const PASTEL: Record<string, [string, string]> = {
  '#4ECDC4': ['#A5D4FF', '#7FB8E8'],
  '#A78BFA': ['#C5B3F7', '#AB8FFA'],
  '#FF825C': ['#FFCBA4', '#FFB380'],
  '#FF6B6B': ['#FFA9A9', '#FF8E8E'],
};

// SF Pro on macOS Chrome (what the iOS app renders with), Inter as a fallback.
export const FONT = '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Helvetica Neue", Inter, sans-serif';
export const EMOJI = '"Apple Color Emoji", "Segoe UI Emoji", sans-serif';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const lerp = (f: number, i: number[], o: number[], ease?: (t: number) => number) =>
  interpolate(f, i, o, {...clamp, easing: ease});
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** Spring 0→1 starting at `at` frames (local). Glass skill: response ~0.3s, damping ~0.7. */
export const useSpr = (at: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - at, fps, config: {damping: 16, stiffness: 170, mass: 0.8, ...cfg}});
};

/** Soft liquid backdrop: white field with slow drifting pastel blobs. */
export const LiquidBG: React.FC<{tint?: number}> = ({tint = 1}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  // Radial-gradient blobs (no CSS filter: large blur filters drop tiles in headless Chrome).
  const blob = (x: number, y: number, size: number, color: string, ph: number, sp = 0.35) => {
    const big = size * 1.7;
    return (
      <div
        style={{
          position: 'absolute',
          left: x + Math.sin(t * sp + ph) * 90 - big / 2,
          top: y + Math.cos(t * sp * 0.8 + ph) * 110 - big / 2,
          width: big,
          height: big,
          background: `radial-gradient(circle at 50% 50%, ${color} 0%, ${color.replace(/[\d.]+\)$/, (m) => `${parseFloat(m) * 0.45})`)} 32%, rgba(255,255,255,0) 62%)`,
          opacity: tint,
        }}
      />
    );
  };
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      {blob(180, 380, 760, 'rgba(255,107,107,0.22)', 0)}
      {blob(920, 760, 700, 'rgba(255,130,92,0.18)', 2)}
      {blob(260, 1450, 820, 'rgba(167,139,250,0.16)', 4)}
      {blob(900, 1700, 640, 'rgba(91,141,239,0.12)', 1)}
    </AbsoluteFill>
  );
};

/** Frosted liquid-glass panel. */
export const Glass: React.FC<{style?: React.CSSProperties; children?: React.ReactNode; radius?: number; strong?: boolean}> = ({
  style,
  children,
  radius = 44,
  strong,
}) => (
  <div
    style={{
      position: 'relative',
      borderRadius: radius,
      // Frosted look built from layers (no backdrop-filter: it drops frames in headless Chrome).
      background: strong
        ? 'linear-gradient(165deg, rgba(255,255,255,0.95), rgba(255,255,255,0.86))'
        : 'linear-gradient(165deg, rgba(255,255,255,0.90), rgba(255,255,255,0.70))',
      border: '1.5px solid rgba(255,255,255,0.9)',
      boxShadow:
        '0 30px 80px rgba(28,28,30,0.10), 0 6px 18px rgba(28,28,30,0.05), inset 0 1.5px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.03)',
      overflow: 'hidden',
      ...style,
    }}
  >
    {/* specular sheen */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: radius,
        background: 'linear-gradient(160deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 38%)',
        pointerEvents: 'none',
      }}
    />
    <div style={{position: 'relative'}}>{children}</div>
  </div>
);

export type Word = {t: number; text: string; accent?: boolean; br?: boolean; fade?: boolean};

/**
 * Fast kinetic captions. Each word springs up out of a blur at its own time (seconds, scene-local).
 * `out` (seconds) blurs the whole block away.
 */
export const Kinetic: React.FC<{
  words: Word[];
  size?: number;
  top?: number;
  out?: number;
  align?: 'center' | 'left';
  color?: string;
  weight?: number;
  lineHeight?: number;
}> = ({words, size = 120, top = 300, out, align = 'center', color = C.text, weight = 800, lineHeight = 1.02}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const outP = out === undefined ? 0 : lerp(frame, [s2f(out), s2f(out) + 9], [0, 1], easeInOut);
  const lines: Word[][] = [[]];
  words.forEach((w) => {
    if (w.br && lines[lines.length - 1].length) lines.push([]);
    lines[lines.length - 1].push(w);
  });
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 80,
        right: 80,
        textAlign: align,
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        letterSpacing: '-0.045em',
        color,
        opacity: 1 - outP,
        filter: outP > 0.01 ? `blur(${outP * 24}px)` : 'none',
        scale: String(1 + outP * 0.06),
      }}
    >
      {lines.map((ln, li) => (
        <div key={li} style={{whiteSpace: 'nowrap'}}>
          {ln.map((w, wi) => {
            const p = spring({frame: frame - s2f(w.t), fps, config: {damping: 15, stiffness: 210, mass: 0.7}});
            const vis = frame >= s2f(w.t);
            const fadeP = w.fade ? lerp(frame, [s2f(w.t) + 20, s2f(w.t) + 50], [0, 1], easeInOut) : 0;
            return (
              <span
                key={wi}
                style={{
                  display: 'inline-block',
                  marginRight: wi < ln.length - 1 ? '0.24em' : 0,
                  opacity: vis ? Math.min(1, p * 1.4) * (1 - fadeP * 0.82) : 0,
                  translate: `0 ${(1 - p) * 0.45 * size}px`,
                  filter: 1 - Math.min(1, p) + fadeP > 0.01 ? `blur(${(1 - Math.min(1, p)) * 14 + fadeP * 10}px)` : 'none',
                  scale: String(0.86 + 0.14 * p),
                  color: w.accent ? C.coral : undefined,
                  position: 'relative',
                }}
              >
                {w.text}
                {w.accent && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      bottom: '-0.02em',
                      height: '0.08em',
                      borderRadius: 99,
                      background: `linear-gradient(90deg, ${C.coral}, ${C.orange})`,
                      width: `${lerp(frame, [s2f(w.t) + 6, s2f(w.t) + 26], [0, 100], easeOut)}%`,
                    }}
                  />
                )}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Small pill label (e.g. "BUILD", "MINOR BUILDS PRO"). */
export const Pill: React.FC<{children: React.ReactNode; color?: string; bg?: string; size?: number; style?: React.CSSProperties}> = ({
  children,
  color = '#fff',
  bg = C.coral,
  size = 30,
  style,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      padding: `${size * 0.36}px ${size * 0.8}px`,
      borderRadius: 999,
      background: bg,
      color,
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: '0.08em',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Feather icon subset used by the app (stroke icons, 24 viewBox). */
export const Icon: React.FC<{name: string; size?: number; color?: string; stroke?: number}> = ({name, size = 24, color = 'currentColor', stroke = 2}) => {
  const paths: Record<string, React.ReactNode> = {
    home: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
    list: (
      <>
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </>
    ),
    bar: (
      <>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </>
    ),
    book: (
      <>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
    plus: (
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>
    ),
    minus: <line x1="5" y1="12" x2="19" y2="12" />,
    check: <polyline points="20 6 9 17 4 12" />,
    left: <polyline points="15 18 9 12 15 6" />,
    right: <polyline points="9 18 15 12 9 6" />,
    play: <polygon points="5 3 19 12 5 21 5 3" />,
    pause: (
      <>
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

/** iPhone frame; children render on a 393×852 pt screen scaled to `width`. */
export const Phone: React.FC<{width?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({width = 660, children, style}) => {
  const bezel = 16;
  const sw = width - bezel * 2;
  const k = sw / 393;
  const sh = 852 * k;
  return (
    <div
      style={{
        position: 'relative',
        width,
        height: sh + bezel * 2,
        borderRadius: 58 * k + bezel,
        background: 'linear-gradient(145deg, #3a3a3c, #0d0d0e 40%, #2c2c2e)',
        padding: bezel,
        boxShadow: '0 60px 120px rgba(28,28,30,0.25), 0 20px 40px rgba(28,28,30,0.12), inset 0 0 0 2px rgba(255,255,255,0.12)',
        ...style,
      }}
    >
      <div style={{position: 'relative', width: sw, height: sh, borderRadius: 54 * k, overflow: 'hidden', background: C.bg}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 393, height: 852, scale: String(k), transformOrigin: '0 0'}}>
          {children}
          {/* status bar + dynamic island */}
          <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 54, fontFamily: FONT, pointerEvents: 'none'}}>
            <div style={{position: 'absolute', left: 48, top: 18, fontWeight: 600, fontSize: 17, color: C.text}}>9:41</div>
            <div style={{position: 'absolute', left: 393 / 2 - 62, top: 11, width: 124, height: 36, borderRadius: 20, background: '#000'}} />
            <div style={{position: 'absolute', right: 36, top: 21, display: 'flex', gap: 6, alignItems: 'center'}}>
              <div style={{display: 'flex', gap: 2, alignItems: 'flex-end'}}>
                {[5, 7, 9, 11].map((h) => (
                  <div key={h} style={{width: 3, height: h, borderRadius: 1, background: C.text}} />
                ))}
              </div>
              <div style={{width: 25, height: 12, borderRadius: 4, border: `1.5px solid ${C.text}`, padding: 1.5, opacity: 0.9}}>
                <div style={{width: '80%', height: '100%', borderRadius: 2, background: C.text}} />
              </div>
            </div>
          </div>
          <div style={{position: 'absolute', bottom: 8, left: 393 / 2 - 67, width: 134, height: 5, borderRadius: 3, background: C.text, opacity: 0.85}} />
        </div>
      </div>
    </div>
  );
};

/** Tap indicator: a soft finger-press circle that dips and ripples at `at` (frames, local). */
export const Tap: React.FC<{x: number; y: number; at: number; size?: number}> = ({x, y, at, size = 90}) => {
  const f = useCurrentFrame();
  const vis = lerp(f, [at - 14, at - 6, at + 16, at + 26], [0, 1, 1, 0]);
  const press = lerp(f, [at - 4, at, at + 6], [1, 0.82, 1]);
  const ring = lerp(f, [at, at + 22], [0, 1], easeOut);
  if (vis <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'rgba(28,28,30,0.18)',
          border: '3px solid rgba(255,255,255,0.9)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          opacity: vis,
          scale: String(press),
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `4px solid ${C.coral}`,
          opacity: (1 - ring) * (f >= at ? 1 : 0),
          scale: String(1 + ring * 1.4),
        }}
      />
    </div>
  );
};

/** Scene wrapper: quick blur-scale in, blur-scale out (liquid cut). Frames are scene-local. */
export const SceneFX: React.FC<{dur: number; children: React.ReactNode; inF?: number; outF?: number}> = ({dur, children, inF = 14, outF = 10}) => {
  const f = useCurrentFrame();
  const pin = lerp(f, [0, inF], [0, 1], easeOut);
  const pout = lerp(f, [dur - outF, dur], [0, 1], easeInOut);
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(pin * 1.3, 1) * (1 - pout),
        filter: (1 - pin) + pout > 0.01 ? `blur(${(1 - pin) * 12 + pout * 14}px)` : 'none',
        scale: String((0.94 + 0.06 * pin) * (1 + pout * 0.08)),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
