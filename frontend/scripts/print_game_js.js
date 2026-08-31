const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');
const lines = html.split('\n');
for (let i = 1850; i < 1960 && i < lines.length; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
