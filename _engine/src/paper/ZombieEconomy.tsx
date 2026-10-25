// "How a Zombie Pandemic Would Wreck the Economy": first 9:16 paper short (1080x1920), 2026-10-23.
// Word times from public/jobs/zombie-economy/words.txt (George voice, sped up 1.1x).
import React from 'react';
import {
  C, ramp, Pop, Txt, XMark, Person, House, Bill, Sparkle, Label, Stamp, LineChart, Fly, Doc, Jar, PriceTag, BigArrow, Phone, Book,
  CalendarPage, Pot, Clock, Shop, Truck, BeanCan, PillBottle, Bat, Wallet, Printer, Virus, Domino, NumberCardV, TakeawayCardV, PaperStage, type Scene,
} from './kit';
import {SFX} from './zombieEconomySfx';

export const ZOMBIE_SEC = 74.8;
const W = 1080, H = 1920;
type SceneP = {t: number};
const VFloor: React.FC<{bg?: string; ground?: string; y?: number}> = ({bg = C.paper, ground = C.paper2, y = 1350}) => (
  <g><rect width={W} height={H} fill={bg} /><rect y={y} width={W} height={H - y} fill={ground} /><line x1={0} y1={y} x2={W} y2={y} stroke={C.ink} strokeWidth={6} /></g>
);
const Zombie: React.FC<{t: number; x: number; y: number; s?: number; walk?: number; shirt?: string; flip?: boolean}> = ({t, x, y, s = 1, walk = 0, shirt = C.grey, flip}) => (
  <Person t={t} x={x} y={y} s={s} kind="adult" zombie shirt={shirt} pants={C.navy} hair={C.dirt} mood="o" walk={walk} flip={flip}
    armL={95 + Math.sin(t * 3) * 6} armR={-95 - Math.sin(t * 3 + 1) * 6} />
);

// ---------- hook ----------
const S1: React.FC<SceneP> = ({t}) => {
  const zl = ramp(t, 0.3, 3.6, -220, 170), zr = ramp(t, 0.3, 3.6, 1300, 910);
  const scared = t > 2.9;
  return (
    <g>
      <VFloor bg="#E4E8D2" ground="#C9C1A2" />
      <Pop t={t} at={0.5} x={540} y={380} s={1.1}><Virus t={t} /></Pop>
      <Label t={t} at={0.3} x={540} y={680} text="ZOMBIE VIRUS" color={C.terra} size={104} />
      <Zombie t={t} x={zl} y={1480} s={0.95} walk={t < 3.6 ? t * 0.7 : 0} />
      <Zombie t={t + 1} x={zr} y={1500} s={0.9} walk={t < 3.6 ? t * 0.7 + 0.5 : 0} shirt={C.sage} flip />
      <Person t={t} x={540} y={1560} s={1.2} cap stripe mood={scared ? 'o' : 'flat'} armL={scared ? 150 : 12} armR={scared ? -150 : -12} />
    </g>
  );
};

const S2: React.FC<SceneP> = ({t}) => (
  <g>
    <rect width={W} height={H} fill={C.paper} />
    <Stamp t={t} at={4.5} x={540} y={330} text="THE ECONOMY" size={92} />
    <LineChart t={t} t0={4.6} t1={6.2} pts={[0.9, 0.86, 0.9, 0.72, 0.76, 0.45, 0.32, 0.06]} x={150} y={560} w={800} h={620} color={C.red} />
    <Pop t={t} at={5.12} x={860} y={1000} s={0.75}><BigArrow up={false} /></Pop>
    <Zombie t={t} x={330} y={1640} s={0.62} />
  </g>
);

// ---------- #1 supply ----------
const S3: React.FC<SceneP> = ({t}) => <NumberCardV t={t} bg={C.terra} num="#1" at={6.54} lines={[[7.48, 'SUPPLY'], [7.76, 'BREAKS']]} />;

const S4: React.FC<SceneP> = ({t}) => (
  <g>
    <VFloor />
    <Label t={t} at={9.48} x={540} y={260} text="DRIVERS STAY HOME" size={76} />
    <Pop t={t} at={9.14} x={560} y={760} s={1.25}><Truck label="FOOD" /></Pop>
    <XMark t={t} at={9.6} x={540} y={630} size={90} />
    <Pop t={t} at={9.78} x={540} y={1350}><House x={0} y={0} body="#E7C9A2" roof={C.sage} w={360} h={280} /></Pop>
    <Pop t={t} at={9.9} x={830} y={1080}><Txt x={0} y={0} size={70} weight={700} color={C.navy}>z z</Txt></Pop>
  </g>
);

const S5: React.FC<SceneP> = ({t}) => {
  const cans = [[300, 470], [540, 470], [780, 470], [300, 790], [540, 790], [780, 790]];
  return (
    <g>
      <VFloor y={1620} />
      <g stroke={C.ink} strokeWidth={6}><rect x={130} y={300} width={820} height={660} fill="#D9B27C" /><line x1={130} y1={630} x2={950} y2={630} /><line x1={130} y1={950} x2={950} y2={950} /></g>
      {cans.map(([x, y], i) => {
        const gone = ramp(t, 10.6 + i * 0.07, 10.85 + i * 0.07);
        return gone < 1 ? <g key={i} transform={`translate(${x},${y + gone * -80}) scale(${0.95 * (1 - gone)})`} opacity={1 - gone}><BeanCan /></g> : null;
      })}
      <Stamp t={t} at={11.02} x={540} y={630} text="EMPTY" size={110} />
      <Label t={t} at={12.06} x={540} y={1050} text="FEWER GOODS" size={78} />
      <Label t={t} at={12.9} x={540} y={1150} text="MORE PANIC" size={78} color={C.red} />
      {[0, 1, 2].map((i) => {
        const run = ramp(t, 12.9, 14.4, 0, 1);
        const panic = t > 13.32;
        return <Pop key={i} t={t} at={12.9 + i * 0.1} x={220 + i * 320 + Math.sin(t * 9 + i) * 10} y={1700} s={0.62}>
          <Person t={t + i} x={0} y={0} kind="adult" shirt={[C.navy, C.sage, C.mustard][i]} hair={[C.ink, C.terra, C.dirt][i]} mood="o" walk={run * 3 + i * 0.3}
            armL={panic ? 150 : 20} armR={panic ? -150 : -20} />
        </Pop>;
      })}
    </g>
  );
};

const S6: React.FC<SceneP> = ({t}) => {
  const big = t > 17.56;
  const shake = big && t < 18.1 ? Math.sin(t * 70) * 10 : 0;
  return (
    <g>
      <VFloor y={1640} />
      <Pop t={t} at={15.32} x={480} y={920} s={2.2}><BeanCan /></Pop>
      <Pop t={t} at={16.02} x={700 + shake} y={440} s={big ? 2.1 : 1.6} r={-8}><PriceTag label={big ? '$20' : '$2'} color={big ? C.terra : C.mustard} /></Pop>
      <Pop t={t} at={17.56} x={170} y={460} s={0.8}><BigArrow up /></Pop>
      <Person t={t} x={860} y={1640} s={0.95} cap stripe mood={big ? 'o' : 'flat'} armL={big ? 150 : 12} armR={big ? -150 : -12} flip />
      {big && <Sparkle t={t} at={17.6} x={940} y={330} />}
    </g>
  );
};

// ---------- #2 jobs ----------
const S7: React.FC<SceneP> = ({t}) => <NumberCardV t={t} bg={C.sage} num="#2" at={19.18} lines={[[20.74, 'JOBS'], [20.95, 'VANISH']]} />;

const S8: React.FC<SceneP> = ({t}) => {
  const shut = t > 23.54;
  return (
    <g>
      <VFloor y={1300} ground={C.ground} />
      {[['MALL', 22.16, C.sage], ['CINEMA', 22.64, C.navy], ['FOOD', 23.16, C.terra]].map(([sign, at, col], i) => (
        <Pop key={i} t={t} at={at as number} x={190 + i * 350} y={1300} s={0.74}><Shop sign={sign as string} color={col as string} closed={shut} /></Pop>
      ))}
      <Stamp t={t} at={23.54} x={540} y={520} text="CLOSED" size={120} />
    </g>
  );
};

const S9: React.FC<SceneP> = ({t}) => {
  const labels = ['CAFE', 'GYM', 'SALON', 'TOYS'];
  return (
    <g>
      <rect width={W} height={H} fill={C.paper} />
      <Person t={t} x={260} y={980} s={0.75} kind="adult" shirt={C.navy} hair={C.ink} mood={t > 25.2 ? 'flat' : 'smile'} armL={12} armR={-40}
        handR={<g transform="scale(0.45)"><Wallet t={t} empty={ramp(t, 25.2, 25.6)} /></g>} />
      <Label t={t} at={25.2} x={720} y={330} text="NO PAY" size={96} color={C.red} />
      <Pop t={t} at={25.8} x={720} y={640} s={0.9}><Bill label="$" w={260} /></Pop>
      <XMark t={t} at={26.3} x={720} y={640} size={110} />
      <rect y={1450} width={W} height={H - 1450} fill={C.paper2} />
      {labels.map((l, i) => (
        <g key={i} transform={`translate(${120 + i * 225},1450)`}>
          <Domino fall={ramp(t, 27.52 + i * 0.32, 27.9 + i * 0.32)} label={l} color={['#fff', '#F6E3B4', '#E7C9A2', '#CFE3E6'][i]} s={0.9} />
        </g>
      ))}
      <Label t={t} at={28.88} x={540} y={1120} text="CLOSES TOO" size={86} color={C.terra} />
    </g>
  );
};

const S10: React.FC<SceneP> = ({t}) => {
  const rows: [number, number, number][] = [[380, 560, 30.56], [700, 950, 31.2], [380, 1340, 31.72]];
  return (
    <g>
      <rect width={W} height={H} fill="#F6E3B4" />
      <Label t={t} at={30.2} x={540} y={260} text="ONE EMPTY WALLET…" size={76} />
      {rows.map(([x, y, at], i) => (
        <g key={i}>
          <Pop t={t} at={at - 0.35} x={x} y={y} s={1.05}><Wallet t={t} empty={ramp(t, at, at + 0.35)} /></Pop>
          {i < 2 && <Pop t={t} at={at + 0.15} x={(x + rows[i + 1][0]) / 2} y={y + 200} r={i ? 30 : -30}><Txt x={0} y={0} size={110} weight={700} color={C.terra}>↓</Txt></Pop>}
        </g>
      ))}
    </g>
  );
};

// ---------- #3 markets ----------
const S11: React.FC<SceneP> = ({t}) => <NumberCardV t={t} bg={C.navy} num="#3" at={33.3} lines={[[34.54, 'PANIC'], [35.02, 'STOCKS']]} />;

const S12: React.FC<SceneP> = ({t}) => (
  <g>
    <VFloor y={1640} />
    <LineChart t={t} t0={37.5} t1={39.2} pts={[0.85, 0.9, 0.82, 0.6, 0.55, 0.3, 0.12, 0.04]} x={150} y={260} w={780} h={520} color={C.red} />
    <Stamp t={t} at={38.54} x={600} y={560} text="CRASH" size={110} />
    <Pop t={t} at={36.64} x={540} y={1000} r={-4}><rect x={-160} y={-62} width={320} height={124} rx={20} fill={C.red} stroke={C.ink} strokeWidth={6} /><Txt x={0} y={4} size={80} color="#fff" weight={700}>SELL!</Txt></Pop>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <Person t={t + i} x={200 + i * 340} y={1640} s={0.62} kind="adult" tie shirt={[C.navy, C.grey, C.sage][i]} hair={C.ink} mood="o"
          armL={t > 36.64 ? 140 : 15} armR={t > 36.64 ? -140 : -15} />
        <Fly t={t} at={36.8 + i * 0.25} x0={200 + i * 340} y0={1160} x1={140 + i * 360} y1={1240} arc={260} dur={0.9}><g transform={`rotate(${t * 200 + i * 60}) scale(0.5)`}><Doc title="STOCK" /></g></Fly>
      </g>
    ))}
  </g>
);

const S13: React.FC<SceneP> = ({t}) => {
  const fill = ramp(t, 42.44, 42.9, 0.85, 0.42);
  const sad = t > 42.44;
  return (
    <g>
      <VFloor y={1640} />
      <Pop t={t} at={40.94} x={540} y={700} s={1.5}><Jar fill={fill} label="RETIREMENT" /></Pop>
      <Stamp t={t} at={42.8} x={540} y={1110} text="-50%" size={96} />
      <Pop t={t} at={40.28} x={180} y={1640} s={0.72}><Person t={t} x={0} y={0} kind="adult" shirt={C.terra} hair={C.grey} stache mood={sad ? 'o' : 'smile'} armL={sad ? 150 : 12} armR={-12} /></Pop>
      <Pop t={t} at={40.4} x={900} y={1640} s={0.72}><Person t={t + 1} x={0} y={0} kind="adult" shirt={C.sage} hair={C.grey} mood={sad ? 'o' : 'smile'} armL={12} armR={sad ? -150 : -12} flip /></Pop>
    </g>
  );
};

// ---------- #4 printing money ----------
const S14: React.FC<SceneP> = ({t}) => (
  <g>
    <NumberCardV t={t} bg={C.mustard} num="#4" at={44.26} lines={[[45.72, 'PRINT MONEY']]} accent={C.ink} />
    <Pop t={t} at={45.52} x={540} y={1430} s={1.25}><Printer t={t} at={45.72} /></Pop>
  </g>
);

const S15: React.FC<SceneP> = ({t}) => (
  <g>
    <rect width={W} height={H} fill={C.paper} />
    <Label t={t} at={48.3} x={540} y={330} text="PEOPLE FED" size={96} color={C.cashD} />
    {[[230, 'kid', C.terra, C.ink, true], [540, 'adult', C.sage, C.terra, false], [850, 'adult', C.navy, C.ink, false]].map(([x, k, sh, hr, cap], i) => (
      <Person key={i} t={t + i} x={x as number} y={1330} s={0.8} kind={k as 'kid' | 'adult'} shirt={sh as string} hair={hr as string} cap={cap as boolean} stripe={cap as boolean} mood={t > 48.3 ? 'grin' : 'smile'} armL={30} armR={-30} />
    ))}
    <g stroke={C.ink} strokeWidth={6}><rect x={80} y={1180} width={920} height={60} rx={10} fill={C.dirt} /><rect x={140} y={1240} width={30} height={260} fill={C.dirt} /><rect x={910} y={1240} width={30} height={260} fill={C.dirt} /></g>
    <Pop t={t} at={47.74} x={540} y={1120} s={1}><Pot t={t} /></Pop>
    <Sparkle t={t} at={48.4} x={760} y={900} />
  </g>
);

const S16: React.FC<SceneP> = ({t}) => {
  const shrink = ramp(t, 50.8, 51.4, 1, 0.42);
  return (
    <g>
      <rect width={W} height={H} fill={C.paper} />
      {t > 49.46 && Array.from({length: 12}).map((_, i) => {
        const y = ((t - 49.46) * 520 + i * 160) % 1900 - 200;
        return <g key={i} transform={`translate(${80 + (i * 173) % 920},${y}) rotate(${(i * 47) % 60 - 30 + t * 20})`} opacity={0.85}><Bill label="$" w={150} /></g>;
      })}
      <Pop t={t} at={50.8} x={540} y={850} s={shrink * 2.2}><Bill label="$1" w={260} /></Pop>
      <Pop t={t} at={51.02} x={540} y={1250} r={-4}><rect x={-330} y={-80} width={660} height={160} rx={22} fill={C.paper} stroke={C.ink} strokeWidth={6} /><Txt x={0} y={4} size={96} color={C.red} weight={700}>WORTH LESS</Txt></Pop>
    </g>
  );
};

const S17: React.FC<SceneP> = ({t}) => (
  <g>
    <rect width={W} height={H} fill="#F6E3B4" />
    <Pop t={t} at={52.4} x={480} y={760} s={ramp(t, 52.4, 53.7, 1.3, 2.8)} r={-8}><PriceTag label="$$$" color={C.terra} /></Pop>
    <Stamp t={t} at={52.78} x={540} y={1300} text="INFLATION" size={104} />
  </g>
);

// ---------- winners ----------
const S18: React.FC<SceneP> = ({t}) => {
  const items: [number, number, number, string, React.ReactNode][] = [
    [300, 760, 56.46, 'FOOD', <BeanCan s={1.05} />], [780, 760, 57.2, 'MEDS', <PillBottle s={1.1} />],
    [300, 1220, 57.84, 'DELIVERY', <Phone s={1.4} glow />], [780, 1220, 59.14, 'BATS', <g transform="rotate(25)"><Bat s={1.05} /></g>],
  ];
  return (
    <g>
      <rect width={W} height={H} fill={C.sage} />
      <Label t={t} at={55.24} x={460} y={330} text="BOOM" size={170} color={C.paper} />
      <Pop t={t} at={55.24} x={830} y={330} s={0.75}><BigArrow up /></Pop>
      {items.map(([x, y, at, l, el], i) => (
        <g key={i}>
          <Pop t={t} at={at} x={x} y={y}>{el}</Pop>
          <Label t={t} at={at + 0.15} x={x} y={y + 210} text={l} size={58} color={C.paper} />
        </g>
      ))}
      <Sparkle t={t} at={59.46} x={930} y={1050} />
    </g>
  );
};

// ---------- reality check ----------
const S19: React.FC<SceneP> = ({t}) => (
  <g>
    <rect width={W} height={H} fill={C.paper} />
    <Label t={t} at={60.98} x={540} y={520} text="JUST FICTION?" size={100} />
    <Pop t={t} at={60.9} x={540} y={960} s={2.6}><Book color={C.terra} /></Pop>
    <XMark t={t} at={61.4} x={540} y={960} size={190} />
  </g>
);

const S20: React.FC<SceneP> = ({t}) => (
  <g>
    <VFloor y={1640} />
    <Pop t={t} at={62.46} x={540} y={420} s={1.7}><CalendarPage label="" /><Txt x={0} y={28} size={64} weight={700}>2020</Txt></Pop>
    <Label t={t} at={64.62} x={540} y={800} text="SAME THING" size={96} color={C.terra} />
    <Pop t={t} at={63.78} x={200} y={1640} s={0.66}><Person t={t} x={0} y={0} kind="adult" mask shirt={C.navy} hair={C.ink} armL={12} armR={-12} /></Pop>
    <Pop t={t} at={63.95} x={510} y={1640} s={0.66}><Person t={t + 1} x={0} y={0} kind="adult" mask shirt={C.sage} hair={C.terra} armL={12} armR={-12} /></Pop>
    <Pop t={t} at={65.76} x={860} y={1640} s={0.66}><Zombie t={t} x={0} y={0} flip /></Pop>
    <XMark t={t} at={66.22} x={860} y={1330} size={140} />
  </g>
);

// ---------- takeaway ----------
const S21: React.FC<SceneP> = ({t}) => (
  <g>
    <TakeawayCardV t={t} at={67.56} lines={[[68.7, 'Keep an'], [69.1, 'emergency fund.', C.terra]]} />
    <Pop t={t} at={69.5} x={300} y={1240} s={1.15}><Jar fill={ramp(t, 69.6, 71.2, 0.1, 0.9)} label="CASH" /></Pop>
    <Pop t={t} at={72.22} x={780} y={1220} s={1.5}><Clock t={t} speed={0.5} /></Pop>
    <Label t={t} at={72.32} x={540} y={1585} text="cash buys time" size={78} />
  </g>
);

const SCENES: Scene[] = [
  {from: 0, to: 4.3, C: S1}, {from: 4.3, to: 6.45, C: S2}, {from: 6.45, to: 9.0, C: S3}, {from: 9.0, to: 10.5, C: S4},
  {from: 10.5, to: 14.4, C: S5}, {from: 14.4, to: 19.0, C: S6}, {from: 19.0, to: 22.0, C: S7}, {from: 22.0, to: 24.55, C: S8},
  {from: 24.55, to: 30.05, C: S9}, {from: 30.05, to: 33.15, C: S10}, {from: 33.15, to: 36.3, C: S11}, {from: 36.3, to: 40.15, C: S12},
  {from: 40.15, to: 44.1, C: S13}, {from: 44.1, to: 47.35, C: S14}, {from: 47.35, to: 49.3, C: S15}, {from: 49.3, to: 52.35, C: S16},
  {from: 52.35, to: 53.9, C: S17}, {from: 53.9, to: 60.8, C: S18}, {from: 60.8, to: 62.3, C: S19}, {from: 62.3, to: 67.35, C: S20},
  {from: 67.35, to: ZOMBIE_SEC, C: S21},
];

export const ZombieEconomy: React.FC = () => <PaperStage job="jobs/zombie-economy" sec={ZOMBIE_SEC} scenes={SCENES} sfx={SFX} captionChars={26} />;
