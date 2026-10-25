// "Stocks Explained for Those Who Want to Be Rich!" (9:38, 16:9). Original narration + examples (pizza slices,
// Leo's Bikes + investor Priya, bake-sale club, $1,000 over 30 years). Times from public/jobs/stocks-explained/words.txt.
import React from 'react';
import {
  C, ramp, Pop, Txt, XMark, Person, Cash, Bill, Coin, Sparkle, Bubble, Arrow, PaperStage, type Scene,
  PriceTag, Phone, Book, Clock, Stall, BigArrow, Bed, CalendarPage, Doc, StormCloud, Bulb, Briefcase, House, Pot, Sneaker,
  Floor, NumberCard, TakeawayCard, Pizza, Shop, Bike, Bank, ExchangeBoard, Ballot, Jar, Tree, EggBasket, Factory, Queue,
  Fly, Label, Stamp, ValueCard, LineChart,
} from './kit';
import {SFX} from './stocksExplainedSfx';

export const STOCKS_SEC = 578.0;
type T = {t: number};
type PP = React.ComponentProps<typeof Person>;

// cast (kit rig, original designs)
const Sam = (p: Omit<PP, 'cap' | 'stripe'>) => <Person cap stripe {...p} />;
const Leo = (p: PP) => <Person shirt={C.navy} hair={C.ink} {...p} />;
const Priya = (p: PP) => <Person kind="adult" shirt={C.mustard} hair={C.ink} pants={C.navy} {...p} />;
const Adult = (p: PP) => <Person kind="adult" {...p} />;
const wave = (t: number) => -150 + Math.sin(t * 14) * 18;
const Box = () => <g stroke={C.ink} strokeWidth={6} strokeLinejoin="round"><path d="M-60,-30 L0,-58 L60,-30 L60,40 L0,68 L-60,40 Z M-60,-30 L0,-2 L60,-30 M0,-2 L0,68" fill="#D9B27C" /></g>;
const Ticket: React.FC<{text: string}> = ({text}) => <g>{/* lottery ticket */}<rect x={-120} y={-60} width={240} height={120} rx={10} fill="#FBE3D6" stroke={C.ink} strokeWidth={6} strokeDasharray="0" /><Txt x={0} y={4} size={40} weight={700}>{text}</Txt></g>;
const MegaMart = ({s = 1}: {s?: number}) => (
  <g transform={`scale(${s})`} stroke={C.ink} strokeWidth={6}>
    <rect x={-300} y={-360} width={600} height={360} fill={C.grey} /><rect x={-260} y={-420} width={520} height={80} rx={10} fill={C.red} />
    <Txt x={0} y={-378} size={52} color="#fff" weight={700}>MEGA MART</Txt>
    <rect x={-80} y={-160} width={160} height={160} fill={C.glass} />{[-240, 120].map((x) => <rect key={x} x={x} y={-300} width={120} height={90} fill={C.glass} />)}
  </g>
);

// ================= HOOK =================
const H1: React.FC<T> = ({t}) => (
  <g><Floor ground={C.ground} />
    <g transform="translate(1600,860)"><Factory s={1.3} t={t} /></g>
    {[0, 1, 2, 3].map((i) => <Adult key={i} t={t + i} x={150 + i * 260 + t * 60} y={920} s={0.8} walk={t * 1.1 + i * 0.25} shirt={[C.grey, C.navy, C.sage, C.terra][i]} hair={C.ink} mood="flat" handR={<g transform="scale(0.4)"><Briefcase /></g>} />)}
    <Label t={t} at={3.9} x={760} y={200} text="money for someone else" color={C.terra} size={62} />
  </g>
);
const H2: React.FC<T> = ({t}) => (
  <g><Floor />
    <Pop t={t} at={8.3} x={330} y={420}><Bed s={1.1} /><Txt x={0} y={110} size={44} weight={700}>asleep</Txt></Pop>
    <Pop t={t} at={9.6} x={760} y={420}><Book s={1.1} /><Txt x={0} y={110} size={44} weight={700}>at school</Txt></Pop>
    <Pop t={t} at={11.3} x={1180} y={420}><circle r={80} fill={C.mustard} stroke={C.ink} strokeWidth={6} /><Txt x={0} y={150} size={44} weight={700}>on holiday</Txt></Pop>
    <Pop t={t} at={12.5} x={1600} y={420}><Pizza n={8} taken={1} pull={30} s={0.8} /><Txt x={0} y={180} size={44} weight={700} color={C.terra}>a tiny piece</Txt></Pop>
    <Sam t={t} x={960} y={1060} s={0.8} shades={t > 11.3} mood="grin" />
  </g>
);
const H3: React.FC<T> = ({t}) => (
  <g><Floor bg={C.sage} ground={C.sage} />
    <Stamp t={t} at={17.2} x={960} y={300} text="A STOCK" color={C.paper} size={130} />
    <Sam t={t} x={700} y={1000} s={1.2} mood="grin" armR={t > 20.9 ? -150 : -10} />
    {[0, 1, 2].map((i) => <Pop key={i} t={t} at={21.4 + i * 0.12} x={1200 + i * 200} y={1000}><Adult t={t + i} x={0} y={0} s={0.75} shirt={[C.grey, C.navy, C.terra][i]} hair={C.ink} mood="o" /></Pop>)}
    {[0, 1, 2].map((i) => <Label key={i} t={t} at={21.6 + i * 0.12} x={1200 + i * 200} y={480} text="?" color={C.paper} size={90} />)}
  </g>
);

// ================= #1 WHAT IS A STOCK =================
const A1: React.FC<T> = ({t}) => (
  <g><NumberCard t={t} bg={C.terra} num="#1" at={23.8} lines={[[25.1, 'What is a stock?']]} />
    <Stamp t={t} at={27.3} x={960} y={860} text="OWNERSHIP" color={C.mustard} size={80} /></g>
);
const A2: React.FC<T> = ({t}) => (
  <g><Floor />
    <Pop t={t} at={28.6} x={420} y={420}><rect x={-80} y={-80} width={160} height={160} rx={24} fill="#fff" stroke={C.ink} strokeWidth={7} />{[[-40, -40], [40, 40], [0, 0], [40, -40], [-40, 40]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={14} fill={C.ink} />)}<Txt x={0} y={140} size={48} weight={700}>a bet</Txt></Pop>
    <XMark t={t} at={28.9} x={420} y={420} size={110} />
    <Pop t={t} at={29.7} x={960} y={420}><rect x={-160} y={-100} width={320} height={200} rx={14} fill={C.ink} /><Txt x={0} y={4} size={70} color={C.cash} weight={700}>$42.17</Txt><Txt x={0} y={170} size={48} weight={700}>a number on a screen</Txt></Pop>
    <XMark t={t} at={30.2} x={960} y={420} size={130} />
    <Pop t={t} at={32.0} x={1500} y={460}><Shop sign="A REAL BUSINESS" s={0.8} /></Pop>
    <Sparkle t={t} at={32.6} x={1700} y={200} />
  </g>
);
const A3: React.FC<T> = ({t}) => {
  const cut = t > 38.5;
  return (
    <g><Floor bg={C.mustard} ground={C.mustard} />
      <Pop t={t} at={33.9} x={760} y={540}>{cut ? <Pizza n={8} taken={t > 40.7 ? 1 : 0} pull={ramp(t, 40.7, 41.3, 0, 70)} s={1.6} hi={C.terra} /> : <g transform="scale(1.6)"><circle r={160} fill="#F2C46B" stroke={C.ink} strokeWidth={6} />{Array.from({length: 10}).map((_, i) => <circle key={i} cx={Math.cos(i * 2.4) * (40 + (i % 3) * 35)} cy={Math.sin(i * 2.4) * (40 + (i % 3) * 35)} r={14} fill={C.red} stroke={C.ink} strokeWidth={3} />)}</g>}</Pop>
      <Label t={t} at={36.5} x={1450} y={380} text="whole pizza =" size={64} />
      <Label t={t} at={37.2} x={1450} y={480} text="the COMPANY" color={C.terra} size={80} />
      <Label t={t} at={40.8} x={1450} y={700} text="1 slice =" size={64} />
      <Label t={t} at={41.6} x={1450} y={800} text="1 SHARE" color={C.paper} size={90} />
    </g>
  );
};
const A4: React.FC<T> = ({t}) => {
  const taken = t > 52.3 ? 5 : t > 48.4 ? 1 : 0;
  return (
    <g><Floor ground={C.ground} />
      <g transform="translate(420,860)"><Shop sign="LEO'S BIKES" color={C.navy} s={0.9} /></g>
      <Leo t={t} x={720} y={940} s={0.85} mood="grin" armR={t < 44.5 ? wave(t) : -20} />
      <g transform="translate(560,900)"><Bike s={0.7} /></g>
      <Pop t={t} at={46.5} x={1350} y={430}><Pizza n={10} taken={taken} pull={30} s={1.2} hi={C.mustard} /></Pop>
      <ValueCard t={t} at={50.4} x={1350} y={800} value={taken === 5 ? '50%' : '10%'} color={C.terra} w={300} />
      <Label t={t} at={54.0} x={1350} y={940} text="half of Leo's Bikes" size={50} />
    </g>
  );
};
const A5: React.FC<T> = ({t}) => {
  const fix = t > 55 && t < 58.4 ? Math.sin(t * 20) * 20 : 0;
  return (
    <g><Floor ground={C.ground} />
      <g transform="translate(560,880)"><Bike s={1.3} /></g>
      <Leo t={t} x={860} y={940} armR={-90 + fix} armL={20} mood="smile" flip />
      <Pop t={t} at={57.3} x={560} y={560}><circle r={40} fill={C.mustard} stroke={C.ink} strokeWidth={6} /><circle r={12} fill={C.ink} /></Pop>
      <Sam t={t} x={1550} y={940} mood="grin" armR={-60} />
      {[0, 1, 2].map((i) => <Fly key={i} t={t} at={58.6 + i * 0.25} x0={860} y0={500} x1={1560} y1={560}><Coin /></Fly>)}
      <Label t={t} at={59.1} x={1550} y={300} text="a piece is YOURS" color={C.cashD} size={66} />
    </g>
  );
};
const A6: React.FC<T> = ({t}) => {
  const zoom = ramp(t, 71.6, 73.2, 1, 3.5);
  return (
    <g><Floor bg={C.navy} ground={C.navy} />
      <g transform={`translate(960,520) scale(${zoom}) translate(-960,-520)`}>
        <Pop t={t} at={61.2} x={960} y={520}><Pizza n={48} taken={t > 68.5 ? 1 : 0} pull={t > 68.5 ? 8 : 0} s={2.2} hi={C.mustard} /></Pop>
      </g>
      <Label t={t} at={63.7} x={960} y={110} text="a MUCH bigger pizza" color={C.paper} size={70} />
      <Label t={t} at={66.4} x={960} y={980} text="billions of slices" color={C.mustard} size={70} />
      <Label t={t} at={73.3} x={960} y={540} text="tiny… but REAL" color={C.paper} size={110} />
    </g>
  );
};
const A7: React.FC<T> = ({t}) => (
  <g><Floor bg={C.sage} ground={C.sage} />
    <Sam t={t} x={960} y={1000} s={1.3} mood={t > 77.6 ? 'grin' : 'smile'} armR={t > 77.6 ? -150 : -10} />
    <Pop t={t} at={75.8} x={480} y={380}><rect x={-230} y={-60} width={460} height={120} rx={18} fill={C.paper} stroke={C.ink} strokeWidth={7} /><Txt x={0} y={4} size={64} weight={700}>CUSTOMER</Txt></Pop>
    <XMark t={t} at={76.6} x={480} y={380} size={100} />
    <Pop t={t} at={77.6} x={1440} y={380} r={-4}><rect x={-200} y={-70} width={400} height={140} rx={18} fill={C.mustard} stroke={C.ink} strokeWidth={7} /><Txt x={0} y={4} size={80} weight={700}>OWNER</Txt></Pop>
    <Sparkle t={t} at={77.9} x={1650} y={260} />
  </g>
);

// ================= #2 WHY COMPANIES SELL STOCK =================
const B1: React.FC<T> = ({t}) => <NumberCard t={t} bg={C.sage} num="#2" at={79.4} lines={[[81.0, 'Why do companies'], [82.0, 'sell stock?']]} />;
const B2: React.FC<T> = ({t}) => (
  <g><Floor />
    <Label t={t} at={83.6} x={960} y={130} text="growing costs money" color={C.terra} size={76} />
    <Pop t={t} at={84.5} x={330} y={560}><Factory s={0.8} t={t} /><Txt x={0} y={60} size={44} weight={700}>machines</Txt></Pop>
    <Pop t={t} at={86.8} x={800} y={560}><Shop sign="SHOP" s={0.6} /><Txt x={0} y={60} size={44} weight={700}>bigger shops</Txt></Pop>
    <Pop t={t} at={88.0} x={1220} y={620}>{[0, 1, 2].map((i) => <Adult key={i} t={t + i} x={(i - 1) * 90} y={0} s={0.45} shirt={[C.sage, C.terra, C.navy][i]} hair={C.ink} />)}<Txt x={0} y={60} size={44} weight={700}>workers</Txt></Pop>
    <Pop t={t} at={89.3} x={1620} y={540}><Box /><Txt x={0} y={140} size={44} weight={700}>products</Txt></Pop>
    <Label t={t} at={92.1} x={960} y={900} text="…but no spare cash" color={C.red} size={70} />
  </g>
);
const B3: React.FC<T> = ({t}) => (
  <g><Floor ground={C.ground} />
    <Label t={t} at={94.6} x={960} y={110} text="2 choices" size={80} />
    <Label t={t} at={96.5} x={540} y={240} text="OPTION 1: borrow" color={C.navy} size={60} />
    <Pop t={t} at={97.7} x={540} y={760}><Bank s={1.1} /></Pop>
    <Pop t={t} at={99.8} x={1150} y={560}><Doc title="LOAN" s={1.2} /></Pop>
    <Label t={t} at={101.3} x={1150} y={800} text="+ INTEREST" color={C.red} size={66} />
    <Pop t={t} at={102.4} x={1600} y={400}><StormCloud t={t} s={0.8} /><Txt x={0} y={240} size={44} weight={700}>even in a bad year</Txt></Pop>
  </g>
);
const B4: React.FC<T> = ({t}) => (
  <g><Floor />
    <Label t={t} at={104.0} x={960} y={110} text="OPTION 2: sell slices" color={C.sage} size={70} />
    <Pop t={t} at={105.3} x={420} y={540}><Pizza n={8} taken={3} pull={ramp(t, 105.8, 106.5, 0, 60)} s={1.1} hi={C.mustard} /></Pop>
    {[0, 1, 2].map((i) => <Fly key={i} t={t} at={108.0 + i * 0.2} x0={1100} y0={600} x1={480} y1={560}><Bill label="$" w={130} /></Fly>)}
    <Pop t={t} at={108.9} x={960} y={880}><Doc title="LOAN" s={0.7} /></Pop><XMark t={t} at={109.3} x={960} y={880} size={90} />
    <Label t={t} at={112.4} x={1450} y={300} text="the trade-off:" color={C.terra} size={60} />
    <Person t={t} x={1250} y={900} s={0.75} kind="adult" shirt={C.terra} hair={C.ink} mood="smile" />
    {[0, 1].map((i) => <Pop key={i} t={t} at={114.7 + i * 0.2} x={1500 + i * 200} y={900}><Adult t={t + i} x={0} y={0} s={0.75} shirt={[C.sage, C.navy][i]} hair={C.dirt} mood="grin" /></Pop>)}
    <Label t={t} at={114.8} x={1550} y={440} text="shared profits" size={54} />
  </g>
);
const B5: React.FC<T> = ({t}) => (
  <g><Floor ground={C.ground} />
    <g transform="translate(360,860)"><Shop sign="LEO'S BIKES" color={C.navy} s={0.8} /></g>
    <Leo t={t} x={660} y={940} s={0.85} mood="smile" armR={t > 120.5 ? -120 : -10} />
    <Pop t={t} at={121.6} x={1450} y={860}><Shop sign="LEO'S BIKES 2" color={C.navy} s={0.8} /></Pop>
    <Arrow t={t} a={121.0} x1={800} x2={1250} y={520} lift={140} />
    <ValueCard t={t} at={123.9} x={1450} y={240} title="new shop costs" value="$40,000" />
    <Pop t={t} at={126.4} x={960} y={300}><Jar fill={0.5} s={0.9} label="$20,000" /></Pop>
  </g>
);
const B6: React.FC<T> = ({t}) => {
  const sold = t > 137.0;
  return (
    <g><Floor />
      <Pop t={t} at={128.6} x={560} y={480}><Pizza n={10} taken={sold ? 5 : 0} pull={ramp(t, 137.0, 137.6, 0, 50)} s={1.4} hi={C.mustard} /></Pop>
      <ValueCard t={t} at={130.0} x={560} y={90} value="worth $40,000" w={520} />
      <Label t={t} at={133.8} x={560} y={860} text="10 shares × $4,000" size={58} />
      <Leo t={t} x={1100} y={980} s={0.75} mood="grin" armR={t > 135.6 ? -60 : -10} />
      <Label t={t} at={135.6} x={1100} y={420} text="keeps 5" color={C.navy} size={56} />
      <Label t={t} at={137.0} x={1100} y={500} text="sells 5" color={C.terra} size={56} />
      <Pop t={t} at={138.8} x={1600} y={980}><Priya t={t} x={0} y={0} s={0.85} mood="smile" armR={t > 141.3 ? -80 : -10} handR={t > 141.3 && t < 143 ? <Bill label="$4K" w={140} /> : null} /></Pop>
      <Label t={t} at={139.4} x={1600} y={300} text="Priya" color={C.mustard} size={70} />
      <Fly t={t} at={142.4} x0={560} y0={480} x1={1600} y1={560}><g transform="scale(0.5)"><Pizza n={10} taken={1} s={0.6} hi={C.mustard} /></g></Fly>
      <ValueCard t={t} at={144.4} x={1600} y={160} value="owns 10%" color={C.cashD} w={360} />
    </g>
  );
};
const B7: React.FC<T> = ({t}) => (
  <g><Floor ground={C.ground} />
    <Pop t={t} at={147.1} x={260} y={240}><CalendarPage label="+5 YRS" /></Pop>
    <g transform="translate(560,860)"><Shop sign="LEO'S BIKES" color={C.navy} s={0.7} /></g>
    <g transform="translate(1040,860)"><Shop sign="LEO'S BIKES 2" color={C.navy} s={0.7} /></g>
    {t > 149.4 && [0, 1, 2, 3, 4].map((i) => <Pop key={i} t={t} at={149.5 + i * 0.08} x={420 + i * 170} y={1000}><Adult t={t + i} x={0} y={0} s={0.42} shirt={[C.terra, C.sage, C.mustard, C.navy, C.grey][i]} hair={C.ink} mood="grin" /></Pop>)}
    <ValueCard t={t} at={152.6} x={1550} y={260} title="business worth" value="$120,000" color={C.cashD} w={460} />
    <ValueCard t={t} at={157.4} x={1550} y={560} title="Priya's 10%" value={t > 158.2 ? '$12,000' : '$4,000'} color={C.cashD} w={460} />
    <Stamp t={t} at={160.2} x={1550} y={830} text="3× MONEY" color={C.cashD} size={70} />
  </g>
);
const B8: React.FC<T> = ({t}) => (
  <g><Floor ground={C.ground} />
    <g transform="translate(400,860)"><Shop sign="LEO'S BIKES" color={C.navy} s={0.75} closed={t > 170} /></g>
    <Pop t={t} at={166.9} x={1050} y={860}><MegaMart s={0.85} /></Pop>
    {t > 168 && [0, 1, 2].map((i) => <Adult key={i} t={t + i} x={400 + ramp(t, 168 + i * 0.2, 170 + i * 0.2) * 600} y={1000} s={0.42} walk={t * 1.5 + i * 0.3} shirt={[C.terra, C.sage, C.mustard][i]} hair={C.ink} />)}
    <ValueCard t={t} at={170.9} x={1600} y={260} title="business worth" value="$20,000" color={C.red} w={440} />
    <ValueCard t={t} at={174.5} x={1600} y={560} title="Priya's share" value="$2,000" color={C.red} w={440} />
    <Pop t={t} at={176.0} x={1600} y={830}><BigArrow up={false} s={0.6} /></Pop>
    <Label t={t} at={176.1} x={1600} y={990} text="lost half" color={C.red} size={60} />
  </g>
);
const B9: React.FC<T> = ({t}) => (
  <g><Floor bg={C.mustard} ground={C.mustard} />
    <Label t={t} at={177.8} x={960} y={200} text="THE DEAL" size={110} />
    <Pop t={t} at={179.4} x={600} y={600}><BigArrow up s={1.2} /><Txt x={0} y={210} size={60} weight={700}>wins</Txt></Pop>
    <Pop t={t} at={180.8} x={1320} y={600}><BigArrow up={false} s={1.2} /><Txt x={0} y={210} size={60} weight={700}>losses</Txt></Pop>
  </g>
);
const B10: React.FC<T> = ({t}) => (
  <g><Floor />
    <g transform="translate(400,860)"><Shop sign="LEO'S BIKES" color={C.navy} s={0.75} /></g>
    <Pop t={t} at={186.2} x={400} y={340}><Cash w={220} /><Txt x={0} y={-110} size={44} weight={700}>profits</Txt></Pop>
    {[0, 1, 2].map((i) => <g key={i}>
      <Pop t={t} at={188.6 + i * 0.1} x={1150 + i * 260} y={980}><Person t={t + i} x={0} y={0} s={0.6} kind={i === 1 ? 'kid' : 'adult'} shirt={[C.mustard, C.terra, C.sage][i]} hair={C.ink} mood="grin" cap={i === 1} stripe={i === 1} /></Pop>
      <Fly t={t} at={189.2 + i * 0.2} x0={400} y0={340} x1={1150 + i * 260} y1={560}><Coin /></Fly>
    </g>)}
    <Stamp t={t} at={191.5} x={1400} y={250} text="DIVIDEND" color={C.cashD} size={84} />
    <Label t={t} at={195.5} x={1400} y={420} text="pizza money for every slice" size={46} />
  </g>
);

// ================= #3 EXCHANGES =================
const C1: React.FC<T> = ({t}) => <NumberCard t={t} bg={C.navy} num="#3" at={199.0} lines={[[200.3, 'Where are stocks'], [201.0, 'bought & sold?']]} />;
const C2: React.FC<T> = ({t}) => (
  <g><Floor ground={C.ground} />
    <Priya t={t} x={700} y={960} mood={t > 208 ? 'flat' : 'smile'} armR={-110} handR={<g transform="scale(0.35)"><Pizza n={10} taken={1} hi={C.mustard} /></g>} />
    <Pop t={t} at={206.6} x={700} y={240}><Bubble w={380} h={120}><Txt x={0} y={4} size={52} weight={700}>sell it?</Txt></Bubble></Pop>
    <Label t={t} at={208.7} x={1300} y={300} text="find a buyer…" size={60} />
    {[0, 1, 2].map((i) => <Label key={i} t={t} at={209.3 + i * 0.15} x={1200 + i * 160} y={460} text="?" color={C.terra} size={110} />)}
    <Pop t={t} at={210.6} x={1250} y={760}><Clock t={t * 0.2} s={0.8} /></Pop>
    <Label t={t} at={212.8} x={1600} y={760} text="price?" color={C.red} size={70} />
  </g>
);
const C3: React.FC<T> = ({t}) => (
  <g><Floor ground={C.ground} />
    <Label t={t} at={215.2} x={960} y={110} text="STOCK EXCHANGE" color={C.navy} size={90} />
    <Pop t={t} at={218.5} x={960} y={500}><ExchangeBoard t={t} name="MARKET" s={0.9} /></Pop>
    {[0, 1, 2].map((i) => <Pop key={i} t={t} at={223.3 + i * 0.1} x={200 + i * 170} y={1000}><Adult t={t + i} x={0} y={0} s={0.55} shirt={C.sage} hair={C.ink} mood="grin" armR={-150} /></Pop>)}
    <Label t={t} at={223.4} x={370} y={560} text="BUYERS" color={C.cashD} size={60} />
    {[0, 1, 2].map((i) => <Pop key={i} t={t} at={225.4 + i * 0.1} x={1380 + i * 170} y={1000}><Adult t={t + i + 3} x={0} y={0} s={0.55} shirt={C.terra} hair={C.dirt} mood="smile" armR={-60} /></Pop>)}
    <Label t={t} at={225.4} x={1550} y={560} text="SELLERS" color={C.red} size={60} />
    <Label t={t} at={228.0} x={960} y={900} text="price moves every second" size={44} />
  </g>
);
const C4: React.FC<T> = ({t}) => (
  <g><Floor bg={C.sage} ground={C.sage} />
    <Pop t={t} at={234.7} x={560} y={400}><ExchangeBoard t={t} name="NEW YORK STOCK EXCHANGE" s={0.75} /></Pop>
    <Pop t={t} at={236.0} x={1360} y={400}><ExchangeBoard t={t + 1} name="NASDAQ" s={0.75} /></Pop>
    {[['LONDON', 238.1], ['TOKYO', 239.0], ['MUMBAI', 240.3]].map(([c, a], i) => <Pop key={i} t={t} at={a as number} x={480 + i * 480} y={860}><rect x={-170} y={-50} width={340} height={100} rx={50} fill={C.paper} stroke={C.ink} strokeWidth={6} /><Txt x={0} y={4} size={52} weight={700}>{c as string}</Txt></Pop>)}
  </g>
);
const C5: React.FC<T> = ({t}) => (
  <g><Floor />
    <Pop t={t} at={244.3} x={480} y={540}>{[0, 1, 2].map((i) => <Adult key={i} t={t * 3 + i} x={(i - 1) * 140} y={300} s={0.6} shirt={C.navy} hair={C.ink} mood="o" armR={wave(t + i)} />)}<Txt x={0} y={-260} size={52} weight={700}>trading floor</Txt></Pop>
    <XMark t={t} at={245.9} x={480} y={640} size={180} />
    <Sam t={t} x={1350} y={980} s={1.1} mood="grin" armR={-70} handR={<g><Phone s={0.9} glow /><rect x={-34} y={40} width={68} height={28} rx={8} fill={C.cash} stroke={C.ink} strokeWidth={3} /></g>} />
    <Label t={t} at={249.0} x={1350} y={180} text="an app + a few taps" color={C.cashD} size={62} />
  </g>
);
const C6: React.FC<T> = ({t}) => (
  <g><Floor ground={C.ground} />
    <g transform="translate(700,860)"><Shop sign="LEO'S BIKES" color={C.navy} s={0.9} /></g>
    <Pop t={t} at={256.8} x={700} y={280}><rect x={-60} y={-20} width={120} height={100} rx={14} fill={C.mustard} stroke={C.ink} strokeWidth={7} /><path d="M-36,-20 v-30 a36,36 0 0 1 72,0 v30" fill="none" stroke={C.ink} strokeWidth={12} /></Pop>
    <Stamp t={t} at={256.9} x={1400} y={300} text="PRIVATE" color={C.navy} size={90} />
    <Leo t={t} x={1250} y={960} s={0.8} mood="smile" />
    <Pop t={t} at={259.6} x={1500} y={960}><Priya t={t} x={0} y={0} s={0.7} mood="smile" /></Pop>
  </g>
);
const C7: React.FC<T> = ({t}) => {
  const grow = ramp(t, 261.6, 263.3, 0.6, 1);
  return (
    <g><Floor ground={C.ground} />
      <g transform={`translate(480,880) scale(${grow})`}><Shop sign="BIG CO." color={C.terra} s={1} /></g>
      <Label t={t} at={263.9} x={480} y={240} text="GOES PUBLIC" color={C.terra} size={70} />
      <Pop t={t} at={266.3} x={1300} y={420}><ExchangeBoard t={t} name="MARKET" s={0.6} /></Pop>
      {Array.from({length: 7}).map((_, i) => <Pop key={i} t={t} at={269.3 + i * 0.07} x={1000 + i * 120} y={1000}><Adult t={t + i} x={0} y={0} s={0.38} shirt={[C.terra, C.sage, C.mustard, C.navy][i % 4]} hair={[C.ink, C.dirt][i % 2]} mood="grin" armR={-150} /></Pop>)}
      <Stamp t={t} at={274.1} x={1300} y={130} text="IPO" color={C.red} size={90} />
      <Label t={t} at={275.0} x={1300} y={760} text="initial public offering" size={44} />
    </g>
  );
};

// ================= #4 COMMON vs PREFERRED =================
const D1: React.FC<T> = ({t}) => (
  <g><NumberCard t={t} bg={C.terra} num="#4" at={278.0} lines={[[279.4, 'Not all shares are the same']]} />
    <Pop t={t} at={283.4} x={620} y={880}><rect x={-230} y={-60} width={460} height={120} rx={18} fill={C.paper} stroke={C.ink} strokeWidth={7} /><Txt x={0} y={4} size={60} weight={700}>COMMON</Txt></Pop>
    <Pop t={t} at={284.4} x={1300} y={880}><rect x={-260} y={-60} width={520} height={120} rx={18} fill={C.mustard} stroke={C.ink} strokeWidth={7} /><Txt x={0} y={4} size={60} weight={700}>PREFERRED</Txt></Pop>
  </g>
);
const D2: React.FC<T> = ({t}) => (
  <g><Floor ground={C.ground} />
    <g transform="translate(960,900)"><Stall color={C.terra} sign="BAKE SALE" /></g>
    <Sam t={t} x={580} y={960} s={0.85} mood="grin" />
    <Person t={t} x={1340} y={960} s={0.85} shirt={C.sage} hair={C.terra} mood="grin" armR={wave(t)} />
    <Label t={t} at={286.3} x={960} y={200} text="a company = a school club" size={64} />
  </g>
);
const D3: React.FC<T> = ({t}) => (
  <g><Floor />
    <Label t={t} at={290.6} x={500} y={120} text="COMMON = voting members" color={C.navy} size={58} />
    <Sam t={t} x={360} y={960} s={0.85} armR={-110} handR={<Ballot s={0.6} />} mood="grin" />
    <Label t={t} at={294.3} x={500} y={270} text="1 share = 1 vote" color={C.terra} size={60} />
    <Pop t={t} at={297.0} x={1000} y={840}><rect x={-260} y={-30} width={520} height={40} fill={C.dirt} stroke={C.ink} strokeWidth={6} />
      {[-170, 0, 170].map((x, i) => <Adult key={i} t={t + i} x={x} y={-20} s={0.5} tie shirt={C.navy} hair={C.grey} />)}<Txt x={0} y={80} size={40} weight={700}>board of directors</Txt></Pop>
    <LineChart t={t} t0={302.5} t1={305.5} pts={[0.1, 0.15, 0.12, 0.3, 0.28, 0.5, 0.45, 0.75, 0.95]} x={1400} y={300} w={420} h={380} color={C.cashD} fillArea />
    <Label t={t} at={303.9} x={1610} y={760} text="biggest upside" color={C.cashD} size={50} />
  </g>
);
const D4: React.FC<T> = ({t}) => (
  <g><Floor bg={C.navy} ground={C.navy} />
    <Label t={t} at={308.3} x={960} y={160} text="the catch" color={C.mustard} size={90} />
    <Pop t={t} at={309.6} x={640} y={540}><g transform="scale(3)"><Coin /></g><Txt x={0} y={170} size={50} color={C.paper} weight={700}>dividends</Txt></Pop>
    <Label t={t} at={310.9} x={640} y={820} text="not promised" color={C.red} size={60} />
    <Pop t={t} at={313.3} x={1300} y={480}><StormCloud t={t} s={0.8} /></Pop>
    <ValueCard t={t} at={315.0} x={1300} y={780} value="$0" color={C.red} w={260} />
  </g>
);
const D5: React.FC<T> = ({t}) => (
  <g><Floor />
    <Pop t={t} at={316.4} x={280} y={560}><Shop sign="CLUB INC." color={C.grey} s={0.7} closed /></Pop>
    <Stamp t={t} at={317.4} x={280} y={200} text="BANKRUPT" size={60} />
    <Pop t={t} at={319.6} x={700} y={800}><Queue t={t} labels={['LENDERS', 'WORKERS', 'PREFERRED', 'COMMON']} hi={t > 327.7 ? 3 : -1} /></Pop>
    <Label t={t} at={321.4} x={1390} y={300} text="LAST in line" color={C.red} size={66} />
    <Label t={t} at={330.8} x={1300} y={450} text="often: nothing" size={54} />
  </g>
);
const D6: React.FC<T> = ({t}) => (
  <g><Floor bg={C.mustard} ground={C.mustard} />
    <Label t={t} at={332.3} x={960} y={110} text="PREFERRED shareholders" size={70} />
    <Pop t={t} at={334.6} x={360} y={480}><Ballot s={1} /></Pop><XMark t={t} at={335.4} x={360} y={480} size={120} />
    <Label t={t} at={335.6} x={360} y={700} text="no vote" size={50} />
    <Pop t={t} at={336.8} x={960} y={520}>{[0, 1, 2].map((i) => <g key={i} transform={`translate(${(i - 1) * 140},0)`}>{[0, 1, 2].map((j) => <g key={j} transform={`translate(0,${-j * 34}) scale(1.4)`}><Coin /></g>)}</g>)}<Txt x={0} y={110} size={48} weight={700}>fixed dividend</Txt></Pop>
    <Label t={t} at={340.2} x={960} y={760} text="paid FIRST" color={C.terra} size={62} />
    <Pop t={t} at={344.2} x={1500} y={600}><Queue t={t} labels={['PREF', 'COMMON']} hi={0} s={0.9} /></Pop>
  </g>
);
const D7: React.FC<T> = ({t}) => (
  <g><Floor />
    <Label t={t} at={347.6} x={500} y={160} text="PREFERRED" color={C.mustard} size={70} />
    <LineChart t={t} t0={348.3} t1={350.3} pts={[0.4, 0.42, 0.44, 0.45, 0.47, 0.48, 0.5, 0.52]} x={260} y={300} w={500} h={340} color={C.navy} />
    <Label t={t} at={349.6} x={500} y={760} text="steady · less upside" size={48} />
    <Label t={t} at={351.4} x={1420} y={160} text="COMMON" color={C.terra} size={70} />
    <LineChart t={t} t0={352.2} t1={354.2} pts={[0.3, 0.55, 0.2, 0.6, 0.35, 0.8, 0.5, 0.95]} x={1170} y={300} w={500} h={340} color={C.terra} />
    <Label t={t} at={353.4} x={1420} y={760} text="risky · more upside" size={48} />
    <Pop t={t} at={354.6} x={1420} y={920}><Ballot s={0.45} /></Pop>
  </g>
);
const D8: React.FC<T> = ({t}) => (
  <g><Floor bg={C.sage} ground={C.sage} />
    <Pop t={t} at={357.0} x={960} y={360}>
      <line x1={-600} y1={0} x2={600} y2={0} stroke={C.ink} strokeWidth={10} />
      {[['STOCK', -600, C.terra], ['PREFERRED', 0, C.mustard], ['BOND', 600, C.navy]].map(([l, x, c]) => <g key={l as string} transform={`translate(${x},0)`}><circle r={30} fill={c as string} stroke={C.ink} strokeWidth={6} /><Txt x={0} y={-80} size={52} color={C.paper} weight={700}>{l as string}</Txt></g>)}
    </Pop>
    <Pop t={t} at={361.5} x={1560} y={760}><Doc title="LOAN" s={0.9} /></Pop>
    <Label t={t} at={361.6} x={1100} y={640} text="bond = a loan" color={C.paper} size={60} />
    <Pop t={t} at={363.0} x={600} y={800}><Shop sign="COMPANY" s={0.45} /></Pop>
    <Pop t={t} at={364.0} x={960} y={800}><Bank s={0.6} /></Pop>
    <Label t={t} at={365.7} x={1100} y={740} text="+ interest" color={C.mustard} size={50} />
  </g>
);
const D9: React.FC<T> = ({t}) => (
  <g><Floor />
    <Sam t={t} x={700} y={980} s={1.1} mood="grin" armR={-70} handR={<Phone s={0.9} glow />} />
    <Pop t={t} at={369.4} x={1300} y={480}><rect x={-260} y={-200} width={520} height={400} rx={30} fill={C.ink} /><rect x={-230} y={-170} width={460} height={340} rx={16} fill="#fff" />
      <Txt x={0} y={-90} size={46} weight={700}>BUY</Txt><rect x={-180} y={-40} width={360} height={80} rx={14} fill={C.cash} stroke={C.ink} strokeWidth={5} /><Txt x={0} y={4} size={44} weight={700}>COMMON ✓</Txt>
      <Txt x={0} y={110} size={34} color={C.grey}>default</Txt></Pop>
    <Label t={t} at={367.5} x={1300} y={150} text="most beginners" color={C.terra} size={64} />
  </g>
);

// ================= #5 BANK vs STOCKS =================
const E1: React.FC<T> = ({t}) => <NumberCard t={t} bg={C.mustard} num="#5" at={375.3} lines={[[377.0, 'Why not just'], [378.2, 'use the bank?']]} accent={C.ink} />;
const E2: React.FC<T> = ({t}) => (
  <g><Floor />
    <Pop t={t} at={379.7} x={600} y={800}><Bank s={1.3} /></Pop>
    <Label t={t} at={380.2} x={600} y={200} text="SAFE ✓" color={C.cashD} size={80} />
    <Label t={t} at={382.6} x={1350} y={260} text="but safety has a price" size={56} />
    <Pop t={t} at={386.4} x={1350} y={640}><Jar fill={0.2} s={1.1} /></Pop>
    <ValueCard t={t} at={386.4} x={1350} y={940} value="1–2% / year" w={420} />
  </g>
);
const E3: React.FC<T> = ({t}) => {
  const shrink = ramp(t, 398.8, 400.5, 1, 0.6);
  return (
    <g><Floor ground={C.ground} />
      <Pop t={t} at={389.0} x={420} y={480}><PriceTag label={t > 391 ? '$3.09' : '$3.00'} s={1.2} /><g transform="translate(0,180) scale(0.6)"><Pot t={t} /></g></Pop>
      <Stamp t={t} at={392.8} x={420} y={150} text="INFLATION" color={C.red} size={66} />
      <ValueCard t={t} at={395.3} x={1000} y={300} title="prices rise" value="3%" color={C.red} w={360} />
      <ValueCard t={t} at={397.3} x={1000} y={560} title="bank pays" value="1%" color={C.navy} w={360} />
      <g transform={`translate(1550,620) scale(${shrink})`}><Cash w={300} /></g>
      <Label t={t} at={398.9} x={1550} y={300} text="quietly shrinking" color={C.red} size={56} />
      <Label t={t} at={402.6} x={1550} y={900} text="same $, buys less" size={50} />
    </g>
  );
};
const E4: React.FC<T> = ({t}) => (
  <g><Floor />
    <Label t={t} at={404.3} x={960} y={110} text="the stock market, long term" size={60} />
    <LineChart t={t} t0={405} t1={418.5} pts={[0.05, 0.08, 0.12, 0.1, 0.18, 0.22, 0.15, 0.25, 0.33, 0.3, 0.42, 0.5, 0.38, 0.52, 0.62, 0.7, 0.66, 0.8, 0.9, 0.97]} x={240} y={220} w={1440} h={620} color={C.cashD} fillArea />
    <ValueCard t={t} at={408.7} x={600} y={330} value="~7–10% / yr" color={C.cashD} w={480} />
    <Label t={t} at={411.2} x={1400} y={900} text="not every year" color={C.red} size={52} />
    <Label t={t} at={416.5} x={960} y={980} text="but over DECADES" color={C.cashD} size={60} />
  </g>
);
const E5: React.FC<T> = ({t}) => {
  const g = ramp(t, 436.3, 438.6, 0.3, 1);
  return (
    <g><Floor ground={C.ground} />
      <Label t={t} at={421.2} x={960} y={90} text="$1,000 · 30 years" size={66} />
      <Pop t={t} at={423.1} x={460} y={600}><Jar fill={ramp(t, 426.5, 428.8, 0.25, 0.45)} s={1.4} /></Pop>
      <Label t={t} at={424.7} x={460} y={280} text="BANK 2%" color={C.navy} size={60} />
      <ValueCard t={t} at={429.4} x={460} y={950} value="$1,800" color={C.navy} w={340} />
      <g transform={`translate(1350,860)`}><Tree g={t > 431 ? g : 0.3} s={1.1} coins={t > 438} /></g>
      <Label t={t} at={431.0} x={1350} y={180} text="MARKET ~8%" color={C.cashD} size={60} />
      <ValueCard t={t} at={438.6} x={1650} y={950} value="$10,000" color={C.cashD} w={380} />
      <Stamp t={t} at={445.9} x={960} y={500} text="COMPOUNDING" color={C.terra} size={76} />
      {t > 447.6 && [0, 1, 2, 3].map((i) => <Fly key={i} t={t} at={447.7 + i * 0.3} x0={1350} y0={500} x1={1000 + i * 120} y1={720} arc={120}><Coin /></Fly>)}
    </g>
  );
};
const E6: React.FC<T> = ({t}) => (
  <g><Floor bg={C.sage} ground={C.sage} />
    <Label t={t} at={454.4} x={960} y={100} text="LONG-TERM investors" color={C.paper} size={70} />
    <Sam t={t} x={500} y={960} s={1.05} mood={t > 461 ? 'smile' : 'grin'} shades={t > 461} />
    <g transform="translate(1000,900)"><Tree g={ramp(t, 455, 459, 0.4, 1)} s={0.9} /></g>
    <LineChart t={t} t0={460.2} t1={462.5} pts={[0.5, 0.6, 0.35, 0.45, 0.7, 0.85]} x={1350} y={360} w={420} h={320} color={C.cashD} />
    <Label t={t} at={461.3} x={1560} y={760} text="dip? no panic" color={C.paper} size={50} />
    <Label t={t} at={463.3} x={1560} y={860} text="thinking in decades" color={C.mustard} size={46} />
  </g>
);
const E7: React.FC<T> = ({t}) => (
  <g><Floor bg={C.red} ground={C.red} />
    <Label t={t} at={465.0} x={960} y={100} text="SHORT-TERM traders" color={C.paper} size={70} />
    <Adult t={t * 3} x={500} y={980} shirt={C.navy} hair={C.ink} mood="o" armL={140 + Math.sin(t * 10) * 15} armR={-140 - Math.sin(t * 10) * 15} />
    <LineChart t={t} t0={466} t1={468} pts={[0.5, 0.8, 0.2, 0.9, 0.1, 0.7, 0.3, 0.6, 0.15]} x={900} y={260} w={800} h={420} color={C.paper} />
    <Label t={t} at={472.2} x={1300} y={800} text="much harder" color={C.paper} size={60} />
    <Pop t={t} at={474.6} x={1300} y={950}><rect x={-330} y={-50} width={660} height={100} rx={20} fill={C.paper} stroke={C.ink} strokeWidth={6} /><Txt x={0} y={4} size={50} color={C.red} weight={700}>most LOSE money</Txt></Pop>
  </g>
);
const E8: React.FC<T> = ({t}) => (
  <g><Floor bg={C.mustard} ground={C.mustard} />
    <Sam t={t} x={700} y={1000} s={1.35} mood="grin" armR={-150} armL={150} />
    <Pop t={t} at={477.4} x={1350} y={380}><Clock t={t} s={1.6} /></Pop>
    <Label t={t} at={478.0} x={1350} y={680} text="TIME = SUPERPOWER" size={70} />
    {[0, 1, 2].map((i) => <Sparkle key={i} t={t} at={478.2 + i * 0.15} x={1150 + i * 200} y={200 + (i % 2) * 120} />)}
    <Label t={t} at={480.2} x={1350} y={820} text="start early" color={C.terra} size={60} />
  </g>
);

// ================= TAKEAWAYS =================
const F1: React.FC<T> = ({t}) => (
  <g><TakeawayCard t={t} at={484.0} lines={[[486.6, '1. A stock = a real business'], [493.4, 'Would I own this business?', C.terra]]} />
    <Pop t={t} at={490.1} x={1640} y={540}><Ticket text="LOTTO" /></Pop><XMark t={t} at={490.5} x={1640} y={540} size={80} /></g>
);
const F2: React.FC<T> = ({t}) => (
  <g><Floor />
    <Label t={t} at={499.3} x={960} y={130} text="2. Companies you understand" color={C.navy} size={70} />
    <Pop t={t} at={503.2} x={420} y={480}><Sneaker s={1.2} /><Txt x={0} y={120} size={46} weight={700}>brands you use</Txt></Pop>
    <Pop t={t} at={504.4} x={960} y={480}><Phone s={1} glow /><Txt x={0} y={150} size={46} weight={700}>games you play</Txt></Pop>
    <Pop t={t} at={505.6} x={1500} y={560}><Shop sign="SHOP" s={0.5} /><Txt x={0} y={70} size={46} weight={700}>shops you visit</Txt></Pop>
    <Pop t={t} at={507.9} x={960} y={880}><rect x={-520} y={-60} width={1040} height={120} rx={20} fill={C.terra} stroke={C.ink} strokeWidth={6} /><Txt x={0} y={4} size={50} color={C.paper} weight={700}>can't explain it? don't buy it yet</Txt></Pop>
  </g>
);
const F3: React.FC<T> = ({t}) => {
  const spread = t > 516;
  return (
    <g><Floor ground={C.ground} />
      <Label t={t} at={511.9} x={960} y={120} text="3. Don't put all your eggs…" color={C.terra} size={70} />
      {!spread ? <Pop t={t} at={513.6} x={960} y={600}><EggBasket s={1.6} eggs={5} /></Pop>
        : [0, 1, 2, 3, 4].map((i) => <Pop key={i} t={t} at={516.1 + i * 0.1} x={360 + i * 300} y={560}><EggBasket s={0.75} eggs={1} /></Pop>)}
      <Label t={t} at={516.8} x={960} y={790} text="spread across many companies" size={50} />
      <Pop t={t} at={522.8} x={960} y={950}><rect x={-360} y={-60} width={720} height={120} rx={60} fill={C.mustard} stroke={C.ink} strokeWidth={6} /><Txt x={0} y={4} size={56} weight={700}>INDEX FUND = 100s</Txt></Pop>
    </g>
  );
};
const F4: React.FC<T> = ({t}) => (
  <g><Floor bg={C.sage} ground={C.sage} />
    <Label t={t} at={528.3} x={960} y={120} text="4. Be patient" color={C.paper} size={90} />
    <LineChart t={t} t0={530.8} t1={533} pts={[0.2, 0.35, 0.25, 0.4, 0.3, 0.55, 0.45, 0.6, 0.5, 0.75, 0.68, 0.9]} x={260} y={300} w={900} h={460} color={C.paper} />
    <g transform="translate(1500,900)"><Tree g={ramp(t, 533.4, 535.5, 0.3, 1)} s={1} /></g>
    <Label t={t} at={534.2} x={1500} y={980} text="wealth takes years" color={C.mustard} size={50} />
  </g>
);
const F5: React.FC<T> = ({t}) => (
  <g><Floor />
    <Label t={t} at={536.1} x={960} y={120} text="5. Only money you won't need soon" color={C.navy} size={64} />
    <Pop t={t} at={540.0} x={480} y={640}><House x={0} y={160} body="#E7C9A2" roof={C.sage} w={220} h={180} /><Txt x={0} y={240} size={46} weight={700}>rent</Txt></Pop>
    <Pop t={t} at={540.6} x={960} y={600}><Pot s={1} t={t} /><Txt x={0} y={160} size={46} weight={700}>food</Txt></Pop>
    <Pop t={t} at={541.7} x={1440} y={600}><rect x={-90} y={-90} width={180} height={180} rx={24} fill="#fff" stroke={C.ink} strokeWidth={7} /><rect x={-22} y={-60} width={44} height={120} fill={C.red} /><rect x={-60} y={-22} width={120} height={44} fill={C.red} /><Txt x={0} y={160} size={46} weight={700}>emergencies</Txt></Pop>
    <Label t={t} at={542.3} x={960} y={950} text="NEVER invest these" color={C.red} size={64} />
  </g>
);

// ================= OUTRO =================
const G1: React.FC<T> = ({t}) => (
  <g><Floor ground={C.ground} />
    <g transform="translate(960,860)"><Shop sign="BUSINESS" color={C.terra} s={1} /></g>
    {[0, 1].map((i) => <Pop key={i} t={t} at={546.5 + i * 0.1} x={260 + i * 180} y={980}><Adult t={t + i} x={0} y={0} s={0.6} shirt={C.grey} hair={C.ink} mood="flat" handR={<g transform="scale(0.35)"><Briefcase /></g>} /></Pop>)}
    <Arrow t={t} a={547.4} x1={420} x2={720} y={520} lift={120} />
    <Label t={t} at={548.1} x={340} y={330} text="workers" size={56} />
    <Pop t={t} at={549.3} x={1650} y={980}><Sam t={t} x={0} y={0} s={0.8} mood="grin" /></Pop>
    {[0, 1, 2].map((i) => <Fly key={i} t={t} at={550.5 + i * 0.2} x0={1100} y0={520} x1={1640} y1={600}><Coin /></Fly>)}
    <Label t={t} at={549.4} x={1650} y={330} text="OWNERS" color={C.cashD} size={66} />
  </g>
);
const G2: React.FC<T> = ({t}) => (
  <g><Floor />
    <Label t={t} at={553.5} x={960} y={130} text="you don't need to be rich" size={64} />
    {[['understand it', 556.0, C.navy], ['start small', 558.4, C.terra], ['give it time', 559.3, C.sage]].map(([s, a, c], i) => (
      <Pop key={i} t={t} at={a as number} x={420 + i * 540} y={460}><rect x={-230} y={-90} width={460} height={180} rx={24} fill={c as string} stroke={C.ink} strokeWidth={7} /><Txt x={0} y={4} size={56} color={C.paper} weight={700}>{s as string}</Txt></Pop>
    ))}
    <Pop t={t} at={560.6} x={960} y={820}><rect x={-420} y={-50} width={840} height={100} rx={50} fill={C.paper2} stroke={C.ink} strokeWidth={5} /><Txt x={0} y={4} size={42} weight={600}>not financial advice — just the basics</Txt></Pop>
  </g>
);
const G3: React.FC<T> = ({t}) => (
  <g><Floor bg={C.terra} ground={C.terra} />
    <Adult t={t} x={420} y={1000} s={0.95} shirt={C.sage} hair={C.dirt} mood="smile" armR={-40} />
    <Sam t={t} x={700} y={1000} s={0.95} mood="grin" armR={t > 575 ? wave(t) : -70} handR={t < 571 ? <Phone s={0.6} glow /> : null} />
    <Label t={t} at={567.7} x={560} y={300} text="custodial account" color={C.paper} size={56} />
    <Label t={t} at={572.4} x={1350} y={400} text="THINK LIKE" color={C.paper} size={100} />
    <Label t={t} at={573.0} x={1350} y={540} text="AN OWNER" color={C.mustard} size={130} />
    <Label t={t} at={575.2} x={1350} y={800} text="see you in the next one" color={C.paper} size={52} />
  </g>
);

const SCENES: Scene[] = [
  {from: 0, to: 5.7, C: H1}, {from: 5.7, to: 16.2, C: H2}, {from: 16.2, to: 23.5, C: H3},
  {from: 23.5, to: 28.4, C: A1}, {from: 28.4, to: 33.8, C: A2}, {from: 33.8, to: 43.0, C: A3}, {from: 43.0, to: 54.9, C: A4}, {from: 54.9, to: 60.9, C: A5},
  {from: 60.9, to: 75.4, C: A6}, {from: 75.4, to: 79.2, C: A7},
  {from: 79.2, to: 82.9, C: B1}, {from: 82.9, to: 93.8, C: B2}, {from: 93.8, to: 103.8, C: B3}, {from: 103.8, to: 116.9, C: B4}, {from: 116.9, to: 128.3, C: B5},
  {from: 128.3, to: 146.9, C: B6}, {from: 146.9, to: 163.1, C: B7}, {from: 163.1, to: 177.5, C: B8}, {from: 177.5, to: 182.1, C: B9}, {from: 182.1, to: 198.7, C: B10},
  {from: 198.7, to: 202.5, C: C1}, {from: 202.5, to: 214.3, C: C2}, {from: 214.3, to: 231.7, C: C3}, {from: 231.7, to: 242.8, C: C4}, {from: 242.8, to: 252.2, C: C5},
  {from: 252.2, to: 261.4, C: C6}, {from: 261.4, to: 277.8, C: C7},
  {from: 277.8, to: 285.7, C: D1}, {from: 285.7, to: 290.5, C: D2}, {from: 290.5, to: 307.8, C: D3}, {from: 307.8, to: 316.1, C: D4}, {from: 316.1, to: 332.2, C: D5},
  {from: 332.2, to: 347.4, C: D6}, {from: 347.4, to: 356.7, C: D7}, {from: 356.7, to: 367.3, C: D8}, {from: 367.3, to: 375.1, C: D9},
  {from: 375.1, to: 379.5, C: E1}, {from: 379.5, to: 388.8, C: E2}, {from: 388.8, to: 404.1, C: E3}, {from: 404.1, to: 420.9, C: E4}, {from: 420.9, to: 450.7, C: E5},
  {from: 450.7, to: 464.8, C: E6}, {from: 464.8, to: 476.2, C: E7}, {from: 476.2, to: 483.6, C: E8},
  {from: 483.6, to: 499.1, C: F1}, {from: 499.1, to: 511.8, C: F2}, {from: 511.8, to: 528.2, C: F3}, {from: 528.2, to: 536.0, C: F4}, {from: 536.0, to: 543.6, C: F5},
  {from: 543.6, to: 552.9, C: G1}, {from: 552.9, to: 565.1, C: G2}, {from: 565.1, to: STOCKS_SEC, C: G3},
];

export const StocksExplained: React.FC = () => <PaperStage job="jobs/stocks-explained" sec={STOCKS_SEC} scenes={SCENES} sfx={SFX} musicVol={0.12} />;
