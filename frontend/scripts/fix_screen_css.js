const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

html = html.replace(/\.screen\s*\{[\s\S]*?\}/, `.screen{
    display:none;
    flex-direction:column;
    flex:1; 
    overflow-y:auto; 
    overflow-x:hidden;
    position:relative;
    animation:fadeIn .25s ease;
  }`);

fs.writeFileSync('index 3.html', html);
console.log("Fixed .screen CSS");
