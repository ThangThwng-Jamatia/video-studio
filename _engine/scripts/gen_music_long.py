#!/usr/bin/env python3
"""Calm cinematic bed for LONG edits (Music/ is empty; replace with a real track when the user adds one).
80 bpm, D minor -> Bb -> F -> C loop. Warm pad + sub bass + soft bell plucks (wintery shimmer) + a soft kick/hat
pulse that comes in after the hook. Sections change every 16 bars so it doesn't feel like a 10 s loop; the last
20 s open up a little, then fade.

    python3 gen_music_long.py <seconds> <out.wav> [--hook 34.5]
"""
import argparse, wave
import numpy as np

SR = 44100
ap = argparse.ArgumentParser()
ap.add_argument("length", type=float); ap.add_argument("out"); ap.add_argument("--hook", type=float, default=30.0)
a = ap.parse_args()
LEN, N = a.length, int(a.length * SR)
BEAT = 60 / 80
BAR = 4 * BEAT
rng = np.random.default_rng(23)
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)
CHORDS = [  # Dm(add9) - Bbmaj7 - F(add9) - C(sus2)
    ([62, 65, 69, 76], 38, [74, 77, 81, 76]),
    ([58, 62, 65, 69], 34, [74, 77, 81, 77]),
    ([57, 60, 65, 67], 41, [72, 77, 79, 81]),
    ([55, 60, 62, 67], 36, [72, 74, 79, 76]),
]
L = np.zeros(N); R = np.zeros(N)


def add(buf, start, sig, g=1.0):
    s = int(start * SR)
    if s >= N or s < 0:
        return
    e = min(N, s + len(sig)); buf[s:e] += sig[: e - s] * g


def pad(f, d):
    t = np.arange(int(d * SR)) / SR
    env = np.minimum(1, t / 1.6) * np.clip((d - t) / 1.8, 0, 1)
    sig = sum(np.sin(2 * np.pi * f * (1 + dt) * t + p) for dt, p in [(-0.003, 0), (0, 1.3), (0.0032, 2.1)]) / 3
    sig += 0.25 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 3)  # a little air on top
    return sig * env


def bell(f, v):
    t = np.arange(int(3.5 * SR)) / SR
    env = np.minimum(1, t / 0.003) * np.exp(-t / 1.1)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 1.6 * np.exp(-t / 0.5)  # FM bell
    return np.sin(2 * np.pi * f * t + mod) * env * v


def kick(g):
    t = np.arange(int(0.4 * SR)) / SR
    f = 48 + 90 * np.exp(-t * 28)
    return np.tanh(1.4 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t * 9) * g


def hat(g):
    t = np.arange(int(0.08 * SR)) / SR
    n = rng.standard_normal(len(t))
    n = np.diff(np.concatenate([[0], n]))  # crude high-pass
    return n * np.exp(-t * 60) * g


t0, i = 0.0, 0
while t0 < LEN:
    bar_i = int(t0 / BAR + 0.5)
    section = (bar_i // 16) % 3
    p, b, mot = CHORDS[i % 4]
    d = BAR * 2 + 1.6
    for m in p:
        s = pad(midi(m), d) * 0.06
        add(L, t0, s * (0.85 + 0.3 * rng.random())); add(R, t0, s * (0.85 + 0.3 * rng.random()))
    bs = pad(midi(b), d) * 0.13; add(L, t0, bs); add(R, t0, bs)
    for k in range(8):  # bell motif: sparse in section 0, every beat in 1, offbeat echoes in 2
        tt = t0 + k * BEAT
        if section == 0 and k % 2:
            continue
        nt = bell(midi(mot[k % 4] + (12 if section == 2 and k % 4 == 3 else 0)), 0.045 * (1.0 if k % 4 == 0 else 0.7))
        pan = 0.65 + 0.35 * np.sin(k * 1.7 + i)
        add(L, tt, nt, pan); add(R, tt + 0.012, nt, 1.3 - pan)
    groove = t0 >= a.hook - 0.1
    for k in range(16):  # soft pulse after the hook
        tt = t0 + k * BEAT / 2
        if not groove:
            continue
        if k % 4 == 0:
            kk = kick(0.12 if section else 0.09); add(L, tt, kk); add(R, tt, kk)
        if k % 2 == 1 and section != 0:
            hh = hat(0.012); add(L, tt, hh * 0.8); add(R, tt, hh * 1.2)
    t0 += BAR * 2; i += 1

for buf in (L, R):  # hall
    out = buf.copy()
    for dly, g in [(0.029, 0.34), (0.071, 0.27), (0.119, 0.22), (0.183, 0.17), (0.277, 0.13), (0.41, 0.09)]:
        k = int(dly * SR); out[k:] += buf[:-k] * g
    buf[:] = out
mix = np.stack([L, R], 1)
mix /= np.abs(mix).max() + 1e-9
mix *= 0.89
fade = int(3.0 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix[: int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR))[:, None]
with wave.open(a.out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print(a.out, f"{LEN:.1f}s")
