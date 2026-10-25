# Style Guide (from Inspiration Video Edits): NORMAL mode

> 2026-10-23: this file is the **Normal** shorts mode (default). "Professional" shorts follow `pro-style.md`. Note: `Inspo3.mp4` in the inspo folder was replaced on 2026-10-23 by a Pro inspo; row 3 below describes the old legacy file.

Last full analysis: **2026-10-14**, Inspo4–11 (8 new shorts). Method: 3 fps contact sheets of every second, 30 fps strips of each animation, full-res frames for font ID, scene-cut detection, log spectrograms, EBU R128 loudness and transient analysis.
`Inspiration Video Edits/Long/` is still empty. Longs keep the legacy rules at the bottom.

Units: **H** = frame height, **W** = frame width, so sizes work for 16:9 and 9:16. Times are seconds.

## 0. Inspo inventory

| Inspo | File (orig) | Len | Format | Family | What it is |
|---|---|---|---|---|---|
| 1 | Inspo1 | 37 s | 16:9 | legacy | founder/discipline, filmic (gold/serif presets came from 1–3) |
| 2 | Inspo2 | 67 s | 9:16 | legacy | talk-to-camera, gold big word |
| 3 | Inspo3 | 53 s | 9:16 | legacy | product explainer |
| 4 | Video-36596 | 16.5 s | 16:9 | **A Cine Lockup** | car talk + 3 film inserts + "DO IT FIRST" end card |
| 5 | Video-55686 | 73.6 s | 9:16 | **C Creator Pop** | personal story, numbered tips, UI cards, CTA |
| 6 | Video-60991 | 21.6 s | 16:9 | **A Cine Lockup** | desk talk + Lucky Baskhar inserts, behind-person words, "VOLUME MAKES SUCCESS INEVITABLE" |
| 7 | Video-21484 | 34.8 s | 16:9 | **B1 Side Notes** | one static take, no cuts, text-only (English) |
| 8 | Video-37225 | 22.0 s | 16:9 | **A Cine Lockup** | plane seat talk + inserts, "TWO RETURNS" end card |
| 9 | Video-24128 | 21.8 s | 16:9 | **A Cine Lockup** | car talk + 4 inserts, "DON'T DO MORE. MAKE MORE HAPPEN." |
| 10 | Video-47997 | 24.0 s | 16:9 | **B2 Script Cloud** | one take, dark desk, script word cloud, red-word end card |
| 11 | Video-7208 | 20.2 s | 16:9 | **A Cine Lockup** | podcast clip + 3 inserts, logo end card |

**BG Voice Edits/** (Video-55024, -60891, -77806, -82975, -99684; 10–15 s, voice-over + music, 100% B-roll) are the reference for the separate **voice-edit** skill (`.claude/skills/voice-edit/SKILL.md`), not for these families.

(Video-97612 and Video-70038 were byte-identical duplicates of 4 and 8 and were deleted.)
All 8 new ones are mastered at **-14.0 LUFS integrated**, true peak about -2 dBTP (Inspo5 clips at +3).

## 1. Pick the family per video

| Family | Use when | Shape |
|---|---|---|
| **A · Cine Lockup** (DEFAULT for shorts) | motivational / opinion / "one idea" shorts, 15–35 s | hook reveal → A-roll with word-append captions → 3–4 film/B-roll inserts carrying typographic lockups → black end card with the thesis line |
| **B1 · Side Notes** | one clean continuous take, calm explanatory tone, nothing to cut to | no cuts; small notes either side of the face, heavy key words, centred final line |
| **B2 · Script Cloud** | one take, moody/night/story tone | no cuts; small sans + huge calligraphic word clusters, big gradient word behind the person, red-accent end card |
| **C · Creator Pop** | longer personal story (45–75 s), lists ("number 1/2/3"), product/CTA, vertical-native | many cuts, centred chest captions, coloured glow words, number headers, glass pills, UI cards, light-leak flashes |

**User rules (2026-10-14, override everything below; details in feedback-log):** (1) **No black letterbox opener**: start straight on the picture. (2) **Captions/heroes NEVER cover the talking face**: below the chin, or left/right of it (auto, face-tracked). (3) **No music** unless the user asks. (4) **Safe zone** x 0.10–0.88, y 0.10–0.86: no text in corners. (5) **B-roll text**: free placement, minimal (1–4 words, ≤ 2 faces, ≤ 3 lines). (6) **Hook** (about 2 of 3 videos): big bold caps at eye level for the first 0.5–2.5 s, the only text allowed over the face. (7) **2–3 font families per video, never more.** The inspos mix 5–7 faces; we map every role onto **Inter Tight** (all sans roles), **Playfair Display** (didone caps + italic serif) and **Pinyon Script** (script accent). Font names below that are not one of these three describe the inspo, not what we use.

Shared across all families: **hard cuts only** (no slide/zoom transitions, except the C light-leak flash). **A music bed is always on.** Every pause is cut. Captions are always in the spoken language, romanised (Hinglish stays Hinglish: "kuch karne se pehle", not translated).

---

## 2. Family A: Cine Lockup (Inspo4, 6, 8, 9, 11)

### 2.1 Timeline template (16–22 s)

| Segment | Time | Content |
|---|---|---|
| Hook reveal | 0 → 1.9 | ~~Letterbox open~~ **NOT USED (user: no black opener). We open straight on the first shot.** Inspo did: starts fully black, a horizontal slit opens from the centre to full frame, easeInOut (cubic), about 1.9 s (Inspo9: 0.08 s thin line, 0.5 s about 18% of H, 1.0 s about 35%, 1.5 s about 75%, 1.9 s full). Captions run from the first word, inside the slit. |
| Body | 1.9 → end-3 | A-roll talk with jump cuts every 1.2–5 s. **3–4 inserts** (Inspo6 has 5), the first at 2.0–4.6 s, one every 3–5 s after that. |
| End card | last 3.0 s | Hard cut to pure black on the final word. The thesis line (see 2.7) holds about 2.6 s, then fades. Voice is over, so the music comes forward. |

Measured shot lists:
- Inspo4: A 0–2.07 · **film** 2.07–2.97 · A 2.97–8.03 (jump cuts 4.07, 4.87, 6.17) · **film** 8.03–11.07 · **film** 11.07–12.30 · A 12.30–13.47 · **END** 13.47–16.46
- Inspo9: A 0–4.60 (jump 2.97) · **film** 4.60–5.47 · A 5.47–8.13 · **film** 8.13–8.97 · A 8.97–13.90 · **film** 13.90–14.93 · A 14.93–18.10 · **film** 18.10–18.60 · **END** 18.60–21.8
- Inspo11: A 0–2.57 · **film** 2.57–3.93 · A 3.93–6.87 · **film** 6.87–8.43 · A 8.43–11.13 · **film** 11.13–12.03 · A 12.03–17.63 · **END (logo)** 17.63–20.2
- Inspo8: A 0–7.03 (jumps 3.73, 4.73, 6.63) · **film** 7.03–7.90 · A 7.90–11.63 · **film** 11.63–12.87 · A 12.87–18.43 · **END** 18.43–22.0
- Inspo6: A 0–1.87 · **film** 1.87–4.40 · A 4.40–5.00 · **film** 5.00–6.63 · A 6.63–10.43 · **film** 10.43–12.60 · **film** 12.60–15.37 · A 15.37–18.43 · **END** 18.43–21.6

Numbers: insert length **0.5–1.5 s** (median 0.9; Inspo6 runs 1.6–2.8). Inserts cover **20–35%** of the body. A-roll shots run 0.6–5 s. Something changes on screen (cut, caption word, or hero) **every 0.3–0.6 s**.

### 2.2 Inserts ("film inserts")
- They're short **iconic film/series moments** whose mood matches the line (power pose for "genius", a crowd for "not be successful", a sad close-up for "din kharab kar diya", a wealthy office for "pehle mai karta"). Used so far: Wolf of Wall Street ×3, The Social Network ×2, Iron Man 1 ×2, Lucky Baskhar ×5, Pursuit of Happyness, Meet Joe Black, First Man, a runner on a bridge at night.
- **Cut in on the hero word** (the insert's first frame = the word's first frame) and cut out on the next phrase. No transition.
- The insert carries the **lockup** (2.4) for that phrase. The A-roll caption line before it often ends on the same word ("…kuch karne se pehle" → insert "PEHLE / mai Karta").
- **Our source: the user's own `B-Rolls/`** (user, 2026-10-14: no movie clips). Pick the B-roll whose mood/action best matches the phrase; the same timing and lockup rules apply.

### 2.3 Body captions ("word-append")
- **Font:** Inter Tight 700 (looks like Helvetica Now Display Bold), **lowercase** as spoken, tracking **-0.055em**, white, soft shadow `0 2px 12px rgba(0,0,0,.35)`. No box, no outline, no colour.
- **Size:** font-size **0.105–0.12 H** (≈ 115–130 px at 1080 tall). In 9:16 use 0.055 H (≈ 105 px at 1920).
- **Reveal:** words **append one by one, hard-on** (no fade, no pop) on their spoken frame: `agar` → `agar tum` → `agar tum volume` → `agar tum volume me`. The chunk clears at the phrase boundary, and the next chunk starts empty.
- **Chunk:** 1–5 words, max about 20 characters, **one line**. Never two lines.
- **Position (OUR rule, not the inspo's):** below the chin, or beside the face, chosen per chunk from face tracking (`anchor: "auto"`). The inspo puts captions over the chin/chest at 0.45–0.55 H; the user rejected covering the face. Horizontal: left-aligned from x 0.10–0.20 W (car shots, Inspo4/9), or centred on the speaker (Inspo8/11). It may overlap the speaker's chin or neck. That's the look; it never covers the eyes.
- **Italic serif variant:** soft Hindi tail phrases ("kaam kar rhe ho", "hota hai", "guaranteed hai", "karna nahi hai", "paise mil gae") are set in **Fraunces Italic 300–400** (or Playfair Display Italic) at the same size, same anchor. Use it for about 1 chunk in 4 for rhythm.

### 2.4 Hero words and lockups (the signature)
**Hero word** (1 per 3–5 s, about 4–6 per 20 s): the key English word, **UPPERCASE, Inter Tight 800 Italic**, tracking -0.04em, font-size **0.20–0.24 H**, white. It **replaces** the caption chunk: the chunk clears, then 2–3 empty frames, then the hero cuts on at full size with no animation and holds **0.5–1.0 s**. Examples: GENUINELY, QUANTITY, GUARANTEED, REALISE, REGRET, WHO THINKS.
- Optional **chrome fill** on inserts: vertical gradient `#FFFFFF → #9EC7F5 → #FFFFFF → #6F8FB5` (Inspo4 "PEHLE"), or silver `#FFFFFF → #8E8E8E → #FFFFFF` (RETARD, ITNA, SUCCESSFUL).

**Lockups** = 2–4 words stacked, **each word in a different face**, tightly overlapping (line-height 0.75–0.85, script words overlap the line below by about 30%). Built one word per spoken word, appended. Faces:

| Role | Font | Notes |
|---|---|---|
| script | **Pinyon Script** (alt Great Vibes), white or teal-chrome `#CFE9E6 → #6FA9A6 → #F2FFFF` | the emotional/abstract word: *duniya, cheez, absolutely, being, volume, work, Jab, Kaam, Do, The, Become, Scared* |
| didone | **Bodoni Moda** 400 roman (alt Playfair Display), often CAPS | *YOU, LESS, Outcome*; tall, high contrast |
| serif italic caps | **Playfair Display Italic** CAPS | *WHO DOES* |
| grotesk bold | Inter Tight 700 lowercase | *returns hote, lag, mein agar, sirf ek, hai* |
| heavy italic caps | Inter Tight 800 Italic | *PEHLE, RETARD, ITNA* (often chrome) |

Sizes in a lockup: script 0.20–0.26 H, grotesk 0.10–0.13 H, didone caps 0.16–0.20 H.
Placement: **upper-left** of the frame (x 0.04–0.10 W, top at 0.08–0.30 H), or upper-right when the insert's subject is on the left (Meet Joe Black: "Jab / lag / gayi" at x 0.6). On A-roll, lockups sit in the empty side beside the head (Inspo6 "Is *duniya* mein agar sirf ek *cheez* hai" over the left shoulder).
Frequency: 1 lockup per insert, plus 1–2 on A-roll.

### 2.5 Words BEHIND the person (depth text)
A huge word sits **between the background and the person**, so the head and shoulders occlude it. 1–3 per video, always on a payoff word.
- **Condensed tall:** Oswald 500 / Bebas Neue, UPPERCASE, font-size **0.75–0.90 H** (letters fill the frame height), fill `rgba(255,255,255,.80)` or a warm gradient `#FFF6E6 → rgba(255,220,170,.55)`, spanning about 0.9 W. Examples: KAAMYAABI, SUCCESS, KUTTON, INEVITABLE, IF YOU, LATER (Inspo10, warm orange → transparent bottom).
- **Red heavy:** Inter Tight 800 (Helvetica Bold look), `#FF1A1A`, 0.18–0.22 H, top band y 0.06–0.20 H, the head breaking the middle letters: GENIUS, IDENTITY RETURN, success, KARWANA (+ script "hai." in white).
- Timing: the front word comes first ("YOUR"), and the behind word lands about 0.3 s later on its spoken frame, holds 0.8–1.2 s, then hard-off. It can appear for one frame at 92% size, then 100% (a micro pop).
- Engine: person matte from Apple Vision (`personmatte`, see engine.md), with the text layer drawn under the alpha-cut foreground.

### 2.6 Colour grade (Family A)
Rich and warm: contrast +10–15%, saturation +10%, warm highlights, slightly teal shadows, mild vignette. Film inserts keep their native grade. **No letterbox after the reveal** (full 16:9).
Small **creator tag** top-right (Inspo8): a name in Inter Tight 600 at 0.022 H with a 2 px red bar on its left, at x 0.88 W, y 0.06 H, always on.

### 2.7 End card
- Pure black `#000`. One line, **the thesis of the video in ≤ 6 words**, written by the editor (not a transcript line): "DO IT FIRST", "TWO RETURNS", "DON'T DO MORE. MAKE MORE HAPPEN.", "VOLUME MAKES SUCCESS INEVITABLE", "Start now !! this is the time".
- Typeface, pick one: **Outfit 700 CAPS**, tracking +0.03em, 0.045 H (Inspo4/8/9, a rounded geometric look), or **Inter Tight 800 Italic CAPS** 0.03 H (Inspo6). It's small: the line spans only 20–45% of W. Centred at y 0.50 H.
- Animation: 0.25–0.35 s of black, then either a whole-line fade-in over 0.3 s (Inspo4/8/9) or **word-by-word blur-in** (each word blur 12 px → 0 + opacity 0 → 1 over 0.3 s, words 0.15 s apart, Inspo6). Hold, then fade out over the last 0.4 s.
- Optional: a warm film-burn / light-leak flash crossing the card once (Inspo8, about 0.6 s), or a brand logo orb above the line (Inspo11).
- Audio: a **sub-bass boom** on the cut to black. The music bed comes up to full level.

---

## 3. Family B1: Side Notes (Inspo7)
- One static medium close-up, **zero cuts** for 34.8 s. Grade: moody, desaturated green-teal, crushed blacks.
- **Small lines:** Inter Tight 500, sentence case, 0.033 H, white 90%. **Heavy words:** Inter Tight 800, tracking -0.06em, 0.075 H (*real flex is?*, *disappearing*, *Just quietly*, *coming out*, *themselves*, *yesterday*, *today*, *disappear*, *results speak*).
- **Layout:** text blocks sit **left of the face** (left-aligned at x 0.06 W) and **right of the face** (right-aligned at x 0.94 W), at eye/cheek height (y 0.25–0.55 H). A new block appears on the opposite side, and both sides can stay up together (left = setup, right = continuation). The vertical spot changes every sentence (top / mid / low) so text never sits in one place.
- **Entrance:** each phrase **fades in from 30% grey, rising about 0.03 H with a slight blur, over 5 frames (0.33 s), easeOut**. Heavy words land under their small line ("Do you know / what the / **real flex is?**"). Blocks clear together at the sentence end.
- **Ending:** the final line goes **centred over the face**, larger ("and let your / **results speak**"), and holds to the end. No end card.

## 4. Family B2: Script Cloud (Inspo10)
- One take (20.8 s), dark warm room, **heavy radial lens-blur vignette** at the frame edges (centre sharp, edges blurred, about 25% of W), then a red-accent end card (3 s).
- **Small:** Inter Tight 600 lowercase/sentence case, 0.035 H, white, words spaced out and appended. **Script:** Pinyon Script with a silver-blue chrome gradient (`#FFFFFF → #9FB6CF → #FFFFFF`), 0.13–0.16 H, overlapping the small words (*chuka, genuinely, know, origin, living, chapters, outlive, moment, struggle*).
- Clusters build around the speaker's hands/chest (centre x 0.45–0.65 W, y 0.45–0.75 H) and move to a new spot each sentence.
- **Highlight bar:** a translucent warm band (`rgba(150,80,30,.55)`, full width, 0.07 H tall) behind a spaced-out phrase ("Baat   wo   hai   na   that").
- **Behind-person gradient word:** APNI LIFE MEIN / LATER, Oswald 600 at 0.40–0.55 H, warm-white → transparent gradient, occluded by the head.
- End card: Inter Tight 600, 0.045 H, two lines centred, **key words in red `#E01B22`** ("Today's **struggles** may become / tomorrow's **origin story**"), word blur-in.

## 5. Family C: Creator Pop (Inspo5, vertical)
- 73.6 s, **about 37 cuts (avg 2.0 s)**. A-roll punch-ins alternate, and B-roll of the creator doing what he says (editing, reading, gaming, unboxing) runs 1–3 s.
- **Captions:** Inter 600 (SF Pro look), 1–4 words, words as spoken (Title Case or lowercase), 0.036 H (≈ 70 px at 1920), white, soft shadow + faint white glow, **centred, y 0.58–0.62 H (on the chest)**. They replace chunk by chunk (no word-append).
- **Colour words**, about 1 per 5 s: gradient + glow (purple `#B44CFF → #FF5FD2`, red `#FF2B2B` + red glow, green `#3DFF5C` for money/achievement), 1.6–2× size, sometimes with a 3D emoji beside them (🤑, 📄, 📞).
- **Number headers:** "NUMBER" in Montserrat 900 Italic CAPS with a purple→magenta gradient and outer glow, a small outlined "01/02/03" overlapping above it, then the tip title on 2 lines in the same style (BECOME STRONG / MENTALLY), on the chest, held 1.5–2.5 s.
- **Glass pill:** captions on B-roll sit in a dark glass pill (`rgba(20,20,22,.88)`, radius 0.022 H, 1 px inner border `rgba(255,255,255,.18)`, padding 0.012 H × 0.03 W), y about 0.6 H.
- **UI cards:** a YouTube channel card (avatar, name ✓, subscribers, Subscribe) pops in when credentials are mentioned. On the CTA, an Instagram follow card with an animated cursor tap → "Following".
- **Transitions:** a purple/white **light-leak flash** (0.25–0.35 s) between sections, one blur-zoom. Everything else is hard cuts.
- **Ending:** CTA "Book a **1-1 Consultation**" (pink glow + 📞), then the follow card. The last 3 s have no captions.

---

## 6. Audio (all families)
- **Master: -14 LUFS integrated**, true peak ≤ -1 dBTP (the pipeline already does this).
- **Music bed: OFF by default (user rule). Only add one when the user explicitly asks.** Inspo reference: ALWAYS on, start to end. Measured floor vs voice peaks: -12 dB (Inspo9) to -23 dB (Inspo6). Target the bed at **about -18 dB under the voice** while talking (`music.volume` about 0.16, `duckTo` about 0.10; duck gently, because the bed should stay audible). Style: emotional/cinematic (piano, pads, soft strings) with a slow kick or 808. Inspo4's end card drops into heavy 808 hits every 1.07 s.
- **End card:** the bed rises to full level (voice is gone) and a **sub-bass boom** (+40–50 dB in the < 150 Hz band) lands on the cut to black (Inspo4 13.47, Inspo9 18.73, Inspo11 18.78).
- **Hero/insert hits:** about one per hero word or insert entrance, a **short swell (0.2–0.3 s) into a soft hit** on the word's frame (Inspo9 QUANTITY 2.34, success 5.11, GUARANTEED 6.28, KARWANA 18.18; Inspo4 GENIUS 11.76). Volume about 0.3–0.4. Use `riser` (trimmed to 0.3 s) + `impact`/`boom`.
- **No** whoosh per cut, **no** pop per caption word, **no** clicks. Lowercase captions are silent.
- Family C uses more: whoosh on the light-leak flashes, a pop on colour words, a click on UI-card taps.

## 7. Planning checklist for a short (what the plan must list)
1. Family (A / B1 / B2 / C) and format (see SKILL.md "Format").
2. Hook: the first spoken line under the letterbox reveal (A), or the first block (B).
3. Caption chunks with word-append times (auto) + which chunks use the italic serif.
4. Hero words (A: 1 per 3–5 s) with their times.
5. Inserts: line → clip (Film Clips/ or B-Rolls/) → in-point → start/end, each with its lockup text and faces.
6. Behind-person words (1–3) with the shot they sit on.
7. End-card line (≤ 6 words, the thesis) + typeface + animation.
8. Music track + hit/boom times.
9. Look-away coverage (eye-contact rule still applies; inserts are the first choice to cover them).

---

## 8. Legacy presets (Inspo1–3); LEGACY longs only
**Superseded 2026-10-19:** long edits follow `long-video-editor/references/long-style.md` (measured from `Inspiration Video Edits/Long/`). Use this section only when the user asks for the old gold/serif long look.
Implemented in `_engine/src/Captions.tsx` (`preset: "gold" | "serif"`).
- `gold`: Inter 700 small words 70 px @1080, big word Inter 800 150 px with a gold gradient (#FFF3C4 → #F4D27A → #C9952E) and glow.
- `serif`: big word Inter 900 160 px white. Small line Inter 700 70 px + Instrument Serif italic 86 px for the emotional word.
- Long density: 1 big word per 6–10 s, headlines on the hook + every chapter + CTA, visual change every 3–5 s, B-roll 30–40%, punch-ins 1.0 ↔ 1.10–1.15.
- Long caption placement (feedback-log 2026-10-12): centred; A-roll y ≈ 0.84, B-roll y ≈ 0.5; sizes locked as above.
- Accents: `brackets` (hook viewfinder), `redbar` (alarming word, ≤ 2), `flash` (before→after).
- Legacy SFX habit (whoosh per B-roll, pop per big word) is **for longs only**. Shorts follow section 6.
