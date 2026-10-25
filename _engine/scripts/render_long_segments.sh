#!/bin/bash
# Segmented final render for long edits (bash scripts/render_long_segments.sh <slug> "<out.mp4>"): each third in a fresh browser
# (a single 13k-frame run hung at frame 12100 when Chrome tabs died), audio rendered separately, then concat (stream copy) + mux.
set -u
ENG=/Users/thangthwngjamatia/Documents/Videos/_engine
SLUG=${1:?usage: render_long_segments.sh <slug> "<output.mp4>" [total_frames]}
J=$ENG/public/jobs/$SLUG
P=$J/props.json
OUT="${2:?output path}"; case "$OUT" in /*) ;; *) OUT="$PWD/$OUT";; esac  # script cd-s into _engine
mkdir -p $J/parts
cd $ENG
seg() { # name first last
  for try in 1 2; do
    npx remotion render src/index.ts Long "$J/parts/$1.mp4" --props=$P --codec=h264 --muted --concurrency=50% --crf=14 \
      --x264-preset=slow --color-space=bt709 --frames=$2-$3 --timeout=120000 > "$J/parts/$1.log" 2>&1
    rc=$?
    echo "segment $1 frames $2-$3 try $try exit $rc"
    [ $rc -eq 0 ] && return 0
    pkill -f "chrome-headless-shell|Chrome for Testing" 2>/dev/null; sleep 3
  done
  return 1
}
N=${3:-$(python3 -c "import json;p=json.load(open(\"$J/long_plan.json\"));print(round(p[\"durationSec\"]*30))")}
A=$((N/3)); B=$((2*N/3))
seg a 0 $((A-1)) || exit 1
seg b $A $((B-1)) || exit 1
seg c $B $((N-1)) || exit 1
npx remotion render src/index.ts Long "$J/parts/audio.wav" --props=$P --codec=wav --timeout=120000 > "$J/parts/audio.log" 2>&1
echo "audio exit $?"
printf "file '%s'\n" "$J/parts/a.mp4" "$J/parts/b.mp4" "$J/parts/c.mp4" > $J/parts/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $J/parts/list.txt -c copy $J/parts/video.mp4 && echo "concat ok"
ffmpeg -v error -y -i $J/parts/video.mp4 -i $J/parts/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -shortest "file:$OUT" && echo "mux ok"
echo "ALL DONE"
