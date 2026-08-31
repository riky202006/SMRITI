const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

console.log('=== TEST 1: JavaScript Syntax Validation ===');
const scriptMatches = html.match(/<script[\s\S]*?<\/script>/gi);
let allValid = true;
scriptMatches.forEach((s, idx) => {
  const js = s.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
  try {
    new Function(js);
    console.log(`✓ Script #${idx} syntax is 100% valid.`);
  } catch(e) {
    allValid = false;
    console.error(`✗ Script #${idx} ERROR:`, e.message);
  }
});

console.log('\n=== TEST 2: Screen Verification ===');
const requiredScreens = [
  'screen-splash',
  'screen-role',
  'screen-name-setup',
  'screen-home',
  'screen-game-start',
  'screen-game-instructions',
  'screen-game-countdown',
  'screen-game-ready',
  'screen-game-question',
  'screen-game-correct',
  'screen-game-result',
  'screen-reminders',
  'screen-stats',
  'screen-account',
  'screen-p-gallery',
  'screen-documents',
  'screen-sos'
];
requiredScreens.forEach(id => {
  const hasIt = html.includes(`id="${id}"`);
  console.log(`${hasIt ? '✓' : '✗'} Screen: ${id}`);
});

console.log('\n=== TEST 3: Footer Navigation Verification ===');
const hasBottomNav = html.includes('class="bottom-nav"');
console.log(`${hasBottomNav ? '✓' : '✗'} Single persistent bottom-nav present: ${hasBottomNav}`);
const navButtons = ['nav-home', 'nav-game', 'nav-meds', 'nav-stats', 'nav-account'];
navButtons.forEach(btn => {
  const hasBtn = html.includes(`id="${btn}"`);
  console.log(`${hasBtn ? '✓' : '✗'} Nav button: ${btn}`);
});

console.log('\n=== TEST 4: Home Screen Structure & Order Verification ===');
const homeHtml = html.slice(html.indexOf('id="screen-home"'), html.indexOf('id="screen-p-gallery"'));
const hasAccountOnHome = homeHtml.includes("go('account')");
console.log(`${!hasAccountOnHome ? '✓' : '✗'} No Account card on Home screen: ${!hasAccountOnHome}`);

const homeVisitsIdx = homeHtml.indexOf('id="home-visits-container"');
const homeMedsIdx = homeHtml.indexOf('id="home-medication-container"');
const homeGameIdx = homeHtml.indexOf("go('game-start')");
const homeStatsIdx = homeHtml.indexOf("go('stats')");
const homeGalleryIdx = homeHtml.indexOf("go('p-gallery')");
const homeDocsIdx = homeHtml.indexOf("go('documents')");
const homeSosIdx = homeHtml.indexOf("go('sos')");

console.log('Home Elements Order:');
console.log('  1. Visits & Appts index:', homeVisitsIdx);
console.log('  2. Med Reminder index:  ', homeMedsIdx);
console.log('  3. Memory Game index:   ', homeGameIdx);
console.log('  4. My Progress index:   ', homeStatsIdx);
console.log('  5. Gallery index:       ', homeGalleryIdx);
console.log('  6. My Documents index:  ', homeDocsIdx);
console.log('  7. SOS index:           ', homeSosIdx);

const orderCorrect = (homeVisitsIdx < homeMedsIdx) &&
                     (homeMedsIdx < homeGameIdx) &&
                     (homeGameIdx < homeStatsIdx) &&
                     (homeStatsIdx < homeGalleryIdx) &&
                     (homeGalleryIdx < homeDocsIdx) &&
                     (homeDocsIdx < homeSosIdx);
console.log(`${orderCorrect ? '✓' : '✗'} Home content order is 100% correct: ${orderCorrect}`);

console.log('\n=== TEST 5: Meds Dual Tab Verification ===');
const hasMedTabMeds = html.includes('id="med-tab-meds"');
const hasMedTabVisits = html.includes('id="med-tab-visits"');
const hasSwitchTabFn = html.includes('function switchMedTab');
console.log(`${hasMedTabMeds ? '✓' : '✗'} Medicines Tab: ${hasMedTabMeds}`);
console.log(`${hasMedTabVisits ? '✓' : '✗'} Visits Tab: ${hasMedTabVisits}`);
console.log(`${hasSwitchTabFn ? '✓' : '✗'} switchMedTab function: ${hasSwitchTabFn}`);

console.log('\n=== TEST 6: Memory Game Logic Verification ===');
const gameFns = ['startCountdown', 'startGameLogic', 'setupReadyScreen', 'showQuestion', 'selectAnswer', 'nextQuestion', 'requestQuit'];
gameFns.forEach(fn => {
  const hasFn = html.includes(`function ${fn}`);
  console.log(`${hasFn ? '✓' : '✗'} Game function: ${fn}`);
});

console.log('\n=== TEST 7: Gallery, Docs, SOS, Account Renderers ===');
const renderFns = ['renderGalleries', 'renderDocuments', 'renderPatientMeds', 'renderPatientVisits', 'renderStats', 'loadAccount', 'saveAccount'];
renderFns.forEach(fn => {
  const hasFn = html.includes(`function ${fn}`);
  console.log(`${hasFn ? '✓' : '✗'} Renderer: ${fn}`);
});

console.log('\n=== ALL TESTS COMPLETED ===');
