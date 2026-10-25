import React from 'react';
import {AbsoluteFill, Audio, Composition, Easing, Img, OffthreadVideo, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadSerif} from '@remotion/google-fonts/InstrumentSerif';
import {captions, scenes} from './LeanData';
const sans=loadInter('normal',{weights:['500','600','800','900'],subsets:['latin']}).fontFamily;
const serif=loadSerif('italic',{subsets:['latin']}).fontFamily;
const job='jobs/lean-physique-15yo/';
const asset=(s:string)=>staticFile(job+s);
const ease={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const,easing:Easing.bezier(.16,1,.3,1)};
const label:React.CSSProperties={fontSize:29,fontWeight:600,letterSpacing:6,color:'#999',textTransform:'uppercase'};
const headline:React.CSSProperties={fontSize:112,fontWeight:800,letterSpacing:-5,lineHeight:1.06};
export type Scene={start:number;end:number;kind:string;title:string;kicker?:string;sub?:string;items?:string[];timings?:number[];mode?:string;media?:string;trim?:number;captions?:boolean};

const CaptionLine:React.FC<{center?:boolean}>=({center=false})=>{
 const f=useCurrentFrame();const {fps}=useVideoConfig();const t=f/fps;
 // Intentionally one reusable caption template, driven by reviewed JSON.
 const words=captions;
 const groups:typeof words[]=[];let cur:typeof words=[];
 for(let i=0;i<words.length;i++){
  const w=words[i], prev=words[i-1];
  if(cur.length&&(cur.length>=4||cur.map(x=>x.text).join('').length+w.text.length>29||/[,!?;.]$/.test(prev.text)||w.startMs-prev.endMs>300)){groups.push(cur);cur=[];}
  cur.push(w);
 }if(cur.length)groups.push(cur);
 const idx=groups.findIndex((g,i)=>t*1000>=g[0].startMs&&t*1000<Math.min((groups[i+1]?.[0].startMs??220200),g[g.length-1].endMs+200));
 if(idx<0)return null;const g=groups[idx];
 return <div style={{position:'absolute',left:160,right:160,top:center?865:866,textAlign:'center',fontSize:70,fontWeight:800,letterSpacing:-2.2,lineHeight:1.13,textShadow:'0 3px 12px #000, 0 1px 5px #000'}}>{g.map((w,i)=><span key={i} style={{opacity:t*1000>=w.startMs?1:.36}}>{w.text}</span>)}</div>;
};

const Hook:React.FC=()=>{
 const f=useCurrentFrame();const {fps}=useVideoConfig();const t=f/fps;
 const reveal=interpolate(f,[46,78],[0,1],ease);
 const settle=interpolate(f,[0,11],[1.035,1],ease);
 const photo=t<.78?'0725':t<1.15?'0726':'0730';
 return <AbsoluteFill style={{background:'#080808',overflow:'hidden'}}>
  <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 65% 50%,#252525 0%,#080808 68%)'}}/>
  <div style={{position:'absolute',left:150-reveal*420,top:130,width:610,height:800,opacity:1-reveal,transform:`scale(${settle})`}}>
   <div style={{...label,color:'white',fontSize:39,letterSpacing:4,marginBottom:26}}>2 YEARS AGO</div>
   <div style={{height:700,width:530,borderRadius:18,overflow:'hidden',border:'1px solid #555'}}>
    <Img src={asset(`media/before-${photo}.jpg`)} style={{height:'100%',width:'100%',objectFit:'contain',background:'#111'}}/>
   </div>
  </div>
  <div style={{position:'absolute',left:1060-reveal*480,top:130-reveal*36,width:610,height:800+reveal*100,transform:`scale(${settle})`}}>
   <div style={{...label,color:'white',fontSize:39,letterSpacing:4,marginBottom:26,opacity:1-reveal}}>NOW</div>
   <div style={{position:'relative',height:700+reveal*170,width:530,borderRadius:18,overflow:'hidden',border:'1px solid #666',boxShadow:'0 20px 80px #000'}}>
    {t<2.68?<OffthreadVideo src={asset('media/now-a.mp4')} startFrom={90} muted style={{width:'100%',height:'100%',objectFit:'contain'}}/>:<Sequence from={Math.round(2.68*fps)} premountFor={fps}><OffthreadVideo src={asset('media/now-b.mp4')} startFrom={150} muted style={{width:530,height:870,objectFit:'contain'}}/></Sequence>}
   </div>
  </div>
  <div style={{position:'absolute',top:463,left:825,fontSize:100,fontWeight:500,opacity:1-reveal}}>→</div>
  <div style={{position:'absolute',left:1200,top:360,opacity:reveal,transform:`translateY(${(1-reveal)*35}px)`}}><div style={{...label}}>THE SAME ME.</div><div style={{fontSize:176,fontWeight:900,letterSpacing:-10}}>NOW.</div><div style={{fontFamily:serif,fontSize:65,color:'#ccc'}}>Two years later.</div></div>
  <div style={{position:'absolute',bottom:84,left:150,width:1520,height:2,background:'#303030',opacity:1-reveal}}><div style={{height:2,background:'white',width:`${interpolate(f,[0,45],[6,100],ease)}%`}}/></div>
 </AbsoluteFill>;
};

const Outline:React.FC<{mode?:string;progress:number}>=({mode='v',progress})=>{
 const waist=mode==='waist'?115:mode==='slim'?48:62;
 const shoulder=mode==='shoulders'?94:mode==='slim'?96:155;
 return <svg width="520" height="570" viewBox="0 0 520 570" style={{overflow:'visible'}}>
  <defs><linearGradient id="bodyShade" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#353535"/><stop offset="1" stopColor="#111"/></linearGradient></defs>
  <circle cx="260" cy="62" r="42" fill="#191919" stroke="#aaa" strokeWidth="3"/>
  <path d={`M 225 105 L 225 129 Q ${260-shoulder} 144 ${260-shoulder} 174 L ${260-shoulder-20} 345 Q ${260-shoulder-17} 368 ${260-shoulder+5} 350 L ${260-waist} 245 Q ${260-waist-8} 335 ${260-waist} 376 L ${260-waist-9} 530 L 244 530 L 260 399 L 276 530 L ${260+waist+9} 530 L ${260+waist} 376 Q ${260+waist+8} 335 ${260+waist} 245 L ${260+shoulder-5} 350 Q ${260+shoulder+17} 368 ${260+shoulder+20} 345 L ${260+shoulder} 174 Q ${260+shoulder} 144 295 129 L 295 105`} fill="url(#bodyShade)" stroke="#aaa" strokeWidth="3"/>
  {mode==='v'&&<path d="M 114 167 L 260 365 L 406 167" stroke="white" strokeWidth="7" fill="none" strokeDasharray="520" strokeDashoffset={520*(1-progress)} strokeLinecap="round"/>}
  {mode==='waist'&&<ellipse cx="260" cy="310" rx="127" ry="70" fill="none" stroke="white" strokeWidth="4" strokeDasharray="680" strokeDashoffset={680*(1-progress)}/>}
  {mode==='shoulders'&&<path d="M 128 154 Q 260 100 392 154" fill="none" stroke="white" strokeWidth="6" strokeDasharray="300" strokeDashoffset={300*(1-progress)}/>}
 </svg>;
};

const Graphic:React.FC<{s:Scene}>=({s})=>{
 const frame=useCurrentFrame();const {fps}=useVideoConfig();const t=frame/fps;
 const inn=interpolate(frame,[0,11],[0,1],ease);
 const progress=interpolate(frame,[4,35],[0,1],ease);
 const half=s.mode==='half'&&t>=4.85;
 const ratio=s.mode==='half'?interpolate(t,[4.85,5.35],[80,50],ease):80;
 return <AbsoluteFill style={{background:'#080808',color:'white',overflow:'hidden'}}>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 48%,#202020 0%,#080808 70%)'}}/>
  <div style={{position:'absolute',left:150,top:116,...label}}>{s.kicker??'BUILD YOUR FOUNDATION'}</div>
  <div style={{position:'absolute',left:150,top:183,right:145,...headline,fontSize:s.title.length>24?87:112,opacity:.35+.65*inn,transform:`translateY(${(1-inn)*24}px)`}}>{s.title}</div>
  {s.kind==='title'&&<><div style={{position:'absolute',left:155,top:400,right:180,fontSize:67,fontFamily:serif,color:'#c7c7c7',opacity:inn}}>{s.sub}</div><div style={{position:'absolute',left:155,top:575,width:interpolate(frame,[4,29],[0,510],ease),height:3,background:'white'}}/></>}
  {s.kind==='list'&&<div style={{position:'absolute',left:155,top:385,right:155,display:'flex',gap:25}}>{(s.items??[]).map((text,i)=>{
   const show=interpolate(t,[s.timings?.[i]??i*.22,(s.timings?.[i]??i*.22)+.28],[0,1],ease);
   return <div key={text} style={{flex:1,padding:'35px 28px',borderTop:'2px solid #777',background:'#141414',borderRadius:'0 0 18px 18px',opacity:show,transform:`translateY(${(1-show)*24}px)`}}><div style={{...label,fontSize:24,marginBottom:50}}>0{i+1}</div><div style={{fontSize:s.items!.length>3?49:66,fontWeight:600,letterSpacing:-2,lineHeight:1.2,whiteSpace:'pre-line'}}>{text}</div></div>
  })}</div>}
  {s.kind==='body'&&<><div style={{position:'absolute',left:970,top:290,opacity:inn}}><Outline mode={s.mode} progress={progress}/></div><div style={{position:'absolute',left:160,top:420,width:700}}>{(s.items??[]).map((text,i)=><div key={text} style={{fontSize:57,fontWeight:500,letterSpacing:-1,marginBottom:30,opacity:interpolate(frame,[5+i*6,16+i*6],[0,1],ease)}}><span style={{color:'#666',marginRight:24}}>—</span>{text}</div>)}</div></>}
  {s.kind==='ratio'&&<><div style={{position:'absolute',left:155,right:155,top:395,display:'flex',alignItems:'baseline',gap:35}}><span style={{fontSize:190,fontWeight:800,letterSpacing:-10}}>{half?'50':'80'}<span style={{fontSize:85}}>%</span></span><span style={{fontSize:55,color:'#aaa'}}>nutrition</span><span style={{fontSize:80,color:'#555',margin:'0 20px'}}> / </span><span style={{fontSize:150,fontWeight:600,letterSpacing:-7}}>{half?'50':'20'}<span style={{fontSize:70}}>%</span></span><span style={{fontSize:55,color:'#aaa'}}>training</span></div><div style={{position:'absolute',left:160,right:160,top:670,height:22,background:'#393939',borderRadius:20,overflow:'hidden'}}><div style={{height:'100%',width:`${ratio*progress}%`,background:'white',borderRadius:20}}/></div><div style={{position:'absolute',left:160,top:735,fontSize:35,color:'#999'}}>How I approached this stage</div></>}
  {s.kind==='progress'&&<><div style={{position:'absolute',left:170,top:410,fontSize:180,fontWeight:800,letterSpacing:-7}}>0 <span style={{fontWeight:400,color:'#777'}}>→</span> 1</div><div style={{position:'absolute',left:900,top:465,fontFamily:serif,fontSize:80,lineHeight:1.15,color:'#ddd'}}>One step.<br/>Then another.</div><div style={{position:'absolute',left:170,top:700,width:1560,height:2,background:'#444'}}><div style={{width:`${progress*100}%`,height:3,background:'#fff'}}/></div></>}
 </AbsoluteFill>;
};

const PhotoExample:React.FC<{s:Scene}>=({s})=>{
 const frame=useCurrentFrame();const {fps}=useVideoConfig();
 const scale=interpolate(frame,[0,Math.round((s.end-s.start)*fps)-1],[1,1.035],{extrapolateRight:'clamp'});
 const word=captions.find(w=>w.startMs>=s.start*1000&&w.endMs<=s.end*1000&&w.text.toLowerCase().includes(s.mode==='waist'?'belly':'shoulders'));
 const markAt=Math.ceil((word?.startMs??s.start*1000)*fps/1000)-Math.round(s.start*fps);
 const mark=interpolate(frame,[markAt,markAt+11],[0,1],ease);
 const green='#6AFF93';
 return <AbsoluteFill style={{background:'#080808'}}>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 65% 45%,#242424,#080808 75%)'}}/>
  <div style={{position:'absolute',left:150,top:235,width:830}}>
   <div style={label}>ILLUSTRATIVE EXAMPLE</div>
   <div style={{...headline,fontSize:98,marginTop:32}}>{s.title}</div>
   <div style={{fontSize:43,lineHeight:1.5,color:'#bbb',marginTop:45}}>{s.items?.map(x=><div key={x}>{x}</div>)}</div>
  </div>
  <div style={{position:'absolute',left:1120,top:65,width:560,height:760,borderRadius:18,overflow:'hidden',border:'1px solid #555'}}>
   <AbsoluteFill style={{transform:`scale(${scale})`}}>
    <Img src={asset(s.media!)} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
    {s.mode==='waist'?<svg viewBox="0 0 429 612" style={{position:'absolute',width:560,height:560*612/429,left:0,top:(760-560*612/429)/2,overflow:'visible'}}>
     <path d="M 153 298 C 179 284 274 286 297 313 C 313 339 320 386 296 413 C 270 438 181 428 158 403 C 143 381 139 330 153 298 Z" fill={green} fillOpacity={mark*.23} stroke={green} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1-mark} opacity={mark>0?1:0} style={{filter:'drop-shadow(0 0 5px #6aff9366)'}}/>
    </svg>:<svg viewBox="0 0 374 500" style={{position:'absolute',width:760*374/500,height:760,left:(560-760*374/500)/2,top:0,overflow:'visible'}}>
     <path d="M 148 280 L 224 282" fill="none" stroke={green} strokeWidth="3" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1-mark} opacity={mark>0?1:0} style={{filter:'drop-shadow(0 0 4px #6aff9399)'}}/>
     <path d="M 148 273 L 148 287 M 224 275 L 224 289" stroke={green} strokeWidth="2" strokeLinecap="round" opacity={mark}/>
    </svg>}
   </AbsoluteFill>
  </div>
 </AbsoluteFill>;
};

const Insert:React.FC<{s:Scene}>=({s})=>{
 const frame=useCurrentFrame();const {fps}=useVideoConfig();
 return <AbsoluteFill style={{background:'#080808'}}><AbsoluteFill style={{background:'radial-gradient(ellipse at 58% 50%,#272727,#070707 74%)'}}/>
  <div style={{position:'absolute',left:960,top:50,width:550,height:980,overflow:'hidden',borderRadius:20,transform:`scale(${interpolate(frame,[0,(s.end-s.start)*fps],[1,1.035],ease)})`}}><OffthreadVideo src={asset(s.media??'media/now-a.mp4')} startFrom={Math.round((s.trim??0)*fps)} muted style={{width:'100%',height:'100%',objectFit:'contain'}}/></div>
  <div style={{position:'absolute',left:160,top:320,width:740}}><div style={label}>{s.kicker}</div><div style={{...headline,marginTop:35,fontSize:120}}>{s.title}</div><div style={{fontFamily:serif,fontSize:61,color:'#bbb',marginTop:32}}>{s.sub}</div></div>
 </AbsoluteFill>;
};

export const LeanPhysique:React.FC=()=>{
 const frame=useCurrentFrame();const {fps}=useVideoConfig();const t=frame/fps;
 const scene=scenes.find(s=>t>=s.start&&t<s.end);
 const zoom=(t>6.4&&t<9.9)||(t>21.8&&t<26.8)||(t>99.1&&t<103.1)||(t>144&&t<149.8)||(t>193.8&&t<201.6)?1.06:1;
 return <AbsoluteFill style={{fontFamily:sans,color:'white',background:'black'}}>
  <Audio src={asset('aroll.mp4')}/>
  {!scene&&t>=119/fps&&<AbsoluteFill style={{transform:`scale(${zoom})`,filter:'contrast(1.045) saturate(.93) brightness(1.035)'}}><OffthreadVideo src={asset('aroll.mp4')} muted style={{width:'100%',height:'100%',objectFit:'cover'}}/></AbsoluteFill>}
  <AbsoluteFill style={{background:'linear-gradient(0deg,rgba(0,0,0,.5),transparent 27%)'}}/>
  <Sequence from={0} durationInFrames={119} name="Before and now hook" premountFor={fps}><Hook/></Sequence>
  {scenes.map((s,i)=><Sequence key={i} from={Math.round(s.start*fps)} durationInFrames={Math.round(s.end*fps)-Math.round(s.start*fps)} premountFor={fps} name={s.title}>{s.kind==='photo'?<PhotoExample s={s}/>:s.kind==='insert'?<Insert s={s}/>:<Graphic s={s}/>}</Sequence>)}
  {t>=3.96&&(!scene||scene.captions!==false)&&<CaptionLine center={!!scene}/>}
  <Sequence from={0} durationInFrames={35} premountFor={fps} name="Opening impact"><Audio src={staticFile('sfx/impact.wav')} volume={.20}/></Sequence>
  <Sequence from={71} durationInFrames={50} premountFor={fps} name="Now reveal"><Audio src={staticFile('sfx/swell_hit.wav')} volume={.17}/></Sequence>
  <Sequence from={Math.round(74.17*fps)} durationInFrames={35} premountFor={fps} name="Step one accent"><Audio src={staticFile('sfx/impact.wav')} volume={.10}/></Sequence>
  <Sequence from={Math.round(84.26*fps)} durationInFrames={35} premountFor={fps} name="Step two accent"><Audio src={staticFile('sfx/impact.wav')} volume={.10}/></Sequence>
  <Sequence from={Math.round(133.22*fps)} durationInFrames={35} premountFor={fps} name="Step three accent"><Audio src={staticFile('sfx/impact.wav')} volume={.10}/></Sequence>
 </AbsoluteFill>;
};
export const LeanRoot=()=> <Composition id="LeanPhysique" component={LeanPhysique} width={1920} height={1080} fps={30} durationInFrames={6606}/>;
registerRoot(LeanRoot);
