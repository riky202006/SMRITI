const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

const scriptMatches = html.match(/<script[\s\S]*?<\/script>/gi);
const js = scriptMatches[2].replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');

const lines = js.split('\n');
for (let i = 1; i <= lines.length; i++) {
  const code = lines.slice(0, i).join('\n');
  try {
    new Function(code);
  } catch(e) {
    if (!e.message.includes('Unexpected end of input') && !e.message.includes('missing ) after argument list') && !e.message.includes('Unexpected token')) {
      console.log(`Error near line ${i}:`, e.message);
      console.log('Line content:', lines[i-1]);
      break;
    }
  }
}
