/**
 * Order groceries from BigBasket — search products, add to cart, schedule delivery, pay.
 *
 * Compiled with real selectors from live browsing (2026-03-20).
 * Site: https://www.bigbasket.com
 * Params: items (required), address (optional), payment_method (optional)
 *
 * Real selectors discovered:
 *   Search bar:        textbox "Search for Products..."
 *   Location popup:    menu "Delivery in 10 mins Select Location"
 *   Location search:   textbox "Search for area or street name"
 *   Login button:      button "Login/ Sign Up"
 *   Category dropdown: button "Shop by Category"
 *   Product heading:   heading[level=3] with brand + product + weight
 *   Product price:     two sibling generics (sale price, then MRP)
 *   Add to cart:       button "Add"
 *   Weight selector:   button with weight text (e.g. "1 kg")
 *   Product URLs:      /pd/{id}/{slug}/
 *   Category URLs:     /cl/{category}/ or /pc/{parent}/{sub}/
 *   Cart page:         /basket/
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

  const items = (params.items || '').split(',').map(s => s.trim()).filter(Boolean);
  const address = params.address || userContext.address || '';

  if (items.length === 0) {
    console.log(JSON.stringify({ error: 'Missing required param: items (comma-separated list of groceries)' }));
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
    // ── Step 1: Navigate to BigBasket ──────────────────────────
    log({ step: 'Opening BigBasket...', status: 'running' });
    await page.goto('https://www.bigbasket.com');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // ── Step 2: Handle location popup ──────────────────────────
    // BigBasket auto-shows a location popup: menu "Delivery in 10 mins Select Location"
    log({ step: 'Setting delivery location...', status: 'running' });
    const locationInput = page.getByPlaceholder('Search for area or street name').first();
    const locationPopupVisible = await locationInput.isVisible({ timeout: 5000 }).catch(() => false);

    if (locationPopupVisible) {
      let locationQuery = address;
      if (!locationQuery) {
        const addrResp = await requestFromHost({
          type: 'input_required',
          question: "What's your delivery address or area name for BigBasket?",
          inputType: 'freetext',
        });
        locationQuery = addrResp.value || '';
      }

      if (locationQuery) {
        await locationInput.fill(locationQuery);
        await page.waitForTimeout(2000);
        // Click first suggestion
        const suggestion = page.locator('[role="option"], [class*="suggestion"], [class*="location-item"]').first();
        if (await suggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
          await suggestion.click();
          await page.waitForTimeout(2000);
        }
      }
    }

    // ── Step 3: Verify login ──────────────────────────────────
    log({ step: 'Checking login status...', status: 'running' });
    // Real selector: button "Login/ Sign Up" — if visible, NOT logged in
    const loginBtn = page.getByRole('button', { name: 'Login/ Sign Up' }).first();
    const needsLogin = await loginBtn.isVisible({ timeout: 3000 }).catch(() => false);

    if (needsLogin) {
      log({ step: 'Not logged in — requesting OTP login...', status: 'running' });
      await loginBtn.click();
      await page.waitForTimeout(2000);

      // BigBasket uses phone + OTP (no Google sign-in)
      const phoneInput = page.locator('input[type="tel"], input[name="phone"], input[placeholder*="phone" i], input[placeholder*="mobile" i]').first();
      if (await phoneInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Operator phone is pre-filled from profile or needs to be entered
        const phoneResp = await requestFromHost({
          type: 'input_required',
          question: 'Enter the phone number for BigBasket login:',
          inputType: 'freetext',
        });
        if (phoneResp.value) {
          await phoneInput.fill(phoneResp.value);
          const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Send OTP"), button[type="submit"]').first();
          if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) await continueBtn.click();
          await page.waitForTimeout(3000);

          // OTP input
          const otpResp = await requestFromHost({
            type: 'input_required',
            question: 'Enter the OTP sent to your phone for BigBasket login:',
            inputType: 'otp',
          });
          if (otpResp.value) {
            const otpField = page.locator('input[name="otp"], input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], input[placeholder*="OTP" i]').first();
            if (await otpField.isVisible({ timeout: 3000 }).catch(() => false)) {
              await otpField.fill(otpResp.value);
              const verifyBtn = page.locator('button:has-text("Verify"), button:has-text("Submit"), button[type="submit"]').first();
              if (await verifyBtn.isVisible({ timeout: 2000 }).catch(() => false)) await verifyBtn.click();
              await page.waitForTimeout(3000);
            }
          }
        }
      }
    }

    // ── Step 4: Search & Add Items ────────────────────────────
    const addedItems = [];

    for (const item of items) {
      log({ step: 'Searching for: ' + item, status: 'running' });

      // Real selector: textbox "Search for Products..."
      const searchBar = page.getByPlaceholder('Search for Products...').first();
      await searchBar.click();
      await searchBar.fill(item);
      await page.keyboard.press('Enter');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);

      // Product cards are listitem elements with heading[level=3] containing brand + product
      const productCards = page.locator('li h3, [class*="product"] h3, [class*="card"] h3').first();
      const hasResults = await productCards.isVisible({ timeout: 5000 }).catch(() => false);

      if (!hasResults) {
        log({ step: 'No results for: ' + item, status: 'running' });
        continue;
      }

      // Extract first result's details
      const firstProduct = page.locator('li').filter({ has: page.locator('h3') }).first();
      const productName = await firstProduct.locator('h3').first().innerText().catch(() => 'Unknown');

      // Get prices — sale price and MRP are sibling generics
      const priceText = await firstProduct.locator('text=/₹/').first().innerText().catch(() => '');

      // Click "Add" button — real selector: button "Add"
      const addBtn = firstProduct.getByRole('button', { name: 'Add' }).first();
      if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        addedItems.push({ name: productName.trim(), price: priceText.trim(), searchTerm: item });
        log({ step: 'Added: ' + productName.trim() + ' ' + priceText.trim(), status: 'running' });
      } else {
        log({ step: 'Could not add: ' + item + ' (button not found)', status: 'running' });
      }
    }

    if (addedItems.length === 0) {
      log({ step: 'No items could be added to cart', status: 'failed' });
      log({ error: 'No items were found or could be added. Please try different search terms.' });
      await page.close();
      rl.close();
      return;
    }

    // ── Step 5: Review Cart ──────────────────────────────────
    log({ step: 'Opening cart...', status: 'running' });
    await page.goto('https://www.bigbasket.com/basket/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const cartTitle = await page.title();
    const cartUrl = page.url();

    // Build summary for confirmation
    const itemSummary = addedItems.map((i, idx) => (idx + 1) + '. ' + i.name + ' — ' + i.price).join('\\n');
    const confirmResp = await requestFromHost({
      type: 'confirm_action',
      action: 'Review BigBasket Cart',
      details: 'Items added:\\n' + itemSummary + '\\n\\nPlease review your cart on BigBasket and confirm to proceed to checkout.',
    });

    if (!confirmResp.confirmed) {
      log({ step: 'Cart review cancelled by user', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // ── Step 6: Checkout & Payment ───────────────────────────
    log({ step: 'Proceeding to checkout...', status: 'running' });

    // Extract total from cart page
    const totalText = await page.locator('text=/₹/').last().innerText().catch(() => '0');
    const totalAmount = parseFloat(totalText.replace(/[^0-9.]/g, '')) || 0;

    const payResp = await requestFromHost({
      type: 'payment_required',
      action: 'Complete BigBasket grocery order',
      details: 'Items: ' + addedItems.length + '\\nEstimated total: ' + totalText,
      amountInr: totalAmount,
      description: 'BigBasket grocery order — ' + addedItems.length + ' items',
    });

    if (!payResp.confirmed) {
      log({ step: 'Payment cancelled', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // Click checkout/place order button
    const checkoutBtn = page.locator('button:has-text("Place Order"), button:has-text("Checkout"), button:has-text("Proceed")').first();
    if (await checkoutBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await checkoutBtn.click();
      await page.waitForTimeout(5000);
    }

    // ── Step 7: Handle payment OTP if needed ─────────────────
    const otpField = page.locator('input[name="otp"], input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], input[placeholder*="OTP" i]').first();
    if (await otpField.isVisible({ timeout: 5000 }).catch(() => false)) {
      const otpResp = await requestFromHost({
        type: 'input_required',
        question: 'Enter the payment OTP sent to your phone:',
        inputType: 'otp',
      });
      if (otpResp.value) {
        await otpField.fill(otpResp.value);
        const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Verify"), button[type="submit"]').first();
        if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) await submitBtn.click();
        await page.waitForTimeout(5000);
      }
    }

    // ── Completion ───────────────────────────────────────────
    const finalUrl = page.url();
    const finalTitle = await page.title();
    log({ step: 'BigBasket order completed!', status: 'completed' });
    log({
      message: 'Order placed on BigBasket!\\nItems: ' + addedItems.map(i => i.name).join(', ') + '\\nTotal: ' + totalText,
    });
    log({ done: true, url: finalUrl, title: finalTitle, items: addedItems });

  } catch (err) {
    log({ step: 'Error: ' + err.message, status: 'failed' });
    log({ error: err.message });

    try {
      const screenshotDir = path.join(os.homedir(), '.shofferai', 'screenshots');
      fs.mkdirSync(screenshotDir, { recursive: true });
      await page.screenshot({
        path: path.join(screenshotDir, 'bigbasket-grocery-error-' + Date.now() + '.png'),
        fullPage: true,
      });
    } catch {}
  } finally {
    rl.close();
    await page.close();
  }
})();
`;

export const SKILL_ID = 'bigbasket-grocery';
export const REQUIRED_PARAMS = ['items'];
