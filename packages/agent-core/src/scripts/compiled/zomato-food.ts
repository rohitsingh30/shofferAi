/**
 * Order food delivery from Zomato \u2014 search restaurants, browse menus, build cart, checkout with UPI payment.
 *
 * Compiled Playwright script for zomato-food with real selectors from live browsing.
 * Site: https://www.zomato.com/ncr/delivery (city prefix is dynamic \u2014 "ncr" = Delhi NCR)
 * Params: none required
 *
 * Selector notes (discovered via live browsing):
 *  - Restaurant cards are <a> links containing star-fill rating img, h4 name, cuisine/price paragraphs
 *  - Menu items use h4 headings; Add buttons appear only on HOVER (must hover item first)
 *  - Homepage redirects to marketing page; must use /ncr/delivery (or /{city}/delivery) for ordering
 *  - Login state is detected by user's name text in the navbar (e.g. "Rohit" + chevron-down img)
 *  - Zomato aggressively pushes app download banners and location popups \u2014 dismiss them early
 */
export const SCRIPT_CODE = `
const { chromium } = require('playwright');
const path = require('path');
const readline = require('readline');
const os = require('os');
const fs = require('fs');

(async () => {
  // \u2500\u2500 Parse inputs \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const params = JSON.parse(process.argv[2] || '{}');
  const userContext = process.argv[3] ? JSON.parse(process.argv[3]) : {};

  // Validate required params
  const required = [];
  const missing = required.filter(p => !params[p]);
  if (missing.length > 0) {
    console.log(JSON.stringify({ error: 'Missing required params: ' + missing.join(', ') }));
    process.exit(1);
  }

  // \u2500\u2500 Logging & messaging protocol \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
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

  // \u2500\u2500 Connect to operator's Chrome via CDP \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
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
    // \u2500\u2500 Helper: dismiss Zomato-specific popups \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    const dismissPopups = async () => {
      // App download banner \u2014 Zomato aggressively pushes "Get the app" overlays
      try {
        const appBanner = page.locator('[role="dialog"] button:has-text("Close"), [role="dialog"] button[aria-label="Close"], button:has-text("Stay on web"), a:has-text("Stay on web")').first();
        if (await appBanner.isVisible({ timeout: 2000 })) await appBanner.click();
      } catch {}
      // Location access popup
      try {
        const locationPopup = page.locator('[role="dialog"] button:has-text("Deny"), [role="dialog"] button:has-text("Not now"), [role="dialog"] button:has-text("Maybe later")').first();
        if (await locationPopup.isVisible({ timeout: 1500 })) await locationPopup.click();
      } catch {}
      // Generic cookie/consent banner
      try {
        const cookieBtn = page.locator('button:has-text("Accept"), button:has-text("Got it"), #onetrust-accept-btn-handler').first();
        if (await cookieBtn.isVisible({ timeout: 1000 })) await cookieBtn.click();
      } catch {}
      // "Download app" bottom sheet or interstitial
      try {
        const dlSheet = page.locator('button:has-text("Not Now"), button:has-text("Continue on web"), [aria-label="close-download-banner"]').first();
        if (await dlSheet.isVisible({ timeout: 1500 })) await dlSheet.click();
      } catch {}
    };

    // \u2500\u2500 Navigate to Zomato Delivery page \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    // NOTE: city prefix "ncr" is for Delhi NCR \u2014 change to "bangalore", "mumbai", etc. for other cities
    const city = params.city || 'ncr';
    const deliveryUrl = 'https://www.zomato.com/' + city + '/delivery';
    log({ step: 'Opening Zomato Delivery (' + deliveryUrl + ')...', status: 'running' });
    await page.goto(deliveryUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2500);
    await dismissPopups();

    // Ensure we're on the Delivery tab (not Dining Out or Nightlife)
    try {
      const deliveryTab = page.getByRole('tab', { name: /delivery/i });
      const isDeliveryActive = await deliveryTab.getAttribute('aria-selected').catch(() => null);
      if (isDeliveryActive !== 'true') {
        await deliveryTab.click();
        await page.waitForTimeout(2000);
      }
    } catch {}

    await dismissPopups();

    // \u2500\u2500 Verify login \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    log({ step: 'Checking login status...', status: 'running' });
    // Zomato shows the user's first name in the navbar with a chevron-down icon when logged in
    const navbarProfileName = page.locator('nav >> text=/^[A-Z][a-z]+$/').first();
    const chevronDown = page.locator('img[alt*="chevron-down"], img[src*="chevron"]').first();
    const loginLink = page.locator('a:has-text("Log in"), a:has-text("Sign up"), button:has-text("Log in"), button:has-text("Sign up")').first();
    const isLoggedIn = await navbarProfileName.isVisible({ timeout: 3000 }).catch(() => false)
      || await chevronDown.isVisible({ timeout: 1000 }).catch(() => false);
    if (!isLoggedIn) {
      log({ step: 'Not logged in \u2014 attempting sign-in...', status: 'running' });
      if (await loginLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await loginLink.click();
        await page.waitForTimeout(3000);
        await dismissPopups();
      }
      // Check for Google sign-in option in the login modal
      const googleBtn = page.locator('button:has-text("Google"), [data-provider="google"], a:has-text("Continue with Google"), span:has-text("Google")').first();
      if (await googleBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await googleBtn.click();
        await page.waitForTimeout(5000);
      }
      // Phone-based login fallback
      const phoneField = page.locator('input[type="tel"], input[name="phone"], input[placeholder*="phone" i]').first();
      if (await phoneField.isVisible({ timeout: 3000 }).catch(() => false)) {
        const phoneResp = await requestFromHost({
          type: 'input_required',
          question: 'Enter your phone number for Zomato login:',
          inputType: 'phone',
        });
        if (phoneResp.value) {
          await phoneField.fill(phoneResp.value);
          const sendOtpBtn = page.locator('button:has-text("Send OTP"), button:has-text("Continue"), button[type="submit"]').first();
          if (await sendOtpBtn.isVisible({ timeout: 2000 }).catch(() => false)) await sendOtpBtn.click();
          await page.waitForTimeout(3000);

          const otpField = page.locator('input[name="otp"], input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], input[placeholder*="OTP" i]').first();
          if (await otpField.isVisible({ timeout: 10000 }).catch(() => false)) {
            const otpResp = await requestFromHost({
              type: 'input_required',
              question: 'Enter the OTP sent to your phone for Zomato login:',
              inputType: 'otp',
            });
            if (otpResp.value) {
              await otpField.fill(otpResp.value);
              const verifyBtn = page.locator('button:has-text("Verify"), button:has-text("Submit"), button[type="submit"]').first();
              if (await verifyBtn.isVisible({ timeout: 2000 }).catch(() => false)) await verifyBtn.click();
              await page.waitForTimeout(5000);
            }
          }
        }
      }
      await dismissPopups();
    }

    // \u2500\u2500 Search for restaurant or dish \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    log({ step: 'Ready to search...', status: 'running' });
    const searchQuery = params.query || params.dish || params.restaurant || '';

    let searchInput;
    if (searchQuery) {
      log({ step: 'Searching for: ' + searchQuery, status: 'running' });
      // Zomato's search bar: role=textbox with "Search for restaurant, cuisine or a dish"
      searchInput = page.getByRole('textbox', { name: /search for restaurant/i });
      if (!await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Fallback: any search-like input on the page
        searchInput = page.locator('input[placeholder*="Search" i], input[aria-label*="Search" i]').first();
      }
      await searchInput.click();
      await page.waitForTimeout(500);
      await searchInput.fill(searchQuery);
      await page.waitForTimeout(2000);
      // Press Enter to submit or wait for autocomplete results
      await searchInput.press('Enter');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);
      await dismissPopups();
    }

    // \u2500\u2500 Extract restaurant cards \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    log({ step: 'Loading restaurant results...', status: 'running' });
    await page.waitForTimeout(2000);

    // Restaurant cards are <a> links containing: img[alt="Restaurant Card"], h4 name, rating with star-fill
    const restaurantCards = page.locator('a:has(img[alt="Restaurant Card"]), a:has(img[alt*="star-fill"])');
    const cardCount = await restaurantCards.count().catch(() => 0);

    let restaurantList = [];
    const maxCards = Math.min(cardCount, 10);
    for (let i = 0; i < maxCards; i++) {
      try {
        const card = restaurantCards.nth(i);
        const name = await card.locator('h4').first().textContent().catch(() => 'Unknown');
        // Rating is in a generic element near the star-fill image
        const rating = await card.locator('img[alt*="star-fill"]').locator('..').textContent().catch(() => '');
        // Cuisine and price are in <p> tags
        const paragraphs = await card.locator('p').allTextContents().catch(() => []);
        const cuisine = paragraphs[0] || '';
        const priceInfo = paragraphs.find(p => p.includes('\u20b9')) || '';
        const deliveryTime = paragraphs.find(p => p.includes('min')) || '';
        // Check for offers
        const offer = paragraphs.find(p => p.includes('OFF') || p.includes('%')) || '';
        restaurantList.push({
          index: i + 1,
          name: (name || '').trim(),
          rating: (rating || '').trim(),
          cuisine: (cuisine || '').trim(),
          price: (priceInfo || '').trim(),
          deliveryTime: (deliveryTime || '').trim(),
          offer: (offer || '').trim(),
        });
      } catch {}
    }

    const pageTitle = await page.title();
    const pageUrl = page.url();

    // Format restaurant list for user
    let restaurantDisplay = restaurantList.map(r =>
      r.index + '. ' + r.name + (r.rating ? ' (' + r.rating + ')' : '') +
      (r.cuisine ? ' \u2014 ' + r.cuisine : '') +
      (r.price ? ' \u2014 ' + r.price : '') +
      (r.deliveryTime ? ' \u2014 ' + r.deliveryTime : '') +
      (r.offer ? ' \ud83c\udff7\ufe0f ' + r.offer : '')
    ).join('\\n');
    if (!restaurantDisplay) restaurantDisplay = 'Found ' + cardCount + ' restaurants on page. Enter a number to select.';

    // Present restaurant options to user
    const restaurantChoice = await requestFromHost({
      type: 'input_required',
      question: 'Here are the restaurants I found:\\n\\n' + restaurantDisplay + '\\n\\nWhich restaurant would you like to order from? (enter a number)',
      inputType: 'freetext',
    });

    // \u2500\u2500 Select restaurant \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    const choiceNum = parseInt(restaurantChoice.value || '1');
    const idx = (!isNaN(choiceNum) && choiceNum >= 1 && choiceNum <= cardCount) ? choiceNum - 1 : 0;
    const selectedCard = restaurantCards.nth(idx);
    const selectedName = await selectedCard.locator('h4').first().textContent().catch(() => 'restaurant');
    log({ step: 'Opening ' + (selectedName || '').trim() + '...', status: 'running' });
    await selectedCard.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    await dismissPopups();

    // \u2500\u2500 Browse menu & build cart \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    log({ step: 'Browsing menu...', status: 'running' });

    // Restaurant name is h1 on the detail page
    const restaurantHeading = await page.locator('h1').first().textContent().catch(() => selectedName);

    // Menu categories and items are h4 headings
    // Categories are top-level h4, items are nested h4 within menu sections
    const menuItems = page.locator('section h4, [class*="menu"] h4, h4').filter({ hasNotText: /delivery|dining|nightlife/i });
    const menuCount = await menuItems.count().catch(() => 0);

    let menuDisplay = [];
    const maxItems = Math.min(menuCount, 20);
    for (let i = 0; i < maxItems; i++) {
      try {
        const item = menuItems.nth(i);
        const itemName = await item.textContent().catch(() => '');
        // Price is typically in a sibling or nearby element with \u20b9 symbol
        const parent = item.locator('..');
        const priceEl = parent.locator(':text("\u20b9")').first();
        const price = await priceEl.textContent().catch(() => '');
        if (itemName && itemName.trim().length > 1) {
          menuDisplay.push((menuDisplay.length + 1) + '. ' + itemName.trim() + (price ? ' \u2014 ' + price.trim() : ''));
        }
      } catch {}
    }

    const menuText = menuDisplay.length > 0
      ? menuDisplay.join('\\n')
      : 'Menu loaded. Tell me what items you want to add to cart.';

    // Ask user what to order
    const itemChoice = await requestFromHost({
      type: 'input_required',
      question: 'Menu at ' + (restaurantHeading || '').trim() + ':\\n\\n' + menuText + '\\n\\nWhich items would you like to add to cart? (enter numbers separated by commas, or describe the items)',
      inputType: 'freetext',
    });

    // \u2500\u2500 Add items to cart \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    // IMPORTANT: Zomato Add buttons only appear on HOVER \u2014 must hover over item first
    log({ step: 'Adding items to cart...', status: 'running' });
    const itemChoices = (itemChoice.value || '1').split(/[,;]+/).map(s => s.trim());

    for (const choice of itemChoices) {
      const itemNum = parseInt(choice);
      if (!isNaN(itemNum) && itemNum >= 1 && itemNum <= menuDisplay.length) {
        try {
          const targetItem = menuItems.nth(itemNum - 1);
          // Hover to reveal the Add button
          await targetItem.hover();
          await page.waitForTimeout(800);
          // Add button appears on hover \u2014 look for it near the hovered item
          const addBtn = targetItem.locator('..').locator('button:has-text("Add"), button:has-text("ADD")').first();
          if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await addBtn.click();
            await page.waitForTimeout(1000);
            log({ step: 'Added item ' + itemNum + ' to cart', status: 'running' });
          } else {
            // Try broader search near the item
            const parentSection = targetItem.locator('.. >> .. >> ..');
            const addBtnAlt = parentSection.locator('button:has-text("Add"), button:has-text("ADD")').first();
            if (await addBtnAlt.isVisible({ timeout: 1500 }).catch(() => false)) {
              await addBtnAlt.click();
              await page.waitForTimeout(1000);
              log({ step: 'Added item ' + itemNum + ' to cart', status: 'running' });
            }
          }
          // Handle customization popup (size/variant selection)
          try {
            const customizePopup = page.locator('[role="dialog"]:has-text("Customize"), [role="dialog"]:has-text("Choose")');
            if (await customizePopup.isVisible({ timeout: 2000 }).catch(() => false)) {
              // Select first option by default and confirm
              const firstRadio = customizePopup.locator('input[type="radio"]').first();
              if (await firstRadio.isVisible({ timeout: 1000 }).catch(() => false)) await firstRadio.click();
              const confirmBtn = customizePopup.locator('button:has-text("Add item"), button:has-text("Continue"), button:has-text("Done")').first();
              if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) await confirmBtn.click();
              await page.waitForTimeout(1000);
            }
          } catch {}
        } catch (addErr) {
          log({ step: 'Could not add item ' + itemNum + ': ' + addErr.message, status: 'running' });
        }
      }
    }

    // \u2500\u2500 Review cart & confirm \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    log({ step: 'Reviewing cart...', status: 'running' });
    await page.waitForTimeout(1500);

    // Try to find and click the cart/checkout button
    const cartBtn = page.locator('button:has-text("View Cart"), button:has-text("Checkout"), a:has-text("View Cart"), [class*="cart"] button, button:has-text("Proceed")').first();
    if (await cartBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const cartText = await cartBtn.textContent().catch(() => 'View Cart');
      const cartUrl = page.url();

      const confirmResp = await requestFromHost({
        type: 'confirm_action',
        action: 'Proceed to checkout on Zomato',
        details: 'Restaurant: ' + (restaurantHeading || '').trim() + '\\nCart: ' + (cartText || '').trim() + '\\nURL: ' + cartUrl,
      });
      if (!confirmResp.confirmed) {
        log({ step: 'Cancelled by user', status: 'completed' });
        log({ done: true, cancelled: true });
        await page.close();
        rl.close();
        return;
      }

      await cartBtn.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      await dismissPopups();
    } else {
      // No cart button visible \u2014 items may not have been added
      log({ step: 'Cart not visible \u2014 items may not have been added successfully', status: 'running' });
    }

    // \u2500\u2500 Extract order total \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    let orderTotal = 0;
    try {
      const totalEl = page.locator('text=/\u20b9\\\\d+/').last();
      const totalText = await totalEl.textContent().catch(() => '');
      const match = totalText.match(/\u20b9(\\d[\\d,]*)/);
      if (match) orderTotal = parseInt(match[1].replace(/,/g, ''));
    } catch {}

    // \u2500\u2500 Payment pause \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    log({ step: 'Ready for payment', status: 'running' });
    const payResp = await requestFromHost({
      type: 'payment_required',
      action: 'Complete Zomato food order',
      details: 'Restaurant: ' + (restaurantHeading || '').trim() + ' \u2014 Order total: \u20b9' + (orderTotal || 'see page'),
      amountInr: orderTotal,
      description: 'zomato-food order from ' + (restaurantHeading || '').trim(),
    });
    if (!payResp.confirmed) {
      log({ step: 'Payment cancelled', status: 'completed' });
      log({ done: true, cancelled: true });
      await page.close();
      rl.close();
      return;
    }

    // \u2500\u2500 Select payment method & place order \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    log({ step: 'Completing payment...', status: 'running' });
    // Look for UPI/payment options
    const upiOption = page.locator('text=/UPI/i, button:has-text("UPI"), [class*="upi"]').first();
    if (await upiOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await upiOption.click();
      await page.waitForTimeout(2000);
    }

    // Place order button
    const placeOrderBtn = page.locator('button:has-text("Place Order"), button:has-text("Pay"), button:has-text("Proceed to pay")').first();
    if (await placeOrderBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await placeOrderBtn.click();
      await page.waitForTimeout(5000);
    }

    // \u2500\u2500 Handle payment OTP if needed \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    await page.waitForTimeout(3000);
    const otpField = page.locator('input[name="otp"], input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], input[placeholder*="OTP" i], input[placeholder*="verification" i]').first();
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

    // \u2500\u2500 Completion \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    const finalUrl = page.url();
    const finalTitle = await page.title();
    log({ step: 'Zomato food order completed!', status: 'completed' });
    log({
      message: 'Order placed on Zomato from ' + (restaurantHeading || '').trim() + '. Page: ' + finalTitle,
    });
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
        path: path.join(screenshotDir, 'zomato-food-error-' + Date.now() + '.png'),
        fullPage: true,
      });
    } catch {}
  } finally {
    rl.close();
    await page.close();  // Close tab only \u2014 operator's Chrome stays running
  }
})();
`;

export const SKILL_ID = 'zomato-food';
export const REQUIRED_PARAMS = [];
