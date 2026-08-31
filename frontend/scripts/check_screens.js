const fs = require('fs');
const lines = fs.readFileSync('index 3.html', 'utf8').split('\n');
let currentScreen = '';
lines.forEach(l => {
    let m = l.match(/<div class="screen" id="([^"]+)"/);
    if(m) currentScreen = m[1];
    if(l.includes('class="topbar"') || l.includes('class="top-nav"')) {
        console.log(currentScreen + ' has topbar/top-nav');
    }
});
