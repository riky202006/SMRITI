const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

const dynamicHomeUpdate = `
      <!-- DYNAMIC HOME CONTAINERS -->
      <div id="home-medication-container" style="display:none;">
        <div class="card row-card orange" onclick="go('med-popup')" style="cursor:pointer; margin-bottom:16px;">
          <div class="row-icon orange-bg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M3 8l9-5 9 5"/><path d="M12 3v10"/></svg>
          </div>
          <div class="row-text orange-text">
            <p class="title">💊 MEDICATION REMINDER</p>
            <p class="sub" id="home-med-sub">Medicine Details</p>
          </div>
        </div>
      </div>

      <div id="home-visits-container" style="display:none; margin-bottom:16px;">
        <div class="card row-card" style="cursor:pointer; background:var(--mint-soft);">
          <div class="row-icon" style="background:var(--mint); color:var(--teal-dark);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          </div>
          <div class="row-text">
            <p class="title" style="color:var(--teal-dark);">👋 UPCOMING VISITS & APPOINTMENTS</p>
            <p class="sub" id="home-visit-sub">Visitor Details</p>
          </div>
        </div>
      </div>
`;

// Replace the existing medicine card with the dynamic ones
html = html.replace(/<div class="card row-card orange" onclick="go\('med-popup'\)"[\s\S]*?<\/div>\s*<\/div>/, dynamicHomeUpdate.trim());

// Add a script to run on go('home') to evaluate conditions
const renderHomeJS = `
  function renderDynamicHome() {
    // Check Meds
    const medContainer = document.getElementById('home-medication-container');
    const medSub = document.getElementById('home-med-sub');
    let hasActiveMed = false;
    
    // Quick active check
    const todayStr = new Date().toISOString().split('T')[0];
    if(appData.medicine && appData.medicine.length > 0) {
      for(let m of appData.medicine) {
        if(m.times) {
          for(let t of m.times) {
            if(!m.history || !m.history[todayStr] || m.history[todayStr][t] !== 'TAKEN') {
              hasActiveMed = true;
              medSub.innerHTML = m.name + ' - ' + m.dosage + ' at ' + t;
              break;
            }
          }
        }
        if(hasActiveMed) break;
      }
    }
    medContainer.style.display = hasActiveMed ? 'flex' : 'none';

    // Check Visits
    const visContainer = document.getElementById('home-visits-container');
    const visSub = document.getElementById('home-visit-sub');
    let upcomingVisit = null;
    if(appData.visits && appData.visits.length > 0) {
      upcomingVisit = appData.visits[0]; // Just take first for now
    }
    if(upcomingVisit) {
      visContainer.style.display = 'flex';
      visSub.textContent = upcomingVisit.name + ' on ' + upcomingVisit.date + ' at ' + upcomingVisit.time;
    } else {
      visContainer.style.display = 'none';
    }
  }

  function go(id){
`;

html = html.replace(/function go\(id\)\{/, renderHomeJS);

// Call renderDynamicHome in DOMContentLoaded and when go('home') is called
html = html.replace(/if\(appData\.patientName\) \{[\s\S]*?updateDashboardGreeting\(\);/, 'if(appData.patientName) {\n      updateDashboardGreeting();\n      renderDynamicHome();');
html = html.replace(/document\.getElementById\('screen-'\+id\)\.classList\.add\('active'\);/, "document.getElementById('screen-'+id).classList.add('active');\n    if(id === 'home') renderDynamicHome();");

fs.writeFileSync('index 3.html', html);
console.log('Added dynamic home rendering');
