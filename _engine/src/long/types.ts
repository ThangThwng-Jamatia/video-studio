// LongPlan: input of the `Long` composition, built by `pipeline.py long` from jobs/<slug>/edits_long.json.
// All times are absolute seconds on the cut timeline. Word `at` times come from words.json (pipeline matches them).
import type {IconName} from './Icons';
import type {MGBeatData} from './MG';

export type WordFx = 'script' | 'italic' | 'gold' | 'ice' | 'bad' | 'good';
export type Word = {t: string; at: number; f?: WordFx};
export type Size = 'xxl' | 'xl' | 'l' | 'm' | 's';
export type Line = {
  words: Word[]; at: number; size?: Size; icon?: IconName; iconColor?: string; color?: 'white' | 'gold' | 'ice' | 'dim';
  strikeAt?: number; align?: 'left' | 'center' | 'right';
};
export type Pos = 'tl' | 'tr' | 'bl' | 'br' | 'left' | 'right' | 'center' | 'top' | 'bottom' | 'lower' | 'auto';
type Base = {start: number; end: number; layer: 'full' | 'over'; enter?: 'cut' | 'shrink' | 'fade'; exit?: 'cut' | 'grow' | 'fade'};

export type Anchor = {x: number; y: number; align: 'left' | 'right' | 'center'; maxW: number};
export type StackBeat = Base & {type: 'stack'; lines: Line[]; pos: Pos | 'lower' | 'auto'; bg?: 'none' | 'look' | 'scrim' | 'dim'; kicker?: string; maxW?: number;
  anchor?: Anchor};
export type HeadTitleBeat = Base & {type: 'headTitle'; left: Word; right: Word; sub?: Line[]; face: [number, number, number, number]};
export type Pill = {text: string; at: number; icon?: IconName; color?: string; strikeAt?: number};
export type PillsBeat = Base & {type: 'pills'; items: Pill[]; pos: Pos; dir?: 'row' | 'col'; bg?: 'none' | 'look'; kicker?: string};
export type VersusBeat = Base & {type: 'versus'; bad: Word[]; good: Word[]; kicker?: string; badAt: number; goodAt: number;
  thumb?: {big: string; title: string; meta: string}; goodKicker?: string};
export type CalendarBeat = Base & {type: 'calendar'; mode: 'count' | 'callback' | 'last3'; stampAts?: number[]; litAt: number; label: string;
  labelAt: number; pctAt?: number; kicker?: string; headline?: Word[]; litAts?: number[]};
export type CounterItem = {label: string; from: number; to: number; at: number; dur?: number; fmt: 'num' | 'clock' | 'dur' | 'pct' | 'plus';
  prefix?: string; suffix?: string; color?: string; icon?: IconName};
export type CounterBeat = Base & {type: 'counter'; items: CounterItem[]; bg?: 'look' | 'none' | 'bare'; pos?: Pos; kicker?: string};
export type ChainBeat = Base & {type: 'chain'; items: Word[]; seps?: string[]; kicker?: string};
export type ChapterBeat = Base & {type: 'chapter'; kicker: string; title: string; titleAt: number; icons: IconName[]; focus: number};
export type TrackerBeat = Base & {type: 'tracker'; mode: 'intro' | 'tick'; done: number; tickAt?: number; introAts?: number[];
  week?: {at: number; label: string}; items: {icon: IconName; label: string}[]; title: string; titleAt?: number};
export type PhoneScreen =
  | {at: number; kind: 'notifs'; count: number; items: {app: string; text: string; color: string}[]}
  | {at: number; kind: 'screentime'; app: string; color: string; from: number; to: number; dur?: number}
  | {at: number; kind: 'chat'; name: string; bubbles: {text: string; at: number; me?: boolean}[]; xAt?: number}
  | {at: number; kind: 'alarm'; time: string}
  | {at: number; kind: 'text'; text: string; color?: string; sub?: string}
  | {at: number; kind: 'dnd'; onAt: number}
  | {at: number; kind: 'apps'; apps: {name: string; color: string; xAt?: number}[]};
export type PhoneBeat = Base & {type: 'phone'; screens: PhoneScreen[]; side: 'center' | 'right' | 'left'; caption?: Line[]};
export type BrollBeat = Base & {type: 'broll'; src: string; trimFrom?: number; zoom?: 'in' | 'out' | 'none' | 'push'; grade?: 'cool' | 'warm' | 'none'; dim?: number};
export type GfxText = {words: Word[]; at: number; style: 'title' | 'neon' | 'gold' | 'bad' | 'good' | 'small'; x: number; y: number;
  align?: 'left' | 'center' | 'right'};
export type GfxBeat = Base & {type: 'gfx3d'; scene: string; kind: string; cues?: number[]; texts?: GfxText[]};
export type FlashBeat = Base & {type: 'flash'};
export type BatteryBeat = Base & {type: 'battery'; from: number; steps: {at: number; to: number}[]; lines: Line[]};
export type DopamineBeat = Base & {type: 'dopamine'; count?: number; headline?: Word[]; neon?: {text: string; at: number}};
export type PhonePairBeat = Base & {type: 'phonePair'; redAt: number; goldAt: number; labels: {side: 'left' | 'right'; text: string; at: number}[]};
export type BehindBeat = Base & {type: 'behind'; words: Word[]; fg: string; y: number; size: number; kicker?: Word[]; sub?: Line[];
  faceX?: number; gap?: number};
export type SnowBeat = Base & {type: 'snow'; amount?: number};
export type MGBeat = Base & MGBeatData & {type: 'mg'};

export type Beat = StackBeat | HeadTitleBeat | PillsBeat | VersusBeat | CalendarBeat | CounterBeat | ChainBeat | ChapterBeat
  | TrackerBeat | PhoneBeat | BrollBeat | GfxBeat | FlashBeat | SnowBeat | BatteryBeat | DopamineBeat | PhonePairBeat | BehindBeat | MGBeat;

export type Angle = {start: number; end: number; scale: number; ox: number; oy: number; bw?: boolean};
export type LongPlan = {
  title: string; durationSec: number; talkEnd: number; fps: number; aroll: string; look: 'A' | 'B' | 'C';
  angles: Angle[]; beats: Beat[]; labels: {text: string; start: number; end: number}[];
  punches?: {start: number; end: number; scale: number}[];
  sfx: {src: string; at: number; volume?: number}[];
  music?: {src: string; volume: number; tailVolume?: number};
  grade?: {contrast?: number; saturate?: number; brightness?: number; vignette?: number; warmth?: number};
};
