#!/usr/bin/env python3
"""Bright minimal electronic bed for app promos (Music/ is empty). 120 bpm, 1 bar = 2.0 s, so scene cuts
can sit on downbeats. Structure (seconds): 0-4 filtered intro + riser, 4 drop, 4-26 groove, 26-28 break +
riser, 28 final hit, 28-LEN sustained outro pad.

    python3 gen_music_promo.py <seconds> <out.wav>
"""
import argparse, wave
import numpy as np

SR = 48000
ap = argparse.ArgumentParser()
ap.add_argument("length", type=float); ap.add_argument("out")
a = ap.parse_args()
LEN, N = a.length, int(a.length * SR)
BEAT = 0.5
BAR = 4 * BEAT
DROP, BREAK, END = 4.0, 26.0, 28.0
rng = np.random.default_rng(7)
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)
# D major, I - V - vi - IV  (Dmaj9, A, Bm7, Gmaj7): chord tones for pad/arp, bass root
CHORDS = [
    ([62, 66, 69, 73, 76], 38),
    ([61, 64, 69, 73, 76], 33),
    ([62, 66, 69, 71, 74], 35),
    ([62, 66, 67, 71, 74], 31),
]
L = np.zeros(N); R = np.zeros(N)


def add(start, sig, g=1.0, pan=0.0):
    s = int(round(start * SR))
    if s >= N or s < 0:
        return
    e = min(N, s + len(sig))
    L[s:e] += sig[: e - s] * g * (1 - max(0, pan))
    R[s:e] += sig[: e - s] * g * (1 + min(0, pan))


def tt(d):
    return np.arange(int(d * SR)) / SR


def kick(g=1.0):
    t = tt(0.4)
    f = 48 + 120 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    click = (rng.random(len(t)) * 2 - 1) * np.exp(-t * 400) * 0.25
    return (np.tanh(1.8 * np.sin(ph)) * np.exp(-t * 9) + click) * g


def clap(g=1.0):
    t = tt(0.3)
    n = rng.random(len(t)) * 2 - 1
    env = sum(np.exp(-np.maximum(0, t - o) * 60) * (t >= o) for o in (0, 0.011, 0.022)) / 3 + np.exp(-t * 18) * 0.4
    sig = n * env
    # crude band-pass: difference of moving averages
    k1, k2 = 3, 24
    hp = sig - np.convolve(sig, np.ones(k2) / k2, "same")
    return np.convolve(hp, np.ones(k1) / k1, "same") * g


def hat(g=1.0, open_=False):
    t = tt(0.25 if open_ else 0.06)
    n = rng.random(len(t)) * 2 - 1
    hp = n - np.convolve(n, np.ones(4) / 4, "same")
    return hp * np.exp(-t * (14 if open_ else 90)) * g


def pluck(f, g=1.0, d=0.45):
    t = tt(d)
    env = np.minimum(1, t / 0.003) * np.exp(-t * 9)
    s = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(4 * np.pi * f * t) * np.exp(-t * 14) + 0.2 * np.sin(6 * np.pi * f * t) * np.exp(-t * 22)
    return s * env * g


def pad(freqs, d, g=1.0):
    t = tt(d)
    env = np.minimum(1, t / 0.6) * np.clip((d - t) / 0.8, 0, 1)
    s = sum(np.sin(2 * np.pi * f * (1 + dt) * t + p) for f in freqs for dt, p in ((-0.003, 0), (0.0031, 1.7)))
    return s * env * g / (2 * len(freqs))


def sub(f, d, g=1.0):
    t = tt(d)
    env = np.minimum(1, t / 0.01) * np.clip((d - t) / 0.05, 0, 1)
    return np.tanh(1.3 * np.sin(2 * np.pi * f * t)) * env * g


def riser(d, g=1.0):
    t = tt(d)
    n = rng.random(len(t)) * 2 - 1
    sweep = np.sin(2 * np.pi * np.cumsum(200 + 1800 * (t / d) ** 2) / SR)
    return (n * 0.5 + sweep * 0.5) * (t / d) ** 2.5 * g


def impact(g=1.0):
    t = tt(1.8)
    f = 36 + 70 * np.exp(-t * 10)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.tanh(1.6 * np.sin(ph)) * np.exp(-t * 2.2) + (rng.random(len(t)) * 2 - 1) * np.exp(-t * 40) * 0.4) * g


bars = int(np.ceil(LEN / BAR))
for b in range(bars):
    t0 = b * BAR
    tones, root = CHORDS[b % 4]
    intro, groove, brk, outro = t0 < DROP, DROP <= t0 < BREAK, BREAK <= t0 < END, t0 >= END
    # pad: always (quiet in groove, full in intro/outro)
    if not outro:
        add(t0, pad([midi(m) for m in tones], BAR + 0.6, 0.22 if groove else 0.3))
    # arp: 16ths in groove, 8ths in intro/break
    step = BEAT / 4 if groove else BEAT / 2
    pattern = [0, 2, 4, 1, 3, 2, 4, 1]
    k = 0
    tt0 = t0
    while tt0 < t0 + BAR - 1e-6:
        m = tones[pattern[k % len(pattern)]] + (12 if (k % 8) in (2, 6) else 0)
        g = 0.11 if groove else (0.05 + 0.06 * (tt0 / DROP) if intro else 0.08)
        add(tt0, pluck(midi(m), g), pan=0.35 if k % 2 else -0.35)
        k += 1; tt0 += step
    if groove:
        for i in range(4):
            bt = t0 + i * BEAT
            add(bt, kick(0.9))
            add(bt, sub(midi(root), BEAT * 0.45, 0.0))  # spacer (sidechain feel comes from bass offbeats)
            add(bt + BEAT / 2, sub(midi(root), BEAT * 0.42, 0.32))
            if i in (1, 3):
                add(bt, clap(0.45))
            add(bt + BEAT / 2, hat(0.16, open_=(i == 3)))
            add(bt + BEAT / 4, hat(0.07)); add(bt + 3 * BEAT / 4, hat(0.07))
    if intro and t0 >= BAR:  # second intro bar: soft kicks building
        for i in range(4):
            add(t0 + i * BEAT, kick(0.35 + 0.1 * i))
    if brk:  # break: half-time claps
        add(t0 + BEAT, clap(0.3)); add(t0 + 3 * BEAT, clap(0.3))

add(DROP - 1.6, riser(1.6, 0.22))
add(DROP, impact(0.75))
add(BREAK - 0.05, impact(0.35))
add(END - 1.6, riser(1.6, 0.22))
add(END, impact(0.85))
# outro: open Dmaj9 chord ringing out
if LEN > END:
    tones, root = CHORDS[0]
    add(END, pad([midi(m) for m in tones] + [midi(tones[0] + 12)], LEN - END + 0.2, 0.42))
    add(END, sub(midi(root), 1.2, 0.35))
    for i, m in enumerate(tones):
        add(END + i * 0.06, pluck(midi(m + 12), 0.1, d=1.6), pan=(-0.4 + 0.2 * i))

# simple stereo room: a few decaying taps
wetL = np.zeros(N); wetR = np.zeros(N)
for d, g in ((0.031, 0.35), (0.047, 0.3), (0.089, 0.22), (0.131, 0.16), (0.197, 0.1)):
    s = int(d * SR)
    wetL[s:] += R[:-s] * g; wetR[s:] += L[:-s] * g
L, R = L + wetL * 0.5, R + wetR * 0.5
fade = np.clip((N - np.arange(N)) / (0.6 * SR), 0, 1)
L *= fade; R *= fade
peak = max(np.abs(L).max(), np.abs(R).max())
L, R = L / peak * 0.89, R / peak * 0.89
pcm = (np.stack([L, R], 1) * 32767).astype(np.int16)
with wave.open(a.out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("wrote", a.out, LEN, "s")
