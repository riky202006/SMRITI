const fs = require('fs');
console.log('--- update_nav.js ---');
try { console.log(fs.readFileSync('update_nav.js', 'utf8')); } catch(e) {}
console.log('--- add_account_patient.js ---');
try { console.log(fs.readFileSync('add_account_patient.js', 'utf8')); } catch(e) {}
