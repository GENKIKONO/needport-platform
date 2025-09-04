const {execSync} = require('node:child_process');
try{
  const out = execSync('git ls-files "*.tsx" "*.ts" | xargs grep -n \'href="/v2\' -H || true',{stdio:['ignore','pipe','inherit']}).toString().trim();
  if(out){
    console.error("ERROR: href=\"/v2...\" links found:\n"+out);
    process.exit(2);
  } else {
    console.log("[OK] no /v2 links in code");
  }
}catch(e){ process.exit(1); }
