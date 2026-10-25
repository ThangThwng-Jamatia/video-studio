import {LogoA, LogoB, LogoC} from './day/LogoConcepts';
import {AdriftDay2, ADRIFT2_SEC, AdriftDay2Thumb} from './day/AdriftDay2';
import React from 'react';
import {Composition} from 'remotion';
import {Edit} from './Edit';
import type {Plan} from './types';
import {EventFilm, eventFilmDuration, type EventFilmProps} from './Kathakaar';
import {ChapterFilm, type ChapterFilmProps} from './ChapterFilm';
import {Cine, type CinePlan} from './Cine';
import {Glowup, type GlowPlan} from './Glowup';
import {SchoolGfxTest} from './SchoolGfx';
import {GfxClip, type GfxClipProps} from './gfx/registry';
import {MinorBuildsPromo, PROMO_SEC} from './promo/MinorBuildsPromo';
import {Long, type LongPlan} from './long/Long';
import {WinterGfxTest} from './gfx/WinterGfx';
import {PremiumGfxTest} from './gfx/PremiumGfx';
import {PaperPilot, PAPER_SEC} from './paper/PaperPilot';
import {AdriftDay1, ADRIFT1_SEC, AdriftDay1Thumb} from './day/AdriftDay1';
import {LockdownDay1, LOCKDOWN1_SEC, LockdownDay1Thumb} from './day/LockdownDay1';
import {LockdownDay2, LOCKDOWN2_SEC, LockdownDay2Thumb} from './day/LockdownDay2';
import {SkyCrackedDay1, SKY1_SEC, SkyCrackedDay1Thumb} from './day/SkyCrackedDay1';
import {PromiseDay1, PROMISE1_SEC, PromiseDay1Thumb} from './day/PromiseDay1';
import {DirtyMoneyDay1, DM1_SEC, DirtyMoneyDay1Thumb} from './day/DirtyMoneyDay1';
import {FirstCreditCard, CREDIT_SEC, FirstCreditCardThumb} from './day/FirstCreditCard';
import {WisPlane, WIS_PLANE_SEC, WisPlaneThumb} from './day/WisPlane';
import {MxDemo, MX_DEMO_SEC} from './motion/MxDemo';
import {Mtv6, MTV6_SEC} from './motion/Mtv6';
import {ZombieEconomy, ZOMBIE_SEC} from './paper/ZombieEconomy';
import {MoneyTruths, TRUTHS_SEC} from './paper/MoneyTruths';
import {TruthsThumbA, TruthsThumbB, TruthsThumbC} from './paper/ThumbsTruths';
import {FirstPaycheck, PAYCHECK_SEC} from './paper/FirstPaycheck';
import {PaycheckThumb} from './paper/ThumbsPaycheck';
import {ZombieThumbA, ZombieThumbB, ZombieThumbC} from './paper/ThumbsZombie';
import {BuildWell, WELL_SEC} from './build/BuildWell';
import {Dopamine, DOPAMINE_SEC} from './fable/Dopamine';
import {BasicEconomics, ECON_SEC} from './paper/BasicEconomics';
import {ThumbA, ThumbB, ThumbC} from './paper/Thumbs';
import {StocksExplained, STOCKS_SEC} from './paper/StocksExplained';
import {StocksThumbA, StocksThumbB, StocksThumbC} from './paper/ThumbsStocks';
import {SamFull, SamFace, LogoBadge, LogoFace, LogoWordmark, Banner} from './paper/Brand';

const emptyEvent: EventFilmProps = {
  job: 'jobs/kathakaar', bodyDur: 5, school: 'School', city: 'City', title: 'Title', objective: '', objectiveWord: '',
  chapters: [],
};

const emptyPlan: Plan = {
  title: 'empty',
  format: 'long',
  width: 1920,
  height: 1080,
  fps: 30,
  durationSec: 5,
  preset: 'gold',
  aroll: '',
  words: [],
  broll: [],
  headlines: [],
  zooms: [],
  sfx: [],
  accents: [],
};

const emptyCine: CinePlan = {
  title: 'empty', width: 1920, height: 1080, fps: 30, durationSec: 5, talkEnd: 5, aroll: '', zooms: [], inserts: [], chunks: [],
  anchor: {x: 0.5, y: 0.5, align: 'center'}, heroes: [], lockups: [], behind: [], sfx: [],
};

export const RemotionRoot: React.FC = () => (
  <>
  <Composition id="MinorBuildsPromo" component={MinorBuildsPromo} width={1080} height={1920} fps={60} durationInFrames={PROMO_SEC * 60} />
  <Composition id="GfxClip" component={GfxClip} defaultProps={{scene: 'school', kind: 'assembly', start: 4.3, end: 9.35} as GfxClipProps}
    width={1920} height={1080} fps={30} durationInFrames={150}
    calculateMetadata={({props}) => ({durationInFrames: Math.max(1, Math.round((props.end - props.start) * 30))})} />
 <Composition
    id="Long"
    component={Long}
    defaultProps={{plan: {title: 'empty', durationSec: 5, talkEnd: 5, fps: 30, aroll: '', look: 'A', angles: [], beats: [], labels: [], sfx: []} as LongPlan}}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={150}
    calculateMetadata={({props}) => ({durationInFrames: Math.max(1, Math.round(props.plan.durationSec * 30))})}
  />
  <Composition id="StocksExplained" component={StocksExplained} width={1920} height={1080} fps={30} durationInFrames={Math.round(STOCKS_SEC * 30)} />
  <Composition id="StocksThumbA" component={StocksThumbA} width={1280} height={720} fps={30} durationInFrames={1} />
  <Composition id="StocksThumbB" component={StocksThumbB} width={1280} height={720} fps={30} durationInFrames={1} />
  <Composition id="StocksThumbC" component={StocksThumbC} width={1280} height={720} fps={30} durationInFrames={1} />
  <Composition id="Banner" component={Banner} width={2560} height={1440} fps={30} durationInFrames={1} />
  <Composition id="SamFull" component={SamFull} width={1560} height={1620} fps={30} durationInFrames={1} />
  <Composition id="LogoBadge" component={LogoBadge} width={2048} height={2048} fps={30} durationInFrames={1} />
  <Composition id="LogoFace" component={LogoFace} width={2048} height={2048} fps={30} durationInFrames={1} />
  <Composition id="LogoWordmark" component={LogoWordmark} width={3000} height={900} fps={30} durationInFrames={1} />
  <Composition id="BasicEconomics" component={BasicEconomics} width={1920} height={1080} fps={30} durationInFrames={Math.round(ECON_SEC * 30)} />
  <Composition id="ZombieThumbA" component={ZombieThumbA} width={1080} height={1920} fps={30} durationInFrames={1} />
  <Composition id="LogoA" component={LogoA} width={2048} height={2048} fps={30} durationInFrames={1} />
  <Composition id="LogoB" component={LogoB} width={2048} height={2048} fps={30} durationInFrames={1} />
  <Composition id="LogoC" component={LogoC} width={2048} height={2048} fps={30} durationInFrames={1} />
  <Composition id="AdriftDay2" component={AdriftDay2} width={1080} height={1920} fps={30} durationInFrames={Math.round(ADRIFT2_SEC * 30)} />
  <Composition id="AdriftDay2Thumb" component={AdriftDay2Thumb} width={1080} height={1920} fps={30} durationInFrames={1} />
  <Composition id="AdriftDay1Thumb" component={AdriftDay1Thumb} width={1080} height={1920} fps={30} durationInFrames={1} />
  <Composition id="AdriftDay1" component={AdriftDay1} width={1080} height={1920} fps={30} durationInFrames={Math.round(ADRIFT1_SEC * 30)} />
  <Composition id="LockdownDay1Thumb" component={LockdownDay1Thumb} width={1080} height={1920} fps={30} durationInFrames={1} />
  <Composition id="FirstCreditCard" component={FirstCreditCard} width={1080} height={1920} fps={30} durationInFrames={Math.round(CREDIT_SEC * 30)} />
  <Composition id="WisPlane" component={WisPlane} width={1080} height={1920} fps={30} durationInFrames={Math.round(WIS_PLANE_SEC * 30)} />
  <Composition id="WisPlaneThumb" component={WisPlaneThumb} width={1080} height={1920} fps={30} durationInFrames={1} />
  <Composition id="MxDemo" component={MxDemo} width={1920} height={1080} fps={30} durationInFrames={MX_DEMO_SEC * 30} />
  <Composition id="Mtv6" component={Mtv6} width={1080} height={1920} fps={30} durationInFrames={Math.round(MTV6_SEC * 30)} />
  <Composition id="FirstCreditCardThumb" component={FirstCreditCardThumb} width={1080} height={1920} fps={30} durationInFrames={1} />
  <Composition id="SkyCrackedDay1" component={SkyCrackedDay1} width={1080} height={1920} fps={30} durationInFrames={Math.round(SKY1_SEC * 30)} />
  <Composition id="SkyCrackedDay1Thumb" component={SkyCrackedDay1Thumb} width={1080} height={1920} fps={30} durationInFrames={1} />
  <Composition id="PromiseDay1" component={PromiseDay1} width={1080} height={1920} fps={30} durationInFrames={Math.round(PROMISE1_SEC * 30)} />
  <Composition id="PromiseDay1Thumb" component={PromiseDay1Thumb} width={1080} height={1920} fps={30} durationInFrames={1} />
  <Composition id="DirtyMoneyDay1" component={DirtyMoneyDay1} width={1080} height={1920} fps={30} durationInFrames={Math.round(DM1_SEC * 30)} />
  <Composition id="DirtyMoneyDay1Thumb" component={DirtyMoneyDay1Thumb} width={1080} height={1920} fps={30} durationInFrames={1} />
  <Composition id="LockdownDay2Thumb" component={LockdownDay2Thumb} width={1080} height={1920} fps={30} durationInFrames={1} />
  <Composition id="LockdownDay2" component={LockdownDay2} width={1080} height={1920} fps={30} durationInFrames={Math.round(LOCKDOWN2_SEC * 30)} />
  <Composition id="LockdownDay1" component={LockdownDay1} width={1080} height={1920} fps={30} durationInFrames={Math.round(LOCKDOWN1_SEC * 30)} />
  <Composition id="MoneyTruths" component={MoneyTruths} width={1920} height={1080} fps={30} durationInFrames={Math.round(TRUTHS_SEC * 30)} />
  <Composition id="TruthsThumbA" component={TruthsThumbA} width={1280} height={720} fps={30} durationInFrames={1} />
  <Composition id="TruthsThumbB" component={TruthsThumbB} width={1280} height={720} fps={30} durationInFrames={1} />
  <Composition id="TruthsThumbC" component={TruthsThumbC} width={1280} height={720} fps={30} durationInFrames={1} />
  <Composition id="BuildWell" component={BuildWell} width={1080} height={1920} fps={30} durationInFrames={Math.round(WELL_SEC * 30)} />
  <Composition id="Dopamine" component={Dopamine} width={1920} height={1080} fps={30} durationInFrames={Math.round(DOPAMINE_SEC * 30)} />
  <Composition id="FirstPaycheck" component={FirstPaycheck} width={1080} height={1920} fps={30} durationInFrames={Math.round(PAYCHECK_SEC * 30)} />
  <Composition id="PaycheckThumb" component={PaycheckThumb} width={1080} height={1920} fps={30} durationInFrames={1} />
  <Composition id="ZombieEconomy" component={ZombieEconomy} width={1080} height={1920} fps={30} durationInFrames={Math.round(ZOMBIE_SEC * 30)} />
  <Composition id="PremiumGfxTest" component={PremiumGfxTest} width={1920} height={1080} fps={30} durationInFrames={240} />
  <Composition id="WinterGfxTest" component={WinterGfxTest} width={1920} height={1080} fps={30} durationInFrames={900} />
  <Composition id="SchoolGfxTest" component={SchoolGfxTest} width={1920} height={1080} fps={30} durationInFrames={651} />
  <Composition
    id="Cine"
    component={Cine}
    defaultProps={{plan: emptyCine}}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={150}
    calculateMetadata={({props}) => ({
      width: props.plan.width, height: props.plan.height, fps: props.plan.fps,
      durationInFrames: Math.max(1, Math.round(props.plan.durationSec * props.plan.fps)),
    })}
  />
  <Composition
    id="Glowup"
    component={Glowup}
    defaultProps={{plan: {title: 'empty', durationSec: 5, aroll: '', words: [], placements: [], zooms: [], layers: [], sfx: []} as GlowPlan}}
    width={1920}
    height={1080}
    fps={30}
    durationInFrames={150}
    calculateMetadata={({props}) => ({durationInFrames: Math.max(1, Math.round(props.plan.durationSec * 30))})}
  />
  </>
);
