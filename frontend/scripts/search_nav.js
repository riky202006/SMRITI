const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

console.log('Includes bottom-nav:', html.includes('bottom-nav'));
console.log('Includes nav-item:', html.includes('nav-item'));
console.log('Includes id="nav-home":', html.includes('id="nav-home"'));

const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('nav-') || l.includes('bottom-nav')) {
    console.log(`Line ${i+1}: ${l}`);
  }
});
