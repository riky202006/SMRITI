const fs = require('fs');

let html = fs.readFileSync('caretaker.html', 'utf8');

const storageLogic = `
  // LocalStorage cross-tab sync (Fallback for same-device demo)
  window.addEventListener('storage', (e) => {
    if (e.key === 'meca_data_v2' && e.newValue) {
      try {
        appData = JSON.parse(e.newValue);
        if (document.getElementById('screen-dashboard').classList.contains('active')) {
          updateMapUI();
          renderMedSummaryOnDashboard();
        }
      } catch(err) {}
    }
  });
`;

html = html.replace(/<\/script>\s*<\/body>/, storageLogic + '\n</script>\n</body>');
fs.writeFileSync('caretaker.html', html);
console.log('Added storage sync to caretaker.html');
