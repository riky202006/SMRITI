const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);
const script = match[1];
const lines = script.split('\n');
// Fine-grained search
for (let i = 1; i <= lines.length; i++) {
  try {
    new Function(lines.slice(0, i).join('\n'));
  } catch(e2) {
    console.log('Error at script line', i, ':', e2.message);
    for(let j = Math.max(0,i-3); j <= Math.min(lines.length-1, i+2); j++) {
      console.log((j+1)+':', lines[j]);
    }
    break;
  }
}
