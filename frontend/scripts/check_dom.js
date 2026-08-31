const fs = require('fs');
const lines = fs.readFileSync('index 3.html', 'utf8').split('\n');
let deviceDepth = 0;
let inDevice = false;

for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('<div class="device">')) {
    inDevice = true;
    console.log(i+1, "DEVICE STARTS HERE");
  }
  
  if (lines[i].includes('id="screen-documents"') || lines[i].includes('id="screen-sos"')) {
    console.log(i+1, lines[i].trim(), "inDevice?", inDevice);
  }
  
  if (inDevice && lines[i].includes('</div>')) {
    // This is naive, let's just find exactly where the device ends
  }
  if (lines[i].trim() === '</div>' && lines[i-1] && lines[i-1].includes('<!-- ============ MAIN GAME MODALS ============ -->')) {
    console.log(i+1, "Maybe device ends around here based on old structure?");
  }
}
