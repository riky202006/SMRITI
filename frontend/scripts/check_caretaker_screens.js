const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

const caretakerScreens = [
  'screen-splash',
  'screen-role',
  'screen-name-setup',
  'screen-caretaker-role',
  'screen-caretaker-login',
  'screen-caretaker-dashboard',
  'screen-personalize',
  'screen-c-analytics',
  'screen-c-medicine',
  'screen-c-gallery',
  'screen-login'
];

caretakerScreens.forEach(id => {
  const exists = html.includes(`id="${id}"`);
  console.log(`[${exists ? 'OK' : 'MISSING'}] ${id}`);
});
