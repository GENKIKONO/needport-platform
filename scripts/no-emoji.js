const { execSync } = require("child_process");
const diff = execSync("git diff --cached --name-only", {encoding:"utf8"});
if(!diff.trim()) process.exit(0);
const files = diff.split("\n").filter(Boolean).filter(f=>/\.(tsx?|css|md|json)$/.test(f));
const rx = /[\u{1F300}-\u{1FAFF}]/u; // emoji range
for(const f of files){
  const txt = require("fs").readFileSync(f,"utf8");
  if(rx.test(txt)){ 
    console.error(`❌ 絵文字検出: ${f}`);
    process.exit(1);
  }
}
