#!/usr/bin/env python3
"""Dump whisper word timings for an mx job into a TS words module.
usage: python3 scripts/mx_words.py <slug> <camelName>   ->  src/motion/<camelName>Words.ts
Reads public/jobs/<slug>/voice.json (written by paper_prep.sh)."""
import json, sys

slug, name = sys.argv[1], sys.argv[2]
d = json.load(open(f'public/jobs/{slug}/voice.json'))
words = []
for seg in d['segments']:
    for w in seg.get('words', []):
        words.append([w['word'].strip(), round(w['start'], 2), round(w['end'], 2)])
if not words:
    sys.exit('no word timings in voice.json (re-run paper_prep.sh with word timestamps)')
out = f'src/motion/{name}Words.ts'
with open(out, 'w') as f:
    f.write(f'// generated from public/jobs/{slug}/voice.json by scripts/mx_words.py\n')
    f.write("import type {Word} from './mxKit';\n")
    f.write('export const WORDS: Word[] = ' + json.dumps(words) + ';\n')
print(out, len(words), 'words, last ends', words[-1][2])
