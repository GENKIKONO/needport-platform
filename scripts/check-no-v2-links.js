const {execSync}=require('node:child_process');
const out=execSync('git ls-files "*.tsx" "*.ts" | xargs grep -n \'href="/v2\' -H || true').toString().trim();
if(out){ console.error("ERROR: href=\"/v2...\" found:\n"+out); process.exit(2); }
console.log("[OK] no /v2 links");