const fs = require('fs');
const lines = fs.readFileSync('index 3.html', 'utf8').split('\n');
for(let i=975; i<990; i++) console.log(i+1, lines[i]);
