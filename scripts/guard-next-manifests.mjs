// scripts/guard-next-manifests.mjs
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = '.next/server/app';
const STUB = `export { clientReferenceManifest } from '../client-reference-manifest.js';\n`;

async function ensure(file, content) {
  try { await fs.access(file); }
  catch {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, content, 'utf8');
    console.log('[guard] created', file);
  }
}

async function walk(dir) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); }
  catch { return; }

  const files = new Set(entries.filter(e => e.isFile()).map(e => e.name));
  for (const base of ['page','layout','not-found']) {
    if (files.has(`${base}.js`)) {
      await ensure(path.join(dir, `${base}_client-reference-manifest.js`), STUB);
    }
  }
  await Promise.all(entries.filter(e=>e.isDirectory()).map(e => walk(path.join(dir, e.name))));
}

await walk(ROOT);
