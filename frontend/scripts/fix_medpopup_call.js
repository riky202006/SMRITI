const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

// Fix the showMedPopup call inside renderPatientMeds - the button onclick uses single quotes for strings
// but the outer string is also single-quoted, causing JS parse issue
html = html.replace(
  /html \+= '<button onclick=\"showMedPopup\('' \+ m\.id \+ '', '' \+ t \+ ''\)/,
  `html += '<button onclick=\"showMedPopup(' + JSON.stringify(String(m.id)) + ',' + JSON.stringify(t) + ')\">`
);

fs.writeFileSync('index 3.html', html);
console.log('Fixed showMedPopup call');
