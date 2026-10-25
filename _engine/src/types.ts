// Edit plan schema. Times are SECONDS on the final (already jump-cut) timeline.
// Asset paths are relative to _engine/public (e.g. "jobs/my-video/aroll.mp4", "sfx/whoosh.wav").

export type CaptionPreset = 'gold' | 'serif';

export type Word = {
  text: string;
  start: number;
  end: number;
  // "big"    -> the word is shown large (gold glow in 'gold', heavy sans in 'serif')
  // "italic" -> serif preset only: shown in italic serif inside the small line
  emph?: 'big' | 'italic';
};

export type BRoll = {
  src: string;
  start: number;
  end: number;
  trimFrom?: number; // seconds into the b-roll file
  zoom?: 'in' | 'out' | 'none'; // slow Ken-Burns push
  pop?: boolean; // quick scale-in entrance (default true)
};

export type Headline = {
  // Big standalone text (hook, chapter title, stat). Use \n for line breaks.
  text: string;
  start: number;
  end: number;
  style?: 'gold' | 'white' | 'serif';
  position?: 'top' | 'center' | 'bottom';
  size?: number; // px at 1080 height
};

// Caption placement per shot. A new placement = a cut: captions break there.
export type Placement = {
  start: number;
  end: number;
  align: 'left' | 'center' | 'right';
  x?: number; // 0..1 anchor: left edge (align left) or right edge (align right). default 0.5
  y: number; // 0..1 vertical centre of the caption block
  rotate?: number; // degrees, small tilts (-8..8) to match diagonal shots
  scale?: number; // per-shot caption size multiplier (e.g. 0.8 when space is tight)
};

export type Zoom = {start: number; end: number; scale: number; snap?: boolean};

export type Sfx = {src: string; at: number; volume?: number};

export type Accent = {
  type: 'redbar' | 'brackets' | 'flash';
  start: number;
  end: number;
};

// Full-screen motion-graphic card (Graphics.tsx). Item `at` times are absolute timeline seconds.
export type GraphicItem = {label?: string; value: string; at?: number; labelAt?: number; dim?: boolean; size?: number};
export type Graphic = {
  type: 'mirror' | 'circle' | 'split' | 'timeline';
  start: number;
  end: number;
  title?: string;
  titleAt?: number;
  items?: GraphicItem[];
  count?: number; // circle: number of people nodes
  resolveAt?: number; // split: when the dimmed option fades and the winner glows
  hideCaptions?: boolean; // default true: the card already shows the line
};

export type Plan = {
  title: string;
  format: 'long' | 'short';
  width: number;
  height: number;
  fps: number;
  durationSec: number;
  preset: CaptionPreset;
  captionScale?: number; // multiplies all caption sizes (default 1)
  captionPosition?: number; // 0..1 from top. default long 0.78, short 0.62
  aroll: string;
  arollVolume?: number;
  words: Word[];
  broll: BRoll[];
  headlines: Headline[];
  zooms: Zoom[];
  sfx: Sfx[];
  accents: Accent[];
  placements?: Placement[];
  graphics?: Graphic[];
  music?: {src: string; volume: number; duckTo?: number};
  grade?: {contrast?: number; saturate?: number; brightness?: number; vignette?: number};
};
