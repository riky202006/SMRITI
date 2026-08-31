const fs = require('fs');
let ct = fs.readFileSync('caretaker.html', 'utf8');

// ============================================================
// 1. Upgrade Medicine screen HTML to support type/dosage/freq
// ============================================================
const newMedScreen = `  <div class="screen" id="screen-medicine">
    <div class="top-nav">
      <div class="icon-btn" onclick="go('dashboard')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></div>
      <span class="title">Medication</span>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll" style="padding:16px;">
      <!-- ADD MEDICINE FORM -->
      <div class="form-card" style="margin-bottom:24px;">
        <h3 style="margin-top:0; font-size:18px;">Add Medicine</h3>
        <div class="form-field">
          <label>Medicine Name</label>
          <input type="text" id="med-name" placeholder="e.g. Paracetamol">
        </div>
        <div class="form-field">
          <label>Medicine Type</label>
          <select id="med-type" style="width:100%; padding:12px; border-radius:12px; border:2px solid var(--teal); font-size:16px; background:var(--white);">
            <option value="Tablet">Tablet</option>
            <option value="Capsule">Capsule</option>
            <option value="Syrup">Syrup</option>
            <option value="Injection">Injection</option>
            <option value="Drops">Drops</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-field">
          <label>Dosage</label>
          <input type="text" id="med-dosage" placeholder="e.g. 1 tablet, 10 ml">
        </div>
        <div class="form-field">
          <label>Frequency</label>
          <select id="med-frequency" onchange="updateFrequencyTimes()" style="width:100%; padding:12px; border-radius:12px; border:2px solid var(--teal); font-size:16px; background:var(--white);">
            <option value="1">1x Daily</option>
            <option value="2">2x Daily</option>
            <option value="3">3x Daily</option>
          </select>
        </div>
        <div id="med-times-section">
          <div class="form-field" id="time-1-wrap">
            <label id="time-1-label">Night</label>
            <input type="time" id="med-time-1" value="21:00">
          </div>
        </div>
        <button class="btn btn-primary" onclick="addMedicine()">Add Medicine</button>
      </div>

      <!-- TODAY SUMMARY -->
      <h3 style="font-size:16px; font-weight:800; margin-bottom:8px;">TODAY'S STATUS</h3>
      <div style="display:flex; gap:12px; margin-bottom:20px;">
        <div style="flex:1; background:#e8f5e9; border-radius:12px; padding:12px; text-align:center;">
          <div style="font-size:24px; font-weight:800; color:#2e7d32;" id="ct-stat-taken">0</div>
          <div style="font-size:12px; color:var(--gray);">✓ Taken</div>
        </div>
        <div style="flex:1; background:#fff8e1; border-radius:12px; padding:12px; text-align:center;">
          <div style="font-size:24px; font-weight:800; color:#f57f17;" id="ct-stat-pending">0</div>
          <div style="font-size:12px; color:var(--gray);">⏰ Pending</div>
        </div>
        <div style="flex:1; background:#ffebee; border-radius:12px; padding:12px; text-align:center;">
          <div style="font-size:24px; font-weight:800; color:#c62828;" id="ct-stat-missed">0</div>
          <div style="font-size:12px; color:var(--gray);">⚠ Missed</div>
        </div>
      </div>

      <!-- MEDICINE LIST -->
      <h3 style="font-size:16px; font-weight:800; margin-bottom:8px;">MEDICATION SCHEDULE</h3>
      <div id="med-list"><!-- Rendered via JS --></div>

      <!-- NOTIFICATION HISTORY -->
      <h3 style="font-size:16px; font-weight:800; margin:20px 0 8px;">NOTIFICATION HISTORY</h3>
      <div id="ct-notif-list" style="font-size:13px;">
        <p style="color:var(--gray);">No notifications yet.</p>
      </div>
    </div>
  </div>`;

// Replace old medicine screen
ct = ct.replace(
  /  <div class="screen" id="screen-medicine">[\s\S]*?<\/div>\s*<\/div>\s*(?=<!-- ============ ANALYTICS)/,
  newMedScreen + '\n\n  '
);

// ============================================================
// 2. Add Visits screen to caretaker
// ============================================================
const visitsScreen = `
  <!-- ============ VISITS & APPOINTMENTS ============ -->
  <div class="screen" id="screen-visits">
    <div class="top-nav">
      <div class="icon-btn" onclick="go('dashboard')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></div>
      <span class="title">Visits &amp; Appointments</span>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll" style="padding:16px;">
      <!-- ADD FORM -->
      <div class="form-card" style="margin-bottom:24px;">
        <h3 style="margin-top:0;">Add Visit / Appointment</h3>
        <div class="form-field">
          <label>Type</label>
          <select id="visit-kind" onchange="updateVisitForm()" style="width:100%; padding:12px; border-radius:12px; border:2px solid var(--teal); font-size:16px; background:var(--white);">
            <option value="visitor">Person Visiting</option>
            <option value="doctor">Doctor Appointment</option>
          </select>
        </div>
        <div class="form-field">
          <label>Name</label>
          <input type="text" id="visit-name" placeholder="Name">
        </div>
        <div id="visit-visitor-fields">
          <div class="form-field">
            <label>Relationship</label>
            <input type="text" id="visit-relation" placeholder="e.g. Family Friend">
          </div>
        </div>
        <div id="visit-doctor-fields" style="display:none;">
          <div class="form-field">
            <label>Specialization</label>
            <input type="text" id="visit-specialization" placeholder="e.g. Neurologist">
          </div>
          <div class="form-field">
            <label>Location</label>
            <input type="text" id="visit-location" placeholder="e.g. City Hospital">
          </div>
        </div>
        <div class="form-field">
          <label>Date</label>
          <input type="date" id="visit-date">
        </div>
        <div class="form-field">
          <label>Time</label>
          <input type="time" id="visit-time">
        </div>
        <div class="form-field">
          <label>Purpose</label>
          <input type="text" id="visit-purpose" placeholder="Purpose / Reason">
        </div>
        <button class="btn btn-primary" onclick="addVisit()">Add</button>
      </div>

      <h3 style="font-size:16px; font-weight:800; margin-bottom:8px;">UPCOMING</h3>
      <div id="ct-visits-list">
        <p style="color:var(--gray);">No visits or appointments added.</p>
      </div>
    </div>
  </div>
`;

// Insert before analytics screen
ct = ct.replace(
  /<!-- ============ ANALYTICS ============ -->/,
  visitsScreen + '\n  <!-- ============ ANALYTICS ============ -->'
);

// ============================================================
// 3. Add nav item for Visits on caretaker dashboard
// ============================================================
ct = ct.replace(
  /(<div class="nav-item" onclick="go\('medicine'\)">)/,
  `<div class="nav-item" onclick="go('visits')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;margin-right:6px;vertical-align:middle;"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>
          Visits
        </div>
        $1`
);

// ============================================================
// 4. Upgrade addMedicine JS function
// ============================================================
const newAddMedicineJS = `
  function updateFrequencyTimes() {
    const freq = parseInt(document.getElementById('med-frequency').value);
    const section = document.getElementById('med-times-section');
    const timeSlots = [
      { id: 'time-1', label: freq === 1 ? 'Night' : 'Morning', default: '06:00' },
      { id: 'time-2', label: 'Afternoon', default: '13:00' },
      { id: 'time-3', label: 'Night', default: '21:00' }
    ];
    if (freq === 1) {
      section.innerHTML = \`
        <div class="form-field"><label>Night</label><input type="time" id="med-time-1" value="21:00"></div>
      \`;
    } else if (freq === 2) {
      section.innerHTML = \`
        <div class="form-field"><label>Afternoon</label><input type="time" id="med-time-1" value="13:00"></div>
        <div class="form-field"><label>Night</label><input type="time" id="med-time-2" value="21:00"></div>
      \`;
    } else {
      section.innerHTML = \`
        <div class="form-field"><label>Morning</label><input type="time" id="med-time-1" value="06:00"></div>
        <div class="form-field"><label>Afternoon</label><input type="time" id="med-time-2" value="13:00"></div>
        <div class="form-field"><label>Night</label><input type="time" id="med-time-3" value="21:00"></div>
      \`;
    }
  }

  function addMedicine() {
    const name = document.getElementById('med-name').value.trim();
    const type = document.getElementById('med-type').value;
    const dosage = document.getElementById('med-dosage').value.trim();
    const freq = parseInt(document.getElementById('med-frequency').value);
    if (!name || !dosage) { showToast('Please fill in all fields'); return; }
    
    const times = [];
    for (let i = 1; i <= freq; i++) {
      const el = document.getElementById('med-time-' + i);
      if (el) times.push(el.value);
    }
    
    const med = {
      id: Date.now(),
      name, type, dosage,
      frequency: freq,
      times,
      history: {}
    };
    appData.medicine.push(med);
    saveData();
    
    // Clear form
    document.getElementById('med-name').value = '';
    document.getElementById('med-dosage').value = '';
    
    renderMedicine();
    showToast('Medicine added');
    
    // Add notification
    const patientName = appData.patientInfo && appData.patientInfo.name ? appData.patientInfo.name : 'Patient';
    appData.notifications.unshift({
      time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
      text: '💊 Medicine added: ' + name + ' (' + freq + 'x daily)',
      type: 'added'
    });
    saveData();
  }

  function deleteMed(idx) {
    appData.medicine.splice(idx, 1);
    saveData();
    renderMedicine();
    showToast('Medicine removed');
  }

  function renderMedicine() {
    const list = document.getElementById('med-list');
    if (!list) return;
    list.innerHTML = '';
    
    const todayStr = new Date().toISOString().split('T')[0];
    let totalTaken = 0, totalPending = 0, totalMissed = 0;
    const nowH = new Date().getHours();
    const nowM = new Date().getMinutes();
    
    if (appData.medicine.length === 0) {
      list.innerHTML = '<p style="color:var(--gray); text-align:center;">No medicines added yet.</p>';
    } else {
      const patientName = (appData.patientInfo && appData.patientInfo.name) || 'Patient';
      appData.medicine.forEach((m, idx) => {
        const hist = (m.history && m.history[todayStr]) || {};
        let html = \`<div class="card" style="margin-bottom:16px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div>
              <h3 style="margin:0 0 4px;">\${m.name}</h3>
              <p style="margin:0; color:var(--gray); font-size:14px;">\${m.type} · \${m.dosage} · \${m.frequency}x daily</p>
            </div>
            <button onclick="deleteMed(\${idx})" style="background:none; border:none; color:var(--gray); cursor:pointer; font-size:18px;">✕</button>
          </div>\`;
        
        (m.times || []).forEach(t => {
          const status = hist[t] || 'PENDING';
          // Check if missed (time has passed)
          const [th, tm] = t.split(':').map(Number);
          const isPast = (nowH > th) || (nowH === th && nowM > tm + 5);
          const displayStatus = status === 'TAKEN' ? 'TAKEN' : (isPast ? 'MISSED' : 'PENDING');
          
          if (displayStatus === 'TAKEN') totalTaken++;
          else if (displayStatus === 'MISSED') totalMissed++;
          else totalPending++;
          
          const color = displayStatus === 'TAKEN' ? '#2e7d32' : displayStatus === 'MISSED' ? '#c62828' : '#f57f17';
          const icon = displayStatus === 'TAKEN' ? '✓' : displayStatus === 'MISSED' ? '⚠' : '⏰';
          
          html += \`<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-top:1px solid #eee;">
            <span style="font-weight:700; font-size:14px;">\${t}</span>
            <span style="font-weight:800; color:\${color}; font-size:14px;">\${icon} \${displayStatus}</span>
          </div>\`;
        });
        
        html += '</div>';
        list.innerHTML += html;
      });
    }
    
    // Update summary
    const takenEl = document.getElementById('ct-stat-taken');
    const pendingEl = document.getElementById('ct-stat-pending');
    const missedEl = document.getElementById('ct-stat-missed');
    if (takenEl) takenEl.textContent = totalTaken;
    if (pendingEl) pendingEl.textContent = totalPending;
    if (missedEl) missedEl.textContent = totalMissed;
    
    // Render notification history
    renderNotifHistory();
  }

  function renderNotifHistory() {
    const notifList = document.getElementById('ct-notif-list');
    if (!notifList) return;
    const notifs = appData.notifications || [];
    if (notifs.length === 0) {
      notifList.innerHTML = '<p style="color:var(--gray);">No notifications yet.</p>';
      return;
    }
    notifList.innerHTML = notifs.slice(0,20).map(n => 
      \`<div style="padding:8px 0; border-bottom:1px solid #eee; font-size:13px;">
        <span style="color:var(--gray);\${n.type==='taken'?'color:#2e7d32':n.type==='missed'?'color:#c62828':''}">\${n.text}</span>
        <span style="float:right; color:var(--gray);">\${n.time}</span>
      </div>\`
    ).join('');
  }

  // ====== VISITS MANAGEMENT ======
  function updateVisitForm() {
    const kind = document.getElementById('visit-kind').value;
    document.getElementById('visit-visitor-fields').style.display = kind === 'visitor' ? 'block' : 'none';
    document.getElementById('visit-doctor-fields').style.display = kind === 'doctor' ? 'block' : 'none';
  }

  function addVisit() {
    const kind = document.getElementById('visit-kind').value;
    const name = document.getElementById('visit-name').value.trim();
    const date = document.getElementById('visit-date').value;
    const time = document.getElementById('visit-time').value;
    const purpose = document.getElementById('visit-purpose').value.trim();
    if (!name || !date || !time) { showToast('Please fill required fields'); return; }
    
    const visit = { id: Date.now(), kind, name, date, time, purpose };
    if (kind === 'visitor') {
      visit.relation = document.getElementById('visit-relation').value.trim();
    } else {
      visit.specialization = document.getElementById('visit-specialization').value.trim();
      visit.location = document.getElementById('visit-location').value.trim();
    }
    
    if (!appData.visits) appData.visits = [];
    appData.visits.push(visit);
    // Sort by date+time
    appData.visits.sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
    saveData();
    renderVisits();
    
    // Clear form
    document.getElementById('visit-name').value = '';
    document.getElementById('visit-date').value = '';
    document.getElementById('visit-time').value = '';
    document.getElementById('visit-purpose').value = '';
    showToast('Visit added');
  }

  function deleteVisit(idx) {
    appData.visits.splice(idx, 1);
    saveData();
    renderVisits();
  }

  function renderVisits() {
    const list = document.getElementById('ct-visits-list');
    if (!list) return;
    const visits = appData.visits || [];
    if (visits.length === 0) {
      list.innerHTML = '<p style="color:var(--gray); text-align:center;">No visits or appointments added.</p>';
      return;
    }
    list.innerHTML = visits.map((v, idx) => {
      const icon = v.kind === 'doctor' ? '🏥' : '👋';
      return \`<div class="card" style="margin-bottom:12px; padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="display:flex; gap:10px; align-items:flex-start; flex:1;">
            <div style="font-size:28px;">\${icon}</div>
            <div>
              <h4 style="margin:0 0 2px;">\${v.name}</h4>
              <p style="margin:0; font-size:13px; color:var(--gray);">\${v.kind === 'doctor' ? (v.specialization||'Doctor') : (v.relation||'Visitor')}</p>
              <p style="margin:4px 0 0; font-size:14px;"><strong>\${v.date}</strong> at <strong>\${v.time}</strong></p>
              \${v.purpose ? \`<p style="margin:4px 0 0; font-size:13px; color:var(--gray);">\${v.purpose}</p>\` : ''}
            </div>
          </div>
          <button onclick="deleteVisit(\${idx})" style="background:none; border:none; color:var(--gray); cursor:pointer;">✕</button>
        </div>
      </div>\`;
    }).join('');
  }
`;

// Replace old addMedicine and renderMedicine functions
ct = ct.replace(
  /\/\/ --- Medicine ---[\s\S]*?\/\/ --- Analytics ---/,
  newAddMedicineJS + '\n\n  // --- Analytics ---'
);

// ============================================================
// 5. Add medication check interval for caretaker notifications  
// ============================================================
const medCheckInterval = `
  // Check for missed medications every minute
  setInterval(() => {
    const meds = appData.medicine || [];
    if (meds.length === 0) return;
    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const todayStr = now.toISOString().split('T')[0];
    const patientName = (appData.patientInfo && appData.patientInfo.name) || 'Patient';
    
    meds.forEach(m => {
      (m.times || []).forEach(t => {
        if (t === timeStr) {
          const hist = (m.history && m.history[todayStr]) || {};
          if (!hist[t]) {
            appData.notifications.unshift({
              time: timeStr,
              text: '💊 ' + patientName + "'s medication due: " + m.name + ' (' + m.dosage + ')',
              type: 'due'
            });
            // reload if on medicine page
            const active = document.querySelector('.screen.active');
            if (active && active.id === 'screen-medicine') renderMedicine();
          }
        }
      });
    });
  }, 60000);
`;

// Hook into existing go() wrapper
ct = ct.replace(
  /if\(id === 'medicine'\) renderMedicine\(\);/,
  `if(id === 'medicine') renderMedicine();
    if(id === 'visits') { renderVisits(); }
    if(id === 'dashboard') { updateMapUI(); renderMedSummaryOnDashboard(); }`
);

// Add a medication summary renderer on dashboard
const medSummaryOnDash = `
  function renderMedSummaryOnDashboard() {
    const todayStr = new Date().toISOString().split('T')[0];
    const meds = appData.medicine || [];
    let taken = 0, pending = 0;
    const nowH = new Date().getHours();
    const nowM = new Date().getMinutes();
    meds.forEach(m => {
      const hist = (m.history && m.history[todayStr]) || {};
      (m.times || []).forEach(t => {
        if (hist[t] === 'TAKEN') taken++;
        else pending++;
      });
    });
    const el = document.getElementById('dash-med-summary');
    if (el) {
      el.innerHTML = meds.length === 0 
        ? 'No medicines scheduled.' 
        : '✓ Taken: ' + taken + ' &nbsp; ⏰ Pending: ' + pending;
    }
  }
`;

ct = ct.replace(
  /function loadAccount\(\)/,
  medSummaryOnDash + medCheckInterval + '\n  function loadAccount()'
);

// ============================================================
// 6. Add med summary to dashboard HTML
// ============================================================
ct = ct.replace(
  /<!-- LIVE TRACKING CARD -->/,
  `<!-- MED SUMMARY CARD -->
      <div class="card" style="margin-top:16px; padding:16px;" onclick="go('medicine')" style="cursor:pointer;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <h3 style="margin:0;">💊 Today's Medications</h3>
          <span style="color:var(--teal); font-size:13px; font-weight:700;">View →</span>
        </div>
        <p id="dash-med-summary" style="margin:0; color:var(--gray); font-size:14px;">Loading...</p>
      </div>

      <!-- LIVE TRACKING CARD -->`
);

// ============================================================
// 7. Fix saveData to include notifications and visits
// ============================================================
ct = ct.replace(
  /const DEFAULT_DATA = \{[\s\S]*?\};/,
  `const DEFAULT_DATA = {
    patientInfo: { name: '', dob: '', condition: '', caretakerRelation: '' },
    emergencyContacts: [
      { rel: 'Primary', name: '', phone: '' },
      { rel: 'Secondary', name: '', phone: '' }
    ],
    customImages: [],
    medicine: [],
    visits: [],
    notifications: [],
    stats: { games: 0, score: 0, correct: 0, incorrect: 0 },
    currentGameCorrect: 0,
    liveLocation: { active: false },
    patientName: '',
    caretakerName: '',
    caretakerPhone: '',
    caretakerEmail: ''
  };`
);

fs.writeFileSync('caretaker.html', ct);
console.log('✓ caretaker.html patched');
