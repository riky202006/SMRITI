const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');
const regex = /<script[^>]*>([\s\S]*?)<\/script>/g;
let m;
let idx = 0;
while ((m = regex.exec(html)) !== null) {
  idx++;
  // Decode HTML entities before checking
  let scriptContent = m[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&copy;/g, '©')
    .replace(/&nbsp;/g, ' ');
  
  try {
    new Function(scriptContent);
    console.log(`SCRIPT ${idx}: OK (${scriptContent.split('\n').length} lines)`);
  } catch(e) {
    const lines = scriptContent.split('\n');
    console.log(`SCRIPT ${idx}: ERROR - ${e.message}`);
    for (let i = 1; i <= lines.length; i++) {
      try { new Function(lines.slice(0,i).join('\n')); }
      catch(e2) {
        console.log(`  => Error at script-line ${i}:`, e2.message);
        for(let j=Math.max(0,i-4); j<=Math.min(lines.length-1,i+3); j++) {
          console.log(`    ${j+1}: ${lines[j]}`);
        }
        break;
      }
    }
  }
}
