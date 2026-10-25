# Long Engine: `Long` composition + component library

The legacy long composition (`src/Edit.tsx`, gold/serif captions, `edits.json`) does NOT produce the 2026-10-19 style. Longs now render with a new composition, **`Long`** (`src/long/Long.tsx`), from **`edits_long.json`** → `pipeline.py long --slug S` → `long_plan.json`.

## Feature status (update this table whenever you build something)
| # | Component | File | Status | Used for |
|---|---|---|---|---|
| 0 | `Long` composition: A-roll + angle crops + B-roll + beats + music/SFX + grade | `src/long/Long.tsx`, `src/long/types.ts` (`LongPlan`) | **built 2026-10-19** (winter-glow-up) | everything |
| 0b | `pipeline.py long` (edits_long.json → long_plan.json, B-roll proxies, facebox per angle, music gen, auto-SFX, look-away coverage check) and `render/still --dry` routing to `Long` when `long_plan.json` exists | `scripts/pipeline.py` | **built 2026-10-19** | everything |
| 1 | Angles: framing change at every cut point (+ sentence split of runs > 11 s), alternating 1.0 ↔ `angleZoom` (1.28) about the face centre; `angleOverrides` [{at, scale, bw}] | `Long.tsx` + pipeline | **built** | smooth cuts |
| 2 | `WordStack`: word-append blur-in lines, markup `~script~ _italic_ ^gold^ !bad! %good% @ice@`, icon per line (check/x/up/down…), strike, bg none/scrim/look | `long/Text.tsx` | **built** | keyword stacks, lists, credentials |
| 3 | `HeadTitle`: two huge words either side of the facebox + sub-lines (no chromatic aberration yet) | `long/Text.tsx` | **built** | hook titles |
| 4 | `ScriptWrite` neon write-on (mask wipe) | `long/Text.tsx` | **built** | accents, labels |
| 5 | `ChapterLabel` (persistent neon script, bottom-left; hidden while a card is full-screen) | `long/Text.tsx` | **built** | chapter tracking |
| 6 | `PillsView` (row/col, icon or dot, typewriter, strike) | `long/Ui.tsx` | **built** | tags on A-roll |
| 7 | Cards: `VersusView` (✗ ---- ✓), `CalendarView` (12 months, stamps, lit months, %), `ChainView` (A → B, or × =) — Look A skin only | `long/Ui.tsx` | **built** (Look B/C skins TODO) | comparisons, timelines, cause-effect |
| 8 | `CounterView` (num / clock / dur / pct / plus, 1–2 items, full or card) | `long/Ui.tsx` | **built** | numbers |
| 9 | `PhoneMock` dark skin, screens: notifs / screentime / chat / alarm / text / dnd / apps, optional caption stack | `long/Ui.tsx` | **built** (light skins, 3-up TODO) | phone/app beats |
| 10 | `NodeGraph` (centre node, drawn connectors, end cards) | `long/Ui.tsx` | TODO | systems, workflows |
| 11 | Card shrink / grow (`enter: "shrink"`, `exit: "grow"` on any full beat) | `long/Long.tsx` | **built** | entering/leaving full-screen graphics |
| 12 | `flash` beat built; `WhipBlur`, `Dissolve` TODO | `long/Long.tsx` | partly | impacts, energy |
| 13 | `Collage3D` (screenshots/thumbnails on z-depth, camera fly-through) | `long/Ui.tsx` (CSS 3D) | TODO | "everywhere you look…", "50 videos" |
| 14 | `ChapterCard` (Look bg + snow, kicker, sliding icon carousel, neon title write-on) | `long/Ui.tsx` | **built** | each chapter / step |
| 15 | `TrackerView` N-tile checklist (intro / tick, week dots); tier list S–F TODO | `long/Ui.tsx` | **built** (checklist) | list videos |
| 16 | `LookBg` Look A navy + ice horizon glow (+ `Snow`); B/C TODO | `long/Ui.tsx` | **built** (A) | every full-screen graphic |
| 17 | 3D object scenes (Look A recipe, long-style.md section 7). `gfx3d` beat passes `cues` (word times) + `texts` overlays. Reusable kinds in `src/gfx/WinterGfx.tsx`: hourglass, globe→gold figure, battery drain, dopamine brain, two-faced phone, foundation bricks | `src/gfx/<Name>Gfx.tsx` + registry | **built** (6 kinds) | explanation beats |
| 19 | **`mg` clean motion-graphics sequence** (canvas + camera keyframes, themes teal/emerald/sky, elements text/node/link/tiles/bar/meter/chart/cycle/bubble/counter/pill, auto SFX, `fixed` text, `"word@t"` anchors) — **the default for every explanation/story graphic** | `src/long/MG.tsx` + `pipeline.py long` (`mg` branch) | **built 2026-10-23** (mtv4-long) | all MGs from 2026-10-23 on |
| 18 | Long music bed generator (80 bpm D-minor pad + bells, pulse after the hook) | `scripts/gen_music_long.py` | **built** | bed |

**Build rules**
- Build only what the approved plan uses, in table order (0 → 0b → the plan's components). Each component reads its timing from absolute cut-timeline seconds / word indices, like Cine.
- Copy patterns that already work: spring/blur text from `src/Cine.tsx`, glass without `backdrop-filter` (it drops frames in headless Chrome; see edit-log 2026-10-17 minor-builds-promo v2) from `src/promo/`, facebox placement from `pipeline.py cine`, 3D from `src/SchoolGfx.tsx`.
- Fonts: load Sora, Inter Tight and Mr Dafoe from `@remotion/google-fonts` inside `src/long/` only (Cine's 3-font set stays untouched).
- After building, run `scripts/flicker_scan.py` on the preview render, then flip the row to **built (date)** and note the props.

## v2 design system (2026-10-19, after the user's "too cartoonish and glitchy" review): use THESE first
| Need | Beat / component | File |
|---|---|---|
| Any full-screen graphic background | `DepthBg` (parallax bokeh 3 layers, light shafts, horizon glow, vignette), automatic for card beats | `src/long/Depth.tsx` |
| Comparison | `versus` → `VersusV2`: two glass panels in perspective; bad one stamped ✗ + strike + dimmed, good one gold glow + ✓. `thumb: {big, title, meta}` turns the bad panel into a cliché-thumbnail mock; `goodKicker` | Depth.tsx |
| Calendar | `calendar` → `CalendarV2`: `mode: count` (tilted 12-month grid, `headline`, `stampAts`), `mode: last3` (3 big gold tiles lighting on `lits`, `label`) | Depth.tsx |
| N-item checklist | `tracker` → `TrackerV2`: `intro` = fanned glass cards in depth that settle into a row (`intro` = times), `tick` = row with gold tick | Depth.tsx |
| Draining / filling level | `battery` {from, steps[{say,to}], lines} → `BatteryCard` (glass battery, liquid fill, colour hue by level, low-pulse) | Depth.tsx |
| Addiction / overload | `dopamine` {count, headline, neon{text,say}} → notifications flying from depth + neon heartbeat trace | Depth.tsx |
| Two sides of one thing | `phonePair` {red, gold, labels[{side,text,say}]} → realistic devices: doom feed vs focus/tasks screen | Depth.tsx |
| Phone UI | `phone` → `PhoneMock` now inside `PhoneDevice` (titanium frame, glass reflection, tilt, float) | Ui.tsx + Depth.tsx |
| Words behind the head | `behind` {text, y, size, kicker, sub, gapK} → person cut-out (`personmatte`) over giant words split either side of the face | Long.tsx + pipeline |
| Snap punch-in | top-level `punches[{start,end,scale}]` | Long.tsx |
| B-roll | `crop: [x,y,w,h]` (cut from the 4K source = sharp punch-in), `zoom: push`, `dim` | pipeline + Long.tsx |
| A-roll captions | stack `pos: "auto"` (default) → pipeline computes a clean column beside the face (`anchor`), lines ≤ 10–12 chars | Text.tsx + pipeline |
| B-roll captions | stack `pos: "lower"` (cinematic lower-third + bottom scrim) or `center` with B-roll `dim` | Text.tsx |
| 3D | `gfx3d scene: "premium"` kinds `hourglass` (transmission glass + gold) and `bullion` (stamped gold bars) — studio env map, ACES, backlight halo | `src/gfx/PremiumGfx.tsx` |
**Retired (looked cartoonish):** `scene: "winter"` kinds globe / battery / brain / phone (WinterGfx.tsx) — do not use; keep only as code reference.
**Entrances pre-roll:** every card's entrance starts ~0.2 s BEFORE its beat start so a hard cut never lands on an empty background.

## `mg` beat (2026-10-23, use THIS for motion graphics; see mg-style.md)
Worked example (5 MGs, 15–25 s each): `_engine/public/jobs/mtv4-long/edits_long.json`.
```json
{"type": "mg", "start": 34.0, "end": 58.75, "theme": "teal", "enter": "fade",
 "cam": [{"at": 34.0, "x": 0.5, "y": 0.5, "z": 1.0}, {"at": 44.0, "x": 0.6, "y": 0.48, "z": 1.1, "dur": 1.2}],
 "els": [
  {"kind": "text", "text": "let's say: ^4 days^ of gap", "at": 34.23, "y": 0.15, "size": 0.06, "font": "sora", "weight": 700, "out": 36.6},
  {"kind": "tiles", "x": 0.5, "y": 0.46, "w": 0.76, "h": 0.26, "at": 34.91, "items": [{"label": "Day 1", "icon": "sun"}],
   "states": [{"at": 38.31, "idx": [0], "dim": true, "tag": "doing nothing"}, {"at": 44.3, "idx": [2, 3], "tone": "red"}]},
  {"kind": "node", "id": "sun", "icon": "sun", "tone": "gold", "label": "Day", "x": 0.4, "y": 0.32, "at": 52.39, "size": 0.12},
  {"kind": "link", "from": "sun", "to": "moon", "at": 53.6, "bend": 0.35, "dot": true},
  {"kind": "bubble", "text": "yo bro, chill… we got this.", "icon": "brain", "x": 0.33, "y": 0.8, "at": 40.6, "out": 43.6}
 ]}
```
- Coordinates are screen fractions on the canvas (x > 1 = further right; move `cam` there). `size` = fraction of H.
- Times: `at` / `out` / `spinAt` / `ats[]` take seconds, a spoken word (first occurrence in the beat) or `"word@12.3"` (first after 12.3 s).
- `text` words are matched to the spoken words after `at` (so they pop as said); `"fixed": true` staggers them from `at` instead. Markup `^accent^ @highlighter@ !red! %green% _dim_`.
- Element keys: node `icon label sub tone size states[{at,tone,dim,strike,pulse,x,y,label}]` · link `from to dur bend tone dot arrow` · tiles `items[{label,sub,icon}] w h states[{at,idx[],tone,dim,tag}]` · bar `label w tone fills[{at,to,dur}] rough` · meter `labels[] w marks[{at,to}] ghost{at,to,label}` · chart `w h xLabels[] series[{label,tone,at,dur,pts[[x,y]]}]` · cycle `items[{label,icon,tone}] r ats[] spinAt period center count` · bubble `text icon w side` · counter `from to dur prefix suffix size label tone` · pill `text icon tone size`. Every element: `at`, optional `out`, `id` (nodes, for links).
- Icons: the `IconName` set in `src/long/Icons.tsx` (add new stroke icons there when needed).

## `edits_long.json` (as built 2026-10-19)
Worked example (approved plan, 114 beats): `_engine/public/jobs/winter-glow-up/edits_long.json`. Copy its shape.
Times are cut-timeline seconds. On-screen words are timed automatically: `pipeline.py long` matches each line's words, in order,
against `words.json` inside the beat window. Override with `"say": "<spoken word>"` (first occurrence of that word in
[start-0.6, end+0.3]) or `"at": <seconds>`. **A repeated word matches its FIRST occurrence**: anchor on a word that is unique
in the window, or use `at`.
Top level: `title, look, grade{brightness,contrast,saturate,vignette,warmth}, music{gen,volume,tailVolume,hook} | {src,volume},
angleZoom (1.28), angleOverrides[{at,scale,bw}], tracker{title,items[{icon,label}]}, labels[{text,start,end}], beats[], sfx[], autoSfx`.
Line markup: `~script~ _italic_ ^gold^ !bad! %good% @ice@` (the closing mark must END a token: `^5 minutes…^`, not `^5 minutes^…`).
Line keys: `text, size (xxl|xl|l|m|s), icon, iconColor, color, strike (word|seconds), say, at`.
| type | keys |
|---|---|
| `stack` | `lines[], pos (tl/tr/bl/br/left/right/center/top/bottom), bg (none/scrim/look), kicker, maxW` |
| `headTitle` | `left{text,say}, right{text,say}, sub[lines]` (face box filled by the pipeline) |
| `pills` | `items[{text,icon,color,say,strike}], pos, dir (row/col), bg, kicker` |
| `versus` | `bad, good` (line string or {text,say}), `kicker` |
| `calendar` | `mode (count/callback), lit, label, labelSay, pct, kicker` |
| `counter` | `items[{label,from,to,fmt (num/clock/dur/pct/plus),say,dur,prefix,suffix,color,icon}], bg (look/none), pos, kicker` |
| `chain` | `items[{text,say/at}], seps (["×","="]), kicker` |
| `chapter` | `kicker, title, icons[5], focus, titleSay` |
| `tracker` | `mode (intro/tick), done, tick (say), intro[says], week{say,label}` |
| `phone` | `screens[{kind: notifs/screentime/chat/alarm/text/dnd/apps, say, …}], side, bg, caption[lines]` |
| `broll` | `file (B-Rolls/… path), in, speed, zoom (in/out/none), grade` (proxy made automatically; `--rebuild` remakes) |
| `gfx3d` | `scene, kind, cues[says], texts[{text,say,style (title/neon/gold/bad/good/small),x,y,align}]` |
| `flash`, `snow` | `start, end` (`amount` for snow) |
Any full beat: `enter: shrink|fade`, `exit: grow|fade`. `pipeline.py long` prints `WARN look-away … not covered` for every
eye-contact range in `lookaway.json` (written during the gaze review) that full-screen beats don't cover.
