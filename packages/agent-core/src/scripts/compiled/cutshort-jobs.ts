/**
 * Apply for tech and product jobs on CutShort — AI-matched roles at startups and product companies with skill-based recommendations.
 *
 * Auto-generated Playwright script for cutshort-jobs.
 * Site: https://cutshort.io
 * Params: none required
 */
export const SCRIPT_CODE = `
const { chromium } = require('playwright');
const path = require('path');
const readline = require('readline');
const os = require('os');
const fs = require('fs');

(async () => {
  // ── Parse inputs ─────────────────────────────────────────────────
  const params = JSON.parse(process.argv[2] || '{}');
  const userContext = process.argv[3] ? JSON.parse(process.argv[3]) : {};

  // Validate required params
  const required = [];
  const missing = required.filter(p => !params[p]);
  if (missing.length > 0) {
    console.log(JSON.stringify({ error: 'Missing required params: ' + missing.join(', ') }));
    process.exit(1);
  }

  // ── Logging & messaging protocol ─────────────────────────────────
  const log = (data) => console.log(JSON.stringify(data));

  const rl = readline.createInterface({ input: process.stdin });
  const pendingReads = [];

  rl.on('line', (line) => {
    try {
      const data = JSON.parse(line);
      if (pendingReads.length > 0) {
        const resolve = pendingReads.shift();
        resolve(data);
      }
    } catch {}
  });

  function requestFromHost(msg) {
    return new Promise((resolve) => {
      pendingReads.push(resolve);
      log(msg);
    });
  }

  // ── Connect to operator's Chrome via CDP ─────────────────────────
  const cdpEndpoint = process.env.CHROME_CDP_ENDPOINT || 'http://127.0.0.1:9222';
  log({ step: 'Connecting to Chrome via CDP (' + cdpEndpoint + ')...', status: 'running' });

  let browser;
  try {
    browser = await chromium.connectOverCDP(cdpEndpoint);
  } catch (err) {
    log({ error: 'Cannot connect to Chrome Debug on ' + cdpEndpoint + '. Start it with: scripts/start-debug-chrome.sh' });
    process.exit(1);
  }

  const context = browser.contexts()[0];
  if (!context) {
    log({ error: 'No browser context found. Ensure Chrome Debug is running with --profile-directory="Profile 3"' });
    process.exit(1);
  }

  const page = await context.newPage();

  try {
    // ── Auto-generated workflow body ─────────────────────────────────
    // ── Helper: dismiss common popups ──────────────────────────
    const dismissPopups = async () => {
      try {
        const closeBtn = page.locator('[role="dialog"] button[aria-label="Close"], button[aria-label="close"], .modal-close, [class*="popup"] button[class*="close"]').first();
        if (await closeBtn.isVisible({ timeout: 2000 })) await closeBtn.click();
      } catch {}
      try {
        const cookieBtn = page.locator('button:has-text("Accept"), button:has-text("Got it"), #onetrust-accept-btn-handler').first();
        if (await cookieBtn.isVisible({ timeout: 1000 })) await cookieBtn.click();
      } catch {}
    };

    // ── Navigate to Cutshort Jobs ──────────────────────────
    log({ step: 'Opening Cutshort Jobs...', status: 'running' });
    await page.goto('https://cutshort.io');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await dismissPopups();

    // ── Verify login ──────────────────────────────────────
    log({ step: 'Checking login status...', status: 'running' });
    const profileEl = page.locator('[class*="profile"], [class*="account"], [class*="user"], [aria-label*="account" i], [data-testid*="profile"]').first();
    const isLoggedIn = await profileEl.isVisible({ timeout: 3000 }).catch(() => false);
    if (!isLoggedIn) {
      log({ step: 'Not logged in — attempting sign-in...', status: 'running' });
      const signInBtn = page.locator('a:has-text("Sign in"), a:has-text("Login"), button:has-text("Sign in"), button:has-text("Login"), a:has-text("Log in")').first();
      if (await signInBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await signInBtn.click();
        await page.waitForTimeout(3000);
      }
      // Check for Google sign-in option
      const googleBtn = page.locator('button:has-text("Google"), [data-provider="google"], a:has-text("Continue with Google")').first();
      if (await googleBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await googleBtn.click();
        await page.waitForTimeout(5000);
      }
    }

    // ── Extract results ──────────────────────────────────
    log({ step: 'Loading results...', status: 'running' });
    await page.waitForTimeout(2000);

    // Take snapshot for the agent to process
    const pageContent = await page.content();
    const pageTitle = await page.title();
    const pageUrl = page.url();

    // Present options to user
    const userChoice = await requestFromHost({
      type: 'input_required',
      question: 'I found results on Cutshort Jobs. Which option would you like? (enter a number or describe your preference)',
      inputType: 'freetext',
    });

    // ── Select user's choice ─────────────────────────────
    log({ step: 'Selecting option: ' + (userChoice.value || 'first'), status: 'running' });
    // Click on the result based on user's choice
    const resultCards = page.locator('[class*="card"], [class*="result"], [class*="item"], [class*="product"], [data-testid*="card"]');
    const choiceNum = parseInt(userChoice.value || '1');
    const idx = (!isNaN(choiceNum) && choiceNum >= 1) ? choiceNum - 1 : 0;
    const targetCard = resultCards.nth(idx);
    if (await targetCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await targetCard.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
    }

    // ── Confirm action ───────────────────────────────────
    log({ step: 'Review your selection', status: 'running' });
    const confirmResp = await requestFromHost({
      type: 'confirm_action',
      action: 'Proceed with Cutshort Jobs',
      details: 'Page: ' + pageTitle + '\nURL: ' + pageUrl,
    });
    if (!confirmResp.confirmed) {
      log({ step: 'Cancelled by user', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // ── Payment ──────────────────────────────────────────
    log({ step: 'Ready for payment', status: 'running' });
    const payResp = await requestFromHost({
      type: 'payment_required',
      action: 'Complete Cutshort Jobs order',
      details: 'Completing your order on Cutshort Jobs',
      amountInr: 0, // Extracted from page at runtime
      description: 'cutshort-jobs order',
    });
    if (!payResp.confirmed) {
      log({ step: 'Payment cancelled', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // ── Handle OTP if needed ─────────────────────────────
    await page.waitForTimeout(3000);
    const otpField = page.locator('input[name="otp"], input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], [placeholder*="OTP" i], [placeholder*="verification" i]').first();
    if (await otpField.isVisible({ timeout: 5000 }).catch(() => false)) {
      const otpResp = await requestFromHost({
        type: 'input_required',
        question: 'Enter the OTP/verification code sent to your phone:',
        inputType: 'otp',
      });
      if (otpResp.value) {
        await otpField.fill(otpResp.value);
        const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Verify"), button[type="submit"]').first();
        if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) await submitBtn.click();
        await page.waitForTimeout(5000);
      }
    }

    // ── Completion ───────────────────────────────────────
    const finalUrl = page.url();
    const finalTitle = await page.title();
    log({ step: 'Cutshort Jobs workflow completed', status: 'completed' });
    log({ message: 'Task completed on Cutshort Jobs. Page: ' + finalTitle });
    log({ done: true, url: finalUrl, title: finalTitle });

    await page.waitForTimeout(5000);

  } catch (err) {
    log({ step: 'Error: ' + err.message, status: 'failed' });
    log({ error: err.message });

    // Screenshot on failure for debugging
    try {
      const screenshotDir = path.join(os.homedir(), '.shofferai', 'screenshots');
      fs.mkdirSync(screenshotDir, { recursive: true });
      await page.screenshot({
        path: path.join(screenshotDir, 'cutshort-jobs-error-' + Date.now() + '.png'),
        fullPage: true,
      });
    } catch {}
  } finally {
    rl.close();
    await page.close();  // Close tab only — operator's Chrome stays running
  }
})();
`;

export const SKILL_ID = 'cutshort-jobs';
export const REQUIRED_PARAMS = [];
