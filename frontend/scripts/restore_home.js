const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

const medAndVisitsBlocks = `
      <div id="home-visits-container" style="display:none; margin-bottom:16px;">
        <div class="card" onclick="go('reminders')" style="cursor:pointer; background:#fff8e1; border:2px solid #ffecb3;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
            <p class="title" style="margin:0; font-weight:800; color:#f57f17;">🗓 UPCOMING VISIT</p>
          </div>
          <p id="home-visit-sub" style="margin:0; color:var(--ink); font-weight:700; font-size:16px;"></p>
        </div>
      </div>

      <div id="home-medication-container" style="display:none; margin-bottom:16px;">
        <div class="card" style="background:#e8f5e9; border:2px solid #c8e6c9;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
            <p class="title" style="margin:0; font-weight:800; color:#2e7d32;">💊 MEDICATION REMINDER</p>
          </div>
          <p id="home-med-sub" style="margin:0 0 12px; color:var(--ink); font-weight:700; font-size:16px;"></p>
          <button class="btn btn-primary" onclick="markTaken()" style="background:#2e7d32; border:none;">✓ TAKEN</button>
        </div>
      </div>
`;

// Insert after the home-header
const insertPoint = /(<div class="home-header">[\s\S]*?<\/div>\s*<\/div>)/;
html = html.replace(insertPoint, '$1\n\n' + medAndVisitsBlocks);

fs.writeFileSync('index 3.html', html);
console.log("Restored Meds and Visits on Home screen.");
