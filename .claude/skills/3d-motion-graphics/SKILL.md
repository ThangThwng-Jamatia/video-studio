---
name: 3d-motion-graphics
description: Use when the user asks for 3D motion graphics, 3D animation, simulations, explainer animations or "easier to understand" visuals in a video edit (shorts or longs), or when a crucial story/explanation moment has no fitting B-roll and a dark card or plain caption would undersell it.
---

# 3D Motion Graphics (three.js inside Remotion)

## Overview
Story-locked 3D explainer shots rendered by `@remotion/three` inside `_engine`. **Core principle:** every motion is a pure function of the ABSOLUTE cut-timeline second, keyed to word times in `jobs/<slug>/words.json`, so the 3D acts out the sentence as it is spoken. One shared world model per video; each shot is a camera move plus animation state over it.
Worked example (approved by the user, "really sick"): `_engine/src/SchoolGfx.tsx`, used in `Edited Videos/Shorts/How I Became My School's Video Editor.mp4`.

## When to use
- The user asks for 3D / motion graphics / simulations / "make it easier to understand".
- Story turning points (someone enters, shouts, everyone looks), abstract ideas (aura, reputation, motivation), numbers that change (meter, counter), objects with no footage (a dish, a product, a device).
- Look-away ranges with no fitting B-roll: a 3D shot covers them better than a dark card.
**Not for:** every sentence (3–6 shots per video, 2.5–5 s each); lines where real B-roll of the user exists and fits better.

## Workflow
1. **Pick beats** from `transcript_cut.txt` and `words.json`: crucial moments, look-aways, abstract ideas. Note each word's start time.
2. **Storyboard in the edit plan** (one table row per shot: time · spoken line · what the 3D shows · camera move · tags/bubbles/meters). This is part of video-editor step 5: wait for "go".
3. **Build:** copy `template/SceneGfx.tsx` (this skill's folder) to `_engine/src/gfx/<Name>Gfx.tsx`. Fill `SHOTS`, story-state functions (positions/yaws/values as functions of `t`), `camAt`, the world, and the overlays. Register it in `_engine/src/gfx/registry.tsx` (`GFX_SCENES.<id> = <Name>Gfx`) and its test comp in `Root.tsx`.
4. **Preview the shots alone** (fast loop): render the test comp at `--scale=0.5`, tile 12–20 frames with ffmpeg `select`, look, fix, repeat.
5. **Wire into the edit.**
   - Shorts (Cine): add inserts to `edits_cine.json`: `{"name":"g_x","gfx":"<kind>","gfxScene":"<id>","start":S,"end":E,"capAnchor":{"x":0.5,"y":0.86,"align":"center","scale":0.8}}`. Remove heroes, lockups, behind-words and dark cards that overlap the shot (they fight the 3D). Then `pipeline.py cine`, preview, QA, final, master.
   - Longs / voice-edit / anything else: render the shot to a silent mp4 with the `GfxClip` composition and use it as a normal B-roll file (below).
6. **Log it** in `_engine/edit-log.md`. Keep the previous final in `jobs/<slug>/review/`.

## Quick reference
| Task | How |
|---|---|
| Test all shots | `cd _engine` then `npx remotion render src/index.ts <Name>GfxTest public/jobs/<slug>/gfx_test.mp4 --scale=0.5 --crf=26 --concurrency=50% --frames=0-N` (unsandboxed) |
| One still | add `--gl=angle` to `npx remotion still …` (render uses the config's ANGLE automatically) |
| Shot as B-roll mp4 | `npx remotion render src/index.ts GfxClip out.mp4 --props='{"scene":"<id>","kind":"<kind>","start":S,"end":E}' --muted --concurrency=50%` |
| Labels on 3D points | `projector(cam,W,H)(p)` → `<Tag>` / `<Bubble>`; same `camAt` drives the canvas and the labels |
| Who looks where | figures have eyes on +z; `yawTo(from,to)`; turn waves = delay by distance |

## Effect recipes (copy from `_engine/src/SchoolGfx.tsx`)
| Effect | Function |
|---|---|
| Crowd of figures, rows/aisles, a highlighted ME | `SEATS`, `Person`, `Hall` |
| Walk with bob, two-segment path, turn on arrival | `teacherAt`, `principalAt` |
| Audience turning toward one person (wave) | `studentYaw` |
| Sound/shout rings flying A→B | `ShoutRings` |
| Gaze lines from many heads to one target | `GazeLines`, `lineObj` |
| Spotlight cone | `Spot` |
| Value meter (bar + signed number, colour green→red, shake) | `auraAt`, `AuraMeter`, `auraColor` |
| Glowing pillar, orbiting particles, burst ring | `Aura` |
| Food/object: lathe bowl, 2000 instanced grains, soft steam sprites | `Bowl` (LatheGeometry, InstancedMesh, CanvasTexture sprite) |

## Look (keep consistent across videos)
**Long videos:** use the IMAN "Cinematic Story" recipe instead (warm spotlight scenes, velvet/gold/money materials, object metaphors: podium, brick-stack word, money rain, drain vortex, slot machine, anvil → ingot): `long-video-editor/references/long-style.md` §7. The capsule-figure look below is the shorts default.

- Background `#07080b` with fog 9→30, ambient 0.32, cool key light, one warm practical, radial vignette overlay.
- Stylised capsule figures with eyes: crowd slate `#6b7280`, the user/ME amber `#ffb347` (+ glow), other key characters in their own hue (cream, teal) with a pill **Tag** naming them.
- Overlays use **Inter Tight only** (the 3-font rule still applies). White speech bubbles, Inter Tight 800 italic.
- 0.12 s fade-in per shot; one smooth camera move per shot (`Easing.inOut(Easing.sin)`).

## Common mistakes
| Problem | Fix |
|---|---|
| A head fills the frame at the start of a shot | the camera starts behind/near a figure: move the camera or the figure's start point |
| Two tags overlap / figures overlap from the camera | offset the figure diagonally (between rows AND columns) or move the camera to the side; raise one tag |
| A character from another shot blocks the subject | show shot-specific characters only in their shot (`teacher={kind==='shout'}`) |
| Steam/smoke looks like grey balls | use sprites with a radial-gradient `CanvasTexture`, additive-free, low opacity |
| Objects tinted blue/odd colours | check coloured point lights near the subject; warm them or drop the intensity |
| Captions sit on the action | `capAnchor` bottom-centre at scale 0.8 (not below 0.75: user's size rule) |
| `WARN small text 0.72x` after wiring | that's the capAnchor scale, raise it to 0.8 |
| Render sits at 0% CPU forever (no frames) | default concurrency opens too many WebGL contexts: always pass `--concurrency=50%` |
| Render fails / black canvas | ANGLE must be on (`remotion.config.ts` sets it), and render outside the Bash sandbox |
| Old visuals still show | remove overlapping dark-card inserts, heroes, lockups and behind-words for the shot's range |
