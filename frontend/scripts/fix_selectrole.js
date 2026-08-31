const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

const selectRoleFix = `
  let selectedRole = '';
  function selectRole(role) {
    selectedRole = role;
    if (role === 'patient' && appData.patientName) {
      updateDashboardGreeting();
      go('home');
    } else if (role === 'caretaker' && appData.caretakerName) {
      window.location.href = 'caretaker.html';
    } else {
      go('name-setup');
    }
  }
`;

html = html.replace(/let selectedRole = '';\s*function selectRole\(role\) \{[\s\S]*?go\('name-setup'\);\s*\}/, selectRoleFix.trim());

fs.writeFileSync('index 3.html', html);
console.log('Fixed selectRole to only show Name Setup once');
