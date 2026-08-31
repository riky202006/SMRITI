const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

// Check the device structure
const deviceStart = html.indexOf('<div class="device">');
const deviceEnd = html.indexOf('<div class="toast"');

console.log('Device start:', deviceStart);
console.log('Device end:', deviceEnd);
console.log('Content between last screen and toast:');
console.log(html.slice(deviceEnd - 300, deviceEnd + 200));
