const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

// The closing device div is at line 1096. We need to move it right before `<div class="toast" id="toast"></div>`
html = html.replace(/\s*<\/div>\s*<!-- ============ DOCUMENTS ============ -->/, '\n\n  <!-- ============ DOCUMENTS ============ -->');

html = html.replace(/<div class="toast" id="toast"><\/div>/, '  </div>\n\n<div class="toast" id="toast"></div>');

fs.writeFileSync('index 3.html', html);
console.log('Fixed device div closing');
