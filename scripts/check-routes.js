const fs = require('fs'); const path = require('path');
const root = path.join(process.cwd(), 'src/app');
const seen = new Map();
function walk(p){
  for(const e of fs.readdirSync(p,{withFileTypes:true})){
    const full = path.join(p,e.name);
    if(e.isDirectory()) walk(full);
    if(e.isFile() && /page\.tsx?$/.test(e.name)){
      const route = full.replace(root,'').replace(/\/page\.tsx?$/,'').replace(/\(.*?\)\//g,'/').replace(/\/+/g,'/').replace(/\/$/,'')||'/';
      if(seen.has(route)) { console.error("DUP ROUTE:", route, "->", seen.get(route), "and", full); process.exitCode=1; }
      else seen.set(route, full);
    }
  }
}
walk(root);
console.log("[OK] no route collision");
