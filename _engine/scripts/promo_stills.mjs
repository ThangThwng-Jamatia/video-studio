// node scripts/promo_stills.mjs <sec> <sec> ...   → public/jobs/minor-builds-promo/review/s_<sec>.png
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public_promo')});
const opts = {serveUrl, id: 'MinorBuildsPromo', chromeMode: 'chrome-for-testing', chromiumOptions: {gl: 'angle'}};
const composition = await selectComposition(opts);
for (const s of process.argv.slice(2)) {
  const out = path.join(root, 'public/jobs/minor-builds-promo/review', `s_${s}.png`);
  await renderStill({...opts, composition, frame: Math.round(Number(s) * 60), output: out, scale: 0.5});
  console.log('wrote', out);
}
