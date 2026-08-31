const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

const statsStart = html.indexOf('id="screen-stats"');
console.log(html.slice(statsStart - 25, statsStart + 600));
