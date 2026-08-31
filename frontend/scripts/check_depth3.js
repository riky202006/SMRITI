const fs = require('fs');
const lines = fs.readFileSync('index 3.html', 'utf8').split('\n');
let d = 0;
for(let i=0; i<lines.length; i++) {
  const opens = (lines[i].match(/<div/gi) || []).length;
  const closes = (lines[i].match(/<\/div/gi) || []).length;
  d += opens;
  d -= closes;
  if(lines[i].includes('class="screen"')) {
    console.log('Screen at line', i+1, 'Depth:', d);
  }
}
console.log('Final depth:', d);
