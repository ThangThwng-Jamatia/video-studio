---
name: dark-fable-2d
description: 2D cinematic no-voice "fable" long videos (16:9, ~2.5–3 min) about self-improvement and life lessons (discipline, dopamine, lust vs love, procrastination, loneliness): dark minimal rooms, a white blob everyman, a glowing pink/red inner-voice demon whispering in handwritten text, a counter HUD (DAY 47 / SEEN 1,140 KNOWN 0), short white narration cards, a sad-piano score that turns hopeful, and a turning-point object. Built fully in code (SVG in Remotion). Use when the user says "dark fable", "2d fable", "2d cinematic", "movie style 2d", "no voice animation", or shows inspo like DISCIPLINE / LUST VS LOVE. Not for voiced paper explainers (paper-explainer) or 3D shorts (build-it-3d, day-series).
---

# Dark Fables 2D (no-voice cinematic longs)

## Folders
`Dark Fables 2D/Inspirations/` (DISCIPLINE, LUST VS LOVE: the style reference), `Dark Fables 2D/Scripts/` (one .md shot table per film), `Dark Fables 2D/Completed/`, `Dark Fables 2D/Thumbnails/`.
Code: `_engine/src/fable/<Camel>.tsx`. Pilot `src/fable/Dopamine.tsx` (2026-10-25) holds the reusable pieces: `Guy` (poses stand/sit/hug, moods, phone, reach, guitar, `demon` variant), `Face`, set pieces (Window, Bed, Nightstand + Clock, Desk + lamp cone, LeanGuitar, Mirror with crack), `Whisper`, `Narr`, `HUD`, `Glitch`, scene table with per-scene camera. **Pull these into `src/fable/fableKit.tsx` on the first real episode**, then build on them.
Music: `scripts/gen_music_fable.py <sec> <out.wav> --hope <turn sec> --hits a,b --hush a,b` (sad piano → hopeful at the turn, low booms on the hits, pad only in the hush window). Job dir `_engine/public/jobs/<slug>/music.wav`. No voice.

## User verdict on the pilot
Style approved. **Motion and storytelling must be clearly better than the pilot** in every real episode. The pilot was too static (characters slide in and pose, little acting, long holds, small figures in wide frames) and its story was a list of states, not a story with moments. The rules below fix that and are mandatory.

## Storytelling rules (mandatory)
- **Length 2.5–3 min, 28–40 scenes of 3–6 s.** Three acts: **the loop** (habit feels good, ~35%), **the cost** (it takes something real, ends at rock bottom, ~35%), **the turn** (one small action, withdrawal, a slow win, ~30%).
- **Open on one line of narration** that sets a contradiction ("He had seen a thousand women." / "Every day started the same."), then show, don't tell. Narration cards ≤ 6 per film, ≤ 10 words each, white, lower-case-ish sentence case.
- **Concrete specific moments, not states.** Not "he scrolls a lot" but: the alarm 5:00 → snooze → 8:47 "again."; a missed call from Mom; a friend's message left on read; an untouched gym bag by the door. Every scene shows ONE action with a consequence.
- **A second character** to give stakes (crush, friend, parent, younger sibling) with tiny speech bubbles. The lesson lands through what he loses or almost loses with them.
- **The demon is a character:** it starts small and friendly ("just one more."), grows bigger and closer each act (scale 0.6 → 1.4), touches his shoulder, whispers *his own excuses*, and finally speaks *as his reflection*. At the turn it fights back (glitch, scream), then shrinks and fades over the hopeful scenes. Never kill it outright. The last shot shows it tiny, still watching.
- **A running counter** that tells the story by itself (DAY 1 → 25 → 47 → 112 → 301; SEEN 1,140 / KNOWN 0; MISSED CALLS 14). It resets or flips meaning at the turn.
- **A turning-point object** introduced early and paid off at the turn (the 5:00 alarm, the guitar, a photo, a notebook). The last scene **calls back the first shot** with one thing changed.
- **The thesis is 2 lines** at rock bottom or the ending: setup line (dimmed) + bold line ("But lazy isn't who you are. / It's what you repeat.").
- **End on an image, not a lecture:** "DAY 1." stamped big, or a quiet hopeful frame, then a short title card.
- Write the shot table first (t, scene, action, demon, text, SFX) into `Scripts/<TITLE>.md`, and show it to the user before building unless they said "go".

## Motion rules (mandatory)
- **Characters act, they don't pose.** Idle breathing (body scaleY 1 ± 0.015 at ~0.3 Hz), blinks every 2–4 s, head turns and tilts toward what they look at, a squash/settle when sitting or landing, walk cycles (legs alternate ±20°, body bob 6 px) whenever someone crosses a room, and hands that move to objects (reach → grab → bring to face). Add anticipation (small dip) before a big move.
- **Faces carry the scene:** emotion changes on the beat (flat → tired → sad → wide → smile). Close-ups (scale ≥ 2.2, head fills ~40% of frame) at every emotional peak: at least one every 20 s.
- **Characters big in frame:** default framing has the character at ~45–55% of frame height. Wide shots only to establish a new place (≤ 1 per location).
- **Camera always moves:** slow push or drift every scene, plus a motivated move per act (whip pan to the demon, push-in to the face, tilt down to the phone, rack from the window to the bed). Hard cuts on action, a fade through black only for time skips.
- **Transitions with meaning:** match cuts (phone screen → eye, alarm digits → next day's alarm), the counter ticking during a cut, light flicker cuts.
- **Living light:** phone glow pulses and colour-shifts on his face, the lamp flickers once at bad moments, the moon/sun moves across days, the room warms (amber wash) as he recovers. Dust motes or rain on the window for depth.
- **Parallax depth:** a blurred foreground layer (bed post, lamp, plant edge) moving faster than the room on camera moves.
- **Text animates:** whispers write on letter by letter with jitter and pink glow; the big red insult shakes and smears (chromatic split); narration fades in line by line.
- **Hit points:** the music `--hits` land on the crack/scream/rock bottom; the visuals hit on the same frame (shake 10–14 px, red glitch 0.2–1 s).

## Look
1920×1080, 30 fps. Background `#0b0b0e`, floor line `#2a2a30`. Everyman: cream `#ECE6D8` blob head (r 58) with dot eyes and line mouth, capsule body, thick round limbs. Demon: same silhouette in near-black with a pink `#ff2d78` (lust/dopamine) or red `#ff3344` (laziness/anger) glow outline, slanted eyes, smile, soft radial glow. Fonts: Nunito (narration, HUD), Patrick Hand (whispers). HUD top-left small caps. Vignette always.

## Workflow
1. Topic + shot table (above). 2. Music: `gen_music_fable.py` with `--hope` at the turn, `--hits` on the peaks, `--hush` at rock bottom. 3. Build `src/fable/<Camel>.tsx` from the kit, register at 1920×1080. 4. QA stills (`scripts/day_stills.mjs`, `PUBLIC_DIR=<scratch>/pub` holding the `jobs/<slug>` + `sfx` symlinks) every ~6 s, tile and look: is the character big enough, is there an action in every frame, are the faces readable? 5. Render unsandboxed `npx remotion render src/index.ts <Id> <out> --public-dir=<scratch>/pub --concurrency=50%` (SVG, fast). 6. Master `-af loudnorm=I=-14:TP=-1.5:LRA=11` → `Dark Fables 2D/Completed/<TITLE>.mp4`, `open` it. 7. Thumbnail 1280×720: the demon behind the character, a big 1–2 word title (DISCIPLINE.). 8. Log in `_engine/edit-log.md`.
