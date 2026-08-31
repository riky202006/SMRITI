const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');
console.log('Has pravatar images?', html.includes('pravatar.cc'));
console.log('Has DOMContentLoaded?', html.includes('DOMContentLoaded'));
