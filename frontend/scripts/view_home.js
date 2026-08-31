const fs = require('fs');
const lines = fs.readFileSync('index 3.html', 'utf8').split('\n');
let start = lines.findIndex(l => l.includes('id="screen-home"'));
for(let i=start; i<start+20; i++) console.log(i+1, lines[i]);
