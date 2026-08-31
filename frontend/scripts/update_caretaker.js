const fs = require('fs');
let html = fs.readFileSync('caretaker.html', 'utf8');

// 1. Add "Patient View" to dashboard header
html = html.replace(/(<p class="name" id="ct-role-display">Guardian<\/p>\s*<\/div>)/, '$1\n        <div><a href="index 3.html" style="font-size:14px; color:var(--teal); text-decoration:none; font-weight:700;">Patient View &rarr;</a></div>');

// 2. Add Documents to Dashboard
const docsCard = `
        <div class="ct-card" onclick="go('docs-setup')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <p>Documents</p>
        </div>
`;
html = html.replace(/(<p>Medicine<\/p>\s*<\/div>)/, '$1\n' + docsCard);

// 3. Update Patient Profile Screen
const ptScreen = `
  <!-- ============ PATIENT PROFILE ============ -->
  <div class="screen" id="screen-patient">
    <div class="top-nav">
      <div class="icon-btn" onclick="go('dashboard')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></div>
      <span class="title">Patient Profile</span>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll">
      <div class="form-card" style="margin-bottom:24px;">
        <h3 style="margin-top:0;">Basic Information</h3>
        <div class="form-field"><label>Name</label><input type="text" id="pt-name" placeholder="Patient Name"></div>
        <div class="form-field"><label>Age</label><input type="number" id="pt-age" placeholder="Age"></div>
        <div class="form-field"><label>Address</label><input type="text" id="pt-addr" placeholder="Address"></div>
        <div class="form-field"><label>City</label><input type="text" id="pt-city" placeholder="City"></div>
        <div class="form-field"><label>District</label><input type="text" id="pt-dist" placeholder="District"></div>
        <div class="form-field"><label>State</label><input type="text" id="pt-state" placeholder="State"></div>
      </div>
      
      <div class="form-card" style="margin-bottom:24px;">
        <h3 style="margin-top:0;">Emergency Contacts</h3>
        <p style="color:var(--gray); font-size:14px; margin-top:-10px;">Fill in as many as apply.</p>
        
        <h4 style="margin-bottom:8px;">1. Son</h4>
        <div class="form-field"><input type="text" id="ec-son-name" placeholder="Name"></div>
        <div class="form-field"><input type="tel" id="ec-son-phone" placeholder="Phone Number"></div>
        
        <h4 style="margin-bottom:8px;">2. Wife</h4>
        <div class="form-field"><input type="text" id="ec-wife-name" placeholder="Name"></div>
        <div class="form-field"><input type="tel" id="ec-wife-phone" placeholder="Phone Number"></div>
        
        <h4 style="margin-bottom:8px;">3. Guardian / Responsible Person</h4>
        <div class="form-field"><input type="text" id="ec-guard-name" placeholder="Name"></div>
        <div class="form-field"><input type="tel" id="ec-guard-phone" placeholder="Phone Number"></div>
        
        <h4 style="margin-bottom:8px;">4. House / Family Contact</h4>
        <div class="form-field"><input type="text" id="ec-house-name" placeholder="Name"></div>
        <div class="form-field"><input type="tel" id="ec-house-phone" placeholder="Phone Number"></div>
        
        <h4 style="margin-bottom:8px;">5. Additional Contact</h4>
        <div class="form-field"><input type="text" id="ec-other-rel" placeholder="Relationship (e.g. Neighbor)"></div>
        <div class="form-field"><input type="text" id="ec-other-name" placeholder="Name"></div>
        <div class="form-field"><input type="tel" id="ec-other-phone" placeholder="Phone Number"></div>
      </div>
      
      <button class="btn btn-primary" onclick="savePatientProfile()">Save Patient Profile</button>
    </div>
  </div>
`;
html = html.replace(/<!-- ============ PATIENT PROFILE ============ -->.*?<\/div>\s*<\/div>\s*<\/div>/s, ptScreen);

// 4. Add Documents & Prescriptions Screen
const docsScreen = `
  <!-- ============ DOCUMENTS SETUP ============ -->
  <div class="screen" id="screen-docs-setup">
    <div class="top-nav">
      <div class="icon-btn" onclick="go('dashboard')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></div>
      <span class="title">Docs & Prescriptions</span>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll">
      
      <h3 style="margin-top:0;">Prescriptions</h3>
      <div class="form-card" style="margin-bottom:24px;">
        <h4 style="margin-top:0;">Add Prescription</h4>
        <div class="form-field"><label>Medicine Name</label><input type="text" id="rx-name"></div>
        <div class="form-field"><label>Dosage / Instructions</label><input type="text" id="rx-dose"></div>
        <div class="form-field"><label>Time</label><input type="text" id="rx-time" placeholder="e.g. 9:00 AM"></div>
        <div class="form-field"><label>Doctor (Optional)</label><input type="text" id="rx-doc"></div>
        <button class="btn btn-primary" onclick="saveRx()">Add Prescription</button>
      </div>
      <div id="rx-list" style="margin-bottom:32px;"></div>
      
      <h3 style="margin-top:0;">Documents</h3>
      <div class="upload-box" onclick="document.getElementById('doc-file').click()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:32px; height:32px; margin-bottom:8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><br>
        + Upload Document
        <p style="font-size:12px; margin-top:4px; font-weight:normal;">Supported: PDF, JPG, PNG</p>
      </div>
      <input type="file" id="doc-file" style="display:none;" accept=".pdf,image/png,image/jpeg" onchange="uploadDoc(event)">
      
      <div id="ct-doc-list"></div>
      
    </div>
  </div>
`;
html = html.replace(/(<!-- ============ MEMORY GAME SETUP ============ -->)/, docsScreen + '\n  $1');

// 5. Inject JS logic
const jsLogic = `
  // --- IndexedDB ---
  const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('MemoryCareDB', 1);
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore('documents');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  async function storeDocumentFile(id, fileBlob) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('documents', 'readwrite');
      const store = tx.objectStore('documents');
      const req = store.put(fileBlob, id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
  
  async function deleteDocumentFile(id) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('documents', 'readwrite');
      const store = tx.objectStore('documents');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Patient Profile ---
  function loadPatientProfile() {
    const p = appData.patientProfile || {};
    document.getElementById('pt-name').value = p.name || '';
    document.getElementById('pt-age').value = p.age || '';
    document.getElementById('pt-addr').value = p.address || '';
    document.getElementById('pt-city').value = p.city || '';
    document.getElementById('pt-dist').value = p.district || '';
    document.getElementById('pt-state').value = p.state || '';
    
    const e = appData.emergencyContacts || [];
    const getC = (rel) => e.find(c => c.id === rel) || {};
    
    document.getElementById('ec-son-name').value = getC('son').name || '';
    document.getElementById('ec-son-phone').value = getC('son').phone || '';
    
    document.getElementById('ec-wife-name').value = getC('wife').name || '';
    document.getElementById('ec-wife-phone').value = getC('wife').phone || '';
    
    document.getElementById('ec-guard-name').value = getC('guard').name || '';
    document.getElementById('ec-guard-phone').value = getC('guard').phone || '';
    
    document.getElementById('ec-house-name').value = getC('house').name || '';
    document.getElementById('ec-house-phone').value = getC('house').phone || '';
    
    document.getElementById('ec-other-rel').value = getC('other').rel || '';
    document.getElementById('ec-other-name').value = getC('other').name || '';
    document.getElementById('ec-other-phone').value = getC('other').phone || '';
  }
  
  function savePatientProfile() {
    appData.patientProfile = {
      name: document.getElementById('pt-name').value,
      age: document.getElementById('pt-age').value,
      address: document.getElementById('pt-addr').value,
      city: document.getElementById('pt-city').value,
      district: document.getElementById('pt-dist').value,
      state: document.getElementById('pt-state').value
    };
    
    appData.emergencyContacts = [
      { id: 'son', rel: 'Son', name: document.getElementById('ec-son-name').value, phone: document.getElementById('ec-son-phone').value },
      { id: 'wife', rel: 'Wife', name: document.getElementById('ec-wife-name').value, phone: document.getElementById('ec-wife-phone').value },
      { id: 'guard', rel: 'Guardian', name: document.getElementById('ec-guard-name').value, phone: document.getElementById('ec-guard-phone').value },
      { id: 'house', rel: 'House Contact', name: document.getElementById('ec-house-name').value, phone: document.getElementById('ec-house-phone').value },
      { id: 'other', rel: document.getElementById('ec-other-rel').value || 'Other', name: document.getElementById('ec-other-name').value, phone: document.getElementById('ec-other-phone').value }
    ];
    
    saveData();
    showToast("Patient Profile Saved");
  }

  // --- Docs & Prescriptions ---
  function saveRx() {
    const med = document.getElementById('rx-name').value.trim();
    if(!med) { showToast('Medicine name required'); return; }
    
    if(!appData.prescriptions) appData.prescriptions = [];
    appData.prescriptions.push({
      id: Date.now().toString(),
      med: med,
      dose: document.getElementById('rx-dose').value,
      time: document.getElementById('rx-time').value,
      doctor: document.getElementById('rx-doc').value,
      date: new Date().toLocaleDateString()
    });
    
    saveData();
    
    document.getElementById('rx-name').value = '';
    document.getElementById('rx-dose').value = '';
    document.getElementById('rx-time').value = '';
    document.getElementById('rx-doc').value = '';
    
    renderDocs();
    showToast("Prescription Added");
  }

  function deleteRx(id) {
    appData.prescriptions = appData.prescriptions.filter(r => r.id !== id);
    saveData();
    renderDocs();
    showToast("Deleted");
  }

  async function uploadDoc(e) {
    const file = e.target.files[0];
    if(!file) return;
    
    const id = 'doc_' + Date.now();
    try {
      showToast("Uploading...");
      await storeDocumentFile(id, file);
      
      if(!appData.documents) appData.documents = [];
      appData.documents.push({
        id: id,
        name: file.name,
        type: file.type,
        date: new Date().toLocaleDateString()
      });
      saveData();
      renderDocs();
      showToast("Document Uploaded");
    } catch(err) {
      console.error(err);
      showToast("Upload failed");
    }
  }

  async function deleteDoc(id) {
    if(confirm('Delete document?')) {
      appData.documents = appData.documents.filter(d => d.id !== id);
      saveData();
      try {
        await deleteDocumentFile(id);
      } catch(e){}
      renderDocs();
      showToast("Deleted");
    }
  }

  function renderDocs() {
    const rxList = document.getElementById('rx-list');
    rxList.innerHTML = '';
    (appData.prescriptions || []).forEach(rx => {
      rxList.innerHTML += \`
        <div class="img-item" style="margin-bottom:8px;">
          <div class="info">
            <h4 style="margin:0; font-size:15px;">\${rx.med}</h4>
            <p style="margin:0; font-size:12px; color:var(--gray);">\${rx.dose} at \${rx.time}</p>
          </div>
          <div class="actions">
            <button class="delete" onclick="deleteRx('\${rx.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
          </div>
        </div>\`;
    });
    
    const dList = document.getElementById('ct-doc-list');
    dList.innerHTML = '';
    (appData.documents || []).forEach(d => {
      dList.innerHTML += \`
        <div class="img-item" style="margin-bottom:8px;">
          <div class="info">
            <h4 style="margin:0; font-size:15px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px;">\${d.name}</h4>
            <p style="margin:0; font-size:12px; color:var(--gray);">\${d.date}</p>
          </div>
          <div class="actions">
            <button class="delete" onclick="deleteDoc('\${d.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
          </div>
        </div>\`;
    });
  }
`;
html = html.replace(/(function showToast\(msg\)\{)/, jsLogic + '\n  $1');
html = html.replace(/(if\(id === 'memory-setup' \|\| id === 'gallery'\) renderImages\(\);)/, '$1\n    if(id === "patient") loadPatientProfile();\n    if(id === "docs-setup") renderDocs();');

fs.writeFileSync('caretaker.html', html);
console.log("Updated caretaker.html with Patient Profile and Docs logic");
