# Long-video feedback log (user corrections override long-style.md)

## 2026-10-19 (skill created)
- User added 3 long inspos (Iman Gadzhi, If You ONLY, ChatGPT vs Claude): "learn how i want my Long video edits to look like: the colour palettes, motion graphics, sfx, smooth cuts, transitions, effects in-between". Hooks (first 30–50 s) are the priority.
- Iman Gadzhi: "analyse the 3d animations that come in the explanation parts (58 s, 1:27–2:00) … I want that kind of motion design graphics in my upcoming videos." → long-style.md §7.
- Carried over from the video-editor feedback log (still in force for longs): eye-contact rule (look-aways covered); max 3 font families; no music unless the user clearly asks; text never over the talking face; B-roll from `B-Rolls/` only (unless an event folder is named).
- Superseded for longs: centred lower captions at y≈0.84 (2026-10-12) → longs now have no running subtitles (inspo), keyword text only; "subtitles on" brings back small centred lower subtitles.

## 2026-10-19 (Winter Glow Up v1 review)
- "Looks good overall but the motion graphics and designs at some points and the explanation points feel a bit off (3:10 brain, 3:25 checklist, 0:47 battery, 0:18 versus card, 4:24 phone). Add more depth and better creativity or a more clean look, because currently they look too cartoonish and glitchy. Redesign the motion graphics, better creativity, quality, and use more B-rolls wherever appropriate. Also the placement of captions could be much better."
- Rules from this:
  - **No primitive "toy" 3D of organic things** (blob brain, capsule people, wireframe globe, box battery, flat slab phone). 3D only for clean product-style objects (glass, metal, devices, gold bars) rendered with an environment map, physical materials and studio lighting. Otherwise use 2.5D glass UI with real depth (perspective tilt, parallax bokeh, sheen, soft shadows) or real B-roll.
  - **Prefer B-roll** whenever the line can be shown literally; graphics for what B-roll can't show (numbers, comparisons, systems).
  - **Full-screen cards must be full**: big type, filled composition, no empty navy screens with small text.
  - **A-roll captions sit in a clean column beside the face** (never in the top corner touching the head); B-roll captions use one consistent lower-third with a soft scrim.
  - **No ghosting**: graphics cut in clean (no semi-transparent fade over the talking head).
- "The first 30 s needs most attention, the hook needs to be better, or else all of our hard work will mean nothing." -> build and QA the hook (0-35 s) first and hardest: a new striking visual every 1-2.5 s, real B-roll + premium graphics, depth effects (text behind the head), punch-ins and sound design on every cut.

## 2026-10-20 (Winter Glow Up v2 review)
- "The animation at 00:07 is not properly visible." Cause: pipeline dropped `stampAts`, so only JAN got its ✕; the grid also sat in the top half. Fixed in pipeline.py + bigger CalendarV2 tiles. **QA every hook graphic at its payoff frame, not just its entrance.**
- "From 2:40–2:50 use a different physique flexing pose." When the line is about the physique, use actual flexing clips (double biceps, lat spread, arms behind head), not relaxed/hands-on-hips ones; cut every ~2 s.
- "At 2:53 the animation hadn't completed and the new one started; my voice doesn't match; keep pacing proper." **A card must end ≥ 0.8 s after its last payoff word is spoken.** Never compress a reveal before its word (check that `goodAt`/last `at` < end − 0.8). Drop a filler beat (e.g. a tracker tick) rather than squeeze the payoff.

## 2026-10-23 (clean motion graphics + new long brief)
- User added `Inspiration Video Edits/Motion Graphics/` (4 clips): "use similar types of clean motion graphic animations in my long videos, not like before but the new clean style whenever editing the long video and adding motion graphics to any point." → **all long MGs use the `mg` kit** (mg-style.md). Old Look cards / 3D props only if asked by name.
- "The rest keep the same for long video edits - clean aesthetic captions below my neck or chin, few times, key words captions hop around my sides or b-rolls matching space." → captions: small chin line sometimes, key words beside the face, lower-third on B-roll; never running subtitles.
- MTVideo 4 (long, 2:56, story/motivational): "a bit raw and motivational and story based, so keep the captions simple and minimal; use motion graphics at core explaining and story parts. At least 4 motion graphics through the 3 min video, each of about 20 s. And B-roll transitions clean."
