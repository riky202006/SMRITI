const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

const sosStart = html.indexOf('id="screen-sos"');
console.log(html.slice(sosStart, sosStart + 1200));
