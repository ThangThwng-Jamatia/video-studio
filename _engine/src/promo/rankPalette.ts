// Copied from HabitTracker features/gamification/gamification.logic.ts (RANK_PALETTES) for the promo.
export type WarriorRank = 'recruit' | 'soldier' | 'veteran' | 'elite' | 'champion' | 'legend' | 'immortal';
export interface RankPalette { light: string; color: string; dark: string; edge: string; shine: string }
const RANK_PALETTES: Record<WarriorRank, RankPalette> = {
  recruit:  { light:'#e5e7eb', color:'#9ca3af', dark:'#4b5563', edge:'#1f2937', shine:'#f3f4f6' },
  soldier:  { light:'#a7f3d0', color:'#6ee7b7', dark:'#059669', edge:'#064e3b', shine:'#d1fae5' },
  veteran:  { light:'#a5f3fc', color:'#67e8f9', dark:'#0891b2', edge:'#164e63', shine:'#e0f2fe' },
  elite:    { light:'#c4b5fd', color:'#a78bfa', dark:'#7c3aed', edge:'#3b0764', shine:'#ede9fe' },
  champion: { light:'#fde68a', color:'#fbbf24', dark:'#d97706', edge:'#451a03', shine:'#fffbeb' },
  legend:   { light:'#fca5a5', color:'#f87171', dark:'#dc2626', edge:'#450a0a', shine:'#fee2e2' },
  immortal: { light:'#f0abfc', color:'#e879f9', dark:'#c026d3', edge:'#3b0764', shine:'#fdf4ff' },
};
export const getRankPalette = (rank: WarriorRank): RankPalette => RANK_PALETTES[rank];
export const RANKS: WarriorRank[] = ['recruit', 'soldier', 'veteran', 'elite', 'champion', 'legend', 'immortal'];
