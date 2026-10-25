// "Basic Economics You Need to Understand Before Turning 18" (5 min, 16:9). Original narration, George voice.
// Scene times are absolute seconds from public/jobs/basic-economics/words.txt.
import React from 'react';
import {
  C, ramp, pop, Pop, Txt, XMark, Person, House, Cash, Bill, Clipboard, Coin, Sparkle, Bubble, Arrow, PaperStage, type Scene,
  Rat, CoffeeCup, PriceTag, Sneaker, Phone, Book, Clock, Stall, BigArrow, Plant, Chair, Envelope, Briefcase, Dumbbell, Bed,
  Blocks, Battery, GradCap, Gavel, Laptop, Pot, Carrot, CalendarPage, Doc, StormCloud, Bulb, Gear, Scissors, Shelf, Heart,
  Signpost, Floor, NumberCard, TakeawayCard,
} from './kit';
import {SFX} from './basicEconomicsSfx';

export const ECON_SEC = 291.7;
type T = {t: number};

// recurring cast (original designs from the kit rig)
const Sam = (p: Omit<React.ComponentProps<typeof Person>, 'cap' | 'stripe'>) => <Person cap stripe {...p} />;
const Maya = (p: React.ComponentProps<typeof Person>) => <Person shirt={C.sage} hair={C.terra} {...p} />;
const Leo = (p: React.ComponentProps<typeof Person>) => <Person shirt={C.navy} hair={C.ink} {...p} />;
const Mayor = (p: React.ComponentProps<typeof Person>) => <Person kind="adult" tie stache shirt={C.navy} hair={C.grey} {...p} />;
const wave = (t: number) => -150 + Math.sin(t * 14) * 18;
const Fly: React.FC<{t: number; at: number; x0: number; y0: number; x1: number; y1: number; dur?: number; children: React.ReactNode}> = ({t, at, x0, y0, x1, y1, dur = 0.6, children}) => {
  const p = ramp(t, at, at + dur);
  if (p <= 0) return null;
  return <g transform={`translate(${x0 + (x1 - x0) * p},${y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * 200})`}>{children}</g>;
};
const Label: React.FC<{t: number; at: number; x: number; y: number; text: string; color?: string; size?: number; r?: number}> = ({t, at, x, y, text, color = C.ink, size = 64, r = 0}) => (
  <Pop t={t} at={at} x={x} y={y} r={r}><Txt x={0} y={0} size={size} color={color} weight={700}>{text}</Txt></Pop>
);
const Stamp: React.FC<{t: number; at: number; x: number; y: number; text: string; color?: string; size?: number}> = ({t, at, x, y, text, color = C.red, size = 90}) => (
  <Pop t={t} at={at} x={x} y={y} r={-6}>
    <rect x={-text.length * size * 0.36 - 30} y={-size * 0.7} width={text.length * size * 0.72 + 60} height={size * 1.4} rx={16} fill="none" stroke={color} strokeWidth={10} />
    <Txt x={0} y={4} size={size} color={color} weight={700}>{text}</Txt>
  </Pop>
);

// ================= HOOK =================
const H1: React.FC<T> = ({t}) => (
  <g><Floor />
    <Sam t={t} x={960} y={920} s={1.15} mood={t > 5.4 ? 'o' : 'smile'} armL={t > 2 ? 40 : 10} armR={t > 2 ? -40 : -10} />
    <Fly t={t} at={2.0} x0={-200} y0={300} x1={480} y1={380}><Doc title="BILL" color="#FBE3D6" /></Fly>
    <Fly t={t} at={2.9} x0={2100} y0={300} x1={1440} y1={380}><Doc title="CONTRACT" /></Fly>
    <Pop t={t} at={4.0} x={960} y={230}><Signpost s={0.8} a="THIS" b="THAT" /></Pop>
    {t > 5.4 && <Pop t={t} at={6.2} x={1580} y={760}><Book s={1.1} /><Txt x={0} y={-90} size={40} weight={700}>RULEBOOK</Txt></Pop>}
    <XMark t={t} at={6.6} x={1580} y={740} size={100} />
  </g>
);
const H2: React.FC<T> = ({t}) => (
  <g><Floor bg={C.sage} ground={C.sage} />
    <Pop t={t} at={9.2} x={960} y={300}><Txt x={0} y={0} size={150} color={C.paper} weight={700}>ECONOMICS</Txt></Pop>
    <Label t={t} at={10.8} x={960} y={450} text="explains almost everything" color={C.paper} size={60} />
    <Pop t={t} at={12.6} x={760} y={760}><Phone s={1.4} glow /></Pop>
    <Pop t={t} at={13.0} x={1100} y={700}><PriceTag label="$999" /></Pop>
  </g>
);
const H3: React.FC<T> = ({t}) => (
  <g><Floor ground={C.ground} />
    <Pop t={t} at={15.1} x={560} y={860}><House x={0} y={0} body="#CFD8C0" roof={C.terra} /></Pop>
    <Pop t={t} at={15.5} x={560} y={330}><BigArrow up s={0.8} /></Pop>
    <Pop t={t} at={16.4} x={1360} y={860}><House x={0} y={0} body={C.grey} roof={C.dirt} />
      <rect x={-100} y={-210} width={200} height={70} rx={8} fill={C.red} stroke={C.ink} strokeWidth={5} /><Txt x={0} y={-174} size={44} color="#fff" weight={700}>CLOSED</Txt></Pop>
    <Pop t={t} at={18.2} x={960} y={300}><Clipboard /></Pop>
    <XMark t={t} at={18.8} x={960} y={300} size={100} />
  </g>
);
const H4: React.FC<T> = ({t}) => (
  <g><Floor />
    <Pop t={t} at={20.6} x={960} y={250}><GradCap s={1.1} /></Pop>
    <XMark t={t} at={20.9} x={960} y={250} size={120} />
    {[0, 1, 2, 3].map((i) => (
      <Pop key={i} t={t} at={22.0 + i * 0.12} x={420 + i * 360} y={640}>
        <rect x={-130} y={-150} width={260} height={300} rx={20} fill={[C.terra, C.sage, C.navy, C.mustard][i]} stroke={C.ink} strokeWidth={7} />
        <Txt x={0} y={0} size={150} color={C.paper} weight={700}>{i + 1}</Txt>
      </Pop>
    ))}
    {t > 25.6 && [0, 1, 2].map((i) => <path key={i} d={`M${420 + i * 360},480 Q${600 + i * 360},${380 - (i % 2) * 60} ${780 + i * 360},480`} fill="none" stroke={C.ink} strokeWidth={6} strokeDasharray="14 10" opacity={ramp(t, 25.6 + i * 0.2, 26.0 + i * 0.2)} />)}
    <Label t={t} at={25.8} x={960} y={900} text="the hidden wires" color={C.terra} size={70} />
  </g>
);
const H5: React.FC<T> = ({t}) => (
  <g><Floor bg={C.terra} ground={C.terra} />
    <Sam t={t} x={960} y={1000} s={1.5} mood="grin" armR={wave(t)} />
    <Label t={t} at={28.0} x={960} y={200} text="LET'S GO" color={C.paper} size={140} />
  </g>
);

// ================= #1 REWARDS =================
const A1: React.FC<T> = ({t}) => (
  <g><NumberCard t={t} bg={C.terra} num="#1" at={29.95} lines={[[31.1, 'People respond to REWARDS'], [33.0, 'not intentions']]} />
    <XMark t={t} at={33.6} x={960} y={730} size={80} /></g>
);
const A2: React.FC<T> = ({t}) => (
  <g><Floor ground={C.ground} />
    {[[200, '#E7C9A2', C.sage], [1720, '#CFD8C0', C.terra]].map(([x, b, r], i) => <House key={i} x={x as number} y={860} body={b as string} roof={r as string} />)}
    {[0, 1, 2, 3, 4].map((i) => <Pop key={i} t={t} at={35.7 + i * 0.1} x={500 + i * 120} y={900 - (i % 2) * 20}><Rat s={0.7} t={t + i} /></Pop>)}
    <Mayor t={t} x={1300} y={920} armR={t > 38.6 ? -130 : -10} mood="flat" />
    <Pop t={t} at={38.7} x={1300} y={240}><rect x={-300} y={-100} width={600} height={200} rx={14} fill="#fff" stroke={C.ink} strokeWidth={7} />
      <Txt x={0} y={-40} size={52} weight={700}>1 RAT TAIL</Txt><Txt x={0} y={40} size={66} color={C.cashD} weight={700}>= $1</Txt></Pop>
  </g>
);
const A3: React.FC<T> = ({t}) => (
  <g><Floor />
    <Pop t={t} at={41.6} x={400} y={300}><Heart s={1.2} /></Pop><Label t={t} at={41.8} x={400} y={430} text="great intention" color={C.terra} size={54} />
    <Pop t={t} at={43.9} x={1150} y={860}>
      <rect x={-300} y={-300} width={600} height={300} fill="#D9B27C" stroke={C.ink} strokeWidth={7} />
      <rect x={-260} y={-380} width={520} height={80} rx={10} fill={C.red} stroke={C.ink} strokeWidth={6} /><Txt x={0} y={-338} size={52} color="#fff" weight={700}>RAT FARM</Txt>
    </Pop>
    {Array.from({length: 8}).map((_, i) => <Pop key={i} t={t} at={44.3 + i * 0.12} x={900 + (i % 4) * 160} y={i < 4 ? 680 : 800}><Rat s={0.55} t={t + i} /></Pop>)}
    {[0, 1, 2].map((i) => <Fly key={i} t={t} at={45.9 + i * 0.15} x0={1150} y0={600} x1={400 + i * 80} y1={760}><Bill label="$1" w={120} /></Fly>)}
  </g>
);
const A4: React.FC<T> = ({t}) => {
  const h1 = 180, h2 = ramp(t, 48.4, 49.4, 180, 520);
  return (
    <g><Floor />
      <line x1={260} y1={860} x2={1000} y2={860} stroke={C.ink} strokeWidth={7} />
      <rect x={340} y={860 - h1} width={220} height={h1} fill={C.grey} stroke={C.ink} strokeWidth={6} />
      <rect x={680} y={860 - h2} width={220} height={h2} fill={C.red} stroke={C.ink} strokeWidth={6} />
      <Txt x={450} y={920} size={44}>before</Txt><Txt x={790} y={920} size={44}>after</Txt>
      <Pop t={t} at={48.7} x={790} y={260}><Rat s={1} t={t} /></Pop>
      <Mayor t={t} x={1450} y={920} mood={t > 48.5 ? 'o' : 'flat'} armL={t > 48.5 ? 150 : 10} armR={t > 48.5 ? -150 : -10} />
      <Pop t={t} at={50.5} x={1450} y={180}><rect x={-300} y={-60} width={600} height={120} rx={14} fill="#fff" stroke={C.ink} strokeWidth={6} /><Txt x={0} y={4} size={46}>wanted: fewer rats</Txt></Pop>
      <Pop t={t} at={53.3} x={1450} y={320}><rect x={-300} y={-60} width={600} height={120} rx={14} fill={C.red} stroke={C.ink} strokeWidth={6} /><Txt x={0} y={4} size={46} color="#fff" weight={700}>rewarded: rat tails</Txt></Pop>
    </g>
  );
};
const A5: React.FC<T> = ({t}) => (
  <g><Floor bg={C.sage} ground={C.sage} /><Label t={t} at={55.6} x={960} y={540} text="This happens EVERYWHERE" color={C.paper} size={100} /></g>
);
const A6: React.FC<T> = ({t}) => (
  <g><Floor ground={C.ground} />
    <rect x={700} y={700} width={520} height={30} fill={C.dirt} stroke={C.ink} strokeWidth={6} /><rect x={740} y={730} width={20} height={150} fill={C.dirt} /><rect x={1160} y={730} width={20} height={150} fill={C.dirt} />
    <Person t={t} x={960} y={880} shirt={C.mustard} hair={C.dirt} mood={t > 62 ? 'flat' : 'smile'} armL={-30} armR={30} />
    <g transform="translate(960,680)"><Book s={0.9} /></g>
    <Pop t={t} at={59.2} x={400} y={300}><Clock t={t} speed={3} s={1.3} /></Pop>
    <Label t={t} at={59.5} x={1500} y={260} text="hours  ✓" color={C.cashD} size={80} />
    <Label t={t} at={62.6} x={1500} y={400} text="learning" color={C.ink} size={80} />
    <XMark t={t} at={62.8} x={1500} y={400} size={90} />
  </g>
);
const A7: React.FC<T> = ({t}) => (
  <g><Floor />
    <Person t={t} kind="adult" x={560} y={920} shirt={C.grey} hair={C.ink} armL={-40} armR={40} mood="flat" />
    <g transform="translate(560,760)"><Laptop lines={ramp(t, 64.5, 68, 2, 8)} /></g>
    <Pop t={t} at={64.8} x={1150} y={200}><PriceTag label="$ / line" color={C.cash} /></Pop>
    <g transform="translate(1250,330)">{Array.from({length: Math.floor(ramp(t, 66, 68.2, 0, 14))}).map((_, i) => <rect key={i} x={(i % 3) * 20} y={i * 34} width={200 + ((i * 53) % 160)} height={20} rx={8} fill={[C.terra, C.sage, C.navy][i % 3]} />)}</g>
    <Label t={t} at={67.6} x={1700} y={400} text="longer ✓" color={C.cashD} />
    <Label t={t} at={68.4} x={1700} y={560} text="better" />
    <XMark t={t} at={68.6} x={1700} y={560} size={80} />
  </g>
);
const A8: React.FC<T> = ({t}) => {
  const coinX = 1600;
  return (
    <g><Floor ground={C.ground} />
      <line x1={coinX} y1={0} x2={coinX} y2={420} stroke={C.ink} strokeWidth={5} />
      <g transform={`translate(${coinX},${470 + Math.sin(t * 3) * 14}) scale(2.4)`}><Coin /></g>
      {[0, 1, 2].map((i) => <Person key={i} t={t + i} kind={i === 1 ? 'kid' : 'adult'} x={300 + i * 330 + (t - 69.9) * 50} y={920} s={0.8} shirt={[C.terra, C.mustard, C.navy][i]} hair={[C.ink, C.dirt, C.grey][i]} walk={t * 1.4 + i * 0.3} armR={-70} mood="smile" />)}
      <Label t={t} at={70.3} x={700} y={200} text="not evil" color={C.terra} />
      <Label t={t} at={71.5} x={700} y={320} text="just following the reward" size={54} />
    </g>
  );
};
const A9: React.FC<T> = ({t}) => (
  <g><Floor />
    <Label t={t} at={73.2} x={960} y={150} text="Even you." color={C.terra} size={90} />
    <Sam t={t} x={700} y={920} s={1.1} mood={t > 79.7 ? 'flat' : 'smile'} armR={t > 75.8 ? -60 : -10} handR={t > 75.8 ? <g transform={`scale(${pop(t, 75.8)})`}><Phone s={0.7} glow /></g> : null} />
    <Pop t={t} at={76.5} x={1350} y={450}><Clock t={t} s={1.1} /><Txt x={0} y={140} size={60} weight={700}>5 min</Txt></Pop>
    <Stamp t={t} at={80.0} x={1350} y={800} text="5-MIN SESSIONS" size={58} />
  </g>
);
const A10: React.FC<T> = ({t}) => (
  <g><TakeawayCard t={t} at={82.5} lines={[[83.6, "Don't ask: what do I want?"], [86.1, 'Ask: what am I REWARDING?', C.terra]]} />
    <XMark t={t} at={85.4} x={960} y={560} size={60} /></g>
);

// ================= #2 TRADE-OFFS =================
const B1: React.FC<T> = ({t}) => <NumberCard t={t} bg={C.sage} num="#2" at={89.4} lines={[[90.6, 'Every choice'], [91.4, 'has a cost']]} />;
const B2: React.FC<T> = ({t}) => (
  <g><Floor ground={C.ground} />
    <Sam t={t} x={960} y={920} s={1.05} mood="smile" armL={t > 97 ? 60 : 10} armR={t > 100 ? -60 : -10}
      handL={t > 93.6 && t < 96.5 ? <Bill label="$50" w={160} /> : null} />
    <Pop t={t} at={94.7} x={1500} y={300}><CalendarPage label="SAT" /></Pop>
    <Pop t={t} at={97.1} x={420} y={620}><Sneaker s={1.3} /><Txt x={0} y={-110} size={52} weight={700}>sneakers</Txt></Pop>
    <Label t={t} at={98.4} x={960} y={300} text="OR" color={C.terra} size={110} />
    <Pop t={t} at={100.3} x={1500} y={680}><Laptop s={0.9} lines={4} /><path d="M-24,-100 L30,-70 L-24,-40 Z" fill="#fff" /><Txt x={0} y={90} size={44} weight={700}>video editing</Txt></Pop>
  </g>
);
const B3: React.FC<T> = ({t}) => (
  <g><Floor />
    <Label t={t} at={103.2} x={960} y={150} text="what most people miss" color={C.terra} />
    <g transform="translate(700,560)"><Sneaker s={1.8} /></g>
    <Pop t={t} at={106.6} x={700} y={330}><PriceTag label="$50" s={1.2} /></Pop>
    <Pop t={t} at={108.5} x={1350} y={560}><Txt x={-200} y={0} size={140} weight={700}>+</Txt>
      <g opacity={0.55}><Laptop s={0.8} lines={4} /></g><Txt x={0} y={110} size={48} weight={700} color={C.terra}>the skill you skipped</Txt></Pop>
  </g>
);
const B4: React.FC<T> = ({t}) => (
  <g><Floor bg={C.navy} ground={C.navy} />
    <Pop t={t} at={111.1} x={960} y={360}><PriceTag label="???" s={2} color={C.terra} /></Pop>
    <Label t={t} at={112.4} x={960} y={700} text="OPPORTUNITY COST" color={C.mustard} size={120} />
  </g>
);
const B5: React.FC<T> = ({t}) => (
  <g><Floor />
    <Pop t={t} at={114.4} x={300} y={260}><Clock t={t} speed={2} /></Pop>
    <Sam t={t} x={560} y={900} armR={-60} mood="flat" handR={<Phone s={0.6} glow />} />
    <Label t={t} at={117.5} x={560} y={180} text="3 hours scrolling" size={56} />
    <Label t={t} at={118.3} x={560} y={290} text="free?" color={C.terra} size={70} />
    <XMark t={t} at={118.6} x={560} y={290} size={60} />
    <Pop t={t} at={120.5} x={1200} y={330}><Dumbbell /></Pop><Label t={t} at={120.6} x={1200} y={460} text="gym" size={50} />
    <Pop t={t} at={121.1} x={1560} y={330}><Bed s={0.8} /></Pop><Label t={t} at={121.2} x={1560} y={460} text="sleep" size={50} />
    <Pop t={t} at={121.8} x={1380} y={680}><Blocks s={1.2} /></Pop><Label t={t} at={121.9} x={1380} y={800} text="building" size={50} />
  </g>
);
const B6: React.FC<T> = ({t}) => {
  const tilt = ramp(t, 126.8, 127.6, 0, 1) * Math.sin(t * 3) * 10;
  return (
    <g><Floor ground={C.ground} />
      <Label t={t} at={123.9} x={600} y={250} text="YES" color={C.cashD} size={150} />
      <Label t={t} at={124.6} x={1320} y={250} text="NO" color={C.red} size={150} />
      <Arrow t={t} a={124.2} x1={760} x2={1180} y={260} lift={120} />
      <Pop t={t} at={127.1} x={960} y={860}>
        <path d="M-60,0 L0,-120 L60,0 Z" fill={C.dirt} stroke={C.ink} strokeWidth={6} />
        <g transform={`translate(0,-120) rotate(${tilt})`}><rect x={-420} y={-14} width={840} height={28} rx={10} fill={C.mustard} stroke={C.ink} strokeWidth={6} />
          <g transform="translate(-340,-60) scale(0.6)"><Sneaker /></g><g transform="translate(340,-20) scale(0.4)"><Laptop /></g></g>
      </Pop>
      <Label t={t} at={128.9} x={960} y={500} text="choose on purpose" color={C.terra} size={70} />
    </g>
  );
};
const B7: React.FC<T> = ({t}) => (
  <g><Floor />
    <Pop t={t} at={131.4} x={500} y={360}><Cash w={200} /></Pop>
    <Pop t={t} at={132.1} x={960} y={360}><Clock t={t} /></Pop>
    <Pop t={t} at={132.7} x={1420} y={360}><Battery level={0.8} /></Pop>
    <Pop t={t} at={135.3} x={960} y={720}><Bubble w={1100} h={180}><Txt x={0} y={4} size={70} weight={700}>What am I giving up?</Txt></Bubble></Pop>
  </g>
);
const B8: React.FC<T> = ({t}) => (
  <g><Floor ground={C.ground} />
    <Sam t={t} x={700} y={920} s={1.1} mood="grin" armR={-120} handR={<Sneaker s={0.5} />} />
    <Label t={t} at={139.9} x={700} y={160} text="worth it? great." color={C.cashD} size={70} />
    <Pop t={t} at={143.4} x={1350} y={500}><rect x={-330} y={-150} width={660} height={300} rx={20} fill="#fff" stroke={C.ink} strokeWidth={7} />
      <Txt x={0} y={-80} size={50} weight={700} color={C.terra}>REAL PRICE</Txt><Txt x={0} y={10} size={64} weight={700}>$50</Txt><Txt x={0} y={90} size={44}>+ the skill you skipped</Txt></Pop>
    <Sparkle t={t} at={141.2} x={900} y={500} />
  </g>
);

// ================= #3 PRICES =================
const D1: React.FC<T> = ({t}) => (
  <g><NumberCard t={t} bg={C.navy} num="#3" at={145.5} lines={[[146.6, 'Prices are messages']]} />
    <Pop t={t} at={147.4} x={960} y={880}><Envelope s={0.9} /></Pop></g>
);
const D2: React.FC<T> = ({t}) => {
  const wilt = ramp(t, 149.6, 150.6);
  return (
    <g><Floor ground={C.dirt} y={800} />
      <Pop t={t} at={149.3} x={960} y={220}><StormCloud t={t} s={1.3} /></Pop>
      {Array.from({length: 7}).map((_, i) => <g key={i} transform={`translate(${200 + i * 250},800) rotate(${i % 2 ? wilt * 40 : -wilt * 40})`}><Plant g={1 - wilt * 0.6} /></g>)}
      <Label t={t} at={151.1} x={960} y={950} text="half the coffee farms" color={C.paper} size={60} />
    </g>
  );
};
const D3: React.FC<T> = ({t}) => (
  <g><Floor />
    <Pop t={t} at={152.6} x={560} y={540}><rect x={-260} y={-30} width={520} height={40} fill={C.dirt} stroke={C.ink} strokeWidth={6} />
      {[-180, 0, 180].map((x) => <g key={x} transform={`translate(${x},120) scale(0.6)`}><Chair /></g>)}<Txt x={0} y={-120} size={52} weight={700}>meeting</Txt></Pop>
    <XMark t={t} at={153.4} x={560} y={540} size={140} />
    <Pop t={t} at={154.6} x={1360} y={480}><Envelope s={1.3} /><Txt x={0} y={150} size={44} weight={700}>to: 1,000,000,000</Txt></Pop>
    <XMark t={t} at={155.9} x={1360} y={480} size={140} />
  </g>
);
const D4: React.FC<T> = ({t}) => {
  const up = t > 159.2;
  return (
    <g><Floor ground={C.ground} />
      <g transform="translate(760,640)"><CoffeeCup s={2} t={t} /></g>
      <Pop t={t} at={157.4} x={1300} y={420}><PriceTag label={up ? '$6' : '$3'} s={1.5} color={up ? C.terra : C.mustard} /></Pop>
      <Pop t={t} at={159.2} x={1300} y={700}><BigArrow up s={0.9} /></Pop>
      <Label t={t} at={157.7} x={760} y={180} text="within weeks…" size={60} />
    </g>
  );
};
const D5: React.FC<T> = ({t}) => {
  const morph = ramp(t, 161.5, 162.0);
  return (
    <g><Floor />
      <g transform="translate(400,420)"><g opacity={1 - morph}><PriceTag label="$6" s={1.3} color={C.terra} /></g><g opacity={morph} transform={`scale(${0.6 + morph * 0.4})`}><Envelope /></g></g>
      <Person t={t} kind="adult" x={1250} y={920} shirt={C.terra} hair={C.dirt} armR={-60} mood={t > 166 ? 'o' : 'smile'} handR={<CoffeeCup s={0.45} t={t} />} />
      <Pop t={t} at={164.6} x={1300} y={170}><Bubble w={500} h={150}><Txt x={0} y={4} size={60} weight={700}>go easy…</Txt></Bubble></Pop>
      <Label t={t} at={166.0} x={1700} y={420} text="scarce!" color={C.red} size={70} r={8} />
    </g>
  );
};
const D6: React.FC<T> = ({t}) => (
  <g><Floor ground={C.dirt} y={820} />
    <Person t={t} kind="adult" x={400} y={900} shirt={C.sage} hair={C.mustard} armR={-50} mood="grin" />
    {Array.from({length: 6}).map((_, i) => <g key={i} transform={`translate(${750 + i * 190},820)`}><Plant g={ramp(t, 170.1 + i * 0.12, 171 + i * 0.12)} /></g>)}
    <Label t={t} at={170.2} x={1220} y={250} text="plant more" color={C.cashD} size={80} />
    {[0, 1, 2].map((i) => <Fly key={i} t={t} at={171.6 + i * 0.15} x0={1400} y0={200} x1={420 + i * 40} y1={500}><Coin /></Fly>)}
  </g>
);
const D7: React.FC<T> = ({t}) => (
  <g><Floor bg={C.sage} ground={C.sage} />
    <Person t={t} kind="adult" x={700} y={960} shirt="#fff" hair={C.grey} armR={-150} mood="o" />
    <Pop t={t} at={173.2} x={700} y={180}><Bulb s={0.9} /></Pop>
    <g transform="translate(1250,450)"><Gear t={t} s={1.3} /></g><g transform="translate(1440,620)"><Gear t={-t} s={0.8} /></g>
    <Label t={t} at={175.0} x={1350} y={850} text="a cheaper way" color={C.paper} size={70} />
  </g>
);
const D8: React.FC<T> = ({t}) => (
  <g><Floor />
    <Pop t={t} at={177.0} x={960} y={540}><PriceTag label="$6" s={1.3} color={C.terra} /></Pop>
    {Array.from({length: 12}).map((_, i) => {
      const a = (i / 12) * Math.PI * 2, r = 420;
      const x = 960 + Math.cos(a) * r * 1.6, y = 560 + Math.sin(a) * r * 0.85;
      return <Pop key={i} t={t} at={177.9 + i * 0.05} x={x} y={y + 110}><Person t={t + i} x={0} y={0} s={0.35} kind={i % 3 ? 'adult' : 'kid'} shirt={[C.terra, C.sage, C.navy, C.mustard][i % 4]} hair={[C.ink, C.dirt][i % 2]} armR={t > 178.9 ? -60 + Math.sin(t * 5 + i) * 30 : -10} /></Pop>;
    })}
    <Label t={t} at={180.0} x={960} y={720} text="no one in charge" color={C.terra} size={56} />
  </g>
);
const D9: React.FC<T> = ({t}) => {
  const erase = ramp(t, 186.9, 187.6);
  return (
    <g><Floor bg="#DDEBEE" ground="#DDEBEE" />
      <Pop t={t} at={182.9} x={500} y={480}><Gavel s={1.2} /></Pop>
      <Pop t={t} at={183.2} x={1250} y={420}><rect x={-230} y={-130} width={460} height={260} rx={30} fill="#BFE0EE" stroke={C.ink} strokeWidth={7} opacity={0.9} />
        <g transform="scale(1.2)"><PriceTag label="$3" /></g></Pop>
      <Label t={t} at={184.9} x={1250} y={680} text="FROZEN" color={C.navy} size={90} />
      <g transform="translate(1250,880)" opacity={1 - erase}><Envelope s={0.8} /></g>
      <Label t={t} at={187.1} x={1600} y={880} text="erased" color={C.red} size={60} />
    </g>
  );
};
const D10: React.FC<T> = ({t}) => (
  <g><Floor ground={C.ground} />
    <g transform="translate(620,820)"><Shelf items={Math.round(ramp(t, 189, 191.2, 8, 0))} /></g>
    <Stamp t={t} at={191.3} x={620} y={360} text="EMPTY" />
    <Person t={t} kind="adult" x={1400} y={920} shirt={C.sage} hair={C.mustard} armL={50} armR={-50} mood="flat" />
    <g transform="translate(1650,880)"><Plant g={0.3} /></g>
    <XMark t={t} at={192.9} x={1650} y={800} size={70} />
  </g>
);
const D11: React.FC<T> = ({t}) => (
  <g><TakeawayCard t={t} at={195.6} lines={[[196.9, 'High prices are NOT the enemy'], [199.4, 'they are honest signals', C.terra]]} />
    <Pop t={t} at={200.6} x={560} y={950}><Txt x={0} y={0} size={50} weight={700}>supply ↓</Txt></Pop>
    <Pop t={t} at={202.0} x={1360} y={950}><Txt x={0} y={0} size={50} weight={700}>demand ↑</Txt></Pop>
    <Label t={t} at={204.0} x={960} y={950} text="LISTEN" color={C.paper} size={60} />
  </g>
);

// ================= #4 PROFITS & LOSSES =================
const E1: React.FC<T> = ({t}) => (
  <g><NumberCard t={t} bg={C.terra} num="#4" at={205.9} lines={[[206.7, 'Profits & losses'], [207.9, 'are DIRECTIONS']]} /></g>
);
const Market: React.FC<{t: number; leoSign?: string}> = ({t, leoSign = 'HOT SOUP'}) => (
  <g><Floor ground={C.ground} />
    <g transform={`translate(1700,180) rotate(${t * 10})`}><circle r={80} fill={C.mustard} stroke={C.ink} strokeWidth={6} />{Array.from({length: 8}).map((_, i) => <line key={i} transform={`rotate(${i * 45})`} x1={0} y1={-105} x2={0} y2={-140} stroke={C.mustard} strokeWidth={12} strokeLinecap="round" />)}</g>
    <g transform="translate(540,880)"><Stall color={C.mustard} sign="LEMONADE" /></g>
    <g transform="translate(1320,880)"><Stall color={leoSign === 'HOT SOUP' ? C.red : '#9FD3E0'} sign={leoSign} /></g>
  </g>
);
const E2: React.FC<T> = ({t}) => (
  <g><Market t={t} />
    <Pop t={t} at={212.3} x={540} y={960}><Maya t={t} x={0} y={0} s={0.8} mood="grin" armR={-150 + Math.sin(t * 6) * 10} /></Pop>
    <Label t={t} at={212.4} x={540} y={300} text="Maya" color={C.sage} size={70} />
    <Pop t={t} at={215.4} x={1320} y={960}><Leo t={t} x={0} y={0} s={0.8} mood="smile" /></Pop>
    <Label t={t} at={215.4} x={1320} y={300} text="Leo" color={C.navy} size={70} />
    <Pop t={t} at={216.2} x={1320} y={700}><g transform="scale(0.5)"><Pot t={t} /></g></Pop>
  </g>
);
const E3: React.FC<T> = ({t}) => (
  <g><Floor />
    <Maya t={t} x={500} y={920} s={1.1} mood="grin" armR={-150 + Math.sin(t * 6) * 10} />
    {Array.from({length: 6}).map((_, i) => <Pop key={i} t={t} at={218.9 + i * 0.08} x={760 + (i % 3) * 70} y={860 - Math.floor(i / 3) * 60}><Coin /></Pop>)}
    <Label t={t} at={218.9} x={500} y={160} text="PROFIT" color={C.cashD} size={100} />
    <Pop t={t} at={221.0} x={1250} y={420}><BigArrow up s={1.4} /></Pop>
    <Label t={t} at={222.4} x={1250} y={750} text="people want this" size={56} />
    <Label t={t} at={223.6} x={1250} y={850} text="do MORE of it" color={C.cashD} size={66} />
    <Pop t={t} at={225.8} x={1700} y={880}><Stall color={C.mustard} sign="LEMONADE 2" s={0.6} /></Pop>
  </g>
);
const E4: React.FC<T> = ({t}) => (
  <g><Floor />
    <Leo t={t} x={500} y={920} s={1.1} mood="flat" armL={10} armR={-10} />
    <Label t={t} at={228.1} x={500} y={160} text="LOSS" color={C.red} size={100} />
    <Pop t={t} at={229.9} x={1000} y={420}><BigArrow up={false} s={1.1} /></Pop>
    <Pop t={t} at={232.2} x={1350} y={300}><Pot s={0.8} t={t} /></Pop>
    <Pop t={t} at={233.0} x={1650} y={300}><Carrot /></Pop>
    <Pop t={t} at={234.2} x={1500} y={620}><CalendarPage label="SAT" /></Pop>
    <Label t={t} at={235.6} x={1500} y={850} text="could do something better" color={C.terra} size={54} />
  </g>
);
const E5: React.FC<T> = ({t}) => {
  const hide = ramp(t, 239.5, 240.0);
  return (
    <g><Floor ground={C.ground} />
      <g transform={`translate(0,${hide * 260})`}><Leo t={t} x={560} y={900} mood="o" /></g>
      <g transform="translate(560,900)"><Stall color={C.red} sign="HOT SOUP" s={0.9} /></g>
      <Label t={t} at={241.6} x={1350} y={300} text="FAILURE" color={C.ink} size={110} />
      <XMark t={t} at={241.9} x={1350} y={300} size={120} />
      <Stamp t={t} at={243.1} x={1350} y={640} text="INFORMATION" color={C.cashD} size={84} />
    </g>
  );
};
const E6: React.FC<T> = ({t}) => (
  <g><Market t={t} leoSign={t > 245.5 ? 'ICED TEA' : 'HOT SOUP'} />
    <Maya t={t} x={540} y={960} s={0.8} mood="grin" />
    <Leo t={t} x={1320} y={960} s={0.8} mood={t > 247.5 ? 'grin' : 'smile'} armR={t > 247.5 ? -150 : -10} />
    {[0, 1, 2].map((i) => <Sparkle key={i} t={t} at={245.6 + i * 0.1} x={1200 + i * 120} y={480} />)}
    <Pop t={t} at={247.6} x={1600} y={420}><BigArrow up s={0.6} /></Pop>
    <Label t={t} at={246.7} x={1320} y={140} text="next week: profit too" color={C.cashD} size={60} />
  </g>
);
const E7: React.FC<T> = ({t}) => (
  <g><Floor />
    <Label t={t} at={249.5} x={960} y={150} text="the WORST move" color={C.red} size={90} />
    <Label t={t} at={250.5} x={960} y={270} text="isn't losing" size={60} />
    <Person t={t} kind="adult" x={600} y={920} shirt={C.navy} hair={C.ink} armR={-110} armL={20} mood="flat" handR={t > 253 ? <Cash w={110} /> : null} />
    <ellipse cx={1150} cy={880} rx={260} ry={60} fill={C.ink} />
    {t > 253.0 && [0, 1, 2, 3, 4].map((i) => {
      const p = ((t - 253 + i * 0.25) % 1.2) / 1.2;
      return <g key={i} transform={`translate(${780 + p * 370},${700 + p * p * 180}) scale(${1 - p * 0.5})`}><Coin /></g>;
    })}
    {t > 253.8 && <g transform="translate(1150,600)"><Clock t={t} s={0.7} speed={2} /></g>}
    <Label t={t} at={251.8} x={1150} y={1000} text="ignoring the loss" color={C.paper} size={44} />
  </g>
);
const E8: React.FC<T> = ({t}) => (
  <g><TakeawayCard t={t} at={256.0} lines={[[257.3, 'Losses are as valuable as profits']]} />
    <Pop t={t} at={258.8} x={600} y={720}><BigArrow up s={0.5} /></Pop><Label t={t} at={258.9} x={960} y={720} text="=" size={120} /><Pop t={t} at={258.9} x={1320} y={720}><BigArrow up={false} s={0.5} /></Pop>
    <Pop t={t} at={260.7} x={500} y={930}><Scissors s={0.8} open={0.5 + Math.abs(Math.sin(t * 6)) * 0.5} /></Pop>
    <Pop t={t} at={262.3} x={960} y={930}><Clock t={t} s={0.6} /></Pop>
    <Pop t={t} at={263.0} x={1200} y={930}><Cash w={110} /></Pop>
    <Pop t={t} at={263.4} x={1450} y={930}><Battery s={0.7} /></Pop>
  </g>
);

// ================= OUTRO =================
const O1: React.FC<T> = ({t}) => {
  const cards: [number, string, string, React.ReactNode][] = [
    [267.5, C.terra, 'follow rewards', <Coin key="c" />],
    [270.3, C.sage, 'hidden cost', <PriceTag key="p" label="?" s={0.6} />],
    [272.2, C.navy, 'prices talk', <Envelope key="e" s={0.6} />],
    [274.2, C.mustard, 'profit & loss', <BigArrow key="b" up s={0.4} />],
  ];
  return (
    <g><Floor />
      <Label t={t} at={265.4} x={960} y={160} text="4 IDEAS" color={C.terra} size={110} />
      {cards.map(([at, col, label, icon], i) => (
        <Pop key={i} t={t} at={at} x={300 + i * 440} y={620}>
          <rect x={-190} y={-220} width={380} height={440} rx={24} fill={col} stroke={C.ink} strokeWidth={7} />
          <Txt x={0} y={-140} size={80} color={C.paper} weight={700}>{i + 1}</Txt>
          <g transform="translate(0,10)">{icon}</g>
          <Txt x={0} y={150} size={44} color={C.paper} weight={700}>{label}</Txt>
        </Pop>
      ))}
    </g>
  );
};
const O2: React.FC<T> = ({t}) => (
  <g><Floor ground={C.ground} />
    <Sam t={t} x={960} y={940} s={1.1} mood="smile" armL={40} armR={-40} />
    <Pop t={t} at={277.8} x={380} y={320}><Briefcase /></Pop><Label t={t} at={277.9} x={380} y={460} text="a job" size={50} />
    <Pop t={t} at={278.9} x={760} y={260}><Phone s={0.8} /></Pop><Label t={t} at={279.0} x={760} y={400} text="a contract" size={50} />
    <Pop t={t} at={280.5} x={1180} y={300}><Stall color={C.mustard} sign="HUSTLE" s={0.45} /></Pop><Label t={t} at={280.6} x={1180} y={400} text="a side hustle" size={50} />
    <Pop t={t} at={282.8} x={1560} y={300}><CalendarPage label="SAT" s={0.8} /></Pop><Label t={t} at={282.9} x={1560} y={440} text="a free Saturday" size={50} />
  </g>
);
const O3: React.FC<T> = ({t}) => (
  <g><Floor bg={C.terra} ground={C.terra} />
    {[0, 1, 2].map((i) => <Person key={i} t={t + i} kind="adult" x={260 + i * 220} y={960} s={0.7} shirt={[C.grey, C.navy, C.sage][i]} hair={C.ink} mood="o" />)}
    <Label t={t} at={284.6} x={480} y={330} text="most adults: never" color={C.paper} size={56} />
    <Sam t={t} x={1350} y={980} s={1.4} mood="grin" armR={t > 288.7 ? wave(t) : -40} armL={t > 286.7 ? 150 : 10} />
    <Label t={t} at={286.8} x={1350} y={180} text="YOU DID." color={C.mustard} size={120} />
    <Label t={t} at={288.8} x={960} y={520} text="now go use them" color={C.paper} size={80} />
  </g>
);

const SCENES: Scene[] = [
  {from: 0, to: 7.7, C: H1}, {from: 7.7, to: 14.6, C: H2}, {from: 14.6, to: 20.1, C: H3}, {from: 20.1, to: 27.8, C: H4}, {from: 27.8, to: 29.8, C: H5},
  {from: 29.8, to: 34.7, C: A1}, {from: 34.7, to: 41.5, C: A2}, {from: 41.5, to: 47.3, C: A3}, {from: 47.3, to: 55.4, C: A4}, {from: 55.4, to: 57.7, C: A5},
  {from: 57.7, to: 63.9, C: A6}, {from: 63.9, to: 69.8, C: A7}, {from: 69.8, to: 73.0, C: A8}, {from: 73.0, to: 81.7, C: A9}, {from: 81.7, to: 89.1, C: A10},
  {from: 89.1, to: 93.0, C: B1}, {from: 93.0, to: 102.9, C: B2}, {from: 102.9, to: 110.2, C: B3}, {from: 110.2, to: 114.3, C: B4}, {from: 114.3, to: 123.4, C: B5},
  {from: 123.4, to: 130.4, C: B6}, {from: 130.4, to: 137.1, C: B7}, {from: 137.1, to: 145.3, C: B8},
  {from: 145.3, to: 148.6, C: D1}, {from: 148.6, to: 152.4, C: D2}, {from: 152.4, to: 157.2, C: D3}, {from: 157.2, to: 160.6, C: D4}, {from: 160.6, to: 167.7, C: D5},
  {from: 167.7, to: 172.9, C: D6}, {from: 172.9, to: 176.8, C: D7}, {from: 176.8, to: 182.1, C: D8}, {from: 182.1, to: 188.2, C: D9}, {from: 188.2, to: 195.0, C: D10},
  {from: 195.0, to: 205.8, C: D11},
  {from: 205.8, to: 209.5, C: E1}, {from: 209.5, to: 217.4, C: E2}, {from: 217.4, to: 227.4, C: E3}, {from: 227.4, to: 237.9, C: E4}, {from: 237.9, to: 244.4, C: E5},
  {from: 244.4, to: 249.3, C: E6}, {from: 249.3, to: 255.5, C: E7}, {from: 255.5, to: 265.0, C: E8},
  {from: 265.0, to: 276.3, C: O1}, {from: 276.3, to: 284.3, C: O2}, {from: 284.3, to: ECON_SEC, C: O3},
];

export const BasicEconomics: React.FC = () => <PaperStage job="jobs/basic-economics" sec={ECON_SEC} scenes={SCENES} sfx={SFX} musicVol={0.12} />;
