// scripts/guard-next-manifests.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.next/server/app');
if (!fs.existsSync(ROOT)) {
  console.log('[guard] .next/server/app not found, skip');
  process.exit(0);
}

function ensureManifest(jsFile) {
  const dir = path.dirname(jsFile);
  const base = path.basename(jsFile, '.js'); // 'page' など
  const manifest = path.join(dir, `${base}_client-reference-manifest.js`);
  if (!fs.existsSync(manifest)) {
    fs.writeFileSync(manifest, 'export default {};');
    console.log('[guard] created', path.relative(process.cwd(), manifest));
  }
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (ent.isFile() && /^(page|layout|not-found)\.js$/.test(ent.name)) {
      ensureManifest(full);
    }
  }
}

walk(ROOT);
