const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

// 1. Remove all old/duplicate quit buttons I may have added
html = html.replace(/<div style="display:flex; justify-content:flex-end; padding:.*?"><button onclick="requestQuit\(\)".*?<\/button><\/div>/g, '');
html = html.replace(/<button onclick="requestQuit\(\)".*?<\/button>/g, '');

// 2. Add Quit button to game-ready screen (look carefully)
html = html.replace(/(<div class="screen" id="screen-game-ready">)/, 
  `$1\n    <div style="display:flex; justify-content:flex-end; padding:16px 16px 0;"><button onclick="requestQuit()" style="background:var(--gray-light); border:none; border-radius:12px; padding:8px 16px; color:var(--ink); font-weight:800; font-size:14px; cursor:pointer;">QUIT GAME</button></div>`);

// 3. Add Quit button to game-question screen (who is this)
html = html.replace(/(<div class="screen" id="screen-game-question">)/, 
  `$1\n    <div style="display:flex; justify-content:flex-end; padding:16px 16px 0;"><button onclick="requestQuit()" style="background:var(--gray-light); border:none; border-radius:12px; padding:8px 16px; color:var(--ink); font-weight:800; font-size:14px; cursor:pointer;">QUIT GAME</button></div>`);

// 4. Change Dashboard Memory Game to point to game-start
html = html.replace(/(<div class="card card-hero" onclick=")startGame(\(\)" style="cursor:pointer;">)/, '$1go(\'game-start\')$2');

// 5. Add Game Start, Instructions, and Countdown screens
const newScreens = `
  <!-- ============ GAME START ============ -->
  <div class="screen" id="screen-game-start">
    <div class="top-nav">
      <div class="icon-btn" onclick="go('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></div>
      <span class="title">Memory Game</span>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll" style="align-items:center; justify-content:center; text-align:center;">
      <h2 style="font-size:32px; margin-bottom:8px;">Test Your Memory</h2>
      <p style="color:var(--gray); margin-bottom:32px; font-size:18px;">A simple game to exercise your mind.</p>
      <button class="btn btn-primary" style="margin-bottom:16px;" onclick="startCountdown()">START GAME</button>
      <button class="btn" style="background:var(--gray-light); color:var(--ink);" onclick="go('game-instructions')">HOW TO PLAY</button>
      <button class="btn" style="background:none; color:var(--gray); margin-top:16px;" onclick="go('home')">BACK</button>
    </div>
  </div>

  <!-- ============ GAME INSTRUCTIONS ============ -->
  <div class="screen" id="screen-game-instructions">
    <div class="top-nav">
      <div class="icon-btn" onclick="go('game-start')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></div>
      <span class="title">How to Play</span>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll" style="font-size:18px; line-height:1.6;">
      <p>1. Look carefully at the images.</p>
      <p>2. Remember the person/object and their name.</p>
      <p>3. Images will appear in a random order.</p>
      <p>4. Answer the question: <br><strong style="font-size:24px; color:var(--teal);">"Who is this?"</strong></p>
      <p>5. Select the correct name.</p>
      <p>6. Try to remember as many as possible.</p>
      <p>7. You can quit the game at any time.</p>
      
      <div style="background:var(--mint-soft); padding:16px; border-radius:12px; margin-top:24px; font-size:16px;">
        <p style="margin-top:0; margin-bottom:8px;"><strong>Personalized Images</strong></p>
        <p style="margin:0;">These are provided by the caretaker. A maximum of 10 personalized images can be added. Additional AI-generated images may appear to supplement the game.</p>
      </div>
    </div>
  </div>

  <!-- ============ GAME COUNTDOWN ============ -->
  <div class="screen" id="screen-game-countdown" style="justify-content:center; align-items:center; background:var(--teal-dark); color:var(--white);">
    <div id="countdown-text" style="font-size:80px; font-weight:800; font-family:'Baloo 2',sans-serif; animation: popIn 1s infinite;">3</div>
  </div>
`;

// Insert the new screens right before the game-ready screen
html = html.replace(/(<!-- ============ GAME: LOOK CAREFULLY ============ -->)/, newScreens + '\n  $1');

// Add popIn animation
html = html.replace(/(<\/style>)/, `
  @keyframes popIn {
    0% { transform: scale(0.5); opacity: 0; }
    30% { transform: scale(1.1); opacity: 1; }
    50% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
$1`);

// 6. Countdown logic JS
const scriptInjection = `
  let countdownTimer = null;
  function startCountdown() {
    go('game-countdown');
    const cdText = document.getElementById('countdown-text');
    cdText.textContent = '3';
    
    if(countdownTimer) clearTimeout(countdownTimer);
    if(window.timerAnimationFrame) {
      cancelAnimationFrame(window.timerAnimationFrame);
      window.timerAnimationFrame = null;
    }
    
    countdownTimer = setTimeout(() => {
      cdText.textContent = '2';
      countdownTimer = setTimeout(() => {
        cdText.textContent = '1';
        countdownTimer = setTimeout(() => {
          cdText.style.fontSize = '48px';
          cdText.textContent = "LET'S GO!";
          countdownTimer = setTimeout(() => {
            cdText.style.fontSize = '80px';
            startGameLogic();
          }, 800);
        }, 1000);
      }, 1000);
    }, 1000);
  }

  function startGameLogic() {
    appData.currentGameCorrect = 0;
    currentRounds = generateDynamicRounds();
    roundIndex = 0;
    go('game-ready');
    setupReadyScreen();
  }
`;
html = html.replace(/(function go\(id\)\{)/, scriptInjection + '\n  $1');

// 7. Remove the old startGame function (we'll just replace its body to do nothing or remove it)
// actually, I can just rename it in the code above, but the old startGame function is still there. 
// I'll leave the old startGame function alone, it's just never called from the dashboard anymore. 
// Wait! If the old one is never called, we are good. BUT let's be clean.
html = html.replace(/function startGame\(\)\s*\{[\s\S]*?setupReadyScreen\(\);\s*\}/, 'function startGame() { /* deprecated */ }');

// 8. Fix .device and .screen CSS so no overflow!
html = html.replace(/\.device\{([\s\S]*?)\}/, (match, inner) => {
  let newInner = inner.replace(/min-height:860px;/, 'height:860px;');
  return `.device{${newInner}}`;
});

html = html.replace(/\.screen\{([\s\S]*?)\}/, (match, inner) => {
  let newInner = inner.replace(/min-height:860px;/, 'height:100%;').replace(/flex:1;/, 'flex:1; overflow-y:auto; overflow-x:hidden;');
  return `.screen{${newInner}}`;
});

fs.writeFileSync('index 3.html', html);
console.log("Updated index 3.html properly");
