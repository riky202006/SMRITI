const fs = require('fs');
let html = fs.readFileSync('caretaker.html', 'utf8');

// 1. Include Leaflet CSS/JS
html = html.replace(/<\/head>/, `
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>`);

// 2. Add Live Patient Location card to Dashboard
const mapCard = `
      <div class="card" style="margin-top:16px; border:2px solid var(--teal);">
        <h3 style="margin-top:0; color:var(--teal); display:flex; justify-content:space-between; align-items:center;">
          LIVE PATIENT LOCATION
          <button class="btn btn-primary" style="padding:6px 12px; font-size:12px;" onclick="go('map')">FULL MAP</button>
        </h3>
        <div style="background:#e6e3db; height:120px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:32px; margin-bottom:12px;">
          📍
        </div>
        <p style="margin:0 0 4px; font-weight:700;">Tracking Status: <span id="dash-track-status" style="color:var(--gray);">● OFF</span></p>
        <p style="margin:0 0 4px; font-size:14px;">Last Updated: <span id="dash-track-time">-</span></p>
        <p style="margin:0 0 4px; font-size:14px; color:var(--gray);">Lat: <span id="dash-track-lat">-</span></p>
        <p style="margin:0 0 4px; font-size:14px; color:var(--gray);">Lng: <span id="dash-track-lng">-</span></p>
      </div>
`;
html = html.replace(/(<div class="ct-dashboard-grid">)/, mapCard + '\n      $1');

// 3. Add Full Map Screen
const mapScreen = `
  <!-- ============ FULL MAP ============ -->
  <div class="screen" id="screen-map" style="display:none; flex-direction:column; height:100%;">
    <div class="top-nav">
      <div class="icon-btn" onclick="go('dashboard')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></div>
      <span class="title">Live Location</span>
      <div style="width:38px;"></div>
    </div>
    
    <div style="padding:16px; background:var(--cream); border-bottom:1px solid #ddd;">
      <p style="margin:0; font-weight:800; font-size:16px;">PATIENT</p>
      <p style="margin:0 0 8px; font-size:14px;" id="map-pt-name">Loading...</p>
      
      <p style="margin:0; font-weight:800; font-size:16px;">STATUS</p>
      <p style="margin:0 0 8px; font-size:14px;" id="map-track-status">● OFF</p>
      
      <p style="margin:0; font-weight:800; font-size:16px;">UPDATED</p>
      <p style="margin:0; font-size:14px;" id="map-track-time">-</p>
    </div>
    
    <div id="leaflet-map" style="flex:1; width:100%; background:#e6e3db;"></div>
    <div id="map-overlay-msg" style="position:absolute; top:200px; left:0; width:100%; text-align:center; padding:20px; font-weight:800; font-size:18px; color:var(--gray); background:rgba(255,255,255,0.8); display:none; z-index:1000;">
      Waiting for patient's live location...
    </div>
  </div>
`;
// Insert before toast
html = html.replace(/(<div class="toast" id="toast"><\/div>)/, mapScreen + '\n$1');

// 4. Map Logic in JS
const mapLogic = `
  let mapInstance = null;
  let ptMarker = null;
  
  function initMap() {
    if(!mapInstance) {
      mapInstance = L.map('leaflet-map').setView([0, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);
    }
  }

  function updateMapUI() {
    const pInfo = appData.patientProfile || {};
    document.getElementById('map-pt-name').textContent = pInfo.name || 'Unknown Patient';
    
    const loc = appData.liveLocation || { active: false };
    
    if(loc.active && loc.lat !== undefined && loc.lng !== undefined) {
      document.getElementById('dash-track-status').innerHTML = '● LIVE';
      document.getElementById('dash-track-status').style.color = '#d32f2f';
      document.getElementById('map-track-status').innerHTML = '● LIVE';
      document.getElementById('map-track-status').style.color = '#d32f2f';
      
      document.getElementById('dash-track-time').textContent = loc.time;
      document.getElementById('dash-track-lat').textContent = loc.lat.toFixed(4);
      document.getElementById('dash-track-lng').textContent = loc.lng.toFixed(4);
      document.getElementById('map-track-time').textContent = loc.time;
      
      document.getElementById('map-overlay-msg').style.display = 'none';
      
      if(mapInstance) {
        if(!ptMarker) {
          ptMarker = L.marker([loc.lat, loc.lng]).addTo(mapInstance);
        } else {
          ptMarker.setLatLng([loc.lat, loc.lng]);
        }
        mapInstance.setView([loc.lat, loc.lng], 15);
      }
    } else {
      document.getElementById('dash-track-status').innerHTML = '● OFF';
      document.getElementById('dash-track-status').style.color = 'var(--gray)';
      document.getElementById('map-track-status').innerHTML = '● OFF / UNAVAILABLE';
      document.getElementById('map-track-status').style.color = 'var(--gray)';
      
      document.getElementById('dash-track-time').textContent = '-';
      document.getElementById('dash-track-lat').textContent = '-';
      document.getElementById('dash-track-lng').textContent = '-';
      document.getElementById('map-track-time').textContent = '-';
      
      document.getElementById('map-overlay-msg').style.display = 'block';
      if(ptMarker && mapInstance) {
        mapInstance.removeLayer(ptMarker);
        ptMarker = null;
      }
    }
  }
  
  // Refresh UI every 2 seconds to catch changes from the other tab
  setInterval(() => {
    appData = JSON.parse(localStorage.getItem('meca_data_v2')) || appData;
    updateMapUI();
  }, 2000);
`;

html = html.replace(/(function go\(id\)\{)/, mapLogic + '\n  $1');

// Hook map init into go()
const mapInitHook = `
    if(id === "map") {
      setTimeout(() => {
        initMap();
        mapInstance.invalidateSize();
        updateMapUI();
      }, 100);
    }
`;
html = html.replace(/(if\(id === "docs-setup"\) renderDocs\(\);)/, '$1\n' + mapInitHook);

fs.writeFileSync('caretaker.html', html);
console.log("Updated caretaker.html with Live Map feature");
