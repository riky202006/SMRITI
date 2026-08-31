const fs = require('fs');
let html = fs.readFileSync('caretaker.html', 'utf8');

// Strip out the broken initDashboard hook
html = html.replace(/const oldInitDash = initDashboard;[\s\S]*?oldInitDash\(\);\s*\}/, "window.addEventListener('load', initMqtt);");

fs.writeFileSync('caretaker.html', html);
console.log('Fixed Caretaker MQTT initialization.');
