const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

// Find all screens
const screenMatches = [...html.matchAll(/id="(screen-[^"]+)"/g)].map(m => m[1]);
console.log('All screen IDs:', screenMatches);

// Find all bottom nav instances
const navMatches = [...html.matchAll(/<div class="bottom-nav"[\s\S]*?<\/div>\s*<\/div>/g)];
console.log('Bottom nav count:', navMatches.length);
if (navMatches.length > 0) {
  console.log('Sample bottom nav HTML:\n', navMatches[0][0]);
}

// Check if go() function is defined and what it does
const goMatch = html.match(/function go\(id\)[\s\S]*?\{[\s\S]*?\n  \}/);
if (goMatch) {
  console.log('go() definition:\n', goMatch[0].slice(0, 500));
}

// Check other occurrences of go definition
const allGoMatches = [...html.matchAll(/function go\(id\)/g)];
console.log('Total go() definitions:', allGoMatches.length);
