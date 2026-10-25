#!/usr/bin/env python3
"""Find single-frame glitches: frame n differs from both neighbours while n-1 and n+1 agree.

    python3 flicker_scan.py <video> [--thresh 6]
"""
import argparse, subprocess
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("video"); ap.add_argument("--thresh", type=float, default=6.0)
a = ap.parse_args()
W, H = 108, 192
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", a.video, "-vf", f"scale={W}:{H}", "-pix_fmt", "gray", "-f", "rawvideo", "-"],
                     capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
fps = 60
hits = []
for n in range(1, len(fr) - 1):
    a1 = np.abs(fr[n] - fr[n - 1]).mean()
    a2 = np.abs(fr[n] - fr[n + 1]).mean()
    b = np.abs(fr[n + 1] - fr[n - 1]).mean()
    score = min(a1, a2) - b
    if score > a.thresh / 3 and min(a1, a2) > a.thresh:
        hits.append((n, n / fps, round(min(a1, a2), 1), round(b, 1)))
print(f"{len(fr)} frames, {len(hits)} suspect")
for h in hits:
    print(f"  frame {h[0]:5d}  t={h[1]:6.2f}s  jump={h[2]}  neighbours={h[3]}")
