import sys, subprocess, numpy as np
f, cutsf = sys.argv[1], sys.argv[2]
sr=22050
raw=subprocess.run(["ffmpeg","-v","error","-i",f,"-ac","1","-ar",str(sr),"-f","f32le","-"],capture_output=True).stdout
x=np.frombuffer(raw,np.float32)
hop=int(sr*0.01); win=1024
n=(len(x)-win)//hop
w=np.hanning(win)
S=np.abs(np.array([np.fft.rfft(x[i*hop:i*hop+win]*w) for i in range(n)]))
fr=np.fft.rfftfreq(win,1/sr)
def band(a,b): return 10*np.log10((S[:,(fr>=a)&(fr<b)]**2).sum(1)+1e-10)
low,mid,high=band(20,150),band(300,3000),band(5000,11000)
tot=band(20,11000)
flux=np.maximum(0,np.diff(np.log1p(S),axis=0)).sum(1); flux=np.r_[0,flux]
# music floor: 10th pct of total energy over 1s windows vs 90th pct
p10,p90=np.percentile(tot,10),np.percentile(tot,90)
print(f"  floor(p10)-loud(p90) = {p10-p90:.1f} dB  (music bed / gaps vs voice peaks)")
# onsets
th=np.percentile(flux,97)
pk=[i for i in range(2,n-2) if flux[i]>th and flux[i]==flux[i-3:i+4].max()]
cuts=[float(l) for l in open(cutsf)] if cutsf!="-" else []
ev=[]
for i in pk:
    t=i*0.01
    dl=low[i:i+8].max()-low[max(0,i-10):i].mean()
    dh=high[i:i+8].max()-high[max(0,i-10):i].mean()
    rise=high[max(0,i-30):i].mean()-high[max(0,i-60):i-30].mean() if i>60 else 0
    kind="BOOM" if dl>12 and dl>dh else ("HIT" if dh>12 else "onset")
    if rise>6: kind+="+swell-before"
    nc=min([abs(t-c) for c in cuts],default=9)
    ev.append((t,kind,dl,dh,nc))
for t,k,dl,dh,nc in ev:
    if k!="onset" or nc<0.08:
        print(f"  {t:6.2f}s {k:22s} lowΔ{dl:5.1f} highΔ{dh:5.1f} {'<-- on cut' if nc<0.08 else ''}")
