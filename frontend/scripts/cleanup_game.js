const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

// 1. Remove gq-top from game-ready
html = html.replace(/<div class="gq-top"[\s\S]*?<\/div>\s*<\/div>/, '');

// 2. Remove gq-top from game-question
html = html.replace(/<div class="gq-top">[\s\S]*?<\/div>\s*<\/div>/, '');

// 3. Just to be sure, any other top-nav in game screens?
html = html.replace(/<div class="screen" id="screen-game-instructions">[\s\S]*?<div class="top-nav">[\s\S]*?<\/div>\s*<\/div>/, (match) => {
    return match.replace(/<div class="top-nav">[\s\S]*?<\/div>\s*<\/div>/, '');
});

// Let's add back a proper top title for documents and sos just so they look decent (since I restored them without titles).
html = html.replace(/<div class="screen" id="screen-documents">\s*<div class="home-scroll">/, `<div class="screen" id="screen-documents">
    <div class="topbar">
      <div class="icon-btn" onclick="go('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
      <h2>Documents</h2>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll">`);

html = html.replace(/<div class="screen" id="screen-sos">\s*<div class="home-scroll"/, `<div class="screen" id="screen-sos">
    <div class="topbar">
      <div class="icon-btn" onclick="go('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
      <h2>SOS Contacts</h2>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll"`);
    
// Account should probably just have a nice title too, without back button
html = html.replace(/<div class="screen" id="screen-account">\s*<div class="home-scroll"/, `<div class="screen" id="screen-account">
    <div class="topbar">
      <div style="width:38px;"></div>
      <h2>My Account</h2>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll"`);

// Stats title
html = html.replace(/<div class="screen" id="screen-stats">\s*<div class="home-scroll"/, `<div class="screen" id="screen-stats">
    <div class="topbar">
      <div style="width:38px;"></div>
      <h2>Stats & Progress</h2>
      <div style="width:38px;"></div>
    </div>
    <div class="home-scroll"`);

fs.writeFileSync('index 3.html', html);
console.log("Game screens cleaned up and titles restored.");
