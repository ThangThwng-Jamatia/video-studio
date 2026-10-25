---
name: long-video-editor
description: Use when editing a LONG talking-head video (YouTube, over 60 s, from `Raw Clips V:O/Longs` or a named long file): "edit the new long", "edit the new video" (long), "my long edit", "make the long", or any request for long-form motion graphics, hooks, chapter cards, or Iman Gadzhi / SaaS-style explainer graphics in a long edit. Not for shorts (video-editor) or Voice Edits (voice-edit).
---

# Long Video Editor

Turns a raw long talking-head clip into a YouTube edit in the style of the long inspos (Iman Gadzhi, "If You ONLY", ChatGPT vs Claude) **with the 2026-10-23 clean motion-graphics system** (`Inspiration Video Edits/Motion Graphics/`). **Core principle: the hook (0–50 s) gets a visual per sentence; the body is the talking head cut smoothly between framings, with minimal captions (a small line below the chin now and then, key words hopping to the free side of the face or into B-roll space), clean B-roll cuts, and full-screen clean MG sequences (`mg` beat) on the core explaining / story parts.** No running subtitles.

**Motion graphics = the clean `mg` kit, always** (user 2026-10-23: "not like before but the new clean style"). Do not use the old Look A/B/C cards (versus, calendar, battery, dopamine, phonePair, chapter carousels, 3D props) for new edits unless the user asks for them by name.

Read before planning (in this order):
0. `references/mg-style.md`: **the clean MG system** (themes, element vocabulary, recipe, density). Look at `references/frames/mg-*.jpg`.
1. `references/long-style.md`: the measured style: non-negotiables, pacing, hook anatomy + per-inspo timelines, the 3 Looks (palettes), typography, motion vocabulary, transitions, IMAN 3D scenes, audio.
2. `references/frames/`: view the sheets for the Look you pick (and the `strip-*-10fps` ones for motion timing).
3. `references/components.md`: the `Long` engine, feature status (what is TODO), `edits_long.json` schema.
4. `references/feedback-log.md` (this skill) and the long-relevant lines of `video-editor/references/feedback-log.md`: **user corrections override the style guide.**
Shared pipeline commands and gotchas: `video-editor/references/engine.md`. B-roll catalogue: `video-editor/references/broll-library.md`.

## Workflow (track as a to-do list; never skip step 5)

### 1. Pick the clip
`python3 _engine/scripts/pipeline.py broll-check` first (catalogue new B-roll per broll-library.md). Use the named file, else the unedited clip(s) in `Raw Clips V:O/Longs` (compare with `_engine/edit-log.md`); ask if several. Slug = short kebab-case title.

### 2. Prep, cut, gaze
```
python3 _engine/scripts/pipeline.py prep "<raw>" --slug S --format long      # background it (long clips)
python3 _engine/scripts/pipeline.py cut  --slug S --drop "<retakes, raw secs>" --gap 0.45 --pad 0.15
python3 _engine/scripts/pipeline.py gaze --slug S
```
Retakes: keep the LAST take. Longs breathe more than shorts: `--gap 0.45 --pad 0.15` (never clip sentence ends). Gaze review is mandatory: every look-away range (padded 0.2 s, merged under 0.6 s) must be covered by B-roll, a full-screen graphic or 3D (the eye-contact rule).

### 3. Map the hook (0–50 s of the CUT): the most important step (user: "the first 30 s needs most attention")
Split `transcript_cut.txt` 0–50 s into sentences and label each with its beat: **1 claim · 2 enemy/problem · 3 reframe · 4 credibility · 5 promise**. If the raw hook is missing a beat or runs long, propose re-ordering/trimming (list what moves; never silently). Then give **every sentence one visual idea** from long-style.md §6–7 (headTitle, stack, pills, counter, phone, node graph, collage, 3D metaphor, graded B-roll). Frame 0 has text or a graphic by 0.5 s. Graphic share 50–80 %, a visual change at least every 2.5 s.

### 4. Plan the body
1. **MG theme** (`teal` / `emerald` / `sky`, mg-style.md §2) by topic; one line why. Fonts: Sora + Inter Tight (+ Mr Dafoe only if a script accent is really needed; max 3). The legacy Look A/B/C only colours the old cards.
2. **Angles** (smooth cuts): a framing change on sentence boundaries (1.0 ↔ 1.25–1.35 crop), B&W alternate for 1–2 emphasis lines. Jump cuts inside a sentence must land on a framing change or be covered.
3. **Chapters**: chapter card per section + persistent neon chapter label; a recurring **tracker** if the video is a list/ranking/roadmap.
4. **Beats**: a keyword stack / card / B-roll every 15–30 s; numbers → counters; systems → node graph; app ideas → phone mocks; lists → word stacks that build on the spoken words.
5. **Explanation / story visuals = clean MG sequences** (mg-style.md): one `mg` beat per core explaining or story stretch, **10–25 s each, 4–6 per 3 minutes** (the user asked for "at least 4, about 20 s each" on a 3-min story video). One metaphor per sequence (timeline of days, loop/cycle, cause → effect node graph, quality meter, two-line chart, pyramid, chat bubble for the inner voice), elements popping on their spoken words, camera gliding across one canvas. One theme per video (`teal` default, `emerald` business/money, `sky` bright tutorials). Put them over the look-away stretches first.
6. **B-roll** from `B-Rolls/` only, `grade: cool` (or `warm` for the hopeful ending), hard clean cuts or `zoom: push`; lower-third caption on B-roll only when the line needs it.
6b. **Captions (minimal, user rule)**: a small centred line below the chin (`stack pos: "bottom"`, size `s`) a few times; 1–3 key words hopping to the free side of the face (`stack side: "auto"`, size `m`); lower-third on B-roll (`pos: "lower"`). For raw/motivational/story videos keep it simple: roughly one caption beat per 10–15 s of A-roll.
7. **Audio**: SFX per long-style.md §8 (`autoSfx`). **Music only if the user says yes** (feedback rule): ask in the plan; the inspos all run a bed ~20 dB under the voice. If yes and `Music/` is empty, generate one.
8. **Subtitles**: off (inspo). Mention it in one line; the user can say "subtitles on".
9. **Engine check**: list every component the plan uses and its status in components.md. TODO ones get built in step 6; say so in the plan.

### 5. Show the plan and STOP
Send: Look + fonts, the hook table (time · sentence · beat # · visual · SFX), the body beat table (time · line · visual/angle/B-roll/3D), chapter list, 3D storyboard rows, the music question, components to build, estimated length. Wait for "go". Save lasting preferences to `references/feedback-log.md`.

### 6. Build
1. Build TODO components the plan needs (components.md → build rules), lowest number first.
2. B-roll proxies are made by `pipeline.py long` from each `broll` beat. MG sequences: write `mg` beats (components.md → `mg`); QA one still at every element's payoff frame.
3. Write `jobs/S/edits_long.json` (format + worked example: components.md), run `pipeline.py long --slug S`; fix every `WARN`.
4. **Hook first:** render a half-res preview of 0–55 s only (`render --preview --dry`, then append `--frames=0-1650` to the printed npx command), QA it before the body: frame 0, every hook sentence's visual, no text on the face, no look-away showing the face, SFX on entrances, `flicker_scan.py` clean. Then preview the full video and QA one frame per chapter card, tracker, 3D shot, card shrink, and every look-away range.
`npx remotion …` runs from `_engine/`, unsandboxed, as its own command (project CLAUDE.md). If Chrome still crashes, ask the user to run `~/Documents/Videos/_engine/render.sh S`.

### 7. Render, master, verify, log
`render --dry` (writes props.json) → render with `bash _engine/scripts/render_long_segments.sh <slug> "Edited Videos/Long/<Title>.mp4"` in the background (3 parts, each in a fresh browser, auto-retry, audio rendered separately, lossless concat + mux; a single-pass full-res render of a 7-min long hung at 92 %) → `pipeline.py master "<out.mp4>"` (−14 LUFS) → ffprobe + 8 frames viewed → append to `_engine/edit-log.md` (date · raw · slug · output · length · Look · components built · notes) → report output path, raw vs final length, what was cut, anything that needs the user's eye.

## Rules
- Outputs go to `Edited Videos/Long/`. Never modify `Raw Clips V:O/`, `B-Rolls/`, `Inspiration Video Edits/`, `Long Videos/`.
- No text over the face except head-between hook titles (beside the head, never across the eyes). Stacks sit top-left or in the empty side of the frame per shot.
- Never two SFX within 0.15 s; never a graphic without a reason in the sentence.
- New long inspo added → re-measure (3 fps sheets, scene-detect, 10 fps strips of each animation, spectrum + ebur128, whisper of the hook) and update `long-style.md` + `frames/`.

## Common mistakes
| Mistake | Fix |
|---|---|
| Old Look cards / 3D props for an explanation | clean `mg` sequence (mg-style.md) |
| MG text lands late (matched a later repeat of the word) | `"fixed": true` on that text element (staggers from `at`) or anchor `"word@12.3"` |
| Hook sentences sitting on plain A-roll | every 0–50 s sentence gets a visual; count it in the plan table |
| Running subtitles "because shorts have them" | longs use keyword stacks only unless the user says "subtitles on" |
| Jump cuts visible mid-sentence | put the angle change on the cut, or cover it with a beat |
| Graphics in a random mix of colours | one Look per video; pills/cards are reskinned to it |
| 4+ fonts (e.g. adding Playfair/Pinyon from Cine) | Sora + Inter Tight + Mr Dafoe only |
| 3D scene that just decorates | it must act out the sentence (podium = "the one", drain = "losing money") |
| Rendering the full 10 min to find a hook bug | preview 0–55 s first |
| `backdrop-filter` glass flickering | rebuild glass with plain rgba + gradient (promo v2 fix) |
| Music added without asking | ask in the plan; the user's rule wins |
| A card that sits on its kicker for 2–4 s before the words are spoken (versus/chain) | start the card ≤ 0.6 s before its first spoken word; put a word stack on the A-roll before it |
| Caption invisible / too late on B-roll | the phrase is spoken after the clip ends: anchor with `at` inside the clip or extend the clip |
| Word appears early (e.g. "device") | `say` matched an earlier repeat of the word: anchor on a unique word |
| Tiny side text | long lines on tl/tr shrink to fit 0.37 W: shorten the line, use bl/br (0.6 W) or a full Look card |
| Final render dies on a Google Fonts load (`Inter.mjs tryToLoad`) | network blip: re-run with `--timeout=120000`; never pipe a render through `tail` (it hides the exit code), log to a file |
| 3D light cones wash the frame grey / object too small | cone opacity ≤ 0.03; move the camera in until the object fills ~40 % of the height |
