// "30 Brutal Money Truths I Wish I Knew at 20": 16:9 long (~14.7 min), first 2.5D "depth" paper video, 2026-10-24.
// Truths re-ranked by importance (brief in Paper Animations/Video Scripts was unordered). George voice, 3 parts joined, atempo 0.92.
// Beat times are looked up by word from moneyTruthsWords.ts (whisper), so scenes follow the voice: a('word') = first time that word
// is spoken at/after the scene start.
import React from 'react';
import {
  C, ramp, Pop, Txt, XMark, Person, Car, House, Bill, Coin, Cash, Sparkle, Label, Stamp, LineChart, Fly, Jar, Tree, Phone, CreditCard,
  CalendarPage, Clock, Bank, Laptop, Gear, Heart, Signpost, Briefcase, Bed, Battery, Doc, Shop, Factory, Wallet, Domino, Bulb, StormCloud,
  CoffeeCup, GradCap, Blocks, Truck, PriceTag, BigArrow, Book, Sneaker, Envelope, Chair, Dice, SlotMachine, Wave, Hourglass, Sandwich,
  Moon, Rocket, Seesaw, Magnifier, ValueCard, Lift, PaperStage, type Scene,
} from './kit';
import {WORDS} from './moneyTruthsWords';

export const TRUTHS_SEC = WORDS[WORDS.length - 1][1] + 3;
const W = 1920, H = 1080;
type A = (w: string, after?: number) => number;
type P = {t: number; a: A};

// ---------- word lookup ----------
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9$%]/g, '');
const find = (w: string, after: number) => {
  const n = norm(w);
  for (const [x, tm] of WORDS) if (tm >= after - 0.01 && norm(x).startsWith(n)) return tm;
  return after + 0.6;
};
const STARTS = WORDS.filter(([x]) => norm(x) === 'number').map(([, tm]) => tm);

// ---------- shared pieces ----------
const Room: React.FC<{bg?: string; floor?: string; y?: number}> = ({bg = C.paper, floor = C.paper2, y = 830}) => (
  <g><rect width={W} height={H} fill={bg} /><rect y={y} width={W} height={H - y} fill={floor} /><line x1={0} y1={y} x2={W} y2={y} stroke={C.ink} strokeWidth={6} />
    {/* faint perspective floor lines for depth */}
    {Array.from({length: 9}).map((_, i) => <line key={i} x1={W / 2 + (i - 4) * 120} y1={y} x2={W / 2 + (i - 4) * 520} y2={H} stroke={C.ink} strokeOpacity={0.08} strokeWidth={4} />)}</g>
);
const Card: React.FC<{color: string}> = ({color}) => <rect width={W} height={H} fill={color} />;
type Who = {t: number; x: number; y: number; s?: number; mood?: 'smile' | 'flat' | 'o' | 'grin'; armL?: number; armR?: number; flip?: boolean; handL?: React.ReactNode; handR?: React.ReactNode; walk?: number; tie?: boolean};
const Sam: React.FC<Who> = (p) => <Lift><Person kind="adult" cap stripe {...p} /></Lift>;
const Leo: React.FC<Who> = (p) => <Lift><Person kind="adult" shirt={C.navy} hair={C.ink} {...p} /></Lift>;
const Maya: React.FC<Who> = (p) => <Lift><Person kind="adult" shirt={C.sage} hair={C.terra} {...p} /></Lift>;
const Guy: React.FC<Who & {shirt?: string; hair?: string}> = (p) => <Lift><Person kind="adult" {...p} /></Lift>;
const up = (t: number, at: number) => (t > at ? 150 : 12);
const Pill: React.FC<{t: number; at: number; x: number; y: number; text: string; bg?: string; fg?: string; size?: number; r?: number}> = ({t, at, x, y, text, bg = C.ink, fg = C.paper, size = 56, r = 0}) => {
  const w = text.length * size * 0.58 + 60;
  return <Pop t={t} at={at} x={x} y={y} r={r}><rect x={-w / 2} y={-size * 0.8} width={w} height={size * 1.6} rx={size * 0.5} fill={bg} stroke={C.ink} strokeWidth={6} /><Txt x={0} y={3} size={size} color={fg} weight={700}>{text}</Txt></Pop>;
};
const Coins: React.FC<{t: number; at: number; x0: number; y0: number; x1: number; y1: number; n?: number}> = ({t, at, x0, y0, x1, y1, n = 4}) => (
  <>{Array.from({length: n}).map((_, i) => <Fly key={i} t={t} at={at + i * 0.15} x0={x0} y0={y0} x1={x1} y1={y1} arc={220} dur={0.55}><Coin /></Fly>)}</>
);

// Truth number card: big extruded number, title lines, a spinning coin
const COLORS = [C.terra, C.sage, C.navy, C.mustard];
const TruthCard: React.FC<{t: number; i: number; at: number; lines: string[]}> = ({t, i, at, lines}) => {
  const bg = COLORS[i % 4], fg = bg === C.mustard ? C.ink : C.paper;
  const spin = Math.cos(t * 3);
  return (
    <g>
      <Card color={bg} />
      {Array.from({length: 7}).map((_, k) => <circle key={k} cx={(k * 331) % W} cy={(k * 197) % H} r={60 + (k % 3) * 30} fill="#fff" opacity={0.06} />)}
      <Pop t={t} at={at} x={960} y={330}><Txt x={0} y={0} size={300} color={bg === C.mustard ? C.paper : C.mustard} weight={700}>{`#${i + 1}`}</Txt></Pop>
      {lines.map((l, k) => <Pop key={k} t={t} at={at + 0.5 + k * 0.35} x={960} y={600 + k * 120}><Txt x={0} y={0} size={92} color={fg} weight={700}>{l}</Txt></Pop>)}
      <Pop t={t} at={at + 0.2} x={1640} y={250} s={1.8}><g transform={`scale(${Math.max(0.08, Math.abs(spin))},1)`}><Coin /></g></Pop>
    </g>
  );
};

// ================= TRUTHS (re-ranked) =================
type Truth = {lines: string[]; parts: [string, React.FC<P>][]};
const TRUTHS: Truth[] = [
  // 1 renting time
  {lines: ["YOU WON'T GET RICH", 'RENTING YOUR TIME'], parts: [
    ['doctor', ({t, a}) => {
      const gone = t > a('stops');
      return <g><Room />
        <Pop t={t} at={a('doctor') - 0.2} x={480} y={830} s={1.1}><Lift><House x={0} y={0} body="#fff" roof={C.red} w={380} h={300} /></Lift><Txt x={0} y={-150} size={130} weight={700} color={C.red}>+</Txt></Pop>
        <Guy t={t} x={gone ? ramp(t, a('stops'), a('stops') + 1.2, 860, 1500) : 860} y={830} s={1} tie shirt="#fff" hair={C.ink} mood={gone ? 'flat' : 'smile'} walk={gone ? t * 0.8 : 0} />
        <Pill t={t} at={a('lot')} x={1380} y={110} text="$$$ / HOUR" bg={C.cash} />
        {gone && <XMark t={t} at={a('money', a('stops'))} x={1380} y={110} size={100} />}
        <Stamp t={t} at={a('job')} x={1200} y={330} text="A JOB, NOT WEALTH" size={80} />
      </g>;
    }],
    ['Real', ({t, a}) => (
      <g><Room bg="#E8EEDB" />
        <Pop t={t} at={a('sleep')} x={960} y={330} s={1}><Lift><Bed /></Lift></Pop>
        <Pop t={t} at={a('sleep') + 0.2} x={1110} y={170} s={0.9}><Txt x={0} y={0} size={90} weight={700} color={C.navy}>z z</Txt></Pop>
        {[['business', 380, <Shop sign="SHOP" color={C.sage} s={0.7} />], ['rental', 960, <House x={0} y={-140} body="#E7C9A2" roof={C.terra} w={260} h={200} />], ['stock', 1540, <LineChart t={t} t0={a('stock')} t1={a('stock') + 1} pts={[0.2, 0.3, 0.25, 0.5, 0.6, 0.85]} x={-180} y={-260} w={360} h={240} />]].map(([w, x, el], i) => (
          <g key={i}><Pop t={t} at={a(w as string)} x={x as number} y={760}>{el as React.ReactNode}</Pop>
            <Coins t={t} at={a(w as string) + 0.4} x0={x as number} y0={600} x1={960} y1={330} n={3} /></g>
        ))}
      </g>
    )],
    ['hours', ({t, a}) => (
      <g><Room />
        <Pop t={t} at={a('hours')} x={520} y={420} s={1.6}><Hourglass sand={ramp(t, a('hours'), a('hours') + 4, 0.9, 0.1)} /></Pop>
        <Label t={t} at={a('limited')} x={520} y={740} text="LIMITED" size={90} color={C.red} />
        <Pop t={t} at={a('assets')} x={1400} y={430} s={1.1}><Tree coins /></Pop>
        <Label t={t} at={a('not', a('assets'))} x={1400} y={740} text="UNLIMITED" size={90} color={C.cashD} />
        <Pill t={t} at={a('buy')} x={960} y={130} text="BUY TIME, OR BUY THINGS THAT BUY TIME?" size={46} />
      </g>
    )],
  ]},
  // 2 lifestyle inflation
  {lines: ['LIFESTYLE INFLATION', 'IS THE REAL PROBLEM'], parts: [
    ['raise', ({t, a}) => {
      const lvl = ramp(t, a('raise'), a('food') + 0.5, 0, 1);
      return <g><Room />
        <Pill t={t} at={a('raise')} x={960} y={110} text="+ RAISE" bg={C.cash} />
        <Pop t={t} at={a('car')} x={420} y={640} s={1.1}><Lift><Car x={0} y={0} color={C.red} /></Lift></Pop>
        <Pop t={t} at={a('apartment')} x={960} y={720}><Lift><House x={0} y={0} body="#fff" roof={C.navy} w={380} h={340} /></Lift></Pop>
        <Pop t={t} at={a('food')} x={1480} y={560} s={1.4}><CoffeeCup t={t} /></Pop>
        <g transform={`translate(1760,${800 - lvl * 500})`}><Pop t={t} at={a('raise')} x={0} y={0}><PriceTag label="COST" color={C.terra} /></Pop></g>
        <Pop t={t} at={a('raise')} x={160} y={800 - 500} s={0.8}><BigArrow up /></Pop>
      </g>;
    }],
    ['broke', ({t, a}) => (
      <g><Room bg="#F3D9CF" />
        <Leo t={t} x={700} y={830} s={1.05} mood="flat" handR={<Wallet t={t} s={0.4} empty={1} />} armR={-40} />
        <Pop t={t} at={a('nicer')} x={1250} y={560} s={1}><Lift><House x={0} y={0} body="#fff" roof={C.mustard} w={420} h={360} /></Lift></Pop>
        <Stamp t={t} at={a('broke')} x={700} y={220} text="STILL BROKE" size={90} />
      </g>
    )],
    ['Freeze', ({t, a}) => {
      const gap = ramp(t, a('difference'), a('difference') + 1, 0, 1);
      return <g><Room bg="#E3EEF2" />
        <Label t={t} at={a('Freeze')} x={960} y={110} text="FREEZE YOUR LIFESTYLE" size={84} color={C.navy} />
        <line x1={260} y1={760} x2={1660} y2={760} stroke={C.ink} strokeWidth={6} />
        <path d={`M260,700 L${260 + 1400},${700 - 420 * ramp(t, a('pay'), a('pay') + 2)}`} stroke={C.cashD} strokeWidth={14} fill="none" />
        <path d="M260,700 L1660,690" stroke={C.terra} strokeWidth={14} fill="none" strokeDasharray="30 18" />
        <Pill t={t} at={a('pay')} x={1500} y={230} text="INCOME" bg={C.cash} size={44} />
        <Pill t={t} at={a('Freeze')} x={1500} y={620} text="LIFESTYLE" bg={C.terra} size={44} />
        {gap > 0 && <g opacity={gap}><rect x={1100} y={360} width={260} height={300} fill={C.mustard} opacity={0.35} /><Txt x={1230} y={510} size={56} weight={700}>INVEST</Txt></g>}
        <Sparkle t={t} at={a('freedom')} x={1240} y={340} />
      </g>;
    }],
  ]},
  // 3 saving floor, earning no ceiling
  {lines: ['SAVING HAS A FLOOR.', 'EARNING HAS NO CEILING.'], parts: [
    ['cut', ({t, a}) => {
      const down = ramp(t, a('cut'), a('limit') + 0.3, 0, 1);
      const upv = ramp(t, a('earn'), a('business') + 1, 0, 1);
      return <g><Room />
        <rect x={360} y={760 - 400 * (1 - down)} width={260} height={400 * (1 - down) + 2} fill={C.terra} stroke={C.ink} strokeWidth={6} />
        <Label t={t} at={a('zero')} x={490} y={810} text="$0 FLOOR" size={60} color={C.red} />
        <rect x={1300} y={760 - 640 * upv} width={260} height={640 * upv + 2} fill={C.cash} stroke={C.ink} strokeWidth={6} />
        <Pop t={t} at={a('top')} x={1430} y={120} s={0.8}><Lift><Rocket t={t} /></Lift></Pop>
        <Label t={t} at={a('skill')} x={1050} y={420} text="SKILL" size={56} />
        <Label t={t} at={a('raise')} x={1050} y={520} text="RAISE" size={56} />
        <Label t={t} at={a('business')} x={1050} y={620} text="BUSINESS" size={56} />
      </g>;
    }],
    ['Cutting', ({t, a}) => (
      <g><Room bg="#F6E3B4" />
        <Pop t={t} at={a('coffee')} x={480} y={420} s={2}><CoffeeCup t={t} /></Pop>
        <Pill t={t} at={a('few')} x={480} y={720} text="+ $3" bg={C.grey} />
        <Pop t={t} at={a('sell')} x={1440} y={420} s={1.2}><Lift><Briefcase /></Lift></Pop>
        <Pill t={t} at={a('thousands')} x={1440} y={720} text="+ $3,000" bg={C.cash} size={64} />
        <Label t={t} at={a('energy')} x={960} y={120} text="FOCUS ON THE SIDE WITH NO LIMIT" size={60} color={C.cashD} />
      </g>
    )],
  ]},
  // 4 invest in yourself
  {lines: ['THE BEST FIRST $1,000', 'IS YOU'], parts: [
    ['index', ({t, a}) => (
      <g><Seesaw0 t={t} a={a} /></g>
    )],
    ['inflation', ({t, a}) => (
      <g><Room bg="#E8EEDB" />
        <Pop t={t} at={a('inflation')} x={560} y={430} s={1.6}><Lift><GradCap /></Lift></Pop>
        <Label t={t} at={a('eat')} x={560} y={700} text="INFLATION CAN'T EAT IT" size={60} color={C.cashD} />
        <Pop t={t} at={a('compounds')} x={1360} y={470} s={1.3}><Tree coins={t > a('money', a('compounds'))} g={ramp(t, a('compounds'), a('compounds') + 1.5, 0.4, 1)} /></Pop>
        <Pill t={t} at={a('crash')} x={1360} y={150} text="NO CRASH" bg={C.ink} size={44} />
        <Pill t={t} at={a('tax')} x={1360} y={250} text="NO TAX TO ZERO" bg={C.ink} size={44} />
        <Pill t={t} at={a('take')} x={1360} y={350} text="NOBODY TAKES IT" bg={C.ink} size={44} />
      </g>
    )],
  ]},
  // 5 automate
  {lines: ['AUTOMATE YOUR SAVINGS.', "DON'T TRUST WILLPOWER."], parts: [
    ['Every', ({t, a}) => (
      <g><Room />
        {[0, 1, 2, 3].map((i) => <Pop key={i} t={t} at={a('month') + i * 0.35} x={420 + i * 360} y={360} s={1.1}><Lift><CalendarPage label={['JAN', 'FEB', 'MAR', 'APR'][i]} /></Lift></Pop>)}
        {[0, 1, 2, 3].map((i) => <XMark key={i} t={t} at={a('never') + i * 0.12} x={420 + i * 360} y={360} size={90} />)}
        <Leo t={t} x={960} y={830} s={0.85} mood="flat" />
        <Bubble2 t={t} at={a('save')} x={1260} y={600} text="next month..." />
      </g>
    )],
    ['take', ({t, a}) => (
      <g><Room bg="#E3EEF2" />
        <Pop t={t} at={a('payday')} x={420} y={430} s={1.3}><Lift><Bank /></Lift></Pop>
        <Pop t={t} at={a('payday')} x={960} y={430} s={2}><Gear t={t} /></Pop>
        <Pop t={t} at={a('transfer')} x={1500} y={460} s={1.4}><Jar fill={ramp(t, a('moves'), a('moves') + 2, 0.1, 0.7)} label="SAVINGS" /></Pop>
        <Coins t={t} at={a('moves')} x0={420} y0={430} x1={1500} y1={420} n={5} />
        <Label t={t} at={a('see', a('never'))} x={960} y={780} text="NEVER SEEN = NEVER MISSED" size={66} color={C.navy} />
        <Pill t={t} at={a('fifty')} x={960} y={120} text="EVEN $50 / PAYCHECK" bg={C.cash} />
      </g>
    )],
  ]},
  // 6 manage before you earn
  {lines: ['MANAGE MONEY', 'BEFORE YOU EARN MORE'], parts: [
    ['People', ({t, a}) => (
      <g><Room />
        <Leo t={t} x={460} y={830} s={1} mood="smile" />
        <Bubble2 t={t} at={a('figure')} x={760} y={300} text="I'll learn when I'm rich" w={560} />
        <Stamp t={t} at={a('backwards')} x={1400} y={450} text="BACKWARDS" size={100} />
      </g>
    )],
    ['Managing', ({t, a}) => {
      const big = t > a('thousand', a('handle'));
      return <g><Room bg="#F6E3B4" />
        <Pop t={t} at={a('handle')} x={600} y={460} s={1.2}><Bill label="$500" w={300} /></Pop>
        {big && <Pop t={t} at={a('thousand', a('handle'))} x={1300} y={460} s={1.6}><Bill label="$500,000" w={380} /></Pop>}
        <Pop t={t} at={a('mistakes')} x={1300} y={460} s={2.2}><g opacity={0.9}><XMark t={t} at={a('mistakes')} x={0} y={0} size={110} /></g></Pop>
        <Label t={t} at={a('bigger')} x={1300} y={780} text="BIGGER MISTAKES" size={70} color={C.red} />
      </g>;
    }],
    ['Track', ({t, a}) => (
      <g><Room bg="#E8EEDB" />
        <Label t={t} at={a('Track')} x={960} y={120} text="GIVE EVERY DOLLAR A JOB" size={80} />
        {[['Rent', C.navy], ['food', C.terra], ['savings', C.cash], ['fun', C.mustard]].map(([w, col], i) => (
          <g key={i}><Pop t={t} at={a(w)} x={360 + i * 400} y={520} s={1.2}><Lift><Jar fill={0.5} /></Lift></Pop>
            <Pill t={t} at={a(w)} x={360 + i * 400} y={760} text={w.toUpperCase()} bg={col} size={48} />
            <Fly t={t} at={a(w)} x0={960} y0={250} x1={360 + i * 400} y1={420} dur={0.5}><Bill label="$" w={120} /></Fly></g>
        ))}
      </g>
    )],
  ]},
  // 7 emergency cash
  {lines: ['KEEP CASH', 'FOR EMERGENCIES'], parts: [
    ['car', ({t, a}) => (
      <g><Room bg="#E6E1D3" />
        <Pop t={t} at={a('car')} x={360} y={640}><Lift><Car x={0} y={0} color={C.navy} /></Lift><Txt x={0} y={-200} size={100} weight={700} color={C.red}>!</Txt></Pop>
        <Pop t={t} at={a('job')} x={960} y={560} s={1.4}><Lift><Briefcase /></Lift></Pop><XMark t={t} at={a('job') + 0.2} x={960} y={560} size={110} />
        <Pop t={t} at={a('market')} x={1560} y={520} s={1}><LineChart t={t} t0={a('market')} t1={a('market') + 0.8} pts={[0.85, 0.8, 0.6, 0.2, 0.05]} x={-200} y={-200} w={400} h={300} color={C.red} /></Pop>
        <Pop t={t} at={a('market')} x={960} y={160} s={1.1}><StormCloud t={t} /></Pop>
      </g>
    )],
    ['Without', ({t, a}) => (
      <g><Room bg="#F3D9CF" />
        <Pop t={t} at={a('sell')} x={520} y={420} s={1}><LineChart t={t} t0={a('sell')} t1={a('sell') + 1} pts={[0.8, 0.6, 0.3, 0.1]} x={-260} y={-200} w={520} h={320} color={C.red} /></Pop>
        <Pill t={t} at={a('worst')} x={520} y={700} text="SELL AT THE BOTTOM" bg={C.red} size={46} />
        <Pop t={t} at={a('credit')} x={1400} y={420} s={1.6}><CreditCard /></Pop>
        <Pill t={t} at={a('interest')} x={1400} y={700} text="25% INTEREST" bg={C.red} size={52} />
      </g>
    )],
    ['emergency', ({t, a}) => (
      <g><Room bg="#E3EEF2" />
        <Pop t={t} at={a('emergency')} x={620} y={480} s={1.9}><Jar fill={ramp(t, a('emergency'), a('months') + 1, 0.15, 0.8)} label="EMERGENCY" /></Pop>
        <Label t={t} at={a('boring')} x={620} y={120} text="BORING = GOOD" size={70} color={C.navy} />
        <Pill t={t} at={a('months')} x={1400} y={300} text="3–6 MONTHS" bg={C.cash} size={70} />
        <Pill t={t} at={a('invested', a('months'))} x={1400} y={480} text="NOT INVESTED" bg={C.ink} size={48} />
        <Pill t={t} at={a('crypto')} x={1400} y={600} text="NOT CRYPTO" bg={C.ink} size={48} />
        <Pill t={t} at={a('ready')} x={1400} y={720} text="JUST READY" bg={C.sage} size={48} />
      </g>
    )],
  ]},
  // 8 holding long term
  {lines: ['HOLDING LONG TERM', 'BEATS BAD TIMING'], parts: [
    ['Imagine', ({t, a}) => {
      const t0 = a('Every'), t1 = a('decades') + 1.5;
      return <g><Room />
        <LineChart t={t} t0={t0} t1={t1} pts={[0.1, 0.25, 0.12, 0.35, 0.5, 0.3, 0.55, 0.72, 0.45, 0.7, 0.95]} x={260} y={200} w={1400} h={520} color={C.cashD} />
        {[0.18, 0.45, 0.72].map((f, i) => <Pop key={i} t={t} at={t0 + 0.6 + i * 0.6} x={260 + f * 1400 + 80} y={260} s={0.8}><Pill t={t} at={0} x={0} y={0} text="BUY" bg={C.red} size={40} /></Pop>)}
        <Sam t={t} x={170} y={830} s={0.6} mood={t > a('millionaire') ? 'grin' : 'flat'} armL={up(t, a('millionaire'))} />
        <Pill t={t} at={a('holds')} x={960} y={110} text="NEVER SELLS" bg={C.navy} />
        <Stamp t={t} at={a('millionaire')} x={1300} y={640} text="MILLIONAIRE" size={80} color={C.cashD} />
      </g>;
    }],
    ['Time', ({t, a}) => (
      <g><Room bg="#E8EEDB" />
        <Pop t={t} at={a('Time')} x={600} y={440} s={2}><Clock t={t} speed={3} /></Pop>
        <Label t={t} at={a('enemy')} x={1300} y={300} text="THE ENEMY:" size={72} />
        <XMark t={t} at={a('crash')} x={1300} y={440} size={0} />
        <Label t={t} at={a('crash')} x={1300} y={440} text="the crash" size={64} color={C.grey} />
        <Stamp t={t} at={a('selling')} x={1300} y={600} text="SELLING" size={100} />
      </g>
    )],
  ]},
  // 9 day trading
  {lines: ['DAY TRADING IS GAMBLING,', 'NOT INVESTING'], parts: [
    ['Most', ({t, a}) => (
      <g><Room bg="#2E4057" floor="#22324A" />
        <Pop t={t} at={a('Most')} x={560} y={460} s={1.3}><Lift><Laptop lines={4} /></Lift></Pop>
        <Pop t={t} at={a('lose')} x={560} y={430} s={0.7}><LineChart t={t} t0={a('lose')} t1={a('lose') + 1.2} pts={[0.5, 0.7, 0.3, 0.6, 0.2, 0.05]} x={-260} y={-180} w={520} h={300} color={C.red} /></Pop>
        <Pop t={t} at={a('trap')} x={1340} y={460} s={1.3}><Lift><SlotMachine t={t} /></Lift></Pop>
        <Label t={t} at={a('casino')} x={1340} y={130} text="CASINO" size={90} color={C.mustard} />
        <Pop t={t} at={a('win')} x={1000} y={700} s={1}><Dice n={6} r={ramp(t, a('win'), a('win') + 1, -30, 20)} /></Pop>
      </g>
    )],
    ['luck', ({t, a}) => {
      const back = t > a('takes');
      return <g><Room bg="#F3D9CF" />
        <Leo t={t} x={600} y={830} s={1.1} mood={back ? 'o' : 'grin'} armL={back ? 150 : 150} armR={back ? -150 : -40} />
        <Pill t={t} at={a('luck')} x={600} y={160} text="FEELS LIKE SKILL" bg={C.cash} />
        {!back && <Pop t={t} at={a('luck')} x={1200} y={460} s={1.5}><Cash /></Pop>}
        {back && <Fly t={t} at={a('takes')} x0={1200} y0={460} x1={2100} y1={200} dur={0.8}><g transform="scale(1.5)"><Cash /></g></Fly>}
        <Stamp t={t} at={a('interest')} x={1350} y={600} text="WITH INTEREST" size={74} />
      </g>;
    }],
  ]},
  // 10 real wealth invisible
  {lines: ['REAL WEALTH', 'IS INVISIBLE'], parts: [
    ['luxury', ({t, a}) => (
      <g><Room />
        <Pop t={t} at={a('luxury')} x={760} y={680} s={1.6}><Lift><Car x={0} y={0} color={C.red} /></Lift></Pop>
        <Sparkle t={t} at={a('luxury') + 0.2} x={1060} y={420} />
        <Coins t={t} at={a('leaving')} x0={760} y0={620} x1={1900} y1={300} n={6} />
        <Pill t={t} at={a('leaving')} x={1440} y={160} text="MONEY LEAVING" bg={C.red} />
      </g>
    )],
    ['quiet', ({t, a}) => (
      <g><Room bg="#E8EEDB" />
        <Label t={t} at={a('quiet')} x={960} y={110} text="QUIET WEALTH" size={84} color={C.cashD} />
        <Pop t={t} at={a('savings')} x={380} y={500} s={1.3}><Jar fill={0.85} label="SAVINGS" /></Pop>
        <Pop t={t} at={a('paid')} x={960} y={640}><Lift><House x={0} y={0} body="#E7C9A2" roof={C.sage} w={360} h={300} /></Lift></Pop>
        <Pill t={t} at={a('paid')} x={960} y={720} text="PAID OFF" bg={C.cash} size={44} />
        <Pop t={t} at={a('investments')} x={1540} y={540} s={1.1}><Tree coins /></Pop>
      </g>
    )],
    ['richest', ({t, a}) => (
      <g><Room bg="#E6E1D3" />
        <Pop t={t} at={a('richest')} x={700} y={700} s={1.5}><Lift><Car x={0} y={0} color={C.grey} dirt={0.6} /></Lift></Pop>
        <Sam t={t} x={1260} y={830} s={1} mood="grin" armR={-60} />
        <Pop t={t} at={a('oldest')} x={1500} y={300} s={1.2}><Lift><Bank /></Lift></Pop>
        <Pill t={t} at={a('oldest')} x={700} y={180} text="OLDEST CAR" bg={C.ink} />
      </g>
    )],
  ]},
  // 11 incentives
  {lines: ['ALWAYS FOLLOW', 'THE INCENTIVES'], parts: [
    ['Before', ({t, a}) => (
      <g><Room />
        <Guy t={t} x={560} y={830} s={1.05} tie shirt={C.navy} hair={C.dirt} mood="grin" armR={-70} />
        <Bubble2 t={t} at={a('advice')} x={860} y={300} text="Buy this!" />
        <Pop t={t} at={a('paid')} x={1400} y={430} s={1.6}><Magnifier /></Pop>
        <Pill t={t} at={a('paid')} x={1400} y={720} text="HOW DO THEY GET PAID?" bg={C.terra} size={50} />
      </g>
    )],
    ['salesman', ({t, a}) => (
      <g><Room bg="#F6E3B4" />
        <Pop t={t} at={a('salesman')} x={480} y={420} s={1.4}><Doc title="POLICY" /></Pop>
        <Pill t={t} at={a('commission')} x={480} y={700} text="BIG COMMISSION" bg={C.cash} size={46} />
        <Pop t={t} at={a('influencer')} x={1400} y={420} s={1.6}><Phone glow /></Pop>
        <Pop t={t} at={a('coin')} x={1520} y={300} s={1.6}><Coin /></Pop>
        <Pill t={t} at={a('owns')} x={1400} y={700} text="ALREADY OWNS IT" bg={C.terra} size={46} />
        <Label t={t} at={a('bills')} x={960} y={110} text="ADVICE FOLLOWS THE PAYCHECK" size={64} />
      </g>
    )],
  ]},
  // 12 big expenses
  {lines: ['CUT THE BIG EXPENSES,', 'NOT THE $5 COFFEE'], parts: [
    ['Skipping', ({t, a}) => (
      <g><Room />
        <Pop t={t} at={a('treat')} x={500} y={460} s={2}><CoffeeCup t={t} /></Pop><XMark t={t} at={a('miserable')} x={500} y={460} size={110} />
        <Leo t={t} x={900} y={830} s={0.9} mood="flat" />
        <Pop t={t} at={a('needle')} x={1440} y={440} s={1.3}><Gauge v={ramp(t, a('needle'), a('needle') + 0.8, 0, 0.08)} /></Pop>
      </g>
    )],
    ['attack', ({t, a}) => (
      <g><Room bg="#E3EEF2" />
        <Label t={t} at={a('big')} x={960} y={110} text="THE BIG THREE" size={90} color={C.navy} />
        <Pop t={t} at={a('Rent')} x={420} y={560}><Lift><House x={0} y={0} body="#fff" roof={C.terra} w={300} h={260} /></Lift></Pop>
        <Pop t={t} at={a('insurance')} x={960} y={460} s={1.3}><Doc title="INSURANCE" /></Pop>
        <Pop t={t} at={a('car')} x={1500} y={520} s={1.1}><Lift><Car x={0} y={0} color={C.sage} /></Lift></Pop>
        <Pill t={t} at={a('hour')} x={960} y={760} text="1 HOUR > 1 YEAR OF NO COFFEE" bg={C.cash} size={50} />
      </g>
    )],
  ]},
  // 13 never lend
  {lines: ['NEVER LEND MONEY', 'TO FRIENDS'], parts: [
    ['lend', ({t, a}) => {
      const awk = t > a('awkward') - 0.3;
      return <g><Room bg="#F3D9CF" />
        <Sam t={t} x={500} y={830} s={1} mood={awk ? 'flat' : 'smile'} armR={-60} />
        <Maya t={t + 1} x={1420} y={830} s={1} mood={awk ? 'flat' : 'grin'} flip />
        <Fly t={t} at={a('lend')} x0={620} y0={500} x1={1300} y1={500} dur={0.7}><Bill label="$500" w={220} /></Fly>
        <Pop t={t} at={a('dinner')} x={960} y={720} s={1}><rect x={-260} y={-20} width={520} height={30} rx={10} fill={C.dirt} stroke={C.ink} strokeWidth={6} /></Pop>
        <Pop t={t} at={a('awkward')} x={960} y={300}><Txt x={0} y={0} size={110} weight={700} color={C.ink}>. . .</Txt></Pop>
        <Pop t={t} at={a('friend', a('lose'))} x={960} y={520} s={1.4}><Heart /></Pop>
        <XMark t={t} at={a('friend', a('lose')) + 0.1} x={960} y={520} size={90} />
      </g>;
    }],
    ['someone', ({t, a}) => (
      <g><Room bg="#E8EEDB" />
        <Pop t={t} at={a('gift')} x={600} y={440} s={1.5}><Lift><GiftBox /></Lift></Pop>
        <Pill t={t} at={a('strings')} x={600} y={720} text="A GIFT, NO STRINGS" bg={C.sage} />
        <Pill t={t} at={a('kindly')} x={1360} y={440} text={'OR SAY "NO" KINDLY'} bg={C.navy} size={60} />
      </g>
    )],
  ]},
  // 14 customer not money
  {lines: ['TO MAKE MONEY YOU NEED', 'A CUSTOMER, NOT MONEY'], parts: [
    ['founder', ({t, a}) => (
      <g><Room />
        <Pop t={t} at={a('warehouse')} x={460} y={560} s={0.9}><Lift><Factory t={t} /></Lift></Pop><XMark t={t} at={a('warehouse') + 0.3} x={460} y={460} size={130} />
        <Pop t={t} at={a('photos')} x={1100} y={420} s={1.4}><Lift><Laptop lines={2} /></Lift></Pop>
        <Pop t={t} at={a('photos')} x={1100} y={380} s={1}><Sneaker /></Pop>
        <Pop t={t} at={a('local')} x={1600} y={640} s={0.7}><Shop sign="SHOES" color={C.terra} /></Pop>
        <Pop t={t} at={a('ordered')} x={1240} y={180} s={1}><Envelope /></Pop>
        <Pop t={t} at={a('shipped')} x={1100} y={760} s={0.9}><Lift><Truck label="SHIP" /></Lift></Pop>
      </g>
    )],
    ['prove', ({t, a}) => (
      <g><Room bg="#E8EEDB" />
        <Label t={t} at={a('prove')} x={960} y={120} text="FIRST, PROVE SOMEONE WILL PAY" size={70} color={C.cashD} />
        {[['office', 380], ['stock', 760], ['loan', 1140]].map(([w, x], i) => <g key={i}><Pill t={t} at={a(w as string)} x={x as number} y={360} text={`NO ${(w as string).toUpperCase()}`} bg={C.ink} size={46} /></g>)}
        <Sam t={t} x={1580} y={830} s={0.9} mood="grin" armR={-150} />
        <Pill t={t} at={a('yes')} x={1580} y={300} text={'"YES!"'} bg={C.cash} size={70} />
        <Pop t={t} at={a('backwards')} x={700} y={640} s={1}><CalendarPage label="1 YR" /></Pop>
        <Stamp t={t} at={a('nobody')} x={700} y={640} text="NOBODY WANTED IT" size={60} />
      </g>
    )],
  ]},
  // 15 fail cheaply
  {lines: ['FAIL OFTEN,', 'BUT FAIL CHEAPLY'], parts: [
    ['ideas', ({t, a}) => (
      <g><Room />
        {[0, 1, 2, 3, 4].map((i) => <g key={i} transform={`translate(${300 + i * 330},700)`}><Domino fall={ramp(t, a('flop') + i * 0.25, a('flop') + i * 0.25 + 0.4)} label={['IDEA', 'APP', 'SHOP', 'BLOG', 'BRAND'][i]} /></g>)}
        <Label t={t} at={a('normal')} x={960} y={150} text="THAT'S NORMAL" size={84} />
      </g>
    )],
    ['secret', ({t, a}) => (
      <g><Room bg="#E8EEDB" />
        {[0, 1, 2, 3].map((i) => <Pop key={i} t={t} at={a('small') + i * 0.2} x={250 + i * 170} y={600} s={0.6}><Bill label="-$" w={160} /></Pop>)}
        <Pill t={t} at={a('small')} x={500} y={400} text="SMALL LOSSES" bg={C.terra} size={48} />
        <Pop t={t} at={a('win')} x={1400} y={480} s={1.8}><Bill label="+$$$$" w={300} /></Pop>
        <Sparkle t={t} at={a('win') + 0.2} x={1640} y={300} />
        <Label t={t} at={a('game')} x={960} y={150} text="STAY IN THE GAME" size={84} color={C.cashD} />
      </g>
    )],
  ]},
  // 16 freeze after a loss
  {lines: ["IT'S THE FREEZE", 'AFTER A LOSS'], parts: [
    ['Everyone', ({t, a}) => {
      const frozen = t > a('freeze', a('next'));
      return <g><Room bg={frozen ? '#DDEBF2' : C.paper} />
        <Sam t={t} x={960} y={830} s={1.2} mood={frozen ? 'o' : 'flat'} armL={12} armR={-12} />
        {frozen && <rect x={720} y={220} width={480} height={640} rx={30} fill="#BFE0EE" opacity={0.55} stroke="#7FB4CC" strokeWidth={8} />}
        <Pill t={t} at={a('freeze', a('next'))} x={480} y={250} text="FREEZE" bg="#5FA8C9" />
        <Pill t={t} at={a('quit')} x={1440} y={250} text="QUIT" bg={C.red} />
      </g>;
    }],
    ['Instead', ({t, a}) => (
      <g><Room bg="#E8EEDB" />
        <Pop t={t} at={a('broke')} x={460} y={460} s={1.6}><Magnifier /></Pop>
        <Pop t={t} at={a('fix')} x={960} y={460} s={2}><Gear t={t} /></Pop>
        <Pop t={t} at={a('rebuild')} x={1460} y={500} s={1.6}><Lift><Blocks /></Lift></Pop>
        <Label t={t} at={a('lesson')} x={960} y={130} text="A LESSON YOU ALREADY PAID FOR" size={64} />
      </g>
    )],
  ]},
  // 17 right wave
  {lines: ['PICK THE', 'RIGHT WAVE'], parts: [
    ['Working', ({t, a}) => (
      <g><rect width={W} height={H} fill="#DCEEF2" />
        <g transform="translate(60,520)"><Wave t={t} w={820} h={300} rising={false} color="#9AB6C2" /></g>
        <g transform="translate(1040,420)"><Wave t={t} w={820} h={400} rising color="#5FA8C9" /></g>
        <Pill t={t} at={a('dying')} x={470} y={180} text="DYING" bg={C.grey} />
        <Pill t={t} at={a('booming')} x={1450} y={180} text="BOOMING" bg={C.cash} />
        <Pop t={t} at={a('typewriter')} x={470} y={420} s={1}><Lift><Laptop lines={0} /></Lift></Pop>
        <Pop t={t} at={a('app')} x={1450} y={360} s={1.5}><Phone glow /></Pop>
      </g>
    )],
    ['Effort', ({t, a}) => (
      <g><rect width={W} height={H} fill="#DCEEF2" />
        <g transform={`translate(${-200 + ((t * 120) % 200)},560)`}><Wave t={t} w={2400} h={300} rising color="#5FA8C9" /></g>
        <Pop t={t} at={a('boat')} x={ramp(t, a('boat'), a('boat') + 3, 600, 1500)} y={560} s={1}><Lift><Boat /></Lift></Pop>
        <Pop t={t} at={a('swimmer')} x={500} y={880} s={0.7}><Guy t={t} x={0} y={0} shirt={C.terra} armL={150 + Math.sin(t * 8) * 30} armR={-150 - Math.cos(t * 8) * 30} /></Pop>
        <Label t={t} at={a('direction')} x={960} y={130} text="DIRECTION > EFFORT" size={90} color={C.navy} />
      </g>
    )],
  ]},
  // 18 luck numbers
  {lines: ['LUCK IS A', 'NUMBERS GAME'], parts: [
    ['force', ({t, a}) => (
      <g><Room />
        <Pill t={t} at={a('emails')} x={420} y={180} text="100 EMAILS" bg={C.navy} />
        <Pill t={t} at={a('videos')} x={960} y={180} text="100 VIDEOS" bg={C.terra} />
        <Pill t={t} at={a('jobs')} x={1500} y={180} text="50 JOBS" bg={C.sage} />
        {Array.from({length: 18}).map((_, i) => <Fly key={i} t={t} at={a('emails') + i * 0.35} x0={300} y0={760} x1={300 + ((i * 97) % 1400)} y1={340 + ((i * 53) % 300)} dur={0.7} arc={300}><g transform="scale(0.55)"><Envelope /></g></Fly>)}
        <Sam t={t} x={240} y={830} s={0.8} mood="grin" armR={-120} />
        <Pop t={t} at={a('shots')} x={1500} y={560} s={1.3}><Dice n={6} /></Pop><Sparkle t={t} at={a('shots')} x={1620} y={460} />
        <Label t={t} at={a('lucky')} x={1000} y={760} text="MORE SHOTS" size={70} color={C.cashD} />
      </g>
    )],
  ]},
  // 19 difficulty is opportunity
  {lines: ['THE DIFFICULTY', 'IS THE OPPORTUNITY'], parts: [
    ['easy', ({t, a}) => (
      <g><Room />
        {Array.from({length: 7}).map((_, i) => <Pop key={i} t={t} at={a('copies') + i * 0.12} x={240 + i * 240} y={700} s={0.55}><Shop sign="SAME" color={C.grey} /></Pop>)}
        <Pop t={t} at={a('prices')} x={960} y={250} s={1}><LineChart t={t} t0={a('prices')} t1={a('prices') + 1} pts={[0.9, 0.6, 0.3, 0.1]} x={-260} y={-150} w={520} h={260} color={C.red} /></Pop>
        <Pill t={t} at={a('profits')} x={1560} y={220} text="PROFITS GONE" bg={C.red} size={46} />
      </g>
    )],
    ['real', ({t, a}) => (
      <g><Room bg="#E8EEDB" />
        <Pop t={t} at={a('hard')} x={600} y={480} s={1.2}><Lift><Mountain /></Lift></Pop>
        <Sam t={t} x={600} y={330} s={0.4} mood="grin" armR={-150} />
        {['hard', 'boring', 'frustrating', 'expensive'].map((w, i) => <Pill key={i} t={t} at={a(w)} x={1380} y={250 + i * 130} text={w.toUpperCase()} bg={C.navy} size={44} />)}
        <Label t={t} at={a('fewer')} x={1380} y={830 - 40} text="= LESS COMPETITION" size={52} color={C.cashD} />
      </g>
    )],
    ['When', ({t, a}) => (
      <g><Room bg="#F6E3B4" />
        <Pop t={t} at={a('painful')} x={620} y={470} s={1.4}><StormCloud t={t} /></Pop>
        <Pop t={t} at={a('wallet')} x={1340} y={470} s={1.3}><Wallet t={t} empty={0} /></Pop>
        <Coins t={t} at={a('open')} x0={1340} y0={440} x1={1600} y1={200} n={4} />
        <Label t={t} at={a('Look')} x={960} y={140} text="LOOK CLOSER" size={84} />
      </g>
    )],
  ]},
  // 20 one thing first
  {lines: ['EARLY DIVERSIFICATION', 'KEEPS YOU BROKE'], parts: [
    ['Five', ({t, a}) => (
      <g><Room />
        {[0, 1, 2, 3, 4].map((i) => <Pop key={i} t={t} at={a('hustles') + i * 0.15} x={260 + i * 350} y={460} s={0.75}><Shop sign="$50" color={COLORS[i % 4]} /></Pop>)}
        <Pill t={t} at={a('distractions')} x={960} y={140} text="5 DISTRACTIONS" bg={C.red} />
        <Leo t={t} x={960} y={830} s={0.7} mood="o" armL={150} armR={-150} />
      </g>
    )],
    ['Build', ({t, a}) => (
      <g><Room bg="#E8EEDB" />
        <Pop t={t} at={a('Build')} x={760} y={700} s={1.6}><Shop sign="ONE" color={C.cash} /></Pop>
        <Coins t={t} at={a('serious')} x0={1900} y0={200} x1={760} y1={500} n={6} />
        <Pill t={t} at={a('Focus')} x={1460} y={300} text="1. FOCUS" bg={C.navy} size={60} />
        <Pill t={t} at={a('Diversify')} x={1460} y={450} text="2. DIVERSIFY" bg={C.sage} size={60} />
        <Label t={t} at={a('fortune')} x={1460} y={640} text="ONE THING FIRST" size={60} />
      </g>
    )],
  ]},
  // 21 10x easier than 2x
  {lines: ['AIMING FOR 10X CAN BE', 'EASIER THAN 2X'], parts: [
    ['double', ({t, a}) => (
      <g><Room bg="#F3D9CF" />
        <Pill t={t} at={a('double')} x={960} y={120} text="2X = 2X THE HOURS" bg={C.terra} size={60} />
        <Leo t={t} x={760} y={830} s={1} mood="o" handR={<Briefcase s={0.5} />} armR={-30} walk={t * 1.2} />
        <Pop t={t} at={a('burnout')} x={1260} y={430} s={1.2}><Battery level={ramp(t, a('burnout'), a('burnout') + 1, 0.8, 0.1)} /></Pop>
        <Pill t={t} at={a('bottleneck')} x={1260} y={700} text="BOTTLENECK" bg={C.ink} size={48} />
      </g>
    )],
    ['aiming', ({t, a}) => (
      <g><Room bg="#E3EEF2" />
        <Pill t={t} at={a('10', a('aiming'))} x={960} y={120} text="10X = NEW SYSTEM" bg={C.navy} size={64} />
        <Pop t={t} at={a('system')} x={500} y={440} s={2}><Gear t={t} /></Pop>
        <Pop t={t} at={a('system')} x={640} y={330} s={1.2}><Gear t={-t} /></Pop>
        <Pop t={t} at={a('products')} x={1000} y={480} s={1.1}><Lift><Laptop lines={3} /></Lift></Pop>
        <Pop t={t} at={a('hiring')} x={1420} y={830} s={0.6}><Maya t={t} x={0} y={0} /></Pop>
        <Pop t={t} at={a('hiring')} x={1620} y={830} s={0.6}><Guy t={t + 1} x={0} y={0} shirt={C.mustard} hair={C.dirt} /></Pop>
        <Pop t={t} at={a('leverage')} x={1500} y={300} s={1}><Lift><Rocket t={t} /></Lift></Pop>
      </g>
    )],
  ]},
  // 22 talent not passion
  {lines: ['FOLLOW YOUR TALENT,', 'NOT YOUR PASSION'], parts: [
    ['Follow', ({t, a}) => (
      <g><Room />
        <Pop t={t} at={a('passion')} x={600} y={440} s={1.6}><Heart /></Pop>
        <Pill t={t} at={a('vague')} x={600} y={720} text="VAGUE" bg={C.grey} />
        <Pop t={t} at={a('good')} x={1320} y={440} s={1.4}><Lift><Signpost a="SKILL" b="PASSION" /></Lift></Pop>
        <Label t={t} at={a('after')} x={1320} y={760} text="PASSION COMES AFTER" size={56} />
      </g>
    )],
    ['start', ({t, a}) => (
      <g><Room bg="#E8EEDB" />
        <Sam t={t} x={560} y={830} s={1} mood="grin" armR={-150} handR={<Bulb s={0.5} />} />
        <Pill t={t} at={a('naturally')} x={1300} y={300} text="WHAT YOU DO WELL" bg={C.navy} />
        <Coins t={t} at={a('market')} x0={1900} y0={300} x1={700} y1={400} n={5} />
        <Bubble2 t={t} at={a('weirdly')} x={1300} y={600} text="ask your friends" w={480} />
      </g>
    )],
  ]},
  // 23 simple investments
  {lines: ["CAN'T EXPLAIN IT SIMPLY?", "DON'T BUY IT."], parts: [
    ['ten', ({t, a}) => (
      <g><Room />
        <Pop t={t} at={a('understand')} x={420} y={520} s={1.1}><Lift><Person t={t} x={0} y={300} kind="kid" shirt={C.mustard} hair={C.dirt} mood="o" /></Lift></Pop>
        <Bubble2 t={t} at={a('understand')} x={420} y={170} text="???" w={240} />
        <Pop t={t} at={a('Complexity')} x={1200} y={430} s={1}><Lift><Tangle t={t} /></Lift></Pop>
        {['fees', 'risk', 'losing'].map((w, i) => <Pill key={i} t={t} at={a(w)} x={1250 + (i - 1) * 300} y={760} text={w.toUpperCase()} bg={C.red} size={44} />)}
        <Label t={t} at={a('Simple')} x={960} y={110} text="SIMPLE + BORING WINS" size={72} color={C.cashD} />
      </g>
    )],
  ]},
  // 24 peace of mind
  {lines: ['PEACE OF MIND BEATS', 'MAXIMUM RETURN'], parts: [
    ['investment', ({t, a}) => (
      <g><rect width={W} height={H} fill="#22324A" />
        <Pop t={t} at={a('night')} x={1600} y={200} s={1.2}><Moon /></Pop>
        <Pop t={t} at={a('night')} x={760} y={700} s={1.4}><Lift><Bed /></Lift></Pop>
        <Pop t={t} at={a('night')} x={760} y={420} s={0.8}><Lift><Person t={t} x={0} y={0} headOnly kind="adult" shirt={C.navy} hair={C.ink} mood="o" /></Lift></Pop>
        <Pop t={t} at={a('Panic')} x={1340} y={560} s={0.9}><LineChart t={t} t0={a('Panic')} t1={a('Panic') + 0.8} pts={[0.8, 0.5, 0.15]} x={-220} y={-160} w={440} h={260} color={C.red} /></Pop>
        <Pill t={t} at={a('bottom')} x={1340} y={820} text="PANIC SELL" bg={C.red} />
      </g>
    )],
    ['pick', ({t, a}) => (
      <g><Room bg="#E8EEDB" />
        <Sam t={t} x={700} y={830} s={1.05} mood="smile" handR={<CoffeeCup t={t} s={0.6} />} armR={-50} />
        <Pop t={t} at={a('screaming')} x={1350} y={430} s={1.5}><Lift><NewsPaper /></Lift></Pop>
        <Label t={t} at={a('stick')} x={960} y={120} text="ONE YOU CAN STICK WITH" size={76} color={C.cashD} />
      </g>
    )],
  ]},
  // 25 barbell
  {lines: ['USE THE', 'BARBELL'], parts: [
    ['90', ({t, a}) => {
      const tilt = ramp(t, a('90'), a('10', a('90') + 1), 0, 0) + 0;
      return <g><Room />
        <g transform="translate(960,820)"><Seesaw tilt={tilt} w={1300}
          left={<g transform="translate(0,-110)"><Lift><Bank s={0.8} /></Lift></g>}
          right={<g transform="translate(0,-130)"><Lift><Rocket t={t} s={0.6} /></Lift></g>} /></g>
        <Pill t={t} at={a('90')} x={440} y={200} text="90% SAFE" bg={C.sage} size={64} />
        <Pill t={t} at={a('bold')} x={1480} y={200} text="10% BOLD BETS" bg={C.terra} size={64} />
        <Label t={t} at={a('middle')} x={960} y={420} text="NOTHING IN THE RISKY MIDDLE" size={56} color={C.red} />
      </g>;
    }],
  ]},
  // 26 inflation both ways
  {lines: ['INFLATION', 'CUTS BOTH WAYS'], parts: [
    ['eats', ({t, a}) => {
      const sh = ramp(t, a('less'), a('less') + 1, 1, 0.65);
      return <g><Room bg="#F3D9CF" />
        <Pop t={t} at={a('cash')} x={600} y={460} s={1.8 * sh}><Bill label="$100" w={280} /></Pop>
        <Pill t={t} at={a('less')} x={600} y={760} text="BUYS LESS" bg={C.red} />
        <Pop t={t} at={a('debt')} x={1360} y={460} s={1.6 * ramp(t, a('shrinks'), a('shrinks') + 1, 1, 0.6)}><Doc title="LOAN" /></Pop>
        <Pill t={t} at={a('shrinks')} x={1360} y={760} text="DEBT SHRINKS" bg={C.cash} />
      </g>;
    }],
    ['borrow', ({t, a}) => (
      <g><Room bg="#E8EEDB" />
        <Pop t={t} at={a('rental')} x={760} y={640}><Lift><House x={0} y={0} body="#E7C9A2" roof={C.terra} w={420} h={360} /></Lift></Pop>
        <Coins t={t} at={a('pays')} x0={760} y0={420} x1={1400} y1={460} n={5} />
        <Pop t={t} at={a('loan')} x={1400} y={420} s={1.4 * ramp(t, a('smaller'), a('smaller') + 1.4, 1, 0.5)}><Doc title="LOAN" /></Pop>
      </g>
    )],
  ]},
  // 27 small portfolio
  {lines: ['SMALL PORTFOLIO?', 'STOP CHASING %'], parts: [
    ['invested', ({t, a}) => (
      <g><Room />
        <Pop t={t} at={a('invested')} x={480} y={460} s={1.4}><Jar fill={0.4} label="$2,000" /></Pop>
        <Pill t={t} at={a('return')} x={960} y={300} text="+2% = $40 / YEAR" bg={C.grey} size={64} />
        <Pop t={t} at={a('evening')} x={1440} y={440} s={1.4}><Clock t={t} speed={2} /></Pop>
        <Pill t={t} at={a('evening')} x={1440} y={720} text="ONE EVENING" bg={C.navy} />
      </g>
    )],
    ['Focus', ({t, a}) => (
      <g><Room bg="#E8EEDB" />
        <Pop t={t} at={a('pile')} x={700} y={560} s={ramp(t, a('pile'), a('pile') + 2, 1, 1.6)}><CashPile /></Pop>
        <Label t={t} at={a('engine')} x={1340} y={330} text="INCOME" size={110} color={C.cashD} />
        <Label t={t} at={a('engine')} x={1340} y={470} text="IS THE ENGINE" size={70} />
        <Pop t={t} at={a('engine')} x={1340} y={680} s={1.5}><Gear t={t * 2} /></Pop>
      </g>
    )],
  ]},
  // 28 decision not outcome
  {lines: ['JUDGE THE DECISION,', 'NOT THE OUTCOME'], parts: [
    ['bad', ({t, a}) => (
      <g><Room />
        <Pop t={t} at={a('bad')} x={560} y={430} s={1.4}><Dice n={6} r={-12} /></Pop>
        <Pill t={t} at={a('lucky')} x={560} y={680} text="BAD BUT LUCKY" bg={C.mustard} fg={C.ink} />
        <Pop t={t} at={a('smart')} x={1360} y={430} s={1.4}><Dice n={1} r={10} /></Pop>
        <Pill t={t} at={a('lose')} x={1360} y={680} text="SMART BUT UNLUCKY" bg={C.navy} />
      </g>
    )],
    ['Ask', ({t, a}) => {
      const n = Math.floor(ramp(t, a('fifty'), a('fifty') + 2.5, 0, 50));
      return <g><Room bg="#E3EEF2" />
        <Pill t={t} at={a('Ask')} x={960} y={110} text="WHAT IF I DID THIS 50 TIMES?" bg={C.navy} size={58} />
        {Array.from({length: n}).map((_, i) => <circle key={i} cx={460 + (i % 10) * 110} cy={300 + Math.floor(i / 10) * 100} r={36} fill={i % 7 === 3 ? C.red : C.cash} stroke={C.ink} strokeWidth={5} />)}
        <Stamp t={t} at={a('good', a('fifty'))} x={960} y={880 - 60} text="GOOD DECISION" size={70} color={C.cashD} />
      </g>;
    }],
  ]},
  // 29 opposite mindsets
  {lines: ['MAKING AND KEEPING MONEY', 'NEED OPPOSITE MINDSETS'], parts: [
    ['make', ({t, a}) => (
      <g><rect width={W / 2} height={H} fill="#F6E3B4" /><rect x={W / 2} width={W / 2} height={H} fill="#DDE6EE" /><line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke={C.ink} strokeWidth={8} />
        <Label t={t} at={a('make')} x={480} y={120} text="MAKE IT" size={90} color={C.terra} />
        <Pop t={t} at={a('optimism')} x={480} y={400} s={1}><Lift><Rocket t={t} /></Lift></Pop>
        <Pill t={t} at={a('risks')} x={480} y={720} text="OPTIMISM + RISK" bg={C.terra} size={48} />
        <Label t={t} at={a('keep')} x={1440} y={120} text="KEEP IT" size={90} color={C.navy} />
        <Pop t={t} at={a('humility')} x={1440} y={420} s={1.3}><Lift><Shield /></Lift></Pop>
        <Pill t={t} at={a('paranoia')} x={1440} y={720} text="CAUTION + PARANOIA" bg={C.navy} size={48} />
      </g>
    )],
    ['Most', ({t, a}) => (
      <g><Room bg="#E8EEDB" />
        <Sam t={t} x={960} y={830} s={1.1} mood="grin" armL={up(t, a('building'))} armR={t > a('pessimist') ? -60 : -12} />
        <Pill t={t} at={a('building')} x={480} y={300} text="BUILDING: OPTIMIST" bg={C.terra} size={50} />
        <Pill t={t} at={a('pessimist')} x={1440} y={300} text="PROTECTING: PESSIMIST" bg={C.navy} size={50} />
        <Label t={t} at={a('both')} x={960} y={120} text="LEARN BOTH" size={90} />
      </g>
    )],
  ]},
  // 30 time vs pennies
  {lines: ['STOP TRADING TIME', 'TO SAVE PENNIES'], parts: [
    ['Waiting', ({t, a}) => (
      <g><Room />
        {[0, 1, 2, 3, 4, 5].map((i) => <Guy key={i} t={t + i} x={300 + i * 180} y={830} s={0.6} shirt={COLORS[i % 4]} hair={i % 2 ? C.ink : C.dirt} mood="flat" />)}
        <Pop t={t} at={a('sandwich')} x={1560} y={480} s={1.6}><Lift><Sandwich /></Lift></Pop>
        <Pill t={t} at={a('hours')} x={800} y={240} text="2 HOURS" bg={C.red} />
        <Pill t={t} at={a('gas')} x={1560} y={780} text="SAVE $3" bg={C.grey} />
      </g>
    )],
    ['Your', ({t, a}) => (
      <g><Room bg="#E8EEDB" />
        <Pop t={t} at={a('time', a('Your'))} x={540} y={460} s={1.8}><Hourglass sand={0.5} /></Pop>
        <Label t={t} at={a('valuable')} x={540} y={780} text="YOUR #1 ASSET" size={64} color={C.navy} />
        <Pop t={t} at={a('skill')} x={1360} y={460} s={1.6}><Lift><GradCap /></Lift></Pop>
        <Pop t={t} at={a('sandwich')} x={1360} y={760} s={0.9}><Sandwich /></Pop><XMark t={t} at={a('sandwich') + 0.2} x={1360} y={760} size={80} />
      </g>
    )],
    ['So', ({t, a}) => (
      <g><Card color={C.mustard} />
        <Pop t={t} at={a('remember')} x={960} y={170} s={1.1}><Bulb /></Pop>
        <Label t={t} at={a('skill')} x={960} y={360} text="MONEY IS A SKILL" size={110} />
        <Pill t={t} at={a('Earn')} x={500} y={560} text="EARN MORE" bg={C.cash} size={56} />
        <Pill t={t} at={a('lifestyle')} x={960} y={560} text="LIVE SMALL" bg={C.navy} size={56} />
        <Pill t={t} at={a('assets')} x={1440} y={560} text="OWN ASSETS" bg={C.terra} size={56} />
        <Label t={t} at={a('today')} x={960} y={740} text="START TODAY" size={96} color={C.paper} />
        <Pop t={t} at={a('comments')} x={960} y={880} s={1}><Bubble2 t={t} at={a('comments')} x={0} y={0} text="Which one hit hardest?" w={560} /></Pop>
      </g>
    )],
  ]},
];

// ---------- one-off helpers used above ----------
const Bubble2: React.FC<{t: number; at: number; x: number; y: number; text: string; w?: number}> = ({t, at, x, y, text, w = 420}) => (
  <Pop t={t} at={at} x={x} y={y}><path d={`M${-w / 2},-70 H${w / 2} Q${w / 2 + 20},-70 ${w / 2 + 20},-50 V50 Q${w / 2 + 20},70 ${w / 2},70 H-40 L-90,120 L-80,70 H${-w / 2} Q${-w / 2 - 20},70 ${-w / 2 - 20},50 V-50 Q${-w / 2 - 20},-70 ${-w / 2},-70 Z`} fill="#fff" stroke={C.ink} strokeWidth={6} />
    <Txt x={0} y={2} size={48} weight={600}>{text}</Txt></Pop>
);
const Gauge: React.FC<{v: number}> = ({v}) => (
  <g stroke={C.ink} strokeWidth={6}><path d="M-160,0 A160,160 0 0,1 160,0 Z" fill="#fff" /><path d="M-160,0 A160,160 0 0,1 -113,-113 L0,0 Z" fill={C.red} opacity={0.4} />
    <line x1={0} y1={0} x2={Math.cos(Math.PI * (1 - v)) * 140} y2={-Math.sin(Math.PI * (1 - v)) * 140} strokeWidth={10} /><circle r={16} fill={C.ink} /></g>
);
const GiftBox: React.FC = () => (
  <g stroke={C.ink} strokeWidth={6}><rect x={-120} y={-60} width={240} height={180} fill={C.terra} /><rect x={-140} y={-110} width={280} height={60} fill={C.red} />
    <rect x={-20} y={-110} width={40} height={230} fill={C.mustard} /><path d="M0,-110 Q-80,-190 -60,-110 Z M0,-110 Q80,-190 60,-110 Z" fill={C.mustard} /></g>
);
const Boat: React.FC = () => (
  <g stroke={C.ink} strokeWidth={6}><path d="M-160,0 L160,0 L110,70 L-110,70 Z" fill={C.terra} /><line x1={0} y1={0} x2={0} y2={-200} /><path d="M6,-190 L130,-30 L6,-30 Z" fill="#fff" /></g>
);
const Mountain: React.FC = () => (
  <g stroke={C.ink} strokeWidth={6}><path d="M-340,300 L-60,-150 L40,0 L120,-80 L360,300 Z" fill="#B7A58A" /><path d="M-130,-40 L-60,-150 L10,-50 L-30,-20 L-70,-60 Z" fill="#fff" /></g>
);
const Tangle: React.FC<{t: number}> = ({t}) => (
  <g fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round">{Array.from({length: 6}).map((_, i) => <path key={i} d={`M${-220 + i * 20},${-120 + i * 30} C${-60},${-260 + i * 50} ${80 + Math.sin(t + i) * 30},${200 - i * 60} ${220 - i * 25},${-60 + i * 35}`} stroke={i % 2 ? C.terra : C.ink} />)}
    <rect x={-120} y={-60} width={240} height={120} rx={14} fill="#fff" stroke={C.ink} strokeWidth={6} /><Txt x={0} y={4} size={44} weight={700}>FUND X-9</Txt></g>
);
const NewsPaper: React.FC = () => (
  <g stroke={C.ink} strokeWidth={6}><rect x={-200} y={-150} width={400} height={300} fill="#fff" /><Txt x={0} y={-90} size={52} weight={700} color={C.red}>CRASH!!</Txt>
    {[0, 1, 2, 3].map((i) => <line key={i} x1={-160} y1={-20 + i * 40} x2={160} y2={-20 + i * 40} strokeWidth={8} stroke={C.grey} />)}</g>
);
const Shield: React.FC = () => (
  <g stroke={C.ink} strokeWidth={6}><path d="M0,-160 L140,-110 Q140,80 0,160 Q-140,80 -140,-110 Z" fill={C.navy} /><path d="M0,-110 L90,-78 Q90,50 0,108 Z" fill="#fff" opacity={0.25} /><Txt x={0} y={10} size={90} weight={700} color={C.mustard}>$</Txt></g>
);
const CashPile: React.FC = () => (
  <g>{Array.from({length: 9}).map((_, i) => <g key={i} transform={`translate(${((i % 3) - 1) * 150},${-Math.floor(i / 3) * 70}) rotate(${(i % 2 ? 4 : -4)})`}><Cash /></g>)}</g>
);
const Seesaw0: React.FC<P> = ({t, a}) => {
  const tilt = ramp(t, a('skill'), a('skill') + 1.2, 0, 1);
  return <g><Room />
    <g transform="translate(960,830)"><Seesaw tilt={tilt} w={1300}
      left={<g transform="translate(0,-120)"><Pop t={t} at={a('index')} x={0} y={0} s={1}><LineChart t={t} t0={a('index')} t1={a('index') + 1} pts={[0.5, 0.48, 0.45, 0.42]} x={-140} y={-100} w={280} h={160} color={C.grey} /></Pop></g>}
      right={<g transform="translate(0,-160)"><Pop t={t} at={a('skill')} x={0} y={0} s={1.2}><Lift><GradCap /></Lift></Pop></g>} /></g>
    <Pill t={t} at={a('seventy')} x={420} y={200} text="+$70 / YEAR" bg={C.grey} size={60} />
    <Pill t={t} at={a('sales')} x={1500} y={160} text="SALES · CODING · DESIGN" bg={C.navy} size={46} />
    <Pill t={t} at={a('every', a('income'))} x={1500} y={280} text="+$$$ EVERY YEAR" bg={C.cash} size={60} />
  </g>;
};

// ================= INTRO =================
const Intro1: React.FC<P> = ({t, a}) => (
  <g><Card color={C.navy} />
    {Array.from({length: 30}).map((_, i) => <Pop key={i} t={t} at={0.1 + i * 0.05} x={160 + (i % 10) * 177} y={170 + Math.floor(i / 10) * 140} s={0.9}><Coin /></Pop>)}
    <Label t={t} at={a('truths')} x={960} y={640} text="30 MONEY TRUTHS" size={140} color={C.mustard} />
    <Label t={t} at={a('20')} x={960} y={800} text="I WISH I KNEW AT 20" size={90} color={C.paper} />
  </g>
);
const Intro2: React.FC<P> = ({t, a}) => (
  <g><Room />
    <Sam t={t} x={560} y={830} s={1.15} mood={t > a('sting') ? 'o' : 'smile'} armL={up(t, a('sting'))} />
    <Pill t={t} at={a('sting')} x={1300} y={280} text="SOME WILL STING" bg={C.red} size={60} />
    <Pill t={t} at={a('save')} x={1300} y={440} text="SOME SAVE 10 YEARS" bg={C.cash} size={60} />
    <Pill t={t} at={a('big')} x={1300} y={600} text="BIGGEST ONES FIRST" bg={C.navy} size={60} />
  </g>
);

// ================= assemble =================
const mk = (from: number, to: number, Comp: React.FC<P>): Scene => ({from, to, C: ({t}) => <Comp t={t} a={(w, after) => find(w, after ?? from)} />});
const build = (): Scene[] => {
  const out: Scene[] = [];
  const s0 = STARTS[0];
  const introSplit = find('Some', 0) - 0.2;
  out.push(mk(0, introSplit, Intro1), mk(introSplit, s0 - 0.15, Intro2));
  TRUTHS.forEach((tr, i) => {
    const start = STARTS[i] - 0.15;
    const end = i + 1 < TRUTHS.length ? STARTS[i + 1] - 0.15 : TRUTHS_SEC;
    let cursor = STARTS[i] + 1.2;
    const cuts = tr.parts.map(([w]) => { const tm = find(w, cursor) - 0.15; cursor = tm + 0.5; return tm; });
    const at = STARTS[i];
    out.push({from: start, to: cuts[0], C: ({t}) => <TruthCard t={t} i={i} at={at} lines={tr.lines} />});
    tr.parts.forEach(([, Comp], k) => out.push(mk(cuts[k], k + 1 < cuts.length ? cuts[k + 1] : end, Comp)));
  });
  return out;
};
export const TRUTH_SCENES = build();

// SFX: swell on truth cards, whoosh on scene cuts, ding on money words (min gap 0.9 s)
const SFX = (() => {
  const ev: [number, string, number][] = [];
  TRUTH_SCENES.forEach((sc, i) => { if (i) ev.push([sc.from, 'whoosh', 0.22]); });
  STARTS.forEach((tm) => ev.push([tm + 0.05, 'swell_hit', 0.35]));
  WORDS.forEach(([w, tm]) => { if (/^(millionaire|rich|wealth|thousands|fortune|win|yes)/.test(norm(w))) ev.push([tm, 'ding', 0.25]); });
  ev.sort((x, y) => x[0] - y[0]);
  const out: [number, string, number][] = [];
  for (const e of ev) if (!out.length || e[0] - out[out.length - 1][0] > 0.9 || e[1] === 'swell_hit') out.push(e);
  return out;
})();

export const MoneyTruths: React.FC = () => <PaperStage job="jobs/money-truths" sec={TRUTHS_SEC} scenes={TRUTH_SCENES} sfx={SFX} depth />;
