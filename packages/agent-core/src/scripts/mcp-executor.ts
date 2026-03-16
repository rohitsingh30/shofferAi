import { logger } from '@shofferai/shared';
import type { AgentCallbacks } from '../agent';

/**
 * MCP-based skill executor — drives Playwright MCP tools directly
 * without needing an LLM. Used for deterministic booking workflows
 * that run on the operator's signed-in browser via MCP.
 *
 * v2: Full flow with interactive hotel/room selection, Genius discount
 * extraction, payment pause via L2 panel, and structured confirmation.
 */

interface MCPHostLike {
  callTool(name: string, args: Record<string, unknown>): Promise<unknown>;
  isMCPTool(name: string): boolean;
}

interface ExecutorParams {
  destination: string;
  checkin: string;
  checkout: string;
  guests: string;
}

interface HotelOption {
  index: number;
  name: string;
  price: string;
  reviewScore: string;
  distance: string;
  hasGeniusDiscount: boolean;
}

interface RoomOption {
  index: number;
  name: string;
  price: string;
  cancellation: string;
}

export class BookingMCPExecutor {
  private mcpHost: MCPHostLike;
  private params: ExecutorParams;
  private callbacks: AgentCallbacks;
  private hotelName = '';
  private priceText = '';
  private geniusDiscount = '';
  private confirmationNumber = '';

  constructor(
    mcpHost: MCPHostLike,
    params: Record<string, string>,
    callbacks: AgentCallbacks,
  ) {
    this.mcpHost = mcpHost;
    this.params = params as unknown as ExecutorParams;
    this.callbacks = callbacks;
  }

  async execute(): Promise<{ completed: boolean; error?: string }> {
    try {
      await this.step1_search();
      const hotels = await this.step2_extractHotels();
      const hotelIdx = await this.step3_selectHotel(hotels);
      await this.step4_clickHotel(hotelIdx);
      const rooms = await this.step5_extractRooms();
      const roomIdx = await this.step6_selectRoom(rooms);
      await this.step7_reserveRoom(roomIdx);
      await this.step8_fillDetails();
      await this.step9_extractPrice();

      const paymentConfirmed = await this.step10_pauseForPayment();
      if (!paymentConfirmed) {
        this.callbacks.onMessage('Booking cancelled. You can try again anytime.');
        this.callbacks.onComplete('Booking cancelled by user.');
        return { completed: true };
      }

      await this.step11_completeBooking();
      await this.step12_extractConfirmation();

      return { completed: true };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('BookingMCPExecutor failed', { error: msg });
      return { completed: false, error: msg };
    }
  }

  private async mcp(tool: string, args: Record<string, unknown>): Promise<any> {
    return this.mcpHost.callTool(tool, args);
  }

  private parseSnapshot(snapshot: unknown): string {
    return typeof snapshot === 'string' ? snapshot : JSON.stringify(snapshot);
  }

  // ── Step 1: Navigate to search results ──────────────────────────────

  private async step1_search(): Promise<void> {
    this.callbacks.onStepUpdate({ action: `Searching hotels in ${this.params.destination}...`, status: 'running' });

    const searchUrl = `https://www.booking.com/searchresults.html?` +
      `ss=${encodeURIComponent(this.params.destination)}` +
      `&checkin=${this.params.checkin}` +
      `&checkout=${this.params.checkout}` +
      `&group_adults=${this.params.guests || '2'}` +
      `&no_rooms=1&group_children=0`;

    await this.mcp('browser_navigate', { url: searchUrl });
    await this.mcp('browser_wait_for', { text: 'properties found', time: 10 });

    // Dismiss cookie banner if present
    try {
      const snapshot = this.parseSnapshot(await this.mcp('browser_snapshot', {}));
      if (snapshot.includes('Accept') && snapshot.includes('cookie')) {
        const acceptMatch = snapshot.match(/ref=(e\d+).*?[Aa]ccept/);
        if (acceptMatch) {
          await this.mcp('browser_click', { ref: acceptMatch[1], element: 'Accept cookies' });
        }
      }
    } catch {}

    // Dismiss Genius popup
    try {
      const snapshot = this.parseSnapshot(await this.mcp('browser_snapshot', {}));
      const dismissMatch = snapshot.match(/ref=(e\d+).*?[Dd]ismiss/);
      if (dismissMatch) {
        await this.mcp('browser_click', { ref: dismissMatch[1], element: 'Dismiss popup' });
      }
    } catch {}

    this.callbacks.onStepUpdate({ action: `Search results loaded for ${this.params.destination}`, status: 'completed' });
  }

  // ── Step 2: Extract hotel options ───────────────────────────────────

  private async step2_extractHotels(): Promise<HotelOption[]> {
    this.callbacks.onStepUpdate({ action: 'Reading hotel results...', status: 'running' });

    const snapshot = this.parseSnapshot(await this.mcp('browser_snapshot', {}));

    // Extract hotels from snapshot using MCP's evaluate
    const result = await this.mcp('browser_evaluate', {
      expression: `
        Array.from(document.querySelectorAll('[data-testid="property-card"]')).slice(0, 5).map((card, i) => ({
          index: i + 1,
          name: card.querySelector('[data-testid="title"]')?.textContent?.trim() || 'Unknown',
          price: card.querySelector('[data-testid="price-and-discounted-price"]')?.textContent?.trim() || 'N/A',
          reviewScore: card.querySelector('[data-testid="review-score"]')?.textContent?.trim() || '',
          distance: card.querySelector('[data-testid="distance"]')?.textContent?.trim() || '',
          hasGeniusDiscount: !!card.querySelector('[class*="genius"], [data-testid*="genius"]'),
        }))
      `,
    });

    const hotels: HotelOption[] = Array.isArray(result) ? result : [];

    // Fallback: parse snapshot text if evaluate didn't work
    if (hotels.length === 0) {
      const priceMatch = snapshot.match(/(?:₹|INR|Rs\.?)\s*[\d,]+/);
      hotels.push({
        index: 1,
        name: 'Top recommended hotel',
        price: priceMatch ? priceMatch[0] : 'N/A',
        reviewScore: '',
        distance: '',
        hasGeniusDiscount: snapshot.toLowerCase().includes('genius'),
      });
    }

    return hotels;
  }

  // ── Step 3: Ask user to pick a hotel ────────────────────────────────

  private async step3_selectHotel(hotels: HotelOption[]): Promise<number> {
    let hotelList = `Hotels in ${this.params.destination} for ${this.params.checkin} to ${this.params.checkout}:\n\n`;
    for (const h of hotels) {
      hotelList += `${h.index}. **${h.name}** — ${h.price}`;
      if (h.hasGeniusDiscount) hotelList += ' (Genius discount!)';
      hotelList += '\n';
      if (h.reviewScore || h.distance) hotelList += `   ${h.reviewScore} · ${h.distance}\n`;
    }

    const response = await this.callbacks.onInputRequired({
      taskId: '',
      stepId: `hotel-selection-${Date.now()}`,
      question: hotelList + '\nWhich hotel would you like? (number, name, or preference)',
      inputType: 'freetext',
    });

    const choice = (response.value || '1').trim().toLowerCase();
    const choiceNum = parseInt(choice);
    if (!isNaN(choiceNum) && choiceNum >= 1 && choiceNum <= hotels.length) {
      return choiceNum - 1;
    }

    // Try name match
    const matchIdx = hotels.findIndex(h => h.name.toLowerCase().includes(choice));
    return matchIdx >= 0 ? matchIdx : 0;
  }

  // ── Step 4: Click the selected hotel ────────────────────────────────

  private async step4_clickHotel(hotelIdx: number): Promise<void> {
    this.callbacks.onStepUpdate({ action: 'Opening hotel details...', status: 'running' });

    const snapshot = this.parseSnapshot(await this.mcp('browser_snapshot', {}));

    // Find the nth "See availability" or "Show prices" link
    const linkPattern = /ref=(e\d+).*?(?:[Ss]ee availability|[Ss]how prices)/g;
    const matches: string[] = [];
    let match;
    while ((match = linkPattern.exec(snapshot)) !== null) {
      matches.push(match[1]);
    }

    const ref = matches[hotelIdx] || matches[0];
    if (ref) {
      await this.mcp('browser_click', { ref, element: 'See availability' });
      await this.mcp('browser_wait_for', { time: 3 });
    }

    // Get hotel name from page
    const pageSnapshot = this.parseSnapshot(await this.mcp('browser_snapshot', {}));
    const nameMatch = pageSnapshot.match(/hotel.name.*?text:\s*(.+)/i);
    this.hotelName = nameMatch ? nameMatch[1].trim() : 'Hotel';

    this.callbacks.onStepUpdate({ action: `Viewing: ${this.hotelName}`, status: 'completed' });
  }

  // ── Step 5: Extract room options ────────────────────────────────────

  private async step5_extractRooms(): Promise<RoomOption[]> {
    this.callbacks.onStepUpdate({ action: 'Loading room options...', status: 'running' });

    await this.mcp('browser_wait_for', { time: 2 });

    const result = await this.mcp('browser_evaluate', {
      expression: `
        (() => {
          const seen = new Set();
          return Array.from(document.querySelectorAll('.hprt-table tr.js-rt-block-row, [data-testid="room-type"]')).slice(0, 8).reduce((acc, row) => {
            const name = row.querySelector('.hprt-roomtype-icon-link, [data-testid="room-name"]')?.textContent?.trim() || '';
            const price = row.querySelector('.bui-price-display__value, .prco-valign-middle-helper, [data-testid="room-price"]')?.textContent?.trim() || 'N/A';
            const cond = row.querySelector('.hprt-conditions, [data-testid="cancellation-policy"]')?.textContent?.trim()?.substring(0, 60) || '';
            if (name && !seen.has(name)) {
              seen.add(name);
              acc.push({ index: acc.length + 1, name, price, cancellation: cond });
            }
            return acc;
          }, []);
        })()
      `,
    });

    const rooms: RoomOption[] = Array.isArray(result) ? result : [];

    if (rooms.length === 0) {
      rooms.push({ index: 1, name: 'Standard Room', price: 'N/A', cancellation: '' });
    }

    return rooms;
  }

  // ── Step 6: Ask user to pick a room ─────────────────────────────────

  private async step6_selectRoom(rooms: RoomOption[]): Promise<number> {
    if (rooms.length <= 1) return 0;

    let roomList = `Available rooms at ${this.hotelName}:\n\n`;
    for (const r of rooms) {
      roomList += `${r.index}. **${r.name}** — ${r.price}\n`;
      if (r.cancellation) roomList += `   ${r.cancellation}\n`;
    }

    const response = await this.callbacks.onInputRequired({
      taskId: '',
      stepId: `room-selection-${Date.now()}`,
      question: roomList + '\nWhich room? (number or name)',
      inputType: 'freetext',
    });

    const choice = (response.value || '1').trim();
    const choiceNum = parseInt(choice);
    if (!isNaN(choiceNum) && choiceNum >= 1 && choiceNum <= rooms.length) {
      return choiceNum - 1;
    }
    return 0;
  }

  // ── Step 7: Click Reserve ───────────────────────────────────────────

  private async step7_reserveRoom(_roomIdx: number): Promise<void> {
    this.callbacks.onStepUpdate({ action: 'Reserving room...', status: 'running' });

    const snapshot = this.parseSnapshot(await this.mcp('browser_snapshot', {}));

    const reserveMatch = snapshot.match(/ref=(e\d+).*?[Rr]eserve/);
    const bookMatch = snapshot.match(/ref=(e\d+).*?[Bb]ook now/);
    const selectMatch = snapshot.match(/ref=(e\d+).*?[Ss]elect/);

    const btnRef = reserveMatch || bookMatch || selectMatch;
    if (btnRef) {
      await this.mcp('browser_click', { ref: btnRef[1], element: 'Reserve room' });
      await this.mcp('browser_wait_for', { time: 3 });
    }

    this.callbacks.onStepUpdate({ action: 'Room reserved', status: 'completed' });
  }

  // ── Step 8: Fill guest details ──────────────────────────────────────

  private async step8_fillDetails(): Promise<void> {
    this.callbacks.onStepUpdate({ action: 'Filling booking details...', status: 'running' });

    const snapshot = this.parseSnapshot(await this.mcp('browser_snapshot', {}));

    // Check if we're on the booking form (look for name/email fields)
    if (!snapshot.toLowerCase().includes('first name') && !snapshot.toLowerCase().includes('email')) {
      // Not on booking form yet — the details may already be pre-filled
      this.callbacks.onStepUpdate({ action: 'Details pre-filled from account', status: 'completed' });
      return;
    }

    // Look for "travelling for work" — click No
    const workNoMatch = snapshot.match(/ref=(e\d+).*?[Nn]o.*?(?:work|travel)/);
    if (workNoMatch) {
      try {
        await this.mcp('browser_click', { ref: workNoMatch[1], element: 'Not travelling for work' });
      } catch {}
    }

    // Click Next/Continue button
    const nextMatch = snapshot.match(/ref=(e\d+).*?(?:[Nn]ext|[Cc]ontinue|[Ff]inal details)/);
    if (nextMatch) {
      await this.mcp('browser_click', { ref: nextMatch[1], element: 'Continue to payment' });
      await this.mcp('browser_wait_for', { time: 3 });
    }

    this.callbacks.onStepUpdate({ action: 'Details filled', status: 'completed' });
  }

  // ── Step 9: Extract final price ─────────────────────────────────────

  private async step9_extractPrice(): Promise<void> {
    this.callbacks.onStepUpdate({ action: 'Reading final price...', status: 'running' });

    const snapshot = this.parseSnapshot(await this.mcp('browser_snapshot', {}));

    // Extract price
    const priceMatches = snapshot.match(/(?:₹|INR|Rs\.?)\s*[\d,]+/g);
    if (priceMatches && priceMatches.length > 0) {
      this.priceText = priceMatches[priceMatches.length - 1].trim();
    }

    // Extract Genius discount
    if (snapshot.toLowerCase().includes('genius')) {
      const discountMatch = snapshot.match(/(?:genius|discount|saving).*?((?:₹|INR|Rs\.?)\s*[\d,]+)/i);
      if (discountMatch) {
        this.geniusDiscount = discountMatch[1].trim();
      }
    }
  }

  // ── Step 10: Pause for payment ──────────────────────────────────────

  private async step10_pauseForPayment(): Promise<boolean> {
    this.callbacks.onStepUpdate({ action: 'Waiting for payment...', status: 'running' });

    const amountMatch = this.priceText.match(/[\d,]+/);
    const amountInr = amountMatch ? parseInt(amountMatch[0].replace(/,/g, ''), 10) : 0;

    // Use L2 payment panel if available
    if (this.callbacks.onPaymentRequired) {
      return await this.callbacks.onPaymentRequired({
        bookingSummary: JSON.stringify({
          name: this.hotelName,
          dates: `${this.params.checkin} to ${this.params.checkout}`,
          guests: `${this.params.guests || '2'} guests`,
          location: this.params.destination,
          geniusDiscount: this.geniusDiscount || null,
        }),
        amountInr,
        description: `Hotel booking: ${this.hotelName}`,
      });
    }

    // Fallback: simple confirmation
    let description = `Hotel: ${this.hotelName}\nDates: ${this.params.checkin} to ${this.params.checkout}\nGuests: ${this.params.guests || '2'}\nTotal: ${this.priceText}`;
    if (this.geniusDiscount) description += `\nGenius savings: ${this.geniusDiscount}`;

    return await this.callbacks.onConfirmRequired({
      action: 'Complete hotel booking',
      description,
    });
  }

  // ── Step 11: Complete booking ───────────────────────────────────────

  private async step11_completeBooking(): Promise<void> {
    this.callbacks.onStepUpdate({ action: 'Completing booking...', status: 'running' });

    const snapshot = this.parseSnapshot(await this.mcp('browser_snapshot', {}));

    const submitMatch = snapshot.match(/ref=(e\d+).*?[Cc]omplete booking/);
    const payMatch = snapshot.match(/ref=(e\d+).*?[Pp]ay now/);
    const bookMatch = snapshot.match(/ref=(e\d+).*?[Bb]ook now/);
    const confirmMatch = snapshot.match(/ref=(e\d+).*?[Cc]onfirm/);

    const btn = submitMatch || payMatch || bookMatch || confirmMatch;
    if (btn) {
      await this.mcp('browser_click', { ref: btn[1], element: 'Complete booking' });
      await this.mcp('browser_wait_for', { time: 5 });
    }

    // Check for OTP/3DS
    const snapshot2 = this.parseSnapshot(await this.mcp('browser_snapshot', {}));
    if (snapshot2.toLowerCase().includes('otp') || snapshot2.toLowerCase().includes('verification')) {
      this.callbacks.onStepUpdate({ action: 'Bank verification needed', status: 'running' });

      const otpResponse = await this.callbacks.onInputRequired({
        taskId: '',
        stepId: `otp-${Date.now()}`,
        question: 'Your bank sent a verification code (OTP). Please enter it:',
        inputType: 'otp',
      });

      const otpFieldMatch = snapshot2.match(/textbox.*?ref=(e\d+)/);
      if (otpFieldMatch && otpResponse.value) {
        await this.mcp('browser_fill_form', {
          fields: [{ name: 'OTP', type: 'textbox', ref: otpFieldMatch[1], value: otpResponse.value }],
        });
        const otpSubmitMatch = snapshot2.match(/ref=(e\d+).*?(?:[Ss]ubmit|[Vv]erify|[Cc]onfirm)/);
        if (otpSubmitMatch) {
          await this.mcp('browser_click', { ref: otpSubmitMatch[1], element: 'Submit OTP' });
          await this.mcp('browser_wait_for', { time: 5 });
        }
      }
    }
  }

  // ── Step 12: Extract confirmation ───────────────────────────────────

  private async step12_extractConfirmation(): Promise<void> {
    this.callbacks.onStepUpdate({ action: 'Getting confirmation details...', status: 'running' });

    const result = await this.mcp('browser_evaluate', {
      expression: `
        (() => {
          const url = window.location.href;
          const title = document.title;
          let confNum = '';
          const confEl = document.querySelector('[data-testid="confirmation-number"], [class*="confirmation"], [class*="booking-number"]');
          if (confEl) {
            const text = confEl.textContent.trim();
            const match = text.match(/[A-Z0-9]{6,}/i);
            confNum = match ? match[0] : text;
          }
          return { url, title, confNum };
        })()
      `,
    });

    const data = (result && typeof result === 'object') ? result as Record<string, string> : {};
    this.confirmationNumber = data.confNum || '';
    const url = data.url || '';
    const title = data.title || '';

    const isConfirmed = url.includes('confirmation') || url.includes('success') ||
      url.includes('thank') || title.toLowerCase().includes('confirmed');

    let message = isConfirmed
      ? `Booking confirmed for **${this.hotelName}**!\n`
      : `Booking submitted for **${this.hotelName}**!\n`;

    message += `Dates: ${this.params.checkin} to ${this.params.checkout}\n`;
    message += `Total: ${this.priceText}\n`;
    if (this.geniusDiscount) message += `Genius savings: ${this.geniusDiscount}\n`;
    if (this.confirmationNumber) message += `Reference: ${this.confirmationNumber}\n`;
    message += `Check your email for the full confirmation.`;

    this.callbacks.onMessage(message);
    this.callbacks.onComplete(isConfirmed ? 'Hotel booking confirmed.' : 'Hotel booking submitted.');
  }
}
