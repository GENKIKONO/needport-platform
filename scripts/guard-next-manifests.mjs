// scripts/guard-next-manifests.mjs
// Next 14/15 で稀に欠ける per-route client manifest を後追い生成
import { promises as fs } from 'fs';
import { join, dirname } from 'path';

const ROOT = '.next/server/app';
const STUB = `export { clientReferenceManifest } from '../client-reference-manifest.js';\n`;

async function ensure(file, content) {
  try { await fs.lstat(file); } catch {
    await fs.mkdir(dirname(file), { recursive: true });
    await fs.writeFile(file, content);
    console.log('[guard] created', file);
  }
}

async function walk(dir) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); }
  catch { console.log('[guard] skip (no', dir, 'yet)'); return; }

  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { await walk(p); continue; }
    if (/(^|\/)(page|layout|not-found)\.js$/.test(p)) {
      await ensure(p.replace(/\.js$/, '_client-reference-manifest.js'), STUB);
    }
  }
}

await walk(ROOT);
