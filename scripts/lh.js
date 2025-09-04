const { execSync } = require("child_process");
const url = process.argv[2] || process.env.LH_URL;
if(!url) { console.error("Usage: node scripts/lh.js https://needport.jp/v2"); process.exit(1); }
const cmd = `npx lighthouse ${url} --quiet --chrome-flags="--headless" --only-categories=performance --output=json --output-path=stdout`;
const out = execSync(cmd, { stdio: ["ignore","pipe","inherit"] }).toString();
const rep = JSON.parse(out);
const score = (rep.categories.performance.score || 0)*100;
console.log("Lighthouse Perf:", score);
if(score < 85){ console.error("Perf score < 85. Needs attention."); process.exit(2); }
