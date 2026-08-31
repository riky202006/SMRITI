/**
 * MEGA UPDATE SCRIPT — SMRITI MEMORYCARE
 * Handles all requested features in one comprehensive pass.
 */
const fs = require('fs');

// ===========================
// PART 1: PATCH index 3.html
// ===========================
let patient = fs.readFileSync('index 3.html', 'utf8');

// --- 1. Fix appData structure to include all needed fields ---
patient = patient.replace(
  /let appData = JSON\.parse\(localStorage\.getItem\('meca_data_v2'\)\) \|\| \{[\s\S]*?\};/,
  `let appData = JSON.parse(localStorage.getItem('meca_data_v2')) || {
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    patientAddress: '',
    caretakerName: '',
    caretakerPhone: '',
    caretakerEmail: '',
    role: null,
    images: [],
    medicine: [],    // [{id, name, type, dosage, frequency, times:[], history:{date:{time:'TAKEN/PENDING'}}}]
    visits: [],      // [{id, kind:'visitor'|'doctor', name, relation, date, time, purpose}]
    stats: { games: 0, score: 0, correct: 0, incorrect: 0 },
    currentGameCorrect: 0,
    liveLocation: { active: false },
    notifications: []  // [{time, text}]
  };
  // Migrate old-format medicine entries
  if (appData.medicine && appData.medicine.length > 0) {
    appData.medicine = appData.medicine.map(m => {
      if (!m.id) m.id = Date.now() + Math.random();
      if (!m.times) {
        m.times = m.time ? [m.time] : [];
        m.frequency = 1;
      }
      if (!m.history) m.history = {};
      return m;
    });
  }
  if (!appData.visits) appData.visits = [];
  if (!appData.notifications) appData.notifications = [];
  if (!appData.liveLocation) appData.liveLocation = { active: false };`
);

// --- 2. Replace the Meds screen (screen-reminders) with a proper medicine + visits screen ---
const newMedsScreen = `
  <!-- ============ MEDS SCREEN ============ -->
  <div class="screen" id="screen-reminders">
    <div class="topbar">
      <div class="icon-btn" onclick="go('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
      <h2>My Medicines</h2>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll" style="padding:16px;">
      <div id="patient-med-list">
        <p style="color:var(--gray); text-align:center;">No medicines scheduled.</p>
      </div>
    </div>
    <div class="bottom-nav">
      <div class="nav-item" onclick="go('home')"><div class="nav-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg></div>Home</div>
      <div class="nav-item" onclick="go('game-start')"><div class="nav-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4a3 3 0 013 3v1a3 3 0 010 6h-1a3 3 0 01-3 3M12 4a3 3 0 00-3 3v1a3 3 0 000 6h1a3 3 0 003 3"/></svg></div>Games</div>
      <div class="nav-item active" onclick="go('reminders')"><div class="nav-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M3 8l9-5 9 5"/></svg></div>Meds</div>
      <div class="nav-item" onclick="go('stats')"><div class="nav-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg></div>Stats</div>
      <div class="nav-item" onclick="loadAccount(); go('account')">
        <div class="nav-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
        Account
      </div>
    </div>
  </div>
`;

// Replace existing reminders screen
patient = patient.replace(
  /<!-- ============ REMINDERS \/ MEDS ============ -->[\s\S]*?<\/div>\s*<\/div>\s*(?=<!-- ============ STATS)/,
  newMedsScreen + '\n\n  '
);

// --- 3. Update med-popup to be proper, data-driven ---
const newMedPopup = `
  <!-- ============ MED POPUP ============ -->
  <div class="screen" id="screen-med-popup" style="background:linear-gradient(180deg,#f4d9c2 0%, #f7f4ee 55%); align-items:center; justify-content:center; padding:30px;">
    <div class="med-card" style="width:100%;">
      <div class="med-circle"></div>
      <h2 id="med-popup-title" style="text-align:center;">💊 MEDICATION REMINDER</h2>
      <div class="med-info" style="text-align:center; margin:16px 0;">
        <p class="name" id="med-popup-name" style="font-size:22px; font-weight:800; margin:0 0 8px;"></p>
        <p style="margin:4px 0; color:var(--gray);" id="med-popup-type"></p>
        <p style="margin:4px 0; font-weight:700;" id="med-popup-dosage"></p>
        <p class="when" id="med-popup-time" style="margin:8px 0 0; font-size:18px;"></p>
      </div>
      <button class="btn btn-primary" onclick="markMedTaken()">✓ TAKEN</button>
      <button class="btn btn-outline" onclick="go('home')" style="margin-top:8px;">REMIND ME LATER</button>
    </div>
  </div>
`;

patient = patient.replace(
  /<!-- ============ MED POPUP ============ -->[\s\S]*?<\/div>\s*<\/div>/,
  newMedPopup
);

// --- 4. Replace old med management functions ---
const newMedLogic = `
  // ====== MED MANAGEMENT (PATIENT) ======
  let _activeMedId = null;
  let _activeMedTime = null;

  function renderPatientMeds() {
    const list = document.getElementById('patient-med-list');
    if (!list) return;
    const meds = appData.medicine || [];
    if (meds.length === 0) {
      list.innerHTML = '<p style="color:var(--gray); text-align:center; padding:20px;">No medicines scheduled.<br>Your caretaker will add your medicines.</p>';
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    let html = '';
    meds.forEach(m => {
      html += '<div class="card" style="margin-bottom:16px; padding:16px;">';
      html += '<h3 style="margin:0 0 4px;">' + m.name + '</h3>';
      html += '<p style="margin:0 0 8px; color:var(--gray); font-size:14px;">' + (m.type || 'Tablet') + ' · ' + (m.dosage || '-') + '</p>';
      const hist = (m.history && m.history[todayStr]) || {};
      (m.times || []).forEach(t => {
        const status = hist[t] || 'PENDING';
        const color = status === 'TAKEN' ? '#0b5d52' : '#e67e22';
        const icon = status === 'TAKEN' ? '✓' : '⏰';
        html += '<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-top:1px solid #eee;">';
        html += '<span style="font-size:15px; font-weight:700;">' + t + '</span>';
        if (status === 'TAKEN') {
          html += '<span style="color:' + color + '; font-weight:800;">' + icon + ' TAKEN</span>';
        } else {
          html += '<button onclick="showMedPopup(\'' + m.id + '\', \'' + t + '\')" style="background:#0b5d52; color:#fff; border:none; border-radius:10px; padding:6px 14px; font-weight:800; cursor:pointer;">TAKE</button>';
        }
        html += '</div>';
      });
      html += '</div>';
    });
    list.innerHTML = html;
  }

  function showMedPopup(medId, time) {
    const m = (appData.medicine || []).find(x => String(x.id) === String(medId));
    if (!m) return;
    _activeMedId = medId;
    _activeMedTime = time;
    document.getElementById('med-popup-name').textContent = m.name;
    document.getElementById('med-popup-type').textContent = (m.type || 'Tablet');
    document.getElementById('med-popup-dosage').textContent = 'Dosage: ' + (m.dosage || '1 dose');
    document.getElementById('med-popup-time').textContent = 'Time: ' + time;
    go('med-popup');
  }

  function markMedTaken() {
    if (!_activeMedId || !_activeMedTime) { go('home'); return; }
    const m = (appData.medicine || []).find(x => String(x.id) === String(_activeMedId));
    if (!m) { go('home'); return; }
    if (!m.history) m.history = {};
    const todayStr = new Date().toISOString().split('T')[0];
    if (!m.history[todayStr]) m.history[todayStr] = {};
    m.history[todayStr][_activeMedTime] = 'TAKEN';
    const timeNow = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    // Log notification
    const patientName = appData.patientName || 'Patient';
    appData.notifications.unshift({
      time: timeNow,
      text: '✓ ' + patientName + ' took ' + m.name + ' (' + _activeMedTime + ')',
      type: 'taken'
    });
    saveApp();
    _activeMedId = null;
    _activeMedTime = null;
    showToast('Marked as TAKEN ✓');
    go('reminders');
    renderPatientMeds();
    renderDynamicHome();
  }

  // OLD markTaken alias
  function markTaken() { markMedTaken(); }

  // ====== MEDICINE POPUP SCHEDULER ======
  function checkMedSchedule() {
    const meds = appData.medicine || [];
    if (meds.length === 0) return;
    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const todayStr = now.toISOString().split('T')[0];
    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen || activeScreen.id.includes('game')) return;

    meds.forEach(m => {
      (m.times || []).forEach(t => {
        if (t === timeStr) {
          const hist = (m.history && m.history[todayStr]) || {};
          if (hist[t] !== 'TAKEN') {
            showMedPopup(m.id, t);
          }
        }
      });
    });
  }
  setInterval(checkMedSchedule, 60000);
`;

// Replace old medicine management
patient = patient.replace(
  /\/\/ ---------- MEDICINE MANAGEMENT ----------[\s\S]*?function triggerMedicinePopup\(\) \{[\s\S]*?\}/,
  newMedLogic
);

// --- 5. Add Visits & Appointments screen ---
const visitsScreen = `
  <!-- ============ VISITS & APPOINTMENTS ============ -->
  <div class="screen" id="screen-visits">
    <div class="topbar">
      <div class="icon-btn" onclick="go('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
      <h2>Visits & Appointments</h2>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll" style="padding:16px;">
      <div id="patient-visits-list">
        <p style="color:var(--gray); text-align:center; padding:20px;">No upcoming visits or appointments.</p>
      </div>
    </div>
  </div>
`;

// Insert before Account screen
patient = patient.replace(
  /<!-- ============ ACCOUNT ============ -->/,
  visitsScreen + '\n\n  <!-- ============ ACCOUNT ============ -->'
);

// Add renderPatientVisits function
const visitsLogic = `
  function renderPatientVisits() {
    const list = document.getElementById('patient-visits-list');
    if (!list) return;
    const visits = appData.visits || [];
    if (visits.length === 0) {
      list.innerHTML = '<p style="color:var(--gray); text-align:center; padding:20px;">No upcoming visits or appointments scheduled.</p>';
      return;
    }
    let html = '';
    visits.forEach(v => {
      const icon = v.kind === 'doctor' ? '🏥' : '👋';
      html += '<div class="card" style="margin-bottom:16px; padding:16px;">';
      html += '<div style="display:flex; gap:12px; align-items:flex-start;">';
      html += '<div style="font-size:32px;">' + icon + '</div>';
      html += '<div style="flex:1;">';
      html += '<h3 style="margin:0 0 4px;">' + v.name + '</h3>';
      if (v.kind === 'doctor') {
        html += '<p style="margin:0 0 4px; color:var(--teal-dark); font-weight:700; font-size:14px;">' + (v.specialization || '') + '</p>';
        html += '<p style="margin:0 0 4px; font-size:14px; color:var(--gray);">' + (v.location || '') + '</p>';
      } else {
        html += '<p style="margin:0 0 4px; font-size:14px; color:var(--gray);">' + (v.relation || '') + '</p>';
      }
      html += '<p style="margin:0; font-size:14px;"><strong>' + v.date + '</strong> at <strong>' + v.time + '</strong></p>';
      html += '<p style="margin:4px 0 0; font-size:13px; color:var(--gray);">' + (v.purpose || '') + '</p>';
      html += '</div></div></div>';
    });
    list.innerHTML = html;
  }
`;

// Insert visits logic near account logic
patient = patient.replace(
  /function loadAccount\(\)/,
  visitsLogic + '\n\n  function loadAccount()'
);

// --- 6. Hook renderPatientMeds and renderPatientVisits into go() ---
patient = patient.replace(
  /if\(id === 'personalize' \|\| id === 'c-gallery' \|\| id === 'p-gallery'\) renderGalleries\(\);/,
  `if(id === 'personalize' || id === 'c-gallery' || id === 'p-gallery') renderGalleries();
    if(id === 'reminders') renderPatientMeds();
    if(id === 'visits') renderPatientVisits();`
);

// --- 7. Fix Documents and SOS screen CSS to stay inside phone ---
// Ensure all screens have overflow:hidden on x and auto on y
if (!patient.includes('#screen-documents { overflow')) {
  patient = patient.replace(
    /#screen-reminders\{background:var\(--cream\);\}/,
    `#screen-reminders{background:var(--cream);}
  #screen-documents{overflow-y:auto; overflow-x:hidden;}
  #screen-sos{overflow-y:auto; overflow-x:hidden;}
  #screen-visits{overflow-y:auto; overflow-x:hidden; background:var(--cream);}`
  );
}

// --- 8. Add Visits card on home screen ---
patient = patient.replace(
  /(<div class="card row-card" onclick="go\('sos'\)")/,
  `<div class="card row-card" onclick="go('visits')" style="cursor:pointer; margin-top:16px; background:var(--mint-soft);">
        <div class="row-icon" style="background:var(--mint); color:var(--teal-dark);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
        </div>
        <div class="row-text">
          <p class="title" style="color:var(--teal-dark);">📅 VISITS & APPOINTMENTS</p>
          <p class="sub">Visitors &amp; Doctor Visits</p>
        </div>
      </div>
      $1`
);

// --- 9. Ensure renderDynamicHome also updates Visits section ---
patient = patient.replace(
  /\/\/ Check Visits[\s\S]*?visContainer\.style\.display = 'none';\s*\}/,
  `// Check Visits
    const visContainer = document.getElementById('home-visits-container');
    const visSub = document.getElementById('home-visit-sub');
    const visits = appData.visits || [];
    if (visits.length > 0) {
      const upcomingVisit = visits[0];
      visContainer.style.display = 'flex';
      visSub.textContent = (upcomingVisit.kind === 'doctor' ? 'Dr. ' : '') + upcomingVisit.name + ' — ' + upcomingVisit.date + ' at ' + upcomingVisit.time;
    } else {
      visContainer.style.display = 'none';
    }`
);

// --- 10. Update account screen to include email ---
patient = patient.replace(
  /(<input id="acc-address" type="text" placeholder="Address">)[\s\S]*?(<button class="btn btn-primary" onclick="saveAccount\(\)")/,
  `<input id="acc-address" type="text" placeholder="Address">
          </div>
        </div>
        <div class="field">
          <label>Email</label>
          <div class="input-wrap"><input id="acc-email" type="email" placeholder="Email Address"></div>
        </div>
      </div>
      $2`
);

// --- 11. Update loadAccount and saveAccount to also handle email ---
patient = patient.replace(
  /function loadAccount\(\) \{[\s\S]*?function saveAccount\(\)/,
  `function loadAccount() {
    document.getElementById('acc-name').value = appData.patientName || '';
    document.getElementById('acc-phone').value = appData.patientPhone || '';
    document.getElementById('acc-address').value = appData.patientAddress || '';
    const emailEl = document.getElementById('acc-email');
    if (emailEl) emailEl.value = appData.patientEmail || '';
  }
  function saveAccount()`
);

patient = patient.replace(
  /appData\.patientName = document\.getElementById\('acc-name'\)\.value\.trim\(\);[\s\S]*?saveApp\(\);/,
  `appData.patientName = document.getElementById('acc-name').value.trim();
    appData.patientPhone = document.getElementById('acc-phone').value.trim();
    appData.patientAddress = document.getElementById('acc-address').value.trim();
    const emailEl = document.getElementById('acc-email');
    if (emailEl) appData.patientEmail = emailEl.value.trim();
    saveApp();`
);

// --- 12. Write to file ---
fs.writeFileSync('index 3.html', patient);
console.log('✓ index 3.html patched');
