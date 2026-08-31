const fs = require('fs');

let html = fs.readFileSync('index 3.html', 'utf8');

// Fix the publish logic to rely on mqtt.js's internal queuing
html = html.replace(/if\s*\(mqttClient\s*&&\s*mqttClient\.connected\)\s*\{\s*mqttClient\.publish/g, 'if (mqttClient) { mqttClient.publish');

fs.writeFileSync('index 3.html', html);
console.log('Fixed MQTT publish queuing in index 3.html');
