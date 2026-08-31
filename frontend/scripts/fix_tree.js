const fs = require('fs');
let c = fs.readFileSync('index 3.html', 'utf8');

// Fix 1: Move Gallery button inside home-scroll
// Find the closing div of home-scroll that was placed too early
c = c.replace(/<\/div>\r?\n\r?\n\s+<div class="card row-card" onclick="go\('p-gallery'\)"/, '\n    <div class="card row-card" onclick="go(\'p-gallery\')"');

// Fix 2: Remove the extra </div> that closes screen-home before bottom-nav
c = c.replace(/<\/div>\r?\n\r?\n\s+<\/div>\r?\n\s+<div class="bottom-nav">/, '  </div>\n    </div>\n    <div class="bottom-nav">');

fs.writeFileSync('index 3.html', c);
console.log('Fixed HTML tree in screen-home');
