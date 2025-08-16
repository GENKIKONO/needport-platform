#!/usr/bin/env node
import { readdir, stat, access, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = '.next/server/app';
const TARGETS = ['page','layout','not-found'];

async function exists(p){ try{ await access(p); return true; } catch{ return false; } }
async function* walk(dir){
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    const s = await stat(p);
    if (s.isDirectory()) { yield p; yield* walk(p); }
  }
}

const rootOk = await exists(ROOT);
if (!rootOk) { console.log('[guard] skip (no .next/server/app yet)'); process.exit(0); }

const rootManifest = join(ROOT, 'client-reference-manifest.js');
for await (const dir of walk(ROOT)) {
  for (const base of TARGETS) {
    const codeFile = join(dir, `${base}.js`);
    const stubFile = join(dir, `${base}_client-reference-manifest.js`);
    if (!(await exists(codeFile))) continue;
    if (await exists(stubFile)) continue;
    const rel = relative(dir, rootManifest).replace(/\\/g,'/');
    const content = `export { clientReferenceManifest } from '${rel}';\n`;
    await writeFile(stubFile, content);
    console.log('[guard] created', stubFile);
  }
}
