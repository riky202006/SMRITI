const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

const accountCard = `
      <div class="card row-card" onclick="loadAccount(); go('account')" style="cursor:pointer; margin-top:16px;">
        <div class="row-icon gray-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
        <div class="row-text">
          <p class="title">👤 ACCOUNT</p>
          <p class="sub">View and edit your profile</p>
        </div>
      </div>
`;

// Insert after SOS card
html = html.replace(/(<div class="card row-card" onclick="go\('sos'\)"[\s\S]*?<\/div>\s*<\/div>)/, '$1\n' + accountCard);

const accountScreen = `
  <!-- ============ ACCOUNT ============ -->
  <div class="screen" id="screen-account">
    <div class="topbar">
      <div class="icon-btn" onclick="go('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
      <h2>My Account</h2>
      <div style="width:38px;"></div>
    </div>
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
      
      <button class="btn btn-primary" onclick="saveAccount()" style="margin-top:20px;">SAVE CHANGES</button>
    </div>
  </div>
`;

// Insert account screen before documents screen
html = html.replace(/<!-- ============ DOCUMENTS ============ -->/, accountScreen + '\n\n  <!-- ============ DOCUMENTS ============ -->');

// Add account logic
const accountLogic = `
  function loadAccount() {
    document.getElementById('acc-name').value = appData.patientName || '';
    document.getElementById('acc-phone').value = appData.patientPhone || '';
    document.getElementById('acc-address').value = appData.patientAddress || '';
  }
  function saveAccount() {
    appData.patientName = document.getElementById('acc-name').value.trim();
    appData.patientPhone = document.getElementById('acc-phone').value.trim();
    appData.patientAddress = document.getElementById('acc-address').value.trim();
    saveApp();
    updateDashboardGreeting();
    showToast('Account saved');
    go('home');
  }
`;

html = html.replace(/function go\(id\)\{/, accountLogic + '\n  function go(id){');

fs.writeFileSync('index 3.html', html);
console.log('Account added to index 3.html');
