const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

// 1. Add Documents card to the dashboard
const docsCard = `
      <div class="card row-card" onclick="go('documents')" style="cursor:pointer; margin-top:16px;">
        <div class="row-icon gray-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <div class="row-text">
          <p class="title">📄 DOCUMENTS</p>
          <p class="sub">View medical files & SOS</p>
        </div>
      </div>
`;
html = html.replace(/(<div class="card row-card" onclick="go\('p-gallery'\)".*?<\/div>\s*<\/div>)/s, '$1\n' + docsCard);

// 2. Add new screens: screen-documents and screen-sos
const newScreens = `
  <!-- ============ DOCUMENTS ============ -->
  <div class="screen" id="screen-documents">
    <div class="top-nav">
      <div class="icon-btn" onclick="go('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
      <span class="title">Documents</span>
      <div style="width:38px;"></div>
    </div>
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
    <div class="top-nav">
      <div class="icon-btn" onclick="go('documents')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
      <span class="title">SOS Contacts</span>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll" style="background:#ffebee;">
      <div style="text-align:center; padding:10px 0 20px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="#d32f2f" stroke-width="2" style="width:60px;height:60px;margin-bottom:10px;"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
        <h2 style="color:#d32f2f; margin:0;">Emergency Contacts</h2>
      </div>
      
      <div id="sos-patient-details" style="margin-bottom:20px; text-align:center;"></div>
      <div id="sos-contact-list"></div>
    </div>
  </div>
`;

// Insert new screens before the toast div
html = html.replace(/(<div class="toast" id="toast"><\/div>)/, newScreens + '\n$1');

// 3. Inject JS logic for rendering documents, prescriptions, and SOS
const renderLogic = `
  // --- IndexedDB for Files ---
  const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('MemoryCareDB', 1);
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore('documents');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  async function getDocumentFile(id) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('documents', 'readonly');
      const store = tx.objectStore('documents');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function viewDocument(id, type) {
    const fileData = await getDocumentFile(id);
    if(fileData) {
      if(type.includes('pdf')) {
        const blob = new Blob([fileData], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        const blob = new Blob([fileData], { type: type });
        const url = URL.createObjectURL(blob);
        const w = window.open('');
        w.document.write('<img src="' + url + '" style="max-width:100%;">');
      }
    } else {
      showToast("Document file not found");
    }
  }

  function callSOS(phone) {
    if(confirm('Are you sure you want to contact your emergency contact?')) {
      window.location.href = 'tel:' + phone;
    }
  }

  function renderDocuments() {
    // Render Patient Info
    const pInfo = appData.patientProfile || {};
    document.getElementById('doc-patient-info').innerHTML = \`
      <p style="margin:0 0 4px;"><strong>Name:</strong> \${pInfo.name || 'Not provided'}</p>
      <p style="margin:0 0 4px;"><strong>Age:</strong> \${pInfo.age || 'Not provided'}</p>
      <p style="margin:0;"><strong>Address:</strong> \${pInfo.address || ''} \${pInfo.city || ''} \${pInfo.state || ''}</p>
    \`;

    const sosDetails = document.getElementById('sos-patient-details');
    sosDetails.innerHTML = \`<p style="margin:0;"><strong>\${pInfo.name || 'Patient'}</strong><br>\${pInfo.address || ''}</p>\`;

    // Render Prescriptions
    const rxList = document.getElementById('doc-prescriptions');
    rxList.innerHTML = '';
    const rxs = appData.prescriptions || [];
    if(rxs.length === 0) rxList.innerHTML = '<p style="color:var(--gray);">No prescriptions found.</p>';
    rxs.forEach(rx => {
      rxList.innerHTML += \`
        <div class="card" style="margin-bottom:12px; border-left:4px solid var(--teal);">
          <h4 style="margin:0 0 8px; color:var(--teal-dark);">\${rx.med}</h4>
          <p style="margin:0 0 4px; font-size:14px;"><strong>Dosage:</strong> \${rx.dose}</p>
          <p style="margin:0 0 4px; font-size:14px;"><strong>Time:</strong> \${rx.time}</p>
          \${rx.doctor ? \`<p style="margin:0 0 4px; font-size:14px;"><strong>Doctor:</strong> \${rx.doctor}</p>\` : ''}
          <p style="margin:0; font-size:12px; color:var(--gray);">Added: \${rx.date}</p>
        </div>\`;
    });

    // Render Documents
    const dList = document.getElementById('doc-list');
    dList.innerHTML = '';
    const docs = appData.documents || [];
    if(docs.length === 0) dList.innerHTML = '<p style="color:var(--gray);">No documents uploaded.</p>';
    docs.forEach(d => {
      dList.innerHTML += \`
        <div class="card row-card" style="margin-bottom:12px; cursor:pointer;" onclick="viewDocument('\${d.id}', '\${d.type}')">
          <div class="row-icon gray-bg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg></div>
          <div class="row-text">
            <p class="title">\${d.name}</p>
            <p class="sub">\${d.date}</p>
          </div>
        </div>\`;
    });

    // Render SOS Contacts
    const sosList = document.getElementById('sos-contact-list');
    sosList.innerHTML = '';
    const contacts = appData.emergencyContacts || [];
    if(contacts.length === 0) sosList.innerHTML = '<p style="text-align:center;">No emergency contacts configured.</p>';
    contacts.forEach(c => {
      if(!c.name && !c.phone) return;
      sosList.innerHTML += \`
        <div class="card" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h4 style="margin:0 0 4px;">\${c.rel}</h4>
            <p style="margin:0; font-size:14px;">\${c.name}</p>
          </div>
          <button class="btn" style="background:#d32f2f; color:#fff; padding:12px 20px; border-radius:12px;" onclick="callSOS('\${c.phone}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;vertical-align:middle;margin-right:6px;"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
            Call
          </button>
        </div>\`;
    });
  }
  
  // Intercept the go() function to render docs if needed
  const originalGo = go;
  go = function(id) {
    if(id === 'documents' || id === 'sos') {
      renderDocuments();
    }
    originalGo(id);
  };
`;
html = html.replace(/(function showToast\(msg\)\{)/, renderLogic + '\n  $1');

// Link to caretaker.html on the login screen
html = html.replace(/(<button class="caregiver-link" onclick="go\('intake'\)">Caregiver \/ Family Portal<\/button>)/, `<a href="caretaker.html" class="caregiver-link" style="display:block; text-align:center; text-decoration:none; margin-top:16px;">Caregiver / Family Portal</a>`);

fs.writeFileSync('index 3.html', html);
console.log("Updated index 3.html with Documents feature");
