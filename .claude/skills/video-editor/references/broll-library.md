# B-Roll Library

Single source of truth for every clip in `B-Rolls/`. Every file on disk must have a row here.
Run `python3 _engine/scripts/pipeline.py broll-check` at the start of every edit. It lists new/unlisted files and rows whose file is gone.

## Naming convention
`<what-is-visible>-<key-detail>[_vertical].MOV`: lowercase kebab-case, 3–6 words, describes what is ON SCREEN (not the topic). Add `_vertical` for portrait clips. No colons or spaces. Keep the original extension.
The original camera name stays in the **Orig** column so renames are traceable.

## Adding new B-roll (when broll-check reports NEW or INBOX files)
The user may drop clips loose in the Videos root (INBOX) or straight into a folder (NEW).
1. Probe it: duration, size, rotation (`ffprobe` with `stream_side_data=rotation`; ±90 = vertical).
2. Look at it: `python3 _engine/scripts/pipeline.py broll-sheet "<file>"` makes an 8-frame contact sheet in the scratchpad. View it.
3. Rename it per the convention and move it into the best-fitting folder with `mv -n`. Never overwrite; if the name exists, add `-2`.
   Folders: Physique Posing · Workout · Travels:Luxury · Typing:Working · Journaling · Food & Nutrition · Filler (mood/transition/establishing).
   If nothing fits and 2+ clips share a theme, create a new folder (no `:` in new folder names) and a new `##` section. A one-off goes to Filler.
   High-fps clips (check `r_frame_rate` ≥ 60): add `slowmo` to the name and note the fps.
4. Add a row to the right table below. Update **Gaps**.
5. Tell the user what was added and the new names.

All clips so far: 3840×2160 HEVC, iPhone. Avoid the first and last second as in-points; the camera often moves there.

## Physique Posing/: body, progress, before/after, "home workouts"
| File | Orig | Len | Orient. | Shows | Fits lines like |
|---|---|---|---|---|---|
| mirror-selfie-white-tee-before-a_vertical | IMG_5400 @2–14s | 12.0 s | V | mirror selfie, white tee, khaki pants | "this was me", before shot |
| mirror-selfie-white-tee-before-b_vertical | IMG_5400 @22–34s | 12.0 s | V | same mirror selfie, hand in hair / small pose changes | before, starting point |
| mirror-selfie-shirtless-grey-sweats-a_vertical | IMG_5402 @1–13s | 12.0 s | V | shirtless mirror selfie, grey sweats | early progress, check-in |
| mirror-selfie-shirtless-grey-sweats-b_vertical | IMG_5402 @15–27s | 12.0 s | V | same selfie, closer, slight poses | progress, before/after |
| mirror-selfie-flex-purple-room-before_vertical (**photo**) | IMG_0725 | photo | V | mirror selfie, shirtless, flexing one bicep, purple room, phone over face | "2 years ago", before, "this was me" |
| mirror-selfie-side-door-before_vertical (**photo**) | IMG_0726 | photo | V | mirror selfie beside a cream door, shirtless, double-bicep flex | before, progress, "this was me" |
| mirror-selfie-full-length-hands-on-face-before_vertical (**photo**) | IMG_0730 | photo | V | full-length mirror, shirtless, hands raised in front of face | before, full body, "then" |
| posing-shirtless-door-arms-behind-head_vertical | IMG_0265 2 | 52.9 s | V | shirtless against a cream door: front, arms behind head, back, side poses | now, progress, "this is me now", abs |
| posing-shirtless-door-double-biceps_vertical | IMG_0266 2 | 87.1 s | V | shirtless against a cream door: double biceps, hand on chest, front pose | now, results, flex |
| posing-crossed-arms-to-side-pose | IMG_5803 @18–30s | 12.0 s | H | tripod shot: arms crossed, front relaxed, side pose, cream wall | "this is me now", physique |
| posing-arm-behind-head-front-relaxed | IMG_5803 @38–50s | 12.0 s | H | arm behind head, then front relaxed | aesthetic, abs, results |
| posing-arms-spread-then-back-pose | IMG_5803 @63–75s | 12.0 s | H | arms spread wide, then turns for a back pose | V-taper, back, proportions |
| posing-double-biceps-front-lat | IMG_5803 @95–107s | 12.0 s | H | front double biceps into front lat spread | strength, results, flex |
| posing-double-biceps-arm-behind-head | IMG_5806 @27–39s | 12.0 s | H | black shorts: double biceps, then arm behind head | after shot, flex, results |
| posing-both-arms-behind-head-abs | IMG_5806 @48–58s | 10.0 s | H | both arms behind head, abs on show | abs, small waist, aesthetic |
| posing-hands-on-hips-front | IMG_5806 @69–81s | 12.0 s | H | hands on shorts/hips, front stance | V-taper, physique, confident |
| shower-back-muscles-water-teal-tiles-cut | IMG_0231 @2–14s | 12.0 s | H | wet back, water running, teal tiles, warm grade | back gains, recovery, discipline |
| shower-back-muscles-water-dark-tiles_vertical | IMG_0558 | 26.9 s | V | wet back under the shower, hands through hair, dark striped tiles, ends on empty shower | back gains, recovery, discipline, "reset" |

## Travels:Luxury/: lifestyle, success, freedom, "the result"
| File | Orig | Len | Orient. | Shows | Fits |
|---|---|---|---|---|---|
| airport-window-tarmac-view | IMG_0080 | 5.2 s | H | airport window → tarmac and runway | departure, "next step" |
| lounge-candle-table-moody | IMG_0092 | 9.5 s | H | candle in glass on a lounge table, warm and moody | calm, reflection, night |
| plane-window-takeoff-roll-runway | IMG_0100 @1–12s | 11.0 s | H | oval window: wing during the takeoff roll on the runway | "taking off", start of a journey |
| plane-window-liftoff-climbing-fields | IMG_0100 @11–22s | 11.0 s | H | lift-off and climb over green fields, hazy sky | leaving, new chapter, rising |
| plane-wing-above-clouds | IMG_0103 | 12.6 s | H | above the clouds, wing tip, blue sky | freedom, big picture, success |
| plane-window-airasia-taxiing-past | IMG_0108 @0.5–7s | 6.5 s | H | wing, red AirAsia jet taxiing past, blue sky | travel, airport, departure |
| plane-wing-runway-hills-tower | IMG_0108 @7.5–19.5s | 12.0 s | H | wing over the runway, green hills and control tower | takeoff, travel montage |
| beach-limestone-cliffs-turquoise-water | IMG_0124 | 9.2 s | H | tropical beach, limestone cliffs, turquoise water, people | dream life, reward, vacation |
| selfie-on-escalator_vertical | IMG_5474 | 9.6 s | V | selfie on an escalator, striped tee | vlog moment, "me" |
| speedboat-on-sea-cloudy | IMG_5578 | 15.1 s | H | speedboat on the sea, cloudy sky | adventure, travel |
| pov-rolling-suitcase-tiled-floor | IMG_0271 | 3.7 s | H | top-down POV pulling a grey hard-shell suitcase, tan shoes, dark tiled floor | "packed my bags", travel day, leaving, new chapter |
| plane-window-wing-rainy-terminal | IMG_0269 | 7.3 s | H | through the plane window: wing, wet tarmac, airport terminal, overcast | arrival, departure, travel day |
| dubai-fountain-show-night-crowd | 3034ED7A…(.MP4) | 18.1 s | H | 1080p. Dubai Fountain show at night, lit towers, crowd silhouettes filming on phones | luxury, Dubai, dream life, "the result", night |
| plane-window-city-lights-night | IMG_0270 | 5.5 s | H | night flight: city lights grid below, wing silhouette with blinking light | night travel, "the city", ambition, big picture |
| car-window-view-palm-lined-road-bus-shelter | IMG_0072 | 5.4 s | H | dashboard-height view driving down a quiet road, palms, covered bus shelter, overcast (24 fps) | commuting, "on the way", travel day, going somewhere |
| beach-sunset-cloudy-sea-silhouettes-pan | IMG_0111 | 8.8 s | H | moody sunset over a calm sea, two tiny silhouettes on the shore, slow pan to islands | reflection, calm, end of day, vacation |
| selfie-cafe-friend-thumbs-up-black-shirt | IMG_0221 | 5.9 s | H | handheld selfie in a brick-wall cafe, black shirt, friend with a drink behind, thumbs up | hanging out, friends, vlog moment |
| pov-walking-suitcase-marble-floor | IMG_0226 | 3.0 s | H | top-down POV walking on pale marble beside a maroon suitcase, brown shoes | travel day, "packed my bags", airport walk |
| plane-window-taxiing-runway-overcast | IMG_0228 | 9.4 s | H | oval window view taxiing past grass, runway markings, control tower, overcast | taking off soon, departure, travel |
| plane-wing-above-clouds-sunset-glow | IMG_0229 | 18.8 s | H | above a cloud sea at golden-grey light, wing edge, slow drift. Long: good for chapter bg | freedom, big picture, perspective, success |
| selfie-on-plane-white-polo-hand-in-hair | IMG_7792 | 9.8 s | H | selfie in an aeroplane seat, white polo, hand through hair, window behind. Rotation flag 180°, plays upright | travel vlog, "on my way", thinking |
| airport-boarding-stairs-plane-door | IMG_8281 | 4.6 s | H | blue boarding stairs against a white plane, passengers climbing, ground crew | boarding, "let's go", departure |
| low-angle-campus-road-golden-sunset-palms | IMG_0288 | 35.0 s | H | low-angle road-level shot of a palm-lined campus road, golden-orange sunset sky, people walking far off (looks like a sped-up/hyperlapse move) | golden hour, calm, freedom, "the journey", travel montage |
| car-window-side-mirror-selfie-dirt-road-greenery | IMG_0286 | 6.3 s | H | from a car window: the user filming in the side mirror, green jungle and a dirt road rolling past | road trip, travel, "on the move", vlog |
| hotel-lobby-world-clocks-ceiling-lights | IMG_0110 | 4.3 s | H | hotel lobby wall of world-time clocks (Tokyo, Sydney, Beijing, New York, London), static | time, "around the world", luxury hotel, travel |
| airport-security-hall-high-angle-windows | IMG_0076 | 4.3 s | H | high-angle static view of an airport security hall with a big glass wall | airport, travel start, "on my way" |

## Typing:Working/: work, business, apps, money, discipline
| File | Orig | Len | Orient. | Shows | Fits |
|---|---|---|---|---|---|
| laptop-app-designs-dark-desk | IMG_0153 | 13.8 s | H | laptop showing app designs, mic arm, warm lamp, dark room | building, designing, "my apps", night work |
| app-store-connect-minor-builds-physiqeai | IMG_0164 | 4.3 s | H | App Store Connect: "Minor Builds: Habit Tracker" + "PhysiqeAI: Improve Your Body" | "my app(s)", PhysiqeAI, launch |
| meta-ads-manager-screen | IMG_0165 | 5.7 s | H | Meta Ads Manager on screen, cursor | ads, marketing, campaigns |
| google-play-minor-builds-listing | IMG_0166 | 4.3 s | H | Google Play "Minor Builds: Habit Tracker", 4.2★, 500+ downloads | "my app", downloads, proof |
| phone-stock-portfolio-scrolling | IMG_0167 | 10.1 s | H | phone stock portfolio ($1,313.45), thumb scrolling | investing, money, portfolio |
| phone-stock-profit-pnl | IMG_0168 | 12.7 s | H | phone P&L (+$312 unrealized, buying power) | profits, investing results |
| notion-video-ideas-list-glitch | IMG_0196 | 5.6 s | H | Notion list of video titles (calisthenics ideas), glitchy colour shift | content planning, "my videos", YouTube |
| sitting-down-at-desk-from-behind | IMG_0150 @0.5–12s | 11.5 s | H | from behind: drops into the chair and opens the laptop, teal room | starting work, "every day I sit down" |
| typing-laptop-from-behind-warm-glow | IMG_0150 @33–45s | 12.0 s | H | from behind, typing, warm lamp glow around the laptop | focus, consistency, deep work |
| working-from-behind-photos-on-screen-leaves | IMG_0150 @55–67s | 12.0 s | H | from behind, browsing photos on the laptop, then gets up | reviewing work, wrapping up |
| typing-laptop-high-angle-screen-lights-up | IMG_0225 @9–21s | 12.0 s | H | high angle, sits in and starts typing, monitor flashes bright | starting work, booting up, late night |
| typing-laptop-high-angle-editing-timeline | IMG_0225 @40–52s | 12.0 s | H | high angle, steady typing with an editing timeline on screen | editing, working, grind |
| typing-laptop-high-angle-then-empty-desk | IMG_0225 @92–103s | 11.0 s | H | last typing, then leaves; empty desk, headphones on stand | done for the day, end of session |
| phone-scrolling-instagram-explore-profile_vertical | 20261022_152427 | 59.3 s | V | hand holding a phone: scrolling Instagram Explore (fitness, then entrepreneur/Apple posts), opens own profile ~25 s | social media, scrolling, "on Instagram", comparison, content, distraction |

## Journaling/: planning, goals, reflection, "write it down"
| File | Orig | Len | Orient. | Shows | Fits |
|---|---|---|---|---|---|
| opening-notebook-flipping-pages-golden | IMG_0239 @0.5–9s | 8.5 s | H | notebook + pen on desk, opens it and flips pages fast | "I write down", start planning |
| pen-writing-notebook-golden-light | IMG_0239 @12–24s | 12.0 s | H | low angle, pen writing in the notebook, golden side light | goals, journaling, morning routine |
| writing-in-notebook-night-lamp-a | IMG_0240 @2–14s | 12.0 s | H | hand writing in a spiral notebook, lamp + monitor glow | journaling, night routine |
| writing-in-notebook-night-lamp-pen-down | IMG_0240 @14–26s | 12.0 s | H | writing, then lifts the pen and pulls away | "plan tomorrow", done writing |

## Food & Nutrition/: diet, protein, supplements
| File | Orig | Len | Orient. | Shows | Fits |
|---|---|---|---|---|---|
| breakfast-plate-eggs-bread-salad_vertical | IMG_5530 | 6.9 s | V | breakfast plate: fried eggs, bread, salad | food, diet, "eat this", protein |
| supplement-jar-looking-down-slowmo-a | IMG_0267 @0.5–6s | 5.5 s | H | **120 fps.** jar foreground, looking down, window light | supplements, moody intro. `--speed 0.25`–`0.5` |
| supplement-jar-looking-down-slowmo-b | IMG_0267 @17–29s | 12.0 s | H | **120 fps.** leans back in, still look down, ends glancing up | supplements, "what I take". `--speed 0.25`–`0.5` |
| breakfast-plate-avocado-egg-toast_vertical | IMG_9390 | 9.1 s | V | top-down handheld plate: avocado halves, boiled egg, toast, apple slices | "what I eat", breakfast, healthy fats, protein |
| breakfast-plate-eggs-sausage-juice-overhead_vertical | IMG_5668 | 5.0 s | V | top-down plate: fried eggs, sausages, lettuce, noodles, green juice, wooden table, slow sway | "what I eat", breakfast, protein |

## Filler/: mood, transitions, aesthetic establishing shots (use under intros, chapter cards, pauses)
| File | Orig | Len | Orient. | Shows | Fits |
|---|---|---|---|---|---|
| backlit-cutout-figure-dark-room | IMG_0169 | 6.7 s | H | glowing cut-out human figure in a dark room, slow drift | mindset, identity, "who you become", transition |
| spotify-playlist-scrolling-screen | IMG_0257 | 5.8 s | H | Spotify playlist scrolling on a monitor, fast motion-blurred bursts | music, vibe, "my playlist", energy transition |
| desk-setup-closed-laptop-airpods-slide | IMG_0272 | 5.7 s | H | high-angle slow slide over the desk: closed laptop, water bottles, AirPods, mouse | setup, "before I start", establishing |
| desk-setup-closed-laptop-book-lamp-slide | IMG_0273 | 13.4 s | H | slow slide: closed laptop, "The Way of the Superior Man" book + highlighter, lamp | reading, learning, calm start, chapter card bg |
| desk-setup-open-laptop-book-lamp-slide | IMG_0274 | 13.7 s | H | slow slide: open laptop with code/text, the same book, lamp, phone | work session, focus, studying, chapter card bg |
| eye-closeup-blinking-thinking-slowmo | IMG_0255 | 10.9 s | H | **120 fps slow-mo.** Extreme close-up of an eye, looking sideways, slow blink | thinking, realisation, "I noticed", focus, intro. Use `--speed 0.25`–`0.5` |
| book-page-dont-be-mediocre-hand | IMG_0265 | 6.1 s | H | hand turns to a book page reading "DON'T BE MEDIOCRE!" | mindset, standards, motivation, hook line |
| shelf-airpods-case-grabbed | IMG_0279 | 8.9 s | H | AirPods case on a wooden shelf, hand grabs it (~3 s), empty shelf after | "let's start", music on, routine start |
| putting-in-airpods-profile-a | IMG_0283 @1–11s | 10.0 s | H | side profile, puts AirPods in, looks down | getting in the zone, focus |
| putting-in-airpods-profile-turns-to-camera | IMG_0283 @16–27s | 11.0 s | H | adjusts AirPods, ends turning toward camera | routine start, "let's go" |
| blue-coffee-cup-wooden-table-cafe | IMG_0161 | 7.3 s | H | blue mug of coffee on a wood table, blurred person holding a cup behind, candle | calm, slow morning, cafe vibe, pause |
| sitting-sofa-shirtless-eyes-closed-calm_vertical | IMG_0554 | 17.7 s | V | sits down on a grey sofa shirtless, hands clasped, eyes closed, then looks at camera and leaves (~14 s) | calm, meditation, reflection, "sit with yourself", rest |

## School/: school, computer lab, "at school"
| File | Orig | Len | Orient. | Shows | Fits |
|---|---|---|---|---|---|
| school-lab-laptop-code-pan-to-pcs | IMG_0392 | 8.3 s | H | handheld: laptop with code editor on a lab desk, pans to the row of lab desktops (~3–4 s), back to the laptop | "at school", computer lab, editing/working at school |
| school-lab-laptop-then-pc-row-pan_vertical | IMG_0393 | 8.8 s | V | laptop on a lab desk → fast blurry pan along the lab PC row (~1–3 s) → laptop again at the end | school establishing, "in my school", energy transition |
| selfie-in-school-hall-black-tee_vertical | IMG_0394 | 8.7 s | V | the user's handheld selfie video in a bright school room, black tee, ceiling lights | "shoot videos", vlog at school, "me at school". Face is mid-frame: pillarbox (blurred sides) rather than centre-crop |

## Workout/: calisthenics, pull-ups, training
| File | Orig | Len | Orient. | Shows | Fits |
|---|---|---|---|---|---|
| pull-ups-outdoor-bar-rainy-garden | IMG_9072 @17–31s | 14.0 s | H | shirtless pull-ups on a wall-mounted bar, side/back view, rainy garden, black shorts | pull-ups, "I train every day", calisthenics, discipline |
| pull-ups-outdoor-bar-black-gate | IMG_9072 @62–76s | 14.0 s | H | same bar from a wider angle, black gate and orange steps behind, pull-up reps | workout, consistency, home training |
| back-flex-after-pull-ups-outdoor | IMG_9072 @86–97s | 11.0 s | H | looks back at camera, turns, back double-biceps flex and lat spread | results, back gains, V-taper |
| push-ups-living-room-floor-shirtless_vertical | IMG_0556 | 19.7 s | V | low front angle, shirtless push-ups on white floor tiles, sofas behind | push-ups, home workout, "no gym needed", discipline |
| dips-parallel-bars-low-angle-black-tank_vertical | IMG_0566 | 34.6 s | V | low angle under a dip station, black tank + grey sweats, dip reps, bright wall | dips, calisthenics, training, grind |
| selfie-running-outdoor-grey-tee-earbuds | IMG_0564 | 22.4 s | H | handheld selfie while running on a leafy road, grey tee, earbuds, shaky. Rotation flag 180°, plays upright | running, cardio, "every morning", energy, vlog |

## Gaps (ask the user to film when needed)
Workout now has pull-ups, push-ups, dips and a running selfie (most are vertical). Still missing: horizontal push-ups/dips, gym, cooking/meal prep, sleeping/morning routine, or gym. For calisthenics videos these are the most-needed categories. Until then, cover workout talk with Physique Posing + punch-ins + headlines.
