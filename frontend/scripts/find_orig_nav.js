const fs = require('fs');
const html = fs.readFileSync('index 3_backup.html', 'utf8');
const navMatch = html.match(/<div class="bottom-nav"[\s\S]*?<\/div>\s*<\/div>/);
if (navMatch) {
  console.log('Original bottom-nav HTML in index 3_backup.html:');
  console.log(navMatch[0]);
} else {
  console.log('Not found in backup.');
}
