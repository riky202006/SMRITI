const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');
const regex = /<script[^>]*>([\s\S]*?)<\/script>/g;
let m;
let scriptNum = 0;
while ((m = regex.exec(html)) !== null) {
  scriptNum++;
  if (scriptNum !== 2) continue;
  
  let scriptContent = m[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&copy;/g, '©')
    .replace(/&nbsp;/g, ' ');
  
  const lines = scriptContent.split('\n');
  
  // Check lines 1-15 individually
  for (let i = 1; i <= Math.min(15, lines.length); i++) {
    console.log(`  Line ${i}: [${lines[i-1]}]`);
  }
}
