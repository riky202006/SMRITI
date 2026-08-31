const fs = require('fs');
const lines = fs.readFileSync('index 3_backup.html', 'utf8').split('\n');
lines.forEach(l => {
    let m = l.match(/<div class="screen" id="([^"]+)"/);
    if(m) console.log(m[1]);
});
