const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

html = html.replace(/if\(id === 'reminders'\) renderPatientMeds\(\);/, "if(id === 'reminders') { renderPatientMeds(); renderPatientVisits(); }");

fs.writeFileSync('index 3.html', html);
console.log('Fixed go(id) for reminders.');
