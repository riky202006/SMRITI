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
    
    if (l.includes('class="device"')) console.log('Device starts at', i + 1, 'Depth before open:', depth - openDivs, 'Depth after:', depth);
    if (l.includes('id="screen-documents"')) console.log('Documents at', i + 1, 'Depth:', depth);
    if (l.includes('id="screen-sos"')) console.log('SOS at', i + 1, 'Depth:', depth);
    if (depth < 0) console.log('Negative depth at', i + 1);
}
console.log('Final depth:', depth);
