# "Professional" Shorts Style (measured 2026-10-23)

Trigger: the user says **"Professional"** (e.g. "Professional edit of MTVideo 7", "make it professional").
"Normal", "my edit" or no word → the Cine system in `style-guide.md` (unchanged).

Source inspos (`Inspiration Video Edits/Shorts/Talking Heads/`):
| Tag | File | Len | Format | What it is |
|---|---|---|---|---|
| **P1** | `Video-85495.mp4` | 28.0 s | 9:16 | "trending BG songs" tip: album-cover cards, retention-graph card, gradient hero words, comment pill + bookmark CTA |
| **P2** | `Video-81219.mp4` | 21.2 s | 9:16 | "five meme sounds" countdown: waveform cards above the head, number tile on the chest, view-counter card |
| **P3** | `Inspo3.mp4` | 52.1 s | 4:3 (landscape) | "referrals" story: tight word-cluster captions beside the face, light pastel MG cutaways, iOS notification/chat UI |
| (P4) | `Motion Graphics/Video-52743.mp4` | 23.1 s | 9:16 | same creator as P1/P2 ("steal these 3 viral SFX"): green waveform cards, phone-card inset on a white canvas |
Reference sheets: `references/frames/pro-*.jpg` (2 fps, 5×4 tiles = 10 s per sheet).

## 1. The idea in one line
One clean take, **one idea per sentence made visible as a floating UI object** (card, pill, number tile, notification, chat bubble) placed in the empty space around the speaker, plus **2-tier captions**: small light words that build, then a big gradient key word that lands under them. Everything glows softly; nothing is cartoonish; one accent colour family per video.

## 2. Caption system (2 tiers)
**Tier 1, small build line** (P1/P2/P4):
- Wide geometric grotesk, lowercase, **Unbounded 400–500** (Google; the inspo face is a wide Clash/Syne-like grotesk), white 90 %, size **0.028 H in 9:16 / 0.045 H in 16:9**, tracking −0.01 em, soft shadow `0 2px 10px rgba(0,0,0,.35)`.
- Words **append one by one with a 4-frame blur-in** (blur 8 → 0 px, opacity 0 → 1, no y move). Max 2 lines, ≤ 28 chars per line.
- Position: **centred on the chest**, just under the chin (y 0.52–0.62 H in 9:16; 16:9: y 0.70–0.80 H). Never over the mouth/eyes.

**Tier 2, hero key word** (1 per 3–5 s):
- **Unbounded 800–900 CAPS**, tracking −0.02 em, **1.9–2.4 × tier-1 size**, sits directly under the tier-1 line (line gap 0.15 em), centred.
- Fill is a vertical gradient + matching glow (`drop-shadow(0 0 18px <c>.55)`):
  - **blue** (default) `#BFE3FF → #3EA2FF` (GRAVITY, THE VOICE, ICONIC, SOUNDS, PUNCHLINE, EMPHASIS, SUPER INTENTIONAL)
  - **yellow** `#FFF3A0 → #FFC21A` (SHORT, 3 VIRAL SFX, TEXT REVEAL, PAYOFF)
  - **red + 🔥** `#FF8A7A → #FF2A2A` (HOT TAKES), for controversial/hot words only
  - **white** `#FFFFFF → #D8E4F0` for the first line of a 2-line title (TRENDING / FIVE MEMES / STEAL THESE)
- Entrance: blur 12 → 0 + scale 1.12 → 1 over 6 frames (ease-out cubic); a dim "ghost" copy can trail 2 frames (P4 TEXT REVEAL). Holds until the phrase ends, then both tiers clear together (blur-out 4 frames).
- **Title lockup** (first 1–3 s): 2 lines of tier-2 caps, white line + coloured line ("TRENDING / BG SONGS", "FIVE MEMES / SOUNDS", "STEAL THESE / 3 VIRAL SFX"), on the chest, held while the first sentence is spoken.

**Tier 3, word-cluster captions** (P3, landscape talking head; use for 16:9 Pro):
- **Plus Jakarta Sans 800**, tracking −0.055 em, **line-height 0.78** (lines overlap), sentence case as spoken, white; the **last 1–2 words of each phrase in the blue accent gradient** `#9CC6FF → #3F7BFF` with glow.
- Stacked 2–4 short lines (1–2 words each), **ragged/centred cluster**, size 0.075–0.095 H (16:9). Words appear one by one with blur-in + slight rise (0.02 H); a cluster can also arc along a curve for one word ("service", "Picture").
- Position: **beside the face**, alternating left cluster / right cluster per phrase (x 0.12–0.38 or 0.62–0.88 W, y 0.20–0.70 H), never across the face; both sides may be up together ("not only because" left + "it feels natural" right).
- Clears at the phrase end (blur-out, 4 frames).

## 3. Floating UI objects (the "professional" part)
All sit in front of the chest or above the head, **never over the face**, at 0.25–0.45 W wide (9:16) / 0.18–0.30 W (16:9), with a soft outer glow in the object's colour and a 1 px white 20 % inner border. Entrance: scale 0.8 → 1 + blur 10 → 0 + opacity over 6–8 frames (ease-out back 1.4); exit: blur-out 4 frames or scale down into the next object.
| Object | Seen in | Use when the line names… |
|---|---|---|
| **Cover / thumbnail card**: square art + title + small subtitle under it, glowing edge; 2–3 can fan in a row then collapse to one | P1 (Inception "Time", "Aruarian Dance", "Weightless") | a product, song, video, app, book |
| **Stat card**: dark glass, title bar ("Reel insights"), line chart that draws in (magenta `#FF3DBE`) | P1 retention graph, P3/16532 view graph | a metric, growth, drop-off |
| **Number tile**: dark rounded square, 1 px blue border `#3EA2FF` + glow, big white numeral | P2 countdown 5 → 1 | numbered lists (counts down or up) |
| **Waveform card**: coloured rounded rect (pink/purple/blue/green), white waveform, tiny ♪ + title in italic tech font | P2, P4 | sounds, audio, voice |
| **Phone/reel card**: 9:16 inset of a video in a thin white frame with corner ticks, view counter that rolls (1K → 698K, yellow eye icon) | P1, P2, P4 | "this video got…", examples |
| **Comment pill**: avatar + dark glass pill with one word + blue ↑ send button; then a **white bookmark icon** pops under it | P1, P2 endings | the CTA ("comment X", "save this") |
| **App pills**: stacked rounded pills with app icon + name, each its own pastel tint (Swiggy/Wise/Airbnb) | P3 | lists of brands/options |
| **iOS notification stack**: white glass banner, app icon, bold title, 1-line body, stacks with depth | P3 (PayPal Payouts, Wise Rewards, Swiggy Rewards; Instagram "jason share a reel") | rewards, messages, "you get notified" |
| **Chat bubble**: white bubble with tail + memoji avatar, text **types on letter by letter**, grows in width | P3 ("Oh, I'm glad you really enjoy…") | quotes / "what you could say is" |
| **Timer pill**: black pill, red countdown ring with number, white label | P3 ("05 window" → 26 → 30) | time windows, deadlines |

## 4. Full-screen cutaways
- **Light pastel canvas** (P3): soft gradient `#F4FFF6 → #E8FFE9` (mint) or `#FFF1F1` (pink), heavy blur blobs, objects float in the centre with soft shadows; small caption in Plus Jakarta 700 dark under the object ("is the one you"). 1.5–3 s, enter with a quick zoom-blur.
- **White canvas + phone card** (P4): pure white, the reel card floats centre with a waveform card under it.
- **Light-blue canvas** (16532): `#FFFFFF → #5B8CFF` diagonal, frosted pyramid / cards building step by step (see the long MG guide, it's the same kit).
- B-roll cutaways: 0.5–1.2 s, can get a one-frame **colour-invert flash** on entry (P1 "forgetting").

## 5. Pacing, grade, audio
- Talking head is one continuous take with tight jump cuts; **subtle punch-ins** (1.0 ↔ 1.08) on hero words; occasional whip-blur zoom between sections (P3/16532).
- Something new on screen every **0.8–1.5 s** (a word, a hero, an object).
- Grade: clean, slightly cool, soft contrast; no heavy warmth. No letterbox, no black end card: the video ends on the **CTA pill + bookmark** (or on the last hero word).
- Audio: inspos are **−14 LUFS with a continuous music bed** (no gaps below −30 dB). **User rule still wins: no music unless the user asks** (ask in the plan). SFX: soft `pop` per UI object, `whoosh` on cutaways, `click` per typed bubble word, `ding` on the bookmark, `swell_hit` on title/hero words (≤ 0.3 volume).

## 6. Fonts (max 3, user rule)
**Unbounded** (tier-1 + tier-2 captions, titles) · **Plus Jakarta Sans** (word clusters, UI text, pills, cards) · **Inter Tight** (small UI meta text). For a 16:9 talking head, Plus Jakarta clusters (tier 3) replace tier 1/2 for the body and Unbounded is used only for the title lockup + hero words.

## 7. Plan checklist (Pro)
1. Format (16:9 per the user's shorts rule; 9:16 only if the user says so), mode = Professional.
2. Title lockup (first sentence) text + colours.
3. Caption tier per section (chest 2-tier for vertical-feeling shots; side clusters for wide 16:9).
4. Hero words (1 per 3–5 s) + colour each.
5. UI objects: sentence → object type → content → position (left/right of face, chest, above head).
6. Cutaways (pastel/white canvas or B-roll) for look-aways and abstract lines.
7. Ending: CTA pill + bookmark, or the last hero.
8. Music question + SFX list.
