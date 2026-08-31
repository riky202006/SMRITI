const fs = require('fs');
let html = fs.readFileSync('caretaker.html', 'utf8');

const nameSetupScreen = `
  <!-- ============ NAME SETUP ============ -->
  <div class="screen" id="screen-name-setup" style="justify-content:center; align-items:center; text-align:center; padding:24px;">
    <div style="background:#fff; padding:40px 24px; border-radius:32px; box-shadow:var(--shadow); width:100%; max-width:340px;">
      <h2 style="font-size:28px; margin:0 0 12px; color:var(--teal-dark); line-height:1.2;">By what name should I call you?</h2>
      <p style="color:var(--gray); font-size:16px; margin:0 0 32px;">Enter the name you'd like us to use.</p>
      
      <div class="input-wrap" style="margin-bottom:24px; display:flex; align-items:center; gap:10px; border:2px solid #e6e3db; border-radius:16px; padding:14px 16px; background:#fff;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px; height:20px; color:#8a877e;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <input id="setup-name" type="text" placeholder="Your Name" style="font-size:20px; font-weight:700; border:none; outline:none; width:100%; color:var(--ink);">
      </div>
      
      <button class="btn btn-primary" onclick="handleNameSetup()" style="font-size:18px; padding:16px;">CONTINUE</button>
    </div>
  </div>
`;

// Insert after screen-role
html = html.replace(/(<\/div>\s*<!-- ============ DASHBOARD ============ -->)/, nameSetupScreen + '\n  $1');

// Change role selection to go to name-setup instead of dashboard
html = html.replace(/go\('dashboard'\)/g, "go('name-setup')");

// Add JS
const jsLogic = `
  function handleNameSetup() {
    const name = document.getElementById('setup-name').value.trim();
    if(!name) return;
    
    appData.caretakerName = name;
    localStorage.setItem('meca_data_v2', JSON.stringify(appData));
    
    document.getElementById('ct-greeting').textContent = getGreeting(appData.caretakerName);
    document.getElementById('ct-name').textContent = appData.caretakerName;
    go('dashboard');
  }
`;

html = html.replace(/function getGreeting\(name\) \{/, jsLogic + '\n\n  function getGreeting(name) {');

fs.writeFileSync('caretaker.html', html);
console.log("Updated caretaker.html with name setup");
