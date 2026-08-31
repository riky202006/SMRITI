const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

const sampleImgIndex = html.indexOf('sample');
console.log('Sample images logic:');
const matches = [...html.matchAll(/appData\.images[\s\S]*?;/g)];
matches.forEach(m => console.log(m[0].slice(0, 300)));
