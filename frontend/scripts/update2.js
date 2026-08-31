const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

const medicineChecker = `
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
`;

html = html.replace('</script>', medicineChecker + '\n</script>');
fs.writeFileSync('index 3.html', html);
console.log('Medicine checker added');
