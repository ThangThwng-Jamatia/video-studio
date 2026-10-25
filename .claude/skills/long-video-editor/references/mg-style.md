# Clean Motion Graphics for longs (measured 2026-10-23, user rule)

**User, 2026-10-23:** "use similar types of clean motion graphic animations in my long videos, not like before but the new clean style whenever editing the long video and adding motion graphics to any point."
So every explanation / story graphic in a long edit is built with the **`mg` beat** (`src/long/MG.tsx`), not the old Look A/B/C cards (versus, calendar, battery, dopamine, phonePair, 3D props). Those stay in the engine only as code reference.

Source: `Inspiration Video Edits/Motion Graphics/` (sheets in `frames/mg-*.jpg`, 2 fps, 5×4 = 10 s per sheet)
| Tag | File | What it shows |
|---|---|---|
| **TASK** | `Sazzad_rafizzz_ssspin.io_…mp4` (66 s, 16:9) | SaaS ad on **dark emerald**: word-by-word headline, user icon with orbit rings of app icons, glowing glass orb that swallows the icons, tilted product UI screens with green rim light, typewriter URL pill |
| **OPEDGE** | `opedge_co_ssspin.io_…mp4` (27 s, 16:9) | **dark teal + film grain**, blurred gear silhouettes; glowing cyan 3D-ish icons joined by thin hand-drawn curve lines, labels typed under each, **yellow highlighter underline** sweeping under key words, camera pans across a big node canvas |
| **PYRAMID** | `Video-16532.mp4` (38 s, 4:3) | talking head ↔ **light-blue canvas**: frosted pyramid built layer by layer (Facts → Explanation → Application → Stories), tilted white cards ("listicles", "Rankings"), then the mini pyramid sits beside the head on A-roll |
| **SFX3** | `Video-52743.mp4` (23 s, 9:16) | (shorts) waveform cards + white canvas phone card. Belongs to the Pro shorts style |

## 1. The rules that make it "clean"
1. **One canvas, one camera.** A graphic is a 10–25 s sequence on one canvas; new ideas appear in new places and the camera glides there (1.2–1.6 s ease-in-out) instead of cutting to a new card. Constant slow push (+0.5 %/s).
2. **One accent colour per video** (teal cyan `#5fd8ec`, emerald mint `#3ef0a6`, or sky blue `#3f6fff`); red only for the "bad" idea (panic, deadline), green for the good one, gold for temptation/average. White text, grey (60 %) sub text.
3. **Everything glows a little, nothing is cartoonish**: glass discs with a specular highlight and an outer glow for icons, 1.5 px light borders on glass tiles, thin 2.4 px connector lines with a soft glow. Flat stroke icons inside the discs (no emoji, no toy 3D).
4. **Text appears on the spoken word**: word-by-word blur-in (blur 10 → 0, rise 0.18 em, 7 frames). Accent words in the accent colour with glow; the payoff word gets the **highlighter underline** that sweeps left → right 0.18 s after the word.
5. **Lines draw, labels type.** Connector lines draw from node to node (0.6–0.8 s, a bright spark at the drawing head, optional travelling dot afterwards). Labels under icons type on at ~32 chars/s.
6. **Background is alive but quiet**: deep radial gradient, 2 huge blurred gear/ring silhouettes rotating very slowly (teal), soft light arcs (emerald) or white blobs (sky), drifting dust, live film grain at 7 %, vignette. It parallaxes against the camera.
7. **Big and full**: the main object fills 50–70 % of the frame width; text 0.045–0.065 H, headlines Sora 700 0.06–0.11 H. No small things floating in an empty screen (2026-10-19 rule still holds).
8. **Hold the payoff**: the beat ends ≥ 0.8 s after its last payoff word (2026-10-20 rule).

## 2. Themes
| `theme` | Background | Accent | Use for |
|---|---|---|---|
| `teal` (default) | `#12343d → #040d10` radial, gears, grain | cyan `#5fd8ec`, highlighter `#d9f75c` | stories, mindset, school/life, anything moody |
| `emerald` | `#0f4a36 → #010805`, light arcs | mint `#3ef0a6` | business, money, growth, tools |
| `sky` | white → `#5b8cff` diagonal, white blobs | blue `#3f6fff`, dark text | tutorials, frameworks (pyramid), bright/positive topics |

## 3. Element vocabulary (`mg` beat `els[]`, all coordinates in screen fractions, `x` > 1 = off to the right on the canvas)
| kind | Looks like | Use when the line… |
|---|---|---|
| `text` | word-by-word line, `^accent^ @highlighter@ !red! %green% _dim italic_` | every beat: the headline / the spoken key phrase |
| `node` | glowing glass icon disc + typed label/sub; `states` change tone, dim, strike, pulse, move | names a thing, person, feeling, cause |
| `link` | drawn curve between two nodes (`bend`, `arrow`, `dot`, `tone`) | cause → effect, "leads to", "connected" |
| `tiles` | row of glass tiles (DAY 1…), `states` light/dim/red them with a tag pill | days, steps, options, a timeline |
| `bar` | progress bar with %, `rough` = striped "not properly" fill | progress, energy, "covered the syllabus" |
| `meter` | red → gold → green track with labels, marker slides, dashed `ghost` = potential | quality, "good not great", ratings |
| `chart` | line graph that draws in, label at the end of each line | "if you start today vs last minute", growth |
| `cycle` | nodes on a ring, arcs with arrows draw in, then a comet circles with a lap counter ×N | loops, habits, "again and again" |
| `bubble` | glass chat bubble with avatar disc, text types on | inner voice, quotes ("yo bro chill…") |
| `counter` | big Sora number rolling | numbers, money, days |
| `pill` | glass pill with icon, typewriter text | tags, tasks, "sure you can ✓" |

## 4. Recipe per graphic (what to plan)
1. The sentence span it covers (10–25 s; core story/explanation parts; cover the look-aways first).
2. The **one metaphor** for the whole span (timeline of days, loop, cause-effect graph, quality meter, two-line chart, pyramid).
3. Element list in spoken order with the anchor word for each `at` (numbers from `words.json`; `"word@12.3"` = first "word" after 12.3 s), and where the camera moves.
4. Its end: last payoff word + ≥ 0.8 s.
Density for a 3-min story video: **4–6 MGs of ~15–25 s** (≈ 50–65 % of the runtime), the rest A-roll with minimal captions + clean B-roll cuts.

## 5. Sound
Auto (pipeline): whoosh on the beat entrance, soft `pop` (0.13) per node/tile/pill/bar/meter/chart, `click` per bubble, faint `whoosh` (0.07) per drawn line, `glitch` on red states, `ding` on green states, `riser` when a cycle starts spinning. Keep it light; never two SFX within 0.15 s (pipeline enforces).

## 6. Captions around the graphics (unchanged user rules)
- Captions are **clean and minimal**: occasional small centred line **below the chin/neck** (`stack pos: "bottom"`, size `s`), key words **hopping to the free side beside the face** (`stack side: "auto"`, size `m`, 1–3 short lines), and on B-roll a lower-third (`pos: "lower"`). Not every sentence gets text; raw / story videos get even less.
- No running subtitles unless the user says "subtitles on".
