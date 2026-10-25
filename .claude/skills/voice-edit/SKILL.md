---
name: voice-edit
description: "Voice Edit" style shorts. The user supplies a voice-over (often already mixed with music, sometimes as separate voice + music files) on a black/dummy video or a talking-head clip; Claude covers 100% of the picture with fast B-roll cuts on the word beats, small centred word-by-word captions, big script accent words and sparse SFX. No end card. Use ONLY when the user says "Voice Edit" / "voice edit this" / "edit <file> as a voice edit". "My edit" or a plain "edit the new short/long" is NOT this skill; use video-editor.
---

# Voice Edit

Built from the 5 inspos in `Inspiration Video Edits/Shorts/BG Voice Edits/` (Video-55024, -60891, -77806, -82975, -99684) and the user-approved demo `bgv-demo` → `Edited Videos/Shorts/Take The Biggest Risks (BG Voice demo).mp4` ("that demo looks good", 2026-10-17).
It runs on the same engine as video-editor: `pipeline.py` + the `Cine` composition. Read `../video-editor/references/engine.md` (Cine section + Gotchas) and `../video-editor/references/broll-library.md` before planning. The rendering rules in CLAUDE.md apply (npx remotion runs unsandboxed from `_engine/`).

## Command routing (user rule, 2026-10-17)
| User says | Skill |
|---|---|
| "Voice Edit" (+ file) | **this skill** |
| "my edit" / "edit the new short/long" / "edit <file>" | `video-editor` (talking head, Cine Lockup for shorts, the standard style) |

## The look (measured from the inspos)
- **Picture: 100% B-roll.** The speaker/dummy video is never shown. Format 16:9 1920×1080 (the user converts to 9:16 later), even when the source is vertical.
- **Cut pacing:** a hard cut on word beats, mean shot 0.45–1.0 s (inspos: 0.45, 0.6, 0.7, 1.0 s; one outlier holds about 6 s). The user wants the pace to follow the video: punchy/hype lines → 0.4–0.6 s (a cut on nearly every word); reflective lines → 0.8–1.5 s; the last line can hold 1–1.5 s. The demo (0.8 s average) was approved.
- **Captions:** Inter Tight 700, white, **small** (`insertAnchor` scale 0.6 ≈ 0.066 H), centred at x 0.5, y 0.5. 1–3 words per chunk, word-append, a new chunk on every cut (use `breaks`). Lowercase, punctuation stripped (engine default).
- **Script accent words:** Pinyon Script, big (lockup `size` 0.25–0.30), centred at y ≈ 0.47, on the emotional key word, about 1 per 2.5–3 s (inspo words: Even, Quit, King, Patient, harder, relax, countless, wrong, can). Each is a one-word lockup that `covers` its word and holds until the shot ends. Put it on a shot that gets its own cut.
- **Fonts:** Inter Tight + Pinyon Script only (Playfair italic optional as a third). Never more than 3.
- **Grade:** dark and moody: `{"contrast": 1.12, "saturate": 0.88, "brightness": 0.9, "vignette": 0.45}`. Brighter daytime clips are fine; the grade pulls them together.
- **No end card, no black card, no letterbox** (user, 2026-10-17). The video ends on the last shot.
- **No heroes, behind-words or hook caps.** This style is only small captions + script words.

## Variations (6 more inspos, 2026-10-18: Video-51915, -64895, -6565, -7229, -81662, -97082)
Pick the one that fits the voice. All of them are built from lockups (`covers` hides the spoken words from the small captions):
- **Colour words** (51915, hype/rap): single words as grotesk lockups 0.08–0.09 H in `yellow` / `orange` / `red`, script words in `pink` / `teal`, and a script word stacked over a heavy chrome word (`Money` / `OBSESSED`, heavy 0.2). Cuts at about 0.5–0.7 s.
- **Header line** (64895, quote/lyric): one small grotesk line (0.05 H, e.g. "in case you forgot what Drake said:") held over a single intro shot (`end` on the lockup), covering the spoken intro. Then single words, a script swear/key word, and a red `your` + red script `Thing`.
- **Stacked trio** (6565): small grotesk / big script / small grotesk (`spent` / *Months* / `in the corner`, `I'm` / *Used* / `to this`), plus one huge heavy chrome word (0.3 H) on a literal shot (`bag` → suitcase).
- **Slow small captions** (7229, reflective advice): 1–2.3 s shots, small captions only, 1–2 script words at most.
- **One-line montage** (81662, chanted hook): a single grotesk line (0.06 H) held for the whole chant over ~0.4 s cuts of aesthetic desk/study shots, then normal captions + script words for the talk.
- **Podcast VO** (97082): about 1 s cuts, script on the emotional words (*else.*, *burning*, *Life*, *different*).
Fills available: white, chrome, silver, red, teal, orange, yellow, pink.
Avoid text over faces in B-roll too (selfies, posing): move the lockup (`anchor`) or swap the clip.

## Hook: the first 1–2 s (user, 2026-10-18)
"The first 2 sec is not hooking enough." Text on screen from frame 0 (small grotesk + big script lockup: the first line, or tease the payoff line over a music intro), 2–3 beat-synced cuts of energetic shots (pull-ups, wet back, speedboat, takeoff), and `sfx/impact.wav` at 0.0 (vol about 0.2). Never open on a calm, empty shot.
Beats: lowpass the audio at 160 Hz, take a 10 ms RMS envelope and pick the positive-flux peaks (numpy). Cut music-only montages every 2 beats.
Foreign-language VO: caption in English word by word like the inspo, mapping each word slot with `fix` ("" hides a slot; one word per slot, because spaces get stripped).

## Export quality (user, 2026-10-18: "1080p or 4K, best for Instagram")
Instagram Reels top out at 1080p, so render 1080p at high quality: final render `--crf=14 --x264-preset=slow --color-space=bt709` (set in `pipeline.py render`), B-roll proxies at 24 Mbps, AAC 320k, then `master` to -14 LUFS. 4K buys nothing on IG.

## Workflow (track as a to-do list)
1. **Find the input.** The file the user named, or the newest file in `Raw Clips V:O/Voice Edits/` (or loose in the root). Check `_engine/edit-log.md` for what's already done. Run `pipeline.py broll-check` first and catalogue any new B-roll (video-editor's procedure). Probe it: does it have a visible speaker, a black picture, separate stems?
2. **Prep:** `pipeline.py prep "<file>" --slug <slug> --format short`.
   - English: default `small.en`. **Hinglish, or voice under music:** `--model medium` (multilingual, more robust on a music bed).
   - Then sanity-check `words_raw.json`: zero-length words or words far from their neighbours are whisper misplacements (the demo had "Remember" at 0 s length). Check with per-0.1 s RMS (`asetnsamples=n=1600,astats=metadata=1:reset=1,ametadata=mode=print:key=lavfi.astats.Overall.RMS_level:file=-` on `audio.wav` at 16 kHz) and fix start/end in `words_raw.json`.
   - With music under the voice, whisper is unreliable. Listen to the energy contour and correct timings; for Hinglish, romanise as spoken (fix spellings with `"fix"`).
3. **Timeline: cut or not?**
   - **Voice only (no music), e.g. a talking-head clip:** `pipeline.py cut --slug <slug>` (tight cuts) as normal. Re-run it after fixing `words_raw.json`.
   - **Voice + music in one file: DO NOT run `cut`.** Pause removal would chop the music. Keep the full timeline instead:
     ```
     cd _engine/public/jobs/<slug>
     cp proxy.mp4 aroll.mp4
     python3 -c "import json;w=json.load(open('words_raw.json'));json.dump([{'text':x['text'],'start':x['start'],'end':x['end']} for x in w],open('words.json','w'))"
     python3 -c "import json,subprocess;d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','aroll.mp4']));json.dump([{'start':0,'end':d}],open('segments.json','w'))"
     ```
     **Keep the music tail after the last word** (user, 2026-10-18: "that few sec of music after the motivational words is required"). Cover it with one calm B-roll shot without text. Trim only true silence at the head/tail if there is some (the user's mix is the master; leave it alone otherwise).
   - **Separate voice + music files:** cut/prep on the voice. Copy the music into the job dir and add `"music": {"src": "jobs/<slug>/<music file>", "volume": V, "duckTo": V, "endVolume": V}` with V chosen so the music sits about 10–14 LU under the voice (check with ebur128 on a test render). If the voice is cut, the music isn't. That's fine, it runs continuously underneath.
4. **Plan the cut list.** Walk the words: mark the script words first (they each get their own shot), then cut on word starts at the pacing that fits the line. Every frame from 0 to the end must be inside an insert (contiguous `start`/`end`, no gaps → the A-roll never shows).
   - B-roll: from `B-Rolls/` only, **horizontal 16:9 clips only** (user: "use my best 16:9 B-rolls"; skip `_vertical`), matched to the meaning ("take off" → takeoff, "risks" → cliffs/sea, "remember" → eye close-up, "time" → night city). The same clip may come back with a different in-point if the library runs short (user OK), but never two neighbouring shots from one clip.
   - In-points: use broll-library.md notes; slow-mo clips (120 fps) with `speed` 0.5.
   - Vertical B-roll (`_vertical`): pillarbox it (engine.md trick) or skip it.
5. **Show the plan and STOP** (unless the user said to go straight ahead): a table `time · words · shot (clip @ in) · caption / SCRIPT word`, the average shot length, the SFX list and the final length. Wait for "go".
6. **Build:** write `_engine/public/jobs/<slug>/edits_cine.json` (template below) → `pipeline.py cine --slug <slug>`. `WARN small text` lines are expected (captions are small on purpose). Check the printed chunks: every word appears, nothing is hidden under a script word unintentionally (a word that starts inside a script word's shot is swallowed; end that insert earlier, as the demo did with "of").
7. **Preview + QA:** `pipeline.py render --slug <slug> --preview --dry` → run the npx command → `ffmpeg -i preview.mp4 -vf "fps=3,scale=320:-2,tile=6x5" qa_sheet.png` and look: no frame shows the speaker/black, captions are readable, script words don't sit on busy detail, and the cuts land on the words.
8. **Render + master:** `pipeline.py render --slug <slug> --dry` → npx → `pipeline.py master "<out>"` (-14 LUFS). Output: `Edited Videos/Shorts/Voice Edits/<Title>.mp4` (user, 2026-10-17). Routing comes from `"outSub": "Voice Edits"` in `edits_cine.json`; keep that key in every voice-edit job.
9. **Verify + log:** ffprobe (1920×1080, audio, duration), view 2–3 full-res frames, append to `_engine/edit-log.md` with preset `Voice Edit`, output in `Edited Videos/Shorts/Voice Edits/`, and report.

## SFX (sparse, not on every cut)
`autoSfx: false`, then manual: `whoosh` 0.15–0.18 on 1–2 big transitions, `swell_hit` 0.3 about 0.28 s before each script word, and `riser` 0.2 leading into the final line. With a music bed already in the mix, keep the SFX quieter (0.1–0.2) so they don't fight the music.

## edits_cine.json template (the approved demo)
```json
{
 "title": "<Title>",
 "insertAnchor": {"x": 0.5, "y": 0.5, "align": "center", "scale": 0.6},
 "inserts": [
  {"name": "takeoff", "src": "B-Rolls/Travels:Luxury/plane-window-takeoff-roll-runway.MOV", "in": 3.0, "start": 0.0, "end": 0.58},
  {"name": "eye", "src": "B-Rolls/Filler/eye-closeup-blinking-thinking-slowmo.mov", "in": 3.0, "start": 4.95, "end": 6.4, "speed": 0.5}
 ],
 "lockups": [
  {"anchor": {"x": 0.5, "y": 0.47, "align": "center"}, "covers": [4], "words": [{"w": 4, "text": "Risks", "face": "script", "size": 0.27}]}
 ],
 "outSub": "Voice Edits",
 "heroes": [], "behind": [], "serif": [], "zooms": [],
 "breaks": [1, 2, 3],
 "autoSfx": false,
 "sfx": [{"src": "sfx/swell_hit.wav", "at": 1.78, "volume": 0.3}],
 "grade": {"contrast": 1.12, "saturate": 0.88, "brightness": 0.9, "vignette": 0.45}
}
```
No `endCard` key (= no end card). `breaks` = word indices that start a new caption chunk (one per cut).
Full working example: `_engine/public/jobs/bgv-demo/edits_cine.json`.
