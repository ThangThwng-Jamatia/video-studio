#!/usr/bin/env python3
"""Sparse cinematic piano bed for the 2D no-voice "fable" longs (DISCIPLINE / LUST VS LOVE style).
Slow minor piano (Am - F - C - G at 66 bpm) over a dark pad. From --hope on, the progression turns
major-leaning (C - G - Am - F), an octave-up melody joins and the pad warms. --hits adds low booms.

    python3 gen_music_fable.py <seconds> <out.wav> [--hope SECONDS] [--hits 12.5,40.1] [--hush 41,50]
"""
import argparse, wave
import numpy as np

SR = 48000
ap = argparse.ArgumentParser()
ap.add_argument("length", type=float); ap.add_argument("out")
ap.add_argument("--hope", type=float, default=None)
ap.add_argument("--hits", type=str, default="")
ap.add_argument("--hush", type=str, default="", help="start,end: piano drops out (pad only) in this window")
a = ap.parse_args()
N = int(a.length * SR)
BEAT = 60 / 66
rng = np.random.default_rng(7)
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)
SAD = [([57, 60, 64], [69, 72, 71, 67]), ([53, 57, 60], [69, 65, 64, 65]), ([48, 52, 55], [67, 64, 62, 64]), ([55, 59, 62], [62, 67, 66, 62])]
HOPE = [([48, 52, 55], [72, 76, 79, 76]), ([55, 59, 62], [74, 79, 78, 74]), ([57, 60, 64], [76, 72, 71, 72]), ([53, 57, 60], [77, 76, 72, 69])]
hush = tuple(float(x) for x in a.hush.split(",")) if a.hush else None
out = np.zeros(N)


def piano(f, dur, vel):
    n = int(dur * SR); t = np.arange(n) / SR
    env = np.exp(-t * 2.2) * (1 - np.exp(-t * 400))
    s = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.6 for k in range(1, 6))
    return s * env * vel


def add(sig, at):
    i = int(at * SR)
    if i >= N: return
    j = min(N, i + len(sig)); out[i:j] += sig[: j - i]


bar = 4 * BEAT
t0, b = 0.0, 0
while t0 < a.length:
    hope = a.hope is not None and t0 >= a.hope
    chord, mel = (HOPE if hope else SAD)[b % 4]
    quiet = hush and hush[0] <= t0 < hush[1]
    # pad (always): detuned saws, low-passed by averaging
    n = int(bar * SR); t = np.arange(n) / SR
    pad = sum(np.sin(2 * np.pi * midi(m - 12) * t + np.sin(2 * np.pi * 0.2 * t)) for m in chord)
    pad *= np.minimum(1, t / 1.2) * np.minimum(1, (bar - t) / 1.2) * (0.05 if hope else 0.04)
    add(pad, t0)
    if not quiet:
        for m in chord: add(piano(midi(m - 12), bar, 0.07), t0 + rng.uniform(0, 0.03))
        for k, m in enumerate(mel):
            if k % 2 == 1 and not hope and rng.random() < 0.4: continue
            add(piano(midi(m), BEAT * 2.5, 0.09 if hope else 0.07), t0 + k * BEAT + rng.uniform(0, 0.02))
            if hope: add(piano(midi(m + 12), BEAT * 2, 0.025), t0 + k * BEAT + 0.01)
    t0 += bar; b += 1

for h in [float(x) for x in a.hits.split(",") if x]:
    n = int(2.5 * SR); t = np.arange(n) / SR
    add(np.sin(2 * np.pi * (48 * np.exp(-t * 1.5) + 30) * t) * np.exp(-t * 1.8) * 0.5, h)

# cheap room: two feedback delays
for d, g in [(0.083, 0.3), (0.137, 0.22)]:
    k = int(d * SR)
    for _ in range(3): out[k:] += out[:-k] * g; g *= 0.5
out = np.tanh(out * 1.2) * 0.85
fade = int(2.0 * SR); out[-fade:] *= np.linspace(1, 0, fade); out[:int(0.5 * SR)] *= np.linspace(0, 1, int(0.5 * SR))
pcm = (np.stack([out, out], 1) * 32767).astype(np.int16)
with wave.open(a.out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("wrote", a.out, round(a.length, 1), "s")
