import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const DOWNLOADS_DIR = '/Users/ashwanikumar/Downloads/playstore_assets';
const PUBLIC_LOGO_PATH = path.join(process.cwd(), 'public', 'logo.png');

// Ensure directory structure
const dirs = [
  DOWNLOADS_DIR,
  path.join(DOWNLOADS_DIR, 'logo'),
  path.join(DOWNLOADS_DIR, 'feature_graphic'),
  path.join(DOWNLOADS_DIR, 'phone_screenshots'),
  path.join(DOWNLOADS_DIR, 'tablet_7inch_screenshots'),
  path.join(DOWNLOADS_DIR, 'tablet_10inch_screenshots')
];

dirs.forEach(d => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

// Load logo as base64 data URL
const logoBuffer = fs.readFileSync(PUBLIC_LOGO_PATH);
const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

// Base Styles shared across screens
const commonHead = `
  <meta charset="utf-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body {
      background: #080C14;
      color: #FFFFFF;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
    }
    .bg-mesh-1 {
      position: absolute; top: -20%; left: -10%; width: 70%; height: 70%;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 80%);
      filter: blur(80px); z-index: 1;
    }
    .bg-mesh-2 {
      position: absolute; bottom: -20%; right: -10%; width: 70%; height: 70%;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(59, 130, 246, 0.15) 50%, transparent 80%);
      filter: blur(80px); z-index: 1;
    }
    .top-brand {
      z-index: 10; display: flex; align-items: center; gap: 14px; margin-bottom: 12px;
    }
    .app-logo {
      width: 48px; height: 48px; border-radius: 12px; box-shadow: 0 10px 25px rgba(59,130,246,0.4);
    }
    .brand-name {
      font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;
    }
    .gradient-text {
      background: linear-gradient(135deg, #F472B6 0%, #C084FC 50%, #60A5FA 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
  </style>
`;

// -------------------------------------------------------------
// DESIGN 1: Hero Dashboard (Centered Device + 2 Floating Pills)
// -------------------------------------------------------------
function getTemplate01(w, h) {
  return `
    <!DOCTYPE html><html><head>${commonHead}
    <style>
      body { width: ${w}px; height: ${h}px; padding: 50px 40px; justify-content: space-between; align-items: center; }
      .header-box { text-align: center; z-index: 10; max-width: 90%; }
      .main-title { font-size: 52px; font-weight: 900; margin-bottom: 12px; line-height: 1.1; }
      .sub-title { font-size: 21px; color: #94A3B8; font-weight: 500; }
      .device-area { z-index: 10; position: relative; width: 440px; height: 820px; }
      .phone-frame {
        width: 100%; height: 100%; background: #0F172A; border-radius: 46px; border: 4px solid #334155;
        box-shadow: 0 30px 80px rgba(0,0,0,0.95), 0 0 60px rgba(59,130,246,0.3); padding: 16px; display: flex; flex-direction: column; gap: 14px;
      }
      .float-badge-left {
        position: absolute; top: 25%; left: -60px; z-index: 20; background: rgba(30,41,59,0.9); backdrop-filter: blur(20px);
        border: 1.5px solid rgba(255,255,255,0.2); padding: 14px 20px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 14px; color: #10B981;
      }
      .float-badge-right {
        position: absolute; bottom: 25%; right: -60px; z-index: 20; background: rgba(30,41,59,0.9); backdrop-filter: blur(20px);
        border: 1.5px solid rgba(255,255,255,0.2); padding: 14px 20px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 14px; color: #38BDF8;
      }
    </style></head>
    <body>
      <div class="bg-mesh-1"></div><div class="bg-mesh-2"></div>
      <div class="top-brand"><img src="${logoBase64}" class="app-logo"/><div class="brand-name">AI NEET COACH</div></div>

      <div class="header-box">
        <div class="main-title">India's #1 <span class="gradient-text">AI NEET Mentor</span></div>
        <div class="sub-title">Personalized daily targets, readiness index & score tracking.</div>
      </div>

      <div class="device-area">
        <div class="float-badge-left"><span>🧠</span> AI Readiness Score: 685 / 720</div>
        <div class="float-badge-right"><span>🔥</span> 42-Day Active Streak</div>
        <div class="phone-frame">
          <div style="background: rgba(15,23,42,0.95); padding: 18px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="font-size: 17px; font-weight: 800;">Welcome, Dr. Rahul</div>
            <div style="font-size: 12px; color: #38BDF8; margin-top: 2px;">Target: NEET 2027 • AIIMS New Delhi</div>
          </div>
          <div style="background: linear-gradient(135deg, rgba(30,58,138,0.6), rgba(6,78,59,0.6)); padding: 22px; border-radius: 18px; border: 1.5px solid rgba(59,130,246,0.4);">
            <div style="font-size: 12px; color: #94A3B8; font-weight: 800;">AI READINESS INDEX</div>
            <div style="font-size: 44px; font-weight: 900; color: #10B981; margin: 4px 0;">685 <span style="font-size: 18px; color: #64748B;">/ 720</span></div>
            <div style="font-size: 12px; color: #38BDF8; font-weight: 700;">Top 0.5% percentile rank</div>
          </div>
          <div style="background: #1E293B; padding: 16px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center;">
            <div><div style="font-weight: 700; font-size: 14px;">Genetics & Inheritance</div><div style="font-size: 11px; color: #94A3B8;">Biology • 25 PYQs</div></div>
            <span style="background: rgba(16,185,129,0.2); color: #34D399; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800;">Completed ✓</span>
          </div>
        </div>
      </div>
    </body></html>
  `;
}

// -------------------------------------------------------------
// DESIGN 2: Custom Test Creator (Split Billboard Card + Off-Axis Device)
// -------------------------------------------------------------
function getTemplate02(w, h) {
  return `
    <!DOCTYPE html><html><head>${commonHead}
    <style>
      body { width: ${w}px; height: ${h}px; padding: 50px 40px; justify-content: space-between; align-items: center; }
      .header-box { text-align: center; z-index: 10; max-width: 92%; }
      .main-title { font-size: 52px; font-weight: 900; margin-bottom: 12px; line-height: 1.1; }
      .sub-title { font-size: 21px; color: #94A3B8; font-weight: 500; }
      
      .content-grid { z-index: 10; display: flex; gap: 30px; width: 100%; max-width: 980px; align-items: center; }
      .left-billboard-card {
        flex: 1.2; background: rgba(30, 41, 59, 0.85); backdrop-filter: blur(24px); border: 2px solid rgba(59,130,246,0.4);
        padding: 30px; border-radius: 28px; box-shadow: 0 30px 70px rgba(0,0,0,0.8); display: flex; flex-direction: column; gap: 16px;
      }
      .right-phone-preview {
        flex: 0.9; height: 740px; background: #0F172A; border-radius: 40px; border: 4px solid #334155;
        box-shadow: 0 30px 80px rgba(0,0,0,0.9); padding: 18px; transform: rotate(3deg); display: flex; flex-direction: column; gap: 14px;
      }
      .chip-btn { background: #3B82F6; color: #FFF; padding: 10px 16px; border-radius: 12px; font-weight: 800; font-size: 13px; display: inline-block; }
    </style></head>
    <body>
      <div class="bg-mesh-1"></div><div class="bg-mesh-2"></div>
      <div class="top-brand"><img src="${logoBase64}" class="app-logo"/><div class="brand-name">AI NEET COACH</div></div>

      <div class="header-box">
        <div class="main-title">Practice Smarter. <span class="gradient-text">Build Custom Tests.</span></div>
        <div class="sub-title">Pick exact subjects, chapters, difficulty levels & question counts.</div>
      </div>

      <div class="content-grid">
        <div class="left-billboard-card">
          <div style="font-size: 14px; font-weight: 900; color: #60A5FA; letter-spacing: 1px;">⚙️ CUSTOM TEST CONFIGURATOR</div>
          <div style="font-size: 24px; font-weight: 900; color: #FFF;">Target Any Chapter On Your Schedule</div>
          
          <div style="display: flex; gap: 10px;">
            <span class="chip-btn" style="background:#3B82F6;">✓ Physics</span>
            <span class="chip-btn" style="background:#8B5CF6;">✓ Chemistry</span>
            <span class="chip-btn" style="background:#10B981; color:#000;">✓ Biology</span>
          </div>

          <div style="background: #0F172A; padding: 18px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 10px;">
            <div style="font-size: 13px; font-weight: 800; color: #34D399;">☑ Genetics & Principles of Inheritance</div>
            <div style="font-size: 13px; font-weight: 800; color: #60A5FA;">☑ Rotational Motion & Torque</div>
            <div style="font-size: 13px; font-weight: 800; color: #C084FC;">☑ Organic Reaction Mechanisms</div>
          </div>

          <div style="background: linear-gradient(135deg, #10B981, #059669); color: #000; font-weight: 900; font-size: 16px; padding: 16px; border-radius: 16px; text-align: center;">
            🚀 GENERATE CUSTOM TEST NOW
          </div>
        </div>

        <div class="right-phone-preview">
          <div style="font-size: 16px; font-weight: 900; color: #60A5FA;">⚙️ Custom Test Mode</div>
          <div style="background: #1E293B; padding: 14px; border-radius: 14px; font-size: 12px; color: #CBD5E1;">
            Question Count: <b>45 Questions</b><br/>Difficulty: <b>High-Yield Hard</b>
          </div>
          <div style="background: rgba(16,185,129,0.15); border: 1px solid #10B981; padding: 14px; border-radius: 14px; color: #34D399; font-size: 12px; font-weight: 800;">
            ✓ Test Generated (45 Qs)
          </div>
        </div>
      </div>
    </body></html>
  `;
}

// -------------------------------------------------------------
// DESIGN 3: 24/7 AI Doubt Solver (Giant Conversational Chat Canvas)
// -------------------------------------------------------------
function getTemplate03(w, h) {
  return `
    <!DOCTYPE html><html><head>${commonHead}
    <style>
      body { width: ${w}px; height: ${h}px; padding: 50px 40px; justify-content: space-between; align-items: center; }
      .header-box { text-align: center; z-index: 10; max-width: 90%; }
      .main-title { font-size: 52px; font-weight: 900; margin-bottom: 12px; line-height: 1.1; }
      .sub-title { font-size: 21px; color: #94A3B8; font-weight: 500; }
      
      .chat-stage { z-index: 10; width: 100%; max-width: 820px; display: flex; flex-direction: column; gap: 20px; }
      .question-bubble {
        align-self: flex-end; background: rgba(59, 130, 246, 0.25); border: 1.5px solid rgba(59, 130, 246, 0.5);
        padding: 24px; border-radius: 24px 24px 4px 24px; max-width: 80%; box-shadow: 0 15px 35px rgba(0,0,0,0.5);
      }
      .answer-card {
        align-self: flex-start; background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(20px); border: 2px solid #10B981;
        padding: 28px; border-radius: 24px 24px 24px 4px; width: 95%; box-shadow: 0 25px 60px rgba(0,0,0,0.7);
      }
    </style></head>
    <body>
      <div class="bg-mesh-1"></div><div class="bg-mesh-2"></div>
      <div class="top-brand"><img src="${logoBase64}" class="app-logo"/><div class="brand-name">AI NEET COACH</div></div>

      <div class="header-box">
        <div class="main-title">Snap Any Question. <span class="gradient-text">Get Instant AI Solution.</span></div>
        <div class="sub-title">24/7 instant AI explanations with exact NCERT page references.</div>
      </div>

      <div class="chat-stage">
        <div class="question-bubble">
          <div style="font-size: 12px; color: #60A5FA; font-weight: 900; margin-bottom: 6px;">STUDENT SCAN (CAMERA SCANNER)</div>
          <div style="font-size: 18px; font-weight: 700; color: #FFF; line-height: 1.4;">
            What is the net ATP yield during complete aerobic oxidation of 1 glucose molecule according to NCERT Class 11 Biology?
          </div>
        </div>

        <div class="answer-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${logoBase64}" style="width: 36px; height: 36px; border-radius: 8px;" />
              <span style="font-weight: 900; font-size: 16px; color: #10B981;">24/7 AI MEDICAL TUTOR</span>
            </div>
            <span style="background: rgba(16,185,129,0.2); color: #34D399; padding: 6px 14px; border-radius: 10px; font-size: 12px; font-weight: 800;">NCERT Ch.14 p.234</span>
          </div>

          <div style="font-size: 16px; line-height: 1.6; color: #E2E8F0; margin-bottom: 16px;">
            According to official NCERT Biology (Chapter 14: Respiration in Plants):<br/>
            • <b>Glycolysis:</b> 2 ATP (direct) + 2 NADH (6 ATP via ETS) = <b>8 ATP</b><br/>
            • <b>Link Reaction:</b> 2 NADH = <b>6 ATP</b><br/>
            • <b>Krebs Cycle:</b> 2 GTP (2 ATP) + 6 NADH (18 ATP) + 2 FADH₂ (4 ATP) = <b>24 ATP</b>
          </div>

          <div style="background: rgba(16,185,129,0.2); padding: 16px; border-radius: 16px; border: 1px solid #10B981; color: #34D399; font-weight: 900; font-size: 18px; text-align: center;">
            Total Net Yield = 38 ATP (or 36 ATP depending on shuttle)
          </div>
        </div>
      </div>
    </body></html>
  `;
}

// -------------------------------------------------------------
// DESIGN 4: 36+ Years Solved PYQs (3D Stacked Card Fan)
// -------------------------------------------------------------
function getTemplate04(w, h) {
  return `
    <!DOCTYPE html><html><head>${commonHead}
    <style>
      body { width: ${w}px; height: ${h}px; padding: 50px 40px; justify-content: space-between; align-items: center; }
      .header-box { text-align: center; z-index: 10; max-width: 90%; }
      .main-title { font-size: 52px; font-weight: 900; margin-bottom: 12px; line-height: 1.1; }
      .sub-title { font-size: 21px; color: #94A3B8; font-weight: 500; }

      .stack-stage { z-index: 10; width: 100%; max-width: 780px; display: flex; flex-direction: column; gap: -20px; align-items: center; }
      .pyq-card-1 {
        background: rgba(30,41,59,0.95); border: 2px solid #10B981; padding: 24px; border-radius: 24px; width: 100%;
        box-shadow: 0 25px 60px rgba(0,0,0,0.8); z-index: 3; transform: translateY(0px);
      }
      .pyq-card-2 {
        background: rgba(30,41,59,0.8); border: 1px solid rgba(255,255,255,0.15); padding: 24px; border-radius: 24px; width: 92%;
        box-shadow: 0 20px 40px rgba(0,0,0,0.6); z-index: 2; transform: translateY(-30px); opacity: 0.85;
      }
      .pyq-card-3 {
        background: rgba(30,41,59,0.6); border: 1px solid rgba(255,255,255,0.1); padding: 24px; border-radius: 24px; width: 84%;
        box-shadow: 0 15px 30px rgba(0,0,0,0.4); z-index: 1; transform: translateY(-60px); opacity: 0.7;
      }
    </style></head>
    <body>
      <div class="bg-mesh-1"></div><div class="bg-mesh-2"></div>
      <div class="top-brand"><img src="${logoBase64}" class="app-logo"/><div class="brand-name">AI NEET COACH</div></div>

      <div class="header-box">
        <div class="main-title">Master 36+ Years <span class="gradient-text">NCERT PYQs.</span></div>
        <div class="sub-title">Line-by-line textbook references and high-yield concept tags.</div>
      </div>

      <div class="stack-stage">
        <div class="pyq-card-1">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="background: rgba(139,92,246,0.25); color: #C084FC; padding: 6px 14px; border-radius: 10px; font-weight: 900; font-size: 13px;">NEET 2024 REAL PYQ</span>
            <span style="color: #94A3B8; font-size: 13px; font-weight: 700;">Biology • Chapter 11</span>
          </div>
          <div style="font-size: 18px; font-weight: 800; color: #FFF; margin-bottom: 14px;">Which of the following is INCORRECT regarding the Calvin cycle in photosynthesis?</div>
          <div style="background: rgba(16,185,129,0.25); border: 1.5px solid #10B981; padding: 14px; border-radius: 12px; color: #34D399; font-weight: 800; font-size: 14px;">
            B. Primary CO2 acceptor is a 3-carbon keto sugar (Incorrect - It is RuBP) ✓
          </div>
        </div>

        <div class="pyq-card-2">
          <div style="font-size: 14px; font-weight: 800; color: #60A5FA;">Physics PYQ 2023 • Electrostatics & Capacitance</div>
        </div>

        <div class="pyq-card-3">
          <div style="font-size: 14px; font-weight: 800; color: #C084FC;">Chemistry PYQ 2022 • Organic Reaction Mechanisms</div>
        </div>
      </div>
    </body></html>
  `;
}

// -------------------------------------------------------------
// DESIGN 5: Real NTA Exam Simulator & Digital OMR (Full-Width Scanner)
// -------------------------------------------------------------
function getTemplate05(w, h) {
  return `
    <!DOCTYPE html><html><head>${commonHead}
    <style>
      body { width: ${w}px; height: ${h}px; padding: 50px 40px; justify-content: space-between; align-items: center; }
      .header-box { text-align: center; z-index: 10; max-width: 90%; }
      .main-title { font-size: 52px; font-weight: 900; margin-bottom: 12px; line-height: 1.1; }
      .sub-title { font-size: 21px; color: #94A3B8; font-weight: 500; }

      .omr-container {
        z-index: 10; width: 100%; max-width: 840px; background: rgba(15, 23, 42, 0.95); border: 2px dashed #38BDF8;
        border-radius: 28px; padding: 30px; box-shadow: 0 30px 70px rgba(0,0,0,0.85); position: relative; overflow: hidden;
      }
      .scan-line {
        position: absolute; top: 40%; left: 0; width: 100%; height: 4px; background: #38BDF8;
        box-shadow: 0 0 20px #38BDF8, 0 0 40px #38BDF8;
      }
    </style></head>
    <body>
      <div class="bg-mesh-1"></div><div class="bg-mesh-2"></div>
      <div class="top-brand"><img src="${logoBase64}" class="app-logo"/><div class="brand-name">AI NEET COACH</div></div>

      <div class="header-box">
        <div class="main-title">Real Exam Simulator. <span class="gradient-text">Scan OMR Instantly.</span></div>
        <div class="sub-title">Full-length NTA pattern tests with instant camera OMR grading.</div>
      </div>

      <div class="omr-container">
        <div class="scan-line"></div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <div style="font-weight: 900; font-size: 20px; color: #FFF;">NTA Full Syllabus Mock Test 09</div>
            <div style="font-size: 13px; color: #94A3B8;">Time Remaining: 02h 45m 12s</div>
          </div>
          <span style="background: rgba(239,68,68,0.2); color: #EF4444; padding: 8px 16px; border-radius: 12px; font-weight: 900; font-size: 13px;">LIVE EXAM MODE</span>
        </div>

        <div style="background: #1E293B; padding: 20px; border-radius: 18px; display: flex; flex-direction: column; gap: 14px;">
          <div style="font-size: 12px; color: #38BDF8; font-weight: 900; letter-spacing: 1px;">CAMERA OMR GRADING ACTIVE</div>
          <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 800;">
            <span>Q1. (Physics)</span>
            <div style="display: flex; gap: 10px;">
              <span style="width: 28px; height: 28px; border-radius: 50%; background: #334155; display: inline-flex; align-items: center; justify-content: center;">A</span>
              <span style="width: 28px; height: 28px; border-radius: 50%; background: #10B981; color: #000; font-weight: 900; display: inline-flex; align-items: center; justify-content: center;">B</span>
              <span style="width: 28px; height: 28px; border-radius: 50%; background: #334155; display: inline-flex; align-items: center; justify-content: center;">C</span>
            </div>
          </div>
        </div>
      </div>
    </body></html>
  `;
}

// -------------------------------------------------------------
// DESIGN 6: Live 1v1 Peer Battleground (Multiplayer Arena VS Split)
// -------------------------------------------------------------
function getTemplate06(w, h) {
  return `
    <!DOCTYPE html><html><head>${commonHead}
    <style>
      body { width: ${w}px; height: ${h}px; padding: 50px 40px; justify-content: space-between; align-items: center; }
      .header-box { text-align: center; z-index: 10; max-width: 90%; }
      .main-title { font-size: 52px; font-weight: 900; margin-bottom: 12px; line-height: 1.1; }
      .sub-title { font-size: 21px; color: #94A3B8; font-weight: 500; }

      .arena-box {
        z-index: 10; width: 100%; max-width: 820px; background: rgba(15, 23, 42, 0.95); border: 2px solid rgba(245,158,11,0.5);
        border-radius: 28px; padding: 32px; box-shadow: 0 30px 80px rgba(0,0,0,0.9); text-align: center;
      }
      .vs-row { display: flex; justify-content: space-around; align-items: center; margin: 20px 0; background: rgba(30,41,59,0.8); padding: 24px; border-radius: 20px; }
    </style></head>
    <body>
      <div class="bg-mesh-1"></div><div class="bg-mesh-2"></div>
      <div class="top-brand"><img src="${logoBase64}" class="app-logo"/><div class="brand-name">AI NEET COACH</div></div>

      <div class="header-box">
        <div class="main-title">Live 1v1 <span class="gradient-text">Peer Battleground.</span></div>
        <div class="sub-title">Challenge top NEET aspirants across India in real-time speed quizzes.</div>
      </div>

      <div class="arena-box">
        <span style="background: linear-gradient(90deg, #F59E0B, #EF4444); color: #fff; padding: 8px 20px; border-radius: 14px; font-weight: 900; font-size: 13px;">1v1 LIVE QUIZ BATTLE</span>
        <div class="vs-row">
          <div><div style="font-size: 24px; font-weight: 900; color: #10B981;">YOU (Dr. Rahul)</div><div style="font-size: 14px; color: #94A3B8;">Streak: 5 • 850 pts</div></div>
          <div style="font-size: 36px; font-weight: 900; color: #EF4444;">VS</div>
          <div><div style="font-size: 24px; font-weight: 900; color: #60A5FA;">Priya (AIR 42)</div><div style="font-size: 14px; color: #94A3B8;">Streak: 3 • 790 pts</div></div>
        </div>
        <div style="background: rgba(16,185,129,0.2); border: 1.5px solid #10B981; padding: 16px; border-radius: 16px; color: #34D399; font-weight: 900; font-size: 16px;">
          ⚡ Speed Bonus: You answered in 2.1s (+100 pts)
        </div>
      </div>
    </body></html>
  `;
}

// -------------------------------------------------------------
// DESIGN 7: Deep Analytics & Accuracy Heatmaps (Hero Dial Gauge)
// -------------------------------------------------------------
function getTemplate07(w, h) {
  return `
    <!DOCTYPE html><html><head>${commonHead}
    <style>
      body { width: ${w}px; height: ${h}px; padding: 50px 40px; justify-content: space-between; align-items: center; }
      .header-box { text-align: center; z-index: 10; max-width: 90%; }
      .main-title { font-size: 52px; font-weight: 900; margin-bottom: 12px; line-height: 1.1; }
      .sub-title { font-size: 21px; color: #94A3B8; font-weight: 500; }

      .analytics-board {
        z-index: 10; width: 100%; max-width: 820px; background: rgba(15, 23, 42, 0.95); border: 2px solid rgba(59,130,246,0.4);
        border-radius: 28px; padding: 32px; box-shadow: 0 30px 80px rgba(0,0,0,0.85); display: flex; flex-direction: column; gap: 20px;
      }
      .bar-fill { height: 12px; border-radius: 6px; }
    </style></head>
    <body>
      <div class="bg-mesh-1"></div><div class="bg-mesh-2"></div>
      <div class="top-brand"><img src="${logoBase64}" class="app-logo"/><div class="brand-name">AI NEET COACH</div></div>

      <div class="header-box">
        <div class="main-title">Know Your Weakness <span class="gradient-text">Before Test Day.</span></div>
        <div class="sub-title">Subject-wise accuracy heatmaps, time management & AIR predictor.</div>
      </div>

      <div class="analytics-board">
        <div style="font-weight: 900; font-size: 20px; color: #FFF;">SUBJECT-WISE ACCURACY BREAKDOWN</div>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 15px; margin-bottom: 6px; font-weight: 700;">
              <span>🧬 Biology (Zoology & Botany)</span><b style="color: #10B981; font-size: 18px;">96.2%</b>
            </div>
            <div style="width: 100%; background: #334155; border-radius: 6px;"><div class="bar-fill" style="width: 96.2%; background: #10B981;"></div></div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 15px; margin-bottom: 6px; font-weight: 700;">
              <span>⚡ Physics (Mechanics & Electrodynamics)</span><b style="color: #3B82F6; font-size: 18px;">88.4%</b>
            </div>
            <div style="width: 100%; background: #334155; border-radius: 6px;"><div class="bar-fill" style="width: 88.4%; background: #3B82F6;"></div></div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 15px; margin-bottom: 6px; font-weight: 700;">
              <span>🧪 Chemistry (Organic & Inorganic)</span><b style="color: #8B5CF6; font-size: 18px;">92.0%</b>
            </div>
            <div style="width: 100%; background: #334155; border-radius: 6px;"><div class="bar-fill" style="width: 92%; background: #8B5CF6;"></div></div>
          </div>
        </div>
      </div>
    </body></html>
  `;
}

// -------------------------------------------------------------
// DESIGN 8: Parent & Mentor Connect (Verified Certificate Card)
// -------------------------------------------------------------
function getTemplate08(w, h) {
  return `
    <!DOCTYPE html><html><head>${commonHead}
    <style>
      body { width: ${w}px; height: ${h}px; padding: 50px 40px; justify-content: space-between; align-items: center; }
      .header-box { text-align: center; z-index: 10; max-width: 90%; }
      .main-title { font-size: 52px; font-weight: 900; margin-bottom: 12px; line-height: 1.1; }
      .sub-title { font-size: 21px; color: #94A3B8; font-weight: 500; }

      .cert-card {
        z-index: 10; width: 100%; max-width: 820px; background: linear-gradient(135deg, #1E293B, #0F172A);
        border: 2px solid #10B981; border-radius: 28px; padding: 36px; box-shadow: 0 30px 80px rgba(0,0,0,0.9);
        display: flex; flex-direction: column; gap: 18px; text-align: center;
      }
    </style></head>
    <body>
      <div class="bg-mesh-1"></div><div class="bg-mesh-2"></div>
      <div class="top-brand"><img src="${logoBase64}" class="app-logo"/><div class="brand-name">AI NEET COACH</div></div>

      <div class="header-box">
        <div class="main-title">Track Weekly Growth. <span class="gradient-text">Parent Reports.</span></div>
        <div class="sub-title">Automated performance audits sent directly to parents & mentors.</div>
      </div>

      <div class="cert-card">
        <div style="font-size: 48px;">🏆</div>
        <div style="font-size: 24px; font-weight: 900; color: #FFF;">VERIFIED ACADEMIC PROGRESS REPORT</div>
        <div style="font-size: 16px; color: #CBD5E1; line-height: 1.6;">
          "Dr. Rahul completed 350 PYQs this week with 94% accuracy. Verified by AI NEET COACH Academic Governance."
        </div>
        <div style="background: rgba(16,185,129,0.2); color: #34D399; padding: 12px; border-radius: 14px; font-weight: 900; font-size: 14px;">
          ✓ SENT TO PARENTS & MENTORS
        </div>
      </div>
    </body></html>
  `;
}

async function buildAllAssets() {
  console.log('🚀 Generating 8 UNIQUE Screenshot Designs (Each with custom layout)...');
  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await context.newPage();

  // 1. App Icon Master (512x512)
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`<html><body style="margin:0;background:#080C14;display:flex;align-items:center;justify-content:center;height:100vh;"><img src="${logoBase64}" style="width:512px;height:512px;"/></body></html>`);
  await page.screenshot({ path: path.join(DOWNLOADS_DIR, 'logo', 'ic_launcher_512.png'), type: 'png' });

  // 2. Feature Graphic (1024x500)
  await page.setViewportSize({ width: 1024, height: 500 });
  await page.setContent(`
    <!DOCTYPE html><html><head>${commonHead}
    <style>body{width:1024px;height:500px;padding:40px 60px;justify-content:space-between;align-items:center;flex-direction:row;}</style></head>
    <body>
      <div class="bg-mesh-1"></div>
      <div style="z-index:10;max-width:560px;">
        <div class="top-brand"><img src="${logoBase64}" class="app-logo"/><div class="brand-name">AI NEET COACH</div></div>
        <div style="font-size:46px;font-weight:900;margin-bottom:10px;">Your Personal <span class="gradient-text">AI NEET Coach</span></div>
        <div style="font-size:20px;color:#94A3B8;">Custom test creator, 24/7 AI tutor, 36+ Yrs NCERT PYQs & 1v1 battleground.</div>
      </div>
      <div style="z-index:10;background:rgba(30,41,59,0.8);padding:30px;border-radius:24px;border:1.5px solid rgba(255,255,255,0.2);text-align:center;">
        <div style="font-size:48px;">🩺</div>
        <div style="font-size:20px;font-weight:900;color:#FFF;margin-top:6px;">AI NEET COACH</div>
      </div>
    </body></html>
  `);
  await page.screenshot({ path: path.join(DOWNLOADS_DIR, 'feature_graphic', 'feature_graphic.png'), type: 'png' });

  // Array of 8 UNIQUE render functions
  const renderers = [
    { id: '01_home_dashboard', render: getTemplate01 },
    { id: '02_custom_test_creator', render: getTemplate02 },
    { id: '03_ai_doubt_solver', render: getTemplate03 },
    { id: '04_ncert_pyqs', render: getTemplate04 },
    { id: '05_adaptive_tests', render: getTemplate05 },
    { id: '06_peer_battleground', render: getTemplate06 },
    { id: '07_analytics_insights', render: getTemplate07 },
    { id: '08_parent_connect', render: getTemplate08 }
  ];

  // 3. Mobile Screenshots (1080x1920)
  console.log('📸 Rendering 8 UNIQUE Mobile Screenshots...');
  await page.setViewportSize({ width: 1080, height: 1920 });
  for (const item of renderers) {
    console.log(`   - Screen: ${item.id}`);
    await page.setContent(item.render(1080, 1920));
    await page.screenshot({ path: path.join(DOWNLOADS_DIR, 'phone_screenshots', `${item.id}.png`), type: 'png' });
  }

  // 4. 7-inch Tablet Screenshots (1200x1920)
  console.log('📸 Rendering 8 UNIQUE 7-inch Tablet Screenshots...');
  await page.setViewportSize({ width: 1200, height: 1920 });
  for (const item of renderers) {
    await page.setContent(item.render(1200, 1920));
    await page.screenshot({ path: path.join(DOWNLOADS_DIR, 'tablet_7inch_screenshots', `${item.id}.png`), type: 'png' });
  }

  // 5. 10-inch Tablet Screenshots (1600x2560)
  console.log('📸 Rendering 8 UNIQUE 10-inch Tablet Screenshots...');
  await page.setViewportSize({ width: 1600, height: 2560 });
  for (const item of renderers) {
    await page.setContent(item.render(1600, 2560));
    await page.screenshot({ path: path.join(DOWNLOADS_DIR, 'tablet_10inch_screenshots', `${item.id}.png`), type: 'png' });
  }

  await browser.close();
  console.log('🎉 ALL 8 UNIQUE SCREENSHOT DESIGNS GENERATED SUCCESSFULLY!');
  console.log(`📁 Saved to: ${DOWNLOADS_DIR}`);
}

buildAllAssets().catch(err => {
  console.error('❌ Error generating unique assets:', err);
  process.exit(1);
});
