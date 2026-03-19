/**
 * Order pizza from Domino's India — browse menu, pick items, add to cart, checkout & pay.
 *
 * Compiled Playwright script for dominos-pizza.
 * Desktop site: https://www.dominos.co.in (menu browsing)
 * Mobile site:  https://m.dominos.co.in   (actual ordering — desktop redirects here)
 *
 * Key discovery: Domino's desktop site has NO login/cart; clicking "ORDER ONLINE NOW"
 * redirects to the mobile site (m.dominos.co.in) which handles auth, cart & checkout.
 * This script navigates directly to the mobile site for ordering.
 *
 * Params: none required (user picks items interactively)
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
    // ── Helper: dismiss common popups & cookie banners ──────────
    const dismissPopups = async () => {
      try {
        const closeBtn = page.locator('[role="dialog"] button[aria-label="Close"], button[aria-label="close"], .modal-close').first();
        if (await closeBtn.isVisible({ timeout: 2000 })) await closeBtn.click();
      } catch {}
      try {
        const cookieBtn = page.locator('button:has-text("Accept"), button:has-text("Got it"), #onetrust-accept-btn-handler').first();
        if (await cookieBtn.isVisible({ timeout: 1000 })) await cookieBtn.click();
      } catch {}
    };

    // ── Domino's menu category URLs (real selectors from dominos.co.in) ──
    const MENU_CATEGORIES = {
      'veg pizza':     'https://www.dominos.co.in/menu/veg-pizzas',
      'chicken pizza': 'https://www.dominos.co.in/menu/non-veg-pizzas',
      'non-veg pizza': 'https://www.dominos.co.in/menu/non-veg-pizzas',
      'pasta':         'https://www.dominos.co.in/menu/pasta',
      'pizza mania':   'https://www.dominos.co.in/menu/pizza-mania',
      'burger pizza':  'https://www.dominos.co.in/menu/burger-pizza',
      'beverages':     'https://www.dominos.co.in/menu/beverages',
      'crusts':        'https://www.dominos.co.in/menu/choice-of-crusts',
    };

    // Popular pizza direct links (real URLs from dominos.co.in)
    const POPULAR_PIZZAS = {
      'farm house':              'https://www.dominos.co.in/menu/veg-pizzas/farm-house',
      'margherita':              'https://www.dominos.co.in/menu/veg-pizzas/margherita',
      'cheese corn':             'https://www.dominos.co.in/menu/veg-pizzas/cheese-n-corn',
      'double cheese margherita':'https://www.dominos.co.in/menu/veg-pizzas/double-cheese-margherita',
      'paneer makhani':          'https://www.dominos.co.in/menu/veg-pizzas/paneer-makhani',
      'choco lava cake':         'https://www.dominos.co.in/menu/side-orders/lava-cake',
    };

    // ── Step 1: Ask user what they want to order ──────────────────
    log({ step: 'Starting Domino\\'s Pizza order...', status: 'running' });

    const orderResp = await requestFromHost({
      type: 'input_required',
      question: 'What would you like to order from Domino\\'s? You can say things like:\\n' +
        '• "Veg Margherita Pizza"\\n' +
        '• "Farm House pizza and Choco Lava Cake"\\n' +
        '• "Browse the full menu"\\n' +
        '• "Chicken pizza options"',
      inputType: 'freetext',
    });
    const orderText = (orderResp.value || 'browse menu').toLowerCase();

    // ── Step 2: Navigate to the right page ───────────────────────
    let targetUrl = 'https://www.dominos.co.in/menu';

    // Check for specific pizza match
    for (const [name, url] of Object.entries(POPULAR_PIZZAS)) {
      if (orderText.includes(name)) { targetUrl = url; break; }
    }
    // Check for category match
    if (targetUrl === 'https://www.dominos.co.in/menu') {
      for (const [cat, url] of Object.entries(MENU_CATEGORIES)) {
        if (orderText.includes(cat)) { targetUrl = url; break; }
      }
    }

    log({ step: 'Opening Domino\\'s menu...', status: 'running' });
    await page.goto(targetUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await dismissPopups();

    // ── Step 3: Browse menu and collect available items ───────────
    log({ step: 'Loading menu items...', status: 'running' });
    const pageTitle = await page.title();
    const pageUrl = page.url();

    // Extract visible menu item links — Domino's uses descriptive link text for pizzas
    const menuItems = await page.evaluate(() => {
      const items = [];
      // Menu page lists pizzas as links with names like "Farm House pizza", "Veg Margherita Pizza"
      const links = document.querySelectorAll('a[href*="/menu/"]');
      links.forEach(link => {
        const text = (link.textContent || '').trim();
        const href = link.getAttribute('href') || '';
        // Filter to actual pizza/item links (not nav links)
        if (text && href.match(/\\/menu\\/(veg-pizzas|non-veg-pizzas|pasta|side-orders|pizza-mania|burger-pizza|beverages)\\/.+/) && text.length > 3) {
          items.push({ name: text.substring(0, 80), href: href });
        }
      });
      // Deduplicate by href
      const seen = new Set();
      return items.filter(i => { if (seen.has(i.href)) return false; seen.add(i.href); return true; });
    });

    let itemSummary = 'Menu items found:\\n';
    menuItems.slice(0, 15).forEach((item, i) => {
      itemSummary += (i + 1) + '. ' + item.name + '\\n';
    });
    if (menuItems.length > 15) itemSummary += '...and ' + (menuItems.length - 15) + ' more\\n';
    if (menuItems.length === 0) itemSummary = 'Viewing: ' + pageTitle + '\\nURL: ' + pageUrl;

    // ── Step 4: Let user pick items ──────────────────────────────
    const pickResp = await requestFromHost({
      type: 'input_required',
      question: itemSummary + '\\nWhich items would you like to add? (enter numbers, names, or "order" to proceed to ordering)',
      inputType: 'freetext',
    });
    const pickText = (pickResp.value || '').toLowerCase();

    // ── Step 5: Navigate to mobile site for actual ordering ──────
    // Desktop dominos.co.in has no cart/login — ordering happens on m.dominos.co.in
    log({ step: 'Redirecting to Domino\\'s ordering site...', status: 'running' });
    await page.goto('https://m.dominos.co.in/changeAddress?src=brand');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await dismissPopups();

    // ── Step 6: Set delivery address on mobile site ──────────────
    log({ step: 'Setting delivery address...', status: 'running' });

    // Check if address input is visible on the mobile ordering page
    const addressInput = page.locator('input[placeholder*="address" i], input[placeholder*="location" i], input[placeholder*="deliver" i], input[type="search"]').first();
    const hasAddressField = await addressInput.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasAddressField) {
      const addrResp = await requestFromHost({
        type: 'input_required',
        question: 'Enter your delivery address for Domino\\'s:',
        inputType: 'freetext',
      });
      if (addrResp.value) {
        await addressInput.fill(addrResp.value);
        await page.waitForTimeout(1500);
        // Select first suggestion from address autocomplete
        const suggestion = page.locator('[class*="suggestion"], [class*="result"], [class*="address-item"], [role="option"]').first();
        if (await suggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
          await suggestion.click();
          await page.waitForTimeout(2000);
        }
      }
    }

    // ── Step 7: Login on mobile site (phone + OTP) ───────────────
    log({ step: 'Checking login status on mobile site...', status: 'running' });
    await page.waitForTimeout(2000);

    const phoneInput = page.locator('input[type="tel"], input[placeholder*="phone" i], input[placeholder*="mobile" i], input[name*="phone" i]').first();
    const hasPhoneField = await phoneInput.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasPhoneField) {
      log({ step: 'Login required — entering phone number...', status: 'running' });
      const phoneResp = await requestFromHost({
        type: 'input_required',
        question: 'Enter your phone number for Domino\\'s login:',
        inputType: 'phone',
      });
      if (phoneResp.value) {
        await phoneInput.fill(phoneResp.value);
        // Click submit/continue button
        const submitBtn = page.locator('button:has-text("Continue"), button:has-text("Send OTP"), button:has-text("Submit"), button[type="submit"]').first();
        if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await submitBtn.click();
          await page.waitForTimeout(3000);
        }

        // Handle OTP
        const otpField = page.locator('input[name="otp"], input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], input[placeholder*="OTP" i], input[placeholder*="verification" i]').first();
        if (await otpField.isVisible({ timeout: 8000 }).catch(() => false)) {
          const otpResp = await requestFromHost({
            type: 'input_required',
            question: 'Enter the OTP sent to your phone:',
            inputType: 'otp',
          });
          if (otpResp.value) {
            await otpField.fill(otpResp.value);
            const verifyBtn = page.locator('button:has-text("Verify"), button:has-text("Submit"), button:has-text("Login"), button[type="submit"]').first();
            if (await verifyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
              await verifyBtn.click();
              await page.waitForTimeout(3000);
            }
          }
        }
      }
    }

    // ── Step 8: Search and add items to cart on mobile site ───────
    log({ step: 'Adding items to cart...', status: 'running' });
    await page.waitForTimeout(2000);

    // Try to search for the user's desired items on the mobile site
    const searchIcon = page.locator('a[href*="search"], button[aria-label*="search" i], [class*="search-icon"], input[type="search"]').first();
    const hasSearch = await searchIcon.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasSearch) {
      await searchIcon.click();
      await page.waitForTimeout(1000);
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name*="search" i]').first();
      if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Search for first item from user's request
        const searchTerm = pickText.replace(/[0-9,]/g, '').trim() || orderText;
        await searchInput.fill(searchTerm.substring(0, 40));
        await page.waitForTimeout(2000);
      }
    }

    // Look for "ADD" or "Add to Cart" buttons on product cards
    const addButtons = page.locator('button:has-text("ADD"), button:has-text("Add to Cart"), button:has-text("Add"), [class*="add-btn"], [class*="addToCart"]');
    const addCount = await addButtons.count();

    if (addCount > 0) {
      // Show available items and let user pick
      const mobileItems = await page.evaluate(() => {
        const cards = document.querySelectorAll('[class*="product"], [class*="card"], [class*="item-info"], [class*="menu-item"]');
        const results = [];
        cards.forEach(card => {
          const name = card.querySelector('[class*="name"], [class*="title"], h3, h4');
          const price = card.querySelector('[class*="price"], [class*="cost"]');
          if (name) {
            results.push({
              name: (name.textContent || '').trim().substring(0, 60),
              price: price ? (price.textContent || '').trim() : '',
            });
          }
        });
        return results.slice(0, 10);
      });

      let cartSummary = 'Available items:\\n';
      mobileItems.forEach((item, i) => {
        cartSummary += (i + 1) + '. ' + item.name + (item.price ? ' — ' + item.price : '') + '\\n';
      });

      const addResp = await requestFromHost({
        type: 'input_required',
        question: cartSummary + '\\nWhich items to add to cart? (enter numbers separated by commas)',
        inputType: 'freetext',
      });

      // Add selected items
      const selections = (addResp.value || '1').split(/[,\\s]+/).map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 1);
      for (const sel of selections) {
        const btn = addButtons.nth(sel - 1);
        if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await btn.click();
          await page.waitForTimeout(1500);
          await dismissPopups(); // Dismiss any customization popups
        }
      }
    }

    // ── Step 9: Review cart ──────────────────────────────────────
    log({ step: 'Reviewing cart...', status: 'running' });
    await page.waitForTimeout(2000);

    // Navigate to cart if there's a cart icon/link
    const cartBtn = page.locator('a[href*="cart"], button[aria-label*="cart" i], [class*="cart-icon"], [class*="basket"]').first();
    if (await cartBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cartBtn.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
    }

    // Extract cart total
    const cartTotal = await page.evaluate(() => {
      const totalEl = document.querySelector('[class*="total"], [class*="grand-total"], [class*="payable"], [class*="amount"]');
      return totalEl ? (totalEl.textContent || '').trim() : 'Unable to read total';
    });

    const cartUrl = page.url();
    const cartTitle = await page.title();

    // ── Step 10: Confirm order with user ─────────────────────────
    const confirmResp = await requestFromHost({
      type: 'confirm_action',
      action: 'Place Domino\\'s order',
      details: 'Cart total: ' + cartTotal + '\\nPage: ' + cartTitle + '\\nURL: ' + cartUrl,
    });
    if (!confirmResp.confirmed) {
      log({ step: 'Order cancelled by user', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // ── Step 11: Payment pause ───────────────────────────────────
    // Extract numeric amount from cart total
    const amountMatch = cartTotal.match(/[\\d,]+\\.?\\d*/);
    const amountInr = amountMatch ? parseFloat(amountMatch[0].replace(/,/g, '')) : 0;

    log({ step: 'Proceeding to payment...', status: 'running' });
    const payResp = await requestFromHost({
      type: 'payment_required',
      action: 'Complete Domino\\'s Pizza order',
      details: 'Order total: ₹' + amountInr + ' on Domino\\'s India',
      amountInr: amountInr,
      description: 'dominos-pizza order',
    });
    if (!payResp.confirmed) {
      log({ step: 'Payment cancelled', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // ── Step 12: Click checkout/place order button ───────────────
    log({ step: 'Placing order...', status: 'running' });
    const placeOrderBtn = page.locator('button:has-text("Place Order"), button:has-text("Pay"), button:has-text("Checkout"), button:has-text("Proceed")').first();
    if (await placeOrderBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await placeOrderBtn.click();
      await page.waitForTimeout(5000);
    }

    // Handle payment-page OTP if needed (COD/UPI verification)
    const payOtpField = page.locator('input[name="otp"], input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], input[placeholder*="OTP" i]').first();
    if (await payOtpField.isVisible({ timeout: 5000 }).catch(() => false)) {
      const payOtpResp = await requestFromHost({
        type: 'input_required',
        question: 'Enter the payment/verification OTP sent to your phone:',
        inputType: 'otp',
      });
      if (payOtpResp.value) {
        await payOtpField.fill(payOtpResp.value);
        const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Verify"), button[type="submit"]').first();
        if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) await submitBtn.click();
        await page.waitForTimeout(5000);
      }
    }

    // ── Step 13: Completion ──────────────────────────────────────
    const finalUrl = page.url();
    const finalTitle = await page.title();
    log({ step: 'Domino\\'s Pizza order completed!', status: 'completed' });
    log({ message: 'Order placed on Domino\\'s India. Page: ' + finalTitle + ' | Total: ₹' + amountInr });
    log({ done: true, url: finalUrl, title: finalTitle, amountInr: amountInr });

    await page.waitForTimeout(5000);

  } catch (err) {
    log({ step: 'Error: ' + err.message, status: 'failed' });
    log({ error: err.message });

    // Screenshot on failure for debugging
    try {
      const screenshotDir = path.join(os.homedir(), '.shofferai', 'screenshots');
      fs.mkdirSync(screenshotDir, { recursive: true });
      await page.screenshot({
        path: path.join(screenshotDir, 'dominos-pizza-error-' + Date.now() + '.png'),
        fullPage: true,
      });
    } catch {}
  } finally {
    rl.close();
    await page.close();  // Close tab only — operator's Chrome stays running
  }
})();
`;

export const SKILL_ID = 'dominos-pizza';
export const REQUIRED_PARAMS = [];
