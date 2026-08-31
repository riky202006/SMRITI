const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

// Fix the bottom nav Games link
html = html.replace(/(<div class="nav-item" onclick=")startGame(\(\)">)/g, '$1go(\'game-start\')$2');

fs.writeFileSync('index 3.html', html);
console.log("Fixed bottom nav");
