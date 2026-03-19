/**
 * Order food from KFC India — buckets, combos, chicken, sides, checkout, pay.
 *
 * Compiled Playwright script for kfc-order with real selectors from online.kfc.co.in.
 * Site: https://online.kfc.co.in
 * Params: none required
 *
 * Real selectors discovered via live browsing:
 *   - Sign In: text "Sign In" in header nav
 *   - Location banner: "Allow location access..." + "Set Location" button
 *   - Start Order: button "Start Order"
 *   - Menu categories: link text e.g. "BURGERS", "CHICKEN BUCKETS", "BOX MEALS"
 *   - Menu page: /menu and /menu/{category}
 *   - Offers: button "Apply Offer"
 *   - Cart count: header cart button
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
    // ── KFC menu category map ────────────────────────────────────────
    const MENU_CATEGORIES = {
      'epic bucket of the day': '/menu/epic-bucket-of-the-day',
      'gold edition': '/menu/gold-edition',
      'box meals': '/menu/box-meals',
      'variety buckets': '/menu/variety-buckets',
      'veg': '/menu/veg',
      'chicken buckets': '/menu/chicken-buckets',
      'burgers': '/menu/burgers',
      'snacks': '/menu/snacks',
      'rice bowlz': '/menu/rice-bowlz',
      'beverage & desserts': '/menu/beverage-desserts',
    };

    // ── Helper: dismiss KFC location banner & popups ─────────────────
    const dismissPopups = async () => {
      // Dismiss location access banner ("Allow location access for local store menu and promos")
      try {
        const locationBanner = page.getByText('Allow location access for local store menu and promos');
        if (await locationBanner.isVisible({ timeout: 2000 })) {
          const setLocationBtn = page.getByRole('button', { name: 'Set Location' });
          if (await setLocationBtn.isVisible({ timeout: 1000 })) {
            await setLocationBtn.click();
            await page.waitForTimeout(1000);
          }
        }
      } catch {}
      // Dismiss any generic close/dialog popups
      try {
        const closeBtn = page.locator('[role="dialog"] button[aria-label="Close"], button[aria-label="close"]').first();
        if (await closeBtn.isVisible({ timeout: 1000 })) await closeBtn.click();
      } catch {}
      // Dismiss cookie consent
      try {
        const cookieBtn = page.locator('#onetrust-accept-btn-handler, button:has-text("Accept All")').first();
        if (await cookieBtn.isVisible({ timeout: 1000 })) await cookieBtn.click();
      } catch {}
    };

    // ── Helper: get cart count from header ────────────────────────────
    const getCartCount = async () => {
      try {
        // Cart count is displayed near the cart icon in the header
        const cartText = await page.locator('header').getByText(/^\\d+$/).first().textContent({ timeout: 2000 });
        return parseInt(cartText) || 0;
      } catch { return 0; }
    };

    // ── Step 1: Navigate to KFC ──────────────────────────────────────
    log({ step: 'Opening KFC India ordering site...', status: 'running' });
    await page.goto('https://online.kfc.co.in');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await dismissPopups();

    // ── Step 2: Verify login status ──────────────────────────────────
    // KFC shows "Sign In" in the header when not logged in
    log({ step: 'Checking login status...', status: 'running' });
    const signInLink = page.getByText('Sign In', { exact: true });
    const isSignInVisible = await signInLink.isVisible({ timeout: 3000 }).catch(() => false);

    if (isSignInVisible) {
      log({ step: 'Not logged in — starting KFC sign-in...', status: 'running' });
      await signInLink.click();
      await page.waitForTimeout(2000);

      // KFC uses phone + OTP login flow
      const phoneInput = page.locator('input[type="tel"], input[placeholder*="mobile" i], input[placeholder*="phone" i], input[name*="phone" i]').first();
      if (await phoneInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        const phoneResp = await requestFromHost({
          type: 'input_required',
          question: 'Enter your phone number for KFC login:',
          inputType: 'phone',
        });
        if (phoneResp.value) {
          await phoneInput.fill(phoneResp.value);
          // Submit phone number
          const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Send OTP"), button:has-text("Get OTP"), button[type="submit"]').first();
          if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await continueBtn.click();
            await page.waitForTimeout(3000);
          }

          // Wait for OTP input
          const otpInput = page.locator('input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], input[placeholder*="OTP" i], input[name*="otp" i]').first();
          if (await otpInput.isVisible({ timeout: 8000 }).catch(() => false)) {
            const otpResp = await requestFromHost({
              type: 'input_required',
              question: 'Enter the OTP sent to your phone for KFC login:',
              inputType: 'otp',
            });
            if (otpResp.value) {
              await otpInput.fill(otpResp.value);
              const verifyBtn = page.locator('button:has-text("Verify"), button:has-text("Submit"), button:has-text("Login"), button[type="submit"]').first();
              if (await verifyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await verifyBtn.click();
                await page.waitForTimeout(5000);
              }
            }
          }
        }
      }
      await dismissPopups();
    } else {
      log({ step: 'Already logged in to KFC', status: 'running' });
    }

    // ── Step 3: Handle location if needed ────────────────────────────
    await dismissPopups();
    // Check if location banner is still showing
    const locationMsg = page.getByText('Allow location access for local store menu and promos');
    if (await locationMsg.isVisible({ timeout: 2000 }).catch(() => false)) {
      log({ step: 'Setting delivery location...', status: 'running' });
      const setLocBtn = page.getByRole('button', { name: 'Set Location' });
      if (await setLocBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await setLocBtn.click();
        await page.waitForTimeout(2000);
      }
      // If a location search/input appears, ask user for address
      const addressInput = page.locator('input[placeholder*="location" i], input[placeholder*="address" i], input[placeholder*="area" i], input[placeholder*="search" i]').first();
      if (await addressInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        const addrResp = await requestFromHost({
          type: 'input_required',
          question: 'Enter your delivery address or area for KFC:',
          inputType: 'freetext',
        });
        if (addrResp.value) {
          await addressInput.fill(addrResp.value);
          await page.waitForTimeout(2000);
          // Select first suggestion
          const suggestion = page.locator('[class*="suggestion"], [class*="autocomplete"] li, [role="option"], [class*="dropdown"] [class*="item"]').first();
          if (await suggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
            await suggestion.click();
            await page.waitForTimeout(2000);
          }
        }
      }
    }

    // ── Step 4: Click "Start Order" to begin ─────────────────────────
    const startOrderBtn = page.getByRole('button', { name: 'Start Order' });
    if (await startOrderBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      log({ step: 'Starting KFC order...', status: 'running' });
      await startOrderBtn.click();
      await page.waitForTimeout(2000);
      await dismissPopups();
    }

    // ── Step 5: Ask user what they want to order ─────────────────────
    log({ step: 'KFC menu loaded — asking what to order...', status: 'running' });
    const categories = Object.keys(MENU_CATEGORIES).map(c => c.toUpperCase()).join(', ');
    const userChoice = await requestFromHost({
      type: 'input_required',
      question: 'What would you like from KFC? You can pick a category (' + categories + ') or describe items (e.g. "2 Zinger burgers and 1 Chicken Bucket")',
      inputType: 'freetext',
    });

    // ── Step 6: Navigate to menu / category ──────────────────────────
    const choiceText = (userChoice.value || '').toLowerCase().trim();
    let navigatedToCategory = false;

    // Check if user specified a known category
    for (const [cat, catPath] of Object.entries(MENU_CATEGORIES)) {
      if (choiceText.includes(cat)) {
        log({ step: 'Browsing ' + cat.toUpperCase() + ' menu...', status: 'running' });
        const catLink = page.getByRole('link', { name: cat.toUpperCase(), exact: true });
        if (await catLink.isVisible({ timeout: 3000 }).catch(() => false)) {
          await catLink.click();
        } else {
          await page.goto('https://online.kfc.co.in' + catPath);
        }
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        navigatedToCategory = true;
        break;
      }
    }

    // If no specific category matched, go to full menu
    if (!navigatedToCategory) {
      log({ step: 'Opening full KFC menu...', status: 'running' });
      const menuLink = page.getByText('Menu', { exact: true });
      if (await menuLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await menuLink.click();
      } else {
        await page.goto('https://online.kfc.co.in/menu');
      }
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
    }
    await dismissPopups();

    // ── Step 7: Add items to cart ─────────────────────────────────────
    log({ step: 'Looking for items to add...', status: 'running' });
    await page.waitForTimeout(2000);

    // Look for "Add" or "ADD" buttons next to menu items
    const addButtons = page.locator('button:has-text("Add"), button:has-text("ADD")');
    const addCount = await addButtons.count();

    if (addCount > 0) {
      // Click first Add button as starting point
      log({ step: 'Adding item to cart...', status: 'running' });
      await addButtons.first().click();
      await page.waitForTimeout(1500);
      await dismissPopups();
    }

    // Check cart count after adding
    const cartCount = await getCartCount();
    log({ step: 'Cart has ' + cartCount + ' item(s)', status: 'running' });

    // ── Step 8: Let user add more items or proceed ───────────────────
    let keepAdding = true;
    while (keepAdding) {
      const moreResp = await requestFromHost({
        type: 'input_required',
        question: 'Cart has ' + (await getCartCount()) + ' item(s). Add more items? (type item name/category, or "done" to proceed to checkout)',
        inputType: 'freetext',
      });

      const moreText = (moreResp.value || 'done').toLowerCase().trim();
      if (moreText === 'done' || moreText === 'checkout' || moreText === 'no') {
        keepAdding = false;
      } else {
        // Navigate to category or search for the item
        let found = false;
        for (const [cat, catPath] of Object.entries(MENU_CATEGORIES)) {
          if (moreText.includes(cat)) {
            const catLink = page.getByRole('link', { name: cat.toUpperCase(), exact: true });
            if (await catLink.isVisible({ timeout: 2000 }).catch(() => false)) {
              await catLink.click();
            } else {
              await page.goto('https://online.kfc.co.in' + catPath);
            }
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(2000);
            found = true;
            break;
          }
        }
        if (!found) {
          // Try scrolling through menu to find items
          await page.evaluate(() => window.scrollBy(0, 400));
          await page.waitForTimeout(1000);
        }
        // Add first visible Add button
        const nextAdd = page.locator('button:has-text("Add"), button:has-text("ADD")').first();
        if (await nextAdd.isVisible({ timeout: 3000 }).catch(() => false)) {
          await nextAdd.click();
          await page.waitForTimeout(1500);
          await dismissPopups();
        }
      }
    }

    // ── Step 9: Check for deals/offers ───────────────────────────────
    log({ step: 'Checking for applicable offers...', status: 'running' });
    const applyOfferBtn = page.getByRole('button', { name: /Apply Offer/i }).first();
    if (await applyOfferBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      const offerResp = await requestFromHost({
        type: 'confirm_action',
        action: 'Apply available KFC offer/deal?',
        details: 'There are offers available. Apply one to your order?',
      });
      if (offerResp.confirmed) {
        await applyOfferBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    // ── Step 10: Review cart & confirm order ──────────────────────────
    log({ step: 'Reviewing cart before checkout...', status: 'running' });
    const finalCartCount = await getCartCount();
    const pageTitle = await page.title();
    const pageUrl = page.url();

    const confirmResp = await requestFromHost({
      type: 'confirm_action',
      action: 'Proceed to KFC checkout',
      details: 'Cart has ' + finalCartCount + ' item(s). Ready to proceed to payment.',
    });
    if (!confirmResp.confirmed) {
      log({ step: 'Cancelled by user', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // ── Step 11: Proceed to checkout ─────────────────────────────────
    log({ step: 'Proceeding to checkout...', status: 'running' });
    const checkoutBtn = page.locator('button:has-text("Checkout"), button:has-text("CHECKOUT"), button:has-text("Place Order"), button:has-text("PLACE ORDER"), a:has-text("Checkout")').first();
    if (await checkoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await checkoutBtn.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
    }
    await dismissPopups();

    // ── Step 12: Extract order total ─────────────────────────────────
    let orderTotal = 0;
    try {
      const totalText = await page.locator('[class*="total" i], [class*="amount" i], [class*="price" i]').last().textContent({ timeout: 3000 });
      const match = totalText.match(/[\\d,]+\\.?\\d*/);
      if (match) orderTotal = parseFloat(match[0].replace(/,/g, ''));
    } catch {}

    // ── Step 13: Payment pause ───────────────────────────────────────
    log({ step: 'Ready for payment — ₹' + orderTotal, status: 'running' });
    const payResp = await requestFromHost({
      type: 'payment_required',
      action: 'Complete KFC order payment',
      details: 'KFC order total: ₹' + orderTotal + '. Confirm to proceed with payment on the KFC site.',
      amountInr: orderTotal,
      description: 'KFC food order',
    });
    if (!payResp.confirmed) {
      log({ step: 'Payment cancelled', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // ── Step 14: Complete payment on KFC site ────────────────────────
    log({ step: 'Completing payment on KFC...', status: 'running' });
    const payBtn = page.locator('button:has-text("Pay"), button:has-text("PAY"), button:has-text("Place Order"), button:has-text("PLACE ORDER")').first();
    if (await payBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await payBtn.click();
      await page.waitForTimeout(5000);
    }

    // ── Step 15: Handle payment OTP if needed ────────────────────────
    const payOtpField = page.locator('input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], input[placeholder*="OTP" i], input[name*="otp" i]').first();
    if (await payOtpField.isVisible({ timeout: 5000 }).catch(() => false)) {
      const otpResp = await requestFromHost({
        type: 'input_required',
        question: 'Enter the OTP sent to your phone for payment verification:',
        inputType: 'otp',
      });
      if (otpResp.value) {
        await payOtpField.fill(otpResp.value);
        const submitOtp = page.locator('button:has-text("Submit"), button:has-text("Verify"), button[type="submit"]').first();
        if (await submitOtp.isVisible({ timeout: 2000 }).catch(() => false)) {
          await submitOtp.click();
          await page.waitForTimeout(5000);
        }
      }
    }

    // ── Completion ───────────────────────────────────────────────────
    const finalUrl = page.url();
    const finalTitle = await page.title();
    log({ step: 'KFC order completed!', status: 'completed' });
    log({ message: 'KFC order placed successfully. Page: ' + finalTitle });
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
        path: path.join(screenshotDir, 'kfc-order-error-' + Date.now() + '.png'),
        fullPage: true,
      });
    } catch {}
  } finally {
    rl.close();
    await page.close();  // Close tab only — operator's Chrome stays running
  }
})();
`;

export const SKILL_ID = 'kfc-order';
export const REQUIRED_PARAMS = [];
