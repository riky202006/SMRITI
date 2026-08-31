const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

console.log('=== 1. Checking Home screen buttons ===');
const homeMatch = html.match(/<div class="screen" id="screen-home"[\s\S]*?<\/div>\s*<!-- ============/);
if (homeMatch) {
  console.log(homeMatch[0]);
} else {
  // Let's find home screen
  const start = html.indexOf('id="screen-home"');
  console.log(html.slice(start, start + 2500));
}

console.log('\n=== 2. Checking Gallery logic ===');
console.log('renderGalleries exists?', html.includes('function renderGalleries'));
console.log('renderGallery exists?', html.includes('function renderGallery'));
console.log('p-gallery in html?', html.includes('screen-p-gallery'));

console.log('\n=== 3. Checking Documents logic ===');
console.log('renderDocuments exists?', html.includes('function renderDocuments'));
console.log('screen-documents in html?', html.includes('screen-documents'));

console.log('\n=== 4. Checking SOS logic ===');
console.log('renderSOS exists?', html.includes('function renderSOS'));
console.log('screen-sos in html?', html.includes('screen-sos'));

console.log('\n=== 5. Checking Game logic ===');
console.log('startCountdown exists?', html.includes('function startCountdown'));
console.log('startGame exists?', html.includes('function startGame'));
console.log('showQuestion exists?', html.includes('function showQuestion'));
console.log('checkAnswer exists?', html.includes('function checkAnswer'));
console.log('requestQuit exists?', html.includes('function requestQuit'));

console.log('\n=== 6. Checking go() function in detail ===');
const goStart = html.indexOf('function go(id)');
console.log(html.slice(goStart, goStart + 1200));
