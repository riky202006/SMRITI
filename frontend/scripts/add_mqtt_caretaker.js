const fs = require('fs');
let html = fs.readFileSync('caretaker.html', 'utf8');

if (!html.includes('mqtt.min.js')) {
  html = html.replace(/<\/head>/, `  <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>\n</head>`);
}

const mqttCaretakerLogic = `
  // --- REAL-TIME MQTT SYNC (CROSS-DEVICE PROTOTYPE) ---
  let mqttClient = null;
  function initMqtt() {
    if(!mqttClient && typeof mqtt !== 'undefined') {
      mqttClient = mqtt.connect('wss://test.mosquitto.org:8081');
      mqttClient.on('connect', () => {
        console.log('Caretaker MQTT Connected to PATIENT_DEMO_001');
        mqttClient.subscribe('smriti/hackathon/PATIENT_DEMO_001/location');
      });
      mqttClient.on('message', (topic, message) => {
        try {
          const locData = JSON.parse(message.toString());
          appData.liveLocation = locData;
          saveApp(); // sync local state
          
          if(document.getElementById('screen-dashboard').classList.contains('active')) {
            updateMapUI();
          }
        } catch(e) {}
      });
    }
  }

  // Hook into initialization to start MQTT
  const oldInitDash = initDashboard;
  initDashboard = function() {
    initMqtt();
    oldInitDash();
  }
`;

html = html.replace(/<\/script>\s*<\/body>/, mqttCaretakerLogic + '\n</script>\n</body>');

fs.writeFileSync('caretaker.html', html);
console.log('MQTT added to caretaker.html');
