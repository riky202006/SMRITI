const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

// Fix the onclick in renderDocuments
html = html.replace(/onclick="showToast\(\\'Viewing ' \+ d\.name \+ '\\'\)"/g, 'onclick="showToast(&quot;Viewing &quot; + d.name)"');
// Also let's check any other places
html = html.replace(/onclick="showToast\('Viewing ' \+ d\.name \+ '\)'\)"/g, 'onclick="showToast(&quot;Viewing &quot; + d.name)"');

// Let's inspect where "Viewing" appears
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('Viewing')) {
    console.log(`Line ${i+1}: ${l}`);
  }
});

// Replace with a clean helper function viewDocItem(name)
html = html.replace(/onclick="showToast\([^)]*d\.name[^)]*\)"/g, 'onclick="viewDocItem(\' + d.name + \')"');

// Let's replace the whole renderDocuments function with clean code
const cleanRenderDocuments = `  function viewDocItem(name) {
    showToast('Opening ' + name);
  }

  function renderDocuments() {
    // 1. Patient Profile
    const pName = appData.patientName || 'Ravi Kumar';
    const pPhone = appData.patientPhone || '+91 9876543210';
    const pAddr = appData.patientAddress || '123 Park Street, Indiranagar, Bengaluru';
    
    const docInfo = document.getElementById('doc-patient-info');
    if (docInfo) {
      docInfo.innerHTML = '<p style="margin:0 0 4px;"><strong>Name:</strong> ' + pName + '</p>' +
                          '<p style="margin:0 0 4px;"><strong>Phone:</strong> ' + pPhone + '</p>' +
                          '<p style="margin:0;"><strong>Address:</strong> ' + pAddr + '</p>';
    }

    // 2. Prescriptions
    const rxContainer = document.getElementById('doc-prescriptions');
    if (rxContainer) {
      const rxs = appData.prescriptions || [];
      if (rxs.length === 0) {
        rxContainer.innerHTML = '<p style="color:var(--gray); margin:0;">No prescriptions found.</p>';
      } else {
        let rHtml = '';
        rxs.forEach(rx => {
          rHtml += '<div class="card" style="margin-bottom:12px; border-left:4px solid var(--teal-dark); padding:14px;">' +
                   '<h4 style="margin:0 0 6px; color:var(--teal-dark);">' + rx.med + '</h4>' +
                   '<p style="margin:0 0 4px; font-size:14px;"><strong>Instructions:</strong> ' + rx.dose + '</p>' +
                   '<p style="margin:0 0 4px; font-size:14px;"><strong>Prescribed by:</strong> ' + rx.doctor + '</p>' +
                   '<p style="margin:0; font-size:12px; color:var(--gray);">Date: ' + rx.date + '</p>' +
                   '</div>';
        });
        rxContainer.innerHTML = rHtml;
      }
    }

    // 3. Document Files
    const docList = document.getElementById('doc-list');
    if (docList) {
      const docs = appData.documents || [];
      if (docs.length === 0) {
        docList.innerHTML = '<p style="color:var(--gray); margin:0;">No documents uploaded.</p>';
      } else {
        let dHtml = '';
        docs.forEach(d => {
          dHtml += '<div class="card row-card" style="margin-bottom:12px; cursor:pointer;" onclick="viewDocItem(\\\'' + d.name + '\\\')">' +
                   '<div class="row-icon gray-bg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg></div>' +
                   '<div class="row-text"><p class="title">' + d.name + '</p><p class="sub">Uploaded: ' + d.date + '</p></div>' +
                   '</div>';
        });
        docList.innerHTML = dHtml;
      }
    }

    // 4. SOS Contacts
    const sosDetails = document.getElementById('sos-patient-details');
    if (sosDetails) {
      sosDetails.innerHTML = '<p style="margin:0; font-weight:800; font-size:16px;">' + pName + '</p><p style="margin:4px 0 0; font-size:13px; color:var(--gray);">' + pAddr + '</p>';
    }

    const sosList = document.getElementById('sos-contact-list');
    if (sosList) {
      const contacts = appData.emergencyContacts || [];
      let sHtml = '';
      contacts.forEach(c => {
        sHtml += '<div class="card" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; padding:14px;">' +
                 '<div><h4 style="margin:0 0 4px; font-size:16px;">' + c.name + ' (' + c.rel + ')</h4><p style="margin:0; font-size:13px; color:var(--gray);">' + c.phone + '</p></div>' +
                 '<button class="btn" style="background:#d32f2f; color:#fff; padding:10px 18px; border-radius:12px; width:auto;" onclick="callSOS(\\\'' + c.phone + '\\\')">CALL</button>' +
                 '</div>';
      });
      sosList.innerHTML = sHtml;
    }
  }`;

html = html.replace(/function renderDocuments\(\)[\s\S]*?\n  \}/, cleanRenderDocuments);

fs.writeFileSync('index 3.html', html);
console.log('Fixed renderDocuments syntax.');
