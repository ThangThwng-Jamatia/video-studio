// 2D "paper explainer" pilot (user-approved 2026-10-22): original characters, AI voice, word-timed beats.
import React from 'react';
import {Easing} from 'remotion';
import {C, ramp, pop, Pop, Txt, XMark, Person, Car, Stink, House, Cash, Bill, Browser, Clipboard, Bucket, Sponge, Coin, Sparkle, Bubble, Arrow, Street, PaperStage, type Scene, type Sfx} from './kit';

export const PAPER_SEC = 48.5;
// ---------- scenes (absolute seconds; word times from voice.json) ----------
type SceneP = {t: number};
const S1: React.FC<SceneP> = ({t}) => (
  <g>
    <rect width={1920} height={1080} fill={C.paper} />
    <rect y={820} width={1920} height={260} fill={C.paper2} />
    {[0, 1, 2].map((i) => {
      const x = 260 + i * 520 + t * 40;
      return <Person key={i} t={t + i} kind="adult" x={x} y={880} s={0.95} walk={t * 0.9 + i * 0.3} shirt={[C.grey, C.sage, C.navy][i]} pants={C.ink} hair={[C.dirt, C.ink, C.grey][i]} mood={t > 3.5 ? 'o' : 'flat'} armL={8} armR={-8}
        handR={<rect x={-36} y={0} width={72} height={52} rx={8} fill={C.dirt} stroke={C.ink} strokeWidth={5} />} />;
    })}
    {[0, 1, 2].map((i) => <Pop key={i} t={t} at={2.8 + i * 0.12} x={300 + i * 520 + t * 40} y={260} s={1}><Txt x={0} y={0} size={110} color={C.terra} weight={700}>?</Txt></Pop>)}
    <Pop t={t} at={3.6} x={960} y={140} s={0.9} r={-6}>
      <rect x={-260} y={-80} width={520} height={160} rx={18} fill="none" stroke={C.red} strokeWidth={12} />
      <Txt x={0} y={6} size={120} color={C.red} weight={700}>BROKE</Txt>
    </Pop>
  </g>
);

const S2: React.FC<SceneP> = ({t}) => {
  const shake = t > 5.92 && t < 6.4 ? Math.sin(t * 60) * 6 : 0;
  return (
    <g>
      <rect width={1920} height={1080} fill={C.paper} />
      <Pop t={t} at={5.3} x={960} y={540} s={1}>
        <rect x={-230} y={-290} width={460} height={580} rx={20} fill={C.navy} stroke={C.ink} strokeWidth={8} />
        <rect x={-210} y={-270} width={20} height={540} fill="#22303F" />
        <rect x={-150} y={-180} width={330} height={150} rx={10} fill={C.paper} stroke={C.ink} strokeWidth={5} />
        <Txt x={15} y={-130} size={56} weight={700}>MONEY</Txt>
        <Txt x={15} y={-74} size={56} weight={700}>RULES</Txt>
        <Cash w={160} />
        <g transform={`translate(0,40) translate(${shake},0)`}>
          <line x1={-260} y1={110} x2={260} y2={110} stroke={C.grey} strokeWidth={22} strokeDasharray="34 10" />
          <path d="M-36,90 v-34 a36,36 0 0 1 72,0 v34" fill="none" stroke={C.ink} strokeWidth={14} />
          <rect x={-56} y={86} width={112} height={90} rx={14} fill={C.mustard} stroke={C.ink} strokeWidth={6} />
          <circle cx={0} cy={124} r={10} fill={C.ink} />
        </g>
      </Pop>
      <Pop t={t} at={6.38} x={1500} y={300} r={8}><Txt x={0} y={0} size={64} color={C.terra} weight={700}>not taught</Txt><Txt x={0} y={70} size={64} color={C.terra} weight={700}>in school</Txt></Pop>
    </g>
  );
};

const S3: React.FC<SceneP> = ({t}) => (
  <g>
    <rect width={1920} height={1080} fill={C.terra} />
    <Pop t={t} at={8.5} x={960} y={300} s={1}><Txt x={0} y={0} size={260} color={C.mustard} weight={700}>#1</Txt></Pop>
    <Pop t={t} at={9.5} x={960} y={500}><Txt x={0} y={0} size={70} color={C.paper}>Your first business is…</Txt></Pop>
    <Pop t={t} at={10.64} x={640} y={760}>
      <circle r={130} fill={C.paper} stroke={C.ink} strokeWidth={8} />
      <g transform="rotate(-35)"><rect x={-18} y={-20} width={36} height={130} rx={12} fill={C.mustard} stroke={C.ink} strokeWidth={5} /><path d="M-46,-40 a46,46 0 1 1 92,0 l-22,0 l0,-30 l-48,0 l0,30 Z" fill={C.grey} stroke={C.ink} strokeWidth={5} /></g>
      <Txt x={0} y={190} size={64} color={C.paper} weight={700}>A SKILL</Txt>
    </Pop>
    <Pop t={t} at={11.4} x={1280} y={760}>
      <circle r={130} fill={C.paper} stroke={C.ink} strokeWidth={8} />
      <path d="M-70,-30 L0,-64 L70,-30 L70,50 L0,84 L-70,50 Z M-70,-30 L0,4 L70,-30 M0,4 L0,84" fill="#D9B27C" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <Txt x={0} y={190} size={64} color={C.paper} weight={700}>A PRODUCT</Txt>
    </Pop>
    <XMark t={t} at={11.75} x={1280} y={760} size={110} />
  </g>
);

const S4: React.FC<SceneP> = ({t}) => {
  const walkIn = ramp(t, 12.6, 13.4);
  const pan = ramp(t, 15.1, 15.9, 0, -620);
  const waving = t > 13.0 && t < 14.4;
  return (
    <g transform={`translate(${pan},0)`}>
      <Street />
      <Person t={t} x={-200 + walkIn * 900} y={900} cap stripe walk={walkIn < 1 ? t * 1.6 : 0} armL={10} armR={waving ? -150 + Math.sin(t * 14) * 18 : -10} mood="grin" />
      <Pop t={t} at={14.3} x={880} y={330} r={-6}><circle r={74} fill={C.mustard} stroke={C.ink} strokeWidth={6} /><Txt x={0} y={-10} size={68} weight={700}>12</Txt><Txt x={0} y={40} size={26}>years old</Txt></Pop>
      <Car x={1650} y={905} dirt={1} />
      <Person t={t} kind="adult" x={2080} y={905} stache shirt={C.mustard} pants={C.navy} hair={C.dirt} mood={t > 16.2 ? 'o' : 'flat'} armL={20} armR={-30} />
      <Stink t={t} x={1650} y={700} o={ramp(t, 16.1, 16.5)} />
    </g>
  );
};

const S5: React.FC<SceneP> = ({t}) => (
  <g>
    <rect width={1920} height={1080} fill={C.paper} />
    <rect y={860} width={1920} height={220} fill={C.paper2} />
    <Person t={t} x={960} y={900} cap stripe armL={t > 18 ? 55 : 10} armR={t > 18 ? -55 : -10} mood="flat" />
    <Pop t={t} at={18.6} x={440} y={420}><Cash w={220} /></Pop><XMark t={t} at={18.9} x={440} y={420} size={110} />
    <Pop t={t} at={19.28} x={960} y={200}><Browser /></Pop><XMark t={t} at={19.6} x={960} y={200} size={110} />
    <Pop t={t} at={20.14} x={1480} y={420}><Clipboard /></Pop><XMark t={t} at={20.45} x={1480} y={420} size={110} />
  </g>
);

const S6: React.FC<SceneP> = ({t}) => {
  const z = ramp(t, 21.3, 23.9, 1, 1.12);
  return (
    <g transform={`translate(960,620) scale(${z}) translate(-960,-620)`}>
      <rect width={1920} height={1080} fill={C.sage} />
      <circle cx={960} cy={540} r={420} fill={C.paper} opacity={0.35} />
      <Person t={t} x={960} y={960} s={1.25} cap stripe mood="grin"
        armL={t > 21.82 ? 25 : 10} armR={t > 22.44 ? -150 : -10}
        handL={t > 21.82 ? <g transform={`scale(${pop(t, 21.82)})`}><g transform="translate(0,60)"><Bucket /></g></g> : null}
        handR={t > 22.44 ? <g transform={`scale(${pop(t, 22.44)})`}><Sponge s={1.1} /></g> : null} />
      <Sparkle t={t} at={22.5} x={1290} y={300} />
      <Sparkle t={t} at={22.7} x={640} y={360} s={0.7} />
    </g>
  );
};

const S7: React.FC<SceneP> = ({t}) => {
  const scrub = t > 23.9 && t < 24.8 ? Math.sin(t * 30) * 25 : 0;
  return (
    <g>
      <rect width={1920} height={1080} fill={C.paper} />
      <rect y={860} width={1920} height={220} fill={C.ground} />
      <Car x={760} y={900} s={1.4} dirt={1 - ramp(t, 23.95, 24.7)} />
      <Person t={t} x={1260} y={900} cap stripe armR={-120 + scrub} armL={-30} flip mood="grin" handL={<Sponge s={0.8} />} />
      {[0, 1, 2, 3].map((i) => <Sparkle key={i} t={t} at={24.5 + i * 0.12} x={440 + i * 220} y={620 - (i % 2) * 120} />)}
      <Pop t={t} at={24.82} x={1350} y={300} r={-6}><Bill label="$10" w={300} /></Pop>
    </g>
  );
};

const S8: React.FC<SceneP> = ({t}) => {
  const hx = [260, 760, 1260, 1760];
  return (
    <g>
      <rect width={1920} height={1080} fill={C.paper} />
      <rect y={850} width={1920} height={230} fill={C.ground} />
      <line x1={0} y1={850} x2={1920} y2={850} stroke={C.ink} strokeWidth={6} />
      {hx.map((x, i) => <House key={i} x={x} y={850} w={250} h={220} body={i % 2 ? '#CFD8C0' : '#E7C9A2'} roof={i % 2 ? C.terra : C.sage} />)}
      <Person t={t} kind="adult" x={400} y={950} s={0.7} stache shirt={C.mustard} hair={C.dirt} armR={-60} armL={10} mood="smile" />
      {[[26.72, 260], [27.6, 760], [29.0, 1260]].map(([at, x], i) => (
        <Pop key={i} t={t} at={at} x={x + 40} y={240}>
          <Bubble w={210} h={140}><g transform="translate(0,20) scale(0.32)"><Car x={0} y={0} /></g><Txt x={0} y={-40} size={34} color={C.cashD} weight={700}>$10!</Txt></Bubble>
        </Pop>
      ))}
      <Arrow t={t} a={27.24} x1={330} x2={700} y={520} />
      <Arrow t={t} a={28.66} x1={830} x2={1200} y={520} />
      <Pop t={t} at={29.6} x={1760} y={300}><Txt x={0} y={0} size={110} color={C.terra} weight={700}>…</Txt></Pop>
    </g>
  );
};

const S9: React.FC<SceneP> = ({t}) => {
  const month = t < 30.6 ? 'JUN' : t < 31.0 ? 'JUL' : 'AUG';
  const sunY = ramp(t, 30.2, 31.2, 420, 200);
  return (
    <g>
      <rect width={1920} height={1080} fill="#F6E3B4" />
      <g transform={`translate(300,${sunY})`}><circle r={110} fill={C.mustard} stroke={C.ink} strokeWidth={6} />
        {Array.from({length: 10}).map((_, i) => <line key={i} transform={`rotate(${i * 36 + t * 20})`} x1={0} y1={-140} x2={0} y2={-180} stroke={C.mustard} strokeWidth={14} strokeLinecap="round" />)}</g>
      <g transform="translate(1560,260)"><rect x={-120} y={-120} width={240} height={240} rx={16} fill="#fff" stroke={C.ink} strokeWidth={6} /><rect x={-120} y={-120} width={240} height={70} rx={16} fill={C.terra} stroke={C.ink} strokeWidth={6} />
        <Txt x={0} y={30} size={90} weight={700}>{month}</Txt></g>
      <rect y={860} width={1920} height={220} fill="#C9D3A6" />
      <Pop t={t} at={31.4} x={960} y={900}>
        <g stroke={C.ink} strokeWidth={8}><line x1={-140} y1={0} x2={60} y2={-200} /><line x1={140} y1={0} x2={-40} y2={-150} /><path d="M-160,-150 L120,-150 L60,-320 L-100,-330 Z" fill={C.terra} strokeLinejoin="round" /></g>
        <Person t={t} x={-10} y={-80} s={0.9} cap stripe shades mood="grin" armL={60} armR={-150} />
      </Pop>
      <Pop t={t} at={32.4} x={1450} y={680}><Sponge s={2} /></Pop>
      <XMark t={t} at={32.66} x={1450} y={680} size={100} />
    </g>
  );
};

const S10: React.FC<SceneP> = ({t}) => {
  const sc = (k: number) => (t > 34 ? Math.sin(t * 24 + k) * 22 : 0);
  return (
    <g>
      <rect width={1920} height={1080} fill={C.paper} />
      <rect y={860} width={1920} height={220} fill={C.ground} />
      <Car x={420} y={900} s={0.95} color={C.terra} dirt={0.6 - ramp(t, 34.2, 35.5, 0, 0.6)} />
      <Car x={1080} y={900} s={0.95} color={C.navy} dirt={0.6 - ramp(t, 34.4, 35.7, 0, 0.6)} />
      <Pop t={t} at={34.0} x={690} y={920}><Person t={t} x={0} y={0} s={0.8} shirt={C.sage} hair={C.dirt} flip armR={-120 + sc(0)} handR={<Sponge s={0.7} />} /></Pop>
      <Pop t={t} at={34.2} x={1350} y={920}><Person t={t + 1} x={0} y={0} s={0.8} shirt={C.mustard} hair={C.ink} flip armR={-120 + sc(2)} handR={<Sponge s={0.7} />} /></Pop>
      <Person t={t} x={1700} y={920} cap stripe armL={10} armR={-60} mood="grin" handR={<g transform="scale(0.5)"><Clipboard /></g>} />
      {[0, 1, 2, 3].map((i) => {
        const at = 35.3 + i * 0.15;
        const p = ramp(t, at, at + 0.6);
        if (p <= 0 || p >= 1) return null;
        const x0 = i % 2 ? 1350 : 690, x1 = 1700;
        const x = x0 + (x1 - x0) * p, y = 600 - Math.sin(p * Math.PI) * 300;
        return <g key={i} transform={`translate(${x},${y})`}><Coin /></g>;
      })}
      <Pop t={t} at={35.9} x={1700} y={240} r={6}><circle r={80} fill={C.cash} stroke={C.ink} strokeWidth={6} /><Txt x={0} y={4} size={60} color={C.paper} weight={700}>cut</Txt></Pop>
    </g>
  );
};

const S11: React.FC<SceneP> = ({t}) => {
  const glow = 0.5 + Math.sin(t * 6) * 0.2;
  return (
    <g>
      <rect width={1920} height={1080} fill={C.mustard} />
      <Pop t={t} at={37.1} x={960} y={250}>
        <circle r={150} fill="#fff" opacity={glow * 0.6} />
        <path d="M-60,30 a80,80 0 1 1 120,0 l-16,40 l-88,0 Z" fill="#FFF3B0" stroke={C.ink} strokeWidth={7} />
        <rect x={-40} y={74} width={80} height={36} rx={8} fill={C.grey} stroke={C.ink} strokeWidth={6} />
      </Pop>
      <Pop t={t} at={37.42} x={960} y={480}><Txt x={0} y={0} size={110} weight={700}>THE LESSON</Txt></Pop>
      <Pop t={t} at={38.66} x={960} y={640}><Txt x={0} y={0} size={62}>Rich people don't start with…</Txt></Pop>
      <Pop t={t} at={39.8} x={960} y={850}>
        <path d="M-90,-40 Q-120,90 0,96 Q120,90 90,-40 Q60,-80 30,-90 L46,-120 L-46,-120 L-30,-90 Q-60,-80 -90,-40 Z" fill="#C9A46A" stroke={C.ink} strokeWidth={7} />
        <Txt x={0} y={14} size={80} color={C.ink} weight={700}>$</Txt>
      </Pop>
      <XMark t={t} at={40.1} x={960} y={850} size={110} />
    </g>
  );
};

const S12: React.FC<SceneP> = ({t}) => {
  const gone = ramp(t, 43.3, 43.7);
  return (
    <g>
      <rect width={1920} height={1080} fill={C.paper} />
      <rect y={860} width={1920} height={220} fill={C.paper2} />
      <Pop t={t} at={41.4} x={500} y={0}>
        <g opacity={1 - gone} transform={`scale(${1 - gone * 0.5})`}>
          <g transform="translate(0,820) scale(0.9)"><Car x={0} y={0} dirt={1} /></g>
          <g transform="translate(0,420)" fill={C.grey} stroke={C.ink} strokeWidth={6}><ellipse cx={-60} cy={0} rx={110} ry={60} /><ellipse cx={60} cy={-20} rx={110} ry={70} /><ellipse cx={0} cy={20} rx={150} ry={50} /></g>
          {[-60, 0, 60].map((dx, i) => <line key={i} x1={dx} y1={490 + ((t * 300 + i * 40) % 80)} x2={dx - 10} y2={520 + ((t * 300 + i * 40) % 80)} stroke="#4F86A8" strokeWidth={8} strokeLinecap="round" />)}
          <Pop t={t} at={41.74} x={0} y={230}><rect x={-170} y={-50} width={340} height={100} rx={20} fill={C.red} /><Txt x={0} y={4} size={64} color="#fff" weight={700}>PROBLEM</Txt></Pop>
        </g>
        {gone > 0 && gone < 1 && <g transform={`translate(0,620) scale(${0.5 + gone})`} opacity={1 - gone} fill="#fff" stroke={C.ink} strokeWidth={6}><circle cx={-60} cy={0} r={70} /><circle cx={50} cy={-30} r={80} /><circle cx={40} cy={50} r={60} /></g>}
        {[0, 1, 2].map((i) => <Sparkle key={i} t={t} at={43.5 + i * 0.1} x={-150 + i * 150} y={600 + (i % 2) * 120} />)}
      </Pop>
      <Pop t={t} at={42.4} x={1350} y={920}>
        <Person t={t} x={0} y={0} kind="adult" tie shirt={C.navy} hair={C.ink} flip armR={-70} armL={10} mood="smile" handR={<g transform="rotate(-20)"><Bill label="$" w={150} /></g>} />
      </Pop>
      <Pop t={t} at={42.72} x={960} y={420}><Txt x={0} y={0} size={70} color={C.cashD} weight={700}>will pay</Txt></Pop>
    </g>
  );
};

const S13: React.FC<SceneP> = ({t}) => {
  const hand = ramp(t, 45.2, 45.8);
  const step = ramp(t, 46.1, 46.8);
  return (
    <g>
      <rect width={1920} height={1080} fill={C.paper} />
      <rect y={860} width={1920} height={220} fill={C.ground} />
      <Person t={t} x={600} y={900} shirt={C.sage} hair={C.dirt} armR={hand > 0.9 ? -100 : -20} mood={hand > 0.9 ? 'grin' : 'smile'} />
      {hand < 1 ? <g transform={`translate(${1150 - hand * 420},${560 - Math.sin(hand * Math.PI) * 120})`}><Sponge s={1} /></g>
        : <g transform="translate(730,560)"><Sponge s={1} /></g>}
      <g transform={`translate(${step * 260},${-step * 120})`}>
        {step > 0 && <rect x={1080} y={900 - 120 * step} width={260} height={120 * step + 2} rx={8} fill={C.terra} stroke={C.ink} strokeWidth={6} />}
        <Person t={t} x={1210} y={900} cap stripe flip armR={hand < 1 ? -60 : 10} armL={step > 0.5 ? 150 : 10} mood="grin" />
      </g>
      <Pop t={t} at={46.4} x={960} y={200}><Txt x={0} y={0} size={84} weight={700} color={C.terra}>Sell a skill. Then step back.</Txt></Pop>
    </g>
  );
};

const SCENES: Scene[] = [
  {from: 0, to: 5.0, C: S1}, {from: 5.0, to: 8.2, C: S2}, {from: 8.2, to: 12.8, C: S3}, {from: 12.8, to: 17.8, C: S4},
  {from: 17.8, to: 21.3, C: S5}, {from: 21.3, to: 23.9, C: S6}, {from: 23.9, to: 25.9, C: S7}, {from: 25.9, to: 30.2, C: S8},
  {from: 30.2, to: 33.7, C: S9}, {from: 33.7, to: 37.0, C: S10}, {from: 37.0, to: 41.0, C: S11}, {from: 41.0, to: 45.0, C: S12},
  {from: 45.0, to: PAPER_SEC, C: S13},
];

const SFX: Sfx[] = [
  [3.6, 'impact', 0.5], [5.2, 'whoosh', 0.35], [5.92, 'click', 0.5], [8.2, 'whoosh', 0.4], [8.5, 'pop', 0.5], [11.75, 'glitch', 0.25],
  [12.8, 'whoosh', 0.35], [14.3, 'pop', 0.45], [18.6, 'pop', 0.4], [19.28, 'pop', 0.4], [20.14, 'pop', 0.4], [21.82, 'pop', 0.4],
  [22.44, 'pop', 0.4], [24.82, 'ding', 0.5], [26.72, 'pop', 0.35], [27.6, 'pop', 0.35], [29.0, 'pop', 0.35], [30.6, 'click', 0.4],
  [31.0, 'click', 0.4], [32.66, 'click', 0.4], [35.3, 'ding', 0.35], [37.42, 'swell_hit', 0.4], [40.1, 'impact', 0.4],
  [43.34, 'whoosh', 0.45], [46.4, 'swell_hit', 0.35],
];

export const PaperPilot: React.FC = () => <PaperStage job="jobs/paper-pilot" sec={PAPER_SEC} scenes={SCENES} sfx={SFX} />;
