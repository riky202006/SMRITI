const fs = require('fs');

// Replace in index 3.html
let indexContent = fs.readFileSync('index 3.html', 'utf8');
indexContent = indexContent.replace(/<title>MeCa —/g, '<title>Smriti —');
indexContent = indexContent.replace(/<h1>MeCa<\/h1>/g, '<h1>Smriti</h1>');
fs.writeFileSync('index 3.html', indexContent);

// Replace in caretaker.html
let ctContent = fs.readFileSync('caretaker.html', 'utf8');
ctContent = ctContent.replace(/<title>ReWire - Caretaker<\/title>/g, '<title>Smriti - Caretaker</title>');
// Also check if there's any stray MeCa or ReWire in caretaker.html
ctContent = ctContent.replace(/MeCa/g, 'Smriti');
ctContent = ctContent.replace(/ReWire/g, 'Smriti');
fs.writeFileSync('caretaker.html', ctContent);

console.log("Renamed to Smriti successfully");
