// "How Rich and Poor Kids Get Their First Paycheck": 9:16 paper short (1080x1920), 2026-10-24.
// Word times from public/jobs/first-paycheck/words.txt (George voice).
import React from 'react';
import {
  C, ramp, Pop, Txt, XMark, Person, Bill, Coin, Sparkle, Label, Stamp, LineChart, Fly, Jar, Tree, Sneaker, Phone, CreditCard,
  CalendarPage, Clock, NumberCardV, TakeawayCardV, PaperStage, type Scene,
} from './kit';
import {SFX} from './firstPaycheckSfx';

export const PAYCHECK_SEC = 62.9;
const W = 1080, H = 1920;
type SceneP = {t: number};
const VFloor: React.FC<{bg?: string; ground?: string; y?: number}> = ({bg = C.paper, ground = C.paper2, y = 1350}) => (
  <g><rect width={W} height={H} fill={bg} /><rect y={y} width={W} height={H - y} fill={ground} /><line x1={0} y1={y} x2={W} y2={y} stroke={C.ink} strokeWidth={6} /></g>
);
type Who = {t: number; x: number; y: number; s?: number; mood?: 'smile' | 'flat' | 'o' | 'grin'; armL?: number; armR?: number; flip?: boolean; handL?: React.ReactNode; handR?: React.ReactNode; walk?: number};
const Sam: React.FC<Who> = (p) => <Person kind="adult" cap stripe {...p} />;
const Leo: React.FC<Who> = (p) => <Person kind="adult" shirt={C.navy} hair={C.ink} {...p} />;

// ---------- hook ----------
const S1: React.FC<SceneP> = ({t}) => (
  <g>
    <VFloor />
    <Label t={t} at={0.88} x={540} y={330} text="SAME AGE" size={110} />
    <Label t={t} at={1.88} x={540} y={470} text="SAME FIRST JOB" size={96} color={C.terra} />
    <Pop t={t} at={0.0} x={320} y={1480} s={0.95}><Sam t={t} x={0} y={0} /></Pop>
    <Pop t={t} at={0.16} x={760} y={1480} s={0.95}><Leo t={t + 1} x={0} y={0} flip /></Pop>
  </g>
);

const S2: React.FC<SceneP> = ({t}) => (
  <g>
    <rect width={W / 2} height={H} fill={C.sage} /><rect x={W / 2} width={W / 2} height={H} fill="#E3A08F" />
    <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke={C.ink} strokeWidth={8} />
    <Pop t={t} at={4.04} x={540} y={250}><rect x={-200} y={-70} width={400} height={140} rx={24} fill={C.paper} stroke={C.ink} strokeWidth={6} /><Txt x={0} y={4} size={96} weight={700}>BY 30…</Txt></Pop>
    <Label t={t} at={5.06} x={270} y={520} text="RICH" size={120} color={C.paper} />
    <Label t={t} at={6.04} x={810} y={520} text="BROKE" size={120} color={C.red} />
    <Sam t={t} x={270} y={1450} s={0.85} mood={t > 5.06 ? 'grin' : 'smile'} armL={t > 5.06 ? 150 : 12} armR={t > 5.06 ? -150 : -12} />
    <Leo t={t} x={810} y={1450} s={0.85} mood={t > 6.04 ? 'o' : 'flat'} flip />
    <Sparkle t={t} at={5.2} x={420} y={720} />
    <Pop t={t} at={5.3} x={270} y={1600} s={0.8}><Bill label="$$$" w={240} /></Pop>
    <Pop t={t} at={6.2} x={810} y={1600} s={0.8}><Bill label="$0" w={240} /></Pop>
  </g>
);

const S3: React.FC<SceneP> = ({t}) => (
  <g>
    <rect width={W} height={H} fill="#F6E3B4" />
    <Label t={t} at={8.28} x={540} y={420} text="THE FIRST" size={100} />
    <Label t={t} at={8.86} x={540} y={560} text="PAYCHECK" size={140} color={C.terra} />
    <Pop t={t} at={8.86} x={540} y={1050} s={ramp(t, 8.86, 10.6, 2.2, 2.5)} r={-6}><Bill label="$200" w={300} /></Pop>
    <Sparkle t={t} at={9.1} x={850} y={860} />
  </g>
);

// ---------- #1 Leo spends ----------
const S4: React.FC<SceneP> = ({t}) => <NumberCardV t={t} bg={C.terra} num="#1" at={10.86} lines={[[11.44, 'LEO'], [13.24, 'GETS $200']]} />;

const S5: React.FC<SceneP> = ({t}) => {
  const out = t > 18.56;
  return (
    <g>
      <VFloor y={1500} />
      <Label t={t} at={16.34} x={540} y={260} text="SAME NIGHT" size={96} />
      <Pop t={t} at={15.66} x={540} y={620} s={2.3}><Sneaker /></Pop>
      <Sparkle t={t} at={15.8} x={820} y={500} />
      <Leo t={t} x={300} y={1500} s={0.9} mood="grin" armR={-60} />
      <Fly t={t} at={17.72} x0={1100} y0={900} x1={420} y1={1000} arc={200} dur={0.5}><Bill label="IN" w={180} /></Fly>
      {out && <Fly t={t} at={18.56} x0={420} y0={1000} x1={1200} y1={700} arc={250} dur={0.6}><Bill label="OUT" w={180} /></Fly>}
      <Label t={t} at={17.72} x={780} y={1180} text="IN…" size={84} color={C.cashD} />
      <Label t={t} at={18.7} x={780} y={1300} text="…OUT" size={84} color={C.red} />
    </g>
  );
};

// ---------- #2 Sam saves ----------
const S6: React.FC<SceneP> = ({t}) => <NumberCardV t={t} bg={C.sage} num="#2" at={19.98} lines={[[21.02, 'SAM'], [22.64, 'GETS $200']]} />;

const S7: React.FC<SceneP> = ({t}) => {
  const fill = ramp(t, 25.7, 26.9, 0.05, 0.4);
  return (
    <g>
      <VFloor y={1560} />
      <Label t={t} at={24.12} x={540} y={250} text="BEFORE SPENDING…" size={80} />
      <Pop t={t} at={23.9} x={300} y={600} s={1.4}><Bill label="$200" w={260} /></Pop>
      <Pop t={t} at={25.5} x={780} y={760} s={1.5}><Jar fill={fill} label="SAVINGS" /></Pop>
      {[0, 1, 2, 3].map((i) => (
        <Fly key={i} t={t} at={25.7 + i * 0.18} x0={300} y0={600} x1={780} y1={700} arc={220} dur={0.55}><Coin /></Fly>
      ))}
      <Pop t={t} at={25.7} x={780} y={420} s={1}><PriceTag40 /></Pop>
      <Label t={t} at={28.1} x={540} y={1140} text="PAY YOURSELF" size={96} color={C.cashD} />
      <Label t={t} at={28.52} x={540} y={1260} text="FIRST" size={110} color={C.cashD} />
      <Sam t={t} x={220} y={1560} s={0.6} mood={t > 28.1 ? 'grin' : 'smile'} armR={t > 28.1 ? -150 : -12} />
    </g>
  );
};
const PriceTag40 = () => (<g><rect x={-90} y={-50} width={180} height={100} rx={20} fill={C.mustard} stroke={C.ink} strokeWidth={6} /><Txt x={0} y={4} size={64} weight={700}>$40</Txt></g>);

// ---------- #3 Leo borrows ----------
const S8: React.FC<SceneP> = ({t}) => <NumberCardV t={t} bg={C.navy} num="#3" at={30.84} lines={[[31.28, 'LEO'], [31.7, 'BORROWS']]} />;

const S9: React.FC<SceneP> = ({t}) => (
  <g>
    <VFloor y={1560} />
    {[0, 1, 2].map((i) => (
      <Pop key={i} t={t} at={33.12 + i * 0.1} x={260 + i * 280} y={430} s={1.1} r={(i - 1) * 8}><Phone glow /></Pop>
    ))}
    <Label t={t} at={33.28} x={540} y={650} text="NEW PHONES" size={80} />
    <Pop t={t} at={34.44} x={540} y={900} s={1.5} r={-8}><CreditCard /></Pop>
    <Label t={t} at={36.22} x={540} y={1150} text="NEXT PAYCHECK:" size={78} />
    <Stamp t={t} at={37.16} x={540} y={1290} text="ALREADY SPENT" size={80} />
    <Leo t={t} x={920} y={1560} s={0.55} mood={t > 37.16 ? 'o' : 'grin'} armL={t > 37.16 ? 150 : 12} armR={-12} />
  </g>
);

// ---------- #4 Sam invests ----------
const S10: React.FC<SceneP> = ({t}) => <NumberCardV t={t} bg={C.mustard} num="#4" at={38.98} lines={[[39.86, 'SAM'], [41.96, 'INVESTS']]} accent={C.ink} />;

const S11: React.FC<SceneP> = ({t}) => {
  const g = ramp(t, 46.6, 48.7, 0.25, 1);
  return (
    <g>
      <VFloor y={1560} ground={C.ground} />
      <Label t={t} at={43.5} x={540} y={240} text="EVERY MONTH" size={88} />
      <LineChart t={t} t0={43.6} t1={45.4} pts={[0.06, 0.12, 0.2, 0.3, 0.42, 0.56, 0.74, 0.94]} x={160} y={320} w={760} h={420} color={C.cashD} fillArea />
      <Label t={t} at={45.14} x={540} y={810} text="IT GROWS" size={88} color={C.cashD} />
      <g transform="translate(540,1560)"><Tree g={g} s={1.25} coins={t > 48.62} /></g>
      {[0, 1, 2].map((i) => <Fly key={i} t={t} at={46.6 + i * 0.25} x0={150 + i * 60} y0={1500} x1={540} y1={1500} arc={160} dur={0.5}><Coin /></Fly>)}
      <Sparkle t={t} at={48.62} x={820} y={1000} />
      <Sam t={t} x={900} y={1560} s={0.5} mood="grin" flip />
    </g>
  );
};

// ---------- #5 ten years ----------
const S12: React.FC<SceneP> = ({t}) => <NumberCardV t={t} bg={C.terra} num="#5" at={50.0} lines={[[50.94, '10 YEARS'], [52.08, 'LATER']]} />;

const S13: React.FC<SceneP> = ({t}) => (
  <g>
    <rect width={W} height={H / 2} fill="#E3A08F" /><rect y={H / 2} width={W} height={H / 2} fill={C.sage} />
    <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke={C.ink} strokeWidth={8} />
    <Leo t={t} x={260} y={900} s={0.7} mood="flat" />
    <Pop t={t} at={53.44} x={700} y={420} s={1.3}><CalendarPage label="PAY" /></Pop>
    <Pop t={t} at={53.76} x={820} y={720} s={0.9}><Clock t={t} speed={2} /></Pop>
    <Label t={t} at={53.28} x={600} y={200} text="STILL WAITING" size={72} />
    <g transform="translate(330,1700)"><Tree g={1} s={0.9} coins /></g>
    {t > 55.82 && [0, 1, 2, 3].map((i) => <Fly key={i} t={t} at={55.82 + i * 0.15} x0={330} y0={1450} x1={820} y1={1450} arc={180} dur={0.5}><Coin /></Fly>)}
    <Sam t={t} x={820} y={1700} s={0.62} mood={t > 56.04 ? 'grin' : 'smile'} armL={t > 56.04 ? 150 : 12} armR={-60} flip />
    <Label t={t} at={56.04} x={540} y={1080} text="MONEY PAYS SAM" size={78} color={C.paper} />
    <Sparkle t={t} at={56.26} x={930} y={1250} />
    <XMark t={t} at={54.06} x={700} y={420} size={110} />
  </g>
);

// ---------- takeaway ----------
const S14: React.FC<SceneP> = ({t}) => (
  <g>
    <TakeawayCardV t={t} at={57.42} lines={[[57.7, 'Not how much'], [58.56, 'you earn…'], [59.6, "It's what you do"], [60.82, 'with dollar #1.', C.terra]]} />
    <Pop t={t} at={60.9} x={540} y={1380} s={3}><Coin /></Pop>
    <Sparkle t={t} at={61.0} x={680} y={1240} />
  </g>
);

const SCENES: Scene[] = [
  {from: 0, to: 3.3, C: S1}, {from: 3.3, to: 7.4, C: S2}, {from: 7.4, to: 10.75, C: S3}, {from: 10.75, to: 14.8, C: S4},
  {from: 14.8, to: 19.85, C: S5}, {from: 19.85, to: 23.7, C: S6}, {from: 23.7, to: 30.7, C: S7}, {from: 30.7, to: 32.9, C: S8},
  {from: 32.9, to: 38.85, C: S9}, {from: 38.85, to: 43.35, C: S10}, {from: 43.35, to: 49.85, C: S11}, {from: 49.85, to: 52.7, C: S12},
  {from: 52.7, to: 57.3, C: S13}, {from: 57.3, to: PAYCHECK_SEC, C: S14},
];

export const FirstPaycheck: React.FC = () => <PaperStage job="jobs/first-paycheck" sec={PAYCHECK_SEC} scenes={SCENES} sfx={SFX} captionChars={26} />;
