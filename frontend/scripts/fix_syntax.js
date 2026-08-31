const fs = require('fs');
let c = fs.readFileSync('index 3.html', 'utf8');
c = c.replace(/qImgContainer\.innerHTML = <img src=" \+ round\.img \+ " style="width:100%; max-height:200px; object-fit:cover; border-radius:16px;">;/, "qImgContainer.innerHTML = '<img src=\"' + round.img + '\" style=\"width:100%; max-height:200px; object-fit:cover; border-radius:16px;\">';");
fs.writeFileSync('index 3.html', c);
console.log('Fixed syntax error');
