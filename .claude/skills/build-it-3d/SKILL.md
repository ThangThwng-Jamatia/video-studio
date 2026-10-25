---
name: build-it-3d
description: "How to build a ___" 3D shorts (9:16, ~60–70 s): fast second-person AI voice-over ("If you dig a hole… you have a well. But… So you… This is a casing."), one persistent 3D cutaway diorama that grows with every fix, single-word captions with the engineering terms in yellow, a "that thing is not a mistake" reveal and a "Congratulations, you have built a ___" ending. Built with three.js inside Remotion. Use when the user says "build it", "build it 3d", "how to build a ___", "how a ___ works" in this style, "next build", or shows inspo like How-a-Cave / How-a-Hole. Not for Day Series survival stories (day-series) or 2D no-voice films (dark-fable-2d).
---

# Build It 3D ("How to build a ___" shorts)

## Folders
`Build It 3D/Inspirations/` (How-a-Cave, How-a-Hole: the style reference), `Build It 3D/Scripts/` (one .md per video: script + fix chain), `Build It 3D/Completed/` (mastered mp4s), `Build It 3D/Thumbnails/`.
Code: `_engine/src/build/<Camel>.tsx` + `<camel>Words.ts`. Job audio `_engine/public/jobs/build-<slug>/`. Reference build: `src/build/BuildWell.tsx` (approved pilot, 2026-10-25). Copy its structure for each new video.

## Why it works
Curiosity about everyday infrastructure, plus the satisfying "watch it get built" loop, plus the "so THAT's why it's there" payoff that people share. Every fix is a real engineering solution with its real name.

## Script formula (~170–190 words → ~62 s after speed-up)
1. **Hook (1 line):** "If you [simplest action], you have a [thing]. But [immediate failure]." The video opens mid-action on frame 0, with no title card.
2. **Fix chain, 6–8 links**, each 2–3 short sentences:
   "So you [fix]. **This is a [real term].** But [new problem the fix created or revealed]."
   Problems escalate (structure → water → weather → long term → health). At least one problem should be invisible or surprising (radon, algae, smoke flow).
3. **Reveal:** "And that [visible detail people see in real life] is not [what people assume]. It [real reason]." This is the share moment.
4. **Joke list:** "Add a [normal item], a [cute item], and [absurd/funny item]." Optionally "which you already know how to build" if it links to an earlier video.
5. **Ending:** "Congratulations! You have built a [thing]."
Rules: second person, present tense, no filler, no intro or outro, and every term must be correct (check it). Topics: cave home, basement, well, castle wall, igloo, dam, lighthouse, sewer, bridge, skyscraper foundation, tunnel, treehouse, bunker, road, pyramid, ship hull, chimney, septic tank.

## Workflow
1. **Script** → `Build It 3D/Scripts/How to Build a <X>.md` with the fix chain listed. Show it to the user unless they said "go".
2. **Voice:** Brian `nPczCjzI2devNBz1zQrb` via `vidiq_voiceover_generate` (one clip), poll `vidiq_job_poll`, download, then
   `ffmpeg -i raw.mp3 -af "silenceremove=stop_periods=-1:stop_duration=0.25:stop_threshold=-40dB:stop_silence=0.18,atempo=1.14" voice.mp3`
   then from `_engine/`: `scripts/paper_prep.sh build-<slug> <voice.mp3> small.en` (word times + music bed).
3. **Words module:** dump `voice.json` words to `src/build/<camel>Words.ts` (`[word, start, end][]`). Check for words whisper dropped.
4. **Beat sheet:** from `words.txt`, map every "So you…" to the time its element appears (it pops on the verb), every "This is a" to the term word, and every "But…" to the failure animation. Write these into the state functions.
5. **Build the composition** (see Look). Register it in `src/Root.tsx` at 1080×1920, 30 fps.
6. **QA stills:** `PUBLIC_DIR=<scratch>/pub node scripts/day_stills.mjs <Id> <out> <secs…>` (unsandboxed). `<scratch>/pub` holds symlinks to only `jobs/<slug>` and `sfx`. Tile with ffmpeg and look: is the action in frame and readable at phone size?
7. **Render** (unsandboxed): `npx remotion render src/index.ts <Id> <out.mp4> --public-dir=<scratch>/pub --concurrency=50% --gl=angle --timeout=120000` (~10 min). Master: `ffmpeg -i in.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 "Build It 3D/Completed/How to Build a <X>.mp4"`, then `open` it.
8. Log it in `_engine/edit-log.md`.

## Look (match BuildWell.tsx)
- **One persistent cutaway diorama.** The ground is a soil block cut at z = 0 facing the camera. Coloured strata (topsoil, clay, aquifer blue, bedrock grey) have pebble speckles on the cut face. Everything built is cut in half too: use back-half cylinders `thetaStart π/2, length π` and only place stones with z < 0. Above ground: bright sky `#9fd3f5`, round low-poly trees, puffy clouds, green grass.
- **Clean, soft, toy-like:** meshStandardMaterial with roughness ~0.85, hemisphere + one directional sun. No realism attempt. The realistic cave inspo is out of scope for code.
- **Everything is state = f(t)**: `shaftBottom(t)`, `waterTop(t)`, `waterCol(t)` and so on. Elements build *physically*: stones stack row by row bottom-up, posts rise out of the ground, gravel pours as falling spheres, the roof pops on with back-ease.
- **Failures are visual:** collapse = dirt chunks fall in and the water turns brown; contamination = rain + white 3D arrows flowing in and the water turns green; snap = camera jolt + rope piece drops; bad state = water colour change. A fix must visibly undo its failure (the water clears).
- **White 3D arrows** (cylinder + cone, slightly emissive) for invisible forces: water flow, pressure, wind, gas, sunlight.
- **Reveal beat:** briefly undo the detail (the roof lifts, the vent closes) to show what would happen, then put it back.
- **Camera:** a new shot on every sentence (every 2–5 s), always moving (slow push or arc, sin ease). Follow the action down the shaft or up to the roof. White flash 0.12 s on cuts. Final shot: pull back and arc out to the whole build. 9:16 is narrow: keep the subject within ±1.5 units at ~4–5 m distance, fov 50.
- **Captions:** ONE word at a time, centred at y≈860 (just above middle), Inter Tight 800, 68 px white with a soft shadow. Term words (the "This is a ___" names + the final noun) at 92 px yellow `#FFE15A`. Captions stay small. The world is the show.
- **Extras at the joke list:** pop in the cute and funny props (frog, coins, bat) with back-ease.
- **Audio:** voice at full volume, music bed 0.14, SFX on build actions (clunk for stones and posts, click for small parts, rattle for gravel and dirt, ding on each term, impact on failures, swell_hit on "Congratulations").

## Pilot lessons (How to Build a Well)
- 62 s of voice ≈ 15 shots. Fade from black takes only 0.15 s; the action must already be happening.
- The cut-face approach (side boxes + a back box + a fill box under the shaft bottom) makes digging deeper trivial: one number drives the whole layer stack.
- Check that no front-half geometry pokes out in front of the cut face (z > 0) and floats.
