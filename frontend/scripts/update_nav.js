const fs = require('fs');

let html = fs.readFileSync('index 3.html', 'utf8');

const navAccount = `
      <div class="nav-item" onclick="loadAccount(); go('account')">
        <div class="nav-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
        Account
      </div>
`;

// There are multiple screens with bottom-nav.
// I will replace the end of bottom-nav with the Account item.
html = html.replace(/(<div class="nav-item" onclick="go\('stats'\)">[\s\S]*?<\/div>)\s*<\/div>/g, '$1' + navAccount + '    </div>');

fs.writeFileSync('index 3.html', html);
console.log('Added Account to bottom nav in index 3.html');
