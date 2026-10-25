import {Config} from '@remotion/cli/config';

// The default chrome-headless-shell crashes on this Mac: its GPU helper can't find
// icudtl.dat ("icudtl.dat not found in bundle") -> "GPU process isn't usable" -> Target closed.
// Chrome for Testing is a full .app bundle and renders fine.
Config.setChromeMode('chrome-for-testing');
// WebGL (three.js 3D motion graphics, src/SchoolGfx.tsx) needs ANGLE in headless Chrome.
Config.setChromiumOpenGlRenderer('angle');
