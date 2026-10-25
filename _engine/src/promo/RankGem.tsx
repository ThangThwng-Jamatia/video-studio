import React from 'react';
import { getRankPalette, type RankPalette, type WarriorRank } from './rankPalette';
import {
  hexAngles,
  hexPoints,
  starPoints,
  toPoints,
  sector,
  tri,
  type Point,
} from './rankBadgeGeometry';

interface RankGemProps {
  rank: WarriorRank;
  /** Rendered width & height in px. Square. */
  size?: number;
  style?: React.CSSProperties;
}

const CX = 60;
const CY = 60;

interface BadgeProps {
  id: string;
  p: RankPalette;
}

/** Six gradients shared by every badge, namespaced by rank id. */
function GDefs({ id, p }: BadgeProps) {
  return (
    <defs>
      <linearGradient id={`${id}-main`} x1="18%" y1="4%" x2="82%" y2="96%">
        <stop offset="0%" stopColor={p.light} />
        <stop offset="44%" stopColor={p.color} />
        <stop offset="100%" stopColor={p.dark} />
      </linearGradient>
      <linearGradient id={`${id}-edge`} x1="15%" y1="0%" x2="85%" y2="100%">
        <stop offset="0%" stopColor={p.color} stopOpacity={0.85} />
        <stop offset="100%" stopColor={p.edge} />
      </linearGradient>
      <linearGradient id={`${id}-sym`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={p.dark} />
        <stop offset="100%" stopColor={p.edge} />
      </linearGradient>
      <radialGradient id={`${id}-drop`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#000000" stopOpacity={0.65} />
        <stop offset="100%" stopColor="#000000" stopOpacity={0} />
      </radialGradient>
      <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={p.color} stopOpacity={0.55} />
        <stop offset="100%" stopColor={p.color} stopOpacity={0} />
      </radialGradient>
      <radialGradient id={`${id}-orb`} cx="38%" cy="35%" r="62%">
        <stop offset="0%" stopColor={p.shine} />
        <stop offset="55%" stopColor={p.color} />
        <stop offset="100%" stopColor={p.dark} />
      </radialGradient>
    </defs>
  );
}

/** Six-triangle lighting overlay for hex badges. ha order: R,BR,BL,L,TL,TR. */
function HexShade({ ha }: { ha: Point[] }) {
  return (
    <g>
      <polygon points={tri(ha[5], ha[0], CX, CY)} fill="#ffffff" opacity={0.3} />
      <polygon points={tri(ha[4], ha[5], CX, CY)} fill="#ffffff" opacity={0.14} />
      <polygon points={tri(ha[0], ha[1], CX, CY)} fill="#000000" opacity={0.06} />
      <polygon points={tri(ha[1], ha[2], CX, CY)} fill="#000000" opacity={0.2} />
      <polygon points={tri(ha[2], ha[3], CX, CY)} fill="#000000" opacity={0.26} />
      <polygon points={tri(ha[3], ha[4], CX, CY)} fill="#000000" opacity={0.1} />
    </g>
  );
}

/* ── RANK 1 — RECRUIT ── */
function RecruitBadge({ id, p }: BadgeProps) {
  const ha = hexAngles(CX, CY, 44, 0);
  return (
    <g>
      <ellipse cx={CX} cy={113} rx={24} ry={3.5} fill={`url(#${id}-drop)`} />
      <polygon points={hexPoints(CX, CY, 51, 0)} fill={`url(#${id}-edge)`} />
      <polygon points={hexPoints(CX, CY, 44, 0)} fill={`url(#${id}-main)`} />
      <HexShade ha={ha} />
      <polygon points={hexPoints(CX, CY, 44, 0)} fill="none" stroke={p.light} strokeWidth={0.8} opacity={0.35} />
      <polygon points={hexPoints(CX, CY, 37, 0)} fill="none" stroke={p.light} strokeWidth={0.6} opacity={0.22} />
      <rect x={56.5} y={37} width={7} height={34} rx={2.8} fill={`url(#${id}-sym)`} />
      <rect x={56.5} y={37} width={3.5} height={34} rx={2.8} fill={p.shine} opacity={0.2} />
      <rect x={57} y={37.5} width={6} height={3} rx={1.2} fill={p.light} opacity={0.55} />
    </g>
  );
}

/* ── RANK 2 — SOLDIER ── */
function SoldierBadge({ id, p }: BadgeProps) {
  const ha = hexAngles(CX, CY, 44, 0);
  return (
    <g>
      <ellipse cx={CX} cy={113} rx={24} ry={3.5} fill={`url(#${id}-drop)`} />
      <path d="M44,103 L48,95 L60,101 L72,95 L76,103" stroke={`url(#${id}-edge)`} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M44,103 L48,95 L60,101 L72,95 L76,103" stroke={p.light} strokeWidth={1.3} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.38} />
      <polygon points={hexPoints(CX, CY, 51, 0)} fill={`url(#${id}-edge)`} />
      <polygon points={hexPoints(CX, CY, 44, 0)} fill={`url(#${id}-main)`} />
      <HexShade ha={ha} />
      <polygon points={hexPoints(CX, CY, 44, 0)} fill="none" stroke={p.light} strokeWidth={0.8} opacity={0.35} />
      <polygon points={hexPoints(CX, CY, 37, 0)} fill="none" stroke={p.light} strokeWidth={0.6} opacity={0.2} />
      {[0, 1].map((i) => (
        <g key={i}>
          <path d={`M36,${52 + i * 12} L60,${43 + i * 12} L84,${52 + i * 12}`} fill="none" stroke={`url(#${id}-sym)`} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M36,${51 + i * 12} L60,${42 + i * 12} L84,${51 + i * 12}`} fill="none" stroke={p.light} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" opacity={0.42} />
        </g>
      ))}
    </g>
  );
}

/* ── RANK 3 — VETERAN ── */
function VeteranBadge({ id, p }: BadgeProps) {
  const ha = hexAngles(CX, CY, 44, 0);
  return (
    <g>
      <ellipse cx={CX} cy={113} rx={28} ry={3.5} fill={`url(#${id}-drop)`} />
      <path d="M9,53 L-8,46 L-12,60 L-8,74 L9,67 Z" fill={`url(#${id}-edge)`} />
      <path d="M9,53 L-8,46 L-5,55 Z" fill={p.light} opacity={0.3} />
      <path d="M111,53 L128,46 L132,60 L128,74 L111,67 Z" fill={`url(#${id}-edge)`} />
      <path d="M111,53 L128,46 L125,55 Z" fill={p.light} opacity={0.3} />
      <path d="M9,53 L-8,46" stroke={p.light} strokeWidth={0.8} opacity={0.4} />
      <path d="M111,53 L128,46" stroke={p.light} strokeWidth={0.8} opacity={0.4} />
      <polygon points={hexPoints(CX, CY, 51, 0)} fill={`url(#${id}-edge)`} />
      <polygon points={hexPoints(CX, CY, 44, 0)} fill={`url(#${id}-main)`} />
      <HexShade ha={ha} />
      <polygon points={hexPoints(CX, CY, 44, 0)} fill="none" stroke={p.light} strokeWidth={0.8} opacity={0.35} />
      <polygon points={hexPoints(CX, CY, 37, 0)} fill="none" stroke={p.light} strokeWidth={0.6} opacity={0.2} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <path d={`M36,${46 + i * 10} L60,${37 + i * 10} L84,${46 + i * 10}`} fill="none" stroke={`url(#${id}-sym)`} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M36,${45 + i * 10} L60,${36 + i * 10} L84,${45 + i * 10}`} fill="none" stroke={p.light} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" opacity={0.4} />
        </g>
      ))}
    </g>
  );
}

/* ── RANK 4 — ELITE ── */
function EliteBadge({ id, p }: BadgeProps) {
  const sOut = starPoints(CX, CY, 51, 23, 8);
  const sIn = starPoints(CX, CY, 45, 20, 8);
  const s4 = starPoints(CX, CY, 18, 8, 4);
  return (
    <g>
      <ellipse cx={CX} cy={113} rx={26} ry={3.5} fill={`url(#${id}-drop)`} />
      <polygon points={toPoints(sOut)} fill={`url(#${id}-edge)`} />
      <polygon points={toPoints(sIn)} fill={`url(#${id}-main)`} />
      <polygon points={sector(sIn, 0, 5, CX, CY)} fill="#ffffff" opacity={0.26} />
      <polygon points={sector(sIn, 14, 3, CX, CY)} fill="#ffffff" opacity={0.12} />
      <polygon points={sector(sIn, 8, 5, CX, CY)} fill="#000000" opacity={0.24} />
      <polygon points={sector(sIn, 12, 3, CX, CY)} fill="#000000" opacity={0.12} />
      <polygon points={toPoints(sIn)} fill="none" stroke={p.light} strokeWidth={0.65} opacity={0.32} />
      <polygon points={toPoints(s4)} fill={`url(#${id}-sym)`} />
      <polygon points={toPoints(starPoints(CX - 1.5, CY - 1.5, 12, 5, 4))} fill={p.shine} opacity={0.38} />
      <circle cx={CX} cy={CY} r={4.5} fill={p.shine} opacity={0.65} />
      <circle cx={CX - 1.5} cy={CY - 1.5} r={2} fill="#ffffff" opacity={0.7} />
    </g>
  );
}

/* ── RANK 5 — CHAMPION ── */
function ChampionBadge({ id, p }: BadgeProps) {
  const sOut = starPoints(CX, CY, 49, 22, 8);
  const sIn = starPoints(CX, CY, 43, 19, 8);
  return (
    <g>
      <ellipse cx={CX} cy={113} rx={30} ry={4} fill={`url(#${id}-drop)`} />
      <path d="M18,44 L-4,30 L-9,46 L0,58 L-9,70 L-4,84 L18,74 Z" fill={`url(#${id}-edge)`} />
      <path d="M18,44 L-4,30 L-3,44 Z" fill={p.light} opacity={0.28} />
      <path d="M18,44 L-9,46 L-5,38 Z" fill={p.light} opacity={0.2} />
      <path d="M102,44 L124,30 L129,46 L120,58 L129,70 L124,84 L102,74 Z" fill={`url(#${id}-edge)`} />
      <path d="M102,44 L124,30 L123,44 Z" fill={p.light} opacity={0.28} />
      <path d="M18,44 L-4,30 M18,74 L-4,84" stroke={p.light} strokeWidth={0.7} opacity={0.38} />
      <path d="M102,44 L124,30 M102,74 L124,84" stroke={p.light} strokeWidth={0.7} opacity={0.38} />
      <polygon points={toPoints(sOut)} fill={`url(#${id}-edge)`} />
      <polygon points={toPoints(sIn)} fill={`url(#${id}-main)`} />
      <polygon points={sector(sIn, 0, 5, CX, CY)} fill="#ffffff" opacity={0.28} />
      <polygon points={sector(sIn, 14, 3, CX, CY)} fill="#ffffff" opacity={0.13} />
      <polygon points={sector(sIn, 8, 5, CX, CY)} fill="#000000" opacity={0.22} />
      <polygon points={sector(sIn, 12, 3, CX, CY)} fill="#000000" opacity={0.1} />
      <polygon points={toPoints(sIn)} fill="none" stroke={p.light} strokeWidth={0.65} opacity={0.32} />
      <polygon points={toPoints(starPoints(CX, CY, 20, 9, 8))} fill={`url(#${id}-sym)`} />
      <polygon points={toPoints(starPoints(CX - 1.5, CY - 1.5, 13, 6, 8))} fill={p.shine} opacity={0.38} />
      <circle cx={CX} cy={CY} r={6} fill={`url(#${id}-orb)`} />
      <circle cx={CX - 2} cy={CY - 2} r={3} fill="#ffffff" opacity={0.68} />
    </g>
  );
}

/* ── RANK 6 — LEGEND ── */
function LegendBadge({ id, p }: BadgeProps) {
  const sOut = starPoints(CX, CY, 48, 22, 12);
  const sIn = starPoints(CX, CY, 42, 19, 12);
  return (
    <g>
      <ellipse cx={CX} cy={114} rx={34} ry={4.5} fill={`url(#${id}-drop)`} />
      <path d="M19,37 L-6,22 L-12,38 L1,52 Z" fill={`url(#${id}-edge)`} />
      <path d="M19,55 L-12,46 L-16,62 L-8,76 L19,70 Z" fill={`url(#${id}-edge)`} />
      <path d="M19,37 L-6,22 L-5,35 Z" fill={p.light} opacity={0.28} />
      <path d="M19,55 L-12,46 L-10,58 Z" fill={p.light} opacity={0.22} />
      <path d="M101,37 L126,22 L132,38 L119,52 Z" fill={`url(#${id}-edge)`} />
      <path d="M101,55 L132,46 L136,62 L128,76 L101,70 Z" fill={`url(#${id}-edge)`} />
      <path d="M101,37 L126,22 L125,35 Z" fill={p.light} opacity={0.28} />
      <path d="M101,55 L132,46 L130,58 Z" fill={p.light} opacity={0.22} />
      <path d="M19,37 L-6,22 M19,70 L-8,76" stroke={p.light} strokeWidth={0.7} opacity={0.35} />
      <path d="M101,37 L126,22 M101,70 L128,76" stroke={p.light} strokeWidth={0.7} opacity={0.35} />
      <polygon points={toPoints(sOut)} fill={`url(#${id}-edge)`} />
      <polygon points={toPoints(sIn)} fill={`url(#${id}-main)`} />
      <polygon points={sector(sIn, 0, 7, CX, CY)} fill="#ffffff" opacity={0.24} />
      <polygon points={sector(sIn, 22, 3, CX, CY)} fill="#ffffff" opacity={0.1} />
      <polygon points={sector(sIn, 12, 7, CX, CY)} fill="#000000" opacity={0.22} />
      <polygon points={sector(sIn, 20, 3, CX, CY)} fill="#000000" opacity={0.1} />
      <polygon points={toPoints(sIn)} fill="none" stroke={p.light} strokeWidth={0.65} opacity={0.3} />
      <polygon points={toPoints(starPoints(CX, CY, 20, 9, 8))} fill={`url(#${id}-sym)`} />
      <polygon points={toPoints(starPoints(CX - 1.5, CY - 1.5, 14, 6, 8))} fill={p.shine} opacity={0.36} />
      <circle cx={CX} cy={CY} r={7} fill={`url(#${id}-orb)`} />
      <circle cx={CX - 2} cy={CY - 2} r={3.5} fill="#ffffff" opacity={0.65} />
    </g>
  );
}

/* ── RANK 7 — IMMORTAL ── */
function ImmortalBadge({ id, p }: BadgeProps) {
  const outerRing = starPoints(CX, CY, 54, 45, 12);
  const sOut = starPoints(CX, CY, 47, 20, 8);
  const sIn = starPoints(CX, CY, 41, 17, 8);
  return (
    <g>
      <circle cx={CX} cy={CY} r={64} fill={`url(#${id}-halo)`} />
      <ellipse cx={CX} cy={115} rx={32} ry={5} fill={`url(#${id}-drop)`} />
      <path d="M16,34 L-10,18 L-15,36 L-2,50 Z" fill={`url(#${id}-edge)`} />
      <path d="M16,52 L-15,44 L-19,62 L-15,78 L16,70 Z" fill={`url(#${id}-edge)`} />
      <path d="M16,70 L-7,78 L-5,94 L16,84 Z" fill={`url(#${id}-edge)`} opacity={0.75} />
      <path d="M16,34 L-10,18 L-8,32 Z" fill={p.light} opacity={0.3} />
      <path d="M16,52 L-15,44 L-13,56 Z" fill={p.light} opacity={0.22} />
      <path d="M104,34 L130,18 L135,36 L122,50 Z" fill={`url(#${id}-edge)`} />
      <path d="M104,52 L135,44 L139,62 L135,78 L104,70 Z" fill={`url(#${id}-edge)`} />
      <path d="M104,70 L127,78 L125,94 L104,84 Z" fill={`url(#${id}-edge)`} opacity={0.75} />
      <path d="M104,34 L130,18 L128,32 Z" fill={p.light} opacity={0.3} />
      <path d="M104,52 L135,44 L133,56 Z" fill={p.light} opacity={0.22} />
      <path d="M16,34 L-10,18 M16,84 L-5,94" stroke={p.light} strokeWidth={0.7} opacity={0.38} />
      <path d="M104,34 L130,18 M104,84 L125,94" stroke={p.light} strokeWidth={0.7} opacity={0.38} />
      <polygon points={toPoints(outerRing)} fill={`url(#${id}-edge)`} opacity={0.5} />
      <polygon points={toPoints(sOut)} fill={`url(#${id}-edge)`} />
      <polygon points={toPoints(sIn)} fill={`url(#${id}-main)`} />
      <polygon points={sector(sIn, 0, 5, CX, CY)} fill="#ffffff" opacity={0.28} />
      <polygon points={sector(sIn, 14, 3, CX, CY)} fill="#ffffff" opacity={0.13} />
      <polygon points={sector(sIn, 8, 5, CX, CY)} fill="#000000" opacity={0.22} />
      <polygon points={sector(sIn, 12, 3, CX, CY)} fill="#000000" opacity={0.1} />
      <polygon points={toPoints(sIn)} fill="none" stroke={p.light} strokeWidth={0.7} opacity={0.38} />
      <circle cx={CX} cy={CY} r={17} fill={`url(#${id}-sym)`} />
      <circle cx={CX} cy={CY} r={17} fill={p.light} opacity={0.08} />
      <circle cx={CX} cy={CY} r={10} fill={`url(#${id}-orb)`} />
      <circle cx={CX - 3} cy={CY - 3} r={5.5} fill="#ffffff" opacity={0.6} />
      <circle cx={29} cy={27} r={2.5} fill={p.light} opacity={0.9} />
      <circle cx={91} cy={27} r={2.5} fill={p.light} opacity={0.9} />
      <circle cx={20} cy={60} r={1.8} fill={p.color} opacity={0.75} />
      <circle cx={100} cy={60} r={1.8} fill={p.color} opacity={0.75} />
      <circle cx={29} cy={93} r={1.5} fill={p.light} opacity={0.55} />
      <circle cx={91} cy={93} r={1.5} fill={p.light} opacity={0.55} />
    </g>
  );
}

const BADGE_MAP: Record<WarriorRank, React.FC<BadgeProps>> = {
  recruit: RecruitBadge,
  soldier: SoldierBadge,
  veteran: VeteranBadge,
  elite: EliteBadge,
  champion: ChampionBadge,
  legend: LegendBadge,
  immortal: ImmortalBadge,
};

/**
 * 3D rank badge — one of 7 tiers, escalating shape & ornament complexity.
 * Public API unchanged: consumers pass `rank`, `size`, optional `style`.
 */
export function RankGem({ rank, size = 56, style }: RankGemProps) {
  const palette = getRankPalette(rank);
  const Badge = BADGE_MAP[rank] ?? RecruitBadge;
  return (
    <div style={{ width: size, height: size, ...style }}>
      <svg width={size} height={size} viewBox="0 0 120 120">
        <GDefs id={rank} p={palette} />
        <Badge id={rank} p={palette} />
      </svg>
    </div>
  );
}
