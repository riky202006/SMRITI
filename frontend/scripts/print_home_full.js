const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

const homeStart = html.indexOf('id="screen-home"');
const homeEnd = html.indexOf('<!-- ============ GAME START ============ -->');
console.log(html.slice(homeStart - 25, homeEnd));
