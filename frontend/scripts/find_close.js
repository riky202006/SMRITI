const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');
const lines = html.split('\n');
let depth = 0;

for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const openDivs = (l.match(/<div/gi) || []).length;
    const closeDivs = (l.match(/<\/div/gi) || []).length;
    
    depth += openDivs;
    depth -= closeDivs;
    
    if (depth === 0 && closeDivs > 0) {
        console.log('Depth reaches 0 at line', i + 1, l.trim());
    }
}
