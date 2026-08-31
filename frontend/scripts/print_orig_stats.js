const fs = require('fs');
const html = fs.readFileSync('index 3_backup.html', 'utf8');

const statsStart = html.indexOf('id="screen-stats"');
const statsEnd = html.indexOf('id="screen-intake"');
console.log(html.slice(statsStart - 25, statsEnd));
