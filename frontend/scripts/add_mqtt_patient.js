const fs = require('fs');

let html = fs.readFileSync('index 3.html', 'utf8');

// 1. Add MQTT script
if (!html.includes('mqtt.min.js')) {
  html = html.replace(/<\/head>/, `  <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>\n</head>`);
}

// 2. Inject MQTT Logic for Patient
const mqttPatientLogic = `
  // --- REAL-TIME MQTT SYNC (CROSS-DEVICE PROTOTYPE) ---
  let mqttClient = null;
  function initMqtt() {
    if(!mqttClient && typeof mqtt !== 'undefined') {
      mqttClient = mqtt.connect('wss://test.mosquitto.org:8081');
      mqttClient.on('connect', () => console.log('Patient MQTT Connected'));
    }
  }
  
  // Override toggleTracking
  let trackingWatchId = null;
  let ptMapInstance = null;
  let ptMapMarker = null;

  function initPatientMap() {
    if(!ptMapInstance) {
      ptMapInstance = L.map('pt-leaflet-map').setView([0, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(ptMapInstance);
    }
  }

  function toggleTracking(enable) {
    initMqtt(); // ensure connected
    
    if(enable) {
      if(!navigator.geolocation) {
        document.getElementById('track-msg').textContent = "Location services not supported by browser.";
        return;
      }
      document.getElementById('track-msg').textContent = "Requesting permission...";
      trackingWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          document.getElementById('track-status').innerHTML = '● Live Tracking ON';
          document.getElementById('track-status').style.color = '#d32f2f';
          document.getElementById('btn-track-on').style.display = 'none';
          document.getElementById('btn-track-off').style.display = 'inline-block';
          document.getElementById('track-msg').textContent = "Location updating & sharing real-time (PATIENT_DEMO_001)...";
          
          const t = new Date().toLocaleTimeString();
          const locData = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            time: t,
            active: true
          };
          
          // Local save
          appData.liveLocation = locData;
          saveApp();
          
          // MQTT publish
          if(mqttClient && mqttClient.connected) {
            mqttClient.publish('smriti/hackathon/PATIENT_DEMO_001/location', JSON.stringify(locData));
          }

          // Show map locally for patient
          document.getElementById('patient-map-container').style.display = 'block';
          document.getElementById('pt-map-time').textContent = t;
          
          initPatientMap();
          setTimeout(()=>ptMapInstance.invalidateSize(), 100);

          if(!ptMapMarker) {
            ptMapMarker = L.marker([pos.coords.latitude, pos.coords.longitude]).addTo(ptMapInstance);
          } else {
            ptMapMarker.setLatLng([pos.coords.latitude, pos.coords.longitude]);
          }
          ptMapInstance.setView([pos.coords.latitude, pos.coords.longitude], 15);
        },
        (err) => {
          document.getElementById('track-msg').textContent = "Error: " + err.message;
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      if(trackingWatchId !== null) {
        navigator.geolocation.clearWatch(trackingWatchId);
        trackingWatchId = null;
      }
      document.getElementById('track-status').innerHTML = 'OFF';
      document.getElementById('track-status').style.color = 'var(--gray)';
      document.getElementById('btn-track-on').style.display = 'inline-block';
      document.getElementById('btn-track-off').style.display = 'none';
      document.getElementById('track-msg').textContent = "Stopped sharing.";
      document.getElementById('patient-map-container').style.display = 'none';
      
      const locDataOff = { active: false };
      appData.liveLocation = locDataOff;
      saveApp();
      
      if(mqttClient && mqttClient.connected) {
        mqttClient.publish('smriti/hackathon/PATIENT_DEMO_001/location', JSON.stringify(locDataOff));
      }
    }
  }
`;

// Replace the existing toggleTracking logic completely
// We know toggleTracking is defined around line 1100.
// Let's strip the existing toggleTracking & initPatientMap and inject our new one.

// Using Regex to remove existing initPatientMap and toggleTracking
html = html.replace(/function initPatientMap\(\) \{[\s\S]*?function toggleTracking\(enable\) \{[\s\S]*?if\(enable\) \{[\s\S]*?else \{[\s\S]*?\}\s*\}/, mqttPatientLogic);
// Actually, regex can be flaky. Let's just append the new definitions at the end of the <script> block, since JS allows overwriting function definitions.
// I'll inject right before `</script>`
html = html.replace(/<\/script>\s*<\/body>/, mqttPatientLogic + '\n</script>\n</body>');

fs.writeFileSync('index 3.html', html);
console.log('MQTT added to index 3.html');
