const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

// Remove all instances of the duplicate quit buttons I added previously
html = html.replace(/<div style="display:flex; justify-content:flex-end; padding:.*?"><button onclick="requestQuit\(\)".*?<\/button><\/div>/g, '');
html = html.replace(/<button onclick="requestQuit\(\)".*?<\/button>/g, '');

// The issue is that the user says: "Fix duplicate Quit Game button."
// Let's replace the icon-btn inside gq-top to be the actual header that contains the quit button.
// `gq-top` is used in multiple places? Let's check how many times `gq-top` appears.
// I will just do a controlled replacement:
html = html.replace(/<div class="gq-top">[\s\S]*?<\/div>\s*<div style="width:38px;"><\/div>\s*<\/div>/g, 
  `<div class="gq-top" style="justify-content:space-between; padding:16px 20px 0;">
      <div class="icon-btn" onclick="go('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
      <button onclick="requestQuit()" style="background:var(--gray-light); border:none; border-radius:12px; padding:8px 16px; color:var(--ink); font-weight:800; font-size:14px; cursor:pointer;">QUIT GAME</button>
    </div>`
);

fs.writeFileSync('index 3.html', html);
