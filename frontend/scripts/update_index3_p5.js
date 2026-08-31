const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

// 1. Center the role selection screen
html = html.replace(/(<div class="screen" id="screen-role")>/, '$1 style="justify-content:center;">');

// 2. Quit Game returns to Game Start instead of Home
html = html.replace(/function confirmQuitGame\(\)\s*\{\s*document.getElementById\('screen-quit-confirm'\).style.display = 'none';\s*if\(window.timerAnimationFrame\) \{\s*cancelAnimationFrame\(window.timerAnimationFrame\);\s*window.timerAnimationFrame = null;\s*\}\s*\/\/\s*Return to home\s*go\('home'\);\s*\}/, 
`function confirmQuitGame() {
    document.getElementById('screen-quit-confirm').style.display = 'none';
    if(window.timerAnimationFrame) {
      cancelAnimationFrame(window.timerAnimationFrame);
      window.timerAnimationFrame = null;
    }
    go('game-start');
  }`);

fs.writeFileSync('index 3.html', html);
console.log("Fixed role centering and quit redirect");
