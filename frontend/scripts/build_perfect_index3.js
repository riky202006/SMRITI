const fs = require('fs');

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Smriti — MemoryCare</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
<style>
  :root{
    --teal-dark:#0b5d52;
    --teal-darker:#084a42;
    --teal-mid:#12786b;
    --mint:#8fe0c9;
    --mint-soft:#d4f2e8;
    --cream:#f7f4ee;
    --white:#ffffff;
    --gray:#707773;
    --gray-light:#f0ece3;
    --orange:#e67e22;
    --red:#d32f2f;
    --ink:#1a2b27;
    --shadow:0 12px 30px rgba(11,93,82,0.08);
  }
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
  body{
    margin:0;padding:0;
    background:#e5dfd3;
    font-family:'Nunito',sans-serif;
    color:var(--ink);
    display:flex;align-items:center;justify-content:center;
    min-height:100vh;
  }
  .app{width:100%;max-width:420px;display:flex;justify-content:center;}
  .device{
    width:100%;height:100vh;max-height:880px;
    background:var(--cream);
    box-shadow:0 25px 60px rgba(0,0,0,0.18);
    position:relative;display:flex;flex-direction:column;
    border-radius:36px;overflow:hidden;
    border:6px solid #e0d9cc;
  }
  @media(max-width:440px){
    .device{border-radius:0;height:100vh;max-height:none;border:none;}
  }

  /* Screens */
  .screen{display:none;flex:1;flex-direction:column;position:relative;overflow-y:auto;overflow-x:hidden;}
  .screen.active{display:flex;}

  /* Common Components */
  .topbar{
    display:flex;align-items:center;justify-content:space-between;
    padding:16px 20px;background:transparent;
  }
  .topbar h2{margin:0;font-size:20px;color:var(--teal-dark);font-weight:800;}
  .top-nav{
    display:flex;align-items:center;justify-content:space-between;
    padding:16px 20px;background:transparent;
  }
  .top-nav .title{font-size:18px;font-weight:800;color:var(--teal-dark);}
  .icon-btn{
    width:40px;height:40px;border-radius:50%;background:#fff;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 10px rgba(0,0,0,0.05);cursor:pointer;
  }
  .icon-btn svg{width:20px;height:20px;color:var(--teal-dark);}
  .btn{
    width:100%;padding:16px;border-radius:20px;font-size:16px;
    font-weight:800;cursor:pointer;border:none;text-align:center;
    display:block;font-family:'Nunito',sans-serif;
  }
  .btn-primary{background:var(--teal-dark);color:#fff;box-shadow:0 8px 20px rgba(11,93,82,0.25);}
  .btn-primary:active{background:var(--teal-darker);}
  .btn-outline{background:#fff;color:var(--teal-dark);border:2px solid var(--teal-dark);}

  /* Splash */
  #screen-splash{
    background:radial-gradient(circle at center, #148f7f 0%, #0b5d52 70%, #063d36 100%);
    align-items:center;justify-content:center;text-align:center;color:#fff;cursor:pointer;
  }
  .logo-flower{width:90px;height:90px;margin-bottom:16px;}
  .splash-title{font-family:'Baloo 2',sans-serif;font-size:46px;font-weight:800;margin:0;}
  .splash-sub{font-size:16px;opacity:0.85;margin-top:4px;}

  /* Home Dashboard */
  #screen-home{background:var(--cream);}
  .home-scroll{flex:1;overflow-y:auto;padding:16px 20px 24px;}
  .home-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
  .home-header .greet{font-size:14px;color:var(--gray);margin:0;font-weight:600;}
  .home-header .name{font-size:22px;font-weight:800;color:var(--teal-dark);margin:0;font-family:'Baloo 2',sans-serif;}
  .home-header .bell{width:42px;height:42px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.04);}
  .home-header .bell svg{width:20px;height:20px;color:var(--teal-dark);}

  .card{background:#fff;border-radius:24px;padding:18px;margin-bottom:16px;box-shadow:var(--shadow);}
  .card-hero{
    background:linear-gradient(135deg, #8fe0c9 0%, #c1ebd9 100%);
    display:flex;flex-direction:column;align-items:flex-start;position:relative;overflow:hidden;
  }
  .card-hero .hero-icon{
    width:48px;height:48px;border-radius:14px;background:#fff;
    display:flex;align-items:center;justify-content:center;margin-bottom:12px;
  }
  .card-hero .hero-icon svg{width:28px;height:28px;color:var(--teal-dark);}
  .card-hero .title{font-size:20px;font-weight:800;color:var(--teal-dark);display:flex;align-items:center;gap:8px;}
  .card-hero .subtitle{font-size:14px;color:#4c5a55;margin:4px 0 0;}

  .row-card{display:flex;align-items:center;gap:14px;padding:16px;}
  .row-icon{width:48px;height:48px;border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .row-icon svg{width:26px;height:26px;color:#fff;}
  .row-icon.gray-bg{background:#e8e4db;}
  .row-icon.gray-bg svg{color:#5f6b66;}
  .row-text .title{font-weight:800;font-size:16px;display:flex;align-items:center;gap:6px;margin:0;}
  .row-text .sub{font-size:13px;color:var(--gray);margin:2px 0 0;}

  /* Persistent Bottom Navigation */
  .bottom-nav{
    display:flex;align-items:center;justify-content:space-around;
    padding:8px 6px 14px;background:#fff;
    border-top:1px solid #eee;
    z-index:100;flex-shrink:0;
  }
  .nav-item{
    display:flex;flex-direction:column;align-items:center;gap:3px;
    font-size:11px;color:#8a8f8a;font-weight:700;padding:4px 8px;border-radius:14px;
    cursor:pointer;user-select:none;
  }
  .nav-item svg{width:20px;height:20px;}
  .nav-item.active{color:var(--teal-dark);}
  .nav-item .nav-icon-circle{
    width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  }
  .nav-item.active .nav-icon-circle{background:var(--teal-dark);}
  .nav-item.active .nav-icon-circle svg{color:#fff;}
  .nav-item:not(.active) .nav-icon-circle svg{color:#8a8f8a;}

  /* Game Screens */
  #screen-game-ready{background:var(--cream);padding:0;}
  .game-ready-body{flex:1;display:flex;flex-direction:column;padding:16px 20px;}
  .game-ready-body h2{font-size:22px;margin:4px 0 16px;font-weight:800;text-align:center;}
  .stim-card{
    background:#fff;border-radius:24px;box-shadow:var(--shadow);
    padding:14px;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
    min-height:300px;
  }
  .stim-card img{width:100%;max-height:260px;border-radius:16px;object-fit:cover;}
  .timer-row{margin-top:18px;width:100%;}
  .timer-bar-track{height:10px;border-radius:999px;background:#e6e3db;overflow:hidden;}
  .timer-bar-fill{height:100%;background:var(--orange);border-radius:999px;}
  .timer-labels{display:flex;justify-content:space-between;font-size:13px;color:var(--gray);font-weight:700;margin-top:6px;}
  .game-footer{padding:16px 20px 24px;background:#fff;border-top:1px solid #eee;}
  .q-count{text-align:center;font-size:14px;color:var(--gray);font-weight:700;margin-bottom:12px;}

  #screen-game-question{background:var(--cream);}
  .gq-body{flex:1;padding:16px 20px;display:flex;flex-direction:column;align-items:center;text-align:center;}
  .gq-body h2{font-size:24px;margin:8px 0 4px;font-weight:800;}
  .gq-body .hint{font-size:14px;color:var(--gray);margin:0 0 16px;}
  .options{display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;margin-top:8px;}
  .option-btn{
    background:#fff;border:2px solid #e0dcd3;border-radius:18px;
    padding:16px 8px;font-size:16px;font-weight:800;font-family:'Nunito',sans-serif;
    color:var(--ink);cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.03);
  }
  .option-btn.correct{background:#d4f2e8;border-color:var(--teal-dark);color:var(--teal-dark);}
  .option-btn.wrong{background:#ffebee;border-color:var(--red);color:var(--red);}
  .speak-btn{
    margin-top:12px;background:#fff;border:1px solid #ddd;border-radius:20px;
    padding:8px 16px;font-size:13px;font-weight:700;color:var(--gray);display:flex;align-items:center;gap:6px;cursor:pointer;
  }
  .speak-btn svg{width:16px;height:16px;}
  .gq-footer{padding:16px 20px 20px;background:#fff;border-top:1px solid #eee;}

  #screen-game-correct{background:linear-gradient(180deg,#8fe0c9 0%, #cdeee0 40%, #f7f4ee 100%);align-items:center;justify-content:center;padding:40px 24px;text-align:center;}
  .correct-card{background:#fff;border-radius:28px;padding:32px 24px;width:100%;box-shadow:var(--shadow);display:flex;flex-direction:column;align-items:center;}
  .check-circle{width:70px;height:70px;border-radius:50%;background:#d4f2e8;display:flex;align-items:center;justify-content:center;margin-bottom:16px;}
  .check-circle svg{width:36px;height:36px;color:var(--teal-dark);}
  .dots-row{display:flex;gap:6px;margin:20px 0;}
  .dot{width:10px;height:10px;border-radius:50%;background:#e0dcd3;}
  .dot.filled{background:var(--teal-dark);}

  /* Meds & Stats & Account */
  #screen-reminders{background:var(--cream);}
  #screen-stats{background:var(--cream);}
  #screen-documents{overflow-y:auto; overflow-x:hidden;}
  #screen-sos{overflow-y:auto; overflow-x:hidden;}
  .stats-body{padding:16px 20px;flex:1;overflow-y:auto;}
  .ring-wrap{display:flex;flex-direction:column;align-items:center;position:relative;margin:10px 0 20px;}
  .status-word{position:absolute;top:45px;font-size:24px;font-weight:800;color:var(--teal-dark);}
  .status-sub{position:absolute;top:75px;font-size:12px;color:var(--gray);text-transform:uppercase;letter-spacing:1px;}
  .stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;}
  .stat-card{background:#fff;border-radius:18px;padding:14px;box-shadow:var(--shadow);}
  .stat-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:8px;}
  .stat-icon svg{width:20px;height:20px;color:#fff;}
  .stat-card .label{font-size:12px;color:var(--gray);margin:0;}
  .stat-card .value{font-size:18px;font-weight:800;color:var(--ink);margin:4px 0 0;}
  .perf-title{font-size:15px;font-weight:800;margin:16px 0 8px;display:flex;align-items:center;gap:6px;}
  .perf-bars{display:flex;align-items:flex-end;gap:8px;height:80px;background:#fff;padding:12px;border-radius:16px;box-shadow:var(--shadow);}
  .perf-bar{flex:1;background:var(--mint);border-radius:6px;min-height:8px;}

  .gallery-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .gallery-item{background:#fff;border-radius:16px;padding:10px;text-align:center;box-shadow:var(--shadow);}
  .gallery-item img{width:100%;height:120px;border-radius:12px;object-fit:cover;}
  .gallery-item .name{font-weight:800;font-size:14px;margin-top:6px;}

  /* Inputs & Forms */
  .field{margin-bottom:14px;}
  .field label{display:block;font-size:13px;font-weight:700;color:var(--gray);margin-bottom:6px;}
  .input-wrap input{
    width:100%;padding:14px 16px;border-radius:16px;border:2px solid #e0dcd3;
    font-size:15px;font-family:'Nunito',sans-serif;outline:none;background:#fff;
  }
  .input-wrap input:focus{border-color:var(--teal-dark);}

  .toast{
    position:absolute;bottom:70px;left:50%;transform:translateX(-50%);
    background:rgba(26,43,39,0.92);color:#fff;padding:12px 24px;border-radius:30px;
    font-size:14px;font-weight:700;z-index:9999;opacity:0;pointer-events:none;transition:opacity 0.3s;
    white-space:nowrap;
  }
  .toast.show{opacity:1;}
</style>
</head>
<body>
<div class="app">
  <div class="device">

    <!-- ============ SPLASH SCREEN ============ -->
    <div class="screen active" id="screen-splash" onclick="go('role')">
      <div class="logo-flower">
        <svg viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="18" fill="#8fe0c9"/>
          <ellipse cx="50" cy="22" rx="14" ry="18" fill="#8fe0c9" opacity="0.8"/>
          <ellipse cx="50" cy="78" rx="14" ry="18" fill="#8fe0c9" opacity="0.8"/>
          <ellipse cx="22" cy="50" rx="18" ry="14" fill="#8fe0c9" opacity="0.8"/>
          <ellipse cx="78" cy="50" rx="18" ry="14" fill="#8fe0c9" opacity="0.8"/>
          <circle cx="50" cy="50" r="10" fill="#0b5d52"/>
        </svg>
      </div>
      <h1 class="splash-title">Smriti</h1>
      <p class="splash-sub">MemoryCare & Companion</p>
      <p style="font-size:13px;opacity:0.65;margin-top:30px;">Tap anywhere to begin</p>
    </div>

    <!-- ============ ROLE SELECTION ============ -->
    <div class="screen" id="screen-role" style="justify-content:center;padding:24px;background:var(--cream);">
      <div style="text-align:center;margin-bottom:32px;">
        <h2 style="font-size:30px;color:var(--teal-dark);margin:0;font-family:'Baloo 2',sans-serif;">Welcome to Smriti</h2>
        <p style="color:var(--gray);margin:8px 0 0;">Please choose how you'll use the app</p>
      </div>
      <div class="card" onclick="selectRole('patient')" style="cursor:pointer;padding:22px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:16px;">
          <div class="row-icon" style="background:#8fe0c9;color:var(--teal-dark);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <h3 style="margin:0 0 4px;font-size:18px;">I am a Patient</h3>
            <p style="margin:0;color:var(--gray);font-size:13px;">Play memory games, view medicines & documents</p>
          </div>
        </div>
      </div>
      <div class="card" onclick="selectRole('caretaker')" style="cursor:pointer;padding:22px;">
        <div style="display:flex;align-items:center;gap:16px;">
          <div class="row-icon" style="background:#f2c9a3;color:#8a4d1a;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <h3 style="margin:0 0 4px;font-size:18px;">I am a Caretaker</h3>
            <p style="margin:0;color:var(--gray);font-size:13px;">Manage photos, medicines & track live location</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ NAME SETUP ============ -->
    <div class="screen" id="screen-name-setup" style="justify-content:center;align-items:center;text-align:center;padding:24px;">
      <h2 id="name-setup-title" style="font-size:28px;color:var(--teal-dark);margin-bottom:8px;">What's your name?</h2>
      <p style="color:var(--gray);margin-bottom:24px;">We'll personalize your experience</p>
      <div class="field" style="width:100%;max-width:300px;">
        <div class="input-wrap"><input type="text" id="user-name-input" placeholder="Enter full name"></div>
      </div>
      <button class="btn btn-primary" style="max-width:300px;margin-top:12px;" onclick="saveNameAndProceed()">CONTINUE</button>
    </div>

    <!-- ============ CARETAKER ROLE / LOGIN / DASHBOARD (PRESERVED) ============ -->
    <div class="screen" id="screen-caretaker-role">
      <div class="topbar"><div class="icon-btn" onclick="go('role')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div><h2>Caretaker</h2><div style="width:40px;"></div></div>
      <div class="home-scroll"><button class="btn btn-primary" onclick="go('caretaker-login')">LOGIN AS CARETAKER</button></div>
    </div>

    <div class="screen" id="screen-caretaker-login">
      <div class="topbar"><div class="icon-btn" onclick="go('role')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div><h2>Caretaker Login</h2><div style="width:40px;"></div></div>
      <div class="home-scroll">
        <div class="field"><label>Email</label><div class="input-wrap"><input type="email" value="caretaker@smriti.care"></div></div>
        <div class="field"><label>Password</label><div class="input-wrap"><input type="password" value="••••••••"></div></div>
        <button class="btn btn-primary" onclick="go('caretaker-dashboard')">SIGN IN</button>
      </div>
    </div>

    <div class="screen" id="screen-caretaker-dashboard">
      <div class="topbar"><div class="icon-btn" onclick="go('role')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div><h2>Caretaker Hub</h2><div style="width:40px;"></div></div>
      <div class="home-scroll">
        <div class="card" style="background:var(--mint-soft);" onclick="go('c-gallery')"><h3 style="margin:0;">🖼️ Manage Patient Gallery</h3><p style="margin:4px 0 0;font-size:13px;color:var(--gray);">Add or remove family photos</p></div>
        <div class="card" onclick="go('c-medicine')"><h3 style="margin:0;">💊 Medication Management</h3><p style="margin:4px 0 0;font-size:13px;color:var(--gray);">Set schedules and dosages</p></div>
        <div class="card" onclick="go('c-analytics')"><h3 style="margin:0;">📊 Game Analytics</h3><p style="margin:4px 0 0;font-size:13px;color:var(--gray);">View cognitive progress</p></div>
      </div>
    </div>

    <div class="screen" id="screen-personalize">
      <div class="topbar"><div class="icon-btn" onclick="go('caretaker-dashboard')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div><h2>Personalize Photos</h2><div style="width:40px;"></div></div>
      <div class="home-scroll"><div id="personalized-images-list" class="gallery-grid"></div></div>
    </div>

    <div class="screen" id="screen-c-analytics">
      <div class="topbar"><div class="icon-btn" onclick="go('caretaker-dashboard')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div><h2>Analytics</h2><div style="width:40px;"></div></div>
      <div class="home-scroll">
        <div class="card"><p>Games: <span id="c-stat-games">0</span></p><p>Score: <span id="c-stat-score">0</span></p><p>Correct: <span id="c-stat-correct">0</span></p><p>Incorrect: <span id="c-stat-incorrect">0</span></p></div>
      </div>
    </div>

    <div class="screen" id="screen-c-medicine">
      <div class="topbar"><div class="icon-btn" onclick="go('caretaker-dashboard')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div><h2>Meds Config</h2><div style="width:40px;"></div></div>
      <div class="home-scroll"><div id="caretaker-med-list"></div></div>
    </div>

    <div class="screen" id="screen-c-gallery">
      <div class="topbar"><div class="icon-btn" onclick="go('caretaker-dashboard')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div><h2>Manage Gallery</h2><div style="width:40px;"></div></div>
      <div class="home-scroll"><div id="c-gallery-list" class="gallery-grid"></div></div>
    </div>

    <div class="screen" id="screen-login">
      <div class="topbar"><div class="icon-btn" onclick="go('role')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div><h2>Sign In</h2><div style="width:40px;"></div></div>
      <div class="home-scroll"><button class="btn btn-primary" onclick="go('home')">CONTINUE TO SMRITI</button></div>
    </div>

    <!-- ============ PATIENT HOME SCREEN ============ -->
    <div class="screen" id="screen-home">
      <div class="home-scroll">
        <!-- 1. GREETING -->
        <div class="home-header">
          <div>
            <p class="greet" id="home-greeting-time">Good morning,</p>
            <p class="name" id="home-username">Patient</p>
          </div>
          <div class="bell">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          </div>
        </div>

        <!-- 2. UPCOMING VISITS & APPOINTMENTS (DYNAMIC) -->
        <div id="home-visits-container" style="display:none; margin-bottom:16px;">
          <div class="card" onclick="go('reminders'); switchMedTab('visits');" style="cursor:pointer; background:#fff8e1; border:2px solid #ffecb3; padding:16px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
              <p class="title" style="margin:0; font-weight:800; color:#f57f17;">🗓 UPCOMING VISIT</p>
            </div>
            <p id="home-visit-sub" style="margin:0; color:var(--ink); font-weight:700; font-size:15px;"></p>
          </div>
        </div>

        <!-- 3. MEDICATION REMINDER NOTIFICATION (DYNAMIC) -->
        <div id="home-medication-container" style="display:none; margin-bottom:16px;">
          <div class="card" style="background:#e8f5e9; border:2px solid #c8e6c9; padding:16px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
              <p class="title" style="margin:0; font-weight:800; color:#2e7d32;">💊 MEDICATION REMINDER</p>
            </div>
            <p id="home-med-sub" style="margin:0 0 12px; color:var(--ink); font-weight:700; font-size:15px;"></p>
            <button class="btn btn-primary" onclick="markTaken()" style="background:#2e7d32; border:none; padding:12px;">✓ TAKEN</button>
          </div>
        </div>

        <!-- 4. MEMORY GAME -->
        <div class="card card-hero" onclick="go('game-start')" style="cursor:pointer;">
          <div class="hero-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4a3 3 0 013 3v1a3 3 0 010 6h-1a3 3 0 01-3 3M12 4a3 3 0 00-3 3v1a3 3 0 000 6h1a3 3 0 003 3"/><path d="M12 4v13"/></svg>
          </div>
          <div class="title">🧠 MEMORY GAME</div>
          <p class="subtitle">Exercise your memory</p>
        </div>

        <!-- 5. MY PROGRESS -->
        <div class="card row-card" onclick="go('stats')" style="cursor:pointer;">
          <div class="row-icon gray-bg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>
          </div>
          <div class="row-text">
            <p class="title">📊 MY PROGRESS</p>
            <p class="sub">See your recent activity</p>
          </div>
        </div>

        <!-- 6. GALLERY -->
        <div class="card row-card" onclick="go('p-gallery')" style="cursor:pointer;">
          <div class="row-icon gray-bg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <div class="row-text">
            <p class="title">🖼️ GALLERY</p>
            <p class="sub">View your photos</p>
          </div>
        </div>

        <!-- 7. MY DOCUMENTS -->
        <div class="card row-card" onclick="go('documents')" style="cursor:pointer;">
          <div class="row-icon gray-bg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div class="row-text">
            <p class="title">📄 MY DOCUMENTS</p>
            <p class="sub">View medical files</p>
          </div>
        </div>

        <!-- 8. SOS -->
        <div class="card row-card" onclick="go('sos')" style="cursor:pointer; border:2px solid #ffebee;">
          <div class="row-icon" style="background:#d32f2f; color:#fff;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
          </div>
          <div class="row-text">
            <p class="title" style="color:#d32f2f;">🚨 SOS</p>
            <p class="sub">Emergency Contacts & Location</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ PATIENT GALLERY ============ -->
    <div class="screen" id="screen-p-gallery">
      <div class="topbar">
        <div class="icon-btn" onclick="go('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
        <h2>My Gallery</h2>
        <div style="width:40px;"></div>
      </div>
      <div class="home-scroll">
        <div id="p-gallery-list" class="gallery-grid"></div>
      </div>
    </div>

    <!-- ============ GAME START ============ -->
    <div class="screen" id="screen-game-start">
      <div class="topbar">
        <div class="icon-btn" onclick="go('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
        <h2>Memory Game</h2>
        <div style="width:40px;"></div>
      </div>
      <div class="home-scroll" style="align-items:center; justify-content:center; text-align:center; display:flex; flex-direction:column;">
        <h2 style="font-size:32px; margin-bottom:8px; color:var(--teal-dark);">Test Your Memory</h2>
        <p style="color:var(--gray); margin-bottom:32px; font-size:16px;">A simple game to exercise your mind.</p>
        <button class="btn btn-primary" style="margin-bottom:14px; max-width:280px;" onclick="startCountdown()">START GAME</button>
        <button class="btn btn-outline" style="max-width:280px;" onclick="go('game-instructions')">HOW TO PLAY</button>
      </div>
    </div>

    <!-- ============ GAME INSTRUCTIONS ============ -->
    <div class="screen" id="screen-game-instructions">
      <div class="topbar">
        <div class="icon-btn" onclick="go('game-start')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
        <h2>How to Play</h2>
        <div style="width:40px;"></div>
      </div>
      <div class="home-scroll" style="font-size:16px; line-height:1.6;">
        <p>1. Look carefully at the image shown.</p>
        <p>2. Remember the person/object and their name.</p>
        <p>3. Images will appear for 10 seconds.</p>
        <p>4. Answer the question: <strong>"Who is this?"</strong></p>
        <p>5. Tap the correct name to score points.</p>
        <p>6. You can quit the game at any time using the QUIT button.</p>
        <button class="btn btn-primary" style="margin-top:24px;" onclick="startCountdown()">START GAME</button>
      </div>
    </div>

    <!-- ============ GAME COUNTDOWN ============ -->
    <div class="screen" id="screen-game-countdown" style="justify-content:center; align-items:center; background:var(--teal-dark); color:var(--white);">
      <div id="countdown-text" style="font-size:80px; font-weight:800; font-family:'Baloo 2',sans-serif;">3</div>
    </div>

    <!-- ============ GAME: LOOK CAREFULLY ============ -->
    <div class="screen" id="screen-game-ready">
      <div style="display:flex; justify-content:flex-end; padding:16px 20px 0;">
        <button onclick="requestQuit()" style="background:#e8e4db; border:none; border-radius:12px; padding:8px 16px; color:var(--ink); font-weight:800; font-size:13px; cursor:pointer;">QUIT GAME</button>
      </div>
      <div class="game-ready-body">
        <h2>Look carefully...</h2>
        <div class="stim-card" id="stim-card"></div>
        <div class="timer-row">
          <div class="timer-bar-track"><div class="timer-bar-fill" id="timer-fill" style="width:100%;"></div></div>
          <div class="timer-labels"><span id="timer-start">10s</span><span>0s</span></div>
        </div>
      </div>
      <div class="game-footer">
        <div class="q-count">Question <span id="q-num-ready">1</span> of 10</div>
        <button class="btn btn-primary" onclick="showQuestion()">I'M READY ✓</button>
      </div>
    </div>

    <!-- ============ GAME: WHAT DID YOU SEE ============ -->
    <div class="screen" id="screen-game-question">
      <div style="display:flex; justify-content:flex-end; padding:16px 20px 0;">
        <button onclick="requestQuit()" style="background:#e8e4db; border:none; border-radius:12px; padding:8px 16px; color:var(--ink); font-weight:800; font-size:13px; cursor:pointer;">QUIT GAME</button>
      </div>
      <div class="gq-body">
        <div id="question-image-container" style="margin-bottom:12px; width:100%;"></div>
        <h2>Who is this?</h2>
        <p class="hint">Tap the correct name below</p>
        <div class="options" id="options-wrap"></div>
      </div>
      <div class="gq-footer">
        <div class="q-count">Question <span id="q-num-q">1</span> of 10</div>
      </div>
    </div>

    <!-- ============ GAME: CORRECT ============ -->
    <div class="screen" id="screen-game-correct">
      <div class="correct-card">
        <div class="check-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l5 5L20 7" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <h2 id="correct-heading" style="margin:0 0 4px; font-size:24px;">Well Done! 🎉</h2>
        <p id="correct-sub" style="color:var(--gray); margin:0;">That's correct.</p>
        <div class="dots-row" id="dots-row"></div>
        <button class="btn btn-primary" onclick="nextQuestion()">NEXT &rarr;</button>
      </div>
    </div>

    <!-- ============ GAME: RESULTS ============ -->
    <div class="screen" id="screen-game-result" style="justify-content:center; align-items:center; text-align:center; padding:30px 24px;">
      <div class="card" style="width:100%; padding:30px 20px;">
        <div style="width:70px; height:70px; border-radius:50%; background:var(--mint); margin:0 auto 16px; display:flex; align-items:center; justify-content:center; color:var(--teal-dark);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:36px;height:36px;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
        <h2 style="font-size:26px; color:var(--teal-dark); margin:0 0 8px;">Game Completed!</h2>
        <p style="color:var(--gray); margin:0 0 20px;">Great job exercising your memory.</p>
        <div style="background:var(--cream); border-radius:16px; padding:16px; margin-bottom:20px;">
          <p style="margin:0; font-size:14px; color:var(--gray);">Your Score</p>
          <h1 id="result-score" style="margin:4px 0; font-size:42px; color:var(--teal-dark);">0</h1>
          <p style="margin:0; font-size:14px; color:var(--teal-dark); font-weight:700;"><span id="result-correct">0</span> / 10 Correct</p>
        </div>
        <button class="btn btn-primary" style="margin-bottom:12px;" onclick="go('game-start')">PLAY AGAIN</button>
        <button class="btn btn-outline" onclick="go('home')">BACK TO HOME</button>
      </div>
    </div>

    <!-- ============ MEDS SCREEN (DUAL TAB: MEDICINES & VISITS) ============ -->
    <div class="screen" id="screen-reminders">
      <div class="topbar">
        <div class="icon-btn" onclick="go('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
        <h2>Meds & Visits</h2>
        <div style="width:40px;"></div>
      </div>
      <div style="display:flex; background:#fff; border-bottom:2px solid #eee;">
        <div id="tab-btn-meds" onclick="switchMedTab('meds')" style="flex:1; text-align:center; padding:14px; font-weight:800; font-size:14px; border-bottom:3px solid var(--teal-dark); color:var(--teal-dark); cursor:pointer;">MEDICINES</div>
        <div id="tab-btn-visits" onclick="switchMedTab('visits')" style="flex:1; text-align:center; padding:14px; font-weight:800; font-size:14px; border-bottom:3px solid transparent; color:var(--gray); cursor:pointer;">VISITS & APPOINTMENTS</div>
      </div>
      <!-- TAB 1: MEDICINES -->
      <div class="home-scroll" id="med-tab-meds" style="padding:16px 20px;">
        <div id="patient-med-list">
          <p style="color:var(--gray); text-align:center;">No medicines scheduled.</p>
        </div>
      </div>
      <!-- TAB 2: VISITS & APPOINTMENTS -->
      <div class="home-scroll" id="med-tab-visits" style="padding:16px 20px; display:none;">
        <div id="patient-visits-list">
          <p style="color:var(--gray); text-align:center;">No upcoming visits or appointments.</p>
        </div>
      </div>
    </div>

    <!-- ============ STATS / PROGRESS SCREEN ============ -->
    <div class="screen" id="screen-stats">
      <div class="topbar">
        <div class="icon-btn" onclick="go('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
        <h2>My Progress</h2>
        <div style="width:40px;"></div>
      </div>
      <div class="stats-body">
        <div class="ring-wrap">
          <svg viewBox="0 0 120 120" width="150" height="150">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#e6e3db" stroke-width="14"/>
            <circle cx="60" cy="60" r="50" fill="none" stroke="#0b5d52" stroke-width="14" stroke-dasharray="314" stroke-dashoffset="55" stroke-linecap="round" transform="rotate(-90 60 60)"/>
            <circle cx="60" cy="60" r="50" fill="none" stroke="#f2a93d" stroke-width="14" stroke-dasharray="314" stroke-dashoffset="259" stroke-linecap="round" transform="rotate(197 60 60)"/>
          </svg>
          <div class="status-word">Active</div>
          <div class="status-sub">Status</div>
        </div>
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background:#8fe0c9;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
            <p class="label">Games Played</p>
            <p class="value" id="stats-games-count">0</p>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#f2c9a3;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
            <p class="label">Total Score</p>
            <p class="value" id="stats-score-count">0</p>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:var(--teal-mid);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></div>
            <p class="label">Correct Answers</p>
            <p class="value" id="stats-correct-count">0</p>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:var(--orange);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
            <p class="label">Daily Streak</p>
            <p class="value">3 Days</p>
          </div>
        </div>
        <div class="perf-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l5-6 4 4 8-9"/></svg>Recent Performance</div>
        <div class="perf-bars">
          <div class="perf-bar" style="height:45%;"></div>
          <div class="perf-bar" style="height:70%;"></div>
          <div class="perf-bar" style="height:55%;"></div>
          <div class="perf-bar" style="height:90%;background:#0b5d52;"></div>
          <div class="perf-bar" style="height:65%;"></div>
          <div class="perf-bar" style="height:80%;"></div>
          <div class="perf-bar" style="height:60%;"></div>
        </div>
      </div>
    </div>

    <!-- ============ ACCOUNT SCREEN ============ -->
    <div class="screen" id="screen-account">
      <div class="topbar">
        <div class="icon-btn" onclick="go('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
        <h2>My Account</h2>
        <div style="width:40px;"></div>
      </div>
      <div class="home-scroll" style="padding:16px 20px;">
        <div style="text-align:center; margin-bottom:20px;">
          <div style="width:80px; height:80px; border-radius:50%; background:var(--mint); margin:0 auto 10px; display:flex; align-items:center; justify-content:center; color:var(--teal-dark);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:44px; height:44px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h3 id="acc-display-name" style="margin:0; font-size:18px;">Patient Profile</h3>
        </div>
        <div class="field">
          <label>Full Name</label>
          <div class="input-wrap"><input id="acc-name" type="text" placeholder="Your Name"></div>
        </div>
        <div class="field">
          <label>Phone Number</label>
          <div class="input-wrap"><input id="acc-phone" type="text" placeholder="Phone Number"></div>
        </div>
        <div class="field">
          <label>Address</label>
          <div class="input-wrap"><input id="acc-address" type="text" placeholder="Address"></div>
        </div>
        <div class="field">
          <label>Email Address</label>
          <div class="input-wrap"><input id="acc-email" type="email" placeholder="Email Address"></div>
        </div>
        <button class="btn btn-primary" onclick="saveAccount()" style="margin-top:16px;">SAVE CHANGES</button>
      </div>
    </div>

    <!-- ============ MY DOCUMENTS SCREEN ============ -->
    <div class="screen" id="screen-documents">
      <div class="topbar">
        <div class="icon-btn" onclick="go('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
        <h2>Documents</h2>
        <div style="width:40px;"></div>
      </div>
      <div class="home-scroll" style="padding:16px 20px;">
        <h3 style="margin:0 0 8px; font-size:16px; color:var(--teal-dark);">Patient Information</h3>
        <div class="card" id="doc-patient-info" style="margin-bottom:20px; padding:14px;">
          <p style="color:var(--gray); margin:0;">Loading...</p>
        </div>

        <h3 style="margin:0 0 8px; font-size:16px; color:var(--teal-dark);">Prescriptions</h3>
        <div id="doc-prescriptions" style="margin-bottom:20px;">
          <p style="color:var(--gray); margin:0;">No prescriptions found.</p>
        </div>

        <h3 style="margin:0 0 8px; font-size:16px; color:var(--teal-dark);">My Medical Documents</h3>
        <div id="doc-list">
          <p style="color:var(--gray); margin:0;">No documents uploaded.</p>
        </div>
      </div>
    </div>

    <!-- ============ SOS SCREEN ============ -->
    <div class="screen" id="screen-sos">
      <div class="topbar">
        <div class="icon-btn" onclick="go('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></div>
        <h2>SOS & Emergency</h2>
        <div style="width:40px;"></div>
      </div>
      <div class="home-scroll" style="background:#fff7f7; padding:16px 20px;">
        <div style="text-align:center; padding:10px 0 16px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="#d32f2f" stroke-width="2" style="width:54px;height:54px;margin-bottom:8px;"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
          <h2 style="color:#d32f2f; margin:0; font-size:22px;">Emergency Contacts</h2>
        </div>

        <div id="sos-patient-details" style="margin-bottom:16px; text-align:center; background:#fff; padding:12px; border-radius:14px; box-shadow:var(--shadow);"></div>
        <div id="sos-contact-list"></div>

        <h3 style="margin-top:20px; color:var(--teal-dark); font-size:16px;">Live Location Tracking</h3>
        <div class="card" style="text-align:center; padding:16px;">
          <p style="font-size:15px; font-weight:700; margin-bottom:12px;">Status: <span id="track-status" style="color:var(--gray);">OFF</span></p>
          <button id="btn-track-on" class="btn btn-primary" style="margin-bottom:8px; padding:12px;" onclick="toggleTracking(true)">START LIVE TRACKING</button>
          <button id="btn-track-off" class="btn" style="background:#e8e4db; color:var(--ink); padding:12px; display:none;" onclick="toggleTracking(false)">STOP LIVE TRACKING</button>
          <p id="track-msg" style="font-size:12px; color:var(--gray); margin-top:8px;"></p>
        </div>

        <div id="patient-map-container" style="display:none; margin-top:16px; border:2px solid var(--teal-dark); border-radius:16px; overflow:hidden;">
          <div style="background:var(--teal-dark); color:white; padding:8px 12px; font-weight:700; display:flex; justify-content:space-between; font-size:13px;">
            <span>📍 Current Location</span>
            <span id="pt-map-time" style="font-weight:400;">-</span>
          </div>
          <div id="pt-leaflet-map" style="width:100%; height:220px; background:#e6e3db;"></div>
        </div>
      </div>
    </div>

    <!-- ============ SINGLE PERSISTENT FOOTER NAVIGATION ============ -->
    <div class="bottom-nav">
      <div class="nav-item active" id="nav-home" onclick="go('home')">
        <div class="nav-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg></div>
        Home
      </div>
      <div class="nav-item" id="nav-game" onclick="go('game-start')">
        <div class="nav-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4a3 3 0 013 3v1a3 3 0 010 6h-1a3 3 0 01-3 3M12 4a3 3 0 00-3 3v1a3 3 0 000 6h1a3 3 0 003 3"/><path d="M12 4v13"/></svg></div>
        Games
      </div>
      <div class="nav-item" id="nav-meds" onclick="go('reminders')">
        <div class="nav-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M3 8l9-5 9 5"/></svg></div>
        Meds
      </div>
      <div class="nav-item" id="nav-stats" onclick="go('stats')">
        <div class="nav-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg></div>
        Stats
      </div>
      <div class="nav-item" id="nav-account" onclick="go('account')">
        <div class="nav-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
        Account
      </div>
    </div>

  </div><!-- end of .device -->
</div><!-- end of .app -->

<div class="toast" id="toast"></div>

<script>
  // ---------- DATA PERSISTENCE & INITIAL STATE ----------
  let appData = JSON.parse(localStorage.getItem('meca_data_v2')) || {
    patientName: 'Ravi Kumar',
    patientPhone: '+91 9876543210',
    patientEmail: 'ravi.kumar@example.com',
    patientAddress: '123 Park Street, Indiranagar, Bengaluru',
    caretakerName: 'Anita Sharma',
    caretakerPhone: '+91 9876543211',
    caretakerEmail: 'anita.caretaker@example.com',
    role: null,
    images: [],
    medicine: [
      { id: 1, name: 'Paracetamol', type: 'Tablet', dosage: '500 mg', frequency: 2, times: ['08:00', '20:00'], history: {} },
      { id: 2, name: 'Vitamin D3', type: 'Capsule', dosage: '60,000 IU', frequency: 1, times: ['09:00'], history: {} },
      { id: 3, name: 'Blood Pressure Med', type: 'Tablet', dosage: '10 mg', frequency: 1, times: ['21:00'], history: {} }
    ],
    visits: [
      { id: 1, kind: 'doctor', name: 'Dr. Ananya Sharma', specialization: 'Neurologist / Memory Care', location: 'Apollo Hospital, Clinic 4B', date: '2026-09-02', time: '11:30 AM', purpose: 'Routine Cognitive Review' },
      { id: 2, kind: 'visitor', name: 'Rahul Sharma', relation: 'Son', date: '2026-09-03', time: '05:00 PM', purpose: 'Family Visit' }
    ],
    prescriptions: [
      { med: 'Donepezil 5mg', dose: '1 tablet daily at bedtime', time: '09:00 PM', doctor: 'Dr. Ananya Sharma', date: '15 Aug 2026' },
      { med: 'Multivitamin Complex', dose: '1 tablet after breakfast', time: '09:30 AM', doctor: 'Dr. Mehta', date: '10 Aug 2026' }
    ],
    documents: [
      { id: 'doc1', name: 'Brain MRI Scan Report.pdf', type: 'application/pdf', date: '12 Aug 2026' },
      { id: 'doc2', name: 'Comprehensive Blood Test.pdf', type: 'application/pdf', date: '05 Aug 2026' },
      { id: 'doc3', name: 'Neurologist Consultation Notes.pdf', type: 'application/pdf', date: '15 Aug 2026' }
    ],
    emergencyContacts: [
      { rel: 'Son', name: 'Rahul Sharma', phone: '+919876543210' },
      { rel: 'Daughter', name: 'Priya Sharma', phone: '+919876543211' },
      { rel: 'Primary Caretaker', name: 'Anita Sharma', phone: '+919876543212' }
    ],
    stats: { games: 4, score: 30, correct: 3, incorrect: 1 },
    currentGameCorrect: 0,
    liveLocation: { active: false }
  };

  // Seed sample images if empty
  if (!appData.images || appData.images.length === 0) {
    appData.images = [
      { id: '1', dataUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500', name: 'Anita' },
      { id: '2', dataUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500', name: 'Rahul' },
      { id: '3', dataUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500', name: 'Priya' },
      { id: '4', dataUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500', name: 'Sanjay' },
      { id: '5', dataUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500', name: 'Kiran' }
    ];
  }

  function saveApp() {
    localStorage.setItem('meca_data_v2', JSON.stringify(appData));
  }

  // ---------- CENTRAL ROUTER (go) ----------
  function go(id) {
    // 1. Update footer navigation active class
    document.querySelectorAll('.bottom-nav .nav-item').forEach(el => el.classList.remove('active'));
    if (id === 'home') { let e = document.getElementById('nav-home'); if(e) e.classList.add('active'); }
    else if (id === 'game-start' || id.startsWith('game-')) { let e = document.getElementById('nav-game'); if(e) e.classList.add('active'); }
    else if (id === 'reminders') { let e = document.getElementById('nav-meds'); if(e) e.classList.add('active'); }
    else if (id === 'stats') { let e = document.getElementById('nav-stats'); if(e) e.classList.add('active'); }
    else if (id === 'account') { let e = document.getElementById('nav-account'); if(e) e.classList.add('active'); }

    // 2. Hide all screens and show the target screen
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('screen-' + id);
    if (target) {
      target.classList.add('active');
    }

    // 3. Trigger screen renderers
    if (id === 'home') renderDynamicHome();
    if (id === 'p-gallery' || id === 'c-gallery' || id === 'personalize') renderGalleries();
    if (id === 'documents' || id === 'sos') renderDocuments();
    if (id === 'reminders') { renderPatientMeds(); renderPatientVisits(); }
    if (id === 'stats') renderStats();
    if (id === 'account') loadAccount();

    window.scrollTo(0, 0);
  }

  // ---------- ROLE & NAME SETUP ----------
  let selectedRole = '';
  function selectRole(role) {
    selectedRole = role;
    if (role === 'patient') {
      if (appData.patientName) {
        updateDashboardGreeting();
        go('home');
      } else {
        document.getElementById('name-setup-title').textContent = "What's your name?";
        go('name-setup');
      }
    } else {
      if (appData.caretakerName) {
        go('caretaker-dashboard');
      } else {
        document.getElementById('name-setup-title').textContent = "Caretaker Name";
        go('name-setup');
      }
    }
  }

  function saveNameAndProceed() {
    const val = document.getElementById('user-name-input').value.trim();
    if (!val) { showToast('Please enter a name'); return; }
    if (selectedRole === 'patient') {
      appData.patientName = val;
      saveApp();
      updateDashboardGreeting();
      go('home');
    } else {
      appData.caretakerName = val;
      saveApp();
      go('caretaker-dashboard');
    }
  }

  function updateDashboardGreeting() {
    const el = document.getElementById('home-username');
    if (el) el.textContent = appData.patientName || 'Patient';
    const hour = new Date().getHours();
    const timeEl = document.getElementById('home-greeting-time');
    if (timeEl) {
      if (hour < 12) timeEl.textContent = 'Good morning,';
      else if (hour < 17) timeEl.textContent = 'Good afternoon,';
      else timeEl.textContent = 'Good evening,';
    }
  }

  // ---------- DYNAMIC HOME SCREEN ----------
  function renderDynamicHome() {
    updateDashboardGreeting();

    // 1. Check Pending Meds
    const medContainer = document.getElementById('home-medication-container');
    const medSub = document.getElementById('home-med-sub');
    let hasPendingMed = false;
    const todayStr = new Date().toISOString().split('T')[0];

    if (appData.medicine && appData.medicine.length > 0) {
      for (let m of appData.medicine) {
        if (m.times) {
          for (let t of m.times) {
            const hist = (m.history && m.history[todayStr]) || {};
            if (hist[t] !== 'TAKEN') {
              hasPendingMed = true;
              medSub.innerHTML = m.name + ' (' + (m.dosage || '1 dose') + ') at ' + t;
              break;
            }
          }
        }
        if (hasPendingMed) break;
      }
    }
    medContainer.style.display = hasPendingMed ? 'block' : 'none';

    // 2. Check Upcoming Visits
    const visContainer = document.getElementById('home-visits-container');
    const visSub = document.getElementById('home-visit-sub');
    const visits = appData.visits || [];
    if (visits.length > 0) {
      const v = visits[0];
      visContainer.style.display = 'block';
      visSub.innerHTML = (v.kind === 'doctor' ? '👨‍⚕️ ' : '👋 ') + v.name + ' • ' + v.date + ' at ' + v.time;
    } else {
      visContainer.style.display = 'none';
    }
  }

  function markTaken() {
    const todayStr = new Date().toISOString().split('T')[0];
    if (appData.medicine && appData.medicine.length > 0) {
      for (let m of appData.medicine) {
        if (!m.history) m.history = {};
        if (!m.history[todayStr]) m.history[todayStr] = {};
        if (m.times) {
          for (let t of m.times) {
            if (m.history[todayStr][t] !== 'TAKEN') {
              m.history[todayStr][t] = 'TAKEN';
              saveApp();
              showToast('Medicine marked as TAKEN ✓');
              renderDynamicHome();
              renderPatientMeds();
              return;
            }
          }
        }
      }
    }
    showToast('No pending medications');
  }

  // ---------- GALLERY RENDERING ----------
  function renderGalleries() {
    const images = appData.images || [];
    let pHtml = '';
    images.forEach(img => {
      pHtml += '<div class="gallery-item"><img src="' + img.dataUrl + '" alt="' + img.name + '"><div class="name">' + img.name + '</div></div>';
    });
    const pList = document.getElementById('p-gallery-list');
    if (pList) {
      pList.innerHTML = images.length > 0 ? pHtml : '<p style="color:var(--gray); grid-column:span 2; text-align:center;">No gallery photos available.</p>';
    }
    const cList = document.getElementById('c-gallery-list');
    if (cList) {
      cList.innerHTML = images.length > 0 ? pHtml : '<p style="color:var(--gray); grid-column:span 2; text-align:center;">No gallery photos available.</p>';
    }
  }

  // ---------- DOCUMENTS & SOS RENDERING ----------
  function renderDocuments() {
    // 1. Patient Profile
    const pName = appData.patientName || 'Ravi Kumar';
    const pPhone = appData.patientPhone || '+91 9876543210';
    const pAddr = appData.patientAddress || '123 Park Street, Indiranagar, Bengaluru';
    
    const docInfo = document.getElementById('doc-patient-info');
    if (docInfo) {
      docInfo.innerHTML = '<p style="margin:0 0 4px;"><strong>Name:</strong> ' + pName + '</p>' +
                          '<p style="margin:0 0 4px;"><strong>Phone:</strong> ' + pPhone + '</p>' +
                          '<p style="margin:0;"><strong>Address:</strong> ' + pAddr + '</p>';
    }

    // 2. Prescriptions
    const rxContainer = document.getElementById('doc-prescriptions');
    if (rxContainer) {
      const rxs = appData.prescriptions || [];
      if (rxs.length === 0) {
        rxContainer.innerHTML = '<p style="color:var(--gray); margin:0;">No prescriptions found.</p>';
      } else {
        let rHtml = '';
        rxs.forEach(rx => {
          rHtml += '<div class="card" style="margin-bottom:12px; border-left:4px solid var(--teal-dark); padding:14px;">' +
                   '<h4 style="margin:0 0 6px; color:var(--teal-dark);">' + rx.med + '</h4>' +
                   '<p style="margin:0 0 4px; font-size:14px;"><strong>Instructions:</strong> ' + rx.dose + '</p>' +
                   '<p style="margin:0 0 4px; font-size:14px;"><strong>Prescribed by:</strong> ' + rx.doctor + '</p>' +
                   '<p style="margin:0; font-size:12px; color:var(--gray);">Date: ' + rx.date + '</p>' +
                   '</div>';
        });
        rxContainer.innerHTML = rHtml;
      }
    }

    // 3. Document Files
    const docList = document.getElementById('doc-list');
    if (docList) {
      const docs = appData.documents || [];
      if (docs.length === 0) {
        docList.innerHTML = '<p style="color:var(--gray); margin:0;">No documents uploaded.</p>';
      } else {
        let dHtml = '';
        docs.forEach(d => {
          dHtml += '<div class="card row-card" style="margin-bottom:12px; cursor:pointer;" onclick="showToast(\'Viewing ' + d.name + '\')">' +
                   '<div class="row-icon gray-bg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg></div>' +
                   '<div class="row-text"><p class="title">' + d.name + '</p><p class="sub">Uploaded: ' + d.date + '</p></div>' +
                   '</div>';
        });
        docList.innerHTML = dHtml;
      }
    }

    // 4. SOS Contacts
    const sosDetails = document.getElementById('sos-patient-details');
    if (sosDetails) {
      sosDetails.innerHTML = '<p style="margin:0; font-weight:800; font-size:16px;">' + pName + '</p><p style="margin:4px 0 0; font-size:13px; color:var(--gray);">' + pAddr + '</p>';
    }

    const sosList = document.getElementById('sos-contact-list');
    if (sosList) {
      const contacts = appData.emergencyContacts || [];
      let sHtml = '';
      contacts.forEach(c => {
        sHtml += '<div class="card" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; padding:14px;">' +
                 '<div><h4 style="margin:0 0 4px; font-size:16px;">' + c.name + ' (' + c.rel + ')</h4><p style="margin:0; font-size:13px; color:var(--gray);">' + c.phone + '</p></div>' +
                 '<button class="btn" style="background:#d32f2f; color:#fff; padding:10px 18px; border-radius:12px; width:auto;" onclick="callSOS(\'' + c.phone + '\')">CALL</button>' +
                 '</div>';
      });
      sosList.innerHTML = sHtml;
    }
  }

  function callSOS(phone) {
    if (confirm('Call emergency contact: ' + phone + '?')) {
      window.location.href = 'tel:' + phone;
    }
  }

  // ---------- MEDS SCREEN TAB SWITCHER & LISTS ----------
  function switchMedTab(tab) {
    document.getElementById('med-tab-meds').style.display = (tab === 'meds') ? 'block' : 'none';
    document.getElementById('med-tab-visits').style.display = (tab === 'visits') ? 'block' : 'none';

    document.getElementById('tab-btn-meds').style.borderColor = (tab === 'meds') ? 'var(--teal-dark)' : 'transparent';
    document.getElementById('tab-btn-meds').style.color = (tab === 'meds') ? 'var(--teal-dark)' : 'var(--gray)';

    document.getElementById('tab-btn-visits').style.borderColor = (tab === 'visits') ? 'var(--teal-dark)' : 'transparent';
    document.getElementById('tab-btn-visits').style.color = (tab === 'visits') ? 'var(--teal-dark)' : 'var(--gray)';
  }

  function renderPatientMeds() {
    const list = document.getElementById('patient-med-list');
    if (!list) return;
    const meds = appData.medicine || [];
    if (meds.length === 0) {
      list.innerHTML = '<p style="color:var(--gray); text-align:center; padding:20px;">No medicines scheduled.</p>';
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    let html = '';
    meds.forEach(m => {
      html += '<div class="card" style="margin-bottom:14px; padding:16px;">';
      html += '<h3 style="margin:0 0 4px; font-size:17px; color:var(--teal-dark);">' + m.name + '</h3>';
      html += '<p style="margin:0 0 10px; color:var(--gray); font-size:14px;">' + (m.type || 'Tablet') + ' • ' + (m.dosage || '-') + ' • ' + (m.frequency || 1) + 'x Daily</p>';
      const hist = (m.history && m.history[todayStr]) || {};
      (m.times || []).forEach(t => {
        const isTaken = hist[t] === 'TAKEN';
        html += '<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-top:1px solid #eee;">';
        html += '<span style="font-size:14px; font-weight:700;">' + t + '</span>';
        if (isTaken) {
          html += '<span style="color:#2e7d32; font-weight:800; font-size:13px;">✓ TAKEN</span>';
        } else {
          html += '<button class="btn btn-primary" style="padding:6px 14px; font-size:12px; width:auto; border-radius:10px;" onclick="takeMedItem(' + m.id + ', \'' + t + '\')">TAKE</button>';
        }
        html += '</div>';
      });
      html += '</div>';
    });
    list.innerHTML = html;
  }

  function takeMedItem(medId, time) {
    const todayStr = new Date().toISOString().split('T')[0];
    const med = (appData.medicine || []).find(m => m.id === medId);
    if (med) {
      if (!med.history) med.history = {};
      if (!med.history[todayStr]) med.history[todayStr] = {};
      med.history[todayStr][time] = 'TAKEN';
      saveApp();
      showToast(med.name + ' marked as TAKEN');
      renderPatientMeds();
      renderDynamicHome();
    }
  }

  function renderPatientVisits() {
    const list = document.getElementById('patient-visits-list');
    if (!list) return;
    const visits = appData.visits || [];
    if (visits.length === 0) {
      list.innerHTML = '<p style="color:var(--gray); text-align:center; padding:20px;">No upcoming visits or doctor appointments.</p>';
      return;
    }
    let html = '';
    visits.forEach(v => {
      const isDoctor = v.kind === 'doctor';
      html += '<div class="card" style="margin-bottom:14px; padding:16px; border-left:4px solid ' + (isDoctor ? '#f57f17' : 'var(--teal-dark)') + ';">';
      html += '<div style="display:flex; justify-content:space-between; align-items:flex-start;">';
      html += '<div>';
      html += '<span style="font-size:11px; font-weight:800; text-transform:uppercase; color:' + (isDoctor ? '#f57f17' : 'var(--teal-dark)') + ';">' + (isDoctor ? 'Doctor Appointment' : 'Upcoming Visit') + '</span>';
      html += '<h3 style="margin:4px 0; font-size:17px;">' + v.name + '</h3>';
      if (isDoctor && v.specialization) html += '<p style="margin:0 0 4px; font-size:13px; color:var(--teal-dark); font-weight:700;">' + v.specialization + '</p>';
      if (!isDoctor && v.relation) html += '<p style="margin:0 0 4px; font-size:13px; color:var(--gray); font-weight:700;">Relation: ' + v.relation + '</p>';
      if (v.location) html += '<p style="margin:0 0 4px; font-size:13px; color:var(--gray);">📍 ' + v.location + '</p>';
      if (v.purpose) html += '<p style="margin:0 0 4px; font-size:13px; color:var(--gray);">Purpose: ' + v.purpose + '</p>';
      html += '</div>';
      html += '<div style="text-align:right;">';
      html += '<p style="margin:0; font-weight:800; font-size:14px; color:var(--ink);">' + v.date + '</p>';
      html += '<p style="margin:2px 0 0; font-size:13px; color:var(--gray); font-weight:700;">' + v.time + '</p>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    });
    list.innerHTML = html;
  }

  // ---------- STATS & PROGRESS RENDERING ----------
  function renderStats() {
    const s = appData.stats || { games: 0, score: 0, correct: 0, incorrect: 0 };
    const gamesEl = document.getElementById('stats-games-count');
    if (gamesEl) gamesEl.textContent = s.games || 0;
    const scoreEl = document.getElementById('stats-score-count');
    if (scoreEl) scoreEl.textContent = s.score || 0;
    const correctEl = document.getElementById('stats-correct-count');
    if (correctEl) correctEl.textContent = s.correct || 0;
  }

  // ---------- ACCOUNT PROFILE ----------
  function loadAccount() {
    const pName = appData.patientName || 'Ravi Kumar';
    document.getElementById('acc-display-name').textContent = pName;
    document.getElementById('acc-name').value = pName;
    document.getElementById('acc-phone').value = appData.patientPhone || '+91 9876543210';
    document.getElementById('acc-address').value = appData.patientAddress || '123 Park Street, Indiranagar, Bengaluru';
    document.getElementById('acc-email').value = appData.patientEmail || 'ravi.kumar@example.com';
  }

  function saveAccount() {
    appData.patientName = document.getElementById('acc-name').value.trim() || 'Patient';
    appData.patientPhone = document.getElementById('acc-phone').value.trim();
    appData.patientAddress = document.getElementById('acc-address').value.trim();
    appData.patientEmail = document.getElementById('acc-email').value.trim();
    saveApp();
    updateDashboardGreeting();
    showToast('Account details saved ✓');
    go('home');
  }

  // ---------- MEMORY GAME ENGINE ----------
  let currentRounds = [];
  let roundIndex = 0;
  let countdownTimer = null;
  window.gameTimeouts = [];

  function setGameTimeout(fn, ms) {
    const t = setTimeout(fn, ms);
    window.gameTimeouts.push(t);
    return t;
  }

  function clearAllGameTimeouts() {
    window.gameTimeouts.forEach(t => clearTimeout(t));
    window.gameTimeouts = [];
  }

  function requestQuit() {
    if (window.timerAnimationFrame) {
      cancelAnimationFrame(window.timerAnimationFrame);
      window.timerAnimationFrame = null;
    }
    clearAllGameTimeouts();
    go('game-start');
    showToast('Game cancelled');
  }

  function startCountdown() {
    go('game-countdown');
    const cdText = document.getElementById('countdown-text');
    cdText.style.fontSize = '80px';
    cdText.textContent = '3';

    if (countdownTimer) clearTimeout(countdownTimer);
    if (window.timerAnimationFrame) {
      cancelAnimationFrame(window.timerAnimationFrame);
      window.timerAnimationFrame = null;
    }
    clearAllGameTimeouts();

    countdownTimer = setGameTimeout(() => {
      cdText.textContent = '2';
      countdownTimer = setGameTimeout(() => {
        cdText.textContent = '1';
        countdownTimer = setGameTimeout(() => {
          cdText.style.fontSize = '48px';
          cdText.textContent = "LET'S GO!";
          countdownTimer = setGameTimeout(() => {
            startGameLogic();
          }, 800);
        }, 1000);
      }, 1000);
    }, 1000);
  }

  function generateDynamicRounds() {
    let aiMock = [
      { img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500', name: 'Computer' },
      { img: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500', name: 'Ocean' },
      { img: 'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?w=500', name: 'Mountain' },
      { img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500', name: 'Salad' },
      { img: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=500', name: 'Forest' }
    ];
    let pers = [...(appData.images || [])];
    let allNames = pers.map(p => p.name).concat(aiMock.map(a => a.name), ['Cat', 'Dog', 'House', 'Car', 'Tree', 'Book']);

    function getOpts(correct) {
      let opts = new Set([correct]);
      let shuffled = [...allNames].sort(() => Math.random() - 0.5);
      for (let x of shuffled) {
        if (opts.size < 4) opts.add(x);
      }
      return Array.from(opts).sort(() => Math.random() - 0.5);
    }

    let generated = [];
    pers.sort(() => Math.random() - 0.5);
    aiMock.sort(() => Math.random() - 0.5);

    let pIdx = 0, aIdx = 0;
    for (let i = 0; i < 10; i++) {
      let src;
      if (pers.length > 0 && (i % 2 === 0 || aIdx >= aiMock.length)) {
        src = pers[pIdx % pers.length];
        pIdx++;
      } else {
        src = aiMock[aIdx % aiMock.length];
        aIdx++;
      }
      generated.push({ img: src.dataUrl || src.img, name: src.name, options: getOpts(src.name) });
    }
    return generated;
  }

  function startGameLogic() {
    appData.currentGameCorrect = 0;
    currentRounds = generateDynamicRounds();
    roundIndex = 0;
    go('game-ready');
    setupReadyScreen();
  }

  function setupReadyScreen() {
    const round = currentRounds[roundIndex];
    const stimCard = document.getElementById('stim-card');
    stimCard.innerHTML = '<img src="' + round.img + '" alt="' + round.name + '">';
    document.getElementById('q-num-ready').textContent = (roundIndex + 1);
    document.getElementById('q-num-q').textContent = (roundIndex + 1);

    // 10-second smooth animated timer
    let timerDuration = 10000;
    let startTime = null;

    if (window.timerAnimationFrame) {
      cancelAnimationFrame(window.timerAnimationFrame);
    }

    function animateTimer(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const remainingMs = Math.max(timerDuration - elapsed, 0);
      const remainingSec = Math.ceil(remainingMs / 1000);
      const percent = (remainingMs / timerDuration) * 100;

      document.getElementById('timer-start').textContent = remainingSec + 's';
      document.getElementById('timer-fill').style.width = percent + '%';

      if (remainingMs > 0) {
        window.timerAnimationFrame = requestAnimationFrame(animateTimer);
      } else {
        showQuestion();
      }
    }
    window.timerAnimationFrame = requestAnimationFrame(animateTimer);
  }

  function showQuestion() {
    if (window.timerAnimationFrame) {
      cancelAnimationFrame(window.timerAnimationFrame);
      window.timerAnimationFrame = null;
    }
    const round = currentRounds[roundIndex];
    const qImgContainer = document.getElementById('question-image-container');
    if (qImgContainer) {
      qImgContainer.innerHTML = '<img src="' + round.img + '" style="width:100%; max-height:180px; object-fit:cover; border-radius:16px;">';
    }
    const wrap = document.getElementById('options-wrap');
    wrap.innerHTML = '';
    round.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.onclick = () => selectAnswer(opt, round.name, btn);
      wrap.appendChild(btn);
    });
    go('game-question');
  }

  function selectAnswer(selected, correct, btnEl) {
    const allBtns = document.querySelectorAll('#options-wrap .option-btn');
    allBtns.forEach(b => b.disabled = true);

    if (!appData.stats) appData.stats = { games: 0, score: 0, correct: 0, incorrect: 0 };

    if (selected === correct) {
      btnEl.classList.add('correct');
      document.getElementById('correct-heading').textContent = "Well Done! 🎉";
      document.getElementById('correct-sub').textContent = "That's correct.";
      appData.stats.correct = (appData.stats.correct || 0) + 1;
      appData.stats.score = (appData.stats.score || 0) + 10;
      appData.currentGameCorrect = (appData.currentGameCorrect || 0) + 1;
      buildDots(true);
      setGameTimeout(() => go('game-correct'), 500);
    } else {
      btnEl.classList.add('wrong');
      allBtns.forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
      document.getElementById('correct-heading').textContent = "Nice try!";
      document.getElementById('correct-sub').textContent = "The answer was " + correct + ".";
      appData.stats.incorrect = (appData.stats.incorrect || 0) + 1;
      buildDots(false);
      setGameTimeout(() => go('game-correct'), 1200);
    }
    saveApp();
  }

  function buildDots(correct) {
    const row = document.getElementById('dots-row');
    if (!row) return;
    row.innerHTML = '';
    const q = roundIndex % 10;
    for (let i = 0; i < 10; i++) {
      const d = document.createElement('div');
      d.className = 'dot' + (i <= q ? ' filled' : '');
      row.appendChild(d);
    }
  }

  function nextQuestion() {
    roundIndex += 1;
    if (roundIndex >= 10) {
      if (!appData.stats) appData.stats = { games: 0, score: 0, correct: 0, incorrect: 0 };
      appData.stats.games = (appData.stats.games || 0) + 1;
      saveApp();
      document.getElementById('result-score').textContent = (appData.currentGameCorrect || 0) * 10;
      document.getElementById('result-correct').textContent = appData.currentGameCorrect || 0;
      go('game-result');
      return;
    }
    go('game-ready');
    setupReadyScreen();
  }

  // ---------- LIVE TRACKING & MAP ----------
  let trackingWatchId = null;
  let ptMapInstance = null;
  let ptMapMarker = null;
  let mqttClient = null;

  function initMqtt() {
    if (!mqttClient && typeof mqtt !== 'undefined') {
      try {
        mqttClient = mqtt.connect('wss://test.mosquitto.org:8081');
      } catch(e) {}
    }
  }

  function initPatientMap() {
    if (!ptMapInstance) {
      ptMapInstance = L.map('pt-leaflet-map').setView([0, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(ptMapInstance);
    }
  }

  function toggleTracking(enable) {
    initMqtt();

    if (enable) {
      if (!navigator.geolocation) {
        document.getElementById('track-msg').textContent = 'Location services not supported by browser.';
        return;
      }
      document.getElementById('track-msg').textContent = 'Requesting location permission...';
      trackingWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          document.getElementById('track-status').innerHTML = '● Live Tracking ON';
          document.getElementById('track-status').style.color = '#d32f2f';
          document.getElementById('btn-track-on').style.display = 'none';
          document.getElementById('btn-track-off').style.display = 'inline-block';
          document.getElementById('track-msg').textContent = 'Sharing location in real time...';

          const t = new Date().toLocaleTimeString();
          const locData = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            time: t,
            active: true
          };

          appData.liveLocation = locData;
          saveApp();

          if (mqttClient) {
            try {
              mqttClient.publish('smriti/hackathon/PATIENT_DEMO_001/location', JSON.stringify(locData));
            } catch(e) {}
          }

          document.getElementById('patient-map-container').style.display = 'block';
          document.getElementById('pt-map-time').textContent = t;

          initPatientMap();
          setTimeout(() => ptMapInstance.invalidateSize(), 100);

          if (!ptMapMarker) {
            ptMapMarker = L.marker([pos.coords.latitude, pos.coords.longitude]).addTo(ptMapInstance);
          } else {
            ptMapMarker.setLatLng([pos.coords.latitude, pos.coords.longitude]);
          }
          ptMapInstance.setView([pos.coords.latitude, pos.coords.longitude], 15);
        },
        (err) => {
          document.getElementById('track-msg').textContent = 'Permission denied or unavailable';
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      if (trackingWatchId !== null) {
        navigator.geolocation.clearWatch(trackingWatchId);
        trackingWatchId = null;
      }
      document.getElementById('track-status').innerHTML = 'OFF';
      document.getElementById('track-status').style.color = 'var(--gray)';
      document.getElementById('btn-track-on').style.display = 'inline-block';
      document.getElementById('btn-track-off').style.display = 'none';
      document.getElementById('track-msg').textContent = 'Live tracking stopped.';
      document.getElementById('patient-map-container').style.display = 'none';

      const locDataOff = { active: false };
      appData.liveLocation = locDataOff;
      saveApp();

      if (mqttClient) {
        try {
          mqttClient.publish('smriti/hackathon/PATIENT_DEMO_001/location', JSON.stringify(locDataOff));
        } catch(e) {}
      }
    }
  }

  // ---------- TOAST NOTIFICATIONS ----------
  function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
  }

  // ---------- INITIALIZATION ON LOAD ----------
  document.addEventListener('DOMContentLoaded', () => {
    updateDashboardGreeting();
    renderDynamicHome();
    renderGalleries();
    renderDocuments();
    renderPatientMeds();
    renderPatientVisits();
    renderStats();
  });
</script>
</body>
</html>`;

fs.writeFileSync('index 3.html', fullHtml);
console.log('Successfully written clean repaired index 3.html! Length:', fullHtml.length);
