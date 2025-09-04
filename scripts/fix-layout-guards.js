const fs=require('fs');
const f='src/app/(ui2)/_layout/SiteHeader.tsx';
if(fs.existsSync(f)){
  let s=fs.readFileSync(f,'utf8');
  if(!/z-40/.test(s)) s=s.replace(/className="([^"]+)"/,'className="$1 z-40"');
  fs.writeFileSync(f,s);
  console.log('[OK] header z-index hardened');
}
const g='src/app/globals.css';
if(fs.existsSync(g)){
  let css=fs.readFileSync(g,'utf8');
  if(!/html, body/.test(css) || !/overflow-x:\s*hidden/.test(css)){
    css += `\nhtml,body{overflow-x:hidden}\n`;
    fs.writeFileSync(g,css);
    console.log('[OK] overflow-x hidden ensured');
  }
}
