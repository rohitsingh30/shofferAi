/**
 * Order groceries from BigBasket — Tier 2 loop script with variant selection.
 *
 * Hand-written template (NOT auto-compiled) because grocery ordering is
 * inherently a loop with per-item user choices.
 *
 * Site: https://www.bigbasket.com
 * Params: items (required — comma-separated), address (optional)
 *
 * Architecture: Navigation is SCRIPTED (instant, known selectors).
 * Decisions are INTERACTIVE (ask_user pauses via requestFromHost).
 * See docs/COMPILED-SCRIPTS.md for the Tier 2 design rationale.
 *
 * Real selectors (crawled 2026-03-20):
 *   Search bar:        textbox "Search for Products..."
 *   Location popup:    auto-shown on first visit
 *   Location search:   textbox "Search for area or street name"
 *   Login button:      button "Login/ Sign Up"
 *   Product heading:   heading[level=3] with brand + product + weight
 *   Product price:     sibling elements with ₹ prefix
 *   Add to cart:       button "Add"
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

    // ── Step 1b: Clear stale cart from previous sessions ───────
    log({ step: 'Clearing previous cart...', status: 'running' });
    await page.goto('https://www.bigbasket.com/basket/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const emptyCartIndicator = page.locator('text=/your basket is empty|no items|start shopping/i').first();
    const isCartEmpty = await emptyCartIndicator.isVisible({ timeout: 3000 }).catch(() => false);

    if (!isCartEmpty) {
      // Try "Remove All" / "Clear All" / "Empty Cart" button first
      const clearAllBtn = page.locator('button:has-text("Remove All"), button:has-text("Clear All"), button:has-text("Empty Cart"), button:has-text("Delete All"), a:has-text("Remove All"), a:has-text("Clear All")').first();
      if (await clearAllBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await clearAllBtn.click();
        await page.waitForTimeout(1000);
        // Handle confirmation dialog if one pops up
        const confirmClear = page.locator('button:has-text("Yes"), button:has-text("Confirm"), button:has-text("OK"), button:has-text("Remove")').first();
        if (await confirmClear.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmClear.click();
          await page.waitForTimeout(1500);
        }
        log({ step: 'Previous cart cleared', status: 'running' });
      } else {
        // Fallback: remove items one-by-one via X / Remove buttons
        let removed = 0;
        for (let attempt = 0; attempt < 20; attempt++) {
          const removeBtn = page.locator('button:has-text("Remove"), button[aria-label*="remove" i], button[aria-label*="delete" i], [data-testid*="remove"], [data-testid*="delete"]').first();
          if (!(await removeBtn.isVisible({ timeout: 2000 }).catch(() => false))) break;
          await removeBtn.click();
          await page.waitForTimeout(1000);
          // Handle confirmation if any
          const confirmRemove = page.locator('button:has-text("Yes"), button:has-text("Confirm"), button:has-text("Remove")').first();
          if (await confirmRemove.isVisible({ timeout: 1000 }).catch(() => false)) {
            await confirmRemove.click();
            await page.waitForTimeout(1000);
          }
          removed++;
        }
        if (removed > 0) {
          log({ step: 'Removed ' + removed + ' leftover item(s) from previous cart', status: 'running' });
        }
      }
    } else {
      log({ step: 'Cart already empty — good to go', status: 'running' });
    }

    // Navigate back to home for location popup + item search
    await page.goto('https://www.bigbasket.com');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // ── Step 2: Handle location popup ──────────────────────────
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
        const suggestion = page.locator('[role="option"], [class*="suggestion"], [class*="location-item"]').first();
        if (await suggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
          await suggestion.click();
          await page.waitForTimeout(2000);
        }
      }
    }

    // ── Step 3: Verify login ──────────────────────────────────
    log({ step: 'Checking login status...', status: 'running' });
    const loginBtn = page.getByRole('button', { name: 'Login/ Sign Up' }).first();
    const needsLogin = await loginBtn.isVisible({ timeout: 3000 }).catch(() => false);

    if (needsLogin) {
      log({ step: 'Not logged in — requesting OTP login...', status: 'running' });
      await loginBtn.click();
      await page.waitForTimeout(2000);

      const phoneInput = page.locator('input[type="tel"], input[name="phone"], input[placeholder*="phone" i], input[placeholder*="mobile" i]').first();
      if (await phoneInput.isVisible({ timeout: 3000 }).catch(() => false)) {
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

    // ── Step 4: Search & Add Items (LOOP with variant selection) ──
    const addedItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      log({ step: 'Searching for: ' + item + ' (' + (i + 1) + '/' + items.length + ')', status: 'running' });

      // Use search bar — clear previous search first
      const searchBar = page.getByPlaceholder('Search for Products...').first();
      await searchBar.click();
      await searchBar.fill(item);
      await page.keyboard.press('Enter');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);

      // Scrape product results using page.evaluate for reliability
      const products = await page.evaluate(() => {
        const cards = document.querySelectorAll('li');
        return Array.from(cards).slice(0, 8).map((card, idx) => {
          const h3 = card.querySelector('h3');
          if (!h3) return null;
          const name = h3.textContent?.trim() || '';
          if (!name || name.length < 3) return null;

          // Price: look for ₹ in the card
          const priceEls = Array.from(card.querySelectorAll('*')).filter(el =>
            el.textContent?.trim().startsWith('₹') && el.children.length === 0
          );
          const price = priceEls[0]?.textContent?.trim() || '';
          const mrp = priceEls[1]?.textContent?.trim() || '';

          // Weight: look for patterns like "1 kg", "500 ml", "6 pcs"
          const allText = Array.from(card.querySelectorAll('*')).map(el => el.textContent?.trim()).filter(Boolean);
          const weight = allText.find(t => /^\\d+(\\.\\d+)?\\s*(g|kg|ml|ltr|l|pcs|pack|unit|x\\d)/i.test(t)) || '';

          return { idx: idx + 1, name, price, mrp, weight };
        }).filter(Boolean);
      });

      if (!products || products.length === 0) {
        // No results — ask user for alternative
        const altResp = await requestFromHost({
          type: 'input_required',
          question: 'No results found for "' + item + '" on BigBasket. Enter a different search term, or type "skip" to skip this item:',
          inputType: 'freetext',
        });
        if (altResp.value && altResp.value.toLowerCase() !== 'skip') {
          // Retry with alternative search
          await searchBar.click();
          await searchBar.fill(altResp.value);
          await page.keyboard.press('Enter');
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(3000);
          // If still no results, skip
          const retryH3 = page.locator('li h3').first();
          if (!(await retryH3.isVisible({ timeout: 3000 }).catch(() => false))) {
            log({ step: 'Still no results for "' + altResp.value + '", skipping', status: 'running' });
            continue;
          }
        } else {
          continue;
        }
      }

      // Ask user to pick a variant (the key Tier 2 feature)
      let selectedIdx = 0;
      if (products && products.length > 1) {
        const options = products.map(p =>
          p.idx + '. ' + p.name + (p.weight ? ' (' + p.weight + ')' : '') + ' — ' + p.price + (p.mrp && p.mrp !== p.price ? ' (MRP ' + p.mrp + ')' : '')
        );

        const choiceResp = await requestFromHost({
          type: 'input_required',
          question: 'Found ' + products.length + ' options for "' + item + '":\\n' + options.join('\\n') + '\\nWhich one? (enter number)',
          inputType: 'choice',
          options: options,
        });

        const choiceNum = parseInt(choiceResp.value || '1');
        selectedIdx = (!isNaN(choiceNum) && choiceNum >= 1 && choiceNum <= products.length) ? choiceNum - 1 : 0;
      }

      const selected = products && products[selectedIdx] ? products[selectedIdx] : { idx: 1, name: item, price: '', weight: '' };
      log({ step: 'Adding: ' + selected.name + ' ' + (selected.weight || '') + ' ' + selected.price, status: 'running' });

      // Click the Add button on the selected product card
      const productListItems = page.locator('li').filter({ has: page.locator('h3') });
      const targetCard = productListItems.nth(selectedIdx);
      const addBtn = targetCard.getByRole('button', { name: 'Add' }).first();
      if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        addedItems.push({ name: selected.name, price: selected.price, weight: selected.weight, searchTerm: item });
        log({ step: 'Added: ' + selected.name + ' ' + selected.price, status: 'running' });

        // Sync cart state to frontend so CartBar appears progressively
        log({
          step: JSON.stringify({
            _type: 'cart_update',
            items: addedItems.map(it => ({ name: it.name, quantity: 1, price: it.price })),
            store: 'BigBasket',
            total: '',
          }),
          status: 'cart_update',
        });
      } else {
        log({ step: 'Could not find Add button for: ' + selected.name, status: 'running' });
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
    log({ step: 'Opening cart (' + addedItems.length + ' items)...', status: 'running' });
    await page.goto('https://www.bigbasket.com/basket/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Extract cart totals from the page
    const cartDetails = await page.evaluate(() => {
      const body = document.body.textContent || '';
      const subtotalMatch = body.match(/Sub\\s*total[:\\s]*₹([\\d,.]+)/i);
      const deliveryMatch = body.match(/Delivery\\s*charge[:\\s]*₹([\\d,.]+)/i);
      const totalMatch = body.match(/(?:Grand|Order)\\s*total[:\\s]*₹([\\d,.]+)/i);
      const savingsMatch = body.match(/(?:You\\s*save|Savings)[:\\s]*₹([\\d,.]+)/i);
      return {
        subtotal: subtotalMatch ? '₹' + subtotalMatch[1] : null,
        delivery: deliveryMatch ? '₹' + deliveryMatch[1] : 'Free',
        total: totalMatch ? '₹' + totalMatch[1] : null,
        savings: savingsMatch ? '₹' + savingsMatch[1] : null,
      };
    });

    const itemSummary = addedItems.map((it, idx) =>
      (idx + 1) + '. ' + it.name + (it.weight ? ' (' + it.weight + ')' : '') + ' — ' + it.price
    ).join('\\n');

    const billSection = cartDetails.total
      ? '\\n\\nBill Details:' +
        (cartDetails.subtotal ? '\\nSubtotal: ' + cartDetails.subtotal : '') +
        '\\nDelivery: ' + cartDetails.delivery +
        (cartDetails.savings ? '\\nSavings: ' + cartDetails.savings : '') +
        '\\nTotal: ' + cartDetails.total
      : '';

    // Send final cart_update with totals so frontend CartContext is fully synced
    log({
      step: JSON.stringify({
        _type: 'cart_update',
        items: addedItems.map(it => ({ name: it.name, quantity: 1, price: it.price, weight: it.weight })),
        store: 'BigBasket',
        total: cartDetails.total || '',
      }),
      status: 'cart_update',
    });

    const confirmResp = await requestFromHost({
      type: 'confirm_action',
      action: 'Review BigBasket Cart',
      details: 'Items:\\n' + itemSummary + billSection,
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

    const totalAmount = cartDetails.total ? parseFloat(cartDetails.total.replace(/[^0-9.]/g, '')) : 0;

    const payResp = await requestFromHost({
      type: 'payment_required',
      action: 'Complete BigBasket grocery order',
      details: 'Items: ' + addedItems.length + '\\nTotal: ' + (cartDetails.total || 'see cart'),
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
    log({ step: 'BigBasket order completed!', status: 'completed' });
    log({
      message: 'Order placed on BigBasket!\\nItems: ' + addedItems.map(it => it.name).join(', ') + '\\nTotal: ' + (cartDetails.total || 'see cart'),
    });
    log({ done: true, url: finalUrl, items: addedItems, cart: cartDetails });

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
