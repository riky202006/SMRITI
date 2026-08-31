const fs = require('fs');
let html = fs.readFileSync('caretaker.html', 'utf8');

const newDashTracking = `
      <!-- LIVE TRACKING CARD -->
      <div class="card" style="margin-top:16px; border:2px solid var(--teal); padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="margin:0;">PATIENT LIVE TRACKING</h3>
          <span id="dash-track-status" style="font-weight:700; color:var(--gray);">LIVE TRACKING OFF</span>
        </div>
        
        <div id="dash-map-container" style="display:none;">
          <p style="margin:0 0 8px; font-size:14px;">Patient Location: <span id="dash-track-latlng"></span></p>
          <div id="leaflet-map-dash" style="width:100%; height:200px; background:#e6e3db; border-radius:12px; margin-bottom:8px; position:relative; z-index:1;"></div>
          <p style="margin:0; font-size:12px; color:var(--gray);">Last Updated: <span id="dash-track-time">-</span></p>
        </div>
        <div id="dash-map-off-msg" style="color:var(--gray); font-size:14px; text-align:center; padding:20px 0;">
          Tracking is currently disabled by the patient.
        </div>
      </div>
`;

// Replace old Live Patient Location card
html = html.replace(/<div class="card" style="margin-top:16px; border:2px solid var\(--teal\);">[\s\S]*?<\/div>\s*<\/div>/, newDashTracking);

// Update map logic
const mapLogic = `
  let mapInstanceDash = null;
  let ptMarkerDash = null;

  function initMapDash() {
    if(!mapInstanceDash) {
      mapInstanceDash = L.map('leaflet-map-dash').setView([0, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceDash);
    }
  }

  function updateMapUI() {
    const pInfo = appData.patientInfo || {};
    const loc = appData.liveLocation || { active: false };
    
    if(loc.active) {
      document.getElementById('dash-track-status').textContent = 'LIVE';
      document.getElementById('dash-track-status').style.color = '#d32f2f';
      document.getElementById('dash-map-container').style.display = 'block';
      document.getElementById('dash-map-off-msg').style.display = 'none';
      
      document.getElementById('dash-track-latlng').textContent = loc.lat.toFixed(4) + ', ' + loc.lng.toFixed(4);
      document.getElementById('dash-track-time').textContent = loc.time;
      
      initMapDash();
      setTimeout(()=>mapInstanceDash.invalidateSize(), 100);
      
      if(!ptMarkerDash) {
        ptMarkerDash = L.marker([loc.lat, loc.lng]).addTo(mapInstanceDash);
      } else {
        ptMarkerDash.setLatLng([loc.lat, loc.lng]);
      }
      mapInstanceDash.setView([loc.lat, loc.lng], 15);
      
    } else {
      document.getElementById('dash-track-status').textContent = 'LIVE TRACKING OFF';
      document.getElementById('dash-track-status').style.color = 'var(--gray)';
      document.getElementById('dash-map-container').style.display = 'none';
      document.getElementById('dash-map-off-msg').style.display = 'block';
    }
  }
`;

html = html.replace(/let mapInstance = null;[\s\S]*?function updateMapUI\(\) \{[\s\S]*?\}\s*\}/, mapLogic);

fs.writeFileSync('caretaker.html', html);
console.log('Fixed caretaker tracking map on dashboard');
