const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

// Find all occurrences of oldGo or renderDocuments calls
console.log('renderDocuments occurrences:');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('renderDocuments') || l.includes('renderGalleries') || l.includes('renderPatientMeds') || l.includes('renderPatientVisits')) {
    console.log(`Line ${i+1}: ${l.trim()}`);
  }
});

// Let's check game flow: how does the game work?
console.log('\nGame functions in file:');
lines.forEach((l, i) => {
  if (l.includes('function start') || l.includes('function show') || l.includes('function answer') || l.includes('function next') || l.includes('function check')) {
    console.log(`Line ${i+1}: ${l.trim()}`);
  }
});
