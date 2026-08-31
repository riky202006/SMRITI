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
  // Try from line 1 up
  for (let i = 1; i <= lines.length; i++) {
    try { new Function(lines.slice(0,i).join('\n')); }
    catch(e) {
      // now try line i and i+1 to confirm
      let prevOk = false;
      try { new Function(lines.slice(0, i-1).join('\n')); prevOk = true; } catch(e2) {}
      if (prevOk) {
        console.log(`\nFirst REAL error at script-line ${i}: ${e.message}`);
        for(let j=Math.max(0,i-5); j<=Math.min(lines.length-1,i+4); j++) {
          console.log(`  ${j+1}: ${lines[j]}`);
        }
        process.exit(0);
      }
    }
  }
  console.log('No error found!');
}
