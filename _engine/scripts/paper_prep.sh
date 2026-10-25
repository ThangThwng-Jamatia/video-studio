#!/bin/zsh
# Paper-explainer job prep: voice MP3 -> word timings (whisper) -> music bed.
#   scripts/paper_prep.sh <slug> <voice-mp3-url-or-local-path> [whisper-model]
# Writes public/jobs/<slug>/{voice.mp3, voice.json, words.txt, music.wav}. Run from _engine/.
set -e
slug=$1; src=$2; model=${3:-base.en}
d=public/jobs/$slug; mkdir -p $d
if [[ $src == http* ]]; then curl -sL -o $d/voice.mp3 "$src"; else cp "$src" $d/voice.mp3; fi
whisper $d/voice.mp3 --model $model --word_timestamps True --output_format json --output_dir $d >/dev/null 2>&1
python3 - "$d" <<'EOF'
import json, sys
d = sys.argv[1]; j = json.load(open(f"{d}/voice.json"))
with open(f"{d}/words.txt", "w") as f:
    for s in j["segments"]:
        f.write(f"{s['start']:.2f}  " + " ".join(f"{w['word'].strip()}@{w['start']:.2f}" for w in s["words"]) + "\n")
print(open(f"{d}/words.txt").read())
EOF
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $d/voice.mp3)
python3 scripts/gen_music_long.py $(python3 -c "print(round($dur + 2.5, 1))") $d/music.wav --hook 8
echo "voice ${dur}s -> $d"
