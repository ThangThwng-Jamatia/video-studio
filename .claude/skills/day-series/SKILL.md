---
name: day-series
description: "Day N" survival-scenario series shorts (9:16, ~60–75 s) in a low-poly 3D look: second-person story ("You wake up in a life raft…"), one day per episode, every beat a real fact, HUD (day, clock, supply counters), word-popped captions, AI voice, cliffhanger ending. Built with three.js inside Remotion. Use when the user says "day series", "next day", "Day 2", "ADRIFT", "make a survival series", or shows inspo like the viral "Day 1 / Night 2 of 7" animated scenario videos. Not for paper animations (paper-explainer) or editing real footage.
---

# Day Series (low-poly 3D survival scenarios)

## Folders
`Day Series/Scripts/` (narration + fact sources, one .md per episode), `Day Series/Completed/` (finished mp4s), `Day Series/Thumbnails/` (one 1080×1920 thumb per episode), `Day Series/Inspirations/` (inspo videos; the original 5 inspo files the user dropped in the project root are the style reference).
Code: `_engine/src/day/dayKit.tsx` (shared kit) + one file per episode (`AdriftDay1.tsx`) + its words module (`adriftDay1Words.ts`). Job audio: `_engine/public/jobs/<slug>/`.

## Running series: ADRIFT (lost at sea in a life raft)
Recurring cast/props: survivor in a yellow life vest, orange raft (canopy opens/closes), kit = 1.5 L water, 3 flares, mirror. HUD carries state across episodes: **keep counters continuous** (water litres, flares left, temp, day). Day 1 ended on "You have three flares. Do you fire one now?" (A fire / B wait). Day 2 must resolve that choice (tell the user; ideally use comment votes).
Ideas for later days: Day 2 flare physics (visibility ~ 1 min, ~5+ km) + solar stills; Day 3 fish/rain catching + sharks myth vs fact; Day 4 saltwater sores, sleep in shifts; Day 5 signalling mirror range (~15+ km), rescue.

## Running series: LOCKDOWN (zombie virus outbreak at school)
Code `src/day/LockdownDay1.tsx` + `src/day/schoolKit.tsx` (Person with sit/crouch/lie/walk/arms poses, `zombify(look)`, classroom+hallway `Interior` with outward-opening door + closer arm + belt, `Exterior`, `FloorPlan` with 1,000 instanced student tokens, `Cafeteria`). Shots carry a `loc` ('ext' | 'in' | 'map' | 'cafe') so only one set is drawn. Cast: you (teal hoodie), best friend (red hoodie), zombies with red glowing eyes. HUD: INFECTED (doubles every 10 min from 10:42 AM, capped "990+"), PHONE battery %, NOISE. Zombie behaviour is the scenario; every survival tip must be a real fact (lockdown protocol, fire code, comms).
Day 1 ended on "Your best friend is hiding in the cafeteria. Do you go get them?" (A go / B stay locked in). State at end: ~7:04 PM, power out, fire alarm on battery, phone 37%, door tied shut with a belt, class hiding in the blind-spot corner. Ideas: Day 2 corridor crossing (zombies follow sound: phone silent, shoes off), Day 3 water from the school's water heater / vending machines, Day 4 roof signalling, Day 5 rescue.
Day 2 (`src/day/LockdownDay2.tsx`, job `lockdown-day2`) resolved A (you go). Hook format the user asked for: open with the series premise as a question ("What happens when a zombie apocalypse breaks out while you're at school?") + "Day N." + the previous choice ("Save your best friend, or stay hidden?"). Kept for later days. Day 2 facts: NFPA 72 alarm +15 dB masks footsteps, alarm battery only needs 5 min of alarm, socks, silent + vibrate off, 20 min dark adaptation (one flash resets it), fire-rated self-closing stair doors, walk-in freezers have an inside release. New kit: `Stairwell`, `WalkIn` (door, knock, light strip under the door), `Interior hall={0}` = hallway power off. State at end: 12:03 AM, phone 19%, you + friend in the cafeteria walk-in freezer, 3 knocks + "Is anyone in there?" (A open / B stay silent). Ideas: Day 3 who's outside (a survivor? a trick?), food/water from the kitchen.
Door-window shots: the glass only shows what lies on the camera's ray through it, so place the face behind the window along that ray (it's ~1 m along z, not straight behind).

## Running series: THE SKY CRACKED (fantasy, started 2026-10-24)
Code `src/day/SkyCrackedDay1.tsx` (self-contained kit inside: Terrain, Tower, Truck, Crack + Hand + Eye, Bolt, Shards, TreeLone; reuses `Person` from schoolKit). Cast/voices: you = ranger (narrator Brian, tan top), Dana (Jessica, pink), Reyes (Harry, olive, grey hair), Eli (Liam, orange), the Thing (Callum). HUD: DAY · clock (6:12 PM start), RANGER LVL, SURVIVORS 7/7, CRACK state, STORM distance. Day 1 ended 6:31 PM, LVL 2, Reyes holds a glowing sky shard (powered hand), the eye in the crack said "Found you.", vote A run 11 km to Hollow Creek / B climb the tower and signal. Multi-voice workflow: one VidIQ job per speaker line (max ~10 in flight, retry the rest), wav + 0.1 s pad, concat demuxer, `silenceremove` (stop_duration 0.25, keep 0.18) + atempo 1.14, then paper_prep; caption speakers via a LINES time table.

## Format rules (from the inspo analysis)
- 60–75 s, 9:16, second-person present tense. Hook in 2 lines ("You wake up in…" + a stakes fact), then the day runs clock-forward (morning → noon → sunset → night), each block = one real survival fact, cliffhanger question last + "DAY N+1 → FOLLOW".
- A visual change every 1–3 s; never a static frame (camera always eases + handheld drift + swell bob).
- On-screen: top-left `● DAY N · SERIES`, big clock, `RESCUE: UNKNOWN`; top-right stat pills (WATER/FLARES/TEMP) that pop in when first mentioned.
- Captions: Inter Tight 900 uppercase, ≤3 words per chunk, word-by-word pop, keyword colours (lime `#C8FF3D` rules/good, red `#FF3B3B` danger, blue `#5CC8FF` water/cold, amber `#FFB23D` sun/land/ship). y≈1330.
- Beats: `Stamp` (DAY 1 / DON'T. / NOON / SUNSET), glass `Card` (rule cards, number counters, `Bar` comparisons), `Tag` pinned to 3D points via `projector`, SVG arrows/X on map shots.
- Facts must be real and sourced in the script .md (survival manuals, records, physics). Never invent numbers; round honestly ("~2%").
- Originality: inspo gives format only. Never copy their scenarios (gas station rules, farm, apartment zombies), characters or lines.

## Story rules (user, 2026-10-24, apply to every new Day Series episode)
- **80% story, 20% teaching.** The fact is a beat inside the plot, never a lecture. One real fact per ~15 s, max, and it must change what happens next. Story first, then the fact that explains why the hero survives or fails.
- **Hook = image first, line second** (see Hook rules). Frame 0 is the most extreme image of the episode, with a sound hit; the first line is <=8 words and mid-crisis; the premise and "Day N" go in a small HUD tag, not in speech.
- **Pace 5-10% faster** than Lockdown Day 2 / First Credit Card: atempo 1.14, shorter holds, cuts every 1-2 s, no dead air between lines.
- **Voices:** narrator Brian, characters get their own voices (see Workflow step 2). Dialogue lines are short and on screen as captions in the speaker's colour.
- **Story drivers (audience research, mostly male viewers):** external conflict (man vs world / monster / nature) over interpersonal drama; the hero's role, responsibility and worth to a group (protect, lead, provide); building power, skill and status over the episodes (level-ups, gear, rank shown in the HUD); conquering and mapping the unknown (new zones, a map that fills in each day). Fully fictional worlds are welcome; keep the facts real.
- **Series candidates** (fantasy, see chat 2026-10-24): SHRUNK, THE SKY CRACKED, LOOP, SWALLOWED, THE SUN STOPPED, DRAGON SEASON, THE WATER RISES, ZERO-G HOUR. Lockdown/Adrift continue only if the user says so.

## Look (what makes it not "paper")
Low-poly faceted three.js: flat-shaded displaced ocean plane (`Ocean`), gradient sky shader (`Sky`) + stars, sun/moon disc, hemisphere + directional light driven by a day `phase` (0 morning, 1 noon, 2 sunset, 3 night) through `phaseCol` palettes. Props are low-segment primitives with `flatShading`. Overlays: vignette, film grain, white cut-flash on shot changes.

## Workflow
1. **Series + episode script.** Write narration (~150–175 words → ~65 s after speed-up) + fact sources into `Day Series/Scripts/<SERIES> - Day N.md`. If the user asked for the whole thing, go straight on.
2. **Voice (updated 2026-10-24, George is retired for new episodes).** Narrator = Brian `nPczCjzI2devNBz1zQrb` (deep, resonant). Every line spoken by another character is its own clip in that character's voice: Callum `N2lVS1w4EtoT3dr4eOWO` (monsters/villains), Harry `SOYHLrjzK2X1ezoPC6cr` (soldier/leader), Liam `TX3LPaxmHKxFdv7VOQHJ` (young male friend), Jessica `cgSgspJ2msm6clMCkdW9` (female friend), Bill `pqHfZKP75CvOlQylNhV4` (elder/mentor). Keep one voice per character across the whole series. Generate each segment with `vidiq_voiceover_generate`, poll `vidiq_job_poll`, concat the clips in script order with ffmpeg (short 0.1 s gap, no long pauses), then speed up with `atempo=1.14` (was 1.06, i.e. ~7.5% faster pace), then `scripts/paper_prep.sh <slug> <mp3> small.en` (word times + music bed).
3. **Words module.** Python dump of `voice.json` words into `src/day/<camel>Words.ts` (`[word, start, end][]`); add any word whisper dropped (Day 1 lost "Sunset.").
4. **Episode file.** Copy `AdriftDay1.tsx`: `SHOTS` (time ranges keyed to word starts, one eased camera move each), `World` (state = pure functions of t), `HUD`, `Beats`, `KEYS`, `SFX`, plus `<Ep>Thumb`. Register both in `src/Root.tsx` (1080×1920, 30 fps).
5. **QA stills**: `PUBLIC_DIR=<scratch>/pub node scripts/day_stills.mjs <CompId> <outDir> <sec>…` (one bundle for all frames). `<scratch>/pub` holds symlinks to only `jobs/<slug>` and `sfx`, because `public/` contains broken symlinks (kathakaar) that crash the bundler; pass the same `--public-dir` to `remotion render|still`. Old note: (unsandboxed, `--gl=angle --scale=0.4`) at ~15 busy frames, tile with ffmpeg, look. Day 1 lessons: props near camera read huge (scale kit items ×0.5, keep ≥4 units from camera); closed canopy blocks night shots (reopen it); things at sea level vanish behind waves at distance (raise y ≥5); night needs hemisphere ≥0.5 and a lifted sky bottom or everything is black.
6. **Render** from `_engine/`, unsandboxed: `npx remotion render src/index.ts <Id> "../Day Series/Completed/<SERIES> - Day N.mp4" --concurrency=50% --timeout=120000` (WebGL: never full concurrency). Master to −14 LUFS (`loudnorm`), contact sheet, `open` it.
7. **Thumbnail** (one, 1080×1920): a real frame of the 3D world (golden hour/drama), red series pill, huge "DAY N", 2–4 word hook at bottom with one lime line. Render `npx remotion still … <Ep>Thumb "../Day Series/Thumbnails/<SERIES>-DayN-thumb.png" --image-format=png --gl=angle`.
8. Log in `_engine/edit-log.md`.

## Known limits (tell the user)
Puppet-style characters (no lip-sync, limited acting). AI voice. WebGL renders take ~10–20 min per minute of video.

## Running series: WHERE IT STARTS (zombie anthology, started 2026-10-24) — the viral format
Each episode is a standalone Part 1 in a new place (plane done; next: subway tunnel, hospital, cruise ship, ski gondola, cinema, wedding, gym). Format + why it works: `Day Series/Scripts/WHERE IT STARTS - Zombie Format Breakdown + Ep1.md`. Hook "If the zombie apocalypse starts while you're <place>, don't <obvious move>." + open loop; crowd vs "Not you."; 3–4 staccato smart moves; "On paper…"; a human at the door; callback; "Do you …? YES / NO · Part 2 starts with your answer". Minimal HUD (stamp + clock + one countdown).
Look: flat 2D cinematic vector (NOT low-poly 3D), code `src/day/WisPlane.tsx` — copy it for new episodes. Rich motion = every shot has a camera move + drift, hit shakes, cut punch/dip, blurred parallax foreground, light cones, dust, flicker, blinking/breathing characters with expressive faces, ticking counters. Close-ups: camera z ≈ 3.
