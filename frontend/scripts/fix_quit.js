const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

const timeoutCode = `
  window.gameTimeouts = [];
  function setGameTimeout(fn, ms) {
    const id = setTimeout(fn, ms);
    window.gameTimeouts.push(id);
    return id;
  }
  function clearAllGameTimeouts() {
    window.gameTimeouts.forEach(id => clearTimeout(id));
    window.gameTimeouts = [];
    if(window.countdownTimer) clearTimeout(window.countdownTimer);
  }
`;

html = html.replace(/function requestQuit\(\)/, timeoutCode + '\n  function requestQuit()');

// Replace setTimeouts in game logic
html = html.replace(/countdownTimer = setTimeout\(/g, "countdownTimer = setGameTimeout(");
html = html.replace(/setTimeout\(\(\)=>go\('game-correct'\)/g, "setGameTimeout(()=>go('game-correct')");

// In confirmQuitGame
const confirmQuit = `
  function confirmQuitGame() {
    document.getElementById('screen-quit-confirm').style.display = 'none';
    if(window.timerAnimationFrame) {
      cancelAnimationFrame(window.timerAnimationFrame);
      window.timerAnimationFrame = null;
    }
    clearAllGameTimeouts();
    go('game-start');
  }
`;
html = html.replace(/function confirmQuitGame\(\) \{[\s\S]*?go\('game-start'\);\s*\}/, confirmQuit.trim());

fs.writeFileSync('index 3.html', html);
console.log('Fixed game quit logic');
