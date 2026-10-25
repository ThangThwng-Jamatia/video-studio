// node scripts/day_stills.mjs <CompositionId> <outDir> <sec> <sec> ...   → <outDir>/s_<sec>.jpg (one bundle, 0.4 scale, angle GL)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [id, outDir, ...secs] = process.argv.slice(2);
const pub = process.env.PUBLIC_DIR ?? path.join(root, 'public');
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: pub});
const opts = {serveUrl, id, chromeMode: 'chrome-for-testing', chromiumOptions: {gl: 'angle'}, timeoutInMilliseconds: 120000};
const composition = await selectComposition(opts);
for (const s of secs) {
  const out = path.join(outDir, `s_${s}.jpg`);
  await renderStill({...opts, composition, frame: Math.min(composition.durationInFrames - 1, Math.round(Number(s) * composition.fps)), output: out, scale: 0.4, imageFormat: 'jpeg'});
  console.log('wrote', out);
}
