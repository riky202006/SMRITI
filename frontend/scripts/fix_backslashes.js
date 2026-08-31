const fs = require('fs');
let c = fs.readFileSync('clean_update.js', 'utf8');
c = c.replace(/\\\\`/g, '`');
fs.writeFileSync('clean_update.js', c);
