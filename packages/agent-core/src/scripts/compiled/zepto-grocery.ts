/**
 * Order groceries from Zepto with 10-minute delivery — search items, add to cart, checkout, pay.
 *
 * Compiled with real selectors from live browsing on 2026-03-20.
 * Site: https://www.zeptonow.com (redirects to https://www.zepto.com)
 * Params: items (required), address (optional), payment_method (optional)
 *
 * Key selectors discovered:
 *   Search bar (homepage):     a[data-testid="search-bar-icon"] → /search
 *   Search input (search pg):  combobox[name="Search"] (role=combobox)
 *   Search URL pattern:        /search?query={term}
 *   Results heading:           h1 "Showing results for "{term}""
 *   Product cards:             a[href*="/pn/"] (each card is a link to product detail)
 *   ADD button:                button with text "ADD" inside product card
 *   Quantity controls:         After add: button "Decrease quantity" / qty text / button "Increase quantity"
 *   Cart button:               button[data-testid="cart-btn"] shows count when items in cart
 *   Cart panel:                [role="dialog"] (div, not native dialog)
 *   Pay button:                button "Click to Pay ₹{amount}" inside cart dialog
 *   Login detection:           span[data-testid="login-btn"] (logged out) vs span[data-testid="my-account"] (logged in)
 *   Login button:              button[aria-label="login"]
 *   Login modal:               dialog with textbox "Enter Phone Number" + button "Continue"
 *   Address display:           h3[data-testid="user-address"]
 *   Address modal:             button[aria-label="Select Location"] → modal with saved addresses + search
 *   Delivery time:             h2[data-testid="delivery-time"]
 *   Profile link:              a[href="/account"] with span[data-testid="my-account"]
 *   Product images:            img[src*="cdn.zeptonow.com"]
 *   Bill summary:              "Bill summary" → "Item Total" / "Handling Fee" / "Delivery Fee" / "To Pay"
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
  const items = (params.items || '').split(',').map(i => i.trim()).filter(Boolean);

  // Validate required params
  if (items.length === 0) {
    console.log(JSON.stringify({ error: 'Missing required param: items (comma-separated list of grocery items)' }));
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
    // ── Helper: dismiss popups ──────────────────────────────────
    const dismissPopups = async () => {
      try {
        const closeBtn = page.locator('button[aria-label="Location modal close Icon"]').first();
        if (await closeBtn.isVisible({ timeout: 1500 })) await closeBtn.click();
      } catch {}
      try {
        const cookieBtn = page.locator('button:has-text("Accept"), button:has-text("Got it")').first();
        if (await cookieBtn.isVisible({ timeout: 1000 })) await cookieBtn.click();
      } catch {}
    };

    // ── Step 1: Navigate to Zepto ─────────────────────────────
    log({ step: 'Opening Zepto...', status: 'running' });
    await page.goto('https://www.zeptonow.com');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await dismissPopups();

    // ── Step 2: Verify login ────────────────────────────────────
    log({ step: 'Checking login status...', status: 'running' });

    // Logged in: span[data-testid="my-account"] visible with text "profile"
    // Logged out: span[data-testid="login-btn"] visible with text "login"
    const myAccountEl = page.locator('[data-testid="my-account"]');
    const isLoggedIn = await myAccountEl.isVisible({ timeout: 3000 }).catch(() => false);

    if (!isLoggedIn) {
      log({ step: 'Not logged in — attempting sign-in with operator phone...', status: 'running' });

      // Click login button: button[aria-label="login"]
      const loginBtn = page.locator('button[aria-label="login"]').first();
      if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await loginBtn.click();
        await page.waitForTimeout(2000);
      }

      // Enter operator phone in the login dialog
      const phoneInput = page.getByPlaceholder('Enter Phone Number');
      if (await phoneInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await phoneInput.fill('8109137158');
        await page.waitForTimeout(500);

        // Click Continue
        const continueBtn = page.locator('dialog button:has-text("Continue"), [role="dialog"] button:has-text("Continue")').first();
        if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await continueBtn.click();
          await page.waitForTimeout(3000);
        }

        // Handle OTP — request from operator
        const otpInput = page.locator('input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], input[name="otp"]').first();
        if (await otpInput.isVisible({ timeout: 5000 }).catch(() => false)) {
          const otpResp = await requestFromHost({
            type: 'input_required',
            question: 'Enter the OTP sent to operator phone 8109137158:',
            inputType: 'otp',
          });
          if (otpResp.value) {
            await otpInput.fill(otpResp.value);
            await page.waitForTimeout(1000);
            const verifyBtn = page.locator('button:has-text("Verify"), button:has-text("Submit"), button[type="submit"]').first();
            if (await verifyBtn.isVisible({ timeout: 2000 }).catch(() => false)) await verifyBtn.click();
            await page.waitForTimeout(3000);
          }
        }
      } else {
        log({ error: 'Session expired. Please re-login manually in Chrome Debug (Profile 3).' });
        await page.close();
        rl.close();
        return;
      }
    }

    // ── Step 2b: Verify delivery location ───────────────────────
    log({ step: 'Verifying delivery location...', status: 'running' });
    const addressEl = page.locator('[data-testid="user-address"]');
    const addressText = await addressEl.textContent().catch(() => '');

    if (!addressText || addressText.includes('Select Location')) {
      log({ step: 'No delivery location set — requesting address...', status: 'running' });

      // If address param provided, use it; otherwise ask user
      let addressToSet = params.address;
      if (!addressToSet) {
        const addrResp = await requestFromHost({
          type: 'input_required',
          question: 'Zepto needs a delivery address. Please enter your area or full address:',
          inputType: 'freetext',
        });
        addressToSet = addrResp.value;
      }

      if (addressToSet) {
        // Click Select Location to open address modal
        const locBtn = page.locator('button[aria-label="Select Location"]').first();
        if (await locBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await locBtn.click();
          await page.waitForTimeout(2000);
        }

        // Type in the address search input
        const locInput = page.getByPlaceholder('Search a new address');
        if (await locInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await locInput.fill(addressToSet);
          await page.waitForTimeout(2000);
          // Click first suggestion
          const suggestion = page.locator('[role="dialog"] [class*="suggestion"], [role="dialog"] li, [role="dialog"] button:has-text("' + addressToSet.split(' ')[0] + '")').first();
          if (await suggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
            await suggestion.click();
            await page.waitForTimeout(2000);
          }
        }
      }
    }

    // Verify location is now set (header shows address + delivery time)
    const deliveryTimeEl = page.locator('[data-testid="delivery-time"]');
    const hasLocation = await deliveryTimeEl.isVisible({ timeout: 3000 }).catch(() => false);
    if (!hasLocation) {
      log({ step: 'Warning: delivery location may not be set correctly', status: 'running' });
    }

    // ── Step 3: Search & Add Items ──────────────────────────────
    const cartItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      log({ step: 'Searching for: ' + item + ' (' + (i + 1) + '/' + items.length + ')', status: 'running' });

      // Navigate directly to search results URL
      await page.goto('https://www.zepto.com/search?query=' + encodeURIComponent(item));
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Wait for product cards: a[href*="/pn/"]
      const productCards = page.locator('a[href*="/pn/"]');
      const cardCount = await productCards.count().catch(() => 0);

      if (cardCount === 0) {
        log({ step: 'No results for: ' + item, status: 'running' });
        const noResultResp = await requestFromHost({
          type: 'input_required',
          question: 'No results found for "' + item + '". Would you like to try a different search term? (type new term or "skip")',
          inputType: 'freetext',
        });
        if (noResultResp.value && noResultResp.value.toLowerCase() !== 'skip') {
          await page.goto('https://www.zepto.com/search?query=' + encodeURIComponent(noResultResp.value));
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(2000);
        } else {
          continue;
        }
      }

      // Extract product info from visible cards
      const products = await page.evaluate(() => {
        const cards = document.querySelectorAll('a[href*="/pn/"]');
        return Array.from(cards).slice(0, 8).map((card, idx) => {
          // Product name: longest text node that isn't price/delivery/discount
          const spans = Array.from(card.querySelectorAll('span, div'));
          const texts = spans.map(s => s.textContent?.trim()).filter(Boolean);
          const name = texts.find(t => t.length > 8 && !t.startsWith('₹') && !t.includes('mins') && !t.includes('ADD') && !t.includes('OFF') && !t.includes('Buy Again') && !t.includes('Premium'));
          const weight = texts.find(t => /^\\d+\\s*(pc|pack|x)\\s*\\(/.test(t) || /^\\d+\\s*(ml|g|kg|L)$/.test(t));
          const priceText = texts.find(t => /^₹\\d+$/.test(t));
          const rating = texts.find(t => /^\\d\\.\\d$/.test(t));
          return {
            idx: idx + 1,
            name: name || 'Unknown',
            weight: weight || '',
            price: priceText || '',
            rating: rating || '',
          };
        }).filter(p => p.name !== 'Unknown');
      });

      if (products.length === 0) {
        log({ step: 'Could not parse products for: ' + item, status: 'running' });
        continue;
      }

      // If multiple results, ask user to pick
      let selectedIdx = 0;
      if (products.length > 1) {
        const options = products.map(p =>
          p.idx + '. ' + p.name + (p.weight ? ' (' + p.weight + ')' : '') + ' — ' + p.price + (p.rating ? ' ★' + p.rating : '')
        ).join('\\n');

        const choiceResp = await requestFromHost({
          type: 'input_required',
          question: 'Found ' + products.length + ' options for "' + item + '":\\n' + options + '\\nWhich one? (enter number)',
          inputType: 'choice',
        });

        const choiceNum = parseInt(choiceResp.value || '1');
        selectedIdx = (!isNaN(choiceNum) && choiceNum >= 1 && choiceNum <= products.length) ? choiceNum - 1 : 0;
      }

      const selected = products[selectedIdx];
      log({ step: 'Adding: ' + selected.name + ' ' + selected.weight + ' ' + selected.price, status: 'running' });

      // Find and click the ADD button on the selected product card
      const targetCard = productCards.nth(selectedIdx);
      const addBtn = targetCard.locator('button:has-text("ADD")').first();
      if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(1000);
        cartItems.push(selected);
      } else {
        log({ step: 'Could not find ADD button for: ' + selected.name, status: 'running' });
      }
    }

    if (cartItems.length === 0) {
      log({ step: 'No items added to cart', status: 'completed' });
      log({ done: true, cancelled: true, message: 'No items could be added to cart' });
      await page.close();
      rl.close();
      return;
    }

    // ── Step 4: Open Cart & Review ──────────────────────────────
    log({ step: 'Opening cart...', status: 'running' });

    // Click cart button: button[data-testid="cart-btn"]
    const cartBtn = page.locator('[data-testid="cart-btn"]').first();
    if (await cartBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cartBtn.click();
      await page.waitForTimeout(2000);
    }

    // Extract cart details from the dialog ([role="dialog"])
    const cartDetails = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;

      const allText = dialog.textContent || '';

      // Extract bill fields by finding button text + sibling value
      const buttons = Array.from(dialog.querySelectorAll('button'));
      const getValue = (label) => {
        const btn = buttons.find(b => b.textContent?.trim().startsWith(label));
        if (!btn) return null;
        const sibling = btn.parentElement;
        if (!sibling) return null;
        const priceSpans = Array.from(sibling.querySelectorAll('span, div')).filter(s => /^₹\\d+/.test(s.textContent?.trim()));
        // Last price span is the final value (after discounts)
        return priceSpans.length > 0 ? priceSpans[priceSpans.length - 1].textContent?.trim() : null;
      };

      const itemTotal = getValue('Item Total');
      const handlingFee = getValue('Handling Fee');
      const deliveryFee = getValue('Delivery Fee');
      const toPay = getValue('To Pay');

      // Extract delivery info
      const deliveryParagraphs = Array.from(dialog.querySelectorAll('p'));
      const deliveryTime = deliveryParagraphs.find(p => /Delivery in \\d+/.test(p.textContent))?.textContent?.trim();

      // Extract address from banner
      const banner = dialog.querySelector('[role="banner"]');
      const address = banner ? banner.textContent?.replace(/Back Icon/g, '').trim() : '';

      // Free delivery threshold
      const freeDeliveryText = deliveryParagraphs.find(p => p.textContent?.includes('free delivery'))?.textContent?.trim();

      return {
        itemTotal: itemTotal || 'N/A',
        handlingFee: handlingFee || 'FREE',
        deliveryFee: deliveryFee || '₹0',
        toPay: toPay || 'N/A',
        deliveryTime: deliveryTime || 'N/A',
        address: address || 'N/A',
        freeDeliveryText: freeDeliveryText || '',
      };
    });

    // Present cart summary for confirmation
    const cartSummary = cartItems.map(i => i.name + (i.weight ? ' (' + i.weight + ')' : '') + ' — ' + i.price).join('\\n');
    const billSummary = cartDetails
      ? '\\n\\nBill Summary:\\n' +
        'Item Total: ' + cartDetails.itemTotal + '\\n' +
        'Handling Fee: ' + cartDetails.handlingFee + '\\n' +
        'Delivery Fee: ' + cartDetails.deliveryFee + '\\n' +
        (cartDetails.freeDeliveryText ? '(' + cartDetails.freeDeliveryText + ')\\n' : '') +
        'To Pay: ' + cartDetails.toPay + '\\n' +
        '\\nDelivery: ' + (cartDetails.deliveryTime || 'N/A') +
        '\\nAddress: ' + (cartDetails.address || 'N/A')
      : '';

    const confirmResp = await requestFromHost({
      type: 'confirm_action',
      action: 'Confirm Zepto grocery order',
      details: 'Cart items:\\n' + cartSummary + billSummary,
    });

    if (!confirmResp.confirmed) {
      log({ step: 'Order cancelled by user', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // ── Step 5: Proceed to Payment ──────────────────────────────
    log({ step: 'Proceeding to payment...', status: 'running' });

    // Extract total amount for payment
    const totalAmount = cartDetails?.toPay ? parseInt(cartDetails.toPay.replace('₹', '').replace(',', '')) : 0;

    const payResp = await requestFromHost({
      type: 'payment_required',
      action: 'Complete Zepto grocery order',
      details: JSON.stringify({
        items: cartItems.map(i => ({ name: i.name, weight: i.weight, price: i.price })),
        itemTotal: cartDetails?.itemTotal,
        handlingFee: cartDetails?.handlingFee,
        deliveryFee: cartDetails?.deliveryFee,
        toPay: cartDetails?.toPay,
        deliveryTime: cartDetails?.deliveryTime,
        address: cartDetails?.address,
      }),
      amountInr: totalAmount,
      description: 'Zepto grocery order — ' + cartItems.length + ' items',
    });

    if (!payResp.confirmed) {
      log({ step: 'Payment cancelled', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // Click "Click to Pay ₹X" button in the cart dialog
    const payBtn = page.locator('[role="dialog"] button:has-text("Click to Pay")').first();
    if (await payBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await payBtn.click();
      await page.waitForTimeout(3000);
    }

    // ── Step 6: Handle Payment OTP if needed ────────────────────
    const otpField = page.locator('input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], input[name="otp"], input[placeholder*="OTP" i]').first();
    if (await otpField.isVisible({ timeout: 5000 }).catch(() => false)) {
      const otpResp = await requestFromHost({
        type: 'input_required',
        question: 'Enter the payment OTP/verification code:',
        inputType: 'otp',
      });
      if (otpResp.value) {
        await otpField.fill(otpResp.value);
        const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Verify"), button:has-text("Pay"), button[type="submit"]').first();
        if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) await submitBtn.click();
        await page.waitForTimeout(5000);
      }
    }

    // ── Step 7: Confirmation ────────────────────────────────────
    await page.waitForTimeout(3000);
    const finalUrl = page.url();
    const finalTitle = await page.title();

    // Try to extract order confirmation details
    const orderDetails = await page.evaluate(() => {
      const body = document.body.textContent || '';
      const orderId = body.match(/order\\s*(?:id|#|number)?\\s*[:.]?\\s*(\\w{5,})/i)?.[1];
      const eta = body.match(/(?:arriving|delivery|estimated|delivered).*?(\\d+\\s*(?:min|hour|minute)s?)/i)?.[1];
      return { orderId, eta };
    });

    log({ step: 'Zepto order placed successfully!', status: 'completed' });
    log({
      message: 'Order placed on Zepto!' +
        (orderDetails.orderId ? ' Order ID: ' + orderDetails.orderId : '') +
        (orderDetails.eta ? ' ETA: ' + orderDetails.eta : '') +
        ' Items: ' + cartItems.map(i => i.name).join(', ') +
        ' Total: ' + (cartDetails?.toPay || 'N/A'),
    });
    log({ done: true, url: finalUrl, title: finalTitle });

    await page.waitForTimeout(3000);

  } catch (err) {
    log({ step: 'Error: ' + err.message, status: 'failed' });
    log({ error: err.message });

    // Screenshot on failure for debugging
    try {
      const screenshotDir = path.join(os.homedir(), '.shofferai', 'screenshots');
      fs.mkdirSync(screenshotDir, { recursive: true });
      await page.screenshot({
        path: path.join(screenshotDir, 'zepto-grocery-error-' + Date.now() + '.png'),
        fullPage: true,
      });
    } catch {}
  } finally {
    rl.close();
    await page.close();  // Close tab only — operator's Chrome stays running
  }
})();
`;

export const SKILL_ID = 'zepto-grocery';
export const REQUIRED_PARAMS = ['items'];
