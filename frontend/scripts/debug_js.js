const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) { console.log('No script tag found'); process.exit(1); }
const script = match[1];
const lines = script.split('\n');
// Try to find error line
try {
  new Function(script);
  console.log('JS OK');
} catch(e) {
  console.error('Error:', e.message);
  // Try to narrow it down
  for (let i = 10; i <= lines.length; i += 10) {
    try {
      new Function(lines.slice(0, i).join('\n'));
    } catch(e2) {
      console.log('Error around line', i, ':', e2.message);
      console.log('Context:', lines.slice(Math.max(0,i-5), i).join('\n'));
      break;
    }
  }
}
