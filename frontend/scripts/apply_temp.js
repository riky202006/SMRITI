const fs = require('fs');
let html = fs.readFileSync('index_3_temp.html', 'utf8');
fs.writeFileSync('index 3.html', html);
console.log('Saved to index 3.html');
