#!/usr/bin/env python3
"""Dark tension bed for zombie/horror shorts: low detuned drone (A minor, b2 rub), sub pulse that speeds up,
high airy shimmer, and a rising swell into each --hit time (the drone ducks for a beat after each hit).
--drop marks where the pulse kicks in; --hush makes 2 s of near-silence (for "On paper..." style beats).

    python3 gen_music_tension.py <seconds> <out.wav> [--drop 16.8] [--hits 16.8,39.8] [--hush 49.7]
"""
import argparse, wave
import numpy as np

SR = 44100
ap = argparse.ArgumentParser()
ap.add_argument("length", type=float); ap.add_argument("out")
ap.add_argument("--drop", type=float, default=15.0)
ap.add_argument("--hits", default="")
ap.add_argument("--hush", type=float, default=-1)
a = ap.parse_args()
N = int(a.length * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
hits = [float(x) for x in a.hits.split(",") if x]

drone = sum(g * np.sin(2 * np.pi * f * t + p) for f, g, p in [(55, 0.5, 0), (55.4, 0.4, 1), (82.4, 0.22, 2), (116.5, 0.12, 0.5), (110, 0.18, 3)])
drone *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * t)
noise = np.convolve(rng.standard_normal(N), np.ones(400) / 400, mode="same")
air = noise * 2.5 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t + 1))
shimmer = 0.05 * np.sin(2 * np.pi * 1760 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * t)) + 0.04 * np.sin(2 * np.pi * 1864.7 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t + 2))

pulse = np.zeros(N)
x = a.drop
while x < a.length - 1:
    i = int(x * SR); L = min(int(0.35 * SR), N - i)
    tt = np.arange(L) / SR
    pulse[i:i + L] += np.sin(2 * np.pi * (48 + 30 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9)
    prog = (x - a.drop) / max(1, a.length - a.drop)
    x += 0.85 - 0.4 * prog  # heartbeat speeds up

swell = np.zeros(N); duck = np.ones(N)
for h in hits:
    i0, i1 = int(max(0, h - 2.5) * SR), int(h * SR)
    if i1 > N: continue
    seg = np.linspace(0, 1, i1 - i0) ** 2
    swell[i0:i1] += seg * np.sin(2 * np.pi * np.linspace(200, 900, i1 - i0) * t[i0:i1]) * 0.15 + seg * noise[i0:i1] * 6
    L = min(int(1.2 * SR), N - i1)
    k = np.arange(L) / SR
    swell[i1:i1 + L] += np.sin(2 * np.pi * 40 * k) * np.exp(-k * 3) * 0.9  # boom
    duck[i1:i1 + L] = np.minimum(duck[i1:i1 + L], 0.4 + 0.6 * (k / 1.2))

mix = (drone * 0.5 + air + shimmer) * duck + pulse * 0.6 + swell
if a.hush > 0:
    i0, i1 = int(a.hush * SR), int((a.hush + 2.2) * SR)
    env = np.ones(N); env[i0:i1] = 0.12
    env = np.convolve(env, np.ones(2000) / 2000, mode="same")
    mix *= env
fade = np.minimum(1, np.minimum(t / 1.5, (a.length - t) / 2))
mix *= fade
mix /= np.max(np.abs(mix)) + 1e-9
st = np.stack([mix * 0.9, np.roll(mix, 220) * 0.9], 1)
with wave.open(a.out, "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print(a.out, f"{a.length}s")
