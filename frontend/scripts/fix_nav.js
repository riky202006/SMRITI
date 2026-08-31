const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

html = html.replace(/onclick="go\('game-start'\)\(\)"/g, "onclick=\"go('game-start')\"");

fs.writeFileSync('index 3.html', html);
console.log('Fixed syntax error in Games nav item');
