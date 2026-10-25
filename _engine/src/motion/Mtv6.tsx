// motion-explainer test: voice from Raw Clips V:O/Shorts/MTVideo 6.MP4 ("your feed shapes who you become"), 9:16, night → sky at the turn.
import React from 'react';
import {AppWindow, Chip, Dust, Glass, GridFloor, Haze, ListRoll, Lockup, makeAt, MxStage, Scene, Sfx, useWorld, Volt, ramp} from './mxKit';
import {WORDS} from './mtv6Words';

const at = makeAt(WORDS);
export const MTV6_SEC = 33.4;

// one link of the content → thoughts → actions → you chain: previous chip, arrow, new chip
const Link: React.FC<{t: number; a: [string, string]; b: [string, string]; atA: number; atB: number}> = ({t, a, b, atA, atB}) => {
  const W = useWorld();
  const k = ramp(t, atB - 0.3, atB);
  return (
    <>
      <Chip t={t} at={atA} x="50%" y="34%" icon={a[0]} label={a[1]} size={200} />
      <div style={{position: 'absolute', left: '50%', top: '47%', width: 8, height: 180 * k, background: `linear-gradient(${W.accent2}, ${W.accent})`, transform: 'translateX(-50%)', borderRadius: 4, boxShadow: `0 0 20px ${W.accent}`}} />
      <Chip t={t} at={atB} x="50%" y="66%" icon={b[0]} label={b[1]} size={200} />
    </>
  );
};

const SCENES: Scene[] = [
  {from: 0, to: at('the'), in: 'cut', C: ({t}) => (<><Haze t={t} /><Dust t={t} /><Lockup t={t} y="42%" size={190} words={[{w: 'WATCH', at: 0.02, s: 'glitch'}, {w: 'this.', at: at('this'), s: 'serif', br: true}]} /><Volt t={t} x="50%" y="72%" s={1.5} mood="wow" /></>)},
  {from: at('the'), to: at('slowly'), in: 'pixel', C: ({t}) => (<><Haze t={t} /><Lockup t={t} y="40%" size={150} words={[{w: 'the', at: at('the'), s: 'small'}, {w: 'content', at: at('content'), s: 'body'}, {w: 'you watch', at: at('you'), s: 'body', br: true}, {w: 'ONLINE', at: at('online'), s: 'hero', br: true}]} /><Chip t={t} at={at('watch', 2)} x="28%" y="70%" icon="📱" /><Chip t={t} at={at('watch', 2) + 0.1} x="50%" y="74%" icon="▶️" /><Chip t={t} at={at('watch', 2) + 0.2} x="72%" y="70%" icon="💬" /></>)},
  {from: at('slowly'), to: at('how'), in: 'glitch', C: ({t}) => (<><Haze t={t} /><GridFloor t={t} y={62} /><Lockup t={t} y="26%" size={74} words={[{w: 'slowly starts', at: at('slowly'), s: 'small'}, {w: 'REPROGRAMMING', at: at('reprogramming'), s: 'glitch', br: true}, {w: 'your brain', at: at('your'), s: 'serif', br: true}]} /><AppWindow t={t} at={at('reprogramming') + 0.1} x="50%" y="60%" w={820} title="brain.exe" lines={['> update installing…', 'beliefs   ▓▓▓▓▓░ 71%', 'habits    ▓▓▓░░░ 48%']} /></>)},
  {from: at('how'), to: at('and', 2), cam: 'drift', C: ({t}) => (<><Haze t={t} /><Lockup t={t} y="28%" size={110} words={[{w: 'it shapes', at: at('how'), s: 'small'}]} /><ListRoll t={t} x="16%" y="50%" size={84} items={[{w: 'how you think.', at: at('how')}, {w: 'how you act.', at: at('how', 2)}, {w: 'how you see the world.', at: at('how', 3)}]} /></>)},
  {from: at('and', 2), to: at('if'), C: ({t}) => (<><Haze t={t} /><Lockup t={t} y="45%" size={140} words={[{w: 'and almost', at: at('and', 2), s: 'small'}, {w: 'EVERYTHING.', at: at('everything'), s: 'hero', br: true}]} /><Volt t={t} x="50%" y="70%" s={1.2} mood="wow" at={at('everything')} /></>)},
  {from: at('if'), to: at('that', 2), in: 'push', C: ({t}) => (<><Haze t={t} /><Lockup t={t} y="20%" size={120} words={[{w: 'just look at', at: at('take'), s: 'small'}, {w: 'my', at: at('my'), s: 'body'}, {w: 'FEED', at: at('feed'), s: 'mark'}]} />{[0, 1, 2].map((i) => <Glass key={i} t={t} at={at('example') + i * 0.2} x={`${30 + i * 20}%`} y={`${52 + (i % 2) * 10}%`} w={300} h={420} tilt={-12 + i * 12}><div style={{height: 230, borderRadius: 16, background: ['#FF5A3C', '#3EE6D0', '#8B6CFF'][i], opacity: 0.85}} /><div style={{marginTop: 18, height: 18, width: '80%', borderRadius: 9, background: '#ffffff44'}} /><div style={{marginTop: 12, height: 18, width: '55%', borderRadius: 9, background: '#ffffff2a'}} /></Glass>)}</>)},
  {from: at('that', 2), to: at('the', 4), in: 'blur', C: ({t}) => (<><Haze t={t} /><Lockup t={t} y="36%" size={140} words={[{w: 'that’s why', at: at('that', 2), s: 'small'}, {w: 'I am', at: at('i'), s: 'body', br: true}, {w: 'the way', at: at('the', 3), s: 'big', br: true}, {w: 'I am.', at: at('i', 2), s: 'serif'}]} /><Volt t={t} x="50%" y="74%" s={1.2} mood="sly" at={at('that', 2) + 0.2} /></>)},
  {from: at('the', 4), to: at('and', 3), in: 'push', C: ({t}) => (<><Haze t={t} /><Lockup t={t} y="15%" size={135} words={[{w: 'what you', at: at('the', 4), s: 'small'}, {w: 'WATCH', at: at('watch', 3), s: 'big'}]} /><Link t={t} a={['📺', 'Content']} b={['🧠', 'Thoughts']} atA={at('content', 2)} atB={at('think', 2)} /></>)},
  {from: at('and', 3), to: at('and', 4), in: 'push', C: ({t}) => (<><Haze t={t} /><Lockup t={t} y="15%" size={135} words={[{w: 'how you', at: at('and', 3), s: 'small'}, {w: 'THINK', at: at('think', 3), s: 'big'}]} /><Link t={t} a={['🧠', 'Thoughts']} b={['⚙️', 'Actions']} atA={at('and', 3)} atB={at('operate')} /></>)},
  {from: at('and', 4), to: at('and', 5), in: 'push', C: ({t}) => (<><Haze t={t} /><Lockup t={t} y="15%" size={135} words={[{w: 'how you', at: at('and', 4), s: 'small'}, {w: 'OPERATE', at: at('operate', 2), s: 'big'}]} /><Link t={t} a={['⚙️', 'Actions']} b={['🫵', 'Who you are']} atA={at('and', 4)} atB={at('who')} /></>)},
  {from: at('and', 5), to: at("that's"), in: 'iris', C: ({t}) => (<><Haze t={t} /><Dust t={t} n={70} /><Lockup t={t} y="42%" size={150} words={[{w: 'and who you’re', at: at('who', 2), s: 'small'}, {w: 'going to', at: at('going'), s: 'small', br: true}, {w: 'BECOME', at: at('become'), s: 'hero', br: true}]} /></>)},
  {from: at("that's"), to: at('so'), world: 'sky', in: 'flash', C: ({t}) => (<><Haze t={t} /><Lockup t={t} y="40%" size={140} words={[{w: 'so it’s', at: at("that's"), s: 'small'}, {w: 'very important', at: at('very'), s: 'body', br: true}, {w: 'to', at: at('to', 4), s: 'small', br: true}, {w: 'FIX', at: at('fix'), s: 'hero'}, {w: 'what you', at: at('what'), s: 'small', br: true}, {w: 'consume.', at: at('consuming'), s: 'serif'}]} /><Volt t={t} x="50%" y="76%" s={1.1} mood="think" at={at('fix')} /></>)},
  {from: at('so'), to: at('follow') - 0.3, world: 'sky', in: 'blur', C: ({t}) => (<><Haze t={t} /><Lockup t={t} y="40%" size={130} words={[{w: 'want to', at: at('want'), s: 'small'}, {w: 'grow', at: at('grow'), s: 'serif'}, {w: '&', at: at('and', 6), s: 'small'}, {w: 'get AHEAD?', at: at('get'), s: 'big', br: true}, {w: 'watch', at: at('watching'), s: 'body', br: true}, {w: 'BETTER', at: at('better', 2), s: 'mark'}, {w: 'content.', at: at('content', 3), s: 'body'}]} /></>)},
  {from: at('follow') - 0.3, to: MTV6_SEC, world: 'sky', in: 'flash', C: ({t}) => {
    const k = ramp(t, at('me'), at('me') + 0.3);
    return (<><Haze t={t} /><Lockup t={t} y="34%" size={170} words={[{w: 'follow', at: at('follow'), s: 'big'}, {w: 'me.', at: at('me'), s: 'serif'}]} /><Volt t={t} x="50%" y="60%" s={1.6} mood="happy" wave at={at('follow')} /><div style={{position: 'absolute', left: '50%', top: '78%', transform: `translate(-50%,-50%) scale(${0.8 + 0.2 * k})`, opacity: k, padding: '26px 70px', borderRadius: 60, background: '#3557F0', color: '#fff', fontSize: 54, fontWeight: 700, boxShadow: '0 20px 50px rgba(53,87,240,0.4)'}}>{t > at('me') + 0.6 ? 'Following ✓' : 'Follow'}</div></>);
  }},
];

const SFX: Sfx[] = [
  [0, 'impact', 0.45], [at('the') - 0.1, 'glitch', 0.35], [at('online'), 'pop', 0.4], [at('slowly') - 0.1, 'glitch', 0.4], [at('reprogramming'), 'impact', 0.35],
  [at('how', 2), 'click', 0.4], [at('how', 3), 'click', 0.4], [at('everything'), 'swell_hit', 0.35], [at('if') - 0.1, 'whoosh', 0.35], [at('feed'), 'pop', 0.45],
  [at('think', 2), 'pop', 0.4], [at('operate'), 'pop', 0.4], [at('who'), 'pop', 0.4], [at('become') - 0.9, 'riser', 0.3], [at('become'), 'impact', 0.4],
  [at("that's") - 0.1, 'whoosh_long', 0.35], [at('fix'), 'impact', 0.35], [at('better', 2), 'ding', 0.35], [at('follow') - 0.3, 'whoosh', 0.35], [at('me') + 0.6, 'click', 0.5],
];

export const Mtv6: React.FC = () => <MxStage job="jobs/mx-mtvideo6" sec={MTV6_SEC} scenes={SCENES} sfx={SFX} world="night" musicVol={0.1} />;
