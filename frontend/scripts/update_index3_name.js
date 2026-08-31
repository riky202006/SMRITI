const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

// 1. Remove hardcoded 'Margaret'
html = html.replace(/patientName:\s*'Margaret'/, "patientName: ''");

// 2. Add #screen-name-setup
const nameSetupScreen = `
  <!-- ============ NAME SETUP ============ -->
  <div class="screen" id="screen-name-setup" style="justify-content:center; align-items:center; text-align:center; padding:24px;">
    <div style="background:#fff; padding:40px 24px; border-radius:32px; box-shadow:var(--shadow); width:100%; max-width:340px;">
      <h2 style="font-size:28px; margin:0 0 12px; color:var(--teal-dark); line-height:1.2;">By what name should I call you?</h2>
      <p style="color:var(--gray); font-size:16px; margin:0 0 32px;">Enter the name you'd like us to use.</p>
      
      <div class="input-wrap" style="margin-bottom:24px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <input id="setup-name" type="text" placeholder="Your Name" style="font-size:20px; font-weight:700;">
      </div>
      
      <button class="btn btn-primary" onclick="handleNameSetup()" style="font-size:18px; padding:16px;">CONTINUE</button>
    </div>
  </div>
`;

// Insert it right after screen-role
html = html.replace(/(<\/div>\s*<!-- ============ CAREGIVER ROLE SELECTION ============ -->)/, nameSetupScreen + '\n  $1');

// 3. Update selectRole logic
html = html.replace(/function selectRole\(role\)\s*\{[\s\S]*?\}/, `
  let selectedRole = '';
  function selectRole(role) {
    selectedRole = role;
    go('name-setup');
  }

  function getGreeting(name) {
    const hour = new Date().getHours();
    let timeOfDay = 'morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else if (hour >= 21 || hour < 4) timeOfDay = 'night';
    return \`Good \${timeOfDay}, \${name}\`;
  }

  function handleNameSetup() {
    const name = document.getElementById('setup-name').value.trim();
    if(!name) return;
    
    if(selectedRole === 'patient') {
      appData.patientName = name;
      saveApp();
      updateDashboardGreeting();
      go('home');
    } else {
      appData.caretakerName = name;
      appData.role = 'Caretaker';
      saveApp();
      window.location.href = 'caretaker.html';
    }
  }

  function updateDashboardGreeting() {
    const greetElem = document.getElementById('home-username');
    const greetTimeElem = document.getElementById('home-greeting-time'); // We will add this
    if (greetElem && appData.patientName) {
      const greeting = getGreeting(appData.patientName);
      greetElem.textContent = appData.patientName;
      if(greetTimeElem) {
        greetTimeElem.textContent = greeting.split(',')[0] + ',';
      } else {
        greetElem.textContent = greeting; // fallback
      }
    }
  }
`);

// 4. Update the Dashboard greeting HTML in index 3.html
html = html.replace(/<p class="greet">Good morning,<\/p>\s*<p class="name" id="home-username">.*?<\/p>/, 
  `<p class="greet" id="home-greeting-time">Good morning,</p>\n        <p class="name" id="home-username"></p>`);

// 5. Add updateDashboardGreeting() call on page load
html = html.replace(/appData\.liveLocation = \{ active: false \};\s*saveApp\(\);\s*\}/, 
`appData.liveLocation = { active: false };
    saveApp();
  }
  
  // Initialize greeting on load
  document.addEventListener('DOMContentLoaded', () => {
    if(appData.patientName) {
      updateDashboardGreeting();
    }
  });`);

fs.writeFileSync('index 3.html', html);
console.log("Updated index 3.html for name setup");
