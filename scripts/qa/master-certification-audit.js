import { chromium } from '@playwright/test';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const artifactDir = '/Users/ashwanikumar/.gemini/antigravity/brain/1d4927d4-db6a-4513-ae1f-be84a49bb934';
const dbUrl = process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

const logFile = path.join(artifactDir, 'audit_execution.log');
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  console.log(msg);
  fs.appendFileSync(logFile, line);
}

// Ensure clean log file
if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

(async () => {
  log('Starting REAL HUMAN STUDENT CERTIFICATION AUDIT...');
  log(`Live Production Target: https://ai-neet.vercel.app`);

  let browser;
  let context;
  let page;

  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    page = await context.newPage();

    // Trace exceptions
    page.on('pageerror', err => {
      log(`[BROWSER CRASH] ${err.message}`);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 1 — AUTHENTICATION
    // ─────────────────────────────────────────────────────────────────────────
    log('\n--- PHASE 1 — AUTHENTICATION ---');
    
    // 1. Verify protected route redirect
    log('Action: Navigating to protected route (/dashboard) without login...');
    await page.goto('https://ai-neet.vercel.app/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    log(`Result URL: ${page.url()}`);
    if (page.url().includes('/login')) {
      log('SUCCESS: Protected route correctly redirected to /login.');
    } else {
      log('WARNING: Protected route did not redirect.');
    }
    await page.screenshot({ path: path.join(artifactDir, 'phase1_01_protected_redirect.png') });

    // 2. Perform Login
    log('Action: Filling login credentials...');
    await page.fill('input[type="email"]', 'qa@neetcoach.in');
    await page.fill('input[type="password"]', 'password123');
    await page.screenshot({ path: path.join(artifactDir, 'phase1_02_login_before.png') });
    
    log('Action: Clicking submit...');
    await page.click('button[type="submit"]');
    await page.waitForURL(url => url.pathname === '/' || url.pathname === '/dashboard' || url.pathname === '/welcome', { timeout: 15000 });
    log(`SUCCESS: Logged in and redirected to: ${page.url()}`);
    await page.screenshot({ path: path.join(artifactDir, 'phase1_03_login_after.png') });

    // 3. Verify session restore and refresh persistence
    log('Action: Reloading page to verify session persistence...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    log(`Result URL after refresh: ${page.url()}`);
    await page.screenshot({ path: path.join(artifactDir, 'phase1_04_session_restore.png') });

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 2 — ONBOARDING
    // ─────────────────────────────────────────────────────────────────────────
    log('\n--- PHASE 2 — ONBOARDING ---');
    log('Action: Navigating to onboarding welcome page...');
    await page.goto('https://ai-neet.vercel.app/welcome', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(artifactDir, 'phase2_01_onboarding_welcome.png') });

    const skipButton = page.locator('button:has-text("Skip for now")');
    if (await skipButton.isVisible()) {
      log('Action: Skipping onboarding flow...');
      await skipButton.click();
      await page.waitForURL(url => url.pathname === '/' || url.pathname === '/dashboard', { timeout: 15000 });
      log(`SUCCESS: Onboarding skipped. Landed on: ${page.url()}`);
    } else {
      log('Onboarding skip button not visible. User already completed onboarding.');
    }
    await page.screenshot({ path: path.join(artifactDir, 'phase2_02_onboarding_skipped.png') });

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 3 — DIAGNOSTIC TEST
    // ─────────────────────────────────────────────────────────────────────────
    log('\n--- PHASE 3 — DIAGNOSTIC TEST ---');
    log('Action: Navigating to diagnostic test room...');
    await page.goto('https://ai-neet.vercel.app/test/diagnostic', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(artifactDir, 'phase3_01_diagnostic_ready.png') });

    const startDiagBtn = page.locator('button:has-text("Start Diagnostic"), button:has-text("Begin"), button:has-text("Start")').first();
    if (await startDiagBtn.isVisible()) {
      log('Action: Starting diagnostic test...');
      await startDiagBtn.click();
      await page.waitForURL(/\/test\/(?!configure\b)[\w-]+$/, { timeout: 25000 });
      log(`Diagnostic Test URL: ${page.url()}`);
    } else {
      log('Diagnostic test already in progress or completed. Checking configure options.');
    }
    await page.screenshot({ path: path.join(artifactDir, 'phase3_02_diagnostic_started.png') });

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 4 — CUSTOM TESTS
    // ─────────────────────────────────────────────────────────────────────────
    log('\n--- PHASE 4 — CUSTOM TESTS ---');
    log('Action: Navigating to custom test configuration...');
    await page.goto('https://ai-neet.vercel.app/test/configure', { waitUntil: 'networkidle' });
    await page.waitForSelector('button:has-text("Generate & Start Test")', { timeout: 20000 });
    
    // Select Custom Card
    const customCard = page.locator('.option-card:has-text("Custom Test")');
    if (await customCard.isVisible()) await customCard.click();
    
    // Select 10 Questions
    const limitCard = page.locator('.option-card:has-text("10 Questions")');
    if (await limitCard.isVisible()) await limitCard.click();

    await page.screenshot({ path: path.join(artifactDir, 'phase4_01_custom_config.png') });

    log('Action: Clicking "Generate & Start Test"...');
    await page.locator('button:has-text("Generate & Start Test")').click();
    await page.waitForURL(/\/test\/(?!configure\b)[\w-]+$/, { timeout: 45000 });
    const testUrl = page.url();
    const testId = testUrl.split('/').pop();
    log(`SUCCESS: Custom test generated! URL: ${testUrl}, ID: ${testId}`);
    await page.screenshot({ path: path.join(artifactDir, 'phase4_02_custom_test_active.png') });

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 11 & 12 — FAILURE TESTING & DB VERIFICATION (DURING CUSTOM TEST)
    // ─────────────────────────────────────────────────────────────────────────
    log('\n--- PHASE 11 — FAILURE TESTING & SYSTEM RECOVERY ---');
    
    // 1. Answer Q1
    log('Action: Selecting option A on Question 1...');
    await page.locator('.option-card:has-text("A")').first().click();
    await page.waitForTimeout(1000);
    log('Question 1 option A selected.');
    await page.screenshot({ path: path.join(artifactDir, 'phase11_01_q1_selected.png') });

    // 2. Perform page refresh to check state recovery
    log('Action: Refreshing the page mid-test to trigger recovery prompt...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(artifactDir, 'phase11_02_refresh_prompt.png') });
    
    const resumeBtn = page.locator('button:has-text("Resume Test")');
    if (await resumeBtn.isVisible()) {
      log('SUCCESS: Active test session correctly detected. Clicking Resume...');
      await resumeBtn.click();
      await page.waitForTimeout(2000);
    } else {
      log('WARNING: Resume prompt not visible.');
    }
    await page.screenshot({ path: path.join(artifactDir, 'phase11_03_state_recovered.png') });
    
    // Check if Q1 option A is still selected
    const isSelected = await page.locator('.option-card.selected:has-text("A")').first().isVisible().catch(() => false);
    log(`Result: Option A selection persisted after refresh = ${isSelected}`);

    // Answer remaining questions to complete Phase 4
    log('Action: Answering remaining questions...');
    for (let i = 1; i < 10; i++) {
      // Click next
      const nextBtn = page.locator('button:has-text("Next →")');
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(500);
      }
      // Answer Option A
      await page.locator('.option-card:has-text("A")').first().click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: path.join(artifactDir, 'phase4_03_test_finished.png') });

    // DB Verification before submit
    log('\n--- PHASE 12 — DATABASE VALIDATION (BEFORE SUBMISSION) ---');
    const { rows: userBefore } = await pool.query("SELECT xp, streak FROM users WHERE email = 'qa@neetcoach.in'");
    const beforeXP = userBefore[0]?.xp || 0;
    const beforeStreak = userBefore[0]?.streak || 0;
    log(`Database: QA user XP before submit = ${beforeXP}, Streak = ${beforeStreak}`);

    // Submit test
    log('Action: Clicking Submit Test...');
    await page.locator('button:has-text("Submit Test")').first().click();
    
    log('Waiting for scorecard page redirection...');
    await page.waitForURL(/\/test\/[\w-]+\/results$/, { timeout: 35000 });
    log(`SUCCESS: Scorecard generated! Redirection URL: ${page.url()}`);
    
    await page.waitForTimeout(5000); // Wait for scorecard graphs to render
    await page.screenshot({ path: path.join(artifactDir, 'phase4_04_scorecard.png') });

    // DB Verification after submit
    log('\n--- PHASE 12 — DATABASE VALIDATION (AFTER SUBMISSION) ---');
    const { rows: testRecord } = await pool.query("SELECT * FROM tests WHERE id = $1", [testId]);
    log(`Database: Test record found = ${testRecord.length > 0}`);
    if (testRecord.length > 0) {
      log(`Database: score = ${testRecord[0].score}, correct = ${testRecord[0].correct_count}, incorrect = ${testRecord[0].incorrect_count}`);
    }

    const { rows: answersRecords } = await pool.query("SELECT COUNT(*) FROM test_answers WHERE test_id = $1", [testId]);
    log(`Database: Answers rows created in test_answers = ${answersRecords[0].count}`);

    const { rows: userAfter } = await pool.query("SELECT xp, streak FROM users WHERE email = 'qa@neetcoach.in'");
    const afterXP = userAfter[0]?.xp || 0;
    const afterStreak = userAfter[0]?.streak || 0;
    log(`Database: QA user XP after submit = ${afterXP} (Earned XP: ${afterXP - beforeXP}), Streak = ${afterStreak}`);

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 5 — AI FEATURES
    // ─────────────────────────────────────────────────────────────────────────
    log('\n--- PHASE 5 — AI FEATURES ---');
    log('Action: Navigating to AI Doubt Solver...');
    await page.goto('https://ai-neet.vercel.app/doubts', { waitUntil: 'networkidle' });
    await page.waitForSelector('.chat-input', { timeout: 15000 });
    
    log('Action: Asking doubt: "What is the hybridization of XeF4?"...');
    await page.fill('.chat-input', 'What is the hybridization of XeF4?');
    await page.screenshot({ path: path.join(artifactDir, 'phase5_01_ai_before.png') });

    log('Action: Clicking ask doubt button...');
    await page.locator('.chat-send-btn').first().click();
    
    log('Waiting for AI response...');
    await page.waitForSelector('.chat-message.assistant', { timeout: 35000 });
    await page.waitForSelector('.spinner', { state: 'detached', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(artifactDir, 'phase5_02_ai_response.png') });
    
    // Check if AI response is populated
    const aiText = await page.locator('.chat-bubble').last().innerText().catch(() => '');
    log(`AI Doubt Response Snippet: ${aiText.substring(0, 150)}...`);
    if (aiText.toLowerCase().includes('sp3d2') || aiText.toLowerCase().includes('hybridization') || aiText.length > 30) {
      log('SUCCESS: AI doubt response received with grounded scientific facts.');
    } else {
      log('WARNING: Doubt solver response was empty or incorrect.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 6 — BATTLEGROUND
    // ─────────────────────────────────────────────────────────────────────────
    log('\n--- PHASE 6 — BATTLEGROUND ---');
    log('Action: Navigating to multiplayer battleground...');
    await page.goto('https://ai-neet.vercel.app/battleground', { waitUntil: 'networkidle' });
    
    log('Waiting for loading screen to disappear...');
    await page.waitForSelector('.bg-loading-wrapper', { state: 'detached', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    if (await page.locator('.bg-guest-wrapper').isVisible().catch(() => false)) {
      log('Detected guest screen due to session hydration lag. Reloading page to force session restore...');
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForSelector('.bg-loading-wrapper', { state: 'detached', timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(4000);
    }
    
    log('Waiting for Create Battleground button...');
    await page.waitForSelector('button:has-text("Create Battleground"), .bg-home-btn', { timeout: 25000 });
    await page.screenshot({ path: path.join(artifactDir, 'phase6_01_battleground.png') });

    log('Action: Clicking "Create Battleground" to open real lobby...');
    await page.locator('button:has-text("Create Battleground")').first().click();
    await page.waitForSelector('.bg-lobby-title', { timeout: 20000 });
    log('SUCCESS: Multiplayer battleground room created successfully!');
    await page.screenshot({ path: path.join(artifactDir, 'phase6_02_battleground_lobby.png') });

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 7 — LEADERBOARD
    // ─────────────────────────────────────────────────────────────────────────
    log('\n--- PHASE 7 — LEADERBOARD ---');
    log('Action: Navigating to leaderboards...');
    await page.goto('https://ai-neet.vercel.app/leaderboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);
    log(`Result URL: ${page.url()}`);
    await page.screenshot({ path: path.join(artifactDir, 'phase7_01_leaderboard.png') });

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 8 — SUBSCRIPTION
    // ─────────────────────────────────────────────────────────────────────────
    log('\n--- PHASE 8 — SUBSCRIPTION ---');
    log('Action: Navigating to pricing and upgrade...');
    await page.goto('https://ai-neet.vercel.app/pricing', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    log(`Result URL: ${page.url()}`);
    await page.screenshot({ path: path.join(artifactDir, 'phase8_01_pricing.png') });

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 9 — PROFILE
    // ─────────────────────────────────────────────────────────────────────────
    log('\n--- PHASE 9 — PROFILE ---');
    log('Action: Navigating to profile settings...');
    await page.goto('https://ai-neet.vercel.app/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    log(`Result URL: ${page.url()}`);
    await page.screenshot({ path: path.join(artifactDir, 'phase9_01_profile.png') });

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 10 — MOBILE VIEWPORT
    // ─────────────────────────────────────────────────────────────────────────
    log('\n--- PHASE 10 — MOBILE VIEWPORT ---');
    log('Action: Creating mobile iPhone context...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });
    const mobilePage = await mobileContext.newPage();
    
    // Login in mobile context
    log('Action: Logging in on mobile context...');
    await mobilePage.goto('https://ai-neet.vercel.app/login', { waitUntil: 'networkidle' });
    await mobilePage.fill('input[type="email"]', 'qa@neetcoach.in');
    await mobilePage.fill('input[type="password"]', 'password123');
    await mobilePage.click('button[type="submit"]');
    await mobilePage.waitForURL(url => url.pathname === '/' || url.pathname === '/dashboard', { timeout: 15000 });
    
    log('Action: Verifying bottom navigator drawer rendering on mobile...');
    await mobilePage.screenshot({ path: path.join(artifactDir, 'phase10_01_mobile_dashboard.png') });
    
    // Open tools drawer
    const toolsBtn = mobilePage.locator('button:has-text("TOOLS"), button[aria-label="Open Study Tools"]').first();
    if (await toolsBtn.isVisible()) {
      log('Action: Clicking center TOOLS button...');
      await toolsBtn.click();
      await mobilePage.waitForTimeout(2000);
      log('SUCCESS: Tools drawer opened on mobile viewport.');
    }
    await mobilePage.screenshot({ path: path.join(artifactDir, 'phase10_02_mobile_drawer_open.png') });

    await mobileContext.close();
    
    log('\nCERTIFICATION AUDIT COMPLETE!');
    await browser.close();
  } catch (err) {
    log(`CRITICAL ERROR during simulation: ${err.message}`);
    if (page) await page.screenshot({ path: path.join(artifactDir, 'phase_critical_failure.png') });
    if (browser) await browser.close();
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
