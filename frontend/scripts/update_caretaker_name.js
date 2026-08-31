const fs = require('fs');
let html = fs.readFileSync('caretaker.html', 'utf8');

// Update header
html = html.replace(/<p class="greet">Caregiver Dashboard<\/p>\s*<p class="name" id="ct-role-display">Guardian<\/p>/, 
  `<p class="greet" id="ct-greeting">Caregiver Dashboard</p>\n          <p class="name" id="ct-name" style="font-size:24px; color:var(--teal-dark); font-weight:800;"></p>`);

// Add initialization script
const initScript = `
  function getGreeting(name) {
    const hour = new Date().getHours();
    let timeOfDay = 'morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else if (hour >= 21 || hour < 4) timeOfDay = 'night';
    return \`Good \${timeOfDay},\`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if(appData.caretakerName) {
      document.getElementById('ct-greeting').textContent = getGreeting(appData.caretakerName);
      document.getElementById('ct-name').textContent = appData.caretakerName;
      // Skip role screen, go straight to dashboard
      go('dashboard');
    }
  });
`;

html = html.replace(/let appData = JSON\.parse\(localStorage\.getItem\('meca_data_v2'\)\) \|\| \{[\s\S]*?\};/, (match) => {
  return match + '\n' + initScript;
});

fs.writeFileSync('caretaker.html', html);
console.log("Updated caretaker.html");
