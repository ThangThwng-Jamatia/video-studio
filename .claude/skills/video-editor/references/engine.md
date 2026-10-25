# Engine Reference (`_engine/`)

Stack: Remotion 4.0.534 (React 19) · ffmpeg (Homebrew, **no drawtext**, has `h264_videotoolbox`) · openai-whisper CLI (`small.en`) · Python 3 stdlib.
Fonts come from `@remotion/google-fonts`: Inter (500/600/800/900) and Instrument Serif italic. The first render needs internet to fetch them.

```
_engine/
  src/Edit.tsx        main composition: A-roll + zooms, B-roll, vignette, accents, headlines, captions, SFX, music
  src/Captions.tsx    word chunking + gold/serif presets + word pop-in animation
  src/Overlays.tsx    HeadlineView, AccentView (brackets, redbar, flash)
  src/types.ts        Plan schema (source of truth)
  scripts/pipeline.py prep | cut | broll | plan | still | render
  scripts/make_sfx.sh regenerates the starter SFX pack into ../SFX
  public/jobs/<slug>/ per-video working files
  public/sfx -> ../../SFX, public/music -> ../../Music   (symlinks)
  edit-log.md         one line per finished edit
```

## Job folder contents
| File | Made by | What |
|---|---|---|
| meta.json | prep | source path, format, W×H, duration |
| proxy.mp4 | prep | 1080p 30fps H.264 of the raw clip (shorts from landscape are centre-cropped to 9:16) |
| audio.wav / audio.json | prep | whisper input/output |
| words_raw.json | prep | `[{text,start,end,p}]` on the RAW timeline (`p` = confidence; low p = likely mishearing) |
| transcript.txt | prep | segments with raw times. Use it to find retakes for `--drop` |
| aroll.mp4 | cut | jump-cut, loudness-normalized A-roll |
| words.json | cut | words remapped to the CUT timeline (indices used in edits.json) |
| segments.json | cut | kept raw ranges |
| transcript_cut.txt | cut | sentences with cut-timeline times. Use it for planning |
| broll/<name>.mp4 | broll | trimmed, fitted, silent B-roll proxies |
| edits.json | **Claude writes** | creative decisions (below) |
| plan.json | plan | full render input. Don't hand-edit; regenerate from edits.json |

## edits.json schema
Times are seconds on the **cut** timeline. `src` paths are relative to `_engine/public`.
```jsonc
{
  "title": "I Built a Lean & Aesthetic Physique as a 15 YO",   // output file name
  "preset": "gold",                       // "gold" | "serif"
  "big": [4, 10, 33],                     // word indices from words.json shown BIG
  "italic": [52],                         // serif preset: italic serif words
  "fix": {"120": "PhysiqeAI"},            // word index -> corrected text
  "broll": [
    {"src": "jobs/<slug>/broll/before.mp4", "start": 0.0, "end": 1.56,
     "trimFrom": 0, "zoom": "in", "pop": false}       // zoom: in|out|none, pop default true
  ],
  "headlines": [
    {"text": "2 YEARS\nOF HOME WORKOUTS", "start": 0, "end": 1.5,
     "style": "gold", "position": "top", "size": 110}   // style gold|white|serif; position top|center|bottom
  ],
  "zooms": [{"start": 4.02, "end": 6.18, "scale": 1.12, "snap": true}],  // snap = hard jump-zoom
  "accents": [{"type": "brackets", "start": 0, "end": 3.9}],             // brackets|redbar|flash
  "placements": [                         // one per shot; captions break on each start
    {"start": 0, "end": 2.2, "align": "left", "x": 0.06, "y": 0.74},
    {"start": 17.3, "end": 18.9, "align": "right", "x": 0.95, "y": 0.22, "rotate": 6},   // optional "scale": 0.8 for tight shots
    {"start": 28.6, "end": 30.75, "align": "center", "y": 0.25}
  ],
  "sfx": [{"src": "sfx/riser.wav", "at": 9.0, "volume": 0.25}],          // extra SFX
  "autoSfx": true,                        // auto whoosh per b-roll, pop per big word, impact on hook
  "captionScale": 1.0,                    // multiplies all caption sizes
  "captionPosition": 0.8,                 // optional override (0 = top, 1 = bottom)
  "grade": {"contrast": 1.08, "saturate": 1.1, "brightness": 1.0, "vignette": 0.35},
  "music": {"src": "music/track.mp3", "volume": 0.18, "duckTo": 0.06}
}
```
B-roll `start/end` should start on or just before the word it illustrates (≈ 0.1 s early feels snappy).

## Commands (run from `~/Documents/Videos`)
```
python3 _engine/scripts/pipeline.py prep "<raw>" --slug S --format long|short [--model small.en]
python3 _engine/scripts/pipeline.py cut --slug S [--drop "a-b,c-d"] [--gap 0.3] [--pad 0.08]
python3 _engine/scripts/pipeline.py broll "<file>" --slug S --name N --start SEC --dur SEC [--speed 0.25]  # speed<1 = slow-mo, dur = source secs
python3 _engine/scripts/pipeline.py broll-check                       # library vs disk + loose videos in root
python3 _engine/scripts/pipeline.py broll-sheet "<file>"              # 8-frame contact sheet → _engine/.cache/
python3 _engine/scripts/pipeline.py plan --slug S                     # longs: edits.json -> plan.json (Edit)
python3 _engine/scripts/pipeline.py cine --slug S [--rebuild]         # shorts: edits_cine.json -> cine_plan.json (Cine); makes insert proxies, behind-person mattes, music
python3 _engine/scripts/pipeline.py master "<rendered.mp4>"          # two-pass loudnorm to -14 LUFS (run after every final render)
python3 _engine/scripts/pipeline.py still --slug S --at 1.0 --at 5.5 --dry  # prints npx cmds → jobs/S/still_<frame>.png (half-res)
python3 _engine/scripts/pipeline.py render --slug S [--preview] --dry       # prints the npx render cmd
# then: cd _engine && run each printed `npx remotion …` line as its own Bash call (unsandboxed)
# (without --dry the script runs npx itself, which only works if python itself runs unsandboxed)
cd _engine && npx remotion studio src/index.ts   # live preview UI (paste plan.json as props)
```

Shot grid for placement decisions (after a first render, or from proxies before one):
`ffmpeg -ss <mid of shot> -i <video> -frames:v 1 -vf scale=480:-2 shot_NN.jpg` per shot, then `tile=4x5`.

## Shorts: `Cine` composition (src/Cine.tsx), built 2026-10-14
**Fonts: exactly 3 families (user rule)**: Inter Tight, Playfair Display, Pinyon Script. Don't add font imports to Cine.tsx.
A job renders with **Cine** when it has `cine_plan.json` (made by `pipeline.py cine` from `edits_cine.json`); otherwise it uses Edit (longs).
Tested end-to-end on `jobs/cine-test` (MTVideo 2 A-roll) → `Edited Videos/Shorts/Who You Surround Yourself With (Cine test).mp4`.

| Feature | Status |
|---|---|
| Letterbox open reveal | DONE but **OFF by default** (user: no black opener). Only used if `letterbox` > 0 is set |
| Word-append captions (Inter Tight 700, -0.055em, 0.11 H, one line, auto-chunked ≤ 5 words / ≤ 20 chars, orphan-merge ≤ 26, break per shot/punctuation/0.35 s gap) | DONE |
| Italic-serif chunks (Fraunces Italic, `serif: [first word idx]`) | DONE |
| Hero words (Inter Tight 800 Italic CAPS 0.21 H, fills white/chrome/silver/red/teal; captions clear 0.08 s before) | DONE |
| Lockups (stacked faces: script/didone/grotesk/heavy/serif, appended per spoken word) | DONE |
| Behind-person words (`covers` hides their words from captions; `condensed`/`warm`/`red`; auto-fit ≤ 0.94 W; Apple Vision matte → ProRes 4444 alpha in `fg/`) | DONE: clean hair edges, no halo |
| Inserts from B-Rolls (hard cuts, proxied into `broll/` at 24 Mbps) | DONE |
| Lockup fills: white, chrome, silver, red, teal, orange, yellow, pink (2026-10-18) | DONE |
| End card (black, Inter Tight 700 caps or 800 italic; `fade` or `blur` word reveal; fade-out) | DONE |
| Music bed: `music: {gen: true}` synthesises `music.wav` (scripts/gen_music_cine.py: minor piano/pad, soft kick, 808 drop at the end card); bed 0.13 under talk → 0.75 on the end card | DONE (placeholder until Music/ has tracks) |
| Auto SFX: `swell_hit` 0.30 s before each insert/hero, `boom` on the end-card cut | DONE |
| Two-pass master to -14 LUFS (`pipeline.py master <file>`) | DONE |
| **Face-aware placement** (default `anchor: "auto"`): `scripts/facebox` (Apple Vision) tracks the face at 5 fps → `faces.json`; each A-roll chunk/hero gets the best of below-chin / left / right (robust 15–85th percentile box, zoom-aware), with `scale` < 1 only if needed; prints `WARN small text` below 0.8× | DONE |
| Safe-zone clamp x 0.10–0.88, y 0.10–0.86 on every anchor (Cine.tsx `SAFE`) | DONE |
| Hook hero (`hook: true`): 0.22 H, eye level, auto-fit width | DONE |
| Hero auto-fit to the safe-zone width | DONE |
| Creator tag (`tag`) | DONE (untested) |
| Side Notes (B1), Script Cloud (B2), Creator Pop (C) | TODO: build when a video needs that family |
| Light-leak flash on the end card | TODO |

### edits_cine.json (Claude writes; times = cut timeline, `w` = word index in words.json)
```jsonc
{
  "title": "…",                                   // output file name
  "anchor": "auto",                               // default: face-tracked, never on the face. A fixed {x,y,align} disables it
  "insertAnchor": {"x": 0.5, "y": 0.5, "align": "center"},  // optional anchor for plain captions on inserts
    "inserts": [{"name": "clouds", "src": "B-Rolls/<cat>/<file>", "in": 2.0, "start": 2.36, "end": 4.45, "speed": 1}],
  "lockups": [{"anchor": {"x": 0.06, "y": 0.42, "align": "left"}, "covers": [7,8,9,10],   // covers = word idx hidden from captions
               "words": [{"w": 7, "text": "who have", "face": "grotesk"}, {"w": 9, "text": "dreams", "face": "script", "fill": "teal"},
                         {"w": 10, "text": "DESIRES", "face": "didone"}, {"w": 11, "text": "& ambition", "face": "heavy", "fill": "chrome", "size": 0.12}]}],
  "heroes": [{"w": 4, "text": "PROCRASTINATING?", "hook": true, "hold": 0.8},   // hook: eye level, big
             {"w": 18, "text": "FORWARD", "hold": 0.6, "fill": "white", "covers": [18]}],  // others: auto off-face
  "behind": [{"w": 30, "end": 10.3, "text": "LAZY", "style": "condensed|warm|red", "on": "aroll|insert", "y": 0.5, "script": "hai."}],
  "serif": [20, 53],                              // word idx that START an italic-serif chunk
  "breaks": [],                                   // force a new chunk at these word idx
  "zooms": [{"start": 8.7, "end": 11.3, "scale": 1.12}],
  "endCard": {"text": "Choose your circle.", "dur": 3.0, "font": "caps|italic", "reveal": "fade|blur"},
  // "music": only when the USER asks: {"gen": true} or {"src": "music/<file>", "volume": .16, "duckTo": .13, "endVolume": .75}
  "fix": {"12": "PhysiqeAI"}, "sfx": [], "autoSfx": true, "tag": "Your Name",
  "grade": {"contrast": 1.1, "saturate": 1.08, "brightness": 1.04, "vignette": 0.3}
}
```
Lockup anchors: upper-left (x 0.06) on inserts unless the subject is there; then right-align at x 0.94.

## Shorts "Professional" mode: `ProShort` composition (pro-style.md), status 2026-10-23
Not built yet. Build it on the first "Professional" request, before rendering, then flip each row to built (date).
Plan: `edits_pro.json` → `pipeline.py pro --slug S` → `pro_plan.json` → composition `ProShort` (`src/pro/ProShort.tsx`). Reuse: Cine's A-roll/cut/face-tracked placement and word timing (`pipeline.py cine`), and the long `MG.tsx` kit (glass, nodes, bubble, pill, counter, chart, light `sky` canvas) for UI objects and cutaways.
| # | Feature | Status |
|---|---|---|
| P0 | `ProShort` composition shell (A-roll + punch-ins + B-roll cutaways + invert-flash entry + SFX) | TODO |
| P1 | 2-tier captions: Unbounded small build line + Unbounded 800 gradient hero (blue/yellow/red/white) + title lockup | TODO |
| P2 | Tier-3 word clusters beside the face (Plus Jakarta 800, line-height 0.78, blue last words, left/right alternation from face box) | TODO |
| P3 | UI objects: cover card (fan → one), stat card with drawn chart, number tile, waveform card, reel card + view counter, comment pill + bookmark, app pills, iOS notification stack, chat bubble typing, timer pill | TODO (bubble/pill/counter/chart exist in `src/long/MG.tsx`) |
| P4 | Light pastel / white canvas cutaways (reuse MG `sky` theme + new mint/pink variants) | TODO |
| P5 | Fonts: Unbounded + Plus Jakarta Sans via `@remotion/google-fonts` inside `src/pro/` only | TODO |

## Caption sizing + coverage (2026-10-22)
edits_cine.json keys: `capSize` (default 0.065 H), `textScale` (lockups/heroes, default 0.75), `heroSize` (0.14), `hookSize` (0.12), `hookAnchor` (default below chin, y 0.80), `lockupHold` (0.45 s after the last covered word; per-lockup `hold`), `lockupTrim` (true). Words spoken under a hero/lockup are deferred, not dropped. `WARN uncaptioned words: i:text …` = a spoken word never shows for ≥ 3 frames; fix all of them before rendering.

## Gotchas
- **`props.json` is only rewritten by `pipeline.py still|render … --dry`.** After any `cine`/`plan` rebuild, re-run the `--dry` command before calling `npx remotion …`, or Remotion renders the OLD plan.
- **Colons in folder names** (`Raw Clips V:O`, `Travels:Luxury`): ffmpeg reads `Travels:` as a protocol. Use `file:/absolute/path`. pipeline.py does this already.
- **Remotion rendering needs Chrome headless shell outside Claude's Bash sandbox.** Inside the sandbox it crashes with `icudtl.dat not found` / `Target closed`. Fix: allow `npx remotion` to run unsandboxed (see project CLAUDE.md). The prep/cut/broll/plan steps work inside the sandbox.
- whisper sometimes gets killed when 3 files are transcribed back-to-back in one process chain. Transcribe one file per command.
- Whisper mishears names: "PhysiqeAI", "Minor Builds", "Cal AI", "calisthenics", "pomade" ("palm aid"). Fix them with `"fix"`.
- `cut` never removes a sentence on its own. Retakes must be passed via `--drop` (RAW timeline seconds).
- OffthreadVideo needs files under `public/`, which is why all B-roll is proxied into the job folder (also faster than decoding 4K HEVC).

## Tricks added 2026-10-16
- **Dark card insert** (look-away with no fitting B-roll): `ffmpeg -i aroll.mp4 -an -vf "scale=480:-2,gblur=sigma=40,scale=1920:1080,eq=brightness=-0.08:saturation=0.6,colorchannelmixer=rr=0.45:gg=0.45:bb=0.5" card_src.mp4` in the job dir, then inserts with `src: "_engine/public/jobs/<slug>/card_src.mp4"`, `in` = `start`. Face unreadable; heroes/lockups sit on it.
- **Vertical selfie B-roll**: pre-render a pillarbox (blurred, darkened fill + centred 9:16 frame) into the job dir and use it as the insert src; centre-crop cuts the face. Keep lockups at x ≤ 0.08 with small sizes so they stay left of the frame.
- **Tight framing** (face box bottom ≥ 0.75 H): below-chin captions drop to ~0.5×. Move those lines to side lockups (grotesk 0.075 / script 0.14–0.15 / didone 0.11, anchor x 0.10 left or x 0.88 right), behind-words, or inserts.
- `behind[].covers` hides the behind-word's spoken words from captions (avoids a small duplicate under the big word). A one-word chunk after a `breaks` entry can be orphan-merged back; cover it instead.
- **3D motion graphics (three.js)**: `@remotion/three` + `three` + `@react-three/fiber` are installed; `remotion.config.ts` sets `setChromiumOpenGlRenderer('angle')` (also pass `--gl=angle` to a bare `npx remotion still`). A Cine insert can be `{"gfx": "<kind>", "start", "end", "capAnchor": {x,y,align,scale}}` instead of a video `src`: Cine.tsx draws the scene from `src/gfx/registry.tsx` (`gfxScene` id, default `school` = src/SchoolGfx.tsx; story-specific scenes in absolute cut-timeline seconds; any shot can also be rendered to an mp4 with the `GfxClip` composition). Full how-to: `3d-motion-graphics` skill and captions on it use `capAnchor` (bottom-centre 0.8× works). For a new video, add a new scene file the same way (shared world model + `camAt(kind,t)` camera moves + HTML tags pinned by projecting 3D points). QA: `SchoolGfxTest` composition plays all scenes back to back.

## Longs: `Long` composition (src/long/), built 2026-10-19
New long edits use the `long-video-editor` skill: `edits_long.json` -> `pipeline.py long --slug S` -> `long_plan.json` -> composition `Long` (render/still auto-route to it when long_plan.json exists). Components, schema and status: `long-video-editor/references/components.md`. Music bed: `scripts/gen_music_long.py`. 3D scenes: `src/gfx/WinterGfx.tsx` (registry id `winter`).
