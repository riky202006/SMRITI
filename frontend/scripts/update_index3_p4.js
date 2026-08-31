const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

// 1. Add Leaflet
html = html.replace(/<\/head>/, `
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>`);

// 2. Add map container to SOS screen below Live Tracking
const patientMapContainer = `
      <div id="patient-map-container" style="display:none; margin-top:24px; border:2px solid var(--teal); border-radius:12px; overflow:hidden;">
        <div style="background:var(--teal); color:white; padding:8px; font-weight:700; display:flex; justify-content:space-between;">
          <span>📍 Your Current Location</span>
          <span id="pt-map-time" style="font-weight:400;">-</span>
        </div>
        <div id="pt-leaflet-map" style="width:100%; height:250px; background:#e6e3db;"></div>
      </div>
`;
html = html.replace(/(<p id="track-msg" .*?><\/p>\s*<\/div>)/, '$1\n' + patientMapContainer);

// 3. Update toggleTracking logic to handle the map
const updatedTrackingLogic = `
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
          document.getElementById('btn-track-off').style.display = 'block';
          document.getElementById('track-msg').textContent = "Location updating...";
          
          const t = new Date().toLocaleTimeString();
          appData.liveLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            time: t,
            active: true
          };
          saveApp();

          // Show map
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
          document.getElementById('track-msg').textContent = "Location permission is required to display your live location.";
        },
        { enableHighAccuracy: true }
      );
    } else {
      if(trackingWatchId !== null) {
        navigator.geolocation.clearWatch(trackingWatchId);
        trackingWatchId = null;
      }
      document.getElementById('track-status').innerHTML = '● Tracking OFF';
      document.getElementById('track-status').style.color = 'var(--gray)';
      document.getElementById('btn-track-on').style.display = 'block';
      document.getElementById('btn-track-off').style.display = 'none';
      document.getElementById('track-msg').textContent = "";
      
      document.getElementById('patient-map-container').style.display = 'none';

      appData.liveLocation = { active: false };
      saveApp();
    }
  }
`;
html = html.replace(/let trackingWatchId = null;[\s\S]*?saveApp\(\);\s*\}\s*\}/, updatedTrackingLogic);

fs.writeFileSync('index 3.html', html);
console.log("Updated index 3.html with Patient Map");
