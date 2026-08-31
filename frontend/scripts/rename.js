const fs = require('fs');

function replaceInFile(filename) {
  if (!fs.existsSync(filename)) return;
  let content = fs.readFileSync(filename, 'utf8');
  let original = content;
  
  // Replace Mika with Smriti globally, case-insensitive
  content = content.replace(/Mika/g, 'Smriti');
  content = content.replace(/MIKA/g, 'SMRITI');
  content = content.replace(/mika/g, 'smriti');
  
  if(content !== original) {
    fs.writeFileSync(filename, content);
    console.log('Updated ' + filename);
  } else {
    console.log('No changes in ' + filename);
  }
}

replaceInFile('index 3.html');
replaceInFile('caretaker.html');
