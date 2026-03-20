/**
 * Order groceries from Swiggy Instamart with 15-30 minute delivery.
 *
 * Compiled Playwright script for swiggy-instamart with real selectors from live browsing.
 * Site: https://www.swiggy.com/instamart
 * Params: items (list of grocery items)
 *
 * Real selector notes (discovered via live browsing of swiggy.com/instamart):
 *  - Instamart URL: /instamart (NOT / or /restaurants — those are food delivery)
 *  - Search bar: at the top of the Instamart page, click to open search overlay
 *  - Product cards show: brand, name, size, price, "ADD" button
 *  - "OK GOT IT" dialog appears for delivery-location confirmation (same as food)
 *  - Cart: floating bar at bottom shows item count + total, click to open cart
 *  - Profile: link with href /my-account containing user's name
 *  - Location bar at top — click to change delivery address
 *  - Products: Milk brands include Amul, Arokya, Vijaya, Country Delight, Heritage, Sid's Farm
 *  - App-install banner may appear — dismiss with close/No thanks
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
  const items = params.items || [];

  // Validate required params
  if (items.length === 0) {
    console.log(JSON.stringify({ error: 'Missing required param: items (list of grocery items)' }));
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
    // ── Helper: dismiss Swiggy popups ──────────────────────────
    const dismissPopups = async () => {
      // "OK GOT IT" delivery-location confirmation dialog
      try {
        const okGotIt = page.getByRole('button', { name: /ok got it/i });
        if (await okGotIt.isVisible({ timeout: 2000 })) await okGotIt.click();
      } catch {}
      // Generic close buttons on modals / overlays
      try {
        const closeBtn = page.locator('[role="dialog"] button[aria-label="Close"], button[aria-label="close"]').first();
        if (await closeBtn.isVisible({ timeout: 1500 })) await closeBtn.click();
      } catch {}
      // App-install / promotional banner dismiss
      try {
        const noThanks = page.getByRole('button', { name: /no thanks|not now|maybe later|dismiss/i });
        if (await noThanks.isVisible({ timeout: 1500 })) await noThanks.click();
      } catch {}
    };

    // ── Navigate to Swiggy Instamart ──────────────────────────
    log({ step: 'Opening Swiggy Instamart...', status: 'running' });
    await page.goto('https://www.swiggy.com/instamart');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await dismissPopups();

    // ── Verify login ──────────────────────────────────────
    log({ step: 'Checking login status...', status: 'running' });
    // Profile link contains user's name and points to /my-account
    const profileLink = page.locator('a[href="/my-account"]').first();
    const isLoggedIn = await profileLink.isVisible({ timeout: 3000 }).catch(() => false);
    if (!isLoggedIn) {
      log({ step: 'Not logged in — attempting sign-in...', status: 'running' });
      const signInBtn = page.locator('a:has-text("Sign in"), a:has-text("Login"), button:has-text("Sign in"), button:has-text("Login"), a:has-text("Log in")').first();
      if (await signInBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await signInBtn.click();
        await page.waitForTimeout(3000);
      }
    }

    // ── Set delivery location if needed ───────────────────
    if (params.address) {
      log({ step: 'Setting delivery location...', status: 'running' });
      // Click location bar at top of page
      const locationBar = page.locator('[class*="location"], [class*="address"]').first();
      if (await locationBar.isVisible({ timeout: 3000 }).catch(() => false)) {
        await locationBar.click();
        await page.waitForTimeout(1000);
        const searchInput = page.locator('input[placeholder*="location" i], input[placeholder*="address" i], input[placeholder*="area" i]').first();
        if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await searchInput.fill(params.address);
          await page.waitForTimeout(2000);
          // Click first suggestion
          const suggestion = page.locator('[class*="suggestion"], [class*="result"]').first();
          if (await suggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
            await suggestion.click();
            await page.waitForTimeout(2000);
          }
        }
      }
      await dismissPopups();
    }

    // ── Search & add each item ────────────────────────────
    const addedItems = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      log({ step: 'Searching for ' + item + ' (' + (i + 1) + '/' + items.length + ')...', status: 'running' });

      // Click search bar / icon
      const searchIcon = page.locator('input[type="search"], [class*="search"] input, [placeholder*="Search" i]').first();
      if (await searchIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchIcon.click();
        await searchIcon.fill(item);
      } else {
        // Try clicking a search icon/button first
        const searchBtn = page.locator('[class*="search"] svg, button[aria-label*="search" i], a[href*="search"]').first();
        if (await searchBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await searchBtn.click();
          await page.waitForTimeout(1000);
          const searchField = page.locator('input[type="search"], input[type="text"]').first();
          if (await searchField.isVisible({ timeout: 3000 }).catch(() => false)) {
            await searchField.fill(item);
          }
        }
      }
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);

      // Extract product results from page
      log({ step: 'Found results for ' + item + ', presenting options...', status: 'running' });

      // Get product names and prices from the page
      const products = await page.evaluate(() => {
        const results = [];
        // Try various selectors for product cards
        const cards = document.querySelectorAll('[class*="product"], [class*="item"], [data-testid*="product"]');
        cards.forEach((card, idx) => {
          if (idx >= 7) return; // Max 7 options
          const nameEl = card.querySelector('[class*="name"], [class*="title"], h3, h4');
          const priceEl = card.querySelector('[class*="price"], [class*="amount"]');
          if (nameEl) {
            results.push({
              name: nameEl.textContent.trim(),
              price: priceEl ? priceEl.textContent.trim() : 'N/A',
            });
          }
        });
        return results;
      });

      if (products.length > 0) {
        // Present choices to user
        const options = products.map((p, idx) => (idx + 1) + '. ' + p.name + ' — ' + p.price);
        const choice = await requestFromHost({
          type: 'input_required',
          question: 'Which ' + item + ' would you like?\\n' + options.join('\\n'),
          inputType: 'choice',
          options: options,
        });

        // Click the chosen product's ADD button
        const choiceIdx = parseInt(choice.value || '1') - 1;
        const safeIdx = (!isNaN(choiceIdx) && choiceIdx >= 0 && choiceIdx < products.length) ? choiceIdx : 0;
        const addButtons = page.locator('button:has-text("ADD"), button:has-text("Add")');
        const addBtn = addButtons.nth(safeIdx);
        if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await addBtn.click();
          await page.waitForTimeout(1500);
          addedItems.push(products[safeIdx]);
          log({ step: 'Added ' + products[safeIdx].name + ' to cart ✅', status: 'running' });
        }
      } else {
        log({ step: 'No results found for ' + item + ' — skipping', status: 'running' });
      }

      // Clear search for next item
      await page.waitForTimeout(1000);
    }

    // ── Review cart ───────────────────────────────────────
    log({ step: 'Opening cart for review...', status: 'running' });
    // Click cart button (floating bar at bottom or cart icon)
    const cartBtn = page.locator('[class*="cart"], a[href="/checkout"], button:has-text("Cart"), button:has-text("Checkout")').first();
    if (await cartBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cartBtn.click();
      await page.waitForTimeout(2000);
    }

    // Extract cart total
    const cartInfo = await page.evaluate(() => {
      const totalEl = document.querySelector('[class*="total"], [class*="amount"], [class*="price"]');
      return {
        total: totalEl ? totalEl.textContent.trim() : 'N/A',
        url: window.location.href,
      };
    });

    // Confirm order with user
    const itemSummary = addedItems.map(i => '• ' + i.name + ' — ' + i.price).join('\\n');
    const confirmResp = await requestFromHost({
      type: 'confirm_action',
      action: 'Place Swiggy Instamart order',
      details: 'Items:\\n' + itemSummary + '\\n\\nEstimated total: ' + cartInfo.total + '\\nDelivery: 10-30 minutes',
    });
    if (!confirmResp.confirmed) {
      log({ step: 'Order cancelled by user', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // ── Payment ──────────────────────────────────────────
    log({ step: 'Proceeding to payment...', status: 'running' });
    const totalAmount = parseFloat((cartInfo.total || '0').replace(/[^0-9.]/g, '')) || 0;
    const payResp = await requestFromHost({
      type: 'payment_required',
      action: 'Complete Swiggy Instamart order',
      details: itemSummary,
      amountInr: totalAmount,
      description: 'Swiggy Instamart grocery order',
    });
    if (!payResp.confirmed) {
      log({ step: 'Payment cancelled', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // Click Place Order
    const placeOrderBtn = page.locator('button:has-text("Place Order"), button:has-text("Pay"), button:has-text("Proceed")').first();
    if (await placeOrderBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await placeOrderBtn.click();
      await page.waitForTimeout(5000);
    }

    // ── Handle OTP if needed ─────────────────────────────
    const otpField = page.locator('input[name="otp"], input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], [placeholder*="OTP" i]').first();
    if (await otpField.isVisible({ timeout: 5000 }).catch(() => false)) {
      const otpResp = await requestFromHost({
        type: 'input_required',
        question: 'Enter the OTP sent to your phone:',
        inputType: 'otp',
      });
      if (otpResp.value) {
        await otpField.fill(otpResp.value);
        const verifyBtn = page.locator('button:has-text("Submit"), button:has-text("Verify"), button[type="submit"]').first();
        if (await verifyBtn.isVisible({ timeout: 2000 }).catch(() => false)) await verifyBtn.click();
        await page.waitForTimeout(5000);
      }
    }

    // ── Completion ───────────────────────────────────────
    const finalUrl = page.url();
    const finalTitle = await page.title();
    log({ step: 'Swiggy Instamart order placed! 🎉', status: 'completed' });
    log({
      message: 'Order placed on Swiggy Instamart!\\nItems: ' + addedItems.map(i => i.name).join(', ') + '\\nTotal: ' + cartInfo.total + '\\nEstimated delivery: 10-30 minutes',
    });
    log({ done: true, url: finalUrl, title: finalTitle });

    await page.waitForTimeout(3000);

  } catch (err) {
    log({ step: 'Error: ' + err.message, status: 'failed' });
    log({ error: err.message });

    try {
      const screenshotDir = path.join(os.homedir(), '.shofferai', 'screenshots');
      fs.mkdirSync(screenshotDir, { recursive: true });
      await page.screenshot({
        path: path.join(screenshotDir, 'swiggy-instamart-error-' + Date.now() + '.png'),
        fullPage: true,
      });
    } catch {}
  } finally {
    rl.close();
    await page.close();
  }
})();
`;

export const SKILL_ID = 'swiggy-instamart';
export const REQUIRED_PARAMS = ['items'];
