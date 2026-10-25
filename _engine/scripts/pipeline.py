#!/usr/bin/env python3
"""Video edit pipeline. Run from anywhere:

  python3 _engine/scripts/pipeline.py prep   <raw file> --slug S --format long|short
  python3 _engine/scripts/pipeline.py cut    --slug S [--drop 12.3-15.0,40-41.2] [--gap 0.3] [--pad 0.08]
  python3 _engine/scripts/pipeline.py broll  <b-roll file> --slug S --name N --start 3 --dur 2.5
  python3 _engine/scripts/pipeline.py plan   --slug S        (edits.json + words.json -> plan.json)
  python3 _engine/scripts/pipeline.py still --slug S --at 4.2 [--at 10]
  python3 _engine/scripts/pipeline.py render --slug S [--preview]

Job files live in _engine/public/jobs/<slug>/. Paths with ':' (e.g. "Raw Clips V:O") are handled.
"""
import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ENGINE = Path(__file__).resolve().parent.parent
ROOT = ENGINE.parent
FPS = 30
FILLERS = {"um", "uh", "uhm", "erm", "hmm", "mm", "ah"}
DIMS = {"long": (1920, 1080), "short": (1920, 1080)}  # user 2026-10-14: ALL shorts are edited horizontal 16:9


def job(slug):
    d = ENGINE / "public" / "jobs" / slug
    d.mkdir(parents=True, exist_ok=True)
    return d


def ff(path):
    # ffmpeg treats "Travels:Luxury/x.MOV" as a protocol -> force file:
    return "file:" + str(Path(path).resolve())


def run(cmd, **kw):
    print("$", " ".join(str(c) for c in cmd)[:300], flush=True)
    subprocess.run([str(c) for c in cmd], check=True, **kw)


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height:stream_side_data=rotation:format=duration", "-of", "json", ff(path)],
        capture_output=True, text=True, check=True).stdout
    j = json.loads(out)
    s = j["streams"][0]
    rot = 0
    for sd in s.get("side_data_list", []):
        rot = int(sd.get("rotation", 0))
    w, h = s["width"], s["height"]
    if abs(rot) == 90:
        w, h = h, w
    return {"w": w, "h": h, "dur": float(j["format"]["duration"])}


def fit_filter(src_w, src_h, W, H):
    """Scale/crop filter to fill WxH. Orientation mismatch -> blurred background fill."""
    src_vertical = src_h > src_w
    out_vertical = H > W
    if src_vertical == out_vertical:
        return f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1"
    return (f"split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
            f"boxblur=40:4,eq=brightness=-0.08[bg];[b]scale={W}:{H}:force_original_aspect_ratio=decrease[fg];"
            f"[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1")


def cmd_prep(a):
    d = job(a.slug)
    W, H = DIMS[a.format]
    info = probe(a.src)
    # --rotate fixes footage stored sideways WITHOUT rotation metadata (check a frame first!)
    rot = {"cw": "transpose=1,", "ccw": "transpose=2,", "180": "hflip,vflip,", "none": ""}[a.rotate]
    if a.rotate in ("cw", "ccw"):
        info["w"], info["h"] = info["h"], info["w"]
    meta = {"slug": a.slug, "source": str(Path(a.src).resolve()), "format": a.format, "W": W, "H": H,
            "rotate": a.rotate, **info}
    (d / "meta.json").write_text(json.dumps(meta, indent=2))
    vf = rot + fit_filter(info["w"], info["h"], W, H)
    run(["ffmpeg", "-v", "error", "-stats", "-y", "-i", ff(a.src), "-filter_complex", f"[0:v]{vf},fps={FPS}[v]",
         "-map", "[v]", "-map", "0:a:0", "-c:v", "h264_videotoolbox", "-b:v", "16M", "-c:a", "aac", "-b:a", "192k",
         "-ar", "48000", d / "proxy.mp4"])
    run(["ffmpeg", "-v", "error", "-y", "-i", d / "proxy.mp4", "-ac", "1", "-ar", "16000", d / "audio.wav"])
    run(["whisper", d / "audio.wav", "--model", a.model, "--word_timestamps", "True", "--output_format", "json",
         "--output_dir", d, "--fp16", "False", "--verbose", "False"])
    raw = json.loads((d / "audio.json").read_text())
    words = [{"text": w["word"].strip(), "start": round(w["start"], 3), "end": round(w["end"], 3),
              "p": round(w.get("probability", 1), 2)} for s in raw["segments"] for w in s.get("words", [])]
    (d / "words_raw.json").write_text(json.dumps(words))
    # readable transcript, one segment per line with raw timestamps (used to spot retakes)
    lines = [f"[{s['start']:7.2f}-{s['end']:7.2f}] {s['text'].strip()}" for s in raw["segments"]]
    (d / "transcript.txt").write_text("\n".join(lines))
    print(f"\nprep done -> {d}\n{len(words)} words, {info['dur']:.1f}s. Read transcript.txt next.")


def cmd_cut(a):
    d = job(a.slug)
    words = json.loads((d / "words_raw.json").read_text())
    drops = []
    for r in filter(None, (a.drop or "").split(",")):
        s, e = r.split("-")
        drops.append((float(s), float(e)))

    def dropped(w):
        mid = (w["start"] + w["end"]) / 2
        return any(s <= mid <= e for s, e in drops)

    keep_words = [w for w in words
                  if re.sub(r"[^a-z]", "", w["text"].lower()) not in FILLERS and not dropped(w)]
    # build speech runs: split where the pause exceeds --gap
    segs = []
    for w in keep_words:
        if segs and w["start"] - segs[-1]["end"] <= a.gap:
            segs[-1]["end"] = w["end"]
            segs[-1]["words"].append(w)
        else:
            segs.append({"start": w["start"], "end": w["end"], "words": [w]})
    dur = json.loads((d / "meta.json").read_text())["dur"]
    snap = lambda t: round(t * FPS) / FPS
    for s in segs:
        s["start"] = snap(max(0.0, s["start"] - a.pad))
        s["end"] = snap(min(dur, s["end"] + a.pad))
    # merge overlaps created by padding
    merged = []
    for s in segs:
        if merged and s["start"] <= merged[-1]["end"]:
            merged[-1]["end"] = max(merged[-1]["end"], s["end"])
            merged[-1]["words"] += s["words"]
        else:
            merged.append(s)
    segs = [s for s in merged if s["end"] - s["start"] >= 2 / FPS]

    # remap words onto the new timeline
    out_words, offset = [], 0.0
    for s in segs:
        for w in s["words"]:
            out_words.append({"text": w["text"], "start": round(w["start"] - s["start"] + offset, 3),
                              "end": round(w["end"] - s["start"] + offset, 3)})
        offset += s["end"] - s["start"]

    # ffmpeg trim+concat with 12ms audio fades at every cut (no clicks)
    parts, labels = [], []
    for i, s in enumerate(segs):
        L = s["end"] - s["start"]
        parts.append(f"[0:v]trim={s['start']:.4f}:{s['end']:.4f},setpts=PTS-STARTPTS[v{i}]")
        parts.append(f"[0:a]atrim={s['start']:.4f}:{s['end']:.4f},asetpts=PTS-STARTPTS,"
                     f"afade=t=in:d=0.012,afade=t=out:st={max(0, L - 0.012):.4f}:d=0.012[a{i}]")
        labels.append(f"[v{i}][a{i}]")
    graph = ";".join(parts) + f";{''.join(labels)}concat=n={len(segs)}:v=1:a=1[v][ar];" \
            "[ar]highpass=f=80,loudnorm=I=-14:TP=-1.5:LRA=11[a]"
    (d / "cut_graph.txt").write_text(graph)
    run(["ffmpeg", "-v", "error", "-stats", "-y", "-i", d / "proxy.mp4", "-filter_complex_script", d / "cut_graph.txt",
         "-map", "[v]", "-map", "[a]", "-r", FPS, "-c:v", "h264_videotoolbox", "-b:v", "16M",
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000", d / "aroll.mp4"])
    (d / "words.json").write_text(json.dumps(out_words, indent=0))
    (d / "segments.json").write_text(json.dumps([{"start": s["start"], "end": s["end"]} for s in segs]))
    cut_len = sum(s["end"] - s["start"] for s in segs)
    # numbered transcript of the CUT timeline for planning
    lines, line, t0 = [], [], None
    for w in out_words:
        if t0 is None:
            t0 = w["start"]
        line.append(w["text"])
        if re.search(r"[.!?]$", w["text"]) or len(line) >= 14:
            lines.append(f"[{t0:7.2f}-{w['end']:7.2f}] {' '.join(line)}")
            line, t0 = [], None
    if line:
        lines.append(f"[{t0:7.2f}-{out_words[-1]['end']:7.2f}] {' '.join(line)}")
    (d / "transcript_cut.txt").write_text("\n".join(lines))
    print(f"\ncut done: {len(segs)} segments, {dur:.1f}s -> {cut_len:.1f}s. Read transcript_cut.txt to plan.")


def make_broll(slug, src, name, start, dur, speed=1.0, crop=None):
    d = job(slug) / "broll"
    d.mkdir(exist_ok=True)
    meta = json.loads((job(slug) / "meta.json").read_text())
    info = probe(src)
    vf = fit_filter(info["w"], info["h"], meta["W"], meta["H"])
    if crop:  # [x, y, w, h] fractions of the source frame
        cx, cy, cw, ch = crop
        vf = f"crop=iw*{cw}:ih*{ch}:iw*{cx}:ih*{cy}," + fit_filter(info["w"] * cw, info["h"] * ch, meta["W"], meta["H"])
    out = d / f"{name}.mp4"
    slow = f"setpts=PTS/{speed}," if speed != 1 else ""
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(start), "-t", str(dur), "-i", ff(src), "-filter_complex",
         f"[0:v]{slow}{vf},fps={FPS}[v]", "-map", "[v]", "-an", "-c:v", "h264_videotoolbox", "-b:v", "24M", out])
    return f"jobs/{slug}/broll/{name}.mp4"


def cmd_broll(a):
    d = job(a.slug) / "broll"
    d.mkdir(exist_ok=True)
    meta = json.loads((job(a.slug) / "meta.json").read_text())
    info = probe(a.src)
    vf = fit_filter(info["w"], info["h"], meta["W"], meta["H"])
    out = d / f"{a.name}.mp4"
    # --speed < 1 = slow motion (best on 60/120 fps sources). --dur is SOURCE seconds.
    slow = f"setpts=PTS/{a.speed}," if a.speed != 1 else ""
    run(["ffmpeg", "-v", "error", "-y", "-ss", a.start, "-t", a.dur, "-i", ff(a.src), "-filter_complex",
         f"[0:v]{slow}{vf},fps={FPS}[v]", "-map", "[v]", "-an", "-c:v", "h264_videotoolbox", "-b:v", "24M", out])
    print(f"jobs/{a.slug}/broll/{a.name}.mp4")


def cmd_plan(a):
    """Merge Claude-authored edits.json + words.json -> plan.json (what Remotion renders)."""
    d = job(a.slug)
    meta = json.loads((d / "meta.json").read_text())
    e = json.loads((d / "edits.json").read_text())
    words = json.loads((d / "words.json").read_text())
    for i in e.get("big", []):
        words[i]["emph"] = "big"
    for i in e.get("italic", []):
        words[i]["emph"] = "italic"
    for i, txt in (e.get("fix", {}) or {}).items():  # transcription fixes: {"12": "Cal AI"}
        words[int(i)]["text"] = txt
    dur = words[-1]["end"] + 0.4 if words else 5
    seg = json.loads((d / "segments.json").read_text())
    dur = sum(s["end"] - s["start"] for s in seg)  # exactly the a-roll length
    sfx = list(e.get("sfx", []))
    if e.get("autoSfx", True):
        for b in e.get("broll", []):
            sfx.append({"src": "sfx/whoosh.wav", "at": round(b["start"] - 0.12, 3), "volume": 0.35})
        for i in e.get("big", []):
            sfx.append({"src": "sfx/pop.wav", "at": round(words[i]["start"] - 0.03, 3), "volume": 0.3})
        for g in e.get("graphics", []):
            sfx.append({"src": "sfx/whoosh_long.wav", "at": round(max(0, g["start"] - 0.15), 3), "volume": 0.35})
            for it in g.get("items", []):
                if "at" in it:
                    sfx.append({"src": "sfx/pop.wav", "at": round(it["at"] - 0.03, 3), "volume": 0.3})
        for h in e.get("headlines", []):
            sfx.append({"src": "sfx/impact.wav" if h["start"] < 1 else "sfx/pop.wav", "at": h["start"], "volume": 0.4})
    plan = {
        "title": e["title"], "format": meta["format"], "width": meta["W"], "height": meta["H"], "fps": FPS,
        "durationSec": round(dur, 3), "preset": e.get("preset", "gold"), "aroll": f"jobs/{a.slug}/aroll.mp4",
        "words": words, "broll": e.get("broll", []), "headlines": e.get("headlines", []),
        "zooms": e.get("zooms", []), "sfx": sfx, "accents": e.get("accents", []),
    }
    for k in ("captionPosition", "captionScale", "music", "grade", "arollVolume", "placements", "graphics"):
        if k in e:
            plan[k] = e[k]
    (d / "plan.json").write_text(json.dumps(plan, indent=1))
    print(f"plan.json written: {dur:.1f}s, {len(plan['broll'])} b-roll, {len(sfx)} sfx")


# ---------------- Cine Lockup shorts (style-guide section 2) ----------------
PUNCT_KEEP = re.compile(r"[^\w'?!ऀ-ॿ]")


def cap_text(t):
    return PUNCT_KEEP.sub("", t).lower()


def person_fg(slug, src_rel, t0, dur, name):
    """Cut the person out of jobs-relative video src_rel for [t0, t0+dur) -> ProRes 4444 with alpha."""
    d = job(slug) / "fg"
    work = d / f"_{name}"
    for sub in ("rgb", "mask"):
        (work / sub).mkdir(parents=True, exist_ok=True)
        for old in (work / sub).glob("*.png"):
            old.unlink()
    src = ENGINE / "public" / src_rel
    run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ss", f"{t0:.3f}", "-t", f"{dur:.3f}", "-vf", f"fps={FPS}",
         work / "rgb" / "%04d.png"])
    tool = ENGINE / "scripts" / "personmatte"
    if not tool.exists():
        run(["swiftc", "-O", ENGINE / "scripts" / "personmatte.swift", "-o", tool])
    run([tool, work / "rgb", work / "mask"])
    out = d / f"{name}.mov"
    run(["ffmpeg", "-v", "error", "-y", "-framerate", FPS, "-i", work / "rgb" / "%04d.png", "-framerate", FPS,
         "-i", work / "mask" / "%04d.png", "-filter_complex",
         "[1:v]format=gray,tmix=frames=3,erosion,gblur=sigma=1.4[m];[0:v][m]alphamerge,format=yuva444p10le[v]",
         "-map", "[v]", "-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", out])
    return f"jobs/{slug}/fg/{name}.mov"


# ---- face-aware caption placement (user 2026-10-14: captions never cover the talking face) ----
SAFE = {"l": 0.10, "r": 0.88, "t": 0.10, "b": 0.86}  # keep text off the edges (IG/YT like/share UI after 9:16 conversion)


def face_track(slug):
    """Largest face box every 0.2 s of aroll.mp4 -> faces.json [{t, box:[x,y,w,h]|null}] (cached)."""
    d = job(slug)
    out = d / "faces.json"
    if out.exists() and out.stat().st_mtime > (d / "aroll.mp4").stat().st_mtime:
        return json.loads(out.read_text())
    work = d / "_faces"
    work.mkdir(exist_ok=True)
    for old in work.glob("*.png"):
        old.unlink()
    run(["ffmpeg", "-v", "error", "-y", "-i", d / "aroll.mp4", "-vf", "fps=5,scale=640:-2", work / "%05d.png"])
    tool = ENGINE / "scripts" / "facebox"
    if not tool.exists():
        run(["swiftc", "-O", ENGINE / "scripts" / "facebox.swift", "-o", tool])
    lines = subprocess.run([str(tool), str(work)], capture_output=True, text=True, check=True).stdout.splitlines()
    faces = []
    for ln in lines:
        j = json.loads(ln)
        faces.append({"t": round((int(j["f"].split(".")[0]) - 1) / 5, 2), "box": j["box"]})
    out.write_text(json.dumps(faces))
    return faces


def face_box(faces, zooms, t0, t1):
    """Robust face box in [t0, t1] (15th/85th percentiles, so head sway doesn't inflate it), mapped through the
    punch-in zoom active at t0. None if no face."""
    bs = [f["box"] for f in faces if t0 - 0.1 <= f["t"] <= t1 + 0.1 and f["box"]]
    if not bs:
        return None
    pct = lambda v, q: sorted(v)[min(len(v) - 1, int(q * (len(v) - 1) + 0.5))]
    x0 = pct([b[0] for b in bs], 0.15); y0 = pct([b[1] for b in bs], 0.15)
    x1 = pct([b[0] + b[2] for b in bs], 0.85); y1 = pct([b[1] + b[3] for b in bs], 0.85)
    z = next((zz["scale"] for zz in zooms if zz["start"] <= t0 < zz["end"]), 1.0)
    m = lambda v: 0.5 + (v - 0.5) * z
    return [m(x0), m(y0), m(x1), m(y1)]


def place_off_face(box, text, size, em, aspect=16 / 9):
    """Anchor (+scale) for one text line of font-size `size`·H that never covers the face box [x0,y0,x1,y1].
    Candidates: below the chin, left of the face, right of the face; pick the one allowing the biggest text
    (below wins ties within 0.1). Everything stays inside SAFE."""
    w = max(0.01, len(text) * em * size / aspect)  # estimated width, fraction of W
    fx0, fy0, fx1, fy1 = box
    gap = 0.025
    cands = []
    # below the chin
    sb = min(1.0, (SAFE["b"] - fy1 - gap) / size, (SAFE["r"] - SAFE["l"]) / w)
    if sb > 0:
        yc = fy1 + gap + size * sb / 2
        x = min(max((fx0 + fx1) / 2, SAFE["l"] + w * sb / 2), SAFE["r"] - w * sb / 2)
        cands.append((sb + 0.1, sb, {"x": round(x, 3), "y": round(yc, 3), "align": "center"}))
    # beside the face, at mouth height
    ym = fy0 + 0.62 * (fy1 - fy0)
    for room, a in ((fx0 - gap - SAFE["l"], {"x": round(fx0 - gap, 3), "align": "right"}),
                    (SAFE["r"] - (fx1 + gap), {"x": round(fx1 + gap, 3), "align": "left"})):
        sc = min(1.0, room / w)
        if sc > 0:
            a = dict(a, y=round(min(max(ym, SAFE["t"] + size * sc / 2), SAFE["b"] - size * sc / 2), 3))
            cands.append((sc, sc, a))
    if not cands:
        return {"x": 0.5, "y": SAFE["b"] - size * 0.25, "align": "center", "scale": 0.5}
    _, sc, a = max(cands, key=lambda c: c[0])
    sc = max(sc, 0.5)
    if sc < 0.995:
        a["scale"] = round(sc, 2)
    return a

def cmd_cine(a):
    """edits_cine.json (Claude-written) + words.json -> cine_plan.json for the Cine composition."""
    d = job(a.slug)
    e = json.loads((d / "edits_cine.json").read_text())
    words = json.loads((d / "words.json").read_text())
    for i, txt in (e.get("fix") or {}).items():
        words[int(i)]["text"] = txt
    seg = json.loads((d / "segments.json").read_text())
    talk = round(sum(s["end"] - s["start"] for s in seg), 3)
    W_ = lambda i: words[i]["start"]

    # inserts (b-roll proxies, hard cuts)
    inserts = []
    for k, b in enumerate(e.get("inserts", [])):
        if b.get("gfx"):  # 3D motion-graphic scene drawn by Remotion (src/gfx/registry.tsx), no proxy
            inserts.append({"gfx": b["gfx"], "gfxScene": b.get("gfxScene", "school"), "start": b["start"], "end": b["end"],
                            **({"capAnchor": b["capAnchor"]} if "capAnchor" in b else {})})
            continue
        name = b.get("name") or f"ins{k}"
        dur = b["end"] - b["start"] + 0.2
        prox = d / "broll" / f"{name}.mp4"
        src = prox.relative_to(ENGINE / "public").as_posix() if prox.exists() and not a.rebuild else \
            make_broll(a.slug, ROOT / b["src"], name, b.get("in", 1.0), dur, b.get("speed", 1.0))
        inserts.append({"src": src, "start": b["start"], "end": b["end"]})
    cuts = sorted({0.0, talk} | {x for b in inserts for x in (b["start"], b["end"])})
    shot_end = lambda t: next((c for c in cuts if c > t + 1e-6), talk)
    shot_of = lambda t: max(c for c in cuts if c <= t + 1e-6)

    heroes, taken = [], set()
    for h in e.get("heroes", []):
        st = W_(h["w"]) if "w" in h else h["start"]
        en = min(st + h.get("hold", 0.7), shot_end(st)) if "end" not in h else h["end"]
        heroes.append({"text": h.get("text") or cap_text(words[h["w"]]["text"]).upper(), "start": round(st, 3), "end": round(en, 3),
                       **{k: h[k] for k in ("fill", "anchor", "size") if k in h}})
        taken |= set(h.get("covers", [h["w"]] if "w" in h else []))
    lockups = []
    for l in e.get("lockups", []):
        ws = [{"text": w["text"], "face": w["face"], "at": round(W_(w["w"]) if "w" in w else w.get("at", l["start"]), 3),
               **{k: w[k] for k in ("size", "fill") if k in w}} for w in l["words"]]
        st = l.get("start", min(w["at"] for w in ws))
        en = l.get("end", shot_end(st))
        if l.get("covers") and e.get("lockupTrim", True):  # 2026-10-22: a long hold swallowed the next spoken words
            en = min(en, max(words[max(l["covers"])]["end"] + l.get("hold", e.get("lockupHold", 0.45)), st + 0.6))
        lockups.append({"start": st, "end": round(en, 3), "anchor": l["anchor"], "words": ws})
        taken |= set(l.get("covers", []))
    for b in e.get("behind", []):  # optional: hide the behind-word's spoken words from the captions
        taken |= set(b.get("covers", []))

    # word-append caption chunks
    cap = e.get("capSize", 0.065)
    busy = [(x["start"], x["end"]) for x in heroes + lockups]
    in_busy = lambda t: any(s - 0.02 <= t < en for s, en in busy)
    breaks, serif = set(e.get("breaks", [])), set(e.get("serif", []))
    chunks, cur = [], None
    for i, w in enumerate(words):
        if i in taken or not cap_text(w["text"]):
            if cur: chunks.append(cur); cur = None
            continue
        txt = cap_text(w["text"])
        new = (cur is None or i in breaks or len(cur["words"]) >= 5
               or len(" ".join(x["text"] for x in cur["words"]) + " " + txt) > 20
               or w["start"] - cur["last_end"] > 0.35 or shot_of(w["start"]) != cur["shot"]
               or in_busy(w["start"]) != cur["busy"]
               or re.search(r"[.,!?;:]$", words[i - 1]["text"]))
        if new:
            if cur: chunks.append(cur)
            cur = {"words": [], "shot": shot_of(w["start"]), "serif": i in serif, "first": i, "busy": in_busy(w["start"])}
        cur["words"].append({"text": txt, "at": round(w["start"], 3), "i": i})
        cur["last_end"] = w["end"]
    if cur: chunks.append(cur)
    # no orphans: a lone word joins the previous chunk on the same shot if the line stays <= 26 chars
    merged = []
    for c in chunks:
        p_ = merged[-1] if merged else None
        if (p_ and len(c["words"]) == 1 and p_["shot"] == c["shot"] and not c["serif"] and p_["busy"] == c["busy"]
                and c["words"][0]["at"] - p_["last_end"] < 0.35
                and len(" ".join(x["text"] for x in p_["words"] + c["words"])) <= 26):
            p_["words"] += c["words"]; p_["last_end"] = c["last_end"]
        else:
            merged.append(c)
    chunks = merged
    busy_end = lambda t: max((en for s_, en in busy if s_ - 0.02 <= t < en), default=None)
    split = []
    for c in chunks:  # a hero/lockup landing mid-chunk: words too close to it move to a chunk after it
        while True:
            cut = next((bs for bs, _ in sorted(busy) if c["words"][0]["at"] + 0.25 < bs < c["last_end"] + 0.6
                        and any(x["at"] >= bs - 0.25 for x in c["words"])), None)
            if cut is None:
                break
            head = [x for x in c["words"] if x["at"] < cut - 0.25]
            tail = [x for x in c["words"] if x["at"] >= cut - 0.25]
            if not head:
                break
            split.append(dict(c, words=head, last_end=head[-1]["at"] + 0.3))
            c = dict(c, words=tail, serif=False)
        split.append(c)
    chunks = split
    for c in chunks:
        while (be := busy_end(c["words"][0]["at"])) is not None:
            for x in c["words"]:
                x["at"] = round(max(x["at"], be + 0.03), 3)
        c["last_end"] = max(c["last_end"], c["words"][-1]["at"] + 0.45)
    out_chunks = []
    for k, c in enumerate(chunks):
        st = c["words"][0]["at"]
        nxt = chunks[k + 1]["words"][0]["at"] if k + 1 < len(chunks) else talk
        en = min(nxt, c["last_end"] + 0.6, shot_end(st))
        for bs, be in busy:  # clear 2-3 frames before a hero/lockup lands
            if st < bs < en:
                en = bs - 0.08
        ins_at = next((b for b in inserts if b["start"] <= st < b["end"]), None)
        anchor = (ins_at.get("capAnchor") or e.get("insertAnchor")) if ins_at else None
        ch = {"start": round(st, 3), "end": round(max(en, st + 0.2), 3), "words": c["words"]}
        if c["serif"]: ch["serif"] = True
        if anchor: ch["anchor"] = anchor
        out_chunks.append(ch)

    # face-aware anchors for everything on the A-roll (anchor "auto" is the default)
    if e.get("anchor", "auto") == "auto":
        faces = face_track(a.slug)
        zooms = e.get("zooms", [])
        on_insert = lambda t: any(b["start"] <= t < b["end"] for b in inserts)
        for ch in out_chunks:
            if "anchor" in ch or on_insert(ch["start"]):
                continue
            box = face_box(faces, zooms, ch["start"], ch["end"])
            if box:
                ch["anchor"] = place_off_face(box, " ".join(w["text"] for w in ch["words"]), cap * 1.02 if ch.get("serif") else cap, 0.5)
        for h, src in zip(heroes, e.get("heroes", [])):
            if "anchor" in h or on_insert(h["start"]):
                continue
            if src.get("hook"):  # opening hook: big & bold at eye level, centre (allowed over the face, first seconds only)
                h["anchor"] = e.get("hookAnchor", {"x": 0.5, "y": 0.8, "align": "center"})
                h.setdefault("size", e.get("hookSize", 0.12))
                continue
            box = face_box(faces, zooms, h["start"], h["end"])
            if box:
                h["anchor"] = place_off_face(box, h["text"], h.get("size", e.get("heroSize", 0.14)), 0.62)

    behind = []
    for k, b in enumerate(e.get("behind", [])):
        st = W_(b["w"]) if "w" in b else b["start"]
        en = b.get("end", st + 1.0)
        if b.get("on", "aroll") == "aroll":
            src, t0 = f"jobs/{a.slug}/aroll.mp4", st
        else:
            ins = next(x for x in inserts if x["start"] <= st < x["end"])
            src, t0 = ins["src"], st - ins["start"]
        name = f"behind{k}"
        fgp = d / "fg" / f"{name}.mov"
        fg = fgp.relative_to(ENGINE / "public").as_posix() if fgp.exists() and not a.rebuild else person_fg(a.slug, src, t0, en - st, name)
        behind.append({"text": b["text"], "start": round(st, 3), "end": round(en, 3), "style": b.get("style", "condensed"), "fg": fg,
                       "on": b.get("on", "aroll"), **{x: b[x] for x in ("y", "x", "size", "script") if x in b}})

    ec = e.get("endCard")
    end_dur = ec.get("dur", 3.0) if ec else 0
    total = round(talk + end_dur, 3)
    sfx = list(e.get("sfx", []))
    if e.get("autoSfx", True):
        hits = sorted({round(b["start"], 2) for b in inserts} | {h["start"] for h in heroes})
        for t in hits:
            if t > 0.4:
                sfx.append({"src": "sfx/swell_hit.wav", "at": round(t - 0.30, 3), "volume": 0.3})
        if ec:
            sfx.append({"src": "sfx/boom.wav", "at": talk, "volume": 0.6})
    music = e.get("music")
    if music and music.get("gen"):
        mw = d / "music.wav"
        if not mw.exists() or a.rebuild:
            run([sys.executable, ENGINE / "scripts" / "gen_music_cine.py", f"{total + 0.5:.2f}", mw, "--drop", f"{talk:.2f}"])
        music = {"src": f"jobs/{a.slug}/music.wav", "volume": music.get("volume", 0.16), "duckTo": music.get("duckTo", 0.13),
                 "endVolume": music.get("endVolume", 0.75)}
    plan = {"title": e["title"], "width": 1920, "height": 1080, "fps": FPS, "durationSec": total, "talkEnd": talk,
            "aroll": f"jobs/{a.slug}/aroll.mp4", "zooms": e.get("zooms", []), "inserts": inserts, "chunks": out_chunks,
            "anchor": e["anchor"] if isinstance(e.get("anchor"), dict) else {"x": 0.5, "y": 0.62, "align": "center"}, "heroes": heroes, "lockups": lockups,
            "behind": behind, "sfx": sfx, "capSize": cap, "textScale": e.get("textScale", 0.75)}
    if e.get("letterbox", 0):  # user 2026-10-14: no black opener by default
        plan["letterbox"] = {"dur": e["letterbox"]}
    if ec:
        plan["endCard"] = {"start": talk, "dur": end_dur, "text": ec["text"], "font": ec.get("font", "caps"), "reveal": ec.get("reveal", "fade")}
    for k in ("tag", "grade"):
        if k in e: plan[k] = e[k]
    if music: plan["music"] = music
    (d / "cine_plan.json").write_text(json.dumps(plan, indent=1))
    for x in out_chunks + heroes:  # face rule squeezed the text: rethink the zoom or move that line to an insert
        sc = (x.get("anchor") or {}).get("scale", 1)
        if sc < 0.8:
            txt = x.get("text") or " ".join(w["text"] for w in x["words"])
            print(f"WARN small text {sc:.2f}x at {x['start']:.2f}s '{txt}' (no room off the face: drop the punch-in there or cover with an insert)")
    shown = set(taken)
    for ch in out_chunks:  # a word counts only if it is on screen for >= 3 frames outside every hero/lockup
        for w in ch["words"]:
            ts = [w["at"] + k / FPS for k in range(int((ch["end"] - w["at"]) * FPS) + 1)]
            if sum(1 for t in ts if t < ch["end"] and not in_busy(t)) >= 3:
                shown.add(w["i"])
    lost = [f'{i}:{cap_text(x["text"])}' for i, x in enumerate(words) if i not in shown and cap_text(x["text"])]
    if lost:
        print("WARN uncaptioned words: " + " ".join(lost))
    print(f"cine_plan.json: {total:.1f}s ({talk:.1f} talk + {end_dur} end) · {len(inserts)} inserts · {len(out_chunks)} chunks · "
          f"{len(heroes)} heroes · {len(lockups)} lockups · {len(behind)} behind · {len(sfx)} sfx")


# ---------------- Long composition (long-video-editor skill, 2026-10-19) ----------------
# edits_long.json (Claude-written; times = cut timeline) -> long_plan.json for src/long/Long.tsx.
# Text markup inside lines: ~script~  _italic_  ^gold^  !bad!  %good%  @ice@  (spans may cover several words).
MARK = {"~": "script", "_": "italic", "^": "gold", "!": "bad", "%": "good", "@": "ice"}
FULL_TYPES = {"mg", "broll", "versus", "calendar", "chain", "chapter", "tracker", "gfx3d", "battery", "dopamine", "phonePair"}
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())


class WordClock:
    """Finds when on-screen words are spoken (sequential matching inside a beat window)."""

    def __init__(self, words):
        self.w = words
        self.n = [norm(x["text"]) for x in words]

    def idx_after(self, t):
        return next((i for i, w in enumerate(self.w) if w["start"] >= t - 1e-3), len(self.w))

    def match(self, tok, i0, t_end, look=14):
        if not tok:
            return None
        for j in range(i0, min(len(self.w), i0 + look)):
            if self.w[j]["start"] > t_end:
                break
            s = self.n[j]
            if s == tok or (len(tok) >= 4 and len(s) >= 4 and (s.startswith(tok[:5]) or tok.startswith(s[:5]))):
                return j
        return None

    def say(self, phrase, t0, t1):
        """Start time of the first word of `phrase` spoken in [t0, t1] (None if not found)."""
        toks = [norm(x) for x in phrase.split() if norm(x)]
        i = self.idx_after(t0)
        while i < len(self.w) and self.w[i]["start"] <= t1:
            j = self.match(toks[0], i, t1, look=1)
            if j is not None:
                return self.w[j]["start"]
            i += 1
        return None


def parse_words(text):
    out, state = [], None
    for tok in text.split():
        f = None
        if tok[0] in MARK and state is None:
            state = MARK[tok[0]]; tok = tok[1:]
        f = state
        if tok and tok[-1] in MARK and state is not None and MARK[tok[-1]] == state:
            tok = tok[:-1]; state = None
        out.append({"t": tok, "f": f} if f else {"t": tok})
    return out


def cmd_long(a):
    d = job(a.slug)
    e = json.loads((d / "edits_long.json").read_text())
    words = json.loads((d / "words.json").read_text())
    for i, txt in (e.get("fix") or {}).items():
        words[int(i)]["text"] = txt
    seg = json.loads((d / "segments.json").read_text())
    talk = round(sum(s["end"] - s["start"] for s in seg), 3)
    clk = WordClock(words)
    faces = face_track(a.slug)

    def timed(ws, t0, t1, cursor, fallback):
        """Give each parsed word an `at` (spoken time); returns (new cursor index, words matched)."""
        last, hits = fallback, 0
        for w in ws:
            j = clk.match(norm(w["t"]), cursor, t1)
            if j is not None:
                w["at"] = round(clk.w[j]["start"], 3); w["_m"] = True; cursor = j + 1; last = w["at"]; hits += 1
            else:
                w["at"] = round(last + 0.06, 3); last = w["at"]
        return cursor, hits

    def line(spec, t0, t1, cursor, prev_at):
        sp = {"text": spec} if isinstance(spec, str) else dict(spec)
        ws = parse_words(sp.pop("text"))
        anchor = clk.say(sp.pop("say"), t0, t1) if "say" in sp else None
        if "at" in sp:
            anchor = sp["at"]
        if anchor is not None:  # explicit anchor: all words from there, staggered
            for k, w in enumerate(ws):
                w["at"] = round(anchor + k * 0.09, 3)
        else:
            cursor, hits = timed(ws, t0, t1, cursor, prev_at)
            if hits == 0:  # nothing spoken matches: stagger after the previous line
                for k, w in enumerate(ws):
                    w["at"] = round(prev_at + k * 0.08, 3)
            else:  # unmatched words before the first spoken one appear with it
                k0 = next(k for k, w in enumerate(ws) if w.get("_m"))
                for w in ws[:k0]:
                    w["at"] = ws[k0]["at"]
            for w in ws:
                w.pop("_m", None)
        L = {"words": ws, "at": ws[0]["at"]}
        strike = sp.pop("strike", None)
        if strike is not None:
            L["strikeAt"] = round(strike if isinstance(strike, (int, float)) and not isinstance(strike, bool)
                                  else (clk.say(strike, t0, t1) if isinstance(strike, str) else L["at"] + 0.6) or L["at"] + 0.6, 3)
        L.update({k: v for k, v in sp.items() if k in ("size", "icon", "iconColor", "color", "align")})
        return L, cursor

    def lines(specs, t0, t1, start_at=None):
        cursor, prev, out = clk.idx_after(t0 - 0.6), (start_at if start_at is not None else t0 + 0.05), []
        for s in specs:
            L, cursor = line(s, t0 - 0.6, t1 + 0.3, cursor, prev)
            out.append(L); prev = L["at"] + 0.25
        return out

    def when(say, t0, t1, default):
        if say is None:
            return round(default, 3)
        if isinstance(say, (int, float)):
            return round(float(say), 3)
        v = clk.say(say, t0 - 0.6, t1 + 0.3)
        if v is None:
            print(f"WARN say '{say}' not found in {t0:.1f}-{t1:.1f}s, using {default:.2f}")
            return round(default, 3)
        return round(v, 3)

    def face_in(t0, t1):
        bs = [f["box"] for f in faces if t0 - 0.1 <= f["t"] <= t1 + 0.1 and f["box"]]
        if not bs:
            return None
        pct = lambda v, q: sorted(v)[min(len(v) - 1, int(q * (len(v) - 1) + 0.5))]
        return [pct([b[0] for b in bs], 0.15), pct([b[1] for b in bs], 0.15),
                pct([b[0] + b[2] for b in bs], 0.85), pct([b[1] + b[3] for b in bs], 0.85)]

    # ---- angles: framing change on every cut point; long stretches split at a sentence end ----
    cuts, acc = [0.0], 0.0
    for s in seg:
        acc += s["end"] - s["start"]; cuts.append(round(acc, 3))
    ends = [w["end"] for w in words if re.search(r"[.!?]$", w["text"])]
    pts = []
    for c0, c1 in zip(cuts, cuts[1:]):
        pts.append(c0)
        x = c0
        while c1 - x > 11:
            mid = [t for t in ends if x + 4 < t < c1 - 3]
            if not mid:
                break
            x = min(mid, key=lambda t: abs(t - (x + (c1 - x) / 2)))
            pts.append(round(x + 0.05, 3))
    pts.append(talk)
    merged = [pts[0]]
    for p in pts[1:-1]:
        if p - merged[-1] >= e.get("angleMin", 2.4):
            merged.append(p)
    merged.append(talk)
    zoom = e.get("angleZoom", 1.28)
    angles = []
    for k, (t0, t1) in enumerate(zip(merged, merged[1:])):
        fb = face_in(t0, t1)
        ox, oy = ((fb[0] + fb[2]) / 2, (fb[1] + fb[3]) / 2) if fb else (0.5, 0.35)
        angles.append({"start": t0, "end": t1, "scale": 1.0 if k % 2 == 0 else zoom, "ox": round(ox, 3), "oy": round(oy, 3)})
    for o in e.get("angleOverrides", []):  # {"at": s, "scale": x, "bw": true}
        for an in angles:
            if an["start"] <= o["at"] < an["end"]:
                an.update({k: v for k, v in o.items() if k != "at"})
    ang_at = lambda t: next((an for an in angles if an["start"] <= t < an["end"]), angles[-1])

    def auto_anchor(t0, t1, side):
        """Clean text column beside the face: worst-case face box over [t0, t1] mapped through each framing."""
        boxes = []
        for an in angles:
            s0, s1 = max(t0, an["start"]), min(t1, an["end"])
            if s1 - s0 <= 0.05:
                continue
            fb = face_in(s0, s1)
            if not fb:
                continue
            sc = an["scale"] * max((p["scale"] for p in e.get("punches", []) if p.get("start", -1) < s1 and p.get("end", -1) > s0), default=1)
            m = lambda v, o: o + (v - o) * sc
            boxes.append([m(fb[0], an["ox"]), m(fb[1], an["oy"]), m(fb[2], an["ox"]), m(fb[3], an["oy"])])
        if not boxes:
            return {"x": 0.055, "y": 0.45, "align": "left", "maxW": 0.28}
        fx0, fy0 = min(b_[0] for b_ in boxes), min(b_[1] for b_ in boxes)
        fx1, fy1 = max(b_[2] for b_ in boxes), max(b_[3] for b_ in boxes)
        y = min(0.6, max(0.32, fy0 + 0.45 * (fy1 - fy0)))
        room_l, room_r = fx0 - 0.05 - 0.055, (1 - 0.055) - (fx1 + 0.05)
        if side == "right" or (side == "auto" and room_r > room_l + 0.04):
            return {"x": 0.945, "y": round(y, 3), "align": "right", "maxW": round(max(0.18, room_r), 3)}
        return {"x": 0.055, "y": round(y, 3), "align": "left", "maxW": round(max(0.18, room_l), 3)}

    beats = []
    for k, b in enumerate(e["beats"]):
        b = dict(b)
        typ, t0, t1 = b["type"], b["start"], b["end"]
        full = typ in FULL_TYPES or b.get("bg") == "look" or b.get("full")
        out = {"type": typ, "start": t0, "end": t1, "layer": "full" if full else "over"}
        for key in ("enter", "exit", "pos", "bg", "kicker", "dir", "maxW", "mode", "side", "scene", "kind", "zoom", "grade", "amount", "title",
                    "thumb", "goodKicker", "dim"):
            if key in b:
                out[key] = b[key]
        if typ == "stack":
            out["lines"] = lines(b["lines"], t0, t1)
            out.setdefault("pos", "auto")
            if out["pos"] == "auto":
                out["anchor"] = auto_anchor(t0, t1, b.get("side", "left"))
        elif typ == "headTitle":
            L = lines([b["left"], b["right"]], t0, t1)
            join = lambda ws: {**ws[0], "t": " ".join(w["t"] for w in ws)}
            out["left"], out["right"] = join(L[0]["words"]), join(L[1]["words"])
            out["sub"] = lines(b.get("sub", []), t0, t1, start_at=L[1]["at"] + 0.2)
            fb = face_in(t0, t1) or [0.4, 0.15, 0.6, 0.55]
            an = ang_at(t0)
            m = lambda v, o: o + (v - o) * an["scale"]
            out["face"] = [round(m(fb[0], an["ox"]), 3), round(m(fb[1], an["oy"]), 3), round(m(fb[2], an["ox"]), 3), round(m(fb[3], an["oy"]), 3)]
        elif typ == "pills":
            items, prev = [], t0 + 0.1
            for it in b["items"]:
                it = dict(it)
                it["at"] = it["at"] if "at" in it else when(it.pop("say", it["text"].split()[0]), t0, t1, prev)
                if "strike" in it:
                    it["strikeAt"] = when(it.pop("strike"), t0, t1, it["at"] + 0.8)
                items.append(it); prev = it["at"] + 0.3
            out["items"] = items
        elif typ == "versus":
            L = lines([b["bad"], b["good"]], t0, t1)
            out["bad"], out["good"] = L[0]["words"], L[1]["words"]
            out["badAt"], out["goodAt"] = L[0]["at"], max(L[1]["at"], L[0]["at"] + 0.5)
        elif typ == "calendar":
            out["litAt"] = when(b.get("lit"), t0, t1, t0 + 0.6 * (t1 - t0))
            out["labelAt"] = when(b.get("labelSay"), t0, t1, out["litAt"] + 0.3)
            out["label"] = b["label"]
            if "headline" in b:
                out["headline"] = lines([b["headline"]], t0, t1)[0]["words"]
            if "stampAts" in b:
                out["stampAts"] = [when(x, t0, t1, t0 + 0.3) for x in b["stampAts"]]
            if "lits" in b:
                out["litAts"] = [when(x, t0, t1, out["litAt"] + i * 0.35) for i, x in enumerate(b["lits"])]
            if "pct" in b:
                out["pctAt"] = when(b["pct"], t0, t1, t1 - 1.2)
        elif typ == "counter":
            items, prev = [], t0 + 0.15
            for it in b["items"]:
                it = dict(it)
                it["at"] = when(it.pop("say", None), t0, t1, prev)
                items.append(it); prev = it["at"] + 0.4
            out["items"] = items
        elif typ == "chain":
            out["items"] = [L["words"][0] if len(L["words"]) == 1 else {"t": " ".join(w["t"] for w in L["words"]), "at": L["at"]}
                            for L in lines(b["items"], t0, t1)]
            if "seps" in b:
                out["seps"] = b["seps"]
        elif typ == "chapter":
            out.update({"kicker": b["kicker"], "title": b["title"], "icons": b["icons"], "focus": b["focus"],
                        "titleAt": when(b.get("titleSay"), t0, t1, t0 + 0.55)})
        elif typ == "tracker":
            out.update({"items": e["tracker"]["items"], "title": b.get("title", e["tracker"]["title"]), "done": b.get("done", 0)})
            if b.get("tick") is not None or out["mode"] == "tick":
                out["tickAt"] = when(b.get("tick"), t0, t1, t0 + 0.55)
            if "intro" in b:
                out["introAts"] = [when(s, t0, t1, t0 + 0.2 + i * 0.16) for i, s in enumerate(b["intro"])]
            if "week" in b:
                out["week"] = {"at": when(b["week"].get("say"), t0, t1, t1 - 1.5), "label": b["week"]["label"]}
        elif typ == "phone":
            scr = []
            for s in b["screens"]:
                s = dict(s)
                s["at"] = when(s.pop("say", None), t0, t1, t0 if not scr else scr[-1]["at"] + 1.2)
                if s["kind"] == "chat":
                    s["bubbles"] = [dict(bb, at=when(bb.pop("say", None) if isinstance(bb, dict) else None, t0, t1, s["at"] + 0.3 + i * 0.5))
                                    for i, bb in enumerate(s["bubbles"])]
                    if "x" in s:
                        s["xAt"] = when(s.pop("x"), t0, t1, s["at"] + 1.5)
                if s["kind"] == "dnd":
                    s["onAt"] = when(s.pop("on", None), t0, t1, s["at"] + 0.5)
                if s["kind"] == "apps":
                    s["apps"] = [dict(ap, xAt=when(ap.pop("x"), t0, t1, s["at"] + 0.6)) if "x" in ap else ap for ap in s["apps"]]
                scr.append(s)
            out["screens"] = scr
            if "caption" in b:
                out["caption"] = lines(b["caption"], t0, t1)
        elif typ == "battery":
            out["from"] = b.get("from", 0.92)
            out["steps"] = [{"at": when(st.get("say"), t0, t1, t0 + 0.5 + i), "to": st["to"]} for i, st in enumerate(b["steps"])]
            out["lines"] = lines(b["lines"], t0, t1)
        elif typ == "dopamine":
            out["count"] = b.get("count", 16)
            if "headline" in b:
                out["headline"] = lines([b["headline"]], t0, t1)[0]["words"]
            if "neon" in b:
                out["neon"] = {"text": b["neon"]["text"], "at": when(b["neon"].get("say"), t0, t1, t1 - 1.2)}
        elif typ == "phonePair":
            out["redAt"] = when(b.get("red"), t0, t1, t0 + 1.5)
            out["goldAt"] = when(b.get("gold"), t0, t1, t1 - 2.0)
            out["labels"] = [{"side": l["side"], "text": l["text"], "at": when(l.get("say"), t0, t1, t0 + 1)} for l in b["labels"]]
        elif typ == "behind":
            L = lines([b["text"]], t0, t1)[0]
            out["words"] = L["words"]
            out["y"], out["size"] = b.get("y", 0.4), b.get("size", 0.3)
            fb = face_in(t0, t1)
            if fb and len(L["words"]) == 2:
                an = ang_at(t0)
                m = lambda v: an["ox"] + (v - an["ox"]) * an["scale"]
                out["faceX"] = round((m(fb[0]) + m(fb[2])) / 2, 3)
                out["gap"] = round((m(fb[2]) - m(fb[0])) * b.get("gapK", 0.78), 3)
            if "kicker" in b:
                out["kicker"] = lines([b["kicker"]], t0, t1)[0]["words"]
            if "sub" in b:
                out["sub"] = lines(b["sub"], t0, t1, start_at=L["at"] + 0.3)
            fgname = f"behind_{int(t0 * 100)}"
            fgp = d / "fg" / f"{fgname}.mov"
            if not fgp.exists() or a.rebuild:
                person_fg(a.slug, f"jobs/{a.slug}/aroll.mp4", t0, t1 - t0, fgname)
            out["fg"] = f"jobs/{a.slug}/fg/{fgname}.mov"
        elif typ == "broll":
            src = ROOT / b["file"]
            name = b.get("name") or f"b{k:03d}_{Path(b['file']).stem[:28]}"
            sp = b.get("speed", 1.0)
            prox = d / "broll" / f"{name}.mp4"
            if not prox.exists() or a.rebuild:
                make_broll(a.slug, src, name, b.get("in", 1.0), (t1 - t0 + 0.4) * sp, sp, b.get("crop"))
            out["src"] = f"jobs/{a.slug}/broll/{name}.mp4"
            out.setdefault("zoom", "in")
        elif typ == "mg":
            out["theme"] = b.get("theme", "teal")
            def tm(v, default):
                if isinstance(v, str) and "@" in v:  # "word@12.3" = first 'word' spoken after 12.3 s
                    w_, s0 = v.rsplit("@", 1)
                    r = clk.say(w_, float(s0), t1 + 0.3)
                    if r is None:
                        print(f"WARN mg say '{v}' not found"); return round(default, 3)
                    return round(r, 3)
                return when(v, t0, t1, default)
            def res(o, default):
                if isinstance(o, list):
                    return [res(x, default) for x in o]
                if not isinstance(o, dict):
                    return o
                r = {}
                for kk, vv in o.items():
                    if kk in ("at", "out", "spinAt"):
                        r[kk] = tm(vv, default)
                    elif kk == "ats":
                        r[kk] = [tm(x, default + i * 0.5) for i, x in enumerate(vv)]
                    else:
                        r[kk] = res(vv, default)
                return r
            els = []
            for el in b["els"]:
                el = dict(el)
                if el["kind"] == "text":
                    frm = tm(el.get("at", t0), t0)
                    spec = {"text": el.pop("text")}
                    if "say" in el:
                        spec["say"] = el.pop("say")
                    if el.pop("fixed", False):  # don't word-match: stagger from `at`
                        spec["at"] = frm
                    L = lines([spec], frm, t1, start_at=frm)[0]
                    el["words"] = L["words"]; el["at"] = L["at"]
                    if "out" in el:
                        el["out"] = tm(el["out"], t1)
                    el.setdefault("x", 0.5); el.setdefault("y", 0.5)
                    els.append(el); continue
                el = res(el, t0 + 0.2)
                el.setdefault("at", t0 + 0.2); el.setdefault("x", 0.5); el.setdefault("y", 0.5)
                els.append(el)
            out["els"] = els
            out["cam"] = [dict(c, at=tm(c.get("at", t0), t0)) for c in b.get("cam", [])]
        elif typ == "gfx3d":
            out["cues"] = [when(c, t0, t1, t0 + (i + 1) * (t1 - t0) / (len(b.get("cues", [])) + 1)) for i, c in enumerate(b.get("cues", []))]
            gt = []
            for g in b.get("texts", []):
                L = lines([g["text"] if "say" not in g else {"text": g["text"], "say": g["say"]}], t0, t1)[0]
                gt.append({"words": L["words"], "at": L["at"], "style": g.get("style", "title"), "x": g["x"], "y": g["y"], "align": g.get("align", "center")})
            out["texts"] = gt
        beats.append(out)

    # ---- look-away coverage check (eye-contact rule) ----
    la = d / "lookaway.json"
    if la.exists():
        fulls = []
        for s0, s1 in sorted((b["start"], b["end"]) for b in beats if b["layer"] == "full"):
            if fulls and s0 <= fulls[-1][1] + 0.04:  # back-to-back full beats cover as one
                fulls[-1][1] = max(fulls[-1][1], s1)
            else:
                fulls.append([s0, s1])
        for r0, r1 in json.loads(la.read_text()):
            covered = any(s <= r0 + 0.05 and en >= r1 - 0.05 for s, en in fulls)
            if not covered:
                print(f"WARN look-away {r0:.2f}-{r1:.2f}s not fully covered by a full-screen beat")

    # ---- SFX: auto per graphic entrance + explicit ----
    sfx = []
    if e.get("autoSfx", True):
        for b in beats:
            ty = b["type"]
            if ty == "chapter":
                sfx += [{"src": "sfx/whoosh_long.wav", "at": b["start"] - 0.25, "volume": 0.3}, {"src": "sfx/swell_hit.wav", "at": b["titleAt"], "volume": 0.28}]
            elif b["layer"] == "full" and ty not in ("gfx3d",):
                sfx.append({"src": "sfx/whoosh.wav", "at": b["start"] - 0.08, "volume": 0.22 if ty == "broll" else 0.28})
            elif ty == "gfx3d":
                sfx.append({"src": "sfx/whoosh_long.wav", "at": b["start"] - 0.2, "volume": 0.24})
            if ty == "stack":
                for L in b["lines"]:
                    ic = L.get("icon")
                    sfx.append({"src": "sfx/ding.wav" if ic == "check" else "sfx/pop.wav", "at": L["at"], "volume": 0.2 if ic == "check" else 0.16})
                    if "strikeAt" in L:
                        sfx.append({"src": "sfx/glitch.wav", "at": L["strikeAt"], "volume": 0.14})
            elif ty == "pills":
                sfx += [{"src": "sfx/pop.wav", "at": it["at"], "volume": 0.18} for it in b["items"]]
            elif ty == "versus":
                sfx += [{"src": "sfx/impact.wav", "at": b["badAt"] + 0.55, "volume": 0.26}, {"src": "sfx/ding.wav", "at": b["goodAt"] + 0.1, "volume": 0.26}]
            elif ty == "counter":
                sfx += [{"src": "sfx/riser.wav", "at": it["at"], "volume": 0.12} for it in b["items"]]
            elif ty == "tracker" and b.get("tickAt"):
                sfx.append({"src": "sfx/ding.wav", "at": b["tickAt"], "volume": 0.32})
            elif ty == "tracker" and b.get("introAts"):
                sfx += [{"src": "sfx/pop.wav", "at": x, "volume": 0.18} for x in b["introAts"]]
            elif ty == "calendar":
                sfx += [{"src": "sfx/impact.wav", "at": b["litAt"], "volume": 0.26}]
            elif ty == "headTitle":
                sfx += [{"src": "sfx/impact.wav", "at": b["left"]["at"], "volume": 0.35}]
            elif ty == "phone":
                sfx += [{"src": "sfx/pop.wav", "at": s["at"], "volume": 0.18} for s in b["screens"]]
            elif ty == "flash":
                sfx.append({"src": "sfx/impact.wav", "at": b["start"], "volume": 0.4})
            elif ty == "battery":
                sfx += [{"src": "sfx/glitch.wav", "at": st["at"], "volume": 0.14} for st in b["steps"]]
            elif ty == "dopamine":
                n = b.get("count", 16); span = b["end"] - b["start"] - 0.6
                sfx += [{"src": "sfx/pop.wav", "at": round(b["start"] + 0.2 + span * (1 - (1 - i / n) ** 1.7), 3), "volume": 0.12} for i in range(n)]
            elif ty == "phonePair":
                sfx += [{"src": "sfx/glitch.wav", "at": b["redAt"], "volume": 0.16}, {"src": "sfx/swell_hit.wav", "at": b["goldAt"], "volume": 0.26}]
            elif ty == "mg":
                for el in b["els"]:
                    k_ = el["kind"]
                    if k_ in ("node", "tiles", "pill", "counter", "meter", "chart", "bar"):
                        sfx.append({"src": "sfx/pop.wav", "at": el["at"], "volume": 0.13})
                    elif k_ == "bubble":
                        sfx.append({"src": "sfx/click.wav", "at": el["at"], "volume": 0.16})
                    elif k_ == "link":
                        sfx.append({"src": "sfx/whoosh.wav", "at": el["at"], "volume": 0.07})
                    elif k_ == "cycle":
                        sfx += [{"src": "sfx/pop.wav", "at": x, "volume": 0.13} for x in el["ats"]]
                        if el.get("spinAt"):
                            sfx.append({"src": "sfx/riser.wav", "at": el["spinAt"], "volume": 0.12})
                    for st in el.get("states", []) or []:
                        if st.get("tone") == "red":
                            sfx.append({"src": "sfx/glitch.wav", "at": st["at"], "volume": 0.12})
                        elif st.get("tone") == "green":
                            sfx.append({"src": "sfx/ding.wav", "at": st["at"], "volume": 0.18})
            elif ty == "behind":
                sfx.append({"src": "sfx/impact.wav", "at": b["words"][0]["at"], "volume": 0.4})
    sfx += e.get("sfx", [])
    sfx.sort(key=lambda s: s["at"])
    spaced = []
    for s in sfx:
        if s["at"] < 0 or (spaced and s["at"] - spaced[-1]["at"] < 0.15):
            continue
        spaced.append({**s, "at": round(s["at"], 3)})

    music = e.get("music")
    if music and music.get("gen"):
        mw = d / "music.wav"
        if not mw.exists() or a.rebuild:
            run([sys.executable, ENGINE / "scripts" / "gen_music_long.py", f"{talk + 2:.2f}", mw, "--hook", str(music.get("hook", 30))])
        music = {"src": f"jobs/{a.slug}/music.wav", "volume": music.get("volume", 0.1), "tailVolume": music.get("tailVolume", 0.3)}
    punches = []
    for pu in e.get("punches", []):
        st = pu["start"] if isinstance(pu.get("start"), (int, float)) else clk.say(pu["say"], pu["from"], pu["from"] + 6) or pu["from"]
        punches.append({"start": round(st, 3), "end": round(pu.get("end", st + pu.get("dur", 1.5)), 3), "scale": pu.get("scale", 1.18)})
    plan = {"title": e["title"], "durationSec": round(talk + 1.0, 3), "talkEnd": talk, "fps": FPS, "aroll": f"jobs/{a.slug}/aroll.mp4",
            "look": e.get("look", "A"), "angles": angles, "beats": beats, "labels": e.get("labels", []), "sfx": spaced,
            "grade": e.get("grade", {}), "punches": punches}
    if music:
        plan["music"] = music
    (d / "long_plan.json").write_text(json.dumps(plan, indent=1))
    nfull = sum(1 for b in beats if b["layer"] == "full")
    print(f"long_plan.json: {talk:.1f}s · {len(angles)} angles · {len(beats)} beats ({nfull} full) · {len(spaced)} sfx · labels {len(plan['labels'])}")


VIDEO_EXT = {".mov", ".mp4", ".m4v", ".mkv", ".avi"}
LIBRARY = ROOT / ".claude" / "skills" / "video-editor" / "references" / "broll-library.md"


def cmd_broll_check(a):
    """Compare files in B-Rolls/ with rows in broll-library.md."""
    lib = LIBRARY.read_text()
    listed = set(re.findall(r"^\| ([a-z0-9][a-z0-9_-]+) \|", lib, re.M)) - {"file"}
    on_disk = {}
    for f in sorted((ROOT / "B-Rolls").rglob("*")):
        if f.is_file() and f.suffix.lower() in VIDEO_EXT:
            on_disk[f.stem] = f.relative_to(ROOT)
    new = [p for s, p in on_disk.items() if s not in listed]
    missing = sorted(listed - set(on_disk))
    print(f"{len(on_disk)} clips on disk, {len(listed)} in library.")
    for p in new:
        info = probe(ROOT / p)
        orient = "V" if info["h"] > info["w"] else "H"
        print(f"NEW      {p}  ({info['dur']:.1f}s, {orient})")
    for f in sorted(ROOT.iterdir()):  # loose videos dropped in the root = b-roll inbox
        if f.is_file() and f.suffix.lower() in VIDEO_EXT:
            print(f"INBOX    {f.name}  (loose in root: view, rename, move into a B-Rolls/ folder)")
    for s in missing:
        print(f"MISSING  {s}  (row in library, no file)")
    if not new and not missing:
        print("Library is in sync.")


def cmd_broll_sheet(a):
    """8-frame contact sheet of a clip, for cataloguing."""
    info = probe(a.src)
    (ENGINE / ".cache").mkdir(exist_ok=True)
    out = Path(a.out or ENGINE / ".cache" / f"sheet_{Path(a.src).stem}.jpg")
    step = max(info["dur"] / 8, 0.1)
    run(["ffmpeg", "-v", "error", "-y", "-i", ff(a.src), "-vf", f"fps=1/{step:.3f},scale=320:-1,tile=4x2",
         "-frames:v", "1", out])
    print(out)


def cmd_gaze(a):
    """Contact sheets of the CUT a-roll for eye-contact review.
    Sheet k covers [k*per/fps_s, (k+1)*per/fps_s); tile i (row-major) = sheet_start + i/fps_s seconds."""
    d = job(a.slug)
    g = d / "gaze"
    g.mkdir(exist_ok=True)
    for old in g.glob("*.jpg"):
        old.unlink()
    per = a.cols * a.rows
    run(["ffmpeg", "-v", "error", "-y", "-i", d / "aroll.mp4", "-vf",
         f"fps={a.fps},scale=360:-2,tile={a.cols}x{a.rows}", "-start_number", "0", g / "sheet_%03d.jpg"])
    span = per / a.fps
    for f in sorted(g.glob("sheet_*.jpg")):
        k = int(f.stem.split("_")[1])
        print(f"{f}  {k * span:.1f}s - {(k + 1) * span:.1f}s  (tile i = {k * span:.1f} + i*{1 / a.fps:.2f}s)")


DRY = False


def remotion(args):
    if DRY:  # print the command; run it with cwd = _engine/ (outside the Bash sandbox)
        import shlex
        print("npx remotion " + " ".join(shlex.quote(str(x)) for x in args))
        return
    run(["npx", "remotion", *args], cwd=ENGINE)


def comp_of(d):
    # long_plan.json -> Long (new long style); cine_plan.json -> Cine (shorts); else legacy Edit
    if (d / "long_plan.json").exists():
        return ("Long", d / "long_plan.json")
    return ("Cine", d / "cine_plan.json") if (d / "cine_plan.json").exists() else ("Edit", d / "plan.json")


def props_file(d):
    # compositions take {plan: ...}; a bare plan.json would be ignored (falls back to the empty default)
    p = d / "props.json"
    p.write_text(json.dumps({"plan": json.loads(comp_of(d)[1].read_text())}))
    return p


def cmd_still(a):
    d = job(a.slug)
    props = props_file(d)
    for t in a.at:
        frame = int(float(t) * FPS)
        remotion(["still", "src/index.ts", comp_of(d)[0], str(d / f"still_{frame}.png"), f"--props={props}",
                  f"--frame={frame}", "--scale=0.5"])


def cmd_render(a):
    d = job(a.slug)
    comp, pf = comp_of(d)
    plan = json.loads(pf.read_text())
    sub = "Shorts" if comp == "Cine" or plan.get("format") == "short" else "Long"
    safe = re.sub(r'[\\/:*?"<>|]', "-", plan["title"]).strip()
    if a.preview:
        out = d / "preview.mp4"
        extra = ["--scale=0.5", "--crf=28"]
    else:
        ec = d / "edits_cine.json"
        extra_dir = json.loads(ec.read_text()).get("outSub", "") if ec.exists() else ""  # "Voice Edits" for voice-edit jobs
        out = ROOT / "Edited Videos" / sub / extra_dir / f"{safe}.mp4"
        (out.parent).mkdir(parents=True, exist_ok=True)
        extra = ["--crf=14", "--x264-preset=slow", "--color-space=bt709"]  # IG-ready 1080p (IG caps Reels at 1080)
    remotion(["render", "src/index.ts", comp, str(out), f"--props={props_file(d)}", "--codec=h264",
              "--audio-codec=aac", "--audio-bitrate=320k", "--concurrency=50%", *extra])
    if not DRY:
        print(f"\nrendered -> {out}")


def cmd_master(a):
    """Two-pass loudnorm of a finished render to -14 LUFS / -1.5 dBTP (inspo master level), video stream copied."""
    src = Path(a.file)
    first = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", ff(src), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
                            "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(first[first.rindex("{"):first.rindex("}") + 1])
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    tmp = src.with_name(src.stem + ".mastering.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-i", ff(src), "-c:v", "copy", "-af", af, "-c:a", "aac", "-b:a", "320k", "-ar", "48000", tmp])
    tmp.replace(src)
    print(f"mastered {src.name}: was {m['input_i']} LUFS -> -14")


def main():
    p = argparse.ArgumentParser()
    sp = p.add_subparsers(dest="cmd", required=True)
    x = sp.add_parser("prep"); x.add_argument("src"); x.add_argument("--slug", required=True)
    x.add_argument("--format", choices=["long", "short"], required=True); x.add_argument("--model", default="small.en")
    x.add_argument("--rotate", choices=["none", "cw", "ccw", "180"], default="none")
    x = sp.add_parser("cut"); x.add_argument("--slug", required=True); x.add_argument("--drop", default="")
    x.add_argument("--gap", type=float, default=0.3); x.add_argument("--pad", type=float, default=0.08)
    x = sp.add_parser("broll"); x.add_argument("src"); x.add_argument("--slug", required=True)
    x.add_argument("--name", required=True); x.add_argument("--start", default="0"); x.add_argument("--dur", default="3")
    x.add_argument("--speed", type=float, default=1.0)
    x = sp.add_parser("plan"); x.add_argument("--slug", required=True)
    x = sp.add_parser("master"); x.add_argument("file")
    x = sp.add_parser("cine"); x.add_argument("--slug", required=True); x.add_argument("--rebuild", action="store_true")
    x = sp.add_parser("long"); x.add_argument("--slug", required=True); x.add_argument("--rebuild", action="store_true")
    sp.add_parser("broll-check")
    x = sp.add_parser("gaze"); x.add_argument("--slug", required=True); x.add_argument("--fps", type=float, default=2)
    x.add_argument("--cols", type=int, default=5); x.add_argument("--rows", type=int, default=4)
    x = sp.add_parser("broll-sheet"); x.add_argument("src"); x.add_argument("--out")
    x = sp.add_parser("still"); x.add_argument("--slug", required=True); x.add_argument("--at", action="append", required=True)
    x.add_argument("--dry", action="store_true")
    x = sp.add_parser("render"); x.add_argument("--slug", required=True); x.add_argument("--preview", action="store_true")
    x.add_argument("--dry", action="store_true")
    a = p.parse_args()
    global DRY
    DRY = getattr(a, "dry", False)
    {"prep": cmd_prep, "cut": cmd_cut, "broll": cmd_broll, "plan": cmd_plan, "cine": cmd_cine, "long": cmd_long, "master": cmd_master, "broll-check": cmd_broll_check, "gaze": cmd_gaze,
     "broll-sheet": cmd_broll_sheet, "still": cmd_still, "render": cmd_render}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())
