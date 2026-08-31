const fs = require('fs');

let html = fs.readFileSync('index 3.html', 'utf8');

// Fix takeMedItem onclick
html = html.replace(/onclick="takeMedItem\(' \+ m\.id \+ ', '' \+ t \+ ''\)"/g, 'onclick="takeMedItem(\' + m.id + \', \\\'\' + t + \'\\\')"');

// Let's check callSOS and viewDocItem
html = html.replace(/onclick="callSOS\('' \+ c\.phone \+ ''\)"/g, 'onclick="callSOS(\\\'\'+c.phone+\'\\\')"');
html = html.replace(/onclick="viewDocItem\('' \+ d\.name \+ ''\)"/g, 'onclick="viewDocItem(\\\'\'+d.name+\'\\\')"');

fs.writeFileSync('index 3.html', html);
console.log('Fixed quotes in JS string builders.');
