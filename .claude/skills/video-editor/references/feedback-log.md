# Feedback Log

The user's corrections and lasting preferences. **These override style-guide.md.** Add one dated line per preference, quoting their words where possible.

## Setup decisions (2026-10-11)
- Format follows the source folder: `Raw Clips V:O/Longs` → 16:9 long, `Raw Clips V:O/Shorts` → 9:16 short. No repurposing longs into shorts unless asked.
- Motion graphics engine: Remotion.
- Caption presets: both `gold` (Inspo2/3) and `serif` (Inspo1). Pick per video. The user can switch with one word.
- Long style: adapt the shorts style until long inspo is added.
- Cutting: tight jump cuts (pauses > 0.3 s, fillers, retakes all removed).
- Always show the edit plan and wait for "go" before rendering.
- SFX: add them like the inspo. Music: the user will fill `Music/` later. Until then, voice + SFX only.

## 2026-10-12
- **Eye contact rule:** "whenever in any part i am not looking in the camera or my eyes are not towards the camera, that part must be filled with B-Rolls or Captions, so my face isn't visible at that point." Enforced by step 3b (gaze review) in SKILL.md. Blinks are OK.
- Raw clips may arrive loose in the root. A talking-head clip of the user is a RAW clip (move to `Raw Clips V:O/Longs` or `/Shorts` by its orientation/the user's words), not B-roll.
- **Varied text placement:** "change the placements of the texts in different parts, like some on left, some on right and matching the texts placements in different angles and parts based on the B-Rolls". Never keep captions in one fixed spot. Place them per shot in the empty space, tilted to match diagonal shots. See style-guide.md → Caption placement.
- **Bigger text:** "make the texts bigger bro, they are barely visible." Small words are now 70 px (was 46), italic 86, big 150/160, with a stronger shadow. Never go smaller than this. Use `captionScale` (whole video) or placement `scale` (one shot) to adjust.
- **Text size LOCKED (2026-10-12):** "make and keep the texts size in this size". Approved in the "Working Hard But No Results" edit: small 70 px bold, italic 86 px, big 150 (gold) / 160 (serif) @1080, strong shadow. These are the defaults; don't shrink them globally. Only use per-shot `scale` (≥ 0.75) when a shot has no room.
- **Placement: approved direction, still improving.** User: "the placements could still better". Known issues from the first edit, avoid them next time:
  - Text beside a face must keep a clear gap. At 70/160 px a side block is ~0.35–0.45 of the frame width, so on punch-ins (face spans ~0.35–0.65) side text touches the cheek/hair. Fix: place side text ABOVE shoulder level but clear of the face's x-range, use `scale` 0.8 for long big words, or cover the line with B-roll.
  - Check every A-roll placement against a frame AT THE ZOOM LEVEL USED (punch-in widens the face).

## 2026-10-12 (MTVideo 2 / 3)
- **Captions CENTRED (supersedes the left/right side placement above):** "keep the captions in the centre and look clean and eye grabbing, not too corner, not too small, proper size and placements of the people's eyes should get there." Every placement uses `align: "center"`. Vertical spot per shot: A-roll → lower-centre (y ≈ 0.84, below the chin; `scale` 0.85 on punch-ins); B-roll → true centre (y ≈ 0.5) unless the subject sits there. No tilts, no corners. Sizes stay locked.
- Motion graphics are welcome where they help ("Generate and Add appropriate Motion graphics if needed"). Engine has a `graphics` layer (Graphics.tsx) for full-screen animated cards.

## 2026-10-13 (Kathakaar school project)
- **Event/project folders:** for a project the user drops as a folder (e.g. `Long Videos/School Project`), "Don't use my B-Rolls here. Use clips, videos, pic only from school project folder only." Read-only use of that folder is OK; never write into it.
- Event films use `EventFilm` (src/Kathakaar.tsx): Apple-style minimal glow hook (10 s) → assembled best takes (`body.mp4`, built by the job's `build_body.sh`) → end card. Retakes are picked by transcript (whisper `--language en` — auto-detect garbles noisy outdoor kid audio) + visuals.
- **Speech captions beside the speaker (Kathakaar):** "when the girl is speaking, add captions beside her, when the boy speaks, captions coming beside him". Implemented as glass bubbles with a tail + role label (`speech` in props, built by the job's `captions.py`): above the heads on wide row shots, beside the face where there's a gap, chest-level when heads are near the top; off-screen speakers get a top-centre bubble.
- User removed the hook's photo carousel ("Stories, written together") and asked for **Alfa Slab One** on the KATHAKAAR title. Opening statement card: "Every Story Matters, Every Voice Counts" (5 s, centred) instead of captioning the narrator's first line.

## 2026-10-13 (Kathakaar film 2: chapter film)
- **Segment/chapter films:** when the user splits an event into folders (`Segment 1/2/3`), build it chapter by chapter: black card naming the segment ("SEGMENT I" + "Classes VI – VIII" + "Younger Group"), then that segment's photos with 3–10 s clips of the best moments between them, then the next card. Use only the media inside each segment folder.
- Captions are required on every speaking part (glass bubble beside the speaker, as in film 1).
- When the user names a part of a clip to skip (e.g. Segment 3's first 5 s blackboard shot), leave it out.
- Opening quote card before the title when the user supplies one (e.g. "A classroom becomes a better place when every student feels seen, heard, and valued."), with the last phrase in gold.
- Wants a soft cinematic music bed under photo montages, ducked under speech. `Music/` is empty, so the job's `gen_music.py` synthesises one.
- Implementation: `src/ChapterFilm.tsx` (composition `ChapterFilm`), timeline + clip prep in `jobs/kathakaar-segments/build.py`.

## 2026-10-14 (new shorts inspo, Inspo4–11)
- User added 8 short-form inspos and asked: "Analyse … the fonts, the pacing, the b-roll correction, the text placements … the sfx … and restructure the editing skill in that format, because after all the raw videos i will give, you will edit them in similar or much same way."
- **Shorts now follow style-guide.md sections 1–7** (Family A Cine Lockup by default). For SHORTS this supersedes the 2026-10-12 rules above (centred lower captions at y≈0.84, locked 70/150 px sizes, whoosh per B-roll, pop per big word). Those rules stay in force for LONGS.
- Eye-contact rule (2026-10-12) still applies to shorts. Cover look-aways with inserts first.
- **2026-10-14 decisions:** (1) "Keep and edit all horizontal, i will later turn them in 9:16". ALL shorts render 16:9 (1920×1080), whatever the raw orientation (vertical raw → ask before cropping or pillarboxing). (2) "No need to use movie clips, use my own b-rolls, those were just examples". Family A inserts come from `B-Rolls/` only; there's no Film Clips folder.

## 2026-10-14 (after the Cine test)
- **No black letterbox opener:** "don't add that balck screen opener". Shorts start straight on the picture (`letterbox: 0`). The black END card stays.
- **Fonts: min 2, max 3 per video:** "add only max upto 3 types of fonts … many fonts makes it look bad". The Cine engine now uses exactly 3 families: **Inter Tight** (captions, heroes, heavy/grotesk lockup words, behind-person words, end card), **Playfair Display** (didone caps + italic-serif chunks/words), **Pinyon Script** (script accent words). No Fraunces, Bodoni, Oswald or Outfit. A video may use only 2 of them.

## 2026-10-14 (placement, music, format rules), all ENFORCED in the Cine engine
- **Captions never cover the talking face:** "When my face is there and i am speaking, the captions should not hide my talking face, they should either be below my chin or somewhere else in the background where space is there - left or right." `pipeline.py cine` (anchor "auto", the default) tracks the face with Apple Vision (`scripts/facebox`) and puts every A-roll caption/hero below the chin, or left/right of the face, whichever allows the biggest text. Big heroes that don't fit go on an insert, become a behind-person word, or shrink to caps below the chin. Punch-in zooms only where the text still fits (watch the `WARN small text` lines).
- **No music unless the user clearly asks for it:** "don't add music, unless told clearly by myself to do so." SFX (swell_hit, boom) are fine.
- **Text on B-roll: free placement** ("your wish, left, right, corner, middle, anywhere"), but **minimalistic, clean, attractive**: 1–4 words, at most 2 typefaces and 3 lines per lockup, lots of breathing room.
- **Opening hook (not every video):** "in the starting of the videos, not everytime, but try to use bolder and big texts in middle or in the eye areas where people look at phone part." `heroes[].hook: true` = Inter Tight 800 italic caps at 0.22 H, centred at eye level (y 0.40), auto-fit to width. Use in about 2 of 3 videos, first 0.5–2.5 s. The only text allowed over the face.
- **Under 1 minute = short, automatically:** "For Videos Shorter than 1 min, automatically understand that they are short videos, even if they are recorded in 16:9, they will later be converted to 9:16." Any raw < 60 s → short (Cine, 16:9), whatever folder or orientation.
- **Safe zone, nothing in the corners:** "Don't try to keep the texts in too corner, keep all slightly towards centre … like, share buttons will hide them." All text anchors clamp to x 0.10–0.88, y 0.10–0.86 (in Cine.tsx and the placer). Lockup anchors start at x ≥ 0.12.

## 2026-10-14 (lean physique long brief)
- Prioritize the opening second: user asked for "70% of the creativity, energy, time" on the hook.
- For this transformation, root IMG_0725.JPG / IMG_0726.JPG / IMG_0730.JPG are "2 years ago"; IMG_0265 2.MOV / IMG_0266 2.MOV are "now". Use the user's assigned chronology.
- Missing exercise B-roll: use talking head + captions. Filler treatment: simple, smooth, minimal black-and-white Apple-style animation and motion graphics. This overrides legacy gold styling for this edit.

### 2026-10-15 — Lean physique examples
Use supplied real photos for the two physique examples. Add subtle green body-part annotations timed to the exact spoken terms: a belly highlight and a shoulder-width line. Markers should follow any photo motion.

## 2026-10-17 (Voice Edit style, new skill)
- New inspos in `Inspiration Video Edits/Shorts/BG Voice Edits/` = voice-over + music, 100% B-roll, fast cuts on word beats, small captions + script words. The user approved the demo `bgv-demo`.
- **Routing:** "Voice Edit" → `voice-edit` skill. "my edit" (or a plain "edit …") → this video-editor skill, the standard style.
- Voice Edit answers: audio is usually voice+music in one file (sometimes separate stems); mostly English, sometimes Hinglish; the user keeps adding B-roll; **no black/end card**; pacing depends on the video (demo pace OK).

## 2026-10-17
- **Cuts too tight:** "the clips are cut out too early even before completing my sentences, instead of 0.3s, make it 0.6s". Jump-cut with `--gap 0.6` (only pauses > 0.6 s removed) and `--pad 0.25` so sentence-final words ("leverage.", "yes.") keep their tails. Check the last word before the end card is not clipped (the Cine render can drop ~60 ms right at talkEnd; extend the last segment slightly if needed).
- **3D explainers welcome on story videos:** user asked for "3d motion graphics and simulations … at the points where the crucial parts is" (school video). Engine: `gfx` inserts (engine.md).

## 2026-10-18 (first Voice Edit)
- "Use my best 16:9 B-rolls": Voice Edits use horizontal clips only (no `_vertical`).
- "Do not cut out the music part after the BG words end, that few sec of music after the motivational words is required, add a b-roll there as well." Keep the music tail after the last word, and cover it with one calm B-roll shot (no text).

## 2026-10-18 (6 new Voice Edit inspos)
- User added 6 voice-edit inspos (filed to `Inspiration Video Edits/Shorts/BG Voice Edits/`: Video-51915, -64895, -6565, -7229, -81662, -97082) and asked to edit them all: keep each one's BG music + voice, rebuild the picture with MY B-rolls and new captions in the inspo's style. Variations are documented in the voice-edit skill.
- **Export quality:** "1080p or 4K, best suitable for Instagram". IG caps Reels at 1080p, so render 1080p at CRF 14 / x264 slow / BT.709 tags, with B-roll proxies at 24 Mbps. Applies to all edits now.

## 2026-10-18 (hooks)
- "the First 2 sec is not hooking enough for people" (I Just Gotta Adapt). **Every voice edit needs a hook in the first second:** text on screen from frame 0 (the payoff line or the first line as a small grotesk + big script lockup), fast beat-synced cuts of energetic shots (training, motion, travel), and an `impact` hit at 0.0. Never open on a quiet, empty, text-free shot, even when the music intro has no voice.

## 2026-10-19 (long inspo added)
- 3 long inspos analysed → new **long-video-editor** skill. All LONG edits now follow it (`long-video-editor/references/long-style.md` + its own feedback-log). The 2026-10-12 long caption rules (centred y≈0.84, gold/serif) are legacy, used only if the user asks for the old long look.

## 2026-10-22 (MTVideo 4/5/6 re-edit)
- **16:9 B-roll only on a 16:9 talking head:** "The talking head is in 16:9, so use only the b-rolls which are in that ratio." No `_vertical` clips as inserts in 16:9 shorts (centre-cropped vertical clips look wrong). Exception the user approved: the phone-feed clip in "Your Feed Is Programming You", where the phone itself is the subject.
- **Smaller captions, never over the face:** "try making the captions smaller. they are covering my face too much." Engine defaults now: body captions 0.065 H (was 0.11), lockups/heroes ×0.75, A-roll heroes 0.14 H, **hook moved off the face** to below the chin (y 0.80, 0.12 H; supersedes the 2026-10-14 eye-level hook), insert captions on a low line (`insertAnchor` y 0.82).
- **Every spoken word must be captioned:** "some captions aren't getting tracked or generated". Cause: words spoken while a hero/lockup was up were dropped. Fixed in `pipeline.py cine`: lockups clear 0.45 s after their last covered word (`hold` per lockup, `lockupHold` per video), words under a hero/lockup are deferred to right after it, and the build prints `WARN uncaptioned words` for anything that never reaches the screen. Fix every warning before rendering (fold the words into the lockup, shorten `hold`, or move an insert edge).
- On a shot with the user posing, keep lockups on the empty wall side, never over the head/body.

## 2026-10-23 (two shorts modes)
- User added 3 new short inspos (`Talking Heads/Video-85495.mp4`, `Video-81219.mp4`, `Inspo3.mp4`): "re structure the editing skill for shorts. Two types of shorts edits. If i say 'Professional' you edit these way - the one that i just uploaded the inspirations of; if i say 'normal' or say nothing, edit the way it was before." → Pro mode = `pro-style.md`; Normal = style-guide.md unchanged.
