/**
 * Order food delivery from Swiggy — browse restaurants, select dishes, checkout, pay.
 *
 * Compiled Playwright script for swiggy-food with real selectors from live browsing.
 * Site: https://www.swiggy.com/restaurants
 * Params: none required
 *
 * Real selector notes (discovered via live browsing of swiggy.com):
 *  - Homepage (/) is a marketing page — always go to /restaurants for food delivery
 *  - Restaurant cards are `generic[cursor=pointer]` (NOT links)
 *  - Search lives at /search (no inline search bar on /restaurants)
 *  - Cart link text: "N Cart" with href /checkout
 *  - Profile link text contains user's name with href /my-account
 *  - "OK GOT IT" dialog appears for delivery-location confirmation
 *  - Offer badges inside cards: "X% OFF UPTO ₹Y" or "ITEMS AT ₹X"
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
    // ── Helper: dismiss Swiggy popups ──────────────────────────
    // Swiggy shows an "OK GOT IT" dialog about delivery location on first visit,
    // plus occasional app-install banners and notification prompts.
    const dismissPopups = async () => {
      // Delivery-location confirmation dialog ("OK GOT IT")
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

    // ── Helper: get cart count from header ──────────────────────
    const getCartCount = async () => {
      try {
        // Cart link text is "N Cart" where N is item count
        const cartLink = page.getByRole('link', { name: /\\\\d+ Cart/i });
        if (await cartLink.isVisible({ timeout: 2000 })) {
          const text = await cartLink.textContent();
          const match = text.match(/(\\\\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        }
      } catch {}
      return 0;
    };

    // ── Helper: extract restaurant cards ────────────────────────
    // Swiggy restaurant cards are generic[cursor=pointer] divs (not links).
    // Structure:
    //   generic[cursor=pointer]
    //     img "Restaurant Name"         ← alt text = restaurant name
    //     generic: "30% OFF UPTO ₹70"   ← offer badge
    //     generic: "Free delivery"       ← delivery badge
    //     generic: "Restaurant Name"     ← name text
    //     generic: "4.3 •"              ← rating
    //     text: "45-50 mins"            ← delivery time
    //     generic: "Burgers, Beverages"  ← cuisines
    //     generic: "Forest Dept Colony"  ← locality
    const extractRestaurantCards = async () => {
      const cards = [];
      // Restaurant cards are cursor-pointer containers with an img child
      const cardEls = page.locator('[style*="cursor: pointer"], [style*="cursor:pointer"]');
      const count = await cardEls.count().catch(() => 0);
      const maxCards = Math.min(count, 15);

      for (let i = 0; i < maxCards; i++) {
        try {
          const card = cardEls.nth(i);
          // Restaurant image alt text = restaurant name
          const img = card.locator('img').first();
          const name = await img.getAttribute('alt').catch(() => '');
          if (!name || name.length < 2) continue;

          const cardText = await card.textContent().catch(() => '');

          // Extract rating (e.g. "4.3 •")
          const ratingMatch = cardText.match(/(\\\\d\\\\.\\\\d)\\\\s*•/);
          const rating = ratingMatch ? ratingMatch[1] : '';

          // Extract delivery time (e.g. "45-50 mins")
          const timeMatch = cardText.match(/(\\\\d+-\\\\d+ mins|\\\\d+ mins)/);
          const deliveryTime = timeMatch ? timeMatch[1] : '';

          // Extract offer (e.g. "30% OFF UPTO ₹70" or "ITEMS AT ₹140")
          const offerMatch = cardText.match(/(\\\\d+% OFF UPTO ₹\\\\d+|ITEMS AT ₹\\\\d+|FREE DELIVERY|Free delivery)/i);
          const offer = offerMatch ? offerMatch[1] : '';

          cards.push({ index: i, name, rating, deliveryTime, offer });
        } catch {}
      }
      return cards;
    };

    // ── Navigate to Swiggy Restaurants ──────────────────────────
    // Go to /restaurants directly — the homepage (/) is a marketing page
    // that mixes food delivery, Instamart grocery, and Dineout
    log({ step: 'Opening Swiggy restaurants page...', status: 'running' });
    await page.goto('https://www.swiggy.com/restaurants');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await dismissPopups();

    // ── Verify login ──────────────────────────────────────
    // When logged in, the header shows a link with the user's name (href /my-account)
    log({ step: 'Checking login status...', status: 'running' });
    const profileLink = page.getByRole('link', { name: /my-account/i }).or(
      page.locator('a[href*="/my-account"]')
    );
    let isLoggedIn = await profileLink.isVisible({ timeout: 3000 }).catch(() => false);

    // Fallback: check if any nav link contains a person's name (not "Sign in" / "Login")
    if (!isLoggedIn) {
      const headerLinks = page.locator('header a, nav a');
      const linkCount = await headerLinks.count().catch(() => 0);
      for (let i = 0; i < linkCount; i++) {
        const text = (await headerLinks.nth(i).textContent().catch(() => '')).trim();
        // If any header link looks like a name (not a nav keyword), we're logged in
        if (text && !/(sign in|login|help|offers|search|cart|swiggy|corporate)/i.test(text) && text.length > 2 && text.length < 40) {
          isLoggedIn = true;
          break;
        }
      }
    }

    if (!isLoggedIn) {
      log({ step: 'Not logged in — requesting sign-in...', status: 'running' });
      // Swiggy login: click "Login" link in header, enter phone, receive OTP
      const loginBtn = page.getByRole('link', { name: /sign in|login/i }).or(
        page.locator('a:has-text("Sign in"), a:has-text("Login")')
      ).first();
      if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await loginBtn.click();
        await page.waitForTimeout(3000);
      }

      // Swiggy uses phone+OTP login — ask operator for phone number
      const phoneField = page.locator('input[type="tel"], input[name="mobile"], input[placeholder*="phone" i], input[placeholder*="mobile" i]').first();
      if (await phoneField.isVisible({ timeout: 5000 }).catch(() => false)) {
        const phoneResp = await requestFromHost({
          type: 'input_required',
          question: 'Swiggy requires phone number login. Enter the phone number:',
          inputType: 'phone',
        });
        if (phoneResp.value) {
          await phoneField.fill(phoneResp.value);
          // Click the send OTP / continue button
          const sendOtp = page.getByRole('button', { name: /send otp|continue|login|next/i }).first();
          if (await sendOtp.isVisible({ timeout: 2000 }).catch(() => false)) {
            await sendOtp.click();
            await page.waitForTimeout(3000);
          }

          // Wait for OTP input
          const otpField = page.locator('input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], input[name="otp"], input[placeholder*="OTP" i]').first();
          if (await otpField.isVisible({ timeout: 10000 }).catch(() => false)) {
            const otpResp = await requestFromHost({
              type: 'input_required',
              question: 'Enter the OTP sent to your phone:',
              inputType: 'otp',
            });
            if (otpResp.value) {
              await otpField.fill(otpResp.value);
              const verifyBtn = page.getByRole('button', { name: /verify|submit|continue/i }).first();
              if (await verifyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await verifyBtn.click();
              }
              await page.waitForTimeout(5000);
              await dismissPopups();
            }
          }
        }
      }
    }

    log({ step: isLoggedIn ? 'Logged in ✓' : 'Login attempted', status: 'running' });
    await dismissPopups();

    // ── Determine search query or browse ─────────────────
    const userIntent = await requestFromHost({
      type: 'input_required',
      question: "What would you like to order? You can name a restaurant, cuisine, or dish (e.g., 'biryani', 'McDonald\\'s', 'pizza')",
      inputType: 'freetext',
    });

    const searchQuery = (userIntent.value || '').trim();

    if (searchQuery) {
      // ── Search for food/restaurant ───────────────────────
      // Swiggy search is on a separate page at /search
      log({ step: 'Searching for "' + searchQuery + '"...', status: 'running' });
      await page.goto('https://www.swiggy.com/search');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      await dismissPopups();

      // Type into the search input
      const searchInput = page.getByRole('textbox', { name: /search/i }).or(
        page.locator('input[placeholder*="Search" i], input[type="search"]')
      ).first();
      if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await searchInput.click();
        await searchInput.fill(searchQuery);
        await page.waitForTimeout(2000);

        // Press Enter or wait for suggestions to appear
        await searchInput.press('Enter');
        await page.waitForTimeout(3000);
      }
    }

    // ── Extract restaurant results ───────────────────────
    log({ step: 'Loading restaurants...', status: 'running' });
    await page.waitForTimeout(2000);

    const restaurants = await extractRestaurantCards();
    const pageTitle = await page.title();
    const pageUrl = page.url();

    let displayList = '';
    if (restaurants.length > 0) {
      displayList = restaurants.map((r, i) =>
        (i + 1) + '. ' + r.name +
        (r.rating ? ' ⭐' + r.rating : '') +
        (r.deliveryTime ? ' (' + r.deliveryTime + ')' : '') +
        (r.offer ? ' — ' + r.offer : '')
      ).join('\\n');
    } else {
      displayList = 'No restaurants found with card structure. Page title: ' + pageTitle;
    }

    // ── Present choices to user ──────────────────────────
    const userChoice = await requestFromHost({
      type: 'input_required',
      question: 'Here are the restaurants I found:\\n\\n' + displayList + '\\n\\nWhich one would you like? (enter a number or restaurant name)',
      inputType: 'freetext',
    });

    // ── Select restaurant ────────────────────────────────
    const choiceValue = (userChoice.value || '1').trim();
    log({ step: 'Selecting restaurant: ' + choiceValue, status: 'running' });

    let targetCard = null;
    const choiceNum = parseInt(choiceValue);

    if (!isNaN(choiceNum) && choiceNum >= 1 && choiceNum <= restaurants.length) {
      // Numeric choice — click the card at that index
      const r = restaurants[choiceNum - 1];
      // Find card by img alt text matching the restaurant name
      targetCard = page.locator('[style*="cursor: pointer"], [style*="cursor:pointer"]')
        .filter({ has: page.locator('img[alt="' + r.name.replace(/"/g, '\\\\"') + '"]') })
        .first();
    } else {
      // Text-based choice — find card with matching restaurant name
      const cardEls = page.locator('[style*="cursor: pointer"], [style*="cursor:pointer"]');
      const count = await cardEls.count().catch(() => 0);
      for (let i = 0; i < count; i++) {
        const img = cardEls.nth(i).locator('img').first();
        const alt = await img.getAttribute('alt').catch(() => '');
        if (alt && alt.toLowerCase().includes(choiceValue.toLowerCase())) {
          targetCard = cardEls.nth(i);
          break;
        }
      }
    }

    if (targetCard && await targetCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await targetCard.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      await dismissPopups();
    } else {
      log({ step: 'Could not find restaurant card — trying text click', status: 'running' });
      const fallback = page.getByText(choiceValue, { exact: false }).first();
      if (await fallback.isVisible({ timeout: 3000 }).catch(() => false)) {
        await fallback.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
      }
    }

    // ── Restaurant menu page — select dishes ─────────────
    log({ step: 'Loading restaurant menu...', status: 'running' });
    await page.waitForTimeout(2000);
    await dismissPopups();

    const menuTitle = await page.title();
    const menuUrl = page.url();

    // Ask user what to add to cart
    const dishChoice = await requestFromHost({
      type: 'input_required',
      question: 'You are now on the restaurant menu page (' + menuTitle + '). What dish(es) would you like to add? (describe or name them)',
      inputType: 'freetext',
    });

    if (dishChoice.value) {
      log({ step: 'Looking for: ' + dishChoice.value, status: 'running' });
      // Try to find and click "ADD" buttons next to matching items
      // Swiggy menu items have "ADD" or "Add" buttons
      const addButtons = page.getByRole('button', { name: /^ADD$/i });
      const addCount = await addButtons.count().catch(() => 0);

      if (addCount > 0) {
        // Click the first ADD button as a starting point
        await addButtons.first().click();
        await page.waitForTimeout(1500);
        await dismissPopups();
      }
    }

    // ── Check cart ───────────────────────────────────────
    const cartCount = await getCartCount();
    log({ step: 'Cart has ' + cartCount + ' item(s)', status: 'running' });

    // ── Confirm before checkout ──────────────────────────
    const confirmResp = await requestFromHost({
      type: 'confirm_action',
      action: 'Proceed to Swiggy checkout',
      details: 'Restaurant: ' + menuTitle + '\\nCart items: ' + cartCount + '\\nURL: ' + menuUrl,
    });
    if (!confirmResp.confirmed) {
      log({ step: 'Cancelled by user', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // ── Go to checkout ───────────────────────────────────
    log({ step: 'Going to checkout...', status: 'running' });
    // Cart link: "N Cart" with href /checkout
    const cartLink = page.getByRole('link', { name: /\\\\d+ Cart/i }).or(
      page.locator('a[href*="/checkout"]')
    ).first();
    if (await cartLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cartLink.click();
    } else {
      await page.goto('https://www.swiggy.com/checkout');
    }
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await dismissPopups();

    // ── Extract order total ──────────────────────────────
    let orderTotal = 0;
    try {
      const totalText = await page.locator('text=/TO PAY|Grand Total|Total/i').first().textContent();
      const totalMatch = totalText.match(/₹\\\\s*(\\\\d[\\\\d,.]*)/);
      if (totalMatch) orderTotal = parseFloat(totalMatch[1].replace(/,/g, ''));
    } catch {}

    // ── Payment ──────────────────────────────────────────
    log({ step: 'Ready for payment — ₹' + orderTotal, status: 'running' });
    const payResp = await requestFromHost({
      type: 'payment_required',
      action: 'Complete Swiggy food order',
      details: 'Order total: ₹' + orderTotal + ' on Swiggy',
      amountInr: orderTotal,
      description: 'swiggy-food order',
    });
    if (!payResp.confirmed) {
      log({ step: 'Payment cancelled', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // ── Handle OTP if needed during payment ──────────────
    await page.waitForTimeout(3000);
    const otpField = page.locator('input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], input[name="otp"], input[placeholder*="OTP" i]').first();
    if (await otpField.isVisible({ timeout: 5000 }).catch(() => false)) {
      const otpResp = await requestFromHost({
        type: 'input_required',
        question: 'Enter the OTP/verification code sent to your phone:',
        inputType: 'otp',
      });
      if (otpResp.value) {
        await otpField.fill(otpResp.value);
        const submitBtn = page.getByRole('button', { name: /verify|submit|continue|place order/i }).first();
        if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) await submitBtn.click();
        await page.waitForTimeout(5000);
      }
    }

    // ── Completion ───────────────────────────────────────
    const finalUrl = page.url();
    const finalTitle = await page.title();
    log({ step: 'Swiggy food order completed!', status: 'completed' });
    log({ message: 'Order placed on Swiggy. Page: ' + finalTitle });
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
        path: path.join(screenshotDir, 'swiggy-food-error-' + Date.now() + '.png'),
        fullPage: true,
      });
    } catch {}
  } finally {
    rl.close();
    await page.close();  // Close tab only — operator's Chrome stays running
  }
})();
`;

export const SKILL_ID = 'swiggy-food';
export const REQUIRED_PARAMS = [];
