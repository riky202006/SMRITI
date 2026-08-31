const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');
// find all script tags
const regex = /<script[^>]*>([\s\S]*?)<\/script>/g;
let m;
let idx = 0;
while ((m = regex.exec(html)) !== null) {
  idx++;
  const scriptContent = m[1];
  const lines = scriptContent.split('\n');
  console.log(`\n=== SCRIPT BLOCK ${idx} (${lines.length} lines) ===`);
  console.log('First 5 lines:');
  lines.slice(0,5).forEach((l,i) => console.log(`  ${i+1}: ${l}`));
  try {
    new Function(scriptContent);
    console.log('  => SYNTAX OK');
  } catch(e) {
    console.log('  => ERROR:', e.message);
    // fine-grained
    for (let i = 1; i <= lines.length; i++) {
      try { new Function(lines.slice(0,i).join('\n')); }
      catch(e2) {
        console.log('  => Error at script-line', i, ':', e2.message);
        for(let j=Math.max(0,i-3); j<=Math.min(lines.length-1,i+2); j++) {
          console.log(`    ${j+1}: ${lines[j]}`);
        }
        break;
      }
    }
  }
}
