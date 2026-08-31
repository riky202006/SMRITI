const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

html = html.replace(/(<div class="screen" id="screen-game-start"[^>]*>)\s*<div class="top-nav">[\s\S]*?<\/div>\s*<div class="home-scroll"/, '$1\n    <div class="home-scroll"');

fs.writeFileSync('index 3.html', html);
console.log('Removed top-nav from screen-game-start.');
