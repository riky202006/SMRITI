const fs = require('fs');
const lines = fs.readFileSync('index 3.html', 'utf8').split('\n');
let d = 0;
let devDepth = -1;
for(let i=0; i<lines.length; i++) {
  const opens = (lines[i].match(/<div/g) || []).length;
  const closes = (lines[i].match(/<\/div/g) || []).length;
  d += opens;
  if(lines[i].includes('class="device"')) devDepth = d;
  if(lines[i].includes('class="screen"')) console.log('Screen at line', i+1, 'Depth:', d, 'DevDepth:', devDepth);
  d -= closes;
}
