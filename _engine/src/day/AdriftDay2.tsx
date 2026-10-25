// ADRIFT Day 2 — final George narration with word-aligned story timing.
import React from 'react';
import {AbsoluteFill, interpolate, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {ACC, Bottle, Cam, CameraRig, Captions, Card, DayAudio, Sfx, Flare, FONT, Grain, handheld, Mirror, mix, Ocean, phaseCol, Pill, Raft, Sky, Stamp, Stars, Survivor, useT, Vignette, waveH, ease, CL} from './dayKit';
import {WORDS, REAL, STORY, DURATION} from './adriftDay2Words';
export const ADRIFT2_SEC=DURATION;
const actual=(t:number)=>interpolate(t,STORY,REAL,CL);
const SFX:Sfx[] = [[.6,"whoosh_long",.25],[.7,"impact",.25],[5.8,"swell_hit",.22],[9,"whoosh",.18],[17,"boom",.18],[22,"ding",.2],[32,"pop",.2],[34,"swell_hit",.2],[45,"ding",.18],[50,"whoosh_long",.2],[53,"click",.2],[59,"riser",.2],[63,"impact",.3],[67,"boom",.3]].map(([at,name,vol])=>[actual(at as number),name as string,vol as number]);
const phase=(t:number)=>interpolate(t,[0,16.8,19.5,34,43,50,59,64],[3,3,0,1,1.25,2,2.6,3],CL);
const camAt=(t:number):Cam=>{
 const cuts=[0,1.5,3.4,6,8.6,11,14,17,19.5,22,25,28,30.5,34,37,40,42.5,45,48,50,53,56,59,62,65,67,70,74];
 const idx=Math.max(0,cuts.findIndex((v,i)=>t>=v&&t<(cuts[i+1]??75)));
 const k=ease(t,cuts[idx],cuts[idx+1]??74), a=idx%4;
 let pos:[number,number,number]=a===0?[2.8-k*.5,2.5,6.4-k*.6]:a===1?[-3.8+k*.5,3.4-k*.3,6]:a===2?[.3,5.8-k,7.3]:[4-k,2.1,6.5];
 let look:[number,number,number]=[0,1,0];
 if(t>=8.6&&t<14){pos=[0,3.6,12];look=[0,6,-8];}
 if(t>=67){pos=[0,mix(3,8,(t-67)/7),mix(7,16,(t-67)/7)];}
 return handheld({pos,look,fov:43},t,t>59?2:1);
};
const World:React.FC<{t:number}>=({t})=>{
 const p=phase(t),night=p>2.4?(p-2.4)/.6:0;
 const top=phaseCol(['#589cc5','#318fce','#373657','#081124'],p),bot=phaseCol(['#edccb0','#c6e8eb','#ed9970','#425773'],p),sea=phaseCol(['#337f9e','#1688ad','#675774','#1d354e'],p);
 const rough=1+ease(t,50,65)*.6;
 const y=waveH(0,0,t,rough)+.08;
 const flare=t>.6&&t<16.5;
 const fy=t<3?mix(2,10,ease(t,.6,3)):mix(10,6,ease(t,3,16.5));
 return <><Sky top={top} bot={bot}/><fog attach="fog" args={[bot,50,230]}/><Stars k={night}/>
 <hemisphereLight args={[top,sea,.9]}/><ambientLight intensity={.55}/><directionalLight position={[10,25,10]} intensity={night?.7:2} color={p>1.5?'#ffd5b5':'#fff5e8'}/>
 <Ocean t={t} color={sea} amp={rough}/>
 {t<17&&<group position={[15+t*1.3,5,-90]}><mesh><boxGeometry args={[9,1.5,2]}/><meshBasicMaterial color="#121d29"/></mesh><mesh position={[0,1,0]}><sphereGeometry args={[.7,8,6]}/><meshBasicMaterial color="#fff1b3" fog={false}/></mesh></group>}
 {flare&&<group position={[-1,fy,-8]}>
 <mesh><sphereGeometry args={[.23,8,6]}/><meshBasicMaterial color="#fff6d1"/></mesh>
 <mesh><sphereGeometry args={[.8,12,8]}/><meshBasicMaterial color="#ff3b25" transparent opacity={.3} depthWrite={false}/></mesh>
 {t>3&&<><mesh position={[0,1.4,0]}><sphereGeometry args={[.65,8,4,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#e8d2b9" side={THREE.DoubleSide}/></mesh>{[-.4,.4].map(x=><mesh key={x} position={[x*.5,.7,0]} rotation={[0,0,x*.6]}><cylinderGeometry args={[.015,.015,1.4,4]}/><meshBasicMaterial color="#eee"/></mesh>)}</>}
 <pointLight color="#ff482b" intensity={35} distance={30}/></group>}
 <group position={[0,y,0]} rotation={[Math.sin(t*.8)*.055*rough,0,Math.cos(t*.7)*.07*rough]}>
 <Raft canopy={0}/><Survivor headYaw={Math.sin(t*.5)*.3} armUp={t<3?.8:t>30.5&&t<34?.55:0}/>
 {/* Cutaway canopy retains an open front and visible survivor. */}
 {t>34&&<mesh position={[0,.75,0]} rotation={[0,Math.PI,0]} scale={[1,ease(t,34,35),1]}><sphereGeometry args={[1.34,10,5,0,Math.PI,0,Math.PI/2]}/><meshStandardMaterial color="#ff7a2a" side={THREE.DoubleSide} flatShading/></mesh>}
 <group position={[.75,.65,.6]} scale={.48} rotation={[0,0,t>30.5&&t<34?-.8:0]}><Bottle/></group>
 <group position={[-.75,.65,.55]} scale={.45}><Mirror/></group>
 {[0,1,...(t<.7?[2]:[])].map(i=><group key={i} position={[-.35+i*.22,.45,.85]} scale={.45} rotation={[1.3,0,0]}><Flare/></group>)}
 {t>45&&<group position={[1,.55,-.4]}><mesh rotation={[Math.PI,0,0]}><coneGeometry args={[.3,.4,8,1,true]}/><meshStandardMaterial color="#b8d7e6" side={THREE.DoubleSide}/></mesh><mesh position={[0,-.3,0]}><cylinderGeometry args={[.17,.2,.3,8]}/><meshStandardMaterial color="#5cc8ff"/></mesh></group>}
 {t>53&&<mesh position={[0,.46,.8]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.9,.026,4,16]}/><meshStandardMaterial color="#e5d1a0"/></mesh>}
 {t>63&&<mesh position={[0,.2+ease(t,63,68)*.15,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[1.18,16]}/><meshStandardMaterial color="#67b8dd" transparent opacity={.7}/></mesh>}
 </group>
 {t>43&&Array.from({length:9},(_,i)=><mesh key={i} position={[-45+i*12,20+Math.sin(i)*3,-50]} scale={[12,3,5]}><icosahedronGeometry args={[1,1]}/><meshStandardMaterial color={t>59?'#344458':'#8f9eab'} flatShading/></mesh>)}
 {t>59&&Array.from({length:90},(_,i)=><mesh key={i} position={[(i*1.731)%16-8,((i*.73-t*8)%12+12)%12,(i*2.37)%14-7]} rotation={[0,0,-.15]}><cylinderGeometry args={[.013,.013,.35,3]}/><meshBasicMaterial color="#b5e0ff" transparent opacity={.65}/></mesh>)}
 {t>62&&t<65&&Array.from({length:16},(_,i)=><mesh key={i} position={[1.5-(t-62)*.6,1.4+Math.sin((t-62)/3*Math.PI)*(.6+i*.03),-1+i*.12]}><icosahedronGeometry args={[.1,0]}/><meshBasicMaterial color="#c1e9f5"/></mesh>)}
 </>;
};
const HUD:React.FC<{t:number}>=({t})=>{
 const m=interpolate(t,[0,16.8,17,19.5,34,43,50,59,74],[2,3,345,390,720,990,1110,1260,1270],CL),h=Math.floor(m/60);
 const clock=`${h%12||12}:${String(Math.floor(m%60)).padStart(2,'0')} ${h>=12?'PM':'AM'}`;
 return <div style={{position:'absolute',top:100,left:60,right:60,display:'flex',justifyContent:'space-between',fontFamily:FONT,color:'white',textShadow:'0 3px 12px #000'}}><div><div style={{fontSize:30,fontWeight:900,color:ACC.red}}>● DAY 2 · ADRIFT</div><div style={{fontSize:68,fontWeight:900}}>{clock}</div><div style={{fontSize:25,color:ACC.amber,fontWeight:800}}>RESCUE: UNKNOWN</div></div><div style={{display:'flex',flexDirection:'column',gap:12,alignItems:'flex-end'}}><Pill size={30} color={ACC.blue}>{t<31.5?'1.5':'1.0'} L WATER</Pill><Pill size={30} color={ACC.red}>{t<.7?'3':'2'} FLARES</Pill><Pill size={30} color={ACC.amber}>{Math.round(interpolate(t,[0,19.5,34,50,64],[19,24,33,25,20],CL))}°C</Pill></div></div>;
};
const Beats:React.FC<{t:number}>=({t})=><>
 <Stamp t={t} at={.7} out={3} text="ONE SHOT." size={150} y={420} color={ACC.red}/>
 <Stamp t={t} at={5.8} out={8.4} text="DAY 2" sub="TWO CHANCES LEFT" size={235} y={430}/>
 <Card t={t} at={9} out={16.5} y={330} accent={ACC.red}><div style={{fontSize:32,fontWeight:900,color:ACC.red}}>PARACHUTE FLARE</div><div style={{fontSize:125,fontWeight:900}}>40–60 SEC</div><div style={{fontSize:36}}>A signal. No guarantee of rescue.</div><div style={{fontSize:23,opacity:.7,marginTop:12}}>Maritime NZ · animation time-compressed</div></Card>
 <Stamp t={t} at={17} out={19} text="GONE." size={190} y={420} color={ACC.amber}/>
 <Card t={t} at={22} out={30.2} y={350} accent={ACC.blue}><div style={{fontSize:30,color:ACC.amber,fontWeight:900}}>DAY 1 CORRECTION</div><div style={{fontSize:68,fontWeight:900,lineHeight:1.06,marginTop:18}}>STAY HYDRATED<br/><span style={{color:ACC.blue}}>FROM THE START.</span></div><div style={{fontSize:32,marginTop:20}}>Do not deliberately avoid water for 24 hours.</div><div style={{fontSize:24,marginTop:14,opacity:.7}}>Source: AMSEA · Life Raft Survival</div></Card>
 <Stamp t={t} at={32} out={33.7} text="1.0 L LEFT" size={145} y={440} color={ACC.blue}/>
 <Stamp t={t} at={34} out={36} text="NOON" size={200} y={410} color={ACC.amber}/>
 <Card t={t} at={37} out={42} y={340}><div style={{fontSize:64,fontWeight:900}}>SHADE + AIRFLOW</div><div style={{fontSize:44,color:ACC.lime,marginTop:14}}>Less effort. Less sweat.</div></Card>
 <Card t={t} at={45} out={49.5} y={340} accent={ACC.blue}><div style={{fontSize:64,fontWeight:900}}>CATCH THE RAIN</div><div style={{fontSize:38,marginTop:16}}>Prepare the raft’s collection system.</div></Card>
 <Stamp t={t} at={50} out={52} text="SUNSET" size={185} y={390} color={ACC.amber}/>
 <Card t={t} at={53} out={58.5} y={340}><div style={{fontSize:66,fontWeight:900}}>SECURE EVERYTHING</div><div style={{fontSize:40,marginTop:16,color:ACC.lime}}>Water · mirror · 2 flares</div></Card>
 <Stamp t={t} at={63} out={65.7} text="WATER INSIDE." size={120} y={450} color={ACC.red}/>
 {t>=67&&<div style={{position:'absolute',left:80,right:80,top:420,textAlign:'center',fontFamily:FONT,color:'white',opacity:ease(t,67,67.4)}}><div style={{fontSize:118,fontWeight:900,lineHeight:1,textShadow:'0 6px 16px #000'}}>RAIN ABOVE.<br/><span style={{color:ACC.red}}>WATER BELOW.</span></div><div style={{marginTop:40,display:'flex',flexDirection:'column',gap:18,alignItems:'center'}}><Pill size={38} color={ACC.blue}>A · KEEP COLLECTING</Pill><Pill size={38} color={ACC.lime}>B · BAIL NOW</Pill></div><div style={{fontSize:38,fontWeight:900,marginTop:40,color:ACC.amber}}>DAY 3 → FOLLOW</div></div>}
</>;
export const AdriftDay2:React.FC=()=>{
 const now=useT(),t=interpolate(now,REAL,STORY,CL),cam=camAt(t),{width,height}=useVideoConfig();
 return <AbsoluteFill style={{background:'#081124'}}><ThreeCanvas width={width} height={height} camera={{position:cam.pos,fov:cam.fov}} gl={{antialias:true}}><CameraRig cam={cam}/><World t={t}/></ThreeCanvas><Vignette/><Grain/><HUD t={t}/><Beats t={t}/><Captions words={WORDS} t={now} y={1330} hide={x=>x>=actual(67)} keys={{water:ACC.blue,rain:ACC.blue,flare:ACC.red,two:ACC.red,shade:ACC.lime,hydrated:ACC.lime,mistake:ACC.red,night:ACC.blue}}/><DayAudio job="jobs/adrift-day2" sec={ADRIFT2_SEC} sfx={SFX} musicVol={.10}/><AbsoluteFill style={{background:'#000',opacity:ease(t,73.5,74)}}/></AbsoluteFill>;
};
export const AdriftDay2Thumb:React.FC=()=>{
 const {width,height}=useVideoConfig(),cam:Cam={pos:[2.4,2.7,6.8],look:[0,1,0],fov:44};
 return <AbsoluteFill style={{background:'#15283b',fontFamily:FONT}}><ThreeCanvas width={width} height={height} camera={{position:cam.pos,fov:cam.fov}}><CameraRig cam={cam}/><World t={61.5}/></ThreeCanvas><AbsoluteFill style={{background:'linear-gradient(180deg,#0009,transparent 45%,#000a)'}}/><div style={{position:'absolute',top:160,left:0,right:0,textAlign:'center',color:'white'}}><span style={{background:ACC.red,padding:'14px 36px',borderRadius:99,fontSize:48,fontWeight:900}}>ADRIFT</span><div style={{fontSize:285,fontWeight:900,marginTop:35,lineHeight:1,WebkitTextStroke:'6px #000',paintOrder:'stroke fill'}}>DAY 2</div></div><div style={{position:'absolute',bottom:245,left:0,right:0,textAlign:'center',fontSize:112,fontWeight:900,lineHeight:1,color:'white',WebkitTextStroke:'5px #000',paintOrder:'stroke fill'}}>TWO CHANCES<br/><span style={{color:ACC.lime}}>LEFT.</span></div></AbsoluteFill>;
};
