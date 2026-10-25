// Minimal stroke icons (24×24 viewBox) for pills, stacks, trackers and chapter carousels.
import React from 'react';

export type IconName =
  | 'check' | 'x' | 'up' | 'down' | 'arrow' | 'moon' | 'desk' | 'dumbbell' | 'brain' | 'phone' | 'bell' | 'clock'
  | 'bolt' | 'sun' | 'drop' | 'leaf' | 'lock' | 'eye' | 'bed' | 'alarm' | 'battery' | 'steps' | 'food' | 'mirror'
  | 'chat' | 'game' | 'book' | 'target' | 'spark' | 'tabs' | 'trash' | 'calendar' | 'flame' | 'star';

const P: Record<IconName, React.ReactNode> = {
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  down: <path d="M12 5v14M6 13l6 6 6-6" />,
  arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  desk: <><path d="M3 10h18M5 10v9M19 10v9" /><path d="M8 10V6h6v4M15 6l3-2" /></>,
  dumbbell: <><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" /></>,
  brain: <><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1z" /><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1" /></>,
  phone: <><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></>,
  bell: <><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  bolt: <path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>,
  drop: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  leaf: <><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15" /><path d="M5 19l8-8" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  bed: <><path d="M3 18V7M3 13h18v5M21 18v-3" /><path d="M7 13v-2.5a1.5 1.5 0 0 1 1.5-1.5H11v4" /></>,
  alarm: <><circle cx="12" cy="13" r="7.5" /><path d="M12 9.5V13l2.5 1.5M4 5l3-2.5M20 5l-3-2.5" /></>,
  battery: <><rect x="2.5" y="7" width="17" height="10" rx="2" /><path d="M22 10.5v3M5.5 10v4" /></>,
  steps: <><path d="M8 3.5c2 0 3 2 3 5s-1 5-3 5-3-2-3-5 1-5 3-5zM6 16.5h4v2a2 2 0 0 1-4 0z" /><path d="M16 7.5c2 0 3 2 3 5s-1 4-3 4-3-1-3-4 1-5 3-5zM14 19.5h4" /></>,
  food: <><path d="M4 11h16a8 8 0 0 1-16 0z" /><path d="M9 7c0-1.5 1-2 1-3.5M13 7c0-1.5 1-2 1-3.5" /></>,
  mirror: <><ellipse cx="12" cy="10" rx="6" ry="7.5" /><path d="M12 17.5v4M8.5 21.5h7M9.5 7.5l3-2" /></>,
  chat: <path d="M4 5.5h16v10H10l-4.5 3.5v-3.5H4z" />,
  game: <><rect x="2.5" y="7.5" width="19" height="10" rx="5" /><path d="M7.5 10.5v4M5.5 12.5h4M15.5 12h.01M18 12.5h.01" /></>,
  book: <><path d="M4 5.5A2 2 0 0 1 6 3.5h13v15H6a2 2 0 0 0-2 2z" /><path d="M4 20.5a2 2 0 0 1 2-2h13v3H6a2 2 0 0 1-2-1" /></>,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="0.8" /></>,
  spark: <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" />,
  tabs: <><rect x="3" y="6.5" width="18" height="13" rx="2" /><path d="M3 10.5h18M6 6.5V4.5h5v2M12 6.5V4.5h5v2" /></>,
  trash: <><path d="M4.5 7h15M9 7V4.5h6V7M6.5 7l1 13h9l1-13" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  flame: <path d="M12 21.5a6.5 6.5 0 0 1-6.5-6.5c0-4 3.5-6 3.5-9.5 2.5 1.5 4 3.5 4 6 1-1 1.5-2.5 1.5-3.5 2 2 4 4.5 4 7a6.5 6.5 0 0 1-6.5 6.5z" />,
  star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
};

export const Icon: React.FC<{name: IconName; size: number; color?: string; stroke?: number; style?: React.CSSProperties}> = ({
  name, size, color = 'white', stroke = 2.2, style,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
    strokeLinejoin="round" style={{display: 'block', flexShrink: 0, ...style}}>
    {P[name]}
  </svg>
);
