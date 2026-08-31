const fs = require('fs');

let html = fs.readFileSync('index 3.html', 'utf8');

// 1. EXTRACT BOTTOM NAV
const navRegex = /<div class="bottom-nav">[\s\S]*?Account\s*<\/div>\s*<\/div>/;
let globalNavMatch = html.match(navRegex);
if (globalNavMatch) {
    html = html.replace(/<div class="bottom-nav">[\s\S]*?Account\s*<\/div>\s*<\/div>/g, '');
    let navHtml = globalNavMatch[0].replace(/active/g, ''); // strip hardcoded active
    navHtml = navHtml.replace(/onclick="go\('home'\)"/, 'id="nav-home" onclick="go(\'home\')"');
    navHtml = navHtml.replace(/onclick="go\('game-start'\)"/, 'id="nav-game" onclick="go(\'game-start\')"');
    navHtml = navHtml.replace(/onclick="go\('reminders'\)"/, 'id="nav-meds" onclick="go(\'reminders\')"');
    navHtml = navHtml.replace(/onclick="go\('stats'\)"/, 'id="nav-stats" onclick="go(\'stats\')"');
    navHtml = navHtml.replace(/onclick="loadAccount\(\); go\('account'\)"/, 'id="nav-account" onclick="loadAccount(); go(\'account\')"');

    // Inject before closing of device
    html = html.replace(/<\/div>\s*<div class="toast" id="toast">/, `  ${navHtml}\n  </div>\n\n<div class="toast" id="toast">`);
    console.log("Global nav extracted and injected.");
}

// 2. REMOVE EXTRA ACCOUNT BUTTON FROM HOME
html = html.replace(/<div class="card row-card" onclick="loadAccount\(\); go\('account'\)"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');
console.log("Removed extra account button from home.");

// 3. REORDER HOME SCREEN & VISITS/MEDS
// Look for the greeting area to insert Meds and Visits above Hero Card
const heroRegex = /(<div class="card card-hero" onclick="go\('game-start'\)"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/;
const medRegex = /(<div id="home-medication-container" style="display:none;">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/;
const visRegex = /(<div id="home-visits-container" style="display:none; margin-bottom:16px;">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/;

let heroMatch = html.match(heroRegex);
let medMatch = html.match(medRegex);
let visMatch = html.match(visRegex);

if (heroMatch && medMatch && visMatch) {
    // Remove from current positions
    html = html.replace(medMatch[0], '');
    html = html.replace(visMatch[0], '');
    html = html.replace(heroMatch[0], '');

    // The place to insert is right after:
    // <p class="subtitle" id="home-username">Welcome Back</p>
    // </div>
    const insertPoint = /<p class="subtitle" id="home-username">.*?<\/p>\s*<\/div>/;
    const replacement = `$&
      
      ${visMatch[0]}
      ${medMatch[0]}
      ${heroMatch[0]}
`;
    html = html.replace(insertPoint, replacement);
    console.log("Reordered Home screen.");
}

// 4. MEDS PAGE TABS (Merge Visits into Reminders screen)
// Replace `#screen-reminders` content with a tabbed interface.
const newMedsScreen = `  <div class="screen" id="screen-reminders">
    <div class="topbar">
      <div class="icon-btn" onclick="go('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
      <h2>My Meds</h2>
      <div style="width:38px;"></div>
    </div>
    
    <div style="display:flex; background:#fff; border-bottom:2px solid #eee;">
      <div id="tab-btn-meds" onclick="switchMedTab('meds')" style="flex:1; text-align:center; padding:12px; font-weight:800; border-bottom:3px solid var(--teal); color:var(--teal); cursor:pointer;">MEDICINES</div>
      <div id="tab-btn-visits" onclick="switchMedTab('visits')" style="flex:1; text-align:center; padding:12px; font-weight:800; border-bottom:3px solid transparent; color:var(--gray); cursor:pointer;">VISITS & APPOINTMENTS</div>
    </div>

    <div class="home-scroll" style="padding:16px;" id="med-tab-meds">
      <div id="patient-med-list">
        <p style="color:var(--gray); text-align:center;">No medicines scheduled.</p>
      </div>
    </div>

    <div class="home-scroll" style="padding:16px; display:none;" id="med-tab-visits">
      <div id="patient-visits-list">
        <p style="color:var(--gray); text-align:center;">No upcoming visits or appointments.</p>
      </div>
    </div>
  </div>`;

html = html.replace(/<div class="screen" id="screen-reminders">[\s\S]*?<\/div>\s*<\/div>\s*(?=<div class="screen"|<div class="toast")/, newMedsScreen + '\n\n');

// Also need to remove the old `#screen-visits` completely.
html = html.replace(/<!-- ============ VISITS & APPOINTMENTS ============ -->\s*<div class="screen" id="screen-visits">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');
console.log("Merged visits into meds screen with tabs.");

// 5. REMOVE EXTRA MEMORY GAME ON GAME SCREEN
// Currently, there's a floating Memory Game title on `#screen-game-start` or similar? Let's check `#screen-game-start`.
// It has: 
// <div class="topbar">
//   <div class="icon-btn" onclick="go('home')">...</div>
//   <h2>Memory Game</h2>
//   <div style="width:38px;"></div>
// </div>
// Wait, the user said: "There is an EXTRA: MEMORY GAME element/card/title appearing in the top-left corner. REMOVE IT. There should NOT be a duplicate Memory Game heading/card floating in the top-left corner. The existing Game interface should remain properly centered/positioned inside the application."
// I will just remove the whole `.topbar` from `#screen-game-start`.
html = html.replace(/(<div class="screen" id="screen-game-start"[^>]*>)\s*<div class="topbar">[\s\S]*?<\/div>\s*<div class="home-scroll"/, '$1\n    <div class="home-scroll"');
console.log("Removed topbar from game-start.");

// 6. UPDATE GO() FUNCTION TO HANDLE ACTIVE NAV
// Since we have a global nav, `go()` needs to update the active state.
const activeNavLogic = `
    // Update active nav
    document.querySelectorAll('.bottom-nav .nav-item').forEach(el => el.classList.remove('active'));
    if (id === 'home') { let e = document.getElementById('nav-home'); if(e) e.classList.add('active'); }
    else if (id === 'game-start' || id.startsWith('game-')) { let e = document.getElementById('nav-game'); if(e) e.classList.add('active'); }
    else if (id === 'reminders') { let e = document.getElementById('nav-meds'); if(e) e.classList.add('active'); }
    else if (id === 'stats') { let e = document.getElementById('nav-stats'); if(e) e.classList.add('active'); }
    else if (id === 'account') { let e = document.getElementById('nav-account'); if(e) e.classList.add('active'); }
`;
html = html.replace(/function go\(id\)\{/, `function go(id){\n${activeNavLogic}`);

// Also inject the switchMedTab function
const switchTabFunc = `
  function switchMedTab(tab) {
    document.getElementById('med-tab-meds').style.display = (tab==='meds') ? 'block' : 'none';
    document.getElementById('med-tab-visits').style.display = (tab==='visits') ? 'block' : 'none';
    
    document.getElementById('tab-btn-meds').style.borderColor = (tab==='meds') ? 'var(--teal)' : 'transparent';
    document.getElementById('tab-btn-meds').style.color = (tab==='meds') ? 'var(--teal)' : 'var(--gray)';
    
    document.getElementById('tab-btn-visits').style.borderColor = (tab==='visits') ? 'var(--teal)' : 'transparent';
    document.getElementById('tab-btn-visits').style.color = (tab==='visits') ? 'var(--teal)' : 'var(--gray)';
  }
`;
html = html.replace(/function go\(id\)\{/, switchTabFunc + '\n  function go(id){');

fs.writeFileSync('index_3_temp.html', html);
console.log("Done phase 1 processing.");
