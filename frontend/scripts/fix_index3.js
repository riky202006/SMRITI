const fs = require('fs');
let content = fs.readFileSync('index 3.html', 'utf8');

// Part 2: Fix the stray 'n'
content = content.replace(/<div class="gq-body">`n      <div id="question-image-container"/g, '<div class="gq-body">\n      <div id="question-image-container"');

// Part 1: Fix Timer smoothness
// Replace the setInterval block with requestAnimationFrame

const oldTimerBlock = `    let timeLeft = 10;
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
    }, 1000);`;

const newTimerBlock = `    // Reset timer
    let timerDuration = 10000; // 10 seconds in ms
    let startTime = null;
    
    // Clear any existing animation frame if we had one (using the global variable for animation ID)
    if (window.timerAnimationFrame) {
      cancelAnimationFrame(window.timerAnimationFrame);
    }
    
    function animateTimer(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const remainingMs = Math.max(timerDuration - elapsed, 0);
      const remainingSec = Math.ceil(remainingMs / 1000);
      const percent = (remainingMs / timerDuration) * 100;
      
      document.getElementById('timer-start').textContent = remainingSec + 's';
      document.getElementById('timer-fill').style.width = percent + '%';
      
      if (remainingMs > 0) {
        window.timerAnimationFrame = requestAnimationFrame(animateTimer);
      } else {
        showQuestion();
      }
    }
    
    window.timerAnimationFrame = requestAnimationFrame(animateTimer);`;

content = content.replace(oldTimerBlock, newTimerBlock);

// Also need to fix where clearInterval is called in showQuestion and startGame
content = content.replace(/clearInterval\(timerInterval\);/g, `if(window.timerAnimationFrame){ cancelAnimationFrame(window.timerAnimationFrame); }`);

// Remove CSS transition for the fill so the rAF controls it continuously without lagging
content = content.replace(/transition:width \.25s linear;/g, '');

fs.writeFileSync('index 3.html', content);
console.log('Fixed index 3.html timer and stray character');
