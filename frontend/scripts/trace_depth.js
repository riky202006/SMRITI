const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const htmlOnly = html.slice(0, scriptStart);
const lines = htmlOnly.split('\n');
let depth = 0;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  const openDivs = (l.match(/<div/gi) || []).length;
  const closeDivs = (l.match(/<\/div/gi) || []).length;
  const prevDepth = depth;
  depth += openDivs;
  depth -= closeDivs;
  // Only print significant changes
  if (i >= 1155) {
    console.log(`L${i+1} [depth ${depth}]: ${l.trim().slice(0,80)}`);
  }
  if (depth < 0) console.log('** WENT NEGATIVE **');
  if (i > 1240) break;
}
