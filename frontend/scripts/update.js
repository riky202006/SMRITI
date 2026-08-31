const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

// 1. Add CSS
const newCss = `
  /* ---------- New Screens CSS ---------- */
  .role-card {
    background: #fff;
    border-radius: 20px;
    padding: 24px;
    text-align: center;
    box-shadow: var(--shadow);
    margin-bottom: 16px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
  }
  .role-card:active { transform: scale(0.97); }
  .role-card.active { border-color: var(--teal-dark); background: var(--mint-soft); }
  .role-card h2 { margin: 0; color: var(--teal-dark); font-size: 22px; }
  
  .gallery-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .gallery-item {
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow);
    text-align: center;
    padding-bottom: 8px;
  }
  .gallery-item img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    margin-bottom: 8px;
  }
  .gallery-item .name { font-weight: 800; font-size: 14px; color: var(--ink); }
`;
html = html.replace('::-webkit-scrollbar{width:0px;}', newCss + '\n  ::-webkit-scrollbar{width:0px;}');

// 2. Modify Splash Screen
html = html.replace('id="screen-splash" onclick="go(\'login\')"', 'id="screen-splash" onclick="go(\'role\')"');

// 3. Add New HTML Screens
const newHtml = `
  <!-- ============ ROLE SELECTION ============ -->
  <div class="screen" id="screen-role">
    <div style="padding:48px 28px;text-align:center;">
      <h1 style="font-size:28px; margin-bottom: 24px;">How would you like to continue?</h1>
      <div class="role-card" onclick="go('login')">
        <h2>PATIENT</h2>
      </div>
      <div class="role-card" onclick="go('caretaker-role')">
        <h2>CARETAKER</h2>
      </div>
    </div>
  </div>

  <!-- ============ CAREGIVER ROLE SELECTION ============ -->
  <div class="screen" id="screen-caretaker-role">
    <div class="topbar">
      <div class="icon-btn" onclick="go('role')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
      <h2>What is your role?</h2>
      <div style="width:38px;"></div>
    </div>
    <div style="padding:24px; display:flex; flex-direction:column; gap:16px;">
      <button class="option-btn" onclick="setCaretakerRole('Guardian / Family')">Guardian / Family Member</button>
      <button class="option-btn" onclick="setCaretakerRole('Professional')">Professional Caretaker</button>
      <button class="option-btn" onclick="setCaretakerRole('Hospital')">Hospital / Healthcare Worker</button>
      <button class="option-btn" onclick="setCaretakerRole('Other')">Other</button>
    </div>
  </div>

  <!-- ============ CAREGIVER LOGIN ============ -->
  <div class="screen" id="screen-caretaker-login">
    <div class="topbar">
      <div class="icon-btn" onclick="go('caretaker-role')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
      <h2>Caretaker Login</h2>
      <div style="width:38px;"></div>
    </div>
    <div style="padding:24px;">
      <div class="field">
        <label>Email / ID</label>
        <div class="input-wrap"><input id="clogin-id" type="text" placeholder="Enter ID"></div>
      </div>
      <div class="field">
        <label>Password</label>
        <div class="input-wrap"><input id="clogin-pass" type="password" placeholder="Enter Password"></div>
      </div>
      <button class="btn btn-primary" style="margin-top:20px;" onclick="handleCaretakerLogin()">Login</button>
    </div>
  </div>

  <!-- ============ CAREGIVER DASHBOARD ============ -->
  <div class="screen" id="screen-caretaker-dashboard">
    <div class="topbar">
      <h2>Care Dashboard</h2>
      <div class="icon-btn" onclick="go('role')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg></div>
    </div>
    <div class="home-scroll">
      <p style="margin:0 0 16px; font-weight:700;">Assigned Patient: <span id="dash-patient-name">Patient Name</span></p>
      
      <div class="card card-hero" onclick="go('personalize')" style="cursor:pointer; background:var(--mint-soft);">
        <div class="title" style="font-size:18px;">🖼️ Personalize Game</div>
        <p class="subtitle">Add patient photos & names</p>
      </div>

      <div class="card row-card" onclick="go('c-analytics')" style="cursor:pointer;">
        <div class="row-icon gray-bg">📊</div>
        <div class="row-text"><p class="title">Patient Analytics</p></div>
      </div>

      <div class="card row-card" onclick="go('c-medicine')" style="cursor:pointer;">
        <div class="row-icon gray-bg">💊</div>
        <div class="row-text"><p class="title">Configure Medicine</p></div>
      </div>

      <div class="card row-card" onclick="go('c-gallery')" style="cursor:pointer;">
        <div class="row-text"><p class="title">📸 Manage Gallery</p></div>
      </div>
    </div>
  </div>

  <!-- ============ PERSONALIZE GAME ============ -->
  <div class="screen" id="screen-personalize">
    <div class="topbar">
      <div class="icon-btn" onclick="go('caretaker-dashboard')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
      <h2>Personalize Game</h2>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll">
      <p style="font-size:14px; color:var(--gray);">Add up to 10 personalized images (e.g. family members) for the Memory Game.</p>
      
      <div id="personalized-images-list" class="gallery-grid" style="margin-bottom:16px;"></div>
      
      <div class="form-card" id="add-image-form" style="display:none; margin-bottom:16px;">
        <div class="form-field">
          <label>Select Image</label>
          <input type="file" id="image-upload" accept="image/*" onchange="previewImage(this)">
          <img id="image-preview" style="width:100%; height:150px; object-fit:cover; display:none; margin-top:10px; border-radius:12px;">
        </div>
        <div class="form-field">
          <label>Who is this? (Name)</label>
          <input type="text" id="image-name" placeholder="e.g. Grandma">
        </div>
        <button class="btn btn-primary" onclick="savePersonalizedImage()">Save Image</button>
      </div>
      
      <button class="btn btn-outline" id="btn-add-image" onclick="document.getElementById('add-image-form').style.display='block';">+ Add Image</button>
    </div>
  </div>

  <!-- ============ CAREGIVER ANALYTICS ============ -->
  <div class="screen" id="screen-c-analytics">
    <div class="topbar">
      <div class="icon-btn" onclick="go('caretaker-dashboard')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
      <h2>Patient Analytics</h2>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll">
      <div class="stat-grid">
        <div class="stat-card">
          <p class="label">Games Completed</p>
          <p class="value" id="c-stat-games">0</p>
        </div>
        <div class="stat-card">
          <p class="label">Total Score</p>
          <p class="value" id="c-stat-score">0</p>
        </div>
        <div class="stat-card">
          <p class="label">Correct Answers</p>
          <p class="value" id="c-stat-correct">0</p>
        </div>
        <div class="stat-card">
          <p class="label">Incorrect Answers</p>
          <p class="value" id="c-stat-incorrect">0</p>
        </div>
      </div>
      <p style="color:var(--gray); font-size:14px; text-align:center;">These metrics indicate cognitive engagement and activity. They are not a medical diagnosis.</p>
    </div>
  </div>

  <!-- ============ CAREGIVER MEDICINE CONFIG ============ -->
  <div class="screen" id="screen-c-medicine">
    <div class="topbar">
      <div class="icon-btn" onclick="go('caretaker-dashboard')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
      <h2>Set Medicine</h2>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll">
      <div class="form-card">
        <div class="form-field">
          <label>Medicine Name</label>
          <input type="text" id="med-config-name" placeholder="e.g. Donepezil">
        </div>
        <div class="form-field">
          <label>Time</label>
          <input type="time" id="med-config-time">
        </div>
        <button class="btn btn-primary" onclick="saveMedicineConfig()">Save Reminder</button>
      </div>
      <p style="margin-top:20px; font-weight:800;">Current Reminders</p>
      <div id="c-medicine-list"></div>
      
      <button class="btn btn-outline" style="margin-top:40px;" onclick="triggerMedicinePopup()">TEST POPUP ON PATIENT SIDE</button>
    </div>
  </div>
  
  <!-- ============ CAREGIVER GALLERY MANAGE ============ -->
  <div class="screen" id="screen-c-gallery">
    <div class="topbar">
      <div class="icon-btn" onclick="go('caretaker-dashboard')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
      <h2>Manage Gallery</h2>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll">
      <p style="font-size:14px; color:var(--gray);">All personalized images uploaded for this patient.</p>
      <div id="c-gallery-list" class="gallery-grid"></div>
    </div>
  </div>

  <!-- ============ PATIENT GALLERY ============ -->
  <div class="screen" id="screen-p-gallery">
    <div class="topbar">
      <div class="icon-btn" onclick="go('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
      <h2>My Gallery</h2>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll">
      <div id="p-gallery-list" class="gallery-grid"></div>
    </div>
  </div>

  <!-- ============ GAME RESULTS ============ -->
  <div class="screen" id="screen-game-result">
    <div style="padding:60px 24px; text-align:center; display:flex; flex-direction:column; align-items:center; height:100%;">
      <div class="hero-icon" style="background:var(--mint); width:100px; height:100px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg></div>
      <h1 style="font-size:32px; font-weight:800; margin-top:20px; color:var(--teal-dark);">Game Complete</h1>
      <p style="font-size:18px; color:var(--gray); margin-bottom:40px;">Great job today!</p>
      
      <div style="background:#fff; border-radius:20px; padding:20px; width:100%; box-shadow:var(--shadow); margin-bottom:40px;">
        <p style="font-size:24px; font-weight:800; margin:0;">Score: <span id="result-score">0</span></p>
        <p style="color:var(--gray); margin-top:8px;">Correct Answers: <span id="result-correct">0</span> / 10</p>
      </div>

      <button class="btn btn-primary" onclick="startGame()">Play Again</button>
      <button class="btn btn-outline" style="margin-top:16px;" onclick="go('stats')">View Progress</button>
    </div>
  </div>
`;
html = html.replace('<!-- ============ LOGIN ============ -->', newHtml + '\n  <!-- ============ LOGIN ============ -->');

// 4. Modify Home Screen to add Gallery button
const galleryBtnHtml = `
      <div class="card row-card" onclick="go('p-gallery')" style="cursor:pointer; margin-top:16px;">
        <div class="row-icon gray-bg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </div>
        <div class="row-text">
          <p class="title">🖼️ GALLERY</p>
          <p class="sub">View your photos</p>
        </div>
      </div>
`;
html = html.replace('<!-- ============ BOTTOM NAV ============ -->', galleryBtnHtml + '\n    <!-- ============ BOTTOM NAV ============ -->'); // wait, the comment is actually Bottom nav
html = html.replace('<div class="bottom-nav">', galleryBtnHtml + '\n    </div>\n    <div class="bottom-nav">');

// 5. JavaScript Logic Overrides
const jsAdditions = `
  // ---------- DATA PERSISTENCE ----------
  let appData = JSON.parse(localStorage.getItem('meca_data_v2')) || {
    patientName: 'Margaret',
    role: null,
    images: [], // {id, dataUrl, name}
    medicine: [],
    stats: { games: 0, score: 0, correct: 0, incorrect: 0 },
    currentGameCorrect: 0
  };
  function saveApp() { localStorage.setItem('meca_data_v2', JSON.stringify(appData)); }

  function selectRole(role) {
    if(role === 'patient') go('login');
    else go('caretaker-role');
  }
  
  function setCaretakerRole(role) {
    appData.role = role;
    saveApp();
    go('caretaker-login');
  }

  function handleCaretakerLogin() {
    go('caretaker-dashboard');
    document.getElementById('dash-patient-name').textContent = appData.patientName;
  }

  // Override handleLogin to use saved name
  function handleLogin(){
    const name = document.getElementById('login-name').value.trim();
    if(name) { appData.patientName = name; saveApp(); }
    document.getElementById('home-username').textContent = appData.patientName;
    go('home');
  }

  // ---------- IMAGE MANAGEMENT ----------
  function previewImage(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById('image-preview').src = e.target.result;
        document.getElementById('image-preview').style.display = 'block';
      }
      reader.readAsDataURL(input.files[0]);
    }
  }

  function savePersonalizedImage() {
    if(appData.images.length >= 10) { showToast('Maximum 10 images allowed.'); return; }
    const name = document.getElementById('image-name').value.trim();
    const src = document.getElementById('image-preview').src;
    if(!name || !src || src.includes('index 3.html')) { showToast('Please select image and enter name.'); return; }
    
    appData.images.push({ id: Date.now(), dataUrl: src, name: name });
    saveApp();
    
    document.getElementById('image-name').value = '';
    document.getElementById('image-upload').value = '';
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('add-image-form').style.display = 'none';
    showToast('Image saved!');
    renderGalleries();
  }
  
  function removeImage(id) {
    appData.images = appData.images.filter(img => img.id !== id);
    saveApp();
    renderGalleries();
  }

  function renderGalleries() {
    let html = '';
    appData.images.forEach(img => {
      html += '<div class="gallery-item"><img src="'+img.dataUrl+'"><div class="name">'+img.name+'</div><button onclick="removeImage('+img.id+')" style="color:red;font-size:12px;margin-top:4px;">Remove</button></div>';
    });
    const cList = document.getElementById('personalized-images-list');
    if(cList) cList.innerHTML = html;
    const cgList = document.getElementById('c-gallery-list');
    if(cgList) cgList.innerHTML = html;
    
    // Patient gallery (no remove button)
    let pHtml = '';
    appData.images.forEach(img => {
      pHtml += '<div class="gallery-item"><img src="'+img.dataUrl+'"><div class="name">'+img.name+'</div></div>';
    });
    const pList = document.getElementById('p-gallery-list');
    if(pList) pList.innerHTML = pHtml;
    
    if(appData.images.length >= 10 && document.getElementById('btn-add-image')) {
      document.getElementById('btn-add-image').style.display = 'none';
    }
  }

  // ---------- MEDICINE MANAGEMENT ----------
  function saveMedicineConfig() {
    const name = document.getElementById('med-config-name').value;
    const time = document.getElementById('med-config-time').value;
    if(!name || !time) return;
    appData.medicine.push({name, time});
    saveApp();
    document.getElementById('med-config-name').value='';
    renderMedicine();
    showToast('Reminder saved!');
  }

  function renderMedicine() {
    let html = '';
    appData.medicine.forEach(m => {
      html += '<div class="task-card"><div><p class="task-title">'+m.name+'</p><p class="task-time">'+m.time+'</p></div></div>';
    });
    const list = document.getElementById('c-medicine-list');
    if(list) list.innerHTML = html;
  }
  
  function triggerMedicinePopup() {
    if(appData.medicine.length === 0) { showToast('Add a medicine first!'); return; }
    const m = appData.medicine[0];
    document.querySelector('.med-info .name').textContent = m.name;
    document.querySelector('.med-info .when').textContent = m.time;
    go('med-popup');
  }

  // ---------- ANALYTICS ----------
  function updateAnalyticsDisplay() {
    document.getElementById('c-stat-games').textContent = appData.stats.games;
    document.getElementById('c-stat-score').textContent = appData.stats.score;
    document.getElementById('c-stat-correct').textContent = appData.stats.correct;
    document.getElementById('c-stat-incorrect').textContent = appData.stats.incorrect;
  }

  // Hook into go() to render dynamic lists when navigating
  const oldGo = go;
  go = function(id) {
    if(id === 'personalize' || id === 'c-gallery' || id === 'p-gallery') renderGalleries();
    if(id === 'c-medicine') renderMedicine();
    if(id === 'c-analytics') updateAnalyticsDisplay();
    oldGo(id);
  };

  // ---------- GAME GENERATION AND OVERRIDE ----------
  let currentRounds = [];
  function generateDynamicRounds() {
    let aiMock = [
      { img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500', name: 'Computer' },
      { img: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500', name: 'Ocean' },
      { img: 'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?w=500', name: 'Mountain' },
      { img: 'https://live.staticflickr.com/7139/7774256944_f2b1e42d07_o.jpg', name: 'Apple' }
    ];
    let pers = [...appData.images];
    let allNames = pers.map(p=>p.name).concat(aiMock.map(a=>a.name), ["Cat", "Dog", "House", "Car", "Tree"]);
    
    function getOpts(correct) {
      let opts = new Set([correct]);
      let shuffled = [...allNames].sort(()=>Math.random()-0.5);
      for(let x of shuffled) { if(opts.size<4) opts.add(x); }
      return Array.from(opts).sort(()=>Math.random()-0.5);
    }
    
    let generated = [];
    pers.sort(()=>Math.random()-0.5); // randomize order
    aiMock.sort(()=>Math.random()-0.5);
    
    let pIdx = 0, aIdx = 0;
    for(let i=0; i<10; i++) {
      let src;
      if (pers.length > 0 && (i % 2 === 0 || aIdx >= aiMock.length)) {
        src = pers[pIdx % pers.length];
        pIdx++;
      } else {
        src = aiMock[aIdx % aiMock.length];
        aIdx++;
      }
      generated.push({ img: src.dataUrl || src.img, name: src.name, options: getOpts(src.name) });
    }
    return generated;
  }

  // Override startGame
  function startGame() {
    appData.currentGameCorrect = 0;
    currentRounds = generateDynamicRounds();
    roundIndex = 0;
    go('game-ready');
    setupReadyScreen();
  }

  // Override setupReadyScreen
  function setupReadyScreen(){
    const round = currentRounds[roundIndex];
    const stimCard = document.getElementById('stim-card');
    stimCard.innerHTML = \`<img src="\${round.img}" alt="\${round.name}">\`;
    document.getElementById('q-num-ready').textContent = (roundIndex + 1);
    document.getElementById('q-num-q').textContent = (roundIndex + 1);

    let timeLeft = 10;
    document.getElementById('timer-start').textContent = timeLeft + 's';
    document.getElementById('timer-fill').style.width = '100%';
    clearInterval(timerInterval);
    timerInterval = setInterval(()=>{
      timeLeft -= 1;
      document.getElementById('timer-start').textContent = Math.max(timeLeft,0) + 's';
      document.getElementById('timer-fill').style.width = Math.max(timeLeft,0)*10 + '%';
      if(timeLeft <= 0){
        clearInterval(timerInterval);
        showQuestion();
      }
    }, 1000);
  }

  // Override showQuestion
  function showQuestion(){
    clearInterval(timerInterval);
    const round = currentRounds[roundIndex];
    const wrap = document.getElementById('options-wrap');
    wrap.innerHTML = '';
    round.options.forEach(opt=>{
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.onclick = ()=>selectAnswer(opt, round.name, btn);
      wrap.appendChild(btn);
    });
    go('game-question');
  }

  // Override selectAnswer
  function selectAnswer(selected, correct, btnEl){
    const allBtns = document.querySelectorAll('#options-wrap .option-btn');
    allBtns.forEach(b=>b.disabled = true);
    if(selected === correct){
      btnEl.classList.add('correct');
      document.getElementById('correct-heading').textContent = "Well Done! 🎉";
      document.getElementById('correct-sub').textContent = "That's correct.";
      appData.stats.correct++;
      appData.stats.score += 10;
      appData.currentGameCorrect++;
      buildDots(true);
      setTimeout(()=>go('game-correct'), 500);
    } else {
      btnEl.classList.add('wrong');
      allBtns.forEach(b=>{ if(b.textContent === correct) b.classList.add('correct'); });
      document.getElementById('correct-heading').textContent = "Nice try!";
      document.getElementById('correct-sub').textContent = "The answer was " + correct + ".";
      appData.stats.incorrect++;
      buildDots(false);
      setTimeout(()=>go('game-correct'), 1500);
    }
    saveApp();
  }

  // Override nextQuestion
  function nextQuestion(){
    roundIndex += 1;
    if(roundIndex >= 10){
      appData.stats.games++;
      saveApp();
      document.getElementById('result-score').textContent = appData.currentGameCorrect * 10;
      document.getElementById('result-correct').textContent = appData.currentGameCorrect;
      go('game-result');
      return;
    }
    go('game-ready');
    setupReadyScreen();
  }
`;

// Insert JS overrides right before </script>
html = html.replace('</script>', jsAdditions + '\n</script>');

// Make sure existing functions don't conflict, although redefining them with 'function name()' will overwrite them in global scope due to hoisting!
// Wait, function declarations can be overwritten. Let's just make sure to rename the old ones or just let the new ones overwrite.
// JS hoisting: the last function declaration with the same name in the same scope wins.
// So appending the overrides at the end of the script block is perfect!

fs.writeFileSync('index 3.html', html);
console.log('Update complete.');
