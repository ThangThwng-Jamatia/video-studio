---
name: video-editor
description: Edit raw talking-head SHORT clips (under 60 s or from Raw Clips V:O/Shorts) into finished videos. Two modes - "Professional" (2026-10-23 pro style - 2-tier gradient hero captions, word clusters beside the face, floating glowing UI cards, pastel MG cutaways; see references/pro-style.md) and "normal"/default, the 2026-10 "Cine Lockup" system (letterbox reveal, word-append lowercase captions, italic hero words, mixed-typeface lockups on film inserts, words behind the person, black thesis end card). Use whenever the user says "my edit" or "edit the new short(s)", "edit the raw clip", "edit <filename>" for a short, or drops a short in Raw Clips V:O and asks for an edit. NOT for long videos (use long-video-editor) and NOT for "Voice Edit" requests (use voice-edit).
---

# Video Editor

You edit the user's raw clips into finished videos that match `Inspiration Video Edits/`.
Everything runs locally: ffmpeg + whisper for cutting/transcription, Remotion (`_engine/`) for motion graphics.

## Two shorts modes (user rule 2026-10-23)
| The user says | Mode | Style source |
|---|---|---|
| **"Professional"** (anywhere in the request: "professional edit", "make it professional") | **Pro** | `references/pro-style.md` (from Video-85495, Video-81219, Inspo3): 2-tier captions (small wide-grotesk build line + big gradient hero key word), word clusters beside the face on landscape takes, floating glowing UI objects for each idea (cards, number tiles, notification stacks, chat bubbles, comment pill + bookmark CTA), light pastel MG cutaways, no black end card |
| **"normal"**, "my edit", or no mode word | **Normal** (unchanged) | `references/style-guide.md` §1–7, the Cine Lockup system exactly as before |
Never mix the two in one video. If the request is ambiguous, Normal. All shared rules still hold in both modes: eye-contact coverage, captions never over the face, 2–3 font families max, no music unless asked, safe zone, 16:9 output, every spoken word captioned, `B-Rolls/` only.
Pro engine status lives in `references/engine.md` → "Shorts Professional mode"; build the TODO rows on the first Pro request (say so in the plan).

**Shorts and longs are different styles.** Shorts follow style-guide.md sections 1–7 (families A/B1/B2/C, measured from Inspo4–11). **Longs (2026-10-19 on) use the `long-video-editor` skill**; section 8 / step 4L (gold/serif) is legacy, used only if the user explicitly asks for the old long look. Never mix them.

Read these before planning an edit (they are short):
- `references/pro-style.md`: **Professional mode only** (captions, UI objects, cutaways, pacing, fonts, plan checklist)
- `references/style-guide.md`: the Normal look, per family: timeline template, caption/hero/lockup typography, behind-person words, end card, grade, audio
- `references/broll-library.md`: what every B-roll clip shows and which sentences it fits
- `references/engine.md`: pipeline commands, `edits.json` schema, known gotchas
- `references/feedback-log.md`: the user's corrections from past edits. **These override the style guide.**

## Folder map (root: `~/Documents/Videos`)

| Folder | Role |
|---|---|
| `Raw Clips V:O/Longs/` | raw long videos → edit as **16:9 long** |
| `Raw Clips V:O/Shorts/` | raw short videos → edit as a **16:9 short** (Cine) |
| `B-Rolls/<category>/` | B-roll, grouped by topic, catalogued in broll-library.md |
| `Inspiration Video Edits/{Shorts,Long}/` | reference edits. Re-analyse when new ones appear |
| `SFX/`, `Music/` | sound library (linked into `_engine/public/sfx`, `/music`) |
| `Edited Videos/Long/`, `Edited Videos/Shorts/` | **final renders go here** |
| `Long Videos/` | the user's own manual edits. **Never touch.** |
| `Thumbnails/` | the user's thumbnails. Read-only reference |
| `_engine/` | Remotion project + `scripts/pipeline.py`. Jobs live in `_engine/public/jobs/<slug>/` |

**Any raw clip under 60 s is a SHORT** (Cine, 16:9), whatever its folder or orientation; the user converts shorts to 9:16 later. Otherwise the folder decides long vs short.
**Short format: ALWAYS 16:9 (1920×1080)**, like 7 of the 8 shorts inspos. The user turns them into 9:16 later themselves. A vertical raw short: ask before cropping or pillarboxing.

## Workflow

Track the steps as a to-do list. Never skip step 5 (user approval).

### 1. Pick the clip
- First run `python3 _engine/scripts/pipeline.py broll-check`. If it reports NEW B-roll, catalogue and rename it (procedure at the top of `references/broll-library.md`) before planning.
- If the user named a file, use it. Otherwise list `Raw Clips V:O/Longs` and `Raw Clips V:O/Shorts`, compare with `_engine/edit-log.md`, and take the clips that have not been edited yet. If there are several, ask which.
- Slug = short kebab-case of the title (e.g. `lean-physique-15yo`).

### 2. Prep (proxy + transcript)
```
python3 _engine/scripts/pipeline.py prep "<raw path>" --slug <slug> --format long|short
```
This makes a 1080p 30fps proxy, word-level whisper transcript (`small.en`, ~0.7× realtime), and `transcript.txt`.
Run it in the background for clips over 2 min.

### 3. Jump-cut
Read `transcript.txt`. Find **retakes and false starts** (the same sentence said twice → keep the LAST take), botched words, "let me redo that", and off-topic tangents. Collect their RAW time ranges, then:
```
python3 _engine/scripts/pipeline.py cut --slug <slug> --drop "12.3-15.0,40.1-44.8"
```
Defaults: tight cuts. Removes pauses over 0.3 s and um/uh fillers, pads 80 ms, adds 12 ms audio fades, and loudness-normalizes to -14 LUFS.
Output: `aroll.mp4`, `words.json` (cut timeline), `transcript_cut.txt`.

### 3b. Eye-contact review (MANDATORY)
The user's rule: whenever they are not looking into the camera, their face must not be visible. That part must be covered by B-roll or a full-screen caption/headline card.
```
python3 _engine/scripts/pipeline.py gaze --slug <slug>     # 2 fps contact sheets of aroll.mp4 (5x4 tiles = 10 s per sheet)
```
View every sheet. Tile i (row-major, from 0) = sheet start + i × 0.5 s. List every range where the eyes look off-camera (sideways, up, down at notes, turned head).
Normal blinks don't count. Pad each range by 0.2 s on both sides and merge ranges less than 0.6 s apart.
In step 4, every look-away range MUST be fully covered by a B-roll beat (preferred) or a headline over a dark/blurred card. Put the ranges in the plan table so the user can see them.

### 4. Plan the edit
#### 4P. Shorts, Professional mode (pro-style.md)
Follow pro-style.md §7 (plan checklist): format, title lockup, caption tier per section, hero words + colours (1 per 3–5 s), one UI object per idea (sentence → object → content → position off the face), cutaways for look-aways/abstract lines, CTA ending (comment pill + bookmark), music question + SFX. Then the engine check against engine.md → "Shorts Professional mode". Steps 5–8 are the same as Normal.

#### 4S. Shorts, Normal mode (style-guide sections 1–7)
Using `transcript_cut.txt` + the style guide + film/B-roll libraries:
1. **Family** (A default; B1/B2 for one clean take with nothing to cut to; C for long personal/list/CTA videos). Say why in one line.
2. **Trim to the template:** Family A targets 16–25 s of talk + a 3 s end card. If the raw is longer, cut to the strongest single idea (hook line → argument → payoff line) and list what was dropped. Don't do this silently.
3. **Captions:** word-append chunks (≤ 5 words, ≤ 20 chars, one line), romanised exactly as spoken. Mark the italic-serif chunks (about 1 in 4, soft Hindi tails). Fix whisper spellings to how the user writes Hinglish.
4. **Hero words:** 1 per 3–5 s, English key word, CAPS italic. Each one clears the chunk before it.
5. **Inserts:** 3–4 (A), **from the user's `B-Rolls/` only** (no film clips). For each: the phrase, the clip + in-point, cut-in frame = the hero/lockup word's frame, 0.5–1.5 s, and the **lockup** (each word + its face: script / didone / grotesk / heavy-italic, plus chrome or white).
6. **Behind-person words:** 1–3, on payoff words, with the shot (A-roll or insert) they sit on.
7. **End card:** the thesis line (≤ 6 words, written by you, not a transcript quote), typeface (`caps` = Inter Tight 700 caps, or `italic` = Inter Tight 800 italic caps), reveal (fade or word blur-in).
7b. **Fonts:** list which of the 3 families this video uses (2 minimum, 3 maximum: Inter Tight + Playfair Display + Pinyon Script). Never add another family.
8. **Audio:** NO music unless the user explicitly asked for it in this request. SFX: swell_hit per hero/insert + the end-card boom (auto).
8b. **Placement:** A-roll captions/heroes are auto-placed off the face (below the chin / beside it). Plan heroes that need size onto inserts or as behind-person words; no punch-in where it squeezes the text. B-roll text: free placement, minimal (1–4 words). Everything inside the safe zone (x 0.10–0.88, y 0.10–0.86). Decide whether this video gets a **hook** (big bold caps at eye level, first 0.5–2.5 s; about 2 of 3 videos).
9. **Look-away coverage** (step 3b): cover with inserts first, then a behind-person word or a full hero word.
10. **Engine check:** every element in the plan must exist in engine.md → "Shorts feature status". If one is still TODO, say so in the plan and build it in step 6 before rendering.

#### 4L. Longs: LEGACY. New long edits use the `long-video-editor` skill. Keep this only for "use gold/serif" re-edits of old longs.
Using `transcript_cut.txt` + the style guide + the B-roll library, decide:
- **Hook (0–3 s):** headline text, first B-roll, `impact` SFX, brackets accent
- **Caption preset:** `gold` or `serif` (see style guide for which fits which topic)
- **Big words:** word indices from `words.json` (density per style guide)
- **Italic words** (serif preset only)
- **B-roll beats:** sentence → clip → in-point → start/end on the cut timeline
- **Punch-in zooms**, **headlines** (chapter cards for numbered points in longs), **accents**, extra SFX
- **Transcript fixes** (whisper mishears names/brands, e.g. "Cal AI", "PhysiqeAI", "Minor Builds")
- **Title** for the output file (default: raw file name without extension)
- **Look-away coverage:** check that every range from 3b sits inside a B-roll beat
- **Caption placement per shot:** after the B-roll proxies exist, view one frame per shot and choose left/right/centre, height and tilt from the empty space (rules in style-guide.md → "Caption placement")

#### 4X. 3D motion graphics (optional)
When the user asks for 3D / simulations / explainer animation, or a crucial beat has no fitting B-roll, use the `3d-motion-graphics` skill: storyboard the 3D shots in the plan table, build after "go".

### 5. Show the plan and STOP
Send the user a compact plan.
- **Short:** family + format, hook line, a beat table (time · spoken chunk · caption/hero/lockup · shot: A-roll / insert clip / behind-word), the end-card line, music + hits, and the estimated length.
- **Long:** hook, preset, a table of beats (time · line · B-roll/zoom/headline), the big-word list, and the estimated final length.
Wait for "go" or changes. Apply their changes, and save anything that sounds like a lasting preference to `references/feedback-log.md`.

### 6. Build
**Short:** write `_engine/public/jobs/<slug>/edits_cine.json` (schema in engine.md → "edits_cine.json"), then
`python3 _engine/scripts/pipeline.py cine --slug <slug>`. It makes insert proxies, behind-person mattes and music, and prints a summary.
Check the printed caption chunks (no orphans, natural phrases) and any `WARN small text` lines (fix: drop that punch-in, move the line onto an insert, or make it a behind-word), then run `render --preview --dry` (it rewrites props.json) and render a `--preview` and QA the frames (step 6.4 short list).
Use `--rebuild` after changing insert in-points or behind-word times.
**Long:**
1. Make B-roll proxies for each beat (trim with a little extra length):
   `python3 _engine/scripts/pipeline.py broll "B-Rolls/<cat>/<file>" --slug <slug> --name <beat-name> --start <s> --dur <d>`
2. Write `_engine/public/jobs/<slug>/edits.json` (schema in `references/engine.md`).
3. `python3 _engine/scripts/pipeline.py plan --slug <slug>`
4. QA stills at the hook, 2–3 big-word moments, one B-roll and one headline:
   `python3 _engine/scripts/pipeline.py still --slug <slug> --at 0.5 --at 7.2 ... --dry` prints one `npx remotion still …` command per time.
   `cd _engine`, then run each printed command as its own Bash call (Remotion's Chrome must run outside the sandbox; see engine.md). Then **look at the PNGs** in the job folder. Check that no look-away moment shows the face and that B-roll fills the frame.
   - Long: captions don't cover the face, and gold is readable.
   - Short: QA at 0.0 s (first frame is picture, not black), the hook, every A-roll caption shot (**no text on the face**), each hero, each lockup, each behind-person word (the head must occlude the letters cleanly, with no halo), and the end card. Captions are one line, never over the eyes; lockup faces read as different typefaces; 9:16 text stays inside 0.12–0.80 H (platform UI).
5. Fix the plan and re-check until it is clean.

### 7. Render
```
python3 _engine/scripts/pipeline.py render --slug <slug> --dry            # prints final render cmd → Edited Videos/Long|Shorts/<title>.mp4
python3 _engine/scripts/pipeline.py render --slug <slug> --preview --dry  # half-res quick check (optional)
```
Run the printed `npx remotion render …` from `_engine/`, in the background for long videos.
Then master the file: `python3 _engine/scripts/pipeline.py master "<output.mp4>"` (two-pass -14 LUFS, like the inspo).
**If Remotion crashes with `Target closed` (Bash sandbox), don't retry unsandboxed.** Ask the user to run this in macOS Terminal:
`~/Documents/Videos/_engine/render.sh <slug>` (add `--preview` for a half-res check). Then continue with step 8 once they say it's done.
In that case, skip the Remotion QA stills in step 6.4. Do the frame QA on the rendered file with ffmpeg instead (step 8).

### 8. Verify and log
- Run `ffprobe` on the output for duration, resolution and audio stream. Pull 6–8 frames with ffmpeg and view them.
- Append a line to `_engine/edit-log.md`: date · raw file · slug · output path · length · preset · notes.
- Report to the user: output path, final length vs raw length, what was cut, and anything that needs their eye.

## Rules
- Never modify or delete anything in `Raw Clips V:O/`, `B-Rolls/`, `Long Videos/`, `Inspiration Video Edits/`. One exception: renaming new B-roll per the naming convention (with `mv -n`, recorded in broll-library.md).
- Paths containing `:` break ffmpeg. `pipeline.py` handles it. In raw ffmpeg calls, prefix with `file:` + an absolute path.
- This ffmpeg build has **no drawtext**. All text is drawn by Remotion.
- Footage stored sideways (portrait pixels, landscape content, no rotation tag): look at a frame, then prep with `--rotate cw|ccw|180`. The 16:9 output must come out upright.
- If a job dir already exists, reuse its proxy/transcript instead of re-running whisper.
- When new inspo videos appear (loose in the root or in `Inspiration Video Edits/`): drop byte-identical duplicates (md5), file them as the next `InspoN.mp4` in `Inspiration Video Edits/Shorts|Long`, then analyse them the same way as 2026-10-14: 3 fps contact sheets (`fps=3,scale=320:-2,tile=6x5` = 10 s per sheet), 30 fps strips of each animation, full-res frames for font ID, `select='gt(scene,0.08)'` cuts, `showspectrumpic` + `ebur128` + transient analysis for audio. Whisper is unreliable on Hinglish over a music bed, so read the captions off the frames. Then add or adjust a family in `style-guide.md` with measured numbers, and update the inventory table.
- When new B-roll appears (`broll-check`), rename it and add it to `broll-library.md`. That file must always match `B-Rolls/`.
