/**
 * Order food from McDelivery India (McDonald's) — browse menu, search items, add to cart, checkout, pay.
 *
 * Compiled Playwright script for mcdonalds-order.
 * Site: https://mcdelivery.co.in
 *
 * Real selectors discovered via live browsing:
 *   - Logo: img[alt="logo"]
 *   - Delivery icon: img[alt="ic-bm-delivery"]
 *   - Search icon: img[alt="ic-search-b"]
 *   - Search box: input[placeholder="Search here"]
 *   - Menu heading: h4 "Our Menu"
 *   - Add buttons: text "Add" inside product cards
 *   - Prices: ₹XXX or ₹XXX₹YYY (strikethrough original + discounted)
 *
 * Params: none required (items requested via interactive prompts)
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
    // ── Helper: dismiss McDelivery popups & overlays ────────────
    const dismissPopups = async () => {
      // Location permission / delivery area popups
      try {
        const closeBtn = page.locator('[role="dialog"] button[aria-label="Close"], button[aria-label="close"], .modal-close, [class*="popup"] button[class*="close"], [class*="overlay"] button[class*="close"]').first();
        if (await closeBtn.isVisible({ timeout: 2000 })) await closeBtn.click();
      } catch {}
      // Cookie / consent banners
      try {
        const cookieBtn = page.locator('button:has-text("Accept"), button:has-text("Got it"), button:has-text("OK"), #onetrust-accept-btn-handler').first();
        if (await cookieBtn.isVisible({ timeout: 1000 })) await cookieBtn.click();
      } catch {}
    };

    // ── Helper: extract price from text (₹XXX or ₹XXX₹YYY) ────
    const parsePrice = (text) => {
      if (!text) return null;
      // Match all ₹NNN patterns — last one is the effective (discounted) price
      const matches = text.match(/₹(\\d[\\d,]*)/g);
      if (!matches || matches.length === 0) return null;
      const effective = matches[matches.length - 1].replace('₹', '').replace(/,/g, '');
      const original = matches.length > 1 ? matches[0].replace('₹', '').replace(/,/g, '') : null;
      return {
        price: parseInt(effective, 10),
        originalPrice: original ? parseInt(original, 10) : null,
        display: original ? '₹' + original + ' → ₹' + effective : '₹' + effective,
      };
    };

    // ── Step 1: Navigate to McDelivery India ────────────────────
    log({ step: 'Opening McDelivery India (mcdelivery.co.in)...', status: 'running' });
    await page.goto('https://mcdelivery.co.in', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await dismissPopups();

    // Verify we loaded the right site
    const pageTitle = await page.title();
    if (!pageTitle.toLowerCase().includes('mcdonald') && !pageTitle.toLowerCase().includes('mcdelivery')) {
      log({ step: 'Warning: unexpected page title: ' + pageTitle, status: 'running' });
    }

    // ── Step 2: Check login status ─────────────────────────────
    log({ step: 'Checking login status...', status: 'running' });
    // McDelivery shows profile/account icons in the header when logged in
    const loggedInIndicator = page.locator(
      'img[alt*="profile" i], img[alt*="account" i], img[alt*="user" i], ' +
      '[class*="profile-icon"], [class*="user-icon"], [class*="account-icon"], ' +
      'a[href*="profile"], a[href*="account"], ' +
      'img[alt="ic-bm-delivery"]'
    ).first();
    const isLoggedIn = await loggedInIndicator.isVisible({ timeout: 3000 }).catch(() => false);

    if (!isLoggedIn) {
      log({ step: 'Not logged in — looking for sign-in option...', status: 'running' });
      // McDelivery login is typically phone-based (OTP)
      const signInBtn = page.locator(
        'a:has-text("Sign in"), a:has-text("Login"), a:has-text("Log in"), ' +
        'button:has-text("Sign in"), button:has-text("Login"), button:has-text("Log in"), ' +
        'img[alt*="login" i], [class*="login"]'
      ).first();
      if (await signInBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await signInBtn.click();
        await page.waitForTimeout(3000);
        await dismissPopups();

        // McDelivery uses phone + OTP login
        const phoneInput = page.locator(
          'input[type="tel"], input[name*="phone" i], input[name*="mobile" i], ' +
          'input[placeholder*="phone" i], input[placeholder*="mobile" i], input[placeholder*="number" i]'
        ).first();
        if (await phoneInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          const phoneResp = await requestFromHost({
            type: 'input_required',
            question: 'McDelivery requires login. Enter your phone number (10 digits):',
            inputType: 'phone',
          });
          if (phoneResp.value) {
            await phoneInput.fill(phoneResp.value);
            // Click send OTP / continue
            const sendOtpBtn = page.locator(
              'button:has-text("Continue"), button:has-text("Send OTP"), button:has-text("Get OTP"), ' +
              'button:has-text("Submit"), button[type="submit"]'
            ).first();
            if (await sendOtpBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
              await sendOtpBtn.click();
              await page.waitForTimeout(3000);
            }

            // Wait for OTP input
            const otpInput = page.locator(
              'input[name*="otp" i], input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], ' +
              'input[placeholder*="OTP" i], input[placeholder*="verification" i]'
            ).first();
            if (await otpInput.isVisible({ timeout: 10000 }).catch(() => false)) {
              const otpResp = await requestFromHost({
                type: 'input_required',
                question: 'Enter the OTP sent to your phone:',
                inputType: 'otp',
              });
              if (otpResp.value) {
                await otpInput.fill(otpResp.value);
                const verifyBtn = page.locator(
                  'button:has-text("Verify"), button:has-text("Submit"), button:has-text("Continue"), button[type="submit"]'
                ).first();
                if (await verifyBtn.isVisible({ timeout: 2000 }).catch(() => false)) await verifyBtn.click();
                await page.waitForTimeout(5000);
                await dismissPopups();
              }
            }
          }
        }
      }
    }
    log({ step: 'Login check complete', status: 'running' });

    // ── Step 3: Set delivery address if prompted ────────────────
    const addressPrompt = page.locator(
      'input[placeholder*="address" i], input[placeholder*="location" i], input[placeholder*="deliver" i], ' +
      '[class*="address-input"], [class*="location-input"]'
    ).first();
    if (await addressPrompt.isVisible({ timeout: 3000 }).catch(() => false)) {
      log({ step: 'Delivery address needed...', status: 'running' });
      const addrResp = await requestFromHost({
        type: 'input_required',
        question: 'McDelivery needs your delivery address. Enter your full address or area/pincode:',
        inputType: 'freetext',
      });
      if (addrResp.value) {
        await addressPrompt.fill(addrResp.value);
        await page.waitForTimeout(2000);
        // Select first suggestion if dropdown appears
        const suggestion = page.locator(
          '[class*="suggestion"], [class*="autocomplete"] li, [class*="dropdown"] li, [role="option"]'
        ).first();
        if (await suggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
          await suggestion.click();
          await page.waitForTimeout(2000);
        }
        await dismissPopups();
      }
    }

    // ── Step 4: Wait for menu to load ──────────────────────────
    log({ step: 'Loading McDelivery menu...', status: 'running' });
    // Menu is on the main page — wait for "Our Menu" heading or product cards
    await page.waitForSelector(
      'h4:has-text("Our Menu"), [class*="menu-section"], [class*="product-card"], [class*="menu-item"]',
      { timeout: 15000 }
    ).catch(() => {});
    await page.waitForTimeout(2000);

    // ── Step 5: Ask user what they want to order ────────────────
    // Scrape visible menu categories
    const categories = await page.evaluate(() => {
      const cats = [];
      // Category headings in the menu
      document.querySelectorAll('h3, h4, [class*="category-name"], [class*="menu-category"]').forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length < 50 && !text.includes('\\n')) cats.push(text);
      });
      return [...new Set(cats)].slice(0, 15);
    });

    const categoryList = categories.length > 0
      ? '\\nVisible categories: ' + categories.join(', ')
      : '';

    const orderResp = await requestFromHost({
      type: 'input_required',
      question: 'What would you like to order from McDonald\\'s?' + categoryList + '\\n\\nYou can name specific items (e.g., "McChicken Burger", "McSpicy Combo") or I can search the menu for you.',
      inputType: 'freetext',
    });

    const itemsToOrder = (orderResp.value || '').split(/[,;&]+/).map(s => s.trim()).filter(Boolean);
    if (itemsToOrder.length === 0) {
      log({ step: 'No items requested — cancelling', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // ── Step 6: Search & add each item ──────────────────────────
    const addedItems = [];

    for (const item of itemsToOrder) {
      log({ step: 'Searching for: ' + item, status: 'running' });

      // Click search icon (img alt="ic-search-b") or find the search box
      const searchIcon = page.locator('img[alt="ic-search-b"], img[alt*="search" i], [class*="search-icon"]').first();
      const searchBox = page.locator('input[placeholder="Search here"], input[placeholder*="search" i], input[type="search"]').first();

      if (await searchBox.isVisible({ timeout: 2000 }).catch(() => false)) {
        await searchBox.click();
        await searchBox.fill('');
        await searchBox.fill(item);
        await page.waitForTimeout(2000);
      } else if (await searchIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
        await searchIcon.click();
        await page.waitForTimeout(1000);
        // Search box should now be visible
        const searchInput = page.locator('input[placeholder="Search here"], input[placeholder*="search" i], input[type="search"]').first();
        if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await searchInput.fill(item);
          await page.waitForTimeout(2000);
        }
      }

      // Wait for search results / product cards to appear
      await page.waitForTimeout(2000);

      // Extract visible product cards with names and prices
      const products = await page.evaluate(() => {
        const results = [];
        // Product cards contain description text + price + Add button
        const cards = document.querySelectorAll(
          '[class*="product-card"], [class*="menu-item"], [class*="item-card"], ' +
          '[class*="product-container"], [class*="food-item"], [class*="menuItem"]'
        );

        // Fallback: scan for "Add" buttons and work up to find product info
        if (cards.length === 0) {
          const addButtons = document.querySelectorAll('button, span, div, a');
          const addEls = Array.from(addButtons).filter(el =>
            el.textContent.trim() === 'Add' || el.textContent.trim() === 'ADD'
          );
          addEls.forEach((addEl, idx) => {
            // Walk up to find the product container
            let container = addEl.parentElement;
            for (let i = 0; i < 5 && container; i++) {
              const text = container.textContent || '';
              const priceMatch = text.match(/₹(\\d[\\d,]*)/);
              if (priceMatch && text.length > 20) {
                const nameEl = container.querySelector('h3, h4, h5, [class*="name"], [class*="title"], [class*="heading"]');
                const name = nameEl ? nameEl.textContent.trim() : text.substring(0, 60).trim();
                results.push({
                  index: idx,
                  name: name.replace(/\\s+/g, ' ').substring(0, 80),
                  priceText: priceMatch[0],
                  fullText: text.substring(0, 200).replace(/\\s+/g, ' '),
                });
                break;
              }
              container = container.parentElement;
            }
          });
        } else {
          cards.forEach((card, idx) => {
            const text = card.textContent || '';
            const priceMatch = text.match(/₹(\\d[\\d,]*)/);
            const nameEl = card.querySelector('h3, h4, h5, [class*="name"], [class*="title"]');
            const name = nameEl ? nameEl.textContent.trim() : '';
            if (name || priceMatch) {
              results.push({
                index: idx,
                name: (name || text.substring(0, 60)).replace(/\\s+/g, ' ').substring(0, 80),
                priceText: priceMatch ? priceMatch[0] : 'N/A',
                fullText: text.substring(0, 200).replace(/\\s+/g, ' '),
              });
            }
          });
        }
        return results.slice(0, 10);
      });

      if (products.length === 0) {
        log({ step: 'No results found for: ' + item, status: 'running' });
        const retryResp = await requestFromHost({
          type: 'input_required',
          question: 'Could not find "' + item + '" on the menu. Would you like to try a different name or skip this item? (type new name or "skip")',
          inputType: 'freetext',
        });
        if (retryResp.value && retryResp.value.toLowerCase() !== 'skip') {
          itemsToOrder.push(retryResp.value);
        }
        continue;
      }

      // Show matching products to user
      const productList = products.map((p, i) =>
        (i + 1) + '. ' + p.name + ' — ' + p.priceText
      ).join('\\n');

      const pickResp = await requestFromHost({
        type: 'input_required',
        question: 'Found these items for "' + item + '":\\n' + productList + '\\n\\nWhich one? (enter number, or "skip")',
        inputType: 'freetext',
      });

      if (pickResp.value && pickResp.value.toLowerCase() === 'skip') continue;

      const pickNum = parseInt(pickResp.value || '1', 10);
      const pickIdx = (!isNaN(pickNum) && pickNum >= 1 && pickNum <= products.length) ? pickNum - 1 : 0;
      const chosen = products[pickIdx];

      // Click the "Add" button for the chosen product
      log({ step: 'Adding to cart: ' + chosen.name, status: 'running' });

      // Find all Add buttons and click the one at the matching index
      const addButtons = page.locator(
        'button:has-text("Add"), span:has-text("Add"), div:text-is("Add"), ' +
        'button:has-text("ADD"), span:has-text("ADD"), div:text-is("ADD"), ' +
        '[class*="add-to-cart"], [class*="add-btn"], [class*="addButton"]'
      );
      const addBtn = addButtons.nth(chosen.index);
      if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(2000);
        await dismissPopups();
        addedItems.push({ name: chosen.name, price: chosen.priceText });
        log({ step: 'Added: ' + chosen.name + ' (' + chosen.priceText + ')', status: 'running' });
      } else {
        // Fallback: click first visible Add button
        const firstAdd = addButtons.first();
        if (await firstAdd.isVisible({ timeout: 2000 }).catch(() => false)) {
          await firstAdd.click();
          await page.waitForTimeout(2000);
          await dismissPopups();
          addedItems.push({ name: chosen.name, price: chosen.priceText });
          log({ step: 'Added: ' + chosen.name + ' (' + chosen.priceText + ')', status: 'running' });
        } else {
          log({ step: 'Could not find Add button for: ' + chosen.name, status: 'running' });
        }
      }

      // Clear search for next item
      const searchBoxClear = page.locator('input[placeholder="Search here"], input[placeholder*="search" i], input[type="search"]').first();
      if (await searchBoxClear.isVisible({ timeout: 1000 }).catch(() => false)) {
        await searchBoxClear.fill('');
      }
    }

    if (addedItems.length === 0) {
      log({ step: 'No items added to cart — exiting', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // ── Step 7: Review cart ─────────────────────────────────────
    log({ step: 'Reviewing cart...', status: 'running' });

    // Navigate to cart — look for cart icon/button
    const cartBtn = page.locator(
      'img[alt*="cart" i], [class*="cart-icon"], [class*="cart-btn"], ' +
      'a[href*="cart"], button:has-text("Cart"), button:has-text("View Cart"), ' +
      '[class*="basket"], [class*="checkout-bar"]'
    ).first();
    if (await cartBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cartBtn.click();
      await page.waitForTimeout(3000);
      await dismissPopups();
    }

    // Extract cart total
    const cartTotal = await page.evaluate(() => {
      const totalEl = document.querySelector(
        '[class*="total"], [class*="cart-total"], [class*="order-total"], ' +
        '[class*="grand-total"], [class*="subtotal"]'
      );
      if (totalEl) {
        const match = totalEl.textContent.match(/₹(\\d[\\d,]*)/);
        return match ? match[0] : totalEl.textContent.trim();
      }
      // Fallback: search page text for total
      const allText = document.body.innerText;
      const totalMatch = allText.match(/(?:Total|Subtotal|Grand Total)[^₹]*₹(\\d[\\d,]*)/i);
      return totalMatch ? '₹' + totalMatch[1] : 'Unknown';
    });

    const cartSummary = addedItems.map(i => i.name + ' ' + i.price).join('\\n');

    // ── Step 8: Confirm order ───────────────────────────────────
    const confirmResp = await requestFromHost({
      type: 'confirm_action',
      action: 'Place McDonald\\'s order',
      details: 'Items in cart:\\n' + cartSummary + '\\n\\nEstimated total: ' + cartTotal + '\\n\\nShall I proceed to checkout?',
    });
    if (!confirmResp.confirmed) {
      log({ step: 'Order cancelled by user', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // ── Step 9: Proceed to checkout ─────────────────────────────
    log({ step: 'Proceeding to checkout...', status: 'running' });
    const checkoutBtn = page.locator(
      'button:has-text("Checkout"), button:has-text("Place Order"), button:has-text("Proceed"), ' +
      'button:has-text("Continue"), a:has-text("Checkout"), a:has-text("Place Order"), ' +
      '[class*="checkout-btn"], [class*="place-order"]'
    ).first();
    if (await checkoutBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await checkoutBtn.click();
      await page.waitForTimeout(3000);
      await dismissPopups();
    }

    // ── Step 10: Payment pause — collect via ShofferAI ──────────
    // Re-extract total from checkout page
    const checkoutTotal = await page.evaluate(() => {
      const text = document.body.innerText;
      const match = text.match(/(?:Total|Pay|Amount)[^₹]*₹(\\d[\\d,]*)/i);
      return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
    });

    log({ step: 'Waiting for payment...', status: 'running' });
    const payResp = await requestFromHost({
      type: 'payment_required',
      action: 'Complete McDonald\\'s order payment',
      details: 'Items:\\n' + cartSummary + '\\nTotal: ₹' + (checkoutTotal || cartTotal),
      amountInr: checkoutTotal || 0,
      description: 'McDelivery order',
    });
    if (!payResp.confirmed) {
      log({ step: 'Payment cancelled', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // ── Step 11: Select payment method & complete ────────────────
    log({ step: 'Selecting payment method...', status: 'running' });
    // Look for COD / online payment options
    const codOption = page.locator(
      'button:has-text("Cash on Delivery"), button:has-text("COD"), ' +
      'label:has-text("Cash on Delivery"), label:has-text("COD"), ' +
      '[class*="cod"], [class*="cash-on-delivery"]'
    ).first();
    const onlinePayOption = page.locator(
      'button:has-text("Pay Online"), button:has-text("Online Payment"), ' +
      'label:has-text("Pay Online"), label:has-text("Online"), ' +
      '[class*="online-pay"], [class*="pay-online"]'
    ).first();

    // Prefer COD for operator flow
    if (await codOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await codOption.click();
      await page.waitForTimeout(1000);
    } else if (await onlinePayOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await onlinePayOption.click();
      await page.waitForTimeout(1000);
    }

    // Click final place order button
    const placeOrderBtn = page.locator(
      'button:has-text("Place Order"), button:has-text("Confirm Order"), ' +
      'button:has-text("Pay"), button:has-text("Complete Order"), ' +
      '[class*="place-order-btn"], [class*="confirm-order"]'
    ).first();
    if (await placeOrderBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const finalConfirm = await requestFromHost({
        type: 'confirm_action',
        action: 'Confirm final McDelivery order placement',
        details: 'About to click "Place Order". Total: ₹' + (checkoutTotal || cartTotal) + '. Proceed?',
      });
      if (finalConfirm.confirmed) {
        await placeOrderBtn.click();
        await page.waitForTimeout(5000);
        await dismissPopups();
      } else {
        log({ step: 'Final confirmation cancelled', status: 'completed' });
        log({ done: true, cancelled: true });
        await page.close();
        rl.close();
        return;
      }
    }

    // ── Step 12: Handle OTP if needed (for online payment) ──────
    const otpField = page.locator(
      'input[name*="otp" i], input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], ' +
      'input[placeholder*="OTP" i], input[placeholder*="verification" i]'
    ).first();
    if (await otpField.isVisible({ timeout: 5000 }).catch(() => false)) {
      const otpResp = await requestFromHost({
        type: 'input_required',
        question: 'Enter the OTP/verification code sent to your phone for payment:',
        inputType: 'otp',
      });
      if (otpResp.value) {
        await otpField.fill(otpResp.value);
        const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Verify"), button[type="submit"]').first();
        if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) await submitBtn.click();
        await page.waitForTimeout(5000);
      }
    }

    // ── Step 13: Confirmation ───────────────────────────────────
    await page.waitForTimeout(3000);
    const finalUrl = page.url();
    const finalTitle = await page.title();

    // Try to extract order ID / confirmation number
    const orderConfirmation = await page.evaluate(() => {
      const text = document.body.innerText;
      const orderIdMatch = text.match(/(?:Order\\s*(?:ID|No|Number|#))[:\\s]*([A-Z0-9-]+)/i);
      const confirmMatch = text.match(/(?:Confirmation|confirmed|placed|success)/i);
      return {
        orderId: orderIdMatch ? orderIdMatch[1] : null,
        isConfirmed: !!confirmMatch,
        pageText: text.substring(0, 500),
      };
    });

    if (orderConfirmation.orderId) {
      log({ step: 'Order placed! ID: ' + orderConfirmation.orderId, status: 'completed' });
    } else if (orderConfirmation.isConfirmed) {
      log({ step: 'Order confirmed on McDelivery!', status: 'completed' });
    } else {
      log({ step: 'McDelivery order flow completed', status: 'completed' });
    }

    log({
      message: 'McDonald\\'s order completed.\\nItems: ' + addedItems.map(i => i.name).join(', ') +
        (orderConfirmation.orderId ? '\\nOrder ID: ' + orderConfirmation.orderId : ''),
    });
    log({ done: true, url: finalUrl, title: finalTitle, orderId: orderConfirmation.orderId || null });

    await page.waitForTimeout(5000);

  } catch (err) {
    log({ step: 'Error: ' + err.message, status: 'failed' });
    log({ error: err.message });

    // Screenshot on failure for debugging
    try {
      const screenshotDir = path.join(os.homedir(), '.shofferai', 'screenshots');
      fs.mkdirSync(screenshotDir, { recursive: true });
      await page.screenshot({
        path: path.join(screenshotDir, 'mcdonalds-order-error-' + Date.now() + '.png'),
        fullPage: true,
      });
    } catch {}
  } finally {
    rl.close();
    await page.close();  // Close tab only — operator's Chrome stays running
  }
})();
`;

export const SKILL_ID = 'mcdonalds-order';
export const REQUIRED_PARAMS = [];
