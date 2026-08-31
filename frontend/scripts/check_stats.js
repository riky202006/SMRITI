const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

const matches = [...html.matchAll(/appData\.stats[\s\S]*?;/g)];
matches.forEach(m => console.log(m[0].slice(0, 200)));
