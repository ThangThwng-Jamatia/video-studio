# Video Editing Workspace

This folder is the user's video editing studio. Claude edits raw clips into finished videos in the style of `Inspiration Video Edits/`.

**For any editing request, use the `video-editor` skill** (`.claude/skills/video-editor/SKILL.md`), except **long videos → `long-video-editor` skill** (`.claude/skills/long-video-editor/SKILL.md`). Short commands should just work:

| User says | Do |
|---|---|
| **"Voice Edit"** (+ file) | **`voice-edit` skill**: voice-over/music → 100% fast B-roll cuts + small captions + script words, no end card. Inputs: `Raw Clips V:O/Voice Edits/` or the named file |
| **"my edit"** | `video-editor` skill for shorts (Normal mode = Cine); for a long clip → `long-video-editor` skill |
| **"Professional"** (+ a short) | `video-editor` skill, **Professional mode** (`references/pro-style.md`: 2-tier gradient hero captions, side word clusters, floating UI cards). "normal" or no word = Normal mode as before |
| "edit the new long" / "edit the new video" | **`long-video-editor` skill** on the unedited clip(s) in `Raw Clips V:O/Longs` (hook showcase, Looks A/B/C, chapter cards, IMAN-style 3D) |
| "edit the new short(s)" | the same for `Raw Clips V:O/Shorts` |
| "edit <name>" | the same for that file |
| "use serif" / "use gold" | switch caption preset (legacy longs only) |
| "Look A/B/C", "subtitles on" | long edits: switch the Look (cinematic navy-gold / brand red / clean SaaS) or add subtitles |
| "go" (after a plan) | build + render the approved plan |
| "update the style" / "I added inspo" | re-analyse `Inspiration Video Edits/`: Shorts → `video-editor/references/style-guide.md`, Long → `long-video-editor/references/long-style.md` |
| **"build it"**, "how to build a ___", "next build" | **`build-it-3d` skill**: 3D cutaway-diorama "How to build a ___" shorts (fast AI voice, fix chain, one-word captions). Folder `Build It 3D/` |
| **"dark fable"**, "2d fable", "2d cinematic", no-voice movie-style animation | **`dark-fable-2d` skill**: 2D no-voice cinematic self-improvement longs (everyman + glowing demon, counter HUD, piano score). Folder `Dark Fables 2D/` |
| **"day series"**, "Day 2", "next day", "ADRIFT" | **`day-series` skill**: low-poly 3D "Day N" survival-scenario shorts (AI voice, HUD, cliffhangers). Folder `Day Series/` |
| **"paper animation"**, a script in `Paper Animations/Video Scripts/`, "animate <topic>" | **`paper-explainer` skill**: 2D paper-style animation + AI voice + music/SFX, original script & characters |
| "add 3D / motion graphics / simulations" | in a long edit: the clean `mg` kit (`long-video-editor/references/mg-style.md`); 3D only if asked (`3d-motion-graphics`) |
| "I added b-roll" (in root or a folder) | `broll-check`, then view, rename, file into the right `B-Rolls/` folder and add to `broll-library.md` |

## Folders
- `Raw Clips V:O/Longs`, `Raw Clips V:O/Shorts`: inputs (read-only)
- `B-Rolls/`: B-roll by category (read-only)
- `Inspiration Video Edits/`: style reference (read-only)
- `Edited Videos/Long`, `Edited Videos/Shorts`: outputs
- `SFX/`, `Music/`: sound library
- `Long Videos/`: the user's own edits. Never touch.
- `Thumbnails/`: the user's thumbnails (reference only)
- `Build It 3D/`, `Dark Fables 2D/`: each has `Inspirations/`, `Scripts/`, `Completed/`, `Thumbnails/`
- `Paper Animations/`: everything for paper-explainer videos: `Video Scripts/` (.md scripts), `Inspirations/` (style refs), `Completed/Long` + `Completed/Shorts` (outputs). More subfolders may appear; check before each job
- `_engine/`: Remotion + pipeline scripts, job working files, edit log

## Rendering permission
The default `chrome-headless-shell` crashes on this Mac everywhere, sandbox or not (`icudtl.dat not found in bundle` → `GPU process isn't usable` → `Target closed`). `_engine/remotion.config.ts` therefore sets Chrome for Testing; don't remove it. Props must be `{plan: …}` (the pipeline writes `props.json`); passing a bare `plan.json` silently renders a 5 s black placeholder.

Remotion's Chrome still needs to run outside Claude Code's Bash sandbox. So `npx remotion still|render` commands must run unsandboxed: get them via `pipeline.py … --dry`, then run them from `_engine/` as standalone commands (no `cd … &&` prefix), so a `sandbox.excludedCommands` entry for `npx remotion` matches.

If that still fails (the harness enforces the sandbox), the user renders from Terminal with `~/Documents/Videos/_engine/render.sh <slug>`.
