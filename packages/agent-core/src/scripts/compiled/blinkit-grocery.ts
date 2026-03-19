/**
 * Order groceries from Blinkit with 10-minute delivery — search items, add to cart, checkout, pay.
 *
 * Compiled with real selectors from live browsing on 2026-03-19.
 * Site: https://blinkit.com
 * Params: items (required), address (optional), payment_method (optional)
 *
 * Key selectors discovered:
 *   Search link (homepage):   a[href="/s/"]
 *   Search input:             input[placeholder*="Search for"] / [class*="SearchBarContainer__Input"]
 *   Search container:         [class*="SearchBarContainer__Container"]
 *   Product cards:            div[role="button"][id][data-pf] (id = numeric product ID)
 *   ADD button:               div[role="button"] with text "ADD" inside product card
 *   Quantity controls:        -/count/+ buttons replace ADD after adding
 *   Cart button:              [class*="CartButton__Button"] shows "X items ₹Y"
 *   Cart panel:               .ReactModalPortal (right sidebar)
 *   Proceed to Pay:           div with text "Proceed To Pay" at bottom of cart panel
 *   Header:                   div[role="banner"] / [class*="Header__HeaderContainer"]
 *   Account (logged in):      div with text "Account" in header
 *   Location:                 Clickable div in header showing address + "Delivery in X minutes"
 *   Product images:           img[src*="cdn.grofers.com"]
 *   Bill details:             "Items total", "Delivery charge", "Handling charge", "Small cart charge", "Grand total"
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
        // Location modal close
        const modalClose = page.locator('.ReactModalPortal button[aria-label="close"], .ReactModalPortal button[aria-label="Close"]').first();
        if (await modalClose.isVisible({ timeout: 1500 })) await modalClose.click();
      } catch {}
      try {
        // Cookie/notification banners
        const cookieBtn = page.locator('button:has-text("Accept"), button:has-text("Got it")').first();
        if (await cookieBtn.isVisible({ timeout: 1000 })) await cookieBtn.click();
      } catch {}
    };

    // ── Step 1: Navigate to Blinkit ─────────────────────────────
    log({ step: 'Opening Blinkit...', status: 'running' });
    await page.goto('https://blinkit.com');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await dismissPopups();

    // ── Step 2: Verify login ────────────────────────────────────
    log({ step: 'Checking login status...', status: 'running' });

    // Check for "Account" text in header (present when logged in)
    const accountEl = page.locator('div[role="banner"]').getByText('Account');
    const isLoggedIn = await accountEl.isVisible({ timeout: 3000 }).catch(() => false);

    if (!isLoggedIn) {
      log({ step: 'Not logged in — attempting sign-in with operator phone...', status: 'running' });

      // Look for Login button in header
      const loginBtn = page.locator('div[role="banner"]').getByText(/login|sign in/i).first();
      if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await loginBtn.click();
        await page.waitForTimeout(2000);
      }

      // Enter operator phone number
      const phoneInput = page.locator('input[type="tel"], input[placeholder*="phone" i]').first();
      if (await phoneInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await phoneInput.fill('8109137158');
        await page.waitForTimeout(500);

        // Click continue/submit
        const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Send OTP"), button[type="submit"]').first();
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

    // Verify delivery location is set (header shows delivery time)
    log({ step: 'Verifying delivery location...', status: 'running' });
    const deliveryTimeEl = page.locator('div[role="banner"]').getByText(/Delivery in/);
    const hasLocation = await deliveryTimeEl.isVisible({ timeout: 3000 }).catch(() => false);
    if (!hasLocation) {
      log({ step: 'No delivery location set — requesting address...', status: 'running' });
      const addrResp = await requestFromHost({
        type: 'input_required',
        question: 'Blinkit needs a delivery address. Please enter your area or full address:',
        inputType: 'freetext',
      });
      if (addrResp.value) {
        // Click location selector in header to open location modal
        const locationDiv = page.locator('div[role="banner"]').getByText('Home').first();
        if (await locationDiv.isVisible({ timeout: 2000 }).catch(() => false)) {
          await locationDiv.click();
          await page.waitForTimeout(2000);
        }
        // Type in location search
        const locInput = page.locator('input[placeholder*="search" i], input[placeholder*="area" i], input[placeholder*="location" i]').first();
        if (await locInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await locInput.fill(addrResp.value);
          await page.waitForTimeout(2000);
          // Click first suggestion
          const suggestion = page.locator('.ReactModalPortal div[role="button"], .ReactModalPortal li').first();
          if (await suggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
            await suggestion.click();
            await page.waitForTimeout(2000);
          }
        }
      }
    }

    // ── Step 3: Search & Add Items ──────────────────────────────
    const cartItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      log({ step: 'Searching for: ' + item + ' (' + (i + 1) + '/' + items.length + ')', status: 'running' });

      // Navigate directly to search results URL
      await page.goto('https://blinkit.com/s/?q=' + encodeURIComponent(item));
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Wait for product cards to load: div[role="button"][id][data-pf]
      const productCards = page.locator('div[role="button"][data-pf="reset"]');
      const cardCount = await productCards.count().catch(() => 0);

      if (cardCount === 0) {
        log({ step: 'No results for: ' + item, status: 'running' });
        const noResultResp = await requestFromHost({
          type: 'input_required',
          question: 'No results found for "' + item + '". Would you like to try a different search term? (type new term or "skip")',
          inputType: 'freetext',
        });
        if (noResultResp.value && noResultResp.value.toLowerCase() !== 'skip') {
          await page.goto('https://blinkit.com/s/?q=' + encodeURIComponent(noResultResp.value));
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(2000);
        } else {
          continue;
        }
      }

      // Extract product info from visible cards
      const products = await page.evaluate(() => {
        const cards = document.querySelectorAll('div[role="button"][data-pf="reset"]');
        return Array.from(cards).slice(0, 8).map((card, idx) => {
          const texts = Array.from(card.querySelectorAll('div')).map(d => d.textContent?.trim()).filter(Boolean);
          const name = texts.find(t => t.length > 5 && !t.includes('₹') && !t.includes('mins') && !t.includes('ADD') && !t.includes('OFF'));
          const weight = texts.find(t => /^\\d+\\s*(ml|g|kg|ltr|pcs|pack|x)/.test(t));
          const priceText = texts.find(t => /^₹\\d+$/.test(t));
          const discountText = texts.find(t => /\\d+% OFF/.test(t));
          return {
            idx: idx + 1,
            id: card.id,
            name: name || 'Unknown',
            weight: weight || '',
            price: priceText || '',
            discount: discountText || '',
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
          p.idx + '. ' + p.name + ' (' + p.weight + ') — ' + p.price + (p.discount ? ' ' + p.discount : '')
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
      const addBtn = targetCard.locator('div[role="button"]:has-text("ADD")').first();
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

    // Click cart button in header: [class*="CartButton__Button"]
    const cartBtn = page.locator('[class*="CartButton__Button"], [class*="CartButton__Container"]').first();
    if (await cartBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cartBtn.click();
      await page.waitForTimeout(2000);
    } else {
      // Fallback: click the cart area in header showing item count
      const cartArea = page.locator('div[role="banner"]').getByText(/items?.*₹/).first();
      if (await cartArea.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cartArea.click();
        await page.waitForTimeout(2000);
      }
    }

    // Extract cart details from the panel (.ReactModalPortal)
    const cartDetails = await page.evaluate(() => {
      const modal = document.querySelector('.ReactModalPortal');
      if (!modal) return null;

      const texts = Array.from(modal.querySelectorAll('div')).map(d => d.textContent?.trim()).filter(Boolean);

      // Extract bill details
      const itemsTotal = texts.find(t => t.includes('Items total'))?.match(/₹(\\d+)/)?.[1];
      const deliveryCharge = texts.find(t => t.includes('Delivery charge'))?.match(/₹(\\d+)/)?.[1];
      const handlingCharge = texts.find(t => t.includes('Handling charge'))?.match(/₹(\\d+)/)?.[1];
      const smallCartCharge = texts.find(t => t.includes('Small cart charge'))?.match(/₹(\\d+)/)?.[1];
      const grandTotal = texts.find(t => t.includes('Grand total'))?.match(/₹(\\d+)/)?.[1];

      // Extract delivery info
      const deliveryTime = texts.find(t => /Delivery in \\d+ minutes/.test(t));
      const shipmentInfo = texts.find(t => /Shipment of \\d+ item/.test(t));

      // Extract address
      const addressEl = Array.from(modal.querySelectorAll('div')).find(d =>
        d.textContent.includes('Delivering to') && d.children.length <= 5
      );
      const address = addressEl ? addressEl.textContent.replace('Delivering to', '').replace('Change', '').trim() : '';

      return {
        itemsTotal: itemsTotal ? '₹' + itemsTotal : 'N/A',
        deliveryCharge: deliveryCharge ? '₹' + deliveryCharge : '₹0',
        handlingCharge: handlingCharge ? '₹' + handlingCharge : '₹0',
        smallCartCharge: smallCartCharge ? '₹' + smallCartCharge : '₹0',
        grandTotal: grandTotal ? '₹' + grandTotal : 'N/A',
        deliveryTime: deliveryTime || 'N/A',
        shipmentInfo: shipmentInfo || '',
        address: address || 'N/A',
      };
    });

    // Present cart summary for confirmation
    const cartSummary = cartItems.map(i => i.name + ' (' + i.weight + ') — ' + i.price).join('\\n');
    const billSummary = cartDetails
      ? '\\n\\nBill Details:\\n' +
        'Items total: ' + cartDetails.itemsTotal + '\\n' +
        'Delivery charge: ' + cartDetails.deliveryCharge + '\\n' +
        'Handling charge: ' + cartDetails.handlingCharge + '\\n' +
        (cartDetails.smallCartCharge !== '₹0' ? 'Small cart charge: ' + cartDetails.smallCartCharge + '\\n' : '') +
        'Grand total: ' + cartDetails.grandTotal + '\\n' +
        '\\n' + (cartDetails.deliveryTime || '') +
        '\\nDelivery to: ' + (cartDetails.address || 'N/A')
      : '';

    const confirmResp = await requestFromHost({
      type: 'confirm_action',
      action: 'Confirm Blinkit grocery order',
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

    // Click "Proceed To Pay" button at bottom of cart panel
    const proceedBtn = page.locator('.ReactModalPortal').getByText('Proceed To Pay');
    if (await proceedBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Extract total amount for payment
      const totalAmount = cartDetails?.grandTotal ? parseInt(cartDetails.grandTotal.replace('₹', '')) : 0;

      const payResp = await requestFromHost({
        type: 'payment_required',
        action: 'Complete Blinkit grocery order',
        details: JSON.stringify({
          items: cartItems.map(i => ({ name: i.name, weight: i.weight, price: i.price })),
          itemsTotal: cartDetails?.itemsTotal,
          deliveryCharge: cartDetails?.deliveryCharge,
          handlingCharge: cartDetails?.handlingCharge,
          smallCartCharge: cartDetails?.smallCartCharge,
          grandTotal: cartDetails?.grandTotal,
          deliveryTime: cartDetails?.deliveryTime,
          address: cartDetails?.address,
        }),
        amountInr: totalAmount,
        description: 'Blinkit grocery order — ' + cartItems.length + ' items',
      });

      if (!payResp.confirmed) {
        log({ step: 'Payment cancelled', status: 'completed' });
        log({ done: true, cancelled: true });
        await page.close();
        rl.close();
        return;
      }

      // Click Proceed To Pay on Blinkit
      await proceedBtn.click();
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
      const eta = body.match(/(?:arriving|delivery|estimated).*?(\\d+\\s*(?:min|hour|minute)s?)/i)?.[1];
      return { orderId, eta };
    });

    log({ step: 'Blinkit order placed successfully!', status: 'completed' });
    log({
      message: 'Order placed on Blinkit!' +
        (orderDetails.orderId ? ' Order ID: ' + orderDetails.orderId : '') +
        (orderDetails.eta ? ' ETA: ' + orderDetails.eta : '') +
        ' Items: ' + cartItems.map(i => i.name).join(', ') +
        ' Total: ' + (cartDetails?.grandTotal || 'N/A'),
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
        path: path.join(screenshotDir, 'blinkit-grocery-error-' + Date.now() + '.png'),
        fullPage: true,
      });
    } catch {}
  } finally {
    rl.close();
    await page.close();  // Close tab only — operator's Chrome stays running
  }
})();
`;

export const SKILL_ID = 'blinkit-grocery';
export const REQUIRED_PARAMS = ['items'];
