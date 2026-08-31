const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

const docStart = html.indexOf('id="screen-documents"');
console.log(html.slice(docStart, docStart + 1000));
