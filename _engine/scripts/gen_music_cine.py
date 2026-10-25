#!/usr/bin/env python3
"""Placeholder cinematic bed for shorts (Music/ is empty). Replace with a real track when the user adds one.
Moody minor piano + warm pad + soft kick at 84 bpm under the talk; at --drop the bed opens up into
808 hits every beat (the end-card "drop" heard in Inspo4/8/9).

    python3 gen_music_cine.py <seconds> <out.wav> [--drop SECONDS]
"""
import argparse, wave
import numpy as np

SR = 48000
ap = argparse.ArgumentParser()
ap.add_argument("length", type=float); ap.add_argument("out"); ap.add_argument("--drop", type=float, default=None)
a = ap.parse_args()
LEN, N = a.length, int(a.length * SR)
BEAT = 60 / 84
rng = np.random.default_rng(11)
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)
CHORDS = [  # Cm9 - Ab maj7 - Eb - Bb  (pad, bass, piano motif)
    ([60, 63, 67, 70, 74], 36, [72, 75, 79, 74]),
    ([56, 60, 63, 67], 32, [72, 75, 79, 77]),
    ([55, 58, 63, 67], 39, [70, 75, 79, 82]),
    ([53, 58, 62, 65], 34, [70, 74, 77, 74]),
]
L = np.zeros(N); R = np.zeros(N)


def add(buf, start, sig, g=1.0):
    s = int(start * SR)
    if s >= N or s < 0:
        return
    e = min(N, s + len(sig)); buf[s:e] += sig[: e - s] * g


def pad(f, d):
    t = np.arange(int(d * SR)) / SR
    env = np.minimum(1, t / 1.2) * np.clip((d - t) / 1.4, 0, 1)
    return sum(np.sin(2 * np.pi * f * (1 + dt) * t + p) for dt, p in [(-0.002, 0), (0, 1), (0.0021, 2)]) * env / 3


def piano(f, v):
    t = np.arange(int(2.8 * SR)) / SR
    env = np.minimum(1, t / 0.005) * np.exp(-t / 0.7)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.35)
            + 0.12 * np.sin(6 * np.pi * f * t) * np.exp(-t / 0.2)) * env * v


def kick(g, sub=False):
    d = 1.2 if sub else 0.35
    t = np.arange(int(d * SR)) / SR
    f = (40 if sub else 50) + (70 if sub else 110) * np.exp(-t * (14 if sub else 30))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(1.5 * np.sin(ph)) * np.exp(-t * (2.4 if sub else 11)) * g


bar = 4 * BEAT
t0, i = 0.0, 0
drop = a.drop if a.drop is not None else LEN + 1
while t0 < LEN:
    p, b, mot = CHORDS[i % 4]
    d = bar * 2 + 1.4
    for m in p:
        s = pad(midi(m), d) * 0.07
        add(L, t0, s * (0.9 + 0.2 * rng.random())); add(R, t0, s * (0.9 + 0.2 * rng.random()))
    bs = pad(midi(b), d) * 0.12; add(L, t0, bs); add(R, t0, bs)
    for k in range(8):  # piano motif, one note per beat
        tt = t0 + k * BEAT
        nt = piano(midi(mot[k % 4]), 0.10 * (1.0 if k % 4 == 0 else 0.75))
        add(L, tt, nt, 0.9 if k % 2 else 1.1); add(R, tt, nt, 1.1 if k % 2 else 0.9)
    for k in range(8):  # soft kick on beats 1 and 3 under the talk, 808 every beat after the drop
        tt = t0 + k * BEAT
        if tt >= drop:
            kk = kick(0.55, sub=True); add(L, tt, kk); add(R, tt, kk)
        elif k % 2 == 0:
            kk = kick(0.16); add(L, tt, kk); add(R, tt, kk)
    t0 += bar * 2; i += 1

# simple hall: a few decaying delays
for buf in (L, R):
    out = buf.copy()
    for dly, g in [(0.031, 0.35), (0.067, 0.28), (0.113, 0.22), (0.171, 0.17), (0.263, 0.12)]:
        k = int(dly * SR); out[k:] += buf[:-k] * g
    buf[:] = out
mix = np.stack([L, R], 1)
mix /= np.abs(mix).max() + 1e-9
mix *= 0.89
fade = int(1.5 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix[: int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))[:, None]
with wave.open(a.out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print(a.out, f"{LEN:.1f}s", f"drop@{a.drop}" if a.drop else "")
