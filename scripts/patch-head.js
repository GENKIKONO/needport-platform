const fs = require('fs'), f = 'src/app/layout.tsx';
if (!fs.existsSync(f)) process.exit(0);
let s = fs.readFileSync(f,'utf8');
if (!/rel="preconnect" href="https:\/\/fonts\.gstatic\.com"/.test(s)) {
  s = s.replace('</head>', `
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="dns-prefetch" href="//fonts.googleapis.com"/>
    <meta httpEquiv="x-dns-prefetch-control" content="on" />
  </head>`);
}
if (!/font-display:\s*swap/.test(s)) {
  // globals.css に swap 指示が無ければ軽く追加
  const g='src/app/globals.css';
  if (fs.existsSync(g)) {
    let css = fs.readFileSync(g,'utf8');
    if (!/font-display:\s*swap/.test(css)) {
      css += `\n@font-face{font-display:swap;}\n`;
      fs.writeFileSync(g, css);
      console.log('[OK] add font-display: swap');
    }
  }
}
fs.writeFileSync(f,s);
console.log('[OK] head preconnect + swap patched');
