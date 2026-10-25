// Long-video design tokens (long-video-editor skill, long-style.md). Look A = Cinematic Story (navy + ice glow + gold).
// Fonts: exactly 3 families (user rule): Sora (titles/stacks), Inter Tight (UI/pills/cards), Mr Dafoe (script accents).
import type React from 'react';
import {Easing, interpolate} from 'remotion';
import {loadFont as loadSora} from '@remotion/google-fonts/Sora';
import {loadFont as loadTight} from '@remotion/google-fonts/InterTight';
import {loadFont as loadDafoe} from '@remotion/google-fonts/MrDafoe';

const latin = {subsets: ['latin'] as ['latin']};
export const {fontFamily: sora} = loadSora('normal', {weights: ['500', '600', '700', '800'], ...latin});
export const {fontFamily: tight} = loadTight('normal', {weights: ['500', '600', '700', '800'], ...latin});
loadTight('italic', {weights: ['700', '800'], ...latin});
export const {fontFamily: dafoe} = loadDafoe('normal', {weights: ['400'], ...latin});

export const C = {
  bg0: '#04060c',
  bg1: '#0a1430',
  glow: '#2f6bff',
  ice: '#a9cfff',
  gold: '#f5c451',
  gold2: '#ffe08a',
  neon: '#7aa6ff',
  good: '#4ade80',
  bad: '#ff4d4d',
  white: '#ffffff',
  dim: 'rgba(255,255,255,0.55)',
  card: 'rgba(14,20,36,0.82)',
  cardHi: 'rgba(28,38,66,0.9)',
  border: 'rgba(255,255,255,0.13)',
};

export const SHADOW = '0 4px 24px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.4)';
export const NEON_SHADOW = `0 0 8px rgba(122,166,255,0.95), 0 0 24px rgba(47,107,255,0.85), 0 0 48px rgba(47,107,255,0.55)`;
export const GOLD_SHADOW = `0 0 18px rgba(245,196,81,0.55), 0 4px 24px rgba(0,0,0,0.5)`;

export const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const ease = (t: number, a: number, b: number, e = Easing.inOut(Easing.cubic)) =>
  b <= a ? (t >= a ? 1 : 0) : interpolate(t, [a, b], [0, 1], {...cl, easing: e});
export const out = (t: number, a: number, d = 0.22) => ease(t, a, a + d, Easing.out(Easing.cubic));
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// blur-in reveal used by every text element: 6 frames, blur 10→0, y +12→0
export const reveal = (t: number, at: number, d = 0.2): React.CSSProperties => {
  const k = out(t, at, d);
  return {opacity: k, filter: k < 1 ? `blur(${(1 - k) * 10}px)` : undefined, transform: `translateY(${(1 - k) * 12}px)`};
};
// spring-ish pop for cards / pills
export const popK = (t: number, at: number, d = 0.32) => {
  const k = ease(t, at, at + d, Easing.out(Easing.back(1.6)));
  return k;
};
export const popStyle = (t: number, at: number, d = 0.32): React.CSSProperties => {
  const k = popK(t, at, d);
  const o = out(t, at, d * 0.6);
  return {opacity: o, transform: `scale(${0.85 + 0.15 * k})`, filter: o < 1 ? `blur(${(1 - o) * 8}px)` : undefined};
};
