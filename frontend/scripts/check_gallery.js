const fs = require('fs');
const html = fs.readFileSync('index 3.html', 'utf8');

const pGalStart = html.indexOf('id="screen-p-gallery"');
console.log('p-gallery HTML:');
console.log(html.slice(pGalStart, pGalStart + 800));

const renderGalStart = html.indexOf('function renderGalleries');
console.log('renderGalleries JS:');
console.log(html.slice(renderGalStart, renderGalStart + 1000));
