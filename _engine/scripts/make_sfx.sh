#!/bin/zsh
# Generates the starter SFX pack into ../../SFX (replace any file with a better one, same name).
set -e
OUT="$(cd "$(dirname "$0")/../.." && pwd)/SFX"
mkdir -p "$OUT"
g() { ffmpeg -v error -y -f lavfi -i "$1" -af "$2" -ar 48000 -ac 2 "$OUT/$3.wav"; }
# whoosh: pink noise swell, band-limited, for b-roll cuts
g "anoisesrc=color=pink:d=0.55:a=0.9" "highpass=f=400,lowpass=f=5000,afade=t=in:d=0.3:curve=exp,afade=t=out:st=0.3:d=0.25,volume=1.6" whoosh
# whoosh_long: slower swell for scene/chapter changes
g "anoisesrc=color=pink:d=1.1:a=0.9" "highpass=f=250,lowpass=f=4000,afade=t=in:d=0.75:curve=exp,afade=t=out:st=0.75:d=0.35,volume=1.6" whoosh_long
# pop: rising-pitch bubble, for big-word/headline pop-ins
g "aevalsrc='0.8*sin(2*PI*(350*t+5200*t*t))*exp(-38*t)':d=0.12" "afade=t=in:d=0.003" pop
# click: tiny tick, for caption/number reveals
g "aevalsrc='0.9*(random(0)*2-1)*exp(-260*t)':d=0.04" "highpass=f=1500" click
# riser: pitch + noise build before a reveal
g "aevalsrc='0.35*sin(2*PI*(120*t+260*t*t*t))+0.25*(random(0)*2-1)*t/1.6':d=1.6" "lowpass=f=6000,afade=t=in:d=1.2:curve=exp,afade=t=out:st=1.5:d=0.1" riser
# impact: sub boom + noise hit, for hook / key statement
g "aevalsrc='0.9*sin(2*PI*(48+60*exp(-20*t))*t)*exp(-5*t)+0.5*(random(0)*2-1)*exp(-30*t)':d=0.9" "lowpass=f=3000" impact
# ding: soft bell, for lists / numbers / checkmarks
g "aevalsrc='0.5*sin(2*PI*1320*t)*exp(-7*t)+0.25*sin(2*PI*2640*t)*exp(-11*t)':d=0.8" "afade=t=in:d=0.004" ding
# glitch: stuttered digital burst, for the red-bar accent
g "aevalsrc='0.6*(random(0)*2-1)*lt(mod(t,0.04),0.02)*exp(-6*t)':d=0.25" "highpass=f=800,lowpass=f=8000" glitch
ls -la "$OUT"
# --- shorts (Cine Lockup) additions, 2026-10-14 ---
# boom: 808-style sub drop for the end-card cut (+ tiny click for definition)
g "aevalsrc='0.95*tanh(1.6*sin(2*PI*(38*t+22*(1-exp(-9*t))/9)))*exp(-2.2*t)+0.35*(random(0)*2-1)*exp(-120*t)':d=1.6" "lowpass=f=2500,afade=t=in:d=0.002" boom
# swell_hit: 0.3 s airy swell INTO a soft hit at 0.30 s (place at = word_start - 0.30)
g "aevalsrc='if(lt(t,0.3),0.30*(random(0)*2-1)*pow(t/0.3,3),0.75*sin(2*PI*(60+90*exp(-25*(t-0.3)))*(t-0.3))*exp(-9*(t-0.3))+0.35*(random(0)*2-1)*exp(-45*(t-0.3)))':d=0.8" "highpass=f=35,lowpass=f=7000" swell_hit
