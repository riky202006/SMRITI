const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('go =') || l.includes('function go(')) {
    console.log(`Line ${i+1}: ${l}`);
  }
});
