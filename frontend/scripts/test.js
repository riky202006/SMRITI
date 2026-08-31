
  // ---------- Navigation ----------
  function go(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById('screen-'+id).classList.add('active');
    window.scrollTo(0,0);
  }

  function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(()=>t.classList.remove('show'), 1800);
  }

  // ---------- Intake ----------
  function setIntakeTab(which){
    document.getElementById('tab-new-intake').classList.toggle('active', which==='new');
    document.getElementById('tab-compare').classList.toggle('active', which==='compare');
  }

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

  // ---------- GAME LOGIC ----------
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

  
  let roundIndex = 0;
  function startGame() {
    appData.currentGameCorrect = 0;
    currentRounds = generateDynamicRounds();
    roundIndex = 0;
    go('game-ready');
    setupReadyScreen();
  }

  
  let timerInterval;
  function setupReadyScreen(){
    const round = currentRounds[roundIndex];
    const stimCard = document.getElementById('stim-card');
    stimCard.innerHTML = `<img src="${round.img}" alt="${round.name}">`;
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

  
  function showQuestion(){
    clearInterval(timerInterval);
    const round = currentRounds[roundIndex];
        const qImgContainer = document.getElementById('question-image-container');
    if (qImgContainer) {
      qImgContainer.innerHTML = '<img src="' + round.img + '" style="width:100%; max-height:200px; object-fit:cover; border-radius:16px;">';
    }
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

  
    function buildDots(correct){
    const row = document.getElementById('dots-row');
    if(!row) return;
    row.innerHTML = '';
    const q = roundIndex % 10;
    for(let i=0;i<10;i++){
      const d = document.createElement('div');
      d.className = 'dot' + (i <= q ? ' filled' : '');
      row.appendChild(d);
    }
  }

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


  // Background Medicine Checker
  setInterval(() => {
    let now = new Date();
    let timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    if(appData.medicine && document.querySelector('.screen.active').id.includes('home')) {
      appData.medicine.forEach(m => {
        if(m.time === timeStr && !m.shownToday) {
          m.shownToday = true;
          document.querySelector('.med-info .name').textContent = m.name;
          document.querySelector('.med-info .when').textContent = m.time;
          go('med-popup');
        }
      });
    }
  }, 10000);


