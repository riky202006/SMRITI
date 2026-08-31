const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

// List of screens to audit
const screenIds = [
  'screen-home',
  'screen-p-gallery',
  'screen-documents',
  'screen-sos',
  'screen-game-start',
  'screen-game-instructions',
  'screen-game-countdown',
  'screen-game-ready',
  'screen-game-question',
  'screen-game-correct',
  'screen-game-result',
  'screen-reminders',
  'screen-stats',
  'screen-account'
];

screenIds.forEach(id => {
  const exists = html.includes(`id="${id}"`);
  console.log(`[${exists ? 'OK' : 'MISSING'}] ${id}`);
});
