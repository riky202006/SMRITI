const fs = require('fs');
let c = fs.readFileSync('clean_update.js', 'utf8');
c = c.replace(/\\\\\\`/g, '\\`'); // this handles node string escaping issues. I'll just look for \\` and replace with `
c = c.replace(/\\\\\`/g, '`');
c = c.replace(/\\\\`/g, '`');
c = c.replace(/\\`/g, '`');
fs.writeFileSync('clean_update.js', c);
