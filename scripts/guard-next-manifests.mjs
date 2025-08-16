// scripts/guard-next-manifests.mjs
import { promises as fs } from 'fs';
import path from 'path';

const appDir = path.join('.next', 'server', 'app');
const want = new Set([
  'page_client-reference-manifest.js',
  'layout_client-reference-manifest.js',
  'not-found_client-reference-manifest.js',
]);

const exists = async (p) => {
  try { await fs.access(p); return true; } catch { return false; }
};

async function walk(dir) {
  let ents = [];
  try { ents = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
  await Promise.all(ents.map(async (ent) => {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) return walk(full);

    // 対象ディレクトリごとに必要な manifest を確認
    if (ent.name === 'page.js' || ent.name === 'layout.js' || ent.name === 'not-found.js') {
      for (const file of want) {
        const manifestPath = path.join(dir, file);
        if (!(await exists(manifestPath))) {
          // ルートの client-reference-manifest を "再エクスポート" する stub を書く
          const stub = `export { clientReferenceManifest } from '../client-reference-manifest.js';\n`;
          await fs.writeFile(manifestPath, stub, 'utf8');
          console.log('[guard] created', manifestPath);
        }
      }
    }
  }));
}

await walk(appDir);
