const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

const remStart = html.indexOf('id="screen-reminders"');
const remEnd = html.indexOf('id="screen-account"');
console.log(html.slice(remStart - 25, remEnd));
