const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('let appData') || l.includes('var appData') || l.includes('const appData')) {
    console.log(`Line ${i+1}: ${l}`);
  }
});
