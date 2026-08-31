const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

// 1. Dashboard modifications
let docsCard = `
      <div class="card row-card" onclick="go('documents')" style="cursor:pointer; margin-top:16px;">
        <div class="row-icon gray-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <div class="row-text">
          <p class="title">📄 MY DOCUMENTS</p>
          <p class="sub">View medical files</p>
        </div>
      </div>
      
      <div class="card row-card" onclick="go('sos')" style="cursor:pointer; margin-top:16px; border:2px solid #ffebee;">
        <div class="row-icon" style="background:#d32f2f; color:#fff;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
        </div>
        <div class="row-text">
          <p class="title" style="color:#d32f2f;">🚨 SOS</p>
          <p class="sub">Emergency Contacts & Location</p>
        </div>
      </div>
`;
html = html.replace(/(<div class="card row-card" onclick="go\('documents'\)".*?<\/div>\s*<\/div>)/s, docsCard);

// 2. Remove SOS button from Documents screen
html = html.replace(/<button class="btn btn-primary" style="background:#d32f2f; margin-bottom:24px;" onclick="go\('sos'\)">🚨 SOS \/ EMERGENCY<\/button>/, '');

// 3. Update SOS Screen to include Live Tracking
const trackingUI = `
      <h3 style="margin-top:24px;">Live Tracking</h3>
      <div class="card" style="text-align:center;">
        <p style="font-size:18px; font-weight:700; margin-bottom:16px;">Status: <span id="track-status" style="color:var(--gray);">● Tracking OFF</span></p>
        <button id="btn-track-on" class="btn btn-primary" style="margin-bottom:12px;" onclick="toggleTracking(true)">TURN ON LIVE TRACKING</button>
        <button id="btn-track-off" class="btn" style="background:var(--gray-light); color:var(--ink); display:none;" onclick="toggleTracking(false)">TURN OFF LIVE TRACKING</button>
        <p id="track-msg" style="font-size:13px; color:var(--gray); margin-top:12px;"></p>
      </div>
`;
html = html.replace(/(<div id="sos-contact-list"><\/div>)/, '$1\n' + trackingUI);

// 4. Memory Game Quit Button & Dialog
const quitDialogHtml = `
  <!-- ============ QUIT CONFIRMATION ============ -->
  <div class="screen" id="screen-quit-confirm" style="background:rgba(0,0,0,0.6); position:absolute; top:0; left:0; width:100%; height:100%; z-index:999; display:none; flex-direction:column; justify-content:center; padding:24px;">
    <div style="background:var(--cream); padding:32px 24px; border-radius:24px; text-align:center;">
      <h2 style="margin-top:0;">Do you want to quit the game?</h2>
      <button class="btn btn-primary" style="margin-bottom:12px;" onclick="continueGame()">Continue Game</button>
      <button class="btn" style="background:var(--gray-light); color:var(--ink);" onclick="confirmQuitGame()">Quit Game</button>
    </div>
  </div>
`;

// Insert quit dialog
html = html.replace(/(<!-- ============ GAME: READY ============ -->)/, quitDialogHtml + '\n  $1');

// Add Quit Button to Question screen (gq-top)
html = html.replace(/(<div class="gq-top">.*?)(<\/div>)/s, '$1<button onclick="requestQuit()" style="background:none; border:none; color:var(--gray); font-weight:700; font-size:14px; cursor:pointer;">QUIT GAME</button>$2');

// Add Quit Button to Ready screen (game-ready-top)
// Wait, the Ready screen uses `game-header`, let's just put it in gq-top equivalent
html = html.replace(/(<div class="game-header">)/, '<div class="game-header" style="justify-content:space-between;">\n      <button onclick="requestQuit()" style="background:none; border:none; color:var(--gray); font-weight:700; font-size:14px; cursor:pointer;">QUIT GAME</button>');

// 5. Inject JavaScript for Tracking & Quitting
const scriptInjection = `
  // --- Tracking Logic ---
  let trackingWatchId = null;
  function toggleTracking(enable) {
    if(enable) {
      if(!navigator.geolocation) {
        document.getElementById('track-msg').textContent = "Location services not supported by browser.";
        return;
      }
      document.getElementById('track-msg').textContent = "Requesting permission...";
      trackingWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          document.getElementById('track-status').innerHTML = '● Live Tracking ON';
          document.getElementById('track-status').style.color = '#d32f2f';
          document.getElementById('btn-track-on').style.display = 'none';
          document.getElementById('btn-track-off').style.display = 'block';
          document.getElementById('track-msg').textContent = "Location updating...";
          
          appData.liveLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            time: new Date().toLocaleTimeString(),
            active: true
          };
          saveApp();
        },
        (err) => {
          document.getElementById('track-msg').textContent = "Location permission is required to enable live tracking.";
        },
        { enableHighAccuracy: true }
      );
    } else {
      if(trackingWatchId !== null) {
        navigator.geolocation.clearWatch(trackingWatchId);
        trackingWatchId = null;
      }
      document.getElementById('track-status').innerHTML = '● Tracking OFF';
      document.getElementById('track-status').style.color = 'var(--gray)';
      document.getElementById('btn-track-on').style.display = 'block';
      document.getElementById('btn-track-off').style.display = 'none';
      document.getElementById('track-msg').textContent = "";
      
      appData.liveLocation = { active: false };
      saveApp();
    }
  }

  // --- Quit Game Logic ---
  function requestQuit() {
    document.getElementById('screen-quit-confirm').style.display = 'flex';
  }
  function continueGame() {
    document.getElementById('screen-quit-confirm').style.display = 'none';
  }
  function confirmQuitGame() {
    document.getElementById('screen-quit-confirm').style.display = 'none';
    if(window.timerAnimationFrame) {
      cancelAnimationFrame(window.timerAnimationFrame);
      window.timerAnimationFrame = null;
    }
    // Return to home
    go('home');
  }
`;

html = html.replace(/(function go\(id\)\{)/, scriptInjection + '\n  $1');

fs.writeFileSync('index 3.html', html);
console.log("Updated index 3.html for Part 1 (My Documents), Part 3-5 (SOS & Tracking), and Part 11-14 (Quit Game)");
