const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

// 1. Account screen
const accountScreen = `
  <!-- ============ ACCOUNT ============ -->
  <div class="screen" id="screen-account">
    <div class="home-scroll" style="padding:20px;">
      <div style="text-align:center; margin-bottom:24px;">
        <div style="width:100px; height:100px; border-radius:50%; background:var(--mint); margin:0 auto 12px; display:flex; align-items:center; justify-content:center; color:var(--teal-dark);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:50px; height:50px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
      </div>
      
      <div class="field">
        <label>Name</label>
        <div class="input-wrap"><input id="acc-name" type="text" placeholder="Your Name"></div>
      </div>
      <div class="field">
        <label>Phone Number</label>
        <div class="input-wrap"><input id="acc-phone" type="text" placeholder="Phone Number"></div>
      </div>
      <div class="field">
        <label>Address</label>
        <div class="input-wrap"><input id="acc-address" type="text" placeholder="Address"></div>
      </div>
      <div class="field">
        <label>Email</label>
        <div class="input-wrap"><input id="acc-email" type="email" placeholder="Email Address"></div>
      </div>
      
      <button class="btn btn-primary" onclick="saveAccount()" style="margin-top:20px;">SAVE CHANGES</button>
    </div>
  </div>
`;

// 2. Documents and SOS
const docsSosScreen = `
  <!-- ============ DOCUMENTS ============ -->
  <div class="screen" id="screen-documents">
    <div class="home-scroll">
      
      <button class="btn btn-primary" style="background:#d32f2f; margin-bottom:24px;" onclick="go('sos')">🚨 SOS / EMERGENCY</button>
      
      <h3 style="margin-top:0;">Patient Information</h3>
      <div class="card" id="doc-patient-info" style="margin-bottom:24px;">
        <p style="color:var(--gray);">Loading...</p>
      </div>
      
      <h3 style="margin-top:0;">Prescriptions</h3>
      <div id="doc-prescriptions" style="margin-bottom:24px;">
        <p style="color:var(--gray);">No prescriptions found.</p>
      </div>

      <h3 style="margin-top:0;">My Documents</h3>
      <div id="doc-list">
        <p style="color:var(--gray);">No documents uploaded.</p>
      </div>
      
    </div>
  </div>

  <!-- ============ SOS ============ -->
  <div class="screen" id="screen-sos">
    <div class="home-scroll" style="background:#ffebee;">
      <div style="text-align:center; padding:10px 0 20px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="#d32f2f" stroke-width="2" style="width:60px;height:60px;margin-bottom:10px;"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
        <h2 style="color:#d32f2f; margin:0;">Emergency Contacts</h2>
      </div>
      
      <div id="sos-patient-details" style="margin-bottom:20px; text-align:center;"></div>
      <div id="sos-contact-list"></div>

      <h3 style="margin-top:24px;">Live Tracking</h3>
      <div class="card" style="text-align:center;">
        <p style="font-size:18px; font-weight:700; margin-bottom:16px;">Status: <span id="track-status" style="color:var(--gray);">OFF</span></p>
        <button id="btn-track-on" class="btn btn-primary" style="margin-bottom:12px;" onclick="toggleTracking(true)">START SHARING LOCATION</button>
        <button id="btn-track-off" class="btn" style="background:var(--gray-light); color:var(--ink);" onclick="toggleTracking(false)" style="display:none;">STOP</button>
        <p id="track-msg" style="font-size:13px; color:var(--gray); margin-top:12px;"></p>
      </div>

      <div id="patient-map-container" style="display:none; margin-top:24px; border:2px solid var(--teal); border-radius:16px; overflow:hidden;">
        <div style="background:var(--teal); color:white; padding:8px; font-weight:700; display:flex; justify-content:space-between;">
          <span>📍 Your Current Location</span>
          <span id="pt-map-time" style="font-weight:400;">-</span>
        </div>
        <div id="pt-leaflet-map" style="width:100%; height:250px; background:#e6e3db;"></div>
      </div>
    </div>
  </div>
`;

const statsScreen = `
  <!-- ============ STATS ============ -->
  <div class="screen" id="screen-stats">
    <div class="home-scroll" style="padding:16px;">
      <h2 style="margin-top:0;">My Progress</h2>
      <div style="background:white; border-radius:16px; padding:20px; text-align:center; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        <p style="color:var(--gray); font-size:16px;">Games Played</p>
        <h1 style="font-size:48px; color:var(--teal-dark); margin:0;">0</h1>
      </div>
    </div>
  </div>
`;

// Make sure we append them correctly before the toast.
html = html.replace(/<div class="toast"/, accountScreen + '\n' + docsSosScreen + '\n' + statsScreen + '\n  <div class="toast"');

fs.writeFileSync('index 3.html', html);
console.log("Restored lost screens!");
