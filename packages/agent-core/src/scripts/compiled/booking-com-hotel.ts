/**
 * Booking.com Hotel Search & Booking — Full E2E Playwright Script (v2)
 *
 * Complete flow: Search → Select Hotel → Select Room → Fill Details →
 *   Payment Pause → Complete Booking → Extract Confirmation
 *
 * Uses a persistent ShofferAI Chrome profile at ~/.shofferai/chrome-profile.
 * First run: user signs in to Google once. After that, stays signed in forever.
 * Completes through payment with bidirectional stdin/stdout for
 * interactive hotel/room selection, credential filling, and OTP handling.
 */
export const SCRIPT_CODE = `
const { chromium } = require('playwright');
const path = require('path');
const readline = require('readline');
const os = require('os');
const fs = require('fs');

(async () => {
  const params = JSON.parse(process.argv[2]);
  const userContext = process.argv[3] ? JSON.parse(process.argv[3]) : {};

  const log = (data) => console.log(JSON.stringify(data));

  // Set up stdin reader for interactive messages from the host
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

  // ── Helper: dismiss common popups ───────────────────────────────────
  const dismissPopups = async (page) => {
    try {
      const cookieBtn = page.locator('#onetrust-accept-btn-handler');
      if (await cookieBtn.isVisible({ timeout: 1500 })) await cookieBtn.click();
    } catch {}
    try {
      const dismissBtn = page.locator('[aria-label="Dismiss sign-in info."], [aria-label="Dismiss sign in information."]').first();
      if (await dismissBtn.isVisible({ timeout: 1500 })) await dismissBtn.click();
    } catch {}
    try {
      const closeBtn = page.locator('[role="dialog"] button[aria-label="Close"]').first();
      if (await closeBtn.isVisible({ timeout: 1000 })) await closeBtn.click();
    } catch {}
  };

  // ── Connect to operator's Chrome via CDP ─────────────────────────────

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
    // ── Sign-in check ────────────────────────────────────────────────

    log({ step: 'Checking Booking.com sign-in...', status: 'running' });
    await page.goto('https://www.booking.com');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await dismissPopups(page);

    // Check if already signed in
    const isSignedIn = await page.locator(
      '[data-testid="header-profile"], [data-testid="header-profile-button"], ' +
      '[aria-label="Your account menu"], a[href*="mysettings"]'
    ).first().isVisible({ timeout: 3000 }).catch(() => false);

    if (isSignedIn) {
      log({ step: 'Signed into Booking.com — Genius discounts active!', status: 'running' });
    } else {
      log({ step: 'First run — signing in to Booking.com via Google...', status: 'running' });

      try {
        const signInLink = page.locator(
          'a[data-testid="header-sign-in-button"], a:has-text("Sign in"), button:has-text("Sign in")'
        ).first();
        if (await signInLink.isVisible({ timeout: 3000 })) {
          await signInLink.click();
        } else {
          await page.goto('https://account.booking.com/sign-in');
        }
        await page.waitForLoadState('domcontentloaded').catch(() => {});
        await page.waitForTimeout(3000);
      } catch {
        await page.waitForTimeout(3000);
      }

      const googleBtn = page.locator(
        'button:has-text("Google"), [data-provider="google"], ' +
        'a:has-text("Sign in with Google"), [aria-label*="Google"], ' +
        'button:has-text("Continue with Google")'
      ).first();

      let foundGoogle = await googleBtn.isVisible({ timeout: 3000 }).catch(() => false);

      if (!foundGoogle) {
        const emailInput = page.locator(
          'input[name="username"], input[type="email"], input[name="loginname"]'
        ).first();
        if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false) && userContext.email) {
          await emailInput.fill(userContext.email);
          const continueBtn = page.locator('button:has-text("Continue"), button[type="submit"]').first();
          if (await continueBtn.isVisible({ timeout: 2000 })) {
            await continueBtn.click();
            await page.waitForTimeout(3000);
          }
          foundGoogle = await googleBtn.isVisible({ timeout: 3000 }).catch(() => false);
        }
      }

      if (foundGoogle) {
        const popupPromise = context.waitForEvent('page', { timeout: 10000 }).catch(() => null);
        await googleBtn.click();
        await page.waitForTimeout(2000);

        const popup = await popupPromise;
        const googlePage = popup || page;

        let signedIn = false;
        for (let i = 0; i < 10; i++) {
          await page.waitForTimeout(2000);
          try {
            const mainUrl = page.url();
            if (mainUrl.includes('booking.com') && !mainUrl.includes('sign-in') && !mainUrl.includes('account.booking.com')) {
              signedIn = true;
              break;
            }
          } catch {}
          try {
            const gUrl = googlePage.url();
            if (gUrl.includes('accounts.google.com')) {
              const accountOpt = googlePage.locator('[data-email], [data-identifier], div[role="link"]').first();
              if (await accountOpt.isVisible({ timeout: 1500 }).catch(() => false)) {
                await accountOpt.click();
                await page.waitForTimeout(3000);
              }
            }
          } catch {}
        }

        if (signedIn) {
          log({ step: 'Signed in via Google! Sessions saved for next time.', status: 'running' });
        } else {
          await requestFromHost({
            type: 'input_required',
            question: 'Please complete the Google sign-in in the Chrome window. This is a one-time setup. Type "done" when finished, or "skip" to continue as guest.',
            inputType: 'freetext',
          });
          await page.waitForTimeout(3000);
        }
      } else {
        await requestFromHost({
          type: 'input_required',
          question: 'Please sign in to Booking.com in the Chrome window for Genius discounts and saved cards. This is one-time only. Type "done" when finished, or "skip" to book as guest.',
          inputType: 'freetext',
        });
        await page.waitForTimeout(3000);
      }
    }

    // ── Step 1: Search ─────────────────────────────────────────────────

    log({ step: 'Searching hotels in ' + params.destination + '...', status: 'running' });
    const searchUrl = 'https://www.booking.com/searchresults.html?' +
      'ss=' + encodeURIComponent(params.destination) +
      '&checkin=' + params.checkin +
      '&checkout=' + params.checkout +
      '&group_adults=' + (params.guests || '2') +
      '&no_rooms=1&group_children=0';
    await page.goto(searchUrl);
    await page.waitForLoadState('load');

    await dismissPopups(page);

    // ── Step 2: Extract and present hotel options ────────────────────────

    log({ step: 'Loading hotel results...', status: 'running' });
    await page.waitForSelector('[data-testid="property-card"]', { timeout: 15000 });

    const hotels = await page.$$eval('[data-testid="property-card"]', (cards) => {
      return cards.slice(0, 5).map((card, i) => {
        const title = card.querySelector('[data-testid="title"]');
        const price = card.querySelector('[data-testid="price-and-discounted-price"]');
        const review = card.querySelector('[data-testid="review-score"]');
        const distance = card.querySelector('[data-testid="distance"]');
        const genius = card.querySelector('[class*="genius"], [data-testid*="genius"]');
        return {
          index: i + 1,
          name: title?.textContent?.trim() || 'Unknown',
          price: price?.textContent?.trim() || 'N/A',
          reviewScore: review?.textContent?.trim() || '',
          distance: distance?.textContent?.trim() || '',
          hasGeniusDiscount: !!genius,
        };
      });
    });

    // Format hotel list for user
    let hotelList = 'Hotels in ' + params.destination + ':\\n\\n';
    for (const h of hotels) {
      hotelList += h.index + '. ' + h.name + ' — ' + h.price;
      if (h.hasGeniusDiscount) hotelList += ' (Genius discount!)';
      hotelList += '\\n';
      if (h.reviewScore) hotelList += '   ' + h.reviewScore;
      if (h.distance) hotelList += ' · ' + h.distance;
      hotelList += '\\n';
    }

    const hotelChoice = await requestFromHost({
      type: 'input_required',
      question: hotelList + '\\nWhich hotel would you like? (number, name, or preference like "cheapest")',
      inputType: 'freetext',
    });

    // Parse user's choice
    let hotelIdx = 0;
    const choiceVal = (hotelChoice.value || '1').toString().trim().toLowerCase();
    const choiceNum = parseInt(choiceVal);
    if (!isNaN(choiceNum) && choiceNum >= 1 && choiceNum <= hotels.length) {
      hotelIdx = choiceNum - 1;
    } else if (choiceVal.includes('cheap') || choiceVal.includes('budget')) {
      // Pick cheapest — hotels are already sorted by default
      hotelIdx = 0;
    } else {
      // Try to match by name substring
      const matchIdx = hotels.findIndex(h => h.name.toLowerCase().includes(choiceVal));
      if (matchIdx >= 0) hotelIdx = matchIdx;
    }

    const selectedHotel = hotels[hotelIdx] || hotels[0];
    log({ step: 'Selected: ' + selectedHotel.name, status: 'running' });
    log({ message: 'Great choice! Checking ' + selectedHotel.name + '...' });

    // Click on the selected hotel
    const cards = page.locator('[data-testid="property-card"]');
    const selectedCard = cards.nth(hotelIdx);
    const hotelLink = selectedCard.locator('a[data-testid="title-link"], a:has-text("See availability"), a:has-text("Show prices")').first();
    await hotelLink.click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    await dismissPopups(page);

    // Get confirmed hotel name from page
    const hotelName = await page.locator('h2[class*="hotel_name"], h2#hp_hotel_name, [data-testid="header-title"]').first().textContent().catch(() => selectedHotel.name);

    // ── Step 3: Extract and present room options ────────────────────────

    log({ step: 'Loading room options...', status: 'running' });

    // Scroll to rooms section
    const roomsSection = page.locator('#rooms_and_availability, [data-testid="room-table"], table.hprt-table').first();
    if (await roomsSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      await roomsSection.scrollIntoViewIfNeeded();
    }
    await page.waitForTimeout(1500);

    const rooms = await page.$$eval('.hprt-table tr.js-rt-block-row, [data-testid="room-type"]', (rows) => {
      const seen = new Set();
      return rows.slice(0, 8).reduce((acc, row, i) => {
        const name = row.querySelector('.hprt-roomtype-icon-link, [data-testid="room-name"]');
        const price = row.querySelector('.bui-price-display__value, .prco-valign-middle-helper, [data-testid="room-price"]');
        const conditions = row.querySelector('.hprt-conditions, [data-testid="cancellation-policy"]');
        const roomName = name?.textContent?.trim() || '';

        if (roomName && !seen.has(roomName)) {
          seen.add(roomName);
          acc.push({
            index: acc.length + 1,
            name: roomName,
            price: price?.textContent?.trim() || 'N/A',
            cancellation: conditions?.textContent?.trim()?.substring(0, 60) || '',
          });
        }
        return acc;
      }, []);
    });

    let roomIdx = 0;
    if (rooms.length > 1) {
      // Present room options to user
      let roomList = 'Available rooms at ' + hotelName.trim() + ':\\n\\n';
      for (const r of rooms) {
        roomList += r.index + '. ' + r.name + ' — ' + r.price + '\\n';
        if (r.cancellation) roomList += '   ' + r.cancellation + '\\n';
      }

      const roomChoice = await requestFromHost({
        type: 'input_required',
        question: roomList + '\\nWhich room? (number or name)',
        inputType: 'freetext',
      });

      const roomVal = (roomChoice.value || '1').toString().trim();
      const roomNum = parseInt(roomVal);
      if (!isNaN(roomNum) && roomNum >= 1 && roomNum <= rooms.length) {
        roomIdx = roomNum - 1;
      }
    }

    log({ step: 'Reserving: ' + (rooms[roomIdx]?.name || 'room'), status: 'running' });

    // Select room quantity if dropdown exists
    try {
      const roomRows = page.locator('.hprt-table tr.js-rt-block-row, [data-testid="room-type"]');
      const targetRow = roomRows.nth(roomIdx);
      const dropdown = targetRow.locator('select.hprt-nos-select, [data-testid="select-room-count"]').first();
      if (await dropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
        await dropdown.selectOption('1');
        await page.waitForTimeout(500);
      }
    } catch {}

    // Click Reserve button
    const reserveBtn = page.locator(
      'button:has-text("Reserve"), button:has-text("I\\'ll reserve"), ' +
      'button:has-text("Book now"), input[value="Reserve"], ' +
      '[data-testid="submit-room-selection"], .hprt-reservation-cta button'
    ).first();

    if (await reserveBtn.isVisible({ timeout: 5000 })) {
      await reserveBtn.click();
      await page.waitForLoadState('load');
      log({ step: 'Room reserved, filling details...', status: 'running' });
    } else {
      const selectBtn = page.locator('.hprt-reservation-cta button, [data-testid="select-room-cta"]').first();
      if (await selectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await selectBtn.click();
        await page.waitForLoadState('load');
      }
    }

    // ── Step 4: Fill guest details ─────────────────────────────────────

    await page.waitForTimeout(2000);
    const currentUrl = page.url();

    if (currentUrl.includes('book') || currentUrl.includes('checkout') || currentUrl.includes('reservation')) {
      log({ step: 'On booking form — filling guest details...', status: 'running' });

      // First name (data-testid discovered from live booking.com test)
      const firstName = page.locator('[data-testid="user-details-firstname"], [name="firstname"], #firstname').first();
      if (await firstName.isVisible({ timeout: 2000 }).catch(() => false)) {
        const val = await firstName.inputValue();
        if (!val) {
          if (userContext.firstName) {
            await firstName.fill(userContext.firstName);
          } else if (userContext.name) {
            await firstName.fill(userContext.name.split(' ')[0] || '');
          }
        }
      }

      // Last name
      const lastName = page.locator('[data-testid="user-details-lastname"], [name="lastname"], #lastname').first();
      if (await lastName.isVisible({ timeout: 1000 }).catch(() => false)) {
        const val = await lastName.inputValue();
        if (!val) {
          if (userContext.lastName) {
            await lastName.fill(userContext.lastName);
          } else if (userContext.name) {
            await lastName.fill(userContext.name.split(' ').slice(1).join(' ') || '');
          }
        }
      }

      // Email
      const emailField = page.locator('[data-testid="user-details-email"], [name="email"], #email').first();
      if (await emailField.isVisible({ timeout: 1000 }).catch(() => false)) {
        const val = await emailField.inputValue();
        if (!val && userContext.email) await emailField.fill(userContext.email);
      }

      // Phone
      const phoneField = page.locator('[data-testid="phone-number-input"], [name="phone"], [name="cc_phone"]').first();
      if (await phoneField.isVisible({ timeout: 1000 }).catch(() => false)) {
        const val = await phoneField.inputValue();
        if (!val && userContext.phone) await phoneField.fill(userContext.phone);
      }

      // "Are you travelling for work?" — default No
      try {
        const workNo = page.locator('[data-testid="booking-travel-purpose-no"], label:has-text("No"):near(text("work"))').first();
        if (await workNo.isVisible({ timeout: 1000 })) await workNo.click();
      } catch {}

      // Special requests
      if (userContext.specialRequests) {
        try {
          const reqField = page.locator('[name="special_requests"], textarea[id*="request"]').first();
          if (await reqField.isVisible({ timeout: 1000 })) {
            await reqField.fill(userContext.specialRequests);
          }
        } catch {}
      }

      // Click Next/Continue
      const nextBtn = page.locator(
        'button:has-text("Next: Final details"), button:has-text("Final details"), ' +
        'button:has-text("Continue"), button:has-text("Next step"), ' +
        'button:has-text("Complete booking")'
      ).first();

      if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        log({ step: 'Guest details filled, proceeding...', status: 'running' });
        await nextBtn.click();
        await page.waitForLoadState('load');
        await page.waitForTimeout(2000);
      }
    }

    // ── Step 5: Extract final price + Genius discount ───────────────────

    log({ step: 'Reading final price...', status: 'running' });

    let totalPrice = (rooms[roomIdx]?.price || selectedHotel.price || 'N/A').trim();
    let geniusDiscount = '';

    // Try multiple price selectors for the final total
    try {
      const priceSelectors = [
        '[data-testid="total-price"]',
        '.bui-price-display__value',
        '.pricebreak-price',
        '.bp-price-display__value',
        '.totalPrice',
        '[class*="total"] [class*="price"]',
        '[class*="price-total"]',
      ];
      for (const sel of priceSelectors) {
        const el = page.locator(sel).first();
        if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
          totalPrice = (await el.textContent()).trim();
          break;
        }
      }
    } catch {}

    // Extract Genius discount
    try {
      const discountEl = page.locator('[class*="genius"] [class*="discount"], [data-testid*="genius"], [class*="Genius"] [class*="saving"]').first();
      if (await discountEl.isVisible({ timeout: 1000 }).catch(() => false)) {
        geniusDiscount = (await discountEl.textContent()).trim();
      }
    } catch {}

    // ── Step 6: Payment confirmation (L2 pause) ─────────────────────────

    log({ step: 'Ready for payment', status: 'running' });

    // Extract numeric amount for payment
    const amountMatch = totalPrice.match(/[\\d,]+/);
    const amountInr = amountMatch ? parseInt(amountMatch[0].replace(/,/g, ''), 10) : 0;

    let bookingDetails = 'Hotel: ' + hotelName.trim() +
      '\\nDates: ' + params.checkin + ' to ' + params.checkout +
      '\\nGuests: ' + (params.guests || '2') +
      '\\nTotal: ' + totalPrice;
    if (geniusDiscount) bookingDetails += '\\nGenius savings: ' + geniusDiscount;

    // Emit payment_required for L2 panel (if host supports it)
    // Falls back to confirm_action for direct confirmation
    const confirmResponse = await requestFromHost({
      type: 'payment_required',
      action: 'Complete hotel booking',
      details: bookingDetails,
      bookingSummary: JSON.stringify({
        name: hotelName.trim(),
        dates: params.checkin + ' to ' + params.checkout,
        guests: (params.guests || '2') + ' guests',
        location: params.destination,
        geniusDiscount: geniusDiscount || null,
      }),
      amountInr: amountInr,
      description: 'Hotel booking: ' + hotelName.trim(),
    });

    if (!confirmResponse.confirmed) {
      log({ step: 'Booking cancelled by user', status: 'completed' });
      log({ message: 'Booking was cancelled. You can try again anytime.' });
      log({ done: true, cancelled: true });
      await page.waitForTimeout(10000);
      await page.close();
      rl.close();
      return;
    }

    // ── Step 7: Fill payment details ────────────────────────────────────

    log({ step: 'Payment confirmed! Checking payment method...', status: 'running' });

    // Check for saved card
    const savedCardSection = page.locator(
      '[data-testid="saved-card"], [class*="saved-card"], [class*="StoredCard"], ' +
      'div:has-text("ending in") input[type="radio"], ' +
      'input[name="selected_card"]:checked, [class*="payment-method-saved"]'
    ).first();
    const hasSavedCard = await savedCardSection.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasSavedCard) {
      log({ step: 'Using saved card from Booking.com', status: 'running' });
      const savedCvvField = page.locator(
        '[name="cc_cvc"], [name="cvc"], [name="cvv"], [name="securityCode"], ' +
        '[autocomplete="cc-csc"], input[id*="cvc"], input[id*="cvv"], ' +
        '[data-testid="cvc-input"], [placeholder*="CVC" i], [placeholder*="CVV" i]'
      ).first();
      if (await savedCvvField.isVisible({ timeout: 2000 }).catch(() => false)) {
        const cardCred = (userContext.credentialLabels || []).find((c) => c.type === 'card');
        if (cardCred) {
          const resp = await requestFromHost({ type: 'fill_credential', credentialId: cardCred.id, fieldType: 'cvv' });
          if (resp.value) await savedCvvField.fill(resp.value);
        } else {
          const cvvResp = await requestFromHost({ type: 'input_required', question: 'Enter CVV for your saved card:', inputType: 'otp' });
          if (cvvResp.value) await savedCvvField.fill(cvvResp.value);
        }
      }
    } else {
      log({ step: 'Filling card details...', status: 'running' });
      const cardCred = (userContext.credentialLabels || []).find((c) => c.type === 'card');

      if (!cardCred) {
        await requestFromHost({
          type: 'input_required',
          question: 'No saved card found. Please add a card in Settings or complete payment manually in the browser.',
          inputType: 'freetext',
        });
        await page.waitForTimeout(120000);
        await page.close();
        rl.close();
        return;
      }

      const credId = cardCred.id;
      const fillField = async (selectors, fieldType, isSelect) => {
        const field = page.locator(selectors).first();
        if (await field.isVisible({ timeout: 2000 }).catch(() => false)) {
          const resp = await requestFromHost({ type: 'fill_credential', credentialId: credId, fieldType });
          if (resp.value) {
            if (isSelect) {
              const tag = await field.evaluate(el => el.tagName.toLowerCase());
              if (tag === 'select') await field.selectOption(resp.value);
              else await field.fill(resp.value);
            } else {
              await field.fill(resp.value);
            }
          }
        }
      };

      await fillField('[name="cc1"], [name="cardNumber"], [name="card_number"], [autocomplete="cc-number"], [data-testid="card-number-input"], [placeholder*="card number" i]', 'card_number', false);
      await fillField('[name="cc_month"], [name="expiryMonth"], select[id*="expir"][id*="month"], [data-testid="expiry-month"], [autocomplete="cc-exp-month"]', 'expiry_month', true);
      await fillField('[name="cc_year"], [name="expiryYear"], select[id*="expir"][id*="year"], [data-testid="expiry-year"], [autocomplete="cc-exp-year"]', 'expiry_year', true);

      // Combined expiry (MM/YY)
      const combinedExpiry = page.locator('[name="cc_expiry"], [autocomplete="cc-exp"], [placeholder*="MM" i][placeholder*="YY" i]').first();
      if (await combinedExpiry.isVisible({ timeout: 1000 }).catch(() => false)) {
        const m = await requestFromHost({ type: 'fill_credential', credentialId: credId, fieldType: 'expiry_month' });
        const y = await requestFromHost({ type: 'fill_credential', credentialId: credId, fieldType: 'expiry_year' });
        if (m.value && y.value) await combinedExpiry.fill(m.value + (y.value.length === 4 ? y.value.slice(2) : y.value));
      }

      await fillField('[name="cc_cvc"], [name="cvc"], [name="cvv"], [name="securityCode"], [autocomplete="cc-csc"], input[id*="cvc"], input[id*="cvv"], [data-testid="cvc-input"], [placeholder*="CVC" i], [placeholder*="CVV" i]', 'cvv', false);
      await fillField('[name="cc_name"], [name="cardholderName"], [name="name_on_card"], [autocomplete="cc-name"], input[id*="cardholder"], [data-testid="cardholder-name"], [placeholder*="name on card" i]', 'name_on_card', false);
    }

    log({ step: 'Payment details filled — submitting booking...', status: 'running' });

    // ── Step 8: Submit booking ──────────────────────────────────────────

    const submitBtn = page.locator(
      'button:has-text("Complete booking"), button:has-text("Book now"), ' +
      'button:has-text("Pay now"), button:has-text("Confirm booking"), ' +
      'button:has-text("Complete reservation"), [data-testid="submit-booking"]'
    ).first();

    if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitBtn.click();
      log({ step: 'Booking submitted — waiting for confirmation...', status: 'running' });
    }

    await page.waitForTimeout(5000);

    // ── Step 9: Handle OTP/3DS if needed ────────────────────────────────

    const otpField = page.locator(
      'input[name="otp"], input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], ' +
      '[placeholder*="OTP" i], [placeholder*="verification" i], [placeholder*="code" i], ' +
      'input[id*="otp"], iframe[src*="3ds"], iframe[name*="challenge"]'
    ).first();

    if (await otpField.isVisible({ timeout: 5000 }).catch(() => false)) {
      log({ step: 'Bank verification required', status: 'running' });
      const otpResp = await requestFromHost({
        type: 'input_required',
        question: 'Your bank sent a verification code (OTP). Please enter it:',
        inputType: 'otp',
      });
      if (otpResp.value) {
        await otpField.fill(otpResp.value);
        const otpSubmit = page.locator('button:has-text("Submit"), button:has-text("Verify"), button:has-text("Confirm"), button[type="submit"]').first();
        if (await otpSubmit.isVisible({ timeout: 2000 }).catch(() => false)) await otpSubmit.click();
        await page.waitForTimeout(5000);
      }
    }

    // ── Step 10: Extract confirmation ────────────────────────────────────

    const confirmUrl = page.url();
    const pageTitle = await page.title();

    let confNum = '';
    try {
      const confSelectors = [
        '[data-testid="confirmation-number"]',
        '[class*="confirmation"]',
        '[class*="booking-number"]',
        '[class*="reference"]',
      ];
      for (const sel of confSelectors) {
        const el = page.locator(sel).first();
        if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
          const text = (await el.textContent()).trim();
          const numMatch = text.match(/[A-Z0-9]{6,}/i);
          confNum = numMatch ? numMatch[0] : text;
          break;
        }
      }
    } catch {}

    const isConfirmed = confirmUrl.includes('confirmation') || confirmUrl.includes('success') ||
      confirmUrl.includes('thank') || pageTitle.toLowerCase().includes('confirmed') ||
      pageTitle.toLowerCase().includes('booked');

    // Build structured result
    const result = {
      hotelName: hotelName.trim(),
      price: totalPrice,
      geniusDiscount: geniusDiscount || null,
      dates: params.checkin + ' to ' + params.checkout,
      guests: params.guests || '2',
      destination: params.destination,
      confirmationNumber: confNum || null,
      confirmed: isConfirmed,
    };

    if (isConfirmed) {
      log({ step: 'Booking confirmed!', status: 'completed' });
      log({
        message: 'Hotel booking confirmed!\\n' +
          'Hotel: ' + result.hotelName + '\\n' +
          'Total: ' + result.price +
          (result.geniusDiscount ? ' (Genius saved: ' + result.geniusDiscount + ')' : '') + '\\n' +
          'Dates: ' + result.dates +
          (result.confirmationNumber ? '\\nRef: ' + result.confirmationNumber : '') +
          '\\nCheck your email for the full confirmation.'
      });
      log({ done: true, ...result });
    } else {
      log({ step: 'Booking submitted — check email for confirmation', status: 'completed' });
      log({
        message: 'Booking submitted for ' + result.hotelName + '!\\n' +
          'Total: ' + result.price + '\\n' +
          'Dates: ' + result.dates + '\\n' +
          'Check your email for the confirmation details.'
      });
      log({ done: true, ...result, pending: true });
    }

    await page.waitForTimeout(15000);

  } catch (err) {
    log({ step: 'Error: ' + err.message, status: 'failed' });
    log({ error: err.message });

    // Screenshot on failure
    try {
      const screenshotDir = path.join(os.homedir(), '.shofferai', 'screenshots');
      fs.mkdirSync(screenshotDir, { recursive: true });
      await page.screenshot({
        path: path.join(screenshotDir, 'booking-error-' + Date.now() + '.png'),
        fullPage: true,
      });
    } catch {}
  } finally {
    rl.close();
    await page.close();
  }
})();
`;

export const SKILL_ID = 'booking-com-hotel';
export const REQUIRED_PARAMS = ['destination', 'checkin', 'checkout', 'guests'];
